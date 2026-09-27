import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {topics, questionsFor, preferencesFor, getResults, legacyRoute} from '../support-paths.mjs';
import {services} from '../support-catalog.mjs';

const allIds = result => [
  ...result.ids,
  ...(result.moreIds || []),
  ...(result.preferenceGroups || []).flatMap(group => group.ids)
];
const questionIds = (topic, answers) => questionsFor(topic, answers).map(q => q.id);
const has = (result, id) => assert.ok(allIds(result).includes(id), `Missing ${id}`);
const lacks = (result, id) => assert.ok(!allIds(result).includes(id), `Inappropriate ${id}`);

test('another relative or unknown role does not inherit a serving member’s medical-travel shortcut', () => {
  for (const role of ['other', 'unsure']) {
    const answers = {need:'travel', connection:'serving', role, dvaTravel:'no', region:'alice', ntResidence:'no'};
    const questions = questionIds('care', answers);
    for (const id of ['dvaTravel', 'region', 'ntResidence']) assert.ok(questions.includes(id), `${role}: ask ${id} for the patient`);
    const result = getResults('care', answers);
    has(result, 'patient-travel-alice');
    for (const id of ['defence-medical-enquiry', 'pats-alice']) lacks(result, id);
    has(getResults('care', {...answers, ntResidence:'yes'}), 'pats-alice');
  }
});

test('the patient’s DVA-covered travel remains available for other or unknown family roles', () => {
  for (const role of ['other', 'unsure']) {
    const answers = {need:'travel', connection:'serving', role, dvaTravel:'yes', region:'alice', ntResidence:'no'};
    const result = getResults('care', answers);
    has(result, 'dva-treatment-travel');
    lacks(result, 'defence-medical-enquiry');
    lacks(result, 'pats-alice');
    assert.ok(questionIds('care', answers).includes('dvaTravel'));
    assert.ok(!questionIds('care', answers).includes('ntResidence'));
  }
});

test('the confirmed serving member keeps their own clinical travel route', () => {
  const answers = {need:'travel', connection:'serving', role:'member'};
  assert.equal(getResults('care', answers).ids[0], 'defence-medical-enquiry');
  for (const id of ['dvaTravel', 'region', 'ntResidence']) assert.ok(!questionIds('care', answers).includes(id));
});

test('recognition as a dependant determines family-health eligibility for other relatives too', () => {
  for (const role of ['partner', 'child', 'other', 'unsure']) {
    const answers = {need:'costs', connection:'serving', role};
    assert.ok(questionIds('care', answers).includes('dependant'), `${role}: check recognition`);
    has(getResults('care', {...answers, dependant:'yes'}), 'adf-family-health');
    for (const dependant of ['no', undefined]) lacks(getResults('care', {...answers, dependant}), 'adf-family-health');
  }
  lacks(getResults('care', {need:'costs', connection:'reserve', role:'other', dependant:'yes'}), 'adf-family-health');
  assert.equal(getResults('care', {need:'costs', connection:'serving', role:'member'}).ids[0], 'adf-healthcare');
});

test('East Arnhem and remote sexual-assault results retain a medical contact alongside counselling', () => {
  for (const region of ['gove', 'remote']) {
    const result = getResults('relationships', {need:'assault', region});
    has(result, 'sarc-darwin');
    has(result, 'respect');
    assert.ok(result.ids.includes('sarc-darwin'), 'Medical access should not be hidden in optional preferences');
  }
  has(getResults('relationships', {need:'assault', region:'remote'}), 'sarc-alice');
  const outside = getResults('relationships', {need:'assault', region:'outside'});
  assert.ok(!allIds(outside).some(id => id.startsWith('sarc-')));
  has(outside, 'respect');
});

test('women without children in Darwin or Palmerston reach a suitable local refuge', () => {
  for (const region of ['darwin', 'palmerston']) {
    const result = getResults('relationships', {need:'refuge', refugeFor:'woman', region});
    has(result, 'catherine-booth-house');
    has(result, 'respect');
    lacks(result, 'dawn-shelter');
    lacks(getResults('relationships', {need:'refuge', refugeFor:'other', region}), 'catherine-booth-house');
    has(getResults('relationships', {need:'refuge', refugeFor:'woman-child', region}), 'dawn-shelter');
  }
});

test('school-age children can discover Open Arms without losing age-appropriate clinical entry points', () => {
  for (const need of ['feelings', 'treatment', 'grief']) {
    for (const age of ['5-11', '12-17']) {
      const answers = {need, age, region:'darwin'};
      has(getResults('mental', answers), 'open-arms');
      assert.ok(!questionIds('mental', answers).includes('counselling'), 'Do not ask children the adult service-history question');
    }
  }
  const preschool = getResults('mental', {need:'treatment', age:'0-4', region:'darwin'});
  assert.equal(preschool.ids[0], 'child-health-darwin');
  lacks(preschool, 'kids-helpline');
  const teen = getResults('mental', {need:'feelings', age:'12-17', region:'katherine'});
  assert.equal(teen.ids[0], 'headspace-katherine');
  lacks(teen, 'katherine-mmhc');
});

test('serving members start ongoing treatment through ADF care while former members retain DVA funding', () => {
  for (const region of ['darwin', 'alice', 'outside']) {
    const answers = {need:'treatment', age:'26+', region};
    const serving = getResults('mental', {...answers, counselling:'serving'});
    assert.equal(serving.ids[0], 'adf-healthcare');
    has(serving, 'adf-allhours');
    assert.equal(getResults('mental', {...answers, counselling:'member'}).ids[0], 'dva-mental-treatment');
    for (const counselling of ['partner', 'child']) lacks(getResults('mental', {...answers, counselling}), 'adf-healthcare');
  }
});

test('Defence children have a direct activities route without treating the 5–11 band as all eligible', () => {
  const need = questionsFor('connection').find(q => q.id === 'need');
  assert.ok(need.options.some(o => o.value === 'defence-child'));
  has(getResults('connection', {need:'defence-child'}), 'defence-kids');
  for (const need of ['feelings', 'treatment', 'grief']) {
    has(getResults('mental', {need, age:'12-17', region:'alice'}), 'defence-kids');
    for (const age of ['0-4', '5-11', '18-25']) lacks(getResults('mental', {need, age, region:'alice'}), 'defence-kids');
  }
});

test('NT DVA claims include independent advocacy while outside-NT users avoid the NT office', () => {
  const answers = {need:'claims', region:'nt'};
  assert.ok(questionIds('money', answers).includes('region'));
  const result = getResults('money', answers);
  has(result, 'rsl-sa-nt-advocacy');
  has(result, 'dva');
  const outside = getResults('money', {...answers, region:'outside'});
  has(outside, 'dva');
  lacks(outside, 'rsl-sa-nt-advocacy');
});

test('NT relationship counselling has a direct local service with an outside-NT boundary', () => {
  const answers = {need:'counselling', counselling:'other'};
  const region = questionsFor('relationships', answers).find(q => q.id === 'region');
  assert.ok(region, 'The user can select the relevant jurisdiction');
  assert.ok(region.options.some(o => o.value === 'outside'));
  has(getResults('relationships', {...answers, region:'nt'}), 'relationships-australia-nt');
  lacks(getResults('relationships', {...answers, region:'outside'}), 'relationships-australia-nt');
  has(getResults('relationships', {...answers, region:'outside'}), 'family-advice');
});

test('Alice migrant settlement reaches MCSCA without displacing Darwin’s settlement service', () => {
  const alice = getResults('connection', {need:'migrant', region:'alice'});
  assert.equal(alice.ids[0], 'mcsca');
  assert.equal(getResults('connection', {need:'migrant', region:'darwin'}).ids[0], 'ramss');
  lacks(getResults('connection', {need:'migrant', region:'outside'}), 'mcsca');
});

test('Aboriginal-led legal support is optional and follows the user’s NT region', () => {
  const specialistIds = ['naafls', 'caaflu-central', 'caaflu-barkly', 'daiws'];
  for (const [region, expected] of [
    ['darwin', 'naafls'], ['palmerston', 'naafls'], ['katherine', 'naafls'],
    ['gove', 'naafls'], ['alice', 'caaflu-central'], ['tennant', 'caaflu-barkly']
  ]) {
    const answers = {need:'legal', womenLegal:'no', region};
    assert.ok(preferencesFor('relationships', answers).some(p => p.value === 'indigenous-legal'));
    const baseline = getResults('relationships', answers);
    for (const id of specialistIds) lacks(baseline, id);
    const selected = getResults('relationships', {...answers, preferences:['indigenous-legal']});
    has(selected, expected);
    assert.deepEqual(selected.ids, baseline.ids, 'Optional cultural support supplements the original contacts');
    for (const id of ['naafls', 'caaflu-central', 'caaflu-barkly'].filter(id => id !== expected)) lacks(selected, id);
  }
});

test('an unknown NT region offers labelled cultural-support choices and stale outside-NT preferences do not leak NT services', () => {
  const answers = {need:'separation', region:'nt', preferences:['indigenous-legal']};
  const result = getResults('relationships', answers);
  for (const id of ['naafls', 'caaflu-central', 'caaflu-barkly']) has(result, id);
  assert.ok(result.preferenceGroups.length, 'The extra services remain an opt-in group');
  const outside = getResults('relationships', {...answers, region:'outside'});
  for (const id of ['naafls', 'caaflu-central', 'caaflu-barkly', 'daiws']) lacks(outside, id);
});

test('the active directory preserves urgent mental-health and emergency respite contact facts', () => {
  const mental = services['nt-mental-health-line'];
  assert.ok(mental, 'The hotline must be in the active imported catalog');
  assert.equal(mental.phone.replace(/\D/g, ''), '1800682288');
  assert.match(mental.hours, /24/);
  assert.ok(mental.sources.some(url => new URL(url).hostname === 'nt.gov.au'));
  const carer = services['carer-gateway'];
  assert.equal(carer.phone.replace(/\D/g, ''), '1800422737');
  assert.match(carer.hours, /24/);
  assert.match(carer.hours, /respite/i);
});

// Test the shipped contact renderer, not a copy of its link-selection logic.
function contactRenderer() {
  const root = {innerHTML:'', addEventListener:()=>{}, querySelector:()=>null, querySelectorAll:()=>[]};
  const context = vm.createContext({
    topics, questionsFor, preferencesFor, getResults, legacyRoute, services,
    location:{hash:'#home'},
    document:{getElementById:id=>id==='finder'?root:null, querySelector:()=>null, querySelectorAll:()=>[], addEventListener:()=>{}},
    window:{addEventListener:()=>{}, scrollTo:()=>{}},
    history:{replaceState:()=>{}}
  });
  const source = readFileSync(new URL('../support.js', import.meta.url), 'utf8').replace(/^import .*;\n/gm, '');
  vm.runInContext(source, context);
  return code => vm.runInContext(code, context);
}

test('a service’s own available webchat is an actionable link and availability pages are not mislabeled', () => {
  const run = contactRenderer();
  for (const id of ['respect', 'kids-helpline', 'eheadspace', 'beyondblue', 'qlife', 'parentline']) {
    const chat = run(`chatAction(services[${JSON.stringify(id)}])`);
    assert.ok(chat, `${id} has its own chat action`);
    assert.equal(new URL(chat.url).protocol, 'https:');
    const html = run(`actionBlock(services[${JSON.stringify(id)}],true)`);
    const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map(match => match[1].replace(/&amp;/g, '&'));
    assert.ok(hrefs.includes(chat.url), `${id}: link to this service’s actual chat destination`);
  }
  assert.equal(run("chatAction({extraUrl:'https://parentline.com.au/faq/how-can-i-contact-parentline',extraLabel:'Phone and chat availability'})"), null, 'A page describing hours is not a direct chat link');
});
