import assert from 'node:assert/strict';
import test from 'node:test';
import {questionsFor, getResults, regionModeFor} from '../support-paths.mjs';
import {services} from '../support-catalog.mjs';

const ids=(topic,a)=>{const r=getResults(topic,a);return [...r.ids,...r.moreIds];};
const questions=(topic,a)=>questionsFor(topic,a).map(q=>q.id);

test('children select an age once, without adult service-history questions',()=>{
 for(const need of ['feelings','treatment','grief'])for(const age of ['0-4','5-11','12-17']){
  const qs=questions('mental',{need,age,region:'darwin'});
  assert.ok(qs.includes('age'));
  assert.ok(!qs.includes('childAge'));
  assert.ok(!qs.includes('counselling'));
 }
});
test('a former partner can see the Open Arms eligibility enquiry from relationship counselling',()=>{
 const r=getResults('relationships',{need:'counselling',counselling:'other',region:'nt'});
 assert.equal(r.ids[0],'relationships-australia-nt');
 assert.ok(r.ids.includes('open-arms-check'));
 assert.ok(r.ids.includes('family-advice'));
 assert.match(services['open-arms-check'].access,/five years.*co-parenting/);
});
test('recent leavers retain Defence transition support inside and outside the NT',()=>{
 for(const [region,expected]of [['nt','transition'],['outside','transition-national']]){
  const a={need:'transition',connection:'former',leftWhen:'recent',region};
  assert.equal(getResults('work',a).ids[0],expected);
 }
 for(const region of ['nt','outside'])assert.ok(ids('work',{need:'transition',connection:'former',leftWhen:'unsure',region}).some(id=>id.startsWith('transition')));
 assert.ok(!ids('work',{need:'transition',connection:'former',leftWhen:'earlier'}).some(id=>id.startsWith('transition')));
});
test('current-serving family crisis and urgent care expose assessed ASP alongside Defence help',()=>{
 for(const connection of ['serving','reserve']){
  assert.ok(ids('money',{need:'family-crisis',connection}).includes('dva-acute-support'));
  assert.ok(ids('parenting',{need:'emergency-care',connection}).includes('dva-acute-support'));
 }
 assert.match(services['dva-acute-support'].cost,/assessed/);
});
test('ADF members can find their clinical system without sending civilian families to member-only care',()=>{
 const r=ids('care',{need:'health',healthFor:'member'});
 for(const id of ['adf-healthcare','adf-imsick','adf-allhours'])assert.ok(r.includes(id));
 assert.equal(getResults('care',{need:'costs',connection:'serving',role:'member'}).ids[0],'adf-healthcare');
 const family=ids('care',{need:'health',healthFor:'family'});
 assert.ok(family.includes('adf-allhours'));
 assert.ok(!family.includes('adf-imsick'));
 assert.equal(family[0],'healthdirect');
});
test('funded mental treatment distinguishes serving care from former-member funding and family eligibility',()=>{
 assert.equal(getResults('mental',{need:'treatment',age:'26+',counselling:'member',region:'alice'}).ids[0],'dva-mental-treatment');
 assert.equal(getResults('mental',{need:'treatment',age:'26+',counselling:'serving',region:'alice'}).ids[0],'adf-healthcare');
 assert.ok(ids('mental',{need:'treatment',age:'26+',counselling:'serving',region:'alice'}).includes('dva-mental-treatment'));
 for(const counselling of ['partner','child']){
  const r=ids('mental',{need:'treatment',age:'26+',counselling,region:'alice'});
  assert.ok(r.includes('connect-wellbeing-nt'));
  assert.ok(!r.includes('dva-mental-treatment'));
 }
 const member={need:'treatment',age:'26+',counselling:'reserve',role:'member',region:'darwin'};
 assert.ok(ids('mental',member).includes('dva-mental-treatment'));
 assert.ok(!ids('mental',{...member,role:'partner'}).includes('dva-mental-treatment'));
 const formerReserve=getResults('mental',{...member,counselling:'other'});
 assert.ok(formerReserve.moreIds.includes('dva-mental-treatment'));
 assert.ok(!formerReserve.ids.includes('dva-mental-treatment'));
 assert.equal(getResults('mental',{need:'feelings',age:'26+',counselling:'member',region:'alice'}).preferenceLink.href,'#mental/treatment');
});
test('DVA-covered travel does not inherit a new arrival’s PATS residence limit',()=>{
 const a={need:'travel',connection:'former',dvaTravel:'yes',region:'alice',ntResidence:'no'};
 assert.equal(getResults('care',a).ids[0],'dva-treatment-travel');
 assert.ok(ids('care',a).includes('dva-booked-car'));
 assert.ok(!questions('care',a).includes('ntResidence'));
 assert.ok(!questions('care',a).includes('region'));
 assert.ok(!ids('care',a).some(id=>id.startsWith('pats-')));
 const no={...a,dvaTravel:'no'};
 assert.equal(getResults('care',no).ids[0],'patient-travel-alice');
 assert.ok(questions('care',no).includes('ntResidence'));
 assert.ok(ids('care',{...a,dvaTravel:'unsure'}).includes('dva-treatment-travel'));
});
test('a carer finds DVA home support for the person receiving care, without losing carer support',()=>{
 const r=getResults('care',{need:'carer',veteranCare:'yes'});
 assert.equal(r.ids[0],'carer-gateway');
 assert.ok(r.ids.includes('dva-home-care'));
 assert.ok(r.ids.includes('dva-household-care'));
 assert.match(services['dva-home-care'].cost,/co-payments/);
 assert.ok(!ids('care',{need:'carer',veteranCare:'no'}).includes('dva-home-care'));
});
test('reduced income has a benefit or aid action, instead of a debt-only script',()=>{
 const a={need:'income',connection:'former',role:'member'};
 const r=getResults('money',a);
 for(const id of ['payment-service-finder','bravery-financial-aid','dva-income-support'])assert.ok(r.ids.includes(id));
 assert.ok(ids('money',{...a,role:'partner'}).includes('dva-income-support'));
 assert.match(r.say,/income has reduced/);
 const relative=ids('money',{...a,connection:'unsure',role:'other'});
 assert.ok(!relative.includes('bravery-financial-aid'));
 assert.ok(relative.includes('payment-service-finder'));
});
test('a younger veteran asking for themselves can find home care without choosing unpaid carer or aged care',()=>{
 const need=questionsFor('care').find(q=>q.id==='need');
 assert.ok(need.options.some(o=>o.value==='home-care'));
 const a={need:'home-care',veteranCare:'yes'};
 assert.equal(getResults('care',a).ids[0],'dva-home-care');
 assert.ok(ids('care',a).includes('dva-household-care'));
 assert.ok(!questions('care',a).includes('homeCareAge'));
 assert.equal(getResults('care',{need:'home-care',veteranCare:'no',homeCareAge:'older'}).ids[0],'aged-care');
});
test('child and family mental-health offers follow verified communities, not an all-NT assumption',()=>{
 for(const [region,localCommunity,expected]of [['darwin',undefined,'catholiccare-fmhss-darwin'],['remote','jabiru','catholiccare-fmhss-jabiru'],['remote','wadeye','catholiccare-fmhss-wadeye']]){
  const a={need:'feelings',age:'5-11',region,localCommunity};
  assert.equal(getResults('mental',a).ids[0],expected);
 }
 for(const region of ['palmerston','alice','outside'])assert.ok(!ids('mental',{need:'feelings',age:'5-11',region}).some(id=>id.startsWith('catholiccare-fmhss-')));
 assert.equal(getResults('mental',{need:'treatment',age:'12-17',region:'tennant'}).ids[0],'catholiccare-yes-tennant');
 assert.ok(!ids('mental',{need:'treatment',age:'5-11',region:'tennant'}).includes('catholiccare-yes-tennant'));
});
test('Katherine and Tennant outreach includes 10–11 and 19–25, while ReConnect keeps its age limit',()=>{
 for(const region of ['katherine','tennant'])for(const youthAge of ['10-11','12-18','19-25'])assert.equal(getResults('money',{need:'youth-housing',region,youthAge}).ids[0],`catholiccare-outreach-${region}`);
 assert.ok(!ids('money',{need:'youth-housing',region:'katherine',youthAge:'other'}).includes('catholiccare-outreach-katherine'));
 assert.ok(!ids('money',{need:'youth-housing',region:'darwin',youthAge:'19-25'}).includes('reconnect-darwin'));
});
test('independent advocacy is available for Darwin/Palmerston government school families',()=>{
 const a={need:'learning',connection:'former',schoolType:'government',schoolHelp:'advocacy'};
 for(const region of ['darwin','palmerston'])assert.equal(getResults('parenting',{...a,region}).ids[0],'student-advocacy-54reasons');
 for(const region of ['katherine','alice','outside'])assert.ok(!ids('parenting',{...a,region}).includes('student-advocacy-54reasons'));
 assert.ok(!ids('parenting',{...a,region:'darwin',schoolType:'other'}).includes('student-advocacy-54reasons'));
});
test('East Arnhem has local money and refuge contacts with accurate audience and costs',()=>{
 assert.equal(regionModeFor('money',{need:'bills'}),'full');
 assert.equal(getResults('money',{need:'bills',connection:'former',role:'partner',region:'gove'}).ids[0],'east-arnhem-money-hub');
 const r=getResults('relationships',{need:'refuge',refugeFor:'woman-child',region:'gove'});
 assert.equal(r.ids[0],'miyalk-shelter');
 assert.ok(r.ids.includes('respect'));
 assert.match(services['miyalk-shelter'].cost,/charges/);
 assert.ok(!ids('relationships',{need:'refuge',refugeFor:'other',region:'gove'}).includes('miyalk-shelter'));
});
test('QLife has a direct actionable chat destination',()=>{
 assert.equal(services.qlife.chatUrl,'https://www.qlife.org.au/resources/chat');
 assert.match(services.qlife.chatLabel,/webchat/i);
});
