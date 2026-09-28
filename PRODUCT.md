# Greater Darwin Defence Family Support Survey

<!-- impeccable:product-schema 1 -->

## Platform

web

## Purpose and users

This questionnaire supports Lutheran Care’s Defence family support consultation in Greater Darwin, including Litchfield. It needs to identify useful support, experiences worth preserving, current difficulties and workable participation arrangements. The interface uses formal LC branding. It has one adult questionnaire, one shorter shared questionnaire for ages 8–17, and a parent/guardian-supported form for children aged 7 or younger.

Jacob clarified that the written survey is the main broad feedback channel because staffing limits interviews. **Let respondents add their own connected experiences or future ideas, with room for up to 100 active accounts.** The usual account remains brief; extra detail is optional. This replaces the earlier selected-domain depth rule and the one-focus youth loop.

## Operating context and collection

The dependency-free HTML/CSS/JavaScript implementation is available through the existing GitHub Pages team-review link. Actual response collection has not been connected; finishing must not claim LC received the answers. Entries remain in page memory, without application tracking or persistent browser answer storage. The 136 fictional results illustrate a historical instrument and are separate from current answers.

LC may rebuild the main survey and independent interview request in its Microsoft Forms tenant, or host the current front end with an LC-approved receiver. This remains an open institutional choice. [COLLECTION_HANDOFF.md](COLLECTION_HANDOFF.md) gives the proposal, working-prototype checks and portable data contract. A platform decision must preserve meaningful questions, full optional adult detail, age/permission paths, stable IDs and safe-contact instructions. No receiver, account or storage system is activated by the current design changes.

The release uses adult/youth schema `8.0`, revision `2026-09-28-respondent-accounts`, and younger-child schema `1.3`, revision `2026-09-27-area-priority`. The IT delivery includes a question bank and source archive built from the recorded commit. The source archive is a portable front end, not an already configured collection system.

## Respondent experience

This must feel like a questionnaire, not a general website. Use the LC logo and quiet header, restrained familiar controls, natural Australian English and a readable phone/keyboard experience. Keep team resources on separate URLs; omit general site navigation and results links from the respondent flow. Provide necessary purpose, encouragement, voluntary-participation and privacy information without generic legal waivers or invented commitments.

Make question text, choices and conditional variants available for human review. Back navigation retains relevant answers; a changed routing answer removes only dependent content. Adding another source in the same help-seeking branch preserves barriers already selected. The review shows supplied answers without a wall of unanswered items. The final button says **Finish preview**, and the end screen explicitly states that answers were not sent or saved.

## Invitation and participation

The title is **Defence Family Support Survey**; greeting **Hello, Defence community!**; introduction **Lutheran Care would like your help to plan its Defence Family Support Program in Greater Darwin.** The funding line states that LC received funding from Defence Member and Family Support, a branch of the Commonwealth Department of Defence, to deliver this project; it does not imply an unverified partnership.

Explain why people's own experience matters, welcome successful support and those not seeking help, and invite family members to contribute their own perspectives. Avoid promises of particular services or policy changes. Do not reinstate answer-length hints such as “A sentence or two is enough.” Retain necessary privacy guidance and ordinary Optional indicators.

Adult (18 or older) appears first on the invitation page; Child or young person (under 18) reveals 8–17 and 7 or younger. No route is preselected. Within 8–17, a compact 8–14/15–17 choice determines permission arrangements, not a different substantive questionnaire. Participation information is visible inline in smaller readable type beside the choices, not available only in a dialog.

Adults and 15–17-year-olds give their own informed agreement. For 8–14, guardian permission and the young person's own assent start unchecked. The assistance question identifies self, parent/guardian or another helper; the unattended self/other-assisted route includes guardian-presence confirmation. A private LC-assisted channel remains where guardian involvement would be unsafe or difficult. Permission, help writing answers and proxy observations are distinct; a helper must not choose the child's answers. Changing age or withdrawing permission clears incompatible material.

The notice describes purpose, intended custody and authorised access, de-identified reporting, voluntary participation, relevant sensitivity, retention/withdrawal limits and privacy/access/complaint contacts. It does not promise absolute anonymity or confidentiality. Actual custody and processing statements must match the receiver LC selects. Use [consultation-procedure.md](consultation-procedure.md), [LEGAL_REVIEW.md](LEGAL_REVIEW.md) and [CHILD_PARTICIPATION_REVIEW.md](CHILD_PARTICIPATION_REVIEW.md) for the relevant operating basis; do not invent worker approval in an unattended form.

## Scope and question order

The consultation covers Greater Darwin including Darwin, Palmerston, Litchfield, East Arm and Robertson Barracks. Adults and youth give ADF relationship and may choose a broad residential area followed by an optional matching suburb/locality. Darwin, Palmerston and Litchfield remain the visible primary area choices; other local, outside and declined choices sit under Other area. A broad area is a valid answer without a suburb, and Palmerston alone is not Palmerston City. Scope follows residence, not the service location or date of an ADF member. A person now outside Greater Darwin may share earlier local experience on a separate historical route. Undisclosed residence continues without being labelled confirmed local.

Simple background precedes substantive content. Adults may add age band and residence duration; young people identify help with reading or writing. There is no global community-connection essay before the accounts. Current/former ADF members and the existing partner, child, parent, wider-family/carer relationships remain invited. The military-force question and old service-date gate stay removed.

For the adult and 8–17 main route, **one respondent-chosen experience or future idea is the unit of follow-up**. The person can add no account, or up to 100 active accounts. One connected story stays one account unless they choose another. The number 100 is a technical ceiling, never a respondent target, and a full list cannot be silently overwritten or truncated. The previous two 17-topic checklists and global participation menu are superseded. Analysts may apply multiple topic tags after reading an account; respondents do not have to classify their situation to continue.

An experience asks one optional narrative in the local 12-month adult or three-month youth period, an optional support-status choice about useful help for that situation, and one distinct optional keep/change answer. Status choices separate enough help, some but insufficient help, no useful help despite trying, no useful help when it was needed but not sought, and no help needed. A future idea asks about what is coming up without inventing a past help-seeking history. Extra helped/difficult detail opens only on request and appears before useful change. An optional wording helper relabels the *same* change box. A future proposal already described in the first box can support practical detail without repetition in the second. An eligible information help, conversation, activity or practical component of a mixed suggestion plus explicit opt-in gates one free-text question. A process-only suggestion does not trigger attendance or venue questions, and no activity is assumed to occur at the Lutheran Care Berrimah office.

After an account, the person may add another, edit or remove any account. Empty abandoned drafts do not consume a slot. Surviving account IDs and answers remain stable; removing one frees a slot and a replacement receives a fresh ID. With no account, an optional final note is available. With one account, the person goes to review without another global catch-all. With two or more described changes, one optional free-text priority question appears; there is no ranking list of 100 accounts. Review uses compact account cards with Edit and Remove access through management. **Finish preview** confirms answers were not sent or saved. The interview request and free support guide are separate next steps, not survey-contact linkage.

See [FLOW_REDESIGN.md](FLOW_REDESIGN.md) for the exact fields, branch rules and export contract.

## Younger-child form

After guardian permission, a short background step records ADF family connection and optional child broad area and suburb/locality, and 0–4/5–7 age band. An explicit No ADF connection gets a scope explanation; Yes or unsure continues. Preserve geography metadata and distinguish outside/undisclosed responses in analysis.

The next page explains that “here” means living in Greater Darwin. Four child-expression boxes and Your observations are shown together without a response-mode selector. Child willingness enables child-expression fields; guardian observations remain available without claiming child assent. Unchecking willingness clears expressions only. The review/export infers expression versus observation basis from actual answers. No names or uploads are added, and these records are not pooled as equivalent adult/youth self-report.

## Separate interview request and completion

`contact.html` arranges a service-consultation interview with LC and operates independently. It receives no survey answers or response identifier; questionnaire completion is not required. Adults and young people can request appropriate contact; a guardian provides their own details for a child. Under-15 self-requests are limited to arranging an explanation. Staff establish understanding, appropriate permission and willingness before an interview.

Keep the preferred name, phone, explicit call/text-first choice and agreement, optional contact instructions and topic, and separate default-off voicemail permission. Do not add email, address, date of birth, rank or service number. Safe first contact must follow the selected method. No interview contact destination changes without LC confirmation. See [CONTACT_FORM.md](CONTACT_FORM.md).

The end screen says **You have reached the end of this survey preview** and **Your answers were not sent or saved**. Two independent blocks explain the optional actions. The interview block asks **Would you like to discuss your experiences and support needs further with Lutheran Care?**, followed by **Request an interview**. The other block describes the free guide, followed by **Find support in a few clicks**. Buttons match in LC red/white, size and desktop bottom alignment; blocks stack on mobile. There is no shared free-guide introduction, duplicated guide title, Save my answers or post-completion Review my answers. Links open independently without answers or identity markers.

## Interpretation and reporting

[ANALYSIS_PROTOCOL.md](ANALYSIS_PROTOCOL.md) applies to every statistical result. Report response records and participant perspectives, not unique households or population prevalence. Distinguish an account count from a respondent count: one person can contribute several experiences, and respondent-level theme counts include a response once per theme. Preserve age path, local versus historical route, account kind, recall period for experiences only, and child versus guardian voice. Blank, declined, not asked and explicit No are different states. A future-only idea has no past recall-window metadata. Broad-area-only answers contribute to that area but never to a specific suburb.

Schema 7.2 global topic and format answers are not silently comparable with schema 8.0 accounts. Survey entries, targeted interview statements, and pretest observations remain mode-tagged; do not pool unlike raw counts. Tests and fictional results never enter a live cohort. LC and the team retain programme, collection and publication decisions; ordinary reversible implementation and documentation corrections are delegated.

## Free support finder

`support.html` is a standalone resource for NT Defence members, veterans and families. No survey participation, identity details or sign-up is required. The navigator remains separate from the consultation instrument. Publication uses the existing authorised GitHub Pages site during team review; LC will determine the final production host.

Jacob rejected the first 26 September release despite its technical tests: the homepage mixed help methods, audiences and life events; dropdowns hid choices; all child age bands were unnecessarily exposed; and verifying the selected catalogue had not established sufficient resource coverage. These corrections supersede the previous eight-task/dropdown design.

The current homepage uses seven consistent domains: mental health/grief; relationships/safety; parenting/school/childcare; money/housing; work/study/transition; medical care/disability/caring; and social connection. Cross-links connect plausible alternate entry points to the same matching path. Children’s emotional support has one age-aware route; the parenting page links there rather than duplicating it.

Jacob’s latest 27 September instruction replaces the one-question-per-page flow with progressive questions on the same topic page. Each question exposes its native radio choices; selecting an answer reveals the next relevant question below it. Answered questions remain visible and editable, and matching results appear automatically once the required choices are complete. There is no forced Continue step between questions. Only choices that affect the route are asked, including the necessary 5/12/18/25 provider boundaries; broad family identity is not proof of every benefit entitlement.

Edits clear incompatible downstream eligibility answers while preserving independent choices. If a change introduces a new required question, stale recommendations are removed until that question is answered. Updating the page must preserve the active native control, keyboard focus and the user’s reading position instead of jumping to the next question or result. Jacob has explicitly authorised direct publication of the completed support revision to the existing GitHub Pages site after verification; this supersedes the earlier review-only or no-publication boundary for this support work. Preserve unrelated survey and contact-form changes already on the remote branch.

`support-paths.mjs` defines the current questions and matching; `support-model.mjs` remains a tested base resolver for established offers. `support-catalog.mjs` and `support-expanded.mjs` contain source-bound contact records. Source coverage is assessed by actual need, relationship, place and delivery mode, not a provider count. `SUPPORT_COVERAGE.md` states coverage and limits. The old 39-topic inventory remains research history and is not the public menu.

Urgent contacts stay in the footer, with context-specific safety contacts. Answers stay in page memory; no personal choices enter URLs or external service links. Browser history may retain visited task pages. A technical pass does not establish Jacob’s subjective acceptance or recruited-user validation.

## Approved review fixes — 26 September 2026

Jacob approved implementation of the six findings in the read-only review of release 12a6296. The seven homepage domains and native controls remain. Mental-health need selection now contains only five difficulties; anonymous, LGBTIQA+, cultural and men's support are optional, combinable preferences beside results and do not replace the original need. Legacy specialist links remain usable.

Region is omitted when it cannot change a contact or access requirement, and becomes NT/outside-NT when that is the only relevant distinction. Adult grief uses a single adult band. A serving member's own medical-travel enquiry no longer asks NT residence. Alice Springs local Aboriginal wellbeing can lead to verified Congress services after the relevant audience check. Recent-arrival travel enquiries use Patient Travel Office guidance with the residency boundary stated, never a Medicare-claims substitute.

The former mobile Continue treatment is superseded by the same-page progressive flow. Native choices, newly relevant questions and results remain in one reading column without forced page changes or scroll jumps. Primary contact and hours still precede longer access details. Routine relationship selection has no crisis panel; selected safety needs retain contextual help. Printing includes usable official URLs/emails and the check date. This support revision does not change the survey or interview request forms.


The adult community-connection prompt now asks what has made connection easier or harder, giving positive and difficult experiences equal room in the same optional field. Its position and answer ID remain unchanged; the current revision retains this approved wording.

## Interview request — stable question contract, 27 September 2026

Jacob corrected the overly broad simplification: **discussion topic and suggested interview date/time are core, separate questions**, not hints buried in generic notes. The goal is enough clear information to arrange a useful conversation, not the fewest possible inputs. Do not merge or remove these core questions to shorten the page.

| Information needed | Public question / treatment | Why it is collected |
| --- | --- | --- |
| Person speaking | Who would be interviewed? Me / My child (under 18) | Determines whose permission and contact details apply; professionals and parents describing their own experience select Me. |
| Adult/minor arrangement | Your age group: 18 or older / Under 18 | Only these two groups. Guardian route already means under 18 and does not ask the same fact again. No hidden 15-year split. |
| Contact person | Name and genuine contactable mobile required; email optional | Enables the team to reach the requester. A guardian gives their own details. Email never replaces the required mobile. |
| Conversation purpose | What would you like to discuss? (child wording on guardian route) | Optional brief topic for preparation; never combine it with time or access needs. |
| Interview format | How would you prefer to be interviewed? | Optional phone/video/in person/no preference helps choose a real slot. |
| Candidate schedule | Suggested interview date and time | Optional, independent field for one or more suggestions or flexible availability; include a time zone outside the NT. A suggestion is not a booking. |
| Scheduling channel | How should we arrange a time with you? | Required call/text/email choice; scheduling is a brief exchange, not another interview. No automatic change of channel. |
| Practical constraints | Any contact or access needs? | One optional field for times not to contact, language/access needs or a support person. Do not repeat topic or suggested time here. |
| Permissions | Conditional voicemail and guardian authority; contact agreement | Contact request only; actual interview participation and recording permissions are addressed separately by LC. |
| Capacity understood | Required, initially unticked acknowledgement immediately before Review details | The project has a limited timeframe and small team, so not everyone may be contacted or offered an interview. Separate acknowledgement, not a rights waiver or additional data-use consent. |

Keep all rows above present as explicit questions where applicable. Topic, mode and suggested time remain available for both adult and under-18 requests. Prompt for only a brief, non-sensitive topic rather than an advance personal account. LC establishes understanding, appropriate permission and willingness before the interview; the binary age answer is not a blanket capacity or interview-consent finding. Existing main-survey age rules are outside this contact-form change.

The title remains **Request an interview** with LC identified in the header. Keep the concise purpose statement, omit the vague survey-completion clause and the three introductory process bullets. Use one form followed by review, which shows supplied optional information. Contact identity/channel and route changes revoke incompatible permissions. No rank, unit, detailed identity, organisation/role or home address is requested at signup. Professional perspectives can be identified in the actual interview.

This is a clearly marked team preview: entered details are not sent and no appointment is booked. Jacob wants an LC receiving proposal, not account activation. See INTERVIEW_TEAM_GUIDE.md and INTERVIEW_RECEIVING_PROPOSAL.md. Publication continues to the existing GitHub Pages site; no real participant recruitment or collection is activated. Any future shortening must preserve the information-purpose mapping above rather than use a generic “Anything else” field to hide it.

The capacity notice is headed **Interview availability** and appears in a visible, readable panel immediately above Review details, after the information/contact agreement. Copy: “Because this project has a limited timeframe and a small team, we may not be able to contact everyone to arrange an interview. Thank you for your understanding.” The separate required checkbox reads “I understand that registering does not guarantee contact or an interview.” It starts unticked on all routes, blocks review until checked, is recorded as `capacity_acknowledged` with the notice version and resets with a changed participant route. The review displays the acknowledgement. Do not bury it in small privacy text, preselect it or turn it into a disclaimer of rights.


The Your information section, its privacy text and contact-consent checkbox form one rounded light-grey panel. Interview availability and its acknowledgement form a second panel of exactly the same width, background, border, corner radius, padding, heading style and checkbox weight. Keep both vertically aligned on desktop and mobile; preserve all text and mandatory behaviour. This visual treatment was requested from Jacob’s screenshot on 27 September.
