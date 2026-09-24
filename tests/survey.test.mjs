import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

// Exercise the actual respondent definitions without a DOM, network or build step.
const source = readFileSync(new URL('../survey.js', import.meta.url), 'utf8');
const bootstrap = source.lastIndexOf("if (document.body.dataset.view === 'questions')");
assert.ok(bootstrap > 0, 'The survey bootstrap must be identifiable');
const context = vm.createContext({ structuredClone, URL, document: { querySelector: () => null } });
vm.runInContext(`${source.slice(0, bootstrap)}
  globalThis.survey = {
    DOMAINS, SPECIAL_NEEDS, toggleChoice, selectedNeeds, hasSoughtHelp,
    reconcileAnswers, buildSteps, cleanExport, requiredAnswersComplete,
    thankYouResource, thankYouResourceHTML, page, areaPage, areaBarrierField,
    areaQuestionsHTML, period, conditionalVisible, reviewHTML, locationFrame,
    getValue, setValue, consultationRoute, maxTextLength, fieldHTML,
    questionnaireVersion, needsGuardianPermission, guardianPermissionRecord,
    participationRecord, hasValidParticipation, isOutsideSurveyScope,
    setContext(version, answers = {}) {
      state.version = version;
      state.age = version;
      state.answers = answers;
      state.expandedAreas = {};
      return domainList();
    },
    getContext: () => ({ version: state.version, answers: state.answers }),
    setExpanded(need, open) { state.expandedAreas[need] = open; },
    setParticipationContext(age, participation = null, guardianPermission = null) {
      state.age = age;
      state.version = questionnaireVersion(age);
      state.participation = participation;
      state.guardianPermission = guardianPermission;
    },
    librarySections: questionLibrarySections,
  };
`, context, { filename: 'survey.js' });
const survey = context.survey;
// Values created in a VM have different prototypes; compare serialisable values.
const plain = value => JSON.parse(JSON.stringify(value));
const hasOwn = (object, key) => Object.hasOwn(object, key);
const domainsFor = version => survey.setContext(version);
const pageFor = (id, version = 'adult', answers = {}) => {
  survey.setContext(version, answers);
  return plain(survey.page({ id }));
};
const areaBlock = (label = 'Housing') => ({
  received: 'some', additional_support_now: 'no', sources: ['family'],
  barriers: ['cost'], comment: `${label} experience`,
});
const areaFor = (need, version, answers) => pageFor(`area:${need}`, version, answers);
const barrierField = area => area.fields.find(f => f.key.endsWith(':barriers'));
const fieldIds = field => field.options.map(option => option.id);
const stepsFor = (answers, version = 'adult') => {
  const domains = survey.setContext(version, answers);
  return plain(survey.buildSteps(answers, domains, version));
};


test('exclusive answers replace ordinary choices, without mutating previous values', () => {
  for (const exclusive of [SPECIAL(), ['not_sought', 'unsure', 'prefer'], ['no_preference', 'prefer']]) {
    for (const value of exclusive) {
      const previous = ['family', 'community'];
      assert.deepEqual(plain(survey.toggleChoice(previous, value, exclusive)), [value]);
      assert.deepEqual(previous, ['family', 'community']);
      assert.deepEqual(plain(survey.toggleChoice([value], 'family', exclusive)), ['family']);
      assert.deepEqual(plain(survey.toggleChoice([value], value, exclusive)), []);
    }
  }
  assert.deepEqual(plain(survey.toggleChoice(undefined, 'family')), ['family']);
  assert.deepEqual(plain(survey.toggleChoice(['family', 'community'], 'family')), ['community']);
});
function SPECIAL() { return ['none', 'unsure', 'prefer']; }


test('need and source classifiers preserve explicit non-answers rather than treating them as experience', () => {
  const domains = domainsFor('adult');
  assert.deepEqual(plain(survey.selectedNeeds({ needs: ['housing', 'none', 'unsure', 'prefer', 'unknown', 'other_need'] }, domains)), ['housing', 'other_need']);
  for (const needs of [undefined, '', 'housing', [], ['none'], ['unsure'], ['prefer']]) {
    assert.deepEqual(plain(survey.selectedNeeds({ needs }, domains)), []);
  }
  for (const sources of [undefined, [], ['not_sought'], ['unsure'], ['prefer']]) {
    assert.equal(survey.hasSoughtHelp({ sources }), false);
  }
  assert.equal(survey.hasSoughtHelp({ sources: ['family'] }), true);
});


test('main routes select needs once, finish each selected area, and put background questions near the end', () => {
  for (const [version, domainCount] of [['adult', 17], ['youth', 8], ['child', 8]]) {
    assert.equal(survey.DOMAINS[version].length, domainCount, 'Accepted options remain available');
    const ids = plain(survey.DOMAINS[version]).map(d => d.id);
    for (const count of [0, 2, 5]) {
      const needs = ids.slice(0, count);
      const steps = stepsFor({ serving_nt: 'yes', needs }, version);
      assert.deepEqual(steps.map(s => s.id), [
        'connection', 'needs', ...needs.map(id => `area:${id}`),
        ...(version === 'child' ? [] : ['delivery']), 'anything', 'place', 'review',
      ]);
      assert.equal(steps.length, (version === 'child' ? 5 : 6) + count);
      assert.deepEqual(steps.filter(s => s.need).map(s => s.need), needs);
      assert.equal(new Set(steps.map(s => s.id)).size, steps.length);
      assert.equal(steps.filter(s => s.id === 'needs').length, 1);
      assert.equal(steps.some(s => /priority|adequacy|impact|strengths|detail:/.test(s.id)), false);
    }
  }
});


test('people reporting no needs can still give general preferences and suggestions', () => {
  for (const version of ['adult', 'youth']) {
    for (const needs of [undefined, [], ['none'], ['unsure'], ['prefer']]) {
      const answers = { serving_nt: 'recent', needs, delivery: ['phone'], times: ['weekend'], anything: 'Keep the local group' };
      assert.deepEqual(stepsFor(answers, version).map(s => s.id), ['connection', 'needs', 'delivery', 'anything', 'place', 'review']);
      const result = plain(survey.cleanExport(answers, version, domainsFor(version)));
      assert.deepEqual(result.answers.delivery, ['phone']);
      assert.deepEqual(result.answers.times, ['weekend']);
      assert.equal(result.answers.anything, 'Keep the local group');
      assert.deepEqual(result.answers.areas, {});
    }
  }
});


test('past receipt and extra support now are independent, including resolved past gaps and new needs', () => {
  const answers = { serving_nt: 'yes', needs: ['housing', 'childcare'], areas: {
    housing: { received: 'some', additional_support_now: 'no', sources: ['community'], barriers: ['wait'], comment: 'Resolved now, but the waiting period was difficult.' },
    childcare: { received: 'enough', additional_support_now: 'yes', sources: ['family'], comment: 'A new roster needs different care.' },
  } };
  const domains = survey.setContext('adult', answers);
  for (const id of answers.needs) {
    const area = survey.areaPage(id);
    const core = area.fields.filter(f => !f.optional_detail);
    assert.deepEqual(plain(core).map(f => f.key), [`areas:${id}:received`, `areas:${id}:additional_support_now`]);
    assert.deepEqual(plain(fieldIds(core[0])), ['enough', 'some', 'none', 'unsure', 'prefer']);
    assert.deepEqual(plain(fieldIds(core[1])), ['yes', 'no', 'unsure', 'prefer']);
    assert.equal(area.fields.filter(f => f.optional_detail).length, 3);
    assert.equal(survey.conditionalVisible(area.fields.find(f => f.key.endsWith(':barriers'))), true);
  }
  const result = plain(survey.cleanExport(answers, 'adult', domains));
  assert.deepEqual(result.answers.areas, answers.areas);
  survey.setValue('areas:housing:additional_support_now', 'yes');
  survey.reconcileAnswers(answers, 'areas:housing:additional_support_now', domains, 'no');
  assert.equal(answers.areas.housing.received, 'some');
  assert.deepEqual(answers.areas.housing.barriers, ['wait']);
  survey.setValue('areas:childcare:received', 'none');
  survey.reconcileAnswers(answers, 'areas:childcare:received', domains, 'enough');
  assert.equal(answers.areas.childcare.additional_support_now, 'yes');
  assert.equal(answers.areas.childcare.comment, 'A new roster needs different care.');
});


test('optional detail is available for every core answer, including resolved or fully supported needs', () => {
  for (const received of [undefined, 'enough', 'some', 'none', 'unsure', 'prefer']) {
    for (const additional_support_now of [undefined, 'yes', 'no', 'unsure', 'prefer']) {
      const answers = { needs: ['housing'], areas: { housing: { received, additional_support_now } } };
      survey.setContext('adult', answers);
      const area = survey.areaPage('housing');
      const html = survey.areaQuestionsHTML(area, 'housing');
      assert.match(html, /<details class="area-details" data-area-details="housing"\s*>/);
      assert.match(html, /More about this experience <span>\(optional\)<\/span>/);
      assert.match(html, /name="areas:housing:sources"/);
      assert.match(html, /name="areas:housing:comment"/);
      const coreEnd = html.indexOf('<details');
      assert.ok(html.indexOf('areas:housing:received') < coreEnd);
      assert.ok(html.indexOf('areas:housing:additional_support_now') < coreEnd);
      assert.ok(html.indexOf('areas:housing:sources') > coreEnd);
    }
  }
});


test('opening or collapsing optional detail does not delete answers or enter the export', () => {
  const answers = { needs: ['housing'], areas: { housing: areaBlock() } };
  const domains = survey.setContext('adult', answers);
  const original = structuredClone(answers);
  const exportBefore = plain(survey.cleanExport(answers, 'adult', domains));
  for (const open of [true, false, true, false]) {
    survey.setExpanded('housing', open);
    const html = survey.areaQuestionsHTML(survey.areaPage('housing'), 'housing');
    assert.equal(/data-area-details="housing" open>/.test(html), open);
    assert.match(html, /Housing experience/);
    assert.deepEqual(answers, original);
    assert.deepEqual(plain(survey.cleanExport(answers, 'adult', domains)), exportBefore);
  }
  assert.doesNotMatch(JSON.stringify(exportBefore), /expandedAreas|expanded|disclosure/);
});


test('changing the current-support answer never changes the meaning of an already written comment', () => {
  for (const version of ['adult', 'youth', 'child']) {
    const id = survey.DOMAINS[version][0].id;
    const answers = { needs: [id], areas: { [id]: { additional_support_now: 'yes', comment: 'An experience worth keeping' } } };
    survey.setContext(version, answers);
    const originalPrompt = survey.areaPage(id).fields.find(f => f.key.endsWith(':comment')).label;
    for (const value of ['no', 'unsure', 'prefer', undefined]) {
      survey.setValue(`areas:${id}:additional_support_now`, value);
      survey.reconcileAnswers(answers, `areas:${id}:additional_support_now`, domainsFor(version));
      survey.setContext(version, answers);
      assert.equal(survey.areaPage(id).fields.find(f => f.key.endsWith(':comment')).label, originalPrompt);
      assert.equal(answers.areas[id].comment, 'An experience worth keeping');
    }
  }
});


test('removing, reordering and re-adding needs preserves only the correct area answers and general preferences', () => {
  const domains = domainsFor('adult');
  const answers = { needs: ['transport', 'housing'], needs_other: 'Stale topic', areas: {
    housing: areaBlock(), transport: areaBlock('Transport'), other_need: areaBlock('Other'),
  }, delivery: ['phone'], times: ['weekend'], anything: 'Keep this' };
  survey.reconcileAnswers(answers, 'needs', domains);
  assert.deepEqual(plain(answers.areas), { housing: areaBlock(), transport: areaBlock('Transport') });
  assert.equal(hasOwn(answers, 'needs_other'), false);
  answers.needs = ['housing', 'transport'];
  survey.reconcileAnswers(answers, 'needs', domains);
  assert.deepEqual(plain(answers.areas), { housing: areaBlock(), transport: areaBlock('Transport') });
  answers.needs = ['transport'];
  survey.reconcileAnswers(answers, 'needs', domains);
  assert.deepEqual(plain(answers.areas), { transport: areaBlock('Transport') });
  answers.needs = ['transport', 'housing'];
  survey.reconcileAnswers(answers, 'needs', domains);
  assert.equal(hasOwn(answers.areas, 'housing'), false, 'A re-added area needs fresh answers');
  assert.deepEqual(plain(survey.cleanExport(answers, 'adult', domains)).answers.areas, { transport: areaBlock('Transport'), housing: {} });
  for (const needs of [[], ['none'], ['unsure'], ['prefer']]) {
    answers.needs = needs;
    survey.reconcileAnswers(answers, 'needs', domains);
    assert.deepEqual(plain(answers.areas), {});
    assert.deepEqual(answers.delivery, ['phone']);
    assert.deepEqual(answers.times, ['weekend']);
    assert.equal(answers.anything, 'Keep this');
  }
});


test('editing the Other description clears only that area, while keeping the new description and preferences', () => {
  const domains = domainsFor('adult');
  const answers = { needs: ['housing', 'other_need'], needs_other: 'Changed topic', areas: { housing: areaBlock(), other_need: areaBlock('Old topic') }, delivery: ['phone'], times: ['weekend'] };
  survey.reconcileAnswers(answers, 'needs_other', domains);
  assert.deepEqual(plain(answers.areas), { housing: areaBlock() });
  assert.equal(answers.needs_other, 'Changed topic');
  assert.deepEqual(answers.times, ['weekend']);
  const other = areaFor('other_need', 'adult', answers);
  assert.equal(other.title, 'Changed topic');
  assert.deepEqual(plain(survey.cleanExport(answers, 'adult', domains)).answers.areas, { housing: areaBlock(), other_need: {} });
});


test('changing a source clears only its own area’s barriers and preserves both core answers and comments', () => {
  const answers = { needs: ['housing', 'transport'], areas: { housing: areaBlock(), transport: areaBlock('Transport') } };
  const domains = survey.setContext('adult', answers);
  survey.setValue('areas:housing:sources', ['not_sought']);
  survey.reconcileAnswers(answers, 'areas:housing:sources', domains);
  assert.deepEqual(plain(survey.getValue('areas:housing:sources')), ['not_sought']);
  assert.equal(hasOwn(answers.areas.housing, 'barriers'), false);
  assert.equal(answers.areas.housing.received, 'some');
  assert.equal(answers.areas.housing.additional_support_now, 'no');
  assert.equal(answers.areas.housing.comment, 'Housing experience');
  assert.deepEqual(answers.areas.transport, areaBlock('Transport'));
  survey.setValue('areas:transport:comment', 'Transport only');
  assert.equal(survey.getValue('areas:housing:comment'), 'Housing experience');
  assert.equal(survey.getValue('areas:transport:comment'), 'Transport only');
  assert.equal(hasOwn(answers, 'sources'), false);
});


test('actual barriers and reasons for not seeking help stay separate; blank or uncertain sources imply neither', () => {
  const answers = { needs: ['housing', 'transport'], areas: {
    housing: { received: 'enough', additional_support_now: 'no', sources: ['community'] },
    transport: { sources: ['not_sought'] },
  } };
  const actual = barrierField(areaFor('housing', 'adult', answers));
  assert.equal(survey.conditionalVisible(actual), true, 'Resolved needs can describe historical barriers');
  assert.ok(fieldIds(actual).includes('eligibility_refused'));
  assert.equal(fieldIds(actual).includes('eligibility_concern'), false);
  const anticipated = barrierField(areaFor('transport', 'adult', answers));
  assert.equal(survey.conditionalVisible(anticipated), true);
  assert.ok(fieldIds(anticipated).includes('eligibility_concern'));
  assert.equal(fieldIds(anticipated).includes('eligibility_refused'), false);
  for (const sources of [undefined, [], ['unsure'], ['prefer']]) {
    answers.areas.transport = { sources, barriers: ['OLD_BARRIER_SENTINEL'] };
    const hidden = barrierField(areaFor('transport', 'adult', answers));
    assert.equal(survey.conditionalVisible(hidden), false);
    const result = plain(survey.cleanExport(answers, 'adult', domainsFor('adult')));
    assert.equal(hasOwn(result.answers.areas.transport, 'barriers'), false);
    assert.deepEqual(result.answers.areas.housing.sources, ['community']);
    survey.setContext('adult', answers);
    assert.doesNotMatch(survey.reviewHTML(), /OLD_BARRIER_SENTINEL/);
  }
  const youth = barrierField(areaFor('school_learning', 'youth', { needs: ['school_learning'], areas: { school_learning: { sources: ['school'] } } }));
  assert.ok(fieldIds(youth).includes('no_trusted_person'));
  assert.equal(fieldIds(youth).includes('eligibility_refused'), false);
});


test('cohort changes clear experience answers but preserve connection and optional background', () => {
  const domains = domainsFor('adult');
  const experienceKeys = ['needs', 'needs_other', 'areas', 'delivery', 'times', 'anything', 'earlier_experience'];
  for (const previous of ['yes', 'recent', 'earlier', 'unsure']) {
    for (const serving_nt of ['yes', 'recent', 'earlier', 'unsure'].filter(v => v !== previous)) {
      const answers = { roles: ['partner'], force: 'adf', region: 'outside_au', time_nt: 'over3', serving_nt, ...Object.fromEntries(experienceKeys.map(key => [key, 'PREVIOUS_COHORT_SENTINEL'])) };
      survey.reconcileAnswers(answers, 'serving_nt', domains, previous);
      for (const key of experienceKeys) assert.equal(hasOwn(answers, key), false, `${previous} to ${serving_nt}: ${key}`);
      assert.deepEqual(answers.roles, ['partner']);
      assert.equal(answers.region, 'outside_au');
      assert.equal(answers.time_nt, 'over3');
    }
  }
  const unchanged = { serving_nt: 'recent', needs: ['housing'], areas: { housing: areaBlock() } };
  survey.reconcileAnswers(unchanged, 'serving_nt', domains, 'recent');
  assert.deepEqual(unchanged.areas, { housing: areaBlock() });
});


test('residence edits do not erase experience answers or exclude relatives living outside the NT', () => {
  const domains = domainsFor('adult');
  for (const previous of ['darwin', 'outside_au', 'outside_overseas', 'prefer', '', undefined]) {
    for (const region of ['katherine', 'outside_au', 'prefer', '', undefined]) {
      const answers = { roles: ['partner'], serving_nt: 'recent', region, time_nt: 'over3', needs: ['housing'], areas: { housing: areaBlock() }, anything: 'A useful point' };
      const original = structuredClone(answers);
      survey.reconcileAnswers(answers, 'region', domains, previous);
      assert.deepEqual(answers, original);
      assert.equal(survey.isOutsideSurveyScope(answers), false);
    }
  }
  assert.equal(survey.isOutsideSurveyScope({ roles: ['none'], serving_nt: 'yes' }), true);
  assert.equal(survey.isOutsideSurveyScope({ roles: ['partner'], serving_nt: 'no' }), true);
});


test('general delivery changes clear times only when no synchronous format remains', () => {
  const domains = domainsFor('adult');
  for (const delivery of [['text'], ['information'], ['referral'], ['not_wanted'], ['unsure'], ['no_preference'], ['prefer'], []]) {
    const answers = { delivery, times: ['weekend'], areas: { housing: areaBlock() } };
    survey.reconcileAnswers(answers, 'delivery', domains);
    assert.equal(hasOwn(answers, 'times'), false);
    assert.deepEqual(answers.areas, { housing: areaBlock() });
  }
  for (const delivery of [['phone'], ['video'], ['group'], ['one_to_one'], ['information', 'phone']]) {
    const answers = { delivery, times: ['weekend'] };
    survey.reconcileAnswers(answers, 'delivery', domains);
    assert.deepEqual(answers.times, ['weekend']);
  }
  const p = pageFor('delivery');
  assert.equal(p.title, 'Getting information and advice');
  for (const value of ['not_wanted', 'unsure', 'no_preference', 'prefer']) {
    assert.deepEqual(plain(survey.toggleChoice(['phone', 'referral'], value, p.fields[0].exclusive)), [value]);
  }
});


test('schema 4 exports only selected-area measures and never migrates old current-only or combined responses', () => {
  const domains = domainsFor('adult');
  const legacy = { priority: ['transport'], adequacy: { housing: 'enough' }, follow_up: { housing: { impact: 'a_lot', help: ['family'], change: 'OLD_CURRENT_ONLY' } }, strengths: 'OLD_STRENGTH', impact: 'a_lot', help: ['family'], change: 'OLD_COMBINED', another_priority: 'OLD_OTHER', caring: ['under18'], financial_dependence: 'yes', care_dependence: 'yes', expandedAreas: { housing: true } };
  const answers = { ...legacy, serving_nt: 'recent', needs: ['housing', 'childcare'], areas: { housing: { ...areaBlock(), impact: 'a_lot', help: ['military'], extra: 'DO_NOT_COPY' }, transport: areaBlock('STALE') }, delivery: ['phone'], times: ['weekend'] };
  const original = structuredClone(answers);
  const result = plain(survey.cleanExport(answers, 'adult', domains));
  assert.equal(result.schema_version, '4.0');
  assert.equal(result.measurement_scope, 'past_support_and_current_requests_by_area');
  assert.equal(result.details_optional, true);
  assert.equal(result.consultation_route, 'recent_nt');
  assert.equal(result.recall_months, 12);
  assert.equal(result.storage, 'downloaded_by_respondent; not submitted');
  assert.deepEqual(result.answers.areas, { housing: areaBlock(), childcare: {} });
  for (const key of Object.keys(legacy)) assert.equal(hasOwn(result.answers, key), false, key);
  assert.deepEqual(answers, original);
  const oldOnly = plain(survey.cleanExport({ ...legacy, needs: ['housing'] }, 'adult', domains));
  assert.deepEqual(oldOnly.answers.areas, { housing: {} });
  assert.doesNotMatch(JSON.stringify(oldOnly), /OLD_|DO_NOT_COPY/);
});


test('exports preserve skipped, cleared, No, none, unsure and declined as distinct answers', () => {
  const domains = domainsFor('adult');
  for (const needs of [['none'], ['unsure'], ['prefer'], []]) {
    const result = plain(survey.cleanExport({ needs, areas: { housing: areaBlock() }, delivery: ['phone'] }, 'adult', domains));
    assert.deepEqual(result.answers.needs, needs);
    assert.deepEqual(result.answers.areas, {});
    assert.deepEqual(result.answers.delivery, ['phone']);
  }
  assert.equal(hasOwn(survey.cleanExport({}, 'adult', domains).answers, 'needs'), false);
  const all = { needs: ['housing', 'transport', 'childcare', 'physical_health', 'emotional_wellbeing'], areas: {
    housing: { received: 'none', additional_support_now: 'no' },
    transport: { received: 'unsure', additional_support_now: 'unsure' },
    childcare: { received: 'prefer', additional_support_now: 'prefer' },
    emotional_wellbeing: { received: 'enough', sources: [], comment: '' },
  } };
  const areas = plain(survey.cleanExport(all, 'adult', domains)).answers.areas;
  assert.deepEqual(areas, { ...all.areas, physical_health: {} });
  assert.equal(hasOwn(areas.physical_health, 'additional_support_now'), false, 'Blank must never become No');
  assert.equal(hasOwn(areas.physical_health, 'barriers'), false, 'Not opening detail must never become no barrier');
});


test('exports exclude off-route background and old recent-needs data from the historical route', () => {
  for (const version of ['adult', 'youth', 'child']) {
    const answers = { roles: ['partner'], serving_nt: 'earlier', earlier_experience: 'An older experience', needs: ['housing'], areas: { housing: areaBlock() }, delivery: ['phone'], times: ['weekend'], anything: 'Stale', region: 'darwin', force: 'adf', time_nt: 'over3' };
    const original = structuredClone(answers);
    assert.deepEqual(stepsFor(answers, version).map(s => s.id), ['connection', 'earlier', 'review']);
    const result = plain(survey.cleanExport(answers, version, domainsFor(version)));
    assert.equal(result.consultation_route, 'earlier_experience');
    assert.equal(result.recall_months, null);
    assert.deepEqual(result.answers, { roles: ['partner'], serving_nt: 'earlier', earlier_experience: 'An older experience' });
    assert.deepEqual(answers, original);
  }
});


test('the same recall period frames the checklist, support received and sources, across all locations', () => {
  for (const [version, months, pattern] of [['adult', 12, /past 12 months/], ['youth', 12, /past 12 months/], ['child', 3, /past three months/]]) {
    const id = survey.DOMAINS[version][0].id;
    for (const serving_nt of ['yes', 'recent', 'unsure']) {
      for (const region of ['darwin', 'outside_au', 'outside_overseas', 'prefer', '', undefined]) {
        const answers = { serving_nt, region, needs: [id] };
        assert.match(pageFor('needs', version, answers).fields[0].label, pattern);
        const area = areaFor(id, version, answers);
        assert.match(area.fields[0].label, pattern);
        assert.match(area.fields.find(f => f.key.endsWith(':sources')).label, pattern);
        assert.equal(area.fields.some(f => /impact|four weeks/.test(f.key + f.label)), false);
        assert.equal(survey.cleanExport(answers, version, domainsFor(version)).recall_months, months);
      }
    }
  }
});


test('optional background is late, does not repeat connection and permits never-residents', () => {
  for (const version of ['adult', 'youth', 'child']) {
    const connection = pageFor('connection', version);
    assert.deepEqual(connection.fields.map(f => f.key), ['roles', 'serving_nt']);
    assert.deepEqual(fieldIds(connection.fields[1]), ['yes', 'recent', 'earlier', 'no', 'unsure']);
    const place = pageFor('place', version);
    assert.deepEqual(place.fields.map(f => f.key), ['region', 'time_nt', 'force', ...(version === 'adult' ? [] : ['assistance'])]);
    assert.ok(place.fields.every(f => !f.required));
    const residence = place.fields.find(f => f.key === 'region');
    assert.ok(fieldIds(residence).includes('outside_overseas'));
    const duration = place.fields.find(f => f.key === 'time_nt');
    assert.equal(survey.conditionalVisible(duration), true);
    assert.deepEqual(fieldIds(duration), ['never', 'under3', '3to12', '1to3', 'over3', 'unsure', 'prefer']);
    assert.match(duration.hint, /current or most recent stay/);
    const labels = Object.fromEntries(duration.options.map(o => [o.id, o.label]));
    assert.match(labels.under3, /Less than 3 months/);
    assert.match(labels['3to12'], /3 months to less than 1 year/);
    assert.match(labels['1to3'], /1 year to less than 3 years/);
    assert.match(labels.over3, /3 years or more/);
    assert.match(labels.never, /not lived in the NT/);
  }
});


test('every field and option ID remains unique even when every area is selected', () => {
  for (const version of ['adult', 'youth', 'child']) {
    const domains = domainsFor(version);
    const needs = plain(domains).map(d => d.id);
    const answers = { serving_nt: 'recent', roles: ['child'], needs };
    survey.setContext(version, answers);
    const keys = [];
    for (const step of survey.buildSteps(answers, domains, version)) {
      const p = survey.page(step);
      assert.ok(p.title);
      assert.equal(typeof p.intro, 'string');
      for (const field of p.fields) {
        keys.push(field.key);
        assert.equal(new Set(fieldIds(field)).size, field.options.length, `${version}: ${field.key}`);
      }
    }
    assert.equal(new Set(keys).size, keys.length, version);
  }
});


test('review groups each area separately and returns edits to its own core or optional detail', () => {
  const answers = { serving_nt: 'yes', needs: ['housing', 'transport'], areas: {
    housing: { received: 'some', additional_support_now: 'no', sources: ['family'], comment: 'HOUSING_ONLY_SENTINEL' },
    transport: { received: 'enough', additional_support_now: 'yes', sources: ['not_sought'], comment: 'TRANSPORT_ONLY_SENTINEL' },
  } };
  survey.setContext('adult', answers);
  const sections = survey.reviewHTML().split('<section class="review-section">').slice(1);
  const housing = sections.find(section => section.includes('HOUSING_ONLY_SENTINEL'));
  const transport = sections.find(section => section.includes('TRANSPORT_ONLY_SENTINEL'));
  assert.ok(housing);
  assert.ok(transport);
  assert.match(housing, /<h2>Housing<\/h2>/);
  assert.match(housing, /data-edit="area:housing" data-detail="false"/);
  assert.match(housing, /data-edit="area:housing" data-detail="true"/);
  assert.doesNotMatch(housing, /TRANSPORT_ONLY_SENTINEL/);
  assert.match(transport, /<h2>Getting around<\/h2>/);
  assert.match(transport, /data-edit="area:transport"/);
  assert.doesNotMatch(transport, /HOUSING_ONLY_SENTINEL/);
});


test('review does not present unopened optional detail as no barrier or no support requested', () => {
  survey.setContext('adult', { needs: ['housing'], areas: { housing: { received: 'enough' } } });
  const review = survey.reviewHTML();
  assert.match(review, /No additional details provided/);
  assert.match(review, /Not answered/);
  assert.doesNotMatch(review, /Nothing made it harder|data-edit="area:housing" data-detail="true"/);
});


test('the library shares the actual area fields, both barrier variants and the new sequence', () => {
  for (const version of ['adult', 'youth', 'child']) {
    const first = survey.DOMAINS[version][0].id;
    for (const location of ['nt', 'outside', 'unspecified']) {
      const sections = plain(survey.librarySections(version, location));
      assert.deepEqual(sections.map(s => s.id), ['connection', 'needs', 'area', ...(version === 'child' ? [] : ['delivery']), 'anything', 'place', 'earlier']);
      const area = sections.find(s => s.id === 'area');
      assert.deepEqual(area.fields.map(f => f.key), ['received', 'additional_support_now', 'sources', 'comment'].map(key => `areas:${first}:${key}`));
      assert.deepEqual(area.variants.map(v => v.id), ['sought', 'not-sought']);
      const answers = { serving_nt: 'yes', needs: [first], areas: { [first]: { sources: ['family'] } } };
      const live = areaFor(first, version, answers);
      assert.deepEqual(area.fields, live.fields.filter(f => !f.key.endsWith(':barriers')));
      assert.deepEqual(area.variants[0].fields, [barrierField(live)]);
      answers.areas[first].sources = ['not_sought'];
      assert.deepEqual(area.variants[1].fields, [barrierField(areaFor(first, version, answers))]);
    }
  }
});


test('library rendering restores the original respondent and preserves all answer values', () => {
  const answers = { region: 'outside_overseas', serving_nt: 'recent', needs: ['feelings'], areas: { feelings: { received: 'some', sources: ['family'], comment: 'My own answer' } }, anything: 'My final comment' };
  survey.setContext('child', answers);
  const original = structuredClone(answers);
  const review = survey.reviewHTML();
  for (const version of ['adult', 'youth', 'child']) {
    for (const location of ['nt', 'outside', 'unspecified']) {
      survey.librarySections(version, location);
      assert.equal(survey.getContext().version, 'child');
      assert.equal(survey.getContext().answers, answers);
      assert.deepEqual(answers, original);
      assert.equal(survey.reviewHTML(), review);
    }
  }
});


test('connection blanks block Continue; every substantive and background question remains optional', () => {
  for (const version of ['adult', 'youth', 'child']) {
    const connection = pageFor('connection', version);
    for (const answers of [{}, { roles: [] }, { roles: ['child'] }, { serving_nt: 'recent' }]) {
      assert.equal(survey.requiredAnswersComplete(connection.fields, answers), false);
    }
    for (const serving_nt of ['yes', 'recent', 'earlier', 'unsure']) {
      assert.equal(survey.requiredAnswersComplete(connection.fields, { roles: ['child'], serving_nt }), true);
    }
    const id = survey.DOMAINS[version][0].id;
    const answers = { serving_nt: 'yes', needs: [id] };
    const domains = survey.setContext(version, answers);
    for (const step of survey.buildSteps(answers, domains, version).filter(step => step.id !== 'connection')) {
      const p = survey.page(step);
      assert.equal(survey.requiredAnswersComplete(p.fields.filter(survey.conditionalVisible), {}), true, `${version}: ${step.id}`);
    }
    assert.equal(survey.requiredAnswersComplete(pageFor('earlier', version).fields, {}), true);
  }
});


test('long-answer limits allow fuller responses without counters competing with empty fields', () => {
  for (const [version, max] of [['adult', 5000], ['youth', 5000], ['child', 1500]]) {
    survey.setContext(version, {});
    const f = survey.page({ id: 'anything' }).fields[0];
    assert.equal(survey.maxTextLength(version), max);
    assert.ok(survey.fieldHTML(f).includes(`maxlength="${max}"`));
    assert.match(survey.fieldHTML(f), /data-counter="anything" hidden/);
    survey.setValue('anything', 'x'.repeat(Math.ceil(max * .8)));
    assert.doesNotMatch(survey.fieldHTML(f), /data-counter="anything" hidden/);
    assert.ok(survey.fieldHTML(f).includes(`${max - Math.ceil(max * .8)} characters remaining`));
  }
});

test('age choices select the intended language and permission routes', () => {
  for (const [age, version, permissionRequired] of [
    ['adult', 'adult', false],
    ['youth_older', 'youth', false],
    ['youth_younger', 'youth', true],
    ['child', 'child', true],
    ['young', 'child', true],
  ]) {
    assert.equal(survey.questionnaireVersion(age), version, age);
    assert.equal(survey.needsGuardianPermission(age), permissionRequired, age);
    const permission = survey.guardianPermissionRecord(age, true);
    if (permissionRequired) {
      assert.equal(permission.age_path, age);
      assert.equal(permission.kind, 'parent_guardian_permission');
      assert.equal(permission.agreed, true);
    } else {
      assert.equal(permission, null, 'Adult and older youth routes do not generate guardian permission');
    }
    assert.equal(survey.guardianPermissionRecord(age, false), null, 'Permission is never inferred');
  }
});

test('under-15 participation needs both age-matched guardian permission and the child’s own agreement', () => {
  for (const age of ['youth_younger', 'child']) {
    const permission = survey.guardianPermissionRecord(age, true);
    assert.equal(survey.participationRecord(age, true), null, age);
    assert.equal(survey.participationRecord(age, true, { ...permission, agreed: false }), null, age);
    assert.equal(survey.participationRecord(age, false, permission), null, 'Guardian permission cannot replace assent');
    for (const otherAge of ['youth_younger', 'child', 'young'].filter(value => value !== age)) {
      assert.equal(survey.participationRecord(age, true, survey.guardianPermissionRecord(otherAge, true)), null, `${otherAge} permission cannot authorise ${age}`);
    }
    const participation = survey.participationRecord(age, true, permission);
    assert.equal(participation.age_path, age);
    assert.equal(participation.kind, 'assent');
    assert.equal(participation.agreed, true);
    assert.deepEqual(plain(participation.guardian_permission), plain(permission));
  }
});

test('adult and older youth consent is explicit, while under-7s do not create a questionnaire response', () => {
  for (const age of ['adult', 'youth_older']) {
    assert.equal(survey.participationRecord(age, false), null);
    const participation = survey.participationRecord(age, true);
    assert.equal(participation.kind, 'consent');
    assert.equal(participation.age_path, age);
    assert.equal(participation.guardian_permission, null);
    survey.setParticipationContext(age, participation);
    assert.equal(survey.hasValidParticipation(), true, age);
  }
  for (const age of [null, undefined, '', 'youth', 'unknown', 'young']) {
    assert.equal(survey.participationRecord(age, true, survey.guardianPermissionRecord(age, true)), null, String(age));
  }
});

test('the questionnaire gate rejects missing, withdrawn or stale-age participation', () => {
  for (const age of ['adult', 'youth_older', 'youth_younger', 'child']) {
    const permission = survey.guardianPermissionRecord(age, true);
    const participation = survey.participationRecord(age, true, permission);
    survey.setParticipationContext(age, participation, permission);
    assert.equal(survey.hasValidParticipation(), true, age);
    survey.setParticipationContext(age, null, permission);
    assert.equal(survey.hasValidParticipation(), false, 'Permission alone cannot open the questionnaire');
    survey.setParticipationContext(age, { ...participation, agreed: false }, permission);
    assert.equal(survey.hasValidParticipation(), false, 'Withdrawing agreement closes the questionnaire');
    for (const otherAge of ['adult', 'youth_older', 'youth_younger', 'child'].filter(value => value !== age)) {
      survey.setParticipationContext(otherAge, participation, survey.guardianPermissionRecord(otherAge, true));
      assert.equal(survey.hasValidParticipation(), false, `${age} agreement cannot be reused for ${otherAge}`);
    }
    if (survey.needsGuardianPermission(age)) {
      survey.setParticipationContext(age, participation);
      assert.equal(survey.hasValidParticipation(), false, 'Clearing permission invalidates existing assent');
      survey.setParticipationContext(age, participation, { ...permission, agreed: false });
      assert.equal(survey.hasValidParticipation(), false, 'Withdrawn permission invalidates existing assent');
      survey.setParticipationContext(age, participation, survey.guardianPermissionRecord(age === 'child' ? 'youth_younger' : 'child', true));
      assert.equal(survey.hasValidParticipation(), false, 'Permission must match the current age route');
    }
  }
});

test('the free-resource link accepts HTTPS only, escapes its title and never includes survey answers', () => {
  const url = 'https://files.example.org/defence-families/guide.pdf?download=1';
  const config = { title: 'A guide <for families> & friends', url };
  survey.setContext('adult', { roles: ['partner'], change: 'PRIVATE_ANSWER_SENTINEL', priority: ['housing'], anything: 'PRIVATE_COMMENT_SENTINEL' });
  assert.deepEqual(plain(survey.thankYouResource(config)), config);
  const html = survey.thankYouResourceHTML(config);
  assert.match(html, /A guide &lt;for families&gt; &amp; friends/);
  assert.ok(html.includes(`href="${url}"`), 'The link is exactly the configured resource URL');
  assert.match(html, /rel="noopener noreferrer"/);
  assert.match(html, /referrerpolicy="no-referrer"/);
  assert.doesNotMatch(html, /PRIVATE_ANSWER_SENTINEL|PRIVATE_COMMENT_SENTINEL/);
  assert.doesNotMatch(html, /[?&](answers|respondent|response|email|contact|token)=/);
});

test('an unconfigured or invalid free-resource URL never creates a fake or unsafe link', () => {
  for (const url of [undefined, '', '#', '/resource.pdf', 'not a URL', 'http://files.example.org/guide.pdf', 'javascript:alert(1)', 'data:text/html,hello', 'https://name:password@files.example.org/guide.pdf']) {
    const result = plain(survey.thankYouResource({ url }));
    assert.equal(result.url, '', String(url));
    const html = survey.thankYouResourceHTML({ url });
    assert.doesNotMatch(html, /<a\b|href=/, String(url));
    assert.match(html, /<button[^>]* disabled>/);
    assert.match(html, /Available soon/);
  }
  const configContext = vm.createContext({ window: {} });
  vm.runInContext(readFileSync(new URL('../thank-you-resource.js', import.meta.url), 'utf8'), configContext);
  const configured = configContext.window.SURVEY_THANK_YOU_RESOURCE;
  assert.equal(configured.url, '', 'The team has not supplied the resource URL yet');
  assert.equal(Object.isFrozen(configured), true);
});
