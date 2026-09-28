import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../young-children.js', import.meta.url), 'utf8');
const context = vm.createContext({});
context.window = context;
vm.runInContext(readFileSync(new URL('../geography.js', import.meta.url), 'utf8'), context, { filename: 'geography.js' });
vm.runInContext(source, context, { filename: 'young-children.js' });
const { createSession, create, PROMPTS, MAX_LENGTH } = context.SURVEY_YOUNG_CHILDREN;
const plain = value => JSON.parse(JSON.stringify(value));
const permission = () => ({ agreed: true, age_path: 'young', kind: 'parent_guardian_permission', notice_version: 'test-v1', recorded_at: '2026-09-25T00:00:00.000Z' });
const makeSession = extra => {
  const session = createSession({ guardianPermission: permission(), now: () => '2026-09-25T00:01:00.000Z', ...extra });
  session.setBackground('adf_connection', 'yes');
  return session;
};

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
  assert.equal(output.schema_version, '1.3');
  assert.equal(output.questionnaire_revision, '2026-09-29-local-connection-preview');
  assert.equal(output.questionnaire_version, 'young_child_supported');
  assert.equal(output.response_mode, 'child_views');
  assert.equal(output.response_basis, 'child_expressions_recorded_by_parent_guardian');
  assert.deepEqual(output.child_responses, { likes: 'The swings' });
  assert.equal(output.guardian_observations, 'Transport to activities is difficult.');
  assert.equal(output.participation.kind, 'parent_guardian_attestation_of_child_willingness');
  assert.equal(output.participation.recorded_at, '2026-09-25T00:01:00.000Z');
  assert.equal(JSON.stringify(output).includes('Private'), false);
  assert.equal(output.collection_mode, 'internal_review_no_transmission');
  assert.equal(output.storage, 'in_memory_preview_not_submitted');
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
  assert.equal(session.exportAnswers(), null);
  assert.deepEqual(plain(session.snapshot()), { background: {}, willing: false, responses: {}, guardian_observations: '' });
  session.setBackground('adf_connection', 'yes');
  session.confirmWillingness(true);
  session.answer('likes', 'The pool');
  session.answer('guardian_observations', 'A fresh observation');
  session.reset();
  assert.deepEqual(plain(session.snapshot()), { background: {}, willing: false, responses: {}, guardian_observations: '' });
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
  snapshot.background.adf_connection = 'no';
  const output = session.exportAnswers();
  output.child_responses.likes = 'Changed again';
  output.participation.guardian_permission.agreed = false;
  output.background.adf_connection = 'no';
  assert.equal(session.exportAnswers().child_responses.likes, 'The park');
  assert.equal(session.exportAnswers().participation.guardian_permission.agreed, true);
  assert.equal(session.exportAnswers().background.adf_connection, 'yes');
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

function completeBackground(node, { adf = 'yes', area = '', locality = '', stage = '', other = '' } = {}) {
  const form = node('#young-background-form');
  form.listeners.change({ target: { name: 'adf_connection', value: adf } });
  node('input[name="residence_area"]:checked').value = area;
  form.listeners.change({ target: { name: 'residence_area', value: area } });
  node('#young-suburb').value = locality;
  form.listeners.change({ target: { name: 'suburb', value: locality } });
  node('#young-stage').value = stage;
  node('#young-suburb-other').value = other;
  form.listeners.submit({ preventDefault() {} });
}

test('after guardian background the UI shows all four child boxes and observations without a mode selector', () => {
  const { main, node } = fakeMain();
  const controller = create({ main, guardianPermission: permission(), prompts: ['<img src=x onerror=bad()>'] });
  assert.equal(controller.show(), true);
  assert.match(main.innerHTML, /About your child/);
  assert.doesNotMatch(main.innerHTML, /<textarea/);
  completeBackground(node);
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
  completeBackground(node);
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
  completeBackground(node);
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
  completeBackground(node);
  node('#young-willing').checked = true;
  node('#young-willing').listeners.change();
  type(node, 'likes', 'The pool');
  type(node, 'guardian_observations', 'Transport is difficult.');
  node('#young-stop').onclick();
  assert.equal(stopped, 1);
  assert.equal(controller.exportAnswers(), null);
});

test('review preserves child text on Back, escapes it, and passes the distinct record to shared finish', () => {
  const { main, node } = fakeMain();
  let finished;
  const controller = create({ main, guardianPermission: permission(), onFinish: (payload, active) => { finished = { payload, active }; } });
  controller.show();
  completeBackground(node);
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

test('an explicit ADF connection is required before either perspective can be recorded or exported', () => {
  const session = createSession({ guardianPermission: permission() });
  assert.equal(session.canContinue(), false);
  assert.equal(session.answer('guardian_observations', 'A childcare need'), false);
  assert.equal(session.confirmWillingness(true), false);
  assert.equal(session.exportAnswers(), null);
  assert.equal(session.setBackground('adf_connection', 'foreign_military'), false);
  assert.equal(session.canContinue(), false);
  session.setBackground('adf_connection', 'unsure');
  assert.equal(session.canContinue(), true);
  assert.equal(session.answer('guardian_observations', 'An observation'), true);
  assert.equal(session.exportAnswers().background.adf_connection, 'unsure');
  assertNoChildClaim(session.exportAnswers());
  session.setBackground('adf_connection', 'no');
  assert.equal(session.canContinue(), false);
  assert.equal(session.exportAnswers(), null);
  session.setBackground('adf_connection', 'yes');
  assert.equal(session.exportAnswers().guardian_observations, undefined);
});

test('canonical localities including Litchfield export their region and age without collecting a birth date', () => {
  const session = makeSession();
  assert.equal(context.SURVEY_GEOGRAPHY.localities.length, 100);
  for (const suburb of ['wagaman', 'casuarina', 'stuart_park', 'humpty_doo', 'holtze']) {
    const locality = context.SURVEY_GEOGRAPHY.localities.find(option => option.id === suburb);
    assert.equal(session.setBackground('residence_area', locality.region), true);
    assert.equal(session.setBackground('suburb', suburb), true);
  }
  assert.equal(session.setBackground('child_stage', '0_4'), true);
  assert.equal(session.setBackground('birth_date', '2022-01-01'), false);
  const output = plain(session.exportAnswers());
  assert.deepEqual(output.background, { adf_connection: 'yes', residence_area: 'litchfield', suburb: 'holtze', child_stage: '0_4', region: 'litchfield', geography_scope: 'greater_darwin', location_precision: 'suburb' });
  assert.equal(output.geography_version, context.SURVEY_GEOGRAPHY.version);
  assert.equal(session.setBackground('suburb', 'unrecognised'), false);
  assert.equal(session.exportAnswers().background.suburb, 'holtze');
});

test('Other detail is cleared on locality changes and outside or undisclosed places never count as local', () => {
  const session = makeSession();
  session.setBackground('residence_area', 'darwin');
  session.setBackground('suburb', 'other');
  session.setBackground('suburb_other', 'A locality');
  assert.equal(session.exportAnswers().background.suburb_other, 'A locality');
  session.setBackground('residence_area', 'darwin');
  session.setBackground('suburb', 'other');
  assert.equal(session.exportAnswers().background.suburb_other, 'A locality');
  session.setBackground('residence_area', 'outside');
  session.answer('guardian_observations', 'Our family lives elsewhere.');
  let output = session.exportAnswers();
  assert.equal(output.background.geography_scope, 'outside_greater_darwin');
  assert.equal(output.background.region, 'outside_greater_darwin');
  assert.equal(output.background.suburb_other, undefined);
  assert.equal(output.guardian_observations, 'Our family lives elsewhere.');
  assertNoChildClaim(output);
  assert.equal(session.setBackground('suburb_other', 'Hidden stale value'), false);
  for (const choice of ['prefer', '']) {
    session.setBackground('residence_area', choice);
    output = session.exportAnswers();
    assert.equal(output.background.geography_scope, 'not_stated');
    assert.equal(output.background.region, null);
  }
  session.setBackground('residence_area', 'darwin');
  session.setBackground('suburb', 'other');
  assert.equal(session.exportAnswers().background.suburb_other, undefined);
});

test('background validation and scope screen keep users out until the required ADF question is answered', () => {
  const { main, node } = fakeMain();
  const controller = create({ main, guardianPermission: permission() });
  controller.show();
  node('#young-background-form').listeners.submit({ preventDefault() {} });
  assert.match(node('#young-background-error').textContent, /Please choose Yes, No or Not sure/);
  assert.equal(controller.exportAnswers(), null);
  completeBackground(node, { adf: 'no' });
  assert.match(main.innerHTML, /Thank you for your interest/);
  assert.doesNotMatch(main.innerHTML, /<textarea/);
  node('#young-scope-back').onclick();
  completeBackground(node, { adf: 'unsure' });
  assert.match(main.innerHTML, /Your child’s views and needs/);
  assert.equal(controller.exportAnswers().background.adf_connection, 'unsure');
});

test('three primary areas are visible with optional secondary choices and a dependent suburb selector', () => {
  const { main, node } = fakeMain();
  const controller = create({ main, guardianPermission: permission() });
  controller.show();
  const primary = main.innerHTML.match(/<div class="choices area-primary-choices">(.*?)<\/div>/)[1];
  assert.deepEqual([...primary.matchAll(/name="residence_area" value="([^"]+)"/g)].map(match => match[1]), ['darwin', 'palmerston', 'litchfield']);
  assert.doesNotMatch(primary, /checked|required/);
  assert.match(main.innerHTML, /<details class="area-other-options" ><summary>Other area<\/summary>/);
  assert.match(main.innerHTML, /id="young-suburb-group" hidden/);
  assert.doesNotMatch(main.innerHTML, /role="combobox"|locality-picker/);
  completeBackground(node, { area: 'litchfield', locality: 'holtze', stage: '5_7' });
  assert.match(node('#young-suburb').innerHTML, /Robertson Barracks/);
  assert.doesNotMatch(node('#young-suburb').innerHTML, /value="wagaman"|value="bakewell"/);
  assert.equal(controller.exportAnswers().background.suburb, 'holtze');
  assert.equal(controller.exportAnswers().background.region, 'litchfield');
  assert.equal(controller.exportAnswers().background.child_stage, '5_7');
});

test('an area-only Palmerston answer has no implied suburb and has separate review labeling', () => {
  const { main, node } = fakeMain();
  const controller = create({ main, guardianPermission: permission() });
  controller.show();
  completeBackground(node, { area: 'palmerston' });
  const background = plain(controller.exportAnswers().background);
  assert.equal(background.residence_area, 'palmerston');
  assert.equal(background.region, 'palmerston');
  assert.equal(background.location_precision, 'area');
  assert.equal(background.geography_scope, 'greater_darwin');
  assert.equal(background.suburb, undefined);
  controller.showReview();
  assert.match(main.innerHTML, /Child’s area/);
  assert.match(main.innerHTML, /Palmerston/);
  assert.doesNotMatch(main.innerHTML, /Palmerston City|Child’s suburb or locality/);
});

test('area changes clear stale locality and free text but preserve child and guardian perspectives', () => {
  const session = makeSession();
  session.setBackground('residence_area', 'darwin');
  session.setBackground('suburb', 'other');
  session.setBackground('suburb_other', 'A local place');
  session.confirmWillingness(true);
  session.answer('likes', 'The pool');
  session.answer('guardian_observations', 'A playgroup would help.');
  session.setBackground('residence_area', 'palmerston');
  let output = session.exportAnswers();
  assert.equal(output.background.suburb, undefined);
  assert.equal(output.background.suburb_other, undefined);
  assert.equal(output.background.location_precision, 'area');
  assert.equal(output.child_responses.likes, 'The pool');
  assert.equal(output.guardian_observations, 'A playgroup would help.');
  assert.equal(session.setBackground('suburb', 'wagaman'), false);
  assert.equal(session.exportAnswers().background.suburb, undefined);
  assert.equal(session.setBackground('suburb', 'bakewell'), true);
  assert.equal(session.exportAnswers().background.location_precision, 'suburb');
  session.setBackground('residence_area', 'prefer');
  output = session.exportAnswers();
  assert.equal(output.background.suburb, undefined);
  assert.equal(output.background.region, null);
  assert.equal(output.background.location_precision, 'not_stated');
});

test('Outside and Prefer not to say hide the suburb selector and cannot retain a named locality', () => {
  const { main, node } = fakeMain();
  const controller = create({ main, guardianPermission: permission() });
  controller.show();
  for (const area of ['outside', 'prefer', '']) {
    completeBackground(node, { area });
    assert.equal(node('#young-suburb-group').hidden, true);
    const background = controller.exportAnswers().background;
    assert.equal(background.suburb, undefined);
    assert.equal(background.location_precision, area === 'outside' ? 'area' : 'not_stated');
    assert.equal(background.geography_scope, area === 'outside' ? 'outside_greater_darwin' : 'not_stated');
    controller.showBackground();
    assert.equal(/<details class="area-other-options" open>/.test(main.innerHTML), Boolean(area));
    if (area) assert.match(main.innerHTML, new RegExp(`name="residence_area" value="${area}" checked`));
  }
});

test('suburb disclosure is optional independently of the known area and Other detail is bounded', () => {
  const session = makeSession();
  assert.equal(session.setBackground('suburb', 'bakewell'), false);
  assert.equal(session.setBackground('residence_area', 'palmerston'), true);
  assert.equal(session.setBackground('suburb', 'prefer'), true);
  assert.equal(session.exportAnswers().background.region, 'palmerston');
  assert.equal(session.exportAnswers().background.location_precision, 'area');
  session.setBackground('suburb', 'other');
  assert.equal(session.exportAnswers().background.location_precision, 'area');
  session.setBackground('suburb_other', 'x'.repeat(120));
  assert.equal(session.exportAnswers().background.suburb_other.length, 100);
  assert.equal(session.exportAnswers().background.location_precision, 'other_locality');
  assert.equal(session.setBackground('residence_area', 'unrecognised'), false);
  assert.equal(session.exportAnswers().background.residence_area, 'palmerston');
});

test('review includes guardian background and changes preserve existing perspectives until ADF scope is withdrawn', () => {
  const { main, node } = fakeMain();
  const controller = create({ main, guardianPermission: permission() });
  controller.show();
  completeBackground(node, { area: 'darwin', locality: 'wagaman', stage: '0_4' });
  type(node, 'guardian_observations', 'Help to join a playgroup.');
  node('#young-willing').checked = true;
  node('#young-willing').listeners.change();
  type(node, 'likes', 'My friends');
  node('#young-back').onclick();
  assert.match(main.innerHTML, /About your child/);
  completeBackground(node, { area: 'darwin', locality: 'wagaman', stage: '0_4' });
  assert.match(main.innerHTML, /My friends/);
  controller.showReview();
  assert.match(main.innerHTML, /Wagaman/);
  assert.match(main.innerHTML, /0–4 years/);
  assert.doesNotMatch(main.innerHTML, /Not answered/);
  node('#young-edit-background').onclick();
  completeBackground(node, { area: 'outside', stage: '0_4' });
  assert.equal(controller.exportAnswers().guardian_observations, 'Help to join a playgroup.');
  assert.equal(controller.exportAnswers().child_responses.likes, 'My friends');
  controller.showReview();
  assert.match(main.innerHTML, /Outside Greater Darwin/);
  assert.doesNotMatch(main.innerHTML, /Wagaman/);
  node('#young-edit-background').onclick();
  completeBackground(node, { adf: 'no' });
  assert.equal(controller.exportAnswers(), null);
});
