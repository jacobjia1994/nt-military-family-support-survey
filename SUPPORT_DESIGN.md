# NT support finder — revision after user feedback, 26 September 2026

The prior release was technically functional but did not satisfy Jacob’s clarity or resource-coverage expectations. Seven consistent domains now replace mixed audience/action/life-event headings. Each question shows native radio rows; there are no dropdowns. Related first-click choices converge on shared routes rather than maintaining duplicate child/adult emotional-support logic.

The active decision tree is defined in `support-paths.mjs`. Most routes ask one to four visible questions after choosing a domain; the most conditional care route asks five. Age detail is requested only when it changes the available offer. People seeking parent advice are not treated as the child receiving care. Under-five mental-health assessment questions lead to a local child-health nurse or healthdirect before caregiver counselling.

The source audit expanded the set of actual offers, not just provider names. It checks local NT regions (including East Arnhem), national phone/online availability, service relationship, free scope, and contact action. All published contact records are reachable from valid choices. Reachability proves implementation coverage of this catalogue, not completeness of every NT organisation. See `SUPPORT_COVERAGE.md`.

## Material routing repairs

- A serving member’s own medical-travel enquiry uses a general Defence medical-travel route; it is not sent to a resident-family-only benefit.
- Generic accommodation failure does not imply SAFE’s domestic-crisis conditions.
- Remote child-therapy enquiries distinguish Top End, Big Rivers and Central/Barkly instead of silently choosing Darwin/Top End.
- Outside-NT school support is not sent to Territory FACES.
- Reserve Assistance clearly refers to currently serving part-time reservists; former Reserve-only service remains a separate uncertainty route.
- Darwin women’s shelter matching respects the accompanying-child restriction; other people retain a universal safety route.
- NDIS distinguishes new older applicants from existing participants. DVA family-crisis assistance is an eligibility enquiry, because its age rules differ by relationship.
- PEAP excludes full-time-serving applicant partners and part-time-Reserve-only member households. PATS does not assume a newly posted family has met six-month residence rules.

## Verification

Scenario tests cover concrete first actions and excluded inappropriate providers; full-tree enumeration checks all valid visible routes and contact references. Browser checks cover native radio keyboard behaviour, no automatic advance, conditional child ages, validation, editing and back navigation, fresh result-link recovery, mobile and narrow reflow, and absence of console errors. A source/qualification review and an independent conceptual review informed the fixes. These checks do not substitute for Jacob’s product judgment and are not described as recruited-user testing.

## Preserved boundaries

Survey and interview-request files are unchanged. Choices stay in memory, with no submissions, persistent storage or identifiers attached to provider links. Only task/question names appear in navigation URLs. Primary publication remains the authorised existing GitHub Pages site.

## Current details that changed the action

Each record in `support-catalog.mjs` contains its official source URLs and checked date. Important current distinctions include:

| Service | Consequence for the contact shown |
| --- | --- |
| [NT Central Intake](https://www.lutherancare.org.au/nt-homelessness/) | Provider's 22 September notice says phone lines are down; use enquiry form, no promise of immediate response or a bed. |
| [Lutheran Care Alice Springs](https://www.lutherancare.org.au/contact-us/) | Gregory Terrace office remains closed after flooding; phone for arrangements rather than send people to the closed office. |
| [headspace Katherine](https://headspace.org.au/headspace-centres/katherine/) | Temporary location at Anglicare NT, 15 Third Street; call before travel. |
| [eheadspace](https://headspace.org.au/online-and-phone-support/connect-with-us/) | National current hours take precedence over older centre-page text; 3–10pm local time daily. |
| [Parentline](https://parentline.com.au/about) | Provider page/footer hours conflict; show daily and link current arrangements without inventing a definitive interval. |
| [Open Arms](https://www.openarms.gov.au/who-we-help/eligibility) | Current matrix includes ex-partner, reserve and bereavement exceptions; conservative automatic matching must not imply refusal of help. |
| [Griefline / SANE](https://griefline.org.au/get-help/nationwide-telephone-support/) | Current phone connects to Service Enquiries; describe grief-support information, not the old anonymous helpline model. |
| [NT sexual assault referral centres](https://nt.gov.au/wellbeing/hospitals-health-services/sexual-assault-referral-centres) | Darwin/Alice provide 24-hour help after recent assault; do not claim this for Katherine/Tennant. |
