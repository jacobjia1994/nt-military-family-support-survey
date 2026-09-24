---
name: NT Life and support
description: A clear, restrained questionnaire for participant and team review.
colors:
  primary: "#185c52"
  ink: "#202523"
  text: "#28322e"
  muted: "#5d6963"
  paper: "#ffffff"
  soft: "#f5f7f6"
  line: "#dce3df"
  selected: "#edf6f3"
  error: "#a52b24"
typography:
  body:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    fontSize: "16px"
    lineHeight: 1.6
rounded:
  button: "6px"
  choice: "7px"
  panel: "8px"
---

# NT Life and support: implemented design

## Overview

The interface should feel like a considered, ordinary survey: direct questions, familiar controls and enough space to read comfortably. Jacob requested a beautiful, simple experience without conspicuous AI writing or decorative interface conventions. The implementation uses a quiet page with one main task at a time; related questions can share a page.

This record describes the code built on 24 September 2026. It is not human acceptance, a validated questionnaire or a complete accessibility audit. Jacob and the team still review wording, participation scope and the experience before real use. Product boundaries are in `PRODUCT.md`.

## Colors

White is the main surface. Deep teal identifies actions, selected choices, links and progress. Dark ink carries headings; muted text is reserved for supporting information. Pale grey distinguishes the demo notice, help text and explanatory panels. Borders provide structure without competing with the questions. Errors use red text together with a written explanation.

The values above come from `survey.css`. The independently styled results page shares the main white, ink, teal, grey and border colors, with small differences in secondary text and selected tints. It does not introduce a separate visual identity.

## Typography

System sans-serif type is used throughout; there are no web-font downloads or display serifs. The base text is 16px with a 1.6 line height. Introductory copy is slightly larger. Questions and headings use weight 650, with supporting hints at 13–14px. Survey headings scale within a modest range; the results page uses fixed heading sizes at its breakpoints. Tables and results use tabular numerals.

Copy names the task plainly. Buttons say “Continue”, “Back”, “Skip this page” or “Finish”. Necessary timeframes and branch instructions stay close to their questions. Generic page introductions and repeated skipping reminders are omitted.

## Layout

The questionnaire is a single column, at most 680px wide, with no site header, branding bar, navigation or site footer. Its opening identifies it as a draft that does not collect responses. A single “About your answers” control makes participation and privacy information available throughout. The question library and guide use a 760px reading column; review navigation belongs only on those separate staff pages.

The survey has five named sections. Progress reflects the section, not an invented completion percentage. The route grows with selected needs; two adequacy questions share a page. The wider results page pairs charts on desktop and stacks them on mobile. Detailed tables scroll horizontally when necessary.

At 760px and below, navigation wraps, page margins reduce to roughly 20–22px and content becomes a single column. Most choices already occupy a full row; the age chooser remains two columns until 360px. Primary survey buttons have a 48px minimum height, choices at least 56px, and text inputs use 16px type. These are implemented accommodations, not evidence of testing with every device or assistive technology.

## Elevation & Depth

The pages use flat surfaces, thin borders and spacing. There are no decorative shadows, gradients or background textures. A checked choice gains a light tint and inset border so its state is visible beyond the native control. Short hover transitions are functional; reduced-motion preferences disable them.

There is intentionally no photography, illustration or institutional logo. The questionnaire does not need an image to explain the task, and no endorsement is implied by borrowed branding.

## Shapes

Controls have gently rounded corners rather than pill shapes. Radio buttons, checkboxes, select menus and text areas retain familiar forms. Labels are clickable with their controls. Keyboard focus is visible; errors are written in text, and section changes place focus on the question heading.

## Components

- **Question flow:** answers stay available when using the in-page Back and Change controls. Changing needs, priority or help-seeking removes follow-ups that no longer apply. Most questions are optional; required connection and location questions explain what is needed to continue.
- **Age paths:** adults 18+, young people 12–17 and children 7–11 receive different wording and support-area lists. Under 7 opens a conversation guide with no answer collection. Younger-person paths are available for staff walkthroughs; the age bands do not establish consent arrangements.
- **Answer review:** the last section lists current answers and offers a Change action beside each question. Finishing the demo does not submit anything. A respondent can download their own answers as JSON or clear them and start again.
- **Question library:** All questions is generated from the same definitions as the survey. Reviewers can switch age and NT/outside-NT location, read options and branching explanations, and print the wording. It includes all three help-seeking variants and the under-seven guide.
- **Review notes:** section notes are associated with their age and location variant. They remain available while switching those filters in the open page, and can be downloaded as Markdown. They are held only in page memory, with no saved copy; download them before refreshing or leaving.
- **Answer handling:** survey responses also live only in page memory. There is no response endpoint, analytics tracker or persistent browser storage. Downloads are explicit local actions. The notice and finish page make this limitation clear.
- **Example results:** 136 deterministic fictional records remain separate from anything entered into the survey. Filters, chart counts, denominators, detailed tables, CSV export and print controls preserve the existing analysis. The fictional-data notice stays above the filters; methodological cautions remain available below and beside the results.

## Do's and Don'ts

- Keep the question, its options and the next action easy to locate.
- Preserve plain wording, stable answer IDs and meaningful differences between answer paths.
- Review content through the full question library as well as the interactive flow; read questions aloud before accepting them.
- Keep decoration out of the respondent's way. Do not add dashboard furniture, stock portraits, ornamental section numbers or promotional headlines.
- Do not describe entered answers as submitted, saved for later or included in the example results.
- Do not present this implementation as consent approval, representative NT findings or a validated instrument.

## References and dependencies

The implementation borrows established patterns rather than another product's branding or source code:

- [Tally customization](https://tally.so/help/customize-your-form): restrained document-style presentation and control over typography, widths and fields.
- [Typeform question pages](https://help.typeform.com/hc/en-us/articles/38099463383188-How-to-add-multiple-questions-to-a-form-page): focused questions, with related questions grouped where useful.
- [GOV.UK question pages](https://design-system.service.gov.uk/patterns/question-pages/) and [check answers](https://design-system.service.gov.uk/patterns/check-answers/): clear labels, short hints, reversible navigation and an answer-review step.
- [Typeform accessibility checker](https://help.typeform.com/hc/en-us/articles/11826172113812-Check-if-your-form-is-accessible): practical attention to text, controls, contrast and alternative text. Referencing it does not certify this site.

The site remains dependency-free HTML, CSS and JavaScript. [SurveyJS Form Library](https://github.com/surveyjs/survey-library), licensed under MIT, was considered as an optional engine for future complexity; it is not imported. [Formbricks](https://github.com/formbricks/formbricks) was reviewed as a mature survey platform, but its server stack and AGPL core are not dependencies of this demo.
