import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const load=path=>JSON.parse(readFileSync(resolve(root,path),'utf8'));
const html=path=>readFileSync(resolve(root,path),'utf8');
const choice=load('survey-variants/choice/survey-spec.json');
const open=load('survey-variants/open/open-survey-spec.json');

test('both entries load the same respondent app with isolated variants',()=>{
  const a=html('index.html'),b=html('open-response.html');
  assert.match(a,/data-survey-variant="choice"/);
  assert.match(b,/data-survey-variant="open"/);
  for(const page of [a,b]){
    assert.match(page,/survey-variants\/app\.mjs/);
    assert.doesNotMatch(page,/rand-adult-bootstrap\.js|survey\.js/);
    assert.doesNotMatch(page,/>[^<]*(?:demo|preview|not collecting|responses are not collected)[^<]*</i);
  }
  assert.match(html('compare.html'),/href="index\.html"/);
  assert.match(html('compare.html'),/href="open-response\.html"/);
});

test('the variants share all common catalogue and pages except one welcome paragraph',()=>{
  for(const key of ['scope','issue_bank','geography','system_screens'])assert.deepEqual(open[key],choice[key]);
  for(const id of ['about','issues','review','thanks'])assert.deepEqual(open.pages.find(p=>p.id===id),choice.pages.find(p=>p.id===id));
  const a=structuredClone(choice.pages.find(p=>p.id==='welcome'));
  const b=open.pages.find(p=>p.id==='welcome');
  a.sections.find(s=>s.title==='What to expect').text=b.sections.find(s=>s.title==='What to expect').text;
  assert.deepEqual(b,a);
  assert.equal(choice.issue_bank.length,20);
  assert.equal(choice.issue_bank.reduce((n,c)=>n+c.options.length,0),170);
  assert.equal(choice.geography.localities.length,100);
});

test('the open middle asks for text while choice middle retains answer lists',()=>{
  const area=spec=>spec.pages.find(p=>p.id==='area');
  const openQuestions=area(open).sections.flatMap(s=>s.questions);
  const choiceQuestions=area(choice).sections.flatMap(s=>s.questions);
  assert.ok(openQuestions.length>=12);
  assert.ok(openQuestions.every(q=>q.type==='text'&&q.max_length===10000));
  assert.ok(choiceQuestions.some(q=>q.type==='multi'));
  assert.ok(choiceQuestions.some(q=>q.type==='single'));
  assert.ok(choiceQuestions.some(q=>q.id.includes('comments')&&q.max_length===10000));
});
