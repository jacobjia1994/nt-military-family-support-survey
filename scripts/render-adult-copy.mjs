import {readFileSync, writeFileSync} from 'node:fs';

// The JSON is exported from the live question definitions. Keep the established
// reading-copy CSS and consent shell, while replacing all generated wording.
const output=new URL('../adult-wording.html',import.meta.url);
const previous=readFileSync(output,'utf8');
const copy=JSON.parse(readFileSync(new URL('../copy/adult-wording.json',import.meta.url),'utf8'));
const esc=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
let head=previous.slice(0,previous.indexOf('</head>'));
if(!head.includes('<style>'))throw new Error('Reading-copy style shell missing');
head=head.replace(/<title>[^<]*<\/title>/,'<title>Adult reading copy · Defence Family Support Survey</title>');
const consent=previous.match(/<section class="consent-copy">[\s\S]*?<\/section>/)?.[0];
if(!consent)throw new Error('Established adult consent shell missing');
const rules={other_suburb:'Only shown after Other suburb or locality.',needs_list:'Only shown after Yes or Not sure to needing support.',other_need:'Only shown after Something else.',additional_support:'Only shown after Yes to extra or different support now.',live:'Only shown after choosing an in-person, group, phone or video format.',area_barriers:'The applicable version depends on whether support was sought.'};
let number=0;
function field(f){
 const options=(f.options||[]).map(o=>`<li>${esc(o.label)}${o.hint?`<span class="option-hint">${esc(o.hint)}</span>`:''}</li>`).join('');
 let answer=options?`<ul class="answers ${f.type==='multi'?'multi':'single'}">${options}</ul>`:'<div class="writing-space" aria-label="Written response space"></div>';
 if(f.type==='search-select')answer=`<details class="locality-options"><summary>View all ${f.options.length} suburb/locality choices</summary>${answer}</details>`;
 return `<div class="copy-question" data-field="${esc(f.key)}"><h3><span class="q-number">${++number}.</span> ${esc(f.label)}</h3>${f.conditional?`<p class="route-note">${esc(rules[f.conditional]||f.conditional)}</p>`:''}${f.hint?`<p class="hint">${esc(f.hint)}</p>`:''}${answer}</div>`;
}
function section(s,prefix){
 const variants=(s.variants||[]).map(v=>`<div class="branch"><h3 class="branch-title">${esc(v.title||v.label)}</h3>${v.intro?`<p>${esc(v.intro)}</p>`:''}${v.fields.map(field).join('')}</div>`).join('');
 return `<section class="copy-section" id="${prefix}-${esc(s.id)}"><h2>${esc(s.title)}</h2>${s.intro?`<p class="section-intro">${esc(s.intro)}</p>`:''}${s.id==='earlier'?'<p class="route-note">This separate route replaces the main needs questions for an earlier service connection.</p>':''}${s.note?`<p class="editor-note">${esc(s.note)}</p>`:''}${s.fields.map(field).join('')}${variants}</section>`;
}
const seen=new Set();
const sections=['nt','outside','unspecified'].map(route=>{
 const unique=copy[route].filter(s=>{const key=JSON.stringify(s);if(seen.has(key))return false;seen.add(key);return true;});
 return unique.length?`<article data-route="${route}">${route==='nt'?'':`<h2>Additional wording: ${esc(route)}</h2>`}${unique.map(s=>section(s,route)).join('')}</article>`:'';
}).join('');
const finish={title:'Thank you for helping strengthen the Defence community in Greater Darwin.',interviewDescription:'Would you like to discuss your experiences and support needs further with Lutheran Care?',supportDescription:'As a thank-you for sharing your views, explore our free guide to support services for Defence members and families.',interview:'Request an interview',support:'Find support in a few clicks',scope:'This consultation is for Australian Defence Force members and their families living in Greater Darwin, including Darwin, Palmerston and Litchfield.',...copy.finish};
const body=`<body class="hide-notes"><div class="review-bar"><div><strong>Adult questionnaire</strong>Defence Family Support Program</div><div class="controls"><button id="print" type="button">Print</button></div></div><main class="paper"><header class="brand"><img src="assets/lutheran-care-logo.png" width="172" height="68" alt="Lutheran Care"><p><strong>Defence Family Support Program</strong>Greater Darwin</p></header><section class="invitation"><h1>${esc(copy.invitation.title)}</h1><p class="greeting">${esc(copy.invitation.greeting)}</p>${copy.invitation.paragraphs.map(p=>`<p>${esc(p)}</p>`).join('')}<p class="funding">${esc(copy.invitation.funding)}</p></section><section class="privacy-copy"><h2>Taking part and your information</h2><div class="notice-columns">${copy.notice.map(([title,text])=>`<p><strong>${esc(title)}</strong> ${text}</p>`).join('')}</div></section>${consent}<div id="questions">${sections}</div><section class="copy-section"><h2>Checking and finishing</h2><h3>Check your answers</h3><p class="button-words">Back · Continue · Change · Confirm and submit</p><h3>${esc(finish.title)}</h3><div class="finish-option"><p>${esc(finish.interviewDescription)}</p><p><a href="contact.html" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">${esc(finish.interview)}</a></p></div><div class="finish-option"><p>${esc(finish.supportDescription)}</p><p><a href="support.html" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">${esc(finish.support)}</a></p></div><p class="button-words">Clear answers and start again</p><h3>If the person is outside the survey scope</h3><p>${esc(finish.scope)}</p></section></main><script>const localityLists=[...document.querySelectorAll('.locality-options')];let previousOpen=[];window.addEventListener('beforeprint',()=>{previousOpen=localityLists.map(el=>el.open);localityLists.forEach(el=>{el.open=true;});});window.addEventListener('afterprint',()=>localityLists.forEach((el,i)=>{el.open=previousOpen[i];}));document.querySelector('#print').onclick=()=>window.print();</script></body></html>`;
writeFileSync(output,head+'</head>'+body+'\n');
console.log(`Rendered adult reading copy: ${number} question/variant fields from current definitions.`);
