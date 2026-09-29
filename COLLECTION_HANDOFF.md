# Collection and technical handoff — RAND Appendix A adaptation

The current public GitHub Pages build is a **noncollecting questionnaire presentation**. It stores answers only in page memory, makes no submission request, and has no response receiver or persistence. Its respondent-facing screens—including the final thank-you—mirror the intended survey at Jacob's explicit direction; the thank-you is not a receipt. No actual survey answer, participant identity or contact detail has been collected by publishing this version.

## Current instrument

The adult presentation is `rand-appendix-a-greater-darwin/1`, drawn from [RAND MG-1124 Appendix A](https://www.rand.org/content/dam/rand/pubs/monographs/2011/RAND_MG1124.pdf). [RAND_ITEM_CROSSWALK.md](RAND_ITEM_CROSSWALK.md) maps every original Q1–Q67 to retained or locally adapted wording. The four structured dictionaries under `copy/rand-appendix-*.json` are compiled into `rand-adult-data.js`; `rand-adult-engine.js` and the page builders render the respondent route. `adult-wording.html` is the generated reading copy. The 8–17 and younger-child paths in `youth.html` are separate local instruments and should not be described as RAND-validated.

## If Lutheran Care opens real collection later

The receiving platform must preserve the actual original-source branches and matrices, not just a flattened list: Q12–Q20 domain responses, Q22 categories, Q23–Q25 help needs, up to four Q26–Q29 contact paths, Q30–Q34 resource characteristic/network responses, Q35 resource-specific helpfulness by problem–need pair, Q36 hypothetical loss, and Q37–Q67 background/attitude/comment responses. Preserve explicit none, skipped and not-applicable separately, with option IDs and the exact wording revision. The first real confirmation may be shown only after an LC-owned receiver durably accepts a response; a static thank-you page is not sufficient evidence of receipt.

LC and IT must confirm adult/child eligibility, the actual data-use and privacy notice, access controls, retention, geographic and sensitive-data handling, an approved storage location, and an end-to-end invented-response test including failure/retry and export. Do not embed credentials in GitHub Pages or put actual answers into this repository. Keep interview-request contact details in a separate receiving service, with no hidden join key to survey responses. The fictional historical `results.html` and older schema 9.0 question bank cannot analyse this revision.
