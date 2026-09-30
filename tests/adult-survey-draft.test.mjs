import test from 'node:test';
import assert from 'node:assert/strict';
import {createDraftStore, DRAFT_STORAGE_KEY, DRAFT_TTL_MS} from '../adult-survey/draft-store.mjs';

const schemaVersion = 'adult_open_answers_v3';
const initialTime = Date.UTC(2026, 8, 30);
const answers = () => ({consent: 'adult_agree', responses: {difficulties: 'A'}});

function fakeStorage(initial = []) {
  const map = new Map(initial);
  const calls = [];
  return {
    map,
    calls,
    getItem(key) { calls.push(['get', key]); return map.get(key) ?? null; },
    setItem(key, value) { calls.push(['set', key]); map.set(key, value); },
    removeItem(key) { calls.push(['remove', key]); map.delete(key); },
  };
}

const storeAt = (storage, now = initialTime, version = schemaVersion) => createDraftStore({
  storage,
  schemaVersion: version,
  now: () => now,
});

test('a new store instance restores the same consented unfinished draft', () => {
  const storage = fakeStorage();
  const state = answers();
  assert.deepEqual(storeAt(storage).save({answers: state, pageId: 'experience'}), {
    status: 'saved', updatedAt: initialTime, expiresAt: initialTime + DRAFT_TTL_MS,
  });
  const payload = JSON.parse(storage.map.get(DRAFT_STORAGE_KEY));
  assert.deepEqual(payload, {
    version: 1, schemaVersion, answers: state, pageId: 'experience',
    updatedAt: initialTime, expiresAt: initialTime + DRAFT_TTL_MS,
  });
  assert.deepEqual(storeAt(storage, initialTime + 1000).load(), {
    status: 'available',
    draft: {answers: state, pageId: 'experience', updatedAt: initialTime, expiresAt: initialTime + DRAFT_TTL_MS},
  });
});

test('raw incomplete and over-limit text survives saving without mutation or truncation', () => {
  const storage = fakeStorage();
  const state = {
    consent: 'adult_agree',
    role: '',
    nt_duration: {years: '', months: '0'},
    dependants: {total: 2},
    suburb_other: '   locality\r\n',
    responses: {difficulties: ' x ', help_needed: '<script>raw</script>\r\n' + 'a'.repeat(6000)},
  };
  const before = structuredClone(state);
  assert.equal(storeAt(storage).save({answers: state, pageId: 'about'}).status, 'saved');
  assert.deepEqual(state, before);
  state.responses.difficulties = 'later edit';
  assert.deepEqual(storeAt(storage).load().draft.answers, before);
});

test('all three unfinished pages may be restored after adult consent', () => {
  for (const pageId of ['welcome', 'about', 'experience']) {
    const storage = fakeStorage();
    assert.equal(storeAt(storage).save({answers: answers(), pageId}).status, 'saved');
    assert.equal(storeAt(storage).load().draft.pageId, pageId);
  }
});

test('unconsented, refused and completed states are not saved and remove an older draft', () => {
  for (const [state, pageId] of [
    [{}, 'welcome'],
    [{consent: 'adult_decline'}, 'welcome'],
    [{consent: 'under_18'}, 'about'],
    [answers(), 'thanks'],
    [answers(), 'declined'],
    [answers(), 'unknown'],
  ]) {
    const storage = fakeStorage([['unrelated', 'keep']]);
    const store = storeAt(storage);
    store.save({answers: answers(), pageId: 'about'});
    assert.deepEqual(store.save({answers: state, pageId}), {status: 'unavailable', reason: 'not-resumable'});
    assert.equal(store.load().status, 'empty');
    assert.equal(storage.map.get('unrelated'), 'keep');
  }
});

test('a draft expires exactly 30 days after its latest successful save', () => {
  assert.equal(DRAFT_TTL_MS, 30 * 24 * 60 * 60 * 1000);
  const storage = fakeStorage();
  storeAt(storage).save({answers: answers(), pageId: 'about'});
  assert.equal(storeAt(storage, initialTime + DRAFT_TTL_MS - 1).load().status, 'available');
  assert.equal(storeAt(storage, initialTime + DRAFT_TTL_MS).load().status, 'expired');
  assert.equal(storage.map.has(DRAFT_STORAGE_KEY), false);
  assert.equal(storeAt(storage).load().status, 'empty');
  storeAt(storage).save({answers: answers(), pageId: 'about'});
  const laterTime = initialTime + 7 * 24 * 60 * 60 * 1000;
  storeAt(storage, laterTime).save({answers: answers(), pageId: 'experience'});
  const restored = storeAt(storage, initialTime + DRAFT_TTL_MS).load();
  assert.equal(restored.status, 'available');
  assert.equal(restored.draft.expiresAt, laterTime + DRAFT_TTL_MS);
});

test('answer schema changes reject the old draft and clear only the survey key', () => {
  const storage = fakeStorage([['another-form', 'keep']]);
  storeAt(storage).save({answers: answers(), pageId: 'about'});
  assert.deepEqual(storeAt(storage, initialTime, 'adult_open_answers_v4').load(), {status: 'incompatible'});
  assert.equal(storage.map.has(DRAFT_STORAGE_KEY), false);
  assert.equal(storage.map.get('another-form'), 'keep');
});

test('unknown draft-format versions cannot silently resume', () => {
  const storage = fakeStorage();
  storeAt(storage).save({answers: answers(), pageId: 'about'});
  const payload = JSON.parse(storage.map.get(DRAFT_STORAGE_KEY));
  storage.map.set(DRAFT_STORAGE_KEY, JSON.stringify({...payload, version: 2}));
  assert.deepEqual(storeAt(storage).load(), {status: 'incompatible'});
  assert.equal(storage.map.has(DRAFT_STORAGE_KEY), false);
});

test('corrupt JSON and structurally invalid drafts are discarded without throwing', () => {
  const valid = {
    version: 1, schemaVersion, answers: answers(), pageId: 'about',
    updatedAt: initialTime, expiresAt: initialTime + DRAFT_TTL_MS,
  };
  const corrupt = [
    '{broken', 'null', '[]', '{}',
    JSON.stringify({...valid, answers: []}),
    JSON.stringify({...valid, answers: {consent: 'adult_decline'}}),
    JSON.stringify({...valid, pageId: 'thanks'}),
    JSON.stringify({...valid, pageId: 'declined'}),
    JSON.stringify({...valid, updatedAt: 'today'}),
    JSON.stringify({...valid, expiresAt: -1}),
    JSON.stringify({...valid, expiresAt: valid.expiresAt + 1}),
    JSON.stringify({...valid, schemaVersion: null}),
  ];
  for (const raw of corrupt) {
    const storage = fakeStorage([[DRAFT_STORAGE_KEY, raw], ['unrelated', 'keep']]);
    assert.deepEqual(storeAt(storage).load(), {status: 'invalid'});
    assert.equal(storage.map.has(DRAFT_STORAGE_KEY), false);
    assert.equal(storage.map.get('unrelated'), 'keep');
  }
});

test('blocked storage, quota errors and failed removal report unavailable without throwing', () => {
  const denied = {
    getItem() { throw new Error('SecurityError'); },
    setItem() { throw new Error('QuotaExceededError'); },
    removeItem() { throw new Error('SecurityError'); },
  };
  const store = storeAt(denied);
  const state = answers();
  const before = structuredClone(state);
  assert.deepEqual(store.load(), {status: 'unavailable'});
  assert.deepEqual(store.save({answers: state, pageId: 'about'}), {status: 'unavailable'});
  assert.deepEqual(store.clear(), {status: 'unavailable'});
  assert.deepEqual(state, before);
  assert.deepEqual(createDraftStore({schemaVersion}).load(), {status: 'unavailable'});
});

test('a failed new save preserves the previous draft and never reports saved', () => {
  const storage = fakeStorage();
  const store = storeAt(storage);
  const previous = answers();
  store.save({answers: previous, pageId: 'about'});
  storage.setItem = () => { throw new Error('QuotaExceededError'); };
  assert.equal(store.save({answers: {...previous, role: 'partner'}, pageId: 'experience'}).status, 'unavailable');
  assert.deepEqual(store.load().draft.answers, previous);
});

test('a rejected draft remains rejected even if storage removal is disabled', () => {
  const storage = fakeStorage([[DRAFT_STORAGE_KEY, '{broken']]);
  storage.removeItem = () => { throw new Error('SecurityError'); };
  assert.deepEqual(storeAt(storage).load(), {status: 'invalid'});
});

test('clear touches exactly the namespaced survey key and no unrelated data', () => {
  const storage = fakeStorage([['unrelated', 'keep'], ['lc.defence-family-survey.other', 'keep too']]);
  const store = storeAt(storage);
  store.save({answers: answers(), pageId: 'about'});
  assert.deepEqual(store.clear(), {status: 'cleared'});
  assert.deepEqual([...storage.map], [['unrelated', 'keep'], ['lc.defence-family-survey.other', 'keep too']]);
  assert.ok(storage.calls.every(([, key]) => key === DRAFT_STORAGE_KEY));
  assert.deepEqual(store.clear(), {status: 'cleared'});
});

test('serialization and invalid clocks do not destroy the current in-memory answers', () => {
  const storage = fakeStorage();
  const cyclic = answers();
  cyclic.self = cyclic;
  assert.equal(storeAt(storage).save({answers: cyclic, pageId: 'about'}).status, 'unavailable');
  assert.equal(cyclic.self, cyclic);
  for (const value of [NaN, Infinity, -1, 'today']) {
    const store = createDraftStore({storage, schemaVersion, now: () => value});
    assert.equal(store.save({answers: answers(), pageId: 'about'}).status, 'unavailable');
  }
  assert.equal(storage.map.size, 0);
  storeAt(storage).save({answers: answers(), pageId: 'about'});
  assert.deepEqual(createDraftStore({storage, schemaVersion, now: () => { throw new Error('clock'); }}).load(), {status: 'unavailable'});
  assert.equal(storage.map.has(DRAFT_STORAGE_KEY), true);
});
