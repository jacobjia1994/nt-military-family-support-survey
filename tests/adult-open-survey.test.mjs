import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {createAdultSurveyModel, characterCount, PAGE_ORDER} from '../adult-survey/model.mjs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const spec = JSON.parse(read('adult-survey/survey-spec.json'));
const model = createAdultSurveyModel(spec);
const experience = spec.pages.find(page => page.id === 'experience');
const about = spec.pages.find(page => page.id === 'about');
const agreed = {consent: 'adult_agree'};

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

test('consent is required; background and all seven narrative answers remain optional', () => {
  assert.equal(model.validate({}, 'welcome').length, 1);
  assert.equal(model.validate({consent: 'under_18'}, 'welcome').length, 1);
  assert.deepEqual(model.validate(agreed, 'welcome'), []);
  assert.deepEqual(model.validate(agreed, 'about'), []);
  assert.deepEqual(model.validate(agreed, 'experience'), []);
  assert.equal(experience.questions.length, 7);
  assert.ok(experience.questions.every(question => question.type === 'text' && !question.required && Number.isSafeInteger(question.max_length) && question.max_length > 0 && /identify/.test(question.privacy_hint)));
  assert.equal(experience.questions[6].label, 'Is there anything else you want to add?');
});

test('every narrative accepts its configured character maximum and rejects one more without changing text', () => {
  for (const question of experience.questions) {
    const value = 'a'.repeat(question.max_length);
    const state = {...agreed, responses: {[question.id]: value}};
    assert.deepEqual(model.validate(state, 'experience'), []);
    state.responses[question.id] += 'b';
    const before = structuredClone(state);
    const errors = model.validate(state, 'experience');
    assert.equal(errors.length, 1);
    assert.equal(errors[0].path, `responses.${question.id}`);
    assert.deepEqual(state, before);
  }
  const all = {...agreed, responses: Object.fromEntries(experience.questions.map(question => [question.id, 'z'.repeat(question.max_length)]))};
  assert.deepEqual(model.validate(all, 'experience'), []);
});

test('narratives keep raw text and use the newline-normalised UTF-16 character count', () => {
  const state = {...agreed, responses: {help_sources: '<script>alert(1)</script> Military friend, not a coded answer.'}};
  const before = structuredClone(state);
  assert.deepEqual(model.validate(state, 'experience'), []);
  assert.deepEqual(state, before);
  assert.equal(characterCount('a\r\nb\rc'), 5);
  assert.equal(characterCount('😀'), 2);
  assert.equal(model.validate({...agreed, responses: {help_needed: ['not text']}}, 'experience')[0].path, 'responses.help_needed');
});

test('background changes clear dependent and retired fields, preserving NT duration and narratives', () => {
  const state = {...agreed, residence_area: 'outside', suburb: 'other', suburb_other: 'Old locality', time_local: 'over3', past_residence: 'no', time_past: 'over3', has_dependants: 'no', dependants: {total: 1, living_with: 1}, nt_duration: {years: 2, months: 3}, responses: {difficulties: 'Keep this experience'}};
  const next = model.reconcile(state);
  for (const key of ['suburb', 'suburb_other', 'past_residence', 'time_local', 'time_past', 'dependants']) assert.equal(next[key], undefined, key);
  assert.deepEqual(next.responses, state.responses);
  assert.deepEqual(next.nt_duration, state.nt_duration);
  assert.equal(state.suburb_other, 'Old locality');
  assert.deepEqual(model.visibleLocationFields(next), ['residence_area']);
});

test('a locality from a previous area cannot silently remain selected', () => {
  const locality = spec.geography.localities.find(item => item.region === 'darwin');
  const state = {...agreed, residence_area: 'palmerston', suburb: locality.id};
  assert.equal(model.validate(state, 'about')[0].path, 'suburb');
  assert.equal(model.reconcile(state).suburb, undefined);
});

test('invalid dependant counts, partial numbers and contradictory totals cannot advance', () => {
  for (const value of [-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, '2']) {
    const state = {...agreed, has_dependants: 'yes', dependants: {total: value}};
    assert.equal(model.validate(state, 'about')[0].path, 'dependants.total');
  }
  const state = {...agreed, has_dependants: 'yes', dependants: {total: 1, living_with: 2}};
  assert.equal(model.validate(state, 'experience')[0].path, 'dependants.living_with');
  state.dependants.living_with = 1;
  assert.deepEqual(model.validate(state, 'about'), []);
});

test('background options have no prefer-not answers and retain optional location choices', () => {
  const options = about.questions.flatMap(question => question.options || []);
  for (const option of [...options, ...spec.geography.areas, ...spec.geography.extra_locality_options]) {
    assert.doesNotMatch(option.id, /^prefer/);
    assert.doesNotMatch(option.label, /prefer not/i);
  }
  const residence = about.questions.find(question => question.id === 'residence_area');
  assert.deepEqual(residence.primary_option_ids, ['darwin', 'palmerston', 'litchfield']);
  assert.deepEqual(residence.secondary_option_ids, ['greater_darwin_other', 'outside']);
  assert.deepEqual(residence.options.map(option => option.id), [...residence.primary_option_ids, ...residence.secondary_option_ids]);
  assert.equal(residence.disclosure_label, 'Other area');
  assert.deepEqual(model.validate(agreed, 'about'), []);
  assert.equal(model.validate({...agreed, role: 'prefer_not'}, 'about')[0].path, 'role');
  assert.equal(model.validate({...agreed, residence_area: 'prefer'}, 'about')[0].path, 'residence_area');
});

test('dependants use an optional yes/no question and two totals without age groups', () => {
  const question = about.questions.find(question => question.id === 'has_dependants');
  assert.equal(question.label, 'Do you have any dependants?');
  assert.deepEqual(question.options.map(option => option.id), ['yes', 'no']);
  assert.equal(question.help, 'Include children or adults who rely on you for care or financial support.');
  const counts = about.questions.find(question => question.id === 'dependants_count');
  assert.equal(counts.show_when, 'has_dependants == yes');
  assert.deepEqual(counts.fields.map(field => field.path), ['dependants.total', 'dependants.living_with']);
  assert.ok(counts.fields.every(field => !field.required && field.min === 0 && field.max === Number.MAX_SAFE_INTEGER));
  assert.equal(counts.rows, undefined);
  for (const dependants of [{}, {total: 0}, {living_with: 5}, {total: 3, living_with: ''}, {total: 0, living_with: 0}, {total: Number.MAX_SAFE_INTEGER, living_with: Number.MAX_SAFE_INTEGER}]) {
    assert.deepEqual(model.validate({...agreed, has_dependants: 'yes', dependants}, 'about'), []);
  }
  for (const has_dependants of [undefined, '', 'no']) {
    const state = {...agreed, has_dependants, dependants: {total: 2, living_with: 1}, nt_duration: {years: 4}, responses: {missing_help: 'Keep this answer'}};
    const next = model.reconcile(state);
    assert.equal(next.dependants, undefined);
    assert.deepEqual(next.nt_duration, state.nt_duration);
    assert.deepEqual(next.responses, state.responses);
    assert.deepEqual(state.dependants, {total: 2, living_with: 1});
  }
});

test('NT duration is unconditional with optional whole years 0–99 and months 0–11', () => {
  const duration = about.questions.find(question => question.id === 'nt_duration');
  assert.equal(duration.label, 'How long have you lived in the NT?');
  assert.equal(duration.show_when, undefined);
  assert.deepEqual(duration.fields.map(field => [field.path, field.min, field.max]), [['nt_duration.years', 0, 99], ['nt_duration.months', 0, 11]]);
  for (const retired of ['time_local', 'time_past', 'past_residence', 'dependants']) {
    assert.equal(about.questions.some(question => question.id === retired), false);
  }
  for (const residence_area of [undefined, 'darwin', 'palmerston', 'litchfield', 'greater_darwin_other', 'outside']) {
    for (const nt_duration of [{}, {years: 0, months: 0}, {years: 99, months: 11}, {years: 2}, {months: 3}, {years: '', months: null}]) {
      assert.deepEqual(model.validate({...agreed, residence_area, nt_duration}, 'about'), []);
    }
  }
  for (const [field, values] of [['years', [-1, 100, 0.5, NaN, Infinity, '2']], ['months', [-1, 12, 0.5, NaN, Infinity, '3']]]) {
    for (const value of values) {
      assert.equal(model.validate({...agreed, nt_duration: {[field]: value}}, 'about')[0].path, `nt_duration.${field}`);
    }
  }
});

test('changing residence clears a generic other locality but retains duration and all narratives', () => {
  const previous = {...agreed, residence_area: 'darwin', suburb: 'other', suburb_other: 'Old locality', nt_duration: {years: 3, months: 6}, responses: {difficulties: 'Keep my experience'}};
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

test('current connection and consent cannot be bypassed at completion', () => {
  assert.ok(model.validate({}, 'experience').some(error => error.path === 'consent'));
  assert.ok(model.validate({...agreed, current_connection: 'no'}, 'experience').some(error => error.path === 'current_connection'));
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
