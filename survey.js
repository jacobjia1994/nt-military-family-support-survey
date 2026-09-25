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

const NT_REGIONS = ['darwin','palmerston','katherine','alice','other_nt'];
const locationFrame = region => NT_REGIONS.includes(region) ? 'nt' : ['outside_au','outside_overseas'].includes(region) ? 'outside' : 'unspecified';
const SPECIAL_NEEDS = [];
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
function selectedFocusNeed(answers,domains) {
  const ids=selectedNeeds(answers,domains);
  return ids.includes(answers.focus_need)?answers.focus_need:null;
}
function detailedNeeds(answers,domains,version) {
  if(version!=='youth')return selectedNeeds(answers,domains);
  const focus=selectedFocusNeed(answers,domains);
  return focus?[focus]:[];
}
function hasSoughtHelp(area) { return (area.sources||[]).some(v=>!['not_sought','unsure','prefer'].includes(v)); }
function consultationRoute(answers) {
  return answers.serving_nt==='earlier'?'earlier_experience':answers.serving_nt==='recent'?'recent_nt':answers.serving_nt==='yes'?'current_nt':'uncertain_nt';
}
function reconcileAnswers(answers,changed,domains,previous) {
  if(changed==='needs_status'&&!hasNeedSelection(answers)){delete answers.needs;delete answers.needs_other;delete answers.focus_need;delete answers.areas;}
  if(changed==='needs') {
    const ids=selectedNeeds(answers,domains);
    if(!ids.includes('other_need'))delete answers.needs_other;
    if(!ids.includes(answers.focus_need))delete answers.focus_need;
    const focus=selectedFocusNeed(answers,domains);
    answers.areas=Object.fromEntries(Object.entries(answers.areas||{}).filter(([id])=>state.version==='youth'?id===focus:ids.includes(id)));
  }
  if(changed==='focus_need')answers.areas=Object.fromEntries(Object.entries(answers.areas||{}).filter(([id])=>id===answers.focus_need));
  if(changed==='needs_other'&&answers.areas)delete answers.areas.other_need;
  if(changed.startsWith('areas:')) {
    const [,id,key]=changed.split(':');
    if(key==='sources'&&answers.areas?.[id])delete answers.areas[id].barriers;
    if(key==='additional_support_now'&&answers.areas?.[id]?.additional_support_now!=='yes')delete answers.areas[id].support_requested;
  }
  if(changed==='serving_nt'&&previous!==answers.serving_nt) {
    for(const key of ['needs_status','needs','needs_other','focus_need','areas','delivery','times','anything','earlier_experience'])delete answers[key];
  }
  if(changed==='assistance'&&previous!==answers.assistance)delete answers.guardian_present;
  // Preferences are general; removing needs must not erase them.
  if(changed==='delivery'&&!(answers.delivery||[]).some(v=>['one_to_one','group','phone','video'].includes(v)))delete answers.times;
}
function buildSteps(answers,domains,version) {
  if(consultationRoute(answers)==='earlier_experience')return [{id:'connection',phase:0},{id:'earlier',phase:1},{id:'review',phase:2}];
  const steps=[{id:'connection',phase:0},...(version==='youth'?[]:[{id:'place',phase:0}]),{id:'needs',phase:1}];
  for(const need of detailedNeeds(answers,domains,version))steps.push({id:'area:'+need,phase:1,need});
  if(version!=='child')steps.push({id:'delivery',phase:2});
  steps.push({id:'review',phase:3});
  return steps;
}
function hasAnswer(value) { return value!==undefined&&value!==null&&value!==''&&(!Array.isArray(value)||value.length>0); }
function cleanExport(answers,version,domains) {
  const route=consultationRoute(answers),copy={};
  const allowed=route==='earlier_experience'?['roles','serving_nt','assistance','guardian_present','earlier_experience']:['roles','serving_nt','needs_status','needs','needs_other','delivery','times','force','region','time_nt','assistance','guardian_present'];
  if(version==='adult')allowed.push('age_group');
  if(version==='youth'&&route==='earlier_experience')allowed.push('region');
  if(version==='youth'&&route!=='earlier_experience')allowed.push('focus_need');
  for(const key of allowed)if(Object.hasOwn(answers,key))copy[key]=structuredClone(answers[key]);
  if(version==='youth'){
    delete copy.time_nt;delete copy.force;
    if(!selectedNeeds(answers,domains).includes(copy.focus_need))delete copy.focus_need;
  }
  if(Object.hasOwn(copy,'age_group')&&!ADULT_AGE_GROUPS.some(group=>group.id===copy.age_group))delete copy.age_group;
  if(!['self','guardian','other'].includes(copy.assistance)||version==='adult')delete copy.assistance;
  if(!['self','other'].includes(copy.assistance)||copy.guardian_present!==true)delete copy.guardian_present;
  if(route!=='earlier_experience') {
    const ids=detailedNeeds(answers,domains,version);
    if(!hasNeedSelection(answers))delete copy.needs;
    if(!selectedNeeds(answers,domains).includes('other_need'))delete copy.needs_other;
    copy.areas=Object.fromEntries(ids.map(id=>{
      const input=answers.areas?.[id]||{},area={};
      for(const key of ['received','additional_support_now','support_requested','sources','barriers','comment'])if(Object.hasOwn(input,key))area[key]=structuredClone(input[key]);
      if(!hasSoughtHelp(area)&&!area.sources?.includes('not_sought'))delete area.barriers;
      if(area.additional_support_now!=='yes')delete area.support_requested;
      return [id,area];
    }));
    if(!(copy.delivery||[]).some(v=>['one_to_one','group','phone','video'].includes(v)))delete copy.times;
  }
  return {schema_version:version==='youth'?'6.1':'6.0',questionnaire_revision:version==='adult'?'2026-09-25-adult-age-bands':version==='youth'?'2026-09-25-youth-8-17':'2026-09-25-child-voice',consultation_route:route,recall_months:route==='earlier_experience'?null:version==='adult'?12:3,measurement_scope:version==='youth'?'selected_needs_and_one_focus_area':'past_support_and_current_requests_by_area',details_optional:true,collection_mode:'internal_review_no_transmission',questionnaire_version:version,storage:'downloaded_by_respondent; not submitted',answers:copy};
}

const main = document.querySelector('#main');
const phases = ['About you','Your support','Finding support','Review'];
const state = { version:'adult', age:null, ageRoute:null, answers:{}, step:'connection', screen:'welcome', returnToReview:false, participation:null, guardianPermission:null,youngController:null,youngRecord:null };
const SURVEY_INVITATION = {"title": "Defence family support survey", "greeting": "Hello, NT Defence Communities!", "paragraphs": ["Lutheran Care would like your help to plan its Defence Family Support Program in the Northern Territory.", "Tell us about the support you have needed, what you received and what would help now.", "Please answer about your own experience."], "funding": "The program is funded by the Australian Government Department of Defence through its Family Support Funding Program."};
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
  return answers.serving_nt==='no' || Boolean(answers.roles?.includes('none'));
}

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const opts = pairs => pairs.map(([id,label,hint]) => ({id,label,hint}));
const ADULT_AGE_GROUPS = opts([['18_29','18–29'],['30_39','30–39'],['40_49','40–49'],['50_plus','50 or older']]);
const domainList = () => [...DOMAINS[state.version],{id:'other_need',label:'Something else'}];
const domainLabel = id => id==='other_need' ? (state.answers.needs_other || 'Something else') : domainList().find(d=>d.id===id)?.label || id;
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
const regions = opts([['darwin','Darwin'],['palmerston','Palmerston / Litchfield'],['katherine','Katherine / Tindal'],['alice','Alice Springs'],['other_nt','Elsewhere in the NT'],['outside_au','Elsewhere in Australia'],['outside_overseas','Outside Australia'],['prefer','Prefer not to answer']]);
const adequacy = () => opts([['enough',isAdult()?'Enough to meet my needs':'I got enough help'],['some',isAdult()?'Some, but not enough':'I got some help, but needed more'],['none',isAdult()?'None':'I did not get any help'],['unsure','Not sure'],['prefer','Prefer not to answer']]);
const roleOptions = () => isAdult() ? opts([['serving','I am a current or former serving member'],['partner','I am a partner, spouse or former partner'],['child','I am the child of a current or former serving member'],['parent','I am the parent of a current or former serving member'],['other_family','I am another family member or carer'],['none','None of these']]) : opts([['child','My parent or carer serves or has served in the military'],['other_family','Someone else in my family serves or has served in the military'],['none','Neither of these'],['unsure','Not sure']]);
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
  return {title:domainLabel(need),intro:'',fields:[
    field(key('received'),isAdult()?`In ${period()}, how much of the support you needed did you receive?`:`In ${period()}, did you get enough help with this?`,'single',adequacy()),
    field(key('additional_support_now'),youngPerson?'Would more or different help with this be useful now?':isChild()?'Would you like more help with this now?':'Would you like any extra or different support with this now?','single',opts([['yes','Yes'],['no','No'],['unsure','Not sure'],['prefer','Prefer not to answer']])),
    field(key('support_requested'),youngPerson?'What kind of help would be useful?':isChild()?'What help would you like now?':'What support would help you now?','text',[],privacyHint(),{need,conditional:'additional_support'}),
    field(key('sources'),isAdult()?`In ${period()}, where have you looked for support with this?`:`In ${period()}, who have you asked for help with this?`,'multi',areaSources(),'Select all that apply.',{exclusive:['not_sought','unsure','prefer'],need,optional_detail:true}),
    areaBarrierField(need),
    field(key('comment'),youngPerson?'What helped, or what could have been better?':isChild()?'What happened when you needed help with this?':'What happened when you needed support with this?','text',[],(isAdult()?'You could describe what helped, or what would have made things easier. ':'You can tell us what happened, or leave this blank. ')+privacyHint(),{need,optional_detail:true})
  ]};
}
function page(step) {
  if(step.id.startsWith('area:'))return areaPage(step.need||step.id.slice(5));
  const child=isChild();
  switch(step.id) {
    case 'earlier':return {title:'Your experience in the NT',intro:'We’d like to hear what worked well and what could have been better.',fields:[field('earlier_experience',isAdult()?'What worked well during your family’s time in the NT, and what could have been better?':'What would you like to tell us about your family’s time in the NT?','text',[],privacyHint())]};
    case 'connection':return {title:isAdult()?'Your connection to military life':'A little about your family',intro:'',fields:[
      field('roles',isAdult()?'Which describes you?':'Which describes your family?','multi',roleOptions(),'Select all that apply.',{required:true,exclusive:['none','unsure']}),
      field('serving_nt',isAdult()?'When did you or your family member last serve in the NT?':'When did your family member last serve in the NT?','single',opts([['yes','Serving in the NT now'],['recent','Within the past 12 months, but not currently'],['earlier','More than 12 months ago'],['no','No military service in the NT'],['unsure','Not sure']]),'Select one.',{required:true}),
      ...(isAdult()?[field('age_group','Which age group are you in?','single',ADULT_AGE_GROUPS,'Optional. This helps us see whether support needs differ by age.')]:[field('assistance','Is anyone helping you read or write your answers?','single',opts([['self','No, I am answering myself'],['guardian','Yes, my parent or guardian'],['other','Yes, someone else']]),'These are your answers. A helper can read or write for you, but should not choose your answers.',{required:true}),...(state.version==='youth'?[field('region','Which area do you live in now?','select',regions,'Optional. You can ask someone if you are not sure.')]:[])])
    ]};
    case 'needs':return {title:isAdult()?'Your support needs':'Where have you needed help?',intro:isAdult()?'Support can include help from family, friends, your community or a service.':'Help can come from family, friends, school, your community or a service.',fields:[
      field('needs_status',isAdult()?`In ${period()}, have you needed any support?`:`In ${period()}, have you needed help with anything?`,'single',opts([['yes','Yes'],['no','No'],['unsure','Not sure'],['prefer','Prefer not to answer']])),
      field('needs',isAdult()?'What did you need support with?':'What did you need help with?','multi',domainList(),isAdult()?'Select all that apply. Include needs that were met and support you still need now.':'Choose any that fit, including things that are going better now.',{conditional:'needs_list'}),
      field('needs_other',isAdult()?'What else did you need help with?':'What else?','short',[],privacyHint(),{conditional:'other_need'}),
      ...(state.version==='youth'?[field('focus_need','Would you like to tell us more about one of these?','single',selectedNeeds(state.answers,domainList()).map(id=>({id,label:domainLabel(id)})),'Optional. Choose one area, or continue without choosing.',{conditional:'focus_need'})]:[])
    ]};
    case 'delivery':return {title:'Finding services and support in the NT',intro:'',fields:[
      field('delivery',isAdult()?'How would you prefer to get information or advice about services and support in the NT?':'How would you like to find out about help in the NT?','multi',opts([['one_to_one','In person, one to one'],['group','In person, in a group'],['phone','By phone'],['video','By video call'],['text','By message or online chat'],['information','Information I can read in my own time'],['referral','Someone to help me find a suitable service'],['not_wanted','I would not want help from a service'],['unsure','Not sure'],['no_preference','No particular preference'],['other','Another way'],['prefer','Prefer not to answer']]),'Select all that apply.',{exclusive:['not_wanted','unsure','no_preference','prefer']}),
      field('times','When would a call, meeting or activity suit you?','multi',opts([['weekday_day','Weekday daytime'],['weekday_evening','Weekday evenings'],['weekend','Weekends'],['variable','It changes from week to week'],['no_preference','No particular preference'],['prefer','Prefer not to answer']]),'Select all that apply. Use your local time.',{exclusive:['no_preference','prefer'],conditional:'live'})
    ]};
    case 'place':return {title:'About you',intro:'',fields:[
      field('region','Which area do you live in?','select',regions,'Optional. This helps us plan where and how to offer support. Living outside the NT does not affect whether you can take part.'),
      field('time_nt','How long have you lived in the NT?','single',opts([['never','I have not lived in the NT'],['under3','Less than 3 months'],['3to12','3 months to less than 1 year'],['1to3','1 year to less than 3 years'],['over3','3 years or more'],['unsure','Not sure'],['prefer','Prefer not to answer']]),'Count your current or most recent stay only.'),
      field('force',isAdult()?'Which military are you or your family connected with?':'Which military is your family member part of?','single',opts([['adf','Australian Defence Force'],['other','Another country’s military'],['both','Both'],['unsure','Not sure'],['prefer','Prefer not to answer']])),

    ]};
    default:return {title:'Check your answers',intro:'',fields:[]};
  }
}

function optionHTML(o,f,value) {
  const checked = f.type==='multi' ? (value||[]).includes(o.id) : value===o.id;
  return `<label class="choice"><input type="${f.type==='multi'?'checkbox':'radio'}" name="${esc(f.key)}" value="${esc(o.id)}" ${checked?'checked':''}><span class="choice-body"><span class="choice-label">${esc(o.label)}</span>${o.hint?`<span class="choice-hint">${esc(o.hint)}</span>`:''}</span></label>`;
}
function conditionalVisible(f) {
  if(f.conditional==='needs_list')return hasNeedSelection(state.answers);
  if(f.conditional==='focus_need')return state.version==='youth'&&selectedNeeds(state.answers,domainList()).length>0;
  if(f.conditional==='additional_support')return state.answers.areas?.[f.need]?.additional_support_now==='yes';
  if(f.conditional==='area_barriers'){const a=state.answers.areas?.[f.need]||{};return hasSoughtHelp(a)||Boolean(a.sources?.includes('not_sought'));}
  if(f.conditional==='other_need')return hasNeedSelection(state.answers)&&Boolean(state.answers.needs?.includes('other_need'));
  if(f.conditional==='live')return (state.answers.delivery||[]).some(v=>['one_to_one','group','phone','video'].includes(v));
  return true;
}
function areaQuestionsHTML(content) { return content.fields.map(fieldHTML).join(''); }

function fieldHTML(f) {
  const v=getValue(f.key),hint=f.hint?`<span class="field-hint" id="hint-${esc(f.key)}">${esc(f.hint)}</span>`:'';
  const hidden=conditionalVisible(f)?'':'hidden';
  const describedBy=f.hint?`aria-describedby="hint-${esc(f.key)}"`:'';
  if(['single','multi'].includes(f.type)) return `<fieldset class="question-group" data-field="${esc(f.key)}" ${hidden}><legend>${esc(f.label)}${f.required?'<span class="required-label">(required)</span>':''}${hint}</legend><div class="choices ${f.key==='needs'&&!isChild()?'columns':''} ${f.options.length>6?'compact':''}">${f.options.map(o=>f.key==='needs'&&o.id==='other_need'?`<div class="other-need-option">${optionHTML(o,f,v)}${fieldHTML(page({id:'needs'}).fields.find(item=>item.key==='needs_other'))}</div>`:optionHTML(o,f,v)).join('')}</div></fieldset>`;
  let input='';
  if(f.type==='select') input=`<select class="select" id="${esc(f.key)}" name="${esc(f.key)}" ${describedBy}><option value="">Choose an option</option>${f.options.map(o=>`<option value="${esc(o.id)}" ${v===o.id?'selected':''}>${esc(o.label)}</option>`).join('')}</select>`;
  else if(f.type==='short') input=`<input class="text-input" id="${esc(f.key)}" name="${esc(f.key)}" maxlength="160" value="${esc(v||'')}" autocomplete="off" ${describedBy}>`;
  else input=`<textarea class="textarea" id="${esc(f.key)}" name="${esc(f.key)}" maxlength="${maxTextLength(state.version)}" ${describedBy}>${esc(v||'')}</textarea><div class="char-count" data-counter="${esc(f.key)}" ${(v||'').length<maxTextLength(state.version)*.8?'hidden':''}>${maxTextLength(state.version)-(v||'').length} characters remaining</div>`;
  return `<div class="question-group${f.key==='needs_other'?' other-need-followup':''}" data-field="${esc(f.key)}" ${hidden}><label class="field-label" for="${esc(f.key)}">${esc(f.label)}${f.required?'<span class="required-label">(required)</span>':''}${hint}</label>${input}</div>`;
}
function focusHeading(){main.querySelector('h1')?.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
function resetAgePath(){
  resetYoung();state.age=null;state.ageRoute=null;state.version='adult';state.answers={};state.participation=null;state.guardianPermission=null;state.step='connection';state.returnToReview=false;
}
function setAgePath(age,route){
  if(age!==state.age)resetAgePath();
  state.age=age;state.ageRoute=route;state.version=questionnaireVersion(age);
}
function renderWelcome(){
  state.screen='welcome';
  main.innerHTML=`<div class="welcome"><section class="welcome-intro"><h1 tabindex="-1">${esc(SURVEY_INVITATION.title)}</h1><p class="greeting">${esc(SURVEY_INVITATION.greeting)}</p>${SURVEY_INVITATION.paragraphs.map((value,i)=>`<p class="${i===0?'lead':''}">${esc(value)}</p>`).join('')}<p class="funding-note">${esc(SURVEY_INVITATION.funding)}</p></section><section class="welcome-age" aria-labelledby="welcome-age-title"><h2 id="welcome-age-title">Whose experience is this about?</h2><p>Choose an age range to see the right questions and information about taking part.</p><fieldset class="question-group"><legend class="visually-hidden">Age range</legend><div class="age-grid welcome-age-grid">${opts([['young','7 or younger'],['youth','8–17'],['adult','18 or older']]).map(option=>optionHTML(option,{key:'age_route',type:'single'},state.ageRoute)).join('')}</div></fieldset></section><div id="welcome-consent" aria-live="polite"></div></div>`;
  main.querySelectorAll('input[name="age_route"]').forEach(input=>input.addEventListener('change',()=>{
    if(input.value!==state.ageRoute){
      if(input.value==='adult')setAgePath('adult','adult');
      else if(input.value==='young')setAgePath('young','young');
      else{resetAgePath();state.ageRoute='youth';state.version='youth';}
    }
    renderWelcomeConsent();
  }));
  renderWelcomeConsent();
}
function renderWelcomeConsent(){
  const host=main.querySelector('#welcome-consent');
  if(!host)return;
  if(!state.ageRoute){host.innerHTML='';return;}
  const youthAge=state.ageRoute==='youth'?`<fieldset class="question-group consent-subage"><legend>Is the young person 15 or older?</legend><p class="field-hint">Everyone aged 8–17 sees the same questions. This helps us show who needs to agree before they begin.</p><div class="age-grid age-route-grid">${opts([['younger','No, 8–14'],['older','Yes, 15–17']]).map(option=>optionHTML(option,{key:'youth_age',type:'single'},state.age==='youth_younger'?'younger':state.age==='youth_older'?'older':null)).join('')}</div></fieldset>`:'';
  if(!state.age){
    host.innerHTML=`<div class="welcome-consent">${youthAge}</div>`;
  }else{
    const adult=state.age==='adult',young=state.age==='young',guardian=needsGuardianPermission(state.age);
    const ageIntro=adult?'Please read the information below before deciding whether to take part.':young?'For a parent or guardian: you can record what your child says or shows and add your own observations separately. Your child does not have to answer.':'For a young person: Lutheran Care wants to learn what helps Defence families in the NT. The team will read your answers and share a summary with Defence without names or details that could show who you are. You can skip questions or stop. Please leave out names and school names. If we think someone is being hurt or is in serious danger, we may need to tell someone who can help. Someone can help you read or write, but should not choose your answers.';
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
const YOUNG_PROMPTS = ['What do you like about being here?', 'Is there anything that feels hard?', 'Who helps you when you need help?', 'What would make things a little easier?'];
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

function renderScope(){state.screen='scope';main.innerHTML=`<section class="finish"><h1 tabindex="-1">Thank you for your interest</h1><p class="lead">This consultation focuses on experiences of military service in the Northern Territory.</p><div class="finish-actions"><button class="button primary" id="scope-back">Review my answer</button><button class="button secondary" id="scope-exit">Return to the start</button></div></section>`;main.querySelector('#scope-back').onclick=()=>{state.screen='survey';state.step='connection';renderSurvey();};main.querySelector('#scope-exit').onclick=()=>{state.answers={};renderWelcome();};focusHeading();}
function activeSteps(){return buildSteps(state.answers,domainList(),state.version);}
function reviewHTML(){return activeSteps().filter(s=>s.id!=='review').map(s=>{
  const p=page(s);
  const rows=p.fields.filter(f=>conditionalVisible(f)&&(state.version==='youth'?f.required||hasAnswer(getValue(f.key)):!f.optional_detail||hasAnswer(getValue(f.key)))).map(f=>{
    const v=getValue(f.key);let text;
    if(!hasAnswer(v))text='Not answered';
    else if(f.type==='text'||f.type==='short')text=v;
    else text=(Array.isArray(v)?v:[v]).map(id=>f.options.find(o=>o.id===id)?.label||id).join('; ');
    return `<div class="review-block"><div class="review-header"><h3>${esc(f.label)}</h3><button class="text-button" type="button" data-edit="${esc(s.id)}" data-detail="${f.optional_detail?'true':'false'}" aria-label="Change: ${esc(s.need?p.title+': ':'')}${esc(f.label)}">Change</button></div><p class="review-value">${esc(text)}</p></div>`;
  }).join('');
  const noDetail='';
  if(state.version==='youth'&&!rows)return '';
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
  return `<section class="thank-you-resource" aria-labelledby="resource-title"><h2 id="resource-title">${esc(resource.title)}</h2>${resource.url?`<a class="button primary" href="${esc(resource.url)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">Find support services</a>`:'<button class="button secondary" disabled>Find support services</button><p class="small">Available soon</p>'}</section>`;
}
function renderSurvey(){
  if(!hasValidParticipation()){renderWelcome();return;}
  if(state.step!=='connection'&&needsGuardianSupport(state.age,state.answers)){renderGuardianSupport();return;}
  state.screen='survey';
  const steps=activeSteps();let index=steps.findIndex(s=>s.id===state.step);if(index<0){state.step=steps[1]?.id||'connection';index=steps.findIndex(s=>s.id===state.step);}const s=steps[index],review=s.id==='review';let p=page(s);
  const early=consultationRoute(state.answers)==='earlier_experience';
  const displayPhases=early?['About you','Your experience','Review']:phases,phaseIndex=early?index:s.phase;
  main.innerHTML=`<div class="survey-layout"><section class="survey-main"><div class="step-topline"><strong>${esc(displayPhases[phaseIndex])}</strong><span>Section ${phaseIndex+1} of ${displayPhases.length}</span></div><div class="section-track" aria-hidden="true">${displayPhases.map((_,i)=>`<span class="${i<=phaseIndex?'visited':''}"></span>`).join('')}</div><form class="question-card" id="survey-form" novalidate><h1 tabindex="-1">${esc(p.title)}</h1>${p.intro?`<p class="question-intro">${esc(p.intro)}</p>`:''}${s.need&&state.version!=='youth'?`<p class="need-progress">Area ${detailedNeeds(state.answers,domainList(),state.version).indexOf(s.need)+1} of ${detailedNeeds(state.answers,domainList(),state.version).length}</p>`:''}${review?reviewHTML():s.need?areaQuestionsHTML(p,s.need):p.fields.filter(f=>f.key!=='needs_other').map(fieldHTML).join('')}<div class="error" id="form-error" role="alert"></div><div class="question-actions"><button class="back-button" type="button" id="back">Back</button><div class="action-right"><button class="button primary" type="submit">${review?'Confirm and submit':'Continue'}</button></div></div></form><button class="text-button" id="survey-help" type="button">Help or stop</button></section></div>`;
  main.querySelector('#survey-help').onclick=renderSurveyHelp;
  const form=main.querySelector('#survey-form');
  const refreshContinue=()=>{form.querySelector('[type="submit"]').disabled=!requiredAnswersComplete(p.fields.filter(conditionalVisible),state.answers);};
  refreshContinue();
  form.addEventListener('change',e=>{
    const input=e.target;if(!input.name)return;const f=p.fields.find(f=>f.key===input.name);if(!f)return;
    const old=getValue(f.key);let value=input.value;if(f.type==='multi')value=toggleChoice(old,input.value,f.exclusive||[]);
    setValue(f.key,value);if(JSON.stringify(old)!==JSON.stringify(value))reconcileAnswers(state.answers,f.key,domainList(),old);
    if(s.id==='needs'&&['needs','needs_status'].includes(f.key)&&state.version==='youth'){
      p=page(s);
      const focus=p.fields.find(item=>item.key==='focus_need');
      const wrap=form.querySelector('[data-field="focus_need"]');
      if(focus&&wrap)wrap.outerHTML=fieldHTML(focus);
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
    if(input.name==='needs_other'&&state.version==='youth'){
      p=page(s);
      const focus=p.fields.find(item=>item.key==='focus_need');
      const wrap=form.querySelector('[data-field="focus_need"]');
      if(focus&&wrap)wrap.outerHTML=fieldHTML(focus);
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
function contactLinkHTML(){return '<a class="button secondary" href="contact.html" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">Request an interview</a>';}
function renderFinish(){state.screen='finish';main.innerHTML=`<section class="finish"><h1 tabindex="-1">Thank you for helping improve support in our NT communities.</h1><div class="finish-contact">${contactLinkHTML()}</div>${thankYouResourceHTML()}<div class="finish-actions"><button class="button secondary" id="download-answers">Save my answers</button><button class="button secondary" id="review-answers">Review my answers</button></div><button class="text-button" id="restart">Clear answers and start again</button></section>`;main.querySelector('#download-answers').onclick=()=>{const data=state.age==='young'?state.youngController.exportAnswers():cleanExport(state.answers,state.version,domainList());if(state.age!=='young')data.participation=state.participation;const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='my-nt-support-answers.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};main.querySelector('#review-answers').onclick=()=>{if(state.age==='young'){state.screen='young';state.youngController.showReview();return;}state.step='review';renderSurvey();focusHeading();};main.querySelector('#restart').onclick=()=>{resetAgePath();renderWelcome();};focusHeading();}
const reviewNotes = new Map();
let libraryVersion = 'adult';
let libraryLocation = 'nt';

// Read the exact live question definitions in a temporary preview context.
// No synthetic answers from this library enter the respondent flow or results.
function questionLibrarySections(version,location) {
  const original={version:state.version,answers:state.answers};const first=DOMAINS[version][0].id;
  state.version=version;state.answers={roles:['partner'],serving_nt:'yes',needs_status:'yes',region:location==='nt'?'darwin':location==='outside'?'outside_au':'prefer',needs:[first],areas:{[first]:{received:'enough',additional_support_now:'yes',sources:['family']}}};
  try {
    const sections=[],add=(id,note='')=>sections.push({id,...page({id}),note});
    add('connection',version==='youth'?'Relationship, NT connection, assistance and optional residence precede the shorter youth questions. Earlier connections retain a separate historical route.':'Relationship, NT connection and optional adult age band precede the substantive questions. Earlier connections retain a separate historical route.');
    if(version!=='youth')add('place','Optional background precedes support needs. Residence does not control eligibility.');
    add('needs',version==='youth'?'Ask about help needed in the past three months, then record every selected area. The young person can optionally choose one area to describe further. No still leads to information preferences.':'Ask whether support was needed first. No skips the area questions but retains service-information preferences. Yes or Not sure opens the area list; Something else is only an unlisted need. Blank remains distinct from No.');
    const area=areaPage(first),variants=[];
    for(const [id,title,sources] of [['sought','After looking for support',['family']],['not-sought','When support was not sought',['not_sought']]]) {
      state.answers.areas[first].sources=sources;
      variants.push({id,title,label:title,intro:'',fields:[areaBarrierField(first)]});
    }
    sections.push({id:'area',...area,title:version==='youth'?'For one optional focus area':'For each selected area',fields:area.fields.filter(f=>!f.key.endsWith(':barriers')),variants,note:version==='youth'?'Young people can select many needs, then choose at most one to describe further. All youth questions use the past three months when asking about earlier help; extra help wanted refers to now.':'Questions are displayed directly. Extra support requested appears only after Yes; past experience remains available to everyone selecting this area. Sources and barriers use the same recall period. Blank answers do not mean no barrier.'});
    if(version!=='child')add('delivery','Everyone in the main adult/youth route can give general information/advice preferences, including those with no selected needs.');
    add('earlier','Separate historical route for NT service ending more than 12 months ago; not part of the recent-needs loop.');
    return sections;
  } finally {state.version=original.version;state.answers=original.answers;}
}

function libraryFieldHTML(f) {
  const conditional = {needs_list:'Shown after Yes or Not sure to needing support.',focus_need:'Shown after selecting at least one support area.',additional_support:'Shown after Yes to extra or different support now.',nt:'Shown to people living in the NT.',other_need:'Shown after “Something else” is selected.',another:'Shown after “Something else” is selected.',live:'Shown after an in-person, group, phone or video option is selected.'}[f.conditional];
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
    const variants=f.key.endsWith(':sources')?(section.variants||[]).map(v=>`<div><h3 class="branch-label">${esc(v.title)}</h3>${v.fields.map(libraryFieldHTML).join('')}</div>`).join(''):'';
    return libraryFieldHTML(f)+variants;
  }).join('');
}

function renderQuestionLibrary() {
  const sections=questionLibrarySections(libraryVersion,libraryLocation);
  const versionLabel={adult:'Adults · 18 or older',youth:'Young people · 8–17'}[libraryVersion];
  main.innerHTML=`<h1>All questions</h1><p class="lead">Read the wording, options and different paths in one place.</p><p class="small">This list uses the same questions as the survey. Follow-up examples name the first support area; a respondent sees their own choice. Notes are for your own review: they are not sent anywhere. Download them before closing or refreshing this page.</p><div class="library-tools"><label>Age version<select class="select" id="review-version"><option value="adult" ${libraryVersion==='adult'?'selected':''}>Adults · 18 or older</option><option value="youth" ${libraryVersion==='youth'?'selected':''}>Young people · 8–17</option></select></label><label>Location<select class="select" id="review-location"><option value="nt" ${libraryLocation==='nt'?'selected':''}>Living in the NT</option><option value="outside" ${libraryLocation==='outside'?'selected':''}>Living outside the NT</option><option value="unspecified" ${libraryLocation==='unspecified'?'selected':''}>Residence not disclosed</option></select></label><button class="button secondary" id="print-questions">Print questions</button></div><p class="small" id="version-description">${versionLabel} · ${libraryLocation==='nt'?'Living in the NT':libraryLocation==='outside'?'Living outside the NT':'Residence not disclosed'} · 25 September 2026</p><div class="notes-actions"><button class="button secondary" id="download-notes">Download review notes</button><span class="notes-status" aria-live="polite">${reviewNotes.size?`Notes in ${reviewNotes.size} section${reviewNotes.size===1?'':'s'}`:'No notes yet'}</span></div><nav class="library-index" aria-label="Question sections">${sections.map(s=>`<a href="#${s.id}">${esc(s.id==='adequacy'?'Support received':s.id==='barriers'?'Getting help':s.title)}</a>`).join('')}</nav>${sections.map(s=>{const key=`${libraryVersion}/${libraryLocation}/${s.id}`;return `<section class="library-section" id="${s.id}"><h2>${esc(s.title)}</h2><p class="small">${esc(s.intro)}</p>${s.note?`<p class="branch-note">${esc(s.note)}</p>`:''}${librarySectionFieldsHTML(s)}<label class="notes-label" for="note-${s.id}">Your review notes: ${esc(s.title)}</label><textarea class="textarea review-note" id="note-${s.id}" data-note="${key}" maxlength="4000" placeholder="Suggested wording, a missing option, or a question for the team">${esc(reviewNotes.get(key)||'')}</textarea></section>`;}).join('')}<section class="library-section" id="under-seven"><h2>Children aged 7 or younger</h2><p>A parent or guardian sees one response box per child prompt, followed by Your observations. Confirm willingness before recording the child’s own views; leave those questions blank when the child cannot or does not want to answer. The observations field remains available and records the adult’s perspective separately.</p><ol>${YOUNG_PROMPTS.map(text=>`<li>${esc(text)}</li>`).join('')}</ol><p>Each prompt has an optional written-response box. A separate optional box records parent/guardian observations. A parent or guardian can leave the child questions blank and enter only their observations, without a claim of child assent.</p><p>The 8–17 route shares one question set; an age follow-up changes only the participation steps. See the <a href="review.html#children">participation guide</a>.</p></section><div class="notes-actions"><button class="button primary" id="download-notes-bottom">Download review notes</button><a class="button secondary" href="index.html">Try the survey</a></div>`;
  main.querySelector('#review-version').onchange=e=>{libraryVersion=e.target.value;renderQuestionLibrary();};
  main.querySelector('#review-location').onchange=e=>{libraryLocation=e.target.value;renderQuestionLibrary();};
  main.querySelector('#print-questions').onclick=()=>window.print();
  main.querySelectorAll('[data-note]').forEach(input=>input.addEventListener('input',()=>{if(input.value.trim())reviewNotes.set(input.dataset.note,input.value);else reviewNotes.delete(input.dataset.note);main.querySelector('.notes-status').textContent=reviewNotes.size?`Notes in ${reviewNotes.size} section${reviewNotes.size===1?'':'s'}`:'No notes yet';}));
  const download=()=>{const entries=[...reviewNotes].map(([key,value])=>`## ${key}\n\n${value}`).join('\n\n');downloadText('nt-survey-review-notes.md',`# NT questionnaire review notes\n\nQuestionnaire: 25 September 2026\nSaved: ${new Date().toISOString()}\n\n${entries||'No notes entered.'}\n`);};
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
