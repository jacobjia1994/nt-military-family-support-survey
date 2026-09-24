# NT Life & support

A questionnaire and fictional results explorer for internal project-team review, focused on current military service in the Northern Territory and military families.

- [Open the questionnaire](https://jacobjia1994.github.io/nt-military-family-support-survey/)
- [Read every question and add review notes](https://jacobjia1994.github.io/nt-military-family-support-survey/questions.html)
- [Explore fictional results](https://jacobjia1994.github.io/nt-military-family-support-survey/results.html)
- [Read the team review guide](https://jacobjia1994.github.io/nt-military-family-support-survey/review.html)

## What is included

Adult, youth (12–17), and child (7–11) pathways, plus a conversation guide for younger children. Relationship and financial/care dependence are separate. Conditional questions cover support needs, whether help was sufficient, one current priority, help-seeking and barriers.

The results page uses 136 fictional records. Age versions are shown separately, NT is the default geographical scope, and uncertain, declined and skipped answers remain distinct. The page supports filters and CSV export; it is not a set of findings about NT families.

## Answer handling

There is no response collection backend, tracking or browser storage. Answers remain in the page until it is left, refreshed or closed and can be downloaded by the respondent. No entered answer is sent to GitHub or added to the results page. Review notes are also held only in memory; they survive switching age/location views on the same page and can be downloaded as Markdown. Download notes before leaving the page. Do not use this version to collect real participant responses.

## Hosting and review

The four HTML pages use dependency-free HTML, CSS and JavaScript and run on ordinary Intel or Apple Silicon Macs. `survey.js` supplies both the respondent flow and the full question list, so review wording stays in sync. `survey.css` supplies the questionnaire and guide styles; the results page retains its own presentation and calculations. GitHub Pages serves the root of the main branch. No build workflow, secret or external asset is needed.

For local development, run `python3 -m http.server 8174 --bind 127.0.0.1` from this directory, then open `http://127.0.0.1:8174/`. Work can continue on either Mac after pulling the latest GitHub commit.

## Review edition, 24 September 2026

The redesign replaces the decorative split-screen landing page and sidebar with a quiet, single-column questionnaire. It keeps the existing question constructs, stable answer IDs and age/location branches. Copy changes remove promotional slogans, correct the child outside-NT wording and describe youth help-seeking concerns in the appropriate tense. Returning from the answer review to edit a section now returns directly to the updated overview.

The new full question list includes all three age versions, both location contexts, conditional fields, all three help-seeking variants and the under-seven conversation guide. It has printable wording and downloadable, private review notes. The separate review guide identifies decisions for the project team. The 136 fictional records and all results calculations are unchanged.

Human review is still needed for tone, questionnaire length and final wording. This is a draft for discussion, not approval to begin fieldwork.

## Validation

Run `node --test tests/survey.test.mjs`. The current 15 tests exercise dependent-answer cleanup, exclusive choices, export semantics, age/location paths, and parity between live questions and the review library. The redesign also received desktop/390px browser checks and an independent visual review. The optional design detector ran in degraded mode because its parser dependencies were unavailable; this was not counted as an accessibility audit.

Design targets are 8–10 minutes for adults, 5–7 for youth and 3–5 for children; these have not been validated by participant timing. The internal guide explains the decisions still needed before fieldwork, including consent and assent arrangements, data handling and scope.

The original version reported 22 branching/answer-integrity regressions, calculation checks across 136 fictional records and 180 filter intersections. Its test sources were not included in this repository; the current regression suite above is reproducible here. This is not a validated psychometric instrument or a completed accessibility audit.
