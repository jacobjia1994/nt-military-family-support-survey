# Children's participation and help with answering

Reviewed 25 September 2026. Scope: the existing Lutheran Care NT service-consultation questionnaire, its under-7 route, and who may help children answer. This is a bounded design review, not a claim of legal certification.

## Decision

Provide an actual under-7 form. For the ordinary under-15 online route, involve a parent or guardian before collecting substantive answers, and retain a private Lutheran Care help route where involving them would be unsafe or difficult. Keep the child's own answers distinct from an adult's observations.

Do not describe help from another person as unlawful, or a guardian's physical presence as universally required by Australian law. A reader, interpreter or scribe may assist without becoming the decision-maker. The parent's authority, the child's understanding and willingness, and who types the response are separate questions.

## What the sources establish

- The NT age of majority is **18**: [Age of Majority Act 1974, section 4](https://legislation.nt.gov.au/api/sitecore/Act/PDF?id=11583). This does not set the age of every valid privacy decision.
- [OAIC Chapter B, B.55–B.61](https://www.oaic.gov.au/privacy/australian-privacy-principles/australian-privacy-principles-guidelines/chapter-b-key-concepts) distinguishes capacity from age alone. Appropriate support may enable informed consent. Where case-by-case assessment is impracticable or unreasonable, capacity may be presumed from 15 unless circumstances suggest otherwise; under 15 it is not presumed. A mature younger child's position can be assessed individually. The guidance does not require a guardian to sit beside every child answering a form.
- [Lutheran Care's Confidentiality and Privacy Policy and Procedure, version 12, June 2026](https://www.lutherancare.org.au/wp-content/uploads/2026/06/Confidentiality-and-Privacy-Policy-and-Procedure-2026_v12.pdf), section 6, requires appropriate attention to children's capacity and lawful informed consent. It does not prescribe a universal 15-year exclusion or prohibit other helpers. The current PDF was fetched and its relevant text inspected for this review.
- [APP 3](https://www.oaic.gov.au/privacy/australian-privacy-principles/australian-privacy-principles-guidelines/chapter-3-app-3-collection-of-solicited-personal-information), including 3.89–3.91, prefers collection from the individual subject to its exceptions. Necessary, fairly collected guardian observations about a very young child must be labelled as such; they are not automatically the child's expressed views. [APP 5](https://www.oaic.gov.au/privacy/australian-privacy-principles/australian-privacy-principles-guidelines/chapter-5-app-5-notification-of-the-collection-of-personal-information) requires suitable information about collection, including third-party collection. Keep the existing short guardian notice and age-appropriate explanation.
- [National Principles for Child Safe Organisations](https://www.childsafety.gov.au/what-we-do/child-safe-organisations/national-principles-child-safe-organisations), especially principles 2–4, support children's participation, family involvement and suitable inclusion. They do not prescribe this questionnaire's age bands. [AHRC guidance on participation](https://humanrights.gov.au/resource-hub/children-and-youth-rights/the-right-to-be-heard) supports freely chosen, understandable participation and taking children's views seriously.
- [NT Care and Protection of Children Act 2007](https://legislation.nt.gov.au/api/sitecore/Act/PDF?id=11659), section 26, retains the reporting duty when its reasonable-belief threshold is met. Sections 10–12 describe respect, participation and assistance **within the administration of that Act** (see section 7); do not present them as a blanket legal requirement that every private questionnaire have a guardian present.

## Recommended short routing

These are proportionate product arrangements for this form. They are not legislatively prescribed age bands.

### Ages 7–14

Ask **before the main questions**:

**How are you answering these questions?**

- By myself
- With my parent or guardian
- With someone else

The ordinary self-service path requires the parent/guardian information and permission step, followed by the child's own choice to participate. The parent/guardian option means the guardian is involved; it does not require them to choose or dictate answers.

For **By myself** or **With someone else**, route to:

> **Ask a parent or guardian to join you**
>
> Please ask your parent or guardian to join you. They can read the information and give permission before you start.
>
> If this would be unsafe or difficult, you can speak with a Lutheran Care worker privately first.

Actions: **My parent or guardian is here** / **Speak with Lutheran Care first** / **Back**. The first opens the actual guardian declaration; it must not silently mark permission as granted. The staff-help route explains how to contact LC and does not act as a self-certified worker override. A suitably authorised support worker or interpreter can still assist through an appropriate staff arrangement.

Once permission is recorded, the child must still be free to decline, skip a question or stop. No automatic parent notification or new request for identifying information is needed. A helper reads or records the child's own answer without choosing it. For a genuine guardian-only account, use a separately labelled perspective instead of claiming it is the child's response.

### Ages 15–17

Use the same three assistance labels as descriptive information, with the person's own informed agreement. Another trusted helper does not automatically trigger a guardian stop. Offer **I would like someone to explain this** when understanding is uncertain. This preserves the OAIC capacity approach rather than treating every minor as incapable. A helper may support reading, communication or typing but must not supply the answers or give consent merely by being present.

### Under 7

Show an actual form for the parent/guardian after their information and authority declaration. Use a short introduction:

> You can write down what your child says or shows you. Use their own words where you can, and keep your observations separate. Leave any question blank. Stop if your child does not want to continue.

Distinguish two response modes:

- **My child wants to share their views.** Show one optional answer box for each short prompt.
- **I am sharing my observations as their parent or guardian.** Show the guardian-observation field; do not represent this as the child's consent or voice.

A parent should not have to declare that a baby or child unable to express willingness has actively agreed. Equally, a child's refusal cannot be overridden by an adult ticking a consent box. If a child declines, stop eliciting child answers; a separate guardian account remains an adult perspective, not a substitute child response.

Suggested child prompts:

1. **What do you like doing here?**
2. **Is there anything that feels hard?**
3. **Who helps you when you need help?**
4. **What would make things easier for you?**

Use **Your child's answer** for each box. One optional field at the end can be:

**Your observations as their parent or guardian**

> What support does your child need, or what would help your family?

Record expressed words, gestures or drawing descriptions faithfully. Do not turn an adult's interpretation of a gesture into a quotation from the child. Do not collect names, school names, photographs, recordings or an extra child's contact number for this exercise. A simple three-month reference can remain in the introduction when relevant; avoid expecting a very young child to calculate dates.

## Implemented sequence

The current interface records the parent/guardian permission and then the child’s own agreement before the connection/helper questions. The later self/other-helper gateway confirms guardian presence; it does not silently create or replace permission. Under-7 response modes are implemented in `young-children.js`, with distinct child-expression and guardian-observation records.

## Implementation checks that matter

- Under-15 assistance routing happens before substantive questions; no completed child answers are reclassified later because of the helper selection.
- Changing age, declining permission or stopping clears incompatible answers and participation records.
- Under-7 child-view and guardian-observation responses have separate keys and review labels; exports cannot report a guardian-only form as child self-report or as personally assented by the child.
- Selecting another helper does not automatically constitute consent, invalidity, or a safeguarding allegation.
- The guardian preference is a safe default for the unattended form; individual capacity and unusual care arrangements belong with LC staff. Do not invent a public checkbox that claims staff approval has been verified.
- Keep existing concise safety disclosure and help access. A category selection by itself is not a statutory report, and a questionnaire cannot promise absolute confidentiality.

## Evidence location

The freshly downloaded LC version-12 PDF and text are held in the task workspace at `work/child-participation-v3/lc-v12.pdf` and `work/child-participation-v3/lc-v12.txt`. Official web sources above were checked for this bounded review. No change to the receiving system or wider service-consultation classification is proposed here.
