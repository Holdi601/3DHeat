/**
 * The board kept in the browser between visits: the whole plan, written a
 * moment after each change, and read back when the viewer opens. Browser
 * storage can be missing, full or refused (a private window, blocked site
 * data), so every read and write is guarded and the board works without it;
 * a file (Save) is the copy to rely on.
 */

import { readPlan, type Plan } from './plan';

const KEY = 'heat3d.tactics.autosave';
const AUTHOR = 'heat3d.tactics.author';

function storage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

/** Writes the plan; 'full' when the browser had no room for it, 'off' without storage. */
export function saveLocal(plan: Plan): 'ok' | 'full' | 'off' {
  const s = storage();
  if (!s) return 'off';
  try {
    s.setItem(KEY, JSON.stringify({ at: new Date().toISOString(), plan }));
    return 'ok';
  } catch {
    return 'full';
  }
}

/** The plan last kept, and when; null when there is none or it does not read. */
export function loadLocal(): { plan: Plan; at: string } | null {
  const s = storage();
  if (!s) return null;
  try {
    const text = s.getItem(KEY);
    if (!text) return null;
    const v = JSON.parse(text) as { at?: unknown; plan?: unknown };
    return { plan: readPlan(JSON.stringify(v.plan)), at: typeof v.at === 'string' ? v.at : '' };
  } catch {
    return null;
  }
}

export function clearLocal(): void {
  try {
    storage()?.removeItem(KEY);
  } catch {
    // Nothing kept, nothing to clear.
  }
}

/** The name this viewer's edits are signed with (files, and a shared board later). */
export function loadAuthor(): string {
  try {
    return storage()?.getItem(AUTHOR) ?? '';
  } catch {
    return '';
  }
}

export function saveAuthor(name: string): void {
  try {
    storage()?.setItem(AUTHOR, name);
  } catch {
    // Kept for this visit only.
  }
}

/** Whether a plan holds anything worth keeping. */
export function hasContent(plan: Plan): boolean {
  return plan.figures.length + plan.arrows.length + plan.areas.length + plan.notes.length + (plan.drawings?.length ?? 0) > 0 || plan.layers.length > 1;
}
