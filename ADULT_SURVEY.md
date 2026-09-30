# Adult experience survey

## Current approved design — 30 September 2026

Four stages: Welcome → A bit about you → Experiences → Thank you. The four-segment progress strip uses the original orange-red for reached phases, including the current phase, and light grey for upcoming phases. The current phase label appears above it, without page numbering. It remains on Experiences during the introduction and review sub-screens; review does not indicate submission or completion.

The first visit to Experiences displays the concise introduction and Start describing your experience, with no questions visible yet. It covers the past 12 months, personal/family/both perspectives and known facts, the Greater Darwin serving link including family living elsewhere, experiences not necessarily caused by military service, the purpose and optional answers. Identifying-details guidance is the final ordinary paragraph of this introduction, immediately before Start describing your experience. Classified/operationally sensitive information is addressed once in Welcome. Adding further experiences does not repeat the introduction gate.

## Questions and navigation

The six core questions follow the approved order: situation, needs, awareness, response, needs met or unmet, and support improvements. An optional additional comment follows. The seven field IDs are situation, needs, awareness, response, needs_met, improvement and additional. Each permits blank/whitespace answers and keeps the 5,000 newline-normalised UTF-16-character rule, without a counter or silent truncation. Stable IDs preserve association during Back/Next/add/delete and review edits. There is no fixed maximum number of experiences. Deletion requires confirmation, preserves other IDs and answers, and keeps at least one experience.

The former experience selector is removed. Back and Next move in sequence. Finish survey opens the single final review containing all visible background answers and all seven questions for every experience in original question order. Choice labels, multiple selections, conditional Other text and numeric/refusal answers display correctly. Empty optional answers read Not answered, without an error. Long text and special characters remain fully visible. Each Edit this page button returns to the corresponding background or experience input screen, with Return to review preserving other answers.

The final checkbox is: I have checked my answers and removed details that could identify me or anyone else. Confirm and submit requires it and validates the whole response before showing separate Thank you. No additional comment box or duplicate introduction appears at review.

## Background and participant information

Who can take part appears inside the Welcome information/confirmation box immediately before the consent checkbox, with no duplicate outside. Existing eligibility, family definition, serving connection/residence separation, required/refusal rules, numeric limits, contacts and privacy/reporting rights remain. Community connection stays the second question, with seven approved options, Select all that apply and exclusive Prefer not to answer. Selecting Other opens a required single-line Please specify immediately below that option. Locality Other has the same single-line field directly below its select control. Deselecting the controlling option clears hidden in-memory text. All Clear answer controls are removed; refusal options remain.

The invitation remains Your experience matters, using Australian Defence spelling. RAND and Defence strategy references are always expanded in the Welcome footer. Survey and privacy email contacts and the Privacy Policy link appear below them, centred on three separate lines at the bottom of Welcome. Thank-you buttons read Request an interview and Find support in the NT; their destinations remain contact.html and support.html.

## In-memory data only

Answer schema: adult_open_in_memory_v6. One in-memory answer object holds shared background and experiences: [{id, responses}]. The application has no persistence dependency, storage access, migration, resume prompt, saved-progress UI or 30-day promise. Refreshing/closing starts a blank survey. Back/Next within the running page and editing/returning to review do not lose answers. Returning from a browser-cached page resets the in-memory survey as a fresh visit.

Historical browser storage keys and answers are not read, written or deleted. Earlier storage is left untouched; no automatic migration occurs. The removed draft-store source and dedicated tests are no longer active dependencies.

## Collection and validation

There is no completed-answer receiver, analytics or third-party answer submission. Confirm and submit ends the front-end presentation with neutral thanks; it does not claim receipt. Interview and support resources are independent of answers.

Run node --test tests/*.test.mjs and the bounded desktop/375px flow described in README. Browser checks should use isolated test contexts and synthetic historical keys, asserting zero application storage access and exact preservation of seeded data through refresh and completion.
