/**
 * Saved camera paths: named shots kept in this browser and written to or
 * read from a JSON file, so a flythrough can be rendered again later, at
 * another size, or on another machine.
 */

import { create } from 'zustand';
import type { Keyframe, PathEasing, PathTiming, SegmentEase } from './campath';

export interface SavedPath {
  id: string;
  name: string;
  keys: Keyframe[];
  easing: PathEasing;
  timing: PathTiming;
  /** The render settings it was saved with. */
  seconds: number;
  fps: number;
  savedAt: number;
}

export interface PathFile {
  schema: 'heat3d.camera-paths/1';
  paths: SavedPath[];
}

const KEY = 'heat3d.cameraPaths';
const EASES: SegmentEase[] = ['none', 'in', 'out', 'inOut'];

function num(v: unknown, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}

/** A keyframe read back, or null when it is not one. */
function readKey(v: unknown): Keyframe | null {
  if (!v || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  const k: Keyframe = { u: num(o.u, NaN), x: num(o.x, NaN), y: num(o.y, NaN), z: num(o.z, NaN), yaw: num(o.yaw, NaN), pitch: num(o.pitch, 0), fov: num(o.fov, 60) };
  if (![k.u, k.x, k.y, k.z, k.yaw].every(Number.isFinite)) return null;
  if (typeof o.ease === 'string' && EASES.includes(o.ease as SegmentEase)) k.ease = o.ease as SegmentEase;
  return k;
}

/** Saved paths from JSON (a file or the browser's storage); what is not a path is left out. */
export function readPaths(json: unknown): SavedPath[] {
  const list = Array.isArray(json) ? json : json && typeof json === 'object' && Array.isArray((json as PathFile).paths) ? (json as PathFile).paths : [];
  const out: SavedPath[] = [];
  for (const p of list) {
    if (!p || typeof p !== 'object') continue;
    const o = p as unknown as Record<string, unknown>;
    const keys = Array.isArray(o.keys) ? o.keys.map(readKey).filter((k): k is Keyframe => !!k) : [];
    if (!keys.length) continue;
    out.push({
      id: typeof o.id === 'string' && o.id ? o.id : newId(),
      name: typeof o.name === 'string' && o.name.trim() ? o.name.trim().slice(0, 120) : 'Path',
      keys,
      easing: o.easing === 'linear' ? 'linear' : 'smooth',
      timing: o.timing === 'constant' ? 'constant' : 'keys',
      seconds: Math.min(3600, Math.max(1, num(o.seconds, 12))),
      fps: Math.min(240, Math.max(1, Math.round(num(o.fps, 30)))),
      savedAt: num(o.savedAt, Date.now()),
    });
  }
  return out;
}

export function pathsToJson(paths: SavedPath[]): string {
  const file: PathFile = { schema: 'heat3d.camera-paths/1', paths };
  return JSON.stringify(file, null, 1);
}

function newId(): string {
  return `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

function load(): SavedPath[] {
  try {
    return readPaths(JSON.parse(localStorage.getItem(KEY) ?? '[]'));
  } catch {
    return [];
  }
}

interface LibraryState {
  paths: SavedPath[];
  save: (p: Omit<SavedPath, 'id' | 'savedAt'>) => SavedPath;
  rename: (id: string, name: string) => void;
  remove: (id: string) => void;
  /** Adds the paths of a file; ones with an id already here replace it. */
  merge: (paths: SavedPath[]) => number;
}

export const usePathLibrary = create<LibraryState>((set, get) => {
  const persist = (paths: SavedPath[]) => {
    set({ paths });
    try {
      localStorage.setItem(KEY, JSON.stringify(paths));
    } catch {
      // Storage full or blocked: kept for this session.
    }
  };
  return {
    paths: load(),
    save: (p) => {
      const saved: SavedPath = { ...p, keys: p.keys.map((k) => ({ ...k })), id: newId(), savedAt: Date.now() };
      persist([...get().paths, saved]);
      return saved;
    },
    rename: (id, name) => persist(get().paths.map((p) => (p.id === id ? { ...p, name: name.trim() || p.name } : p))),
    remove: (id) => persist(get().paths.filter((p) => p.id !== id)),
    merge: (paths) => {
      const byId = new Map(get().paths.map((p) => [p.id, p]));
      for (const p of paths) byId.set(p.id, p);
      persist([...byId.values()]);
      return paths.length;
    },
  };
});
