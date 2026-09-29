/**
 * Render one complete choice-led issue-area page.
 *
 * This module deliberately returns markup only.  The survey shell owns input
 * handling, draft state and navigation; every answer control is identified by
 * its stable data-path so the shell can use the same generic control layer on
 * every area page.
 */

const text = value => String(value ?? '');
const list = value => Array.isArray(value) ? value : [];

/** Escape both respondent-entered text and spec text before inserting it into HTML. */
const escapeHtml = value => text(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const normaliseNewlines = value => text(value).replace(/\r\n?/g, '\n');
const characterCount = value => Array.from(normaliseNewlines(value)).length;

const checked = (value, optionId) => Array.isArray(value)
  ? value.includes(optionId)
  : value === optionId;

const idFor = (prefix, path) => `${prefix}-${text(path)}`
  .replace(/[^A-Za-z0-9_-]+/g, '-')
  .replace(/^-+|-+$/g, '') || `${prefix}-field`;

const shortCount = value => characterCount(value).toLocaleString('en-AU');

const optionObject = (options, id) => list(options).find(option => option?.id === id);

const sourceObject = (spec, source) => {
  if (source && typeof source === 'object') return source;
  return optionObject(spec?.resources, source) || {id: source, label: source, short_label: source};
};

const needObject = (spec, need) => {
  if (need && typeof need === 'object') return need;
  return optionObject(spec?.needs, need) || {id: need, label: need, short_label: need};
};

const issueObject = issue => issue && typeof issue === 'object'
  ? issue
  : {id: issue, label: issue};

const renderHint = value => value ? `<p class="field-hint">${escapeHtml(value)}</p>` : '';

function renderChoice({path, option, value, kind, exclusive = [], idPrefix = 'choice'}) {
  const optionId = text(option?.id);
  const inputId = idFor(idPrefix, `${path}.${optionId}`);
  const type = kind === 'single' ? 'radio' : 'checkbox';
  const isChecked = checked(value, optionId);
  const exclusiveAttr = kind === 'multi'
    ? ` data-exclusive="${escapeHtml(exclusive.join(','))}"`
    : '';
  return `<label class="choice" for="${escapeHtml(inputId)}"><input id="${escapeHtml(inputId)}" type="${type}" name="${escapeHtml(path)}" value="${escapeHtml(optionId)}" data-path="${escapeHtml(path)}" data-kind="${escapeHtml(kind)}"${exclusiveAttr}${isChecked ? ' checked' : ''}><span class="choice-body"><span class="choice-label">${escapeHtml(option?.label)}</span>${option?.hint ? `<span class="choice-hint">${escapeHtml(option.hint)}</span>` : ''}</span></label>`;
}

function renderGroup({legend, path, options, value, kind = 'multi', exclusive = [], help = '', className = '', idPrefix = 'choice', afterOption = null}) {
  const optionMarkup = list(options).map(option => {
    const choice = renderChoice({path, option, value, kind, exclusive, idPrefix});
    return afterOption ? `${choice}${afterOption(option, value)}` : choice;
  }).join('');
  return `<fieldset class="question-group${className ? ` ${escapeHtml(className)}` : ''}"><legend>${escapeHtml(legend)}</legend>${renderHint(help)}<div class="choices">${optionMarkup}</div></fieldset>`;
}

function renderBooleanChoice({path, label, value, idPrefix = 'choice'}) {
  const inputId = idFor(idPrefix, path);
  return `<label class="choice" for="${escapeHtml(inputId)}"><input id="${escapeHtml(inputId)}" type="checkbox" name="${escapeHtml(path)}" value="true" data-path="${escapeHtml(path)}" data-kind="boolean"${value === true ? ' checked' : ''}><span class="choice-body"><span class="choice-label">${escapeHtml(label)}</span></span></label>`;
}

function renderTextArea({path, label, value, help = '', conditionalHint = ''}) {
  const inputId = idFor('choice-text', path);
  const countId = `${inputId}-count`;
  const errorId = `${inputId}-error`;
  const normalised = normaliseNewlines(value);
  const hint = [help, conditionalHint].filter(Boolean).join(' ');
  return `<div class="question-group text-question"><label class="field-label" for="${escapeHtml(inputId)}">${escapeHtml(label)}</label>${renderHint(hint)}<textarea id="${escapeHtml(inputId)}" name="${escapeHtml(path)}" class="textarea" rows="6" spellcheck="true" data-path="${escapeHtml(path)}" data-kind="text" aria-describedby="${escapeHtml(countId)} ${escapeHtml(errorId)}">${escapeHtml(normalised)}</textarea><output data-count-for="${escapeHtml(path)}" id="${escapeHtml(countId)}" class="char-count">${shortCount(normalised)} / 10,000 characters</output><p id="${escapeHtml(errorId)}" class="field-error" hidden></p></div>`;
}

function renderSourceBlock({spec, state, categoryId, block, issues}) {
  const pairKey = text(block?.key || `${categoryId}::${block?.need}`);
  const need = needObject(spec, block?.need);
  const pair = state?.pairs?.[pairKey] || {};
  const focusPath = `pairs.${pairKey}.focus_issues`;
  const contactsPath = `pairs.${pairKey}.contacts`;
  const contacts = list(pair.contacts);
  const focus = list(pair.focus_issues);
  const issueOptions = list(issues).map(issueObject);
  const sourceOptions = list(spec?.resources);
  const focusGroup = block?.focusChoiceVisible
    ? renderGroup({
      legend: 'Which of the issues you selected did you need this help with?',
      path: focusPath,
      options: issueOptions,
      value: focus,
      kind: 'multi',
      exclusive: [],
      help: 'Select all that apply. You can leave this unanswered if the help relates to the area more generally.',
      className: 'focus-issues',
      idPrefix: 'focus'
    })
    : '';
  const n07Text = contacts.includes('N07')
    ? renderTextArea({
      path: `pairs.${pairKey}.other_source`,
      label: 'What other source of help would you like to mention?',
      value: pair.other_source,
      help: 'Optional. Describe the type of support, without naming individual people or internal military services.'
    })
    : '';
  return `<section class="area-subsection source-block" data-pair-key="${escapeHtml(pairKey)}"><h3>Help needed: ${escapeHtml(need.short_label || need.label || need.id)}</h3>${focusGroup}${renderGroup({
    legend: 'For this kind of help, which sources did you try or receive help from?',
    path: contactsPath,
    options: sourceOptions,
    value: contacts,
    kind: 'multi',
    exclusive: list(spec?.source_exclusive_ids),
    help: 'Select all that apply. Include unsuccessful attempts, online information you used, and help offered without asking. Put official military services and their websites under Defence or military-provided support.',
    className: 'source-choices',
    idPrefix: 'source',
    afterOption: option => option?.id === 'N07' ? n07Text : ''
  })}</section>`;
}

function renderCharacteristicCard({spec, state, categoryId, group, source}) {
  const sourceInfo = sourceObject(spec, source);
  const sourceId = text(sourceInfo.id);
  const path = `source_characteristics.${categoryId}.${group}.${sourceId}`;
  const value = state?.source_characteristics?.[categoryId]?.[group]?.[sourceId];
  const help = group === 'used'
    ? 'Select all that apply. A group may include different services; you can explain different experiences in the optional comments for the relevant need.'
    : 'Select all that apply, choose Not sure or leave this unanswered. You do not need to guess.';
  return `<section class="source-characteristic-card"><h3>${escapeHtml(sourceInfo.short_label || sourceInfo.label || sourceId)}</h3>${renderGroup({
    legend: 'Which statements apply to this source of help?',
    path,
    options: [...list(spec?.characteristics), ...list(spec?.characteristic_response_controls)],
    value,
    kind: 'multi',
    exclusive: list(spec?.characteristic_response_controls).map(option => option.id),
    help,
    className: 'source-characteristics',
    idPrefix: `characteristic-${group}`
  })}</section>`;
}

function renderOutcomeBlock({spec, state, block}) {
  const pairKey = text(block?.key);
  const need = needObject(spec, block?.need);
  const pair = state?.pairs?.[pairKey] || {};
  const ratings = pair.ratings || {};
  const ratingMarkup = list(block?.ratingSources).map(source => {
    const sourceInfo = sourceObject(spec, source);
    const sourceId = text(sourceInfo.id);
    return `<div class="source-rating-card"><p class="source-heading">Source: ${escapeHtml(sourceInfo.short_label || sourceInfo.label || sourceId)}</p>${renderGroup({
      legend: 'How well did this source help meet this need?',
      path: `pairs.${pairKey}.ratings.${sourceId}`,
      options: list(spec?.rating_response_options),
      value: ratings[sourceId],
      kind: 'single',
      help: 'If you received no help from this source, choose that option rather than rating its helpfulness.',
      className: 'source-rating',
      idPrefix: 'rating'
    })}</div>`;
  }).join('');
  const gapOptions = [
    {id: 'yes', label: 'Yes'},
    {id: 'no', label: 'No'},
    {id: 'unsure', label: 'Not sure'},
    {id: 'prefer_not', label: 'Prefer not to answer'}
  ];
  return `<section class="area-subsection outcome-block" data-pair-key="${escapeHtml(pairKey)}"><h3>Help needed: ${escapeHtml(need.short_label || need.label || need.id)}</h3>${ratingMarkup}${renderGroup({
    legend: 'Overall, how fully was this need met?',
    path: `pairs.${pairKey}.met_status`,
    options: list(spec?.overall_need_scale),
    value: pair.met_status,
    kind: 'single',
    help: 'Think about all the help you received and anything you managed yourself. For an ongoing situation, answer about now. For a situation that ended, answer about how things stood when it ended.',
    className: 'need-met-status',
    idPrefix: 'met'
  })}${renderGroup({
    legend: 'Do you or your family still need any of this help that you are not getting?',
    path: `pairs.${pairKey}.current_gap`,
    options: gapOptions,
    value: pair.current_gap,
    kind: 'single',
    className: 'current-gap',
    idPrefix: 'gap'
  })}${renderTextArea({
    path: `pairs.${pairKey}.comments`,
    label: 'Is there anything else you would like us to understand about this need?',
    value: pair.comments,
    help: 'Optional. You can explain what help you needed, what happened, what worked or what is still missing. Write as much or as little as you like, up to 10,000 characters. Please leave out identifying details and do not describe internal military services.',
    conditionalHint: pair.current_gap === 'yes' ? 'You can also explain what help is still missing and what would make it work for you.' : ''
  })}</section>`;
}

/**
 * Render one complete area page. `model.areaView()` decides which pairs and
 * source cards are active; this function only renders the returned view.
 */
export function renderChoiceArea(spec, model, state = {}, categoryId) {
  if (!spec || !model || typeof model.areaView !== 'function') {
    throw new TypeError('A survey specification and model with areaView() are required.');
  }
  if (!categoryId) throw new TypeError('A category ID is required.');

  const answers = state && typeof state === 'object' ? state : {};
  const view = model.areaView(answers, categoryId);
  if (!view) return '';

  const needs = list(view.needChoices).length ? list(view.needChoices) : list(spec.needs);
  const needsPath = `needs.${categoryId}.selected`;
  const needsState = answers.needs?.[categoryId] || {};
  const selectedNeeds = list(needsState.selected);
  const substantiveNeeds = typeof model.selectedNeeds === 'function'
    ? list(model.selectedNeeds(answers, categoryId))
    : needs.filter(need => !list(spec.need_exclusive_ids).includes(need.id)).map(need => need.id)
      .filter(id => selectedNeeds.includes(id));
  const showNeedPriority = view.needsPriorityVisible === true;
  const showSkip = substantiveNeeds.length > 0 || needsState.skip === true;
  const priorityOptions = needs.filter(need => substantiveNeeds.includes(need.id));
  const priorityPath = `needs.${categoryId}.priority`;
  const priority = list(needsState.priority);

  const selectedIssueMarkup = list(view.issues).map(issue => `<li>${escapeHtml(issueObject(issue).label)}</li>`).join('');
  const selectedIssueSection = `<section class="area-recall" aria-labelledby="area-recall-title"><h2 id="area-recall-title">${escapeHtml(view.title || categoryId)}</h2><p>You selected the issues below. Think about the help you needed at the time, including help you received and help you did not receive. You can leave any question unanswered.</p><ul class="selected-issues">${selectedIssueMarkup}</ul></section>`;

  const h09Text = selectedNeeds.includes('H09')
    ? renderTextArea({
      path: `needs.${categoryId}.other_text`,
      label: 'What other kind of help did you need?',
      value: needsState.other_text,
      help: 'Optional. Up to 10,000 characters.'
    })
    : '';
  const needChoices = renderGroup({
    legend: 'What kinds of help did you need with these issues?',
    path: needsPath,
    options: needs,
    value: selectedNeeds,
    kind: 'multi',
    exclusive: list(spec.need_exclusive_ids),
    help: 'Select all that apply.',
    className: 'need-choices',
    idPrefix: 'need',
    afterOption: option => option?.id === 'H09' ? h09Text : ''
  });
  const prioritySection = showNeedPriority
    ? `<fieldset class="question-group need-priority"><legend>Which of these kinds of help mattered most?</legend>${renderHint('Choose up to two for more detailed questions. The other kinds of help you selected are still included.')}<div class="choices">${priorityOptions.map(option => renderChoice({path: priorityPath, option, value: priority, kind: 'multi', exclusive: [], idPrefix: 'need-priority'})).join('')}</div></fieldset>`
    : '';
  const skipSection = showSkip
    ? `<div class="question-group follow-up-skip">${renderBooleanChoice({path: `needs.${categoryId}.skip`, label: 'I prefer not to answer follow-up questions about these kinds of help', value: needsState.skip === true, idPrefix: 'need-skip'})}</div>`
    : '';

  const sourceBlocks = list(view.sourceBlocks).map(block => renderSourceBlock({spec, state: answers, categoryId, block, issues: view.issues})).join('');
  const usedCards = list(view.usedSourceCards).map(source => renderCharacteristicCard({spec, state: answers, categoryId, group: 'used', source})).join('');
  const unusedCards = list(view.unusedSourceCards).map(source => renderCharacteristicCard({spec, state: answers, categoryId, group: 'not_used', source})).join('');
  const networkSection = view.showPersonalNetworks
    ? renderGroup({
      legend: 'Which statements describe your friends and family as a source of support?',
      path: 'personal_networks',
      options: list(spec.personal_networks),
      value: answers.personal_networks,
      kind: 'multi',
      exclusive: ['none', 'prefer_not'],
      help: 'Select all that apply.',
      className: 'personal-networks',
      idPrefix: 'network'
    })
    : '';
  const outcomeBlocks = list(view.outcomeBlocks).map(block => renderOutcomeBlock({spec, state: answers, block})).join('');
  const fallbackComment = view.fallbackComment
    ? renderTextArea({
      path: `needs.${categoryId}.area_comment`,
      label: 'Is there anything else you would like us to understand about these issues?',
      value: needsState.area_comment,
      help: 'Optional. You can tell us what has helped, what matters to you or what might help in the future. Up to 10,000 characters. Please leave out identifying details and internal military service details.'
    })
    : '';

  return `<section class="survey-layout choice-area-page" data-page-id="${escapeHtml(view.pageId || `area:${categoryId}`)}" data-category-id="${escapeHtml(categoryId)}"><article class="question-card"><h1 tabindex="-1">${escapeHtml(view.title || categoryId)}</h1>${selectedIssueSection}<section class="area-section needs-section"><h2>Help you needed</h2>${needChoices}${prioritySection}${skipSection}</section>${sourceBlocks ? `<section class="area-section sources-section"><h2>Sources of help</h2>${sourceBlocks}</section>` : ''}${usedCards ? `<section class="area-section used-sources-section"><h2>Your experience of these sources of help</h2><p>For this issue area, you selected the sources below for one or both kinds of help. Which statements describe your experience? Include attempts that did not lead to help.</p>${usedCards}</section>` : ''}${unusedCards ? `<section class="area-section unused-sources-section"><h2>Other sources of help</h2><p>You did not select the sources below for either of the kinds of help discussed in this issue area. Based on what you knew at the time, which statements apply?</p>${unusedCards}</section>` : ''}${networkSection ? `<section class="area-section networks-section"><h2>Friends and family</h2><p>You selected friends or family as a source of help. These questions are about your support network generally.</p>${networkSection}</section>` : ''}${outcomeBlocks ? `<section class="area-section outcomes-section"><h2>How well was this need met?</h2>${outcomeBlocks}</section>` : ''}${fallbackComment ? `<section class="area-section area-comment-section"><h2>Anything else you would like to add?</h2>${fallbackComment}</section>` : ''}</article></section>`;
}
