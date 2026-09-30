export const DRAFT_STORAGE_KEY = 'lc.defence-family-survey.draft.v1';
export const DRAFT_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const FORMAT_VERSION = 1;
const UNFINISHED_PAGES = new Set(['welcome', 'about', 'experience']);
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const isTimestamp = value => Number.isSafeInteger(value) && value >= 0;
const canResume = (answers, pageId) => isRecord(answers)
  && answers.consent === 'adult_agree'
  && UNFINISHED_PAGES.has(pageId);

/**
 * A local-only draft store. Pass browser localStorage from the app after its
 * own availability check; this module never reads another storage key or
 * sends answers elsewhere. Answers need not pass final submission validation.
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
    // a bad draft appear resumable or prevent the current questionnaire.
    remove();
    return {status};
  };

  return {
    save({answers, pageId} = {}) {
      if (!canResume(answers, pageId)) {
        remove();
        return {status: 'unavailable', reason: 'not-resumable'};
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
      if (payload.version !== FORMAT_VERSION || payload.schemaVersion !== schemaVersion) {
        return rejectStored('incompatible');
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
      return {
        status: 'available',
        draft: {
          answers: payload.answers,
          pageId: payload.pageId,
          updatedAt: payload.updatedAt,
          expiresAt: payload.expiresAt,
        },
      };
    },

    clear: remove,
  };
}
