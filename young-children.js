// Supported responses from children under 7. Kept separate from self-completed surveys.
// The review build holds answers only in memory and has no submission endpoint.
(function (root) {
  'use strict';

  const MAX_LENGTH = 1500;
  const PROMPTS = Object.freeze([
    Object.freeze({ id: 'likes', label: 'What do you like about being here?' }),
    Object.freeze({ id: 'hard', label: 'Is there anything that feels hard?' }),
    Object.freeze({ id: 'help', label: 'Who helps you when you need help?' }),
    Object.freeze({ id: 'easier', label: 'What would make things a little easier?' }),
  ]);
  const PRIVACY_HINT = 'Please leave out names or other details that could identify someone.';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const textValue = value => typeof value === 'string' ? value.slice(0, MAX_LENGTH) : '';

  function createSession(options = {}) {
    const permission = () => typeof options.guardianPermission === 'function' ? options.guardianPermission() : options.guardianPermission;
    const validPermission = () => permission()?.agreed === true && permission()?.age_path === 'young';
    const now = typeof options.now === 'function' ? options.now : () => new Date().toISOString();
    let mode = null;
    let responses = {};
    let observations = '';
    let willingnessAt = null;

    function reset() { mode = null; responses = {}; observations = ''; willingnessAt = null; }
    function selectMode(value) {
      if (!validPermission() || !['child_views', 'guardian_observations'].includes(value)) { reset(); return false; }
      if (value !== mode) { reset(); mode = value; }
      return true;
    }
    function canContinue() {
      if (!validPermission()) { reset(); return false; }
      return mode === 'guardian_observations' || mode === 'child_views' && willingnessAt !== null;
    }
    function confirmWillingness(value) {
      if (value !== true || !validPermission() || mode !== 'child_views') {
        responses = {}; observations = ''; willingnessAt = null;
        return false;
      }
      if (willingnessAt === null) willingnessAt = now();
      return true;
    }
    function answer(id, value) {
      if (!canContinue()) return false;
      if (id === 'guardian_observations') observations = textValue(value);
      else if (mode === 'child_views' && PROMPTS.some(prompt => prompt.id === id)) responses[id] = textValue(value);
      else return false;
      return true;
    }
    function snapshot() {
      const allowed = canContinue();
      return { mode, willing: mode === 'child_views' && allowed, responses: { ...responses }, guardian_observations: observations };
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
      return {
        schema_version: '1.0', questionnaire_version: 'young_child_supported', age_path: 'young',
        response_mode: mode,
        response_basis: mode === 'child_views' ? 'child_expressions_recorded_by_parent_guardian' : 'parent_guardian_observations',
        ...(mode === 'child_views' ? { child_responses: childResponses } : {}),
        ...(observations.trim() ? { guardian_observations: observations } : {}),
        participation: mode === 'child_views' ? {
          kind: 'parent_guardian_attestation_of_child_willingness',
          child_willingness_confirmed: true,
          recorded_at: willingnessAt,
          guardian_permission: guardianPermission,
        } : { kind: 'parent_guardian_permission_for_observations', guardian_permission: guardianPermission },
        collection_mode: 'internal_review_no_transmission',
        storage: 'downloaded_by_respondent; not submitted',
      };
    }
    return Object.freeze({ validPermission, selectMode, confirmWillingness, canContinue, answer, snapshot, exportAnswers, reset });
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
    function responseField(id, label, value) {
      return `<div class="question-group"><label class="field-label" for="young-${esc(id)}">${esc(label)}</label><textarea class="textarea" id="young-${esc(id)}" name="${esc(id)}" maxlength="${MAX_LENGTH}" aria-describedby="young-privacy">${esc(value || '')}</textarea><div class="char-count" data-young-counter="${esc(id)}" ${(value || '').length < MAX_LENGTH * .8 ? 'hidden' : ''}>${MAX_LENGTH - (value || '').length} characters remaining</div></div>`;
    }
    function show() {
      if (!requirePermission()) return false;
      const values = session.snapshot();
      const childMode = values.mode === 'child_views';
      const observationField = responseField('guardian_observations', 'What would you like to tell us about your child’s needs or support?', values.guardian_observations);
      const modeChoices = [['child_views', 'Record my child’s views'], ['guardian_observations', 'Share my observations as a parent or guardian']];
      main.innerHTML = `<section class="survey-layout"><form class="question-card" id="young-form" novalidate><h1 tabindex="-1">Your child’s views and needs</h1><p class="question-intro">For a parent or guardian of a child under 7.</p><fieldset class="question-group"><legend>What would you like to share?</legend><div class="choices">${modeChoices.map(([id, label]) => `<label class="choice"><input type="radio" name="young_mode" value="${id}" ${values.mode === id ? 'checked' : ''}><span class="choice-label">${label}</span></label>`).join('')}</div><p class="field-hint">You can share your own observations if your child cannot express their views.</p></fieldset>${childMode ? `<div class="participation-explanation"><p>Ask these questions in a way that suits your child. They can talk, draw or point. Write down their words or describe what they showed you. Leave any question blank and stop if they do not want to continue.</p></div><label class="choice consent-choice"><input type="checkbox" id="young-willing" name="child_willing" ${values.willing ? 'checked' : ''}><span class="choice-label">I have explained this to my child, and they want to take part.</span></label>` : ''}${values.mode ? `<p class="small" id="young-privacy">${esc(privacyHint)}</p><fieldset class="question-group young-responses" id="young-responses" ${session.canContinue() ? '' : 'disabled'}><legend class="visually-hidden">${childMode ? 'Your child’s responses' : 'Your observations'}</legend>${childMode ? `${prompts.map(prompt => responseField(prompt.id, prompt.label, values.responses[prompt.id])).join('')}<div class="young-guardian-observations"><h2>Your observations</h2><p class="small">These are recorded separately from your child’s responses.</p>${observationField}</div>` : observationField}</fieldset>` : ''}<div class="error" id="young-error" role="alert"></div><div class="question-actions"><button class="back-button" type="button" id="young-back">Back</button><button class="button primary" type="submit" ${session.canContinue() ? '' : 'disabled'}>Continue</button></div></form><button class="text-button" type="button" id="young-stop">${childMode ? 'My child does not want to take part, or I’m not sure' : 'Stop and clear answers'}</button></section>`;
      const form = main.querySelector('#young-form');
      const willing = main.querySelector('#young-willing');
      form.querySelectorAll('[name="young_mode"]').forEach(input => input.addEventListener('change', () => {
        session.selectMode(input.value);
        show();
        main.querySelector(`input[name="young_mode"][value="${input.value}"]`)?.focus();
      }));
      willing?.addEventListener('change', () => {
        const allowed = session.confirmWillingness(willing.checked);
        main.querySelector('#young-responses').disabled = !allowed;
        form.querySelector('[type="submit"]').disabled = !allowed;
        if (!allowed) {
          form.querySelectorAll('textarea').forEach(input => { input.value = ''; });
          form.querySelectorAll('[data-young-counter]').forEach(counter => { counter.hidden = true; counter.textContent = `${MAX_LENGTH} characters remaining`; });
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
        if (!session.canContinue()) { main.querySelector('#young-error').textContent = values.mode === 'child_views' ? 'Please confirm that your child wants to take part, or leave the questionnaire.' : 'Choose what you would like to share.'; willing?.focus(); return; }
        form.querySelectorAll('textarea').forEach(input => session.answer(input.name, input.value));
        showReview();
      });
      main.querySelector('#young-back').onclick = () => { session.reset(); options.onBack?.(); };
      main.querySelector('#young-stop').onclick = stop;
      focusHeading();
      return true;
    }
    function showReview() {
      if (!requirePermission()) return false;
      if (!session.canContinue()) return show();
      const values = session.snapshot();
      const rows = prompts.map(prompt => [prompt.label, values.responses[prompt.id]]);
      main.innerHTML = `<section class="survey-layout"><div class="question-card"><h1 tabindex="-1">Review your answers</h1>${values.mode === 'child_views' ? `<h2>Your child’s responses</h2>${rows.map(([label, value]) => `<section class="review-block"><div class="review-header"><h3>${esc(label)}</h3></div><p class="review-value">${esc(value?.trim() ? value : 'Not answered')}</p></section>`).join('')}` : ''}<section class="review-block"><div class="review-header"><h3>Your observations</h3></div><p class="review-value">${esc(values.guardian_observations.trim() ? values.guardian_observations : 'Not answered')}</p></section><div class="question-actions"><button class="back-button" type="button" id="young-edit">Back</button><button class="button primary" type="button" id="young-finish">Finish</button></div></div><button class="text-button" type="button" id="young-stop">Stop and clear answers</button></section>`;
      main.querySelector('#young-edit').onclick = show;
      main.querySelector('#young-stop').onclick = stop;
      main.querySelector('#young-finish').onclick = () => {
        const answers = session.exportAnswers();
        if (!answers) { if (requirePermission()) show(); return; }
        options.onFinish?.(answers, controller);
      };
      focusHeading();
      return true;
    }
    controller = Object.freeze({ show, showReview, reset: session.reset, exportAnswers: session.exportAnswers });
    return controller;
  }

  root.SURVEY_YOUNG_CHILDREN = Object.freeze({ create, createSession, PROMPTS, MAX_LENGTH });
})(typeof window === 'undefined' ? globalThis : window);
