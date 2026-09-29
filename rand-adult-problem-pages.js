// RAND Appendix A Page 5 and Q12–Q22. Original option text is kept in
// copy/rand-appendix-q12-q20.json; only documented local substitutions apply.
(function(root){
  'use strict';
  const list=value=>Array.isArray(value)?value:[];
  const filled=value=>typeof value==='string'&&value.trim().length>0;
  const labels={Q12:'Military practices and culture',Q13:'Work/life balance',Q14:'Household management',Q15:'Financial or legal problems',Q16:'Health care system problems',Q17:'Relationship problems',Q18:'Child well-being',Q19:'Your own well-being',Q20:'Your spouse’s or partner’s well-being',Q21:'Other problems'};

  function reported(answers,data){
    const items=data.categories.filter(category=>list(answers[category.id]).some(id=>id!==category.none_id));
    if(filled(answers.Q21))items.push({id:'Q21',title:'Other Problems',options:[]});
    return items;
  }
  function build(answers,data,{partnerStatus=()=>null,youngDependantStatus=()=>null,independentChildStatus=()=>null,dependantStatus=()=>null,selfMember=()=>false}={}){
    const categories=data.categories;
    const partner=partnerStatus(answers),youngDependant=youngDependantStatus(answers),independentChild=independentChildStatus(answers),dependant=dependantStatus(answers);
    const intro=`Life inevitably creates changes for service members and their families that can sometimes take the form of problems. Based on focus groups and prior surveys conducted with service members and spouses of service members, RAND developed a list of general categories of problems that may come up:\n\n${categories.map(category=>category.title).join('\n')}\n\nWe’d like to ask you to check off the kinds of problems you experienced. Then we will ask about what you needed to deal with these problems, the ways you tried to solve the problems, and your satisfaction with the kinds of assistance available to you.\n\nFor this survey, think about the past year and problems connected with your or your family’s life in Greater Darwin. Family members may live elsewhere. Include problems that have been resolved as well as those that are continuing. They do not have to have been caused by military service. You can skip any question.`;
    const pages=[{id:'problems-intro',group:'Problems',title:'Problems',intro,questions:[]}];
    for(const category of categories){
      if(category.id==='Q20'&&partner===false)continue;
      if(category.id==='Q18'&&youngDependant===false&&independentChild===false)continue;
      let options=category.options;
      if(category.id==='Q13'&&partner===false)options=options.filter(option=>!['Q13_3','Q13_6'].includes(option.id));
      if(category.id==='Q16'&&dependant===false)options=options.filter(option=>option.id!=='Q16_4');
      if(category.id==='Q15'&&selfMember(answers)&&(partner===false||list(answers.Q6).some(id=>['permanent','continuous_full_time_reserve'].includes(id))))options=options.filter(option=>option.id!=='Q15_8');
      pages.push({id:`problems:${category.id}`,group:'Problems',title:category.title,questions:[{
        id:category.id,source_id:category.id.slice(1),kind:'multi',label:category.id==='Q13'&&partner!==false?category.stem_partnered:category.stem,
        options,exclusive_ids:[category.none_id]
      }]});
    }
    pages.push({id:'other-problems',group:'Problems',title:'Other Problems',questions:[{id:'Q21',source_id:'21',kind:'text',label:'Please briefly describe any other type of problem you experienced in the past year. You’ll have a chance at the end of the survey to provide more detail about these issues, if you wish.'}]});
    const selected=reported(answers,data);
    if(selected.length>2){
      const options=selected.map(category=>{
        const chosen=category.id==='Q21'?[String(answers.Q21).trim()]:category.options.filter(option=>list(answers[category.id]).includes(option.id)&&option.id!==category.none_id).map(option=>option.label+(option.write_in&&filled(answers[`${category.id}:other:${option.id}`])?`: ${answers[`${category.id}:other:${option.id}`].trim()}`:''));
        return {id:category.id,label:labels[category.id],hint:chosen.join('; ')};
      });
      pages.push({id:'top-two-problems',group:'Problems',title:'Top Two Problems',intro:'If you’re having trouble deciding on only two, please pick the two that you would like to address in the survey right now. There will be a place for additional comments at the end of the survey where you can describe other problems.',questions:[{id:'Q22',source_id:'22',kind:'multi',label:'The following is a list of the types of problems you indicated you faced in the past year. Please pick which TWO you think were the most significant types of problems you’ve dealt with:',options,max_selected:2}]});
    }
    return pages;
  }
  root.SURVEY_RAND_PROBLEMS=Object.freeze({build,reported,labels});
})(typeof window==='undefined'?globalThis:window);
