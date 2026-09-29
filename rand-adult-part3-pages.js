// RAND Appendix A Pages 8–9, Q37–Q67, with narrow Australian substitutions.
(function(root){
  'use strict';
  const list=value=>Array.isArray(value)?value:[];
  const triAnd=(...values)=>values.includes(false)?false:values.every(value=>value===true)?true:null;
  const kindMap={single_select:'single',multi_select:'multi',multiline_text:'text',count_matrix:'matrix_number'};

  function derive(answers,context){
    const role=answers.Q3;
    const knownRole=Boolean(role&&!['another_connection','none'].includes(role));
    const member=context.selfMember(answers)?true:knownRole?false:null;
    const spouse=['civilian_spouse','civilian_partner'].includes(role)?true:knownRole?false:null;
    const memberOrSpouse=member===true||spouse===true?true:member===false&&spouse===false?false:null;
    const partner=context.partnerStatus(answers);
    const statuses=list(answers.Q5);
    const focalCurrent=statuses.some(id=>['permanent','reserves','continuous_full_time_reserve'].includes(id))?true:statuses.some(id=>['former','deceased'].includes(id))?false:null;
    const focalDeceased=statuses.includes('deceased');
    const focalFormer=statuses.includes('former')&&!focalDeceased;
    const partnerStatus=list(answers.Q6);
    const partnerMilitary=partnerStatus.some(id=>['veteran','permanent','reserves','continuous_full_time_reserve'].includes(id))?true:partnerStatus.includes('never_served')||partner===false?false:null;
    const returnAnswer=member===true?answers.Q9:member===false?answers.Q10:null;
    const recentReturn=returnAnswer==='yes'?true:returnAnswer==='no'?false:null;
    const child=context.hasYoungChild(answers)?true:answers['Q8:none']===true||answers['L-CHILD']==='no'?false:null;
    const dependentYoung=['under_2','age_2_5','age_6_13','age_14_22'].some(row=>Number(answers.Q8?.[row]?.number)>0)?true:answers['Q8:none']===true?false:null;
    const employment=['civilian_spouse','civilian_partner','former_bereaved_partner'].includes(role)?true:knownRole?false:null;
    const housing=answers.Q57;
    const outsideHousing=['civilian_owned','civilian_rented'].includes(housing)?true:['defence_on_base','defence_off_base'].includes(housing)?false:null;
    return {roleKnown:knownRole,member,spouse,memberOrSpouse,partner,focalCurrent,focalDeceased,focalFormer,partnerMilitary,recentReturn,child,dependentYoung,employment,outsideHousing};
  }
  function eligible(id,answers,d){
    let condition;
    switch(id){
      case 'Q37':case 'Q38':case 'Q42':condition=d.roleKnown;break;
      case 'Q43':condition=d.member===true?triAnd(d.partner,d.partnerMilitary):false;break;
      case 'Q44':condition=d.roleKnown?d.recentReturn:false;break;
      case 'Q45':case 'Q46':case 'Q60':condition=d.memberOrSpouse===true?triAnd(d.partner,d.recentReturn):false;break;
      case 'Q52':condition=true;break;
      case 'Q53':condition=d.memberOrSpouse===true&&answers['Q8:none']!==true?d.recentReturn:false;break;
      case 'Q54':condition=answers.Q53==='yes';break;
      case 'Q55':case 'Q56':condition=d.employment===true;break;
      case 'Q58':condition=d.outsideHousing;break;
      case 'Q61':condition=answers.Q60==='yes';break;
      case 'Q62':case 'Q63':condition=d.spouse===true?d.focalCurrent:false;break;
      case 'Q64':condition=d.spouse===true?triAnd(d.focalCurrent,answers.Q63==='retiring_soon'?false:true):false;break;
      case 'Q65':condition=d.member===true?d.focalCurrent:false;break;
      case 'Q66':condition=d.member===true?triAnd(d.partner,d.focalCurrent,answers.Q65==='retiring_soon'?false:true):false;break;
      default:condition=true;
    }
    return condition!==false;
  }
  function labelFor(question,answers,d){
    const v=question.label_variants||{};
    if(question.id==='Q37'){
      if(d.member===true)return d.focalFormer?v.self_last_at_exit:v.self_current||question.label;
      if(d.focalDeceased)return v.family_last_before_death||question.label;
      if(d.focalFormer)return v.family_last_at_exit||question.label;
      return v.family_current||question.label;
    }
    if(question.id==='Q38')return d.focalDeceased?v.deceased||question.label:d.member===true?v.self||question.label:d.spouse===true?v.spouse_partner||question.label:v.other_family||question.label;
    if(question.id==='Q42')return d.member===true?v.self||question.label:d.spouse===true?v.spouse_partner||question.label:v.other_family||question.label;
    if(question.id==='Q44')return d.member===true?v.self||question.label:v.family||question.label;
    if(question.id==='Q45')return d.member===true?v.member||question.label:v.spouse||question.label;
    if(['Q46','Q54','Q60'].includes(question.id))return d.member===true?v.member||question.label:v.spouse||question.label;
    return question.label;
  }
  function normalise(question,answers,d){
    let options=(question.options||[]).map(option=>({id:option.id,label:option.label,write_in:option.write_in||false,exclusive_with_value:option.exclusive_with_value||false}));
    if(question.id==='Q37'){
      const menu=['army','navy','air_force'].includes(answers.Q4)?answers.Q4:'other_or_unknown';
      options=(question.options||[]).filter(option=>option.menu===menu).map(option=>({id:option.id,label:option.label,write_in:option.write_in||false}));
    }
    if(question.id==='Q46'&&d.member===false)options=options.filter(option=>option.id!=='dont_know');
    const kind=kindMap[question.kind]||question.kind;
    const out={id:question.id,source_id:question.id.slice(1),kind,label:labelFor(question,answers,d),hint:list(question.help_text).join(' '),options};
    if(kind==='matrix_single'){out.rows=question.rows||[];out.columns=options;}
    if(kind==='number')out.suffix=question.input?.suffix||'';
    if(kind==='multi'){
      out.exclusive_ids=question.response_limits?.exclusive_option_ids||options.filter(option=>option.exclusive).map(option=>option.id);
      out.max_selected=question.response_limits?.maximum_selections||undefined;
    }
    return out;
  }
  function build(answers,data,context){
    const d=derive(answers,context),byId=Object.fromEntries(data.questions.map(question=>[question.id,question]));
    return data.pages.map((source,index)=>{
      const questions=source.questions.map(id=>byId[id]).filter(question=>question&&eligible(question.id,answers,d)).map(question=>normalise(question,answers,d));
      const intro=list(source.intro).map(item=>typeof item==='string'?item:item.text||'').filter(Boolean).join('\n\n');
      return {id:source.id,group:index===0?'Background Information':'Attitudes Toward Military Service',title:source.title,intro,questions};
    });
  }
  root.SURVEY_RAND_PART3=Object.freeze({build,derive,eligible,normalise});
})(typeof window==='undefined'?globalThis:window);
