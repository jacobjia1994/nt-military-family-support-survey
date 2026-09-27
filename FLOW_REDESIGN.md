# Consultation flow and measurement contract

Updated 27 September 2026. Adult/youth schema `7.1`, questionnaire revision `2026-09-27-area-priority`. Younger-child schema `1.3`, revision `2026-09-27-area-priority`. This remains a team-review interface without a response receiver. Collection platform and storage are for LC and its IT team to select; see [COLLECTION_HANDOFF.md](COLLECTION_HANDOFF.md).

## Purpose and sequence

The survey supports LC's decisions about useful support, experiences worth preserving, current requests and feasible participation in Greater Darwin, including Litchfield. Jacob clarified that optional detailed accounts are particularly important because staff can conduct only a limited number of interviews. Keep the opportunity to answer every selected adult domain; do not impose a one- or two-domain limit.

1. On the invitation page, choose Adult (18 or older) or Child or young person (under 18). The latter reveals 8–17 and 7 or younger. Participation information and choices appear inline. Within 8–17, the 8–14/15–17 choice changes permission arrangements only.
2. State the ADF relationship and optionally select the current broad area, followed by an optional suburb/locality from that area. Adults may optionally give their age band. Youth state who is helping them and may give a positive connection experience after these simpler questions.
3. Adults on the main route see optional residence duration, then a question about what made community connection easier or harder. Area and suburb are together on the preceding background page.
4. Answer whether support was needed during time living in Greater Darwin within the relevant recall period. Yes or Not sure reveals the needs checklist.
5. Adults may answer details for every selected area. Youth may select one optional focus from their checked needs; the other needs stay recorded without repeated detail pages.
6. All adult/youth main-route respondents reach **What could help next?**, including people with No, declined or blank past need status. Programme interest and its optional priority concern future support, not a limit on past experiences.
7. **Taking part** asks preferred participation formats, suitable times where relevant, enabling arrangements and optional access to Berrimah for people selecting an in-person format.
8. Review and finish. The interview request and support guide are independent optional next steps.

## Residence routing

The old current/recent Greater Darwin **service-date** screen is retired. Current/former ADF members and the existing partner, child, parent, wider-family/carer relationships remain invited. Service location or date is not used as a substitute for where the family lives.

| Response | Route and interpretation |
| --- | --- |
| Darwin, Palmerston, Litchfield, or another area in Greater Darwin, with or without a suburb | `current_local`: main questionnaire. |
| Broad area blank or Prefer not to say | `residence_unspecified`: main questionnaire; local residence must not be assumed in analysis. |
| Outside Greater Darwin, with past residence Yes | `earlier_experience`: connection → historical comments → review. |
| Outside Greater Darwin, with past residence blank, unsure or declined | The historical comments route remains available; past local residence is not recorded as confirmed. |
| Outside Greater Darwin and explicitly never lived there, or no invited ADF relationship | Scope explanation; no main needs interview. |

The optional broad-area question controls scope. Darwin, Palmerston and Litchfield are immediately visible native radio choices; a lower-emphasis Other area disclosure holds the other local area, outside and declined choices. Nothing is preselected, and a selected secondary choice keeps the disclosure open on return. For a local area, the optional native suburb dropdown offers only that area’s named suburbs/localities and Other suburb or locality. The existing catalogue contains 100 names in total. Other reveals optional free text. A blank suburb preserves the area and main route; no third level is needed. Palmerston alone is not Palmerston City. Changing area clears old suburb and Other text. These are consultation routes, not declarations of entitlement to programme services.

Adults recall the past 12 months; youth recall three months. For recent arrivals, only the time since arriving in Greater Darwin is relevant. Earlier local experience has no current 12-/3-month needs denominator. Adult residence duration refers to the current or most recent stay, not accumulated postings.

## Adult detail and youth focus

The adult list retains the 17 accepted domains plus Something else. Only Yes or Not sure to needing support opens the checklist; its Other text describes an unlisted need. The needs inventory remains unchanged pending the team's discussion. There is no second needs inventory or compulsory priority ranking.

Each selected domain now follows one time direction:

1. Support received during the local recall period.
2. Sources approached during that period.
3. Experienced barriers, or reasons for not seeking help, according to the source answer.
4. What happened, what helped or what could have made things easier.
5. Whether extra or different support is wanted now.
6. If Yes, what support would help now.

All these detail fields remain optional and visible rather than hidden behind an extra panel. A respondent can leave a whole page blank and continue. Adult long answers retain 5,000 characters; youth long answers use 1,500. The shared 8–17 checklist and one optional detailed focus remain distinct. The adult full-depth requirement does not change that accepted shorter youth design.

| Past support | Current extra/different help | Interpretation |
| --- | --- | --- |
| Enough | No | Existing support can remain important. |
| Enough | Yes | A changed or newly uncovered request can exist. |
| Some/none | No | A past gap may have resolved. |
| Some/none | Yes | A past gap and a current request are recorded. |

Sufficient support never hides sources or the experience account. Explicit non-seeking shows reasons for not seeking, not presumed service failures. Blank, uncertain and declined answers are not No. Selected youth needs without focused detail have no implied adequacy or barrier answer.

## Future support and participation

`programmes` records useful support now or in the coming months: parenting, time apart, settling, social connection, playgroups, service navigation or something else. None at present, unsure and prefer not to say are exclusive choices. An optional `programme_priority` appears when more than one substantive type is selected. It asks which would make the biggest difference; it does not remove any selected need or its detail.

Adults see optional `children_ages` only after selecting parenting/playgroup, or childcare/schooling/parenting-and-caring needs. It records under 5, 5–11 and 12–17, with no children under 18 and declined alternatives. Youth do not receive this adult carer question.

`participation_formats` asks how the person would take part. It replaces the previous information/advice-format measure; do not silently merge old `delivery` values into the new construct. `times` appears for in-person, group, phone or video participation. Self-guided resources no longer stand in for all programme participation; multiple suitable formats can be selected. `participation_enablers` independently records practical or comfort needs such as timing, bringing children, childcare, transport, language, accessibility and understanding of Defence family life.

`berrimah_access` is optional and shown only for an in-person format. A further optional explanation appears for difficulty or the need for help/adjustments. These answers inform planning, not bookings or permission to contact the respondent. None of the programme or participation fields depends on reporting a past support need.

## Page counts and completion

Excluding invitation/participation choices and including review:

| Route | Pages |
| --- | --- |
| Adult main | 6 + selected areas: 6 with none, 8 with two, 11 with five. |
| Shared 8–17 main | 5 without focus; 6 with focus. |
| Earlier local experience | 3: connection, historical comments, review. |
| 7 or younger | Background, child expressions/guardian observations, review. |

Conditional guardian-presence confirmation is additional. These are navigation counts, not measured completion times or requirements to fill every field. The review primarily presents answers actually provided.

The completion heading is **Thank you for helping strengthen the Defence community in Greater Darwin.** Two independent blocks explain an interview with LC and the free support guide. Their buttons are **Request an interview** and **Find support in a few clicks**, matching in red/white and visual weight. The guide is the existing standalone `support.html`; no contact details or survey completion are required to access it. No answers or response identifiers are transferred in these links.

## Answer preservation and reporting

Schema `7.1` stores the questionnaire revision, residence route/scope, local recall frame and respondent-perspective analysis unit. The area record retains `received`, `sources`, `barriers`, `comment`, `additional_support_now` and `support_requested`. Stable domain and choice IDs remain independent of presentation order. Geography stores `residence_area` separately from optional `suburb`. Its `location_precision` is `area`, `suburb`, `other_locality` (Other with supplied text) or `not_stated`. Blank or declined area is not stated; Outside Greater Darwin has area precision and outside scope. Area-only records must not be distributed among suburbs.

Changing past needs to No/declined/blank clears dependent domain answers while preserving future programmes and participation. Removing a selected domain removes only that domain's detail; removing a youth focus removes its focus detail. Adding another source within the same help-seeking branch preserves selected barriers. Switching between seeking, not seeking and an unspecified source branch clears now-inapplicable barriers. Turning a current request away from Yes clears its request text. Changing residential area between historical and main routes clears incompatible route-dependent content. Changing area also clears the previously selected suburb and its Other text, while leaving unrelated responses intact. Changing participation formats removes only timing/Berrimah/Other fields that no longer apply.

Every report, chart, dashboard and numerical summary must follow [ANALYSIS_PROTOCOL.md](ANALYSIS_PROTOCOL.md): response records and participant perspectives, not unique families or population prevalence; explicit cohort, revision, recall frame and denominator; missing, declined, not asked and No kept distinct. A selected domain with no optional detail still counts as a selected domain. Historical, age-specific and guardian perspectives remain distinguishable. The fictional results page illustrates an older instrument and cannot analyse schema 7.1 responses.

## Participation and younger children

The main notice remains `2026-09-25-v11`; the revised flow does not activate collection or replace LC's participant procedures. Ages 8–14 require guardian permission and their own assent. The ordinary unattended route also checks guardian presence for self/other assistance. Ages 15–17 give their own informed agreement. A private LC-assisted route remains available; permission does not entitle a guardian to every answer. See [consultation-procedure.md](consultation-procedure.md).

For ages 7 or younger, a brief first step records the ADF family connection, optional child broad area and then suburb/locality, and optional 0–4/5–7 age band. Yes or unsure ADF connection continues; No shows the scope explanation. The location is recorded without pretending an undisclosed or outside location is local. Child prompts then explicitly concern family life and living in Greater Darwin. Four optional expression boxes precede guardian observations. Willingness enables the expression boxes; observation-only records do not claim child assent. Unchecking willingness clears child expressions only.

The younger-child export uses schema `1.3`, revision `2026-09-27-area-priority`, geography metadata and distinct expression/observation fields. It is not equivalent to adult or youth need-domain self-report. The independent contact form retains its own all-age routes and safe-contact fields in [CONTACT_FORM.md](CONTACT_FORM.md).

## Design basis

The [ABS Forms Design Standards](https://www.abs.gov.au/book/export/31170/print) and [GOV.UK question-page guidance](https://design-system.service.gov.uk/patterns/question-pages/) inform logical order and relevant filtering. They do not validate this instrument. Target-reader walkthroughs remain the practical test of comprehension; optional depth remains an intentional consultation choice.
