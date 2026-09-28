import { readFileSync, writeFileSync } from 'node:fs';
import vm from 'node:vm';
const file = new URL('../survey.js', import.meta.url);
const source = readFileSync(file, 'utf8');
const end = source.lastIndexOf("if (document.body.dataset.view === 'questions')");
if (end < 0) throw new Error('Survey bootstrap not found');
const context = vm.createContext({ structuredClone, URL, window:{}, document: {querySelector:()=>null} });
vm.runInContext(readFileSync(new URL('../geography.js', import.meta.url), 'utf8'),context);
vm.runInContext(source.slice(0,end)+`
 globalThis.copy={schema_version:'9.0',questionnaire_revision:'2026-09-29-rand-linked-needs',source:{credit:'Adult questionnaire adapted from Miller et al. (2011), RAND MG-1124, Appendix A.',title:'A New Approach for Assessing the Needs of Service Members and Their Families',authors:'Laura L. Miller et al.',publisher:'RAND Corporation',year:2011,appendix:'A',url:'https://www.rand.org/pubs/monographs/MG1124.html',adaptation:'Locally worded Greater Darwin adult instrument; the source US adult questionnaire and this adaptation are not interchangeable or locally validated. No RAND endorsement is claimed.'},invitation:SURVEY_INVITATION,notice_version:PARTICIPANT_NOTICE_VERSION,notice:PARTICIPANT_INFORMATION,nt:questionLibrarySections('adult','nt'),outside:questionLibrarySections('adult','outside'),unspecified:questionLibrarySections('adult','unspecified')};`,context);
writeFileSync(new URL('../copy/adult-wording.json',import.meta.url), JSON.stringify(context.copy,null,2)+'\n');
console.log('Exported current adult wording from live definitions.');
