// Task labels describe what the person wants to do. The seven legacy topic IDs
// remain private routing details, rather than categories shown on the homepage.
const choice=(title,topicId,need,answers)=>({title,topicId,need,...(answers?{answers}:{})});
export const journeys=[
 {id:'posting',title:'Moving for a posting',hint:'Housing, removals and settling in',primary:true,choices:[
  choice('Defence housing or rent allowance','money','defence-housing',{housingTask:'home'}),
  choice('Arrange an approved Defence removal','money','defence-housing',{housingTask:'removal'}),
  choice('Living apart or maintaining two homes','money','defence-housing',{housingTask:'other'}),
  choice('Find local family support after a move','connection','settle'),
  choice('Move a pet with a Defence-funded move','money','pets',{petNeed:'move'})]},
 {id:'absence',title:'Managing time apart',hint:'A deployment, absence or reunion',primary:true,choices:[choice('Support during an absence or reunion','connection','apart',{absenceNeed:'support'}),choice('Help a child cope with parental absence','connection','apart',{absenceNeed:'child'}),choice('Relationship counselling during time apart','connection','apart',{absenceNeed:'relationship'})]},
 {id:'children-education',title:'Childcare or school support',hint:'Find care, change schools or get learning help',primary:true,choices:[
  choice('Find regular childcare','parenting','childcare',{careHours:'regular'}),
  choice('Childcare outside usual hours','parenting','childcare',{careHours:'nonstandard'}),
  choice('Urgent help caring for children','parenting','emergency-care'),
  choice('Start or change schools','parenting','school'),
  choice('Learning support or a school problem','parenting','learning'),
  choice('Help with education costs','parenting','education-costs')]},
 {id:'work',title:'Finding work or studying',hint:'Jobs, partner careers and training',primary:true,choices:[
  choice('Find work or change career','work','job'),choice('Career support for a Defence partner','work','partner'),
  choice('Adult study or retraining','work','study'),choice('Balance Reserve service with civilian work','work','reserve'),
  choice('Change Defence work arrangements','work','flexible')]},
 {id:'transition',title:'Leaving Defence',hint:'Plan the next stage of work and family life',primary:true,choices:[choice('Transition support before or after leaving','work','transition')]},
 {id:'mental-health',title:'Support with mental health',hint:'Talk to someone or arrange ongoing care',primary:true,choices:[
  choice('Talk about stress, mood or mental health','mental','feelings'),
  choice('Arrange ongoing mental-health treatment','mental','treatment'),
  choice('Manage ongoing stress','mental','managing-stress')]},
 {id:'health',title:'Healthcare or treatment costs',hint:'Health advice, member care and medical travel',primary:true,choices:[
  choice('Health advice for a family member or civilian','care','health',{healthFor:'other'}),
  choice('Find a serving member’s health centre','care','health',{healthFor:'member'}),
  choice('Help with treatment costs','care','costs'),choice('Travel for specialist treatment','care','travel')]},
 {id:'safety',title:'Violence, assault or feeling unsafe',hint:'Safe support and a place to stay',primary:true,choices:[
  choice('Talk about violence or feeling unsafe','relationships','unsafe'),
  choice('A safe place to stay because of violence','relationships','refuge'),
  choice('Medical support after sexual assault','relationships','assault'),
  choice('Defence-related sexual misconduct','relationships','misconduct'),
  choice('Support for a child affected by violence','relationships','child-violence')]},
 {id:'relationships',title:'Relationship or separation support',hint:'Counselling, arrangements and child contact',primary:true,choices:[
  choice('Relationship counselling','relationships','counselling'),
  choice('Separation, parenting or property advice','relationships','separation',{separationHelp:'advice'}),
  choice('Supervised child visits or safer changeovers','relationships','separation',{separationHelp:'child-contact'})]},
 {id:'money',title:'Bills, income or essentials',hint:'Debt advice, payments and emergency relief',primary:true,choices:[
  choice('Debt or bills','money','bills'),choice('Income has dropped or stopped','money','income'),choice('Food or other essentials','money','essentials')]},
 {id:'housing-tonight',title:'Nowhere to stay tonight',hint:'Check suitable accommodation and eligibility',primary:true,choices:[choice('Nowhere to stay tonight','money','tonight')]},
 {id:'losing-housing',title:'At risk of losing your home',hint:'Get help before housing is lost',primary:true,choices:[choice('At risk of losing your home','money','losing-housing')]},
 {id:'stable-housing',title:'Find a stable home',hint:'Housing advice and a suitable referral',primary:true,choices:[choice('Find a stable home','money','stable-housing')]},
 {id:'rental',title:'Rent assistance or tenancy advice',hint:'Payments, bond, rent and tenancy problems',primary:false,choices:[choice('Help with private rent','money','rent-assistance'),choice('A rent, bond or tenancy dispute','money','tenancy'),choice('A young person at risk of homelessness','money','youth-housing')]},
 {id:'child-wellbeing',title:'A child or young person’s wellbeing',hint:'Emotions, behaviour and youth support',primary:false,choices:[
  choice('Emotional support for a child under 18','mental','feelings',{age:'under18'}),
  choice('Support for a teenager or young adult (12–25)','parenting','teenager')]},
 {id:'parenting',title:'Help with parenting',hint:'Support for a parent, carer or child',primary:false,choices:[
  choice('Parenting stress or a child’s behaviour','parenting','parenting',{parentingNeed:'general'}),
  choice('Support for an Aboriginal child under 12','parenting','parenting',{parentingNeed:'indigenous-child'})]},
 {id:'baby',title:'Pregnancy or a new baby',hint:'Maternity care, advice and wellbeing',primary:false,choices:[
  choice('Pregnancy, baby or feeding advice','care','baby',{babyNeed:'advice'}),
  choice('Find local maternity care','care','baby',{babyNeed:'maternity'}),
  choice('A child-health nurse for a child from birth to five','care','baby',{babyNeed:'nurse'}),
  choice('Emotional support during pregnancy or early parenthood','care','baby',{babyNeed:'emotional'})]},
 {id:'disability',title:'Disability support',hint:'Access, advocacy and continuity during a posting',primary:false,choices:[
  choice('Apply for NDIS support','care','disability',{disabilityNeed:'ndis'}),
  choice('A problem getting disability support','care','disability',{disabilityNeed:'advocacy'}),
  choice('Special needs during a Defence posting','care','disability',{disabilityNeed:'posting'}),
  choice('Development or therapy support for a child','parenting','development')]},
 {id:'carers',title:'Support for an unpaid carer',hint:'Practical help, respite and young carers',primary:false,choices:[
  choice('Support for an unpaid carer','care','carer'),choice('A young person caring for someone','care','young-carer'),
  choice('Carer skills or involvement in care decisions','care','care-skills')]},
 {id:'older',title:'Support for an older relative',hint:'Aged care, memory problems and care rights',primary:false,choices:[
  choice('Find or arrange aged care','care','older',{olderNeed:'care'}),
  choice('Memory problems or dementia','care','older',{olderNeed:'memory'}),
  choice('A problem with aged-care services','care','older',{olderNeed:'rights'})]},
 {id:'home-help',title:'Practical help at home',hint:'Illness, injury or a family-care emergency',primary:false,choices:[
  choice('Veteran home care or household help','care','home-care'),
  choice('Family care when a serving member is away or unwell','money','family-crisis'),
  choice('Check the DVA Acute Support Package','money','acute-support')]},
 {id:'bereavement',title:'Support after a death',hint:'Practical next steps and support with grief',primary:false,choices:[
  choice('Support with grief','mental','grief'),choice('Practical help after a member or veteran dies','mental','practical-loss'),
  choice('Support after a death by suicide','mental','suicide-loss')]},
 {id:'addiction',title:'Alcohol, drugs or gambling concerns',hint:'Counselling and confidential advice',primary:false,choices:[
  choice('Alcohol or other drugs','mental','addiction',{addiction:'substances'}),choice('Gambling','mental','addiction',{addiction:'gambling'})]},
 {id:'groups',title:'Meet people or join activities',hint:'Local groups and Defence-family activities',primary:false,choices:[
  choice('Find local groups and activities','connection','local'),choice('Activities for a Defence child aged 8–18','connection','defence-child'),
  choice('Meaningful activities or recognition','connection','recognition')]},
 {id:'language',title:'Interpreting or accessible contact',hint:'Language, hearing or speech support',primary:false,choices:[
  choice('An interpreter for another language','connection','language',{languageNeed:'english'}),
  choice('An Aboriginal-language interpreter','connection','language',{languageNeed:'aboriginal'}),
  choice('Help with a call because of hearing or speech difficulties','connection','language',{languageNeed:'relay'})]},
 {id:'aboriginal-wellbeing',title:'Aboriginal or Torres Strait Islander wellbeing',hint:'Local care or support after a traumatic death',primary:false,choices:[
  choice('Local social and emotional wellbeing support','mental','indigenous',{indigenousNeed:'local'}),
  choice('Culturally led support after a suicide or traumatic death','mental','indigenous',{indigenousNeed:'loss'})]},
 {id:'inclusive',title:'LGBTQIA+ peer support',hint:'Sexuality, gender, identity and relationships',primary:false,choices:[choice('LGBTQIA+ peer support','mental','lgbtq')]},
 {id:'private',title:'Anonymous support about Defence life',hint:'Talk without routinely giving your identity',primary:false,choices:[choice('Confidential or anonymous military-aware support','mental','private')]},
 {id:'family-info',title:'Information for Defence family members',hint:'Recognition, benefits and direct family enquiries',primary:false,choices:[choice('Information and benefits for family members','connection','family-info')]},
 {id:'family-advocacy',title:'Family advocacy or consultation',hint:'Have a say in policy and services',primary:false,choices:[choice('Family advocacy or consultations','connection','feedback')]},
 {id:'defence-aware',title:'Find services that understand Defence life',hint:'Service history and family eligibility can differ',primary:false,choices:[choice('Military-aware support and eligibility advice','connection','defence-aware')]},
 {id:'new-entry',title:'Supporting someone starting military life',hint:'Information for a new member and their family',primary:false,choices:[choice('Family support when someone joins Defence','connection','new-entry')]},
 {id:'moving-childcare',title:'Childcare during a Defence move',hint:'Eligibility depends on the child and available care',primary:false,choices:[choice('Childcare during a Defence-funded move','parenting','moving-care')]},
 {id:'rehabilitation',title:'DVA rehabilitation',hint:'Support with an accepted condition and rehabilitation needs',primary:false,choices:[choice('DVA rehabilitation','work','rehabilitation')]},
 {id:'budgeting',title:'Plan a budget or understand money',hint:'Defence financial education before or after transition',primary:false,choices:[choice('Budgeting and financial education','money','budgeting')]},
 {id:'claims',title:'DVA claims or benefits',hint:'Independent claims help and entitlement information',primary:false,choices:[choice('Help with a DVA claim','money','claims')]},
 {id:'legal',title:'Legal advice',hint:'Find a service for the actual legal issue',primary:false,choices:[choice('Legal advice','relationships','legal')]},
 {id:'pets',title:'Pet care or a safe exit with pets',hint:'Care information and safety planning',primary:false,choices:[
  choice('Pet care information','money','pets',{petNeed:'care'}),choice('Pets while leaving an unsafe home','money','pets',{petNeed:'safe-exit'})]},
 {id:'distress-training',title:'Learn to recognise and respond to distress',hint:'Veteran-community mental-health training',primary:false,choices:[choice('Mental-health training for the veteran community','mental','distress-signs')]},
 {id:'home-ownership',title:'Defence home ownership assistance',hint:'Qualifying service and loan conditions apply',primary:false,choices:[choice('Check Defence Home Ownership Assistance','money','home-ownership')]},
 {id:'nt-preparedness',title:'Prepare for NT weather and emergencies',hint:'Official household guidance and alerts',primary:false,choices:[choice('NT household emergency preparation','connection','nt-preparedness')]},
 {id:'pastoral',title:'Pastoral or spiritual support',hint:'ADF chaplaincy for members and families',primary:false,choices:[choice('Contact an ADF chaplain','connection','pastoral')]},
 {id:'urgent-mental',title:'Urgent mental-health or emotional crisis',hint:'Emergency and crisis contacts',primary:false,choices:[choice('Immediate crisis contacts','mental','crisis')]},
 {id:'nt-urgent-mental',title:'NT urgent mental-health advice',hint:'Help for you or someone you are concerned about',primary:false,choices:[choice('NT Mental Health Line','mental','nt-crisis')]}
];
