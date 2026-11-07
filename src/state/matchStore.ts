/**
 * The match tab's state: the CS2 match summaries loaded, which one is open,
 * which round, and what the last "show in the heatmap" could not do.
 */

import { create } from 'zustand';
import { parseMatchDoc, type MatchDoc } from '../match/matchDoc';

/** `ALL` as the open match: every loaded match together. */
export const ALL = '';

export interface MatchState {
  docs: MatchDoc[];
  /** The open match's name, or ALL. */
  open: string;
  round: number | null;
  error: string | null;
  notice: string | null;
  load: (files: File[]) => Promise<void>;
  setOpen: (match: string) => void;
  setRound: (round: number | null) => void;
  setNotice: (notice: string | null) => void;
  clear: () => void;
}

export const useMatchStore = create<MatchState>((set, get) => ({
  docs: [],
  open: ALL,
  round: null,
  error: null,
  notice: null,
  load: async (files) => {
    const docs = [...get().docs];
    const errors: string[] = [];
    for (const file of files) {
      if (!/\.json$/i.test(file.name)) continue;
      try {
        const doc = parseMatchDoc(await file.text(), file.name);
        const at = docs.findIndex((d) => d.match === doc.match);
        if (at >= 0) docs[at] = doc;
        else docs.push(doc);
      } catch (e) {
        errors.push(e instanceof Error ? e.message : String(e));
      }
    }
    docs.sort((a, b) => a.map.localeCompare(b.map) || a.match.localeCompare(b.match));
    const open = docs.length === 1 ? docs[0].match : get().open;
    set({ docs, open, round: null, error: errors.length ? errors.join('\n') : null });
  },
  setOpen: (open) => set({ open, round: null, notice: null }),
  setRound: (round) => set({ round }),
  setNotice: (notice) => set({ notice }),
  clear: () => set({ docs: [], open: ALL, round: null, error: null, notice: null }),
}));
