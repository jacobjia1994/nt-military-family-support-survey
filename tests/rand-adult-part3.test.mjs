import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const part3=JSON.parse(readFileSync(new URL('../copy/rand-appendix-part3.json',import.meta.url),'utf8'));
const context=vm.createContext({});
for(const name of ['rand-adult-context-pages.js','rand-adult-part3-pages.js'])vm.runInContext(readFileSync(new URL(`../${name}`,import.meta.url),'utf8'),context);
const build=answers=>context.SURVEY_RAND_PART3.build(answers,part3,context.SURVEY_RAND_CONTEXT);
const ids=pages=>Array.from(pages.flatMap(page=>page.questions),question=>question.id);

test('RAND final pages retain original Q37–Q67 background and closing structure',()=>{
  assert.deepEqual(part3.questions.map(question=>question.id),Array.from({length:31},(_,i)=>`Q${i+37}`));
  const pages=build({Q3:'married_member',Q4:'army',Q5:['permanent'],Q6:['permanent'],Q9:'yes',Q8:{age_6_13:{number:'1'}},Q53:'yes',Q60:'yes'});
  assert.equal(pages.length,2);
  assert.ok(ids(pages).includes('Q37'));
  assert.ok(ids(pages).includes('Q46'));
  assert.ok(ids(pages).includes('Q54'));
  assert.ok(ids(pages).includes('Q61'));
  assert.ok(ids(pages).includes('Q65'));
  assert.ok(ids(pages).includes('Q66'));
  assert.equal(ids(pages).at(-1),'Q67');
  const rank=pages[0].questions.find(question=>question.id==='Q37');
  assert.ok(rank.options.length>10);
  assert.ok(rank.options.every(option=>option.id.startsWith('army_')));
});

test('RAND attitude and caring branches follow the respondent role and explicit prior answers',()=>{
  const answers={Q3:'civilian_spouse',Q5:['permanent'],Q10:'yes',Q57:'civilian_rented',Q63:'retiring_soon'};
  const pages=build(answers);
  const questions=ids(pages);
  assert.ok(questions.includes('Q55'));
  assert.ok(questions.includes('Q56'));
  assert.ok(questions.includes('Q58'));
  assert.ok(questions.includes('Q62'));
  assert.ok(questions.includes('Q63'));
  assert.equal(questions.includes('Q64'),false);
  assert.equal(questions.includes('Q65'),false);
  assert.equal(questions.includes('Q54'),false);
  assert.equal(questions.includes('Q61'),false);
});

test('Australian demographic substitutions remain distinct source items',()=>{
  const pages=build({Q3:'adult_child',Q4:'navy'});
  const q49=pages[0].questions.find(question=>question.id==='Q49');
  const q50=pages[0].questions.find(question=>question.id==='Q50');
  assert.equal(q49.label,'Are you of Aboriginal or Torres Strait Islander origin?');
  assert.deepEqual(Array.from(q49.exclusive_ids),['no']);
  assert.equal(q50.label,'What is your ancestry?');
  assert.equal(q50.options.some(option=>option.write_in),true);
});

test('skipping Q3 does not open both member and spouse question routes',()=>{
  const questions=ids(build({Q5:['permanent'],Q10:'yes'}));
  for(const id of ['Q37','Q38','Q42','Q43','Q44','Q45','Q46','Q55','Q56','Q62','Q63','Q64','Q65','Q66'])assert.equal(questions.includes(id),false,id);
  for(const id of ['Q39','Q40','Q41','Q47','Q67'])assert.ok(questions.includes(id),id);
});

test('Q52 and Q53 do not inherit Q18’s age-22 restriction',()=>{
  const answers={Q3:'civilian_spouse',Q5:['permanent'],Q10:'yes',Q8:{age_23_64:{number:'1'}},'L-CHILD':'no'};
  const questions=ids(build(answers));
  assert.ok(questions.includes('Q52'));
  assert.ok(questions.includes('Q53'));
  assert.equal(questions.includes('Q54'),false);
  answers.Q53='yes';
  assert.ok(ids(build(answers)).includes('Q54'));
});
