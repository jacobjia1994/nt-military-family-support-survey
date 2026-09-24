# NT Defence Family Support Program consultation

A formal questionnaire for Lutheran Care’s internal team review. The project is service consultation. The participant interface uses the intended formal wording and LC branding; the current build holds answers in page memory and has no response receiver. Finishing does not transmit a response or claim that LC has received it.

- [Questionnaire](https://jacobjia1994.github.io/nt-military-family-support-survey/)
- [Separate conversation request](https://jacobjia1994.github.io/nt-military-family-support-survey/contact.html)
- [Contact-form design and privacy basis](CONTACT_FORM.md)
- [Adult reading copy](https://jacobjia1994.github.io/nt-military-family-support-survey/adult-wording.html)
- [All ages and conditional questions](https://jacobjia1994.github.io/nt-military-family-support-survey/questions.html)
- [Staff guide](https://jacobjia1994.github.io/nt-military-family-support-survey/review.html)
- [Approved flow and measurement contract](FLOW_REDESIGN.md)
- [Participation and safeguarding procedure](consultation-procedure.md)
- [Strategy-to-questionnaire evidence](copy/strategy-needs-map.md)

## Questionnaire flow

1. Invitation, age-appropriate participation and the minimum NT connection check.
2. Select support areas once.
3. Complete one page for each selected area: support received in the recall period, then extra or different support wanted now. Optional experience stays on that page.
4. General information/advice preferences for adults and young people, including those who selected no needs.
5. One optional question about support worth keeping or other suggestions.
6. Optional background: military affiliation, broad residence, current/most-recent NT stay and assistance with answering.
7. Review, finish and the completion resource.

There is no second current-needs checklist, top-three ranking or four-week impact score. Past support received and extra support wanted now remain independent: a person can report an old gap that has since been resolved, or enough past support alongside a new request. “No” to extra help does not mean existing ongoing support is unnecessary.

The adult list retains 17 accepted domains plus “Something else”. Youth and child lists remain age-appropriate. Optional details are available for every selected area, including enough past support or no extra help wanted now. A respondent need not open those details to continue. The child version retains its age-appropriate journey without adult contact-format preferences.

## Scope and recall

NT service timing controls the route independently of residence:

- Current service or service ending within the past 12 months: full questionnaire.
- Earlier NT service: one optional lessons/suggestions page, then review and finish; analysed separately from recent support needs.
- Uncertain connection: full questionnaire, retained as uncertain in analysis.
- No NT service connection: scope explanation.

These routes define consultation participation, not programme-benefit eligibility. Family members can live outside the NT. Current/former members and wider family relationships can be selected, with multiple roles allowed.

The adult and youth recall period is 12 months; the child period is 3 months. Support received, sources and barriers use that same period. Extra or different support wanted refers to now. Optional NT residence duration concerns the current or most recent stay, with a never-lived-in-NT option; it does not add separate postings together. These periods are project design choices.

Excluding invitation, age and participation, the adult main route has 6 pages with no areas, 8 with two, and 11 with five, including review. Optional details expand within each area's page. These are page counts, not measured completion times.

## Answer model and interpretation

Schema 4 uses one `answers.needs` selection and independent `answers.areas[domain_id]` records containing `received`, `additional_support_now`, `sources`, `barriers` and `comment`. There is no automatic migration of earlier collective or current-only follow-up answers into this model.

Removing an area removes its answer block. Changing its source response clears only that area's dependent barriers. Explicit non-seeking uses reasons for not seeking; actual help-seeking uses experienced barriers. Blank, uncertain or declined source answers must not imply a failed attempt. Optional unanswered details remain missing, not “no barrier”. Use the number actually answering each field as its denominator.

Records describe individuals, not unique households or NT population prevalence. Do not pool child/youth and adult measures, uncertain and confirmed connections, or earlier-experience and recent-needs routes without making those differences explicit. The earlier fictional results page is an illustration of an older instrument, not an analyser of schema 4 responses.

Adult/youth comments allow 5000 characters; child comments allow 1500. The counter appears near the limit. Optional questions can be left blank with one Continue button; required connection/participation choices must be completed first.

## Participation and privacy

Adults and 15–17-year-olds give their own informed agreement; ages 7–14 first have guardian permission, followed by their own assent. Under 7 uses a facilitated conversation guide. Anyone needing help with understanding, authority or safe guardian involvement can speak with an LC worker. The public form does not fabricate worker approval. The age split is an operational model, not a universal statutory consent age. Follow the staff procedure for individual assessment, assistance and safeguarding.

No names, contact details or response-retrieval codes are requested. Ordinary answers are not linked to identity. Retaining answers is different from retaining an identity mapping. The formal notice describes intended LC custody, authorised access, sharing, rights and withdrawal without inventing a storage platform or retention period. Unexpected identifying disclosures still require appropriate privacy and safeguarding handling.

The implementation has no answer endpoint, application analytics, cookies or persistent answer store. Respondents can download a local JSON copy. GitHub Pages itself logs visitor IPs for security. Real responses do not belong in this repository or personal development directories. Exported consent records carry `context: internal_review`; they are not evidence of fieldwork approval. Before real collection, LC must put the receiver and the agreed handling arrangements into operation.

## Development and source material

Run `node --test tests/survey.test.mjs tests/contact.test.mjs`. `node scripts/export-copy.mjs` exports the current definitions for the adult reading copy. Local preview: `python3 -m http.server 8174 --bind 127.0.0.1`.

LC logo and self-hosted Karla sources/licence are in `assets/`. GitHub Pages serves the repository root from main.

The adult domains and examples were checked against the supplied *Defence and Veteran Family Wellbeing Strategy 2025–2030* and First Action Plan. The recovered 39 headings belong to the earlier *From Challenges to Solutions* synthesis of several sources, not an official 39-item Strategy list. The fuller source inventory distinguishes stated needs from gaps inferred from policy actions. It is a team reference, not a flat respondent checklist.

Examples aid recognition but are not exhaustive and do not produce separate counts for every detail mentioned. The national Strategy is not a validated questionnaire or evidence of NT prevalence or LC programme entitlements. See the source mapping for page-level evidence.

## Completion resource

Set `title` and the public HTTPS `url` in `thank-you-resource.js` when the team has made the resource. Until then the inactive button says Available soon. The same link is used for everyone completing the questionnaire, including optional blanks and earlier-experience respondents. It appends no answers or participant ID, collects no email and opens without a referrer. No resource content has been invented.
