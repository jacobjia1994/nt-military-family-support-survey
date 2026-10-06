import {appearances, services, routeMatchesRegion} from './support-routing.mjs?v=20261006-continuous-final';
import {sharedYouthCandidates} from './support-discovery-candidates.mjs';

// Task associations are explicit. Partial discovery never enters the old
// questionnaire or its complete-answer matcher. Numbers identify programmes,
// while route IDs retain distinct offices and services sharing an intake.
const intents = {
 mental: {
  feelings:[[20,15,23,12],[100,109,30,68,27,119,62,65,63,64,57,70,20,87,102,66]],
  treatment:[[20,15,23,12],[27,100,50,109,30,68,62,65,63,64,21,57,70,20,87,102,66]],
  grief:[[38,20,15,12],[61,100,6,62,65,63,64,57,70,20,102,87]],
  'practical-loss':[[38],[55,84,47,124]], 'suicide-loss':[[39],[116,74,100,120]],
  addiction:[[41],[11,28,60,80]], 'distress-signs':[[21],[77,5,100]],
  'managing-stress':[[22],[100,109,119]], crisis:[[40],[133,74,5,92,100]],
  'nt-crisis':[[40],[92]], private:[[33],[112]], lgbtq:[[31],[105,100,131]],
  indigenous:[[30],[29,118,129,13,26,78]], men:[[20],[100,119]]
 },
 relationships: {
  counselling:[[17],[108,100,109]], separation:[[18],[59,73,100,40,131,54]],
  unsafe:[[19],[3,43,31,107,73,47]], refuge:[[19],[31,107,3,43]],
  assault:[[19],[96,3]], misconduct:[[19],[2,3]],
  'child-violence':[[19],[3,47]], legal:[[19],[73,94]]
 },
 parenting: {
  parenting:[[12],[102,17,23,25]], childcare:[[9,10],[24,98,99,141,113,67]],
  'emergency-care':[[10],[58,67,16]], 'moving-care':[[10],[140]],
  school:[[13],[34,44,95,23,40]], learning:[[13],[95,4,34]],
  development:[[12,25],[89,83,90]], 'education-costs':[[14],[33,48,34,95,4]],
  teenager:[[15],[62,65,63,64,21,57,70,20,92]]
 },
 money: {
  bills:[[6],[80,75,56,15]], income:[[6],[113,54,15,47]],
  essentials:[[6],[19,75,15,113]],
  housing:[[7],[117,126,127,69,122,106,86,137,138]],
  tonight:[[7,1],[117,126,127,69,122,106,43,86,40]],
  'losing-housing':[[7],[86,32]], 'stable-housing':[[7],[86,117,126,127,69,122,106]],
  'youth-housing':[[15,7],[12,86,70]], 'rent-assistance':[[7],[137,138,136]],
  tenancy:[[7],[32]], 'defence-housing':[[7],[39,136,40]],
  claims:[[42],[110,54]], 'family-crisis':[[3,45],[58,67]],
  'acute-support':[[6],[47]], 'home-ownership':[[7],[38]],
  budgeting:[[6],[8]], pets:[[8],[139,40,111]]
 },
 work: {
  job:[[5],[114,128,22]], study:[[43],[22,114,128,103,16]],
  partner:[[5],[103,114,128]], reserve:[[4],[10,37]],
  transition:[[37],[88,124,114,115,76,50,51]], rehabilitation:[[37],[51]],
  flexible:[[3],[37,35]]
 },
 care: {
  health:[[23],[66,1,9]], baby:[[11],[104,101,87,91]],
  disability:[[25],[90,83,45,46,89,4,39]],
  'home-care':[[45,27,25],[49,125,58,79,90,83]], carer:[[26],[16,124,47]],
  older:[[27],[79,125,81,97,16]], travel:[[24,23],[1,9,52,36,93]],
  costs:[[23,42],[7,1,9,54]], 'young-carer':[[16],[16,130,70]],
  'care-skills':[[26],[16,124,97,90]]
 },
 connection: {
  local:[[28],[41,42,72,76,115,14]], 'defence-child':[[15,29],[71,23]],
  settle:[[1,28],[40,41,42,23,134,35]], apart:[[2,17],[40,135,23,108,100,109,132,41,42]],
  migrant:[[30],[82,85,121,29,118,129,13,26,78]], language:[[30],[82,85,121]],
  recognition:[[29],[115,14,76,6,84,22]], 'family-info':[[32],[131,40,54,124,113,82,121,41,42]],
  'defence-aware':[[35],[100,124,76,40,35,53]], feedback:[[36],[35,53,124]],
  'new-entry':[[44],[40,6,23,41,42]], 'nt-preparedness':[[1],[134]],
  pastoral:[[29],[6]]
 },
 help:{default:[[34],[40,124]]}
};
const options = rows => rows.map(([value,label])=>({value,label}));
const select = (id,label,rows,hint) => ({id,label,type:'select',options:options([['','Not sure / leave open'],...rows]),...(hint?{hint}:{})});
const regionField=select('region','Area for local contacts',[
 ['darwin','Darwin'],['palmerston','Palmerston'],['katherine','Katherine / Tindal'],
 ['tennant','Tennant Creek / Barkly'],['alice','Alice Springs'],['gove','Nhulunbuy / East Arnhem'],
 ['remote','Another rural or remote NT community'],['outside','Outside the NT']
]);
const connectionField=select('connection','Defence connection',[
 ['serving','Currently serving full-time'],['reserve','Currently serving part-time Reserve'],
 ['former','Former member or their family'],['bereaved','Bereaved Defence or veteran family']
],'Full-time includes continuous full-time Reserve service. Part-time service does not tell us whether someone previously served full-time.');
const recipientField=select('recipient','Who needs support?',[
 ['member','The serving or former member'],['partner','Their partner'],['child','Their child'],['other','Another relative or carer']
]);
const compositionField=select('composition','Who needs accommodation?',[
 ['one','One person'],['couple','A couple without children'],['family','A household with children'],['other','Another household']
]);
const genderField=select('gender','Gender of the person needing support',[
 ['woman','Woman'],['man','Man'],['other','Another gender']
]);
const ageField=label=>({id:'age',label:label||'Age of the person needing support',type:'number',options:[],hint:'Age in whole years, if known. Leave blank to keep age-specific enquiries available.'});
const remoteAreas=['topend','bigrivers','barkly','central','eastarnhem','jabiru','nauiyu','wadeye','other'];
const known = (value,allowed) => allowed.includes(value)?value:'';
const ageOf = value => /^\d{1,3}$/.test(String(value??''))&&Number(value)<=120?Number(value):null;
function context(choice, refinements) {
 const seed=choice?.answers||{};
 const c={...seed,...refinements,need:choice?.need||'default'};
 c.connection=known(c.connection,['serving','reserve','former','bereaved']);
 c.recipient=known(refinements.recipient||refinements.role||seed.recipient||seed.role,['member','partner','child','other']);
 c.composition=known(c.composition,['one','couple','family','other']);
 c.gender=known(c.gender,['woman','man','other']);
 c.age=c.composition==='family'?null:ageOf(refinements.age); // Legacy task seeds never stand in for an exact age.
 if(c.composition==='family')c.gender='';
 c.region=known(c.region,['nt','darwin','palmerston','katherine','tennant','alice','gove','remote','outside',...remoteAreas.map(r=>'remote:'+r)]);
 return c;
}
function configuration(choice,c) {
 const topic=choice?.topicId||'help',n=c.need;
 let [issues,order]=intents[topic]?.[n]||intents.help.default;
 issues=[...issues];order=[...order];
 const s=choice?.answers||{};
 if(topic==='money'&&n==='defence-housing'){
  if(s.housingTask==='removal'){issues=[1];order=[123,40];}
  else if(s.housingTask==='other'){issues=[7,2];order=[132,40];}
 }
 if(topic==='connection'&&n==='apart'){
  if(s.absenceNeed==='support')order=[40,41,42,132];
  if(s.absenceNeed==='child')order=[135,23,40,41,42];
  if(s.absenceNeed==='relationship')order=[108,100,109];
 }
 if(topic==='mental'&&n==='addiction')order=s.addiction==='gambling'?[60,11,80]:s.addiction==='substances'?[11,28]:order;
 if(topic==='mental'&&n==='indigenous'){
  if(s.indigenousNeed==='loss'){issues=[39];order=[120,116,74];}
  if(s.indigenousNeed==='distress'){issues=[40];order=[74,92];}
 }
 if(topic==='relationships'&&n==='separation'&&s.separationHelp==='child-contact')order=[18,73];
 if(topic==='parenting'&&n==='parenting')order=s.parentingNeed==='indigenous-child'?[25,17,102]:[102,17,23];
 if(topic==='parenting'&&n==='childcare'){
  if(s.careHours==='nonstandard'){issues=[10];order=[67];}
  else if(s.careHours==='regular'){issues=[9];order=[24,98,99,141,113];}
 }
 if(topic==='parenting'&&n==='learning'&&c.schoolHelp==='advocacy')order=[4,34];
 if(topic==='money'&&n==='pets')order=s.petNeed==='care'?[111]:s.petNeed==='safe-exit'?[3,111,40,43]:[139,40,111];
 if(topic==='money'&&n==='losing-housing'&&c.housingRisk==='tenancy')order=[32,86];
 if(topic==='care'&&n==='baby')order={advice:[104],maternity:[91],nurse:[87,104],emotional:[101]}[s.babyNeed]||order;
 if(topic==='care'&&n==='health')order=s.healthFor==='member'?[1,9]:s.healthFor==='other'?[66]:order;
 if(topic==='care'&&n==='older')order={care:[79,125,16],memory:[81,16],rights:[97]}[s.olderNeed]||order;
 if(topic==='care'&&n==='disability')order={posting:[46,45],ndis:[83,90],advocacy:[90]}[s.disabilityNeed]||order;
 if(topic==='care'&&n==='care-skills')order={support:[16,124],'aged-rights':[97],'disability-rights':[90]}[c.carerSkillNeed]||order;
 if(topic==='care'&&n==='costs')order={member:[1,9],dependant:[7],veteran:[54],other:[66]}[c.healthFunding]||order;
 if(topic==='connection'&&['language','migrant'].includes(n))order={english:[121],aboriginal:[85],relay:[82],cultural:[29,118,129,13,26,78]}[s.languageNeed]||order;
 if(c.connection==='reserve'&&order.includes(109))order=[109,...order.filter(id=>id!==109)];
 if(['partner','child','other'].includes(c.recipient)&&order.includes(50))order=[...order.filter(id=>id!==50),50];
 if(['former','bereaved'].includes(c.connection)&&order.includes(124))order=[124,...order.filter(id=>id!==124)];
 if(c.age!==null&&c.age<=25&&['feelings','treatment','grief'].includes(n)){
  const youth=c.age<5?[102,87,66]:c.age<12?[70,20,102]:[62,65,63,64,57,70,20];
  order=[...youth.filter(id=>order.includes(id)),...order.filter(id=>!youth.includes(id))];
 }
 const ageLimit=choice?.answers?.age==='under18'?17:choice?.answers?.parentingNeed==='indigenous-child'?11:null;
 return {topic,n,issues,order,ageLimit};
}
function localMatch(row,c) {
 if(!c.region||c.region==='nt')return true;
 if(Number(row.catalogue_id)===9&&['darwin','larrakeyah','robertson','tindal'].includes(c.memberCentre))return true;
 if(Number(row.catalogue_id)===41&&c.region==='gove')return true; // Published area support includes Nhulunbuy.
 if(c.region.startsWith('remote:'))return routeMatchesRegion(row,'remote',{remoteArea:c.region.slice(7),need:c.need,schoolHelp:c.schoolHelp});
 if(c.region==='remote'&&!c.remoteArea&&!c.localCommunity)return remoteAreas.some(remoteArea=>routeMatchesRegion(row,'remote',{remoteArea,need:c.need,schoolHelp:c.schoolHelp}));
 return routeMatchesRegion(row,c.region,{remoteArea:c.remoteArea,localCommunity:c.localCommunity,need:c.need,schoolHelp:c.schoolHelp});
}
// false is a known programme exclusion; true includes qualification enquiries.
// Family/supporter access stays distinct from a programme's direct treatment.
function programmeAllows(row,c,config) {
 const id=Number(row.catalogue_id),k=row.route_id.split(':').at(-1),age=c.age;
 const isAgeKnown=age!==null;
 const outsideRange=(min,max)=>isAgeKnown?(age<min||age>max):(config.ageLimit!==null&&min>config.ageLimit);
 if(config.ageLimit!==null&&isAgeKnown&&age>config.ageLimit)return false;
 if(id===70&&outsideRange(5,25))return false;
 if([57,62,63,64,65,21].includes(id)&&outsideRange(12,25))return false;
 if(id===20&&isAgeKnown&&age>18)return false;
 if(id===87&&isAgeKnown&&age>5)return false;
 if(id===71&&outsideRange(8,18))return false;
 if(id===12&&outsideRange(12,18))return false;
 if(id===25&&isAgeKnown&&age>=12)return false;
 if(id===89&&(outsideRange(0,18)||c.therapy==='ndis'))return false;
 if([30,68,61,77].includes(id)&&outsideRange(18,120))return false;
 if(id===130&&outsideRange(12,25))return false;
 if(id===83&&c.ndisStatus!=='existing'&&isAgeKnown&&age>=65)return false;
 if(id===79&&isAgeKnown&&age<50)return false;
 if([117,69,122,106,126,127].includes(id)){
  if(isAgeKnown&&age<18)return false;
  if([117,69,122].includes(id)&&c.composition&&c.composition!=='one')return false;
  if(id===106&&(isAgeKnown&&age<25||['family','other'].includes(c.composition)))return false;
  const singleOver18=['07ec6e29adf9de37','167f3b07eed6b39a','334e107957a101b6'].includes(k);
  if(singleOver18&&(isAgeKnown&&age<=18||c.composition&&c.composition!=='one'))return false;
  if((id===122||k==='334e107957a101b6')&&c.gender&&c.gender!=='man')return false;
 }
 if(id===31&&(c.gender&&c.gender!=='woman'||c.composition&&c.composition!=='family'))return false;
 if(id===107&&c.gender){
  // WoSSCA explicitly includes non-binary clients; retain that pathway.
  if(k==='694a5e5d1c68fa51'){if(c.gender==='man')return false;}
  else if(c.gender!=='woman')return false;
 }
 if(id===94&&c.gender){
  if(k==='13722d39e8e31aa7'&&c.gender!=='woman')return false;
  if(k==='c2e53c43ae8ed5cf'&&c.gender==='man')return false;
  // KWILS includes gender-diverse clients: a broad gender answer cannot rule that out.
 }
 if(id===94&&c.legalIssue==='other')return false;
 if(id===94&&c.legalIssue==='migration'&&k!=='c2e53c43ae8ed5cf')return false;
 if([4,95].includes(id)&&c.schoolType==='other')return false;
 if(id===26&&c.congressFit==='no')return false;
 if(id===25&&c.indigenousChild==='no')return false;
 if(id===49&&['card','no'].includes(c.veteranCare))return false;
 if(id===125&&['condition','no'].includes(c.veteranCare))return false;
 if(id===109&&['serving','former','bereaved'].includes(c.connection))return false;
 if(id===109&&c.reserveThisYear==='no')return false;
 if(id===50&&(c.ownNlhcQualification==='no'||c.fullTimeService==='no'&&c.reserveNlhcPathway==='no'))return false;
 if(id===100&&c.openArmsPathway==='no')return false;
 if([1,9].includes(id)){
  if(['former','bereaved'].includes(c.connection))return false;
  if(c.recipient&&c.recipient!=='member')return false;
  if(config.topic==='care'&&config.n==='health'&&choiceHealthFor(c)==='other')return false;
 }
 if(id===9&&c.memberCentre){
  const suffix={darwin:'f1da0539f127b80d',larrakeyah:'3991d58873ccf7c3',robertson:'1abe21b2395e5ff6',tindal:'e567cf9371c84887'}[c.memberCentre];
  if(suffix&&k!==suffix)return false;
 }
 if(id===7){
  if(c.recipient==='member'||c.dependant==='no'||['reserve','former'].includes(c.connection))return false;
  if(c.connection==='bereaved'&&c.familyHealthContinuation==='no')return false;
 }
 if(id===46&&['reserve','former','bereaved'].includes(c.connection))return false;
 if(id===103){
  if(c.connection&&c.connection!=='serving')return false;
  if(c.recipient&&c.recipient!=='partner')return false;
  if(c.partnerEmployment==='yes')return false;
 }
 if([33,35,37,39,43,58,131,132,136].includes(id)&&['former','bereaved'].includes(c.connection))return false;
 if(id===43&&c.housingReason==='other')return false;
 if(id===88&&(c.connection==='bereaved'||c.leftWhen==='earlier'))return false;
 if(id===36){
  if(c.connection&&c.connection!=='serving')return false;
  if(c.recipient==='member'||c.remotePosting==='no'||c.accompaniedFamily==='no')return false;
 }
 if(id===52&&(c.dvaTravel==='no'||c.travelFunding==='no-dva'))return false;
 if(id===93&&(c.dvaTravel==='yes'||['dva','other'].includes(c.travelFunding)||c.otherTravelFunding==='yes'))return false;
 return true;
}
const choiceHealthFor=c=>c.healthFor;
function sourceService(id){return Object.values(services).find(s=>Number(s.appearance.catalogue_id)===id);}
function navigation(id,name,sourceRows,contactOptions) {
 const original=services[sourceRows[0].appearance_id];
 return {...original,id,routeId:id,name,area:id==='discovery:pats-offices'?'NT regional Patient Travel Offices':'Use your assigned Defence health centre',contact:'',
  sourceIds:sourceRows.map(r=>r.appearance_id),contactOptions,
  urls:contactOptions.map(action=>action.url),
  appearance:{...original.appearance,appearance_id:id,route_id:id},
  display:{...original.display,name,contact:'',urls:contactOptions.map(action=>action.url)}};
}
const patsRows=appearances.filter(r=>r.issue_number===24&&Number(r.catalogue_id)===93);
const memberRows=appearances.filter(r=>r.issue_number===23&&Number(r.catalogue_id)===9);
const patsNavigation=navigation('discovery:pats-offices','PATS – regional Patient Travel Offices',patsRows,patsRows.map(row=>({label:row.display.name,url:row.display.urls.find(u=>u.startsWith('tel:'))})));
const memberNavigation=navigation('discovery:member-centres','ADF garrison healthcare – find your assigned centre',memberRows,[{label:'Find Defence health centres',url:memberRows[0].display.urls.find(u=>u.includes('/garrison-health-centres'))}]);
const memberAdvice=sourceService(1);
const travelMemberNavigation={...memberNavigation,sourceIds:[memberAdvice.id,...memberNavigation.sourceIds],contactOptions:[...memberNavigation.contactOptions,{label:'Medical advice: 1800 IM SICK',url:memberAdvice.urls.find(u=>u.startsWith('tel:'))}]};
export const supplementalServices=Object.fromEntries(sharedYouthCandidates.map(({sourceRow,checked,contactOptions,sources})=>{
 const d=sourceRow.display,id=sourceRow.appearance_id;
 const urls=[...new Set(contactOptions.map(action=>action.href||action.url).filter(Boolean))];
 const actions=sourceRow.catalogue_id==='ywca-casy-house'?contactOptions.map(action=>action.channel==='email'?{...action,label:'Email the service (non-urgent)'}:action):contactOptions;
 return [id,{id,routeId:sourceRow.route_id,appearance:sourceRow,display:d,name:d.name,area:d.location,audience:d.who,offer:d.help,access:d.access,contact:d.contact,checked,urls,sources,contactOptions:actions,
  ...(sourceRow.catalogue_id==='ywca-casy-house'?{hours:'Crisis referrals 24/7',contactNotice:'Use the phone for urgent help; email is for non-urgent enquiries.'}:{}),
  sourceIds:[id],sourceCatalogueId:sourceRow.catalogue_id,sourceDataset:'homelessness',sourceRow}];
}));
const serviceIndex={...services,...supplementalServices,[patsNavigation.id]:patsNavigation,[memberNavigation.id]:memberNavigation};
function regionalYouthActions(service,c) {
 const prefix={darwin:'Darwin',palmerston:'Palmerston',katherine:'Katherine',alice:'Alice',gove:'Nhulunbuy'}[c.region];
 return service.contactOptions.filter(action=>{
  if(service.sourceCatalogueId!=='anglicare-yhopp'||action.channel!=='phone'||!prefix)return true;
  const digits=(action.href||action.url).replace(/\D/g,'');
  return service.contact.split('\n').some(line=>line.startsWith(prefix+' ')&&line.replace(/\D/g,'').includes(digits));
 }).map(action=>{
  if(action.channel!=='phone')return action;
  const digits=(action.href||action.url).replace(/\D/g,'');
  const line=service.contact.split('\n').find(line=>line.replace(/\D/g,'').includes(digits));
  return line?{...action,label:'Call '+line}:action;
 });
}
function sharedYouthAllows(service,c,n) {
 const catalogue=service.sourceCatalogueId;
 const [min,max]={'ywca-casy-house':[15,18],'asyass-crisis-refuge':[13,17],'asyass-youth-housing':[16,24],'anglicare-yhopp':[10,25]}[catalogue];
 if(c.age!==null&&(c.age<min||c.age>max))return false;
 if(['couple','family','other'].includes(c.composition))return false;
 if(!c.region||c.region==='nt')return true;
 const region=c.region==='palmerston'?'darwin':c.region==='gove'?'arnhem':c.region;
 return service.sourceRow.region_ids.includes(region);
}

export function discoveryFields(choice,refinements={}) {
 const c=context(choice,refinements),config=configuration(choice,c),{topic,n,issues,order}=config;
 const fields=[];
 const rows=appearances.filter(r=>issues.includes(r.issue_number)&&order.includes(Number(r.catalogue_id)));
 if(rows.some(r=>r.geography.rank>0)||order.some(id=>[9,90,93,96,107].includes(id)))fields.push({...regionField});
 const housing=topic==='money'&&['housing','tonight','stable-housing'].includes(n);
 const youthHousing=topic==='money'&&n==='youth-housing';
 if(housing){
  fields.push(compositionField);
  if(c.composition!=='family')fields.push(ageField(c.composition==='couple'?'Age of the youngest person in the couple':'Age of the person who needs accommodation'));
  if(!c.composition||c.composition==='one')fields.push(genderField);
  return fields;
 }
 if(youthHousing){fields.push(ageField('Age of the young person'));return fields;}
 if(topic==='relationships'&&['refuge','unsafe'].includes(n)){fields.push(compositionField);if(!c.composition||c.composition==='one')fields.push(genderField);return fields;}
 if(topic==='relationships'&&n==='legal'){fields.push(genderField,select('legalIssue','Legal problem',[['family-civil','Family or civil law'],['migration','Migration law'],['other','Another legal problem']]));return fields;}
 if(topic==='care'&&n==='travel'){
  fields.push(connectionField,recipientField,select('travelFunding','Funding for this treatment travel',[
   ['dva','Covered or claimable through DVA'],['other','Covered or claimable through insurance or another government scheme'],['no-dva','No DVA cover for this treatment']
  ],'PATS excludes costs covered or claimable through another scheme.'));
  return fields;
 }
 if(topic==='mental'&&['feelings','treatment','grief'].includes(n)){fields.push(ageField(),connectionField,recipientField);return fields;}
 if((topic==='parenting'&&['teenager','development'].includes(n))||(topic==='connection'&&n==='defence-child')||(topic==='care'&&n==='young-carer'))fields.push(ageField(n==='young-carer'?'Age of the unpaid carer':'Age of the child or young person'));
 if(topic==='parenting'&&n==='development')fields.push(select('therapy','Current child therapy support',[['eligible','Medicare and no NDIS support'],['ndis','Already receives NDIS support']]));
 if(topic==='care'&&n==='baby'&&choice.answers?.babyNeed==='nurse')fields.push(ageField('Age of the child'));
 if(topic==='care'&&n==='home-care')fields.push(select('veteranCare','DVA qualification for care at home',[['card','Gold or White Veteran Card'],['condition','DVA-accepted service-related condition'],['both','Both'],['no','Neither']]),ageField());
 if(topic==='care'&&n==='older'&&choice.answers?.olderNeed==='care')fields.push(select('veteranCare','Gold or White Veteran Card',[['card','Yes'],['no','No']]));
 if(topic==='care'&&n==='disability'&&choice.answers?.disabilityNeed==='ndis')fields.push(ageField(),select('ndisStatus','NDIS support',[['new','Seeking access for the first time'],['existing','Already an NDIS participant']]));
 if(topic==='parenting'&&['school','learning'].includes(n))fields.push(select('schoolType','School setting',[['government','NT government school'],['other','Another school']]));
 if(topic==='parenting'&&n==='learning')fields.push(select('schoolHelp','Help with school',[['learning','Learning or inclusion support'],['advocacy','Independent help with a school problem']]));
 if(topic==='work'&&n==='transition')fields.push(connectionField,select('leftWhen','When the member left Defence',[['recent','Within the last 24 months'],['earlier','More than 24 months ago']]));
 else if(topic==='work'&&n==='partner')fields.push(connectionField,select('partnerEmployment','Does the applicant partner also serve full-time?',[['yes','Yes'],['no','No']]));
 else if(topic==='care'&&n==='costs')fields.push(select('healthFunding','Treatment funding to check',[['member','Serving-member care'],['dependant','Recognised dependant of a permanent or continuous full-time member'],['veteran','DVA or Veteran Card treatment'],['other','Other treatment costs']]));
 else if(topic==='care'&&n==='health'&&choice.answers?.healthFor==='member')fields.push(select('memberCentre','Assigned Defence health centre',[['darwin','Darwin'],['larrakeyah','Larrakeyah'],['robertson','Robertson'],['tindal','Tindal']]));
 else if((topic==='relationships'&&n==='counselling')||(topic==='mental'&&n==='managing-stress')||(topic==='connection'&&n==='apart'&&choice.answers?.absenceNeed==='relationship'))fields.push(connectionField,recipientField);
 else if(order.some(id=>[7,33,35,37,39,43,46,58,103,109,131,132,136].includes(id))&&!fields.some(f=>f.id==='connection'))fields.push(connectionField);
 return fields;
}

export function discover(choice,refinements={}) {
 const c=context(choice,refinements),config=configuration(choice,c),{topic,n,issues,order}=config;
 const rows=appearances.filter(row=>issues.includes(row.issue_number)&&order.includes(Number(row.catalogue_id))&&localMatch(row,c)&&programmeAllows(row,c,config));
 const seen=new Set(),ordered=[];
 for(const id of order)for(const row of rows)if(Number(row.catalogue_id)===id&&!seen.has(row.route_id)){seen.add(row.route_id);ordered.push(row.appearance_id);}
 const wantsMember=order.includes(9),wantsPats=order.includes(93);
 const resultServices={...serviceIndex,...(topic==='care'&&n==='travel'?{[memberNavigation.id]:travelMemberNavigation}:{})};
 for(const service of Object.values(supplementalServices))resultServices[service.id]={...service,contactOptions:regionalYouthActions(service,c)};
 if(['partner','child','other'].includes(c.recipient))for(const id of Object.keys(resultServices))if(Number(resultServices[id].appearance.catalogue_id)===50)resultServices[id]={...resultServices[id],fitNote:'The person receiving treatment needs their own qualifying service; a relative’s Defence service does not provide this treatment funding.'};
 if(wantsMember&&!c.memberCentre&&memberRows.some(r=>programmeAllows(r,c,config))){
  for(let i=ordered.length-1;i>=0;i--)if(Number(serviceIndex[ordered[i]].appearance.catalogue_id)===9)ordered.splice(i,1);
  const after=ordered.findIndex(id=>Number(serviceIndex[id].appearance.catalogue_id)===1);
  ordered.splice(after<0?0:after+1,0,memberNavigation.id);
  if(topic==='care'&&n==='travel'){const advice=ordered.findIndex(id=>Number(serviceIndex[id].appearance.catalogue_id)===1);if(advice>=0)ordered.splice(advice,1);}
 }
 if(wantsPats&&(!c.region||c.region==='nt'||c.region==='remote'&&!c.remoteArea&&!c.localCommunity||c.region==='remote:other')&&patsRows.some(r=>programmeAllows(r,c,config))){
  const first=ordered.findIndex(id=>Number(serviceIndex[id].appearance.catalogue_id)===93);
  for(let i=ordered.length-1;i>=0;i--)if(Number(serviceIndex[ordered[i]].appearance.catalogue_id)===93)ordered.splice(i,1);
  ordered.splice(first<0?ordered.length:first,0,patsNavigation.id);
 }
 if(topic==='money'&&['housing','tonight','youth-housing','stable-housing','losing-housing'].includes(n)){
  const shared=Object.values(supplementalServices).filter(service=>sharedYouthAllows(service,c,n));
  const primary=shared.filter(service=>c.age!==null&&(c.age<18||n==='tonight'&&service.sourceCatalogueId==='ywca-casy-house'));
  ordered.unshift(...primary.map(service=>service.id));
  ordered.push(...shared.filter(service=>!primary.includes(service)).map(service=>service.id));
 }
 if(!c.region||c.region==='nt')ordered.sort((left,right)=>{
  const local=id=>id.startsWith('discovery:')?0:serviceIndex[id].appearance.geography?.rank>0?1:0;
  return local(left)-local(right);
 });
 // Keep the same regional records reachable under their navigation group.
 const groupedSourceIds=[];
 if(ordered.includes(memberNavigation.id))groupedSourceIds.push(...rows.filter(r=>Number(r.catalogue_id)===9).map(r=>r.appearance_id));
 if(ordered.includes(patsNavigation.id))groupedSourceIds.push(...rows.filter(r=>Number(r.catalogue_id)===93).map(r=>r.appearance_id));
 let note='',noteBefore=false;
 if(topic==='care'&&n==='travel')note='Check funding before booking. PATS is a subsidy and excludes costs covered or claimable through DVA, insurance or another government scheme. Your healthcare provider applies; approval is needed before booking.';
 if(topic==='money'&&['housing','tonight','stable-housing','losing-housing','youth-housing'].includes(n)){
  note='Ask the provider about assessment, fees and current vacancies. No bed or same-night admission is confirmed. NT Central Intake uses online referral during its telephone outage and handles non-urgent enquiries.';noteBefore=true;
 }
 if(topic==='mental'&&['crisis','nt-crisis'].includes(n)){note='In immediate danger or a life-threatening emergency, call 000.';noteBefore=true;}
 if(topic==='parenting'&&n==='learning'&&c.schoolHelp==='advocacy'&&ordered.some(id=>Number(serviceIndex[id].appearance.catalogue_id)===4)&&c.region&&!['darwin','palmerston'].includes(c.region))note='54 reasons is based in Darwin and Palmerston. Ask whether it can provide advice for your area; local advocacy is not confirmed.';
 if(config.ageLimit!==null&&c.age!==null&&c.age>config.ageLimit)note='This task is for a child '+(config.ageLimit===17?'under 18':'under 12')+'. Choose a different task for support at another age.';
 const firstCount=topic==='care'&&n==='travel'?4:3;
 return {ids:ordered.slice(0,firstCount),moreIds:ordered.slice(firstCount),allIds:[...new Set([...ordered,...groupedSourceIds])],servicesById:resultServices,note,noteBefore,say:'I need help with '+(choice?.title?.toLowerCase()||n.replace(/-/g,' '))+'. Can you check which support and costs apply to my circumstances?'};
}
