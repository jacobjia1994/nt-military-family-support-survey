import {readFileSync,writeFileSync} from 'node:fs';

const read=name=>JSON.parse(readFileSync(new URL(`../copy/${name}`,import.meta.url),'utf8'));
const part1=read('rand-appendix-part1.json');
const problems=read('rand-appendix-q12-q20.json');
const part2=read('rand-appendix-part2.json');
const part3=read('rand-appendix-part3.json');
const sourceIds=Array.from({length:67},(_,i)=>`Q${i+1}`);
const part1Ids=part1.questions.filter(question=>/^Q\d+$/.test(question.id)).map(question=>question.id);
const part3Ids=part3.questions.filter(question=>/^Q\d+$/.test(question.id)).map(question=>question.id);
if(part1Ids.join('|')!==sourceIds.slice(0,22).join('|'))throw new Error('RAND Part 1 must cover Q1–Q22 in order.');
if(part3Ids.join('|')!==sourceIds.slice(36).join('|'))throw new Error('RAND Part 3 must cover Q37–Q67 in order.');
if(problems.categories.length!==9||problems.categories.reduce((n,group)=>n+group.options.length,0)!==95)throw new Error('RAND nine-domain problem catalog is incomplete.');
if(part2.help_options.length!==10||part2.characteristic_options.length!==7||part2.personal_network_statements.length!==7||part2.helpfulness_scale.length!==5||part2.loss_impact_scale.length!==4)throw new Error('RAND needs/resource dimensions changed unexpectedly.');
const data={schema:'rand-appendix-a-greater-darwin/1',source:'RAND MG-1124 Appendix A, printed pp 75–115',part1,problems,part2,part3};
writeFileSync(new URL('../rand-adult-data.js',import.meta.url),`// Generated from the reviewed RAND Appendix A local question dictionaries.\nwindow.RAND_ADULT_DATA=${JSON.stringify(data)};\n`);
console.log('Built source-faithful RAND adult question data: Q1–Q67.');
