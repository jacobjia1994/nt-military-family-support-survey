# Greater Darwin Defence Family Support Survey

The [adult survey](index.html) has four stages: Welcome, A bit about you, Experiences, and Thank you. The first visit to Experiences shows the introduction and Start describing your experience before the questions. Each experience has the same five core questions and one optional additional question; all six written answers may be left blank. Respondents can add as many experiences as they choose, move back and forward to edit, or delete an experience with confirmation. At least one experience remains.

Finish survey opens a complete review of the background and every experience in question order. Full answers are visible, with blank answers marked Not answered. Respondents can edit the background or an individual experience and return to review. The identifying-information confirmation is required before Confirm and submit opens Thank you.

Answers exist only in the current page’s memory. Back/Next and review edits retain them while the page is running. There is no autosave or restoration after refreshing or closing. The app does not read, write or delete historical browser storage; earlier saved data is left untouched. There are no answer receivers, analytics or third-party answer submissions.

The thank-you page links to [Request an interview](contact.html) and [Find support in the NT](support.html). These resources operate independently of survey answers. RAND and Defence strategy source links are directly visible in the Welcome footer.

## Local checks

Serve the repository root over HTTP and open index.html. The static ES module loads adult-survey/survey-spec.json.

```sh
node --test tests/*.test.mjs
```

Use a bounded desktop and 375px browser check for the first introduction gate, in-page navigation, multiple experiences, inline Other fields, whole-answer review and edit/return, confirmation, 5,001-character correction, refresh reset and zero storage access. See [ADULT_SURVEY.md](ADULT_SURVEY.md) for the current contract.
