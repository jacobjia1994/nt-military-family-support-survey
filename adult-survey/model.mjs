/** Adult narrative questionnaire. Answers stay in memory; no classification or transport. */
export const MAX_TEXT_CHARACTERS = 100_000;
export const PAGE_ORDER = Object.freeze(['welcome', 'about', 'experience', 'thanks']);
export const normaliseNewlines = value => String(value ?? '').replace(/\r\n?/g, '\n');
// Match native textarea maxlength. English characters occupy one UTF-16 unit.
export const characterCount = value => normaliseNewlines(value).length;
const present = value => value !== undefined && value !== null && value !== '';

export function createAdultSurveyModel(spec) {
  const about = spec.pages.find(page => page.id === 'about');
  const experience = spec.pages.find(page => page.id === 'experience');
  const localAreas = ['darwin', 'palmerston', 'litchfield', 'greater_darwin_other'];

  function visibleLocationFields(answers) {
    const fields = ['residence_area'];
    if (localAreas.includes(answers.residence_area)) {
      fields.push('suburb', 'time_local');
      if (answers.suburb === 'other') fields.push('suburb_other');
    } else if (answers.residence_area === 'outside') {
      fields.push('past_residence');
      if (answers.past_residence === 'yes') fields.push('time_past');
    }
    return fields;
  }

  function reconcile(answers) {
    const next = structuredClone(answers);
    const visible = visibleLocationFields(next);
    for (const key of ['suburb', 'suburb_other', 'past_residence', 'time_local', 'time_past']) {
      if (!visible.includes(key)) delete next[key];
    }
    if (present(next.suburb) && !spec.geography.extra_locality_options.some(item => item.id === next.suburb)) {
      const locality = spec.geography.localities.find(item => item.id === next.suburb);
      if (!locality || locality.region !== next.residence_area) {
        delete next.suburb;
        delete next.suburb_other;
      }
    }
    if (next.has_dependants !== 'yes') delete next.dependants;
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
        if (question.show_when && question.type !== 'dependants_grid' && !visible.includes(question.id)) continue;
        if (question.type === 'single' && present(value) && !question.options.some(item => item.id === value)) {
          error(question.id, 'Choose one of the listed answers.');
        }
        if (question.type === 'text' && present(value)) {
          if (typeof value !== 'string') error(question.id, 'Use text for this answer.');
          else if (characterCount(value) > question.max_length) error(question.id, `Please use ${question.max_length.toLocaleString('en-AU')} characters or fewer.`);
        }
      }
      if (visible.includes('suburb') && present(answers.suburb)) {
        const allowed = [...spec.geography.localities.filter(item => item.region === answers.residence_area), ...spec.geography.extra_locality_options];
        if (!allowed.some(item => item.id === answers.suburb)) error('suburb', 'Choose a suburb or locality in the selected area.');
      }
      if (answers.has_dependants === 'yes') {
        const grid = about.questions.find(question => question.id === 'dependants');
        for (const row of grid.rows) {
          const counts = answers.dependants?.counts?.[row.id] || {};
          for (const column of grid.columns) {
            const value = counts[column.id];
            if (present(value) && (!Number.isSafeInteger(value) || value < 0)) {
              error(`dependants.counts.${row.id}.${column.id}`, 'Enter a whole number of zero or more.');
            }
          }
          if (Number.isSafeInteger(counts.total) && Number.isSafeInteger(counts.living_with) && counts.living_with > counts.total) {
            error(`dependants.counts.${row.id}.living_with`, 'The number living with you cannot exceed the total.');
          }
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
