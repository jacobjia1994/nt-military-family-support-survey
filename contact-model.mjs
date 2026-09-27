export const CONTACT_NOTICE_VERSION = '2026-09-27-contact-v5';
export const CONTACT_LIMITS = Object.freeze({ preferred_name:80, phone:30, email:254, contact_notes:300, topic:600, suggested_time:300 });
export const CONTACT_METHODS = Object.freeze({call:'Call me',sms:'Text me',email:'Email me'});
export const CONTACT_AGES = Object.freeze({minor:'Under 18',adult:'18 or older'});
export const CONTACT_REQUESTERS = Object.freeze({self:'Me',guardian:'My child (under 18)'});
export const CONTACT_INTERVIEW_MODES = Object.freeze({phone:'Phone',video:'Video call',in_person:'In person',discuss:'No preference'});
export const CONTACT_NOTICE = [
  ['Purpose and choice', 'Lutheran Care will use these details to arrange an interview for its NT Defence Family Support Program consultation, using the contact method you choose. Taking part is voluntary. This request does not commit you or your child to an interview.'],
  ['Storage and access', 'Lutheran Care will hold this request securely in its records, with access limited to authorised project team members who need it to arrange the interview. Our Privacy Policy explains how we manage and retain personal information.'],
  ['Keeping the forms separate', 'Your contact details will be kept separately from any answers to the Defence Family Support Survey. Your name, mobile number and email address will not be included in consultation reports to Defence.'],
  ['Sharing and your rights', 'We may disclose information with your consent or where the law permits or requires it, including to protect someone from serious harm. You can ask to update your details, cancel contact, access your information or raise a privacy concern.']
];
export const CONTACT_CONSENT = 'I agree to Lutheran Care contacting me as selected and using my details as described, including any sensitive information I choose to share.';
export const CONTACT_MINOR_CONSENT = 'I would like Lutheran Care to contact me as selected. I understand how the details I provide will be used to arrange an interview. I can decide about taking part later.';
export const CONTACT_GUARDIAN_DECLARATION = 'I have parental responsibility or legal authority to make this request for this child.';
export function emptyRequest(){return {requester:'',age_band:'',preferred_name:'',phone:'',email:'',contact_method:'',voicemail:false,contact_notes:'',topic:'',suggested_time:'',interview_mode:'',guardian_authority:false,consent:false};}
const isRecord = value => value!==null&&typeof value==='object'&&!Array.isArray(value);
const record = value => isRecord(value)?value:{};
const isChoice = (choices,value) => typeof value==='string'&&Object.hasOwn(choices,value);
const text = value => typeof value==='string'?value.trim():'';
const supplied = value => typeof value==='string'?Boolean(value.trim()):value!==undefined&&value!==null;
export function contactRoute(value){
  const data=record(value);
  if(data.requester==='self'&&isChoice(CONTACT_AGES,data.age_band))return `self_${data.age_band}`;
  if(data.requester==='guardian'&&data.age_band==='minor')return 'guardian_minor';
  return '';
}
export function needsTopic(data){return Boolean(contactRoute(data));}
export function needsArrangements(data){return needsTopic(data);}
export function consentText(data){return contactRoute(data)==='self_minor'?CONTACT_MINOR_CONSENT:CONTACT_CONSENT;}
// Format checks cannot prove ownership or reachability. Confirm by a reply using
// the selected safe contact method; do not substitute an unapproved phone call.
export function phoneIsValid(value){
  if(typeof value!=='string')return false;
  const raw=value.trim();
  if(!/^\+?[0-9() .-]+$/.test(raw))return false;
  const compact=raw.replace(/[() .-]/g,'');
  if(!compact.startsWith('+'))return /^04\d{8}$/.test(compact);
  if(compact.startsWith('+61'))return /^\+61(?:0)?4\d{8}$/.test(compact);
  return /^\+[1-9]\d{7,14}$/.test(compact);
}
export function emailIsValid(value){
  if(typeof value!=='string')return false;
  const email=value.trim();
  if(email.length>CONTACT_LIMITS.email||!email||/\s/.test(email))return false;
  const parts=email.split('@');
  if(parts.length!==2)return false;
  const [local,domain]=parts;
  if(!local||local.length>64||local.startsWith('.')||local.endsWith('.')||local.includes('..'))return false;
  if(!/^[A-Za-z0-9.!#$%&'*+\-/=?^_`{|}~]+$/.test(local))return false;
  const labels=domain.split('.');
  return labels.length>=2&&labels.every(label=>label.length<=63&&/^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/.test(label))&&/[A-Za-z]/.test(labels.at(-1));
}
export function changeRequest(value,key,newValue){
  const current=record(value);
  if(!Object.hasOwn(emptyRequest(),key))return {...current};
  const fieldValue=['voicemail','guardian_authority','consent'].includes(key)?newValue===true:typeof newValue==='string'?newValue:'';
  if(key==='requester'&&fieldValue!==current.requester)return {...emptyRequest(),requester:fieldValue,age_band:fieldValue==='guardian'?'minor':''};
  if(key==='age_band'&&fieldValue!==current.age_band)return {...emptyRequest(),requester:current.requester,age_band:fieldValue};
  const next={...current,[key]:fieldValue};
  if(fieldValue!==current[key]){
    if(['preferred_name','phone','email','contact_method'].includes(key))next.consent=false;
    if(['contact_method','phone'].includes(key))next.voicemail=false;
    if(key==='email'&&current.contact_method==='email'){next.contact_method='';next.voicemail=false;}
  }
  return next;
}
function activeTextFields(data){
  return ['preferred_name','phone','email','contact_notes',...(needsTopic(data)?['topic']:[]),...(needsArrangements(data)?['suggested_time']:[])];
}
export function requestErrors(value){
  const data=record(value),errors={},route=contactRoute(data);
  if(!isChoice(CONTACT_REQUESTERS,data.requester))errors.requester='Choose who this request is for.';
  if(['self','guardian'].includes(data.requester)&&!route)errors.age_band='Choose an age group before continuing.';
  if(!text(data.preferred_name))errors.preferred_name='Enter the name you would like us to use.';
  if(!phoneIsValid(data.phone))errors.phone='Enter a mobile number where we can reach you: 04… or +61 4… in Australia, or include the country code for an overseas mobile.';
  if(supplied(data.email)&&!emailIsValid(data.email))errors.email='Enter a valid email address, or leave this optional field blank.';
  if(!isChoice(CONTACT_METHODS,data.contact_method))errors.contact_method='Choose how we should arrange a time with you.';
  else if(data.contact_method==='email'&&!emailIsValid(data.email))errors.contact_method='Enter a valid email address if you would like us to email you.';
  for(const key of activeTextFields(data)){
    if(supplied(data[key])&&typeof data[key]!=='string')errors[key]='Enter text in this field.';
    else if(typeof data[key]==='string'&&data[key].length>CONTACT_LIMITS[key])errors[key]=`Use no more than ${CONTACT_LIMITS[key]} characters.`;
  }
  if(needsArrangements(data)&&supplied(data.interview_mode)&&!isChoice(CONTACT_INTERVIEW_MODES,data.interview_mode))errors.interview_mode='Choose an interview preference from the options, or leave it blank.';
  if(data.requester==='guardian'&&data.guardian_authority!==true)errors.guardian_authority='Please confirm your authority to make this request for the child.';
  if(data.consent!==true)errors.consent='Please give your agreement before continuing.';
  return errors;
}
export function reviewRequest(data){
  if(Object.keys(requestErrors(data)).length)throw new Error('Contact details are incomplete');
  const result={requester:data.requester,age_band:data.age_band,preferred_name:text(data.preferred_name),phone:text(data.phone),email:text(data.email),contact_method:data.contact_method,voicemail:data.contact_method==='call'&&data.voicemail===true,contact_notes:text(data.contact_notes),consent:true,notice_version:CONTACT_NOTICE_VERSION};
  if(needsTopic(data))result.topic=text(data.topic);
  if(needsArrangements(data)){
    result.interview_mode=text(data.interview_mode);
    result.suggested_time=text(data.suggested_time);
  }
  if(data.requester==='guardian')result.guardian_authority=true;
  return result;
}
export function escapeHTML(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
// The same public resource is available without providing contact details.
export function contactResource(config={}){
  let url='';
  if(config.url==='support.html')url='support.html';
  else try {const parsed=new URL(String(config.url||''));if(parsed.protocol==='https:'&&!parsed.username&&!parsed.password)url=parsed.href;} catch {}
  return {title:String(config.title||'A free resource for Defence families'),url};
}
