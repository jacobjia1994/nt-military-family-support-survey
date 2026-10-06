// Update question groups in place so native radio focus and prior options stay.
export function reconcileQuestions(container, questions, answers, markup) {
 const existing = new Map([...container.children].map(node => [node.dataset.questionId,node]));
 const retained = new Set();
 questions.forEach((question,index) => {
  const template = document.createElement('template');
  template.innerHTML = markup(question);
  const candidate = template.content.firstElementChild;
  let node = existing.get(question.id);
  if (!node || node.dataset.signature !== candidate.dataset.signature) {
   node?.remove();
   node = candidate;
  }
  node.querySelectorAll('input[type="radio"]').forEach(input => {
   input.checked = input.value === answers[question.id];
  });
  if (container.children[index] !== node) container.insertBefore(node,container.children[index] || null);
  retained.add(node);
 });
 [...container.children].forEach(node => { if (!retained.has(node)) node.remove(); });
}

// A branch change can remove content above a control. Keep that control in the
// same viewport position; never move keyboard focus to the next question.
export function preserveChoicePosition(control, update) {
 const position = control ? {id:control.id,top:control.getBoundingClientRect().top,focused:document.activeElement===control} : null;
 update();
 if (!position) return;
 const current = document.getElementById(position.id);
 if (!current) return;
 if (position.focused && document.activeElement !== current) current.focus({preventScroll:true});
 const delta = current.getBoundingClientRect().top-position.top;
 if (Math.abs(delta)>1) window.scrollBy({top:delta,behavior:'instant'});
}
