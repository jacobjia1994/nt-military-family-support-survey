# Greater Darwin Defence Family Support Survey

A formal questionnaire for Lutheran Care’s internal team review. The project is service consultation. The participant interface uses the intended formal wording and LC branding; the current build holds entries in page memory and has no response receiver. Finishing does not transmit a response or claim that LC has received it.

**Preview boundary:** this branch prepares the issue-prompt revision for the existing public GitHub Pages preview. Publication makes the questionnaire viewable for review; it does **not** open response collection. The page has no receiver or persistent answer store, and answers entered here are not sent to Lutheran Care. The page itself shows its deployed revision; do not infer collection status from a public link.

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

1. The invitation retains adult, 8–17 and 7-or-younger choices, with the existing age-appropriate participation and permission steps. Before agreement, it prominently explains that this public version is a preview and answers are not sent or saved. Adults and young people give ADF relationship and optional residential area/suburb.
2. Near the start of the substantive route, adults see **17 family-life issues** and young people see **eight age-appropriate issues**. They can select the issues they want to talk about, including an Other issue. The list helps recall positive experiences, difficulties and future ideas; it is not a checklist of diagnosed needs. An unselected issue does not mean “no need”.
3. **Each selected issue opens one dedicated question page.** Its opening prompt fits that issue. Within it, the respondent can describe an experience or future idea, write without choosing either label, add another entry on that issue, or move on without detail. A connected story need only be told once even if it relates to several issues. The normal entry has one optional story and one distinct optional keep/change answer. Help status appears only on applicable, explicitly chosen experience pages; adult safety and bereavement pages omit it. Extra detail, wording help and one offer-specific practical question remain conditional. A future-only idea does not require a past help-seeking account. No generic support-format list or Berrimah attendance question repeats across issues.
4. Up to **100 active entries across all issues** can be retained. This is a technical ceiling, not a suggested number. Existing entries remain editable/removable, empty drafts do not consume a slot, and the limit does not silently discard answers.
5. With two or more described changes, one optional free-text priority explanation appears after the issue pages. Review shows compact entries. **Finish preview** clearly says answers were not sent or saved; the interview request and support finder remain independent optional links.

The adult/youth substantive instrument is schema **8.1**, revision **2026-09-28-issue-cued-accounts**. It stores initial selections in `answers.issue_cues`, optional Other text in `answers.issue_other`, and substantive entries in `answers.accounts`. Entries made under a selected issue carry `topic_id`; a voluntary uncategorised entry can omit it. It supersedes the earlier schema 8.0 free-entry start while preserving concise conditional account questions. Schema 7.2 topic-linked answers are also not comparable by default. See [FLOW_REDESIGN.md](FLOW_REDESIGN.md) for branch and export details.

## Scope and recall

The consultation covers **Greater Darwin, including Litchfield**. The optional broad-area question shows three primary radio choices: **Darwin**, **Palmerston** and **Litchfield**. A lower-emphasis **Other area** disclosure holds the other Greater Darwin area, outside-area and declined-answer choices. It starts collapsed unless a secondary choice is already selected; no answer is preselected. Choosing a local area reveals an optional suburb dropdown containing only its suburbs/localities, alphabetically ordered. The existing 100-name catalogue and regional mapping are retained in `geography.js`. An unlisted suburb/locality can be entered as optional Other text. Leaving the suburb dropdown blank preserves the broad-area answer; Palmerston alone never means Palmerston City. Changing area clears the previous suburb and its Other text. See `GEOGRAPHY_SOURCES.md`.

Current/former ADF members and the existing partner, child, parent, other-family/carer relationships remain invited. The former military-force and local service-date questions are removed; no overseas-service transfer question is added. Residence now controls geography routing:

- A Greater Darwin broad area, with or without a suburb: main questionnaire (`current_local`).
- Undisclosed broad area: main questionnaire (`residence_unspecified`); do not infer confirmed local residence.
- Outside Greater Darwin with previous local residence: historical comments, then review (`earlier_experience`). If past residence is uncertain, declined or blank, this historical space remains available without marking prior residence confirmed.
- Outside Greater Darwin and explicitly never lived locally, or no invited ADF relationship: scope explanation.

These routes define consultation participation, not programme-benefit eligibility. A local family is not excluded because the member served elsewhere or ceased service over a year ago.

Experience accounts refer to time living in Greater Darwin during the past 12 months for adults or three months for youth, or since arrival if shorter. Future-only ideas have no past recall window. Historical comments from people now outside Greater Darwin are separate. Adult residence duration counts the current or most recent stay, not accumulated postings. Page count follows accounts actually added, from zero to 100; it is not a 100-step target.

## Answer model and interpretation

Adult/youth records carry schema `8.1`, respondent-perspective and residence-route metadata, local geography precision, ordered selected issues, and an ordered `answers.accounts` array of 0–100 active entries. Each entry has a stable ID, `kind` (`experience`, `future` or `unspecified`), optional `topic_id` when issue-linked, optional story and useful-change text, and applicable optional branch fields. `unspecified` means the person wrote a substantive answer without choosing a type; it is not classified as a past experience by inference. A selected issue without an entry remains a selected cue, not a substantive account. An uncategorised voluntary entry must not be assigned a topic merely because that issue was selected elsewhere. `help_status` belongs only to eligible experiences and uses non-overlapping useful-help categories for the situation; adult safety and bereavement pages omit it. Helped/difficult detail requires explicit expansion where available. A proposal-type helper changes the wording of the same change box. Practical detail requires a described eligible help or activity, possibly already described in a future story, and explicit opt-in. Internal drafts, the next-ID counter and stale hidden answers are omitted from export. A future-only response has no past recall-month marker.

The 100-entry limit applies to **active** accounts and prevents a 101st add without overwriting or truncating answers. Removing an entry frees a slot; a replacement gets a new ID while surviving entries keep theirs. The youth route uses age-appropriate wording but the same account structure. The separate under-7 guardian-supported form remains schema 1.3, with child expression and guardian observation kept distinct.

Reports count response records, initial issue selections and substantive account entries separately. One response with several accounts is one response, not several people or families. A checked issue is a topic the person chose to discuss, not a measured unmet need; checked-but-blank and unselected issues have different meanings. For respondent-level themes, count a response once even if several accounts mention the theme; account-level counts can separately describe situations. Keep missing, skipped, explicit negative, unsure and declined answers distinct. [ANALYSIS_PROTOCOL.md](ANALYSIS_PROTOCOL.md) governs denominators, geography and historical-route separation. The fictional results page illustrates an older instrument and does not analyse schema 8.1 responses.

Adult long answers retain 5,000 characters; youth long answers use 1,500. Optional content may be skipped. Participation and ADF connection requirements remain.

## Participation and privacy

The invitation page presents an adult-first choice and reveals the two under-18 routes only when selected; each route’s participation choices still appear inline. Adults and 15–17-year-olds give their own informed agreement. Ages 8–14 first have guardian permission, followed by their own assent. Ages 8–17 answer **Is anyone helping you read or write your answers?** with **No, I am answering myself**, **Yes, my parent or guardian** or **Yes, someone else**. For ages 8–14, self/other assistance requires a guardian-presence confirmation before substantive questions. This is the open online form’s design policy, not a universal legal requirement or a statement that other helpers are unlawful. For ages 15–17, another helper does not cause a guardian block.

Children aged 7 or younger first have a short parent/guardian background step: ADF family connection, optional child area followed by an optional suburb/locality, and optional 0–4/5–7 age band. The expressions page defines “here” as living in Greater Darwin, then shows four optional child-response boxes followed by **Your observations**. There is no response-mode selector. The child boxes become editable only after the adult confirms the child wants to join in; guardian observations need guardian permission but not child willingness. Unchecking willingness clears only child responses. The schema 1.3 `young_child_supported` export, revision `2026-09-27-area-priority`, includes geography metadata, derives its response basis from actual child responses and never claims child assent for an observation-only record. These perspectives remain separate from older respondents’ answers. Anyone needing help with understanding, authority or safe guardian involvement can speak with an LC worker. The public form does not fabricate worker approval. Seven is a practical response-design boundary, not a universal ability or legal age. Eighteen is adulthood; the use of fifteen is an operational capacity approach, not a universal statutory consent age. Follow the staff procedure for individual assessment, assistance and safeguarding.

The separate interview-request form offers self and parent/guardian routes, including a limited explanation request for under-15s. A guardian supplies their own contact details. These arrangements do not replace the questionnaire's permission and assent process. See [CONTACT_FORM.md](CONTACT_FORM.md).

No names, contact details or response-retrieval codes are requested in the questionnaire. The preview notice before consent and the completion screen state that answers entered on this site are not sent to LC or saved by the page. Any description of future LC use, storage, access or withdrawal is conditional on a receiving arrangement LC has actually established; this preview cannot be used to submit an answer. The general LC access, correction and complaint route remains available for records LC may hold elsewhere.

The questionnaire footer and preview end screen link to the separate contact form in a new tab, without answers or participant identifiers. Contact details are not linked to questionnaire responses. A story, suggestion or practical preference is not permission for follow-up.

Neither form has a receiving endpoint, application analytics, cookies or persistent answer store. The completion screen offers the separate interview request and support finder; it does not offer answer downloads or a return to the review screen. The contact form does not export personal details. GitHub Pages itself logs visitor IPs for security. Real responses do not belong in this repository or personal development directories. Exported questionnaire consent records carry `context: internal_review`; they are not evidence of fieldwork approval. Before real collection, LC must confirm and implement the receiving system, access, any overseas processing, retention arrangements and safe-contact procedure. See [LEGAL_REVIEW.md](LEGAL_REVIEW.md).

## Collection and migration

The receiving platform remains undecided. Any candidate platform must demonstrate the selected-issue pages, Other route, selected-but-blank distinction and 0–100 repeatable, editable entries with complete export in a working prototype. If it cannot, the custom front end can be retained with an LC-owned approved receiver. The current changes activate neither. [COLLECTION_HANDOFF.md](COLLECTION_HANDOFF.md) describes ownership, prototype checks, source data, exports and launch verification. The IT handoff package includes `question-bank.json` and `frontend-source.zip` under `outputs/LC_IT_handoff` in the delivery workspace; the source archive identifies its built commit. The field bank describes this revision, not a live collection endpoint.

## Development and source material

Run `node --test tests/*.test.mjs` to include the questionnaire, contact form and younger-child module. Run `node scripts/export-copy.mjs` followed by `node scripts/render-adult-copy.mjs` to regenerate the adult reading copy from the current definitions, including conditional variants and the complete locality list. The renderer preserves the established style and consent shell; locality options expand for printing. Local preview: `python3 -m http.server 8174 --bind 127.0.0.1`.

LC logo and self-hosted Karla sources/licence are in `assets/`. GitHub Pages serves the repository root from main.

The adult issue labels and examples were checked against the supplied *Defence and Veteran Family Wellbeing Strategy 2025–2030* and First Action Plan. The 17 adult labels are now a grouped respondent-facing memory prompt; the eight youth labels use age-appropriate wording. The recovered 39 headings belong to the earlier *From Challenges to Solutions* synthesis of several sources, not an official 39-item Strategy list. The fuller inventory distinguishes stated needs from gaps inferred from policy actions and is a team reference, not the respondent checklist.

Examples aid recognition but are not exhaustive and do not produce separate counts for every detail mentioned. The national Strategy is not a validated questionnaire or evidence of NT prevalence or LC programme entitlements. See the source mapping for page-level evidence.

## Free resource and interview link

The title is **Defence Family Support Survey**, the greeting is **Hello, Defence community!**, and the introduction names **Greater Darwin**. Answer-length hints and the duplicate earlier-experience introduction are removed. The end screen says **You have reached the end of this survey preview** and **Your answers were not sent or saved**. Two independent blocks explain the interview and free guide separately. Their equally styled red/white buttons read **Request an interview** and **Find support in a few clicks**; they align on desktop and stack on mobile.

`support.html` is the free, standalone NT-wide support finder. It is linked from the questionnaire completion screen and the interview form, and can be opened directly without taking part in either. `thank-you-resource.js` uses the exact first-party `support.html` path; both links open without sending answers, contact details or participant IDs. External service links point to the providers’ official pages.

The current finder uses seven support domains and visible questionnaire-style radio choices. It asks one relevant question at a time, then shows a suitable first contact and short alternatives. There are no dropdowns or topic search. Child age bands are conditional rather than always displayed. Urgent help remains in the footer and context-specific safety routes.

Maintain `support-paths.mjs` for the current question flow and matching, `support-model.mjs` for established base routes, and `support-catalog.mjs` / `support-expanded.mjs` / `support-referrals.mjs` for officially sourced contact records. Do not infer eligibility from a broad family label or call paid onward care free. `SUPPORT_COVERAGE.md` documents the scope and limits of the expanded local/national coverage; `SUPPORT_DESIGN.md` records the design reasoning and corrected real-world scenarios. Run `node --test tests/*.test.mjs` before publication.

The approved review corrections separate mental-health purpose from optional support preferences, prune irrelevant location questions, preserve the requested service type in fallback results, and make printed online contacts usable. Regression cases are in `tests/support-review-fixes.test.mjs`.


## Interview request update — 27 September 2026

The interview preview is one form plus review. It asks explicitly and separately for **discussion topic**, **interview format** and **suggested interview date/time**, alongside the contact details needed to arrange it. A mobile is mandatory; email is optional. Only **Under 18 / 18 or older** are used. A guardian request already identifies the child as under 18 and does not repeat the age question. Professionals and adults discussing parenting experience choose Me.

A brief, non-sensitive topic and scheduling preferences are available on every valid route. Under-18 contact requests still require LC to establish understanding, suitable permission and willingness before the interview; the form does not make that decision. One optional contact/access-needs field handles practical constraints. Suggested dates are not confirmed appointments, and arranging a time by the chosen channel is not an extra interview. The stable field-purpose contract is in PRODUCT.md and CONTACT_FORM.md.

- [Interview team guide and message templates](INTERVIEW_TEAM_GUIDE.md)
- [Institutional receiving and scheduling proposal](INTERVIEW_RECEIVING_PROPOSAL.md)

LC has not chosen a receiver. The suggested first release uses LC’s own approved form service, restricted ownership, a separate small scheduling log and a coordinator/backup. The GitHub page explicitly sends nothing and books no appointment.
