import test from 'node:test';
import assert from 'node:assert/strict';
import {questionsFor} from '../support-paths.mjs';
import {getFlowState,applyAnswer} from '../support-flow.mjs';
import {verifiedResults,appearanceById,appearances} from '../support-routing.mjs';
const rows=(topic,a)=>{const r=verifiedResults(topic,a);return [...r.ids,...r.moreIds].map(id=>appearanceById[id]);};
const ids=(topic,a)=>rows(topic,a).map(row=>Number(row.catalogue_id));
const asked=(topic,a,id)=>questionsFor(topic,a).some(q=>q.id===id);
const subregions=['topend','bigrivers','barkly','central','eastarnhem','jabiru','nauiyu','wadeye','other'];

test('proven invariant remote fields are scoped out without changing contacts',()=>{
 const cases=[
  ['money',{need:'defence-housing',housingTask:'home',connection:'serving',region:'remote'}],
  ['money',{need:'tonight',connection:'former',accommodationFor:'household',region:'remote'}],
  ['money',{need:'essentials',region:'remote'}],
  ['money',{need:'youth-housing',youthAge:'19-25',region:'remote'}],
  ['relationships',{need:'assault',region:'remote'}],
  ['relationships',{need:'separation',separationHelp:'child-contact',region:'remote'}],
  ['relationships',{need:'legal',womenLegal:'yes',legalIssue:'migration',region:'remote'}],
  ['connection',{need:'local',connection:'serving',region:'remote'}],
  ['parenting',{need:'teenager',age:'12-17',region:'remote'}],
  ['care',{need:'costs',healthFunding:'member',region:'remote'}],
  ['care',{need:'travel',connection:'serving',role:'member',region:'remote'}]
 ];
 for(const[topic,a]of cases){
  assert.ok(!asked(topic,a,'remoteArea'),topic+'/'+a.need);
  const expected=verifiedResults(topic,a).ids;
  for(const remoteArea of subregions)assert.deepEqual(verifiedResults(topic,{...a,remoteArea}).ids,expected,topic+'/'+a.need+'/'+remoteArea);
 }
 assert.ok(!asked('money',{need:'essentials',region:'remote'},'reliefCommunity'));
 assert.ok(!asked('mental',{need:'feelings',age:'0-4',region:'remote'},'localCommunity'));
 assert.ok(asked('mental',{need:'feelings',age:'12-17',region:'remote'},'localCommunity'));
 assert.ok(asked('money',{need:'youth-housing',youthAge:'12-18',region:'remote'},'remoteArea'));
});
test('national enquiries avoid geography while real local housing restrictions remain',()=>{
 for(const[topic,a]of [['money',{need:'rent-assistance'}],['care',{need:'disability',disabilityNeed:'posting',connection:'serving'}],['parenting',{need:'learning',schoolType:'other'}]])assert.ok(!asked(topic,a,'region'));
 assert.ok(asked('money',{need:'tonight',connection:'serving'},'housingReason'));
 assert.ok(!asked('money',{need:'housing',connection:'serving'},'housingReason'));
 assert.ok(!asked('money',{need:'housing'},'connection'));
 assert.ok(asked('money',{need:'tonight',accommodationFor:'single-adult'},'housingAge'));
 assert.ok(!asked('money',{need:'tonight',accommodationFor:'single-adult',housingAge:'18',region:'katherine'},'adultAccommodation'));
 assert.ok(asked('money',{need:'tonight',accommodationFor:'single-adult',housingAge:'25+',region:'katherine'},'adultAccommodation'));
 assert.ok(asked('money',{need:'tonight',accommodationFor:'single-adult',housingAge:'18',region:'alice'},'adultAccommodation'));
});
test('childcare hours decide whether Defence connection is needed before asking it',()=>{
 const flow=getFlowState('parenting',{need:'childcare'});assert.equal(flow.nextQuestion.id,'careHours');
 const next=applyAnswer('parenting',flow.answers,'careHours','nonstandard');assert.ok(!next.questions.some(q=>q.id==='connection'));
 assert.ok(asked('parenting',{need:'childcare',careHours:'regular'},'connection'));
});
test('young carers outside 5–25 keep general carer support without Kids Helpline',()=>{
 for(const carerAge of ['under5','26+']){const a={need:'young-carer',carerAge};assert.ok(!ids('care',a).includes(70));assert.ok(ids('care',a).includes(16));}
 for(const carerAge of ['5-11','12-25'])assert.ok(ids('care',{need:'young-carer',carerAge}).includes(70));
 const q=questionsFor('care',{need:'young-carer'}).find(q=>q.id==='carerAge');assert.ok(!q.options.some(o=>o.value==='under12'));
 assert.match(appearances.find(row=>row.issue_number===16&&Number(row.catalogue_id)===70).display.who,/5–25/);
});
test('card and accepted-condition home care select their actual source programmes',()=>{
 assert.deepEqual(ids('care',{need:'home-care',veteranCare:'card'}),[125]);
 assert.deepEqual(ids('care',{need:'home-care',veteranCare:'condition'}),[49]);
 assert.deepEqual(ids('care',{need:'home-care',veteranCare:'both'}),[49,125]);
 assert.ok(!ids('care',{need:'older',olderNeed:'care',veteranCare:'no'}).includes(125));
 const q=questionsFor('care',{need:'older',olderNeed:'care'}).find(q=>q.id==='veteranCare');assert.ok(!q.options.some(o=>o.value==='condition'));
 const fallback={need:'home-care',veteranCare:'no',homeCareAge:'younger'};assert.ok(asked('care',fallback,'region'));
 assert.equal(ids('care',{...fallback,region:'darwin'})[0],90);assert.equal(ids('care',{...fallback,region:'outside'})[0],83);
});
test('published remote maternity regions retain explicit access and referral qualifications',()=>{
 const matches={bigrivers:'3158a5d5391e8a81',barkly:'6b48fffc67665a19',central:'ab7e196c74afaec7',eastarnhem:'b5e59d212db862f3'};
 for(const[remoteArea,suffix]of Object.entries(matches)){const a={need:'baby',babyNeed:'maternity',region:'remote',remoteArea};assert.ok(asked('care',a,'remoteArea'));const result=rows('care',a);assert.ok(result.some(row=>row.route_id.endsWith(suffix)),remoteArea);assert.ok(result[0].display.access);}
 assert.match(rows('care',{need:'baby',babyNeed:'maternity',region:'remote',remoteArea:'eastarnhem'})[0].display.access,/GP referral/);
});
test('adult 18–25 treatment keeps member funding and Reserve role separate from family care',()=>{
 for(const age of ['18','19-25']){
  assert.equal(ids('mental',{need:'treatment',age,counselling:'serving',region:'darwin'})[0],50);
  assert.ok(ids('mental',{need:'treatment',age,counselling:'reserve',role:'member',region:'darwin'}).includes(50));
  for(const counselling of ['partner','child'])assert.ok(!ids('mental',{need:'treatment',age,counselling,region:'darwin'}).includes(50));
  assert.ok(!ids('mental',{need:'treatment',age,counselling:'reserve',role:'partner',region:'darwin'}).includes(50));
 }
 assert.ok(asked('mental',{need:'treatment',age:'18'},'counselling'));
 assert.ok(asked('mental',{need:'treatment',age:'19-25',counselling:'reserve'},'role'));
});
test('PATS uses its published qualifications without a duplicate residence prerequisite',()=>{
 const a={need:'travel',connection:'former',dvaTravel:'no',region:'katherine'};assert.ok(!asked('care',a,'ntResidence'));
 const pats=rows('care',a).find(row=>Number(row.catalogue_id)===93);assert.match(pats.display.who,/six-month residency/);assert.match(pats.display.access,/approval before booking/);
 assert.match(verifiedResults('care',a).note,/For PATS, ask about eligibility.*approval is needed before booking/);
 assert.doesNotMatch(verifiedResults('care',{need:'travel',connection:'serving',role:'member',region:'remote',ntResidence:'no'}).note,/PATS/);
});
test('care decisions ask only the domain and geography that select an applicable programme',()=>{
 assert.deepEqual(ids('care',{need:'care-skills',carerSkillNeed:'aged-rights'}),[97]);
 assert.deepEqual(ids('care',{need:'care-skills',carerSkillNeed:'support'}),[16,124]);
 assert.ok(!asked('care',{need:'care-skills',carerSkillNeed:'support'},'region'));
 assert.ok(!asked('care',{need:'care-skills',carerSkillNeed:'aged-rights'},'region'));
 assert.ok(asked('care',{need:'care-skills',carerSkillNeed:'disability-rights'},'region'));
 assert.equal(ids('care',{need:'care-skills',carerSkillNeed:'disability-rights',region:'alice'})[0],90);
});
test('independent school help remains independent, including qualified regional advice enquiries',()=>{
 const a={need:'learning',schoolType:'government',schoolHelp:'advocacy',region:'katherine'};
 assert.equal(ids('parenting',a)[0],4);assert.ok(!ids('parenting',a).includes(95));
 assert.match(verifiedResults('parenting',a).note,/Ask whether it can provide advice for your area/);
 assert.match(rows('parenting',a)[0].display.who,/Ask about advice outside Darwin/);
 assert.equal(ids('parenting',{...a,schoolHelp:'learning'})[0],95);
 assert.ok(!ids('parenting',{...a,region:'outside'}).includes(4));
 assert.match(verifiedResults('parenting',{...a,region:'outside'}).note,/do not establish a matching independent student-advocacy service/);
});

test('posted destination labels distinguish NT places from outside the NT',()=>{
 const a={need:'defence-housing',housingTask:'home',connection:'serving'};
 const q=questionsFor('money',a).find(question=>question.id==='region');
 assert.equal(q.options.find(option=>option.value==='outside').label,'Outside the NT');
 assert.equal(q.options.find(option=>option.value==='darwin').label,'Darwin');
 assert.ok(ids('money',{...a,region:'darwin'}).includes(39));
 assert.ok(!ids('money',{...a,region:'outside'}).includes(39));
});
test('definite recipient and move choices preserve routes without an unknown-situation caveat',()=>{
 for(const[topic,a,expected]of [
  ['care',{need:'costs',healthFunding:'dependant'},[7]],
  ['care',{need:'health',healthFor:'other'},[66]],
  ['money',{need:'defence-housing',housingTask:'other',connection:'serving'},[132]]
 ]){assert.deepEqual(ids(topic,a),expected);assert.doesNotMatch(verifiedResults(topic,a).note,/check the applicable eligibility/);}
 const travel={need:'travel',connection:'serving',role:'other',dvaTravel:'no',remotePosting:'no',region:'katherine'};
 assert.deepEqual(ids('care',travel),[93]);
 assert.match(verifiedResults('care',travel).note,/For PATS, ask about eligibility.*approval is needed before booking/);
 assert.doesNotMatch(verifiedResults('care',travel).note,/check the applicable eligibility/);
 assert.match(verifiedResults('care',{...travel,role:'unsure'}).note,/check the applicable eligibility/);
 assert.match(verifiedResults('care',{need:'costs',healthFunding:'other'}).note,/No treatment-funding route.*check the applicable eligibility/);
});

test('young carers reach practical support before a closed bursary application route',()=>{
 const a={need:'young-carer',carerAge:'12-25'};
 assert.deepEqual(ids('care',a),[16,130,70]);
 const bursary=rows('care',a).find(row=>Number(row.catalogue_id)===130);
 assert.match(bursary.display.offers,/Carer Gateway for practical support now/);
 assert.match(bursary.display.access,/2026 applications closed; 2027 dates unconfirmed/);
 assert.equal(ids('care',{need:'young-carer',carerAge:'5-11'})[0],16);
});
