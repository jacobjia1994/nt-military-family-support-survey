import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {verifiedDefence} from './support-verified-data.mjs';
import {groups,actions} from './support-actions.mjs';

const base=path.dirname(fileURLToPath(import.meta.url));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const issue=n=>verifiedDefence.issues.find(i=>i.issue_number===n);
const action=n=>actions.find(a=>a.issueNumber===n);
const href=n=>`help/${String(n).padStart(2,'0')}.html`;
const group=n=>groups.find(g=>g.id==='children'&&[9,10,11,12,13,14,15,16].includes(n))||groups.find(g=>g.id==='wellbeing'&&[17,18,19].includes(n))||groups.find(g=>g.issueNumbers.includes(n));
const link=(url,label,cls='')=>`<a href="${esc(url)}"${cls?` class="${cls}"`:''}>${esc(label)}</a>`;
const phoneLabel=n=>n==='000'?n:/^0\d{9}$/.test(n)?`${n.slice(0,2)} ${n.slice(2,6)} ${n.slice(6)}`:/^1[38]00\d{6}$/.test(n)?`${n.slice(0,4)} ${n.slice(4,7)} ${n.slice(7)}`:/^13\d{4}$/.test(n)?`${n.slice(0,2)} ${n.slice(2,4)} ${n.slice(4)}`:n;
export function contactActions(row){
 const d=row.display,outage=row.catalogue_id===86||/telephone outage|phone.*unavailable|phone.*outage/i.test(d.access+' '+d.contact);
 const digits=d.contact.replace(/\D/g,'');
 const urls=d.urls.filter(u=>/^(tel:|sms:|mailto:)/.test(u)&&(!u.startsWith('tel:')||(!outage&&digits.includes(u.replace(/\D/g,'')))));
 if(!outage)for(const line of d.contact.split('\n'))for(const n of line.match(/\b(?:0[2378](?:[ ()-]*\d){8}|04(?:[ ()-]*\d){8}|1[38]00(?:[ ()-]*\d){6}|13(?:[ ()-]*\d){4}|000)\b/g)||[])urls.push((/\btext\b|\bsms\b/i.test(line)?'sms:':'tel:')+n.replace(/\D/g,''));
 for(const email of d.contact.match(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi)||[])urls.push('mailto:'+email);
 const web=d.urls.filter(u=>/^https?:/.test(u));
 if(web[0])urls.push(row.catalogue_id===86?web.find(u=>u.includes('/nt-cis-enquiries/'))||web[0]:web[0]);
 return [...new Set(urls)].map(u=>({href:u,label:u.startsWith('tel:')?'Call '+phoneLabel(u.slice(4)):u.startsWith('sms:')?'Text '+phoneLabel(u.slice(4)):u.startsWith('mailto:')?'Email':row.catalogue_id===86?'Online referral':'Visit service website'}));
}
function sourceDetails(row){const d=row.display;return `<details class="source-details"><summary>Service details and sources</summary><p>${esc(d.offers)}</p><p class="preserve-lines">${esc(d.contact)}</p><p class="checked">Checked ${esc(d.checked)}</p><ul class="source-links">${d.urls.filter(u=>/^https?:/.test(u)).map((u,i)=>`<li>${link(u,i===0?'Official service information':'Supporting source '+(i+1))}</li>`).join('')}</ul></details>`;}
export function service(row,{compact=false}={}){
 const d=row.display,content=`<p class="service-place">${esc(d.location).replace(/\n/g,' · ')}</p><div class="contact-actions">${contactActions(row).map(a=>link(a.href,a.label,'contact-link')).join('')}</div><dl class="access-rules"><dt>Who can use it</dt><dd>${esc(d.who)}</dd><dt>Access and cost</dt><dd>${esc(d.access)}</dd></dl>${sourceDetails(row)}`;
 return compact?`<details class="programme" id="${row.appearance_id.replaceAll(':','-')}"><summary><span>${esc(d.name)}</span><small>${esc(d.location).replace(/\n/g,' · ')}</small></summary><div class="programme-body">${content}</div></details>`:`<section class="service" id="${row.appearance_id.replaceAll(':','-')}" aria-labelledby="name-${row.appearance_id.replaceAll(':','-')}"><h3 id="name-${row.appearance_id.replaceAll(':','-')}">${esc(d.name)}</h3>${content}</section>`;
}
const taskList=(numbers,prefix='')=>`<ul class="task-list">${numbers.map(n=>`<li>${link(prefix+href(n),n===10?'Childcare outside usual hours or in an emergency':action(n)?.title||issue(n).title)}</li>`).join('')}</ul>`;
function shell(title,body,prefix='',breadcrumbs=[]){return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(title)} | Lutheran Care</title><link rel="icon" href="${prefix}assets/support-icon.svg" type="image/svg+xml"><link rel="stylesheet" href="${prefix}support.css?v=actions-1"><script type="module" src="${prefix}support.js?v=actions-1"></script></head>
<body><a class="skip-link" href="#main">Skip to content</a><div class="page-shell"><header class="site-header">${link(prefix+'support.html#home',`LOGO`,'logo').replace('LOGO',`<img src="${prefix}assets/lutheran-care-logo.png" width="152" height="60" alt="Lutheran Care">`)}<nav aria-label="Support navigation">${link(prefix+'lookup.html','Find a programme')} ${link(prefix+'support.html#home','Start again','restart')}</nav></header><div class="urgent-bar">${link(prefix+'help/40.html','Need urgent help?')}<span>Immediate danger? ${link('tel:000','Call 000')}</span></div><main id="main" tabindex="-1">${breadcrumbs.length?`<nav class="breadcrumbs" aria-label="Breadcrumb">${link(prefix+'support.html','All Defence help')}${breadcrumbs.map(([u,t])=>`<span aria-hidden="true">/</span>${link(u,t)}`).join('')}</nav>`:''}${body}</main><footer><div class="footer-links">${link(prefix+'help/34.html','Help finding a service')}${link(prefix+'help/30.html','Interpreting and accessible contact')}${link(prefix+'help/19.html','Violence or feeling unsafe')}</div><details><summary>Privacy and using this guide</summary><p>This guide does not ask for or collect personal information. Search stays in your browser and clears when you leave the page. Contact the service directly; it can explain how it handles your information.</p></details></footer></div></body></html>\n`;}
function renderAction(n){
 const a=action(n),i=issue(n),g=group(n),used=new Set();
 const steps=a.steps.map(s=>{const rows=s.catalogueIds.flatMap(id=>i.rows.filter(r=>r.catalogue_id===id&&!used.has(r.appearance_id)));rows.forEach(r=>used.add(r.appearance_id));return `<section class="action-step"><h2>${esc(s.title)}</h2>${s.text?`<p class="step-context">${esc(s.text)}</p>`:''}${rows.map(r=>service(r,{compact:rows.filter(x=>x.catalogue_id===r.catalogue_id).length>2})).join('')}</section>`;}).join('');
 const rest=i.rows.filter(r=>!used.has(r.appearance_id));
 const more=rest.length?`<details class="more-help" id="more-help"><summary>${esc(a.moreLabel||'More help for this task')}</summary><div class="more-body">${rest.map(r=>service(r,{compact:true})).join('')}</div></details>`:'';
 return shell(a.title,`<h1 tabindex="-1">${esc(a.title)}</h1>${n===7?`<p>${link('housing-tonight.html','Nowhere safe to stay tonight?')}</p>`:''}${a.lead?`<p class="lead">${esc(a.lead)}</p>`:''}<div class="action-layout"><div>${steps}${more}</div><aside class="related"><h2>Related help</h2>${n===40?`<p>${link('housing-tonight.html','Nowhere safe to stay tonight')}</p>`:''}${taskList(a.related,'../')}<p>${link('../lookup.html?topic='+n,'All programmes for this topic')}</p></aside></div>`,`../`,g?[[`../topics/${g.id}.html`,g.title]]:[]);
}
function renderTonight(){
 const rows=issue(7).rows;
 const local=rows.filter(r=>[117,126,127,69,122,106,107].includes(r.catalogue_id));
 const areas=[...new Set(local.map(r=>r.geography.group))];
 const compare=areas.map(area=>`<details class="housing-area"><summary>${esc(area==='Darwin'?'Darwin / Palmerston':area==='Katherine'?'Katherine / Tindal':area)}</summary>${local.filter(r=>r.geography.group===area).map(r=>service(r).replaceAll('id="defence-issue-','id="tonight-defence-issue-')).join('')}</details>`).join('');
 return shell('Nowhere safe to stay tonight',`<h1 tabindex="-1">Nowhere safe to stay tonight</h1><p class="lead">Call to ask about vacancies and who can stay.</p><section class="action-step"><h2>Local accommodation programmes</h2>${compare}</section><section class="action-step"><h2>For a Defence family in a domestic crisis</h2>${service(rows.find(r=>r.catalogue_id===43)).replaceAll('id="defence-issue-','id="tonight-defence-issue-')}</section><section class="action-step"><h2>For a non-urgent assessment and referral</h2>${service(rows.find(r=>r.catalogue_id===86)).replaceAll('id="defence-issue-','id="tonight-defence-issue-')}</section><aside class="related"><h2>Related help</h2><p>${link('19.html','Violence or feeling unsafe')}</p><p>${link('07.html','Defence housing and tenancy advice')}</p></aside>`,'../',[['../topics/money.html','Money and housing']]);
}
function renderLegal(){
 const row=issue(18).rows.find(r=>r.catalogue_id===73);
 const programme=service(row).replaceAll('id="defence-issue-','id="legal-defence-issue-').replace('<h3 ','<h2 ').replace('</h3>','</h2>');
 return shell('Get legal information or advice',`<h1 tabindex="-1">Get legal information or advice</h1><p class="lead">Ask about family, civil or criminal legal problems.</p>${programme}<aside class="related"><h2>Related help</h2>${taskList([18,19],'../')}</aside>`,'../');
}
function renderGroup(g){
 const featured=g.featured||g.issueNumbers.slice(0,3),others=g.issueNumbers.filter(n=>!featured.includes(n));
  return shell(g.title,`<h1 tabindex="-1">${esc(g.title)}</h1>${g.id==='money'?`<ul class="task-list"><li>${link('../help/housing-tonight.html','Nowhere safe to stay tonight')}</li></ul>`:''}${taskList(featured,'../')}${others.length?`<details class="topic-more"><summary>${esc(g.moreLabel||'More help in this area')}</summary>${taskList(others,'../')}</details>`:''}`,'../',[]);
}
function renderLookup(){return shell('Find a Defence family programme',`<h1 tabindex="-1">Find a programme</h1><form class="lookup-search" role="search" hidden><label for="programme-search">Programme name, support or place</label><input id="programme-search" type="search" autocomplete="off" placeholder="For example: childcare, Open Arms, Tindal"><label for="topic-search">Topic</label><select id="topic-search"><option value="">All topics</option>${actions.map(a=>`<option value="${a.issueNumber}">${esc(a.title)}</option>`).join('')}</select></form><p class="sr-only" id="search-status" role="status" aria-live="polite"></p><div id="search-results"></div><section id="lookup-topics"><h2>Browse by topic</h2>${groups.map(g=>`<details class="lookup-group"><summary>${esc(g.title)}</summary>${taskList(g.issueNumbers)}</details>`).join('')}</section>`);}
function renderHome(){return shell('NT Defence family support',`<h1 tabindex="-1">NT Defence family support</h1><ul class="home-entrances">${groups.map(g=>`<li>${link(g.id==='moving'?href(1):g.id==='apart'?href(2):'topics/'+g.id+'.html',g.title)}<p>${esc(g.hint)}</p></li>`).join('')}</ul><p class="home-assistance">${link('help/34.html','Not sure where to start? Talk to someone')}</p>`);}
const prototype=process.argv.includes('--prototype');
fs.mkdirSync(path.join(base,'help'),{recursive:true});fs.mkdirSync(path.join(base,'topics'),{recursive:true});
// The legacy repository's index belongs to the survey. Write it only on request.
if(process.argv.includes('--with-index'))fs.writeFileSync(path.join(base,'index.html'),renderHome());
fs.writeFileSync(path.join(base,'support.html'),renderHome());
fs.writeFileSync(path.join(base,'lookup.html'),renderLookup());
for(const g of groups)fs.writeFileSync(path.join(base,'topics',g.id+'.html'),renderGroup(g));
for(const n of prototype?[1,10,34,40]:actions.map(a=>a.issueNumber))fs.writeFileSync(path.join(base,href(n)),renderAction(n));
if(!prototype)fs.writeFileSync(path.join(base,'help/housing-tonight.html'),renderTonight());
if(!prototype)fs.writeFileSync(path.join(base,'help/legal.html'),renderLegal());
console.log(`Generated ${prototype?'four representative':actions.length} action pages; source snapshot unchanged.`);
