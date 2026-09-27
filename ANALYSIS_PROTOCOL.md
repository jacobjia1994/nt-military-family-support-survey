# Defence Family Support Survey — analysis and reporting protocol

Approved interpretation rule: Jacob, 27 September 2026. Applies to the survey, related interview consultation and any analysis produced from them, regardless of whether collection uses the custom website or Microsoft Forms. Collection and storage platform remain to be agreed with Lutheran Care IT.

## What the results represent

Report **responses and participant perspectives**, not unique families and not population prevalence. Each submitted questionnaire is a response record. Several people in the same family may contribute, and an anonymous form may also receive repeat submissions. Unless uniqueness has actually been established, use “responses” rather than claiming an exact number of distinct people. Do not deduplicate different members of a family: their experiences are relevant in their own right. Remove only verified technical duplicates, retaining an audit record of the exclusion.

Recruitment through particular bases, events, schools, groups or online channels can affect who takes part. A high count from a suburb can inform accessible project locations, but is not evidence that the suburb has the highest rate of need. A low count does not establish low need. If channel is captured through a simple campaign code, use it to describe reach; it is not a weighting scheme or proof of representativeness. Do not introduce personal identifiers merely to obtain a household count.

The main purpose is to identify useful support, experiences worth preserving, unmet needs and feasible participation arrangements for Lutheran Care's programme. Counts help describe the material; open responses explain what the support would need to do.

## Metadata that must accompany the data

Keep a frozen question and option dictionary for each deployed revision, plus the raw export. The collection handover must preserve the following, using explicit `unknown` or `not_collected` when a platform has not captured an item:

| Metadata | Reason |
|---|---|
| Dataset/export identifier, export date, collection period and collection stage (test, pilot or live) | Keep demonstrations and tests out of real results. |
| Questionnaire revision, schema/field-map revision and original form/question identifiers | A matching field label alone does not establish comparability. |
| Age path/form, answer voice (participant or guardian observation), assistance where collected | Different questions and voices must remain distinguishable. |
| Consultation route, selected residential area, optional suburb/locality, `location_precision` and ADF relationship/status where collected | Separate current local, former local and outside-area perspectives; service location is not residence. Keep broad-area-only records distinguishable from named suburb answers. |
| Recall window and reference setting | Distinguish local past experience, current request and future interest. |
| Question shown/eligible state, answer status and selected option identifiers | Preserve the difference between not asked and skipped. |
| Recruitment channel when available, inclusions/exclusions and data-cleaning log | Describe the response cohort without pretending it is a population sample. |

If Microsoft Forms does not export whether a question was displayed, derive this only where the frozen branching rules and preceding answers establish it. Otherwise record `unknown_display_status`; do not guess that a blank answer was a refusal or that an unshown option meant “no”. Store instrument revision and stage at dataset level even if the collection tool cannot add them to each record.

Do not silently combine earlier and revised instruments. A comparison needs an explicit mapping of identical or meaningfully comparable questions, populations, options and time windows. Keep incompatible items separate. Current/former ADF status, residence route and recall period are separate dimensions, not interchangeable labels.

## Geographic precision

The first optional geography answer records the broad area; the second optionally identifies a suburb/locality within it. Preserve `residence_area`, optional `suburb` and `location_precision` (`area`, `suburb`, `other_locality` or `not_stated`). Other counts as `other_locality` only when the optional text is supplied; otherwise precision remains the selected area. Blank or declined area is `not_stated`; Outside Greater Darwin remains an area-level response with outside scope. Area-only answers contribute to the stated broad-area total but must never be spread among its suburbs or treated as a particular suburb. In particular, Palmerston is not Palmerston City, and Darwin is not Darwin City. A blank suburb does not erase a supplied area or make its local scope unknown. An unlisted locality supplied as Other text stays distinct from the canonical named catalogue until checked; preserve the original text. State the number of broad-area-only and unspecified locations beside suburb breakdowns.

## Denominators and unanswered questions

For each quantitative finding, keep these counts available: responses in the cohort, responses eligible for the question, definite answers, explicit “none/no”, unsure, prefer not to answer, blank/skipped and not asked. Do not infer missing categories if the platform did not distinguish them.

- For multi-select questions, count responses selecting each option. State the base used, such as “12 of 40 responses shown this question selected childcare”. One response can count in several options, so percentages may total more than 100%.
- For conditional questions, use the relevant branch as the base, not every survey response. A childcare arrangement question is not a measure of all respondents' childcare needs.
- For a selected support area, distinguish whether help was needed, whether support was enough, current desired change and future interest. A need met successfully is still a reported need. “No past need” does not mean “no future interest”.
- For an adequacy rate, if using `(some help, not enough + no help) / (enough + some + no help)`, show the numerator and denominator and separately count unsure, declined and skipped answers. This rate concerns that question and subgroup only.
- Blank, skipped, unsure, declined and not asked are not “no”, “not interested”, “no problem” or zero. An unselected option in a checklist is not a negative response to a separate yes/no question.
- Keep adult, youth and young-child forms separate where the wording, recall period or answering method differs. A guardian's observation must not be quoted as the child's own words.
- Optional adult detail remains available for **every selected need**. There is no adult one- or two-area cap. A skipped detail does not cancel the selected need. Analyse each detail item using its own available responses.

Read open answers for both difficulties and effective support. One response can receive several thematic codes; count responses mentioning a theme, not the number of sentences. Preserve a link to the source response in the restricted working analysis. Before sharing quotes or small geographic breakdowns, remove identifying details and combine categories when a particular presentation could identify a person. Do not invent quotations or treat a memorable quote as a frequency estimate.

## Required context on every statistical output

Every report, dashboard, chart, table and numerical summary must carry its cohort, N, collection dates, questionnaire revision, question/recall context, and the relevant denominator. State whether N counts response records or verified unique participants. For a report with several charts, common context and the interpretation note can appear once prominently at report level, with each chart showing its own subgroup/base. An extracted chart or slide must carry that context with it. This does not require a long warning beneath every chart.

A suitable compact line is:

> Responses received [date–date]; [eligible group / form / residence route]; N = [response records]. Questionnaire [revision], [recall period]. Base for this measure: [n and definition]. [x] skipped/unknown/declined where relevant.

The reporting script or analyst should refuse to describe test, pilot and live stages as one live cohort. A pilot can be included only if its status and instrument comparability are explicitly documented; otherwise report it separately.

## Reusable interpretation notes

Use the following English note on reports and the dashboard, including printed or exported reports:

> These findings describe the views and experiences reported by the people who took part. Response counts are not counts of unique households or estimates of how common a need is across Greater Darwin. Several members of one family may respond, and recruitment channels may affect who takes part. Each measure uses the denominator shown. Multiple-choice percentages may total more than 100%; skipped, unsure and declined answers do not mean “no need”. Different questionnaires, recall periods and consultation routes are reported separately where they are not comparable.

Equivalent Chinese note for the team and Chinese summaries:

> 这些结果反映参与者报告的观点与经历。答卷数量不等于独立家庭数量，也不能用于估计某种需求在大达尔文地区的发生率。同一家人的多位成员可能分别作答，招募渠道也可能影响参与者构成。各项指标采用所注明的分母；多选题的百分比合计可能超过100%。跳过、不确定和不愿回答不代表“没有需求”。题目、回顾时段或咨询路径不可比时，应分别报告。

For a standalone compact chart, the short form is acceptable alongside its metadata and base:

> Participant perspectives; not unique household counts or population prevalence. Family responses may overlap; recruitment affects who responds. Base: [n / eligible group].

> 参与者观点；非独立家庭数或总体发生率。同一家庭可能有多份答卷，招募渠道影响参与者构成。分母：[人数或答卷数／符合条件的组别]。

Where distinct individuals have not been verified, introduce counts as “N response records” / “N份答卷”, not “N people” / “N人”.

## Historical example dashboard

`results.html` contains 136 fixed-seed **fictional** records for an earlier instrument (`nt-life-support-fictional-v2`). The example uses adults 18+, youth 12–17, children 7–11, six-month adult/youth recall, three-month child recall and one current priority. It predates the present Greater Darwin questionnaire and is not connected to it.

Its charts and data are retained as a historical illustration only. The page and printed view show the historical status, cohort and interpretation notice. The CSV repeats dataset/revision/stage/period/cohort/interpretation metadata in columns so a spreadsheet import remains rectangular. It must not be fed real revised survey answers or presented as a validated analysis system for them. Build and verify the live analysis from the eventual collection platform's frozen export dictionary.
