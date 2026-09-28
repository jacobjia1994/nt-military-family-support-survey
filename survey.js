// Question text for internal team review. IDs are stable analysis keys.
// Youth and child pathways are staff walkthroughs until participation procedures are agreed.
const DOMAINS = {
  adult: [
    { id: "settling", label: "Postings or leaving service", hint: "Preparing for a move, settling in, uncertainty about postings or adjusting after service." },
    { id: "work_study", label: "Work, study or training", hint: "Finding work, keeping a career going or getting back into study." },
    { id: "housing", label: "Housing", hint: "Finding a secure home that suits your household, including accessibility needs or pets." },
    { id: "everyday_expenses", label: "Money and everyday expenses", hint: "Household bills, managing money or finding out about financial help." },
    { id: "transport", label: "Getting around", hint: "Transport to work, appointments or activities." },
    { id: "childcare", label: "Childcare", hint: "Affordable care during work, shifts or unexpected absences." },
    { id: "schooling", label: "Children’s schooling", hint: "Enrolment, changing schools, learning or getting support at school." },
    { id: "parenting_caring", label: "Parenting or caring for someone", hint: "Parenting while someone is away, sharing care or supporting a relative who is unwell." },
    { id: "physical_health", label: "Physical health and healthcare", hint: "Finding healthcare or getting the treatment you need." },
    { id: "emotional_wellbeing", label: "Mental health and wellbeing", hint: "Stress or support with how you are feeling." },
    { id: "bereavement", label: "Grief or bereavement", hint: "Emotional or practical support after someone has died." },
    { id: "disability_ongoing_needs", label: "Disability support", hint: "Getting support that meets your needs." },
    { id: "family_relationships", label: "Family relationships", hint: "Staying connected, relationship difficulties or changes in family life." },
    { id: "people_to_turn_to", label: "Friends and community", hint: "Meeting people, feeling connected or having someone to turn to." },
    { id: "military_separation", label: "Time apart because of service", hint: "Time away for deployments or training, and settling back into family life afterwards." },
    { id: "safety_confidential_help", label: "Feeling safe at home or in a relationship", hint: "" }
    ,{ id: "finding_services", label: "Finding the right information or service", hint: "Knowing what is available to you, how to access it or who to speak to." }
  ],
  youth: [
    { id: "friends_belonging", label: "Friends or feeling included" },
    { id: "school_learning", label: "School, learning or training" },
    { id: "moving_change", label: "Moving or settling in" },
    { id: "family_time_apart", label: "Family life or time apart" },
    { id: "feelings_wellbeing", label: "Feelings or worries" },
    { id: "activities_transport", label: "Things to do or getting around" },
    { id: "health_access", label: "My health or help with a disability" },
    { id: "finding_help", label: "Finding someone I can talk to or ask for help" }
  ],
  child: [
    { id: "friends", label: "Making or keeping friends" },
    { id: "school", label: "School" },
    { id: "moving_change", label: "Moving or changes" },
    { id: "family_away", label: "When someone in my family is away" },
    { id: "feelings", label: "Feelings or worries" },
    { id: "activities", label: "Things to do" },
    { id: "health", label: "My health or getting the help I need" },
    { id: "trusted_person", label: "Finding someone I can talk to" }
  ]
};

// For adults, use these only after an actual attempt to get help.
// Reasons for not seeking help need a separate question and answer set.
// Youth barriers are perceived barriers, not evidence of a failed attempt.
// Child options use simpler language and stay with the selected area.
const BARRIERS = {
  adult: [
    { id: "unaware", label: "I did not know what was available" },
    { id: "eligibility_unsure", label: "I was unsure whether I was eligible" },
    { id: "eligibility_refused", label: "I was told I was not eligible" },
    { id: "cost", label: "Cost" },
    { id: "waiting", label: "Waiting for support" },
    { id: "location_transport", label: "Location or transport" },
    { id: "hours_timing", label: "Opening hours or timing" },
    { id: "childcare_caring", label: "Childcare or caring responsibilities" },
    { id: "language_culture", label: "Language or cultural barriers" },
    { id: "accessibility", label: "Accessibility" },
    { id: "privacy_trust", label: "Concerns about privacy or trust" },
    { id: "military_understanding", label: "The service did not understand Defence family life" },
    { id: "poor_fit", label: "Available support did not fit my situation" },
    { id: "explaining_repeatedly", label: "Having to explain my situation repeatedly" },
    { id: "other", label: "Something else" },
    { id: "none", label: "Nothing made it difficult" },
    { id: "unsure", label: "I'm not sure" },
    { id: "prefer_not_to_say", label: "Prefer not to say" }
  ],
  youth: [
    { id: "not_know_where", label: "Not knowing where to go" },
    { id: "no_trusted_person", label: "Not having someone I trust to ask" },
    { id: "privacy", label: "Worrying about who would be told" },
    { id: "not_understood", label: "Feeling that people would not understand" },
    { id: "timing", label: "Finding a suitable time" },
    { id: "transport", label: "Getting there" },
    { id: "cost", label: "Cost" },
    { id: "not_ready", label: "Not feeling ready to ask" },
    { id: "other", label: "Something else" },
    { id: "none", label: "Nothing would make it hard" },
    { id: "unsure", label: "I'm not sure" },
    { id: "prefer_not_to_say", label: "Prefer not to say" }
  ],
  child: [
    { id: "not_know_who", label: "I do not know who to ask" },
    { id: "hard_to_explain", label: "It is hard to explain" },
    { id: "worried_to_ask", label: "I feel worried about asking" },
    { id: "other", label: "Something else" },
    { id: "none", label: "Nothing makes it hard" },
    { id: "unsure", label: "I don't know" }
  ]
};

const NT_REGIONS = ['darwin','palmerston','litchfield','greater_darwin_other','katherine','alice','other_nt'];
const locationFrame = region => NT_REGIONS.includes(region) ? 'nt' : ['outside_au','outside_overseas'].includes(region) ? 'outside' : 'unspecified';
const SPECIAL_NEEDS = [];
const MAX_ACCOUNTS = 100;
const ACCOUNT_KINDS = ['experience','future','unspecified'];
const OFFER_TYPES = ['information','conversation','activity','other'];
const OTHER_ISSUE = 'other_issue';
const ISSUE_GROUPS = {
  adult: [
    {label:'Moving and everyday life',ids:['settling','work_study','housing','everyday_expenses','transport']},
    {label:'Children, family and connection',ids:['childcare','schooling','parenting_caring','family_relationships','people_to_turn_to','military_separation']},
    {label:'Health, safety and finding help',ids:['physical_health','emotional_wellbeing','bereavement','disability_ongoing_needs','safety_confidential_help','finding_services']}
  ],
  youth: [
    {label:'Friends, school and change',ids:['friends_belonging','school_learning','moving_change','family_time_apart']},
    {label:'Wellbeing and getting help',ids:['feelings_wellbeing','activities_transport','health_access','finding_help']}
  ]
};
// Respondent wording belongs to the issue being discussed, not to a repeated format menu.
const TOPIC_WORDING = {
  adult: {
    settling:['What happened around a posting, move, or leaving service for you or your family?','What posting, move, or change after service are you thinking about in the coming months?','What would make that posting, move or change easier for your family?'],
    work_study:['What happened when you or someone in your family tried to work, study, or train?','What would you or someone in your family like to do with work, study, or training next?','What would help with that work or study goal?'],
    housing:['What has mattered about finding or keeping a home that works for your household?','What might your household need from housing in the coming months?','What would make finding or keeping a suitable home easier?'],
    everyday_expenses:['What has household money or everyday expenses been like for your family?','What financial or everyday cost concern might matter in the coming months?','What kind of information or practical change would help with those costs?'],
    transport:['What happened when your family needed to get to work, appointments, or activities?','Where might getting around be difficult for your family in the coming months?','What would make that journey or transport arrangement work better?'],
    childcare:['What has happened when your family needed childcare, including around shifts or unexpected absences?','What childcare might your family need in the coming months?','What would make childcare more workable for your family?'],
    schooling:['What would you like us to understand about a child’s experience at school or with learning?','What would you like school or learning to be like for a child in your family in the coming months?','What would help that child settle, learn, or get the right support?'],
    parenting_caring:['What has mattered while parenting or caring for someone in your family?','What parenting or caring situation might need support in the coming months?','What would make that care easier or more sustainable?'],
    physical_health:['What has mattered when someone in your family needed healthcare or treatment?','What healthcare might someone in your family need to access in the coming months?','What would make getting suitable healthcare easier?'],
    emotional_wellbeing:['If you wish, what has affected your or your family’s wellbeing?','Thinking about your or your family’s wellbeing, what would you like to be different or stay the same in the coming months?','What support or change would feel useful for your family’s wellbeing?'],
    bereavement:['If you wish, what would you like us to understand about grief or practical needs after a death? You do not need to describe the death.','What support after a loss might matter to your family in the coming months?','What would make grief or practical support after a death more useful?'],
    disability_ongoing_needs:['What has mattered when someone in your family needed disability or ongoing support?','What disability or ongoing support might matter in the coming months?','What would make that support fit your family’s circumstances better?'],
    family_relationships:['What has mattered for relationships or changes in family life?','What would you like family life or relationships to be like in the coming months?','What would help with the situation you described, or what is already helping that you would like to keep?','What could help make that possible?'],
    people_to_turn_to:['What has helped or made it hard to meet people or have someone to turn to?','What kind of connection or community would you like for your family in the coming months?','What would help your family build or keep those connections?'],
    military_separation:['What has mattered when service, deployment, or training has kept your family apart or brought everyone back together?','What period of service-related time apart or return might affect your family soon?','What would help your family during that time apart or return?'],
    safety_confidential_help:['If you wish, what would you like us to understand about feeling safe at home or in a relationship? You do not need to describe an incident.','What kind of safe, private information or support might matter in the coming months?','What would make it safer or easier to seek confidential help, if you wanted it?'],
    finding_services:['What happened when you tried to find information, a service, or the right person to ask?','What information or service might your family need to find in the coming months?','Which step in finding the right information or service should be easier?'],
    other_issue:['What other part of family life would you like us to understand?','What other idea or change would you like to share for the coming months?','What would help with that situation or idea?']
  },
  youth: {
    friends_belonging:['What has happened with friends or feeling included?','What would you like to be easier with friends or feeling included?','What would help you feel included or keep the friendships that matter?'],
    school_learning:['What has happened at school or while learning or training?','What would you like school, learning, or training to be like soon?','What would help you learn or feel better supported there?'],
    moving_change:['What happened when you moved or had to settle into a change?','Is there a move or change coming up that you want us to know about?','What would make that move or change easier?'],
    family_time_apart:['What has family life been like for you, including any time apart because of service?','What would you like family life to be like for you soon?','What would help you with this?'],
    feelings_wellbeing:['If you wish, what has mattered about your feelings or worries?','Thinking about your feelings or worries, what would you like to be different or stay the same soon?','What kind of help or change would feel useful to you?'],
    activities_transport:['What happened when you wanted something to do or needed to get somewhere?','What would you like to do or reach more easily in the coming months?','What would make that activity or trip possible for you?'],
    health_access:['What has mattered when you needed health or disability support?','What health or disability support might you need soon?','What would make that support easier to get or better for you?'],
    finding_help:['What happened when you wanted someone to talk to or ask for help?','Who or what kind of help would you like to be able to reach soon?','What would make asking for help feel easier or safer?'],
    other_issue:['What else would you like us to understand about your life?','What other idea or change would you like to share?','What would help with that situation or idea?']
  }
};
const TOPIC_NEUTRAL = {
  adult: {
    settling:'What would you like us to understand about a posting, move, or leaving service?',
    work_study:'What would you like us to understand about work, study, or training in your family?',
    housing:'What would you like us to understand about housing for your household?',
    everyday_expenses:'What would you like us to understand about money or everyday expenses?',
    transport:'What would you like us to understand about getting to work, appointments, or activities?',
    childcare:'What would you like us to understand about childcare for your family?',
    schooling:'What would you like us to understand about a child’s school or learning?',
    parenting_caring:'What would you like us to understand about parenting or caring for someone?',
    physical_health:'What would you like us to understand about healthcare or treatment?',
    emotional_wellbeing:'What would you like us to understand about wellbeing in your family?',
    bereavement:'If you wish, what would you like us to understand about grief or practical needs after a death? You do not need to describe the death.',
    disability_ongoing_needs:'What would you like us to understand about disability or ongoing support?',
    family_relationships:'What would you like us to understand about relationships or changes in family life?',
    people_to_turn_to:'What would you like us to understand about friends, community, or having someone to turn to?',
    military_separation:'What would you like us to understand about time apart because of service or coming back together?',
    safety_confidential_help:'If you wish, what would you like us to understand about feeling safe at home or in a relationship? You do not need to describe an incident.',
    finding_services:'What would you like us to understand about finding information or the right service?',
    other_issue:'What other part of family life would you like us to understand?'
  },
  youth: {
    friends_belonging:'What would you like us to understand about friends or feeling included?',
    school_learning:'What would you like us to understand about school, learning, or training?',
    moving_change:'What would you like us to understand about moving or settling into change?',
    family_time_apart:'What would you like us to understand about family life or time apart?',
    feelings_wellbeing:'If you wish, what would you like us to understand about your feelings or worries?',
    activities_transport:'What would you like us to understand about things to do or getting around?',
    health_access:'What would you like us to understand about your health or disability support?',
    finding_help:'What would you like us to understand about finding someone to talk to or ask for help?',
    other_issue:'What else would you like us to understand about your life?'
  }
};
// RAND 2011 Appendix A supplies the problems -> needs -> resources -> outcome
// sequence. The NT wording and 9 x 5 cue catalog are substituted as one block.
const RAND_CATEGORIES = [
  {
    "id": "postings_service_changes",
    "label": "Postings, time apart and leaving service",
    "hint": "Changes connected with service can affect family life in different ways.",
    "items": [
      {
        "id": "posting_uncertainty",
        "label": "Not knowing when or where a posting will be"
      },
      {
        "id": "moving_settling",
        "label": "Moving and settling into a new place"
      },
      {
        "id": "service_absences",
        "label": "Family life during deployments, training or other time apart"
      },
      {
        "id": "return_readjustment",
        "label": "Readjusting when someone returns after time away"
      },
      {
        "id": "leaving_service",
        "label": "Preparing for or adjusting to life after service"
      }
    ]
  },
  {
    "id": "housing_money_transport",
    "label": "Housing, money and getting around",
    "items": [
      {
        "id": "suitable_home",
        "label": "Finding a home that suits your household",
        "hint": "This could include space, accessibility or pets."
      },
      {
        "id": "housing_security_cost",
        "label": "Keeping a secure or affordable home"
      },
      {
        "id": "bills_financial_stress",
        "label": "Bills or financial stress"
      },
      {
        "id": "financial_information_help",
        "label": "Finding financial information or help"
      },
      {
        "id": "everyday_transport",
        "label": "Getting to work, appointments or activities"
      }
    ]
  },
  {
    "id": "work_study_training",
    "label": "Work, study and training",
    "items": [
      {
        "id": "finding_work",
        "label": "Finding suitable work"
      },
      {
        "id": "career_after_move",
        "label": "Keeping a career going after a move"
      },
      {
        "id": "study_training_access",
        "label": "Starting or continuing study or training"
      },
      {
        "id": "career_advice",
        "label": "Finding career advice or a way to use your skills"
      },
      {
        "id": "work_care_balance",
        "label": "Fitting work around caring or family responsibilities"
      }
    ]
  },
  {
    "id": "childcare_school",
    "label": "Childcare and children's schooling",
    "items": [
      {
        "id": "childcare_places",
        "label": "Finding available childcare"
      },
      {
        "id": "childcare_fit",
        "label": "Childcare hours or cost that work for your family"
      },
      {
        "id": "school_enrolment",
        "label": "Enrolling children in school after a move"
      },
      {
        "id": "learning_support",
        "label": "Learning or other support at school"
      },
      {
        "id": "children_settling",
        "label": "Children settling in and joining their community"
      }
    ]
  },
  {
    "id": "parenting_caring_disability",
    "label": "Parenting, caring and disability",
    "items": [
      {
        "id": "parenting_during_absence",
        "label": "Parenting while someone is away for service"
      },
      {
        "id": "sole_shared_parenting",
        "label": "Sole, single or shared parenting arrangements"
      },
      {
        "id": "caring_for_relative",
        "label": "Caring for an older or unwell family member"
      },
      {
        "id": "disability_support",
        "label": "Support for a family member with disability or additional needs"
      },
      {
        "id": "practical_caring_help",
        "label": "Practical help with caring responsibilities"
      }
    ]
  },
  {
    "id": "health_wellbeing",
    "label": "Health and wellbeing",
    "items": [
      {
        "id": "physical_healthcare",
        "label": "Getting physical healthcare when needed"
      },
      {
        "id": "care_after_move",
        "label": "Keeping healthcare going after a move"
      },
      {
        "id": "stress_emotional_wellbeing",
        "label": "Stress or emotional wellbeing"
      },
      {
        "id": "mental_health_support",
        "label": "Finding mental health support"
      },
      {
        "id": "grief_bereavement",
        "label": "Support through grief or bereavement"
      }
    ]
  },
  {
    "id": "relationships_safety",
    "label": "Family relationships and safety",
    "items": [
      {
        "id": "family_communication",
        "label": "Keeping in touch and communicating as a family"
      },
      {
        "id": "changing_family_roles",
        "label": "Changes in family roles or responsibilities"
      },
      {
        "id": "relationship_difficulties",
        "label": "Relationship difficulties or conflict"
      },
      {
        "id": "relationship_ending",
        "label": "Separation or the end of a relationship"
      },
      {
        "id": "feeling_safe",
        "label": "Feeling safe at home or in a relationship"
      }
    ]
  },
  {
    "id": "community_connection",
    "label": "Friends, community and things to do",
    "items": [
      {
        "id": "making_friends",
        "label": "Making or keeping friends"
      },
      {
        "id": "belonging_isolation",
        "label": "Feeling connected or less alone"
      },
      {
        "id": "defence_community",
        "label": "Staying connected to the Defence community"
      },
      {
        "id": "someone_to_turn_to",
        "label": "Having someone nearby to turn to"
      },
      {
        "id": "social_recreation",
        "label": "Things to do with other people or as a family"
      }
    ]
  },
  {
    "id": "support_navigation",
    "label": "Finding and using support",
    "items": [
      {
        "id": "knowing_available_help",
        "label": "Knowing what help is available"
      },
      {
        "id": "eligibility_application",
        "label": "Understanding who can use support and how to apply"
      },
      {
        "id": "information_for_family",
        "label": "Getting important information directly as a family member"
      },
      {
        "id": "right_person_joined_up",
        "label": "Finding the right person when several services are involved"
      },
      {
        "id": "being_heard_understood",
        "label": "Feeling heard and understood when asking for help"
      }
    ]
  }
];
const RAND_HELP_KINDS = [
  {id:'general_information',label:'Information about available support, arrangements or entitlements'},
  {id:'specific_information',label:'Specific information about our own circumstances or arrangements'},
  {id:'advocacy',label:'Someone to help us find support or speak up on our behalf'},
  {id:'advice',label:'Advice, guidance or learning useful skills'},
  {id:'social_support',label:'Emotional support or connection with other people'},
  {id:'professional_support',label:'Professional help, such as counselling, healthcare or specialist support'},
  {id:'practical_help',label:'Practical help, financial assistance or help with responsibilities'},
  {id:'activities',label:'Activities that support wellbeing or family life'},
  {id:'other',label:'Another kind of help'},
  {id:'unspecified_help',label:'Help was needed, but I am not sure what kind'},
  {id:'no_help_needed',label:'No help was needed in this area'},
  {id:'unsure_help_needed',label:'Not sure whether help was needed'}
];
const RAND_CONTACT_SOURCES = [
  {id:'defence',label:'Australian Defence or ADF support, including Defence Member and Family Support'},
  {id:'unit',label:'Military unit or workplace leadership and support'},
  {id:'other_military',label:'Support connected with another country’s military'},
  {id:'lutheran_care',label:'Lutheran Care'},
  {id:'government_community',label:'Other government or community services'},
  {id:'private_professional',label:'Private health, counselling or other professional services'},
  {id:'community_group',label:'Community, cultural, religious or activity groups'},
  {id:'family_friends',label:'Friends, family or neighbours'},
  {id:'online',label:'Websites, online forums or social media not covered above'},
  {id:'other',label:'Another source'},
  {id:'unclassified',label:'A source I cannot identify or classify'},
  {id:'none_found',label:'I looked for help but did not find a source to approach'}
];
const RAND_SEEK_RECEIPT = [
  {id:'not_sought',label:'I did not look for or ask for this help, and did not receive it'},
  {id:'sought_no_receipt',label:'I looked for or asked for this help, but did not receive it'},
  {id:'sought_received',label:'I looked for or asked for this help, and received some help'},
  {id:'unsolicited',label:'I received help without looking for or asking for it'},
  {id:'unsure',label:'Not sure'}
];
const RAND_SOURCE_OUTCOMES = [
  {id:'none_received',label:'No help received from this source'},
  {id:'received_not_met',label:'Help received, but it did not meet this need'},
  {id:'received_partly',label:'Help received, and it partly met this need'},
  {id:'received_fully',label:'Help received, and it fully met this need'},
  {id:'too_soon',label:'Help received; too soon to judge'},
  {id:'unsure',label:'Not sure'}
];
const RAND_BARRIERS = [
  {id:'where_start',label:'Not knowing where to start'},
  {id:'information_forms',label:'Information or forms were hard to understand'},
  {id:'cost',label:'Cost'},
  {id:'time_travel_care',label:'Timing, travel or caring responsibilities'},
  {id:'waits_places',label:'Long waits or no places'},
  {id:'eligibility',label:'Eligibility or referral requirements'},
  {id:'privacy_trust_career',label:'Privacy, trust or career concerns'},
  {id:'poor_fit',label:'Help did not fit our needs, culture or circumstances'},
  {id:'network_distance',label:'Friends or family were too far away or unable to help'},
  {id:'self_manage',label:'Preferred to manage without outside help'},
  {id:'situation_changed',label:'The situation changed before I sought help'},
  {id:'other',label:'Something else'},
  {id:'none',label:'None of these'},
  {id:'unsure',label:'Not sure'}
];
const RAND_MET_STATUS = [
  {id:'all',label:'All of this need was met'},
  {id:'some',label:'Some of this need was met'},
  {id:'none',label:'None of this need was met'},
  {id:'changed',label:'The situation changed and this help was no longer needed'},
  {id:'too_soon',label:'Too soon to judge'},
  {id:'unsure',label:'Not sure'}
];
const YOUTH_PROBLEMS = DOMAINS.youth.map(({id,label})=>({id,label}));
const problemCatalog = version => version==='adult'?RAND_CATEGORIES:YOUTH_PROBLEMS.map(item=>({id:item.id,label:item.label,items:[item]}));
const problemItemIds = version => problemCatalog(version).flatMap(category=>category.items.map(item=>item.id));
const selectedProblemItems = (answers,version) => problemItemIds(version).filter(id=>Array.isArray(answers.problem_cues)&&answers.problem_cues.includes(id));
const selectedProblemCategories = (answers,version) => [...problemCatalog(version).filter(category=>category.items.some(item=>selectedProblemItems(answers,version).includes(item.id))).map(category=>category.id),...(answers.problem_cues?.includes('other_problem')?['other_problem']:[])];
const selectedPriorities = (answers,version) => {
  if(answers.skip_detail_questions===true)return [];
  const categories=selectedProblemCategories(answers,version);
  return categories.length<=2?categories:categories.filter(id=>(answers.priority_categories||[]).includes(id)).slice(0,2);
};
const problemCategory = (version,id) => problemCatalog(version).find(category=>category.id===id)||(id==='other_problem'?{id,label:'Another problem',items:[{id,label:'Another problem'}]}:null);
const problemDetail = (answers,id) => answers.problem_details?.[id]||{};
const cueContextKey = (answers,version,id,cues=answers.problem_cues,otherText=answers.problem_other) => JSON.stringify({cues:id==='other_problem'?(cues||[]).includes('other_problem')?['other_problem']:[]:(problemCategory(version,id)?.items||[]).filter(item=>(cues||[]).includes(item.id)).map(item=>item.id),other:id==='other_problem'?String(otherText||'').trim():''});
const needChain = (answers,categoryId,needId) => answers.problem_details?.[categoryId]?.need_chains?.[needId]||{};
const chainKey = (categoryId,needId,name) => `need_chains:${categoryId}:${needId}:${name}`;
const selectedHelpKinds = (detail,version='adult') => (version==='youth'?YOUTH_HELP_KINDS:RAND_HELP_KINDS).filter(item=>(detail.help_kinds||[]).includes(item.id)&&!['no_help_needed','unsure_help_needed'].includes(item.id)).map(item=>item.id);
const selectedPriorityHelp = detail => {
  const help=selectedHelpKinds(detail,'adult');
  return help.length<=2?help:help.filter(id=>(detail.priority_help||[]).includes(id)).slice(0,2);
};
const helpNeeded = (detail,version='adult') => selectedHelpKinds(detail,version).length>0;
const contactedAny = detail => (detail.contact_sources||[]).some(id=>id!=='none'&&id!=='prefer'&&id!=='unsure');
const YOUTH_HELP_KINDS = [
  {id:'information',label:'Information I could understand'},
  {id:'trusted_person',label:'Someone I could talk to or ask'},
  {id:'practical_help',label:'Practical help with the situation'},
  {id:'activities',label:'Things to do or people to meet'},
  {id:'other',label:'Something else'},
  {id:'no_help_needed',label:'I did not need help with this'}
];
const YOUTH_CONTACT_SOURCES = [
  {id:'family',label:'Someone in my family'},
  {id:'friend',label:'A friend'},
  {id:'school',label:'Someone at school'},
  {id:'health',label:'A health or counselling worker'},
  {id:'community',label:'A youth or community service'},
  {id:'online',label:'Online or phone help'},
  {id:'other',label:'Someone else'},
  {id:'none',label:'I did not ask anyone'}
];
const issueIds = version => [...(ISSUE_GROUPS[version]||[]).flatMap(group=>group.ids),OTHER_ISSUE];
const selectedIssues = (answers,version) => issueIds(version).filter(id=>Array.isArray(answers.issue_cues)&&answers.issue_cues.includes(id));
const accountById = (answers,id) => String(id||'').startsWith('draft-')?answers.topic_drafts?.[String(id).slice(6)]:(answers.accounts||[]).find(account=>account.id===id);
const topicPrimary = (answers,id) => (answers.accounts||[]).find(account=>account.id===answers.topic_primary?.[id]);
function topicDraft(answers,id) {
  answers.topic_drafts||={};
  return answers.topic_drafts[id] ||= {id:`draft-${id}`,kind:'',topic_id:id};
}
const topicAccount = (answers,id) => topicPrimary(answers,id)||topicDraft(answers,id);
function commitTopicDraft(answers,id) {
  if(topicPrimary(answers,id))return true;
  const draft=answers.topic_drafts?.[id];
  if(!draft||!accountHasAnswer(draft))return true;
  const kind=ACCOUNT_KINDS.includes(draft.kind)?draft.kind:'unspecified';
  if(!addAccount(answers,kind,id))return false;
  const account=answers.accounts.at(-1);
  for(const key of ['story','help_status','useful_change','helped','difficult','detail_open','prompt_open','proposal_type','practical_opt_in','practical_detail'])if(Object.hasOwn(draft,key))account[key]=draft[key];
  answers.topic_primary||={};answers.topic_primary[id]=account.id;
  delete answers.topic_drafts[id];
  return true;
}
const describedProposalText = account => String(account?.useful_change||'').trim()||(['future','unspecified'].includes(account?.kind)?String(account.story||'').trim():'');
const describedChange = account => Boolean(describedProposalText(account));
const practicalEligible = account => Boolean(OFFER_TYPES.includes(account?.proposal_type)&&describedProposalText(account));
const accountHasAnswer = account => ['story','help_status','useful_change','helped','difficult','practical_detail'].some(key=>String(account?.[key]||'').trim());
const priorityChoices = answers => (answers.accounts||[]).filter(describedChange);
function addAccount(answers,kind,topicId='') {
  if(!ACCOUNT_KINDS.includes(kind))throw new TypeError('Choose an experience or future idea.');
  answers.accounts||=[];
  if(answers.accounts.length>=MAX_ACCOUNTS)return null;
  const highest=answers.accounts.reduce((n,account)=>Math.max(n,Number(/^a(\d+)$/.exec(account.id)?.[1])||0),0);
  const number=Math.max(Number(answers.account_next_id)||1,highest+1);
  const account={id:`a${number}`,kind};
  if(topicId)account.topic_id=topicId;
  answers.accounts.push(account);
  answers.account_next_id=number+1;
  return account;
}
function removeAccount(answers,id) {
  const before=(answers.accounts||[]).length;
  answers.accounts=(answers.accounts||[]).filter(account=>account.id!==id);
  for(const [topic,primary] of Object.entries(answers.topic_primary||{}))if(primary===id)delete answers.topic_primary[topic];
  if(priorityChoices(answers).length<2)delete answers.priority_reason;
  return answers.accounts.length<before;
}
function discardEmptyAccount(answers,id) {
  const account=accountById(answers,id);
  return account&&!accountHasAnswer(account)?removeAccount(answers,id):false;
}
const activeFutureAreas = answers => Object.entries(answers.areas||{}).filter(([id])=>(answers.future_needs||[]).includes(id)).map(([,area])=>area);
const liveParticipation = answers => activeFutureAreas(answers).some(area=>(area.formats||[]).some(v=>['one_to_one','group','phone','video_one_to_one','online_group'].includes(v)));
const inPersonParticipation = answers => activeFutureAreas(answers).some(area=>(area.formats||[]).some(v=>['one_to_one','group'].includes(v)));
const relevantChildStage = answers => [...(answers.needs||[]),...(answers.future_needs||[])].some(v=>['childcare','schooling','parenting_caring'].includes(v));
const hasNeedSelection = answers => ['yes','unsure'].includes(answers.needs_status);
function toggleChoice(current,value,exclusive=[]) {
  const values=Array.isArray(current)?current:[];
  if(values.includes(value))return values.filter(v=>v!==value);
  if(exclusive.includes(value))return [value];
  return [...values.filter(v=>!exclusive.includes(v)),value];
}
function selectedNeeds(answers,domains) {
  if(!hasNeedSelection(answers))return [];
  return (Array.isArray(answers.needs)?answers.needs:[]).filter(id=>domains.some(d=>d.id===id));
}
function selectedFutureNeeds(answers,domains) {
  return (Array.isArray(answers.future_needs)?answers.future_needs:[]).filter(id=>domains.some(d=>d.id===id)||id==='future_other_need');
}
function selectedDetailNeeds(answers,domains,version) {
  const past=selectedNeeds(answers,domains);
  return version==='child'?past:[...new Set([...past,...selectedFutureNeeds(answers,domains)])];
}
function selectedFocusNeed(answers,domains) {
  const ids=selectedDetailNeeds(answers,domains,'youth');
  return ids.includes(answers.focus_need)?answers.focus_need:null;
}
function detailedNeeds(answers,domains,version) {
  if(version!=='youth')return selectedDetailNeeds(answers,domains,version);
  const focus=selectedFocusNeed(answers,domains);
  return focus?[focus]:[];
}
function reconcileAreaSelection(answers,domains,version) {
  const retained=version==='youth'?(selectedFocusNeed(answers,domains)?[answers.focus_need]:[]):selectedDetailNeeds(answers,domains,version);
  answers.areas=Object.fromEntries(Object.entries(answers.areas||{}).filter(([id])=>retained.includes(id)).map(([id,area])=>{
    if(!selectedNeeds(answers,domains).includes(id))for(const key of ['received','sources','service_names','barriers','comment'])delete area[key];
    delete area.additional_support_now;
    return [id,area];
  }));
  if(!liveParticipation(answers)){delete answers.times;delete answers.time_other;}
  if(!inPersonParticipation(answers)){delete answers.in_person_areas;delete answers.in_person_other;}
}
function hasFormalSource(area) { return (area.sources||[]).some(v=>['military','community','health','school','online','other'].includes(v)); }
function hasSoughtHelp(area) { return (area.sources||[]).some(v=>!['not_sought','unsure','prefer'].includes(v)); }
function residenceScope(answers) {
  if(answers.residence_area==='outside')return 'outside_greater_darwin';
  if(LOCAL_AREAS.includes(answers.residence_area))return 'greater_darwin';
  return 'not_disclosed_or_unspecified';
}
function consultationRoute(answers) {
  if(residenceScope(answers)==='outside_greater_darwin')return answers.work_posting_greater_darwin==='yes'?'current_local':answers.past_residence==='no'?'outside_scope':'earlier_experience';
  return residenceScope(answers)==='greater_darwin'?'current_local':'residence_unspecified';
}
function reconcileAnswers(answers,changed,domains,previous) {
  if(changed.startsWith('accounts:')){
    const [,id,key]=changed.split(':');
    const account=accountById(answers,id);
    if(account){
      if(key==='kind'&&account.kind!=='experience')for(const name of ['help_status','helped','difficult','detail_open'])delete account[name];
      if(key==='proposal_type'&&previous!==account.proposal_type)delete account.practical_detail;
      if(['story','useful_change'].includes(key)&&!describedProposalText(account)){delete account.practical_opt_in;delete account.practical_detail;}
      if(['proposal_type','story','useful_change'].includes(key)&&!practicalEligible(account))delete account.practical_detail;
      if(priorityChoices(answers).length<2)delete answers.priority_reason;
    }
  }
  // Cue selections are reminders. They never delete an account already written.
  if(changed==='issue_cues')for(const id of Object.keys(answers.topic_drafts||{}))if(!selectedIssues(answers,state.version).includes(id)&&!commitTopicDraft(answers,id))answers.issue_cues.push(id);
  if(['problem_cues','problem_other'].includes(changed)){
    const oldCues=changed==='problem_cues'?(Array.isArray(previous)?previous:[]):answers.problem_cues;
    const oldOther=changed==='problem_other'?previous:answers.problem_other;
    for(const category of [...problemCatalog(state.version),{id:'other_problem'}]){
      const before=cueContextKey(answers,state.version,category.id,oldCues,oldOther),after=cueContextKey(answers,state.version,category.id);
      if(before===after)continue;
      const active=answers.problem_details?.[category.id];
      answers.inactive_problem_details||={};answers.inactive_problem_details[category.id]||={};
      const archived=answers.inactive_problem_details[category.id];
      if(active){archived[before]=structuredClone(active);delete answers.problem_details[category.id];}
      if(JSON.parse(after).cues.length&&archived[after]){answers.problem_details||={};answers.problem_details[category.id]=archived[after];delete archived[after];}
    }
  }
  if(changed.startsWith('problem_details:')){
    const [,id,key]=changed.split(':');
    const detail=answers.problem_details?.[id];
    if(detail&&key==='help_kinds')detail.priority_help=(detail.priority_help||[]).filter(value=>selectedHelpKinds(detail,state.version).includes(value));
    if(detail&&key==='anyone_helped'&&detail.anyone_helped!=='yes')delete detail.enough;
  }
  if(changed.startsWith('need_chains:')){
    const [,categoryId,needId,key]=changed.split(':');
    const chain=needChain(answers,categoryId,needId);
    if(key==='seek_receipt'&&previous!==chain.seek_receipt){
      for(const name of ['source_outcomes','bridge','barriers','barrier_note','met_status','current_gap','gap_detail'])delete chain[name];
      if(chain.seek_receipt==='not_sought'){delete chain.sources;delete chain.source_other;}
      else if(['sought_received','unsolicited'].includes(chain.seek_receipt)&&(chain.sources||[]).includes('none_found')){delete chain.sources;delete chain.source_other;}
    }
  }
  if(changed==='residence_area'&&previous!==answers.residence_area){delete answers.suburb;delete answers.suburb_other;}
  if(changed==='suburb'&&answers.suburb!=='other')delete answers.suburb_other;
  if(changed==='needs_status'&&!hasNeedSelection(answers)){delete answers.needs;delete answers.needs_other;}
  if(changed==='needs') {
    const ids=selectedNeeds(answers,domains);
    if(!ids.includes('other_need'))delete answers.needs_other;
  }
  if(changed==='future_needs'&&!selectedFutureNeeds(answers,domains).includes('future_other_need'))delete answers.future_needs_other;
  if(changed==='future_needs'){
    const ids=selectedFutureNeeds(answers,domains);
    if(ids.length<2||!(ids.includes(answers.future_priority)||['equal','unsure','prefer'].includes(answers.future_priority)))delete answers.future_priority;
  }
  if(changed==='needs_other'&&answers.areas)delete answers.areas.other_need;
  if(changed==='future_needs_other'&&answers.areas)delete answers.areas.future_other_need;
  if(['needs_status','needs','future_needs'].includes(changed)&&!selectedDetailNeeds(answers,domains,state.version).includes(answers.focus_need))delete answers.focus_need;
  if(['needs_status','needs','future_needs','focus_need'].includes(changed))reconcileAreaSelection(answers,domains,state.version);
  if(changed.startsWith('areas:')) {
    const [,id,key]=changed.split(':');
    if(key==='sources'&&answers.areas?.[id]){const branch=values=>(values||[]).some(v=>!['not_sought','unsure','prefer'].includes(v))?'sought':(values||[]).includes('not_sought')?'not_sought':'unspecified';if(branch(previous)!==branch(answers.areas[id].sources))delete answers.areas[id].barriers;}
    if(key==='sources'&&answers.areas?.[id]&&!hasFormalSource(answers.areas[id]))delete answers.areas[id].service_names;
    if(key==='formats'&&!(answers.areas?.[id]?.formats||[]).includes('other'))delete answers.areas[id].format_other;
    if(key==='formats'){
      if(!liveParticipation(answers)){delete answers.times;delete answers.time_other;}
      if(!inPersonParticipation(answers)){delete answers.in_person_areas;delete answers.in_person_other;}
    }
  }
  if(['residence_area','past_residence','work_posting_greater_darwin'].includes(changed)) {
    const before=consultationRoute({...answers,[changed]:previous}),after=consultationRoute(answers);
    if((before==='earlier_experience')!==(after==='earlier_experience')||(before==='outside_scope')!==(after==='outside_scope')){
      for(const key of ['problem_cues','problem_other','priority_categories','problem_details','positive_support','future_need','issue_cues','issue_other','topic_drafts','topic_primary','accounts','account_next_id','priority_reason','closing_note','needs_status','needs','needs_other','future_needs','future_needs_other','future_ideas','future_priority','focus_need','areas','in_person_areas','in_person_other','times','time_other','participation_enablers','enablers_other','practical_note','earlier_experience','time_nt','children_ages'])delete answers[key];
    }
    if(answers.residence_area!=='outside')delete answers.past_residence;
  }
  if(['needs','needs_status','future_needs'].includes(changed)&&!relevantChildStage(answers))delete answers.children_ages;
  if(changed==='participation_enablers'&&!(answers.participation_enablers||[]).includes('other'))delete answers.enablers_other;
  if(changed==='times'&&!(answers.times||[]).includes('other'))delete answers.time_other;
  if(changed==='in_person_areas'&&!(answers.in_person_areas||[]).includes('other'))delete answers.in_person_other;
  if(changed==='assistance'&&previous!==answers.assistance)delete answers.guardian_present;
  // Future interests are independent of past support needs.
}
function buildSteps(answers,domains,version) {
  if(consultationRoute(answers)==='earlier_experience')return [{id:'connection',phase:0},{id:'earlier',phase:1},{id:'review',phase:2}];
  const steps=[{id:'connection',phase:0},...(version==='youth'?[]:[{id:'place',phase:0}])];
  if(version==='child'){
    steps.push({id:'needs',phase:1});
    for(const need of detailedNeeds(answers,domains,version))steps.push({id:'area:'+need,phase:2,need});
  }else{
    steps.push({id:'problem_screen',phase:1});
    if(selectedProblemCategories(answers,version).length>2&&!answers.skip_detail_questions)steps.push({id:'priority_pick',phase:1});
    for(const id of selectedPriorities(answers,version)){
      steps.push({id:`problem_detail:${id}`,phase:1,detail_category:id});
      if(version==='adult')for(const needId of selectedPriorityHelp(problemDetail(answers,id)))steps.push({id:`need_chain:${id}:${needId}`,phase:1,chain_category:id,chain_need:needId});
    }
    steps.push({id:'positive_future',phase:2});
    // Extra accounts are voluntary supplements, never an automatic page per cue.
    for(const account of answers.accounts||[])steps.push({id:`account:${account.id}`,phase:2,account_id:account.id});
    steps.push({id:(answers.accounts||[]).length?'accounts_manage':'accounts_start',phase:2});
  }
  steps.push({id:'review',phase:3});
  return steps;
}
function hasAnswer(value) { return value!==undefined&&value!==null&&value!==''&&(!Array.isArray(value)||value.length>0); }
function cleanAccountExport(input) {
  const account={id:String(input.id),kind:input.kind};
  if(typeof input.topic_id==='string')account.topic_id=input.topic_id;
  for(const key of ['story','useful_change'])if(typeof input[key]==='string')account[key]=input[key];
  if(input.kind==='experience'){
    if(['enough','some','wanted_no_useful','wanted_not_sought','no_need','unsure','prefer'].includes(input.help_status))account.help_status=input.help_status;
    if(input.detail_open===true){
      account.detail_open=true;
      for(const key of ['helped','difficult'])if(typeof input[key]==='string')account[key]=input[key];
    }
  }
  if(input.prompt_open===true)account.prompt_open=true;
  if(input.prompt_open===true||input.practical_opt_in===true){
    if(['information','conversation','activity','process','other','unsure'].includes(input.proposal_type))account.proposal_type=input.proposal_type;
  }
  if(practicalEligible(input)&&input.practical_opt_in===true){
    account.practical_opt_in=true;
    if(typeof input.practical_detail==='string')account.practical_detail=input.practical_detail;
  }
  return account;
}
function cleanNeedChain(input) {
  const chain={};
  if(typeof input.specific_for_need==='string')chain.specific_for_need=input.specific_for_need;
  if(RAND_SEEK_RECEIPT.some(option=>option.id===input.seek_receipt))chain.seek_receipt=input.seek_receipt;
  if(chain.seek_receipt&&chain.seek_receipt!=='not_sought'){
    const sources=RAND_CONTACT_SOURCES.filter(item=>item.id!=='none_found'||['sought_no_receipt','unsure'].includes(chain.seek_receipt)).map(item=>item.id).filter(id=>(input.sources||[]).includes(id));
    chain.sources=sources.includes('none_found')?['none_found']:sources;
    if(chain.sources.includes('other')&&typeof input.source_other==='string')chain.source_other=input.source_other;
    if(['sought_received','unsolicited','unsure'].includes(chain.seek_receipt)){
      chain.source_outcomes=Object.fromEntries(chain.sources.filter(id=>id!=='none_found'&&RAND_SOURCE_OUTCOMES.some(option=>option.id===input.source_outcomes?.[id])).map(id=>[id,input.source_outcomes[id]]));
    }
  }
  if(chain.seek_receipt){
    const barrierIds=RAND_BARRIERS.filter(item=>chain.seek_receipt==='not_sought'||!['self_manage','situation_changed'].includes(item.id)).map(item=>item.id);
    const barriers=barrierIds.filter(id=>(input.barriers||[]).includes(id));
    chain.barriers=barriers.includes('none')?['none']:barriers.includes('unsure')?['unsure']:barriers;
    if(typeof input.barrier_note==='string')chain.barrier_note=input.barrier_note;
  }
  if(['sought_received','unsolicited','unsure'].includes(chain.seek_receipt)&&typeof input.bridge==='string')chain.bridge=input.bridge;
  if(RAND_MET_STATUS.some(option=>option.id===input.met_status))chain.met_status=input.met_status;
  if(['yes','no','unsure'].includes(input.current_gap))chain.current_gap=input.current_gap;
  if(chain.current_gap==='yes'&&typeof input.gap_detail==='string')chain.gap_detail=input.gap_detail;
  return chain;
}
function cleanProblemDetail(input,version,allowedFocus=[]) {
  const detail={};
  if(version==='youth'){
    for(const key of ['story','needed_help','remaining_need'])if(typeof input[key]==='string')detail[key]=input[key];
    for(const key of ['asked_anyone','anyone_helped'])if(['yes','no','unsure'].includes(input[key]))detail[key]=input[key];
    if(input.anyone_helped==='yes'&&['yes','some','no','unsure'].includes(input.enough))detail.enough=input.enough;
    return detail;
  }
  detail.focus_problems=allowedFocus.filter(id=>(input.focus_problems||[]).includes(id));
  const selected=RAND_HELP_KINDS.map(item=>item.id).filter(id=>(input.help_kinds||[]).includes(id));
  detail.help_kinds=selected.includes('no_help_needed')?['no_help_needed']:selected.includes('unsure_help_needed')?['unsure_help_needed']:selected;
  if(detail.help_kinds.includes('other')&&typeof input.other_help==='string')detail.other_help=input.other_help;
  const relevant=selectedHelpKinds(detail,'adult');
  if(relevant.length>2)detail.priority_help=relevant.filter(id=>(input.priority_help||[]).includes(id)).slice(0,2);
  if(typeof input.specific_need==='string')detail.specific_need=input.specific_need;
  detail.need_chains=Object.fromEntries(selectedPriorityHelp({...detail,priority_help:detail.priority_help||[]}).map(needId=>[needId,cleanNeedChain(input.need_chains?.[needId]||{})]));
  return detail;
}
function cleanExport(answers,version,domains) {
  const route=consultationRoute(answers),copy={};
  const allowed=['roles','residence_area','suburb','suburb_other','past_residence','work_posting_greater_darwin','assistance','guardian_present'];
  if(version==='adult')allowed.push('age_group');
  if(route==='earlier_experience')allowed.push('earlier_experience');
  else if(route!=='outside_scope'&&version==='child')allowed.push('needs_status','needs','needs_other','time_nt','children_ages');
  else if(route!=='outside_scope')allowed.push('time_nt','positive_support','future_need');
  for(const key of allowed)if(Object.hasOwn(answers,key))copy[key]=structuredClone(answers[key]);
  if(version==='youth')delete copy.time_nt;
  if(!AREAS.some(area=>area.id===copy.residence_area))delete copy.residence_area;
  const locality=GEOGRAPHY?.localities.find(item=>item.id===copy.suburb&&item.region===copy.residence_area);
  if(LOCAL_AREAS.includes(copy.residence_area)){
    copy.region=copy.residence_area;
    if(!locality&&!['other','prefer'].includes(copy.suburb))delete copy.suburb;
  }else{
    delete copy.suburb;delete copy.suburb_other;
    if(copy.residence_area==='outside')copy.region='outside_greater_darwin';
  }
  if(copy.suburb!=='other')delete copy.suburb_other;
  if(copy.residence_area!=='outside')delete copy.past_residence;
  const locationPrecision=locality?'suburb':copy.suburb==='other'&&copy.suburb_other?.trim()?'other_locality':LOCAL_AREAS.includes(copy.residence_area)||copy.residence_area==='outside'?'area':'not_stated';
  if(Object.hasOwn(copy,'age_group')&&!ADULT_AGE_GROUPS.some(group=>group.id===copy.age_group))delete copy.age_group;
  if(!['self','guardian','other'].includes(copy.assistance)||version==='adult')delete copy.assistance;
  if(!['self','other'].includes(copy.assistance)||copy.guardian_present!==true)delete copy.guardian_present;
  if(route!=='earlier_experience'&&route!=='outside_scope'&&version==='child') {
    const ids=detailedNeeds(answers,domains,version);
    const past=selectedNeeds(answers,domains),future=version==='child'?[]:selectedFutureNeeds(answers,domains);
    if(!hasNeedSelection(answers))delete copy.needs;
    if(!past.includes('other_need'))delete copy.needs_other;
    if(!future.includes('future_other_need'))delete copy.future_needs_other;
    copy.areas=Object.fromEntries(ids.map(id=>{
      const input=answers.areas?.[id]||{},area={};
      for(const key of ['received','support_requested','sources','service_names','barriers','comment','formats','format_other'])if(Object.hasOwn(input,key))area[key]=structuredClone(input[key]);
      if(!past.includes(id))for(const key of ['received','sources','service_names','barriers','comment'])delete area[key];
      if(!hasFormalSource(area)||version!=='adult')delete area.service_names;
      if(!hasSoughtHelp(area)&&!area.sources?.includes('not_sought'))delete area.barriers;
      if(!future.includes(id))for(const key of ['support_requested','formats','format_other'])delete area[key];
      if(!(area.formats||[]).includes('other'))delete area.format_other;
      return [id,area];
    }));
    if(version!=='adult'||future.length<2||!(future.includes(copy.future_priority)||['equal','unsure','prefer'].includes(copy.future_priority)))delete copy.future_priority;
    if(!relevantChildStage(copy))delete copy.children_ages;
    if(!liveParticipation(copy))delete copy.times;
    if(!(copy.times||[]).includes('other'))delete copy.time_other;
    if(!inPersonParticipation(copy)){delete copy.in_person_areas;delete copy.in_person_other;}
    if(!(copy.in_person_areas||[]).includes('other'))delete copy.in_person_other;
    if(!(copy.participation_enablers||[]).includes('other'))delete copy.enablers_other;
    if(future.length===0){delete copy.participation_enablers;delete copy.enablers_other;delete copy.practical_note;}
  }else if(route!=='earlier_experience'&&route!=='outside_scope'){
    const cueIds=[...problemItemIds(version),'other_problem','none','prefer'];
    const rawCues=cueIds.filter(id=>Array.isArray(answers.problem_cues)&&answers.problem_cues.includes(id));
    copy.problem_cues=rawCues.includes('none')?['none']:rawCues.includes('prefer')?['prefer']:rawCues;
    if(copy.problem_cues.includes('other_problem')&&typeof answers.problem_other==='string')copy.problem_other=answers.problem_other;
    if(answers.skip_detail_questions===true)copy.skip_detail_questions=true;
    copy.priority_categories=selectedPriorities({...answers,problem_cues:copy.problem_cues},version);
    copy.problem_details=Object.fromEntries(copy.priority_categories.map(id=>{
      const focus=(problemCategory(version,id)?.items||[]).filter(item=>copy.problem_cues.includes(item.id)).map(item=>item.id);
      const active=problemDetail(answers,id);
      return [id,cleanProblemDetail(active.cue_context_key&&active.cue_context_key!==cueContextKey({...answers,problem_cues:copy.problem_cues},version,id)?{}:active,version,focus)];
    }));
    const input=(Array.isArray(answers.accounts)?answers.accounts:[]).filter(accountHasAnswer);
    if(input.length>MAX_ACCOUNTS)throw new RangeError(`This review can hold at most ${MAX_ACCOUNTS} accounts; none were silently discarded.`);
    const seen=new Set();
    copy.accounts=input.map(item=>{
      if(!item||!ACCOUNT_KINDS.includes(item.kind)||!/^a\d+$/.test(String(item.id))||seen.has(item.id))throw new TypeError('The account list has an invalid or repeated ID.');
      seen.add(item.id);
      const account=cleanAccountExport(item);
      delete account.topic_id;
      return account;
    });
  }
  const hasRecentExperience=version==='child'?selectedNeeds(answers,domains).length>0:copy.problem_cues?.some(id=>!['none','prefer'].includes(id))||copy.accounts?.some(account=>account.kind==='experience');
  return {schema_version:version==='child'?'7.2':'9.0',questionnaire_revision:version==='child'?'2026-09-28-topic-linked-support':'2026-09-29-rand-linked-needs',max_accounts:version==='child'?null:MAX_ACCOUNTS,max_detail_chains:version==='adult'?4:null,location_precision:locationPrecision,geography_version:GEOGRAPHY?.version||null,consultation_route:route,residence_scope:residenceScope(copy),recall_months:route==='earlier_experience'||!hasRecentExperience?null:version==='adult'?12:3,recall_geography:hasRecentExperience?'time_living_or_working_in_greater_darwin':null,analysis_unit:'respondent_perspective_not_household',measurement_scope:version==='child'?'local_support_experiences':version==='adult'?'rand_derived_local_needs_chain':'youth_condensed_needs_chain',details_optional:true,collection_mode:'internal_review_no_transmission',questionnaire_version:version,storage:'page_memory_only; not submitted',answers:copy};
}

const main = document.querySelector('#main');
const phases = ['About you','Experiences and ideas','Review'];
const state = { version:'adult', age:null, ageAudience:null, ageRoute:null, answers:{}, step:'connection', screen:'welcome', returnToReview:false, returnToManage:false, returnToTopic:'', participation:null, guardianPermission:null,youngController:null,youngRecord:null };
const SURVEY_INVITATION = {"title": "Defence Family Support Survey", "greeting": "Hello, Defence community!", "paragraphs": ["Lutheran Care wants to understand the real needs of Defence personnel and families who live or work in Greater Darwin, or have a posting connected with this area.", "The questions cover difficulties, help that was needed or received, support that has worked, and what may be needed next. You can mention needs beyond Lutheran Care’s own services.", "Your answers would help plan support and connections; this preview does not sign you up for anything."], "funding": "Lutheran Care received funding from Defence Member and Family Support, a branch of the Commonwealth Department of Defence, to deliver this project."};
const PARTICIPANT_NOTICE_VERSION = '2026-09-28-v12-preview';
// Preview participant wording. The public build has no response receiver.
const PARTICIPANT_INFORMATION = [
  ['Your choice', 'Trying this preview is voluntary. Most questions are optional.'],
  ['Privacy', 'This preview does not send or save your answers. They remain in this browser page until you close or reload it. Please leave out names, addresses, service numbers and other identifying details. The separate contact form does not receive your survey answers.'],
  ['Future consultation', 'If Lutheran Care later opens a live survey, it will explain how answers are collected, stored, used to plan the Defence Family Support Program and shared with Defence. A live survey would require its own collection and privacy arrangements.'],
  ['Before you finish', 'There is no submission in this preview. You can stop and clear your answers at any time.'],
  ['Questions or complaints', 'Contact <a href="mailto:feedback@lutherancare.org.au">feedback@lutherancare.org.au</a>. Our <a href="https://www.lutherancare.org.au/privacy-policy/" target="_blank" rel="noopener">Privacy Policy</a> explains your rights, including access, correction and complaints.'],
  ['If you need support', 'This survey is not a request for services. In an emergency in Australia, call 000. For domestic, family or sexual violence support, contact <a href="https://www.1800respect.org.au/" target="_blank" rel="noopener">1800RESPECT</a> on 1800 737 732.']
];
function participantInformationHTML(id='participant-information') {
  return `<section class="participant-information" id="${id}" aria-labelledby="${id}-title"><h2 id="${id}-title">Taking part and your information</h2><div class="notice-grid">${PARTICIPANT_INFORMATION.map(([label,body])=>`<p><strong>${label}</strong> ${body}</p>`).join('')}</div></section>`;
}
function questionnaireVersion(age) {
  return age==='adult'?'adult':['youth_younger','youth_older'].includes(age)?'youth':'child';
}
function needsGuardianPermission(age) { return ['child','youth_younger','young'].includes(age); }
function guardianPermissionRecord(age, permitted) {
  if(!needsGuardianPermission(age)||!permitted) return null;
  return {notice_version:PARTICIPANT_NOTICE_VERSION,age_path:age,kind:'parent_guardian_permission',agreed:true,recorded_at:new Date().toISOString(),context:'internal_review'};
}
function participationRecord(age, accepted, permission=null) {
  if(!accepted || !['adult','youth_older','youth_younger','child'].includes(age)) return null;
  if(needsGuardianPermission(age) && (!permission?.agreed || permission.age_path!==age)) return null;
  return {notice_version:PARTICIPANT_NOTICE_VERSION,age_path:age,kind:needsGuardianPermission(age)?'assent':'consent',agreed:true,guardian_permission:needsGuardianPermission(age)?permission:null,recorded_at:new Date().toISOString(),context:'internal_review'};
}
function hasValidParticipation() {
  return Boolean(state.participation?.agreed && state.participation.age_path===state.age && (!needsGuardianPermission(state.age) || state.guardianPermission?.agreed && state.guardianPermission.age_path===state.age));
}
function isOutsideSurveyScope(answers) {
  return Boolean(answers.roles?.includes('none')) || consultationRoute(answers)==='outside_scope';
}

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const opts = pairs => pairs.map(([id,label,hint]) => ({id,label,hint}));
const ADULT_AGE_GROUPS = opts([['18_29','18–29'],['30_39','30–39'],['40_49','40–49'],['50_plus','50 or older']]);
const domainList = () => [...DOMAINS[state.version],{id:'other_need',label:'Something else'}];
const futureDomainList = () => [...DOMAINS[state.version],{id:'future_other_need',label:'Something else'}];
const domainLabel = id => id===OTHER_ISSUE?(state.answers.issue_other?.trim()||'Another issue'):id==='other_need' ? (state.answers.needs_other || 'Something else') : id==='future_other_need' ? (state.answers.future_needs_other || 'Something else') : domainList().find(d=>d.id===id)?.label || id;
const isAdult = () => state.version==='adult';
const isChild = () => state.version==='child';
const period = () => isAdult()?'the past 12 months':'the past three months';
const privacyHint = () => isAdult()?'Please leave out names or other details that could identify someone.':'Please leave out names, addresses and school names.';
function getValue(key) {
  const [kind,id,fieldName,extra,sourceId]=key.split(':');
  if(kind==='need_chains')return needChain(state.answers,id,fieldName)?.[extra];
  if(kind==='source_outcomes')return needChain(state.answers,id,fieldName)?.source_outcomes?.[extra];
  return kind==='areas'?state.answers.areas?.[id]?.[fieldName]:kind==='accounts'?accountById(state.answers,id)?.[fieldName]:kind==='problem_details'?state.answers.problem_details?.[id]?.[fieldName]:state.answers[key];
}
function setValue(key,value) {
  const [kind,id,fieldName,extra]=key.split(':');
  if(kind==='areas'){state.answers.areas||={};state.answers.areas[id]||={};state.answers.areas[id][fieldName]=value;}
  else if(kind==='accounts'){const account=accountById(state.answers,id);if(account)account[fieldName]=value;}
  else if(kind==='problem_details'){state.answers.problem_details||={};state.answers.problem_details[id]||={};state.answers.problem_details[id].cue_context_key||=cueContextKey(state.answers,state.version,id);state.answers.problem_details[id][fieldName]=value;}
  else if(kind==='need_chains'||kind==='source_outcomes'){
    state.answers.problem_details||={};state.answers.problem_details[id]||={};
    const detail=state.answers.problem_details[id];detail.cue_context_key||=cueContextKey(state.answers,state.version,id);detail.need_chains||={};detail.need_chains[fieldName]||={};
    if(kind==='need_chains')detail.need_chains[fieldName][extra]=value;
    else {detail.need_chains[fieldName].source_outcomes||={};detail.need_chains[fieldName].source_outcomes[extra]=value;}
  }
  else state.answers[key]=value;
}
const maxTextLength = version => version==='adult'?5000:1500;
const info = '';
const PREFER = {id:'prefer',label:'Prefer not to answer'};
const UNSURE = {id:'unsure',label:'Not sure'};
const GEOGRAPHY = globalThis.SURVEY_GEOGRAPHY || globalThis.window?.SURVEY_GEOGRAPHY;
const AREAS = GEOGRAPHY?.areas || [];
const LOCAL_AREAS = ['darwin','palmerston','litchfield','greater_darwin_other'];
const suburbs = [...(GEOGRAPHY?.localities || []),{id:'other',label:'Another suburb or locality in this area'},{id:'prefer',label:'Prefer not to say'}];
function suburbChoice(value) {
  const typed=String(value||'').trim().toLocaleLowerCase('en-AU');
  return suburbs.find(option=>[option.label,...(option.aliases||[])].some(label=>label.toLocaleLowerCase('en-AU')===typed));
}
function suburbsForArea(area) {
  if(!LOCAL_AREAS.includes(area))return [];
  return suburbs.filter(option=>option.region===area||['other','prefer'].includes(option.id));
}
function suburbFields() { return [
  field('residence_area','Which area do you live in?','single',AREAS,'Optional. This helps us plan where and how to offer support.'),
  field('suburb','Which suburb or locality?','select',suburbsForArea(state.answers.residence_area),'Optional. You can leave this blank.',{conditional:'local_area',placeholder:'Not specified'}),
  field('suburb_other','Which other suburb or locality?','short',[],'',{conditional:'other_suburb'}),
  field('past_residence','Have you lived in Greater Darwin before?','single',opts([['yes','Yes'],['no','No'],['unsure','Not sure'],['prefer','Prefer not to say']]),'',{conditional:'outside_suburb'})
]; }
const adequacy = () => opts([['enough',isAdult()?'Enough to meet my needs':'I got enough help'],['some',isAdult()?'Some, but not enough':'I got some help, but needed more'],['none',isAdult()?'None':'I did not get any help'],['unsure','Not sure'],['prefer','Prefer not to answer']]);
const roleOptions = () => isAdult() ? opts([['serving','I am a current or former Australian Defence Force (ADF) member'],['partner','I am a partner, spouse or former partner of an ADF member'],['child','I am the child of a current or former ADF member'],['parent','I am the parent of a current or former ADF member'],['other_family','I am another family member or carer of a current or former ADF member'],['none','None of these']]) : opts([['child','My parent or carer serves or has served in the Australian Defence Force (ADF)'],['other_family','Someone else in my family serves or has served in the ADF'],['none','Neither of these'],['unsure','Not sure']]);
const field = (key,label,type,options=[],hint=info,extra={}) => ({key,label,type,options,hint,...extra});
function areaSources() { return isAdult()?opts([['family','Family or friends'],['military','Military support services'],['community','A community group or service'],['health','A health professional or service'],['school','A school, college or university'],['online','Online information or support'],['other','Somewhere else'],['not_sought','I have not looked for help'],['unsure','Not sure'],['prefer','Prefer not to answer']]):opts([['family','A parent, carer or someone in my family'],['friends','A friend'],['school','Someone at school'],['community','A youth worker or community group'],['health','A doctor, counsellor or other health worker'],['online','An online or phone support service'],['other','Someone else'],['not_sought','I have not asked anyone'],['unsure','Not sure'],['prefer','Prefer not to answer']]); }
function areaBarrierField(need) {
  const a=state.answers.areas?.[need]||{},child=isChild();
  const sought=hasSoughtHelp(a),notSought=a.sources?.includes('not_sought');
      const experiencedChild = BARRIERS.child.map(o=>({...o,label:({'I do not know who to ask':'I did not know who to ask','It is hard to explain':'It was hard to explain','I feel worried about asking':'I felt worried about asking'})[o.label]||o.label}));
      const experiencedYouth = BARRIERS.youth.map(o=>({...o,label:({'Not knowing where to go':'I did not know where to go','Not having someone I trust to ask':'I did not have someone I trusted to ask','Worrying about who would be told':'I worried about who would be told','Feeling that people would not understand':'I felt people would not understand','Finding a suitable time':'Finding a suitable time','Not feeling ready to ask':'I did not feel ready to ask'})[o.label]||o.label}));
      const list=sought?(state.version==='youth'?experiencedYouth:child?experiencedChild:BARRIERS.adult):notSought?(isAdult()?opts([['not_needed_yet','I have been managing without outside help'],['dont_know','I do not know where to go'],['eligibility_concern','I am unsure whether I am eligible'],['cost_concern','I expect it would cost too much'],['time','I have not had the time or opportunity'],['privacy','I am concerned about privacy'],['trust','I am not sure people would understand'],['self_reliance','I prefer to manage this myself'],['language','Language or communication would be difficult'],['access','Travel or accessibility would be difficult'],['other','Another reason']]):opts([['dont_know','I do not know who to ask'],['privacy','I worry other people will find out'],['trust','I do not think people will understand'],['time','I have not had a chance'],['self_reliance','I want to try handling it myself'],['access','It is hard to get there'],['other','Something else']])):BARRIERS[state.version];
  return field(`areas:${need}:barriers`,notSought?(isAdult()?'What were your reasons for not looking for support?':'Why did you not ask for help with this?'):'What made it harder to get that support?','multi',[...list.filter(o=>!['none','unsure','prefer','prefer_not_to_say'].includes(o.id)),{id:'none',label:notSought?'None of these reasons':child?'Nothing made it hard':'Nothing made it harder'},UNSURE,PREFER],'Select all that apply.',{exclusive:['none','unsure','prefer'],need,optional_detail:true,conditional:'area_barriers'});
}
function areaPage(need) {
  const key=name=>`areas:${need}:${name}`;
  const youngPerson=state.version==='youth';
  const past=selectedNeeds(state.answers,domainList()).includes(need);
  const future=selectedFutureNeeds(state.answers,domainList()).includes(need);
  const label=domainLabel(need);
  return {title:label,intro:past?future?`First think about your time living in Greater Darwin in ${period()}, then what could help now or in the coming months. You can leave any question blank and continue.`:`Think about your time living in Greater Darwin in ${period()}. You can leave any question blank and continue.`:'Thinking about now and the coming months, what could help with this area? You can leave any question blank and continue.',fields:[
    ...(past?[
      field(key('received'),isAdult()?`In ${period()}, how much of the support you needed did you receive?`:`In ${period()}, did you get enough help with this?`,'single',adequacy()),
      field(key('sources'),isAdult()?`In ${period()}, where have you looked for support with this?`:`In ${period()}, who have you asked for help with this?`,'multi',areaSources(),'Select all that apply.',{exclusive:['not_sought','unsure','prefer'],need,optional_detail:true}),
      ...(isAdult()?[field(key('service_names'),'Which services or organisations did you approach, if any?','text',[],'Optional. Please do not name individual staff or other people.',{need,conditional:'formal_sources',optional_detail:true})]:[]),
      areaBarrierField(need),
      field(key('comment'),youngPerson?'What helped, or what could have been better?':isChild()?'What happened when you needed help with this?':'What happened when you needed support with this?','text',[],(isAdult()?'You could describe what helped, or what would have made things easier. ':'You can tell us what happened, or leave this blank. ')+privacyHint(),{need,optional_detail:true})
    ]:[]),
    ...(future?[
      field(key('support_requested'),youngPerson?'What could help with this now or in the next few months?':'What, if anything, would help you or your family with this now or in the coming months?','text',[],youngPerson?'A few words are fine. It is OK not to know. '+privacyHint():'A few words are fine. You do not need to know which service could help. '+privacyHint(),{need,future_section:true,optional_detail:true}),
      field(key('formats'),youngPerson?'How would you like to get help or join in with an activity for this topic?':'Which ways of getting support or joining an activity for this topic would suit you or your family?','multi',youngPerson?opts([['one_to_one','Talking with one person face to face'],['group','A group or activity, face to face'],['phone','A phone call'],['video_one_to_one','A video call with one person'],['online_group','An online group or activity'],['text','Text messages or online chat'],['self_guided','Something I can read, watch or do in my own time'],['other','Another way'],['none_suitable','None of these ways would suit'],['not_wanted','I do not want help or activities for this'],['no_preference','No preference'],['unsure','Not sure'],['prefer','Prefer not to answer']]):opts([['one_to_one','One-to-one, in person'],['group','A group or activity, in person'],['phone','A phone call'],['video_one_to_one','A one-to-one video call'],['online_group','An online group or activity'],['text','Text messages or online chat'],['self_guided','Information or resources to use in my own time'],['other','Another way'],['none_suitable','None of these ways would suit'],['not_wanted','Not looking to use support or activities for this'],['no_preference','No preference'],['unsure','Not sure'],['prefer','Prefer not to answer']]),'Select all that apply. Your answers do not sign you up for anything.',{exclusive:['none_suitable','not_wanted','no_preference','unsure','prefer'],need,future_section:true}),
      field(key('format_other'),'What other way would suit you?','short',[],'',{need,conditional:'format_other',future_section:true})
    ]:[])
  ]};
}
const accountKey = (id,name) => `accounts:${id}:${name}`;
function proposalPromptLabel(type) {
  const adult={information:'What would you need to find out or get help doing?',conversation:'What would you want to talk through?',activity:'Who would it be for, and what would people do together?',process:'Which step should work differently?',other:'Tell us what you have in mind.'};
  const youth={information:'What would you need to know or find?',conversation:'What would you want to talk about?',activity:'Who could join, and what could you do together?',process:'What should work differently?',other:'What is your idea?'};
  return (state.version==='youth'?youth:adult)[type]||'Tell us a little more about the idea.';
}
function accountPage(account) {
  const youth=state.version==='youth',experience=account.kind==='experience',unspecified=!ACCOUNT_KINDS.includes(account.kind)||account.kind==='unspecified',key=name=>accountKey(account.id,name);
  const number=(state.answers.accounts||[]).findIndex(item=>item.id===account.id)+1;
  const wording=TOPIC_WORDING[state.version]?.[account.topic_id];
  const sensitive=['safety_confidential_help','bereavement'].includes(account.topic_id);
  return {title:account.id.startsWith('draft-')?domainLabel(account.topic_id):`${experience?'Experience':unspecified?'Response':'Future idea'} ${number}`,intro:unspecified?'You can describe something that happened, something coming up, or an idea.':experience?(youth?`Think of something that mattered while your family was linked to Greater Darwin in ${period()}, even if you lived elsewhere. It may have gone well, been hard, or still be happening.`:`Think of one situation that mattered to you or your family in connection with living, working or a Defence posting in Greater Darwin in ${period()}. It may have gone well, been difficult, or still be happening.`):'Think about the coming months. You can share an idea even if nothing has been difficult recently.',fields:[
    field(key('story'),unspecified?(TOPIC_NEUTRAL[state.version]?.[account.topic_id]||'What would you like us to understand about this part of family life?'):wording?.[experience?0:1]||(experience?(youth?'Tell us about one thing that mattered to you or your family. What happened?':'Tell us about one situation that mattered to you or your family. What was happening?'):(youth?'What would you like to be easier or possible for you or your family soon?':'What would you like to be easier or possible for you or your family in the coming months?')),'text',[],'Optional. '+privacyHint(),{account_id:account.id,optional_detail:true}),
    ...(experience&&!sensitive?[field(key('help_status'),youth?'Thinking about what happened, which best describes the help with that situation?':'Thinking about the situation you described, which best describes the help received?','single',youth?opts([['enough','Enough help that worked'],['some','Some help that worked, but not enough'],['wanted_no_useful','No help that worked, even though someone tried to get it'],['wanted_not_sought','Help was needed, but it was not asked for'],['no_need','No help was needed'],['unsure','Not sure'],['prefer','Prefer not to answer']]):opts([['enough','Enough useful help'],['some','Some useful help, but not enough'],['wanted_no_useful','No useful help, despite trying to get it'],['wanted_not_sought','No useful help; help was needed but not sought'],['no_need','No help was needed'],['unsure','Not sure'],['prefer','Prefer not to answer']]),'Answer from what you know. Help may come from family, friends, community or services.',{account_id:account.id})]:[]),
    ...(experience&&!sensitive?[
      field(key('helped'),youth?'Was there anything that helped?':'What helped, if anything?','text',[],'Optional. '+privacyHint(),{account_id:account.id,conditional:'account_details',optional_detail:true}),
      field(key('difficult'),youth?'Was anything hard or missing?':'What was difficult, missing or unhelpful, if anything?','text',[],'Optional. '+privacyHint(),{account_id:account.id,conditional:'account_details',optional_detail:true})
    ]:[]),
    field(key('proposal_type'),account.prompt_open?(youth?'Which kind of idea would you like help explaining?':'What kind of change would you like to describe?'):(youth?'What kind of help or activity did you describe?':'What specific help or activity did you describe?'),'single',youth?opts([['information','Finding information or someone to help'],['conversation','Talking something through'],['activity','Meeting or doing something with others'],['process','Changing how something works'],['other','Something else or more than one idea'],['unsure','Not sure']]):opts([['information','Information or help finding a service'],['conversation','A conversation'],['activity','Meeting or doing something with others'],['process','Changing an existing service or process'],['other','Several ideas or something else'],['unsure','Not sure']]),account.prompt_open?'Optional. This choice changes the wording of the next question.':'Choose what fits the help or activity you described. If several ideas belong together, choose that option and explain the relevant part below.',{account_id:account.id,conditional:'account_prompt_type'}),
    field(key('useful_change'),account.prompt_open&&['information','conversation','activity','process','other'].includes(account.proposal_type)?proposalPromptLabel(account.proposal_type):unspecified?'What would help, or what is working well enough to keep?':(!experience&&wording?.[3])||wording?.[2]||(experience?(youth?'What would you like to stay the same, change or be added?':'Thinking about what you have told us, what would be useful to keep, change or add?'):(youth?'What could help make that happen?':'What would need to change or be added to make that possible?')),'text',[],(experience?'Optional. ':'Optional. You can leave this blank if you have already described the change above. ')+'You do not need to know which organisation could do it. '+privacyHint(),{account_id:account.id,optional_detail:true}),
    field(key('practical_detail'),account.proposal_type==='other'?'If part of your idea is help or an activity you might use, what would make that part workable? You can say which part you mean.':youth?'What would make the help or activity you described work for you or your family?':'What would make the help or activity you described workable for you or your family?','text',[],'Optional. You can mention timing, a general area, children, access, language, privacy or anything else that matters. Do not include an exact address. '+privacyHint(),{account_id:account.id,conditional:'account_practical',optional_detail:true})
  ]};
}
function topicPage(id) {
  const account=topicAccount(state.answers,id),label=domainLabel(id),domain=DOMAINS[state.version].find(item=>item.id===id);
  const kind=field(accountKey(account.id,'kind'),`For ${label.toLowerCase()}, what would you like to share?`,'single',opts([['experience','Something that happened or is happening'],['future','Something coming up or an idea for the future']]),'Optional. You can answer the open questions below without choosing a type.',{account_id:account.id});
  const entry=accountPage(account);
  return {title:label,intro:`${domain?.hint?domain.hint+' ':''}Already covered this on another page? You can leave this page blank and continue.`,fields:[kind,...entry.fields]};
}
function problemScreenPage() {
  const youth=state.version==='youth';
  const options=problemCatalog(state.version).flatMap(category=>category.items.map(item=>({id:item.id,label:item.label,hint:item.hint||''})));
  return {title:youth?'What has been hard for you lately?':'Which situations have affected you or your family?',intro:youth?'Thinking about the past three months, choose things that have been hard for you in connection with your family’s life linked to Greater Darwin. You can include experiences when you lived elsewhere while someone in your Defence family worked or was posted here. You can skip any topic or leave this question blank.':'Thinking about the past 12 months, choose situations that were difficult or needed attention for you or your family in connection with living, working or a Defence posting in Greater Darwin. You can include experiences while family members lived elsewhere. Include things you handled successfully as well as things still unresolved. You can skip any topic or leave this question blank.',fields:[
    field('problem_cues',youth?'Things that have been hard':'Situations your family has dealt with','multi',[...options,{id:'other_problem',label:'Another situation or problem'},{id:'none',label:'None of these'},{id:'prefer',label:'Prefer not to answer'}],'Select all that apply, or choose “None of these” or “Prefer not to answer” on its own.',{exclusive:['none','prefer']}),
    field('problem_other',youth?'What else has been hard?':'What other situation would you like us to know about?','short',[],privacyHint(),{conditional:'problem_other'})
  ]};
}
function priorityPickPage() {
  const youth=state.version==='youth';
  const options=selectedProblemCategories(state.answers,state.version).map(id=>{
    const category=problemCategory(state.version,id);
    const selected=(category?.items||[]).filter(item=>selectedProblemItems(state.answers,state.version).includes(item.id)).map(item=>item.label);
    return {id,label:category?.label||id,hint:selected.join('; ').slice(0,180)};
  });
  return {title:youth?'Which would you like to tell us more about?':'Which two areas would you most like to explain?',intro:youth?'Choose up to two. You can still share something else near the end.':'Choose up to two areas to follow through in more detail. Your other selections stay recorded; you can add further comments later. This choice is about what you would like to explain now, not a ranking of every family’s needs.',fields:[field('priority_categories',youth?'Choose up to two':'Choose up to two areas','multi',options,'Optional. Select at most two.',{max_selected:2})]};
}
function problemDetailPage(id) {
  const youth=state.version==='youth',category=problemCategory(state.version,id),detail=problemDetail(state.answers,id),key=name=>`problem_details:${id}:${name}`;
  const selected=id==='other_problem'?[state.answers.problem_other?.trim()||'Another situation']:(category?.items||[]).filter(item=>selectedProblemItems(state.answers,state.version).includes(item.id)).map(item=>item.label);
  return {title:category?.label||'A situation that mattered',intro:`You selected: ${selected.join('; ')||category?.label||'another situation'}. You may leave any question blank. Please avoid identifying details.`,fields:[
    ...(youth||selected.length<2?[]:[field(key('focus_problems'),'Which situation in this area are you mainly answering about?','multi',(category?.items||[]).filter(item=>selectedProblemItems(state.answers,state.version).includes(item.id)),'Optional. You can choose more than one if they are connected.',{detail_category:id})]),
    ...(youth?[
      field(key('story'),'What has been difficult for you about this?','text',[],'Optional. '+privacyHint(),{detail_category:id}),
      field(key('needed_help'),'What help did you need with this, if any?','text',[],'Optional. You can include help you got and help you did not get. A few words are enough. '+privacyHint(),{detail_category:id}),
      field(key('asked_anyone'),'Did you ask anyone for help with this?','single',opts([['yes','Yes'],['no','No'],['unsure','Not sure']]),'Optional.',{detail_category:id}),
      field(key('anyone_helped'),'Did anyone help, even without you asking?','single',opts([['yes','Yes'],['no','No'],['unsure','Not sure']]),'Optional.',{detail_category:id}),
      field(key('enough'),'Was the help you got enough?','single',opts([['yes','Yes'],['some','A little, but I needed more'],['no','No'],['unsure','Not sure']]),'Optional.',{detail_category:id,conditional:'youth_received'}),
      field(key('remaining_need'),'What would still help you now?','text',[],'Optional. '+privacyHint(),{detail_category:id})
    ]:[
      field(key('help_kinds'),'Thinking about these difficulties, what kinds of help did you or your family need?','multi',RAND_HELP_KINDS,'Include help you received and help you did not receive. Select all that apply. Choose “No help was needed in this area” or “Not sure whether help was needed” on its own.',{detail_category:id,exclusive:['no_help_needed','unsure_help_needed']}),
      field(key('other_help'),'What other kind of help?','short',[],'Optional. '+privacyHint(),{detail_category:id,conditional:'problem_other_help'}),
      field(key('priority_help'),'Which two kinds of help mattered most for these difficulties?','multi',selectedHelpKinds(detail,'adult').map(helpId=>RAND_HELP_KINDS.find(item=>item.id===helpId)),'Optional. Your other selections remain recorded.',{detail_category:id,conditional:'problem_priority_help',max_selected:2}),
      field(key('specific_need'),'Briefly, what was happening, and what help (if any) was needed?','text',[],'Optional. A few words are enough. '+privacyHint(),{detail_category:id})
    ])
  ]};
}
function needChainPage(categoryId,needId) {
  const category=problemCategory('adult',categoryId),need=RAND_HELP_KINDS.find(item=>item.id===needId),chain=needChain(state.answers,categoryId,needId),key=name=>chainKey(categoryId,needId,name);
  const received=['sought_received','unsolicited','unsure'].includes(chain.seek_receipt);
  const sources=(chain.sources||[]).filter(id=>RAND_CONTACT_SOURCES.some(item=>item.id===id)&&id!=='none_found');
  const sourceOutcomeFields=received?sources.map(sourceId=>{
    const source=RAND_CONTACT_SOURCES.find(item=>item.id===sourceId);
    return field(`source_outcomes:${categoryId}:${needId}:${sourceId}`,`For this help, what happened with ${source.label}?`,'single',RAND_SOURCE_OUTCOMES,'Optional.',{chain_category:categoryId,chain_need:needId,source_id:sourceId,conditional:'chain_source_outcome'});
  }):[];
  const notSought=chain.seek_receipt==='not_sought';
  return {title:`${category?.label||'A situation'} — ${need?.label||'help needed'}`,intro:'Keep the same situation and this particular kind of help in mind. You may leave any question blank; this is not a request for services.',fields:[
    field(key('specific_for_need'),'What specifically was this help needed for?','text',[],'Optional. A few words are enough. '+privacyHint(),{chain_category:categoryId,chain_need:needId}),
    field(key('seek_receipt'),'For this particular help, which best describes what happened during the past 12 months?','single',RAND_SEEK_RECEIPT,'Looking includes searching for useful information. Receiving a contact detail is not necessarily receiving the help itself.',{chain_category:categoryId,chain_need:needId}),
    field(key('sources'),'Which people, organisations or information sources did you approach, try to use, or receive this help from?','multi',RAND_CONTACT_SOURCES.filter(item=>item.id!=='none_found'||['sought_no_receipt','unsure'].includes(chain.seek_receipt)),'Optional. Choose the closest description for each source. If shown, “I looked for help but did not find a source” stands alone.',{chain_category:categoryId,chain_need:needId,conditional:'chain_sources',exclusive:['none_found']}),
    field(key('source_other'),'What other source?','short',[],privacyHint(),{chain_category:categoryId,chain_need:needId,conditional:'chain_source_other'}),
    ...sourceOutcomeFields,
    field(key('barriers'),notSought?'What, if anything, put you off or prevented you from looking for or asking for this help?':received?'What, if anything, made this help difficult to get or use?':'What, if anything, made it harder to find or get this help?','multi',RAND_BARRIERS.filter(item=>notSought||!['self_manage','situation_changed'].includes(item.id)),'Optional. Select all that apply, or choose “None of these” or “Not sure” on its own.',{chain_category:categoryId,chain_need:needId,conditional:'chain_barriers',exclusive:['none','unsure']}),
    field(key('barrier_note'),'Would you like to explain what happened?','text',[],'Optional. Please do not name individual people. '+privacyHint(),{chain_category:categoryId,chain_need:needId,conditional:'chain_barriers'}),
    field(key('bridge'),'What made this help useful or easier to get?','text',[],'Optional. This could be something a person or service did well. '+privacyHint(),{chain_category:categoryId,chain_need:needId,conditional:'chain_bridge'}),
    field(key('met_status'),'By now, or by the end of that situation, how much of this need had been met, taking all sources together?','single',RAND_MET_STATUS,'Optional. Receiving some help does not necessarily mean the need was met.',{chain_category:categoryId,chain_need:needId}),
    field(key('current_gap'),'Is any of this help still missing for you or your family now?','single',opts([['yes','Yes'],['no','No'],['unsure','Not sure']]),'Optional.',{chain_category:categoryId,chain_need:needId}),
    field(key('gap_detail'),'What is still missing?','text',[],'Optional. '+privacyHint(),{chain_category:categoryId,chain_need:needId,conditional:'chain_current_gap'})
  ]};
}
function positiveFuturePage() {
  const youth=state.version==='youth';
  return {title:youth?'What has helped, and what might help next?':'What has worked, and what might help next?',intro:'You can answer either question, both, or neither. Your answers can cover something that was not in the checklist.',fields:[
    field('positive_support',youth?'What has helped you or your family?':'What existing help or support has worked well for you or your family, and should be kept?','text',[],'Optional. '+privacyHint()),
    field('future_need',youth?'What might help you or your family in the coming months?':'Thinking ahead, what help might you or your family need in the coming months?','text',[],(youth?'Think about family life linked to Greater Darwin, even if you live somewhere else. ':'Think about needs connected with Greater Darwin, including when family members live elsewhere. ')+'Optional. This can be a new or emerging need. '+privacyHint())
  ]};
}
function page(step) {
  if(step.id.startsWith('area:'))return areaPage(step.need||step.id.slice(5));
  if(step.id.startsWith('account:'))return accountPage(accountById(state.answers,step.account_id||step.id.slice(8)));
  if(step.id.startsWith('topic:'))return topicPage(step.topic_id||step.id.slice(6));
  if(step.id.startsWith('problem_detail:'))return problemDetailPage(step.detail_category||step.id.slice(15));
  if(step.id.startsWith('need_chain:')){const [,categoryId,needId]=step.id.split(':');return needChainPage(categoryId,needId);}
  const child=isChild();
  switch(step.id) {
    case 'problem_screen':return problemScreenPage();
    case 'priority_pick':return priorityPickPage();
    case 'positive_future':return positiveFuturePage();
    case 'issue_cues':return {title:'Which parts of life here would you like to tell us about?',intro:state.version==='youth'?'Choose any topics where you have a story or idea to share. You will see one page for each topic you choose. You can leave any page blank. If your story or idea fits more than one topic, you only need to tell us once.':'Select any topics where you have an experience or idea to share. This could be something that worked well, a difficulty, or something you are looking ahead to. You will see one optional page for each topic you choose. You do not have to write on every page. If the same experience or idea fits more than one topic, tell us once—you can leave the other page blank.',fields:[
      field('issue_cues','Parts of family life','multi',issueIds(state.version).map(id=>id===OTHER_ISSUE?{id,label:'Another issue'}:DOMAINS[state.version].find(domain=>domain.id===id)),'Select all that apply. You can leave this blank and still add an experience or idea later.'),
      field('issue_other','What other issue would you like to tell us about?','short',[],'Optional. Please avoid names or identifying details.',{conditional:'issue_other'})
    ]};
    case 'accounts_start':return {title:'What would you like to tell us about?',intro:'Choose an experience, something coming up, or an idea. You can add another after each one, or continue without adding anything.',fields:[]};
    case 'accounts_manage':return {title:'Your experiences and ideas',intro:'You can add another experience or idea, edit what you have written, or continue.',fields:[]};
    case 'closing':{
      const choices=priorityChoices(state.answers);
      return {title:'Before you finish',intro:'These questions are optional.',fields:[
        ...(choices.length>1?[field('priority_reason',isAdult()?'Of the ideas or changes you mentioned, which would make the biggest difference to you or your family, and why?':'Which of your ideas or changes would make the biggest difference to you, and why?','text',[],'Optional. '+privacyHint())]:[]),
        ...(!(state.answers.accounts||[]).length?[field('closing_note',isAdult()?'Is there anything else you would like us to understand about family life here?':'Is there anything else you would like us to know about family life here?','text',[],'Optional. '+privacyHint())]:[])
      ]};
    }
    case 'earlier':return {title:'Your experience in Greater Darwin',intro:'You can share what you learnt from living in Greater Darwin. These experiences will be considered separately from current local needs.',fields:[field('earlier_experience',isAdult()?'What worked well when you lived in Greater Darwin, and what could have been better?':'What would you like to tell us about when you lived in Greater Darwin?','text',[],privacyHint())]};
    case 'connection':return {title:isAdult()?'A little about you':'A little about your family',intro:'',fields:[
      field('roles',isAdult()?'Which describes you?':'Which describes your family?','multi',roleOptions(),isAdult()?'Select all that apply. Choose “None of these” on its own.':'Select all that apply. Choose “Neither of these” or “Not sure” on its own.',{required:true,exclusive:['none','unsure']}),
      ...suburbFields(),
      ...(!child?[field('work_posting_greater_darwin',isAdult()?'Do you or someone in your Defence family currently work or have a posting in Greater Darwin?':'Does someone in your Defence family currently work or have a posting in Greater Darwin?','single',opts([['yes','Yes'],['no','No'],['unsure','Not sure'],['prefer','Prefer not to answer']]),'Optional. You can answer Yes even if you live elsewhere.')]:[]),
      ...(isAdult()?[field('age_group','Which age group are you in?','single',ADULT_AGE_GROUPS,'Optional.')]:[field('assistance','Is anyone helping you read or write your answers?','single',opts([['self','No, I am answering myself'],['guardian','Yes, my parent or guardian'],['other','Yes, someone else']]),'These are your answers. A helper can read or write for you, but should not choose your answers.',{required:true})]),
    ]};
    case 'needs':return {title:isAdult()?'Your support needs':'Where have you needed help?',intro:(isAdult()?'Support can include help from family, friends, your community or a service.':'Help can come from family, friends, school, your community or a service.')+` Think about your time living in Greater Darwin in ${period()}. If you arrived more recently, think about the time since you arrived.`,fields:[
      field('needs_status',isAdult()?`In ${period()}, have you needed any support?`:`In ${period()}, have you needed help with anything?`,'single',opts([['yes','Yes'],['no','No'],['unsure','Not sure'],['prefer','Prefer not to answer']])),
      field('needs',isAdult()?'What did you need support with?':'What did you need help with?','multi',domainList(),isAdult()?'Select all that apply. Include needs that were met and support you still need now.':'Choose any that fit, including things that are going better now.',{conditional:'needs_list'}),
      field('needs_other',isAdult()?'What else did you need help with?':'What else?','short',[],privacyHint(),{conditional:'other_need'}),
    ]};
    case 'place':return {title:'Your life in Greater Darwin',intro:'',fields:[
      field('time_nt','How long have you lived in Greater Darwin?','single',opts([['never','I have not lived in Greater Darwin'],['under3','Less than 3 months'],['3to12','3 months to less than 1 year'],['1to3','1 year to less than 3 years'],['over3','3 years or more'],['unsure','Not sure'],['prefer','Prefer not to answer']]),'Count your current or most recent stay only.')
    ]};
    default:return {title:'Check your answers',intro:'',fields:[]};
  }
}

function optionHTML(o,f,value) {
  const checked = f.type==='multi' ? (value||[]).includes(o.id) : value===o.id;
  return `<label class="choice"><input type="${f.type==='multi'?'checkbox':'radio'}" name="${esc(f.key)}" value="${esc(o.id)}" ${checked?'checked':''}><span class="choice-body"><span class="choice-label">${esc(o.label)}</span>${o.hint?`<span class="choice-hint">${esc(o.hint)}</span>`:''}</span></label>`;
}
function conditionalVisible(f) {
  if(f.conditional?.startsWith('account_')){
    const account=accountById(state.answers,f.account_id);
    if(f.conditional==='account_details')return account?.kind==='experience'&&account.detail_open===true;
    if(f.conditional==='account_prompt_type')return account?.prompt_open===true||account?.practical_opt_in===true;
    if(f.conditional==='account_practical')return practicalEligible(account)&&account.practical_opt_in===true;
  }
  if(f.conditional==='local_area')return LOCAL_AREAS.includes(state.answers.residence_area);
  if(f.conditional==='problem_other')return (state.answers.problem_cues||[]).includes('other_problem');
  if(f.conditional==='youth_received')return problemDetail(state.answers,f.detail_category).anyone_helped==='yes';
  if(f.conditional?.startsWith('chain_')){
    const chain=needChain(state.answers,f.chain_category,f.chain_need),status=chain.seek_receipt;
    if(f.conditional==='chain_sources')return Boolean(status)&&status!=='not_sought';
    if(f.conditional==='chain_source_other')return Boolean(status)&&status!=='not_sought'&&(chain.sources||[]).includes('other');
    if(f.conditional==='chain_source_outcome')return ['sought_received','unsolicited','unsure'].includes(status)&&(chain.sources||[]).includes(f.source_id);
    if(f.conditional==='chain_barriers')return Boolean(status);
    if(f.conditional==='chain_bridge')return ['sought_received','unsolicited','unsure'].includes(status);
    if(f.conditional==='chain_current_gap')return chain.current_gap==='yes';
  }
  if(f.conditional?.startsWith('problem_')){
    const detail=problemDetail(state.answers,f.detail_category);
    if(f.conditional==='problem_priority_help')return selectedHelpKinds(detail,state.version).length>2;
    if(f.conditional==='problem_other_help')return (detail.help_kinds||[]).includes('other');
    if(f.conditional==='problem_help_needed')return helpNeeded(detail,state.version);
    if(f.conditional==='problem_contact_other')return helpNeeded(detail,state.version)&&(detail.contact_sources||[]).includes('other');
    if(f.conditional==='problem_no_contact')return helpNeeded(detail,state.version)&&(detail.contact_sources||[]).includes('none');
    if(f.conditional==='problem_contacted')return helpNeeded(detail,state.version)&&contactedAny(detail);
  }
  if(f.conditional==='issue_other')return selectedIssues(state.answers,state.version).includes(OTHER_ISSUE);
  if(f.conditional==='outside_suburb')return state.answers.residence_area==='outside';
  if(f.conditional==='children_ages')return relevantChildStage(state.answers);
  if(f.conditional==='future_priority')return isAdult()&&selectedFutureNeeds(state.answers,domainList()).length>1;
  if(f.conditional==='enablers_other')return (state.answers.participation_enablers||[]).includes('other');
  if(f.conditional==='in_person')return inPersonParticipation(state.answers);
  if(f.conditional==='in_person_other')return inPersonParticipation(state.answers)&&(state.answers.in_person_areas||[]).includes('other');
  if(f.conditional==='time_other')return liveParticipation(state.answers)&&(state.answers.times||[]).includes('other');
  if(f.conditional==='other_suburb')return LOCAL_AREAS.includes(state.answers.residence_area)&&state.answers.suburb==='other';
  if(f.conditional==='needs_list')return hasNeedSelection(state.answers);
  if(f.conditional==='focus_need')return state.version==='youth'&&selectedDetailNeeds(state.answers,domainList(),state.version).length>0;
  if(f.conditional==='future_other_need')return (state.answers.future_needs||[]).includes('future_other_need');
  if(f.conditional==='format_other')return (state.answers.areas?.[f.need]?.formats||[]).includes('other');
  if(f.conditional==='formal_sources')return isAdult()&&hasFormalSource(state.answers.areas?.[f.need]||{});
  if(f.conditional==='area_barriers'){const a=state.answers.areas?.[f.need]||{};return hasSoughtHelp(a)||Boolean(a.sources?.includes('not_sought'));}
  if(f.conditional==='other_need')return hasNeedSelection(state.answers)&&Boolean(state.answers.needs?.includes('other_need'));
  if(f.conditional==='live')return liveParticipation(state.answers);
  return true;
}
function areaQuestionsHTML(content,need) {
  const past=content.fields.filter(f=>!f.future_section).map(fieldHTML).join('');
  const future=content.fields.filter(f=>f.future_section);
  if(future.length)return `${past}<section class="topic-future"><h2>Looking ahead: ${esc(domainLabel(need))}</h2>${future.map(fieldHTML).join('')}</section>`;
  if(selectedNeeds(state.answers,domainList()).includes(need)&&!isChild())return `${past}<div class="topic-future-opt-in"><button class="text-button" type="button" data-add-future="${esc(need)}">Add future ideas for this topic</button></div>`;
  return past;
}
function accountPracticalControlHTML(account) {
  return describedProposalText(account)&&!['process','unsure'].includes(account.proposal_type)&&account.practical_opt_in!==true?`<div class="account-optional-control"><button class="text-button" type="button" data-add-practical="${esc(account.id)}">Add practical details for help or an activity I or my family might use</button></div>`:'';
}
function accountQuestionsHTML(content,account) {
  const fields=content.fields,one=name=>fields.find(f=>f.key===accountKey(account.id,name));
  const start=['story',...(one('help_status')?['help_status']:[])].map(name=>fieldHTML(one(name))).join('');
  const experience=account.kind==='experience'&&one('helped')?(account.detail_open===true?`<section class="account-extra"><h2>More about this experience</h2>${fieldHTML(one('helped'))}${fieldHTML(one('difficult'))}</section>`:`<div class="account-optional-control"><button class="text-button" type="button" data-expand-details="${esc(account.id)}">Add what helped or was difficult</button></div>`):'';
  const prompt=account.prompt_open===true?`<div class="account-prompt">${fieldHTML(one('proposal_type'))}</div>`:`<div class="account-optional-control"><button class="text-button" type="button" data-expand-prompt="${esc(account.id)}">Give me a prompt to explain my idea</button></div>`;
  const practical=`<div data-practical-control="${esc(account.id)}">${accountPracticalControlHTML(account)}</div>${account.practical_opt_in===true&&!account.prompt_open?fieldHTML(one('proposal_type')):''}${account.practical_opt_in===true?fieldHTML(one('practical_detail')):''}`;
  return start+experience+prompt+fieldHTML(one('useful_change'))+practical;
}
function topicResourceHTML(id) {
  if(id==='safety_confidential_help')return '<aside class="topic-support"><p>You do not need to describe an incident here. If you want confidential support, <a href="https://www.1800respect.org.au/" target="_blank" rel="noopener noreferrer">1800RESPECT</a> is available on 1800 737 732. In immediate danger, call 000.</p></aside>';
  if(id==='bereavement')return '<aside class="topic-support"><p>You can leave this page blank. If you would like grief support, see <a href="https://griefline.org.au/" target="_blank" rel="noopener noreferrer">Griefline</a> or our <a href="support.html">support guide</a>.</p></aside>';
  return '';
}
function accountSummaryText(account) {
  const content=String(account.story||account.useful_change||'No details added yet').trim();
  return content.length>155?`${content.slice(0,155)}…`:content;
}
const accountTopicLabel = account => account.topic_id?domainLabel(account.topic_id):'Another experience or idea';
const accountKindLabel = account => account.kind==='experience'?'Experience':account.kind==='future'?'Future idea':'Response';
function accountChoiceHTML(kind,label,disabled=false) {
  return `<button class="button secondary" type="button" data-new-account="${kind}" ${disabled?'disabled':''}>${label}</button>`;
}
function accountsStartHTML() {
  const full=(state.answers.accounts||[]).length>=MAX_ACCOUNTS;
  return `<div class="account-choices">${accountChoiceHTML('experience',isAdult()?'Add a family experience':'Add something that happened',full)}${accountChoiceHTML('future',isAdult()?'Add something coming up or an idea':'Add an idea for the coming months',full)}</div>${full?'<p class="small" role="status">This review has reached its entry limit. Your existing entries are safe. You can edit or remove an entry, or continue to finish.</p>':'<p class="small">You can also continue without adding anything.</p>'}`;
}
function accountsManageHTML() {
  const accounts=state.answers.accounts||[],full=accounts.length>=MAX_ACCOUNTS;
  const topics=selectedIssues(state.answers,state.version);
  return `<p class="small">You have added ${accounts.length} entr${accounts.length===1?'y':'ies'}. You can edit or remove one without changing the others.</p>${topics.length?`<div class="topic-revisit"><h2>Your selected topics</h2><p class="small">Return to a topic to add or change its answer. You can also <button class="text-button" type="button" data-edit-issues="true">change your topic choices</button>.</p><div class="topic-revisit-links">${topics.map(id=>`<button class="text-button" type="button" data-edit-topic="${esc(id)}">${esc(domainLabel(id))}</button>`).join('')}</div></div>`:''}<ol class="account-list">${accounts.map((account,index)=>`<li><strong>${accountKindLabel(account)} ${index+1} · ${esc(accountTopicLabel(account))}</strong><p>${esc(accountSummaryText(account))}</p><div class="account-list-actions"><button class="text-button" type="button" data-edit-account="${esc(account.id)}">Edit</button><button class="text-button" type="button" data-remove-account="${esc(account.id)}">Remove</button></div></li>`).join('')}</ol><div class="account-choices">${accountChoiceHTML('experience',topics.length?'Add an experience outside these topics':'Add another experience',full)}${accountChoiceHTML('future',topics.length?'Add an idea outside these topics':'Add another future idea',full)}</div>${full?'<p class="small" role="status">This review has reached its entry limit. Your existing entries are safe. You can edit or remove an entry, or continue to finish.</p>':''}`;
}

function fieldHTML(f) {
  const v=getValue(f.key),hint=f.hint?`<span class="field-hint" id="hint-${esc(f.key)}">${esc(f.hint)}</span>`:'';
  const hidden=conditionalVisible(f)?'':'hidden';
  const describedBy=f.hint?`aria-describedby="hint-${esc(f.key)}"`:'';
  if(f.key==='residence_area'&&f.type==='single'){
    const primary=f.options.filter(o=>['darwin','palmerston','litchfield'].includes(o.id));
    const secondary=f.options.filter(o=>!['darwin','palmerston','litchfield'].includes(o.id));
    return `<fieldset class="question-group" data-field="${esc(f.key)}"><legend>${esc(f.label)}${hint}</legend><div class="choices area-primary-choices">${primary.map(o=>optionHTML(o,f,v)).join('')}</div><details class="area-other-options" ${secondary.some(o=>o.id===v)?'open':''}><summary>Other area</summary><div class="choices">${secondary.map(o=>optionHTML(o,f,v)).join('')}</div></details></fieldset>`;
  }
  if(f.key==='problem_cues'&&f.type==='multi'){
    const groups=problemCatalog(state.version).map((category,index)=>`<div class="issue-group" role="group" aria-labelledby="problem-group-${index}"><h2 id="problem-group-${index}">${esc(category.label)}</h2>${category.hint?`<p class="small">${esc(category.hint)}</p>`:''}<div class="choices columns">${category.items.map(item=>optionHTML(f.options.find(option=>option.id===item.id),f,v)).join('')}</div></div>`).join('');
    const otherField=page({id:'problem_screen'}).fields.find(item=>item.key==='problem_other');
    return `<fieldset class="question-group issue-cues" data-field="problem_cues"><legend>${esc(f.label)}${hint}</legend>${groups}<div class="issue-group issue-other">${['other_problem','none','prefer'].map(id=>optionHTML(f.options.find(option=>option.id===id),f,v)).join('')}${fieldHTML(otherField)}</div></fieldset>`;
  }
  if(f.key==='issue_cues'&&f.type==='multi'){
    const groups=ISSUE_GROUPS[state.version]||[];
    const sections=groups.map((group,index)=>`<div class="issue-group" role="group" aria-labelledby="issue-group-${index}"><h2 id="issue-group-${index}">${esc(group.label)}</h2><div class="choices columns">${group.ids.map(id=>optionHTML(f.options.find(option=>option.id===id),f,v)).join('')}</div></div>`).join('');
    const other=f.options.find(option=>option.id===OTHER_ISSUE);
    const otherField=page({id:'issue_cues'}).fields.find(item=>item.key==='issue_other');
    return `<fieldset class="question-group issue-cues" data-field="issue_cues"><legend>${esc(f.label)}${hint}</legend>${sections}<div class="issue-group issue-other">${optionHTML(other,f,v)}${fieldHTML(otherField)}</div><p class="issue-cue-note">Unchecking a topic does not delete anything you have written. Remove an entry separately if you want to discard it.</p></fieldset>`;
  }
  if(['single','multi'].includes(f.type)) return `<fieldset class="question-group" data-field="${esc(f.key)}" ${hidden}><legend>${esc(f.label)}${f.required?'<span class="required-label">(required)</span>':''}${hint}</legend><div class="choices ${['needs','future_needs'].includes(f.key)&&!isChild()?'columns':''} ${f.options.length>6?'compact':''}">${f.options.map(o=>f.key==='needs'&&o.id==='other_need'?`<div class="other-need-option">${optionHTML(o,f,v)}${fieldHTML(page({id:'needs'}).fields.find(item=>item.key==='needs_other'))}</div>`:f.key==='future_needs'&&o.id==='future_other_need'?`<div class="other-need-option">${optionHTML(o,f,v)}${fieldHTML(page({id:'future'}).fields.find(item=>item.key==='future_needs_other'))}</div>`:optionHTML(o,f,v)).join('')}</div></fieldset>`;
  let input='';
  if(f.type==='select') input=`<select class="select" id="${esc(f.key)}" name="${esc(f.key)}" ${describedBy}><option value="">${esc(f.placeholder||'Choose an option')}</option>${f.options.map(o=>`<option value="${esc(o.id)}" ${v===o.id?'selected':''}>${esc(o.label)}${o.aliases?.length?' ('+esc(o.aliases.join(' / '))+')':''}</option>`).join('')}</select>`;
  else if(f.type==='short') input=`<input class="text-input" id="${esc(f.key)}" name="${esc(f.key)}" maxlength="160" value="${esc(v||'')}" autocomplete="off" ${describedBy}>`;
  else input=`<textarea class="textarea" id="${esc(f.key)}" name="${esc(f.key)}" maxlength="${maxTextLength(state.version)}" ${describedBy}>${esc(v||'')}</textarea><div class="char-count" data-counter="${esc(f.key)}" ${(v||'').length<maxTextLength(state.version)*.8?'hidden':''}>${maxTextLength(state.version)-(v||'').length} characters remaining</div>`;
  return `<div class="question-group${f.key==='needs_other'?' other-need-followup':''}" data-field="${esc(f.key)}" ${hidden}><label class="field-label" for="${esc(f.key)}">${esc(f.label)}${f.required?'<span class="required-label">(required)</span>':''}${hint}</label>${input}</div>`;
}
function focusHeading(){main.querySelector('h1')?.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
function resetAgePath(){
  resetYoung();state.age=null;state.ageAudience=null;state.ageRoute=null;state.version='adult';state.answers={};state.participation=null;state.guardianPermission=null;state.step='connection';state.returnToReview=false;state.returnToManage=false;state.returnToTopic='';
}
function setAgePath(age,route){
  if(age!==state.age)resetAgePath();
  state.age=age;state.ageAudience=route==='adult'?'adult':'minor';state.ageRoute=route;state.version=questionnaireVersion(age);
}
function renderWelcome(){
  state.screen='welcome';
  const audience=state.ageAudience||(state.ageRoute==='adult'?'adult':state.ageRoute?'minor':null);
  main.innerHTML=`<div class="welcome"><section class="welcome-intro"><h1 tabindex="-1">${esc(SURVEY_INVITATION.title)}</h1><p class="greeting">${esc(SURVEY_INVITATION.greeting)}</p>${SURVEY_INVITATION.paragraphs.map((value,i)=>`<p class="${i===0?'lead':''}">${esc(value)}</p>`).join('')}<p class="funding-note">${esc(SURVEY_INVITATION.funding)}</p><div class="preview-notice" role="note"><strong>Preview only</strong><p>This version is for reviewing the questions. It does not send or save your answers. Closing or reloading this page clears them.</p></div></section><section class="welcome-age" aria-labelledby="welcome-age-title"><h2 id="welcome-age-title">Whose experience is this about?</h2><fieldset class="question-group"><legend class="visually-hidden">Adult or under 18</legend><div class="choices age-audience">${opts([['adult','Adult (18 or older)'],['minor','Child or young person (under 18)']]).map(option=>optionHTML(option,{key:'age_audience',type:'single'},audience)).join('')}</div></fieldset><div class="minor-age-options" id="minor-age-options" ${audience==='minor'?'':'hidden'}><fieldset class="question-group"><legend>How old is the child or young person?</legend><div class="choices">${opts([['youth','8–17'],['young','7 or younger']]).map(option=>optionHTML(option,{key:'age_route',type:'single'},state.ageRoute)).join('')}</div></fieldset></div></section><div id="welcome-consent" aria-live="polite"></div></div>`;
  const minorOptions=main.querySelector('#minor-age-options');
  main.querySelectorAll('input[name="age_audience"]').forEach(input=>input.addEventListener('change',()=>{
    if(input.value==='adult'){
      setAgePath('adult','adult');
      minorOptions.hidden=true;
      main.querySelectorAll('input[name="age_route"]').forEach(radio=>{radio.checked=false;});
    }else{
      if(state.ageAudience!=='minor'){resetAgePath();state.ageAudience='minor';}
      minorOptions.hidden=false;
    }
    renderWelcomeConsent();
  }));
  main.querySelectorAll('input[name="age_route"]').forEach(input=>input.addEventListener('change',()=>{
    if(input.value==='young')setAgePath('young','young');
    else if(state.ageRoute!=='youth'){resetAgePath();state.ageAudience='minor';state.ageRoute='youth';state.version='youth';}
    renderWelcomeConsent();
  }));
  renderWelcomeConsent();
}
function renderWelcomeConsent(){
  const host=main.querySelector('#welcome-consent');
  if(!host)return;
  if(!state.ageRoute){host.innerHTML='';return;}
  const youthAge=state.ageRoute==='youth'?`<fieldset class="question-group consent-subage"><legend>Young person’s age</legend><div class="choices">${opts([['younger','8–14'],['older','15–17']]).map(option=>optionHTML(option,{key:'youth_age',type:'single'},state.age==='youth_younger'?'younger':state.age==='youth_older'?'older':null)).join('')}</div></fieldset>`:'';
  if(!state.age){
    host.innerHTML=`<div class="welcome-consent">${youthAge}</div>`;
  }else{
    const adult=state.age==='adult',young=state.age==='young',guardian=needsGuardianPermission(state.age);
    const ageIntro=adult?'Please read the information below before trying the questions.':young?'For a parent or guardian: you can try recording what your child says or shows and add your own observations separately. Your child does not have to answer. This preview does not send or save answers.':'For a young person: you can try these questions to see how the survey works. This preview does not send or save your answers. You can skip questions or stop. Please leave out names and school names. Someone can help you read or write, but should not choose your answers.';
    const guardianLabel=young?'I am this child’s parent or guardian and agree to try this preview with them. I understand their answers and my observations are not sent or saved.':'I am this young person’s parent or guardian and agree to them trying this preview. I understand their answers are not sent or saved.';
    const participantLabel=adult?'I have read the information and agree to try this survey preview. I understand my answers are not sent or saved.':guardian?'I understand what these questions are for, and I want to try them. These will be my answers, even if someone helps me read or write.':'I have read the information and agree to try these questions. I understand my answers are not sent or saved.';
    host.innerHTML=`<div class="welcome-consent">${youthAge}<section class="age-summary" aria-labelledby="age-summary-title"><h2 id="age-summary-title">Before you begin</h2><p>${ageIntro}</p></section>${participantInformationHTML('welcome-participant-information')}<section class="participation-inline" aria-labelledby="participation-inline-title"><h2 id="participation-inline-title">Your agreement</h2><form id="welcome-consent-form">${guardian?`<h3 class="consent-role-label">For a parent or guardian</h3><label class="choice consent-choice"><input type="checkbox" name="guardian-permission" ${state.guardianPermission?.agreed?'checked':''}><span class="choice-label">${guardianLabel}</span></label>`:''}${young?'':`${guardian?'<h3 class="consent-role-label">For the young person</h3>':''}<label class="choice consent-choice"><input type="checkbox" name="participation" ${state.participation?.agreed?'checked':''}><span class="choice-label">${participantLabel}</span></label>`}<p class="error" id="welcome-consent-error" role="alert"></p><div class="welcome-start"><button class="button primary" type="submit" disabled>Start questions <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></button></div></form>${!adult?'<button class="text-button" type="button" id="welcome-help">I would like someone to explain this</button>':''}</section></div>`;
  }
  host.querySelectorAll('input[name="youth_age"]').forEach(input=>input.addEventListener('change',()=>{
    const age=input.value==='older'?'youth_older':'youth_younger';
    setAgePath(age,'youth');
    const update=()=>{renderWelcomeConsent();host.querySelector('input[name="youth_age"]:checked')?.focus({preventScroll:true});};
    if(typeof window.setTimeout==='function')window.setTimeout(update,0);else update();
  }));
  if(!state.age)return;
  const form=host.querySelector('#welcome-consent-form');
  const guardianInput=form.querySelector('input[name="guardian-permission"]');
  const participationInput=form.querySelector('input[name="participation"]');
  const start=form.querySelector('[type="submit"]');
  const updateStart=()=>{start.disabled=state.age==='young'?!state.guardianPermission?.agreed:!hasValidParticipation();};
  guardianInput?.addEventListener('change',()=>{
    state.guardianPermission=guardianPermissionRecord(state.age,guardianInput.checked);
    if(!guardianInput.checked){state.participation=null;state.answers={};resetYoung();if(participationInput)participationInput.checked=false;}
    else if(participationInput?.checked)state.participation=participationRecord(state.age,true,state.guardianPermission);
    updateStart();
  });
  participationInput?.addEventListener('change',()=>{
    state.participation=participationRecord(state.age,participationInput.checked,state.guardianPermission);
    if(!participationInput.checked)state.answers={};
    updateStart();
  });
  form.addEventListener('submit',event=>{
    event.preventDefault();updateStart();
    if(start.disabled){form.querySelector('#welcome-consent-error').textContent='Please read the information and choose whether to take part.';return;}
    if(state.age==='young')renderYoung();else{state.step='connection';renderSurvey();focusHeading();}
  });
  host.querySelector('#welcome-help')?.addEventListener('click',renderParticipationHelp);
  updateStart();
}
function renderParticipationHelp(){
  state.participation=null;
  state.screen='participation-help';
  main.innerHTML=`<section class="survey-layout"><h1 tabindex="-1">Getting help to take part</h1><p>A Lutheran Care worker can explain the questionnaire and help you take part.</p><p>If asking a parent or guardian would be unsafe or difficult, you can speak with a Lutheran Care worker privately first.</p><p>Ask the worker who invited you, or call Lutheran Care on <a href="tel:+61882699333">(08) 8269 9333</a> and ask for the NT Defence Family Support Program.</p><p>In Australia, you can also call <a href="https://kidshelpline.com.au/" target="_blank" rel="noopener">Kids Helpline</a> on 1800 55 1800 about a worry. In an emergency, call 000. Outside Australia, use your local emergency number.</p><div class="question-actions"><button class="back-button" id="help-back">Back</button><button class="button secondary" id="help-stop">Leave questionnaire</button></div></section>`;
  main.querySelector('#help-back').onclick=()=>{renderWelcome();focusHeading();};
  main.querySelector('#help-stop').onclick=renderParticipationDeclined;
  focusHeading();
}
function renderParticipationDeclined(){
  resetYoung();state.answers={};state.participation=null;state.guardianPermission=null;
  state.screen='declined';
  main.innerHTML=`<section class="finish"><h1 tabindex="-1">You’ve left the survey</h1><button class="button secondary" id="declined-back">Return to the start</button></section>`;
  main.querySelector('#declined-back').onclick=()=>{resetAgePath();renderWelcome();focusHeading();};
  focusHeading();
}
const YOUNG_PROMPTS = ['What do you like about where you live or spend time with your family?', 'Is there anything that feels hard?', 'Who helps you when you need help?', 'What would make things a little easier?'];
function resetYoung(){state.youngController?.reset();state.youngController=null;state.youngRecord=null;}
function renderYoung(){
  if(!state.guardianPermission?.agreed||state.guardianPermission.age_path!=='young'){resetYoung();renderWelcome();return;}
  state.screen='young';
  state.youngController ||= window.SURVEY_YOUNG_CHILDREN.create({main,guardianPermission:()=>state.guardianPermission,prompts:YOUNG_PROMPTS,onPermissionRequired:renderWelcome,onBack:()=>{renderWelcome();focusHeading();},onStop:renderParticipationDeclined,onInformation:()=>document.querySelector('#privacy-dialog').showModal(),onFinish:(record)=>{state.youngRecord=record;renderFinish();}});
  state.youngController.show();
}
function needsGuardianSupport(age,answers){return ['child','youth_younger'].includes(age)&&['self','other'].includes(answers.assistance)&&answers.guardian_present!==true;}
function renderGuardianSupport(){
  state.screen='guardian-support';
  main.innerHTML=`<section class="survey-layout"><h1 tabindex="-1">Please ask your parent or guardian to join you</h1><p>For this online questionnaire, a parent or guardian needs to be with you. You can still give your own answers, including when someone else helps you read or write.</p><p>If this would be unsafe or difficult, speak with Lutheran Care privately first.</p><form id="support-form"><label class="choice consent-choice"><input name="guardian-present" type="checkbox"><span class="choice-label">My parent or guardian is with me and agrees to this way of completing the questionnaire.</span></label><div class="question-actions"><button class="back-button" type="button" id="support-back">Back</button><button class="button primary" type="submit" disabled>Continue</button></div></form><button class="text-button" id="support-help">Speak with Lutheran Care privately</button></section>`;
  const form=main.querySelector('#support-form');form.onchange=()=>{form.querySelector('[type="submit"]').disabled=!form.querySelector('input').checked;};
  form.onsubmit=e=>{e.preventDefault();if(!form.querySelector('input').checked)return;state.answers.guardian_present=true;if(state.returnToReview){state.returnToReview=false;state.step='review';renderSurvey();focusHeading();}else goNext('connection');};
  main.querySelector('#support-back').onclick=()=>{state.step='connection';renderSurvey();focusHeading();};main.querySelector('#support-help').onclick=renderParticipationHelp;focusHeading();
}

function renderScope(){state.screen='scope';main.innerHTML=`<section class="finish"><h1 tabindex="-1">Thank you for your interest</h1><p class="lead">This preview focuses on Australian Defence Force members and families who live or work in Greater Darwin, have a posting connected with the area, or have past experience living here.</p><div class="finish-actions"><button class="button primary" id="scope-back">Review my answer</button><button class="button secondary" id="scope-exit">Return to the start</button></div></section>`;main.querySelector('#scope-back').onclick=()=>{state.screen='survey';state.step='connection';renderSurvey();};main.querySelector('#scope-exit').onclick=()=>{state.answers={};renderWelcome();};focusHeading();}
function activeSteps(){return buildSteps(state.answers,domainList(),state.version);}
function reviewHTML(){
  const accounts=state.answers.accounts||[];
  const manage=state.version==='child'||consultationRoute(state.answers)==='earlier_experience'?'':`<section class="review-section"><div class="review-header"><h2>Experiences and ideas</h2><button class="text-button" type="button" data-edit="${accounts.length?'accounts_manage':'accounts_start'}">Add or manage entries</button></div><p class="small">You have added ${accounts.length} entr${accounts.length===1?'y':'ies'}.</p>${accounts.length?`<ol class="account-review-list">${accounts.map((account,index)=>`<li><span><strong>${accountKindLabel(account)} ${index+1} · ${esc(accountTopicLabel(account))}</strong> — ${esc(accountSummaryText(account))}</span><button class="text-button" type="button" data-edit="account:${esc(account.id)}">Review or edit</button></li>`).join('')}</ol>`:''}</section>`;
  return manage+activeSteps().filter(s=>!['review','accounts_start','accounts_manage'].includes(s.id)&&!s.account_id&&!s.topic_id).map(s=>{
  const p=page(s);
  const rows=p.fields.filter(f=>conditionalVisible(f)&&(f.required||hasAnswer(getValue(f.key)))).map(f=>{
    const v=getValue(f.key);let text;
    if(!hasAnswer(v))text='Not answered';
    else if(f.type==='text'||f.type==='short')text=v;
    else text=(Array.isArray(v)?v:[v]).map(id=>f.options.find(o=>o.id===id)?.label||id).join('; ');
    return `<div class="review-block"><div class="review-header"><h3>${esc(f.label)}</h3><button class="text-button" type="button" data-edit="${esc(s.id)}" data-detail="${f.optional_detail?'true':'false'}" aria-label="Change: ${esc(s.need?p.title+': ':'')}${esc(f.label)}">Change</button></div><p class="review-value">${esc(text)}</p></div>`;
  }).join('');
  if(!rows)return `<section class="review-section"><div class="review-header"><h3>${esc(p.title)}</h3><button class="text-button" type="button" data-edit="${esc(s.id)}" aria-label="Add answers: ${esc(p.title)}">Add answers</button></div><p class="small">No optional answers added.</p></section>`;
  return `<section class="review-section">${s.need?`<h2>${esc(p.title)}</h2>`:''}${rows}</section>`;
}).join('');}

function renderSurveyHelp(){
  state.screen='survey-help';
  main.innerHTML=`<section class="survey-layout"><h1 tabindex="-1">Help or stop</h1><p>For help with the questionnaire, ask the Lutheran Care worker who invited you, or call <a href="tel:+61882699333">(08) 8269 9333</a> and ask for the NT Defence Family Support Program.</p>${isAdult()?'<p>For domestic, family or sexual violence support in Australia, contact <a href="https://www.1800respect.org.au/" target="_blank" rel="noopener">1800RESPECT</a> on 1800 737 732.</p>':'<p>If you are worried or feel unsafe, you can speak to a trusted adult or contact <a href="https://kidshelpline.com.au/" target="_blank" rel="noopener">Kids Helpline</a> on 1800 55 1800 in Australia.</p>'}<p>This questionnaire is not an urgent help service. In an emergency in Australia, call 000. Outside Australia, use your local emergency number.</p><div class="question-actions"><button class="back-button" id="survey-help-back">Back to my answers</button><button class="button secondary" id="survey-help-stop">Stop and clear my answers</button></div></section>`;
  main.querySelector('#survey-help-back').onclick=()=>{renderSurvey();focusHeading();};
  main.querySelector('#survey-help-stop').onclick=renderParticipationDeclined;
  focusHeading();
}
function requiredAnswersComplete(fields, answers) {
  return fields.filter(f=>f.required).every(f=>{const v=answers[f.key];return Array.isArray(v)?v.length>0:v!==undefined&&v!==null&&v!=='';});
}
function thankYouResource(config={}) {
  let url='';
  if (config.url === 'support.html') url = 'support.html';
  else try {const u=new URL(String(config.url||''));if(u.protocol==='https:'&&!u.username&&!u.password)url=u.href;} catch {}
  return {title:String(config.title||'A free resource for Defence families'),url};
}
function thankYouResourceHTML(config=globalThis.SURVEY_THANK_YOU_RESOURCE||{}) {
  const resource=thankYouResource(config);
  return `<section class="thank-you-resource"><p>As a thank-you for sharing your views, explore our free guide to support services for Defence members and families.</p>${resource.url?`<a class="button primary" href="${esc(resource.url)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">Find support in a few clicks</a>`:'<button class="button primary" disabled>Find support in a few clicks</button><p class="small">Available soon</p>'}</section>`;
}
function renderSurvey(){
  if(!hasValidParticipation()){renderWelcome();return;}
  if(state.step!=='connection'&&needsGuardianSupport(state.age,state.answers)){renderGuardianSupport();return;}
  state.screen='survey';
  const steps=activeSteps();let index=steps.findIndex(item=>item.id===state.step);
  if(index<0){state.step=steps[1]?.id||'connection';index=steps.findIndex(item=>item.id===state.step);}
  const step=steps[index],review=step.id==='review';let content=page(step);
  const early=consultationRoute(state.answers)==='earlier_experience';
  const displayPhases=early?['About you','Your experience','Review']:state.version==='child'?['About you','Your needs','Your experiences','Review']:['About you','Your needs','Looking ahead','Review'];
  const phaseIndex=early?index:step.phase;
  const topicId=step.topic_id||'',account=topicId?topicAccount(state.answers,topicId):step.account_id?accountById(state.answers,step.account_id):null;
  const issueCount=selectedIssues(state.answers,state.version).length;
  const chainSteps=steps.filter(item=>item.chain_need);
  const progress=step.chain_need?`<p class="need-progress">Detailed help pathway ${chainSteps.findIndex(item=>item.id===step.id)+1} of ${chainSteps.length}</p>`:step.detail_category?`<p class="need-progress">Priority area ${selectedPriorities(state.answers,state.version).indexOf(step.detail_category)+1} of ${selectedPriorities(state.answers,state.version).length}</p>`:step.id==='problem_screen'?`<p class="need-progress" id="problem-count">${selectedProblemItems(state.answers,state.version).length} situation${selectedProblemItems(state.answers,state.version).length===1?'':'s'} selected</p>`:topicId?`<p class="need-progress">Topic ${selectedIssues(state.answers,state.version).indexOf(topicId)+1} of ${issueCount}</p>`:step.id==='issue_cues'?`<p class="need-progress" id="issue-count">${issueCount} topic${issueCount===1?'':'s'} selected</p>`:account?`<p class="need-progress">Entry ${(state.answers.accounts||[]).findIndex(item=>item.id===account.id)+1} of ${(state.answers.accounts||[]).length}</p>`:step.need&&state.version==='child'?`<p class="need-progress">Area ${detailedNeeds(state.answers,domainList(),state.version).indexOf(step.need)+1} of ${detailedNeeds(state.answers,domainList(),state.version).length}</p>`:'';
  const topicQuestions=topicId?`${fieldHTML(content.fields[0])}${accountQuestionsHTML(content,account)}${accountHasAnswer(account)?`<div class="topic-add-more"><p class="small">Have another distinct experience or idea about ${esc(domainLabel(topicId))}?</p><div class="account-choices"><button class="button secondary" type="button" data-new-account="experience" data-topic-id="${esc(topicId)}">Add another experience</button><button class="button secondary" type="button" data-new-account="future" data-topic-id="${esc(topicId)}">Add another idea</button></div></div>`:''}${topicResourceHTML(topicId)}`:'';
  const questions=review?reviewHTML():topicId?topicQuestions:account?accountQuestionsHTML(content,account):step.id==='accounts_start'?accountsStartHTML():step.id==='accounts_manage'?accountsManageHTML():step.need?areaQuestionsHTML(content,step.need):content.fields.filter(field=>!['needs_other','future_needs_other','issue_other','problem_other'].includes(field.key)).map(fieldHTML).join('');
  const sourceCredit=step.id==='problem_screen'&&state.version==='adult'?'<p class="small rand-credit">Adult questionnaire adapted from <a href="https://www.rand.org/pubs/monographs/MG1124.html" target="_blank" rel="noopener noreferrer">Miller et al. (2011), RAND MG-1124, Appendix A</a>. RAND has not endorsed this local adaptation.</p>':'';
  const safetySupport=(step.detail_category==='relationships_safety'||step.chain_category==='relationships_safety')&&(state.answers.problem_cues||[]).includes('feeling_safe')?'<aside class="topic-support"><p>You do not need to describe an incident or identify anyone. For confidential support about domestic, family or sexual violence, <a href="https://www.1800respect.org.au/" target="_blank" rel="noopener noreferrer">1800RESPECT</a> is available on 1800 737 732. In immediate danger, call 000.</p></aside>':'';
  const skipDetails=['problem_screen','priority_pick'].includes(step.id)?'<button class="text-button" type="button" id="skip-details">Skip detailed questions</button>':'';
  main.innerHTML=`<div class="survey-layout"><section class="survey-main"><div class="step-topline"><strong>${esc(displayPhases[phaseIndex])}</strong><span>Section ${phaseIndex+1} of ${displayPhases.length}</span></div><div class="section-track" aria-hidden="true">${displayPhases.map((_,i)=>`<span class="${i<=phaseIndex?'visited':''}"></span>`).join('')}</div><form class="question-card" id="survey-form" novalidate><h1 tabindex="-1">${esc(content.title)}</h1>${content.intro?`<p class="question-intro">${esc(content.intro)}</p>`:''}${progress}${questions}${safetySupport}${sourceCredit}<div class="error" id="form-error" role="alert"></div><div class="question-actions"><button class="back-button" type="button" id="back">Back</button><div class="action-right">${skipDetails}<button class="button primary" type="submit">${review?'Finish preview':'Continue'}</button></div></div></form><button class="text-button" id="survey-help" type="button">Help or stop</button></section></div>`;
  main.querySelector('#survey-help').onclick=renderSurveyHelp;
  const form=main.querySelector('#survey-form');
  const rerender=()=>{renderSurvey();focusHeading();};
  form.querySelector('#skip-details')?.addEventListener('click',()=>{state.answers.skip_detail_questions=true;state.step='positive_future';rerender();});
  const addNew=(kind,forTopic='')=>{
    if(forTopic&&!commitTopicDraft(state.answers,forTopic)){form.querySelector('#form-error').textContent='This review can hold up to 100 entries. Please edit or remove an existing entry before adding another.';return;}
    const added=addAccount(state.answers,kind,forTopic);
    if(!added){form.querySelector('#form-error').textContent='This review can hold up to 100 entries. Your existing entries are safe. You can edit or remove an entry, or continue to finish.';return;}
    state.returnToManage=step.id==='accounts_manage';
    state.returnToTopic=forTopic;
    state.step=`account:${added.id}`;
    rerender();
  };
  form.querySelectorAll('[data-new-account]').forEach(button=>button.onclick=()=>addNew(button.dataset.newAccount,button.dataset.topicId||''));
  form.querySelectorAll('[data-edit-topic]').forEach(button=>button.onclick=()=>{state.step=`topic:${button.dataset.editTopic}`;rerender();});
  form.querySelectorAll('[data-edit-issues]').forEach(button=>button.onclick=()=>{state.step='issue_cues';rerender();});
  form.querySelectorAll('[data-edit-account]').forEach(button=>button.onclick=()=>{state.returnToManage=true;state.step=`account:${button.dataset.editAccount}`;rerender();});
  form.querySelectorAll('[data-remove-account]').forEach(button=>button.onclick=()=>{
    if(typeof window.confirm==='function'&&!window.confirm('Remove this account? The other accounts will stay as they are.'))return;
    removeAccount(state.answers,button.dataset.removeAccount);
    state.step=(state.answers.accounts||[]).length?'accounts_manage':'accounts_start';
    rerender();
  });
  form.querySelectorAll('[data-expand-details]').forEach(button=>button.onclick=()=>{const item=accountById(state.answers,button.dataset.expandDetails);if(item){item.detail_open=true;rerender();}});
  form.querySelectorAll('[data-expand-prompt]').forEach(button=>button.onclick=()=>{const item=accountById(state.answers,button.dataset.expandPrompt);if(item){item.prompt_open=true;rerender();}});
  const bindPractical=()=>{
    if(!account)return;
    const wrap=form.querySelector('[data-practical-control]');if(!wrap)return;
    wrap.innerHTML=accountPracticalControlHTML(account);
    const button=wrap.querySelector('[data-add-practical]');
    if(button)button.onclick=()=>{account.practical_opt_in=true;rerender();};
  };
  bindPractical();
  const refreshContinue=()=>{form.querySelector('[type="submit"]').disabled=!requiredAnswersComplete(content.fields.filter(conditionalVisible),state.answers);};
  refreshContinue();
  form.addEventListener('change',event=>{
    const input=event.target;if(!input.name)return;
    const field=content.fields.find(item=>item.key===input.name);if(!field)return;
    const old=getValue(field.key);let value=input.value;
    if(field.type==='multi'){
      value=toggleChoice(old,input.value,field.exclusive||[]);
      if(field.max_selected&&value.length>field.max_selected){form.querySelector('#form-error').textContent=`Choose up to ${field.max_selected}. You can change an earlier choice first.`;input.checked=(old||[]).includes(input.value);return;}
    }
    setValue(field.key,value);
    if(JSON.stringify(old)!==JSON.stringify(value))reconcileAnswers(state.answers,field.key,domainList(),old);
    if(field.key==='problem_cues'||field.key==='priority_categories')state.answers.skip_detail_questions=false;
    if(field.key.startsWith('need_chains:')&&['seek_receipt','sources'].includes(field.key.split(':')[3])){renderSurvey();return;}
    if(field.key==='problem_cues'){const count=selectedProblemItems(state.answers,state.version).length;const status=form.querySelector('#problem-count');if(status)status.textContent=`${count} situation${count===1?'':'s'} selected`;}
    if(field.key.startsWith('problem_details:')&&field.key.endsWith(':help_kinds')){
      content=page(step);
      const priority=content.fields.find(item=>item.key.endsWith(':priority_help'));
      const wrap=form.querySelector(`[data-field="${priority.key}"]`);if(wrap)wrap.outerHTML=fieldHTML(priority);
    }
    if(topicId&&field.key===accountKey(account.id,'kind')){rerender();return;}
    if(field.key==='issue_cues'){const count=selectedIssues(state.answers,state.version).length;const status=form.querySelector('#issue-count');if(status)status.textContent=`${count} topic${count===1?'':'s'} selected`;}
    if(field.key==='residence_area'){
      const other=form.querySelector('[data-field="residence_area"] .area-other-options');if(other)other.open=!['darwin','palmerston','litchfield'].includes(value);
      content=page(step);const suburb=content.fields.find(item=>item.key==='suburb');const wrap=form.querySelector('[data-field="suburb"]');if(suburb&&wrap)wrap.outerHTML=fieldHTML(suburb);
    }
    if(account&&field.key===accountKey(account.id,'proposal_type')){
      content=page(step);
      const useful=content.fields.find(item=>item.key===accountKey(account.id,'useful_change'));
      const wrap=form.querySelector(`[data-field="${useful.key}"]`);if(wrap)wrap.outerHTML=fieldHTML(useful);
      const practical=content.fields.find(item=>item.key===accountKey(account.id,'practical_detail'));
      const practicalWrap=form.querySelector(`[data-field="${practical.key}"]`);if(practicalWrap)practicalWrap.outerHTML=fieldHTML(practical);
    }
    if(field.key.startsWith('areas:')&&field.key.endsWith(':sources')){
      content=page(step);const barrier=content.fields.find(item=>item.key.endsWith(':barriers'));
      const wrap=form.querySelector(`[data-field="${barrier.key}"]`);if(wrap)wrap.outerHTML=fieldHTML(barrier);
    }
    for(const item of content.fields){
      const wrap=form.querySelector(`[data-field="${item.key}"]`);if(!wrap)continue;
      wrap.hidden=!conditionalVisible(item);
      const saved=getValue(item.key);
      wrap.querySelectorAll('input,textarea,select').forEach(el=>{if(el.name!==item.key)return;if(['checkbox','radio'].includes(el.type))el.checked=Array.isArray(saved)?saved.includes(el.value):saved===el.value;else el.value=saved??'';});
    }
    bindPractical();refreshContinue();
  });
  form.addEventListener('input',event=>{
    const input=event.target;
    if(!input.matches('textarea,input[type="text"],input.text-input'))return;
    const old=getValue(input.name);setValue(input.name,input.value);
    if(old!==input.value)reconcileAnswers(state.answers,input.name,domainList(),old);
    if(account&&(input.name===accountKey(account.id,'useful_change')||account.kind==='future'&&input.name===accountKey(account.id,'story'))){
      const practical=content.fields.find(item=>item.key===accountKey(account.id,'practical_detail'));
      const wrap=form.querySelector(`[data-field="${practical.key}"]`);if(wrap)wrap.hidden=!conditionalVisible(practical);
      bindPractical();
    }
    const counter=form.querySelector(`[data-counter="${input.name}"]`);
    if(counter){counter.textContent=`${input.maxLength-input.value.length} characters remaining`;counter.hidden=input.value.length<input.maxLength*.8;}
    refreshContinue();
  });
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const missing=content.fields.filter(conditionalVisible).find(field=>field.required&&(!getValue(field.key)||Array.isArray(getValue(field.key))&&!getValue(field.key).length));
    if(missing){form.querySelector('#form-error').textContent='Please answer: '+missing.label;form.querySelector(`[name="${missing.key}"]`)?.focus();return;}
    if(step.id==='connection'&&isOutsideSurveyScope(state.answers)){renderScope();return;}
    if(step.id==='connection'&&needsGuardianSupport(state.age,state.answers)){renderGuardianSupport();return;}
    if(review){renderFinish();return;}
    if(topicId){
      if(!commitTopicDraft(state.answers,topicId)){form.querySelector('#form-error').textContent='This review can hold up to 100 entries. Your answer is still here; please edit or remove an existing entry before continuing.';return;}
      if(state.returnToReview){state.returnToReview=false;state.step='review';rerender();return;}
      goNext(step.id);return;
    }
    if(account){
      if(discardEmptyAccount(state.answers,account.id)){
        state.step=state.returnToReview?'review':(state.answers.accounts||[]).length?'accounts_manage':'accounts_start';
        state.returnToManage=false;state.returnToReview=false;rerender();return;
      }
      if(state.returnToManage){state.returnToManage=false;state.step='accounts_manage';rerender();return;}
      if(state.returnToTopic){const target=state.returnToTopic;state.returnToTopic='';state.step=`topic:${target}`;rerender();return;}
    }
    if(state.returnToReview){state.returnToReview=false;state.step='review';rerender();return;}
    if(step.id==='problem_screen')state.answers.skip_detail_questions=false;
    goNext(step.id);
  });
  main.querySelector('#back').onclick=()=>{
    if(topicId&&!commitTopicDraft(state.answers,topicId)){form.querySelector('#form-error').textContent='This review can hold up to 100 entries. Your answer is still here; please edit or remove an existing entry before leaving this page.';return;}
    if(account&&discardEmptyAccount(state.answers,account.id)){
      state.step=state.returnToReview?'review':(state.answers.accounts||[]).length?'accounts_manage':'accounts_start';
      state.returnToManage=false;state.returnToReview=false;rerender();return;
    }
    if(account&&state.returnToManage){state.returnToManage=false;state.step='accounts_manage';rerender();return;}
    if(account&&state.returnToTopic){const target=state.returnToTopic;state.returnToTopic='';state.step=`topic:${target}`;rerender();return;}
    if(state.returnToReview){state.returnToReview=false;state.step='review';rerender();return;}
    const current=activeSteps().filter(item=>!item.account_id),position=current.findIndex(item=>item.id===step.id);
    if(position<=0){renderWelcome();focusHeading();return;}
    state.step=current[position-1].id;rerender();
  };
  main.querySelectorAll('[data-edit]').forEach(button=>button.onclick=()=>{state.returnToReview=true;state.returnToManage=false;state.step=button.dataset.edit;rerender();});
}
function goNext(id){const steps=activeSteps().filter(step=>!step.account_id),index=steps.findIndex(s=>s.id===id);state.step=steps[index+1]?.id||'review';renderSurvey();focusHeading();}
function contactLinkHTML(){return '<a class="button primary" href="contact.html" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">Request an interview</a>';}
function renderFinish(){state.screen='finish';main.innerHTML=`<section class="finish"><h1 tabindex="-1">You have reached the end of this survey preview.</h1><p>Your answers were not sent or saved.</p><div class="finish-next-steps"><section class="finish-contact"><p>Would you like to discuss your experiences and support needs further with Lutheran Care?</p>${contactLinkHTML()}</section>${thankYouResourceHTML()}</div><button class="text-button" id="restart">Clear answers and start again</button></section>`;main.querySelector('#restart').onclick=()=>{resetAgePath();renderWelcome();};focusHeading();}
const reviewNotes = new Map();
let libraryVersion = 'adult';
let libraryLocation = 'nt';

// Read the exact live question definitions in a temporary preview context.
// No synthetic answers from this library enter the respondent flow or results.
function questionLibrarySections(version,location) {
  const original={version:state.version,answers:state.answers};
  const first=DOMAINS[version][0].id;
  state.version=version;
  state.answers={roles:['partner'],residence_area:location==='nt'?'darwin':location==='outside'?'outside':'prefer',suburb:location==='nt'?'casuarina':'',past_residence:location==='outside'?'yes':undefined};
  try {
    const sections=[],add=(id,note='')=>sections.push({id,...page({id}),note});
    add('connection',version==='youth'?'ADF relationship, local area and help with reading or writing precede the account route.':'ADF relationship, optional local area and adult age band precede the account route.');
    if(version!=='youth')add('place','Optional local background. The broader area is chosen first; suburb or locality is optional.');
    if(version==='child'){
      state.answers.needs_status='yes';state.answers.needs=[first];state.answers.areas={[first]:{received:'enough',sources:['family']}};
      add('needs','Legacy child definitions shown for review only. Children aged 7 or younger use the separate guardian-supported form below.');
      const area=areaPage(first);
      sections.push({id:'area',...area,title:'Legacy child area example',note:'The under-7 guardian-supported flow uses its own child-expression prompts and parent/guardian observations.'});
    }else{
      add('problem_screen',version==='adult'?'Nine grouped recall areas with 45 optional concrete cues, adapted from RAND 2011 Appendix A for Greater Darwin. These are not a validated prevalence scale.':'Eight short, age-appropriate cues; the young person answers about their own perspective.');
      state.answers.problem_cues=problemItemIds(version);
      add('priority_pick','Shown only when more than two broad areas contain a selected cue. The respondent can choose up to two for follow-up or skip details; all original cue selections remain recorded.');
      state.answers.problem_details={};
      for(const category of problemCatalog(version)){
        const detail=version==='youth'?{story:'A situation that mattered',needed_help:'Someone to talk to',asked_anyone:'yes',anyone_helped:'yes',enough:'some'}:{help_kinds:['general_information','social_support','practical_help'],priority_help:['general_information','practical_help'],need_chains:{general_information:{seek_receipt:'sought_received',sources:['defence','family_friends']},practical_help:{seek_receipt:'not_sought'}}};
        state.answers.problem_details[category.id]=detail;
        sections.push({id:`problem-detail-${category.id}`,...problemDetailPage(category.id),note:version==='youth'?'Short young-person route: situation, help wanted, asked, helped and whether it was enough.':'One need-selection page appears for this priority area. It retains all selected help kinds and asks for up to two only when more than two were selected.'});
        if(version==='adult')for(const needId of ['general_information','practical_help'])sections.push({id:`need-chain-${category.id}-${needId}`,...needChainPage(category.id,needId),note:'One linked chain for this area and this particular help type. The first sample shows received help and source outcome cards; the second shows a not-sought path. At most four chains appear in one response.'});
      }
      state.answers.problem_cues.push('other_problem');state.answers.problem_other='A situation not listed';
      state.answers.problem_details.other_problem=version==='youth'?{story:'Another situation'}:{help_kinds:['general_information'],need_chains:{general_information:{seek_receipt:'sought_no_receipt',sources:['none_found']}}};
      sections.push({id:'problem-detail-other_problem',...problemDetailPage('other_problem'),note:'A respondent can select another problem outside the listed cues and choose it for linked follow-up.'});
      if(version==='adult')sections.push({id:'need-chain-other_problem-general_information',...needChainPage('other_problem','general_information'),note:'Other problem can also receive a linked need pathway when chosen as a priority.'});
      add('positive_future','Positive existing support and emerging needs are available even when no problem cue was selected.');
      const experience={id:'a1',kind:'experience',story:'One experience in Greater Darwin',useful_change:'Clearer information about a step',detail_open:true,prompt_open:true,proposal_type:'information'};
      const future={id:'a2',kind:'future',story:'An idea for the coming months',useful_change:'An activity for parents and children',prompt_open:true,proposal_type:'activity',practical_opt_in:true};
      state.answers.accounts=[experience,future];state.answers.account_next_id=3;
      add('accounts_start','Optional short supplementary experience or idea; not a repeat of the priority chain.');
      sections.push({id:'account-experience',...page({id:'account:a1',account_id:'a1'}),note:'Default: one optional story, one optional help-status choice, and one distinct optional keep/change box. Helped/difficult boxes appear only after an explicit request for more detail. The proposal helper relabels the existing change box.'});
      sections.push({id:'account-future',...page({id:'account:a2',account_id:'a2'}),note:'Future ideas do not inherit past-help questions. Practical details appear only after an explicit eligible proposal type, a described change and the respondent’s own opt-in.'});
      add('accounts_manage','The respondent may add, edit or remove voluntary supplemental entries. Up to 100 active entries can be added; this is a technical ceiling, not a target.');
    }
    add('earlier','Separate historical route for people now outside Greater Darwin who have past local experience; not part of the current account sequence.');
    for(const section of sections)for(const item of section.fields){if(item.key==='suburb'){item.options=suburbs;item.options_rule='Show only localities matching the selected residence area, plus other/prefer. Blank retains area only.';}}
    return sections;
  } finally {state.version=original.version;state.answers=original.answers;}
}

function libraryFieldHTML(f) {
  const conditional = {local_area:'Optional suburb list shown after a Greater Darwin area is chosen.',formal_sources:'Optional when a service or organisation source is selected.',outside_suburb:'Shown for Outside Greater Darwin.',other_suburb:'Shown when Another suburb or locality in this area is selected.',needs_list:'Shown after Yes or Not sure to needing recent support on the legacy child example.',other_need:'Shown after recent Something else is selected on the legacy child example.',area_barriers:'Shown after a child or young person reports looking for support or not seeking it.',problem_other:'Shown only after Another situation is selected.',problem_priority_help:'Shown only when more than two kinds of help were selected.',problem_other_help:'Shown when Another kind of help was selected.',youth_received:'Shown only when the young person says someone helped.',chain_sources:'Shown after a help-seeking or receipt response other than explicit no seeking.',chain_source_other:'Shown when Another source is selected.',chain_source_outcome:'Shown as a source-specific card when help was received or receipt is uncertain.',chain_barriers:'Shown after any explicit help-seeking or receipt response.',chain_bridge:'Shown when help was received or receipt is uncertain.',chain_current_gap:'Shown only when current help is still missing.',account_details:'Shown only after the respondent asks to add what helped or was difficult.',account_prompt_type:'Shown only after the respondent asks for a prompt; it changes the label of the same useful-change box.',account_practical:'Shown only after an eligible specific proposal is described and the respondent opts to add practical details.'}[f.conditional];
  const type = {single:'Choose one',multi:'Select all that apply',select:'Choose one area',text:'Written answer',short:'Short written answer'}[f.type];
  return `<div class="library-question"><p class="question-meta">${type} · ${f.required?'Needed to continue':'Optional'}</p><h3>${esc(f.label)}</h3>${f.hint?`<p class="field-hint">${esc(f.hint)}</p>`:''}${conditional?`<p class="branch-note">${conditional}</p>`:''}${f.options.length?`<ul class="option-list">${f.options.map(o=>`<li>${esc(o.label)}${o.hint?` <small>— ${esc(o.hint)}</small>`:''}</li>`).join('')}</ul>`:`<p class="small">${f.type==='short'?'Up to 160 characters.':`Up to ${maxTextLength(libraryVersion)} characters.`}</p>`}</div>`;
}

function downloadText(filename, text, type='text/plain;charset=utf-8') {
  const url=URL.createObjectURL(new Blob([text],{type}));
  const link=document.createElement('a');link.href=url;link.download=filename;link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

function librarySectionFieldsHTML(section) {
  return section.fields.map(f=>{
    const variants=f.key.endsWith(section.fields.some(item=>item.key.endsWith(':service_names'))?':service_names':':sources')?(section.variants||[]).map(v=>`<div><h3 class="branch-label">${esc(v.title)}</h3>${v.fields.map(libraryFieldHTML).join('')}</div>`).join(''):'';
    return libraryFieldHTML(f)+variants;
  }).join('');
}

function renderQuestionLibrary() {
  const sections=questionLibrarySections(libraryVersion,libraryLocation);
  const versionLabel={adult:'Adults · 18 or older',youth:'Young people · 8–17'}[libraryVersion];
  main.innerHTML=`<h1>All questions</h1><p class="lead">Read the wording, options and different paths in one place.</p><p class="small">This list uses the same questions as the survey. Adults first see nine groups of situation cues, then choose up to two areas for linked follow-up. Young people see a shorter, separately worded route. Notes are for your own review: they are not sent anywhere. Download them before closing or refreshing this page.</p><div class="library-tools"><label>Age version<select class="select" id="review-version"><option value="adult" ${libraryVersion==='adult'?'selected':''}>Adults · 18 or older</option><option value="youth" ${libraryVersion==='youth'?'selected':''}>Young people · 8–17</option></select></label><label>Location<select class="select" id="review-location"><option value="nt" ${libraryLocation==='nt'?'selected':''}>Living in Greater Darwin</option><option value="outside" ${libraryLocation==='outside'?'selected':''}>Other locality</option><option value="unspecified" ${libraryLocation==='unspecified'?'selected':''}>Residence not disclosed</option></select></label><button class="button secondary" id="print-questions">Print questions</button></div><p class="small" id="version-description">${versionLabel} · ${libraryLocation==='nt'?'Living in Greater Darwin':libraryLocation==='outside'?'Other locality':'Residence not disclosed'} · 29 September 2026</p><div class="notes-actions"><button class="button secondary" id="download-notes">Download review notes</button><span class="notes-status" aria-live="polite">${reviewNotes.size?`Notes in ${reviewNotes.size} section${reviewNotes.size===1?'':'s'}`:'No notes yet'}</span></div><nav class="library-index" aria-label="Question sections">${sections.map(s=>`<a href="#${s.id}">${esc(s.id==='adequacy'?'Support received':s.id==='barriers'?'Getting help':s.title)}</a>`).join('')}</nav>${sections.map(s=>{const key=`${libraryVersion}/${libraryLocation}/${s.id}`;return `<section class="library-section" id="${s.id}"><h2>${esc(s.title)}</h2><p class="small">${esc(s.intro)}</p>${s.note?`<p class="branch-note">${esc(s.note)}</p>`:''}${librarySectionFieldsHTML(s)}<label class="notes-label" for="note-${s.id}">Your review notes: ${esc(s.title)}</label><textarea class="textarea review-note" id="note-${s.id}" data-note="${key}" maxlength="4000" placeholder="Suggested wording, a missing option, or a question for the team">${esc(reviewNotes.get(key)||'')}</textarea></section>`;}).join('')}<section class="library-section" id="under-seven"><h2>Children aged 7 or younger</h2><p>A parent or guardian sees one response box per child prompt, followed by Your observations. Confirm willingness before recording the child’s own views; leave those questions blank when the child cannot or does not want to answer. The observations field remains available and records the adult’s perspective separately.</p><ol>${YOUNG_PROMPTS.map(text=>`<li>${esc(text)}</li>`).join('')}</ol><p>Each prompt has an optional written-response box. A separate optional box records parent/guardian observations. A parent or guardian can leave the child questions blank and enter only their observations, without a claim of child assent.</p><p>The 8–17 route shares one question set; an age follow-up changes only the participation steps. See the <a href="review.html#children">participation guide</a>.</p></section><div class="notes-actions"><button class="button primary" id="download-notes-bottom">Download review notes</button><a class="button secondary" href="index.html">Try the survey</a></div>`;
  main.querySelector('#review-version').onchange=e=>{libraryVersion=e.target.value;renderQuestionLibrary();};
  main.querySelector('#review-location').onchange=e=>{libraryLocation=e.target.value;renderQuestionLibrary();};
  main.querySelector('#print-questions').onclick=()=>window.print();
  main.querySelectorAll('[data-note]').forEach(input=>input.addEventListener('input',()=>{if(input.value.trim())reviewNotes.set(input.dataset.note,input.value);else reviewNotes.delete(input.dataset.note);main.querySelector('.notes-status').textContent=reviewNotes.size?`Notes in ${reviewNotes.size} section${reviewNotes.size===1?'':'s'}`:'No notes yet';}));
  const download=()=>{const entries=[...reviewNotes].map(([key,value])=>`## ${key}\n\n${value}`).join('\n\n');downloadText('nt-survey-review-notes.md',`# NT questionnaire review notes\n\nQuestionnaire: 29 September 2026\nSaved: ${new Date().toISOString()}\n\n${entries||'No notes entered.'}\n`);};
  main.querySelector('#download-notes').onclick=download;main.querySelector('#download-notes-bottom').onclick=download;
}

// The question library imports the same definitions as the respondent flow.
if (document.body.dataset.view === 'questions') {
  renderQuestionLibrary();
} else {
  document.querySelector('#privacy-copy').innerHTML=participantInformationHTML('privacy-information');
  document.querySelector('#privacy-open').onclick=()=>document.querySelector('#privacy-dialog').showModal();
  document.querySelector('#privacy-close').onclick=()=>document.querySelector('#privacy-dialog').close();
  document.querySelector('#privacy-dialog').addEventListener('click',e=>{if(e.target===e.currentTarget)e.currentTarget.close();});
  renderWelcome();
}
