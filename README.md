# Greater Darwin Defence Family Support Survey

A formal questionnaire for Lutheran Care’s internal team review. The project is service consultation. The participant interface uses the intended formal wording and LC branding; the current build holds entries in page memory and has no response receiver. Finishing does not transmit a response or claim that LC has received it.

- [Questionnaire](https://jacobjia1994.github.io/nt-military-family-support-survey/)
- [Separate interview request](https://jacobjia1994.github.io/nt-military-family-support-survey/contact.html)
- [Defence family support finder](https://jacobjia1994.github.io/nt-military-family-support-survey/support.html)
- [Contact-form design and privacy basis](CONTACT_FORM.md)
- [Adult reading copy](https://jacobjia1994.github.io/nt-military-family-support-survey/adult-wording.html)
- [All ages and conditional questions](https://jacobjia1994.github.io/nt-military-family-support-survey/questions.html)
- [Staff guide](https://jacobjia1994.github.io/nt-military-family-support-survey/review.html)
- [Flow and measurement contract](FLOW_REDESIGN.md)
- [Analysis and reporting protocol](ANALYSIS_PROTOCOL.md)
- [Collection and migration handoff](COLLECTION_HANDOFF.md)
- [Participation and safeguarding procedure](consultation-procedure.md)
- [Legal and privacy review](LEGAL_REVIEW.md)
- [Child participation and assistance review](CHILD_PARTICIPATION_REVIEW.md)
- [Strategy-to-questionnaire evidence](copy/strategy-needs-map.md)

## Questionnaire flow

1. On the invitation page, choose **Adult (18 or older)** or **Child or young person (under 18)**; the latter reveals **8–17** and **7 or younger**. No route is preselected. Participation information and required choices appear inline. Ages 8–17 make an 8–14/15–17 choice for permission only; they answer the same shorter questionnaire.
2. Give the ADF relationship and optional suburb/locality. Adults may optionally give an age band. Youth record assistance, then may describe what helped them feel welcome. Adults on the main route next see optional residence duration and a positive connection question.
3. Answer whether support was needed during time living in Greater Darwin within the recall period. Yes or Not sure reveals one support-area checklist. No skips area detail but preserves future support and participation questions.
4. Adults have one optional detail page for every selected area. Young people aged 8–17 may choose **one optional focus area**; other checked needs remain recorded without repeated detail pages.
5. **What could help next?** asks useful future support or activities, an optional priority among several selections, and relevant adult caring/child-age information.
6. **Taking part** asks participation formats, conditional suitable times, practical enabling arrangements and optional Berrimah access for in-person preferences.
7. Review and finish, with the separate interview request and free support guide.

Jacob clarified on 27 September that the survey must offer substantial space because few interviews can be conducted. **Keep all optional adult follow-ups; do not cap adult detail at one or two domains.** Most fields may be left blank. The needs list retains its 17 accepted domains plus Something else; any change to that inventory remains for the team's discussion. Future programme interest is a separate planning measure, not another past-needs checklist or a compulsory ranking.

Each area follows past support received → help sought and barriers → experience → extra/different help wanted now. A successful support experience is welcome; sufficient past support does not hide the experience question. Current requests and past support are independent.

## Scope and recall

The consultation covers **Greater Darwin, including Litchfield**. `geography.js` provides 100 alphabetically ordered named localities. The selector also offers **Another locality in Greater Darwin**, **Outside Greater Darwin** and **Prefer not to say**. It supports recorded aliases; a named locality derives the broader region without a second location question. Other reveals optional free text. See `GEOGRAPHY_SOURCES.md`.

Current/former ADF members and the existing partner, child, parent, other-family/carer relationships remain invited. The former military-force and local service-date questions are removed; no overseas-service transfer question is added. Residence now controls geography routing:

- Named/other Greater Darwin locality: main questionnaire (`current_local`).
- Undisclosed locality: main questionnaire (`residence_unspecified`); do not infer confirmed local residence.
- Outside Greater Darwin with previous local residence: historical comments, then review (`earlier_experience`). If past residence is uncertain, declined or blank, this historical space remains available without marking prior residence confirmed.
- Outside Greater Darwin and explicitly never lived locally, or no invited ADF relationship: scope explanation.

These routes define consultation participation, not programme-benefit eligibility. A local family is not excluded because the member served elsewhere or ceased service over a year ago.

Adults recall the past 12 months; youth recall three months. Both concern the part of that period spent living in Greater Darwin; a newer arrival considers time since arrival. Historical comments concern the earlier local experience and are analysed separately. Current requests refer to now; programme preferences include the coming months. Adult residence duration counts the current or most recent stay, not accumulated postings.

Excluding invitation/participation choices and including review, adult main-route pages are **6 + n**, where n is selected domains. Youth have five pages without focus and six with a focus. The historical route has three pages. These are navigation counts, not compulsory answer counts or measured completion times; a conditional guardian-presence step is additional. The younger-child path has background, expressions/observations and review.

## Answer model and interpretation

Adult/youth exports use schema **7.0**, revision **2026-09-27-local-experience-and-programmes-r2**, with residence scope/route, local recall geography and the respondent-perspective analysis unit. Adult `age_group` remains optional and does not change routing. The area record retains `received`, `sources`, `barriers`, `comment`, `additional_support_now` and `support_requested`. The youth record preserves all checked needs separately from its optional focus.

New fields include `programmes`, `programme_priority`, relevant `children_ages`, `participation_formats`, `participation_enablers`, conditional `times` and `berrimah_access`, plus their applicable Other fields. Future interests stay available with No, declined or blank past need status. The participation-format measure replaces the old information/advice `delivery` measure; do not silently combine them across revisions. Preferences are not contact consent.

Changing past need status to No/declined/blank clears only dependent needs/detail, not future programmes. Adding a help source within the same branch preserves barriers; moving between seeking/non-seeking/unspecified branches clears incompatible barriers. Unselected youth focus detail and optional blanks are missing, not No. A selected area with no detail still remains a selected area.

Every statistical output must follow [ANALYSIS_PROTOCOL.md](ANALYSIS_PROTOCOL.md). Report response records and participant perspectives, not unique households or population prevalence. Include the cohort, questionnaire revision, recall context and actual denominator. Keep age routes, historical/current/undisclosed residence and guardian perspectives distinguishable. The fictional results page illustrates an older instrument and does not analyse current responses.

Adult text fields retain 5,000 characters; youth fields use 1,500. A counter appears near the limit. Optional pages can be continued without completing every field; participation and ADF connection requirements remain.

## Participation and privacy

The invitation page presents an adult-first choice and reveals the two under-18 routes only when selected; each route’s participation choices still appear inline. Adults and 15–17-year-olds give their own informed agreement. Ages 8–14 first have guardian permission, followed by their own assent. Ages 8–17 answer **Is anyone helping you read or write your answers?** with **No, I am answering myself**, **Yes, my parent or guardian** or **Yes, someone else**. For ages 8–14, self/other assistance requires a guardian-presence confirmation before substantive questions. This is the open online form’s design policy, not a universal legal requirement or a statement that other helpers are unlawful. For ages 15–17, another helper does not cause a guardian block.

Children aged 7 or younger first have a short parent/guardian background step: ADF family connection, optional child locality and optional 0–4/5–7 age band. The expressions page defines “here” as living in Greater Darwin, then shows four optional child-response boxes followed by **Your observations**. There is no response-mode selector. The child boxes become editable only after the adult confirms the child wants to join in; guardian observations need guardian permission but not child willingness. Unchecking willingness clears only child responses. The schema 1.2 `young_child_supported` export, revision `2026-09-27-background`, includes geography metadata, derives its response basis from actual child responses and never claims child assent for an observation-only record. These perspectives remain separate from older respondents’ answers. Anyone needing help with understanding, authority or safe guardian involvement can speak with an LC worker. The public form does not fabricate worker approval. Seven is a practical response-design boundary, not a universal ability or legal age. Eighteen is adulthood; the use of fifteen is an operational capacity approach, not a universal statutory consent age. Follow the staff procedure for individual assessment, assistance and safeguarding.

The separate interview-request form offers self and parent/guardian routes, including a limited explanation request for under-15s. A guardian supplies their own contact details. These arrangements do not replace the questionnaire's permission and assent process. See [CONTACT_FORM.md](CONTACT_FORM.md).

No names, contact details or response-retrieval codes are requested in the questionnaire. Its v11 notice says people can stop before submitting and that names or contact details are not collected for retrieving individual responses afterwards. The general access, correction and complaint route remains available; unexpected identifiable content still requires appropriate handling.

The questionnaire footer and thank-you screen link to the separate contact form in a new tab, without answers or participant identifiers. Contact details are not linked to questionnaire responses. Selecting a participation-format preference is not permission for follow-up.

Neither form has a receiving endpoint, application analytics, cookies or persistent answer store. The completion screen offers the separate interview request and support finder; it does not offer answer downloads or a return to the review screen. The contact form does not export personal details. GitHub Pages itself logs visitor IPs for security. Real responses do not belong in this repository or personal development directories. Exported questionnaire consent records carry `context: internal_review`; they are not evidence of fieldwork approval. Before real collection, LC must confirm and implement the receiving system, access, any overseas processing, retention arrangements and safe-contact procedure. See [LEGAL_REVIEW.md](LEGAL_REVIEW.md).

## Collection and migration

The receiving platform remains undecided: LC may use its own Microsoft Forms or host this front end with an LC-approved receiver. The current changes activate neither. [COLLECTION_HANDOFF.md](COLLECTION_HANDOFF.md) describes ownership, prototype checks, source data, exports and launch verification. The IT handoff package includes `question-bank.json` and `frontend-source.zip` under `outputs/LC_IT_handoff` in the delivery workspace; the source archive identifies its built commit. The field bank describes this revision, not a live collection endpoint.

## Development and source material

Run `node --test tests/*.test.mjs` to include the questionnaire, contact form and younger-child module. Run `node scripts/export-copy.mjs` followed by `node scripts/render-adult-copy.mjs` to regenerate the adult reading copy from the current definitions, including conditional variants and the complete locality list. The renderer preserves the established style and consent shell; locality options expand for printing. Local preview: `python3 -m http.server 8174 --bind 127.0.0.1`.

LC logo and self-hosted Karla sources/licence are in `assets/`. GitHub Pages serves the repository root from main.

The adult domains and examples were checked against the supplied *Defence and Veteran Family Wellbeing Strategy 2025–2030* and First Action Plan. The recovered 39 headings belong to the earlier *From Challenges to Solutions* synthesis of several sources, not an official 39-item Strategy list. The fuller inventory distinguishes stated needs from gaps inferred from policy actions. It is a team reference, not a flat respondent checklist.

Examples aid recognition but are not exhaustive and do not produce separate counts for every detail mentioned. The national Strategy is not a validated questionnaire or evidence of NT prevalence or LC programme entitlements. See the source mapping for page-level evidence.

## Free resource and interview link

The title is **Defence Family Support Survey**, the greeting is **Hello, Defence community!**, and the introduction names **Greater Darwin**. Answer-length hints and the duplicate earlier-experience introduction are removed. The finish says **Thank you for helping strengthen the Defence community in Greater Darwin.** Two independent blocks explain the interview and free guide separately. Their equally styled red/white buttons read **Request an interview** and **Find support in a few clicks**; they align on desktop and stack on mobile.

`support.html` is the free, standalone NT-wide support finder. It is linked from the questionnaire completion screen and the interview form, and can be opened directly without taking part in either. `thank-you-resource.js` uses the exact first-party `support.html` path; both links open without sending answers, contact details or participant IDs. External service links point to the providers’ official pages.

The current finder uses seven support domains and visible questionnaire-style radio choices. It asks one relevant question at a time, then shows a suitable first contact and short alternatives. There are no dropdowns or topic search. Child age bands are conditional rather than always displayed. Urgent help remains in the footer and context-specific safety routes.

Maintain `support-paths.mjs` for the current question flow and matching, `support-model.mjs` for established base routes, and `support-catalog.mjs` / `support-expanded.mjs` / `support-referrals.mjs` for officially sourced contact records. Do not infer eligibility from a broad family label or call paid onward care free. `SUPPORT_COVERAGE.md` documents the scope and limits of the expanded local/national coverage; `SUPPORT_DESIGN.md` records the design reasoning and corrected real-world scenarios. Run `node --test tests/*.test.mjs` before publication.

The approved review corrections separate mental-health purpose from optional support preferences, prune irrelevant location questions, preserve the requested service type in fallback results, and make printed online contacts usable. Regression cases are in `tests/support-review-fixes.test.mjs`.
