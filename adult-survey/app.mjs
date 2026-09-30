import {createAdultSurveyModel, characterCount, normaliseNewlines} from './model.mjs';
const moduleUrl = import.meta.url;
const main = document.querySelector('#main');
const clone = value => value === undefined ? undefined : structuredClone(value);
const text = value => String(value ?? '');
const present = value => value !== undefined && value !== null && value !== '';

function escapeHtml(value) {
  return text(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[character]));
}

function idFor(value) {
  return text(value).replace(/[^A-Za-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'field';
}

function pathParts(path) {
  return text(path).split('.').filter(Boolean);
}

function readPath(object, path) {
  return pathParts(path).reduce((value, part) => value?.[part], object);
}

function setPath(object, path, value) {
  const parts = pathParts(path);
  if (!parts.length) return;
  let target = object;
  for (const part of parts.slice(0, -1)) {
    if (!target[part] || typeof target[part] !== 'object' || Array.isArray(target[part])) target[part] = {};
    target = target[part];
  }
  const key = parts.at(-1);
  if (value === undefined) delete target[key];
  else target[key] = value;
}

function toggleValue(values, value, exclusive = []) {
  const current = Array.isArray(values) ? [...new Set(values)] : [];
  if (current.includes(value)) return current.filter(item => item !== value);
  if (exclusive.includes(value)) return [value];
  return [...current.filter(item => !exclusive.includes(item)), value];
}

function optionLabel(options, id) {
  return options?.find(option => option?.id === id)?.label || id;
}

function specPage(spec, id) {
  return spec.pages?.find(page => page.id === id) || {};
}

function questionError(path, errors) {
  return errors.find(error => error.path === path)?.message || '';
}

function errorElement(path, errors) {
  const message = questionError(path, errors);
  return `<p class="field-error" data-error-for="${escapeHtml(path)}"${message ? '' : ' hidden'}>${escapeHtml(message)}</p>`;
}

function countOutput(path, value, maxLength) {
  return `<output class="char-count" data-count-for="${escapeHtml(path)}">${characterCount(value).toLocaleString('en-AU')} / ${maxLength.toLocaleString('en-AU')} characters</output>`;
}

function textQuestion({path, label, help = '', privacyHint = '', value = '', rows = 6, maxLength = 10000, errors = [], className = ''}) {
  const inputId = idFor(`text-${path}`);
  const normalised = normaliseNewlines(value);
  const descriptions = [help && `${inputId}-hint`, privacyHint && `${inputId}-privacy`, `${inputId}-error`].filter(Boolean).join(' ');
  return `<div class="question-group text-question${className ? ` ${escapeHtml(className)}` : ''}">
    <label class="field-label" for="${escapeHtml(inputId)}">${escapeHtml(label)}</label>
    ${help ? `<p id="${inputId}-hint" class="field-hint">${escapeHtml(help)}</p>` : ''}
    <textarea id="${escapeHtml(inputId)}" name="${escapeHtml(path)}" class="textarea" rows="${Number(rows) || 6}" maxlength="${maxLength}" aria-describedby="${descriptions}"${questionError(path, errors) ? ' aria-invalid="true"' : ''} spellcheck="true" data-path="${escapeHtml(path)}" data-kind="text" data-max-length="${maxLength}">${escapeHtml(normalised)}</textarea>
    <div class="answer-notes">${privacyHint ? `<p id="${inputId}-privacy" class="privacy-hint">${escapeHtml(privacyHint)}</p>` : ''}${countOutput(path, normalised, maxLength)}</div>
    <p id="${inputId}-error" class="field-error" data-error-for="${escapeHtml(path)}"${questionError(path, errors) ? '' : ' hidden'}>${escapeHtml(questionError(path, errors))}</p>
  </div>`;
}

function choicesQuestion({path, label, help = '', options = [], value, kind = 'single', exclusive = [], errors = [], idPrefix = 'choice'}) {
  const selected = Array.isArray(value) ? value : value;
  const inputType = kind === 'multi' ? 'checkbox' : 'radio';
  const name = idFor(path);
  const optionsHtml = options.map(option => {
    const id = text(option.id);
    const inputId = idFor(`${idPrefix}-${path}-${id}`);
    const checked = kind === 'multi' ? Array.isArray(selected) && selected.includes(id) : selected === id;
    const exclusiveAttr = kind === 'multi' ? ` data-exclusive="${escapeHtml(exclusive.join(','))}"` : '';
    return `<label class="choice" for="${escapeHtml(inputId)}">
      <input id="${escapeHtml(inputId)}" type="${inputType}" name="${escapeHtml(name)}" value="${escapeHtml(id)}" data-path="${escapeHtml(path)}" data-kind="${escapeHtml(kind)}"${exclusiveAttr}${checked ? ' checked' : ''}>
      <span class="choice-body"><span class="choice-label">${escapeHtml(option.label)}</span>${option.hint ? `<span class="choice-hint">${escapeHtml(option.hint)}</span>` : ''}</span>
    </label>`;
  }).join('');
  return `<fieldset class="question-group" data-question-path="${escapeHtml(path)}">
    <legend>${escapeHtml(label)}</legend>
    ${help ? `<p class="field-hint">${escapeHtml(help)}</p>` : ''}
    <div class="choices">${optionsHtml}</div>
    ${errorElement(path, errors)}
  </fieldset>`;
}

function booleanQuestion({path, label, help = '', value = false, errors = []}) {
  const inputId = idFor(`boolean-${path}`);
  return `<fieldset class="question-group">
    <legend>${escapeHtml(label)}</legend>
    ${help ? `<p class="field-hint">${escapeHtml(help)}</p>` : ''}
    <label class="choice" for="${escapeHtml(inputId)}"><input id="${escapeHtml(inputId)}" type="checkbox" name="${escapeHtml(path)}" value="true" data-path="${escapeHtml(path)}" data-kind="boolean"${value ? ' checked' : ''}><span class="choice-body"><span class="choice-label">${escapeHtml(label)}</span></span></label>
    ${errorElement(path, errors)}
  </fieldset>`;
}

function selectQuestion({path, label, help = '', options = [], value, errors = []}) {
  const inputId = idFor(`select-${path}`);
  const optionsHtml = [`<option value="">Choose an option</option>`, ...options.map(option => `<option value="${escapeHtml(option.id)}"${value === option.id ? ' selected' : ''}>${escapeHtml(option.label)}</option>`)].join('');
  return `<div class="question-group">
    <label class="field-label" for="${escapeHtml(inputId)}">${escapeHtml(label)}</label>
    ${help ? `<p class="field-hint">${escapeHtml(help)}</p>` : ''}
    <select id="${escapeHtml(inputId)}" name="${escapeHtml(path)}" class="select locality-control" data-path="${escapeHtml(path)}" data-kind="select">${optionsHtml}</select>
    ${errorElement(path, errors)}
  </div>`;
}

function numberInput({path, label, value, errors = []}) {
  const inputId = idFor(`number-${path}`);
  const shown = value === undefined || value === null ? '' : value;
  return `<div><label class="sr-only" for="${escapeHtml(inputId)}">${escapeHtml(label)}</label><input id="${escapeHtml(inputId)}" class="text-input" type="number" min="0" step="1" inputmode="numeric" value="${escapeHtml(shown)}" data-path="${escapeHtml(path)}" data-kind="number"${questionError(path, errors) ? ' aria-invalid="true"' : ''}>${errorElement(path, errors)}</div>`;
}

function renderIntro(lines, className = 'question-intro') {
  return (Array.isArray(lines) ? lines : [lines]).filter(line => line !== undefined && line !== null).map((line, index) => `<p class="${className}${index === 0 ? ' intro-line' : ''}">${escapeHtml(line)}</p>`).join('');
}

function renderAbout(spec, model, answers, errors) {
  const page = specPage(spec, 'about');
  const visible = model.visibleLocationFields(answers);
  const grouped = new Map();
  for (const question of page.questions || []) {
    if (question.id === 'suburb' && !visible.includes('suburb')) continue;
    if (question.id === 'suburb_other' && !visible.includes('suburb_other')) continue;
    if (question.id === 'past_residence' && !visible.includes('past_residence')) continue;
    if (question.id === 'time_local' && !visible.includes('time_local')) continue;
    if (question.id === 'time_past' && !visible.includes('time_past')) continue;
    const group = question.group || 'About you';
    if (!grouped.has(group)) grouped.set(group, []);
    grouped.get(group).push(question);
  }
  const sections = [...grouped.values()].map(questions => {
    const content = questions.map(question => {
      const path = question.id;
      if (question.type === 'single') return choicesQuestion({path, label: question.label, help: question.help, options: question.options, value: answers[path], errors});
      if (question.type === 'text') return textQuestion({path, label: question.label, help: question.help, value: readPath(answers, path), maxLength: question.max_length, errors});
      if (question.type === 'locality_select') {
        const area = answers.residence_area;
        const localities = spec.geography.localities.filter(locality => locality.region === area);
        const options = [...localities, ...spec.geography.extra_locality_options];
        return selectQuestion({path, label: question.label, help: question.help, options, value: answers[path], errors});
      }
      if (question.type === 'dependants_grid') {
        if (answers.has_dependants !== 'yes') return '';
        const grid = answers.dependants?.counts || {};
        return `<fieldset class="question-group"><legend>${escapeHtml(question.label)}</legend>${question.help ? `<p class="field-hint">${escapeHtml(question.help)}</p>` : ''}<div class="dependant-grid"><div></div>${question.columns.map(column => `<div class="grid-head">${escapeHtml(column.label)}</div>`).join('')}${question.rows.map(row => `<div class="grid-row-label">${escapeHtml(row.label)}</div>${question.columns.map(column => numberInput({path: `dependants.counts.${row.id}.${column.id}`, label: `${row.label}: ${column.label}`, value: grid[row.id]?.[column.id], errors})).join('')}`).join('')}</div>${errorElement('dependants', errors)}</fieldset>`;
      }
      return '';
    }).join('');
    return `<div class="about-fields">${content}</div>`;
  }).join('');
  return `<section class="survey-layout dual-page"><h1 tabindex="-1">${escapeHtml(page.title)}</h1>${renderIntro(page.intro)}${sections}${renderActions({})}</section>`;
}

function renderActions({back = true, continueLabel = 'Continue', leave = true} = {}) {
  return `<div class="question-actions">${back ? '<button type="button" class="back-button" data-action="back">Back</button>' : '<span></span>'}<div class="action-right"><button type="button" class="button primary" data-action="continue">${escapeHtml(continueLabel)}</button>${leave ? '<button type="button" class="skip-button" data-action="leave">Leave survey</button>' : ''}</div></div>`;
}

function renderWelcome(spec, answers, errors) {
  const page = specPage(spec, 'welcome');
  const consent = page.questions[0].options[0];
  return `<section class="welcome dual-page"><h1 tabindex="-1">${escapeHtml(page.title)}</h1><div class="welcome-intro">${renderIntro(page.intro, 'lead')}</div>${page.sections.map(section => `<section class="information-block"><h2>${escapeHtml(section.title)}</h2><p>${escapeHtml(section.text)}</p></section>`).join('')}<p class="contact-note">${escapeHtml(page.contact_note)}</p><div class="resource-links">${page.links.map(link => `<a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">${escapeHtml(link.label)}</a>`).join('')}</div><details class="source-note"><summary>About this questionnaire</summary><p>${escapeHtml(page.source_note)}</p></details><div class="welcome-card"><label class="choice" for="adult-consent"><input id="adult-consent" type="checkbox" data-path="consent" data-kind="consent"${answers.consent === 'adult_agree' ? ' checked' : ''} aria-describedby="consent-error"><span class="choice-body"><span class="choice-label">${escapeHtml(consent.label)}</span></span></label><p id="consent-error" class="field-error"${questionError('consent', errors) ? '' : ' hidden'}>${escapeHtml(questionError('consent', errors))}</p>${renderActions({back: false, continueLabel: 'Start survey'})}</div><p class="funding-acknowledgement">${escapeHtml(page.funding_acknowledgement)}</p></section>`;
}

function renderExperience(spec, answers, errors) {
  const page = specPage(spec, 'experience');
  const questions = page.questions.map(question => textQuestion({path: `responses.${question.id}`, label: question.label, help: question.help, privacyHint: question.privacy_hint, value: answers.responses?.[question.id], maxLength: question.max_length, rows: question.rows, errors, className: 'narrative-answer'})).join('');
  return `<section class="survey-layout dual-page experience-page"><h1 tabindex="-1">${escapeHtml(page.title)}</h1>${renderIntro(page.intro)}${questions}<div class="submit-confirmation"><label class="choice" for="confirm-answers"><input id="confirm-answers" type="checkbox" data-path="confirmed" data-kind="confirmation" aria-describedby="confirmation-error"${confirmed ? ' checked' : ''}><span class="choice-body"><span class="choice-label">${escapeHtml(page.confirmation_label)}</span></span></label><p id="confirmation-error" class="field-error"${questionError('confirmed', errors) ? '' : ' hidden'}>${escapeHtml(questionError('confirmed', errors))}</p></div>${renderActions({continueLabel: 'Confirm and submit'})}</section>`;
}

function renderThanks(spec) {
  const page = specPage(spec, 'thanks');
  return `<section class="finish dual-page"><h1 tabindex="-1">${escapeHtml(page.title)}</h1>${renderIntro(page.intro)}<div class="thanks-links">${page.links.map(link => `<a class="button secondary" href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">${escapeHtml(link.label)}</a>`).join('')}</div></section>`;
}

let spec;
let model;
let answers = {};
let pageId = 'welcome';
let errors = [];
let confirmed = false;
let dirty = false;

function render({preserveFocus = false} = {}) {
  const focusId = preserveFocus ? document.activeElement?.id : null;
  const pages = ['welcome', 'about', 'experience', 'thanks'];
  const index = pages.indexOf(pageId);
  let content;
  if (pageId === 'welcome') content = renderWelcome(spec, answers, errors);
  else if (pageId === 'about') content = renderAbout(spec, model, answers, errors);
  else if (pageId === 'experience') content = renderExperience(spec, answers, errors);
  else if (pageId === 'thanks') content = renderThanks(spec);
  else {
    const screen = spec.system_screens[pageId];
    content = `<section class="finish dual-page"><h1 tabindex="-1">${escapeHtml(screen.title)}</h1><p class="lead">${escapeHtml(screen.text)}</p><div class="finish-actions"><button class="button secondary" type="button" data-action="${pageId === 'out_of_scope' ? 'back' : 'reset'}">${pageId === 'out_of_scope' ? 'Back' : 'Return to the start'}</button>${pageId === 'out_of_scope' ? '<button class="skip-button" type="button" data-action="leave">Leave survey</button>' : ''}</div></section>`;
  }
  const summary = errors.length ? `<div class="survey-errors" role="alert"><p>Please check the following:</p><ul>${errors.map(error => `<li>${escapeHtml(error.message)}</li>`).join('')}</ul></div>` : '';
  const progress = index >= 0 ? `<p class="page-progress">Page ${index + 1} of 4</p>` : '';
  main.innerHTML = progress + content;
  main.dataset.page = pageId;
  if (summary) main.querySelector('h1').insertAdjacentHTML('afterend', summary);
  if (preserveFocus && focusId) document.getElementById(focusId)?.focus({preventScroll: true});
  else {
    main.querySelector('h1')?.focus({preventScroll: true});
    window.scrollTo({top: 0, behavior: 'instant'});
  }
  if (errors.length && !preserveFocus) {
    const first = errors[0].path;
    const target = first === 'confirmed' ? document.getElementById('confirm-answers') : first === 'consent' ? document.getElementById('adult-consent') : [...main.querySelectorAll('[data-path]')].find(element => element.dataset.path === first);
    target?.focus();
  }
}

function routeTo(next) {
  pageId = next;
  errors = [];
  render();
}

function clearAnswers() {
  answers = {};
  confirmed = false;
  dirty = false;
}

function continueSurvey() {
  errors = model.validate(answers, pageId);
  if (pageId === 'experience' && !confirmed) errors.push({path: 'confirmed', message: 'Please check your answers and tick the confirmation before submitting.'});
  if (errors.length) { render(); return; }
  if (pageId === 'welcome') routeTo('about');
  else if (pageId === 'about') routeTo(answers.current_connection === 'no' ? 'out_of_scope' : 'experience');
  else if (pageId === 'experience') {
    // This presentation release has no answer receiver. Do not claim receipt,
    // persist a response, or introduce transport without the collection handover.
    clearAnswers();
    routeTo('thanks');
  }
}

function updateField(element) {
  const path = element.dataset.path;
  const kind = element.dataset.kind;
  if (!path) return;
  if (kind === 'confirmation') { confirmed = element.checked; return; }
  let value;
  if (kind === 'consent') value = element.checked ? 'adult_agree' : undefined;
  else if (kind === 'single') { if (!element.checked) return; value = element.value; }
  else if (kind === 'number') value = element.validity.badInput ? NaN : element.value === '' ? undefined : Number(element.value);
  else value = normaliseNewlines(element.value);
  setPath(answers, path, value);
  dirty = true;
  confirmed = false;
  document.getElementById('confirm-answers')?.removeAttribute('checked');
  const confirmation = document.getElementById('confirm-answers');
  if (confirmation) confirmation.checked = false;
  if (kind === 'text') {
    const count = characterCount(value);
    const limit = Number(element.dataset.maxLength);
    const output = [...main.querySelectorAll('[data-count-for]')].find(item => item.dataset.countFor === path);
    if (output) { output.textContent = `${count.toLocaleString('en-AU')} / ${limit.toLocaleString('en-AU')} characters`; output.classList.toggle('is-over-limit', count > limit); }
    return;
  }
  if (['single', 'select'].includes(kind)) {
    answers = model.reconcile(answers);
    errors = [];
    render({preserveFocus: true});
  }
}

main?.addEventListener('input', event => {
  if (['text', 'number'].includes(event.target?.dataset?.kind)) updateField(event.target);
});
main?.addEventListener('change', event => {
  if (!['text', 'number'].includes(event.target?.dataset?.kind)) updateField(event.target);
});
main?.addEventListener('click', event => {
  const control = event.target.closest?.('[data-action]');
  if (!control || !main.contains(control)) return;
  event.preventDefault();
  const action = control.dataset.action;
  if (action === 'continue') continueSurvey();
  else if (action === 'back') routeTo(pageId === 'experience' || pageId === 'out_of_scope' ? 'about' : 'welcome');
  else if (action === 'leave') {
    if (dirty && !window.confirm('Leave the survey? Your answers will be cleared.')) return;
    clearAnswers();
    routeTo('exit');
  } else if (action === 'reset') { clearAnswers(); routeTo('welcome'); }
});

window.addEventListener('beforeunload', event => {
  if (!dirty) return;
  event.preventDefault();
  event.returnValue = '';
});
window.addEventListener('pagehide', () => clearAnswers());
window.addEventListener('pageshow', event => {
  if (event.persisted && model) { clearAnswers(); routeTo('welcome'); }
});

async function boot() {
  if (!main) return;
  try {
    const url = new URL('./survey-spec.json', moduleUrl);
    const revision = new URL(moduleUrl).searchParams.get('v');
    if (revision) url.searchParams.set('v', revision);
    const response = await fetch(url);
    if (!response.ok) throw new Error('Please refresh the page and try again.');
    spec = await response.json();
    model = createAdultSurveyModel(spec);
    render();
  } catch {
    main.innerHTML = '<section class="finish"><h1>Unable to load this questionnaire</h1><p>Please refresh the page and try again.</p></section>';
  }
}
boot();
