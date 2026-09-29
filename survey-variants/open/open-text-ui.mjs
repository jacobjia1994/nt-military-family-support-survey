import {bindLongAnswer} from './shared/long-answer-ui.mjs';
/** Create one labelled, optional answer box. Uses DOM text nodes, never user-generated HTML. */
export function createOpenQuestion({document,question,id,value='',onChange=()=>{}}) {
 if(!document || question?.type!=='text' || !id)throw new TypeError('Provide a document, text question and unique ID.');
 const wrapper=document.createElement('div');wrapper.className='open-question';
 const label=document.createElement('label');label.htmlFor=id;label.textContent=question.label;label.className='field-label';
 const hint=document.createElement('p');hint.id=`${id}-hint`;hint.className='field-hint';hint.textContent=question.help||'';
 const textarea=document.createElement('textarea');textarea.id=id;textarea.name=id;textarea.className='textarea';
 textarea.value=value;textarea.setAttribute('aria-describedby',hint.id);textarea.setAttribute('spellcheck','true');
 const counter=document.createElement('p');counter.id=`${id}-count`;counter.className='char-count';
 const error=document.createElement('p');error.id=`${id}-error`;error.className='field-error';
 wrapper.append(label,hint,textarea,counter,error);
 const binding=bindLongAnswer({textarea,counter,error,onChange});
 return {element:wrapper,textarea,validate:binding.validate,destroy:binding.destroy};
}
