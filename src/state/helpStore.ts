/**
 * The help mode: whether the view explains its colours. Kept in this browser,
 * since someone learning the colours wants them there next time too.
 */

import { create } from 'zustand';

const KEY = 'heat3d.help';

function stored(): boolean {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

interface HelpState {
  on: boolean;
  toggle: () => void;
}

export const useHelpStore = create<HelpState>((set, get) => ({
  on: stored(),
  toggle: () => {
    const on = !get().on;
    set({ on });
    try {
      localStorage.setItem(KEY, on ? '1' : '0');
    } catch {
      // Blocked storage: the choice lasts as long as the page.
    }
  },
}));
