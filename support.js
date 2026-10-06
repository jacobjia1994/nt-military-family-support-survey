// Static pages work without this enhancement. No answers, accounts or storage.
const root=new URL('./',import.meta.url);
const issueURL=n=>new URL(`help/${String(n).padStart(2,'0')}.html`,root);
const legacyTasks={pets:[8,8],posting:[7,1,2,1,8],absence:[2,2,17],'children-education':[9,10,10,13,13,14],work:[5,5,43,4,3],transition:[37],'mental-health':[20,20,22],health:[23,23,23,24],safety:[19,19,19,19,19],relationships:[17,18,18],money:[6,6,6],'housing-tonight':[7],'losing-housing':[7],'stable-housing':[7],rental:[7,7,15],'child-wellbeing':[15,15],parenting:[12,12],baby:[11,11,11,11],disability:[25,25,25,25],carers:[26,16,26],older:[27,27,27],'home-help':[45,45,6],bereavement:[38,38,39],addiction:[41,41],groups:[28,15,29],language:[30,30,30],'aboriginal-wellbeing':[30,39],inclusive:[31],private:[33],claims:[42],rehabilitation:[37],budgeting:[6],'moving-childcare':[10],'new-entry':[44],'family-info':[32],'family-advocacy':[36],'defence-aware':[35],pastoral:[29],'nt-preparedness':[1],'home-ownership':[7],legal:[18],'urgent-mental':[40],'nt-urgent-mental':[40],'distress-training':[21]};
const oldNeeds={mental:{feelings:20,treatment:20,grief:38,'practical-loss':38,'suicide-loss':39,addiction:41,'distress-signs':21,'managing-stress':22,crisis:40,'nt-crisis':40,private:33,lgbtq:31,indigenous:30},relationships:{counselling:17,separation:18,unsafe:19,refuge:19,assault:19,misconduct:19,'child-violence':19,legal:18},parenting:{parenting:12,childcare:9,'emergency-care':10,'moving-care':10,school:13,learning:13,development:25,'education-costs':14,teenager:15},money:{bills:6,income:6,essentials:6,housing:7,tonight:7,'losing-housing':7,'stable-housing':7,'rent-assistance':7,tenancy:7,'defence-housing':7,claims:42,'family-crisis':45,'home-ownership':7,pets:8},work:{job:5,partner:5,study:43,reserve:4,transition:37,rehabilitation:37,flexible:3},care:{health:23,baby:11,disability:25,'home-care':45,carer:26,older:27,travel:24,costs:23,'young-carer':16,'care-skills':26},connection:{local:28,settle:1,apart:2,language:30,recognition:29,'family-info':32,'defence-aware':35,feedback:36,'new-entry':44,'nt-preparedness':1,pastoral:29}};
export function legacyTarget(hash){
 const p=hash.replace(/^#/,'').split('/');
 if(p[0]==='need'&&/^\d+$/.test(p[1])){const old={1:1,2:2,3:10,4:4,5:5,6:6,7:7,8:7,9:9,10:10,11:11,12:12,13:13,14:13,15:20,16:26,17:17,18:18,19:19,20:20,21:20,22:20,23:23,24:24,25:25,26:26,27:27,28:28,29:28,30:34,31:31,32:34,33:33,34:34,35:34,36:34,37:37,38:38,39:39};const n=old[+p[1]];if(n)return `help/${String(n).padStart(2,'0')}.html`;}
 if(p[0]==='directory')return 'lookup.html'+(p[1]?.match(/issue:(\d+)/)?'?topic='+Number(p[1].match(/issue:(\d+)/)[1]):'');
 if(p[0]==='help')return 'help/34.html';
 if(p[0]==='urgent-help')return 'help/40.html';
 if(p[0]==='task'&&p[1]==='housing-tonight')return 'help/housing-tonight.html';
 if(p[0]==='task'&&legacyTasks[p[1]])return `help/${String(legacyTasks[p[1]][+p[2]||0]||legacyTasks[p[1]][0]).padStart(2,'0')}.html`;
 if(p[0]==='start'){const aliases={housing:'money',health:'care',relationships:'wellbeing',children:'children',work:'work',connection:'apart'};if(aliases[p[1]])return 'topics/'+aliases[p[1]]+'.html';}
 if(p[0]==='situation'){const n={moving:1,settle:1,apart:2,leaving:37}[p[1]];if(n)return `help/${String(n).padStart(2,'0')}.html`;}
 const n=oldNeeds[p[0]]?.[p[1]]||({talk:20,children:9,moving:1,connect:28,safety:19}[p[0]]);
 return n?`help/${String(n).padStart(2,'0')}.html`:null;
}
if(typeof document!=='undefined'){
 const redirect=()=>{const target=legacyTarget(location.hash);if(target)location.replace(new URL(target,root));};
 redirect();addEventListener('hashchange',redirect);
 if(location.hash==='#home')document.querySelector('h1')?.focus({preventScroll:true});
 const search=document.getElementById('programme-search'),topic=document.getElementById('topic-search');
 if(search&&topic){
  const {verifiedDefence}=await import('./support-verified-data.mjs');
  document.querySelector('form').hidden=false;
  const records=verifiedDefence.issues.flatMap(i=>i.rows.map(r=>({...r,issue:i})));
  const results=document.getElementById('search-results'),browse=document.getElementById('lookup-topics'),status=document.getElementById('search-status');
  const normalize=s=>s.toLocaleLowerCase().normalize('NFKD').replace(/[’']/g,'');
  function update(){
   const q=normalize(search.value.trim()),n=topic.value;
   results.replaceChildren();browse.hidden=Boolean(q||n);
   if(!q&&!n){status.textContent='';return;}
   const hits=records.filter(r=>(!n||r.issue.issue_number===+n)&&(!q||normalize([r.display.name,r.display.location,r.display.who,r.display.offers,r.display.access,r.issue.title].join(' ')).includes(q)));
   const routes=new Map();for(const r of hits){const rows=routes.get(r.route_id)||[];rows.push(r);routes.set(r.route_id,rows);}
   status.textContent=routes.size+(routes.size===1?' programme found.':' programmes found.');
   if(!routes.size){const p=document.createElement('p');p.textContent='No programme name matched. Try a different word or browse by topic.';results.append(p);browse.hidden=false;return;}
   for(const rows of routes.values()){
    const item=document.createElement('section');item.className='lookup-result';
    const h=document.createElement('h2');h.textContent=rows[0].display.name;item.append(h);
    const place=document.createElement('p');place.className='service-place';place.textContent=rows[0].display.location.replaceAll('\n',' · ');item.append(place);
    const ul=document.createElement('ul');for(const r of rows){const li=document.createElement('li'),a=document.createElement('a');a.href=issueURL(r.issue.issue_number)+'#'+r.appearance_id.replaceAll(':','-');a.textContent=r.issue.title;li.append(a);ul.append(li);}item.append(ul);results.append(item);
   }
  }
  search.addEventListener('input',update);topic.addEventListener('change',update);document.querySelector('form').addEventListener('submit',e=>e.preventDefault());
  const initialTopic=new URL(location.href).searchParams.get('topic');if(initialTopic&&verifiedDefence.issues.some(i=>i.issue_number===+initialTopic))topic.value=initialTopic;
  update();addEventListener('pageshow',e=>{if(e.persisted){search.value='';topic.value='';update();}});
 }
 const anchor=location.hash.slice(1),target=anchor&&document.getElementById(anchor);
 if(target){for(let el=target;el;el=el.parentElement)if(el.tagName==='DETAILS')el.open=true;target.scrollIntoView();}
}
