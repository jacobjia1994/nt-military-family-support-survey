import {readFileSync,writeFileSync} from 'node:fs';

const read=name=>JSON.parse(readFileSync(new URL(`../copy/${name}`,import.meta.url),'utf8'));
const part1=read('rand-appendix-part1.json');
const part2=read('rand-appendix-part2.json');
const part3=read('rand-appendix-part3.json');
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const paragraphs=values=>(values||[]).map(value=>`<p>${esc(typeof value==='string'?value:value.text)}</p>`).join('');
const options=values=>(values||[]).length?`<ul>${values.map(value=>`<li>${esc(value.label)}</li>`).join('')}</ul>`:'';
const qCard=q=>`<section class="item"><h3>${esc(q.id)}. ${esc(q.label)}</h3>${paragraphs(q.help_text)}${options(q.options)}${q.rows?.length?`<table><thead><tr><th>Age or resource</th>${(q.columns||q.options||[]).map(column=>`<th>${esc(column.label)}</th>`).join('')}</tr></thead><tbody>${q.rows.map(row=>`<tr><th>${esc(row.label)}</th>${(q.columns||q.options||[]).map(()=>'<td>○</td>').join('')}</tr>`).join('')}</tbody></table>`:''}</section>`;
const part2Questions=[];
for(const n of [23,24])part2Questions.push(`<section class="item"><h3>Q${n}. ${esc(part2.question_stems.Q23_Q24.question)}</h3><p>${esc(part2.question_stems.Q23_Q24.instruction)}</p>${options(part2.help_options)}</section>`);
part2Questions.push(`<section class="item"><h3>Q25. Most significant needs</h3><p>${esc(part2.question_stems.Q25.intro_variants.both_categories)}</p><p>${esc(part2.question_stems.Q25.instruction)}</p></section>`);
for(const n of [26,27,28,29])part2Questions.push(`<section class="item"><h3>Q${n}. ${esc(part2.question_stems.Q26_Q29.question)}</h3><p>${esc(part2.question_stems.Q26_Q29.instruction)}</p><h4>Military contacts</h4>${options(part2.resource_options.filter(x=>x.group==='military'))}<h4>Nonmilitary contacts</h4>${options(part2.resource_options.filter(x=>x.group==='nonmilitary'))}${options(part2.resource_options.filter(x=>x.id==='NO_CONTACT'))}</section>`);
for(const n of [30,31,32,33])part2Questions.push(`<section class="item"><h3>Q${n}. ${esc(part2.question_stems[`Q${n}`].intro)}</h3><p>${esc(part2.question_stems[`Q${n}`].instruction)}</p>${options(part2.characteristic_options)}</section>`);
part2Questions.push(`<section class="item"><h3>Q34. ${esc(part2.question_stems.Q34.intro)}</h3>${options(part2.personal_network_statements)}</section>`);
part2Questions.push(`<section class="item"><h3>Q35. ${esc(part2.question_stems.Q35.question)}</h3>${options(part2.helpfulness_scale)}</section>`);
part2Questions.push(`<section class="item"><h3>Q36. ${esc(part2.question_stems.Q36.question)}</h3>${options(part2.loss_resource_rows.filter(row=>row.resource_id))}${options(part2.loss_impact_scale)}</section>`);
const sections=[
  `<section><h2>${esc(part1.welcome.title)}</h2><p>${esc(part1.welcome.subtitle)}</p>${paragraphs(part1.welcome.eligibility_text)}</section>`,
  `<section><h2>${esc(part1.participant_information.title)}</h2>${part1.participant_information.sections.map(section=>`<h3>${esc(section.title)}</h3>${paragraphs(section.paragraphs)}`).join('')}${options(part1.participant_information.consent.choices)}</section>`,
  `<section><h2>Study Information, Key Demographics and Problems · Q1–Q22</h2>${part1.questions.filter(question=>/^Q\d+$/.test(question.id)).map(qCard).join('')}</section>`,
  `<section><h2>Needs and Ways of Meeting Needs · Q23–Q36</h2>${part2Questions.join('')}</section>`,
  `<section><h2>Background Information and Attitudes Toward Military Service · Q37–Q67</h2>${part3.questions.map(qCard).join('')}</section>`,
  `<section><h2>${esc(part3.thank_you.heading)}</h2>${paragraphs(part3.thank_you.paragraphs)}<h3>${esc(part3.thank_you.support.heading)}</h3>${part3.thank_you.support.contacts.map(contact=>`<p>${esc(contact.name)} — ${esc(contact.phone)}</p>`).join('')}${paragraphs(part3.thank_you.support.paragraphs)}${paragraphs(part3.thank_you.closing_paragraphs)}</section>`
];
const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Survey of Service Member and Family Needs · Adult Questions</title><style>body{font:16px/1.55 Arial,sans-serif;color:#30312f;background:#faf9f6;margin:0}.paper{max-width:850px;margin:28px auto;padding:32px 42px;background:#fff}h1,h2,h3{line-height:1.25}h1{font-size:30px}h2{font-size:23px;margin-top:42px;border-top:2px solid #b94626;padding-top:16px}h3{font-size:17px;margin:25px 0 9px}.item{break-inside:avoid;border-top:1px solid #dedbd4;padding:9px 0 18px}.item ul{padding-left:25px;columns:2}.item li{break-inside:avoid;margin:0 0 5px}table{border-collapse:collapse;width:100%;font-size:13px}th,td{border:1px solid #ccc;padding:7px;text-align:left}a{color:#8c351e}@media(max-width:700px){.paper{margin:0;padding:20px}.item ul{columns:1}}@media print{body{background:#fff}.paper{margin:0;padding:0;max-width:none}.item{break-inside:avoid}}</style></head><body><main class="paper"><header><img src="assets/lutheran-care-logo.png" width="150" alt="Lutheran Care"><h1>Survey of Service Member and Family Needs</h1><p>Greater Darwin</p></header>${sections.join('')}</main></body></html>\n`;
writeFileSync(new URL('../adult-wording.html',import.meta.url),html);
console.log('Rendered RAND Appendix A adult reading copy with Q1–Q67.');
