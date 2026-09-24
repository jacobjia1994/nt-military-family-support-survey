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
    { id: "friends_belonging", label: "Friends or feeling that I belong" },
    { id: "school_learning", label: "School, study or training" },
    { id: "moving_change", label: "Moving or settling into a new place" },
    { id: "family_time_apart", label: "Family life or time apart" },
    { id: "feelings_wellbeing", label: "My feelings or worries" },
    { id: "activities_transport", label: "Things to do or getting around" },
    { id: "health_access", label: "My health or disability support" },
    { id: "finding_help", label: "Finding help or someone I can talk to" }
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
// Child options use simpler language and refer to the child's chosen priority.
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
const SPECIAL_NEEDS = ['none','unsure','prefer'];
const NO_PRIORITY = ['none','unsure','prefer'];
function toggleChoice(current, value, exclusive = []) {
  const values = Array.isArray(current) ? current : [];
  if (values.includes(value)) return values.filter(v => v !== value);
  if (exclusive.includes(value)) return [value];
  return [...values.filter(v => !exclusive.includes(v)), value];
}
function selectedNeeds(answers, domains) {
  return (answers.needs || []).filter(id => domains.some(d => d.id === id));
}
function selectedPriorities(answers) {
  return (Array.isArray(answers.priority)?answers.priority:[]).filter(id=>!NO_PRIORITY.includes(id));
}
function hasPriority(answers) { return selectedPriorities(answers).length>0; }
function hasSoughtHelp(answers) {
  return (answers.help || []).some(v => !['not_sought','unsure','prefer'].includes(v));
}
function consultationRoute(answers) {
  return answers.serving_nt==='earlier'?'earlier_experience':answers.serving_nt==='recent'?'recent_nt':answers.serving_nt==='yes'?'current_nt':'uncertain_nt';
}
function reconcileAnswers(answers, changed, domains, previous) {
  if(changed==='needs') {
    const ids=selectedNeeds(answers,domains);
    if(!ids.includes('other_need'))delete answers.needs_other;
    answers.adequacy=Object.fromEntries(Object.entries(answers.adequacy||{}).filter(([id])=>ids.includes(id)));
  }
  if(changed==='priority') {
    const ids=selectedPriorities(answers);
    answers.follow_up=Object.fromEntries(Object.entries(answers.follow_up||{}).filter(([id])=>ids.includes(id)));
    if(!ids.includes('another'))delete answers.another_priority;
    if(!ids.length){delete answers.delivery;delete answers.times;}
  }
  if(changed==='another_priority'&&answers.follow_up)delete answers.follow_up.another;
  if(changed==='needs_other'&&answers.adequacy)delete answers.adequacy.other_need;
  if(changed.startsWith('follow_up:')) {
    const [,id,key]=changed.split(':');
    if(key==='help'&&answers.follow_up?.[id])delete answers.follow_up[id].barriers;
  }
  if(changed==='serving_nt'&&previous!==answers.serving_nt) {
    for(const key of ['strengths','needs','needs_other','adequacy','priority','another_priority','follow_up','delivery','times','anything','earlier_experience'])delete answers[key];
  }
  if(changed==='delivery'&&!(answers.delivery||[]).some(v=>['one_to_one','group','phone','video'].includes(v)))delete answers.times;
}
function buildSteps(answers,domains,version) {
  if(consultationRoute(answers)==='earlier_experience')return [{id:'connection',phase:0},{id:'earlier',phase:4},{id:'review',phase:4}];
  const steps=[{id:'connection',phase:0},{id:'place',phase:0},{id:'strengths',phase:1},{id:'needs',phase:1}];
  const needs=selectedNeeds(answers,domains);
  for(let i=0;i<needs.length;i+=2)steps.push({id:'adequacy-'+i/2,phase:2,domains:needs.slice(i,i+2)});
  steps.push({id:'priority',phase:3});
  for(const need of selectedPriorities(answers))steps.push({id:'detail:'+need,phase:3,need});
  if(hasPriority(answers)&&version!=='child')steps.push({id:'delivery',phase:3});
  steps.push({id:'anything',phase:4},{id:'review',phase:4});return steps;
}
function cleanExport(answers,version,domains) {
  const copy=structuredClone(answers),route=consultationRoute(copy);
  for(const key of ['caring','financial_dependence','care_dependence','impact','help','barriers','change'])delete copy[key];
  if(route==='earlier_experience') {
    for(const key of Object.keys(copy))if(!['roles','serving_nt','force','earlier_experience'].includes(key))delete copy[key];
  } else {
    delete copy.earlier_experience;
    const ids=selectedNeeds(copy,domains);
    copy.adequacy=Object.fromEntries(ids.map(id=>[id,copy.adequacy?.[id]??null]));
    copy.follow_up=Object.fromEntries(selectedPriorities(copy).map(id=>{
      const block=structuredClone(copy.follow_up?.[id]||{});
      if(!hasSoughtHelp(block)&&!block.help?.includes('not_sought'))delete block.barriers;
      return [id,block];
    }));
    if(!hasPriority(copy))for(const key of ['delivery','times','another_priority'])delete copy[key];
  }
  return {schema_version:'3.0',questionnaire_revision:'2026-09-25-difficulty-inventory',consultation_route:route,recall_months:route==='earlier_experience'?null:version==='child'?3:12,follow_up_scope:'one_block_per_selected_need',collection_mode:'internal_review_no_transmission',questionnaire_version:version,storage:'downloaded_by_respondent; not submitted',answers:copy};
}

const main = document.querySelector('#main');
const phases = ['About you','Everyday life','Your support','Support now','Finishing up'];
const state = { version:'adult', age:null, answers:{}, step:'connection', screen:'welcome', returnToReview:false, participation:null, guardianPermission:null };
const SURVEY_INVITATION = {"title": "Defence family support survey", "greeting": "Hello, NT Defence Communities!", "paragraphs": ["Lutheran Care would like your help to plan its Defence Family Support Program in the Northern Territory.", "Tell us about the support you have needed, what you received and what would help now.", "Please answer about your own experience."], "funding": "The program is funded by the Australian Government Department of Defence through its Family Support Funding Program."};
const PARTICIPANT_NOTICE_VERSION = '2026-09-25-v9';
// Formal participant wording for the internally reviewed consultation design.
// The current build has no receiver; its technical status belongs in review.html.
const PARTICIPANT_INFORMATION = [
  ['Your choice', 'Taking part is voluntary. Most questions are optional.'],
  ['Privacy', 'We do not ask for your name or contact details. Please leave out anything that could identify you or someone else, such as names, addresses or service numbers.'],
  ['Use and storage', 'Lutheran Care will use your answers to plan its NT Defence Family Support Program. We will store them securely and limit access to authorised staff working on this project. Our Privacy Policy explains how we keep and manage records.'],
  ['Sharing', 'We will share project information with Defence after removing details that could reasonably identify anyone. We may need to disclose information to meet legal duties or protect someone from serious harm.'],
  ['Withdrawal', 'You can leave the survey before submitting. Once submitted, answers cannot be changed or withdrawn.'],
  ['Questions or complaints', 'Contact <a href="mailto:feedback@lutherancare.org.au">feedback@lutherancare.org.au</a>. Our <a href="https://www.lutherancare.org.au/privacy-policy/" target="_blank" rel="noopener">Privacy Policy</a> explains your rights, including access, correction and complaints.'],
  ['If you need support', 'This survey does not arrange services or follow-up contact. In an emergency in Australia, call 000. For domestic, family or sexual violence support, contact <a href="https://www.1800respect.org.au/" target="_blank" rel="noopener">1800RESPECT</a> on 1800 737 732.']
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
const domainList = () => [...DOMAINS[state.version],{id:'other_need',label:'Something else'}];
const domainLabel = id => id==='other_need' ? (state.answers.needs_other || 'Something else') : domainList().find(d=>d.id===id)?.label || id;
const isAdult = () => state.version==='adult';
const isChild = () => state.version==='child';
const outside = () => ['outside_au','outside_overseas'].includes(state.answers.region);
const period = () => isChild()?'Think about the past three months.':'Think about the past 12 months, including any moves to or from the NT.';
const priorityLabel = () => selectedPriorities(state.answers).map(id=>id==='another'?(state.answers.another_priority || 'Something else'):domainLabel(id)).join('; ');
const privacyHint = () => isChild()?'Please leave out names, addresses and school names.':'Please leave out names or other details that could identify someone.';
function getValue(key) {
  const [kind,id,fieldName]=key.split(':');
  return kind==='adequacy'?state.answers.adequacy?.[id]:kind==='follow_up'?state.answers.follow_up?.[id]?.[fieldName]:state.answers[key];
}
function setValue(key,value) {
  const [kind,id,fieldName]=key.split(':');
  if(kind==='adequacy'){state.answers.adequacy||={};state.answers.adequacy[id]=value;}
  else if(kind==='follow_up'){state.answers.follow_up||={};state.answers.follow_up[id]||={};state.answers.follow_up[id][fieldName]=value;}
  else state.answers[key]=value;
}
const maxTextLength = version => version==='child'?1500:5000;

const info = '';
const PREFER = {id:'prefer',label:'Prefer not to answer'};
const UNSURE = {id:'unsure',label:'Not sure'};
const regions = opts([['darwin','Darwin'],['palmerston','Palmerston / Litchfield'],['katherine','Katherine / Tindal'],['alice','Alice Springs'],['other_nt','Elsewhere in the NT'],['outside_au','Elsewhere in Australia'],['outside_overseas','Outside Australia'],['prefer','Prefer not to answer']]);
const adequacy = () => opts([['enough',isChild()?'I got enough help':'Enough to meet my needs'],['some',isChild()?'I got some help, but needed more':'Some, but not enough'],['none',isChild()?'I did not get any help':'None'],['unsure','Not sure'],['prefer','Prefer not to answer']]);
const roleOptions = () => isAdult() ? opts([['serving','I am a current or former serving member'],['partner','I am a partner, spouse or former partner'],['child','I am the child of a current or former serving member'],['parent','I am the parent of a current or former serving member'],['other_family','I am another family member or carer'],['none','None of these']]) : opts([['child','My parent or carer serves or has served in the military'],['other_family','Someone else in my family serves or has served in the military'],['none','Neither of these'],['unsure','Not sure']]);
const field = (key,label,type,options=[],hint=info,extra={}) => ({key,label,type,options,hint,...extra});
function detailPage(need) {
  const answers=state.answers;
  const block=answers.follow_up?.[need]||{};
  const label=need==='another'?(answers.another_priority||'Something else'):domainLabel(need);
  let components;
  try {
    state.answers={...answers,priority:[need],help:block.help};
    components=['impact','help','barriers','change'].map(id=>page({id}));
  } finally {state.answers=answers;}
  const fields=components.flatMap(p=>p.fields).map(f=>({...f,key:`follow_up:${need}:${f.key}`,need}));
  fields.find(f=>f.key.endsWith(':barriers')).conditional='need_barriers';
  return {title:label,intro:'',fields};
}
function page(step) {
  if(step.id.startsWith('detail:'))return detailPage(step.need||step.id.slice(7));
  const a=state.answers;
  const child=isChild();
  const multiple=selectedPriorities(a).length>1;
  const needPhrase=multiple?'these needs':'this need';
  switch(step.id) {
    case 'earlier': return {title:'Your experience in the NT',intro:'We’d like to hear what worked well and what could have been better.',fields:[field('earlier_experience',isChild()?'What would you like to tell us about your family’s time in the NT?':'What should Lutheran Care know about supporting Defence families in the NT?','text',[],privacyHint())]};
    case 'connection': return {title:isAdult()?'Your connection to military life':'A little about your family',intro:'',fields:[
      field('roles',isAdult()?'Which describes you?':'Which describes your family?','multi',roleOptions(),'Select all that apply.',{required:true,exclusive:['none','unsure']}),
      field('serving_nt',isAdult()?'When did you or your family member last serve in the NT?':'When did your family member last serve in the NT?','single',opts([['yes','Serving in the NT now'],['recent','Within the past 12 months, but not currently'],['earlier','More than 12 months ago'],['no','No military service in the NT'],['unsure','Not sure']]),'Select one.',{required:true}),
      field('force',isAdult()?'Which military are you or your family connected with?':'Which military is your family member part of?','single',opts([['adf','Australian Defence Force'],['other','Another country’s military'],['both','Both'],['unsure','Not sure'],['prefer','Prefer not to answer']]))
    ]};
    case 'place': return {title:child?'Where you live':'Your life at the moment',intro:'',fields:[
      field('region','Which area do you live in?','select',regions,'Optional. This helps us plan where and how to offer support. Living outside the NT does not affect whether you can take part.'),
      field('time_nt','How long have you lived in the NT?','single',opts([['never','I have not lived in the NT'],['under3','Less than 3 months'],['3to12','3 months to less than 1 year'],['1to3','1 year to less than 3 years'],['over3','3 years or more'],['unsure','Not sure'],['prefer','Prefer not to answer']]),'Count your current or most recent stay only.'),
      ...(!isAdult()?[field('assistance','How are you answering these questions?','single',opts([['self','By myself'],['reading','Someone is helping me read'],['recording','Someone is writing down my answers'],['reading_recording','Someone is helping me read and write down my answers'],['prefer','Prefer not to answer']]),'')]:[])
    ]};
    case 'strengths': return {title:child?'What is going well?':'What already helps?',intro:'',fields:[field('strengths',child?'What helps you or makes things easier?':'What has helped you manage day-to-day life?','text',[],privacyHint()) ]};
    case 'needs': return {title:child?'Where have you needed help?':'Where have you needed support?',intro:period()+' '+(child?'Help can come from people you know or people whose job is to help.':'Support can include help from family, friends, your community or a service.'),fields:[field('needs',child?'What did you need help with, even if you got enough help?':'What did you need support with, whether or not you received it?','multi',[...domainList(),{id:'none',label:child?'I did not need help with these things':'I did not need support in these areas'},UNSURE,PREFER],'Select all that apply.',{exclusive:SPECIAL_NEEDS}),field('needs_other','What else did you need help with?','short',[],privacyHint(),{conditional:'other_need'})]};
    case 'priority': return {title:'Support you would like now',intro:'',fields:[field('priority',child?'What would you like help with now?':'What would you like support with now?','multi',[...domainList().filter(d=>d.id!=='other_need').map(({id,label})=>({id,label})),{id:'another',label:'Something else'},{id:'none',label:child?'I do not need more help now':'I do not need any more support now'},UNSURE,PREFER],'Select all that apply.',{exclusive:NO_PRIORITY}),field('another_priority','What else would you like help with?','short',[],privacyHint(),{conditional:'another'})]};
    case 'impact': return {title:'Impact on everyday life',intro:'',fields:[field('impact',child?`In the past four weeks, how much ${multiple?'have these things':'has this'} made life harder for you?`:`How much ${multiple?'have these needs':'has this need'} affected your day-to-day life in the past four weeks?`,'single',opts([['not_at_all','Not at all'],['a_little','A little'],['moderately',child?'Somewhat':'Moderately'],['a_lot','A lot'],['extremely',child?'Very much':'Extremely'],['unsure','Not sure'],['prefer','Prefer not to answer']]),'If this started more recently, think about that time.')]};
    case 'help': return {title:child?'Who have you asked for help?':'Where have you looked for help?',intro:'',fields:[field('help',child?`Who have you asked for help with ${multiple?'any of these things':'this'}?`:`Where have you looked for help with ${multiple?'any of these needs':'this need'}?`,'multi',isAdult()?opts([['family','Family or friends'],['military','Military support services'],['community','A community group or service'],['health','A health professional or service'],['school','A school, college or university'],['online','Online information or support'],['other','Somewhere else'],['not_sought','I have not looked for help'],['unsure','Not sure'],['prefer','Prefer not to answer']]):opts([['family','A parent, carer or someone in my family'],['friends','A friend'],['school','Someone at school'],['community','A youth worker or community group'],['health','A doctor, counsellor or other health worker'],['online','An online or phone support service'],['other','Someone else'],['not_sought','I have not asked anyone'],['unsure','Not sure'],['prefer','Prefer not to answer']]),'Select all that apply.',{exclusive:['not_sought','unsure','prefer']})]};
    case 'barriers': {
      const sought=hasSoughtHelp(a),notSought=a.help?.includes('not_sought');
      const neutral=!sought&&!notSought;
      const experiencedChild = BARRIERS.child.map(o=>({...o,label:({'I do not know who to ask':'I did not know who to ask','It is hard to explain':'It was hard to explain','I feel worried about asking':'I felt worried about asking'})[o.label]||o.label}));
      const experiencedYouth = BARRIERS.youth.map(o=>({...o,label:({'Not knowing where to go':'I did not know where to go','Not having someone I trust to ask':'I did not have someone I trusted to ask','Worrying about who would be told':'I worried about who would be told','Feeling that people would not understand':'I felt people would not understand','Finding a suitable time':'Finding a suitable time','Not feeling ready to ask':'I did not feel ready to ask'})[o.label]||o.label}));
      const list=sought?(state.version==='youth'?experiencedYouth:child?experiencedChild:BARRIERS.adult):notSought?(isAdult()?opts([['not_needed_yet','I have been managing without outside help'],['dont_know','I do not know where to go'],['eligibility_concern','I am unsure whether I am eligible'],['cost_concern','I expect it would cost too much'],['time','I have not had the time or opportunity'],['privacy','I am concerned about privacy'],['trust','I am not sure people would understand'],['self_reliance','I prefer to manage this myself'],['language','Language or communication would be difficult'],['access','Travel or accessibility would be difficult'],['other','Another reason']]):opts([['dont_know','I do not know who to ask'],['privacy','I worry other people will find out'],['trust','I do not think people will understand'],['time','I have not had a chance'],['self_reliance','I want to try handling it myself'],['access','It is hard to get there'],['other','Something else']])):BARRIERS[state.version];
      return {title:notSought?(child?'About asking for help':'What influenced your decision?'):'What has made it hard to get help?',intro:'',fields:[field('barriers',notSought?'What are your reasons for not looking for help with this need?':neutral?`If you have tried to get help with ${needPhrase}, what made it difficult?`:`What made it harder to get help with ${needPhrase}?`,'multi',[...list.filter(o=>!['none','unsure','prefer','prefer_not_to_say'].includes(o.id)),{id:'none',label:notSought?'None of these reasons':child?'Nothing made it hard':'Nothing made it harder'},UNSURE,PREFER],'Select all that apply.',{exclusive:['none','unsure','prefer']})]};
    }
    case 'change': return {title:child?'What would make things better?':'What would make the biggest difference?',intro:'',fields:[field('change',child?`What would help you with ${multiple?'these things':'this'}?`:`What would help you most with ${needPhrase}?`,'text',[],privacyHint())]};
    case 'delivery': return {title:'Getting help from a service',intro:'These preferences are about support in general.',fields:[field('delivery','How would you prefer to receive support from Lutheran Care or another service?','multi',opts([['one_to_one','In person, one to one'],['group','In person, in a group'],['phone','By phone'],['video','By video call'],['text','By message or online chat'],['information','Information I can read in my own time'],['referral','Someone to help me find a suitable service'],['not_wanted','I would not want help from a service'],['unsure','Not sure'],['no_preference','No particular preference'],['other','Another way'],['prefer','Prefer not to answer']]),'Select all that apply.',{exclusive:['not_wanted','unsure','no_preference','prefer']}),field('times','When would a call, meeting or activity suit you?','multi',opts([['weekday_day','Weekday daytime'],['weekday_evening','Weekday evenings'],['weekend','Weekends'],['variable','It changes from week to week'],['no_preference','No particular preference'],['prefer','Prefer not to answer']]),'Select all that apply. Use your local time.',{exclusive:['no_preference','prefer'],conditional:'live'})]};
    case 'anything': return {title:child?'One last thing':'Is there anything we have missed?',intro:'',fields:[field('anything',child?'What is one thing you wish adults understood about your life?':'Is there anything important you would like to add?','text',[],privacyHint())]};
    default: if(step.id.startsWith('adequacy-')) return {title:child?'Did you get enough help?':'Was the support enough?',intro:period(),fields:step.domains.map(id=>field('adequacy:'+id,domainLabel(id),'single',adequacy(),child?'How much help did you get with this?':'How much of the support you needed did you receive?'))};
    return {title:'Check your answers',intro:'',fields:[]};
  }
}
function optionHTML(o,f,value) {
  const checked = f.type==='multi' ? (value||[]).includes(o.id) : value===o.id;
  return `<label class="choice"><input type="${f.type==='multi'?'checkbox':'radio'}" name="${esc(f.key)}" value="${esc(o.id)}" ${checked?'checked':''}><span class="choice-body"><span class="choice-label">${esc(o.label)}</span>${o.hint?`<span class="choice-hint">${esc(o.hint)}</span>`:''}</span></label>`;
}
function conditionalVisible(f) { if(f.conditional==='need_barriers'){const block=state.answers.follow_up?.[f.need]||{};return hasSoughtHelp(block)||Boolean(block.help?.includes('not_sought'));} return f.conditional==='nt'?locationFrame(state.answers.region)==='nt':f.conditional==='other_need'?state.answers.needs?.includes('other_need'):f.conditional==='another'?selectedPriorities(state.answers).includes('another'):f.conditional==='live'?(state.answers.delivery||[]).some(v=>['one_to_one','group','phone','video'].includes(v)):true; }
function fieldHTML(f) {
  const v=getValue(f.key),hint=f.hint?`<span class="field-hint" id="hint-${esc(f.key)}">${esc(f.hint)}</span>`:'';
  const hidden=conditionalVisible(f)?'':'hidden';
  const describedBy=f.hint?`aria-describedby="hint-${esc(f.key)}"`:'';
  if(['single','multi'].includes(f.type)) return `<fieldset class="question-group" data-field="${esc(f.key)}" ${hidden}><legend>${esc(f.label)}${f.required?'<span class="required-label">(required)</span>':''}${hint}</legend><div class="choices ${f.key==='needs'&&!isChild()?'columns':''} ${f.options.length>6?'compact':''}">${f.options.map(o=>optionHTML(o,f,v)).join('')}</div></fieldset>`;
  let input='';
  if(f.type==='select') input=`<select class="select" id="${esc(f.key)}" name="${esc(f.key)}" ${describedBy}><option value="">Choose an option</option>${f.options.map(o=>`<option value="${esc(o.id)}" ${v===o.id?'selected':''}>${esc(o.label)}</option>`).join('')}</select>`;
  else if(f.type==='short') input=`<input class="text-input" id="${esc(f.key)}" name="${esc(f.key)}" maxlength="160" value="${esc(v||'')}" autocomplete="off" ${describedBy}>`;
  else input=`<textarea class="textarea" id="${esc(f.key)}" name="${esc(f.key)}" maxlength="${maxTextLength(state.version)}" ${describedBy}>${esc(v||'')}</textarea><div class="char-count" data-counter="${esc(f.key)}" ${(v||'').length<maxTextLength(state.version)*.8?'hidden':''}>${maxTextLength(state.version)-(v||'').length} characters remaining</div>`;
  return `<div class="question-group" data-field="${esc(f.key)}" ${hidden}><label class="field-label" for="${esc(f.key)}">${esc(f.label)}${f.required?'<span class="required-label">(required)</span>':''}${hint}</label>${input}</div>`;
}
function focusHeading(){main.querySelector('h1')?.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
function renderWelcome(){
  state.screen='welcome';
  main.innerHTML=`<div class="welcome"><section class="welcome-intro"><h1 tabindex="-1">${esc(SURVEY_INVITATION.title)}</h1><p class="greeting">${esc(SURVEY_INVITATION.greeting)}</p>${SURVEY_INVITATION.paragraphs.map((text,i)=>`<p class="${i===0?'lead':''}">${esc(text)}</p>`).join('')}<p class="funding-note">${esc(SURVEY_INVITATION.funding)}</p></section>${participantInformationHTML()}<div class="welcome-start"><button class="button primary" id="start-questionnaire">Start questionnaire <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></button></div></div>`;
  main.querySelector('#start-questionnaire').onclick=()=>{renderAge();focusHeading();};
}
function renderAge(){
  state.screen='age';
  main.innerHTML=`<div class="survey-layout"><section class="age-step"><h1 tabindex="-1">Which age group are you in?</h1><p class="question-intro">We’ll use this to show you the right questions.</p><form id="welcome-form"><fieldset class="question-group"><legend class="visually-hidden">Your age group</legend><div class="age-grid">${opts([['adult','18 or older',''],['youth_older','15–17',''],['youth_younger','12–14',''],['child','7–11',''],['young','Under 7','Conversation guide']]).map(o=>optionHTML(o,{key:'age',type:'single'},state.age)).join('')}</div></fieldset><div class="error" id="welcome-error" role="alert"></div><div class="question-actions"><button class="back-button" type="button" id="age-back">Back</button><button class="button primary" type="submit">Continue</button></div></form></section></div>`;
  main.querySelector('#welcome-form [type="submit"]').disabled=!state.age;
  main.querySelector('#welcome-form').onchange=()=>{main.querySelector('#welcome-form [type="submit"]').disabled=!main.querySelector('input[name=age]:checked');};
  main.querySelector('#age-back').onclick=()=>{renderWelcome();focusHeading();};
  main.querySelector('#welcome-form').addEventListener('submit',e=>{e.preventDefault();const age=main.querySelector('input[name="age"]:checked')?.value;if(!age){main.querySelector('#welcome-error').textContent='Choose an age group to continue.';main.querySelector('input[name=age]')?.focus();return;}if(age!==state.age){state.answers={};state.participation=null;state.guardianPermission=null;state.step='connection';state.returnToReview=false;}state.age=age;state.version=questionnaireVersion(age);if(needsGuardianPermission(age))renderGuardianPermission();else{renderParticipation();focusHeading();}});
}
function renderParticipationHelp(){
  state.participation=null;
  state.screen='participation-help';
  main.innerHTML=`<section class="survey-layout"><h1 tabindex="-1">Getting help to take part</h1><p>A Lutheran Care worker can explain the questionnaire and help you take part.</p><p>If asking a parent or guardian would be unsafe or difficult, you can speak with a Lutheran Care worker privately first.</p><p>Ask the worker who invited you, or call Lutheran Care on <a href="tel:+61882699333">(08) 8269 9333</a> and ask for the NT Defence Family Support Program.</p><p>In Australia, you can also call <a href="https://kidshelpline.com.au/" target="_blank" rel="noopener">Kids Helpline</a> on 1800 55 1800 about a worry. In an emergency, call 000. Outside Australia, use your local emergency number.</p><div class="question-actions"><button class="back-button" id="help-back">Back</button><button class="button secondary" id="help-stop">Leave questionnaire</button></div></section>`;
  main.querySelector('#help-back').onclick=()=>needsGuardianPermission(state.age)?renderGuardianPermission():renderParticipation();
  main.querySelector('#help-stop').onclick=renderParticipationDeclined;
  focusHeading();
}
function renderParticipationDeclined(){
  state.answers={};state.participation=null;state.guardianPermission=null;
  state.screen='declined';
  main.innerHTML=`<section class="finish"><h1 tabindex="-1">You’ve left the survey</h1><button class="button secondary" id="declined-back">Return to the start</button></section>`;
  main.querySelector('#declined-back').onclick=()=>{state.age=null;renderWelcome();focusHeading();};
  focusHeading();
}
function renderGuardianPermission(){
  state.screen='guardian-permission';
  const young=state.age==='young';
  main.innerHTML=`<section class="survey-layout"><h1 tabindex="-1">For a parent or guardian</h1><div class="participation-explanation"><p>Please read the participant information before giving permission. These questions ask about your child’s own experience to help Lutheran Care plan support for Defence families.</p><p>Your child can leave questions blank, say no or stop. They do not need to describe upsetting events or identify anyone.</p><p>Lutheran Care may need to share information where the law requires it or to protect someone from serious harm. This can include concerns about a child’s safety.</p></div><button class="text-button" type="button" id="guardian-information">Read the participant information</button><form id="guardian-form"><label class="choice consent-choice"><input type="checkbox" name="guardian-permission" ${state.guardianPermission?.agreed?'checked':''}><span class="choice-label">I am this child’s parent or guardian and have authority to give permission for them to take part. I have read the participant information and agree to Lutheran Care collecting, using and sharing their answers as described, including any health or disability information they choose to share.</span></label><p class="small">${young?'Your child’s willingness to join in matters. Follow their lead and stop if they do not want to continue.':'Your child will make their own choice on the next screen. Please let them answer in their own words.'}</p><p class="error" id="guardian-error" role="alert"></p><div class="question-actions"><button class="back-button" id="guardian-back" type="button">Back</button><button class="button primary" type="submit">Continue</button></div></form><div class="finish-actions"><button class="text-button" id="guardian-help" type="button">Speak with Lutheran Care first</button><button class="text-button" id="guardian-no" type="button">I do not give permission</button></div></section>`;
  main.querySelector('#guardian-form [type="submit"]').disabled=!state.guardianPermission?.agreed;
  main.querySelector('#guardian-information').onclick=()=>document.querySelector('#privacy-dialog').showModal();
  main.querySelector('#guardian-back').onclick=()=>{renderAge();focusHeading();};
  main.querySelector('#guardian-help').onclick=renderParticipationHelp;
  main.querySelector('#guardian-no').onclick=renderParticipationDeclined;
  main.querySelector('[name="guardian-permission"]').onchange=e=>{state.guardianPermission=guardianPermissionRecord(state.age,e.target.checked);main.querySelector('#guardian-form [type="submit"]').disabled=!e.target.checked;state.participation=null;if(!e.target.checked){state.answers={};state.step='connection';}};
  main.querySelector('#guardian-form').onsubmit=e=>{e.preventDefault();state.guardianPermission=guardianPermissionRecord(state.age,main.querySelector('[name="guardian-permission"]').checked);if(!state.guardianPermission){main.querySelector('#guardian-error').textContent='Please give permission to continue, or choose another option below.';return;}if(young)renderYoung();else renderParticipation();focusHeading();};
  focusHeading();
}
function renderParticipation(){
  if(needsGuardianPermission(state.age)&&(!state.guardianPermission?.agreed||state.guardianPermission.age_path!==state.age)){renderGuardianPermission();return;}
  state.screen='participation';
  const adult=isAdult(),child=isChild();
  const title=adult?'Before you begin':'Would you like to take part?';
  const explanation=adult
    ? '<p>Please read the participant information before deciding whether to take part.</p>'
    : child ? '<p>Lutheran Care wants to know what helps you and what could be better. Your answers will help us plan support and activities for families.</p><p>You can skip questions or stop. You can say no even if your parent or guardian has said yes. Someone can help you read, but they should not choose your answers.</p><p>Our team will read your answers. We will tell Defence what we find out, without details that could show who you are. If someone is being hurt, we may need to tell someone who can help keep them safe.</p><p>Please leave out names and school names. You do not need to tell us what happened. Ask us if anything is unclear.</p>'
    : '<p>Lutheran Care wants to hear what life is like for you, so we can plan support for families. You can skip most questions, stop or choose not to take part.</p><p>Our project team will read your answers. We will share project information with Defence without details that could reasonably identify you. If you tell us someone is being hurt, we may need to tell someone who can help keep them safe.</p><p>You can say no even if your parent or guardian has said yes. Someone can help you read, but they should not choose your answers.</p><p>Please leave out names, school names and details that could identify anyone. You can ask a Lutheran Care worker to explain anything you do not understand.</p>';
  const statement=needsGuardianPermission(state.age)
    ? 'I understand what these questions are for and I want to take part.'
    : adult?'I have read the participant information and agree to take part. I consent to Lutheran Care collecting, using and sharing my answers as described, including any health or disability information I choose to share.'
    : 'I understand why Lutheran Care is asking these questions, how my answers will be used and when information may be shared. I agree to take part, including sharing any health or disability information I choose to give.';
  main.innerHTML=`<div class="survey-layout"><h1 tabindex="-1">${title}</h1><div class="participation-explanation">${explanation}</div><button class="text-button" type="button" id="read-information">Read the participant information</button><form id="participation-form"><label class="choice consent-choice"><input type="checkbox" name="participation" ${state.participation?.agreed?'checked':''}><span class="choice-label">${statement}</span></label><p class="error" id="participation-error" role="alert"></p><div class="question-actions"><button class="back-button" id="participation-back" type="button">Back</button><button class="button primary" type="submit">Continue</button></div></form><div class="finish-actions">${!adult?'<button class="text-button" id="participation-help" type="button">I would like someone to explain this</button>':''}<button class="text-button" id="participation-no" type="button">${child?'I do not want to do this':'I do not want to take part'}</button></div></div>`;
  main.querySelector('#participation-form [type="submit"]').disabled=!state.participation?.agreed;
  main.querySelector('#read-information').onclick=()=>document.querySelector('#privacy-dialog').showModal();
  main.querySelector('#participation-back').onclick=()=>{if(needsGuardianPermission(state.age))renderGuardianPermission();else renderAge();focusHeading();};
  main.querySelector('#participation-help')?.addEventListener('click',renderParticipationHelp);
  main.querySelector('#participation-no').onclick=renderParticipationDeclined;
  main.querySelector('[name="participation"]').onchange=e=>{state.participation=participationRecord(state.age,e.target.checked,state.guardianPermission);main.querySelector('#participation-form [type="submit"]').disabled=!hasValidParticipation();};
  main.querySelector('#participation-form').onsubmit=e=>{e.preventDefault();state.participation=participationRecord(state.age,main.querySelector('[name="participation"]').checked,state.guardianPermission);if(!hasValidParticipation()){main.querySelector('#participation-error').textContent='You can agree to take part, ask for help or choose not to continue.';main.querySelector('[name="participation"]').focus();return;}renderSurvey();focusHeading();};
}

const YOUNG_PROMPTS = ['What do you like about being here?', 'Is there anything that feels hard?', 'Who helps you when you need help?', 'What would make things a little easier?'];
function renderYoung(){if(!state.guardianPermission?.agreed||state.guardianPermission.age_path!=='young'){renderGuardianPermission();return;}state.screen='young';main.innerHTML=`<section class="finish"><h1 tabindex="-1">Talking with younger children</h1><p class="lead">A Lutheran Care worker can help young children share their views through talking, drawing or pointing to pictures. Explain what will happen, ask whether they want to join in and follow their lead.</p><div class="card"><h2>Questions to try</h2>${YOUNG_PROMPTS.map(text=>`<p>${esc(text)}</p>`).join('')}<p class="small">Follow the child’s lead, accept “I don’t know”, and stop when they want to. Record their own words separately from an adult’s interpretation.</p></div><div class="finish-actions"><button class="button secondary" id="return-welcome">Back to age choices</button></div></section>`;main.querySelector('#return-welcome').onclick=()=>{renderAge();focusHeading();};focusHeading();}
function renderScope(){state.screen='scope';main.innerHTML=`<section class="finish"><h1 tabindex="-1">Thank you for your interest</h1><p class="lead">This consultation focuses on experiences of military service in the Northern Territory.</p><div class="finish-actions"><button class="button primary" id="scope-back">Review my answer</button><button class="button secondary" id="scope-exit">Return to the start</button></div></section>`;main.querySelector('#scope-back').onclick=()=>{state.screen='survey';state.step='connection';renderSurvey();};main.querySelector('#scope-exit').onclick=()=>{state.answers={};renderWelcome();};focusHeading();}
function activeSteps(){return buildSteps(state.answers,domainList(),state.version);}
function reviewHTML(){return activeSteps().filter(s=>s.id!=='review').map(s=>{
  const p=page(s);
  const rows=p.fields.filter(conditionalVisible).map(f=>{
    const v=getValue(f.key);let text;
    if(v===undefined||v===null||v===''||Array.isArray(v)&&!v.length)text='Not answered';
    else if(f.type==='text'||f.type==='short')text=v;
    else text=(Array.isArray(v)?v:[v]).map(id=>f.options.find(o=>o.id===id)?.label||id).join('; ');
    return `<div class="review-block"><div class="review-header"><h3>${esc(f.label)}</h3><button class="text-button" type="button" data-edit="${esc(s.id)}" aria-label="Change: ${esc(s.need?p.title+': ':'')}${esc(f.label)}">Change</button></div><p class="review-value">${esc(text)}</p></div>`;
  }).join('');
  return `<section class="review-section">${s.need?`<h2>${esc(p.title)}</h2>`:''}${rows}</section>`;
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
  try {const u=new URL(String(config.url||''));if(u.protocol==='https:'&&!u.username&&!u.password)url=u.href;} catch {}
  return {title:String(config.title||'A free resource for Defence families'),url};
}
function thankYouResourceHTML(config=globalThis.SURVEY_THANK_YOU_RESOURCE||{}) {
  const resource=thankYouResource(config);
  return `<section class="thank-you-resource" aria-labelledby="resource-title"><h2 id="resource-title">${esc(resource.title)}</h2>${resource.url?`<a class="button primary" href="${esc(resource.url)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">Get your free resource</a>`:'<button class="button secondary" disabled>Get your free resource</button><p class="small">Available soon</p>'}</section>`;
}
function renderSurvey(){
  if(!hasValidParticipation()){renderParticipation();return;}
  state.screen='survey';
  const steps=activeSteps();let index=steps.findIndex(s=>s.id===state.step);if(index<0){state.step='priority';index=steps.findIndex(s=>s.id===state.step);}const s=steps[index],review=s.id==='review';let p=page(s);
  const early=consultationRoute(state.answers)==='earlier_experience';
  const displayPhases=early?['About you','Your experience','Review']:phases,phaseIndex=early?index:s.phase;
  main.innerHTML=`<div class="survey-layout"><section class="survey-main"><div class="step-topline"><strong>${esc(displayPhases[phaseIndex])}</strong><span>Section ${phaseIndex+1} of ${displayPhases.length}</span></div><div class="section-track" aria-hidden="true">${displayPhases.map((_,i)=>`<span class="${i<=phaseIndex?'visited':''}"></span>`).join('')}</div><form class="question-card" id="survey-form" novalidate><h1 tabindex="-1">${esc(p.title)}</h1>${p.intro?`<p class="question-intro">${esc(p.intro)}</p>`:''}${s.need?`<p class="need-progress">Need ${selectedPriorities(state.answers).indexOf(s.need)+1} of ${selectedPriorities(state.answers).length}</p>`:''}${review?reviewHTML():p.fields.map(fieldHTML).join('')}<div class="error" id="form-error" role="alert"></div><div class="question-actions"><button class="back-button" type="button" id="back">Back</button><div class="action-right"><button class="button primary" type="submit">${review?'Finish':'Continue'}</button></div></div></form><button class="text-button" id="survey-help" type="button">Help or stop</button></section></div>`;
  main.querySelector('#survey-help').onclick=renderSurveyHelp;
  const form=main.querySelector('#survey-form');
  const refreshContinue=()=>{form.querySelector('[type="submit"]').disabled=!requiredAnswersComplete(p.fields.filter(conditionalVisible),state.answers);};
  refreshContinue();
  form.addEventListener('change',e=>{
    const input=e.target;if(!input.name)return;const f=p.fields.find(f=>f.key===input.name);if(!f)return;
    const old=getValue(f.key);let value=input.value;if(f.type==='multi')value=toggleChoice(old,input.value,f.exclusive||[]);
    setValue(f.key,value);if(JSON.stringify(old)!==JSON.stringify(value))reconcileAnswers(state.answers,f.key,domainList(),old);
    if(f.key.startsWith('follow_up:')&&f.key.endsWith(':help')) {
      p=page(s);
      const barrier=p.fields.find(item=>item.key.endsWith(':barriers'));
      const wrap=form.querySelector(`[data-field="${barrier.key}"]`);
      if(wrap)wrap.outerHTML=fieldHTML(barrier);
    }
    for(const field of p.fields){
      const wrap=form.querySelector(`[data-field="${field.key}"]`);if(!wrap)continue;wrap.hidden=!conditionalVisible(field);
      const saved=getValue(field.key);
      wrap.querySelectorAll('input,textarea,select').forEach(el=>{if(['checkbox','radio'].includes(el.type))el.checked=Array.isArray(saved)?saved.includes(el.value):saved===el.value;else el.value=saved??'';});
    }
    refreshContinue();
  });
  form.addEventListener('input',e=>{const input=e.target;if(input.matches('textarea,input[type="text"],input.text-input')){const old=getValue(input.name);setValue(input.name,input.value);if(old!==input.value)reconcileAnswers(state.answers,input.name,domainList(),old);const counter=form.querySelector(`[data-counter="${input.name}"]`);if(counter){counter.textContent=`${input.maxLength-input.value.length} characters remaining`;counter.hidden=input.value.length<input.maxLength*.8;}refreshContinue();}});
  form.addEventListener('submit',e=>{e.preventDefault();const missing=p.fields.filter(conditionalVisible).find(f=>f.required&&(!getValue(f.key)||Array.isArray(getValue(f.key))&&!getValue(f.key).length));if(missing){const err=form.querySelector('#form-error');err.textContent='Please answer: '+missing.label;form.querySelector(`[name="${missing.key}"]`)?.focus();return;}if(s.id==='connection'&&isOutsideSurveyScope(state.answers)){renderScope();return;}if(review){renderFinish();return;}if(state.returnToReview){state.returnToReview=false;state.step='review';renderSurvey();focusHeading();return;}goNext(s.id);});
  main.querySelector('#back').onclick=()=>{state.returnToReview=false;const current=activeSteps();const i=current.findIndex(x=>x.id===s.id);if(i<=0){renderParticipation();focusHeading();return;}state.step=current[i-1].id;renderSurvey();focusHeading();};

  main.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>{state.returnToReview=true;state.step=b.dataset.edit;renderSurvey();focusHeading();});
}
function goNext(id){const steps=activeSteps(),index=steps.findIndex(s=>s.id===id);state.step=steps[index+1]?.id||'review';renderSurvey();focusHeading();}
function renderFinish(){state.screen='finish';main.innerHTML=`<section class="finish"><h1 tabindex="-1">Thank you for your time</h1>${thankYouResourceHTML()}<div class="finish-actions"><button class="button secondary" id="download-answers">Save my answers</button><button class="button secondary" id="review-answers">Review my answers</button></div><button class="text-button" id="restart">Clear answers and start again</button></section>`;main.querySelector('#download-answers').onclick=()=>{const data=cleanExport(state.answers,state.version,domainList());data.participation=state.participation;const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='my-nt-support-answers.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};main.querySelector('#review-answers').onclick=()=>{state.step='review';renderSurvey();focusHeading();};main.querySelector('#restart').onclick=()=>{state.answers={};state.participation=null;state.guardianPermission=null;state.age=null;state.step='connection';renderWelcome();};focusHeading();}
const reviewNotes = new Map();
let libraryVersion = 'adult';
let libraryLocation = 'nt';

// Read the exact live question definitions in a temporary preview context.
// No synthetic answers from this library enter the respondent flow or results.
function questionLibrarySections(version,location) {
  const original={version:state.version,answers:state.answers};
  const first=DOMAINS[version][0].id;
  state.version=version;state.answers={roles:['child'],serving_nt:'yes',region:location==='nt'?'darwin':location==='outside'?'outside_au':'prefer',priority:[first],follow_up:{[first]:{help:['family']}}};
  try {
    const sections=[],add=(id,note='')=>sections.push({id,...page({id}),note});
    add('connection','Current or recent NT service leads to the full questionnaire; earlier service leads to the short earlier-experience route. Location never determines eligibility.');
    add('place');add('strengths');add('needs');
    sections.push({id:'adequacy',...page({id:'adequacy-all',domains:domainList().map(d=>d.id)}),note:'Only selected past needs are rated, two per page.'});
    add('priority','Each current need selected has its own follow-up page. None, unsure, declined or blank does not create a follow-up.');
    const detail=detailPage(first),barriers=detail.fields.find(f=>f.key.endsWith(':barriers'));
    const variants=[];
    for(const [id,title,help] of [['sought','After looking for help',['family']],['not-sought','When no help has been sought',['not_sought']]]) {
      state.answers.follow_up[first]={help};
      variants.push({id,title,label:title,intro:'',fields:[detailPage(first).fields.find(f=>f.key.endsWith(':barriers'))]});
    }
    sections.push({id:'detail',...detail,title:'About each support need',fields:detail.fields.filter(f=>!f.key.endsWith(':barriers')),variants,note:'Repeat this page separately for each selected current need. The examples below name one need; actual answers are stored against that need only. Barriers appear after a substantive help-seeking answer; they remain absent if help-seeking is skipped, uncertain or declined.'});
    if(version!=='child')add('delivery','One general preference page after all per-need pages.');
    add('anything');add('earlier','Separate route for NT service ending more than 12 months ago; no recent-needs questions.');
    return sections;
  } finally {state.version=original.version;state.answers=original.answers;}
}

function libraryFieldHTML(f) {
  const conditional = {nt:'Shown to people living in the NT.',other_need:'Shown after “Something else” is selected.',another:'Shown after “Something else” is selected.',live:'Shown after an in-person, group, phone or video option is selected.'}[f.conditional];
  const type = {single:'Choose one',multi:'Select all that apply',select:'Choose one area',text:'Written answer',short:'Short written answer'}[f.type];
  return `<div class="library-question"><p class="question-meta">${type} · ${f.required?'Needed to continue':'Optional'}</p><h3>${esc(f.label)}</h3>${f.hint?`<p class="field-hint">${esc(f.hint)}</p>`:''}${conditional?`<p class="branch-note">${conditional}</p>`:''}${f.options.length?`<ul class="option-list">${f.options.map(o=>`<li>${esc(o.label)}${o.hint?` <small>— ${esc(o.hint)}</small>`:''}</li>`).join('')}</ul>`:`<p class="small">${f.type==='short'?'Up to 160 characters.':`Up to ${maxTextLength(libraryVersion)} characters.`}</p>`}</div>`;
}

function downloadText(filename, text, type='text/plain;charset=utf-8') {
  const url=URL.createObjectURL(new Blob([text],{type}));
  const link=document.createElement('a');link.href=url;link.download=filename;link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

function renderQuestionLibrary() {
  const sections=questionLibrarySections(libraryVersion,libraryLocation);
  const versionLabel={adult:'Adults · 18 or older',youth:'Young people · 12–17',child:'Children · 7–11'}[libraryVersion];
  main.innerHTML=`<h1>All questions</h1><p class="lead">Read the wording, options and different paths in one place.</p><p class="small">This list uses the same questions as the survey. Follow-up examples name the first support area; a respondent sees their own choice. Notes are for your own review: they are not sent anywhere. Download them before closing or refreshing this page.</p><div class="library-tools"><label>Age version<select class="select" id="review-version"><option value="adult" ${libraryVersion==='adult'?'selected':''}>Adults · 18 or older</option><option value="youth" ${libraryVersion==='youth'?'selected':''}>Young people · 12–17</option><option value="child" ${libraryVersion==='child'?'selected':''}>Children · 7–11</option></select></label><label>Location<select class="select" id="review-location"><option value="nt" ${libraryLocation==='nt'?'selected':''}>Living in the NT</option><option value="outside" ${libraryLocation==='outside'?'selected':''}>Living outside the NT</option><option value="unspecified" ${libraryLocation==='unspecified'?'selected':''}>Residence not disclosed</option></select></label><button class="button secondary" id="print-questions">Print questions</button></div><p class="small" id="version-description">${versionLabel} · ${libraryLocation==='nt'?'Living in the NT':libraryLocation==='outside'?'Living outside the NT':'Residence not disclosed'} · Draft, 24 September 2026</p><div class="notes-actions"><button class="button secondary" id="download-notes">Download review notes</button><span class="notes-status" aria-live="polite">${reviewNotes.size?`Notes in ${reviewNotes.size} section${reviewNotes.size===1?'':'s'}`:'No notes yet'}</span></div><nav class="library-index" aria-label="Question sections">${sections.map(s=>`<a href="#${s.id}">${esc(s.id==='adequacy'?'Support received':s.id==='barriers'?'Getting help':s.title)}</a>`).join('')}</nav>${sections.map(s=>{const key=`${libraryVersion}/${libraryLocation}/${s.id}`;return `<section class="library-section" id="${s.id}"><h2>${esc(s.title)}</h2><p class="small">${esc(s.intro)}</p>${s.note?`<p class="branch-note">${esc(s.note)}</p>`:''}${s.fields.map(libraryFieldHTML).join('')}${(s.variants||[]).map(v=>`<div><h3 class="branch-label">${esc(v.label)}</h3><p><strong>${esc(v.title)}</strong></p><p class="small">${esc(v.intro)}</p>${v.fields.map(libraryFieldHTML).join('')}</div>`).join('')}<label class="notes-label" for="note-${s.id}">Your review notes: ${esc(s.title)}</label><textarea class="textarea review-note" id="note-${s.id}" data-note="${key}" maxlength="4000" placeholder="Suggested wording, a missing option, or a question for the team">${esc(reviewNotes.get(key)||'')}</textarea></section>`;}).join('')}<section class="library-section" id="under-seven"><h2>Children under 7</h2><p>A conversation guide is offered instead of a questionnaire. A Lutheran Care worker can help young children share their views through talking, drawing or pointing to pictures. Explain what will happen, ask whether they want to join in and follow their lead.</p><ol>${YOUNG_PROMPTS.map(text=>`<li>${esc(text)}</li>`).join('')}</ol><p>Follow the child’s lead, accept “I don’t know”, and stop when they want to. Record their own words separately from an adult’s interpretation.</p><p>The age bands guide the wording; they do not decide consent arrangements. See the <a href="review.html#children">participation guide</a>.</p></section><div class="notes-actions"><button class="button primary" id="download-notes-bottom">Download review notes</button><a class="button secondary" href="index.html">Try the survey</a></div>`;
  main.querySelector('#review-version').onchange=e=>{libraryVersion=e.target.value;renderQuestionLibrary();};
  main.querySelector('#review-location').onchange=e=>{libraryLocation=e.target.value;renderQuestionLibrary();};
  main.querySelector('#print-questions').onclick=()=>window.print();
  main.querySelectorAll('[data-note]').forEach(input=>input.addEventListener('input',()=>{if(input.value.trim())reviewNotes.set(input.dataset.note,input.value);else reviewNotes.delete(input.dataset.note);main.querySelector('.notes-status').textContent=reviewNotes.size?`Notes in ${reviewNotes.size} section${reviewNotes.size===1?'':'s'}`:'No notes yet';}));
  const download=()=>{const entries=[...reviewNotes].map(([key,value])=>`## ${key}\n\n${value}`).join('\n\n');downloadText('nt-survey-review-notes.md',`# NT questionnaire review notes\n\nQuestion draft: 24 September 2026\nSaved: ${new Date().toISOString()}\n\n${entries||'No notes entered.'}\n`);};
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
