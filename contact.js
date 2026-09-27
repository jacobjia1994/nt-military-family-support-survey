import {CONTACT_NOTICE,CONTACT_METHODS,CONTACT_AGES,CONTACT_REQUESTERS,CONTACT_INTERVIEW_MODES,CONTACT_CONNECTIONS,CONTACT_GUARDIAN_DECLARATION,CONTACT_LIMITS,emptyRequest,contactRoute,needsTopic,needsArrangements,emailIsValid,consentText,changeRequest,requestErrors,reviewRequest,contactResource,escapeHTML as esc} from './contact-model.mjs?v=20260927-interview-1';

// Team review only: no receiver, persistence, exports or survey-response mapping.
let request=emptyRequest();
const main=document.querySelector('#main');
const required='<span class="required-label">(required)</span>';
const optional='<span class="required-label">(optional)</span>';
const tel='<a href="tel:+61882699333">(08) 8269 9333</a>';
const firstStepKeys=['requester','age_band','preferred_name','phone','email','contact_method','contact_notes','guardian_authority'];
function focusStart(){main.querySelector('h1')?.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
function previewHTML(){return '<p class="contact-preview">Team review only. This form does not send your details. Please use invented details.</p>';}
function privacyHTML(){return `<section class="contact-privacy" aria-labelledby="contact-privacy-title"><h2 id="contact-privacy-title">Your information</h2><div class="notice-grid">${CONTACT_NOTICE.map(([title,text])=>`<p><strong>${esc(title)}</strong>${esc(text)}</p>`).join('')}</div><p>For privacy, access or complaints, contact Lutheran Care on ${tel} or <a href="mailto:feedback@lutherancare.org.au">feedback@lutherancare.org.au</a>. Read our <a href="https://www.lutherancare.org.au/privacy-policy/" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.</p></section>`;}
function consentHTML(){return `<div id="request-agreement">${privacyHTML()}<label class="contact-check"><input type="checkbox" name="consent" ${request.consent?'checked':''}><span>${esc(consentText(request))} ${required}</span></label><p class="field-hint">This is permission to arrange contact. Taking part in an interview, recording it or using an attributed quote will be discussed separately.</p></div>`;}
function resourceHTML(config=globalThis.SURVEY_THANK_YOU_RESOURCE||{}){const resource=contactResource(config);return `<section class="contact-resource" aria-labelledby="contact-resource-title"><h2 id="contact-resource-title">${esc(resource.title)}</h2><p>Explore our free guide to support services for Defence members and families. You do not need to request an interview.</p>${resource.url?`<a class="button secondary" href="${esc(resource.url)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">Find support in a few clicks</a>`:'<button class="button secondary" type="button" disabled>Find support in a few clicks</button><p class="small">Available soon</p>'}</section>`;}
function footerHTML(){return `<div class="contact-footer"><p>For help with taking part or a different contact arrangement, call Lutheran Care on ${tel} and ask for the NT Defence Family Support Program.</p><p>This is a service-planning consultation, not a counselling or service appointment. For urgent help in Australia, call 000.</p></div>${resourceHTML()}`;}
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
  if(request.requester==='guardian')return 'Give your own contact details. This route is for your child to take part. If you want to share your own experience as a parent, choose “I would take part”. A worker will discuss your child’s wishes and any permission or support needed.';
  if(contactRoute(request)==='self_child')return 'A worker can contact you to explain how you can take part and discuss permission before arranging an interview. Please give only your contact details here.';
  if(contactRoute(request)==='self_youth')return 'A worker will explain the interview and discuss any permission or support you need before you take part.';
  if(request.requester==='professional')return 'Share what you see in your work and how services could work together. Please leave out identifiable client or patient details. You can also explain if you have personal Defence-family experience.';
  return '';
}
function contactErrors(){const errors=requestErrors({...request,consent:true});return Object.fromEntries(Object.entries(errors).filter(([key])=>firstStepKeys.includes(key)));}
function renderForm(){
  const route=contactRoute(request),guardian=request.requester==='guardian',child=route==='self_child';
  const ages=guardian?{youth:CONTACT_AGES.youth,child:CONTACT_AGES.child}:CONTACT_AGES;
  main.innerHTML=`${previewHTML()}<section class="contact-intro"><h1 tabindex="-1">Request an interview with Lutheran Care</h1><p>Tell us what has helped you or your family, what could work better, and what is worth keeping. Your experience will help plan Defence family support in Greater Darwin. You do not need to be looking for help or have completed the survey.</p><ul class="conversation-summary"><li>We plan adult conversations of around 30–40 minutes. Times and arrangements for children and young people will be discussed separately.</li><li>An LC project team member, which may include a supervised social work student, will explain who would be there before you decide.</li><li>You can skip a question, pause, stop or ask to rearrange. Requesting contact does not book an appointment.</li></ul></section>
  <form id="contact-form" class="contact-form" novalidate>
  ${choiceField('requester','Who would take part?',CONTACT_REQUESTERS,{wide:true})}
  ${request.requester&&request.requester!=='professional'?choiceField('age_band',guardian?'Your child’s age group':'Your age group',ages):''}
  <div id="contact-fields" ${route?'':'hidden'}>
  ${routeNote()?`<p class="contact-route-note">${esc(routeNote())}</p>`:''}
  ${textField('preferred_name',guardian?'Your preferred name':'What would you like us to call you?')}
  ${textField('phone',guardian?'Your mobile number':'Mobile number',{hint:'Use a mobile number you can access. For Australia, enter 04… or +61 4…; for another country, include + and the country code.'})}
  ${textField('email','Email address',{hint:'You can leave this blank. If provided, it will be used only for this consultation and in line with your contact choice.'})}
  ${choiceField('contact_method','How may we first contact you?',CONTACT_METHODS,{wide:true,hint:'We will use the method you choose. Providing a mobile number does not give permission to call if you choose text or email.'})}
  <p class="field-hint" id="email-contact-hint">Add an email address above if you would like us to email you first.</p>
  <div id="voicemail-wrap" class="voicemail-choice" ${request.contact_method==='call'?'':'hidden'}><label class="contact-check"><input type="checkbox" name="voicemail" ${request.voicemail?'checked':''}><span>You may leave a voicemail saying Lutheran Care called.</span></label></div>
  ${textField('contact_notes','Any times to avoid or other contact instructions?',{hint:child?'Please include only contact instructions, such as a time to avoid.':'For times outside the NT, include your time zone. This is about making contact; interview times can be agreed later.'})}
  ${guardian?`<label class="contact-check"><input type="checkbox" name="guardian_authority" ${request.guardian_authority?'checked':''}><span>${esc(CONTACT_GUARDIAN_DECLARATION)} ${required}</span></label>`:''}
  ${child?consentHTML():''}
  <div class="contact-actions"><button class="text-button" id="clear-details" type="button">Clear details</button><button class="button primary" type="submit" disabled>${child?'Review details':'Continue'}</button></div></div></form>${footerHTML()}`;
  const form=main.querySelector('#contact-form'),touched=new Set();
  const update=()=>{
    main.querySelector('#contact-fields').hidden=!contactRoute(request);
    main.querySelector('#voicemail-wrap').hidden=request.contact_method!=='call';
    form.querySelector('[name="voicemail"]').checked=request.voicemail;
    const emailChoice=form.querySelector('[name="contact_method"][value="email"]');
    emailChoice.disabled=!emailIsValid(request.email);emailChoice.checked=request.contact_method==='email';
    main.querySelector('#email-contact-hint').hidden=emailIsValid(request.email);
    if(child)form.querySelector('[name="consent"]').checked=request.consent;
    form.querySelector('[type="submit"]').disabled=Object.keys(child?requestErrors(request):contactErrors()).length>0;
  };
  const save=e=>{const input=e.target;if(!input.name)return;request=changeRequest(request,input.name,input.type==='checkbox'?input.checked:input.value);if(['requester','age_band'].includes(input.name)){renderForm();main.querySelector(`[name="${input.name}"][value="${request[input.name]}"]`)?.focus();return;}update();if(touched.has(input.name))showError(input.name);};
  form.addEventListener('input',e=>{if(['text','tel','email','textarea'].includes(e.target.type))save(e);});
  form.addEventListener('change',e=>{if(['radio','checkbox'].includes(e.target.type))save(e);});
  form.addEventListener('focusout',e=>{if(['phone','preferred_name','email'].includes(e.target.name)){touched.add(e.target.name);showError(e.target.name);}});
  form.addEventListener('submit',e=>{e.preventDefault();if(Object.keys(child?requestErrors(request):contactErrors()).length)return;if(child){request={...emptyRequest(),...reviewRequest(request)};renderReview();}else renderPreferences();});
  main.querySelector('#clear-details').onclick=()=>{request=emptyRequest();renderForm();focusStart();};update();
}
function showError(key){const input=main.querySelector(`[name="${key}"]`),el=main.querySelector(`#${key}-error`),message=requestErrors(request)[key];if(!input||!el)return;el.textContent=message||'';el.hidden=!message;input.setAttribute('aria-invalid',message?'true':'false');}
function renderPreferences(){
  if(!needsArrangements(request)||Object.keys(contactErrors()).length){renderForm();focusStart();return;}
  const professional=request.requester==='professional',guardian=request.requester==='guardian';
  main.innerHTML=`${previewHTML()}<section class="contact-intro"><h1 tabindex="-1">Planning your conversation</h1><p>These preferences are optional. We will offer available times and confirm who would speak with you. You can leave the questions blank and <a href="#request-agreement">go straight to the contact agreement</a>.</p></section><form id="preferences-form" class="contact-form" novalidate>
  ${professional?textField('organisation_role','Your organisation or professional role',{hint:'Only include the work details relevant to this consultation.'}):choiceField('connection','Your connection to the ADF community in Greater Darwin',CONTACT_CONNECTIONS,{isOptional:true,hint:'You can have a connection even if you live elsewhere.'})}
  ${choiceField('interview_mode','Which way of talking would suit you best?',CONTACT_INTERVIEW_MODES,{isOptional:true,hint:'This is an interview preference, separate from your first-contact choice. Availability will be confirmed with you.'})}
  ${textField('availability','When could you take part?',{hint:'For example, school hours or an evening. Exact dates will be agreed later; include your time zone if outside the NT.'})}
  ${textField('participation_notes','What would make taking part easier?',{hint:'For example, access or language needs, bringing a support person, caring responsibilities, or preferring not to speak with someone you know. You can discuss this privately instead.'})}
  ${textField('topic',professional?'What would you like to contribute?':'What would you like to talk about?',{hint:professional?'For example, how families find support or where services could work better together. Leave out identifiable client or patient details.':guardian?'What has helped, what could be better, or both. Leave out your child’s name and save private details for the conversation.':'What has helped, what could be better, or both. Save private details for the conversation and leave out other people’s names.',multiline:true})}
  <p class="contact-route-note">You can ask to talk privately or bring a support person. If you want someone else to take part too, the team will check that each person wishes to join. Places and arrangements will be confirmed individually.</p>
  ${consentHTML()}
  <div class="contact-actions"><button class="back-button" id="back-contact" type="button">Back to contact details</button><button class="button primary" type="submit" disabled>Review details</button></div></form>${footerHTML()}`;
  const form=main.querySelector('#preferences-form');
  const update=()=>{form.querySelector('[name="consent"]').checked=request.consent;form.querySelector('[type="submit"]').disabled=Object.keys(requestErrors(request)).length>0;};
  const save=e=>{const input=e.target;if(!input.name)return;request=changeRequest(request,input.name,input.type==='checkbox'?input.checked:input.value);update();};
  form.addEventListener('input',e=>{if(['text','textarea'].includes(e.target.type))save(e);});
  form.addEventListener('change',e=>{if(['radio','checkbox'].includes(e.target.type))save(e);});
  form.addEventListener('submit',e=>{e.preventDefault();if(Object.keys(requestErrors(request)).length)return;request={...emptyRequest(),...reviewRequest(request)};renderReview();});
  main.querySelector('#back-contact').onclick=()=>{renderForm();focusStart();};update();focusStart();
}
function renderReview(){
  const details=reviewRequest(request),guardian=details.requester==='guardian',professional=details.requester==='professional';
  const rows=[['Taking part',CONTACT_REQUESTERS[details.requester]],...(!professional?[[guardian?'Child’s age group':'Age group',CONTACT_AGES[details.age_band]]]:[]),[guardian?'Parent or guardian’s name':'Name to use',details.preferred_name],[guardian?'Parent or guardian’s mobile number':'Mobile number',details.phone],['Email address',details.email||'Not provided'],['First contact',CONTACT_METHODS[details.contact_method]],...(details.contact_method==='call'?[['Voicemail',details.voicemail?'May leave a voicemail saying Lutheran Care called':'Do not leave a voicemail']]:[]),['Contact instructions',details.contact_notes||'Not provided']];
  if(needsArrangements(details))rows.push([professional?'Organisation or role':'ADF connection',professional?(details.organisation_role||'Not provided'):(CONTACT_CONNECTIONS[details.connection]||'Not provided')],['Interview preference',CONTACT_INTERVIEW_MODES[details.interview_mode]||'Discuss when arranging'],['Availability',details.availability||'Discuss when arranging'],['Participation arrangements',details.participation_notes||'Not provided']);
  if(needsTopic(details))rows.push([professional?'What you would like to contribute':'What you would like to talk about',details.topic||'Not provided']);
  main.innerHTML=`${previewHTML()}<section class="contact-review"><h1 tabindex="-1">Check your details</h1><p>Please check your mobile number and contact choice. An interview would only be booked after the team agrees the arrangements with you.</p><dl>${rows.map(([label,value])=>`<dt>${esc(label)}</dt><dd>${esc(value)}</dd>`).join('')}</dl><div class="contact-actions"><button class="back-button" id="edit-details" type="button">Change contact details</button>${needsArrangements(details)?'<button class="back-button" id="edit-preferences" type="button">Change preferences</button>':''}<button class="button primary" id="finish-contact" type="button">Finish preview</button></div></section>${footerHTML()}`;
  main.querySelector('#edit-details').onclick=()=>{renderForm();focusStart();};if(needsArrangements(details))main.querySelector('#edit-preferences').onclick=renderPreferences;main.querySelector('#finish-contact').onclick=renderFinish;focusStart();
}
function renderFinish(){
  main.innerHTML=`<section class="finish"><h1 tabindex="-1">You have reached the end of this preview.</h1><p>Your details have not been sent and no interview has been booked.</p><p>When requests open, the team will contact people using their chosen method to discuss available times. Each person will be told who would conduct the interview and how to cancel or rearrange.</p>${resourceHTML()}<div class="finish-actions"><button class="button secondary" id="review-details">Review my details</button><button class="text-button" id="finish-clear">Clear my details</button></div></section>`;
  main.querySelector('#review-details').onclick=renderReview;main.querySelector('#finish-clear').onclick=()=>{request=emptyRequest();renderForm();focusStart();};focusStart();
}
window.addEventListener('pagehide',()=>{request=emptyRequest();main.replaceChildren();});
window.addEventListener('pageshow',e=>{if(e.persisted){request=emptyRequest();renderForm();}});
renderForm();
