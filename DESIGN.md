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

Below 760px, the outer frame disappears into a white page; padding becomes 24px and the logo is 151px wide. The start button fills the reading width, and age choices stack vertically. At 360px and below, horizontal padding becomes 20px.

Radio and checkbox options use full clickable rows, a 56px minimum height, a fine border and modest rounding. Selected options gain a pale orange tint and a terracotta border as well as a checked control. Primary buttons are at least 52px high. Text fields use 17px type and text areas have a 156px minimum height. Keyboard focus has a visible orange outline; reduced-motion settings remove the short choice transitions.

The five-section progress indicator uses thin lines and a section label. Related questions can share a page. Back, Skip this page, Continue and Change remain plain, predictable actions. The final review lets people check answers before finishing.

## Preserved questionnaire behaviour

Adult, youth and child wording, NT/outside-NT variants, and conditional follow-ups remain in the shared question definitions. Changing an earlier answer removes follow-ups that no longer apply. Under 7 opens a conversation guide. The separate question library and staff review pages remain outside the respondent flow.

Formal presentation does not establish response collection. The current frontend has no receiver: answers remain in page memory, and the finish screen offers a local download or further changes without claiming successful submission. Selection and configuration of a private collection platform are pending. Do not add a submission-success message before a real receiving service confirms receipt.

## Reference sources

- [Official Lutheran Care logo](https://www.lutherancare.org.au/wp-content/uploads/2022/09/Lutheran-Care-Logo_H_HIRES-1024x404.png), [website child styles](https://www.lutherancare.org.au/wp-content/themes/enacare-child/style.css) and [base styles](https://www.lutherancare.org.au/wp-content/themes/enacare/assets/css/enacare-core.css): logo, observed colours and typography.
- [Karla source](https://github.com/google/fonts/tree/main/ofl/karla) and [SIL OFL](https://raw.githubusercontent.com/google/fonts/main/ofl/karla/OFL.txt): the self-hosted variable font and its licence.
- [SurveyJS Form Library](https://github.com/surveyjs/survey-library) and [theme documentation](https://surveyjs.io/documentation/themes-and-custom-styles): restrained layouts without individual question panels, consistent control states and theme variables.
- [GOV.UK Frontend](https://github.com/alphagov/govuk-frontend) and [question-page guidance](https://design-system.service.gov.uk/patterns/question-pages/): clear labels, short hints and reversible navigation.
- [Formbricks](https://github.com/formbricks/formbricks): focused survey presentation and branded controls.

SurveyJS, GOV.UK Frontend and Formbricks informed the design; their code and platforms are not dependencies. The questionnaire remains plain HTML, CSS and JavaScript with local brand and font assets.
