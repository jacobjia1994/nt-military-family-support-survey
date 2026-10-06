import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {journeys} from '../support-journeys.mjs';
import {appearances,routeContactURLs} from '../support-routing.mjs';
import {discover,discoveryFields,supplementalServices} from '../support-discovery.mjs';
import {sharedYouthCandidates} from '../support-discovery-candidates.mjs';
const choice=(topicId,need,answers={})=>({topicId,need,answers});
const resultRows=(c,r={})=>{const d=discover(c,r);return d.allIds.map(id=>d.servicesById[id]);};
const catalogueIds=(c,r={})=>resultRows(c,r).map(s=>s.appearance.catalogue_id);
const has=(c,r,id)=>catalogueIds(c,r).includes(id);
const route=(c,r,suffix)=>resultRows(c,r).some(s=>s.routeId.endsWith(suffix));
const tonight=choice('money','tonight');

test('every concrete task immediately offers source-backed contacts without questionnaire completion',()=>{
 for(const journey of journeys)for(const c of journey.choices){
  const d=discover(c);
  assert.ok(d.ids.length,journey.id+'/'+c.title);
  for(const id of d.allIds){const s=d.servicesById[id];assert.ok(s.name&&s.audience&&s.access&&s.checked,id);assert.ok(s.urls.length||s.contactOptions?.length,id);}
 }
 const removal=discover(choice('money','defence-housing',{housingTask:'removal'}));
 assert.deepEqual(removal.ids.map(id=>removal.servicesById[id].appearance.catalogue_id),[123,40]);
 assert.deepEqual(discoveryFields(choice('money','defence-housing',{housingTask:'removal'})),[]);
});

test('blank travel has distinct medical, DVA, remote-family and PATS navigation with actual provenance',()=>{
 const d=discover(choice('care','travel'));
 assert.equal(d.ids.length,4);
 assert.deepEqual(d.ids.map(id=>d.servicesById[id].name),[
  'ADF garrison healthcare – find your assigned centre',
  'DVA Travel for Treatment and Booked Car with Driver',
  'Defence family travel for specialist treatment in a remote location',
  'PATS – regional Patient Travel Offices'
 ]);
 const member=d.servicesById['discovery:member-centres'];
 assert.ok(member.contactOptions.some(a=>a.url==='tel:1800467425'));
 assert.ok(member.sourceIds.every(id=>appearances.some(r=>r.appearance_id===id)));
 const pats=d.servicesById['discovery:pats-offices'];
 assert.equal(pats.contactOptions.length,5);
 assert.ok(pats.contactOptions.every(a=>/^PATS – /.test(a.label)&&a.url.startsWith('tel:')));
 assert.match(pats.audience,/six-month residency/);
 assert.match(pats.offer,/covered\/claimable/);
 assert.match(d.note,/covered or claimable/);
});

test('travel applies only explicitly known exclusions and does not stack PATS with claimable funding',()=>{
 const travel=choice('care','travel');
 assert.ok(has(travel,{},36));
 assert.ok(has(travel,{connection:'serving',recipient:'partner'},36));
 assert.ok(!has(travel,{connection:'serving',recipient:'member'},36));
 assert.ok(!has(travel,{remotePosting:'no'},36));
 assert.ok(!has(travel,{travelFunding:'no-dva'},52));
 assert.ok(has(travel,{travelFunding:''},52));
 for(const travelFunding of ['dva','other'])assert.ok(!has(travel,{travelFunding},93));
 assert.ok(!has(travel,{otherTravelFunding:'yes'},93));
 assert.ok(has(travel,{connection:'former',recipient:'partner',region:'katherine'},52));
 const local=discover(travel,{region:'katherine'});
 const pats=local.ids.map(id=>local.servicesById[id]).filter(s=>s.appearance.catalogue_id===93);
 assert.deepEqual(pats.map(s=>s.name),['PATS – Katherine']);
 assert.ok(!local.ids.includes('discovery:pats-offices'));
 assert.ok(discover(travel,{region:'remote'}).ids.includes('discovery:pats-offices'));
 assert.ok(!has(travel,{region:'outside'},93));
});

test('the assigned health centre is explicit and is not inferred from town or patient role',()=>{
 const care=choice('care','health',{healthFor:'member'});
 const d=discover(care,{region:'katherine'});
 assert.ok(d.ids.includes('discovery:member-centres'));
 assert.ok(!d.ids.some(id=>d.servicesById[id].name==='ADF garrison healthcare - Tindal Health Centre'));
 const assigned=discover(care,{region:'palmerston',memberCentre:'darwin'});
 assert.ok(assigned.ids.some(id=>assigned.servicesById[id].name==='ADF garrison healthcare - Darwin Health Centre'));
 assert.ok(!assigned.ids.includes('discovery:member-centres'));
});

test('exact ages preserve 17,18,19,24,25,26 programme boundaries',()=>{
 const mental=choice('mental','feelings');
 for(const age of ['17','18','19','24','25']){
  assert.ok(has(mental,{age,region:'darwin'},70),age);
  assert.ok(has(mental,{age,region:'darwin'},62),age);
 }
 assert.ok(!has(mental,{age:'26',region:'darwin'},70));
 assert.ok(!has(mental,{age:'26',region:'darwin'},62));
 assert.ok(!has(mental,{age:'17',region:'darwin'},30));
 assert.ok(has(mental,{age:'18',region:'darwin'},30));
 assert.ok(has(mental,{age:'18',region:'darwin'},20));
 assert.ok(!has(mental,{age:'19',region:'darwin'},20));
 for(const badAge of ['', 'unknown', '12-17', '18-25', '-1', '2.5'])assert.ok(has(mental,{age:badAge},70));
 assert.ok(has(choice('care','baby',{babyNeed:'nurse'}),{age:'5',region:'darwin'},87));
 assert.ok(!has(choice('care','baby',{babyNeed:'nurse'}),{age:'6',region:'darwin'},87));
 assert.ok(has(choice('parenting','development'),{age:'18'},89));
 assert.ok(!has(choice('parenting','development'),{age:'19'},89));
});

test('child task scope survives a blank age and exact contradictory edits are explicit',()=>{
 const child=choice('mental','feelings',{age:'under18'});
 assert.ok(!has(child,{},30));assert.ok(!has(child,{},68));
 assert.ok(has(child,{age:'17'},70));
 assert.match(discover(child,{age:'18'}).note,/under 18/);
 assert.equal(discover(child,{age:'18'}).allIds.length,0);
 const under12=choice('parenting','parenting',{parentingNeed:'indigenous-child'});
 assert.ok(has(under12,{},25));
 assert.ok(!has(under12,{age:'12'},25));
});

test('housing age, gender and composition are separate; families never reuse one child age',()=>{
 assert.ok(route(tonight,{region:'darwin',composition:'one',age:'18'},'018e8b62817abdbe'));
 assert.ok(!route(tonight,{region:'darwin',composition:'one',age:'18'},'07ec6e29adf9de37'));
 assert.ok(route(tonight,{region:'darwin',composition:'one',age:'19'},'07ec6e29adf9de37'));
 assert.ok(!has(tonight,{region:'darwin',composition:'couple',age:'24'},106));
 assert.ok(has(tonight,{region:'darwin',composition:'couple',age:'25'},106));
 assert.ok(!has(tonight,{region:'darwin',composition:'family',age:'25'},106));
 assert.ok(route(tonight,{region:'darwin',composition:'family',age:'13',gender:'man'},'018e8b62817abdbe'));
 assert.ok(route(tonight,{region:'katherine',composition:'family',age:'13',gender:'woman'},'c6a670d9a73b80f8'));
 assert.ok(!has(tonight,{region:'alice',composition:'one',age:'18',gender:'woman'},122));
 assert.ok(has(tonight,{region:'alice',composition:'one',age:'18',gender:'man'},122));
 assert.deepEqual(discoveryFields(tonight,{composition:'family'}).map(f=>f.id),['region','composition']);
 assert.match(discoveryFields(tonight,{composition:'couple'}).find(f=>f.id==='age').label,/youngest/);
});

test('known minors receive actual scoped youth enquiries and never adult-only bed programmes',()=>{
 const alice=resultRows(tonight,{region:'alice',age:'17',connection:'former'});
 assert.ok(alice.some(s=>s.sourceCatalogueId==='asyass-crisis-refuge'));
 assert.ok(alice.some(s=>s.sourceCatalogueId==='anglicare-yhopp'));
 assert.ok(!alice.some(s=>[117,69,122,106,126,127].includes(s.appearance.catalogue_id)));
 const crisis=alice.find(s=>s.sourceCatalogueId==='asyass-crisis-refuge');
 assert.match(crisis.audience,/13-17.*under-15s.*Departmental exception/);
 assert.match(crisis.access,/does not guarantee a bed/);
 const pathways=alice.find(s=>s.sourceCatalogueId==='anglicare-yhopp');
 assert.match(pathways.access,/does not establish a bed/);
 const darwin=resultRows(tonight,{region:'darwin',age:'18'});
 assert.ok(darwin.some(s=>s.sourceCatalogueId==='ywca-casy-house'));
 assert.ok(!resultRows(tonight,{region:'darwin',age:'19'}).some(s=>s.sourceCatalogueId==='ywca-casy-house'));
 assert.ok(!resultRows(tonight,{region:'katherine',age:'17'}).some(s=>s.sourceCatalogueId==='asyass-crisis-refuge'));
 assert.ok(!resultRows(tonight,{region:'alice',age:'18'}).some(s=>s.sourceCatalogueId==='asyass-crisis-refuge'));
 assert.ok(resultRows(tonight,{region:'alice'}).some(s=>s.sourceCatalogueId==='asyass-crisis-refuge'));
 assert.ok(resultRows(tonight,{region:'darwin'}).some(s=>s.sourceCatalogueId==='ywca-casy-house'));
 assert.ok(resultRows(tonight,{region:'alice',age:'24'}).some(s=>s.sourceCatalogueId==='asyass-youth-housing'));
 assert.ok(!resultRows(tonight,{region:'alice',age:'25'}).some(s=>s.sourceCatalogueId==='asyass-youth-housing'));
});

test('unknown geography keeps state/national contacts ahead of labelled regional alternatives',()=>{
 const d=discover(tonight);
 assert.ok(d.ids.every(id=>!(d.servicesById[id].appearance.geography?.rank>0)));
 assert.ok(d.ids.some(id=>d.servicesById[id].appearance.catalogue_id===86));
 assert.ok(!d.ids.some(id=>d.servicesById[id].sourceCatalogueId==='ywca-casy-house'));
});

test('Reserve schemes, funded member treatment and family schemes remain distinct',()=>{
 const counselling=choice('relationships','counselling');
 assert.ok(has(counselling,{},100)&&has(counselling,{},109));
 assert.ok(has(counselling,{connection:'reserve'},100)&&has(counselling,{connection:'reserve'},109));
 assert.ok(!has(counselling,{connection:'former'},109));
 const treatment=choice('mental','treatment');
 assert.ok(has(treatment,{connection:'reserve',recipient:'member'},50));
 assert.ok(has(treatment,{connection:'reserve',recipient:'partner'},50));
 const partnerTreatment=discover(treatment,{connection:'reserve',recipient:'partner'});
 assert.ok(!partnerTreatment.ids.some(id=>partnerTreatment.servicesById[id].appearance.catalogue_id===50));
 assert.match(partnerTreatment.allIds.map(id=>partnerTreatment.servicesById[id]).find(s=>s.appearance.catalogue_id===50).fitNote,/own qualifying service/);
 assert.ok(!has(treatment,{recipient:'partner',ownNlhcQualification:'no'},50));
 assert.ok(has(treatment,{connection:'reserve',recipient:'partner'},109));
 const costs=choice('care','costs');
 assert.ok(!has(costs,{connection:'reserve'},7));
 assert.ok(has(costs,{connection:'bereaved'},7));
 assert.ok(!has(costs,{recipient:'member'},7));
 assert.ok(has(choice('parenting','emergency-care'),{connection:'reserve'},58));
 assert.ok(has(choice('parenting','moving-care'),{connection:'former'},140));
 assert.ok(has(choice('parenting','childcare',{careHours:'regular'}),{connection:'reserve'},24));
 assert.ok(has(choice('care','disability',{disabilityNeed:'posting'}),{connection:'former'},45));
 assert.ok(!has(choice('care','disability',{disabilityNeed:'posting'}),{connection:'reserve'},46));
});

test('known qualifications remove only the actual programme and preserve useful alternatives',()=>{
 const home=choice('care','home-care');
 assert.ok(!has(home,{veteranCare:'card'},49));assert.ok(has(home,{veteranCare:'card'},125));
 assert.ok(has(home,{veteranCare:'condition'},49));assert.ok(!has(home,{veteranCare:'condition'},125));
 const development=choice('parenting','development');
 assert.ok(!has(development,{age:'12',therapy:'ndis'},89));assert.ok(has(development,{age:'12',therapy:'ndis'},83));
 const ndis=choice('care','disability',{disabilityNeed:'ndis'});
 assert.ok(!has(ndis,{age:'65',ndisStatus:'new'},83));assert.ok(has(ndis,{age:'65',ndisStatus:'existing'},83));
});

test('closed bursary, telephone outage and venue notices remain exact and actionable',()=>{
 const young=discover(choice('care','young-carer'),{age:'17'});
 assert.equal(young.servicesById[young.ids[0]].appearance.catalogue_id,16);
 const bursary=resultRows(choice('care','young-carer'),{age:'17'}).find(s=>s.appearance.catalogue_id===130);
 assert.match(bursary.access,/2026 applications closed; 2027 dates unconfirmed/);
 const intake=resultRows(tonight).find(s=>s.appearance.catalogue_id===86);
 assert.match(intake.access,/telephone outage/);assert.ok(!routeContactURLs(intake).some(u=>u.startsWith('tel:')));
 const youth=resultRows(choice('mental','feelings'),{age:'17',region:'katherine'}).find(s=>s.appearance.catalogue_id===63);
 assert.match(youth.access,/Temporary relocation notice remains/);
 const financial=resultRows(choice('money','bills'),{region:'alice'}).find(s=>s.appearance.catalogue_id===75);
 assert.match(financial.access,/flood-closure notice remains/);
});

test('all 189 verified routes retain meaningful task paths; exact source snapshots are unmodified',()=>{
 const seen=new Set(),issues=new Set();
 for(const j of journeys)for(const c of j.choices){const d=discover(c);for(const id of d.allIds){const s=d.servicesById[id];seen.add(s.routeId);if(s.appearance.issue_number)issues.add(s.appearance.issue_number);}}
 const help=discover({topicId:'help',need:'default'});for(const id of help.allIds){const s=help.servicesById[id];seen.add(s.routeId);issues.add(s.appearance.issue_number);}
 const missing=[...new Set(appearances.filter(r=>!seen.has(r.route_id)).map(r=>r.route_id))];
 assert.deepEqual(missing,[]);
 assert.equal(new Set(appearances.map(r=>r.route_id)).size,189);
 assert.equal(issues.size,45);
 const d=discover(choice('mental','feelings'));
 for(const row of appearances)assert.deepEqual(d.servicesById[row.appearance_id].display,row.display);
 for(const record of sharedYouthCandidates){const s=supplementalServices[record.sourceRow.appearance_id];assert.deepEqual(s.sourceRow,record.sourceRow);assert.equal(s.checked,record.checked);assert.deepEqual(s.contactOptions.map(a=>a.href||a.url),record.contactOptions.map(a=>a.href||a.url));}
});

test('optional fields are curated and engine does not invoke old flow or band predicates',()=>{
 for(const j of journeys)for(const c of j.choices){const fields=discoveryFields(c);assert.ok(fields.filter(f=>f.id!=='region').length<=3,c.title);for(const f of fields)assert.ok(f.id&&f.label&&f.type&&Array.isArray(f.options));}
 const source=readFileSync(new URL('../support-discovery.mjs',import.meta.url),'utf8');
 assert.doesNotMatch(source,/\b(?:getFlowState|questionsFor|verifiedResults|qualifies)\s*\(/);
 assert.doesNotMatch(source,/['"](?:12-17|18-25|19-25|26\+)['"]/);
 assert.ok(discover({topicId:'help',need:'default'},{region:'alice'}).ids.length);
});

test('shared youth phone actions follow actual selected offices and retain source contact text',()=>{
 const towns={darwin:'tel:0889464800',palmerston:'tel:0889317100',katherine:'tel:0889636100',alice:'tel:0889518000',gove:'tel:0889393400'};
 for(const [region,phone] of Object.entries(towns)){
  const s=resultRows(tonight,{region,age:'17'}).find(s=>s.sourceCatalogueId==='anglicare-yhopp');
  assert.deepEqual(s.contactOptions.filter(a=>a.channel==='phone').map(a=>a.href||a.url),[phone]);
  assert.equal(s.contact,s.sourceRow.display.contact);
 }
 const unknown=resultRows(tonight,{age:'17'}).find(s=>s.sourceCatalogueId==='anglicare-yhopp');
 assert.ok(unknown.contactOptions.filter(a=>a.channel==='phone').every(a=>/Darwin|Palmerston|Katherine|Alice|Nhulunbuy/.test(a.label)));
 const casy=resultRows(tonight,{region:'darwin',age:'17'}).find(s=>s.sourceCatalogueId==='ywca-casy-house');
 assert.match(casy.contactOptions.find(a=>a.channel==='email').label,/non-urgent/);
 assert.match(casy.hours,/24\/7/);
});
