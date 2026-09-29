import {readFile, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname, resolve} from 'node:path';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const choicePath=resolve(root,'survey-variants/choice/survey-spec.json');
const openPath=resolve(root,'survey-variants/open/open-survey-spec.json');
const choice=JSON.parse(await readFile(choicePath,'utf8'));
const open=JSON.parse(await readFile(openPath,'utf8'));
const clone=value=>structuredClone(value);
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const sharedKeys=['scope','issue_bank','geography','system_screens'];
const sharedPages=['about','issues','review','thanks'];
const page=(spec,id)=>spec.pages.find(item=>item.id===id);
const openExpectation=page(open,'welcome')?.sections?.find(section=>section.title==='What to expect')?.text;
if(typeof openExpectation!=='string')throw new Error('The open-response What to expect text is missing.');

// The supplied choice specification repeats these answer lists inside its area page.
// Keep the top-level arrays as the single editing point for tomorrow's wording work.
const area=page(choice,'area');
const repeated=[
  ['needs','selected',choice.needs],
  ['sources','contacts',choice.resources],
  ['used','used',choice.characteristics.concat(choice.characteristic_response_controls)],
  ['not_used','not_used',choice.characteristics.concat(choice.characteristic_response_controls)],
  ['networks','personal_networks',choice.personal_networks],
  ['outcomes','ratings',choice.rating_response_options],
  ['outcomes','met_status',choice.overall_need_scale]
];
for(const [sectionName,idFragment,canonical] of repeated){
  const question=area.sections.find(section=>section.id===sectionName)?.questions.find(item=>item.id.includes(idFragment));
  if(!question)throw new Error(`Missing repeated option list: ${sectionName}/${idFragment}.`);
  if(process.argv.includes('--write'))question.options=clone(canonical);
  if(!same(question.options,canonical))throw new Error(`Area option list ${sectionName}/${idFragment} differs from its top-level list.`);
}

if(process.argv.includes('--write')){
  await writeFile(choicePath,JSON.stringify(choice,null,2)+'\n');
  for(const key of sharedKeys)open[key]=clone(choice[key]);
  open.pages=open.pages.map(entry=>sharedPages.includes(entry.id)?clone(page(choice,entry.id)):entry);
  const welcome=clone(page(choice,'welcome'));
  welcome.sections.find(section=>section.title==='What to expect').text=openExpectation;
  open.pages=open.pages.map(entry=>entry.id==='welcome'?welcome:entry);
  await writeFile(openPath,JSON.stringify(open,null,2)+'\n');
}

for(const key of sharedKeys)if(!same(choice[key],open[key]))throw new Error(`Shared ${key} differs between variants.`);
for(const id of sharedPages)if(!same(page(choice,id),page(open,id)))throw new Error(`Shared ${id} page differs between variants.`);
const expectedWelcome=clone(page(choice,'welcome'));
expectedWelcome.sections.find(section=>section.title==='What to expect').text=openExpectation;
if(!same(expectedWelcome,page(open,'welcome')))throw new Error('Welcome differs beyond the open-response What to expect paragraph.');
console.log('Choice lists and both variants’ shared scope, issues, geography, welcome, about, issues, review and thanks match.');
