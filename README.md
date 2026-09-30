# Greater Darwin Defence Family Support Survey

The [adult survey](index.html) uses four pages: Welcome, A bit about you, Your experience, and Thank you. The main page has six written questions and one optional final comment, each allowing up to 5,000 characters. Background questions are optional, with area-first location choices, simple dependant counts and numeric NT residence duration.

Jacob selected this single open-response questionnaire on 30 September 2026. The detailed-choice questionnaire and the youth/younger-child questionnaire entry have been removed. Previous instruments remain recoverable through Git history. See [ADULT_SURVEY.md](ADULT_SURVEY.md) for the current wording and editing scope.

The thank-you page links to the separate [interview request](contact.html) and [NT support finder](support.html). These resources operate independently of survey answers.

## Local checks

Serve the repository root over HTTP and open `index.html`. The static ES module loads its specification from `adult-survey/survey-spec.json`.

```sh
node --test tests/*.test.mjs
```

The survey has no answer receiver, persistent browser answer storage or analytics. `Confirm and submit` ends the in-memory walkthrough and displays neutral thanks without claiming that a response has been received. The independent interview request is also a review form without a receiving endpoint. Before real collection, Lutheran Care needs an agreed receiving system and information-handling arrangements, followed by an end-to-end submission check. These implementation details remain in project documentation.
