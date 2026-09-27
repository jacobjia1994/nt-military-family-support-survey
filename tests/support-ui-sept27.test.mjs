import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { topics, questionsFor, preferencesFor, getResults, legacyRoute } from '../support-paths.mjs';
import { services } from '../support-catalog.mjs';

// Exercise the shipped renderer and event handlers without a browser or network.
function renderer() {
  const handlers = {};
  const documentHandlers = {};
  const pageTargets = Object.fromEntries(['main','urgent-help'].map(id => [id, {
    focused:false, scrolled:false,
    focus() { this.focused = true; },
    scrollIntoView() { this.scrolled = true; }
  }]));
  const root = {
    innerHTML:'',
    addEventListener:(type,handler) => { handlers[type] = handler; },
    querySelector:() => null,
    querySelectorAll:() => []
  };
  const location = {hash:'#home'};
  const context = vm.createContext({
    topics,questionsFor,preferencesFor,getResults,legacyRoute,services,
    location,
    document:{
      getElementById:id => id === 'finder' ? root : pageTargets[id] || null,
      querySelector:() => null,
      addEventListener:(type,handler) => { documentHandlers[type] = handler; }
    },
    window:{addEventListener:() => {},scrollTo:() => {},print:() => {}},
    history:{replaceState:(_state,_title,hash) => { location.hash = hash; }},
    localStorage:new Proxy({}, {get:() => { throw new Error('No persistent answers'); }}),
    sessionStorage:new Proxy({}, {get:() => { throw new Error('No persistent answers'); }})
  });
  const source = readFileSync(new URL('../support.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'');
  vm.runInContext(source,context);
  const run = code => vm.runInContext(code,context);
  const render = hash => { if (hash) location.hash = hash; run('render()'); };
  const click = (action,hash) => {
    const anchor = {dataset:{action},hash};
    handlers.click({target:{closest:selector => selector === 'a[href^="#"]' ? anchor : null},preventDefault:() => {}});
    render(hash);
  };
  const submit = value => {
    handlers.submit({preventDefault:() => {},target:{id:'support-question',querySelector:() => ({value})}});
    render();
  };
  const jump = targetId => {
    let prevented = false;
    const anchor = {dataset:{pageJump:targetId}};
    documentHandlers.click({
      target:{closest:selector => selector === 'a[data-page-jump]' ? anchor : null},
      preventDefault:() => { prevented = true; }
    });
    return {prevented,target:pageTargets[targetId]};
  };
  return {root,run,render,click,submit,jump,location};
}

test('chat actions promote verified chat links but not a chat availability page', () => {
  const ui = renderer();
  assert.match(ui.run('actionBlock(services.beyondblue,true)'), /button-secondary[^>]*href="https:\/\/www.beyondblue.org.au\/get-support\/talk-to-a-counsellor"/);
  assert.equal(ui.run("chatAction({extraUrl:'https://parentline.com.au/faq/how-can-i-contact-parentline',extraLabel:'Phone and chat availability'})"), null);
  assert.equal(ui.run('chatAction(services.parentline).url'), 'https://www.kidshelpline.com.au/parentline-webchat');
  assert.equal(ui.run('extraAction(services.beyondblue)'), '');
  assert.match(ui.run('extraAction(services.parentline)'), /How Parentline webchat works/);
});

test('urgent-help and return links preserve an unfinished questionnaire and keyboard focus', () => {
  const ui = renderer();
  ui.run("state = {topicId:'care',answers:{need:'travel',connection:'serving',role:'other',dvaTravel:'no'}}");
  ui.render('#care/q/region');
  const hash = ui.location.hash;
  const before = ui.run('JSON.stringify(state)');
  for (const target of ['urgent-help', 'main']) {
    const jump = ui.jump(target);
    assert.equal(jump.prevented, true, 'Do not let a page anchor change the router hash');
    assert.equal(jump.target.focused, true);
    assert.equal(jump.target.scrolled, true);
    assert.equal(ui.location.hash, hash);
    assert.equal(ui.run('JSON.stringify(state)'), before);
  }
  ui.submit('alice');
  assert.equal(ui.run('state.answers.role'), 'other');
  assert.equal(ui.run('state.answers.dvaTravel'), 'no');
  assert.equal(ui.location.hash, '#care/q/ntResidence');
});

test('chat shortcuts are near the main contact and only use services in the result', () => {
  const ui = renderer();
  ui.run("state = {topicId:'mental',answers:{need:'feelings',age:'26+',counselling:'partner',region:'alice'}}");
  ui.render('#mental/results');
  const contactStart = ui.root.innerHTML.indexOf('class="contact-panel"');
  const contactEnd = ui.root.innerHTML.indexOf('</aside>',contactStart);
  assert.match(ui.root.innerHTML.slice(contactStart,contactEnd), /Prefer to chat online\?/);
  assert.match(ui.root.innerHTML.slice(contactStart,contactEnd), /beyondblue.org.au\/get-support\/talk-to-a-counsellor/);
  assert.doesNotMatch(ui.root.innerHTML.slice(contactStart,contactEnd), /qlife.org.au/);
});

test('human handoff retains food and Palmerston, has a useful script and no self-loop', () => {
  const ui = renderer();
  ui.run("state = {topicId:'money',answers:{need:'essentials',region:'palmerston'}}");
  ui.render('#money/results');
  ui.click('request-help','#help');
  assert.match(ui.root.innerHTML, /Food or other essentials/);
  assert.match(ui.root.innerHTML, /Palmerston/);
  assert.equal(ui.location.hash, '#help/q/connection');
  ui.submit('former');
  assert.equal(ui.location.hash, '#help/results');
  assert.match(ui.root.innerHTML, /Food or other essentials/);
  assert.match(ui.root.innerHTML, /Support is needed in Palmerston/);
  assert.match(ui.root.innerHTML, /Could you help me find another service for this need/);
  assert.doesNotMatch(ui.root.innerHTML, /data-action="request-help"/);
  ui.click('return-to-request','#money/results');
  assert.equal(ui.run('state.answers.need'), 'essentials');
  assert.equal(ui.run('state.answers.region'), 'palmerston');
});

test('browser back from a human handoff restores the original choices', () => {
  const ui = renderer();
  ui.run("state = {topicId:'money',answers:{need:'essentials',region:'palmerston'}}");
  ui.render('#money/results');
  ui.click('request-help','#help');
  ui.render('#money/results');
  assert.equal(ui.location.hash, '#money/results');
  assert.equal(ui.run('state.answers.need'), 'essentials');
  assert.equal(ui.run('state.answers.region'), 'palmerston');
});

test('editing one region returns directly to results with the need retained', () => {
  const ui = renderer();
  ui.run("state = {topicId:'money',answers:{need:'essentials',region:'palmerston'}}");
  ui.render('#money/results');
  assert.match(ui.root.innerHTML, /data-action="edit-answer"/);
  ui.click('edit-answer','#money/q/region');
  ui.submit('alice');
  assert.equal(ui.location.hash, '#money/results');
  assert.equal(ui.run('state.answers.need'), 'essentials');
  assert.equal(ui.run('state.answers.region'), 'alice');
});

test('editing a need requests new eligibility answers instead of showing a stale result', () => {
  const ui = renderer();
  ui.run("state = {topicId:'money',answers:{need:'essentials',region:'palmerston'}}");
  ui.render('#money/results');
  ui.click('edit-answer','#money/q/need');
  ui.submit('bills');
  assert.match(ui.location.hash, /^#money\/q\//);
  assert.equal(ui.run('state.answers.need'), 'bills');
  assert.equal(ui.run('state.answers.connection'), undefined);
});
