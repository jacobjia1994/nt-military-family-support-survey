import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {createAdultSurveyModel, characterCount, PAGE_ORDER} from '../adult-survey/model.mjs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const spec = JSON.parse(read('adult-survey/survey-spec.json'));
const model = createAdultSurveyModel(spec);
const experience = spec.pages.find(page => page.id === 'experience');
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
  assert.ok(experience.questions.every(question => question.type === 'text' && !question.required && question.max_length === 100000 && /identify/.test(question.privacy_hint)));
  assert.equal(experience.questions[6].label, 'Is there anything else you want to add?');
});

test('every narrative accepts 100000 English characters and rejects 100001 without changing text', () => {
  for (const question of experience.questions) {
    const value = 'a'.repeat(100000);
    const state = {...agreed, responses: {[question.id]: value}};
    assert.deepEqual(model.validate(state, 'experience'), []);
    state.responses[question.id] += 'b';
    const before = structuredClone(state);
    const errors = model.validate(state, 'experience');
    assert.equal(errors.length, 1);
    assert.equal(errors[0].path, `responses.${question.id}`);
    assert.deepEqual(state, before);
  }
  const all = {...agreed, responses: Object.fromEntries(experience.questions.map(question => [question.id, 'z'.repeat(100000)]))};
  assert.deepEqual(model.validate(all, 'experience'), []);
});

test('narratives keep raw text and use the same count as native textarea maxlength', () => {
  const state = {...agreed, responses: {help_sources: '<script>alert(1)</script> Military friend, not a coded answer.'}};
  const before = structuredClone(state);
  assert.deepEqual(model.validate(state, 'experience'), []);
  assert.deepEqual(state, before);
  assert.equal(characterCount('a\r\nb\rc'), 5);
  assert.equal(characterCount('😀'), 2);
  assert.equal(model.validate({...agreed, responses: {help_needed: ['not text']}}, 'experience')[0].path, 'responses.help_needed');
});

test('background changes clear only dependent background fields, preserving narratives', () => {
  const state = {...agreed, residence_area: 'outside', suburb: 'other', suburb_other: 'Old locality', time_local: 'over3', past_residence: 'no', time_past: 'over3', has_dependants: 'no', dependants: {counts: {under_2: {total: 1}}}, responses: {difficulties: 'Keep this experience'}};
  const next = model.reconcile(state);
  for (const key of ['suburb', 'suburb_other', 'time_local', 'time_past', 'dependants']) assert.equal(next[key], undefined, key);
  assert.deepEqual(next.responses, state.responses);
  assert.equal(state.suburb_other, 'Old locality');
  assert.deepEqual(model.visibleLocationFields(next), ['residence_area', 'past_residence']);
});

test('a locality from a previous area cannot silently remain selected', () => {
  const locality = spec.geography.localities.find(item => item.region === 'darwin');
  const state = {...agreed, residence_area: 'palmerston', suburb: locality.id};
  assert.equal(model.validate(state, 'about')[0].path, 'suburb');
  assert.equal(model.reconcile(state).suburb, undefined);
});

test('invalid dependant counts, partial numbers and contradictory totals cannot advance', () => {
  for (const value of [-1, 0.5, NaN, Infinity]) {
    const state = {...agreed, has_dependants: 'yes', dependants: {counts: {under_2: {total: value}}}};
    assert.equal(model.validate(state, 'about')[0].path, 'dependants.counts.under_2.total');
  }
  const state = {...agreed, has_dependants: 'yes', dependants: {counts: {under_2: {total: 1, living_with: 2}}}};
  assert.equal(model.validate(state, 'experience')[0].path, 'dependants.counts.under_2.living_with');
  state.dependants.counts.under_2.living_with = 1;
  assert.deepEqual(model.validate(state, 'about'), []);
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
  assert.match(app, /maxlength="\$\{maxLength\}"/);
});
