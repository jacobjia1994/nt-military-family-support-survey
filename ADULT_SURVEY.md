# Adult experience survey

## Current approved design — 30 September 2026

Jacob approved the five-question dynamic experience design and its publication on the existing GitHub Pages site. This replaces the earlier fixed six/seven-question design. The existing approved welcome copy and background questions stay in place.

There are four stages, with an open-ended number of experience pages: Welcome → A bit about you → Your experiences → Thank you. Stage navigation never claims a fixed total number of pages.

## Experience pages

Each experience has a stable ID and five optional text answers: situation, actions, access, outcome and support. The exact wording and help are in `adult-survey/survey-spec.json`. An experience may describe a continuing or repeated part of life or several related situations; respondents do not need to choose their most painful/serious experience, and it need not have been caused by military service. Their own experience while they or their currently serving family member was based in Greater Darwin remains in scope even if they lived elsewhere.

Add another experience saves the current in-page answers and creates a separate blank experience without repeating background questions. Back goes to the preceding experience, or to the background stage from the first. A selector lets respondents revisit any existing experience. Delete this experience asks for clear confirmation and preserves the other IDs and answers. At least one experience remains; there is no fixed maximum number.

All five experience fields and the final comment can be left blank, including whitespace-only answers. Each remains limited to 5,000 newline-normalised UTF-16 characters for completion. Longer text is preserved for editing; no counter or silent truncation. Completion checks all experiences and sends the respondent to the correct experience if a limit needs correction.

Finish survey opens a small final section at the tail of the current experience, with exactly one genuinely optional final comment, the existing identifying-information check and Confirm and submit. It does not add another round of questions or a fixed large page. Returning or adding another experience retains the one final comment. Thank you remains a separate completed stage with the independent interview and services links.

## Protected background and participant information

All background labels, help, options, required rules, numeric limits and refusal controls remain unchanged. Serving connection and current residence remain separate. Family members may live elsewhere; the existing family definition is unchanged. Keep consent to own sensitive information, de-identified reporting and sharing with funding partners, privacy rights, possible inability to locate answers after completion, privacy policy and both programme/feedback contacts. Preserve the funding/source footer and both thank-you resources.

## Answer and draft data

Answer schema: `adult_open_experiences_v4`. The same answer object holds shared background, `experiences: [{id, responses}]` and one `final_comment`. Each response object uses `situation`, `actions`, `access`, `outcome`, `support`. Draft metadata records the active experience ID; rendering numbers are display positions, not data identity.

After adult agreement, changes are saved locally with a short debounce, on navigation and before leaving/hiding the page. A return visit offers Resume survey without displaying the saved text first. Drafts expire 30 days after the latest successful save. Browser cleanup/private mode/eviction can remove them sooner. Save failures preserve current memory and do not falsely report success. Completion/clear remove only this survey's key, and deletion in another open tab cannot resurrect the cleared draft.

The old `adult_open_answers_v3` draft is migrated in memory without writing or changing its original expiry. Raw answers map to related new fields, while the full original response object is retained as `previous_responses`, including `help_needed`. Old final comments remain the final comment. On resume, the page explicitly announces the changed questions and provides an expandable copy of every original question/answer for checking. Resume and subsequent successful save write the new schema; a failed save leaves the original stored draft intact. Unknown schema/format versions remain available for local download and an explicitly confirmed clear/restart.

## Collection and validation

This release has no completed-answer receiver, analytics or third-party answer submission. Confirm and submit clears the local draft and shows neutral thanks; it does not claim receipt. The independent interview form retains its own fields and notices. Real collection is a separate receiving-platform decision.

Run `node --test tests/*.test.mjs`, then the bounded desktop/375px flow named in README, including old-draft migration and unknown-draft preservation. The model is pure validation/data manipulation; the app handles display and navigation; the draft store owns storage and migration.
