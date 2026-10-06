import {verifiedDefence} from './support-verified-data.mjs?v=20261006-content-scope-1';

export const issues=verifiedDefence.issues;
export const appearances=issues.flatMap(issue=>issue.rows.map(row=>({...row,issue_number:issue.issue_number,issue_id:issue.issue_id,issue_title:issue.title,issue_scope:issue.scope||issue.note||''})));
export const appearanceById=Object.fromEntries(appearances.map(row=>[row.appearance_id,row]));
export const regionLabels={nt:'NT-wide',darwin:'Darwin / Palmerston',palmerston:'Palmerston',katherine:'Katherine / Tindal',tennant:'Tennant Creek / Barkly',alice:'Alice Springs',gove:'Nhulunbuy / East Arnhem',remote:'Other rural or remote NT community',outside:'Outside the NT'};
export const needIssueMap={
 mental:{feelings:[20],treatment:[20,23],grief:[38],'practical-loss':[38],'suicide-loss':[39],addiction:[41],'distress-signs':[21],'managing-stress':[22],crisis:[40],'nt-crisis':[40],private:[33],lgbtq:[31],indigenous:[30],men:[20]},
 relationships:{counselling:[17],separation:[18],unsafe:[19],refuge:[19],assault:[19],misconduct:[19],'child-violence':[19],legal:[19]},
 parenting:{parenting:[12],childcare:[9,10],'emergency-care':[10],'moving-care':[10],school:[13],learning:[13],development:[12,25],'education-costs':[14],teenager:[15]},
 money:{bills:[6],income:[6],essentials:[6],housing:[7],'losing-housing':[7],'stable-housing':[7],tonight:[7],'youth-housing':[15,7],'rent-assistance':[7],tenancy:[7],'defence-housing':[7],claims:[42],'family-crisis':[3,45],'acute-support':[6],'home-ownership':[7],budgeting:[6],pets:[8]},
 work:{job:[5],study:[43],partner:[5],reserve:[4],transition:[37],rehabilitation:[37],flexible:[3]},
 care:{health:[23],baby:[11],disability:[25],'home-care':[45],carer:[26],older:[27],travel:[24],costs:[23],'young-carer':[16],'care-skills':[26]},
 connection:{local:[28],'defence-child':[15,29],settle:[1,28],apart:[2],migrant:[30],language:[30],recognition:[29],'family-info':[32],'defence-aware':[35],feedback:[36],'new-entry':[44],'nt-preparedness':[1],pastoral:[29]},help:{default:[34]}
};
const effectiveAge=a=>a.age==='under18'?a.childAge:a.age;
export function issueNumbersFor(topic,a={}) {
 const age=effectiveAge(a);
 if(topic==='care'&&a.need==='costs'&&a.healthFunding==='veteran')return [42];
 if(topic==='connection'&&a.need==='apart'&&a.absenceNeed==='relationship')return [2,17];
 if(topic==='mental'&&a.need==='grief'&&['0-4','5-7','8-11','5-11','12-17'].includes(age))return age==='0-4'?[12,20,23]:[15,20];
 if(topic==='care'&&a.need==='travel'&&a.connection==='serving'&&a.role==='member')return [23];
 if(topic==='money'&&a.need==='defence-housing'&&a.housingTask==='removal')return [1];
 if(topic==='mental'&&a.need==='indigenous'&&a.indigenousNeed==='loss')return [39];
 if(topic==='mental'&&a.need==='indigenous'&&a.indigenousNeed==='distress')return [40];
 if(topic==='mental'&&['feelings','treatment'].includes(a.need)&&age==='0-4')return [12,20,23];
 if(topic==='mental'&&['feelings','treatment'].includes(a.need)&&['5-7','8-11','5-11','12-17','18','19-25'].includes(age))return [15,20];
 if(topic==='care'&&a.need==='home-care'&&a.veteranCare==='no')return a.homeCareAge==='older'?[27]:[25];
 if(topic==='parenting'&&a.need==='childcare')return a.careHours==='nonstandard'?[10]:[9];
 return needIssueMap[topic]?.[a.need||'default']||[];
}
const rankRegions={1:['darwin','palmerston'],2:['katherine'],3:['tennant'],4:['alice']};
// Sort rank describes presentation order; these explicit exceptions describe catchments.
// Route identity is retained where several programmes share a provider or intake phone.
const catchments={
 '871892f9aff57db9':['darwin','palmerston','alice'],
 'a433ac808876aa83':['darwin','palmerston','katherine'],
 'f1da0539f127b80d':['darwin'],
 '3991d58873ccf7c3':['darwin'],
 '1abe21b2395e5ff6':['palmerston'],
 'e567cf9371c84887':['katherine'],
 '32b153860445cd85':['palmerston'],
 '79b37fafc9305b8f':['darwin'],
 '8fa1f175fb04eeef':['palmerston'],
 'c5c87f09959b2a25':['darwin'],
 '3c02e328b008d64a':['palmerston'],
 '0bda232eebea7dd4':['katherine'],
 'b6d483baaeb96cc7':['alice','tennant','remote:central','remote:barkly'],
 '020f06d781fd82ac':['alice','tennant','remote:central','remote:barkly'],
 '13722d39e8e31aa7':['alice','tennant','remote:central','remote:barkly'],
 '50ca4676f5c57bbb':['darwin','palmerston','katherine','gove','remote:topend','remote:bigrivers','remote:eastarnhem','remote:jabiru','remote:nauiyu','remote:wadeye'],
 'de412c4ade15f8be':['nt'],
 '6303f73c8ef528c2':['nt'],
 'f32e3ef781933db9':['darwin','palmerston'],
 '07ec6e29adf9de37':['darwin','palmerston'],
 '167f3b07eed6b39a':['darwin','palmerston'],
 '018e8b62817abdbe':['darwin','palmerston'],
 '6e1eb3d7aca3090e':['darwin','palmerston'],
 '1aa7afc005e252dd':['alice','remote:central'],
 '7b008a62e73a2118':['darwin','palmerston'],
 '526f363f0701239f':['katherine','remote:bigrivers'],
 '72643e2611ee1bf3':['gove','remote:topend','remote:eastarnhem','remote:jabiru','remote:nauiyu','remote:wadeye'],
 'aa41a63b4ce93fa1':['gove','remote:eastarnhem'],
 'b5e59d212db862f3':['gove','remote:eastarnhem'],
 '16ceec286732be79':['gove','remote:eastarnhem'],
 '24ee00327b40817c':['gove','remote:eastarnhem'],
 '802c4e71844926a7':['gove','remote:eastarnhem'],
 'f902113f3c47e8aa':['gove','remote:eastarnhem'],
 '6b1b295e9082137a':['remote:jabiru'],
 '8182c1d4dd285de3':['remote:nauiyu'],
 'edad6efe3282734a':['remote:wadeye'],
 '8deffd339f79470b':['remote:jabiru'],
 '99e1a06abaa620a7':['remote:wadeye'],
 '12f4ab465645d379':['remote:bigrivers'],
 'f39d4d6365052850':['katherine'],
 '43f4471ff780691f':['alice','remote:central'],
 '0587c4eb5c79647a':['tennant','remote:barkly'],
 'dcb9b6e94564311e':['gove','remote:eastarnhem'],
 'b1c335f6688cbb4f':['darwin','palmerston','remote:topend','remote:jabiru','remote:nauiyu','remote:wadeye'],
 '0962bf4dcd5d1e7b':['katherine','remote:bigrivers'],
 'e7487c16abb896f5':['tennant','remote:barkly'],
 '5782663d93592519':['alice','remote:central']
};
// National programmes and telephone/online pathways whose published scope applies outside NT.
// NT intake, regional service routes and NT-specific public information are deliberately excluded.
const national=new Set([1,2,3,5,6,7,8,10,14,15,16,23,24,33,34,36,37,38,40,43,45,46,47,48,49,50,51,52,53,54,55,57,58,60,61,66,70,71,74,77,79,80,81,82,83,97,100,101,103,104,105,109,112,113,114,115,121,124,125,128,130,131,132,133,136,137,138,139,140,141,123,135]);
export function routeMatchesRegion(row,region='',a={}) {
 if(!region)return true; // An unfiltered detail browser makes no regional recommendation.
 if(Number(row.catalogue_id)===9&&['darwin','palmerston'].includes(region)&&a.memberCentre&&a.memberCentre!=='unsure'){const assigned={darwin:'f1da0539f127b80d',larrakeyah:'3991d58873ccf7c3',robertson:'1abe21b2395e5ff6'}[a.memberCentre];return row.route_id.endsWith(assigned||'unmatched');}
 if(region==='outside')return row.geography.rank===0&&national.has(Number(row.catalogue_id));
 const token=region==='remote'?'remote:'+(a.localCommunity&&a.localCommunity!=='other'?a.localCommunity:a.remoteArea||'other'):region;
 const rules=catchments[row.route_id.split(':').at(-1)];
 if(rules)return rules.includes('nt')||rules.includes(token);
 if(row.geography.rank===0)return true;
 return (rankRegions[row.geography.rank]||[]).includes(region);
}
const adultAges=new Set(['18','19-25','18-25','26+','adult']);
const childAges=new Set(['0-4','5-7','8-11','5-11','12-17','under18']);
const over18=new Set(['19-24','25+']);
const keyOf=row=>row.route_id.split(':').at(-1);
export function qualifies(row,a={},topic='') {
 const id=Number(row.catalogue_id),n=a.need,age=a.age==='under18'?a.childAge:a.age;
 const serving=['serving','reserve'].includes(a.connection)||['serving','reserve'].includes(a.counselling);
 const knownFormer=['former','bereaved'].includes(a.connection)||a.counselling==='member';
 if([33,46].includes(id)&&a.connection==='reserve')return false;
 if([24,33,35,37,39,43,46,58,131,132,136,139,140].includes(id)&&knownFormer)return false;
 if(id===109&&!['reserve','other',undefined].includes(a.counselling)&&a.connection!=='reserve')return false;
 if(id===103&&a.connection&&a.connection!=='serving')return false;
 if(id===103&&a.partnerEmployment==='yes')return false;
 if(id===7&&(a.dependant==='no'||a.role==='member'||a.connection&&a.connection!=='serving'))return false;
 if([1,9].includes(id)&&a.healthFor&&a.healthFor!=='member')return false;
 if(id===9&&a.role&&a.role!=='member')return false;
 if(id===9&&a.memberCentre==='unsure')return false;
 if(id===9&&a.memberCentre&&a.memberCentre!=='unsure'){const assigned={darwin:'f1da0539f127b80d',larrakeyah:'3991d58873ccf7c3',robertson:'1abe21b2395e5ff6'}[a.memberCentre];if(keyOf(row)!==assigned)return false;}
 if(id===26&&a.congressFit==='other')return false;
 if(id===25&&a.parentingNeed!=='indigenous-child')return false;
 if(id===88&&a.connection==='former'&&a.leftWhen==='earlier')return false;
 if([49,125].includes(id)&&a.veteranCare==='no')return false;
 if(id===93&&a.dvaTravel==='yes')return false;
 if(id===52&&a.dvaTravel==='no')return false;
 if(id===36&&(a.connection!=='serving'||a.role==='member'||a.remotePosting==='no'))return false;
 if(id===61&&age&&childAges.has(age))return false;
 if(id===50&&(['partner','child'].includes(a.counselling)||(a.counselling==='reserve'&&a.role&&a.role!=='member')))return false;
 if(id===88&&a.connection==='bereaved')return false;
 if(id===77&&age&&childAges.has(age))return false;
 if([30,68].includes(id)&&age&&childAges.has(age))return false;
 if(id===87&&age&&age!=='0-4')return false;
 if(id===20&&age&&adultAges.has(age)&&age!=='18')return false;
 if([57,62,63,64,65,21].includes(id)&&age&&!['12-17','18','19-25','18-25'].includes(age))return false;
 if(id===70&&age&&!['5-7','8-11','5-11','12-17','18','19-25','18-25'].includes(age))return false;
 if(id===71&&age&&!['8-11','12-17','18'].includes(age))return false;
 if(id===12&&a.youthAge&&a.youthAge!=='12-18')return false;
 if(id===130&&a.carerAge&&a.carerAge!=='12-25'&&a.carerAge!=='unsure')return false;
 if([4,95].includes(id)&&(a.schoolType&&a.schoolType!=='government'))return false;
 if(id===89&&a.therapy==='ndis')return false;
 if(id===83&&a.ndisStatus==='older')return false;
 if(id===94&&a.womenLegal==='no')return false;
 if(id===94&&a.legalIssue==='other')return false;
 if(id===94&&a.legalIssue==='migration'&&keyOf(row)!=='c2e53c43ae8ed5cf')return false;
 if([31,107].includes(id)&&a.refugeFor&&!['woman','woman-child','unsure'].includes(a.refugeFor))return false;
 if([106,117,122,126,127,69].includes(id)) {
  if(!['housing','tonight'].includes(n))return false;
  const who=a.accommodationFor,age=a.housingAge,k=keyOf(row);
  if(['other','youth'].includes(who)||!who)return false;
  if([117,69,122].includes(id)&&who!=='single-adult')return false;
  if(id===106&&(!['single-adult','couple'].includes(who)||age!=='25+'))return false;
  if(['07ec6e29adf9de37','167f3b07eed6b39a'].includes(k)&&(who!=='single-adult'||!over18.has(age)))return false;
  if(k==='334e107957a101b6'&&(who!=='single-adult'||a.adultAccommodation!=='men'||!over18.has(age)))return false;
  if(id===122&&a.adultAccommodation!=='men')return false;
 }
 if(id===43&&['housing','tonight'].includes(n)&&a.housingReason!=='crisis')return false;
 if([31,107].includes(id)&&topic==='money')return false;
 return true;
}
const choices={
 mental:{feelings:[30,68,100,119,27],treatment:[27,100,50,30,68],grief:[61,100,6],'practical-loss':[55,84,47,124],'suicide-loss':[116,74,100],addiction:[11,28],'distress-signs':[77],'managing-stress':[119,100,109],crisis:[133,74,5], 'nt-crisis':[92],private:[112],lgbtq:[105],indigenous:[29,118,129,13,26,78],men:[100,119]},
 relationships:{counselling:[108,100,109],separation:[59,73,100,40,131],unsafe:[3],refuge:[31,107,3,43],assault:[96,3],misconduct:[2,3],legal:[94,73],'child-violence':[3]},
 parenting:{parenting:[17,102,23],childcare:[98,99,24,141],'emergency-care':[58,67],'moving-care':[140],school:[34,44,95,23],learning:[95,4,34],development:[89,83,90],'education-costs':[33,48,34],teenager:[62,63,64,65,21,57,70]},
 money:{bills:[75,56,80,15],income:[113,54,15],essentials:[19,75,15,113],housing:[86,117,126,127,69,122,106,137,138],'losing-housing':[86],'stable-housing':[86],tonight:[43,117,126,127,69,122,106,86],'youth-housing':[12,70,86],'rent-assistance':[137,138,136],tenancy:[32],'defence-housing':[39,136],claims:[110,54,76],'family-crisis':[58],'acute-support':[47],'home-ownership':[38],budgeting:[8],pets:[139,111,40]},
 work:{job:[114,128,22],study:[22,114,128],partner:[103,114,128],reserve:[10,37],transition:[88,124,114,115,76],rehabilitation:[51],flexible:[37]},
 care:{health:[66],baby:[104],disability:[90,83,45,46],'home-care':[49,125],carer:[16,124],older:[79,125],travel:[93,52,36],costs:[7],'young-carer':[130,16,70],'care-skills':[16,97,90,124]},
 connection:{local:[41,42,72,76,115,14],'defence-child':[71,23],settle:[41,42,40],apart:[40],migrant:[82,85,121,29,118,129,13,26,78],language:[82,85,121],recognition:[115,14,76],'family-info':[131,40,54,124,113],'defence-aware':[100,124,76,40],feedback:[35,53],'new-entry':[40],'nt-preparedness':[134],pastoral:[6]},help:{default:[40,124]}
};
function selectedPriorities(topic,a) {
 const n=a.need,age=effectiveAge(a);let ids=[...(choices[topic]?.[n||'default']||[])];
 if(topic==='mental'&&['feelings','treatment'].includes(n)) {
  if(childAges.has(age)||['18','19-25','18-25'].includes(age))ids=age==='0-4'?[87,102,66]:[62,63,64,65,21,20,57,70,100];
  else if(a.counselling==='reserve')ids=[109,...ids];
  else if(a.counselling==='other')ids=[30,68,27,119,...ids.filter(id=>id!==50)];
  else if(n==='treatment')ids=['serving','member'].includes(a.counselling)?[50,100,27,30,68]:[100,27,30,68];
  else if(['serving','member','partner','child'].includes(a.counselling))ids=[100,30,68,119,27];
 }
 if(topic==='mental'&&n==='grief'&&childAges.has(age))ids=age==='0-4'?[102,87]:[62,63,64,65,20,70,57];
 if(topic==='mental'&&n==='practical-loss'&&a.legacyFit==='other')ids=[55,47,124];
 if(topic==='mental'&&n==='addiction')ids=a.addiction==='gambling'?[60,11,80]:[11,28];
 if(topic==='mental'&&n==='managing-stress')ids=a.counselling==='reserve'?[109,119]:a.counselling==='other'?[119]:[100,119];
 if(topic==='mental'&&n==='indigenous'&&a.indigenousNeed==='loss')ids=[120,116,74];
 if(topic==='mental'&&n==='indigenous'&&a.indigenousNeed==='distress')ids=[74,92];
 if(topic==='relationships'&&n==='separation'&&a.separationHelp==='child-contact')ids=[18,73];
 if(topic==='relationships'&&n==='counselling'&&a.counselling==='reserve')ids=[109,108];
 if(topic==='relationships'&&n==='counselling'&&a.counselling==='other')ids=[108,100];
 if(topic==='parenting'&&n==='parenting'&&a.parentingNeed==='indigenous-child')ids=[25,17,102];
 if(topic==='money'&&n==='defence-housing')ids=a.housingTask==='removal'?[123,40]:a.housingTask==='other'?[132,40]:[39,136,40];
 if(topic==='money'&&n==='tonight'&&!['serving','reserve'].includes(a.connection))ids=ids.filter(id=>id!==43);
 if(topic==='money'&&n==='pets')ids=a.petNeed==='safe-exit'?[3,111,40]:a.petNeed==='care'?[111]:[139,40,111];
 if(topic==='money'&&n==='losing-housing'&&a.housingRisk==='tenancy')ids=[32,86];
 if(topic==='money'&&n==='family-crisis'&&['former','bereaved','unsure'].includes(a.connection))ids=[];
 if(topic==='parenting'&&n==='childcare'&&a.careHours==='nonstandard')ids=[67];
 if(topic==='parenting'&&n==='emergency-care'&&a.connection!=='serving')ids=[67];
 if(topic==='parenting'&&n==='learning'&&a.schoolHelp==='advocacy')ids=[4,95,34];
 if(topic==='parenting'&&n==='education-costs'&&['former','bereaved'].includes(a.connection))ids=[48,34];
 if(topic==='care'&&n==='home-care'&&a.veteranCare==='no')ids=a.homeCareAge==='older'?[79]:[90,83];
 if(topic==='care'&&n==='health')ids=a.healthFor==='member'?[9,1]:[66];
 if(topic==='care'&&n==='baby')ids={emotional:[101],nurse:[87,104],maternity:[91],advice:[104]}[a.babyNeed]||ids;
 if(topic==='care'&&n==='older')ids={memory:[81],rights:[97],care:[79,125]}[a.olderNeed]||ids;
 if(topic==='care'&&n==='disability')ids=a.disabilityNeed==='posting'?[46,45]:a.disabilityNeed==='ndis'?[83,90]:[90];
 if(topic==='care'&&n==='travel'){
  if(a.dvaTravel==='yes')ids=[52];
  else if(a.connection==='serving'&&a.role==='member')ids=[9,1];
  else if(a.connection==='serving'&&a.remotePosting==='yes')ids=[36,93];
  else if(a.dvaTravel==='unsure')ids=[93,52];
  else ids=[93];
 }
 if(topic==='care'&&n==='costs')ids={member:[9,1],dependant:[7],veteran:[54],other:[]}[a.healthFunding]||ids;
 if(topic==='connection'&&['language','migrant'].includes(n))ids={english:[121],aboriginal:[85],relay:[82],cultural:[29,118,129,13,26,78]}[a.languageNeed]||ids;
 if(topic==='connection'&&n==='apart')ids={support:[40],child:[135,23,40],relationship:a.counselling==='reserve'?[109,108]:[108,100]}[a.absenceNeed]||ids;
 if(topic==='connection'&&n==='settle'&&['former','bereaved'].includes(a.connection))ids=[40];
 if(topic==='connection'&&n==='local'&&['former','bereaved'].includes(a.connection))ids=[72,76,115,14];
 if(topic==='connection'&&n==='family-info'&&['former','bereaved'].includes(a.connection))ids=[54,124,113];
 if(topic==='connection'&&n==='feedback')ids=['former','bereaved'].includes(a.connection)?[53]:a.connection==='unsure'?[35,53]:[35];
 if(topic==='help'&&['former','bereaved','unsure'].includes(a.connection))ids=[124,40];
 return ids;
}
export function verifiedResults(topic,a={}) {
 if(topic==='care'&&a.need==='costs')a={...a,...({member:{connection:'serving',role:'member'},dependant:{connection:'serving',role:'other',dependant:'yes'},veteran:{connection:'former'}}[a.healthFunding]||{})};
 const issueNumbers=issueNumbersFor(topic,a),wanted=selectedPriorities(topic,a),region=a.region||'nt';
 const matching=appearances.filter(row=>issueNumbers.includes(row.issue_number)&&wanted.includes(Number(row.catalogue_id))&&routeMatchesRegion(row,region,a)&&qualifies(row,a,topic));
 const seen=new Set();const rows=[];
 for(const id of wanted)for(const row of matching)if(Number(row.catalogue_id)===id&&!seen.has(row.route_id)){seen.add(row.route_id);rows.push(row);}
 let chosen=rows.slice(0,6);
 if(topic==='money'&&a.need==='tonight'){const direct=rows.filter(row=>[43,106,117,122,126,127,69].includes(Number(row.catalogue_id)));const intake=rows.find(row=>Number(row.catalogue_id)===86);chosen=[...direct.slice(0,2),...(intake?[intake]:[]),...direct.slice(2,5)];}
 const ids=chosen.slice(0,3).map(r=>r.appearance_id),moreIds=chosen.slice(3).map(r=>r.appearance_id);
 let note='',noteBefore=false;
 if(topic==='money'&&['housing','tonight'].includes(a.need)) {
  note='Ask the provider to check eligibility, fees and vacancies. No bed or same-night admission is confirmed. NT Central Intake is non-urgent and uses online referral during its telephone outage.';
  noteBefore=true;
  if(!chosen.some(r=>[43,106,117,122,126,127,69].includes(Number(r.catalogue_id))))note='No direct accommodation programme in this snapshot matches the household and region answers. '+note;
 }
 if(topic==='care'&&a.need==='travel'&&a.ntResidence==='no'&&a.dvaTravel!=='yes')note='NT PATS generally requires six months of NT residence. Ask the regional office to check the referral and residence rules before booking; this is an eligibility enquiry.';
 if(topic==='mental'&&['crisis','nt-crisis'].includes(a.need)){note='In immediate danger or a life-threatening emergency, call 000. These contacts cannot confirm a local appointment.';noteBefore=true;}
 if(topic==='money'&&['stable-housing','losing-housing'].includes(a.need)){note='NT Central Intake provides non-urgent housing assessment and referral. Its telephone is currently unavailable; use the supplied online referral form. A home, bed or appointment is not confirmed.';noteBefore=true;}
 if(topic==='care'&&a.need==='costs'&&a.healthFunding==='other')note='No treatment-funding route in this resource set is established by these answers. Ask your treating provider about costs and suitable payment options.';
 if(topic==='money'&&a.need==='family-crisis'&&!chosen.length)note='The serving-family Emergency Support scheme does not fit the Defence connection selected. Change the answer if needed, or choose unpaid-carer support, DVA Acute Support or help with essentials for your actual situation.';
 const uncertain=['unsure','other'].some(value=>Object.values(a).includes(value));
 if(uncertain)note+=' Ask the contact to check the applicable eligibility and referral rules for your circumstances.';
 const preferenceGroups=[];
 if((a.preferences||[]).includes('anonymous'))preferenceGroups.push({title:'Anonymous military-aware support',ids:[appearances.find(r=>r.issue_number===33&&Number(r.catalogue_id)===112)?.appearance_id].filter(Boolean)});
 if((a.preferences||[]).includes('lgbtq'))preferenceGroups.push({title:'LGBTQIA+ peer support',ids:[appearances.find(r=>r.issue_number===31&&Number(r.catalogue_id)===105)?.appearance_id].filter(Boolean)});
 return {ids,moreIds,note:note.trim(),noteBefore,preferenceGroups,issueNumbers,issueNotes:issueNumbers.map(n=>issues.find(i=>i.issue_number===n)).filter(Boolean).map(i=>({title:i.title,text:i.note||''})),say:'I need help with '+(issues.find(i=>i.issue_number===issueNumbers[0])?.title.toLowerCase()||'finding a suitable service')+'. Can you check which support, eligibility and costs apply to my circumstances?'};
}
export const services=Object.fromEntries(appearances.map(row=>[row.appearance_id,{id:row.appearance_id,routeId:row.route_id,appearance:row,display:row.display,name:row.display.name,area:row.display.location,audience:row.display.who,offer:row.display.offers||row.display.help||'',access:row.display.access,contact:row.display.contact,checked:row.display.checked||'5 October 2026',urls:[...new Set([...(row.display.urls||[]),row.display.url,...(row.display.extra_links||[]).map(link=>link[1]),row.display.form].filter(Boolean))]}]));
export function primaryWebURL(service) {
 const urls=service.urls.map(safeURL).filter(url=>url&&/^https?:/.test(url));
 if(Number(service.appearance.catalogue_id)===86)return urls.find(url=>new URL(url).pathname==='/nt-cis-enquiries/')||urls[0];
 return urls[0];
}
// Promote supplied task actions separately from documentary source links.
export function routeWebActions(service) {
 const urls=service.urls.map(safeURL).filter(url=>url&&/^https?:/.test(url));
 if(Number(service.appearance.catalogue_id)===113){
  const supplied=[['https://www.servicesaustralia.gov.au/payment-and-service-finder','Check payments'],['https://findus.servicesaustralia.gov.au/?msg=Centrelink','Find in-person Centrelink help']];
  const actions=supplied.filter(([url])=>urls.includes(url)).map(([url,label])=>({url,label}));
  if(actions.length)return actions;
 }
 const url=primaryWebURL(service);
 return url?[{url,label:Number(service.appearance.catalogue_id)===86?'Use online referral form':'Official service information'}]:[];
}
export function routeContactURLs(service) {
 const contactDigits=service.contact.replace(/\D/g,'');
 const outage=Number(service.appearance.catalogue_id)===86||/telephone outage|phone.*unavailable|phone.*outage/i.test(service.access+' '+service.contact);
 // Some verified appearances publish the route number as contact text without
 // a tel URL. Derive only Australian phone formats in that exact appearance;
 // sibling phones in broad source URLs never become this route's call action.
 const published=[];
 if(!outage)for(const line of service.contact.split('\n')){
  const numbers=line.match(/\b(?:0[2378](?:[ ()-]*\d){8}|04(?:[ ()-]*\d){8}|1[38]00(?:[ ()-]*\d){6}|13(?:[ ()-]*\d){4}|000)\b/g)||[];
  for(const number of numbers){const url=safeURL((/\btext\b|\bsms\b/i.test(line)?'sms:':'tel:')+number.replace(/\D/g,''));if(url)published.push(url);}
 }
 const supplied=service.urls.map(safeURL).filter(url=>url&&(!url.startsWith('tel:')||(!outage&&contactDigits.includes(url.replace(/\D/g,'')))));
 return [...new Set([...supplied,...published])];
}
export function safeURL(url) {
 if(typeof url!=='string')return null;
 const phone=url.match(/^(tel|sms):([+]?[0-9]+)(?:\?[^\s]*)?$/);
 if(phone){let number=phone[2];if(number.startsWith('+61')){number=number.slice(3);if(/^[2-478]/.test(number))number='0'+number;}if(/^[0-9]{3,15}$/.test(number))return phone[1]+':'+number;return null;}
 if(/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/.test(url))return url;
 try {const parsed=new URL(url);return ['https:','http:'].includes(parsed.protocol)?url:null;}catch{return null;}
}

export function recoveryResults(handoff,helpAnswers={}) {
 const contextual=verifiedResults(handoff.topicId,{...handoff.answers,...helpAnswers,need:handoff.answers.need});
 const navigation=verifiedResults('help',helpAnswers),previousRoute=services[handoff.previousPrimaryId]?.routeId;
 const seen=new Set(),ids=[];
 for(const id of [...contextual.ids,...contextual.moreIds,...navigation.ids,...navigation.moreIds]){const service=services[id];if(!service||service.routeId===previousRoute||seen.has(service.routeId))continue;seen.add(service.routeId);ids.push(id);}
 return {...contextual,ids:ids.slice(0,3),moreIds:ids.slice(3,6),note:contextual.note||'These contacts offer another route or can help you check suitable support.'};
}
