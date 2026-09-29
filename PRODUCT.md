# Service Member and Family Needs Survey — current product contract

<!-- impeccable:product-schema 1 -->

## Purpose

Lutheran Care is preparing a Defence-funded family support programme for Greater Darwin and is listening to Defence personnel and family members about their problems, related needs, resources used or avoided, and how well help addressed the need. The adult questionnaire is a high-fidelity local adaptation of the [RAND MG-1124 Appendix A sample survey](https://www.rand.org/content/dam/rand/pubs/monographs/2011/RAND_MG1124.pdf), not a new 9×5 issue-cue instrument. The [item crosswalk](RAND_ITEM_CROSSWALK.md) names every retained or adapted Q1–Q67 question. RAND permits tailored adoption; this version has not been validated for Greater Darwin.

## Respondent presentation

The main `index.html` follows RAND's page order: adult entry and participation, Q1–Q11 study/background, Q12–Q22 original problem domains and top two, Q23–Q36 needs and resource matrices, Q37–Q61 background, Q62–Q67 military attitudes and comments, then a natural thank-you with Australian support numbers. Retain question numbering, source option wording, the military/nonmilitary/personal-network distinction, original matrix dimensions and dynamic routing. Use Australian Service, Defence support, local base and demographic wording only where the US original cannot describe this population. Progress and Back/Continue controls remain visible; the final button reads **Confirm and submit**.

The RAND sample covers adults. `youth.html` contains a separate local 8–17/younger-child route; it is not called a RAND survey. A family member living elsewhere may still describe a Greater Darwin work or posting connection. Do not imply every requested support is already provided by Lutheran Care or that every activity is at Berrimah.

## Technical and analysis boundary

This static GitHub Pages release has **no answer receiver or persistence**. Every visible survey screen, including thanks, is written as a real questionnaire at Jacob's express direction; internal project files alone record the noncollection state. The rendered thank-you is not an evidence receipt, response ID or actual submission. Before real collection, LC must approve participant information, eligibility, answer custody, retention, and an end-to-end receiving/export test.

Keep original source item IDs, local substitutions and respondent answers distinct. A selected problem is not automatically a needed service; a contact is not evidence the resource helped; Q35 rates a contacted resource for a specific problem–need pair, whereas Q36 is a hypothetical loss question. Up to four priority problem–need pairs receive the detailed resource path. Do not infer Greater Darwin population prevalence from any later volunteer responses. The separate interview-request and support-finder pages are independent and have no answer linkage.
