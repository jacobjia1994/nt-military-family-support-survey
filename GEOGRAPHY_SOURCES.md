# Greater Darwin survey geography

Checked on 27 September 2026. This is implementation provenance, not participant-facing survey copy.

## Approved scope

Jacob approved suburb/locality selection for Greater Darwin, including Darwin, Palmerston and Litchfield. The catalogue also includes East Arm, which the NT Government explicitly includes in Greater Darwin. Katherine, Tindal, Coomalie and the wider Cox Peninsula/Marrakai regions are outside this catalogue. The first optional dropdown records Darwin, Palmerston, Litchfield / rural area, Another area in Greater Darwin, Outside Greater Darwin or Prefer not to say. A second optional dropdown lists only the named suburbs/localities within a selected local area, plus Other suburb or locality with optional text. The named catalogue remains unchanged.

The question collects where a person lives. A workplace or training base does not create another residential locality. Robertson Barracks is recorded as an alias of **Holtze**, rather than a second, overlapping location answer; the two-step form places Holtze under Litchfield / rural area.

## Data and sources

The main source is the [NT Government Greater Darwin Regional Guide, page 15](https://jointheterritory.nt.gov.au/__data/assets/pdf_file/0004/1328953/Greater_Darwin_regional_guide.pdf). Its explicit lists contain 41 Darwin, 18 Palmerston and 37 Litchfield suburb/locality names. The catalogue transcribes those names, with the targeted corrections and additions below.

| Source | Use |
| --- | --- |
| [NT Government Greater Darwin Regional Guide, page 15](https://jointheterritory.nt.gov.au/__data/assets/pdf_file/0004/1328953/Greater_Darwin_regional_guide.pdf) | Base suburb/locality names and broad regional groupings. |
| [NT Budget 2026: Greater Darwin](https://budget.nt.gov.au/regional-overview/greater-darwin) | Greater Darwin explicitly covers Darwin, Palmerston, Litchfield, East Arm and Robertson Barracks. |
| [City of Palmerston: Municipal Boundary Review](https://palmerston.nt.gov.au/your-community/major-projects/municipal-boundary-review) | Completed expansion effective 1 July 2022 includes Wishart, Tivendale and Elrundie. These three are added to the guide's Palmerston list. |
| [NT Electoral Commission: Local government areas](https://ntec.nt.gov.au/electoral-boundaries/local-government-areas) | Current index, updated 6 August 2026, distinguishes Greater Darwin's unincorporated areas and links the official maps. |
| [City of Darwin map, 19 January 2023](https://ntec.nt.gov.au/_resources/documents/2022-local-government-representation-reviews/final-maps/darwin-a0.pdf) | Cross-check of Darwin suburb names and boundary-spanning localities. |
| [City of Palmerston map, 11 August 2022](https://ntec.nt.gov.au/_resources/documents/2022-local-government-representation-reviews/final-maps/palmerston-a0.pdf) | Cross-check of Palmerston names following the municipal expansion. |
| [Litchfield map, 14 February 2023](https://ntec.nt.gov.au/_resources/documents/2022-local-government-representation-reviews/final-maps/litchfield-lga-wards-ao.pdf) | Cross-check of rural locality names, including Micket Creek and McMinns Lagoon. |
| [NT Place Names Register: Freds Pass](https://www.ntlis.nt.gov.au/placenames/view.jsp?id=2039) | Uses the registered locality spelling **Freds Pass**, without the apostrophe used in the regional guide. |
| [Defence: Garrison Health Centres](https://www.defence.gov.au/adf-members-families/health-wellbeing/garrison-health-centres) | Robertson Barracks' address is Holtze NT 0829; supports the recorded alias. |
| [City of Darwin: Moving to Darwin suburb guide](https://discover.darwin.nt.gov.au/blogs/moving-darwin-suburb-guide) | Supports Cullen Bay as an alias for Larrakeyah and CBD for Darwin City. |
| [NT Government: Palmerston boundary review FAQs](https://haveyoursay.nt.gov.au/city-of-palmerston-council-boundary/widgets/336443/faqs) | Identifies the Northcrest residential development within Berrimah; supports the recorded alias. |

## Catalogue decisions

- **100 canonical named options:** 41 `darwin`, 21 `palmerston`, 37 `litchfield`, and one `greater_darwin_other` (East Arm). Special response options are provided by the survey, not counted as localities.
- Names are alphabetically sorted. Each has a stable lower-snake-case ID, a display label and a regional aggregation value. Known estate/base names remain catalogue aliases rather than separate locality answers: Cullen Bay → Larrakeyah; Northcrest → Berrimah; Robertson Barracks → Holtze; Darwin CBD/CBD → Darwin City.
- The `region` values are **survey aggregation groups**, not a parcel-level declaration of current council jurisdiction. Some names span municipal/unincorporated boundaries; a single suburb answer cannot resolve the exact parcel. Berrimah, Charles Darwin, Darwin City and Hidden Valley retain the regional guide's Darwin grouping; Channel Island and Wickham retain its Litchfield grouping. The NTEC index lists unincorporated areas within several of these localities. This does not change their inclusion in Greater Darwin.
- Do not infer that every label visible on a council map belongs inside that council. The maps also label adjacent places. The named base lists, completed Palmerston expansion and explicit East Arm scope determine inclusion.
- This is a source-backed catalogue for the survey, rather than a live exhaustive gazetteer or a legal boundary service. It adds no speculative future suburbs and can be updated when a verified residential locality needs to be added. `Other suburb or locality` remains available for an unlisted place.
- No participant lookup, geolocation, address collection or remote request is needed. `geography.js` contains the frozen local data for the two native dropdowns. The first answer is retained even if the second is blank; its area-only precision is explicit. Do not infer Palmerston City from Palmerston, or Darwin City from Darwin. Changing area clears the old suburb and its Other text. Geographic scope is established by the first answer. These are practical consultation groups, not a claim of three formal administrative tiers.

