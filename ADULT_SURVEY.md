# Adult experience survey

## Current approved design — 30 September 2026

Jacob approved the six-question dynamic experience design and its publication on the existing GitHub Pages site. This replaces the earlier fixed six/seven-question design. The existing approved welcome copy and background questions stay in place.

There are four stages, with an open-ended number of experience pages: Welcome → A bit about you → Your experiences → Thank you. Stage navigation never claims a fixed total number of pages.

## Experience pages

Each experience has a stable ID and six optional text answers: situation, actions, access, outcome, support and additional. The exact wording and help are in `adult-survey/survey-spec.json`. An experience may describe a continuing or repeated part of life or several related situations; respondents do not need to choose their most painful/serious experience, and it need not have been caused by military service. Respondents can describe their own experience, their family’s experience, or both, from their own perspective and only sharing what they know. An experience while they or their currently serving family member was based in Greater Darwin remains in scope even if they lived elsewhere.

Add another experience saves the current in-page answers and creates a separate blank experience without repeating background questions. Back goes to the preceding experience, or to the background stage from the first. A selector lets respondents revisit any existing experience. Delete this experience asks for clear confirmation and preserves the other IDs and answers. At least one experience remains; there is no fixed maximum number.

All six experience fields can be left blank, including whitespace-only answers. Each remains limited to 5,000 newline-normalised UTF-16 characters for completion. Longer text is preserved for editing; no counter or silent truncation. Completion checks all experiences and sends the respondent to the correct experience if a limit needs correction.

The sixth question provides an optional additional comment for each experience. Finish survey opens a small final section at the tail of the current experience, with the existing identifying-information check and Confirm and submit. New responses do not get a second similar comment box at completion. Thank you remains a separate completed stage with the independent interview and services links.

## Protected background and participant information

The existing background labels, help, options, required rules, numeric limits and refusal controls remain unchanged. A new required second question asks about the respondent’s connection to the Greater Darwin Defence community, with Select all that apply and an exclusive Prefer not to answer option. Other opens a required Please specify text field; deselecting Other clears that field so a hidden answer cannot be retained. Serving connection and current residence remain separate. Family members may live elsewhere; the existing family definition is unchanged. Keep consent to own sensitive information, de-identified reporting and sharing with funding partners, privacy rights, possible inability to locate answers after completion, privacy policy and both programme/feedback contacts. Preserve the funding/source footer and both thank-you resources.

## Answer and draft data

Answer schema: `adult_open_experiences_v4`. The same answer object holds shared background, `experiences: [{id, responses}]` and optional additional comments within each experience. Each response object uses `situation`, `actions`, `access`, `outcome`, `support`, `additional`. Draft metadata records the active experience ID; rendering numbers are display positions, not data identity. The additive community question keeps the same answer schema: existing drafts retain all answers and experience IDs. Resuming an experience draft without the new required answer returns to the background stage to answer it before continuing.

After adult agreement, changes are saved locally with a short debounce, on navigation and before leaving/hiding the page. A return visit offers Resume survey without displaying the saved text first. Drafts expire 30 days after the latest successful save. Browser cleanup/private mode/eviction can remove them sooner. Save failures preserve current memory and do not falsely report success. Completion/clear remove only this survey's key, and deletion in another open tab cannot resurrect the cleared draft.

The old `adult_open_answers_v3` draft is migrated in memory without writing or changing its original expiry. Raw answers map to related new fields, while the full original response object is retained as `previous_responses`, including `help_needed`. A saved global final comment is moved without changing its text into the first experience’s additional answer when that field is absent, with a visible explanation. An existing additional answer is never overwritten: any colliding global final comment remains visible and editable at completion. Reading the draft does not rewrite storage or change its expiry; the transition is saved only after resume. The same migration applies to existing v4 drafts. On resume, the page explicitly announces the changed questions and provides an expandable copy of every original question/answer for checking. Resume and subsequent successful save write the new schema; a failed save leaves the original stored draft intact. Unknown schema/format versions remain available for local download and an explicitly confirmed clear/restart.

## Collection and validation

This release has no completed-answer receiver, analytics or third-party answer submission. Confirm and submit clears the local draft and shows neutral thanks; it does not claim receipt. The independent interview form retains its own fields and notices. Real collection is a separate receiving-platform decision.

Run `node --test tests/*.test.mjs`, then the bounded desktop/375px flow named in README, including old-draft migration and unknown-draft preservation. The model is pure validation/data manipulation; the app handles display and navigation; the draft store owns storage and migration.
