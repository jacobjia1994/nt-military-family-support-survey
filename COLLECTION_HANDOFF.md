# Collection and technical handoff

The current GitHub Pages release is a static adult experience survey. It has four stages and as many respondent-created experience pages as the respondent chooses. Each experience has five optional text answers. Background questions retain their required/refusal rules, and completion offers one optional final comment.

The front end has no answer receiver or analytics. It saves only unfinished local drafts after adult agreement, on the same device/browser for 30 days since the last successful save. Completion clears that local draft and shows neutral thanks; it does not transmit a completed answer or claim receipt. The separate interview request and NT support finder carry no survey-answer parameters.

## Current data model

The answer schema is `adult_open_experiences_v4`: shared background, `experiences: [{id, responses: {situation, actions, access, outcome, support}}]`, and one `final_comment`. Each experience's stable ID persists through navigation, deletion of other experiences and draft recovery. Display numbers may change after deletion, while IDs and answers do not. The number of experiences is not capped.

Old single-group v3 drafts retain their original text and expiry on read. Related answers are mapped into one experience, all originals are preserved for participant review, and the stored version changes only after resume/save. Unknown versions are kept until the respondent explicitly chooses to clear them, with a local backup download available.

## Before separately authorised collection

Lutheran Care must confirm the questionnaire, actual receiving platform and project-specific handling, access, retention and reporting arrangements. A receiver must durably accept a synthetic end-to-end response and expose failures clearly before the front end can claim receipt. No credentials or real responses belong in GitHub Pages or this repository. The independent interview request and support-finder pages should not silently link identities to survey answers.

The earlier RAND data dictionary and detailed-choice variants are historical source material, not the current data schema. See [ADULT_SURVEY.md](ADULT_SURVEY.md) for the approved editing and draft contract.
