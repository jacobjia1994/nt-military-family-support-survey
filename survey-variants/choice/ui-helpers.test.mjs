import test from 'node:test';
import assert from 'node:assert/strict';
import {bindLongAnswer,setDisclosure,setPlainText} from './ui-helpers.mjs';
class Element {
  constructor(id=''){this.id=id;this.value='';this.textContent='';this.hidden=false;this.attrs=new Map();this.listeners=new Map();}
  setAttribute(k,v){this.attrs.set(k,v);} getAttribute(k){return this.attrs.get(k)||null;} removeAttribute(k){this.attrs.delete(k);}
  addEventListener(k,v){this.listeners.set(k,v);} removeEventListener(k){this.listeners.delete(k);}
  setCustomValidity(v){this.validityMessage=v;}
  fire(k){this.listeners.get(k)?.();}
}
test('long-answer binding uses an optional visible six-line field and consistent counter',()=>{const t=new Element('t'),c=new Element('c'),e=new Element('e');t.setAttribute('maxlength','10000');bindLongAnswer({textarea:t,counter:c,error:e});assert.equal(t.required,false);assert.equal(t.rows,6);assert.equal(t.getAttribute('maxlength'),null);assert.equal(c.textContent,'0 / 10,000 characters');});
test('over-limit paste is not silently truncated',()=>{const t=new Element('t'),c=new Element('c'),e=new Element('e');const b=bindLongAnswer({textarea:t,counter:c,error:e});t.value='x'.repeat(10001);t.fire('input');assert.equal(t.value.length,10001);assert.equal(b.validate(),false);assert.equal(e.hidden,false);});
test('emoji counter and validator agree at exactly 10000 characters',()=>{const t=new Element('t'),c=new Element('c'),e=new Element('e');const b=bindLongAnswer({textarea:t,counter:c,error:e});t.value='😀'.repeat(10000);t.fire('input');assert.equal(b.validate(),true);assert.equal(c.textContent,'10,000 / 10,000 characters');});
test('composition does not emit partial CJK text',()=>{const t=new Element('t'),c=new Element('c'),e=new Element('e'),changes=[];bindLongAnswer({textarea:t,counter:c,error:e,onChange:x=>changes.push(x)});t.fire('compositionstart');t.value='北';t.fire('input');assert.equal(changes.length,0);t.value='北领地';t.fire('compositionend');assert.deepEqual(changes,['北领地']);});
test('collapsing a section changes presentation without touching content',()=>{const b=new Element('b'),p=new Element('p');p.textContent='selected answers';setDisclosure(b,p,false);assert.equal(p.hidden,true);assert.equal(p.textContent,'selected answers');assert.equal(b.getAttribute('aria-expanded'),'false');});
test('user HTML-like text is assigned to textContent, never innerHTML',()=>{const e=new Element('e');setPlainText(e,'<script>unsafe()</script>');assert.equal(e.textContent,'<script>unsafe()</script>');assert.equal(e.innerHTML,undefined);});
