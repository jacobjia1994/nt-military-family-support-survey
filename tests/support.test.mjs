import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { areas, needs, services, searchNeeds } from '../support-data.mjs';

const page = readFileSync(new URL('../support.html', import.meta.url), 'utf8');
const config = readFileSync(new URL('../thank-you-resource.js', import.meta.url), 'utf8');
const scripts = readFileSync(new URL('../support.js', import.meta.url), 'utf8');

test('all 39 PDF needs have one discoverable area and a live service route', () => {
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

test('finder is separate from responses and keeps urgent routes directly visible', () => {
  assert.match(config, /url: 'support\.html'/);
  assert.match(page, /href="tel:000"/);
  assert.match(page, /href="tel:1800011046"/);
  assert.match(page, /href="tel:1800737732"/);
  assert.match(page, /connect-src 'none'/);
  assert.doesNotMatch(page + scripts, /\b(?:fetch|XMLHttpRequest|WebSocket|sendBeacon|localStorage|sessionStorage|indexedDB|document\.cookie)\b/);
  assert.doesNotMatch(page, /<script\b[^>]*src="https?:/);
});


test('search finds whole-word needs without substring collisions', () => {
  assert.ok(searchNeeds('rent').some(need => need.id === 7));
  assert.ok(searchNeeds('rental').some(need => need.id === 7));
  assert.ok(searchNeeds('school').some(need => need.id === 13));
  assert.ok(searchNeeds('school').some(need => need.id === 14));
  assert.ok(searchNeeds('interpreter').some(need => need.id === 30));
  assert.ok(searchNeeds('rent').every(need => !need.title.toLowerCase().includes('parenting')));
});
