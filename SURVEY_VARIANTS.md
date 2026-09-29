# Two adult questionnaire variants

The team is reviewing two alternative adult questionnaires before choosing one. Both use the same Greater Darwin scope, opening, demographic questions, 20 issue categories, 170 specific issues, final comment and thanks. The choice-led version is `index.html`; the written-response version is `open-response.html`. `compare.html` is a separate team entry page. `youth.html` continues to serve the child and young-person routes.

The supplied source packages are `Defence_Survey_Codex_Pack_v4.zip` (SHA-256 `1552f8b2c752ce95d3a231b36d76a25ac9934fff2beb040fab5bc56978159db9`) and `Defence_Survey_Open_Response_Pack_v4B.zip` (SHA-256 `51e29c2ae3b99107ef014de449816286327efa792d859f77f6bc1571549cbfef`). Their reference tests and baseline fixtures are copied under `survey-variants/`. The package documents guided this implementation; Jacob's request to publish both versions governs their use.

## Editing the wording

Edit `survey-variants/choice/survey-spec.json` for shared categories, issue options, geography and shared pages. The top-level `needs`, `resources`, `characteristics`, `personal_networks`, `rating_response_options` and `overall_need_scale` arrays are the editing points for choice-led answer labels. Run `node scripts/sync-dual-survey-common.mjs --write` to copy shared material into the written-response specification and keep the choice page's repeated option arrays in sync. Run the command without `--write` to check for divergence. The written-response middle questions live in `survey-variants/open/open-survey-spec.json` and can be revised independently. Its welcome differs only in the “What to expect” paragraph.

Keep an existing ID when only its wording changes. Give a new ID to a genuinely new or materially different concept, and record that revision before comparing answers from different releases. Category order is the array order in the specification. Both versions have separate in-memory answer state; the written-response version keys repeated needs by slot ID rather than text.

These pages are static presentation builds. They have no response receiver or browser answer storage. Do not add a collector through a wording update. The respondent-facing pages use the supplied real-survey copy and a neutral completion page; internal collection status belongs in this project file, not in those pages.
