# Greater Darwin Defence Family Support Survey

<!-- impeccable:product-schema 1 -->

## Platform

web

## Purpose and users

This questionnaire supports Lutheran Care’s Defence family support consultation in Greater Darwin, including Litchfield. It needs to identify useful support, experiences worth preserving, current difficulties and workable participation arrangements. The interface uses formal LC branding. It has one adult questionnaire, one shorter shared questionnaire for ages 8–17, and a parent/guardian-supported form for children aged 7 or younger.

Jacob clarified on 27 September 2026 that the survey's depth is important because staffing limits the number of interviews. **Retain optional detail for every selected adult need.** The purpose is to provide useful prompts and space, not require every field to be completed. The earlier proposal to limit adults to one or two detailed domains is not adopted. The accepted shorter youth design still uses one optional focus.

## Operating context and collection

The dependency-free HTML/CSS/JavaScript implementation is available through the existing GitHub Pages team-review link. Actual response collection has not been connected; finishing must not claim LC received the answers. Entries remain in page memory, without application tracking or persistent browser answer storage. The 136 fictional results illustrate a historical instrument and are separate from current answers.

LC may rebuild the main survey and independent interview request in its Microsoft Forms tenant, or host the current front end with an LC-approved receiver. This remains an open institutional choice. [COLLECTION_HANDOFF.md](COLLECTION_HANDOFF.md) gives the proposal, working-prototype checks and portable data contract. A platform decision must preserve meaningful questions, full optional adult detail, age/permission paths, stable IDs and safe-contact instructions. No receiver, account or storage system is activated by the current design changes.

The release uses adult/youth schema `7.0`, revision `2026-09-27-local-experience-and-programmes-r2`, and younger-child schema `1.2`, revision `2026-09-27-background`. The IT delivery includes a question bank and source archive built from the recorded commit. The source archive is a portable front end, not an already configured collection system.

## Respondent experience

This must feel like a questionnaire, not a general website. Use the LC logo and quiet header, restrained familiar controls, natural Australian English and a readable phone/keyboard experience. Keep team resources on separate URLs; omit general site navigation and results links from the respondent flow. Provide necessary purpose, encouragement, voluntary-participation and privacy information without generic legal waivers or invented commitments.

Make question text, choices and conditional variants available for human review. Back navigation retains relevant answers; a changed routing answer removes only dependent content. Adding another source in the same help-seeking branch preserves barriers already selected. The review shows supplied answers without a wall of unanswered items. The final button remains **Confirm and submit**, but that formal label does not itself establish receipt.

## Invitation and participation

The title is **Defence Family Support Survey**; greeting **Hello, Defence community!**; introduction **Lutheran Care would like your help to plan its Defence Family Support Program in Greater Darwin.** The funding line states that LC received funding from Defence Member and Family Support, a branch of the Commonwealth Department of Defence, to deliver this project; it does not imply an unverified partnership.

Explain why people's own experience matters, welcome successful support and those not seeking help, and invite family members to contribute their own perspectives. Avoid promises of particular services or policy changes. Do not reinstate answer-length hints such as “A sentence or two is enough.” Retain necessary privacy guidance and ordinary Optional indicators.

Adult (18 or older) appears first on the invitation page; Child or young person (under 18) reveals 8–17 and 7 or younger. No route is preselected. Within 8–17, a compact 8–14/15–17 choice determines permission arrangements, not a different substantive questionnaire. Participation information is visible inline in smaller readable type beside the choices, not available only in a dialog.

Adults and 15–17-year-olds give their own informed agreement. For 8–14, guardian permission and the young person's own assent start unchecked. The assistance question identifies self, parent/guardian or another helper; the unattended self/other-assisted route includes guardian-presence confirmation. A private LC-assisted channel remains where guardian involvement would be unsafe or difficult. Permission, help writing answers and proxy observations are distinct; a helper must not choose the child's answers. Changing age or withdrawing permission clears incompatible material.

The notice describes purpose, intended custody and authorised access, de-identified reporting, voluntary participation, relevant sensitivity, retention/withdrawal limits and privacy/access/complaint contacts. It does not promise absolute anonymity or confidentiality. Actual custody and processing statements must match the receiver LC selects. Use [consultation-procedure.md](consultation-procedure.md), [LEGAL_REVIEW.md](LEGAL_REVIEW.md) and [CHILD_PARTICIPATION_REVIEW.md](CHILD_PARTICIPATION_REVIEW.md) for the relevant operating basis; do not invent worker approval in an unattended form.

## Scope and question order

The consultation covers Darwin, Palmerston, Litchfield, East Arm and Robertson Barracks. A searchable alphabetical selector offers 100 named localities plus Another locality in Greater Darwin, Outside Greater Darwin and Prefer not to say. It derives a broader region from named localities; Other has optional text. There is no second location question.

Current/former ADF members and the existing partner, child, parent, wider-family/carer relationships remain invited. The military-force question stays removed and no overseas-service-transfer question is added. The previous local service-date gate is replaced by residence routing: local and undisclosed residence reach the main questionnaire; an outside respondent can offer earlier local experience; explicitly never living locally leads to the scope explanation. Uncertain or declined past residence may use the historical space without being labelled confirmed past residence. This concerns consultation, not service entitlement. A current local family is not excluded just because the member served elsewhere or left service more than a year ago.

Simple background precedes open reflection. Adults give ADF relationship, optional locality and age band, then optional current/most-recent residence duration and positive connection experience. Youth give relationship, locality and assistance before their positive question; they have no separate residence-duration page. Adult age bands 18–29, 30–39, 40–49 and 50+ do not alter routing. Historical comments explicitly concern earlier Greater Darwin experience.

Past needs concern only time living in Greater Darwin within the past 12 months for adults or three months for youth; recent arrivals consider time since arrival. The needs inventory retains its 17 adult domains plus Something else, pending the team's discussion. No/declined/blank past need status skips detail but still leads to future support and participation questions. Yes/Not sure opens the checklist. Met needs and successful support remain relevant.

For each selected adult area, order questions as support received → help sought and barriers → account of the experience → support wanted now. All detail remains optional. Youth preserve all checked needs plus an optional single focused account. No current support request does not mean past experience is irrelevant, and adequate past support does not exclude a new request.

## Programme and participation decisions

All main-route adults/youth reach **What could help next?** It asks about parenting, time apart, settling, connecting with others, playgroups, finding services and other ideas. An optional priority among multiple programme interests is separate from the needs inventory and never restricts detailed answers.

The optional adult child-age question appears only for parenting/playgroup or childcare/schooling/parenting-and-caring selections. It distinguishes under 5, 5–11 and 12–17, with no under-18 caring and declined alternatives. Do not ask it of every participant or confuse it with being the parent of an ADF member.

**Taking part** replaces the earlier information/advice-format question with actual participation formats. Synchronous choices reveal suitable times; in-person choices reveal optional Berrimah access and any adjustment/location explanation. Participation enablers capture work/shift timing, flexibility, children/caring, transport, online alternatives, language, accessibility and comfortable engagement. A self-guided preference does not hide other selected ways to participate. These answers are planning preferences, not contact permission or service bookings.

See [FLOW_REDESIGN.md](FLOW_REDESIGN.md) for exact fields, branch rules and answer cleanup.

## Younger-child form

After guardian permission, a short background step records ADF family connection and optional child locality and 0–4/5–7 age band. An explicit No ADF connection gets a scope explanation; Yes or unsure continues. Preserve geography metadata and distinguish outside/undisclosed responses in analysis.

The next page explains that “here” means living in Greater Darwin. Four child-expression boxes and Your observations are shown together without a response-mode selector. Child willingness enables child-expression fields; guardian observations remain available without claiming child assent. Unchecking willingness clears expressions only. The review/export infers expression versus observation basis from actual answers. No names or uploads are added, and these records are not pooled as equivalent adult/youth self-report.

## Separate interview request and completion

`contact.html` arranges a service-consultation interview with LC and operates independently. It receives no survey answers or response identifier; questionnaire completion is not required. Adults and young people can request appropriate contact; a guardian provides their own details for a child. Under-15 self-requests are limited to arranging an explanation. Staff establish understanding, appropriate permission and willingness before an interview.

Keep the preferred name, phone, explicit call/text-first choice and agreement, optional contact instructions and topic, and separate default-off voicemail permission. Do not add email, address, date of birth, rank or service number. Safe first contact must follow the selected method. No interview contact destination changes without LC confirmation. See [CONTACT_FORM.md](CONTACT_FORM.md).

Completion says **Thank you for helping strengthen the Defence community in Greater Darwin.** Two independent blocks explain the optional actions. The interview block asks **Would you like to discuss your experiences and support needs further with Lutheran Care?**, followed by **Request an interview**. The other block describes the free thank-you guide, followed by **Find support in a few clicks**. Buttons match in LC red/white, size and desktop bottom alignment; blocks stack on mobile. There is no shared free-guide introduction, duplicated guide title, Save my answers or post-completion Review my answers. Links open independently without answers or identity markers.

## Interpretation and reporting

[ANALYSIS_PROTOCOL.md](ANALYSIS_PROTOCOL.md) applies to every statistical result: report response records and participant perspectives, not unique households or population prevalence. Preserve recall windows, locality/residence routes, age paths and child/guardian voice. Show each finding's denominator and distinguish blank, declined, not asked and No. Selected needs remain recorded when their optional detail is blank. Locality counts inform planning among responses received, not neighbourhood prevalence rankings. Extracted charts/slides carry the reporting context with them.

Questionnaire meaning and IDs must survive migration. The old information/advice measure is not automatically comparable with new participation preferences. Tests and fictional results must never be merged into the live cohort. LC and the team retain genuine programme, collection and publication decisions; ordinary reversible implementation and documentation corrections are delegated.

## Free support finder

`support.html` is a standalone resource for NT Defence members, veterans and families. No survey participation, identity details or sign-up is required. The navigator remains separate from the consultation instrument. Publication uses the existing authorised GitHub Pages site during team review; LC will determine the final production host.

Jacob rejected the first 26 September release despite its technical tests: the homepage mixed help methods, audiences and life events; dropdowns hid choices; all child age bands were unnecessarily exposed; and verifying the selected catalogue had not established sufficient resource coverage. These corrections supersede the previous eight-task/dropdown design.

The current homepage uses seven consistent domains: mental health/grief; relationships/safety; parenting/school/childcare; money/housing; work/study/transition; medical care/disability/caring; and social connection. Cross-links connect plausible alternate entry points to the same matching path. Children’s emotional support has one age-aware route; the parenting page links there rather than duplicating it.

Each question shows its full set of native radio choices with a Continue button. Selecting a radio does not change pages. Only questions that affect a route are asked. Mental-health age choices initially show two adult bands and one Under 18 option. The necessary 5/12/18/25 provider boundaries remain, but child bands appear only after Under 18. Broad family identity is never treated as proof of every benefit entitlement.

`support-paths.mjs` defines the current questions and matching; `support-model.mjs` remains a tested base resolver for established offers. `support-catalog.mjs` and `support-expanded.mjs` contain source-bound contact records. Source coverage is assessed by actual need, relationship, place and delivery mode, not a provider count. `SUPPORT_COVERAGE.md` states coverage and limits. The old 39-topic inventory remains research history and is not the public menu.

Urgent contacts stay in the footer, with context-specific safety contacts. Answers stay in page memory; no personal choices enter URLs or external service links. Browser history may retain visited task pages. A technical pass does not establish Jacob’s subjective acceptance or recruited-user validation.

## Approved review fixes — 26 September 2026

Jacob approved implementation of the six findings in the read-only review of release 12a6296. The seven homepage domains and native controls remain. Mental-health need selection now contains only five difficulties; anonymous, LGBTIQA+, cultural and men's support are optional, combinable preferences beside results and do not replace the original need. Legacy specialist links remain usable.

Region is omitted when it cannot change a contact or access requirement, and becomes NT/outside-NT when that is the only relevant distinction. Adult grief uses a single adult band. A serving member's own medical-travel enquiry no longer asks NT residence. Alice Springs local Aboriginal wellbeing can lead to verified Congress services after the relevant audience check. Recent-arrival travel enquiries use Patient Travel Office guidance with the residency boundary stated, never a Medicare-claims substitute.

Long mobile questions keep Continue within reach; related links follow it. Primary contact and hours precede longer access details. Routine relationship selection has no crisis panel; selected safety needs retain contextual help. Printing includes usable official URLs/emails and the check date. These scoped changes are implemented without modifying survey or interview files.


The adult community-connection prompt now asks what has made connection easier or harder, giving positive and difficult experiences equal room in the same optional field. Its position and answer ID remain unchanged; questionnaire revision r2 records the wording change.

## Interview request — current approved design, 27 September 2026

A genuine, contactable mobile is mandatory for all routes; email is optional and cannot replace it. Number-format checks do not verify ownership or reachability. The selected scheduling channel controls how LC may arrange the interview: call, text or email. Email becomes selectable only after a valid email is supplied. Contact identity/channel changes clear previous contact agreement; there is no automatic switch to another channel.

After viewing the first implementation, Jacob requested less explanation and clearer questions. The title is **Request an interview**; LC is already identified in the header. Remove the vague reference to completing “the survey” and all three introductory bullets about duration, team composition and participation procedure. These operational details belong in the invitation/start of the interview, not the signup introduction.

Use a single form followed by one review. **Who would be interviewed?** asks only **Me / My child (under 18)**. It identifies the speaker, not their role. Professionals select Me and the applicable age group, just as family members do. An adult describing parenting experience also selects Me. Do not treat a professional role as an alternative to being the person interviewed or as an age-check bypass.

The signup collects name, required mobile, optional email, preferred scheduling channel, optional contact instructions, optional interview format and one optional notes field for useful timing, topic or practical arrangements. Do not collect separate ADF relationship, organisation/role, availability or participation-needs fields at this stage. Establish relevant background in the actual interview. The under-15 self route omits interview format and substantive notes; the existing guardian declaration, age-specific agreement and safe-contact rules remain.

Scheduling is a short exchange to agree a time, often a text or email using the chosen channel. It is not a preliminary interview and does not require a separate confirmation call. Keep interview format because it affects real arrangements; use plain labels and omit repeated explanations of how it differs from scheduling. Review shows relevant supplied information instead of a list of blank optional fields.

The contact surface remains a clearly marked team preview, uses invented details, sends nothing and books no appointment. Finish preview is the final action until LC chooses a receiver. Jacob has asked for a convenient stable proposal, not account activation. See INTERVIEW_TEAM_GUIDE.md and INTERVIEW_RECEIVING_PROPOSAL.md. The public interview link continues to use the existing GitHub Pages site; no institutional account, participant recruitment or real collection is activated. Other survey/support behaviour remains outside this change.
