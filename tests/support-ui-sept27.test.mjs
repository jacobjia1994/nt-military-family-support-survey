import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

// Execute the shipped renderer against a small DOM/history double and a
// deterministic discovery boundary. Provider facts are tested independently
// in the audience discovery suites; real browser geometry is checked in QA.
const sites=['defence'];
const read=(site,file)=>readFileSync(new URL('../'+file,import.meta.url),'utf8');

function fixture() {
 const services={
  first:{id:'first',name:'Published first contact',offer:'Ask for suitable local help.',area:'NT-wide',audience:'Enquire about the programme requirements.',access:'Contact directly; a place is not promised.',checked:'2026-10-05',cost:'Ask about fees.',hours:'Contact hours are published by the service.',sourceIds:['first'],sources:['https://official.example/source','javascript:source()'],contactOptions:[{href:'tel:1800123456',label:'Call 1800 123 456',channel:'phone'},{href:'https://official.example/help',label:'Visit the official service',channel:'web'},{href:'javascript:collect()',label:'Unsafe action',channel:'web'}]},
  alice:{id:'alice',name:'Alice contact',offer:'Local enquiry.',area:'Alice Springs',audience:'Local programme conditions apply.',access:'Enquire directly.',checked:'2026-10-05',sources:['https://official.example/alice'],contactOptions:[{href:'mailto:help@official.example',label:'Email this service',channel:'email'}]},
  darwin:{id:'darwin',name:'Darwin contact',offer:'Local enquiry.',area:'Darwin',audience:'Local programme conditions apply.',access:'Enquire directly.',checked:'2026-10-05',sources:['https://official.example/darwin'],contactOptions:[{href:'sms:0400123456',label:'Text this service',channel:'text'}]},
  alternative:{id:'alternative',name:'Another published contact',offer:'Another relevant route.',area:'NT-wide',audience:'Confirm requirements.',access:'Use the published website.',checked:'2026-10-05',sources:['https://official.example/alternative'],contactOptions:[{href:'https://official.example/alternative',label:'Official enquiry',channel:'web'}]}
 };
 const journeys=[
  {id:'tonight',title:'A place to stay tonight',choices:[{topicId:'housing',need:'tonight',title:'A place to stay tonight'}]},
  {id:'food',title:'Food and practical help',choices:[{topicId:'everyday',need:'food',title:'Food and basic essentials'},{topicId:'everyday',need:'money',title:'Money and bills'}]},
  {id:'travel',title:'Travel for care',choices:[{topicId:'care',need:'travel',title:'Travel for care'}]}
 ];
 const region={id:'region',label:'Area',type:'radio',options:[{value:'',label:'Not sure'},{value:'darwin',label:'Darwin / Palmerston'},{value:'alice',label:'Alice Springs'}]};
 const calls=[];
 function discoveryFields(choice,facts={}) {
  if(choice.topicId==='help')return [region];
  if(choice.need==='money')return [region];
  if(choice.need==='travel')return [region,{id:'recipient',label:'Who is travelling?',type:'radio',options:[{value:'',label:'Not sure'},{value:'member',label:'The member'},{value:'partner',label:'Their partner'},{value:'other',label:'Someone else'}]},{id:'travelFunding',label:'Travel funding for this person',type:'radio',options:[{value:'',label:'Not sure'},{value:'dva',label:'DVA covers this travel'},{value:'no-dva',label:'DVA does not cover this travel'},{value:'other',label:'Another scheme covers this travel'}]},...(facts.recipient==='other'?[{id:'dvaTravel',label:'DVA travel cover',type:'radio',options:[{value:'',label:'Not sure'},{value:'yes',label:'Yes'},{value:'no',label:'No'}]}]:[])];
  return [region,{id:'composition',label:'Household',type:'radio',options:[{value:'',label:'Not sure'},{value:'one',label:'One person'},{value:'couple',label:'A couple without children'},{value:'family',label:'A household with children'},{value:'other',label:'Another situation'}]},...(facts.composition!=='family'?[{id:'age',label:facts.composition==='couple'?'Age of the youngest person in the couple':'Age',type:'number',min:0,max:120,step:1,hint:'Optional: age in whole years.'}]:[]),...(facts.composition==='one'?[{id:'gender',label:'Gender',type:'radio',options:[{value:'',label:'Not sure'},{value:'woman',label:'Woman'},{value:'man',label:'Man'},{value:'other',label:'Another gender'}]}]:[]),...(facts.region==='darwin'?[{id:'community',label:'Community',type:'radio',options:[{value:'',label:'Not sure'},{value:'local',label:'Published local catchment'}]}]:[])];
 }
 function discover(choice,facts={}) {
  calls.push({choice:{...choice},facts:{...facts}});
  if(choice.topicId!=='help'&&facts.region==='alice'&&facts.composition==='other')return {ids:[],moreIds:[],allIds:[],servicesById:services};
  const other=choice.need==='travel'&&['dva','other'].includes(facts.travelFunding)?[]:['alternative'];
  return {ids:['first',...(facts.region==='alice'?['alice']:facts.region==='darwin'?['darwin']:[])],moreIds:other,allIds:['first',...other,...(facts.region==='alice'?['alice']:facts.region==='darwin'?['darwin']:[])],servicesById:services,say:'Ask about the published programme conditions.'};
 }
 return {calls,config:{identity:'Audience-specific support',allHelp:'All support',journeys,home:[{title:'A place to stay tonight',href:'#task/tonight',tasks:['tonight']},{title:'Food and practical help',href:'#task/food',tasks:['food']},{title:'Travel for care',href:'#task/travel',tasks:['travel']}],services,discover,discoveryFields,contactsFor:s=>s.contactOptions,sourcesFor:s=>s.sources,legacyChoice:()=>null,directory:{title:'Resource details',entries:Object.values(services),needs:[{id:'housing',title:'Housing'},{id:'money',title:'Money'}],regions:{darwin:'Darwin',alice:'Alice Springs'},needMatches:(_s,id)=>id==='housing',regionMatches:(s,id)=>s.id===id,view:s=>s}}};
}

function renderer(site,{hash='#home',embedded=false}={}) {
 const handlers={},documentHandlers={},windowHandlers={},pageTargets={};
 const decode=value=>String(value).replace(/&(amp|lt|gt|quot|#39);/g,(_all,name)=>({'amp':'&','lt':'<','gt':'>','quot':'"','#39':"'"}[name]));
 const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
 const voidTags=new Set(['input','br','img','hr','meta','link']);
 let activeElement=null,window;
 class Element {
  constructor(tag,attributes={}){this.tag=tag;this.attributes=attributes;this.childNodes=[];this.parentNode=null;this.checked=Object.hasOwn(attributes,'checked');this.focusCalls=0;}
  get children(){return this.childNodes.filter(child=>child instanceof Element);}
  get firstElementChild(){return this.children[0]||null;}
  get id(){return this.attributes.id||'';}
  get name(){return this.attributes.name||'';}
  get type(){return this.attributes.type||'';}
  get value(){if(this._value!==undefined)return this._value;if(this.tag==='select')return this.children.find(c=>c.tag==='option'&&Object.hasOwn(c.attributes,'selected'))?.value||this.children.find(c=>c.tag==='option')?.value||'';return this.attributes.value||'';}
  set value(value){this._value=String(value);}
  get dataset(){const attr=key=>'data-'+String(key).replace(/[A-Z]/g,c=>'-'+c.toLowerCase());return new Proxy({},{get:(_target,key)=>this.attributes[attr(key)],set:(_target,key,value)=>{this.attributes[attr(key)]=String(value);return true;},deleteProperty:(_target,key)=>{delete this.attributes[attr(key)];return true;}});}
  get classList(){return {contains:name=>(this.attributes.class||'').split(/\s+/).includes(name)};}
  get hidden(){return Object.hasOwn(this.attributes,'hidden');}
  set hidden(value){if(value)this.attributes.hidden='';else delete this.attributes.hidden;}
  get open(){return Object.hasOwn(this.attributes,'open');}
  set open(value){if(value)this.attributes.open='';else delete this.attributes.open;}
  get hash(){return new URL(this.attributes.href||'',location.href).hash;}
  get innerHTML(){return this.childNodes.map(child=>typeof child==='string'?child:child.outerHTML).join('');}
  set innerHTML(value){if(this.contains(activeElement))activeElement=null;for(const child of this.children)child.parentNode=null;this.childNodes=parse(value,this);}
  get outerHTML(){const attributes={...this.attributes};if(this.tag==='input'){if(this.checked)attributes.checked='';else delete attributes.checked;}const attrs=Object.entries(attributes).map(([name,value])=>value===''?' '+name:' '+name+'="'+escape(value)+'"').join('');return '<'+this.tag+attrs+'>'+(voidTags.has(this.tag)?'':this.innerHTML+'</'+this.tag+'>');}
  get textContent(){return this.childNodes.map(child=>typeof child==='string'?decode(child):child.textContent).join('');}
  set textContent(value){this.childNodes=[escape(value)];}
  getAttribute(name){return this.attributes[name]??null;}
  setAttribute(name,value){this.attributes[name]=String(value);}
  removeAttribute(name){delete this.attributes[name];}
  matches(selector){
   let checked=false;if(selector.endsWith(':checked')){checked=true;selector=selector.slice(0,-8);}
   const attrs=[...selector.matchAll(/\[([^\]=~^$*|]+)(?:([\^$*]?=)"([^"]*)")?\]/g)];
   const plain=selector.replace(/\[[^\]]+\]/g,''),tag=plain.match(/^[a-z][\w-]*/i)?.[0],id=plain.match(/#([\w-]+)/)?.[1],classes=[...plain.matchAll(/\.([\w-]+)/g)].map(match=>match[1]);
   return (!tag||this.tag===tag)&&(!id||this.id===id)&&classes.every(name=>this.classList.contains(name))&&attrs.every(([,name,op,value])=>Object.hasOwn(this.attributes,name)&&(!op||op==='='&&this.attributes[name]===value||op==='^='&&this.attributes[name].startsWith(value)||op==='$='&&this.attributes[name].endsWith(value)||op==='*='&&this.attributes[name].includes(value)))&&(!checked||this.checked);
  }
  closest(selector){for(let node=this;node;node=node.parentNode)if(node.matches(selector))return node;return null;}
  contains(node){for(let current=node;current;current=current.parentNode)if(current===this)return true;return false;}
  querySelectorAll(selector){const parts=selector.split(/\s+/),found=[];const accepts=node=>{if(!node.matches(parts.at(-1)))return false;let ancestor=node.parentNode;for(let index=parts.length-2;index>=0;index--){while(ancestor&&!ancestor.matches(parts[index]))ancestor=ancestor.parentNode;if(!ancestor)return false;ancestor=ancestor.parentNode;}return true;};const visit=node=>{for(const child of node.children){if(accepts(child))found.push(child);visit(child);}};visit(this);return found;}
  querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
  insertBefore(node,before){node.remove();const index=before?this.childNodes.indexOf(before):this.childNodes.length;assert.ok(index>=0,'Insert before a live child');this.childNodes.splice(index,0,node);node.parentNode=this;}
  remove(){if(!this.parentNode)return;if(this.contains(activeElement))activeElement=null;const siblings=this.parentNode.childNodes;siblings.splice(siblings.indexOf(this),1);this.parentNode=null;}
  focus(){this.focusCalls++;activeElement=this;}
  scrollIntoView(){this.scrolled=true;}
  getBoundingClientRect(){const group=this.closest('.optional-field-group')||this.closest('fieldset');const index=group?.parentNode?.children.indexOf(group)||0;return {top:250+index*160-window.scrollY};}
  click(){if(this.type==='radio')activate(this);else handlers.click?.({target:this,preventDefault:()=>{}});}
  addEventListener(type,handler){handlers[type]=handler;}
 }
 function parse(markup,parent){const holder=new Element('fragment'),stack=[holder];for(const token of String(markup).match(/<[^>]+>|[^<]+/g)||[]){if(token.startsWith('</')){stack.pop();continue;}if(!token.startsWith('<')){stack.at(-1).childNodes.push(token);continue;}if(token.startsWith('<!'))continue;const tag=token.match(/^<([\w-]+)/)?.[1];if(!tag)continue;const attrs={};for(const match of token.slice(tag.length+1,-1).matchAll(/([^\s=]+)(?:="([^"]*)")?/g))attrs[match[1]]=decode(match[2]||'');const element=new Element(tag,attrs);element.parentNode=stack.at(-1);stack.at(-1).childNodes.push(element);if(!voidTags.has(tag)&&!token.endsWith('/>'))stack.push(element);}for(const child of holder.children)child.parentNode=parent;return holder.childNodes;}
 const root=new Element('div',{id:'finder'}),shell=new Element('div',{class:'page-shell'});shell.childNodes=[root];root.parentNode=shell;
 for(const id of ['main','urgent-help'])pageTargets[id]=new Element('section',{id});
 const getById=id=>id==='finder'?root:root.querySelector('#'+id)||pageTargets[id]||null;
 let href='https://example.test/support.html'+hash;
 const location={get href(){return href;},get hash(){return new URL(href).hash;},set hash(value){href=new URL(value,href).href;}};
 const entries=[{state:null,url:href}];let historyIndex=0;
 const history={scrollRestoration:'auto',get state(){return entries[historyIndex].state;},replaceState(state,_title,url){if(url)href=new URL(url,href).href;entries[historyIndex]={state,url:href};},pushState(state,_title,url){if(url)href=new URL(url,href).href;entries.splice(historyIndex+1);entries.push({state,url:href});historyIndex++;}};
 window={scrollY:0,addEventListener:(type,handler)=>{windowHandlers[type]=handler;},scrollTo:({top})=>{window.scrollY=top;},scrollBy:({top})=>{window.scrollY+=top;},print:()=>{}};window.self=window;window.top=embedded?{}:window;
 const document={title:'',get activeElement(){return activeElement;},getElementById:getById,querySelector:selector=>selector==='.page-shell'?shell:null,createElement(tag){const element=new Element(tag);if(tag==='template')Object.defineProperty(element,'content',{get:()=>element});return element;},addEventListener:(type,handler)=>{documentHandlers[type]=handler;}};
 const boundary=fixture(),forbidden=name=>()=>{throw new Error('Unexpected '+name+' access');};
 const context=vm.createContext({document,window,location,history,URL,Date,config:boundary.config,localStorage:new Proxy({},{get:forbidden('localStorage')}),sessionStorage:new Proxy({},{get:forbidden('sessionStorage')}),fetch:forbidden('fetch'),XMLHttpRequest:forbidden('XMLHttpRequest')});
 Object.defineProperty(context,'scrollY',{get:()=>window.scrollY});
 vm.runInContext(read(site,'support-progressive.mjs').replace(/^export /gm,''),context);
 vm.runInContext(read(site,'support-app.mjs').replace(/^import .*;\n/gm,'').replace(/^export /gm,''),context);
 vm.runInContext('createSupportApp(config)',context);
 function activate(control){const wasChecked=control.checked;control.focus();for(const input of root.querySelectorAll('input[type="radio"]'))if(input.name===control.name)input.checked=input===control;handlers.click?.({target:control,preventDefault:()=>{}});if(!wasChecked)handlers.change({target:control});}
 function navigate(hash){const a=root.querySelectorAll('a').find(node=>node.hash===hash)||new Element('a',{href:hash});handlers.click({target:a,preventDefault:()=>{}});}
 function group(id){return root.querySelectorAll('.optional-field-group').find(node=>node.dataset.fieldId===id);}
 function radio(name,value){const control=root.querySelectorAll('input[type="radio"]').find(node=>node.name===name&&node.value===value);assert.ok(control,'A currently offered radio must exist: '+name+'/'+value);return control;}
 function change(control,value){if(value!==undefined)control.value=value;control.focus();handlers.change({target:control});}
 function toggle(control,open=true){assert.ok(control,'Toggle a currently offered disclosure');control.open=open;handlers.toggle({target:control});}
 function traverse(offset){const next=historyIndex+offset;assert.ok(next>=0&&next<entries.length,'History entry exists');const oldHash=location.hash;historyIndex=next;href=entries[historyIndex].url;windowHandlers.popstate({state:history.state});if(oldHash!==location.hash)windowHandlers.hashchange({});}
 return {root,document,location,history,historySize:()=>entries.length,calls:boundary.calls,lastCall:()=>boundary.calls.at(-1),navigate,group,radio,choose:(name,value)=>activate(radio(name,value)),change,toggle,back:()=>traverse(-1),forward:()=>traverse(1),active:()=>activeElement,scroll:()=>window.scrollY,
  key(control,key){let prevented=false;control.focus();handlers.keydown({target:control,key,preventDefault:()=>{prevented=true;}});if(!prevented&&key===' ')control.click();return prevented;},
  dispatchChange:control=>handlers.change({target:control}),
  reset(){const button=root.querySelector('button[data-action="reset"]');assert.ok(button);assert.equal(button.type,'button');button.click();},
  submit(){let prevented=false;handlers.submit({preventDefault:()=>{prevented=true;}});return prevented;},
  pageJump(id){const a=new Element('a',{'data-page-jump':id,href:'#'+id});documentHandlers.click({target:a,preventDefault:()=>{}});return pageTargets[id];}
 };
}

for(const site of sites){
 test(site+': a concrete task shows useful contacts before any profile detail is supplied',()=>{
  const ui=renderer(site,{hash:'#task/tonight'});
  assert.equal(ui.lastCall().choice.need,'tonight');assert.deepEqual(ui.lastCall().facts,{});
  assert.equal(ui.root.querySelector('#support-contacts').hidden,false);
  assert.ok(ui.root.querySelectorAll('.service-card').length>=1);
  assert.equal(ui.root.querySelector('#narrow-contacts').open,false);
  assert.ok(ui.group('composition'));assert.ok(ui.group('age'));
  assert.doesNotMatch(ui.root.innerHTML,/flow-next|type="submit"|data-action="edit-answer"/);
 });
 test(site+': choosing a task detail changes contacts immediately and retains every task option',()=>{
  const ui=renderer(site,{hash:'#task/food'}),controls=ui.root.querySelectorAll('input[name="task-choice"]');
  assert.equal(ui.calls.length,0,'An unspecified task meaning may ask what help is wanted');
  assert.equal(ui.root.querySelector('#support-contacts').hidden,true);
  ui.choose('task-choice','0');assert.equal(ui.lastCall().choice.need,'food');assert.deepEqual(ui.lastCall().facts,{});
  assert.deepEqual(ui.root.querySelectorAll('input[name="task-choice"]'),controls);
  assert.equal(ui.active(),controls[0]);
  ui.choose('task-choice','1');assert.equal(ui.lastCall().choice.need,'money');
  assert.deepEqual(ui.root.querySelectorAll('input[name="task-choice"]'),controls);assert.equal(ui.active(),controls[1]);
  assert.equal(ui.root.querySelectorAll('.service-card').length>=1,true);
  assert.equal(ui.root.querySelector('#narrow-contacts').hidden,true,'No redundant profile panel is shown when only area applies');
 });
 test(site+': area is one directly editable control, and unknown is passed through as unknown',()=>{
  const ui=renderer(site,{hash:'#task/tonight'}),area=ui.root.querySelector('#discovery-area');
  assert.equal(ui.root.querySelectorAll('select[name="region"]').length,1);
  assert.equal(ui.root.querySelectorAll('input[name="region"]').length,0);
  ui.change(area,'alice');assert.equal(ui.lastCall().facts.region,'alice');assert.match(ui.root.textContent,/Alice contact/);
  ui.change(area,'');assert.equal(ui.lastCall().facts.region,undefined);assert.deepEqual(ui.lastCall().facts,{});
  assert.equal(ui.root.querySelector('#discovery-area'),area);assert.equal(ui.active(),area);
 });
 test(site+': optional household choices are neutral; gender and exact age remain separate',()=>{
  const ui=renderer(site,{hash:'#task/tonight'});ui.toggle(ui.root.querySelector('#narrow-contacts'));ui.toggle(ui.group('composition'));
  const options=ui.group('composition').querySelectorAll('input');
  assert.deepEqual(options.map(input=>input.value),['','one','couple','family','other']);
  assert.doesNotMatch(ui.group('composition').textContent,/single (man|woman)|16.?25/i);
  ui.choose('composition','one');assert.ok(ui.group('gender'));assert.equal(ui.group('age').querySelector('input').type,'number');
  ui.toggle(ui.group('gender'));ui.choose('gender','woman');assert.equal(ui.lastCall().facts.gender,'woman');
  ui.choose('composition','couple');assert.equal(ui.lastCall().facts.gender,undefined);assert.match(ui.group('age').textContent,/youngest person in the couple/);
 });
 test(site+': once an optional group is used, all of its options stay open and retain native focus',()=>{
  const ui=renderer(site,{hash:'#task/tonight'});ui.toggle(ui.root.querySelector('#narrow-contacts'));ui.toggle(ui.group('composition'));
  const group=ui.group('composition'),controls=group.querySelectorAll('input'),one=ui.radio('composition','one');
  ui.choose('composition','one');assert.equal(ui.group('composition'),group);assert.equal(group.open,true);assert.deepEqual(group.querySelectorAll('input'),controls);assert.equal(ui.active(),one);
  ui.choose('composition','');assert.equal(ui.group('composition'),group);assert.equal(group.open,true,'Clearing an answer does not collapse the used group');assert.deepEqual(group.querySelectorAll('input'),controls);assert.equal(ui.lastCall().facts.composition,undefined);
  ui.toggle(group,false);assert.equal(group.open,false,'Only an explicit close collapses the used group');
 });
 test(site+': invalid age cannot replace the current safe result or silently become an age band',()=>{
  const ui=renderer(site,{hash:'#task/tonight'});ui.toggle(ui.root.querySelector('#narrow-contacts'));ui.toggle(ui.group('age'));
  const age=ui.group('age').querySelector('input[type="number"]');ui.change(age,'18');assert.equal(ui.lastCall().facts.age,'18');
  for(const invalid of ['16.5','-1','121','16-25']){const before=ui.calls.length;ui.change(age,invalid);assert.equal(ui.calls.length,before);assert.equal(age.getAttribute('aria-invalid'),'true');assert.equal(ui.lastCall().facts.age,'18');}
  ui.change(age,'');assert.equal(ui.lastCall().facts.age,undefined);assert.equal(age.getAttribute('aria-invalid'),null);assert.equal(ui.group('age').open,true);
 });
 test(site+': composition and recipient changes discard qualifications for the previous person',()=>{
  const ui=renderer(site,{hash:'#task/tonight'});ui.choose('composition','one');const age=ui.group('age').querySelector('input');ui.change(age,'17');ui.choose('gender','woman');
  const stale=ui.radio('gender','woman');ui.choose('composition','family');assert.equal(ui.lastCall().facts.age,undefined);assert.equal(ui.lastCall().facts.gender,undefined);assert.equal(ui.group('age'),undefined);assert.equal(ui.root.contains(stale),false);
  const before=ui.calls.length;ui.dispatchChange(stale);assert.equal(ui.calls.length,before,'A detached qualifier cannot alter the new person');
  const travel=renderer(site,{hash:'#task/travel'});travel.choose('recipient','other');travel.choose('dvaTravel','yes');const oldCover=travel.radio('dvaTravel','yes');travel.choose('recipient','member');assert.equal(travel.lastCall().facts.dvaTravel,undefined);assert.equal(travel.root.contains(oldCover),false);
 });
 test(site+': changing the patient clears their travel funding even when the funding control still applies',()=>{
  const ui=renderer(site,{hash:'#task/travel'});ui.choose('recipient','member');ui.toggle(ui.root.querySelector('#narrow-contacts'));ui.toggle(ui.group('travelFunding'));ui.choose('travelFunding','dva');
  assert.equal(ui.lastCall().facts.travelFunding,'dva');assert.equal(ui.root.querySelector('[data-service-id="alternative"]'),null,'A covered travel claim removes the alternative funding route');
  const funding=ui.group('travelFunding');ui.choose('recipient','partner');
  assert.equal(ui.lastCall().facts.recipient,'partner');assert.equal(ui.lastCall().facts.travelFunding,undefined,'The new patient does not inherit the former patient funding');
  assert.equal(ui.group('travelFunding'),funding,'This regression occurs even when the same control stays offered');assert.equal(funding.open,true);
  assert.ok(ui.root.querySelector('[data-service-id="alternative"]'),'The alternative navigation is restored for unknown cover');
 });
 test(site+': changing area removes a named community before calculating the new route',()=>{
  const ui=renderer(site,{hash:'#task/tonight'}),area=ui.root.querySelector('#discovery-area');ui.change(area,'darwin');ui.choose('community','local');assert.equal(ui.lastCall().facts.community,'local');
  const stale=ui.radio('community','local');ui.change(area,'alice');assert.equal(ui.lastCall().facts.community,undefined);assert.equal(ui.root.contains(stale),false);assert.equal(ui.lastCall().facts.region,'alice');
 });
 test(site+': repeated native activation is idempotent and Space retains its native default',()=>{
  const ui=renderer(site,{hash:'#task/tonight'}),one=ui.radio('composition','one');ui.choose('composition','one');const calls=ui.calls.length,history=ui.historySize();
  ui.choose('composition','one');assert.equal(ui.calls.length,calls);assert.equal(ui.historySize(),history);
  assert.equal(ui.key(one,'Enter'),true);assert.equal(ui.calls.length,calls);assert.equal(ui.active(),one);
  assert.equal(ui.key(one,' '),false);assert.equal(ui.calls.length,calls);assert.equal(ui.historySize(),history);
 });
 test(site+': Back and Forward restore immutable refinement snapshots and visible opened groups',()=>{
  const ui=renderer(site,{hash:'#task/tonight'});ui.toggle(ui.root.querySelector('#narrow-contacts'));ui.toggle(ui.group('composition'));ui.choose('composition','one');ui.toggle(ui.group('age'));ui.change(ui.group('age').querySelector('input'),'18');
  const selected={...ui.lastCall().facts};ui.back();assert.equal(ui.lastCall().facts.age,undefined);assert.equal(ui.lastCall().facts.composition,'one');
  assert.equal(ui.group('composition').open,true);assert.equal(ui.group('age').open,true,'Opening a group remains in the pre-answer view');
  ui.forward();assert.deepEqual(ui.lastCall().facts,selected);assert.equal(ui.group('age').querySelector('input').value,'18');assert.equal(ui.group('age').open,true);
  ui.navigate('#task/food');ui.back();assert.deepEqual(ui.lastCall().facts,selected,'Paired popstate/hashchange does not overwrite the restored task');
 });
 test(site+': no-results recovery keeps the original task for an explicit return and avoids a loop',()=>{
  const ui=renderer(site,{hash:'#task/tonight'});ui.change(ui.root.querySelector('#discovery-area'),'alice');ui.choose('composition','other');
  assert.equal(ui.root.querySelectorAll('.service-card').length,0);assert.match(ui.root.textContent,/No suitable contact/);
  ui.navigate('#help');assert.equal(ui.lastCall().choice.topicId,'help');assert.equal(ui.lastCall().facts.region,'alice');assert.equal(ui.lastCall().facts.composition,undefined);
  assert.ok(ui.root.querySelector('.return-original'));assert.equal(ui.root.querySelector('.request-help'),null);
  ui.navigate('#task/tonight/0');assert.equal(ui.lastCall().choice.need,'tonight');assert.equal(ui.lastCall().facts.composition,'other');assert.equal(ui.root.querySelectorAll('.service-card').length,0);
 });
 test(site+': directory no-results offers clear filters and a real help route',()=>{
  const ui=renderer(site,{hash:'#directory'});ui.change(ui.root.querySelector('#directory-need'),'money');ui.change(ui.root.querySelector('#directory-region'),'alice');
  assert.match(ui.root.textContent,/No entry is listed for both filters/);assert.ok(ui.root.querySelector('.clear-filters'));assert.ok(ui.root.querySelector('a[href="#help"]'));
  ui.navigate('#directory');assert.equal(ui.root.querySelector('#directory-need').value,'');assert.equal(ui.root.querySelector('#directory-region').value,'');assert.ok(ui.root.querySelectorAll('.directory-card').length>0);
 });
 test(site+': Start again clears qualifications, recovery, filters and snapshots even in old history',()=>{
  const ui=renderer(site);ui.navigate('#task/tonight');ui.change(ui.root.querySelector('#discovery-area'),'alice');ui.choose('composition','one');ui.change(ui.group('age').querySelector('input'),'18');ui.navigate('#help');assert.ok(ui.root.querySelector('.return-original'));
  ui.reset();assert.equal(ui.location.hash,'#home');assert.equal(ui.active().tag,'h1');assert.equal(ui.history.state,null);assert.equal(ui.root.querySelector('.return-original'),null);
  ui.back();assert.deepEqual(ui.lastCall().facts,{});assert.equal(ui.root.querySelector('#discovery-area').value,'');
  ui.forward();assert.equal(ui.location.hash,'#home');ui.navigate('#help');assert.deepEqual(ui.lastCall().facts,{});assert.equal(ui.root.querySelector('.return-original'),null);
  ui.navigate('#directory');ui.change(ui.root.querySelector('#directory-need'),'money');ui.reset();ui.navigate('#directory');assert.equal(ui.root.querySelector('#directory-need').value,'');assert.equal(ui.root.querySelector('#directory-region').value,'');
 });
 test(site+': visible cards retain programme conditions, cost/hours and safe source/contact actions',()=>{
  const ui=renderer(site,{hash:'#task/tonight'}),cards=ui.root.querySelectorAll('.service-card');
  for(const card of cards){assert.ok(card.querySelector('h3').textContent.trim());assert.match(card.querySelector('.fit').textContent,/Who can use it:/);assert.match(card.querySelector('.access').textContent,/How to access it:/);assert.match(card.querySelector('.service-source summary').textContent,/Information checked/);assert.ok(card.querySelector('.service-source a'));for(const a of card.querySelectorAll('.service-actions a'))assert.match(a.getAttribute('href'),/^(tel:|sms:|mailto:|https?:\/\/)/);}
  assert.match(cards[0].querySelector('.cost').textContent,/Ask about fees/);assert.match(cards[0].querySelector('.hours').textContent,/Contact hours/);assert.doesNotMatch(ui.root.innerHTML,/javascript:|Unsafe action/);
  const other=ui.root.querySelector('#other-options');assert.ok(other);assert.equal(other.open,false);assert.match(other.textContent,/Another published contact/);
 });
 test(site+': embedded web actions open separately while telephone and in-page actions keep native targets',()=>{
  const ui=renderer(site,{hash:'#task/tonight',embedded:true});
  for(const a of ui.root.querySelectorAll('a')){if(/^https?:/.test(a.getAttribute('href'))){assert.equal(a.getAttribute('target'),'_blank');assert.equal(a.getAttribute('rel'),'noopener noreferrer');assert.match(a.getAttribute('aria-label'),/opens in a new tab/);}else assert.equal(a.getAttribute('target'),null);}
 });
 test(site+': emergency page jumps and prevented submission retain the current contacts',()=>{
  const ui=renderer(site,{hash:'#task/tonight'}),before=ui.calls.length,url=ui.location.href;
  const urgent=ui.pageJump('urgent-help');assert.equal(ui.active(),urgent);assert.equal(urgent.scrolled,true);assert.equal(ui.location.href,url);assert.equal(ui.calls.length,before);
  assert.equal(ui.submit(),true);assert.equal(ui.calls.length,before);
 });
 test(site+': shipped runtime uses discovery without old flow gates or persistent collection',()=>{
  const bootstrap=read(site,'support.js'),app=read(site,'support-app.mjs');
  assert.match(bootstrap,/support-discovery\.mjs/);assert.match(bootstrap,/createSupportApp/);
  assert.doesNotMatch(bootstrap,/support-flow\.mjs|support-paths\.mjs/);
  assert.doesNotMatch(app,/getFlowState|currentFlow|nextQuestion|\.complete\b|verifiedResults|localStorage|sessionStorage|indexedDB|navigator\.sendBeacon|XMLHttpRequest|\bfetch\s*\(/);
 });
}
