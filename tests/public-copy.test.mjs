import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const siteDirs=['../'];
test('public support pages contain no demo or internal rollout labels',()=>{
 for(const dir of siteDirs){
  const base=new URL(dir,import.meta.url);
  for(const name of ['index.html','support.html','support.js']){
   if(!fs.existsSync(new URL(name,base)))continue;
   const text=fs.readFileSync(new URL(name,base),'utf8');
   assert(!/resource demo|demo-status|prototype|for review|site-identity|approved rollout/i.test(text),`${dir}${name}`);
  }
 }
});
test('main heading uses natural width and wrapping',()=>{
 for(const dir of siteDirs){
  const css=fs.readFileSync(new URL(`${dir}support.css`,import.meta.url),'utf8');
  for(const rule of css.matchAll(/([^{}]+)\{([^{}]*)\}/g))if(/h1\b/.test(rule[1])){
   assert(!/max-width:\s*\d+(ch|px|em)|text-wrap:\s*balance|white-space:\s*nowrap/.test(rule[2]),rule[0]);
  }
 }
});
