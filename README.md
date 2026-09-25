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

1. Invitation, a simple adult/under-18 route choice, age-appropriate participation and the minimum NT connection check. Under-18s then choose 15–17, 12–14, 7–11 or under 7 for the existing child and youth paths. All adults use one questionnaire; its optional age question records 18–29, 30–39, 40–49 or 50 or older. Ages 7–17 also answer the required assistance question here, before either the main or earlier-experience route.
2. Optional **About you** questions: broad residence, current/most-recent NT stay and military affiliation.
3. First ask whether support was needed during the recall period. Yes or Not sure reveals one support-area checklist. No skips area questions but keeps adult/youth service-information preferences.
4. Complete one page for each selected area: support received, extra or different support wanted now, what support would help if Yes, sources, relevant barriers or reasons, and an account of what happened when support was needed. Fields are visible directly; there is no expandable details panel.
5. Information/advice preferences about **services and support in the NT**, for adults and young people including those reporting no support needs.
6. Review, finish, the separate interview request and the free resource.

There is no second current-needs checklist, repeated closing “Your ideas” page, top-three ranking or four-week impact score. Past support received and extra support wanted now remain independent: a person can report an old gap that has since been resolved, or enough past support alongside a new request. “No” to extra help does not mean existing ongoing support is unnecessary.

The adult list retains 17 accepted domains plus “Something else”. “I did not need support in these areas” is removed from the checklist: the preceding Yes/No/Not sure/Prefer not to answer question records that distinction. The “Something else” text box appears immediately below its checkbox only when selected. Youth and child lists remain age-appropriate. Sources and experience can be answered for every selected area, including sufficient past support or no extra help wanted now. Most questions remain optional even though they are visible. The child route excludes adult contact-format preferences.

## Scope and recall

NT service timing controls the route independently of residence:

- Current service or service ending within the past 12 months: full questionnaire.
- Earlier NT service: one optional lessons/suggestions page, then review and finish; analysed separately from recent support needs.
- Uncertain connection: full questionnaire, retained as uncertain in analysis.
- No NT service connection: scope explanation.

These routes define consultation participation, not programme-benefit eligibility. Family members can live outside the NT. Current/former members and wider family relationships can be selected, with multiple roles allowed.

The adult and youth recall period is 12 months; the child period is 3 months. Support received, sources and barriers use that same period. Extra or different support wanted refers to now. Optional NT residence duration concerns the current or most recent stay, with a never-lived-in-NT option; it does not add separate postings together. These periods are project design choices.

Excluding invitation, age and participation, the adult/youth main route has **5 + n pages**, where n is the number of selected areas: 5 with none, 7 with two, and 10 with five, including review. The child route has **4 + n**. The earlier-experience route remains three pages: connection, comments and review. These counts exclude a conditional guardian-presence confirmation and the separate under-7 form; they are not measured completion times.

## Answer model and interpretation

Schema 6.0 stores the optional adult `answers.age_group` on both recent and earlier-experience routes. The four adult values are `18_29`, `30_39`, `40_49` and `50_plus`; the value does not affect questionnaire routing. It also stores the independent `answers.needs_status` answer (Yes, No, Not sure or Prefer not to answer), one `answers.needs` selection and independent `answers.areas[domain_id]` records containing `received`, `additional_support_now`, `support_requested`, `sources`, `barriers` and `comment`. `support_requested` appears and is retained only when `additional_support_now` is Yes. There is no automatic migration of older collective or current-only follow-up answers into this model.

Only Yes or Not sure permits area selection. Changing the needs-status response to No, Prefer not to answer or blank removes the dependent selections, other text and area blocks while preserving general preferences. Blank or declined need status is not evidence of no need. Removing an area removes its answer block. Changing its source response clears only that area's dependent barriers. Changing a Yes request to another response clears that area's dependent support-request text. Explicit non-seeking uses reasons for not seeking; actual help-seeking uses experienced barriers. Blank, uncertain or declined source answers must not imply a failed attempt. Optional unanswered fields remain missing, not “no barrier”. Use the number actually answering each field as its denominator.

Records describe individuals, not unique households or NT population prevalence. Do not pool child/youth and adult measures, uncertain and confirmed connections, or earlier-experience and recent-needs routes without making those differences explicit. The fictional results page illustrates an older instrument; it does not analyse schema 6.0 responses.

Adult/youth comments allow 5000 characters; child comments allow 1500. The counter appears near the limit. Optional questions can be left blank with one Continue button; required connection/participation choices must be completed first.

## Participation and privacy

For the questionnaire, adults and 15–17-year-olds give their own informed agreement; ages 7–14 first have guardian permission, followed by their own assent. Ages 7–17 answer **How are you answering these questions?** with **By myself**, **My parent or guardian is helping me** or **Someone else is helping me**. For ages 7–14, self/other assistance leads to a guardian-presence confirmation before substantive questions. This is the open online form’s design policy, not a universal legal requirement or a statement that other helpers are unlawful. For ages 15–17, another helper does not cause a guardian block.

Under 7 has one parent/guardian form: four optional boxes recording the child’s own expressions, followed by **Your observations**. There is no response-mode selector. The child boxes are visible from the start and become editable only after the adult confirms the child wants to join in; guardian observations need guardian permission but not child willingness. Unchecking willingness clears only child responses. The schema 1.1 `young_child_supported` export derives its response basis from actual child responses and never claims child assent for an observation-only record. These perspectives remain separate from the adult and child questionnaire measures. Anyone needing help with understanding, authority or safe guardian involvement can speak with an LC worker. The public form does not fabricate worker approval. Eighteen is adulthood; the use of fifteen is an operational capacity approach, not a universal statutory consent age. Follow the staff procedure for individual assessment, assistance and safeguarding.

The separate interview-request form offers self and parent/guardian routes, including a limited explanation request for under-15s. A guardian supplies their own contact details. These arrangements do not replace the questionnaire's permission and assent process. See [CONTACT_FORM.md](CONTACT_FORM.md).

No names, contact details or response-retrieval codes are requested in the questionnaire. Its v11 notice says people can stop before submitting and that names or contact details are not collected for retrieving individual responses afterwards. The general access, correction and complaint route remains available; unexpected identifiable content still requires appropriate handling.

The questionnaire footer and thank-you screen link to the separate contact form in a new tab, without answers or participant identifiers. Contact details are not linked to questionnaire responses. Selecting a service-format preference is not permission for follow-up.

Neither form has a receiving endpoint, application analytics, cookies or persistent answer store. Questionnaire respondents can download a local JSON copy; the contact form does not export personal details. GitHub Pages itself logs visitor IPs for security. Real responses do not belong in this repository or personal development directories. Exported questionnaire consent records carry `context: internal_review`; they are not evidence of fieldwork approval. Before real collection, LC must confirm and implement the receiving system, access, any overseas processing, retention arrangements and safe-contact procedure. See [LEGAL_REVIEW.md](LEGAL_REVIEW.md).

## Development and source material

Run `node --test tests/*.test.mjs` to include the questionnaire, contact form and under-7 module. `node scripts/export-copy.mjs` exports the current definitions for the adult reading copy. Local preview: `python3 -m http.server 8174 --bind 127.0.0.1`.

LC logo and self-hosted Karla sources/licence are in `assets/`. GitHub Pages serves the repository root from main.

The adult domains and examples were checked against the supplied *Defence and Veteran Family Wellbeing Strategy 2025–2030* and First Action Plan. The recovered 39 headings belong to the earlier *From Challenges to Solutions* synthesis of several sources, not an official 39-item Strategy list. The fuller inventory distinguishes stated needs from gaps inferred from policy actions. It is a team reference, not a flat respondent checklist.

Examples aid recognition but are not exhaustive and do not produce separate counts for every detail mentioned. The national Strategy is not a validated questionnaire or evidence of NT prevalence or LC programme entitlements. See the source mapping for page-level evidence.

## Free resource and interview link

`support.html` is the free, standalone support finder. It is linked from the questionnaire completion screen and the interview form, and can be opened directly without taking part in either. `thank-you-resource.js` uses the exact first-party `support.html` path; both links open without sending answers, contact details or participant IDs. External service links point to the providers’ official pages.

The finder currently starts with six need areas, not 39 questions. A visitor chooses an area and one of the 39 more specific situations to see contact options. A “not sure” route remains, and urgent contacts sit in the footer. The six-area navigation is under review after Jacob found that it makes people guess how to classify overlapping situations; the next design will route from recognisable situations to services. The 39 headings are adapted from the supplied *NT Defence Support - 39 challenges and relevant support* reference, not presented as an official Strategy checklist or an eligibility test. `support-data.mjs` records source PDF page numbers and current provider links. Service descriptions were checked against official provider pages on 25 September 2026; check time-sensitive details with the provider before referring someone. The site does not collect or store finder choices.
