# Greater Darwin Defence Family Support Survey

Two adult questionnaire alternatives are available for team review:

- [Detailed choices](index.html) — the v4 choice-led questionnaire, with a 20-category issue list, structured need/source/outcome follow-up for up to two issue areas, and an optional 10,000-character explanation for each priority need.
- [Open responses](open-response.html) — the v4B written-response questionnaire, with the same opening, background questions and issue list, followed by optional written questions for up to two areas and two needs per area.

The [team comparison page](compare.html) links to both. [Youth and younger-child routes](youth.html) remain separate. These two adult versions supersede the earlier RAND Q1–Q67 adult page; its source data, renderer and [crosswalk](RAND_ITEM_CROSSWALK.md) remain in the repository as historical work, not the current entry route.

Both specifications were supplied by Jacob from his ChatGPT 6 Pro work. Their common front and back pages and issue catalogue are identical except for the open version’s “What to expect” paragraph. See [SURVEY_VARIANTS.md](SURVEY_VARIANTS.md) for source-package hashes and the editing workflow. The source material is adapted from [RAND MG-1124 Appendix A](https://www.rand.org/content/dam/rand/pubs/monographs/2011/RAND_MG1124.pdf); this site does not claim RAND endorsement.

## Local checks

Serve the repository root over HTTP, then open both entry pages. These are static ES modules that load their specifications from `survey-variants/`.

```sh
node scripts/sync-dual-survey-common.mjs
node --test tests/*.test.mjs survey-variants/choice/*.test.mjs survey-variants/open/*.test.mjs
```

The survey pages have no answer receiver, browser answer storage or analytics. `Finish survey` displays the supplied thank-you wording without claiming receipt. Before any real collection is activated, Lutheran Care must determine the actual collection platform and project-specific information handling, then verify an end-to-end submission path. These technical facts belong in project documentation rather than the respondent-facing text for this team review build.
