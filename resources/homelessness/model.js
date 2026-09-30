(function(root){
'use strict';
const NEEDS=[
{id:'stay',canonical:'safe-tonight',label:'I need a safe place tonight'},
{id:'housing',canonical:'longer-term-housing',label:'A stable home / overcrowding'},
{id:'keep-home',canonical:'keep-tenancy',label:'Rent, eviction or keeping my home'},
{id:'essentials',canonical:'food-essentials',label:'Food, showers or essentials'},
{id:'money',canonical:'money-benefits',label:'Income, bills or debt'},
{id:'identity',canonical:'identity-digital',label:'ID, a phone or online access'},
{id:'safety',canonical:'violence-safety',label:'Safety from violence'},
{id:'health',canonical:'health-wellbeing',label:'Physical or mental health'},
{id:'aod',canonical:'alcohol-drugs',label:'Alcohol or other drugs'},
{id:'family',canonical:'children-youth-family',label:'Children, young people or family'},
{id:'transition',canonical:'legal-transition',label:'Legal help / leaving hospital, care or custody'},
{id:'access',canonical:'access-culture-disability',label:'Culture, disability or returning to Country'},
{id:'unsure',label:'Not sure — help me start'}
];
const AGE_NEEDS=['stay','housing','transition','safety','family','health','aod','access'];
const BANDS={'under15':[0,14],'15-18':[15,18],'19-21':[19,21],'22+':[22,120]};
const aliases={'return-home':'access'};
function matchesAge(s,age){
 if(s.age_min==null&&s.age_max==null||!BANDS[age])return true;
 const [lo,hi]=BANDS[age];return (s.age_min==null||hi>=s.age_min)&&(s.age_max==null||lo<=s.age_max);
}
function contactOptions(s,region){return (s.contact_options||[]).filter(o=>!o.regions?.length||o.regions.includes(region));}
function walkinAddress(s,region){return s.regional_walkin?s.regional_walkin[region]||null:s.walkin_address;}
function reachableWithoutPhone(s,region){return !!walkinAddress(s,region)||contactOptions(s,region).some(o=>['form','email','chat'].includes(o.type))||s.service_id==='ask-izzy';}
function getResults(state,catalog){
 const candidate=aliases[state.need]||state.need;
 const need=NEEDS.some(n=>n.id===candidate)?candidate:'unsure';
 const region=state.region||'unsure',age=AGE_NEEDS.includes(need)?state.age:'unsure';
 const access=state.access||[],dismissed=new Set(state.dismissed||[]);
 return catalog.services.filter(s=>{
  if(s.service_id==='emergency-000'||dismissed.has(s.service_id)||!s.needs.includes(need)||(!matchesAge(s,age)&&s.service_id!=='salvos-house-49'))return false;
  return s.regions.includes('nt-wide')||region!=='unsure'&&s.regions.includes(region);
 }).map(s=>{
  let score=s.priority?.[need]??50;
  const range=BANDS[age],conditional=!!(s.age_min!=null||s.age_max!=null)&&(!range||s.age_min!=null&&range[0]<s.age_min||s.age_max!=null&&range[1]>s.age_max);
  if(conditional)score-=12;
  if(access.includes('no-phone'))score+=reachableWithoutPhone(s,region)?15:-18;
  if(access.includes('no-transport')&&s.outreach)score+=12;
  // Cultural preference changes order; it never establishes or removes eligibility.
  if(access.includes('cultural')&&s.aboriginal_led)score+=12;
  // An accessible support route must not be promoted into accommodation.
  if(need==='stay'&&s.role.includes('no beds'))score=Math.min(score,42);
  let extra={};
  if(s.service_id==='vinnies-nt-emergency-relief'&&region!=='darwin')extra={role:'Emergency relief enquiry — local arrangements to confirm',next_step:'For Alice Springs, call Vinnies to check relief availability, venue and times before travelling. The published Malak/Palmerston walk-in sessions are in Greater Darwin.',hours:'Alice Springs relief arrangements are not confirmed here. The listed Malak/Palmerston sessions are Darwin-area sessions.',address:'Alice Springs venue unconfirmed; contact Vinnies before travel.'};
  if(s.service_id==='headspace-nt-youth'&&!walkinAddress(s,region))extra={next_step:'Call/email the centre for your region or use its official referral page. Confirm the relevant appointment and local venue before travelling; walk-in access is not confirmed for this selection.',address:'Confirm the relevant centre and appointment venue before travelling. Published centre addresses remain in the official source.'};
  if(s.service_id==='salvos-house-49'&&!matchesAge(s,age)){score=42;extra={role:'Reception / worker contact — no accommodation offer',can_help:'Ask public reception staff to help contact housing services. The separate residential program is for singles/couples aged 25+ without children.',eligibility:'Reception help and a housing enquiry are separate from residential eligibility. CIS worker presence at reception is not confirmed.'};}
  if((s.service_id==='nt-social-housing'||s.service_id==='nt-private-rental-bond')&&region==='npy')extra={boundary_note:'For NT-side NPY communities, ask the NT housing office about your locality and eligibility. This result does not establish coverage or entitlements across the SA/WA border.'};
  if(s.service_id==='anglicare-moving-on'&&region!=='darwin')extra={can_help:'Moving On aftercare for eligible care leavers in the NT. The separate HYPP housing program is Greater Darwin only; no local HYPP accommodation is established by this result.',eligibility:'Moving On: eligible care leavers aged 16–25; assessment required. HYPP housing: Greater Darwin, ages 18–25.'};
  return {...s,...extra,walkin_address:walkinAddress(s,region),score,age_conditional:conditional,contact_options_visible:contactOptions(s,region),non_phone_reachable:reachableWithoutPhone(s,region)};
 }).sort((a,b)=>b.score-a.score||a.service_id.localeCompare(b.service_id));
}
const api={NEEDS,AGE_NEEDS,getResults,matchesAge,contactOptions,reachableWithoutPhone};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.FinderModel=api;
})(typeof window==='undefined'?{}:window);
