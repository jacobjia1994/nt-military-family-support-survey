import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../young-children.js', import.meta.url), 'utf8');
const context = vm.createContext({});
vm.runInContext(source, context, { filename: 'young-children.js' });
const { createSession, create, PROMPTS, MAX_LENGTH } = context.SURVEY_YOUNG_CHILDREN;
const plain = value => JSON.parse(JSON.stringify(value));
const permission = () => ({ agreed: true, age_path: 'young', kind: 'parent_guardian_permission', notice_version: 'test-v1', recorded_at: '2026-09-25T00:00:00.000Z' });
const makeSession = extra => {
  const session = createSession({ guardianPermission: permission(), now: () => '2026-09-25T00:01:00.000Z', ...extra });
  session.selectMode('child_views');
  return session;
};

test('under-seven answers need both a matching guardian permission and an explicit willingness attestation', () => {
  for (const guardianPermission of [null, {}, { agreed: false, age_path: 'young' }, { agreed: true, age_path: 'child' }]) {
    const session = makeSession({ guardianPermission });
    assert.equal(session.confirmWillingness(true), false);
    assert.equal(session.answer('likes', 'Playing'), false);
    assert.equal(session.exportAnswers(), null);
  }
  const session = makeSession();
  assert.equal(session.canContinue(), false);
  assert.equal(session.answer('likes', 'Playing'), false);
  assert.equal(session.exportAnswers(), null);
  assert.equal(session.confirmWillingness(true), true);
  assert.equal(session.canContinue(), true);
  assert.equal(session.answer('likes', 'Playing'), true);
});

test('the child expressions and guardian observations remain separate and do not include unrelated data', () => {
  const session = makeSession({ guardianPermission: { ...permission(), name: 'Private name', phone: 'Private phone' } });
  session.confirmWillingness(true);
  session.answer('likes', 'The swings');
  session.answer('guardian_observations', 'Transport to activities is difficult.');
  assert.equal(session.answer('phone', 'Private phone'), false);
  assert.equal(session.answer('__proto__', 'Bad key'), false);
  const output = plain(session.exportAnswers());
  assert.equal(output.questionnaire_version, 'young_child_supported');
  assert.equal(output.response_basis, 'child_expressions_recorded_by_parent_guardian');
  assert.deepEqual(output.child_responses, { likes: 'The swings' });
  assert.equal(output.guardian_observations, 'Transport to activities is difficult.');
  assert.equal(output.participation.kind, 'parent_guardian_attestation_of_child_willingness');
  assert.equal(output.participation.recorded_at, '2026-09-25T00:01:00.000Z');
  assert.equal(JSON.stringify(output).includes('Private'), false);
  assert.equal(output.collection_mode, 'internal_review_no_transmission');
  assert.equal(output.storage, 'downloaded_by_respondent; not submitted');
});

test('every response is optional; blank or whitespace-only answers are not treated as a negative experience', () => {
  const session = makeSession();
  session.confirmWillingness(true);
  session.answer('hard', '   ');
  session.answer('guardian_observations', '\n ');
  const output = plain(session.exportAnswers());
  assert.deepEqual(output.child_responses, {});
  assert.equal(Object.hasOwn(output, 'guardian_observations'), false);
});

test('reversing willingness, refusing, or resetting clears all child and adult text', () => {
  for (const clear of [session => session.confirmWillingness(false), session => session.confirmWillingness('unsure'), session => session.reset()]) {
    const session = makeSession();
    session.confirmWillingness(true);
    session.answer('hard', 'A worry');
    session.answer('guardian_observations', 'An observation');
    clear(session);
    assert.equal(session.exportAnswers(), null);
    session.selectMode('child_views');
    session.confirmWillingness(true);
    assert.deepEqual(plain(session.exportAnswers()).child_responses, {});
    assert.equal(Object.hasOwn(session.exportAnswers(), 'guardian_observations'), false);
  }
});

test('revoked permission is checked at finish and cannot be restored with stale answers', () => {
  let currentPermission = permission();
  const session = makeSession({ guardianPermission: () => currentPermission });
  session.confirmWillingness(true);
  session.answer('likes', 'The park');
  currentPermission = null;
  assert.equal(session.exportAnswers(), null);
  currentPermission = permission();
  assert.equal(session.exportAnswers(), null);
  session.selectMode('child_views');
  session.confirmWillingness(true);
  assert.deepEqual(plain(session.exportAnswers()).child_responses, {});
});

test('all four stable prompts and the separate observation use the same bounded text length', () => {
  const session = makeSession();
  session.confirmWillingness(true);
  assert.equal(PROMPTS.length, 4);
  for (const id of [...PROMPTS.map(prompt => prompt.id), 'guardian_observations']) session.answer(id, 'x'.repeat(MAX_LENGTH + 50));
  const output = session.exportAnswers();
  assert.equal(Object.keys(output.child_responses).length, 4);
  for (const value of Object.values(output.child_responses)) assert.equal(value.length, MAX_LENGTH);
  assert.equal(output.guardian_observations.length, MAX_LENGTH);
});

test('exports and snapshots cannot mutate the stored answers or permission', () => {
  const session = makeSession();
  session.confirmWillingness(true);
  session.answer('likes', 'The park');
  const snapshot = session.snapshot();
  snapshot.responses.likes = 'Changed';
  const output = session.exportAnswers();
  output.child_responses.likes = 'Changed again';
  output.participation.guardian_permission.agreed = false;
  assert.equal(session.exportAnswers().child_responses.likes, 'The park');
  assert.equal(session.exportAnswers().participation.guardian_permission.agreed, true);
});

function fakeMain() {
  const nodes = new Map();
  const node = key => {
    if (!nodes.has(key)) nodes.set(key, {
      listeners: {}, value: '', checked: false,
      focus() {}, addEventListener(type, listener) { this.listeners[type] = listener; },
      querySelector(selector) { return node(selector); },
      querySelectorAll(selector) {
        if (selector === '[name="young_mode"]') return [node('child_mode'), node('observation_mode')];
        if (selector === 'textarea') return [...PROMPTS.map(prompt => node(`field-${prompt.id}`)), node('field-guardian_observations')];
        return [];
      },
    });
    return nodes.get(key);
  };
  node('child_mode').value = 'child_views';
  node('observation_mode').value = 'guardian_observations';
  for (const id of [...PROMPTS.map(prompt => prompt.id), 'guardian_observations']) {
    Object.assign(node(`field-${id}`), { tagName: 'TEXTAREA', name: id });
  }
  return { main: { innerHTML: '', querySelector: node }, node };
}

test('the UI offers distinct modes, then renders four child boxes plus separate observations without assuming willingness', () => {
  const { main, node } = fakeMain();
  const controller = create({ main, guardianPermission: permission(), prompts: ['<img src=x onerror=bad()>'] });
  assert.equal(controller.show(), true);
  assert.equal((main.innerHTML.match(/<textarea/g) || []).length, 0);
  node('child_mode').listeners.change();
  assert.match(main.innerHTML, /&lt;img src=x onerror=bad\(\)&gt;/);
  assert.doesNotMatch(main.innerHTML, /<img src=x/);
  assert.equal((main.innerHTML.match(/<textarea/g) || []).length, 5);
  assert.match(main.innerHTML, /id="young-responses" disabled/);
  assert.doesNotMatch(main.innerHTML, /name="child_willing" checked/);
  assert.equal(controller.exportAnswers(), null);
});

test('guardian observation mode supports children unable to express views without asserting child assent', () => {
  const session = makeSession();
  assert.equal(session.selectMode('guardian_observations'), true);
  assert.equal(session.canContinue(), true);
  assert.equal(session.answer('likes', 'Invented child words'), false);
  assert.equal(session.answer('guardian_observations', 'My baby needs a reliable childcare place.'), true);
  const output = plain(session.exportAnswers());
  assert.equal(output.response_mode, 'guardian_observations');
  assert.equal(output.response_basis, 'parent_guardian_observations');
  assert.equal(Object.hasOwn(output, 'child_responses'), false);
  assert.equal(Object.hasOwn(output.participation, 'child_willingness_confirmed'), false);
  assert.equal(Object.hasOwn(output.participation, 'recorded_at'), false);
  assert.equal(output.participation.guardian_permission.agreed, true);
});

test('changing response mode clears incompatible text and does not carry willingness into a fresh child session', () => {
  const session = makeSession();
  session.confirmWillingness(true);
  session.answer('likes', 'Friends');
  session.answer('guardian_observations', 'Original observations');
  session.selectMode('guardian_observations');
  assert.equal(Object.hasOwn(session.exportAnswers(), 'guardian_observations'), false);
  session.answer('guardian_observations', 'New observations');
  session.selectMode('child_views');
  assert.equal(session.exportAnswers(), null);
  session.confirmWillingness(true);
  assert.deepEqual(plain(session.exportAnswers()).child_responses, {});
  assert.equal(Object.hasOwn(session.exportAnswers(), 'guardian_observations'), false);
});

test('observation UI provides one box; child refusal clears the record and calls stop without switching modes', () => {
  const { main, node } = fakeMain();
  let stopped = 0;
  const controller = create({ main, guardianPermission: permission(), onStop: () => stopped++ });
  controller.show();
  node('observation_mode').listeners.change();
  assert.equal((main.innerHTML.match(/<textarea/g) || []).length, 1);
  assert.doesNotMatch(main.innerHTML, /name="child_willing"/);
  node('child_mode').listeners.change();
  node('#young-willing').checked = true;
  node('#young-willing').listeners.change();
  const field = node('field-likes');
  field.value = 'The pool';
  node('#young-form').listeners.input({ target: field });
  assert.equal(controller.exportAnswers().child_responses.likes, 'The pool');
  node('#young-stop').onclick();
  assert.equal(stopped, 1);
  assert.equal(controller.exportAnswers(), null);
});

test('review preserves child text on Back, escapes it, and passes the distinct record to the shared finish callback', () => {
  const { main, node } = fakeMain();
  let finished;
  const controller = create({ main, guardianPermission: permission(), onFinish: (payload, active) => { finished = { payload, active }; } });
  controller.show();
  node('child_mode').listeners.change();
  node('#young-willing').checked = true;
  node('#young-willing').listeners.change();
  const field = node('field-likes');
  field.value = '<script>bad()</script>';
  node('#young-form').listeners.input({ target: field });
  node('#young-form').listeners.submit({ preventDefault() {} });
  assert.match(main.innerHTML, /&lt;script&gt;bad\(\)&lt;\/script&gt;/);
  assert.doesNotMatch(main.innerHTML, /<script>/);
  node('#young-edit').onclick();
  assert.match(main.innerHTML, /&lt;script&gt;bad\(\)&lt;\/script&gt;/);
  assert.match(main.innerHTML, /name="child_willing" checked/);
  controller.showReview();
  node('#young-finish').onclick();
  assert.equal(finished.payload.questionnaire_version, 'young_child_supported');
  assert.equal(finished.payload.child_responses.likes, '<script>bad()</script>');
  assert.equal(finished.active, controller);
});
