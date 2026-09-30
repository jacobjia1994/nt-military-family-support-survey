# Greater Darwin Defence Family Support Survey

The [adult survey](index.html) uses four pages: Welcome, A bit about you, Your experience, and Thank you. The main page has six written questions and one final comment, each allowing up to 5,000 characters. Every visible question requires a response. Choices include Prefer not to answer; numeric groups offer an explicit refusal; text requires non-whitespace content within the 5,000-character limit.

Jacob selected this single open-response questionnaire on 30 September 2026. The detailed-choice questionnaire and the youth/younger-child questionnaire entry have been removed. Previous instruments remain recoverable through Git history. See [ADULT_SURVEY.md](ADULT_SURVEY.md) for the current wording and editing scope.

The thank-you page links to the separate [interview request](contact.html) and [NT support finder](support.html). These resources operate independently of survey answers.

## Local checks

Serve the repository root over HTTP and open `index.html`. The static ES module loads its specification from `adult-survey/survey-spec.json`.

```sh
node --test tests/*.test.mjs
```

The survey has no answer receiver or analytics. Unfinished progress is automatically saved in this browser after adult agreement and can be resumed on the same device/browser for up to 30 days since the last save. Closing/reopening does not send drafts to Lutheran Care. Saved progress can be cleared; completion clears the local draft. Browser data cleanup, private mode and browser eviction can prevent recovery. The app reports saving failures without losing the current in-page text.

`Confirm and submit` ends this presentation with neutral thanks; it does not deliver a completed response to a receiver. The independent interview request remains separate. Real collection still requires Lutheran Care’s receiving arrangement and project-specific information handling.
