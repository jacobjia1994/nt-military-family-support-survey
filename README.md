# Greater Darwin Defence Family Support Survey

The [adult survey](index.html) has four stages: Welcome, A bit about you, Your experiences, and Thank you. In Your experiences, each respondent-created page has the same six optional written questions. Respondents can add as many experiences as they choose, return to edit them, or delete an experience with confirmation. At least one blank initial experience remains. Background questions retain their required answers and refusal controls.

The experience prompts cover a situation or ongoing part of life, how respondents or their families dealt with it, access to wanted help, what changed, and missing or better support. They need not describe the most difficult situation or something caused by military service. The sixth question offers optional comments about that experience. The finish action reveals the existing check for identifying information at the end of the current experience; Thank you appears after confirmation.

The thank-you page links to the separate [interview request](contact.html) and [NT support finder](support.html). These resources operate independently of survey answers.

## Local checks

Serve the repository root over HTTP and open `index.html`. The static ES module loads its specification from `adult-survey/survey-spec.json`.

```sh
node --test tests/*.test.mjs
```

Use a bounded desktop and mobile browser check for adding, returning, editing, deleting a middle experience, refreshing/resuming, blank completion, 5,001-character correction and both thank-you resources. See [ADULT_SURVEY.md](ADULT_SURVEY.md) for the current contract.

The survey has no answer receiver or analytics. Unfinished progress is automatically saved in this browser after adult agreement and can be resumed on the same device/browser for up to 30 days since the last save. Closing/reopening does not send drafts to Lutheran Care. Saved progress can be cleared; completion clears the local draft. Browser data cleanup, private mode and browser eviction can prevent recovery. The app reports saving failures without losing the current in-page text.

Older single-experience drafts are converted in memory when opened. Original answers are retained for review, including those that do not match a new question; the stored version changes only after the respondent resumes and saves. Unfamiliar draft versions are kept with a local download option and an explicit confirmed restart choice.

`Confirm and submit` ends this presentation with neutral thanks; it does not deliver a completed response to a receiver. Real collection still requires Lutheran Care’s receiving arrangement and project-specific information handling.
