# Greater Darwin Defence Family Support Survey

This repository contains a **public, formal-facing demonstration** of a proposed Lutheran Care questionnaire. The main adult route is a locally adapted, RAND-led needs assessment. The site has no response receiver: entries stay in page memory and are **not sent or saved**. Its respondent-facing pages use proposed final wording; pressing **Confirm and submit** returns an unavailable-submission state rather than claiming receipt. Do not use the public link to collect real consultation answers.

## Current questionnaire

The adult and 8–17 routes use schema 9.0, revision 2026-09-29-rand-formal-copy. The guardian-supported form for ages 7 or younger remains the separate schema 1.3 instrument. The adult questionnaire follows the linked sequence developed in Laura L. Miller et al., *A New Approach for Assessing the Needs of Service Members and Their Families* (RAND, 2011), Appendix A: **reported problem → assistance needed → contact or non-contact with resources → access factors → extent to which the need was met**. [RAND publication and PDF](https://www.rand.org/pubs/monographs/MG1124.html). Credit: **Adult questionnaire adapted from Miller et al. (2011), RAND MG-1124, Appendix A.** RAND permits tailored adoption and advises smaller-scale users to collapse categories. The original instrument addressed US adult service members and spouses; this local adaptation and the youth version are not RAND-validated NT instruments, and no RAND endorsement is claimed.

After a short participation and background route, adults see nine problem groups with 45 concrete cues and an Other option. Youth see a shorter age-appropriate problem list. A participant may select any applicable cues from the local recall period. One or two selected categories proceed to detail; with more, the participant chooses up to two. Anyone may skip detailed questions and reach the supplements. In the **adult** route, each chosen category asks what kinds of help were needed and follows through on up to two help types. At most four category × need pathways ask about seeking and receiving help, sources, access factors, whether the need was met overall and any current gap. The **youth** route uses shorter situation, help, asking, receipt and adequacy questions rather than adult resource matrices. Only applicable follow-ups appear. The selected-but-not-explored problems and help types remain in the record. A separate optional page invites effective support worth keeping and future needs. Optional further accounts remain supplemental, with a technical maximum of 100 active entries across one response; 100 is never an expected number.

The checklist is a recall and analysis tool. A reported difficulty does not by itself mean support was needed; a contact does not prove that support helped. None/No, blank, declined, unsure and not asked must be kept distinct. Positive and future-only statements are not recoded as past problems. The questionnaire does not assume activities take place at LC's Berrimah office. The under-7 route records a child's expressions and guardian observations separately. The independent interview request and free NT support finder do not receive survey answers.

## Files and review

- [index.html](index.html): respondent-facing demonstration.
- [questions.html](questions.html): questions and conditional routes for team review.
- [adult-wording.html](adult-wording.html): generated adult reading copy.
- [FLOW_REDESIGN.md](FLOW_REDESIGN.md): exact method, route and answer meaning.
- [ANALYSIS_PROTOCOL.md](ANALYSIS_PROTOCOL.md): counting and reporting rules.
- [COLLECTION_HANDOFF.md](COLLECTION_HANDOFF.md): platform and answer-custody handoff.
- [INTERVIEW_TEAM_GUIDE.md](INTERVIEW_TEAM_GUIDE.md): oral consultation using the same linked concepts.
- [PRODUCT.md](PRODUCT.md): product and participation decisions.

The questionnaire is dependency-free HTML, CSS and JavaScript. The source of truth for live question wording, catalog choices and branches is survey.js; [the category crosswalk](RAND_ITEM_CROSSWALK.md) and [candidate cue JSON](copy/rand-needs-taxonomy.json) explain how the adult list was derived. Keep those files aligned when wording changes. Regenerate review artifacts after a wording change:

    node scripts/export-copy.mjs
    node scripts/render-adult-copy.mjs
    node scripts/export-handoff.mjs /absolute/output/directory
    node --test tests/*.test.mjs

The scripts derive the reading copy and JSON question bank from live definitions; do not edit generated copy as though it were the source. The RAND PDF is a cited source, not a repository asset. The repository also contains a historical fictional dashboard in results.html for an earlier instrument; it is not a validated v9 result view.

## Scope and participation

The consultation concerns Defence members and families whose lives are connected with Greater Darwin, including Darwin, Palmerston and Litchfield. Current and former ADF relationships remain invited. A current resident may give an optional broad area and matching suburb/locality. A person living elsewhere can also identify a current Greater Darwin work/posting connection; residence and work/posting remain separate export fields. Someone now outside Greater Darwin without a current work/posting link but with earlier local experience follows a separate historical route; an undisclosed address is not treated as confirmed local. A broad Palmerston answer is not silently assigned to Palmerston City.

Adults and young people have separate wording and permission routes. The 8–17 questionnaire uses age-appropriate questions; the 8–14 and 15–17 choice changes participation arrangements rather than creating two sets of substantive questions. Ages 7 or younger use the parent/guardian-supported child form. Its first prompt asks what the child likes about where they live **or spend time with family**; a child living elsewhere may describe their own experience of the family's Greater Darwin connection. Residence remains a separate optional background answer. Child expressions and guardian observations remain separate; all routes use **Confirm and submit**, which cannot produce a success message without a receiver. Assistance with reading or writing does not give a helper authority to choose a young person's answers. See [CHILD_PARTICIPATION_REVIEW.md](CHILD_PARTICIPATION_REVIEW.md) and [consultation-procedure.md](consultation-procedure.md).

Long adult text fields allow 5,000 characters and youth fields 1,500 unless a field states a shorter limit. Most substantive answers are optional. The site asks for no names or service numbers in the survey and advises leaving identifying details out of narrative boxes.

## Collection and interpretation

Publication on GitHub Pages is authorised for **demonstration only**. The questionnaire presents proposed final-form wording without repeated preview labels; one website-status notice before entry tells a public visitor that online submissions are not open. Internal metadata records that no submission occurs. Pressing **Confirm and submit** shows that no answer was received; entered answers remain in page memory until the person clears or leaves. A real collection launch requires an LC-owned receiving platform, approved participant information, access and retention decisions, a successful invented-answer receipt/export test, and separate controls for interview contact data. See [COLLECTION_HANDOFF.md](COLLECTION_HANDOFF.md). Do not commit actual participant responses to this repository.

Analyse response records, reported problem cues, chosen detailed categories, selected need types, category × need pathways, contacts and outcomes at their proper unit. Do not present volunteer-response percentages as prevalence among Greater Darwin Defence families or as unique-household counts. Do not silently combine v9 with schema 8.1 or older data. See [ANALYSIS_PROTOCOL.md](ANALYSIS_PROTOCOL.md).

The standalone [support finder](support.html) and [interview request](contact.html) remain available without taking this survey. Their own previews also have no response receiver. The LC logo and self-hosted Karla font/licence are in assets/. GitHub Pages serves the repository root from main.
