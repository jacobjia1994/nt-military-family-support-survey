export const CONTACT_NOTICE_VERSION = '2026-09-25-contact-v2';
export const CONTACT_LIMITS = Object.freeze({ preferred_name:80, phone:30, contact_notes:200, topic:600 });
export const CONTACT_METHODS = Object.freeze({call:'Call me',sms:'Text me first'});
export const CONTACT_AGES = Object.freeze({adult:'18 or older',youth:'15–17',child:'Under 15'});
export const CONTACT_REQUESTERS = Object.freeze({self:'For myself',guardian:'For my child or a child in my care'});
export const CONTACT_NOTICE = [
  ['Purpose and choice', 'Lutheran Care will use these details to contact you about its NT Defence Family Support Program consultation. Taking part is voluntary. We need a name to use and a safe way to contact you. This request does not commit you or your child to an interview.'],
  ['Storage and access', 'Lutheran Care will hold this request securely in its records, with access limited to staff who need it to arrange the conversation. Our Privacy Policy explains how we manage and retain personal information.'],
  ['Keeping the forms separate', 'Your contact details will be kept separately from survey answers. Your name and phone number will not be included in consultation reports to Defence.'],
  ['Sharing and your rights', 'We may disclose information with your consent or where the law permits or requires it, including to protect someone from serious harm. You can ask to update your details, cancel contact, access your information or raise a privacy concern.']
];
export const CONTACT_CONSENT = 'I agree to Lutheran Care contacting me as selected above and handling the details I provide as described, including any sensitive information I choose to include.';
export const CONTACT_CHILD_CONSENT = 'I would like Lutheran Care to contact me as selected above. I understand how my contact details will be used.';
export const CONTACT_GUARDIAN_DECLARATION = 'I have parental responsibility or legal authority to make this request for this child.';
export function emptyRequest(){return {requester:'',age_band:'',preferred_name:'',phone:'',contact_method:'',voicemail:false,contact_notes:'',topic:'',guardian_authority:false,consent:false};}
export function contactRoute(data){
  if(data.requester==='self'&&Object.hasOwn(CONTACT_AGES,data.age_band))return `self_${data.age_band}`;
  if(data.requester==='guardian'&&['child','youth'].includes(data.age_band))return `guardian_${data.age_band}`;
  return '';
}
export function needsTopic(data){return Boolean(contactRoute(data))&&contactRoute(data)!=='self_child';}
export function consentText(data){return contactRoute(data)==='self_child'?CONTACT_CHILD_CONSENT:CONTACT_CONSENT;}
export function phoneIsValid(value){const s=String(value||'').trim();return /^\+?[0-9() .-]+$/.test(s)&&s.replace(/\D/g,'').length>=7&&s.replace(/\D/g,'').length<=15;}
export function changeRequest(current,key,value){
  if(!Object.hasOwn(emptyRequest(),key))return {...current};
  if(key==='requester'&&value!==current.requester)return {...emptyRequest(),requester:value};
  if(key==='age_band'&&value!==current.age_band)return {...emptyRequest(),requester:current.requester,age_band:value};
  const next={...current,[key]:value};
  if(key==='contact_method'&&value!==current.contact_method)next.voicemail=false;
  if(key==='phone'&&value!==current.phone)next.voicemail=false;
  return next;
}
export function requestErrors(data){
  const errors={};
  if(!Object.hasOwn(CONTACT_REQUESTERS,data.requester))errors.requester='Choose who this request is for.';
  if(!contactRoute(data))errors.age_band='Choose an age group before continuing.';
  if(!String(data.preferred_name||'').trim())errors.preferred_name='Enter the name you would like us to use.';
  if(!phoneIsValid(data.phone))errors.phone='Enter a phone number with 7 to 15 digits, including the country code if needed.';
  if(!Object.hasOwn(CONTACT_METHODS,data.contact_method))errors.contact_method='Choose whether we may call or text you.';
  for(const [key,max] of Object.entries(CONTACT_LIMITS))if((key!=='topic'||needsTopic(data))&&String(data[key]||'').length>max)errors[key]=`Use no more than ${max} characters.`;
  if(data.requester==='guardian'&&data.guardian_authority!==true)errors.guardian_authority='Please confirm your authority to make this request for the child.';
  if(data.consent!==true)errors.consent='Please give your agreement before continuing.';
  return errors;
}
export function reviewRequest(data){
  if(Object.keys(requestErrors(data)).length)throw new Error('Contact details are incomplete');
  const result={requester:data.requester,age_band:data.age_band,preferred_name:data.preferred_name.trim(),phone:data.phone.trim(),contact_method:data.contact_method,voicemail:data.contact_method==='call'&&data.voicemail===true,contact_notes:String(data.contact_notes||'').trim(),consent:true,notice_version:CONTACT_NOTICE_VERSION};
  if(needsTopic(data))result.topic=String(data.topic||'').trim();
  if(data.requester==='guardian')result.guardian_authority=true;
  return result;
}
export function escapeHTML(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
// The same public resource is available without providing contact details.
export function contactResource(config={}){
  let url='';
  try {const parsed=new URL(String(config.url||''));if(parsed.protocol==='https:'&&!parsed.username&&!parsed.password)url=parsed.href;} catch {}
  return {title:String(config.title||'A free resource for Defence families'),url};
}
