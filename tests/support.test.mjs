import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { areas, needs, services } from '../support-data.mjs';
import { journeys, secondaryNeedIds } from '../support-journeys.mjs';

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
  assert.match(services.find(s => s.id === 'nt-central-intake').access, /phone lines are down/i);
  assert.match(services.find(s => s.id === 'defence-childcare').access, /does not guarantee a place/i);
  assert.match(services.find(s => s.id === 'employer-support-payment').access, /not automatically to a family/i);
});

test('finder keeps urgent contacts in the footer and does not send responses', () => {
  assert.match(config, /url: 'support\.html'/);
  assert.match(page, /href="tel:000"/);
  assert.match(page, /href="tel:1800011046"/);
  assert.match(page, /href="tel:1800737732"/);
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


test('situation routes and secondary help make every need reachable without a 39-item menu', () => {
  const knownNeeds = new Set(needs.map(need => need.id));
  const knownServices = new Set(services.map(service => service.id));
  const knownJourneys = new Set(journeys.map(journey => journey.id));
  assert.equal(knownJourneys.size, journeys.length);
  const reachable = new Set(secondaryNeedIds);
  for (const journey of journeys) {
    assert.ok(journey.title);
    assert.ok(journey.startServices?.length || journey.choices.length, journey.id);
    assert.ok(journey.choices.length <= 8, `${journey.id} has a scannable next step`);
    for (const id of journey.startServices || []) assert.ok(knownServices.has(id), `${journey.id} start service ${id}`);
    for (const id of journey.coveredNeedIds || []) reachable.add(id);
    const choiceIds = new Set();
    for (const choice of journey.choices) {
      assert.ok(!choiceIds.has(choice.id), `${journey.id} has unique choice ${choice.id}`);
      choiceIds.add(choice.id);
      assert.ok(choice.title);
      assert.ok(choice.needIds?.length, `${journey.id}/${choice.id} has an evidence anchor`);
      for (const id of choice.needIds) reachable.add(id);
      for (const id of choice.serviceIds || []) assert.ok(knownServices.has(id), `${journey.id}/${choice.id} service ${id}`);
      if (choice.journeyId) assert.ok(knownJourneys.has(choice.journeyId), `${journey.id}/${choice.id} cross-route`);
    }
  }
  assert.deepEqual([...reachable].sort((a, b) => a - b), [...knownNeeds].sort((a, b) => a - b));
  assert.deepEqual(secondaryNeedIds, [36], 'Participation is secondary to finding help');
});

test('direct paths curate safe and relevant service starts', () => {
  const byId = new Map(journeys.map(journey => [journey.id, journey]));
  assert.ok(byId.get('leaving').startServices.includes('adf-transition'));
  assert.ok(byId.get('mental').startServices.includes('nt-mental-health-line'));
  assert.ok(!byId.get('mental').startServices.includes('darwin-mmhc'), 'Adult-only care is not offered to everyone');
  assert.ok(byId.get('unsafe').startServices.includes('1800respect'));
  assert.ok(byId.get('unsafe').startServices.includes('kwcc'), 'Katherine has a local route');
  assert.ok(byId.get('finding-help').startServices.includes('dmfs-helpline'));
  assert.ok(byId.get('bereavement').choices.some(choice => choice.needIds.includes(39)), 'Suicide bereavement remains distinct');
});
