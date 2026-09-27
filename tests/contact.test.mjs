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

test('mobile input accepts Australian and overseas formats but rejects local landlines and incomplete numbers', () => {
  for (const phone of ['0412 345 678', '+61 412345678', '+61 (0) 412-345-678', '+44 7700 900123', '+123456789012345']) {
    assert.equal(model.phoneIsValid(phone), true, phone);
  }
  for (const phone of ['', '   ', '(08) 8269 9333', '+61 8 8269 9333', '1234567', '123456', '1234567890123456', '+61 4XX XXX XXX', '04hello1234', '0412345678 ext 5', '++61 412 345 678', '<script>1234567</script>', '+01234567890', '+614123456789', '+6141234567', 412345678, null, {}, []]) {
    assert.equal(model.phoneIsValid(phone), false, phone);
    assert.ok(model.requestErrors(valid({ phone })).phone);
  }
});

test('email is optional but a supplied email is validated, and email-first never replaces the required mobile', () => {
  for (const email of ['', '   ', 'alex@example.org', 'alex.family+project@example.org.au', ' first.last@service.example ']) {
    assert.deepEqual(model.requestErrors(valid({ email })), {}, email);
  }
  for (const email of ['alex', 'alex@example', 'alex@@example.org', 'alex@-example.org', 'alex@example..org', 'alex name@example.org', '<alex@example.org>', 'alex..family@example.org', 'a'.repeat(65)+'@example.org', 7, {}, ['alex@example.org']]) {
    assert.equal(model.emailIsValid(email), false, String(email));
    assert.ok(model.requestErrors(valid({ email })).email);
    assert.throws(() => model.reviewRequest(valid({ email })));
  }
  assert.deepEqual(model.requestErrors(valid({ email: 'alex@example.org', contact_method: 'email' })), {});
  for (const email of ['', undefined, 'bad-email']) {
    assert.ok(model.requestErrors(valid({ email, contact_method: 'email' })).contact_method);
  }
  assert.ok(model.requestErrors(valid({ phone: '', email: 'alex@example.org', contact_method: 'email' })).phone);
  assert.equal(model.reviewRequest(valid({ email: ' alex@example.org ' })).email, 'alex@example.org');
});

test('review data is an explicit minimum-field whitelist, separate from survey and identity extras', () => {
  const result = model.reviewRequest(valid({
    preferred_name: '  Alex  ', phone: '  +61 412 345 678  ', topic: '  Housing  ', suggested_time:'  Tuesday afternoon  ',
    email: 'alex@example.org', date_of_birth: '1990-01-01',
    address: 'Do not retain', survey_id: 'survey-secret', response_id: 'answer-secret',
    survey_answers: { housing: 'none' }, rank: 'Do not retain',
  }));
  assert.deepEqual(Object.keys(result).sort(), [
    'requester', 'age_band', 'preferred_name', 'phone', 'email', 'contact_method', 'voicemail',
    'contact_notes', 'topic', 'interview_mode', 'suggested_time', 'consent', 'notice_version',
  ].sort());
  assert.equal(result.preferred_name, 'Alex');
  assert.equal(result.phone, '+61 412 345 678');
  assert.equal(result.topic, 'Housing');
  assert.equal(result.suggested_time, 'Tuesday afternoon');
  assert.equal(result.email, 'alex@example.org');
  assert.equal(result.notice_version, model.CONTACT_NOTICE_VERSION);
  for (const marker of ['do-not-retain', 'survey-secret', 'answer-secret', '1990-01-01']) {
    assert.equal(JSON.stringify(result).includes(marker), false);
  }
});

test('voicemail requires a call preference and a separate true permission', () => {
  for (const [contact_method, voicemail, expected] of [
    ['call', true, true], ['call', false, false], ['call', 'true', false],
    ['sms', true, false], ['sms', false, false],
    ['email', true, false],
  ]) {
    assert.equal(model.reviewRequest(valid({ email: 'alex@example.org', contact_method, voicemail })).voicemail, expected);
  }
});

test('changing phone or contact method clears voicemail without erasing the rest of the request', () => {
  const previous = valid({ contact_method: 'call', voicemail: true, topic: 'Childcare' });
  for (const [key, value] of [['phone', '0400 111 222'], ['contact_method', 'sms']]) {
    const changed = model.changeRequest(previous, key, value);
    assert.equal(changed.voicemail, false);
    assert.equal(changed.topic, 'Childcare');
    assert.equal(changed.preferred_name, previous.preferred_name);
    assert.equal(changed.consent, false);
    assert.equal(previous.voicemail, true, 'Previous state must not be mutated');
  }
  assert.equal(model.changeRequest(previous, 'phone', previous.phone).voicemail, true);
  assert.equal(model.changeRequest(previous, 'contact_notes', 'After 3 pm NT time').voicemail, true);
});

test('changing an email address withdraws email-first permission and never substitutes a call or text', () => {
  const previous=valid({ email:'alex@example.org', contact_method:'email' });
  for (const email of ['', 'different@example.org', 'invalid']) {
    const changed=model.changeRequest(previous,'email',email);
    assert.equal(changed.contact_method,'');
    assert.equal(changed.consent,false);
    assert.equal(changed.phone,previous.phone);
    assert.ok(model.requestErrors(changed).contact_method);
  }
  assert.equal(model.changeRequest(previous,'email',previous.email).contact_method,'email');
  assert.equal(model.changeRequest(previous,'email',previous.email).consent,true);
  const phoneFirst=model.changeRequest(valid({ email:'alex@example.org' }),'email','new@example.org');
  assert.equal(phoneFirst.contact_method,'sms');
  assert.equal(phoneFirst.consent,false);
  assert.equal(model.changeRequest(previous,'preferred_name','New name').consent,false);
});

test('age routing uses only under 18 and adult, with one minor guardian route', () => {
  assert.deepEqual(model.CONTACT_AGES,{adult:'18 or older',minor:'Under 18'});
  for (const age_band of ['minor','adult']) {
    const data = valid({ age_band });
    assert.deepEqual(model.requestErrors(data), {});
    assert.equal(model.contactRoute(data), `self_${age_band}`);
  }
  const guardian=valid({requester:'guardian',age_band:'minor',guardian_authority:true});
  assert.deepEqual(model.requestErrors(guardian),{});
  assert.equal(model.contactRoute(guardian),'guardian_minor');
  for (const data of [valid({ requester: 'guardian', age_band: 'adult', guardian_authority: true }), valid({ requester: 'guardian', age_band:'', guardian_authority:true }),valid({ requester: 'other' }), ...['15_plus','youth','child'].map(age_band=>valid({age_band}))]) {
    assert.equal(model.contactRoute(data), '');
    assert.throws(() => model.reviewRequest(data));
  }
});

test('changing role or age clears personal details and permission, and guardian choice sets minor age', () => {
  const previous = valid({ topic: 'Private topic', suggested_time:'Tuesday', contact_notes: 'Private instructions', voicemail: true, email:'alex@example.org', interview_mode:'phone' });
  const minor = model.changeRequest(previous, 'age_band', 'minor');
  assert.deepEqual(minor, { ...model.emptyRequest(), requester: 'self', age_band: 'minor' });
  const guardian = model.changeRequest(previous, 'requester', 'guardian');
  assert.deepEqual(guardian, { ...model.emptyRequest(), requester: 'guardian',age_band:'minor' });
  assert.equal(model.contactRoute(guardian),'guardian_minor');
  assert.deepEqual(model.changeRequest(guardian,'requester','self'),{...model.emptyRequest(),requester:'self'});
  assert.equal(previous.topic, 'Private topic');
  assert.equal(model.changeRequest(previous, 'age_band', 'adult').topic, 'Private topic');
});

test('only self and guardian routes remain, and superseded classification fields cannot be retained', () => {
  assert.deepEqual(Object.keys(model.CONTACT_REQUESTERS),['self','guardian']);
  assert.equal(model.contactRoute(valid({requester:'professional'})),'');
  assert.ok(model.requestErrors(valid({requester:'professional'})).requester);
  assert.throws(()=>model.reviewRequest(valid({requester:'professional'})));
  const data=valid({organisation_role:'Private employer',availability:'Tuesday mornings',participation_notes:'Private arrangement',connection:'family'});
  assert.deepEqual(model.requestErrors(data),{});
  const details=model.reviewRequest(data);
  for(const key of ['organisation_role','availability','participation_notes','connection']){
    assert.equal(Object.hasOwn(details,key),false,key);
    assert.equal(Object.hasOwn(model.emptyRequest(),key),false,key);
    assert.equal(Object.hasOwn(model.changeRequest(valid(),key,'Do not retain'),key),false,key);
  }
});

test('conversation preferences are optional and allow only the supported choices', () => {
  for(const interview_mode of ['',...Object.keys(model.CONTACT_INTERVIEW_MODES)])assert.deepEqual(model.requestErrors(valid({interview_mode})),{});
  for(const interview_mode of ['group','toString',true,{}])assert.ok(model.requestErrors(valid({interview_mode})).interview_mode);
  assert.equal(model.needsArrangements({}),false);
  assert.equal(model.needsArrangements(valid({age_band:'minor'})),true);
});

test('unexpected input types cannot bypass required fields or crash validation', () => {
  for(const data of [undefined,null,false,7,'text',[]]){
    assert.doesNotThrow(()=>model.requestErrors(data));
    assert.equal(model.contactRoute(data),'');
    assert.throws(()=>model.reviewRequest(data),/incomplete/);
  }
  for(const key of ['preferred_name','phone','email','contact_notes','topic','suggested_time']){
    assert.ok(model.requestErrors(valid({[key]:{toString:()=> '0412345678'}}))[key],key);
  }
  assert.equal(model.changeRequest(valid(),'consent','true').consent,false);
  assert.equal(model.changeRequest(valid(),'phone',412345678).phone,'');
  assert.deepEqual(model.changeRequest(valid(),'survey_answers','private'),valid());
});

test('minor self requests may provide a topic and time while agreeing only to contact and arrangements', () => {
  const data = valid({ age_band: 'minor', topic: 'School transitions', suggested_time:'Friday after school',guardian_authority: true, email:'young@example.org', interview_mode:'phone', availability:'a'.repeat(1000), participation_notes:{sensitive:'value'}, connection:'family', organisation_role:'Do not retain' });
  const details = model.reviewRequest(data);
  assert.equal(details.topic,'School transitions');
  assert.equal(details.suggested_time,'Friday after school');
  assert.equal(details.interview_mode,'phone');
  assert.equal(Object.hasOwn(details, 'guardian_authority'), false);
  for(const key of ['availability','participation_notes','connection','organisation_role'])assert.equal(Object.hasOwn(details,key),false,key);
  assert.equal(details.email,'young@example.org');
  assert.equal(model.needsTopic(data), true);
  assert.equal(model.consentText(data), model.CONTACT_MINOR_CONSENT);
  assert.doesNotMatch(model.consentText(data), /sensitive/i);
  assert.match(model.consentText(data),/decide about taking part later/);
});

test('guardian requests need explicit authority and identify the adult contact without child identity fields', () => {
  for (const guardian_authority of [false, 'true', 1, undefined]) {
    assert.ok(model.requestErrors(valid({ requester: 'guardian', age_band: 'minor', guardian_authority })).guardian_authority);
  }
  const data = valid({ requester: 'guardian', age_band: 'minor', guardian_authority: true, child_name: 'Never retain', child_dob: '2018-01-01' });
  const details = model.reviewRequest(data);
  assert.equal(details.guardian_authority, true);
  assert.equal(Object.hasOwn(details, 'child_name'), false);
  assert.equal(Object.hasOwn(details, 'child_dob'), false);
  const ui = createUI();
  ui.api.setRequest(data);
  ui.api.renderForm();
  assert.match(ui.main.innerHTML, /give your own contact details/i);
  assert.match(ui.main.innerHTML, /name="guardian_authority"/);
  assert.doesNotMatch(ui.main.innerHTML, /name="(?:child_name|child_dob|age_band)"/);
  ui.api.renderReview();
  assert.match(ui.main.innerHTML, /Parent or guardian’s mobile number/);
});

test('overlong personal free text is rejected before review', () => {
  for (const key of ['preferred_name', 'contact_notes', 'topic','suggested_time']) {
    const maximum = model.CONTACT_LIMITS[key];
    assert.equal(model.requestErrors(valid({ [key]: 'a'.repeat(maximum) }))[key], undefined);
    assert.ok(model.requestErrors(valid({ [key]: 'a'.repeat(maximum + 1) }))[key]);
    assert.throws(() => model.reviewRequest(valid({ [key]: 'a'.repeat(maximum + 1) })));
  }
});

test('participant-entered values are escaped in the form and review renderers', () => {
  const ui = createUI();
  const malicious = '<img src=x onerror="alert(1)"> & \'quoted\'';
  ui.api.setRequest(valid({ preferred_name: malicious, topic: malicious, suggested_time:malicious,contact_notes: malicious }));
  for (const render of [ui.api.renderForm, ui.api.renderReview]) {
    render();
    assert.ok(ui.main.innerHTML.includes(model.escapeHTML(malicious)));
    assert.equal(ui.main.innerHTML.includes(malicious), false);
    assert.equal(ui.main.innerHTML.includes('<img src=x'), false);
  }
});

test('blank optional fields remain valid and do not imply invented discussion topics or arrangements', () => {
  const ui = createUI();
  ui.api.setRequest(valid());
  ui.api.renderReview();
  assert.equal(ui.api.getRequest().topic, '');
  assert.equal(ui.api.getRequest().suggested_time, '');
  assert.equal(ui.api.getRequest().contact_notes, '');
  assert.doesNotMatch(ui.main.innerHTML,/<dt>(?:Discussion topic|Suggested interview date and time|Interview format|Contact or access needs|Email address)<\/dt>/);
  assert.doesNotMatch(ui.main.innerHTML,/Not provided|Discuss when arranging/);
});

test('the form clears voicemail on method changes and requires fresh consent before review', () => {
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
  assert.equal(ui.api.getRequest().consent, false);
  assert.equal(ui.element('[name="consent"]').checked,false);
  assert.equal(ui.element('[type="submit"]').disabled, true);
  form.listeners.get('submit')({preventDefault(){}});
  assert.match(ui.main.innerHTML,/id="contact-form"/);
  form.listeners.get('change')({ target: { name:'consent', type:'checkbox', checked:true } });
  assert.equal(ui.element('[type="submit"]').disabled,false);
  form.listeners.get('submit')({preventDefault(){}});
  assert.match(ui.main.innerHTML,/Check your details/);
});

test('email stays optional while mobile stays required, even when the contact choice is email',()=>{
  const ui=createUI();
  ui.api.setRequest(valid());
  ui.api.renderForm();
  assert.match(ui.main.innerHTML,/<input[^>]*name="phone"[^>]* required>/);
  assert.doesNotMatch(ui.main.innerHTML,/<input[^>]*name="email"[^>]* required>/);
  assert.equal(ui.element('[type="submit"]').disabled,false,'An optional empty email does not block review');
  assert.equal(ui.element('[name="contact_method"][value="email"]').disabled,true);
  const form=ui.element('#contact-form');
  form.listeners.get('input')({target:{name:'email',type:'email',value:'alex@example.org'}});
  assert.equal(ui.element('[name="contact_method"][value="email"]').disabled,false);
  form.listeners.get('change')({target:{name:'contact_method',type:'radio',value:'email'}});
  assert.equal(ui.api.getRequest().contact_method,'email');
  form.listeners.get('input')({target:{name:'phone',type:'tel',value:''}});
  assert.equal(ui.element('[type="submit"]').disabled,true);
  form.listeners.get('input')({target:{name:'phone',type:'tel',value:'0412345678'}});
  form.listeners.get('change')({target:{name:'consent',type:'checkbox',checked:true}});
  assert.equal(ui.element('[type="submit"]').disabled,false);
  form.listeners.get('input')({target:{name:'email',type:'email',value:''}});
  assert.equal(ui.api.getRequest().contact_method,'');
  assert.equal(ui.element('[name="contact_method"][value="email"]').checked,false);
  assert.equal(ui.element('[type="submit"]').disabled,true,'No automatic fallback to phone contact');
});

test('all self participants use one route without professional or family classification questions',()=>{
  const ui=createUI();
  ui.api.setRequest(valid());
  ui.api.renderForm();
  assert.match(ui.main.innerHTML,/name="requester" value="self"/);
  assert.match(ui.main.innerHTML,/name="requester" value="guardian"/);
  assert.doesNotMatch(ui.main.innerHTML,/name="requester" value="professional"/);
  assert.doesNotMatch(ui.main.innerHTML,/name="(?:connection|organisation_role|availability|participation_notes|guardian_authority)"/);
  assert.equal(ui.element('[type="submit"]').disabled,false);
  ui.element('#contact-form').listeners.get('submit')({preventDefault(){}});
  assert.match(ui.main.innerHTML,/Check your details/);
  assert.doesNotMatch(ui.main.innerHTML,/<dt>(?:Organisation or role|ADF connection)<\/dt>/);
});

test('one form uses distinct scheduling and interview questions without the previous introductory checklist',()=>{
  const ui=createUI();
  ui.api.setRequest(valid());
  ui.api.renderForm();
  assert.match(ui.main.innerHTML,/<h1[^>]*>Request an interview<\/h1>/);
  assert.match(ui.main.innerHTML,/How should we arrange a time with you\?/);
  assert.match(ui.main.innerHTML,/How would you prefer to be interviewed\?/);
  assert.match(ui.main.innerHTML,/No preference/);
  assert.match(ui.main.innerHTML,/name="age_band" value="minor"/);
  assert.match(ui.main.innerHTML,/name="age_band" value="adult"/);
  assert.doesNotMatch(ui.main.innerHTML,/name="age_band" value="(?:youth|child)"|Under 15|15–17/);
  assert.doesNotMatch(ui.main.innerHTML,/first.contact|Planning your conversation|conversation-summary|completed the survey/i);
  const intro=ui.main.innerHTML.match(/<section class="contact-intro">([\s\S]*?)<\/section>/)?.[1];
  assert.ok(intro);
  assert.doesNotMatch(intro,/<(?:ul|li)\b/);
});

test('editing from review retains separate topic and time preferences but contact changes revoke consent',()=>{
  const ui=createUI();
  ui.api.setRequest(valid({consent:false}));
  ui.api.renderForm();
  assert.equal(ui.element('[type="submit"]').disabled,true);
  const form=ui.element('#contact-form');
  form.listeners.get('change')({target:{name:'interview_mode',type:'radio',value:'phone'}});
  form.listeners.get('input')({target:{name:'topic',type:'textarea',value:'School transitions'}});
  form.listeners.get('input')({target:{name:'suggested_time',type:'textarea',value:'Tuesday after school'}});
  form.listeners.get('change')({target:{name:'consent',type:'checkbox',checked:true}});
  assert.equal(ui.element('[type="submit"]').disabled,false);
  form.listeners.get('submit')({preventDefault(){}});
  assert.match(ui.main.innerHTML,/Check your details/);
  ui.element('#edit-details').onclick();
  assert.equal(ui.api.getRequest().interview_mode,'phone');
  assert.equal(ui.api.getRequest().topic,'School transitions');
  assert.equal(ui.api.getRequest().suggested_time,'Tuesday after school');
  assert.equal(ui.api.getRequest().preferred_name,'Alex');
  const contact=ui.element('#contact-form');
  contact.listeners.get('input')({target:{name:'phone',type:'tel',value:'0400111222'}});
  assert.equal(ui.api.getRequest().consent,false);
  contact.listeners.get('submit')({preventDefault(){}});
  assert.equal(ui.element('[name="consent"]').checked,false);
  assert.equal(ui.element('[type="submit"]').disabled,true);
  assert.equal(ui.api.getRequest().topic,'School transitions');
  assert.equal(ui.api.getRequest().suggested_time,'Tuesday after school');
  contact.listeners.get('change')({target:{name:'consent',type:'checkbox',checked:true}});
  contact.listeners.get('submit')({preventDefault(){}});
  assert.match(ui.main.innerHTML,/0400111222/);
  assert.match(ui.main.innerHTML,/School transitions/);
  assert.match(ui.main.innerHTML,/Tuesday after school/);
});

test('self adults, self minors and guardians can each give separate topics and suggested interview times',()=>{
  for(const route of [{requester:'self',age_band:'adult'},{requester:'self',age_band:'minor'},{requester:'guardian',age_band:'minor',guardian_authority:true}]){
    const ui=createUI();
    ui.api.setRequest(valid({...route,consent:false,interview_mode:'video',participation_notes:'Do not retain'}));
    ui.api.renderForm();
    for(const key of ['consent','topic','suggested_time','interview_mode','contact_notes'])assert.match(ui.main.innerHTML,new RegExp(`name="${key}"`));
    assert.doesNotMatch(ui.main.innerHTML,/name="(?:connection|availability|participation_notes|organisation_role)"/);
    assert.equal(ui.element('[type="submit"]').disabled,true);
    const form=ui.element('#contact-form');
    form.listeners.get('input')({target:{name:'topic',type:'textarea',value:'Housing support'}});
    form.listeners.get('input')({target:{name:'suggested_time',type:'textarea',value:'Friday 10 am NT time'}});
    form.listeners.get('input')({target:{name:'contact_notes',type:'textarea',value:'An interpreter would help'}});
    form.listeners.get('change')({target:{name:'consent',type:'checkbox',checked:true}});
    assert.equal(ui.element('[type="submit"]').disabled,false);
    form.listeners.get('submit')({preventDefault(){}});
    assert.match(ui.main.innerHTML,/Check your details/);
    assert.match(ui.main.innerHTML,/<dt>Discussion topic<\/dt><dd>Housing support<\/dd>/);
    assert.match(ui.main.innerHTML,/<dt>Suggested interview date and time<\/dt><dd>Friday 10 am NT time<\/dd>/);
    assert.match(ui.main.innerHTML,/<dt>Contact or access needs<\/dt><dd>An interpreter would help<\/dd>/);
    assert.equal(ui.api.getRequest().topic,'Housing support');
    assert.equal(ui.api.getRequest().suggested_time,'Friday 10 am NT time');
    assert.doesNotMatch(ui.main.innerHTML,/Do not retain/);
    assert.equal(Object.hasOwn(ui.api.getRequest(),'participation_notes'),false);
  }
});

test('choosing My child infers under 18 without another age question',()=>{
  const ui=createUI();
  ui.element('#contact-form').listeners.get('change')({target:{name:'requester',type:'radio',value:'guardian'}});
  assert.equal(ui.api.getRequest().age_band,'minor');
  assert.equal(model.contactRoute(ui.api.getRequest()),'guardian_minor');
  assert.equal(ui.element('#contact-fields').hidden,false);
  assert.doesNotMatch(ui.main.innerHTML,/name="age_band"/);
  assert.match(ui.main.innerHTML,/name="guardian_authority"/);
  assert.equal(ui.element('[type="submit"]').disabled,true);
  ui.element('#contact-form').listeners.get('change')({target:{name:'requester',type:'radio',value:'self'}});
  assert.equal(ui.api.getRequest().age_band,'');
  assert.equal(ui.element('#contact-fields').hidden,true);
  assert.match(ui.main.innerHTML,/name="age_band" value="minor"/);
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


test('the public resource uses a safe destination without any contact details', () => {
  for (const url of ['', 'http://example.org/file', 'javascript:alert(1)', 'data:text/plain,private', 'https://user:password@example.org/file']) {
    assert.equal(model.contactResource({ url }).url, '');
  }
  assert.equal(model.contactResource({ url: 'support.html' }).url, 'support.html');
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
    assert.match(ui.main.innerHTML, /disabled>Find support in a few clicks/);
    assert.match(ui.main.innerHTML, /Available soon/);
  }
  assert.match(pageSource, /src="thank-you-resource.js/);
  assert.doesNotMatch(ui.main.innerHTML, /request (?:has been |was )?(?:received|sent|submitted)/i);
});
