# Adult open-response survey

## Current decisions

Jacob selected the adult-only four-page open-response survey on 30 September 2026 and then requested a refinement of its welcome, background questions, narrative heading and thanks. This file supersedes the prior paired-variant contract and the first same-day background design. `index.html` is the sole entry; old open/question/review/result URLs redirect there. Choice, comparison, youth and historical adult HTML entries are removed; prior work remains in Git history.

## Four pages

1. **Welcome:** a brief factual invitation and compact eligibility paragraph, followed by one neutral-tinted Your information panel. Four short titled blocks explain voluntary choice, use/reporting, identification precautions and privacy rights. Desktop uses two columns; mobile stacks them. Programme/feedback contacts and policy link sit inside the panel; one unticked adult/sensitive-information agreement is integrated at its bottom. Start survey follows the panel. No separate agreement card or scattered privacy accordion.
2. **A bit about you:** every visible question requires a response. All selection controls include Prefer not to answer. Primary residence choices remain Darwin / Palmerston / Litchfield; refusal is separately visible below the primary/Other area choices. Locality and other-locality text are required only while shown. Numeric groups accept both bounded values or a Prefer not to answer checkbox. Refusal clears incompatible numeric values; changing area clears stale locality.
3. **Your living experiences**, with subtitle **in the Great Darwin Region:** the six supplied prompts and final comment remain in their current order. Seven independent text fields require non-whitespace content, without semantic or minimum-word scoring. Keep the 5,000-character completion limit and preserve over-limit text. Privacy reminders use the full input width and naturally wrap. No counter, extra review page or auto-submission.
4. **Thank you:** restore the previous two-column resource layout, stacked on mobile, each with a short description and matching primary button. Preserve Interview request survey → contact.html and Find local services in NT → support.html. Resource access is independent of answers and carries no participant parameters.

Remove every Leave survey button. People can stop by closing the page. Keep normal Back / Continue; do not add a review page or add an extra review page.

## Background field contract

- `has_dependants`: “Do you have any dependants?”, Yes / No / Prefer not to answer. Include children or adults relying on the participant for care or financial support; retire the half-of-financial-support definition.
- `dependants.total` and `dependants.living_with`: conditional required nonnegative whole numbers or an explicit refusal after Yes. No age-group grid. Both are required unless dependants.prefer_not is true; living-with cannot exceed total.
- `nt_duration.years`: whole number 0–99. `nt_duration.months`: whole number 0–11. Both values are required unless nt_duration.prefer_not is true. Count the current or most recent NT stay; preserve these when the current residence area changes. Retire time_local / time_past / past_residence.
- Role, adult age-group and current-serving connection concepts remain; their Prefer not to answer options are restored.

These changed concepts use a new schema revision `adult_open_2026_09_30_required_drafts`; do not compare new aggregate dependant/duration fields as the old age-band or Greater-Darwin-duration measures.

## Welcome reference and privacy rationale

Jacob’s 30 September screenshot is a layout reference from the independent interview-request form, not permission to copy its storage or contact promises into the main questionnaire. Borrow its grouped headings, quiet background and integrated agreement. Keep funding visible and source credit expandable in the footer after Start.

The supplied Lutheran Care [previous Microsoft Forms survey](https://forms.cloud.microsoft/pages/responsepage.aspx?id=ePVbbmswQ0-vXegfpQQa5JWv5gc2YoRJrDyv0Gh4WGdURVhYQzEyWUJRUEpCVDlBVzlKSVJBU0U5Vi4u&route=shorturl) was inspected read-only on 30 September 2026. Its first page supplies de-identified reporting/funding-partner use and the programme contact ntcomms@lutherancare.org.au. Those useful facts are adapted into How answers are used and the contact line. Do not copy its required substantive questions, spouse-only scope or consent-to-contact withdrawal clause: the new survey is broader and independent of interview contact details. No answers were entered into the reference form.

The earlier completed ordinary ChatGPT 6 Pro review still informs specific own-sensitive-information consent and avoidance of anonymity/absolute-confidentiality promises. The latest layout replaces that draft’s long vertical briefing. Retain Jacob’s per-field privacy reminders and Great Darwin title/prompts.

Primary privacy basis: [OAIC APP 5](https://www.oaic.gov.au/privacy/australian-privacy-principles/australian-privacy-principles-guidelines/chapter-5-app-5-notification-of-the-collection-of-personal-information), [OAIC APP 3](https://www.oaic.gov.au/privacy/australian-privacy-principles/australian-privacy-principles-guidelines/chapter-3-app-3-collection-of-solicited-personal-information), and [Lutheran Care’s privacy policy](https://www.lutherancare.org.au/privacy-policy/). The general policy does not establish unknown project-specific storage/access facts.

Every active main-survey free-text field, including conditional locality text, now has a 5,000-character completion limit. Preserve over-limit pasted text for correction; do not silently truncate it. Independent interview fields already have shorter limits (30–600) and remain unchanged. Numeric years/months/count ranges remain unchanged.

## Local drafts and collection status

Jacob selected same-device/same-browser resumption on 30 September 2026. This now supersedes the earlier no-persistence rule for unfinished local drafts only. After adult agreement, changes are saved with a short debounce, on page changes and before leaving/hiding the page. A return visit offers Resume survey or Start a new survey, without revealing saved text until Resume. Completion and Clear saved progress remove only this survey’s stored key. Another open survey tab responds to deletion so it cannot resurrect a cleared draft.

The stable answer schema is `adult_open_answers_v3`, independent of visual/cache revisions. Draft metadata includes current page, update/expiry times and format/schema version. Draft validity is 30 days after the latest save; expired/corrupt/incompatible entries are rejected and removed when the page opens. Closing the browser cannot run timed deletion. Browser cleanup/private mode/eviction can remove data sooner. Storage failures are reported and current page memory is preserved; no false saved message.

There is still no completed-answer receiver or analytics. Local browser drafts are not delivered to Lutheran Care or attached to the independent interview form. The latter retains its own field limits and notice. Actual collection needs the receiving platform, authorised access, retention and external sharing arrangements established separately; this revision adds no server collection.

The current first-page notice explains local drafts and the clear action. [MDN localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) explains persistence across normal browser sessions; [storage eviction guidance](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria) explains why browser persistence cannot be guaranteed.

## Editing and checks

The source of current wording is adult-survey/survey-spec.json. The model validates active required fields and narrative limits; the app handles DOM display and the local draft lifecycle. Run `node --test tests/*.test.mjs`, then a bounded desktop/mobile flow check including cleared answers, NT limits, two dependant counts, over-limit text preservation and both thanks resources.
