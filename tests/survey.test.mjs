import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

// Exercise the actual respondent definitions without a DOM, network or build step.
const source = readFileSync(new URL('../survey.js', import.meta.url), 'utf8');
const bootstrap = source.lastIndexOf("if (document.body.dataset.view === 'questions')");
assert.ok(bootstrap > 0, 'The survey bootstrap must be identifiable');
function nodeStub() {
  const children = new Map();
  const lists = new Map();
  return { innerHTML: '', checked: false, disabled: false, focus() {},
    querySelector(selector) {
      if (!children.has(selector)) children.set(selector, nodeStub());
      return children.get(selector);
    },
    querySelectorAll(selector) { return lists.get(selector) || []; },
    setList(selector, nodes) { lists.set(selector, nodes); },
    addEventListener(type, callback) { this[`on${type}`] = callback; },
  };
}
const mainStub = nodeStub();
const context = vm.createContext({ structuredClone, URL, document: { querySelector: () => mainStub }, window: { scrollTo() {} } });
vm.runInContext(readFileSync(new URL('../geography.js', import.meta.url), 'utf8'), context);
vm.runInContext(`${source.slice(0, bootstrap)}
  globalThis.survey = {
    DOMAINS, SPECIAL_NEEDS, toggleChoice, selectedNeeds, selectedFutureNeeds, selectedDetailNeeds, hasNeedSelection, hasSoughtHelp,
    reconcileAnswers, buildSteps, cleanExport, requiredAnswersComplete,
    selectedFocusNeed, detailedNeeds,
    thankYouResource, thankYouResourceHTML, contactLinkHTML, page, areaPage, areaBarrierField,
    areaQuestionsHTML, period, conditionalVisible, reviewHTML, locationFrame, suburbChoice, suburbs,
    getValue, setValue, consultationRoute, residenceScope, maxTextLength, fieldHTML,
    questionnaireVersion, needsGuardianPermission, guardianPermissionRecord, needsGuardianSupport,
    renderGuardianSupport, renderSurvey, renderYoung, resetYoung,
    renderWelcome, renderWelcomeConsent, setAgePath, resetAgePath,
    participationRecord, hasValidParticipation, isOutsideSurveyScope,
    setContext(version, answers = {}) {
      state.version = version;
      state.age = version;
      state.answers = answers;
      return domainList();
    },
    getContext: () => ({ version: state.version, answers: state.answers }),
    getUIState: () => ({ age: state.age, ageAudience: state.ageAudience, ageRoute: state.ageRoute, step: state.step, screen: state.screen, participation: state.participation, guardianPermission: state.guardianPermission, youngRecord: state.youngRecord, youngController: state.youngController }),
    setStep(step) { state.step = step; },
    finishHTML() { renderFinish(); return main.innerHTML; },
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
  received: 'some', sources: ['family'],
  barriers: ['cost'], comment: `${label} experience`,
});
const areaFor = (need, version, answers) => pageFor(`area:${need}`, version, answers);
const barrierField = area => area.fields.find(f => f.key.endsWith(':barriers'));
const fieldIds = field => field.options.map(option => option.id);
const stepsFor = (answers, version = 'adult') => {
  const domains = survey.setContext(version, answers);
  return plain(survey.buildSteps(answers, domains, version));
};
function welcomeControls() {
  const audiences = Object.fromEntries(['adult', 'minor'].map(value => [value, Object.assign(nodeStub(), { value })]));
  const routes = Object.fromEntries(['young', 'youth'].map(value => [value, Object.assign(nodeStub(), { value })]));
  const youthAges = Object.fromEntries(['younger', 'older'].map(value => [value, Object.assign(nodeStub(), { value })]));
  mainStub.setList('input[name="age_audience"]', Object.values(audiences));
  mainStub.setList('input[name="age_route"]', Object.values(routes));
  const consent = mainStub.querySelector('#welcome-consent');
  consent.setList('input[name="youth_age"]', Object.values(youthAges));
  survey.renderWelcome();
  const minorOptions = mainStub.querySelector('#minor-age-options');
  // The stub does not parse innerHTML, so mirror the initially rendered hidden attribute.
  minorOptions.hidden = /id="minor-age-options" hidden/.test(mainStub.innerHTML);
  return { audiences, routes, youthAges, minorOptions, consent, form: consent.querySelector('#welcome-consent-form') };
}


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
  assert.deepEqual(plain(survey.selectedNeeds({ needs_status: 'yes', needs: ['housing', 'none', 'unsure', 'prefer', 'unknown', 'other_need'] }, domains)), ['housing', 'other_need']);
  for (const needs of [undefined, '', 'housing', [], ['none'], ['unsure'], ['prefer']]) {
    assert.deepEqual(plain(survey.selectedNeeds({ needs_status: 'yes', needs }, domains)), []);
  }
  for (const sources of [undefined, [], ['not_sought'], ['unsure'], ['prefer']]) {
    assert.equal(survey.hasSoughtHelp({ sources }), false);
  }
  assert.equal(survey.hasSoughtHelp({ sources: ['family'] }), true);
});


test('adult detail grows by distinct topic while the youth route has at most one focus page', () => {
  for (const [version, domainCount] of [['adult', 17], ['youth', 8]]) {
    assert.equal(survey.DOMAINS[version].length, domainCount, 'Accepted options remain available');
    const ids = plain(survey.DOMAINS[version]).map(d => d.id);
    for (const count of [0, 2, 5]) {
      const needs = ids.slice(0, count);
      const steps = stepsFor({ serving_nt: 'yes', needs_status: 'yes', needs }, version);
      assert.deepEqual(steps.map(s => s.id), [
        'connection', ...(version === 'adult' ? ['place'] : []), 'needs', 'future',
        ...(version === 'adult' ? needs.map(id => `area:${id}`) : []), 'review',
      ]);
      assert.equal(steps.length, (version === 'adult' ? 5 + count : 4));
      assert.deepEqual(steps.filter(s => s.need).map(s => s.need), version === 'adult' ? needs : []);
      assert.equal(new Set(steps.map(s => s.id)).size, steps.length);
      assert.equal(steps.filter(s => s.id === 'needs').length, 1);
      assert.equal(steps.some(s => /priority|adequacy|impact|strengths|detail:|anything/.test(s.id)), false);
      if (version === 'youth' && count) {
        const focused = stepsFor({ serving_nt: 'yes', needs_status: 'yes', needs, focus_need: needs.at(-1) }, version);
        assert.deepEqual(focused.map(s => s.id), ['connection', 'needs', 'future', `area:${needs.at(-1)}`, 'review']);
      }
    }
  }
});


test('No, uncertainty, refusal and a skipped recent-need filter still permit a future topic', () => {
  for (const version of ['adult', 'youth']) {
    for (const needs_status of [undefined, '', 'no', 'prefer', 'unsure', 'yes']) {
      const topic = survey.DOMAINS[version][0].id;
      const answers = { serving_nt: 'recent', needs_status, future_needs: [topic], ...(version === 'youth' ? { focus_need: topic } : {}), areas: { [topic]: { support_requested: 'Help that fits the topic', formats: ['phone'] } }, times: ['weekend'], anything: 'Legacy idea' };
      assert.deepEqual(stepsFor(answers, version).map(s => s.id), ['connection', ...(version === 'adult' ? ['place'] : []), 'needs', 'future', `area:${topic}`, 'practical', 'review']);
      const result = plain(survey.cleanExport(answers, version, domainsFor(version)));
      assert.deepEqual(result.answers.future_needs, [topic]);
      assert.deepEqual(result.answers.areas[topic].formats, ['phone']);
      assert.deepEqual(result.answers.times, ['weekend']);
      assert.equal(result.answers.needs_status, needs_status);
      assert.equal(hasOwn(result.answers, 'anything'), false, 'The removed general-ideas answer is not reused');
      assert.equal(hasOwn(result.answers.areas[topic], 'received'), false, 'A future-only topic has no fabricated past receipt');
    }
  }
});


test('a topic selected for both past experience and future help has one contextual page', () => {
  const answers = { needs_status: 'yes', needs: ['housing', 'childcare'], future_needs: ['childcare'], areas: {
    housing: { received: 'some', sources: ['community'], barriers: ['wait'], comment: 'The wait was difficult.' },
    childcare: { received: 'enough', sources: ['family'], comment: 'The old care worked.', support_requested: 'Different hours now.', formats: ['group'] },
  } };
  const domains = survey.setContext('adult', answers);
  assert.deepEqual(plain(survey.buildSteps(answers, domains, 'adult')).filter(s => s.need).map(s => s.need), ['housing', 'childcare']);
  const pastOnly = survey.areaPage('housing');
  const both = survey.areaPage('childcare');
  assert.equal(pastOnly.fields.some(f => f.key.endsWith(':support_requested')), false);
  assert.match(survey.areaQuestionsHTML(pastOnly, 'housing'), /data-add-future="housing"/);
  assert.deepEqual(plain(both.fields.map(f => f.key.split(':').at(-1))), ['received', 'sources', 'service_names', 'barriers', 'comment', 'support_requested', 'formats', 'format_other']);
  const html = survey.areaQuestionsHTML(both, 'childcare');
  assert.ok(html.indexOf('areas:childcare:comment') < html.indexOf('areas:childcare:support_requested'));
  assert.doesNotMatch(html, /data-add-future="childcare"/);
  assert.deepEqual(plain(survey.cleanExport(answers, 'adult', domains)).answers.areas, answers.areas);
  assert.doesNotMatch(JSON.stringify(survey.cleanExport(answers, 'adult', domains)), /additional_support_now/);
});


test('past support and experience remain visible without requiring a future answer', () => {
  for (const received of [undefined, 'enough', 'some', 'none', 'unsure', 'prefer']) {
    const answers = { needs_status: 'yes', needs: ['housing'], areas: { housing: { received } } };
    survey.setContext('adult', answers);
    const area = survey.areaPage('housing');
    const html = survey.areaQuestionsHTML(area, 'housing');
    assert.doesNotMatch(html, /<details|<summary|More about this experience/);
    for (const key of ['received', 'sources', 'comment']) {
      const f = area.fields.find(f => f.key === `areas:housing:${key}`);
      assert.equal(survey.conditionalVisible(f), true, key);
      assert.match(html, new RegExp(`data-field="areas:housing:${key}"`));
    }
    assert.ok(html.indexOf('areas:housing:received') < html.indexOf('areas:housing:sources'));
    assert.ok(html.indexOf('areas:housing:sources') < html.indexOf('areas:housing:comment'));
    assert.match(html, /Add future ideas for this topic/);
  }
});


test('rendering an area or moving to another area preserves written answers without disclosure state', () => {
  const answers = { needs_status: 'yes', needs: ['housing', 'transport'], areas: { housing: areaBlock(), transport: areaBlock('Transport') } };
  const domains = survey.setContext('adult', answers);
  const original = structuredClone(answers);
  const exportBefore = plain(survey.cleanExport(answers, 'adult', domains));
  for (const need of ['housing', 'transport', 'housing']) {
    const html = survey.areaQuestionsHTML(survey.areaPage(need));
    assert.ok(html.includes(answers.areas[need].comment));
    assert.deepEqual(answers, original);
    assert.deepEqual(plain(survey.cleanExport(answers, 'adult', domains)), exportBefore);
  }
  assert.doesNotMatch(JSON.stringify(exportBefore), /expandedAreas|expanded|disclosure/);
});


test('future-only and combined topics expose optional help and format questions without another gate', () => {
  for (const version of ['adult', 'youth']) {
    const first = survey.DOMAINS[version][0].id;
    for (const needs of [[], [first]]) {
      const answers = { needs_status: needs.length ? 'yes' : 'no', needs, future_needs: [first], ...(version === 'youth' ? { focus_need: first } : {}), areas: { [first]: { ...(needs.length ? { comment: 'Past account' } : {}), formats: ['phone'] } } };
      const domains = survey.setContext(version, answers);
      const area = survey.areaPage(first);
      const request = area.fields.find(f => f.key.endsWith(':support_requested'));
      assert.equal(request.required, undefined);
      assert.equal(survey.conditionalVisible(request), true);
      assert.ok(area.fields.some(f => f.key.endsWith(':formats')));
      assert.equal(area.fields.some(f => f.key.endsWith(':received')), Boolean(needs.length));
      assert.deepEqual(plain(survey.cleanExport(answers, version, domains)).answers.areas[first].formats, ['phone']);
      assert.equal(hasOwn(survey.cleanExport(answers, version, domains).answers.areas[first], 'support_requested'), false, 'Blank request remains blank while formats are allowed');
    }
  }
});


test('removing, reordering and re-adding recent needs preserves only supported area answers', () => {
  const domains = domainsFor('adult');
  const answers = { needs_status: 'yes', needs: ['transport', 'housing'], needs_other: 'Stale topic', areas: {
    housing: areaBlock(), transport: areaBlock('Transport'), other_need: areaBlock('Other'), childcare: { support_requested: 'Care options', formats: ['phone'] },
  }, future_needs: ['childcare'], times: ['weekend'], anything: 'Keep this' };
  survey.reconcileAnswers(answers, 'needs', domains);
  assert.deepEqual(plain(answers.areas), { housing: areaBlock(), transport: areaBlock('Transport'), childcare: { support_requested: 'Care options', formats: ['phone'] } });
  assert.equal(hasOwn(answers, 'needs_other'), false);
  answers.needs = ['housing', 'transport'];
  survey.reconcileAnswers(answers, 'needs', domains);
  assert.deepEqual(plain(answers.areas), { housing: areaBlock(), transport: areaBlock('Transport'), childcare: { support_requested: 'Care options', formats: ['phone'] } });
  answers.needs = ['transport'];
  survey.reconcileAnswers(answers, 'needs', domains);
  assert.deepEqual(plain(answers.areas), { transport: areaBlock('Transport'), childcare: { support_requested: 'Care options', formats: ['phone'] } });
  answers.needs = ['transport', 'housing'];
  survey.reconcileAnswers(answers, 'needs', domains);
  assert.equal(hasOwn(answers.areas, 'housing'), false, 'A re-added area needs fresh answers');
  assert.deepEqual(plain(survey.cleanExport(answers, 'adult', domains)).answers.areas, { transport: areaBlock('Transport'), housing: {}, childcare: { support_requested: 'Care options', formats: ['phone'] } });
  for (const needs of [[], ['none'], ['unsure'], ['prefer']]) {
    answers.needs = needs;
    survey.reconcileAnswers(answers, 'needs', domains);
    assert.deepEqual(plain(answers.areas), { childcare: { support_requested: 'Care options', formats: ['phone'] } });
    assert.deepEqual(answers.future_needs, ['childcare']);
    assert.deepEqual(answers.times, ['weekend']);
    assert.equal(answers.anything, 'Keep this');
  }
});


test('editing a recent Other description clears only that area while keeping future topic detail', () => {
  const domains = domainsFor('adult');
  const answers = { needs_status: 'yes', needs: ['housing', 'other_need'], needs_other: 'Changed topic', future_needs: ['childcare'], areas: { housing: areaBlock(), other_need: areaBlock('Old topic'), childcare: { formats: ['phone'] } }, times: ['weekend'] };
  survey.reconcileAnswers(answers, 'needs_other', domains);
  assert.deepEqual(plain(answers.areas), { housing: areaBlock(), childcare: { formats: ['phone'] } });
  assert.equal(answers.needs_other, 'Changed topic');
  assert.deepEqual(answers.times, ['weekend']);
  const other = areaFor('other_need', 'adult', answers);
  assert.equal(other.title, 'Changed topic');
  assert.deepEqual(plain(survey.cleanExport(answers, 'adult', domains)).answers.areas, { housing: areaBlock(), other_need: {}, childcare: { formats: ['phone'] } });
});


test('changing a source clears only its own area’s barriers and preserves both core answers and comments', () => {
  const answers = { needs_status: 'yes', needs: ['housing', 'transport'], areas: { housing: areaBlock(), transport: areaBlock('Transport') } };
  const domains = survey.setContext('adult', answers);
  survey.setValue('areas:housing:sources', ['not_sought']);
  survey.reconcileAnswers(answers, 'areas:housing:sources', domains);
  assert.deepEqual(plain(survey.getValue('areas:housing:sources')), ['not_sought']);
  assert.equal(hasOwn(answers.areas.housing, 'barriers'), false);
  assert.equal(answers.areas.housing.received, 'some');
  assert.equal(hasOwn(answers.areas.housing, 'additional_support_now'), false);
  assert.equal(answers.areas.housing.comment, 'Housing experience');
  assert.deepEqual(answers.areas.transport, areaBlock('Transport'));
  survey.setValue('areas:transport:comment', 'Transport only');
  assert.equal(survey.getValue('areas:housing:comment'), 'Housing experience');
  assert.equal(survey.getValue('areas:transport:comment'), 'Transport only');
  assert.equal(hasOwn(answers, 'sources'), false);
});


test('actual barriers and reasons for not seeking help stay separate; blank or uncertain sources imply neither', () => {
  const answers = { needs_status: 'yes', needs: ['housing', 'transport'], areas: {
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
  const youth = barrierField(areaFor('school_learning', 'youth', { needs_status: 'yes', needs: ['school_learning'], areas: { school_learning: { sources: ['school'] } } }));
  assert.ok(fieldIds(youth).includes('no_trusted_person'));
  assert.equal(fieldIds(youth).includes('eligibility_refused'), false);
});


test('crossing local and historical residence routes clears experience answers but preserves connection', () => {
  const domains = domainsFor('adult');
  const experienceKeys = ['needs_status', 'needs', 'needs_other', 'future_needs', 'future_needs_other', 'focus_need', 'areas', 'times', 'in_person_areas', 'in_person_other', 'earlier_experience', 'time_nt', 'children_ages'];
  for (const [previous, residence_area] of [['darwin', 'outside'], ['outside', 'darwin'], ['greater_darwin_other', 'outside']]) {
    const answers = { roles: ['partner'], community_connection: 'A local group helped us feel welcome.', residence_area, past_residence: 'yes', ...Object.fromEntries(experienceKeys.map(key => [key, 'PREVIOUS_COHORT_SENTINEL'])) };
    survey.reconcileAnswers(answers, 'residence_area', domains, previous);
    for (const key of experienceKeys) assert.equal(hasOwn(answers, key), false, `${previous} to ${residence_area}: ${key}`);
    assert.deepEqual(answers.roles, ['partner']);
    assert.equal(answers.community_connection, 'A local group helped us feel welcome.');
    assert.equal(answers.residence_area, residence_area);
  }
  const unchanged = { residence_area: 'darwin', suburb: 'wagaman', needs_status: 'yes', needs: ['housing'], areas: { housing: areaBlock() } };
  survey.reconcileAnswers(unchanged, 'suburb', domains, 'casuarina');
  assert.deepEqual(unchanged.areas, { housing: areaBlock() });
});


test('optional locality edits preserve experiences and military posting never decides residence', () => {
  const domains = domainsFor('adult');
  for (const previous of ['wagaman', 'casuarina', 'other', 'prefer', '', undefined]) {
    for (const suburb of ['stuart_park', 'other', 'prefer', '', undefined]) {
      const answers = { roles: ['partner'], serving_nt: 'no', residence_area: 'darwin', suburb, time_nt: 'over3', needs_status: 'yes', needs: ['housing'], areas: { housing: areaBlock() } };
      const original = structuredClone(answers);
      survey.reconcileAnswers(answers, 'suburb', domains, previous);
      assert.deepEqual(answers, original);
      assert.equal(survey.isOutsideSurveyScope(answers), false);
    }
  }
  assert.equal(survey.isOutsideSurveyScope({ roles: ['none'], residence_area: 'darwin', suburb: 'wagaman' }), true);
  assert.equal(survey.isOutsideSurveyScope({ roles: ['partner'], serving_nt: 'no', residence_area: 'darwin' }), false);
  assert.equal(survey.isOutsideSurveyScope({ roles: ['partner'], serving_nt: 'yes', residence_area: 'outside', past_residence: 'no' }), true);
});


test('topic format changes clear shared practical answers only when no relevant format remains', () => {
  const domains = domainsFor('adult');
  for (const formats of [['text'], ['self_guided'], ['unsure'], ['no_preference'], ['prefer'], []]) {
    const answers = { future_needs: ['housing'], areas: { housing: { formats } }, times: ['weekend'], in_person_areas: ['darwin'] };
    survey.reconcileAnswers(answers, 'areas:housing:formats', domains, ['group']);
    assert.equal(hasOwn(answers, 'times'), false);
    assert.equal(hasOwn(answers, 'in_person_areas'), false);
    assert.deepEqual(answers.areas, { housing: { formats } });
  }
  for (const formats of [['phone'], ['video_one_to_one'], ['online_group'], ['group'], ['one_to_one'], ['self_guided', 'group']]) {
    const answers = { future_needs: ['housing'], areas: { housing: { formats } }, times: ['weekend'] };
    survey.reconcileAnswers(answers, 'areas:housing:formats', domains, ['text']);
    assert.deepEqual(answers.times, ['weekend']);
  }
  const p = areaFor('housing', 'adult', { future_needs: ['housing'] });
  const formats = p.fields.find(f => f.key === 'areas:housing:formats');
  assert.match(formats.label, /support or joining an activity for this topic/);
  for (const value of ['unsure', 'no_preference', 'prefer']) {
    assert.deepEqual(plain(survey.toggleChoice(['phone', 'group'], value, formats.exclusive)), [value]);
  }
});


test('schema 7.2 exports topic-linked measures and never migrates obsolete global responses', () => {
  const domains = domainsFor('adult');
  const legacy = { anything: 'OLD_GENERAL_IDEAS', priority: ['transport'], adequacy: { housing: 'enough' }, follow_up: { housing: { impact: 'a_lot', help: ['family'], change: 'OLD_CURRENT_ONLY' } }, strengths: 'OLD_STRENGTH', impact: 'a_lot', help: ['family'], change: 'OLD_COMBINED', another_priority: 'OLD_OTHER', caring: ['under18'], financial_dependence: 'yes', care_dependence: 'yes', expandedAreas: { housing: true } };
  const answers = { ...legacy, serving_nt: 'recent', needs_status: 'yes', needs: ['housing', 'childcare'], future_needs: ['housing'], areas: { housing: { ...areaBlock(), support_requested: 'Housing advice', formats: ['phone'], impact: 'a_lot', help: ['military'], extra: 'DO_NOT_COPY' }, transport: areaBlock('STALE') }, programmes: ['connection'], participation_formats: ['group'], berrimah_access: 'easy', times: ['weekend'] };
  const original = structuredClone(answers);
  const result = plain(survey.cleanExport(answers, 'adult', domains));
  assert.equal(result.schema_version, '7.2');
  assert.equal(result.measurement_scope, 'local_support_experiences_and_topic_linked_future_preferences');
  assert.equal(result.details_optional, true);
  assert.equal(result.consultation_route, 'residence_unspecified');
  assert.equal(result.recall_months, 12);
  assert.equal(result.storage, 'page_memory_only; not submitted');
  const expectedHousing = areaBlock();
  delete expectedHousing.additional_support_now;
  assert.deepEqual(result.answers.areas, { housing: { ...expectedHousing, support_requested: 'Housing advice', formats: ['phone'] }, childcare: {} });
  for (const key of Object.keys(legacy)) assert.equal(hasOwn(result.answers, key), false, key);
  for (const key of ['programmes','participation_formats','berrimah_access']) assert.equal(hasOwn(result.answers,key), false, key);
  assert.deepEqual(answers, original);
  const oldOnly = plain(survey.cleanExport({ ...legacy, needs_status: 'yes', needs: ['housing'] }, 'adult', domains));
  assert.deepEqual(oldOnly.answers.areas, { housing: {} });
  assert.doesNotMatch(JSON.stringify(oldOnly), /OLD_|DO_NOT_COPY/);
});


test('exports preserve skipped, cleared, No, unsure and declined recent support status as distinct answers', () => {
  const domains = domainsFor('adult');
  for (const needs_status of ['no', 'unsure', 'prefer', '']) {
    const result = plain(survey.cleanExport({ needs_status, future_needs: ['housing'], areas: { housing: { formats: ['phone'] } } }, 'adult', domains));
    assert.equal(result.answers.needs_status, needs_status);
    assert.deepEqual(result.answers.future_needs, ['housing']);
    assert.deepEqual(result.answers.areas, { housing: { formats: ['phone'] } });
  }
  const unanswered = survey.cleanExport({}, 'adult', domains).answers;
  assert.equal(hasOwn(unanswered, 'needs_status'), false);
  assert.equal(hasOwn(unanswered, 'needs'), false);
  const all = { needs_status: 'yes', needs: ['housing', 'transport', 'childcare', 'physical_health', 'emotional_wellbeing'], areas: {
    housing: { received: 'none', additional_support_now: 'no' },
    transport: { received: 'unsure', additional_support_now: 'unsure' },
    childcare: { received: 'prefer', additional_support_now: 'prefer' },
    emotional_wellbeing: { received: 'enough', sources: [], comment: '' },
  } };
  const areas = plain(survey.cleanExport(all, 'adult', domains)).answers.areas;
  assert.deepEqual(areas, { housing: { received: 'none' }, transport: { received: 'unsure' }, childcare: { received: 'prefer' }, physical_health: {}, emotional_wellbeing: all.areas.emotional_wellbeing });
  assert.doesNotMatch(JSON.stringify(areas), /additional_support_now/, 'Retired gate cannot enter the new export');
  assert.equal(hasOwn(areas.physical_health, 'barriers'), false, 'Skipping a barrier question must never become no barrier');
});


test('exports exclude off-route background and old recent-needs data from the historical route', () => {
  for (const version of ['adult', 'youth', 'child']) {
    const answers = { roles: ['partner'], residence_area: 'outside', past_residence: 'yes', earlier_experience: 'An older experience', needs_status: 'yes', needs: ['housing'], future_needs: ['housing'], areas: { housing: { ...areaBlock(), formats: ['phone'] } }, times: ['weekend'], in_person_areas: ['darwin'], anything: 'Stale', region: 'darwin', force: 'adf', time_nt: 'over3' };
    const original = structuredClone(answers);
    assert.deepEqual(stepsFor(answers, version).map(s => s.id), ['connection', 'earlier', 'review']);
    const result = plain(survey.cleanExport(answers, version, domainsFor(version)));
    assert.equal(result.consultation_route, 'earlier_experience');
    assert.equal(result.recall_months, null);
    assert.deepEqual(result.answers, { roles: ['partner'], residence_area: 'outside', region: 'outside_greater_darwin', past_residence: 'yes', earlier_experience: 'An older experience' });
    assert.deepEqual(answers, original);
  }
});


test('the same recall period frames the checklist, support received and sources, across all locations', () => {
  for (const [version, months, pattern] of [['adult', 12, /past 12 months/], ['youth', 3, /past three months/], ['child', 3, /past three months/]]) {
    const id = survey.DOMAINS[version][0].id;
    for (const serving_nt of ['yes', 'recent', 'unsure']) {
      for (const region of ['darwin', 'outside_au', 'outside_overseas', 'prefer', '', undefined]) {
        const answers = { serving_nt, region, needs_status: 'yes', needs: [id] };
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


test('residence precedes open reflection and youth locality remains optional on connection', () => {
  const adult = pageFor('connection', 'adult');
  assert.deepEqual(adult.fields.map(f => f.key), ['roles', 'residence_area', 'suburb', 'suburb_other', 'past_residence', 'age_group']);
  const place = pageFor('place', 'adult');
  assert.deepEqual(place.fields.map(f => f.key), ['time_nt', 'community_connection']);
  assert.ok(place.fields.every(f => !f.required));
  const duration = place.fields.find(f => f.key === 'time_nt');
  assert.deepEqual(fieldIds(duration), ['never', 'under3', '3to12', '1to3', 'over3', 'unsure', 'prefer']);
  assert.match(duration.hint, /current or most recent stay/);
  const youth = pageFor('connection', 'youth', { residence_area: 'darwin' });
  assert.deepEqual(youth.fields.map(f => f.key), ['roles', 'residence_area', 'suburb', 'suburb_other', 'past_residence', 'assistance', 'community_connection']);
  assert.equal(youth.fields.find(f => f.key === 'suburb').required, undefined);
  assert.ok(fieldIds(youth.fields.find(f => f.key === 'suburb')).includes('prefer'));
  assert.deepEqual(fieldIds(youth.fields[1]), fieldIds(adult.fields[1]));
  assert.equal(stepsFor({ residence_area: 'darwin', suburb: 'wagaman' }, 'youth').some(step => step.id === 'place'), false);
});

test('the optional connection-experience prompt survives no-needs and earlier-experience routes', () => {
  for(const version of ['adult','youth']){
    const field=pageFor(version==='adult'?'place':'connection',version).fields.find(item=>item.key==='community_connection');
    assert.equal(field.required,undefined);
    assert.equal(field.label, version === 'adult' ? 'What has made it easier or harder for you or your family to feel connected in Greater Darwin?' : 'What, if anything, has helped you feel welcome or included in Greater Darwin?');
    const base={roles:['partner'],serving_nt:'yes',needs_status:'no',community_connection:'The local playgroup helped us meet people.'};
    const noNeeds=plain(survey.cleanExport(base,version,domainsFor(version)));
    assert.equal(noNeeds.answers.community_connection,base.community_connection);
    assert.ok(stepsFor(base,version).some(step=>step.id==='future'));
    const earlier={...base,residence_area:'outside',past_residence:'yes',earlier_experience:'A previous local stay'};
    const historical=plain(survey.cleanExport(earlier,version,domainsFor(version)));
    assert.equal(historical.answers.community_connection,base.community_connection);
    assert.deepEqual(stepsFor(earlier,version).map(step=>step.id),['connection','earlier','review']);
    survey.setContext(version,base);
    assert.match(survey.reviewHTML(),/The local playgroup helped us meet people/);
  }
  const child=plain(survey.cleanExport({serving_nt:'yes',community_connection:'Stale adult answer'},'child',domainsFor('child')));
  assert.equal(hasOwn(child.answers,'community_connection'),false);
});

test('adult age bands are optional, non-overlapping and available on both service-history routes', () => {
  const age = pageFor('connection', 'adult').fields.find(f => f.key === 'age_group');
  assert.equal(age.required, undefined);
  assert.deepEqual(plain(age.options).map(o => [o.id, o.label]), [
    ['18_29', '18–29'], ['30_39', '30–39'], ['40_49', '40–49'], ['50_plus', '50 or older'],
  ]);
  for (const group of age.options.map(o => o.id)) {
    const recent = { roles: ['partner'], serving_nt: 'yes', age_group: group };
    const earlier = { ...recent, residence_area: 'outside', past_residence: 'yes', earlier_experience: 'Earlier support' };
    assert.deepEqual(stepsFor(recent).map(s => s.id), ['connection', 'place', 'needs', 'future', 'review']);
    assert.deepEqual(stepsFor(earlier).map(s => s.id), ['connection', 'earlier', 'review']);
    assert.equal(survey.cleanExport(recent, 'adult', domainsFor('adult')).answers.age_group, group);
    assert.equal(survey.cleanExport(earlier, 'adult', domainsFor('adult')).answers.age_group, group);
    assert.equal(hasOwn(survey.cleanExport(recent, 'youth', domainsFor('youth')).answers, 'age_group'), false);
  }
  assert.equal(hasOwn(survey.cleanExport({ serving_nt: 'yes', age_group: 'unknown' }, 'adult', domainsFor('adult')).answers, 'age_group'), false);
});

test('youth keeps every selected recent and future topic but details only one optional focus', () => {
  const [first, second, third] = survey.DOMAINS.youth.map(domain => domain.id);
  const answers = { roles: ['child'], assistance: 'guardian', region: 'outside_au', needs_status: 'yes', needs: [first, second], future_needs: [third], future_ideas: 'Other families may need better information.', time_nt: 'over3', force: 'adf', areas: { [first]: { comment: 'STALE_FIRST' }, [second]: { comment: 'STALE_SECOND' }, [third]: { support_requested: 'FUTURE_THIRD', formats: ['phone'] } } };
  const domains = survey.setContext('youth', answers);
  const withoutFocus = plain(survey.cleanExport(answers, 'youth', domains));
  assert.equal(withoutFocus.schema_version, '7.2');
  assert.equal(withoutFocus.recall_months, 3);
  assert.deepEqual(withoutFocus.answers.needs, [first, second]);
  assert.deepEqual(withoutFocus.answers.future_needs, [third]);
  assert.equal(withoutFocus.answers.future_ideas, answers.future_ideas);
  assert.deepEqual(withoutFocus.answers.areas, {});
  assert.equal(hasOwn(withoutFocus.answers, 'focus_need'), false);
  assert.equal(hasOwn(withoutFocus.answers, 'region'), false);
  assert.equal(hasOwn(withoutFocus.answers, 'time_nt'), false);
  assert.equal(hasOwn(withoutFocus.answers, 'force'), false);
  assert.deepEqual(stepsFor(answers, 'youth').map(step => step.id), ['connection', 'needs', 'future', 'practical', 'review']);

  answers.focus_need = third;
  assert.deepEqual(stepsFor(answers, 'youth').map(step => step.id), ['connection', 'needs', 'future', `area:${third}`, 'practical', 'review']);
  const focused = plain(survey.cleanExport(answers, 'youth', domains));
  assert.equal(focused.answers.focus_need, third);
  assert.deepEqual(Object.keys(focused.answers.areas), [third]);
  assert.deepEqual(focused.answers.areas[third], { support_requested: 'FUTURE_THIRD', formats: ['phone'] });
  assert.doesNotMatch(JSON.stringify(focused), /STALE_FIRST|STALE_SECOND/);

  answers.future_needs = [];
  survey.reconcileAnswers(answers, 'future_needs', domains, [third]);
  assert.equal(hasOwn(answers, 'focus_need'), false, 'Removing the focus topic withdraws its detail');
  assert.deepEqual(plain(answers.areas), {});
  assert.deepEqual(plain(answers.needs), [first, second]);
  assert.deepEqual(stepsFor(answers, 'youth').map(step => step.id), ['connection', 'needs', 'future', 'review']);
});


test('every field and option ID remains unique even when every area is selected', () => {
  for (const version of ['adult', 'youth', 'child']) {
    const domains = domainsFor(version);
    const needs = plain(domains).map(d => d.id);
    const answers = { serving_nt: 'recent', roles: ['child'], needs_status: 'yes', needs };
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


test('review groups each topic separately and returns edits to the corresponding topic', () => {
  const answers = { serving_nt: 'yes', needs_status: 'yes', needs: ['housing', 'transport'], future_needs: ['transport'], areas: {
    housing: { received: 'some', sources: ['family'], comment: 'HOUSING_ONLY_SENTINEL' },
    transport: { received: 'enough', support_requested: 'TRANSPORT_REQUEST_SENTINEL', sources: ['not_sought'], comment: 'TRANSPORT_ONLY_SENTINEL' },
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
  assert.doesNotMatch(housing, /TRANSPORT_ONLY_SENTINEL|TRANSPORT_REQUEST_SENTINEL/);
  assert.match(transport, /<h2>Getting around<\/h2>/);
  assert.match(transport, /data-edit="area:transport"/);
  assert.match(transport, /TRANSPORT_REQUEST_SENTINEL/);
  assert.doesNotMatch(transport, /HOUSING_ONLY_SENTINEL/);
});


test('review does not present skipped questions as no barrier or no support requested', () => {
  survey.setContext('adult', { needs_status: 'yes', needs: ['housing'], areas: { housing: { received: 'enough' } } });
  const review = survey.reviewHTML();
  assert.doesNotMatch(review, /No additional details provided|More about this experience/);
  assert.match(review, /Not answered/);
  assert.doesNotMatch(review, /Nothing made it harder|data-edit="area:housing" data-detail="true"/);
});


test('the library shares actual past and future topic fields, barrier variants and sequence', () => {
  for (const version of ['adult', 'youth', 'child']) {
    const first = survey.DOMAINS[version][0].id;
    for (const location of ['nt', 'outside', 'unspecified']) {
      const sections = plain(survey.librarySections(version, location));
      assert.deepEqual(sections.map(s => s.id), ['connection', ...(version === 'youth' ? [] : ['place']), 'needs', ...(version === 'child' ? [] : ['future']), 'area', ...(version === 'child' ? [] : ['future-area', 'practical']), 'earlier']);
      const area = sections.find(s => s.id === 'area');
      assert.deepEqual(area.fields.map(f => f.key), ['received', 'sources', ...(version === 'adult' ? ['service_names'] : []), 'comment'].map(key => `areas:${first}:${key}`));
      assert.deepEqual(area.variants.map(v => v.id), ['sought', 'not-sought']);
      const answers = { serving_nt: 'yes', needs_status: 'yes', needs: [first], areas: { [first]: { sources: ['family'] } } };
      const live = areaFor(first, version, answers);
      assert.deepEqual(area.fields, live.fields.filter(f => !f.key.endsWith(':barriers')));
      assert.deepEqual(area.variants[0].fields, [barrierField(live)]);
      answers.areas[first].sources = ['not_sought'];
      assert.deepEqual(area.variants[1].fields, [barrierField(areaFor(first, version, answers))]);
      if (version !== 'child') {
        const futureArea = sections.find(s => s.id === 'future-area');
        assert.equal(futureArea.fields.some(f => f.key.endsWith(':received')), false);
        assert.deepEqual(futureArea.fields.map(f => f.key.split(':').at(-1)), ['support_requested', 'formats', 'format_other']);
      }
    }
  }
});


test('library rendering restores the original respondent and preserves all answer values', () => {
  const answers = { region: 'outside_overseas', serving_nt: 'recent', needs_status: 'yes', needs: ['feelings'], areas: { feelings: { received: 'some', sources: ['family'], comment: 'My own answer' } }, anything: 'My final comment' };
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
    for (const answers of [{}, { roles: [] }, { serving_nt: 'recent' }, ...(version === 'adult' ? [] : [{ roles: ['child'] }])]) {
      assert.equal(survey.requiredAnswersComplete(connection.fields, answers), false);
    }
    for (const serving_nt of ['yes', 'recent', 'earlier', 'unsure']) {
      assert.equal(survey.requiredAnswersComplete(connection.fields, { roles: ['child'], serving_nt, ...(version === 'adult' ? {} : { assistance: 'guardian' }) }), true);
    }
    const id = survey.DOMAINS[version][0].id;
    const answers = { serving_nt: 'yes', needs_status: 'yes', needs: [id] };
    const domains = survey.setContext(version, answers);
    for (const step of survey.buildSteps(answers, domains, version).filter(step => step.id !== 'connection')) {
      const p = survey.page(step);
      assert.equal(survey.requiredAnswersComplete(p.fields.filter(survey.conditionalVisible), {}), true, `${version}: ${step.id}`);
    }
    assert.equal(survey.requiredAnswersComplete(pageFor('earlier', version).fields, {}), true);
  }
});


test('long-answer limits allow fuller responses without counters competing with empty fields', () => {
  for (const [version, max] of [['adult', 5000], ['youth', 1500], ['child', 1500]]) {
    const need = survey.DOMAINS[version][0].id;
    survey.setContext(version, { needs_status: 'yes', needs: [need] });
    const f = survey.areaPage(need).fields.find(f => f.key.endsWith(':comment'));
    assert.equal(survey.maxTextLength(version), max);
    assert.ok(survey.fieldHTML(f).includes(`maxlength="${max}"`));
    assert.ok(survey.fieldHTML(f).includes(`data-counter="${f.key}" hidden`));
    survey.setValue(f.key, 'x'.repeat(Math.ceil(max * .8)));
    assert.equal(survey.fieldHTML(f).includes(`data-counter="${f.key}" hidden`), false);
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

test('welcome expands age-matched information and 8–14 cannot start without guardian permission and own assent', () => {
  survey.resetAgePath();
  const { audiences, routes, youthAges, minorOptions, consent, form } = welcomeControls();
  assert.match(mainStub.innerHTML, /Whose experience is this about/);
  assert.match(mainStub.innerHTML, /Adult \(18 or older\)/);
  assert.match(mainStub.innerHTML, /Child or young person \(under 18\)/);
  assert.ok(mainStub.innerHTML.indexOf('Adult (18 or older)') < mainStub.innerHTML.indexOf('Child or young person (under 18)'));
  assert.doesNotMatch(mainStub.innerHTML, /Choose an age range to see the right questions/);
  assert.doesNotMatch(mainStub.innerHTML, /value="(?:adult|minor)" checked/);
  assert.equal(survey.getUIState().ageAudience, null, 'Adult route is not assumed');
  assert.equal(survey.getUIState().ageRoute, null);
  assert.equal(survey.getUIState().age, null);
  assert.equal(minorOptions.hidden, true);
  assert.equal(consent.innerHTML, '', 'No participation route is shown before a choice');
  for (const age of ['7 or younger', '8–17']) assert.match(mainStub.innerHTML, new RegExp(age));
  assert.doesNotMatch(mainStub.innerHTML, /12–14|7–11/);
  audiences.minor.onchange();
  assert.equal(survey.getUIState().ageAudience, 'minor');
  assert.equal(survey.getUIState().ageRoute, null);
  assert.equal(minorOptions.hidden, false);
  assert.equal(consent.innerHTML, '', 'A minor route still needs a precise age choice');
  routes.youth.onchange();
  assert.equal(survey.getUIState().screen, 'welcome');
  assert.equal(survey.getUIState().ageAudience, 'minor');
  assert.equal(survey.getUIState().ageRoute, 'youth');
  assert.equal(survey.getUIState().age, null);
  assert.match(consent.innerHTML, /Young person’s age/);
  assert.match(consent.innerHTML, /8–14/);
  assert.match(consent.innerHTML, /15–17/);
  assert.doesNotMatch(consent.innerHTML, /Everyone aged 8–17 sees the same questions/);
  youthAges.younger.onchange();
  assert.equal(survey.getUIState().age, 'youth_younger');
  assert.equal(survey.getContext().version, 'youth');
  assert.match(consent.innerHTML, /Taking part and your information/);
  assert.match(consent.innerHTML, /name="guardian-permission"/);
  assert.match(consent.innerHTML, /name="participation"/);
  const guardian = form.querySelector('input[name="guardian-permission"]');
  const assent = form.querySelector('input[name="participation"]');
  const start = form.querySelector('[type="submit"]');
  assert.equal(start.disabled, true);
  assent.checked = true;
  assent.onchange();
  assert.equal(start.disabled, true, 'Young-person assent alone cannot open the questionnaire');
  guardian.checked = true;
  guardian.onchange();
  assert.equal(survey.getUIState().participation.kind, 'assent');
  assert.equal(start.disabled, false);
  form.onsubmit({ preventDefault() {} });
  assert.equal(survey.getUIState().screen, 'survey');
  assert.equal(survey.getUIState().step, 'connection');
  mainStub.querySelector('#back').onclick();
  assert.equal(survey.getUIState().screen, 'welcome');
  assert.match(mainStub.innerHTML, /value="minor" checked/);
  assert.match(mainStub.innerHTML, /value="youth" checked/);
  survey.resetAgePath();
});

test('switching youth consent band or adult/minor audience clears stale answers and agreement', () => {
  survey.resetAgePath();
  const { audiences, routes, youthAges, minorOptions, consent } = welcomeControls();
  audiences.minor.onchange();
  routes.youth.onchange();
  youthAges.younger.onchange();
  const form = consent.querySelector('#welcome-consent-form');
  const guardian = form.querySelector('input[name="guardian-permission"]');
  const assent = form.querySelector('input[name="participation"]');
  guardian.checked = true; guardian.onchange();
  assent.checked = true; assent.onchange();
  survey.setValue('roles', ['child']);
  youthAges.older.onchange();
  assert.equal(survey.getUIState().age, 'youth_older');
  assert.deepEqual(plain(survey.getContext().answers), {});
  assert.equal(survey.getUIState().guardianPermission, null);
  assert.equal(survey.getUIState().participation, null);
  assert.doesNotMatch(consent.innerHTML, /name="guardian-permission"/);
  assert.match(consent.innerHTML, /name="participation"/);
  audiences.adult.onchange();
  assert.equal(survey.getUIState().age, 'adult');
  assert.equal(survey.getContext().version, 'adult');
  assert.equal(survey.getUIState().ageAudience, 'adult');
  assert.equal(survey.getUIState().ageRoute, 'adult');
  assert.equal(minorOptions.hidden, true);
  assert.equal(routes.youth.checked, false);
  assert.equal(routes.young.checked, false);
  assert.deepEqual(plain(survey.getContext().answers), {});
  assert.equal(survey.getUIState().participation, null);
  assert.equal(survey.getUIState().guardianPermission, null);
  assert.doesNotMatch(consent.innerHTML, /name="guardian-permission"/);
  assert.match(consent.innerHTML, /name="participation"/);
  audiences.minor.onchange();
  assert.equal(survey.getUIState().ageAudience, 'minor');
  assert.equal(survey.getUIState().ageRoute, null);
  assert.equal(survey.getUIState().age, null);
  assert.equal(minorOptions.hidden, false);
  assert.equal(consent.innerHTML, '');
  routes.young.onchange();
  assert.equal(survey.getUIState().age, 'young');
  assert.equal(survey.getUIState().ageAudience, 'minor');
  assert.match(consent.innerHTML, /name="guardian-permission"/);
  assert.doesNotMatch(consent.innerHTML, /name="participation"/);
  assert.match(consent.innerHTML, /Your child does not have to answer/);
  survey.resetAgePath();
});

test('15–17 and adults give their own inline agreement without a guardian permission checkbox', () => {
  for (const route of ['youth', 'adult']) {
    survey.resetAgePath();
    const { audiences, routes, youthAges, consent, form } = welcomeControls();
    if (route === 'adult') audiences.adult.onchange();
    else { audiences.minor.onchange(); routes.youth.onchange(); }
    if (route === 'youth') youthAges.older.onchange();
    assert.doesNotMatch(consent.innerHTML, /name="guardian-permission"/);
    assert.match(consent.innerHTML, /name="participation"/);
    const agreement = form.querySelector('input[name="participation"]');
    const start = form.querySelector('[type="submit"]');
    assert.equal(start.disabled, true);
    agreement.checked = true;
    agreement.onchange();
    assert.equal(start.disabled, false);
    assert.equal(survey.getUIState().participation.kind, 'consent');
    assert.equal(survey.getUIState().participation.guardian_permission, null);
    form.onsubmit({ preventDefault() {} });
    assert.equal(survey.getUIState().screen, 'survey');
    assert.equal(survey.getUIState().step, 'connection');
    if (route === 'adult') {
      mainStub.querySelector('#back').onclick();
      assert.equal(survey.getUIState().screen, 'welcome');
      assert.equal(survey.getUIState().ageAudience, 'adult');
      assert.equal(survey.getUIState().ageRoute, 'adult');
      assert.match(mainStub.innerHTML, /value="adult" checked/);
      assert.match(mainStub.innerHTML, /id="minor-age-options" hidden/);
    }
  }
  survey.resetAgePath();
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

test('adult and older youth consent is explicit, while under-7s use a separate parent-assisted record', () => {
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

test('recent experience and future help use distinct direct prompts on a combined topic', () => {
  for (const version of ['adult', 'youth']) {
    const need = survey.DOMAINS[version][0].id;
    survey.setContext(version, { needs_status: 'yes', needs: [need], future_needs: [need], ...(version === 'youth' ? { focus_need: need } : {}), areas: { [need]: {} } });
    const fields = survey.areaPage(need).fields;
    const experience = fields.find(f => f.key.endsWith(':comment'));
    const request = fields.find(f => f.key.endsWith(':support_requested'));
    assert.doesNotMatch(experience.label, /Lutheran Care|us to know|need to know/i);
    assert.equal(experience.label, version === 'child' ? 'What happened when you needed help with this?' : version === 'youth' ? 'What helped, or what could have been better?' : 'What happened when you needed support with this?');
    assert.match(experience.hint, version === 'adult' ? /what helped, or what would have made things easier/ : /what happened, or leave this blank/);
    assert.doesNotMatch(experience.label, /when you (?:sought|received|got)/i, 'The experience question must not presume an attempt or successful receipt');
    assert.match(request.label, /(?:help|support).*(?:now|coming months|next few months)/i);
    assert.notEqual(experience.key, request.key);
  }
});


test('contact links stay separate from answers and remain available in the footer and completion screen', () => {
  const answers = { needs_status: 'yes', needs: ['housing'], areas: { housing: { ...areaBlock(), comment: 'PRIVATE_EXPERIENCE_SENTINEL' } } };
  survey.setContext('adult', answers);
  const original = structuredClone(answers);
  const anchor = survey.contactLinkHTML();
  for (const html of [anchor, survey.finishHTML()]) {
    assert.match(html, /href="contact\.html"/);
    assert.match(html, /Request an interview/);
    assert.doesNotMatch(html, /Arrange a conversation/i);
    assert.match(html, /target="_blank"/);
    assert.match(html, /rel="noopener noreferrer"/);
    assert.match(html, /referrerpolicy="no-referrer"/);
    assert.doesNotMatch(html, /PRIVATE_EXPERIENCE_SENTINEL|contact\.html[?#]/);
  }
  const finish = survey.finishHTML();
  assert.match(finish, /You have reached the end of this survey preview/);
  assert.match(finish, /Your answers were not sent or saved/);
  assert.ok(finish.includes(anchor));
  assert.ok(finish.includes('Find support in a few clicks'));
  assert.ok(finish.indexOf(anchor) < finish.indexOf('Find support in a few clicks'), 'The interview option is available before leaving for the resource');
  assert.deepEqual(answers, original);
  const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const footer = index.match(/<div class="questionnaire-help">[\s\S]*?<\/div>/)?.[0];
  assert.ok(footer, 'The footer is outside the changing survey page');
  assert.match(footer, /id="privacy-open"/);
  assert.match(footer, /href="contact\.html" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer"/);
  assert.ok(footer.indexOf('privacy-open') < footer.indexOf('href="contact.html"'));
  assert.doesNotMatch(footer, /contact\.html[?#]/);
});


test('the free-resource link accepts a safe URL and never includes survey answers', () => {
  const url = 'https://files.example.org/defence-families/guide.pdf?download=1';
  const config = { title: 'A guide <for families> & friends', url };
  survey.setContext('adult', { roles: ['partner'], change: 'PRIVATE_ANSWER_SENTINEL', priority: ['housing'], anything: 'PRIVATE_COMMENT_SENTINEL' });
  assert.deepEqual(plain(survey.thankYouResource(config)), config);
  const html = survey.thankYouResourceHTML(config);
  assert.ok(html.includes(`href="${url}"`), 'The link is exactly the configured resource URL');
  assert.match(html, /rel="noopener noreferrer"/);
  assert.match(html, /referrerpolicy="no-referrer"/);
  assert.doesNotMatch(html, /PRIVATE_ANSWER_SENTINEL|PRIVATE_COMMENT_SENTINEL/);
  assert.doesNotMatch(html, /[?&](answers|respondent|response|email|contact|token)=/);
});

test('the first-party support page opens without carrying answers or an origin-dependent URL', () => {
  survey.setContext('adult', { anything: 'PRIVATE_ANSWER_SENTINEL' });
  const html = survey.thankYouResourceHTML({ title: 'Find support in the NT', url: 'support.html' });
  assert.match(html, /href="support\.html"/);
  assert.doesNotMatch(html, /PRIVATE_ANSWER_SENTINEL|support\.html[?#]/);
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
  assert.equal(configured.url, 'support.html', 'The first-party service finder is configured');
  assert.equal(Object.isFrozen(configured), true);
});


test('Other explanation appears once directly after its choice, opens only when selected, and escapes user text', () => {
  for (const version of ['adult', 'youth', 'child']) {
    for (const selected of [false, true]) {
      const p = pageFor('needs', version, { needs_status: 'yes', needs: selected ? ['other_need'] : [], needs_other: '<script>PRIVATE_OTHER</script>' });
      const html = survey.fieldHTML(p.fields.find(f => f.key === 'needs'));
      const otherPosition = html.indexOf('value="other_need"');
      const fieldPosition = html.indexOf('data-field="needs_other"');
      assert.ok(otherPosition >= 0 && fieldPosition > otherPosition);
      assert.equal((html.match(/data-field="needs_other"/g) || []).length, 1);
      assert.match(html, /<div class="other-need-option">[\s\S]*?value="other_need"[\s\S]*?other-need-followup/);
      const fieldOpening = html.match(/<div[^>]*data-field="needs_other"[^>]*>/)[0];
      assert.equal(/\bhidden\b/.test(fieldOpening), !selected);
      assert.match(html, /value="&lt;script&gt;PRIVATE_OTHER&lt;\/script&gt;"/);
      assert.doesNotMatch(html, /<script>PRIVATE_OTHER/);
      assert.equal(p.fields.find(f => f.key === 'needs_other').required, undefined);
    }
  }
});


test('8–17-year-olds identify reading or writing help on connection; adults are not asked', () => {
  assert.equal(pageFor('connection', 'adult').fields.some(f => f.key === 'assistance'), false);
  const connection = pageFor('connection', 'youth');
  const assistance = connection.fields.find(f => f.key === 'assistance');
  assert.equal(assistance.required, true);
  assert.deepEqual(plain(assistance.options).map(option => [option.id, option.label]), [
    ['self', 'No, I am answering myself'], ['guardian', 'Yes, my parent or guardian'], ['other', 'Yes, someone else'],
  ]);
  assert.equal(survey.requiredAnswersComplete(connection.fields, { roles: ['child'], serving_nt: 'yes' }), false);
  for (const value of fieldIds(assistance)) {
    assert.equal(survey.requiredAnswersComplete(connection.fields, { roles: ['child'], serving_nt: 'yes', assistance: value }), true);
  }
});


test('younger respondents answering alone or with another helper need explicit guardian presence', () => {
  for (const age of ['child', 'youth_younger']) {
    for (const assistance of ['self', 'other']) {
      for (const guardian_present of [undefined, false, 'true', 'false', 1]) {
        assert.equal(survey.needsGuardianSupport(age, { assistance, guardian_present }), true);
      }
      assert.equal(survey.needsGuardianSupport(age, { assistance, guardian_present: true }), false);
    }
    assert.equal(survey.needsGuardianSupport(age, { assistance: 'guardian' }), false);
  }
  for (const age of ['adult', 'youth_older']) {
    for (const assistance of ['self', 'guardian', 'other']) {
      assert.equal(survey.needsGuardianSupport(age, { assistance }), false, 'Older routes do not invent a blanket guardian requirement');
    }
  }
});


test('changing a helper withdraws presence confirmation without erasing the child’s own answers', () => {
  const domains = domainsFor('child');
  for (const previous of ['self', 'guardian', 'other']) {
    for (const assistance of ['self', 'guardian', 'other'].filter(v => v !== previous)) {
      const answers = { assistance, guardian_present: true, needs_status: 'yes', needs: ['feelings'], areas: { feelings: areaBlock() } };
      survey.reconcileAnswers(answers, 'assistance', domains, previous);
      assert.equal(hasOwn(answers, 'guardian_present'), false);
      assert.deepEqual(answers.areas.feelings, areaBlock());
      assert.deepEqual(answers.needs, ['feelings']);
    }
  }
  const unchanged = { assistance: 'self', guardian_present: true };
  survey.reconcileAnswers(unchanged, 'assistance', domains, 'self');
  assert.equal(unchanged.guardian_present, true);
});


test('exports never reinterpret old read/write helper answers as guardian presence', () => {
  for (const version of ['child', 'youth']) {
    const domains = domainsFor(version);
    for (const assistance of ['reading', 'recording', 'reading_recording', 'prefer', '', undefined]) {
      const result = plain(survey.cleanExport({ assistance, guardian_present: true }, version, domains));
      assert.equal(hasOwn(result.answers, 'assistance'), false);
      assert.equal(hasOwn(result.answers, 'guardian_present'), false);
    }
    for (const assistance of ['self', 'guardian', 'other']) {
      for (const guardian_present of [undefined, false, 'true', true]) {
        const result = plain(survey.cleanExport({ assistance, guardian_present }, version, domains));
        assert.equal(result.answers.assistance, assistance);
        assert.equal(hasOwn(result.answers, 'guardian_present'), assistance !== 'guardian' && guardian_present === true);
      }
    }
  }
  const adult = plain(survey.cleanExport({ assistance: 'self', guardian_present: true }, 'adult', domainsFor('adult')));
  assert.equal(hasOwn(adult.answers, 'assistance'), false);
  assert.equal(hasOwn(adult.answers, 'guardian_present'), false);
});


test('the 8–14 helper interruption offers a private route and cannot advance without guardian presence', () => {
  const need = survey.DOMAINS.youth[0].id;
  const answers = { roles: ['child'], serving_nt: 'yes', assistance: 'other', needs_status: 'yes', needs: [need], focus_need: need };
  survey.setContext('youth', answers);
  const permission = survey.guardianPermissionRecord('youth_younger', true);
  survey.setParticipationContext('youth_younger', survey.participationRecord('youth_younger', true, permission), permission);
  survey.setStep(`area:${need}`);
  survey.renderSurvey();
  assert.equal(survey.getUIState().screen, 'guardian-support');
  assert.match(mainStub.innerHTML, /Please ask your parent or guardian to join you/);
  assert.match(mainStub.innerHTML, /Speak with Lutheran Care privately/);
  assert.doesNotMatch(mainStub.innerHTML, /Australian law requires|legally required/i);
  const form = mainStub.querySelector('#support-form');
  form.querySelector('input').checked = false;
  form.onchange();
  assert.equal(form.querySelector('[type="submit"]').disabled, true);
  form.onsubmit({ preventDefault() {} });
  assert.equal(survey.getUIState().screen, 'guardian-support');
  assert.equal(hasOwn(answers, 'guardian_present'), false);
  form.querySelector('input').checked = true;
  form.onchange();
  assert.equal(form.querySelector('[type="submit"]').disabled, false);
  form.onsubmit({ preventDefault() {} });
  assert.equal(answers.guardian_present, true);
  assert.equal(survey.getUIState().screen, 'survey');
  assert.equal(survey.getUIState().step, 'needs');
});


test('ages 7 or younger use their own controller, finish, and clear on restart', () => {
  let created = 0, shown = 0, reset = 0, options;
  context.window.SURVEY_YOUNG_CHILDREN = { create(config) {
    created += 1; options = config;
    return { show() { shown += 1; }, reset() { reset += 1; } };
  } };
  survey.resetYoung();
  survey.setParticipationContext('young');
  survey.renderYoung();
  assert.equal(created, 0, 'The child module cannot start without age-matched guardian permission');
  assert.equal(survey.getUIState().screen, 'welcome');
  assert.match(mainStub.innerHTML, /7 or younger/);
  const permission = survey.guardianPermissionRecord('young', true);
  survey.setParticipationContext('young', null, permission);
  survey.renderYoung();
  survey.renderYoung();
  assert.equal(created, 1);
  assert.equal(shown, 2);
  assert.equal(options.guardianPermission(), permission);
  assert.equal(options.prompts.length, 4);
  const record = { response_perspective: 'parent_observation', parent_observations: 'An observation, not child words' };
  options.onFinish(record);
  assert.equal(survey.getUIState().screen, 'finish');
  assert.equal(survey.getUIState().youngRecord, record);
  assert.doesNotMatch(mainStub.innerHTML, /Save my answers|Review my answers|download-answers|review-answers/);
  mainStub.querySelector('#restart').onclick();
  assert.equal(reset, 1);
  assert.equal(survey.getUIState().youngRecord, null);
  assert.equal(survey.getUIState().youngController, null);
  assert.equal(survey.getUIState().age, null);
  assert.deepEqual(plain(survey.getContext().answers), {});
  assert.equal(survey.getUIState().screen, 'welcome');
  const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.ok(index.indexOf('young-children.js') < index.indexOf('survey.js'), 'The child module is available before its controller is used');
});


test('support status controls the area list without treating uncertainty as No or duplicating Other', () => {
  for (const version of ['adult', 'youth', 'child']) {
    for (const needs_status of [undefined, '', 'yes', 'no', 'unsure', 'prefer']) {
      const answers = { needs_status, needs: ['other_need'], needs_other: 'A support need outside the list' };
      const p = pageFor('needs', version, answers);
      const gate = p.fields.find(f => f.key === 'needs_status');
      const list = p.fields.find(f => f.key === 'needs');
      const other = p.fields.find(f => f.key === 'needs_other');
      const visible = ['yes', 'unsure'].includes(needs_status);
      assert.deepEqual(fieldIds(gate), ['yes', 'no', 'unsure', 'prefer']);
      assert.equal(gate.required, undefined);
      assert.equal(survey.hasNeedSelection(answers), visible);
      assert.equal(survey.conditionalVisible(list), visible);
      assert.equal(survey.conditionalVisible(other), visible);
      assert.deepEqual(fieldIds(list), [...survey.DOMAINS[version].map(d => d.id), 'other_need']);
      assert.doesNotMatch(list.options.map(o => o.label).join(' '), /I did not need/);
      assert.equal(list.options.some(o => ['none', 'unsure', 'prefer'].includes(o.id)), false);
      assert.deepEqual(plain(survey.selectedNeeds(answers, domainsFor(version))), visible ? ['other_need'] : []);
    }
  }
});


test('changing the recent-support filter clears hidden experience while retaining independent future detail', () => {
  const domains = domainsFor('adult');
  for (const needs_status of ['no', 'prefer', '', undefined]) {
    const answers = { needs_status, needs: ['housing', 'other_need'], needs_other: 'OLD_OTHER', future_needs: ['housing'], areas: { housing: { ...areaBlock(), support_requested: 'Future housing advice', formats: ['phone'] }, other_need: areaBlock('OLD_OTHER') }, times: ['weekend'] };
    survey.reconcileAnswers(answers, 'needs_status', domains, 'yes');
    for (const key of ['needs', 'needs_other']) assert.equal(hasOwn(answers, key), false, key);
    assert.deepEqual(plain(answers.areas), { housing: { support_requested: 'Future housing advice', formats: ['phone'] } });
    assert.deepEqual(answers.future_needs, ['housing']);
    assert.deepEqual(answers.times, ['weekend']);
    answers.needs_status = 'yes';
    survey.reconcileAnswers(answers, 'needs_status', domains, needs_status);
    assert.deepEqual(plain(survey.selectedNeeds(answers, domains)), [], 'Switching back does not resurrect previous recent needs');
  }
  const unsure = { needs_status: 'unsure', needs: ['housing'], areas: { housing: areaBlock() } };
  survey.reconcileAnswers(unsure, 'needs_status', domains, 'yes');
  assert.deepEqual(unsure.areas.housing, areaBlock(), 'Uncertainty still permits the respondent to describe selected areas');
});


test('exports reject hidden past area data after No, refusal or a skipped recent-support filter', () => {
  const domains = domainsFor('adult');
  for (const needs_status of ['no', 'prefer', '', undefined]) {
    const answers = { serving_nt: 'yes', needs_status, needs: ['housing', 'other_need'], needs_other: 'HIDDEN_TOPIC', future_needs: ['housing'], areas: { housing: { ...areaBlock(), comment: 'HIDDEN_COMMENT', support_requested: 'Keep future help', formats: ['phone'] }, other_need: areaBlock() } };
    const original = structuredClone(answers);
    const result = plain(survey.cleanExport(answers, 'adult', domains));
    assert.equal(hasOwn(result.answers, 'needs'), false);
    assert.equal(hasOwn(result.answers, 'needs_other'), false);
    assert.deepEqual(result.answers.areas, { housing: { support_requested: 'Keep future help', formats: ['phone'] } });
    assert.deepEqual(result.answers.future_needs, ['housing']);
    assert.doesNotMatch(JSON.stringify(result), /HIDDEN_TOPIC|HIDDEN_COMMENT/);
    assert.equal(stepsFor(answers).some(s => s.id === 'area:other_need'), false);
    assert.equal(stepsFor(answers).some(s => s.id === 'area:housing'), true);
    assert.deepEqual(answers, original, 'Export must not mutate the live response');
  }
});

// The two-level picker keeps broad-area answers distinct from named suburbs.
test('locality aliases and valid area-suburb pairs preserve regional aggregation', () => {
  for (const [typed, id, residence_area] of [['Casuarina','casuarina','darwin'],['  wagaman  ','wagaman','darwin'],['Stuart Park','stuart_park','darwin'],['Howard Springs','howard_springs','litchfield'],['Rosebery','rosebery','palmerston'],['Robertson Barracks','holtze','litchfield'],['East Arm','east_arm','greater_darwin_other']]) {
    assert.equal(survey.suburbChoice(typed)?.id, id);
    for (const version of ['adult', 'youth']) {
      const result = plain(survey.cleanExport({ residence_area, suburb: id }, version, domainsFor(version)));
      assert.equal(result.answers.residence_area, residence_area);
      assert.equal(result.answers.suburb, id);
      assert.equal(result.answers.region, residence_area);
      assert.equal(result.location_precision, 'suburb');
      assert.equal(result.geography_version, '2026-09-27-two-level');
    }
  }
  assert.equal(survey.suburbChoice('Katherine'), undefined);
  assert.equal(survey.suburbChoice('Tindal'), undefined);
});

test('area-first fields show only matching optional suburbs and distinguish Palmerston area from Palmerston City', () => {
  for (const version of ['adult', 'youth']) {
    const broad = pageFor('connection', version).fields.find(field => field.key === 'residence_area');
    assert.equal(broad.required, undefined);
    assert.deepEqual(fieldIds(broad), ['darwin', 'palmerston', 'litchfield', 'greater_darwin_other', 'outside', 'prefer']);
    assert.match(broad.options.find(option => option.id === 'palmerston').label, /Palmerston/);
    for (const residence_area of ['darwin', 'palmerston', 'litchfield', 'greater_darwin_other']) {
      const fields = pageFor('connection', version, { residence_area }).fields;
      const suburb = fields.find(field => field.key === 'suburb');
      const available = fieldIds(suburb);
      assert.equal(suburb.type, 'select');
      assert.equal(suburb.required, undefined);
      assert.equal(survey.conditionalVisible(suburb), true);
      assert.ok(available.includes('other') && available.includes('prefer'));
      assert.equal(available.includes('outside'), false);
      for (const locality of plain(survey.suburbs).filter(option => option.region)) {
        assert.equal(available.includes(locality.id), locality.region === residence_area, `${residence_area}: ${locality.id}`);
      }
      const html = survey.fieldHTML(suburb);
      assert.match(html, /<select/);
      assert.doesNotMatch(html, /role="combobox"|suburb-search/);
    }
    for (const residence_area of [undefined, '', 'prefer', 'outside']) {
      const fields = pageFor('connection', version, { residence_area, suburb: 'other', suburb_other: 'HIDDEN' }).fields;
      assert.equal(survey.conditionalVisible(fields.find(field => field.key === 'suburb')), false);
      assert.equal(survey.conditionalVisible(fields.find(field => field.key === 'suburb_other')), false);
      assert.equal(survey.conditionalVisible(fields.find(field => field.key === 'past_residence')), residence_area === 'outside');
    }
    const areaOnly = plain(survey.cleanExport({ residence_area: 'palmerston' }, version, domainsFor(version)));
    assert.equal(areaOnly.answers.region, 'palmerston');
    assert.equal(areaOnly.location_precision, 'area');
    assert.equal(hasOwn(areaOnly.answers, 'suburb'), false, 'Broad Palmerston must not silently become Palmerston City');
    const city = plain(survey.cleanExport({ residence_area: 'palmerston', suburb: 'palmerston_city' }, version, domainsFor(version)));
    assert.equal(city.answers.suburb, 'palmerston_city');
    assert.equal(city.location_precision, 'suburb');
  }
});

test('changing the selected area clears locality detail but preserves support answers on local routes', () => {
  for (const [previous, residence_area] of [['darwin', 'palmerston'], ['palmerston', 'litchfield'], ['litchfield', 'greater_darwin_other'], ['darwin', 'prefer'], ['palmerston', '']]) {
    const answers = { residence_area, suburb: 'other', suburb_other: 'OLD_LOCALITY', needs_status: 'yes', needs: ['housing'], future_needs: ['childcare'], areas: { housing: areaBlock(), childcare: { formats: ['group'] } }, times: ['weekend'] };
    survey.reconcileAnswers(answers, 'residence_area', domainsFor('adult'), previous);
    assert.equal(hasOwn(answers, 'suburb'), false);
    assert.equal(hasOwn(answers, 'suburb_other'), false);
    assert.equal(answers.residence_area, residence_area);
    assert.deepEqual(answers.areas, { housing: areaBlock(), childcare: { formats: ['group'] } });
    assert.deepEqual(answers.needs, ['housing']);
    assert.deepEqual(answers.future_needs, ['childcare']);
    assert.deepEqual(answers.times, ['weekend']);
  }
  const unchanged = { residence_area: 'darwin', suburb: 'wagaman', needs_status: 'no' };
  survey.reconcileAnswers(unchanged, 'residence_area', domainsFor('adult'), 'darwin');
  assert.equal(unchanged.suburb, 'wagaman', 'A repeated unchanged value must not erase an existing answer');
});

test('exports retain area precision when locality is skipped, declined, unknown or inconsistent', () => {
  for (const suburb of [undefined, '', 'prefer', 'NOT_A_LOCALITY', 'bakewell']) {
    const answers = { residence_area: 'darwin', suburb, suburb_other: 'HIDDEN_DETAIL', region: 'palmerston' };
    const original = structuredClone(answers);
    const result = plain(survey.cleanExport(answers, 'adult', domainsFor('adult')));
    assert.equal(result.answers.region, 'darwin');
    assert.equal(result.location_precision, 'area');
    assert.equal(hasOwn(result.answers, 'suburb_other'), false);
    if (suburb === 'NOT_A_LOCALITY' || suburb === 'bakewell') assert.equal(hasOwn(result.answers, 'suburb'), false);
    assert.deepEqual(answers, original, 'Export must not mutate the respondent record');
  }
  for (const suburb_other of [undefined, '', '   ']) {
    const result = plain(survey.cleanExport({ residence_area: 'litchfield', suburb: 'other', suburb_other }, 'adult', domainsFor('adult')));
    assert.equal(result.answers.region, 'litchfield');
    assert.equal(result.location_precision, 'area', 'Selecting Other without naming a locality supplies only area precision');
  }
  const namedOther = plain(survey.cleanExport({ residence_area: 'litchfield', suburb: 'other', suburb_other: 'A different rural locality' }, 'adult', domainsFor('adult')));
  assert.equal(namedOther.answers.suburb_other, 'A different rural locality');
  assert.equal(namedOther.answers.region, 'litchfield');
  assert.equal(namedOther.location_precision, 'other_locality');
});

test('blank, declined and legacy-only areas never acquire a location from hidden or obsolete answers', () => {
  for (const residence_area of [undefined, '', 'prefer', 'NOT_AN_AREA']) {
    const answers = { residence_area, suburb: 'wagaman', suburb_other: 'HIDDEN_DETAIL', region: 'darwin', past_residence: 'yes' };
    const result = plain(survey.cleanExport(answers, 'adult', domainsFor('adult')));
    assert.equal(result.location_precision, 'not_stated');
    assert.equal(hasOwn(result.answers, 'residence_area'), residence_area === 'prefer');
    if (residence_area === 'prefer') assert.equal(result.answers.residence_area, 'prefer');
    assert.equal(result.residence_scope, 'not_disclosed_or_unspecified');
    assert.equal(result.consultation_route, 'residence_unspecified');
    for (const key of ['region', 'suburb', 'suburb_other', 'past_residence']) assert.equal(hasOwn(result.answers, key), false, key);
  }
  const outside = plain(survey.cleanExport({ residence_area: 'outside', suburb: 'wagaman', suburb_other: 'HIDDEN_DETAIL', past_residence: 'yes' }, 'adult', domainsFor('adult')));
  assert.equal(outside.answers.residence_area, 'outside');
  assert.equal(outside.answers.region, 'outside_greater_darwin');
  assert.equal(outside.residence_scope, 'outside_greater_darwin');
  assert.equal(outside.consultation_route, 'earlier_experience');
  assert.equal(outside.location_precision, 'area');
  for (const key of ['suburb', 'suburb_other']) assert.equal(hasOwn(outside.answers, key), false);
});

test('changing Other locality clears its hidden text without changing support needs', () => {
  const answers = { residence_area: 'darwin', suburb: 'casuarina', suburb_other: 'OLD_LOCALITY', needs_status: 'yes', needs: ['housing'], areas: { housing: areaBlock() } };
  survey.reconcileAnswers(answers, 'suburb', domainsFor('adult'), 'other');
  assert.equal(hasOwn(answers, 'suburb_other'), false);
  assert.deepEqual(answers.needs, ['housing']);
  assert.equal(answers.areas.housing.comment, 'Housing experience');
  for (const version of ['adult', 'youth']) {
    const result = plain(survey.cleanExport({ serving_nt: 'earlier', residence_area: 'litchfield', suburb: 'howard_springs', earlier_experience: 'Past local support' }, version, domainsFor(version)));
    assert.equal(result.answers.region, 'litchfield');
    assert.equal(result.answers.suburb, 'howard_springs');
  }
});

// Approved structure revision: preserve adult depth while making programme planning
// independent of past unmet needs and of the serving member's posting location.
test('explicit residence areas drive routes even when the member served elsewhere or the optional suburb is absent', () => {
  for (const serving_nt of ['yes', 'recent', 'earlier', 'no', 'unsure', undefined]) {
    for (const residence_area of ['darwin', 'palmerston', 'litchfield', 'greater_darwin_other']) {
      for (const suburb of [undefined, '', 'prefer', 'other']) {
        const answers = { roles: ['partner'], serving_nt, residence_area, suburb };
        assert.equal(survey.consultationRoute(answers), 'current_local');
        assert.equal(survey.residenceScope(answers), 'greater_darwin');
        assert.equal(survey.isOutsideSurveyScope(answers), false);
        assert.ok(stepsFor(answers).some(step => step.id === 'needs'));
        assert.ok(stepsFor(answers).some(step => step.id === 'future'));
      }
    }
  }
  for (const residence_area of ['prefer', undefined, '', 'NOT_AN_AREA']) {
    const answers = { roles: ['partner'], residence_area, suburb: 'wagaman' };
    assert.equal(survey.consultationRoute(answers), 'residence_unspecified');
    assert.equal(survey.isOutsideSurveyScope(answers), false, 'Non-disclosure is not a declaration of ineligibility');
    assert.equal(survey.residenceScope(answers), 'not_disclosed_or_unspecified');
  }
  const formerLocal = { roles: ['partner'], residence_area: 'outside', past_residence: 'yes', serving_nt: 'yes' };
  assert.equal(survey.consultationRoute(formerLocal), 'earlier_experience');
  assert.deepEqual(stepsFor(formerLocal).map(step => step.id), ['connection', 'earlier', 'review']);
  assert.equal(survey.isOutsideSurveyScope({ ...formerLocal, past_residence: 'no' }), true);
  assert.equal(survey.isOutsideSurveyScope({ roles: ['none'], residence_area: 'darwin' }), true);
});

test('adults can describe every selected recent and future topic without a focus cap', () => {
  const domains = domainsFor('adult');
  const needs = plain(domains).map(domain => domain.id);
  const answers = { roles: ['partner'], residence_area: 'darwin', suburb: 'wagaman', needs_status: 'yes', needs, future_needs: needs, areas: {} };
  for (const id of needs) answers.areas[id] = { received: 'some', support_requested: `Request for ${id}`, formats: ['phone'], sources: ['community'], barriers: ['waiting'], comment: `Experience of ${id}` };
  survey.setContext('adult', answers);
  const areas = plain(survey.buildSteps(answers, domains, 'adult')).filter(step => step.need);
  assert.deepEqual(areas.map(step => step.need), needs);
  for (const step of areas) {
    const fields = survey.page(step).fields;
    assert.ok(fields.every(field => !field.required));
    assert.equal(survey.requiredAnswersComplete(fields.filter(survey.conditionalVisible), {}), true);
    assert.deepEqual(plain(fields).map(field => field.key.split(':').at(-1)), ['received', 'sources', 'service_names', 'barriers', 'comment', 'support_requested', 'formats', 'format_other']);
  }
  const output = plain(survey.cleanExport(answers, 'adult', domains));
  assert.deepEqual(output.answers.areas, answers.areas);
  assert.equal(output.details_optional, true);
});

test('No past need still permits future topics, child stages and shared practical arrangements', () => {
  const answers = { roles: ['partner'], residence_area: 'darwin', suburb: 'wagaman', needs_status: 'no', future_needs: ['childcare', 'housing'], future_priority: 'childcare', future_ideas: 'More peer support for new arrivals.', children_ages: ['under5'], areas: { childcare: { support_requested: 'Flexible child care', formats: ['group'] }, housing: { support_requested: 'Clear information', formats: ['self_guided'] } }, times: ['weekend'], participation_enablers: ['bring_children'], practical_note: 'Childcare group in Palmerston would suit.', in_person_areas: ['palmerston'] };
  const domains = survey.setContext('adult', answers);
  const ids = plain(survey.buildSteps(answers, domains, 'adult')).map(step => step.id);
  assert.deepEqual(ids, ['connection', 'place', 'needs', 'future', 'area:childcare', 'area:housing', 'practical', 'review']);
  for (const [step, keys] of [['future', ['future_needs', 'future_priority', 'future_ideas', 'children_ages']], ['practical', ['participation_enablers', 'times', 'in_person_areas', 'practical_note']]]) {
    for (const key of keys) assert.equal(survey.conditionalVisible(survey.page({ id: step }).fields.find(field => field.key === key)), true, key);
  }
  const result = plain(survey.cleanExport(answers, 'adult', domains));
  for (const key of ['future_needs', 'future_priority', 'future_ideas', 'children_ages', 'times', 'participation_enablers', 'practical_note', 'in_person_areas']) assert.deepEqual(result.answers[key], answers[key]);
  assert.deepEqual(result.answers.areas, answers.areas);
  assert.doesNotMatch(JSON.stringify(result), /berrimah|programmes|participation_formats/i);
});

test('children age stages appear for relevant adult recent or future topics only', () => {
  for (const selected of [{ needs_status: 'yes', needs: ['childcare'] }, { needs_status: 'yes', needs: ['schooling'] }, { needs_status: 'yes', needs: ['parenting_caring'] }, { needs_status: 'no', future_needs: ['childcare'] }, { needs_status: 'no', future_needs: ['parenting_caring'] }]) {
    const answers = { ...selected, children_ages: ['under5', '5to11'] };
    const domains = survey.setContext('adult', answers);
    const ages = survey.page({ id: 'future' }).fields.find(field => field.key === 'children_ages');
    assert.equal(survey.conditionalVisible(ages), true);
    assert.equal(ages.required, undefined);
    assert.deepEqual(plain(survey.cleanExport(answers, 'adult', domains)).answers.children_ages, ['under5', '5to11']);
  }
  const answers = { needs_status: 'yes', needs: ['housing'], future_needs: ['housing'], children_ages: ['under5'] };
  const domains = survey.setContext('adult', answers);
  assert.equal(survey.conditionalVisible(survey.page({ id: 'future' }).fields.find(field => field.key === 'children_ages')), false);
  survey.reconcileAnswers(answers, 'future_needs', domains, ['childcare']);
  assert.equal(hasOwn(answers, 'children_ages'), false);
  assert.equal(pageFor('future', 'youth').fields.some(field => field.key === 'children_ages'), false);
});

test('practical page uses venue-neutral areas and conditionally asks timing and in-person location', () => {
  for (const [formats, timing, inPerson] of [[['group'], true, true], [['one_to_one'], true, true], [['phone'], true, false], [['video_one_to_one'], true, false], [['online_group'], true, false], [['self_guided'], false, false], [['self_guided', 'group'], true, true]]) {
    const answers = { future_needs: ['housing'], areas: { housing: { formats } }, times: ['weekend'], in_person_areas: ['palmerston'], participation_enablers: ['transport'] };
    const domains = survey.setContext('adult', answers);
    const fields = survey.page({ id: 'practical' }).fields;
    assert.ok(stepsFor(answers).some(step => step.id === 'practical'));
    assert.doesNotMatch(JSON.stringify(fields), /Berrimah|berrimah_access|Lutheran Care in Berrimah/i);
    assert.equal(survey.conditionalVisible(fields.find(field => field.key === 'times')), timing);
    assert.equal(survey.conditionalVisible(fields.find(field => field.key === 'in_person_areas')), inPerson);
    survey.reconcileAnswers(answers, 'areas:housing:formats', domains, ['group']);
    assert.equal(hasOwn(answers, 'times'), timing);
    assert.equal(hasOwn(answers, 'in_person_areas'), inPerson);
    assert.deepEqual(answers.participation_enablers, ['transport']);
  }
});

test('removing future and practical Other choices clears only dependent text and priority', () => {
  const answers = { future_needs: ['housing'], future_needs_other: 'Old future topic', future_priority: 'childcare', participation_enablers: ['transport'], enablers_other: 'Old enabler', needs_status: 'yes', needs: ['housing'], areas: { housing: areaBlock() } };
  const domains = survey.setContext('adult', answers);
  survey.reconcileAnswers(answers, 'future_needs', domains, ['housing', 'future_other_need', 'childcare']);
  assert.equal(hasOwn(answers, 'future_needs_other'), false);
  assert.equal(hasOwn(answers, 'future_priority'), false);
  assert.equal(answers.enablers_other, 'Old enabler');
  survey.reconcileAnswers(answers, 'participation_enablers', domains, ['transport', 'other']);
  assert.equal(hasOwn(answers, 'enablers_other'), false);
  assert.deepEqual(answers.areas.housing, areaBlock());
  const stale = { ...answers, future_needs_other: 'HIDDEN_FUTURE_OTHER', future_priority: 'childcare', enablers_other: 'HIDDEN_ENABLER', programmes: ['HIDDEN_PROGRAMME'], berrimah_other: 'HIDDEN_LOCATION' };
  const result = plain(survey.cleanExport(stale, 'adult', domains));
  assert.doesNotMatch(JSON.stringify(result), /HIDDEN_/);
  assert.equal(hasOwn(result.answers, 'future_priority'), false);
});

test('adding or removing a sought source preserves barriers but changing the branch clears only that area', () => {
  for (const [before, after] of [[['community'], ['community', 'health']], [['community', 'health'], ['health']]]) {
    const answers = { needs_status: 'yes', needs: ['housing', 'transport'], areas: { housing: { ...areaBlock(), sources: after, barriers: ['waiting'] }, transport: areaBlock('Transport') } };
    const domains = survey.setContext('adult', answers);
    survey.reconcileAnswers(answers, 'areas:housing:sources', domains, before);
    assert.deepEqual(answers.areas.housing.barriers, ['waiting']);
    assert.equal(answers.areas.housing.comment, 'Housing experience');
    assert.deepEqual(answers.areas.transport, areaBlock('Transport'));
  }
  for (const [before, after] of [[['community'], ['not_sought']], [['not_sought'], ['community']], [['community'], ['unsure']], [['community'], []]]) {
    const answers = { needs_status: 'yes', needs: ['housing'], areas: { housing: { ...areaBlock(), sources: after } } };
    const domains = survey.setContext('adult', answers);
    survey.reconcileAnswers(answers, 'areas:housing:sources', domains, before);
    assert.equal(hasOwn(answers.areas.housing, 'barriers'), false);
    assert.equal(answers.areas.housing.comment, 'Housing experience');
    assert.equal(answers.areas.housing.received, 'some');
  }
});

test('schema 7.2 exports locality and topic preferences without reinterpreting legacy global fields', () => {
  const answers = { roles: ['partner'], residence_area: 'litchfield', suburb: 'howard_springs', serving_nt: 'no', force: 'adf', delivery: ['information'], region: 'outside_au', needs_status: 'no', programmes: ['connection'], participation_formats: ['group'], future_needs: ['housing'], areas: { housing: { support_requested: 'A clear guide', formats: ['group'] } }, times: ['weekend'] };
  const domains = survey.setContext('adult', answers);
  const result = plain(survey.cleanExport(answers, 'adult', domains));
  assert.equal(result.schema_version, '7.2');
  assert.equal(result.questionnaire_revision, '2026-09-28-topic-linked-support');
  assert.equal(result.consultation_route, 'current_local');
  assert.equal(result.residence_scope, 'greater_darwin');
  assert.equal(result.recall_geography, 'time_living_in_greater_darwin');
  assert.equal(result.analysis_unit, 'respondent_perspective_not_household');
  assert.equal(result.answers.region, 'litchfield');
  assert.deepEqual(result.answers.future_needs, ['housing']);
  assert.deepEqual(result.answers.areas.housing, { support_requested: 'A clear guide', formats: ['group'] });
  for (const key of ['serving_nt', 'force', 'delivery', 'programmes', 'participation_formats']) assert.equal(hasOwn(result.answers, key), false);
  const oldOnly = plain(survey.cleanExport({ delivery: ['information'], serving_nt: 'yes', force: 'adf' }, 'adult', domains));
  assert.equal(hasOwn(oldOnly.answers, 'future_needs'), false, 'Legacy information preferences do not create a future topic');
  assert.equal(oldOnly.residence_scope, 'not_disclosed_or_unspecified');
});

test('service names are optional adult detail, preserved for organisations and removed for informal sources', () => {
  for (const sources of [['military'], ['community'], ['health'], ['school'], ['online'], ['other'], ['family', 'community']]) {
    const answers = { needs_status: 'yes', needs: ['housing'], areas: { housing: { sources, service_names: 'Named organisation', barriers: ['waiting'], comment: 'My experience' } } };
    const domains = survey.setContext('adult', answers);
    const f = survey.areaPage('housing').fields.find(field => field.key.endsWith(':service_names'));
    assert.equal(f.required, undefined);
    assert.equal(survey.conditionalVisible(f), true);
    assert.match(f.hint, /do not name individual staff/);
    assert.equal(survey.cleanExport(answers, 'adult', domains).answers.areas.housing.service_names, 'Named organisation');
  }
  const answers = { needs_status: 'yes', needs: ['housing'], areas: { housing: { sources: ['family'], service_names: 'OLD_ORGANISATION', barriers: ['waiting'], comment: 'My experience' } } };
  const domains = survey.setContext('adult', answers);
  const f = survey.areaPage('housing').fields.find(field => field.key.endsWith(':service_names'));
  assert.equal(survey.conditionalVisible(f), false);
  assert.equal(hasOwn(survey.cleanExport(answers, 'adult', domains).answers.areas.housing, 'service_names'), false);
  survey.reconcileAnswers(answers, 'areas:housing:sources', domains, ['family', 'community']);
  assert.equal(hasOwn(answers.areas.housing, 'service_names'), false);
  assert.deepEqual(answers.areas.housing.barriers, ['waiting'], 'The sought-help branch did not change');
  for (const version of ['youth', 'child']) {
    const id = survey.DOMAINS[version][0].id;
    const answers = { needs_status: 'yes', needs: [id], focus_need: id, areas: { [id]: { sources: ['school'], service_names: 'NOT_REQUESTED' } } };
    const domains = survey.setContext(version, answers);
    assert.equal(survey.areaPage(id).fields.some(field => field.key.endsWith(':service_names')), false);
    assert.equal(hasOwn(survey.cleanExport(answers, version, domains).answers.areas[id], 'service_names'), false);
  }
});

test('review omits repeated optional blanks but keeps an edit entry for unanswered sections', () => {
  survey.setContext('adult', { roles: ['partner'], residence_area: 'darwin', suburb: 'wagaman', needs_status: 'yes', needs: ['housing'], areas: { housing: { received: 'some', comment: 'A useful comment' } } });
  const html = survey.reviewHTML();
  assert.doesNotMatch(html, /Not answered/);
  assert.match(html, /No optional answers added/);
  assert.match(html, /A useful comment/);
  assert.match(html, /data-edit="area:housing"/);
  assert.match(html, /data-edit="future"/);
  assert.doesNotMatch(html, /data-edit="practical"/, 'No future topic means no practical page');
});

test('reducing future topics to one removes hidden priority without changing remaining topics', () => {
  const answers = { future_needs: ['childcare'], future_priority: 'childcare', children_ages: ['under5'], areas: { childcare: { formats: ['self_guided'] } } };
  const domains = survey.setContext('adult', answers);
  assert.equal(survey.conditionalVisible(survey.page({ id: 'future' }).fields.find(field => field.key === 'future_priority')), false);
  assert.equal(hasOwn(survey.cleanExport(answers, 'adult', domains).answers, 'future_priority'), false);
  survey.reconcileAnswers(answers, 'future_needs', domains, ['childcare', 'housing']);
  assert.equal(hasOwn(answers, 'future_priority'), false);
  assert.deepEqual(answers.future_needs, ['childcare']);
  assert.deepEqual(answers.children_ages, ['under5']);
});
