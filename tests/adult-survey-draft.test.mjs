import test from 'node:test';
import assert from 'node:assert/strict';
import {createDraftStore, DRAFT_STORAGE_KEY, DRAFT_TTL_MS} from '../adult-survey/draft-store.mjs';

const schemaVersion = 'adult_open_answers_v3';
const experienceSchemaVersion = 'adult_open_experiences_v4';
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

test('unknown answer schemas preserve the old draft for an explicit backup or clear choice', () => {
  const storage = fakeStorage([['another-form', 'keep']]);
  storeAt(storage).save({answers: answers(), pageId: 'about'});
  const raw = storage.map.get(DRAFT_STORAGE_KEY);
  assert.deepEqual(storeAt(storage, initialTime, 'unknown_schema').load(), {status: 'incompatible', raw});
  assert.equal(storage.map.get(DRAFT_STORAGE_KEY), raw);
  assert.equal(storage.map.get('another-form'), 'keep');
});

test('unknown draft-format versions cannot silently resume', () => {
  const storage = fakeStorage();
  storeAt(storage).save({answers: answers(), pageId: 'about'});
  const payload = JSON.parse(storage.map.get(DRAFT_STORAGE_KEY));
  storage.map.set(DRAFT_STORAGE_KEY, JSON.stringify({...payload, version: 2}));
  const raw = storage.map.get(DRAFT_STORAGE_KEY);
  assert.deepEqual(storeAt(storage).load(), {status: 'incompatible', raw});
  assert.equal(storage.map.get(DRAFT_STORAGE_KEY), raw);
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


const experienceAnswers = () => ({
  consent: 'adult_agree',
  role: 'partner',
  experiences: [
    {id: 'experience-one', responses: {situation: 'First', actions: '', access: '', outcome: '', support: ''}},
    {id: 'experience-two', responses: {situation: 'Second', actions: '', access: '', outcome: '', support: ''}},
    {id: 'experience-three', responses: {situation: 'Third', actions: '', access: '', outcome: '', support: ''}},
  ],
});
const experienceStoreAt = (storage, now = initialTime) => storeAt(storage, now, experienceSchemaVersion);

test('v3 migration keeps every original character, background answer and original expiry without writing', () => {
  const storage = fakeStorage([['another-form', 'keep']]);
  const legacy = {
    ...answers(), role: 'partner', current_location: 'Elsewhere',
    nt_duration: {years: '2', months: '0'}, dependants: {total: '', prefer_not: true},
    responses: {
      difficulties: '  Situation\r\n生活 🧑🏽‍💻  ',
      help_needed: 'Need with no new matching question',
      help_sources: 'Offered help and actions',
      support_access: 'Response and availability',
      support_fit: 'Help fit and outcome',
      missing_help: 'Missing support',
      anything_else: '<script>raw</script>\r\n' + 'a'.repeat(6500),
      unexpected_question: 'Also preserve this answer',
    },
  };
  const before = structuredClone(legacy);
  storeAt(storage).save({answers: legacy, pageId: 'experience'});
  const raw = storage.map.get(DRAFT_STORAGE_KEY);
  storage.calls.length = 0;
  const result = experienceStoreAt(storage, initialTime + 1000).load();
  assert.equal(result.status, 'available');
  assert.equal(result.migratedFrom, schemaVersion);
  assert.equal(result.draft.migratedFrom, schemaVersion);
  assert.equal(result.draft.experienceId, 'migrated-experience-1');
  assert.deepEqual(result.draft.answers, {
    consent: legacy.consent, role: legacy.role, current_location: legacy.current_location,
    nt_duration: legacy.nt_duration, dependants: legacy.dependants,
    experiences: [{id: 'migrated-experience-1', responses: {
      situation: legacy.responses.difficulties, actions: legacy.responses.help_sources,
      access: legacy.responses.support_access, outcome: legacy.responses.support_fit,
      support: legacy.responses.missing_help, additional: legacy.responses.anything_else,
    }}],
    final_comment_moved_to: 'migrated-experience-1',
    previous_responses: legacy.responses,
  });
  assert.equal(Object.hasOwn(result.draft.answers, 'responses'), false);
  assert.equal(result.draft.updatedAt, initialTime);
  assert.equal(result.draft.expiresAt, initialTime + DRAFT_TTL_MS);
  assert.equal(storage.map.get(DRAFT_STORAGE_KEY), raw);
  assert.deepEqual(storage.calls, [['get', DRAFT_STORAGE_KEY]]);
  assert.deepEqual(legacy, before);
  result.draft.answers.previous_responses.help_needed = 'in-memory edit';
  assert.equal(experienceStoreAt(storage).load().draft.answers.previous_responses.help_needed, before.responses.help_needed);
  assert.equal(storage.map.get('another-form'), 'keep');
});

test('v3 migration of an unfinished blank draft supplies stable empty fields', () => {
  const storage = fakeStorage();
  storeAt(storage).save({answers: {consent: 'adult_agree'}, pageId: 'about'});
  const result = experienceStoreAt(storage).load();
  assert.equal(result.status, 'available');
  assert.deepEqual(result.draft.answers.experiences, [{id: 'migrated-experience-1', responses: {
    situation: '', actions: '', access: '', outcome: '', support: '', additional: '',
  }}]);
  assert.deepEqual(result.draft.answers.previous_responses, {});
  assert.equal(Object.hasOwn(result.draft.answers, 'final_comment'), false);
  assert.equal(Object.hasOwn(result.draft.answers, 'final_comment_moved_to'), false);
  assert.equal(experienceStoreAt(storage).load().draft.experienceId, result.draft.experienceId);
});

test('migration honors the original 30-day expiry and never renews it by reading', () => {
  const storage = fakeStorage([['another-form', 'keep']]);
  storeAt(storage).save({answers: answers(), pageId: 'experience'});
  const raw = storage.map.get(DRAFT_STORAGE_KEY);
  assert.equal(experienceStoreAt(storage, initialTime + DRAFT_TTL_MS - 1).load().status, 'available');
  assert.equal(storage.map.get(DRAFT_STORAGE_KEY), raw);
  assert.deepEqual(experienceStoreAt(storage, initialTime + DRAFT_TTL_MS).load(), {status: 'expired'});
  assert.equal(storage.map.has(DRAFT_STORAGE_KEY), false);
  assert.equal(storage.map.get('another-form'), 'keep');
});

test('a failed migration save preserves the complete raw v3 draft for another resume', () => {
  const storage = fakeStorage();
  const legacy = {...answers(), responses: {...answers().responses, help_needed: 'Must keep', anything_else: 'End'}};
  storeAt(storage).save({answers: legacy, pageId: 'experience'});
  const raw = storage.map.get(DRAFT_STORAGE_KEY);
  const store = experienceStoreAt(storage);
  const draft = store.load().draft;
  storage.setItem = () => { throw new Error('QuotaExceededError'); };
  assert.deepEqual(store.save(draft), {status: 'unavailable'});
  assert.equal(storage.map.get(DRAFT_STORAGE_KEY), raw);
  assert.equal(store.load().migratedFrom, schemaVersion);
  assert.deepEqual(store.load().draft.answers.previous_responses, legacy.responses);
  assert.deepEqual(storeAt(storage).load().draft.answers, legacy);
});

test('an explicit successful resume save upgrades schema and preserves the migration archive', () => {
  const storage = fakeStorage();
  storeAt(storage).save({answers: {...answers(), responses: {difficulties: 'Original', help_needed: 'Need'}}, pageId: 'experience'});
  const later = initialTime + 1000;
  const store = experienceStoreAt(storage, later);
  const draft = store.load().draft;
  draft.answers.experiences[0].responses.situation += ' edited';
  assert.equal(store.save(draft).status, 'saved');
  const payload = JSON.parse(storage.map.get(DRAFT_STORAGE_KEY));
  assert.equal(payload.schemaVersion, experienceSchemaVersion);
  assert.equal(payload.experienceId, 'migrated-experience-1');
  assert.equal(payload.updatedAt, later);
  const loaded = store.load();
  assert.equal(loaded.migratedFrom, undefined);
  assert.equal(loaded.draft.answers.experiences[0].responses.situation, 'Original edited');
  assert.deepEqual(loaded.draft.answers.previous_responses, {difficulties: 'Original', help_needed: 'Need'});
});

test('v4 active experience IDs and raw text survive repeated saves, refreshes and middle deletion', () => {
  const storage = fakeStorage();
  const state = experienceAnswers();
  state.experiences[1].responses.actions = '  second actions\r\n' + 'x'.repeat(6000);
  const before = structuredClone(state);
  const store = experienceStoreAt(storage);
  assert.equal(store.save({answers: state, pageId: 'experience', experienceId: 'experience-two'}).status, 'saved');
  assert.deepEqual(state, before);
  let resumed = experienceStoreAt(storage, initialTime + 10).load().draft;
  assert.deepEqual(resumed.answers, before);
  assert.equal(resumed.experienceId, 'experience-two');
  resumed.answers.experiences[0].responses.situation = 'First edited';
  assert.equal(store.save({...resumed, experienceId: 'experience-one'}).status, 'saved');
  resumed = experienceStoreAt(storage).load().draft;
  assert.equal(resumed.experienceId, 'experience-one');
  assert.equal(resumed.answers.experiences[1].responses.actions, before.experiences[1].responses.actions);
  resumed.answers.experiences.splice(1, 1);
  assert.equal(store.save({...resumed, experienceId: 'experience-three'}).status, 'saved');
  resumed = experienceStoreAt(storage).load().draft;
  assert.equal(resumed.experienceId, 'experience-three');
  assert.deepEqual(resumed.answers.experiences.map(item => item.id), ['experience-one', 'experience-three']);
  assert.equal(resumed.answers.experiences[0].responses.situation, 'First edited');
  assert.equal(resumed.answers.experiences[1].responses.situation, 'Third');
});

test('a missing or deleted v4 active ID falls back without regenerating remaining IDs', () => {
  for (const experienceId of [undefined, null, 'deleted-experience']) {
    const storage = fakeStorage();
    const state = experienceAnswers();
    const store = experienceStoreAt(storage);
    store.save({answers: state, pageId: 'about', experienceId});
    assert.equal(store.load().draft.experienceId, 'experience-one');
    const payload = JSON.parse(storage.map.get(DRAFT_STORAGE_KEY));
    payload.experienceId = 'no-longer-present';
    storage.map.set(DRAFT_STORAGE_KEY, JSON.stringify(payload));
    const raw = storage.map.get(DRAFT_STORAGE_KEY);
    assert.equal(store.load().draft.experienceId, 'experience-one');
    assert.equal(storage.map.get(DRAFT_STORAGE_KEY), raw);
    assert.deepEqual(store.load().draft.answers, state);
  }
});

test('v4 permits a single all-blank experience including the optional sixth answer', () => {
  const storage = fakeStorage();
  const state = {consent: 'adult_agree', experiences: [{id: 'initial', responses: {
    situation: '', actions: '', access: '', outcome: '', support: '', additional: '',
  }}]};
  for (const pageId of ['welcome', 'about', 'experience']) {
    assert.equal(experienceStoreAt(storage).save({answers: state, pageId}).status, 'saved');
    assert.deepEqual(experienceStoreAt(storage).load().draft.answers, state);
  }
});

test('invalid v4 experience structure fails saving without replacing an existing draft', () => {
  const storage = fakeStorage();
  const store = experienceStoreAt(storage);
  store.save({answers: experienceAnswers(), pageId: 'experience', experienceId: 'experience-two'});
  const raw = storage.map.get(DRAFT_STORAGE_KEY);
  for (const experiences of [undefined, [], 'wrong', [{}], [{id: '', responses: {}}], [{id: 'one', responses: []}],
    [{id: 'one', responses: {}}, {id: 'one', responses: {}}]]) {
    assert.deepEqual(store.save({answers: {consent: 'adult_agree', experiences}, pageId: 'experience'}), {status: 'unavailable', reason: 'invalid'});
    assert.equal(storage.map.get(DRAFT_STORAGE_KEY), raw);
  }
});

test('corrupt v4 structure is rejected while an unusual v3 response shape is preserved for backup', () => {
  const storage = fakeStorage();
  const store = experienceStoreAt(storage);
  store.save({answers: experienceAnswers(), pageId: 'experience'});
  const payload = JSON.parse(storage.map.get(DRAFT_STORAGE_KEY));
  payload.answers.experiences[1].id = payload.answers.experiences[0].id;
  storage.map.set(DRAFT_STORAGE_KEY, JSON.stringify(payload));
  assert.deepEqual(store.load(), {status: 'invalid'});
  assert.equal(storage.map.has(DRAFT_STORAGE_KEY), false);
  storeAt(storage).save({answers: {consent: 'adult_agree', responses: 'unusual old data'}, pageId: 'experience'});
  const raw = storage.map.get(DRAFT_STORAGE_KEY);
  assert.deepEqual(store.load(), {status: 'incompatible', raw});
  assert.equal(storage.map.get(DRAFT_STORAGE_KEY), raw);
});

test('two v4 store instances restore the newest IDs and observe explicit clearing in another tab', () => {
  const storage = fakeStorage([['unrelated', 'keep']]);
  const first = experienceStoreAt(storage);
  const second = experienceStoreAt(storage, initialTime + 100);
  first.save({answers: experienceAnswers(), pageId: 'experience', experienceId: 'experience-two'});
  const draft = second.load().draft;
  draft.answers.experiences[2].responses.support = 'Newest third answer';
  second.save({...draft, experienceId: 'experience-three'});
  assert.equal(first.load().draft.experienceId, 'experience-three');
  assert.equal(first.load().draft.answers.experiences[2].responses.support, 'Newest third answer');
  assert.deepEqual(second.clear(), {status: 'cleared'});
  assert.deepEqual(first.load(), {status: 'empty'});
  assert.equal(storage.map.get('unrelated'), 'keep');
  assert.ok(storage.calls.every(([, key]) => key === DRAFT_STORAGE_KEY));
});


test('v4 moves the old final comment exactly into the first experience without writing or changing active ID or expiry', () => {
  const storage = fakeStorage([['another-form', 'keep']]);
  const state = experienceAnswers();
  state.final_comment = '  A final thought\r\n生活 🧑🏽‍💻\n' + 'x'.repeat(6500) + '  ';
  const before = structuredClone(state);
  experienceStoreAt(storage).save({answers: state, pageId: 'experience', experienceId: 'experience-three'});
  const raw = storage.map.get(DRAFT_STORAGE_KEY);
  storage.calls.length = 0;
  const restored = experienceStoreAt(storage, initialTime + 1000).load().draft;
  assert.equal(restored.answers.experiences[0].responses.additional, state.final_comment);
  assert.equal(restored.answers.final_comment_moved_to, 'experience-one');
  assert.equal(Object.hasOwn(restored.answers, 'final_comment'), false);
  assert.equal(restored.experienceId, 'experience-three');
  assert.deepEqual(restored.answers.experiences.slice(1), state.experiences.slice(1));
  assert.equal(restored.updatedAt, initialTime);
  assert.equal(restored.expiresAt, initialTime + DRAFT_TTL_MS);
  assert.deepEqual(state, before);
  assert.equal(storage.map.get(DRAFT_STORAGE_KEY), raw);
  assert.equal(storage.map.get('another-form'), 'keep');
  assert.deepEqual(storage.calls, [['get', DRAFT_STORAGE_KEY]]);
});

test('an old empty final comment moves as an empty additional field without a notice marker', () => {
  const storage = fakeStorage();
  const state = {...experienceAnswers(), final_comment: ''};
  const store = experienceStoreAt(storage);
  store.save({answers: state, pageId: 'about'});
  const restored = store.load().draft.answers;
  assert.equal(restored.experiences[0].responses.additional, '');
  assert.equal(Object.hasOwn(restored, 'final_comment'), false);
  assert.equal(Object.hasOwn(restored, 'final_comment_moved_to'), false);
});

test('an existing additional field, including blank or unusual data, keeps the old final comment for explicit review', () => {
  for (const additional of ['', 'Existing experience thought', null, 42, {saved: true}]) {
    const storage = fakeStorage();
    const state = {...experienceAnswers(), final_comment: 'Legacy thought\r\nkeep exactly'};
    state.experiences[0].responses.additional = additional;
    const store = experienceStoreAt(storage);
    store.save({answers: state, pageId: 'experience', experienceId: 'experience-two'});
    const raw = storage.map.get(DRAFT_STORAGE_KEY);
    const draft = store.load().draft;
    assert.deepEqual(draft.answers, state);
    assert.equal(draft.experienceId, 'experience-two');
    assert.equal(Object.hasOwn(draft.answers, 'final_comment_moved_to'), false);
    assert.equal(storage.map.get(DRAFT_STORAGE_KEY), raw);
  }
});

test('non-string v4 final comments keep their original key and type without coercion or silent deletion', () => {
  for (const final_comment of [null, 0, false, ['original'], {original: 'value'}]) {
    const storage = fakeStorage();
    const state = {...experienceAnswers(), final_comment};
    const store = experienceStoreAt(storage);
    store.save({answers: state, pageId: 'experience'});
    const raw = storage.map.get(DRAFT_STORAGE_KEY);
    assert.deepEqual(store.load().draft.answers, state);
    assert.equal(Object.hasOwn(store.load().draft.answers.experiences[0].responses, 'additional'), false);
    assert.equal(storage.map.get(DRAFT_STORAGE_KEY), raw);
  }
});

test('non-string v3 anything_else values remain intact in both final_comment and the full original archive', () => {
  for (const anything_else of [null, 0, false, ['original'], {original: 'value'}]) {
    const storage = fakeStorage();
    const state = {...answers(), responses: {...answers().responses, anything_else}};
    storeAt(storage).save({answers: state, pageId: 'experience'});
    const raw = storage.map.get(DRAFT_STORAGE_KEY);
    const restored = experienceStoreAt(storage).load().draft.answers;
    assert.deepEqual(restored.final_comment, anything_else);
    assert.deepEqual(restored.previous_responses, state.responses);
    assert.equal(Object.hasOwn(restored.experiences[0].responses, 'additional'), false);
    assert.equal(storage.map.get(DRAFT_STORAGE_KEY), raw);
  }
});

test('a saved additional migration is idempotent and retains its stable notice marker on later loads', () => {
  const storage = fakeStorage();
  const state = {...experienceAnswers(), final_comment: 'original\r\n' + 'a'.repeat(5500)};
  const store = experienceStoreAt(storage);
  store.save({answers: state, pageId: 'experience', experienceId: 'experience-two'});
  const draft = store.load().draft;
  assert.deepEqual(store.load().draft, draft);
  assert.equal(store.save(draft).status, 'saved');
  const raw = storage.map.get(DRAFT_STORAGE_KEY);
  for (let read = 0; read < 3; read++) {
    const restored = experienceStoreAt(storage, initialTime + read + 1).load().draft;
    assert.deepEqual(restored, draft);
    assert.equal(restored.answers.final_comment_moved_to, 'experience-one');
    assert.equal(storage.map.get(DRAFT_STORAGE_KEY), raw);
  }
  draft.answers.experiences[0].responses.additional = '';
  store.save(draft);
  assert.equal(store.load().draft.answers.final_comment_moved_to, 'experience-one');
  assert.equal(store.load().draft.answers.experiences[0].responses.additional, '');
});

test('a failed save after additional migration preserves the previous raw v4 comment for another resume', () => {
  const storage = fakeStorage();
  const state = {...experienceAnswers(), final_comment: 'Must survive\r\n' + 'a'.repeat(6000)};
  const store = experienceStoreAt(storage);
  store.save({answers: state, pageId: 'experience', experienceId: 'experience-three'});
  const raw = storage.map.get(DRAFT_STORAGE_KEY);
  const draft = store.load().draft;
  storage.setItem = () => { throw new Error('QuotaExceededError'); };
  assert.deepEqual(store.save(draft), {status: 'unavailable'});
  assert.equal(storage.map.get(DRAFT_STORAGE_KEY), raw);
  assert.equal(JSON.parse(raw).answers.final_comment, state.final_comment);
  assert.equal(store.load().draft.answers.experiences[0].responses.additional, state.final_comment);
  assert.equal(store.load().draft.experienceId, 'experience-three');
});

test('additional migration reads do not extend the original v4 expiry', () => {
  const storage = fakeStorage();
  experienceStoreAt(storage).save({answers: {...experienceAnswers(), final_comment: 'Old'}, pageId: 'experience'});
  const raw = storage.map.get(DRAFT_STORAGE_KEY);
  const nearExpiry = experienceStoreAt(storage, initialTime + DRAFT_TTL_MS - 1).load();
  assert.equal(nearExpiry.status, 'available');
  assert.equal(nearExpiry.draft.answers.experiences[0].responses.additional, 'Old');
  assert.equal(nearExpiry.draft.expiresAt, initialTime + DRAFT_TTL_MS);
  assert.equal(storage.map.get(DRAFT_STORAGE_KEY), raw);
  assert.deepEqual(experienceStoreAt(storage, initialTime + DRAFT_TTL_MS).load(), {status: 'expired'});
  assert.equal(storage.map.has(DRAFT_STORAGE_KEY), false);
});

test('v4 drafts without a final comment or additional field remain compatible without adding or wiping fields', () => {
  const storage = fakeStorage();
  const state = {...experienceAnswers(), final_comment_moved_to: 'experience-three'};
  const store = experienceStoreAt(storage);
  store.save({answers: state, pageId: 'experience', experienceId: 'experience-three'});
  const raw = storage.map.get(DRAFT_STORAGE_KEY);
  assert.deepEqual(store.load().draft.answers, state);
  assert.equal(store.load().draft.experienceId, 'experience-three');
  assert.equal(Object.hasOwn(store.load().draft.answers.experiences[0].responses, 'additional'), false);
  assert.equal(storage.map.get(DRAFT_STORAGE_KEY), raw);
});

test('unknown versions retain the raw final comment and additional fields untouched', () => {
  const storage = fakeStorage();
  const state = {...experienceAnswers(), final_comment: 'Keep old global'};
  state.experiences[0].responses.additional = 'Keep existing';
  const store = experienceStoreAt(storage);
  store.save({answers: state, pageId: 'experience'});
  const payload = JSON.parse(storage.map.get(DRAFT_STORAGE_KEY));
  payload.version = 99;
  const raw = JSON.stringify(payload);
  storage.map.set(DRAFT_STORAGE_KEY, raw);
  assert.deepEqual(store.load(), {status: 'incompatible', raw});
  assert.equal(storage.map.get(DRAFT_STORAGE_KEY), raw);
});
