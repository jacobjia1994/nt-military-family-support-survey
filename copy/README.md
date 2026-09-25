# Adult reading copy

Generated from the current `survey.js` definitions using `node scripts/export-copy.mjs`. Formal participant wording remains separate from this staff documentation.

Optional **About you** questions precede the support-needs question. A separate Yes/No/Not sure/Prefer not to answer response first records whether support was needed. Yes or Not sure reveals the checklist; No bypasses area questions while retaining the service-information preferences. The questionnaire presents the 17 adult support areas and open alternative once (with its text box directly below **Something else** when selected), then completes each selected area before moving on. Each area asks independently about support received over the past 12 months and extra or different support wanted now. A Yes answer reveals **What support would help you now?** Sources, applicable barriers/reasons and **What happened when you needed support with this?** appear directly, without an expandable details section. They remain optional even if past support was sufficient or no extra help is wanted.

The experience cue is **You could describe what helped, or what would have made things easier.**

Schema 6.0 stores the independent `answers.needs_status` and these area responses in `answers.areas[domain_id]`, keyed by the one `answers.needs` selection. The reading view shows a repeatable area template and its conditional questions, rather than printing the same template 17 times. Preferences about information or advice on services and support in the NT follow for everyone in the adult main route. There is no separate closing **Your ideas** question. Earlier NT experience remains a separate short comments route.

The adult main route has 5 + number of selected areas pages after invitation/age/participation, including review. A separate under-7 parent/guardian form records child expressions and guardian observations distinctly; see the [child-participation review](../CHILD_PARTICIPATION_REVIEW.md). Adult/youth comments allow 5000 characters, and children's fields 1500; these are ceilings, not requested response lengths. The live questionnaire and reading view support internal team review. Neither is connected to a response receiver.

The v11 participant notice preserves privacy rights while explaining that names and contact details are not collected to retrieve responses. The questionnaire links to a separate **Request an interview** form without transferring answers or identifiers; both journeys offer the same configurable free resource.

See the [flow and interpretation contract](../FLOW_REDESIGN.md), [Strategy source mapping](strategy-needs-map.md), [LC policy and form evidence](lc-public-practice.md), [legal review](../LEGAL_REVIEW.md), [contact-form design](../CONTACT_FORM.md) and [staff guide](../review.html).
