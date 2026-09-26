# NT support finder — 26 September 2026

## Decision and scope

Eight everyday tasks lead to one compact context form and a contact-ready answer. The visitor does not need to understand the Defence/DVA service system, choose a policy category or read an organisation directory. The form asks recipient age and service connection only on routes where they change the recommendation. Universal safety contacts are immediately available on the safety route. A result leads with one practical first action and at most two alternatives, each with audience, location, free scope and access limits.

The full 52-page **Defence and Veteran Family Wellbeing Strategy 2025–2030 and First Action Plan** informed this redesign. Printed pp9–12 distinguish broad family identity from narrower benefit eligibility and explain overlapping, nonlinear family/service lifecycles; pp15–17 cover early help, crisis, recovery and community/Defence support; pp24–29 identify navigation barriers, direct family access, geographic disadvantage, transition and family diversity. Actions on pp35–43 guide design priorities, not claims that services are currently operating.

The old 39-challenge document remains a research cross-check. It is not a validated public taxonomy or an exhaustive description of families' needs. Historical data/route modules remain in the repository for provenance but are not loaded by the new page. Old topic URLs open the nearest new task and ask for current context. Survey and interview-request code, styling, data and links are unchanged.

## What determines a match

- Age belongs to the person needing support, not whoever is using the browser. Under-five wellbeing routes start with parent/carer support. Kids Helpline is 5–25; headspace is 12–25; adult Medicare centres are 18+.
- The ordinary Open Arms pathway is only promoted after confirmation of full-time service plus self/current-partner/child relationship. Other reservists, former partners and bereaved relatives get a universal support route and an explicit eligibility-check option; they are not declared ineligible. Adult children are not capped at 25.
- Serving/reserve families can contact DMFS; older veteran-family navigation uses the current Veteran and Family Wellbeing Agency. A family member does not need the serving member to make the enquiry.
- Local contacts follow the place support is needed. Remote/outside-NT choices do not produce an arbitrary Darwin or NT-only appointment. NT financial contacts distinguish Darwin, Palmerston, Katherine, Alice Springs and Tennant Creek.
- Parenting support is for the adult; a child/young person's counselling route says who receives it. Carer Gateway is for unpaid caring, not ordinary childcare. Disability advocacy has its own first-contact script.
- Debt, essentials, housing risk, tonight's accommodation and tenancy disputes require different first actions. A directory is labelled as a directory, never a bed booking. Childcare search is free; care itself is user-pays. Legal information/initial advice does not promise free court representation.

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

## Interaction and access

Native labels/selects, visible focus and semantic headings support keyboard use. Navigation focuses the new heading; a contact action follows in tab order. Change/back retain current choices. Refresh clears the page's choices and a shared task URL asks for context again. Unknown/legacy hashes have a usable home/task fallback. There is no account, tracking, persistent browser storage, network submission or transfer of survey answers. CSP blocks script network connections and form submission; referrers are suppressed. Printing keeps contact details. No-JavaScript users have direct human-navigation phones.

## Validation

`node --test tests/*.test.mjs` includes the unchanged survey, child-form and interview-form suites alongside realistic service-matching scenarios and exhaustive route-reference checks. Scenarios cover young children, teenagers, adult children, unknown reserve service, extended/bereaved family, outside-NT users, local food needs, urgent housing, unpaid carers, disability access, separation and male survivors of violence.

Browser checks cover desktop, 390px mobile and 320px reflow; child and teenage routes; change/back/forward; primary-action keyboard focus; no horizontal overflow; required fields; console errors; and live deployment. These are source-led scenario and interface checks, not recruited-family usability testing. No claim of user validation is made.

## Maintenance

Update the source-backed contact record before changing a recommendation. Change matching in `support-model.mjs`, not in the rendering template. When service eligibility changes, add a scenario with the intended first action and a negative assertion for the inappropriate service. Recheck outage notices, temporary addresses and opening hours before referring. No scheduled maintenance task is implied by this release.
