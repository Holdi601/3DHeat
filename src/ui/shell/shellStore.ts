/**
 * The viewer's shell: the theme, whether the side panel is shown, the task
 * group picked on each workspace, and which overlays (command palette, key
 * sheet) are open. The choices are kept in this browser; the overlays are not.
 */

import { create } from 'zustand';

export type Theme = 'dark' | 'light' | 'system';
/** The task groups of a workspace's side panel; `all` shows every group. */
export type Task = 'all' | 'load' | 'explore' | 'analyse' | 'compare' | 'draw' | 'plan' | 'present';
export const TASKS: Task[] = ['all', 'load', 'explore', 'analyse', 'compare', 'draw', 'plan', 'present'];

/**
 * Each workspace's task groups, in the order of its side panel: the long
 * workspaces by what is done with them - load, look, compare or analyse,
 * present - and the tactics board by drawing and planning first.
 */
export const WORKSPACE_TASKS: Record<string, Task[]> = {
  heat: ['all', 'load', 'explore', 'compare', 'present'],
  match: ['all', 'load', 'explore', 'compare', 'present'],
  race: ['all', 'load', 'analyse', 'present'],
  plan: ['all', 'draw', 'plan', 'load', 'present'],
  vehicle: ['all', 'load', 'explore', 'analyse', 'present'],
};

/** The task group shown on a workspace: one of its own, else all. */
export function taskOf(kept: Record<string, Task>, tab: string): Task {
  const x = kept[tab];
  return x && (WORKSPACE_TASKS[tab] ?? TASKS).includes(x) ? x : 'all';
}

const KEY = 'heat3d.shell';

interface Kept {
  theme: Theme;
  sidebarHidden: boolean;
  /** The task group per workspace tab. */
  task: Record<string, Task>;
  /** "More" disclosures opened, by id. */
  more: Record<string, boolean>;
}

function load(): Kept {
  const base: Kept = { theme: 'dark', sidebarHidden: false, task: {}, more: {} };
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Partial<Kept> | null;
    if (!raw || typeof raw !== 'object') return base;
    return {
      theme: raw.theme === 'light' || raw.theme === 'system' ? raw.theme : 'dark',
      sidebarHidden: raw.sidebarHidden === true,
      task: raw.task && typeof raw.task === 'object' ? raw.task : {},
      more: raw.more && typeof raw.more === 'object' ? raw.more : {},
    };
  } catch {
    return base;
  }
}

interface ShellState extends Kept {
  palette: boolean;
  sheet: boolean;
  settings: boolean;
  setTheme: (t: Theme) => void;
  setSidebarHidden: (v: boolean) => void;
  setTask: (tab: string, task: Task) => void;
  setMore: (id: string, open: boolean) => void;
  setPalette: (v: boolean) => void;
  setSheet: (v: boolean) => void;
  setSettings: (v: boolean) => void;
}

export const useShell = create<ShellState>((set, get) => {
  const keep = () => {
    const { theme, sidebarHidden, task, more } = get();
    try {
      localStorage.setItem(KEY, JSON.stringify({ theme, sidebarHidden, task, more }));
    } catch {
      // Blocked storage: the choices last as long as the page.
    }
  };
  return {
    ...load(),
    palette: false,
    sheet: false,
    settings: false,
    setTheme: (theme) => (set({ theme }), keep()),
    setSidebarHidden: (sidebarHidden) => (set({ sidebarHidden }), keep()),
    setTask: (tab, t) => (set({ task: { ...get().task, [tab]: t } }), keep()),
    setMore: (id, open) => (set({ more: { ...get().more, [id]: open } }), keep()),
    // One overlay at a time: the palette, the key sheet and the settings close each other.
    setPalette: (palette) => set(palette ? { palette, sheet: false, settings: false } : { palette }),
    setSheet: (sheet) => set(sheet ? { sheet, palette: false, settings: false } : { sheet }),
    setSettings: (settings) => set(settings ? { settings, palette: false, sheet: false } : { settings }),
  };
});

/** The theme as drawn: the system's when asked to follow it. */
export function resolvedTheme(theme: Theme, systemDark: boolean): 'dark' | 'light' {
  return theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;
}

/** Keeps `data-theme` on the root in step with the setting and, for `system`, the system's. */
export function applyTheme(): () => void {
  if (typeof document === 'undefined') return () => {};
  let mq: MediaQueryList | null = null;
  try {
    mq = matchMedia('(prefers-color-scheme: dark)');
  } catch {
    mq = null;
  }
  const apply = () => {
    document.documentElement.dataset.theme = resolvedTheme(useShell.getState().theme, mq ? mq.matches : true);
  };
  apply();
  const unsub = useShell.subscribe((s, prev) => {
    if (s.theme !== prev.theme) apply();
  });
  mq?.addEventListener('change', apply);
  return () => {
    unsub();
    mq?.removeEventListener('change', apply);
  };
}
