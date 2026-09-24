# Adult questionnaire reading copy

The reading view is generated from the actual definitions in `survey.js` via `node scripts/export-copy.mjs`. It includes NT, outside-NT and undisclosed-residence wording. Participant presentation remains formal for internal team review; backend/operating information belongs in the separate staff guide.

Current revision: concise copy, optional generic caring/dependency items removed, multiple current needs with one collective follow-up set, one Continue action. `answers.priority` is an array under export schema2. Retrospective adequacy remains per domain. The resource module is configured in `thank-you-resource.js`.

Sources for Australian wording and selection instructions: [AIFS2022ADF Families Survey](https://aifs.gov.au/projects/defence-veteran-family-research/2022-adf-families-survey), [DFA actual priority-question example](https://dfa.org.au/adf-family-survey/), and [ABS Forms Design Standards](https://www.abs.gov.au/statistics/standards/abs-forms-design-standards/2023/general-forms-design-principles-question-structure). Formal privacy text adapts [LCpublicformsandpolicy](lc-public-practice.md) to this consultation’s intended no-linking data design.
