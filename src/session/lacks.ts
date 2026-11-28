/**
 * What of the host's room each viewer lacks (`room.ts`): this viewer's list
 * goes out with its presence (`Presence.lacks`), the others' come in with
 * theirs. Its own module so the connection (`client.ts`) and the room need
 * not import each other.
 */

import { create } from 'zustand';

let mine = '';

/** This viewer's list, as it travels: the room's need ids, comma-separated. */
export function myLacks(): string {
  return mine;
}

export function setMyLacks(ids: string[]): void {
  mine = ids
    .filter((x) => /^[a-z0-9_-]{1,24}$/.test(x))
    .slice(0, 32)
    .join(',');
}

/** Every other member's list, by member id; `version` counts the changes. */
export const useLacks = create<{ by: Record<number, string[]>; version: number }>(() => ({ by: {}, version: 0 }));

/** A member's list as their presence said it (unchanged lists change nothing). */
export function noteLacks(member: number, lacks: string): void {
  const now = lacks ? lacks.split(',').filter(Boolean) : [];
  const had = useLacks.getState().by[member] ?? [];
  if (had.length === now.length && had.every((x, i) => x === now[i])) return;
  useLacks.setState((s) => ({ by: { ...s.by, [member]: now }, version: s.version + 1 }));
}

/** Members who left: their lists go. */
export function keepLacksOf(here: Set<number>): void {
  const by = useLacks.getState().by;
  const gone = Object.keys(by).filter((k) => !here.has(Number(k)));
  if (!gone.length) return;
  const next = { ...by };
  for (const k of gone) delete next[Number(k)];
  useLacks.setState((s) => ({ by: next, version: s.version + 1 }));
}

export function clearLacks(): void {
  mine = '';
  useLacks.setState({ by: {}, version: 0 });
}
