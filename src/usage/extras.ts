/**
 * The features the viewer has besides the side panel's index: its keys, the
 * workspaces, their task groups, the view modes and the overlays, each with
 * the fewest clicks it takes from rest (the heat workspace, every group shown).
 * Imports with their extensions, so tools/usage-report.mjs reads it in node.
 */

import { SHORTCUTS } from '../ui/shell/shortcuts.ts';
import { WORKSPACE_TASKS as TASKS } from '../ui/shell/shellStore.ts';
import type { Extra } from './report.ts';

const WORKSPACES = Object.keys(TASKS);
const MODES = ['heat-simple', 'heat-difference', 'heat-teams', 'heat-lines', 'team'];
/** Keys the statistics see as what they open (the stores report those), not as keys. */
const NOT_KEYS = new Set(['palette', 'sheet', 'help', 'workspace', 'close', 'modes', 'clear', 'cancel', 'look', 'wheel', 'undo', 'redo', 'tools', 'toolLetters']);

export function extraFeatures(): Extra[] {
  const out: Extra[] = [];
  for (const s of SHORTCUTS) if (!NOT_KEYS.has(s.id)) out.push({ id: `cmd:${s.id}`, path: 1 });
  for (const w of WORKSPACES) out.push({ id: `ws:${w}`, path: 1 });
  for (const w of WORKSPACES) for (const t of TASKS[w]) out.push({ id: `task:${w}.${t}`, path: w === 'heat' ? 1 : 2 });
  for (const m of MODES) out.push({ id: `mode:${m}`, path: 1 });
  for (const p of ['palette', 'sheet', 'settings', 'help']) out.push({ id: `panel:${p}`, path: 1 });
  return out;
}
