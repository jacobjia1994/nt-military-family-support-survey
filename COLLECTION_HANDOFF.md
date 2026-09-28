# Collection, migration and analysis handoff

Updated 28 September 2026. This is an implementation proposal for Lutheran Care (LC) and its IT team. No platform, tenant, receiving endpoint or retention period has been selected by this document. No real response has been collected or uploaded as part of preparing it.

## Recommendation and confirmed requirements

**No production platform is selected.** Any candidate platform, including Microsoft Forms, must demonstrate the 0–100 repeatable account flow, stable edit/remove behavior, conditional prompts and complete export in a working prototype. If a platform cannot preserve those requirements, retain the custom front end and connect it to an LC-owned approved receiver. The separate interview-request form may use a different LC-approved route.

Jacob has clarified that the written survey is the main broad feedback channel because only limited targeted interviews will be possible. **Preserve 0–100 respondent-chosen experience or future-idea accounts, with a lean normal path and optional depth.** The 100-entry limit is technical capacity, never a target. A platform must not silently cap at two or ten, overwrite a previous account, or truncate written answers.

Other confirmed requirements are: Greater Darwin including Litchfield; an optional broad residential area followed by an optional suburb/locality; separate experience and future-idea routes; experience-only support status; useful change before conditional practical detail; age-appropriate participation routes; separate child expression and guardian observation; a separate opt-in interview request; and no survey/contact linkage. A platform migration must not silently change these choices.

## Instrument version and portable package

The current adult/youth source is schema `8.0`, revision `2026-09-28-respondent-accounts`; the younger-child source is schema `1.3`, revision `2026-09-27-area-priority`. These use `collection_mode: internal_review_no_transmission`. Do not change that collection claim until the real LC receiver and acknowledgement path are implemented.

The release handoff package is `outputs/LC_IT_handoff/question-bank.json` plus `outputs/LC_IT_handoff/frontend-source.zip` in Jacob's delivery workspace. The archive is built from the recorded release commit. Use the question bank together with the source and [FLOW_REDESIGN.md](FLOW_REDESIGN.md) for fields, options and branch semantics; it is not an automatically deployed Forms template or receiver. [ANALYSIS_PROTOCOL.md](ANALYSIS_PROTOCOL.md) is the reporting contract for either platform.

In schema 8.0, `residence_area` controls scope; `suburb` is optional within a selected local area. Preserve `location_precision` as `area`, `suburb`, `other_locality` or `not_stated`. Outside Greater Darwin is an area-level answer with outside scope; optional `past_residence` applies there. Keep invited current/former ADF roles and distinguish `current_local`, `residence_unspecified`, `earlier_experience` and `outside_scope`. The main adult/youth record has an ordered `answers.accounts` array with stable IDs, `kind` (`experience` or `future`), an optional story and useful-change answer. `help_status` belongs only to experience accounts and uses non-overlapping situation-referential useful-help categories. Optional helped/difficult text requires expansion. Proposal type may relabel the same change box; practical detail requires an eligible described help or activity plus explicit opt-in. The antecedent can be a future account's story when its useful-change box is blank. A mixed `other` suggestion may name the relevant practical component in one free-text answer; process-only suggestions remain ineligible. Internal next-ID state is not exported. Empty drafts do not consume a slot. Export all active accounts without truncation and reject a malformed over-limit record. Recall months/geography apply only if a recent-experience account survives export; future-only ideas carry no past recall marker. A zero-account route can retain an optional closing note; 2+ described changes can retain one optional free-text priority explanation. Do not infer service demand, booking or contact permission from these answers. Older schema 7.2 topic/format fields must not be silently mapped into these account constructs.

For schema 1.3, carry `background.adf_connection`, `background.residence_area`, optional `background.suburb`, applicable Other text, optional child stage and geography metadata including `location_precision`. Keep actual child expressions distinct from guardian observations. The two age schemas are distinct instruments, not interchangeable rows of the same needs measure.

## Two viable routes

| Point | LC Microsoft 365 Forms | Existing front end with LC receiver |
| --- | --- | --- |
| Public entry | Link or embed the Forms response page on LC's website. Microsoft continues to host and receive the form. | Host the existing static files on LC's website and send completed records to its approved HTTPS API. |
| Maintenance | LC staff can edit questions; IT administers ownership and access. | LC needs an identified maintainer for the form, API and data store. |
| Repeatable detail | Must prove 0, 1, 10 and 100 editable accounts, removal/replacement with stable IDs, conditional expansion and no lost answers. | The current flow can be retained and tested directly. |
| Branding and navigation | Forms themes allow colours and images; do not promise an identical custom review screen or finish-page layout. | Retain the three prominent area choices, optional suburb dropdown, review screen and two independent finish actions. |
| Records | Forms response service, with its supported Excel connection in the owning group's SharePoint site. | An LC-approved database or existing managed records system; export for analysis. |
| Analysis | Excel/Power Query from protected source data. | The same analysis tables, generated from structured records. |

Microsoft documents website embedding and theme controls. Embedding changes where the participant opens the form; it does not turn Forms into software installed on LC's server. [Distribution](https://support.microsoft.com/en-us/forms/send-a-form-to-get-responses), [themes](https://support.microsoft.com/en-US/Forms/change-a-form-theme).

## Forms: checks that can change the choice

1. **External respondents.** Use the external-response option, subject to LC's tenant policy, so Defence families do not need LC accounts. The options for recording organisational identity and enforcing one response per person belong to restricted organisational response modes. Do not promise authenticated duplicate prevention for a public anonymous consultation. Hiding the extra-response link is only an interface setting. [Response settings](https://support.microsoft.com/en-us/forms/adjust-your-form-or-quiz-settings-in-microsoft-forms), [administrator settings](https://learn.microsoft.com/microsoft-forms/administrator-settings-microsoft-forms).
2. **Repeatable accounts must survive.** Prototype 0, 1, 10 and 100 populated entries; attempt a 101st; edit and remove a middle entry; add a replacement; navigate back and forward; export and read back the first, middle and last accounts with stable IDs. Test experience-only, future-only and mixed responses, and conditional detail/opt-in. A fixed series of duplicated questions or forward-only branches is not equivalent to respondent-controlled repeatable accounts merely because it looks similar on one path. Official Forms branching moves forwards; the actual tenant prototype decides whether a workable implementation exists. [Branching](https://support.microsoft.com/en-gb/forms/use-branching-logic-in-microsoft-forms).
3. **Question and text limits.** Current official limits include 200 questions in one form and 4,000 characters in one answer. Count the whole implemented form, including hidden branches; each Likert statement counts towards the limit. The present adult front end allows 5,000 characters per long answer. That is a real migration difference: never truncate text silently. An additional continuation box may preserve space if the team accepts it. Count the final expanded instrument; do not treat the number seen by one respondent as the platform total. [Limits](https://support.microsoft.com/en-us/forms/form-question-response-and-character-limits-in-microsoft-forms).
4. **Two-step geography.** Preserve the two-step meaning: optional broad area, then an optional area-specific suburb/locality dropdown. The demo shows Darwin, Palmerston and Litchfield as three visible primary radio choices; other local, outside and declined answers sit behind an Other area disclosure. Forms may adapt this presentation; do not promise identical disclosure controls. Keep the three main areas prominent, with no answer preselected and all existing area codes available. Keep the 100-name catalogue and stable codes; show only relevant child localities, plus Other with optional text. Test area-only answers, a named suburb, outside/declined answers and changed areas on a phone. Search is not a migration requirement. If Forms exports separate suburb columns for each area branch, map only the currently applicable answer into the common `suburb` field and exclude stale values from previous branches. Preserve location precision and do not map broad Palmerston to Palmerston City.
5. **Review, changes and completion.** Test backward navigation and changes after a branch answer, blank optional answers, submission confirmation, and the separate interview/resource destinations. Do not claim that Forms has the project's custom pre-submit answer summary or two equally styled finish buttons without verifying the actual tenant. An LC-hosted landing/resource page can preserve those destinations, but must not claim a submission was received before Forms confirms it.
6. **Minors and contact permissions.** Reproduce permission, assent, age and assistance routing. Verify that the interview form retains call versus text-first, separate voicemail permission and guardian/self distinctions. Do not replace the safe-contact model with an unrestricted email-notification workflow.

The sources establish platform constraints; the assessment of fit is an implementation judgment. No LC tenant prototype has been performed for this handoff. Forms is not rejected on the basis of complexity, and current custom behaviour is not declared transferable without evidence.

## Ownership, access and routine operation

Create the production forms within LC's Microsoft 365 tenancy, owned by a deliberately chosen restricted Microsoft 365 group. Assign at least two appropriate LC staff as continuity owners. Do not depend on Jacob's personal account, a student account or one employee's continuing employment.

Group members become form owners. Use separate restricted groups for the consultation survey and interview contacts where the authorised staff differ; putting both forms in a large existing Team would not provide that separation. Analysts should ordinarily receive an approved analysis extract, rather than form co-ownership. [Group ownership](https://support.microsoft.com/en-US/Forms/move-your-form-to-a-group), [collaboration access](https://support.microsoft.com/en-us/forms/share-a-form-or-quiz-to-collaborate).

Initialise and verify the group's supported response workbook through Forms. Leave it in the supported SharePoint location and keep it as the source connection, not a place for bespoke formulas, edits or extra tables. Maintain a separate analysis workbook. A downloaded Excel copy is a snapshot; it is not a live connection. Opening/refreshing the connected workbook and checking its latest response count should be part of the nominated LC officer's routine before reporting. [Workbook connection and exports](https://support.microsoft.com/en-us/forms/check-and-share-your-form-results), [sync precautions](https://support.microsoft.com/en-gb/office/how-to-ensure-your-form-and-workbook-are-in-sync-e7fd7e45-d63f-4b30-b2ed-76709fe35813).

LC should keep a small operating record of form owners, form IDs and published links, source-workbook paths, the collection dates, questionnaire revision, access groups, the person monitoring interview requests, and the approved retention/deletion arrangement. These are operating facts, not additional questions for respondents. Do not publish a Forms results-summary link or embed results on the public website.

### Data location

Do not infer Australian storage from LC being Australian or from SharePoint's location. Microsoft's current Forms table says Australian tenants which provisioned Forms on or before 12 October 2022 default to US storage, whereas newer provisionings default to Australia. LC IT should establish its actual Forms, SharePoint and any automation locations and record them in the collection notice as appropriate. No new licence or relocation is recommended without that check. [Forms data storage](https://support.microsoft.com/en-us/forms/data-storage-for-microsoft-forms).

### Power Automate is optional

Start with supported Forms collection and Excel/Power Query analysis. Add automation only for a defined operational need, such as notifying the restricted contact team that a request awaits review or maintaining its task queue. Put minimal information in notifications; the contact record remains in the authorised system.

Any downstream automation must use the source form ID plus response ID as a deduplication key, log failed runs and support retry without duplicating the record or contacting someone twice. A flow failure must not imply a Forms response was lost. Microsoft's Forms connector exposes response notifications and response-detail retrieval; it is not a documented API for submitting this custom front end into Forms. Do not depend on reverse-engineered Forms endpoints. [Forms connector](https://learn.microsoft.com/en-us/connectors/microsoftforms/).

Do not build a production receiver by letting several flows and people append to the same Excel workbook. Microsoft's Excel connector warns against concurrent modifications and notes retries can insert duplicates. If LC needs a separate operational queue, use its approved record system, with a unique source key; keep Excel for analysis. [Excel connector](https://learn.microsoft.com/en-us/connectors/excelonlinebusiness/).

## If LC retains the custom questionnaire

The frontend can be moved independently of the receiving service. The production package should use relative asset links, LC-owned public survey/contact/support URLs, and configuration for the receiver. Real answers must never be committed to this Git repository or hosted as public static files.

The receiving contract should provide:

- Separate survey and contact endpoints and access permissions; validate allowed fields and routes server-side. Do not accept arbitrary fields merely because a browser sends them.
- A durable stored record before returning an unambiguous success acknowledgement. On failure, retain the entered answers in the page and offer an explicit retry; do not show a received/thank-you claim prematurely.
- A submission-scoped idempotency key so a timeout retry does not create another response. This is for reliable writes, not identifying people or linking forms. Reuse the key for retry of the same submission only.
- HTTPS, LC's normal access controls, backups and service monitoring; appropriate request limits and error messages. Do not place storage credentials or administrative keys in browser code.
- A documented export and restore path, a named owner for incidents, and an agreed retention process. Before launch, use invented responses to test normal submission, network failure/retry, double-click and permission separation.

Do not use email or a browser download as the primary response store. The existing preview has no receiver; moving its static files alone does not activate collection.

## Platform-neutral data and analysis contract

This is a logical contract, not a second executable schema. Bind the implementation to the schema 8.0 / younger-child 1.3 source and its versioned question bank, field IDs and revisions. Forms column headings may change; preserve a versioned mapping from platform question/column identifiers to stable project field IDs and the ordered per-response account IDs.

### Source records

- Preserve the original submitted record and its source identifier, questionnaire revision, instrument/age route, submission time and collection mode. Separate invented test records from fieldwork records.
- Stable IDs for questions, needs and choices must survive wording-only edits. Save the wording/options/branching snapshot with every published revision. A meaning or recall-period change needs a new revision and a documented analysis decision.
- Preserve verbatim optional text and multi-selection values. Do not replace a respondent's words with an AI summary in the source data.
- Record the recall period and residence/connection classification needed to interpret the route. Do not mix current Greater Darwin accounts, earlier local experience and uncertain scope without a stated analysis rule.
- Keep child expressions distinct from guardian observations, and youth detail selection distinct from all checked needs.

### Missingness

Blank is not No. Distinguish an explicit negative answer, a declined answer, an explicit Not applicable/Not sure, a question not reached because of routing, and an unanswered optional question. Do not invent a reason for a blank that the platform cannot establish. In Forms, derive question availability from the saved branch rules and observed earlier answers only when the inference is unambiguous; otherwise retain an unresolved missing value. A field dictionary must state how each status is represented.

### Analysis exports

An initial Excel workbook can contain the following tables; CSV exports should use the same grain:

| Table | One row represents | Main purpose |
| --- | --- | --- |
| `responses` | One submitted survey response | Instrument, revision, recall period, scope, broad area, optional suburb, location precision and relevant background. The key identifies a record, not a person or household. |
| `accounts` | One retained account within one response | Stable account ID and order, experience/future kind, the respondent's original words, experience-only help status, optional expansion/helper state, proposed change and applicable practical detail. The key identifies an account within a response, not another person. |
| `selections` | One explicitly chosen option for a coded question | Support-status or proposal-type choices with their applicable account ID; distinguish not asked, skipped and explicit answers. |
| `narratives` | One optional text field supplied in a response | Verbatim text, topic coding and appropriately de-identified quotations. Keep the original separate from edited quotations. |
| `dictionary` | One field/choice definition for one revision | Question wording, codes, valid values, missingness, branch rule and intended interpretation. |

Do not export the interview contact table into the survey analysis workbook. Its request ID is independent; no shared response ID, link parameter, tracking cookie or hidden join field should connect the two. Ordinary technical metadata should not be used to reconstruct a link. Interview operations need their own minimal record, contact permissions, status and authorised team.

### Reporting rules

Every statistical output, including slides, dashboards, public summaries and exports with totals, must carry a visible method note. Use counts of responses or respondents answering the specific question; do not call them unique families. If uniqueness cannot be established, do not imply unique individuals either. Use the relevant question denominator, show missing answers and distinguish multiple-selection percentages. Do not treat failure to select an optional item as proof that the issue does not exist.

Keep broad-area-only responses in their stated area total, separately from named suburbs; never distribute them among child localities. Preserve Other text without inventing a canonical match. For suburb results, report the concentration of needs **among responses received**. More responses from one suburb may reflect recruitment effort, and small suburb counts should not be presented as reliable neighbourhood rankings. Pool small cells and remove identifying detail from quotations before external release according to LC's reporting decision. This preserves useful location planning without turning the consultation into a prevalence study.

For narrative analysis, code the issue, what happened, what helped and the requested change. Keep a link back to the source response within the restricted analysis set; quote with appropriate de-identification. A theme count is the number of respondents who mentioned that theme under the stated coding rule, not an estimate of its prevalence in the whole community. Optional interview follow-up can enrich themes; it must not be represented as a linked longitudinal sample when no linkage was collected.

Suggested English note to accompany any statistics:

> These findings describe the survey responses received, not a representative estimate of all Defence members or families in Greater Darwin. More than one member of a family may have responded, and repeat submissions cannot necessarily be identified. Recruitment channels and optional questions affect who is represented. Counts are response-based unless otherwise stated; percentages use the number who answered the relevant question. Multiple-choice percentages may total more than 100%. Age groups, recall periods and response perspectives are reported separately where they differ.

For a compact chart footer:

> Survey responses received; not a population or unique-household estimate. Base: [n answering this question]; [missing n]. [Multiple responses allowed, if applicable].

## LC IT discussion: resolve these six facts

1. Does LC want Forms as the long-term platform, and can its tenant accept external responses? Which LC staff own the survey and the separate contact form?
2. Can a small Forms prototype preserve multiple optional needs, the full text capacity, age/permission paths, locality selection and review? If an adaptation is needed, show the actual changed experience before approving migration.
3. Where are Forms data, SharePoint files, backups and any automation data actually stored? What access and retention settings will LC use?
4. Who checks interview requests, how often, and how will call/text-first, voicemail and minor/guardian instructions be followed? State a response-time promise only after LC sets one.
5. Who needs raw answers, de-identified extracts or aggregated reports? Confirm separate contact access and the first reporting questions, not just a platform export button.
6. What is the production URL, collection start date and owner for verifying submission, export and restoration? Use a small set of invented cases before collecting real responses.

## Handoff acceptance

Ready for collection means the agreed instrument is reachable from LC's website, an external respondent can submit, a designated LC staff member can retrieve that exact test response, the export preserves every answer and code, and a failed/retried submission behaves correctly. Verify the separate contact route with invented details and actual role permissions. Team agreement on the platform and custody facts precedes activating real collection; it does not stop the current questionnaire improvements or preparation of portable documentation.

No Microsoft form, automation, licence, account setting, LC server or real personal record was created or changed in preparing this proposal.
