import {topics, questionsFor, preferencesFor, getResults, legacyRoute} from './support-paths.mjs?v=20261005-1';
import {services,issues,appearances,regionLabels,routeMatchesRegion,safeURL,verifiedResults,routeContactURLs,primaryWebURL,recoveryResults} from './support-routing.mjs?v=20261005-1';
import {verifiedDefence} from './support-verified-data.mjs?v=20261005-1';
import {getFlowState, applyAnswer} from './support-flow.mjs?v=20261005-1';


const root = document.getElementById('finder');
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.7" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>';
const link = (url, label, className='') => {const allowed=url?.startsWith('#')?url:safeURL(url);return allowed?`<a class="${className}" href="${esc(allowed)}" rel="noreferrer">${esc(label)}</a>`:esc(label);};
const telephone = phone => `tel:${phone.replace(/\D/g,'')}`;
const topicById = id => topics.find(topic => topic.id === id) || (id === 'help' ? {id:'help',title:'Help finding support',hint:''} : null);
const ntRegions = new Set(['darwin','palmerston','katherine','alice','tennant','gove','remote']);
const topicAnswers = new Map();
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
}
function focusHeading() {
  root.querySelector('h1')?.focus();
  window.scrollTo({top:0,behavior:'instant'});
}
function initialiseTopic(topicId, need) {
  if (state.topicId !== topicId) {
    rememberAnswers();
    state = {topicId,answers:copyAnswers(topicAnswers.get(topicId) || (savedRegion ? {region:savedRegion} : {}))};
  }
  if (need && state.answers.need !== need) {
    // A named related link starts its intended need, never another person's eligibility.
    state.answers = {...(savedRegion ? {region:savedRegion} : {}),need};
  }
}
function currentFlow() {
  const flow = getFlowState(state.topicId,state.answers,savedRegion);
  state.answers = flow.answers;
  rememberAnswers();
  return flow;
}
function showHome() {
  rememberAnswers();
  root.innerHTML = `<h1 tabindex="-1">NT Defence family support</h1><p class="intro">Support for Defence members, veterans and families.</p><ul class="task-grid" aria-label="Choose the help you need">${topics.map(topic=>`<li><a class="task-link" href="#${topic.id}"><span><strong>${esc(topic.title)}</strong><small>${esc(topic.hint)}</small></span>${arrow}</a></li>`).join('')}</ul><p class="human-link"><a href="#help">Not sure where to start?</a></p><p class="human-link"><a href="#directory">Browse resource details</a></p>`;
}

function directoryCard(row,open=false) {
 const service=services[row.appearance_id];
 return `<details class="directory-card" id="record-${esc(row.appearance_id)}"${open?' open':''}><summary>${esc(row.display.name)} · ${esc(row.display.location)}</summary><div>${serviceDetails(service)}<p><strong>Related need:</strong> ${esc(row.issue_title)}</p>${row.issue_scope?`<p>${esc(row.issue_scope)}</p>`:''}<p>${link('#directory/'+row.appearance_id,'Link to these resource details')}</p></div></details>`;
}
function refreshDirectory(selectedId='') {
 const rows=appearances.filter(row=>(!directoryChoice.need||row.issue_id===directoryChoice.need)&&(!directoryChoice.region||routeMatchesRegion(row,directoryChoice.region)));
 const routeCount=new Set(rows.map(row=>row.route_id)).size;
 document.getElementById('directory-count').textContent=`Showing ${rows.length} issue-specific entries for ${routeCount} service routes. Check the published audience and access rules in each entry. No live availability is supplied.`;
 document.getElementById('directory-records').innerHTML=rows.map(row=>directoryCard(row,row.appearance_id===selectedId)).join('')||'<p>No resource entry matches both filters. Change the region or need, or <a href="#help">ask for help finding support</a>.</p>';
}
function showDirectory(selectedId='') {
 rememberAnswers();
 const selected=appearances.find(row=>row.appearance_id===selectedId);
 if(selected){directoryChoice.need=selected.issue_id;directoryChoice.region='';}
 root.innerHTML=`<nav class="back-nav" aria-label="Support navigation"><a href="#home">All support topics</a>${state.topicId?`<a href="#${esc(state.topicId)}">Back to your support choices</a>`:''}</nav><h1 tabindex="-1">Defence family resource details</h1><p class="intro">Browse the dated resource snapshot by need and region. The support finder gives a shorter first-contact route.</p><div class="directory-filters"><label for="directory-need">Need<select id="directory-need"><option value="">All needs</option>${issues.map(issue=>`<option value="${esc(issue.issue_id)}"${issue.issue_id===directoryChoice.need?' selected':''}>${esc(issue.title)}</option>`).join('')}</select></label><label for="directory-region">Region<select id="directory-region"><option value="">All published areas</option>${Object.entries(regionLabels).filter(([id])=>!['outside','remote'].includes(id)).map(([id,name])=>`<option value="${esc(id)}"${id===directoryChoice.region?' selected':''}>${esc(name)}</option>`).join('')}</select></label></div><p id="directory-count" class="directory-count" role="status" aria-live="polite"></p><div id="directory-records"></div><p class="quiet">Information checked 5 October 2026. Entries are routes and cross-listed appearances, not counts of organisations or exhaustive coverage.</p>`;
 refreshDirectory(selectedId);
 document.title='Defence family resource details | NT Defence family support | Lutheran Care';
 if(selected)requestAnimationFrame(()=>{const record=document.getElementById('record-'+selected.appearance_id);record?.scrollIntoView({block:'start'});record?.querySelector('summary')?.focus({preventScroll:true});});
}
function safetyNotice(topic) {
  if (topic.id !== 'relationships' || !['unsafe','refuge','assault','misconduct','child-violence'].includes(state.answers.need)) return '';
  return '<p class="notice safety-note">For violence or sexual assault, <a href="tel:1800737732">1800RESPECT: 1800 737 732</a> or <a href="https://www.1800respect.org.au/" rel="noreferrer">online chat</a> is available 24/7. In immediate danger, call <a href="tel:000">000</a>.</p>';
}
function questionMarkup(question) {
  const prefix = `question-${state.topicId}-${question.id}`;
  const compact = question.options.every(option=>!option.detail && option.label.length<=26);
  return `<fieldset class="choice-fieldset flow-question" id="${prefix}" data-question-id="${esc(question.id)}" data-signature="${esc(JSON.stringify(question))}"${question.hint ? ` aria-describedby="${prefix}-hint"` : ''}><legend><h2>${esc(question.label)}</h2></legend>${question.hint ? `<p class="question-hint" id="${prefix}-hint">${esc(question.hint)}</p>` : ''}<div class="choice-list${compact ? ' choice-list-compact' : ''}">${question.options.map((option,i)=>`<label class="choice-row" for="${prefix}-${i}"><input type="radio" id="${prefix}-${i}" name="${esc(question.id)}" value="${esc(option.value)}"${state.answers[question.id]===option.value ? ' checked' : ''}${option.detail ? ` aria-describedby="${prefix}-detail-${i}"` : ''}><span><strong>${esc(option.label)}</strong>${option.detail ? `<small id="${prefix}-detail-${i}">${esc(option.detail)}</small>` : ''}</span></label>`).join('')}</div></fieldset>`;
}
function relatedMarkup(topic) {
  return !state.answers.need && topic.links?.length ? `<nav class="related-needs" aria-label="Related help">${topic.links.map(item=>link(item.href,item.label)).join('')}</nav>` : '';
}
const lines=value=>esc(value).replace(/\n/g,'<br>');
function actionBlock(service,primary) {
 const urls=routeContactURLs(service),phones=urls.filter(url=>url.startsWith('tel:')),emails=urls.filter(url=>url.startsWith('mailto:')&&service.contact.toLowerCase().includes(url.slice(7).toLowerCase()));
 const website=primaryWebURL(service),messages=urls.filter(url=>url.startsWith('sms:')&&service.contact.replace(/\D/g,'').includes(url.replace(/\D/g,'')));
 return `${phones.map((url,index)=>link(url,'Call '+url.slice(4),primary&&index===0?'button':'official')).join('')}${emails.map(url=>link(url,'Email '+url.slice(7),'official')).join('')}${messages.map(url=>link(url,'Text '+url.slice(4),'official')).join('')}${website?link(website,Number(service.appearance.catalogue_id)===86?'Use online referral form':'Official service information',primary&&!phones.length?'button':'official'):''}`;
}
function chatOptions(){return '';}
function sourceDetails(service) {
 const urls=service.urls.filter(url=>safeURL(url)&&/^https?:/.test(url));
 return `<details class="service-source"><summary>Information checked ${esc(service.checked)}</summary><ul>${urls.map((url,index)=>`<li>${link(url,urls.length===1?'Official source':`Official source ${index+1}`)}</li>`).join('')}<li>${link('#directory/'+service.id,'Resource details for this need')}</li></ul></details>`;
}
function serviceDetails(service,primary=false,beforeAction='',chats='',nextAction='') {
 const qualifications=`<p class="fit"><strong>Who it helps:</strong> ${lines(service.audience)}</p><p class="access"><strong>Access, fees and limits:</strong> ${lines(service.access)}</p>`;
 const contacts=`<p class="hours"><strong>Published contact:</strong><br>${lines(service.contact)}</p>${actionBlock(service,primary)}`;
 if(primary)return `<div class="result-layout"><section class="result-main"><h3 class="primary-service-heading">${esc(service.name)}</h3><p class="area">${lines(service.area)}</p><p class="offer">${lines(service.offer)}</p>${qualifications}</section><aside class="contact-panel" aria-label="Contact ${esc(service.name)}">${beforeAction}${contacts}${nextAction}<div id="chat-options"></div></aside><div class="service-qualifications">${sourceDetails(service)}</div></div>`;
 return `<article class="alternative"><h3>${esc(service.name)}</h3><p class="area">${lines(service.area)}</p><p>${lines(service.offer)}</p>${qualifications}${contacts}${sourceDetails(service)}</article>`;
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
function resultsMarkup(topic) {
  const result = currentResults();
  const allIds = [...new Set(result.ids || [])].filter(id=>services[id]);
  const ids = allIds.slice(0,3);
  const more = [...new Set([...allIds.slice(3),...(result.moreIds || [])])].filter(id=>services[id] && !ids.includes(id));
  if (!ids.length) return `<h2 id="support-contacts-heading">Help finding a service</h2><p>No contact in this snapshot matches these choices. You can change the answers above or ask a navigation team to help check a suitable route.</p>${topic.id!=='help' ? '<a href="#help" data-action="request-help">Find another way to get help</a>' : ''}`;
  const summary = topic.id==='help' && handoff ? handoff.summary : result.contextLabel || answerSummary(topic.id,state.answers) || topic.title;
  const say = topic.id==='help' && handoff ? handoff.say : result.say;
  const note = result.note || result.preferenceLink ? `<p class="notice">${esc(result.note).replace(/1800 737 732/g,'<a href="tel:1800737732">1800 737 732</a>').replace(/call 000/g,'call <a href="tel:000">000</a>')}${result.preferenceLink ? ` ${link(result.preferenceLink.href,result.preferenceLink.label)}` : ''}</p>` : '';
  const nextAction = ids.length>1 || more.length ? '<a class="another-contact" href="#other-contacts" data-page-jump="other-contacts">Try another contact</a>' : topic.id!=='help' ? '<a class="another-contact" href="#help" data-action="request-help">Help finding another service</a>' : '';
  const noteBefore = result.noteBefore || (topic.id==='relationships' && ['unsafe','refuge','assault','misconduct','child-violence'].includes(state.answers.need));
  return `<div class="contacts-heading"><h2 id="support-contacts-heading">Your support contacts</h2><a href="#support-answers" data-page-jump="support-answers">Change your choices above</a></div><p class="context">${esc(summary)}</p><p class="quiet">${ids.length+more.length} suggested contacts for these choices, including ${more.length} in “More relevant services”. ${link('#directory','Browse resource details')}</p>${result.issueNotes?.filter(note=>note.text).map(note=>`<p class="quiet">${esc(note.text)}</p>`).join('')||''}${serviceDetails(services[ids[0]],true,noteBefore ? note : '',chatOptions(result,ids[0]),nextAction)}${!noteBefore ? note : ''}${say ? `<details class="say"><summary>What could I say when I contact them?</summary><p>“${esc(say)}”</p></details>` : ''}${ids.length>1 ? `<section class="alternate-list" id="other-contacts" tabindex="-1" aria-label="Other suitable options"><h2>Other ways to get help</h2>${ids.slice(1).map(id=>serviceDetails(services[id])).join('')}</section>` : ''}${more.length ? `<details class="more-services"${ids.length===1 ? ' id="other-contacts" tabindex="-1"' : ''}><summary>More relevant services (${more.length})</summary><div>${more.map(id=>serviceDetails(services[id])).join('')}</div></details>` : ''}${preferenceChoices(topic,result)}<div class="result-bottom">${topic.id!=='help' ? '<a href="#help" data-action="request-help">Find another way to get help</a>' : ''}<button class="text-button" data-action="print">Print these contacts</button></div>`;
}
function showFlow(topic) {
  const flow = currentFlow();
  const returnLink = topic.id==='help' && handoff ? `<a href="#${handoff.topicId}" data-action="return-to-request">Back to your original contacts</a>` : '';
  const context = topic.id==='help' && handoff ? `<p class="handoff-context"><strong>Help finding another service:</strong> ${esc(handoff.summary)}</p>` : '';
  root.innerHTML = `<nav class="back-nav" aria-label="Support navigation"><a href="#home">All support topics</a>${returnLink}</nav><h1 tabindex="-1">${esc(topic.id==='help' && handoff ? 'Help finding another service' : topic.title)}</h1>${context}<div id="flow-safety">${safetyNotice(topic)}</div><div id="support-answers" tabindex="-1"><form id="support-flow" aria-label="Your support choices" novalidate><div id="flow-questions">${flow.visibleQuestions.map(questionMarkup).join('')}</div></form></div><p id="flow-status" class="sr-only" role="status" aria-live="polite"></p><div id="flow-related">${relatedMarkup(topic)}</div><section id="support-contacts" class="flow-results" aria-labelledby="support-contacts-heading" tabindex="-1"${flow.complete ? '' : ' hidden'}>${flow.complete ? resultsMarkup(topic) : ''}</section>`;
  document.title = `${topic.title} | NT Defence family support | Lutheran Care`;
}
function syncFlow(topic) {
  const flow = currentFlow();
  const container = document.getElementById('flow-questions');
  if (!container) { showFlow(topic); return; }
  // Preserve the changed radio and its fieldset. Arrow keys keep their native
  // focus and browsing position; only new/changed downstream fields are rebuilt.
  for (const [index,question] of flow.visibleQuestions.entries()) {
    let fieldset = container.children[index];
    if (!fieldset || fieldset.dataset.signature!==JSON.stringify(question)) {
      const template = document.createElement('template');
      template.innerHTML = questionMarkup(question);
      const replacement = template.content.firstElementChild;
      if (fieldset) fieldset.replaceWith(replacement);
      else container.append(replacement);
      fieldset = replacement;
    }
    for (const input of fieldset.querySelectorAll('input[type="radio"]')) input.checked = input.value===state.answers[question.id];
  }
  while (container.children.length>flow.visibleQuestions.length) container.lastElementChild.remove();
  document.getElementById('flow-safety').innerHTML = safetyNotice(topic);
  document.getElementById('flow-related').innerHTML = relatedMarkup(topic);
  const contacts = document.getElementById('support-contacts');
  contacts.hidden = !flow.complete;
  contacts.innerHTML = flow.complete ? resultsMarkup(topic) : '';
  document.getElementById('flow-status').textContent = flow.complete ? 'Your support contacts are ready below.' : `Next question: ${flow.nextQuestion.label}`;
}
function render() {
  const rawHash = location.hash.slice(1);
  const segments = rawHash.split('/');
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
    initialiseTopic(topic.id,seededNeed);
    // Old question/result links still open the appropriate topic. Answers are
    // memory-only and choices never add a history entry or navigate to a page.
    history.replaceState(null,'',`#${topic.id}`);
    showFlow(topic);
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
    rememberAnswers();
    const result = getResults(state.topicId,state.answers);
    document.getElementById('preference-results').innerHTML = preferenceGroups(result);
    document.getElementById('chat-options').innerHTML = chatOptions(result,result.ids[0]);
    const count = document.getElementById('preference-results').querySelectorAll('.alternative').length;
    document.getElementById('preference-status').textContent = count ? `${count} additional ${count===1 ? 'contact' : 'contacts'} shown below. Your main contact stays the same.` : state.answers.preferences.length ? 'Preferences updated. Your main contact stays the same. Check any eligibility notes below.' : 'Your main contact stays the same. No additional contacts selected.';
    return;
  }
  if (!event.target.matches('input[type="radio"]')) return;
  const {name,value} = event.target;
  const flow = applyAnswer(state.topicId,state.answers,name,value,savedRegion);
  state.answers = flow.answers;
  if (name==='region' && state.answers.region===value && !(value==='nt' && ntRegions.has(savedRegion))) savedRegion=value;
  syncFlow(topicById(state.topicId));
});
root.addEventListener('submit', event => {
  // Enter never submits an application or advances to another page.
  event.preventDefault();
});
root.addEventListener('click', event => {
  if (event.target.closest('[data-action="print"]')) window.print();
  const anchor = event.target.closest('a[href^="#"]');
  if (!anchor || anchor.dataset.pageJump) return;
  if (anchor.dataset.action==='request-help' && state.topicId!=='help') {
    const region = questionsFor(state.topicId,state.answers).find(question=>question.id==='region')?.options.find(option=>option.value===state.answers.region)?.label;
    const result = getResults(state.topicId,state.answers);
    handoff = {topicId:state.topicId,previousPrimaryId:result.ids[0],otherIds:[...result.ids.slice(1),...(result.moreIds || [])],answers:copyAnswers(state.answers),summary:answerSummary(state.topicId,state.answers)||topicById(state.topicId)?.title||'Support',say:`${result.say||'I would like help finding support.'}${region ? ` Support is needed in ${region}.` : ''} Could you help me find another service for this need?`};
    topicAnswers.set(state.topicId,copyAnswers(state.answers));
    topicAnswers.set('help',{...(savedRegion ? {region:savedRegion} : {}),...(state.answers.connection ? {connection:state.answers.connection} : {})});
  } else if (anchor.hash==='#help' && state.topicId!=='help') {
    handoff=null;
    topicAnswers.delete('help');
  }
  if (anchor.dataset.action==='return-to-request' && handoff) {
    topicAnswers.set(handoff.topicId,copyAnswers(handoff.answers));
  }
  if (anchor.hash===location.hash) { event.preventDefault(); render(); }
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
window.addEventListener('hashchange',render);
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
