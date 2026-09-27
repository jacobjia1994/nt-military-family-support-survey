# Independent audit implementation — 27 September 2026

The approved independent review is implemented without changing the seven homepage domains or the survey/interview pages. The current support asset revision is `20260927-1`.

- Chat links are direct actions beside contact details, and available chat alternatives appear near the main contact. QLife and Kids Helpline link to their verified chat pages.
- Human navigation preserves the original need, location and suggested opening sentence. Its result has no self-loop; returning restores the original answers. State remains in memory only.
- Children answer age once. The result summary supports editing a single answer, retains independent answers, and asks for newly relevant eligibility information.
- Relationship counselling exposes Open Arms eligibility checks for former partners and other uncertain relationships. Recent leavers retain transition support; current-serving family crises can see the assessed Acute Support Package.
- New explicit needs distinguish ongoing mental-health treatment, reduced income, and help with daily tasks at home. They make clinical treatment, payments and a younger veteran’s own home-care needs findable without mislabelling them as general counselling, debt or aged care.
- Twenty-two national/programme/regional records were added in `support-national-reviewed.mjs` and `support-nt-reviewed.mjs`, with provider sources and date. The records distinguish eligibility enquiries, assessed funding, co-payments and unknown accommodation charges.
- Local child/family mental-health programmes, youth housing outreach, independent school advocacy and East Arnhem contacts are matched only to their verified ages and geography.

Validation: 225 tests pass, including the new scenario and renderer checks. Full visible-route enumeration reaches all 159 active records across 1,872 terminal answer combinations. This establishes catalogue reachability, not universal public-service completeness. Browser verification at 390px, 320px and desktop covered single-step child age, conditional adult eligibility after editing, simultaneous preferences/focus, direct QLife chat, contextual food-support handoff/back navigation, and funded treatment with NT referral. No horizontal overflow was observed in those states. No real service enquiry was sent and no recruited-user usability study is claimed.

The bounded independent integration review identified and resolved three additional exclusions: younger veterans asking for help at home for themselves; partners who may qualify for DVA income support; and former Reserve-only members who may qualify for DVA mental-health treatment. Transitional audience wording now includes recent leavers. No further open-ended provider search is required for this approved repair set.

## Earlier revisions

# Approved review improvements — implemented 26 September 2026

The six findings in the review of release12a6296 are implemented. This is a scoped correction, preserving the homepage, brand, source record architecture and native controls.

| Finding | Change | Evidence |
| --- | --- | --- |
| Local/medical-travel mismatches | Verified Congress local route with exact audience; Patient Travel enquiry for recent arrivals and explicit funding boundary; transparent local-referral fallback | Official URLs in support-referrals.mjs; matching regressions |
| Irrelevant questions | Branch-specific geographic scope; no region for national-only routes; no residence question for member's own Defence travel | Question-list regression cases |
| Mixed mental choices | Five difficulty choices plus optional combinable result preferences | Grief remains selected with Safe Zone and QLife shown together |
| Late mobile actions | Sticky Continue with last-option clearance; primary contact before access details | 390px real browser measurements |
| Routine crisis banner | Notice only after actual safety selection; footer remains | Main routine-relationships notice count zero |
| Unusable printed web links | Visible URLs/emails, check date and supplementary services | One-page A4 ShelterMe/Central Intake PDF rendered and visually checked |

The 17 focused regression tests plus existing suites pass (202 total). The tests establish the named functional/eligibility properties; they are not user-validation scores. No further resource expansion or new project shape was introduced.

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
