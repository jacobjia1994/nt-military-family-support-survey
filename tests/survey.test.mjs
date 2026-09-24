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
  document: { querySelector: () => null },
});
vm.runInContext(`${source.slice(0, bootstrap)}
  globalThis.survey = {
    DOMAINS, SPECIAL_NEEDS, NO_PRIORITY, toggleChoice, selectedNeeds,
    hasPriority, hasSoughtHelp, reconcileAnswers, buildSteps, cleanExport,
    page, period, conditionalVisible, reviewHTML,
    setContext(version, answers = {}) {
      state.version = version;
      state.age = version;
      state.answers = answers;
      return domainList();
    },
    getContext: () => ({ version: state.version, answers: state.answers }),
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
  for (const priority of [undefined, '', 'none', 'unsure', 'prefer']) {
    assert.equal(survey.hasPriority({ priority }), false);
  }
  for (const priority of ['housing', 'another', 'other_need']) {
    assert.equal(survey.hasPriority({ priority }), true);
  }
  for (const help of [undefined, [], ['not_sought'], ['unsure'], ['prefer']]) {
    assert.equal(survey.hasSoughtHelp({ help }), false);
  }
  assert.equal(survey.hasSoughtHelp({ help: ['family'] }), true);
});

test('removing a need removes its adequacy answer and invalidated priority details', () => {
  const domains = domainsFor('adult');
  const answers = {
    needs: ['housing'], needs_other: 'Old detail',
    adequacy: { housing: 'enough', transport: 'some', other_need: 'none' },
    priority: 'transport', ...details(), strengths: 'Friends', anything: 'Keep this',
  };
  survey.reconcileAnswers(answers, 'needs', domains);
  assert.deepEqual(plain(answers.adequacy), { housing: 'enough' });
  assert.equal(hasOwn(answers, 'needs_other'), false);
  assert.equal(hasOwn(answers, 'priority'), false);
  for (const key of Object.keys(details())) assert.equal(hasOwn(answers, key), false, key);
  assert.equal(answers.strengths, 'Friends');
  assert.equal(answers.anything, 'Keep this');
});

test('removing an unrelated need preserves a retained or separately named priority', () => {
  const domains = domainsFor('adult');
  for (const priority of ['housing', 'another']) {
    const answers = { needs: ['housing'], adequacy: { housing: 'some', transport: 'none' }, priority, ...details() };
    survey.reconcileAnswers(answers, 'needs', domains);
    assert.equal(answers.priority, priority);
    assert.equal(answers.impact, 'a_lot');
    assert.deepEqual(plain(answers.adequacy), { housing: 'some' });
  }
});

test('changing priority or its wording clears answers attached to the earlier topic', () => {
  const domains = domainsFor('adult');
  const answers = { needs: ['housing'], priority: 'housing', adequacy: { housing: 'some' }, ...details() };
  survey.reconcileAnswers(answers, 'priority', domains);
  for (const key of Object.keys(details())) assert.equal(hasOwn(answers, key), false, key);
  assert.equal(answers.priority, 'housing');
  assert.deepEqual(answers.adequacy, { housing: 'some' });

  const another = { priority: 'another', ...details(), another_priority: 'New topic' };
  survey.reconcileAnswers(another, 'another_priority', domains);
  assert.equal(another.another_priority, 'New topic');
  for (const key of Object.keys(details()).filter(key => key !== 'another_priority')) {
    assert.equal(hasOwn(another, key), false, key);
  }

  const otherNeed = { needs: ['other_need'], priority: 'other_need', needs_other: 'New wording', adequacy: { other_need: 'none', housing: 'some' }, ...details() };
  survey.reconcileAnswers(otherNeed, 'needs_other', domains);
  assert.equal(hasOwn(otherNeed.adequacy, 'other_need'), false);
  assert.equal(otherNeed.adequacy.housing, 'some');
  assert.equal(hasOwn(otherNeed, 'impact'), false);
  assert.equal(otherNeed.needs_other, 'New wording');
});

test('help, roles and delivery changes clear only dependent fields', () => {
  const domains = domainsFor('adult');
  const answers = { roles: ['partner'], financial_dependence: 'yes', care_dependence: 'sometimes', ...details(), needs: ['housing'] };
  survey.reconcileAnswers(answers, 'help', domains);
  assert.equal(hasOwn(answers, 'barriers'), false);
  assert.equal(answers.impact, 'a_lot');
  survey.reconcileAnswers(answers, 'roles', domains);
  assert.equal(hasOwn(answers, 'financial_dependence'), false);
  assert.equal(hasOwn(answers, 'care_dependence'), false);

  const dependent = { roles: ['partner', 'child'], financial_dependence: 'partly', care_dependence: 'no' };
  survey.reconcileAnswers(dependent, 'roles', domains);
  assert.equal(dependent.financial_dependence, 'partly');
  assert.equal(dependent.care_dependence, 'no');

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
      roles: ['partner'], serving_nt: 'yes', force: 'adf', region, time_nt: 'over3', caring: ['under18'],
      strengths: 'Keep in original frame only', needs: ['housing'], needs_other: 'Earlier',
      adequacy: { housing: 'some' }, priority: 'housing', ...details(), anything: 'Earlier context',
    };
    survey.reconcileAnswers(answers, 'region', domains, previous);
    for (const key of ['strengths', 'needs', 'needs_other', 'adequacy', 'priority', ...Object.keys(details()), 'anything']) {
      assert.equal(hasOwn(answers, key), false, key);
    }
    assert.equal(answers.region, region);
    assert.deepEqual(answers.roles, ['partner']);
    assert.deepEqual(answers.caring, ['under18']);
    if (region.startsWith('outside_')) assert.equal(hasOwn(answers, 'time_nt'), false);
  }
  for (const [previous, region] of [['darwin', 'katherine'], ['outside_au', 'outside_overseas']]) {
    const answers = { region, strengths: 'Still relevant', needs: ['housing'], priority: 'housing', ...details() };
    survey.reconcileAnswers(answers, 'region', domains, previous);
    assert.equal(answers.strengths, 'Still relevant');
    assert.equal(answers.priority, 'housing');
    assert.equal(answers.impact, 'a_lot');
  }
});

test('all three age branches have stable base steps and paired adequacy pages', () => {
  for (const [version, maxSteps, rawDomainCount] of [['adult', 20, 15], ['youth', 17, 8], ['child', 15, 6]]) {
    const domains = domainsFor(version);
    assert.equal(survey.DOMAINS[version].length, rawDomainCount);
    for (const priority of [undefined, 'none', 'unsure', 'prefer']) {
      const steps = plain(survey.buildSteps({ priority }, domains, version));
      assert.deepEqual(steps.map(step => step.id), ['connection', 'place', 'strengths', 'needs', 'priority', 'anything', 'review']);
    }
    const needs = domains.map(domain => domain.id);
    const steps = plain(survey.buildSteps({ needs, priority: needs[0] }, domains, version));
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
    const answers = { needs: [value], priority: value, adequacy: { housing: 'enough' }, ...details() };
    const original = structuredClone(answers);
    const result = plain(survey.cleanExport(answers, 'adult', domains));
    assert.equal(result.schema_version, '1.0');
    assert.equal(result.questionnaire_version, 'adult');
    assert.equal(result.storage, 'downloaded_by_respondent; not submitted');
    assert.deepEqual(result.answers.needs, [value]);
    assert.equal(result.answers.priority, value);
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
    priority: 'housing', help: ['not_sought'], barriers: ['privacy'],
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
  const sought = pageFor('barriers', 'youth', { priority: 'school_learning', help: ['school'] });
  assert.match(sought.intro, /actually experienced/);
  const options = Object.fromEntries(sought.fields[0].options.map(option => [option.id, option.label]));
  assert.equal(options.not_know_where, 'I did not know where to go');
  assert.equal(options.no_trusted_person, 'I did not have someone I trusted to ask');
  assert.equal(options.privacy, 'I worried about who would be told');
  assert.equal(options.not_understood, 'I felt people would not understand');
  assert.equal(options.none, 'Nothing made it harder');
  assert.equal(hasOwn(options, 'prefer_not_to_say'), false);

  const notSought = pageFor('barriers', 'adult', { priority: 'housing', help: ['not_sought'] });
  assert.match(notSought.title, /haven’t you looked/);
  assert.match(notSought.intro, /influenced your decision/);
  assert.ok(notSought.fields[0].options.some(option => option.id === 'eligibility_concern'));
  assert.equal(notSought.fields[0].options.some(option => option.id === 'eligibility_refused'), false);

  for (const help of [undefined, ['unsure'], ['prefer']]) {
    const neutral = pageFor('barriers', 'adult', { priority: 'housing', help });
    assert.match(neutral.intro, /skip this if it does not apply/);
    assert.equal(neutral.fields[0].label, 'What, if anything, has made getting help difficult?');
  }
});

test('each age and location path has unique option IDs and matching rendered review meanings', () => {
  for (const version of ['adult', 'youth', 'child']) {
    for (const region of ['darwin', 'outside_au']) {
      const domains = survey.setContext(version, { region });
      const answers = { region, roles: ['child'], needs: domains.map(domain => domain.id), priority: domains[0].id, help: ['family'] };
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
    survey.setContext(version, { needs: ['none'], priority: 'prefer' });
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
      assert.match(barriers.variants[0].intro, /actually experienced/);
      assert.match(barriers.variants[1].intro, /influenced your decision/);
      assert.match(barriers.variants[2].intro, /skip this if it does not apply/);
      const needs = sections.find(section => section.id === 'needs');
      assert.match(needs.intro, version === 'child' ? /three months/ : /six months/);
      if (location === 'outside') assert.match(needs.intro, /family member has been serving in the NT/);
    }
  }
});

test('review library wording matches live questions and never alters respondent answers', () => {
  const answers = { region: 'outside_overseas', needs: ['feelings'], priority: 'feelings', help: ['family'], anything: 'My own answer' };
  survey.setContext('child', answers);
  const original = structuredClone(answers);
  const originalReview = survey.reviewHTML();
  for (const version of ['adult', 'youth', 'child']) {
    const sections = plain(survey.librarySections(version, 'outside'));
    assert.equal(survey.getContext().version, 'child');
    assert.equal(survey.getContext().answers, answers, 'Restore the original answers object');
    assert.deepEqual(answers, original);
    assert.equal(survey.reviewHTML(), originalReview);
    const previewAnswers = { roles: ['child'], region: 'outside_au', priority: survey.DOMAINS[version][0].id, help: ['family'] };
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
