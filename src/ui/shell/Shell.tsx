/**
 * The side panel's frame: the brand row (search, help, settings), the
 * workspace bar, and on the long workspaces the task bar that shows one group
 * of sections at a time - Load, Explore, Compare, Present - with the rarely
 * used ones folded under "More" in each group. Every section stays in the
 * page in every group (only hidden), so nothing is unmounted by a filter and
 * the command palette can reach all of them.
 */

import { useEffect, useRef, type ReactNode } from 'react';
import { t, useLang } from '../../i18n';
import { useRaceStore } from '../../state/raceStore';
import { HelpButton } from '../help/HelpPanel';
import { LanguagePicker } from '../LanguagePicker';
import { MotionSetting } from '../MotionSetting';
import { UnitsPicker } from '../UnitsPicker';
import { SessionButton } from '../session/SessionButton';
import { UsageSettingsRow } from '../usage/UsageUI';
import { Icon, type IconName } from './Icon';
import { WORKSPACES, type Workspace } from './keys';
import { taskOf, useShell, WORKSPACE_TASKS, type Task, type Theme } from './shellStore';
import './shell.css';

const WORKSPACE_ICON: Record<Workspace, IconName> = { heat: 'heat', race: 'race', match: 'match', plan: 'plan', vehicle: 'vehicle' };
const WORKSPACE_LABEL: Record<Workspace, string> = {
  heat: 'app.tab.heat',
  race: 'app.tab.race',
  match: 'app.tab.match',
  plan: 'app.tab.plan',
  vehicle: 'vehicle.tab.label',
};
const WORKSPACE_TITLE: Partial<Record<Workspace, string>> = { match: 'app.tab.matchTitle', plan: 'app.tab.planTitle', vehicle: 'vehicle.tab.title' };
const TASK_ICON: Record<Task, IconName> = {
  all: 'all',
  load: 'load',
  explore: 'explore',
  analyse: 'analyse',
  compare: 'compare',
  draw: 'draw',
  plan: 'checklist',
  present: 'present',
};

/** What a task group holds on a workspace, for its tooltip. */
export function taskTitle(tab: string, task: Task): string {
  return t(task === 'all' || tab === 'heat' || tab === 'match' ? `shell.task.${task}Title` : `shell.taskTitle.${tab}.${task}`);
}

/** The workspace's name, in the viewer's language. */
export function workspaceLabel(w: Workspace): string {
  return t(WORKSPACE_LABEL[w]);
}

/** The top of the side panel: the name, the command search, help and settings. */
export function Brand() {
  useLang();
  const setPalette = useShell((s) => s.setPalette);
  return (
    <div className="brand">
      <div className="brand-mark" aria-hidden="true" />
      <h1>3DHeat</h1>
      <button type="button" className="search-btn" data-usage="panel:palette" onClick={() => setPalette(true)} title={t('shell.palette.title')} aria-label={t('shell.palette.title')}>
        <Icon name="search" size={14} />
        <span className="search-text">{t('shell.palette.button')}</span>
        <kbd>Ctrl K</kbd>
      </button>
      <SessionButton />
      <HelpButton />
      <SettingsMenu />
    </div>
  );
}

/** The workspaces, one line, an icon each; Ctrl+Shift+1 to 5. */
export function WorkspaceBar() {
  useLang();
  const tab = useRaceStore((s) => s.tab);
  const setTab = useRaceStore((s) => s.setTab);
  return (
    <div className="tabs" role="tablist">
      {WORKSPACES.map((w, i) => {
        const title = WORKSPACE_TITLE[w];
        return (
          <button
            key={w}
            role="tab"
            aria-selected={tab === w}
            data-usage={`ws:${w}`}
            className={tab === w ? 'on' : ''}
            onClick={() => setTab(w)}
            title={`${title ? t(title) : t(WORKSPACE_LABEL[w])} (Ctrl+Shift+${i + 1})`}
          >
            <Icon name={WORKSPACE_ICON[w]} size={15} />
            {t(WORKSPACE_LABEL[w])}
          </button>
        );
      })}
    </div>
  );
}

/** The task bar of a long workspace: which group of sections is shown. */
export function TaskBar({ tab }: { tab: string }) {
  useLang();
  const task = useShell((s) => taskOf(s.task, tab));
  const setTask = useShell((s) => s.setTask);
  return (
    <div className="task-bar" aria-label={t('shell.task.bar')}>
      {(WORKSPACE_TASKS[tab] ?? []).map((x) => (
        <button
          key={x}
          type="button"
          className={task === x ? 'on' : ''}
          aria-pressed={task === x}
          data-usage={`task:${tab}.${x}`}
          title={taskTitle(tab, x)}
          onClick={() => setTask(tab, x)}
        >
          <Icon name={TASK_ICON[x]} size={14} />
          <span>{t(`shell.task.${x}`)}</span>
        </button>
      ))}
    </div>
  );
}

/** A group of sections for one task; its heading shows when every group is. */
export function TaskGroup({ task, children, className }: { task: Exclude<Task, 'all'>; children: ReactNode; className?: string }) {
  return (
    <div className={`task-group${className ? ` ${className}` : ''}`} data-task={task}>
      <div className="task-head" aria-hidden="true">
        <Icon name={TASK_ICON[task]} size={12} />
        {t(`shell.task.${task}`)}
      </div>
      {children}
    </div>
  );
}

/**
 * Sections used now and then, folded away under "More". Its state is kept;
 * it shows itself whatever was kept while a section inside is open (the
 * command palette, or a panel opening itself, can open one).
 */
export function More({ id, children }: { id: string; children: ReactNode }) {
  useLang();
  const open = useShell((s) => s.more[id] ?? false);
  const setMore = useShell((s) => s.setMore);
  return (
    <div className={`more${open ? ' expanded' : ''}`} data-more={id}>
      <button type="button" className="more-toggle" data-usage={`more:${id}`} aria-expanded={open} onClick={() => setMore(id, !open)}>
        <Icon name="more" size={14} />
        {open ? t('shell.more.less') : t('shell.more.more')}
      </button>
      <div className="more-body">{children}</div>
    </div>
  );
}

/** The settings: theme, motion, units and language, behind the gear. */
export function SettingsMenu() {
  useLang();
  const open = useShell((s) => s.settings);
  const setOpen = useShell((s) => s.setSettings);
  const theme = useShell((s) => s.theme);
  const setTheme = useShell((s) => s.setTheme);
  const devTools = useShell((s) => s.devTools);
  const setDevTools = useShell((s) => s.setDevTools);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('pointerdown', close);
    return () => window.removeEventListener('pointerdown', close);
  }, [open, setOpen]);
  const themes: Array<{ v: Theme; icon: IconName }> = [
    { v: 'dark', icon: 'moon' },
    { v: 'light', icon: 'sun' },
    { v: 'system', icon: 'settings' },
  ];
  return (
    <div className="settings-menu" ref={box}>
      <button
        type="button"
        className={`ghost icon-btn${open ? ' on' : ''}`}
        aria-expanded={open}
        data-usage="panel:settings"
        aria-label={t('shell.settings.title')}
        title={t('shell.settings.title')}
        onClick={() => setOpen(!open)}
      >
        <Icon name="settings" />
      </button>
      {open && (
        <div className="settings-popover" role="dialog" aria-label={t('shell.settings.title')}>
          <div className="settings-title">{t('shell.settings.title')}</div>
          <div className="settings-row">
            <span>{t('shell.theme.label')}</span>
            <div className="seg">
              {themes.map(({ v, icon }) => (
                <button key={v} type="button" className={theme === v ? 'on' : ''} aria-pressed={theme === v} onClick={() => setTheme(v)}>
                  <Icon name={icon} size={13} /> {t(`shell.theme.${v}`)}
                </button>
              ))}
            </div>
          </div>
          <div className="settings-row">
            <MotionSetting />
          </div>
          <div className="settings-row">
            <span>{t('units.title')}</span>
            <UnitsPicker />
          </div>
          <div className="settings-row">
            <span>{t('common.language')}</span>
            <LanguagePicker />
          </div>
          {/* Last and off by default: test data, the frame readout and render internals (ui/panels/DevToolsPanel.tsx). */}
          <div className="settings-row">
            <label className="check" title={t('shell.dev.settingHint')}>
              <input type="checkbox" checked={devTools} onChange={(e) => setDevTools(e.target.checked)} data-testid="dev-tools-setting" />
              {t('shell.dev.setting')}
            </label>
          </div>
          <UsageSettingsRow onOpen={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
