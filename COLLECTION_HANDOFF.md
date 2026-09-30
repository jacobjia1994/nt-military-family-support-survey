# Collection and technical handoff

The current GitHub Pages release is a static adult experience survey. Four phases include an introduction and final review inside Experiences. Respondents choose the number of experiences; each has five core questions and one optional additional question, all optional text. Background required/refusal rules remain.

The front end has no answer receiver or analytics. Answers are kept only in memory while the page runs, including Back/Next and review editing. Refreshing/closing does not restore answers. The app does not access or delete historical browser storage. There is no autosave, migration, resume UI or 30-day retention promise.

## Current data model

Answer schema adult_open_in_memory_v5: shared background, including the community_connection array and conditional community_connection_other text, and experiences: [{id, responses: {situation, actions, access, outcome, support, additional}}]. Stable IDs preserve answer association through navigation and deletion; there is no experience count cap.

Finish survey displays the complete background and all experience answers for review. A required identifying-information checkbox precedes Confirm and submit. Completion clears in-memory answers and shows neutral thanks without transmitting a response or claiming receipt. Request an interview and Find support in the NT link to the unchanged independent resources.

## Before separately authorised collection

Lutheran Care must confirm the questionnaire, receiving platform and project-specific handling, access, retention and reporting arrangements. A receiver must durably accept a synthetic end-to-end response and expose failures before the front end can claim receipt. No credentials or real responses belong in GitHub Pages or this repository.

The earlier RAND data dictionary and detailed-choice variants are historical source material, not the active survey.
