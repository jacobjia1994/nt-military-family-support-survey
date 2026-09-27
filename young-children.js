// Supported responses from children aged 7 or younger. Kept separate from self-completed surveys.
// The review build holds answers only in memory and has no submission endpoint.
(function (root) {
  'use strict';

  const MAX_LENGTH = 1500;
  const PROMPTS = Object.freeze([
    Object.freeze({ id: 'likes', label: 'What do you like about living here?' }),
    Object.freeze({ id: 'hard', label: 'Is there anything that feels hard?' }),
    Object.freeze({ id: 'help', label: 'Who helps you when you need help?' }),
    Object.freeze({ id: 'easier', label: 'What would make things a little easier?' }),
  ]);
  const PRIVACY_HINT = 'Please leave out names or other details that could identify someone.';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const textValue = value => typeof value === 'string' ? value.slice(0, MAX_LENGTH) : '';
  const ADF_CONNECTIONS = Object.freeze([{ id: 'yes', label: 'Yes' }, { id: 'no', label: 'No' }, { id: 'unsure', label: 'Not sure' }]);
  const CHILD_STAGES = Object.freeze([{ id: '0_4', label: '0–4 years' }, { id: '5_7', label: '5–7 years' }, { id: 'prefer', label: 'Prefer not to say' }]);
  const geography = () => root.SURVEY_GEOGRAPHY;
  const localities = () => [...(geography()?.localities || []),
    { id: 'other', label: 'Other locality in Greater Darwin' },
    { id: 'outside', label: 'Outside Greater Darwin' },
    { id: 'prefer', label: 'Prefer not to say' }];
  function localityChoice(value) {
    const typed = String(value || '').trim().toLocaleLowerCase('en-AU');
    return localities().find(option => [option.label, ...(option.aliases || [])].some(label => label.toLocaleLowerCase('en-AU') === typed));
  }
  function locationMetadata(suburb) {
    const named = geography()?.localities.find(option => option.id === suburb);
    if (named) return { region: named.region, geography_scope: 'greater_darwin' };
    if (suburb === 'other') return { region: 'greater_darwin_other', geography_scope: 'greater_darwin' };
    if (suburb === 'outside') return { region: 'outside_greater_darwin', geography_scope: 'outside_greater_darwin' };
    return { region: null, geography_scope: 'not_stated' };
  }

  function createSession(options = {}) {
    const permission = () => typeof options.guardianPermission === 'function' ? options.guardianPermission() : options.guardianPermission;
    const validPermission = () => permission()?.agreed === true && permission()?.age_path === 'young';
    const now = typeof options.now === 'function' ? options.now : () => new Date().toISOString();
    let responses = {};
    let observations = '';
    let willingnessAt = null;
    let background = {};

    function clearExpressions() { responses = {}; observations = ''; willingnessAt = null; }
    function reset() { clearExpressions(); background = {}; }
    function setBackground(key, value) {
      if (!validPermission()) { reset(); return false; }
      if (key === 'adf_connection' && ADF_CONNECTIONS.some(option => option.id === value)) {
        background.adf_connection = value;
        if (value === 'no') clearExpressions();
      } else if (key === 'suburb' && (value === '' || localities().some(option => option.id === value))) {
        if (background.suburb !== value) delete background.suburb_other;
        if (value) background.suburb = value; else delete background.suburb;
      } else if (key === 'suburb_other' && background.suburb === 'other') background.suburb_other = textValue(value).slice(0, 100);
      else if (key === 'child_stage' && (value === '' || CHILD_STAGES.some(option => option.id === value))) {
        if (value) background.child_stage = value; else delete background.child_stage;
      } else return false;
      return true;
    }
    function canContinue() {
      if (!validPermission()) { reset(); return false; }
      return ['yes', 'unsure'].includes(background.adf_connection);
    }
    function confirmWillingness(value) {
      if (!canContinue()) return false;
      if (value !== true) {
        responses = {}; willingnessAt = null;
        return false;
      }
      if (willingnessAt === null) willingnessAt = now();
      return true;
    }
    function answer(id, value) {
      if (!canContinue()) return false;
      if (id === 'guardian_observations') observations = textValue(value);
      else if (willingnessAt !== null && PROMPTS.some(prompt => prompt.id === id)) responses[id] = textValue(value);
      else return false;
      return true;
    }
    function snapshot() {
      const allowed = canContinue();
      return { background: { ...background }, willing: allowed && willingnessAt !== null, responses: { ...responses }, guardian_observations: observations };
    }
    function exportAnswers() {
      if (!canContinue()) return null;
      const permitted = permission();
      const guardianPermission = {
        age_path: 'young', kind: 'parent_guardian_permission', agreed: true,
      };
      for (const key of ['notice_version', 'recorded_at']) {
        if (typeof permitted[key] === 'string') guardianPermission[key] = permitted[key];
      }
      const childResponses = {};
      for (const prompt of PROMPTS) {
        if (responses[prompt.id]?.trim()) childResponses[prompt.id] = responses[prompt.id];
      }
      const hasChildResponses = Object.keys(childResponses).length > 0;
      return {
        schema_version: '1.2', questionnaire_version: 'young_child_supported', questionnaire_revision: '2026-09-27-background', age_path: 'young',
        geography_version: geography()?.version || null,
        background: { ...background, ...locationMetadata(background.suburb) },
        response_mode: hasChildResponses ? 'child_views' : 'guardian_observations',
        response_basis: hasChildResponses ? 'child_expressions_recorded_by_parent_guardian' : 'parent_guardian_observations',
        ...(hasChildResponses ? { child_responses: childResponses } : {}),
        ...(observations.trim() ? { guardian_observations: observations } : {}),
        participation: hasChildResponses ? {
          kind: 'parent_guardian_attestation_of_child_willingness',
          child_willingness_confirmed: true,
          recorded_at: willingnessAt,
          guardian_permission: guardianPermission,
        } : { kind: 'parent_guardian_permission_for_observations', guardian_permission: guardianPermission },
        collection_mode: 'internal_review_no_transmission',
        storage: 'downloaded_by_respondent; not submitted',
      };
    }
    return Object.freeze({ validPermission, setBackground, confirmWillingness, canContinue, answer, snapshot, exportAnswers, reset });
  }

  function create(options) {
    if (!options?.main) throw new TypeError('The younger-child form needs a main element.');
    const main = options.main;
    const session = createSession(options);
    const prompts = PROMPTS.map((prompt, index) => ({ ...prompt, label: String(options.prompts?.[index] || prompt.label) }));
    const privacyHint = options.privacyHint || PRIVACY_HINT;
    let controller;
    const focusHeading = () => { main.querySelector('h1')?.focus({ preventScroll: true }); root.scrollTo?.({ top: 0, behavior: 'instant' }); };
    function requirePermission() {
      if (session.validPermission()) return true;
      session.reset();
      options.onPermissionRequired?.();
      return false;
    }
    function stop() { session.reset(); options.onStop?.(); }
    function bindLocalityPicker(form) {
      const input = form.querySelector('#young-suburb');
      if (!input?.closest) return;
      const picker = input.closest('.locality-picker');
      const list = picker.querySelector('.locality-options');
      const toggle = picker.querySelector('.locality-toggle');
      let matches = [], active = -1;
      const close = () => { list.hidden = true; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); active = -1; };
      const open = (all = false) => {
        const query = all ? '' : input.value.trim().toLocaleLowerCase('en-AU');
        matches = localities().filter(option => ['other', 'outside', 'prefer'].includes(option.id) || [option.label, ...(option.aliases || [])].some(label => label.toLocaleLowerCase('en-AU').includes(query)));
        active = -1; input.removeAttribute('aria-activedescendant');
        list.innerHTML = matches.map((option, index) => `<li role="presentation"><button type="button" role="option" aria-selected="false" tabindex="-1" id="young-locality-${index}" data-young-locality="${esc(option.id)}">${esc(option.label)}${option.aliases?.length ? `<small>${esc(option.aliases.join(' / '))}</small>` : ''}</button></li>`).join('');
        list.hidden = false; input.setAttribute('aria-expanded', 'true');
      };
      const choose = option => {
        if (!option) return;
        input.value = option.label;
        session.setBackground('suburb', option.id);
        updateOtherLocality(form);
        input.focus(); close();
      };
      input.addEventListener('focus', () => open(Boolean(localityChoice(input.value))));
      input.addEventListener('input', () => {
        session.setBackground('suburb', localityChoice(input.value)?.id || '');
        updateOtherLocality(form); open();
      });
      input.addEventListener('keydown', event => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault(); if (list.hidden) open();
          active = event.key === 'ArrowDown' ? Math.min(active + 1, matches.length - 1) : active < 0 ? matches.length - 1 : Math.max(active - 1, 0);
          list.querySelectorAll('[role="option"]').forEach((option, index) => {
            option.setAttribute('aria-selected', index === active ? 'true' : 'false');
            if (index === active) { input.setAttribute('aria-activedescendant', option.id); option.scrollIntoView({ block: 'nearest' }); }
          });
        } else if (event.key === 'Enter' && !list.hidden) { event.preventDefault(); if (active >= 0) choose(matches[active]); }
        else if (event.key === 'Escape') { event.preventDefault(); close(); }
        else if (event.key === 'Tab') close();
      });
      toggle.addEventListener('click', () => { if (list.hidden) { input.focus(); open(true); } else close(); });
      list.addEventListener('pointerdown', event => event.preventDefault());
      list.addEventListener('click', event => { const option = event.target.closest('[data-young-locality]'); if (option) choose(localities().find(item => item.id === option.dataset.youngLocality)); });
      picker.addEventListener('focusout', event => { if (!picker.contains(event.relatedTarget)) close(); });
    }
    function updateOtherLocality(form) {
      const isOther = session.snapshot().background.suburb === 'other';
      const wrapper = form.querySelector('#young-other-locality');
      wrapper.hidden = !isOther;
      if (!isOther) form.querySelector('#young-suburb-other').value = '';
    }
    function showBackground() {
      if (!requirePermission()) return false;
      const background = session.snapshot().background;
      main.innerHTML = `<section class="survey-layout"><form class="question-card" id="young-background-form" novalidate><h1 tabindex="-1">About your child</h1><p class="question-intro">For a parent or guardian of a child aged 7 or younger.</p><fieldset class="question-group"><legend>Does your child have a parent, carer or other family member who serves or has served in the Australian Defence Force (ADF)?</legend><div class="choices">${ADF_CONNECTIONS.map(option => `<label class="choice"><input type="radio" name="adf_connection" value="${option.id}" required ${background.adf_connection === option.id ? 'checked' : ''}><span class="choice-label">${option.label}</span></label>`).join('')}</div></fieldset><div class="question-group"><label class="field-label" for="young-suburb">Which suburb or locality does your child live in?</label><p class="small" id="young-location-hint">Optional. Greater Darwin includes Darwin, Palmerston and Litchfield.</p><div class="locality-picker"><div class="locality-input-row"><input class="text-input" type="text" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="young-locality-options" aria-describedby="young-location-hint" id="young-suburb" name="suburb" maxlength="100" value="${esc(localities().find(option => option.id === background.suburb)?.label || '')}" placeholder="Type or choose a suburb or locality" autocomplete="off"><button class="locality-toggle" type="button" aria-label="Show suburb or locality options" tabindex="-1"><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg></button></div><ul class="locality-options" id="young-locality-options" role="listbox" aria-label="Suburbs and localities" hidden></ul></div></div><div class="question-group" id="young-other-locality" ${background.suburb === 'other' ? '' : 'hidden'}><label class="field-label" for="young-suburb-other">Which other locality in Greater Darwin?</label><input class="text-input" id="young-suburb-other" name="suburb_other" maxlength="100" value="${esc(background.suburb_other || '')}"></div><div class="question-group"><label class="field-label" for="young-stage">How old is your child? <span class="small">Optional</span></label><select class="select" id="young-stage" name="child_stage"><option value="">Select an age group</option>${CHILD_STAGES.map(option => `<option value="${option.id}" ${background.child_stage === option.id ? 'selected' : ''}>${option.label}</option>`).join('')}</select></div><div class="error" id="young-background-error" role="alert"></div><div class="question-actions"><button class="back-button" type="button" id="young-background-back">Back</button><button class="button primary" type="submit">Continue</button></div></form><button class="text-button" type="button" id="young-stop">Stop and clear answers</button></section>`;
      const form = main.querySelector('#young-background-form');
      form.addEventListener('change', event => {
        const input = event.target;
        if (input.name === 'adf_connection' || input.name === 'child_stage') session.setBackground(input.name, input.value);
      });
      form.addEventListener('input', event => {
        if (event.target.name === 'suburb_other') session.setBackground('suburb_other', event.target.value);
      });
      bindLocalityPicker(form);
      form.addEventListener('submit', event => {
        event.preventDefault();
        if (!requirePermission()) return;
        const error = form.querySelector('#young-background-error');
        const background = session.snapshot().background;
        if (!background.adf_connection) { error.textContent = 'Please choose Yes, No or Not sure for the ADF connection question.'; return; }
        if (background.adf_connection === 'no') return showOutsideScope();
        const locality = form.querySelector('#young-suburb');
        const chosen = localityChoice(locality.value);
        if (locality.value.trim() && !chosen) { error.textContent = 'Please choose a place from the list, choose Other locality in Greater Darwin or Outside Greater Darwin, or leave the location blank.'; locality.focus(); return; }
        session.setBackground('suburb', chosen?.id || '');
        if (chosen?.id === 'other') session.setBackground('suburb_other', form.querySelector('#young-suburb-other').value);
        session.setBackground('child_stage', form.querySelector('#young-stage').value);
        show();
      });
      main.querySelector('#young-background-back').onclick = () => { session.reset(); options.onBack?.(); };
      main.querySelector('#young-stop').onclick = stop;
      focusHeading();
      return true;
    }
    function showOutsideScope() {
      main.innerHTML = `<section class="survey-layout"><div class="question-card"><h1 tabindex="-1">Thank you for your interest</h1><p>This consultation is for Australian Defence Force members and their families.</p><div class="question-actions"><button class="back-button" type="button" id="young-scope-back">Review my answer</button><button class="button primary" type="button" id="young-scope-exit">Return to the start</button></div></div></section>`;
      main.querySelector('#young-scope-back').onclick = showBackground;
      main.querySelector('#young-scope-exit').onclick = () => { session.reset(); options.onBack?.(); };
      focusHeading();
    }
    function responseField(id, label, value) {
      return `<div class="question-group"><label class="field-label" for="young-${esc(id)}">${esc(label)}</label><textarea class="textarea" id="young-${esc(id)}" name="${esc(id)}" maxlength="${MAX_LENGTH}" aria-describedby="young-privacy">${esc(value || '')}</textarea><div class="char-count" data-young-counter="${esc(id)}" ${(value || '').length < MAX_LENGTH * .8 ? 'hidden' : ''}>${MAX_LENGTH - (value || '').length} characters remaining</div></div>`;
    }
    function show() {
      if (!requirePermission()) return false;
      if (!session.canContinue()) return showBackground();
      const values = session.snapshot();
      const observationField = responseField('guardian_observations', 'What would you like to tell us about your child’s needs or support?', values.guardian_observations);
      main.innerHTML = `<section class="survey-layout"><form class="question-card" id="young-form" novalidate><h1 tabindex="-1">Your child’s views and needs</h1><p class="question-intro">For a parent or guardian of a child aged 7 or younger.</p><p>Talk with your child about family life and their experience of living in Greater Darwin. In these questions, “here” means Greater Darwin: Darwin, Palmerston and Litchfield.</p><p>Write down your child’s words or describe what they show you. Leave questions blank if they cannot answer or do not want to. Add your own observations at the end.</p><label class="choice consent-choice"><input type="checkbox" id="young-willing" name="child_willing" ${values.willing ? 'checked' : ''}><span class="choice-label">I have explained this to my child, and they want to take part.</span></label><p class="small" id="young-privacy">${esc(privacyHint)}</p><fieldset class="question-group young-responses" id="young-responses" ${values.willing ? '' : 'disabled'}><legend class="visually-hidden">Your child’s responses</legend>${prompts.map(prompt => responseField(prompt.id, prompt.label, values.responses[prompt.id])).join('')}</fieldset><div class="young-guardian-observations"><h2>Your observations</h2>${observationField}</div><div class="error" id="young-error" role="alert"></div><div class="question-actions"><button class="back-button" type="button" id="young-back">Back</button><button class="button primary" type="submit">Continue</button></div></form><button class="text-button" type="button" id="young-stop">Stop and clear answers</button></section>`;
      const form = main.querySelector('#young-form');
      const willing = main.querySelector('#young-willing');
      willing.addEventListener('change', () => {
        const allowed = session.confirmWillingness(willing.checked);
        if (!requirePermission()) return;
        main.querySelector('#young-responses').disabled = !allowed;
        if (!allowed) {
          main.querySelector('#young-responses').querySelectorAll('textarea').forEach(input => { input.value = ''; });
          main.querySelector('#young-responses').querySelectorAll('[data-young-counter]').forEach(counter => { counter.hidden = true; counter.textContent = `${MAX_LENGTH} characters remaining`; });
        }
      });
      form.addEventListener('input', event => {
        const input = event.target;
        if (input.tagName !== 'TEXTAREA' || !session.answer(input.name, input.value)) return;
        const count = form.querySelector(`[data-young-counter="${input.name}"]`);
        if (count) { count.textContent = `${Math.max(0, MAX_LENGTH - input.value.length)} characters remaining`; count.hidden = input.value.length < MAX_LENGTH * .8; }
      });
      form.addEventListener('submit', event => {
        event.preventDefault();
        if (!requirePermission()) return;
        form.querySelectorAll('textarea').forEach(input => session.answer(input.name, input.value));
        showReview();
      });
      main.querySelector('#young-back').onclick = showBackground;
      main.querySelector('#young-stop').onclick = stop;
      focusHeading();
      return true;
    }
    function showReview() {
      if (!requirePermission()) return false;
      if (!session.canContinue()) return show();
      const values = session.snapshot();
      const rows = prompts.map(prompt => [prompt.label, values.responses[prompt.id]]).filter(([, value]) => value?.trim());
      const backgroundRows = [
        ['ADF family connection', ADF_CONNECTIONS.find(option => option.id === values.background.adf_connection)?.label],
        ['Child’s suburb or locality', localities().find(option => option.id === values.background.suburb)?.label],
        ['Other locality in Greater Darwin', values.background.suburb_other],
        ['Child’s age group', CHILD_STAGES.find(option => option.id === values.background.child_stage)?.label],
      ].filter(([, value]) => value);
      const reviewRows = rows => rows.map(([label, value]) => `<section class="review-block"><div class="review-header"><h3>${esc(label)}</h3></div><p class="review-value">${esc(value)}</p></section>`).join('');
      main.innerHTML = `<section class="survey-layout"><div class="question-card"><h1 tabindex="-1">Review your answers</h1><div class="review-header young-background-review"><h2>About your child</h2><button class="text-button" type="button" id="young-edit-background">Change</button></div>${reviewRows(backgroundRows)}${rows.length ? `<h2>Your child’s responses</h2>${reviewRows(rows)}` : ''}${values.guardian_observations.trim() ? reviewRows([['Your observations', values.guardian_observations]]) : ''}<div class="question-actions"><button class="back-button" type="button" id="young-edit">Back</button><button class="button primary" type="button" id="young-finish">Confirm and submit</button></div></div><button class="text-button" type="button" id="young-stop">Stop and clear answers</button></section>`;
      main.querySelector('#young-edit').onclick = show;
      main.querySelector('#young-edit-background').onclick = showBackground;
      main.querySelector('#young-stop').onclick = stop;
      main.querySelector('#young-finish').onclick = () => {
        const answers = session.exportAnswers();
        if (!answers) { if (requirePermission()) show(); return; }
        options.onFinish?.(answers, controller);
      };
      focusHeading();
      return true;
    }
    controller = Object.freeze({ show, showBackground, showReview, reset: session.reset, exportAnswers: session.exportAnswers });
    return controller;
  }

  root.SURVEY_YOUNG_CHILDREN = Object.freeze({ create, createSession, PROMPTS, MAX_LENGTH });
})(typeof window === 'undefined' ? globalThis : window);
