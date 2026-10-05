// Focused additions and access corrections verified against official sources, 30 September 2026.
// A contact route is not a guarantee of funding, clinical suitability, food or accommodation.
const checked = '2026-09-30';
const service = data => ({ ...data, sources: data.sources || [data.url], checked });
const catholiccareFinancialUrl = 'https://www.catholiccarent.org.au/our-service/financial-wellbeing-and-capability/';
const urgentCareNTUrl = 'https://nt.gov.au/wellbeing/emergencies-injuries-and-accidents/after-hours-medical-care';

export const sept30ReviewedServices = {
  'vinnies-nt-er': service({
    name: 'Vinnies NT — food and emergency relief',
    audience: 'People in financial hardship; you do not have to receive Centrelink',
    area: 'Darwin / Malak, Palmerston and Alice Springs',
    offer: 'Ask about food or grocery vouchers, essential items, bills or other urgent costs.',
    cost: 'Assessed emergency relief; the help available depends on your situation and local resources.',
    access: 'Call for assistance. Have photo ID and proof of income available. Malak accepts appointment bookings; the NT emergency-relief information line is 08 8948 8116.',
    hours: 'Walk-ins: Malak Wed 9am–noon; Palmerston Thu 9am–noon NT. Call about Alice Springs and appointments.',
    phone: '13 18 12',
    url: 'https://www.vinnies.org.au/nt/find-help/emergency-relief',
    action: 'Check local emergency relief',
    sources: ['https://www.vinnies.org.au/nt/find-help/emergency-relief']
  }),
  'salvos-darwin-doorways': service({
    name: 'Darwin Doorways — help with essentials',
    audience: 'People seeking emergency relief in Darwin',
    area: 'Darwin · House 49, 49 Mitchell Street',
    offer: 'Ask the Doorways team about emergency relief for your immediate needs.',
    cost: 'Relief is assessed; ask what help is available.',
    access: 'Call or visit Doorways during its emergency-relief hours. This is a day relief contact; the separate House 49 accommodation programme has different eligibility.',
    hours: 'Mon/Wed/Fri 9am–noon NT',
    phone: '08 8981 5994',
    url: 'https://www.salvationarmy.org.au/northernterritory/homelessness/darwin/',
    action: 'Read about Doorways emergency relief'
  }),
  'catholiccare-tiwi': service({
    name: 'CatholicCare NT — Tiwi money and essentials',
    audience: 'People needing financial counselling or emergency relief',
    area: 'Tiwi Islands · Wurrumiyanga',
    offer: 'Ask the local Financial Wellbeing and Capability team about debt, budgeting or emergency relief.',
    cost: 'Free support. Emergency relief is assessed.',
    access: 'You can refer yourself. Everyone can access the programme; people on Income Management are prioritised. Call before visiting or travelling.',
    hours: 'Call for local appointment and relief times',
    phone: '08 8978 3921',
    url: catholiccareFinancialUrl,
    extraUrl: 'mailto:tiwiislands@catholiccarent.org.au',
    extraLabel: 'Email the Tiwi team'
  }),
  'catholiccare-wadeye': service({
    name: 'CatholicCare NT — Wadeye money and essentials',
    audience: 'People needing financial counselling or emergency relief',
    area: 'Wadeye / Port Keats',
    offer: 'Ask the local Financial Wellbeing and Capability team about debt, budgeting or emergency relief.',
    cost: 'Free support. Emergency relief is assessed.',
    access: 'You can refer yourself. Everyone can access the programme; people on Income Management are prioritised. Call before visiting or travelling.',
    hours: 'Call for local appointment and relief times',
    phone: '08 8978 2515',
    url: catholiccareFinancialUrl,
    extraUrl: 'mailto:wadeye@catholiccarent.org.au',
    extraLabel: 'Email the Wadeye team'
  }),
  'east-arnhem-housing': service({
    name: 'Anglicare NT — East Arnhem tenancy support',
    audience: 'Individuals and families needing support to maintain their tenancy',
    area: 'East Arnhem · contact the Nhulunbuy team',
    offer: 'Ask about case management and practical help keeping a tenancy through the Housing Options Pathway Program.',
    cost: 'Ask the team about programme conditions and any costs.',
    access: 'Call about your location and tenancy needs. This programme supports an existing tenancy; it does not supply an overnight bed.',
    hours: 'Office Mon–Fri 8:30am–4:30pm NT',
    phone: '08 8939 3400',
    url: 'https://www.anglicare-nt.org.au/service/housing-options-pathway-program/'
  }),
  'urgent-care-darwin': service({
    name: 'Darwin Medicare Urgent Care Clinic',
    audience: 'Adults and children with an urgent illness or injury that is not an emergency',
    area: 'Darwin · 8 Osgood Drive, Eaton',
    offer: 'Walk-in assessment and treatment when a minor illness or injury cannot wait for your usual GP.',
    cost: 'Bulk billed for Medicare-eligible patients. Bring your Medicare card or number; ask about access if you are not covered.',
    access: 'No appointment or referral needed. Call for directions and current capacity. For life-threatening symptoms call 000 or go to an emergency department; routine or ongoing care belongs with your usual GP.',
    hours: 'Every day 8am–10pm NT, including public holidays',
    phone: '08 8919 8919',
    url: 'https://www.fcdhealth.org.au/dmucc',
    action: 'Clinic location and access',
    sources: ['https://www.fcdhealth.org.au/dmucc', urgentCareNTUrl, 'https://www.health.gov.au/ministers/the-hon-mark-butler-mp/media/darwin-medicare-urgent-care-clinic-now-open']
  }),
  'urgent-care-palmerston': service({
    name: 'Palmerston Medicare Urgent Care Clinic',
    audience: 'Adults and children with an urgent illness or injury that is not an emergency',
    area: 'Palmerston · 3 Gurd Street, Farrar',
    offer: 'Walk-in assessment and treatment when a minor illness or injury cannot wait for your usual GP.',
    cost: 'Bulk billed for Medicare-eligible patients. Bring your Medicare card or number; ask about access if you are not covered.',
    access: 'No appointment or referral needed. Enter at the rear of the Palmerston GP Super Clinic. On the phone choose option 2. For life-threatening symptoms call 000 or go to an emergency department; routine or ongoing care belongs with your usual GP.',
    hours: 'Every day 8am–10pm NT, including public holidays',
    phone: '08 8919 8919',
    url: 'https://www.fcdhealth.org.au/pmucc',
    action: 'Clinic location and access',
    sources: ['https://www.fcdhealth.org.au/pmucc', urgentCareNTUrl]
  }),
  'urgent-care-alice': service({
    name: 'Mparntwe Medicare Urgent Care Clinic',
    audience: 'People with an urgent illness or injury that is not an emergency',
    area: 'Alice Springs · Northside Shopping Complex, 1 Hearne Place, Baitling',
    offer: 'Walk-in assessment and treatment when an illness or injury cannot wait for your usual GP.',
    cost: 'Bulk-billed urgent care. Bring your Medicare card or number; ask the clinic about access if you are not covered.',
    access: 'No appointment or referral needed. Call before travelling if you need to check access. For life-threatening symptoms call 000 or go to an emergency department; use your usual GP for routine or ongoing care.',
    hours: 'Mon–Fri 10am–6pm; weekends/public holidays 1pm–5pm NT',
    phone: '08 7999 6442',
    url: urgentCareNTUrl,
    action: 'Clinic location and access',
    sources: [urgentCareNTUrl, 'https://www.caac.org.au/wp-content/uploads/2025/12/Congress-Board-Communique_December_2025.pdf', 'https://www.health.gov.au/find-a-medicare-ucc']
  }),
  'remote-health-clinics': service({
    name: 'Find your remote NT health clinic',
    audience: 'People living in or visiting remote NT communities',
    area: 'Remote Top End, East Arnhem, Big Rivers, Barkly and Central Australia',
    offer: 'Find the phone number, operator and hours for the health clinic in your community.',
    cost: 'Free contact list. Ask the clinic about care eligibility and any fees.',
    access: 'Choose your community and call its clinic. Hours and after-hours arrangements differ by clinic. If you are unsure where to get care, call healthdirect on 1800 022 222. In an emergency, call 000.',
    hours: 'Directory available anytime; clinic hours vary',
    url: 'https://nt.gov.au/wellbeing/remote-health/remote-health-services',
    action: 'Find your community clinic',
    sources: ['https://nt.gov.au/wellbeing/remote-health/remote-health-services', urgentCareNTUrl]
  }),
  'open-arms-crisis': service({
    name: 'Open Arms — help in a housing crisis',
    audience: 'Serving members, veterans and families eligible for Open Arms',
    area: 'Australia-wide · 24-hour phone assessment',
    offer: 'Talk through an immediate housing crisis and ask whether assessed short-term crisis accommodation or another local support pathway fits.',
    cost: 'Free phone support. Ask the team about accommodation arrangements and any costs.',
    access: 'Call directly and explain the crisis. Open Arms eligibility, clinical suitability and availability apply. The team assesses assistance; this is not a guaranteed bed or an ongoing housing service.',
    hours: '24 hours, every day',
    phone: '1800 011 046',
    url: 'https://www.dva.gov.au/what-we-help-with/get-urgent-support/homelessness-support',
    action: 'Read about urgent veteran housing support',
    extraUrl: 'https://www.openarms.gov.au/who-we-help/eligibility',
    extraLabel: 'Check Open Arms eligibility',
    sources: ['https://www.dva.gov.au/what-we-help-with/get-urgent-support/homelessness-support', 'https://www.dva.gov.au/what-we-help-with/get-urgent-support/crisis-contacts', 'https://www.dva.gov.au/news/latest-stories/homelessness-services-where-access-support', 'https://www.openarms.gov.au/who-we-help/eligibility']
  }),
  'askizzy-services': service({
    name: 'Ask Izzy — find another local service',
    audience: 'Anyone looking for a different service or several kinds of help',
    area: 'Australia-wide · online directory',
    offer: 'Search nearby food, housing, money, health, counselling, legal and other support.',
    cost: 'Free, anonymous search. Costs and eligibility vary at the listed providers.',
    access: 'Choose the type of help and your town or community, then contact a listed provider. You can search without signing in. Ask Izzy provides contacts; it does not supply food or book an overnight bed.',
    hours: 'Online directory available anytime',
    url: 'https://askizzy.org.au/',
    action: 'Search for another service',
    sources: ['https://askizzy.org.au/', 'https://about.askizzy.org.au/about/', 'https://askizzy.org.au/using-ask-izzy']
  })
};

// Apply only these patches after assembling the existing catalogue. Other service dates
// remain unchanged so that one focused review cannot imply a review of the whole directory.
export const sept30ServicePatches = {
  'open-arms': { checked },
  'open-arms-check': { checked },
  'defence-kids': { checked, area: 'NT activities based in Darwin · Australia-wide online groups' },
  'child-therapy-darwin': { checked },
  'child-therapy-remote': { checked },
  'child-therapy-katherine': { checked },
  'child-therapy-central': { checked },
  'housing-intake': {
    checked,
    access: 'The provider’s 22 September update still reports its phone line is down. Use the enquiry form; the published response time is within 48 business hours. This is intake and referral, rather than immediate overnight accommodation.'
  },
  'catholiccare': { checked },
  'catholiccare-palmerston': { checked },
  'catholiccare-katherine': { checked },
  'catholiccare-tennant': { checked },
  'askizzy-food': { checked },
  'askizzy-housing': { checked },
  'adf-imsick': {
    checked,
    audience: 'Current ADF personnel in Australia; onward care depends on Defence healthcare entitlements',
    cost: 'Free nurse advice. Funding and approval for onward treatment depend on your Defence healthcare entitlements.',
    access: 'Have your PMKeyS number and location ready. Tell the nurse your service status if you are unsure which support or treatment funding applies. For routine care, contact your usual health centre. This line cannot approve sick leave. In an emergency, call 000.'
  }
};

export function applySept30ServicePatches(catalog) {
  return Object.fromEntries(Object.entries(catalog).map(([id, record]) => [id, { ...record, ...(sept30ServicePatches[id] || {}) }]));
}

export const sept30CatalogReview = {
  version: 'defence-web-focused-verification-2026-09-30-v1',
  checked,
  newServiceIds: Object.keys(sept30ReviewedServices),
  patchedServiceIds: Object.keys(sept30ServicePatches),
  handbookSync: 'Independent focused verification; handover version is recorded by the main web task.'
};
