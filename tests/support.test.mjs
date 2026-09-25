import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { areas, needs, services } from '../support-data.mjs';
import { journeys, humanHelpServiceIds, secondaryNeedIds } from '../support-journeys.mjs';

const page = readFileSync(new URL('../support.html', import.meta.url), 'utf8');
const config = readFileSync(new URL('../thank-you-resource.js', import.meta.url), 'utf8');
const scripts = readFileSync(new URL('../support.js', import.meta.url), 'utf8');

test('all 39 PDF needs retain source pages and valid service references', () => {
  assert.equal(areas.length, 6);
  assert.deepEqual(needs.map(need => need.id).sort((a, b) => a - b), Array.from({ length: 39 }, (_, i) => i + 1));
  const areaIds = new Set(areas.map(area => area.id));
  const serviceIds = new Set(services.map(service => service.id));
  assert.equal(areaIds.size, areas.length);
  assert.equal(serviceIds.size, services.length);
  for (const need of needs) {
    assert.ok(areaIds.has(need.area), `Need ${need.id} has an area`);
    assert.ok(need.pdfPage >= 1 && need.pdfPage <= 55, `Need ${need.id} has a source page`);
    assert.ok(need.services.length, `Need ${need.id} has a service route`);
    for (const id of need.services) assert.ok(serviceIds.has(id), `Need ${need.id} refers to ${id}`);
  }
  for (const area of areas) assert.ok(needs.some(need => need.area === area.id), `Area ${area.id} is useful`);
});

test('public service links use official HTTPS pages and state who and how to access support', () => {
  for (const service of services) {
    const url = new URL(service.url);
    assert.equal(url.protocol, 'https:', service.id);
    assert.equal(url.username, '', service.id);
    assert.equal(url.password, '', service.id);
    for (const field of ['name','area','for','offers','access']) assert.ok(service[field], `${service.id} has ${field}`);
  }
  assert.match(services.find(s => s.id === 'nt-central-intake').access, /phone lines.*down/i);
  assert.match(services.find(s => s.id === 'defence-childcare').access, /does not guarantee a place/i);
  assert.match(services.find(s => s.id === 'employer-support-payment').access, /not automatically to a family/i);
});

test('finder keeps urgent contacts in the footer and does not send responses', () => {
  assert.match(config, /url: 'support\.html'/);
  assert.match(page, /href="tel:000"/);
  assert.match(page, /href="tel:1800011046"/);
  assert.match(page, /href="tel:1800737732"/);
  assert.match(page, /href="tel:131114"/);
  assert.ok(page.indexOf('<footer') < page.indexOf('href="tel:000"'));
  assert.doesNotMatch(page + scripts, /Choose a topic to see where to start|Search all topics/);
  assert.match(page, /connect-src 'none'/);
  assert.doesNotMatch(page + scripts, /\b(?:fetch|XMLHttpRequest|WebSocket|sendBeacon|localStorage|sessionStorage|indexedDB|document\.cookie)\b/);
  assert.doesNotMatch(page, /<script\b[^>]*src="https?:/);
});


test('high-consequence situations lead to specific local or specialist routes', () => {
  const byId = new Map(needs.map(need => [need.id, need]));
  for (const [need, service] of [[2, 'adf-equip'], [5, 'cowork-coplay'], [10, 'kentish-fdc'], [10, 'nt-in-home-care'], [19, 'kwcc'], [26, 'nt-telehealth'], [33, 'safe-zone'], [38, 'legacy-nt'], [39, 'thirrili']]) {
    assert.ok(byId.get(need).services.includes(service), `Need ${need} reaches ${service}`);
  }
});


test('four circumstance routes and secondary access links reach all 39 source needs', () => {
  const knownNeeds = new Set(needs.map(need => need.id));
  const knownServices = new Set(services.map(service => service.id));
  const knownRoutes = new Set(journeys.map(journey => journey.id));
  assert.deepEqual(journeys.map(journey => journey.id), ['moving', 'apart', 'leaving', 'concern']);
  assert.equal(knownRoutes.size, journeys.length);
  const reachable = new Set(secondaryNeedIds);
  for (const journey of journeys) {
    assert.ok(journey.title);
    assert.ok(journey.choices.length >= 5, `${journey.id} has specific next choices`);
    assert.ok(journey.choices.length <= (journey.id === 'concern' ? 13 : 7), `${journey.id} is scannable`);
    const choiceIds = new Set();
    for (const choice of journey.choices) {
      assert.ok(!choiceIds.has(choice.id), `${journey.id} has unique choice ${choice.id}`);
      choiceIds.add(choice.id);
      assert.ok(choice.title);
      assert.ok(choice.needIds?.length, `${journey.id}/${choice.id} has an evidence anchor`);
      for (const id of choice.needIds) reachable.add(id);
      assert.ok(choice.primaryServiceIds?.length >= 2 && choice.primaryServiceIds.length <= 4, `${journey.id}/${choice.id} leads to a short answer`);
      for (const id of [...choice.primaryServiceIds, ...(choice.moreServiceIds || [])]) assert.ok(knownServices.has(id), `${journey.id}/${choice.id} service ${id}`);
    }
  }
  for (const id of humanHelpServiceIds) assert.ok(knownServices.has(id), `human help service ${id}`);
  assert.deepEqual([...reachable].sort((a, b) => a - b), [...knownNeeds].sort((a, b) => a - b));
  assert.deepEqual(secondaryNeedIds, [30, 31, 33, 36], 'Access modifiers and feedback stay outside the main taxonomy');
});

test('representative NT scenarios have an immediate fitting contact after the second choice', () => {
  const route = id => journeys.find(journey => journey.id === id);
  const choice = (routeId, choiceId) => route(routeId).choices.find(item => item.id === choiceId);
  assert.ok(choice('moving', 'school').primaryServiceIds.includes('school-change'));
  assert.ok(choice('moving', 'housing').primaryServiceIds.includes('dha-housing'));
  assert.ok(choice('apart', 'child').primaryServiceIds.includes('adf-equip'));
  assert.ok(choice('leaving', 'transition').primaryServiceIds.includes('nt-transition-centre'));
  assert.ok(choice('concern', 'childcare').primaryServiceIds.includes('kentish-fdc'));
  assert.ok(choice('concern', 'mental').primaryServiceIds.includes('adf-allhours'));
  assert.ok(!choice('concern', 'mental').primaryServiceIds.includes('darwin-mmhc'), 'Adult-only local care is not offered to everyone');
  assert.ok(choice('concern', 'safety').primaryServiceIds.includes('1800respect'));
  assert.ok(choice('concern', 'safety').primaryServiceIds.includes('wossca-alice'), 'Alice Springs has a local safety route');
  assert.ok(choice('concern', 'grief').primaryServiceIds.includes('dva-death-support'));
  assert.ok(humanHelpServiceIds.includes('veteran-wellbeing-agency'));
});


test('every provider record is reachable through a curated path or secondary access link', () => {
  const used = new Set([...humanHelpServiceIds, 'lifeline', 'open-arms', '1800respect']);
  for (const journey of journeys) for (const choice of journey.choices) {
    for (const id of [...choice.primaryServiceIds, ...(choice.moreServiceIds || [])]) used.add(id);
  }
  for (const id of secondaryNeedIds) {
    for (const serviceId of needs.find(need => need.id === id).services) used.add(serviceId);
  }
  assert.deepEqual(services.filter(service => !used.has(service.id)).map(service => service.id), []);
});
