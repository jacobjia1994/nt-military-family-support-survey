import { readFileSync, writeFileSync } from 'node:fs';
import vm from 'node:vm';
const file = new URL('../survey.js', import.meta.url);
const source = readFileSync(file, 'utf8');
const end = source.lastIndexOf("if (document.body.dataset.view === 'questions')");
if (end < 0) throw new Error('Survey bootstrap not found');
const context = vm.createContext({ structuredClone, URL, document: {querySelector:()=>null} });
vm.runInContext(source.slice(0,end)+`
 globalThis.copy={invitation:SURVEY_INVITATION,notice:PARTICIPANT_INFORMATION,nt:questionLibrarySections('adult','nt'),outside:questionLibrarySections('adult','outside'),unspecified:questionLibrarySections('adult','unspecified')};`,context);
writeFileSync(new URL('../copy/adult-wording.json',import.meta.url), JSON.stringify(context.copy,null,2)+'\n');
console.log('Exported current adult wording from live definitions.');
