// Four reader-facing routes. Each next choice opens contact-ready services.
// needIds are provenance links to the earlier 39-heading source inventory;
// they do not define the public navigation or limit its scope.
const housingContacts = {
  title: 'At risk of homelessness?',
  note: 'Central Intake phone lines are down; its online form aims to reply within 48 business hours. These contacts can give earlier advice or referrals; accommodation is assessed.',
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
export const journeys = [
  {
    id: 'moving', title: 'Moving or settling in',
    choices: [
      { id: 'arriving', title: 'Arriving after a posting', needIds: [1, 28, 32], primaryServiceIds: ['dmfs-darwin', 'dmfs-tindal', 'dmfs-helpline'], moreServiceIds: ['defence-community-groups'], moreLabel: 'Local family groups' },
      { id: 'housing', title: 'Finding or keeping a home', needIds: [7], primaryServiceIds: ['dha-housing', 'dmfs-helpline', 'nt-central-intake'], quickHelp: housingContacts, moreServiceIds: ['toll-transitions', 'legal-aid-nt'], moreLabel: 'Removals and tenancy advice' },
      { id: 'pets', title: 'Moving with a pet', needIds: [8], primaryServiceIds: ['defence-pet-move', 'dha-housing', 'dmfs-helpline'], note: 'If a pet is making it hard to leave an unsafe home, use the Feeling unsafe path under specific concerns.' },
      { id: 'school', title: 'A child is changing schools', needIds: [13, 14], primaryServiceIds: ['school-change', 'nt-school-enrolment', 'school-mentor'], moreServiceIds: ['defence-education'], moreLabel: 'Education assistance' },
      { id: 'childcare', title: 'Finding childcare', needIds: [9, 10], primaryServiceIds: ['onetree-nt', 'kentish-fdc', 'defence-childcare'], moreServiceIds: ['nt-in-home-care', 'startingblocks'], moreLabel: 'Shift care and other places' },
      { id: 'partner-work', title: 'Partner work after a move', needIds: [5], primaryServiceIds: ['soldieron-employment', 'peap', 'cowork-coplay'] },
      { id: 'connections', title: 'Meeting people in a new place', needIds: [28, 29], primaryServiceIds: ['dmfs-darwin', 'dmfs-tindal', 'defence-community-groups'], moreServiceIds: ['darwin-vfwc', 'chaplaincy'], moreLabel: 'Other ways to connect' }
    ]
  },
  {
    id: 'apart', title: 'Apart because of service',
    choices: [
      { id: 'away', title: 'Someone is away or coming home', needIds: [2], primaryServiceIds: ['dmfs-helpline', 'adf-equip', 'open-arms'] },
      { id: 'parenting', title: 'Parenting or managing daily life alone', needIds: [2, 12], primaryServiceIds: ['dmfs-helpline', 'parentline', 'territory-faces'] },
      { id: 'child', title: 'A child is finding time apart hard', needIds: [2, 12, 15], primaryServiceIds: ['adf-equip', 'parentline', 'kids-helpline'], moreServiceIds: ['eheadspace'], moreLabel: 'Young person online support' },
      { id: 'care-hours', title: 'Care does not fit work or service hours', needIds: [3, 10], primaryServiceIds: ['kentish-fdc', 'nt-in-home-care', 'dmfs-helpline'] },
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
      { id: 'injury-care', title: 'Injury, health or a caring role', needIds: [23, 25, 26, 37], primaryServiceIds: ['dva-claims', 'darwin-vfwc', 'carer-gateway'], moreServiceIds: ['open-arms', 'dva-acute-support', 'general-health-nt'], moreLabel: 'Counselling and practical supports' },
      { id: 'work', title: 'Work or study after service', needIds: [5, 37], primaryServiceIds: ['soldieron-employment', 'darwin-vfwc', 'veteran-wellbeing-agency'] },
      { id: 'housing-money', title: 'Housing or money pressure', needIds: [6, 7, 37], primaryServiceIds: ['darwin-vfwc', 'lc-alice-financial', 'national-debt-helpline', 'nt-central-intake'], quickHelp: housingContacts, moreServiceIds: ['bravery-financial'], moreLabel: 'Veteran financial counselling' },
      { id: 'connections', title: 'New routines and people to connect with', needIds: [28, 29, 37], primaryServiceIds: ['darwin-vfwc', 'soldieron-connect', 'veteran-wellbeing-agency'], moreServiceIds: ['defglis', 'chaplaincy'], moreLabel: 'Peer and spiritual support' },
      { id: 'family', title: 'Family or relationship stress', needIds: [17, 20, 22, 37], primaryServiceIds: ['open-arms', 'relationship-counselling-nt', 'teamtalk'], moreServiceIds: ['family-rel-advice'], moreLabel: 'Separation and parenting advice' }
    ]
  },
  {
    id: 'concern', title: 'Find help for a specific concern',
    choices: [
      { id: 'housing', title: 'Housing', needIds: [7, 8], primaryServiceIds: ['dha-housing', 'nt-central-intake', 'legal-aid-nt'], quickHelp: housingContacts, moreServiceIds: ['defence-pet-move'], moreLabel: 'Moving with a pet' },
      { id: 'work-money', title: 'Work or money', needIds: [3, 4, 5, 6], primaryServiceIds: ['soldieron-employment', 'catholiccare-financial', 'lc-alice-financial', 'national-debt-helpline'], moreServiceIds: ['adf-flexible-work', 'peap', 'reserve-flexible-work', 'reserve-protection', 'reserve-employer-support', 'employer-support-payment', 'bravery-financial'], moreLabel: 'Partner, Reserve and veteran-specific options' },
      { id: 'childcare', title: 'Childcare', needIds: [9, 10], primaryServiceIds: ['kentish-fdc', 'onetree-nt', 'defence-childcare', 'nt-in-home-care'], moreServiceIds: ['startingblocks'], moreLabel: 'Local centres and other places' },
      { id: 'parenting', title: 'Pregnancy or parenting', needIds: [11, 12], primaryServiceIds: ['parentline', 'postnatal-home', 'territory-faces'], moreServiceIds: ['breastfeeding-help'], moreLabel: 'Breastfeeding support' },
      { id: 'school-youth', title: 'School or a young person', needIds: [13, 14, 15, 16], primaryServiceIds: ['school-change', 'nt-school-enrolment', 'kids-helpline'], moreServiceIds: ['headspace-darwin', 'headspace-palmerston', 'headspace-katherine', 'headspace-alice', 'eheadspace'], moreLabel: 'Young people: local and online support' },
      { id: 'mental', title: 'Mental health', needIds: [20, 21, 22], primaryServiceIds: ['adf-allhours', 'open-arms', 'nt-mental-health-line'], moreServiceIds: ['teamtalk', 'darwin-mmhc', 'katherine-mmhc', 'eheadspace'], moreLabel: 'Ongoing, local and youth options', note: 'If someone is in immediate danger, call 000.' },
      { id: 'health', title: 'Health or specialist travel', needIds: [23, 24], primaryServiceIds: ['general-health-nt', 'defence-remote-travel', 'pats-nt', 'adf-family-health'], moreServiceIds: ['imsick'], moreLabel: 'Member-only after-hours triage' },
      { id: 'caring', title: 'Disability or caring', needIds: [16, 25, 26, 27], primaryServiceIds: ['carer-gateway', 'defence-special-needs', 'ndis'], moreServiceIds: ['my-aged-care', 'nt-telehealth', 'carer-skills'], moreLabel: 'Older relatives and care decisions' },
      { id: 'relationships', title: 'Relationships or separation', needIds: [17, 18], primaryServiceIds: ['family-rel-advice', 'relationship-counselling-nt', 'legal-aid-nt'], moreServiceIds: ['open-arms'], moreLabel: 'Defence-aware counselling' },
      { id: 'safety', title: 'Feeling unsafe or sexual assault', needIds: [19], primaryServiceIds: ['1800respect', 'dawn-house', 'kwcc', 'wossca-alice'], quickHelp: sexualAssaultContacts, moreServiceIds: ['defence-safe', 'sempro'], moreLabel: 'Defence-specific help', note: 'If you are in immediate danger, call 000. If this device is not safe to use, use a safer phone or computer when you can.', safety: true },
      { id: 'grief', title: 'A death or grief', needIds: [38, 39], primaryServiceIds: ['grief-australia', 'open-arms', 'dva-death-support'], moreServiceIds: ['standby-nt', 'legacy-nt', 'amber-nt', 'thirrili', 'suicide-callback', 'griefline'], moreLabel: 'Family, child-loss and suicide-specific support' },
      { id: 'connection', title: 'Community or finding help', needIds: [28, 29, 32, 34, 35], primaryServiceIds: ['dmfs-helpline', 'veteran-wellbeing-agency', 'defence-community-groups'], moreServiceIds: ['dmfs-darwin', 'dmfs-tindal', 'darwin-vfwc', 'soldieron-connect', 'teamtalk', 'chaplaincy'], moreLabel: 'Local and wellbeing contacts' },
      { id: 'benefits', title: 'Defence information, benefits or claims', needIds: [32, 35, 37], primaryServiceIds: ['dmfs-helpline', 'dva-claims', 'veteran-wellbeing-agency'], moreServiceIds: ['darwin-vfwc', 'dva-acute-support', 'dfa'], moreLabel: 'Local advocacy and assessed crisis services' }
    ]
  }
];

export const humanHelpServiceIds = ['dmfs-helpline', 'veteran-wellbeing-agency', 'territory-faces'];
// Language, LGBTQIA+ inclusion and privacy are access needs; #36 is feedback.
export const secondaryNeedIds = [30, 31, 33, 36];
