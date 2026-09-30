# Adult open-response survey

## Current decisions

Jacob selected the adult-only four-page open-response survey on 30 September 2026 and then requested a refinement of its welcome, background questions, narrative heading and thanks. This file supersedes the prior paired-variant contract and the first same-day background design. `index.html` is the sole entry; old open/question/review/result URLs redirect there. Choice, comparison, youth and historical adult HTML entries are removed; prior work remains in Git history.

## Four pages

1. **Welcome:** a brief factual invitation and compact eligibility paragraph, followed by one neutral-tinted Your information panel. Four short titled blocks explain voluntary choice, use/reporting, identification precautions and privacy rights. Desktop uses two columns; mobile stacks them. Programme/feedback contacts and policy link sit inside the panel; one unticked adult/sensitive-information agreement is integrated at its bottom. Start survey follows the panel. No separate agreement card or scattered privacy accordion.
2. **A bit about you:** all questions optional. Remove Prefer not to answer everywhere. Primary residence choices are Darwin / Palmerston / Litchfield; Other area reveals Other Greater Darwin area / Outside Greater Darwin. Locality is optional and area changes clear stale locality answers. Selected radio answers expose a discreet Clear answer control.
3. **Your living experiences**, with subtitle **in the Great Darwin Region:** the six supplied prompts and final comment remain verbatim. Seven independent blank textareas each allow 5,000 characters for completion. The repeated identification reminder appears under the prompt/help and before its box. No running counter is displayed. An over-limit paste remains intact; explain the error on leaving the field or completing, and allow Back without losing it. End with confirmation and Confirm and submit.
4. **Thank you:** restore the previous two-column resource layout, stacked on mobile, each with a short description and matching primary button. Preserve Interview request survey → contact.html and Find local services in NT → support.html. Resource access is independent of answers and carries no participant parameters.

Remove every Leave survey button. People can stop by closing the page. Keep normal Back / Continue; do not add a review page or force any optional response.

## Background field contract

- `has_dependants`: “Do you have any dependants?”, Yes / No. Include children or adults relying on the participant for care or financial support; retire the half-of-financial-support definition.
- `dependants.total` and `dependants.living_with`: conditional optional nonnegative whole numbers after Yes. No age-group grid. If both answered, living-with cannot exceed total.
- `nt_duration.years`: optional whole number 0–99. `nt_duration.months`: optional whole number 0–11. Count the current or most recent NT stay; preserve these when the current residence area changes. Retire time_local / time_past / past_residence.
- Role, adult age-group and current-serving connection concepts remain; only their prefer-not options are removed.

These changed concepts use a new schema revision `adult_open_2026_09_30_welcome_v3`; do not compare new aggregate dependant/duration fields as the old age-band or Greater-Darwin-duration measures.

## Welcome reference and privacy rationale

Jacob’s 30 September screenshot is a layout reference from the independent interview-request form, not permission to copy its storage or contact promises into the main questionnaire. Borrow its grouped headings, quiet background and integrated agreement. Keep funding visible and source credit expandable in the footer after Start.

The supplied Lutheran Care [previous Microsoft Forms survey](https://forms.cloud.microsoft/pages/responsepage.aspx?id=ePVbbmswQ0-vXegfpQQa5JWv5gc2YoRJrDyv0Gh4WGdURVhYQzEyWUJRUEpCVDlBVzlKSVJBU0U5Vi4u&route=shorturl) was inspected read-only on 30 September 2026. Its first page supplies de-identified reporting/funding-partner use and the programme contact ntcomms@lutherancare.org.au. Those useful facts are adapted into How answers are used and the contact line. Do not copy its required substantive questions, spouse-only scope or consent-to-contact withdrawal clause: the new survey is broader, optional and independent of interview contact details. No answers were entered into the reference form.

The earlier completed ordinary ChatGPT 6 Pro review still informs specific own-sensitive-information consent and avoidance of anonymity/absolute-confidentiality promises. The latest layout replaces that draft’s long vertical briefing. Retain Jacob’s per-field privacy reminders and Great Darwin title/prompts.

Primary privacy basis: [OAIC APP 5](https://www.oaic.gov.au/privacy/australian-privacy-principles/australian-privacy-principles-guidelines/chapter-5-app-5-notification-of-the-collection-of-personal-information), [OAIC APP 3](https://www.oaic.gov.au/privacy/australian-privacy-principles/australian-privacy-principles-guidelines/chapter-3-app-3-collection-of-solicited-personal-information), and [Lutheran Care’s privacy policy](https://www.lutherancare.org.au/privacy-policy/). The general policy does not establish unknown project-specific storage/access facts.

Every active main-survey free-text field, including optional locality text, now has a 5,000-character completion limit. Preserve over-limit pasted text for correction; do not silently truncate it. Independent interview fields already have shorter limits (30–600) and remain unchanged. Numeric years/months/count ranges remain unchanged.

## Collection status and later information-handling facts

There is no receiver, persistent answer storage or analytics. Answers remain in page memory and closing/refreshing clears them. Confirm and submit ends this presentation with neutral thanks; it does not save or send answers. The independent interview form is also a review form and does not inherit survey consent or data.

For a later collection launch, record the actual receiving system, draft/technical-identifier behaviour, permitted raw-answer access, storage/backups/retention, usual external recipients and funder reporting, any overseas recipients, public quotation/reporting use, and how requests or inadvertently identifying/sensitive disclosures are handled. Then update the privacy layer with established facts. Do not invent placeholders or import case-management monitoring/reporting arrangements into this survey. These later platform/team facts do not block the authorised presentation revision.

## Editing and checks

The source of current wording is adult-survey/survey-spec.json. The model validates optional fields and narrative limits; the app handles DOM display only. Run `node --test tests/*.test.mjs`, then a bounded desktop/mobile flow check including cleared answers, NT limits, two dependant counts, over-limit text preservation and both thanks resources.
