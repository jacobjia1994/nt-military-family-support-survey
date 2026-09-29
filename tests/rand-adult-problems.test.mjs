import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const data=JSON.parse(readFileSync(new URL('../copy/rand-appendix-q12-q20.json',import.meta.url),'utf8'));
const context=vm.createContext({});
vm.runInContext(readFileSync(new URL('../rand-adult-problem-pages.js',import.meta.url),'utf8'),context);
const {build,reported}=context.SURVEY_RAND_PROBLEMS;
const plain=value=>JSON.parse(JSON.stringify(value));

test('RAND problem flow shows its original domain pages, not the prior 45-cue board',()=>{
  const pages=plain(build({},data));
  assert.deepEqual(pages.filter(page=>page.id.startsWith('problems:')).map(page=>page.id),Array.from({length:9},(_,i)=>`problems:Q${i+12}`));
  assert.ok(pages.some(page=>page.id==='other-problems'));
  assert.equal(pages.some(page=>page.id==='top-two-problems'),false);
  assert.equal(pages.find(page=>page.id==='problems:Q17').questions[0].options.length,12);
});

test('partner and child conditions retain the original conditional domains',()=>{
  const unknown=plain(build({},data));
  assert.ok(unknown.some(page=>page.id==='problems:Q17'));
  assert.ok(unknown.some(page=>page.id==='problems:Q18'));
  assert.ok(unknown.some(page=>page.id==='problems:Q20'));
  const pages=plain(build({Q3:'unmarried_member','L-PARTNER':'no','Q8:none':true,'L-CHILD':'no'},data,{partnerStatus:()=>false,youngDependantStatus:()=>false,independentChildStatus:()=>false,dependantStatus:()=>false,selfMember:()=>true}));
  assert.ok(pages.some(page=>page.id==='problems:Q17'),'a relationship could have ended during the past year');
  assert.equal(pages.some(page=>page.id==='problems:Q18'),false);
  assert.equal(pages.some(page=>page.id==='problems:Q20'),false);
  const work=pages.find(page=>page.id==='problems:Q13').questions[0];
  assert.equal(work.options.some(option=>['Q13_3','Q13_6'].includes(option.id)),false);
  assert.equal(pages.find(page=>page.id==='problems:Q16').questions[0].options.some(option=>option.id==='Q16_4'),false);
});

test('Q15 partner-employment choice depends on the partner, not both people serving full-time',()=>{
  const member={Q3:'unmarried_member',Q5:['reserves'],Q6:['permanent'],'L-PARTNER':'partnered_unmarried'};
  const options=answers=>plain(build(answers,data,{partnerStatus:()=>true,selfMember:()=>true})).find(page=>page.id==='problems:Q15').questions[0].options;
  assert.equal(options(member).some(option=>option.id==='Q15_8'),false);
  member.Q6=['reserves'];
  assert.equal(options(member).some(option=>option.id==='Q15_8'),true);
  const civilian=plain(build({Q3:'civilian_spouse',Q5:['permanent'],Q6:['permanent']},data,{partnerStatus:()=>true,selfMember:()=>false})).find(page=>page.id==='problems:Q15').questions[0].options;
  assert.equal(civilian.some(option=>option.id==='Q15_8'),true);
});

test('Q22 displays selected source categories with their selected original choices',()=>{
  const answers={Q12:['Q12_1'],Q14:['Q14_2'],Q19:['Q19_3']};
  const pages=plain(build(answers,data));
  assert.deepEqual(plain(reported(answers,data)).map(category=>category.id),['Q12','Q14','Q19']);
  const priority=pages.find(page=>page.id==='top-two-problems').questions[0];
  assert.deepEqual(priority.options.map(option=>option.id),['Q12','Q14','Q19']);
  assert.match(priority.options[0].hint,/Understanding rights and resources/);
  assert.equal(priority.max_selected,2);
});
