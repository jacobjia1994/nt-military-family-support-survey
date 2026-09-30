import {createAdultSurveyModel, characterCount, normaliseNewlines, ensureExperiences, appendExperience, removeExperience} from './model.mjs?v=20260930-16';
const moduleUrl = import.meta.url;
const main = document.querySelector('#main');
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
  const parts = pathParts(path);
  if (parts[0] === 'experiences') return parts.slice(2).reduce((value, part) => value?.[part], object.experiences?.find(item => item.id === parts[1]));
  return parts.reduce((value, part) => value?.[part], object);
}

function setPath(object, path, value) {
  const parts = pathParts(path);
  if (!parts.length) return;
  let target = object;
  if (parts[0] === 'experiences') {
    target = object.experiences?.find(item => item.id === parts[1]);
    if (!target) return;
    parts.splice(0, 2);
  }
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

function textQuestion({path, label, help = '', value = '', rows = 6, maxLength = 5000, errors = [], className = '', required = true}) {
  const inputId = idFor(`text-${path}`);
  const normalised = normaliseNewlines(value);
  const descriptions = [help && `${inputId}-hint`, `${inputId}-error`].filter(Boolean).join(' ');
  return `<div class="question-group text-question${className ? ` ${escapeHtml(className)}` : ''}">
    <label class="field-label" for="${escapeHtml(inputId)}">${escapeHtml(label)}</label>
    ${help ? `<p id="${inputId}-hint" class="field-hint">${escapeHtml(help)}</p>` : ''}
    <textarea id="${escapeHtml(inputId)}" name="${escapeHtml(path)}" class="textarea" rows="${Number(rows) || 6}"${required ? ' required aria-required="true"' : ''} aria-describedby="${descriptions} ${inputId}-limit"${questionError(path, errors) ? ' aria-invalid="true"' : ''} spellcheck="true" data-path="${escapeHtml(path)}" data-kind="text" data-max-length="${maxLength}">${escapeHtml(normalised)}</textarea>
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
      <input id="${escapeHtml(inputId)}" type="radio" name="${escapeHtml(name)}" value="${escapeHtml(id)}" required aria-required="true" data-path="${escapeHtml(path)}" data-kind="single"${value === id ? ' checked' : ''}>
      <span class="choice-body"><span class="choice-label">${escapeHtml(option.label)}</span>${option.hint ? `<span class="choice-hint">${escapeHtml(option.hint)}</span>` : ''}</span>
    </label>`;
  };
  const optionsHtml = primaryIds.length
    ? `<div class="choices area-primary-choices">${options.filter(option => primaryIds.includes(option.id)).map(optionMarkup).join('')}</div><details class="area-other-options"${secondaryIds.includes(value) ? ' open' : ''}><summary>${escapeHtml(disclosureLabel)}</summary><div class="choices">${options.filter(option => secondaryIds.includes(option.id)).map(optionMarkup).join('')}</div></details><div class="choices refusal-choices">${options.filter(option => !primaryIds.includes(option.id) && !secondaryIds.includes(option.id)).map(optionMarkup).join('')}</div>`
    : `<div class="choices">${options.map(optionMarkup).join('')}</div>`;
  return `<fieldset class="question-group" data-question-path="${escapeHtml(path)}">
    <legend>${escapeHtml(label)}</legend>
    ${help ? `<p class="field-hint">${escapeHtml(help)}</p>` : ''}
    ${optionsHtml}
    ${errorElement(path, errors)}
  </fieldset>`;
}

function multipleChoicesQuestion({path, label, help = '', options = [], value, errors = [], other = ''}) {
  const selected = Array.isArray(value) ? value : [];
  const questionId = idFor(`multiple-${path}`);
  return `<fieldset class="question-group" data-question-path="${escapeHtml(path)}" aria-describedby="${questionId}-hint ${questionId}-error">
    <legend>${escapeHtml(label)}</legend>
    ${help ? `<p id="${questionId}-hint" class="field-hint">${escapeHtml(help)}</p>` : ''}
    <div class="choices">${options.map(option => {
      const inputId = idFor(`choice-${path}-${option.id}`);
      return `<label class="choice" for="${escapeHtml(inputId)}"><input id="${escapeHtml(inputId)}" type="checkbox" name="${escapeHtml(path)}" value="${escapeHtml(option.id)}" data-path="${escapeHtml(path)}" data-kind="multiple"${selected.includes(option.id) ? ' checked' : ''}><span class="choice-body"><span class="choice-label">${escapeHtml(option.label)}</span></span></label>${option.id === 'other' ? other : ''}`;
    }).join('')}</div>
    <p id="${questionId}-error" class="field-error" data-error-for="${escapeHtml(path)}"${questionError(path, errors) ? '' : ' hidden'}>${escapeHtml(questionError(path, errors))}</p>
  </fieldset>`;
}

function selectQuestion({path, label, help = '', options = [], value, errors = [], other = ''}) {
  const inputId = idFor(`select-${path}`);
  const optionsHtml = [`<option value="">Choose an option</option>`, ...options.map(option => `<option value="${escapeHtml(option.id)}"${value === option.id ? ' selected' : ''}>${escapeHtml(option.label)}</option>`)].join('');
  return `<div class="question-group">
    <label class="field-label" for="${escapeHtml(inputId)}">${escapeHtml(label)}</label>
    ${help ? `<p class="field-hint">${escapeHtml(help)}</p>` : ''}
    <select id="${escapeHtml(inputId)}" name="${escapeHtml(path)}" class="select locality-control" required aria-required="true" data-path="${escapeHtml(path)}" data-kind="select">${optionsHtml}</select>
    ${other}
    ${errorElement(path, errors)}
  </div>`;
}

function numberInput({path, label, value, min = 0, max = Number.MAX_SAFE_INTEGER, errors = []}) {
  const inputId = idFor(`number-${path}`);
  const shown = value === undefined || value === null ? '' : value;
  return `<div class="number-field"><label class="field-label" for="${escapeHtml(inputId)}">${escapeHtml(label)}</label><input id="${escapeHtml(inputId)}" class="text-input" type="number" min="${min}" max="${max}" step="1" inputmode="numeric" required aria-required="true" value="${escapeHtml(shown)}" data-path="${escapeHtml(path)}" data-kind="number"${questionError(path, errors) ? ' aria-invalid="true"' : ''}>${errorElement(path, errors)}</div>`;
}

function renderIntro(lines, className = 'question-intro') {
  return (Array.isArray(lines) ? lines : [lines]).filter(line => line !== undefined && line !== null).map((line, index) => `<p class="${className}${index === 0 ? ' intro-line' : ''}">${escapeHtml(line)}</p>`).join('');
}

function singleLineQuestion({path, label, value = '', maxLength = 5000, errors = []}) {
  const inputId = idFor(`text-${path}`);
  return `<div class="other-specify"><label class="field-label" for="${inputId}">${escapeHtml(label)}</label><input id="${inputId}" class="text-input" type="text" name="${escapeHtml(path)}" required aria-required="true" aria-describedby="${inputId}-error ${inputId}-limit" data-path="${escapeHtml(path)}" data-kind="text" data-max-length="${maxLength}" value="${escapeHtml(value)}"><p id="${inputId}-error" class="field-error" data-error-for="${escapeHtml(path)}"${questionError(path, errors) ? '' : ' hidden'}>${escapeHtml(questionError(path, errors))}</p><p id="${inputId}-limit" class="limit-hint" data-limit-for="${escapeHtml(path)}" hidden></p></div>`;
}

function renderAbout(spec, model, answers, errors) {
  const page = specPage(spec, 'about');
  const visible = model.visibleLocationFields(answers);
  const content = page.questions.map(question => {
    const path = question.id;
    if (['suburb_other', 'community_connection_other'].includes(path)) return '';
    if (path === 'suburb' && !visible.includes('suburb')) return '';
    if (path === 'dependants_count' && answers.has_dependants !== 'yes') return '';
    if (question.type === 'single') return choicesQuestion({path, label: question.label, help: question.help, options: question.options, value: answers[path], primaryIds: question.primary_option_ids, secondaryIds: question.secondary_option_ids, disclosureLabel: question.disclosure_label, errors});
    if (question.type === 'multiple') {
      const detail = page.questions.find(item => item.id === 'community_connection_other');
      const other = Array.isArray(answers[path]) && answers[path].includes('other') ? singleLineQuestion({path: detail.id, label: detail.label, value: answers[detail.id], maxLength: detail.max_length, errors}) : '';
      return multipleChoicesQuestion({path, label: question.label, help: question.help, options: question.options, value: answers[path], errors, other});
    }
    if (question.type === 'locality_select') {
      const options = [...spec.geography.localities.filter(locality => locality.region === answers.residence_area), ...spec.geography.extra_locality_options];
      const detail = page.questions.find(item => item.id === 'suburb_other');
      const other = visible.includes('suburb_other') ? singleLineQuestion({path: detail.id, label: detail.label, value: answers[detail.id], maxLength: detail.max_length, errors}) : '';
      return selectQuestion({path, label: question.label, help: question.help, options, value: answers[path], errors, other});
    }
    if (question.type === 'integer_group') {
      const refused = readPath(answers, question.refusal_path) === true;
      const refusalId = idFor(`refusal-${path}`);
      return `<fieldset class="question-group"><legend>${escapeHtml(question.label)}</legend>${question.help ? `<p class="field-hint">${escapeHtml(question.help)}</p>` : ''}${refused ? '' : `<div class="number-pair${path === 'nt_duration' ? ' duration-fields' : ''}">${question.fields.map(field => numberInput({...field, value: readPath(answers, field.path), errors})).join('')}</div>`}<label class="numeric-refusal" for="${refusalId}"><input id="${refusalId}" type="checkbox" data-path="${escapeHtml(question.refusal_path)}" data-kind="numeric-refusal"${refused ? ' checked' : ''}><span>${escapeHtml(question.refusal_label)}</span></label></fieldset>`;
    }
    return '';
  }).join('');
  const actions = editingReview ? `<div class="question-actions"><button type="button" class="button primary" data-action="return-review">Return to review</button></div>` : renderActions();
  return `<section class="survey-layout dual-page"><h1 tabindex="-1">${escapeHtml(page.title)}</h1>${renderIntro(page.intro)}<div class="about-fields">${content}</div>${actions}</section>`;
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
  const contactLinks = `<div class="welcome-contact-line">${page.contact_links.map(link => `<p>${escapeHtml(link.purpose)}: <a href="${escapeHtml(link.url)}">${escapeHtml(link.label)}</a></p>`).join('')}${page.links.map(link => `<p>${linkMarkup(link)}</p>`).join('')}</div>`;
  return `<section class="welcome dual-page welcome-v3"><h1 tabindex="-1">${escapeHtml(page.title)}</h1><div class="welcome-intro">${page.intro.map((line, index) => `<p class="${index === 0 ? 'welcome-invitation' : 'welcome-purpose'}">${escapeHtml(line)}</p>`).join('')}</div><section class="welcome-information" aria-labelledby="welcome-information-title"><h2 id="welcome-information-title">${escapeHtml(page.information_title)}</h2><div class="welcome-information-grid">${page.information_blocks.map(block => `<section><h3>${escapeHtml(block.title)}</h3><p>${escapeHtml(block.text)}</p></section>`).join('')}</div><div class="welcome-agreement"><section class="welcome-eligibility"><h2>${escapeHtml(page.eligibility.title)}</h2><p>${escapeHtml(page.eligibility.text)}</p></section><label class="agreement-choice" for="adult-consent"><input id="adult-consent" type="checkbox" data-path="consent" data-kind="consent"${answers.consent === 'adult_agree' ? ' checked' : ''} aria-describedby="consent-error"${questionError('consent', errors) ? ' aria-invalid="true"' : ''}><span>${escapeHtml(consent.label)}</span></label><p id="consent-error" class="field-error"${questionError('consent', errors) ? '' : ' hidden'}>${escapeHtml(questionError('consent', errors))}</p></div></section>${renderActions({back: false, continueLabel: 'Start survey'})}<footer class="questionnaire-footer"><p class="funding-acknowledgement">${escapeHtml(page.funding_acknowledgement)}</p><p class="source-note">${sourceText}</p>${contactLinks}</footer></section>`;
}

function renderExperienceIntro(spec) {
  const page = specPage(spec, 'experience');
  return `<section class="survey-layout dual-page experience-intro"><h1 tabindex="-1">${escapeHtml(page.title)}</h1>${renderIntro(page.intro)}<p class="question-intro">${escapeHtml(page.privacy_notice)}</p><div class="question-actions"><button type="button" class="back-button" data-action="back">Back</button><button type="button" class="button primary" data-action="start-experience">${escapeHtml(page.start_button)}</button></div></section>`;
}

function renderExperience(spec, answers, errors) {
  const page = specPage(spec, 'experience');
  const current = answers.experiences.find(item => item.id === experienceId) || answers.experiences[0];
  experienceId = current.id;
  const index = answers.experiences.indexOf(current);
  const questions = page.questions.map(question => textQuestion({path: `experiences.${current.id}.responses.${question.id}`, label: question.label, help: question.help, value: current.responses?.[question.id], maxLength: question.max_length, rows: question.rows, errors, className: 'narrative-answer', required: false})).join('');
  const next = index < answers.experiences.length - 1 ? '<button type="button" class="button secondary" data-action="next-experience">Next experience</button>' : '';
  const finish = editingReview ? '<button type="button" class="button primary" data-action="return-review">Return to review</button>' : '<button type="button" class="button primary" data-action="finish-survey">Finish survey</button>';
  const deletion = deleteRequest ? `<section class="delete-experience-prompt" role="alert"><p>Delete Experience ${answers.experiences.findIndex(item => item.id === deleteRequest) + 1}? Its answers will be removed from this survey.</p><div><button type="button" class="button secondary" data-action="cancel-delete">Keep this experience</button><button type="button" class="button primary" data-action="confirm-delete">Delete experience</button></div></section>` : '';
  return `<section class="survey-layout dual-page experience-page" data-experience-id="${escapeHtml(current.id)}"><h1 tabindex="-1">Experience ${index + 1}</h1>${questions}<div class="experience-actions"><button type="button" class="back-button" data-action="back">Back</button>${next}<button type="button" class="button secondary" data-action="add-experience">Add another experience</button>${finish}</div>${answers.experiences.length > 1 ? '<button type="button" class="small-text-action delete-experience" data-action="delete-experience">Delete this experience</button>' : ''}${deletion}</section>`;
}

function renderReview(spec, model, answers, errors) {
  const config = specPage(spec, 'experience').review;
  const review = model.review(answers);
  const item = (question, path) => `<div class="review-item"><h3>${escapeHtml(question.label)}</h3><div class="review-answer" data-review-path="${escapeHtml(path)}">${question.answers.map(answer => `<p${answer === 'Not answered' ? ' class="review-empty"' : ''}>${escapeHtml(answer)}</p>`).join('')}</div></div>`;
  const about = `<section class="review-section"><div class="review-heading"><h2>A bit about you</h2><button type="button" class="review-edit" data-action="edit-background" aria-label="Edit this page: A bit about you">Edit this page</button></div>${review.about.map(question => item(question, question.id)).join('')}</section>`;
  const experiences = review.experiences.map(experience => `<section class="review-section" data-experience-id="${escapeHtml(experience.id)}"><div class="review-heading"><h2>Experience ${experience.number}</h2><button type="button" class="review-edit" data-action="edit-experience" data-experience-id="${escapeHtml(experience.id)}" aria-label="Edit this page: Experience ${experience.number}">Edit this page</button></div>${experience.questions.map(question => item(question, `experiences.${experience.id}.responses.${question.id}`)).join('')}</section>`).join('');
  return `<section class="survey-layout dual-page review-page"><h1 tabindex="-1">${escapeHtml(config.title)}</h1>${about}${experiences}<div class="submit-confirmation"><label class="choice" for="confirm-answers"><input id="confirm-answers" type="checkbox" data-path="confirmed" data-kind="confirmation" aria-describedby="confirmation-error"${confirmed ? ' checked' : ''}><span class="choice-body"><span class="choice-label">${escapeHtml(config.confirmation_label)}</span></span></label><p id="confirmation-error" class="field-error"${questionError('confirmed', errors) ? '' : ' hidden'}>${escapeHtml(questionError('confirmed', errors))}</p></div><div class="question-actions"><button type="button" class="back-button" data-action="back">Back</button><button type="button" class="button primary" data-action="submit-survey">Confirm and submit</button></div></section>`;
}

function renderThanks(spec) {
  const page = specPage(spec, 'thanks');
  return `<section class="finish dual-page"><h1 tabindex="-1">${escapeHtml(page.title)}</h1>${renderIntro(page.intro)}<div class="finish-next-steps">${page.links.map((link, index) => `<section class="${index === 0 ? 'finish-contact' : 'thank-you-resource'}"><p>${escapeHtml(link.description || '')}</p><a class="button primary" href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">${escapeHtml(link.label)}</a></section>`).join('')}</div></section>`;
}

let spec;
let model;
let answers = {};
let pageId = 'welcome';
let experienceId = null;
let introShown = false;
let editingReview = false;
let deleteRequest = null;
let errors = [];
let confirmed = false;

function render({preserveFocus = false} = {}) {
  const focusId = preserveFocus ? document.activeElement?.id : null;
  const activeStage = ['experience_intro', 'review'].includes(pageId) ? 'experience' : pageId === 'out_of_scope' ? 'about' : pageId;
  const stages = [['welcome', 'Welcome'], ['about', 'About you'], ['experience', 'Experiences'], ['thanks', 'Thank you']];
  let content;
  if (pageId === 'welcome') content = renderWelcome(spec, answers, errors);
  else if (pageId === 'about') content = renderAbout(spec, model, answers, errors);
  else if (pageId === 'experience_intro') content = renderExperienceIntro(spec);
  else if (pageId === 'experience') content = renderExperience(spec, answers, errors);
  else if (pageId === 'review') content = renderReview(spec, model, answers, errors);
  else if (pageId === 'thanks') content = renderThanks(spec);
  else {
    const screen = spec.system_screens[pageId];
    content = `<section class="finish dual-page"><h1 tabindex="-1">${escapeHtml(screen.title)}</h1><p class="lead">${escapeHtml(screen.text)}</p><div class="question-actions"><button class="button secondary" type="button" data-action="back">Back</button></div></section>`;
  }
  const activeStageIndex = stages.findIndex(([id]) => id === activeStage);
  const progress = `<div class="stage-progress"><div class="step-topline" aria-hidden="true"><span>${escapeHtml(stages[activeStageIndex][1])}</span></div><ol class="section-track" aria-label="Survey stages">${stages.map(([id, label], index) => `<li aria-label="${escapeHtml(label)}"${index <= activeStageIndex ? ' class="visited"' : ''}${id === activeStage ? ' aria-current="step"' : ''}><span class="stage-label sr-only">${escapeHtml(label)}</span></li>`).join('')}</ol></div>`;
  main.innerHTML = progress + content;
  main.dataset.page = pageId;
  if (errors.length) main.querySelector('h1').insertAdjacentHTML('afterend', '<div class="survey-errors" role="alert"><p>Please check the highlighted questions.</p></div>');
  if (preserveFocus && focusId) document.getElementById(focusId)?.focus({preventScroll: true});
  else { main.querySelector('h1')?.focus({preventScroll: true}); window.scrollTo({top: 0, behavior: 'instant'}); }
  if (errors.length && !preserveFocus) {
    const first = errors[0].path;
    const target = first === 'confirmed' ? document.getElementById('confirm-answers') : first === 'consent' ? document.getElementById('adult-consent') : [...main.querySelectorAll('[data-path]')].find(element => element.dataset.path === first);
    target?.focus();
  }
}

function routeTo(next) { pageId = next; errors = []; deleteRequest = null; render(); }

function showValidationErrors(nextErrors) {
  errors = nextErrors;
  const first = errors[0]?.path;
  if (first === 'consent') pageId = 'welcome';
  else if (first?.startsWith('experiences.')) {
    const id = first.split('.')[1];
    if (answers.experiences?.some(item => item.id === id)) experienceId = id;
    pageId = 'experience';
  } else if (first !== 'confirmed') pageId = 'about';
  render();
}

function openReview() {
  const nextErrors = model.validate(answers, 'review');
  if (nextErrors.length) { showValidationErrors(nextErrors); return; }
  editingReview = false;
  confirmed = false;
  routeTo('review');
}

function continueSurvey() {
  const nextErrors = model.validate(answers, pageId);
  if (nextErrors.length) { showValidationErrors(nextErrors); return; }
  if (pageId === 'welcome') routeTo('about');
  else if (pageId === 'about') {
    if (answers.current_connection === 'no') { routeTo('out_of_scope'); return; }
    answers = ensureExperiences(model.reconcile(answers));
    experienceId = answers.experiences[0].id;
    if (!introShown) { introShown = true; routeTo('experience_intro'); }
    else routeTo('experience');
  }
}

function goBack() {
  if (pageId === 'about') routeTo('welcome');
  else if (pageId === 'out_of_scope' || pageId === 'experience_intro') routeTo('about');
  else if (pageId === 'review') { editingReview = false; routeTo('experience'); }
  else if (pageId === 'experience') {
    const index = answers.experiences.findIndex(item => item.id === experienceId);
    if (index > 0) { experienceId = answers.experiences[index - 1].id; routeTo('experience'); }
    else { editingReview = false; routeTo('about'); }
  }
}

function updateField(element) {
  const path = element.dataset.path;
  const kind = element.dataset.kind;
  if (!path) return;
  if (kind === 'confirmation') { confirmed = element.checked; return; }
  const previousState = {residence_area: answers.residence_area};
  let value;
  if (kind === 'consent') value = element.checked ? 'adult_agree' : undefined;
  else if (kind === 'numeric-refusal') value = element.checked ? true : undefined;
  else if (kind === 'single') { if (!element.checked) return; value = element.value; }
  else if (kind === 'multiple') {
    const selected = Array.isArray(readPath(answers, path)) ? readPath(answers, path) : [];
    if (element.checked && element.value === 'prefer_not') value = ['prefer_not'];
    else if (element.checked) value = [...selected.filter(id => id !== 'prefer_not' && id !== element.value), element.value];
    else value = selected.filter(id => id !== element.value);
  } else if (kind === 'number') value = element.validity.badInput ? NaN : element.value === '' ? undefined : Number(element.value);
  else value = normaliseNewlines(element.value);
  setPath(answers, path, value);
  confirmed = false;
  if (kind === 'text') { showTextLimit(element); return; }
  if (['single', 'multiple', 'select', 'numeric-refusal'].includes(kind)) {
    answers = model.reconcile(answers, previousState);
    errors = [];
    render({preserveFocus: true});
  }
}

function showTextLimit(element) {
  const path = element.dataset.path;
  const limit = Number(element.dataset.maxLength);
  const overLimit = characterCount(element.value) > limit;
  const hint = [...main.querySelectorAll('[data-limit-for]')].find(item => item.dataset.limitFor === path);
  if (hint) { hint.hidden = !overLimit; hint.textContent = overLimit ? `Please keep this answer to ${limit.toLocaleString('en-AU')} characters or fewer. Your full text is still in the box for you to edit.` : ''; }
  if (overLimit) element.setAttribute('aria-invalid', 'true');
  else element.removeAttribute('aria-invalid');
}

main?.addEventListener('input', event => { if (['text', 'number'].includes(event.target?.dataset?.kind)) updateField(event.target); });
main?.addEventListener('change', event => { if (!['text', 'number'].includes(event.target?.dataset?.kind)) updateField(event.target); });
main?.addEventListener('focusout', event => { if (event.target?.dataset?.kind === 'text') showTextLimit(event.target); });
main?.addEventListener('click', event => {
  const control = event.target.closest?.('[data-action]');
  if (!control || !main.contains(control)) return;
  event.preventDefault();
  const action = control.dataset.action;
  if (action === 'continue') continueSurvey();
  else if (action === 'back') goBack();
  else if (action === 'start-experience') routeTo('experience');
  else if (action === 'next-experience') {
    const nextErrors = model.validate(answers, 'experience', experienceId);
    if (nextErrors.length) { showValidationErrors(nextErrors); return; }
    const index = answers.experiences.findIndex(item => item.id === experienceId);
    if (index < answers.experiences.length - 1) { experienceId = answers.experiences[index + 1].id; routeTo('experience'); }
  } else if (action === 'add-experience') {
    answers = appendExperience(answers);
    experienceId = answers.experiences.at(-1).id;
    editingReview = false;
    routeTo('experience');
  } else if (action === 'finish-survey' || action === 'return-review') openReview();
  else if (action === 'edit-background') { confirmed = false; editingReview = true; routeTo('about'); }
  else if (action === 'edit-experience') {
    if (!answers.experiences?.some(item => item.id === control.dataset.experienceId)) return;
    experienceId = control.dataset.experienceId;
    confirmed = false;
    editingReview = true;
    routeTo('experience');
  } else if (action === 'delete-experience') { deleteRequest = experienceId; render({preserveFocus: true}); }
  else if (action === 'cancel-delete') { deleteRequest = null; render({preserveFocus: true}); }
  else if (action === 'confirm-delete') {
    const index = answers.experiences.findIndex(item => item.id === deleteRequest);
    answers = removeExperience(answers, deleteRequest);
    experienceId = answers.experiences[Math.max(0, Math.min(index - 1, answers.experiences.length - 1))].id;
    routeTo('experience');
  } else if (action === 'submit-survey') {
    const nextErrors = model.validate(answers, 'review');
    if (!confirmed) nextErrors.push({path: 'confirmed', message: 'Please check your answers and tick the confirmation before submitting.'});
    if (nextErrors.length) { showValidationErrors(nextErrors); return; }
    answers = {};
    experienceId = null;
    editingReview = false;
    routeTo('thanks');
  }
});

window.addEventListener('pageshow', event => {
  if (event.persisted && model) {
    answers = {}; experienceId = null; introShown = false; editingReview = false; confirmed = false;
    routeTo('welcome');
  }
});

async function boot() {
  if (!main) return;
  try {
    const url = new URL('./survey-spec.json', moduleUrl);
    const revision = new URL(moduleUrl).searchParams.get('v');
    if (revision) url.searchParams.set('v', revision);
    const response = await fetch(url);
    if (!response.ok) throw new Error('Unable to load');
    spec = await response.json();
    model = createAdultSurveyModel(spec);
    render();
  } catch {
    main.innerHTML = '<section class="finish"><h1>Unable to load this questionnaire</h1><p>Please refresh the page and try again.</p></section>';
  }
}
boot();
