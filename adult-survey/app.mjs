import {createAdultSurveyModel, characterCount, normaliseNewlines} from './model.mjs?v=20260930-3';
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

function textQuestion({path, label, help = '', privacyHint = '', value = '', rows = 6, maxLength = 10000, errors = [], className = ''}) {
  const inputId = idFor(`text-${path}`);
  const normalised = normaliseNewlines(value);
  const descriptions = [help && `${inputId}-hint`, privacyHint && `${inputId}-privacy`, `${inputId}-error`].filter(Boolean).join(' ');
  return `<div class="question-group text-question${className ? ` ${escapeHtml(className)}` : ''}">
    <label class="field-label" for="${escapeHtml(inputId)}">${escapeHtml(label)}</label>
    ${help ? `<p id="${inputId}-hint" class="field-hint">${escapeHtml(help)}</p>` : ''}
    ${privacyHint ? `<p id="${inputId}-privacy" class="privacy-hint">${escapeHtml(privacyHint)}</p>` : ''}
    <textarea id="${escapeHtml(inputId)}" name="${escapeHtml(path)}" class="textarea" rows="${Number(rows) || 6}" aria-describedby="${descriptions} ${inputId}-limit"${questionError(path, errors) ? ' aria-invalid="true"' : ''} spellcheck="true" data-path="${escapeHtml(path)}" data-kind="text" data-max-length="${maxLength}">${escapeHtml(normalised)}</textarea>
    <p id="${inputId}-limit" class="limit-hint" data-limit-for="${escapeHtml(path)}" hidden></p>
    <p id="${inputId}-error" class="field-error" data-error-for="${escapeHtml(path)}"${questionError(path, errors) ? '' : ' hidden'}>${escapeHtml(questionError(path, errors))}</p>
  </div>`;
}

function choicesQuestion({path, label, help = '', options = [], value, primaryIds = [], secondaryIds = [], disclosureLabel = 'Other area', errors = [], idPrefix = 'choice'}) {
  const name = idFor(path);
  const optionMarkup = option => {
    const id = text(option.id);
    const inputId = idFor(`${idPrefix}-${path}-${id}`);
    return `<label class="choice" for="${escapeHtml(inputId)}">
      <input id="${escapeHtml(inputId)}" type="radio" name="${escapeHtml(name)}" value="${escapeHtml(id)}" data-path="${escapeHtml(path)}" data-kind="single"${value === id ? ' checked' : ''}>
      <span class="choice-body"><span class="choice-label">${escapeHtml(option.label)}</span>${option.hint ? `<span class="choice-hint">${escapeHtml(option.hint)}</span>` : ''}</span>
    </label>`;
  };
  const optionsHtml = primaryIds.length
    ? `<div class="choices area-primary-choices">${options.filter(option => primaryIds.includes(option.id)).map(optionMarkup).join('')}</div><details class="area-other-options"${secondaryIds.includes(value) ? ' open' : ''}><summary>${escapeHtml(disclosureLabel)}</summary><div class="choices">${options.filter(option => secondaryIds.includes(option.id)).map(optionMarkup).join('')}</div></details>`
    : `<div class="choices">${options.map(optionMarkup).join('')}</div>`;
  return `<fieldset class="question-group" data-question-path="${escapeHtml(path)}">
    <legend>${escapeHtml(label)}</legend>
    ${help ? `<p class="field-hint">${escapeHtml(help)}</p>` : ''}
    ${optionsHtml}
    ${present(value) ? `<button type="button" class="clear-answer" data-action="clear-answer" data-path="${escapeHtml(path)}" aria-label="${escapeHtml(`Clear answer: ${label}`)}">Clear answer</button>` : ''}
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

function numberInput({path, label, value, min = 0, max = Number.MAX_SAFE_INTEGER, errors = []}) {
  const inputId = idFor(`number-${path}`);
  const shown = value === undefined || value === null ? '' : value;
  return `<div class="number-field"><label class="field-label" for="${escapeHtml(inputId)}">${escapeHtml(label)}</label><input id="${escapeHtml(inputId)}" class="text-input" type="number" min="${min}" max="${max}" step="1" inputmode="numeric" value="${escapeHtml(shown)}" data-path="${escapeHtml(path)}" data-kind="number"${questionError(path, errors) ? ' aria-invalid="true"' : ''}>${errorElement(path, errors)}</div>`;
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
    const group = question.group || 'About you';
    if (!grouped.has(group)) grouped.set(group, []);
    grouped.get(group).push(question);
  }
  const sections = [...grouped.values()].map(questions => {
    const content = questions.map(question => {
      const path = question.id;
      if (question.type === 'single') return choicesQuestion({path, label: question.label, help: question.help, options: question.options, value: answers[path], primaryIds: question.primary_option_ids, secondaryIds: question.secondary_option_ids, disclosureLabel: question.disclosure_label, errors});
      if (question.type === 'text') return textQuestion({path, label: question.label, help: question.help, value: readPath(answers, path), maxLength: question.max_length, errors});
      if (question.type === 'locality_select') {
        const area = answers.residence_area;
        const localities = spec.geography.localities.filter(locality => locality.region === area);
        const options = [...localities, ...spec.geography.extra_locality_options];
        return selectQuestion({path, label: question.label, help: question.help, options, value: answers[path], errors});
      }
      if (question.type === 'integer_group') {
        if (question.id === 'dependants_count' && answers.has_dependants !== 'yes') return '';
        return `<fieldset class="question-group"><legend>${escapeHtml(question.label)}</legend>${question.help ? `<p class="field-hint">${escapeHtml(question.help)}</p>` : ''}<div class="number-pair${question.id === 'nt_duration' ? ' duration-fields' : ''}">${question.fields.map(field => numberInput({...field, value: readPath(answers, field.path), errors})).join('')}</div></fieldset>`;
      }
      return '';
    }).join('');
    return `<div class="about-fields">${content}</div>`;
  }).join('');
  return `<section class="survey-layout dual-page"><h1 tabindex="-1">${escapeHtml(page.title)}</h1>${renderIntro(page.intro)}${sections}${renderActions({})}</section>`;
}

function renderActions({back = true, continueLabel = 'Continue'} = {}) {
  return `<div class="question-actions">${back ? '<button type="button" class="back-button" data-action="back">Back</button>' : '<span></span>'}<button type="button" class="button primary" data-action="continue">${escapeHtml(continueLabel)}</button></div>`;
}

function renderWelcome(spec, answers, errors) {
  const page = specPage(spec, 'welcome');
  const consent = page.questions[0].options[0];
  const linkMarkup = link => `<a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">${escapeHtml(link.label)}</a>`;
  const source = page.source_links || [];
  const sourceText = source.length === 2 ? `This questionnaire draws on RAND’s <em>${linkMarkup(source[0])}</em> and the <em>${linkMarkup(source[1])}</em>.` : escapeHtml(page.source_note);
  return `<section class="welcome dual-page"><h1 tabindex="-1">${escapeHtml(page.title)}</h1><div class="welcome-intro">${page.intro.map((line, index) => `<p class="lead${index === 1 ? ' welcome-invitation' : ''}">${escapeHtml(line)}</p>`).join('')}</div>${page.sections.map(section => `<section class="information-block"><h2>${escapeHtml(section.title)}</h2><p>${escapeHtml(section.text)}</p></section>`).join('')}<div class="resource-links">${page.links.map(linkMarkup).join('')}</div><details class="privacy-details"><summary>${escapeHtml(page.privacy_detail.title)}</summary>${page.privacy_detail.paragraphs.map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join('')}</details><p class="contact-note">${escapeHtml(page.contact_note)} <a href="${escapeHtml(page.contact_link.url)}">${escapeHtml(page.contact_link.label)}</a></p><div class="welcome-card"><h2>Your agreement</h2><label class="choice" for="adult-consent"><input id="adult-consent" type="checkbox" data-path="consent" data-kind="consent"${answers.consent === 'adult_agree' ? ' checked' : ''} aria-describedby="consent-error"><span class="choice-body"><span class="choice-label">${escapeHtml(consent.label)}</span></span></label><p id="consent-error" class="field-error"${questionError('consent', errors) ? '' : ' hidden'}>${escapeHtml(questionError('consent', errors))}</p>${renderActions({back: false, continueLabel: 'Start survey'})}</div><footer class="questionnaire-footer"><p class="funding-acknowledgement">${escapeHtml(page.funding_acknowledgement)}</p><details class="source-note"><summary>About this questionnaire</summary><p>${sourceText}</p></details></footer></section>`;
}

function renderExperience(spec, answers, errors) {
  const page = specPage(spec, 'experience');
  const questions = page.questions.map(question => textQuestion({path: `responses.${question.id}`, label: question.label, help: question.help, privacyHint: question.privacy_hint, value: answers.responses?.[question.id], maxLength: question.max_length, rows: question.rows, errors, className: 'narrative-answer'})).join('');
  return `<section class="survey-layout dual-page experience-page"><h1 tabindex="-1">${escapeHtml(page.title)}</h1><p class="page-subtitle">${escapeHtml(page.subtitle || '')}</p>${renderIntro(page.intro)}${questions}<div class="submit-confirmation"><label class="choice" for="confirm-answers"><input id="confirm-answers" type="checkbox" data-path="confirmed" data-kind="confirmation" aria-describedby="confirmation-error"${confirmed ? ' checked' : ''}><span class="choice-body"><span class="choice-label">${escapeHtml(page.confirmation_label)}</span></span></label><p id="confirmation-error" class="field-error"${questionError('confirmed', errors) ? '' : ' hidden'}>${escapeHtml(questionError('confirmed', errors))}</p></div>${renderActions({continueLabel: 'Confirm and submit'})}</section>`;
}

function renderThanks(spec) {
  const page = specPage(spec, 'thanks');
  return `<section class="finish dual-page"><h1 tabindex="-1">${escapeHtml(page.title)}</h1>${renderIntro(page.intro)}<div class="finish-next-steps">${page.links.map((link, index) => `<section class="${index === 0 ? 'finish-contact' : 'thank-you-resource'}"><p>${escapeHtml(link.description || '')}</p><a class="button primary" href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">${escapeHtml(link.label)}</a></section>`).join('')}</div></section>`;
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
    content = `<section class="finish dual-page"><h1 tabindex="-1">${escapeHtml(screen.title)}</h1><p class="lead">${escapeHtml(screen.text)}</p><div class="finish-actions"><button class="button secondary" type="button" data-action="back">Back</button></div></section>`;
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
  const previousState = {residence_area: answers.residence_area};
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
    const hint = [...main.querySelectorAll('[data-limit-for]')].find(item => item.dataset.limitFor === path);
    if (hint && !hint.hidden) showTextLimit(element);
    return;
  }
  if (['single', 'select'].includes(kind)) {
    answers = model.reconcile(answers, previousState);
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
function showTextLimit(element) {
  const path = element.dataset.path;
  const limit = Number(element.dataset.maxLength);
  const overLimit = characterCount(element.value) > limit;
  const hint = [...main.querySelectorAll('[data-limit-for]')].find(item => item.dataset.limitFor === path);
  if (hint) {
    hint.hidden = !overLimit;
    hint.textContent = overLimit ? `Please keep this answer to ${limit.toLocaleString('en-AU')} characters or fewer. Your full text is still in the box for you to edit.` : '';
  }
  if (overLimit) element.setAttribute('aria-invalid', 'true');
  else element.removeAttribute('aria-invalid');
}
main?.addEventListener('focusout', event => {
  if (event.target?.dataset?.kind === 'text') showTextLimit(event.target);
});
main?.addEventListener('click', event => {
  const control = event.target.closest?.('[data-action]');
  if (!control || !main.contains(control)) return;
  event.preventDefault();
  const action = control.dataset.action;
  if (action === 'continue') continueSurvey();
  else if (action === 'back') routeTo(pageId === 'experience' || pageId === 'out_of_scope' ? 'about' : 'welcome');
  else if (action === 'clear-answer') {
    const previousState = {residence_area: answers.residence_area};
    setPath(answers, control.dataset.path, undefined);
    answers = model.reconcile(answers, previousState);
    confirmed = false;
    dirty = true;
    errors = [];
    render({preserveFocus: true});
    const question = [...main.querySelectorAll('[data-question-path]')].find(item => item.dataset.questionPath === control.dataset.path);
    question?.querySelector('input')?.focus({preventScroll: true});
  }
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
