import { needs, services } from './support-data.mjs?v=20260925-7';
import { journeys, concernGroups, concernDirectChoiceIds, humanHelpServiceIds } from './support-journeys.mjs?v=20260925-4';

const finder = document.querySelector('#finder');
const journeyById = new Map(journeys.map(journey => [journey.id, journey]));
const concernGroupById = new Map(concernGroups.map(group => [group.id, group]));
const concernGroupByChoice = new Map(concernGroups.flatMap(group => group.choiceIds.map(id => [id, group])));
const needById = new Map(needs.map(need => [String(need.id), need]));
const serviceById = new Map(services.map(service => [service.id, service]));
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char]);
const external = url => {
  try { const parsed = new URL(url); return parsed.protocol === 'https:' && !parsed.username && !parsed.password ? parsed.href : ''; }
  catch { return ''; }
};
const telephone = phone => String(phone || '').replace(/\D/g, '');

// Only limits that could change a visitor's next action belong in the closed row.
// The provider's full audience and access conditions remain in its disclosure.
const decisiveLimit = {
  'dha-housing': 'For eligible ADF housing support, not homelessness help.',
  'toll-transitions': 'For approved Defence moves.',
  'nt-transition-centre': 'Contact the NT team before visiting.',
  'veteran-wellbeing-agency': 'Phone hours are weekdays 8:30 am–5 pm.',
  'dva-acute-support': 'Assessed practical services, not a cash payment.',
  'dva-claims': 'Claim eligibility is assessed.',
  'lc-alice-financial': 'Gregory Terrace office closed; call for current access.',
  'adf-allhours': 'Available 24/7.',
  'teamtalk': 'Not an emergency service.',
  'eheadspace': 'Not an emergency service.',
  'sempro': 'Defence-related sexual misconduct; no formal report required.',
  'defence-safe': 'Assessed accommodation allowance, not a guaranteed placement.',
  'wossca-alice': '24/7 crisis line.',
  'territory-faces': 'Mandatory reporting applies.',
  'pats-nt': 'NT travel over 75 km; other coverage may exclude this scheme.',
  'defence-remote-travel': 'Check Defence approval before arranging travel.',
  'grief-australia': 'Ask about current counselling access; not an emergency line.',
  griefline: 'Phone currently routes to SANE service enquiries, not immediate counselling.',
  'dmfs-tindal': 'Arrange base access before visiting.',
  'headspace-alice': 'Not an emergency service.',
  'katherine-mmhc': 'For adults 18 and over; confirm its temporary address.',
  'nt-central-intake': 'Phone unavailable; online replies aim to arrive within 48 business hours.',
  'relationship-counselling-nt': 'Fees may apply; ask when booking.',
  peap: 'Register before using a service; approval conditions apply.',
  'standby-nt': 'Phone support 6 am–10 pm, seven days a week.',
  'defence-childcare': 'Priority does not guarantee a place; fees apply.',
  'defence-education': 'Defence conditions and an application apply.',
  'school-mentor': 'Only at participating schools.',
  'headspace-darwin': 'Not an emergency service.',
  'headspace-palmerston': 'Not an emergency service.',
  'headspace-katherine': 'Not an emergency service.',
  ndis: 'Eligibility is assessed; support is not guaranteed.',
  qlife: 'Not an emergency service.',
  'employer-support-payment': 'For employers or self-employed reservists, not a family payment.',
  '13yarn': 'For Aboriginal and Torres Strait Islander people.',
  'nt-in-home-care': 'Eligibility is assessed; care and places are not guaranteed.',
  kwcc: 'Call about local availability.',
  'safe-zone': 'Anonymous support; caller ID is visible unless hidden.',
  'legacy-nt': 'Eligibility is assessed.'
};

function serviceHTML(service) {
  const url = external(service.url);
  if (!url) return '';
  const limit = decisiveLimit[service.id];
  return `<li class="service-item">
    <p class="service-area">${esc(service.area)}</p>
    <h2>${esc(service.name)}</h2>
    <p class="service-offer">${esc(service.offers)}</p>
    ${limit ? `<p class="service-limit">${esc(limit)}</p>` : ''}
    <div class="service-actions">
      ${service.phone ? `<a class="button primary" href="tel:${telephone(service.phone)}" aria-label="Call ${esc(service.name)} on ${esc(service.phone)}">Call ${esc(service.phone)}</a>` : `<a class="button primary" href="${esc(url)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer" aria-label="Open the official website for ${esc(service.name)}">Open official website</a>`}
      ${service.phone ? `<a class="service-website" href="${esc(url)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer" aria-label="Official website for ${esc(service.name)}">Official website</a>` : ''}
    </div>
    <details class="service-details"><summary aria-label="Who can use ${esc(service.name)} and what to check">Who can use it and what to check</summary>
      <p><strong>Who:</strong> ${esc(service.for)}</p>
      <p><strong>Access:</strong> ${esc(service.access)}</p>
    </details>
  </li>`;
}
function firstContactHTML(service, secondary = false) {
  if (!service || !external(service.url)) return '';
  const limit = decisiveLimit[service.id];
  const url = external(service.url);
  return `<section class="first-contact${secondary ? ' follow-up-contact' : ''}" aria-labelledby="first-contact-heading">
    <p class="service-area">${esc(service.area)}</p>
    <h2 id="first-contact-heading">${esc(service.name)}</h2>
    <p class="service-offer">${esc(service.offers)}</p>
    <p class="service-fit"><strong>For:</strong> ${esc(service.for)}</p>
    ${limit ? `<p class="service-limit">${esc(limit)}</p>` : ''}
    <div class="service-actions">
      ${service.phone ? `<a class="button primary" href="tel:${telephone(service.phone)}" aria-label="Call ${esc(service.name)} on ${esc(service.phone)}">Call ${esc(service.phone)}</a><a class="service-website" href="${esc(url)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer" aria-label="Official website for ${esc(service.name)}">Official website</a>` : `<a class="button primary" href="${esc(url)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer" aria-label="Open the official website for ${esc(service.name)}">Open official website</a>`}
    </div>
    <details class="service-details"><summary aria-label="Access details for ${esc(service.name)}">Before you contact them</summary><p>${esc(service.access)}</p></details>
  </section>`;
}
function otherContactHTML(service) {
  if (!service || !external(service.url)) return '';
  const url = external(service.url);
  const limit = decisiveLimit[service.id];
  return `<li class="other-contact">
    <h3>${esc(service.name)}</h3>
    <p class="service-area">${esc(service.area)}</p>
    <p>${esc(service.offers)}</p>
    <p class="service-fit"><strong>For:</strong> ${esc(service.for)}</p>
    ${limit ? `<p class="service-limit">${esc(limit)}</p>` : ''}
    <div class="other-contact-links">${service.phone ? `<a href="tel:${telephone(service.phone)}" aria-label="Call ${esc(service.name)} on ${esc(service.phone)}">Call ${esc(service.phone)}</a><span aria-hidden="true">·</span>` : ''}<a href="${esc(url)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer" aria-label="Official website for ${esc(service.name)}">Official website</a></div>
  </li>`;
}
function serviceList(ids) {
  const found = [...new Set(ids)].map(id => serviceById.get(id)).filter(Boolean);
  return found.length ? `<ul class="service-list">${found.map(serviceHTML).join('')}</ul>` : '<p>No service is listed for this topic yet.</p>';
}
function quickHelpHTML(quickHelp, primary = false) {
  if (!quickHelp) return '';
  const contacts = quickHelp.contacts.map(contact => {
    const service = serviceById.get(contact.id);
    if (!service?.phone) return '';
    return `<li><span>${esc(contact.label)}</span><a href="tel:${telephone(service.phone)}" aria-label="Call ${esc(service.name)} on ${esc(service.phone)}">${esc(service.phone)}</a></li>`;
  }).filter(Boolean);
  if (!contacts.length) return '';
  const url = quickHelp.url && external(quickHelp.url);
  return `<section class="quick-help${primary ? ' quick-help-primary' : ''}" aria-label="${esc(quickHelp.title)}">
    <h2>${esc(quickHelp.title)}</h2>
    ${quickHelp.note ? `<p>${esc(quickHelp.note)}</p>` : ''}
    <ul>${contacts.join('')}</ul>
    ${url ? `<a class="quick-help-source" href="${esc(url)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">${esc(quickHelp.urlLabel || 'Official information')}</a>` : ''}
  </section>`;
}
function homeHTML() {
  return `<section aria-labelledby="home-heading">
    <h1 id="home-heading" tabindex="-1">Find support in the NT</h1>
    <ul class="situation-list">${journeys.map(journey => `<li><a href="#situation/${esc(journey.id)}">${esc(journey.title)}</a></li>`).join('')}</ul>
    <p class="human-help-link"><a href="#help">Not sure where to start? Talk to someone</a></p>
  </section>`;
}
function choiceList(journey, choices = journey.choices) {
  return `<ul class="choice-list">${choices.map(choice => `<li><a href="#situation/${esc(journey.id)}/${esc(choice.id)}">${esc(choice.title)}</a></li>`).join('')}</ul>`;
}
function accessHelpHTML(currentNeedIds = []) {
  const links = [
    !currentNeedIds.includes(30) && '<a href="#need/30">Language and interpreting help</a>',
    !currentNeedIds.includes(31) && '<a href="#need/31">LGBTQIA+ inclusive support</a>',
    !currentNeedIds.includes(33) && '<a href="#need/33">Privacy when asking for help</a>'
  ].filter(Boolean);
  return links.length ? `<details class="access-help"><summary>Need help accessing a service?</summary><p>${links.join(' · ')}</p></details>` : '';
}
function journeyHTML(journey) {
  const isConcern = journey.id === 'concern';
  const directChoices = isConcern ? concernDirectChoiceIds.map(id => journey.choices.find(choice => choice.id === id)).filter(Boolean) : [];
  const leavingChoices = journey.id === 'leaving' ? `<div class="choice-sections"><section aria-labelledby="general-guidance"><h2 id="general-guidance">General guidance</h2>${choiceList(journey, journey.choices.slice(0, 2))}</section><section aria-labelledby="specific-difficulty"><h2 id="specific-difficulty">A specific difficulty</h2>${choiceList(journey, journey.choices.slice(2))}</section></div>` : '';
  return `<section aria-labelledby="journey-heading">
    <nav class="finder-nav" aria-label="Support guide"><a href="#start">All support routes</a></nav>
    <h1 id="journey-heading" tabindex="-1">${esc(journey.title)}</h1>
    ${isConcern ? `<ul class="choice-list">${concernGroups.map(group => `<li><a href="#group/${esc(group.id)}">${esc(group.title)}</a></li>`).join('')}${directChoices.map(choice => `<li><a href="#situation/concern/${esc(choice.id)}">${esc(choice.title)}</a></li>`).join('')}</ul>` : leavingChoices || choiceList(journey)}
  </section>`;
}
function concernGroupHTML(group) {
  const journey = journeyById.get('concern');
  const choices = group.choiceIds.map(id => journey.choices.find(choice => choice.id === id)).filter(Boolean);
  return `<section aria-labelledby="group-heading">
    <nav class="finder-nav" aria-label="Support guide"><a href="#situation/concern">Specific concerns</a> <span aria-hidden="true">/</span> <a href="#start">All routes</a></nav>
    <h1 id="group-heading" tabindex="-1">${esc(group.title)}</h1>
    ${choiceList(journey, choices)}
  </section>`;
}
function choiceHTML(journey, choice) {
  const selected = (choice.needIds || []).map(id => needById.get(String(id))).filter(Boolean);
  const primaryIds = choice.primaryServiceIds || choice.serviceIds || selected.flatMap(need => need.services);
  const primary = [...new Set(primaryIds)].map(id => serviceById.get(id)).filter(Boolean);
  const note = choice.note || (selected.length === 1 ? selected[0].note : '');
  const group = journey.id === 'concern' ? concernGroupByChoice.get(choice.id) : null;
  const backHash = group ? `#group/${group.id}` : `#situation/${journey.id}`;
  const extra = primary.slice(1, 4);
  const rest = [...primary.slice(4).map(service => service.id), ...(choice.moreServiceIds || [])];
  return `<section aria-labelledby="choice-heading">
    <nav class="finder-nav" aria-label="Support guide"><a href="${esc(backHash)}">${esc(group?.title || journey.title)}</a> <span aria-hidden="true">/</span> <a href="#start">All routes</a></nav>
    <h1 id="choice-heading" tabindex="-1">${esc(choice.title)}</h1>
    ${note ? `<p class="need-note${choice.safety ? ' safety-note' : ''}">${esc(note)}</p>` : ''}
    ${choice.related ? `<p class="related-link"><a href="#situation/${esc(choice.related.routeId)}/${esc(choice.related.choiceId)}">${esc(choice.related.label)}</a></p>` : ''}
    ${choice.quickHelpFirst ? quickHelpHTML(choice.quickHelp, true) : ''}
    ${firstContactHTML(primary[0], Boolean(choice.quickHelpFirst))}
    ${choice.quickHelpFirst ? '' : quickHelpHTML(choice.quickHelp)}
    ${extra.length ? `<section class="other-contacts" aria-labelledby="other-contacts-heading"><h2 id="other-contacts-heading">Other ways to get help</h2><ul>${extra.map(otherContactHTML).join('')}</ul></section>` : ''}
    ${rest.length ? `<details class="more-services"><summary>${esc(choice.moreLabel || 'More relevant services')}</summary>${serviceList(rest)}</details>` : ''}
    <p class="result-help"><a href="#help">Not sure which service fits? Talk to someone</a></p>
    ${accessHelpHTML(choice.needIds || [])}
  </section>`;
}
function humanHelpHTML() {
  return `<section aria-labelledby="help-heading"><nav class="finder-nav" aria-label="Support guide"><a href="#start">All support routes</a></nav>
    <h1 id="help-heading" tabindex="-1">Talk to someone who can help you find support</h1>
    <h2 class="visually-hidden">Contacts</h2>
    <ul class="standalone-contacts">${humanHelpServiceIds.map(id => serviceById.get(id)).filter(Boolean).map(otherContactHTML).join('')}</ul>
  </section>`;
}
function needHTML(need) {
  return `<section aria-labelledby="need-heading">
    <nav class="finder-nav" aria-label="Support guide"><a href="#start">All support routes</a></nav>
    <h1 id="need-heading" tabindex="-1">${esc(need.title)}</h1>
    ${need.note ? `<p class="need-note${need.id === 19 ? ' safety-note' : ''}">${esc(need.note)}</p>` : ''}
    ${serviceList(need.services)}
    ${accessHelpHTML([need.id])}
  </section>`;
}
const oldAreaToRoute = { moving: 'moving', work: 'concern', children: 'concern', relationships: 'concern', health: 'concern', connection: 'concern' };
const oldSituationToRoute = { posting: 'moving', leaving: 'leaving', 'work-money': 'concern', childcare: 'concern', 'child-young': 'concern', mental: 'concern', 'health-care': 'concern', apart: 'apart', unsafe: 'concern', bereavement: 'concern', 'finding-help': 'concern' };
const oldChoiceToGroup = {
  'concern/housing': 'home-money', 'concern/work-money': 'home-money',
  'concern/parenting': 'children', 'concern/school-youth': 'children',
  'concern/health': 'health-care', 'concern/caring': 'health-care',
  'concern/relationships': 'relationships-loss', 'concern/grief': 'relationships-loss',
  'concern/connection': 'defence-community', 'concern/benefits': 'defence-community',
  'leaving/injury-care': 'health-care',
  'leaving/housing-money': 'home-money'
};
function render() {
  const hash = location.hash;
  const situation = hash.match(/^#situation\/([a-z0-9-]+)(?:\/([a-z0-9-]+))?$/);
  const groupMatch = hash.match(/^#group\/([a-z0-9-]+)$/);
  const oldArea = hash.match(/^#area\/([a-z0-9-]+)$/);
  const needMatch = hash.match(/^#need\/(\d+)$/);
  const id = situation?.[1] || (oldArea && oldAreaToRoute[oldArea[1]]);
  const journey = journeyById.get(id) || journeyById.get(oldSituationToRoute[id]);
  const choice = situation?.[2] && journey ? journey.choices.find(item => item.id === situation[2]) : null;
  const group = groupMatch ? concernGroupById.get(groupMatch[1]) : !choice && situation?.[2] ? concernGroupById.get(oldChoiceToGroup[`${situation[1]}/${situation[2]}`]) : null;
  const need = needMatch ? needById.get(needMatch[1]) : null;
  finder.innerHTML = choice ? choiceHTML(journey, choice) : group ? concernGroupHTML(group) : journey ? journeyHTML(journey) : hash === '#help' || hash === '#not-sure' ? humanHelpHTML() : need ? needHTML(need) : homeHTML();
  if (hash) {
    window.scrollTo({ top: 0, behavior: 'auto' });
    finder.querySelector('h1[tabindex="-1"]')?.focus({ preventScroll: true });
  }
}
window.addEventListener('hashchange', render);
render();
