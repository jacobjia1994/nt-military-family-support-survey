// NT programme offers checked against the official sources on 27 September 2026.
const checked = '2026-09-27';
const service = data => ({ ...data, sources: data.sources || [data.url], checked });
const familyMentalHealth = {
  audience: 'Children and young people up to 18, with their families and carers',
  offer: 'Early support when a child has emerging emotional or mental health difficulties, including family work, groups and outreach.',
  cost: 'Free Family Mental Health Support Service.',
  access: 'Contact the local team to ask about support for your child and how to get started.',
  url: 'https://www.catholiccarent.org.au/our-service/community-mental-health/'
};
const youthOutreach = {
  audience: 'Young people aged 10–25 who are homeless or at risk of homelessness',
  offer: 'Work with a local youth worker on housing stability, family relationships, school or employment.',
  cost: 'Free youth support. This programme does not guarantee a bed tonight.',
  access: 'Call the local office and ask for Assertive Outreach.',
  url: 'https://www.catholiccarent.org.au/service-category/housing-support/'
};

export const ntReviewedServices = {
  'connect-wellbeing-nt': service({
    name: 'Connect to Wellbeing NT — mental health referral',
    audience: 'People in the NT who need help arranging mental health care',
    area: 'NT-wide · phone and referrals',
    offer: 'An assessment and referral team can connect you with suitable care, including assessed short-term psychological therapy.',
    cost: 'Free intake and assessment. Funded therapy has separate Medicare, clinical and concession or hardship criteria.',
    access: 'Call about the referral process. Your GP, health professional or community service can refer you. Psychological therapy usually needs a GP mental health treatment plan.',
    hours: 'Mon–Fri 8:30am–5pm NT; closed public holidays',
    phone: '1800 595 212',
    url: 'https://www.neaminational.org.au/services/connect-to-wellbeing-northern-territory/',
    extraUrl: 'mailto:nt.connecttowellbeing@neaminational.org.au',
    extraLabel: 'Email the referral team',
    sources: [
      'https://www.neaminational.org.au/services/connect-to-wellbeing-northern-territory/',
      'https://ntphn.org.au/programs-list/stt/'
    ]
  }),
  'catholiccare-fmhss-darwin': service({
    ...familyMentalHealth,
    name: 'CatholicCare — child and family mental health, Darwin',
    area: 'Darwin / Malak',
    phone: '08 8944 2000',
    extraUrl: 'mailto:darwin@catholiccarent.org.au',
    extraLabel: 'Email the Darwin team'
  }),
  'catholiccare-fmhss-jabiru': service({
    ...familyMentalHealth,
    name: 'CatholicCare — child and family mental health, Jabiru',
    area: 'Jabiru',
    phone: '08 8979 2266',
    extraUrl: 'mailto:darwin@catholiccarent.org.au',
    extraLabel: 'Email about the Jabiru programme'
  }),
  'catholiccare-fmhss-wadeye': service({
    ...familyMentalHealth,
    name: 'CatholicCare — child and family mental health, Wadeye',
    area: 'Wadeye / Port Keats',
    phone: '08 8978 2515',
    extraUrl: 'mailto:wadeye@catholiccarent.org.au',
    extraLabel: 'Email the Wadeye team'
  }),
  'catholiccare-yes-tennant': service({
    name: 'CatholicCare — Youth Enhanced Service, Tennant Creek',
    audience: 'Young people aged 12–25 with complex mental health needs, and their families or carers',
    area: 'Tennant Creek',
    offer: 'Clinical counselling for significant or complex mental health difficulties, with support for families and carers.',
    cost: 'Free service.',
    access: 'You or a service provider can contact the team directly. Describe what is happening; the team can assess whether this programme fits.',
    phone: '08 8962 3065',
    url: 'https://www.catholiccarent.org.au/our-service/youth-mental-health-service/',
    extraUrl: 'mailto:tennantcreek@catholiccarent.org.au',
    extraLabel: 'Email the Tennant Creek team'
  }),
  'catholiccare-outreach-katherine': service({
    ...youthOutreach,
    name: 'CatholicCare — youth housing support, Katherine',
    area: 'Katherine region',
    phone: '08 8971 0777',
    extraUrl: 'mailto:katherine@catholiccarent.org.au',
    extraLabel: 'Email the Katherine team'
  }),
  'catholiccare-outreach-tennant': service({
    ...youthOutreach,
    name: 'CatholicCare — youth housing support, Tennant Creek',
    area: 'Tennant Creek region',
    phone: '08 8962 3065',
    extraUrl: 'mailto:tennantcreek@catholiccarent.org.au',
    extraLabel: 'Email the Tennant Creek team'
  }),
  'student-advocacy-54reasons': service({
    name: '54 reasons — independent student advocacy',
    audience: 'Students in NT government schools and their parents or carers',
    area: 'Darwin / Palmerston',
    offer: 'Independent help with school exclusion, discrimination, enrolment or getting learning support.',
    cost: 'Free advocacy.',
    access: 'Students, carers and professionals can contact the service directly. You do not need the school to request help for you.',
    phone: '08 7971 9834',
    url: 'https://www.54reasons.org.au/services/student-advocacy-service',
    extraUrl: 'mailto:student.advocacy@54reasons.org.au',
    extraLabel: 'Email a student advocate',
    sources: [
      'https://www.54reasons.org.au/services/student-advocacy-service',
      'https://nt.gov.au/learning/student-wellbeing-and-inclusion/advocating-for-your-child'
    ]
  }),
  'east-arnhem-money-hub': service({
    name: 'East Arnhem Money Support Hub',
    audience: 'Individuals and families with debt, bills or other money difficulties',
    area: 'Nhulunbuy and listed East Arnhem communities · phone, video and visits',
    offer: 'Local financial counselling and advocacy about debts, banking, superannuation or Centrelink.',
    cost: 'Free, confidential financial counselling and advocacy.',
    access: 'Call Anglicare NT in Nhulunbuy. Ask about support in your community or by phone or video.',
    hours: 'Office: Mon–Fri 8:30am–4:30pm NT',
    phone: '08 8939 3400',
    url: 'https://www.anglicare-nt.org.au/service/money-support-hub/'
  }),
  'miyalk-shelter': service({
    name: 'Miyalk Domestic and Family Violence Shelter',
    audience: 'Women and their children experiencing, or at risk of, domestic or family violence',
    area: 'Nhulunbuy and surrounding communities',
    offer: 'Ask about crisis accommodation, safety support and help with next steps.',
    cost: 'Ask the shelter about any accommodation charges.',
    access: 'Call when it is safe to do so. The team will discuss your situation and available accommodation.',
    hours: '24 hours, every day',
    phone: '08 8987 1166',
    url: 'https://nt.gov.au/law/crime/domestic-family-and-sexual-violence',
    sources: [
      'https://nt.gov.au/law/crime/domestic-family-and-sexual-violence',
      'https://naafls.com.au/job/miyalk-shelter-crisis-accommodation-team-leader/'
    ]
  }),
  'catholiccare-parenting': service({
    name: 'CatholicCare — practical parenting support',
    audience: 'Parents and families, especially those with young children',
    area: 'Darwin, Palmerston, Alice Springs, Katherine, Tennant Creek and selected communities',
    offer: 'Ongoing parenting support, home or community visits, and groups to build skills and meet other parents.',
    cost: 'The Children and Parenting programme is free. Separate counselling services may charge fees.',
    access: 'Choose the office for your area on the service page. You can refer yourself; ask about local activities and availability.',
    url: 'https://www.catholiccarent.org.au/service-category/children-and-parenting/',
    action: 'Find local parenting support'
  })
};
