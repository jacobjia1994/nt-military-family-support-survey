// Four reader-facing routes. Each next choice opens contact-ready services.
// needIds are provenance links to the earlier 39-heading source inventory;
// they do not define the public navigation or limit its scope.
const housingContacts = {
  title: 'Phone help by area',
  note: 'Central Intake’s phone is temporarily unavailable. These services may offer earlier advice or referrals; accommodation is assessed.',
  afterPrimary: 1,
  contacts: [
    { id: 'territory-faces', label: 'Territory FACES · NT family referrals (weekdays)' },
    { id: 'salvos-topend-families', label: 'Salvation Army · Top End families (assessed)' },
    { id: 'salvos-alice-waterhole', label: 'Salvation Army Waterhole · Alice Springs' },
    { id: 'salvos-katherine-doorways', label: 'Salvation Army Doorways · Katherine' }
  ]
};
const sexualAssaultContacts = {
  title: 'After sexual assault: NT referral centres',
  note: 'Darwin and Alice Springs offer 24-hour medical help after a recent assault. Check access hours for the other local contacts.',
  afterPrimary: 1,
  contacts: [
    { id: 'sarc-darwin', label: 'Darwin · 24-hour medical help' },
    { id: 'sarc-alice', label: 'Alice Springs · 24-hour medical help' },
    { id: 'sarc-katherine', label: 'Katherine · local contact' },
    { id: 'sarc-tennant', label: 'Tennant Creek · local contact' }
  ],
  url: 'https://nt.gov.au/wellbeing/hospitals-health-services/sexual-assault-referral-centres',
  urlLabel: 'About NT sexual assault referral centres'
};
const financialContacts = {
  title: 'Local financial counselling',
  note: 'Ask the team in your area about free counselling and current appointments.',
  afterPrimary: 1,
  contacts: [
    { id: 'catholiccare-financial', label: 'CatholicCare NT · Darwin, Palmerston, Katherine and listed remote areas' },
    { id: 'lc-alice-financial', label: 'Lutheran Care · Alice Springs and nearby communities' }
  ]
};
const youthContacts = {
  title: 'Local headspace centres (ages 12–25)',
  note: 'Call a centre about appointments.',
  afterPrimary: 1,
  contacts: [
    { id: 'headspace-darwin', label: 'headspace Darwin' },
    { id: 'headspace-palmerston', label: 'headspace Palmerston' },
    { id: 'headspace-katherine', label: 'headspace Katherine' },
    { id: 'headspace-alice', label: 'headspace Alice Springs' }
  ]
};
const postnatalContacts = {
  title: 'Postnatal home visits after a birth',
  note: 'For public maternity patients; ask your maternity team about follow-up and availability.',
  afterPrimary: 1,
  contacts: [
    { id: 'postnatal-darwin', label: 'NT Health domiciliary midwives · Darwin' },
    { id: 'postnatal-alice', label: 'NT Health domiciliary midwives · Alice Springs' }
  ],
  url: 'https://nt.gov.au/wellbeing/pregnancy-birthing-and-child-health/pregnancy-and-birthing-services-in-the-top-end/postnatal-home-visits',
  urlLabel: 'NT postnatal home-visit information'
};
const culturallySafeMentalContacts = {
  title: 'First Nations local wellbeing support',
  note: 'These services are for Aboriginal and Torres Strait Islander people in their listed areas.',
  afterPrimary: 2,
  contacts: [
    { id: 'danila-dilba', label: 'Danila Dilba · Greater Darwin and Palmerston' },
    { id: 'wurli-sewb', label: 'Wurli-Wurlinjang · Katherine region' }
  ]
};
export const journeys = [
  {
    id: 'moving', title: 'Moving or settling in',
    choices: [
      { id: 'arriving', title: 'Arriving after a posting', needIds: [1, 28, 32], primaryServiceIds: ['dmfs-helpline', 'dmfs-darwin', 'dmfs-tindal'], moreServiceIds: ['defence-community-groups'], moreLabel: 'Local family groups' },
      { id: 'housing', title: 'Finding Defence housing after a posting', needIds: [7], primaryServiceIds: ['dha-housing', 'dmfs-helpline'], moreServiceIds: ['toll-transitions', 'legal-aid-nt'], moreLabel: 'Removals and tenancy advice', related: { routeId: 'concern', choiceId: 'homelessness', label: 'At risk of homelessness? See local contacts' } },
      { id: 'pets', title: 'Moving with a pet', needIds: [8], primaryServiceIds: ['defence-pet-move', 'dha-housing', 'dmfs-helpline'], related: { routeId: 'concern', choiceId: 'safety', label: 'Unsafe at home? Find safety support, including pet care' } },
      { id: 'school', title: 'A child is changing schools', needIds: [13, 14], primaryServiceIds: ['school-change', 'nt-school-enrolment', 'school-mentor'], moreServiceIds: ['defence-education'], moreLabel: 'Education assistance' },
      { id: 'childcare', title: 'Finding childcare', needIds: [9, 10], primaryServiceIds: ['startingblocks', 'kentish-fdc', 'onetree-nt'], moreServiceIds: ['defence-childcare', 'nt-in-home-care'], moreLabel: 'Defence priority and care around shifts' },
      { id: 'partner-work', title: 'Partner work after a move', needIds: [5], primaryServiceIds: ['soldieron-employment', 'peap', 'cowork-coplay'] },
      { id: 'connections', title: 'Meeting people in a new place', needIds: [28, 29], primaryServiceIds: ['dmfs-helpline', 'dmfs-darwin', 'dmfs-tindal'], moreServiceIds: ['defence-community-groups', 'soldieron-connect', 'darwin-vfwc', 'chaplaincy'], moreLabel: 'Groups and other ways to connect' }
    ]
  },
  {
    id: 'apart', title: 'Apart because of service',
    choices: [
      { id: 'away', title: 'Someone is away or coming home', needIds: [2], primaryServiceIds: ['dmfs-helpline', 'adf-equip', 'open-arms'] },
      { id: 'parenting', title: 'Parenting or managing daily life alone', needIds: [2, 12], primaryServiceIds: ['dmfs-helpline', 'parentline', 'territory-faces'] },
      { id: 'child', title: 'A child is finding time apart hard', needIds: [2, 12, 15], primaryServiceIds: ['parentline', 'kids-helpline', 'adf-equip'], moreServiceIds: ['eheadspace'], moreLabel: 'Young person online support' },
      { id: 'care-hours', title: 'Care does not fit work or service hours', needIds: [3, 10], primaryServiceIds: ['kentish-fdc', 'nt-in-home-care', 'dmfs-helpline'], moreServiceIds: ['adf-flexible-work'], moreLabel: 'ADF flexible work options' },
      { id: 'relationship', title: 'Relationship strain or reunion', needIds: [17], primaryServiceIds: ['open-arms', 'relationship-counselling-nt', 'family-rel-advice'] },
      { id: 'mental', title: 'Stress or mental health worries', needIds: [20, 21, 22], primaryServiceIds: ['adf-allhours', 'open-arms', 'teamtalk'], moreServiceIds: ['nt-mental-health-line', 'suicide-callback'], moreLabel: 'Urgent mental-health contacts', note: 'If someone is in immediate danger, call 000.' },
      { id: 'unsafe', title: 'Unsafe at home or sexual assault', needIds: [8, 19], primaryServiceIds: ['1800respect', 'dawn-house', 'kwcc', 'wossca-alice'], quickHelp: sexualAssaultContacts, moreServiceIds: ['defence-safe', 'sempro'], moreLabel: 'Defence-specific help', note: 'If you are in immediate danger, call 000. If this device is not safe to use, use a safer phone or computer when you can.', safety: true }
    ]
  },
  {
    id: 'leaving', title: 'Leaving Defence or already left',
    choices: [
      { id: 'transition', title: 'Preparing to leave', needIds: [37], primaryServiceIds: ['nt-transition-centre', 'adf-transition', 'veteran-wellbeing-agency'], moreServiceIds: ['dva-claims'], moreLabel: 'Claims and entitlements' },
      { id: 'already-left', title: 'Already left Defence', needIds: [37], primaryServiceIds: ['veteran-wellbeing-agency', 'dva-claims', 'open-arms'], moreServiceIds: ['darwin-vfwc', 'soldieron-connect'], moreLabel: 'Darwin and peer support' },
      { id: 'injury', title: 'Service-related injury or claim', needIds: [23, 37], primaryServiceIds: ['dva-claims', 'veteran-wellbeing-agency'], moreServiceIds: ['darwin-vfwc', 'dva-acute-support', 'general-health-nt'], moreLabel: 'Darwin advocacy and other health help' },
      { id: 'caring', title: 'Caring for someone', needIds: [25, 26, 37], primaryServiceIds: ['carer-gateway', 'open-arms'], moreServiceIds: ['my-aged-care', 'nt-telehealth'], moreLabel: 'Older relatives and care decisions' },
      { id: 'work', title: 'Work or study after service', needIds: [5, 37], primaryServiceIds: ['soldieron-employment', 'veteran-wellbeing-agency'], moreServiceIds: ['darwin-vfwc'], moreLabel: 'Darwin local hub' },
      { id: 'housing', title: 'At risk of losing housing', needIds: [7, 37], primaryServiceIds: ['nt-central-intake'], quickHelp: housingContacts, quickHelpFirst: true, moreServiceIds: ['darwin-vfwc'], moreLabel: 'Darwin veteran housing navigation' },
      { id: 'money', title: 'Debt or money pressure', needIds: [6, 37], primaryServiceIds: ['national-debt-helpline'], quickHelp: financialContacts, moreServiceIds: ['bravery-financial'], moreLabel: 'Veteran financial counselling' },
      { id: 'connections', title: 'New routines and people to connect with', needIds: [28, 29, 37], primaryServiceIds: ['soldieron-connect', 'veteran-wellbeing-agency'], moreServiceIds: ['darwin-vfwc', 'defglis', 'chaplaincy'], moreLabel: 'Darwin, LGBTQIA+ and spiritual support' },
      { id: 'family', title: 'Family or relationship stress', needIds: [17, 20, 22, 37], primaryServiceIds: ['open-arms', 'relationship-counselling-nt', 'teamtalk'], moreServiceIds: ['family-rel-advice'], moreLabel: 'Separation and parenting advice' }
    ]
  },
  {
    id: 'concern', title: 'Find help for a specific concern',
    choices: [
      // Home & money
      { id: 'adf-housing', title: 'Defence housing after a posting', needIds: [7], primaryServiceIds: ['dha-housing', 'dmfs-helpline'], moreServiceIds: ['toll-transitions', 'legal-aid-nt'], moreLabel: 'Removals and tenancy advice' },
      { id: 'homelessness', title: 'At risk of homelessness', needIds: [7], primaryServiceIds: ['nt-central-intake'], quickHelp: housingContacts, quickHelpFirst: true, moreServiceIds: ['legal-aid-nt'], moreLabel: 'Tenancy advice' },
      { id: 'employment', title: 'Finding work', needIds: [5], primaryServiceIds: ['soldieron-employment', 'peap'], moreServiceIds: ['cowork-coplay'], moreLabel: 'Partner career group in Darwin or Katherine' },
      { id: 'money', title: 'Debt or bills', needIds: [6], primaryServiceIds: ['national-debt-helpline'], quickHelp: financialContacts, moreServiceIds: ['bravery-financial'], moreLabel: 'Veteran financial counselling' },
      { id: 'reserve-work', title: 'Reserve service and civilian work', needIds: [3, 4], primaryServiceIds: ['reserve-protection', 'reserve-employer-support'], moreServiceIds: ['reserve-flexible-work', 'employer-support-payment'], moreLabel: 'Service options and employer payments' },
      // Children & young people
      { id: 'childcare', title: 'Finding childcare', needIds: [9, 10], primaryServiceIds: ['startingblocks', 'kentish-fdc'], moreServiceIds: ['onetree-nt', 'defence-childcare', 'nt-in-home-care'], moreLabel: 'Defence centres and care around shifts' },
      { id: 'pregnancy', title: 'Pregnancy or a new baby', needIds: [11], primaryServiceIds: ['nt-pregnancy-care', 'breastfeeding-help'], quickHelp: postnatalContacts, moreServiceIds: ['postnatal-home'], moreLabel: 'How postnatal visits work' },
      { id: 'parenting-stress', title: 'Parenting stress', needIds: [12], primaryServiceIds: ['parentline', 'territory-faces'], moreServiceIds: ['dmfs-helpline'], moreLabel: 'Defence family support' },
      { id: 'school', title: 'Changing schools or enrolment', needIds: [13, 14], primaryServiceIds: ['nt-school-enrolment', 'school-change'], moreServiceIds: ['school-mentor', 'defence-education'], moreLabel: 'Defence school support' },
      { id: 'young-person', title: 'A young person needs support', needIds: [15, 16], primaryServiceIds: ['kids-helpline', 'eheadspace'], quickHelp: youthContacts, moreServiceIds: ['carer-gateway'], moreLabel: 'Support for a young carer' },
      // Health & care
      { id: 'mental', title: 'Mental health', needIds: [20, 21, 22], primaryServiceIds: ['open-arms', 'adf-allhours', 'nt-mental-health-line'], quickHelp: culturallySafeMentalContacts, moreServiceIds: ['teamtalk', 'darwin-mmhc', 'katherine-mmhc', '13yarn'], moreLabel: 'Peer, local adult and First Nations options', note: 'If someone is in immediate danger, call 000.' },
      { id: 'doctor', title: 'Sick or need a doctor', needIds: [23], primaryServiceIds: ['general-health-nt', 'imsick'], moreServiceIds: ['adf-family-health'], moreLabel: 'ADF dependant healthcare benefit' },
      { id: 'specialist-travel', title: 'Travel for specialist care', needIds: [24], primaryServiceIds: ['pats-nt', 'defence-remote-travel'], moreServiceIds: ['dmfs-helpline'], moreLabel: 'Ask Defence about family travel' },
      { id: 'disability', title: 'Disability support', needIds: [25], primaryServiceIds: ['ndis', 'defence-special-needs'], moreServiceIds: ['carer-gateway'], moreLabel: 'Support for carers' },
      { id: 'carer', title: 'Caring for someone', needIds: [16, 26, 27], primaryServiceIds: ['carer-gateway'], moreServiceIds: ['my-aged-care', 'nt-telehealth', 'carer-skills'], moreLabel: 'Older relatives and care decisions' },
      // Relationships & loss
      { id: 'relationship-strain', title: 'Relationship strain', needIds: [17], primaryServiceIds: ['relationship-counselling-nt', 'open-arms'], moreServiceIds: ['family-rel-advice'], moreLabel: 'Parenting and separation advice' },
      { id: 'separation', title: 'Separation questions', needIds: [18], primaryServiceIds: ['family-rel-advice', 'legal-aid-nt'], moreServiceIds: ['open-arms'], moreLabel: 'Defence-aware counselling' },
      { id: 'death', title: 'After a death', needIds: [38], primaryServiceIds: ['grief-australia', 'open-arms'], moreServiceIds: ['dva-death-support', 'legacy-nt', 'amber-nt', 'griefline'], moreLabel: 'Practical, veteran family and child-loss help', related: { routeId: 'concern', choiceId: 'suicide-loss', label: 'After a death by suicide? See support in the NT' } },
      { id: 'suicide-loss', title: 'After a death by suicide', needIds: [39], primaryServiceIds: ['standby-nt', 'thirrili', 'open-arms'], moreServiceIds: ['suicide-callback', '13yarn'], moreLabel: 'Further phone support' },
      // Defence & community
      { id: 'meeting-people', title: 'Meeting people', needIds: [28, 29], primaryServiceIds: ['soldieron-connect', 'defence-community-groups'], moreServiceIds: ['dmfs-darwin', 'dmfs-tindal', 'darwin-vfwc', 'defglis'], moreLabel: 'Local groups and inclusive connection' },
      { id: 'finding-help', title: 'Someone to guide me', needIds: [34, 35], primaryServiceIds: ['dmfs-helpline', 'veteran-wellbeing-agency'], moreServiceIds: ['territory-faces'], moreLabel: 'NT family referrals', note: 'Current ADF families can contact Defence Member and Family Support. Veteran families can contact the Veteran and Family Wellbeing Agency.' },
      { id: 'adf-info', title: 'ADF family information', needIds: [32, 35], primaryServiceIds: ['dmfs-helpline'], moreServiceIds: ['dmfs-darwin', 'dmfs-tindal', 'dfa'], moreLabel: 'Local offices and family advocacy' },
      { id: 'veteran-claims', title: 'Veteran support or DVA claim', needIds: [35, 37], primaryServiceIds: ['veteran-wellbeing-agency', 'dva-claims'], moreServiceIds: ['darwin-vfwc', 'dva-acute-support'], moreLabel: 'Darwin advocacy and assessed practical support' },
      // Safety remains directly reachable from the specific-concern page.
      { id: 'safety', title: 'Feeling unsafe or sexual assault', needIds: [19], primaryServiceIds: ['1800respect', 'dawn-house', 'kwcc', 'wossca-alice'], quickHelp: sexualAssaultContacts, moreServiceIds: ['defence-safe', 'sempro'], moreLabel: 'Defence-specific help', note: 'If you are in immediate danger, call 000. If this device is not safe to use, use a safer phone or computer when you can.', safety: true }
    ]
  }
];

export const concernGroups = [
  { id: 'home-money', title: 'Home, work & money', choiceIds: ['adf-housing', 'homelessness', 'employment', 'money', 'reserve-work'] },
  { id: 'children', title: 'Children & young people', choiceIds: ['childcare', 'pregnancy', 'parenting-stress', 'school', 'young-person'] },
  { id: 'health-care', title: 'Health & care', choiceIds: ['mental', 'doctor', 'specialist-travel', 'disability', 'carer'] },
  { id: 'relationships-loss', title: 'Relationships & loss', choiceIds: ['relationship-strain', 'separation', 'death', 'suicide-loss'] },
  { id: 'defence-community', title: 'Defence & community', choiceIds: ['meeting-people', 'finding-help', 'adf-info', 'veteran-claims'] }
];
export const concernDirectChoiceIds = ['safety'];

export const humanHelpServiceIds = ['dmfs-helpline', 'veteran-wellbeing-agency', 'territory-faces'];
// Language, LGBTQIA+ inclusion and privacy are access needs; #36 is feedback.
export const secondaryNeedIds = [30, 31, 33, 36];
