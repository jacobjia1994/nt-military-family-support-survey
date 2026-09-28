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
    DOMAINS, SPECIAL_NEEDS, MAX_ACCOUNTS, addAccount, removeAccount, discardEmptyAccount, accountById, accountQuestionsHTML, accountsStartHTML, accountsManageHTML, practicalEligible, toggleChoice, selectedNeeds, selectedFutureNeeds, selectedDetailNeeds, hasNeedSelection, hasSoughtHelp,
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

test('minimal background precedes accounts without a duplicate global narrative prompt', () => {
  const adult = pageFor('connection', 'adult');
  assert.deepEqual(adult.fields.map(f => f.key), ['roles', 'residence_area', 'suburb', 'suburb_other', 'past_residence', 'age_group']);
  const place = pageFor('place', 'adult');
  assert.deepEqual(place.fields.map(f => f.key), ['time_nt']);
  assert.ok(place.fields.every(f => !f.required));
  const duration = place.fields.find(f => f.key === 'time_nt');
  assert.deepEqual(fieldIds(duration), ['never', 'under3', '3to12', '1to3', 'over3', 'unsure', 'prefer']);
  assert.match(duration.hint, /current or most recent stay/);
  const youth = pageFor('connection', 'youth', { residence_area: 'darwin' });
  assert.deepEqual(youth.fields.map(f => f.key), ['roles', 'residence_area', 'suburb', 'suburb_other', 'past_residence', 'assistance']);
  assert.equal(youth.fields.find(f => f.key === 'suburb').required, undefined);
  assert.ok(fieldIds(youth.fields.find(f => f.key === 'suburb')).includes('prefer'));
  assert.deepEqual(fieldIds(youth.fields[1]), fieldIds(adult.fields[1]));
  assert.equal(stepsFor({ residence_area: 'darwin', suburb: 'wagaman' }, 'youth').some(step => step.id === 'place'), false);
  const stale = plain(survey.cleanExport({ residence_area: 'darwin', community_connection: 'OLD_GLOBAL_STORY' }, 'adult', domainsFor('adult')));
  assert.equal(hasOwn(stale.answers, 'community_connection'), false);
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
  const answers = { roles: ['child'], assistance: 'other', accounts: [] };
  survey.setContext('youth', answers);
  const permission = survey.guardianPermissionRecord('youth_younger', true);
  survey.setParticipationContext('youth_younger', survey.participationRecord('youth_younger', true, permission), permission);
  survey.setStep('accounts_start');
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
  assert.equal(survey.getUIState().step, 'accounts_start');
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

test('respondent-led accounts permit 0, 1, 10 and 100 active entries without a ten-entry limit', () => {
  assert.equal(survey.MAX_ACCOUNTS, 100);
  for (const count of [0, 1, 10, 100]) {
    const answers = {};
    for (let n = 1; n <= count; n += 1) {
      const account = survey.addAccount(answers, n % 2 ? 'experience' : 'future');
      assert.equal(account.id, `a${n}`);
      account.story = `Account ${n} of ${count}`;
    }
    assert.equal((answers.accounts || []).length, count);
    assert.equal(new Set((answers.accounts || []).map(account => account.id)).size, count);
    if (count) assert.equal(survey.accountById(answers, `a${count}`).story, `Account ${count} of ${count}`);
    if (count === 100) {
      const before = structuredClone(answers);
      assert.equal(survey.addAccount(answers, 'experience'), null, 'The 101st active entry is rejected explicitly');
      assert.deepEqual(plain(answers), plain(before), 'A rejected add never changes existing answers');
    }
  }
});

test('removing one account from a full set preserves survivors and gives its replacement a fresh ID', () => {
  const answers = {};
  for (let n = 1; n <= 100; n += 1) survey.addAccount(answers, 'experience').story = `Original ${n}`;
  assert.equal(survey.removeAccount(answers, 'a50'), true);
  assert.equal(answers.accounts.length, 99);
  assert.equal(survey.accountById(answers, 'a50'), undefined);
  assert.equal(survey.accountById(answers, 'a51').story, 'Original 51');
  const replacement = survey.addAccount(answers, 'future');
  assert.equal(replacement.id, 'a101');
  replacement.story = 'Replacement';
  assert.equal(answers.accounts.length, 100);
  assert.equal(survey.accountById(answers, 'a51').story, 'Original 51');
  assert.equal(survey.accountById(answers, 'a101').story, 'Replacement');
});

test('leaving an empty draft releases its slot without deleting meaningful brief answers', () => {
  const answers = {};
  const empty = survey.addAccount(answers, 'future');
  assert.equal(survey.discardEmptyAccount(answers, empty.id), true);
  assert.equal(answers.accounts.length, 0);
  const statusOnly = survey.addAccount(answers, 'experience');
  statusOnly.help_status = 'no_need';
  assert.equal(survey.discardEmptyAccount(answers, statusOnly.id), false);
  const ideaOnly = survey.addAccount(answers, 'future');
  ideaOnly.useful_change = 'Make information easier to find';
  assert.equal(survey.discardEmptyAccount(answers, ideaOnly.id), false);
  assert.deepEqual(plain(answers.accounts.map(entry => entry.id)), ['a2', 'a3']);
});

test('closing priority is one optional text prompt, never a 100-option account ranking', () => {
  const stories = { accounts: Array.from({ length: 100 }, (_, n) => ({ id: `a${n + 1}`, kind: 'experience', story: `Story ${n + 1}` })) };
  assert.equal(pageFor('closing', 'adult', stories).fields.some(field => field.key === 'priority_reason'), false, 'A route choice or narrative alone does not force priority');
  stories.accounts.forEach((account, n) => { account.useful_change = `Change ${n + 1}`; });
  const closing = pageFor('closing', 'adult', stories);
  const priority = closing.fields.find(field => field.key === 'priority_reason');
  assert.equal(priority.type, 'text');
  assert.equal(priority.required, undefined);
  assert.deepEqual(priority.options, []);
  assert.equal(closing.fields.some(field => field.key === 'priority_account_id'), false);
  const two = { accounts: stories.accounts.slice(0, 2), priority_reason: 'The second change matters most.' };
  assert.equal(survey.removeAccount(two, 'a2'), true);
  assert.equal(hasOwn(two, 'priority_reason'), false, 'Priority is withdrawn when only one described change remains');
});

test('only a zero-account route offers a general closing note; Add another replaces it thereafter', () => {
  for (const version of ['adult', 'youth']) {
    const empty = pageFor('closing', version, { accounts: [] });
    assert.deepEqual(empty.fields.map(field => field.key), ['closing_note']);
    const one = { accounts: [{ id: 'a1', kind: 'experience', story: 'A helpful local contact', useful_change: 'Keep the contact' }] };
    assert.deepEqual(pageFor('closing', version, one).fields.map(field => field.key), []);
    const two = { accounts: [...one.accounts, { id: 'a2', kind: 'future', story: 'Families could meet', useful_change: 'A parent gathering' }] };
    assert.deepEqual(pageFor('closing', version, two).fields.map(field => field.key), ['priority_reason']);
    survey.setContext(version, two);
    const manage = survey.accountsManageHTML();
    assert.match(manage, /Add another experience|Add another future idea/);
    assert.doesNotMatch(manage, /Is there anything else/);
  }
});

test('schema 8.0 exports all 0, 1, 10 or 100 accounts without truncation or receiver state', () => {
  for (const count of [0, 1, 10, 100]) {
    const answers = { roles: ['partner'], residence_area: 'darwin' };
    for (let n = 1; n <= count; n += 1) {
      const entry = survey.addAccount(answers, n % 2 ? 'experience' : 'future');
      entry.story = `Story ${n}`;
      entry.useful_change = `Change ${n}`;
      if (entry.kind === 'experience') entry.help_status = 'some';
    }
    const original = plain(answers);
    const record = plain(survey.cleanExport(answers, 'adult', domainsFor('adult')));
    assert.equal(record.schema_version, '8.0');
    assert.equal(record.questionnaire_revision, '2026-09-28-respondent-accounts');
    assert.equal(record.max_accounts, 100);
    assert.equal(record.recall_months, count ? 12 : null, 'The past recall marker appears only when an experience account is present');
    assert.equal(record.collection_mode, 'internal_review_no_transmission');
    assert.equal(record.storage, 'page_memory_only; not submitted');
    assert.equal(record.answers.accounts.length, count);
    if (count) assert.equal(record.answers.accounts.at(-1).story, `Story ${count}`);
    assert.equal(hasOwn(record.answers, 'account_next_id'), false);
    assert.equal(hasOwn(record.answers, 'programmes'), false);
    assert.deepEqual(plain(answers), original, 'Export must not mutate respondent answers');
  }
  const overLimit = { accounts: Array.from({ length: 101 }, (_, n) => ({ id: `a${n + 1}`, kind: 'future', story: `Story ${n + 1}` })) };
  assert.throws(() => survey.cleanExport(overLimit, 'adult', domainsFor('adult')), /at most 100 accounts/);
  assert.equal(overLimit.accounts.length, 101, 'An over-limit source is rejected rather than silently cut to 100');
});

test('a future-only response has no past recall window, while youth experience uses three months', () => {
  const future = plain(survey.cleanExport({ accounts: [{ id: 'a1', kind: 'future', story: 'Planning ahead' }] }, 'adult', domainsFor('adult')));
  assert.equal(future.recall_months, null);
  const youth = plain(survey.cleanExport({ accounts: [{ id: 'a1', kind: 'experience', story: 'Something that happened' }] }, 'youth', domainsFor('youth')));
  assert.equal(youth.recall_months, 3);
});

test('future-only records never acquire past support status or irrelevant logistics', () => {
  const answers = { accounts: [
    { id: 'a1', kind: 'future', story: 'A future posting', useful_change: 'One clear enrolment step', help_status: 'some', prompt_open: true, proposal_type: 'process', practical_opt_in: true, practical_detail: 'HIDDEN_PROCESS_LOGISTICS' },
    { id: 'a2', kind: 'future', story: 'A parent group', useful_change: 'Parents and children meet', proposal_type: 'activity', practical_opt_in: true, practical_detail: 'Palmerston after school' },
  ] };
  const record = plain(survey.cleanExport(answers, 'adult', domainsFor('adult')));
  assert.equal(hasOwn(record.answers.accounts[0], 'help_status'), false);
  assert.equal(hasOwn(record.answers.accounts[0], 'practical_detail'), false);
  assert.equal(record.answers.accounts[1].practical_detail, 'Palmerston after school');
  assert.equal(record.answers.accounts[1].proposal_type, 'activity', 'Direct practical opt-in retains the selected type without opening the wording helper');
  assert.doesNotMatch(JSON.stringify(record), /HIDDEN_PROCESS_LOGISTICS|proposal_detail|berrimah_access|participation_formats/);
});

test('adult and youth routes allow 0, 1, 10 or 100 respondent-chosen accounts', () => {
  for (const version of ['adult', 'youth']) {
    for (const count of [0, 1, 10, 100]) {
      const accounts = Array.from({ length: count }, (_, n) => ({ id: `a${n + 1}`, kind: n % 2 ? 'future' : 'experience', story: `Story ${n + 1}` }));
      const steps = stepsFor({ accounts }, version).map(step => step.id);
      const describedFutureIdeas = accounts.filter(account => account.kind === 'future' && account.story.trim()).length;
      assert.deepEqual(steps, ['connection', ...(version === 'adult' ? ['place'] : []), 'accounts_start', ...accounts.map(account => `account:${account.id}`), ...(count ? ['accounts_manage'] : []), ...(!count || describedFutureIdeas > 1 ? ['closing'] : []), 'review']);
      assert.equal(steps.some(id => ['needs', 'future', 'practical'].includes(id) || id.startsWith('area:')), false);
      assert.equal(new Set(steps).size, steps.length);
    }
  }
});

test('normal account path asks one story, experience-only status and one distinct useful change', () => {
  for (const version of ['adult', 'youth']) {
    for (const kind of ['experience', 'future']) {
      const account = { id: 'a1', kind };
      const answers = { accounts: [account] };
      const page = pageFor('account:a1', version, answers);
      assert.equal(page.fields.some(field => field.key === 'accounts:a1:story'), true);
      assert.equal(page.fields.some(field => field.key === 'accounts:a1:useful_change'), true);
      assert.equal(page.fields.some(field => field.key === 'accounts:a1:help_status'), kind === 'experience');
      assert.equal(page.fields.every(field => !field.required), true);
      survey.setContext(version, answers);
      const html = survey.accountQuestionsHTML(page, account);
      assert.match(html, /data-field="accounts:a1:story"/);
      assert.match(html, /data-field="accounts:a1:useful_change"/);
      assert.equal(/data-field="accounts:a1:help_status"/.test(html), kind === 'experience');
      assert.doesNotMatch(html, /data-field="accounts:a1:(helped|difficult|proposal_type|practical_detail)"/, 'Optional elaboration does not burden the default path');
      assert.doesNotMatch(JSON.stringify(page), /berrimah_access|participation_formats|areas:a1:formats/);
      if (kind === 'experience') assert.match(page.intro, version === 'adult' ? /past 12 months/ : /past three months/);
    }
  }
});

test('help status describes useful help for the situation with non-overlapping sought and not-sought choices', () => {
  const ids = ['enough','some','wanted_no_useful','wanted_not_sought','no_need','unsure','prefer'];
  for (const version of ['adult', 'youth']) {
    const field = pageFor('account:a1', version, { accounts: [{ id: 'a1', kind: 'experience' }] }).fields.find(item => item.key === 'accounts:a1:help_status');
    assert.match(field.label, /situation/);
    assert.deepEqual(field.options.map(option => option.id), ids);
    for (const option of field.options.slice(0, 5)) assert.doesNotMatch(option.label, /^I\b/, 'A family or child account is not rephrased as the adult respondent’s own help');
    assert.match(field.options[0].label, /Enough .*help/i);
    assert.match(field.options[1].label, /Some .*help.*not enough/i);
    assert.match(field.options[2].label, /No .*help/i);
    assert.match(field.options[2].label, /try|tried/i);
    assert.match(field.options[3].label, /help.*needed.*not (?:sought|asked for)/i);
    assert.match(field.options[4].label, /No help was needed/i);
  }
});

test('optional experience detail comes before useful change, and a described activity can open practical details directly', () => {
  const experience = { id: 'a1', kind: 'experience', story: 'A posting affected school enrolment', help_status: 'some', detail_open: true, helped: 'A teacher explained the first step', difficult: 'The hand-off was unclear', useful_change: 'A clear guide' };
  survey.setContext('adult', { accounts: [experience] });
  const accountPage = survey.page({ id: 'account:a1' });
  const html = survey.accountQuestionsHTML(accountPage, experience);
  assert.ok(html.indexOf('accounts:a1:help_status') < html.indexOf('accounts:a1:helped'));
  assert.ok(html.indexOf('accounts:a1:helped') < html.indexOf('accounts:a1:difficult'));
  assert.ok(html.indexOf('accounts:a1:difficult') < html.indexOf('accounts:a1:useful_change'));

  const idea = { id: 'a2', kind: 'future', story: 'Families could meet locally', useful_change: 'A small parent and child gathering' };
  survey.setContext('adult', { accounts: [idea] });
  let futureHTML = survey.accountQuestionsHTML(survey.page({ id: 'account:a2' }), idea);
  assert.match(futureHTML, /data-add-practical="a2"/, 'A concrete idea can reach the opt-in without opening the wording helper');
  assert.doesNotMatch(futureHTML, /data-field="accounts:a2:proposal_type"/);
  idea.practical_opt_in = true;
  futureHTML = survey.accountQuestionsHTML(survey.page({ id: 'account:a2' }), idea);
  assert.match(futureHTML, /data-field="accounts:a2:proposal_type"/);
  const practical = survey.page({ id: 'account:a2' }).fields.find(field => field.key === 'accounts:a2:practical_detail');
  assert.equal(survey.conditionalVisible(practical), false, 'The type must identify an eligible offer before logistics appear');
  idea.proposal_type = 'activity';
  assert.equal(survey.conditionalVisible(practical), true);
  assert.equal(idea.prompt_open, undefined, 'Direct practical opt-in does not silently turn on the wording helper');
});

test('a complete future proposal in the first story box can lead to practical detail without repeated text', () => {
  for (const version of ['adult', 'youth']) {
    const idea = { id: 'a1', kind: 'future', story: 'A Saturday playgroup for families during deployment' };
    survey.setContext(version, { accounts: [idea] });
    const page = survey.page({ id: 'account:a1' });
    assert.match(page.fields.find(field => field.key === 'accounts:a1:useful_change').hint, /leave this blank if you have already described the change above/i);
    assert.match(survey.accountQuestionsHTML(page, idea), /data-add-practical="a1"/);
    idea.practical_opt_in = true;
    idea.proposal_type = 'activity';
    idea.practical_detail = 'Children can come, near Palmerston';
    assert.equal(survey.practicalEligible(idea), true);
    const practical = survey.page({ id: 'account:a1' }).fields.find(field => field.key === 'accounts:a1:practical_detail');
    assert.equal(survey.conditionalVisible(practical), true);
    const exported = plain(survey.cleanExport({ accounts: [idea] }, version, domainsFor(version))).answers.accounts[0];
    assert.equal(exported.useful_change, undefined);
    assert.equal(exported.practical_detail, 'Children can come, near Palmerston');
  }
});

test('a mixed idea can name the practical component in one free-text answer while process-only stays out', () => {
  const mixed = { id: 'a1', kind: 'future', story: 'A guide and a welcome meet-up', useful_change: 'One guide plus a parent gathering', proposal_type: 'other', practical_opt_in: true, practical_detail: 'The gathering should welcome toddlers.' };
  const process = { id: 'a2', kind: 'future', story: 'Make an existing service easier to use', useful_change: 'Change the referral step', proposal_type: 'process', practical_opt_in: true, practical_detail: 'STALE_PROCESS_ATTENDANCE' };
  survey.setContext('adult', { accounts: [mixed, process] });
  assert.equal(survey.practicalEligible(mixed), true);
  assert.equal(survey.practicalEligible(process), false);
  const mixedPage = survey.page({ id: 'account:a1' });
  assert.match(mixedPage.fields.find(field => field.key === 'accounts:a1:practical_detail').label, /which part/i);
  const record = plain(survey.cleanExport({ accounts: [mixed, process] }, 'adult', domainsFor('adult')));
  assert.equal(record.answers.accounts[0].proposal_type, 'other');
  assert.equal(record.answers.accounts[0].practical_detail, 'The gathering should welcome toddlers.');
  assert.equal(hasOwn(record.answers.accounts[1], 'practical_detail'), false);
  assert.doesNotMatch(JSON.stringify(record), /STALE_PROCESS_ATTENDANCE|berrimah_access/);
});

test('review keeps 100 accounts compact and makes each stable account editable', () => {
  const answers = { accounts: Array.from({ length: 100 }, (_, n) => ({ id: `a${n + 1}`, kind: 'experience', story: `SENTINEL_${n + 1}`, useful_change: `Change ${n + 1}` })) };
  survey.setContext('adult', answers);
  const html = survey.reviewHTML();
  assert.equal((html.match(/data-edit="account:a\d+"/g) || []).length, 100);
  assert.match(html, /SENTINEL_1/);
  assert.match(html, /SENTINEL_100/);
  assert.equal((html.match(/accounts:a\d+:story/g) || []).length, 0, 'Review does not expand 100 full questionnaires');
  const manage = survey.accountsManageHTML();
  assert.match(manage, /You have added 100 entries/);
  assert.match(manage, /entry limit/);
  assert.match(manage, /Your existing entries are safe/);
  assert.match(manage, /data-new-account="experience" disabled/);
  assert.match(manage, /data-edit-account="a100"/);
  assert.match(manage, /data-remove-account="a100"/);
  assert.doesNotMatch(manage, /100 more|of 100 entries|finish all 100/i);
});

test('editing and deleting accounts preserve every unrelated narrative and export order', () => {
  const answers = { accounts: Array.from({ length: 10 }, (_, n) => ({ id: `a${n + 1}`, kind: n % 2 ? 'future' : 'experience', story: `Original ${n + 1}` })) };
  survey.setContext('adult', answers);
  survey.setValue('accounts:a7:story', 'Edited seventh account');
  assert.equal(survey.getValue('accounts:a7:story'), 'Edited seventh account');
  assert.equal(survey.removeAccount(answers, 'a2'), true);
  assert.equal(survey.accountById(answers, 'a2'), undefined);
  assert.equal(survey.accountById(answers, 'a7').story, 'Edited seventh account');
  assert.equal(survey.accountById(answers, 'a10').story, 'Original 10');
  assert.equal(stepsFor(answers).some(step => step.id === 'account:a2'), false);
  const record = plain(survey.cleanExport(answers, 'adult', domainsFor('adult')));
  assert.deepEqual(record.answers.accounts.map(account => account.id), ['a1','a3','a4','a5','a6','a7','a8','a9','a10']);
  assert.equal(record.answers.accounts.find(account => account.id === 'a7').story, 'Edited seventh account');
});

test('question library shows repeatable account examples for adults and youth only', () => {
  for (const version of ['adult', 'youth']) {
    const sections = plain(survey.librarySections(version, 'nt'));
    assert.deepEqual(sections.map(section => section.id), ['connection', ...(version === 'adult' ? ['place'] : []), 'accounts_start', 'account-experience', 'account-future', 'account-mixed', 'accounts_manage', 'closing', 'closing-empty', 'earlier']);
    const experience = sections.find(section => section.id === 'account-experience');
    const future = sections.find(section => section.id === 'account-future');
    assert.equal(experience.fields.some(field => field.key.endsWith(':help_status')), true);
    assert.equal(future.fields.some(field => field.key.endsWith(':help_status')), false);
    assert.match(sections.find(section => section.id === 'account-mixed').fields.find(field => field.key.endsWith(':practical_detail')).label, /which part/i);
    assert.equal(sections.find(section => section.id === 'closing').fields.some(field => field.key === 'priority_account_id'), false);
    assert.deepEqual(sections.find(section => section.id === 'closing-empty').fields.map(field => field.key), ['closing_note']);
  }
  const child = plain(survey.librarySections('child', 'nt'));
  assert.equal(child.some(section => section.id.startsWith('account')), false, 'The separate under-7 route does not inherit account pages');
});
