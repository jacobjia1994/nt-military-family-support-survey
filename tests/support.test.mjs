import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { areas, needs, services } from '../support-data.mjs';
import { journeys, concernGroups, concernDirectChoiceIds, humanHelpServiceIds, secondaryNeedIds } from '../support-journeys.mjs';

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


test('four routes keep each visible choice small and retain all source needs', () => {
  const knownNeeds = new Set(needs.map(need => need.id));
  const knownServices = new Set(services.map(service => service.id));
  const knownRoutes = new Set(journeys.map(journey => journey.id));
  assert.deepEqual(journeys.map(journey => journey.id), ['moving', 'apart', 'leaving', 'concern']);
  assert.equal(knownRoutes.size, journeys.length);
  const reachable = new Set(secondaryNeedIds);
  for (const journey of journeys) {
    assert.ok(journey.title);
    assert.ok(journey.choices.length >= 5, `${journey.id} has specific next choices`);
    if (journey.id !== 'concern') assert.ok(journey.choices.length <= 9, `${journey.id} is scannable`);
    const choiceIds = new Set();
    for (const choice of journey.choices) {
      assert.ok(!choiceIds.has(choice.id), `${journey.id} has unique choice ${choice.id}`);
      choiceIds.add(choice.id);
      assert.ok(choice.title);
      assert.ok(choice.needIds?.length, `${journey.id}/${choice.id} has an evidence anchor`);
      for (const id of choice.needIds) reachable.add(id);
      assert.ok(choice.primaryServiceIds?.length >= 1 && choice.primaryServiceIds.length <= 4, `${journey.id}/${choice.id} leads to a short answer`);
      for (const id of [...choice.primaryServiceIds, ...(choice.moreServiceIds || [])]) assert.ok(knownServices.has(id), `${journey.id}/${choice.id} service ${id}`);
      if (choice.quickHelp) {
        assert.ok(choice.quickHelp.title && choice.quickHelp.contacts.length, `${journey.id}/${choice.id} has labelled quick contacts`);
        for (const contact of choice.quickHelp.contacts) {
          assert.ok(knownServices.has(contact.id), `${journey.id}/${choice.id} quick contact ${contact.id}`);
          assert.ok(services.find(service => service.id === contact.id).phone, `${contact.id} has a callable number`);
        }
      }
      if (choice.related) {
        const relatedRoute = journeys.find(item => item.id === choice.related.routeId);
        assert.ok(relatedRoute?.choices.some(item => item.id === choice.related.choiceId), `${journey.id}/${choice.id} has a working related route`);
      }
    }
  }
  const concern = journeys.find(journey => journey.id === 'concern');
  assert.equal(concernGroups.length, 5);
  const groupedIds = concernGroups.flatMap(group => {
    assert.ok(group.title && group.choiceIds.length >= 2 && group.choiceIds.length <= 5, `${group.id} is short`);
    return group.choiceIds;
  });
  assert.deepEqual(concernDirectChoiceIds, ['safety']);
  assert.equal(new Set([...groupedIds, ...concernDirectChoiceIds]).size, concern.choices.length);
  assert.deepEqual([...groupedIds, ...concernDirectChoiceIds].sort(), concern.choices.map(choice => choice.id).sort());
  for (const id of humanHelpServiceIds) assert.ok(knownServices.has(id), `human help service ${id}`);
  assert.deepEqual([...reachable].sort((a, b) => a - b), [...knownNeeds].sort((a, b) => a - b));
  assert.deepEqual(secondaryNeedIds, [30, 31, 33, 36], 'Access modifiers and feedback stay outside the main taxonomy');
});

test('representative NT situations show a fitting first action', () => {
  const route = id => journeys.find(journey => journey.id === id);
  const choice = (routeId, choiceId) => route(routeId).choices.find(item => item.id === choiceId);
  for (const [routeId, choiceId, first] of [
    ['moving', 'arriving', 'dmfs-helpline'], ['moving', 'housing', 'dha-housing'],
    ['moving', 'school', 'school-change'], ['apart', 'child', 'parentline'],
    ['leaving', 'already-left', 'veteran-wellbeing-agency'], ['leaving', 'caring', 'carer-gateway'],
    ['leaving', 'money', 'national-debt-helpline'],
    ['concern', 'homelessness', 'nt-central-intake'], ['concern', 'reserve-work', 'reserve-protection'],
    ['concern', 'money', 'national-debt-helpline'], ['concern', 'young-person', 'kids-helpline'],
    ['concern', 'doctor', 'general-health-nt'], ['concern', 'disability', 'ndis'],
    ['concern', 'carer', 'carer-gateway'], ['concern', 'suicide-loss', 'standby-nt'],
    ['concern', 'safety', '1800respect']
  ]) assert.equal(choice(routeId, choiceId).primaryServiceIds[0], first, `${routeId}/${choiceId}`);
  assert.ok(choice('concern', 'homelessness').quickHelpFirst);
  assert.ok(choice('concern', 'homelessness').quickHelp.contacts.some(contact => contact.id === 'salvos-alice-waterhole'));
  assert.ok(choice('concern', 'homelessness').quickHelp.contacts.some(contact => contact.id === 'salvos-katherine-doorways'));
  assert.ok(choice('concern', 'young-person').quickHelp.contacts.some(contact => contact.id === 'headspace-alice'));
  assert.ok(choice('concern', 'doctor').primaryServiceIds.includes('imsick'));
  assert.ok(choice('concern', 'specialist-travel').primaryServiceIds.includes('defence-remote-travel'));
  assert.ok(choice('concern', 'mental').quickHelp.contacts.some(contact => contact.id === 'wurli-sewb'));
  for (const id of ['sarc-darwin', 'sarc-alice', 'sarc-katherine', 'sarc-tennant']) {
    assert.ok(choice('concern', 'safety').quickHelp.contacts.some(contact => contact.id === id));
  }
  assert.ok(humanHelpServiceIds.includes('veteran-wellbeing-agency'));
});

test('grouped paths and high-need results render the correct action without opening More', async () => {
  const previous = { document: globalThis.document, window: globalThis.window, location: globalThis.location };
  const finder = { innerHTML: '', querySelector: () => ({ focus() {} }) };
  let onHashChange;
  globalThis.document = { querySelector: () => finder };
  globalThis.window = { addEventListener: (_event, callback) => { onHashChange = callback; }, scrollTo() {} };
  globalThis.location = { hash: '#situation/concern/safety' };
  try {
    await import('../support.js?render-test');
    const safety = finder.innerHTML;
    assert.ok(safety.indexOf('1800RESPECT') < safety.indexOf('After sexual assault: NT referral centres'));
    assert.ok(safety.indexOf('tel:0889226472') < safety.indexOf('more-services'));
    assert.ok(safety.indexOf('tel:0889624361') < safety.indexOf('more-services'));
    assert.match(safety, /aria-label="Official website for 1800RESPECT"/);
    assert.match(safety, /aria-label="Access details for 1800RESPECT"/);
    assert.match(safety, /<strong>For:<\/strong> Anyone affected by domestic, family or sexual violence/);

    globalThis.location.hash = '#situation/concern';
    onHashChange();
    assert.match(finder.innerHTML, /#group\/home-money/);
    assert.match(finder.innerHTML, /#situation\/concern\/safety/);
    assert.doesNotMatch(finder.innerHTML, /#situation\/concern\/reserve-work/);

    globalThis.location.hash = '#group/children';
    onHashChange();
    assert.match(finder.innerHTML, /#situation\/concern\/young-person/);
    assert.doesNotMatch(finder.innerHTML, /#situation\/concern\/homelessness/);

    globalThis.location.hash = '#situation/concern/homelessness';
    onHashChange();
    const housing = finder.innerHTML;
    assert.ok(housing.indexOf('At risk of homelessness?') < housing.indexOf('Lutheran Care NT Central Intake'));
    assert.doesNotMatch(housing, /Defence Housing Australia/);
    assert.ok(housing.indexOf('tel:0889275189') < housing.indexOf('more-services'));
    assert.ok(housing.indexOf('tel:0889510200') < housing.indexOf('more-services'));
    assert.ok(housing.indexOf('tel:0889712265') < housing.indexOf('more-services'));

    globalThis.location.hash = '#situation/concern/work-money';
    onHashChange();
    assert.match(finder.innerHTML, /#situation\/concern\/money/);
  } finally {
    globalThis.document = previous.document;
    globalThis.window = previous.window;
    globalThis.location = previous.location;
  }
});


test('every provider record is reachable through a curated path or secondary access link', () => {
  const used = new Set([...humanHelpServiceIds, 'lifeline', 'open-arms', '1800respect']);
  for (const journey of journeys) for (const choice of journey.choices) {
    for (const id of [...choice.primaryServiceIds, ...(choice.moreServiceIds || [])]) used.add(id);
    for (const contact of choice.quickHelp?.contacts || []) used.add(contact.id);
  }
  for (const id of secondaryNeedIds) {
    for (const serviceId of needs.find(need => need.id === id).services) used.add(serviceId);
  }
  assert.deepEqual(services.filter(service => !used.has(service.id)).map(service => service.id), []);
});
