import M from './finder-model-adapter.mjs';
import {sourceCatalog,serviceView} from './support-catalog.mjs';
import {handbookRegions,handbookNeeds} from './support-handbook.mjs';
export const regionIds=Object.keys(handbookRegions);
export const topics=[
{id:'housing',title:'Housing & a place tonight',hint:'Nowhere safe to stay, a stable home or keeping a tenancy',links:[{label:'An unsafe home because of violence',href:'#safety/violence-safety'}]},
{id:'safety',title:'Safety from violence',hint:'A safer place, safety planning or violence-related support'},
{id:'essentials',title:'Food, essentials & ID',hint:'Meals, showers, documents, a phone or online access'},
{id:'money',title:'Income, bills & debt',hint:'Payments, financial counselling and urgent expenses'},
{id:'health',title:'Health & alcohol or drugs',hint:'Health advice, mental health or alcohol and other drugs'},
{id:'family',title:'Children, young people & families',hint:'Youth accommodation, parenting and family support'},
{id:'access',title:'Legal help, culture & care',hint:'Legal or leaving-care support, interpreting, disability and care'}
];
const topicNeeds={housing:['safe-tonight','longer-term-housing','keep-tenancy'],safety:['violence-safety'],essentials:['food-essentials','identity-digital'],money:['money-benefits'],health:['health-wellbeing','alcohol-drugs'],family:['children-youth-family'],access:['legal-transition','access-culture-disability']};
const canonicalToModel=Object.fromEntries(M.NEEDS.filter(n=>n.canonical).map(n=>[n.canonical,n.id]));
const options=rows=>rows.map(([value,label,detail])=>({value,label,...(detail?{detail}:{})}));
const question=(id,label,rows,hint)=>({id,label,options:options(rows),...(hint?{hint}:{})});
const regionQuestion=question('region','Where is support needed?',Object.entries(handbookRegions));
const ageQuestion=question('age','How old is the person needing support?',[
['under15','Under 15'],['15-18','15–18'],['19-21','19–21'],['22-24','22–24'],['25-49','25–49'],['50-64','50–64'],['65+','65 or older'],['unsure','Not sure / rather not say']
],'Service age rules differ. This answer helps choose a contact; it does not establish eligibility.');
const householdQuestion=question('household','Who needs accommodation?',[
['single','One person'],['couple','A couple without children'],['family','A household with children'],['unsure','Another situation / not sure']
],'Some accommodation accepts only single adults, young people or particular households. Ask the service before travel.');
const ageNeeds=new Set(['safe-tonight','longer-term-housing','children-youth-family','health-wellbeing','alcohol-drugs','legal-transition','access-culture-disability']);
export function questionsFor(topic,a={}){
 if(topic==='help')return [regionQuestion];
 const allowed=topicNeeds[topic]||[];
 const qs=[question('need','What would help?',allowed.map(id=>[id,handbookNeeds.find(n=>n.id===id).title]))];
 if(!allowed.includes(a.need))return qs;
 if(ageNeeds.has(a.need))qs.push(ageQuestion);
 if(a.need==='safe-tonight')qs.push(householdQuestion);
 if(a.need==='legal-transition')qs.push(question('transitionNeed','What is the main concern?',[
 ['legal','Legal advice or a legal deadline'],['hospital','Leaving hospital'],['custody','Leaving custody'],['care','Leaving out-of-home care'],['unsure','Another situation / not sure']
 ]));
 if(a.need==='access-culture-disability')qs.push(question('accessNeed','What would help most?',[
 ['language','An interpreter or communication access'],['disability','Disability support or advocacy'],['older','Older-person care or care advocacy'],['country','Returning to Country'],['culture','Culturally safe support'],['unsure','Not sure / more than one need']
 ]));
 qs.push(regionQuestion);return qs;
}
export function preferencesFor(){return options([
 ['no-phone','I cannot use a phone','Use actual provider email, forms, chat or advertised visit routes where available.'],
 ['no-transport','I cannot get to a service','Ask about outreach or travel before making a journey.'],
 ['cultural','I would like Aboriginal-led support','A preference changes the order; it does not determine eligibility.'],
 ['language','I need an interpreter','Ask the receiving service to arrange interpreting and confirm any costs.']
]);}
const ageBands={'under15':[0,14],'15-18':[15,18],'19-21':[19,21],'22-24':[22,24],'25-49':[25,49],'50-64':[50,64],'65+':[65,120]};
const modelAge=age=>['22-24','25-49','50-64','65+'].includes(age)?'22+':age||'unsure';
const preferred={
 legal:['legal-aid-nt','naaja-legal','dcls-general-legal'],hospital:['nt-hospital-social-work'],custody:['naaja-adult-throughcare','anglicare-outcare'],care:['anglicare-moving-on','anglicare-yhopp'],
 language:['nt-aboriginal-interpreter-service','tis-national','national-relay'],disability:['dcls-disability-rights','ndis-access'],older:['my-aged-care','anglicare-care-finder','dcls-seniors-rights'],country:['larrakia-return-to-country','tangentyere-identity-banking-return-country'],culture:['larrakia-heal','danila-dilba-health','congress-primary-health','wurli-primary-health','anyinginyi-health','miwatj-primary-health']
};
const says={
 'safe-tonight':'I have nowhere safe to stay tonight. Can you assess me today? If you cannot, who can help and how do I contact them?',
 'longer-term-housing':'I need a more stable home. Can you help me understand the application or referral route and what information I need?',
 'keep-tenancy':'My tenancy may be at risk. I need advice about this notice, rent problem or deadline and what I should do next.',
 'food-essentials':'I need food or everyday essentials. What help is available, when can I come, and what do I need to bring?',
 'money-benefits':'I need help with income, bills or debt. Can you help me understand the next step and any urgent deadlines?',
 'identity-digital':'I am missing documents or a reliable phone or online access. Can you help me find a practical way to apply and stay in contact?',
 'violence-safety':'I need a safe way to get support. Please check with me how and when you can contact me.',
 'health-wellbeing':'I need health support and my housing situation makes access difficult. Can you help me arrange the right next step?',
 'alcohol-drugs':'I would like help with alcohol or drugs. Can you explain a safe assessment or support route and its requirements?',
 'children-youth-family':'A child, young person or family needs support. Can you help work out the right service and how we can contact it?',
 'legal-transition':'I need help with a legal problem or leaving a service. Can we make a plan for the next contact, documents and any deadlines?',
 'access-culture-disability':'I need support that fits my language, culture, disability or care needs. Can you help arrange the right contact and confirm access and costs?'
};
function matchesPreciseAge(s,age){const band=ageBands[age];if(!band)return true;return (s.age_min==null||band[1]>=s.age_min)&&(s.age_max==null||band[0]<=s.age_max);}
export function getResults(topic,a={}){
 const need=topic==='help'?'unsure':canonicalToModel[a.need]||'unsure';
 const region=regionIds.includes(a.region)?a.region:'unsure';
 const access=Array.isArray(a.preferences)?a.preferences:[];
 const contactMode=access.includes('no-phone')?'no-phone':'standard';
 let rows=M.getResults({need,region,age:modelAge(a.age),access,dismissed:Array.isArray(a.dismissed)?a.dismissed:[]},sourceCatalog);
 rows=rows.filter(s=>s.service_id==='salvos-house-49'||matchesPreciseAge(s,a.age)).map(s=>s.service_id==='salvos-house-49'&&!matchesPreciseAge(s,a.age)?{...s,role:'Reception / worker contact — no accommodation offer',can_help:'Ask public reception staff to help contact housing services. The separate residential programme is for singles or couples aged 25+ without children.',eligibility:'Reception help is separate from residential eligibility. A CIS worker at reception is not confirmed.'}:s);
 if(a.need==='safe-tonight'&&['couple','family'].includes(a.household)){
  const singleOnly=new Set(['salvos-sunrise-homelessness','salvos-todd-street-men','mission-katherine-accommodation']);
  if(a.household==='family')singleOnly.add('salvos-house-49');
  rows=rows.filter(s=>!singleOnly.has(s.service_id)||s.service_id==='salvos-house-49'&&s.role.startsWith('Reception'));
 }
 const order=preferred[a.transitionNeed]||preferred[a.accessNeed]||[];
 if(order.length)rows.sort((x,y)=>(order.includes(x.service_id)?order.indexOf(x.service_id):-1)===-1?(order.includes(y.service_id)?1:0):order.includes(y.service_id)?order.indexOf(x.service_id)-order.indexOf(y.service_id):-1);
 if(topic==='help')rows.sort((x,y)=>(x.service_id==='ask-izzy'?-1:y.service_id==='ask-izzy'?1:0));
 const servicesById=Object.fromEntries(rows.map(s=>{
  const band=ageBands[a.age];
  const ageConditional=band&&(s.age_min!=null&&band[0]<s.age_min||s.age_max!=null&&band[1]>s.age_max);
  const resolved={...s,age_conditional:!!ageConditional||s.age_conditional&&!band};
  return [s.service_id,serviceView(resolved,{contactMode})];
 }));
 const labels=questionsFor(topic,a).flatMap(q=>q.options.filter(o=>o.value===a[q.id]).map(o=>o.label));
 labels.push(...preferencesFor(topic,a).filter(p=>access.includes(p.value)).map(p=>p.label));
 let note='Published contacts have their own eligibility, fees and catchments. Beds, appointments and acceptance have not been checked live.';
 if(a.need==='safe-tonight')note='Ask a suitable accommodation provider first; no bed is confirmed live. Central Intake does not provide housing, and its form says 48 business hours.';
 if(a.need==='violence-safety')note='Immediate danger: call 000. 1800RESPECT offers phone, text and chat 24/7. Refuge household and eligibility rules differ. Use a safe device and agree a safe contact method.';
 if(contactMode==='no-phone')note+=' No-phone mode lists actual provider email, form, chat or advertised visit routes where verified. Email and forms may take time; a website alone is not confirmed online intake.';
 if(region==='npy')note+=' NPY services have specific border/community scope. NT-wide access does not establish entitlements or a local service across the SA/WA border.';
 const ids=rows.map(s=>s.service_id);
 return {ids:ids.slice(0,3),moreIds:ids.slice(3),allIds:ids,totalMatches:ids.length,note,say:says[a.need]||'I am not sure where to start. Can you help me find a suitable contact and explain the next step?',noteBefore:['safe-tonight','violence-safety'].includes(a.need),contextLabel:labels.join(' · '),preferenceGroups:[],preferenceLink:null,servicesById,contactMode,coverage:{canonicalRecords:77,supplementalRecords:3,totalRecords:80,liveAvailabilityChecked:false},fallbackIds:['ask-izzy',...rows.filter(s=>s.service_id!==ids[0]).map(s=>s.service_id)]};
}
const aliasNeeds={stay:'safe-tonight',housing:'longer-term-housing','keep-home':'keep-tenancy',essentials:'food-essentials',money:'money-benefits',identity:'identity-digital',safety:'violence-safety',health:'health-wellbeing',aod:'alcohol-drugs',family:'children-youth-family',transition:'legal-transition',access:'access-culture-disability','return-home':'access-culture-disability'};
export function legacyRoute(hash){
 const [first,second]=hash.replace(/^#/,'').split('/');
 const canonical=second?(aliasNeeds[second]||second):(aliasNeeds[first]||first);
 const topicId=Object.keys(topicNeeds).find(id=>topicNeeds[id].includes(canonical));
 return topicId?{topicId,need:canonical}:null;
}
