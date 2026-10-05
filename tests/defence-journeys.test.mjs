import test from 'node:test';
import assert from 'node:assert/strict';
import {journeys} from '../support-journeys.mjs';
import {getFlowState,applyAnswer} from '../support-flow.mjs';
import {verifiedResults,appearanceById,appearances} from '../support-routing.mjs';
const rows=(topic,answers)=>{const result=verifiedResults(topic,answers);return [...result.ids,...result.moreIds].map(id=>appearanceById[id]);};
const ids=(topic,answers)=>rows(topic,answers).map(row=>Number(row.catalogue_id));
const seeded=(choice,answers={})=>({...answers,need:choice.need,...choice.answers});
function completePaths(choice,visitor){
 function visit(answers){const flow=getFlowState(choice.topicId,seeded(choice,answers));if(flow.complete){visitor(flow.answers,flow);return;}
  for(const option of flow.nextQuestion.options){const next=applyAnswer(choice.topicId,flow.answers,flow.nextQuestion.id,option.value);visit(next.answers);}}
 visit({});
}
test('specific task entries stay valid and reach every source issue and route',()=>{
 const unique=new Set(),routes=new Set(),issues=new Set();let states=0;
 for(const journey of journeys){assert.ok(!unique.has(journey.id));unique.add(journey.id);assert.ok(journey.choices.length>=1&&journey.choices.length<=6);
  for(const choice of journey.choices){const initial=getFlowState(choice.topicId,seeded(choice));assert.equal(initial.answers.need,choice.need,journey.id);
   for(const [key,value] of Object.entries(choice.answers||{}))assert.equal(initial.answers[key],value,`${journey.id} seed ${key}`);
   completePaths(choice,(answers)=>{states++;for(const row of rows(choice.topicId,answers)){routes.add(row.route_id);issues.add(row.issue_number);}});
  }
 }
 completePaths({topicId:'help'},answers=>{for(const row of rows('help',answers)){routes.add(row.route_id);issues.add(row.issue_number);}});
 const missing=[...new Map(appearances.filter(row=>!routes.has(row.route_id)).map(row=>[row.route_id,`${row.catalogue_id} ${row.display.name}`])).values()];
 assert.equal(routes.size,189,`Unreachable routes: ${missing.join('; ')}`);assert.equal(issues.size,45);assert.ok(states>100);
});
test('national or specific direct tasks avoid unused eligibility questions',()=>{
 const direct=[['mental',{need:'crisis'}],['mental',{need:'private'}],['mental',{need:'lgbtq'}],['mental',{need:'distress-signs'}],['care',{need:'health',healthFor:'other'}],['connection',{need:'apart',absenceNeed:'support'}],['connection',{need:'apart',absenceNeed:'child'}],['money',{need:'budgeting'}],['work',{need:'flexible'}]];
 for(const [topic,a]of direct){const flow=getFlowState(topic,a);assert.equal(flow.complete,true,`${topic}/${a.need}`);}
 assert.ok(!getFlowState('money',{need:'bills'}).questions.some(q=>['connection','role'].includes(q.id)));
 assert.ok(!getFlowState('connection',{need:'settle',connection:'serving',region:'darwin'}).questions.some(q=>q.id==='role'));
});
test('task results have relevant first contacts rather than broad incidental enquiries',()=>{
 const tests=[['mental',{need:'distress-signs'},77],['mental',{need:'private'},112],['mental',{need:'lgbtq'},105],['work',{need:'flexible'},37],['work',{need:'rehabilitation'},51],['money',{need:'budgeting'},8],['parenting',{need:'moving-care'},140],['money',{need:'home-ownership'},38],['connection',{need:'nt-preparedness',region:'nt'},134],['connection',{need:'pastoral'},6],['mental',{need:'nt-crisis',region:'nt'},92],['care',{need:'carer'},16]];
 for(const[topic,a,id]of tests)assert.equal(ids(topic,a)[0],id,`${topic}/${a.need}`);
 assert.ok(!ids('connection',{need:'settle',connection:'serving',region:'darwin'}).includes(23));
 assert.ok(!ids('parenting',{need:'emergency-care',connection:'serving'}).includes(16));
 assert.ok(!ids('care',{need:'costs',healthFunding:'dependant'}).includes(66));
 assert.deepEqual(ids('mental',{need:'addiction',addiction:'gambling'}),[60,11,80]);
 assert.ok(!ids('mental',{need:'addiction',addiction:'substances'}).includes(60));
});
test('local maternity, child emotional support and childcare enter actual regional routes',()=>{
 assert.equal(ids('care',{need:'baby',babyNeed:'maternity',region:'gove'})[0],91);
 const maternity=rows('care',{need:'baby',babyNeed:'maternity',region:'gove'})[0];assert.match(maternity.display.access,/GP referral/);
 assert.ok(ids('mental',{need:'feelings',age:'under18',childAge:'0-4',region:'darwin'}).includes(87));
 assert.ok(ids('mental',{need:'feelings',age:'under18',childAge:'12-17',region:'katherine'}).includes(63));
 assert.ok(!ids('mental',{need:'grief',age:'under18',childAge:'12-17',region:'darwin'}).includes(61));
 assert.equal(ids('parenting',{need:'childcare',careHours:'regular',connection:'serving',region:'palmerston'})[0],98);
 assert.equal(ids('parenting',{need:'childcare',careHours:'regular',connection:'serving',region:'katherine'})[0],99);
 assert.ok(!ids('parenting',{need:'childcare',careHours:'nonstandard',connection:'serving',region:'nt'}).includes(140));
});
test('stable housing and losing a home preserve a short, qualified path',()=>{
 for(const need of ['stable-housing','losing-housing']){const a={need,region:'nt',...(need==='losing-housing'?{housingRisk:'other'}:{})};const flow=getFlowState('money',a);assert.ok(flow.complete);assert.ok(!flow.questions.some(q=>['housingAge','accommodationFor','role','connection'].includes(q.id)));assert.equal(ids('money',a)[0],86);}
 assert.equal(ids('money',{need:'losing-housing',housingRisk:'tenancy',region:'nt'})[0],32);
 assert.ok(getFlowState('money',{need:'tonight'}).questions.some(q=>q.id==='accommodationFor'));
});

test('unpreset age keeps 18 and 19–25 eligible for headspace while 26+ uses adult care',()=>{
 const choice=journeys.find(task=>task.id==='mental-health').choices[0];
 assert.equal(choice.title,'Talk about stress, mood or mental health');assert.ok(!choice.answers?.age);
 const initial=getFlowState(choice.topicId,seeded(choice));assert.equal(initial.nextQuestion.id,'age');
 for(const age of ['18','19-25','26+']){
  let flow=getFlowState(choice.topicId,seeded(choice));
  flow=applyAnswer(choice.topicId,flow.answers,'age',age);
  flow=applyAnswer(choice.topicId,flow.answers,'counselling','other');
  flow=applyAnswer(choice.topicId,flow.answers,'region','darwin');
  assert.ok(flow.complete);
  const contacts=ids(choice.topicId,flow.answers);
  if(age==='26+'){assert.ok(!contacts.some(id=>[62,63,64,65].includes(id)));assert.equal(contacts[0],30);}
  else assert.equal(contacts[0],62);
 }
 const childChoice=journeys.find(task=>task.id==='child-wellbeing').choices[0];assert.equal(childChoice.answers.age,'under18');
});
