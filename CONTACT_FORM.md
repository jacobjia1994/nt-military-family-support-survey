# Interview request form

`contact.html` is the separate opt-in **Request an interview** form. Its introduction invites people to share their experience with a Lutheran Care staff member so LC can better understand the difficulties and support needs of Defence families in the NT, then leave details to arrange an interview. It follows the consultation concept recovered from Thursday's ChatGPT task **讨论项目理解** (`6ab46d41-1b10-83ec-aab1-b6eeca5f3201`).

Its purpose is to arrange a service-consultation interview. It is not a service intake assessment, a counselling referral or a confirmed appointment. Completing the main survey is not a condition of using this form. The form does not receive survey answers, response IDs or other identifiers linking a request to an anonymous response.

## Fields and interaction

| Field | Requirement and purpose |
| --- | --- |
| Request for | Required: myself / my child or a child in my care. This chooses whose contact details and permissions are requested. |
| Age group | Required: 18 or older / 15–17 / under 15 for a self-request; 15–17 / under 15 for a guardian request. Only a broad group is collected. Every group has a form. |
| Name to use | Required; up to 80 characters. A preferred name is sufficient. On the guardian route this is the parent or guardian’s own name, not the child’s name. |
| Phone number | Required; 7–15 digits, allowing spaces, parentheses, hyphens and an initial `+`. Accommodates landlines and international numbers as well as Australian mobiles. It checks format, not ownership or whether the number can receive texts. |
| Safe first contact | Required, with no default: **Call me** or **Text me first**. These are explicit permissions for the first contact, not permission to use either channel interchangeably. |
| Voicemail | An unticked option appears only for calls. Permission is specifically to leave a voicemail saying Lutheran Care called. Changing the number or contact method clears this permission. |
| Contact instructions | Optional; up to 200 characters. Invites times to avoid and other contact instructions, with a time-zone hint for people outside the NT. |
| Conversation topic | Optional; up to 600 characters on adult, 15–17 and guardian routes. Requests only an outline and asks people to save sensitive details for the conversation. Omitted from the under-15 self-request and its review data. Guardian requests explicitly omit the child’s name. |
| Guardian authority | Required only for a guardian request and initially unticked: the requester declares parental responsibility or legal authority to make this request. It is a declaration for arranging contact, not verified proof or blanket interview consent. |
| Agreement | Required and initially unticked. Covers contact as selected and the visible information notice. The under-15 self-route uses a simpler agreement limited to contact details; it does not invite or obtain blanket agreement for sensitive information. |

No email, address, date of birth, rank, service number, unit, document upload or survey-completion evidence is collected. The next screen lets the person check and change their details. The layout uses the survey's Lutheran Care logo, typeface and colour treatment, with the information notice visible above agreement.

For a **Text me first** request, a future receiving team should establish a safe arrangement by text before calling. A call permission does not authorise an automatic SMS. No voicemail should be left unless the separate permission remains active. Staff must use the supplied instructions rather than infer safety from a valid phone number.

## Children, young people and guardian requests

The form distinguishes **adulthood at 18** from the OAIC’s practical **capacity presumption at 15**. Section 4 of the [NT Age of Majority Act 1974](https://legislation.nt.gov.au/api/sitecore/Act/PDF?id=11583) sets full age at 18. [OAIC Chapter B, B.59–B.61](https://www.oaic.gov.au/privacy/australian-privacy-principles/australian-privacy-principles-guidelines/chapter-b-key-concepts) does not set a universal age of privacy consent: capacity depends on understanding. Fifteen is a permitted presumption where individual assessment is impracticable or unreasonable, unless circumstances indicate otherwise.

The earlier under-15 stop screen was an implementation choice, not a legal ban. It is replaced by the following routes:

| Route | Contact record and follow-up |
| --- | --- |
| Self, 18 or older | Own preferred name, safe phone and contact permissions; topic optional. |
| Self, 15–17 | The same minimal fields. The page says a worker will explain the conversation and discuss permission or support before participation. |
| Self, under 15 | Own preferred name, safe phone, contact permission and optional contact instructions only. No discussion-topic field, including in the whitelisted review data. The page explains that a worker will explain taking part and discuss permission first. |
| Parent or guardian, child under 18 | Parent or guardian’s own preferred name, phone, contact permissions and authority declaration, plus the child’s broad age band. No child’s name, date of birth or private history is requested. |

`contactRoute()` recognises `self_adult`, `self_youth`, `self_child`, `guardian_youth` and `guardian_child`. An adult target is not valid on the child/guardian route. Changing the requester or age band clears personal fields, contact permissions, guardian declaration and consent, so adult or guardian details cannot silently become a child’s request. Guardian declarations are omitted from self-request review data. The under-15 self-route never serialises an old or injected topic value.

The request is **not consent to an interview, recording, counselling or collection of further sensitive information**. When arranging a minor’s conversation, workers must establish understanding, appropriate permission and willingness before proceeding. A guardian checkbox records an assertion; workers verify authority if needed. Children can ask for help understanding the form. A self-request does not automatically notify a parent, especially where doing so could be unsafe. The programme needs a staff process for these decisions when collection is activated. See [the focused legal review](LEGAL_REVIEW.md) and [the child-participation review](CHILD_PARTICIPATION_REVIEW.md). The latter also explains the separate main questionnaire’s assistance and under-7 routes; those changes do not turn a contact request into interview consent.

## Free resource

The same free digital resource is offered beneath the contact form and review screen, and on the finish screen. It is available without providing contact details or agreeing to a conversation. `thank-you-resource.js` supplies the title and public URL for both forms. An empty or invalid URL displays an inactive button and **Available soon**. A configured link must use HTTPS without embedded credentials; it opens in a new tab with `noopener noreferrer` and `referrerpolicy="no-referrer"`. No answers, contact details or participant identifiers are added to the destination.

## Information notice and sources

The participant notice identifies Lutheran Care, explains that details are for arranging the consultation, describes intended custody and staff access, separates contact details from survey answers and reports to Defence, and provides ways to update details, cancel contact, seek access or raise a concern. It does not repeat the anonymous survey's inability-to-withdraw wording: a contact request is identifiable and can be located by its contact details. Cancelling contact does not promise immediate deletion of records that Lutheran Care must retain.

Official sources checked on 25 September 2026:

- [Lutheran Care NT Central Intake Enquiry Form](https://www.lutherancare.org.au/nt-cis-enquiries/) provides a relevant safe-contact example. Its broader referral fields and response-time promise are not adopted here.
- [Lutheran Care’s current Confidentiality and Privacy Policy and Procedure, v12, June 2026](https://www.lutherancare.org.au/wp-content/uploads/2026/06/Confidentiality-and-Privacy-Policy-and-Procedure-2026_v12.pdf) describes necessary collection, consent including children’s capacity, authorised access, lawful disclosure, records handling and rights. It does not identify this programme’s receiving platform, processing country or retention period. The form links to the [public privacy-policy page](https://www.lutherancare.org.au/privacy-policy/). This current policy supersedes the earlier version 9 PDF used in the first contact-form note; see the [public-practice record](copy/lc-public-practice.md).
- [LC contact details](https://www.lutherancare.org.au/contact-us/) and [Feedback and Complaints](https://www.lutherancare.org.au/feedback-and-complaints/) support the general phone and feedback email shown in the form. These are organisational contacts, not a verified dedicated Defence-programme intake number.
- [OAIC APP 3](https://www.oaic.gov.au/privacy/australian-privacy-principles/australian-privacy-principles-guidelines/chapter-3-app-3-collection-of-solicited-personal-information) supports collecting only information reasonably necessary for the purpose and obtaining appropriate consent for sensitive information. [APP 5](https://www.oaic.gov.au/privacy/australian-privacy-principles/australian-privacy-principles-guidelines/chapter-5-app-5-notification-of-the-collection-of-personal-information) explains collection notices, including purpose, usual disclosures, rights and applicable overseas disclosures. [APP 11](https://www.oaic.gov.au/privacy/australian-privacy-principles/australian-privacy-principles-guidelines/chapter-11-app-11-security-of-personal-information) covers protection and appropriate destruction or de-identification when information is no longer needed, subject to retention obligations.
- The [NT Information Commissioner's overview](https://infocomm.nt.gov.au/privacy/overview) explains that the Information Act privacy scheme concerns NT public-sector organisations. It does not apply automatically to every private charity operating in the NT; relevant service contracts may impose additional obligations.
- [NT child-protection reporting guidance](https://nt.gov.au/law/crime/report-child-abuse) and [NT domestic and family violence information-sharing guidance](https://tfhc.nt.gov.au/__data/assets/pdf_file/0019/234064/information-sharing-administrative-guidelines.pdf) support retaining lawful safety-disclosure exceptions. A mention of a disagreement or family difficulty is not, by itself, a direction to report it; the relevant statutory threshold and circumstances govern staff action.

## Current implementation and real collection

This is a formal-looking internal review build. `contact-model.mjs` owns the field limits, validation and notice; `contact.js` holds entered details only in page memory. There is no receiving endpoint, storage API, local/session storage, answer download or email submission. `contact.html` sets `connect-src 'none'` and `form-action 'none'`; external privacy links use a no-referrer policy. Leaving the page clears the in-memory request and rendered details, including when returning through the browser's back/forward cache.

The flow ends with **Thank you for helping improve support in our NT communities.**, the shared resource and options to review or clear details. It does not claim receipt, an appointment or a promised callback. Use invented details for team walkthroughs. Public hosting can still receive ordinary page-request metadata; this implementation's claim is that entered form contents are not transmitted to a receiver.

Before replacing this review flow with real collection, the implementation and notice need to describe the actual Lutheran Care receiving record, authorised access, provider and any overseas processing, and applicable retention arrangements. Those facts cannot be inferred from the organisation-wide policy or supplied by a generic disclaimer. The receiving process must also preserve contact permissions, the separation from anonymous survey responses and staff decisions about minors’ capacity, permission and willingness. This is the remaining operational work for activation, not a claim that the prototype already collects information or guarantees legal compliance.
