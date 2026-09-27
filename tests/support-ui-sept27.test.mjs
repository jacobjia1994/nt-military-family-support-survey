import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { topics, questionsFor, preferencesFor, getResults, legacyRoute } from '../support-paths.mjs';
import { services } from '../support-catalog.mjs';
import { getFlowState, applyAnswer } from '../support-flow.mjs';

// Exercise the shipped renderer and event handlers without a browser or network.
function renderer() {
  const handlers = {};
  const documentHandlers = {};
  const pageTargets = Object.fromEntries(['main','urgent-help'].map(id => [id, {
    focused:false, scrolled:false,
    focus() { this.focused = true; },
    scrollIntoView() { this.scrolled = true; }
  }]));
  pageTargets['preference-results'] = {
    innerHTML:'',
    querySelectorAll() { return [...this.innerHTML.matchAll(/class="alternative"/g)]; }
  };
  pageTargets['chat-options'] = {innerHTML:''};
  pageTargets['preference-status'] = {textContent:''};
  let selectedPreferences = [];
  const root = {
    innerHTML:'',
    addEventListener:(type,handler) => { handlers[type] = handler; },
    querySelector:() => null,
    querySelectorAll:selector => selector === 'input[name="support-preference"]:checked' ? selectedPreferences.map(value=>({value})) : []
  };
  const location = {hash:'#home'};
  const context = vm.createContext({
    topics,questionsFor,preferencesFor,getResults,legacyRoute,services,getFlowState,applyAnswer,
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
  const change = (questionId, value) => {
    const group = {dataset:{questionId}};
    const control = {
      type:'radio', tagName:'INPUT', name:questionId, value, checked:true,
      dataset:{questionId},
      matches:selector => selector.includes('radio'),
      closest:selector => selector.includes('flow-question') ? group : selector.startsWith('input') ? control : null
    };
    handlers.change({target:control});
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
  const prefer = values => {
    selectedPreferences = values;
    handlers.change({target:{matches:selector => selector === 'input[name="support-preference"]'}});
  };
  return {root,run,render,click,change,jump,prefer,location,pageTargets};
}

test('chat actions promote verified chat links but not a chat availability page', () => {
  const ui = renderer();
  assert.match(ui.run('actionBlock(services.beyondblue,true)'), /button-secondary[^>]*href="https:\/\/www.beyondblue.org.au\/get-support\/talk-to-a-counsellor"/);
  assert.equal(ui.run("chatAction({extraUrl:'https://parentline.com.au/faq/how-can-i-contact-parentline',extraLabel:'Phone and chat availability'})"), null);
  assert.equal(ui.run('chatAction(services.parentline).url'), 'https://www.kidshelpline.com.au/parentline-webchat');
  assert.equal(ui.run('extraAction(services.beyondblue)'), '');
  assert.match(ui.run('extraAction(services.parentline)'), /How Parentline webchat works/);
});

test('radio changes reveal the next group and final contacts on the same page without submission', () => {
  const ui = renderer();
  ui.render('#money');
  assert.match(ui.root.innerHTML, /data-question-id="need"/);
  assert.doesNotMatch(ui.root.innerHTML, /data-question-id="region"/);
  ui.change('need','essentials');
  assert.equal(ui.location.hash, '#money');
  assert.match(ui.root.innerHTML, /data-question-id="need"/);
  assert.match(ui.root.innerHTML, /data-question-id="region"/);
  assert.doesNotMatch(ui.root.innerHTML, /Lutheran Care — Alice Springs/);
  ui.change('region','alice');
  assert.equal(ui.location.hash, '#money');
  assert.match(ui.root.innerHTML, /Lutheran Care — Alice Springs/);
  assert.match(ui.root.innerHTML, /data-question-id="need"/);
  assert.match(ui.root.innerHTML, /data-question-id="region"/);
  assert.doesNotMatch(ui.root.innerHTML, /type="submit"/);
});

test('returning to a previous topic restores its answers instead of revisiting individual choice screens', () => {
  const ui = renderer();
  ui.render('#money');
  ui.change('need','essentials');
  ui.change('region','alice');
  ui.render('#care');
  ui.change('need','carer');
  ui.change('veteranCare','no');
  assert.equal(ui.location.hash, '#care');
  ui.render('#money');
  assert.equal(ui.location.hash, '#money');
  assert.equal(ui.run('state.answers.need'), 'essentials');
  assert.equal(ui.run('state.answers.region'), 'alice');
  assert.match(ui.root.innerHTML, /Lutheran Care — Alice Springs/);
});

test('a jurisdiction choice does not discard the known town needed after an earlier answer changes', () => {
  const ui = renderer();
  ui.render('#money');
  ui.change('need','essentials');
  ui.change('region','alice');
  ui.render('#relationships');
  ui.change('need','counselling');
  ui.change('counselling','other');
  assert.equal(ui.run('state.answers.region'), 'nt');
  ui.change('region','nt');
  ui.change('need','assault');
  assert.equal(ui.run('state.answers.region'), 'alice');
  assert.match(ui.root.innerHTML, /Alice Springs Sexual Assault Referral Centre/);
  assert.equal(ui.location.hash, '#relationships');
});

test('legacy question and result URLs open the topic’s progressive form without a step redirect', () => {
  const ui = renderer();
  ui.render('#money/q/region');
  assert.equal(ui.location.hash, '#money');
  assert.match(ui.root.innerHTML, /data-question-id="need"/);
  ui.change('need','essentials');
  ui.change('region','alice');
  ui.render('#money/results');
  assert.equal(ui.location.hash, '#money');
  assert.match(ui.root.innerHTML, /Lutheran Care — Alice Springs/);
});

test('optional support updates in place without replacing the core result or questionnaire', () => {
  const ui = renderer();
  ui.render('#mental');
  ui.change('need','feelings');
  ui.change('age','26+');
  ui.change('counselling','partner');
  ui.change('region','alice');
  const before = ui.root.innerHTML;
  const originalIds = ui.run('JSON.stringify(getResults(state.topicId,state.answers).ids)');
  ui.prefer(['lgbtq']);
  assert.equal(ui.location.hash, '#mental');
  assert.equal(ui.root.innerHTML, before, 'Keep the existing questions and core contact DOM');
  assert.equal(ui.run('JSON.stringify(getResults(state.topicId,state.answers).ids)'), originalIds);
  assert.match(ui.pageTargets['preference-results'].innerHTML, /QLife/);
  assert.match(ui.pageTargets['chat-options'].innerHTML, /qlife.org.au/);
  ui.prefer([]);
  assert.doesNotMatch(ui.pageTargets['preference-results'].innerHTML, /QLife/);
  assert.equal(ui.run('JSON.stringify(getResults(state.topicId,state.answers).ids)'), originalIds);
});

test('urgent-help and return links preserve an unfinished questionnaire and keyboard focus', () => {
  const ui = renderer();
  ui.run("state = {topicId:'care',answers:{need:'travel',connection:'serving',role:'other',dvaTravel:'no'}}");
  ui.render('#care');
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
  ui.change('region','alice');
  assert.equal(ui.run('state.answers.role'), 'other');
  assert.equal(ui.run('state.answers.dvaTravel'), 'no');
  assert.equal(ui.location.hash, '#care');
  assert.match(ui.root.innerHTML, /data-question-id="ntResidence"/);
});

test('chat shortcuts are near the main contact and only use services in the result', () => {
  const ui = renderer();
  ui.run("state = {topicId:'mental',answers:{need:'feelings',age:'26+',counselling:'partner',region:'alice'}}");
  ui.render('#mental');
  const contactStart = ui.root.innerHTML.indexOf('class="contact-panel"');
  const contactEnd = ui.root.innerHTML.indexOf('</aside>',contactStart);
  assert.match(ui.root.innerHTML.slice(contactStart,contactEnd), /Prefer to chat online\?/);
  assert.match(ui.root.innerHTML.slice(contactStart,contactEnd), /beyondblue.org.au\/get-support\/talk-to-a-counsellor/);
  assert.doesNotMatch(ui.root.innerHTML.slice(contactStart,contactEnd), /qlife.org.au/);
});

test('human handoff retains food and Palmerston, has a useful script and no self-loop', () => {
  const ui = renderer();
  ui.run("state = {topicId:'money',answers:{need:'essentials',region:'palmerston'}}");
  ui.render('#money');
  ui.click('request-help','#help');
  assert.match(ui.root.innerHTML, /Food or other essentials/);
  assert.match(ui.root.innerHTML, /Palmerston/);
  assert.equal(ui.location.hash, '#help');
  ui.change('connection','former');
  assert.equal(ui.location.hash, '#help');
  assert.match(ui.root.innerHTML, /Food or other essentials/);
  assert.match(ui.root.innerHTML, /Support is needed in Palmerston/);
  assert.match(ui.root.innerHTML, /Could you help me find another service for this need/);
  assert.doesNotMatch(ui.root.innerHTML, /data-action="request-help"/);
  ui.click('return-to-request','#money');
  assert.equal(ui.run('state.answers.need'), 'essentials');
  assert.equal(ui.run('state.answers.region'), 'palmerston');
});

test('browser back from a human handoff restores the original choices', () => {
  const ui = renderer();
  ui.run("state = {topicId:'money',answers:{need:'essentials',region:'palmerston'}}");
  ui.render('#money');
  ui.click('request-help','#help');
  ui.render('#money');
  assert.equal(ui.location.hash, '#money');
  assert.equal(ui.run('state.answers.need'), 'essentials');
  assert.equal(ui.run('state.answers.region'), 'palmerston');
});

test('editing one region refreshes contacts in place with the need retained', () => {
  const ui = renderer();
  ui.run("state = {topicId:'money',answers:{need:'essentials',region:'palmerston'}}");
  ui.render('#money');
  ui.change('region','alice');
  assert.equal(ui.location.hash, '#money');
  assert.equal(ui.run('state.answers.need'), 'essentials');
  assert.equal(ui.run('state.answers.region'), 'alice');
});

test('editing a need requests new eligibility answers instead of showing a stale result', () => {
  const ui = renderer();
  ui.run("state = {topicId:'money',answers:{need:'essentials',region:'palmerston'}}");
  ui.render('#money');
  ui.change('need','bills');
  assert.equal(ui.location.hash, '#money');
  assert.match(ui.root.innerHTML, /data-question-id="connection"/);
  assert.doesNotMatch(ui.root.innerHTML, /CatholicCare NT — Palmerston/);
  assert.equal(ui.run('state.answers.need'), 'bills');
  assert.equal(ui.run('state.answers.connection'), undefined);
});
