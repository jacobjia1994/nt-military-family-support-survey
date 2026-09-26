import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {tasks, regions, ages, connections, counsellingConnections, fieldsFor, matchSupport} from '../support-model.mjs';
import {services} from '../support-catalog.mjs';
const base={region:'darwin',age:'26+',connection:'unsure',counselling:'other'};
const route=c=>matchSupport({...base,...c});
const scenarios=[
 ['Darwin parent needs help for a 3-year-old',{task:'children',focus:'wellbeing',age:'0-4'},'parentline',['kids-helpline','eheadspace','darwin-mmhc']],
 ['Eight-year-old wants to talk',{task:'children',focus:'wellbeing',age:'5-11'},'kids-helpline',['headspace-darwin','darwin-mmhc']],
 ['Katherine 16-year-old needs local help',{task:'talk',focus:'feelings',region:'katherine',age:'12-17'},'headspace-katherine',['katherine-mmhc','open-arms']],
 ['Alice 23-year-old needs local help',{task:'talk',focus:'feelings',region:'alice',age:'18-25'},'headspace-alice',['headspace-darwin']],
 ['Remote NT teenager',{task:'talk',focus:'feelings',region:'remote',age:'12-17'},'eheadspace',['headspace-darwin','darwin-mmhc']],
 ['Unknown reserve history gets civilian option',{task:'talk',focus:'feelings'},'darwin-mmhc',['open-arms']],
 ['Veteran with confirmed full-time service',{task:'talk',focus:'feelings',counselling:'member'},'open-arms',[]],
 ['Adult daughter age 34 remains family eligible',{task:'talk',focus:'feelings',counselling:'child'},'open-arms',['kids-helpline','eheadspace']],
 ['Parent or former partner is not assumed eligible',{task:'talk',focus:'feelings',counselling:'other'},'darwin-mmhc',['open-arms']],
 ['Under-five outside NT does not get NT Parentline',{task:'talk',focus:'feelings',age:'0-4',region:'outside'},'family-advice',['parentline']],
 ['Adult child aged over25 is not sent to Kids Helpline',{task:'children',focus:'wellbeing',age:'26+'},'darwin-mmhc',['kids-helpline','parentline']],
 ['Grief unrelated to suicide',{task:'talk',focus:'grief'},'griefline',['standby']],
 ['Support after suicide does not require service history',{task:'talk',focus:'suicide-loss',region:'remote'},'standby',[]],
 ['Current Tindal family needs local settling support',{task:'moving',focus:'settle',region:'katherine',connection:'serving'},'dmfs-tindal',['dmfs-darwin']],
 ['Retired family settling in Alice',{task:'moving',focus:'settle',region:'alice',connection:'former'},'wellbeing-agency',['dmfs-darwin']],
 ['Serving family needs school transition help',{task:'children',focus:'school',connection:'serving'},'school-change',[]],
 ['Former-member family school administration',{task:'children',focus:'school',connection:'former'},'nt-school',['school-change']],
 ['Serving partner needs childcare',{task:'children',focus:'childcare',connection:'serving'},'childcare-connect',[]],
 ['Veteran partner childcare search',{task:'children',focus:'childcare',connection:'former'},'startingblocks',['childcare-connect']],
 ['Veteran left years ago wants work',{task:'work',focus:'job',connection:'former'},'soldieron-work',['transition']],
 ['Current NT member preparing transition',{task:'work',focus:'transition',connection:'serving'},'transition',[]],
 ['Outside-NT member preparing transition',{task:'work',focus:'transition',connection:'serving',region:'outside'},'transition-national',['transition']],
 ['Alice family needs food',{task:'money',focus:'essentials',region:'alice'},'lc-alice',['catholiccare']],
 ['Bond or rent dispute',{task:'money',focus:'tenancy'},'tenancy-nt',[]],
 ['Debt advice is distinct from housing intake',{task:'money',focus:'bills'},'ndh',['housing-intake']],
 ['Serving family nowhere safe tonight',{task:'money',focus:'tonight',connection:'serving'},'dmfs-helpline',[]],
 ['Civilian family urgent housing avoids broken hotline',{task:'money',focus:'tonight'},'shelterme',[]],
 ['Unpaid young carer',{task:'care',focus:'carer',age:'12-17'},'carer-gateway',['childcare-connect']],
 ['Person needs own disability advocacy',{task:'care',focus:'disability'},'disability-nt',['carer-gateway']],
 ['Baby is unwell after hours',{task:'care',focus:'health',age:'0-4'},'healthdirect',['kids-helpline']],
 ['Man experiencing partner violence',{task:'safety',focus:'unsafe'},'respect',[]],
 ['Separation and parenting arrangements',{task:'safety',focus:'separation'},'family-advice',[]],
 ['Outside NT general legal problem',{task:'safety',focus:'legal',region:'outside'},'legal-national',['family-advice']],
 ['Outside NT needs housing tonight',{task:'money',focus:'tonight',region:'outside',connection:'former'},'askizzy-housing',[]],
 ['Tennant family needs essentials',{task:'money',focus:'essentials',region:'tennant'},'catholiccare-tennant',['ndh']],
 ['Remote essentials search',{task:'money',focus:'essentials',region:'remote'},'askizzy-food',['ndh']],
 ['Darwin recent sexual assault',{task:'safety',focus:'assault'},'sarc-darwin',[]],
 ['Older person needs their own care',{task:'care',focus:'older'},'aged-care',['carer-gateway']],
 ['Reserve civilian job conflict',{task:'work',focus:'reserve',connection:'serving'},'reserve-support',['transition']],
 ['Bereaved relative needs practical help',{task:'talk',focus:'bereavement-help'},'wellbeing-agency',['kids-helpline','griefline']],
 ['Remote veteran relative needs human navigation',{task:'help',region:'remote',connection:'former'},'wellbeing-agency',['dmfs-darwin']]
];
for(const [name,input,first,excluded] of scenarios)test(name,()=>{const result=route(input);assert.equal(result.ids[0],first);for(const id of excluded)assert.ok(!result.ids.includes(id),`${id} should not be suggested`);assert.ok(result.say.length>20);});
test('every route and context resolves to short contactable sourced results',()=>{
 for(const task of [...tasks,{id:'help',focuses:[]}])for(const focus of task.focuses.length?task.focuses.map(f=>f[0]):[''])for(const [region] of regions)for(const [age] of ages)for(const [connection] of connections)for(const [counselling] of counsellingConnections){
  const result=matchSupport({task:task.id,focus,region,age,connection,counselling});assert.ok(result.ids.length>=1&&result.ids.length<=3);
  for(const id of result.ids){const s=services[id];assert.ok(s,`missing ${id}`);for(const key of ['name','audience','area','offer','cost','url'])assert.ok(s[key],`${id} missing ${key}`);assert.equal(new URL(s.url).protocol,'https:');assert.ok(s.phone||s.action,`${id} needs a concrete action`);}
 }
});
test('privacy and questionnaire boundaries',()=>{
 const page=readFileSync(new URL('../support.html',import.meta.url),'utf8');const ui=readFileSync(new URL('../support.js',import.meta.url),'utf8');
 assert.ok(page.indexOf('<footer>')<page.indexOf('href="tel:000"'));
 assert.doesNotMatch(page+ui,/Search all topics|fetch\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|document\.cookie/);
 assert.match(page,/connect-src 'none'/);assert.doesNotMatch(page+ui,/contact\.html|survey\.js/);
 assert.match(ui,/type="submit"/);assert.match(ui,/rel="noreferrer"/);assert.match(page,/<noscript>/);
});
test('matching asks questions needed for age-sensitive routes',()=>{
 assert.equal(fieldsFor('children','wellbeing').age,true);assert.equal(fieldsFor('money','bills').age,false);assert.equal(fieldsFor('children','school').connection,true);
});
test('broken Central Intake number never appears as a call action',()=>{assert.equal(services['housing-intake'].phone,undefined);assert.match(services['housing-intake'].access,/down|outage/i);});
