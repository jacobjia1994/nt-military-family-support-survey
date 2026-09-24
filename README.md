# NT Defence Family Support Program consultation

A formal questionnaire for Lutheran Care’s internal team review. This is service consultation, not a human research project. The participant interface contains formal wording and LC branding; this staff file records the review context. The current build has no response receiver and does not claim that answers have been received.

- [Questionnaire](https://jacobjia1994.github.io/nt-military-family-support-survey/)
- [Adult reading copy](https://jacobjia1994.github.io/nt-military-family-support-survey/adult-wording.html)
- [All ages and conditional questions](https://jacobjia1994.github.io/nt-military-family-support-survey/questions.html)
- [Staff guide](https://jacobjia1994.github.io/nt-military-family-support-survey/review.html)
- [Participation and safeguarding procedure](consultation-procedure.md)
- [Strategy-to-questionnaire evidence](copy/strategy-needs-map.md)

## Current structure, 25 September 2026

The adult domains were checked against the supplied Australian Government *Defence and Veteran Family Wellbeing Strategy 2025–2030* and First Action Plan. The list has 16 domains plus Something else. Information/service navigation is added; postings/leaving service and grief are visible examples within broader domains. The source is national policy, not a validated scale or evidence of NT prevalence. Youth and child options remain shorter. Examples do not exhaust the possible experiences in an area.

NT service timing controls the route, independently of the respondent's residence:

- Current service or service ending within 12months: full questionnaire.
- Earlier NT service: one optional lessons/suggestions response, then review and finish. These records are separate from recent-needs counts.
- Uncertain connection: full questions, marked uncertain in analysis.
- No NT service/connection: scope explanation.

These are consultation-design boundaries for team review, not programme-benefit eligibility decisions. Current/former members and their family relationships can be selected; multiple roles remain possible. The strategy's inclusion of veterans does not itself establish the LC grant's service entitlements.

Past needs/adequacy refer to 12 months for adults/youth and 3 months for children. The current-or-most-recent NT residence question uses nonoverlapping bands and a never-lived-in-NT option. It does not ask people to add separate postings or measure lifetime service. Current need impact refers to 4 weeks. These windows are design choices, not legal requirements.

Each selected current need now has ONE page with its own impact, help sought, conditional barriers/reasons and desired change. Barriers appear only after a known help-seeking/not-seeking answer. Blank/uncertain/declined help does not imply an attempt. One general delivery/time preference page follows. No arbitrary cap is placed on current needs. Fieldwork length depends on selections; old unmeasured duration estimates have been removed.

## Answer model and integrity

Schema 3 exports `follow_up[need_id]` blocks. No earlier collective answer is copied across needs. Removing a need removes only its block; editing one block's help source clears only its barriers. General service preferences remain explicitly general. Past adequacy remains keyed per domain. Earlier-experience exports contain no current-needs answers. The historical field `priority` is an array of current needs, not a ranking.

Adult/youth comments allow 5000 characters; child comments 1500. Remaining-character feedback appears near the limit. Optional blank questions continue with one Continue button; the few required fields and consent choices must be completed first.

## Participation and privacy

Adults and 15–17-year-olds give informed own consent; 7–14-year-olds have guardian permission followed by their own assent. Under 7 uses a facilitated conversation guide. People needing capacity/authority/safe-guardian support can ask an LC worker; the public form never fabricates worker approval. The age split is an operational model, not a universal statutory consent age. See the staff procedure for actual responsibilities and reporting.

No names, contacts or response-retrieval codes are requested. Ordinary answers are not linked to identity. Retaining answer records is different from retaining an identity mapping. The formal notice explains secure LC custody, authorised access, sharing, rights and withdrawal without naming an unselected platform or inventing a retention period. Unexpected identifying disclosures still fall under LC's privacy and safeguarding duties. A policy link and front-end checkbox do not activate an institution-managed receiver.

The implementation holds answers in page memory, with optional local JSON download. It has no answer endpoint, application analytics, cookies or persistent answer store. GitHub Pages itself logs visitor IPs for security. Real responses must not be stored in this repository or personal development directories. Exported consent records carry `context: internal_review`; they are not evidence of real fieldwork approval.

## Development and verification

Run `node --test tests/survey.test.mjs`. `node scripts/export-copy.mjs` exports the live definitions to the adult reading-copy data. Local preview: `python3 -m http.server 8174 --bind 127.0.0.1`.

LC logo and self-hosted Karla sources/licence are in `assets/`. The Pages deployment serves main at the repository root. The old fictional results illustrate an earlier instrument; they are not a processor for schema 3 responses or findings about families.

## Completion resource

Set `title` and the public HTTPS `url` in `thank-you-resource.js` when the team has made the resource. Until then the inactive resource button says Available soon. The same link is used for all completers, including optional blanks and earlier-experience respondents. It appends no answers or participant ID, collects no email and opens without a referrer. No resource content has been invented.
