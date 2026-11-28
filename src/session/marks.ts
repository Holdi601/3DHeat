/**
 * Marks over any view: world notes (a pin with a few words where something
 * is) and drawings (a freehand line on the scene), in every workspace, with
 * or without a session. In a session they are a shared document
 * (`docs.ts`): everyone sees them, a draw-only member adds and erases their
 * own, elevated members anyone's.
 */

import { create } from 'zustand';
import { identityHex } from './identity';

type V3 = { x: number; y: number; z: number };

export interface MarkPin {
  id: string;
  at: V3;
  text: string;
  /** sRGB 0..1. */
  color: [number, number, number];
  /** Who set it (this viewer's session name, or blank). */
  author: string;
  /** The browser's key it was set from: erasing one's own is offered for these. */
  key: string;
  created: number;
}

export interface MarkStroke {
  id: string;
  points: V3[];
  color: [number, number, number];
  /** Line width, CSS pixels. */
  width: number;
  author: string;
  key: string;
  created: number;
}

export interface MarksState {
  pins: MarkPin[];
  strokes: MarkStroke[];
}

export const MARK_COLLS = ['pins', 'strokes'] as const;

export const emptyMarks = (): MarksState => ({ pins: [], strokes: [] });

/** Points in one drawn line, at most (a long one is thinned). */
const MAX_POINTS = 400;

export type MarkTool = 'off' | 'pin' | 'draw' | 'erase';

interface MarksStore {
  doc: MarksState;
  tool: MarkTool;
  color: [number, number, number];
  /** Marks shown. */
  visible: boolean;
  setTool: (t: MarkTool) => void;
  setColor: (c: [number, number, number]) => void;
  setVisible: (v: boolean) => void;
  addPin: (at: V3, text: string, author: string, key: string) => string;
  setPinText: (id: string, text: string) => void;
  addStroke: (points: V3[], author: string, key: string) => string | null;
  remove: (id: string) => void;
  /** Removes every mark whose key passes `which`. */
  removeWhere: (which: (key: string) => boolean) => void;
}

let n = 0;
const markId = (p: string) => `${p}${Date.now().toString(36)}${(n = (n + 1) % 1e6).toString(36)}${Math.random().toString(36).slice(2, 5)}`;

function thin(points: V3[]): V3[] {
  if (points.length <= MAX_POINTS) return points;
  const step = points.length / MAX_POINTS;
  const out: V3[] = [];
  for (let i = 0; i < MAX_POINTS - 1; i++) out.push(points[Math.floor(i * step)]);
  out.push(points[points.length - 1]);
  return out;
}

const round = (v: V3): V3 => ({ x: Math.round(v.x * 1000) / 1000, y: Math.round(v.y * 1000) / 1000, z: Math.round(v.z * 1000) / 1000 });

export const useMarks = create<MarksStore>((set, get) => ({
  doc: emptyMarks(),
  tool: 'off',
  color: [1, 0.78, 0.2],
  visible: true,
  setTool: (tool) => set({ tool }),
  setColor: (color) => set({ color }),
  setVisible: (visible) => set({ visible }),
  addPin: (at, text, author, key) => {
    const id = markId('p');
    const pin: MarkPin = { id, at: round(at), text: text.slice(0, 200), color: get().color, author, key, created: Date.now() };
    set((s) => ({ doc: { ...s.doc, pins: [...s.doc.pins, pin] } }));
    return id;
  },
  setPinText: (id, text) =>
    set((s) => ({ doc: { ...s.doc, pins: s.doc.pins.map((p) => (p.id === id ? { ...p, text: text.slice(0, 200) } : p)) } })),
  addStroke: (points, author, key) => {
    if (points.length < 2) return null;
    const id = markId('s');
    const stroke: MarkStroke = { id, points: thin(points).map(round), color: get().color, width: 3, author, key, created: Date.now() };
    set((s) => ({ doc: { ...s.doc, strokes: [...s.doc.strokes, stroke] } }));
    return id;
  },
  remove: (id) => set((s) => ({ doc: { pins: s.doc.pins.filter((p) => p.id !== id), strokes: s.doc.strokes.filter((x) => x.id !== id) } })),
  removeWhere: (which) => set((s) => ({ doc: { pins: s.doc.pins.filter((p) => !which(p.key)), strokes: s.doc.strokes.filter((x) => !which(x.key)) } })),
}));

/**
 * Whether a mark's key is this browser's: its proven key, or the named one
 * it had before the proven key was loaded (marks set before joining carry
 * that one). "Erase mine" and the erase tool go by it; the server decides
 * by its own record of who made each mark.
 */
export function isMine(key: string): boolean {
  if (!key) return false;
  if (key === identityHex()) return true;
  try {
    return key === localStorage.getItem('heat3d.session.key');
  } catch {
    return key === 'u:local';
  }
}

/** Erases this browser's own marks. */
export function eraseMine(): void {
  useMarks.getState().removeWhere(isMine);
}

/** Erases every mark (in a session: elevated members and up; the server refuses the rest). */
export function eraseAll(): void {
  useMarks.getState().removeWhere(() => true);
}

/**
 * This browser's key: the marks set here carry it, and the session server
 * knows a member's own entities by it across reconnects. The Ed25519 key's
 * hex once it is loaded (`identity.ts`; the server sees it proven), else a
 * random one kept here, which the server keeps apart as only named (`u:`).
 */
export function browserKey(): string {
  const proven = identityHex();
  if (proven) return proven;
  try {
    let k = localStorage.getItem('heat3d.session.key');
    if (!k || !/^u:[A-Za-z0-9_-]{16,62}$/.test(k)) {
      const b = new Uint8Array(16);
      crypto.getRandomValues(b);
      k = `u:${[...b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
      localStorage.setItem('heat3d.session.key', k);
    }
    return k;
  } catch {
    return 'u:local';
  }
}
