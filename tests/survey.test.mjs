import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

// Load the actual respondent definitions, without booting the browser UI.
// No third-party DOM, network connection, or build step is needed.
const source = readFileSync(new URL('../survey.js', import.meta.url), 'utf8');
const bootstrap = source.lastIndexOf("if (document.body.dataset.view === 'questions')");
assert.ok(bootstrap > 0, 'The survey bootstrap must be identifiable');
const context = vm.createContext({
  structuredClone,
  URL,
  document: { querySelector: () => null },
});
vm.runInContext(`${source.slice(0, bootstrap)}
  globalThis.survey = {
    DOMAINS, SPECIAL_NEEDS, NO_PRIORITY, toggleChoice, selectedNeeds,
    selectedPriorities, hasPriority, hasSoughtHelp, reconcileAnswers, buildSteps, cleanExport,
    requiredAnswersComplete, thankYouResource, thankYouResourceHTML,
    page, period, conditionalVisible, reviewHTML, locationFrame,
    questionnaireVersion, needsGuardianPermission, guardianPermissionRecord,
    participationRecord, hasValidParticipation, isOutsideSurveyScope,
    setContext(version, answers = {}) {
      state.version = version;
      state.age = version;
      state.answers = answers;
      return domainList();
    },
    getContext: () => ({ version: state.version, answers: state.answers }),
    setParticipationContext(age, participation = null, guardianPermission = null) {
      state.age = age;
      state.version = questionnaireVersion(age);
      state.participation = participation;
      state.guardianPermission = guardianPermission;
    },
    librarySections: typeof questionLibrarySections === 'function'
      ? questionLibrarySections : null,
  };
`, context, { filename: 'survey.js' });
const survey = context.survey;
// Objects created inside a VM have different prototypes; compare JSON values.
const plain = value => JSON.parse(JSON.stringify(value));
const hasOwn = (object, key) => Object.hasOwn(object, key);
const details = () => ({
  impact: 'a_lot', help: ['family'], barriers: ['cost'], change: 'A useful change',
  delivery: ['phone'], times: ['weekend'], another_priority: 'An earlier topic',
});
const domainsFor = version => survey.setContext(version);
const pageFor = (id, version = 'adult', answers = {}) => {
  survey.setContext(version, answers);
  return plain(survey.page({ id }));
};

test('exclusive answers replace ordinary choices, and ordinary choices replace exclusives', () => {
  for (const exclusive of [
    ['none', 'unsure', 'prefer'],
    ['not_sought', 'unsure', 'prefer'],
    ['no_preference', 'prefer'],
  ]) {
    for (const value of exclusive) {
      const previous = ['family', 'community'];
      assert.deepEqual(plain(survey.toggleChoice(previous, value, exclusive)), [value]);
      assert.deepEqual(previous, ['family', 'community'], 'Toggling must not mutate the old array');
      assert.deepEqual(plain(survey.toggleChoice([value], 'family', exclusive)), ['family']);
      assert.deepEqual(plain(survey.toggleChoice([value], value, exclusive)), []);
    }
  }
  assert.deepEqual(plain(survey.toggleChoice(undefined, 'family')), ['family']);
  assert.deepEqual(plain(survey.toggleChoice(['family', 'community'], 'family')), ['community']);
});

test('needs and help classifiers distinguish substantive answers from explicit non-answers', () => {
  const domains = domainsFor('adult');
  assert.deepEqual(plain(survey.selectedNeeds({ needs: ['housing', 'none', 'unsure', 'prefer', 'unknown', 'other_need'] }, domains)), ['housing', 'other_need']);
  for (const priority of [undefined, '', [], ['none'], ['unsure'], ['prefer']]) {
    assert.equal(survey.hasPriority({ priority }), false);
  }
  for (const priority of [['housing'], ['another'], ['housing', 'transport']]) {
    assert.equal(survey.hasPriority({ priority }), true);
  }
  for (const help of [undefined, [], ['not_sought'], ['unsure'], ['prefer']]) {
    assert.equal(survey.hasSoughtHelp({ help }), false);
  }
  assert.equal(survey.hasSoughtHelp({ help: ['family'] }), true);
});

test('editing retrospective needs prunes only their adequacy answers and retains current needs', () => {
  const domains = domainsFor('adult');
  const answers = {
    needs: ['housing'], needs_other: 'Old detail',
    adequacy: { housing: 'enough', transport: 'some', other_need: 'none' },
    priority: ['transport', 'another'], ...details(), strengths: 'Friends', anything: 'Keep this',
  };
  survey.reconcileAnswers(answers, 'needs', domains);
  assert.deepEqual(plain(answers.adequacy), { housing: 'enough' });
  assert.equal(hasOwn(answers, 'needs_other'), false);
  assert.deepEqual(answers.priority, ['transport', 'another']);
  for (const [key, value] of Object.entries(details())) assert.deepEqual(answers[key], value, key);
  assert.equal(answers.strengths, 'Friends');
  assert.equal(answers.anything, 'Keep this');

  answers.needs = ['none'];
  survey.reconcileAnswers(answers, 'needs', domains);
  assert.deepEqual(plain(answers.adequacy), {});
  assert.deepEqual(answers.priority, ['transport', 'another'], 'No past need does not erase a current need');
  assert.equal(answers.impact, 'a_lot');
});

test('changing the current need set or its other text clears collective follow-up only', () => {
  const domains = domainsFor('adult');
  for (const priority of [['housing'], ['housing', 'transport'], ['none'], []]) {
    const answers = { needs: ['housing'], priority, adequacy: { housing: 'some' }, ...details() };
    survey.reconcileAnswers(answers, 'priority', domains);
    for (const key of Object.keys(details())) assert.equal(hasOwn(answers, key), false, key);
    assert.deepEqual(answers.priority, priority);
    assert.deepEqual(answers.adequacy, { housing: 'some' });
  }

  const another = { priority: ['housing', 'another'], ...details(), another_priority: 'New topic' };
  survey.reconcileAnswers(another, 'another_priority', domains);
  assert.equal(another.another_priority, 'New topic');
  for (const key of Object.keys(details()).filter(key => key !== 'another_priority')) {
    assert.equal(hasOwn(another, key), false, key);
  }

  const otherNeed = {
    needs: ['other_need'], priority: ['another'], needs_other: 'New retrospective wording',
    adequacy: { other_need: 'none', housing: 'some' }, ...details(),
  };
  survey.reconcileAnswers(otherNeed, 'needs_other', domains);
  assert.equal(hasOwn(otherNeed.adequacy, 'other_need'), false);
  assert.equal(otherNeed.adequacy.housing, 'some');
  assert.equal(otherNeed.impact, 'a_lot', 'Editing a past need does not invalidate a separate current need');
  assert.equal(otherNeed.another_priority, 'An earlier topic');
  assert.equal(otherNeed.needs_other, 'New retrospective wording');
});

test('help and delivery changes clear their dependent follow-up only', () => {
  const domains = domainsFor('adult');
  const answers = { roles: ['partner'], ...details(), needs: ['housing'] };
  survey.reconcileAnswers(answers, 'help', domains);
  assert.equal(hasOwn(answers, 'barriers'), false);
  assert.equal(answers.impact, 'a_lot');
  for (const delivery of [['text'], ['information'], ['referral'], ['no_preference'], ['prefer'], []]) {
    const response = { delivery, times: ['weekend'], change: 'Keep this' };
    survey.reconcileAnswers(response, 'delivery', domains);
    assert.equal(hasOwn(response, 'times'), false);
    assert.equal(response.change, 'Keep this');
  }
  for (const delivery of [['phone'], ['video'], ['group'], ['one_to_one'], ['information', 'phone']]) {
    const response = { delivery, times: ['weekend'] };
    survey.reconcileAnswers(response, 'delivery', domains);
    assert.deepEqual(response.times, ['weekend']);
  }
});

test('moving into or out of the NT clears answers whose location frame has changed', () => {
  const domains = domainsFor('adult');
  for (const [previous, region] of [
    ['darwin', 'outside_au'], ['outside_overseas', 'katherine'],
  ]) {
    const answers = {
      roles: ['partner'], serving_nt: 'yes', force: 'adf', region, time_nt: 'over3',
      strengths: 'Keep in original frame only', needs: ['housing'], needs_other: 'Earlier',
      adequacy: { housing: 'some' }, priority: ['housing'], ...details(), anything: 'Earlier context',
    };
    survey.reconcileAnswers(answers, 'region', domains, previous);
    for (const key of ['strengths', 'needs', 'needs_other', 'adequacy', 'priority', ...Object.keys(details()), 'anything']) {
      assert.equal(hasOwn(answers, key), false, key);
    }
    assert.equal(answers.region, region);
    assert.deepEqual(answers.roles, ['partner']);
    if (region.startsWith('outside_')) assert.equal(hasOwn(answers, 'time_nt'), false);
  }
  for (const [previous, region] of [['darwin', 'katherine'], ['outside_au', 'outside_overseas']]) {
    const answers = { region, strengths: 'Still relevant', needs: ['housing'], priority: ['housing'], ...details() };
    survey.reconcileAnswers(answers, 'region', domains, previous);
    assert.equal(answers.strengths, 'Still relevant');
    assert.deepEqual(answers.priority, ['housing']);
    assert.equal(answers.impact, 'a_lot');
  }
});

test('all three age branches have stable base steps and paired adequacy pages', () => {
  for (const [version, maxSteps, rawDomainCount] of [['adult', 20, 15], ['youth', 17, 8], ['child', 15, 6]]) {
    const domains = domainsFor(version);
    assert.equal(survey.DOMAINS[version].length, rawDomainCount);
    for (const priority of [undefined, [], ['none'], ['unsure'], ['prefer']]) {
      const steps = plain(survey.buildSteps({ priority }, domains, version));
      assert.deepEqual(steps.map(step => step.id), ['connection', 'place', 'strengths', 'needs', 'priority', 'anything', 'review']);
    }
    const needs = domains.map(domain => domain.id);
    const steps = plain(survey.buildSteps({ needs, priority: [needs[0]] }, domains, version));
    assert.equal(steps.length, maxSteps, version);
    const adequacySteps = steps.filter(step => step.id.startsWith('adequacy-'));
    assert.equal(adequacySteps.length, Math.ceil(needs.length / 2));
    assert.deepEqual(adequacySteps.flatMap(step => step.domains), plain(needs));
    assert.ok(adequacySteps.every(step => step.domains.length > 0 && step.domains.length <= 2));
    assert.equal(steps.some(step => step.id === 'delivery'), version !== 'child');
    assert.equal(new Set(steps.map(step => step.id)).size, steps.length);
  }
});

test('export preserves no-need, unsure, prefer and skipped responses as different states', () => {
  const domains = domainsFor('adult');
  for (const value of ['none', 'unsure', 'prefer']) {
    const answers = { needs: [value], priority: [value], adequacy: { housing: 'enough' }, ...details() };
    const original = structuredClone(answers);
    const result = plain(survey.cleanExport(answers, 'adult', domains));
    assert.equal(result.schema_version, '2.0');
    assert.equal(result.follow_up_scope, 'selected_current_needs_collectively');
    assert.equal(result.questionnaire_version, 'adult');
    assert.equal(result.storage, 'downloaded_by_respondent; not submitted');
    assert.deepEqual(result.answers.needs, [value]);
    assert.deepEqual(result.answers.priority, [value]);
    assert.deepEqual(result.answers.adequacy, {});
    for (const key of Object.keys(details())) assert.equal(hasOwn(result.answers, key), false, key);
    assert.deepEqual(answers, original, 'Export must not mutate answers on screen');
  }
  const skipped = plain(survey.cleanExport({}, 'adult', domains));
  assert.equal(hasOwn(skipped.answers, 'needs'), false);
  assert.equal(hasOwn(skipped.answers, 'priority'), false);
  const cleared = plain(survey.cleanExport({ needs: [] }, 'adult', domains));
  assert.deepEqual(cleared.answers.needs, []);
});

test('export retains adequacy distinctions and marks skipped active ratings as null', () => {
  const domains = domainsFor('adult');
  const answers = {
    roles: ['partner'], financial_dependence: 'yes', care_dependence: 'yes',
    region: 'outside_au', time_nt: 'over3',
    needs: ['housing', 'transport', 'childcare', 'physical_health', 'emotional_wellbeing'],
    adequacy: { housing: 'none', transport: 'unsure', childcare: 'prefer', emotional_wellbeing: 'enough', schooling: 'some' },
    priority: ['housing'], help: ['not_sought'], barriers: ['privacy'],
  };
  const result = plain(survey.cleanExport(answers, 'adult', domains));
  assert.deepEqual(result.answers.adequacy, {
    housing: 'none', transport: 'unsure', childcare: 'prefer', physical_health: null, emotional_wellbeing: 'enough',
  });
  for (const key of ['financial_dependence', 'care_dependence', 'time_nt']) assert.equal(hasOwn(result.answers, key), false, key);
  assert.deepEqual(result.answers.help, ['not_sought']);
  assert.deepEqual(result.answers.barriers, ['privacy']);
});

test('the child timeframe stays at three months inside and outside the NT', () => {
  for (const region of ['darwin', 'outside_au', 'outside_overseas']) {
    const needs = pageFor('needs', 'child', { region });
    assert.match(needs.intro, /three months/);
    assert.doesNotMatch(needs.intro, /six months/);
    if (region.startsWith('outside_')) {
      assert.match(needs.intro, /family member has been serving in the NT/);
      assert.doesNotMatch(needs.intro, /time here|since you arrived/);
    }
  }
  for (const version of ['adult', 'youth']) {
    assert.match(pageFor('needs', version, { region: 'outside_au' }).intro, /six months/);
  }
  for (const version of ['adult', 'youth', 'child']) {
    const place = pageFor('place', version, { region: 'outside_au' });
    assert.equal(survey.conditionalVisible(place.fields.find(field => field.key === 'time_nt')), false);
  }
});

test('barriers distinguish seeking help, not seeking help and an unanswered help question', () => {
  const sought = pageFor('barriers', 'youth', { priority: ['school_learning'], help: ['school'] });
  assert.match(sought.fields[0].label, /made it harder to get help/);
  const options = Object.fromEntries(sought.fields[0].options.map(option => [option.id, option.label]));
  assert.equal(options.not_know_where, 'I did not know where to go');
  assert.equal(options.no_trusted_person, 'I did not have someone I trusted to ask');
  assert.equal(options.privacy, 'I worried about who would be told');
  assert.equal(options.not_understood, 'I felt people would not understand');
  assert.equal(options.none, 'Nothing made it harder');
  assert.equal(hasOwn(options, 'prefer_not_to_say'), false);

  const notSought = pageFor('barriers', 'adult', { priority: ['housing'], help: ['not_sought'] });
  assert.equal(notSought.title, "What influenced your decision?");
  assert.match(notSought.fields[0].label, /reasons apply/);
  assert.ok(notSought.fields[0].options.some(option => option.id === 'eligibility_concern'));
  assert.equal(notSought.fields[0].options.some(option => option.id === 'eligibility_refused'), false);

  for (const help of [undefined, ['unsure'], ['prefer']]) {
    const neutral = pageFor('barriers', 'adult', { priority: ['housing'], help });
    assert.match(neutral.fields[0].label, /^If you have tried to get help/);
    assert.doesNotMatch(neutral.fields[0].label, /Which reasons apply/);
  }
});

test('each age and location path has unique option IDs and matching rendered review meanings', () => {
  for (const version of ['adult', 'youth', 'child']) {
    for (const region of ['darwin', 'outside_au']) {
      const domains = survey.setContext(version, { region });
      const answers = { region, roles: ['child'], needs: domains.map(domain => domain.id), priority: [domains[0].id], help: ['family'] };
      survey.setContext(version, answers);
      const steps = survey.buildSteps(answers, domains, version);
      for (const step of steps) {
        const page = survey.page(step);
        assert.ok(page.title, `${version}: ${step.id}`);
        assert.equal(typeof page.intro, 'string', 'Intro is optional; a clear question does not require extra prose');
        for (const field of page.fields) {
          assert.equal(new Set(field.options.map(option => option.id)).size, field.options.length, `${version}: ${field.key}`);
        }
      }
    }
    survey.setContext(version, { needs: ['none'], priority: ['prefer'] });
    const review = survey.reviewHTML();
    assert.match(review, version === 'child' ? /I did not need help with these things/ : /I did not need support in these areas/);
    assert.match(review, /Prefer not to answer/);
    assert.match(review, /Not answered/);
  }
});

test('the question library covers all six age/location combinations and all help paths', () => {
  assert.equal(typeof survey.librarySections, 'function');
  for (const version of ['adult', 'youth', 'child']) {
    for (const location of ['nt', 'outside']) {
      const sections = plain(survey.librarySections(version, location));
      assert.equal(sections.length, version === 'child' ? 11 : 12);
      assert.equal(new Set(sections.map(section => section.id)).size, sections.length);
      assert.equal(sections.some(section => section.id === 'delivery'), version !== 'child');
      const adequacy = sections.find(section => section.id === 'adequacy');
      assert.equal(adequacy.fields.length, survey.DOMAINS[version].length + 1);
      const barriers = sections.find(section => section.id === 'barriers');
      assert.deepEqual(barriers.variants.map(variant => variant.id), ['sought', 'not-sought', 'unknown']);
      assert.match(barriers.variants[0].fields[0].label, /made it harder to get help/);
      assert.match(barriers.variants[1].fields[0].label, /reasons apply/);
      assert.match(barriers.variants[2].fields[0].label, /^If you have tried to get help/);
      const needs = sections.find(section => section.id === 'needs');
      assert.match(needs.intro, version === 'child' ? /three months/ : /six months/);
      if (location === 'outside') assert.match(needs.intro, version === 'adult' ? /you or someone in your family has been serving in the NT/ : /family member has been serving in the NT/);
    }
  }
});

test('review library wording matches live questions and never alters respondent answers', () => {
  const answers = { region: 'outside_overseas', needs: ['feelings'], priority: ['feelings'], help: ['family'], anything: 'My own answer' };
  survey.setContext('child', answers);
  const original = structuredClone(answers);
  const originalReview = survey.reviewHTML();
  for (const version of ['adult', 'youth', 'child']) {
    const sections = plain(survey.librarySections(version, 'outside'));
    assert.equal(survey.getContext().version, 'child');
    assert.equal(survey.getContext().answers, answers, 'Restore the original answers object');
    assert.deepEqual(answers, original);
    assert.equal(survey.reviewHTML(), originalReview);
    const previewAnswers = { roles: ['child'], region: 'outside_au', priority: [survey.DOMAINS[version][0].id], help: ['family'] };
    for (const id of ['connection', 'place', 'strengths', 'needs', 'priority', 'impact', 'help', 'change', 'anything']) {
      const live = pageFor(id, version, previewAnswers);
      const reference = sections.find(section => section.id === id);
      assert.equal(reference.title, live.title, `${version}: ${id}`);
      assert.equal(reference.intro, live.intro, `${version}: ${id}`);
      assert.deepEqual(reference.fields, live.fields, `${version}: ${id}`);
    }
    survey.setContext('child', answers);
  }
});


test('declining residence never assumes NT residence and clears earlier location-bound answers', () => {
  for (const version of ['adult','youth','child']) {
    const domains = survey.setContext(version, {region:'prefer'});
    const place = survey.page({id:'place'});
    assert.equal(survey.conditionalVisible(place.fields.find(f=>f.key==='time_nt')),false);
    const needs = survey.page({id:'needs'});
    assert.doesNotMatch(needs.intro,/time here|since you arrived|months in the NT/);
    const response={region:'prefer',time_nt:'over3',needs:['housing'],priority:['housing'],...details()};
    survey.reconcileAnswers(response,'region',domains,'darwin');
    for(const key of ['time_nt','needs','priority','delivery','times'])assert.equal(hasOwn(response,key),false,key);
    assert.equal(hasOwn(survey.cleanExport({region:'prefer',time_nt:'over3'},version,domains).answers,'time_nt'),false);
  }
});

test('declining service help is exclusive and clears appointment-time preferences', () => {
  const p=pageFor('delivery','adult',{region:'darwin',priority:['housing']});
  const f=p.fields[0];
  for(const value of ['not_wanted','unsure']) {
    assert.ok(f.options.some(o=>o.id===value));
    assert.deepEqual(plain(survey.toggleChoice(['phone','referral'],value,f.exclusive)),[value]);
    const a={delivery:[value],times:['weekend']};
    survey.reconcileAnswers(a,'delivery',domainsFor('adult'));
    assert.equal(hasOwn(a,'times'),false);
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

test('survey eligibility depends on the military connection, never the respondent’s residence', () => {
  for (const region of ['darwin', 'palmerston', 'katherine', 'alice', 'other_nt', 'outside_au', 'outside_overseas', 'prefer', '', undefined]) {
    for (const roles of [['serving'], ['partner'], ['child'], ['parent'], ['other_family'], ['unsure']]) {
      for (const serving_nt of ['yes', 'unsure']) {
        assert.equal(survey.isOutsideSurveyScope({ region, roles, serving_nt }), false, `${region}: ${roles}: ${serving_nt}`);
      }
      assert.equal(survey.isOutsideSurveyScope({ region, roles, serving_nt: 'no' }), true);
    }
    assert.equal(survey.isOutsideSurveyScope({ region, roles: ['none'], serving_nt: 'yes' }), true);
  }
});

test('residence is optional in each questionnaire and blank residence uses an unspecified frame', () => {
  for (const version of ['adult', 'youth', 'child']) {
    for (const region of [undefined, '', 'prefer']) {
      const place = pageFor('place', version, { region });
      const residence = place.fields.find(field => field.key === 'region');
      assert.equal(Boolean(residence.required), false, `${version}: ${region}`);
      assert.ok(residence.options.some(option => option.id === 'outside_au'));
      assert.ok(residence.options.some(option => option.id === 'outside_overseas'));
      assert.ok(residence.options.some(option => option.id === 'prefer'));
      assert.equal(survey.locationFrame(region), 'unspecified');
      assert.equal(survey.conditionalVisible(place.fields.find(field => field.key === 'time_nt')), false);
      const needs = survey.page({ id: 'needs' });
      assert.doesNotMatch(needs.intro, /time here|since you arrived|months in the NT/);
      assert.match(needs.intro, version === 'child' ? /past three months/ : /past six months/);
      assert.equal(hasOwn(survey.cleanExport({ region, time_nt: 'over3' }, version, domainsFor(version)).answers, 'time_nt'), false);
    }
  }
});

test('clearing or changing an optional residence removes answers tied to the previous frame', () => {
  const domains = domainsFor('adult');
  for (const [previous, region] of [
    ['darwin', undefined], ['outside_au', ''], ['outside_overseas', 'prefer'],
    [undefined, 'darwin'], ['', 'outside_au'], ['prefer', 'katherine'],
  ]) {
    const answers = {
      region, roles: ['partner'], serving_nt: 'yes', force: 'adf',
      time_nt: 'over3', strengths: 'Earlier frame', needs: ['housing'], needs_other: 'Earlier topic',
      adequacy: { housing: 'some' }, priority: ['housing'], ...details(), anything: 'Earlier experience',
    };
    survey.reconcileAnswers(answers, 'region', domains, previous);
    for (const key of ['strengths', 'needs', 'needs_other', 'adequacy', 'priority', ...Object.keys(details()), 'anything']) {
      assert.equal(hasOwn(answers, key), false, `${previous} to ${region}: ${key}`);
    }
    for (const key of ['roles', 'serving_nt', 'force']) assert.equal(hasOwn(answers, key), true, key);
    if (survey.locationFrame(region) !== 'nt') assert.equal(hasOwn(answers, 'time_nt'), false);
  }
  for (const [previous, region] of [[undefined, 'prefer'], ['prefer', ''], ['', undefined]]) {
    const answers = { region, time_nt: 'over3', strengths: 'Still relevant', needs: ['housing'], priority: ['housing'], ...details() };
    survey.reconcileAnswers(answers, 'region', domains, previous);
    assert.equal(answers.strengths, 'Still relevant', 'Changing how residence is withheld does not change the question frame');
    assert.deepEqual(answers.priority, ['housing']);
    assert.equal(answers.impact, 'a_lot');
    assert.equal(hasOwn(answers, 'time_nt'), false);
  }
});

test('current support needs allow multiple selections from the full list regardless of past needs', () => {
  for (const version of ['adult', 'youth', 'child']) {
    const domainIds = plain(survey.DOMAINS[version]).map(domain => domain.id);
    for (const needs of [undefined, [], ['none'], ['prefer'], [domainIds[0]]]) {
      const current = pageFor('priority', version, { needs, region: 'darwin' });
      const field = current.fields.find(field => field.key === 'priority');
      assert.equal(field.type, 'multi');
      assert.deepEqual(field.options.filter(option => domainIds.includes(option.id)).map(option => option.id), domainIds);
      assert.ok(field.options.some(option => option.id === 'another'));
      const selected = plain(survey.toggleChoice([domainIds[0]], domainIds[1], field.exclusive));
      assert.deepEqual(selected, domainIds.slice(0, 2));
      for (const exclusive of ['none', 'unsure', 'prefer']) {
        assert.deepEqual(plain(survey.toggleChoice(selected, exclusive, field.exclusive)), [exclusive]);
        assert.deepEqual(plain(survey.toggleChoice([exclusive], domainIds[1], field.exclusive)), [domainIds[1]]);
      }
    }
  }
});

test('several current needs produce one collective follow-up sequence and preserve the full selection in export', () => {
  for (const version of ['adult', 'youth', 'child']) {
    const domains = survey.setContext(version, { region: 'darwin' });
    const current = plain(domains).slice(0, 3).map(domain => domain.id);
    const answers = { region: 'darwin', needs: [domains[0].id], priority: [...current, 'another'], another_priority: 'A separate current concern' };
    survey.setContext(version, answers);
    const steps = plain(survey.buildSteps(answers, domains, version));
    for (const id of ['impact', 'help', 'barriers', 'change']) {
      assert.equal(steps.filter(step => step.id === id).length, 1, `${version}: ${id}`);
    }
    assert.equal(steps.filter(step => step.id === 'delivery').length, version === 'child' ? 0 : 1);
    assert.deepEqual(steps.filter(step => step.id.startsWith('adequacy-')).flatMap(step => step.domains), answers.needs);
    const exported = plain(survey.cleanExport(answers, version, domains));
    assert.deepEqual(exported.answers.priority, [...current, 'another']);
    assert.equal(exported.answers.another_priority, 'A separate current concern');
    assert.equal(exported.follow_up_scope, 'selected_current_needs_collectively');
    const review = survey.reviewHTML();
    for (const domain of domains.slice(0, 3)) assert.ok(review.includes(domain.label), domain.label);
    assert.match(review, /A separate current concern/);
  }
});

test('per-need adequacy stays bound to domain IDs when needs are reordered or a paired page changes', () => {
  const domains = domainsFor('adult');
  const answers = {
    needs: ['housing', 'transport', 'childcare'],
    adequacy: { housing: 'enough', transport: 'none', childcare: 'some' },
    priority: ['housing', 'transport'],
  };
  answers.needs = ['childcare', 'housing'];
  survey.reconcileAnswers(answers, 'needs', domains);
  const pages = plain(survey.buildSteps(answers, domains, 'adult')).filter(step => step.id.startsWith('adequacy-'));
  assert.deepEqual(pages.map(step => step.domains), [['childcare', 'housing']]);
  assert.deepEqual(plain(survey.cleanExport(answers, 'adult', domains)).answers.adequacy, { childcare: 'some', housing: 'enough' });
  answers.needs.push('transport');
  survey.reconcileAnswers(answers, 'needs', domains);
  assert.deepEqual(plain(survey.cleanExport(answers, 'adult', domains)).answers.adequacy, { childcare: 'some', housing: 'enough', transport: null }, 'Re-added needs require a fresh rating');
});

test('required fields block an empty connection page while optional pages can continue empty', () => {
  for (const version of ['adult', 'youth', 'child']) {
    const connection = pageFor('connection', version);
    assert.equal(survey.requiredAnswersComplete(connection.fields, {}), false);
    assert.equal(survey.requiredAnswersComplete(connection.fields, { roles: [] }), false);
    assert.equal(survey.requiredAnswersComplete(connection.fields, { roles: ['child'] }), false);
    assert.equal(survey.requiredAnswersComplete(connection.fields, { serving_nt: 'yes' }), false);
    assert.equal(survey.requiredAnswersComplete(connection.fields, { roles: ['child'], serving_nt: 'yes' }), true, 'Optional force selection is not needed to continue');
    assert.equal(survey.requiredAnswersComplete(connection.fields, { roles: ['child'], serving_nt: 'unsure' }), true);
    for (const id of ['place', 'strengths', 'needs', 'priority', 'impact', 'help', 'barriers', 'change', 'anything']) {
      const p = pageFor(id, version);
      assert.equal(survey.requiredAnswersComplete(p.fields.filter(survey.conditionalVisible), {}), true, `${version}: ${id}`);
    }
  }
});

test('removed caring and dependence questions are absent and old answers cannot enter exports', () => {
  const removed = ['caring', 'financial_dependence', 'care_dependence'];
  for (const version of ['adult', 'youth', 'child']) {
    for (const location of ['nt', 'outside', 'unspecified']) {
      const sections = plain(survey.librarySections(version, location));
      const fields = sections.flatMap(section => [...section.fields, ...(section.variants || []).flatMap(variant => variant.fields)]);
      for (const key of removed) assert.equal(fields.some(field => field.key === key), false, `${version}/${location}: ${key}`);
    }
    const oldAnswers = { roles: ['child'], caring: ['under18'], financial_dependence: 'yes', care_dependence: 'sometimes', needs: ['none'], priority: ['none'] };
    const result = plain(survey.cleanExport(oldAnswers, version, domainsFor(version)));
    for (const key of removed) {
      assert.equal(hasOwn(result.answers, key), false, key);
      assert.equal(hasOwn(oldAnswers, key), true, 'Export must not mutate the original object');
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
