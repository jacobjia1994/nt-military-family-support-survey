import {CONTACT_NOTICE,CONTACT_METHODS,CONTACT_AGES,CONTACT_REQUESTERS,CONTACT_INTERVIEW_MODES,CONTACT_GUARDIAN_DECLARATION,CONTACT_CAPACITY_NOTICE,CONTACT_CAPACITY_ACKNOWLEDGEMENT,CONTACT_LIMITS,emptyRequest,contactRoute,needsTopic,needsArrangements,emailIsValid,consentText,changeRequest,requestErrors,reviewRequest,contactResource,escapeHTML as esc} from './contact-model.mjs?v=20260927-interview-5';

// Review build: no receiver, persistence, exports or survey-response mapping.
let request=emptyRequest();
const main=document.querySelector('#main');
const required='<span class="required-label">(required)</span>';
const optional='<span class="required-label">(optional)</span>';
const tel='<a href="tel:+61882699333">(08) 8269 9333</a>';
function focusStart(){main.querySelector('h1')?.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
function previewHTML(){return '<p class="contact-preview">Team review only. This form does not send your details. Please use invented details.</p>';}
function privacyHTML(){return `<section class="contact-privacy" aria-labelledby="contact-privacy-title"><h2 id="contact-privacy-title">Your information</h2><div class="notice-grid">${CONTACT_NOTICE.map(([title,text])=>`<p><strong>${esc(title)}</strong>${esc(text)}</p>`).join('')}</div><p>For privacy, access or complaints, contact Lutheran Care on ${tel} or <a href="mailto:feedback@lutherancare.org.au">feedback@lutherancare.org.au</a>. Read our <a href="https://www.lutherancare.org.au/privacy-policy/" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.</p></section>`;}
function consentHTML(){return `<div id="request-agreement">${privacyHTML()}<label class="contact-check"><input type="checkbox" name="consent" ${request.consent?'checked':''}><span>${esc(consentText(request))} ${required}</span></label></div>`;}
function capacityHTML(){return `<section class="contact-capacity" aria-labelledby="capacity-title"><h2 id="capacity-title">Interview availability</h2><p id="capacity-explanation">${esc(CONTACT_CAPACITY_NOTICE)}</p><label class="contact-check"><input type="checkbox" name="capacity_acknowledged" aria-describedby="capacity-explanation" required ${request.capacity_acknowledged?'checked':''}><span>${esc(CONTACT_CAPACITY_ACKNOWLEDGEMENT)} ${required}</span></label></section>`;}
function resourceHTML(config=globalThis.SURVEY_THANK_YOU_RESOURCE||{}){const resource=contactResource(config);return `<section class="contact-resource" aria-labelledby="contact-resource-title"><h2 id="contact-resource-title">${esc(resource.title)}</h2><p>Explore our free guide to support services for Defence members and families.</p>${resource.url?`<a class="button secondary" href="${esc(resource.url)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">Find support in a few clicks</a>`:'<button class="button secondary" type="button" disabled>Find support in a few clicks</button><p class="small">Available soon</p>'}</section>`;}
function footerHTML(){return `<div class="contact-footer"><p>For help with this form, call Lutheran Care on ${tel} and ask for the NT Defence Family Support Program.</p><p>This form is for the consultation, not a counselling or service appointment. In an emergency in Australia, call 000.</p></div>${resourceHTML()}`;}
function textField(key,label,{hint='',multiline=false}={}){
  const isRequired=['preferred_name','phone'].includes(key),hasError=['preferred_name','phone','email'].includes(key);
  const describedBy=[hint?`${key}-hint`:'',hasError?`${key}-error`:''].filter(Boolean).join(' ');
  const type=key==='phone'?'tel':key==='email'?'email':'text';
  return `<div class="question-group"><label class="field-label" for="${key}">${esc(label)}${isRequired?required:optional}</label>${hint?`<p class="field-hint" id="${key}-hint">${esc(hint)}</p>`:''}${multiline?`<textarea id="${key}" name="${key}" class="textarea" rows="3" maxlength="${CONTACT_LIMITS[key]}" ${describedBy?`aria-describedby="${describedBy}"`:''}>${esc(request[key])}</textarea>`:`<input id="${key}" name="${key}" class="text-input" type="${type}" ${key==='phone'?'inputmode="tel"':''} autocomplete="${key==='preferred_name'?'given-name':key==='phone'?'tel':key==='email'?'email':'off'}" maxlength="${CONTACT_LIMITS[key]}" value="${esc(request[key])}" ${describedBy?`aria-describedby="${describedBy}"`:''} ${isRequired?'required':''}>`}${hasError?`<p class="contact-field-error" id="${key}-error" aria-live="polite" hidden></p>`:''}</div>`;
}
function choiceField(key,label,choices,{wide=false,isOptional=false,hint=''}={}){
  return `<fieldset class="question-group" ${hint?`aria-describedby="${key}-hint"`:''}><legend>${esc(label)} ${isOptional?optional:required}</legend>${hint?`<p class="field-hint" id="${key}-hint">${esc(hint)}</p>`:''}<div class="contact-choices${wide?' route-choices':''}">${Object.entries(choices).map(([id,text])=>`<label class="choice"><input type="radio" name="${key}" value="${id}" ${request[key]===id?'checked':''} ${key==='contact_method'&&id==='email'&&!emailIsValid(request.email)?'disabled':''}><span class="choice-label">${esc(text)}</span></label>`).join('')}</div></fieldset>`;
}
function routeNote(){
  if(request.requester==='guardian')return 'This arranges an interview with your child. If you want to share your own experience as a parent or carer, choose Me. Please give your own contact details below.';
  if(contactRoute(request)==='self_minor')return 'A team member will discuss any permission or support you need before the interview. Please save private details for the conversation.';
  return '';
}
function renderForm(){
  const route=contactRoute(request),guardian=request.requester==='guardian';
  main.innerHTML=`${previewHTML()}<section class="contact-intro"><h1 tabindex="-1">Request an interview</h1><p>Share your experience of Defence life or supporting Defence families in Greater Darwin. We’d like to hear what works well and what could improve.</p></section>
  <form id="contact-form" class="contact-form" novalidate>
  ${choiceField('requester','Who would be interviewed?',CONTACT_REQUESTERS)}
  ${request.requester==='self'?choiceField('age_band','Your age group',CONTACT_AGES):''}
  <div id="contact-fields" ${route?'':'hidden'}>
  ${routeNote()?`<p class="contact-route-note">${esc(routeNote())}</p>`:''}
  ${textField('preferred_name',guardian?'Your name':'Name',{hint:'The name you would like us to use.'})}
  ${textField('phone',guardian?'Your mobile number':'Mobile number',{hint:'A mobile number we can reach you on. Include the country code for an overseas number.'})}
  ${textField('email','Email address')}
  ${needsTopic(request)?textField('topic',guardian?'What would your child like to discuss?':'What would you like to discuss?',{hint:guardian?'A brief topic is enough. Leave out your child’s name and save private details for the interview.':'A brief topic is enough. Please save private details for the interview.',multiline:true}):''}
  ${needsArrangements(request)?choiceField('interview_mode','How would you prefer to be interviewed?',CONTACT_INTERVIEW_MODES,{isOptional:true}):''}
  ${needsArrangements(request)?textField('suggested_time','Suggested interview date and time',{hint:'Suggest one or more dates and times, or write “flexible”. Include your time zone if outside the NT.',multiline:true}):''}
  ${choiceField('contact_method','How should we arrange a time with you?',CONTACT_METHODS,{hint:'We’ll use your choice to confirm a suitable time.'})}
  <p class="field-hint" id="email-contact-hint">To choose email, add your email address above.</p>
  <div id="voicemail-wrap" class="voicemail-choice" ${request.contact_method==='call'?'':'hidden'}><label class="contact-check"><input type="checkbox" name="voicemail" ${request.voicemail?'checked':''}><span>You may leave a voicemail saying Lutheran Care called.</span></label></div>
  ${textField('contact_notes','Any contact or access needs?',{hint:'For example, times not to contact you, an interpreter, accessibility needs or a support person. Leave blank if none.',multiline:true})}
  ${guardian?`<label class="contact-check"><input type="checkbox" name="guardian_authority" ${request.guardian_authority?'checked':''}><span>${esc(CONTACT_GUARDIAN_DECLARATION)} ${required}</span></label>`:''}
  ${consentHTML()}
  ${capacityHTML()}
  <div class="contact-actions"><button class="text-button" id="clear-details" type="button">Clear details</button><button class="button primary" type="submit" disabled>Review details</button></div></div></form>${footerHTML()}`;
  const form=main.querySelector('#contact-form'),touched=new Set();
  const update=()=>{
    main.querySelector('#contact-fields').hidden=!contactRoute(request);
    main.querySelector('#voicemail-wrap').hidden=request.contact_method!=='call';
    form.querySelector('[name="voicemail"]').checked=request.voicemail;
    const emailChoice=form.querySelector('[name="contact_method"][value="email"]');
    emailChoice.disabled=!emailIsValid(request.email);emailChoice.checked=request.contact_method==='email';
    main.querySelector('#email-contact-hint').hidden=emailIsValid(request.email);
    form.querySelector('[name="consent"]').checked=request.consent;
    form.querySelector('[name="capacity_acknowledged"]').checked=request.capacity_acknowledged;
    form.querySelector('[type="submit"]').disabled=Object.keys(requestErrors(request)).length>0;
  };
  const save=e=>{const input=e.target;if(!input.name)return;request=changeRequest(request,input.name,input.type==='checkbox'?input.checked:input.value);if(['requester','age_band'].includes(input.name)){renderForm();main.querySelector(`[name="${input.name}"][value="${request[input.name]}"]`)?.focus();return;}update();if(touched.has(input.name))showError(input.name);};
  form.addEventListener('input',e=>{if(['text','tel','email','textarea'].includes(e.target.type))save(e);});
  form.addEventListener('change',e=>{if(['radio','checkbox'].includes(e.target.type))save(e);});
  form.addEventListener('focusout',e=>{if(['phone','preferred_name','email'].includes(e.target.name)){touched.add(e.target.name);showError(e.target.name);}});
  form.addEventListener('submit',e=>{e.preventDefault();if(Object.keys(requestErrors(request)).length)return;request={...emptyRequest(),...reviewRequest(request)};renderReview();});
  main.querySelector('#clear-details').onclick=()=>{request=emptyRequest();renderForm();focusStart();};update();
}
function showError(key){const input=main.querySelector(`[name="${key}"]`),el=main.querySelector(`#${key}-error`),message=requestErrors(request)[key];if(!input||!el)return;el.textContent=message||'';el.hidden=!message;input.setAttribute('aria-invalid',message?'true':'false');}
function renderReview(){
  const details=reviewRequest(request),guardian=details.requester==='guardian';
  const rows=[['Person to be interviewed',CONTACT_REQUESTERS[details.requester]],[guardian?'Child’s age group':'Age group',CONTACT_AGES[details.age_band]],[guardian?'Parent or guardian’s name':'Name',details.preferred_name],[guardian?'Parent or guardian’s mobile number':'Mobile number',details.phone],['Arrange a time by',CONTACT_METHODS[details.contact_method]]];
  if(details.email)rows.push(['Email address',details.email]);
  if(details.contact_method==='call')rows.push(['Voicemail',details.voicemail?'May leave a voicemail saying Lutheran Care called':'Do not leave a voicemail']);
  if(details.contact_notes)rows.push(['Contact or access needs',details.contact_notes]);
  if(needsArrangements(details)&&details.interview_mode)rows.push(['Interview format',CONTACT_INTERVIEW_MODES[details.interview_mode]]);
  if(needsTopic(details)&&details.topic)rows.push(['Discussion topic',details.topic]);
  if(needsArrangements(details)&&details.suggested_time)rows.push(['Suggested interview date and time',details.suggested_time]);
  rows.push(['Interview availability',CONTACT_CAPACITY_ACKNOWLEDGEMENT]);
  main.innerHTML=`${previewHTML()}<section class="contact-review"><h1 tabindex="-1">Check your details</h1><dl>${rows.map(([label,value])=>`<dt>${esc(label)}</dt><dd>${esc(value)}</dd>`).join('')}</dl><div class="contact-actions"><button class="back-button" id="edit-details" type="button">Change details</button><button class="button primary" id="finish-contact" type="button">Finish preview</button></div></section>${footerHTML()}`;
  main.querySelector('#edit-details').onclick=()=>{renderForm();focusStart();};main.querySelector('#finish-contact').onclick=renderFinish;focusStart();
}
function renderFinish(){
  main.innerHTML=`<section class="finish"><h1 tabindex="-1">End of preview</h1><p>Your details have not been sent and no interview has been booked.</p>${resourceHTML()}<div class="finish-actions"><button class="button secondary" id="review-details">Review my details</button><button class="text-button" id="finish-clear">Clear my details</button></div></section>`;
  main.querySelector('#review-details').onclick=renderReview;main.querySelector('#finish-clear').onclick=()=>{request=emptyRequest();renderForm();focusStart();};focusStart();
}
window.addEventListener('pagehide',()=>{request=emptyRequest();main.replaceChildren();});
window.addEventListener('pageshow',e=>{if(e.persisted){request=emptyRequest();renderForm();}});
renderForm();
