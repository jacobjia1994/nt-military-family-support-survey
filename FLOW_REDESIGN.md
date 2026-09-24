# Consultation flow and measurement contract

Approved by Jacob on 25 September 2026 and implemented in the questionnaire.

Select support areas once, complete each area, then ask about future arrangements. The accepted support-area options, branding, participation safeguards and independent answers for each area are retained.

## Purpose

Give Lutheran Care a usable picture of support needs, support received, requests for extra or different help, and preferences that can inform the NT Defence Family Support Program.

The previous journey made three passes over the same areas and offered detail only for current needs. The revised flow removes that repetition and also invites experience of difficulties that have been resolved.

## Implemented sequence

1. Invitation, age-appropriate participation and the minimum NT connection check.
2. One support-area checklist.
3. Finish each selected area before moving to the next.
4. General information/advice and programme-arrangement preferences.
5. Useful experience or other suggestions.
6. Short optional background questions.
7. Review, finish and the existing completion resource.

Keep the older-NT-experience route separate from the recent-needs measures. Do not use this restructuring to silently change programme eligibility or recruitment scope.

## Select the areas once

**In the past 12 months, which areas have you needed support with?**

Include needs that were met and support you still need now.

Use the accepted adult list and its exclusive none/uncertain/declined choices. The child version retains its shorter recall period and age-appropriate list. A need that has started now is included in the recall period. A future concern that has not yet become a need belongs in the final suggestion field.

There is no second full checklist for current needs and no mandatory top-three ranking.

## Complete one area at a time

For Housing, display two short core questions together:

**Over the past 12 months, how much of the support you needed with housing did you receive?**

Enough to meet my needs / Some, but not enough / None / Not sure / Prefer not to answer.

**Would you like any extra or different support with housing now?**

Yes / No / Not sure / Prefer not to answer.

The two questions measure different things. Do not combine them into a single status list. No extra support requested does not mean that existing ongoing support is unnecessary. Enough past support does not rule out a new request now. Preserve blank answers separately from No.

| Past support | Extra/different support wanted now | Interpretation |
|---|---|---|
| Enough | No | Existing support may still be important; no additional request is recorded. |
| Enough | Yes | A new, changed or previously uncovered request exists. |
| Some/none | No | A past gap can be reported without being treated as current demand. |
| Some/none | Yes | A past gap and a current request are both recorded. |

Do not label the second question a clinical assessment or an objective measure of unmet need.

## Optional experience, kept with that area

A clearly optional **More about this experience** section is available on every selected area's page, including where no extra help is wanted now. Continue does not require the person to open it.

When opened:

- Ask where the person looked for support during the same recall period, using the existing sources list.
- After actual help-seeking, ask the existing experienced-barrier question. After explicit non-seeking, use the separate reasons list. Unknown, declined or blank help-seeking must not imply a failed attempt.
- Invite one written answer: **What would you like Lutheran Care to know about your experience with this?** The area title supplies the context. Keep this prompt stable when the core answers change, so previously entered text retains its meaning.

The separate four-week impact score has been removed. Past support and current requests are sufficient for this flow; no third recall window is introduced.

Detailed responses will be volunteered context. They are not complete barrier measurements for every selected area. Use the number actually answering each field as its denominator. If complete barrier counts are essential, the team must accept a longer core questionnaire; layout changes cannot eliminate that workload.

## General preferences and the ending

Use **Getting information and advice** as the frame for phone, video, in-person, written-information and navigation preferences. These describe contact/advice, not the substantive delivery of housing or childcare. Keep timing conditional on a synchronous format. Do not infer consent to contact from any preference.

Every adult or young person in the main cohort can contribute general preferences, including people with no current difficulties. Children retain the age-appropriate ending without adult contact-format preferences. One optional closing prompt can cover strengths and suggestions:

**Is there any support you would like us to keep, or anything else you would like to suggest?**

Optional military affiliation, broad residence, current/most-recent NT stay and assistance with answering come after the substantive questions. Do not ask age, relationship or connection again.

Keep the existing single Continue convention, optional substantive questions, independent child choice, review, and resource entry. Do not invent a submission receipt while collection is unconnected.

## Concrete checks

A person selects Housing and Childcare. Housing support was insufficient last year, but no extra help is wanted now. Childcare support was sufficient before, but a new shift pattern means different help is wanted now. The two independent questions record both accurately, and either area can carry optional detail.

A person selects no needs. They go directly to general preferences and suggestions, then optional background and review. They are not made to complete difficulty modules in order to contribute to programme design.

A person selects five areas. They see ten brief core selections, with optional detail for any or all areas. The substantive questions remain optional. They do not repeat the full area checklist or undertake five compulsory long interviews.

Excluding the existing welcome/age/consent steps, the adult main route has 6 pages with no selected areas, 8 with two, and 11 with five, including optional-background and review pages. These are page counts, not measured completion times. On the same basis, the earlier-experience route has three pages: connection, comments and review. Both routes then reach the completion screen.

## Answer contract

Schema 4 records the selected domains in `answers.needs` and the corresponding independent responses in `answers.areas[domain_id]`:

- `received`: support received during the age-appropriate recall period;
- `additional_support_now`: whether extra or different support is wanted now;
- `sources`: optional help-seeking during that same past period;
- `barriers`: optional experienced barriers or reasons for non-seeking, according to the source answer;
- `comment`: one optional written response about this area.

Changing one area's source answer clears only that area's dependent barrier answer. Deselecting an area removes only its block. Earlier schema records must not be copied into these fields as though they answered the new questions. Missing optional answers remain missing; a closed detail section is not evidence that no barriers existed.

The public questionnaire remains the formal interface for internal review, with no connected receiver. Its completion resource and local answer download remain available. This restructuring does not activate collection or change the participation/safeguarding procedure.

## Basis and status

[ABS Forms Design Standards](https://www.abs.gov.au/book/export/31170/print) supports a logical conversational order and relevant filtering. [GOV.UK question pages](https://design-system.service.gov.uk/patterns/question-pages/) supports avoiding repeated entry and keeping each page's task focused. Neither source validates this particular instrument.

The governing decision is: select once, keep two independent core answers per area, make depth explicit and optional, then ask about service arrangements. Target-reader walkthroughs remain the practical test of comprehension and flow; implementation checks do not establish that participants will find every question clear.
