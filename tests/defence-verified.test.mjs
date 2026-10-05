import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {verifiedDefence} from '../support-verified-data.mjs';
import {appearances,appearanceById,services,needIssueMap,issueNumbersFor,verifiedResults,routeMatchesRegion,qualifies,safeURL,routeContactURLs,primaryWebURL,routeWebActions,recoveryResults} from '../support-routing.mjs';
import {topics,questionsFor} from '../support-paths.mjs';
import {getFlowState,applyAnswer} from '../support-flow.mjs';
const row=(number,id,hash)=>appearances.find(row=>row.issue_number===number&&Number(row.catalogue_id)===id&&(!hash||row.route_id.endsWith(hash)));
const resultRows=(topic,a)=>{const result=verifiedResults(topic,a);return [...result.ids,...result.moreIds].map(id=>appearanceById[id]);};

test('verified public snapshot retains all display objects, identities and ordering',()=>{
 assert.deepEqual(verifiedDefence.counts,{issue_groups:45,row_appearances:337,distinct_routes:189,catalogue_ids:141});
 assert.equal(appearances.length,337);assert.equal(new Set(appearances.map(r=>r.appearance_id)).size,337);
 assert.equal(new Set(appearances.map(r=>r.route_id)).size,189);assert.equal(new Set(appearances.map(r=>String(r.catalogue_id))).size,141);
 for(const issue of verifiedDefence.issues){let previous=-1;for(const r of issue.rows){assert.ok(r.geography.rank>=previous);previous=r.geography.rank;assert.deepEqual(services[r.appearance_id].display,r.display);}}
 const source=process.env.DEFENCE_VERIFIED_SOURCE;
 if(source)assert.deepEqual(verifiedDefence,JSON.parse(fs.readFileSync(source,'utf8')));
});
test('all45 issues map to deliberately offered needs',()=>{
 const numbers=new Set();
 for(const [topic,map] of Object.entries(needIssueMap))for(const [need,ids] of Object.entries(map)){
  if(topic!=='help'&&need!=='indigenous'&&need!=='men')assert.ok(questionsFor(topic,{need}).find(q=>q.id==='need').options.some(o=>o.value===need),`${topic}/${need} is offered`);
  ids.forEach(id=>numbers.add(id));
 }
 assert.deepEqual([...numbers].sort((a,b)=>a-b),Array.from({length:45},(_,i)=>i+1));
});
test('uses issue-specific Open Arms and Acute Support display without canonical overwrite',()=>{
 const oa18=row(18,100),oa35=row(35,100),oa38=row(38,100),acute6=row(6,47),acute38=row(38,47);
 assert.match(oa18.display.who,/five years/);assert.match(oa35.display.who,/foreign service alone/);assert.match(oa38.display.who,/Bereaved/i);
 assert.notEqual(oa18.display.who,oa35.display.who);assert.notEqual(acute6.display.who,acute38.display.who);
 assert.ok(resultRows('relationships',{need:'separation',region:'nt'}).some(r=>r.appearance_id===oa18.appearance_id));
 assert.ok(resultRows('connection',{need:'defence-aware'}).some(r=>r.appearance_id===oa35.appearance_id));
 assert.ok(resultRows('mental',{need:'practical-loss',dvaClient:'yes',legacyFit:'eligible',region:'nt'}).some(r=>r.appearance_id===acute38.appearance_id));
});
test('single adults, age25/nochildren and men-only housing are decisive',()=>{
 const house49=row(7,106),bakhita=row(7,126,'07ec6e29adf9de37'),ormonde=row(7,127,'334e107957a101b6'),todd=row(7,122),sunrise=row(7,117);
 const base={need:'tonight',connection:'former',region:'darwin',accommodationFor:'single-adult',housingAge:'18'};
 assert.equal(qualifies(bakhita,base,'money'),false);assert.equal(qualifies(sunrise,base,'money'),true);
 assert.equal(qualifies(house49,{...base,housingAge:'19-24'},'money'),false);
 assert.equal(qualifies(house49,{...base,housingAge:'25+',accommodationFor:'household'},'money'),false);
 assert.equal(qualifies(house49,{...base,housingAge:'25+',accommodationFor:'couple'},'money'),true);
 assert.equal(qualifies(ormonde,{...base,region:'katherine',housingAge:'25+',adultAccommodation:'other'},'money'),false);
 assert.equal(qualifies(todd,{...base,region:'alice',adultAccommodation:'other'},'money'),false);
 assert.equal(qualifies(todd,{...base,region:'alice',adultAccommodation:'men'},'money'),true);
 for(const r of resultRows('money',{...base,accommodationFor:'household'}))assert.ok(![106,117,122,69].includes(Number(r.catalogue_id)));
 assert.ok(questionsFor('money',{need:'housing',region:'katherine',accommodationFor:'single-adult'}).some(q=>q.id==='housingAge'));
 assert.ok(questionsFor('money',{need:'housing',region:'katherine',accommodationFor:'single-adult'}).some(q=>q.id==='adultAccommodation'));
});
test('local and remote routes retain actual catchments rather than inheriting NT-wide rank',()=>{
 const central=row(25,89,'b6d483baaeb96cc7'),cawls=row(19,94,'13722d39e8e31aa7'),reconnect=row(15,12,'16ceec286732be79'),intake=row(7,86);
 assert.equal(routeMatchesRegion(central,'tennant'),true);assert.equal(routeMatchesRegion(cawls,'alice'),true);
 assert.equal(routeMatchesRegion(reconnect,'remote',{remoteArea:'central'}),false);assert.equal(routeMatchesRegion(reconnect,'gove'),true);
 assert.equal(routeMatchesRegion(row(7,122),'darwin'),false);assert.equal(routeMatchesRegion(row(7,117),'nt'),false);
 assert.equal(routeMatchesRegion(intake,'remote'),true);assert.equal(routeMatchesRegion(intake,'outside'),false);
 const youth=resultRows('mental',{need:'feelings',age:'12-17',region:'katherine'});assert.ok(youth.some(r=>Number(r.catalogue_id)===63));assert.ok(!youth.some(r=>[62,64,65].includes(Number(r.catalogue_id))));
});
test('flow removes stale housing qualifications and has no duplicate conditional fields',()=>{
 const base={need:'tonight',connection:'former',accommodationFor:'single-adult',housingAge:'25+',region:'katherine',adultAccommodation:'men'};
 const next=applyAnswer('money',base,'accommodationFor','household','katherine');assert.ok(!('housingAge'in next.answers));assert.ok(!('adultAccommodation'in next.answers));
 for(const [topic,map] of Object.entries(needIssueMap))for(const need of Object.keys(map)){
  const q=questionsFor(topic,{need,region:'remote',age:'12-17',connection:'serving',languageNeed:'cultural'});
  assert.equal(new Set(q.map(q=>q.id)).size,q.length,`${topic}/${need}`);
 }
 assert.equal(getFlowState('money',{...base,housingAge:'unknown'}).complete,false);
});
test('visible route contact buttons exclude sibling phone URLs and outage phones',()=>{
 for(const r of appearances){const service=services[r.appearance_id];for(const url of routeContactURLs(service).filter(url=>url.startsWith('tel:')))assert.ok(service.contact.replace(/\D/g,'').includes(url.replace(/\D/g,'')));}
 for(const [number,id,hash,phone] of [[15,12,'16ceec286732be79','tel:0889393400'],[23,9,'e567cf9371c84887','tel:0879782391']]){
  const service=services[row(number,id,hash).appearance_id];const phones=routeContactURLs(service).filter(url=>url.startsWith('tel:'));assert.deepEqual(phones,[phone]);
 }
 assert.ok(!routeContactURLs(services[row(7,86).appearance_id]).some(url=>url.startsWith('tel:')));
 assert.equal(safeURL('javascript:alert(1)'),null);assert.equal(safeURL('tel:000'),'tel:000');
});

test('actual complete question paths reach all189 routes while returning at most six relevant contacts',()=>{
 const routes=new Set(),issues=new Set();
 for(const topic of [...topics,{id:'help'}]){
  function visit(answers){const flow=getFlowState(topic.id,answers);if(flow.complete){const result=verifiedResults(topic.id,flow.answers),ids=[...result.ids,...result.moreIds];assert.ok(ids.length<=6);assert.equal(new Set(ids.map(id=>appearanceById[id].route_id)).size,ids.length);for(const id of ids){const row=appearanceById[id];routes.add(row.route_id);issues.add(row.issue_number);}return;}for(const option of flow.nextQuestion.options)visit({...flow.answers,[flow.nextQuestion.id]:option.value});}visit({});
 }
 assert.equal(routes.size,189);assert.equal(issues.size,45);
});
test('crisis links, outage form and known former-family restrictions remain actionable',()=>{
 const lifeline=services[row(40,74).appearance_id],respect=services[row(19,3).appearance_id],intake=services[row(7,86).appearance_id];
 assert.ok(routeContactURLs(lifeline).includes('tel:131114'));
 assert.ok(routeContactURLs(respect).includes('sms:0458737732'));
 assert.equal(primaryWebURL(intake),'https://www.lutherancare.org.au/nt-cis-enquiries/');
 assert.ok(!resultRows('connection',{need:'feedback',connection:'former'}).some(row=>Number(row.catalogue_id)===35));
 const baby=resultRows('mental',{need:'feelings',age:'0-4',region:'remote',localCommunity:'jabiru'});assert.ok(baby.some(row=>Number(row.catalogue_id)===102));
});

test('recovery recalculates regional and connection fits instead of reusing old contacts',()=>{
 const original={need:'tonight',connection:'serving',housingReason:'crisis',accommodationFor:'single-adult',housingAge:'25+',region:'darwin'};
 const previous=verifiedResults('money',original),handoff={topicId:'money',answers:original,previousPrimaryId:previous.ids[0],otherIds:previous.ids.slice(1)};
 const next=recoveryResults(handoff,{region:'alice',connection:'former'});
 for(const id of [...next.ids,...next.moreIds]){const r=appearanceById[id];assert.ok(routeMatchesRegion(r,'alice'));assert.notEqual(r.route_id,appearanceById[handoff.previousPrimaryId].route_id);assert.ok(![43,106,117,126].includes(Number(r.catalogue_id)));}
 assert.ok(next.ids.length);
 const member=resultRows('care',{need:'travel',connection:'serving',role:'member',region:'darwin',memberCentre:'larrakeyah'});assert.ok(member.some(r=>Number(r.catalogue_id)===9));assert.ok(!member.some(r=>[36,52,93].includes(Number(r.catalogue_id))));
});

test('a confirmed assigned centre remains reachable across Darwin and Palmerston',()=>{
 for(const region of ['darwin','palmerston'])for(const centre of ['darwin','larrakeyah','robertson']){const result=resultRows('care',{need:'health',healthFor:'member',region,memberCentre:centre});const hashes={darwin:'f1da0539f127b80d',larrakeyah:'3991d58873ccf7c3',robertson:'1abe21b2395e5ff6'};assert.ok(result.some(row=>row.route_id.endsWith(hashes[centre])));assert.equal(result.filter(row=>Number(row.catalogue_id)===9).length,1);}
});

test('route call actions also use exact published phone text when source tel URLs are absent',()=>{
 for(const[number,id,phone]of[[23,7,'tel:1300561454'],[9,141,'tel:136150'],[7,132,'tel:1800333362']]){const source=row(number,id);assert.ok(!source.display.urls.some(url=>url.startsWith('tel:')));assert.ok(routeContactURLs(services[source.appearance_id]).includes(phone));}
 assert.ok(!routeContactURLs(services[row(7,86).appearance_id]).some(url=>url.startsWith('tel:')));
 const tindal=services[row(23,9,'e567cf9371c84887').appearance_id];assert.deepEqual(routeContactURLs(tindal).filter(url=>url.startsWith('tel:')),['tel:0879782391']);
 const nhulunbuy=services[row(15,12,'16ceec286732be79').appearance_id];assert.deepEqual(routeContactURLs(nhulunbuy).filter(url=>url.startsWith('tel:')),['tel:0889393400']);
});
test('three invariant remote subregion branches skip that question while genuine catchments retain it',()=>{
 const subregions=['topend','bigrivers','barkly','central','eastarnhem','jabiru','nauiyu','wadeye','other'];
 for(const[topic,answers]of[['connection',{need:'settle',connection:'serving',region:'remote'}],['parenting',{need:'childcare',careHours:'regular',connection:'serving',region:'remote'}],['care',{need:'health',healthFor:'member',region:'remote'}]]){
  const expected=verifiedResults(topic,answers);
  for(const remoteArea of subregions)assert.deepEqual(verifiedResults(topic,{...answers,remoteArea}).ids,expected.ids);
  const flow=getFlowState(topic,answers);assert.ok(flow.complete);assert.ok(!flow.questions.some(q=>q.id==='remoteArea'));
 }
 const travel={need:'travel',connection:'former',dvaTravel:'no',region:'remote',ntResidence:'yes'};assert.ok(getFlowState('care',travel).questions.some(q=>q.id==='remoteArea'));
 const barkly=verifiedResults('care',{...travel,remoteArea:'barkly'}),central=verifiedResults('care',{...travel,remoteArea:'central'});assert.notDeepEqual(barkly.ids,central.ids);
 assert.ok(getFlowState('mental',{need:'indigenous',indigenousNeed:'local',region:'remote'}).questions.some(q=>q.id==='remoteArea'));
});

test('school remote subareas and former settlement locations with identical contacts are skipped',()=>{
 const school={need:'learning',schoolType:'government',schoolHelp:'advocacy',region:'remote'};const before=verifiedResults('parenting',school);
 for(const remoteArea of ['topend','bigrivers','barkly','central','eastarnhem','jabiru','nauiyu','wadeye','other'])assert.deepEqual(verifiedResults('parenting',{...school,remoteArea}).ids,before.ids);
 assert.ok(getFlowState('parenting',school).complete);assert.ok(!getFlowState('parenting',school).questions.some(q=>q.id==='remoteArea'));
 for(const connection of ['former','bereaved']){const a={need:'settle',connection};const expected=verifiedResults('connection',a);for(const region of ['darwin','palmerston','katherine','tennant','alice','gove','remote','outside'])assert.deepEqual(verifiedResults('connection',{...a,region}).ids,expected.ids);assert.ok(getFlowState('connection',a).complete);assert.ok(!getFlowState('connection',a).questions.some(q=>q.id==='region'));}
});
test('ordinary nonstandard childcare keeps its own route and emergency help remains reachable',()=>{
 const a={need:'childcare',careHours:'nonstandard',region:'nt'};const flow=getFlowState('parenting',a);assert.ok(flow.complete);assert.ok(!flow.questions.some(q=>q.id==='connection'));
 const result=resultRows('parenting',a);assert.deepEqual(result.map(r=>Number(r.catalogue_id)),[67]);
 const emergency=resultRows('parenting',{need:'emergency-care',connection:'serving'});assert.ok(emergency.some(r=>Number(r.catalogue_id)===58));assert.match(emergency.find(r=>Number(r.catalogue_id)===58).display.who,/away on duty or medically unable/);
});
test('benefit lookup and offline Centrelink access promote exact supplied web actions',()=>{
 for(const r of appearances.filter(r=>Number(r.catalogue_id)===113)){const service=services[r.appearance_id],actions=routeWebActions(service);assert.deepEqual(actions,[{url:'https://www.servicesaustralia.gov.au/payment-and-service-finder',label:'Check payments'},{url:'https://findus.servicesaustralia.gov.au/?msg=Centrelink',label:'Find in-person Centrelink help'}]);for(const action of actions)assert.ok(service.urls.includes(action.url));}
 assert.deepEqual(routeWebActions(services[row(7,86).appearance_id]),[{url:'https://www.lutherancare.org.au/nt-cis-enquiries/',label:'Use online referral form'}]);
});

test('ADF Equip source email stays actionable when published contact text names the program page',()=>{
 const source=appearances.find(row=>row.appearance_id==='defence:issue:02:row:002'),email='mailto:adfequip.program@defence.gov.au';
 assert.equal(source.display.contact,'Official program page');assert.ok(source.display.urls.includes(email));
 const actions=routeContactURLs(services[source.appearance_id]);assert.deepEqual(actions.filter(url=>url.startsWith('mailto:')),[email]);assert.ok(!actions.some(url=>url.startsWith('tel:')));
});
