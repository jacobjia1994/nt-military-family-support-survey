# Adult reading copy

Generated from the current `survey.js` definitions using `node scripts/export-copy.mjs`. Formal participant wording remains separate from this staff documentation.

The approved flow presents the 17 adult support areas and open alternative once, then completes each selected area before moving on. Each area has two independent core questions: support received over the past 12 months and extra or different support wanted now. Optional source, barrier/reason and comment fields remain available even if past support was sufficient or no extra help is wanted. The four-week impact score and second current-needs checklist have been removed.

Schema 4 stores these responses in `answers.areas[domain_id]`, keyed by the one `answers.needs` selection. The reading view shows a repeatable area template and its conditional details, rather than printing the same template 17 times. General information/advice preferences follow for everyone in the adult main route; one closing suggestion and optional background questions come afterwards. The earlier-NT-experience comments route remains separate.

Adult/youth comments allow 5000 characters, and children's fields 1500; these are capacity ceilings, not requested response lengths. The live questionnaire and this reading view support internal team review. Neither is connected to a response receiver.

See the [flow and interpretation contract](../FLOW_REDESIGN.md), [Strategy source mapping](strategy-needs-map.md), [LC policy and form evidence](lc-public-practice.md), and [staff guide](../review.html).
