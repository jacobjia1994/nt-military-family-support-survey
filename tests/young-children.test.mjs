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
const makeSession = extra => createSession({ guardianPermission: permission(), now: () => '2026-09-25T00:01:00.000Z', ...extra });

function assertNoChildClaim(output) {
  assert.equal(output.response_mode, 'guardian_observations');
  assert.equal(output.response_basis, 'parent_guardian_observations');
  assert.equal(Object.hasOwn(output, 'child_responses'), false);
  assert.equal(Object.hasOwn(output.participation, 'child_willingness_confirmed'), false);
  assert.equal(Object.hasOwn(output.participation, 'recorded_at'), false);
}

test('guardian permission gates all answers; willingness additionally gates child expressions', () => {
  for (const guardianPermission of [null, {}, { agreed: false, age_path: 'young' }, { agreed: true, age_path: 'child' }]) {
    const session = makeSession({ guardianPermission });
    assert.equal(session.canContinue(), false);
    assert.equal(session.confirmWillingness(true), false);
    assert.equal(session.answer('likes', 'Playing'), false);
    assert.equal(session.answer('guardian_observations', 'Transport is difficult.'), false);
    assert.equal(session.exportAnswers(), null);
  }
  const session = makeSession();
  assert.equal(session.canContinue(), true);
  assert.equal(session.answer('likes', 'Playing'), false);
  assert.equal(session.answer('guardian_observations', 'Transport is difficult.'), true);
  assertNoChildClaim(session.exportAnswers());
  assert.equal(session.confirmWillingness(true), true);
  assert.equal(session.answer('likes', 'Playing'), true);
});

test('child expressions and guardian observations remain separate without unrelated private data', () => {
  const session = makeSession({ guardianPermission: { ...permission(), name: 'Private name', phone: 'Private phone' } });
  session.confirmWillingness(true);
  session.answer('likes', 'The swings');
  session.answer('guardian_observations', 'Transport to activities is difficult.');
  assert.equal(session.answer('phone', 'Private phone'), false);
  assert.equal(session.answer('__proto__', 'Bad key'), false);
  const output = plain(session.exportAnswers());
  assert.equal(output.schema_version, '1.1');
  assert.equal(output.questionnaire_version, 'young_child_supported');
  assert.equal(output.response_mode, 'child_views');
  assert.equal(output.response_basis, 'child_expressions_recorded_by_parent_guardian');
  assert.deepEqual(output.child_responses, { likes: 'The swings' });
  assert.equal(output.guardian_observations, 'Transport to activities is difficult.');
  assert.equal(output.participation.kind, 'parent_guardian_attestation_of_child_willingness');
  assert.equal(output.participation.recorded_at, '2026-09-25T00:01:00.000Z');
  assert.equal(JSON.stringify(output).includes('Private'), false);
  assert.equal(output.collection_mode, 'internal_review_no_transmission');
  assert.equal(output.storage, 'downloaded_by_respondent; not submitted');
});

test('blank child boxes do not create a child response or claim assent even if willingness was checked', () => {
  for (const willing of [false, true]) {
    const session = makeSession();
    session.confirmWillingness(willing);
    session.answer('hard', '   ');
    session.answer('guardian_observations', '\n ');
    const output = plain(session.exportAnswers());
    assertNoChildClaim(output);
    assert.equal(Object.hasOwn(output, 'guardian_observations'), false);
  }
});

test('withdrawing willingness clears child text but preserves independent guardian observations', () => {
  for (const value of [false, 'unsure']) {
    const session = makeSession();
    session.confirmWillingness(true);
    session.answer('hard', 'A worry');
    session.answer('guardian_observations', 'An observation');
    session.confirmWillingness(value);
    assert.equal(session.canContinue(), true);
    assert.deepEqual(plain(session.snapshot()).responses, {});
    assert.equal(session.snapshot().willing, false);
    assert.equal(session.exportAnswers().guardian_observations, 'An observation');
    assertNoChildClaim(session.exportAnswers());
    session.confirmWillingness(true);
    assert.deepEqual(plain(session.snapshot()).responses, {});
    assert.equal(session.exportAnswers().guardian_observations, 'An observation');
    assertNoChildClaim(session.exportAnswers());
  }
});

test('reset and revoked permission discard both perspectives without restoring stale responses', () => {
  let currentPermission = permission();
  const session = makeSession({ guardianPermission: () => currentPermission });
  session.confirmWillingness(true);
  session.answer('likes', 'The park');
  session.answer('guardian_observations', 'An observation');
  currentPermission = null;
  assert.equal(session.exportAnswers(), null);
  currentPermission = permission();
  assertNoChildClaim(session.exportAnswers());
  assert.deepEqual(plain(session.snapshot()), { willing: false, responses: {}, guardian_observations: '' });
  session.confirmWillingness(true);
  session.answer('likes', 'The pool');
  session.answer('guardian_observations', 'A fresh observation');
  session.reset();
  assert.deepEqual(plain(session.snapshot()), { willing: false, responses: {}, guardian_observations: '' });
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

test('exports and snapshots cannot mutate stored answers or permission', () => {
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
        if (selector === 'textarea') return key === '#young-responses'
          ? PROMPTS.map(prompt => node(`field-${prompt.id}`))
          : [...PROMPTS.map(prompt => node(`field-${prompt.id}`)), node('field-guardian_observations')];
        return [];
      },
    });
    return nodes.get(key);
  };
  for (const id of [...PROMPTS.map(prompt => prompt.id), 'guardian_observations']) {
    Object.assign(node(`field-${id}`), { tagName: 'TEXTAREA', name: id });
  }
  return { main: { innerHTML: '', querySelector: node }, node };
}

function type(node, id, value) {
  const field = node(`field-${id}`);
  field.value = value;
  node('#young-form').listeners.input({ target: field });
}

test('the unified UI shows four child boxes and observations immediately without a mode selector', () => {
  const { main } = fakeMain();
  const controller = create({ main, guardianPermission: permission(), prompts: ['<img src=x onerror=bad()>'] });
  assert.equal(controller.show(), true);
  assert.match(main.innerHTML, /&lt;img src=x onerror=bad\(\)&gt;/);
  assert.doesNotMatch(main.innerHTML, /<img src=x/);
  assert.equal((main.innerHTML.match(/<textarea/g) || []).length, 5);
  assert.match(main.innerHTML, /id="young-responses" disabled/);
  assert.match(main.innerHTML, /Your observations/);
  assert.doesNotMatch(main.innerHTML, /What would you like to share\?|Record my child’s views|Share my observations as a parent or guardian|young_mode|You can share your own observations if your child cannot express their views/);
  assert.doesNotMatch(main.innerHTML, /name="child_willing" checked/);
  assertNoChildClaim(controller.exportAnswers());
});

test('guardian observations work without willingness and review does not invent a child section', () => {
  const { main, node } = fakeMain();
  const controller = create({ main, guardianPermission: permission() });
  controller.show();
  type(node, 'guardian_observations', 'My baby needs a reliable childcare place.');
  node('#young-form').listeners.submit({ preventDefault() {} });
  assert.match(main.innerHTML, /My baby needs a reliable childcare place/);
  assert.match(main.innerHTML, /Your observations/);
  assert.doesNotMatch(main.innerHTML, /Your child’s responses/);
  assertNoChildClaim(controller.exportAnswers());
});

test('UI willingness reversal preserves the observation field while removing child responses', () => {
  const { main, node } = fakeMain();
  const controller = create({ main, guardianPermission: permission() });
  controller.show();
  node('#young-willing').checked = true;
  node('#young-willing').listeners.change();
  type(node, 'likes', 'The pool');
  type(node, 'guardian_observations', 'Transport is difficult.');
  node('#young-willing').checked = false;
  node('#young-willing').listeners.change();
  assert.equal(node('field-likes').value, '');
  assert.equal(node('field-guardian_observations').value, 'Transport is difficult.');
  assert.equal(controller.exportAnswers().guardian_observations, 'Transport is difficult.');
  assertNoChildClaim(controller.exportAnswers());
});

test('stopping clears child and guardian text and calls the parent stop handler', () => {
  const { main, node } = fakeMain();
  let stopped = 0;
  const controller = create({ main, guardianPermission: permission(), onStop: () => stopped++ });
  controller.show();
  node('#young-willing').checked = true;
  node('#young-willing').listeners.change();
  type(node, 'likes', 'The pool');
  type(node, 'guardian_observations', 'Transport is difficult.');
  node('#young-stop').onclick();
  assert.equal(stopped, 1);
  assertNoChildClaim(controller.exportAnswers());
  assert.equal(Object.hasOwn(controller.exportAnswers(), 'guardian_observations'), false);
});

test('review preserves child text on Back, escapes it, and passes the distinct record to shared finish', () => {
  const { main, node } = fakeMain();
  let finished;
  const controller = create({ main, guardianPermission: permission(), onFinish: (payload, active) => { finished = { payload, active }; } });
  controller.show();
  node('#young-willing').checked = true;
  node('#young-willing').listeners.change();
  type(node, 'likes', '<script>bad()</script>');
  node('#young-form').listeners.submit({ preventDefault() {} });
  assert.match(main.innerHTML, /&lt;script&gt;bad\(\)&lt;\/script&gt;/);
  assert.doesNotMatch(main.innerHTML, /<script>/);
  assert.match(main.innerHTML, /Your child’s responses/);
  node('#young-edit').onclick();
  assert.match(main.innerHTML, /&lt;script&gt;bad\(\)&lt;\/script&gt;/);
  assert.match(main.innerHTML, /name="child_willing" checked/);
  controller.showReview();
  node('#young-finish').onclick();
  assert.equal(finished.payload.questionnaire_version, 'young_child_supported');
  assert.equal(finished.payload.child_responses.likes, '<script>bad()</script>');
  assert.equal(finished.active, controller);
});
