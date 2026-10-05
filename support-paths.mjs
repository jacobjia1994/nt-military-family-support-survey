import { verifiedResults } from './support-routing.mjs?v=20261005-1';
export const regions=[['darwin','Darwin'],['palmerston','Palmerston'],['katherine','Katherine / Tindal'],['tennant','Tennant Creek / Barkly'],['alice','Alice Springs'],['gove','Nhulunbuy / East Arnhem'],['remote','Other rural or remote NT community'],['outside','Outside the NT / moving to the NT']];
const opts = rows => rows.map(([value,label,detail])=>({value,label,...(detail?{detail}:{})}));
// No default helper prose. Reserve hints for distinctions needed to choose an answer.
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
 mental:[['feelings','Talk about stress, mood or mental health'],['treatment','Ongoing mental health treatment'],['grief','Grief after a death'],['practical-loss','Practical help after a death'],['suicide-loss','After a death by suicide'],['addiction','Alcohol, drugs or gambling'],['distress-signs','Recognising distress or learning how to help'],['managing-stress','Managing ongoing stress'],['crisis','Urgent mental-health crisis'],['private','Confidential or anonymous help'],['lgbtq','LGBTQIA+ inclusive support'],['indigenous','Aboriginal or Torres Strait Islander support']],
 relationships:[['counselling','Relationship counselling'],['separation','Separation or parenting arrangements'],['unsafe','Violence or feeling unsafe'],['refuge','A safe place to stay because of violence'],['assault','After sexual assault'],['misconduct','Defence-related sexual misconduct'],['child-violence','Support for a child affected by violence'],['legal','Legal advice']],
 parenting:[['parenting','Parenting or a child’s behaviour'],['childcare','Finding childcare'],['emergency-care','Urgent help caring for children'],['school','Starting or changing schools'],['learning','Learning or support at school'],['development','A child’s development or disability'],['education-costs','Help with education costs'],['teenager','Support for a teenager or young adult']],
 money:[['bills','Debt or bills'],['income','Income has dropped or stopped'],['essentials','Food or other essentials'],['housing','Finding or keeping housing'],['tonight','Nowhere to stay tonight'],['youth-housing','A young person is at risk of losing their home'],['rent-assistance','Help paying a private rental bond or advance rent'],['tenancy','A rent, bond or tenancy dispute'],['defence-housing','Defence housing or a posting move'],['claims','DVA claims or benefits'],['family-crisis','Practical help during a family crisis'],['pets','Pets during a move, care or a safe exit']],
 work:[['job','Finding work or changing career'],['study','Study or training'],['partner','Career support for a Defence partner'],['reserve','Balancing Reserve service with civilian work'],['transition','Leaving Defence or recently left'],['flexible','Work hours conflict with family care']],
 care:[['health','Medical advice or finding care'],['baby','Pregnancy or a new baby'],['disability','Disability support or advocacy'],['home-care','Help with daily tasks at home'],['carer','Support for an unpaid carer'],['older','Care as someone gets older'],['travel','Travel for medical treatment'],['costs','Help with healthcare costs'],['young-carer','A young person caring for someone'],['care-skills','Carer skills or having a say in care']],
 connection:[['local','Local groups and activities'],['defence-child','Activities for a Defence child (8–18)'],['settle','Getting connected after a move'],['apart','Family support during time apart'],['migrant','Language access or culturally safe support'],['language','Interpreting or help making a phone call'],['recognition','Meaningful activities or recognition'],['family-info','Information or benefits for family members'],['defence-aware','Services that understand Defence life'],['feedback','Family advocacy or feedback on services'],['new-entry','Supporting someone starting military life']]
};
const auxiliaryNeeds={private:'Anonymous support about Defence life',lgbtq:'LGBTIQA+ peer support',men:'Counselling for men (15 or older)',indigenous:'Aboriginal or Torres Strait Islander support'};
const ageQuestion=question('age','How old is the person needing support?',[
 ['0-4','Under 5'],['5-7','5–7'],['8-11','8–11'],['12-17','12–17'],['18','18'],['19-25','19–25'],['26+','26 or older']
]);
const childAgeQuestion=question('childAge','How old is the child or teenager?',[
 ['0-4','Under 5'],['5-11','5–11'],['12-17','12–17']
]);
const connectionQuestion=question('connection','What is the Defence connection?',[
 ['serving','Currently serving full-time','Including reservists on continuous full-time service; member or family.'],
 ['reserve','Part-time Reserve service','Member or family.'],['former','Former member or their family'],['bereaved','Bereaved Defence or veteran family'],['unsure','Another connection or not sure']
]);
const counsellingQuestion=question('counselling','Which best describes the person receiving support?',[
 ['serving','They currently serve full-time in the ADF'],['member','They previously served full-time in the ADF'],['partner','Their current partner has served full-time'],['child','Their parent has served full-time'],['reserve','Currently serving part-time Reserve member or their family'],['other','Former partner, former Reserve-only service, another relationship or not sure']
], 'Full-time service includes at least one day of continuous full-time service. Ordinary part-time Reserve training is different.');
const regionQuestion=question('region','Where is support needed?',regions);
const roleQuestion=question('role','Who is the support for?',[
 ['member','The serving or former member'],['partner','Their partner'],['child','Their child'],['other','Another relative or carer'],['unsure','Not sure']
]);
const childAges=['0-4','5-7','8-11','5-11','12-17'];
const youngerSchoolAge=age=>['5-7','8-11','5-11'].includes(age);
const youthAge=age=>['12-17','18','19-25','18-25'].includes(age);
const ageOf=a=>a.age==='under18'?a.childAge:a.age==='adult'?'26+':a.age;
const child=a=>a.age==='under18'||childAges.includes(ageOf(a));
const veteranCareQuestion=question('veteranCare','Does the person needing care have a Veteran Card or a DVA-accepted condition?',[
 ['yes','Yes'],['no','No'],['unsure','Not sure']
]);
export function questionsFor(topic,a={}) {
 const qs=[];if(topic!=='help')qs.push(question('need','What would help?',topic==='mental'&&auxiliaryNeeds[a.need]&&!needs.mental.some(item=>item[0]===a.need)?[...needs.mental,[a.need,auxiliaryNeeds[a.need]]]:needs[topic]||[]));
 const n=a.need;
 if(!n&&topic!=='help')return qs;
 if(topic==='mental'&&['feelings','treatment','grief'].includes(n)){
  // Legacy in-memory states remain readable; new visitors answer age once.
  const legacyLabel={under18:'Under 18','5-11':'5–11','18-25':'18–25',adult:'18 or older'}[a.age];
  qs.push(legacyLabel?{...ageQuestion,options:[...ageQuestion.options,{value:a.age,label:legacyLabel}]}:ageQuestion);
  if(a.age==='under18')qs.push(childAgeQuestion);
  if(a.age&&!child(a))qs.push(counsellingQuestion);
  if(n==='treatment'&&a.counselling==='reserve'&&!child(a))qs.push(roleQuestion);
  qs.push(regionQuestion);
  if(['feelings','treatment'].includes(n)&&child(a)&&a.region==='remote')qs.push(question('localCommunity','Which community is support needed in?',[['jabiru','Jabiru'],['wadeye','Wadeye'],['other','Another NT community']]));
 } else if(topic==='mental'&&n==='indigenous') {
  qs.push(question('indigenousNeed','What kind of support?',[['distress','Someone to talk to now'],['local','Local social and emotional wellbeing support'],['loss','After a suicide or traumatic death']]));
  if(a.indigenousNeed==='local'){qs.push(regionQuestion);if(a.region==='alice')qs.push(question('congressFit','Is the support for an Aboriginal person?',[['yes','Yes'],['other','No or not sure']]));}
 } else if(topic==='mental'&&n==='addiction') {
  qs.push(question('addiction','What is the concern?',[['substances','Alcohol or other drugs'],['gambling','Gambling']]));
 } else if(topic==='mental'&&n==='practical-loss') {
  qs.push(question('dvaClient','Was the person who died a DVA client?',[['yes','Yes'],['no','No'],['unsure','Not sure']]));
  qs.push(question('legacyFit','Which describes the family support enquiry?',[['eligible','A partner or child after a veteran’s service-related death or serious loss of health'],['other','Another situation or not sure']]));
  if(a.legacyFit==='eligible')qs.push(regionQuestion);
 } else if(topic==='relationships'){
  if(n==='separation')qs.push(question('separationHelp','What help do you need?',[['advice','Parenting, property or mediation advice'],['child-contact','Supervised visits or safer child changeovers']]));
  if(n==='counselling')qs.push(counsellingQuestion);
  if(n==='refuge')qs.push(question('refugeFor','Who needs a safe place?',[['woman-child','A woman with children in her care'],['woman','A woman without children'],['other','Someone else'],['unsure','Not sure']]));
  if(n==='child-violence')qs.push(question('childViolenceAge','How old is the person needing support?',[['0-12','12 or younger'],['13-17','13–17'],['18+','18 or older']]));
  if(n==='unsafe')qs.push(question('violenceSupport','Who would you like support from?',[['any','Any appropriate service'],['women','A service for women and children']]));
  if(n==='legal')qs.push(question('womenLegal','Would you like a gender-specific legal service?',[['yes','Yes — women or gender-diverse clients'],['no','No preference']],'Eligibility differs by provider. TEWLS supports women and non-binary people in Greater Darwin.'));
  if(n==='legal'&&a.womenLegal==='yes')qs.push(question('legalIssue','What is the legal problem?',[['family-civil','Family or civil law'],['migration','Migration law'],['other','Criminal, commercial or not sure']]));
  if(!['misconduct'].includes(n))qs.push(regionQuestion);
 } else if(topic==='parenting'){
  if(n==='parenting')qs.push(question('parentingNeed','What would help?',[['general','Parenting or a child’s behaviour'],['indigenous-child','Emotional or behavioural support for an Aboriginal child under 12']]));
  if(n==='teenager')qs.push(ageQuestion);
  if(['school','childcare','emergency-care','education-costs','learning'].includes(n))qs.push(connectionQuestion);
  if(n==='childcare')qs.push(question('careHours','What makes childcare difficult to find?',[['regular','Finding a regular place'],['nonstandard','Shift hours, isolation or complex needs']]));
  if(n==='learning')qs.push(question('schoolType','Which school setting?',[['government','NT government school'],['other','Another school or not sure']]));
  if(n==='learning'&&a.schoolType==='government')qs.push(question('schoolHelp','What would help most?',[['learning','Arranging learning or inclusion support'],['advocacy','Independent help with a school problem']]));
  if(n==='development')qs.push(question('therapy','Which applies to the child?',[
   ['eligible','Birth–18, with Medicare and no NDIS support'],['ndis','Already receives NDIS support'],['other','Another situation or not sure']
  ]));
  qs.push(regionQuestion);
  if(n==='development'&&['eligible','other'].includes(a.therapy)&&a.region==='remote')qs.push(question('remoteArea','Which NT region is the child in?',[['topend','Top End or East Arnhem'],['bigrivers','Katherine or Big Rivers'],['central','Central Australia or Barkly'],['unsure','Not sure']]));
 } else if(topic==='money'){
  if(['bills','income','housing','tonight','family-crisis','defence-housing','pets'].includes(n))qs.push(connectionQuestion);
  if(['bills','income'].includes(n))qs.push(roleQuestion);
  if(n==='youth-housing')qs.push(question('youthAge','How old is the young person?',[['10-11','10–11'],['12-18','12–18'],['19-25','19–25'],['other','Another age or not sure']]));
  if(['housing','tonight'].includes(n)&&['serving','reserve'].includes(a.connection))qs.push(question('housingReason','Why is accommodation needed?',[['crisis','A domestic crisis means we cannot stay at home'],['other','Another reason or not sure']]));
  if(['housing','tonight'].includes(n)){qs.push(question('accommodationFor','Who needs accommodation?',[['single-adult','One adult aged 18 or older'],['couple','A couple without children'],['household','A family with children'],['youth','Someone under 18'],['other','Another situation or not sure']]));if(['single-adult','couple'].includes(a.accommodationFor))qs.push(question('housingAge','How old are the adults who need accommodation?',[['18','18'],['19-24','All 19 or older, with someone under 25'],['25+','All 25 or older'],['unsure','Not sure']]));}
  if(n==='defence-housing'&&['serving','reserve'].includes(a.connection))qs.push(question('housingTask','Which part of the move?',[
   ['home','Service housing or rent allowance'],['removal','An approved Defence removal'],['other','Other posting or housing questions']
  ]));
  if(n!=='family-crisis')qs.push(regionQuestion);
  if(['housing','tonight'].includes(n)&&a.accommodationFor==='single-adult'&&['katherine','alice'].includes(a.region))qs.push(question('adultAccommodation','Is a men’s accommodation programme suitable?',[['men','Yes'],['other','No or not sure']]));
  if(n==='pets')qs.push(question('petNeed','What do you need help with?',[['move','A Defence-funded move'],['care','Pet care information'],['safe-exit','Pets while leaving an unsafe home']]));
  if(n==='essentials'&&a.region==='remote')qs.push(question('reliefCommunity','Which community is support needed in?',[['tiwi','Tiwi Islands'],['wadeye','Wadeye / Port Keats'],['other','Another NT community']]));
 } else if(topic==='work'){
  if(n==='flexible')qs.push(connectionQuestion);
  if(['partner','transition'].includes(n))qs.push(connectionQuestion);
  if(n==='transition'&&a.connection==='former')qs.push(question('leftWhen','When did they leave Defence?',[['recent','Within the last 24 months'],['earlier','More than 24 months ago'],['unsure','Not sure']]));
  if(n==='partner'&&a.connection==='serving')qs.push(question('partnerEmployment','Does the applicant partner also serve full-time?',[['no','No — civilian or part-time Reserve'],['yes','Yes'],['unsure','Not sure']]));
  if(n==='transition')qs.push(regionQuestion);
 } else if(topic==='care'){
  if(n==='young-carer')qs.push(question('carerAge','How old is the young carer?',[['under12','Under 12'],['12-25','12–25'],['26+','26 or older'],['unsure','Not sure']]));
  if(n==='health')qs.push(question('healthFor','Who needs healthcare?',[['member','A currently serving ADF member'],['family','A currently serving member’s family'],['other','Someone else or not sure']]));
  if(['carer','home-care'].includes(n))qs.push(veteranCareQuestion);
  if(n==='home-care'&&a.veteranCare==='no')qs.push(question('homeCareAge','Which describes the person needing help?',[
   ['older','65 or older; or 50+ if Aboriginal or Torres Strait Islander, homeless or at risk of homelessness'],['younger','Younger than these ages'],['unsure','Not sure']
  ]));
  if(n==='baby')qs.push(question('babyNeed','What support do you need?',[
    ['advice','Pregnancy, baby or parenting advice'],['nurse','A local child-health nurse (birth to 5)'],['young-parent','Local support for a young pregnant woman or young mum'],['feeding','Breastfeeding support'],['wurli','Aboriginal family support in Katherine: pregnancy to age 3'],['emotional','Emotional support around pregnancy or a new baby']
  ]));
  if(n==='baby'&&['nurse','young-parent','wurli'].includes(a.babyNeed))qs.push(regionQuestion);
  if(n==='baby'&&a.babyNeed==='wurli'&&a.region==='katherine')qs.push(question('wurliClient','Is the family registered with Wurli?',[['yes','Yes'],['other','No or not sure']]));
  if(n==='baby'&&a.babyNeed==='young-parent')qs.push(question('parentAge','Which describes the parent?',[['under25','A pregnant woman or mum under 25'],['pregnant25','Pregnant and aged 25'],['other','Another situation or not sure']]));
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
  if(n==='travel'&&!(a.connection==='serving'&&a.role==='member'))qs.push(question('dvaTravel','Does the patient have a Veteran Card that covers this treatment?',[['yes','Yes'],['no','No'],['unsure','Not sure']]));
  if(['health','disability','travel','costs'].includes(n))qs.push(regionQuestion);
  if(n==='travel'&&a.dvaTravel!=='yes'&&a.region&&a.region!=='outside')qs.push(question('ntResidence','Has the patient usually lived in the NT for at least six months?',[['yes','Yes'],['no','No'],['unsure','Not sure']]));
  if(n==='costs'&&a.connection==='serving'&&a.role!=='member')qs.push(question('dependant','Are they a recognised Defence dependant?',[['yes','Yes'],['no','No'],['unsure','Not sure']]));
 } else if(topic==='connection') {if(!['migrant','language','defence-child'].includes(n))qs.push(connectionQuestion);qs.push(regionQuestion);if(['local','settle'].includes(n)&&['darwin','palmerston'].includes(a.region))qs.push(roleQuestion);}
 else if(topic==='help') {qs.push(connectionQuestion);}
 if(topic==='care'&&((n==='health'&&a.healthFor==='member')||(['travel','costs'].includes(n)&&a.connection==='serving'&&a.role==='member'))&&['darwin','palmerston'].includes(a.region))qs.push(question('memberCentre','Which assigned health centre do you use?',[['darwin','Darwin Health Centre'],['larrakeyah','Larrakeyah Health Centre'],['robertson','Robertson Health Centre'],['unsure','Not sure']]));
 if(topic==='mental'&&['crisis','managing-stress'].includes(n))qs.push(regionQuestion);
 if(topic==='mental'&&['distress-signs','managing-stress'].includes(n))qs.push(counsellingQuestion);
 if(topic==='connection'&&['language','migrant'].includes(n))qs.push(question('languageNeed','What access help would you like?',[['english','An interpreter for another language'],['aboriginal','An Aboriginal language interpreter'],['relay','Help with a call because of hearing or speech difficulties'],['cultural','Local First Nations wellbeing support']]));
 if(a.region==='remote'&&!qs.some(q=>['remoteArea','localCommunity','reliefCommunity'].includes(q.id))&&['parenting','mental','care','connection'].includes(topic)&&regionModeFor(topic,a)==='full')qs.push(question('remoteArea','Which area is support needed in?',[['topend','Other Top End'],['bigrivers','Katherine / Big Rivers communities'],['barkly','Barkly'],['central','Central Australia'],['eastarnhem','East Arnhem'],['jabiru','Jabiru'],['nauiyu','Nauiyu'],['wadeye','Wadeye'],['other','Another community or not sure']]));
 const regionMode=regionModeFor(topic,a);
 const filtered=qs.filter(q=>q.id!=='region'||regionMode!=='none').filter(q=>q.id!=='ntResidence'||!(topic==='care'&&n==='travel'&&a.connection==='serving'&&a.role==='member'));
 return filtered.map(q=>q.id==='region'&&regionMode==='jurisdiction'?question('region','Is support needed in the Northern Territory?',[['nt','Northern Territory'],['outside','Outside the NT']]):q);
}

// Region is only requested when it changes a service or access requirement.
export function regionModeFor(topic,a={}) {
 const n=a.need, serving=['serving','reserve'].includes(a.connection);
 if(topic==='mental') {
  if(n==='grief'&&a.age&&!child(a))return 'none';
  if(n==='grief'&&youngerSchoolAge(ageOf(a)))return 'jurisdiction';
  if(n==='practical-loss')return a.legacyFit==='eligible'?'jurisdiction':'none';
  if(n==='crisis')return 'jurisdiction';
  if(n==='managing-stress')return 'jurisdiction';
  return ['feelings','treatment','grief'].includes(n)||(n==='indigenous'&&a.indigenousNeed==='local')?'full':'none';
 }
 if(topic==='relationships') {
  if(n==='separation'&&a.separationHelp==='child-contact')return 'full';
  if(n==='misconduct'||(n==='unsafe'&&a.violenceSupport==='any')||(n==='child-violence'&&a.childViolenceAge!=='0-12'))return 'none';
  if(['counselling','separation'].includes(n)||(n==='legal'&&!(a.womenLegal==='yes'&&['family-civil','migration'].includes(a.legalIssue))))return 'jurisdiction';
  return 'full';
 }
 if(topic==='parenting') {
  if(n==='childcare'&&a.careHours==='regular')return 'full';
  if(n==='education-costs'||(n==='emergency-care'&&serving))return 'none';
  return ['development','learning','parenting','teenager'].includes(n)?'full':'jurisdiction';
 }
 if(topic==='money'&&n==='defence-housing')return a.housingTask==='removal'?'none':'full';
 if(topic==='money')return ['income','family-crisis','defence-housing','pets'].includes(n)?'none':['tenancy','rent-assistance'].includes(n)?'jurisdiction':'full';
 if(topic==='work')return n==='transition'&&(serving||(a.connection==='former'&&['recent','unsure'].includes(a.leftWhen)))?'jurisdiction':'none';
 if(topic==='care') {
  if((n==='health'&&a.healthFor==='member')||(['travel','costs'].includes(n)&&a.connection==='serving'&&a.role==='member'))return 'full';
  if(n==='costs'||(n==='travel'&&(a.dvaTravel==='yes'||(a.connection==='serving'&&a.role==='member'))))return 'none';
  return (n==='health'&&a.healthFor!=='member')||['disability','travel'].includes(n)||(n==='older'&&a.olderNeed==='alone')||(n==='baby'&&['nurse','young-parent','wurli'].includes(a.babyNeed))?'full':'none';
 }
 if(topic==='connection'&&n==='language')return a.languageNeed==='cultural'?'full':'none';
 return topic==='connection'&&!['defence-child','family-info','feedback','defence-aware'].includes(n)?'full':'none';
}

export function preferencesFor(topic,a={}) {
 if(topic==='relationships')return [];
 if(topic!=='mental'||!['feelings','treatment','grief','suicide-loss','addiction'].includes(a.need))return [];
 const result=[{value:'anonymous',label:'Anonymous military-aware support'},{value:'lgbtq',label:'LGBTQIA+ peer support'}];

 return result;
}

export function getResults(topic,a={}) {return verifiedResults(topic,a);}
const oldNeeds={1:['connection','settle'],2:['connection','apart'],3:['parenting','emergency-care'],4:['work','reserve'],5:['work','partner'],6:['money','bills'],7:['money','housing'],8:['money','defence-housing'],9:['parenting','childcare'],10:['parenting','childcare'],11:['care','baby'],12:['parenting','parenting'],13:['parenting','school'],14:['parenting','learning'],15:['mental','feelings'],16:['care','carer'],17:['relationships','counselling'],18:['relationships','separation'],19:['relationships','unsafe'],20:['mental','feelings'],21:['mental','feelings'],22:['mental','feelings'],23:['care','health'],24:['care','travel'],25:['care','disability'],26:['care','carer'],27:['care','older'],28:['connection','local'],29:['connection','local'],30:['help'],31:['mental','lgbtq'],32:['help'],33:['mental','private'],34:['help'],35:['help'],36:['help'],37:['work','transition'],38:['mental','practical-loss'],39:['mental','suicide-loss']};
export function legacyRoute(hash){
 const p=hash.replace(/^#/,'').split('/');let mapped;
 if(p[0]==='need')mapped=oldNeeds[p[1]];
 else if(p[0]==='situation')mapped={moving:['connection','settle'],apart:['connection','apart'],leaving:['work','transition'],concern:['home']}[p[1]];
 else mapped={talk:['mental'],children:['parenting'],moving:['connection'],connect:['connection'],safety:['relationships']}[p[0]];
 return mapped?{topicId:mapped[0],...(mapped[1]?{need:mapped[1]}:{})}:null;
}
