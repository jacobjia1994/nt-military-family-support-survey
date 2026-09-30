import {createAdultSurveyModel, characterCount, normaliseNewlines, ensureExperiences, appendExperience, removeExperience} from './model.mjs?v=20260930-8';
import {createDraftStore, DRAFT_STORAGE_KEY} from './draft-store.mjs?v=20260930-8';
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

function textQuestion({path, label, help = '', privacyHint = '', value = '', rows = 6, maxLength = 5000, errors = [], className = '', required = true}) {
  const inputId = idFor(`text-${path}`);
  const normalised = normaliseNewlines(value);
  const descriptions = [help && `${inputId}-hint`, privacyHint && `${inputId}-privacy`, `${inputId}-error`].filter(Boolean).join(' ');
  return `<div class="question-group text-question${className ? ` ${escapeHtml(className)}` : ''}">
    <label class="field-label" for="${escapeHtml(inputId)}">${escapeHtml(label)}</label>
    ${help ? `<p id="${inputId}-hint" class="field-hint">${escapeHtml(help)}</p>` : ''}
    ${privacyHint ? `<p id="${inputId}-privacy" class="privacy-hint">${escapeHtml(privacyHint)}</p>` : ''}
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
    ${present(value) ? `<button type="button" class="clear-answer" data-action="clear-answer" data-path="${escapeHtml(path)}" aria-label="${escapeHtml(`Clear answer: ${label}`)}">Clear answer</button>` : ''}
    ${errorElement(path, errors)}
  </fieldset>`;
}

function multipleChoicesQuestion({path, label, help = '', options = [], value, errors = []}) {
  const selected = Array.isArray(value) ? value : [];
  const questionId = idFor(`multiple-${path}`);
  return `<fieldset class="question-group" data-question-path="${escapeHtml(path)}" aria-describedby="${questionId}-hint ${questionId}-error">
    <legend>${escapeHtml(label)}</legend>
    ${help ? `<p id="${questionId}-hint" class="field-hint">${escapeHtml(help)}</p>` : ''}
    <div class="choices">${options.map(option => {
      const inputId = idFor(`choice-${path}-${option.id}`);
      return `<label class="choice" for="${escapeHtml(inputId)}"><input id="${escapeHtml(inputId)}" type="checkbox" name="${escapeHtml(path)}" value="${escapeHtml(option.id)}" data-path="${escapeHtml(path)}" data-kind="multiple"${selected.includes(option.id) ? ' checked' : ''}><span class="choice-body"><span class="choice-label">${escapeHtml(option.label)}</span></span></label>`;
    }).join('')}</div>
    ${selected.length ? `<button type="button" class="clear-answer" data-action="clear-answer" data-path="${escapeHtml(path)}" aria-label="${escapeHtml(`Clear answer: ${label}`)}">Clear answer</button>` : ''}
    <p id="${questionId}-error" class="field-error" data-error-for="${escapeHtml(path)}"${questionError(path, errors) ? '' : ' hidden'}>${escapeHtml(questionError(path, errors))}</p>
  </fieldset>`;
}

function selectQuestion({path, label, help = '', options = [], value, errors = []}) {
  const inputId = idFor(`select-${path}`);
  const optionsHtml = [`<option value="">Choose an option</option>`, ...options.map(option => `<option value="${escapeHtml(option.id)}"${value === option.id ? ' selected' : ''}>${escapeHtml(option.label)}</option>`)].join('');
  return `<div class="question-group">
    <label class="field-label" for="${escapeHtml(inputId)}">${escapeHtml(label)}</label>
    ${help ? `<p class="field-hint">${escapeHtml(help)}</p>` : ''}
    <select id="${escapeHtml(inputId)}" name="${escapeHtml(path)}" class="select locality-control" required aria-required="true" data-path="${escapeHtml(path)}" data-kind="select">${optionsHtml}</select>
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

function renderAbout(spec, model, answers, errors) {
  const page = specPage(spec, 'about');
  const visible = model.visibleLocationFields(answers);
  const grouped = new Map();
  for (const question of page.questions || []) {
    if (question.id === 'suburb' && !visible.includes('suburb')) continue;
    if (question.id === 'suburb_other' && !visible.includes('suburb_other')) continue;
    if (question.id === 'community_connection_other' && !(Array.isArray(answers.community_connection) && answers.community_connection.includes('other'))) continue;
    const group = question.group || 'About you';
    if (!grouped.has(group)) grouped.set(group, []);
    grouped.get(group).push(question);
  }
  const sections = [...grouped.values()].map(questions => {
    const content = questions.map(question => {
      const path = question.id;
      if (question.type === 'single') return choicesQuestion({path, label: question.label, help: question.help, options: question.options, value: answers[path], primaryIds: question.primary_option_ids, secondaryIds: question.secondary_option_ids, disclosureLabel: question.disclosure_label, errors});
      if (question.type === 'multiple') return multipleChoicesQuestion({path, label: question.label, help: question.help, options: question.options, value: answers[path], errors});
      if (question.type === 'text') return textQuestion({path, label: question.label, help: question.help, value: readPath(answers, path), maxLength: question.max_length, errors});
      if (question.type === 'locality_select') {
        const area = answers.residence_area;
        const localities = spec.geography.localities.filter(locality => locality.region === area);
        const options = [...localities, ...spec.geography.extra_locality_options];
        return selectQuestion({path, label: question.label, help: question.help, options, value: answers[path], errors});
      }
      if (question.type === 'integer_group') {
        if (question.id === 'dependants_count' && answers.has_dependants !== 'yes') return '';
        const refused = readPath(answers, question.refusal_path) === true;
        const refusalId = idFor(`refusal-${question.id}`);
        return `<fieldset class="question-group"><legend>${escapeHtml(question.label)}</legend>${question.help ? `<p class="field-hint">${escapeHtml(question.help)}</p>` : ''}${refused ? '' : `<div class="number-pair${question.id === 'nt_duration' ? ' duration-fields' : ''}">${question.fields.map(field => numberInput({...field, value: readPath(answers, field.path), errors})).join('')}</div>`}<label class="numeric-refusal" for="${refusalId}"><input id="${refusalId}" type="checkbox" data-path="${escapeHtml(question.refusal_path)}" data-kind="numeric-refusal"${refused ? ' checked' : ''}><span>${escapeHtml(question.refusal_label)}</span></label></fieldset>`;
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
  return `<section class="welcome dual-page welcome-v3"><h1 tabindex="-1">${escapeHtml(page.title)}</h1><div class="welcome-intro">${page.intro.map((line, index) => `<p class="${index === 0 ? 'welcome-invitation' : 'welcome-purpose'}">${escapeHtml(line)}</p>`).join('')}</div><section class="welcome-eligibility"><h2>${escapeHtml(page.eligibility.title)}</h2><p>${escapeHtml(page.eligibility.text)}</p></section><section class="welcome-information" aria-labelledby="welcome-information-title"><h2 id="welcome-information-title">${escapeHtml(page.information_title)}</h2><div class="welcome-information-grid">${page.information_blocks.map(block => `<section><h3>${escapeHtml(block.title)}</h3><p>${escapeHtml(block.text)}</p></section>`).join('')}</div><div class="welcome-contact-line">${page.contact_links.map(link => `<span>${escapeHtml(link.purpose)}: <a href="${escapeHtml(link.url)}">${escapeHtml(link.label)}</a></span>`).join('')}${page.links.map(linkMarkup).join('')}</div><div class="welcome-agreement"><label class="agreement-choice" for="adult-consent"><input id="adult-consent" type="checkbox" data-path="consent" data-kind="consent"${answers.consent === 'adult_agree' ? ' checked' : ''} aria-describedby="consent-error"${questionError('consent', errors) ? ' aria-invalid="true"' : ''}><span>${escapeHtml(consent.label)}</span></label><p id="consent-error" class="field-error"${questionError('consent', errors) ? '' : ' hidden'}>${escapeHtml(questionError('consent', errors))}</p></div></section>${renderActions({back: false, continueLabel: 'Start survey'})}<footer class="questionnaire-footer"><p class="funding-acknowledgement">${escapeHtml(page.funding_acknowledgement)}</p><details class="source-note"><summary>About this questionnaire</summary><p>${sourceText}</p></details></footer></section>`;
}

const previousLabels = {
  difficulties: 'What was difficult for you or your family in the Greater Darwin Region in the past 12 months?',
  help_needed: 'What help, if any, did you or your family need to deal with these difficulties?',
  help_sources: 'Where did you look for help, and what help did you receive?',
  support_access: 'What made it easier or harder to get support outside the military?',
  support_fit: 'How well did the support you received outside the military meet your needs?',
  missing_help: 'What help, if any, are you or your family still missing now?',
  anything_else: 'Is there anything else you want to add?',
};

function previousAnswers() {
  if (!answers.previous_responses) return '';
  return `<section class="migration-note"><p>The questions have changed. We have kept your previous answers and placed related answers in an experience. Please check and edit them; your complete original answers are kept below.</p><details class="previous-answers"><summary>View your previous answers</summary>${Object.entries(answers.previous_responses).map(([id, value]) => `<h3>${escapeHtml(previousLabels[id] || id)}</h3><p class="previous-answer">${escapeHtml(value)}</p>`).join('')}</details></section>`;
}

function renderExperience(spec, answers, errors) {
  const page = specPage(spec, 'experience');
  const current = answers.experiences.find(item => item.id === experienceId) || answers.experiences[0];
  experienceId = current.id;
  const number = answers.experiences.indexOf(current) + 1;
  const switcher = answers.experiences.length > 1 ? `<div class="experience-switcher"><label for="experience-select">Review an experience</label><select id="experience-select" class="select" data-kind="experience-selector">${answers.experiences.map((item, index) => `<option value="${escapeHtml(item.id)}"${item.id === experienceId ? ' selected' : ''}>Experience ${index + 1}</option>`).join('')}</select></div>` : '';
  const questions = page.questions.map(question => textQuestion({path: `experiences.${current.id}.responses.${question.id}`, label: question.label, help: question.help, privacyHint: question.privacy_hint, value: current.responses?.[question.id], maxLength: question.max_length, rows: question.rows, errors, className: 'narrative-answer', required: false})).join('');
  const final = finishing ? `<section class="final-comments" aria-labelledby="finish-title"><h2 id="finish-title" tabindex="-1">Before you finish</h2>${textQuestion({path: 'final_comment', label: page.final_question.label, privacyHint: page.final_question.privacy_hint, value: answers.final_comment, maxLength: page.final_question.max_length, rows: 4, errors, required: false})}<div class="submit-confirmation"><label class="choice" for="confirm-answers"><input id="confirm-answers" type="checkbox" data-path="confirmed" data-kind="confirmation" aria-describedby="confirmation-error"${confirmed ? ' checked' : ''}><span class="choice-body"><span class="choice-label">${escapeHtml(page.confirmation_label)}</span></span></label><p id="confirmation-error" class="field-error"${questionError('confirmed', errors) ? '' : ' hidden'}>${escapeHtml(questionError('confirmed', errors))}</p></div><button type="button" class="button primary" data-action="submit-survey">Confirm and submit</button></section>` : '';
  const deletion = deleteRequest ? `<section class="delete-experience-prompt" role="alert"><p>Delete Experience ${answers.experiences.findIndex(item => item.id === deleteRequest) + 1}? Its answers will be removed from this survey and its saved progress in this browser.</p><div class="resume-actions"><button type="button" class="button secondary" data-action="cancel-delete">Keep this experience</button><button type="button" class="button primary" data-action="confirm-delete">Delete experience</button></div></section>` : '';
  return `<section class="survey-layout dual-page experience-page"><h1 tabindex="-1">Experience ${number}</h1>${switcher}${number === 1 ? previousAnswers() : ''}<div class="experience-intro">${renderIntro(page.intro)}</div>${questions}<div class="experience-actions"><button type="button" class="back-button" data-action="back">Back</button><button type="button" class="button secondary" data-action="add-experience">Add another experience</button><button type="button" class="button primary" data-action="finish-survey">Finish survey</button></div>${answers.experiences.length > 1 ? '<button type="button" class="small-text-action delete-experience" data-action="delete-experience">Delete this experience</button>' : ''}${deletion}${final}</section>`;
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
let finishing = false;
let deleteRequest = null;
let protectedDraftRaw = null;
let errors = [];
let confirmed = false;
let dirty = false;
let draftStore;
let pendingDraft = null;
let saveTimer;
let draftStatus = 'idle';
let clearFailed = false;
let restartRequest = null;

function restartPrompt() {
  if (!restartRequest) return '';
  return '<section class="restart-prompt" role="alert"><p>Start again? This will clear your saved progress and current answers in this browser.</p><div class="resume-actions"><button type="button" class="button secondary" data-action="cancel-restart">Keep my progress</button><button type="button" class="button primary" data-action="confirm-restart">Clear and start again</button></div></section>';
}

function requestRestart(kind) {
  restartRequest = kind;
  render({preserveFocus: true});
  main.querySelector('[data-action="cancel-restart"]')?.focus();
}

function draftControls() {
  if (!dirty || answers.consent !== 'adult_agree' || pageId === 'thanks') return '';
  const message = protectedDraftRaw ? 'Your previous saved answers have been kept. Download them or clear them before starting a new survey.' : draftStatus === 'saved' ? 'Progress saved in this browser.' : draftStatus === 'unavailable' ? 'This browser cannot save progress. Keep this page open until you finish.' : 'Saving progress…';
  return `<div class="draft-controls"><span data-draft-status>${escapeHtml(message)}</span><button type="button" class="small-text-action" data-action="clear-draft">Clear saved progress</button></div>`;
}

function resumePrompt() {
  if (protectedDraftRaw) return '<section class="resume-prompt" role="alert"><h2>Keep your saved answers</h2><p>This saved survey uses a different version. Your saved answers have been kept. You can download a copy before choosing to clear them and start again.</p><div class="resume-actions"><button type="button" class="button secondary" data-action="download-draft">Download saved answers</button><button type="button" class="small-text-action" data-action="new-survey">Start a new survey</button></div></section>';
  if (!pendingDraft) return '';
  return `<section class="resume-prompt" aria-labelledby="resume-title"><h2 id="resume-title">Continue your survey</h2><p>${pendingDraft.migratedFrom ? 'Your saved answers are available. The questions have changed; your previous answers will be kept for you to review.' : 'Saved progress is available in this browser.'}</p><div class="resume-actions"><button type="button" class="button primary" data-action="resume-draft">Resume survey</button><button type="button" class="small-text-action" data-action="new-survey">Start a new survey</button></div></section>`;
}

function saveDraftNow() {
  window.clearTimeout(saveTimer);
  if (!draftStore || pendingDraft || protectedDraftRaw || !dirty || answers.consent !== 'adult_agree' || pageId === 'thanks') return;
  const result = draftStore.save({answers, pageId: pageId === 'out_of_scope' ? 'about' : pageId, experienceId});
  draftStatus = result.status;
  const status = main.querySelector('[data-draft-status]');
  if (status) status.textContent = draftStatus === 'saved' ? 'Progress saved in this browser.' : 'This browser cannot save progress. Keep this page open until you finish.';
}

function scheduleDraftSave() {
  draftStatus = 'saving';
  const status = main.querySelector('[data-draft-status]');
  if (status) status.textContent = 'Saving progress…';
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(saveDraftNow, 300);
}

function clearDraft() {
  window.clearTimeout(saveTimer);
  const result = draftStore?.clear();
  clearFailed = result?.status === 'unavailable';
  pendingDraft = null;
  if (!clearFailed) protectedDraftRaw = null;
  draftStatus = 'idle';
}

function render({preserveFocus = false} = {}) {
  const focusId = preserveFocus ? document.activeElement?.id : null;
  const stages = [['welcome', 'Welcome'], ['about', 'About you'], ['experience', 'Your experiences'], ['thanks', 'Thank you']];
  let content;
  if (pageId === 'welcome') content = renderWelcome(spec, answers, errors);
  else if (pageId === 'about') content = renderAbout(spec, model, answers, errors);
  else if (pageId === 'experience') content = renderExperience(spec, answers, errors);
  else if (pageId === 'thanks') content = renderThanks(spec);
  else {
    const screen = spec.system_screens[pageId];
    content = `<section class="finish dual-page"><h1 tabindex="-1">${escapeHtml(screen.title)}</h1><p class="lead">${escapeHtml(screen.text)}</p><div class="finish-actions"><button class="button secondary" type="button" data-action="back">Back</button></div></section>`;
  }
  const summary = errors.length ? '<div class="survey-errors" role="alert"><p>Please check the highlighted questions.</p></div>' : '';
  const progress = `<ol class="stage-progress" aria-label="Survey stages">${stages.map(([id, label]) => `<li${id === pageId ? ' aria-current="step"' : ''}>${escapeHtml(label)}</li>`).join('')}</ol>`;
  main.innerHTML = progress + content + draftControls() + restartPrompt();
  main.dataset.page = pageId;
  if (pageId === 'welcome' && (pendingDraft || protectedDraftRaw)) main.querySelector('h1')?.insertAdjacentHTML('afterend', resumePrompt());
  if (clearFailed) main.insertAdjacentHTML('beforeend', '<p class="draft-warning">Saved progress could not be cleared. Please remove this site’s saved data in your browser settings.</p>');
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
  saveDraftNow();
  render();
}

function clearAnswers() {
  answers = {};
  confirmed = false;
  dirty = false;
  experienceId = null;
  finishing = false;
  deleteRequest = null;
}

function continueSurvey() {
  errors = model.validate(answers, pageId);
  if (errors.length) { render(); return; }
  if (pageId === 'welcome') {
    if (pendingDraft || protectedDraftRaw) { requestRestart('start'); return; }
    routeTo('about');
  } else if (pageId === 'about') {
    if (answers.current_connection === 'no') { routeTo('out_of_scope'); return; }
    answers = ensureExperiences(answers);
    experienceId = answers.experiences.some(item => item.id === experienceId) ? experienceId : answers.experiences[0].id;
    finishing = false;
    routeTo('experience');
  }
}

function switchExperience(id) {
  if (!answers.experiences?.some(item => item.id === id)) return;
  saveDraftNow();
  experienceId = id;
  finishing = false;
  deleteRequest = null;
  routeTo('experience');
}

function submitSurvey() {
  errors = model.validate(answers, 'experience');
  if (!confirmed) errors.push({path: 'confirmed', message: 'Please check your answers and tick the confirmation before submitting.'});
  if (errors.length) {
    const first = errors[0].path;
    if (first.startsWith('experiences.')) experienceId = first.split('.')[1];
    else if (!['final_comment', 'confirmed'].includes(first)) pageId = 'about';
    render();
    return;
  }
  // Frontend review only. No receiver, transmission or receipt claim.
  clearDraft();
  clearAnswers();
  routeTo('thanks');
}

function updateField(element) {
  const path = element.dataset.path;
  const kind = element.dataset.kind;
  if (kind === 'experience-selector') { switchExperience(element.value); return; }
  if (!path) return;
  if (kind === 'confirmation') { confirmed = element.checked; return; }
  let value;
  const previousState = {residence_area: answers.residence_area};
  if (kind === 'consent') value = element.checked ? 'adult_agree' : undefined;
  else if (kind === 'numeric-refusal') value = element.checked ? true : undefined;
  else if (kind === 'single') { if (!element.checked) return; value = element.value; }
  else if (kind === 'multiple') {
    const selected = Array.isArray(readPath(answers, path)) ? readPath(answers, path) : [];
    if (element.checked && element.value === 'prefer_not') value = ['prefer_not'];
    else if (element.checked) value = [...selected.filter(id => id !== 'prefer_not' && id !== element.value), element.value];
    else value = selected.filter(id => id !== element.value);
  }
  else if (kind === 'number') value = element.validity.badInput ? NaN : element.value === '' ? undefined : Number(element.value);
  else value = normaliseNewlines(element.value);
  setPath(answers, path, value);
  if (kind === 'consent' && value === 'adult_agree') answers = ensureExperiences(answers);
  dirty = true;
  confirmed = false;
  document.getElementById('confirm-answers')?.removeAttribute('checked');
  const confirmation = document.getElementById('confirm-answers');
  if (confirmation) confirmation.checked = false;
  if (kind === 'consent' && !element.checked && !pendingDraft && !protectedDraftRaw) clearDraft();
  scheduleDraftSave();
  if (kind === 'text') {
    showTextLimit(element);
    return;
  }
  if (['single', 'multiple', 'select', 'numeric-refusal'].includes(kind)) {
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
  if (action === 'resume-draft') {
    const saved = pendingDraft;
    if (!saved) return;
    pendingDraft = null;
    answers = ensureExperiences(model.reconcile(saved.answers));
    experienceId = answers.experiences.some(item => item.id === saved.experienceId) ? saved.experienceId : answers.experiences[0].id;
    finishing = false;
    confirmed = false;
    dirty = true;
    draftStatus = 'saved';
    let target = saved.pageId;
    if (model.validate(answers, 'welcome').length) target = 'welcome';
    else if (target === 'experience' && model.validate(answers, 'about').length) target = 'about';
    routeTo(target);
    return;
  }
  if (action === 'new-survey' || action === 'clear-draft') {
    requestRestart(action === 'new-survey' ? 'new' : 'clear');
    return;
  }
  if (action === 'cancel-restart') {
    restartRequest = null;
    render({preserveFocus: true});
    return;
  }
  if (action === 'confirm-restart') {
    const kind = restartRequest;
    restartRequest = null;
    clearDraft();
    if (kind === 'start') { routeTo('about'); return; }
    clearAnswers();
    routeTo('welcome');
    return;
  }
  if (action === 'download-draft') {
    if (!protectedDraftRaw) return;
    const url = URL.createObjectURL(new Blob([protectedDraftRaw], {type: 'application/json'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'defence-family-survey-saved-answers.json';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    return;
  }
  if (action === 'add-experience') {
    saveDraftNow();
    answers = appendExperience(answers);
    experienceId = answers.experiences.at(-1).id;
    finishing = false;
    deleteRequest = null;
    confirmed = false;
    dirty = true;
    routeTo('experience');
    return;
  }
  if (action === 'finish-survey') {
    saveDraftNow();
    finishing = true;
    deleteRequest = null;
    errors = [];
    render();
    const heading = document.getElementById('finish-title');
    heading?.focus();
    heading?.scrollIntoView({block: 'start'});
    return;
  }
  if (action === 'submit-survey') { submitSurvey(); return; }
  if (action === 'delete-experience' && answers.experiences.length > 1) {
    deleteRequest = experienceId;
    render({preserveFocus: true});
    main.querySelector('[data-action="cancel-delete"]')?.focus();
    return;
  }
  if (action === 'cancel-delete') { deleteRequest = null; render({preserveFocus: true}); return; }
  if (action === 'confirm-delete') {
    const index = answers.experiences.findIndex(item => item.id === deleteRequest);
    answers = removeExperience(answers, deleteRequest);
    experienceId = answers.experiences[Math.max(0, index - 1)]?.id || answers.experiences[0].id;
    deleteRequest = null;
    finishing = false;
    confirmed = false;
    dirty = true;
    routeTo('experience');
    return;
  }
  if (action === 'continue') continueSurvey();
  else if (action === 'back') {
    if (pageId === 'experience') {
      const index = answers.experiences.findIndex(item => item.id === experienceId);
      if (index > 0) switchExperience(answers.experiences[index - 1].id);
      else { finishing = false; deleteRequest = null; routeTo('about'); }
    } else routeTo(pageId === 'out_of_scope' ? 'about' : 'welcome');
  }
  else if (action === 'clear-answer') {
    const previousState = {residence_area: answers.residence_area};
    setPath(answers, control.dataset.path, undefined);
    answers = model.reconcile(answers, previousState);
    confirmed = false;
    dirty = true;
    scheduleDraftSave();
    errors = [];
    render({preserveFocus: true});
    const question = [...main.querySelectorAll('[data-question-path]')].find(item => item.dataset.questionPath === control.dataset.path);
    question?.querySelector('input')?.focus({preventScroll: true});
  }
});

window.addEventListener('beforeunload', event => {
  saveDraftNow();
  if (!dirty || draftStatus === 'saved') return;
  event.preventDefault();
  event.returnValue = '';
});
window.addEventListener('pagehide', saveDraftNow);
window.addEventListener('storage', event => {
  if (!model || event.key !== DRAFT_STORAGE_KEY || event.newValue !== null) return;
  // Completion or clearing in another tab must not resurrect an old draft.
  window.clearTimeout(saveTimer);
  pendingDraft = null;
  restartRequest = null;
  clearAnswers();
  pageId = 'welcome';
  errors = [];
  render();
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') saveDraftNow();
});
window.addEventListener('pageshow', event => {
  if (event.persisted && model) {
    const saved = draftStore.load();
    clearAnswers();
    pendingDraft = saved.status === 'available' ? saved.draft : null;
    protectedDraftRaw = saved.status === 'incompatible' ? saved.raw : null;
    pageId = 'welcome';
    errors = [];
    render();
  }
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
    let storage;
    try { storage = window.localStorage; } catch { /* Some browser privacy modes deny storage. */ }
    draftStore = createDraftStore({storage, schemaVersion: spec.answer_schema_version});
    const saved = draftStore.load();
    pendingDraft = saved.status === 'available' ? saved.draft : null;
    protectedDraftRaw = saved.status === 'incompatible' ? saved.raw : null;
    if (saved.status === 'unavailable') draftStatus = 'unavailable';
    render();
  } catch {
    main.innerHTML = '<section class="finish"><h1>Unable to load this questionnaire</h1><p>Please refresh the page and try again.</p></section>';
  }
}
boot();
