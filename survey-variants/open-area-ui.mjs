/**
 * Render one open-response priority-area page.
 *
 * This is deliberately a pure string renderer. The parent survey owns event
 * handling, state updates, confirmation and navigation.
 */

const MAX_TEXT_CHARACTERS = 10_000;

const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[character]));

const safeId = value => String(value ?? '').replace(/[^a-zA-Z0-9_-]/g, '-');
const normaliseNewlines = value => String(value ?? '').replace(/\r\n?/g, '\n');
const characterCount = value => Array.from(normaliseNewlines(value)).length;

const textValue = value => value === undefined || value === null ? '' : String(value);

function formatCount(value) {
  return `${characterCount(value).toLocaleString('en-AU')} / ${MAX_TEXT_CHARACTERS.toLocaleString('en-AU')} characters`;
}

function sectionFor(areaSpec, id) {
  return areaSpec.sections.find(section => section.id === id);
}

function questionFor(areaSpec, sectionId, field) {
  const section = sectionFor(areaSpec, sectionId);
  const question = section?.questions?.find(item => item.field === field);
  if (!question) throw new TypeError(`Missing open-area question: ${sectionId}.${field}`);
  return question;
}

function replacePath(template, categoryId, needId) {
  return template
    .replaceAll('{category_id}', categoryId)
    .replaceAll('{need_id}', needId ?? '');
}

function renderTextQuestion({question, path, categoryId, needId, value, extraClass = ''}) {
  const fieldId = `open-${safeId(path)}`;
  const needAttribute = needId === undefined || needId === null
    ? ''
    : ` data-open-need="${escapeHTML(needId)}"`;
  const className = ['open-question', extraClass].filter(Boolean).join(' ');
  return `<div class="${className}" data-question="${escapeHTML(question.id)}">` +
    `<label class="field-label" for="${escapeHTML(fieldId)}">${escapeHTML(question.label)}</label>` +
    `<p class="field-hint" id="${escapeHTML(fieldId)}-hint">${escapeHTML(question.help || '')}</p>` +
    `<textarea id="${escapeHTML(fieldId)}" name="${escapeHTML(path)}" class="textarea" rows="6" ` +
      `data-kind="text" data-path="${escapeHTML(path)}" data-open-cat="${escapeHTML(categoryId)}"${needAttribute} ` +
      `data-open-field="${escapeHTML(question.field)}" aria-describedby="${escapeHTML(fieldId)}-hint ${escapeHTML(fieldId)}-count">` +
      `${escapeHTML(textValue(value))}</textarea>` +
    `<output class="char-count" id="${escapeHTML(fieldId)}-count" data-count-for="${escapeHTML(path)}">` +
      `${escapeHTML(formatCount(value))}</output>` +
    `<p class="field-error" id="${escapeHTML(fieldId)}-error" hidden></p>` +
  `</div>`;
}

function renderSectionIntro(section) {
  if (!section?.intro) return '';
  const lines = Array.isArray(section.intro) ? section.intro : [section.intro];
  return lines.map(line => `<p class="question-intro">${escapeHTML(line)}</p>`).join('');
}

function renderNeedRecall(need) {
  return `<div class="open-need-recall">` +
    `<p class="small"><strong>Need ${escapeHTML(need.number)}</strong></p>` +
    `<p class="review-value">${escapeHTML(textValue(need.answers?.need_description))}</p>` +
  `</div>`;
}

/**
 * Return the complete HTML for one priority issue-area page.
 *
 * `model.areaView` is read only here. In particular, this function never calls
 * a model setter or creates the initially visible n1 slot in state.
 */
export function renderOpenArea(spec, model, state, categoryId) {
  if (!spec || !model || typeof model.areaView !== 'function') {
    throw new TypeError('A survey specification and open survey model are required.');
  }
  const areaSpec = spec.pages?.find(page => page.id === 'area');
  if (!areaSpec) throw new TypeError('The survey specification has no open area page.');

  const view = model.areaView(state || {}, categoryId);
  if (!view) throw new RangeError('The open area is not a current priority.');

  const categoryLabel = categoryId === 'OTHER'
    ? 'Other issues'
    : (spec.issue_bank?.find(category => category.id === categoryId)?.label || view.title || categoryId);
  const title = String(areaSpec.title || 'Your experience: {category_label}')
    .replace('{category_label}', categoryLabel);
  const area = state?.open_areas?.[categoryId] || {};
  // The model's implicit n1 is only for a first visit. Once an area record
  // exists, its need_order is authoritative, including an intentional [].
  const hasAreaRecord = Object.prototype.hasOwnProperty.call(state?.open_areas || {}, categoryId);
  const viewNeeds = hasAreaRecord
    ? (Array.isArray(area.need_order) ? view.needs : [])
    : (Array.isArray(view.needs) && view.needs.length
      ? view.needs
      : [{id: 'n1', number: 1, answers: {}, answered: false}]);
  const needs = (Array.isArray(viewNeeds) ? viewNeeds : []).slice(0, 2);

  const intro = (Array.isArray(areaSpec.intro) ? areaSpec.intro : [areaSpec.intro])
    .filter(Boolean)
    .map(line => `<p class="question-intro">${escapeHTML(line)}</p>`)
    .join('');
  const selectedIssues = (view.issues || []).map(issue =>
    `<li>${escapeHTML(issue.label)}</li>`).join('');
  const recall = `<div class="open-recall inline-note" aria-label="Selected issues">` +
    `<p><strong>${escapeHTML(categoryLabel)}</strong></p>` +
    `<ul>${selectedIssues}</ul>` +
  `</div>`;

  const needsSection = sectionFor(areaSpec, 'needs');
  const needsSummary = questionFor(areaSpec, 'needs', 'needs_summary');
  const needsHTML = `<section class="open-section open-section-needs" data-open-section="needs">` +
    `<h2>${escapeHTML(needsSection.title)}</h2>` +
    renderTextQuestion({
      question: needsSummary,
      path: replacePath(needsSummary.id, categoryId),
      categoryId,
      value: area.needs_summary
    }) +
  `</section>`;

  const prioritySection = sectionFor(areaSpec, 'priority_needs');
  const needDescription = questionFor(areaSpec, 'priority_needs', 'need_description');
  const addControl = prioritySection.controls?.find(control => control.id === 'add_need');
  const removeControl = prioritySection.controls?.find(control => control.id === 'remove_need');
  const skipControl = prioritySection.controls?.find(control => control.id === 'skip_need_details');
  const needBlocks = needs.map(need => `<div class="open-need" data-need-slot="${escapeHTML(need.id)}">` +
    renderNeedRecall(need) +
    renderTextQuestion({
      question: needDescription,
      path: replacePath(needDescription.id, categoryId, need.id),
      categoryId,
      needId: need.id,
      value: need.answers?.need_description
    }) +
    `<button type="button" class="text-button" data-action="remove-need" data-category="${escapeHTML(categoryId)}" data-need="${escapeHTML(need.id)}">${escapeHTML(removeControl?.label || 'Remove this need')}</button>` +
  `</div>`).join('');
  const addButton = needs.length > 0 && needs.length < 2 && addControl
    ? `<button type="button" class="button secondary" data-action="add-need" data-category="${escapeHTML(categoryId)}">${escapeHTML(addControl.label)}</button>`
    : '';
  const skipButton = needs.length > 0 && skipControl
    ? `<button type="button" class="skip-button" data-action="skip-need-details" data-category="${escapeHTML(categoryId)}">${escapeHTML(skipControl.label)}</button>`
    : '';
  const priorityHTML = `<section class="open-section open-section-priority-needs" data-open-section="priority_needs">` +
    `<h2>${escapeHTML(prioritySection.title)}</h2>` +
    renderSectionIntro(prioritySection) +
    `<div class="open-needs">${needBlocks}</div>` +
    `<div class="open-need-controls">${addButton}${skipButton}</div>` +
  `</section>`;

  const sourcesSection = sectionFor(areaSpec, 'sources');
  const focusQuestion = questionFor(areaSpec, 'sources', 'focus_issues_text');
  const sourcesQuestion = questionFor(areaSpec, 'sources', 'sources_text');
  const sourcesHTML = `<section class="open-section open-section-sources" data-open-section="sources">` +
    `<h2>${escapeHTML(sourcesSection.title)}</h2>` +
    needs.map(need => `<div class="open-need-group" data-need-slot="${escapeHTML(need.id)}">` +
      renderNeedRecall(need) +
      (view.showFocusQuestion ? renderTextQuestion({
        question: focusQuestion,
        path: replacePath(focusQuestion.id, categoryId, need.id),
        categoryId,
        needId: need.id,
        value: need.answers?.focus_issues_text
      }) : '') +
      renderTextQuestion({
        question: sourcesQuestion,
        path: replacePath(sourcesQuestion.id, categoryId, need.id),
        categoryId,
        needId: need.id,
        value: need.answers?.sources_text
      }) +
    `</div>`).join('') +
  `</section>`;

  const usedSection = sectionFor(areaSpec, 'used');
  const usedQuestion = questionFor(areaSpec, 'used', 'used_experience');
  const usedHTML = `<section class="open-section open-section-used" data-open-section="used">` +
    `<h2>${escapeHTML(usedSection.title)}</h2>` +
    renderTextQuestion({
      question: usedQuestion,
      path: replacePath(usedQuestion.id, categoryId),
      categoryId,
      value: area.used_experience
    }) +
  `</section>`;

  const otherSection = sectionFor(areaSpec, 'not_used');
  const otherQuestion = questionFor(areaSpec, 'not_used', 'other_sources');
  const otherHTML = `<section class="open-section open-section-not-used" data-open-section="not_used">` +
    `<h2>${escapeHTML(otherSection.title)}</h2>` +
    renderTextQuestion({
      question: otherQuestion,
      path: replacePath(otherQuestion.id, categoryId),
      categoryId,
      value: area.other_sources
    }) +
  `</section>`;

  const networksSection = sectionFor(areaSpec, 'networks');
  const networkQuestion = questionFor(areaSpec, 'networks', 'network_text');
  const networkHTML = view.showPersonalNetworks ?
    `<section class="open-section open-section-networks" data-open-section="networks">` +
      `<h2>${escapeHTML(networksSection.title)}</h2>` +
      renderTextQuestion({
        question: networkQuestion,
        path: networkQuestion.id,
        categoryId,
        value: state?.network_text
      }) +
    `</section>` : '';

  const outcomeSection = sectionFor(areaSpec, 'outcome');
  const outcomeFields = ['helpfulness_text', 'met_text', 'current_gap_text', 'comments'];
  const outcomeHTML = `<section class="open-section open-section-outcome" data-open-section="outcome">` +
    `<h2>${escapeHTML(outcomeSection.title)}</h2>` +
    needs.map(need => `<div class="open-need-group" data-need-slot="${escapeHTML(need.id)}">` +
      renderNeedRecall(need) +
      outcomeFields.map(field => {
        const question = questionFor(areaSpec, 'outcome', field);
        return renderTextQuestion({
          question,
          path: replacePath(question.id, categoryId, need.id),
          categoryId,
          needId: need.id,
          value: need.answers?.[field]
        });
      }).join('') +
    `</div>`).join('') +
  `</section>`;

  const commentsSection = sectionFor(areaSpec, 'area_comments');
  const commentsQuestion = questionFor(areaSpec, 'area_comments', 'area_comments');
  const commentsHTML = view.showAreaComment ?
    `<section class="open-section open-section-area-comments" data-open-section="area_comments">` +
      `<h2>${escapeHTML(commentsSection.title)}</h2>` +
      renderTextQuestion({
        question: commentsQuestion,
        path: replacePath(commentsQuestion.id, categoryId),
        categoryId,
        value: area.area_comments
      }) +
    `</section>` : '';

  return `<section class="survey-layout open-area-page" data-open-area="${escapeHTML(categoryId)}">` +
    `<article class="question-card">` +
      `<h1 tabindex="-1">${escapeHTML(title)}</h1>` +
      intro +
      recall +
      needsHTML +
      priorityHTML +
      sourcesHTML +
      usedHTML +
      otherHTML +
      networkHTML +
      outcomeHTML +
      commentsHTML +
    `</article>` +
  `</section>`;
}
