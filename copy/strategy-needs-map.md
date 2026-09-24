# Needs options against the supplied Defence and Veteran Family Wellbeing Strategy

Source: Jacob's supplied `Def-Vet-Fam-Wellbeing-Strategy-and-Action-Plan.pdf`, the Australian Government's *Defence and Veteran Family Wellbeing Strategy 2025–2030* and First Action Plan, copyright 2024. All 52 PDF pages were read through extracted text. Printed pages 24, 26, 27 and 28 were also visually checked against rendered pages. Printed page numbers are two lower than PDF page numbers (for example printed p24 = PDF p26). The file is a national strategy, not a validated needs scale and not evidence of NT prevalence.

Current questionnaire compared: canonical repository `survey.js`, adult/youth/child `DOMAINS`, at the start of this revision. This note changes no repository files.

## Recommended use

Use the strategy to check coverage and supply concrete examples, while keeping the question about the respondent's own experience. Do not reproduce a policy framework as a long list of abstract survey categories. The existing adult list covers most practical domains. Its clearest omission is help finding the right information or service. Relocation/transition and bereavement also need visible coverage, but they can be captured without three additional routes.

For a restrained revision, retain 15 existing adult analysis IDs, improve their labels/examples as below, and add one domain for navigating services. Cover preparing to leave service within the broader postings/service-change option and grief within mental health/wellbeing. If the team needs separate counts for transition or bereavement, give those their own options instead; do not later pretend a broad selection identifies which example a person meant.

The source does not supply a justified six-month versus twelve-month recall period or a three-year eligibility rule. Those must follow this consultation's purpose and programme scope. It supports listening to experiences across postings and transition, but does not itself authorise expanding LC grant eligibility to all veterans or all past NT connections.

## Adult options: concise wording, examples and evidence

Examples are illustrative, not exhaustive. Respondents can select more than one domain and use “Something else”. Avoid “etc.” and an additional sentence explaining that the examples are examples: a short `For example:` introduction to the hint style is enough if needed. “Such as” need not be repeated in every option.

| Current ID | Recommended label | Suggested short hint | Source / rationale |
|---|---|---|---|
| `settling` | **Postings and changes in service** | Moving, settling in, preparing for a posting or leaving service. | Printed pp10–11 (PDF12–13): relocation, transfer, re-enlistment and transition affect families; p15 (PDF17): reasons for separation and transition experience; pp26–27 (PDF28–29): relocation, transition, posting certainty. This broadens the existing “settling into NT” category; mark the revision in the schema. If transition counts are essential, split `transition` from `settling` instead. |
| `work_study` | **Work, study or training** | Finding work, keeping a career going or getting back into study. | Printed p2 (PDF4), pp27–28 (PDF29–30), p40 (PDF42), objective2.3: disrupted work/education, career advice, partner employment, remote working and value of family members' skills. Professional registration/licence recognition is not explicitly stated in this PDF; do not attribute that example to this source. |
| `housing` | **Housing** | Finding a suitable home or dealing with housing problems. | Printed p26 (PDF28): suitable housing and rental properties allowing pets; pp27,40 (PDF29,42): choice, accessibility/family needs, homelessness and rent assistance. Short hint is intentionally broad, leaving pets and accessibility open without an exhaustive list. |
| `everyday_expenses` | **Money and everyday expenses** | Household bills, managing money or finding out about financial help. | Printed pp10,14 (PDF12,16): financial stress/income; pp17,39 (PDF19,41): financial literacy, assistance and income supports. “Everyday expenses” alone misses information about available financial support. |
| `transport` | **Getting around** | Transport to work, appointments or activities. | Printed p26 (PDF28) identifies geographical disadvantage; p43 (PDF45) recognises remote access. Transport is a sensible local consultation category, but is not a stand-alone issue documented in this PDF. Keep it as local service-planning judgement, not a claimed strategy finding. |
| `childcare` | **Childcare** | Finding care that is available when you need it. | Printed pp27,41 (PDF29,43), objective2.7: access to childcare; pp24,27,38 (PDF26,29,40): support available after hours. This is less wordy and more concrete than “when plans change”. Cost can be selected as a later barrier rather than overloading this hint. |
| `schooling` | **Children's schooling** | Enrolment, changing schools, learning or getting support at school. | Printed pp2,27,39,41 (PDF4,29,41,43): disrupted school connections, participation, schooling support and enrolment without a fixed address following a Defence move. A parent answers about their own need for help with their child's schooling, not the child's mental health on their behalf. |
| `parenting_caring` | **Parenting or caring for someone** | Raising children, sharing care or supporting someone who needs help. | Printed pp2,26–28,38–39,42,45 (PDF4,28–30,40–41,44,47): parenting during absences, co-parenting, sole parents, disability/additional needs and family carers. Keep this need option even though the separate demographic caring-responsibilities question was removed. It measures actual need, not an unnecessary status. |
| `physical_health` | **Physical health and healthcare** | Finding healthcare or getting the treatment you need. | Printed pp14,17,36 (PDF16,19,38): health, access and coordinated referrals. “Continuing care after a move” is a reasonable operational example but is not explicitly a reported consultation finding in this document; do not imply direct quotation/evidence of local incidence. |
| `emotional_wellbeing` | **Mental health and wellbeing** | Stress, grief or support with how you are feeling. | Printed pp15–16,26–28,41–43 (PDF17–18,28–30,43–45): mental health support, education, bereavement and postvention. “Grief” provides visible coverage without asking someone to describe a death or cause of death. Broad selection cannot be analysed as a specific bereavement response. |
| `disability_ongoing_needs` | **Disability support** | Accessing support, equipment or help with everyday life. | Printed pp10,26–27,39–40 (PDF12,28–29,41–42): disabilities, additional needs, suitable support and housing. Equipment is an illustrative support type inferred from disability access, not an enumerated PDF finding. If strict direct-source-only examples are preferred, use “Getting support that meets your needs.” Avoid “special needs” although the source uses that terminology. |
| `family_relationships` | **Family relationships** | Staying connected, relationship difficulties or changes in family life. | Printed pp10,21,27–28,42–43 (PDF12,23,29–30,44–45): relationships, family diversity, co-parenting, couples education and family therapy. Avoid “keeping relationships working”, which sounds like instruction to preserve a relationship at all costs. |
| `people_to_turn_to` | **Friends and community** | Meeting people, feeling connected or having someone to turn to. | Printed pp14–15,24,28,39,43 (PDF16–17,26,30,41,45): social support/connection, peer networks, community events and new posting integration. Captures isolation/belonging in everyday language without assuming all families are isolated. |
| `military_separation` | **Time apart because of service** | Deployments, training or other time away from family. | Printed pp2,10–11,17,26–27 (PDF4,12–13,19,28–29): absences, operational/exercise deployment and impacts on families. Internally this is absence, not “separation from the ADF”, which the glossary defines as ending service. Keep the internal ID for continuity but clarify it in the data dictionary. |
| `safety_confidential_help` | **Feeling safe at home or in a relationship** | Leave blank unless a hint materially helps. | Printed pp8,14,41 (PDF10,16,43): justice/safety and family/domestic violence responses. Existing “Feeling safe or getting confidential help” conflates a safety need with confidentiality, which can matter for any topic. This proposed label focuses on the relevant safety domain. No request for incidents, perpetrators or identifying details. If broader community safety is in scope, label **Personal safety** with hint **At home, in a relationship or in the community.** |
| NEW `finding_services` | **Finding the right information or service** | Knowing what is available, who can help or how to apply. | Direct and repeated: printed pp12,24–25,35–38 (PDF14,26–27,37–40), priority1 and objectives1.1–1.5. Adults currently only encounter this as a barrier after choosing another need, while youth already have `finding_help`. It warrants its own need because navigation assistance can itself be the service LC plans. |
| `other_need` | **Something else** | Optional text field: **What else did you need help with?** | Preserves emerging and personally meaningful needs outside the selected list; source pp20–21,28–29 (PDF22–23,30–31) stresses diversity and direct ongoing engagement. |

### Optional separate categories only if team needs distinct counts

- `transition`: **Leaving service or adjusting to life after service** — **Planning for the change or finding support afterwards.** Printed pp10–11,15,26–27,37–38,41 (PDF12–13,17,28–29,39–40,43). This is not a move between NT and another posting. It must not be used as a proxy for posting transitions.
- `bereavement`: **Grief or bereavement** — **Support after someone has died.** Printed pp15–16,27,41 (PDF17–18,29,43). Do not ask whether a death was suicide in this general consultation. A dedicated count is a service-planning choice, not something required just because the strategy discusses it.

## Youth and child versions

These should remain shorter, concrete and about the young person's own life. The national strategy is not a child questionnaire and does not validate an age-specific item set. It supports the relevance of school, friends/community, family absences, health and transitions (printed pp2,10–11,27,36,39,41,43; PDF4,12–13,29,38,41,43,45).

Recommended youth wording (same domains, with clearer everyday English):

| Existing ID | Suggested label | Decision |
|---|---|---|
| `friends_belonging` | Friends or feeling that I belong | Keep; already natural. |
| `school_learning` | School, study or training | Covers older teenagers better than “learning”; work can be included via “Something else” unless a separate employment need is important. |
| `moving_change` | Moving or settling into a new place | More specific than “getting used to changes”. |
| `family_time_apart` | Family life or time apart | Clearer than “having someone away”. |
| `feelings_wellbeing` | My feelings or worries | Easier than “wellbeing”. |
| `activities_transport` | Things to do or getting around | Keep as a deliberate broad category; do not report the answer as transport demand specifically. |
| `health_access` | My health or disability support | Avoid the circular “other support needs”; includes own healthcare and accessibility. |
| `finding_help` | Finding help or someone I can talk to | Direct, comprehensible. |

For children 7–11, the existing six categories are simple but omit explicit health/disability and finding a trusted helper. If asking about broad support needs rather than only school/social adjustment, add **My health or getting the help I need** and **Finding someone I can talk to**. That yields eight domains plus “Something else”. Keep hints off these child choices; use familiar labels and optional free text. Do not copy the adult list or ask children to classify professional services/benefits.

## Cross-cutting issues from the PDF that belong elsewhere

- **Being heard and understood:** source pp24–25,28–29 (PDF26–27,30–31). This should inform the invitation, access barriers and how findings are used, rather than adding a vague “recognition” need option. A barrier about a service not understanding Defence family life is reasonable if the consultation needs that measure; do not infer it from a general “poor fit” response.
- **Diversity of families:** source pp9,20,27–28 (PDF11,22,29–30) includes extended families, carers, grandcarers, separated/ex-partners, kinship and close personal relationships. Avoid an eligibility screen that implies only spouses and children are families. Strategy inclusiveness is a rationale for reviewing consultation scope, not proof all programme benefits have the same scope.
- **After-hours access, childcare and transport:** collect as barriers or timing preferences for the particular need, not evidence of the underlying problem. Having a childcare need and being prevented from seeking other support by childcare are different measures.
- **Meaning/spirituality:** appears in the broad wellbeing diagram (printed pp5,14; PDF7,16), but not a detailed consultation problem list. No need to add a stand-alone spiritual-needs question solely to mirror all nine factors. “Something else” and strengths allow it.
- **Questions about every chosen need:** ask follow-up in relation to one clearly displayed need at a time. A combined response about housing, childcare and mental health cannot identify which service was sought, which barrier applied or what help was lacking. It is not repaired by a disclosure listing all selected needs.
- **Keep denominators honest:** past need can be fully met; current desired help is different. Service sought is not service received. If current priority is used to reduce burden, let the respondent select which needs to discuss and retain per-need results, including untouched needs in the selection count. Do not treat an uncompleted follow-up as no barrier/no unmet need.

