/**
 * Bookmarks, as Tacview's: a moment with the camera as it was - where it
 * stood and looked, or which unit it followed and how - named by the viewer,
 * kept in this browser for this recording, and listed to go back to. Beside
 * them the moments the recording marks itself: kills, deaths and
 * destructions, and an ACMI file's own `Bookmark` events.
 */

import { create } from 'zustand';
import type { Dataset } from '../../state/types';
import type { FollowMode } from '../../state/replayStore';
import { eventRows } from './replayData';

export interface Bookmark {
  id: string;
  /** Seconds, the dataset's own time. */
  time: number;
  label: string;
  /** The free camera: position and view direction, data space. */
  camera: { p: [number, number, number]; f: [number, number, number] };
  /** The unit followed then, how and from how far; null for a free camera. */
  follow: { unit: string; mode: FollowMode; distance: number } | null;
  target: string | null;
  /** When it was made (ms since 1970), to tell bookmarks of one moment apart. */
  made: number;
}

/** The kinds of moment a recording marks itself. */
export type AutoKind = 'kill' | 'death' | 'bookmark' | 'message';

export interface AutoBookmark {
  kind: AutoKind;
  time: number;
  /** The event row: where it happened, and who. */
  row: number;
  /** The event as the recording calls it. */
  label: string;
}

const KILL = /^(kill|kills|killed_other|frag|player_kill)$/i;
const DEATH = /^(death|died|dead|destroyed|crash(ed)?|killed|player_death)$/i;

/** The kind of moment an event label is, or null for none worth a bookmark. */
export function autoKind(label: string): AutoKind | null {
  // An ACMI event carries its text after its kind: "Bookmark: Landing practice".
  const l = label.split(':')[0].trim();
  if (/^bookmark$/i.test(l)) return 'bookmark';
  if (/^message$/i.test(l)) return 'message';
  if (KILL.test(l)) return 'kill';
  if (DEATH.test(l)) return 'death';
  return null;
}

const autoCache = new WeakMap<Dataset, AutoBookmark[]>();

/**
 * The recording's own marks, in time order. A unit's death written twice in
 * a moment (War Thunder's "dead" and "death") is one.
 */
export function autoBookmarks(d: Dataset): AutoBookmark[] {
  const hit = autoCache.get(d);
  if (hit) return hit;
  const ev = eventRows(d);
  const out: AutoBookmark[] = [];
  if (ev && d.time) {
    const lastDeath = new Map<number, number>();
    for (let i = 0; i < ev.rows.length; i++) {
      const kind = autoKind(ev.labels[i]);
      if (!kind) continue;
      const row = ev.rows[i];
      const t = d.time[row];
      if (kind === 'death') {
        const p = ev.persons[i];
        const was = lastDeath.get(p);
        if (was !== undefined && Math.abs(t - was) < 3) continue;
        lastDeath.set(p, t);
      }
      out.push({ kind, time: t, row, label: ev.texts[i] ? `${ev.labels[i]}: ${ev.texts[i]}` : ev.labels[i] });
    }
  }
  autoCache.set(d, out);
  return out;
}

/** The key a recording's bookmarks are kept under: its name and size, which a reload keeps. */
export function bookmarkKey(d: Pick<Dataset, 'name' | 'count'>): string {
  return `heat3d.bookmarks.${d.name}|${d.count}`;
}

/** Bookmarks as they were kept, each checked; what is not one is dropped. */
export function parseBookmarks(text: string | null): Bookmark[] {
  if (!text) return [];
  try {
    const v = JSON.parse(text);
    if (!Array.isArray(v)) return [];
    const vec = (a: unknown): a is [number, number, number] =>
      Array.isArray(a) &&
      a.length === 3 &&
      a.every((x) => typeof x === 'number' && Number.isFinite(x));
    return v
      .filter(
        (b) =>
          b &&
          typeof b === 'object' &&
          typeof b.time === 'number' &&
          Number.isFinite(b.time) &&
          b.camera &&
          vec(b.camera.p) &&
          vec(b.camera.f),
      )
      .map((b) => ({
        id: typeof b.id === 'string' ? b.id : `${b.time}-${Math.random().toString(36).slice(2, 8)}`,
        time: b.time,
        label: typeof b.label === 'string' ? b.label : '',
        camera: { p: b.camera.p, f: b.camera.f },
        follow:
          b.follow && typeof b.follow.unit === 'string'
            ? {
                unit: b.follow.unit,
                mode: typeof b.follow.mode === 'string' ? b.follow.mode : 'chase',
                distance: typeof b.follow.distance === 'number' ? b.follow.distance : 60,
              }
            : null,
        target: typeof b.target === 'string' ? b.target : null,
        made: typeof b.made === 'number' ? b.made : 0,
      }))
      .sort((a, b) => a.time - b.time || a.made - b.made);
  } catch {
    return [];
  }
}

interface BookmarkState {
  key: string | null;
  list: Bookmark[];
  /** Read the bookmarks of a recording. */
  open: (d: Dataset | null) => void;
  add: (b: Omit<Bookmark, 'id' | 'made'>) => Bookmark;
  rename: (id: string, label: string) => void;
  remove: (id: string) => void;
  /** Put a list in (an import), joined with what is there. */
  merge: (list: Bookmark[]) => void;
}

function keep(key: string | null, list: Bookmark[]): void {
  if (!key) return;
  try {
    if (list.length) localStorage.setItem(key, JSON.stringify(list));
    else localStorage.removeItem(key);
  } catch {
    // No storage: they last this visit.
  }
}

export const useBookmarkStore = create<BookmarkState>((set, get) => ({
  key: null,
  list: [],
  open: (d) => {
    const key = d ? bookmarkKey(d) : null;
    if (key === get().key) return;
    let text: string | null = null;
    try {
      text = key ? localStorage.getItem(key) : null;
    } catch {
      text = null;
    }
    set({ key, list: parseBookmarks(text) });
  },
  add: (b) => {
    const made = Date.now();
    const bm: Bookmark = {
      ...b,
      id: `${made.toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      made,
    };
    const list = [...get().list, bm].sort((x, y) => x.time - y.time || x.made - y.made);
    keep(get().key, list);
    set({ list });
    return bm;
  },
  rename: (id, label) => {
    const list = get().list.map((b) => (b.id === id ? { ...b, label } : b));
    keep(get().key, list);
    set({ list });
  },
  remove: (id) => {
    const list = get().list.filter((b) => b.id !== id);
    keep(get().key, list);
    set({ list });
  },
  merge: (more) => {
    const have = new Set(get().list.map((b) => b.id));
    const list = [...get().list, ...more.filter((b) => !have.has(b.id))].sort(
      (x, y) => x.time - y.time || x.made - y.made,
    );
    keep(get().key, list);
    set({ list });
  },
}));
