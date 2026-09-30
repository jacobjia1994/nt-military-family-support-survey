import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {createAdultSurveyModel, characterCount, MAX_TEXT_CHARACTERS, PAGE_ORDER, createExperience, ensureExperiences, appendExperience, removeExperience} from '../adult-survey/model.mjs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const spec = JSON.parse(read('adult-survey/survey-spec.json'));
const model = createAdultSurveyModel(spec);
const experience = spec.pages.find(page => page.id === 'experience');
const about = spec.pages.find(page => page.id === 'about');
const agreed = {consent: 'adult_agree'};
const validAbout = () => ({
  ...agreed,
  role: 'service_member',
  community_connection: ['defence_greater_darwin'],
  age_group: '18_29',
  current_connection: 'yes',
  residence_area: 'outside',
  nt_duration: {years: 0, months: 0},
  has_dependants: 'no'
});
const validResponses = () => Object.fromEntries(experience.questions.map(question => [question.id, 'x']));
const complete = () => ({...validAbout(), experiences: [{id: 'first', responses: validResponses()}]});
const responsePath = questionId => `experiences.first.responses.${questionId}`;

test('one adult entry has four stages and no issue-selection or youth route', () => {
  assert.deepEqual(spec.pages.map(page => page.id), PAGE_ORDER);
  assert.equal(spec.scope.adult_only, true);
  assert.match(read('index.html'), /adult-survey\/app.mjs/);
  assert.doesNotMatch(read('index.html'), /survey-variants|youth|data-survey-variant/);
  for (const retired of ['youth.html', 'compare.html', 'adult-wording.html', 'survey-variants/choice/survey-spec.json']) {
    assert.equal(existsSync(new URL(`../${retired}`, import.meta.url)), false);
  }
  for (const alias of ['open-response.html', 'questions.html', 'review.html', 'results.html']) {
    assert.match(read(alias), /url=index.html/);
    assert.doesNotMatch(read(alias), /<script|youth|survey-variants/);
  }
});

test('consent and visible background questions remain required, while six experience answers are optional', () => {
  assert.equal(model.validate({}, 'welcome').length, 1);
  assert.equal(model.validate({consent: 'under_18'}, 'welcome').length, 1);
  assert.deepEqual(model.validate(agreed, 'welcome'), []);
  assert.ok(about.questions.every(question => question.required));
  assert.deepEqual(model.validate(agreed, 'about').map(error => error.path), [
    'role', 'community_connection', 'age_group', 'current_connection', 'residence_area', 'nt_duration.years', 'nt_duration.months', 'has_dependants'
  ]);
  assert.deepEqual(model.validate(validAbout(), 'about'), []);
  const blankAnswers = ensureExperiences(validAbout(), () => 'blank');
  assert.deepEqual(blankAnswers.experiences, [{id: 'blank', responses: {}}]);
  assert.deepEqual(model.validate(blankAnswers, 'experience'), []);
  assert.deepEqual(model.validate(complete(), 'experience'), []);
  assert.deepEqual(experience.questions.map(question => question.id), ['situation', 'actions', 'access', 'outcome', 'support', 'additional']);
  assert.ok(experience.questions.every(question => question.type === 'text' && question.required === false && question.max_length === 5000));
});

test('community connection follows role with the approved multiple choice wording and conditional Other field', () => {
  assert.deepEqual(about.questions.slice(0, 3).map(question => question.id), ['role', 'community_connection', 'community_connection_other']);
  const question = about.questions[1];
  assert.equal(question.label, 'What is your connection to the Greater Darwin Defence community?');
  assert.equal(question.type, 'multiple');
  assert.equal(question.required, true);
  assert.equal(question.help, 'Select all that apply.');
  assert.deepEqual(question.options, [
    {id: 'live_greater_darwin', label: 'I live in Greater Darwin'},
    {id: 'family_connections', label: 'I have family or close connections in Greater Darwin'},
    {id: 'defence_greater_darwin', label: 'I am connected to Defence in Greater Darwin'},
    {id: 'local_defence_elsewhere_nt', label: 'I live in Greater Darwin and have a Defence connection elsewhere in the NT'},
    {id: 'outside_community_connection', label: 'I live outside Greater Darwin but have another connection to the community'},
    {id: 'other', label: 'Other'},
    {id: 'prefer_not', label: 'Prefer not to answer'}
  ]);
  const other = about.questions[2];
  assert.equal(other.label, 'Please specify');
  assert.equal(other.type, 'text');
  assert.equal(other.required, true);
  assert.equal(other.show_when, 'community_connection includes other');
  assert.equal(other.max_length, 5000);
  assert.equal(other.input_mode, 'single_line');
  assert.equal(spec.answer_schema_version, 'adult_open_in_memory_v5');
});

test('community connection accepts every listed answer or several substantive choices without changing eligibility', () => {
  const question = about.questions.find(question => question.id === 'community_connection');
  const values = [
    ...question.options.map(option => [option.id]),
    ['live_greater_darwin', 'family_connections', 'defence_greater_darwin'],
    ['outside_community_connection', 'local_defence_elsewhere_nt', 'other']
  ];
  for (const community_connection of values) {
    const state = {...complete(), community_connection, community_connection_other: 'Another connection'};
    const before = structuredClone(state);
    for (const page of ['about', 'experience', 'review']) assert.deepEqual(model.validate(state, page), []);
    assert.deepEqual(state, before);
  }
  const state = {...complete(), community_connection: ['local_defence_elsewhere_nt'], current_connection: 'no'};
  assert.deepEqual(model.validate(state, 'experience').map(error => error.path), ['current_connection']);
});

test('community connection requires a non-empty array of distinct listed choices', () => {
  const invalid = [
    undefined, null, '', [], 'defence_greater_darwin', {}, false, 0,
    ['unknown'], [null], [0], [false], [{}], [['defence_greater_darwin']],
    ['defence_greater_darwin', 'unknown'], ['defence_greater_darwin', 'defence_greater_darwin'],
    ['prefer_not', 'prefer_not'], Array(1)
  ];
  for (const community_connection of invalid) {
    const state = {...complete(), community_connection};
    const before = structuredClone(state);
    for (const page of ['about', 'experience', 'review']) assert.deepEqual(model.validate(state, page).map(error => error.path), ['community_connection']);
    assert.deepEqual(state, before);
  }
  for (const community_connection of [['prefer_not', 'defence_greater_darwin'], ['other', 'prefer_not'], ['prefer_not', 'other', 'family_connections']]) {
    const state = {...complete(), community_connection, community_connection_other: 'Details'};
    const before = structuredClone(state);
    for (const page of ['about', 'experience', 'review']) {
      assert.deepEqual(model.validate(state, page), [{path: 'community_connection', message: 'Choose Prefer not to answer on its own.'}]);
    }
    assert.deepEqual(state, before);
  }
});

test('reconciling refusal or deselecting Other clears only its hidden text and retains all other answers', () => {
  const state = {...complete(), community_connection: ['other', 'prefer_not', 'family_connections'], community_connection_other: 'Private detail'};
  const before = structuredClone(state);
  const next = model.reconcile(state);
  assert.deepEqual(next.community_connection, ['prefer_not']);
  assert.equal(next.community_connection_other, undefined);
  assert.deepEqual(model.validate(next, 'experience'), []);
  const {community_connection, community_connection_other, ...unchanged} = before;
  const {community_connection: nextSelection, community_connection_other: nextOther, ...retained} = next;
  assert.deepEqual(retained, unchanged);
  assert.deepEqual(state, before);
  const reselected = model.reconcile({...next, community_connection: ['other']}, next);
  assert.equal(reselected.community_connection_other, undefined);
  assert.deepEqual(model.validate(reselected, 'experience').map(error => error.path), ['community_connection_other']);
  for (const selection of [['family_connections'], ['prefer_not'], []]) {
    const candidate = {...before, community_connection: selection};
    const reconciled = model.reconcile(candidate, before);
    assert.equal(reconciled.community_connection_other, undefined);
    assert.deepEqual(reconciled.experiences, before.experiences);
    assert.equal(candidate.community_connection_other, 'Private detail');
  }
  const visible = {...complete(), community_connection: ['other', 'family_connections'], community_connection_other: ' Keep this text '};
  assert.deepEqual(model.reconcile(visible, visible), visible);
});

test('Other community connection text is required only when selected independently of locality visibility', () => {
  const state = {...complete(), community_connection: ['other']};
  assert.deepEqual(model.visibleLocationFields(state), ['residence_area']);
  for (const value of [undefined, null, '', ' ', '\n\r\t', '　']) {
    state.community_connection_other = value;
    for (const page of ['about', 'experience', 'review']) assert.deepEqual(model.validate(state, page).map(error => error.path), ['community_connection_other']);
  }
  for (const value of [0, true, ['not text'], {text: 'answer'}]) {
    state.community_connection_other = value;
    assert.deepEqual(model.validate(state, 'about'), [{path: 'community_connection_other', message: 'Use text for this answer.'}]);
  }
  state.community_connection_other = 'a';
  assert.deepEqual(model.validate(state, 'about'), []);
  assert.deepEqual(model.validate(state, 'experience'), []);
  for (const value of ['a'.repeat(5001), ['hidden text'], null]) {
    const hidden = {...complete(), community_connection_other: value};
    const before = structuredClone(hidden);
    for (const page of ['about', 'experience', 'review']) assert.deepEqual(model.validate(hidden, page), []);
    assert.deepEqual(hidden, before);
    assert.equal(model.reconcile(hidden).community_connection_other, undefined);
  }
});

test('Other community connection text accepts 5000 normalized characters and preserves longer text for correction', () => {
  for (const value of ['a'.repeat(5000), 'a\r\n'.repeat(2500), '😀'.repeat(2500)]) {
    const state = {...complete(), community_connection: ['other'], community_connection_other: value};
    for (const page of ['about', 'experience', 'review']) assert.deepEqual(model.validate(state, page), []);
    state.community_connection_other += 'b';
    const before = structuredClone(state);
    for (const page of ['about', 'experience', 'review']) {
      const errors = model.validate(state, page);
      assert.deepEqual(errors.map(error => error.path), ['community_connection_other']);
      assert.match(errors[0].message, /5,000/);
      assert.deepEqual(state, before);
    }
    assert.equal(model.reconcile(state).community_connection_other, before.community_connection_other);
  }
});

test('experience prompts retain the approved six questions and personal or family guidance', () => {
  assert.deepEqual(experience.questions.map(question => [question.label, question.help || '']), [
    ['What was happening, and how did it affect everyday life for you or your family?', ''],
    ['How did you or your family deal with it?', 'Tell us what you or your family did on your own, who was approached for help, or what help was offered. What changes were you or your family hoping for?'],
    ['What made it easier or harder to get any help you or your family wanted?', 'This could include knowing where to look, getting a response or being able to use what was offered. If you or your family did not seek help, you can say why.'],
    ['What changed for you or your family, if anything, and how are things now?', 'Tell us what helped or did not help, and what remains unresolved for you or your family, if anything.'],
    ['Looking back, what support was missing or could have worked better for you or your family, if anything?', 'Tell us what you or your family wanted help with and what would have made a difference. You can also say what worked well and should continue.'],
    ['Is there anything else you would like us to know about this experience?', 'Optional.']
  ]);
});

test('each experience has its own sixth optional comment with concise shared guidance', () => {
  const additional = experience.questions[5];
  assert.equal(additional.id, 'additional');
  assert.equal(additional.label, 'Is there anything else you would like us to know about this experience?');
  assert.equal(additional.type, 'text');
  assert.equal(additional.required, false);
  assert.equal(additional.max_length, 5000);
  assert.equal(additional.rows, 6);
  assert.equal(additional.help, 'Optional.');
  assert.ok(experience.questions.every(question => !Object.hasOwn(question, 'privacy_hint')));
  assert.doesNotMatch(experience.intro.join(' '), /\b(?:short|brief|concise)\b|a few words|one sentence/i);
});

test('missing additional answers remain optional for every experience', () => {
  const state = complete();
  delete state.experiences[0].responses.additional;
  const before = structuredClone(state);
  assert.deepEqual(model.validate(state, 'experience'), []);
  assert.deepEqual(model.validate(state, 'experience', 'first'), []);
  assert.deepEqual(state, before);
  let blank = ensureExperiences(validAbout(), () => 'blank-first');
  blank = appendExperience(blank, () => 'blank-second');
  assert.deepEqual(model.validate(blank, 'experience'), []);
  assert.ok(blank.experiences.every(entry => !Object.hasOwn(entry.responses, 'additional')));
  const allBlank = ensureExperiences(validAbout(), () => 'initial');
  assert.deepEqual(model.validate(allBlank, 'experience'), []);
});

test('all six experience answers accept omitted, empty, whitespace or a single letter without mutation', () => {
  for (const question of experience.questions) {
    for (const value of [undefined, '', ' ', '\n\r\t', '　', 'a', '.', ' ?', 'n/a']) {
      const state = complete();
      state.experiences[0].responses[question.id] = value;
      const before = structuredClone(state);
      assert.deepEqual(model.validate(state, 'experience'), []);
      assert.deepEqual(state, before);
    }
  }
  const state = {...validAbout(), experiences: [{id: 'blank'}]};
  assert.deepEqual(model.validate(state, 'experience'), []);
});

test('optional written answers reject non-string values rather than coercing or dropping them', () => {
  for (const question of experience.questions) {
    for (const value of [null, 0, true, ['not text'], {text: 'answer'}]) {
      const state = complete();
      const path = responsePath(question.id);
      state.experiences[0].responses[question.id] = value;
      const before = structuredClone(state);
      const errors = model.validate(state, 'experience');
      assert.deepEqual(errors, [{path, message: 'Use text for this answer.'}]);
      assert.deepEqual(state, before);
    }
  }
});

test('every current survey text question has a limit of 5000 characters or fewer', () => {
  assert.equal(MAX_TEXT_CHARACTERS, 5000);
  const questions = spec.pages.flatMap(page => page.questions || []).filter(question => question.type === 'text');
  assert.equal(questions.length, 8);
  for (const question of questions) {
    assert.ok(Number.isSafeInteger(question.max_length) && question.max_length > 0 && question.max_length <= MAX_TEXT_CHARACTERS, question.id);
  }
});

test('all experience answers accept 5000 characters and retain rejected 5001-character text', () => {
  for (const question of experience.questions) {
    assert.equal(question.max_length, 5000);
    for (const text of ['a'.repeat(5000), 'a\r\n'.repeat(2500), '😀'.repeat(2500)]) {
      const state = complete();
      const setValue = value => state.experiences[0].responses[question.id] = value;
      setValue(text);
      assert.deepEqual(model.validate(state, 'experience'), []);
      setValue(text + 'b');
      const before = structuredClone(state);
      const errors = model.validate(state, 'experience');
      assert.equal(errors.length, 1);
      assert.equal(errors[0].path, responsePath(question.id));
      assert.match(errors[0].message, /5,000.*text has not been changed/);
      assert.deepEqual(state, before);
    }
  }
  const state = complete();
  state.experiences[0].responses = Object.fromEntries(experience.questions.map(question => [question.id, 'z'.repeat(5000)]));
  assert.deepEqual(model.validate(state, 'experience'), []);
});

test('visible other-locality text is required, accepts a letter and retains overlength text for correction', () => {
  const question = about.questions.find(question => question.id === 'suburb_other');
  assert.equal(question.max_length, 5000);
  assert.equal(question.input_mode, 'single_line');
  const state = {...complete(), residence_area: 'darwin', suburb: 'other'};
  for (const value of [undefined, '', ' \n\t']) {
    state.suburb_other = value;
    for (const page of ['about', 'experience', 'review']) {
      assert.deepEqual(model.validate(state, page).map(error => error.path), ['suburb_other']);
    }
  }
  for (const value of ['a', 'a'.repeat(5000)]) {
    state.suburb_other = value;
    assert.deepEqual(model.validate(state, 'about'), []);
    assert.deepEqual(model.validate(state, 'experience'), []);
  }
  state.suburb_other += 'b';
  const before = structuredClone(state);
  for (const page of ['about', 'experience', 'review']) {
    const errors = model.validate(state, page);
    assert.deepEqual(errors.map(error => error.path), ['suburb_other']);
    assert.deepEqual(state, before);
  }
});

test('narratives keep raw text and use the newline-normalised UTF-16 character count', () => {
  const state = complete();
  state.experiences[0].responses.actions = '<script>alert(1)</script> Military friend, not a coded answer.';
  const before = structuredClone(state);
  assert.deepEqual(model.validate(state, 'experience'), []);
  assert.deepEqual(state, before);
  assert.equal(characterCount('a\r\nb\rc'), 5);
  assert.equal(characterCount('😀'), 2);
});

test('blank experiences have independent responses and unique default IDs', () => {
  const first = createExperience();
  const second = createExperience();
  assert.match(first.id, /^[A-Za-z0-9_-]+$/);
  assert.notEqual(first.id, second.id);
  assert.deepEqual(first.responses, {});
  first.responses.situation = 'First experience';
  assert.deepEqual(second.responses, {});
  assert.deepEqual(createExperience(() => 'deterministic'), {id: 'deterministic', responses: {}});
});

test('ensuring experiences is immutable and idempotent, with at least one blank page', () => {
  for (const state of [{}, {experiences: []}]) {
    const before = structuredClone(state);
    const next = ensureExperiences(state, () => 'initial');
    assert.deepEqual(next.experiences, [{id: 'initial', responses: {}}]);
    assert.deepEqual(ensureExperiences(next, () => assert.fail('Existing IDs must remain stable')), next);
    assert.deepEqual(state, before);
  }
  const state = complete();
  const before = structuredClone(state);
  const next = ensureExperiences(state);
  assert.deepEqual(next, state);
  next.experiences[0].responses.situation = 'Edited clone';
  assert.deepEqual(state, before);
});

test('missing, invalid or duplicate experience IDs are repaired without merging or changing text', () => {
  const state = {
    experiences: [
      {id: 'known', responses: {situation: 'A'}},
      {id: 'known', responses: {situation: 'B'}},
      {responses: {situation: 'C\r\n'}},
      {id: 'unsafe.id', responses: {situation: 'D'}},
      {id: '__proto__', responses: {situation: 'E'}},
      {id: 'empty-response'}
    ]
  };
  const before = structuredClone(state);
  const next = ensureExperiences(state, () => 'repaired');
  assert.deepEqual(next.experiences.map(entry => entry.id), ['known', 'repaired', 'repaired-2', 'repaired-3', 'repaired-4', 'empty-response']);
  assert.deepEqual(next.experiences.slice(0, 5).map(entry => entry.responses.situation), ['A', 'B', 'C\r\n', 'D', 'E']);
  assert.deepEqual(next.experiences[5].responses, {});
  assert.deepEqual(ensureExperiences(next), next);
  assert.deepEqual(state, before);
  for (const invalid of [{experiences: 'raw'}, {experiences: [null]}, []]) assert.throws(() => ensureExperiences(invalid), TypeError);
});

test('repairing an earlier missing ID cannot take a later existing stable ID', () => {
  const state = {experiences: [{responses: {situation: 'Earlier'}}, {id: 'reserved', responses: {situation: 'Later'}}]};
  const next = ensureExperiences(state, () => 'reserved');
  assert.deepEqual(next.experiences.map(entry => entry.id), ['reserved-2', 'reserved']);
  assert.deepEqual(next.experiences.map(entry => entry.responses.situation), ['Earlier', 'Later']);
  assert.deepEqual(ensureExperiences(next), next);
});

test('adding and removing middle experiences preserve IDs, all answers and the shared background', () => {
  const make = id => ({id, responses: Object.fromEntries(experience.questions.map(question => [question.id, `${id}: ${question.id}`]))});
  const state = {...validAbout(), experiences: ['A', 'B', 'C'].map(make)};
  const before = structuredClone(state);
  const removed = removeExperience(state, 'B');
  assert.deepEqual(removed.experiences, [make('A'), make('C')]);
  assert.deepEqual(state, before);
  const added = appendExperience(removed, () => 'D');
  assert.deepEqual(added.experiences, [make('A'), make('C'), {id: 'D', responses: {}}]);
  for (const key of ['role', 'age_group', 'nt_duration', 'consent']) assert.deepEqual(added[key], state[key]);
  added.experiences[2].responses.situation = 'D only';
  assert.equal(added.experiences[0].responses.situation, 'A: situation');
  assert.equal(added.experiences[1].responses.situation, 'C: situation');
  assert.deepEqual(removed.experiences, [make('A'), make('C')]);
});

test('removal never deletes the last experience and unknown IDs leave answers intact', () => {
  const single = complete();
  assert.deepEqual(removeExperience(single, 'first'), single);
  assert.deepEqual(removeExperience(single, 'unknown'), single);
  const multiple = appendExperience(single, () => 'second');
  assert.deepEqual(removeExperience(multiple, 'unknown'), multiple);
  assert.deepEqual(removeExperience(multiple, 'first').experiences, [{id: 'second', responses: {}}]);
  assert.deepEqual(removeExperience({}, 'unknown').experiences.length, 1);
});

test('users can add further experiences without a fixed count ceiling or ID collisions', () => {
  let state = ensureExperiences(validAbout(), () => 'repeat');
  for (let index = 0; index < 24; index += 1) state = appendExperience(state, () => 'repeat');
  assert.equal(state.experiences.length, 25);
  assert.equal(new Set(state.experiences.map(entry => entry.id)).size, 25);
  assert.deepEqual(model.validate(state, 'experience'), []);
  const restored = ensureExperiences(JSON.parse(JSON.stringify(state)));
  assert.deepEqual(restored, state);
});

test('review includes all visible background questions in order with display labels and numeric zero', () => {
  const state = {
    ...complete(),
    community_connection: ['other', 'defence_greater_darwin', 'family_connections', 'live_greater_darwin'],
    community_connection_other: 'Community detail & <text>',
    residence_area: 'darwin',
    suburb: 'other',
    suburb_other: 'Another locality',
    has_dependants: 'yes',
    dependants: {total: 0, living_with: 0}
  };
  assert.deepEqual(model.validate(state, 'review'), []);
  const before = structuredClone(state);
  const projection = model.review(state);
  assert.deepEqual(Object.keys(projection), ['about', 'experiences']);
  assert.deepEqual(projection.about.map(row => row.id), [
    'role', 'community_connection', 'community_connection_other', 'age_group', 'current_connection',
    'residence_area', 'suburb', 'suburb_other', 'nt_duration', 'has_dependants', 'dependants_count'
  ]);
  assert.deepEqual(projection.about.map(row => row.label), about.questions.map(question => question.label));
  const display = Object.fromEntries(projection.about.map(row => [row.id, row.answers]));
  assert.deepEqual(display, {
    role: ['Currently serving member'],
    community_connection: ['I live in Greater Darwin', 'I have family or close connections in Greater Darwin', 'I am connected to Defence in Greater Darwin', 'Other'],
    community_connection_other: ['Community detail & <text>'],
    age_group: ['18–29'],
    current_connection: ['Yes'],
    residence_area: ['Darwin'],
    suburb: ['Another suburb or locality in this area'],
    suburb_other: ['Another locality'],
    nt_duration: ['Years: 0', 'Months: 0'],
    has_dependants: ['Yes'],
    dependants_count: ['Total number of dependants: 0', 'Number who live with you: 0']
  });
  assert.deepEqual(state, before);
});

test('review resolves locality labels and hides every inactive conditional answer', () => {
  const locality = spec.geography.localities.find(item => item.region === 'darwin');
  const local = {...complete(), residence_area: 'darwin', suburb: locality.id};
  const localRow = model.review(local).about.find(row => row.id === 'suburb');
  assert.deepEqual(localRow.answers, [locality.label]);
  const state = {...complete(), suburb: locality.id, suburb_other: 'Hidden locality', community_connection_other: 'Hidden community', dependants: {total: 9, living_with: 7}};
  const before = structuredClone(state);
  const projection = model.review(state);
  assert.deepEqual(projection.about.map(row => row.id), ['role', 'community_connection', 'age_group', 'current_connection', 'residence_area', 'nt_duration', 'has_dependants']);
  assert.doesNotMatch(JSON.stringify(projection), /Hidden locality|Hidden community|Total number of dependants/);
  assert.deepEqual(state, before);
  const changed = {...state, community_connection: ['other'], community_connection_other: 'Now visible', has_dependants: 'yes'};
  const visibleIds = model.review(changed).about.map(row => row.id);
  assert.ok(visibleIds.includes('community_connection_other'));
  assert.ok(visibleIds.includes('dependants_count'));
  assert.equal(visibleIds.includes('suburb'), false);
});

test('review shows refusal labels without exposing refused or hidden numeric and Other values', () => {
  const state = {
    ...complete(), role: 'prefer_not', age_group: 'prefer_not', current_connection: 'prefer_not',
    community_connection: ['prefer_not'], community_connection_other: 'Hidden refused detail',
    residence_area: 'darwin', suburb: 'prefer_not', suburb_other: 'Hidden refused locality',
    nt_duration: {years: 88, months: 10, prefer_not: true},
    has_dependants: 'yes', dependants: {total: 8, living_with: 7, prefer_not: true}
  };
  const before = structuredClone(state);
  assert.deepEqual(model.validate(state, 'review'), []);
  const projection = model.review(state);
  const display = Object.fromEntries(projection.about.map(row => [row.id, row.answers]));
  for (const id of ['role', 'age_group', 'current_connection', 'community_connection', 'suburb', 'nt_duration', 'dependants_count']) {
    assert.deepEqual(display[id], ['Prefer not to answer']);
  }
  assert.equal(display.community_connection_other, undefined);
  assert.equal(display.suburb_other, undefined);
  assert.doesNotMatch(JSON.stringify(projection), /Years: 88|Months: 10|dependants: 8|live with you: 7|Hidden refused/);
  assert.deepEqual(state, before);
});

test('review keeps stable experience IDs and complete raw multiline text in a detached projection', () => {
  const raw = '  <script>literal text</script> & "quotes"\r\nsecond line\rfinal line 😀  '.padEnd(5000, '字');
  const state = appendExperience(complete(), () => 'second');
  state.experiences[0].responses = Object.fromEntries(experience.questions.map(question => [question.id, raw]));
  state.experiences[1].responses = {situation: '', actions: ' \n\t', additional: '　'};
  const before = structuredClone(state);
  assert.deepEqual(model.validate(state, 'review'), []);
  const projection = model.review(state);
  assert.deepEqual(projection.experiences.map(entry => [entry.id, entry.number]), [['first', 1], ['second', 2]]);
  assert.deepEqual(projection.experiences[0].questions.map(question => [question.id, question.label]), experience.questions.map(question => [question.id, question.label]));
  for (const question of projection.experiences[0].questions) assert.deepEqual(question.answers, [raw]);
  for (const question of projection.experiences[1].questions) assert.deepEqual(question.answers, ['Not answered']);
  assert.deepEqual(state, before);
  projection.about[0].answers[0] = 'Edited display copy';
  projection.experiences[0].questions[0].answers[0] = 'Edited display copy';
  assert.deepEqual(state, before);
  const afterDeletion = model.review(removeExperience(state, 'first'));
  assert.deepEqual(afterDeletion.experiences.map(entry => [entry.id, entry.number]), [['second', 1]]);
});

test('review validation checks all six answers, background, consent and eligibility regardless of active ID', () => {
  for (const question of experience.questions) {
    const state = appendExperience(complete(), () => 'second');
    state.experiences[0].responses[question.id] = 'a'.repeat(5001);
    const before = structuredClone(state);
    assert.deepEqual(model.validate(state, 'experience', 'second'), []);
    const allErrors = model.validate(state, 'experience');
    assert.deepEqual(allErrors.map(error => error.path), [responsePath(question.id)]);
    assert.deepEqual(model.validate(state, 'review', 'second'), allErrors);
    assert.deepEqual(model.validate(state, 'review', 'missing'), allErrors);
    assert.deepEqual(state, before);
  }
  const blank = ensureExperiences(validAbout(), () => 'initial');
  assert.deepEqual(model.validate(blank, 'review'), []);
  for (const [changes, paths] of [
    [{role: undefined}, ['role']],
    [{consent: undefined}, ['consent']],
    [{current_connection: 'no'}, ['current_connection']],
    [{community_connection: ['other']}, ['community_connection_other']],
    [{residence_area: 'darwin'}, ['suburb']],
    [{has_dependants: 'yes'}, ['dependants.total', 'dependants.living_with']],
    [{nt_duration: {}}, ['nt_duration.years', 'nt_duration.months']],
    [{experiences: []}, ['experiences']]
  ]) {
    const state = {...complete(), ...changes};
    assert.deepEqual(model.validate(state, 'review').map(error => error.path), paths);
    assert.deepEqual(model.validate(state, 'review'), model.validate(state, 'experience'));
  }
});

test('active-page validation isolates text checks, while finishing checks every experience by stable ID', () => {
  const state = appendExperience(complete(), () => 'second');
  state.experiences[0].responses.access = 'a'.repeat(5001);
  state.experiences[1].responses.situation = 'Current answer';
  const before = structuredClone(state);
  assert.deepEqual(model.validate(state, 'experience', 'second'), []);
  assert.deepEqual(model.validate(state, 'experience').map(error => error.path), ['experiences.first.responses.access']);
  assert.deepEqual(model.validate(state, 'experience', 'first').map(error => error.path), ['experiences.first.responses.access']);
  assert.deepEqual(model.validate(state, 'experience', 'missing').map(error => error.path), ['experiences']);
  assert.deepEqual(state, before);
  delete state.role;
  assert.deepEqual(model.validate(state, 'experience', 'second').map(error => error.path), ['role']);
});

test('malformed experience structures are rejected without silently replacing their answers', () => {
  for (const experiences of [undefined, [], null, 'text', {}]) {
    const state = {...validAbout(), experiences};
    const before = structuredClone(state);
    assert.deepEqual(model.validate(state, 'experience').map(error => error.path), ['experiences']);
    assert.deepEqual(state, before);
  }
  for (const responses of [null, 'text', ['text']]) {
    const state = {...validAbout(), experiences: [{id: 'first', responses}]};
    assert.deepEqual(model.validate(state, 'experience').map(error => error.path), ['experiences.first.responses']);
  }
  assert.deepEqual(model.validate({...validAbout(), experiences: [{id: 'same'}, {id: 'same'}]}, 'experience').map(error => error.path), ['experiences.1']);
});

test('background changes clear dependent and retired fields, preserving NT duration and narratives', () => {
  const state = {...complete(), suburb: 'other', suburb_other: 'Old locality', time_local: 'over3', past_residence: 'no', time_past: 'over3', dependants: {total: 1, living_with: 1}, nt_duration: {years: 2, months: 3}};
  const next = model.reconcile(state);
  for (const key of ['suburb', 'suburb_other', 'past_residence', 'time_local', 'time_past', 'dependants']) assert.equal(next[key], undefined, key);
  assert.deepEqual(next.experiences, state.experiences);
  assert.deepEqual(next.nt_duration, state.nt_duration);
  assert.equal(state.suburb_other, 'Old locality');
  assert.deepEqual(model.visibleLocationFields(next), ['residence_area']);
});

test('a locality from a previous area cannot silently remain selected', () => {
  const locality = spec.geography.localities.find(item => item.region === 'darwin');
  const state = {...validAbout(), residence_area: 'palmerston', suburb: locality.id};
  assert.deepEqual(model.validate(state, 'about').map(error => error.path), ['suburb']);
  assert.equal(model.reconcile(state).suburb, undefined);
});

test('invalid dependant counts, partial numbers and contradictory totals cannot advance', () => {
  for (const value of [-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, '2']) {
    const state = {...validAbout(), has_dependants: 'yes', dependants: {total: value, living_with: 0}};
    assert.deepEqual(model.validate(state, 'about').map(error => error.path), ['dependants.total']);
  }
  const state = {...complete(), has_dependants: 'yes', dependants: {total: 1, living_with: 2}};
  assert.deepEqual(model.validate(state, 'experience').map(error => error.path), ['dependants.living_with']);
  state.dependants.living_with = 1;
  assert.deepEqual(model.validate(state, 'about'), []);
});

test('every single-choice background question and locality list offers Prefer not to answer', () => {
  for (const question of about.questions.filter(question => question.type === 'single')) {
    assert.deepEqual(question.options.find(option => option.id === 'prefer_not'), {id: 'prefer_not', label: 'Prefer not to answer'});
    assert.deepEqual(model.validate({...validAbout(), [question.id]: 'prefer_not'}, 'about'), []);
  }
  assert.deepEqual(spec.geography.extra_locality_options.find(option => option.id === 'prefer_not'), {id: 'prefer_not', label: 'Prefer not to answer'});
  const residence = about.questions.find(question => question.id === 'residence_area');
  assert.deepEqual(residence.primary_option_ids, ['darwin', 'palmerston', 'litchfield']);
  assert.deepEqual(residence.secondary_option_ids, ['greater_darwin_other', 'outside']);
  assert.deepEqual(residence.options.map(option => option.id), [...residence.primary_option_ids, ...residence.secondary_option_ids, 'prefer_not']);
  assert.equal(residence.disclosure_label, 'Other area');
  const refusedArea = {...complete(), residence_area: 'prefer_not', suburb: 'other', suburb_other: ''};
  assert.deepEqual(model.visibleLocationFields(refusedArea), ['residence_area']);
  assert.deepEqual(model.validate(refusedArea, 'experience'), []);
  assert.equal(model.reconcile(refusedArea).suburb, undefined);
  assert.deepEqual(model.validate({...validAbout(), role: 'not_listed'}, 'about').map(error => error.path), ['role']);
});

test('locality is required only for a local area and another-locality text only for Other', () => {
  for (const residence_area of ['darwin', 'palmerston', 'litchfield', 'greater_darwin_other']) {
    const state = {...validAbout(), residence_area};
    assert.deepEqual(model.validate(state, 'about').map(error => error.path), ['suburb']);
    state.suburb = 'prefer_not';
    assert.deepEqual(model.visibleLocationFields(state), ['residence_area', 'suburb']);
    assert.deepEqual(model.validate(state, 'about'), []);
    state.suburb = spec.geography.localities.find(item => item.region === residence_area).id;
    state.suburb_other = ['hidden invalid text'];
    assert.deepEqual(model.validate(state, 'about'), []);
  }
  for (const residence_area of ['outside', 'prefer_not']) {
    assert.deepEqual(model.validate({...validAbout(), residence_area, suburb: 'not_listed', suburb_other: ''}, 'about'), []);
  }
});

test('dependants use a required choice and required totals without age groups when Yes is selected', () => {
  const question = about.questions.find(question => question.id === 'has_dependants');
  assert.equal(question.label, 'Do you have any dependants?');
  assert.deepEqual(question.options.map(option => option.id), ['yes', 'no', 'prefer_not']);
  assert.equal(question.help, 'Include children or adults who rely on you for care or financial support.');
  const counts = about.questions.find(question => question.id === 'dependants_count');
  assert.equal(counts.show_when, 'has_dependants == yes');
  assert.deepEqual(counts.fields.map(field => field.path), ['dependants.total', 'dependants.living_with']);
  assert.ok(counts.fields.every(field => field.required && field.min === 0 && field.max === Number.MAX_SAFE_INTEGER));
  assert.equal(counts.rows, undefined);
  assert.deepEqual(model.validate({...validAbout(), has_dependants: 'yes'}, 'about').map(error => error.path), ['dependants.total', 'dependants.living_with']);
  assert.deepEqual(model.validate({...validAbout(), has_dependants: 'yes', dependants: {total: 3}}, 'about').map(error => error.path), ['dependants.living_with']);
  for (const dependants of [{total: 0, living_with: 0}, {total: 3, living_with: 1}, {total: Number.MAX_SAFE_INTEGER, living_with: Number.MAX_SAFE_INTEGER}]) {
    assert.deepEqual(model.validate({...validAbout(), has_dependants: 'yes', dependants}, 'about'), []);
  }
  for (const has_dependants of ['no', 'prefer_not']) {
    const state = {...complete(), has_dependants, dependants: {total: -1, living_with: 'invalid', prefer_not: true}};
    assert.deepEqual(model.validate(state, 'experience'), []);
    const next = model.reconcile(state);
    assert.equal(next.dependants, undefined);
    assert.deepEqual(next.nt_duration, state.nt_duration);
    assert.deepEqual(next.experiences, state.experiences);
    assert.deepEqual(state.dependants, {total: -1, living_with: 'invalid', prefer_not: true});
  }
});

test('NT duration requires whole years 0–99 and months 0–11 unless declined', () => {
  const duration = about.questions.find(question => question.id === 'nt_duration');
  assert.equal(duration.label, 'How long have you lived in the NT?');
  assert.equal(duration.show_when, undefined);
  assert.deepEqual(duration.fields.map(field => [field.path, field.min, field.max]), [['nt_duration.years', 0, 99], ['nt_duration.months', 0, 11]]);
  assert.ok(duration.fields.every(field => field.required));
  for (const retired of ['time_local', 'time_past', 'past_residence', 'dependants']) {
    assert.equal(about.questions.some(question => question.id === retired), false);
  }
  for (const residence_area of ['outside', 'prefer_not']) {
    for (const nt_duration of [{years: 0, months: 0}, {years: 99, months: 11}]) {
      assert.deepEqual(model.validate({...validAbout(), residence_area, nt_duration}, 'about'), []);
    }
  }
  assert.deepEqual(model.validate({...validAbout(), nt_duration: {}}, 'about').map(error => error.path), ['nt_duration.years', 'nt_duration.months']);
  assert.deepEqual(model.validate({...validAbout(), nt_duration: {years: 2}}, 'about').map(error => error.path), ['nt_duration.months']);
  assert.deepEqual(model.validate({...validAbout(), nt_duration: {months: 3}}, 'about').map(error => error.path), ['nt_duration.years']);
  for (const [field, values] of [['years', [-1, 100, 0.5, NaN, Infinity, '2']], ['months', [-1, 12, 0.5, NaN, Infinity, '3']]]) {
    for (const value of values) {
      const state = {...validAbout(), nt_duration: {years: 0, months: 0, [field]: value}};
      assert.deepEqual(model.validate(state, 'about').map(error => error.path), [`nt_duration.${field}`]);
    }
  }
});

test('numeric refusal bypasses requirements and clears numeric values without changing other answers', () => {
  for (const [id, path] of [['nt_duration', 'nt_duration.prefer_not'], ['dependants_count', 'dependants.prefer_not']]) {
    const question = about.questions.find(question => question.id === id);
    assert.equal(question.refusal_path, path);
    assert.equal(question.refusal_label, 'Prefer not to answer');
  }
  const state = {...complete(), has_dependants: 'yes', nt_duration: {years: 1000, months: 'bad', prefer_not: true}, dependants: {total: -1, living_with: Infinity, prefer_not: true}};
  const before = structuredClone(state);
  assert.deepEqual(model.validate(state, 'about'), []);
  assert.deepEqual(model.validate(state, 'experience'), []);
  const next = model.reconcile(state);
  assert.deepEqual(next.nt_duration, {prefer_not: true});
  assert.deepEqual(next.dependants, {prefer_not: true});
  assert.deepEqual(next.experiences, state.experiences);
  assert.deepEqual(state, before);
  assert.deepEqual(model.validate(next, 'experience'), []);
  for (const prefer_not of [false, 'true', 1]) {
    const unrefused = {...validAbout(), nt_duration: {prefer_not}};
    assert.deepEqual(model.validate(unrefused, 'about').map(error => error.path), ['nt_duration.years', 'nt_duration.months']);
  }
});

test('changing residence clears a generic other locality but retains duration and all narratives', () => {
  const previous = {...complete(), residence_area: 'darwin', suburb: 'other', suburb_other: 'Old locality', nt_duration: {years: 3, months: 6}};
  const candidate = {...previous, residence_area: 'palmerston'};
  const next = model.reconcile(candidate, previous);
  assert.equal(next.suburb, undefined);
  assert.equal(next.suburb_other, undefined);
  assert.deepEqual(next.nt_duration, previous.nt_duration);
  assert.deepEqual(next.experiences, previous.experiences);
  assert.equal(previous.suburb_other, 'Old locality');
  const unchanged = model.reconcile(previous, previous);
  assert.equal(unchanged.suburb, 'other');
  assert.equal(unchanged.suburb_other, 'Old locality');
});

test('current connection, background answers and consent cannot be bypassed at completion', () => {
  assert.ok(model.validate({}, 'experience').some(error => error.path === 'consent'));
  assert.ok(model.validate({...complete(), current_connection: 'no'}, 'experience').some(error => error.path === 'current_connection'));
  const state = complete();
  delete state.role;
  assert.deepEqual(model.validate(state, 'experience').map(error => error.path), ['role']);
  assert.deepEqual(model.validate({...complete(), current_connection: 'prefer_not'}, 'experience'), []);
});

test('thanks links are separate resources with no answer parameters; completion has no receipt claim', () => {
  const thanks = spec.pages.find(page => page.id === 'thanks');
  assert.deepEqual(thanks.links.map(link => link.url), ['contact.html', 'support.html']);
  assert.doesNotMatch(thanks.intro.join(' '), /received|recorded|successfully submitted/i);
  assert.equal(spec.scope.collection_enabled, false);
  const app = read('adult-survey/app.mjs');
  assert.doesNotMatch(app, /XMLHttpRequest|sendBeacon|localStorage|sessionStorage|indexedDB/);
  assert.match(app, /const response = await fetch\(url\)/);
  assert.match(app, /referrerpolicy="no-referrer"/);
  assert.match(app, /data-max-length="\$\{maxLength\}"/);
  assert.doesNotMatch(app, /maxlength="|data-count-for|Leave survey/);
});
