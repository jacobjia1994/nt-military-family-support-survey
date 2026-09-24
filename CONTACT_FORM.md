# Conversation request form

`contact.html` is the separate opt-in form for people who would like to speak with Lutheran Care about their experience of Defence family life and the support that would help. It follows the consultation concept recovered from Thursday's ChatGPT task **讨论项目理解** (`6ab46d41-1b10-83ec-aab1-b6eeca5f3201`).

Its purpose is to arrange a consultation conversation. It is not a service intake assessment, a counselling referral or a confirmed appointment. Completing the main survey is not a condition of using this form. The form does not receive survey answers, response IDs or other identifiers linking a request to an anonymous response.

## Fields and interaction

| Field | Requirement and purpose |
| --- | --- |
| Age group | Required before contact fields appear: 15 or older / under 15. Used only to choose the self-completion or staff-assisted route. |
| Name to use | Required; up to 80 characters. A preferred name is sufficient; no legal name or surname is requested. |
| Phone number | Required; 7–15 digits, allowing spaces, parentheses, hyphens and an initial `+`. Accommodates landlines and international numbers as well as Australian mobiles. It checks format, not ownership or whether the number can receive texts. |
| Safe first contact | Required, with no default: **Call me** or **Text me first**. These are explicit permissions for the first contact, not permission to use either channel interchangeably. |
| Voicemail | An unticked option appears only for calls. Permission is specifically to leave a voicemail saying Lutheran Care called. Changing the number or contact method clears this permission. |
| Contact instructions | Optional; up to 200 characters. Invites times to avoid and other contact instructions, with a time-zone hint for people outside the NT. |
| Conversation topic | Optional; up to 600 characters. Requests only an outline, asks people to save sensitive details for the conversation and omit other people's names. |
| Agreement | Required and initially unticked. Covers contact as selected and the information handling described in the visible notice, including sensitive information the person chooses to provide. |

No email, address, date of birth, rank, service number, unit, document upload or survey-completion evidence is collected. The next screen lets the person check and change their details. The layout uses the survey's Lutheran Care logo, typeface and colour treatment, with the information notice visible above agreement.

For a **Text me first** request, a future receiving team should establish a safe arrangement by text before calling. A call permission does not authorise an automatic SMS. No voicemail should be left unless the separate permission remains active. Staff must use the supplied instructions rather than infer safety from a valid phone number.

## Younger participants

The under-15 selection hides contact fields and clears any details previously entered. It directs the person to speak with Lutheran Care or the worker who invited them before providing details through this form; a trusted person may help. It neither collects a parent's details nor triggers parent contact.

This is an operational route for a simple unassisted form, not a claim that Australian law sets a universal age of privacy consent. [OAIC guidance, Chapter B, paragraphs B.59–61](https://www.oaic.gov.au/privacy/australian-privacy-principles/australian-privacy-principles-guidelines/chapter-b-key-concepts) bases children's consent on capacity and permits a presumption of capacity from age 15 where individual assessment is impracticable or unreasonable, unless there is reason to think otherwise. Staff still need to consider understanding and appropriate support when arranging a young person's participation.

## Information notice and sources

The participant notice identifies Lutheran Care, explains that details are for arranging the consultation, describes intended custody and staff access, separates contact details from survey answers and reports to Defence, and provides ways to update details, cancel contact, seek access or raise a concern. It does not repeat the anonymous survey's inability-to-withdraw wording: a contact request is identifiable and can be located by its contact details. Cancelling contact does not promise immediate deletion of records that Lutheran Care must retain.

Official sources checked on 25 September 2026:

- [Lutheran Care NT Central Intake Enquiry Form](https://www.lutherancare.org.au/nt-cis-enquiries/) provides a relevant safe-contact example. Its broader referral fields and response-time promise are not adopted here.
- [Lutheran Care's public Confidentiality and Privacy Policy](https://www.lutherancare.org.au/wp-content/uploads/2022/06/Doc-1.-Confidentiality-Policy-and-Procedure-July-2021-v.9.pdf) describes informed consent, restricted access by workers who need the information, access/correction and records handling. The posted PDF is version 9, July 2021, with a July 2023 review date; it does not verify the present storage platform or retention period for this programme. The form links to the [public privacy-policy page](https://www.lutherancare.org.au/privacy-policy/).
- [LC contact details](https://www.lutherancare.org.au/contact-us/) and [Feedback and Complaints](https://www.lutherancare.org.au/feedback-and-complaints/) support the general phone and feedback email shown in the form. These are organisational contacts, not a verified dedicated Defence-programme intake number.
- [OAIC APP 3](https://www.oaic.gov.au/privacy/australian-privacy-principles/australian-privacy-principles-guidelines/chapter-3-app-3-collection-of-solicited-personal-information) supports collecting only information reasonably necessary for the purpose and obtaining appropriate consent for sensitive information. [APP 5](https://www.oaic.gov.au/privacy/australian-privacy-principles/australian-privacy-principles-guidelines/chapter-5-app-5-notification-of-the-collection-of-personal-information) explains collection notices, including purpose, usual disclosures, rights and applicable overseas disclosures. [APP 11](https://www.oaic.gov.au/privacy/australian-privacy-principles/australian-privacy-principles-guidelines/chapter-11-app-11-security-of-personal-information) covers protection and appropriate destruction or de-identification when information is no longer needed, subject to retention obligations.
- The [NT Information Commissioner's overview](https://infocomm.nt.gov.au/privacy/overview) explains that the Information Act privacy scheme concerns NT public-sector organisations. It does not apply automatically to every private charity operating in the NT; relevant service contracts may impose additional obligations.
- [NT child-protection reporting guidance](https://nt.gov.au/law/crime/report-child-abuse) and [NT domestic and family violence information-sharing guidance](https://tfhc.nt.gov.au/__data/assets/pdf_file/0019/234064/information-sharing-administrative-guidelines.pdf) support retaining lawful safety-disclosure exceptions. A mention of a disagreement or family difficulty is not, by itself, a direction to report it; the relevant statutory threshold and circumstances govern staff action.

## Current implementation and real collection

This is a formal-looking internal review build. `contact-model.mjs` owns the field limits, validation and notice; `contact.js` holds entered details only in page memory. There is no receiving endpoint, storage API, local/session storage, answer download or email submission. `contact.html` sets `connect-src 'none'` and `form-action 'none'`; external privacy links use a no-referrer policy. Leaving the page clears the in-memory request and rendered details, including when returning through the browser's back/forward cache.

The flow ends with **Thank you for your time**, with options to review or clear details. It does not claim receipt, an appointment or a promised callback. Use invented details for team walkthroughs. Public hosting can still receive ordinary page-request metadata; this implementation's claim is that entered form contents are not transmitted to a receiver.

Before replacing this review flow with real collection, the implementation and notice need to describe the actual Lutheran Care receiving record, authorised access, provider and any overseas processing, and applicable retention arrangements. Those facts cannot be inferred from the old public policy or supplied by a generic disclaimer. The receiving process must also preserve contact permissions and the separation from anonymous survey responses. This is the remaining operational work for activation, not a claim that the prototype already collects information or guarantees legal compliance.
