import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

function fakeMain(){
  const nodes=new Map();
  const node=selector=>{
    if(!nodes.has(selector))nodes.set(selector,{value:'',onclick:null,onsubmit:null,listeners:{},focus(){},addEventListener(type,fn){this.listeners[type]=fn;},querySelector:node});
    return nodes.get(selector);
  };
  return {innerHTML:'',querySelector:node,querySelectorAll(){return [];}};
}

test('the GitHub entry loads RAND Page 1 and Page 2 without demo language',()=>{
  const main=fakeMain();
  const window={scrollTo(){},location:{href:''}};
  const document={querySelector:selector=>selector==='#main'?main:null};
  const context=vm.createContext({window,document,structuredClone});
  for(const name of ['rand-adult-data.js','rand-adult-engine.js','rand-adult-context-pages.js','rand-adult-problem-pages.js','rand-adult-part2-pages.js','rand-adult-part3-pages.js','rand-adult-app.js','rand-adult-bootstrap.js'])vm.runInContext(readFileSync(new URL(`../${name}`,import.meta.url),'utf8'),context,{filename:name});
  assert.match(main.innerHTML,/Welcome to the Survey of Service Member and Family Needs/);
  assert.match(main.innerHTML,/Enter the Survey Here/);
  assert.doesNotMatch(main.innerHTML,/preview|demo|not sent|not saved|Online submissions are not open/i);
  main.querySelector('#rand-enter').onclick();
  assert.match(main.innerHTML,/Purpose of the Survey/);
  assert.match(main.innerHTML,/Consent to Participate/);
  assert.doesNotMatch(main.innerHTML,/preview|demo|not sent|not saved/i);
  main.querySelector('input[name="rand-consent"]:checked').value='adult_agree';
  main.querySelector('#rand-consent-form').onsubmit({preventDefault(){}});
  assert.match(main.innerHTML,/Study Information/);
  assert.match(main.innerHTML,/How did you hear about this survey\?/);
});

test('the static adult route has no answer transport or browser storage path',()=>{
  for(const name of ['rand-adult-engine.js','rand-adult-context-pages.js','rand-adult-problem-pages.js','rand-adult-part2-pages.js','rand-adult-part3-pages.js','rand-adult-app.js','rand-adult-bootstrap.js']){
    const source=readFileSync(new URL(`../${name}`,import.meta.url),'utf8');
    assert.doesNotMatch(source,/\b(?:fetch|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|indexedDB)\b/,name);
  }
});
