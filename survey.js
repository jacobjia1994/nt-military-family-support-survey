// Question text for internal team review. IDs are stable analysis keys.
// Youth and child pathways are staff walkthroughs until participation procedures are agreed.
const DOMAINS = {
  adult: [
    { id: "settling", label: "Postings or leaving service", hint: "Preparing for a move, settling in, uncertainty about postings or adjusting after service." },
    { id: "work_study", label: "Work, study or training", hint: "Finding work, keeping a career going or getting back into study." },
    { id: "housing", label: "Housing", hint: "Finding a secure home that suits your household, including accessibility needs or pets." },
    { id: "everyday_expenses", label: "Money and everyday expenses", hint: "Household bills, managing money or finding out about financial help." },
    { id: "transport", label: "Getting around", hint: "Transport to work, appointments or activities." },
    { id: "childcare", label: "Childcare", hint: "Affordable care during work, shifts or unexpected absences." },
    { id: "schooling", label: "Children’s schooling", hint: "Enrolment, changing schools, learning or getting support at school." },
    { id: "parenting_caring", label: "Parenting or caring for someone", hint: "Parenting while someone is away, sharing care or supporting a relative who is unwell." },
    { id: "physical_health", label: "Physical health and healthcare", hint: "Finding healthcare or getting the treatment you need." },
    { id: "emotional_wellbeing", label: "Mental health and wellbeing", hint: "Stress or support with how you are feeling." },
    { id: "bereavement", label: "Grief or bereavement", hint: "Emotional or practical support after someone has died." },
    { id: "disability_ongoing_needs", label: "Disability support", hint: "Getting support that meets your needs." },
    { id: "family_relationships", label: "Family relationships", hint: "Staying connected, relationship difficulties or changes in family life." },
    { id: "people_to_turn_to", label: "Friends and community", hint: "Meeting people, feeling connected or having someone to turn to." },
    { id: "military_separation", label: "Time apart because of service", hint: "Time away for deployments or training, and settling back into family life afterwards." },
    { id: "safety_confidential_help", label: "Feeling safe at home or in a relationship", hint: "" }
    ,{ id: "finding_services", label: "Finding the right information or service", hint: "Knowing what is available to you, how to access it or who to speak to." }
  ],
  youth: [
    { id: "friends_belonging", label: "Friends or feeling included" },
    { id: "school_learning", label: "School, learning or training" },
    { id: "moving_change", label: "Moving or settling in" },
    { id: "family_time_apart", label: "Family life or time apart" },
    { id: "feelings_wellbeing", label: "Feelings or worries" },
    { id: "activities_transport", label: "Things to do or getting around" },
    { id: "health_access", label: "My health or help with a disability" },
    { id: "finding_help", label: "Finding someone I can talk to or ask for help" }
  ],
  child: [
    { id: "friends", label: "Making or keeping friends" },
    { id: "school", label: "School" },
    { id: "moving_change", label: "Moving or changes" },
    { id: "family_away", label: "When someone in my family is away" },
    { id: "feelings", label: "Feelings or worries" },
    { id: "activities", label: "Things to do" },
    { id: "health", label: "My health or getting the help I need" },
    { id: "trusted_person", label: "Finding someone I can talk to" }
  ]
};

// For adults, use these only after an actual attempt to get help.
// Reasons for not seeking help need a separate question and answer set.
// Youth barriers are perceived barriers, not evidence of a failed attempt.
// Child options use simpler language and stay with the selected area.
const BARRIERS = {
  adult: [
    { id: "unaware", label: "I did not know what was available" },
    { id: "eligibility_unsure", label: "I was unsure whether I was eligible" },
    { id: "eligibility_refused", label: "I was told I was not eligible" },
    { id: "cost", label: "Cost" },
    { id: "waiting", label: "Waiting for support" },
    { id: "location_transport", label: "Location or transport" },
    { id: "hours_timing", label: "Opening hours or timing" },
    { id: "childcare_caring", label: "Childcare or caring responsibilities" },
    { id: "language_culture", label: "Language or cultural barriers" },
    { id: "accessibility", label: "Accessibility" },
    { id: "privacy_trust", label: "Concerns about privacy or trust" },
    { id: "military_understanding", label: "The service did not understand Defence family life" },
    { id: "poor_fit", label: "Available support did not fit my situation" },
    { id: "explaining_repeatedly", label: "Having to explain my situation repeatedly" },
    { id: "other", label: "Something else" },
    { id: "none", label: "Nothing made it difficult" },
    { id: "unsure", label: "I'm not sure" },
    { id: "prefer_not_to_say", label: "Prefer not to say" }
  ],
  youth: [
    { id: "not_know_where", label: "Not knowing where to go" },
    { id: "no_trusted_person", label: "Not having someone I trust to ask" },
    { id: "privacy", label: "Worrying about who would be told" },
    { id: "not_understood", label: "Feeling that people would not understand" },
    { id: "timing", label: "Finding a suitable time" },
    { id: "transport", label: "Getting there" },
    { id: "cost", label: "Cost" },
    { id: "not_ready", label: "Not feeling ready to ask" },
    { id: "other", label: "Something else" },
    { id: "none", label: "Nothing would make it hard" },
    { id: "unsure", label: "I'm not sure" },
    { id: "prefer_not_to_say", label: "Prefer not to say" }
  ],
  child: [
    { id: "not_know_who", label: "I do not know who to ask" },
    { id: "hard_to_explain", label: "It is hard to explain" },
    { id: "worried_to_ask", label: "I feel worried about asking" },
    { id: "other", label: "Something else" },
    { id: "none", label: "Nothing makes it hard" },
    { id: "unsure", label: "I don't know" }
  ]
};

const NT_REGIONS = ['darwin','palmerston','litchfield','greater_darwin_other','katherine','alice','other_nt'];
const locationFrame = region => NT_REGIONS.includes(region) ? 'nt' : ['outside_au','outside_overseas'].includes(region) ? 'outside' : 'unspecified';
const SPECIAL_NEEDS = [];
const activeFutureAreas = answers => Object.entries(answers.areas||{}).filter(([id])=>(answers.future_needs||[]).includes(id)).map(([,area])=>area);
const liveParticipation = answers => activeFutureAreas(answers).some(area=>(area.formats||[]).some(v=>['one_to_one','group','phone','video_one_to_one','online_group'].includes(v)));
const inPersonParticipation = answers => activeFutureAreas(answers).some(area=>(area.formats||[]).some(v=>['one_to_one','group'].includes(v)));
const relevantChildStage = answers => [...(answers.needs||[]),...(answers.future_needs||[])].some(v=>['childcare','schooling','parenting_caring'].includes(v));
const hasNeedSelection = answers => ['yes','unsure'].includes(answers.needs_status);
function toggleChoice(current,value,exclusive=[]) {
  const values=Array.isArray(current)?current:[];
  if(values.includes(value))return values.filter(v=>v!==value);
  if(exclusive.includes(value))return [value];
  return [...values.filter(v=>!exclusive.includes(v)),value];
}
function selectedNeeds(answers,domains) {
  if(!hasNeedSelection(answers))return [];
  return (Array.isArray(answers.needs)?answers.needs:[]).filter(id=>domains.some(d=>d.id===id));
}
function selectedFutureNeeds(answers,domains) {
  return (Array.isArray(answers.future_needs)?answers.future_needs:[]).filter(id=>domains.some(d=>d.id===id)||id==='future_other_need');
}
function selectedDetailNeeds(answers,domains,version) {
  const past=selectedNeeds(answers,domains);
  return version==='child'?past:[...new Set([...past,...selectedFutureNeeds(answers,domains)])];
}
function selectedFocusNeed(answers,domains) {
  const ids=selectedDetailNeeds(answers,domains,'youth');
  return ids.includes(answers.focus_need)?answers.focus_need:null;
}
function detailedNeeds(answers,domains,version) {
  if(version!=='youth')return selectedDetailNeeds(answers,domains,version);
  const focus=selectedFocusNeed(answers,domains);
  return focus?[focus]:[];
}
function reconcileAreaSelection(answers,domains,version) {
  const retained=version==='youth'?(selectedFocusNeed(answers,domains)?[answers.focus_need]:[]):selectedDetailNeeds(answers,domains,version);
  answers.areas=Object.fromEntries(Object.entries(answers.areas||{}).filter(([id])=>retained.includes(id)).map(([id,area])=>{
    if(!selectedNeeds(answers,domains).includes(id))for(const key of ['received','sources','service_names','barriers','comment'])delete area[key];
    delete area.additional_support_now;
    return [id,area];
  }));
  if(!liveParticipation(answers)){delete answers.times;delete answers.time_other;}
  if(!inPersonParticipation(answers)){delete answers.in_person_areas;delete answers.in_person_other;}
}
function hasFormalSource(area) { return (area.sources||[]).some(v=>['military','community','health','school','online','other'].includes(v)); }
function hasSoughtHelp(area) { return (area.sources||[]).some(v=>!['not_sought','unsure','prefer'].includes(v)); }
function residenceScope(answers) {
  if(answers.residence_area==='outside')return 'outside_greater_darwin';
  if(LOCAL_AREAS.includes(answers.residence_area))return 'greater_darwin';
  return 'not_disclosed_or_unspecified';
}
function consultationRoute(answers) {
  if(residenceScope(answers)==='outside_greater_darwin')return answers.past_residence==='no'?'outside_scope':'earlier_experience';
  return residenceScope(answers)==='greater_darwin'?'current_local':'residence_unspecified';
}
function reconcileAnswers(answers,changed,domains,previous) {
  if(changed==='residence_area'&&previous!==answers.residence_area){delete answers.suburb;delete answers.suburb_other;}
  if(changed==='suburb'&&answers.suburb!=='other')delete answers.suburb_other;
  if(changed==='needs_status'&&!hasNeedSelection(answers)){delete answers.needs;delete answers.needs_other;}
  if(changed==='needs') {
    const ids=selectedNeeds(answers,domains);
    if(!ids.includes('other_need'))delete answers.needs_other;
  }
  if(changed==='future_needs'&&!selectedFutureNeeds(answers,domains).includes('future_other_need'))delete answers.future_needs_other;
  if(changed==='future_needs'){
    const ids=selectedFutureNeeds(answers,domains);
    if(ids.length<2||!(ids.includes(answers.future_priority)||['equal','unsure','prefer'].includes(answers.future_priority)))delete answers.future_priority;
  }
  if(changed==='needs_other'&&answers.areas)delete answers.areas.other_need;
  if(changed==='future_needs_other'&&answers.areas)delete answers.areas.future_other_need;
  if(['needs_status','needs','future_needs'].includes(changed)&&!selectedDetailNeeds(answers,domains,state.version).includes(answers.focus_need))delete answers.focus_need;
  if(['needs_status','needs','future_needs','focus_need'].includes(changed))reconcileAreaSelection(answers,domains,state.version);
  if(changed.startsWith('areas:')) {
    const [,id,key]=changed.split(':');
    if(key==='sources'&&answers.areas?.[id]){const branch=values=>(values||[]).some(v=>!['not_sought','unsure','prefer'].includes(v))?'sought':(values||[]).includes('not_sought')?'not_sought':'unspecified';if(branch(previous)!==branch(answers.areas[id].sources))delete answers.areas[id].barriers;}
    if(key==='sources'&&answers.areas?.[id]&&!hasFormalSource(answers.areas[id]))delete answers.areas[id].service_names;
    if(key==='formats'&&!(answers.areas?.[id]?.formats||[]).includes('other'))delete answers.areas[id].format_other;
    if(key==='formats'){
      if(!liveParticipation(answers)){delete answers.times;delete answers.time_other;}
      if(!inPersonParticipation(answers)){delete answers.in_person_areas;delete answers.in_person_other;}
    }
  }
  if(['residence_area','past_residence'].includes(changed)) {
    const before=consultationRoute({...answers,[changed]:previous}),after=consultationRoute(answers);
    if((before==='earlier_experience')!==(after==='earlier_experience')||(before==='outside_scope')!==(after==='outside_scope')){
      for(const key of ['needs_status','needs','needs_other','future_needs','future_needs_other','future_ideas','future_priority','focus_need','areas','in_person_areas','in_person_other','times','time_other','participation_enablers','enablers_other','practical_note','earlier_experience','time_nt','children_ages'])delete answers[key];
    }
    if(answers.residence_area!=='outside')delete answers.past_residence;
  }
  if(['needs','needs_status','future_needs'].includes(changed)&&!relevantChildStage(answers))delete answers.children_ages;
  if(changed==='participation_enablers'&&!(answers.participation_enablers||[]).includes('other'))delete answers.enablers_other;
  if(changed==='times'&&!(answers.times||[]).includes('other'))delete answers.time_other;
  if(changed==='in_person_areas'&&!(answers.in_person_areas||[]).includes('other'))delete answers.in_person_other;
  if(changed==='assistance'&&previous!==answers.assistance)delete answers.guardian_present;
  // Future interests are independent of past support needs.
}
function buildSteps(answers,domains,version) {
  if(consultationRoute(answers)==='earlier_experience')return [{id:'connection',phase:0},{id:'earlier',phase:1},{id:'review',phase:2}];
  const steps=[{id:'connection',phase:0},...(version==='youth'?[]:[{id:'place',phase:0}]),{id:'needs',phase:1}];
  if(version!=='child')steps.push({id:'future',phase:1});
  for(const need of detailedNeeds(answers,domains,version))steps.push({id:'area:'+need,phase:2,need});
  if(version!=='child'&&selectedFutureNeeds(answers,domains).length)steps.push({id:'practical',phase:2});
  steps.push({id:'review',phase:3});
  return steps;
}
function hasAnswer(value) { return value!==undefined&&value!==null&&value!==''&&(!Array.isArray(value)||value.length>0); }
function cleanExport(answers,version,domains) {
  const route=consultationRoute(answers),copy={};
  const allowed=['roles','residence_area','suburb','suburb_other','past_residence','assistance','guardian_present','community_connection'];
  if(version==='adult')allowed.push('age_group');
  if(route==='earlier_experience')allowed.push('earlier_experience');
  else if(route!=='outside_scope')allowed.push('needs_status','needs','needs_other','future_needs','future_needs_other','future_ideas','future_priority','time_nt','children_ages','times','time_other','participation_enablers','enablers_other','practical_note','in_person_areas','in_person_other');
  if(version==='youth'&&route!=='earlier_experience')allowed.push('focus_need');
  for(const key of allowed)if(Object.hasOwn(answers,key))copy[key]=structuredClone(answers[key]);
  if(version==='youth'){delete copy.time_nt;delete copy.children_ages;if(!selectedDetailNeeds(answers,domains,version).includes(copy.focus_need))delete copy.focus_need;}
  if(version==='child')for(const key of ['community_connection','future_needs','future_needs_other','future_ideas','future_priority','times','time_other','participation_enablers','enablers_other','practical_note','in_person_areas','in_person_other'])delete copy[key];
  if(!AREAS.some(area=>area.id===copy.residence_area))delete copy.residence_area;
  const locality=GEOGRAPHY?.localities.find(item=>item.id===copy.suburb&&item.region===copy.residence_area);
  if(LOCAL_AREAS.includes(copy.residence_area)){
    copy.region=copy.residence_area;
    if(!locality&&!['other','prefer'].includes(copy.suburb))delete copy.suburb;
  }else{
    delete copy.suburb;delete copy.suburb_other;
    if(copy.residence_area==='outside')copy.region='outside_greater_darwin';
  }
  if(copy.suburb!=='other')delete copy.suburb_other;
  if(copy.residence_area!=='outside')delete copy.past_residence;
  const locationPrecision=locality?'suburb':copy.suburb==='other'&&copy.suburb_other?.trim()?'other_locality':LOCAL_AREAS.includes(copy.residence_area)||copy.residence_area==='outside'?'area':'not_stated';
  if(Object.hasOwn(copy,'age_group')&&!ADULT_AGE_GROUPS.some(group=>group.id===copy.age_group))delete copy.age_group;
  if(!['self','guardian','other'].includes(copy.assistance)||version==='adult')delete copy.assistance;
  if(!['self','other'].includes(copy.assistance)||copy.guardian_present!==true)delete copy.guardian_present;
  if(route!=='earlier_experience'&&route!=='outside_scope') {
    const ids=detailedNeeds(answers,domains,version);
    const past=selectedNeeds(answers,domains),future=version==='child'?[]:selectedFutureNeeds(answers,domains);
    if(!hasNeedSelection(answers))delete copy.needs;
    if(!past.includes('other_need'))delete copy.needs_other;
    if(!future.includes('future_other_need'))delete copy.future_needs_other;
    copy.areas=Object.fromEntries(ids.map(id=>{
      const input=answers.areas?.[id]||{},area={};
      for(const key of ['received','support_requested','sources','service_names','barriers','comment','formats','format_other'])if(Object.hasOwn(input,key))area[key]=structuredClone(input[key]);
      if(!past.includes(id))for(const key of ['received','sources','service_names','barriers','comment'])delete area[key];
      if(!hasFormalSource(area)||version!=='adult')delete area.service_names;
      if(!hasSoughtHelp(area)&&!area.sources?.includes('not_sought'))delete area.barriers;
      if(!future.includes(id))for(const key of ['support_requested','formats','format_other'])delete area[key];
      if(!(area.formats||[]).includes('other'))delete area.format_other;
      return [id,area];
    }));
    if(version!=='adult'||future.length<2||!(future.includes(copy.future_priority)||['equal','unsure','prefer'].includes(copy.future_priority)))delete copy.future_priority;
    if(!relevantChildStage(copy))delete copy.children_ages;
    if(!liveParticipation(copy))delete copy.times;
    if(!(copy.times||[]).includes('other'))delete copy.time_other;
    if(!inPersonParticipation(copy)){delete copy.in_person_areas;delete copy.in_person_other;}
    if(!(copy.in_person_areas||[]).includes('other'))delete copy.in_person_other;
    if(!(copy.participation_enablers||[]).includes('other'))delete copy.enablers_other;
    if(future.length===0){delete copy.participation_enablers;delete copy.enablers_other;delete copy.practical_note;}
  }
  return {schema_version:'7.2',questionnaire_revision:'2026-09-28-topic-linked-support',location_precision:locationPrecision,geography_version:GEOGRAPHY?.version||null,consultation_route:route,residence_scope:residenceScope(copy),recall_months:route==='earlier_experience'?null:version==='adult'?12:3,recall_geography:'time_living_in_greater_darwin',analysis_unit:'respondent_perspective_not_household',measurement_scope:'local_support_experiences_and_topic_linked_future_preferences',details_optional:true,collection_mode:'internal_review_no_transmission',questionnaire_version:version,storage:'page_memory_only; not submitted',answers:copy};
}

const main = document.querySelector('#main');
const phases = ['About you','Your support','Looking ahead','Review'];
const state = { version:'adult', age:null, ageAudience:null, ageRoute:null, answers:{}, step:'connection', screen:'welcome', returnToReview:false, participation:null, guardianPermission:null,youngController:null,youngRecord:null };
const SURVEY_INVITATION = {"title": "Defence Family Support Survey", "greeting": "Hello, Defence community!", "paragraphs": ["Lutheran Care would like your help to plan its Defence Family Support Program in Greater Darwin.", "Tell us about the support you have needed, what you received and what would help now.", "Please answer about your own experience."], "funding": "Lutheran Care received funding from Defence Member and Family Support, a branch of the Commonwealth Department of Defence, to deliver this project."};
const PARTICIPANT_NOTICE_VERSION = '2026-09-25-v11';
// Formal participant wording for the internally reviewed consultation design.
// The current build has no receiver; its technical status belongs in review.html.
const PARTICIPANT_INFORMATION = [
  ['Your choice', 'Taking part is voluntary. Most questions are optional.'],
  ['Privacy', 'We do not ask for your name or contact details. Please leave out anything that could identify you or someone else, such as names, addresses or service numbers. The separate contact form does not receive your survey answers.'],
  ['Use and storage', 'Lutheran Care will use your answers to plan its NT Defence Family Support Program. We will store them securely and limit access to authorised staff working on this project. Our Privacy Policy explains how we keep and manage records.'],
  ['Sharing', 'We will share project information with Defence after removing details that could reasonably identify anyone. We may need to disclose information to meet legal duties or protect someone from serious harm.'],
  ['Before you submit', 'You can stop before submitting. We do not collect a name or contact details for retrieving individual responses afterwards.'],
  ['Questions or complaints', 'Contact <a href="mailto:feedback@lutherancare.org.au">feedback@lutherancare.org.au</a>. Our <a href="https://www.lutherancare.org.au/privacy-policy/" target="_blank" rel="noopener">Privacy Policy</a> explains your rights, including access, correction and complaints.'],
  ['If you need support', 'This survey is not a request for services. In an emergency in Australia, call 000. For domestic, family or sexual violence support, contact <a href="https://www.1800respect.org.au/" target="_blank" rel="noopener">1800RESPECT</a> on 1800 737 732.']
];
function participantInformationHTML(id='participant-information') {
  return `<section class="participant-information" id="${id}" aria-labelledby="${id}-title"><h2 id="${id}-title">Taking part and your information</h2><div class="notice-grid">${PARTICIPANT_INFORMATION.map(([label,body])=>`<p><strong>${label}</strong> ${body}</p>`).join('')}</div></section>`;
}
function questionnaireVersion(age) {
  return age==='adult'?'adult':['youth_younger','youth_older'].includes(age)?'youth':'child';
}
function needsGuardianPermission(age) { return ['child','youth_younger','young'].includes(age); }
function guardianPermissionRecord(age, permitted) {
  if(!needsGuardianPermission(age)||!permitted) return null;
  return {notice_version:PARTICIPANT_NOTICE_VERSION,age_path:age,kind:'parent_guardian_permission',agreed:true,recorded_at:new Date().toISOString(),context:'internal_review'};
}
function participationRecord(age, accepted, permission=null) {
  if(!accepted || !['adult','youth_older','youth_younger','child'].includes(age)) return null;
  if(needsGuardianPermission(age) && (!permission?.agreed || permission.age_path!==age)) return null;
  return {notice_version:PARTICIPANT_NOTICE_VERSION,age_path:age,kind:needsGuardianPermission(age)?'assent':'consent',agreed:true,guardian_permission:needsGuardianPermission(age)?permission:null,recorded_at:new Date().toISOString(),context:'internal_review'};
}
function hasValidParticipation() {
  return Boolean(state.participation?.agreed && state.participation.age_path===state.age && (!needsGuardianPermission(state.age) || state.guardianPermission?.agreed && state.guardianPermission.age_path===state.age));
}
function isOutsideSurveyScope(answers) {
  return Boolean(answers.roles?.includes('none')) || consultationRoute(answers)==='outside_scope';
}

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const opts = pairs => pairs.map(([id,label,hint]) => ({id,label,hint}));
const ADULT_AGE_GROUPS = opts([['18_29','18–29'],['30_39','30–39'],['40_49','40–49'],['50_plus','50 or older']]);
const domainList = () => [...DOMAINS[state.version],{id:'other_need',label:'Something else'}];
const futureDomainList = () => [...DOMAINS[state.version],{id:'future_other_need',label:'Something else'}];
const domainLabel = id => id==='other_need' ? (state.answers.needs_other || 'Something else') : id==='future_other_need' ? (state.answers.future_needs_other || 'Something else') : domainList().find(d=>d.id===id)?.label || id;
const isAdult = () => state.version==='adult';
const isChild = () => state.version==='child';
const period = () => isAdult()?'the past 12 months':'the past three months';
const privacyHint = () => isAdult()?'Please leave out names or other details that could identify someone.':'Please leave out names, addresses and school names.';
function getValue(key) {
  const [kind,id,fieldName]=key.split(':');
  return kind==='areas'?state.answers.areas?.[id]?.[fieldName]:state.answers[key];
}
function setValue(key,value) {
  const [kind,id,fieldName]=key.split(':');
  if(kind==='areas'){state.answers.areas||={};state.answers.areas[id]||={};state.answers.areas[id][fieldName]=value;}
  else state.answers[key]=value;
}
const maxTextLength = version => version==='adult'?5000:1500;
const info = '';
const PREFER = {id:'prefer',label:'Prefer not to answer'};
const UNSURE = {id:'unsure',label:'Not sure'};
const GEOGRAPHY = globalThis.SURVEY_GEOGRAPHY || globalThis.window?.SURVEY_GEOGRAPHY;
const AREAS = GEOGRAPHY?.areas || [];
const LOCAL_AREAS = ['darwin','palmerston','litchfield','greater_darwin_other'];
const suburbs = [...(GEOGRAPHY?.localities || []),{id:'other',label:'Another suburb or locality in this area'},{id:'prefer',label:'Prefer not to say'}];
function suburbChoice(value) {
  const typed=String(value||'').trim().toLocaleLowerCase('en-AU');
  return suburbs.find(option=>[option.label,...(option.aliases||[])].some(label=>label.toLocaleLowerCase('en-AU')===typed));
}
function suburbsForArea(area) {
  if(!LOCAL_AREAS.includes(area))return [];
  return suburbs.filter(option=>option.region===area||['other','prefer'].includes(option.id));
}
function suburbFields() { return [
  field('residence_area','Which area do you live in?','single',AREAS,'Optional. This helps us plan where and how to offer support.'),
  field('suburb','Which suburb or locality?','select',suburbsForArea(state.answers.residence_area),'Optional. You can leave this blank.',{conditional:'local_area',placeholder:'Not specified'}),
  field('suburb_other','Which other suburb or locality?','short',[],'',{conditional:'other_suburb'}),
  field('past_residence','Have you lived in Greater Darwin before?','single',opts([['yes','Yes'],['no','No'],['unsure','Not sure'],['prefer','Prefer not to say']]),'',{conditional:'outside_suburb'})
]; }
const adequacy = () => opts([['enough',isAdult()?'Enough to meet my needs':'I got enough help'],['some',isAdult()?'Some, but not enough':'I got some help, but needed more'],['none',isAdult()?'None':'I did not get any help'],['unsure','Not sure'],['prefer','Prefer not to answer']]);
const roleOptions = () => isAdult() ? opts([['serving','I am a current or former Australian Defence Force (ADF) member'],['partner','I am a partner, spouse or former partner of an ADF member'],['child','I am the child of a current or former ADF member'],['parent','I am the parent of a current or former ADF member'],['other_family','I am another family member or carer of a current or former ADF member'],['none','None of these']]) : opts([['child','My parent or carer serves or has served in the Australian Defence Force (ADF)'],['other_family','Someone else in my family serves or has served in the ADF'],['none','Neither of these'],['unsure','Not sure']]);
const field = (key,label,type,options=[],hint=info,extra={}) => ({key,label,type,options,hint,...extra});
function areaSources() { return isAdult()?opts([['family','Family or friends'],['military','Military support services'],['community','A community group or service'],['health','A health professional or service'],['school','A school, college or university'],['online','Online information or support'],['other','Somewhere else'],['not_sought','I have not looked for help'],['unsure','Not sure'],['prefer','Prefer not to answer']]):opts([['family','A parent, carer or someone in my family'],['friends','A friend'],['school','Someone at school'],['community','A youth worker or community group'],['health','A doctor, counsellor or other health worker'],['online','An online or phone support service'],['other','Someone else'],['not_sought','I have not asked anyone'],['unsure','Not sure'],['prefer','Prefer not to answer']]); }
function areaBarrierField(need) {
  const a=state.answers.areas?.[need]||{},child=isChild();
  const sought=hasSoughtHelp(a),notSought=a.sources?.includes('not_sought');
      const experiencedChild = BARRIERS.child.map(o=>({...o,label:({'I do not know who to ask':'I did not know who to ask','It is hard to explain':'It was hard to explain','I feel worried about asking':'I felt worried about asking'})[o.label]||o.label}));
      const experiencedYouth = BARRIERS.youth.map(o=>({...o,label:({'Not knowing where to go':'I did not know where to go','Not having someone I trust to ask':'I did not have someone I trusted to ask','Worrying about who would be told':'I worried about who would be told','Feeling that people would not understand':'I felt people would not understand','Finding a suitable time':'Finding a suitable time','Not feeling ready to ask':'I did not feel ready to ask'})[o.label]||o.label}));
      const list=sought?(state.version==='youth'?experiencedYouth:child?experiencedChild:BARRIERS.adult):notSought?(isAdult()?opts([['not_needed_yet','I have been managing without outside help'],['dont_know','I do not know where to go'],['eligibility_concern','I am unsure whether I am eligible'],['cost_concern','I expect it would cost too much'],['time','I have not had the time or opportunity'],['privacy','I am concerned about privacy'],['trust','I am not sure people would understand'],['self_reliance','I prefer to manage this myself'],['language','Language or communication would be difficult'],['access','Travel or accessibility would be difficult'],['other','Another reason']]):opts([['dont_know','I do not know who to ask'],['privacy','I worry other people will find out'],['trust','I do not think people will understand'],['time','I have not had a chance'],['self_reliance','I want to try handling it myself'],['access','It is hard to get there'],['other','Something else']])):BARRIERS[state.version];
  return field(`areas:${need}:barriers`,notSought?(isAdult()?'What were your reasons for not looking for support?':'Why did you not ask for help with this?'):'What made it harder to get that support?','multi',[...list.filter(o=>!['none','unsure','prefer','prefer_not_to_say'].includes(o.id)),{id:'none',label:notSought?'None of these reasons':child?'Nothing made it hard':'Nothing made it harder'},UNSURE,PREFER],'Select all that apply.',{exclusive:['none','unsure','prefer'],need,optional_detail:true,conditional:'area_barriers'});
}
function areaPage(need) {
  const key=name=>`areas:${need}:${name}`;
  const youngPerson=state.version==='youth';
  const past=selectedNeeds(state.answers,domainList()).includes(need);
  const future=selectedFutureNeeds(state.answers,domainList()).includes(need);
  const label=domainLabel(need);
  return {title:label,intro:past?future?`First think about your time living in Greater Darwin in ${period()}, then what could help now or in the coming months. You can leave any question blank and continue.`:`Think about your time living in Greater Darwin in ${period()}. You can leave any question blank and continue.`:'Thinking about now and the coming months, what could help with this area? You can leave any question blank and continue.',fields:[
    ...(past?[
      field(key('received'),isAdult()?`In ${period()}, how much of the support you needed did you receive?`:`In ${period()}, did you get enough help with this?`,'single',adequacy()),
      field(key('sources'),isAdult()?`In ${period()}, where have you looked for support with this?`:`In ${period()}, who have you asked for help with this?`,'multi',areaSources(),'Select all that apply.',{exclusive:['not_sought','unsure','prefer'],need,optional_detail:true}),
      ...(isAdult()?[field(key('service_names'),'Which services or organisations did you approach, if any?','text',[],'Optional. Please do not name individual staff or other people.',{need,conditional:'formal_sources',optional_detail:true})]:[]),
      areaBarrierField(need),
      field(key('comment'),youngPerson?'What helped, or what could have been better?':isChild()?'What happened when you needed help with this?':'What happened when you needed support with this?','text',[],(isAdult()?'You could describe what helped, or what would have made things easier. ':'You can tell us what happened, or leave this blank. ')+privacyHint(),{need,optional_detail:true})
    ]:[]),
    ...(future?[
      field(key('support_requested'),youngPerson?'What could help with this now or in the next few months?':'What, if anything, would help you or your family with this now or in the coming months?','text',[],youngPerson?'A few words are fine. It is OK not to know. '+privacyHint():'A few words are fine. You do not need to know which service could help. '+privacyHint(),{need,future_section:true,optional_detail:true}),
      field(key('formats'),youngPerson?'How would you like to get help or join in with an activity for this topic?':'Which ways of getting support or joining an activity for this topic would suit you or your family?','multi',youngPerson?opts([['one_to_one','Talking with one person face to face'],['group','A group or activity, face to face'],['phone','A phone call'],['video_one_to_one','A video call with one person'],['online_group','An online group or activity'],['text','Text messages or online chat'],['self_guided','Something I can read, watch or do in my own time'],['other','Another way'],['none_suitable','None of these ways would suit'],['not_wanted','I do not want help or activities for this'],['no_preference','No preference'],['unsure','Not sure'],['prefer','Prefer not to answer']]):opts([['one_to_one','One-to-one, in person'],['group','A group or activity, in person'],['phone','A phone call'],['video_one_to_one','A one-to-one video call'],['online_group','An online group or activity'],['text','Text messages or online chat'],['self_guided','Information or resources to use in my own time'],['other','Another way'],['none_suitable','None of these ways would suit'],['not_wanted','Not looking to use support or activities for this'],['no_preference','No preference'],['unsure','Not sure'],['prefer','Prefer not to answer']]),'Select all that apply. Your answers do not sign you up for anything.',{exclusive:['none_suitable','not_wanted','no_preference','unsure','prefer'],need,future_section:true}),
      field(key('format_other'),'What other way would suit you?','short',[],'',{need,conditional:'format_other',future_section:true})
    ]:[])
  ]};
}
function page(step) {
  if(step.id.startsWith('area:'))return areaPage(step.need||step.id.slice(5));
  const child=isChild();
  switch(step.id) {
    case 'earlier':return {title:'Your experience in Greater Darwin',intro:'You can share what you learnt from living in Greater Darwin. These experiences will be considered separately from current local needs.',fields:[field('earlier_experience',isAdult()?'What worked well when you lived in Greater Darwin, and what could have been better?':'What would you like to tell us about when you lived in Greater Darwin?','text',[],privacyHint())]};
    case 'connection':return {title:isAdult()?'A little about you':'A little about your family',intro:'',fields:[
      field('roles',isAdult()?'Which describes you?':'Which describes your family?','multi',roleOptions(),'Select all that apply.',{required:true,exclusive:['none','unsure']}),
      ...suburbFields(),
      ...(isAdult()?[field('age_group','Which age group are you in?','single',ADULT_AGE_GROUPS,'Optional.')]:[field('assistance','Is anyone helping you read or write your answers?','single',opts([['self','No, I am answering myself'],['guardian','Yes, my parent or guardian'],['other','Yes, someone else']]),'These are your answers. A helper can read or write for you, but should not choose your answers.',{required:true})]),
      ...(state.version==='youth'?[field('community_connection','What, if anything, has helped you feel welcome or included in Greater Darwin?','text',[],'Optional. '+privacyHint())]:[])
    ]};
    case 'needs':return {title:isAdult()?'Your support needs':'Where have you needed help?',intro:(isAdult()?'Support can include help from family, friends, your community or a service.':'Help can come from family, friends, school, your community or a service.')+` Think about your time living in Greater Darwin in ${period()}. If you arrived more recently, think about the time since you arrived.`,fields:[
      field('needs_status',isAdult()?`In ${period()}, have you needed any support?`:`In ${period()}, have you needed help with anything?`,'single',opts([['yes','Yes'],['no','No'],['unsure','Not sure'],['prefer','Prefer not to answer']])),
      field('needs',isAdult()?'What did you need support with?':'What did you need help with?','multi',domainList(),isAdult()?'Select all that apply. Include needs that were met and support you still need now.':'Choose any that fit, including things that are going better now.',{conditional:'needs_list'}),
      field('needs_other',isAdult()?'What else did you need help with?':'What else?','short',[],privacyHint(),{conditional:'other_need'}),
    ]};
    case 'future':return {title:'Looking ahead',intro:'You can share what may help now or in the coming months, even if you have not needed support recently. These choices do not sign you up for anything.',fields:[
      field('future_needs',isAdult()?'Thinking about now and the coming months, in which areas could support or activities be useful to you or your family?':'Where could help or activities be useful to you now or in the next few months?','multi',[...futureDomainList(),...opts([['none','None at the moment'],['unsure','Not sure'],['prefer','Prefer not to answer']])],isAdult()?'Select all that apply. You can choose an area even if you have not needed help with it recently.':'Choose any that fit, even if it has not been a problem.',{exclusive:['none','unsure','prefer']}),
      field('future_needs_other','Which area would you like to add?','short',[],privacyHint(),{conditional:'future_other_need'}),
      field('future_ideas','Are there any other ideas for support or activities that we have not covered?','text',[],'Optional. You can include ideas for later or for other Defence families, even if you do not want support yourself. '+privacyHint()),
      ...(isAdult()?[field('future_priority','Of the areas you selected, where could support make the biggest difference to you or your family?','single',[...selectedFutureNeeds(state.answers,domainList()).map(id=>({id,label:domainLabel(id)})),...opts([['equal','More than one is equally important'],['unsure','Not sure'],['prefer','Prefer not to answer']])],'Optional. Choose one or leave this blank.',{conditional:'future_priority'})]:[]),
      ...(state.version==='youth'?[field('focus_need','Would you like to tell us more about one of these areas?','single',selectedDetailNeeds(state.answers,domainList(),state.version).map(id=>({id,label:domainLabel(id)})),'Optional. Choose one area, or continue without choosing.',{conditional:'focus_need'})]:[]),
      ...(isAdult()?[field('children_ages','Which age groups are the children you care for in?','multi',opts([['under5','Under 5'],['5to11','5–11'],['12to17','12–17'],['none','I do not care for children under 18'],['prefer','Prefer not to say']]),'Select all that apply.',{exclusive:['none','prefer'],conditional:'children_ages'})]:[])
    ]};
    case 'practical':return {title:'Making support easier to use',intro:'Answer once for anything that applies. You can explain below if different things would work for different topics. You can also skip this section.',fields:[
      field('participation_enablers',isAdult()?'What, if anything, could make support or activities easier or more comfortable for you or your family to use?':'What would make it easier or more comfortable for you to get help or join in?','multi',isAdult()?opts([['low_cost','Free or low-cost support or activities'],['timing','Times that fit work, shifts or family life'],['drop_in','Being able to drop in without booking'],['bring_children','Being able to bring children'],['childcare','Help with childcare'],['transport','Help with transport or parking'],['language','An interpreter or support in another language'],['accessibility','Support that meets my access needs'],['defence_understanding','People who understand Defence life'],['privacy','Privacy when asking for or using support'],['other','Something else'],['none','Nothing else needed'],['unsure','Not sure'],['prefer','Prefer not to answer']]):opts([['know_before','Knowing what will happen before I join'],['trusted_person','Having someone I trust with me'],['peers','Being with people around my age'],['transport','Help getting there'],['low_cost','Free help or activities'],['understanding','Help to understand what is said or written'],['accessibility','Changes that would help me join in'],['defence_understanding','People who understand life in a Defence family'],['other','Something else'],['none','Nothing else needed'],['unsure','Not sure'],['prefer','Prefer not to answer']]),'Select all that apply.',{exclusive:['none','unsure','prefer']}),
      field('enablers_other','What else would make it easier?','short',[],privacyHint(),{conditional:'enablers_other'}),
      field('times',isAdult()?'For a call, appointment or activity at a set time, when would usually work for you or your family?':'When would usually work for you to talk to someone or join an activity?','multi',isAdult()?opts([['weekday_morning','Weekday mornings'],['weekday_afternoon','Weekday afternoons'],['weekday_evening','Weekday evenings'],['weekend','Weekends'],['variable','My availability changes'],['other','Other times'],['no_preference','No preference'],['unsure','Not sure'],['prefer','Prefer not to answer']]):opts([['school_hours','During school hours, if it could be arranged'],['after_school','After school'],['weekend','Weekends'],['school_holidays','School holidays'],['variable','It changes'],['other','Other times'],['no_preference','No preference'],['unsure','Not sure'],['prefer','Prefer not to answer']]),'Select all that apply.',{exclusive:['no_preference','unsure','prefer'],conditional:'live'}),
      field('time_other','What other times would work?','short',[],'',{conditional:'time_other'}),
      field('in_person_areas',isAdult()?'Which parts of Greater Darwin would be practical for you or your family to get to for in-person support or activities?':'Which parts of Greater Darwin could you get to for face-to-face help or activities?','multi',opts([['darwin_inner','Darwin city and inner suburbs'],['darwin_north','Darwin’s northern suburbs'],['palmerston','Palmerston'],['litchfield','Rural areas around Darwin'],['other','Another area'],['no_area','None of these areas would be practical'],['no_preference','No preference'],['unsure','Not sure'],['prefer','Prefer not to answer']]),isAdult()?'Select any that could work. You do not need to tell us where you live.':'Choose any that could work. It is OK not to know. Please do not give your home address or school name.',{exclusive:['no_area','no_preference','unsure','prefer'],conditional:'in_person'}),
      field('in_person_other','Which other area would suit you?','short',[],'',{conditional:'in_person_other'}),
      field('practical_note','Is there anything else that would help us understand what would work for you?','text',[],'Optional. For example, a type of place you would prefer, or different times or access needs for different topics. '+privacyHint())
    ]};
    case 'place':return {title:'Your life in Greater Darwin',intro:'',fields:[
      field('time_nt','How long have you lived in Greater Darwin?','single',opts([['never','I have not lived in Greater Darwin'],['under3','Less than 3 months'],['3to12','3 months to less than 1 year'],['1to3','1 year to less than 3 years'],['over3','3 years or more'],['unsure','Not sure'],['prefer','Prefer not to answer']]),'Count your current or most recent stay only.'),
      field('community_connection','What has made it easier or harder for you or your family to feel connected in Greater Darwin?','text',[],'Optional. '+privacyHint())
    ]};
    default:return {title:'Check your answers',intro:'',fields:[]};
  }
}

function optionHTML(o,f,value) {
  const checked = f.type==='multi' ? (value||[]).includes(o.id) : value===o.id;
  return `<label class="choice"><input type="${f.type==='multi'?'checkbox':'radio'}" name="${esc(f.key)}" value="${esc(o.id)}" ${checked?'checked':''}><span class="choice-body"><span class="choice-label">${esc(o.label)}</span>${o.hint?`<span class="choice-hint">${esc(o.hint)}</span>`:''}</span></label>`;
}
function conditionalVisible(f) {
  if(f.conditional==='local_area')return LOCAL_AREAS.includes(state.answers.residence_area);
  if(f.conditional==='outside_suburb')return state.answers.residence_area==='outside';
  if(f.conditional==='children_ages')return relevantChildStage(state.answers);
  if(f.conditional==='future_priority')return isAdult()&&selectedFutureNeeds(state.answers,domainList()).length>1;
  if(f.conditional==='enablers_other')return (state.answers.participation_enablers||[]).includes('other');
  if(f.conditional==='in_person')return inPersonParticipation(state.answers);
  if(f.conditional==='in_person_other')return inPersonParticipation(state.answers)&&(state.answers.in_person_areas||[]).includes('other');
  if(f.conditional==='time_other')return liveParticipation(state.answers)&&(state.answers.times||[]).includes('other');
  if(f.conditional==='other_suburb')return LOCAL_AREAS.includes(state.answers.residence_area)&&state.answers.suburb==='other';
  if(f.conditional==='needs_list')return hasNeedSelection(state.answers);
  if(f.conditional==='focus_need')return state.version==='youth'&&selectedDetailNeeds(state.answers,domainList(),state.version).length>0;
  if(f.conditional==='future_other_need')return (state.answers.future_needs||[]).includes('future_other_need');
  if(f.conditional==='format_other')return (state.answers.areas?.[f.need]?.formats||[]).includes('other');
  if(f.conditional==='formal_sources')return isAdult()&&hasFormalSource(state.answers.areas?.[f.need]||{});
  if(f.conditional==='area_barriers'){const a=state.answers.areas?.[f.need]||{};return hasSoughtHelp(a)||Boolean(a.sources?.includes('not_sought'));}
  if(f.conditional==='other_need')return hasNeedSelection(state.answers)&&Boolean(state.answers.needs?.includes('other_need'));
  if(f.conditional==='live')return liveParticipation(state.answers);
  return true;
}
function areaQuestionsHTML(content,need) {
  const past=content.fields.filter(f=>!f.future_section).map(fieldHTML).join('');
  const future=content.fields.filter(f=>f.future_section);
  if(future.length)return `${past}<section class="topic-future"><h2>Looking ahead: ${esc(domainLabel(need))}</h2>${future.map(fieldHTML).join('')}</section>`;
  if(selectedNeeds(state.answers,domainList()).includes(need)&&!isChild())return `${past}<div class="topic-future-opt-in"><button class="text-button" type="button" data-add-future="${esc(need)}">Add future ideas for this topic</button></div>`;
  return past;
}

function fieldHTML(f) {
  const v=getValue(f.key),hint=f.hint?`<span class="field-hint" id="hint-${esc(f.key)}">${esc(f.hint)}</span>`:'';
  const hidden=conditionalVisible(f)?'':'hidden';
  const describedBy=f.hint?`aria-describedby="hint-${esc(f.key)}"`:'';
  if(f.key==='residence_area'&&f.type==='single'){
    const primary=f.options.filter(o=>['darwin','palmerston','litchfield'].includes(o.id));
    const secondary=f.options.filter(o=>!['darwin','palmerston','litchfield'].includes(o.id));
    return `<fieldset class="question-group" data-field="${esc(f.key)}"><legend>${esc(f.label)}${hint}</legend><div class="choices area-primary-choices">${primary.map(o=>optionHTML(o,f,v)).join('')}</div><details class="area-other-options" ${secondary.some(o=>o.id===v)?'open':''}><summary>Other area</summary><div class="choices">${secondary.map(o=>optionHTML(o,f,v)).join('')}</div></details></fieldset>`;
  }
  if(['single','multi'].includes(f.type)) return `<fieldset class="question-group" data-field="${esc(f.key)}" ${hidden}><legend>${esc(f.label)}${f.required?'<span class="required-label">(required)</span>':''}${hint}</legend><div class="choices ${['needs','future_needs'].includes(f.key)&&!isChild()?'columns':''} ${f.options.length>6?'compact':''}">${f.options.map(o=>f.key==='needs'&&o.id==='other_need'?`<div class="other-need-option">${optionHTML(o,f,v)}${fieldHTML(page({id:'needs'}).fields.find(item=>item.key==='needs_other'))}</div>`:f.key==='future_needs'&&o.id==='future_other_need'?`<div class="other-need-option">${optionHTML(o,f,v)}${fieldHTML(page({id:'future'}).fields.find(item=>item.key==='future_needs_other'))}</div>`:optionHTML(o,f,v)).join('')}</div></fieldset>`;
  let input='';
  if(f.type==='select') input=`<select class="select" id="${esc(f.key)}" name="${esc(f.key)}" ${describedBy}><option value="">${esc(f.placeholder||'Choose an option')}</option>${f.options.map(o=>`<option value="${esc(o.id)}" ${v===o.id?'selected':''}>${esc(o.label)}${o.aliases?.length?' ('+esc(o.aliases.join(' / '))+')':''}</option>`).join('')}</select>`;
  else if(f.type==='short') input=`<input class="text-input" id="${esc(f.key)}" name="${esc(f.key)}" maxlength="160" value="${esc(v||'')}" autocomplete="off" ${describedBy}>`;
  else input=`<textarea class="textarea" id="${esc(f.key)}" name="${esc(f.key)}" maxlength="${maxTextLength(state.version)}" ${describedBy}>${esc(v||'')}</textarea><div class="char-count" data-counter="${esc(f.key)}" ${(v||'').length<maxTextLength(state.version)*.8?'hidden':''}>${maxTextLength(state.version)-(v||'').length} characters remaining</div>`;
  return `<div class="question-group${f.key==='needs_other'?' other-need-followup':''}" data-field="${esc(f.key)}" ${hidden}><label class="field-label" for="${esc(f.key)}">${esc(f.label)}${f.required?'<span class="required-label">(required)</span>':''}${hint}</label>${input}</div>`;
}
function focusHeading(){main.querySelector('h1')?.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
function resetAgePath(){
  resetYoung();state.age=null;state.ageAudience=null;state.ageRoute=null;state.version='adult';state.answers={};state.participation=null;state.guardianPermission=null;state.step='connection';state.returnToReview=false;
}
function setAgePath(age,route){
  if(age!==state.age)resetAgePath();
  state.age=age;state.ageAudience=route==='adult'?'adult':'minor';state.ageRoute=route;state.version=questionnaireVersion(age);
}
function renderWelcome(){
  state.screen='welcome';
  const audience=state.ageAudience||(state.ageRoute==='adult'?'adult':state.ageRoute?'minor':null);
  main.innerHTML=`<div class="welcome"><section class="welcome-intro"><h1 tabindex="-1">${esc(SURVEY_INVITATION.title)}</h1><p class="greeting">${esc(SURVEY_INVITATION.greeting)}</p>${SURVEY_INVITATION.paragraphs.map((value,i)=>`<p class="${i===0?'lead':''}">${esc(value)}</p>`).join('')}<p class="funding-note">${esc(SURVEY_INVITATION.funding)}</p></section><section class="welcome-age" aria-labelledby="welcome-age-title"><h2 id="welcome-age-title">Whose experience is this about?</h2><fieldset class="question-group"><legend class="visually-hidden">Adult or under 18</legend><div class="choices age-audience">${opts([['adult','Adult (18 or older)'],['minor','Child or young person (under 18)']]).map(option=>optionHTML(option,{key:'age_audience',type:'single'},audience)).join('')}</div></fieldset><div class="minor-age-options" id="minor-age-options" ${audience==='minor'?'':'hidden'}><fieldset class="question-group"><legend>How old is the child or young person?</legend><div class="choices">${opts([['youth','8–17'],['young','7 or younger']]).map(option=>optionHTML(option,{key:'age_route',type:'single'},state.ageRoute)).join('')}</div></fieldset></div></section><div id="welcome-consent" aria-live="polite"></div></div>`;
  const minorOptions=main.querySelector('#minor-age-options');
  main.querySelectorAll('input[name="age_audience"]').forEach(input=>input.addEventListener('change',()=>{
    if(input.value==='adult'){
      setAgePath('adult','adult');
      minorOptions.hidden=true;
      main.querySelectorAll('input[name="age_route"]').forEach(radio=>{radio.checked=false;});
    }else{
      if(state.ageAudience!=='minor'){resetAgePath();state.ageAudience='minor';}
      minorOptions.hidden=false;
    }
    renderWelcomeConsent();
  }));
  main.querySelectorAll('input[name="age_route"]').forEach(input=>input.addEventListener('change',()=>{
    if(input.value==='young')setAgePath('young','young');
    else if(state.ageRoute!=='youth'){resetAgePath();state.ageAudience='minor';state.ageRoute='youth';state.version='youth';}
    renderWelcomeConsent();
  }));
  renderWelcomeConsent();
}
function renderWelcomeConsent(){
  const host=main.querySelector('#welcome-consent');
  if(!host)return;
  if(!state.ageRoute){host.innerHTML='';return;}
  const youthAge=state.ageRoute==='youth'?`<fieldset class="question-group consent-subage"><legend>Young person’s age</legend><div class="choices">${opts([['younger','8–14'],['older','15–17']]).map(option=>optionHTML(option,{key:'youth_age',type:'single'},state.age==='youth_younger'?'younger':state.age==='youth_older'?'older':null)).join('')}</div></fieldset>`:'';
  if(!state.age){
    host.innerHTML=`<div class="welcome-consent">${youthAge}</div>`;
  }else{
    const adult=state.age==='adult',young=state.age==='young',guardian=needsGuardianPermission(state.age);
    const ageIntro=adult?'Please read the information below before deciding whether to take part.':young?'For a parent or guardian: you can record what your child says or shows and add your own observations separately. Your child does not have to answer.':'For a young person: Lutheran Care wants to learn what helps Defence families in Greater Darwin. The team will read your answers and share a summary with Defence without names or details that could show who you are. You can skip questions or stop. Please leave out names and school names. If we think someone is being hurt or is in serious danger, we may need to tell someone who can help. Someone can help you read or write, but should not choose your answers.';
    const guardianLabel=young?'I am this child’s parent or guardian and have authority to give permission. I have read the information and agree to Lutheran Care using and sharing their responses or my observations as described, including health or disability information I choose to provide.':'I am this young person’s parent or guardian and have authority to give permission. I have read the information and agree to Lutheran Care using and sharing their answers as described, including health or disability information they choose to provide.';
    const participantLabel=adult?'I have read the participant information and agree to take part. I consent to Lutheran Care collecting, using and sharing my answers as described, including any health or disability information I choose to share.':guardian?'I understand what these questions are for, and I want to take part. These will be my answers, even if someone helps me read or write.':'I have read the information, understand how my answers will be used, and agree to take part, including sharing health or disability information I choose to give.';
    host.innerHTML=`<div class="welcome-consent">${youthAge}<section class="age-summary" aria-labelledby="age-summary-title"><h2 id="age-summary-title">Before you begin</h2><p>${ageIntro}</p></section>${participantInformationHTML('welcome-participant-information')}<section class="participation-inline" aria-labelledby="participation-inline-title"><h2 id="participation-inline-title">Your agreement</h2><form id="welcome-consent-form">${guardian?`<h3 class="consent-role-label">For a parent or guardian</h3><label class="choice consent-choice"><input type="checkbox" name="guardian-permission" ${state.guardianPermission?.agreed?'checked':''}><span class="choice-label">${guardianLabel}</span></label>`:''}${young?'':`${guardian?'<h3 class="consent-role-label">For the young person</h3>':''}<label class="choice consent-choice"><input type="checkbox" name="participation" ${state.participation?.agreed?'checked':''}><span class="choice-label">${participantLabel}</span></label>`}<p class="error" id="welcome-consent-error" role="alert"></p><div class="welcome-start"><button class="button primary" type="submit" disabled>Start questions <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></button></div></form>${!adult?'<button class="text-button" type="button" id="welcome-help">I would like someone to explain this</button>':''}</section></div>`;
  }
  host.querySelectorAll('input[name="youth_age"]').forEach(input=>input.addEventListener('change',()=>{
    const age=input.value==='older'?'youth_older':'youth_younger';
    setAgePath(age,'youth');
    const update=()=>{renderWelcomeConsent();host.querySelector('input[name="youth_age"]:checked')?.focus({preventScroll:true});};
    if(typeof window.setTimeout==='function')window.setTimeout(update,0);else update();
  }));
  if(!state.age)return;
  const form=host.querySelector('#welcome-consent-form');
  const guardianInput=form.querySelector('input[name="guardian-permission"]');
  const participationInput=form.querySelector('input[name="participation"]');
  const start=form.querySelector('[type="submit"]');
  const updateStart=()=>{start.disabled=state.age==='young'?!state.guardianPermission?.agreed:!hasValidParticipation();};
  guardianInput?.addEventListener('change',()=>{
    state.guardianPermission=guardianPermissionRecord(state.age,guardianInput.checked);
    if(!guardianInput.checked){state.participation=null;state.answers={};resetYoung();if(participationInput)participationInput.checked=false;}
    else if(participationInput?.checked)state.participation=participationRecord(state.age,true,state.guardianPermission);
    updateStart();
  });
  participationInput?.addEventListener('change',()=>{
    state.participation=participationRecord(state.age,participationInput.checked,state.guardianPermission);
    if(!participationInput.checked)state.answers={};
    updateStart();
  });
  form.addEventListener('submit',event=>{
    event.preventDefault();updateStart();
    if(start.disabled){form.querySelector('#welcome-consent-error').textContent='Please read the information and choose whether to take part.';return;}
    if(state.age==='young')renderYoung();else{state.step='connection';renderSurvey();focusHeading();}
  });
  host.querySelector('#welcome-help')?.addEventListener('click',renderParticipationHelp);
  updateStart();
}
function renderParticipationHelp(){
  state.participation=null;
  state.screen='participation-help';
  main.innerHTML=`<section class="survey-layout"><h1 tabindex="-1">Getting help to take part</h1><p>A Lutheran Care worker can explain the questionnaire and help you take part.</p><p>If asking a parent or guardian would be unsafe or difficult, you can speak with a Lutheran Care worker privately first.</p><p>Ask the worker who invited you, or call Lutheran Care on <a href="tel:+61882699333">(08) 8269 9333</a> and ask for the NT Defence Family Support Program.</p><p>In Australia, you can also call <a href="https://kidshelpline.com.au/" target="_blank" rel="noopener">Kids Helpline</a> on 1800 55 1800 about a worry. In an emergency, call 000. Outside Australia, use your local emergency number.</p><div class="question-actions"><button class="back-button" id="help-back">Back</button><button class="button secondary" id="help-stop">Leave questionnaire</button></div></section>`;
  main.querySelector('#help-back').onclick=()=>{renderWelcome();focusHeading();};
  main.querySelector('#help-stop').onclick=renderParticipationDeclined;
  focusHeading();
}
function renderParticipationDeclined(){
  resetYoung();state.answers={};state.participation=null;state.guardianPermission=null;
  state.screen='declined';
  main.innerHTML=`<section class="finish"><h1 tabindex="-1">You’ve left the survey</h1><button class="button secondary" id="declined-back">Return to the start</button></section>`;
  main.querySelector('#declined-back').onclick=()=>{resetAgePath();renderWelcome();focusHeading();};
  focusHeading();
}
const YOUNG_PROMPTS = ['What do you like about living here?', 'Is there anything that feels hard?', 'Who helps you when you need help?', 'What would make things a little easier?'];
function resetYoung(){state.youngController?.reset();state.youngController=null;state.youngRecord=null;}
function renderYoung(){
  if(!state.guardianPermission?.agreed||state.guardianPermission.age_path!=='young'){resetYoung();renderWelcome();return;}
  state.screen='young';
  state.youngController ||= window.SURVEY_YOUNG_CHILDREN.create({main,guardianPermission:()=>state.guardianPermission,prompts:YOUNG_PROMPTS,onPermissionRequired:renderWelcome,onBack:()=>{renderWelcome();focusHeading();},onStop:renderParticipationDeclined,onInformation:()=>document.querySelector('#privacy-dialog').showModal(),onFinish:(record)=>{state.youngRecord=record;renderFinish();}});
  state.youngController.show();
}
function needsGuardianSupport(age,answers){return ['child','youth_younger'].includes(age)&&['self','other'].includes(answers.assistance)&&answers.guardian_present!==true;}
function renderGuardianSupport(){
  state.screen='guardian-support';
  main.innerHTML=`<section class="survey-layout"><h1 tabindex="-1">Please ask your parent or guardian to join you</h1><p>For this online questionnaire, a parent or guardian needs to be with you. You can still give your own answers, including when someone else helps you read or write.</p><p>If this would be unsafe or difficult, speak with Lutheran Care privately first.</p><form id="support-form"><label class="choice consent-choice"><input name="guardian-present" type="checkbox"><span class="choice-label">My parent or guardian is with me and agrees to this way of completing the questionnaire.</span></label><div class="question-actions"><button class="back-button" type="button" id="support-back">Back</button><button class="button primary" type="submit" disabled>Continue</button></div></form><button class="text-button" id="support-help">Speak with Lutheran Care privately</button></section>`;
  const form=main.querySelector('#support-form');form.onchange=()=>{form.querySelector('[type="submit"]').disabled=!form.querySelector('input').checked;};
  form.onsubmit=e=>{e.preventDefault();if(!form.querySelector('input').checked)return;state.answers.guardian_present=true;if(state.returnToReview){state.returnToReview=false;state.step='review';renderSurvey();focusHeading();}else goNext('connection');};
  main.querySelector('#support-back').onclick=()=>{state.step='connection';renderSurvey();focusHeading();};main.querySelector('#support-help').onclick=renderParticipationHelp;focusHeading();
}

function renderScope(){state.screen='scope';main.innerHTML=`<section class="finish"><h1 tabindex="-1">Thank you for your interest</h1><p class="lead">This consultation is for Australian Defence Force members and their families living in Greater Darwin, including Darwin, Palmerston and Litchfield.</p><div class="finish-actions"><button class="button primary" id="scope-back">Review my answer</button><button class="button secondary" id="scope-exit">Return to the start</button></div></section>`;main.querySelector('#scope-back').onclick=()=>{state.screen='survey';state.step='connection';renderSurvey();};main.querySelector('#scope-exit').onclick=()=>{state.answers={};renderWelcome();};focusHeading();}
function activeSteps(){return buildSteps(state.answers,domainList(),state.version);}
function reviewHTML(){return activeSteps().filter(s=>s.id!=='review').map(s=>{
  const p=page(s);
  const rows=p.fields.filter(f=>conditionalVisible(f)&&(f.required||hasAnswer(getValue(f.key)))).map(f=>{
    const v=getValue(f.key);let text;
    if(!hasAnswer(v))text='Not answered';
    else if(f.type==='text'||f.type==='short')text=v;
    else text=(Array.isArray(v)?v:[v]).map(id=>f.options.find(o=>o.id===id)?.label||id).join('; ');
    return `<div class="review-block"><div class="review-header"><h3>${esc(f.label)}</h3><button class="text-button" type="button" data-edit="${esc(s.id)}" data-detail="${f.optional_detail?'true':'false'}" aria-label="Change: ${esc(s.need?p.title+': ':'')}${esc(f.label)}">Change</button></div><p class="review-value">${esc(text)}</p></div>`;
  }).join('');
  const noDetail='';
  if(!rows)return `<section class="review-section"><div class="review-header"><h3>${esc(p.title)}</h3><button class="text-button" type="button" data-edit="${esc(s.id)}" aria-label="Add answers: ${esc(p.title)}">Add answers</button></div><p class="small">No optional answers added.</p></section>`;
  return `<section class="review-section">${s.need?`<h2>${esc(p.title)}</h2>`:''}${rows}${noDetail}</section>`;
}).join('');}

function renderSurveyHelp(){
  state.screen='survey-help';
  main.innerHTML=`<section class="survey-layout"><h1 tabindex="-1">Help or stop</h1><p>For help with the questionnaire, ask the Lutheran Care worker who invited you, or call <a href="tel:+61882699333">(08) 8269 9333</a> and ask for the NT Defence Family Support Program.</p>${isAdult()?'<p>For domestic, family or sexual violence support in Australia, contact <a href="https://www.1800respect.org.au/" target="_blank" rel="noopener">1800RESPECT</a> on 1800 737 732.</p>':'<p>If you are worried or feel unsafe, you can speak to a trusted adult or contact <a href="https://kidshelpline.com.au/" target="_blank" rel="noopener">Kids Helpline</a> on 1800 55 1800 in Australia.</p>'}<p>This questionnaire is not an urgent help service. In an emergency in Australia, call 000. Outside Australia, use your local emergency number.</p><div class="question-actions"><button class="back-button" id="survey-help-back">Back to my answers</button><button class="button secondary" id="survey-help-stop">Stop and clear my answers</button></div></section>`;
  main.querySelector('#survey-help-back').onclick=()=>{renderSurvey();focusHeading();};
  main.querySelector('#survey-help-stop').onclick=renderParticipationDeclined;
  focusHeading();
}
function requiredAnswersComplete(fields, answers) {
  return fields.filter(f=>f.required).every(f=>{const v=answers[f.key];return Array.isArray(v)?v.length>0:v!==undefined&&v!==null&&v!=='';});
}
function thankYouResource(config={}) {
  let url='';
  if (config.url === 'support.html') url = 'support.html';
  else try {const u=new URL(String(config.url||''));if(u.protocol==='https:'&&!u.username&&!u.password)url=u.href;} catch {}
  return {title:String(config.title||'A free resource for Defence families'),url};
}
function thankYouResourceHTML(config=globalThis.SURVEY_THANK_YOU_RESOURCE||{}) {
  const resource=thankYouResource(config);
  return `<section class="thank-you-resource"><p>As a thank-you for sharing your views, explore our free guide to support services for Defence members and families.</p>${resource.url?`<a class="button primary" href="${esc(resource.url)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">Find support in a few clicks</a>`:'<button class="button primary" disabled>Find support in a few clicks</button><p class="small">Available soon</p>'}</section>`;
}
function renderSurvey(){
  if(!hasValidParticipation()){renderWelcome();return;}
  if(state.step!=='connection'&&needsGuardianSupport(state.age,state.answers)){renderGuardianSupport();return;}
  state.screen='survey';
  const steps=activeSteps();let index=steps.findIndex(s=>s.id===state.step);if(index<0){state.step=steps[1]?.id||'connection';index=steps.findIndex(s=>s.id===state.step);}const s=steps[index],review=s.id==='review';let p=page(s);
  const early=consultationRoute(state.answers)==='earlier_experience';
  const displayPhases=early?['About you','Your experience','Review']:phases,phaseIndex=early?index:s.phase;
  main.innerHTML=`<div class="survey-layout"><section class="survey-main"><div class="step-topline"><strong>${esc(displayPhases[phaseIndex])}</strong><span>Section ${phaseIndex+1} of ${displayPhases.length}</span></div><div class="section-track" aria-hidden="true">${displayPhases.map((_,i)=>`<span class="${i<=phaseIndex?'visited':''}"></span>`).join('')}</div><form class="question-card" id="survey-form" novalidate><h1 tabindex="-1">${esc(p.title)}</h1>${p.intro?`<p class="question-intro">${esc(p.intro)}</p>`:''}${s.need&&state.version!=='youth'?`<p class="need-progress">Area ${detailedNeeds(state.answers,domainList(),state.version).indexOf(s.need)+1} of ${detailedNeeds(state.answers,domainList(),state.version).length}</p>`:''}${review?reviewHTML():s.need?areaQuestionsHTML(p,s.need):p.fields.filter(f=>!['needs_other','future_needs_other'].includes(f.key)).map(fieldHTML).join('')}<div class="error" id="form-error" role="alert"></div><div class="question-actions"><button class="back-button" type="button" id="back">Back</button><div class="action-right"><button class="button primary" type="submit">${review?'Finish preview':'Continue'}</button></div></div></form><button class="text-button" id="survey-help" type="button">Help or stop</button></section></div>`;
  main.querySelector('#survey-help').onclick=renderSurveyHelp;
  const form=main.querySelector('#survey-form');
  form.querySelector('[data-add-future]')?.addEventListener('click',()=>{
    const before=state.answers.future_needs||[];
    state.answers.future_needs=[...before.filter(id=>!['none','unsure','prefer'].includes(id)),s.need];
    reconcileAnswers(state.answers,'future_needs',domainList(),before);
    renderSurvey();
    focusHeading();
  });
  const refreshContinue=()=>{form.querySelector('[type="submit"]').disabled=!requiredAnswersComplete(p.fields.filter(conditionalVisible),state.answers);};
  refreshContinue();
  form.addEventListener('change',e=>{
    const input=e.target;if(!input.name)return;const f=p.fields.find(f=>f.key===input.name);if(!f)return;
    const old=getValue(f.key);let value=input.value;if(f.type==='multi')value=toggleChoice(old,input.value,f.exclusive||[]);
    setValue(f.key,value);if(JSON.stringify(old)!==JSON.stringify(value))reconcileAnswers(state.answers,f.key,domainList(),old);
    if(f.key==='residence_area'){const otherOptions=form.querySelector('[data-field="residence_area"] .area-other-options');if(otherOptions)otherOptions.open=!['darwin','palmerston','litchfield'].includes(value);p=page(s);const child=p.fields.find(item=>item.key==='suburb');const wrap=form.querySelector('[data-field="suburb"]');if(child&&wrap)wrap.outerHTML=fieldHTML(child);}
    if(s.id==='future'&&f.key==='future_needs'){
      p=page(s);
      const dependent=p.fields.find(item=>item.key===(state.version==='youth'?'focus_need':'future_priority'));
      const wrap=form.querySelector(`[data-field="${dependent?.key}"]`);
      if(dependent&&wrap)wrap.outerHTML=fieldHTML(dependent);
    }
    if(f.key.startsWith('areas:')&&f.key.endsWith(':sources')) {
      p=page(s);
      const barrier=p.fields.find(item=>item.key.endsWith(':barriers'));
      const wrap=form.querySelector(`[data-field="${barrier.key}"]`);
      if(wrap)wrap.outerHTML=fieldHTML(barrier);
    }
    for(const field of p.fields){
      const wrap=form.querySelector(`[data-field="${field.key}"]`);if(!wrap)continue;wrap.hidden=!conditionalVisible(field);
      const saved=getValue(field.key);
      wrap.querySelectorAll('input,textarea,select').forEach(el=>{if(el.name!==field.key)return;if(['checkbox','radio'].includes(el.type))el.checked=Array.isArray(saved)?saved.includes(el.value):saved===el.value;else el.value=saved??'';});
    }
    refreshContinue();
  });
  form.addEventListener('input',e=>{
    const input=e.target;
    if(!input.matches('textarea,input[type="text"],input.text-input'))return;
    const old=getValue(input.name);
    setValue(input.name,input.value);
    if(old!==input.value)reconcileAnswers(state.answers,input.name,domainList(),old);
    if(input.name==='future_needs_other'&&s.id==='future'){
      p=page(s);
      const dependent=p.fields.find(item=>item.key===(state.version==='youth'?'focus_need':'future_priority'));
      const wrap=form.querySelector(`[data-field="${dependent?.key}"]`);
      if(dependent&&wrap)wrap.outerHTML=fieldHTML(dependent);
    }
    const counter=form.querySelector(`[data-counter="${input.name}"]`);
    if(counter){counter.textContent=`${input.maxLength-input.value.length} characters remaining`;counter.hidden=input.value.length<input.maxLength*.8;}
    refreshContinue();
  });
  form.addEventListener('submit',e=>{e.preventDefault();const missing=p.fields.filter(conditionalVisible).find(f=>f.required&&(!getValue(f.key)||Array.isArray(getValue(f.key))&&!getValue(f.key).length));if(missing){const err=form.querySelector('#form-error');err.textContent='Please answer: '+missing.label;form.querySelector(`[name="${missing.key}"]`)?.focus();return;}if(s.id==='connection'&&isOutsideSurveyScope(state.answers)){renderScope();return;}if(s.id==='connection'&&needsGuardianSupport(state.age,state.answers)){renderGuardianSupport();return;}if(review){renderFinish();return;}if(state.returnToReview){state.returnToReview=false;state.step='review';renderSurvey();focusHeading();return;}goNext(s.id);});
  main.querySelector('#back').onclick=()=>{state.returnToReview=false;const current=activeSteps();const i=current.findIndex(x=>x.id===s.id);if(i<=0){renderWelcome();focusHeading();return;}state.step=current[i-1].id;renderSurvey();focusHeading();};

  main.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>{state.returnToReview=true;state.step=b.dataset.edit;renderSurvey();focusHeading();});
}
function goNext(id){const steps=activeSteps(),index=steps.findIndex(s=>s.id===id);state.step=steps[index+1]?.id||'review';renderSurvey();focusHeading();}
function contactLinkHTML(){return '<a class="button primary" href="contact.html" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">Request an interview</a>';}
function renderFinish(){state.screen='finish';main.innerHTML=`<section class="finish"><h1 tabindex="-1">You have reached the end of this survey preview.</h1><p>Your answers were not sent or saved.</p><div class="finish-next-steps"><section class="finish-contact"><p>Would you like to discuss your experiences and support needs further with Lutheran Care?</p>${contactLinkHTML()}</section>${thankYouResourceHTML()}</div><button class="text-button" id="restart">Clear answers and start again</button></section>`;main.querySelector('#restart').onclick=()=>{resetAgePath();renderWelcome();};focusHeading();}
const reviewNotes = new Map();
let libraryVersion = 'adult';
let libraryLocation = 'nt';

// Read the exact live question definitions in a temporary preview context.
// No synthetic answers from this library enter the respondent flow or results.
function questionLibrarySections(version,location) {
  const original={version:state.version,answers:state.answers};const first=DOMAINS[version][0].id,second=DOMAINS[version][1].id;
  state.version=version;state.answers={roles:['partner'],needs_status:'yes',residence_area:location==='nt'?'darwin':location==='outside'?'outside':'prefer',suburb:location==='nt'?'casuarina':'',past_residence:location==='outside'?'yes':undefined,needs:[first],...(version==='child'?{}:{future_needs:[second,'future_other_need'],future_needs_other:'Another future area',focus_need:first,in_person_areas:['darwin_inner','other']}),areas:{[first]:{received:'enough',sources:['family']},...(version==='child'?{}:{[second]:{formats:['group']}})}};
  try {
    const sections=[],add=(id,note='')=>sections.push({id,...page({id}),note});
    add('connection',version==='youth'?'ADF relationship and current residence, assistance, optional residence and a positive community-connection prompt precede the shorter youth questions. Earlier connections retain a separate historical route.':'ADF relationship and current residence, optional adult age band and a positive community-connection prompt precede the substantive questions. Earlier connections retain a separate historical route.');
    if(version!=='youth')add('place','Optional background precedes support needs. The broader area is chosen first; its suburb/locality is optional. Area-only answers retain their broader location without implying a suburb.');
    add('needs',version==='youth'?'Ask about help needed in the past three months, then record every selected area. One later focus area can be chosen from recent and future topics.':'Ask whether support was needed first. No skips recent-experience questions but still allows future support ideas. Yes or Not sure opens the recent area list; Something else is an unlisted recent need. Blank remains distinct from No.');
    if(version!=='child')add('future',version==='youth'?'Young people can name future areas even with no recent need, then optionally describe one recent or future area in detail.':'Everyone can name future support areas, including people with no recent need. “Something else” is separate from an unlisted past issue.');
    const area=areaPage(first),variants=[];
    for(const [id,title,sources] of [['sought','After looking for support',['family']],['not-sought','When support was not sought',['not_sought']]]) {
      state.answers.areas[first].sources=sources;
      variants.push({id,title,label:title,intro:'',fields:[areaBarrierField(first)]});
    }
    sections.push({id:'area',...area,title:version==='youth'?'One optional focus area: recent need':'Recent need: topic-specific questions',fields:area.fields.filter(f=>!f.key.endsWith(':barriers')),variants,note:version==='child'?'Only the selected recent topic is shown; the separate guardian-supported under-7 form uses its own prompts.':version==='youth'?'The young person can select many topics, then choose at most one to describe further. Recent help questions use the past three months. On a past-only focus topic, a small opt-in can add future ideas.':'For every selected recent need, ask about prior experience. On a past-only topic, a small opt-in can add it to future interests and reveal the topic-specific help and format questions.'});
    if(version!=='child'){
      const futureArea=areaPage(second);
      sections.push({id:'future-area',...futureArea,title:'Future interest without a recent need',note:'A future-only topic skips questions about past support. It goes straight to optional help and participation format questions for this topic.'});
      add('practical','Shown once when any future topic is selected. Timing appears for scheduled formats; Greater Darwin area choices appear for in-person formats.');
    }
    add('earlier','Separate historical route for people now outside Greater Darwin who have past local experience; not part of the recent-needs loop.');
    for(const section of sections)for(const item of section.fields){if(item.key==='suburb'){item.options=suburbs;item.options_rule='Show only localities whose region matches residence_area, plus other/prefer. Blank retains area only.';}}
    return sections;
  } finally {state.version=original.version;state.answers=original.answers;}
}

function libraryFieldHTML(f) {
  const conditional = {local_area:'Optional suburb list shown after a Greater Darwin area is chosen.',formal_sources:'Optional when a service or organisation source is selected.',outside_suburb:'Shown for Outside Greater Darwin.',children_ages:'Shown for childcare, schooling or parenting/caring topics.',future_priority:'Shown for adults after two or more future topics are selected.',enablers_other:'Shown after Something else is selected for practical arrangements.',in_person:'Shown when an in-person support format is selected in any future topic.',in_person_other:'Shown after Another area is selected.',time_other:'Shown after Other times is selected.',other_suburb:'Shown when Another suburb or locality in this area is selected.',needs_list:'Shown after Yes or Not sure to needing recent support.',focus_need:'Shown for youth after selecting at least one recent or future area.',future_other_need:'Shown after future Something else is selected.',format_other:'Shown after Another way is selected for this topic.',other_need:'Shown after recent Something else is selected.',live:'Shown after an in-person, group, phone or video format is selected in any future topic.'}[f.conditional];
  const type = {single:'Choose one',multi:'Select all that apply',select:'Choose one area',text:'Written answer',short:'Short written answer'}[f.type];
  return `<div class="library-question"><p class="question-meta">${type} · ${f.required?'Needed to continue':'Optional'}</p><h3>${esc(f.label)}</h3>${f.hint?`<p class="field-hint">${esc(f.hint)}</p>`:''}${conditional?`<p class="branch-note">${conditional}</p>`:''}${f.options.length?`<ul class="option-list">${f.options.map(o=>`<li>${esc(o.label)}${o.hint?` <small>— ${esc(o.hint)}</small>`:''}</li>`).join('')}</ul>`:`<p class="small">${f.type==='short'?'Up to 160 characters.':`Up to ${maxTextLength(libraryVersion)} characters.`}</p>`}</div>`;
}

function downloadText(filename, text, type='text/plain;charset=utf-8') {
  const url=URL.createObjectURL(new Blob([text],{type}));
  const link=document.createElement('a');link.href=url;link.download=filename;link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

function librarySectionFieldsHTML(section) {
  return section.fields.map(f=>{
    const variants=f.key.endsWith(section.fields.some(item=>item.key.endsWith(':service_names'))?':service_names':':sources')?(section.variants||[]).map(v=>`<div><h3 class="branch-label">${esc(v.title)}</h3>${v.fields.map(libraryFieldHTML).join('')}</div>`).join(''):'';
    return libraryFieldHTML(f)+variants;
  }).join('');
}

function renderQuestionLibrary() {
  const sections=questionLibrarySections(libraryVersion,libraryLocation);
  const versionLabel={adult:'Adults · 18 or older',youth:'Young people · 8–17'}[libraryVersion];
  main.innerHTML=`<h1>All questions</h1><p class="lead">Read the wording, options and different paths in one place.</p><p class="small">This list uses the same questions as the survey. Examples show one recent need and one future-only interest; a respondent sees their own selections. Notes are for your own review: they are not sent anywhere. Download them before closing or refreshing this page.</p><div class="library-tools"><label>Age version<select class="select" id="review-version"><option value="adult" ${libraryVersion==='adult'?'selected':''}>Adults · 18 or older</option><option value="youth" ${libraryVersion==='youth'?'selected':''}>Young people · 8–17</option></select></label><label>Location<select class="select" id="review-location"><option value="nt" ${libraryLocation==='nt'?'selected':''}>Living in Greater Darwin</option><option value="outside" ${libraryLocation==='outside'?'selected':''}>Other locality</option><option value="unspecified" ${libraryLocation==='unspecified'?'selected':''}>Residence not disclosed</option></select></label><button class="button secondary" id="print-questions">Print questions</button></div><p class="small" id="version-description">${versionLabel} · ${libraryLocation==='nt'?'Living in Greater Darwin':libraryLocation==='outside'?'Other locality':'Residence not disclosed'} · 28 September 2026</p><div class="notes-actions"><button class="button secondary" id="download-notes">Download review notes</button><span class="notes-status" aria-live="polite">${reviewNotes.size?`Notes in ${reviewNotes.size} section${reviewNotes.size===1?'':'s'}`:'No notes yet'}</span></div><nav class="library-index" aria-label="Question sections">${sections.map(s=>`<a href="#${s.id}">${esc(s.id==='adequacy'?'Support received':s.id==='barriers'?'Getting help':s.title)}</a>`).join('')}</nav>${sections.map(s=>{const key=`${libraryVersion}/${libraryLocation}/${s.id}`;return `<section class="library-section" id="${s.id}"><h2>${esc(s.title)}</h2><p class="small">${esc(s.intro)}</p>${s.note?`<p class="branch-note">${esc(s.note)}</p>`:''}${librarySectionFieldsHTML(s)}<label class="notes-label" for="note-${s.id}">Your review notes: ${esc(s.title)}</label><textarea class="textarea review-note" id="note-${s.id}" data-note="${key}" maxlength="4000" placeholder="Suggested wording, a missing option, or a question for the team">${esc(reviewNotes.get(key)||'')}</textarea></section>`;}).join('')}<section class="library-section" id="under-seven"><h2>Children aged 7 or younger</h2><p>A parent or guardian sees one response box per child prompt, followed by Your observations. Confirm willingness before recording the child’s own views; leave those questions blank when the child cannot or does not want to answer. The observations field remains available and records the adult’s perspective separately.</p><ol>${YOUNG_PROMPTS.map(text=>`<li>${esc(text)}</li>`).join('')}</ol><p>Each prompt has an optional written-response box. A separate optional box records parent/guardian observations. A parent or guardian can leave the child questions blank and enter only their observations, without a claim of child assent.</p><p>The 8–17 route shares one question set; an age follow-up changes only the participation steps. See the <a href="review.html#children">participation guide</a>.</p></section><div class="notes-actions"><button class="button primary" id="download-notes-bottom">Download review notes</button><a class="button secondary" href="index.html">Try the survey</a></div>`;
  main.querySelector('#review-version').onchange=e=>{libraryVersion=e.target.value;renderQuestionLibrary();};
  main.querySelector('#review-location').onchange=e=>{libraryLocation=e.target.value;renderQuestionLibrary();};
  main.querySelector('#print-questions').onclick=()=>window.print();
  main.querySelectorAll('[data-note]').forEach(input=>input.addEventListener('input',()=>{if(input.value.trim())reviewNotes.set(input.dataset.note,input.value);else reviewNotes.delete(input.dataset.note);main.querySelector('.notes-status').textContent=reviewNotes.size?`Notes in ${reviewNotes.size} section${reviewNotes.size===1?'':'s'}`:'No notes yet';}));
  const download=()=>{const entries=[...reviewNotes].map(([key,value])=>`## ${key}\n\n${value}`).join('\n\n');downloadText('nt-survey-review-notes.md',`# NT questionnaire review notes\n\nQuestionnaire: 28 September 2026\nSaved: ${new Date().toISOString()}\n\n${entries||'No notes entered.'}\n`);};
  main.querySelector('#download-notes').onclick=download;main.querySelector('#download-notes-bottom').onclick=download;
}

// The question library imports the same definitions as the respondent flow.
if (document.body.dataset.view === 'questions') {
  renderQuestionLibrary();
} else {
  document.querySelector('#privacy-copy').innerHTML=participantInformationHTML('privacy-information');
  document.querySelector('#privacy-open').onclick=()=>document.querySelector('#privacy-dialog').showModal();
  document.querySelector('#privacy-close').onclick=()=>document.querySelector('#privacy-dialog').close();
  document.querySelector('#privacy-dialog').addEventListener('click',e=>{if(e.target===e.currentTarget)e.currentTarget.close();});
  renderWelcome();
}
