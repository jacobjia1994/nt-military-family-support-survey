/** Additive open-response model. No HTTP, persistence, text classification or scoring. */
import {createSurveyModel, normaliseNewlines, characterCount} from './shared/v4-common-core.mjs';
export {normaliseNewlines, characterCount};
export const MAX_TEXT_CHARACTERS = 10_000;
export const AREA_FIELDS = ['needs_summary','used_experience','other_sources','area_comments'];
export const NEED_FIELDS = ['need_description','focus_issues_text','sources_text','helpfulness_text','met_text','current_gap_text','comments'];
const clone = value => structuredClone(value);
const object = value => value && typeof value === 'object' && !Array.isArray(value);
const hasText = value => typeof value === 'string' && value.trim().length > 0;
const pick = (value, keys) => Object.fromEntries(keys.filter(k => value?.[k] !== undefined).map(k => [k, clone(value[k])]));
const equal = (a,b) => JSON.stringify(a) === JSON.stringify(b);
const COMMON_KEYS = ['consent','role','age_group','current_connection','residence_area','suburb','suburb_other',
 'past_residence','time_local','time_past','has_dependants','dependants','issue_control','issues',
 'presented_categories','other_issues_status','other_issues','skip_detail','priority_categories','comments'];
const project = state => pick(state || {}, COMMON_KEYS);
const textOnly = (value, keys) => Object.fromEntries(keys.filter(k => typeof value?.[k] === 'string')
 .map(k => [k, normaliseNewlines(value[k])]));
const needHasAnswer = entry => NEED_FIELDS.some(k => hasText(entry?.[k]));
const areaHasAnswer = entry => AREA_FIELDS.some(k => hasText(entry?.[k])) || Object.values(entry?.needs || {}).some(needHasAnswer);

export function createOpenSurveyModel(spec, choiceReference) {
 if (spec?.variant !== 'open_response') throw new TypeError('Load open-survey-spec.json for this alternative.');
 for (const key of ['scope','issue_bank','geography','system_screens']) {
  if (!equal(spec[key],choiceReference[key])) throw new TypeError(`Common component differs from v4: ${key}`);
 }
 for (const id of ['about','issues','review','thanks']) {
  if (!equal(spec.pages.find(p => p.id===id), choiceReference.pages.find(p => p.id===id)))
   throw new TypeError(`Common page differs from v4: ${id}`);
 }
 const base = createSurveyModel(choiceReference);
 const areaSpec = spec.pages.find(p=>p.id==='area');
 const categories = [...spec.issue_bank.map(c=>c.id),'OTHER'];
 const fieldSpecs = areaSpec.sections.flatMap(s=>s.questions);
 const slotIds = (s,id) => s.open_areas?.[id]?.need_order ?? ['n1'];
 const areaRecord = (s,id) => s.open_areas?.[id] || {};
 const normalIds = (s,id) => Array.isArray(slotIds(s,id)) ? slotIds(s,id) : [];
 const priorityCategories = state => base.priorityCategories(project(state));
 const positiveCategories = state => base.positiveCategories(project(state));
 const route = state => base.route(project(state));
 const networkOwner = state => priorityCategories(state)[0] ?? null;
 const selectedIssueOptions = (state,id) => base.selectedIssueOptions(project(state),id);
 function ensureArea(state,id) {
  if (!priorityCategories(state).includes(id)) throw new RangeError('Choose this issue area before adding answers.');
  state.open_areas ||= {};
  state.open_areas[id] ||= {need_order:['n1'],next_need_number:2,needs:{n1:{}}};
  const a=state.open_areas[id];
  a.need_order ??= ['n1']; a.needs ||= {}; a.next_need_number ??=2;
  for(const n of a.need_order) a.needs[n] ||= {};
  return a;
 }
 function areaView(state,id) {
  if (!priorityCategories(state).includes(id)) return null;
  const a=areaRecord(state,id);
  return {id,title:spec.issue_bank.find(c=>c.id===id)?.label || 'Other issues',
   issues:selectedIssueOptions(state,id),
   needs:normalIds(state,id).map((needId,index)=>({id:needId,number:index+1,
     answers:clone(a.needs?.[needId] || {}),answered:needHasAnswer(a.needs?.[needId])})),
   showFocusQuestion:selectedIssueOptions(state,id).length>1,
   showPersonalNetworks:networkOwner(state)===id,
   showAreaComment:normalIds(state,id).length===0 || hasText(a.area_comments),
   // These are open prompts, not assertions that a source was used/not used.
   showUsedPrompt:true,showUnusedPrompt:true};
 }
 function setText(state,{categoryId,needId,field,value}) {
  if(typeof value!=='string') throw new TypeError('Open responses must remain text.');
  const next=clone(state);
  if(field==='network_text') {
   if(!networkOwner(next)) throw new RangeError('No priority area for the network question.');
   next.network_text=normaliseNewlines(value); return next;
  }
  if(field==='comments' && !categoryId) {next.comments=normaliseNewlines(value);return next;}
  const a=ensureArea(next,categoryId);
  if(needId) {
   if(!a.need_order.includes(needId)||!NEED_FIELDS.includes(field))throw new RangeError('Unknown need or question.');
   a.needs[needId][field]=normaliseNewlines(value);
  } else {
   if(!AREA_FIELDS.includes(field))throw new RangeError('Unknown issue-area question.');
   a[field]=normaliseNewlines(value);
  }
  // Keep an over-limit paste intact; validation is separate. No text-driven branching.
  return next;
 }
 function addNeed(state,id) {
  const next=clone(state),a=ensureArea(next,id);
  if(a.need_order.length>=2)throw new RangeError('You can describe up to two priority needs in this area.');
  const existing=Object.keys(a.needs).map(k=>Number(/^n(\d+)$/.exec(k)?.[1])||0);
  const n=Math.max(a.next_need_number||1,...existing.map(x=>x+1));
  const needId=`n${n}`;
  a.next_need_number=n+1;a.need_order.push(needId);a.needs[needId]={};
  return {state:next,needId};
 }
 function removeNeed(state,id,needId) {
  const next=clone(state),a=ensureArea(next,id);
  if(!a.need_order.includes(needId))throw new RangeError('Unknown need.');
  const removedPaths=needHasAnswer(a.needs[needId])?[`open_areas.${id}.needs.${needId}`]:[];
  a.need_order=a.need_order.filter(n=>n!==needId);delete a.needs[needId];
  return {state:next,removedPaths,reviewCategories:[]};
 }
 function skipNeedDetails(state,id) {
  const next=clone(state),a=ensureArea(next,id),removedPaths=[];
  for(const n of a.need_order)if(needHasAnswer(a.needs[n]))removedPaths.push(`open_areas.${id}.needs.${n}`);
  a.need_order=[];a.needs={};
  return {state:next,removedPaths,reviewCategories:[]};
 }
 function prepareUpdate(before,draft) {
  const common=base.prepareUpdate(project(before),project(draft));
  const next={...project(common.state),open_areas:clone(draft.open_areas || {})};
  if(draft.network_text!==undefined)next.network_text=clone(draft.network_text);
  const removedPaths=[...common.removedPaths.filter(p=>!['needs','pairs','source_characteristics','personal_networks'].some(k=>p===k||p.startsWith(k+'.')))];
  const review=new Set(common.reviewCategories);
  const active=priorityCategories(next);
  for(const id of Object.keys(next.open_areas)) {
   const a=next.open_areas[id],old=before.open_areas?.[id];
   if(!active.includes(id)) {
    if(areaHasAnswer(old))removedPaths.push(`open_areas.${id}`);
    delete next.open_areas[id];continue;
   }
   if(!equal(selectedIssueOptions(before,id),selectedIssueOptions(next,id)) && areaHasAnswer(old))review.add(id);
   // Editing free wording keeps the rest of the narrative; do not reinterpret it as a new typed choice.
   for(const n of normalIds(next,id)) {
    const oldN=old?.needs?.[n],newN=a?.needs?.[n];
    if(needHasAnswer(oldN)&&['need_description','focus_issues_text','sources_text'].some(k=>oldN?.[k]!==newN?.[k]))review.add(id);
   }
   const remaining=new Set(normalIds(next,id));
   for(const n of Object.keys(a?.needs || {})) if(!remaining.has(n)) {
    if(needHasAnswer(old?.needs?.[n]))removedPaths.push(`open_areas.${id}.needs.${n}`);
    delete a.needs[n];
   }
   // Detect explicit draft removals as well as orphan cleanup; never adopt these without confirmation.
   for(const n of old?.need_order || [])if(!remaining.has(n)&&needHasAnswer(old?.needs?.[n]))removedPaths.push(`open_areas.${id}.needs.${n}`);
  }
  for(const id of Object.keys(before.open_areas || {}))if(!next.open_areas[id]&&areaHasAnswer(before.open_areas[id]))removedPaths.push(`open_areas.${id}`);
  if(!active.length && next.network_text!==undefined) {
   if(hasText(before.network_text))removedPaths.push('network_text');
   delete next.network_text;
  }
  return {state:next,removedPaths:[...new Set(removedPaths)],reviewCategories:active.filter(id=>review.has(id))};
 }
 function validate(state) {
  const errors=base.validate(project(state));
  const add=(path,message)=>errors.push({path,message});
  const text=(v,path)=>{if(v===undefined)return;if(typeof v!=='string')add(path,'Please enter a written answer.');
    else if(characterCount(v)>MAX_TEXT_CHARACTERS)add(path,spec.ui.text_over_limit);};
  if(state.variant!==undefined&&state.variant!==spec.variant)add('variant','Keep the two questionnaires in separate answer sessions.');
  for(const legacy of ['needs','pairs','source_characteristics','personal_networks'])if(state[legacy]!==undefined)add(legacy,'Do not mix choice-version answers into the open-response session.');
  if(state.open_areas!==undefined&&!object(state.open_areas))add('open_areas','Use an issue-area answer object.');
  for(const [id,a] of Object.entries(object(state.open_areas)?state.open_areas:{})) {
   if(!categories.includes(id)||!priorityCategories(state).includes(id))add(`open_areas.${id}`,'This issue area is not a current priority.');
   if(!object(a)){add(`open_areas.${id}`,'Use an issue-area answer object.');continue;}
   const ids=a.need_order;
   if(!Array.isArray(ids)||ids.length>2||new Set(ids).size!==ids.length||ids.some(n=>!/^n[1-9]\d*$/.test(n)))add(`open_areas.${id}.need_order`,'Keep up to two separate need entries.');
   for(const f of AREA_FIELDS)text(a[f],`open_areas.${id}.${f}`);
   if(a.needs!==undefined&&!object(a.needs))add(`open_areas.${id}.needs`,'Use separate need answer objects.');
   for(const [n,d] of Object.entries(object(a.needs)?a.needs:{})) {
    if(!Array.isArray(ids)||!ids.includes(n))add(`open_areas.${id}.needs.${n}`,'This need entry was removed.');
    if(!object(d)){add(`open_areas.${id}.needs.${n}`,'Use a need answer object.');continue;}
    for(const f of NEED_FIELDS)text(d[f],`open_areas.${id}.needs.${n}.${f}`);
    for(const f of Object.keys(d))if(!NEED_FIELDS.includes(f))add(`open_areas.${id}.needs.${n}.${f}`,'Unknown open-response question.');
   }
  }
  text(state.network_text,'network_text');return errors;
 }
 function validateBeforeContinue(state,step) {
  const common=base.validateBeforeContinue(project(state),step);
  const all=validate(state);
  const prefix=step.startsWith('area:')?`open_areas.${step.slice(5)}`:null;
  const extra=all.filter(e=>e.path.startsWith('open_areas')||e.path==='network_text'||['variant','needs','pairs','source_characteristics','personal_networks'].includes(e.path))
   .filter(e=>step==='review'||step==='thanks'||e.path==='variant'||(prefix&&(e.path.startsWith(prefix)||e.path==='network_text')));
  return [...common,...extra];
 }
 function activeAnswerSnapshot(state) {
  const common=base.activeAnswerSnapshot(project(state));
  if(!Object.keys(common).length)return {};
  const out=project(common);
  out.schema_version=spec.schema_version;out.variant=spec.variant;out.open_areas={};
  for(const id of priorityCategories(state)) {
   const a=areaRecord(state,id),ids=normalIds(state,id);
   out.open_areas[id]={...textOnly(a,AREA_FIELDS),need_order:clone(ids),needs:{}};
   for(const n of ids)out.open_areas[id].needs[n]=textOnly(a.needs?.[n],NEED_FIELDS);
  }
  if(networkOwner(state)&&typeof state.network_text==='string')out.network_text=normaliseNewlines(state.network_text);
  return out;
 }
 /** Long-form raw text for future authorised analysis, not a participant-facing export feature. */
 function toTextRows(state,respondentId='') {
  const snapshot=activeAnswerSnapshot(state);
  if(!snapshot.variant)return [];
  const rows=[];
  const add=(questionId,scope,categoryId,needId,value)=>rows.push({respondent_id:respondentId,
   variant:spec.variant,schema_version:spec.schema_version,question_id:questionId,scope,
   category_id:categoryId,need_id:needId,raw_text:typeof value==='string'?value:null,
   answer_status:hasText(value)?'text_provided':'unanswered'});
  for(const id of priorityCategories(state)){
   const a=snapshot.open_areas[id];
   for(const f of ['needs_summary','used_experience','other_sources'])add(f,'area',id,null,a[f]);
   for(const n of a.need_order)for(const f of NEED_FIELDS){
    if(f==='focus_issues_text'&&selectedIssueOptions(state,id).length<=1&&!hasText(a.needs[n][f]))continue;
    add(f,'need',id,n,a.needs[n][f]);
   }
   if(a.need_order.length===0||a.area_comments!==undefined)add('area_comments','area',id,null,a.area_comments);
  }
  if(networkOwner(state))add('network_text','respondent',null,null,snapshot.network_text);
  add('comments','respondent',null,null,snapshot.comments);
  return rows;
 }
 return {route,positiveCategories,priorityCategories,selectedIssueOptions,areaView,networkOwner,
   visibleLocationFields:s=>base.visibleLocationFields(project(s)),dependantTotals:s=>base.dependantTotals(project(s)),
   setText,addNeed,removeNeed,skipNeedDetails,prepareUpdate,validate,validateBeforeContinue,activeAnswerSnapshot,toTextRows,
   fieldSpecs:clone(fieldSpecs)};
}
