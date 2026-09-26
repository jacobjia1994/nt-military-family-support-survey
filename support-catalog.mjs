import {reviewedReferrals} from './support-referrals.mjs?v=20260926-4';
import {expandedServices} from './support-expanded.mjs?v=20260926-2';
// Curated contact routes, independently checked against official provider sources.
// A free first service does not imply that every onward service is free.
const checked = '2026-09-26';
const service = data => ({ ...data, sources: data.sources || [data.url], checked });

export const services = {
  ...reviewedReferrals,
  'nt-inhome-care': service({
    name:'NT In Home Care Support Agency',audience:'Families whose childcare needs cannot be met by suitable available mainstream care',area:'NT-wide · phone and email',
    offer:'Ask about in-home care when shift hours, geographic isolation or complex needs prevent access to ordinary childcare.',cost:'Eligibility and subsidy enquiry. Childcare fees apply.',
    access:'Child Care Subsidy and In Home Care conditions apply. An assessment does not guarantee an educator or place.',phone:'1300 164 202',url:'https://inhomesupportagencywa.org.au/IHSWA/',extraUrl:'mailto:info@ihcsupportagencynt.org.au',extraLabel:'Email the NT support agency',sources:['https://www.education.gov.au/early-childhood/about/service-types/home-care/support-agencies','https://inhomesupportagencywa.org.au/IHSWA/']
  }),
  'inhome-care-agencies': service({
    name:'In Home Care — find your support agency',audience:'Families needing care around nonstandard hours, isolation or complex needs',area:'Australia-wide · official contact list',
    offer:'Find the agency that assesses In Home Care eligibility in your state or territory.',cost:'Free contact directory. Care fees and subsidy rules apply.',access:'Choose the agency for your location to discuss eligibility and suitable care.',url:'https://www.education.gov.au/early-childhood/about/service-types/home-care/support-agencies',action:'Find your support agency'
  }),
  'open-arms-check': service({
    name:'Open Arms — check service or family eligibility',audience:'People unsure about Reserve service, a former-partner relationship or a bereaved-family pathway',area:'Australia-wide · phone',
    offer:'Ask the team to check the eligibility pathway for your circumstances.',cost:'Free eligibility advice. Counselling is available to eligible people.',access:'Other support shown on this page remains available while you check.',hours:'24 hours, every day',phone:'1800 011 046',url:'https://www.openarms.gov.au/who-we-help/eligibility',sources:['https://www.openarms.gov.au/who-we-help/eligibility','https://www.openarms.gov.au/sites/default/files/2025-11/Open%20Arms%20Eligibility%20Matrix%202025.pdf']
  }),
  'defence-medical-enquiry': service({
    name:'Defence medical-travel enquiries', audience:'Serving ADF members and families asking about medical-travel conditions', area:'Australia-wide · phone',
    offer:'Ask which medical-travel rules apply to the patient, and how to arrange approval before booking.',cost:'Free information. Travel assistance depends on the applicable conditions.',
    access:'Call 1800 DEFENCE about pay and conditions. A member’s own travel and travel for a resident family member use different rules.',phone:'1800 333 362',
    url:'https://pay-conditions.defence.gov.au/pacman/chapter-5/part-3',sources:['https://pay-conditions.defence.gov.au/pacman/chapter-5/part-3','https://pay-conditions.defence.gov.au/form/contact-us']
  }),
  ...expandedServices,
  'legal-national': service({
    name: 'Find legal aid in your state or territory', audience: 'People looking for legal help in Australia', area: 'Australia-wide · official contact directory',
    offer: 'Find the appropriate legal aid service for your location and legal problem.', cost: 'Free directory. Advice and representation eligibility vary by service.',
    access: 'Choose your state or territory, then contact its legal aid service. National Legal Aid itself does not give legal advice.',
    url: 'https://nationallegalaid.org.au/find-legal-help', action: 'Find your legal aid service'
  }),
  'dmfs-helpline': service({
    name: 'Defence Member and Family Helpline',
    audience: 'Serving ADF members, reservists and their families',
    area: 'Australia-wide · phone',
    offer: 'Talk through a posting, time apart, family difficulty or several needs together. Ask for the local team or a specific support programme.',
    cost: 'Free support and guidance.',
    access: 'Family members can contact the helpline themselves.',
    hours: '24 hours, every day', phone: '1800 624 608',
    url: 'https://www.defence.gov.au/adf-members-families/crisis-support/helplines/defence-member-family-helpline',
    extraUrl: 'mailto:memberandfamilyhelpline@defence.gov.au', extraLabel: 'Email the helpline',
    sources: ['https://www.defence.gov.au/adf-members-families/crisis-support/helplines/defence-member-family-helpline', 'https://www.defence.gov.au/adf-members-families/benefits-conditions-service/wellbeing-family/reserves']
  }),
  'dmfs-darwin': service({
    name: 'DMFS Darwin Area Office',
    audience: 'Serving ADF members and their families',
    area: 'Darwin / Palmerston · also supports Alice Springs',
    offer: 'Ask for local family support, help settling in or suitable community activities.',
    cost: 'Free information and support.',
    access: '3 Tybell Street, Winnellie. Call before visiting. Regular Defence events have eligibility requirements; ask which activities fit your family.',
    hours: 'Mon–Fri 8:30am–5pm NT; building closes 4:30pm', phone: '08 8935 7900',
    url: 'https://www.defence.gov.au/adf-members-families/family-programs-local-services/area-offices/darwin-area-office'
  }),
  'dmfs-tindal': service({
    name: 'DMFS Tindal Area Office',
    audience: 'Serving ADF members and their families',
    area: 'Katherine / Tindal / Delamere',
    offer: 'Ask for local family support, help with a posting or suitable community activities.',
    cost: 'Free information and support.',
    access: 'Arrange an appointment and base access before visiting RAAF Base Tindal. Ask about eligibility for activities.',
    hours: 'Mon–Thu 7am–4pm; Fri 7am–2pm NT', phone: '08 8973 7134',
    url: 'https://www.defence.gov.au/adf-members-families/family-programs-local-services/area-offices/tindal-area-office'
  }),
  'open-arms': service({
    name: 'Open Arms',
    audience: 'People with full-time ADF service, their partners and children, including adult children',
    area: 'Australia-wide · phone and appointments',
    offer: 'Military-aware support with stress, relationships and family life. Call to discuss individual, couple or family counselling.',
    cost: 'Free, confidential support.',
    access: 'Contact directly. Other reservists, former partners and bereaved relatives have specific eligibility pathways.',
    hours: '24 hours, every day', phone: '1800 011 046',
    url: 'https://www.openarms.gov.au/who-we-help/eligibility',
    extraUrl: 'https://www.openarms.gov.au/who-we-help/eligibility', extraLabel: 'Check other eligibility pathways',
    sources: ['https://www.openarms.gov.au/who-we-help/eligibility', 'https://www.openarms.gov.au/sites/default/files/2025-11/Open%20Arms%20Eligibility%20Matrix%202025.pdf', 'https://www.openarms.gov.au/who-we-help/family']
  }),
  'darwin-mmhc': service({
    name: 'Darwin Medicare Mental Health Centre',
    audience: 'Adults aged 18 or older',
    area: 'Casuarina · Darwin and surrounding areas',
    offer: 'Talk with a mental health worker, work out what support you need and plan the next step.',
    cost: 'Free support at the centre.',
    access: 'Walk in at 16 Scaturchio Street, Casuarina. No appointment, GP referral or mental health plan needed.',
    hours: 'Mon–Wed/Fri 9am–9pm; Thu 1–9pm; weekends/public holidays noon–8pm NT', phone: '08 8914 6600',
    url: 'https://www.neaminational.org.au/services/darwin-medicare-mental-health-centre/',
    sources: ['https://www.neaminational.org.au/services/darwin-medicare-mental-health-centre/', 'https://www.medicarementalhealth.gov.au/service/darwin-medicare-mental-health-centre-15867']
  }),
  'katherine-mmhc': service({
    name: 'Katherine Medicare Mental Health Centre',
    audience: 'Adults aged 18 or older',
    area: 'Katherine / Tindal',
    offer: 'Free mental health support through the Strongbala Minds Walk-In Talk-In Space.',
    cost: 'Free support at the centre.',
    access: 'No appointment or referral needed. Call for directions to the Woolworths Building, corner Lindsay and First Streets.',
    hours: 'Mon–Fri 8am–4:30pm NT', phone: '08 7936 8611',
    url: 'https://www.medicarementalhealth.gov.au/service/katherine-medicare-mental-health-centre-18046',
    sources: ['https://www.medicarementalhealth.gov.au/service/katherine-medicare-mental-health-centre-18046', 'https://www.medicarementalhealth.gov.au/provider/head-to-health-16167', 'https://nt.gov.au/wellbeing/mental-health/hospital-mental-health-services']
  }),
  'teamtalk': service({
    name: 'TeamTALK',
    audience: 'NT residents experiencing mild distress or isolation',
    area: 'NT-wide · phone',
    offer: 'Talk with a local mental health worker about everyday difficulties or finding support. Scheduled calls are available.',
    cost: 'Free support.',
    access: 'You can contact the service yourself. For acute distress, use the urgent support contacts below.',
    hours: 'Weekdays 9am–8pm; weekends noon–8pm NT', phone: '1800 832 600',
    url: 'https://www.teamhealth.asn.au/services/teamtalk'
  }),
  'beyondblue': service({
    name: 'Beyond Blue',
    audience: 'Anyone in Australia seeking mental health support',
    area: 'Australia-wide · phone or online chat',
    offer: 'Speak with a counsellor about how you are feeling and what further support might help.',
    cost: 'Free, confidential brief counselling; local call charges may apply.',
    access: 'Call directly or use online chat.',
    hours: '24 hours, every day', phone: '1300 22 4636',
    url: 'https://www.beyondblue.org.au/get-support/talk-to-a-counsellor',
    extraUrl: 'https://www.beyondblue.org.au/get-support/talk-to-a-counsellor', extraLabel: 'Chat with a counsellor',
    sources: ['https://www.beyondblue.org.au/get-support', 'https://www.beyondblue.org.au/get-support/talk-to-a-counsellor']
  }),
  'headspace-darwin': service({
    name: 'headspace Darwin', audience: 'Young people aged 12–25', area: 'Darwin',
    offer: 'Ask for support with feelings, relationships, study or other things affecting wellbeing.',
    cost: 'Free support options; some services have fees or Medicare requirements. Ask before booking.',
    access: 'The young person or a parent/carer can call. Ask about phone or video appointments if travel is difficult.',
    hours: 'Mon/Fri 9am–5pm; Tue–Thu 9am–7pm NT', phone: '08 8931 5999',
    url: 'https://headspace.org.au/headspace-centres/darwin/'
  }),
  'headspace-palmerston': service({
    name: 'headspace Palmerston', audience: 'Young people aged 12–25', area: 'Palmerston and rural Top End',
    offer: 'Ask for support with feelings, relationships, study or other things affecting wellbeing.',
    cost: 'Free support options; some services have fees or Medicare requirements. Ask before booking.',
    access: 'The young person or a parent/carer can call. Phone or video appointments may help if travel is difficult.',
    hours: 'Mon/Tue/Thu/Fri 9am–5pm; Wed 10:30am–7pm NT', phone: '08 8931 5900',
    url: 'https://headspace.org.au/headspace-centres/palmerston/'
  }),
  'headspace-katherine': service({
    name: 'headspace Katherine', audience: 'Young people aged 12–25', area: 'Katherine and Big Rivers',
    offer: 'Ask for support with feelings, relationships or wellbeing. Telehealth is available for surrounding communities.',
    cost: 'Free support options; ask about any fees or Medicare requirements.',
    access: 'Temporarily at Anglicare NT, 15 Third Street after flood damage. Call to confirm before travelling.',
    hours: 'Mon/Wed/Thu/Fri 9am–5pm; Tue 10:30am–7pm NT', phone: '08 8912 4000',
    url: 'https://headspace.org.au/headspace-centres/katherine/'
  }),
  'headspace-alice': service({
    name: 'headspace Alice Springs', audience: 'Young people aged 12–25', area: 'Alice Springs',
    offer: 'Ask for help with mental health, physical health, alcohol or drugs, work or study.',
    cost: 'Free services. You can get support without a Medicare card.',
    access: 'The young person or a parent/carer can call. Centre: 5/74 Todd Street.',
    hours: 'Mon/Wed/Fri 8:30am–5pm; Tue/Thu 8:30am–6:30pm NT', phone: '08 8958 4544',
    url: 'https://headspace.org.au/headspace-centres/alice-springs/'
  }),
  'eheadspace': service({
    name: 'eheadspace',
    audience: 'Young people aged 12–25, and family or friends supporting them',
    area: 'Australia-wide · phone or online',
    offer: 'Talk through a young person’s mental health or wellbeing with a worker.',
    cost: 'Free support; request a callback if mobile call costs apply.',
    access: 'No referral needed. Online chat requires an account.',
    hours: 'Daily 3pm–10pm, your local time', phone: '1800 650 890',
    url: 'https://headspace.org.au/online-and-phone-support/connect-with-us/',
    sources: ['https://headspace.org.au/online-and-phone-support/connect-with-us/', 'https://headspace.org.au/emergency-assistance/', 'https://headspace.org.au/online-and-phone-support/connect-with-us/faqs/']
  }),
  'kids-helpline': service({
    name: 'Kids Helpline', audience: 'Children and young people aged 5–25', area: 'Australia-wide · phone or webchat',
    offer: 'A counsellor can listen to worries about home, friends, school or how you are feeling.',
    cost: 'Free, including calls from mobiles.',
    access: 'This is the young person’s counselling service. A parent/carer can help them make contact.',
    hours: '24 hours, every day', phone: '1800 55 1800',
    url: 'https://www.kidshelpline.com.au/get-help',
    extraUrl: 'https://www.kidshelpline.com.au/get-help', extraLabel: 'Use webchat',
    sources: ['https://www.kidshelpline.com.au/about/about-khl', 'https://www.kidshelpline.com.au/get-help']
  }),
  'parentline': service({
    name: 'Parentline', audience: 'Parents and carers in the NT or Queensland', area: 'NT / Queensland · phone or chat',
    offer: 'Talk with a counsellor about parenting, child behaviour, relationships or stress at home.',
    cost: 'Free counselling.',
    access: 'You can call about a baby, child or teenager. The support is for you as their parent or carer.',
    hours: 'Daily; check the provider’s current phone/chat hours', phone: '1300 30 1300',
    url: 'https://parentline.com.au/about',
    extraUrl: 'https://parentline.com.au/faq/how-can-i-contact-parentline', extraLabel: 'Phone and chat availability'
  }),
  'territory-faces': service({
    name: 'Territory FACES', audience: 'NT parents, carers and people supporting a family', area: 'NT-wide · phone',
    offer: 'Talk with a worker about what your family needs and ask for a referral to a suitable local service.',
    cost: 'Free information and referral.',
    access: 'Call directly about parenting, home life or family support.',
    hours: 'Mon–Fri 8am–4:21pm NT', phone: '1800 999 900',
    url: 'https://families.nt.gov.au/family-youth-support/territory-faces'
  }),
  'family-advice': service({
    name: 'Family Relationship Advice Line', audience: 'Anyone affected by family relationships or separation', area: 'Australia-wide · phone',
    offer: 'Work out options for relationship support, separation and parenting arrangements, including referrals to local services.',
    cost: 'Free information and advice; referred services may charge.',
    access: 'Call directly. You do not have to provide your full name.',
    hours: 'Mon–Fri 8am–8pm; Sat 10am–4pm local time. Closed national public holidays.', phone: '1800 050 321',
    url: 'https://www.familyrelationships.gov.au/talk-someone/advice-line'
  }),
  'school-change': service({
    name: 'Defence Education Liaison Officers', audience: 'Serving ADF families with school-aged children', area: 'Australia-wide · local education advice',
    offer: 'Ask for an Education Liaison Officer to help compare schools, understand NT schooling and support a child’s move.',
    cost: 'Free education advice.',
    access: 'Call the Defence Member and Family Helpline and ask for education support.',
    hours: 'Helpline available 24 hours, every day', phone: '1800 624 608',
    url: 'https://www.defence.gov.au/adf-members-families/family-programs-local-services/support-children/changing-schools'
  }),
  'nt-school': service({
    name: 'NT government school enrolment', audience: 'Families enrolling a child in an NT government school', area: 'NT-wide · online and through the school',
    offer: 'Find the official enrolment steps and documents you need.',
    cost: 'Free enrolment guidance.',
    access: 'If your child previously attended an NT school, contact the new school first. School catchment priorities apply.',
    hours: 'Online information available anytime',
    url: 'https://service.nt.gov.au/services/education-training/enrol-child-school', action: 'Check enrolment steps'
  }),
  'childcare-connect': service({
    name: 'Childcare Connect', audience: 'Defence families having difficulty finding childcare', area: 'Australia-wide · help with local care options',
    offer: 'Ask for help finding childcare that fits your location and care needs after a move.',
    cost: 'Free help finding care. Childcare itself has fees.',
    access: 'Call the Defence Member and Family Helpline and ask for Childcare Connect. Availability is not guaranteed.',
    hours: 'Helpline available 24 hours, every day', phone: '1800 624 608',
    url: 'https://www.defence.gov.au/adf-members-families/family-programs-local-services/support-children/childcare'
  }),
  'startingblocks': service({
    name: 'StartingBlocks childcare finder', audience: 'Families looking for childcare', area: 'Australia-wide · online',
    offer: 'Compare nearby childcare services, quality ratings and published fees.',
    cost: 'Free search tool. Childcare itself has fees.',
    access: 'Search by location, then contact a provider to confirm places, hours and costs.',
    hours: 'Online tool available anytime', url: 'https://startingblocks.gov.au/find-child-care', action: 'Find local childcare'
  }),
  'soldieron-work': service({
    name: 'Soldier On — career support', audience: 'Serving and former Defence personnel and their families', area: 'Australia-wide · phone and online',
    offer: 'Get help with career direction, a CV, interviews, work opportunities or education pathways.',
    cost: 'Career support is free. External courses may have fees.',
    access: 'Call to discuss your needs or register as a participant.',
    hours: 'Contact for appointment times', phone: '1300 620 380',
    url: 'https://soldieron.org.au/supporting-you/employment/',
    extraUrl: 'https://soldieron.org.au/supporting-you/registration-form/', extraLabel: 'Register for support',
    sources: ['https://soldieron.org.au/about-us/our-services/', 'https://soldieron.org.au/supporting-you/employment/']
  }),
  'soldieron-connect': service({
    name: 'Soldier On — connection and family support', audience: 'Serving and former Defence personnel and their families', area: 'Australia-wide · phone and online options',
    offer: 'Ask about free social activities or a social-work appointment to find support that fits your family.',
    cost: 'Free support and activities.',
    access: 'Call or register. Ask what is currently available near you or online.',
    hours: 'Contact for current activity and appointment times', phone: '1300 620 380',
    url: 'https://soldieron.org.au/about-us/our-services/',
    extraUrl: 'https://soldieron.org.au/supporting-you/registration-form/', extraLabel: 'Register or request social-work support'
  }),
  'transition': service({
    name: 'NT Defence Transition Centre', audience: 'Serving members and reservists preparing to leave or change service category', area: 'NT · phone and arranged appointments',
    offer: 'Plan work, health and family life with a transition coach. Family/support people can join sessions.',
    cost: 'Free transition support; individual programme eligibility applies.',
    access: 'Call before visiting Robertson Barracks. Support can continue for up to 24 months after transition.',
    hours: 'Contact for appointment times', phone: '08 7971 6840',
    url: 'https://www.defence.gov.au/adf-members-families/military-life-cycle/transition/transition-centre-contacts',
    extraUrl: 'mailto:transition.nt@defence.gov.au', extraLabel: 'Email the NT transition team',
    sources: ['https://www.defence.gov.au/adf-members-families/military-life-cycle/transition/transition-centre-contacts', 'https://www.defence.gov.au/adf-members-families/transition/coaching-and-support/transition-from-reserves', 'https://www.defence.gov.au/news-events/news/2024-05-29/transitioning-has-never-been-easier']
  }),
  'dva': service({
    name: 'Department of Veterans’ Affairs', audience: 'Serving/ex-serving members and families asking about DVA support', area: 'Australia-wide · phone and online',
    offer: 'Ask about a claim, benefit, eligibility or help using MyService.',
    cost: 'Free information and help accessing DVA services.',
    access: 'You can call before making a claim. Eligibility for each payment or treatment is assessed separately.',
    hours: 'Mon–Fri 8am–5pm, your local time', phone: '1800 838 372',
    url: 'https://www.dva.gov.au/about-us/contact-us'
  }),
  'transition-national': service({
    name: 'Defence Transition Centres', audience: 'Serving members and reservists preparing to leave or change service category', area: 'Australia-wide · contact your nearest centre',
    offer: 'Arrange transition coaching to plan work, health and family life. Family/support people can join sessions.',
    cost: 'Free transition support; individual programme eligibility applies.',
    access: 'Choose your nearest centre from the official contact list. Support can continue for up to 24 months after transition.',
    hours: 'Contact the centre for appointment times',
    url: 'https://www.defence.gov.au/adf-members-families/military-life-cycle/transition/transition-centre-contacts', action: 'Find your transition team',
    sources: ['https://www.defence.gov.au/adf-members-families/military-life-cycle/transition/transition-centre-contacts', 'https://www.defence.gov.au/adf-members-families/transition/coaching-and-support/transition-from-reserves', 'https://www.defence.gov.au/news-events/news/2024-05-29/transitioning-has-never-been-easier']
  }),
  'wellbeing-agency': service({
    name: 'Veteran and Family Wellbeing Agency', audience: 'Veterans and family members, including people who are not DVA clients', area: 'Australia-wide · phone or callback',
    offer: 'A worker can help you work out what you need, find suitable local services and take the next step.',
    cost: 'Free navigation and information.',
    access: 'Call directly or request a callback. Specific services may have their own eligibility and costs.',
    hours: 'Mon–Fri 8:30am–5pm, your local time', phone: '1800 823 922',
    url: 'https://www.veteranwellbeing.gov.au/contact',
    extraUrl: 'https://www.veteranwellbeing.gov.au/referral', extraLabel: 'Request a callback',
    sources: ['https://www.veteranwellbeing.gov.au/whatwedo', 'https://www.veteranwellbeing.gov.au/contact', 'https://www.dva.gov.au/about-us/what-we-do/australias-veteran-support-system-at-a-glance']
  }),
  'ndh': service({
    name: 'National Debt Helpline', audience: 'People worried about debt, bills or repayments', area: 'Australia-wide · phone and online chat',
    offer: 'Speak with a financial counsellor about your options, dealing with creditors and getting further help.',
    cost: 'Free, independent financial counselling.',
    access: 'Call directly. This is advice and support, not an emergency cash payment.',
    hours: 'Weekdays; see the provider for phone/chat hours', phone: '1800 007 007',
    url: 'https://ndh.org.au/about-national-debt-helpline/contact-us/',
    sources: ['https://ndh.org.au/about-national-debt-helpline/contact-us/', 'https://ndh.org.au/financial-counselling/']
  }),
  'catholiccare': service({
    name: 'CatholicCare NT — money and essentials', audience: 'People needing financial counselling or help with essentials', area: 'Darwin',
    offer: 'Ask for financial counselling or emergency relief in your area.',
    cost: 'Free support. Relief is assessed and depends on available resources.',
    access: 'Call to explain what you need. You can refer yourself.',
    hours: 'Call to arrange an appointment', phone: '08 8944 2000',
    url: 'https://www.catholiccarent.org.au/our-service/financial-wellbeing-and-capability/'
  }),
  'catholiccare-palmerston': service({
    name: 'CatholicCare NT — Palmerston', audience: 'People needing financial counselling or help with essentials', area: 'Palmerston',
    offer: 'Ask for financial counselling or emergency relief in your area.',
    cost: 'Free support. Relief is assessed and depends on available resources.',
    access: 'Call to explain what you need. You can refer yourself.',
    hours: 'Call to arrange an appointment', phone: '08 8932 9977',
    url: 'https://www.catholiccarent.org.au/our-service/financial-wellbeing-and-capability/'
  }),
  'catholiccare-katherine': service({
    name: 'CatholicCare NT — Katherine', audience: 'People needing financial counselling or help with essentials', area: 'Katherine / Tindal',
    offer: 'Ask for financial counselling or emergency relief in your area.',
    cost: 'Free support. Relief is assessed and depends on available resources.',
    access: 'Call to explain what you need. You can refer yourself.',
    hours: 'Call to arrange an appointment', phone: '08 8971 0777',
    url: 'https://www.catholiccarent.org.au/our-service/financial-wellbeing-and-capability/'
  }),
  'catholiccare-tennant': service({
    name: 'CatholicCare NT — Tennant Creek', audience: 'People needing financial counselling or help with essentials', area: 'Tennant Creek / Barkly',
    offer: 'Ask for financial counselling or emergency relief in your area.',
    cost: 'Free support. Relief is assessed and depends on available resources.',
    access: 'Call to explain what you need and confirm support for your community. You can refer yourself.',
    hours: 'Call to arrange an appointment', phone: '08 8962 3065',
    url: 'https://www.catholiccarent.org.au/our-service/financial-wellbeing-and-capability/'
  }),
  'askizzy-food': service({
    name: 'Ask Izzy — food near you', audience: 'People needing meals, groceries or food vouchers', area: 'Australia-wide · online directory',
    offer: 'Find food-relief providers near your town or community.',
    cost: 'Free search. Listed providers may offer free or low-cost food.',
    access: 'Enter your location, choose the help you need, then contact the provider to check opening hours and eligibility.',
    hours: 'Online directory available anytime',
    url: 'https://askizzy.org.au/food', action: 'Find food support nearby',
    sources: ['https://askizzy.org.au/food', 'https://askizzy.org.au/', 'https://about.askizzy.org.au/wp-content/uploads/2024/02/211006-About-Ask-Izzy-2021_FINAL-1-10.pdf']
  }),
  'askizzy-housing': service({
    name: 'Ask Izzy — housing support', audience: 'People needing accommodation or housing help', area: 'Australia-wide · online directory',
    offer: 'Find housing and homelessness services for your current location.',
    cost: 'Free directory. Accommodation may have fees.',
    access: 'Enter your location and contact a suitable provider. Tell them if you need help tonight; the directory does not book or guarantee a bed.',
    hours: 'Online directory available anytime',
    url: 'https://askizzy.org.au/housing', action: 'Find housing contacts near you',
    sources: ['https://askizzy.org.au/housing', 'https://askizzy.org.au/', 'https://about.askizzy.org.au/wp-content/uploads/2024/02/211006-About-Ask-Izzy-2021_FINAL-1-10.pdf']
  }),
  'lc-alice': service({
    name: 'Lutheran Care — Alice Springs', audience: 'People experiencing financial difficulty', area: 'Alice Springs and surrounding Central Australian communities',
    offer: 'Ask for financial counselling or help with food and essentials.',
    cost: 'Free support; emergency relief is assessed.',
    access: 'Call for an appointment. Gregory Terrace office is closed. Food vouchers: Foodbank, 1/30 Stuart Highway, Mon/Fri 10am–2pm.',
    hours: 'Call for current appointments', phone: '08 8953 5160',
    url: 'https://www.lutherancare.org.au/nt-financial-wellbeing/',
    sources: ['https://www.lutherancare.org.au/nt-financial-wellbeing/', 'https://www.lutherancare.org.au/contact-us/']
  }),
  'salvos-katherine': service({
    name: 'Katherine Doorways Hub', audience: 'People experiencing or at risk of homelessness', area: 'Katherine · 22 Katherine Terrace',
    offer: 'Ask about food, showers, laundry and practical help connecting with other services.',
    cost: 'Free day support; available assistance is assessed.',
    access: 'Call or visit during opening hours. This is a day centre, not overnight accommodation.',
    hours: 'Mon/Tue/Thu/Fri 8:30am–2pm NT; closed Wednesday', phone: '08 8971 2265',
    url: 'https://www.salvationarmy.org.au/northernterritory/community-centres/'
  }),
  'salvos-alice': service({
    name: 'Alice Springs Waterhole / Doorways', audience: 'People needing essentials or help finding accommodation', area: 'Alice Springs · 88 Hartley Street',
    offer: 'Ask for help with food, essentials and finding emergency accommodation.',
    cost: 'Free support and assessed emergency relief.',
    access: 'Call to explain what you need. Accommodation and relief depend on availability.',
    hours: 'Emergency relief: Mon/Thu/Fri 9am–noon NT', phone: '08 8951 0200',
    url: 'https://www.salvationarmy.org.au/alice-springs/get-help/'
  }),
  'housing-intake': service({
    name: 'NT Central Intake — housing support', audience: 'People homeless or at risk of homelessness', area: 'NT-wide · online enquiry',
    offer: 'Request an assessment and connection to housing and homelessness services.',
    cost: 'Free intake and referral.',
    access: 'The provider currently reports its phone line is down. Use the enquiry form. This does not reserve a bed or guarantee an immediate response.',
    hours: 'Staffed weekdays 8am–4pm NT',
    url: 'https://www.lutherancare.org.au/nt-homelessness/', action: 'Request housing support',
    sources: ['https://www.lutherancare.org.au/nt-homelessness/', 'https://families.nt.gov.au/homelessness/darwin-homelessness-services']
  }),
  'tenancy-nt': service({
    name: 'Tenants’ Advice Service', audience: 'NT renters, boarders and lodgers', area: 'NT-wide · phone and appointments',
    offer: 'Ask about rent, bonds, repairs, eviction or ending a tenancy.',
    cost: 'Free tenancy advice and advocacy.',
    access: 'Call to arrange advice. Covers private/public housing, caravan parks and town camps; not landlord advice.',
    hours: 'Mon–Fri 9am–4pm NT', phone: '1800 812 953',
    url: 'https://www.dcls.org.au/tenants-advice',
    sources: ['https://www.dcls.org.au/tenants-advice', 'https://www.dcls.org.au/contact']
  }),
  'shelterme': service({
    name: 'ShelterMe — NT accommodation contacts', audience: 'People homeless or at risk of homelessness', area: 'NT-wide · online directory',
    offer: 'Find contacts for crisis, short-term and supported accommodation in your region.',
    cost: 'Free directory. Accommodation fees and eligibility vary.',
    access: 'Select your region and call the provider to check suitability, costs and vacancies. Listings do not guarantee a bed.',
    hours: 'Online directory available anytime',
    url: 'https://shelterme.org.au/', action: 'Find accommodation contacts',
    sources: ['https://shelterme.org.au/', 'https://nt.gov.au/emergency/emergencies/emergency-accommodation', 'https://nt.gov.au/property/social-housing/apply-for-housing/apply-for-priority-housing']
  }),
  'legal-aid': service({
    name: 'Legal Aid NT Helpline', audience: 'Anyone needing information about an NT legal problem', area: 'NT-wide · phone',
    offer: 'Get legal information and help arranging a free legal-advice appointment.',
    cost: 'Free confidential helpline and initial advice. Court representation has separate eligibility.',
    access: 'Call directly about separation, parenting arrangements or another legal concern.',
    hours: 'Mon–Fri 8am–4:30pm NT', phone: '1800 019 343',
    url: 'https://www.legalaid.nt.gov.au/need-help/helpline/'
  }),
  'aged-care': service({
    name: 'My Aged Care',
    audience: 'People with care needs aged 65+, or 50+ if Aboriginal/Torres Strait Islander or homeless/at risk of homelessness',
    area: 'Australia-wide · phone',
    offer: 'Ask about care at home, residential care and arranging an eligibility assessment.',
    cost: 'Free advice and assessment; ongoing care may involve fees.',
    access: 'Call directly. Family/support people can help make contact.',
    hours: 'Mon–Fri 8am–8pm; Sat 10am–2pm local time. Closed national public holidays.',
    phone: '1800 200 422', url: 'https://www.myagedcare.gov.au/how-to-contact-my-aged-care',
    sources: ['https://www.myagedcare.gov.au/how-to-contact-my-aged-care', 'https://www.myagedcare.gov.au/should-i-apply', 'https://www.myagedcare.gov.au/how-get-assessed', 'https://www.myagedcare.gov.au/aged-care-home-costs-and-fees', 'https://www.myagedcare.gov.au/news-and-updates/beware-scams-targeting-older-people']
  }),
  'reserve-support': service({
    name: 'ADF Reserves and Employer Support',
    audience: 'Reservists, self-employed reservists and their civilian employers',
    area: 'Australia-wide · phone and online enquiry',
    offer: 'Get information and help with civilian work, release for Reserve service and service protections.',
    cost: 'Free information and assistance.',
    access: 'Call 1800 DEFENCE and ask for Employer Support and Service Protection. Payment schemes have separate eligibility.',
    hours: 'Contact for current hours', phone: '1800 333 362',
    url: 'https://www.reserveemployersupport.gov.au/contact-us/',
    extraUrl: 'https://www.reserveemployersupport.gov.au/contact-us/', extraLabel: 'Send a service enquiry',
    sources: ['https://www.reserveemployersupport.gov.au/contact-us/', 'https://www.reserveemployersupport.gov.au/reservists/reserve-service-protection/', 'https://www.fairwork.gov.au/tools-and-resources/fact-sheets/rights-and-obligations/defence-reservists-rights-and-responsibilities-at-work']
  }),
  'healthdirect': service({
    name: 'healthdirect', audience: 'People of any age, or someone calling about their health', area: 'Australia-wide · phone',
    offer: 'Speak with a registered nurse about symptoms, what to do next and where to find appropriate care.',
    cost: 'Free health advice; mobile call charges may apply.',
    access: 'Call directly. Fees for any onward medical care depend on the provider.',
    hours: '24 hours, every day', phone: '1800 022 222',
    url: 'https://www.healthdirect.gov.au/how-healthdirect-can-help-you',
    sources: ['https://www.healthdirect.gov.au/how-healthdirect-can-help-you', 'https://about.healthdirect.gov.au/what-we-do/portfolio/healthdirect']
  }),
  'carer-gateway': service({
    name: 'Carer Gateway', audience: 'Unpaid carers of someone with disability, illness or age-related frailty', area: 'Australia-wide · local, phone and online support',
    offer: 'Ask about counselling, peer support, coaching or respite for you as a carer.',
    cost: 'Free carer support; respite and other packages are assessed.',
    access: 'Call and select option 1. This supports unpaid carers, not ordinary childcare or roster gaps.',
    hours: 'Mon–Fri 8am–5pm, your local time', phone: '1800 422 737',
    url: 'https://www.carergateway.gov.au/about-us/access-carer-gateway-services',
    sources: ['https://www.carergateway.gov.au/about-us/access-carer-gateway-services', 'https://www.carergateway.gov.au/about-us/eligibility-checker', 'https://www.carergateway.gov.au/sites/default/files/documents/2024-08/1321-carer-gateway-mainstream.pdf']
  }),
  'respect': service({
    name: '1800RESPECT', audience: 'Anyone experiencing violence or sexual assault, or worried about someone', area: 'Australia-wide · phone and online chat',
    offer: 'Talk about safety, support options and specialist services near you.',
    cost: 'Free counselling, information and referrals.',
    access: 'Call or chat from a device that is safe for you to use. Support is available to all genders.',
    hours: '24 hours, every day', phone: '1800 737 732',
    url: 'https://www.1800respect.org.au/FAQ',
    extraUrl: 'https://www.1800respect.org.au/', extraLabel: 'Use online chat'
  }),
  'sarc-darwin': service({
    name: 'Darwin Sexual Assault Referral Centre', audience: 'Adults, children and non-offending family/support people', area: 'Darwin / Top End',
    offer: 'Medical help after a recent assault; counselling and information.',
    cost: 'Free support.', access: 'Call directly to discuss care and support.',
    hours: '24-hour help for recent sexual assault', phone: '08 8922 6472',
    url: 'https://nt.gov.au/wellbeing/hospitals-health-services/sexual-assault-referral-centres',
    sources: ['https://nt.gov.au/wellbeing/hospitals-health-services/sexual-assault-referral-centres', 'https://digitallibrary.health.nt.gov.au/nthealthserver/api/core/bitstreams/9f7647dd-f7af-445d-aec4-d6cfb0b1adba/content']
  }),
  'sarc-alice': service({
    name: 'Alice Springs Sexual Assault Referral Centre', audience: 'Adults, children and non-offending family/support people', area: 'Alice Springs / Central Australia',
    offer: 'Medical help after a recent assault; counselling and information.',
    cost: 'Free support.', access: 'Call directly to discuss care and support.',
    hours: '24-hour help for recent sexual assault', phone: '08 8955 4500',
    url: 'https://nt.gov.au/wellbeing/hospitals-health-services/sexual-assault-referral-centres',
    sources: ['https://nt.gov.au/wellbeing/hospitals-health-services/sexual-assault-referral-centres', 'https://digitallibrary.health.nt.gov.au/nthealthserver/api/core/bitstreams/9f7647dd-f7af-445d-aec4-d6cfb0b1adba/content']
  }),
  'sarc-katherine': service({
    name: 'Katherine Sexual Assault Referral Centre', audience: 'Adults, children and non-offending family/support people', area: 'Katherine',
    offer: 'Counselling and information after sexual assault, including past experiences.',
    cost: 'Free support.', access: 'Call to discuss an appointment and medical-care options.',
    hours: 'Contact for current hours', phone: '08 8973 8524',
    url: 'https://nt.gov.au/wellbeing/hospitals-health-services/sexual-assault-referral-centres',
    sources: ['https://nt.gov.au/wellbeing/hospitals-health-services/sexual-assault-referral-centres', 'https://digitallibrary.health.nt.gov.au/nthealthserver/api/core/bitstreams/9f7647dd-f7af-445d-aec4-d6cfb0b1adba/content']
  }),
  'sarc-tennant': service({
    name: 'Tennant Creek Sexual Assault Referral Centre', audience: 'Adults, children and non-offending family/support people', area: 'Tennant Creek',
    offer: 'Counselling and information after sexual assault, including past experiences.',
    cost: 'Free support.', access: 'Call to discuss an appointment and medical-care options.',
    hours: 'Contact for current hours', phone: '08 8962 4361',
    url: 'https://nt.gov.au/wellbeing/hospitals-health-services/sexual-assault-referral-centres',
    sources: ['https://nt.gov.au/wellbeing/hospitals-health-services/sexual-assault-referral-centres', 'https://digitallibrary.health.nt.gov.au/nthealthserver/api/core/bitstreams/9f7647dd-f7af-445d-aec4-d6cfb0b1adba/content']
  }),
  'disability-nt': service({
    name: 'DCLS Disability Rights Service', audience: 'People with disability seeking help with rights or access to services', area: 'NT · phone intake',
    offer: 'Ask about advocacy for service access, NDIS difficulties or barriers at school and in the community.',
    cost: 'Free independent advocacy for eligible clients.',
    access: 'Call to discuss your situation and confirm coverage. This is advocacy, not medical assessment or respite care.',
    hours: 'Mon–Fri 9am–4pm NT', phone: '1800 812 953',
    url: 'https://www.dcls.org.au/disability-rights-service',
    sources: ['https://www.dcls.org.au/disability-rights-service', 'https://www.dcls.org.au/contact']
  }),
  'griefline': service({
    name: 'Griefline / SANE — grief support information', audience: 'Adults looking for support after a loss', area: 'Australia-wide · phone',
    offer: 'Ask the SANE Service Enquiries team about grief support and how to access it.',
    cost: 'Free grief support information.',
    access: 'Ask about available grief-support appointments and referral options.',
    hours: 'Mon–Fri 10am–8pm Melbourne time', phone: '1300 845 745',
    url: 'https://griefline.org.au/get-help/nationwide-telephone-support/'
  }),
  'standby': service({
    name: 'StandBy Support After Suicide', audience: 'Anyone bereaved or affected by a death by suicide', area: 'Australia-wide · phone and local support',
    offer: 'Get emotional and practical support, including help connecting with local services after a suicide.',
    cost: 'Free support.',
    access: 'Individuals, families, friends and witnesses can call. Ask about support available in your area.',
    hours: 'Every day, 6am–10pm; confirm local availability', phone: '1300 727 247',
    url: 'https://standbysupport.com.au/find-support/nt/',
    sources: ['https://standbysupport.com.au/find-support/nt/', 'https://standbysupport.com.au/']
  })
};
