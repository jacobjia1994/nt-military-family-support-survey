# Defence Family Support Survey — analysis and reporting protocol

Updated 29 September 2026. Applies to the RAND-led adult/youth schema 9.0 questionnaire, targeted interviews and related reporting. The younger-child form remains a separate schema 1.3 instrument. The current website is a noncollecting demonstration and has **no real survey responses**; these rules govern a future LC-approved collection.

## What the evidence represents

Report **response records and participant perspectives**, not unique households or population prevalence. Several members of one family may contribute; a person could submit more than once unless a real receiving system establishes otherwise. Do not deduplicate family members. Remove only verified technical duplicates with an audit trail. Recruitment through particular bases, events, schools, groups or online channels affects who takes part.

The questionnaire's main path follows RAND's linked method: reported problem → help needed → resources contacted or not contacted → access factors → need met. [Miller et al., RAND 2011, Appendix A](https://www.rand.org/pubs/monographs/MG1124.html). The local and youth adaptations are not validated estimates of NT prevalence. The source's US population and questions are not a comparator group.

## Distinct units and claims

| Unit | What one row/count means | What it does not mean |
| --- | --- | --- |
| Response | One received questionnaire record | A verified unique person or family |
| Problem cue | One concrete problem selected on one response | A request for help or an unmet need |
| Detailed category | One of up to two categories followed in depth; if more than two were selected, the respondent chose which mattered most, whereas one or two carry forward automatically | A complete ranking of all problems or evidence that an auto-carried area was explicitly prioritised |
| Help type | One kind of assistance selected for a detailed category | A programme booking or evidence that the help was available |
| Need chain | One selected category × prioritised help type followed in detail; at most four per response | A new respondent or a full account of all reported needs |
| Contact source | One person/service type approached or used for one linked need | Evidence that help was received or the source worked |
| Source outcome | One optional answer about what happened with a named source for one linked need | The overall status of that need across all sources |
| No contact | An explicit choice that no one was approached for a linked need | Proof of reluctance or a service barrier without the person's explanation |
| Met status | The person's answer about whether one linked need was met overall | A rating of LC, of one source, or of all services in a category |
| Supplemental account | One optional further experience or idea | Another respondent or another vote |

The adult checklist contains nine groups and 45 cues, plus Other. Youth questions use a shorter age-appropriate list. Count **responses selecting each cue** among eligible responses that answered the screen. Count category detail only among those whose category proceeded to follow-up, and state the base; respondents can follow at most two categories for depth. A person with more than two selected categories chooses which mattered most; one or two selected categories proceed automatically, without an explicit comparative priority answer. Distinguish an explicit no-problem option from skipping the screen. An unselected cue is not an explicit denial of that problem. A selected cue without detail is still a cue selection.

For each detailed **adult** category, optional focus_problems points to a subset of concrete cues the respondent had selected in that category; leaving it blank must not erase the broader selection. Report help types among people shown and answering that question. The explicit no-help-needed answer is not a skipped answer and must not enter the denominator for linked need-chain, contacted-resource or met-status distributions. When several kinds of help were chosen, priority_help identifies up to two for detailed pathways; it does not remove other selected help types. Each need chain belongs to one category and one help type. A source may be contacted for several needs, but a response-level source statistic counts that response once under the stated rule. The youth route uses shorter category-level questions; do not infer missing adult need-chain answers for youth.

For a linked need, distinguish not sought/no receipt, sought/no receipt, sought/help received, unsolicited help, unsure and skipped. A resource approached is not necessarily a resource that supplied help. An applicable per-source outcome card records that source's reported contribution to **that need**; it is not a global service rating. Overall met status belongs to the linked need across all sources; report fully met, partly met, not met, changed/no-longer-needed, too soon, unsure, declined and skipped as available in the final answer set. Do not infer it from contact, receipt, a source card or an analyst's impression. A current-gap answer is separate from an earlier met-status answer. Barrier and bridge questions are different constructs: one concerns difficulty or non-seeking, the other what helped reach or use support. Do not attribute a general barrier to one named source unless the answer establishes that link. Preserve verbatim text and note when the branch was not shown. In the youth route, **Was the help you got enough?** is eligible only after an explicit answer that someone helped; otherwise it is not asked, never coded No by default.

Positive_support and future_need are optional supplementary prompts. An effective-support statement is positive evidence even if no past problem was selected. A future need does not imply a problem occurred during the recall period. Optional accounts remain an additional narrative channel; their maximum of 100 active entries is technical capacity, not a measure of priority or household size. One response with 100 accounts is still one response.

## Metadata and missingness

Freeze the wording, option codes, order and branch rules for every deployed revision. Keep source record ID, collection stage (test, pilot or live), dates, instrument/schema revision, questionnaire age route, consultation route, broad area, optional locality, geographic precision, relevant recall period, and each question's eligibility/shown status where available. Keep adult, youth and guardian observations distinct. Retain raw verbatim answers separately from later theme codes or edited quotations.

Blank is not No. Distinguish explicit negative/no-help/no-contact answers; Not sure; Prefer not to answer; optional blank; and not asked because of a branch. If a platform does not export displayed-state information, derive it only when the frozen route and prior answers make it unambiguous; otherwise mark unknown. Do not silently discard a field because a downstream export is easier to analyse.

The optional geography records residence_area, suburb and location_precision (area, suburb, other_locality or not_stated). An area-only answer stays in its broad area; do not assign Palmerston to Palmerston City or Darwin to Darwin City. A separate work_posting_greater_darwin answer can identify a current local work/posting link even when residence is outside the area; this person belongs to the current-connection route but **not** the local-resident count. Outside-residence, historical-only and undisclosed-residence cohorts remain distinguishable. A person now outside the area is not counted as a current resident merely because they described earlier local experience.

Schemas 7.2, 8.0, 8.1 and 9.0 are different instruments. Do not merge fields by similar names. A comparison needs an explicit item-by-item mapping of wording, population, recall period, answer choices and branch eligibility. Keep pilot/pretest answers and fictional examples out of live findings unless inclusion and comparability are explicitly decided and documented.

## Narrative coding and interviews

Read open answers for both successful support and difficulties. A connected story may carry several analyst theme codes; count a response once per theme in respondent-level charts, with account- or category-level counts separately labelled. Preserve the original response and coding decision in restricted analysis. Remove identifying detail from shared quotations and combine small geographic cells where needed. A vivid quote illustrates meaning; it is not a frequency estimate.

Record whether interview material was volunteered, prompted in a targeted conversation or observed during cognitive/usability pretesting. Do not represent interviewees as a random follow-up sample or pool interview frequencies with questionnaire responses. Cognitive pretests are primarily evidence about **question functioning**, not local needs.

## Reporting context

Every chart/table should identify collection dates and stage, instrument/revision, route and recall context, N response records, the question-specific eligible/answered base and relevant missing categories. Multiple-choice percentages can exceed 100%. An isolated slide or exported chart must carry its own context.

Suggested concise note:

> These findings describe questionnaire responses received, not unique households or a representative estimate of Defence-family needs across Greater Darwin. A selected problem does not by itself mean help was needed or unmet. Different age forms, routes and recall periods are reported separately. Percentages use the stated eligible base; multiple selections may total more than 100%.

For the team's Chinese summaries:

> 这些结果反映收到的答卷，并非独立家庭数或大达尔文地区军人家庭需求的总体估计。勾选问题不等于需要帮助，更不等于需求未满足。不同年龄问卷、路径和回顾时段分别报告；百分比采用所注明的适用分母，多选题合计可能超过100%。

## Historical dashboard

results.html contains 136 fixed-seed **fictional** records from an earlier instrument. It is a historical demonstration, not a v9 analysis system or a source of actual consultation results. Build a new results view only from a verified LC collection export and the frozen v9 dictionary.
