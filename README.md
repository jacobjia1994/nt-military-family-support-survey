# NT Life & support

A questionnaire and fictional results explorer for internal project-team review, focused on current military service in the Northern Territory and military families.

- [Open the questionnaire](https://jacobjia1994.github.io/nt-military-family-support-survey/)
- [Explore fictional results](https://jacobjia1994.github.io/nt-military-family-support-survey/results.html)
- [Read the team review guide](https://jacobjia1994.github.io/nt-military-family-support-survey/review.html)

## What is included

Adult, youth (12–17), and child (7–11) pathways, plus a conversation guide for younger children. Relationship and financial/care dependence are separate. Conditional questions cover support needs, whether help was sufficient, one current priority, help-seeking and barriers.

The results page uses 136 fictional records. Age versions are shown separately, NT is the default geographical scope, and uncertain, declined and skipped answers remain distinct. The page supports filters and CSV export; it is not a set of findings about NT families.

## Answer handling

There is no response collection backend, tracking or browser storage. Answers remain in the page until refresh/close and can be downloaded by the respondent. No entered answer is sent to GitHub or added to the results page. Do not use this version to collect real participant responses.

## Hosting and review

The three HTML files are self-contained, dependency-free builds of the tested source and run on ordinary Intel or Apple Silicon Macs. GitHub Pages serves the root of the main branch. No build workflow, secret or external asset is needed.

Design targets are 8–10 minutes for adults, 5–7 for youth and 3–5 for children; these have not been validated by participant timing. The internal guide explains the decisions still needed before fieldwork, including consent and assent arrangements, data handling and scope.

Validation included 22 branching/answer-integrity regressions, calculation checks across 136 fictional records and 180 filter intersections, browser walkthroughs and 390px layout checks. This is not a validated psychometric instrument or a completed accessibility audit.
