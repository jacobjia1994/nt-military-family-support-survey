import { needs, services } from './support-data.mjs?v=20260925-4';
import { journeys } from './support-journeys.mjs?v=20260925-1';

const finder = document.querySelector('#finder');
const journeyById = new Map(journeys.map(journey => [journey.id, journey]));
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
  'dmfs-helpline': 'For ADF members and families.',
  'dmfs-tindal': 'Arrange base access before visiting.',
  'open-arms': 'For eligible Defence and veteran families.',
  'darwin-mmhc': 'For adults 18 and over.',
  'katherine-mmhc': 'For adults 18 and over; confirm its temporary address.',
  'nt-central-intake': 'For homelessness risk, not general housing allocation. Phone unavailable; use the online form.',
  'bravery-financial': 'For veterans and eligible family members.',
  peap: 'Register before using a service; approval conditions apply.',
  'dawn-house': 'For women and children facing family violence.',
  'standby-nt': 'Phone support 6 am–10 pm, seven days a week.',
  'defence-childcare': 'Priority does not guarantee a place; fees apply.',
  'defence-education': 'Defence conditions and an application apply.',
  'school-mentor': 'Only at participating schools.',
  'headspace-darwin': 'Ages 12–25; not an emergency service.',
  'headspace-palmerston': 'Ages 12–25; not an emergency service.',
  'headspace-katherine': 'Ages 12–25; not an emergency service.',
  'kids-helpline': 'For ages 5–25.',
  ndis: 'Eligibility is assessed; support is not guaranteed.',
  'pats-nt': 'Check eligibility before arranging travel.',
  qlife: 'Not an emergency service.',
  'employer-support-payment': 'For employers or self-employed reservists, not a family payment.',
  '13yarn': 'For Aboriginal and Torres Strait Islander people.',
  'nt-in-home-care': 'Eligibility is assessed; care and places are not guaranteed.',
  kwcc: 'For women and children in the Katherine region; call about availability.',
  'safe-zone': 'Anonymous support; caller ID is visible unless hidden.',
  'legacy-nt': 'For eligible bereaved veteran families.',
  'amber-nt': 'For loss of a child through age 18.',
  thirrili: 'For First Nations families after a traumatic death.'
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
      ${service.phone ? `<a class="button primary" href="tel:${telephone(service.phone)}">Call ${esc(service.phone)}</a>` : `<a class="button primary" href="${esc(url)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">Open official website</a>`}
      ${service.phone ? `<a class="service-website" href="${esc(url)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">Official website</a>` : ''}
    </div>
    <details class="service-details"><summary>Who can use it and what to check</summary>
      <p><strong>Who:</strong> ${esc(service.for)}</p>
      <p><strong>Access:</strong> ${esc(service.access)}</p>
    </details>
  </li>`;
}
function serviceList(ids) {
  const found = [...new Set(ids)].map(id => serviceById.get(id)).filter(Boolean);
  return found.length ? `<ul class="service-list">${found.map(serviceHTML).join('')}</ul>` : '<p>No service is listed for this topic yet.</p>';
}
function homeHTML() {
  return `<section aria-labelledby="home-heading">
    <h1 id="home-heading" tabindex="-1">Find support in the NT</h1>
    <ul class="situation-list">${journeys.map(journey => `<li><a href="#situation/${esc(journey.id)}">${esc(journey.title)}</a></li>`).join('')}</ul>
  </section>`;
}
function choiceLink(journey, choice) {
  return choice.journeyId ? `#situation/${choice.journeyId}` : `#situation/${journey.id}/${choice.id}`;
}
function choiceList(journey) {
  return `<ul class="choice-list">${journey.choices.map(choice => `<li><a href="${esc(choiceLink(journey, choice))}">${esc(choice.title)}</a></li>`).join('')}</ul>`;
}
function accessHelpHTML(currentNeedIds = []) {
  const links = [
    !currentNeedIds.includes(30) && '<a href="#need/30">Language and interpreting help</a>',
    !currentNeedIds.includes(33) && '<a href="#need/33">Privacy when asking for help</a>'
  ].filter(Boolean);
  return links.length ? `<details class="access-help"><summary>Need an interpreter or a private way to ask?</summary><p>${links.join(' · ')}</p></details>` : '';
}
function journeyHTML(journey) {
  const direct = Boolean(journey.startServices?.length);
  return `<section aria-labelledby="journey-heading">
    <nav class="finder-nav" aria-label="Support guide"><a href="#start">All situations</a></nav>
    <h1 id="journey-heading" tabindex="-1">${esc(journey.title)}</h1>
    ${journey.note ? `<p class="need-note${journey.id === 'unsafe' ? ' safety-note' : ''}">${esc(journey.note)}</p>` : ''}
    ${direct ? `<h2 class="section-heading">Start here</h2>${serviceList(journey.startServices)}` : ''}
    ${journey.choices.length ? `${direct ? '<h2 class="section-heading related-heading">More specific help</h2>' : ''}${choiceList(journey)}` : ''}
    ${direct ? accessHelpHTML(journey.coveredNeedIds || []) : ''}
  </section>`;
}
function choiceHTML(journey, choice) {
  const selected = (choice.needIds || []).map(id => needById.get(String(id))).filter(Boolean);
  const serviceIds = choice.serviceIds || selected.flatMap(need => need.services);
  const notes = [choice.note, ...selected.map(need => need.note)].filter(Boolean);
  return `<section aria-labelledby="choice-heading">
    <nav class="finder-nav" aria-label="Support guide"><a href="#situation/${esc(journey.id)}">${esc(journey.title)}</a> <span aria-hidden="true">/</span> <a href="#start">All situations</a></nav>
    <h1 id="choice-heading" tabindex="-1">${esc(choice.title)}</h1>
    ${notes.map(note => `<p class="need-note${selected.some(need => need.id === 19) ? ' safety-note' : ''}">${esc(note)}</p>`).join('')}
    ${serviceList(serviceIds)}
    ${accessHelpHTML(choice.needIds || [])}
  </section>`;
}
function needHTML(need) {
  return `<section aria-labelledby="need-heading">
    <nav class="finder-nav" aria-label="Support guide"><a href="#start">All situations</a></nav>
    <h1 id="need-heading" tabindex="-1">${esc(need.title)}</h1>
    ${need.note ? `<p class="need-note${need.id === 19 ? ' safety-note' : ''}">${esc(need.note)}</p>` : ''}
    ${serviceList(need.services)}
    ${accessHelpHTML([need.id])}
  </section>`;
}
const legacyAreaJourney = { moving: 'posting', work: 'work-money', children: 'child-young', relationships: 'apart', health: 'health-care', connection: 'finding-help' };
function render() {
  const hash = location.hash;
  const situation = hash.match(/^#situation\/([a-z0-9-]+)(?:\/([a-z0-9-]+))?$/);
  const oldArea = hash.match(/^#area\/([a-z0-9-]+)$/);
  const needMatch = hash.match(/^#need\/(\d+)$/);
  const journey = situation ? journeyById.get(situation[1]) : oldArea ? journeyById.get(legacyAreaJourney[oldArea[1]]) : hash === '#not-sure' ? journeyById.get('finding-help') : null;
  const choice = situation?.[2] && journey ? journey.choices.find(item => item.id === situation[2]) : null;
  const need = needMatch ? needById.get(needMatch[1]) : null;
  finder.innerHTML = choice ? choiceHTML(journey, choice) : journey ? journeyHTML(journey) : need ? needHTML(need) : homeHTML();
  if (hash) {
    window.scrollTo({ top: 0, behavior: 'auto' });
    finder.querySelector('h1[tabindex="-1"]')?.focus({ preventScroll: true });
  }
}
window.addEventListener('hashchange', render);
render();
