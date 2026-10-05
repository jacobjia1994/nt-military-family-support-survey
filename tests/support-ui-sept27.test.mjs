import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import * as paths from '../support-paths.mjs';
import * as routing from '../support-routing.mjs';
import * as flow from '../support-flow.mjs';
import { journeys } from '../support-journeys.mjs';
import { verifiedDefence } from '../support-verified-data.mjs';

// Exercise the shipped handlers without a browser or network. The small DOM
// double models the currently rendered radio group, not private routing answers.
function renderer() {
  const handlers = {}, documentHandlers = {}, windowHandlers = {};
  const pageTargets = {};
  const target = id => pageTargets[id] ||= {
    focused:false, scrolled:false, innerHTML:'', textContent:'',
    focus() { this.focused=true; },
    scrollIntoView() { this.scrolled=true; },
    setAttribute(name,value) { this[name]=value; },
    matches() { return false; }
  };
  for(const id of ['main','urgent-help','preference-status','preference-results','chat-options'])target(id);
  pageTargets['preference-results'].querySelectorAll=()=>[...pageTargets['preference-results'].innerHTML.matchAll(/class="alternative"/g)];
  let html='', field=null, next=null, selectedPreferences=[];
  const root = {
    get innerHTML() { return html; },
    set innerHTML(value) {
      html=value;
      const group=html.match(/<fieldset[^>]*data-question-id="([^"]+)"[^>]*>([\s\S]*?)<\/fieldset>/);
      field=null;
      if(group) {
        const controls=[...group[2].matchAll(/<input type="radio"[^>]*name="([^"]+)" value="([^"]+)"([^>]*)>/g)]
          .map(match=>({
            type:'radio',name:match[1],value:match[2],checked:match[3].includes(' checked'),
            matches:selector=>selector==='input[type="radio"]'
          }));
        field={id:group[1],controls,querySelector:selector=>selector==='input:checked'?controls.find(input=>input.checked)||null:null};
      }
      const button=html.match(/<button[^>]*id="flow-next"([^>]*)>/);
      next=button?{disabled:button[1].includes(' disabled')}:null;
    },
    addEventListener:(type,handler)=>{handlers[type]=handler;},
    querySelector(selector) {
      if(selector==='#flow-questions fieldset')return field;
      if(selector==='h1'&&html.includes('<h1'))return target('heading');
      if(selector==='#flow-questions legend h2'&&field)return target('question-heading');
      if(selector==='#support-contacts-heading'&&html.includes('id="support-contacts-heading"'))return target('contacts-heading');
      return null;
    },
    querySelectorAll(selector) {
      if(selector==='input[name="support-preference"]:checked')return selectedPreferences.map(value=>({value}));
      if(selector==='input[name="support-preference"]')return [...html.matchAll(/name="support-preference" value="([^"]+)"/g)].map(match=>({value:match[1],focus:()=>{target('preference-'+match[1]).focused=true;}}));
      return [];
    }
  };
  let href='https://example.test/support.html#home';
  const location={
    get href(){return href;},
    get hash(){return new URL(href).hash;},
    set hash(value){href=new URL(value,href).href;}
  };
  const historyEntries=[{state:null,url:href}];
  let historyIndex=0;
  const history={
    get state(){return historyEntries[historyIndex].state;},
    replaceState(state,_title,url){
      if(url)href=new URL(url,href).href;
      historyEntries[historyIndex]={state,url:href};
    },
    pushState(state,_title,url){
      if(url)href=new URL(url,href).href;
      historyEntries.splice(historyIndex+1);
      historyEntries.push({state,url:href});
      historyIndex++;
    }
  };
  const context=vm.createContext({
    ...paths,...routing,...flow,journeys,verifiedDefence,location,history,
    document:{
      getElementById:id=>id==='finder'?root:id==='flow-next'?next:pageTargets[id]||null,
      querySelector:()=>null,
      addEventListener:(type,handler)=>{documentHandlers[type]=handler;}
    },
    window:{
      addEventListener:(type,handler)=>{windowHandlers[type]=handler;},
      scrollTo:()=>{},print:()=>{}
    },
    localStorage:new Proxy({}, {get:()=>{throw new Error('No persistent answers');}}),
    sessionStorage:new Proxy({}, {get:()=>{throw new Error('No persistent answers');}})
  });
  const source=readFileSync(new URL('../support.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'');
  vm.runInContext(source,context);
  const run=code=>vm.runInContext(code,context);
  const render=hash=>{if(hash)location.hash=hash;run('render()');};
  function click(action,hash,question) {
    const element={dataset:{action,question},hash};
    handlers.click({
      target:{closest(selector){
        if(selector==='a[href^="#"]')return hash?element:null;
        const match=selector.match(/^\[data-action="([^"]+)"\]$/);
        return match&&match[1]===action?element:null;
      }},
      preventDefault:()=>{}
    });
  }
  const navigate=hash=>click(undefined,hash);
  function change(questionId,value) {
    assert.equal(field?.id,questionId,'Choose only the current rendered question');
    const control=field.controls.find(input=>input.value===value);
    assert.ok(control,'Choose an offered radio value');
    for(const input of field.controls)input.checked=input===control;
    handlers.change({target:control});
  }
  function submit() {
    let prevented=false;
    assert.ok(field,'Next needs a currently rendered question');
    assert.equal(next.disabled,false,'Next is enabled after selecting an answer');
    handlers.submit({target:{id:'support-flow'},preventDefault:()=>{prevented=true;}});
    assert.equal(prevented,true,'Next does not submit personal information');
  }
  const choose=(id,value)=>{change(id,value);submit();};
  function edit(id) {
    assert.ok(html.includes('data-action="edit-answer" data-question="'+id+'"'),'Only visible editable answers have Change');
    click('edit-answer',undefined,id);
    assert.equal(field?.id,id);
  }
  function jump(targetId) {
    let prevented=false;
    documentHandlers.click({
      target:{closest:selector=>selector==='a[data-page-jump]'?{dataset:{pageJump:targetId}}:null},
      preventDefault:()=>{prevented=true;}
    });
    return {prevented,target:pageTargets[targetId]};
  }
  function prefer(values) {
    selectedPreferences=values;
    handlers.change({target:{value:values[0],matches:selector=>selector==='input[name="support-preference"]'}});
  }
  function traverse(offset) {
    const nextIndex=historyIndex+offset;
    assert.ok(nextIndex>=0&&nextIndex<historyEntries.length,'History entry exists');
    const oldHash=location.hash;
    historyIndex=nextIndex;
    href=historyEntries[historyIndex].url;
    windowHandlers.popstate?.({state:history.state});
    if(oldHash!==location.hash)windowHandlers.hashchange?.({});
  }
  return {root,run,render,navigate,click,change,submit,choose,edit,jump,prefer,
    location,pageTargets,back:()=>traverse(-1),forward:()=>traverse(1),
    question:()=>field?.id,selected:()=>field?.controls.find(input=>input.checked)?.value,next:()=>next};
}

const resultCatalogues=ui=>JSON.parse(ui.run('JSON.stringify(currentResults().ids.map(id=>Number(services[id].appearance.catalogue_id)))'));

test('contact actions use verified channels and exclude an outage phone',()=>{
  const ui=renderer();
  const intake=routing.appearances.find(row=>row.issue_number===7&&Number(row.catalogue_id)===86);
  const lifeline=routing.appearances.find(row=>row.issue_number===40&&Number(row.catalogue_id)===74);
  const intakeActions=ui.run('actionBlock(services['+JSON.stringify(intake.appearance_id)+'],true)');
  assert.match(intakeActions,/href="https:\/\/www\.lutherancare\.org\.au\/nt-cis-enquiries\/"/);
  assert.match(intakeActions,/Use online referral form/);
  assert.doesNotMatch(intakeActions,/href="tel:/);
  const crisisActions=ui.run('actionBlock(services['+JSON.stringify(lifeline.appearance_id)+'],true)');
  assert.match(crisisActions,/href="tel:131114"/);
  assert.doesNotMatch(crisisActions,/href="sms:/,'Do not invent a message action for a phone-only source route');
  const page=readFileSync(new URL('../support.html',import.meta.url),'utf8');
  assert.match(page,/href="sms:0477131114"/);
  assert.match(page,/href="https:\/\/www\.lifeline\.org\.au\/chat"/);
  assert.doesNotMatch(ui.run("link('javascript:alert(1)','Unsafe')"),/href=/);
});

test('native radio selection waits for Next and then shows the next question or contacts',()=>{
  const ui=renderer();
  ui.navigate('#task/money/2');
  assert.equal(ui.question(),'region','The task already chose food and essentials');
  const before=ui.root.innerHTML;
  const answers=ui.run('JSON.stringify(state.answers)');
  ui.change('region','alice');
  assert.equal(ui.root.innerHTML,before,'Do not replace the radio DOM during native selection');
  assert.equal(ui.run('JSON.stringify(state.answers)'),answers,'Selection is not committed before Next');
  assert.equal(ui.next().disabled,false);
  ui.submit();
  assert.equal(ui.location.hash,'#task/money/2');
  assert.equal(ui.question(),undefined);
  assert.match(ui.root.innerHTML,/Lutheran Care/);
  assert.match(ui.root.innerHTML,/Your support contacts/);
  assert.match(ui.root.innerHTML,/Your choices · change/);
  assert.doesNotMatch(ui.root.innerHTML,/data-question-id="need"/);
});

test('returning to a previous task restores its committed answers',()=>{
  const ui=renderer();
  ui.navigate('#task/money/2');
  ui.choose('region','alice');
  ui.navigate('#task/health/3');
  ui.choose('connection','former');
  ui.choose('dvaTravel','yes');
  ui.navigate('#task/money/2');
  assert.equal(ui.run('state.answers.need'),'essentials');
  assert.equal(ui.run('state.answers.region'),'alice');
  assert.equal(ui.question(),undefined);
  assert.match(ui.root.innerHTML,/Lutheran Care/);
});

test('a jurisdiction choice retains the town needed by a later named local task',()=>{
  const ui=renderer();
  ui.navigate('#task/money/2');
  ui.choose('region','alice');
  ui.navigate('#relationships/counselling');
  ui.choose('counselling','other');
  assert.equal(ui.run('state.answers.region'),'nt');
  ui.navigate('#relationships/assault');
  assert.equal(ui.run('state.answers.region'),'alice');
  assert.match(ui.root.innerHTML,/SARC – Alice Springs/);
  assert.equal(ui.location.hash,'#relationships/assault');
});

test('legacy question and result URLs retain their hash and use the current Next flow',()=>{
  const ui=renderer();
  ui.navigate('#money/q/region');
  assert.equal(ui.location.hash,'#money/q/region');
  assert.equal(ui.question(),'need');
  ui.choose('need','essentials');
  ui.choose('region','alice');
  ui.navigate('#money/results');
  assert.equal(ui.location.hash,'#money/results');
  assert.equal(ui.question(),undefined);
  assert.match(ui.root.innerHTML,/Lutheran Care/);
});

test('optional support preserves core contacts and adds only the selected preference',()=>{
  const ui=renderer();
  ui.navigate('#task/mental-health/0');
  ui.choose('age','26+');
  ui.choose('counselling','partner');
  ui.choose('region','alice');
  const originalIds=ui.run('JSON.stringify(currentResults().ids)');
  const originalDOM=ui.root.innerHTML;
  ui.prefer(['lgbtq']);
  assert.equal(ui.location.hash,'#task/mental-health/0');
  assert.equal(ui.run('JSON.stringify(currentResults().ids)'),originalIds);
  assert.equal(ui.root.innerHTML,originalDOM,'Preferences preserve the core contact and answer DOM');
  assert.match(ui.pageTargets['preference-results'].innerHTML,/QLife/);
  assert.match(ui.pageTargets['preference-results'].innerHTML,/qlife\.org\.au/);
  ui.prefer([]);
  assert.doesNotMatch(ui.pageTargets['preference-results'].innerHTML,/QLife/);
  assert.equal(ui.run('JSON.stringify(currentResults().ids)'),originalIds);
});

test('urgent-help and return links preserve an unfinished questionnaire and keyboard focus',()=>{
  const ui=renderer();
  ui.run("state={topicId:'care',answers:{need:'travel',connection:'serving',role:'other',dvaTravel:'no',remotePosting:'no',ntResidence:'yes'}}");
  ui.render('#care');
  assert.equal(ui.question(),'region');
  const hash=ui.location.hash, before=ui.run('JSON.stringify(state)');
  for(const id of ['urgent-help','main']){
    const jump=ui.jump(id);
    assert.equal(jump.prevented,true,'Page anchors do not navigate the router');
    assert.equal(jump.target.focused,true);
    assert.equal(jump.target.scrolled,true);
    assert.equal(ui.location.hash,hash);
    assert.equal(ui.run('JSON.stringify(state)'),before);
  }
  ui.choose('region','alice');
  assert.equal(ui.run('state.answers.role'),'other');
  assert.equal(ui.run('state.answers.dvaTravel'),'no');
  assert.equal(ui.location.hash,hash);
  assert.equal(ui.question(),'ntResidence','A local funding qualifier is asked after the town is known');
  ui.choose('ntResidence','yes');
  assert.equal(ui.question(),undefined);
  assert.match(ui.root.innerHTML,/PATS – Alice Springs/);
});

test('crisis task shows direct contact actions without unrelated questions',()=>{
  const ui=renderer();
  ui.navigate('#task/urgent-mental');
  assert.equal(ui.question(),undefined);
  assert.match(ui.root.innerHTML,/href="tel:000"/);
  assert.match(ui.root.innerHTML,/href="tel:131114"/);
  const page=readFileSync(new URL('../support.html',import.meta.url),'utf8');
  assert.match(page,/href="sms:0477131114"/);
  assert.doesNotMatch(ui.root.innerHTML,/data-question-id="(?:age|connection|region)"/);
});

test('human handoff retains food and Palmerston, a useful script and the original task link',()=>{
  const ui=renderer();
  ui.navigate('#task/money/2');
  ui.choose('region','palmerston');
  const primary=ui.run('currentResults().ids[0]');
  ui.click('request-help','#help');
  assert.match(ui.root.innerHTML,/Food or other essentials/);
  assert.match(ui.root.innerHTML,/Palmerston/);
  ui.choose('connection','former');
  assert.equal(ui.location.hash,'#help');
  assert.match(ui.root.innerHTML,/Support is needed in Palmerston/);
  assert.match(ui.root.innerHTML,/Could you help me find another service for this need/);
  assert.doesNotMatch(ui.root.innerHTML,/data-action="request-help"/);
  assert.match(ui.root.innerHTML,/href="#task\/money\/2" data-action="return-to-request"/);
  assert.equal(ui.run('currentResults().ids.includes('+JSON.stringify(primary)+')'),false);
  ui.click('return-to-request','#task/money/2');
  assert.equal(ui.run('state.entryKey'),'money/2');
  assert.equal(ui.run('state.answers.need'),'essentials');
  assert.equal(ui.run('state.answers.region'),'palmerston');
});

test('browser Back and Forward through a human handoff restore actual history snapshots',()=>{
  const ui=renderer();
  ui.navigate('#task/money/2');
  ui.choose('region','palmerston');
  const original=ui.run('JSON.stringify(state)');
  ui.click('request-help','#help');
  ui.back();
  assert.equal(ui.location.hash,'#task/money/2');
  assert.equal(ui.run('JSON.stringify(state)'),original);
  assert.match(ui.root.innerHTML,/Your support contacts/);
  ui.forward();
  assert.equal(ui.location.hash,'#help');
  assert.equal(ui.run('handoff.entryKey'),'money/2');
  assert.match(ui.root.innerHTML,/Palmerston/);
});

test('editing a committed region waits for Next and retains the selected need',()=>{
  const ui=renderer();
  ui.navigate('#task/money/2');
  ui.choose('region','palmerston');
  const previous=resultCatalogues(ui);
  ui.edit('region');
  ui.change('region','alice');
  assert.equal(ui.run('state.answers.region'),'palmerston');
  ui.submit();
  assert.equal(ui.location.hash,'#task/money/2');
  assert.equal(ui.run('state.answers.need'),'essentials');
  assert.equal(ui.run('state.answers.region'),'alice');
  assert.notDeepEqual(resultCatalogues(ui),previous);
  assert.match(ui.root.innerHTML,/Alice Springs/);
});

test('choosing a different task clears another person’s stale eligibility answers',()=>{
  const ui=renderer();
  ui.navigate('#task/mental-health/0');
  ui.choose('age','26+');
  ui.choose('counselling','member');
  ui.choose('region','alice');
  ui.navigate('#task/child-wellbeing/0');
  assert.equal(ui.run('state.answers.age'),'under18');
  assert.equal(ui.run('state.answers.counselling'),undefined);
  assert.equal(ui.question(),'childAge');
  assert.doesNotMatch(ui.root.innerHTML,/class="primary-service-heading"/);
  assert.doesNotMatch(ui.root.innerHTML,/data-action="edit-answer" data-question="age"/);
  ui.choose('childAge','5-11');
  assert.equal(ui.run('state.answers.region'),'alice');
  assert.equal(ui.question(),undefined);
});

test('browser Back preserves a named-link result despite the following hashchange event',()=>{
  const ui=renderer();
  ui.navigate('#mental/feelings');
  ui.choose('age','26+');
  ui.choose('counselling','member');
  ui.choose('region','darwin');
  const original=ui.run('JSON.stringify(state)');
  ui.navigate('#task/health/0');
  ui.back();
  assert.equal(ui.location.hash,'#mental/feelings');
  assert.equal(ui.run('JSON.stringify(state)'),original);
  assert.equal(ui.question(),undefined);
  assert.match(ui.root.innerHTML,/Open Arms/);
});

test('previous-question Back edits committed answers and browser Forward restores the later screen',()=>{
  const ui=renderer();
  ui.navigate('#task/mental-health/1');
  ui.choose('age','26+');
  assert.equal(ui.question(),'counselling');
  ui.click('previous-question');
  assert.equal(ui.question(),'age');
  assert.equal(ui.run('state.answers.age'),'26+');
  ui.back();
  assert.equal(ui.question(),'counselling');
  ui.forward();
  assert.equal(ui.question(),'age');
});

test('browser Back after Next shows the previous native radio selected and Forward restores contacts',()=>{
  const ui=renderer();
  ui.navigate('#task/money/2');
  ui.choose('region','alice');
  assert.equal(ui.question(),undefined);
  ui.back();
  assert.equal(ui.location.hash,'#task/money/2');
  assert.equal(ui.question(),'region');
  assert.equal(ui.selected(),'alice');
  assert.equal(ui.run('state.answers.region'),'alice');
  ui.forward();
  assert.equal(ui.question(),undefined);
  assert.match(ui.root.innerHTML,/Your support contacts/);
});
