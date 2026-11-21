/**
 * Feature ids: which part of the viewer an element or a command is, as the
 * usage statistics name it - from message keys and command ids only, so an id
 * is the same in every language and never carries what is on the screen.
 *
 * - `ctl:<section key>/<label key>`: a control in a side-panel section (or in
 *   a dialog, a popover, a bar: its title key in place of the section's). The
 *   label is read back to its key (`keyOf`); a label that is not a message (a
 *   name, a value) is `_`, never its words.
 * - `sec:<key>`: a section header. `cmd:<id>`, `ws:`, `task:`, `more:`,
 *   `panel:`, `mode:`, `cam:`: what `data-usage` on the element says, or the
 *   palette command it is.
 *
 * These match the command palette's index (`virtual:command-index`): an entry
 * `{ path: [..., s], label: l }` is `ctl:s/l`, `{ path: [..., s] }` is `sec:s`.
 */

import { has, keyOf } from '../i18n';
import { idSegment, validId } from './schema';

const words = (el: Element | null | undefined) => el?.textContent?.replace(/\s+/g, ' ').replace(/^▶\s*/, '').trim() ?? '';

/** A message key for these words, or null: never the words themselves. */
function keyFor(text: string | null | undefined): string | null {
  if (!text || text.length > 80) return null;
  const k = keyOf(text);
  return k && has(k) ? k : null;
}

/** The control an event landed on: a button, a field, a tab... */
export function controlOf(el: Element | null): HTMLElement | null {
  return (el?.closest?.('button, select, input, textarea, summary, a[href], [role="button"], [role="tab"], [role="menuitem"], label, [data-usage]') as HTMLElement | null) ?? null;
}

/** Containers that name the controls in them when no section does: their title or label key. */
function containerKey(el: Element): string | null {
  const box = el.closest<HTMLElement>('[role="dialog"], [role="toolbar"], .settings-popover, .timeline-bar, .help-panel, [data-usage-area]');
  if (!box) return null;
  const area = box.dataset.usageArea;
  if (area && has(area)) return area;
  return keyFor(box.getAttribute('aria-label')) ?? keyFor(words(box.querySelector('h2, .settings-title, strong')));
}

/** A section's id when it is a message key (a title with a value in it is not kept). */
export function sectionKeyOf(el: Element | null): string | null {
  const sec = el?.closest?.<HTMLElement>('.section[data-section]');
  const id = sec?.dataset.section;
  return id && has(id) ? id : null;
}

/** The label key of a control: its aria-label, its field's label, its words, its title. */
function labelKey(ctl: HTMLElement): string | null {
  const field = ctl.closest('.field');
  return (
    keyFor(ctl.getAttribute('aria-label')) ??
    keyFor(words(field?.querySelector('.label > span'))) ??
    keyFor(words(ctl.tagName === 'INPUT' || ctl.tagName === 'SELECT' || ctl.tagName === 'TEXTAREA' ? ctl.closest('label') : ctl)) ??
    keyFor(ctl.getAttribute('title')) ??
    keyFor(ctl.getAttribute('data-tip'))
  );
}

/** Whether the element is one of the developer tools (shown with `?dev`). */
export function isDevTool(el: Element | null): boolean {
  if (!el?.closest) return false;
  // `data-dev-tool` marks every developer tool (ui/panels/DevToolsPanel.tsx and the internals it shows).
  if (el.closest('[data-dev-tool], [data-dev-tools], .dev-tools')) return true;
  const sec = el.closest<HTMLElement>('.section[data-section]');
  for (let s: HTMLElement | null = sec; s; s = s.parentElement?.closest<HTMLElement>('.section[data-section]') ?? null)
    if (/dev(eloper)?Tools|\.dev\./i.test(s.dataset.section ?? '')) return true;
  return false;
}

/**
 * The feature an element is, or null when it is not a control the viewer
 * names. A section header is `sec:`; a control with `data-usage` is what that
 * says.
 */
export function featureOf(el: Element | null): string | null {
  if (!el?.closest) return null;
  const tagged = el.closest<HTMLElement>('[data-usage]');
  if (tagged && validId(tagged.dataset.usage, has)) return tagged.dataset.usage!;
  const header = el.closest('.section[data-section] > header');
  if (header) {
    const k = sectionKeyOf(header);
    return k ? `sec:${k}` : null;
  }
  const ctl = controlOf(el);
  if (!ctl) return null;
  const where = sectionKeyOf(ctl) ?? containerKey(ctl);
  if (!where) return null;
  const id = `ctl:${where}/${labelKey(ctl) ?? '_'}`;
  return validId(id, has) ? id : null;
}

/** Where a click landed when it was not on a control: `area:stage`, `area:sidebar`... */
export function areaOf(el: Element | null): string {
  if (!el?.closest) return 'area:page';
  if (el.closest('canvas, .stage')) return 'area:stage';
  if (el.closest('.sidebar')) return 'area:sidebar';
  if (el.closest('.timeline-bar')) return 'area:timeline';
  if (el.closest('.quick-bar')) return 'area:quick';
  return 'area:page';
}

/**
 * A palette command's feature: the same id the control or key has, so a
 * feature reached three ways is counted as one. Saved views, notes and charts
 * are counted by kind, never by which.
 */
export function featureOfCommand(id: string, ws: string): string | null {
  const dot = id.indexOf('.');
  const group = id.slice(0, dot);
  const rest = id.slice(dot + 1);
  let out: string | null = null;
  switch (group) {
    case 'action':
      out = `cmd:${rest === 'notes' ? 'notesPanel' : rest.startsWith('chart.add.') ? 'chart.add' : rest}`;
      break;
    case 'workspace':
      out = `ws:${rest}`;
      break;
    case 'task':
      out = `task:${ws}.${rest}`;
      break;
    case 'mode':
      out = `mode:${rest}`;
      break;
    case 'camera':
      out = `cam:${idSegment(rest)}`;
      break;
    case 'view':
      out = 'cmd:view.apply';
      break;
    case 'note':
      out = 'cmd:note.goTo';
      break;
    case 'doc':
      out = 'cmd:doc.open';
      break;
    case 'setting':
    case 'section': {
      // `<tab>|<path a>path b>|<label>`
      const [, path, label] = rest.split('|');
      const last = path?.split('>').pop();
      if (last) out = group === 'setting' && label ? `ctl:${last}/${label}` : `sec:${last}`;
      break;
    }
  }
  return out && validId(out, has) ? out : null;
}
