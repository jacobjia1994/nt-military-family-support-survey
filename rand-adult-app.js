// Respondent-facing adult flow based on RAND MG-1124 Appendix A.
// No answer is transmitted or persisted by this static demonstration.
(function(root){
  'use strict';
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  function create({main,data}){
    if(!main||!data?.part1||!data?.problems||!data?.part2)throw new TypeError('The RAND adult survey data is incomplete.');
    let engine=null;
    const problems=root.SURVEY_RAND_PROBLEMS;
    const context=root.SURVEY_RAND_CONTEXT;
    const needs=root.SURVEY_RAND_PART2;
    const background=root.SURVEY_RAND_PART3;
    function buildPages(answers){
      return [
        ...context.build(answers,data.part1),
        ...problems.build(answers,data.problems,{partnerStatus:context.partnerStatus,youngDependantStatus:context.youngDependantStatus,independentChildStatus:context.independentChildStatus,dependantStatus:context.dependantStatus,selfMember:context.selfMember}),
        ...needs.build(answers,data.problems,data.part2),
        ...(background&&data.part3?background.build(answers,data.part3,context):[])
      ];
    }
    function focus(){main.querySelector('h1')?.focus({preventScroll:true});root.scrollTo?.(0,0);}
    function showWelcome(){
      const welcome=data.part1.welcome;
      main.innerHTML=`<section class="survey-layout rand-adult rand-opening"><div class="step-topline"><strong>Service Member and Family Needs</strong><span>Welcome</span></div><div class="question-card"><h1 tabindex="-1">${esc(welcome.title)}</h1>${welcome.subtitle?`<p class="rand-subtitle">${esc(welcome.subtitle)}</p>`:''}${welcome.eligibility_text.map(value=>`<p>${esc(value)}</p>`).join('')}<div class="question-actions rand-entry-actions"><button class="button primary" type="button" id="rand-enter">${esc(welcome.adult_cta.label)}</button><button class="button secondary" type="button" id="rand-exit">${esc(welcome.exit_cta.label)}</button></div><p>${esc(welcome.child_prompt)} <a href="youth.html">${esc(welcome.child_cta.label)}</a></p></div></section>`;
      main.querySelector('#rand-enter').onclick=showConsent;
      main.querySelector('#rand-exit').onclick=showExit;
      focus();
    }
    function showConsent(){
      const info=data.part1.participant_information;
      const sections=info.sections.filter(section=>section.id!=='consent').map(section=>`<section class="rand-information-section"><h2>${esc(section.title)}</h2>${(section.paragraphs||[]).map(paragraph=>`<p>${esc(paragraph)}</p>`).join('')}</section>`).join('');
      const choices=info.consent.choices.map(option=>`<label class="choice"><input type="radio" name="rand-consent" value="${esc(option.id)}"><span class="choice-label">${esc(option.label)}</span></label>`).join('');
      main.innerHTML=`<section class="survey-layout rand-adult rand-consent"><div class="step-topline"><strong>Service Member and Family Needs</strong><span>Participation</span></div><form class="question-card" id="rand-consent-form" novalidate><h1 tabindex="-1">${esc(info.title)}</h1>${sections}<fieldset class="rand-question"><legend>Consent to Participate</legend>${choices}</fieldset><p class="error" id="rand-consent-error" role="alert"></p><div class="question-actions"><button type="button" class="back-button" id="rand-consent-back">Back</button><button type="submit" class="button primary">Continue</button></div></form></section>`;
      main.querySelector('#rand-consent-back').onclick=showWelcome;
      main.querySelector('#rand-consent-form').onsubmit=event=>{
        event.preventDefault();
        const choice=main.querySelector('input[name="rand-consent"]:checked')?.value;
        if(!choice){main.querySelector('#rand-consent-error').textContent='Please choose one of the participation options.';return;}
        if(choice==='under_18'){root.location.href='youth.html';return;}
        if(choice==='adult_decline'){showExit();return;}
        if(choice==='adult_agree')startQuestions();
      };
      focus();
    }
    function showExit(){
      const exit=data.part1.welcome.exit;
      main.innerHTML=`<section class="survey-layout rand-adult"><div class="question-card"><h1 tabindex="-1">${esc(exit.text[0])}</h1>${exit.text.slice(1).map(value=>`<p>${esc(value)}</p>`).join('')}<button class="button secondary" id="rand-return" type="button">${esc(exit.return_cta.label)}</button></div></section>`;
      main.querySelector('#rand-return').onclick=showWelcome;focus();
    }
    function showThanks(){
      engine?.reset();engine=null;
      const thank=data.part3?.thank_you;
      const heading=thank?.heading||'Thank you';
      const paragraphs=thank?.paragraphs||['Thank you, once again, for taking the time to complete the survey.','Lutheran Care is listening to Defence personnel and families to help shape local family support in Greater Darwin.'];
      const support=thank?.support;
      const contacts=support?.contacts||[{name:'Defence Member and Family Helpline',phone:'1800 624 608'},{name:'Open Arms — Veterans & Families Counselling',phone:'1800 011 046'}];
      const contactHTML=contacts.map(contact=>`<p><strong>${esc(contact.name)}</strong><br>${esc(contact.phone)}${contact.international_phone?`<br>${esc(contact.international_phone.label)} ${esc(contact.international_phone.number)}`:''}</p>`).join('');
      const closing=thank?.closing_paragraphs||['You may now close this page.'];
      main.innerHTML=`<section class="survey-layout rand-adult"><div class="question-card"><h1 tabindex="-1">${esc(heading)}</h1>${paragraphs.map(value=>`<p>${esc(value)}</p>`).join('')}<section class="rand-support-contact"><h2>${esc(support?.heading||'Information and support')}</h2>${contactHTML}${(support?.paragraphs||['Contact these services directly to ask about support.']).map(value=>`<p>${esc(value)}</p>`).join('')}</section>${closing.map(value=>`<p>${esc(value)}</p>`).join('')}</div></section>`;
      focus();
    }
    function startQuestions(){
      engine=root.SURVEY_RAND_ADULT_ENGINE.create({main,buildPages,onFinish:showThanks,onExit:showConsent});
      engine.start();
    }
    return Object.freeze({start:showWelcome,showConsent,showExit,buildPages,activeAnswers:()=>engine?.answers()||null});
  }
  root.SURVEY_RAND_ADULT_APP=Object.freeze({create});
})(typeof window==='undefined'?globalThis:window);
