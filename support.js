import {tasks, regions, ages, connections, counsellingConnections, fieldsFor, matchSupport} from './support-model.mjs?v=20260926-1';
import {services} from './support-catalog.mjs?v=20260926-1';
const root = document.getElementById('finder');
let choices = {};
let completed = false;
let started = false;
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.7" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>';
const link = (url,label,cls='') => `<a class="${cls}" href="${esc(url)}" rel="noreferrer">${esc(label)}</a>`;
const telephone = phone => `tel:${phone.replace(/\D/g,'')}`;
const valueLabel = (options, value) => options.find(option=>option[0]===value)?.[1] || '';
const taskById = id => tasks.find(task=>task.id===id) || (id==='help' ? {id:'help',title:'Not sure where to start',focuses:[]} : null);
function selectField(name,label,options,selected,hint='') {
  return `<div class="field"><label for="${name}">${esc(label)}</label><select name="${name}" id="${name}" required ${hint?`aria-describedby="${name}-hint"`:''}><option value="">Choose an option</option>${options.map(([value,text])=>`<option value="${value}" ${value===selected?'selected':''}>${esc(text)}</option>`).join('')}</select>${hint?`<small id="${name}-hint">${esc(hint)}</small>`:''}</div>`;
}
function focusHeading() {
  document.querySelector('main h1')?.focus();
  window.scrollTo({top:0,behavior:'instant'});
}
function showHome() {
  root.innerHTML=`<h1 tabindex="-1">Find support in the NT</h1><p class="intro">Free help and advice for Defence members, veterans and families.</p><ul class="task-grid" aria-label="What would help today?">${tasks.map(t=>`<li><a class="task-link" href="#${t.id}"><span><strong>${esc(t.title)}</strong><small>${esc(t.hint)}</small></span>${arrow}</a></li>`).join('')}</ul><p class="human-link"><a href="#help">Not sure where to start? Talk it through</a></p>`;
}
function showForm(task, preserveFocus=false) {
  const activeName = preserveFocus ? document.activeElement?.name : '';
  const f=fieldsFor(task.id,choices.focus,choices.age);
  root.innerHTML=`<nav class="back-nav" aria-label="Support navigation"><a href="#home">Back to all needs</a></nav><h1 tabindex="-1">${esc(task.title)}</h1><p class="intro">${task.id==='help'?'Find someone who can help you work out the next step.':'For you or someone you are helping.'}</p>${task.id==='safety'?'<p class="notice">For violence or sexual assault, <a href="tel:1800737732">call 1800RESPECT on 1800 737 732</a> or <a href="https://www.1800respect.org.au/" rel="noreferrer">use online chat</a>, 24/7. In immediate danger, call <a href="tel:000">000</a>.</p>':''}<form id="match-form"><div class="form-grid">${task.focuses.length?selectField('focus','What would help most?',task.focuses,choices.focus):''}${selectField('region','Where is support needed?',regions,choices.region,'For a move, choose the destination if it is known.')}${f.age?selectField('age','Age of the person needing support',ages,choices.age,'Choose their age, even if you are contacting a service for them.'):''}${f.connection?selectField('connection','Which describes the person or family?',connections,choices.connection):''}${f.counselling?selectField('counselling','Their connection to Defence',counsellingConnections,choices.counselling,'Full-time service includes at least one day of continuous full-time service or training. If unsure, choose the last option.'):''}</div><div class="form-actions"><button class="button" type="submit">Find support</button></div><p class="quiet">No name, contact details or sign-up needed.</p></form>`;
  if(activeName) document.getElementById(activeName)?.focus();
}
function actionBlock(s,primary) {
  const action=s.phone?link(telephone(s.phone),`Call ${s.phone}`,primary?'button':''):link(s.url,s.action||'Visit official website',primary?'button':'');
  return `${action}${s.phone?link(s.url,s.action||'Official website',primary?'official':''):''}`;
}
function serviceDetails(s,primary=false) {
  const h=primary?'h1':'h3';
  if(primary) return `<div class="result-layout"><section class="result-main"><${h} tabindex="-1">${esc(s.name)}</${h}><p class="area">${esc(s.area)}</p><p class="offer">${esc(s.offer)}</p><p class="fit"><strong>Who it helps:</strong> ${esc(s.audience)}</p><p class="cost"><strong>Cost:</strong> ${esc(s.cost)}</p></section><aside class="contact-panel" aria-label="Contact ${esc(s.name)}">${actionBlock(s,true)}${s.hours?`<p class="hours">${esc(s.hours)}</p>`:''}${s.extraUrl?link(s.extraUrl,s.extraLabel||'More ways to contact','official'):''}</aside></div>${s.access?`<p class="access">${esc(s.access)}</p>`:''}`;
  return `<article class="alternative"><div class="alt-heading"><h3>${esc(s.name)}</h3></div><p class="area">${esc(s.area)}</p><p>${esc(s.offer)}</p><p><strong>Who it helps:</strong> ${esc(s.audience)}</p><p><strong>Cost:</strong> ${esc(s.cost)}</p>${s.access?`<p>${esc(s.access)}</p>`:''}${s.hours?`<p class="quiet">${esc(s.hours)}</p>`:''}<div class="alt-actions">${actionBlock(s,false)}</div></article>`;
}
function showResult(task) {
  const result=matchSupport({...choices,task:task.id});
  const found=result.ids.map(id=>services[id]).filter(Boolean);
  if(!found.length){showForm(task);return;}
  const summary=[task.title,valueLabel(regions,choices.region), fieldsFor(task.id,choices.focus,choices.age).age ? valueLabel(ages,choices.age):''].filter(Boolean).join(' · ');
  const note=result.note?`<p class="notice">${esc(result.note).replace('1800 737 732','<a href="tel:1800737732">1800 737 732</a>').replace('call 000','call <a href="tel:000">000</a>')}</p>`:'';
  root.innerHTML=`<nav class="back-nav" aria-label="Support navigation"><a href="#${task.id}">Back to your choices</a><a href="#home">All needs</a></nav><div class="context"><p>${esc(summary)}</p><button class="text-button" data-action="edit">Change</button></div>${task.id==='safety'?note:''}${serviceDetails(found[0],true)}${task.id!=='safety'?note:''}<details class="say"><summary>What could I say when I contact them?</summary><p>“${esc(result.say)}”</p></details>${found.length>1?`<section class="alternate-list" aria-label="Other suitable options"><h2>Other ways to get help</h2>${found.slice(1).map(s=>serviceDetails(s)).join('')}</section>`:''}${task.id==='talk' && choices.counselling==='other' && !['suicide-loss','bereavement-help'].includes(choices.focus)?'<p class="eligibility-note"><a href="https://www.openarms.gov.au/who-we-help/eligibility" rel="noreferrer">Check other Open Arms eligibility pathways</a>, or ask its team on <a href="tel:1800011046">1800 011 046</a>.</p>':''}<div class="result-bottom"><a href="#help">Need help finding another option?</a><button class="text-button" data-action="print">Print these contacts</button></div>`;
}
// Old public links open the nearest task, then ask for current context.
const legacyNeeds={1:'moving',2:'moving',3:'children',4:'work',5:'work',6:'money',7:'money',8:'moving',9:'children',10:'children',11:'care',12:'children',13:'children',14:'children',15:'children',16:'care',17:'talk',18:'safety',19:'safety',20:'talk',21:'talk',22:'talk',23:'care',24:'care',25:'care',26:'care',27:'care',28:'connect',29:'connect',30:'help',31:'help',32:'help',33:'talk',34:'help',35:'help',36:'help',37:'work',38:'talk',39:'talk'};
function render() {
  let route=location.hash.slice(1).split('/');
  if(route[0]==='need') route=[legacyNeeds[route[1]]||'help'];
  if(route[0]==='situation') route=[{moving:'moving',apart:'moving',leaving:'work',concern:'home'}[route[1]]||'home'];
  const task=taskById(route[0]);
  if(!task) showHome();
  else {
    if(choices.task!==task.id){choices={task:task.id,region:choices.region||'',connection:choices.connection||''};completed=false;}
    if(route[1]==='results' && completed) showResult(task);else showForm(task);
  }
  document.title=`${task?task.title:'Find support in the NT'} | Lutheran Care`;
  if(started)focusHeading();
  started=true;
}
root.addEventListener('change',event=>{
  if(!event.target.matches('select'))return;
  const task=taskById(choices.task);
  const data=Object.fromEntries(new FormData(document.getElementById('match-form')));
  choices={...choices,...data};completed=false;
  if(['focus','age'].includes(event.target.name)){
    const f=fieldsFor(task.id,choices.focus,choices.age);
    if(!f.age)delete choices.age;
    if(!f.counselling)delete choices.counselling;
    if(!f.connection)delete choices.connection;
    showForm(task,true);
  }
});
root.addEventListener('submit',event=>{
  event.preventDefault();
  const form=event.target;if(!form.reportValidity())return;
  choices={...choices,...Object.fromEntries(new FormData(form))};completed=true;
  const resultHash=`#${choices.task}/results`;
  if(location.hash===resultHash){showResult(taskById(choices.task));focusHeading();}else location.hash=resultHash;
});
root.addEventListener('click',event=>{
  const action=event.target.closest('[data-action]')?.dataset.action;
  if(action==='edit'){location.hash=choices.task;}
  if(action==='print')window.print();
});
document.querySelector('.skip-link').addEventListener('click',event=>{event.preventDefault();document.getElementById('main').focus();document.getElementById('main').scrollIntoView();});
window.addEventListener('hashchange',render);
render();
