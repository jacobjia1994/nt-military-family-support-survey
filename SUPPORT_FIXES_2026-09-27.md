# Support finder corrections — 27 September 2026

Local revision: `20260927-2`, based on `7a3c193`. This revision implements the independent review's user-experience and service-path findings. It does not change the survey or interview-request forms. Publication has not been performed as part of this correction task.

## Implemented behaviour

| Review item | Correction |
|---|---|
| UX1 / C1 | A persistent entry at the top of each finder page reaches the urgent contacts. The jump and return preserve the routing hash and unfinished answer. Urgent contacts include the NT Mental Health Line and Lifeline text/webchat. |
| UX2 | eheadspace and Parentline expose their own verified webchat actions. Account or intake requirements are explained; an information page is not labelled as a live chat. |
| C2 | East Arnhem sexual-assault results include Darwin SARC. Unknown remote NT results expose both Darwin and Alice Springs medical contacts, with call-first guidance, alongside 1800RESPECT. |
| C3 | Carer Gateway distinguishes ordinary contact hours from emergency respite available on the same number 24/7. |
| C4 | Women without children in Darwin/Palmerston can contact Catherine Booth House. Its adult eligibility and accommodation conditions are stated, and 1800RESPECT remains available. Dawn House's existing eligibility boundary is preserved. |
| C5 | Only a confirmed serving member uses the member-only travel shortcut. Other/unknown family roles retain the patient's Veteran Card, region and residence questions. Other recognised dependants can reach family-health eligibility checks. |
| C6 | Current full-time members seeking ongoing mental-health treatment start with ADF healthcare. Open Arms, appropriate DVA funding and other options remain available. Former members retain their existing route. |
| C7 | School-age children's results include eligibility-labelled Open Arms alongside age-appropriate contacts. A direct social-activities option explains Defence Kids' 8–18 range; it also appears for the unambiguous 12–17 mental-health band. Broad 5–11 and 18–25 bands are not assumed eligible. |
| C8 | All NT claims paths include free independent RSL SA/NT advocacy and DVA, with the Darwin hub retained where relevant. |
| C9 | NT relationship-counselling results include a direct Relationships Australia NT contact with income-based fees. An NT/outside-NT question prevents inappropriate regional recommendations. |
| C10 | Alice Springs settlement results include MCSCA. Optional Aboriginal-led legal/family-violence contacts reflect Top End, Central Australia and Barkly service areas. No mandatory ethnicity question is added. |

The seven-topic structure, native radio controls, editable answers, follow-up handoff and existing accurate service updates are retained. New/changed service records carry provider-source URLs and the check date in `support-astra-reviewed.mjs` and `support-catalog.mjs`. The homepage no longer implies that every listed service is free.

## Validation

`node --test tests/*.test.mjs` passed all 242 tests, with no failures or skips. Added coverage exercises patient-specific travel, dependent recognition, regional clinical access, refuge fit, child/service boundaries, claims advocacy, paid counselling jurisdiction, cultural preferences and genuine chat actions. The renderer/event tests verify that urgent-help detours preserve questionnaire state and keyboard focus.

The cache-version-only update to `20260927-2` was followed by module-import, syntax and whitespace checks. The correction task also checks the local application in the browser at desktop and narrow mobile sizes, including urgent-help return, chat actions and the repaired patient-travel flow. Screenshots and the detailed change/validation report are retained in the originating review task's outputs.

Service contact availability, beds and waiting times are not simulated as confirmed outcomes. No provider was contacted and no application was submitted.
