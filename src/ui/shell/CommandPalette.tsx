/**
 * The command palette (Ctrl+K): every action, workspace, mode, camera view,
 * section and setting by name, with its key. Type to narrow, arrows to move,
 * Enter to run; the last few run come first when nothing is typed.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { t, useLang } from '../../i18n';
import { useEngine } from '../EngineContext';
import { buildCommands, score, type Command, type CommandGroup } from './commands';
import { Icon, type IconName } from './Icon';
import { useShell } from './shellStore';

const RECENT = 'heat3d.palette.recent';
const LIMIT = 60;

const GROUP_ICON: Record<CommandGroup, IconName> = {
  action: 'enter',
  workspace: 'panel',
  mode: 'heat',
  camera: 'above',
  section: 'all',
  setting: 'settings',
  view: 'bookmark',
};

function recent(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(RECENT) ?? '[]');
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function remember(id: string): void {
  try {
    localStorage.setItem(RECENT, JSON.stringify([id, ...recent().filter((x) => x !== id)].slice(0, 6)));
  } catch {
    // Not kept.
  }
}

export function CommandPalette() {
  const open = useShell((s) => s.palette);
  if (!open) return null;
  return <Palette />;
}

function Palette() {
  useLang();
  const engine = useEngine();
  const close = () => useShell.getState().setPalette(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const list = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  // Gathered once per opening: the page as it is now.
  const all = useMemo(() => buildCommands(engine), [engine]);
  const shown = useMemo(() => {
    const q = query.trim();
    if (!q) {
      const byId = new Map(all.map((c) => [c.id, c]));
      const first = recent().flatMap((id) => (byId.has(id) ? [byId.get(id)!] : []));
      const rest = all.filter((c) => c.group !== 'setting' && c.group !== 'section' && !first.includes(c));
      return [...first, ...rest].slice(0, LIMIT);
    }
    return all
      .map((c) => [c, score(c, q)] as const)
      .filter(([, s]) => s > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, LIMIT)
      .map(([c]) => c);
  }, [all, query]);

  useEffect(() => setActive(0), [query]);
  useEffect(() => {
    list.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [active]);
  useEffect(() => input.current?.focus(), []);

  const run = (c: Command | undefined) => {
    if (!c) return;
    remember(c.id);
    close();
    void c.run();
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(shown.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === 'PageDown') {
      e.preventDefault();
      setActive((i) => Math.min(shown.length - 1, i + 8));
    } else if (e.key === 'PageUp') {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 8));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      run(shown[active]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  };

  return (
    <div className="palette-scrim" onPointerDown={(e) => e.target === e.currentTarget && close()}>
      <div className="palette" role="dialog" aria-modal="true" aria-label={t('shell.palette.title')} onKeyDown={onKey}>
        <div className="palette-input">
          <Icon name="search" />
          <input
            ref={input}
            type="search"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={shown[active] ? `palette-${active}` : undefined}
            aria-label={t('shell.palette.title')}
            placeholder={t('shell.palette.placeholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd>Esc</kbd>
        </div>
        <div className="palette-list" id="palette-list" role="listbox" ref={list}>
          {shown.length === 0 && <div className="palette-empty">{t('shell.palette.none')}</div>}
          {shown.map((c, i) => (
            <div
              key={c.id}
              id={`palette-${i}`}
              role="option"
              aria-selected={i === active}
              className={`palette-item${i === active ? ' on' : ''}`}
              onPointerMove={() => i !== active && setActive(i)}
              onClick={() => run(c)}
            >
              <Icon name={GROUP_ICON[c.group]} size={14} className="palette-icon" />
              <span className="palette-label">
                {c.label}
                {c.hint && <span className="palette-hint">{c.hint}</span>}
              </span>
              <span className="palette-group">{t(`shell.group.${c.group}`)}</span>
              {c.keys && <kbd>{c.keys}</kbd>}
            </div>
          ))}
        </div>
        <div className="palette-foot">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> {t('shell.palette.move')}
          </span>
          <span>
            <kbd>Enter</kbd> {t('shell.palette.run')}
          </span>
          <span>
            <kbd>?</kbd> {t('shell.cmd.sheet')}
          </span>
        </div>
      </div>
    </div>
  );
}
