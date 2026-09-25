import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import * as model from '../contact-model.mjs';

const valid = (overrides = {}) => ({
  ...model.emptyRequest(), requester: 'self', age_band: 'adult', preferred_name: 'Alex',
  phone: '+61 412 345 678', contact_method: 'sms', consent: true, ...overrides,
});
const uiSource = readFileSync(new URL('../contact.js', import.meta.url), 'utf8');
const pageSource = readFileSync(new URL('../contact.html', import.meta.url), 'utf8');

// The actual renderer runs with a small DOM adapter. Browser QA separately checks
// native focus, layout and radio behaviour; this adapter tests data and rendering.
function createUI() {
  const elements = new Map(), windowListeners = new Map();
  const element = selector => {
    if (!elements.has(selector)) elements.set(selector, {
      hidden: false, disabled: false, checked: false, innerHTML: '',
      listeners: new Map(), attributes: {},
      querySelector: element, focus() {},
      addEventListener(type, listener) { this.listeners.set(type, listener); },
      setAttribute(key, value) { this.attributes[key] = value; },
      replaceChildren() { this.innerHTML = ''; },
    });
    return elements.get(selector);
  };
  const forbidden = () => { throw new Error('Contact details must stay in memory'); };
  const main = element('#main');
  const context = vm.createContext({
    ...model, esc: model.escapeHTML, URL,
    document: { querySelector: element },
    window: { scrollTo() {}, addEventListener: (type, listener) => windowListeners.set(type, listener) },
    fetch: forbidden, XMLHttpRequest: forbidden, WebSocket: forbidden,
    localStorage: new Proxy({}, { get: forbidden }),
    sessionStorage: new Proxy({}, { get: forbidden }),
    indexedDB: new Proxy({}, { get: forbidden }),
    navigator: { sendBeacon: forbidden },
  });
  vm.runInContext(`${uiSource.replace(/^import .*?;\s*/s, '')}\n
    globalThis.contactTest = {
      setRequest(value) { request = value; },
      getRequest() { return request; },
      renderForm, renderReview, renderFinish, resourceHTML,
    };`, context, { filename: 'contact.js' });
  return { api: context.contactTest, main, element, windowListeners };
}

test('a self request needs only route, age band, name, phone, contact choice and explicit consent', () => {
  assert.deepEqual(model.requestErrors(valid()), {});
  assert.deepEqual(model.requestErrors(valid({ contact_notes: '', topic: '' })), {});
  for (const [key, value] of Object.entries({
    requester: '', age_band: '', preferred_name: '  ', phone: '', contact_method: '', consent: false,
  })) {
    assert.ok(Object.hasOwn(model.requestErrors(valid({ [key]: value })), key), key);
    assert.throws(() => model.reviewRequest(valid({ [key]: value })));
  }
  for (const consent of [undefined, 'true', 1, null]) {
    assert.ok(model.requestErrors(valid({ consent })).consent);
  }
});

test('contact method and voicemail start unselected; unknown contact methods fail', () => {
  assert.equal(model.emptyRequest().contact_method, '');
  assert.equal(model.emptyRequest().voicemail, false);
  for (const method of ['', 'email', 'either', 'toString', '__proto__']) {
    assert.ok(model.requestErrors(valid({ contact_method: method })).contact_method);
  }
  for (const method of ['call', 'sms']) {
    assert.deepEqual(model.requestErrors(valid({ contact_method: method })), {});
  }
});

test('phone input accepts international punctuation but rejects letters and unreasonable lengths', () => {
  for (const phone of ['0412 345 678', '+61 (0) 412-345-678', '(08) 8269 9333', '+44 20 7946 0123', '1234567', '+123456789012345']) {
    assert.equal(model.phoneIsValid(phone), true, phone);
  }
  for (const phone of ['', '   ', '123456', '1234567890123456', '+61 4XX XXX XXX', '04hello1234', '0412345678 ext 5', '++61 412 345 678', '<script>1234567</script>']) {
    assert.equal(model.phoneIsValid(phone), false, phone);
    assert.ok(model.requestErrors(valid({ phone })).phone);
  }
});

test('review data is an explicit minimum-field whitelist, separate from survey and identity extras', () => {
  const result = model.reviewRequest(valid({
    preferred_name: '  Alex  ', phone: '  +61 412 345 678  ', topic: '  Housing  ',
    email: 'do-not-retain@example.invalid', date_of_birth: '1990-01-01',
    address: 'Do not retain', survey_id: 'survey-secret', response_id: 'answer-secret',
    survey_answers: { housing: 'none' }, rank: 'Do not retain',
  }));
  assert.deepEqual(Object.keys(result).sort(), [
    'requester', 'age_band', 'preferred_name', 'phone', 'contact_method', 'voicemail',
    'contact_notes', 'topic', 'consent', 'notice_version',
  ].sort());
  assert.equal(result.preferred_name, 'Alex');
  assert.equal(result.phone, '+61 412 345 678');
  assert.equal(result.topic, 'Housing');
  assert.equal(result.notice_version, model.CONTACT_NOTICE_VERSION);
  for (const marker of ['do-not-retain', 'survey-secret', 'answer-secret', '1990-01-01']) {
    assert.equal(JSON.stringify(result).includes(marker), false);
  }
});

test('voicemail requires a call preference and a separate true permission', () => {
  for (const [contact_method, voicemail, expected] of [
    ['call', true, true], ['call', false, false], ['call', 'true', false],
    ['sms', true, false], ['sms', false, false],
  ]) {
    assert.equal(model.reviewRequest(valid({ contact_method, voicemail })).voicemail, expected);
  }
});

test('changing phone or contact method clears voicemail without erasing the rest of the request', () => {
  const previous = valid({ contact_method: 'call', voicemail: true, topic: 'Childcare' });
  for (const [key, value] of [['phone', '0400 111 222'], ['contact_method', 'sms']]) {
    const changed = model.changeRequest(previous, key, value);
    assert.equal(changed.voicemail, false);
    assert.equal(changed.topic, 'Childcare');
    assert.equal(changed.preferred_name, previous.preferred_name);
    assert.equal(previous.voicemail, true, 'Previous state must not be mutated');
  }
  assert.equal(model.changeRequest(previous, 'phone', previous.phone).voicemail, true);
  assert.equal(model.changeRequest(previous, 'contact_notes', 'After 3 pm NT time').voicemail, true);
});

test('all age groups have a valid self route, with guardian routes for both minor bands', () => {
  for (const age_band of ['adult', 'youth', 'child']) {
    const data = valid({ age_band });
    assert.deepEqual(model.requestErrors(data), {});
    assert.equal(model.contactRoute(data), `self_${age_band}`);
  }
  for (const age_band of ['youth', 'child']) {
    const data = valid({ requester: 'guardian', age_band, guardian_authority: true });
    assert.deepEqual(model.requestErrors(data), {});
    assert.equal(model.contactRoute(data), `guardian_${age_band}`);
  }
  for (const data of [valid({ requester: 'guardian', age_band: 'adult', guardian_authority: true }), valid({ requester: 'other' }), valid({ age_band: '15_plus' })]) {
    assert.equal(model.contactRoute(data), '');
    assert.throws(() => model.reviewRequest(data));
  }
});

test('changing role or age clears personal details, consent and voicemail permission', () => {
  const previous = valid({ topic: 'Private topic', contact_notes: 'Private instructions', voicemail: true });
  const child = model.changeRequest(previous, 'age_band', 'child');
  assert.deepEqual(child, { ...model.emptyRequest(), requester: 'self', age_band: 'child' });
  const guardian = model.changeRequest(previous, 'requester', 'guardian');
  assert.deepEqual(guardian, { ...model.emptyRequest(), requester: 'guardian' });
  assert.equal(previous.topic, 'Private topic');
  assert.equal(model.changeRequest(previous, 'age_band', 'adult').topic, 'Private topic');
});

test('under-15 self requests collect contact instructions without a topic or sensitive-information agreement', () => {
  const data = valid({ age_band: 'child', topic: 'Do not retain this sensitive topic', guardian_authority: true });
  const details = model.reviewRequest(data);
  assert.equal(Object.hasOwn(details, 'topic'), false);
  assert.equal(Object.hasOwn(details, 'guardian_authority'), false);
  assert.equal(model.needsTopic(data), false);
  assert.equal(model.consentText(data), model.CONTACT_CHILD_CONSENT);
  assert.doesNotMatch(model.consentText(data), /sensitive/i);
  const ui = createUI();
  ui.api.setRequest(data);
  ui.api.renderForm();
  assert.doesNotMatch(ui.main.innerHTML, /name="topic"/);
  assert.match(ui.main.innerHTML, /discuss permission before arranging a conversation/);
  assert.equal(ui.element('[type="submit"]').disabled, false);
  ui.api.renderReview();
  assert.doesNotMatch(ui.main.innerHTML, /Do not retain|What you would like to talk about/);
});

test('guardian requests need explicit authority and identify the adult contact without child identity fields', () => {
  for (const guardian_authority of [false, 'true', 1, undefined]) {
    assert.ok(model.requestErrors(valid({ requester: 'guardian', age_band: 'child', guardian_authority })).guardian_authority);
  }
  const data = valid({ requester: 'guardian', age_band: 'child', guardian_authority: true, child_name: 'Never retain', child_dob: '2018-01-01' });
  const details = model.reviewRequest(data);
  assert.equal(details.guardian_authority, true);
  assert.equal(Object.hasOwn(details, 'child_name'), false);
  assert.equal(Object.hasOwn(details, 'child_dob'), false);
  const ui = createUI();
  ui.api.setRequest(data);
  ui.api.renderForm();
  assert.match(ui.main.innerHTML, /Please give your own contact details/);
  assert.match(ui.main.innerHTML, /name="guardian_authority"/);
  assert.doesNotMatch(ui.main.innerHTML, /name="(?:child_name|child_dob)"/);
  ui.api.renderReview();
  assert.match(ui.main.innerHTML, /Parent or guardian’s phone number/);
});

test('overlong personal free text is rejected before review', () => {
  for (const key of ['preferred_name', 'contact_notes', 'topic']) {
    const maximum = model.CONTACT_LIMITS[key];
    assert.equal(model.requestErrors(valid({ [key]: 'a'.repeat(maximum) }))[key], undefined);
    assert.ok(model.requestErrors(valid({ [key]: 'a'.repeat(maximum + 1) }))[key]);
    assert.throws(() => model.reviewRequest(valid({ [key]: 'a'.repeat(maximum + 1) })));
  }
});

test('participant-entered values are escaped in the actual form and review renderer', () => {
  const ui = createUI();
  const malicious = '<img src=x onerror="alert(1)"> & \'quoted\'';
  ui.api.setRequest(valid({ preferred_name: malicious, topic: malicious, contact_notes: malicious }));
  for (const render of [ui.api.renderForm, ui.api.renderReview]) {
    render();
    assert.ok(ui.main.innerHTML.includes(model.escapeHTML(malicious)));
    assert.equal(ui.main.innerHTML.includes(malicious), false);
    assert.equal(ui.main.innerHTML.includes('<img src=x'), false);
  }
});

test('blank optional fields remain valid and do not imply invented discussion topics', () => {
  const ui = createUI();
  ui.api.setRequest(valid());
  ui.api.renderReview();
  assert.equal(ui.api.getRequest().topic, '');
  assert.equal(ui.api.getRequest().contact_notes, '');
  assert.equal((ui.main.innerHTML.match(/<dd>Not provided<\/dd>/g) || []).length, 2);
});

test('actual form gates review and clears voicemail when the displayed contact method changes', () => {
  const ui = createUI();
  assert.equal(ui.element('[type="submit"]').disabled, true);
  ui.api.setRequest(valid({ contact_method: 'call', voicemail: true }));
  ui.api.renderForm();
  assert.equal(ui.element('[type="submit"]').disabled, false);
  const form = ui.element('#contact-form');
  form.listeners.get('change')({ target: { name: 'contact_method', type: 'radio', value: 'sms' } });
  assert.equal(ui.element('#voicemail-wrap').hidden, true);
  assert.equal(ui.element('[name="voicemail"]').checked, false);
  assert.equal(ui.api.getRequest().voicemail, false);
  form.listeners.get('change')({ target: { name: 'consent', type: 'checkbox', checked: false } });
  assert.equal(ui.element('[type="submit"]').disabled, true);
});

test('review and finish make no network or storage calls; clear removes the in-memory request', () => {
  const ui = createUI();
  ui.api.setRequest(valid({ topic: 'A private topic' }));
  ui.api.renderForm();
  let prevented = false;
  ui.element('#contact-form').listeners.get('submit')({ preventDefault() { prevented = true; } });
  assert.equal(prevented, true, 'Native form submission must be prevented');
  ui.element('#finish-contact').onclick();
  ui.element('#review-details').onclick();
  ui.api.renderFinish();
  ui.element('#finish-clear').onclick();
  assert.deepEqual(JSON.parse(JSON.stringify(ui.api.getRequest())), model.emptyRequest());
  assert.equal(ui.main.innerHTML.includes('A private topic'), false);
});

test('leaving the page clears both state and rendered data, including back-forward-cache restoration', () => {
  const ui = createUI();
  ui.api.setRequest(valid({ topic: 'A private topic' }));
  ui.api.renderReview();
  ui.windowListeners.get('pagehide')();
  assert.deepEqual(JSON.parse(JSON.stringify(ui.api.getRequest())), model.emptyRequest());
  assert.equal(ui.main.innerHTML, '');
  ui.windowListeners.get('pageshow')({ persisted: true });
  assert.equal(ui.main.innerHTML.includes('A private topic'), false);
  assert.equal(ui.element('[type="submit"]').disabled, true);
});

test('the review build prohibits transmission and does not connect to shared survey state or browser persistence', () => {
  const policy = pageSource.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)?.[1];
  assert.ok(policy);
  assert.match(policy, /(?:^|;)\s*connect-src 'none'(?:;|$)/);
  assert.match(policy, /(?:^|;)\s*form-action 'none'(?:;|$)/);
  assert.doesNotMatch(uiSource, /\b(?:fetch|XMLHttpRequest|WebSocket|sendBeacon|localStorage|sessionStorage|indexedDB)\s*(?:\(|\.|\[)/);
  assert.doesNotMatch(uiSource, /\b(?:URLSearchParams|location\.search|document\.cookie|survey_answers|response_id)\b/);
  assert.doesNotMatch(pageSource, /<script\b[^>]*src="https?:/);
});


test('the public resource uses the same safe HTTPS destination without any contact details', () => {
  for (const url of ['', 'http://example.org/file', 'javascript:alert(1)', 'data:text/plain,private', 'https://user:password@example.org/file']) {
    assert.equal(model.contactResource({ url }).url, '');
  }
  const publicUrl = 'https://example.org/defence-resource.pdf';
  assert.equal(model.contactResource({ url: publicUrl }).url, publicUrl);
  const ui = createUI();
  ui.api.setRequest(valid({ preferred_name: 'NeverInLink', phone: '0412345678', topic: 'PrivateHousing' }));
  const html = ui.api.resourceHTML({ title: '<resource>', url: publicUrl });
  assert.match(html, /href="https:\/\/example.org\/defence-resource.pdf"/);
  assert.match(html, /target="_blank"/);
  assert.match(html, /rel="noopener noreferrer"/);
  assert.match(html, /referrerpolicy="no-referrer"/);
  assert.match(html, /&lt;resource&gt;/);
  assert.doesNotMatch(html, /NeverInLink|0412345678|PrivateHousing/);
});

test('resource access is visible before contact entry and on finish, and empty config stays inactive', () => {
  const ui = createUI();
  for (const render of [ui.api.renderForm, ui.api.renderFinish]) {
    render();
    assert.match(ui.main.innerHTML, /A free resource for Defence families/);
    assert.match(ui.main.innerHTML, /disabled>Get your free resource/);
    assert.match(ui.main.innerHTML, /Available soon/);
  }
  assert.match(pageSource, /src="thank-you-resource.js/);
  assert.doesNotMatch(ui.main.innerHTML, /request (?:has been |was )?(?:received|sent|submitted)/i);
});
