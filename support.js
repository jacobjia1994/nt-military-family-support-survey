import { areas, needs, services, searchNeeds } from './support-data.mjs';

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

function serviceHTML(service) {
  const url = external(service.url);
  if (!url) return '';
  return `<li class="service-item">
    <p class="service-area">${esc(service.area)}</p>
    <h3>${esc(service.name)}</h3>
    <p>${esc(service.offers)}</p>
    <p><strong>For:</strong> ${esc(service.for)}</p>
    <p class="service-access"><strong>Before you go:</strong> ${esc(service.access)}</p>
    <div class="service-actions">
      <a class="button secondary" href="${esc(url)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">Open official website</a>
      ${service.phone ? `<a href="tel:${telephone(service.phone)}">Call ${esc(service.phone)}</a>` : ''}
    </div>
  </li>`;
}
function serviceList(ids) {
  const found = ids.map(id => serviceById.get(id)).filter(Boolean);
  return found.length ? `<ul class="service-list">${found.map(serviceHTML).join('')}</ul>` : '<p class="service-empty">No service is listed for this topic yet.</p>';
}
function homeHTML() {
  return `<section aria-labelledby="choose-area">
    <h2 id="choose-area" tabindex="-1">What would you like help with?</h2>
    <p class="finder-lead">Choose a broad area, then a situation. You will see places to contact on the next screen.</p>
    <ul class="area-list">${areas.map(area => `<li><a href="#area/${esc(area.id)}"><strong>${esc(area.title)}</strong><span>${esc(area.description)}</span></a></li>`).join('')}</ul>
    <div class="uncertain-route"><p>Not sure which area fits?</p><a href="#not-sure">Show me good starting points</a></div>
    <section class="finder-search" aria-labelledby="search-title">
      <h2 id="search-title">Or search for a situation</h2>
      <label for="topic-search">Search the topics in this guide</label>
      <input class="text-input" id="topic-search" type="search" autocomplete="off" placeholder="For example, housing or school">
      <div class="search-results" id="search-results" aria-live="polite"></div>
    </section>
  </section>`;
}
function areaHTML(area) {
  const topics = needs.filter(need => need.area === area.id);
  return `<section aria-labelledby="area-heading">
    <nav class="finder-nav" aria-label="Support guide"><a href="#start">← All support areas</a></nav>
    <h2 id="area-heading" tabindex="-1">${esc(area.title)}</h2>
    <p class="finder-lead">${esc(area.description)} Choose the situation that fits best. You can come back and try another.</p>
    <ul class="topic-list">${topics.map(need => `<li><a href="#need/${need.id}"><strong>${esc(need.title)}</strong></a></li>`).join('')}</ul>
  </section>`;
}
function needHTML(need) {
  const area = areaById.get(need.area);
  return `<section aria-labelledby="need-heading">
    <nav class="finder-nav" aria-label="Support guide"><a href="#start">All support areas</a> / <a href="#area/${esc(area.id)}">${esc(area.title)}</a></nav>
    <h2 id="need-heading" tabindex="-1">${esc(need.title)}</h2>
    <p class="need-context">These are places to start. Each provider can explain whether its service fits your circumstances.</p>
    ${need.note ? `<p class="finder-lead">${esc(need.note)}</p>` : ''}
    ${serviceList(need.services)}
    <div class="service-followup"><h3>Need help choosing?</h3><p>The <a href="tel:1800624608">Defence Member and Family Helpline (1800 624 608)</a> can help ADF members and families find a starting point.</p></div>
  </section>`;
}
function unsureHTML() {
  return `<section aria-labelledby="unsure-heading">
    <nav class="finder-nav" aria-label="Support guide"><a href="#start">← All support areas</a></nav>
    <h2 id="unsure-heading" tabindex="-1">Not sure where to start?</h2>
    <p class="finder-lead">Tell one of these teams what is happening. They can discuss which support may fit, including options outside this guide.</p>
    ${serviceList(['dmfs-helpline','dmfs-darwin','dmfs-tindal','darwin-vfwc'])}
  </section>`;
}
function showSearch(query) {
  const target = finder.querySelector('#search-results');
  if (!target) return;
  const matches = searchNeeds(query);
  if (!query.trim()) { target.innerHTML = ''; return; }
  target.innerHTML = matches.length
    ? `<p>${matches.length} ${matches.length === 1 ? 'topic' : 'topics'} found</p><ul class="search-list">${matches.map(need => `<li><a href="#need/${need.id}"><strong>${esc(need.title)}</strong><span>${esc(areaById.get(need.area).title)}</span></a></li>`).join('')}</ul>`
    : '<p>No matching topic. Try a broader word, or use “Not sure where to start?” above.</p>';
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
    const heading = finder.querySelector('h2[tabindex="-1"]');
    if (area || need || location.hash === '#not-sure') (finder.querySelector('.finder-nav') || heading)?.scrollIntoView({ block: 'start', behavior: 'auto' });
    else window.scrollTo({ top: 0, behavior: 'auto' });
    heading?.focus({ preventScroll: true });
  }
}
window.addEventListener('hashchange', render);
render();
