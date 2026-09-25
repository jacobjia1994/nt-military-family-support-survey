# NT Defence Family Support Program consultation

A formal questionnaire for Lutheran Care’s internal team review. The project is service consultation. The participant interface uses the intended formal wording and LC branding; the current build holds entries in page memory and has no response receiver. Finishing does not transmit a response or claim that LC has received it.

- [Questionnaire](https://jacobjia1994.github.io/nt-military-family-support-survey/)
- [Separate interview request](https://jacobjia1994.github.io/nt-military-family-support-survey/contact.html)
- [Defence family support finder](https://jacobjia1994.github.io/nt-military-family-support-survey/support.html)
- [Contact-form design and privacy basis](CONTACT_FORM.md)
- [Adult reading copy](https://jacobjia1994.github.io/nt-military-family-support-survey/adult-wording.html)
- [All ages and conditional questions](https://jacobjia1994.github.io/nt-military-family-support-survey/questions.html)
- [Staff guide](https://jacobjia1994.github.io/nt-military-family-support-survey/review.html)
- [Flow and measurement contract](FLOW_REDESIGN.md)
- [Participation and safeguarding procedure](consultation-procedure.md)
- [Legal and privacy review](LEGAL_REVIEW.md)
- [Child participation and assistance review](CHILD_PARTICIPATION_REVIEW.md)
- [Strategy-to-questionnaire evidence](copy/strategy-needs-map.md)

## Questionnaire flow

1. On the invitation page, select **7 or younger**, **8–17** or **18 or older**. Participation information and the required choices appear there for the selected route. Ages 8–17 make an 8–14/15–17 follow-up choice for permission only; they answer the same shorter questionnaire. All adults use one questionnaire and can optionally record 18–29, 30–39, 40–49 or 50 or older later.
2. Answer the minimum NT connection questions. Adults retain an optional **About you** page. Young people aged 8–17 give optional broad region on the connection page, with no separate place page.
3. Answer whether support was needed during the recall period. Yes or Not sure reveals one support-area checklist. No skips detail questions but keeps service-information preferences.
4. Adults complete one detail page per selected area. Young people aged 8–17 can choose **one optional focus area** from the checked needs for detail; other checked needs remain recorded without repeated pages.
5. Adults and young people may give information/advice preferences about **services and support in the NT**, including when they report no support needs.
6. Review, finish, the separate interview request and the free resource.

There is no second current-needs checklist, repeated closing “Your ideas” page, top-three ranking or four-week impact score. Past support received and extra support wanted now remain independent: a person can report an old gap that has since been resolved, or enough past support alongside a new request. “No” to extra help does not mean existing ongoing support is unnecessary.

The adult list retains 17 accepted domains plus “Something else”. “I did not need support in these areas” is removed from the checklist: the preceding Yes/No/Not sure/Prefer not to answer question records that distinction. The “Something else” text box appears immediately below its checkbox only when selected. The shared 8–17 checklist uses age-accessible wording. Adults can answer sources and experience for every selected area, including sufficient past support or no extra help wanted now; youth detail is limited to the one optional focus. Most questions remain optional even though they are visible.

## Scope and recall

NT service timing controls the route independently of residence:

- Current service or service ending within the past 12 months: full questionnaire.
- Earlier NT service: one optional lessons/suggestions page, then review and finish; analysed separately from recent support needs.
- Uncertain connection: full questionnaire, retained as uncertain in analysis.
- No NT service connection: scope explanation.

These routes define consultation participation, not programme-benefit eligibility. Family members can live outside the NT. Current/former members and wider family relationships can be selected, with multiple roles allowed.

The adult recall period is 12 months; the shared 8–17 period is three months. Support received, sources and barriers use the relevant period where those details are asked. Extra or different support wanted refers to now. Optional adult NT residence duration concerns the current or most recent stay, with a never-lived-in-NT option; it does not add separate postings together. These periods are project design choices.

Excluding the invitation-page choices and including review, the adult main route has **5 + n pages**, where n is the number of selected areas. The 8–17 route has four pages without a focus and five with one focus; adding checked needs does not add pages. The earlier-experience route remains three pages: connection, comments and review. These counts exclude a conditional guardian-presence confirmation and the separate form for ages 7 or younger; they are not measured completion times.

## Answer model and interpretation

The adult schema 6.0 record stores optional `answers.age_group` on both recent and earlier-experience routes. Its four values are `18_29`, `30_39`, `40_49` and `50_plus`; they do not affect routing. The adult answer model also stores independent `answers.needs_status`, `answers.needs` and `answers.areas[domain_id]` records containing `received`, `additional_support_now`, `support_requested`, `sources`, `barriers` and `comment`. The shared youth response preserves all checked needs and separately identifies the one optional detailed focus. It must not present unchecked detail for other needs as No. There is no automatic migration of older child/youth answers into this revised measure.

Only Yes or Not sure permits area selection. Changing the needs-status response to No, Prefer not to answer or blank removes dependent selections and detail while preserving general preferences. Blank or declined need status is not evidence of no need. Removing a youth focus need clears its focus detail without erasing other selected needs. Adult area questions retain their existing separation between help-seeking and reasons for not seeking. Optional unanswered fields remain missing, not “no barrier”. Use the number actually answering each field as its denominator.

Records describe individuals, not unique households or NT population prevalence. Keep adult 12-month responses, shared 8–17 three-month responses, guardian observations, uncertain and confirmed connections, and earlier-experience routes distinguishable. The fictional results page illustrates an older instrument; it does not analyse the current responses.

The adult detail fields retain their existing limits. Youth focus answers are deliberately shorter; the counter appears near the applicable limit. Optional questions can be left blank with one Continue button; required connection/participation choices must be completed first.

## Participation and privacy

The invitation page presents the three age routes and each route’s participation choices inline. Adults and 15–17-year-olds give their own informed agreement. Ages 8–14 first have guardian permission, followed by their own assent. Ages 8–17 answer **Is anyone helping you read or write your answers?** with **No, I am answering myself**, **Yes, my parent or guardian** or **Yes, someone else**. For ages 8–14, self/other assistance requires a guardian-presence confirmation before substantive questions. This is the open online form’s design policy, not a universal legal requirement or a statement that other helpers are unlawful. For ages 15–17, another helper does not cause a guardian block.

Children aged 7 or younger have one parent/guardian form: four optional boxes recording the child’s own expressions, followed by **Your observations**. There is no response-mode selector. The child boxes are visible from the start and become editable only after the adult confirms the child wants to join in; guardian observations need guardian permission but not child willingness. Unchecking willingness clears only child responses. The schema 1.1 `young_child_supported` export derives its response basis from actual child responses and never claims child assent for an observation-only record. These perspectives remain separate from older respondents’ answers. Anyone needing help with understanding, authority or safe guardian involvement can speak with an LC worker. The public form does not fabricate worker approval. Seven is a practical response-design boundary, not a universal ability or legal age. Eighteen is adulthood; the use of fifteen is an operational capacity approach, not a universal statutory consent age. Follow the staff procedure for individual assessment, assistance and safeguarding.

The separate interview-request form offers self and parent/guardian routes, including a limited explanation request for under-15s. A guardian supplies their own contact details. These arrangements do not replace the questionnaire's permission and assent process. See [CONTACT_FORM.md](CONTACT_FORM.md).

No names, contact details or response-retrieval codes are requested in the questionnaire. Its v11 notice says people can stop before submitting and that names or contact details are not collected for retrieving individual responses afterwards. The general access, correction and complaint route remains available; unexpected identifiable content still requires appropriate handling.

The questionnaire footer and thank-you screen link to the separate contact form in a new tab, without answers or participant identifiers. Contact details are not linked to questionnaire responses. Selecting a service-format preference is not permission for follow-up.

Neither form has a receiving endpoint, application analytics, cookies or persistent answer store. Questionnaire respondents can download a local JSON copy; the contact form does not export personal details. GitHub Pages itself logs visitor IPs for security. Real responses do not belong in this repository or personal development directories. Exported questionnaire consent records carry `context: internal_review`; they are not evidence of fieldwork approval. Before real collection, LC must confirm and implement the receiving system, access, any overseas processing, retention arrangements and safe-contact procedure. See [LEGAL_REVIEW.md](LEGAL_REVIEW.md).

## Development and source material

Run `node --test tests/*.test.mjs` to include the questionnaire, contact form and younger-child module. `node scripts/export-copy.mjs` exports the current definitions for the adult reading copy. Local preview: `python3 -m http.server 8174 --bind 127.0.0.1`.

LC logo and self-hosted Karla sources/licence are in `assets/`. GitHub Pages serves the repository root from main.

The adult domains and examples were checked against the supplied *Defence and Veteran Family Wellbeing Strategy 2025–2030* and First Action Plan. The recovered 39 headings belong to the earlier *From Challenges to Solutions* synthesis of several sources, not an official 39-item Strategy list. The fuller inventory distinguishes stated needs from gaps inferred from policy actions. It is a team reference, not a flat respondent checklist.

Examples aid recognition but are not exhaustive and do not produce separate counts for every detail mentioned. The national Strategy is not a validated questionnaire or evidence of NT prevalence or LC programme entitlements. See the source mapping for page-level evidence.

## Free resource and interview link

`support.html` is the free, standalone support finder. It is linked from the questionnaire completion screen and the interview form, and can be opened directly without taking part in either. `thank-you-resource.js` uses the exact first-party `support.html` path; both links open without sending answers, contact details or participant IDs. External service links point to the providers’ official pages.

The finder currently starts with six need areas, not 39 questions. A visitor chooses an area and one of the 39 more specific situations to see contact options. A “not sure” route remains, and urgent contacts sit in the footer. The six-area navigation is under review after Jacob found that it makes people guess how to classify overlapping situations; the next design will route from recognisable situations to services. The 39 headings are adapted from the supplied *NT Defence Support - 39 challenges and relevant support* reference, not presented as an official Strategy checklist or an eligibility test. `support-data.mjs` records source PDF page numbers and current provider links. Service descriptions were checked against official provider pages on 25 September 2026; check time-sensitive details with the provider before referring someone. The site does not collect or store finder choices.
