/** Adult narrative questionnaire. Pure validation; no classification or transport. */
export const MAX_TEXT_CHARACTERS = 5_000;
export const PAGE_ORDER = Object.freeze(['welcome', 'about', 'experience', 'thanks']);
export const normaliseNewlines = value => String(value ?? '').replace(/\r\n?/g, '\n');
// Match native textarea maxlength. English characters occupy one UTF-16 unit.
export const characterCount = value => normaliseNewlines(value).length;

const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const usableExperienceId = value => typeof value === 'string' && /^[A-Za-z0-9_-]+$/.test(value) && !['__proto__', 'constructor', 'prototype'].includes(value);
const defaultExperienceId = () => globalThis.crypto?.randomUUID?.() || `experience-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

function uniqueExperienceId(idFactory, used) {
  const candidate = idFactory();
  const base = usableExperienceId(candidate) ? candidate : defaultExperienceId();
  let id = base;
  for (let suffix = 2; used.has(id); suffix += 1) id = `${base}-${suffix}`;
  return id;
}

/** A blank experience has its own stable identity and independent answer object. */
export function createExperience(idFactory = defaultExperienceId) {
  return {id: uniqueExperienceId(idFactory, new Set()), responses: {}};
}

/** Clone answers, retaining every experience and ensuring one uniquely identified page. */
export function ensureExperiences(answers = {}, idFactory = defaultExperienceId) {
  if (!isRecord(answers)) throw new TypeError('Survey answers must be an object.');
  const next = structuredClone(answers);
  if (next.experiences !== undefined && !Array.isArray(next.experiences)) {
    throw new TypeError('Experiences must be an array.');
  }
  const existing = next.experiences || [];
  const used = new Set(existing.filter(isRecord).map(entry => entry.id).filter(usableExperienceId));
  const seen = new Set();
  next.experiences = existing.map(entry => {
    if (!isRecord(entry)) throw new TypeError('Each experience must be an object.');
    if (!usableExperienceId(entry.id) || seen.has(entry.id)) entry.id = uniqueExperienceId(idFactory, used);
    used.add(entry.id);
    seen.add(entry.id);
    if (entry.responses === undefined) entry.responses = {};
    return entry;
  });
  if (!next.experiences.length) next.experiences.push(createExperience(idFactory));
  return next;
}

export function appendExperience(answers, idFactory = defaultExperienceId) {
  const next = ensureExperiences(answers, idFactory);
  const used = new Set(next.experiences.map(entry => entry.id));
  next.experiences.push({id: uniqueExperienceId(idFactory, used), responses: {}});
  return next;
}

/** A missing ID or the last remaining experience is left in place. */
export function removeExperience(answers, experienceId) {
  const next = ensureExperiences(answers);
  if (next.experiences.length > 1) next.experiences = next.experiences.filter(entry => entry.id !== experienceId);
  return next;
}
const present = value => value !== undefined && value !== null && value !== '';
const hasText = value => typeof value === 'string' && value.trim().length > 0;
const readPath = (object, path) => path.split('.').reduce((value, part) => value?.[part], object);
const deletePath = (object, path) => {
  const parts = path.split('.');
  const key = parts.pop();
  const parent = parts.reduce((value, part) => value?.[part], object);
  if (parent && typeof parent === 'object') delete parent[key];
};

export function createAdultSurveyModel(spec) {
  const about = spec.pages.find(page => page.id === 'about');
  const experience = spec.pages.find(page => page.id === 'experience');
  const localAreas = ['darwin', 'palmerston', 'litchfield', 'greater_darwin_other'];

  function visibleLocationFields(answers) {
    const fields = ['residence_area'];
    if (localAreas.includes(answers.residence_area)) {
      fields.push('suburb');
      if (answers.suburb === 'other') fields.push('suburb_other');
    }
    return fields;
  }

  function reconcile(answers, previousAnswers) {
    const next = structuredClone(answers);
    if (previousAnswers && previousAnswers.residence_area !== next.residence_area) {
      delete next.suburb;
      delete next.suburb_other;
    }
    const visible = visibleLocationFields(next);
    for (const key of ['suburb', 'suburb_other']) {
      if (!visible.includes(key)) delete next[key];
    }
    for (const key of ['past_residence', 'time_local', 'time_past']) delete next[key];
    if (present(next.suburb) && !spec.geography.extra_locality_options.some(item => item.id === next.suburb)) {
      const locality = spec.geography.localities.find(item => item.id === next.suburb);
      if (!locality || locality.region !== next.residence_area) {
        delete next.suburb;
        delete next.suburb_other;
      }
    }
    if (next.has_dependants !== 'yes') delete next.dependants;
    else if (next.dependants && typeof next.dependants === 'object') delete next.dependants.counts;
    for (const question of about.questions) {
      if (question.type === 'integer_group' && question.refusal_path && readPath(next, question.refusal_path) === true) {
        for (const field of question.fields) deletePath(next, field.path);
      }
    }
    return next;
  }

  function validate(answers, pageId, activeExperienceId) {
    const errors = [];
    const error = (path, message) => errors.push({path, message});
    if (pageId === 'welcome' && answers.consent !== 'adult_agree') {
      error('consent', 'Please confirm that you are aged 18 or older and agree to take part.');
    }
    if (pageId === 'about' || pageId === 'experience') {
      const visible = visibleLocationFields(answers);
      for (const question of about.questions) {
        const value = answers[question.id];
        if (question.id === 'dependants_count' && answers.has_dependants !== 'yes') continue;
        if (question.show_when && question.type !== 'integer_group' && !visible.includes(question.id)) continue;
        if (question.type === 'single' || question.type === 'locality_select') {
          if (question.required && !present(value)) error(question.id, 'Please choose an answer.');
        }
        if (question.type === 'single' && present(value) && !question.options.some(item => item.id === value)) {
          error(question.id, 'Choose one of the listed answers.');
        }
        if (question.type === 'text') {
          if (question.required && !hasText(value) && (!present(value) || typeof value === 'string')) {
            error(question.id, 'Please enter an answer.');
          } else if (present(value)) {
            if (typeof value !== 'string') error(question.id, 'Use text for this answer.');
            else if (characterCount(value) > question.max_length) error(question.id, `Please use ${question.max_length.toLocaleString('en-AU')} characters or fewer.`);
          }
        }
        if (question.type === 'integer_group') {
          if (question.refusal_path && readPath(answers, question.refusal_path) === true) continue;
          for (const field of question.fields) {
            const number = readPath(answers, field.path);
            if (!present(number)) {
              if (field.required) error(field.path, 'Please enter a number.');
              continue;
            }
            if (!Number.isSafeInteger(number) || number < field.min || number > field.max) {
              const message = field.max === Number.MAX_SAFE_INTEGER
                ? 'Enter a whole number of zero or more.'
                : `Enter a whole number from ${field.min} to ${field.max}.`;
              error(field.path, message);
            }
          }
        }
      }
      if (visible.includes('suburb') && present(answers.suburb)) {
        const allowed = [...spec.geography.localities.filter(item => item.region === answers.residence_area), ...spec.geography.extra_locality_options];
        if (!allowed.some(item => item.id === answers.suburb)) error('suburb', 'Choose a suburb or locality in the selected area.');
      }
      if (answers.has_dependants === 'yes' && answers.dependants?.prefer_not !== true) {
        const total = answers.dependants?.total;
        const livingWith = answers.dependants?.living_with;
        if (Number.isSafeInteger(total) && total >= 0 && Number.isSafeInteger(livingWith) && livingWith >= 0 && livingWith > total) {
          error('dependants.living_with', 'The number living with you cannot exceed the total.');
        }
      }
    }
    if (pageId === 'experience') {
      if (answers.consent !== 'adult_agree') error('consent', 'Please agree to take part before finishing.');
      if (answers.current_connection === 'no') error('current_connection', spec.system_screens.out_of_scope.text);
      function validateNarrative(value, path, question) {
        if (value === undefined) return;
        if (typeof value !== 'string') error(path, 'Use text for this answer.');
        else if (characterCount(value) > question.max_length) {
          error(path, `Please shorten your answer to ${question.max_length.toLocaleString('en-AU')} characters or fewer. Your text has not been changed.`);
        }
      }
      const entries = answers.experiences;
      if (!Array.isArray(entries) || entries.length === 0) error('experiences', 'Please check your experiences before finishing.');
      else {
        const used = new Set();
        for (const [index, entry] of entries.entries()) {
          if (!isRecord(entry) || !usableExperienceId(entry.id) || used.has(entry.id)) {
            error(`experiences.${index}`, 'Please check this experience before finishing.');
            continue;
          }
          used.add(entry.id);
          if (activeExperienceId !== undefined && entry.id !== activeExperienceId) continue;
          if (entry.responses !== undefined && !isRecord(entry.responses)) {
            error(`experiences.${entry.id}.responses`, 'Use text for these answers.');
            continue;
          }
          for (const question of experience.questions) {
            validateNarrative(entry.responses?.[question.id], `experiences.${entry.id}.responses.${question.id}`, question);
          }
        }
        if (activeExperienceId !== undefined && !entries.some(entry => entry?.id === activeExperienceId)) {
          error('experiences', 'Please choose an existing experience.');
        }
      }
      validateNarrative(answers.final_comment, 'final_comment', experience.final_question || {max_length: MAX_TEXT_CHARACTERS});
    }
    return errors;
  }

  return {visibleLocationFields, reconcile, validate, createExperience, ensureExperiences, appendExperience, removeExperience};
}
