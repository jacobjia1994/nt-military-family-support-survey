# Greater Darwin Service Member and Family Needs Survey

The current adult website reconstructs the **sample questionnaire in RAND MG-1124, Appendix A**, retaining its Q1–Q67 numbering, original problem pages, needs questions, resource matrices, background items, service-attitude questions and natural closing. [RAND source PDF](https://www.rand.org/content/dam/rand/pubs/monographs/2011/RAND_MG1124.pdf). The [67-item crosswalk](RAND_ITEM_CROSSWALK.md) records every local substitution. US Service, base, welfare and demographic terms are replaced only where the Australian/Greater Darwin context requires it. The funded Lutheran Care project is listed on [Defence's Family Support Funding Program page](https://www.defence.gov.au/adf-members-families/family-programs-local-services/support-communities/defence-community-grants-family-support-funding-program).

The original RAND instrument was designed for adults. [index.html](index.html) is the RAND-based adult route; [youth.html](youth.html) retains separate 8–17 and guardian-supported younger-child local routes. Neither child route is described as a RAND-validated questionnaire. [adult-wording.html](adult-wording.html) is the generated full adult reading copy; [questions.html](questions.html) redirects to it. The historical fictional [results.html](results.html) relates to an earlier instrument and is not a result view for this version.

## Adult route

1. RAND Page 1 welcome and Page 2 participation statement.
2. Q1–Q11: study information and key demographics.
3. Original nine problem-domain pages Q12–Q20, Other Q21 and top-two problem categories Q22.
4. Q23–Q25: kinds of help needed and the two most significant needs for each selected problem.
5. Q26–Q36: up to four linked problem–need contact questions, original contacted/noncontacted military/nonmilitary characteristics, personal networks, resource-specific helpfulness and hypothetical loss of resources.
6. Q37–Q61: background and deployment, caring, housing and employment context; Q62–Q67: attitudes toward military service and final comments.
7. A neutral thank-you page with verified Australian support contacts.

Source-of-truth dictionaries are [Part 1](copy/rand-appendix-part1.json), [Q12–Q20](copy/rand-appendix-q12-q20.json), [Part 2](copy/rand-appendix-part2.json) and [Part 3](copy/rand-appendix-part3.json). The page builders and renderer are `rand-adult-*.js`. Regenerate derived files after a question edit:

```sh
node scripts/build-rand-adult-data.mjs
node scripts/render-rand-adult-copy.mjs
node --test tests/*.test.mjs
```

The site is a **presentation demo, not a collecting service**. It has no response receiver, answer persistence or answer-bearing URL; its respondent-visible text deliberately mirrors a real questionnaire, as Jacob directed. Do not distribute the link as a live consultation channel or interpret simulated completion as receipt. Real fieldwork requires LC-approved eligibility, participant information, custody/retention, an owned receiver and a verified end-to-end submission/export. The old v10 flow, handoff and analysis notes are preserved as historical files where labelled; the current adult instrument is the RAND Appendix A reconstruction above.
