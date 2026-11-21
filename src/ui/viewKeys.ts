/**
 * Who has the keyboard: a text field, or the view.
 *
 * Every key handler of the view asks here first (App.tsx, render/camera.ts,
 * ui/replay/ReplayExtras.tsx, ui/notes/keys.ts, the volume gestures), so the
 * rule is one rule:
 *
 *   - Nothing fires while text is being typed: an input that takes text, a
 *     textarea, a select, anything contenteditable or with a text role, or
 *     anywhere inside an open modal dialog (the note editor, a confirm).
 *   - A key that types a character (a letter, a digit, a bracket, Space) is a
 *     shortcut only while the view has the focus: the canvas, or one of the
 *     view's own overlays that takes no text. Clicked away to a panel, the same
 *     letters do nothing, so a sentence typed with the focus somewhere
 *     unexpected cannot set off one shortcut after another.
 *
 * Named keys (Esc, Enter, Delete, Page Up...) and combinations with Ctrl only
 * need nobody typing.
 */

/** Input types that take no typed text: a key pressed on them types nothing. */
const NO_TEXT = new Set(['checkbox', 'radio', 'range', 'button', 'submit', 'reset', 'color', 'file', 'image']);
const TEXT_ROLES = new Set(['textbox', 'searchbox', 'combobox', 'spinbutton']);

/** Whether an element takes typed text (or chooses by it, as a select does). */
export function isTextEntry(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el || !el.tagName) return false;
  const tag = el.tagName;
  if (tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable) return true;
  if (tag === 'INPUT') return !NO_TEXT.has((el as HTMLInputElement).type);
  const role = el.getAttribute?.('role');
  return !!role && TEXT_ROLES.has(role);
}

/** Whether an element is inside a modal dialog. */
function inModal(target: EventTarget | null): boolean {
  const el = target as Element | null;
  return !!el && typeof el.closest === 'function' && !!el.closest('[aria-modal="true"]');
}

/**
 * Whether the keys are being typed rather than pressed at the view: a text
 * field is the event's target or has the focus, an input method is composing,
 * or the key lands in a modal dialog.
 */
export function typing(ev?: { target: EventTarget | null; isComposing?: boolean }): boolean {
  if (ev?.isComposing) return true;
  const active = typeof document !== 'undefined' ? document.activeElement : null;
  if (isTextEntry(ev?.target ?? null) || isTextEntry(active)) return true;
  return inModal(ev?.target ?? null) || inModal(active);
}

let view: HTMLElement | null = null;

/** The view's canvas, set by the engine when it attaches. */
export function setViewElement(el: HTMLElement | null): void {
  view = el;
}

/**
 * Whether the view has the keyboard: the canvas has the focus, or something
 * over it on the stage that takes no text (the quick bar's buttons, a card's).
 */
export function viewHasKeys(): boolean {
  if (!view || typeof document === 'undefined') return false;
  const a = document.activeElement;
  if (!a) return false;
  if (a === view) return true;
  const stage = view.parentElement;
  return !!stage && stage.contains(a) && !isTextEntry(a) && !inModal(a);
}

/** Whether a key types a character: a letter, digit, punctuation or Space, with no Ctrl, Alt or Meta. */
export function typesCharacter(ev: { key: string; ctrlKey: boolean; altKey: boolean; metaKey: boolean }): boolean {
  return !ev.ctrlKey && !ev.altKey && !ev.metaKey && (ev.key.length === 1 || ev.key === 'Spacebar');
}

/**
 * Whether a view shortcut may act on this key: nobody is typing, and a key
 * that types a character finds the view focused.
 */
export function viewKey(ev: KeyboardEvent): boolean {
  if (typing(ev)) return false;
  return !typesCharacter(ev) || viewHasKeys();
}
