import {topics, questionsFor, preferencesFor, getResults, legacyRoute} from './support-paths.mjs?v=20260926-4';
import {services} from './support-catalog.mjs?v=20260926-4';

const root = document.getElementById('finder');
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.7" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>';
const link = (url, label, className='') => `<a class="${className}" href="${esc(url)}" rel="noreferrer">${esc(label)}</a>`;
const telephone = phone => `tel:${phone.replace(/\D/g,'')}`;
const topicById = id => topics.find(topic => topic.id === id) || (id === 'help' ? {id:'help', title:'Not sure where to start', hint:''} : null);
let state = {topicId:null, answers:{}};
let savedRegion = '';
let currentQuestion = null;
let started = false;
const ntRegions = new Set(['darwin','palmerston','katherine','alice','tennant','gove','remote']);

function focusHeading() {
  root.querySelector('h1')?.focus();
  window.scrollTo({top:0, behavior:'instant'});
}
function questionHash(topicId, questionId) { return `#${topicId}/q/${questionId}`; }
function navigate(hash) {
  if (location.hash === hash) render();
  else location.hash = hash;
}
function questions() { return questionsFor(state.topicId, state.answers); }
function hasAnswer(question) {
  return question.options.some(option => option.value === state.answers[question.id]);
}
function initialiseTopic(topicId, need) {
  if (state.topicId !== topicId) {
    state = {topicId, answers:savedRegion ? {region:savedRegion} : {}};
  }
  if (need && state.answers.need !== need) {
    state.answers = {...(savedRegion ? {region:savedRegion} : {}), need};
  }
}
function showHome() {
  currentQuestion = null;
  root.innerHTML = `<h1 tabindex="-1">Find support in the NT</h1><p class="intro">Free advice and support for Defence members, veterans and families.</p><ul class="task-grid" aria-label="Choose the help you need">${topics.map(topic => `<li><a class="task-link" href="#${topic.id}"><span><strong>${esc(topic.title)}</strong><small>${esc(topic.hint)}</small></span>${arrow}</a></li>`).join('')}</ul><p class="human-link"><a href="#help">Not sure where to start?</a></p>`;
}
function safetyNotice(topic) {
  if (topic.id !== 'relationships') return '';
  return '<p class="notice safety-note">For violence or sexual assault, <a href="tel:1800737732">1800RESPECT: 1800 737 732</a> or <a href="https://www.1800respect.org.au/" rel="noreferrer">online chat</a> is available 24/7. In immediate danger, call <a href="tel:000">000</a>.</p>';
}
function showQuestion(topic, question, list) {
  currentQuestion = question;
  const index = list.findIndex(item => item.id === question.id);
  const backHash = index > 0 ? questionHash(topic.id, list[index-1].id) : '#home';
  const related = question.id === 'need' && topic.links?.length ? `<nav class="related-needs" aria-label="Related help">${topic.links.map(item => link(item.href,item.label)).join('')}</nav>` : '';
  const selected = state.answers[question.id];
  const safety = question.id !== 'need' && ['unsafe','refuge','assault','misconduct','child-violence'].includes(state.answers.need) ? safetyNotice(topic) : '';
  root.innerHTML = `<nav class="back-nav" aria-label="Support navigation"><a href="${backHash}">Back</a><a href="#home">All support topics</a></nav><p class="topic-label">${esc(topic.title)}</p>${safety}<form id="support-question" novalidate><fieldset class="choice-fieldset"${question.hint ? ' aria-describedby="question-hint"' : ''}><legend><h1 tabindex="-1">${esc(question.label)}</h1></legend>${question.hint ? `<p id="question-hint" class="question-hint">${esc(question.hint)}</p>` : ''}<p class="error" id="question-error" role="alert" hidden>Choose an option to continue.</p><div class="choice-list">${question.options.map((option, i) => `<label class="choice-row" for="answer-${i}"><input type="radio" id="answer-${i}" name="${esc(question.id)}" value="${esc(option.value)}" required${selected === option.value ? ' checked' : ''}${option.detail ? ` aria-describedby="answer-detail-${i}"` : ''}><span><strong>${esc(option.label)}</strong>${option.detail ? `<small id="answer-detail-${i}">${esc(option.detail)}</small>` : ''}</span></label>`).join('')}</div></fieldset><div class="form-actions"><button class="button" type="submit">Continue</button></div></form>${related}`;
  document.title = `${question.label} — ${topic.title} | Lutheran Care`;
}
function actionBlock(service, primary) {
  const action = service.phone ? link(telephone(service.phone), `Call ${service.phone}`, primary ? 'button' : '') : link(service.url,service.action || 'Visit official website',primary ? 'button' : '');
  return `${action}${service.phone ? link(service.url,service.action || 'Official website',primary ? 'official' : '') : ''}`;
}
function serviceDetails(service, primary=false, beforeAction='') {
  if (primary) return `<div class="result-layout"><section class="result-main"><h1 tabindex="-1">${esc(service.name)}</h1><p class="area">${esc(service.area)}</p><p class="offer">${esc(service.offer)}</p><p class="fit"><strong>Who it helps:</strong> ${esc(service.audience)}</p><p class="cost"><strong>Cost:</strong> ${esc(service.cost)}</p></section><aside class="contact-panel" aria-label="Contact ${esc(service.name)}">${beforeAction}${actionBlock(service,true)}${service.hours ? `<p class="hours">${esc(service.hours)}</p>` : ''}${service.extraUrl ? link(service.extraUrl,service.extraLabel || 'More ways to contact','official') : ''}</aside>${service.access ? `<p class="access">${esc(service.access)}</p>` : ''}</div>`;
  return `<article class="alternative"><h3>${esc(service.name)}</h3><p class="area">${esc(service.area)}</p><p>${esc(service.offer)}</p><p><strong>Who it helps:</strong> ${esc(service.audience)}</p><p><strong>Cost:</strong> ${esc(service.cost)}</p><div class="alt-actions">${actionBlock(service,false)}</div>${service.hours ? `<p class="quiet">${esc(service.hours)}</p>` : ''}${service.extraUrl ? link(service.extraUrl,service.extraLabel || 'More ways to contact','official') : ''}${service.access ? `<p class="access">${esc(service.access)}</p>` : ''}</article>`;
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
  return `<section class="support-preferences"><fieldset class="preference-fieldset" aria-describedby="preference-hint"><legend>Support preferences (optional)</legend><p class="question-hint" id="preference-hint">Choose any that matter to you. Extra contacts appear below.</p><div class="preference-list">${options.map((option,i) => `<label class="choice-row" for="preference-${i}"><input type="checkbox" id="preference-${i}" name="support-preference" value="${esc(option.value)}"${selected.includes(option.value) ? ' checked' : ''}${option.detail ? ` aria-describedby="preference-detail-${i}"` : ''}><span><strong>${esc(option.label)}</strong>${option.detail ? `<small id="preference-detail-${i}">${esc(option.detail)}</small>` : ''}</span></label>`).join('')}</div></fieldset><p id="preference-status" class="sr-only" role="status"></p><div id="preference-results">${preferenceGroups(result)}</div></section>`;
}
function showResults(topic) {
  currentQuestion = null;
  const result = getResults(topic.id,state.answers);
  const ids = [...new Set(result.ids || [])].filter(id => services[id]).slice(0,3);
  const more = [...new Set(result.moreIds || [])].filter(id => services[id] && !ids.includes(id));
  const list = questions();
  if (!ids.length) {
    root.innerHTML = `<nav class="back-nav"><a href="#${topic.id}">Back to your choices</a><a href="#home">All support topics</a></nav><h1 tabindex="-1">Help finding a service</h1><p>There is no matched contact for these choices.</p><p><a href="#help">Find someone who can help you work out the next step</a>.</p>`;
    return;
  }
  const summary = list.filter(question=>['need','age','childAge','region'].includes(question.id)&&!(question.id==='age'&&state.answers.childAge)).map(question => question.options.find(option => option.value === state.answers[question.id])?.label).filter(Boolean).join(' · ');
  const note = result.note || result.preferenceLink ? `<p class="notice">${esc(result.note).replace(/1800 737 732/g,'<a href="tel:1800737732">1800 737 732</a>').replace(/call 000/g,'call <a href="tel:000">000</a>')}${result.preferenceLink ? ` ${link(result.preferenceLink.href,result.preferenceLink.label)}` : ''}</p>` : '';
  const noteBefore = result.noteBefore || (topic.id === 'relationships' && ['unsafe','refuge','assault','misconduct','child-violence'].includes(state.answers.need));
  const lastQuestion = list.at(-1);
  root.innerHTML = `<nav class="back-nav" aria-label="Support navigation"><a href="${lastQuestion ? questionHash(topic.id,lastQuestion.id) : '#'+topic.id}">Back to your choices</a><a href="#home">All support topics</a></nav><div class="context"><p>${esc(result.contextLabel || summary || topic.title)}</p><a href="#${topic.id}">Change</a></div>${serviceDetails(services[ids[0]],true,noteBefore ? note : '')}${!noteBefore ? note : ''}${result.say ? `<details class="say"><summary>What could I say when I contact them?</summary><p>“${esc(result.say)}”</p></details>` : ''}${preferenceChoices(topic,result)}${ids.length > 1 ? `<section class="alternate-list" aria-label="Other suitable options"><h2>Other ways to get help</h2>${ids.slice(1).map(id => serviceDetails(services[id])).join('')}</section>` : ''}${more.length ? `<details class="more-services"><summary>More relevant services</summary><div>${more.map(id => serviceDetails(services[id])).join('')}</div></details>` : ''}<div class="result-bottom"><a href="#help">Need help finding another option?</a><button class="text-button" data-action="print">Print these contacts</button></div>`;
  document.title = `${topic.title} — Support contacts | Lutheran Care`;
}
function render() {
  const rawHash = location.hash.slice(1);
  const segments = rawHash.split('/');
  let topic = topicById(segments[0]);
  let seededNeed;
  if (!topic && rawHash && segments[0] !== 'home') {
    const legacy = legacyRoute(rawHash);
    if (legacy) { topic = topicById(legacy.topicId); seededNeed = legacy.need; }
  } else if (topic && segments[1] && !['q','results'].includes(segments[1])) {
    const legacy = legacyRoute(rawHash);
    seededNeed = legacy?.need || segments[1];
  }
  if (!topic) {
    showHome();
    document.title = 'Find support in the NT | Lutheran Care';
  } else {
    initialiseTopic(topic.id,seededNeed);
    let list = questions();
    const regionQuestion = list.find(question => question.id === 'region');
    if (regionQuestion?.options.some(option => option.value === 'nt') && ntRegions.has(state.answers.region)) state.answers.region = 'nt';
    else if (state.answers.region === 'nt' && regionQuestion?.options.some(option => option.value === savedRegion)) state.answers.region = savedRegion;
    // A stale deep link must not manufacture an answer that is not offered.
    for (const question of list) {
      if (state.answers[question.id] && !hasAnswer(question)) delete state.answers[question.id];
    }
    list = questions();
    const missing = list.findIndex(question => !hasAnswer(question));
    const requested = segments[1] === 'q' ? list.findIndex(question => question.id === segments[2]) : -1;
    if (segments[1] === 'results' && missing === -1) showResults(topic);
    else if (!list.length) showResults(topic);
    else {
      let index = requested >= 0 ? requested : seededNeed || segments[1] === 'results' ? Math.max(0,missing) : 0;
      if (missing >= 0 && index > missing) index = missing;
      const question = list[index];
      history.replaceState(null,'',questionHash(topic.id,question.id));
      showQuestion(topic,question,list);
    }
  }
  if (started) focusHeading();
  started = true;
}
root.addEventListener('change', event => {
  if (event.target.matches('input[name="support-preference"]')) {
    state.answers.preferences = [...root.querySelectorAll('input[name="support-preference"]:checked')].map(input => input.value);
    const result = getResults(state.topicId,state.answers);
    // Keep the checkbox nodes in place: selecting a preference must not move focus or scroll.
    document.getElementById('preference-results').innerHTML = preferenceGroups(result);
    const count = document.getElementById('preference-results').querySelectorAll('.alternative').length;
    document.getElementById('preference-status').textContent = count ? `${count} additional ${count === 1 ? 'contact' : 'contacts'} shown below. Your main contact stays the same.` : state.answers.preferences.length ? 'Preferences updated. Your main contact stays the same. Check any eligibility notes below.' : 'Your main contact stays the same. No additional contacts selected.';
    return;
  }
  if (!event.target.matches('input[type="radio"]')) return;
  document.getElementById('question-error')?.setAttribute('hidden','');
  // Native radio groups keep arrow-key navigation; selection never advances a page.
});
root.addEventListener('submit', event => {
  event.preventDefault();
  if (event.target.id !== 'support-question' || !currentQuestion) return;
  const selected = event.target.querySelector('input[type="radio"]:checked');
  if (!selected) {
    document.getElementById('question-error').hidden = false;
    event.target.querySelector('input[type="radio"]')?.focus();
    return;
  }
  const questionId = currentQuestion.id;
  const previous = questions();
  const position = previous.findIndex(question => question.id === questionId);
  const changed = state.answers[questionId] !== selected.value;
  if (changed) {
    // Re-answering an early question cannot retain later eligibility for a different person.
    for (const key of Object.keys(state.answers)) {
      const keyPosition = previous.findIndex(question => question.id === key);
      if (key !== 'region' && key !== 'preferences' && (keyPosition > position || keyPosition === -1)) delete state.answers[key];
    }
  }
  state.answers[questionId] = selected.value;
  if (questionId === 'region' && !(selected.value === 'nt' && ntRegions.has(savedRegion))) savedRegion = selected.value;
  let nextList = questions();
  const allowedKeys = new Set(nextList.map(question => question.id));
  for (const key of Object.keys(state.answers)) {
    if (!allowedKeys.has(key) && key !== 'region' && key !== 'preferences') delete state.answers[key];
  }
  nextList = questions();
  const nextIndex = nextList.findIndex(question=>question.id===questionId)+1;
  const nextQuestion = nextList[nextIndex];
  if (nextQuestion) navigate(questionHash(state.topicId,nextQuestion.id));
  else navigate(`#${state.topicId}/results`);
});
root.addEventListener('click', event => {
  if (event.target.closest('[data-action="print"]')) window.print();
  const anchor = event.target.closest('a[href^="#"]');
  // Re-opening the same topic/step still renders it; hashchange does not fire for equal hashes.
  if (anchor && anchor.hash === location.hash) { event.preventDefault(); render(); }
});
document.querySelector('.skip-link')?.addEventListener('click', event => {
  event.preventDefault();
  document.getElementById('main').focus();
  document.getElementById('main').scrollIntoView();
});
window.addEventListener('hashchange',render);
let printOpened = [];
window.addEventListener('beforeprint', () => {
  printOpened = [...root.querySelectorAll('details.more-services:not([open])')];
  for (const details of printOpened) details.open = true;
});
window.addEventListener('afterprint', () => {
  for (const details of printOpened) details.open = false;
  printOpened = [];
});
render();
