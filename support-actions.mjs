// Authored next steps. Programme details remain in support-verified-data.mjs.
export const groups = [
  {
    id: 'moving',
    title: 'Moving for a posting',
    hint: 'Removals, housing and settling in.',
    issueNumbers: [1, 8, 13, 14, 44],
    featured: [1, 8, 13, 14],
    moreLabel: 'Starting Defence life',
  },
  {
    id: 'apart',
    title: 'Managing time apart',
    hint: 'Absence, reunion, relationships and staying connected.',
    issueNumbers: [2, 17, 18, 28, 32, 35, 36],
    featured: [2, 17, 18, 28],
    moreLabel: 'Family information and advocacy',
  },
  {
    id: 'children',
    title: 'Childcare, school and parenting',
    hint: 'Care, school moves, parenting and young people.',
    issueNumbers: [9, 10, 13, 14, 11, 12, 15, 16],
    featured: [9, 10, 13, 12],
    moreLabel: 'New babies, education costs and young people',
  },
  {
    id: 'work',
    title: 'Work, study and leaving Defence',
    hint: 'Duty and caring, partner work and civilian careers.',
    issueNumbers: [3, 4, 5, 37, 43],
    featured: [5, 37, 43, 4],
    moreLabel: 'Duty hours and family care',
  },
  {
    id: 'wellbeing',
    title: 'Wellbeing, relationships and safety',
    hint: 'Counselling, violence, grief and urgent help.',
    issueNumbers: [17, 18, 19, 20, 21, 22, 29, 31, 33, 38, 39, 40, 41],
    featured: [20, 17, 18, 19],
    moreLabel: 'Grief, confidential help and other wellbeing support',
  },
  {
    id: 'care',
    title: 'Healthcare and caring',
    hint: 'Treatment, disability, carers and accessing support.',
    issueNumbers: [23, 24, 25, 26, 27, 30, 34, 45],
    featured: [23, 25, 26, 45],
    moreLabel: 'Travel, older relatives, interpreting and finding support',
  },
  {
    id: 'money',
    title: 'Money and housing',
    hint: 'Bills, rent, housing and DVA claims.',
    issueNumbers: [6, 7, 42],
    featured: [6, 7, 42],
    moreLabel: 'More money and housing help',
  },
];

export const actions = [
  {
    issueNumber: 1,
    title: 'Arrange a posting move and settle in',
    lead: 'Start with the removal arrangements, then get help with the family changes around the move.',
    steps: [
      {
        title: 'Organise an approved Defence move',
        text: 'Use Toll for the move plan, removals and problems with an approved relocation. Check what your approval covers before arranging extras.',
        catalogueIds: [123],
      },
      {
        title: 'Ask about the family arrangements',
        text: 'The family helpline can give posting advice and connect you with local support. You can ask for advice before knowing which benefits apply.',
        catalogueIds: [40],
      },
      {
        title: 'Help children prepare for the change',
        text: 'Use the moving stories and activities together. For enrolment or learning needs, use the school pages below.',
        catalogueIds: [23],
      },
    ],
    related: [13, 14, 7, 9, 25],
  },
  {
    issueNumber: 2,
    title: 'Manage time apart and reunion',
    lead: 'Get practical help with parental absence, reunion or living in two places.',
    steps: [
      {
        title: 'Talk through the absence or reunion',
        text: 'Ask the family helpline about the practical pressures your family is facing and the support available during the absence.',
        catalogueIds: [40],
      },
      {
        title: 'Help children understand the absence',
        text: 'Ask about an ADF Equip session, or use the free family resources at home. Session dates and age groups vary.',
        catalogueIds: [135, 23],
      },
      {
        title: 'Check arrangements for two homes',
        text: 'Before committing to housing or travel, ask member administration how your living arrangements affect the relevant benefits.',
        catalogueIds: [132],
      },
    ],
    related: [17, 18, 10, 28, 32, 7],
  },
  {
    issueNumber: 3,
    title: 'Balance duty hours and family care',
    lead: 'Changes to service hours and help with care have different application routes.',
    steps: [
      {
        title: 'Discuss a change to service arrangements',
        text: 'Ask your supervisor about flexible work or service. Check the effects on pay, superannuation and housing as part of the application.',
        catalogueIds: [37],
      },
      {
        title: 'If ordinary childcare does not fit',
        text: 'Ask In Home Care about an assessment for unusual hours, isolation or complex needs. Eligibility and an available educator are separate questions.',
        catalogueIds: [67],
      },
      {
        title: 'If a serving family has a care emergency',
        text: 'Ask DMFS about ESFS when the member is away on duty or medically unable to provide care. This is assessed emergency support for the member’s resident family.',
        catalogueIds: [58],
      },
    ],
    related: [9, 10, 16, 26],
  },
  {
    issueNumber: 4,
    title: 'Manage Reserve service alongside civilian work',
    lead: 'Get advice about Reserve duties, your civilian job and changes to service arrangements.',
    steps: [
      {
        title: 'Ask about leave, protections or employer support',
        text: 'Contact Reserve and Employer Support about the particular work or study issue. Advice and employer payments have separate conditions.',
        catalogueIds: [10],
      },
      {
        title: 'Discuss flexible work or service',
        text: 'Ask your supervisor which arrangements fit your service category and duties, including any effect on income and housing.',
        catalogueIds: [37],
      },
    ],
    related: [3, 6, 22, 37],
  },
  {
    issueNumber: 5,
    title: 'Find partner work after a posting',
    lead: 'Choose career advice, job-search help or an assessed contribution to eligible career costs.',
    steps: [
      {
        title: 'Check support for partner career costs',
        text: 'Apply for PEAP and obtain approval before starting the eligible career service. The partner and member must meet the programme’s specific conditions; reimbursement limits apply.',
        catalogueIds: [103],
      },
      {
        title: 'Build a job or training plan',
        text: 'Soldier On can help Defence-connected family members with career pathways. Workforce Australia offers job-search and employment support with its own rules for extra assistance.',
        catalogueIds: [114, 128],
      },
    ],
    related: [43, 6, 37],
  },
  {
    issueNumber: 6,
    title: 'Get help with debts or urgent costs',
    lead: 'Debt advice, immediate essentials and income payments need different enquiries.',
    steps: [
      {
        title: 'Talk to a financial counsellor',
        text: 'Ask for help with bills, debts or creditor negotiations. Bravery Trust’s financial counselling has broader access than its separately assessed emergency aid.',
        catalogueIds: [80, 15],
      },
      {
        title: 'If food or utilities are the immediate problem',
        text: 'Ask the service covering your area what relief it can assess. In Central Australia, confirm Lutheran Care’s current location before travelling because the published flood-closure notice remains.',
        catalogueIds: [19, 75],
      },
      {
        title: 'Check income or family payments',
        text: 'Use Services Australia’s finder or ask for application help. A suggested payment still needs an eligibility decision; DVA payments may affect the outcome.',
        catalogueIds: [113],
      },
    ],
    related: [7, 42, 5, 45],
  },
  {
    issueNumber: 7,
    title: 'Find or keep suitable housing',
    lead: 'Use the branch that fits: a serving-family housing arrangement, a tenancy problem or nowhere safe to stay.',
    steps: [
      {
        title: 'For serving-family housing or two homes',
        text: 'Ask DHA about suitable housing or Rent Allowance, and member administration about living-apart arrangements. Confirm the relevant approval before signing a lease or committing to travel.',
        catalogueIds: [39, 136, 132],
      },
      {
        title: 'For rent, repairs, eviction or tenancy rights',
        text: 'Contact the Tenants’ Advice Service about your tenancy. Rent Assistance and home-loan support are separate programmes in the other housing options below.',
        catalogueIds: [32],
      },
      {
        title: 'If you have nowhere safe to stay',
        text: 'For a domestic crisis, ask the family helpline about assessed SAFE accommodation. For other homelessness support, Central Intake accepts online referrals during its telephone outage and responds within 48 business hours; it is not help for tonight. Compare the local accommodation programmes below by area and household. Immediate danger: call 000.',
        catalogueIds: [43, 86],
      },
    ],
    related: [19, 6, 18, 25, 40],
  },
  {
    issueNumber: 8,
    title: 'Plan care or transport for a pet',
    lead: 'A posting move, paid pet care and leaving an unsafe home need different arrangements.',
    steps: [
      {
        title: 'For a Defence-funded move',
        text: 'Check the eligible pet transport and boarding costs before booking. You arrange and pay for the pet move, then claim eligible expenses with evidence.',
        catalogueIds: [139],
      },
      {
        title: 'For routine pet-care planning',
        text: 'Use RSPCA NT’s guidance and sitter-search links. Ask the chosen provider about fees and availability; this does not confirm free crisis boarding.',
        catalogueIds: [111],
      },
      {
        title: 'If a pet affects a safe exit',
        text: 'Tell a violence support service that a pet is part of your safety planning, using a safe device.',
        catalogueIds: [3],
      },
    ],
    related: [1, 19, 7],
  },
  {
    issueNumber: 9,
    title: 'Find and pay for regular childcare',
    lead: 'Finding a place and getting help with its fees are separate steps.',
    steps: [
      {
        title: 'Get help searching for care',
        text: 'Ask Childcare Connect about care that fits your location and routine, including school-hours or vacation care. Search support does not guarantee a place.',
        catalogueIds: [24],
      },
      {
        title: 'Check Child Care Subsidy',
        text: 'Check the subsidy rules and complete the claim and enrolment process. Ask the provider what you would pay after subsidy and hourly caps.',
        catalogueIds: [141],
      },
      {
        title: 'Enquire about the Palmerston or Tindal centre',
        text: 'Contact the relevant One Tree service about a place, the current fee and Defence priority. Tindal attendance also needs base access.',
        catalogueIds: [98, 99],
      },
    ],
    related: [10, 3, 1],
  },
  {
    issueNumber: 10,
    title: 'Childcare outside usual hours',
    lead: '',
    moreLabel: 'If you are an unpaid carer',
    steps: [
      {
        title: 'When ordinary childcare does not fit',
        text: '',
        catalogueIds: [67],
      },
      {
        title: 'In a family care emergency',
        text: '',
        catalogueIds: [58],
      },
      {
        title: 'Paid care during a Defence move',
        text: '',
        catalogueIds: [140],
      },
    ],
    related: [9, 3, 16, 26],
  },
  {
    issueNumber: 11,
    title: 'Get support during pregnancy or early parenthood',
    lead: 'Ask for practical nurse guidance, support with your mental health or local child-health care.',
    steps: [
      {
        title: 'Ask a nurse about pregnancy or parenting',
        text: 'Pregnancy Birth and Baby can discuss feeding, development and early parenting questions by phone or video.',
        catalogueIds: [104],
      },
      {
        title: 'Talk about your mental health as a parent',
        text: 'Contact PANDA for pregnancy or early-parenthood counselling and peer support. Check its hours; use urgent help for a crisis.',
        catalogueIds: [101],
      },
      {
        title: 'Arrange local child and family health care',
        text: 'Contact the centre or clinic covering your area about feeding, settling, growth or postnatal wellbeing. Maternity booking pathways are in the other services below.',
        catalogueIds: [87],
      },
    ],
    related: [12, 23, 9, 40],
  },
  {
    issueNumber: 12,
    title: 'Get help with parenting or children’s behaviour',
    lead: 'Start with the concern you want help understanding: parenting stress, development or a child’s mental health.',
    steps: [
      {
        title: 'Talk through the parenting concern',
        text: 'Parentline supports parents and carers with behaviour, family relationships and parenting stress. A young person seeking their own counselling can use the youth page below.',
        catalogueIds: [102],
      },
      {
        title: 'Ask about developmental or mental-health support',
        text: 'Contact the relevant children’s therapy team about developmental concerns. Congress Head to Health Kids has a separate pathway for Aboriginal children under 12; check its community reach.',
        catalogueIds: [89, 25],
      },
    ],
    related: [15, 25, 11, 13],
  },
  {
    issueNumber: 13,
    title: 'Help a child change schools or settle in',
    lead: 'School transition advice, Defence school mentoring and independent advocacy have different roles.',
    steps: [
      {
        title: 'Talk through the school move',
        text: 'Ask for an Education Liaison Officer to discuss school options, curriculum differences and the transition.',
        catalogueIds: [34],
      },
      {
        title: 'Ask whether the school has a Defence mentor',
        text: 'Contact the school about support with friendships, posting or parental absence. Mentors are available only at currently funded schools.',
        catalogueIds: [44],
      },
      {
        title: 'If enrolment, exclusion or learning support is a problem',
        text: 'Ask the teacher or principal about the government-school support pathway. You can also contact 54 reasons directly for independent student advocacy.',
        catalogueIds: [95, 4],
      },
    ],
    related: [14, 12, 15, 2],
  },
  {
    issueNumber: 14,
    title: 'Arrange school enrolment or education assistance',
    lead: 'Get enrolment help first, then check whether a particular education benefit applies.',
    steps: [
      {
        title: 'Ask about enrolment and school options',
        text: 'An Education Liaison Officer can help with the posting transition. For barriers at an NT government school, 54 reasons accepts direct enquiries from students, families and professionals.',
        catalogueIds: [34, 4],
      },
      {
        title: 'Check the relevant education benefit',
        text: 'Defence posting assistance and DVA dependant education support have different eligibility and application rules. Confirm approval before spending where required.',
        catalogueIds: [33, 48],
      },
    ],
    related: [13, 25, 42],
  },
  {
    issueNumber: 15,
    title: 'Find support for a teenager or young adult',
    lead: 'A young person can seek their own support, and family or friends can ask how to help.',
    steps: [
      {
        title: 'Talk by phone or online',
        text: 'Check the age and hours on each service. Kids Helpline is for the young person; eheadspace also advises family, friends and carers supporting them.',
        catalogueIds: [70, 57],
      },
      {
        title: 'Arrange care in Darwin or Palmerston',
        text: 'Contact the relevant headspace centre to ask how to start, including phone or video options, consent and any clinical costs.',
        catalogueIds: [62, 65],
      },
      {
        title: 'Arrange care in Katherine or Alice Springs',
        text: 'Contact the relevant headspace centre about access from your community. Katherine’s published temporary-relocation notice remains, so call before visiting.',
        catalogueIds: [63, 64],
      },
    ],
    related: [40, 12, 16, 20],
  },
  {
    issueNumber: 16,
    title: 'Support a young person who is an unpaid carer',
    lead: 'Young carers can ask for practical support, time for themselves and information about study assistance.',
    steps: [
      {
        title: 'Ask for carer support now',
        text: 'Contact Carer Gateway about counselling, coaching, practical help or respite. It supports unpaid caring for illness, disability, mental-health needs or frailty.',
        catalogueIds: [16],
      },
      {
        title: 'Check study support and bursary announcements',
        text: 'Use Young Carers Network for support information. The 2026 bursary round has closed and 2027 dates are unconfirmed; check the next round’s rules when announced.',
        catalogueIds: [130],
      },
      {
        title: 'Make room for the young person’s own concerns',
        text: 'An eligible young person can contact Kids Helpline about their own feelings, school or relationships, without a referral.',
        catalogueIds: [70],
      },
    ],
    related: [26, 15, 43],
  },
  {
    issueNumber: 17,
    title: 'Get help with relationship strain',
    lead: 'Choose relationship counselling or ask a military-aware service about your situation.',
    steps: [
      {
        title: 'Ask about individual, couple or family counselling',
        text: 'Relationships Australia NT accepts direct enquiries. Both people need to speak with intake before joint counselling; ask about the income-based fee.',
        catalogueIds: [108],
      },
      {
        title: 'Check military-aware counselling options',
        text: 'Open Arms and the Reserve Assistance Program have different service and family rules. If your eligibility is unclear, ask the service rather than ruling yourself out.',
        catalogueIds: [100, 109],
      },
    ],
    related: [2, 18, 19, 33],
  },
  {
    issueNumber: 18,
    title: 'Sort practical arrangements after separation',
    lead: 'Parenting arrangements, safe child contact and changes to Defence benefits need separate attention.',
    steps: [
      {
        title: 'Ask about parenting arrangements or legal advice',
        text: 'The Family Relationship Centre assesses whether mediation is safe and suitable. Legal Aid NT can explain legal options and arrange initial advice.',
        catalogueIds: [59, 73],
      },
      {
        title: 'If visits or changeovers need supervision',
        text: 'Ask the Children’s Contact Service about assessment, bookings and fees for safer child contact. Use the service in the relevant area.',
        catalogueIds: [18],
      },
      {
        title: 'Check changed family and care arrangements',
        text: 'Ask member administration how separation, shared care or a different household affects the particular Defence benefit. Recognition is assessed separately from counselling or legal help.',
        catalogueIds: [131],
      },
    ],
    related: [19, 7, 6, 17, 42],
  },
  {
    issueNumber: 19,
    title: 'Get independent help with family or sexual violence',
    lead: 'Use a safe device to contact support. You can seek advice without making a formal report.',
    steps: [
      {
        title: 'If there is immediate danger',
        text: 'Call 000 for police, ambulance or fire and give the exact location.',
        catalogueIds: [133],
      },
      {
        title: 'Talk through safety and support options',
        text: '1800RESPECT supports anyone affected by violence. SeMPRO provides confidential sexual-misconduct support for its listed Defence-connected groups, including anonymous advice without a formal report.',
        catalogueIds: [3, 2],
      },
      {
        title: 'Ask about safe accommodation or legal options',
        text: 'For a domestic crisis with no alternative accommodation, ask the family helpline about assessed Defence SAFE support. Legal Aid NT can explain legal options; regional shelters and specialist services are listed below.',
        catalogueIds: [43, 73],
      },
    ],
    related: [33, 7, 18, 8, 40],
  },
  {
    issueNumber: 20,
    title: 'Find mental-health care for yourself or family',
    lead: 'Seek care for your own distress or ask how to support someone else.',
    steps: [
      {
        title: 'Ask for a local or remote care pathway',
        text: 'Connect to Wellbeing can discuss where to start and the referral needed for a particular service. Intake is free; onward costs vary.',
        catalogueIds: [27],
      },
      {
        title: 'Check Defence-connected counselling',
        text: 'Ask Open Arms about your service history and family relationship if eligibility is uncertain. Non-full-time Reserve families can separately check the Reserve Assistance Program.',
        catalogueIds: [100, 109],
      },
      {
        title: 'For an adult wanting local walk-in support',
        text: 'Darwin and Katherine have free Medicare Mental Health Centres with no referral needed. Check the centre’s hours and directions before travelling.',
        catalogueIds: [30, 68],
      },
    ],
    related: [40, 15, 11, 22, 30],
  },
  {
    issueNumber: 21,
    title: 'Respond when someone shows signs of distress',
    lead: 'Advice is available now; training can help you recognise concerns and connect someone with care.',
    steps: [
      {
        title: 'Ask for advice about the concern',
        text: 'ADF members and families can call the All-hours Support Line for mental-health advice and referral, including when seeking their own support.',
        catalogueIds: [5],
      },
      {
        title: 'Ask about counselling or support for the family',
        text: 'Contact Open Arms to check the service and family rules and discuss its counselling or peer-support options.',
        catalogueIds: [100],
      },
      {
        title: 'Learn skills for future support',
        text: 'Check advertised Mental Health Protect courses and their participation rules. Training is not a substitute for help during a crisis.',
        catalogueIds: [77],
      },
    ],
    related: [40, 20, 15],
  },
  {
    issueNumber: 22,
    title: 'Get help with ongoing stress',
    lead: 'Choose counselling or regular support for distress and isolation.',
    steps: [
      {
        title: 'Ask about counselling',
        text: 'Open Arms and the Reserve Assistance Program have different service and family conditions. Contact them about your actual circumstances if the rules are unclear.',
        catalogueIds: [100, 109],
      },
      {
        title: 'Ask about scheduled support calls',
        text: 'TeamTALK supports NT residents with mild distress or emerging risk. It does not provide acute care; use the urgent-help page if the situation has become a crisis.',
        catalogueIds: [119],
      },
    ],
    related: [20, 17, 28, 40],
  },
  {
    issueNumber: 23,
    title: 'Arrange healthcare and continue treatment',
    lead: 'Civilian-family healthcare and serving-member healthcare use different systems.',
    steps: [
      {
        title: 'For general or civilian-family health advice',
        text: 'Call healthdirect for nurse advice and help finding appropriate healthcare. The advice line does not require a Defence connection.',
        catalogueIds: [66],
      },
      {
        title: 'For a serving member away from base or after hours',
        text: 'Use 1800 IM SICK for serving-member nurse advice and triage. Routine garrison care uses the member’s assigned centre; those centres are listed below.',
        catalogueIds: [1],
      },
      {
        title: 'Check dependant cover or posting-related continuity',
        text: 'The Family Health Program requires registered eligible dependants. Posting-related special-needs support has separate formal recognition and benefit assessment.',
        catalogueIds: [7, 46],
      },
    ],
    related: [24, 25, 11, 20, 40],
  },
  {
    issueNumber: 24,
    title: 'Arrange travel for specialist treatment',
    lead: 'Check the appropriate funding pathway and approval before booking travel.',
    steps: [
      {
        title: 'For the NT patient travel scheme',
        text: 'Ask the treating healthcare provider about PATS and the office for your region. Eligibility, distance and referral rules apply; the subsidy may leave costs to pay.',
        catalogueIds: [93],
      },
      {
        title: 'For a family at an eligible remote posting',
        text: 'Ask member administration about Defence specialist-treatment travel for an eligible accompanied resident family. Approval is needed before booking.',
        catalogueIds: [36],
      },
      {
        title: 'For an eligible Veteran Card holder',
        text: 'Ask DVA about travel reimbursement or a booked car. Check attendant approval and the costs covered; PATS excludes costs claimable through DVA or other listed funding.',
        catalogueIds: [52],
      },
    ],
    related: [23, 25, 42],
  },
  {
    issueNumber: 25,
    title: 'Arrange disability support or continuity of care',
    lead: 'Defence recognition, an NDIS plan and independent advocacy are separate forms of support.',
    steps: [
      {
        title: 'For needs affected by a posting',
        text: 'Ask DMFS about formal special-needs recognition and the benefit being sought. The Special Needs Support Group can separately offer peer information and advocacy.',
        catalogueIds: [46, 45],
      },
      {
        title: 'For NDIS access or early-childhood support',
        text: 'Ask NDIA or the appropriate early-childhood partner how to start. A Defence connection alone does not establish eligibility or provide a funded plan.',
        catalogueIds: [83],
      },
      {
        title: 'For service barriers, rights or a review',
        text: 'Contact the disability advocacy service covering your area. Family or carer involvement needs consent and must not create a conflict of interest.',
        catalogueIds: [90],
      },
    ],
    related: [12, 13, 23, 24, 26],
  },
  {
    issueNumber: 26,
    title: 'Get support as a carer and take part in care decisions',
    lead: 'Ask for help with unpaid caring, or independent advice about the person’s care and rights.',
    steps: [
      {
        title: 'For your own caring role',
        text: 'Ask Carer Gateway about counselling, coaching, respite or assessed practical support. This is for unpaid caring for illness, disability, mental-health needs or frailty.',
        catalogueIds: [16],
      },
      {
        title: 'For disability or aged-care rights',
        text: 'Contact the appropriate advocacy service about decisions or service problems. Ask how the person’s consent and your role as a supporter are handled.',
        catalogueIds: [90, 97],
      },
      {
        title: 'For several connected veteran-family needs',
        text: 'Ask the Veteran and Family Wellbeing Agency to help navigate services and coordinate more complex support. Each referred programme has its own conditions.',
        catalogueIds: [124],
      },
    ],
    related: [16, 25, 27, 45],
  },
  {
    issueNumber: 27,
    title: 'Support an older relative or arrange a carer break',
    lead: 'Carer support, aged-care assessment and Veteran Card home care each have their own route.',
    steps: [
      {
        title: 'Ask about support or respite for an unpaid carer',
        text: 'Carer Gateway can discuss your caring role and assess practical help or respite. Emergency respite enquiries are available at any time.',
        catalogueIds: [16],
      },
      {
        title: 'Ask about aged care or dementia support',
        text: 'My Aged Care can explain assessment and care options. For dementia or memory concerns, the National Dementia Helpline also supports families and carers.',
        catalogueIds: [79, 81],
      },
      {
        title: 'For Veteran Card home care or aged-care rights',
        text: 'Ask VHC about assessed home support for an eligible card holder. OPAN gives independent advice about aged-care rights and service problems.',
        catalogueIds: [125, 97],
      },
    ],
    related: [26, 45, 25],
  },
  {
    issueNumber: 28,
    title: 'Meet people and build local connections',
    lead: 'Ask about local Defence-family activities or independent wellbeing and social programmes.',
    steps: [
      {
        title: 'Find local family activities',
        text: 'Contact the Darwin or Tindal DMFS team about current events and support. Check the event’s participation terms and arrange access before visiting.',
        catalogueIds: [41, 42],
      },
      {
        title: 'Check independent connection and wellbeing options',
        text: 'Mates4Mates and Soldier On offer different activities and wellbeing pathways. Ask about the specific programme, family access and what is available locally or online.',
        catalogueIds: [76, 115],
      },
    ],
    related: [2, 29, 20],
  },
  {
    issueNumber: 29,
    title: 'Find activities or pastoral support',
    lead: 'Choose social and wellbeing activities, or a conversation with a chaplain.',
    steps: [
      {
        title: 'Ask about an activity or wellbeing programme',
        text: 'Contact Soldier On or Mates4Mates about the activity you want and its participation requirements. Check local availability and any clinical referral separately.',
        catalogueIds: [115, 76],
      },
      {
        title: 'Ask for pastoral or spiritual support',
        text: 'ADF members and families can ask for the regional on-call chaplain for support, advice or a referral.',
        catalogueIds: [6],
      },
    ],
    related: [28, 43, 38],
  },
  {
    issueNumber: 30,
    title: 'Use interpreting or culturally safe support',
    lead: 'Ask for language or communication access, and check which local wellbeing service serves your community.',
    steps: [
      {
        title: 'Arrange a language interpreter',
        text: 'Use TIS National or the Aboriginal Interpreter Service for the language needed. Ask the destination service to arrange or fund interpreting and confirm any charges.',
        catalogueIds: [121, 85],
      },
      {
        title: 'Make a relay call',
        text: 'The National Relay Service supports d/Deaf, hard-of-hearing and speech-impaired callers. Register, choose the communication channel and provide the service’s number.',
        catalogueIds: [82],
      },
      {
        title: 'Find a culturally safe local wellbeing service',
        text: 'Open the local services below and ask which programme reaches your community. The listed Aboriginal health and wellbeing services have distinct client groups and catchments.',
        catalogueIds: [],
      },
    ],
    related: [20, 23, 39, 32],
  },
  {
    issueNumber: 31,
    title: 'Find support for an LGBTQIA+ family',
    lead: 'Peer support, military-aware counselling and Defence family recognition serve different needs.',
    steps: [
      {
        title: 'Talk with a peer supporter',
        text: 'QLife supports people with questions about sexuality, gender, identity or relationships, and the people supporting them. Check its hours; it is not emergency clinical care.',
        catalogueIds: [105],
      },
      {
        title: 'Ask about military-aware counselling',
        text: 'Contact Open Arms about your service history and family relationship if eligibility is unclear.',
        catalogueIds: [100],
      },
      {
        title: 'Clarify recognition for a particular benefit',
        text: 'Ask member administration about your actual relationship and care arrangements. Recognition and each funded benefit are assessed separately.',
        catalogueIds: [131],
      },
    ],
    related: [17, 20, 33, 32],
  },
  {
    issueNumber: 32,
    title: 'Get information directly as a family member',
    lead: 'Ask your own questions, including about blended, extended, separated or non-resident family arrangements.',
    steps: [
      {
        title: 'Ask the family helpline yourself',
        text: 'Families and Reservists can seek practical advice directly. You do not need to establish a funded-benefit entitlement before asking for advice.',
        catalogueIds: [40],
      },
      {
        title: 'Clarify family recognition and the actual benefit',
        text: 'Use the current family-recognition process through member administration. Describe the relationship and care arrangements relevant to the benefit being checked.',
        catalogueIds: [131],
      },
      {
        title: 'For DVA or Centrelink information',
        text: 'Ask the relevant organisation about its own payment, claim or application process. The conditions differ between benefits and may interact.',
        catalogueIds: [54, 113],
      },
    ],
    related: [30, 34, 18, 31],
  },
  {
    issueNumber: 33,
    title: 'Find confidential or anonymous support',
    lead: 'Choose the privacy and type of support you need before sharing personal details.',
    steps: [
      {
        title: 'For anonymous military-aware counselling',
        text: 'Safe Zone lets callers choose how much identifying information to share, with legal and safety exceptions.',
        catalogueIds: [112],
      },
      {
        title: 'For violence or sexual-misconduct advice',
        text: 'Use a safe device to contact 1800RESPECT. SeMPRO also offers anonymous advice to its listed Defence-connected groups without requiring a formal report.',
        catalogueIds: [3, 2],
      },
      {
        title: 'For ongoing eligible counselling',
        text: 'Ask Open Arms about eligibility and its support options, including any questions you have about confidentiality.',
        catalogueIds: [100],
      },
    ],
    related: [19, 20, 17, 40],
  },
  {
    issueNumber: 34,
    title: 'Get help finding the right service',
    lead: 'Choose a contact that can help navigate the particular support you need.',
    steps: [
      {
        title: 'For practical Defence-family questions',
        text: 'The family helpline can discuss posting, absence, children or family stress and connect you with relevant support.',
        catalogueIds: [40],
      },
      {
        title: 'For a mental-health-care pathway',
        text: 'Ask Connect to Wellbeing about local or remote care, referrals and the next step for your concern.',
        catalogueIds: [27],
      },
      {
        title: 'For several connected veteran-family needs',
        text: 'The Veteran and Family Wellbeing Agency can help find services and coordinate more complex needs, including for serving families preparing for transition.',
        catalogueIds: [124],
      },
    ],
    related: [32, 35, 20, 37],
  },
  {
    issueNumber: 35,
    title: 'Find services that understand Defence life',
    lead: 'Ask for practical family advice, military-aware care or help connecting several services.',
    steps: [
      {
        title: 'For current Defence-family questions',
        text: 'Ask the family helpline about the issue you are facing. Advice is available to ADF members, Reservists and families; funded benefits have separate rules.',
        catalogueIds: [40],
      },
      {
        title: 'For counselling or wellbeing care',
        text: 'Open Arms and Mates4Mates have different service and family eligibility rules. Ask about your circumstances and the particular clinical or social programme.',
        catalogueIds: [100, 76],
      },
      {
        title: 'For navigating veteran-family services',
        text: 'Ask the Veteran and Family Wellbeing Agency to help connect services, including when a serving family is preparing for transition.',
        catalogueIds: [124],
      },
    ],
    related: [34, 36, 20, 37],
  },
  {
    issueNumber: 36,
    title: 'Have a say in family services or policy',
    lead: 'Choose current-serving family advocacy or information about veteran-family consultation.',
    steps: [
      {
        title: 'Raise a current-serving family policy issue',
        text: 'Contact Defence Families of Australia’s regional delegate for independent family advocacy and policy information.',
        catalogueIds: [35],
      },
      {
        title: 'Check veteran-family consultation opportunities',
        text: 'Use DVA’s consultation information and mailing list. The 2026 forum expression of interest closed on 10 August; check the official page for future openings.',
        catalogueIds: [53],
      },
    ],
    related: [35, 34, 32],
  },
  {
    issueNumber: 37,
    title: 'Plan leaving service and rebuilding routines',
    lead: 'Start with transition planning, then check career and health support through the relevant programme.',
    steps: [
      {
        title: 'Make a transition plan',
        text: 'Arrange an appointment with the NT Defence Transition Centre. Ask about family participation and approval for any funded training or advice.',
        catalogueIds: [88],
      },
      {
        title: 'Build a civilian career pathway',
        text: 'Ask Soldier On about careers, skills, education or employment support for the member or family.',
        catalogueIds: [114],
      },
      {
        title: 'Check ongoing rehabilitation or mental-health cover',
        text: 'DVA rehabilitation and Non-Liability Health Care have distinct conditions. Check the member’s or veteran’s cover and the referral needed; family healthcare is separate.',
        catalogueIds: [51, 50],
      },
    ],
    related: [43, 5, 20, 42, 28],
  },
  {
    issueNumber: 38,
    title: 'Get support after a member or veteran dies',
    lead: 'Grief support, dependant benefits and practical family help have different pathways.',
    steps: [
      {
        title: 'Choose grief support',
        text: 'Open Arms can discuss counselling eligibility. Griefline’s listed service provides grief resources, peer access and enquiry support rather than immediate counselling.',
        catalogueIds: [100, 61],
      },
      {
        title: 'Ask about dependant or funeral benefits',
        text: 'Contact DVA about the death, service and dependency conditions for the particular benefit. Counselling is a separate enquiry.',
        catalogueIds: [55],
      },
      {
        title: 'Ask for practical family support',
        text: 'Legacy assesses support for families affected by loss of life or health through service. The Veteran and Family Wellbeing Agency can help connect other services.',
        catalogueIds: [84, 124],
      },
    ],
    related: [39, 42, 6, 40],
  },
  {
    issueNumber: 39,
    title: 'Get support after a death by suicide',
    lead: 'Support is available to family, friends and other people affected by the death.',
    steps: [
      {
        title: 'Ask for practical and emotional support',
        text: 'Contact StandBy’s NT team about support by phone or a visit by arrangement, including connections to other local services.',
        catalogueIds: [116],
      },
      {
        title: 'For culturally led family or community support',
        text: 'Aboriginal and Torres Strait Islander people, families and communities can contact Thirrili about support after suicide or traumatic unexpected death.',
        catalogueIds: [120],
      },
      {
        title: 'If you need emotional crisis support now',
        text: 'Call Lifeline for immediate emotional support. For life-threatening danger or injury, call 000.',
        catalogueIds: [74],
      },
    ],
    related: [38, 40, 20, 30],
  },
  {
    issueNumber: 40,
    title: 'Get urgent safety or mental-health help',
    lead: 'Call 000 for immediate danger or a life-threatening emergency.',
    steps: [
      {
        title: 'For immediate danger, serious injury or illness',
        text: 'Call 000 and give the exact location and immediate concern.',
        catalogueIds: [133],
      },
      {
        title: 'For an urgent NT mental-health concern',
        text: 'Call the NT Mental Health Line for yourself or someone else to seek urgent advice and assessment.',
        catalogueIds: [92],
      },
      {
        title: 'For immediate emotional support or Defence-family advice',
        text: 'Lifeline provides emotional crisis support. ADF members and families can also call the All-hours Support Line for mental-health advice, triage and referral.',
        catalogueIds: [74, 5],
      },
    ],
    related: [19, 20, 15, 39],
  },
  {
    issueNumber: 41,
    title: 'Get help with alcohol, drugs or gambling',
    lead: 'You can ask for help about your own use or the effect on a family member.',
    steps: [
      {
        title: 'For alcohol or drug concerns',
        text: 'Ask Amity about counselling, or use the alcohol and drug phone or online options. Family and friends can also seek support.',
        catalogueIds: [11, 28],
      },
      {
        title: 'For gambling harm',
        text: 'Gambling Help offers phone or online counselling for the person gambling and affected family or friends.',
        catalogueIds: [60],
      },
      {
        title: 'For debts or financial pressure',
        text: 'Contact the National Debt Helpline about bills, hardship or creditor negotiations. It provides advice rather than loans or grants.',
        catalogueIds: [80],
      },
    ],
    related: [6, 20, 17, 40],
  },
  {
    issueNumber: 42,
    title: 'Check DVA benefits or get help with a claim',
    lead: 'Choose independent claims advocacy or contact DVA about the particular entitlement.',
    steps: [
      {
        title: 'For independent claim or review help',
        text: 'Ask RSL advocacy about preparing a claim, understanding an entitlement or a review or appeal. RSL membership is not required.',
        catalogueIds: [110],
      },
      {
        title: 'For DVA’s application or benefit information',
        text: 'Contact DVA about the specific benefit, Veteran Card or claim. Conditions differ between benefits; being a member, veteran or family member does not approve every entitlement.',
        catalogueIds: [54],
      },
    ],
    related: [6, 24, 37, 38, 45],
  },
  {
    issueNumber: 43,
    title: 'Start adult study or retraining',
    lead: 'Find a course or career pathway, then check the fees and any assessed funding.',
    steps: [
      {
        title: 'Ask about a course or prior learning',
        text: 'Contact CDU about local or online study, recognition of prior learning and current fee-free places. Check course, residency and funding conditions before enrolling.',
        catalogueIds: [22],
      },
      {
        title: 'Connect study to an employment plan',
        text: 'Soldier On supports Defence-connected careers and education. Workforce Australia offers employment and training pathways, with separate rules for extra assistance.',
        catalogueIds: [114, 128],
      },
      {
        title: 'For eligible partner career expenses',
        text: 'Apply for PEAP and obtain approval before starting the eligible career service. Reimbursement limits apply.',
        catalogueIds: [103],
      },
    ],
    related: [5, 37, 16, 6],
  },
  {
    issueNumber: 44,
    title: 'Get started as a new Defence family',
    lead: 'Ask about the family changes around joining, training or the first posting.',
    steps: [
      {
        title: 'Ask your practical family questions',
        text: 'Contact the family helpline about training-related absence, children or family adjustment and ask where to start.',
        catalogueIds: [40],
      },
      {
        title: 'Connect with local family support',
        text: 'Ask the Darwin or Tindal DMFS team about local support and current activities. Confirm visiting arrangements and any event conditions.',
        catalogueIds: [41, 42],
      },
      {
        title: 'Support the family through the change',
        text: 'Use the child and family resources, or ask a chaplain for pastoral support and referrals.',
        catalogueIds: [23, 6],
      },
    ],
    related: [1, 2, 32, 28],
  },
  {
    issueNumber: 45,
    title: 'Arrange help at home during illness or injury',
    lead: 'Emergency family care, service-related household help and Veteran Card home care have different conditions.',
    steps: [
      {
        title: 'For a serving-family care emergency',
        text: 'Ask DMFS about ESFS when the member is away on duty or medically unable to care for their resident family. Approved short-term help is assessed.',
        catalogueIds: [58],
      },
      {
        title: 'For needs caused by an accepted service condition',
        text: 'Ask DVA about an assessment for household services or attendant care. Approval depends on the condition and care need; it is not an automatic family-carer wage.',
        catalogueIds: [49],
      },
      {
        title: 'For low-level care at home with a Veteran Card',
        text: 'Ask VHC about assessment and provider allocation. Card, functional-need, contribution and duplicate-funding rules apply.',
        catalogueIds: [125],
      },
    ],
    related: [26, 27, 10, 42],
  },
];
