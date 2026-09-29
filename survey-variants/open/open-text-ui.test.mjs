import test from 'node:test';
import assert from 'node:assert/strict';
import {createOpenQuestion} from './open-text-ui.mjs';
import {bindLongAnswer,setDisclosure} from './shared/long-answer-ui.mjs';
class Element {
 constructor(tag='div'){this.tagName=tag.toUpperCase();this.id='';this.value='';this.textContent='';this.hidden=false;this.attrs=new Map();this.listeners=new Map();this.children=[];}
 setAttribute(k,v){this.attrs.set(k,v);}getAttribute(k){return this.attrs.get(k)||null;}removeAttribute(k){this.attrs.delete(k);}
 addEventListener(k,v){this.listeners.set(k,v);}removeEventListener(k){this.listeners.delete(k);}setCustomValidity(v){this.validityMessage=v;}
 append(...elements){this.children.push(...elements);}fire(k){this.listeners.get(k)?.();}
}
const document={createElement:tag=>new Element(tag)};
const question={type:'text',label:'What help did you need?',help:'Optional.'};
test('middle answer widget contains textarea and no prewritten response controls',()=>{const q=createOpenQuestion({document,question,id:'need-1'});assert.deepEqual(q.element.children.map(x=>x.tagName),['LABEL','P','TEXTAREA','P','P']);assert.equal(q.textarea.required,false);assert.equal(q.textarea.rows,6);});
test('long text is not truncated and counter agrees',()=>{const q=createOpenQuestion({document,question,id:'need-1'});q.textarea.value='x'.repeat(10001);q.textarea.fire('input');assert.equal(q.validate(),false);assert.equal(q.textarea.value.length,10001);});
test('exactly 10000 Unicode code points fit',()=>{const q=createOpenQuestion({document,question,id:'need-1',value:'😀'.repeat(10000)});assert.equal(q.validate(),true);assert.equal(q.textarea.getAttribute('maxlength'),null);});
test('two independent boxes do not share answers',()=>{const changes=[];const a=createOpenQuestion({document,question,id:'n1',onChange:v=>changes.push(['n1',v])});const b=createOpenQuestion({document,question,id:'n2',onChange:v=>changes.push(['n2',v])});a.textarea.value='first';a.textarea.fire('input');b.textarea.value='second';b.textarea.fire('input');assert.deepEqual(changes,[['n1','first'],['n2','second']]);});
test('HTML-like text is retained as value not HTML',()=>{const q=createOpenQuestion({document,question,id:'n1',value:'<script>do not run</script>'});assert.equal(q.textarea.value,'<script>do not run</script>');assert.equal(q.textarea.innerHTML,undefined);});
test('IME text emits only after composition is committed',()=>{const out=[];const q=createOpenQuestion({document,question,id:'n1',onChange:v=>out.push(v)});q.textarea.fire('compositionstart');q.textarea.value='北';q.textarea.fire('input');assert.equal(out.length,0);q.textarea.value='北领地';q.textarea.fire('compositionend');assert.deepEqual(out,['北领地']);});
test('collapse does not change answers',()=>{const button=new Element('button'),panel=new Element();panel.id='panel';panel.textContent='old narrative';setDisclosure(button,panel,false);assert.equal(panel.textContent,'old narrative');assert.equal(panel.hidden,true);});
test('destroy unbinds handlers',()=>{const q=createOpenQuestion({document,question,id:'n1'});q.destroy();assert.equal(q.textarea.listeners.size,0);});
test('non-text controls cannot use open-response widget',()=>assert.throws(()=>createOpenQuestion({document,question:{type:'single'},id:'n1'}),TypeError));
