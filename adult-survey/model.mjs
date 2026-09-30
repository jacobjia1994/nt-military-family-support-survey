/** Adult narrative questionnaire. Answers stay in memory; no classification or transport. */
export const MAX_TEXT_CHARACTERS = 10_000;
export const PAGE_ORDER = Object.freeze(['welcome', 'about', 'experience', 'thanks']);
export const normaliseNewlines = value => String(value ?? '').replace(/\r\n?/g, '\n');
// Match native textarea maxlength. English characters occupy one UTF-16 unit.
export const characterCount = value => normaliseNewlines(value).length;
const present = value => value !== undefined && value !== null && value !== '';
const readPath = (object, path) => path.split('.').reduce((value, part) => value?.[part], object);

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
    return next;
  }

  function validate(answers, pageId) {
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
        if (question.type === 'single' && present(value) && !question.options.some(item => item.id === value)) {
          error(question.id, 'Choose one of the listed answers.');
        }
        if (question.type === 'text' && present(value)) {
          if (typeof value !== 'string') error(question.id, 'Use text for this answer.');
          else if (characterCount(value) > question.max_length) error(question.id, `Please use ${question.max_length.toLocaleString('en-AU')} characters or fewer.`);
        }
        if (question.type === 'integer_group') {
          for (const field of question.fields) {
            const number = readPath(answers, field.path);
            if (!present(number)) continue;
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
      if (answers.has_dependants === 'yes') {
        const total = answers.dependants?.total;
        const livingWith = answers.dependants?.living_with;
        if (Number.isSafeInteger(total) && Number.isSafeInteger(livingWith) && livingWith > total) {
          error('dependants.living_with', 'The number living with you cannot exceed the total.');
        }
      }
    }
    if (pageId === 'experience') {
      if (answers.consent !== 'adult_agree') error('consent', 'Please agree to take part before finishing.');
      if (answers.current_connection === 'no') error('current_connection', spec.system_screens.out_of_scope.text);
      for (const question of experience.questions) {
        const value = answers.responses?.[question.id];
        if (value === undefined) continue;
        if (typeof value !== 'string') error(`responses.${question.id}`, 'Use text for this answer.');
        else if (characterCount(value) > question.max_length) {
          error(`responses.${question.id}`, `Please shorten your answer to ${question.max_length.toLocaleString('en-AU')} characters or fewer. Your text has not been changed.`);
        }
      }
    }
    return errors;
  }

  return {visibleLocationFields, reconcile, validate};
}
