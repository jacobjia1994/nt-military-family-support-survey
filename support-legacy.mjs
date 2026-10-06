// Preserve old need links as intent only. Personal qualifications are never imported.
export function resolveLegacyIntent(site, journeys, value) {
 const parts=String(value).replace(/^#/, '').split('/');
 const byTask=id=>journeys.some(t=>t.id===id)?{id,index:null}:null;
 const matches=(topic,need)=>{
  const found=journeys.flatMap(t=>t.choices.map((choice,index)=>({id:t.id,index,choice}))).filter(x=>x.choice.topicId===topic&&(!need||x.choice.need===need));
  if(!found.length)return null;
  const ids=[...new Set(found.map(x=>x.id))];
  if(ids.length===1)return {id:ids[0],index:found.length===1?found[0].index:null};
  return {title:({care:'Health and care',mental:'Mental health and wellbeing',family:'Youth and family support',access:'Access and practical support',parenting:'Children and caring',money:'Housing and money',connection:'Defence and community support'}[topic]||'Choose the help you need'),tasks:ids};
 };
 if(site==='homelessness'){
  const aliases={stay:'safe-tonight',housing:'longer-term-housing','keep-home':'keep-tenancy',essentials:'food-essentials',money:'money-benefits',identity:'identity-digital',safety:'violence-safety',health:'health-wellbeing',aod:'alcohol-drugs',family:'children-youth-family',transition:'legal-transition',access:'access-culture-disability'};
  const needs={'safe-tonight':'tonight','longer-term-housing':'stable-home','keep-tenancy':'keep-home','food-essentials':'food-washing','money-benefits':'money-bills','identity-digital':'id-online','violence-safety':'violence','health-wellbeing':'mental-health','health-medical-travel':'medical','alcohol-drugs':'alcohol-drugs','children-youth-family':'family-school','legal-transition':'leaving-service','legal-help':'legal','access-culture-disability':'communication','disability-ageing':'disability','return-home':'return-home'};
  const need=aliases[parts[1]||parts[0]]||parts[1]||parts[0];
  if(parts.length>1){const precise=matches(parts[0],need);if(precise)return precise;}
  const related=journeys.flatMap(t=>t.choices.map(c=>({t,c}))).filter(x=>x.c.need===need);
  if(related.length)return matches(related[0].c.topicId,need);
  return byTask(needs[need]);
 }
 const numbered={1:['connection','settle'],2:['connection','apart'],3:['parenting','emergency-care'],4:['work','reserve'],5:['work','partner'],6:['money','bills'],7:['money','housing'],8:['money','defence-housing'],9:['parenting','childcare'],10:['parenting','childcare'],11:['care','baby'],12:['parenting','parenting'],13:['parenting','school'],14:['parenting','learning'],15:['mental','feelings'],16:['care','carer'],17:['relationships','counselling'],18:['relationships','separation'],19:['relationships','unsafe'],20:['mental','feelings'],21:['mental','feelings'],22:['mental','feelings'],23:['care','health'],24:['care','travel'],25:['care','disability'],26:['care','carer'],27:['care','older'],28:['connection','local'],29:['connection','local'],30:['help'],31:['mental','lgbtq'],32:['help'],33:['mental','private'],34:['help'],35:['help'],36:['help'],37:['work','transition'],38:['mental','practical-loss'],39:['mental','suicide-loss']};
 const aliases={talk:'mental-health',children:'children-education',moving:'posting',connect:'groups',safety:'safety'};
 if(parts[0]==='situation')return byTask({moving:'posting',settle:'posting',apart:'absence',leaving:'transition',concern:'home'}[parts[1]])||(parts[1]==='concern'?{home:true}:null);
 if(parts[0]==='need'){
  const target=numbered[Number(parts[1])];if(!target)return null;
  if(target[0]==='help')return {id:'help',index:0};
  if(target[0]==='money'&&target[1]==='housing')return {menu:'housing'};
  return matches(...target);
 }
 if(aliases[parts[0]])return byTask(aliases[parts[0]]);
 if(parts[0]==='money'&&parts[1]==='housing')return {menu:'housing'};
 return matches(parts[0],parts[1]);
}
