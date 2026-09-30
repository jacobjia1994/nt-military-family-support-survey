import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {createAdultSurveyModel, characterCount, MAX_TEXT_CHARACTERS, PAGE_ORDER} from '../adult-survey/model.mjs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const spec = JSON.parse(read('adult-survey/survey-spec.json'));
const model = createAdultSurveyModel(spec);
const experience = spec.pages.find(page => page.id === 'experience');
const about = spec.pages.find(page => page.id === 'about');
const agreed = {consent: 'adult_agree'};
const validAbout = () => ({
  ...agreed,
  role: 'service_member',
  age_group: '18_29',
  current_connection: 'yes',
  residence_area: 'outside',
  nt_duration: {years: 0, months: 0},
  has_dependants: 'no'
});
const validResponses = () => Object.fromEntries(experience.questions.map(question => [question.id, 'x']));
const complete = () => ({...validAbout(), responses: validResponses()});

test('one adult entry has four pages and no issue-selection or youth route', () => {
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

test('consent, visible background questions and all seven narrative answers are required', () => {
  assert.equal(model.validate({}, 'welcome').length, 1);
  assert.equal(model.validate({consent: 'under_18'}, 'welcome').length, 1);
  assert.deepEqual(model.validate(agreed, 'welcome'), []);
  assert.ok(about.questions.every(question => question.required));
  assert.deepEqual(model.validate(agreed, 'about').map(error => error.path), [
    'role', 'age_group', 'current_connection', 'residence_area', 'nt_duration.years', 'nt_duration.months', 'has_dependants'
  ]);
  assert.deepEqual(model.validate(validAbout(), 'about'), []);
  const missingNarratives = model.validate(validAbout(), 'experience');
  assert.deepEqual(missingNarratives.map(error => error.path), experience.questions.map(question => `responses.${question.id}`));
  assert.deepEqual(model.validate(complete(), 'experience'), []);
  assert.equal(experience.questions.length, 7);
  assert.ok(experience.questions.every(question => question.type === 'text' && question.required && Number.isSafeInteger(question.max_length) && question.max_length > 0 && /identify/.test(question.privacy_hint)));
  assert.equal(experience.questions[6].label, 'Is there anything else you want to add?');
});

test('all narratives reject missing or whitespace-only answers and accept one letter or punctuation', () => {
  for (const question of experience.questions) {
    for (const value of [undefined, null, '', ' ', '\n\r\t', '　']) {
      const state = complete();
      state.responses[question.id] = value;
      const before = structuredClone(state);
      const errors = model.validate(state, 'experience');
      assert.deepEqual(errors.map(error => error.path), [`responses.${question.id}`]);
      assert.equal(errors[0].message, 'Please enter an answer.');
      assert.deepEqual(state, before);
    }
    for (const value of ['a', '.', ' ?', 'n/a']) {
      const state = complete();
      state.responses[question.id] = value;
      const before = structuredClone(state);
      assert.deepEqual(model.validate(state, 'experience'), []);
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

test('all seven narratives accept 5000 characters and reject 5001 without changing text', () => {
  for (const question of experience.questions) {
    assert.equal(question.max_length, 5000);
    const state = complete();
    state.responses[question.id] = 'a'.repeat(5000);
    assert.deepEqual(model.validate(state, 'experience'), []);
    state.responses[question.id] += 'b';
    const before = structuredClone(state);
    const errors = model.validate(state, 'experience');
    assert.equal(errors.length, 1);
    assert.equal(errors[0].path, `responses.${question.id}`);
    assert.deepEqual(state, before);
  }
  const all = {...validAbout(), responses: Object.fromEntries(experience.questions.map(question => [question.id, 'z'.repeat(5000)]))};
  assert.deepEqual(model.validate(all, 'experience'), []);
});

test('visible other-locality text is required, accepts a letter and retains overlength text for correction', () => {
  const question = about.questions.find(question => question.id === 'suburb_other');
  assert.equal(question.max_length, 5000);
  const state = {...complete(), residence_area: 'darwin', suburb: 'other'};
  for (const value of [undefined, '', ' \n\t']) {
    state.suburb_other = value;
    for (const page of ['about', 'experience']) {
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
  for (const page of ['about', 'experience']) {
    const errors = model.validate(state, page);
    assert.deepEqual(errors.map(error => error.path), ['suburb_other']);
    assert.deepEqual(state, before);
  }
});

test('narratives keep raw text and use the newline-normalised UTF-16 character count', () => {
  const state = complete();
  state.responses.help_sources = '<script>alert(1)</script> Military friend, not a coded answer.';
  const before = structuredClone(state);
  assert.deepEqual(model.validate(state, 'experience'), []);
  assert.deepEqual(state, before);
  assert.equal(characterCount('a\r\nb\rc'), 5);
  assert.equal(characterCount('😀'), 2);
  state.responses.help_needed = ['not text'];
  assert.deepEqual(model.validate(state, 'experience').map(error => error.path), ['responses.help_needed']);
});

test('background changes clear dependent and retired fields, preserving NT duration and narratives', () => {
  const state = {...complete(), suburb: 'other', suburb_other: 'Old locality', time_local: 'over3', past_residence: 'no', time_past: 'over3', dependants: {total: 1, living_with: 1}, nt_duration: {years: 2, months: 3}};
  const next = model.reconcile(state);
  for (const key of ['suburb', 'suburb_other', 'past_residence', 'time_local', 'time_past', 'dependants']) assert.equal(next[key], undefined, key);
  assert.deepEqual(next.responses, state.responses);
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
    assert.deepEqual(next.responses, state.responses);
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
  assert.deepEqual(next.responses, state.responses);
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
  assert.deepEqual(next.responses, previous.responses);
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
  assert.doesNotMatch(app, /XMLHttpRequest|sendBeacon|sessionStorage|indexedDB/);
  assert.match(app, /const response = await fetch\(url\)/);
  assert.match(app, /referrerpolicy="no-referrer"/);
  assert.match(app, /data-max-length="\$\{maxLength\}"/);
  assert.doesNotMatch(app, /maxlength="|data-count-for|Leave survey/);
});
