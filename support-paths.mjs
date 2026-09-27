import { matchSupport as baseMatch } from './support-model.mjs?v=20260927-2';
import { regions as legacyRegions } from './support-model.mjs?v=20260927-2';
const regions=[...legacyRegions.slice(0,5),['gove','Nhulunbuy / East Arnhem'],...legacyRegions.slice(5)];
const opts = rows => rows.map(([value,label,detail])=>({value,label,...(detail?{detail}:{})}));
const question=(id,label,rows,hint)=>({id,label,options:opts(rows),...(hint?{hint}:{})});
export const topics = [
 {id:'mental',title:'Mental health & grief',hint:'Stress, emotional support and support after a death',links:[{label:'Relationship counselling',href:'#relationships/counselling'}]},
 {id:'relationships',title:'Relationships & safety',hint:'Counselling, separation, violence or sexual assault'},
 {id:'parenting',title:'Parenting, school & childcare',hint:'Raising children, education and finding care',links:[{label:'Emotional support for a child or teenager',href:'#mental/feelings'},{label:'Pregnancy or a new baby',href:'#care/baby'}]},
 {id:'money',title:'Money & housing',hint:'Bills, essentials, accommodation and financial support',links:[{label:'An unsafe home because of violence',href:'#relationships/unsafe'}]},
 {id:'work',title:'Work, study & leaving Defence',hint:'Jobs, partner careers, Reserve work and transition'},
 {id:'care',title:'Medical care, disability & caring',hint:'Healthcare, treatment costs and support with caring',links:[{label:'Mental health support',href:'#mental/feelings'}]},
 {id:'connection',title:'Social groups & connection',hint:'Meeting people, settling in and family activities'}
];
const needs = {
 mental:[['feelings','Talk about stress, mood or mental health'],['treatment','Ongoing mental health treatment'],['grief','Grief after a death'],['practical-loss','Practical help after a death'],['suicide-loss','After a death by suicide'],['addiction','Alcohol, drugs or gambling']],
 relationships:[['counselling','Relationship counselling'],['separation','Separation or parenting arrangements'],['unsafe','Violence or feeling unsafe'],['refuge','A safe place to stay because of violence'],['assault','After sexual assault'],['misconduct','Defence-related sexual misconduct'],['child-violence','Support for a child affected by violence'],['legal','Legal advice']],
 parenting:[['parenting','Parenting or a child’s behaviour'],['childcare','Finding childcare'],['emergency-care','Urgent help caring for children'],['school','Starting or changing schools'],['learning','Learning or support at school'],['development','A child’s development or disability'],['education-costs','Help with education costs']],
 money:[['bills','Debt or bills'],['income','Income has dropped or stopped'],['essentials','Food or other essentials'],['housing','Finding or keeping housing'],['tonight','Nowhere to stay tonight'],['youth-housing','A young person is at risk of losing their home'],['tenancy','A rent, bond or tenancy problem'],['defence-housing','Defence housing or a posting move'],['claims','DVA claims or benefits'],['family-crisis','Practical help during a family crisis']],
 work:[['job','Finding work or changing career'],['study','Study or training'],['partner','Career support for a Defence partner'],['reserve','Balancing Reserve service with civilian work'],['transition','Leaving Defence or recently left']],
 care:[['health','Medical advice or finding care'],['baby','Pregnancy or a new baby'],['disability','Disability support or advocacy'],['home-care','Help with daily tasks at home'],['carer','Support for an unpaid carer'],['older','Care as someone gets older'],['travel','Travel for medical treatment'],['costs','Help with healthcare costs']],
 connection:[['local','Local groups and activities'],['defence-child','Activities for a Defence child (8–18)'],['settle','Getting connected after a move'],['apart','Family support during time apart'],['migrant','Migrant or refugee settlement support']]
};
const auxiliaryNeeds={private:'Anonymous support about Defence life',lgbtq:'LGBTIQA+ peer support',men:'Counselling for men (15 or older)',indigenous:'Aboriginal or Torres Strait Islander support'};
const ageQuestion=question('age','How old is the person needing support?',[
 ['0-4','Under 5'],['5-11','5–11'],['12-17','12–17'],['18-25','18–25'],['26+','26 or older']
], 'Choose the age of the person who will receive the support.');
const childAgeQuestion=question('childAge','How old is the child or teenager?',[
 ['0-4','Under 5'],['5-11','5–11'],['12-17','12–17']
], 'These age limits decide which children’s services can help.');
const connectionQuestion=question('connection','What is the Defence connection?',[
 ['serving','Currently serving full-time','Including reservists on continuous full-time service; member or family.'],
 ['reserve','Part-time Reserve service','Member or family.'],['former','Former member or their family'],['bereaved','Bereaved Defence or veteran family'],['unsure','Another connection or not sure']
]);
const counsellingQuestion=question('counselling','Which best describes the person receiving support?',[
 ['serving','They currently serve full-time in the ADF'],['member','They previously served full-time in the ADF'],['partner','Their current partner has served full-time'],['child','Their parent has served full-time'],['reserve','Currently serving part-time Reserve member or their family'],['other','Former Reserve-only service, another relationship, or not sure']
], 'Full-time service includes at least one day of continuous full-time service. Ordinary part-time Reserve training is different.');
const regionQuestion=question('region','Where is support needed?',regions,'For a move, choose the destination if it is known.');
const roleQuestion=question('role','Who is the support for?',[
 ['member','The serving or former member'],['partner','Their partner'],['child','Their child'],['other','Another relative or carer'],['unsure','Not sure']
]);
const childAges=['0-4','5-11','12-17'];
const ageOf=a=>a.age==='under18'?a.childAge:a.age==='adult'?'26+':a.age;
const child=a=>a.age==='under18'||childAges.includes(ageOf(a));
const veteranCareQuestion=question('veteranCare','Does the person needing care have a Veteran Card or a DVA-accepted condition?',[
 ['yes','Yes'],['no','No'],['unsure','Not sure']
], 'Choose for the person receiving care, even if you are asking on their behalf.');
export function questionsFor(topic,a={}) {
 const qs=[];if(topic!=='help')qs.push(question('need','What would help?',topic==='mental'&&auxiliaryNeeds[a.need]?[...needs.mental,[a.need,auxiliaryNeeds[a.need]]]:needs[topic]||[]));
 const n=a.need;
 if(!n&&topic!=='help')return qs;
 if(topic==='mental'&&['feelings','treatment','grief'].includes(n)){
  // Legacy in-memory states remain readable; new visitors answer age once.
  const ages=n==='grief'?question('age','How old is the person needing support?',[['0-4','Under 5'],['5-11','5–11'],['12-17','12–17'],['adult','18 or older']]):ageQuestion;
  qs.push(a.age==='under18'?{...ages,options:[...ages.options,{value:'under18',label:'Under 18'}]}:ages);
  if(a.age==='under18')qs.push(childAgeQuestion);
  if(a.age&&!child(a))qs.push(counsellingQuestion);
  if(n==='treatment'&&a.counselling==='reserve'&&!child(a))qs.push(roleQuestion);
  qs.push(regionQuestion);
  if(['feelings','treatment'].includes(n)&&child(a)&&a.region==='remote')qs.push(question('localCommunity','Which community is support needed in?',[['jabiru','Jabiru'],['wadeye','Wadeye'],['other','Another NT community']], 'This helps identify local child and family mental-health support.'));
 } else if(topic==='mental'&&n==='indigenous') {
  qs.push(question('indigenousNeed','What kind of support?',[['distress','Someone to talk to now'],['local','Local social and emotional wellbeing support'],['loss','After a suicide or traumatic death']]));
  if(a.indigenousNeed==='local'){qs.push(regionQuestion);if(a.region==='alice')qs.push(question('congressFit','Is the support for an Aboriginal person?',[['yes','Yes'],['other','No or not sure']], 'Congress provides free services for Aboriginal clients. Other referral options are available.'));}
 } else if(topic==='mental'&&n==='addiction') {
  qs.push(question('addiction','What is the concern?',[['substances','Alcohol or other drugs'],['gambling','Gambling']]));
 } else if(topic==='mental'&&n==='practical-loss') {
  qs.push(question('dvaClient','Was the person who died a DVA client?',[['yes','Yes'],['no','No'],['unsure','Not sure']]));
  qs.push(question('legacyFit','Which describes the family support enquiry?',[['eligible','A partner or child after a veteran’s service-related death or serious loss of health'],['other','Another situation or not sure']]));
  if(a.legacyFit==='eligible')qs.push(regionQuestion);
 } else if(topic==='relationships'){
  if(n==='counselling')qs.push(counsellingQuestion);
  if(n==='refuge')qs.push(question('refugeFor','Who needs a safe place?',[['woman-child','A woman with children in her care'],['woman','A woman without children'],['other','Someone else'],['unsure','Not sure']]));
  if(n==='child-violence')qs.push(question('childViolenceAge','How old is the person needing support?',[['0-12','12 or younger'],['13-17','13–17'],['18+','18 or older']]));
  if(n==='unsafe')qs.push(question('violenceSupport','Who would you like support from?',[['any','Any appropriate service'],['women','A service for women and children']]));
  if(n==='legal')qs.push(question('womenLegal','Would you like a women’s legal service?',[['yes','Yes'],['no','No preference']]));
  if(n==='legal'&&a.womenLegal==='yes')qs.push(question('legalIssue','What is the legal problem?',[['family-civil','Family or civil law'],['other','Criminal, immigration, commercial or not sure']]));
  if(!['misconduct'].includes(n))qs.push(regionQuestion);
 } else if(topic==='parenting'){
  if(['school','childcare','emergency-care','education-costs','learning'].includes(n))qs.push(connectionQuestion);
  if(n==='childcare')qs.push(question('careHours','What makes childcare difficult to find?',[['regular','Finding a regular place'],['nonstandard','Shift hours, isolation or complex needs']]));
  if(n==='learning')qs.push(question('schoolType','Which school setting?',[['government','NT government school'],['other','Another school or not sure']]));
  if(n==='learning'&&a.schoolType==='government')qs.push(question('schoolHelp','What would help most?',[['learning','Arranging learning or inclusion support'],['advocacy','Independent help with a school problem']]));
  if(n==='development')qs.push(question('therapy','Which applies to the child?',[
   ['eligible','Birth–18, with Medicare and no NDIS support'],['ndis','Already receives NDIS support'],['other','Another situation or not sure']
  ],'NT children’s therapy has these entry requirements. Other support remains available.'));
  qs.push(regionQuestion);
  if(n==='development'&&a.therapy==='eligible'&&a.region==='remote')qs.push(question('remoteArea','Which NT region is the child in?',[['topend','Top End or East Arnhem'],['bigrivers','Katherine or Big Rivers'],['central','Central Australia or Barkly'],['unsure','Not sure']]));
 } else if(topic==='money'){
  if(['bills','income','tonight','family-crisis','defence-housing'].includes(n))qs.push(connectionQuestion);
  if(['bills','income'].includes(n))qs.push(roleQuestion);
  if(n==='youth-housing')qs.push(question('youthAge','How old is the young person?',[['10-11','10–11'],['12-18','12–18'],['19-25','19–25'],['other','Another age or not sure']]));
  if(n==='tonight'&&['serving','reserve'].includes(a.connection))qs.push(question('housingReason','Why is accommodation needed?',[['crisis','A domestic crisis means we cannot stay at home'],['other','Another reason or not sure']]));
  if(n==='defence-housing'&&['serving','reserve'].includes(a.connection))qs.push(question('housingTask','Which part of the move?',[
   ['home','Service housing or rent allowance'],['removal','An approved Defence removal'],['other','Other posting or housing questions']
  ]));
  if(n!=='family-crisis')qs.push(regionQuestion);
 } else if(topic==='work'){
  if(['partner','transition'].includes(n))qs.push(connectionQuestion);
  if(n==='transition'&&a.connection==='former')qs.push(question('leftWhen','When did they leave Defence?',[['recent','Within the last 24 months'],['earlier','More than 24 months ago'],['unsure','Not sure']], 'Some Defence transition services remain available for two years after leaving.'));
  if(n==='partner'&&a.connection==='serving')qs.push(question('partnerEmployment','Does the applicant partner also serve full-time?',[['no','No — civilian or part-time Reserve'],['yes','Yes, or not sure']]));
  if(n==='transition')qs.push(regionQuestion);
 } else if(topic==='care'){
  if(n==='health')qs.push(question('healthFor','Who needs healthcare?',[['member','A currently serving ADF member'],['family','A currently serving member’s family'],['other','Someone else or not sure']]));
  if(['carer','home-care'].includes(n))qs.push(veteranCareQuestion);
  if(n==='home-care'&&a.veteranCare==='no')qs.push(question('homeCareAge','Which describes the person needing help?',[
   ['older','65 or older, or 50+ if Aboriginal or Torres Strait Islander'],['younger','Younger than these ages'],['unsure','Not sure']
  ], 'Age affects access to aged-care and disability support.'));
  if(n==='baby')qs.push(question('babyNeed','What support do you need?',[
    ['advice','Pregnancy, baby or parenting advice'],['nurse','A local child-health nurse (birth to 5)'],['young-parent','Local support for a young pregnant woman or young mum'],['feeding','Breastfeeding support'],['wurli','Aboriginal family support in Katherine: pregnancy to age 3'],['emotional','Emotional support around pregnancy or a new baby']
  ]));
  if(n==='baby'&&['nurse','young-parent','wurli'].includes(a.babyNeed))qs.push(regionQuestion);
  if(n==='baby'&&a.babyNeed==='wurli')qs.push(question('wurliClient','Is the family registered with Wurli?',[['yes','Yes'],['other','No or not sure']]));
  if(n==='baby'&&a.babyNeed==='young-parent')qs.push(question('parentAge','Which describes the parent?',[['under25','A pregnant woman or mum under 25'],['other','Another situation or not sure']]));
  if(n==='disability')qs.push(question('disabilityNeed','What do you need help with?',[
   ['ndis','NDIS access or planning'],['advocacy','A problem getting the support you need'],['posting','Disability needs during a Defence posting']
  ]));
  if(n==='disability'&&a.disabilityNeed==='ndis')qs.push(question('ndisStatus','Which describes the person needing support?',[['new','Under 65 and seeking NDIS access'],['existing','Already an NDIS participant'],['older','65 or older, seeking support for the first time'],['unsure','Not sure']]));
  if(n==='disability'&&a.disabilityNeed==='posting')qs.push(connectionQuestion);
  if(n==='older')qs.push(question('olderNeed','What would help?',[
   ['care','Finding or arranging aged care'],['memory','Memory problems or dementia'],['rights','A problem with aged-care services'],['alone','Help arranging aged care without someone to assist']
  ]));
  if(n==='older'&&a.olderNeed==='alone'){qs.push(question('careFinderFit','Which applies?',[['eligible','65 or older (50+ if Aboriginal or Torres Strait Islander), and no trusted person able to help'],['other','Another situation or not sure']]));qs.push(regionQuestion);}
  if(n==='older'&&a.olderNeed==='care')qs.push(veteranCareQuestion);
  if(['costs','travel'].includes(n)){qs.push(connectionQuestion);if(n==='costs'||a.connection==='serving')qs.push(roleQuestion);}
  if(n==='travel'&&!(a.connection==='serving'&&a.role==='member'))qs.push(question('dvaTravel','Does the patient have a Veteran Card that covers this treatment?',[['yes','Yes'],['no','No'],['unsure','Not sure']], 'DVA-funded travel has different rules from NT patient travel assistance.'));
  if(['disability','travel','costs'].includes(n))qs.push(regionQuestion);
  if(n==='travel'&&a.dvaTravel!=='yes'&&a.region&&a.region!=='outside')qs.push(question('ntResidence','Has the patient usually lived in the NT for at least six months?',[['yes','Yes'],['no','No'],['unsure','Not sure']], 'This affects NT patient travel assistance. Your healthcare provider must arrange the application.'));
  if(n==='costs'&&a.connection==='serving'&&a.role!=='member')qs.push(question('dependant','Are they a recognised Defence dependant?',[['yes','Yes'],['no','No or not sure']]));
 } else if(topic==='connection') {if(!['migrant','defence-child'].includes(n))qs.push(connectionQuestion);if(['local','settle'].includes(n))qs.push(roleQuestion);qs.push(regionQuestion);}
 else if(topic==='help') {qs.push(connectionQuestion);}
 const regionMode=regionModeFor(topic,a);
 const filtered=qs.filter(q=>q.id!=='region'||regionMode!=='none').filter(q=>q.id!=='ntResidence'||!(topic==='care'&&n==='travel'&&a.connection==='serving'&&a.role==='member'));
 return filtered.map(q=>q.id==='region'&&regionMode==='jurisdiction'?question('region','Is support needed in the Northern Territory?',[['nt','Northern Territory'],['outside','Outside the NT']]):q);
}

// Region is only requested when it changes a service or access requirement.
export function regionModeFor(topic,a={}) {
 const n=a.need, serving=['serving','reserve'].includes(a.connection);
 if(topic==='mental') {
  if(n==='grief'&&a.age&&!child(a))return 'none';
  if(n==='grief'&&ageOf(a)==='5-11')return 'jurisdiction';
  if(n==='practical-loss')return a.legacyFit==='eligible'?'jurisdiction':'none';
  return ['feelings','treatment','grief'].includes(n)||(n==='indigenous'&&a.indigenousNeed==='local')?'full':'none';
 }
 if(topic==='relationships') {
  if(n==='misconduct'||(n==='unsafe'&&a.violenceSupport==='any')||(n==='child-violence'&&a.childViolenceAge!=='0-12'))return 'none';
  if(['counselling','separation'].includes(n)||(n==='legal'&&!(a.womenLegal==='yes'&&a.legalIssue==='family-civil')))return 'jurisdiction';
  return 'full';
 }
 if(topic==='parenting') {
  if(n==='education-costs'||(n==='childcare'&&a.careHours==='regular')||(n==='emergency-care'&&serving))return 'none';
  return ['development','learning'].includes(n)?'full':'jurisdiction';
 }
 if(topic==='money')return ['income','family-crisis','defence-housing'].includes(n)?'none':['tonight','tenancy'].includes(n)?'jurisdiction':'full';
 if(topic==='work')return n==='transition'&&(serving||(a.connection==='former'&&['recent','unsure'].includes(a.leftWhen)))?'jurisdiction':'none';
 if(topic==='care') {
  if(n==='costs'||(n==='travel'&&(a.dvaTravel==='yes'||(a.connection==='serving'&&a.role==='member'))))return 'none';
  return ['disability','travel'].includes(n)||(n==='older'&&a.olderNeed==='alone')||(n==='baby'&&['nurse','young-parent','wurli'].includes(a.babyNeed))?'full':'none';
 }
 return topic==='connection'&&n!=='defence-child'?'full':'none';
}

export function preferencesFor(topic,a={}) {
 if(topic==='relationships'&&['legal','separation','unsafe','refuge','assault','child-violence'].includes(a.need)&&a.region!=='outside')return [{value:'indigenous-legal',label:'Aboriginal-led legal and family violence support'}];
 if(topic!=='mental'||!['feelings','treatment','grief','suicide-loss','addiction'].includes(a.need))return [];
 const result=[{value:'anonymous',label:'Anonymous support'},{value:'lgbtq',label:'LGBTIQA+ peer support'},{value:'indigenous',label:'Aboriginal or Torres Strait Islander support'}];
 if(['adult','18-25','26+'].includes(a.age))result.push({value:'men',label:'Counselling for men'});
 return result;
}

const unique=ids=>[...new Set(ids.filter(Boolean))];
export function getResults(topic,a={}) {
 const n=a.need,region=regionModeFor(topic,a)==='none'?'remote':(a.region||'remote'),inNT=region!=='outside',age=ageOf(a);
 const serving=['serving','reserve'].includes(a.connection),fulltime=a.connection==='serving';
 const c={...a,region,age,counselling:a.counselling==='serving'?'member':a.counselling,connection:serving?'serving':a.connection};
 const localOffice=region==='katherine'?'dmfs-tindal':['darwin','palmerston','alice'].includes(region)?'dmfs-darwin':'dmfs-helpline';
 const primaryNav=serving?'dmfs-helpline':'wellbeing-agency';
 let ids=[],moreIds=[],note='',noteBefore=false,contextLabel='',preferenceLink=null,say='I would like help working out the next step.';
 function base(task,focus){const r=baseMatch({...c,task,focus});ids=r.ids;note=r.note;say=r.say;}
 if(topic==='mental'){
  if(['feelings','treatment','grief'].includes(n)){
   base('talk',n==='treatment'?'feelings':n);
   if(a.counselling==='other'&&!child(a))moreIds.push('open-arms-check');
   if(age==='0-4'){const nurse={darwin:'child-health-darwin',palmerston:'child-health-palmerston',katherine:'child-health-katherine',alice:'child-health-alice',tennant:'child-health-tennant',gove:'child-health-arnhem'}[region];ids=nurse?[nurse,'parentline','healthdirect']:['healthdirect',...(inNT?['parentline']:[])];note='For a young child, start with a child-health nurse or health advice to work out assessment and referral needs. Parentline is support for the parent or carer.';}
   if(a.counselling==='reserve'&&!child(a)){ids=['reserve-counselling',...ids.filter(id=>id!=='open-arms')];}
   const familyMental=region==='darwin'?'catholiccare-fmhss-darwin':region==='remote'?{jabiru:'catholiccare-fmhss-jabiru',wadeye:'catholiccare-fmhss-wadeye'}[a.localCommunity]:null;
   if(['feelings','treatment'].includes(n)){
    if(child(a)&&familyMental){
     if(age==='5-11')ids=[familyMental,...ids];else moreIds.push(familyMental);
    }
    if(n==='feelings')preferenceLink={label:'Looking for ongoing treatment or help with treatment costs?',href:'#mental/treatment'};
    if(n==='treatment'){
     if(!child(a)&&a.counselling==='serving'){
      ids=['adf-healthcare','open-arms','dva-mental-treatment'];
      if(inNT)moreIds.push('connect-wellbeing-nt');
     }else if(!child(a)&&a.counselling==='member'){
      ids=['dva-mental-treatment',...(inNT?['connect-wellbeing-nt']:[]),'open-arms'];
     }else if(!child(a)&&a.counselling==='reserve'&&a.role==='member'){
      ids=['dva-mental-treatment',...(inNT?['connect-wellbeing-nt']:[]),'reserve-counselling'];
     }else if(age==='0-4'){
      // Retain a child-health assessment first for very young children.
      if(familyMental)ids=[ids[0],familyMental,...ids.slice(1)];
     }else if(child(a)&&familyMental){ids=[familyMental,...ids.filter(id=>id!==familyMental)];}
     else if(region==='tennant'&&['12-17','18-25'].includes(age)){ids=['catholiccare-yes-tennant','eheadspace','kids-helpline'];}
     else if(inNT){ids=['connect-wellbeing-nt',...ids];}
     else {ids=['healthdirect',...ids];}
     if(a.counselling==='other'&&!child(a))moreIds.push('dva-mental-treatment');
     say='I would like help arranging ongoing mental-health care and checking the treatment or funding options I can access.';
     if(age!=='0-4')note='These services can check the right treatment and referral pathway. Eligibility and any costs depend on the programme; a referral does not guarantee an appointment.';
    }else if(region==='tennant'&&['12-17','18-25'].includes(age))moreIds.push('catholiccare-yes-tennant');
   }
   if(['5-11','12-17'].includes(age)){
    // Military-aware support remains optional; the card explains family eligibility.
    ids=[ids[0],'open-arms',...ids.slice(1)];
    if(age==='12-17')moreIds.push('defence-kids');
   }
   if(['serving','reserve'].includes(a.counselling)&&!child(a))moreIds.push('adf-allhours');
  } else if(n==='practical-loss'){
   ids=a.dvaClient==='yes'?['dva-bereavement','wellbeing-agency']:['wellbeing-agency'];
   if(a.legacyFit==='eligible'&&inNT)ids=a.dvaClient==='yes'?['dva-bereavement','legacy-nt']:['legacy-nt','wellbeing-agency'];
   say='Someone in our Defence or veteran family has died. I need help with practical next steps and possible family entitlements.';
  } else if(n==='suicide-loss')base('talk','suicide-loss');
  else if(n==='private'){ids=['safe-zone'];say='I would like to talk about what is happening without giving my name.';}
  else if(n==='men'){ids=['mensline'];say='I would like to talk with a counsellor about emotional, family or relationship concerns.';}
  else if(n==='lgbtq'){ids=['qlife'];say='I would like to talk with an LGBTIQA+ peer supporter.';}
  else if(n==='indigenous'){
   if(a.indigenousNeed==='loss')ids=['thirrili','13yarn'];
   else if(a.indigenousNeed==='local'){
    const local=region==='katherine'?'wurli-sewb':['darwin','palmerston'].includes(region)?'danila-dilba':region==='alice'&&a.congressFit==='yes'?'congress-sewb':null;
    ids=local?[local,'13yarn']:['healthdirect','13yarn'];
    contextLabel='Local Aboriginal or Torres Strait Islander wellbeing support · '+(regions.find(r=>r[0]===region)?.[1]||'your area');
    if(!local){note='This guide has not verified a matching local service for these choices. Ask your usual health clinic or healthdirect about a local referral. 13YARN is a separate phone support option.';noteBefore=true;}
   }else ids=['13yarn'];
   say=a.indigenousNeed==='local'?'I am looking for ongoing local Aboriginal or Torres Strait Islander social and emotional wellbeing support. Can you help me access the right local team?':'I would like Aboriginal or Torres Strait Islander support for myself or my family.';
  }
  else if(n==='addiction'){ids=[a.addiction==='gambling'?'gambling-help':'alcohol-drug-chat'];say='I would like support with my own or someone else’s alcohol, drug or gambling concerns.';}
 } else if(topic==='relationships'){
  if(n==='counselling'){
   base('talk','relationship');
   if(a.counselling==='reserve')ids=['reserve-counselling','family-advice'];
   if(a.counselling==='other'){
    ids=['open-arms-check','family-advice','beyondblue'];
    note='Some former partners, reservists and bereaved relatives can use Open Arms. Ask its team to check your circumstances; the other contacts do not require Defence eligibility.';
   }
   if(inNT){
    ids=a.counselling==='other'?['relationships-australia-nt',...ids]:[ids[0],'relationships-australia-nt',...ids.slice(1)];
   }
  }
  else if(n==='refuge'){
   const local={darwin:'dawn-shelter',palmerston:'dawn-shelter',katherine:'kwcc',alice:'wossca',tennant:'tennant-refuge',gove:'miyalk-shelter'}[region];
   ids=['woman','woman-child'].includes(a.refugeFor)&&local&&(!['darwin','palmerston'].includes(region)||a.refugeFor==='woman-child')?[local,'respect']:['respect'];
   if(a.refugeFor==='woman'&&['darwin','palmerston'].includes(region))ids=['catherine-booth-house','respect'];
   note='If someone is in immediate danger, call 000. Use a safer device if this one may be monitored. Ask about vacancies and any accommodation charges.';
   say='I need somewhere safe because of violence. Can you help with safe accommodation now?';
  } else if(n==='child-violence'){ids=a.childViolenceAge==='0-12'&&['darwin','palmerston'].includes(region)?['safe-reconnected','parentline']:a.childViolenceAge==='13-17'?['kids-helpline','respect']:['respect'];say='I would like help for a child affected by family violence.';}
  else if(n==='misconduct'){ids=['sempro'];say='I would like to understand my support options after Defence-related sexual misconduct.';}
  else {base('safety',n);if(n==='unsafe'&&a.violenceSupport==='women'&&['darwin','palmerston'].includes(region))ids.push('dawn-counselling');if(n==='legal'&&a.womenLegal==='yes'&&a.legalIssue==='family-civil'&&inNT){const local={darwin:'tewls',palmerston:'tewls',katherine:'kwils',alice:'cawls',tennant:'cawls'}[region];if(local)ids=[local,'legal-aid'];}}
 } else if(topic==='parenting'){
  if(['parenting','school','childcare'].includes(n)){base('children',n);if(n==='childcare'&&a.careHours==='nonstandard')ids=inNT?['nt-inhome-care',...(serving?['childcare-connect']:[])]:['inhome-care-agencies'];if(n==='parenting'&&inNT)ids.push('catholiccare-parenting');}
  else if(n==='emergency-care'){
   ids=serving?['defence-emergency-care']:['parentline','territory-faces'];
   if(!inNT&&!serving)ids=['family-advice'];
   ids.push('dva-acute-support');
   say='An emergency means I cannot manage the children’s care. What practical help is available?';
  } else if(n==='learning'){
   ids=inNT&&a.schoolType==='government'?['school-inclusion',...(serving?['school-change']:[])]:serving?['school-change']:inNT?['territory-faces']:['wellbeing-agency'];say='My child needs extra support at school. Who can arrange an inclusion or learning-support discussion?';
   if(a.schoolType==='government'&&['darwin','palmerston'].includes(region)){
    ids=a.schoolHelp==='advocacy'?['student-advocacy-54reasons',...ids]:[...ids,'student-advocacy-54reasons'];
    if(a.schoolHelp==='advocacy')say='I would like independent help with a problem at my child’s school. Can you help our family understand the options and speak with the school?';
   }else if(a.schoolHelp==='advocacy'){note='The independent student advocacy programme listed here covers Darwin and Palmerston government schools. Ask the contacts below about an advocate or complaints pathway for your school.';}
  } else if(n==='development'){
   let local={darwin:'child-therapy-darwin',palmerston:'child-therapy-darwin',katherine:'child-therapy-katherine',alice:'child-therapy-central',tennant:'child-therapy-central',gove:'child-therapy-remote',remote:'child-therapy-remote'}[region];
   if(region==='remote')local={topend:'child-therapy-remote',bigrivers:'child-therapy-katherine',central:'child-therapy-central'}[a.remoteArea];
   ids=a.therapy==='eligible'&&local?[local,'ndis']:['ndis',...(inNT?[['alice','tennant'].includes(region)?'das-central':'disability-nt']:[])];
   say='I would like help with my child’s development and the services they can access.';
  } else if(n==='education-costs'){
   ids=serving?['defence-education']:a.connection==='former'||a.connection==='bereaved'?['dva-education']:['wellbeing-agency'];
   say='I would like to check what education assistance applies to my child and how to apply.';
  }
 } else if(topic==='money'){
  if(n==='youth-housing'){
   const youthAge=a.youthAge||'12-18';
   const outreach=['10-11','12-18','19-25'].includes(youthAge)?{katherine:'catholiccare-outreach-katherine',tennant:'catholiccare-outreach-tennant'}[region]:null;
   const reconnect=youthAge==='12-18'?{darwin:'reconnect-darwin',palmerston:'reconnect-palmerston',gove:'reconnect-arnhem'}[region]:null;
   const local=outreach||reconnect;
   ids=local?[local,'kids-helpline']:youthAge==='other'?[inNT?'housing-intake':'askizzy-housing']:['kids-helpline',inNT?'housing-intake':'askizzy-housing'];
   note='Youth outreach and ReConnect help prevent homelessness; they do not provide an overnight bed. For somewhere to stay tonight, choose that housing option.';
   say='A young person is leaving home or at risk of homelessness. What practical support is available?';
  }
  else if(n==='income'){
   ids=['payment-service-finder'];
   if(['member','partner','child'].includes(a.role)&&a.connection!=='unsure')ids.push('bravery-financial-aid');
   if(['member','partner'].includes(a.role)&&a.connection!=='unsure')ids.push('dva-income-support');
   moreIds.push('ndh');
   say='Our income has reduced and we are struggling with essential costs. What payments or financial assistance could we apply for?';
  }
  else if(['bills','essentials','housing','tonight','tenancy'].includes(n)){
   base('money',n);
   if(n==='bills'&&['member','partner','child'].includes(a.role)&&a.connection!=='unsure')ids=['bravery-financial','ndh'];
   if(n==='bills'&&region==='gove')ids=['east-arnhem-money-hub',...ids];
   if(n==='bills')preferenceLink={label:'Income has reduced or you need help paying essentials?',href:'#money/income'};
   if(n==='tonight'&&serving&&a.housingReason==='crisis')ids=['defence-safe',...ids];
  } else if(n==='defence-housing'){
   ids=serving?(a.housingTask==='home'?['dha-housing']:a.housingTask==='removal'?['toll-transitions']:['dmfs-helpline']):['wellbeing-agency'];
   say='I need help with housing or removal arrangements for a Defence posting.';
  } else if(n==='claims'){ids=inNT?['rsl-sa-nt-advocacy','dva']:['dva'];if(['darwin','palmerston'].includes(region))moreIds=['darwin-vfwc'];say='I would like help understanding and lodging a DVA claim.';}
  else if(n==='family-crisis'){
   ids=serving?['defence-emergency-care','dmfs-helpline','dva-acute-support']:['dva-acute-support','wellbeing-agency'];
   say=serving?'Our family is in a crisis and needs practical care support. Can a social worker help assess the options?':'I would like to check whether our family can access the DVA Acute Support Package.';
   note='The Acute Support Package has separate eligibility rules and can include some current-serving families. It is assessed support, not a general cash payment or automatic help with living costs.';
  }
 } else if(topic==='work'){
  if(n==='partner'){ids=fulltime&&a.partnerEmployment==='no'?['soldieron-work','peap']:['soldieron-work'];say='I am a Defence partner and would like help rebuilding my career or getting ready for work.';}
  else if(n==='study'){ids=['soldieron-work'];say='I would like to discuss education or training that could help me move into work.';}
  else {
   base('work',n);
   if(n==='transition'&&a.connection==='former'&&['recent','unsure'].includes(a.leftWhen)){
    const transition=inNT?'transition':'transition-national';
    ids=a.leftWhen==='recent'?[transition,'wellbeing-agency','soldieron-work']:['wellbeing-agency',transition,'soldieron-work'];
    note='Defence transition services may remain available for 24 months after separation. Ask the transition team which support still applies.';
   }
  }
 } else if(topic==='care'){
  if(n==='health'){
   base('care',n);
   if(a.healthFor==='member')ids=['adf-healthcare','adf-imsick','adf-allhours'];
   else if(a.healthFor==='family')ids=['healthdirect','adf-allhours'];
  }
  else if(n==='carer'){
   base('care',n);
   if(['yes','unsure'].includes(a.veteranCare))ids.push('dva-home-care','dva-household-care');
  }
  else if(n==='home-care'){
   ids=['yes','unsure'].includes(a.veteranCare)?['dva-home-care','dva-household-care','healthdirect']:a.homeCareAge==='older'?['aged-care','healthdirect']:['healthdirect','ndis'];
   say='I need help with daily tasks at home, such as personal care or housework. Which local services and funding options can I access?';
   note='Ask about the help needed and the programme’s eligibility before arranging care. You can ask for yourself or on someone else’s behalf.';
  }
  else if(n==='baby'){
   const nurse={darwin:'child-health-darwin',palmerston:'child-health-palmerston',katherine:'child-health-katherine',alice:'child-health-alice',tennant:'child-health-tennant',gove:'child-health-arnhem'}[region];
   ids=a.babyNeed==='wurli'&&region==='katherine'&&a.wurliClient==='yes'?['wurli-gus','pregnancy-baby']:a.babyNeed==='nurse'&&nurse?[nurse,'pregnancy-baby']:a.babyNeed==='young-parent'&&a.parentAge==='under25'&&['darwin','palmerston'].includes(region)?['pandanus','pregnancy-baby']:[{advice:'pregnancy-baby',feeding:'breastfeeding',emotional:'panda'}[a.babyNeed]||'pregnancy-baby'];
   say='I would like advice or support around pregnancy or caring for a new baby.';
  } else if(n==='disability'){
   const advocate=inNT?(['alice','tennant'].includes(region)?'das-central':'disability-nt'):'wellbeing-agency';
   ids=a.disabilityNeed==='ndis'?(a.ndisStatus==='older'?['aged-care',advocate]:['ndis',advocate]):a.disabilityNeed==='posting'&&serving?['defence-special-needs',advocate]:[advocate,'ndis'];
   say='I need help accessing disability support or resolving a problem with services.';
  } else if(n==='older'){
   ids=a.olderNeed==='alone'&&a.careFinderFit==='eligible'&&['darwin','palmerston','katherine','gove','alice'].includes(region)?['care-finder-nt','aged-care']:[{care:'aged-care',memory:'dementia-helpline',rights:'aged-advocacy'}[a.olderNeed]||'aged-care'];
   if(a.olderNeed==='care'&&['yes','unsure'].includes(a.veteranCare)){
    ids=a.veteranCare==='yes'?['dva-home-care','aged-care','dva-household-care']:['aged-care','dva-home-care','dva-household-care'];
   }
   say='I would like help finding or arranging the right care for an older person.';
  } else if(n==='travel'){
   const office={darwin:'patient-travel-darwin',palmerston:'patient-travel-darwin',katherine:'patient-travel-katherine',alice:'patient-travel-alice',tennant:'patient-travel-tennant',gove:'patient-travel-gove'}[region]||'patient-travel-offices';
   const memberTravel=fulltime&&a.role==='member';
   const familyTravel=fulltime&&['partner','child','other'].includes(a.role);
   if(memberTravel)ids=['defence-medical-enquiry'];
   else if(a.dvaTravel==='yes'){
    ids=['dva-treatment-travel','dva-booked-car'];
    note='DVA travel depends on the treatment covered by the patient’s Veteran Card and travel conditions. The NT PATS residence rule does not apply to this DVA route. Check approval before booking.';
   }
   else if(inNT&&a.ntResidence==='no'){
    ids=familyTravel?['defence-medical-travel',office]:[office,primaryNav];
    note='PATS usually requires six months of NT residence, so funding may not apply yet. Ask the Patient Travel Office about your referral and eligibility, and ask your treating team about travel planning or other support before booking.';noteBefore=true;
   }else if(inNT){ids=[['darwin','palmerston','katherine','alice','tennant','gove'].includes(region)?'pats-'+region:'pats-nt'];if(familyTravel)ids.push('defence-medical-travel');}
   else {ids=[primaryNav];note='Travel assistance depends on the state or territory. Ask your treating clinic or this navigation team to connect you with the relevant patient travel service.';}
   if(a.dvaTravel==='unsure'&&!memberTravel)moreIds.push('dva-treatment-travel');
   say='I need to travel for specialist treatment. I would like help understanding the referral, eligibility and travel options before booking.';
  } else if(n==='costs'){
   ids=fulltime&&a.role!=='member'&&a.dependant==='yes'?['adf-family-health','medicare-costs']:a.role==='member'&&a.connection==='former'?['dva','medicare-costs']:['medicare-costs'];
   if(fulltime&&a.role==='member')ids=['adf-healthcare','defence-medical-enquiry'];
   else if(a.role==='member'&&['former','reserve'].includes(a.connection)){ids=['dva','medicare-costs'];moreIds.push('dva-mental-treatment');}
   say='I would like to check what help is available with medical costs and what needs approval or registration.';
  }
 } else if(topic==='connection'){
  if(n==='migrant'){
   ids=['darwin','palmerston'].includes(region)?['ramss']:region==='alice'?['mcsca']:['wellbeing-agency'];say='I would like help settling in and connecting with my local community.';
  } else if(n==='defence-child'){
   ids=['defence-kids'];say='I would like to ask about activities for a child aged 8–18 affected by Defence family life, and whether the programme fits their situation.';
  } else if(n==='apart')base('moving','apart');
  else {const groups=region==='katherine'?'defence-groups-tindal':['darwin','palmerston'].includes(region)?'defence-groups-darwin':localOffice;ids=serving?[groups,'soldieron-connect']:['soldieron-connect','wellbeing-agency'];if(['darwin','palmerston'].includes(region)){if(['member','partner','child'].includes(a.role)&&a.connection!=='unsure')ids=['mates4mates-darwin',...ids];ids.push('mcnt-connection');}say='I would like to find local activities or groups where I can meet people.';}
 } else if(topic==='help'){ids=[primaryNav];say='I am not sure where to start. Can you help me work out which support fits my situation?';}
 ids=unique(ids);moreIds=unique([...ids.slice(3),...moreIds]).filter(id=>!ids.slice(0,3).includes(id));
 const selected=new Set(Array.isArray(a.preferences)?a.preferences:[]);
 const valid=new Set(preferencesFor(topic,a).map(p=>p.value));
 const preferenceGroups=[];
 if(valid.has('anonymous')&&selected.has('anonymous'))preferenceGroups.push({title:'Anonymous support',ids:['safe-zone'],note:'An additional option for emotional support about Defence life.'});
 if(valid.has('lgbtq')&&selected.has('lgbtq'))preferenceGroups.push({title:'LGBTIQA+ peer support',ids:['qlife'],note:'Peer support alongside the help for your original need.'});
 if(valid.has('men')&&selected.has('men'))preferenceGroups.push({title:'Counselling for men',ids:['mensline']});
 if(valid.has('indigenous')&&selected.has('indigenous')){
  preferenceGroups.push({title:'Aboriginal or Torres Strait Islander support',ids:n==='suicide-loss'?['thirrili','13yarn']:['13yarn'],note:n==='suicide-loss'?'Culturally appropriate support after suicide.':'13YARN is phone crisis support; it does not replace ongoing local care.',link:{label:'Find local Aboriginal-led wellbeing support',href:'#mental/indigenous'}});

 }
 if(valid.has('indigenous-legal')&&selected.has('indigenous-legal')&&inNT){
  const knownTopEnd=['darwin','palmerston','katherine','gove'].includes(region);
  const groups=region==='alice'?[{title:'Central Australia',ids:['caaflu-central']}]:region==='tennant'?[{title:'Barkly',ids:['caaflu-barkly']}]:knownTopEnd?[{title:'Top End and East Arnhem',ids:['naafls',...(['darwin','palmerston'].includes(region)?['daiws']:[])]}]:[{title:'Top End and East Arnhem',ids:['naafls']},{title:'Central Australia',ids:['caaflu-central']},{title:'Barkly',ids:['caaflu-barkly']}];
  for(const group of groups)preferenceGroups.push({...group,title:'Aboriginal-led support — '+group.title,note:'An optional contact. Check the service area and who it helps below; the main support contacts remain available.'});
 }

 return {ids:ids.slice(0,3),moreIds,note,say,noteBefore,contextLabel,preferenceGroups,preferenceLink};
}
const oldNeeds={1:['connection','settle'],2:['connection','apart'],3:['parenting','emergency-care'],4:['work','reserve'],5:['work','partner'],6:['money','bills'],7:['money','housing'],8:['money','defence-housing'],9:['parenting','childcare'],10:['parenting','childcare'],11:['care','baby'],12:['parenting','parenting'],13:['parenting','school'],14:['parenting','learning'],15:['mental','feelings'],16:['care','carer'],17:['relationships','counselling'],18:['relationships','separation'],19:['relationships','unsafe'],20:['mental','feelings'],21:['mental','feelings'],22:['mental','feelings'],23:['care','health'],24:['care','travel'],25:['care','disability'],26:['care','carer'],27:['care','older'],28:['connection','local'],29:['connection','local'],30:['help'],31:['mental','lgbtq'],32:['help'],33:['mental','private'],34:['help'],35:['help'],36:['help'],37:['work','transition'],38:['mental','practical-loss'],39:['mental','suicide-loss']};
export function legacyRoute(hash){
 const p=hash.replace(/^#/,'').split('/');let mapped;
 if(p[0]==='need')mapped=oldNeeds[p[1]];
 else if(p[0]==='situation')mapped={moving:['connection','settle'],apart:['connection','apart'],leaving:['work','transition'],concern:['home']}[p[1]];
 else mapped={talk:['mental'],children:['parenting'],moving:['connection'],connect:['connection'],safety:['relationships']}[p[0]];
 return mapped?{topicId:mapped[0],...(mapped[1]?{need:mapped[1]}:{})}:null;
}
