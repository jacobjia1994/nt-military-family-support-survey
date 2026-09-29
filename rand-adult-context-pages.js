// RAND Appendix A Pages 3–4, Q1–Q11. Question content comes from the
// source-to-local draft in copy/rand-appendix-part1.json.
(function(root){
  'use strict';
  const memberChoices=new Set(['unmarried_member','married_member']);
  const directPartnerChoices=new Set(['married_member','civilian_spouse','civilian_partner']);
  const spouseChoices=new Set(['married_member','civilian_spouse']);
  const civilianPartnerChoices=new Set(['civilian_spouse','civilian_partner','former_bereaved_partner']);
  const familyChoices=new Set(['adult_child','parent','other_family']);
  const kindMap={single_select:'single',multi_select:'multi',multiline_text:'text',count_matrix:'matrix_number',dynamic_multi_select:'multi'};
  const list=value=>Array.isArray(value)?value:[];

  function selfMember(answers){return memberChoices.has(answers.Q3);}
  function married(answers){return spouseChoices.has(answers.Q3)||answers['L-PARTNER']==='married';}
  function partnerStatus(answers){
    if(directPartnerChoices.has(answers.Q3)||['married','partnered_unmarried'].includes(answers['L-PARTNER']))return true;
    if(answers['L-PARTNER']==='no')return false;
    return null;
  }
  function partnered(answers){return partnerStatus(answers)===true;}
  function dependantStatus(answers){
    if(answers['Q8:none']===true)return false;
    const rows=['under_2','age_2_5','age_6_13','age_14_22','age_23_64','age_65_plus'];
    if(rows.some(row=>Number(answers.Q8?.[row]?.number)>0))return true;
    if(rows.every(row=>answers.Q8?.[row]?.number!==undefined&&Number(answers.Q8[row].number)===0))return false;
    return null;
  }
  function youngDependantStatus(answers){
    if(answers['Q8:none']===true)return false;
    const rows=['under_2','age_2_5','age_6_13','age_14_22'];
    if(rows.some(row=>Number(answers.Q8?.[row]?.number)>0))return true;
    if(rows.every(row=>answers.Q8?.[row]?.number!==undefined&&Number(answers.Q8[row].number)===0))return false;
    return null;
  }
  function independentChildStatus(answers){return answers['L-CHILD']==='yes'?true:answers['L-CHILD']==='no'?false:null;}
  function hasYoungChild(answers){
    return youngDependantStatus(answers)===true||independentChildStatus(answers)===true;
  }
  function referent(answers){
    if(selfMember(answers))return 'self';
    if(civilianPartnerChoices.has(answers.Q3))return 'spouse_partner';
    if(familyChoices.has(answers.Q3))return 'family_member';
    return 'unspecified';
  }
  function selectLabel(question,answers){
    const r=referent(answers);
    if(question.id==='Q4'||question.id==='Q11')return question.label_variants?.[r]||question.label;
    if(question.id==='Q5')return question.label_variants?.[selfMember(answers)?'self':'other']||question.label;
    if(question.id==='Q10')return question.label_variants?.[r==='spouse_partner'?'spouse_partner':r==='family_member'?'family_member':'other_service_member']||question.label;
    return question.label;
  }
  function normalise(question,answers){
    const out={id:question.id,source_id:question.id.startsWith('Q')?question.id.slice(1):'',kind:kindMap[question.kind]||question.kind,label:selectLabel(question,answers),hint:question.help_text||'',options:(question.options||[]).map(option=>({id:option.id,label:option.label,write_in:option.write_in||false}))};
    if(out.kind==='matrix_number'){out.rows=question.rows||[];out.columns=question.columns||[];out.none_option=out.options.find(option=>option.id==='no_dependants');}
    if(question.id==='Q5')out.exclusive_ids=['former','deceased','unsure'];
    if(question.id==='Q6')out.exclusive_ids=['never_served','unsure'];
    return out;
  }
  function build(answers,data){
    const byId=Object.fromEntries(data.questions.map(question=>[question.id,question]));
    const get=id=>normalise(byId[id],answers);
    const page3={id:'study-information',group:'Study Information',title:'Study Information',questions:[get('Q1'),get('Q2')]};
    const q4=[get('Q3')];
    if(!directPartnerChoices.has(answers.Q3))q4.push(get('L-PARTNER'));
    q4.push(get('Q4'),get('Q5'));
    if(selfMember(answers)&&partnered(answers))q4.push(get('Q6'));
    if(married(answers))q4.push(get('Q7'));
    q4.push(get('Q8'),get('L-CHILD'));
    if(selfMember(answers))q4.push(get('Q9'));
    if(!selfMember(answers)||list(answers.Q6).some(id=>['permanent','reserves','continuous_full_time_reserve'].includes(id)))q4.push(get('Q10'));
    q4.push(get('Q11'),get('L-GD'));
    return [page3,{id:'key-demographics',group:'Key Demographics',title:'Key Demographics',questions:q4}];
  }
  root.SURVEY_RAND_CONTEXT=Object.freeze({build,normalise,selfMember,married,partnered,partnerStatus,dependantStatus,youngDependantStatus,independentChildStatus,hasYoungChild,referent});
})(typeof window==='undefined'?globalThis:window);
