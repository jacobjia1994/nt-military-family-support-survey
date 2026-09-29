# Collection and technical handoff — two adult variants

The current GitHub Pages release is a static, noncollecting presentation of the two adult alternatives. [Detailed choices](index.html) and [open responses](open-response.html) keep answers only in page memory. No response is transmitted, persisted or assigned a receipt. The respondent-facing pages use the supplied real-survey wording and neutral completion text, as Jacob directed. The team should review the wording and interaction before choosing an instrument.

## Separate future data models

The choice-led v4 model uses stable category, issue, need and source IDs. Source characteristics have issue-area scope; helpfulness has category–need–source scope; free comments belong to the exact category–need pair. Explicit no, unknown, refusal, unasked and blank remain different. Its pure model and specification are under `survey-variants/choice/`.

The written-response v4B model retains the shared category and issue IDs but uses stable, respondent-created need slot IDs (`n1`, `n2`, etc.). Its middle answers are raw text, not automatically inferred choices, ratings, diagnoses or gap flags. Its pure model and specification are under `survey-variants/open/`. Never combine the two variants' answers in one unlabelled dataset or apply v4 rating variables to v4B text. Keep wording revisions with any future collected data.

## Before separately authorised collection

Lutheran Care must confirm the chosen questionnaire, final eligibility and participant-information wording, actual platform and handling arrangements, access, retention and reporting rules. An LC-owned receiver must durably accept an invented end-to-end response, expose failures clearly, and support a verified export before the page can claim receipt. No credentials or real responses belong in GitHub Pages or this repository. The independent interview request and support-finder pages should not silently link identities to survey answers.

The earlier RAND Q1–Q67 data dictionary and [crosswalk](RAND_ITEM_CROSSWALK.md) are historical source material, not the schema for either current alternative.
