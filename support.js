import {reconcileQuestions,preserveChoicePosition} from './support-progressive.mjs?v=20261006-continuous-final';
import {journeys} from './support-journeys.mjs?v=20261006-content-scope-1';
import {topics, questionsFor, preferencesFor, getResults, legacyRoute} from './support-paths.mjs?v=20261006-continuous-final';
import {services,issues,appearances,regionLabels,routeMatchesRegion,safeURL,verifiedResults,routeContactURLs,primaryWebURL,routeWebActions,recoveryResults} from './support-routing.mjs?v=20261006-continuous-final';
import {verifiedDefence} from './support-verified-data.mjs?v=20261006-content-scope-1';
import {getFlowState, applyAnswer} from './support-flow.mjs?v=20261006-continuous-final';


const root = document.getElementById('finder');
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.7" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>';
// Keep providers out of a host iframe: some official services reject framing.
const isEmbedded = window.self !== window.top;
// Restore only our saved views; stale browser scroll positions must not hide a fresh flow.
if ('scrollRestoration' in history) history.scrollRestoration='manual';
const externalTarget = url => isEmbedded && /^https?:\/\//i.test(url);
const link = (url, label, className='') => {const allowed=url?.startsWith('#')?url:safeURL(url);return allowed?`<a class="${className}" href="${esc(allowed)}" rel="${externalTarget(allowed)?'noopener noreferrer':'noreferrer'}"${externalTarget(allowed)?` target="_blank" aria-label="${esc(label+' (opens in a new tab)')}"`:''}>${esc(label)}</a>`:esc(label);};
function prepareEmbeddedWebLinks() {
  if (!isEmbedded) return;
  // Static urgent links live outside the dynamic finder.
  document.querySelector('.page-shell')?.querySelectorAll('a[href]').forEach(anchor => {
    if (!externalTarget(anchor.getAttribute('href'))) return;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.setAttribute('aria-label',anchor.textContent.trim()+' (opens in a new tab)');
  });
}
const telephone = phone => `tel:${phone.replace(/\D/g,'')}`;
const topicById = id => topics.find(topic => topic.id === id) || (id === 'help' ? {id:'help',title:'Help finding support',hint:''} : null);
const ntRegions = new Set(['darwin','palmerston','katherine','alice','tennant','gove','remote']);
const topicAnswers = new Map();
const journeyAnswers = new Map();
const historyViews = new Map();
let viewCounter=0;
let restoredHistoryURL=null;
let activeJourney=null;
let state = {topicId:null,answers:{}};
let savedRegion = '';
let started = false;
let handoff = null;
const directoryChoice={need:'',region:''};

function copyAnswers(answers) {
  return {...answers,...(Array.isArray(answers.preferences) ? {preferences:[...answers.preferences]} : {})};
}
function rememberAnswers() {
  if (state.topicId) topicAnswers.set(state.topicId,copyAnswers(state.answers));
  if(state.entryKey)journeyAnswers.set(state.entryKey,copyAnswers(state.answers));
}
function focusHeading() {
  root.querySelector('h1')?.focus();
  window.scrollTo({top:0,behavior:'instant'});
}
function startAgain() {
  state = {topicId:null,answers:{}};
  topicAnswers.clear();
  journeyAnswers.clear();
  historyViews.clear();
  savedRegion = '';
  handoff = null;
  activeJourney = null;
  restoredHistoryURL = null;
  directoryChoice.need = '';
  directoryChoice.region = '';
  // Browser history keeps its URLs, but no pre-reset answer snapshot survives.
  // Keep viewCounter monotonic so a stale history key cannot name a new view.
  history.replaceState(null,'','#home');
  showHome();
  started = true;
  focusHeading();
}
function initialiseTopic(topicId, need) {
  if (state.topicId !== topicId) {
    rememberAnswers();
    state = {topicId,answers:copyAnswers(topicAnswers.get(topicId) || (savedRegion ? {region:savedRegion} : {}))};
  }
  if (need) {
    // A named related link starts its intended need, never another person's eligibility.
    state.answers = {...(savedRegion ? {region:savedRegion} : {}),need};
  }
}
function entryChoice(){
 const [id,index]=String(state.entryKey||'').split('/');
 return journeys.find(task=>task.id===id)?.choices[Number(index)];
}
function seedEntryAnswers(answers){
 const choice=entryChoice();
 return choice?{...answers,need:choice.need,...choice.answers}:answers;
}
function currentFlow() {
  let flow = getFlowState(state.topicId,seedEntryAnswers(state.answers),savedRegion);
  while(flow.nextQuestion?.options.length===1)flow=applyAnswer(state.topicId,flow.answers,flow.nextQuestion.id,flow.nextQuestion.options[0].value,savedRegion);
  state.answers = flow.answers;
  rememberAnswers();
  return flow;
}
function taskLink(task,compact=false) {
 return `<li><a class="${compact?'extra-task-link':'task-link'}" href="#task/${esc(task.id)}"><span><strong>${esc(task.title)}</strong>${!compact&&task.hint?`<small>${esc(task.hint)}</small>`:''}</span>${compact?'':arrow}</a></li>`;
}
const homeEntries=[{"title":"Moving for a posting","href":"#task/posting","tasks":["posting"]},{"title":"Managing time apart","href":"#task/absence","tasks":["absence"]},{"id":"housing","title":"Housing, bills and essentials","tasks":["housing-tonight","losing-housing","stable-housing","rental","money","home-help","pets","nt-preparedness","home-ownership"]},{"id":"health","title":"Health and wellbeing","tasks":["mental-health","health","disability","bereavement","addiction","aboriginal-wellbeing","inclusive","private","urgent-mental","nt-urgent-mental","distress-training"]},{"id":"relationships","title":"Relationships and safety","tasks":["safety","relationships","legal"]},{"id":"children","title":"Children and caring","tasks":["children-education","child-wellbeing","parenting","baby","moving-childcare","carers","older"]},{"id":"work","title":"Work, study and benefits","tasks":["work","transition","rehabilitation","budgeting","claims"]},{"id":"connection","title":"Defence and community support","tasks":["new-entry","family-info","family-advocacy","defence-aware","groups","language","pastoral"]}];
function showHome() {
 rememberAnswers();activeJourney=null;
 root.innerHTML=`<h1 tabindex="-1">NT Defence family support</h1><ul class="home-links home-entry-grid" aria-label="Choose the help you need">${homeEntries.map(entry=>`<li><a class="task-link" href="${esc(entry.href||'#start/'+entry.id)}"><span><strong>${esc(entry.title)}</strong></span>${arrow}</a></li>`).join('')}</ul><p class="human-link home-help"><a href="#help">Not sure where to start? Get help finding a service</a></p>`;
 document.title='NT Defence family support | Lutheran Care';
}
function showStartMenu(entry) {
 rememberAnswers();activeJourney=null;
 root.innerHTML=`<nav class="back-nav" aria-label="Support navigation"><a href="#home">All Defence help</a><button type="button" class="text-button" data-action="reset">Start again</button></nav><h1 tabindex="-1">${esc(entry.title)}</h1><ul class="home-links" aria-label="Choose the help you need">${entry.tasks.map(id=>taskLink(journeys.find(task=>task.id===id))).join('')}</ul>`;
 document.title=`${entry.title} | NT Defence family support | Lutheran Care`;
}

function showTaskMenu(task) {
 rememberAnswers();activeJourney=task;state={topicId:null,answers:{}};
 showFlow(null);rememberView();
}
function initialiseJourney(task,choice,key) {
 rememberAnswers(); activeJourney=task;
 if(state.entryKey!==key){
  state={topicId:choice.topicId,entryKey:key,answers:copyAnswers(journeyAnswers.get(key)||{...(savedRegion?{region:savedRegion}:{}),need:choice.need,...choice.answers})};

 }
}


function directoryCard(row,open=false) {
 const service=services[row.appearance_id];
 return `<details class="directory-card" id="record-${esc(row.appearance_id)}"${open?' open':''}><summary>${esc(row.display.name)} · ${esc(row.display.location)}</summary><div>${serviceDetails(service)}<p><strong>Related need:</strong> ${esc(row.issue_title)}</p>${row.issue_scope?`<p>${esc(row.issue_scope)}</p>`:''}<p>${link('#directory/'+row.appearance_id,'Link to these resource details')}</p></div></details>`;
}
function refreshDirectory(selectedId='') {
 const rows=appearances.filter(row=>(!directoryChoice.need||row.issue_id===directoryChoice.need)&&(!directoryChoice.region||routeMatchesRegion(row,directoryChoice.region)));
 document.getElementById('directory-count').textContent=`${rows.length} matching entries`;
 document.getElementById('directory-records').innerHTML=rows.map(row=>directoryCard(row,row.appearance_id===selectedId)).join('')||'<p>No resource entry matches both filters. Change the region or need, or <a href="#help">ask for help finding support</a>.</p>';
}
function showDirectory(selectedId='') {
 rememberAnswers();
 const selected=appearances.find(row=>row.appearance_id===selectedId);
 if(selected){directoryChoice.need=selected.issue_id;directoryChoice.region='';}
 root.innerHTML=`<nav class="back-nav" aria-label="Support navigation"><a href="#home">All help</a>${state.topicId?`<a href="#${esc(state.topicId)}">Back to your support choices</a>`:''}<button type="button" class="text-button" data-action="reset">Start again</button></nav><h1 tabindex="-1">Defence family resource details</h1><div class="directory-filters"><label for="directory-need">Need<select id="directory-need"><option value="">All needs</option>${issues.map(issue=>`<option value="${esc(issue.issue_id)}"${issue.issue_id===directoryChoice.need?' selected':''}>${esc(issue.title)}</option>`).join('')}</select></label><label for="directory-region">Region<select id="directory-region"><option value="">All published areas</option>${Object.entries(regionLabels).filter(([id])=>!['outside','remote'].includes(id)).map(([id,name])=>`<option value="${esc(id)}"${id===directoryChoice.region?' selected':''}>${esc(name)}</option>`).join('')}</select></label></div><p id="directory-count" class="directory-count" role="status" aria-live="polite"></p><div id="directory-records"></div><p class="quiet">Information checked 5 October 2026.</p>`;
 refreshDirectory(selectedId);
 document.title='Defence family resource details | NT Defence family support | Lutheran Care';
 if(selected)requestAnimationFrame(()=>{const record=document.getElementById('record-'+selected.appearance_id);record?.scrollIntoView({block:'start'});record?.querySelector('summary')?.focus({preventScroll:true});});
}
function safetyNotice(topic) {
  if (topic.id !== 'relationships' || !['unsafe','refuge','assault','misconduct','child-violence'].includes(state.answers.need)) return '';
  return `<p class="notice safety-note">For violence or sexual assault, <a href="tel:1800737732">1800RESPECT: 1800 737 732</a> or ${link('https://www.1800respect.org.au/','online chat')} is available 24/7. In immediate danger, call <a href="tel:000">000</a>.</p>`;
}
function questionMarkup(question) {
  const prefix = `question-${question.id==='journey-choice'?'task-'+activeJourney.id:state.topicId}-${question.id}`;
  const value=renderedAnswers()[question.id];
  const compact = question.options.every(option=>!option.detail && option.label.length<=26);
  return `<fieldset class="choice-fieldset flow-question" id="${prefix}" data-question-id="${esc(question.id)}" data-signature="${esc(prefix+JSON.stringify(question))}"${question.hint ? ` aria-describedby="${prefix}-hint"` : ''}><legend><h2>${esc(question.label)}</h2></legend>${question.hint ? `<p class="question-hint" id="${prefix}-hint">${esc(question.hint)}</p>` : ''}<div class="choice-list${compact ? ' choice-list-compact' : ''}">${question.options.map((option,i)=>`<label class="choice-row" for="${prefix}-${i}"><input type="radio" id="${prefix}-${i}" name="${esc(question.id)}" value="${esc(option.value)}"${value===option.value ? ' checked' : ''}${option.detail ? ` aria-describedby="${prefix}-detail-${i}"` : ''}><span><strong>${esc(option.label)}</strong>${option.detail ? `<small id="${prefix}-detail-${i}">${esc(option.detail)}</small>` : ''}</span></label>`).join('')}</div></fieldset>`;
}
function relatedMarkup(topic) {
  return !state.answers.need && topic.links?.length ? `<nav class="related-needs" aria-label="Related help">${topic.links.map(item=>link(item.href,item.label)).join('')}</nav>` : '';
}
const lines=value=>esc(value).replace(/\n/g,'<br>');
function phoneLabel(service,url){
 const number=url.slice(4);
 const published=(service.contact.match(/[+]?[0-9][0-9 ()-]{3,}[0-9]/g)||[]).find(text=>safeURL('tel:'+text.replace(/[^+0-9]/g,''))===url);
 if(published)return published.trim();
 if(/^1[38]00[0-9]{6}$/.test(number))return number.slice(0,4)+' '+number.slice(4,7)+' '+number.slice(7);
 if(/^0[0-9]{9}$/.test(number))return number.slice(0,2)+' '+number.slice(2,6)+' '+number.slice(6);
 if(/^13[0-9]{4}$/.test(number))return number.slice(0,2)+' '+number.slice(2);
 return number;
}
function actionBlock(service,primary) {
 const urls=routeContactURLs(service),phones=urls.filter(url=>url.startsWith('tel:')),emails=urls.filter(url=>url.startsWith('mailto:'));
 const messages=urls.filter(url=>url.startsWith('sms:')&&service.contact.replace(/\D/g,'').includes(url.replace(/\D/g,'')));
 const websites=routeWebActions(service);
 return `${phones.map((url,index)=>link(url,'Call '+phoneLabel(service,url),primary&&index===0?'button':'official')).join('')}${emails.map(url=>link(url,emails.length===1&&service.contact.toLowerCase().includes(url.slice(7).toLowerCase())?'Email this service':'Email '+url.slice(7),'official')).join('')}${messages.map(url=>link(url,'Text '+url.slice(4),'official')).join('')}${websites.map((item,index)=>link(item.url,item.label,primary&&!phones.length&&index===0?'button':'official')).join('')}`;
}

function chatOptions(){return '';}
function sourceDetails(service) {
 const urls=service.urls.filter(url=>safeURL(url)&&/^https?:/.test(url));
 return `<details class="service-source"><summary>Information checked ${esc(service.checked)}</summary><ul>${urls.map((url,index)=>`<li>${link(url,urls.length===1?'Official source':`Official source ${index+1}`)}</li>`).join('')}<li>${link('#directory/'+service.id,'Resource details for this need')}</li></ul></details>`;
}
function serviceDetails(service,primary=false,beforeAction='',chats='',nextAction='') {
 return `<article class="service-card${primary?' service-card-primary':' alternative'}"><div class="service-card-head"><h3${primary?' class="primary-service-heading"':''}>${esc(service.name)}</h3><p class="offer">${lines(service.offer)}</p><p class="area">${lines(service.area)}</p></div><div class="contact-panel" aria-label="Contact ${esc(service.name)}">${beforeAction}<div class="service-actions">${actionBlock(service,primary)}</div><p class="contact-details">${lines(service.contact)}</p>${nextAction}${primary?`<div id="chat-options">${chats}</div>`:chats}</div><div class="service-information"><p class="fit"><strong>Who can use it:</strong> ${lines(service.audience)}</p><p class="access"><strong>How to access it:</strong> ${lines(service.access)}</p></div>${sourceDetails(service)}</article>`;
}

function preferenceGroups(result) {
  const coreIds = new Set([...(result.ids || []), ...(result.moreIds || [])]);
  return (result.preferenceGroups || []).map(group => {
    const ids = [...new Set(group.ids || [])].filter(id => services[id] && !coreIds.has(id));
    if (!ids.length && !group.note) return '';
    return `<section class="preference-group"><h2>${esc(group.title)}</h2>${group.note ? `<p class="preference-note">${esc(group.note)}</p>` : ''}${ids.map(id => serviceDetails(services[id])).join('')}${group.link ? `<p>${link(group.link.href,group.link.label)}</p>` : ''}</section>`;
  }).join('');
}
function preferenceChoices(topic, result) {
  const options = preferencesFor(topic.id,state.answers);
  if (!options.length) return '';
  const selected = Array.isArray(state.answers.preferences) ? state.answers.preferences : [];
  return `<section class="support-preferences"><fieldset class="preference-fieldset"><legend>Support preferences (optional)</legend><div class="preference-list">${options.map((option,i) => `<label class="choice-row" for="preference-${i}"><input type="checkbox" id="preference-${i}" name="support-preference" value="${esc(option.value)}"${selected.includes(option.value) ? ' checked' : ''}${option.detail ? ` aria-describedby="preference-detail-${i}"` : ''}><span><strong>${esc(option.label)}</strong>${option.detail ? `<small id="preference-detail-${i}">${esc(option.detail)}</small>` : ''}</span></label>`).join('')}</div></fieldset><p id="preference-status" class="sr-only" role="status"></p><div id="preference-results">${preferenceGroups(result)}</div></section>`;
}
function answerSummary(topicId, answers) {
  return questionsFor(topicId,answers).filter(question => !(question.id === 'age' && answers.childAge)).map(question => question.options.find(option => option.value === answers[question.id])?.label).filter(Boolean).join(' · ');
}

function currentResults() {
 return state.topicId==='help'&&handoff?recoveryResults(handoff,state.answers):getResults(state.topicId,state.answers);
}
function changeChoicesLink(){
 const fixed=fixedQuestionIds();
 const choices=questionsFor(state.topicId,state.answers).some(q=>!fixed.has(q.id)&&state.answers[q.id]);
 if(choices)return '<a href="#support-answers" data-page-jump="support-answers">Change your choices</a>';
 return `<a href="${activeJourney&&activeJourney.choices.length>1?'#task/'+esc(activeJourney.id):'#home'}">Choose different help</a>`;
}
function resultsMarkup(topic) {
  const result = currentResults();
  const allIds = [...new Set(result.ids || [])].filter(id=>services[id]);
  const ids = allIds.slice(0,3);
  const more = [...new Set([...allIds.slice(3),...(result.moreIds || [])])].filter(id=>services[id] && !ids.includes(id));
  if (!ids.length) return `<h2 id="support-contacts-heading">Help finding a service</h2><p>No service matches these choices. Change your choices or ask for help finding another service.</p>${result.note ? `<p class="notice">${esc(result.note)}</p>` : ''}${topic.id!=='help' ? '<a href="#help" data-action="request-help">Find another way to get help</a>' : ''}`;
  const summary = topic.id==='help' && handoff ? handoff.summary : activeJourney ? questionsFor(topic.id,state.answers).filter(q=>!fixedQuestionIds().has(q.id)).map(q=>q.options.find(o=>o.value===state.answers[q.id])?.label).filter(Boolean).join(' · ') : result.contextLabel || answerSummary(topic.id,state.answers) || topic.title;
  const say = topic.id==='help' && handoff ? handoff.say : result.say;
  const note = result.note || result.preferenceLink ? `<p class="notice">${esc(result.note).replace(/1800 737 732/g,'<a href="tel:1800737732">1800 737 732</a>').replace(/call 000/g,'call <a href="tel:000">000</a>')}${result.preferenceLink ? ` ${link(result.preferenceLink.href,result.preferenceLink.label)}` : ''}</p>` : '';
  const nextAction = ids.length>1 || more.length ? '<a class="another-contact" href="#other-contacts" data-page-jump="other-contacts">Try another contact</a>' : topic.id!=='help' ? '<a class="another-contact" href="#help" data-action="request-help">Help finding another service</a>' : '';
  const noteBefore = result.noteBefore || (topic.id==='relationships' && ['unsafe','refuge','assault','misconduct','child-violence'].includes(state.answers.need));
  return `<div class="contacts-heading"><h2 id="support-contacts-heading">Contact a service</h2></div>${result.issueNotes?.filter(note=>note.text).map(note=>`<p class="quiet">${esc(note.text)}</p>`).join('')||''}${serviceDetails(services[ids[0]],true,noteBefore ? note : '',chatOptions(result,ids[0]),nextAction)}${!noteBefore ? note : ''}${say ? `<details class="say"><summary>What could I say when I contact them?</summary><p>“${esc(say)}”</p></details>` : ''}${ids.length>1 ? `<section class="alternate-list" id="other-contacts" tabindex="-1" aria-label="Other suitable options"><h2>Other ways to get help</h2>${ids.slice(1).map(id=>serviceDetails(services[id])).join('')}</section>` : ''}${more.length ? `<section class="more-services"${ids.length===1 ? ' id="other-contacts" tabindex="-1"' : ''}><h2>Other relevant contacts</h2>${more.map(id=>serviceDetails(services[id])).join('')}</section>` : ''}${preferenceChoices(topic,result)}<div class="result-bottom">${topic.id!=='help' ? '<a href="#help" data-action="request-help">Find another way to get help</a>' : ''}<button class="text-button" data-action="print">Print these contacts</button></div>`;
}
function fixedQuestionIds(){
 const [id,index]=String(state.entryKey||'').split('/');
 const choice=journeys.find(task=>task.id===id)?.choices[Number(index)];
 return choice?new Set(['need',...Object.keys(choice.answers||{})]):new Set();
}
function journeyQuestion() {
 return activeJourney?.choices.length>1 ? {
  id:'journey-choice',label:'What help do you need?',
  options:activeJourney.choices.map((choice,index)=>({value:String(index),label:choice.title}))
 } : null;
}
function visibleFlowQuestions(flow) {
 const fixed=fixedQuestionIds();
 return [...(journeyQuestion()?[journeyQuestion()]:[]),...flow.visibleQuestions.filter(q=>!fixed.has(q.id))];
}
function renderedAnswers() {
 const answers={...state.answers};
 if(state.entryKey)answers['journey-choice']=state.entryKey.split('/')[1];
 return answers;
}
function rememberView(push=false,url=location.href) {
 const key=`view-${++viewCounter}`;
 const focus=document.activeElement;
 historyViews.set(key,{url:new URL(url,location.href).href,state:{...state,answers:copyAnswers(state.answers)},journeyId:activeJourney?.id||null,savedRegion,handoff,focusId:root.contains(focus)?focus.id:'',scroll:window.scrollY});
 history[push?'pushState':'replaceState']({supportView:key},'',url);
}
function showFlow(topic) {
 const flow=topic?currentFlow():{visibleQuestions:[],complete:false,nextQuestion:null};
 const title=topic?.id==='help'&&handoff?'Find another suitable service':activeJourney?.title||topic?.title;
 const context=topic?.id==='help'&&handoff?`<p class="handoff-context">${esc(handoff.summary)}</p>`:'';
 root.innerHTML=`<nav class="back-nav" aria-label="Support navigation"><a href="#home">All Defence help</a>${topic?.id==='help'&&handoff?`<a href="${handoff.entryKey?'#task/'+handoff.entryKey:'#'+handoff.topicId}" data-action="return-to-request">Your original contacts</a>`:''}<button type="button" class="text-button" data-action="reset">Start again</button></nav><h1 tabindex="-1">${esc(title)}</h1>${context}<div id="flow-safety">${topic?safetyNotice(topic):''}</div><div id="support-answers" tabindex="-1"><form id="support-flow" aria-label="Your support choices" novalidate><div id="flow-questions">${visibleFlowQuestions(flow).map(questionMarkup).join('')}</div></form></div><p id="flow-status" class="sr-only" role="status" aria-live="polite"></p><div id="flow-related">${flowRelated(topic)}</div><section id="support-contacts" class="flow-results" aria-labelledby="support-contacts-heading" tabindex="-1"${flow.complete?'':' hidden'}>${flow.complete?resultsMarkup(topic):''}</section>`;
 document.title=`${title} | NT Defence family support | Lutheran Care`;
}
function flowRelated(topic) {
 const links=activeJourney?.relatedLinks||[];
 return `${topic?relatedMarkup(topic):''}${links.length?`<nav class="related-needs" aria-label="Related help">${links.map(item=>link(item.href,item.label)).join('')}</nav>`:''}`;
}
function focusStep(view) {
 const target=view?.focusId?document.getElementById(view.focusId):root.querySelector('h1');
 target?.focus({preventScroll:true});
 window.scrollTo({top:view?.scroll||0,behavior:'instant'});
}
function syncFlow(topic) {
 const flow=currentFlow();
 reconcileQuestions(root.querySelector('#flow-questions'),visibleFlowQuestions(flow),renderedAnswers(),questionMarkup);
 root.querySelector('#flow-safety').innerHTML=safetyNotice(topic);
 root.querySelector('#flow-related').innerHTML=flowRelated(topic);
 const contacts=root.querySelector('#support-contacts');
 contacts.hidden=!flow.complete;
 contacts.innerHTML=flow.complete?resultsMarkup(topic):'';
 root.querySelector('#flow-status').textContent=flow.complete?'Contacts updated below.':`${flow.nextQuestion.label} is shown below.`;
}
function selectJourney(selected) {
 const task=activeJourney,index=Number(selected.value),choice=task?.choices[index];
 if(!choice||selected.name!=='journey-choice')return;
 const key=`${task.id}/${index}`;
 if(state.entryKey===key)return;
 rememberView();
 const previous=entryChoice();
 const answers=state.topicId?copyAnswers(state.answers):copyAnswers(journeyAnswers.get(key)||(savedRegion?{region:savedRegion}:{}));
 for(const id of Object.keys(previous?.answers||{}))delete answers[id];
 rememberAnswers();
 state={topicId:choice.topicId,entryKey:key,answers:{...answers,need:choice.need,...choice.answers}};
 currentFlow();
 preserveChoicePosition(selected,()=>syncFlow(topicById(state.topicId)));
 rememberAnswers();rememberView(true,'#task/'+key);
}
function advanceQuestion(selected) {
 if(!selected||!root.querySelector('#flow-questions')?.contains(selected))return;
 if(selected.name==='journey-choice'){selectJourney(selected);return;}
 if(state.answers[selected.name]===selected.value)return;
 const before=currentFlow();
 if(!before.visibleQuestions.some(q=>q.id===selected.name&&q.options.some(o=>o.value===selected.value)))return;
 rememberView();
 const flow=applyAnswer(state.topicId,state.answers,selected.name,selected.value,savedRegion);
 state.answers=getFlowState(state.topicId,seedEntryAnswers(flow.answers),savedRegion).answers;
 if(selected.name==='region'&&state.answers.region===selected.value&&!(selected.value==='nt'&&ntRegions.has(savedRegion)))savedRegion=selected.value;
 preserveChoicePosition(selected,()=>syncFlow(topicById(state.topicId)));
 rememberAnswers();rememberView(true);
}

function render() {
  const rawHash = location.hash.slice(1);
  const segments = rawHash.split('/');
  if(segments[0]==='start'){
    const entry=homeEntries.find(item=>item.id&&item.id===segments[1]);
    if(entry)showStartMenu(entry);else showHome();
    if(started)focusHeading();started=true;return;
  }
  if(segments[0]==='task'){
    const task=journeys.find(t=>t.id===segments[1]);
    const index=segments[2]===undefined&&task?.choices.length===1?0:Number(segments[2]);
    const choice=task?.choices[index];
    if(task&&choice){initialiseJourney(task,choice,`${task.id}/${index}`);showFlow(topicById(choice.topicId));rememberView();}
    else if(task){showTaskMenu(task);}
    else{showHome();}
    if(started)focusHeading();started=true;return;
  }
  activeJourney=null;
  if(segments[0]==='directory'){
    showDirectory(segments[1]||'');
    if(started&&!segments[1])focusHeading();
    started=true;return;
  }
  let topic = topicById(segments[0]);
  let seededNeed;
  if (!topic && rawHash && segments[0]!=='home') {
    const legacy = legacyRoute(rawHash);
    if (legacy) { topic=topicById(legacy.topicId); seededNeed=legacy.need; }
  } else if (topic && segments[1] && !['q','results'].includes(segments[1])) {
    const legacy = legacyRoute(rawHash);
    seededNeed = legacy?.need || segments[1];
  }
  if (!topic) {
    showHome();
    document.title = 'NT Defence family support | Lutheran Care';
  } else {
    if(state.entryKey){rememberAnswers();state={topicId:null,answers:{}};}
    initialiseTopic(topic.id,seededNeed);
    // Old question/result links still open the appropriate topic. Answers are
    // memory-only; each choice records a restorable step on the same page.
    // Keep named deep links intact; eligibility answers stay only in memory.
    showFlow(topic);
    rememberView();
  }
  if (started) focusHeading();
  started = true;
}
root.addEventListener('change', event => {
  if(event.target.id==='directory-need'||event.target.id==='directory-region'){
    directoryChoice[event.target.id==='directory-need'?'need':'region']=event.target.value;
    refreshDirectory();return;
  }
  if (event.target.matches('input[name="support-preference"]')) {
    state.answers.preferences = [...root.querySelectorAll('input[name="support-preference"]:checked')].map(input=>input.value);
    rememberAnswers();rememberView();
    const result = getResults(state.topicId,state.answers);
    document.getElementById('preference-results').innerHTML = preferenceGroups(result);
    document.getElementById('chat-options').innerHTML = chatOptions(result,result.ids[0]);
    const count = document.getElementById('preference-results').querySelectorAll('.alternative').length;
    document.getElementById('preference-status').textContent = count ? `${count} additional ${count===1 ? 'contact' : 'contacts'} shown below. Your main contact stays the same.` : state.answers.preferences.length ? 'Preferences updated. Your main contact stays the same. Check any eligibility notes below.' : 'Your main contact stays the same. No additional contacts selected.';
    return;
  }
  if (!event.target.matches('input[type="radio"]') || !root.querySelector('#flow-questions')?.contains(event.target)) return;
  advanceQuestion(event.target);
});
root.addEventListener('submit', event => { event.preventDefault(); });
root.addEventListener('keydown', event => {
 if(event.key==='Enter'&&event.target.matches('input[type="radio"]')&&root.querySelector('#flow-questions')?.contains(event.target)){
  event.preventDefault();event.target.click();
 }
});
root.addEventListener('click', event => {
  if(event.target.closest('[data-action="reset"]')) {
    event.preventDefault();startAgain();return;
  }
  if (event.target.closest('[data-action="print"]')) window.print();
  const anchor = event.target.closest('a[href^="#"]');
  if (!anchor || anchor.dataset.pageJump || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (anchor.dataset.action==='request-help' && state.topicId!=='help') {
    const region = questionsFor(state.topicId,state.answers).find(question=>question.id==='region')?.options.find(option=>option.value===state.answers.region)?.label;
    const result = getResults(state.topicId,state.answers);
    handoff = {entryKey:state.entryKey,topicId:state.topicId,previousPrimaryId:result.ids[0],otherIds:[...result.ids.slice(1),...(result.moreIds || [])],answers:copyAnswers(state.answers),summary:answerSummary(state.topicId,state.answers)||topicById(state.topicId)?.title||'Support',say:`${result.say||'I would like help finding support.'}${region ? ` Support is needed in ${region}.` : ''} Could you help me find another service for this need?`};
    topicAnswers.set(state.topicId,copyAnswers(state.answers));
    topicAnswers.set('help',{...(state.answers.connection?{connection:state.answers.connection}:{}),...(savedRegion ? {region:savedRegion} : {}),...(state.answers.connection ? {connection:state.answers.connection} : {})});
  } else if (anchor.hash==='#help' && state.topicId!=='help') {
    handoff=null;
    topicAnswers.delete('help');
  }
  if (anchor.dataset.action==='return-to-request' && handoff) {
    topicAnswers.set(handoff.topicId,copyAnswers(handoff.answers));
  }
  event.preventDefault();
  if(anchor.hash!==location.hash)history.pushState(null,'',anchor.hash);
  render();
});
document.querySelector('.skip-link')?.addEventListener('click', event => {
  event.preventDefault();
  document.getElementById('main').focus();
  document.getElementById('main').scrollIntoView();
});
document.addEventListener('click', event => {
  const anchor = event.target.closest('a[data-page-jump]');
  if (!anchor) return;
  const target = document.getElementById(anchor.dataset.pageJump);
  if (!target) return;
  event.preventDefault();
  if (target.matches?.('details')) target.open=true;
  target.focus({preventScroll:true});
  target.scrollIntoView({block:'start'});
});
window.addEventListener('hashchange',()=>{
 if(restoredHistoryURL===location.href){restoredHistoryURL=null;return;}
 restoredHistoryURL=null;render();
});
window.addEventListener('popstate',event=>{
 const view=historyViews.get(event.state?.supportView);
 if(!view||view.url!==location.href) {
   // Same-URL question entries have no hashchange, so render them fresh too.
   restoredHistoryURL=location.href;
   render();
   return;
 }
 restoredHistoryURL=location.href;
 state={...view.state,answers:copyAnswers(view.state.answers)};activeJourney=journeys.find(t=>t.id===view.journeyId)||null;savedRegion=view.savedRegion;handoff=view.handoff;
 if(topicById(state.topicId)||activeJourney){showFlow(topicById(state.topicId));focusStep(view);}
});
let printOpened = [];
window.addEventListener('beforeprint', () => {
  printOpened = [...root.querySelectorAll('details.more-services:not([open])')];
  for (const details of printOpened) details.open=true;
});
window.addEventListener('afterprint', () => {
  for (const details of printOpened) details.open=false;
  printOpened=[];
});
render();
prepareEmbeddedWebLinks();
