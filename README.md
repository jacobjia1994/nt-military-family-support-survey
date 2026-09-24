# NT Life & support

A Lutheran Care Defence-family consultation questionnaire, with formal participant wording and official brand assets. Separate team-review and fictional-results resources are also included.

- [Open the questionnaire](https://jacobjia1994.github.io/nt-military-family-support-survey/)
- [Read every question and add review notes](https://jacobjia1994.github.io/nt-military-family-support-survey/questions.html)
- [Explore fictional results](https://jacobjia1994.github.io/nt-military-family-support-survey/results.html)
- [Read the team review guide](https://jacobjia1994.github.io/nt-military-family-support-survey/review.html)

## What is included

Adult, youth (12–17), and child (7–11) pathways, plus a conversation guide for younger children. Conditional questions cover past support needs and adequacy, multiple current needs, and one collective set of impact/help-seeking/barrier questions. Generic caring and adult-child dependency items have been removed; related support areas remain in the needs and barriers lists.

The results page uses 136 fictional records. Age versions are shown separately, NT is the default geographical scope, and uncertain, declined and skipped answers remain distinct. The page supports filters and CSV export; it is not a set of findings about NT families.

## Answer handling

There is no response collection backend, application analytics tracker or persistent answer storage. GitHub Pages records visitor IP addresses for security; see its hosting privacy notice. Answers remain in the page until it is left, refreshed or closed and can be downloaded by the respondent. No entered answer is sent to GitHub or added to the results page. Review notes are also held only in memory; they survive switching age/location views on the same page and can be downloaded as Markdown. Download notes before leaving the page. Do not use this version to collect real participant responses.

## Hosting and review

The four HTML pages use dependency-free HTML, CSS and JavaScript and run on ordinary Intel or Apple Silicon Macs. The participant form also loads `lutheran-care.css`, the unchanged official LC logo and a locally hosted Karla font; asset sources and its open-font licence are in `assets/`. `survey.js` supplies both the respondent flow and the full question list, so review wording stays in sync. `survey.css` supplies the questionnaire and guide styles; the results page retains its own presentation and calculations. GitHub Pages serves the root of the main branch. No build workflow, secret, third-party font request or tracking script is needed.

For local development, run `python3 -m http.server 8174 --bind 127.0.0.1` from this directory, then open `http://127.0.0.1:8174/`. Work can continue on either Mac after pulling the latest GitHub commit.

## Review edition, 24 September 2026

The respondent view is a single-column questionnaire with Lutheran Care’s logo and a quiet project header, with no site navigation, results links or team-review links. Review resources remain available at their separate URLs. The opening names Lutheran Care and verified Australian Government Department of Defence funding, explains the project and invites community input. Privacy information covers voluntary participation, purpose, de-identified sharing with Defence and LC’s public privacy policy/contact. It keeps the existing question constructs, stable answer IDs and age/location branches. Copy changes remove promotional slogans, correct the child outside-NT wording and describe youth help-seeking concerns in the appropriate tense. Returning from the answer review to edit a section now returns directly to the updated overview.

The new full question list includes all three age versions, both location contexts, conditional fields, all three help-seeking variants and the under-seven conversation guide. It has printable wording and downloadable, private review notes. The separate review guide identifies decisions for the project team. The 136 fictional records and all results calculations are unchanged.

Human review is still needed for tone, questionnaire length and final wording. The formal wording and branding do not themselves activate response collection. A receiving platform is still required before fieldwork; the application offers saving/reviewing answers and does not display a false submission confirmation.

## Validation

Run `node --test tests/survey.test.mjs`. The current 15 tests exercise dependent-answer cleanup, exclusive choices, export semantics, age/location paths, and parity between live questions and the review library. The redesign also received desktop/390px browser checks and an independent visual review. The optional design detector ran in degraded mode because its parser dependencies were unavailable; this was not counted as an accessibility audit.

Design targets are 8–10 minutes for adults, 5–7 for youth and 3–5 for children; these have not been validated by participant timing. The internal guide explains the decisions still needed before fieldwork, including consent and assent arrangements, data handling and scope.

The original version reported 22 branching/answer-integrity regressions, calculation checks across 136 fictional records and 180 filter intersections. Its test sources were not included in this repository; the current regression suite above is reproducible here. This is not a validated psychometric instrument or a completed accessibility audit.

## Formal internal review, 24 September 2026

Jacob has confirmed service consultation and instructed that the participant interface show the intended formal questionnaire. Main and adult reading copy therefore contain no draft, test, backend-status or implementation labels. This README and the separate staff guide disclose the review context. Finishing never claims that a response was submitted or received. Exported participation records carry `context: internal_review`; they are demonstrations, not evidence of real participant consent or staff approval.

The formal notice adapts LC's current public feedback/referral forms and June 2026 v12 privacy policy. It does not claim to be copied from a verified LC community survey. No public source establishes a survey platform, storage country or universal retention period for this programme, so none is invented. The existing approved-systems, authorised-access, records and privacy-rights framework is used. Details and sources are in `copy/lc-public-practice.md`.

The implemented participation model is: 18+ and 15–17 informed own consent; 7–14 guardian permission followed by the child's own assent; under7 facilitated conversation after permission, following the child's willingness. Anyone uncertain or unable to safely involve a guardian can speak with an LC worker first. The 15-year split is a proposed operational model informed by consent-capacity guidance, not a statutory universal threshold or a claim of LC approval. No public checkbox can pretend that a worker completed a capacity assessment. See `consultation-procedure.md` for the practical staff procedure.

Residence is optional and has no role in eligibility. Family members outside the NT are included. A broad area helps plan service locations and remote access; no address or postcode is asked. Skipping or declining residence uses neutral wording and hides NT residence-duration questions. Service preferences refer to receiving help from LC or another service and do not request a referral or authorise recontact.

GitHub is the review-code host, not an answer store. There is no active receiver or monitoring service. LC can use its approved collection and staff arrangements for live consultation; this implementation does not silently activate one. Research/HREC approval is not a current project gate for the confirmed consultation scope; later research reuse would be a separate purpose.

## Concise copy and multiple current needs

The current instrument uses `schema_version: 2.0`. `answers.priority` is now an array, despite its historical key name. It records all selected current support needs, independently of past selections; it is not a rank or a single top priority. The impact, help, barriers, change and delivery answers concern the selected set collectively. Per-domain adequacy for past needs is unchanged. Never assign one collective impact/barrier value to each selected domain. The fictional results page remains an earlier single-priority illustration and is not a processor for version2 records.

One Continue button advances optional blank questions and preserves entered answers. Required fields and participation choices must be answered first. Back still allows review and editing. `scripts/export-copy.mjs` exports the exact live definitions to `copy/adult-wording.json`; the adult reading copy now follows these rather than maintaining a separate rewrite.

The withdrawal notice describes the intended no-linking design: no names/contact details, lookup codes or respondent/contact mapping. It does not promise that an unsolicited narrative can never identify anyone. The future receiver must not attach visit/IP metadata to the analysis dataset or pass response information to the resource link. Safeguarding records follow LC's restricted procedure.

## Completion resource

Edit `thank-you-resource.js` to set `title` and the public HTTPS `url` of the team's eventual file or folder. An empty URL shows an inactive resource button and **Available soon**, without an invented gift or fake link. A valid HTTPS URL activates **Get your free resource** after completion. The link opens separately with no referrer, response answers, email capture or appended participant ID. Optional questions may remain blank; answering sensitive fields is not a condition of seeing the resource. No actual resource file has been produced in this task.
