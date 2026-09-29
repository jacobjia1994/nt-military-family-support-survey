import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const problems=JSON.parse(readFileSync(new URL('../copy/rand-appendix-q12-q20.json',import.meta.url),'utf8'));
const resources=JSON.parse(readFileSync(new URL('../copy/rand-appendix-part2.json',import.meta.url),'utf8'));

test('RAND problem pages preserve all nine Q12–Q20 domains and their source choices',()=>{
  assert.deepEqual(problems.categories.map(category=>category.id),Array.from({length:9},(_,index)=>`Q${index+12}`));
  assert.deepEqual(problems.categories.map(category=>category.options.length),[9,9,10,10,9,12,10,13,13]);
  assert.equal(problems.categories.reduce((total,category)=>total+category.options.length,0),95);
  for(const category of problems.categories){
    assert.match(category.stem,/^Please check any/i);
    assert.equal(category.none_id,category.options.at(-1).id);
    assert.match(category.options.at(-1).label,/did not experience any of the above problems/i);
    assert.ok(category.options.some(option=>option.id===category.other_id&&option.write_in));
  }
});

test('RAND needs, resource and matrix dimensions remain distinct',()=>{
  assert.deepEqual(resources.help_options.map(option=>option.id),Array.from({length:10},(_,index)=>`H${String(index+1).padStart(2,'0')}`));
  assert.equal(resources.resource_options.filter(option=>option.group==='military').length,9);
  assert.equal(resources.resource_options.filter(option=>option.group==='nonmilitary').length,7);
  assert.equal(resources.characteristic_options.length,7);
  assert.equal(resources.personal_network_statements.length,7);
  assert.equal(resources.helpfulness_scale.length,5);
  assert.equal(resources.loss_impact_scale.length,4);
  assert.equal(resources.loss_resource_rows.filter(row=>row.resource_id).length,9);
});

test('source crosswalk covers every numbered RAND item without replacing the original inventory',()=>{
  const crosswalk=readFileSync(new URL('../RAND_ITEM_CROSSWALK.md',import.meta.url),'utf8');
  const rows=[...crosswalk.matchAll(/^\| Q(\d+) \|/gm)].map(match=>Number(match[1]));
  assert.deepEqual(rows,Array.from({length:67},(_,index)=>index+1));
});

test('adult reading copy presents all RAND numbered questions and natural thanks',()=>{
  const html=readFileSync(new URL('../adult-wording.html',import.meta.url),'utf8');
  const ids=[...html.matchAll(/<h3>Q(\d+)\./g)].map(match=>Number(match[1]));
  assert.deepEqual(ids,Array.from({length:67},(_,index)=>index+1));
  assert.match(html,/Thank you, once again, for taking the time to complete the survey/);
  assert.doesNotMatch(html,/\b(?:preview|demo)\b|not sent|not saved|Online submissions are not open/i);
});
