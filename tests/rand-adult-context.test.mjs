import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const data=JSON.parse(readFileSync(new URL('../copy/rand-appendix-part1.json',import.meta.url),'utf8'));
const context=vm.createContext({});
vm.runInContext(readFileSync(new URL('../rand-adult-context-pages.js',import.meta.url),'utf8'),context);
const {build,hasYoungChild}=context.SURVEY_RAND_CONTEXT;
const ids=answers=>Array.from(build(answers,data)[1].questions,question=>question.id);

test('RAND study and key-demographic pages preserve Q1–Q11 order with applicable branches',()=>{
  assert.deepEqual(Array.from(build({},data)[0].questions,question=>question.id),['Q1','Q2']);
  assert.deepEqual(ids({Q3:'married_member','L-PARTNER':'married',Q6:['permanent']}),['Q3','Q4','Q5','Q6','Q7','Q8','L-CHILD','Q9','Q10','Q11','L-GD']);
  assert.deepEqual(ids({Q3:'adult_child','L-PARTNER':'no'}),['Q3','L-PARTNER','Q4','Q5','Q8','L-CHILD','Q10','Q11','L-GD']);
});

test('RAND dependant matrix retains six age bands and two count columns',()=>{
  const q8=build({Q3:'adult_child'},data)[1].questions.find(question=>question.id==='Q8');
  assert.equal(q8.kind,'matrix_number');
  assert.equal(q8.rows.length,6);
  assert.equal(q8.columns.length,2);
  assert.equal(q8.none_option.label,'I have no dependants');
  assert.equal(hasYoungChild({Q8:{age_6_13:{number:'1'}}}),true);
  assert.equal(hasYoungChild({'Q8:none':true}),false);
  const q11=build({Q3:'married_member'},data)[1].questions.find(question=>question.id==='Q11');
  assert.equal(q11.options.find(option=>option.id==='raaf_darwin').label,'RAAF Base Darwin');
});
