export const CONTACT_NOTICE_VERSION = '2026-09-25-contact-v1';
export const CONTACT_LIMITS = Object.freeze({ preferred_name:80, phone:30, contact_notes:200, topic:600 });
export const CONTACT_METHODS = Object.freeze({call:'Call me',sms:'Text me first'});
export const CONTACT_NOTICE = [
  ['Purpose and choice', 'Lutheran Care will use these details to contact you and arrange a conversation for its NT Defence Family Support Program consultation. Taking part is voluntary. We need a name to use and a safe way to contact you.'],
  ['Storage and access', 'Lutheran Care will hold this request securely in its records, with access limited to staff who need it to arrange the conversation. Our Privacy Policy explains how we manage and retain personal information.'],
  ['Keeping the forms separate', 'Your contact details will be kept separately from survey answers. Your name and phone number will not be included in consultation reports to Defence.'],
  ['Sharing and your rights', 'We may disclose information with your consent or where the law permits or requires it, including to protect someone from serious harm. You can ask to update your details, cancel contact, access your information or raise a privacy concern.']
];
export const CONTACT_CONSENT = 'I agree to Lutheran Care contacting me as selected above and collecting, using and sharing these details as described, including any sensitive information I choose to provide.';
export function emptyRequest(){return {age_band:'',preferred_name:'',phone:'',contact_method:'',voicemail:false,contact_notes:'',topic:'',consent:false};}
export function phoneIsValid(value){const s=String(value||'').trim();return /^\+?[0-9() .-]+$/.test(s)&&s.replace(/\D/g,'').length>=7&&s.replace(/\D/g,'').length<=15;}
export function changeRequest(current,key,value){
  if(!Object.hasOwn(emptyRequest(),key))return {...current};
  if(key==='age_band'&&value!==current.age_band)return {...emptyRequest(),age_band:value};
  const next={...current,[key]:value};
  if(key==='contact_method'&&value!==current.contact_method)next.voicemail=false;
  if(key==='phone'&&value!==current.phone)next.voicemail=false;
  return next;
}
export function requestErrors(data){
  const errors={};
  if(data.age_band!=='15_plus')errors.age_band='Choose your age group before continuing.';
  if(!String(data.preferred_name||'').trim())errors.preferred_name='Enter the name you would like us to use.';
  if(!phoneIsValid(data.phone))errors.phone='Enter a phone number with 7 to 15 digits, including the country code if needed.';
  if(!Object.hasOwn(CONTACT_METHODS,data.contact_method))errors.contact_method='Choose whether we may call or text you.';
  for(const [key,max] of Object.entries(CONTACT_LIMITS))if(String(data[key]||'').length>max)errors[key]=`Use no more than ${max} characters.`;
  if(data.consent!==true)errors.consent='Please give your agreement before continuing.';
  return errors;
}
export function reviewRequest(data){
  if(Object.keys(requestErrors(data)).length)throw new Error('Contact details are incomplete');
  return {age_band:'15_plus',preferred_name:data.preferred_name.trim(),phone:data.phone.trim(),contact_method:data.contact_method,voicemail:data.contact_method==='call'&&data.voicemail===true,contact_notes:data.contact_notes.trim(),topic:data.topic.trim(),consent:true,notice_version:CONTACT_NOTICE_VERSION};
}
export function escapeHTML(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
