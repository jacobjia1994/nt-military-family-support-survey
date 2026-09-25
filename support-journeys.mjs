// Reader-facing routes. These are recognisable situations, not exclusive
// categories: the same underlying need can appear in several journeys.
// Need IDs refer to the 39-heading source inventory in support-data.mjs.
export const journeys = [
  {
    id: 'posting', title: 'We’re moving, settling in or need housing help',
    choices: [
      { id: 'settling', title: 'We need to settle in after a posting', needIds: [1] },
      { id: 'housing', title: 'We need to find or keep a home', needIds: [7] },
      { id: 'pets', title: 'A pet is making the move harder', needIds: [8] },
      { id: 'school', title: 'School changes, learning or friendships are hard', needIds: [13, 14], serviceIds: ['school-change', 'defence-education', 'school-mentor'] },
      { id: 'local-connection', title: 'We feel new or isolated here', needIds: [28] },
      { id: 'partner-work', title: 'My partner needs work after the move', needIds: [5] }
    ]
  },
  {
    id: 'leaving', title: 'Someone in our family is leaving Defence',
    startServices: ['adf-transition', 'soldieron-employment', 'darwin-vfwc'],
    coveredNeedIds: [37],
    choices: [
      { id: 'housing', title: 'We may need housing help', needIds: [7] },
      { id: 'work', title: 'Someone needs work or career support', needIds: [5] },
      { id: 'local-connection', title: 'We need new connections and routines', needIds: [28, 29], serviceIds: ['darwin-vfwc', 'dmfs-darwin', 'soldieron-employment'] }
    ]
  },
  {
    id: 'work-money', title: 'Work or money is putting pressure on us',
    choices: [
      { id: 'hours', title: 'Work hours clash with family care', needIds: [3] },
      { id: 'reserve', title: 'Reserve service affects civilian work or income', needIds: [4] },
      { id: 'partner-career', title: 'A partner needs work or career help', needIds: [5] },
      { id: 'bills', title: 'Debt, bills or urgent expenses are a problem', needIds: [6] },
      { id: 'housing', title: 'We may lose our home', needIds: [7] },
      { id: 'childcare', title: 'Childcare does not fit our work hours', needIds: [10] }
    ]
  },
  {
    id: 'childcare', title: 'I need childcare',
    choices: [
      { id: 'regular', title: 'I need a regular childcare place', needIds: [9] },
      { id: 'shifts', title: 'Usual childcare does not fit shifts or an emergency', needIds: [10] }
    ]
  },
  {
    id: 'child-young', title: 'I’m expecting a baby or my child needs support',
    choices: [
      { id: 'baby', title: 'We are expecting or have a new baby', needIds: [11] },
      { id: 'parenting', title: 'Parenting or behaviour feels difficult', needIds: [12] },
      { id: 'school', title: 'School changes, learning or friendships are hard', needIds: [13, 14], serviceIds: ['school-change', 'defence-education', 'school-mentor'] },
      { id: 'teen', title: 'A teenager or young adult needs support', needIds: [15] },
      { id: 'young-carer', title: 'A young person helps care for someone', needIds: [16] },
      { id: 'disability', title: 'My child needs disability or ongoing care support', needIds: [25] }
    ]
  },
  {
    id: 'mental', title: 'Someone in our family needs mental health support',
    note: 'If someone is in immediate danger, call 000.',
    startServices: ['nt-mental-health-line', 'open-arms', 'lifeline'],
    coveredNeedIds: [20, 21, 22],
    choices: [
      { id: 'young', title: 'A young person needs someone to talk to', needIds: [15] },
      { id: 'ongoing', title: 'We need ongoing mental health care', needIds: [20] },
      { id: 'stress', title: 'Ongoing stress is affecting family life', needIds: [22] },
      { id: 'private', title: 'I want to ask privately', needIds: [33] }
    ]
  },
  {
    id: 'health-care', title: 'Someone needs healthcare, disability or caring help',
    choices: [
      { id: 'treatment', title: 'We need healthcare or to keep treatment going', needIds: [23] },
      { id: 'travel', title: 'We need to travel for specialist care', needIds: [24] },
      { id: 'disability', title: 'We need disability or continuous care support', needIds: [25] },
      { id: 'care-decisions', title: 'I need caring skills or a voice in care decisions', needIds: [26] },
      { id: 'older-relative', title: 'An older relative or carer needs support', needIds: [27] },
      { id: 'young-carer', title: 'A young person helps care for someone', needIds: [16] },
      { id: 'young-health', title: 'A young person needs health support', needIds: [15] }
    ]
  },
  {
    id: 'apart', title: 'Time apart or a relationship change is affecting us',
    choices: [
      { id: 'away', title: 'Someone is away on service or returning', needIds: [2] },
      { id: 'relationship', title: 'Our relationship or communication is strained', needIds: [17] },
      { id: 'separation', title: 'We need practical help after separation', needIds: [18] },
      { id: 'child', title: 'A child is finding time apart hard', needIds: [2, 12], serviceIds: ['adf-equip', 'parentline', 'dmfs-helpline'] },
      { id: 'unsafe', title: 'I or someone in my family feels unsafe', journeyId: 'unsafe', needIds: [19] }
    ]
  },
  {
    id: 'unsafe', title: 'I or someone in my family feels unsafe',
    note: 'If you are in immediate danger, call 000. If this device is not safe to use, use a safer phone or computer when you can.',
    startServices: ['1800respect', 'dawn-house', 'kwcc'],
    coveredNeedIds: [19],
    choices: [
      { id: 'pets', title: 'I am worried about leaving a pet behind', needIds: [8] },
      { id: 'private', title: 'I want to ask for help privately', needIds: [33] },
      { id: 'separation', title: 'I need practical help after separation', needIds: [18] }
    ]
  },
  {
    id: 'bereavement', title: 'Someone close to us has died',
    choices: [
      { id: 'general', title: 'We need grief or practical support', needIds: [38] },
      { id: 'suicide', title: 'The death was by suicide', needIds: [39] },
      { id: 'child-loss', title: 'A child has died', needIds: [38], serviceIds: ['amber-nt', 'open-arms'] },
      { id: 'veteran-family', title: 'We are a bereaved veteran family', needIds: [38], serviceIds: ['legacy-nt', 'open-arms'] }
    ]
  },
  {
    id: 'finding-help', title: 'I feel alone or don’t know where to turn',
    startServices: ['dmfs-helpline', 'darwin-vfwc'],
    coveredNeedIds: [34, 35],
    choices: [
      { id: 'connections', title: 'I need local people, activities or purpose', needIds: [28, 29], serviceIds: ['dmfs-darwin', 'dmfs-tindal', 'darwin-vfwc'] },
      { id: 'language', title: 'I need an interpreter or culturally safe support', needIds: [30] },
      { id: 'lgbtq', title: 'I want LGBTQIA+ inclusive support', needIds: [31] },
      { id: 'information', title: 'Information is missing or I keep being passed around', needIds: [32, 34, 35], serviceIds: ['dmfs-helpline', 'darwin-vfwc', 'dmfs-darwin', 'dmfs-tindal'] },
      { id: 'private', title: 'I am concerned about privacy', needIds: [33] }
    ]
  }
];

// Family influence on service design (#36) is participation, not a service need.
// It remains available through a secondary footer link.
export const secondaryNeedIds = [36];
