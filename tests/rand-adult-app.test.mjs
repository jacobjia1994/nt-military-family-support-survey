import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const load=name=>JSON.parse(readFileSync(new URL(`../copy/${name}`,import.meta.url),'utf8'));
const data={part1:load('rand-appendix-part1.json'),problems:load('rand-appendix-q12-q20.json'),part2:load('rand-appendix-part2.json'),part3:load('rand-appendix-part3.json')};
const context=vm.createContext({structuredClone});
for(const name of ['rand-adult-engine.js','rand-adult-context-pages.js','rand-adult-problem-pages.js','rand-adult-part2-pages.js','rand-adult-part3-pages.js','rand-adult-app.js'])vm.runInContext(readFileSync(new URL(`../${name}`,import.meta.url),'utf8'),context);
const app=context.SURVEY_RAND_ADULT_APP.create({main:{},data});

test('adult survey starts with RAND study questions and continues to original problem pages',()=>{
  const pages=app.buildPages({});
  assert.deepEqual(Array.from(pages[0].questions,question=>question.id),['Q1','Q2']);
  assert.equal(pages[1].questions[0].id,'Q3');
  assert.equal(pages.some(page=>page.id==='problems:Q12'),true);
  assert.equal(pages.some(page=>page.id==='problems:Q17'),true,'past relationship problems remain available when current partnership is unknown');
  assert.equal(pages.some(page=>page.id==='top-two-problems'),false);
  assert.equal(pages.at(-1).questions.at(-1).id,'Q67');
});

test('adult RAND pages link selected problem and need to Q26–Q36',()=>{
  const answers={Q3:'married_member',Q8:{age_6_13:{number:'1'}},Q12:['Q12_1'],'needs:Q12':['H01'],'contacts:Q12:H01':['M04']};
  const pages=app.buildPages(answers);
  assert.equal(pages.some(page=>page.id==='problems:Q17'),true);
  assert.equal(pages.some(page=>page.id==='problems:Q18'),true);
  assert.equal(pages.some(page=>page.id==='problems:Q20'),true);
  assert.equal(pages.some(page=>page.id==='needs:Q12'),true);
  assert.equal(pages.some(page=>page.id==='contacts:Q12:H01'),true);
  assert.equal(pages.some(page=>page.id==='Q36'),true);
});

test('respondent can advance from Q24 into the original contact-source page',()=>{
  const answers={Q3:'married_member',Q12:['Q12_2'],Q14:['Q14_1'],Q22:['Q12','Q14'],'needs:Q12':['H01'],'needs:Q14':['H07']};
  const nodes=new Map();
  const node=selector=>{if(!nodes.has(selector))nodes.set(selector,{listeners:{},focus(){},addEventListener(type,fn){this.listeners[type]=fn;},querySelector:node});return nodes.get(selector);};
  const main={innerHTML:'',querySelector:node,querySelectorAll(){return [];}};
  const session=context.SURVEY_RAND_ADULT_ENGINE.create({main,buildPages:app.buildPages,initialAnswers:answers});
  session.start();
  assert.equal(session.goTo('needs:Q14'),true);
  node('#rand-adult-form').listeners.submit({preventDefault(){}});
  assert.match(main.innerHTML,/<h1 tabindex="-1">Ways of Meeting Needs<\/h1>/);
  assert.match(main.innerHTML,/Military contacts/);
  assert.match(main.innerHTML,/Nonmilitary contacts/);
});

test('every applicable question type renders across the full source route',()=>{
  const answers={Q3:'married_member',Q4:'army',Q5:['permanent'],Q6:['permanent'],Q8:{age_6_13:{number:'1'}},Q9:'yes',Q12:['Q12_2'],Q14:['Q14_1'],Q22:['Q12','Q14'],'needs:Q12':['H01'],'needs:Q14':['H07'],'contacts:Q12:H01':['M04','N06'],'contacts:Q14:H07':['N01'],Q53:'yes',Q60:'yes'};
  const pages=app.buildPages(answers);
  let rendered=0;
  for(const page of pages)for(const question of page.questions){
    assert.doesNotThrow(()=>context.SURVEY_RAND_ADULT_ENGINE.renderQuestion(question,answers),`${page.id} ${question.id}`);
    rendered++;
  }
  assert.ok(rendered>=50);
  assert.equal(pages.at(-1).questions.at(-1).id,'Q67');
});
