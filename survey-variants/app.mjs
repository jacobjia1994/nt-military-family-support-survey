/*
 * Browser shell for the two adult questionnaire variants.
 *
 * The survey model is deliberately kept separate from this small DOM layer.
 * There is no storage, transport or analytics here: `state` is the committed
 * in-memory answer tree and `draft` is the answer tree currently being edited.
 */

const moduleUrl = import.meta.url;
const main = document.querySelector('#main');
const bodyVariant = document.body?.dataset?.surveyVariant === 'open' ? 'open' : 'choice';

const clone = value => value === undefined ? undefined : structuredClone(value);
const text = value => String(value ?? '');
const normaliseNewlines = value => text(value).replace(/\r\n?/g, '\n');
const characterCount = value => Array.from(normaliseNewlines(value)).length;
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

function countOutput(path, value) {
  return `<output class="char-count" data-count-for="${escapeHtml(path)}">${characterCount(value).toLocaleString('en-AU')} / 10,000 characters</output>`;
}

function textQuestion({path, label, help = '', value = '', rows = 6, errors = [], className = ''}) {
  const inputId = idFor(`text-${path}`);
  const normalised = normaliseNewlines(value);
  return `<div class="question-group text-question${className ? ` ${escapeHtml(className)}` : ''}">
    <label class="field-label" for="${escapeHtml(inputId)}">${escapeHtml(label)}</label>
    ${help ? `<p class="field-hint">${escapeHtml(help)}</p>` : ''}
    <textarea id="${escapeHtml(inputId)}" name="${escapeHtml(path)}" class="textarea" rows="${Number(rows) || 6}" spellcheck="true" data-path="${escapeHtml(path)}" data-kind="text">${escapeHtml(normalised)}</textarea>
    ${countOutput(path, normalised)}
    ${errorElement(path, errors)}
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
  return `<div><label class="field-label" for="${escapeHtml(inputId)}">${escapeHtml(label)}</label><input id="${escapeHtml(inputId)}" class="text-input" type="number" min="0" step="1" inputmode="numeric" value="${escapeHtml(shown)}" data-path="${escapeHtml(path)}" data-kind="number">${errorElement(path, errors)}</div>`;
}

function renderIntro(lines, className = 'question-intro') {
  return (Array.isArray(lines) ? lines : [lines]).filter(line => line !== undefined && line !== null).map((line, index) => `<p class="${className}${index === 0 ? ' intro-line' : ''}">${escapeHtml(line)}</p>`).join('');
}

function renderStepHeader(spec, route, pageId) {
  if (!['about', 'issues', 'review'].includes(pageId) && !pageId.startsWith('area:')) return '';
  const index = Math.max(0, route.indexOf(pageId));
  const total = route.length;
  const stage = pageId === 'about' ? 0 : pageId === 'issues' ? 1 : pageId.startsWith('area:') ? 2 : 3;
  const sections = spec.ui?.sections || ['About you', 'Your issues', 'Your experience', 'Finish'];
  const track = sections.map((label, item) => `<span class="${item <= stage ? 'visited' : ''}" aria-label="${escapeHtml(label)}"></span>`).join('');
  return `<div class="step-topline"><span><strong>Step ${index + 1} of ${total}</strong></span><span>${escapeHtml(sections[Math.min(stage, sections.length - 1)])}</span></div><div class="section-track" aria-hidden="true">${track}</div>`;
}

function renderActions({back = true, continueLabel = 'Continue', leave = true}) {
  return `<div class="question-actions">${back ? '<button type="button" class="back-button" data-action="back">Back</button>' : '<span></span>'}<div class="action-right"><button type="button" class="button primary" data-action="continue">${escapeHtml(continueLabel)}</button>${leave ? '<button type="button" class="skip-button" data-action="leave">Leave survey</button>' : ''}</div></div>`;
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
  const sections = [...grouped.entries()].map(([group, questions]) => {
    const content = questions.map(question => {
      const path = question.id;
      if (question.type === 'single') return choicesQuestion({path, label: question.label, help: question.help, options: question.options, value: answers[path], errors});
      if (question.type === 'text') return textQuestion({path, label: question.label, help: question.help, value: readPath(answers, path), errors});
      if (question.type === 'locality_select') {
        const area = answers.residence_area;
        const localities = spec.geography.localities.filter(locality => locality.region === area);
        const options = [...localities, ...spec.geography.extra_locality_options];
        return selectQuestion({path, label: question.label, help: question.help, options, value: answers[path], errors});
      }
      if (question.type === 'dependants_grid') {
        if (answers.has_dependants !== 'yes') return '';
        const grid = answers.dependants?.counts || {};
        return `<fieldset class="question-group"><legend>${escapeHtml(question.label)}</legend>${question.help ? `<p class="field-hint">${escapeHtml(question.help)}</p>` : ''}<div class="dependant-grid"><div></div>${question.columns.map(column => `<div class="grid-head">${escapeHtml(column.label)}</div>`).join('')}${question.rows.map(row => `<div class="grid-row-label">${escapeHtml(row.label)}</div>${question.columns.map(column => numberInput({path: `dependants.counts.${row.id}.${column.id}`, label: '', value: grid[row.id]?.[column.id], errors})).join('')}`).join('')}</div>${errorElement('dependants', errors)}</fieldset>`;
      }
      return '';
    }).join('');
    return `<section class="dual-section"><h2>${escapeHtml(group)}</h2>${content}</section>`;
  }).join('');
  return `<section class="survey-layout dual-page"><h1 tabindex="-1">${escapeHtml(page.title)}</h1>${renderIntro(page.intro)}${sections}${renderActions({})}</section>`;
}

function issueOptionMarkup(spec, answers, categoryId, option, errors) {
  const path = `issues.${categoryId}.selected`;
  const selected = answers.issues?.[categoryId]?.selected || [];
  const id = text(option.id);
  const inputId = idFor(`issue-${categoryId}-${id}`);
  const checked = selected.includes(id);
  const exclusiveAttr = ` data-exclusive="${escapeHtml((spec.issue_bank.find(category => category.id === categoryId)?.exclusive_ids || []).join(','))}"`;
  const base = `<label class="choice" for="${escapeHtml(inputId)}"><input id="${escapeHtml(inputId)}" type="checkbox" name="${escapeHtml(path)}" value="${escapeHtml(id)}" data-path="${escapeHtml(path)}" data-kind="multi"${exclusiveAttr}${checked ? ' checked' : ''}><span class="choice-body"><span class="choice-label">${escapeHtml(option.label)}</span></span></label>`;
  if (id === `${categoryId}_other` && checked) {
    const other = spec.issue_bank.find(category => category.id === categoryId)?.other_text || {};
    return `${base}<div class="inline-other">${textQuestion({path: `issues.${categoryId}.other_text`, label: other.label || 'What other issue would you like to mention?', help: other.help, value: answers.issues?.[categoryId]?.other_text, errors})}</div>`;
  }
  return base;
}

function renderCategoryCard(spec, answers, category, opened, errors) {
  const categoryId = category.id;
  const open = opened.has(categoryId);
  const selected = Array.isArray(answers.issues?.[categoryId]?.selected) ? answers.issues[categoryId].selected : [];
  const positive = selected.some(id => !(category.exclusive_ids || []).includes(id) || id === `${categoryId}_unspecified`);
  const panelId = idFor(`category-panel-${categoryId}`);
  const checkboxId = idFor(`category-open-${categoryId}`);
  const options = [...(category.options || []), ...(category.controls || [])];
  const checklist = open ? `<div class="category-body" id="${escapeHtml(panelId)}"><p class="field-hint">${escapeHtml(category.prompt || '')}</p><div class="choices">${options.map(option => issueOptionMarkup(spec, answers, categoryId, option, errors)).join('')}</div>${errorElement(`issues.${categoryId}.selected`, errors)}<div class="category-actions"><button type="button" class="small-link" data-action="toggle-disclosure" data-category="${escapeHtml(categoryId)}">Collapse</button>${positive ? `<button type="button" class="small-link" data-action="remove-category" data-category="${escapeHtml(categoryId)}">Remove this area</button>` : ''}</div></div>` : '';
  return `<section class="category-card" data-category-card="${escapeHtml(categoryId)}"><div class="category-header"><label class="choice" for="${escapeHtml(checkboxId)}"><input id="${escapeHtml(checkboxId)}" type="checkbox" name="category-${escapeHtml(categoryId)}" value="open" data-action="toggle-disclosure" data-category="${escapeHtml(categoryId)}" aria-controls="${escapeHtml(panelId)}" aria-expanded="${open ? 'true' : 'false'}"${open ? ' checked' : ''}><span class="choice-body"><span class="choice-label">${escapeHtml(category.title || category.label)}</span><span class="category-hint">${escapeHtml(category.navigation_hint || category.help || '')}</span></span></label>${open ? '' : '<button type="button" class="small-link" data-action="toggle-disclosure" data-category="' + escapeHtml(categoryId) + '">Expand</button>'}</div>${positive && !open ? `<p class="category-count">Issues selected in this area.</p>` : ''}${checklist}</section>`;
}

function renderIssues(spec, model, answers, errors, opened) {
  const page = specPage(spec, 'issues');
  const categorySection = page.sections?.find(section => section.id === 'category_picker') || {};
  const otherSection = page.sections?.find(section => section.id === 'global_other') || {};
  const prioritySection = page.sections?.find(section => section.id === 'priority_choice') || {};
  const positive = model.positiveCategories(answers);
  const categoryCards = spec.issue_bank.map(category => renderCategoryCard(spec, answers, category, opened, errors)).join('');
  const globalOptions = page.global_controls || [];
  const global = choicesQuestion({path: 'issue_control', label: page.global_controls_label || 'No issues to report, or prefer not to answer?', options: globalOptions, value: answers.issue_control, errors});
  const otherStatus = otherSection.questions?.find(question => question.id === 'other_issues_status');
  const otherText = otherSection.questions?.find(question => question.id === 'other_issues');
  const otherStatusMarkup = otherStatus ? choicesQuestion({path: 'other_issues_status', label: otherStatus.label, help: otherStatus.help, options: otherStatus.options, value: answers.other_issues_status, errors}) : '';
  const otherTextMarkup = otherText && answers.other_issues_status === 'yes' ? textQuestion({path: 'other_issues', label: otherText.label, help: otherText.help, value: answers.other_issues, errors}) : '';
  const priorityOptions = positive.map(id => ({id, label: id === 'OTHER' ? (answers.other_issues || 'Other issues') : spec.issue_bank.find(category => category.id === id)?.title || id}));
  const priorityMarkup = positive.length === 0 ? '' : positive.length > 2 ? choicesQuestion({path: 'priority_categories', label: prioritySection.questions?.find(question => question.id === 'priority_categories')?.label || 'Which of these issue areas mattered most to you or your family?', help: prioritySection.questions?.find(question => question.id === 'priority_categories')?.help, options: priorityOptions, value: answers.priority_categories, kind: 'multi', exclusive: [], errors}) : `<div class="priority-recap"><p>${escapeHtml(prioritySection.auto_recap_one_two || '')}</p><ul>${priorityOptions.map(option => `<li>${escapeHtml(option.label)}</li>`).join('')}</ul></div>`;
  const skipQuestion = prioritySection.questions?.find(question => question.id === 'skip_detail');
  const skipMarkup = skipQuestion ? booleanQuestion({path: 'skip_detail', label: skipQuestion.label, help: skipQuestion.help, value: answers.skip_detail === true, errors}) : '';
  const noPriority = positive.length === 0 ? `<p class="inline-note">${escapeHtml(spec.system_screens?.no_priorities?.text || '')}</p>` : '';
  return `<section class="survey-layout dual-page"><h1 tabindex="-1">${escapeHtml(page.title)}</h1>${renderIntro(page.intro)}<section class="dual-section"><h2>${escapeHtml(categorySection.title || 'Which areas would you like to look at?')}</h2>${categorySection.helper ? `<p class="small">${escapeHtml(categorySection.helper)}</p>` : ''}${categoryCards}</section><section class="dual-section"><h2>${escapeHtml(page.global_controls_label || 'No issues to report, or prefer not to answer?')}</h2>${global}</section><section class="dual-section"><h2>${escapeHtml(otherSection.title || 'Other issues')}</h2>${otherStatusMarkup}${otherTextMarkup}</section><section class="dual-section"><h2>${escapeHtml(prioritySection.title || 'Choose your priority areas')}</h2>${priorityMarkup}${skipMarkup}${noPriority}</section>${renderActions({})}</section>`;
}

function renderReview(spec, model, answers, errors) {
  const page = specPage(spec, 'review');
  const about = specPage(spec, 'about').questions || [];
  const visibleAboutFields = new Set(model.visibleLocationFields(answers));
  const valueText = (path, options) => {
    const value = readPath(answers, path);
    return present(value) ? optionLabel(options, value) : 'Not answered';
  };
  const conditionalAboutFields = new Set(['suburb', 'suburb_other', 'past_residence', 'time_local', 'time_past', 'dependants']);
  const aboutRows = about.filter(question => ['single', 'locality_select'].includes(question.type) && question.id !== 'consent' && (!conditionalAboutFields.has(question.id) || visibleAboutFields.has(question.id))).map(question => {
    const options = question.id === 'suburb' ? [...spec.geography.localities, ...spec.geography.extra_locality_options] : question.options;
    return `<li><strong>${escapeHtml(question.label)}</strong><span>${escapeHtml(valueText(question.id, options))}</span></li>`;
  }).join('');
  const dependantQuestion = about.find(question => question.type === 'dependants_grid');
  const dependantRows = answers.has_dependants === 'yes' && dependantQuestion ? dependantQuestion.rows.map(row => {
    const values = dependantQuestion.columns.map(column => answers.dependants?.counts?.[row.id]?.[column.id]);
    if (!values.some(value => Number.isSafeInteger(value))) return '';
    return `<li><strong>${escapeHtml(row.label)}</strong><span>${escapeHtml(dependantQuestion.columns.map((column, index) => `${column.label}: ${Number.isSafeInteger(values[index]) ? values[index] : 'Not answered'}`).join('; '))}</span></li>`;
  }).join('') : '';
  const issueRows = spec.issue_bank.map(category => {
    const selected = model.selectedIssueOptions(answers, category.id);
    if (!selected.length) return '';
    return `<li><strong>${escapeHtml(category.title || category.label)}</strong><span>${escapeHtml(selected.map(option => option.label).join('; '))}</span><button type="button" class="small-link" data-action="edit-page" data-page="issues">Edit</button></li>`;
  }).join('');
  const otherRow = answers.other_issues_status === 'yes' ? `<li><strong>Other issues</strong><span>${escapeHtml(answers.other_issues || 'Yes, no further detail')}</span><button type="button" class="small-link" data-action="edit-page" data-page="issues">Edit</button></li>` : '';
  const areas = model.priorityCategories(answers);
  const areaRows = areas.map(categoryId => {
    const category = categoryId === 'OTHER' ? {title: 'Other issues'} : spec.issue_bank.find(item => item.id === categoryId) || {title: categoryId};
    let detail = '';
    if (bodyVariant === 'choice') {
      const needs = answers.needs?.[categoryId]?.selected || [];
      const needsLabels = needs.map(id => optionLabel(spec.needs, id));
      const lines = [];
      if (needsLabels.length) lines.push(`Kinds of help: ${needsLabels.join('; ')}`);
      if (answers.needs?.[categoryId]?.priority?.length) lines.push(`Priority kinds of help: ${answers.needs[categoryId].priority.map(id => optionLabel(spec.needs, id)).join('; ')}`);
      if (answers.needs?.[categoryId]?.skip === true) lines.push('Detailed follow-up: Prefer not to answer');
      if (answers.needs?.[categoryId]?.other_text) lines.push(`Other kind of help: ${answers.needs[categoryId].other_text}`);
      const pairText = model.activePairs(answers).filter(pair => pair.category === categoryId).map(pair => {
        const record = answers.pairs?.[pair.key] || {};
        const pairLines = [`${optionLabel(spec.needs, pair.need)}`];
        if (record.focus_issues?.length) pairLines.push(`Issues: ${record.focus_issues.map(id => optionLabel(model.selectedIssueOptions(answers, categoryId), id)).join('; ')}`);
        if (record.contacts?.length) pairLines.push(`Sources: ${record.contacts.map(id => optionLabel(spec.resources, id)).join('; ')}`);
        if (record.other_source) pairLines.push(`Other source: ${record.other_source}`);
        if (record.ratings) for (const [sourceId, rating] of Object.entries(record.ratings)) pairLines.push(`${optionLabel(spec.resources, sourceId)}: ${optionLabel(spec.rating_response_options, rating)}`);
        if (record.met_status) pairLines.push(`Overall: ${optionLabel(spec.overall_need_scale, record.met_status)}`);
        if (record.current_gap) pairLines.push(`Still missing: ${optionLabel([{id: 'yes', label: 'Yes'}, {id: 'no', label: 'No'}, {id: 'unsure', label: 'Not sure'}, {id: 'prefer_not', label: 'Prefer not to answer'}], record.current_gap)}`);
        if (record.comments) pairLines.push(`Comment: ${record.comments}`);
        return pairLines.join(' — ');
      });
      lines.push(...pairText);
      const sourceSets = answers.source_characteristics?.[categoryId] || {};
      for (const group of ['used', 'not_used']) for (const [sourceId, values] of Object.entries(sourceSets[group] || {})) if (Array.isArray(values) && values.length) {
        lines.push(`${group === 'used' ? 'Used' : 'Other'} source statements — ${optionLabel(spec.resources, sourceId)}: ${values.map(id => optionLabel([...spec.characteristics, ...spec.characteristic_response_controls], id)).join('; ')}`);
      }
      if (model.networkOwner(answers) === categoryId && answers.personal_networks?.length) lines.push(`Friends and family: ${answers.personal_networks.map(id => optionLabel(spec.personal_networks, id)).join('; ')}`);
      if (answers.needs?.[categoryId]?.area_comment) lines.push(`Area comment: ${answers.needs[categoryId].area_comment}`);
      detail = lines.map(line => `<p class="review-value">${escapeHtml(line)}</p>`).join('');
    } else {
      const area = model.areaView(answers, categoryId);
      const record = answers.open_areas?.[categoryId] || {};
      const areaPage = spec.pages?.find(item => item.id === 'area');
      const fieldLabel = field => areaPage?.sections?.flatMap(section => section.questions || []).find(question => question.field === field)?.label || field;
      const lines = [];
      for (const field of ['needs_summary', 'used_experience', 'other_sources', 'area_comments']) if (present(record[field])) lines.push(`${fieldLabel(field)}: ${record[field]}`);
      for (const need of area?.needs || []) for (const field of ['need_description', 'focus_issues_text', 'sources_text', 'helpfulness_text', 'met_text', 'current_gap_text', 'comments']) if (present(need.answers?.[field])) lines.push(`Need ${need.number} — ${fieldLabel(field)}: ${need.answers[field]}`);
      detail = lines.map(line => `<p class="review-value">${escapeHtml(line)}</p>`).join('');
    }
    return `<li class="review-item"><div class="review-header"><h3>${escapeHtml(category.title || category.label)}</h3><button type="button" class="small-link" data-action="edit-page" data-page="area:${escapeHtml(categoryId)}">Edit</button></div>${detail || '<p class="review-value">No further detail was provided.</p>'}</li>`;
  }).join('');
  const comment = page.sections?.find(section => section.id === 'general_comments')?.questions?.[0] || {};
  const networkText = bodyVariant === 'open' && present(answers.network_text) ? `<li class="review-item"><div class="review-header"><h3>Friends and family</h3><button type="button" class="small-link" data-action="edit-page" data-page="area:${escapeHtml(areas[0] || '')}">Edit</button></div><p class="review-value">${escapeHtml(answers.network_text)}</p></li>` : '';
  return `<section class="survey-layout dual-page"><h1 tabindex="-1">${escapeHtml(page.title)}</h1>${renderIntro(page.intro)}<section class="dual-section"><h2>About you</h2><ul class="review-list">${aboutRows}${dependantRows}</ul><button type="button" class="small-link" data-action="edit-page" data-page="about">Edit</button></section><section class="dual-section"><h2>Your issues</h2><ul class="review-list">${issueRows || ''}${otherRow || (!issueRows ? '<li>Not answered</li>' : '')}</ul><button type="button" class="small-link" data-action="edit-page" data-page="issues">Edit</button></section><section class="dual-section"><h2>Your experience</h2>${areas.length ? `<ul class="review-list">${areaRows}${networkText}</ul>` : networkText || '<p class="inline-note">No detailed issue area was selected.</p>'}</section><section class="dual-section"><h2>${escapeHtml(comment.label || 'Anything else you would like to add?')}</h2>${textQuestion({path: 'comments', label: comment.label || 'Anything else you would like to add?', help: comment.help, value: answers.comments, rows: comment.rows || 6, errors})}</section>${renderActions({continueLabel: 'Finish survey'})}</section>`;
}

function renderWelcome(spec, answers, errors) {
  const page = specPage(spec, 'welcome');
  const consent = page.questions?.find(question => question.id === 'consent') || {};
  return `<section class="welcome dual-page"><h1 tabindex="-1">${escapeHtml(page.title)}</h1><div class="welcome-intro">${renderIntro(page.intro, 'lead')}</div>${(page.sections || []).map(section => `<section class="information-block"><h2>${escapeHtml(section.title)}</h2><p>${escapeHtml(section.text)}</p></section>`).join('')}<div class="resource-links">${(page.links || []).map(link => `<a href="${escapeHtml(link.url)}">${escapeHtml(link.label)}</a>`).join('')}</div><div class="welcome-card">${choicesQuestion({path: 'consent', label: consent.label, options: consent.options, value: answers.consent, errors, idPrefix: 'consent'})}<div class="question-actions"><button type="button" class="button primary" data-action="start">${escapeHtml(page.buttons?.[0] || 'Start survey')}</button><button type="button" class="skip-button" data-action="leave">${escapeHtml(page.buttons?.[1] || 'Leave survey')}</button></div></div></section>`;
}

function renderTerminal(spec, kind) {
  const screen = spec.system_screens?.[kind] || {};
  const page = kind === 'thanks' ? specPage(spec, 'thanks') : null;
  if (page) return `<section class="finish dual-page"><h1 tabindex="-1">${escapeHtml(page.title)}</h1>${renderIntro(page.intro)} </section>`;
  return `<section class="finish dual-page"><h1 tabindex="-1">${escapeHtml(screen.title || '')}</h1><p class="lead">${escapeHtml(screen.text || '')}</p><div class="finish-actions"><button type="button" class="button primary" data-action="reset">${escapeHtml(screen.button || 'Return to the start')}</button></div></section>`;
}

function renderOutOfScope(spec) {
  const screen = spec.system_screens?.out_of_scope || {};
  return `<section class="survey-layout dual-page"><h1 tabindex="-1">${escapeHtml(screen.title || '')}</h1><p class="lead">${escapeHtml(screen.text || '')}</p><div class="question-actions"><button type="button" class="back-button" data-action="back">${escapeHtml(screen.buttons?.[0] || 'Back')}</button><button type="button" class="button primary" data-action="leave">${escapeHtml(screen.buttons?.[1] || 'Leave survey')}</button></div></section>`;
}

function renderArea(spec, model, answers, categoryId, route) {
  const renderer = bodyVariant === 'choice' ? renderChoiceArea : renderOpenArea;
  const markup = renderer(spec, model, answers, categoryId);
  const index = Math.max(0, route.indexOf(`area:${categoryId}`));
  const total = route.length;
  const sectionName = spec.ui?.sections?.[2] || 'Your experience';
  const top = `<div class="dual-area-top"><div class="step-topline"><span><strong>Step ${index + 1} of ${total}</strong></span><span>${escapeHtml(sectionName)}</span></div><div class="section-track" aria-hidden="true"><span class="visited"></span><span class="visited"></span><span class="visited"></span><span></span></div></div>`;
  // Area renderers own the substantive page only. Keep one shared navigation
  // row here so both variants expose the same Back, Continue and Leave flow.
  return `${top}${markup}${renderActions({})}`;
}

function captureFocus() {
  const active = document.activeElement;
  if (!active || !main?.contains(active)) return null;
  return {id: active.id, path: active.getAttribute('data-path'), start: active.selectionStart, end: active.selectionEnd};
}

function restoreFocus(token) {
  if (!token) return;
  let target = token.id ? document.getElementById(token.id) : null;
  if (!target && token.path) target = [...main.querySelectorAll('[data-path]')].find(node => node.getAttribute('data-path') === token.path);
  if (!target) return;
  target.focus({preventScroll: true});
  if (typeof token.start === 'number' && typeof target.setSelectionRange === 'function') {
    try { target.setSelectionRange(token.start, token.end ?? token.start); } catch { /* select elements do not support ranges */ }
  }
}

function restoreCounters() {
  for (const output of main.querySelectorAll('[data-count-for]')) {
    const path = output.getAttribute('data-count-for');
    const control = [...main.querySelectorAll('[data-path]')].find(node => node.getAttribute('data-path') === path && (node.tagName === 'TEXTAREA' || node.type === 'text'));
    output.textContent = `${characterCount(control?.value || '').toLocaleString('en-AU')} / 10,000 characters`;
  }
}

function applyErrors(errors) {
  for (const node of main.querySelectorAll('[data-error-for]')) {
    const message = questionError(node.getAttribute('data-error-for'), errors);
    node.textContent = message;
    node.hidden = !message;
  }
  for (const control of main.querySelectorAll('[data-path]')) {
    const path = control.getAttribute('data-path');
    const invalid = errors.some(error => error.path === path || error.path.startsWith(`${path}.`));
    if (invalid) control.setAttribute('aria-invalid', 'true');
    else control.removeAttribute('aria-invalid');
  }
}

let choiceSpec;
let openSpec;
let model;
let renderChoiceArea;
let renderOpenArea;
let state;
let draft;
let pageId = 'welcome';
let errors = [];
let openedCategories = new Set();
let sessionEnded = false;

function activeSpec() {
  return bodyVariant === 'choice' ? choiceSpec : openSpec;
}

function initialState() {
  return bodyVariant === 'open' ? {variant: 'open_response'} : {};
}

function keepOpenVariant(value) {
  const next = clone(value) || {};
  if (bodyVariant === 'open') next.variant = 'open_response';
  else delete next.variant;
  return next;
}

function currentRoute() {
  if (!model || !draft) return ['welcome'];
  return model.route(draft);
}

function clearSession() {
  state = null;
  draft = null;
  openedCategories = new Set();
}

function resetToStart() {
  sessionEnded = false;
  state = initialState();
  draft = clone(state);
  errors = [];
  pageId = 'welcome';
  openedCategories = new Set();
  render({scrollTop: true});
}

function confirmationText(kind) {
  const ui = activeSpec().ui || {};
  if (kind === 'category') return ui.category_removal_confirmation?.text || ui.change_confirmation?.text || '';
  if (kind === 'remove-need') return ui.remove_need_confirmation?.text || '';
  if (kind === 'skip-need') return ui.skip_need_confirmation?.text || '';
  return ui.change_confirmation?.text || '';
}

function confirmChange(kind) {
  const message = confirmationText(kind);
  return !message || window.confirm(message);
}

function prepareCandidate() {
  const before = state || initialState();
  const result = model.prepareUpdate(before, draft || before);
  const candidate = keepOpenVariant(result.state);
  return {...result, state: candidate, removedPaths: [...new Set(result.removedPaths || [])]};
}

function commitDraft({step = null, confirmation = 'change', forceConfirmation = false} = {}) {
  if (!model || !draft) return false;
  let prepared;
  try {
    prepared = prepareCandidate();
  } catch (error) {
    errors = [{path: '', message: error?.message || 'Please check your answers and try again.'}];
    render({preserve: true});
    return false;
  }
  if (step) {
    const nextErrors = model.validateBeforeContinue(prepared.state, step);
    if (nextErrors.length) {
      errors = nextErrors;
      render({focusError: true});
      return false;
    }
  }
  if ((prepared.removedPaths.length || forceConfirmation) && !confirmChange(confirmation)) {
    errors = [];
    render({preserve: true});
    return false;
  }
  state = prepared.state;
  draft = clone(state);
  errors = [];
  return true;
}

function routeTo(id, {scrollTop = true} = {}) {
  pageId = id;
  errors = [];
  render({scrollTop, preserve: false});
}

function nextPageAfter(id) {
  const route = currentRoute();
  const index = route.indexOf(id);
  return index >= 0 ? route[index + 1] || 'review' : 'review';
}

function render(options = {}) {
  if (!main || !model || (!draft && !['thanks', 'exit'].includes(pageId))) return;
  const focusToken = options.preserve === false ? null : captureFocus();
  const previousScroll = options.preserve === false ? null : window.scrollY;
  const route = currentRoute();
  const spec = activeSpec();
  let markup = '';
  try {
    if (pageId === 'welcome') markup = renderWelcome(spec, draft, errors);
    else if (pageId === 'about') markup = `<div class="dual-page">${renderStepHeader(spec, route, pageId)}</div>${renderAbout(spec, model, draft, errors)}`;
    else if (pageId === 'issues') markup = `<div class="dual-page">${renderStepHeader(spec, route, pageId)}</div>${renderIssues(spec, model, draft, errors, openedCategories)}`;
    else if (pageId.startsWith('area:')) markup = renderArea(spec, model, draft, pageId.slice(5), route);
    else if (pageId === 'review') markup = `<div class="dual-page">${renderStepHeader(spec, route, pageId)}</div>${renderReview(spec, model, draft, errors)}`;
    else if (pageId === 'out_of_scope') markup = renderOutOfScope(spec);
    else if (pageId === 'exit') markup = renderTerminal(spec, 'exit');
    else if (pageId === 'thanks') markup = renderTerminal(spec, 'thanks');
    else markup = renderWelcome(spec, draft, errors);
  } catch (error) {
    markup = `<section class="finish dual-page"><h1>There was a problem loading this page</h1><p class="lead">${escapeHtml(error?.message || 'Please refresh and try again.')}</p></section>`;
  }
  main.innerHTML = `<div class="survey-root">${markup}<div class="survey-errors" data-survey-errors aria-live="polite">${errors.map(error => `<p>${escapeHtml(error.message)}</p>`).join('')}</div></div>`;
  for (const button of main.querySelectorAll('button')) if (!button.getAttribute('type')) button.setAttribute('type', 'button');
  restoreCounters();
  applyErrors(errors);
  if (options.focusError && errors.length) {
    const first = [...main.querySelectorAll('[data-path]')].find(node => node.getAttribute('data-path') === errors[0].path);
    if (first) first.focus({preventScroll: true});
  } else if (options.preserve !== false) restoreFocus(focusToken);
  if (options.scrollTop) window.scrollTo?.(0, 0);
  else if (previousScroll !== null && previousScroll !== undefined) window.scrollTo?.(0, previousScroll);
}

function setInputValue(element) {
  const path = element.getAttribute('data-path');
  if (!path || !draft) return;
  const kind = element.dataset.kind || (element.tagName === 'TEXTAREA' ? 'text' : element.type === 'number' ? 'number' : 'text');
  if (kind === 'text') {
    if (element.dataset.openCat !== undefined) {
      const value = normaliseNewlines(element.value);
      draft = keepOpenVariant(model.setText(draft, {
        categoryId: element.dataset.openCat,
        needId: element.dataset.openNeed || undefined,
        field: element.dataset.openField,
        value
      }));
    } else {
      setPath(draft, path, normaliseNewlines(element.value));
    }
    return;
  }
  if (kind === 'number') {
    const value = element.value === '' ? undefined : Number(element.value);
    setPath(draft, path, Number.isFinite(value) ? value : undefined);
    return;
  }
  if (kind === 'boolean') {
    setPath(draft, path, element.checked === true);
    return;
  }
  if ((kind === 'single' && element.type === 'checkbox') || kind === 'boolean') {
    setPath(draft, path, element.checked === true);
    return;
  }
  if (kind === 'single') {
    if (element.type === 'radio' && !element.checked) return;
    setPath(draft, path, element.value);
    return;
  }
  if (kind === 'select') {
    setPath(draft, path, element.value || undefined);
    return;
  }
  if (kind === 'multi') {
    const current = readPath(draft, path);
    const exclusive = text(element.dataset.exclusive).split(',').map(item => item.trim()).filter(Boolean);
    setPath(draft, path, element.checked ? toggleValue(current, element.value, exclusive) : (Array.isArray(current) ? current.filter(item => item !== element.value) : []));
  }
}

function issueSelectionChanged(element) {
  const path = element.getAttribute('data-path') || '';
  return path.startsWith('issues.') || path === 'other_issues_status' || path === 'other_issues';
}

function handleChoiceChange(element) {
  if (!element || !draft) return;
  if (element.type === 'radio' && !element.checked) return;
  setInputValue(element);
  if (element.getAttribute('data-path') === 'issue_control' && present(element.value)) {
    delete draft.issues;
    delete draft.other_issues_status;
    delete draft.other_issues;
  }
  if (issueSelectionChanged(element)) {
    const path = element.getAttribute('data-path');
    const value = readPath(draft, path);
    if (path.startsWith('issues.') && Array.isArray(value) && value.length) delete draft.issue_control;
    if (path === 'other_issues_status' && element.value === 'yes') delete draft.issue_control;
  }
  render({preserve: true});
}

function handleIssueDisclosure(element) {
  const category = element.dataset.category;
  if (!category) return;
  if (openedCategories.has(category)) openedCategories.delete(category);
  else {
    openedCategories.add(category);
    draft.presented_categories = Array.isArray(draft.presented_categories) ? [...new Set([...draft.presented_categories, category])] : [category];
  }
  render({preserve: true});
}

function categoryHasAnswers(category) {
  const issue = draft?.issues?.[category];
  if (issue && (issue.selected?.length || present(issue.other_text))) return true;
  if (draft?.needs?.[category] || draft?.pairs && Object.keys(draft.pairs).some(key => key.startsWith(`${category}::`))) return true;
  return Boolean(draft?.source_characteristics?.[category]);
}

function handleCategoryCheckboxChange(element) {
  const category = element.dataset.category;
  if (!category) return;
  if (element.checked) {
    openedCategories.add(category);
    draft.presented_categories = Array.isArray(draft.presented_categories) ? [...new Set([...draft.presented_categories, category])] : [category];
    render({preserve: true});
    return;
  }
  if (categoryHasAnswers(category)) {
    handleRemoveCategory(category);
    return;
  }
  openedCategories.delete(category);
  render({preserve: true});
}

function handleRemoveCategory(category) {
  if (!category || !draft) return;
  if (!commitDraft()) return;
  const before = state;
  let result;
  try {
    result = model.removeArea(before, category);
  } catch {
    const next = clone(before);
    if (category === 'OTHER') { delete next.other_issues_status; delete next.other_issues; }
    else if (next.issues) delete next.issues[category];
    result = model.prepareUpdate(before, next);
  }
  if (result.removedPaths?.length && !confirmChange('category')) {
    draft = clone(state);
    render({preserve: true});
    return;
  }
  state = keepOpenVariant(result.state);
  draft = clone(state);
  openedCategories.delete(category);
  render({preserve: true});
}

function handleOpenAreaAction(actionElement) {
  const category = actionElement.dataset.category;
  if (!category || !draft) return;
  const need = actionElement.dataset.need;
  if (!commitDraft()) return;
  try {
    if (actionElement.dataset.action === 'add-need') {
      const result = model.addNeed(state, category);
      state = keepOpenVariant(result.state);
      draft = clone(state);
      render({preserve: true});
      return;
    }
    if (actionElement.dataset.action === 'remove-need') {
      const result = model.removeNeed(state, category, need);
      if (result.removedPaths?.length && !confirmChange('remove-need')) { draft = clone(state); render({preserve: true}); return; }
      state = keepOpenVariant(result.state);
      draft = clone(state);
      render({preserve: true});
      return;
    }
    if (actionElement.dataset.action === 'skip-need-details') {
      const result = model.skipNeedDetails(state, category);
      if (result.removedPaths?.length && !confirmChange('skip-need')) { draft = clone(state); render({preserve: true}); return; }
      state = keepOpenVariant(result.state);
      draft = clone(state);
      render({preserve: true});
    }
  } catch (error) {
    errors = [{path: '', message: error?.message || 'Please check this issue area and try again.'}];
    render({preserve: true});
  }
}

function handleContinue() {
  if (pageId === 'welcome') {
    const consentErrors = model.validateBeforeContinue(draft, 'welcome');
    if (consentErrors.length) { errors = consentErrors; render({focusError: true}); return; }
    if (draft.consent === 'under_18') {
      clearSession();
      sessionEnded = true;
      window.location.href = 'youth.html';
      return;
    }
    if (!commitDraft({step: 'welcome'})) return;
    if (draft.consent === 'adult_decline') {
      clearSession();
      sessionEnded = true;
      pageId = 'exit';
      render({scrollTop: true, preserve: false});
      return;
    }
    const route = currentRoute();
    routeTo(route[1] || 'about');
    return;
  }
  if (pageId === 'about') {
    if (!commitDraft({step: 'about'})) return;
    const route = currentRoute();
    routeTo(route[2] || 'issues');
    return;
  }
  if (pageId === 'issues') {
    if (!commitDraft({step: 'issues'})) return;
    routeTo(nextPageAfter('issues'));
    return;
  }
  if (pageId.startsWith('area:')) {
    if (!commitDraft({step: pageId})) return;
    routeTo(nextPageAfter(pageId));
    return;
  }
  if (pageId === 'review') {
    if (!commitDraft({step: 'review'})) return;
    clearSession();
    sessionEnded = true;
    pageId = 'thanks';
    render({scrollTop: true, preserve: false});
  }
}

function handleBack() {
  if (pageId === 'out_of_scope') { routeTo('about'); return; }
  if (!commitDraft()) return;
  const route = currentRoute();
  const index = route.indexOf(pageId);
  if (index <= 0) routeTo('welcome');
  else routeTo(route[index - 1]);
}

function handleEdit(page) {
  if (!page) return;
  if (!commitDraft()) return;
  if (page === 'about' || page === 'issues' || page === 'review' || page.startsWith('area:')) routeTo(page);
}

function leaveSurvey() {
  clearSession();
  sessionEnded = true;
  pageId = 'exit';
  errors = [];
  render({scrollTop: true, preserve: false});
}

main?.addEventListener('input', event => {
  const element = event.target.closest?.('[data-path]');
  if (!element || !main.contains(element)) return;
  const kind = element.dataset.kind || '';
  if (kind === 'text' || element.tagName === 'TEXTAREA') {
    setInputValue(element);
    const path = element.getAttribute('data-path');
    for (const output of main.querySelectorAll('[data-count-for]')) if (output.getAttribute('data-count-for') === path) output.textContent = `${characterCount(element.value).toLocaleString('en-AU')} / 10,000 characters`;
  } else if (kind === 'number') {
    setInputValue(element);
  }
});

main?.addEventListener('change', event => {
  const actionElement = event.target.closest?.('[data-action]');
  if (actionElement && actionElement.dataset.action === 'toggle-disclosure') {
    if (actionElement.tagName === 'INPUT') handleCategoryCheckboxChange(actionElement);
    return;
  }
  const element = event.target.closest?.('[data-path]');
  if (element && main.contains(element)) {
    if (element.dataset.kind === 'text' || element.tagName === 'TEXTAREA') return;
    if (element.dataset.kind === 'number') { setInputValue(element); return; }
    handleChoiceChange(element);
    return;
  }
});

main?.addEventListener('click', event => {
  const element = event.target.closest?.('[data-action]');
  if (!element || !main.contains(element)) return;
  const action = element.dataset.action;
  if (action === 'toggle-disclosure') {
    // The checkbox itself is handled on change so clicking its label does not
    // toggle the disclosure twice. The explicit Expand/Collapse button uses
    // the click path.
    if (element.tagName !== 'INPUT') { event.preventDefault(); handleIssueDisclosure(element); }
    return;
  }
  if (action === 'remove-category') { event.preventDefault(); handleRemoveCategory(element.dataset.category); return; }
  if (action === 'add-need' || action === 'remove-need' || action === 'skip-need-details') { event.preventDefault(); handleOpenAreaAction(element); return; }
  if (action === 'start' || action === 'continue') { event.preventDefault(); handleContinue(); return; }
  if (action === 'back') { event.preventDefault(); handleBack(); return; }
  if (action === 'leave') { event.preventDefault(); leaveSurvey(); return; }
  if (action === 'reset') { event.preventDefault(); resetToStart(); return; }
  if (action === 'edit-page') { event.preventDefault(); handleEdit(element.dataset.page); }
});

window.addEventListener('pageshow', event => {
  if (!event.persisted || !model) return;
  sessionEnded = false;
  resetToStart();
});

async function loadJson(url) {
  const response = await fetch(new URL(url, moduleUrl));
  if (!response.ok) throw new Error(`Unable to load questionnaire specification (${response.status}).`);
  return response.json();
}

async function boot() {
  if (!main) return;
  try {
    const [choice, open, choiceLogic, openModel, choiceArea, openArea] = await Promise.all([
      loadJson('./choice/survey-spec.json'),
      loadJson('./open/open-survey-spec.json'),
      import('./choice/logic-core.mjs'),
      import('./open/open-model.mjs'),
      import('./choice-area-ui.mjs'),
      import('./open-area-ui.mjs')
    ]);
    choiceSpec = choice;
    openSpec = open;
    renderChoiceArea = choiceArea.renderChoiceArea;
    renderOpenArea = openArea.renderOpenArea;
    model = bodyVariant === 'choice' ? choiceLogic.createSurveyModel(choiceSpec) : openModel.createOpenSurveyModel(openSpec, choiceSpec);
    state = initialState();
    draft = clone(state);
    render({scrollTop: true, preserve: false});
  } catch (error) {
    if (main) main.innerHTML = `<section class="finish dual-page"><h1>Unable to load this questionnaire</h1><p class="lead">${escapeHtml(error?.message || 'Please refresh and try again.')}</p></section>`;
  }
}

boot();
