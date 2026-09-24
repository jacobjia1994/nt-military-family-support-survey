// Question text for internal team review. IDs are stable analysis keys.
// Youth and child pathways are staff walkthroughs until participation procedures are agreed.
const DOMAINS = {
  adult: [
    { id: "settling", label: "Settling into life in the NT", hint: "Finding your way around and adjusting to a new place." },
    { id: "work_study", label: "Work, study or training", hint: "Finding opportunities, continuing your career or using your skills." },
    { id: "housing", label: "Finding or managing housing", hint: "A suitable place to live, housing arrangements or housing problems." },
    { id: "everyday_expenses", label: "Managing everyday expenses", hint: "Food, bills and other day-to-day costs." },
    { id: "transport", label: "Getting around", hint: "Transport to work, services, activities or people you want to see." },
    { id: "childcare", label: "Childcare", hint: "Including care outside usual hours and when plans change." },
    { id: "schooling", label: "Schooling or children's education", hint: "Starting or changing schools, learning or school support." },
    { id: "parenting_caring", label: "Parenting or caring for someone", hint: "Day-to-day caring responsibilities and practical help." },
    { id: "physical_health", label: "Physical health or healthcare", hint: "Accessing care and looking after your physical health." },
    { id: "emotional_wellbeing", label: "Emotional or mental wellbeing", hint: "Support with feelings, stress or emotional wellbeing." },
    { id: "disability_ongoing_needs", label: "Disability or ongoing support needs", hint: "Access, additional needs, ongoing care or continuity of support." },
    { id: "family_relationships", label: "Family life or relationships", hint: "Keeping relationships working and managing changes together." },
    { id: "people_to_turn_to", label: "Friends, community or people to turn to", hint: "Connection, belonging and having someone you can ask for help." },
    { id: "military_separation", label: "Time apart because of military service", hint: "Managing absences, reunions or uncertainty about time together." },
    { id: "safety_confidential_help", label: "Feeling safe or getting confidential help", hint: "You do not need to describe personal events or identify anyone." }
  ],
  youth: [
    { id: "friends_belonging", label: "Friends or feeling that I belong" },
    { id: "school_learning", label: "School, study or learning" },
    { id: "moving_change", label: "Moving or getting used to changes" },
    { id: "family_time_apart", label: "Family life or having someone away" },
    { id: "feelings_wellbeing", label: "My feelings or wellbeing" },
    { id: "activities_transport", label: "Things to do or getting around" },
    { id: "health_access", label: "Health, disability or other support needs" },
    { id: "finding_help", label: "Knowing where to get help or finding someone I trust" }
  ],
  child: [
    { id: "friends", label: "Making or keeping friends" },
    { id: "school", label: "School" },
    { id: "moving_change", label: "Moving or changes" },
    { id: "family_away", label: "When someone in my family is away" },
    { id: "feelings", label: "Feelings or worries" },
    { id: "activities", label: "Things to do" }
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
function hasPriority(answers) {
  return Boolean(answers.priority && !NO_PRIORITY.includes(answers.priority));
}
function hasSoughtHelp(answers) {
  return (answers.help || []).some(v => !['not_sought','unsure','prefer'].includes(v));
}
function reconcileAnswers(answers, changed, domains, previous) {
  if(changed === 'needs') {
    const ids = selectedNeeds(answers, domains);
    if(!ids.includes('other_need')) delete answers.needs_other;
    answers.adequacy = Object.fromEntries(Object.entries(answers.adequacy || {}).filter(([k]) => ids.includes(k)));
    if(answers.priority && !NO_PRIORITY.includes(answers.priority) && answers.priority !== 'another' && !ids.includes(answers.priority)) {
      delete answers.priority;
      reconcileAnswers(answers, 'priority', domains);
    }
  }
  if(changed === 'priority') {
    for(const key of ['impact','help','barriers','change','delivery','times','another_priority']) delete answers[key];
  }
  if(changed === 'another_priority' || changed === 'needs_other' && answers.priority === 'other_need') {
    for(const key of ['impact','help','barriers','change','delivery','times']) delete answers[key];
  }
  if(changed === 'needs_other' && answers.adequacy) delete answers.adequacy.other_need;
  if(changed === 'help') delete answers.barriers;
  if(changed === 'roles' && !(answers.roles || []).includes('child')) {
    delete answers.financial_dependence;
    delete answers.care_dependence;
  }
  if(changed === 'region' && ['outside_au','outside_overseas'].includes(answers.region)) delete answers.time_nt;
  if(changed === 'region' && previous && previous !== answers.region && (['outside_au','outside_overseas'].includes(previous) !== ['outside_au','outside_overseas'].includes(answers.region))) {
    for(const key of ['strengths','needs','needs_other','adequacy','priority','another_priority','impact','help','barriers','change','delivery','times','anything']) delete answers[key];
  }
  if(changed === 'delivery' && !(answers.delivery || []).some(v => ['one_to_one','group','phone','video'].includes(v))) delete answers.times;
}
function buildSteps(answers, domains, version) {
  const steps = [{id:'connection',phase:0},{id:'place',phase:0},{id:'strengths',phase:1},{id:'needs',phase:1}];
  const needs = selectedNeeds(answers, domains);
  for(let i=0;i<needs.length;i+=2) steps.push({id:'adequacy-'+(i/2),phase:2,domains:needs.slice(i,i+2)});
  steps.push({id:'priority',phase:3});
  if(hasPriority(answers)) {
    steps.push({id:'impact',phase:3},{id:'help',phase:3},{id:'barriers',phase:3},{id:'change',phase:3});
    if(version!=='child') steps.push({id:'delivery',phase:3});
  }
  steps.push({id:'anything',phase:4},{id:'review',phase:4});
  return steps;
}
function cleanExport(answers, version, domains) {
  const activeIds = selectedNeeds(answers, domains);
  const copy = structuredClone(answers);
  if(!(copy.roles || []).includes('child')) {
    delete copy.financial_dependence;
    delete copy.care_dependence;
  }
  if(['outside_au','outside_overseas'].includes(copy.region)) delete copy.time_nt;
  copy.adequacy = Object.fromEntries(activeIds.map(id => [id, copy.adequacy?.[id] ?? null]));
  if(!hasPriority(copy)) for(const key of ['impact','help','barriers','change','delivery','times','another_priority']) delete copy[key];
  return {schema_version:'1.0',questionnaire_version:version,storage:'downloaded_by_respondent; not submitted',answers:copy};
}


const main = document.querySelector('#main');
const phases = ['About you','Everyday life','Your support','What matters most','Finishing up'];
const state = { version:'adult', age:null, answers:{}, step:'connection', screen:'welcome', returnToReview:false, participation:null };
const PARTICIPANT_NOTICE_VERSION = '2026-09-24-v5';
const PARTICIPANT_INFORMATION = [
  ['Your choice', 'Taking part is voluntary. Most questions are optional, and you can stop before submitting. Some ask about wellbeing, disability or safety. Share only what you feel comfortable sharing, and leave out names, service numbers and other identifying details.'],
  ['How your answers will be used', 'Lutheran Care will use your responses to decide local priorities for its Defence family support program and plan activities and services.'],
  ['Where they will be kept and who can see them', 'Lutheran Care will store your responses securely in its approved record-keeping systems. Authorised members of Lutheran Care’s project team will read your responses. Access is restricted to people who need the information for this work.'],
  ['What will be shared', 'Project information will be shared with the Department of Defence after identifying details have been removed. Lutheran Care may also share information if the law requires or allows it.'],
  ['Retention and withdrawal', 'Lutheran Care will retain and dispose of responses under its records requirements. You can ask to withdraw your answers after submitting, but we may not be able to find or remove them.'],
  ['Questions, access or complaints', 'Contact <a href="mailto:feedback@lutherancare.org.au">feedback@lutherancare.org.au</a> about privacy, access, correction or complaints. Our <a href="https://www.lutherancare.org.au/privacy-policy/" target="_blank" rel="noopener">Privacy Policy</a> explains how Lutheran Care handles personal information.']
];
function participantInformationHTML(id='participant-information') {
  return `<section class="participant-information" id="${id}" aria-labelledby="${id}-title"><h2 id="${id}-title">Taking part and your information</h2><div class="notice-grid">${PARTICIPANT_INFORMATION.map(([label,body])=>`<p><strong>${label}</strong> ${body}</p>`).join('')}</div></section>`;
}
function participationRecord(age, accepted) {
  if(!accepted || !['adult','youth','child'].includes(age)) return null;
  return {notice_version:PARTICIPANT_NOTICE_VERSION,age_path:age,kind:age==='adult'?'consent':'assent',agreed:true,recorded_at:new Date().toISOString()};
}
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const opts = pairs => pairs.map(([id,label,hint]) => ({id,label,hint}));
const domainList = () => [...DOMAINS[state.version].map(d=>outside()&&d.id==='settling'?{...d,label:'Adjusting to your family member serving in the NT',hint:'Changes to everyday life or family arrangements.'}:d),{id:'other_need',label:'Something else'}];
const domainLabel = id => id==='other_need' ? (state.answers.needs_other || 'Something else') : domainList().find(d=>d.id===id)?.label || id;
const isAdult = () => state.version==='adult';
const isChild = () => state.version==='child';
const outside = () => ['outside_au','outside_overseas'].includes(state.answers.region);
const period = () => outside() ? `Think about the past ${isChild()?'three':'six'} months while your family member has been serving in the NT, or that time if shorter.` : isChild() ? 'Think about your time here in the last three months. If you arrived more recently, think about the time since you arrived.' : 'Think about the past six months in the NT. If you arrived more recently, think about your time here.';
const priorityLabel = () => state.answers.priority==='another' ? (state.answers.another_priority || 'the support you chose') : domainLabel(state.answers.priority);
const getValue = key => key.startsWith('adequacy:') ? state.answers.adequacy?.[key.split(':')[1]] : state.answers[key];
const info = '';
const PREFER = {id:'prefer',label:'Prefer not to answer'};
const UNSURE = {id:'unsure',label:'Not sure'};
const regions = opts([['darwin','Darwin'],['palmerston','Palmerston / Litchfield'],['katherine','Katherine / Tindal'],['alice','Alice Springs'],['other_nt','Elsewhere in the NT'],['outside_au','Elsewhere in Australia'],['outside_overseas','Outside Australia'],['prefer','Prefer not to answer']]);
const adequacy = () => opts([['enough',isChild()?'I got enough help':'Enough to meet my needs'],['some',isChild()?'I got some help, but needed more':'Some, but not enough'],['none',isChild()?'I did not get any help':'None'],['unsure','Not sure'],['prefer','Prefer not to answer']]);
const roleOptions = () => isAdult() ? opts([['serving','I am a serving military member'],['partner','I am a partner or spouse'],['child','I am a son, daughter or child of a serving member'],['parent','I am a parent of a serving member'],['other_family','I am another family member'],['none','None of these']]) : opts([['child','My parent or carer is a military member'],['other_family','Someone else in my family is a military member'],['none','Neither of these'],['unsure','Not sure']]);
const field = (key,label,type,options=[],hint=info,extra={}) => ({key,label,type,options,hint,...extra});
function page(step) {
  const a=state.answers;
  const child=isChild();
  switch(step.id) {
    case 'connection': return {title:isAdult()?'Your connection to military life':'A little about your family',intro:'',fields:[
      field('roles',isAdult()?'Which describes you?':'Which describes your family?','multi',roleOptions(),'Select all that apply.',{required:true,exclusive:['none','unsure']}),
      field('serving_nt',isAdult()?'Are you, or the military member in your family, currently serving in the NT?':'Is that person serving in the NT now?','single',opts([['yes','Yes'],['no','No'],['unsure','Not sure']]),'Choose one to continue.',{required:true}),
      field('force',isAdult()?'Which military are you or your family connected with?':'Which military is your family member part of?','single',opts([['adf','Australian Defence Force'],['other','Another country’s military'],['both','Both'],['unsure','Not sure'],['prefer','Prefer not to answer']]))
    ]};
    case 'place': return {title:child?'Where you live':'Your life at the moment',intro:'',fields:[
      field('region','Where do you currently live?','select',regions,'Choose an area, or “Prefer not to answer”.',{required:true}),
      field('time_nt','How long have you lived in the NT on this stay?','single',opts([['under3','Less than 3 months'],['3to12','3–12 months'],['1to3','More than 1 year, up to 3 years'],['over3','More than 3 years'],['unsure','Not sure'],['prefer','Prefer not to answer']]),info,{conditional:'nt'}),
      ...(isAdult()?[field('caring','Do you currently have caring responsibilities?','multi',opts([['under18','Caring for children under 18'],['adult_care','Supporting an adult with daily living or care'],['none','Neither'],['prefer','Prefer not to answer']]),'Select all that apply.',{exclusive:['none','prefer']})]:[field('assistance','How are you answering these questions?','single',opts([['self','By myself'],['reading','Someone is helping me read'],['recording','Someone is writing down my answers'],['prefer','Prefer not to answer']]),'Your answers should be your own. It is fine to ask for help reading.')]),
      ...(isAdult()&&a.roles?.includes('child')?[field('financial_dependence','Do you rely on your parent or parents for essential living costs?','single',opts([['yes','Yes'],['partly','Partly'],['no','No'],['prefer','Prefer not to answer']])),field('care_dependence','Do you rely on your parent or parents for help with daily living or care?','single',opts([['yes','Yes'],['sometimes','Sometimes'],['no','No'],['prefer','Prefer not to answer']]))]:[])
    ]};
    case 'strengths': return {title:child?'What is going well?':'What already helps?',intro:outside()?'Think about life while your family member is serving in the NT.':'',fields:[field('strengths',child?'What is going well in your life, or helps you feel supported?':outside()?'What already helps you manage everyday life while your family member is serving in the NT?':'What already helps you manage everyday life in the NT?','text',[],'A short answer is fine. Please leave out names or identifying details.') ]};
    case 'needs': return {title:child?'Where have you needed help?':'Where have you needed support?',intro:period()+' '+(child?'Help can come from people you know or people whose job is to help.':'Support can include help from family, friends, your community or a service.'),fields:[field('needs',child?'Which things have you needed help with?':'In which areas did you need support?','multi',[...domainList(),{id:'none',label:child?'I did not need help with these things':'I did not need support in these areas'},UNSURE,PREFER],'Select all that apply, including areas where you received enough help.',{exclusive:SPECIAL_NEEDS}),field('needs_other','What else did you need help with?','short',[],'A few words are enough. Please leave out names.',{conditional:'other_need'})]};
    case 'priority': {
      const ids=selectedNeeds(a,domainList());
      const candidates=ids.length?domainList().filter(d=>ids.includes(d.id)):domainList().filter(d=>d.id!=='other_need');
      return {title:child?'What would you like help with now?':'What matters most to you now?',intro:child?'Pick one thing you would most like help with. You can also say you do not need more help.':'You may have needed support in several areas. Choose the one you would most like to improve now.',fields:[field('priority','Choose one area.','single',[...candidates,{id:'another',label:'Another area'},{id:'none',label:child?'I do not need more help now':'I do not need any additional support now'},UNSURE,PREFER],info),field('another_priority','What would you like support with?','short',[],'A few words are enough. Please leave out names.',{conditional:'another'})]};
    }
    case 'impact': return {title:child?'How much has this affected you?':'How much has this affected everyday life?',intro:`Your chosen area: ${priorityLabel()}.`,fields:[field('impact',child?'In the past four weeks, how much has this made things harder for you?':'In the past four weeks, how much has this issue affected your everyday life?','single',opts([['not_at_all','Not at all'],['a_little','A little'],['moderately',child?'Somewhat':'Moderately'],['a_lot','A lot'],['extremely',child?'Very much':'Extremely'],['unsure','Not sure'],['prefer','Prefer not to answer']]),'If this began more recently, think about the time since it began.')]};
    case 'help': return {title:child?'Who have you asked for help?':'Where have you looked for help?',intro:`Think about your chosen area: ${priorityLabel()}.`,fields:[field('help',child?'Who have you asked about this?':'Where have you looked for help with this?','multi',isAdult()?opts([['family','Family or friends'],['military','Military support services'],['community','A community group or service'],['health','A health professional or service'],['school','A school, college or university'],['online','Online information or support'],['other','Somewhere else'],['not_sought','I have not looked for help'],['unsure','Not sure'],['prefer','Prefer not to answer']]):opts([['family','A parent, carer or someone in my family'],['friends','A friend'],['school','Someone at school'],['community','A youth worker or community group'],['health','A doctor, counsellor or other health worker'],['online','An online or phone support service'],['other','Someone else'],['not_sought','I have not asked anyone'],['unsure','Not sure'],['prefer','Prefer not to answer']]),'Select all that apply.',{exclusive:['not_sought','unsure','prefer']})]};
    case 'barriers': {
      const sought=hasSoughtHelp(a),notSought=a.help?.includes('not_sought');
      const neutral=!sought&&!notSought;
      const experiencedYouth = BARRIERS.youth.map(o=>({...o,label:({'Not knowing where to go':'I did not know where to go','Not having someone I trust to ask':'I did not have someone I trusted to ask','Worrying about who would be told':'I worried about who would be told','Feeling that people would not understand':'I felt people would not understand'})[o.label]||o.label}));
      const list=sought?(state.version==='youth'?experiencedYouth:BARRIERS[state.version]):notSought?(isAdult()?opts([['not_needed_yet','I have been managing without outside help'],['dont_know','I do not know where to go'],['eligibility_concern','I am unsure whether I am eligible'],['cost_concern','I expect it would cost too much'],['time','I have not had the time or opportunity'],['privacy','I am concerned about privacy'],['trust','I am not sure people would understand'],['self_reliance','I prefer to manage this myself'],['language','Language or communication would be difficult'],['access','Travel or accessibility would be difficult'],['other','Another reason']]):opts([['dont_know','I do not know who to ask'],['privacy','I worry other people will find out'],['trust','I do not think people will understand'],['time','I have not had a chance'],['self_reliance','I want to try handling it myself'],['access','It is hard to get there'],['other','Something else']])):BARRIERS[state.version];
      return {title:notSought?(child?'Why haven’t you asked for help?':'Why haven’t you looked for help?'):'What has made it hard to get help?',intro:`Your chosen area: ${priorityLabel()}. `+(sought?'Tell us about what you actually experienced.':notSought?'Tell us what influenced your decision.':'You can skip this if it does not apply.'),fields:[field('barriers',notSought?'Which reasons apply to you?':neutral?'What, if anything, has made getting help difficult?':'What made it harder to get the help you needed?','multi',[...list.filter(o=>!['none','unsure','prefer','prefer_not_to_say'].includes(o.id)),{id:'none',label:notSought?'None of these reasons':child?'Nothing made it hard':'Nothing made it harder'},UNSURE,PREFER],'Select all that apply.',{exclusive:['none','unsure','prefer']})]};
    }
    case 'change': return {title:child?'What would make things better?':'What would make the biggest difference?',intro:`Think about your chosen area: ${priorityLabel()}.`,fields:[field('change',child?'What would help you with this?':'What support or change would make the biggest difference for you?','text',[],'A few words are enough. You can leave this blank.')]};
    case 'delivery': return {title:'What would work for you?',intro:'If you wanted support with your chosen area, how would you prefer to receive it?',fields:[field('delivery','Which ways would suit you?','multi',opts([['one_to_one','In person, one to one'],['group','In a group'],['phone','By phone'],['video','By video call'],['text','By message or online chat'],['information','Information I can read in my own time'],['referral','Someone helping me connect with another service'],['no_preference','No particular preference'],['other','Another way'],['prefer','Prefer not to answer']]),'Select all that apply.',{exclusive:['no_preference','prefer']}),field('times','When would calls, meetings or activities usually suit you?','multi',opts([['weekday_day','Weekday daytime'],['weekday_evening','Weekday evenings'],['weekend','Weekends'],['variable','It changes from week to week'],['no_preference','No particular preference'],['prefer','Prefer not to answer']]),'Select all that apply.',{exclusive:['no_preference','prefer'],conditional:'live'})]};
    case 'anything': return {title:child?'One last thing':'Is there anything we have missed?',intro:'',fields:[field('anything',child?'What is one thing you wish adults understood about your life?':'Is there anything important you would like to add?','text',[],'You can leave this blank. Please do not include names or identifying details.')]};
    default: if(step.id.startsWith('adequacy-')) return {title:child?'Did you get enough help?':'Was the support enough?',intro:period(),fields:step.domains.map(id=>field('adequacy:'+id,domainLabel(id),'single',adequacy(),child?'How much help did you get with this?':'How much of the support you needed did you receive?'))};
    return {title:'Your answers',intro:'Take a moment to review your answers. You can change any section before finishing.',fields:[]};
  }
}
function optionHTML(o,f,value) {
  const checked = f.type==='multi' ? (value||[]).includes(o.id) : value===o.id;
  return `<label class="choice"><input type="${f.type==='multi'?'checkbox':'radio'}" name="${esc(f.key)}" value="${esc(o.id)}" ${checked?'checked':''}><span class="choice-body"><span class="choice-label">${esc(o.label)}</span>${o.hint?`<span class="choice-hint">${esc(o.hint)}</span>`:''}</span></label>`;
}
function conditionalVisible(f) { return f.conditional==='nt'?!outside():f.conditional==='other_need'?state.answers.needs?.includes('other_need'):f.conditional==='another'?state.answers.priority==='another':f.conditional==='live'?(state.answers.delivery||[]).some(v=>['one_to_one','group','phone','video'].includes(v)):true; }
function fieldHTML(f) {
  const v=getValue(f.key),hint=f.hint?`<span class="field-hint" id="hint-${esc(f.key)}">${esc(f.hint)}</span>`:'';
  const hidden=conditionalVisible(f)?'':'hidden';
  const describedBy=f.hint?`aria-describedby="hint-${esc(f.key)}"`:'';
  if(['single','multi'].includes(f.type)) return `<fieldset class="question-group" data-field="${esc(f.key)}" ${hidden}><legend>${esc(f.label)}${hint}</legend><div class="choices ${f.key==='needs'&&!isChild()?'columns':''} ${f.options.length>6?'compact':''}">${f.options.map(o=>optionHTML(o,f,v)).join('')}</div></fieldset>`;
  let input='';
  if(f.type==='select') input=`<select class="select" id="${esc(f.key)}" name="${esc(f.key)}" ${describedBy}><option value="">Choose an option</option>${f.options.map(o=>`<option value="${esc(o.id)}" ${v===o.id?'selected':''}>${esc(o.label)}</option>`).join('')}</select>`;
  else if(f.type==='short') input=`<input class="text-input" id="${esc(f.key)}" name="${esc(f.key)}" maxlength="160" value="${esc(v||'')}" autocomplete="off" ${describedBy}>`;
  else input=`<textarea class="textarea" id="${esc(f.key)}" name="${esc(f.key)}" maxlength="${isChild()?600:1200}" ${describedBy}>${esc(v||'')}</textarea><div class="char-count" data-counter="${esc(f.key)}">${(v||'').length} / ${isChild()?600:1200}</div>`;
  return `<div class="question-group" data-field="${esc(f.key)}" ${hidden}><label class="field-label" for="${esc(f.key)}">${esc(f.label)}${hint}</label>${input}</div>`;
}
function focusHeading(){main.querySelector('h1')?.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
function renderWelcome(){
  state.screen='welcome';
  main.innerHTML=`<div class="welcome"><section class="welcome-intro"><h1 tabindex="-1">Defence life, day to day</h1><p class="lead">When plans change at short notice, who can you turn to? Something you’ve found helpful could be useful to another family too.</p><p>Lutheran Care wants to hear about your everyday experience of Defence life. We’ll use your answers to choose local priorities for our Northern Territory family support program, including when and how activities are offered.</p><p class="funding-note">This program is funded by the Australian Government Department of Defence through its Family Support Funding Program.</p></section>${participantInformationHTML()}<div class="welcome-start"><button class="button primary" id="start-questionnaire">Start questionnaire <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></button></div></div>`;
  main.querySelector('#start-questionnaire').onclick=()=>{renderAge();focusHeading();};
}
function renderAge(){
  state.screen='age';
  main.innerHTML=`<div class="survey-layout"><section class="age-step"><h1 tabindex="-1">Which age group are you in?</h1><p class="question-intro">We’ll use this to show you the right questions.</p><form id="welcome-form"><fieldset class="question-group"><legend class="visually-hidden">Your age group</legend><div class="age-grid">${opts([['adult','18 or older','Estimated 8–10 minutes'],['youth','12–17','Estimated 5–7 minutes'],['child','7–11','Estimated 3–5 minutes'],['young','Under 7','Conversation guide']]).map(o=>optionHTML(o,{key:'age',type:'single'},state.age)).join('')}</div></fieldset><div class="error" id="welcome-error" role="alert"></div><div class="question-actions"><button class="back-button" type="button" id="age-back">Back</button><button class="button primary" type="submit">Continue</button></div></form></section></div>`;
  main.querySelector('#age-back').onclick=()=>{renderWelcome();focusHeading();};
  main.querySelector('#welcome-form').addEventListener('submit',e=>{e.preventDefault();const age=main.querySelector('input[name="age"]:checked')?.value;if(!age){main.querySelector('#welcome-error').textContent='Choose an age group to continue.';main.querySelector('input[name=age]')?.focus();return;}if(age!==state.age){state.answers={};state.participation=null;state.step='connection';state.returnToReview=false;}state.age=age;state.version=age==='young'?'child':age;if(age==='young')renderYoung();else{renderParticipation();focusHeading();}});
}
function renderParticipation(){
  state.screen='participation';
  const adult=isAdult();
  const title=adult?'Before you begin':'Would you like to take part?';
  const explanation=adult
    ? '<p>Most questions are optional. Some ask about wellbeing, disability or safety. You can leave out anything you do not want to share.</p>'
    : '<p>We want to hear what life is like for you. You can skip most questions or stop whenever you want.</p><p>The Lutheran Care team will look at your answers to help plan support for families. Some project information will go to Defence after details that could identify you have been removed.</p><p>Please leave out names, school names and other details that could identify you or someone else. Ask someone you trust to explain anything you do not understand.</p>';
  const statement=adult
    ? 'I have read the participant information and agree to take part. I consent to Lutheran Care collecting, using and sharing my answers as described, including any health or disability information I choose to provide about myself.'
    : 'I understand what these questions are for and I want to take part.';
  main.innerHTML=`<div class="survey-layout"><h1 tabindex="-1">${title}</h1><div class="participation-explanation">${explanation}</div><button class="text-button" type="button" id="read-information">Read the participant information</button><form id="participation-form"><label class="choice consent-choice"><input type="checkbox" name="participation" ${state.participation?.agreed?'checked':''}><span class="choice-label">${statement}</span></label><p class="error" id="participation-error" role="alert"></p><div class="question-actions"><button class="back-button" id="participation-back" type="button">Back</button><button class="button primary" type="submit">Continue</button></div></form></div>`;
  main.querySelector('#read-information').onclick=()=>document.querySelector('#privacy-dialog').showModal();
  main.querySelector('#participation-back').onclick=()=>{renderAge();focusHeading();};
  main.querySelector('[name="participation"]').onchange=e=>{state.participation=participationRecord(state.age,e.target.checked);};
  main.querySelector('#participation-form').onsubmit=e=>{e.preventDefault();const checked=main.querySelector('[name="participation"]').checked;state.participation=participationRecord(state.age,checked);if(!state.participation){main.querySelector('#participation-error').textContent=adult?'Please confirm whether you agree to take part before continuing.':'Tick the box if you want to take part. You can also go back or close this page.';main.querySelector('[name="participation"]').focus();return;}renderSurvey();focusHeading();};
}
const YOUNG_PROMPTS = ['What do you like about being here?', 'Is there anything that feels hard?', 'Who helps you when you need help?', 'What would make things a little easier?'];
function renderYoung(){state.screen='young';main.innerHTML=`<section class="finish"><h1 tabindex="-1">Talking with younger children</h1><p class="lead">Young children can share through talking, drawing or pointing to pictures, with a trusted adult helping them take part.</p><div class="card"><h2>Questions to try</h2>${YOUNG_PROMPTS.map(text=>`<p>${esc(text)}</p>`).join('')}<p class="small">Follow the child’s lead, accept “I don’t know”, and stop when they want to. Record their own words separately from an adult’s interpretation.</p></div><div class="finish-actions"><button class="button secondary" id="return-welcome">Back to age choices</button></div></section>`;main.querySelector('#return-welcome').onclick=()=>{renderAge();focusHeading();};focusHeading();}
function renderScope(){state.screen='scope';main.innerHTML=`<section class="finish"><h1 tabindex="-1">Who this survey is for</h1><p class="lead">It is for people currently serving in the NT, and their family members. Your selection suggests this may not describe your current situation.</p><p class="small">If you selected the wrong answer, you can go back and change it.</p><div class="finish-actions"><button class="button primary" id="scope-back">Review my answer</button><button class="button secondary" id="scope-exit">Return to the start</button></div></section>`;main.querySelector('#scope-back').onclick=()=>{state.screen='survey';state.step='connection';renderSurvey();};main.querySelector('#scope-exit').onclick=()=>{state.answers={};renderWelcome();};focusHeading();}
function activeSteps(){return buildSteps(state.answers,domainList(),state.version);}
function reviewHTML(){return activeSteps().filter(s=>s.id!=='review').map(s=>{const p=page(s);return p.fields.filter(conditionalVisible).map(f=>{const v=getValue(f.key);let text;if(v===undefined||v===null||v===''||Array.isArray(v)&&!v.length)text='Not answered';else if(f.type==='text'||f.type==='short')text=v;else text=(Array.isArray(v)?v:[v]).map(id=>f.options.find(o=>o.id===id)?.label||id).join('; ');return `<div class="review-block"><div class="review-header"><h3>${esc(f.label)}</h3><button class="text-button" type="button" data-edit="${esc(s.id)}" aria-label="Change: ${esc(f.label)}">Change</button></div><p class="review-value">${esc(text)}</p></div>`;}).join('');}).join('');}
function renderSurvey(){
  if(!state.participation){renderParticipation();return;}
  state.screen='survey';
  const steps=activeSteps();let index=steps.findIndex(s=>s.id===state.step);if(index<0){state.step='priority';index=steps.findIndex(s=>s.id===state.step);}const s=steps[index],p=page(s),review=s.id==='review';
  main.innerHTML=`<div class="survey-layout"><section class="survey-main"><div class="step-topline"><strong>${esc(phases[s.phase])}</strong><span>Section ${s.phase+1} of 5</span></div><div class="section-track" aria-hidden="true">${phases.map((_,i)=>`<span class="${i<=s.phase?'visited':''}"></span>`).join('')}</div><form class="question-card" id="survey-form" novalidate><h1 tabindex="-1">${esc(p.title)}</h1>${p.intro?`<p class="question-intro">${esc(p.intro)}</p>`:''}${review?reviewHTML():p.fields.map(fieldHTML).join('')}<div class="error" id="form-error" role="alert"></div><div class="question-actions"><button class="back-button" type="button" id="back">Back</button><div class="action-right">${!review&&!p.fields.some(f=>f.required)?'<button class="skip-button" id="skip" type="button">Skip this page</button>':''}<button class="button primary" type="submit">${review?'Finish':'Continue'}</button></div></div></form></section></div>`;
  const form=main.querySelector('#survey-form');
  form.addEventListener('change',e=>{
    const input=e.target;if(!input.name)return;const f=p.fields.find(f=>f.key===input.name);if(!f)return;
    const old=getValue(f.key);let value=input.value;if(f.type==='multi')value=toggleChoice(old,input.value,f.exclusive||[]);
    if(f.key.startsWith('adequacy:')){state.answers.adequacy||={};state.answers.adequacy[f.key.split(':')[1]]=value;}
    else {state.answers[f.key]=value;if(JSON.stringify(old)!==JSON.stringify(value))reconcileAnswers(state.answers,f.key,domainList(),old);}
    for(const field of p.fields){
      const wrap=form.querySelector(`[data-field="${field.key}"]`);if(!wrap)continue;wrap.hidden=!conditionalVisible(field);
      const saved=getValue(field.key);
      wrap.querySelectorAll('input,textarea,select').forEach(el=>{if(['checkbox','radio'].includes(el.type))el.checked=Array.isArray(saved)?saved.includes(el.value):saved===el.value;else el.value=saved??'';});
    }
  });
  form.addEventListener('input',e=>{const input=e.target;if(input.matches('textarea,input[type="text"],input.text-input')){const old=state.answers[input.name];state.answers[input.name]=input.value;if(old!==input.value)reconcileAnswers(state.answers,input.name,domainList(),old);const counter=form.querySelector(`[data-counter="${input.name}"]`);if(counter)counter.textContent=`${input.value.length} / ${input.maxLength}`;}});
  form.addEventListener('submit',e=>{e.preventDefault();const missing=p.fields.find(f=>f.required&&(!getValue(f.key)||Array.isArray(getValue(f.key))&&!getValue(f.key).length));if(missing){const err=form.querySelector('#form-error');err.textContent='Please answer: '+missing.label;form.querySelector(`[name="${missing.key}"]`)?.focus();return;}if(s.id==='connection'&&(state.answers.serving_nt==='no'||state.answers.roles?.includes('none'))){renderScope();return;}if(review){renderFinish();return;}if(state.returnToReview){state.returnToReview=false;state.step='review';renderSurvey();focusHeading();return;}goNext(s.id);});
  main.querySelector('#back').onclick=()=>{state.returnToReview=false;const current=activeSteps();const i=current.findIndex(x=>x.id===s.id);if(i<=0){renderParticipation();focusHeading();return;}state.step=current[i-1].id;renderSurvey();focusHeading();};
  main.querySelector('#skip')?.addEventListener('click',()=>{for(const f of p.fields){if(f.key.startsWith('adequacy:')){if(state.answers.adequacy)delete state.answers.adequacy[f.key.split(':')[1]];}else {delete state.answers[f.key];reconcileAnswers(state.answers,f.key,domainList());}}goNext(s.id);});
  main.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>{state.returnToReview=true;state.step=b.dataset.edit;renderSurvey();focusHeading();});
}
function goNext(id){const steps=activeSteps(),index=steps.findIndex(s=>s.id===id);state.step=steps[index+1]?.id||'review';renderSurvey();focusHeading();}
function renderFinish(){state.screen='finish';main.innerHTML=`<section class="finish"><h1 tabindex="-1">Your answers are ready</h1><p class="lead">You can save a copy of your answers or go back to make changes.</p><div class="finish-actions"><button class="button primary" id="download-answers">Download my answers</button><button class="button secondary" id="review-answers">Review my answers</button></div><button class="text-button" id="restart">Clear answers and start again</button></section>`;main.querySelector('#download-answers').onclick=()=>{const data=cleanExport(state.answers,state.version,domainList());data.participation=state.participation;const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='my-nt-support-answers.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};main.querySelector('#review-answers').onclick=()=>{state.step='review';renderSurvey();focusHeading();};main.querySelector('#restart').onclick=()=>{state.answers={};state.participation=null;state.age=null;state.step='connection';renderWelcome();};focusHeading();}
const reviewNotes = new Map();
let libraryVersion = 'adult';
let libraryLocation = 'nt';

// Read the exact live question definitions in a temporary preview context.
// No synthetic answers from this library enter the respondent flow or results.
function questionLibrarySections(version, location) {
  const original = {version:state.version, answers:state.answers};
  state.version = version;
  state.answers = {roles:['child'], region:location==='nt'?'darwin':'outside_au', priority:DOMAINS[version][0].id, help:['family']};
  try {
    const sections = [];
    const add = (id, note='') => {const content=page({id});sections.push({id, ...content, note});};
    add('connection','Relationship and current service are needed to continue. “None of these” or “No” leads to an explanation of the survey scope. “Not sure” can continue.');
    add('place','Location is needed to continue; “Prefer not to answer” is available. Financial and care dependence appear only for adult children of a serving member.');
    add('strengths');
    add('needs','“No support needed”, “Not sure” and “Prefer not to answer” cannot be combined with other selections.');
    sections.push({id:'adequacy',...page({id:'adequacy-all',domains:domainList().map(d=>d.id)}),note:'Only areas selected in the needs question are shown to a respondent, two per page. All possible areas are listed here for review.'});
    add('priority','The list uses the areas selected earlier, plus “Another area”. If none were selected, the full list is offered. Choosing no additional support, not sure, prefer not to answer, or skipping this page skips the detailed follow-up.');
    add('impact','Shown only when a current priority is selected.');
    add('help','Shown only when a current priority is selected.');
    const variants = [];
    for (const [id,label,help] of [['sought','If the person looked for help',['family']],['not-sought','If the person has not looked for help',['not_sought']],['unknown','If help-seeking is skipped, uncertain or declined',undefined]]) {
      state.answers.help=help;
      variants.push({id,label,...page({id:'barriers'})});
    }
    sections.push({id:'barriers',title:'Getting help: three question paths',intro:'Only one of these versions appears, depending on the previous answer.',fields:[],variants});
    add('change','Shown only when a current priority is selected.');
    if(version!=='child') add('delivery','Shown only when a current priority is selected. The timing question appears only for in-person, group, phone or video support.');
    add('anything');
    return sections;
  } finally {state.version=original.version;state.answers=original.answers;}
}

function libraryFieldHTML(f) {
  const conditional = {nt:'Shown to people living in the NT.',other_need:'Shown after “Something else” is selected.',another:'Shown after “Another area” is selected.',live:'Shown after an in-person, group, phone or video option is selected.'}[f.conditional];
  const type = {single:'Choose one',multi:'Select all that apply',select:'Choose one area',text:'Written answer',short:'Short written answer'}[f.type];
  return `<div class="library-question"><p class="question-meta">${type} · ${f.required?'Needed to continue':'Optional'}</p><h3>${esc(f.label)}</h3>${f.hint?`<p class="field-hint">${esc(f.hint)}</p>`:''}${conditional?`<p class="branch-note">${conditional}</p>`:''}${f.options.length?`<ul class="option-list">${f.options.map(o=>`<li>${esc(o.label)}${o.hint?` <small>— ${esc(o.hint)}</small>`:''}</li>`).join('')}</ul>`:`<p class="small">${f.type==='short'?'Up to 160 characters.':`Up to ${libraryVersion==='child'?600:1200} characters.`}</p>`}</div>`;
}

function downloadText(filename, text, type='text/plain;charset=utf-8') {
  const url=URL.createObjectURL(new Blob([text],{type}));
  const link=document.createElement('a');link.href=url;link.download=filename;link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

function renderQuestionLibrary() {
  const sections=questionLibrarySections(libraryVersion,libraryLocation);
  const versionLabel={adult:'Adults · 18 or older',youth:'Young people · 12–17',child:'Children · 7–11'}[libraryVersion];
  main.innerHTML=`<h1>All questions</h1><p class="lead">Read the wording, options and different paths in one place.</p><p class="small">This list uses the same questions as the survey. Follow-up examples name the first support area; a respondent sees their own choice. Notes are for your own review: they are not sent anywhere. Download them before closing or refreshing this page.</p><div class="library-tools"><label>Age version<select class="select" id="review-version"><option value="adult" ${libraryVersion==='adult'?'selected':''}>Adults · 18 or older</option><option value="youth" ${libraryVersion==='youth'?'selected':''}>Young people · 12–17</option><option value="child" ${libraryVersion==='child'?'selected':''}>Children · 7–11</option></select></label><label>Location<select class="select" id="review-location"><option value="nt" ${libraryLocation==='nt'?'selected':''}>Living in the NT</option><option value="outside" ${libraryLocation==='outside'?'selected':''}>Living outside the NT</option></select></label><button class="button secondary" id="print-questions">Print questions</button></div><p class="small" id="version-description">${versionLabel} · ${libraryLocation==='nt'?'Living in the NT':'Living outside the NT'} · Draft, 24 September 2026</p><div class="notes-actions"><button class="button secondary" id="download-notes">Download review notes</button><span class="notes-status" aria-live="polite">${reviewNotes.size?`Notes in ${reviewNotes.size} section${reviewNotes.size===1?'':'s'}`:'No notes yet'}</span></div><nav class="library-index" aria-label="Question sections">${sections.map(s=>`<a href="#${s.id}">${esc(s.id==='adequacy'?'Support received':s.id==='barriers'?'Getting help':s.title)}</a>`).join('')}</nav>${sections.map(s=>{const key=`${libraryVersion}/${libraryLocation}/${s.id}`;return `<section class="library-section" id="${s.id}"><h2>${esc(s.title)}</h2><p class="small">${esc(s.intro)}</p>${s.note?`<p class="branch-note">${esc(s.note)}</p>`:''}${s.fields.map(libraryFieldHTML).join('')}${(s.variants||[]).map(v=>`<div><h3 class="branch-label">${esc(v.label)}</h3><p><strong>${esc(v.title)}</strong></p><p class="small">${esc(v.intro)}</p>${v.fields.map(libraryFieldHTML).join('')}</div>`).join('')}<label class="notes-label" for="note-${s.id}">Your review notes: ${esc(s.title)}</label><textarea class="textarea review-note" id="note-${s.id}" data-note="${key}" maxlength="4000" placeholder="Suggested wording, a missing option, or a question for the team">${esc(reviewNotes.get(key)||'')}</textarea></section>`;}).join('')}<section class="library-section" id="under-seven"><h2>Children under 7</h2><p>A conversation guide is offered instead of a questionnaire. Young children can share through talking, drawing or pointing to pictures, with a trusted adult helping them take part.</p><ol>${YOUNG_PROMPTS.map(text=>`<li>${esc(text)}</li>`).join('')}</ol><p>Follow the child’s lead, accept “I don’t know”, and stop when they want to. Record their own words separately from an adult’s interpretation.</p><p>The age bands guide the wording; they do not decide consent arrangements. See the <a href="review.html#children">participation guide</a>.</p></section><div class="notes-actions"><button class="button primary" id="download-notes-bottom">Download review notes</button><a class="button secondary" href="index.html">Try the survey</a></div>`;
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
