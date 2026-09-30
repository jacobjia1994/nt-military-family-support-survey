// Distinct national offers checked against current provider sources on 27 September 2026.
// Funding, treatment and care are subject to the programme conditions stated on each card.
const service = data => ({ ...data, checked: '2026-09-27' });

export const nationalReviewedServices = {
  'adf-healthcare': service({
    name: 'ADF healthcare — your on-base health centre',
    audience: 'Serving ADF members with Defence healthcare entitlement',
    area: 'Australia-wide · on-base health centres',
    offer: 'Contact your usual health centre for medical care and advice about treatment, referrals and Defence health cover.',
    cost: 'Defence-funded care for entitled members. Check coverage before arranging private treatment.',
    access: 'Find your base in the official directory for its phone, email and opening hours. Ask the health centre which referral or approval is needed for treatment away from the base.',
    url: 'https://www.defence.gov.au/adf-members-families/health-wellbeing/garrison-health-centres',
    action: 'Find your on-base health centre',
    sources: [
      'https://www.defence.gov.au/adf-members-families/health-wellbeing/garrison-health-centres',
      'https://pay-conditions.defence.gov.au/adf-total-workforce-system'
    ]
  }),
  'adf-imsick': service({
    name: '1800 IMSICK — ADF medical advice',
    audience: 'ADF members in Australia with Defence healthcare entitlement',
    area: 'Australia-wide · phone',
    offer: 'Speak with a nurse when you are ill or injured after hours or away from an on-base health centre.',
    cost: 'Free helpline. Further care follows ADF healthcare and referral rules.',
    access: 'Have your PMKeyS number and location ready. For routine care, use your usual on-base health centre. This line cannot approve sick leave. In an emergency, call 000.',
    hours: '24 hours, every day',
    phone: '1800 467 425',
    url: 'https://www.defence.gov.au/adf-members-families/crisis-support/helplines/1800-imsick',
    sources: [
      'https://www.defence.gov.au/adf-members-families/crisis-support/helplines/1800-imsick',
      'https://pay-conditions.defence.gov.au/pacman/chapter-5/part-3'
    ]
  }),
  'adf-allhours': service({
    name: 'ADF All-hours Support Line',
    audience: 'Current ADF members and their families',
    area: 'Australia-wide · phone',
    offer: 'Get mental health advice and help accessing suitable ADF or civilian care.',
    cost: 'Free telephone advice and referral. Costs of onward civilian care vary.',
    access: 'An external provider answers the line. Ask about either ADF or civilian services and how a referral will work.',
    hours: '24 hours, every day',
    phone: '1800 628 036',
    url: 'https://www.defence.gov.au/adf-members-families/crisis-support/helplines/all-hours-support-line',
    sources: [
      'https://www.defence.gov.au/adf-members-families/crisis-support/helplines/all-hours-support-line',
      'https://www.defence.gov.au/about/reviews-inquiries/afghanistan-inquiry/welfare-support/current-serving-adf-personnel-families'
    ]
  }),
  'dva-mental-treatment': service({
    name: 'DVA — funded mental health treatment',
    audience: 'Current or former members with full-time ADF service, and reservists with qualifying service',
    area: 'Australia-wide · phone and online',
    offer: 'Ask about funded mental health treatment, including psychology, psychiatry and hospital care, without proving that service caused the condition.',
    cost: 'Approved treatment is funded when the provider accepts your Veteran Card. Medicine co-payments may apply.',
    access: 'Ask DVA to check your Non-Liability Health Care eligibility, or apply for Mental Health Treatment in MyService. Ordinary Reserve training days are not continuous full-time service; other Reserve pathways may apply. Confirm cover and provider acceptance before booking.',
    phone: '1800 838 372',
    url: 'https://www.dva.gov.au/access-benefits/veteran-card/veteran-card-specific-conditions',
    action: 'Check eligibility and how to apply',
    extraUrl: 'mailto:nlhc@dva.gov.au',
    extraLabel: 'Email the mental health treatment team',
    sources: [
      'https://www.dva.gov.au/providers/information-for-gps-other-primary-care-providers/mental-health-programs-overview/non-liability-mental-health-care',
      'https://www.dva.gov.au/access-benefits/veteran-card/veteran-card-specific-conditions',
      'https://www.dva.gov.au/about-myservice'
    ]
  }),
  'dva-treatment-travel': service({
    name: 'DVA — travel for treatment',
    audience: 'People travelling for treatment covered by their Veteran Card, and eligible attendants',
    area: 'Australia-wide · phone and online',
    offer: 'Check help with reasonable travel, accommodation and meal costs for covered medical treatment in Australia.',
    cost: 'Eligible expenses may be reimbursed. Amounts depend on the journey and treatment location.',
    access: 'Check the travel rules before booking and keep receipts. Claim through MyService or the DVA travel-expenses form. A family member or carer can help the person check their options.',
    phone: '1800 838 372',
    url: 'https://www.dva.gov.au/what-we-help-with/health-support/travel-for-treatment',
    action: 'Check travel cover and claims',
    extraUrl: 'https://www.dva.gov.au/about-myservice',
    extraLabel: 'Claim through MyService',
    sources: [
      'https://www.dva.gov.au/what-we-help-with/health-support/travel-for-treatment',
      'https://www.dva.gov.au/about-us/contact-us',
      'https://www.dva.gov.au/about-myservice'
    ]
  }),
  'dva-booked-car': service({
    name: 'DVA — booked transport to treatment',
    audience: 'Veteran Card holders who meet age or medical access criteria and need covered treatment',
    area: 'Australia-wide · pre-arranged transport',
    offer: 'Ask DVA to arrange a taxi or hire car for a medical appointment through Booked Car with Driver.',
    cost: 'No out-of-pocket transport cost when DVA approves and arranges the trip.',
    access: 'Call before travelling. A family member, friend or health provider can book on the person’s behalf. Arrange after-hours or weekend travel during office hours; a card alone does not establish eligibility.',
    phone: '1800 550 455',
    url: 'https://www.dva.gov.au/what-we-help-with/health-support/travel-for-treatment/booked-car-with-driver-bcwd-service',
    action: 'Check booked transport eligibility',
    extraUrl: 'https://www.dva.gov.au/about-myservice',
    extraLabel: 'Book through MyService',
    sources: [
      'https://www.dva.gov.au/what-we-help-with/health-support/travel-for-treatment/booked-car-with-driver-bcwd-service',
      'https://www.dva.gov.au/about-myservice'
    ]
  }),
  'dva-home-care': service({
    name: 'Veterans’ Home Care — help at home and respite',
    audience: 'Eligible Veteran Card holders living at home who need help with daily activities',
    area: 'Australia-wide · phone assessment',
    offer: 'Arrange an assessment for help with housework, personal care, home maintenance or a break for a carer.',
    cost: 'Respite has no co-payment. Other approved services usually have capped co-payments; hardship waivers may be available.',
    access: 'Call the assessment agency. Tell them about daily tasks that are difficult and any help you already receive. Services depend on assessed need; this programme does not provide complex clinical care.',
    phone: '1300 550 450',
    url: 'https://www.dva.gov.au/what-we-help-with/care-at-home-and-aged-care-services/living-independently/dva-in-home-programs/veterans-home-care-vhc',
    action: 'Read about home care and costs',
    sources: [
      'https://www.dva.gov.au/what-we-help-with/care-at-home-and-aged-care-services/living-independently/dva-in-home-programs/veterans-home-care-vhc'
    ]
  }),
  'dva-household-care': service({
    name: 'DVA — household and personal care after service injury',
    audience: 'Veterans needing help at home because of an accepted service-related condition',
    area: 'Australia-wide · phone and claims',
    offer: 'Ask about compensation for household tasks or essential personal care you can no longer manage because of a service-related condition.',
    cost: 'Free eligibility guidance. Care funding requires an assessed claim and has limits.',
    access: 'Ask which Household Services or Attendant Care claim applies. These programmes do not cover clinical nursing or duplicate the same help through Veterans’ Home Care.',
    phone: '1800 838 372',
    url: 'https://www.dva.gov.au/about-us/inquiries-and-reviews/veterans-legislation-reform/veterans-legislation-reform-resources/household-services-attendant-care-and-veterans-home-care',
    action: 'Check care claims and conditions',
    extraUrl: 'mailto:hhs@dva.gov.au',
    extraLabel: 'Email the household and attendant care team',
    sources: [
      'https://www.dva.gov.au/about-us/inquiries-and-reviews/veterans-legislation-reform/veterans-legislation-reform-resources/household-services-attendant-care-and-veterans-home-care',
      'https://www.dva.gov.au/about-us/contact-us'
    ]
  }),
  'bravery-financial-aid': service({
    name: 'Bravery Trust — help with urgent expenses',
    audience: 'Current or former members injured physically or mentally during service who face hardship, and their families',
    area: 'Australia-wide · phone and online',
    offer: 'Ask about financial assistance for essential costs such as rent, bills, food, fuel or unexpected expenses.',
    cost: 'Free application and assessment. Financial assistance depends on eligibility and circumstances.',
    access: 'Call, email or use the application on the official page. This aid has different eligibility from Bravery Trust’s broader financial counselling service.',
    phone: '1800 272 837',
    url: 'https://braverytrust.org.au/financial-assistance/',
    action: 'Apply for financial assistance',
    extraUrl: 'mailto:ask@braverytrust.org.au',
    extraLabel: 'Email Bravery Trust',
    sources: [
      'https://braverytrust.org.au/financial-assistance/',
      'https://braverytrust.org.au/faqs/'
    ]
  }),
  'payment-service-finder': service({
    name: 'Services Australia — find payments you may receive',
    audience: 'People checking income support, family payments or childcare assistance',
    area: 'Australia-wide · online',
    offer: 'Find and estimate payments that may help when income falls, work changes or family circumstances change.',
    cost: 'Free online tool. Payment eligibility depends on your circumstances.',
    access: 'Answer the Payment Finder questions to explore possible payments. Results are estimates; you still need to make a claim for assessment.',
    url: 'https://www.centrelink.gov.au/apps/clkonline_cof/payment-service-finder/payments-finder',
    action: 'Open the Payment Finder',
    extraUrl: 'https://www.servicesaustralia.gov.au/online-estimators?context=64107',
    extraLabel: 'About the official payment tool',
    sources: [
      'https://www.servicesaustralia.gov.au/online-estimators?context=64107',
      'https://www.servicesaustralia.gov.au/payments-you-can-claim-with-centrelink-online-account?context=22621'
    ]
  }),
  'dva-income-support': service({
    name: 'DVA — income support after illness or injury',
    audience: 'Members, veterans and families affected by reduced earning capacity or a mental health claim',
    area: 'Australia-wide · phone and online',
    offer: 'Ask about incapacity payments for lost earning capacity from a service-related condition, or support while a mental health claim is assessed.',
    cost: 'Free eligibility guidance. Payments require assessment and are not automatic.',
    access: 'Tell DVA about work capacity, income and the claim. Veteran Payment while a mental health claim is assessed has work-capacity, income and assets rules; qualifying partners may also receive it.',
    phone: '1800 838 372',
    url: 'https://www.dva.gov.au/access-benefits/claims-and-compensation-for-illness-or-injury/claims-if-you-were-injured/what-help-you-can-get-under-the-mrca',
    action: 'Check income and compensation support',
    extraUrl: 'https://www.dva.gov.au/about-myservice',
    extraLabel: 'Claims through MyService',
    sources: [
      'https://www.dva.gov.au/access-benefits/claims-and-compensation-for-illness-or-injury/claims-if-you-were-injured/what-help-you-can-get-under-the-mrca',
      'https://www.dva.gov.au/about-us/contact-us',
      'https://www.dva.gov.au/about-myservice'
    ]
  })
};
