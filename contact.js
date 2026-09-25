import {CONTACT_NOTICE,CONTACT_METHODS,CONTACT_AGES,CONTACT_REQUESTERS,CONTACT_GUARDIAN_DECLARATION,CONTACT_LIMITS,emptyRequest,contactRoute,needsTopic,consentText,changeRequest,requestErrors,reviewRequest,contactResource,escapeHTML as esc} from './contact-model.mjs?v=20260925-4';

// Internal review build: deliberately no receiver, persistence or answer download.
// Do not add survey response IDs, query-string values or shared answer state.
let request=emptyRequest();
const main=document.querySelector('#main');
const required='<span class="required-label">(required)</span>';
const optional='<span class="required-label">(optional)</span>';
const tel='<a href="tel:+61882699333">(08) 8269 9333</a>';
function focusStart(){main.querySelector('h1')?.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
function privacyHTML(){return `<section class="contact-privacy" aria-labelledby="contact-privacy-title"><h2 id="contact-privacy-title">Your information</h2><div class="notice-grid">${CONTACT_NOTICE.map(([title,text])=>`<p><strong>${esc(title)}</strong>${esc(text)}</p>`).join('')}</div><p>Contact Lutheran Care on ${tel} or <a href="mailto:feedback@lutherancare.org.au">feedback@lutherancare.org.au</a>. Read our <a href="https://www.lutherancare.org.au/privacy-policy/" target="_blank" rel="noopener noreferrer">Privacy Policy</a> for access, correction and complaints information.</p></section>`;}
function resourceHTML(config=globalThis.SURVEY_THANK_YOU_RESOURCE||{}){const resource=contactResource(config);return `<section class="contact-resource" aria-labelledby="contact-resource-title"><h2 id="contact-resource-title">${esc(resource.title)}</h2>${resource.url?`<a class="button secondary" href="${esc(resource.url)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">Find support services</a>`:'<button class="button secondary" type="button" disabled>Find support services</button><p class="small">Available soon</p>'}</section>`;}
function footerHTML(){return `<div class="contact-footer"><p>If you need help with this form, or cannot safely receive a call or text, call Lutheran Care on ${tel} and ask for the NT Defence Family Support Program.</p><p>This form is not for urgent help. In an emergency in Australia, call 000.</p></div>${resourceHTML()}`;}
function textField(key,label,{hint='',multiline=false}={}){const isRequired=['preferred_name','phone'].includes(key);const describedBy=[hint?`${key}-hint`:'',isRequired?`${key}-error`:''].filter(Boolean).join(' ');return `<div class="question-group"><label class="field-label" for="${key}">${esc(label)}${isRequired?required:optional}</label>${hint?`<p class="field-hint" id="${key}-hint">${esc(hint)}</p>`:''}${multiline?`<textarea id="${key}" name="${key}" class="textarea" rows="4" maxlength="${CONTACT_LIMITS[key]}" ${describedBy?`aria-describedby="${describedBy}"`:''}>${esc(request[key])}</textarea>`:`<input id="${key}" name="${key}" class="text-input" type="${key==='phone'?'tel':'text'}" ${key==='phone'?'inputmode="tel"':''} autocomplete="${key==='preferred_name'?'given-name':key==='phone'?'tel':'off'}" maxlength="${CONTACT_LIMITS[key]}" value="${esc(request[key])}" ${describedBy?`aria-describedby="${describedBy}"`:''} ${isRequired?'required':''}>`}${isRequired?`<p class="contact-field-error" id="${key}-error"></p>`:''}</div>`;}
function choiceField(key,label,choices,{wide=false}={}){return `<fieldset class="question-group"><legend>${esc(label)} ${required}</legend><div class="contact-choices${wide?' route-choices':''}">${Object.entries(choices).map(([id,text])=>`<label class="choice"><input type="radio" name="${key}" value="${id}" ${request[key]===id?'checked':''}><span class="choice-label">${esc(text)}</span></label>`).join('')}</div></fieldset>`;}
function routeNote(){
  if(request.requester==='guardian')return 'Please give your own contact details. A worker will discuss how your child can take part and what permission is needed.';
  if(contactRoute(request)==='self_child')return 'A worker can contact you to explain how you can take part and discuss permission before arranging an interview. Please give only your contact details here.';
  if(contactRoute(request)==='self_youth')return 'A worker will explain the interview and discuss any permission or support you need before you take part.';
  return '';
}
function renderForm(){
  const route=contactRoute(request),guardian=request.requester==='guardian';
  const ages=guardian?{youth:CONTACT_AGES.youth,child:CONTACT_AGES.child}:CONTACT_AGES;
  main.innerHTML=`<section class="contact-intro"><h1 tabindex="-1">Request an interview</h1><p>Share your experience with a Lutheran Care staff member to help us understand the difficulties and support needs of Defence families in the NT. Leave your details so we can arrange an interview.</p></section><form id="contact-form" class="contact-form" novalidate>
  ${choiceField('requester','Who is this request for?',CONTACT_REQUESTERS,{wide:true})}
  ${request.requester?choiceField('age_band',guardian?'Your child’s age group':'Your age group',ages):''}
  <div id="contact-fields" ${route?'':'hidden'}>
  ${routeNote()?`<p class="contact-route-note">${esc(routeNote())}</p>`:''}
  <div class="contact-pair">${textField('preferred_name',guardian?'Your preferred name':'What would you like us to call you?')}${textField('phone',guardian?'Your phone number':'Phone number',{hint:'Include the country code if you are outside Australia.'})}</div>
  ${choiceField('contact_method','How can we safely contact you?',CONTACT_METHODS)}<div id="voicemail-wrap" class="voicemail-choice" ${request.contact_method==='call'?'':'hidden'}><label class="contact-check"><input type="checkbox" name="voicemail" ${request.voicemail?'checked':''}><span>You may leave a voicemail saying Lutheran Care called.</span></label></div>
  ${textField('contact_notes','Any times to avoid or other contact instructions?',{hint:contactRoute(request)==='self_child'?'Please include only contact instructions, such as a time to avoid.':'For times, please include your time zone if you are outside the NT.'})}
  ${needsTopic(request)?textField('topic','What would you like to talk about?',{hint:guardian?'Please leave out your child’s name and save sensitive details for the conversation.':'Please save sensitive details for the conversation and leave out other people’s names.',multiline:true}):''}
  ${privacyHTML()}${guardian?`<label class="contact-check"><input type="checkbox" name="guardian_authority" ${request.guardian_authority?'checked':''}><span>${esc(CONTACT_GUARDIAN_DECLARATION)} ${required}</span></label>`:''}<label class="contact-check"><input type="checkbox" name="consent" ${request.consent?'checked':''}><span>${esc(consentText(request))} ${required}</span></label>
  <div class="contact-actions"><button class="text-button" id="clear-details" type="button">Clear details</button><button class="button primary" type="submit" disabled>Review details</button></div></div></form>${footerHTML()}`;
  const form=main.querySelector('#contact-form');const touched=new Set();
  const update=()=>{main.querySelector('#contact-fields').hidden=!contactRoute(request);main.querySelector('#voicemail-wrap').hidden=request.contact_method!=='call';form.querySelector('[name="voicemail"]').checked=request.voicemail;form.querySelector('[type="submit"]').disabled=Object.keys(requestErrors(request)).length>0;};
  const save=e=>{const input=e.target;if(!input.name)return;request=changeRequest(request,input.name,input.type==='checkbox'?input.checked:input.value);if(['requester','age_band'].includes(input.name)){renderForm();main.querySelector(`[name="${input.name}"][value="${request[input.name]}"]`)?.focus();return;}update();if(touched.has(input.name))showError(input.name);};
  form.addEventListener('input',e=>{if(['text','tel','textarea'].includes(e.target.type))save(e);});
  form.addEventListener('change',e=>{if(['radio','checkbox'].includes(e.target.type))save(e);});
  form.addEventListener('focusout',e=>{if(['phone','preferred_name'].includes(e.target.name)){touched.add(e.target.name);showError(e.target.name);}});
  form.addEventListener('submit',e=>{e.preventDefault();if(Object.keys(requestErrors(request)).length)return;request={...emptyRequest(),...reviewRequest(request)};renderReview();});
  main.querySelector('#clear-details').onclick=()=>{request=emptyRequest();renderForm();focusStart();};update();
}
function showError(key){const input=main.querySelector(`[name="${key}"]`),el=main.querySelector(`#${key}-error`),message=requestErrors(request)[key];el.textContent=message||'';el.hidden=false;input.setAttribute('aria-invalid',message?'true':'false');}
function renderReview(){
  const details=reviewRequest(request),guardian=details.requester==='guardian';
  const rows=[['Request for',guardian?'A child in my care':'Myself'],[guardian?'Child’s age group':'Age group',CONTACT_AGES[details.age_band]],[guardian?'Parent or guardian’s name':'Name to use',details.preferred_name],[guardian?'Parent or guardian’s phone number':'Phone number',details.phone],['First contact',CONTACT_METHODS[details.contact_method]],...(details.contact_method==='call'?[['Voicemail',details.voicemail?'May leave a voicemail saying Lutheran Care called':'Do not leave a voicemail']]:[]),['Contact instructions',details.contact_notes||'Not provided'],...(needsTopic(details)?[['What you would like to talk about',details.topic||'Not provided']]:[])];
  main.innerHTML=`<section class="contact-review"><h1 tabindex="-1">Check your contact details</h1><dl>${rows.map(([label,value])=>`<dt>${esc(label)}</dt><dd>${esc(value)}</dd>`).join('')}</dl><div class="contact-actions"><button class="back-button" id="edit-details" type="button">Change details</button><button class="button primary" id="finish-contact" type="button">Confirm and submit</button></div></section>${footerHTML()}`;
  main.querySelector('#edit-details').onclick=()=>{renderForm();focusStart();};main.querySelector('#finish-contact').onclick=renderFinish;focusStart();
}
function renderFinish(){main.innerHTML=`<section class="finish"><h1 tabindex="-1">Thank you for helping improve support in our NT communities.</h1>${resourceHTML()}<div class="finish-actions"><button class="button secondary" id="review-details">Review my details</button><button class="text-button" id="finish-clear">Clear my details</button></div></section>`;main.querySelector('#review-details').onclick=renderReview;main.querySelector('#finish-clear').onclick=()=>{request=emptyRequest();renderForm();focusStart();};focusStart();}
window.addEventListener('pagehide',()=>{request=emptyRequest();main.replaceChildren();});
window.addEventListener('pageshow',e=>{if(e.persisted){request=emptyRequest();renderForm();}});
renderForm();
