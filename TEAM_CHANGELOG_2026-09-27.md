# Team design decisions — 27 September 2026

This note records Jacob's decisions following the comprehensive survey review. It supersedes conflicting recommendations from that review. It is a project decision record, not a claim that a collection platform has been selected or real responses have been collected.

## Current correction — 29 September 2026: adopt the RAND sample questionnaire itself

Jacob clarified that the previous v9/v10 sites borrowed RAND's **conceptual chain** while rewriting most respondent questions, which did not fulfil his request. The adult GitHub survey must instead retain most of the actual RAND MG-1124 Appendix A sample questionnaire's language, question designs, answer choices, numbering, page sequence and routing. Only narrow Australian Defence and Greater Darwin substitutions are allowed, with a Q1–Q67 crosswalk. The former local 9×5 problem cue list is superseded by RAND's original nine problem pages and their source-derived options. Q23–Q36 keeps the original needs, contacted/noncontacted resources, seven-characteristic matrices, personal networks, resource-specific Q35 helpfulness and Q36 loss-impact question; Q37–Q67 keeps applicable background, service-attitude and closing items. Separate youth and younger-child forms remain local adaptations, not RAND instruments.

Every **respondent-visible** screen, including entry, participation and thank-you, must read like a real survey. Remove the previous public status note and all demo/preview/noncollection wording from the questionnaire. The final button is **Confirm and submit**, and the closing page uses natural thanks without a technical receipt claim. The static GitHub site still has no actual receiver or persistence; that fact stays in internal documents and must not be mistaken for authorisation to collect real responses. This correction supersedes the preceding formal-copy direction's website-status note and unavailable-submission end state. [RAND Appendix A](https://www.rand.org/content/dam/rand/pubs/monographs/2011/RAND_MG1124.pdf); [67-item local crosswalk](RAND_ITEM_CROSSWALK.md).

## Earlier refinement — 29 September 2026: formal-facing survey demonstration

Jacob asked for respondent-facing wording that reads like the intended formal questionnaire, without preview/demo labels, while the site still collects nothing. The operative adult/youth revision is `2026-09-29-rand-formal-copy`; the under-7 wording revision is `2026-09-29-local-connection-formal-copy`. The homepage now explains the Defence-funded plan, Lutheran Care's current listening stage, how feedback can shape delivery and local service-gap understanding, and the adult RAND adaptation. The optional adult Greater Darwin residence-duration question sits on the first background page instead of occupying its own page. RAND-linked follow-up remains the core: actual difficulties, the areas and help types that matter most, resources, barriers and need outcomes. Situation and help prompts have been separated to avoid repeating the same narrative.

The review action reads **Confirm and submit**. A single website-status note before entry tells public visitors that online submission is not open, without putting preview labels in the questionnaire itself. With no receiver, the website must never show a success receipt: it returns an accessible submission-unavailable result and preserves answers for return to review until the page is cleared or closed. Internal documentation and metadata must continue to state the no-collection reality. The separate interview-request form is not activated by this survey wording change. A real collection launch still requires LC-approved custody, participant information and a verified receiving service. [Defence funded-project listing](https://www.defence.gov.au/adf-members-families/family-programs-local-services/support-communities/defence-community-grants-family-support-funding-program); [RAND publication](https://www.rand.org/pubs/monographs/MG1124.html).

## Earlier direction — 29 September 2026: RAND-linked needs assessment

The revision and finish wording in this section describe the earlier v9 release and are superseded by the refinement above.

Jacob supplied Laura L. Miller et al., *A New Approach for Assessing the Needs of Service Members and Their Families* (RAND, 2011), and directed that an adapted version of Appendix A be the **main** questionnaire. The operative adult/youth source is schema `9.0`, revision `2026-09-29-rand-linked-needs`. Start with concrete problem cues, let a respondent choose up to two areas for structured detail, then connect the problem to help needed, contacted or uncontacted resources, access factors and whether the need was met. Retain positive support, future needs and further experiences or ideas as **supplements**, including the existing 100-active-entry technical ceiling for optional accounts. Preserve the short youth route and the separate under-7 guardian-supported form. The source was a US adult instrument; local wording and youth adaptation are not RAND-validated. [RAND publication](https://www.rand.org/pubs/monographs/MG1124.html).

This direction supersedes the 28 September operative issue-page route and the older no-priority-cap instruction below for the **structured detail module**. The up-to-two choice does not cap problem reporting or optional supplemental entries. The preview may be published after verification, but no receiver, answer storage or real collection is activated. Use [FLOW_REDESIGN.md](FLOW_REDESIGN.md), [ANALYSIS_PROTOCOL.md](ANALYSIS_PROTOCOL.md) and the generated question bank for the current contract; older sections remain as decision history only.

The under-7 preview keeps schema `1.3` but revises its questionnaire wording to `2026-09-29-local-connection-preview`: the first child prompt includes where the child lives **or spends time with family**, allowing a child living elsewhere to describe their own experience. Its review action is **Finish preview** and confirms answers are not sent or saved. The child's optional residence stays a separate background fact; child expressions and guardian observations remain distinct.

## Latest correction — 28 September 2026: issue prompts before detail

Jacob accepted the team's proposal to show a selectable list of family-life issues near the start as a memory prompt. Each issue selected by an adult or 8–17-year-old leads to **one dedicated question page for that issue**. A person can describe an experience or future idea, add further entries under the same issue, move on without writing about a selected issue, and use an Other issue route for a topic absent from the list. The adult list has 17 issues and the youth list has eight. The total capacity remains 100 active entries across the whole response, not 100 per issue. A story spanning several issues need only be written once.

The issue selection is a routing and recall aid; it is not a measured count of unmet need. Unselected issues and selected issues without narrative detail cannot be interpreted as “no need”. Keep the v8 situation-led, optional follow-ups on each issue page, with wording that fits that issue. Do not bring back the old generic participation-format list, assume a Berrimah venue, or ask a future-only contributor to invent a past help-seeking experience. The under-7 route remains separate.

Writing a substantive answer does not require choosing “experience” or “future”: retain such an entry with `kind: unspecified` and do not infer a past recall window. The general add route may retain an uncategorised entry without `topic_id`; issue-page entries carry their chosen `topic_id`. On adult safety and bereavement pages, do not ask the help-status or extra helped/difficult questions merely to keep a uniform form; those fields are not asked in analysis.

Jacob expressly authorised publishing this revised **preview** to the existing GitHub Pages site after implementation and verification. That authorisation does not activate a response receiver: the page still keeps answers in memory and must say clearly that nothing was sent or saved. The historical no-publication statement below applied to the prior correction and is superseded for this preview release. See [FLOW_REDESIGN.md](FLOW_REDESIGN.md) for the current contract.

## Further correction — 28 September 2026: respondent-led accounts

The operative adult/youth review flow is now schema `8.0`: people choose their own experience or future idea and may add another, up to 100 active entries as a technical ceiling. The normal entry is one optional story, an experience-only support-status choice and one distinct useful-change answer; extra detail and offer-specific practical conditions are optional. The 17-domain loops, youth one-focus limit, global format menu and Berrimah attendance premise in the historical decisions below are superseded. Keep the prior text as a record of how the design changed; use [FLOW_REDESIGN.md](FLOW_REDESIGN.md) for the current contract. Under-7 participation remains separate. No receiver or publication is authorised by this correction.

## Correction — 28 September 2026 (historical, superseded above)

Jacob clarified that activities should not be framed as taking place at Lutheran Care's Berrimah office. The Berrimah attendance bullet below is historical and no longer guides the questionnaire. The revised survey asks about practical Greater Darwin areas only when someone is interested in an in-person format. It links future help and participation format to the selected support topic, with shared practical conditions asked once. See `FLOW_REDESIGN.md` for the current review flow.

## Retain the space for detailed responses

The survey is a substantive consultation channel because staff capacity for interviews is limited. Its optional questions deliberately provide space and relevant prompts for participants who want to explain several needs. Participants can leave questions unanswered.

**Keep optional follow-up questions for every need an adult selects. Do not impose a one- or two-need focus cap, and do not remove useful questions solely to shorten the survey.** The earlier audit's recommendation to limit adult detail is withdrawn from the operative plan. Improve clarity, order, relevance and preservation of answers while retaining this depth. The youth form's existing optional focus remains a separate age-appropriate design choice.

The current needs list stays in place. The discussion of whether to narrow its substantive scope remains for the Monday team meeting. Do not quietly narrow housing, childcare, transport, money or other relevant topics under the label of reducing burden.

## Other accepted design corrections

Jacob accepted the remaining review recommendations. They guide the coordinated questionnaire update:

- Use residence and local experience to distinguish consultation routes; do not use the serving member's posting location as a substitute for where the responding family lives.
- Preserve opportunities to describe what has worked, past support needs, current desired improvements and future or preventive support, including for people reporting no past need.
- Ask relevant caregivers about children's age stages; ask about participation format, timing and practical access separately from how participants prefer to receive information.
- Historical proposal, superseded: ask about attendance at Berrimah when relevant to interest in in-person participation. The current issue-page survey assumes no Berrimah activity venue and asks practical details only for a specific described help or activity after opt-in.
- Keep recalled local experiences distinct from earlier experiences elsewhere; arrange follow-ups in a consistent time sequence.
- Add minimal guardian-side ADF connection and locality context for the youngest children's pathway; preserve the distinction between a child's expression and an adult's observation.
- Make help with answering available without implying the helper should choose answers. Keep youth participation and permission arrangements clear.
- Preserve existing answers when additional help sources are selected. Reduce unnecessary display of unanswered optional fields on the review screen.

These are accepted design directions; the release checkpoint and verification record identify the exact implemented revision. No change to the substantive needs list is authorised by this note.

## Collection and deployment

Lutheran Care will host or own the eventual collection arrangement. Jacob will coordinate with Lutheran Care IT. Microsoft Forms, including a separate interview-request form, is a possible route; the custom website and receiving service are another. The current hosting preview and historical dashboard do not establish that live collection exists.

Prepare a portable question/branching specification, stable export field map and a practical platform recommendation. Selection of the platform, tenant/server ownership, storage location and access remains with Lutheran Care and IT. Do not connect an improvised collector or represent answers as received before a verified receiver is configured. Keep interview contact information separate from the survey response dataset; the approved survey wording says the contact form does not receive survey answers.

## Statistical interpretation — mandatory in team outputs

Describe participant views and experiences. Do not label response records as unique families or present their percentages as population prevalence. Several members of a family may respond, and recruitment channels can affect who takes part. If unique individuals are not verified, report the number of responses rather than claiming distinct people.

Every statistical report, dashboard and summary must carry a concise interpretation note, its cohort and N, collection dates, questionnaire revision and the base for each measure. A single prominent note can cover a group of charts in one report; a chart shared alone must retain its context. Blank, skipped, unsure, declined and not asked must remain distinct from an explicit “no”. Different forms, recall periods and local/former/outside routes must remain distinguishable.

The reusable English and Chinese notes and denominator rules are in `ANALYSIS_PROTOCOL.md`. The legacy `results.html` dashboard is explicitly marked as a historical fictional example; it is not the revised questionnaire's live analysis model.
