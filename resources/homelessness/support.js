import {topics, questionsFor, preferencesFor, getResults, legacyRoute} from './support-paths.mjs?v=20260930-1';
import {services,serviceView} from './support-catalog.mjs?v=20260930-1';
import {getFlowState, applyAnswer} from './support-flow.mjs?v=20260930-1';
import {handbookDirectory,handbookNeeds,handbookRegions,catalogueMetadata,handbookLinks} from './support-handbook.mjs?v=20260930-revised-1';

const root = document.getElementById('finder');
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.7" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>';
const link = (url, label, className='') => `<a class="${className}" href="${esc(url)}" rel="noreferrer">${esc(label)}</a>`;
const telephone = phone => `tel:${phone.replace(/\D/g,'')}`;
const topicById = id => topics.find(topic => topic.id === id) || (id === 'help' ? {id:'help',title:'Help finding support',hint:''} : null);
const ntRegions = new Set(['darwin','katherine','alice','tennant','arnhem','topend','central','npy','unsure']);
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
  root.innerHTML = `<h1 tabindex="-1">Find support in the NT</h1><p class="intro">Housing and homelessness support in the Northern Territory.</p><ul class="task-grid" aria-label="Choose the help you need">${topics.map(topic=>`<li><a class="task-link" href="#${topic.id}"><span><strong>${esc(topic.title)}</strong><small>${esc(topic.hint)}</small></span>${arrow}</a></li>`).join('')}</ul><p class="human-link"><a href="#help">Not sure where to start?</a></p><p class="human-link"><a href="#directory">Browse the full homelessness directory — ${catalogueMetadata.records} records across ${catalogueMetadata.needs} needs</a></p>`;
}

function directoryRegionalDetails(service) {
  const regional=service.regions||[];
  const chosen=directoryChoice.region ? regional.filter(r=>r.region===directoryChoice.region) : regional;
  const names={darwin:['darwin','palmerston'],katherine:['katherine'],alice:['alice'],tennant:['tennant','barkly'],arnhem:['arnhem','nhulunbuy','gove'],topend:['top end'],central:['central'],npy:['npy']};
  const contacts=(service.regionalContacts||[]).filter(c=>!directoryChoice.region||(names[directoryChoice.region]||[]).some(name=>String(c.region||c.name||c.area||'').toLowerCase().includes(name)));
  const showAddress=!directoryChoice.region||service.raw?.regions?.length===1&&service.raw.regions[0]===directoryChoice.region;
  return `<section class="directory-access"><h3>Regional access and contacts</h3>${chosen.map(r=>`<p><strong>${esc(r.label)}:</strong> ${r.service_available?'Published access route':'Matching local delivery not verified'}${r.channels?.length?` · ${esc(r.channels.map(v=>v.replace(/_/g,' ')).join(', '))}`:''}. ${esc(r.access_notes)}${r.local_delivery_confirmed?'':' A phone or online route does not confirm local appointments or a local office.'}</p>`).join('')}${contacts.length?`<ul>${contacts.map(c=>`<li><strong>${esc(c.name||c.region||c.area||'Regional contact')}</strong>${c.region&&c.name?` · ${esc(c.region)}`:''}${c.phone?` · ${link(telephone(c.phone),c.phone)}`:''}${c.alternate_phone?` · ${link(telephone(c.alternate_phone),c.alternate_phone)}`:''}${c.email?` · ${link('mailto:'+c.email,'Email')}`:''}${c.site||c.website?` · ${link(c.site||c.website,'Official regional contact')}`:''}${c.address?`<br>${esc(c.address)}`:''}</li>`).join('')}</ul>`:''}${showAddress&&service.address?`<p>${esc(service.address)}</p>`:''}${service.unavailableChannels?.length?`<p class="notice">Currently unavailable: ${esc(service.unavailableChannels.join(', '))}. Use the working contact route above.</p>`:''}</section>`;
}
function directoryServiceFor(service) {
  if (!directoryChoice.region || !service.raw) return service;
  const region=directoryChoice.region;
  const options=(service.raw.contact_options||[]).filter(option=>!option.regions?.length||option.regions.includes(region));
  const view=serviceView({...service.raw,contact_options_visible:options,walkin_address:service.raw.regions?.length===1&&service.raw.regions[0]===region?service.raw.walkin_address:null});
  return {...service,...view,regions:service.regions,regionalContacts:service.regionalContacts,raw:service.raw};
}
function directoryCard(service,open=false) {
  const needNames=(service.needs||[]).map(id=>handbookNeeds.find(n=>n.id===id)?.title).filter(Boolean);
  const shown=directoryServiceFor(service);
  return `<details class="directory-card" id="record-${esc(service.id)}"${open?' open':''}><summary>${esc(service.name)}</summary><div>${serviceDetails(shown)}${service.eligibility&&service.eligibility!==service.audience?`<p><strong>Eligibility:</strong> ${esc(service.eligibility)}</p>`:''}<p class="quiet"><strong>Record type:</strong> ${esc((service.recordType||'service').replace(/_/g,' '))}. Information, benefits, training and navigation records do not themselves supply clinical care or accommodation.</p>${directoryRegionalDetails(service)}<p><strong>Support needs:</strong> ${esc(needNames.join(' · '))}</p><p>${link('#directory/'+service.id,'Link to this handbook record')}</p></div></details>`;
}
function refreshDirectory(selectedId='') {
  const items=handbookDirectory.filter(s=>(!directoryChoice.need||(s.needs||[]).includes(directoryChoice.need))&&(!directoryChoice.region||(s.regions||[]).some(r=>r.region===directoryChoice.region&&r.service_available)));
  document.getElementById('directory-count').textContent=`Showing ${items.length} of ${catalogueMetadata.records} directory records. Region matches include published telephone or online access; they do not confirm local delivery, a bed or an appointment.`;
  document.getElementById('directory-records').innerHTML=items.map(s=>directoryCard(s,s.id===selectedId)).join('')||'<p>No handbook record is verified for both filters. Choose a broader filter or use the support finder for a navigation contact.</p>';
}
function showDirectory(selectedId='') {
  rememberAnswers();
  const selected=handbookDirectory.find(s=>s.id===selectedId);
  if(selected){directoryChoice.need='';directoryChoice.region='';}
  root.innerHTML=`<nav class="back-nav" aria-label="Support navigation"><a href="#home">All support topics</a>${state.topicId?`<a href="#${esc(state.topicId)}">Back to your support choices</a>`:''}</nav><h1 tabindex="-1">Full homelessness directory</h1><p class="intro">Choose a need, then a region to browse the reviewed records. The support finder gives a shorter first-contact route.</p><div class="directory-filters"><label for="directory-need">Need<select id="directory-need"><option value="">All ${catalogueMetadata.needs} needs</option>${handbookNeeds.map(n=>`<option value="${esc(n.id)}"${n.id===directoryChoice.need?' selected':''}>${esc(n.title)}</option>`).join('')}</select></label><label for="directory-region">Region<select id="directory-region"><option value="">All NT regions</option>${Object.entries(handbookRegions).map(([id,name])=>`<option value="${esc(id)}"${id===directoryChoice.region?' selected':''}>${esc(name)}</option>`).join('')}</select></label></div><p id="directory-count" class="directory-count" role="status" aria-live="polite"></p><div id="directory-records"></div><p class="quiet">Directory version ${esc(catalogueMetadata.version)} · source information checked ${esc(catalogueMetadata.verifiedDate)}. Each record links its official sources.</p>`;
  refreshDirectory(selectedId);
  document.title='Full homelessness directory | Lutheran Care';
  if(selected)requestAnimationFrame(()=>{const record=document.getElementById('record-'+selected.id);record?.scrollIntoView({block:'start'});record?.querySelector('summary')?.focus({preventScroll:true});});
}
function safetyNotice(topic) {
  if (topic.id !== 'safety' || state.answers.need !== 'violence-safety') return '';
  return '<p class="notice safety-note">In immediate danger, call <a href="tel:000">000</a>. For violence or sexual assault, <a href="tel:1800737732">1800RESPECT: 1800 737 732</a> and <a href="https://www.1800respect.org.au/" rel="noreferrer">online chat</a> are available 24/7. Use a safe device if someone may monitor this one.</p>';
}
function questionMarkup(question) {
  const prefix = `question-${state.topicId}-${question.id}`;
  const compact = question.options.every(option=>!option.detail && option.label.length<=26);
  return `<fieldset class="choice-fieldset flow-question" id="${prefix}" data-question-id="${esc(question.id)}" data-signature="${esc(JSON.stringify(question))}"${question.hint ? ` aria-describedby="${prefix}-hint"` : ''}><legend><h2>${esc(question.label)}</h2></legend>${question.hint ? `<p class="question-hint" id="${prefix}-hint">${esc(question.hint)}</p>` : ''}<div class="choice-list${compact ? ' choice-list-compact' : ''}">${question.options.map((option,i)=>`<label class="choice-row" for="${prefix}-${i}"><input type="radio" id="${prefix}-${i}" name="${esc(question.id)}" value="${esc(option.value)}"${state.answers[question.id]===option.value ? ' checked' : ''}${option.detail ? ` aria-describedby="${prefix}-detail-${i}"` : ''}><span><strong>${esc(option.label)}</strong>${option.detail ? `<small id="${prefix}-detail-${i}">${esc(option.detail)}</small>` : ''}</span></label>`).join('')}</div></fieldset>`;
}
function relatedMarkup(topic) {
  return !state.answers.need && topic.links?.length ? `<nav class="related-needs" aria-label="Related help">${topic.links.map(item=>link(item.href,item.label)).join('')}</nav>` : '';
}
function actionBlock(service, primary) {
  if (Array.isArray(service.contactOptions)) {
    const options=service.contactOptions.filter(option=>option.href&&option.label);
    const direct=options.find(option=>['phone','email','form','chat','visit','text'].includes(option.channel))||null;
    const other=options.filter(option=>option!==direct);
    return `${direct?link(direct.href,direct.label,primary?'button':''):'<p class="quiet">No direct contact route is published for this option.</p>'}${other.map(option=>link(option.href,option.label,primary&&['chat','form'].includes(option.channel)?'button button-secondary':'official')).join('')}`;
  }
  const action = service.phone ? link(telephone(service.phone), `Call ${service.phone}`, primary ? 'button' : '') : link(service.url,service.action || 'Visit official website',primary ? 'button' : '');
  const chat = chatAction(service);
  return `${action}${chat ? link(chat.url,chat.label,primary ? 'button button-secondary' : '') : ''}${service.phone ? link(service.url,service.action || 'Official website',primary ? 'official' : '') : ''}`;
}
function chatAction(service) {
  if (Array.isArray(service.contactOptions)) {
    const item=service.contactOptions.find(option=>option.channel==='chat');
    return item?{url:item.href,label:item.label}:null;
  }
  if (service.chatUrl) return {url:service.chatUrl,label:service.chatLabel || 'Use webchat'};
  // Availability pages are not a chat action. Only promote explicitly labelled chat links.
  if (service.extraUrl && /^(use (webchat|online chat)|chat with)/i.test(service.extraLabel || '')) return {url:service.extraUrl,label:service.extraLabel};
  return null;
}
function extraAction(service) {
  if (Array.isArray(service.contactOptions)) return '';
  return service.extraUrl && service.extraUrl !== chatAction(service)?.url ? link(service.extraUrl,service.extraLabel || 'More ways to contact','official') : '';
}
function chatOptions(result, primaryId) {
  const ids = [...new Set([...(result.ids || []),...(result.moreIds || []),...(result.preferenceGroups || []).flatMap(group => group.ids || [])])];
  const options = ids.filter(id => id !== primaryId && serviceFor(id,result) && chatAction(serviceFor(id,result)));
  if (!options.length) return '';
  return `<div class="chat-options"><p><strong>Prefer to chat online?</strong></p><ul>${options.map(id => {const service=serviceFor(id,result);return `<li>${link(chatAction(service).url,service.name)}${service.hours ? `<small>${esc(service.hours)}</small>` : ''}</li>`}).join('')}</ul></div>`;
}
function serviceFor(id,result) { return result?.servicesById?.[id] || services[id]; }
function sourceDetails(service) {
  const urls = [...new Set(service.sources || [service.url])];
  const date = service.checked ? new Date(`${service.checked}T12:00:00Z`).toLocaleDateString('en-AU',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}) : 'See provider';
  const records=handbookLinks[service.id]||[];
  return `<details class="service-source"><summary>Information checked ${esc(date)}</summary><ul>${urls.map((url,index)=>`<li>${link(url,urls.length===1 ? 'Official source' : `Official source ${index+1}`)}</li>`).join('')}${records.map(id=>`<li>${link('#directory/'+id,'Service record, eligibility and regional access')}</li>`).join('')}</ul></details>`;
}
function serviceDetails(service, primary=false, beforeAction='', chats='', nextAction='') {
  const qualification = `<p class="fit"><strong>Who it helps:</strong> ${esc(service.audience)}</p><p class="cost"><strong>Cost:</strong> ${esc(service.cost)}</p>`;
  if (primary) return `<div class="result-layout"><section class="result-main"><h3 class="primary-service-heading">${esc(service.name)}</h3><p class="area">${esc(service.area)}</p><p class="offer">${esc(service.offer)}</p></section><aside class="contact-panel" aria-label="Contact ${esc(service.name)}">${beforeAction}${actionBlock(service,true)}${service.contactNotice ? `<p class="hours">${esc(service.contactNotice)}</p>` : ''}${service.hours ? `<p class="hours">${esc(service.hours)}</p>` : ''}${extraAction(service)}${nextAction}<div id="chat-options">${chats}</div></aside><div class="service-qualifications">${qualification}${service.access ? `<p class="access">${esc(service.access)}</p>` : ''}${sourceDetails(service)}</div></div>`;
  return `<article class="alternative"><h3>${esc(service.name)}</h3><p class="area">${esc(service.area)}</p><p>${esc(service.offer)}</p><div class="alt-actions">${actionBlock(service,false)}</div>${service.contactNotice ? `<p class="quiet">${esc(service.contactNotice)}</p>` : ''}${service.hours ? `<p class="quiet">${esc(service.hours)}</p>` : ''}${qualification}${extraAction(service)}${service.access ? `<p class="access">${esc(service.access)}</p>` : ''}${sourceDetails(service)}</article>`;
}
function preferenceGroups(result) {
  const coreIds = new Set([...(result.ids || []), ...(result.moreIds || [])]);
  return (result.preferenceGroups || []).map(group => {
    const ids = [...new Set(group.ids || [])].filter(id => services[id] && !coreIds.has(id));
    if (!ids.length && !group.note) return '';
    return `<section class="preference-group"><h2>${esc(group.title)}</h2>${group.note ? `<p class="preference-note">${esc(group.note)}</p>` : ''}${ids.map(id => serviceDetails(serviceFor(id,result))).join('')}${group.link ? `<p>${link(group.link.href,group.link.label)}</p>` : ''}</section>`;
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
  const result = getResults(state.topicId,state.answers);
  if (state.topicId!=='help' || !handoff) return result;
  const alternatives = [...new Set([...(handoff.otherIds || []),'ask-izzy'])].filter(id=>services[id] && id!==handoff.previousPrimaryId);
  const servicesById={...result.servicesById};
  for(const id of alternatives) if(!servicesById[id]&&services[id]?.raw) servicesById[id]=serviceView(services[id].raw,{contactMode:result.contactMode});
  return {...result,ids:alternatives.slice(0,3),moreIds:alternatives.slice(3),servicesById,note:'These options give you a different contact or a way to search local support.'};
}
function resultsMarkup(topic) {
  const result = currentResults();
  const allIds = [...new Set(result.ids || [])].filter(id=>services[id]);
  const ids = allIds.slice(0,3);
  const more = [...new Set([...allIds.slice(3),...(result.moreIds || [])])].filter(id=>services[id] && !ids.includes(id));
  if (!ids.length) return `<h2 id="support-contacts-heading">Help finding a service</h2><p>There is no matched contact for these choices.</p>${topic.id!=='help' ? '<a href="#help" data-action="request-help">Find another way to get help</a>' : ''}`;
  const summary = topic.id==='help' && handoff ? handoff.summary : result.contextLabel || answerSummary(topic.id,state.answers) || topic.title;
  const say = topic.id==='help' && handoff ? handoff.say : result.say;
  const note = result.note || result.preferenceLink ? `<p class="notice">${esc(result.note).replace(/1800 737 732/g,'<a href="tel:1800737732">1800 737 732</a>').replace(/call 000/g,'call <a href="tel:000">000</a>')}${result.preferenceLink ? ` ${link(result.preferenceLink.href,result.preferenceLink.label)}` : ''}</p>` : '';
  const nextAction = ids.length>1 || more.length ? '<a class="another-contact" href="#other-contacts" data-page-jump="other-contacts">Try another contact</a>' : topic.id!=='help' ? '<a class="another-contact" href="#help" data-action="request-help">Help finding another service</a>' : '';
  const noteBefore = result.noteBefore || (topic.id==='safety' && state.answers.need==='violence-safety');
  return `<div class="contacts-heading"><h2 id="support-contacts-heading">Your support contacts</h2><a href="#support-answers" data-page-jump="support-answers">Change your choices above</a></div><p class="context">${esc(summary)}</p><p class="quiet">${ids.length+more.length} suggested contacts for these choices, including ${more.length} in “More relevant services”. ${link('#directory','Browse all directory records')}</p>${serviceDetails(serviceFor(ids[0],result),true,noteBefore ? note : '',chatOptions(result,ids[0]),nextAction)}${!noteBefore ? note : ''}${say ? `<details class="say"><summary>What could I say when I contact them?</summary><p>“${esc(say)}”</p></details>` : ''}${ids.length>1 ? `<section class="alternate-list" id="other-contacts" tabindex="-1" aria-label="Other suitable options"><h2>Other ways to get help</h2>${ids.slice(1).map(id=>serviceDetails(serviceFor(id,result))).join('')}</section>` : ''}${more.length ? `<details class="more-services"${ids.length===1 ? ' id="other-contacts" tabindex="-1"' : ''}><summary>More relevant services (${more.length})</summary><div>${more.map(id=>serviceDetails(serviceFor(id,result))).join('')}</div></details>` : ''}${preferenceChoices(topic,result)}<div class="result-bottom">${topic.id!=='help' ? '<a href="#help" data-action="request-help">Find another way to get help</a>' : ''}<button class="text-button" data-action="print">Print these contacts</button></div>`;
}
function showFlow(topic) {
  const flow = currentFlow();
  const returnLink = topic.id==='help' && handoff ? `<a href="#${handoff.topicId}" data-action="return-to-request">Back to your original contacts</a>` : '';
  const context = topic.id==='help' && handoff ? `<p class="handoff-context"><strong>Help finding another service:</strong> ${esc(handoff.summary)}</p>` : '';
  root.innerHTML = `<nav class="back-nav" aria-label="Support navigation"><a href="#home">All support topics</a>${returnLink}</nav><h1 tabindex="-1">${esc(topic.id==='help' && handoff ? 'Help finding another service' : topic.title)}</h1>${context}<div id="flow-safety">${safetyNotice(topic)}</div><div id="support-answers" tabindex="-1"><form id="support-flow" aria-label="Your support choices" novalidate><div id="flow-questions">${flow.visibleQuestions.map(questionMarkup).join('')}</div></form></div><p id="flow-status" class="sr-only" role="status" aria-live="polite"></p><div id="flow-related">${relatedMarkup(topic)}</div><section id="support-contacts" class="flow-results" aria-labelledby="support-contacts-heading" tabindex="-1"${flow.complete ? '' : ' hidden'}>${flow.complete ? resultsMarkup(topic) : ''}</section>`;
  document.title = `${topic.title} | Lutheran Care`;
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
    document.title = 'Find support in the NT | Lutheran Care';
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
    const changedValue=event.target.value;
    state.answers.preferences = [...root.querySelectorAll('input[name="support-preference"]:checked')].map(input=>input.value);
    rememberAnswers();
    syncFlow(topicById(state.topicId));
    const replacement=[...root.querySelectorAll('input[name="support-preference"]')].find(input=>input.value===changedValue);
    replacement?.focus({preventScroll:true});
    document.getElementById('preference-status').textContent='Contacts and available ways to reach them updated for your preferences.';
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
    topicAnswers.set('help',{...(savedRegion ? {region:savedRegion} : {}),...(Array.isArray(state.answers.preferences) ? {preferences:[...state.answers.preferences]} : {})});
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
