import {questionsFor, preferencesFor} from './support-paths.mjs?v=20260930-1';

const ntRegions = new Set(['darwin','katherine','alice','tennant','arnhem','topend','central','npy','unsure']);
const contextRegions = new Set([...ntRegions]);
const owns = (object, key) => Object.prototype.hasOwnProperty.call(object,key);
const accepts = (question, value) => question.options.some(option => option.value === value);
const sameValues = (left, right) => left.length === right.length && left.every((value,index) => value === right[index]);

// The caller retains the last explicit local region. A jurisdiction answer of
// "nt" can then become that same town again when a later need requires it.
export function getFlowState(topic, answers={}, savedRegion='') {
 const current = answers && typeof answers === 'object' && !Array.isArray(answers) ? {...answers} : {};
 if(!contextRegions.has(current.region)){
  delete current.region;
  if(contextRegions.has(savedRegion))current.region=savedRegion;
 }

 let changed;
 do {
  changed=false;
  const questions=questionsFor(topic,current);
  const regionQuestion=questions.find(question=>question.id==='region');
  if(regionQuestion&&ntRegions.has(current.region)&&accepts(regionQuestion,'nt')){
   current.region='nt';
   changed=true;
  }else if(regionQuestion&&current.region==='nt'&&!accepts(regionQuestion,'nt')){
   if(ntRegions.has(savedRegion)&&accepts(regionQuestion,savedRegion))current.region=savedRegion;
   else delete current.region;
   changed=true;
  }

  const allowed=new Set(questions.map(question=>question.id));
  for(const question of questions){
   if(owns(current,question.id)&&!accepts(question,current[question.id])){
    delete current[question.id];
    changed=true;
   }
  }
  for(const key of Object.keys(current)){
   if(key!=='region'&&key!=='preferences'&&!allowed.has(key)){
    delete current[key];
    changed=true;
   }
  }

  if(Array.isArray(current.preferences)){
   const valid=new Set(preferencesFor(topic,current).map(preference=>preference.value));
   const preferences=[...new Set(current.preferences.filter(value=>valid.has(value)))];
   if(!sameValues(preferences,current.preferences))changed=true;
   current.preferences=preferences;
  }else if(owns(current,'preferences')){
   delete current.preferences;
   changed=true;
  }
  // Removing an invalid answer can remove further conditional questions. Keep
  // normalising until those now-irrelevant qualifications have also disappeared.
 }while(changed);

 const questions=questionsFor(topic,current);
 const missing=questions.findIndex(question=>!accepts(question,current[question.id]));
 const complete=missing===-1;
 return {
  answers:current,
  questions,
  visibleQuestions:complete?questions:questions.slice(0,missing+1),
  complete,
  nextQuestion:complete?null:questions[missing]
 };
}

export function applyAnswer(topic, answers, questionId, value, savedRegion='') {
 const flow=getFlowState(topic,answers,savedRegion);
 const question=flow.visibleQuestions.find(item=>item.id===questionId);
 // Future conditional fields and values not offered by the current question
 // cannot enter the state through a stale control or a malformed deep link.
 if(!question||!accepts(question,value)||flow.answers[questionId]===value)return flow;

 const current={...flow.answers};
 const position=flow.questions.findIndex(item=>item.id===questionId);
 const resetFollowing=questionId==='need'||!owns(flow.answers,questionId);
 const changedPatient=topic==='care'&&questionId==='role';
 const localQualifications=new Set(['localCommunity','reliefCommunity','remoteArea','congressFit','wurliClient']);
 for(const key of Object.keys(current)){
  if(key===questionId||key==='region'||key==='preferences')continue;
  const keyPosition=flow.questions.findIndex(item=>item.id===key);
  if((resetFollowing&&(keyPosition>position||keyPosition===-1))||(changedPatient&&['dvaTravel','ntResidence','dependant'].includes(key))||(questionId==='region'&&localQualifications.has(key)))delete current[key];
 }
 // Normalisation removes qualifications whose question is no longer relevant.
 // Independent answers that still mean the same thing stay selected.
 current[questionId]=value;
 return getFlowState(topic,current,savedRegion);
}
