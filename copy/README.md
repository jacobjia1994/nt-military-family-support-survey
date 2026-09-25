# Adult reading copy

Generated from the current `survey.js` definitions using `node scripts/export-copy.mjs`. Formal participant wording remains separate from this staff documentation.

Optional **About you** questions now precede the support-needs checklist. The questionnaire presents the 17 adult support areas and open alternative once, then completes each selected area before moving on. Each area asks independently about support received over the past 12 months and extra or different support wanted now. A Yes answer reveals **What support would help you now?** Sources, applicable barriers/reasons and **What worked well, or could have been better?** appear directly, without an expandable details section. They remain optional even if past support was sufficient or no extra help is wanted.

Schema 5 stores these responses in `answers.areas[domain_id]`, keyed by the one `answers.needs` selection. The reading view shows a repeatable area template and its conditional questions, rather than printing the same template 17 times. Preferences about information or advice on services and support in the NT follow for everyone in the adult main route. There is no separate closing **Your ideas** question. Earlier NT experience remains a separate short comments route.

The adult main route has 5 + number of selected areas pages after invitation/age/participation, including review. Adult/youth comments allow 5000 characters, and children's fields 1500; these are ceilings, not requested response lengths. The live questionnaire and reading view support internal team review. Neither is connected to a response receiver.

The v10 participant notice preserves privacy rights while explaining that names and contact details are not collected to retrieve responses. The questionnaire links to a separate conversation form without transferring answers or identifiers; both journeys offer the same configurable free resource.

See the [flow and interpretation contract](../FLOW_REDESIGN.md), [Strategy source mapping](strategy-needs-map.md), [LC policy and form evidence](lc-public-practice.md), [legal review](../LEGAL_REVIEW.md), [contact-form design](../CONTACT_FORM.md) and [staff guide](../review.html).
