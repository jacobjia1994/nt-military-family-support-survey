export const DRAFT_STORAGE_KEY = 'lc.defence-family-survey.draft.v1';
export const DRAFT_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const FORMAT_VERSION = 1;
const LEGACY_SCHEMA_VERSION = 'adult_open_answers_v3';
const EXPERIENCE_SCHEMA_VERSION = 'adult_open_experiences_v4';
const UNFINISHED_PAGES = new Set(['welcome', 'about', 'experience']);
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const isTimestamp = value => Number.isSafeInteger(value) && value >= 0;
const canResume = (answers, pageId) => isRecord(answers)
  && answers.consent === 'adult_agree'
  && UNFINISHED_PAGES.has(pageId);

function hasExperiences(answers) {
  if (!Array.isArray(answers.experiences) || answers.experiences.length === 0) return false;
  const ids = new Set();
  for (const experience of answers.experiences) {
    if (!isRecord(experience) || typeof experience.id !== 'string' || !experience.id
        || ids.has(experience.id) || !isRecord(experience.responses)) return false;
    ids.add(experience.id);
  }
  return true;
}

// A deleted or missing active ID falls back to the first remaining experience;
// IDs in the answers are never regenerated or reordered by the draft store.
const activeExperienceId = (answers, requestedId) => answers.experiences.some(item => item.id === requestedId)
  ? requestedId : answers.experiences[0].id;

function migrateLegacyAnswers(answers) {
  const {responses = {}, ...background} = answers;
  return {
    ...background,
    experiences: [{
      id: 'migrated-experience-1',
      responses: {
        situation: responses.difficulties ?? '',
        actions: responses.help_sources ?? '',
        access: responses.support_access ?? '',
        outcome: responses.support_fit ?? '',
        support: responses.missing_help ?? '',
      },
    }],
    final_comment: Object.hasOwn(responses, 'anything_else') ? responses.anything_else : '',
    // Keep every old answer, including answers without a one-to-one new question.
    previous_responses: {...responses},
  };
}

// The sixth field is additive within v4. Only move a known string into an
// absent field: an existing additional answer, even blank, always takes priority.
function moveFinalComment(answers) {
  const first = answers.experiences[0];
  if (!Object.hasOwn(answers, 'final_comment') || typeof answers.final_comment !== 'string'
      || Object.hasOwn(first.responses, 'additional')) return answers;
  const {final_comment, ...remaining} = answers;
  return {
    ...remaining,
    experiences: [
      {...first, responses: {...first.responses, additional: final_comment}},
      ...answers.experiences.slice(1),
    ],
    ...(final_comment.length > 0 ? {final_comment_moved_to: first.id} : {}),
  };
}

/**
 * A local-only draft store. Pass browser localStorage from the app after its
 * own availability check; this module never reads another storage key or
 * sends answers elsewhere. Answers need not pass final submission validation.
 * Migration is read-only until the app explicitly resumes and saves the draft.
 */
export function createDraftStore({storage, schemaVersion, now = Date.now} = {}) {
  const remove = () => {
    try {
      storage.removeItem(DRAFT_STORAGE_KEY);
      return {status: 'cleared'};
    } catch {
      return {status: 'unavailable'};
    }
  };

  const rejectStored = status => {
    // Removal is best-effort: a broken storage implementation must not make
    // a corrupt or expired draft appear resumable or prevent the questionnaire.
    remove();
    return {status};
  };

  return {
    save({answers, pageId, experienceId} = {}) {
      if (!canResume(answers, pageId)) {
        remove();
        return {status: 'unavailable', reason: 'not-resumable'};
      }
      if (schemaVersion === EXPERIENCE_SCHEMA_VERSION && !hasExperiences(answers)) {
        return {status: 'unavailable', reason: 'invalid'};
      }
      try {
        const updatedAt = now();
        const expiresAt = updatedAt + DRAFT_TTL_MS;
        if (typeof schemaVersion !== 'string' || !schemaVersion
            || !isTimestamp(updatedAt) || !isTimestamp(expiresAt)) {
          return {status: 'unavailable', reason: 'invalid'};
        }
        const payload = JSON.stringify({
          version: FORMAT_VERSION,
          schemaVersion,
          answers,
          pageId,
          ...(schemaVersion === EXPERIENCE_SCHEMA_VERSION
            ? {experienceId: activeExperienceId(answers, experienceId)} : {}),
          updatedAt,
          expiresAt,
        });
        storage.setItem(DRAFT_STORAGE_KEY, payload);
        return {status: 'saved', updatedAt, expiresAt};
      } catch {
        return {status: 'unavailable'};
      }
    },

    load() {
      let raw;
      try {
        raw = storage.getItem(DRAFT_STORAGE_KEY);
      } catch {
        return {status: 'unavailable'};
      }
      if (raw === null) return {status: 'empty'};
      let payload;
      try {
        if (typeof raw !== 'string') return rejectStored('invalid');
        payload = JSON.parse(raw);
      } catch {
        return rejectStored('invalid');
      }
      if (!isRecord(payload)
          || !Number.isSafeInteger(payload.version)
          || typeof payload.schemaVersion !== 'string' || !payload.schemaVersion) {
        return rejectStored('invalid');
      }
      const migrate = schemaVersion === EXPERIENCE_SCHEMA_VERSION
        && payload.schemaVersion === LEGACY_SCHEMA_VERSION;
      if (payload.version !== FORMAT_VERSION || (!migrate && payload.schemaVersion !== schemaVersion)) {
        // Preserve unfamiliar data for explicit backup/clear choices in the UI.
        return {status: 'incompatible', raw};
      }
      if (!canResume(payload.answers, payload.pageId)
          || !isTimestamp(payload.updatedAt) || !isTimestamp(payload.expiresAt)
          || payload.expiresAt !== payload.updatedAt + DRAFT_TTL_MS) {
        return rejectStored('invalid');
      }
      let currentTime;
      try {
        currentTime = now();
      } catch {
        return {status: 'unavailable'};
      }
      if (!isTimestamp(currentTime)) return {status: 'unavailable'};
      if (currentTime >= payload.expiresAt) return rejectStored('expired');
      if (migrate && payload.answers.responses !== undefined && !isRecord(payload.answers.responses)) {
        return {status: 'incompatible', raw};
      }
      let answers = migrate ? migrateLegacyAnswers(payload.answers) : payload.answers;
      if (schemaVersion === EXPERIENCE_SCHEMA_VERSION && !hasExperiences(answers)) {
        return rejectStored('invalid');
      }
      if (schemaVersion === EXPERIENCE_SCHEMA_VERSION) answers = moveFinalComment(answers);
      return {
        status: 'available',
        ...(migrate ? {migratedFrom: LEGACY_SCHEMA_VERSION} : {}),
        draft: {
          answers,
          pageId: payload.pageId,
          ...(schemaVersion === EXPERIENCE_SCHEMA_VERSION
            ? {experienceId: activeExperienceId(answers, payload.experienceId)} : {}),
          ...(migrate ? {migratedFrom: LEGACY_SCHEMA_VERSION} : {}),
          updatedAt: payload.updatedAt,
          expiresAt: payload.expiresAt,
        },
      };
    },

    clear: remove,
  };
}
