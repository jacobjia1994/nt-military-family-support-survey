# Consultation flow and measurement contract

Updated 28 September 2026. Adult/youth schema `7.2`, questionnaire revision `2026-09-28-topic-linked-support`. Younger-child schema `1.3`, revision `2026-09-27-area-priority`. This remains a team-review interface without a response receiver. Collection platform and storage are for LC and its IT team to select; see [COLLECTION_HANDOFF.md](COLLECTION_HANDOFF.md).

## Purpose and sequence

The survey supports LC's decisions about useful support, experiences worth preserving, current requests and feasible participation in Greater Darwin, including Litchfield. Jacob clarified that optional detailed accounts are particularly important because staff can conduct only a limited number of interviews. Keep the opportunity to answer every selected adult domain; do not impose a one- or two-domain limit.

1. On the invitation page, choose Adult (18 or older) or Child or young person (under 18). The latter reveals 8–17 and 7 or younger. Participation information and choices appear inline. Within 8–17, the 8–14/15–17 choice changes permission arrangements only.
2. State the ADF relationship and optionally select the current broad area, followed by an optional suburb/locality from that area. Adults may optionally give their age band. Youth state who is helping them and may give a positive connection experience after these simpler questions.
3. Adults on the main route see optional residence duration, then a question about what made community connection easier or harder. Area and suburb are together on the preceding background page.
4. Answer whether support was needed during time living in Greater Darwin within the relevant recall period. Yes or Not sure reveals the needs checklist.
5. Ask separately which areas might benefit from support now or in the coming months. This remains available after No, declined or blank recent-need status. A past need and a future interest may be the same topic, but neither answer is inferred from the other.
6. Adults may answer one contextual page for every selected past or future topic. That page covers recent experience when applicable, then what would help with that topic and preferred ways to get it. Youth may choose one optional focus from their past and future topics; all other selections remain recorded without repeated detail pages.
7. For any future topic, offer one shared **Making support easier to use** page. Its general enablers and note are optional; suitable times appear for live formats, and convenient Greater Darwin areas appear for in-person formats. No LC office is presumed to be the activity venue.
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

The adult recent-needs list retains the 17 accepted domains plus Something else. Only Yes or Not sure to needing support opens that checklist; its Other text describes an unlisted recent need. The independent future-interest selector uses the same topic vocabulary so a person with no recent need can still identify a useful topic. There is no compulsory priority ranking.

For a domain selected as a recent need, the contextual page follows this sequence:

1. Support received during the local recall period.
2. Sources approached during that period.
3. Experienced barriers, or reasons for not seeking help, according to the source answer.
4. What happened, what helped or what could have made things easier.
5. What would help with this topic now or in the coming months, preferred support formats and any conditions that would make it easier or more comfortable to use. These optional prompts do not require another Yes/No gate.

All these detail fields remain optional and visible rather than hidden behind an extra panel. A past-only page shows a compact **Add future ideas for this topic** control; choosing it adds the topic to `future_needs` and reveals its future prompts without revisiting the selector. A respondent can leave a whole page blank and continue. Adult long answers retain 5,000 characters; youth long answers use 1,500. The shared 8–17 checklist and one optional detailed focus remain distinct. The adult full-depth requirement does not change that accepted shorter youth design.

Sufficient support never hides sources or the experience account. Explicit non-seeking shows reasons for not seeking, not presumed service failures. Blank, uncertain and declined answers are not No. Selected youth needs without focused detail have no implied adequacy or barrier answer.

## Future support and participation

`future_needs` records topic interests now or in the coming months, independently of `needs`, which records recent experience. The two lists use matching domain IDs so the same topic can be discussed once with the right past and future prompts. A distinct `future_other_need` option and `future_needs_other` text keep an unlisted future topic separate from an unlisted past need. None at present, unsure and prefer not to say are exclusive choices. `future_priority` is optional when at least two future topics are selected; it does not hide any topic detail or impose a ranking on recent needs. `future_ideas` offers an optional space for an idea that does not fit the selected topics, including a suggestion for other families.

Within each future-selected topic, `support_requested` records the person's own description of useful help. `formats` records how they would prefer to receive help **with that topic**; `format_other` captures another way. A past-only topic can be added to the future selector through the page's explicit control. There is no second support-status question. A preference for phone support with one topic does not become a preference for phone support with every topic. These answers do not enrol someone, book a service or authorise contact.

Adults see optional `children_ages` only when childcare, schooling or parenting/caring is relevant in recent or future selections. It records under 5, 5–11 and 12–17, with no children under 18 and declined alternatives. Youth do not receive this adult carer question.

The shared practical page appears once whenever at least one substantive future topic is selected. `participation_enablers` records general conditions that would make support easier to use; `enablers_other` adds an unlisted condition and `practical_note` can explain differences among topics. `times` and `time_other` appear for selected live formats. When an in-person format is selected, `in_person_areas` asks which areas of Greater Darwin would be convenient; `in_person_other` can describe another area. These are broad planning preferences, not an assumption that activities happen at Lutheran Care's Berrimah office. Older global `programmes`, `programme_priority`, `participation_formats` and `berrimah_access` are different measures and must not be silently mapped to the topic-linked fields. The `participation_enablers` ID remains, but its choices and placement changed, so compare revisions only with a field-level mapping.

## Page counts and completion

Excluding invitation/participation choices and including review:

| Route | Pages |
| --- | --- |
| Adult main | Background and selection pages, one contextual page per distinct past/future topic, one shared practical page when a future topic is selected, then review. |
| Shared 8–17 main | Background and selection pages, up to one optional focus page, one shared practical page when a future topic is selected, then review. |
| Earlier local experience | 3: connection, historical comments, review. |
| 7 or younger | Background, child expressions/guardian observations, review. |

Conditional guardian-presence confirmation is additional. Page counts vary with topic selections; they are not measured completion times or requirements to fill every field. The review primarily presents answers actually provided.

The review button says **Finish preview**. The end screen says **You have reached the end of this survey preview** and **Your answers were not sent or saved**. Two independent blocks explain an interview with LC and the free support guide. Their buttons are **Request an interview** and **Find support in a few clicks**, matching in red/white and visual weight. The guide is the existing standalone `support.html`; no contact details or survey completion are required to access it. No answers or response identifiers are transferred in these links.

## Answer preservation and reporting

Schema `7.2` stores the questionnaire revision, residence route/scope, local recall frame and respondent-perspective analysis unit. The area record retains recent-experience fields when that topic was selected as a past need, and topic-linked future fields when support is wanted. Stable domain and choice IDs remain independent of presentation order. Geography stores `residence_area` separately from optional `suburb`. Its `location_precision` is `area`, `suburb`, `other_locality` (Other with supplied text) or `not_stated`. Blank or declined area is not stated; Outside Greater Darwin has area precision and outside scope. Area-only records must not be distributed among suburbs.

Changing past needs to No/declined/blank clears dependent past answers while preserving independently selected future topics and their relevant detail. Removing a topic from one selector retains detail still supported by the other selector; removing it from both clears that topic's detail. Removing a youth focus clears its focused detail but preserves checked topics. Adding another source within the same help-seeking branch preserves selected barriers. Switching between seeking, not seeking and an unspecified source branch clears now-inapplicable barriers. Changing residential area between historical and main routes clears incompatible route-dependent content. Changing area also clears the previously selected suburb and its Other text, while leaving unrelated responses intact. Changing per-topic formats removes only inapplicable Other text or shared practical fields; reducing future topics below two clears the conditional priority.

Every report, chart, dashboard and numerical summary must follow [ANALYSIS_PROTOCOL.md](ANALYSIS_PROTOCOL.md): response records and participant perspectives, not unique families or population prevalence; explicit cohort, revision, recall frame and denominator; missing, declined, not asked and No kept distinct. A selected past or future topic with no optional detail still counts as a selection. Historical, age-specific and guardian perspectives remain distinguishable. The fictional results page illustrates an older instrument and cannot analyse schema 7.2 responses.

## Participation and younger children

The main notice remains `2026-09-25-v11`; the revised flow does not activate collection or replace LC's participant procedures. Ages 8–14 require guardian permission and their own assent. The ordinary unattended route also checks guardian presence for self/other assistance. Ages 15–17 give their own informed agreement. A private LC-assisted route remains available; permission does not entitle a guardian to every answer. See [consultation-procedure.md](consultation-procedure.md).

For ages 7 or younger, a brief first step records the ADF family connection, optional child broad area and then suburb/locality, and optional 0–4/5–7 age band. Yes or unsure ADF connection continues; No shows the scope explanation. The location is recorded without pretending an undisclosed or outside location is local. Child prompts then explicitly concern family life and living in Greater Darwin. Four optional expression boxes precede guardian observations. Willingness enables the expression boxes; observation-only records do not claim child assent. Unchecking willingness clears child expressions only.

The younger-child export uses schema `1.3`, revision `2026-09-27-area-priority`, geography metadata and distinct expression/observation fields. It is not equivalent to adult or youth need-domain self-report. The independent contact form retains its own all-age routes and safe-contact fields in [CONTACT_FORM.md](CONTACT_FORM.md).

## Design basis

The [ABS Forms Design Standards](https://www.abs.gov.au/book/export/31170/print) and [GOV.UK question-page guidance](https://design-system.service.gov.uk/patterns/question-pages/) inform logical order and relevant filtering. They do not validate this instrument. Target-reader walkthroughs remain the practical test of comprehension; optional depth remains an intentional consultation choice.
