# Adult open-response survey

## Current decisions

Jacob selected the adult-only four-page open-response survey on 30 September 2026 and then requested a refinement of its welcome, background questions, narrative heading and thanks. This file supersedes the prior paired-variant contract and the first same-day background design. `index.html` is the sole entry; old open/question/review/result URLs redirect there. Choice, comparison, youth and historical adult HTML entries are removed; prior work remains in Git history.

## Four pages

1. **Welcome:** restore the natural earlier greeting, identify Lutheran Care’s developing program and invite meaningful experiences. Participation is voluntary; privacy information is layered before one unticked adult agreement. The agreement explicitly covers information voluntarily provided about the respondent, including health or other sensitive information, for understanding needs and planning family support. No anonymity, absolute confidentiality, approval or guaranteed service outcome is promised.
2. **A bit about you:** all questions optional. Remove Prefer not to answer everywhere. Primary residence choices are Darwin / Palmerston / Litchfield; Other area reveals Other Greater Darwin area / Outside Greater Darwin. Locality is optional and area changes clear stale locality answers. Selected radio answers expose a discreet Clear answer control.
3. **Your living experiences**, with subtitle **in the Great Darwin Region:** the six supplied prompts and final comment remain verbatim. Seven independent blank textareas each allow 10,000 characters for completion. The repeated identification reminder appears under the prompt/help and before its box. No running counter is displayed. An over-limit paste remains intact; explain the error on leaving the field or completing, and allow Back without losing it. End with confirmation and Confirm and submit.
4. **Thank you:** restore the previous two-column resource layout, stacked on mobile, each with a short description and matching primary button. Preserve Interview request survey → contact.html and Find local services in NT → support.html. Resource access is independent of answers and carries no participant parameters.

Remove every Leave survey button. People can stop by closing the page. Keep normal Back / Continue; do not add a review page or force any optional response.

## Background field contract

- `has_dependants`: “Do you have any dependants?”, Yes / No. Include children or adults relying on the participant for care or financial support; retire the half-of-financial-support definition.
- `dependants.total` and `dependants.living_with`: conditional optional nonnegative whole numbers after Yes. No age-group grid. If both answered, living-with cannot exceed total.
- `nt_duration.years`: optional whole number 0–99. `nt_duration.months`: optional whole number 0–11. Count the current or most recent NT stay; preserve these when the current residence area changes. Retire time_local / time_past / past_residence.
- Role, adult age-group and current-serving connection concepts remain; only their prefer-not options are removed.

These changed concepts use a new schema revision `adult_open_2026_09_30_refined`; do not compare new aggregate dependant/duration fields as the old age-band or Greater-Darwin-duration measures.

## Credits and privacy rationale

Funding acknowledgement remains fully visible in the welcome footer below Start survey, separated by a fine rule. About this questionnaire is an expandable source-credit item in the same footer. The policy link and More about privacy remain before agreement, because they inform participation rather than institutional provenance. Restore the previous native local-area hierarchy and descriptive two-action thanks; keep the current branding.

Ordinary ChatGPT 6 Pro supplied a completed independent review in the associated Defence Survey Audit Chat on 30 September 2026. Adopted: layered notice, specific own-sensitive-information consent, 10,000-character ceiling, preserved over-limit text, credits after Start, separate resource access. Retained Jacob’s explicit per-field identification reminders and Great Darwin title/prompts instead of the review’s proposed single reminder and wording change. QA/review receipts are private and excluded from Git.

Primary policy basis: [OAIC APP 5, especially 5.5–5.6](https://www.oaic.gov.au/privacy/australian-privacy-principles/australian-privacy-principles-guidelines/chapter-5-app-5-notification-of-the-collection-of-personal-information), [OAIC APP 3](https://www.oaic.gov.au/privacy/australian-privacy-principles/australian-privacy-principles-guidelines/chapter-3-app-3-collection-of-solicited-personal-information), and [Lutheran Care’s current privacy policy](https://www.lutherancare.org.au/privacy-policy/). A general policy can supplement a collection notice; it does not supply unknown project-specific facts.

## Collection status and later information-handling facts

There is no receiver, persistent answer storage or analytics. Answers remain in page memory and closing/refreshing clears them. Confirm and submit ends this presentation with neutral thanks; it does not save or send answers. The independent interview form is also a review form and does not inherit survey consent or data.

For a later collection launch, record the actual receiving system, draft/technical-identifier behaviour, permitted raw-answer access, storage/backups/retention, usual external recipients and funder reporting, any overseas recipients, public quotation/reporting use, and how requests or inadvertently identifying/sensitive disclosures are handled. Then update the privacy layer with established facts. Do not invent placeholders or import case-management monitoring/reporting arrangements into this survey. These later platform/team facts do not block the authorised presentation revision.

## Editing and checks

The source of current wording is adult-survey/survey-spec.json. The model validates optional fields and narrative limits; the app handles DOM display only. Run `node --test tests/*.test.mjs`, then a bounded desktop/mobile flow check including cleared answers, NT limits, two dependant counts, over-limit text preservation and both thanks resources.
