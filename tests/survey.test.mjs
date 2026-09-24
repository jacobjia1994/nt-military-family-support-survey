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
    page, detailPage, period, conditionalVisible, reviewHTML, locationFrame,
    getValue, setValue, consultationRoute, maxTextLength, fieldHTML,
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

const domainsFor = version => survey.setContext(version);
const pageFor = (id, version = 'adult', answers = {}) => {
  survey.setContext(version, answers);
  return plain(survey.page({ id }));
};
const needBlock = (label = 'Housing') => ({
  impact: 'a_lot', help: ['family'], barriers: ['cost'], change: `${label} change`,
});
const legacyCollective = () => ({
  impact: 'a_lot', help: ['family'], barriers: ['cost'], change: 'Old combined answer',
});
const detailFor = (need, version, answers) => pageFor(`detail:${need}`, version, answers);
const barrierField = detail => detail.fields.find(f => f.key.endsWith(':barriers'));
const fieldIds = field => field.options.map(option => option.id);


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


test('editing past needs prunes only their adequacy ratings and preserves each current need', () => {
  const domains = domainsFor('adult');
  const follow_up = { housing: needBlock(), transport: needBlock('Transport') };
  const answers = {
    needs: ['housing'], needs_other: 'Old detail',
    adequacy: { housing: 'enough', transport: 'some', other_need: 'none' },
    priority: ['housing', 'transport'], follow_up,
    delivery: ['phone'], times: ['weekend'], strengths: 'Friends', anything: 'Keep this',
  };
  survey.reconcileAnswers(answers, 'needs', domains);
  assert.deepEqual(plain(answers.adequacy), { housing: 'enough' });
  assert.equal(hasOwn(answers, 'needs_other'), false);
  assert.deepEqual(answers.priority, ['housing', 'transport']);
  assert.equal(answers.follow_up, follow_up);
  assert.deepEqual(answers.delivery, ['phone']);
  answers.needs = ['none'];
  survey.reconcileAnswers(answers, 'needs', domains);
  assert.deepEqual(plain(answers.adequacy), {});
  assert.equal(answers.follow_up, follow_up, 'No past need does not erase a current need');
  assert.equal(answers.anything, 'Keep this');
});

test('removing, reordering and re-adding current needs never shifts or resurrects another need’s answers', () => {
  const domains = domainsFor('adult');
  const answers = {
    priority: ['transport', 'housing'],
    follow_up: { housing: needBlock(), transport: needBlock('Transport'), another: needBlock('Other') },
    another_priority: 'An earlier topic', adequacy: { housing: 'some' },
    delivery: ['phone'], times: ['weekend'],
  };
  survey.reconcileAnswers(answers, 'priority', domains);
  assert.deepEqual(plain(answers.follow_up), { housing: needBlock(), transport: needBlock('Transport') });
  assert.equal(hasOwn(answers, 'another_priority'), false);
  assert.deepEqual(answers.delivery, ['phone'], 'General delivery preferences survive a partial edit');
  answers.priority = ['transport'];
  survey.reconcileAnswers(answers, 'priority', domains);
  assert.deepEqual(plain(answers.follow_up), { transport: needBlock('Transport') });
  answers.priority = ['transport', 'housing'];
  survey.reconcileAnswers(answers, 'priority', domains);
  assert.equal(hasOwn(answers.follow_up, 'housing'), false);
  const result = plain(survey.cleanExport(answers, 'adult', domains));
  assert.deepEqual(result.answers.follow_up, { transport: needBlock('Transport'), housing: {} });
  assert.deepEqual(result.answers.adequacy, {}, 'A stale rating is not exported when its past need is absent');
  for (const priority of [[], ['none'], ['unsure'], ['prefer']]) {
    const a = { ...answers, priority, follow_up: structuredClone(answers.follow_up) };
    survey.reconcileAnswers(a, 'priority', domains);
    assert.deepEqual(plain(a.follow_up), {});
    for (const key of ['delivery', 'times', 'another_priority']) assert.equal(hasOwn(a, key), false, key);
  }
});

test('editing other-need descriptions clears only the answers that refer to the edited description', () => {
  const domains = domainsFor('adult');
  const answers = {
    needs: ['other_need'], needs_other: 'An edited past need',
    adequacy: { other_need: 'some', housing: 'enough' },
    priority: ['housing', 'another'], another_priority: 'An edited current need',
    follow_up: { housing: needBlock(), another: needBlock('Other') },
    delivery: ['phone'], times: ['weekend'],
  };
  survey.reconcileAnswers(answers, 'another_priority', domains);
  assert.deepEqual(plain(answers.follow_up), { housing: needBlock() });
  assert.equal(answers.another_priority, 'An edited current need');
  assert.equal(answers.adequacy.other_need, 'some');
  survey.reconcileAnswers(answers, 'needs_other', domains);
  assert.deepEqual(answers.adequacy, { housing: 'enough' });
  assert.equal(answers.needs_other, 'An edited past need');
  assert.deepEqual(plain(answers.follow_up), { housing: needBlock() });
  assert.deepEqual(answers.times, ['weekend']);
});

test('scoped get/set and a help-source change affect only that need’s dependent barriers', () => {
  const answers = { priority: ['housing', 'transport'], follow_up: { housing: needBlock(), transport: needBlock('Transport') } };
  const domains = survey.setContext('adult', answers);
  survey.setValue('follow_up:housing:help', ['not_sought']);
  assert.deepEqual(plain(survey.getValue('follow_up:housing:help')), ['not_sought']);
  assert.deepEqual(plain(survey.getValue('follow_up:transport:help')), ['family']);
  survey.reconcileAnswers(answers, 'follow_up:housing:help', domains);
  assert.equal(hasOwn(answers.follow_up.housing, 'barriers'), false);
  assert.equal(answers.follow_up.housing.impact, 'a_lot');
  assert.equal(answers.follow_up.housing.change, 'Housing change');
  assert.deepEqual(answers.follow_up.transport, needBlock('Transport'));
  survey.setValue('follow_up:transport:change', 'Different transport answer');
  assert.equal(survey.getValue('follow_up:housing:change'), 'Housing change');
  assert.equal(survey.getValue('follow_up:transport:change'), 'Different transport answer');
  survey.setValue('adequacy:housing', 'some');
  assert.equal(survey.getValue('adequacy:housing'), 'some');
  assert.equal(hasOwn(answers, 'help'), false, 'Scoped writes must not create legacy collective answers');
});

test('changing service cohort clears experience answers while preserving basic connection and residence', () => {
  const domains = domainsFor('adult');
  const experienceKeys = ['strengths', 'needs', 'needs_other', 'adequacy', 'priority', 'another_priority', 'follow_up', 'delivery', 'times', 'anything', 'earlier_experience'];
  for (const previous of ['yes', 'recent', 'earlier', 'unsure']) {
    for (const serving_nt of ['yes', 'recent', 'earlier', 'unsure'].filter(v => v !== previous)) {
      const answers = {
        roles: ['partner'], force: 'adf', region: 'outside_au', time_nt: 'over3', serving_nt,
        ...Object.fromEntries(experienceKeys.map(key => [key, 'PREVIOUS_COHORT_SENTINEL'])),
      };
      survey.reconcileAnswers(answers, 'serving_nt', domains, previous);
      for (const key of experienceKeys) assert.equal(hasOwn(answers, key), false, `${previous} to ${serving_nt}: ${key}`);
      assert.deepEqual(answers.roles, ['partner']);
      assert.equal(answers.region, 'outside_au');
      assert.equal(answers.time_nt, 'over3');
    }
  }
  const unchanged = { serving_nt: 'recent', priority: ['housing'], follow_up: { housing: needBlock() } };
  survey.reconcileAnswers(unchanged, 'serving_nt', domains, 'recent');
  assert.deepEqual(unchanged.follow_up, { housing: needBlock() });
});

test('residence edits no longer erase answers because the recall period is shared across locations', () => {
  const domains = domainsFor('adult');
  for (const previous of ['darwin', 'outside_au', 'outside_overseas', 'prefer', '', undefined]) {
    for (const region of ['katherine', 'outside_au', 'prefer', '', undefined]) {
      const answers = {
        roles: ['partner'], serving_nt: 'recent', region, time_nt: 'over3',
        strengths: 'Friends', needs: ['housing'], adequacy: { housing: 'some' },
        priority: ['housing'], follow_up: { housing: needBlock() }, anything: 'A useful point',
      };
      const original = structuredClone(answers);
      survey.reconcileAnswers(answers, 'region', domains, previous);
      assert.deepEqual(answers, original, `${previous} to ${region}`);
    }
  }
});

test('general delivery changes clear time preferences only when no live interaction is selected', () => {
  const domains = domainsFor('adult');
  for (const delivery of [['text'], ['information'], ['referral'], ['not_wanted'], ['unsure'], ['no_preference'], ['prefer'], []]) {
    const answers = { delivery, times: ['weekend'], follow_up: { housing: needBlock() } };
    survey.reconcileAnswers(answers, 'delivery', domains);
    assert.equal(hasOwn(answers, 'times'), false);
    assert.deepEqual(answers.follow_up, { housing: needBlock() });
  }
  for (const delivery of [['phone'], ['video'], ['group'], ['one_to_one'], ['information', 'phone']]) {
    const answers = { delivery, times: ['weekend'] };
    survey.reconcileAnswers(answers, 'delivery', domains);
    assert.deepEqual(answers.times, ['weekend']);
  }
});

test('all ages retain paired past-need ratings and get a separate follow-up page for each current need', () => {
  for (const [version, rawDomainCount] of [['adult', 17], ['youth', 8], ['child', 8]]) {
    const domains = domainsFor(version);
    assert.equal(survey.DOMAINS[version].length, rawDomainCount);
    for (const priority of [undefined, [], ['none'], ['unsure'], ['prefer']]) {
      const steps = plain(survey.buildSteps({ serving_nt: 'recent', priority }, domains, version));
      assert.deepEqual(steps.map(step => step.id), ['connection', 'place', 'strengths', 'needs', 'priority', 'anything', 'review']);
    }
    const needs = plain(domains).map(domain => domain.id);
    const current = needs.slice(0, 3);
    const answers = { serving_nt: 'yes', needs, priority: [...current, 'another'], another_priority: 'A distinct concern' };
    survey.setContext(version, answers);
    const steps = plain(survey.buildSteps(answers, domains, version));
    const adequacySteps = steps.filter(step => step.id.startsWith('adequacy-'));
    assert.equal(adequacySteps.length, Math.ceil(needs.length / 2));
    assert.deepEqual(adequacySteps.flatMap(step => step.domains), needs);
    assert.ok(adequacySteps.every(step => step.domains.length > 0 && step.domains.length <= 2));
    assert.deepEqual(steps.filter(step => step.id.startsWith('detail:')).map(step => step.need), [...current, 'another']);
    assert.equal(steps.filter(step => step.id === 'delivery').length, version === 'child' ? 0 : 1);
    assert.equal(steps.some(step => ['impact', 'help', 'barriers', 'change'].includes(step.id)), false, 'No collective follow-up pages');
    assert.equal(new Set(steps.map(step => step.id)).size, steps.length);
    for (const step of steps.filter(step => step.need)) {
      const detail = survey.page(step);
      assert.deepEqual(plain(detail.fields).map(field => field.key), ['impact', 'help', 'barriers', 'change'].map(key => `follow_up:${step.need}:${key}`));
    }
  }
});

test('each need selects its own actual or anticipated barriers and unknown help hides barriers', () => {
  const answers = {
    priority: ['housing', 'transport'],
    follow_up: { housing: { help: ['community'] }, transport: { help: ['not_sought'] } },
  };
  const actual = barrierField(detailFor('housing', 'adult', answers));
  assert.equal(survey.conditionalVisible(actual), true);
  assert.ok(fieldIds(actual).includes('eligibility_refused'));
  assert.equal(fieldIds(actual).includes('eligibility_concern'), false);
  const anticipated = barrierField(detailFor('transport', 'adult', answers));
  assert.equal(survey.conditionalVisible(anticipated), true);
  assert.ok(fieldIds(anticipated).includes('eligibility_concern'));
  assert.equal(fieldIds(anticipated).includes('eligibility_refused'), false);
  for (const help of [undefined, [], ['unsure'], ['prefer']]) {
    answers.follow_up.transport = { help, barriers: ['OLD_BARRIER_SENTINEL'] };
    const hidden = barrierField(detailFor('transport', 'adult', answers));
    assert.equal(survey.conditionalVisible(hidden), false);
    const result = plain(survey.cleanExport(answers, 'adult', domainsFor('adult')));
    assert.equal(hasOwn(result.answers.follow_up.transport, 'barriers'), false);
    assert.deepEqual(result.answers.follow_up.housing.help, ['community']);
    survey.setContext('adult', answers);
    assert.doesNotMatch(survey.reviewHTML(), /OLD_BARRIER_SENTINEL/);
  }
  const youth = barrierField(detailFor('school_learning', 'youth', { priority: ['school_learning'], follow_up: { school_learning: { help: ['school'] } } }));
  assert.ok(fieldIds(youth).includes('no_trusted_person'));
  assert.equal(fieldIds(youth).includes('eligibility_refused'), false);
});

test('schema 3 exports independent per-need answers without mutating them or copying legacy combined answers', () => {
  const domains = domainsFor('adult');
  const answers = {
    serving_nt: 'recent', needs: ['housing'], adequacy: { housing: 'some' },
    priority: ['housing', 'transport', 'another'], another_priority: 'A separate concern',
    follow_up: { housing: needBlock(), transport: { help: ['not_sought'], barriers: ['privacy'], change: 'Transport only' }, schooling: needBlock('Stale') },
    ...legacyCollective(), delivery: ['phone'], times: ['weekend'],
  };
  const original = structuredClone(answers);
  const result = plain(survey.cleanExport(answers, 'adult', domains));
  assert.equal(result.schema_version, '3.0');
  assert.equal(result.follow_up_scope, 'one_block_per_selected_need');
  assert.equal(result.consultation_route, 'recent_nt');
  assert.equal(result.recall_months, 12);
  assert.equal(result.storage, 'downloaded_by_respondent; not submitted');
  assert.deepEqual(result.answers.follow_up, { housing: needBlock(), transport: { help: ['not_sought'], barriers: ['privacy'], change: 'Transport only' }, another: {} });
  for (const key of Object.keys(legacyCollective())) assert.equal(hasOwn(result.answers, key), false, key);
  assert.deepEqual(answers, original);

  const collectiveOnly = plain(survey.cleanExport({ priority: ['housing', 'transport'], ...legacyCollective() }, 'adult', domains));
  assert.deepEqual(collectiveOnly.answers.follow_up, { housing: {}, transport: {} }, 'Combined answers must not masquerade as two individual answers');
  assert.doesNotMatch(JSON.stringify(collectiveOnly), /Old combined answer/);
  const oldScalar = plain(survey.cleanExport({ priority: 'housing', ...legacyCollective() }, 'adult', domains));
  assert.deepEqual(oldScalar.answers.follow_up, {}, 'Old single-priority answers are not silently migrated');
});

test('exports distinguish no need, uncertainty, refusal, a cleared selection and an unanswered question', () => {
  const domains = domainsFor('adult');
  for (const value of ['none', 'unsure', 'prefer']) {
    const answers = { needs: [value], priority: [value], adequacy: { housing: 'enough' }, follow_up: { housing: needBlock() }, delivery: ['phone'], times: ['weekend'] };
    const result = plain(survey.cleanExport(answers, 'adult', domains));
    assert.deepEqual(result.answers.needs, [value]);
    assert.deepEqual(result.answers.priority, [value]);
    assert.deepEqual(result.answers.adequacy, {});
    assert.deepEqual(result.answers.follow_up, {});
    for (const key of ['delivery', 'times']) assert.equal(hasOwn(result.answers, key), false);
  }
  const skipped = plain(survey.cleanExport({}, 'adult', domains));
  assert.equal(hasOwn(skipped.answers, 'needs'), false);
  assert.equal(hasOwn(skipped.answers, 'priority'), false);
  const cleared = plain(survey.cleanExport({ needs: [], priority: [] }, 'adult', domains));
  assert.deepEqual(cleared.answers.needs, []);
  assert.deepEqual(cleared.answers.priority, []);
});

test('past support adequacy preserves distinct answers and uses null for a skipped active rating', () => {
  const domains = domainsFor('adult');
  const answers = {
    needs: ['housing', 'transport', 'childcare', 'physical_health', 'emotional_wellbeing'],
    adequacy: { housing: 'none', transport: 'unsure', childcare: 'prefer', emotional_wellbeing: 'enough', schooling: 'some' },
    region: 'outside_au', time_nt: 'over3',
  };
  const result = plain(survey.cleanExport(answers, 'adult', domains));
  assert.deepEqual(result.answers.adequacy, { housing: 'none', transport: 'unsure', childcare: 'prefer', physical_health: null, emotional_wellbeing: 'enough' });
  assert.equal(result.answers.time_nt, 'over3', 'A former resident can describe their latest stay');
});

test('current, recent and uncertain NT connections use the full route regardless of residence', () => {
  for (const region of ['darwin', 'palmerston', 'katherine', 'alice', 'other_nt', 'outside_au', 'outside_overseas', 'prefer', '', undefined]) {
    for (const roles of [['serving'], ['partner'], ['child'], ['parent'], ['other_family'], ['unsure']]) {
      for (const [serving_nt, route] of [['yes', 'current_nt'], ['recent', 'recent_nt'], ['unsure', 'uncertain_nt']]) {
        const answers = { region, roles, serving_nt };
        assert.equal(survey.isOutsideSurveyScope(answers), false);
        assert.equal(survey.consultationRoute(answers), route);
        assert.ok(survey.buildSteps(answers, domainsFor('adult'), 'adult').some(step => step.id === 'needs'));
      }
      assert.equal(survey.isOutsideSurveyScope({ region, roles, serving_nt: 'no' }), true);
    }
    assert.equal(survey.isOutsideSurveyScope({ region, roles: ['none'], serving_nt: 'yes' }), true);
  }
});

test('earlier service has a short comments route and cannot export recent experience data', () => {
  for (const version of ['adult', 'youth', 'child']) {
    const domains = domainsFor(version);
    const answers = {
      serving_nt: 'earlier', roles: ['partner'], force: 'adf', earlier_experience: 'An earlier NT experience',
      region: 'darwin', time_nt: 'over3', assistance: 'reading', strengths: 'OLD_CORE', needs: ['housing'], adequacy: { housing: 'some' },
      priority: ['housing'], follow_up: { housing: needBlock() }, delivery: ['phone'], times: ['weekend'], anything: 'OLD_CORE', ...legacyCollective(),
    };
    assert.equal(survey.isOutsideSurveyScope(answers), false);
    assert.equal(survey.consultationRoute(answers), 'earlier_experience');
    assert.deepEqual(plain(survey.buildSteps(answers, domains, version)).map(step => step.id), ['connection', 'earlier', 'review']);
    const result = plain(survey.cleanExport(answers, version, domains));
    assert.equal(result.consultation_route, 'earlier_experience');
    assert.equal(result.recall_months, null);
    assert.deepEqual(result.answers, { serving_nt: 'earlier', roles: ['partner'], force: 'adf', earlier_experience: 'An earlier NT experience' });
    survey.setContext(version, answers);
    const review = survey.reviewHTML();
    assert.match(review, /An earlier NT experience/);
    assert.doesNotMatch(review, /OLD_CORE|Housing change|Old combined answer/);
    const current = plain(survey.cleanExport({ ...answers, serving_nt: 'yes' }, version, domains));
    assert.equal(hasOwn(current.answers, 'earlier_experience'), false, 'Earlier comments cannot join current cohort exports');
  }
});

test('recall is 12 months for adults and youth, three for children, independent of location and moves', () => {
  for (const [version, months, pattern] of [['adult', 12, /past 12 months/], ['youth', 12, /past 12 months/], ['child', 3, /past three months/]]) {
    for (const serving_nt of ['yes', 'recent', 'unsure']) {
      for (const region of ['darwin', 'outside_au', 'outside_overseas', 'prefer', '', undefined]) {
        const answers = { serving_nt, region };
        const needs = pageFor('needs', version, answers);
        assert.match(needs.intro, pattern);
        assert.doesNotMatch(needs.intro, /six months|time here|since you arrived/);
        assert.equal(survey.cleanExport(answers, version, domainsFor(version)).recall_months, months);
      }
    }
  }
});

test('residence and latest-stay duration are optional and cover never-residents and former residents', () => {
  for (const version of ['adult', 'youth', 'child']) {
    const connection = pageFor('connection', version);
    const service = connection.fields.find(f => f.key === 'serving_nt');
    assert.deepEqual(fieldIds(service), ['yes', 'recent', 'earlier', 'no', 'unsure']);
    assert.match(service.options.find(o => o.id === 'recent').label, /past 12 months/);
    assert.match(service.options.find(o => o.id === 'earlier').label, /more than 12 months/i);
    for (const region of ['darwin', 'outside_au', 'outside_overseas', 'prefer', undefined]) {
      const place = pageFor('place', version, { region });
      const residence = place.fields.find(f => f.key === 'region');
      const duration = place.fields.find(f => f.key === 'time_nt');
      assert.equal(Boolean(residence.required), false);
      assert.equal(Boolean(duration.required), false);
      assert.equal(survey.conditionalVisible(duration), true, 'Latest-stay duration does not assume current residence');
      assert.ok(fieldIds(residence).includes('outside_overseas'));
      assert.deepEqual(fieldIds(duration), ['never', 'under3', '3to12', '1to3', 'over3', 'unsure', 'prefer']);
      assert.match(duration.hint, /current or most recent stay/);
      const labels = Object.fromEntries(duration.options.map(o => [o.id, o.label]));
      assert.match(labels.under3, /Less than 3 months/);
      assert.match(labels['3to12'], /3 months to less than 1 year/);
      assert.match(labels['1to3'], /1 year to less than 3 years/);
      assert.match(labels.over3, /3 years or more/);
      assert.match(labels.never, /not lived in the NT/);
    }
  }
});

test('every field and option ID is unique across each respondent’s live path', () => {
  for (const version of ['adult', 'youth', 'child']) {
    const domains = domainsFor(version);
    for (const region of ['darwin', 'outside_au', 'prefer']) {
      const ids = plain(domains).map(d => d.id);
      const answers = { serving_nt: 'recent', region, roles: ['child'], needs: ids, priority: [...ids.filter(id => id !== 'other_need'), 'another'] };
      survey.setContext(version, answers);
      const allFieldKeys = [];
      for (const step of survey.buildSteps(answers, domains, version)) {
        const p = survey.page(step);
        assert.ok(p.title);
        assert.equal(typeof p.intro, 'string');
        for (const field of p.fields) {
          allFieldKeys.push(field.key);
          assert.equal(new Set(fieldIds(field)).size, field.options.length, `${version}: ${field.key}`);
        }
      }
      assert.equal(new Set(allFieldKeys).size, allFieldKeys.length, `${version}: ${region}`);
    }
  }
});

test('review values remain attributable to the right need and editing returns to that need’s page', () => {
  const answers = { serving_nt: 'yes', priority: ['housing', 'transport'], follow_up: {
    housing: { impact: 'a_little', help: ['family'], change: 'HOUSING_ONLY_SENTINEL' },
    transport: { impact: 'a_lot', help: ['not_sought'], change: 'TRANSPORT_ONLY_SENTINEL' },
  } };
  survey.setContext('adult', answers);
  const review = survey.reviewHTML();
  const blocks = review.split('<div class="review-block">').slice(1);
  const housing = blocks.find(block => block.includes('HOUSING_ONLY_SENTINEL'));
  const transport = blocks.find(block => block.includes('TRANSPORT_ONLY_SENTINEL'));
  assert.ok(housing);
  assert.ok(transport);
  assert.match(housing, /Housing/);
  assert.match(housing, /data-edit="detail:housing"/);
  assert.doesNotMatch(housing, /TRANSPORT_ONLY_SENTINEL/);
  assert.match(transport, /Getting around/);
  assert.match(transport, /data-edit="detail:transport"/);
  assert.doesNotMatch(transport, /HOUSING_ONLY_SENTINEL/);
});

test('the library shares actual per-need fields, both barrier variants and all three residence settings', () => {
  assert.equal(typeof survey.librarySections, 'function');
  for (const version of ['adult', 'youth', 'child']) {
    const first = survey.DOMAINS[version][0].id;
    for (const location of ['nt', 'outside', 'unspecified']) {
      const sections = plain(survey.librarySections(version, location));
      assert.equal(new Set(sections.map(section => section.id)).size, sections.length);
      assert.equal(sections.some(section => section.id === 'delivery'), version !== 'child');
      assert.ok(sections.some(section => section.id === 'earlier'));
      assert.equal(sections.find(section => section.id === 'adequacy').fields.length, survey.DOMAINS[version].length + 1);
      const detail = sections.find(section => section.id === 'detail');
      assert.deepEqual(detail.fields.map(f => f.key), ['impact', 'help', 'change'].map(key => `follow_up:${first}:${key}`));
      assert.deepEqual(detail.variants.map(v => v.id), ['sought', 'not-sought']);
      assert.ok(detail.variants.every(v => v.fields[0].key === `follow_up:${first}:barriers`));
      const answers = { serving_nt: 'yes', region: location === 'nt' ? 'darwin' : location === 'outside' ? 'outside_au' : 'prefer', priority: [first], follow_up: { [first]: { help: ['family'] } } };
      const live = detailFor(first, version, answers);
      assert.deepEqual(detail.fields, live.fields.filter(f => !f.key.endsWith(':barriers')));
      assert.deepEqual(detail.variants[0].fields, [barrierField(live)]);
      answers.follow_up[first].help = ['not_sought'];
      assert.deepEqual(detail.variants[1].fields, [barrierField(detailFor(first, version, answers))]);
      assert.match(sections.find(section => section.id === 'needs').intro, version === 'child' ? /three months/ : /12 months/);
    }
  }
});

test('library rendering restores the original age and answer object without changing any values', () => {
  const answers = { region: 'outside_overseas', serving_nt: 'recent', needs: ['feelings'], priority: ['feelings'], follow_up: { feelings: { help: ['family'], change: 'My own answer' } }, anything: 'My final comment' };
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

test('required connection questions block blanks while every substantive question can be skipped', () => {
  for (const version of ['adult', 'youth', 'child']) {
    const connection = pageFor('connection', version);
    for (const answers of [{}, { roles: [] }, { roles: ['child'] }, { serving_nt: 'recent' }]) {
      assert.equal(survey.requiredAnswersComplete(connection.fields, answers), false);
    }
    for (const serving_nt of ['yes', 'recent', 'earlier', 'unsure']) {
      assert.equal(survey.requiredAnswersComplete(connection.fields, { roles: ['child'], serving_nt }), true);
    }
    const first = survey.DOMAINS[version][0].id;
    const domains = survey.setContext(version, { serving_nt: 'yes', needs: [first], priority: [first] });
    for (const step of survey.buildSteps(survey.getContext().answers, domains, version).filter(step => step.id !== 'connection')) {
      const p = survey.page(step);
      assert.equal(survey.requiredAnswersComplete(p.fields.filter(survey.conditionalVisible), {}), true, `${version}: ${step.id}`);
    }
    const earlier = pageFor('earlier', version, { serving_nt: 'earlier' });
    assert.equal(survey.requiredAnswersComplete(earlier.fields, {}), true);
  }
});

test('long-answer limits allow fuller responses while counters remain hidden until nearly full', () => {
  for (const [version, max] of [['adult', 5000], ['youth', 5000], ['child', 1500]]) {
    survey.setContext(version, {});
    const f = survey.page({ id: 'anything' }).fields[0];
    assert.equal(survey.maxTextLength(version), max);
    const empty = survey.fieldHTML(f);
    assert.ok(empty.includes(`maxlength="${max}"`));
    assert.match(empty, /data-counter="anything" hidden/);
    survey.setValue('anything', 'x'.repeat(Math.ceil(max * .8)));
    const nearlyFull = survey.fieldHTML(f);
    assert.doesNotMatch(nearlyFull, /data-counter="anything" hidden/);
    assert.ok(nearlyFull.includes(`${max - Math.ceil(max * .8)} characters remaining`));
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
