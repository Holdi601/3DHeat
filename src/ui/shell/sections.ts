/**
 * The side panel's sections: which were left open (kept in this browser, by
 * the key of their title, so the same in every language), and a way for the
 * command palette to open one and show it.
 */

import { keyOf } from '../../i18n';

const KEY = 'heat3d.sections';

let opened: Set<string> | null = null;

function set(): Set<string> {
  if (opened) return opened;
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    opened = new Set(Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string') : []);
  } catch {
    opened = new Set();
  }
  return opened;
}

/** A section's id: its title's message key, or the title itself when it carries values. */
export function sectionId(title: string): string {
  return keyOf(title) ?? title;
}

/** Whether the section was left open. */
export function wasOpen(id: string): boolean {
  return set().has(id);
}

/** Keeps the section's state for next time. */
export function rememberSection(id: string, open: boolean): void {
  const s = set();
  if (open === s.has(id)) return;
  if (open) s.add(id);
  else s.delete(id);
  try {
    localStorage.setItem(KEY, JSON.stringify([...s]));
  } catch {
    // Not kept: lasts the page.
  }
}

const openers = new Map<string, Set<() => void>>();

/** A mounted section's opener; returns its removal. */
export function registerSection(id: string, open: () => void): () => void {
  let fns = openers.get(id);
  if (!fns) openers.set(id, (fns = new Set()));
  fns.add(open);
  return () => {
    fns.delete(open);
    if (!fns.size) openers.delete(id);
  };
}

/** Opens the mounted section(s) with this id; true when there was one. */
export function openSection(id: string): boolean {
  const fns = openers.get(id);
  if (!fns?.size) return false;
  for (const fn of fns) fn();
  return true;
}
