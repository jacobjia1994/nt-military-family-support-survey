import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {topics,questionsFor,getResults,legacyRoute} from '../support-paths.mjs';
import {services} from '../support-catalog.mjs';
const scenarios=[
 ['NT civilian family cannot find shift-hours care','parenting',{need:'childcare',connection:'former',careHours:'nonstandard',region:'alice'},'nt-inhome-care',[]],
 ['Outside NT shift-hours care uses relevant agency list','parenting',{need:'childcare',connection:'former',careHours:'nonstandard',region:'outside'},'inhome-care-agencies',['nt-inhome-care']],
 ['Member own medical travel is not family benefit','care',{need:'travel',connection:'serving',role:'member',region:'darwin',ntResidence:'no'},'defence-medical-enquiry',['defence-medical-travel']],
 ['General accommodation failure is not domestic crisis','money',{need:'tonight',connection:'serving',housingReason:'other',region:'darwin'},'dmfs-helpline',['defence-safe']],
 ['Remote Central child not sent to Top End','parenting',{need:'development',therapy:'eligible',region:'remote',remoteArea:'central'},'child-therapy-central',['child-therapy-remote']],
 ['Outside NT school support not NT-only intake','parenting',{need:'learning',connection:'former',schoolType:'other',region:'outside'},'wellbeing-agency',['territory-faces']],

 ['3-year-old needs assessment, Darwin','mental',{need:'feelings',age:'under18',childAge:'0-4',region:'darwin'},'child-health-darwin',['kids-helpline','headspace-darwin']],
 ['3-year-old remote clinical question','mental',{need:'feelings',age:'under18',childAge:'0-4',region:'remote'},'healthdirect',['darwin-mmhc']],
 ['16-year-old Katherine','mental',{need:'feelings',age:'under18',childAge:'12-17',region:'katherine'},'headspace-katherine',['katherine-mmhc']],
 ['Adult child of veteran, 34','mental',{need:'feelings',age:'26+',counselling:'child',region:'alice'},'open-arms',['eheadspace']],
 ['Reserve-only family counselling','mental',{need:'feelings',age:'26+',counselling:'reserve',region:'darwin'},'reserve-counselling',['open-arms']],
 ['LGBTQ peer support','mental',{need:'lgbtq'},'qlife',[]],
 ['Katherine culturally appropriate non-crisis support','mental',{need:'indigenous',indigenousNeed:'local',region:'katherine'},'wurli-sewb',[]],
 ['First Nations traumatic loss','mental',{need:'indigenous',indigenousNeed:'loss'},'thirrili',[]],
 ['Anonymous Defence support','mental',{need:'private'},'safe-zone',[]],
 ['NT bereaved partner eligible Legacy','mental',{need:'practical-loss',dvaClient:'no',legacyFit:'eligible',region:'alice'},'legacy-nt',[]],
 ['Bereaved parent not assumed Legacy eligible','mental',{need:'practical-loss',dvaClient:'no',legacyFit:'other'},'wellbeing-agency',['legacy-nt']],
 ['Woman with children, Darwin refuge','relationships',{need:'refuge',refugeFor:'woman-child',region:'darwin'},'dawn-shelter',[]],
 ['Woman without children not sent to restricted Darwin shelter','relationships',{need:'refuge',refugeFor:'woman',region:'darwin'},'respect',['dawn-shelter']],
 ['Man needs safe accommodation','relationships',{need:'refuge',refugeFor:'other',region:'alice'},'respect',['wossca']],
 ['Woman Tennant Creek','relationships',{need:'refuge',refugeFor:'woman',region:'tennant'},'tennant-refuge',[]],
 ['Child affected by violence with father','relationships',{need:'child-violence',childViolenceAge:'0-12',region:'palmerston'},'safe-reconnected',['tewls']],
 ['Darwin criminal legal problem','relationships',{need:'legal',womenLegal:'yes',legalIssue:'other',region:'darwin'},'legal-aid',['tewls']],
 ['NT child development eligible','parenting',{need:'development',therapy:'eligible',region:'palmerston'},'child-therapy-darwin',[]],
 ['Child already on NDIS','parenting',{need:'development',therapy:'ndis',region:'alice'},'ndis',['child-therapy-central']],
 ['Government school learning needs','parenting',{need:'learning',connection:'former',schoolType:'government',region:'katherine'},'school-inclusion',[]],
 ['Non-government school not sent to govt-only SWIPS','parenting',{need:'learning',connection:'serving',schoolType:'other',region:'darwin'},'school-change',['school-inclusion']],
 ['Emergency childcare during duty absence','parenting',{need:'emergency-care',connection:'serving',region:'gove'},'defence-emergency-care',[]],
 ['Tennant essentials','money',{need:'essentials',region:'tennant'},'catholiccare-tennant',['ndh']],
 ['Veteran partner debt counselling','money',{need:'bills',connection:'former',role:'partner',region:'alice'},'bravery-financial',[]],
 ['Extended relative debt support','money',{need:'bills',connection:'former',role:'other',region:'alice'},'ndh',['bravery-financial']],
 ['Serving family urgent housing','money',{need:'tonight',connection:'serving',housingReason:'crisis',region:'darwin'},'defence-safe',[]],
 ['Youth at risk in East Arnhem','money',{need:'youth-housing',region:'gove'},'reconnect-arnhem',[]],
 ['Civilian partner of full-time member','work',{need:'partner',connection:'serving',partnerEmployment:'no'},'soldieron-work',[]],
 ['Part-time Reserve household not PEAP','work',{need:'partner',connection:'reserve'},'soldieron-work',['peap']],
 ['Applicant partner also serves full-time','work',{need:'partner',connection:'serving',partnerEmployment:'yes'},'soldieron-work',['peap']],
 ['First disability application at70','care',{need:'disability',disabilityNeed:'ndis',ndisStatus:'older',region:'alice'},'aged-care',[]],
 ['Existing NDIS participant over65 not excluded','care',{need:'disability',disabilityNeed:'ndis',ndisStatus:'existing',region:'alice'},'ndis',[]],
 ['Alice disability appeal','care',{need:'disability',disabilityNeed:'advocacy',region:'alice'},'das-central',[]],
 ['New baby health checks, Alice','care',{need:'baby',babyNeed:'nurse',region:'alice'},'child-health-alice',['child-health-darwin']],
 ['Katherine Aboriginal registered family','care',{need:'baby',babyNeed:'wurli',wurliClient:'yes',region:'katherine'},'wurli-gus',[]],
 ['Too old for local young-parent program','care',{need:'baby',babyNeed:'young-parent',parentAge:'other',region:'darwin'},'pregnancy-baby',['pandanus']],
 ['No trusted support, eligible older person','care',{need:'older',olderNeed:'alone',careFinderFit:'eligible',region:'gove'},'care-finder-nt',[]],
 ['Older person with other circumstances','care',{need:'older',olderNeed:'alone',careFinderFit:'other',region:'darwin'},'aged-care',['care-finder-nt']],
 ['PATS Alice regional enquiry','care',{need:'travel',connection:'former',region:'alice',ntResidence:'yes'},'pats-alice',[]],
 ['New posting less than6months','care',{need:'travel',connection:'serving',role:'partner',region:'katherine',ntResidence:'no'},'defence-medical-travel',['pats-katherine']],
 ['Other relative cannot assume ADF dependant healthcare','care',{need:'costs',connection:'serving',role:'other',region:'darwin'},'medicare-costs',['adf-family-health']],
 ['Recognised dependant health costs','care',{need:'costs',connection:'serving',role:'child',dependant:'yes',region:'darwin'},'adf-family-health',[]],
 ['Darwin veteran partner participates independently','connection',{need:'local',connection:'former',role:'partner',region:'darwin'},'mates4mates-darwin',[]],
 ['Extended family not assumed Mates eligible','connection',{need:'local',connection:'former',role:'other',region:'darwin'},'soldieron-connect',['mates4mates-darwin']],
 ['Tindal family group','connection',{need:'local',connection:'serving',role:'other',region:'katherine'},'defence-groups-tindal',[]],
 ['Migrant settlement Darwin','connection',{need:'migrant',region:'darwin'},'ramss',[]]
];
for(const[name,t,a,first,excluded]of scenarios)test(name,()=>{const r=getResults(t,a);assert.equal(r.ids[0],first);for(const id of excluded)assert.ok(![...r.ids,...r.moreIds].includes(id),id);});
test('age questions are relevant and under18 groups are conditional',()=>{
 let qs=questionsFor('mental',{need:'feelings'});assert.equal(qs.find(q=>q.id==='age').options.length,3);assert.ok(!qs.some(q=>q.id==='childAge'));
 qs=questionsFor('mental',{need:'feelings',age:'under18'});assert.equal(qs.find(q=>q.id==='childAge').options.length,3);assert.ok(!qs.some(q=>q.id==='counselling'));
 for(const [t,need]of[['money','essentials'],['work','job'],['parenting','parenting'],['care','carer']])assert.ok(!questionsFor(t,{need}).some(q=>['age','childAge'].includes(q.id)));
});
test('all valid visible paths have sourced contacts and every included offer is reachable',()=>{
 const reached=new Set();let leaves=0;
 function walk(t,a){const qs=questionsFor(t,a),q=qs.find(q=>!q.options.some(o=>o.value===a[q.id]));if(q){assert.ok(q.options.length&&q.label);for(const o of q.options)walk(t,{...a,[q.id]:o.value});return;}leaves++;const r=getResults(t,a);assert.ok(r.ids.length>0&&r.ids.length<=3,`${t}:${JSON.stringify(a)}`);for(const id of [...r.ids,...r.moreIds]){const s=services[id];assert.ok(s,id);assert.ok(s.name&&s.audience&&s.offer&&s.cost&&s.sources?.length,id);assert.equal(new URL(s.url).protocol,'https:');reached.add(id);}}
 for(const t of[...topics,{id:'help'}])walk(t.id,{});assert.ok(leaves>1000);assert.deepEqual(Object.keys(services).filter(id=>!reached.has(id)),[]);
});
test('public interface uses visible labelled radios, not dropdowns',()=>{
 const ui=readFileSync(new URL('../support.js',import.meta.url),'utf8');assert.doesNotMatch(ui,/<select|<option\b/);assert.match(ui,/<fieldset/);assert.match(ui,/<legend/);assert.match(ui,/type="radio"/);assert.match(ui,/type="submit"/);
 assert.equal(topics.length,7);assert.ok(!topics.some(t=>/Talk to someone|Help for a child|Moving or/.test(t.title)));
 assert.equal(topics.find(t=>t.id==='parenting').links[0].href,'#mental/feelings');
});
test('legacy links preserve meaningful destination',()=>{assert.deepEqual(legacyRoute('need/9'),{topicId:'parenting',need:'childcare'});assert.deepEqual(legacyRoute('need/16'),{topicId:'care',need:'carer'});assert.deepEqual(legacyRoute('need/37'),{topicId:'work',need:'transition'});});
