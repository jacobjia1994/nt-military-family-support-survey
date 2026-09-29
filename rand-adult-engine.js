// Page renderer for the locally adapted RAND Appendix A adult questionnaire.
// Answers stay in page memory. This module has no network or persistence path.
(function(root){
  'use strict';

  const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const safeId=value=>String(value).replace(/[^a-zA-Z0-9_-]/g,'-');
  const hasValue=value=>Array.isArray(value)?value.length>0:value!==undefined&&value!==null&&value!=='';
  const optionHTML=(question,option,selected,type)=>{
    const checked=type==='checkbox'?Array.isArray(selected)&&selected.includes(option.id):selected===option.id;
    return `<label class="choice"><input type="${type}" name="${escapeHTML(question.id)}" value="${escapeHTML(option.id)}" ${checked?'checked':''}><span class="choice-body"><span class="choice-label">${escapeHTML(option.label)}</span>${option.hint?`<span class="choice-hint">${escapeHTML(option.hint)}</span>`:''}</span></label>`;
  };

  function renderQuestion(question,answers){
    const value=answers[question.id];
    const qid=safeId(question.id);
    const hint=question.hint?`<p class="field-hint" id="hint-${qid}">${escapeHTML(question.hint)}</p>`:'';
    const source=question.source_id?`<span class="rand-number">${escapeHTML(question.source_id)}.</span> `:'';
    if(['single','multi'].includes(question.kind)){
      const type=question.kind==='single'?'radio':'checkbox';
      const renderOption=option=>{
        const otherLabel=typeof option.write_in==='object'?option.write_in.label:'Please specify:';
        const other=option.write_in&&((type==='radio'?value===option.id:Array.isArray(value)&&value.includes(option.id)))?`<label class="rand-write-in">${escapeHTML(otherLabel)} <input type="text" name="${escapeHTML(question.id)}:other:${escapeHTML(option.id)}" maxlength="500" value="${escapeHTML(answers[`${question.id}:other:${option.id}`]||'')}"></label>`:'';
        return `<div class="rand-option">${optionHTML(question,option,value,type)}${other}</div>`;
      };
      const choices=question.group_headings?[
        ...Object.entries(question.group_headings).map(([group,title])=>`<div class="rand-option-group"><h3>${escapeHTML(title)}</h3>${(question.options||[]).filter(option=>option.group===group).map(renderOption).join('')}</div>`),
        ...(question.options||[]).filter(option=>!option.group).map(renderOption)
      ].join(''):(question.options||[]).map(renderOption).join('');
      return `<fieldset class="rand-question" data-question="${escapeHTML(question.id)}"><legend>${source}${escapeHTML(question.label)}</legend>${hint}${choices}</fieldset>`;
    }
    if(question.kind==='select'){
      const selected=(question.options||[]).find(option=>option.id===value);
      const other=selected?.write_in?`<label class="rand-write-in">${escapeHTML(typeof selected.write_in==='object'?selected.write_in.label:'Please specify:')} <input type="text" name="${escapeHTML(question.id)}:other:${escapeHTML(selected.id)}" maxlength="500" value="${escapeHTML(answers[`${question.id}:other:${selected.id}`]||'')}"></label>`:'';
      return `<div class="rand-question" data-question="${escapeHTML(question.id)}"><label for="field-${qid}">${source}${escapeHTML(question.label)}</label>${hint}<select id="field-${qid}" name="${escapeHTML(question.id)}"><option value="">Select one</option>${(question.options||[]).map(option=>`<option value="${escapeHTML(option.id)}" ${value===option.id?'selected':''}>${escapeHTML(option.label)}</option>`).join('')}</select>${other}</div>`;
    }
    if(question.kind==='text')return `<div class="rand-question" data-question="${escapeHTML(question.id)}"><label for="field-${qid}">${source}${escapeHTML(question.label)}</label>${hint}<textarea id="field-${qid}" name="${escapeHTML(question.id)}" maxlength="5000">${escapeHTML(value||'')}</textarea></div>`;
    if(question.kind==='number'){
      const special=(question.options||[]).find(option=>option.exclusive_with_value);
      const selected=Boolean(special&&value===special.id);
      return `<div class="rand-question" data-question="${escapeHTML(question.id)}"><label for="field-${qid}">${source}${escapeHTML(question.label)}</label>${hint}<div class="rand-number-input"><input id="field-${qid}" type="number" min="0" max="999" name="${escapeHTML(question.id)}" value="${selected?'':escapeHTML(value??'')}" ${selected?'disabled':''}>${question.suffix?`<span>${escapeHTML(question.suffix)}</span>`:''}</div>${special?`<label class="choice"><input type="checkbox" name="${escapeHTML(question.id)}:special" value="${escapeHTML(special.id)}" ${selected?'checked':''}><span class="choice-label">${escapeHTML(special.label)}</span></label>`:''}</div>`;
    }
    if(['matrix_check','matrix_single','matrix_number'].includes(question.kind)){
      const noneSelected=question.kind==='matrix_number'&&answers[`${question.id}:none`]===true;
      const none=question.none_option?`<label class="choice"><input type="checkbox" name="${escapeHTML(question.id)}:none" value="${escapeHTML(question.none_option.id)}" ${noneSelected?'checked':''}><span class="choice-label">${escapeHTML(question.none_option.label)}</span></label>`:'';
      const rows=(noneSelected?[]:question.rows||[]).map(row=>{
        const rowValue=value?.[row.id];
        const cells=(question.columns||[]).map(column=>{
          if(question.kind==='matrix_number')return `<label class="rand-matrix-cell"><span>${escapeHTML(column.label)}</span><input type="number" min="0" max="99" name="${escapeHTML(question.id)}:${escapeHTML(row.id)}:${escapeHTML(column.id)}" value="${escapeHTML(rowValue?.[column.id]??'')}"></label>`;
          const type=question.kind==='matrix_single'?'radio':'checkbox';
          const checked=type==='radio'?rowValue===column.id:Array.isArray(rowValue)&&rowValue.includes(column.id);
          return `<label class="rand-matrix-cell"><input type="${type}" name="${escapeHTML(question.id)}:${escapeHTML(row.id)}" value="${escapeHTML(column.id)}" ${checked?'checked':''}><span>${escapeHTML(column.label)}</span></label>`;
        }).join('');
        return `<fieldset class="rand-matrix-row"><legend>${escapeHTML(row.label)}</legend><div class="rand-matrix-cells">${cells}</div></fieldset>`;
      }).join('');
      return `<section class="rand-question rand-matrix" data-question="${escapeHTML(question.id)}"><h2>${source}${escapeHTML(question.label)}</h2>${hint}${none}${rows}</section>`;
    }
    throw new TypeError(`Unsupported RAND question kind: ${question.kind}`);
  }

  function create({main,buildPages,onFinish,onExit}){
    if(!main||typeof buildPages!=='function')throw new TypeError('RAND adult survey needs a main element and page builder.');
    const answers={};
    let pageId=null;
    const pages=()=>buildPages(answers).filter(Boolean);
    const currentPage=()=>pages().find(page=>page.id===pageId)||pages()[0];
    const allAnswers=()=>structuredClone(answers);
    function render(){
      const available=pages(),page=currentPage();
      if(!page)throw new Error('No RAND questionnaire pages are available.');
      pageId=page.id;
      const index=available.findIndex(item=>item.id===page.id);
      const first=index===0,last=index===available.length-1;
      main.innerHTML=`<section class="survey-layout rand-adult"><div class="step-topline"><strong>${escapeHTML(page.group||'Survey of Service Member and Family Needs')}</strong><span>Page ${index+1} of ${available.length}</span></div><div class="section-track" aria-hidden="true">${available.map((_,i)=>`<span class="${i<=index?'visited':''}"></span>`).join('')}</div><form id="rand-adult-form" class="question-card" novalidate><h1 tabindex="-1">${escapeHTML(page.title)}</h1>${page.intro?`<div class="rand-intro">${escapeHTML(page.intro)}</div>`:''}${(page.questions||[]).map(question=>renderQuestion(question,answers)).join('')}<p class="error" id="rand-form-error" role="alert"></p><div class="question-actions"><button type="button" class="back-button" id="rand-back">${first?'Exit survey':'Back'}</button><button type="submit" class="button primary">${last?'Confirm and submit':'Continue'}</button></div></form></section>`;
      const form=main.querySelector('#rand-adult-form');
      form.addEventListener('change',event=>{
        const input=event.target;
        if(!input.name)return;
        const question=page.questions.find(item=>item.id===input.name);
        const numberSpecial=question?null:page.questions.find(item=>item.kind==='number'&&input.name===`${item.id}:special`);
        const matrix=question?null:page.questions.find(item=>item.kind.startsWith('matrix_')&&input.name.startsWith(`${item.id}:`));
        if(numberSpecial){answers[numberSpecial.id]=input.checked?input.value:'';}
        else if(matrix&&input.name===`${matrix.id}:none`){
          answers[`${matrix.id}:none`]=input.checked;
          if(input.checked)delete answers[matrix.id];
        }else if(matrix){
          const suffix=input.name.slice(matrix.id.length+1).split(':');
          const row=suffix[0],column=suffix[1];
          answers[matrix.id]||={};
          if(matrix.kind==='matrix_number'){
            answers[matrix.id][row]||={};answers[matrix.id][row][column]=input.value;
          }else{
          if(input.type==='checkbox'){
              const current=Array.isArray(answers[matrix.id][row])?answers[matrix.id][row]:[];
              answers[matrix.id][row]=input.checked?[...current,input.value]:current.filter(id=>id!==input.value);
            }else answers[matrix.id][row]=input.value;
          }
        }else if(question?.kind==='multi'){
          const current=Array.isArray(answers[input.name])?answers[input.name]:[];
          const exclusive=question?.exclusive_ids||[];
          if(input.checked&&!exclusive.includes(input.value)&&question?.max_selected&&current.length>=question.max_selected){input.checked=false;form.querySelector('#rand-form-error').textContent=`Please select no more than ${question.max_selected} options for this question.`;return;}
          answers[input.name]=input.checked?(exclusive.includes(input.value)?[input.value]:[...current.filter(id=>!exclusive.includes(id)),input.value]):current.filter(id=>id!==input.value);
        }else if(question)answers[input.name]=input.value;
        if(input.type==='checkbox'||input.type==='radio'||question?.kind==='select'){
          const oldY=root.scrollY||0,name=input.name,value=input.value;
          render();
          const restored=Array.from(main.querySelectorAll('input,select,textarea')).find(node=>node.name===name&&node.value===value);
          restored?.focus({preventScroll:true});root.scrollTo?.(0,oldY);
        }
      });
      form.addEventListener('input',event=>{
        const input=event.target;
        if(!input.name||['checkbox','radio'].includes(input.type))return;
        const matrix=page.questions.find(item=>item.kind==='matrix_number'&&input.name.startsWith(`${item.id}:`));
        if(matrix){const [row,column]=input.name.slice(matrix.id.length+1).split(':');answers[matrix.id]||={};answers[matrix.id][row]||={};answers[matrix.id][row][column]=input.value;}
        else answers[input.name]=input.value;
      });
      form.addEventListener('submit',event=>{
        event.preventDefault();
        if(last){onFinish?.(allAnswers());return;}
        pageId=available[index+1].id;render();main.querySelector('h1')?.focus({preventScroll:true});root.scrollTo?.(0,0);
      });
      main.querySelector('#rand-back').addEventListener('click',()=>{
        if(first){onExit?.();return;}
        pageId=available[index-1].id;render();main.querySelector('h1')?.focus({preventScroll:true});root.scrollTo?.(0,0);
      });
      main.querySelector('h1')?.focus({preventScroll:true});
    }
    return Object.freeze({start(){pageId=pages()[0]?.id||null;render();},render,answers:allAnswers,goTo(id){if(!pages().some(page=>page.id===id))return false;pageId=id;render();return true;},reset(){for(const key of Object.keys(answers))delete answers[key];pageId=null;}});
  }
  root.SURVEY_RAND_ADULT_ENGINE=Object.freeze({create,renderQuestion});
})(typeof window==='undefined'?globalThis:window);
