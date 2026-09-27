import assert from 'node:assert/strict';
import test from 'node:test';
import {getFlowState, applyAnswer} from '../support-flow.mjs';
import {getResults} from '../support-paths.mjs';

const visibleIds = flow => flow.visibleQuestions.map(q => q.id);
const answer = (topic, flow, id, value, savedRegion = '') => applyAnswer(topic, flow.answers, id, value, savedRegion);

test('a new topic exposes only its first unanswered question, including human help', () => {
  for (const [topic, first] of [['money','need'], ['care','need'], ['mental','need'], ['help','connection']]) {
    const flow = getFlowState(topic, {});
    assert.deepEqual(visibleIds(flow), [first]);
    assert.equal(flow.nextQuestion.id, first);
    assert.equal(flow.complete, false);
  }
});

test('each valid choice retains prior groups and exposes the next question without a submit step', () => {
  let flow = getFlowState('money', {});
  for (const [id, value, expected] of [
    ['need', 'bills', ['need','connection']],
    ['connection', 'former', ['need','connection','role']],
    ['role', 'partner', ['need','connection','role','region']]
  ]) {
    flow = answer('money', flow, id, value);
    assert.deepEqual(visibleIds(flow), expected);
    assert.equal(flow.complete, false);
    assert.equal(flow.nextQuestion.id, expected.at(-1));
  }
  flow = answer('money', flow, 'region', 'katherine');
  assert.equal(flow.complete, true);
  assert.equal(flow.nextQuestion, null);
  assert.deepEqual(visibleIds(flow), ['need','connection','role','region']);
  assert.ok(getResults('money', flow.answers).ids.includes('bravery-financial'));
});

test('a previously known location can complete a short flow but never skips an unanswered eligibility question', () => {
  let short = getFlowState('money', {}, 'alice');
  short = answer('money', short, 'need', 'essentials', 'alice');
  assert.equal(short.complete, true);
  assert.equal(short.answers.region, 'alice');
  assert.equal(getResults('money', short.answers).ids[0], 'lc-alice');
  const longer = applyAnswer('money', {}, 'need', 'bills', 'alice');
  assert.equal(longer.complete, false);
  assert.deepEqual(visibleIds(longer), ['need','connection']);
});

test('re-selecting an answer does not erase a completed result or downstream choices', () => {
  const initial = {need:'bills', connection:'former', role:'partner', region:'gove'};
  const flow = getFlowState('money', initial);
  const unchanged = answer('money', flow, 'connection', 'former');
  assert.deepEqual(unchanged.answers, flow.answers);
  assert.equal(unchanged.complete, true);
});

test('changing an earlier need clears obsolete answers and maps a safe location to the new question', () => {
  const flow = getFlowState('money', {need:'bills', connection:'former', role:'partner', region:'katherine'});
  const changed = answer('money', flow, 'need', 'tenancy', 'katherine');
  assert.equal(changed.answers.need, 'tenancy');
  assert.equal(changed.answers.connection, undefined);
  assert.equal(changed.answers.role, undefined);
  assert.equal(changed.answers.region, 'nt');
  assert.equal(changed.complete, true);
  assert.ok(getResults('money', changed.answers).ids.includes('tenancy-nt'));
});

test('changing a patient to the member shortcut clears treatment answers, and changing back asks again', () => {
  const initial = getFlowState('care', {
    need:'travel', connection:'serving', role:'other', dvaTravel:'no', region:'alice', ntResidence:'yes'
  }, 'alice');
  const member = answer('care', initial, 'role', 'member', 'alice');
  assert.equal(member.complete, true);
  assert.equal(member.answers.dvaTravel, undefined);
  assert.equal(member.answers.ntResidence, undefined);
  assert.equal(getResults('care', member.answers).ids[0], 'defence-medical-enquiry');
  const relative = answer('care', member, 'role', 'other', 'alice');
  assert.equal(relative.complete, false);
  assert.equal(relative.nextQuestion.id, 'dvaTravel');
  assert.ok(!visibleIds(relative).includes('ntResidence'));
});

test('changing to DVA-covered travel removes PATS residence conditions', () => {
  const flow = getFlowState('care', {need:'travel', connection:'former', dvaTravel:'no', region:'alice', ntResidence:'no'});
  const changed = answer('care', flow, 'dvaTravel', 'yes', 'alice');
  assert.equal(changed.complete, true);
  assert.equal(changed.answers.ntResidence, undefined);
  assert.ok(!changed.questions.some(q => q.id === 'ntResidence'));
  assert.equal(getResults('care', changed.answers).ids[0], 'dva-treatment-travel');
});

test('changing adult age to child age clears adult service history and incompatible preferences', () => {
  const flow = getFlowState('mental', {
    need:'feelings', age:'26+', counselling:'member', region:'darwin',
    preferences:['anonymous','lgbtq','men','invalid-preference']
  }, 'darwin');
  const child = answer('mental', flow, 'age', '5-11', 'darwin');
  assert.equal(child.answers.counselling, undefined);
  assert.equal(child.complete, true);
  assert.deepEqual(new Set(child.answers.preferences), new Set(['anonymous','lgbtq']));
  assert.ok(!child.questions.some(q => q.id === 'counselling'));
  assert.equal(getResults('mental', child.answers).ids[0], 'catholiccare-fmhss-darwin');
});

test('invalid values or answers to hidden questions cannot skip prerequisites', () => {
  const flow = getFlowState('money', {need:'bills'});
  for (const [id, value] of [['connection','made-up'], ['role','partner'], ['region','darwin'], ['unknown','yes']]) {
    const changed = answer('money', flow, id, value);
    assert.deepEqual(changed.answers, flow.answers, `${id}/${value}`);
    assert.deepEqual(visibleIds(changed), ['need','connection']);
    assert.equal(changed.complete, false);
  }
});

test('saved NT city maps to a jurisdiction and can be restored when precise location matters again', () => {
  const broad = getFlowState('relationships', {need:'counselling', counselling:'other'}, 'alice');
  assert.equal(broad.answers.region, 'nt');
  assert.equal(broad.complete, true);
  const precise = getFlowState('relationships', {need:'assault', region:'nt'}, 'alice');
  assert.equal(precise.answers.region, 'alice');
  assert.equal(precise.complete, true);
  const unknownCity = getFlowState('relationships', {need:'assault', region:'nt'});
  assert.equal(unknownCity.complete, false);
  assert.equal(unknownCity.nextQuestion.id, 'region');
});

test('an explicit outside-NT answer overrides a previously saved NT town', () => {
  const broad = getFlowState('relationships', {need:'counselling', counselling:'other', region:'outside'}, 'alice');
  assert.equal(broad.answers.region, 'outside');
  assert.equal(broad.complete, true);
  assert.ok(!getResults('relationships', broad.answers).ids.includes('relationships-australia-nt'));
  const precise = getFlowState('relationships', {need:'assault', region:'outside'}, 'alice');
  assert.equal(precise.answers.region, 'outside');
  assert.ok(!getResults('relationships', precise.answers).ids.some(id => id.startsWith('sarc-')));
});

test('invalid persisted choices are not accepted as a completed questionnaire', () => {
  const flow = getFlowState('money', {need:'bills', connection:'not-a-connection', role:'partner', region:'darwin'});
  assert.equal(flow.complete, false);
  assert.equal(flow.nextQuestion.id, 'connection');
  assert.equal(flow.answers.connection, undefined);
  assert.deepEqual(visibleIds(flow), ['need','connection']);
  const corrected = answer('money', flow, 'connection', 'former');
  assert.equal(corrected.complete, false);
  assert.equal(corrected.nextQuestion.id, 'role');
  assert.equal(corrected.answers.role, undefined);
});
