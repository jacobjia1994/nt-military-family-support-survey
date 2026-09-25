# Consultation flow and measurement contract

Implemented on 25 September 2026, including Jacob’s later revisions to show experience questions directly, move background questions forward and remove the repeated closing question.

## Purpose and sequence

Give Lutheran Care a usable picture of support needed, support received, requests for extra or different help and preferences for finding services in the NT.

1. Invitation, age-appropriate participation and the minimum NT connection check.
2. Optional **About you** questions.
3. One support-area checklist.
4. Finish each selected area before moving to the next.
5. Information/advice preferences about services and support in the NT, for adults and young people.
6. Review and finish, with the separate conversation request and free resource.

Earlier NT experience remains a separate connection → comments → review route. This routing defines consultation scope, not programme-benefit eligibility. Residence is optional and does not exclude family members living elsewhere.

## One selection, then one page per area

The accepted support-area checklist includes needs that were met and support still needed now. Adults and young people use a 12-month recall period; children use 3 months. A new need now is within that window. There is no second full checklist, mandatory top-three ranking or four-week impact score.

Each area asks, in this order:

1. How much of the support needed in the recall period was received?
2. Is extra or different support wanted now?
3. If Yes: **What support would help you now?**
4. Where did the person look for support in the same recall period?
5. The relevant barriers or reasons for not seeking support, determined by the source response.
6. **What worked well, or could have been better?**

These fields appear directly on the page. There is no **More about this experience** heading or collapsed panel. They remain optional. The child wording is simpler: **What help would you like now?** and **What helped, or could have made things easier?**

## Keep past support and current requests independent

| Past support | Extra/different support wanted now | Interpretation |
| --- | --- | --- |
| Enough | No | Existing support may remain important; no additional request is recorded. |
| Enough | Yes | A new, changed or previously uncovered request exists. |
| Some/none | No | A past gap can be described without being counted as current demand. |
| Some/none | Yes | A past gap and a current request are both recorded. |

The second question is a current request, not a clinical assessment or objective measure of unmet need. Blank, uncertain and declined responses remain distinct from No. The Yes-only written response identifies what the person wants now; the final area comment covers experience and improvement without repeating a question about what LC needs to know.

Sources and experience remain available even when earlier support was sufficient or no extra help is wanted. Actual help-seeking shows experienced barriers; explicit non-seeking shows reasons for not seeking. Blank, uncertain or declined source answers must not imply a failed attempt.

Visible fields are still voluntary. Use the number actually answering each field as its denominator, and retain skipped answers as missing. Displaying every field does not turn incomplete responses into complete barrier measurements.

## Background, preferences and completion

Broad residence, current/most-recent NT stay, military affiliation and younger respondents’ assistance with answering come before the needs checklist. Age, relationship and service connection are not repeated. NT duration counts the current or most recent stay, not accumulated postings.

The preferences section is **Finding services and support in the NT**, asking **How would you prefer to get information or advice about services and support in the NT?** It describes information and navigation, not the substantive delivery of housing or childcare. Timing appears only after a synchronous format is selected. Preferences do not imply contact consent.

Adults and young people can answer preferences even with no selected needs. Children continue from their area pages to review. The separate **Your ideas** page is removed; experience and suggestions stay with the relevant area, and **Something else** remains available in the needs list.

The thank-you screen acknowledges helping improve support in NT communities. **Arrange a conversation** appears there and in the questionnaire footer, alongside the existing information access. It opens a separate tab without answers, response IDs or a person-level link. The contact form does not require questionnaire completion. The same free resource appears in both journeys without requiring consent to contact. Its URL remains unset until the team supplies the resource.

Most questions remain optional, with one Continue button. Required participation and connection choices must be completed first. The formal participant interface does not claim receipt while collection is unconnected.

## Page counts

Excluding invitation, age and participation, and including review:

| Route | Pages |
| --- | --- |
| Adult/youth main route | 5 + number of selected areas: 5 with none, 7 with two, 10 with five |
| Child main route | 4 + number of selected areas |
| Earlier NT experience | 3: connection, comments and review |

These are page counts, not measured completion times. All areas are completed once; optional fields can be left blank.

## Schema 5 answer contract

`answers.needs` selects domains. Independent `answers.areas[domain_id]` blocks contain:

- `received`: support received during the age-appropriate recall period;
- `additional_support_now`: whether extra or different support is wanted now;
- `support_requested`: optional description shown and retained only after Yes;
- `sources`: help-seeking during the same past period;
- `barriers`: experienced barriers or reasons for non-seeking, according to the source answer;
- `comment`: optional experience and suggested improvements for that area.

Changing an area's sources clears only its dependent barriers. Changing Yes to another current-request answer clears its support-request text. Deselecting an area removes its block. Earlier collective/current-only records are not automatically migrated. The removed global `anything` answer is not exported. Unanswered fields remain missing.

The main survey notice is `2026-09-25-v10`. It explains that names or contact details are not collected for retrieving individual responses afterwards and retains the general privacy-rights route. It does not announce an absolute loss of rights over unexpected identifiable content. See [LEGAL_REVIEW.md](LEGAL_REVIEW.md).

The public questionnaire remains a formal interface for internal review, with no connected receiver. This flow change does not activate collection. Questionnaire child permission/assent remains in place; the separate contact form has its own minimal all-age routes described in [CONTACT_FORM.md](CONTACT_FORM.md).

## Design basis

[ABS Forms Design Standards](https://www.abs.gov.au/book/export/31170/print) supports logical order and relevant filtering. [GOV.UK question pages](https://design-system.service.gov.uk/patterns/question-pages/) supports avoiding repeated entry and keeping each page's task focused. Neither source validates this instrument. Target-reader walkthroughs remain the practical test of comprehension and flow.
