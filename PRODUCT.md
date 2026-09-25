# NT life and support questionnaire

<!-- impeccable:product-schema 1 -->

## Platform

web

## Purpose and users

This questionnaire supports Lutheran Care’s Defence family support consultation in the Northern Territory. The participant wording and visual presentation are formal, with Lutheran Care named as the project lead. Jacob and the project team need to review its wording, scope and experience before inviting participants. Adult, youth (12–17), child (7–11) and under-seven supported-response paths already exist.

## Operating context

Jacob requested continued development on the Mac mini, a working GitHub link for team review, and a first version to read tonight for tomorrow's presentation. The existing public GitHub repository and GitHub Pages site remain the publication targets. The code is dependency-free HTML, CSS and JavaScript. The 136 fictional results remain a demonstration, separate from entered answers.

## Constraints

- Actual response collection has not been connected. The front end must not claim that answers have been received or submitted. The institution must specify its receiving platform before real collection. No tracking or persistent browser storage is used.
- Preserve meaningful constructs, age and geographical branches, stable answer IDs, and existing result calculations.
- Make all question text and conditional variants available for human review without repeated trial submissions.
- Use plain, natural English and familiar, restrained survey controls. Avoid decorative marketing language and generic AI interface conventions.
- Mobile and keyboard use matter; back navigation must retain answers, and changed answers must clear irrelevant follow-ups.

## Respondent experience

Jacob clarified on 24 September 2026 that this must be a questionnaire, not a website. Omit site navigation, results and review links from the respondent flow. Jacob subsequently requested Lutheran Care’s identity: use its official logo and a quiet project header. Use separate URLs for team resources. Keep only necessary explanations, voluntary participation and accurate privacy information in natural English; no generic legal waivers or invented institutional commitments.

## Invitation and voice

Jacob clarified that concise wording must still give Defence members and families a reason to take part. The opening should recognise their own experience and explain its value to the local community, including families arriving on posting. Use natural Australian English and familiar Defence-community terms. Welcome positive experiences and people who are not seeking help; invite each family member to speak for themselves. This replaces any interpretation of the earlier minimal-copy rule that removes encouragement or purpose. Avoid vague slogans, forced slang and promises of particular service or policy changes.

## Formal presentation and information

On 24 September Jacob requested removal of draft/no-collection labels and the standalone audience boilerplate, formal About your answers text, and a more polished use of LC branding. This supersedes earlier respondent-facing demo labels. Keep the unresolved receiving platform in technical documentation rather than inventing submission or data-handling claims. Formal wording is sourced from the Defence funded-project list, LC’s current privacy policy and project reporting instructions. Most questions are optional; no blanket confidentiality or anonymity guarantee is made.

## Visible participant information

Jacob requires participant information directly below the invitation, in smaller readable type rather than only behind a dialog. State LC custody/approved storage, authorised project access, purpose, de-identified Defence reporting, voluntary participation, relevant sensitivity, retention/withdrawal limits and privacy/access/complaints contact. Use short labelled paragraphs, not a generic liability waiver. Adult express consent and young-person assent are recorded separately; assent does not establish parental permission or capacity assessment. Actual collection still depends on LC confirming its receiving system, records/withdrawal procedure and child participation arrangements.

## Evidence and decisions

The baseline is repository commit ee2cc59. Existing questions are a draft, not an accepted or validated instrument. Jacob and the team retain final wording, participation scope, child participation arrangements, and real data collection decisions. Jacob explicitly requested Lutheran Care branding and formal institution-led wording. Funding is confirmed by the Department of Defence recipient list; describe funding, not an unverified partnership. Design implementation and reversible copy repairs are delegated by the current request.


## Separate conversation request

On 25 September Jacob requested the distinct follow-up contact form discussed in Thursday's ChatGPT task 讨论项目理解. It arranges a service-consultation conversation, with minimal identifiers and no link to anonymous survey answers. `contact.html` inherits the existing identity and operates independently. No email, address, date of birth, rank or service number is requested. Age and requester choices provide adult, young-person and guardian routes. Under-15s can make a minimal contact request for an explanation; guardians can arrange contact for a child using their own details. Staff establish appropriate understanding and permission before an interview. The main form asks for a preferred name, phone, explicit safe first-contact method and consent; contact instructions and topic are optional. Voicemail permission is separate and defaults off. Details stay in page memory in this review build; no receiver or real submission is activated.


## Current question presentation and navigation

Jacob’s later 25 September revisions put optional background before needs, show experience fields directly, and remove the separate repeated closing ideas page. A Yes to extra/different support now opens one optional specific-support text field; experience is asked directly as what worked well or could have been better. Information/advice preferences concern services and support in the NT. A bare independent contact-form link appears opposite About your answers on every survey page and on completion. Both forms use the same community-contribution thank-you and resource configuration. The resource is also available on the contact form without providing details. No link transfers a questionnaire answer or identity marker.


## Need screening and supported child responses

On 25 September Jacob confirmed that people with no support needs should still be able to give service-information preferences. The needs page therefore asks a separate yes/no/uncertain/declined question before displaying the area checklist; Something else only describes an unlisted need and reveals its input directly beneath that option. The experience question invites a concrete account, separately from support requested now. Interview links and the contact page explicitly invite an interview with LC staff about Defence-family difficulties and needs.

Children aged 7–17 describe who is helping before substantive questions. For the unattended under-15 form, self/other-helper answers require a guardian-presence confirmation in addition to the existing guardian permission and child choice; a private LC help route remains. This is a form operating rule, not a claim that other helpers are unlawful. Under 7 has a real response form with distinct child-view and guardian-observation modes. Child views need the guardian’s attestation of willingness; guardian-only observations do not claim child assent. These records use a separate response type and are never treated as adult self-reports.


## Under-7 form simplification

Jacob removed the explicit choice between child views and guardian observations. The under-7 form now displays all four child prompts and Your observations together. The existing willingness confirmation applies only to recording the child’s responses; observations can be provided without it. Response sources stay separate in review and export, inferred from actual answers rather than a selected mode.


The final action in both forms and the younger-child review is labelled **Confirm and submit**, as Jacob requested. This is the formal review interface; the label change does not activate a receiver or add a successful-receipt claim.

## Age route and adult age bands

On 25 September Jacob asked to separate age bands from questionnaire choice. The entrance now distinguishes an adult (18 or older) from someone under 18. All adults use the same questionnaire; their optional age-band question records 18–29, 30–39, 40–49 or 50 or older on the shared connection page, including the earlier-experience route. The requested decade boundaries are expressed without overlap. Under-18s then select the existing finer age path, preserving child/youth wording, guardian permission and assent arrangements. This decision concerns the questionnaire; the independent interview-request form retains its own contact and permission routes.


## Free support finder

On 25 September 2026 Jacob asked for the questionnaire’s free giveout to become a standalone web page that helps NT Defence personnel and families find services in a few clicks. `support.html` is the separate resource; it does not turn the respondent questionnaire into a website or require a survey/contact submission. The current first screen has six need areas rather than 39 options; this routing is under review because Jacob found the labels ambiguous for overlapping situations. The 39 headings from the supplied reference remain subtopics. Urgent contacts are in the footer and a “not sure” route remains. Service cards explain audience, location, offer and access limits, with direct provider links. No finder choice or survey/contact detail is sent to a provider by this site. The initial service records were verified against official provider pages on 25 September 2026 and are maintained in `support-data.mjs`. Availability and eligibility remain provider decisions.


Jacob’s 25 September feedback on the first published finder was that the page was cluttered and showed too much secondary information. The product rule for this resource is clear hierarchy at a glance: detailed service conditions remain available when needed, and urgent help stays easy to find without taking over the page. Jacob subsequently asked to move urgent help to the footer, remove the generic instruction sentence, remove topic search, and reconsider the six-area logic from real user situations rather than rename the same buckets.
