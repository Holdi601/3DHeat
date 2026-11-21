/**
 * What the command palette can do, gathered when it opens: the actions with
 * their keys, the workspaces and task groups, the view modes and camera views,
 * every section of the side panel and every setting in it - those on screen
 * read from the page, the rest from the index of the whole panel
 * (`virtual:command-index`, built from the source by tools/commandIndex.ts) - and the saved
 * views. Nothing here runs on the frame path: it is built once per opening.
 *
 * A section or a setting is "revealed": its workspace (and the view mode that
 * shows it) is switched to, the side panel shown, the task group holding it
 * picked, every section around it opened, and the control focused with a
 * flash, so the next key works it.
 */

import { datasetCapabilities, modeBlockedReason, splitHasTwoSides } from '../../data/validate';
import { keyOf, t } from '../../i18n';
import type { Engine } from '../../render/engine';
import { VIEW_PRESETS } from '../../render/camera';
import { usePlanStore } from '../../state/planStore';
import { useHelpStore } from '../../state/helpStore';
import { raceClock, useRaceStore } from '../../state/raceStore';
import { useReplayStore } from '../../state/replayStore';
import { applyView, captureView, useSavedViews } from '../../state/savedViews';
import { useStore } from '../../state/store';
import { useInspectStore } from '../../state/inspectStore';
import type { ViewMode } from '../../state/types';
import { toggleLockedFullscreen } from '../browserKeys';
import { copyCameraPose } from '../CameraReadout';
import { useMotion, type MotionSetting } from '../motion';
import indexData from 'virtual:command-index';
import { WORKSPACES, type Workspace } from './keys';
import { comboText, shortcut } from './shortcuts';
import { DEV_ONLY_KEYS, devToolsOn, taskOf, useShell, WORKSPACE_TASKS, type Task, type Theme } from './shellStore';
import { toast } from './kit';
import { addChartTo } from '../signs/addChart';
import { useSignStore } from '../../volumes/signs/store';
import { useVolumeStore } from '../../volumes/store';
import { useNotes } from '../../notes/store';
import { anchorSubject } from '../../notes/anchors';
import { newAnalysis, noteHere, showNotesPanel } from '../notes/actions';
import { goToNote } from '../notes/links';
import { session } from '../../session/client';
import { useMarks } from '../../session/marks';
import { downloadSession } from '../../session/sessionFile';
import { rankOf, useSessionStore } from '../../session/store';
import { useMass } from '../../mass/client';
import { runOutcome } from '../../mass/outcomeClient';

export { score } from './match';

export type CommandGroup = 'action' | 'workspace' | 'mode' | 'camera' | 'section' | 'setting' | 'view' | 'note';

export interface Command {
  id: string;
  label: string;
  group: CommandGroup;
  /** Where it lives, as a path of names: "Heatmap › Heat shape". */
  hint?: string;
  /** Its key, as text. */
  keys?: string;
  /** Extra words it is found by. */
  words?: string;
  run: () => void | Promise<void>;
}

/** One entry of the generated index: a section, or a control in one. */
export interface IndexEntry {
  tab: Workspace;
  /** The view mode the section shows in, where it shows in only some. */
  mode?: string;
  /** Section ids (title keys), outermost first. */
  path: string[];
  /** The control's label key; absent for the section itself. */
  label?: string;
}

const INDEX = (indexData as { entries: IndexEntry[] }).entries;

const WORKSPACE_LABEL: Record<Workspace, string> = {
  heat: 'app.tab.heat',
  race: 'app.tab.race',
  match: 'app.tab.match',
  plan: 'app.tab.plan',
  vehicle: 'vehicle.tab.label',
};

const MODES: Array<{ mode: ViewMode; label: string; key?: string }> = [
  { mode: 'heat-simple', label: 'app.mode.heat.label', key: '1' },
  { mode: 'heat-difference', label: 'app.mode.difference.label', key: '2' },
  { mode: 'heat-teams', label: 'app.mode.teamHeat.label', key: '3' },
  { mode: 'heat-lines', label: 'app.mode.lineHeat.label', key: '4' },
  { mode: 'team', label: 'app.mode.overlay.label' },
];

const PRESET_KEYS: Record<string, string> = {
  'Iso NE': 'heat.viewPanel.camera.preset.isoNE',
  'Iso NW': 'heat.viewPanel.camera.preset.isoNW',
  'Iso SE': 'heat.viewPanel.camera.preset.isoSE',
  'Iso SW': 'heat.viewPanel.camera.preset.isoSW',
  Top: 'heat.viewPanel.camera.preset.top',
  Bottom: 'heat.viewPanel.camera.preset.bottom',
  Front: 'heat.viewPanel.camera.preset.front',
  Back: 'heat.viewPanel.camera.preset.back',
  Left: 'heat.viewPanel.camera.preset.left',
  Right: 'heat.viewPanel.camera.preset.right',
};

const keysOf = (id: string) => {
  const s = shortcut(id);
  return s ? s.keys.map(comboText).join(' / ') : undefined;
};

/** A message, or its key when it has values (an index entry can name one). */
const say = (key: string) => {
  const text = t(key);
  return text.includes('{') ? key : text;
};

// ---------------------------------------------------------------- revealing

/**
 * A short wait for React to render what was just switched: by the clock, not
 * by frames, so a slow frame under a heavy scene does not stretch it.
 */
const nextFrame = () => new Promise<void>((r) => setTimeout(r, 16));

/** Polls `find` for up to `ms`. */
async function waitFor<T>(find: () => T | null | undefined, ms = 1500): Promise<T | null> {
  const until = performance.now() + ms;
  for (;;) {
    const v = find();
    if (v) return v;
    if (performance.now() > until) return null;
    await nextFrame();
  }
}

const css = (s: string) => (typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(s) : s.replace(/"/g, '\\"'));

/** The section with this id in the side panel, inside `within` when given. */
function findSection(id: string, within: ParentNode = document): HTMLElement | null {
  const root = within === document ? document.querySelector('.sidebar') : within;
  return (root?.querySelector(`.section[data-section="${css(id)}"]`) as HTMLElement | null) ?? null;
}

function flash(el: Element, cls: string): void {
  el.classList.remove(cls);
  // Restart the animation when it is still running.
  void (el as HTMLElement).offsetWidth;
  el.classList.add(cls);
  window.setTimeout(() => el.classList.remove(cls), 1600);
}

/** The control labelled `text` inside a section's body. */
function findControl(section: HTMLElement, text: string): { focus: HTMLElement; mark: HTMLElement } | null {
  const body = section.querySelector(':scope > .body');
  if (!body) return null;
  const same = (el: Element) => el.textContent?.replace(/\s+/g, ' ').trim() === text;
  for (const span of body.querySelectorAll('.field > .label > span:first-child')) {
    if (!same(span)) continue;
    const field = span.closest('.field') as HTMLElement;
    const focus = field.querySelector<HTMLElement>('input, select, textarea, button');
    if (focus) return { focus, mark: field };
  }
  for (const label of body.querySelectorAll('label')) {
    if (!same(label)) continue;
    const input = label.querySelector<HTMLElement>('input, select') ?? (label.htmlFor ? document.getElementById(label.htmlFor) : null);
    if (input) return { focus: input, mark: label as HTMLElement };
  }
  for (const el of body.querySelectorAll<HTMLElement>('button, summary, [role="button"]')) {
    if (same(el) || el.getAttribute('aria-label') === text) return { focus: el, mark: el };
  }
  for (const el of body.querySelectorAll<HTMLElement>('[aria-label]')) {
    if (el.getAttribute('aria-label') === text) return { focus: el, mark: el };
  }
  // A label that is a bare line of text before its control.
  for (const el of body.querySelectorAll<HTMLElement>('span, div, h4')) {
    if (el.children.length || !same(el)) continue;
    const focus = el.parentElement?.querySelector<HTMLElement>('input, select, button');
    if (focus) return { focus, mark: el.parentElement as HTMLElement };
  }
  return null;
}

/**
 * Shows a section (and a control in it): the workspace and mode switched to,
 * the panel shown, the group picked, the sections opened, the control focused.
 * Resolves to the control or section header, or null when it could not be found.
 */
export async function reveal(target: { tab?: Workspace; mode?: string; path: string[]; label?: string }): Promise<HTMLElement | null> {
  const race = useRaceStore.getState();
  if (target.tab && race.tab !== target.tab) {
    race.setTab(target.tab);
    await nextFrame();
  }
  const shell = useShell.getState();
  if (shell.sidebarHidden) shell.setSidebarHidden(false);
  if (target.path.length && !(await waitFor(() => findSection(target.path[0]), 250)) && target.mode) {
    useStore.getState().setMode(target.mode as ViewMode);
  }
  let section: HTMLElement | null = null;
  let within: ParentNode = document;
  for (const id of target.path) {
    section = await waitFor(() => findSection(id, within));
    if (!section) return null;
    if (!section.classList.contains('open')) {
      section.querySelector<HTMLElement>(':scope > header')?.click();
      await nextFrame();
    }
    within = section;
  }
  if (!section) return null;
  // The task group that holds it, when another group is showing.
  const group = section.closest<HTMLElement>('.task-group')?.dataset.task as Task | undefined;
  const tab = useRaceStore.getState().tab;
  const task = taskOf(useShell.getState().task, tab);
  if (group && task !== 'all' && task !== group) useShell.getState().setTask(tab, group);
  await nextFrame();
  const header = section.querySelector<HTMLElement>(':scope > header');
  if (target.label) {
    const text = say(target.label);
    const hit = await waitFor(() => findControl(section!, text), 400);
    if (hit) {
      hit.mark.scrollIntoView({ block: 'center' });
      hit.focus.focus({ preventScroll: true });
      flash(hit.mark, 'flash-control');
      return hit.focus;
    }
  }
  section.scrollIntoView({ block: 'start' });
  header?.focus({ preventScroll: true });
  flash(section, 'flash');
  return header;
}

/** Reveals a control and clicks it: a quick bar button that works a panel's own control. */
export async function clickControl(target: { tab?: Workspace; path: string[]; label: string }): Promise<boolean> {
  const el = await reveal(target);
  if (!el || el.tagName === 'HEADER') return false;
  el.click();
  return true;
}

// ---------------------------------------------------------------- the list

function modeAllowed(mode: ViewMode): boolean {
  const st = useStore.getState();
  if (!st.dataset) return true;
  return !modeBlockedReason(mode, datasetCapabilities(st.dataset), splitHasTwoSides(st.split, st.dataset));
}

/** Plays or pauses whatever the workspace plays: the race, the board, or the timeline. */
export function togglePlay(): void {
  const race = useRaceStore.getState();
  if (race.tab === 'race') race.patchReplay({ playing: !race.replay.playing });
  else if (race.tab === 'plan') usePlanStore.getState().play(!usePlanStore.getState().playing);
  else useStore.getState().setPlaying(!useStore.getState().timeline.playing);
}

/** Saves the view as it is, under the next free name. */
export function saveViewNow(engine: Engine | null): void {
  if (!engine) return;
  const n = useSavedViews.getState().views.length + 1;
  const name = t('analysis.views.defaultName', { n });
  useSavedViews.getState().add(name, '', useStore.getState().dataset?.name ?? '', captureView(engine));
  toast(t('shell.toast.viewSaved', { name }), 'good');
}

/** Section titles and control labels on the page now, as index entries. */
function pageEntries(tab: Workspace): IndexEntry[] {
  const out: IndexEntry[] = [];
  for (const sec of document.querySelectorAll<HTMLElement>('.sidebar .section[data-section]')) {
    const path: string[] = [];
    for (let s: HTMLElement | null = sec; s; s = s.parentElement?.closest<HTMLElement>('.section') ?? null) path.unshift(s.dataset.section ?? '');
    if (path.includes('')) continue;
    out.push({ tab, path });
    const body = sec.querySelector(':scope > .body');
    if (!body) continue;
    const labels = new Set<string>();
    for (const el of body.querySelectorAll('.field > .label > span:first-child, label, button, summary')) {
      if (el.closest('.section') !== sec) continue;
      const text = el.textContent?.replace(/\s+/g, ' ').trim();
      if (!text || text.length > 60) continue;
      const key = keyOf(text);
      if (key && !labels.has(key)) {
        labels.add(key);
        out.push({ tab, path, label: key });
      }
    }
  }
  return out;
}

/** Everything the palette offers now. */
export function buildCommands(engine: Engine | null): Command[] {
  const out: Command[] = [];
  const race = useRaceStore.getState();
  const tab = race.tab as Workspace;
  const shell = useShell.getState();
  const action = (id: string, label: string, run: () => void | Promise<void>, keys?: string, words?: string) =>
    out.push({ id: `action.${id}`, label, group: 'action', keys, words, run });

  // Actions.
  action('play', t('shell.cmd.play'), togglePlay, keysOf('play'));
  action('frame', t('shell.cmd.frame'), () => engine?.frameDataset(), keysOf('frame'));
  action('copyPose', t('shell.cmd.copyPose'), () => void copyCameraPose(engine), keysOf('copyPose'));
  action(
    'goTo',
    t('shell.cmd.goTo'),
    () => {
      useInspectStore.getState().patch({ showCamera: true });
      useInspectStore.getState().requestJumpFocus();
    },
    keysOf('goTo'),
  );
  action(
    'tactical',
    t('shell.cmd.tactical'),
    () => {
      const r = useReplayStore.getState();
      r.setLook({ on: !r.look.on });
    },
    keysOf('tactical'),
  );
  action('saveView', t('shell.cmd.saveView'), () => saveViewNow(engine));
  // Charts on volumes: one "add" per shown volume, the selected one first.
  {
    const vs = useVolumeStore.getState();
    const shown = vs.volumes.filter((v) => v.visible);
    const order = [...shown.filter((v) => v.id === vs.selected), ...shown.filter((v) => v.id !== vs.selected)];
    if (useStore.getState().dataset)
      for (const v of order) action(`chart.add.${v.id}`, t('charts.cmd.add', { name: v.name }), () => addChartTo(v.id), undefined, 'chart diagram sign graph bar volume');
    const hidden = useSignStore.getState().hidden;
    if (useSignStore.getState().signs.length) action('chart.toggle', hidden ? t('charts.cmd.show') : t('charts.cmd.hide'), () => useSignStore.getState().setHidden(!hidden), undefined, 'chart diagram sign');
  }
  // The outcome analysis: once the mass analysis has matches.
  if (useMass.getState().facets) {
    const toOutcome = () => useMass.getState().set({ open: true, tab: 'outcome' });
    action('outcome.open', t('outcome.cmd.open'), toOutcome, undefined, t('outcome.cmd.words'));
    action(
      'outcome.run',
      t('outcome.cmd.run'),
      () => {
        toOutcome();
        void runOutcome(engine);
      },
      undefined,
      t('outcome.cmd.words'),
    );
  }
  action('noteHere', t('shell.cmd.noteHere'), () => noteHere(engine), keysOf('noteHere'), t('shell.cmd.noteWords'));
  action('newAnalysis', t('shell.cmd.newAnalysis'), () => newAnalysis(), undefined, t('shell.cmd.analysisWords'));
  action('notes', t('shell.cmd.notes'), () => showNotesPanel(), keysOf('notesPanel'), t('shell.cmd.noteWords'));
  action(
    'sidebar',
    shell.sidebarHidden ? t('shell.cmd.sidebarShow') : t('shell.cmd.sidebarHide'),
    () => shell.setSidebarHidden(!shell.sidebarHidden),
    keysOf('sidebar'),
  );
  action('sheet', t('shell.cmd.sheet'), () => useShell.getState().setSheet(true), keysOf('sheet'));
  action('help', t('shell.cmd.help'), () => useHelpStore.getState().toggle(), keysOf('help'));
  action('fullscreen', t('heat.viewPanel.camera.fullscreen'), () => toggleLockedFullscreen());
  action('settings', t('shell.settings.title'), () => useShell.getState().setSettings(true));
  action('devTools', devToolsOn() ? t('shell.dev.cmdHide') : t('shell.dev.cmdShow'), () => useShell.getState().setDevTools(!devToolsOn()), undefined, t('shell.dev.cmdWords'));
  action('raceStart', t('shell.key.raceStart'), () => raceClock.set(0), keysOf('raceStart'));
  for (const th of ['dark', 'light', 'system'] as Theme[])
    action(`theme.${th}`, t('shell.cmd.theme', { theme: t(`shell.theme.${th}`) }), () => useShell.getState().setTheme(th));
  for (const m of ['auto', 'on', 'off'] as MotionSetting[])
    action(`motion.${m}`, `${t('motion.label')}: ${t(`motion.${m}`)}`, () => useMotion.getState().setSetting(m));

  // The multiplayer session, and the session file (with or without one).
  const ss = useSessionStore.getState();
  const words = t('session.cmd.words');
  action('session.panel', t('session.cmd.panel'), () => ss.setPanel(true), undefined, words);
  action('session.save', t('session.cmd.save'), () => void downloadSession(engine, false), undefined, words);
  if (ss.state !== 'joined' || ss.role === 'host')
    action('session.open', t('session.cmd.open'), () => void window.dispatchEvent(new Event('heat3d:open-session')), undefined, words);
  for (const x of ['pin', 'draw', 'erase'] as const)
    action(`session.mark.${x}`, t(`session.cmd.mark.${x}`), () => useMarks.getState().setTool(useMarks.getState().tool === x ? 'off' : x), undefined, words);
  if (ss.state === 'joined') {
    action('session.look', t('session.cmd.look'), () => session.lookHere({}), undefined, words);
    action('session.followMe', t('session.cmd.followMe'), () => session.lookHere({ follow: true }), undefined, words);
    if (ss.followPeer !== null || (ss.follow.mode === 'follow' && ss.follow.leader !== ss.me))
      action('session.stopFollow', t('session.stopFollow'), () => ss.patch(ss.followPeer !== null ? { followPeer: null } : { followOptOut: true }), undefined, words);
    if (rankOf(ss.role) >= rankOf('admin')) {
      action('session.everyoneFollow', t('session.cmd.everyoneFollow'), () => session.setFollow('follow', ss.me ?? 0), undefined, words);
      action('session.enforce', t('session.cmd.enforce'), () => session.setFollow('enforce', ss.me ?? 0), undefined, words);
      action('session.followOff', t('session.cmd.followOff'), () => session.setFollow('off'), undefined, words);
    }
    action('session.leave', t('session.leave'), () => session.leave(), undefined, words);
  }

  // Workspaces and task groups.
  WORKSPACES.forEach((w, i) =>
    out.push({
      id: `workspace.${w}`,
      label: t('shell.cmd.workspace', { name: t(WORKSPACE_LABEL[w]) }),
      group: 'workspace',
      keys: `Ctrl+Shift+${i + 1}`,
      run: () => race.setTab(w),
    }),
  );
  for (const x of WORKSPACE_TASKS[tab] ?? [])
    out.push({
      id: `task.${x}`,
      label: t('shell.cmd.task', { name: t(`shell.task.${x}`) }),
      group: 'workspace',
      hint: t(WORKSPACE_LABEL[tab]),
      run: () => useShell.getState().setTask(tab, x),
    });

  // View modes.
  for (const m of MODES) {
    if (!modeAllowed(m.mode)) continue;
    out.push({
      id: `mode.${m.mode}`,
      label: t(m.label),
      group: 'mode',
      keys: m.key,
      hint: t('shell.group.mode'),
      run: () => {
        if (race.tab !== 'heat' && race.tab !== 'match') race.setTab('heat');
        useStore.getState().setMode(m.mode);
      },
    });
  }

  // Camera views.
  for (const name of Object.keys(VIEW_PRESETS)) {
    const key = PRESET_KEYS[name];
    if (!key) continue;
    out.push({ id: `camera.${name}`, label: t('shell.cmd.cameraView', { name: t(key) }), group: 'camera', run: () => engine?.applyPreset(name) });
  }
  out.push({ id: 'camera.perspective', label: t('heat.viewPanel.camera.perspective'), group: 'camera', run: () => engine?.setProjection('perspective') });
  out.push({ id: 'camera.parallel', label: t('heat.viewPanel.camera.parallel'), group: 'camera', run: () => engine?.setProjection('orthographic') });

  // Saved views.
  for (const v of useSavedViews.getState().views)
    out.push({
      id: `view.${v.id}`,
      label: v.name,
      group: 'view',
      hint: t('analysis.views.title'),
      words: v.note,
      run: () => void (engine && applyView(engine, v.view)),
    });

  // Data notes and analyses, by title and words.
  const book = useNotes.getState().book;
  for (const n of book.notes)
    out.push({
      id: `note.${n.id}`,
      label: n.title || anchorSubject(n.anchor),
      group: 'note',
      hint: t(`notes.kind.${n.anchor.kind}`),
      words: `${n.tags.join(' ')} ${n.text.slice(0, 200)}`,
      run: () => void (engine && goToNote(engine, n.id)),
    });
  for (const d of book.docs)
    out.push({ id: `doc.${d.id}`, label: d.title, group: 'note', hint: t('notes.docs'), words: d.body.slice(0, 200), run: () => useNotes.getState().set({ docOpen: d.id }) });

  // Sections and settings: this workspace's from the page, every workspace's from the index.
  const seen = new Set<string>();
  const seenText = new Set<string>();
  const add = (e: IndexEntry, fromPage: boolean) => {
    const sig = `${e.tab}|${e.path.join('>')}|${e.label ?? ''}`;
    if (seen.has(sig)) return;
    seen.add(sig);
    const where = [t(WORKSPACE_LABEL[e.tab]), ...e.path.map(say)];
    const label = e.label ? say(e.label) : where[where.length - 1];
    if (!label || (label.includes('.') && label === e.label)) return;
    // Two buttons with the same words in one section are one command: the first.
    const shown = `${label}|${where.join('>')}|${e.label ? 1 : 0}`;
    if (seenText.has(shown)) return;
    seenText.add(shown);
    out.push({
      id: `${e.label ? 'setting' : 'section'}.${sig}`,
      label,
      group: e.label ? 'setting' : 'section',
      hint: (e.label ? where : where.slice(0, -1)).join(' › '),
      run: () => void reveal({ tab: e.tab, mode: fromPage ? undefined : e.mode, path: e.path, label: e.label }),
    });
  };
  // The developer tools' sections and controls only while they are on.
  const dev = devToolsOn();
  const shown = (e: IndexEntry) => dev || !(e.path.some((p) => DEV_ONLY_KEYS.has(p)) || (e.label && DEV_ONLY_KEYS.has(e.label)));
  for (const e of pageEntries(tab)) add(e, true);
  for (const e of INDEX) if (shown(e)) add(e, false);
  return out;
}
