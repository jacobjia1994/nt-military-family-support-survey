# Collection and technical handoff

The current GitHub Pages release is a static adult experience survey. It has four stages and as many respondent-created experience pages as the respondent chooses. Each experience has six optional text answers, including an additional comment. Background questions retain their required/refusal rules. Completion offers the identifying-information check.

The front end has no answer receiver or analytics. It saves only unfinished local drafts after adult agreement, on the same device/browser for 30 days since the last successful save. Completion clears that local draft and shows neutral thanks; it does not transmit a completed answer or claim receipt. The separate interview request and NT support finder carry no survey-answer parameters.

## Current data model

The answer schema is `adult_open_experiences_v4`: shared background (including the `community_connection` array and conditional `community_connection_other` text), `experiences: [{id, responses: {situation, actions, access, outcome, support, additional}}]`. Each experience's stable ID persists through navigation, deletion of other experiences and draft recovery. Display numbers may change after deletion, while IDs and answers do not. The number of experiences is not capped.

Old single-group v3 drafts retain their original text and expiry on read. Existing v3/v4 global final comments move into the first experience’s additional answer when absent, with a clear visible note; a pre-existing additional answer is never overwritten, and any colliding final comment remains editable at completion. Related answers are mapped into one experience, all originals are preserved for participant review, and the stored version changes only after resume/save. Unknown versions are kept until the respondent explicitly chooses to clear them, with a local backup download available.

## Before separately authorised collection

Lutheran Care must confirm the questionnaire, actual receiving platform and project-specific handling, access, retention and reporting arrangements. A receiver must durably accept a synthetic end-to-end response and expose failures clearly before the front end can claim receipt. No credentials or real responses belong in GitHub Pages or this repository. The independent interview request and support-finder pages should not silently link identities to survey answers.

The earlier RAND data dictionary and detailed-choice variants are historical source material, not the current data schema. See [ADULT_SURVEY.md](ADULT_SURVEY.md) for the approved editing and draft contract.
