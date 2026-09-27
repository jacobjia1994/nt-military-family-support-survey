import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import vm from 'node:vm';
import * as contact from '../contact-model.mjs';
const destination=resolve(process.argv[2]||'work/lc-it-handoff');mkdirSync(destination,{recursive:true});
const ctx=vm.createContext({structuredClone,URL,window:{scrollTo(){}},document:{querySelector(){return null;}}});
vm.runInContext(readFileSync(new URL('../geography.js',import.meta.url),'utf8'),ctx);
vm.runInContext(readFileSync(new URL('../young-children.js',import.meta.url),'utf8'),ctx);
const source=readFileSync(new URL('../survey.js',import.meta.url),'utf8');
vm.runInContext(source.slice(0,source.lastIndexOf("if (document.body.dataset.view === 'questions')"))+`
function bank(version){
 const sections=questionLibrarySections(version,'nt');
 const needOptions=[...DOMAINS[version],{id:'other_need',label:'Something else'}];
 const futureOptions=sections.find(s=>s.id==='programmes').fields.find(f=>f.key==='programmes').options;
 for(const section of sections)for(const item of section.fields){
  if(item.key==='programme_priority')item.options=futureOptions.filter(x=>!['none','unsure','prefer'].includes(x.id));
  if(item.key==='focus_need')item.options=needOptions;
  item.required=Boolean(item.required);
  if(item.type==='text')item.max_characters=maxTextLength(version);
  if(item.type==='short')item.max_characters=160;
 }
 return {version,recall_months:version==='adult'?12:3,sections,need_options:needOptions,detail_repeat:version==='adult'?'Every selected area has optional detail, without a focus cap.':'One optional selected focus area; retain all checked needs.',conditional_priority_options:'Filter programme_priority to the selected programmes, excluding none/unsure/prefer.'};
}
globalThis.bank={schema_version:'lc-instrument-handoff/1',questionnaire_revision:'2026-09-27-local-experience-and-programmes',survey_record_schema:'7.0',young_child_record_schema:'1.2',stage:'team_review_no_receiver',analysis_unit:'submitted_response_perspective_not_unique_household',invitation:SURVEY_INVITATION,participant_notice:PARTICIPANT_INFORMATION,localities:GEOGRAPHY,forms:{adult:bank('adult'),youth:bank('youth')},routing:{current:'Named Greater Darwin locality or other locality within Greater Darwin -> full optional questionnaire.',not_disclosed:'Blank/prefer -> full questionnaire with residence unspecified.',outside:'Outside Greater Darwin + prior local residence Yes/Not sure/blank/prefer -> historical experience, kept separate.',no_local_experience:'Outside Greater Darwin + past_residence No -> scope explanation.',adf:'roles None -> scope explanation; current/former ADF relationships retained.',no_past_need:'Skip only past-area detail; programme interests and participation remain available.'},operating_rules:{no_actual_receiver:true,no_survey_contact_join:true,keep_raw_text:true,no_silent_truncation:true,missing_not_no:true,technical_duplicate_handling:'Only remove verified duplicate submissions; preserve family members as separate perspectives.'}};
`,ctx);
const young=ctx.window.SURVEY_YOUNG_CHILDREN;
const youngSource=readFileSync(new URL('../young-children.js',import.meta.url),'utf8');
const constants=/const ADF_CONNECTIONS = Object\.freeze\((\[.*?\])\);[\s\S]*?const CHILD_STAGES = Object\.freeze\((\[.*?\])\);/.exec(youngSource);
const literal=text=>vm.runInNewContext('('+text+')');
ctx.bank.forms.young_child={version:'young_child_supported',record_schema:'1.2',perspectives:['child_expressions_recorded_by_parent_guardian','parent_guardian_observations'],required_background:{adf_connection:literal(constants[1])},optional_background:{suburb:'Use canonical locality catalogue plus other/outside/prefer.',suburb_other:'Only for other within Greater Darwin.',child_stage:literal(constants[2])},questions:young.PROMPTS,guardian_observation:'What would you like to tell us about your child’s needs or support?',max_text_characters:young.MAX_LENGTH,participation:'Guardian permission required; child willingness controls child expressions only, not guardian observations.'};
ctx.bank.forms.interview_request={separate:true,notice_version:contact.CONTACT_NOTICE_VERSION,notice:contact.CONTACT_NOTICE,requesters:contact.CONTACT_REQUESTERS,age_bands:contact.CONTACT_AGES,contact_methods:contact.CONTACT_METHODS,limits:contact.CONTACT_LIMITS,fields:Object.keys(contact.emptyRequest()),questions:[{id:'requester',label:'Who is this request for?',required:true,options:contact.CONTACT_REQUESTERS},{id:'age_band',label:'Your age group / Your child’s age group',required:true,options:contact.CONTACT_AGES,conditional:'Guardian request offers under-18 age bands only.'},{id:'preferred_name',label:'What would you like us to call you? / Your preferred name',required:true,max_characters:80},{id:'phone',label:'Phone number / Your phone number',required:true,max_characters:30},{id:'contact_method',label:'How can we safely contact you?',required:true,options:contact.CONTACT_METHODS},{id:'voicemail',label:'You may leave a voicemail saying Lutheran Care called.',required:false,conditional:'Only when contact_method=call; default false.'},{id:'contact_notes',label:'Any times to avoid or other contact instructions?',required:false,max_characters:200},{id:'topic',label:'What would you like to talk about?',required:false,max_characters:600,conditional:'Omitted for under-15 self requests.'},{id:'guardian_authority',label:contact.CONTACT_GUARDIAN_DECLARATION,required:true,conditional:'Guardian requests only.'},{id:'consent',label:contact.CONTACT_CONSENT,required:true,variant_under15_self:contact.CONTACT_CHILD_CONSENT}],consent:contact.CONTACT_CONSENT,child_consent:contact.CONTACT_CHILD_CONSENT,guardian_authority:contact.CONTACT_GUARDIAN_DECLARATION,routing:'Guardian supplies own contact details. Under-15 self request omits topic narrative. Voicemail only for calls, off by default. Collection/contact request IDs must never link to survey response IDs.'};
writeFileSync(resolve(destination,'question-bank.json'),JSON.stringify(ctx.bank,null,2)+'\n');
console.log('Exported platform-neutral question bank and all form routes to '+destination);
