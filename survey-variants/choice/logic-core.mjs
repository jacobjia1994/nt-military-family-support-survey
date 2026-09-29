/**
 * Pure reference model for the compact adult questionnaire.
 * No browser storage, network calls, telemetry or automatic publication.
 * Pass survey-spec.json into createSurveyModel(). UI state is separate from answers.
 */
export const MAX_TEXT_CHARACTERS = 10_000;
export const normaliseNewlines = value => String(value ?? '').replace(/\r\n?/g, '\n');
export const characterCount = value => Array.from(normaliseNewlines(value)).length;
export const textWithinLimit = value => characterCount(value) <= MAX_TEXT_CHARACTERS;
export const pairKey = (categoryId, needId) => `${categoryId}::${needId}`;
const clone = value => structuredClone(value);
const list = value => Array.isArray(value) ? value : [];
const unique = value => [...new Set(list(value))];
const present = value => value !== undefined && value !== null && value !== '';
const serial = value => JSON.stringify(value);
const same = (a, b) => serial(a) === serial(b);
const sorted = value => unique(value).sort();
const pathText = parts => parts.join('.');
const readPath = (object, parts) => parts.reduce((v, key) => v?.[key], object);
function deletePath(object, parts) {
  const parent = readPath(object, parts.slice(0, -1));
  if (parent && typeof parent === 'object') delete parent[parts.at(-1)];
}
/** Toggle one checkbox, keeping explicit none/unknown/refusal choices exclusive. */
export function toggleChoice(values, value, exclusive = []) {
  const before = unique(values);
  if (before.includes(value)) return before.filter(v => v !== value);
  if (exclusive.includes(value)) return [value];
  return [...before.filter(v => !exclusive.includes(v)), value];
}

export function createSurveyModel(spec) {
  if (!spec || !Array.isArray(spec.issue_bank) || !Array.isArray(spec.needs)) {
    throw new TypeError('A complete survey specification is required.');
  }
  const cats = spec.issue_bank.map(c => c.id);
  const catMap = new Map(spec.issue_bank.map(c => [c.id, c]));
  const helpIds = spec.need_substantive_ids;
  const sourceIds = spec.resources.filter(r => r.kind !== 'control').map(r => r.id);
  const fixed = ['N01', 'N02', 'N03', 'N04', 'N05'];
  const formal = [...fixed, 'N07'];
  const civilianAndPersonal = [...fixed, 'N06', 'N07'];
  const localAreas = ['darwin', 'palmerston', 'litchfield', 'greater_darwin_other'];
  const featureControls = ['none', 'unsure', 'prefer_not'];
  const featureIds = [...spec.characteristics.map(o => o.id), ...featureControls];
  const aboutQuestions = spec.pages.find(p => p.id === 'about').questions;
  const depQuestion = aboutQuestions.find(q => q.type === 'dependants_grid');
  const depBands = depQuestion.rows.map(r => r.id);
  const chosen = (values, allowed) => unique(values).filter(v => allowed.includes(v));
  const entry = (s, key) => s.pairs?.[key] || {};

  function validMulti(values, allowed, exclusive = []) {
    return Array.isArray(values) && values.every(v => allowed.includes(v)) &&
      new Set(values).size === values.length &&
      !(values.length > 1 && values.some(v => exclusive.includes(v)));
  }
  function categoryDetails(s, id) {
    if (id === 'OTHER') return s.other_issues_status === 'yes' ? ['OTHER'] : [];
    const c = catMap.get(id);
    if (!c) return [];
    const allowed = [...c.options, ...c.controls].map(o => o.id);
    const raw = s.issues?.[id]?.selected;
    if (!validMulti(raw, allowed, c.exclusive_ids)) return [];
    return chosen(raw, [...c.options.map(o => o.id), `${id}_other`, `${id}_unspecified`]);
  }
  function positiveCategories(s) {
    if (present(s.issue_control)) return [];
    return [...cats.filter(id => categoryDetails(s, id).length),
      ...(s.other_issues_status === 'yes' ? ['OTHER'] : [])];
  }
  function priorityCategories(s) {
    if (s.skip_detail === true) return [];
    const candidates = positiveCategories(s);
    if (candidates.length <= 2) return candidates;
    const selection = chosen(s.priority_categories, candidates);
    // Invalid over-selection is never silently truncated to the first two.
    return selection.length <= 2 ? candidates.filter(c => selection.includes(c)) : [];
  }
  function selectedNeeds(s, id) {
    const d = s.needs?.[id] || {};
    if (!validMulti(d.selected, spec.needs.map(n => n.id), spec.need_exclusive_ids)) return [];
    return chosen(d.selected, helpIds);
  }
  function priorityNeeds(s, id) {
    const d = s.needs?.[id] || {};
    if (d.skip === true) return [];
    const candidates = selectedNeeds(s, id);
    if (candidates.length <= 2) return helpIds.filter(n => candidates.includes(n));
    const selection = chosen(d.priority, candidates);
    return selection.length <= 2 ? helpIds.filter(n => selection.includes(n)) : [];
  }
  function activePairs(s) {
    return priorityCategories(s).flatMap(category => priorityNeeds(s, category)
      .map(need => ({category, need, key: pairKey(category, need)})));
  }
  function contacts(s, key) {
    const raw = entry(s, key).contacts;
    if (!validMulti(raw, spec.resources.map(r => r.id), spec.source_exclusive_ids)) return [];
    return chosen(raw, sourceIds);
  }
  function contactsComplete(s, key) {
    const raw = entry(s, key).contacts;
    if (!validMulti(raw, spec.resources.map(r => r.id), spec.source_exclusive_ids)) return false;
    return (raw.length === 1 && raw[0] === 'NO_CONTACT') || contacts(s, key).length > 0;
  }
  /** Q32/Q33 now have CATEGORY scope, not respondent-wide or need-level scope. */
  function resourceSets(s, category) {
    const pairs = activePairs(s).filter(p => p.category === category);
    const union = new Set(pairs.flatMap(p => contacts(s, p.key)));
    const complete = pairs.length > 0 && pairs.every(p => contactsComplete(s, p.key));
    return {
      used: formal.filter(r => union.has(r)),
      notUsed: complete ? fixed.filter(r => !union.has(r)) : [],
      nonUseKnown: complete,
      networks: union.has('N06')
    };
  }
  function ratingSources(s, key) {
    return activePairs(s).some(p => p.key === key)
      ? civilianAndPersonal.filter(r => contacts(s, key).includes(r)) : [];
  }
  function networkOwner(s) {
    return priorityCategories(s).find(id => resourceSets(s, id).networks) ?? null;
  }
  function visibleLocationFields(s) {
    const fields = ['residence_area'];
    if (localAreas.includes(s.residence_area)) {
      fields.push('suburb', 'time_local');
      if (s.suburb === 'other') fields.push('suburb_other');
    } else if (s.residence_area === 'outside') {
      fields.push('past_residence');
      if (s.past_residence === 'yes') fields.push('time_past');
    }
    return fields;
  }
  function route(s) {
    if (s.consent === 'under_18') return ['welcome', 'existing_youth_route'];
    if (s.consent === 'adult_decline') return ['welcome', 'exit'];
    if (s.consent !== 'adult_agree') return ['welcome'];
    if (s.current_connection === 'no') return ['welcome', 'about', 'out_of_scope'];
    return ['welcome', 'about', 'issues',
      ...priorityCategories(s).map(id => `area:${id}`), 'review', 'thanks'];
  }
  function selectedIssueOptions(s, id) {
    if (id === 'OTHER') return [{id: 'OTHER', label: s.other_issues || 'Another issue'}];
    const c = catMap.get(id);
    if (!c) return [];
    const active = categoryDetails(s, id);
    return [...c.options, ...c.controls].filter(o => active.includes(o.id)).map(o => ({
      id: o.id,
      label: o.id === `${id}_other` && s.issues?.[id]?.other_text
        ? `Another issue: ${s.issues[id].other_text}` : o.label
    }));
  }
  /** Render these blocks INSIDE one category page; keys are stable across Back/Edit. */
  function areaView(s, id) {
    if (!priorityCategories(s).includes(id)) return null;
    const pairs = activePairs(s).filter(p => p.category === id);
    const resources = resourceSets(s, id);
    return {
      pageId: `area:${id}`,
      categoryId: id,
      title: `Your experience: ${id === 'OTHER' ? 'Other issues' : catMap.get(id).title}`,
      issues: selectedIssueOptions(s, id),
      needChoices: spec.needs,
      needsPriorityVisible: selectedNeeds(s, id).length > 2 && s.needs?.[id]?.skip !== true,
      sourceBlocks: pairs.map(p => ({...p, focusChoiceVisible: selectedIssueOptions(s, id).length > 1})),
      usedSourceCards: resources.used,
      unusedSourceCards: resources.notUsed,
      showPersonalNetworks: networkOwner(s) === id,
      outcomeBlocks: pairs.map(p => ({...p, ratingSources: ratingSources(s, p.key),
        commentPath: `pairs.${p.key}.comments`, commentLimit: MAX_TEXT_CHARACTERS})),
      fallbackComment: pairs.length === 0,
      orderedSections: ['needs', 'sources', 'used', 'not_used', 'networks', 'outcomes', 'area_comment']
    };
  }
  function issueSignature(s, id) {
    if (id === 'OTHER') return serial([s.other_issues_status, s.other_issues || '']);
    const values = categoryDetails(s, id);
    return serial([sorted(values), values.includes(`${id}_other`) ? s.issues?.[id]?.other_text || '' : '']);
  }
  function pairSignature(s, p) {
    const e = entry(s, p.key);
    return serial([issueSignature(s, p.category), p.need,
      p.need === 'H09' ? s.needs?.[p.category]?.other_text || '' : '', sorted(e.focus_issues)]);
  }
  function featureSignature(s, category, group, source) {
    const sets = resourceSets(s, category);
    const ids = group === 'used' ? sets.used : sets.notUsed;
    if (!ids.includes(source)) return null;
    const pairs = activePairs(s).filter(p => p.category === category &&
      (group !== 'used' || contacts(s, p.key).includes(source)));
    return serial(pairs.map(p => [p.key, pairSignature(s, p),
      source === 'N07' ? entry(s, p.key).other_source || '' : '']));
  }
  /**
   * Return a cleaned active answer tree. This is NOT submission, persistence or telemetry.
   * UI open/collapsed flags are excluded. Unknown/refusal/blank are not recoded as No.
   */
  function activeAnswerSnapshot(s) {
    if (s.consent !== 'adult_agree' || s.current_connection === 'no') return {};
    const out = {schema_version: spec.schema_version, consent: s.consent};
    for (const f of aboutQuestions.filter(q => q.type === 'single')) {
      if (s[f.id] !== undefined) out[f.id] = s[f.id];
    }
    if (s.suburb !== undefined) out.suburb = s.suburb;
    if (s.suburb_other !== undefined) out.suburb_other = normaliseNewlines(s.suburb_other);
    const visible = visibleLocationFields(s);
    for (const k of ['suburb', 'suburb_other', 'past_residence', 'time_local', 'time_past']) {
      if (!visible.includes(k)) delete out[k];
    }
    if (s.has_dependants === 'yes') out.dependants = clone(s.dependants || {counts: {}});
    if (s.issue_control !== undefined) out.issue_control = s.issue_control;
    out.presented_categories = chosen(s.presented_categories, cats);
    out.issues = {};
    for (const id of cats) {
      const data = s.issues?.[id];
      if (!data) continue;
      const record = {selected: list(data.selected).slice()};
      if (record.selected.includes(`${id}_other`) && data.other_text !== undefined) {
        record.other_text = normaliseNewlines(data.other_text);
      }
      out.issues[id] = record;
    }
    if (s.other_issues_status !== undefined) out.other_issues_status = s.other_issues_status;
    if (s.other_issues_status === 'yes' && s.other_issues !== undefined) out.other_issues = normaliseNewlines(s.other_issues);
    out.skip_detail = s.skip_detail === true;
    out.priority_categories = priorityCategories(s);
    out.needs = {};
    out.pairs = {};
    out.source_characteristics = {};
    for (const id of priorityCategories(s)) {
      const d = s.needs?.[id] || {};
      out.needs[id] = {selected: list(d.selected).slice(), priority: priorityNeeds(s, id), skip: d.skip === true};
      if (list(d.selected).includes('H09') && d.other_text !== undefined) out.needs[id].other_text = normaliseNewlines(d.other_text);
      if (priorityNeeds(s, id).length === 0 && d.area_comment !== undefined) out.needs[id].area_comment = normaliseNewlines(d.area_comment);
      const sets = resourceSets(s, id);
      const stored = s.source_characteristics?.[id] || {};
      out.source_characteristics[id] = {};
      for (const [group, sources] of [['used', sets.used], ['not_used', sets.notUsed]]) {
        out.source_characteristics[id][group] = Object.fromEntries(sources
          .filter(r => stored[group]?.[r] !== undefined).map(r => [r, clone(stored[group][r])]));
      }
    }
    for (const p of activePairs(s)) {
      const d = entry(s, p.key), record = {};
      const issueIds = selectedIssueOptions(s, p.category).map(o => o.id);
      if (issueIds.length > 1 && d.focus_issues !== undefined) record.focus_issues = chosen(d.focus_issues, issueIds);
      if (d.contacts !== undefined) record.contacts = list(d.contacts).slice();
      if (contacts(s, p.key).includes('N07') && d.other_source !== undefined) record.other_source = normaliseNewlines(d.other_source);
      record.ratings = Object.fromEntries(ratingSources(s, p.key).filter(r => present(d.ratings?.[r]))
        .map(r => [r, d.ratings[r]]));
      for (const name of ['met_status', 'current_gap']) if (d[name] !== undefined) record[name] = d[name];
      if (d.comments !== undefined) record.comments = normaliseNewlines(d.comments);
      out.pairs[p.key] = record;
    }
    if (networkOwner(s) && s.personal_networks !== undefined) out.personal_networks = list(s.personal_networks).slice();
    if (s.comments !== undefined) out.comments = normaliseNewlines(s.comments);
    return out;
  }
  /**
   * Run when committing a changed screen/selection, not on each typed character.
   * Caller must obtain confirmation BEFORE adopting state when removedPaths is nonempty.
   * Keep screen drafts intact on Cancel. Reopening a list alone never calls this as a deletion.
   */
  function prepareUpdate(before, draft) {
    const next = clone(draft), removedPaths = [], reviewCategories = new Set();
    next.needs ||= {}; next.pairs ||= {}; next.source_characteristics ||= {};
    const remove = parts => {
      const value = readPath(next, parts);
      if (value !== undefined) {
        if (readPath(before, parts) !== undefined) removedPaths.push(pathText(parts));
        deletePath(next, parts);
      }
    };
    const beforeActive = new Set(activePairs(before).map(p => p.key));
    for (const id of [...cats, 'OTHER']) {
      const oldPositive = categoryDetails(before, id).length > 0;
      if (oldPositive && issueSignature(before, id) !== issueSignature(next, id)) {
        remove(['needs', id]);
        for (const key of Object.keys(next.pairs)) if (key.startsWith(`${id}::`)) remove(['pairs', key]);
        remove(['source_characteristics', id]);
        reviewCategories.add(id);
      }
    }
    next.priority_categories = chosen(next.priority_categories, positiveCategories(next));
    for (const [id, d] of Object.entries(next.needs)) {
      d.priority = chosen(d.priority, selectedNeeds(next, id));
      if (!list(d.selected).includes('H09')) remove(['needs', id, 'other_text']);
    }
    const activeCategories = priorityCategories(next);
    for (const id of Object.keys(next.needs)) if (!activeCategories.includes(id)) remove(['needs', id]);
    const pairs = activePairs(next), activeKeys = new Set(pairs.map(p => p.key));
    for (const key of Object.keys(next.pairs)) if (!activeKeys.has(key)) remove(['pairs', key]);
    for (const p of pairs) {
      const d = next.pairs[p.key]; if (!d) continue;
      const old = before.pairs?.[p.key];
      const hadPriorAnswer = old && Object.values(old).some(v => Array.isArray(v) ? v.length : v && typeof v === 'object' ? Object.keys(v).length : present(v));
      if (beforeActive.has(p.key) && hadPriorAnswer && pairSignature(before, p) !== pairSignature(next, p)) {
        // Keep the newly edited focus link; remove the old downstream context only.
        for (const key of ['contacts','other_source','ratings','met_status','current_gap','comments']) remove(['pairs', p.key, key]);
        reviewCategories.add(p.category);
      }
      const validRatings = ratingSources(next, p.key);
      for (const r of Object.keys(d.ratings || {})) if (!validRatings.includes(r)) remove(['pairs', p.key, 'ratings', r]);
      if (!contacts(next, p.key).includes('N07')) remove(['pairs', p.key, 'other_source']);
      if (old && old.other_source !== d.other_source && present(old.ratings?.N07)) remove(['pairs', p.key, 'ratings', 'N07']);
      if (old && !same(sorted(old.contacts), sorted(d.contacts))) {
        // A corrected source list does not automatically change the person's overall unmet need.
        // Keep overall answers and narrative; require the affected area to be revisited in review.
        reviewCategories.add(p.category);
      }
    }
    for (const id of Object.keys(next.source_characteristics)) {
      if (!activeCategories.includes(id)) { remove(['source_characteristics', id]); continue; }
      for (const group of ['used', 'not_used']) {
        for (const source of Object.keys(next.source_characteristics[id]?.[group] || {})) {
          const newSig = featureSignature(next, id, group, source);
          const oldSig = featureSignature(before, id, group, source);
          const oldAnswer = before.source_characteristics?.[id]?.[group]?.[source];
          if (newSig === null || (oldAnswer !== undefined && oldSig !== newSig)) {
            remove(['source_characteristics', id, group, source]); reviewCategories.add(id);
          }
        }
      }
    }
    if (!networkOwner(next)) remove(['personal_networks']);
    // Location fields are cleaned by visibility; valid first-entry same-screen answers survive.
    for (const k of ['suburb','suburb_other','past_residence','time_local','time_past']) {
      if (!visibleLocationFields(next).includes(k)) remove([k]);
    }
    if (present(next.suburb) && !['other','prefer'].includes(next.suburb)) {
      const locality = spec.geography.localities.find(l => l.id === next.suburb);
      if (!locality || locality.region !== next.residence_area) remove(['suburb']);
    }
    if (next.has_dependants !== 'yes') remove(['dependants']);
    if (next.other_issues_status !== 'yes') remove(['other_issues']);
    for (const c of spec.issue_bank) {
      if (!list(next.issues?.[c.id]?.selected).includes(`${c.id}_other`)) remove(['issues', c.id, 'other_text']);
    }
    return {state: next, removedPaths: [...new Set(removedPaths)],
      reviewCategories: activeCategories.filter(id => reviewCategories.has(id))};
  }
  function removeArea(s, id) {
    const draft = clone(s);
    if (id === 'OTHER') { delete draft.other_issues; delete draft.other_issues_status; }
    else if (draft.issues) delete draft.issues[id];
    const result = prepareUpdate(s, draft);
    const field = id === 'OTHER' ? 'other_issues' : `issues.${id}`;
    if ((id === 'OTHER' && s.other_issues_status === 'yes') || (id !== 'OTHER' && s.issues?.[id])) {
      result.removedPaths = [...new Set([field, ...result.removedPaths])];
    }
    return result;
  }
  function setOverallIssueControl(s, control) {
    const draft = clone(s); draft.issue_control = control;
    if (present(control)) {
      draft.issues = {}; delete draft.other_issues; delete draft.other_issues_status;
    }
    const result = prepareUpdate(s, draft);
    if (present(control)) {
      result.removedPaths = [...new Set([...Object.keys(s.issues || {}).map(id => `issues.${id}`),
        ...(s.other_issues_status === 'yes' ? ['other_issues'] : []), ...result.removedPaths])];
    }
    return result;
  }
  function validate(s) {
    const errors = [];
    const error = (path, message) => errors.push({path, message});
    const single = (v, allowed, path) => { if (present(v) && !allowed.includes(v)) error(path, 'Choose one of the listed answers.'); };
    const multi = (v, allowed, exclusive, path) => {
      if (v === undefined) return;
      if (!validMulti(v, allowed, exclusive)) error(path, 'Use valid choices; select a none, unknown or refusal option on its own.');
    };
    const text = (v, path) => {
      if (v === undefined) return;
      if (typeof v !== 'string') error(path, 'Use text for this answer.');
      else if (!textWithinLimit(v)) error(path, spec.ui.text_over_limit);
    };
    single(s.consent, ['adult_agree','adult_decline','under_18'], 'consent');
    if (s.skip_detail !== undefined && typeof s.skip_detail !== 'boolean') error('skip_detail','Use a checked or unchecked value.');
    for (const f of aboutQuestions.filter(q => q.type === 'single')) single(s[f.id], f.options.map(o => o.id), f.id);
    if (present(s.suburb)) {
      const l = spec.geography.localities.find(o => o.id === s.suburb);
      if (!visibleLocationFields(s).includes('suburb') || (!['other','prefer'].includes(s.suburb) && (!l || l.region !== s.residence_area))) {
        error('suburb', 'Choose a suburb or locality in the selected area.');
      }
    }
    text(s.suburb_other, 'suburb_other');
    if (s.dependants && s.has_dependants !== 'yes') error('dependants', 'Counts apply only when you have dependants.');
    for (const [band, row] of Object.entries(s.dependants?.counts || {})) {
      if (!depBands.includes(band)) error('dependants.counts', 'Unknown dependant age group.');
      for (const [column, value] of Object.entries(row)) {
        if (!['total','living_with'].includes(column)) error('dependants.counts', 'Unknown count column.');
        if (present(value) && (!Number.isSafeInteger(value) || value < 0)) error(`dependants.counts.${band}.${column}`, 'Enter a whole number of zero or more.');
      }
      if (Number.isInteger(row.total) && Number.isInteger(row.living_with) && row.living_with > row.total) {
        error(`dependants.counts.${band}.living_with`, 'The number living with you cannot exceed the total.');
      }
    }
    single(s.issue_control, ['none','unsure','prefer_not'], 'issue_control');
    single(s.other_issues_status, ['yes','no','unsure','prefer_not'], 'other_issues_status');
    text(s.other_issues, 'other_issues');
    for (const c of spec.issue_bank) {
      const d = s.issues?.[c.id] || {};
      multi(d.selected, [...c.options,...c.controls].map(o => o.id), c.exclusive_ids, `issues.${c.id}.selected`);
      text(d.other_text, `issues.${c.id}.other_text`);
    }
    const reports = cats.some(c => categoryDetails(s,c).length) || s.other_issues_status === 'yes';
    if (present(s.issue_control) && reports) error('issue_control', 'Choose the overall response or report issues, not both.');
    multi(s.priority_categories, positiveCategories(s), [], 'priority_categories');
    if (unique(s.priority_categories).length > 2) error('priority_categories', 'Choose up to two issue areas.');
    const active = new Set(activePairs(s).map(p => p.key));
    for (const [id, d] of Object.entries(s.needs || {})) {
      if (![...cats,'OTHER'].includes(id)) error(`needs.${id}`, 'Unknown issue area.');
      if (d.skip !== undefined && typeof d.skip !== 'boolean') error(`needs.${id}.skip`,'Use a checked or unchecked value.');
      multi(d.selected, spec.needs.map(n => n.id), spec.need_exclusive_ids, `needs.${id}.selected`);
      multi(d.priority, selectedNeeds(s,id), [], `needs.${id}.priority`);
      if (unique(d.priority).length > 2) error(`needs.${id}.priority`, 'Choose up to two kinds of help.');
      text(d.other_text, `needs.${id}.other_text`); text(d.area_comment, `needs.${id}.area_comment`);
    }
    for (const [key, d] of Object.entries(s.pairs || {})) {
      if (!active.has(key)) { error(`pairs.${key}`, 'This follow-up no longer belongs to an active need.'); continue; }
      const cat = key.split('::')[0];
      multi(d.focus_issues, selectedIssueOptions(s,cat).map(o=>o.id), [], `pairs.${key}.focus_issues`);
      multi(d.contacts, spec.resources.map(r=>r.id), spec.source_exclusive_ids, `pairs.${key}.contacts`);
      text(d.other_source, `pairs.${key}.other_source`); text(d.comments, `pairs.${key}.comments`);
      for (const [r, v] of Object.entries(d.ratings || {})) {
        if (!ratingSources(s,key).includes(r)) error(`pairs.${key}.ratings.${r}`, 'This source was not selected for this need, or is military-provided.');
        single(v, spec.rating_response_options.map(o=>o.id), `pairs.${key}.ratings.${r}`);
      }
      single(d.met_status, spec.overall_need_scale.map(o=>o.id), `pairs.${key}.met_status`);
      single(d.current_gap, ['yes','no','unsure','prefer_not'], `pairs.${key}.current_gap`);
    }
    for (const [cat, data] of Object.entries(s.source_characteristics || {})) {
      const sets=resourceSets(s,cat);
      for (const [group, sources] of [['used',sets.used],['not_used',sets.notUsed]]) {
        for (const [r, values] of Object.entries(data[group]||{})) {
          if (!sources.includes(r)) error(`source_characteristics.${cat}.${group}.${r}`, 'This source is not eligible in this section.');
          multi(values, featureIds, featureControls, `source_characteristics.${cat}.${group}.${r}`);
        }
      }
    }
    multi(s.personal_networks, spec.personal_networks.map(o=>o.id), ['none','prefer_not'], 'personal_networks');
    if (list(s.personal_networks).length && !networkOwner(s)) error('personal_networks','No active need uses friends or family.');
    text(s.comments,'comments');
    return errors;
  }
  function validateBeforeContinue(s, screen) {
    const e = validate(s);
    if (['issues','review'].includes(screen) && positiveCategories(s).length > 2 && !s.skip_detail && !priorityCategories(s).length) {
      e.push({path:'priority_categories', message:'Choose one or two areas, or choose not to answer the detailed questions.'});
    }
    for (const id of (screen === 'review' ? priorityCategories(s) : screen.startsWith('area:') ? [screen.slice(5)] : [])) {
      if(selectedNeeds(s,id).length>2 && !s.needs?.[id]?.skip && !priorityNeeds(s,id).length) {
        e.push({path:`needs.${id}.priority`,message:'Choose one or two kinds of help, or choose not to answer follow-up questions.'});
      }
    }
    return e;
  }
  function dependantTotals(s) {
    if(s.has_dependants==='no')return {total:0,living_with:0,complete:true};
    if(s.has_dependants!=='yes')return {total:null,living_with:null,complete:false};
    const columnSum = column => depBands.every(id=>Number.isSafeInteger(s.dependants?.counts?.[id]?.[column]))
      ? depBands.reduce((sum,id)=>sum+s.dependants.counts[id][column],0):null;
    const total=columnSum('total'),living_with=columnSum('living_with');
    return {total,living_with,complete:total!==null&&living_with!==null};
  }
  /** Analysis-ready tables for a FUTURE authorised data workflow. Not wired to a receiver. */
  function toAnalysisTables(input, respondentId) {
    if(typeof respondentId!=='string'||!respondentId)throw new TypeError('Supply a non-identifying analysis ID.');
    const s=activeAnswerSnapshot(input);
    const errors=validate(s);
    if(errors.length)throw new Error(`Invalid answers: ${errors.map(e=>e.path).join(', ')}`);
    const tables={respondents:[],dependants:[],categories:[],issues:[],need_areas:[],needs:[],sources:[],characteristics:[],networks:[],comments:[]};
    if(s.consent!=='adult_agree')return tables;
    const respondent_id=respondentId, schema_version=spec.schema_version;
    tables.respondents.push({respondent_id,schema_version,role:s.role??null,age_group:s.age_group??null,
      current_connection:s.current_connection??null,residence_area:s.residence_area??null,suburb:s.suburb??null,
      time_local:s.time_local??null,time_past:s.time_past??null,past_residence:s.past_residence??null,has_dependants:s.has_dependants??null,
      dependant_total:dependantTotals(s).total,overall_issue_response:s.issue_control??null});
    if (s.has_dependants === 'yes') for (const age_group of depBands) tables.dependants.push({respondent_id,age_group,
      total:s.dependants?.counts?.[age_group]?.total??null,living_with:s.dependants?.counts?.[age_group]?.living_with??null});
    for(const c of spec.issue_bank){
      const choices=list(s.issues?.[c.id]?.selected),positive=categoryDetails(s,c.id).length>0;
      const status=positive?'reported':choices.find(v=>c.exclusive_ids.includes(v))?.replace(c.id+'_','')||
        (list(s.presented_categories).includes(c.id)?'shown_unanswered':'not_shown');
      tables.categories.push({respondent_id,category_id:c.id,status,priority:priorityCategories(s).includes(c.id)});
      for(const issue of c.options)tables.issues.push({respondent_id,category_id:c.id,issue_id:issue.id,
        selected:choices.length&&!choices.some(v=>[c.id+'_prefer_not',c.id+'_unsure',c.id+'_unspecified'].includes(v))?choices.includes(issue.id):null});
    }
    if(s.other_issues_status==='yes')tables.categories.push({respondent_id,category_id:'OTHER',status:'reported',priority:priorityCategories(s).includes('OTHER')});
    for(const cat of priorityCategories(s)){
      const selected=selectedNeeds(s,cat);
      tables.need_areas.push({respondent_id,category_id:cat,selected:list(s.needs[cat]?.selected),
        response_status:selected.length?'needs_reported':list(s.needs[cat]?.selected).includes('H10')?'no_help_needed':
          list(s.needs[cat]?.selected).includes('prefer_not')?'refused':'unanswered',skip_followup:s.needs[cat]?.skip===true});
      for(const id of selected){const key=pairKey(cat,id),d=s.pairs[key]||{},tracked=priorityNeeds(s,cat).includes(id);
        const focus=list(d.focus_issues);
        tables.needs.push({respondent_id,category_id:cat,need_id:id,tracked,
          focus_issue_ids:focus.length?focus:null,focus_scope:focus.length?'explicit_issue_link':'category_only',
          contact_status:!tracked?'not_followed':d.contacts?.includes('NO_CONTACT')?'none':d.contacts?.includes('unsure')?'unknown':d.contacts?.includes('prefer_not')?'refused':contacts(s,key).length?'sources_selected':'unanswered',
          met_status:tracked?d.met_status??null:null,current_gap:tracked?d.current_gap??null:null});
        if(tracked){
          for(const source of contacts(s,key))tables.sources.push({respondent_id,category_id:cat,need_id:id,source_id:source,
            selected:true,helpfulness_response:source==='M_ALL'?null:d.ratings?.[source]??null,
            measurement_scope:source==='M_ALL'?'source_flag_only':'external_or_personal'});
          if(d.comments)tables.comments.push({respondent_id,scope:'need',category_id:cat,need_id:id,text:d.comments});
          if(d.other_source)tables.comments.push({respondent_id,scope:'other_source',category_id:cat,need_id:id,text:d.other_source});
        }
      }
      if(s.needs[cat]?.other_text)tables.comments.push({respondent_id,scope:'other_need',category_id:cat,need_id:'H09',text:s.needs[cat].other_text});
      if(s.needs[cat]?.area_comment)tables.comments.push({respondent_id,scope:'category',category_id:cat,need_id:null,text:s.needs[cat].area_comment});
      const featureSets = resourceSets(s,cat);
      for(const [group, sources] of [['used',featureSets.used],['not_used',featureSets.notUsed]]) for(const source of sources) {
        const choices=s.source_characteristics?.[cat]?.[group]?.[source];
        tables.characteristics.push({respondent_id,category_id:cat,source_id:source,group,
          response_status:choices?.length?'answered':'unanswered',choices:choices?.length?choices:null});
      }
    }
    for(const choice of list(s.personal_networks))tables.networks.push({respondent_id,choice});
    for(const c of spec.issue_bank)if(s.issues?.[c.id]?.other_text)tables.comments.push({respondent_id,scope:'other_issue',category_id:c.id,need_id:null,text:s.issues[c.id].other_text});
    if(s.other_issues)tables.comments.push({respondent_id,scope:'other_issue',category_id:'OTHER',need_id:null,text:s.other_issues});
    if(s.comments)tables.comments.push({respondent_id,scope:'general',category_id:null,need_id:null,text:s.comments});
    return tables;
  }
  return {positiveCategories,priorityCategories,selectedNeeds,priorityNeeds,activePairs,contacts,contactsComplete,
    resourceSets,ratingSources,networkOwner,visibleLocationFields,route,selectedIssueOptions,areaView,
    activeAnswerSnapshot,prepareUpdate,removeArea,setOverallIssueControl,validate,validateBeforeContinue,
    dependantTotals,toAnalysisTables};
}
