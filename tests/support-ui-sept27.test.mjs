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
  let focused=null;
  const target = id => pageTargets[id] ||= {
    focused:false, scrolled:false, innerHTML:'', textContent:'',
    focus() { this.focused=true; focused=id; },
    scrollIntoView() { this.scrolled=true; },
    setAttribute(name,value) { this[name]=value; },
    matches() { return false; }
  };
  for(const id of ['main','urgent-help','preference-status','preference-results','chat-options','directory-count','directory-records'])target(id);
  pageTargets['preference-results'].querySelectorAll=()=>[...pageTargets['preference-results'].innerHTML.matchAll(/class="[^"]*\balternative\b[^"]*"/g)];
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
            matches:selector=>selector==='input[type="radio"]',
            closest:selector=>selector==='input[type="radio"]'?controls.find(input=>input.value===match[2]):null,
            click:()=>activateControl(controls.find(input=>input.value===match[2]))
          }));
        field={id:group[1],controls,contains:control=>controls.includes(control),querySelector:selector=>selector==='input:checked'?controls.find(input=>input.checked)||null:null};
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
  function nativeButton(action) {
    const match=html.match(new RegExp('<button\\b[^>]*data-action="'+action+'"[^>]*>([\\s\\S]*?)<\\/button>'));
    assert.ok(match,'The action must be a currently visible native button');
    assert.match(match[0],/type="button"/,'The action must not submit a form');
    const control={
      type:'button',dataset:{action},matches:()=>false,
      closest(selector) {
        const found=selector.match(/^\[data-action="([^"]+)"\]$/);
        return found?.[1]===action?control:null;
      },
      click() { handlers.click({target:control,preventDefault:()=>{}}); }
    };
    return control;
  }
  function pressButton(action,key) {
    const control=nativeButton(action);
    let prevented=false;
    handlers.keydown?.({target:control,key,preventDefault:()=>{prevented=true;}});
    // Native buttons activate on Enter or on the Space keyup. The renderer
    // should leave those defaults intact rather than implementing radio logic.
    if(!prevented&&key==='Enter')control.click();
    if(!prevented&&key===' ') {
      handlers.keyup?.({target:control,key,preventDefault:()=>{prevented=true;}});
      if(!prevented)control.click();
    }
    return prevented;
  }
  function filterDirectory(id,value) {
    handlers.change({target:{id,value}});
  }
  function radio(questionId,value) {
    assert.equal(field?.id,questionId,'Choose only the current rendered question');
    const control=field.controls.find(input=>input.value===value);
    assert.ok(control,'Choose an offered radio value');
    return control;
  }
  function activateControl(control) {
    const priorField=field, wasChecked=control.checked;
    assert.ok(priorField?.contains(control),'Activate a current rendered control');
    handlers.pointerdown?.({target:control});
    for(const input of priorField.controls)input.checked=input===control;
    handlers.click({target:control,preventDefault:()=>{}});
    // A native re-selection emits click only. New selections emit change after
    // click; that event may refer to a now-detached control after progression.
    if(!wasChecked)handlers.change({target:control});
  }
  const choose=(id,value)=>activateControl(radio(id,value));
  function change(questionId,value) {
    const control=radio(questionId,value);
    for(const input of field.controls)input.checked=input===control;
    handlers.change({target:control});
  }
  function key(questionId,value,key) {
    const control=radio(questionId,value);
    let prevented=false;
    handlers.keydown?.({target:control,key,preventDefault:()=>{prevented=true;}});
    // Real browsers leave an already checked radio unchanged on Space.
    // Only unchecked Space has a native click/change default.
    if(!prevented&&(key===' '||key==='Spacebar')&&!control.checked)activateControl(control);
    return prevented;
  }
  function submit() {
    let prevented=false;
    handlers.submit({target:{id:'support-flow'},preventDefault:()=>{prevented=true;}});
    assert.equal(prevented,true,'A form event cannot submit personal information');
  }
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
    question:()=>field?.id,selected:()=>field?.controls.find(input=>input.checked)?.value,next:()=>next,
    focus:()=>focused,key,nativeButton,pressButton,filterDirectory,radio,dispatchChange:control=>handlers.change({target:control}),historySize:()=>historyEntries.length};
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

test('a radio choice immediately commits the answer and shows contacts without Next',()=>{
  const ui=renderer();
  ui.navigate('#task/money/2');
  assert.equal(ui.question(),'region','The task already chose food and essentials');
  ui.choose('region','alice');
  assert.equal(ui.run('state.answers.region'),'alice');
  assert.equal(ui.location.hash,'#task/money/2');
  assert.equal(ui.question(),undefined);
  assert.match(ui.root.innerHTML,/Lutheran Care/);
  assert.match(ui.root.innerHTML,/Contact a service/);
  assert.match(ui.root.innerHTML,/class="answer-record"/);
  assert.doesNotMatch(ui.root.innerHTML,/<details class="answer-record"/);
  assert.match(ui.root.innerHTML,/<strong>Alice Springs<\/strong>/);
  assert.equal(ui.focus(),'contacts-heading');
  assert.doesNotMatch(ui.root.innerHTML,/id="flow-next"|type="submit"/);
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

test('legacy question and result URLs retain their hash and use the current immediate-choice flow',()=>{
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
  assert.match(ui.root.innerHTML,/Contact a service/);
  ui.forward();
  assert.equal(ui.location.hash,'#help');
  assert.equal(ui.run('handoff.entryKey'),'money/2');
  assert.match(ui.root.innerHTML,/Palmerston/);
});

test('editing a committed region immediately refreshes contacts and retains the selected need',()=>{
  const ui=renderer();
  ui.navigate('#task/money/2');
  ui.choose('region','palmerston');
  const previous=resultCatalogues(ui);
  ui.edit('region');
  ui.change('region','alice');
  assert.equal(ui.run('state.answers.region'),'alice');
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

test('browser Back after a choice shows the previous native radio selected and Forward restores contacts',()=>{
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
  assert.match(ui.root.innerHTML,/Contact a service/);
});

test('re-selecting the checked answer after Back needs no change event or Next button',()=>{
  const ui=renderer();
  ui.navigate('#task/money/2');
  ui.choose('region','alice');
  ui.back();
  assert.equal(ui.question(),'region');
  assert.equal(ui.selected(),'alice');
  ui.choose('region','alice');
  assert.equal(ui.question(),undefined);
  assert.equal(ui.run('state.answers.region'),'alice');
  assert.equal(ui.focus(),'contacts-heading');
});

test('keyboard choice advances once and Enter or Space can replay a preselected answer',()=>{
  const ui=renderer();
  ui.navigate('#task/mental-health/0');
  const oldAgeControl=ui.radio('age','26+');
  ui.change('age','26+');
  assert.equal(ui.question(),'counselling');
  assert.equal(ui.focus(),'question-heading');
  const historySize=ui.historySize();
  ui.dispatchChange(oldAgeControl);
  assert.equal(ui.question(),'counselling','Detached controls cannot advance the new screen');
  assert.equal(ui.historySize(),historySize);
  ui.choose('counselling','member');
  ui.choose('region','darwin');
  ui.back();
  assert.equal(ui.key('region','darwin','Enter'),true);
  assert.equal(ui.question(),undefined);
  ui.back();
  assert.equal(ui.key('region','darwin',' '),true,'Checked Space needs explicit activation');
  assert.equal(ui.question(),undefined);
});

test('editing patient role invalidates incompatible treatment qualifications immediately',()=>{
  const ui=renderer();
  ui.navigate('#task/health/3');
  ui.choose('connection','serving');
  ui.choose('role','other');
  ui.choose('dvaTravel','yes');
  assert.equal(ui.question(),undefined);
  ui.edit('role');
  ui.choose('role','member');
  assert.equal(ui.run('state.answers.dvaTravel'),undefined);
  assert.equal(ui.question(),'region');
  ui.choose('region','alice');
  ui.edit('role');
  ui.choose('role','other');
  assert.equal(ui.question(),'dvaTravel');
  assert.doesNotMatch(ui.root.innerHTML,/class="primary-service-heading"/);
});

test('a form event cannot advance an unanswered question or submit the page',()=>{
  const ui=renderer();
  ui.navigate('#task/money/2');
  const before=ui.run('JSON.stringify(state)');
  ui.submit();
  assert.equal(ui.question(),'region');
  assert.equal(ui.run('JSON.stringify(state)'),before);
});

test('Space on an unchecked radio retains native selection and advances immediately',()=>{
  const ui=renderer();
  ui.navigate('#task/money/2');
  assert.equal(ui.key('region','alice',' '),false,'Unchecked Space keeps the native default');
  assert.equal(ui.run('state.answers.region'),'alice');
  assert.equal(ui.question(),undefined);
  assert.equal(ui.focus(),'contacts-heading');
});

function assertRestarted(ui) {
  assert.equal(ui.location.hash,'#home','Start again removes the current choice URL');
  assert.equal(ui.focus(),'heading','Focus returns to the home heading');
  assert.equal(ui.question(),undefined);
  assert.deepEqual(JSON.parse(ui.run('JSON.stringify(state)')),{topicId:null,answers:{}});
  assert.equal(ui.run('topicAnswers.size + journeyAnswers.size + historyViews.size'),0,'No saved answers or old snapshots survive');
  assert.equal(ui.run('savedRegion'),'');
  for(const name of ['handoff','activeJourney','editingQuestion','restoredHistoryURL'])assert.equal(ui.run(name),null);
  assert.deepEqual(JSON.parse(ui.run('JSON.stringify(directoryChoice)')),{need:'',region:''});
  assert.equal(ui.run('history.state'),null,'The current history entry no longer names an answer snapshot');
  assert.doesNotMatch(ui.root.innerHTML,/id="support-contacts"|class="answer-record"|data-action="return-to-request"/);
}
function assertFreshQualifiers(ui) {
  for(const key of ['age','childAge','region','household','counselling','connection','role','dvaTravel','ntResidence','dependant','community','preferences']) {
    assert.equal(ui.run('state.answers['+JSON.stringify(key)+']'),undefined,'Old '+key+' must not return');
  }
}
function registerResetTests(site,fresh,plan) {
  test(site+': visible Start again from an edited question clears all remembered eligibility and regions',()=>{
    const ui=fresh();ui.navigate(plan.multistep);
    for(const step of plan.steps)ui.choose(...step);
    ui.navigate(plan.food);
    assert.equal(ui.question(),undefined,'The old local region is remembered before reset');
    ui.navigate(plan.multistep);
    assert.equal(ui.question(),undefined,'The old journey answers are remembered before reset');
    assert.ok(ui.run('topicAnswers.size')>=2);assert.ok(ui.run('journeyAnswers.size')>=2);
    ui.edit('age');
    assert.match(ui.root.innerHTML,/<nav class="back-nav"[^>]*>[\s\S]*data-action="reset">Start again<\/button><\/nav>/);
    ui.nativeButton('reset').click();
    assertRestarted(ui);
    ui.navigate(plan.multistep);
    assert.equal(ui.question(),plan.steps[0][0],'The original task starts with its first required question');
    assertFreshQualifiers(ui);
    assert.doesNotMatch(ui.root.innerHTML,/id="flow-next"/);
  });
  test(site+': Enter and Space activate the native Start again button once from results',()=>{
    for(const key of ['Enter',' ']) {
      const ui=fresh();ui.navigate(plan.multistep);
      for(const step of plan.steps)ui.choose(...step);
      assert.match(ui.root.innerHTML,/Contact a service/);
      assert.equal(ui.pressButton('reset',key),false,'Keyboard activation keeps the native button default');
      assertRestarted(ui);
      ui.navigate(plan.food);
      assert.equal(ui.question(),'region','The last saved town cannot silently prefill the next person');
      assertFreshQualifiers(ui);
    }
  });
  test(site+': Start again clears the recovery handoff and cannot reopen the original client request',()=>{
    const ui=fresh();ui.navigate(plan.food);ui.choose('region',plan.recoveryRegion);
    ui.click('request-help','#help');
    assert.ok(ui.run('handoff'));
    assert.match(ui.root.innerHTML,/data-action="return-to-request"/);
    ui.nativeButton('reset').click();assertRestarted(ui);
    ui.navigate('#help');
    assert.equal(ui.run('handoff'),null);
    assert.doesNotMatch(ui.root.innerHTML,/data-action="return-to-request"|class="handoff-context"/);
    assertFreshQualifiers(ui);
  });
  test(site+': Back and Forward through old same-URL steps cannot restore pre-reset qualifications',()=>{
    const ui=fresh();ui.navigate(plan.multistep);
    for(const step of plan.steps)ui.choose(...step);
    ui.back(); // Keep an old result in Forward history, then reset from its question.
    ui.nativeButton('reset').click();assertRestarted(ui);
    ui.back();
    assert.equal(ui.question(),plan.steps[0][0]);assertFreshQualifiers(ui);
    ui.back(); // The URL has not changed, so this exercises popstate without hashchange.
    assert.equal(ui.question(),plan.steps[0][0]);assertFreshQualifiers(ui);
    ui.forward();assert.equal(ui.question(),plan.steps[0][0]);assertFreshQualifiers(ui);
    ui.forward();assert.equal(ui.location.hash,'#home');assert.equal(ui.question(),undefined);
    ui.forward(); // The former result URL still exists, but its answer snapshot does not.
    assert.equal(ui.location.hash,plan.multistep);
    assert.equal(ui.question(),plan.steps[0][0]);assertFreshQualifiers(ui);
    ui.choose(...plan.steps[0]);
    assert.equal(ui.question(),plan.steps[1][0],'New choices still advance immediately');
    ui.back();assert.equal(ui.question(),plan.steps[0][0]);assert.equal(ui.selected(),plan.steps[0][1]);
    ui.forward();assert.equal(ui.question(),plan.steps[1][0],'New post-reset history remains usable');
  });
  test(site+': reset clears resource filters and named deep links later open fresh valid flows',()=>{
    const ui=fresh();ui.navigate(plan.multistep);
    for(const step of plan.steps)ui.choose(...step);
    ui.navigate('#directory');
    ui.filterDirectory('directory-region','alice');
    assert.equal(ui.run('directoryChoice.region'),'alice');
    ui.nativeButton('reset').click();assertRestarted(ui);
    ui.navigate(plan.named);
    assert.equal(ui.question(),plan.namedSteps[0][0]);
    assertFreshQualifiers(ui);
    for(const step of plan.namedSteps)ui.choose(...step);
    assert.equal(ui.question(),undefined);assert.match(ui.root.innerHTML,/Contact a service/);
  });
}

registerResetTests('legacy defence',renderer,{
  food:'#task/money/2',foodNeed:'essentials',
  multistep:'#task/mental-health/0',steps:[['age','26+'],['counselling','member'],['region','darwin']],
  named:'#mental/feelings',namedSteps:[['age','26+'],['counselling','member'],['region','darwin']],
  recoveryRegion:'palmerston'
});
test('legacy defence: Start again clears patient and treatment-cover eligibility before a new request',()=>{
  const ui=renderer();
  ui.navigate('#task/health/3');ui.choose('connection','serving');ui.choose('role','other');ui.choose('dvaTravel','yes');
  assert.equal(ui.question(),undefined);
  ui.nativeButton('reset').click();assertRestarted(ui);
  ui.navigate('#task/health/3');
  assert.equal(ui.question(),'connection');assertFreshQualifiers(ui);
});
