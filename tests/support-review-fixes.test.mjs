import assert from 'node:assert/strict';
import test from 'node:test';
import { questionsFor, preferencesFor, regionModeFor, getResults } from '../support-paths.mjs';
import { services } from '../support-catalog.mjs';

const allIds = result => [
  ...result.ids,
  ...result.moreIds,
  ...(result.preferenceGroups || []).flatMap(group => group.ids)
];
const questionIds = (topic, answers) => questionsFor(topic, answers).map(q => q.id);

test('nationwide support does not require a location that cannot affect the answer', () => {
  const cases = [
    ['mental', { need: 'grief', age: 'adult', counselling: 'other' }],
    ['relationships', { need: 'counselling', counselling: 'partner' }],
    ['money', { need: 'bills', connection: 'former', role: 'partner' }],
    ['parenting', { need: 'childcare', connection: 'former', careHours: 'regular' }],
    ['work', { need: 'transition', connection: 'former' }]
  ];
  for (const [topic, answers] of cases) {
    assert.equal(regionModeFor(topic, answers), 'none', `${topic}/${answers.need}`);
    assert.ok(!questionIds(topic, answers).includes('region'));
    const result = getResults(topic, answers);
    assert.ok(result.ids.length, `${topic}/${answers.need} still gives a next step`);
    for (const region of ['darwin', 'alice', 'outside']) {
      assert.deepEqual(getResults(topic, { ...answers, region }), result);
    }
  }
});

test('a full-time member seeking their own medical travel has no NT residence or region question', () => {
  const answers = { need: 'travel', connection: 'serving', role: 'member' };
  for (const region of [undefined, 'darwin', 'alice', 'outside']) {
    const state = { ...answers, region, ntResidence: 'no' };
    const ids = questionIds('care', state);
    assert.ok(!ids.includes('region'));
    assert.ok(!ids.includes('ntResidence'));
    assert.equal(getResults('care', state).ids[0], 'defence-medical-enquiry');
  }
});

test('NT-wide help asks only NT versus elsewhere and preserves each jurisdiction’s next step', () => {
  const cases = [
    ['parenting', { need: 'parenting' }, 'parentline', 'family-advice'],
    ['parenting', { need: 'school', connection: 'former' }, 'nt-school', 'wellbeing-agency'],
    ['money', { need: 'tenancy' }, 'tenancy-nt', 'legal-national'],
    ['work', { need: 'transition', connection: 'serving' }, 'transition', 'transition-national']
  ];
  for (const [topic, answers, ntFirst, outsideFirst] of cases) {
    const region = questionsFor(topic, answers).find(q => q.id === 'region');
    assert.deepEqual(region.options.map(o => o.value), ['nt', 'outside']);
    assert.equal(getResults(topic, { ...answers, region: 'nt' }).ids[0], ntFirst);
    assert.equal(getResults(topic, { ...answers, region: 'outside' }).ids[0], outsideFirst);
  }
});

test('location remains available when it selects a different local clinic', () => {
  const answers = { need: 'feelings', age: 'under18', childAge: '12-17' };
  assert.equal(regionModeFor('mental', answers), 'full');
  assert.equal(getResults('mental', { ...answers, region: 'alice' }).ids[0], 'headspace-alice');
  assert.equal(getResults('mental', { ...answers, region: 'katherine' }).ids[0], 'headspace-katherine');
  assert.equal(getResults('mental', { ...answers, region: 'outside' }).ids[0], 'eheadspace');
});

test('the mental-health first question contains needs, with identity and anonymity chosen separately', () => {
  const need = questionsFor('mental').find(q => q.id === 'need');
  assert.deepEqual(new Set(need.options.map(o => o.value)), new Set([
    'feelings', 'grief', 'practical-loss', 'suicide-loss', 'addiction'
  ]));
  const preferences = preferencesFor('mental', { need: 'grief', age: 'adult' });
  for (const value of ['anonymous', 'lgbtq', 'indigenous', 'men']) {
    assert.ok(preferences.some(p => p.value === value), value);
    assert.ok(!need.options.some(o => o.value === value), value);
  }
});

test('anonymous and LGBTIQA+ preferences can accompany grief support without replacing it', () => {
  const answers = { need: 'grief', age: 'adult', counselling: 'other' };
  const original = getResults('mental', answers);
  const result = getResults('mental', { ...answers, preferences: ['anonymous', 'lgbtq'] });
  assert.equal(original.ids[0], 'griefline');
  assert.deepEqual(result.ids, original.ids);
  assert.equal(result.say, original.say);
  assert.ok(result.preferenceGroups.some(group => group.ids.includes('safe-zone')));
  assert.ok(result.preferenceGroups.some(group => group.ids.includes('qlife')));
});

test('optional support is absent when no preference was selected', () => {
  const answers = { need: 'grief', age: 'adult', counselling: 'other' };
  for (const preferences of [undefined, [], ['unknown-preference']]) {
    const result = getResults('mental', { ...answers, preferences });
    assert.deepEqual(result.preferenceGroups, []);
    assert.equal(result.ids[0], 'griefline');
  }
});

test('under-18 paths do not automatically offer adult men’s counselling, including stale preferences', () => {
  for (const childAge of ['0-4', '5-11', '12-17']) {
    const answers = { need: 'feelings', age: 'under18', childAge, region: 'alice' };
    assert.ok(!preferencesFor('mental', answers).some(p => p.value === 'men'));
    assert.ok(!allIds(getResults('mental', { ...answers, preferences: ['men'] })).includes('mensline'));
  }
});

test('adult men’s counselling is an optional additional contact', () => {
  const answers = { need: 'feelings', age: '18-25', counselling: 'other', region: 'alice' };
  const baseline = getResults('mental', answers);
  const result = getResults('mental', { ...answers, preferences: ['men'] });
  assert.deepEqual(result.ids, baseline.ids);
  assert.ok(result.preferenceGroups.some(group => group.ids.includes('mensline')));
});

test('an Aboriginal person in Alice Springs seeking ongoing local wellbeing support reaches Congress first', () => {
  const answers = { need: 'indigenous', indigenousNeed: 'local', region: 'alice', congressFit: 'yes' };
  assert.ok(questionIds('mental', answers).includes('congressFit'));
  const result = getResults('mental', answers);
  assert.equal(result.ids[0], 'congress-sewb');
  assert.notEqual(result.ids[0], '13yarn');
  const service = services[result.ids[0]];
  assert.ok(service.phone);
  assert.ok(service.sources.some(source => new URL(source).hostname === 'www.caac.org.au'));
});

test('an unconfirmed Congress match clearly offers local referral help instead of labelling crisis support as local care', () => {
  for (const congressFit of ['other', 'no', 'unsure', undefined]) {
    const result = getResults('mental', {
      need: 'indigenous', indigenousNeed: 'local', region: 'alice', congressFit
    });
    assert.equal(result.ids[0], 'healthdirect');
    assert.ok(!allIds(result).includes('congress-sewb'));
    assert.equal(result.noteBefore, true);
    assert.match(result.note, /not verified.*local service/i);
    assert.match(result.note, /local referral/i);
    assert.match(result.say, /ongoing local/i);
  }
});

test('existing Aboriginal-led local services and outside-NT fallback remain appropriate', () => {
  for (const [region, first] of [
    ['darwin', 'danila-dilba'], ['palmerston', 'danila-dilba'], ['katherine', 'wurli-sewb']
  ]) {
    assert.equal(getResults('mental', { need: 'indigenous', indigenousNeed: 'local', region }).ids[0], first);
  }
  const outside = getResults('mental', { need: 'indigenous', indigenousNeed: 'local', region: 'outside' });
  assert.equal(outside.ids[0], 'healthdirect');
  assert.ok(!allIds(outside).some(id => ['congress-sewb', 'danila-dilba', 'wurli-sewb'].includes(id)));
  assert.match(outside.note, /local referral/i);
});

test('recent NT former-member and Reserve families get the correct patient travel contact, not Medicare costs advice', () => {
  const offices = {
    darwin: 'patient-travel-darwin', palmerston: 'patient-travel-darwin',
    alice: 'patient-travel-alice', katherine: 'patient-travel-katherine',
    tennant: 'patient-travel-tennant', gove: 'patient-travel-gove', remote: 'patient-travel-offices'
  };
  for (const connection of ['former', 'reserve']) {
    for (const [region, office] of Object.entries(offices)) {
      const result = getResults('care', { need: 'travel', connection, region, ntResidence: 'no' });
      assert.equal(result.ids[0], office, `${connection}/${region}`);
      assert.ok(!allIds(result).includes('medicare-costs'));
      assert.match(result.note, /six months/i);
      assert.match(result.note, /referral.*eligibility/i);
      assert.match(result.say, /travel for specialist treatment/i);
    }
  }
});

test('a recent arrival receives an eligibility enquiry without a promise of travel funding', () => {
  const result = getResults('care', { need: 'travel', connection: 'former', region: 'alice', ntResidence: 'no' });
  assert.equal(result.noteBefore, true);
  assert.match(result.note, /funding may not apply/i);
  assert.match(result.note, /before booking/i);
  const service = services[result.ids[0]];
  assert.match(service.cost, /funding is not guaranteed/i);
  assert.match(service.access, /when you moved/i);
  assert.ok(service.phone);
  assert.ok(service.sources.some(source => new URL(source).hostname === 'nt.gov.au'));
});

test('full-time members’ partners retain Defence family travel alongside the local eligibility enquiry', () => {
  const answers = { need: 'travel', connection: 'serving', role: 'partner', region: 'katherine', ntResidence: 'no' };
  assert.ok(questionIds('care', answers).includes('region'));
  assert.ok(questionIds('care', answers).includes('ntResidence'));
  const result = getResults('care', answers);
  assert.equal(result.ids[0], 'defence-medical-travel');
  assert.ok(result.ids.includes('patient-travel-katherine'));
  assert.ok(!result.ids.includes('pats-katherine'));
});

test('established NT residents retain regional PATS contacts', () => {
  for (const region of ['darwin', 'palmerston', 'katherine', 'alice', 'tennant', 'gove']) {
    const result = getResults('care', { need: 'travel', connection: 'former', region, ntResidence: 'yes' });
    assert.equal(result.ids[0], `pats-${region}`);
    assert.ok(services[result.ids[0]]);
  }
});

test('outside-NT medical travel does not recommend NT funding or unrelated Medicare advice', () => {
  const answers = { need: 'travel', connection: 'former', region: 'outside' };
  assert.ok(!questionIds('care', answers).includes('ntResidence'));
  const result = getResults('care', answers);
  assert.ok(!allIds(result).some(id => id.startsWith('pats-') || id.startsWith('patient-travel-') || id === 'medicare-costs'));
  assert.match(result.note, /relevant patient travel service/i);
});
