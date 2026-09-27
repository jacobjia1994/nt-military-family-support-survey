// Current provider sources checked for the independent review follow-up.
// These entries distinguish a contact route from eligibility, funding and availability.
const service = data => ({ ...data, sources: data.sources || [data.url], checked: '2026-09-27' });

export const astraReviewedServices = {
  'nt-mental-health-line': service({
    name: 'NT Mental Health Line — urgent advice',
    audience: 'People in the NT needing mental health support, or concerned about someone else',
    area: 'NT-wide · phone',
    offer: 'Get urgent mental health advice and help finding the right assessment or local support.',
    cost: 'Free, confidential telephone support.',
    access: 'Call about yourself or someone you are worried about. The team can assess the next step; an appointment or home visit is not automatic. If someone is in immediate danger, call 000.',
    hours: '24 hours, every day',
    phone: '1800 682 288',
    url: 'https://nt.gov.au/wellbeing/mental-health/24-hour-mental-health-hotlines',
    sources: [
      'https://nt.gov.au/wellbeing/mental-health/24-hour-mental-health-hotlines',
      'https://nt.gov.au/community/parents-and-families/support-services/mental-health',
      'https://nt.gov.au/wellbeing/mental-health/hospital-mental-health-services/top-end'
    ]
  }),
  'catherine-booth-house': service({
    name: 'Catherine Booth House — safe accommodation for women',
    audience: 'Women aged 18 or older experiencing, or at risk of, domestic or family violence',
    area: 'Darwin / Palmerston',
    offer: 'Ask about short-term crisis accommodation and help planning your safety and next steps.',
    cost: 'Accommodation fees are assessed individually.',
    access: 'Call before travelling to discuss your situation and available accommodation. Women without children can ask for help. The address is confidential and a room is not guaranteed.',
    hours: '24 hours, every day',
    phone: '08 8981 5928',
    url: 'https://shelterme.org.au/provider/catherine-booth-house/',
    sources: [
      'https://nt.gov.au/law/crime/domestic-family-and-sexual-violence',
      'https://shelterme.org.au/provider/catherine-booth-house/'
    ]
  }),
  'defence-kids': service({
    name: 'Kookaburra Kids — Defence Kids',
    audience: 'Young people aged 8–18 with a current or former ADF parent or primary carer, whose wellbeing is affected by Defence life',
    area: 'NT activities and Australia-wide online groups',
    offer: 'Meet other Defence children through activities, camps or online groups, and build skills for coping with change and stress.',
    cost: 'Free for eligible participants.',
    access: 'Refer and register the young person before booking. No mental health diagnosis is required. Ask about current NT activities or age-appropriate online Connect sessions; this is peer connection and wellbeing education, not clinical treatment.',
    hours: 'Office enquiries during business hours; activities and online groups by booking',
    phone: '1300 566 525',
    url: 'https://kookaburrakids.org.au/defence-kids/',
    action: 'Check eligibility and register',
    extraUrl: 'https://kookaburrakids.org.au/kookaburra-kids-connect/',
    extraLabel: 'Explore online groups',
    sources: [
      'https://kookaburrakids.org.au/defence-kids/',
      'https://kookaburrakids.org.au/kookaburra-kids-connect/',
      'https://kookaburrakids.org.au/activity-days/',
      'https://kookaburrakids.org.au/news/a-message-from-kookaburra-kids-ceo-sean-ohalloran/'
    ]
  }),
  'rsl-sa-nt-advocacy': service({
    name: 'RSL SA/NT — free DVA claims and appeal help',
    audience: 'Serving and former members and families seeking help with a DVA claim or decision',
    area: 'NT-wide · phone and online enquiry through RSL SA/NT',
    offer: 'Ask an independent advocate to help prepare a claim, understand entitlements or seek a review or appeal.',
    cost: 'Free advocacy. RSL membership is not required.',
    access: 'Call or use the enquiry form to arrange help with DVA claims, appeals or the Veterans’ Review Board. An advocate can assist you; DVA or the review body decides the claim.',
    hours: 'Mon–Fri 9am–4:30pm Adelaide time',
    phone: '08 8100 7300',
    url: 'https://www.rslsa.org.au/advocacy',
    action: 'Request an advocate',
    extraUrl: 'mailto:veteransservices@rslsa.org.au',
    extraLabel: 'Email the advocacy team',
    sources: [
      'https://www.rslsa.org.au/advocacy',
      'https://www.rslsa.org.au/'
    ]
  }),
  'relationships-australia-nt': service({
    name: 'Relationships Australia NT — relationship counselling',
    audience: 'Couples and families seeking help with relationship difficulties or separation',
    area: 'NT-wide · phone, video or face-to-face appointments',
    offer: 'Arrange counselling about communication, conflict, parenting, grief or changes in a relationship.',
    cost: 'Fees depend on income and are discussed at intake.',
    access: 'No referral needed. Each person speaks with intake before a joint appointment. Tell the team privately if there is violence or you do not feel safe with joint counselling.',
    hours: 'Call for intake and appointment times',
    phone: '1300 458 600',
    url: 'https://nt.relationships.org.au/services/relationship-counselling',
    action: 'Read about counselling and book'
  }),
  'mcsca': service({
    name: 'MCSCA — migrant and settlement support',
    audience: 'Migrants, refugees and multicultural families in Central Australia',
    area: 'Alice Springs / Central Australia',
    offer: 'Get help settling in, finding services, understanding everyday processes or connecting with local communities.',
    cost: 'Staff appointments are free. Some programmes have eligibility rules or activity fees.',
    access: 'Call for an appointment at 5B Wills Terrace, Alice Springs. Interpreters can be arranged. Ask which support fits your situation; MCSCA can refer visa matters but is not a migration legal adviser.',
    hours: 'Mon–Fri 8:30am–4:30pm NT',
    phone: '08 8952 8776',
    url: 'https://mcsca.org.au/',
    extraUrl: 'mailto:info@mcsca.org.au',
    extraLabel: 'Email MCSCA'
  }),
  'naafls': service({
    name: 'NAAFLS — Aboriginal family violence legal support',
    audience: 'Aboriginal and Torres Strait Islander people affected by domestic, family or sexual violence',
    area: 'Top End, Big Rivers / Katherine, Tiwi and East Arnhem · remote outreach',
    offer: 'Get culturally safe legal advice and support with family violence, safety and related family or housing issues.',
    cost: 'Legal assistance is free. The team will explain any associated charges.',
    access: 'Call or use the referral form. Tell the team your location and legal issue so they can arrange suitable assistance. This is a specialist violence service, not a general criminal-law service.',
    hours: 'Mon–Fri 8:15am–4:21pm NT',
    phone: '1800 041 998',
    url: 'https://naafls.com.au/legal-services/',
    action: 'Read about legal support',
    sources: ['https://naafls.com.au/', 'https://naafls.com.au/legal-services/']
  }),
  'caaflu-central': service({
    name: 'CAAFLU — Central Australian family violence legal support',
    audience: 'Aboriginal and Torres Strait Islander people affected by domestic, family or sexual violence',
    area: 'Alice Springs / Central Australia · remote outreach',
    offer: 'Get legal advice and support with protection orders, family law, child protection or victims-of-crime compensation.',
    cost: 'Free legal assistance for eligible clients.',
    access: 'Call the Alice Springs team about your circumstances and location. Ask about office appointments or outreach; the team will assess which help it can provide.',
    hours: 'Mon–Fri 8:30am–5pm NT',
    phone: '1800 088 884',
    url: 'https://www.caaflu.com.au/contact',
    extraUrl: 'mailto:csu@caaflu.com.au',
    extraLabel: 'Email CAAFLU',
    sources: [
      'https://www.caaflu.com.au/',
      'https://www.caaflu.com.au/contact',
      'https://ntcat.nt.gov.au/information-assistance/legal-help-and-advice'
    ]
  }),
  'caaflu-barkly': service({
    name: 'CAAFLU — Barkly family violence legal support',
    audience: 'Aboriginal and Torres Strait Islander people affected by domestic, family or sexual violence',
    area: 'Tennant Creek / Barkly · remote outreach',
    offer: 'Get legal advice and support with protection orders, family law, child protection or victims-of-crime compensation.',
    cost: 'Free legal assistance for eligible clients.',
    access: 'Call the Tennant Creek team about your circumstances and location. Ask about office appointments or outreach; the team will assess which help it can provide.',
    hours: 'Mon–Fri 8:30am–5pm NT',
    phone: '1800 068 830',
    url: 'https://www.caaflu.com.au/contact',
    extraUrl: 'mailto:csu@caaflu.com.au',
    extraLabel: 'Email CAAFLU',
    sources: [
      'https://www.caaflu.com.au/',
      'https://www.caaflu.com.au/contact',
      'https://ntcat.nt.gov.au/information-assistance/legal-help-and-advice'
    ]
  }),
  'daiws': service({
    name: 'DAIWS — Aboriginal women’s safety and accommodation',
    audience: 'Women with or without children affected by family violence, with specialist Aboriginal and Torres Strait Islander support',
    area: 'Darwin · also receives clients from remote communities',
    offer: 'Ask about culturally safe shelter, safety planning and practical support. Magdalene Safe House supports women without children.',
    cost: 'Ask about any accommodation charges when you call.',
    access: 'Call the shelter to discuss safety and vacancies before travelling. Tell the team whether children are coming with you. Accommodation is assessed and a place is not guaranteed.',
    hours: '24-hour shelter and support',
    phone: '08 8945 2284',
    url: 'https://www.daiws.org.au/services',
    sources: [
      'https://www.daiws.org.au/',
      'https://www.daiws.org.au/services',
      'https://www.daiws.org.au/contact'
    ]
  }),
  // Supersedes the shorter entry in expandedServices without changing its stable ID.
  'adf-family-health': service({
    name: 'ADF Family Health Program',
    audience: 'Eligible recognised dependants of permanent ADF members or reservists on continuous full-time service',
    area: 'Australia-wide · phone and online claims',
    offer: 'Claim eligible GP gap costs and help with specialist, dental, allied-health and other approved expenses.',
    cost: 'Eligible Medicare GP gaps have no visit or dollar limit. Other covered benefits share an $800 allocation per registered dependant each financial year; allocations can be shared within the family.',
    access: 'Eligible resident family and recognised people in an interdependent relationship must be listed in PMKeyS and registered with the programme. Check service-status eligibility, covered costs and the start date of cover before spending. Unused annual allocations do not carry over.',
    hours: 'Contact for registration and claims enquiry hours',
    phone: '02 6266 3547',
    url: 'https://adffamilyhealth.com/eligibility/',
    action: 'Check eligibility and registration',
    extraUrl: 'https://pay-conditions.defence.gov.au/family/family-assistance/adf-family-health-program',
    extraLabel: 'Check covered costs and limits',
    sources: [
      'https://adffamilyhealth.com/eligibility/',
      'https://pay-conditions.defence.gov.au/family/family-assistance/adf-family-health-program',
      'https://pay-conditions.defence.gov.au/pacman/chapter-8/part-9'
    ]
  })
};
