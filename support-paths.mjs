import { matchSupport as baseMatch } from './support-model.mjs?v=20260926-2';
import { regions as legacyRegions } from './support-model.mjs?v=20260926-2';
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
 mental:[['feelings','Stress, mood or mental health'],['grief','Grief after a death'],['practical-loss','Practical help after a death'],['suicide-loss','After a death by suicide'],['private','Anonymous support about Defence life'],['lgbtq','LGBTIQA+ peer support'],['men','Counselling for men (15 or older)'],['indigenous','Aboriginal or Torres Strait Islander support'],['addiction','Alcohol, drugs or gambling']],
 relationships:[['counselling','Relationship counselling'],['separation','Separation or parenting arrangements'],['unsafe','Violence or feeling unsafe'],['refuge','A safe place to stay because of violence'],['assault','After sexual assault'],['misconduct','Defence-related sexual misconduct'],['child-violence','Support for a child affected by violence'],['legal','Legal advice']],
 parenting:[['parenting','Parenting or a child’s behaviour'],['childcare','Finding childcare'],['emergency-care','Urgent help caring for children'],['school','Starting or changing schools'],['learning','Learning or support at school'],['development','A child’s development or disability'],['education-costs','Help with education costs']],
 money:[['bills','Debt, bills or reduced income'],['essentials','Food or other essentials'],['housing','Finding or keeping housing'],['tonight','Nowhere to stay tonight'],['youth-housing','A young person aged 12–18 is leaving home or at risk'],['tenancy','A rent, bond or tenancy problem'],['defence-housing','Defence housing or a posting move'],['claims','DVA claims or benefits'],['family-crisis','Practical help during a family crisis']],
 work:[['job','Finding work or changing career'],['study','Study or training'],['partner','Career support for a Defence partner'],['reserve','Balancing Reserve service with civilian work'],['transition','Preparing for life after Defence']],
 care:[['health','Medical advice or finding care'],['baby','Pregnancy or a new baby'],['disability','Disability support or advocacy'],['carer','Support for an unpaid carer'],['older','Care as someone gets older'],['travel','Travel for medical treatment'],['costs','Help with family health costs']],
 connection:[['local','Local groups and activities'],['settle','Getting connected after a move'],['apart','Family support during time apart'],['migrant','Migrant or refugee settlement support']]
};
const ageQuestion=question('age','How old is the person needing support?',[
 ['26+','26 or older'],['18-25','18–25'],['under18','Under 18']
], 'Choose the age of the person who will receive the support.');
const childAgeQuestion=question('childAge','How old is the child or teenager?',[
 ['0-4','Under 5'],['5-11','5–11'],['12-17','12–17']
], 'These age limits decide which children’s services can help.');
const connectionQuestion=question('connection','What is the Defence connection?',[
 ['serving','Currently serving full-time','Including reservists on continuous full-time service; member or family.'],
 ['reserve','Part-time Reserve service','Member or family.'],['former','Former member or their family'],['bereaved','Bereaved Defence or veteran family'],['unsure','Another connection or not sure']
]);
const counsellingQuestion=question('counselling','Which best describes the person receiving support?',[
 ['member','They have served full-time in the ADF'],['partner','Their current partner has served full-time'],['child','Their parent has served full-time'],['reserve','Currently serving part-time Reserve member or their family'],['other','Former Reserve-only service, another relationship, or not sure']
], 'Full-time service includes at least one day of continuous full-time service or training.');
const regionQuestion=question('region','Where is support needed?',regions,'For a move, choose the destination if it is known.');
const roleQuestion=question('role','Who is the support for?',[
 ['member','The serving or former member'],['partner','Their partner'],['child','Their child'],['other','Another relative or carer'],['unsure','Not sure']
]);
export function questionsFor(topic,a={}) {
 const qs=[];if(topic!=='help')qs.push(question('need','What would help?',needs[topic]||[]));
 const n=a.need;
 if(!n&&topic!=='help')return qs;
 if(topic==='mental'&&['feelings','grief'].includes(n)){
  qs.push(ageQuestion);if(a.age==='under18')qs.push(childAgeQuestion);
  if(a.age && a.age!=='under18')qs.push(counsellingQuestion);
  qs.push(regionQuestion);
 } else if(topic==='mental'&&n==='indigenous') {
  qs.push(question('indigenousNeed','What kind of support?',[['distress','Someone to talk to now'],['local','Local social and emotional wellbeing support'],['loss','After a suicide or traumatic death']]));
  if(a.indigenousNeed==='local')qs.push(regionQuestion);
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
  if(n==='learning')qs.push(question('schoolType','Which school setting?',[['government','NT government school'],['other','Another school or not sure']]));
  if(n==='development')qs.push(question('therapy','Which applies to the child?',[
   ['eligible','Under 18, has Medicare and is not on NDIS'],['ndis','Already receives NDIS support'],['other','Another situation or not sure']
  ],'NT children’s therapy has these entry requirements. Other support remains available.'));
  qs.push(regionQuestion);
  if(n==='development'&&a.therapy==='eligible'&&a.region==='remote')qs.push(question('remoteArea','Which NT region is the child in?',[['topend','Top End or East Arnhem'],['bigrivers','Katherine or Big Rivers'],['central','Central Australia or Barkly'],['unsure','Not sure']]));
 } else if(topic==='money'){
  if(['bills','tonight','family-crisis','defence-housing'].includes(n))qs.push(connectionQuestion);
  if(n==='bills')qs.push(roleQuestion);
  if(n==='tonight'&&['serving','reserve'].includes(a.connection))qs.push(question('housingReason','Why is accommodation needed?',[['crisis','A domestic crisis means we cannot stay at home'],['other','Another reason or not sure']]));
  if(n==='defence-housing')qs.push(question('housingTask','Which part of the move?',[
   ['home','Service housing or rent allowance'],['removal','An approved Defence removal'],['other','Other posting or housing questions']
  ]));
  if(n!=='family-crisis')qs.push(regionQuestion);
 } else if(topic==='work'){
  if(['partner','transition'].includes(n))qs.push(connectionQuestion);
  if(n==='partner'&&a.connection==='serving')qs.push(question('partnerEmployment','Does the applicant partner also serve full-time?',[['no','No — civilian or part-time Reserve'],['yes','Yes, or not sure']]));
  if(n==='transition')qs.push(regionQuestion);
 } else if(topic==='care'){
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
  if(['costs','travel'].includes(n)){qs.push(connectionQuestion);if(n==='costs'||a.connection==='serving')qs.push(roleQuestion);}
  if(['disability','travel','costs'].includes(n))qs.push(regionQuestion);
  if(n==='travel'&&a.region&&a.region!=='outside')qs.push(question('ntResidence','Has the patient usually lived in the NT for at least six months?',[['yes','Yes'],['no','No'],['unsure','Not sure']], 'This affects NT patient travel assistance. Your healthcare provider must arrange the application.'));
  if(n==='costs'&&a.connection==='serving'&&['partner','child'].includes(a.role))qs.push(question('dependant','Are they a recognised Defence dependant?',[['yes','Yes'],['no','No or not sure']]));
 } else if(topic==='connection') {if(n!=='migrant')qs.push(connectionQuestion);if(['local','settle'].includes(n))qs.push(roleQuestion);qs.push(regionQuestion);}
 else if(topic==='help') {qs.push(connectionQuestion);}
 return qs;
}
const unique=ids=>[...new Set(ids.filter(Boolean))];
export function getResults(topic,a={}) {
 const n=a.need,region=a.region||'remote',inNT=region!=='outside',age=a.age==='under18'?a.childAge:a.age;
 const serving=['serving','reserve'].includes(a.connection),fulltime=a.connection==='serving';
 const c={...a,region,age,connection:serving?'serving':a.connection};
 const localOffice=region==='katherine'?'dmfs-tindal':['darwin','palmerston','alice'].includes(region)?'dmfs-darwin':'dmfs-helpline';
 const primaryNav=serving?'dmfs-helpline':'wellbeing-agency';
 let ids=[],moreIds=[],note='',say='I would like help working out the next step.';
 function base(task,focus){const r=baseMatch({...c,task,focus});ids=r.ids;note=r.note;say=r.say;}
 if(topic==='mental'){
  if(['feelings','grief'].includes(n)){
   base('talk',n);
   if(a.counselling==='other'&&a.age!=='under18')moreIds.push('open-arms-check');
   if(age==='0-4'){const nurse={darwin:'child-health-darwin',palmerston:'child-health-palmerston',katherine:'child-health-katherine',alice:'child-health-alice',tennant:'child-health-tennant',gove:'child-health-arnhem'}[region];ids=nurse?[nurse,'parentline','healthdirect']:['healthdirect',...(inNT?['parentline']:[])];note='For a young child, start with a child-health nurse or health advice to work out assessment and referral needs. Parentline is support for the parent or carer.';}
   if(a.counselling==='reserve'&&a.age!=='under18'){ids=['reserve-counselling',...ids.filter(id=>id!=='open-arms')];}
  } else if(n==='practical-loss'){
   ids=a.dvaClient==='yes'?['dva-bereavement','wellbeing-agency']:['wellbeing-agency'];
   if(a.legacyFit==='eligible'&&inNT)ids=a.dvaClient==='yes'?['dva-bereavement','legacy-nt']:['legacy-nt','wellbeing-agency'];
   say='Someone in our Defence or veteran family has died. I need help with practical next steps and possible family entitlements.';
  } else if(n==='suicide-loss')base('talk','suicide-loss');
  else if(n==='private'){ids=['safe-zone'];say='I would like to talk about what is happening without giving my name.';}
  else if(n==='men'){ids=['mensline'];say='I would like to talk with a counsellor about emotional, family or relationship concerns.';}
  else if(n==='lgbtq'){ids=['qlife'];say='I would like to talk with an LGBTIQA+ peer supporter.';}
  else if(n==='indigenous'){ids=a.indigenousNeed==='loss'?['thirrili','13yarn']:a.indigenousNeed==='local'&&region==='katherine'?['wurli-sewb','13yarn']:a.indigenousNeed==='local'&&['darwin','palmerston'].includes(region)?['danila-dilba','13yarn']:['13yarn'];say='I would like Aboriginal or Torres Strait Islander support for myself or my family.';}
  else if(n==='addiction'){ids=[a.addiction==='gambling'?'gambling-help':'alcohol-drug-chat'];say='I would like support with my own or someone else’s alcohol, drug or gambling concerns.';}
 } else if(topic==='relationships'){
  if(n==='counselling'){base('talk','relationship');if(a.counselling==='reserve')ids=['reserve-counselling','family-advice'];}
  else if(n==='refuge'){
   const local={darwin:'dawn-shelter',palmerston:'dawn-shelter',katherine:'kwcc',alice:'wossca',tennant:'tennant-refuge'}[region];
   ids=['woman','woman-child'].includes(a.refugeFor)&&local&&(!['darwin','palmerston'].includes(region)||a.refugeFor==='woman-child')?[local,'respect']:['respect'];
   note='If someone is in immediate danger, call 000. Use a safer device if this one may be monitored. Ask about vacancies and any accommodation charges.';
   say='I need somewhere safe because of violence. Can you help with safe accommodation now?';
  } else if(n==='child-violence'){ids=a.childViolenceAge==='0-12'&&['darwin','palmerston'].includes(region)?['safe-reconnected','parentline']:a.childViolenceAge==='13-17'?['kids-helpline','respect']:['respect'];say='I would like help for a child affected by family violence.';}
  else if(n==='misconduct'){ids=['sempro'];say='I would like to understand my support options after Defence-related sexual misconduct.';}
  else {base('safety',n);if(n==='unsafe'&&a.violenceSupport==='women'&&['darwin','palmerston'].includes(region))ids.push('dawn-counselling');if(n==='legal'&&a.womenLegal==='yes'&&a.legalIssue==='family-civil'&&inNT){const local={darwin:'tewls',palmerston:'tewls',katherine:'kwils',alice:'cawls',tennant:'cawls'}[region];if(local)ids=[local,'legal-aid'];}}
 } else if(topic==='parenting'){
  if(['parenting','school','childcare'].includes(n))base('children',n);
  else if(n==='emergency-care'){
   ids=serving?['defence-emergency-care']:['parentline','territory-faces'];
   if(!inNT&&!serving)ids=['family-advice'];
   say='An emergency means I cannot manage the children’s care. What practical help is available?';
  } else if(n==='learning'){
   ids=inNT&&a.schoolType==='government'?['school-inclusion',...(serving?['school-change']:[])]:serving?['school-change']:inNT?['territory-faces']:['wellbeing-agency'];say='My child needs extra support at school. Who can arrange an inclusion or learning-support discussion?';
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
  if(n==='youth-housing'){const local={darwin:'reconnect-darwin',palmerston:'reconnect-palmerston',gove:'reconnect-arnhem'}[region];ids=local?[local,'kids-helpline']:['kids-helpline',inNT?'housing-intake':'askizzy-housing'];note='ReConnect helps prevent homelessness; it does not provide an overnight bed. For somewhere to stay tonight, choose that housing option.';say='A young person is leaving home or at risk of homelessness. What practical support is available?';}
  else if(['bills','essentials','housing','tonight','tenancy'].includes(n)){
   base('money',n);
   if(n==='bills'&&['member','partner','child'].includes(a.role)&&a.connection!=='unsure')ids=['bravery-financial','ndh'];
   if(n==='tonight'&&serving&&a.housingReason==='crisis')ids=['defence-safe',...ids];
  } else if(n==='defence-housing'){
   ids=serving?(a.housingTask==='home'?['dha-housing']:a.housingTask==='removal'?['toll-transitions']:['dmfs-helpline']):['wellbeing-agency'];
   say='I need help with housing or removal arrangements for a Defence posting.';
  } else if(n==='claims'){ids=['dva'];if(['darwin','palmerston'].includes(region))moreIds=['darwin-vfwc'];say='I would like help understanding and lodging a DVA claim.';}
  else if(n==='family-crisis'){
   ids=serving?['defence-emergency-care','dmfs-helpline']:['dva-acute-support','wellbeing-agency'];
   say=serving?'Our family is in a crisis and needs practical care support. Can a social worker help assess the options?':'I would like to check whether our family can access the DVA Acute Support Package.';
   if(!serving)note='This is an eligibility enquiry for an assessed package. It is not a general cash payment or automatic help with living costs.';
  }
 } else if(topic==='work'){
  if(n==='partner'){ids=fulltime&&a.partnerEmployment==='no'?['soldieron-work','peap']:['soldieron-work'];say='I am a Defence partner and would like help rebuilding my career or getting ready for work.';}
  else if(n==='study'){ids=['soldieron-work'];say='I would like to discuss education or training that could help me move into work.';}
  else base('work',n);
 } else if(topic==='care'){
  if(n==='health'||n==='carer')base('care',n);
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
   say='I would like help finding or arranging the right care for an older person.';
  } else if(n==='travel'){
   ids=inNT?[['darwin','palmerston','katherine','alice','tennant','gove'].includes(region)?'pats-'+region:'pats-nt']:['healthdirect'];const familyTravel=fulltime&&['partner','child'].includes(a.role);
   if(a.ntResidence==='no')ids=fulltime?[familyTravel?'defence-medical-travel':'defence-medical-enquiry']:['medicare-costs'];else if(fulltime){if(familyTravel)ids.push('defence-medical-travel');else ids=['defence-medical-enquiry'];}
   say='I need to travel for specialist treatment. What assistance could apply before I book?';
  } else if(n==='costs'){
   ids=fulltime&&['partner','child'].includes(a.role)&&a.dependant==='yes'?['adf-family-health','medicare-costs']:a.role==='member'&&a.connection==='former'?['dva','medicare-costs']:['medicare-costs'];
   say='I would like to check what help is available with medical costs and what needs approval or registration.';
  }
 } else if(topic==='connection'){
  if(n==='migrant'){
   ids=['darwin','palmerston'].includes(region)?['ramss']:['wellbeing-agency'];say='I would like help settling in and connecting with my local community.';
  } else if(n==='apart')base('moving','apart');
  else {const groups=region==='katherine'?'defence-groups-tindal':['darwin','palmerston'].includes(region)?'defence-groups-darwin':localOffice;ids=serving?[groups,'soldieron-connect']:['soldieron-connect','wellbeing-agency'];if(['darwin','palmerston'].includes(region)){if(['member','partner','child'].includes(a.role)&&a.connection!=='unsure')ids=['mates4mates-darwin',...ids];ids.push('mcnt-connection');}say='I would like to find local activities or groups where I can meet people.';}
 } else if(topic==='help'){ids=[primaryNav];say='I am not sure where to start. Can you help me work out which support fits my situation?';}
 ids=unique(ids);moreIds=unique([...ids.slice(3),...moreIds]).filter(id=>!ids.slice(0,3).includes(id));
 return {ids:ids.slice(0,3),moreIds,note,say};
}
const oldNeeds={1:['connection','settle'],2:['connection','apart'],3:['parenting','emergency-care'],4:['work','reserve'],5:['work','partner'],6:['money','bills'],7:['money','housing'],8:['money','defence-housing'],9:['parenting','childcare'],10:['parenting','childcare'],11:['care','baby'],12:['parenting','parenting'],13:['parenting','school'],14:['parenting','learning'],15:['mental','feelings'],16:['care','carer'],17:['relationships','counselling'],18:['relationships','separation'],19:['relationships','unsafe'],20:['mental','feelings'],21:['mental','feelings'],22:['mental','feelings'],23:['care','health'],24:['care','travel'],25:['care','disability'],26:['care','carer'],27:['care','older'],28:['connection','local'],29:['connection','local'],30:['help'],31:['mental','lgbtq'],32:['help'],33:['mental','private'],34:['help'],35:['help'],36:['help'],37:['work','transition'],38:['mental','practical-loss'],39:['mental','suicide-loss']};
export function legacyRoute(hash){
 const p=hash.replace(/^#/,'').split('/');let mapped;
 if(p[0]==='need')mapped=oldNeeds[p[1]];
 else if(p[0]==='situation')mapped={moving:['connection','settle'],apart:['connection','apart'],leaving:['work','transition'],concern:['home']}[p[1]];
 else mapped={talk:['mental'],children:['parenting'],moving:['connection'],connect:['connection'],safety:['relationships']}[p[0]];
 return mapped?{topicId:mapped[0],...(mapped[1]?{need:mapped[1]}:{})}:null;
}
