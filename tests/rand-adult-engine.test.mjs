import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const context=vm.createContext({structuredClone});
vm.runInContext(readFileSync(new URL('../rand-adult-engine.js',import.meta.url),'utf8'),context);
const {create,renderQuestion}=context.SURVEY_RAND_ADULT_ENGINE;

test('RAND question renderer preserves original options and escapes respondent text',()=>{
  const question={id:'Q12',source_id:'12',kind:'multi',label:'Please check any problems:',options:[
    {id:'Q12_1',label:'Understanding military language, organisation, culture'},
    {id:'Q12_8',label:'Other problems',write_in:true},
    {id:'Q12_9',label:'I did not experience any of the above problems.'}
  ]};
  const html=renderQuestion(question,{Q12:['Q12_8'],'Q12:other:Q12_8':'<script>bad()</script>'});
  assert.match(html,/<span class="rand-number">12\.<\/span> Please check any problems:/);
  assert.match(html,/Understanding military language, organisation, culture/);
  assert.match(html,/I did not experience any of the above problems/);
  assert.match(html,/Please specify:/);
  assert.match(html,/&lt;script&gt;bad\(\)&lt;\/script&gt;/);
  assert.doesNotMatch(html,/<script>/);
});

test('RAND matrix renderer keeps every source row and response dimension',()=>{
  const question={id:'Q35',source_id:'35',kind:'matrix_single',label:'Please tell us how well each contact helped:',rows:[
    {id:'M01',label:'Unit-linked family support group'},
    {id:'N06',label:'Personal networks'}
  ],columns:[
    {id:'1',label:'Very well'},
    {id:'2',label:'Well'},
    {id:'3',label:'All right'},
    {id:'4',label:'Not very well'},
    {id:'5',label:'Not at all'}
  ]};
  const html=renderQuestion(question,{Q35:{M01:'3'}});
  assert.equal((html.match(/class="rand-matrix-cell"/g)||[]).length,10);
  assert.match(html,/Unit-linked family support group/);
  assert.match(html,/Personal networks/);
  assert.match(html,/name="Q35:M01" value="3" checked/);
});

test('a linked problem–need contact key stays one multiselect answer',()=>{
  const nodes=new Map();
  const node=selector=>{
    if(!nodes.has(selector))nodes.set(selector,{listeners:{},addEventListener(type,fn){this.listeners[type]=fn;},focus(){},querySelector:node});
    return nodes.get(selector);
  };
  const main={innerHTML:'',querySelector:node,querySelectorAll(){return [];}};
  const session=create({main,buildPages:()=>[{id:'contact',title:'Ways of Meeting Needs',questions:[{id:'contacts:Q12:H01',kind:'multi',label:'Please check any contacts',options:[{id:'M04',label:'Defence Member and Family Helpline'}]}]}]});
  session.start();
  node('#rand-adult-form').listeners.change({target:{name:'contacts:Q12:H01',type:'checkbox',value:'M04',checked:true}});
  assert.deepEqual(JSON.parse(JSON.stringify(session.answers()['contacts:Q12:H01'])),['M04']);
});

test('the original dependant-count question can record an explicit no-dependants answer',()=>{
  const q={id:'Q8',source_id:'8',kind:'matrix_number',label:'How many dependants do you have in each age group?',none_option:{id:'no_dependants',label:'I have no dependants'},rows:[{id:'under_2',label:'Under 2 years'}],columns:[{id:'number',label:'Number'}]};
  const html=renderQuestion(q,{'Q8:none':true});
  assert.match(html,/I have no dependants/);
  assert.doesNotMatch(html,/Under 2 years/);
});

test('a RAND numeric response keeps Don’t know distinct from a zero answer',()=>{
  const q={id:'Q38',source_id:'38',kind:'number',label:'How many years of full-time military service?',suffix:'Years',options:[{id:'dont_know',label:'Don’t know',exclusive_with_value:true}]};
  const zero=renderQuestion(q,{Q38:'0'});
  const unknown=renderQuestion(q,{Q38:'dont_know'});
  assert.match(zero,/name="Q38" value="0"/);
  assert.match(unknown,/name="Q38" value="" disabled/);
  assert.match(unknown,/name="Q38:special" value="dont_know" checked/);
});
