---
name: Lutheran Care Defence family questionnaire
description: A welcoming, restrained questionnaire for Defence members and families in the Northern Territory.
colors:
  primary: "#b94626"
  ink: "#30312f"
  text: "#41423f"
  muted: "#666963"
  page: "#faf9f6"
  surface: "#ffffff"
  soft: "#f6f4f0"
  line: "#e1ded8"
  selected: "#fff3ed"
  error: "#a32424"
typography:
  family: 'Karla, Arial, sans-serif'
  body: "18px / 1.6"
  mobileBody: "17px / 1.6"
rounded:
  button: "7px"
  choice: "8px"
  desktopShell: "16px"
---

# Lutheran Care questionnaire: implemented design

Updated 24 September 2026. The respondent presentation is defined by `index.html`, `survey.js` and `lutheran-care.css`, which overrides the shared `survey.css` styles. Product and collection arrangements are recorded in `PRODUCT.md`.

## Direction

This is a questionnaire with a clear institutional owner. The opening identifies Lutheran Care, explains the Defence-funded program and invites people to help shape useful local support. The respondent page has no website navigation, promotional panels, review links or draft/test badges. Its warmth comes from the wording, familiar branding and generous spacing.

Use natural Australian English: Defence, family members, local connections and support. Explain the value of taking part without promises that every suggestion will be implemented. Keep necessary participation and privacy information short; “About your answers” remains available throughout. Each question should be easy to understand when read aloud.

## Brand and typography

The official Lutheran Care logo is stored at `assets/lutheran-care-logo.png`. The current website uses warm orange, terracotta and pink colours, and Karla for body text; its child stylesheet uses Circe for headings. These are observed website choices, not a complete brand manual or a claim of formal brand approval.

The questionnaire uses locally hosted Karla throughout, from `assets/Karla-Variable.ttf`, with its SIL Open Font License at `assets/Karla-OFL.txt`. This keeps the type consistent without an external font request. The deeper action colour `#b94626` is an adaptation of the website's `#d3502d`; it provides about 5.29:1 contrast with white button text. The logo is displayed unchanged.

Desktop opening headings are 44px with a 1.12 line height; question headings are 32px. At the mobile breakpoint they become 35px and 29px. Body text is 18px on desktop and 17px on mobile, with smaller supporting text. Questions and options remain more prominent than hints and progress information.

## Layout and controls

A warm off-white page holds a white questionnaire shell, up to 896px wide with 72px horizontal padding. The header contains a 180px logo and a small “Defence family support / Northern Territory” label, followed by a fine rule. There is no shadow, background image, illustration or decorative animation.

Below 760px, the outer frame disappears into a white page; padding becomes 24px and the logo is 151px wide. The start button fills the reading width, and the adult/under-18 route choices stack vertically. The under-18 age choices use two columns until the narrowest screens, when they also stack. At 360px and below, horizontal padding becomes 20px.

Radio and checkbox options use full clickable rows, a 56px minimum height, a fine border and modest rounding. Selected options gain a pale orange tint and a terracotta border as well as a checked control. Primary buttons are at least 52px high. Text fields use 17px type and text areas have a 156px minimum height. Keyboard focus has a visible orange outline; reduced-motion settings remove the short choice transitions.

The four-section progress indicator uses thin lines and a section label. Related questions can share a page. Back, Continue and Change remain plain, predictable actions. The final review lets people check answers before finishing.

## Preserved questionnaire behaviour

Adult, youth and child wording, NT/outside-NT variants, and conditional follow-ups remain in the shared question definitions. Changing an earlier answer removes follow-ups that no longer apply. Under 7 opens a guardian-supported response form with separate child views and guardian observations. The separate question library and staff review pages remain outside the respondent flow.

Formal presentation does not establish response collection. The current frontend has no receiver: answers remain in page memory, and the finish screen offers a local download or further changes without claiming successful submission. Selection and configuration of a private collection platform are pending. Do not add a submission-success message before a real receiving service confirms receipt.

## Reference sources

- [Official Lutheran Care logo](https://www.lutherancare.org.au/wp-content/uploads/2022/09/Lutheran-Care-Logo_H_HIRES-1024x404.png), [website child styles](https://www.lutherancare.org.au/wp-content/themes/enacare-child/style.css) and [base styles](https://www.lutherancare.org.au/wp-content/themes/enacare/assets/css/enacare-core.css): logo, observed colours and typography.
- [Karla source](https://github.com/google/fonts/tree/main/ofl/karla) and [SIL OFL](https://raw.githubusercontent.com/google/fonts/main/ofl/karla/OFL.txt): the self-hosted variable font and its licence.
- [SurveyJS Form Library](https://github.com/surveyjs/survey-library) and [theme documentation](https://surveyjs.io/documentation/themes-and-custom-styles): restrained layouts without individual question panels, consistent control states and theme variables.
- [GOV.UK Frontend](https://github.com/alphagov/govuk-frontend) and [question-page guidance](https://design-system.service.gov.uk/patterns/question-pages/): clear labels, short hints and reversible navigation.
- [Formbricks](https://github.com/formbricks/formbricks): focused survey presentation and branded controls.

SurveyJS, GOV.UK Frontend and Formbricks informed the design; their code and platforms are not dependencies. The questionnaire remains plain HTML, CSS and JavaScript with local brand and font assets.

## Visible information and participation choice

The invitation starts with an everyday question rather than institutional process. Funding remains explicit in a quieter line. A 14px, fully visible participant-information block follows the invitation and precedes Start; it uses labelled paragraphs in two columns on desktop and one column on mobile. It identifies purpose, Lutheran Care custody/approved systems, authorised project readership, de-identified Defence reporting, retention/withdrawal and contact/rights. The dialog remains only a secondary way to reread the same shared text later in the form.

After the adult/under-18 route choice, adult consent and young-person assent use unticked explicit choices. Under-18s choose a finer age path to retain existing questions and permission steps. Adults answer one questionnaire and can give a non-overlapping age band as an optional background answer. Changing age clears the earlier choice. Assent is recorded as assent, with no implication of completed parental permission or capacity assessment. The actual intake platform, applicable retention/withdrawal procedure and child participation arrangements still require LC confirmation before live collection.

## Separate conversation request

`contact.html` uses the same unchanged Lutheran Care logo, locally hosted Karla, terracotta action colour and flat white questionnaire shell. After a short age choice, people aged 15 or older see one page of contact fields; under-15s receive a staff-assisted contact route. Preferred name and phone sit side by side on desktop and stack below 760px. The heading is 38px on desktop and 32px on mobile; introductory text is 18px and 17px respectively.

First-contact method is an explicit choice. Voicemail permission appears only for calls and starts unticked. Optional contact instructions and a brief topic follow the essential fields. The information notice remains fully visible in 14px text above the separate consent checkbox. Familiar controls lead to a details review with a Change action, then a neutral “Thank you for your time” finish. This independent form does not inherit or link survey answers. The current review build has no receiver, persistent storage or details download, and its finish does not claim receipt or a confirmed appointment.


## Direct experience questions and inclusive contact routes

Updated 25 September 2026. The questionnaire displays all applicable area questions without an accordion. Background precedes needs; the repeated closing ideas page is removed. Yes to extra support reveals a specific-support text box, with the same existing type and control treatment. A wrapping flex footer places About your answers at the left and Arrange a conversation at the right. The completion view puts the conversation link before the shared resource.

The contact form now offers self and guardian routes, with adult, 15–17 and under-15 age groups where applicable. Guardian labels request the adult’s own details. Under-15 self-contact omits the topic narrative and explains the initial contact purpose. Its footer and finish show the same resource without requiring contact registration. Both new contact and resource links open separately and without a referrer; no form data enters their URL.


## Inline Other and younger-child form

Updated 25 September 2026. The support-needed choice sits above the conditional area checklist. The Other option and its conditional text field share a full-width grid item, keeping the field immediately below the checkbox. Existing label, hint, field and focus styling is retained. The interview action is consistently Request an interview.

The under-7 form uses the same shell and form controls: one response box per child prompt plus a visibly separate guardian-observation area, or an observation-only mode. No new visual identity or nested decorative panels are introduced. The under-15 assistance interruption uses a plain heading, short explanation, explicit guardian-presence choice and a private LC help action.


The under-7 mode selector was removed after Jacob’s review. Four child-response fields appear directly above Your observations on one page, with no What would you like to share step. Existing guardian permission is retained; child willingness controls the child fields only, leaving the observations box usable independently.


## Standalone support finder

`support.html` extends the established Lutheran Care visual system without changing the questionnaire flow. The page uses the same logo, self-hosted Karla, warm paper/white surfaces, terracotta action colour and mobile shell. Its main task is navigation: a visible urgent-help strip, six two-column need rows on desktop (one column on mobile), then one concise list of situations and plain service entries. Search and “not sure” are alternate routes, not extra required questions. Each service entry foregrounds region, offer, audience and access caveat before official website and call actions. The first-party resource link accepts only the exact `support.html` relative path, allowing the forms and guide to move together to another host later.


On 25 September Jacob rejected the first support-finder layout as cluttered and text-heavy. The revised finder makes one task dominant: six short topic links immediately under its title. The urgent contacts remain as a slim strip, while search and the unsure route sit after the primary choices. Category views show only specific situations. Service rows show name, purpose, location, decisive limitation and contact action; full audience and access text opens on request. This direction supersedes the earlier two-column descriptive rows and expanded service-entry description above.
