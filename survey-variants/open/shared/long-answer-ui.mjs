import {characterCount, normaliseNewlines, MAX_TEXT_CHARACTERS} from './v4-common-core.mjs';

/**
 * Bind a visible optional long-answer box. Browser implementation helper, not a renderer.
 * All three elements must already have stable unique IDs and a visible label.
 * Native maxlength uses UTF-16 units, so do not use maxlength=10000 alongside this counter.
 * Accept over-limit input intact; show an error and stop Continue until corrected.
 */
export function bindLongAnswer({textarea, counter, error, onChange = () => {}}) {
  if (!textarea || !counter || !error) throw new TypeError('Textarea, counter and error elements are required.');
  textarea.required = false;
  textarea.removeAttribute('maxlength');
  textarea.rows = 6;
  const ids = new Set((textarea.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));
  if (counter.id) ids.add(counter.id);
  if (error.id) ids.add(error.id);
  textarea.setAttribute('aria-describedby', [...ids].join(' '));
  // Do not have the screen reader announce an entire paragraph on every keystroke.
  counter.setAttribute('aria-live', 'off');
  error.setAttribute('aria-live', 'polite');
  let composing = false;
  function update(notify = false) {
    const value = normaliseNewlines(textarea.value);
    const count = characterCount(value), over = count > MAX_TEXT_CHARACTERS;
    counter.textContent = `${count.toLocaleString('en-AU')} / 10,000 characters`;
    const message = over ? 'Please shorten your answer to 10,000 characters or fewer. Your text has not been changed.' : '';
    if (error.textContent !== message) error.textContent = message;
    error.hidden = !over;
    textarea.setAttribute('aria-invalid', over ? 'true' : 'false');
    textarea.setCustomValidity(message);
    if (notify) onChange(value);
    return !over;
  }
  const onInput = () => { if (!composing) update(true); };
  const onStart = () => { composing = true; };
  const onEnd = () => { composing = false; update(true); };
  textarea.addEventListener('input', onInput);
  textarea.addEventListener('compositionstart', onStart);
  textarea.addEventListener('compositionend', onEnd);
  update();
  return {
    validate: () => update(false),
    destroy() {
      textarea.removeEventListener('input', onInput);
      textarea.removeEventListener('compositionstart', onStart);
      textarea.removeEventListener('compositionend', onEnd);
    }
  };
}

/** Change display only. Never alter answers when merely collapsing a section. */
export function setDisclosure(button, panel, expanded) {
  if (!button || !panel || !panel.id) throw new TypeError('Provide a control and a panel with a stable ID.');
  button.setAttribute('aria-controls', panel.id);
  button.setAttribute('aria-expanded', String(Boolean(expanded)));
  panel.hidden = !expanded;
}

/** Use textContent for all user-entered values, including Other text in recalled headings. */
export function setPlainText(element, value) {
  if (!element) throw new TypeError('A target element is required.');
  element.textContent = String(value ?? '');
}
