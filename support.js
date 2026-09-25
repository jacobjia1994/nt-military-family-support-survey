import { areas, needs, services, searchNeeds } from './support-data.mjs?v=20260925-2';

const finder = document.querySelector('#finder');
const areaById = new Map(areas.map(area => [area.id, area]));
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
  '13yarn': 'For Aboriginal and Torres Strait Islander people.'
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
  const found = ids.map(id => serviceById.get(id)).filter(Boolean);
  return found.length ? `<ul class="service-list">${found.map(serviceHTML).join('')}</ul>` : '<p>No service is listed for this topic yet.</p>';
}
function homeHTML() {
  return `<section aria-labelledby="home-heading">
    <h1 id="home-heading" tabindex="-1">Find support in the NT</h1>
    <p class="home-lead">Choose a topic to see where to start.</p>
    <ul class="area-list">${areas.map(area => `<li><a href="#area/${esc(area.id)}">${esc(area.title)}</a></li>`).join('')}</ul>
    <div class="secondary-tools">
      <a href="#not-sure">Not sure where to start?</a>
      <details class="finder-search"><summary>Search all topics</summary>
        <label for="topic-search">Search by situation</label>
        <input class="text-input" id="topic-search" type="search" autocomplete="off" placeholder="For example, housing or school">
        <div class="search-results" id="search-results" aria-live="polite"></div>
      </details>
    </div>
  </section>`;
}
function areaHTML(area) {
  const topics = needs.filter(need => need.area === area.id);
  return `<section aria-labelledby="area-heading">
    <nav class="finder-nav" aria-label="Support guide"><a href="#start">All topics</a></nav>
    <h1 id="area-heading" tabindex="-1">${esc(area.title)}</h1>
    <ul class="topic-list">${topics.map(need => `<li><a href="#need/${need.id}">${esc(need.title)}</a></li>`).join('')}</ul>
  </section>`;
}
function needHTML(need) {
  const area = areaById.get(need.area);
  const safety = need.id === 19;
  return `<section aria-labelledby="need-heading">
    <nav class="finder-nav" aria-label="Support guide"><a href="#area/${esc(area.id)}">${esc(area.title)}</a> <span aria-hidden="true">/</span> <a href="#start">All topics</a></nav>
    <h1 id="need-heading" tabindex="-1">${esc(need.title)}</h1>
    ${need.note ? `<p class="need-note${safety ? ' safety-note' : ''}">${esc(need.note)}</p>` : ''}
    ${serviceList(need.services)}
    ${need.services.includes('dmfs-helpline') ? '' : '<p class="need-help">Not sure which service fits? <a href="tel:1800624608">Call the Defence Member and Family Helpline on 1800 624 608.</a></p>'}
  </section>`;
}
function unsureHTML() {
  return `<section aria-labelledby="unsure-heading">
    <nav class="finder-nav" aria-label="Support guide"><a href="#start">All topics</a></nav>
    <h1 id="unsure-heading" tabindex="-1">Not sure where to start?</h1>
    <p class="home-lead">These teams can help you find a starting point.</p>
    ${serviceList(['dmfs-helpline','dmfs-darwin','dmfs-tindal','darwin-vfwc'])}
  </section>`;
}
function showSearch(query) {
  const target = finder.querySelector('#search-results');
  if (!target) return;
  const matches = searchNeeds(query);
  if (!query.trim()) { target.innerHTML = ''; return; }
  target.innerHTML = matches.length
    ? `<p>${matches.length} ${matches.length === 1 ? 'topic' : 'topics'} found</p><ul class="search-list">${matches.map(need => `<li><a href="#need/${need.id}">${esc(need.title)}</a></li>`).join('')}</ul>`
    : '<p>No matching topic. Try a broader word or choose a category above.</p>';
}
function render() {
  const [, kind, value] = location.hash.match(/^#(area|need)\/(.+)$/) || [];
  const area = kind === 'area' ? areaById.get(value) : null;
  const need = kind === 'need' ? needById.get(value) : null;
  finder.innerHTML = area ? areaHTML(area) : need ? needHTML(need) : location.hash === '#not-sure' ? unsureHTML() : homeHTML();
  if (!area && !need && location.hash !== '#not-sure') {
    finder.querySelector('#topic-search').addEventListener('input', event => showSearch(event.target.value));
  }
  if (location.hash) {
    window.scrollTo({ top: 0, behavior: 'auto' });
    finder.querySelector('h1[tabindex="-1"]')?.focus({ preventScroll: true });
  }
}
window.addEventListener('hashchange', render);
render();
