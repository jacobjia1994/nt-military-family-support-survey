# Adult open-response survey

## Current decision

On 30 September 2026, Jacob instructed Codex to retain only the adult open-response questionnaire, remove the detailed-choice version, and temporarily remove the youth and younger-child questionnaire routes. The adult questionnaire has exactly four pages. The interview-request form and NT support finder remain separate resources; the temporary age-route removal applies to the questionnaire.

The existing A bit about you questions, options, geography and conditional fields are retained. Jacob will request later changes to their details. The prior issue checklist, priority-area selection and repeated need/source follow-ups are removed from the current questionnaire.

## Four pages

1. **Welcome:** brief welcome and introduction, participation/privacy information and adult agreement. Keep essential information visible and longer legal/privacy detail available without adding unnecessary reading to the main flow.
2. **A bit about you:** the existing background questions and conditional fields.
3. **Your experience:** the six questions below and a final comment box. Each question is optional and provides a blank written-response field with a 100,000-character limit. Each field reminds respondents to remove identifying information. The page ends with **Confirm and submit**; there is no separate review page.
4. **Thank you:** brief thanks, **Interview request survey** linking to `contact.html`, and **Find local services in NT** linking to `support.html`.

Keep navigation concise. Going back preserves answers while the page remains open. The resource links carry no answers, response IDs or other participant parameters.

## Main questions

**What was difficult for you or your family in the Great Darwin Region in the past 12 months?**

Tell us what happened and how it affected everyday life.

**What help, if any, did you or your family need to deal with these difficulties?**

Include help you received as well as help you needed but could not get. You do not need to know which service could provide it.

**Where did you look for help, and what help did you receive?**

You can include services, online information, friends and family, or help offered without asking. You can also tell us if you managed without help or did not seek any.

**What made it easier or harder to get support outside the military?**

You can also tell us why you chose not to seek or use support.

**How well did the support you received outside the military meet your needs?**

Please explain what it helped with and what it did not. If you used more than one source, say which you mean.

**What help, if any, are you or your family still missing now?**

Tell us what would make the biggest difference, and what would make that help work for you. You can also say that nothing more is needed.

**Is there anything else you want to add?**

The six main questions and final comment use seven independent answer fields. Apply the same 100,000-character limit and identifying-information reminder to every field. Preserve Jacob's supplied question wording, including “Great Darwin Region”.

## Editing and retired routes

The current specification, model, browser app and additional styles live under `adult-survey/`. Shared branding remains in the root styles and assets. Make wording changes in `adult-survey/survey-spec.json`; model and browser tests cover navigation, limits and answer handling.

`index.html` is the sole questionnaire entry. `open-response.html`, `questions.html`, `review.html` and `results.html` redirect to that entry without transferring query parameters or fragments. `compare.html`, `youth.html` and `adult-wording.html` are removed. The dual-variant specification/renderer and synchronization workflow are retired; previous versions can be recovered through Git. Legacy source dictionaries and modules remaining in the repository are historical material and are not loaded by the public entry.

## Collection status

This is a static presentation build. Answers stay in page memory; there is no receiving endpoint, persistent answer store or analytics. Closing or refreshing clears them. **Confirm and submit** ends the walkthrough and shows neutral thanks, without claiming receipt. Do not introduce a collector through this questionnaire revision.

The independent interview-request form is also a review build. Its contact details are not connected to questionnaire answers. `support.html` remains an independent NT-wide service finder and requires neither questionnaire completion nor contact details.

Real collection requires Lutheran Care's receiving system and agreed information-handling arrangements, plus an end-to-end submission check. No claim of research approval or completed response collection is introduced by this revision.
