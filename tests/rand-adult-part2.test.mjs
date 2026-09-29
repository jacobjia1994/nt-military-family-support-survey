import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const problems=JSON.parse(readFileSync(new URL('../copy/rand-appendix-q12-q20.json',import.meta.url),'utf8'));
const part2=JSON.parse(readFileSync(new URL('../copy/rand-appendix-part2.json',import.meta.url),'utf8'));
const context=vm.createContext({});
vm.runInContext(readFileSync(new URL('../rand-adult-part2-pages.js',import.meta.url),'utf8'),context);
const {build,chosenPairs,contactSets}=context.SURVEY_RAND_PART2;
const plain=value=>JSON.parse(JSON.stringify(value));

test('RAND Q23–Q36 follows reported priority problems rather than the old local cue list',()=>{
  assert.deepEqual(plain(build({Q12:['Q12_9']},problems,part2)),[]);
  const answers={Q12:['Q12_1'],Q14:['Q14_1'],'needs:Q12':['H01'],'needs:Q14':['H07'],'contacts:Q12:H01':['M04','N06'],'contacts:Q14:H07':['NO_CONTACT']};
  const pages=plain(build(answers,problems,part2));
  assert.deepEqual(pages.slice(0,4).map(page=>page.id),['needs:Q12','needs:Q14','contacts:Q12:H01','contacts:Q14:H07']);
  assert.ok(pages.some(page=>page.id==='Q30'));
  assert.ok(pages.some(page=>page.id==='Q31'));
  assert.ok(pages.some(page=>page.id==='Q34'));
  assert.ok(pages.some(page=>page.id==='helpfulness:Q12:H01'));
  assert.ok(pages.some(page=>page.id==='Q36'));
  assert.equal(pages.find(page=>page.id==='Q36').questions[0].rows.length,9);
  assert.equal(pages.some(page=>page.id==='overall_need_met'),false);
});

test('RAND need prioritisation controls at most four exact problem–need contact paths',()=>{
  const answers={Q12:['Q12_1'],Q14:['Q14_1'],'needs:Q12':['H01','H02','H03'],'needs:Q14':['H04','H05','H06']};
  let pages=plain(build(answers,problems,part2));
  assert.ok(pages.some(page=>page.id==='priority-needs'));
  assert.equal(pages.filter(page=>page.id.startsWith('contacts:')).length,0,'skipped Q25 cannot choose needs by display order');
  answers['priority-needs:Q12']=['H01','H03'];
  answers['priority-needs:Q14']=['H04','H06'];
  pages=plain(build(answers,problems,part2));
  assert.deepEqual(pages.filter(page=>page.id.startsWith('contacts:')).map(page=>page.id),['contacts:Q12:H01','contacts:Q12:H03','contacts:Q14:H04','contacts:Q14:H06']);
  assert.equal(chosenPairs(answers,problems,part2).length,4);
});

test('RAND noncontact matrices do not treat a skipped contact question as nonuse',()=>{
  const answers={Q12:['Q12_1'],'needs:Q12':['H01']};
  const pairs=chosenPairs(answers,problems,part2);
  let sets=contactSets(pairs,answers,part2);
  assert.equal(sets.allAnswered,false);
  assert.equal(sets.militaryNotUsed.length,0);
  answers['contacts:Q12:H01']=['M04'];
  sets=contactSets(pairs,answers,part2);
  assert.equal(sets.allAnswered,true);
  assert.ok(sets.militaryNotUsed.length>0);
  assert.equal(sets.militaryUsed[0].id,'M04');
});
