// Task-first matching. Choices live only in page memory; no personal profile is stored.
export const tasks = [
  {id:'talk', title:'Talk to someone', hint:'Stress, relationships or grief', focuses:[['feelings','Stress, mood or feeling overwhelmed'],['relationship','Relationship difficulties'],['grief','Grief after a death'],['bereavement-help','Practical help after a death'],['suicide-loss','After a death by suicide']]},
  {id:'children', title:'Help for a child or young person', hint:'Parenting, school or wellbeing', focuses:[['wellbeing','Their feelings or behaviour'],['parenting','Support for me as a parent or carer'],['school','Starting or changing school'],['childcare','Finding childcare']]},
  {id:'moving', title:'Manage a move or time apart', hint:'A posting, absence or coming home', focuses:[['settle','Settling in after a move'],['apart','Coping while someone is away'],['reunion','Adjusting when someone comes home']]},
  {id:'work', title:'Work or life after Defence', hint:'Jobs, transition or DVA support', focuses:[['job','Finding work or changing career'],['reserve','Balancing Reserve service and civilian work'],['transition','Planning to leave Defence'],['claims','DVA claims or benefits']]},
  {id:'money', title:'Money or somewhere to live', hint:'Bills, food, rent or housing', focuses:[['bills','Debt, bills or money worries'],['essentials','Food or other essentials'],['housing','Worried about losing housing'],['tonight','Nowhere safe to stay tonight'],['tenancy','A rental or tenancy problem']]},
  {id:'care', title:'Health, disability or caring', hint:'Medical advice or practical support', focuses:[['health','Health advice or finding care'],['carer','Support for an unpaid carer'],['older','Care as someone gets older'],['disability','Access to disability services']]},
  {id:'connect', title:'Meet people and feel connected', hint:'Local groups and online activities', focuses:[]},
  {id:'safety', title:'Safety or separation', hint:'Violence, sexual assault or legal help', focuses:[['unsafe','Feeling unsafe or experiencing violence'],['assault','After sexual assault'],['separation','Separation or parenting arrangements'],['legal','Another legal question']]}
];
export const regions = [['darwin','Darwin'],['palmerston','Palmerston / rural Top End'],['katherine','Katherine / Tindal'],['alice','Alice Springs'],['tennant','Tennant Creek / Barkly'],['remote','Elsewhere in the NT'],['outside','Outside the NT / moving to the NT']];
export const ages = [['0-4','Under 5'],['5-11','5–11'],['12-17','12–17'],['18-25','18–25'],['26+','26 or older']];
export const connections = [['serving','Serving ADF member or family (including Reserves)'],['former','Former ADF member or family'],['bereaved','Bereaved Defence or veteran family'],['unsure','Another connection / not sure']];
export const counsellingConnections = [['member','They have had full-time ADF service'],['partner','Their current partner has had full-time ADF service'],['child','Their parent has had full-time ADF service'],['other','Another relationship, Reserve-only service, or not sure']];
export function fieldsFor(task, focus, age) {
  return {
    age:(task==='talk' && !['suicide-loss','bereavement-help'].includes(focus)) || (task==='children' && focus==='wellbeing'),
    connection:['moving','work','connect','help'].includes(task) || (task==='children' && ['school','childcare'].includes(focus)) || (task==='money' && ['housing','tonight'].includes(focus)),
    counselling: task==='talk' && !['suicide-loss','bereavement-help'].includes(focus) && age!=='0-4'
  };
}
export function matchSupport(c) {
  const {task, focus, region, age, connection, counselling} = c;
  const inNT = region !== 'outside';
  const young = ['5-11','12-17','18-25'].includes(age);
  const teen = ['12-17','18-25'].includes(age);
  const adult = ['18-25','26+'].includes(age);
  const serving = connection === 'serving';
  const oa = ['member','partner','child'].includes(counselling);
  const localYouth = {darwin:'headspace-darwin',palmerston:'headspace-palmerston',katherine:'headspace-katherine',alice:'headspace-alice'}[region];
  const localMental = {darwin:'darwin-mmhc',palmerston:'darwin-mmhc',katherine:'katherine-mmhc'}[region];
  const parent = inNT ? 'parentline' : 'family-advice';
  const dmfs = region==='katherine' ? 'dmfs-tindal' : ['darwin','palmerston','alice'].includes(region) ? 'dmfs-darwin' : 'dmfs-helpline';
  const nav = serving ? 'dmfs-helpline' : 'wellbeing-agency';
  let ids=[], note='', say='', title='A place to start';
  if (task==='talk') {
    if(focus==='bereavement-help') { ids=['wellbeing-agency']; say='Someone in our Defence or veteran family has died. I need help with practical next steps, family entitlements and local support.'; }
    else if(focus==='suicide-loss') { ids=['standby']; say='Someone has died by suicide. I would like support for myself or my family.'; }
    else if(age==='0-4') { ids=[parent,'healthdirect']; say='I am worried about a young child and would like help working out what they need.'; }
    else if(focus==='grief' && adult) { ids=oa ? ['open-arms','griefline'] : ['griefline','beyondblue']; say='I am grieving and would like to talk about the support available.'; }
    else if(young) { ids=teen ? [localYouth || 'eheadspace','kids-helpline'] : ['kids-helpline',parent]; if(oa && teen) ids=[...ids.slice(0,1),'open-arms','kids-helpline']; say='I would like support with how I am feeling.'; }
    else if(focus==='relationship') { ids=oa ? ['open-arms','family-advice'] : ['family-advice','beyondblue']; say='I would like help with a relationship difficulty and to understand my options.'; }
    else { ids=oa ? ['open-arms',localMental || 'beyondblue'] : [localMental || (inNT ? 'teamtalk' : 'beyondblue'),'beyondblue']; say='I would like to speak with someone about how I am feeling.'; }
    if(counselling==='other' && adult && !['suicide-loss','bereavement-help'].includes(focus)) note='These options do not depend on ADF service history. Open Arms also has specific pathways for some reservists, former partners and bereaved relatives; its eligibility team can check those circumstances.';
  } else if(task==='children') {
    if(focus==='wellbeing') {
      ids=age==='0-4' ? [parent,'healthdirect'] : teen ? [localYouth || 'eheadspace','kids-helpline',parent] : age==='26+' ? [localMental || 'beyondblue'] : ['kids-helpline',parent];
      say=age==='0-4' ? 'I am worried about my child’s feelings or behaviour. What support could help?' : 'I would like support for a young person’s feelings or behaviour.';
      note='';
    } else if(focus==='parenting') { ids=[parent,inNT?'territory-faces':'healthdirect']; say='I would like help with parenting and what is happening at home.'; }
    else if(focus==='school') { ids=serving ? ['school-change', ...(inNT?['nt-school']:[])] : inNT ? ['nt-school','family-advice'] : ['wellbeing-agency']; say='We are moving or changing schools. Can you help us plan the next steps?'; }
    else { ids=serving ? ['childcare-connect','startingblocks'] : ['startingblocks']; say='I am looking for childcare that fits our location and hours.'; note='The search and guidance are free. Childcare itself has fees; a place or subsidy is not guaranteed.'; }
  } else if(task==='moving') {
    ids=serving ? [dmfs, 'dmfs-helpline'] : ['wellbeing-agency','soldieron-connect'];
    say=focus==='apart' ? 'Our family is managing a service absence. I would like practical and local support.' : focus==='reunion' ? 'We are adjusting after time apart. What family support is available?' : 'We are moving to the NT or have recently arrived. Can you help us find local family support?';
    if(!serving) note='This route can help you find support after service or when you are unsure which Defence programs still apply.';
  } else if(task==='work') {
    ids=focus==='reserve' ? ['reserve-support'] : focus==='claims' ? ['dva'] : focus==='transition' && serving ? [inNT?'transition':'transition-national','dmfs-helpline'] : focus==='transition' ? ['wellbeing-agency','soldieron-work'] : ['soldieron-work','wellbeing-agency'];
    say=focus==='reserve' ? 'I need help balancing Reserve service with my civilian job. What support or guidance applies?' : focus==='claims' ? 'I would like help understanding a DVA claim or benefit and how to apply.' : focus==='transition' ? 'I would like help planning work, health and family support after Defence.' : 'I would like help finding work or changing careers. What support can I access?';
  } else if(task==='money') {
    if(focus==='tonight') { ids=serving ? ['dmfs-helpline',...(inNT?['shelterme']:[])] : inNT ? ['shelterme','housing-intake'] : ['askizzy-housing','wellbeing-agency']; say='We have nowhere safe to stay tonight. What crisis accommodation or support can we contact now?'; note='Ask each provider whether it can help tonight and whether fees apply. This page cannot confirm a bed. If home is unsafe because of violence, 1800RESPECT is available 24/7 on 1800 737 732.'; }
    else if(focus==='bills') { ids=['ndh']; say='I am having trouble with bills or debt and would like to speak with a financial counsellor.'; }
    else if(focus==='tenancy') { ids=inNT?['tenancy-nt','legal-aid']:['legal-national']; say='I need advice about a rental or tenancy problem.'; if(!inNT) note='Choose the state or territory where the rental property is located, and ask for tenancy advice.'; }
    else {
      const local = {katherine:'salvos-katherine',alice:'salvos-alice'}[region];
      const moneyLocal = {alice:'lc-alice',darwin:'catholiccare',palmerston:'catholiccare-palmerston',katherine:'catholiccare-katherine',tennant:'catholiccare-tennant'}[region] || 'askizzy-food';
      ids=!inNT ? (focus==='essentials'?['askizzy-food']:['wellbeing-agency','ndh']) : focus==='housing' ? [...(local?[local]:[]),'housing-intake',...(local?[]:[serving?'dmfs-helpline':'wellbeing-agency'])] : [moneyLocal, ...(local?[local]:[])];
      say=focus==='housing' ? 'I am in '+(regions.find(r=>r[0]===region)?.[1]||'the NT')+' and need help finding somewhere safe to stay.' : 'I need help with food or essentials. Is emergency relief available in my area?';
      if(focus==='housing') note='For a safe place tonight, tell the service that it is urgent. Housing intake is not an overnight booking service and accommodation depends on availability.';
    }
  } else if(task==='care') {
    ids=focus==='health' ? ['healthdirect'] : focus==='carer' ? ['carer-gateway'] : focus==='older' ? ['aged-care'] : inNT ? ['disability-nt','wellbeing-agency'] : ['wellbeing-agency'];
    say=focus==='health' ? 'I need health advice and help finding the right care nearby.' : 'I help care for someone with a disability, illness or other support needs. What practical support can I access?';
    if(focus==='older') say='I would like to understand care options for an older person and how to request an assessment.';
    if(focus==='disability') say='I need help accessing disability services or resolving a problem with support. Can I speak with an advocate?';
    if(focus==='disability') note='Disability advocacy helps with barriers to getting support, including NDIS or education issues. For help with unpaid caring, choose ‘Support for an unpaid carer’.';
  } else if(task==='connect') {
    ids=serving ? [dmfs,'soldieron-connect'] : ['soldieron-connect','wellbeing-agency']; say='I would like to meet people. Are there free activities near me or online that suit my age and family?';
  } else if(task==='safety') {
    const sarc={darwin:'sarc-darwin',palmerston:'sarc-darwin',katherine:'sarc-katherine',alice:'sarc-alice',tennant:'sarc-tennant'}[region];
    ids=focus==='assault' && sarc ? [sarc,'respect'] : ['unsafe','assault'].includes(focus) ? ['respect'] : focus==='separation' ? ['family-advice',...(inNT?['legal-aid']:[])] : inNT ? ['legal-aid'] : ['legal-national'];
    say=focus==='separation' ? 'I need help understanding separation and parenting arrangements.' : focus==='legal' ? 'I would like free initial advice about a legal problem.' : 'I would like to talk about my safety and the options available to me.';
    if(['unsafe','assault'].includes(focus)) note='If someone is in immediate danger, call 000. If this device is being monitored, use a safer device when you can. Leaving this page does not remove browser history.';
    if(!inNT && focus==='legal') note='Choose the state or territory relevant to your legal problem.';
  } else if(task==='help') { ids=[nav]; say='I am not sure where to start. Could you help me work out which service fits my situation?'; }
  return {title, ids:[...new Set(ids)].slice(0,3), note, say};
}
