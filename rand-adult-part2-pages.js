// RAND Appendix A Q23–Q36: needs, contacts, resource characteristics and outcomes.
(function(root){
  'use strict';
  const list=value=>Array.isArray(value)?value:[];
  const filled=value=>typeof value==='string'&&value.trim().length>0;
  const interpolate=(template,values)=>String(template||'').replace(/\{([a-z_]+)\}/g,(_,name)=>String(values[name]??''));

  function reportedProblems(answers,problemData){
    const categories=problemData.categories.filter(category=>list(answers[category.id]).some(id=>id!==category.none_id));
    if(filled(answers.Q21))categories.push({id:'Q21',title:'Other Problems',options:[]});
    return categories;
  }
  function selectedProblems(answers,problemData){
    const reported=reportedProblems(answers,problemData);
    if(reported.length<=2)return reported;
    return list(answers.Q22).map(id=>reported.find(category=>category.id===id)).filter(Boolean).slice(0,2);
  }
  function problemItemLabels(category,answers){
    if(category.id==='Q21')return [String(answers.Q21||'').trim()].filter(Boolean);
    return category.options.filter(option=>list(answers[category.id]).includes(option.id)&&option.id!==category.none_id).map(option=>option.label);
  }
  function priorityNeeds(category,answers,part2){
    const selected=part2.help_options.filter(option=>option.id!=='H10'&&list(answers[`needs:${category.id}`]).includes(option.id));
    if(selected.length<=2)return selected;
    return list(answers[`priority-needs:${category.id}`]).map(id=>selected.find(option=>option.id===id)).filter(Boolean).slice(0,2);
  }
  function chosenPairs(answers,problemData,part2){
    return selectedProblems(answers,problemData).flatMap(category=>priorityNeeds(category,answers,part2).map(need=>({category,need,key:`${category.id}:${need.id}`}))).slice(0,4);
  }
  function contactSets(pairs,answers,part2){
    const byPair=pairs.map(pair=>list(answers[`contacts:${pair.key}`]));
    const allAnswered=byPair.every(values=>values.length>0);
    const contacted=new Set(byPair.flat().filter(id=>id!=='NO_CONTACT'));
    const resources=part2.resource_options.filter(option=>option.id!=='NO_CONTACT');
    return {
      allAnswered,
      militaryUsed:resources.filter(option=>option.group==='military'&&contacted.has(option.id)),
      nonmilitaryUsed:resources.filter(option=>option.group==='nonmilitary'&&contacted.has(option.id)&&option.id!=='N06'),
      militaryNotUsed:allAnswered?resources.filter(option=>option.group==='military'&&option.id!=='M09'&&!contacted.has(option.id)):[],
      nonmilitaryNotUsed:allAnswered?resources.filter(option=>option.group==='nonmilitary'&&!['N06','N07'].includes(option.id)&&!contacted.has(option.id)):[],
      personalNetworks:contacted.has('N06')
    };
  }

  function build(answers,problemData,part2){
    const selected=selectedProblems(answers,problemData);
    if(!selected.length)return [];
    const pages=[];
    const stems=part2.question_stems;
    const helpOptions=part2.help_options.map(option=>({...option,write_in:option.id==='H09'}));
    for(const [index,category] of selected.entries()){
      const items=problemItemLabels(category,answers).join('; ');
      pages.push({id:`needs:${category.id}`,group:'Problems linked to needs',title:`Problems linked to needs (#${index+1})`,intro:`${stems.Q23_Q24.intro}\n\n${category.title}\n${items}`,questions:[{id:`needs:${category.id}`,source_id:index===0?'23':'24',kind:'multi',label:stems.Q23_Q24.question,hint:stems.Q23_Q24.instruction,options:helpOptions,exclusive_ids:['H10']} ]});
    }
    const prioritised=selected.filter(category=>list(answers[`needs:${category.id}`]).filter(id=>id!=='H10').length>2);
    if(prioritised.length){
      const introKey=selected.length===1?'only_category':prioritised.length>1?'both_categories':'one_of_two_categories';
      pages.push({id:'priority-needs',group:'Problems linked to needs',title:'Needs',intro:`${stems.Q25.intro_variants[introKey]}\n\n${stems.Q25.instruction}`,questions:prioritised.map(category=>({id:`priority-needs:${category.id}`,source_id:'25',kind:'multi',label:interpolate(stems.Q25.category_heading,{problem_label:category.title}),options:part2.help_options.filter(option=>option.id!=='H10'&&list(answers[`needs:${category.id}`]).includes(option.id)).map(option=>({id:option.id,label:stems.Q25.option_labels[option.id]||option.label})),max_selected:2}))});
    }
    const pairs=chosenPairs(answers,problemData,part2);
    if(!pairs.length)return pages;
    const resources=part2.resource_options;
    for(const [index,pair] of pairs.entries()){
      const contactKey=`contacts:${pair.key}`;
      pages.push({id:contactKey,group:'Ways of meeting needs',title:'Ways of Meeting Needs',intro:`${interpolate(stems.Q26_Q29.intro,{problem_label:pair.category.title})}\n${pair.need.label}\n\n${stems.Q26_Q29.instruction}`,questions:[{id:contactKey,source_id:String(26+index),kind:'multi',label:stems.Q26_Q29.question,hint:stems.Q26_Q29.internet_hint,options:resources,exclusive_ids:['NO_CONTACT'],group_headings:stems.Q26_Q29.group_headings}]});
    }
    const sets=contactSets(pairs,answers,part2);
    const matrices=[
      ['Q30','Characteristics Related to Non-Use of Military Resources',sets.militaryNotUsed],
      ['Q31','Characteristics Related to Use of Military Resources',sets.militaryUsed],
      ['Q32','Characteristics Related to Non-Use of Nonmilitary Resources',sets.nonmilitaryNotUsed],
      ['Q33','Characteristics Related to Use of Nonmilitary Resources',sets.nonmilitaryUsed]
    ];
    for(const [id,title,rows] of matrices){
      if(!rows.length)continue;
      pages.push({id,group:'Ways of meeting needs',title,intro:stems[id].intro,questions:[{id,source_id:id.slice(1),kind:'matrix_check',label:stems[id].instruction,rows,columns:part2.characteristic_options}]});
    }
    if(sets.personalNetworks)pages.push({id:'Q34',group:'Ways of meeting needs',title:'Characteristics Related to Use of Personal Networks',intro:stems.Q34.intro,questions:[{id:'Q34',source_id:'34',kind:'multi',label:stems.Q34.instruction,options:part2.personal_network_statements}]});
    for(const pair of pairs){
      const contacts=list(answers[`contacts:${pair.key}`]);
      const rows=resources.filter(option=>contacts.includes(option.id)&&option.id!=='NO_CONTACT');
      if(!rows.length)continue;
      const id=`helpfulness:${pair.key}`;
      pages.push({id,group:'Satisfaction with Ways for Meeting Needs',title:'Satisfaction with Ways for Meeting Needs',intro:`${stems.Q35.review_intro}\n${pair.category.title} — ${pair.need.label}\n\n${stems.Q35.question}\n${pair.category.title} — ${pair.need.label}`,questions:[{id,source_id:'35',kind:'matrix_single',label:stems.Q35.question,rows,columns:part2.helpfulness_scale},{id:`comments:${id}`,kind:'text',label:stems.Q35.comments_label}]});
    }
    const lossRows=part2.loss_resource_rows.filter(row=>row.resource_id).map(row=>({id:row.resource_id,label:row.label}));
    pages.push({id:'Q36',group:'Satisfaction with Ways for Meeting Needs',title:'Impact of Losing Resources',questions:[{id:'Q36',source_id:'36',kind:'matrix_single',label:stems.Q36.question,rows:lossRows,columns:part2.loss_impact_scale},{id:'Q36:comments',kind:'text',label:'Comments:'}]});
    return pages;
  }

  root.SURVEY_RAND_PART2=Object.freeze({build,reportedProblems,selectedProblems,chosenPairs,contactSets});
})(typeof window==='undefined'?globalThis:window);
