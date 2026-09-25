# Consultation flow and measurement contract

Updated on 25 September 2026 for the approved inline age choice and shared, shorter 8–17 questionnaire. This remains a team-review interface without a response receiver.

## Purpose and sequence

Give Lutheran Care a usable picture of support needed, support received, requests for extra or different help and preferences for finding services in the NT.

1. On the invitation page, choose **7 or younger**, **8–17** or **18 or older**. Relevant participation information and choices open on that page. Within 8–17, an 8–14/15–17 follow-up changes permission arrangements, not the questionnaire. Adults may optionally give a separate age band later.
2. Complete the minimum NT connection check. Adults retain the optional About you page. The 8–17 route asks broad region on the connection page and has no separate place page.
3. Answer whether support was needed. Yes or Not sure reveals one support-area checklist.
4. Adults complete detail for each selected area. Young people aged 8–17 may choose **one focus area** from their listed needs for detailed questions; the focus is optional and the other checked needs remain recorded.
5. Adults and young people can state information/advice preferences about services and support in the NT, including when they report no support needs.
6. Review and finish, with the separate interview request and free resource.

Earlier NT experience remains a separate connection → comments → review route. This routing defines consultation scope, not programme-benefit eligibility. Residence is optional and does not exclude family members living elsewhere.

## Adult area detail and the shorter youth focus

The separate needs-status question establishes whether support was needed. Only Yes or Not sure reveals the accepted checklist, which includes needs that were met and support still needed now. No skips area questions; adult and youth respondents still see service-information preferences. A blank or declined status is not a No. The checklist contains only the accepted domains plus **Something else**, whose text input appears directly beneath its selected checkbox. There is no no-needs option mixed into the list. Adults use a 12-month recall period; the shared 8–17 questionnaire uses **three months**. These are design choices, not validated recall windows. There is no second full checklist, mandatory top-three ranking or four-week impact score.

The adult questionnaire asks for each selected area, in this order:

1. How much of the support needed in the recall period was received?
2. Is extra or different support wanted now?
3. If Yes: **What support would help you now?**
4. Where did the person look for support in the same recall period?
5. The relevant barriers or reasons for not seeking support, determined by the source response.
6. **What happened when you needed support with this?**

These adult fields appear directly on the page. There is no **More about this experience** heading or collapsed panel. They remain optional. The experience prompt has the cue **You could describe what helped, or what would have made things easier.** The shorter 8–17 route keeps a broad needs checklist, then offers detailed questions about one optional selected focus area rather than repeating this adult block for every selected need. Clear, concrete language must work when read aloud to a younger participant.

## Keep past support and current requests independent

| Past support | Extra/different support wanted now | Interpretation |
| --- | --- | --- |
| Enough | No | Existing support may remain important; no additional request is recorded. |
| Enough | Yes | A new, changed or previously uncovered request exists. |
| Some/none | No | A past gap can be described without being counted as current demand. |
| Some/none | Yes | A past gap and a current request are both recorded. |

The second question is a current request, not a clinical assessment or objective measure of unmet need. Blank, uncertain and declined responses remain distinct from No. The Yes-only written response identifies what the person wants now; the final area comment covers experience and improvement without repeating a question about what LC needs to know.

For the adult area blocks, sources and experience remain available even when earlier support was sufficient or no extra help is wanted. Actual help-seeking shows experienced barriers; explicit non-seeking shows reasons for not seeking. Blank, uncertain or declined source answers must not imply a failed attempt. For youth, selecting a need without selecting it as the one detailed focus does not imply any answer about past receipt, barriers or current requests for that need.

Visible fields are still voluntary. Use the number actually answering each field as its denominator, and retain skipped answers as missing. Displaying every field does not turn incomplete responses into complete barrier measurements.

## Background, preferences and completion

For adults, broad residence, current/most-recent NT stay and military affiliation come before the needs question. The optional adult age band sits with connection so that both recent and historical routes can record it. It does not change the adult question set. For ages 8–17, required assistance and optional broad region sit with connection; there is no separate youth place page. Relationship and service connection are not repeated. Adult NT duration counts the current or most recent stay, not accumulated postings.

The preferences section is **Finding services and support in the NT**, asking **How would you prefer to get information or advice about services and support in the NT?** It describes information and navigation, not the substantive delivery of housing or childcare. Timing appears only after a synchronous format is selected. Preferences do not imply contact consent.

Adults and young people can answer preferences even with no selected needs. The separate **Your ideas** page is removed; adult experience and suggestions stay with each selected area, and youth detail stays with the single optional focus. **Something else** remains available in the needs list.

The thank-you screen acknowledges helping improve support in NT communities. **Request an interview** appears there and in the questionnaire footer, alongside the existing information access. It opens a separate tab without answers, response IDs or a person-level link. The contact introduction invites a discussion with a Lutheran Care staff member about difficulties and support needs. The contact form does not require questionnaire completion. The same free resource appears in both journeys without requiring consent to contact. Its URL remains unset until the team supplies the resource.

Most questions remain optional, with one Continue button. Required participation and connection choices must be completed first. The formal participant interface does not claim receipt while collection is unconnected.

## Page counts

Excluding the invitation-page age and participation choices, and including review:

| Route | Pages |
| --- | --- |
| Adult main route | 5 + number of selected areas: 5 with none, 7 with two, 10 with five |
| Shared 8–17 main route | 4 pages without focus detail; 5 when one focus is chosen |
| Earlier NT experience | 3: connection, comments and review |

These counts exclude any conditional guardian-presence confirmation and the separate form for ages 7 or younger; they are not measured completion times. Adult areas are completed once each; youth detail is limited to one optional focus. Optional fields can be left blank.

## Answer contract

For adults, optional `answers.age_group` records one of `18_29`, `30_39`, `40_49` or `50_plus` on either consultation route; it is absent from youth exports. These non-overlapping bands are for analysis only, not questionnaire selection. The adult schema 6.0 record keeps its existing `answers.needs_status`, `answers.needs` and independent `answers.areas[domain_id]` blocks. Yes and Not sure permit needs selections; No, Prefer not to answer and blank do not. Changing to one of those states clears dependent selections, Other text and area blocks while retaining general preferences. Absence of a selection is not automatically no need. Adult area blocks contain:

- `received`: support received during the age-appropriate recall period;
- `additional_support_now`: whether extra or different support is wanted now;
- `support_requested`: optional description shown and retained only after Yes;
- `sources`: help-seeking during the same past period;
- `barriers`: experienced barriers or reasons for non-seeking, according to the source answer;
- `comment`: optional experience and suggested improvements for that area.

Changing an area's sources clears only its dependent barriers. Changing Yes to another current-request answer clears its support-request text. Deselecting an area removes its block. Earlier collective/current-only records are not automatically migrated. The removed global `anything` answer is not exported. Unanswered fields remain missing.

The 8–17 record must preserve the broad checklist separately from its **one optional focus area** and the focus answers. Removing a need also removes its focused detail if it was the focus. Other selected needs are not treated as if detailed questions were answered. The three-month youth responses must remain distinguishable from adult 12-month blocks and from guardian observations about a child aged 7 or younger.

The main survey notice is `2026-09-25-v11`. It explains that names or contact details are not collected for retrieving individual responses afterwards and retains the general privacy-rights route. It does not announce an absolute loss of rights over unexpected identifiable content. See [LEGAL_REVIEW.md](LEGAL_REVIEW.md).

The public questionnaire remains a formal interface for internal review, with no connected receiver. This flow change does not activate collection. The invitation page displays the shared notice and the chosen route’s agreement steps. Ages 8–14 need guardian permission and their own assent; a private LC help route remains available where guardian involvement would be unsafe or difficult. Ages 15–17 give their own informed agreement. If the 8–14 helper path asks for guardian presence, it does not replace the separate permission or assent. Presence is this public form’s design policy, not universal law.

Children aged 7 or younger have one parent/guardian form with four visible child-response boxes and **Your observations** at the end, without a response-mode selector. Child boxes require willingness; the observation field does not. Unchecking willingness clears only child responses. Schema 1.1 derives the response basis from recorded child responses; observation-only exports do not claim child assent. Its `young_child_supported` record is distinct from adult and youth support-area records and must not be pooled as equivalent self-report. See [CHILD_PARTICIPATION_REVIEW.md](CHILD_PARTICIPATION_REVIEW.md). The separate contact form has its own minimal all-age routes described in [CONTACT_FORM.md](CONTACT_FORM.md).

## Design basis

[ABS Forms Design Standards](https://www.abs.gov.au/book/export/31170/print) supports logical order and relevant filtering. [GOV.UK question pages](https://design-system.service.gov.uk/patterns/question-pages/) supports avoiding repeated entry and keeping each page's task focused. Neither source validates this instrument. Target-reader walkthroughs remain the practical test of comprehension and flow.
