/**
 * The 3DHeat Library: replays, recordings, demos, converted matches, levels
 * and Watcher sessions, managed like photos in a photo library - folders it
 * watches, a grid of thumbnails, filters, collections, ratings and tags,
 * conversion in a queue, and Open in 3DHeat. Over the viewer in the app (the
 * Library button), or a window of its own (`3dheat-app --library`).
 *
 * Keys, as in a photo library: arrows move, Shift+arrows select a run,
 * Ctrl+A all, 0-5 rate, P pick, X reject, U unflag, Enter opens, Ctrl+F
 * searches, G grid, L list, Esc back to the viewer.
 */

import { useEffect, useRef, useState } from 'react';
import { t, useLang } from '../i18n';
import { toast } from '../ui/shell/kit';
import { lib } from './api';
import { date, hours, size } from './games';
import { LibraryGrid, pick } from './LibraryGrid';
import { editTargets, LibraryInspector } from './LibraryInspector';
import { LibraryDupes, LibraryMaps, LibrarySettings } from './LibraryMaps';
import { convertItems, LibraryQueue } from './LibraryQueue';
import { LibrarySide } from './LibrarySide';
import { openFromAddress, openItems, type OpenHow } from './open';
import { allIds, itemAt, refreshAll, refreshSide, startPolling, targets, useLibrary, type LibView } from './store';
import './library.css';

const SORTS = ['started', 'added', 'name', 'map', 'game', 'duration', 'players', 'size', 'rating'];

interface Tauri {
  invoke(cmd: string, args?: Record<string, unknown>): Promise<unknown>;
}
const tauri = () => (globalThis as unknown as { __TAURI_INTERNALS__?: Tauri }).__TAURI_INTERNALS__ ?? null;

/** The folder picker of the app (a path), or none in a browser (the path is typed). */
async function pickFolder(): Promise<string | null> {
  const tw = tauri();
  if (!tw) return null;
  const p = (await tw.invoke('pick_folder').catch(() => null)) as string | null;
  return p || null;
}

function AddFolder() {
  const open = useLibrary((s) => s.addOpen);
  const set = useLibrary((s) => s.set);
  const [path, setPath] = useState('');
  const [watch, setWatch] = useState(true);
  const [busy, setBusy] = useState(false);
  const [suggest, setSuggest] = useState<Array<{ path: string; what: string }>>([]);
  useEffect(() => {
    if (open) void lib.suggest().then((r) => setSuggest(r.folders)).catch(() => setSuggest([]));
  }, [open]);
  if (!open) return null;
  const add = async (p: string) => {
    if (!p.trim()) return;
    setBusy(true);
    try {
      await lib.addRoot(p.trim(), watch);
      toast(t('library.add.added'), 'good');
      set({ addOpen: false });
      setPath('');
      void refreshSide();
    } catch (e) {
      toast((e as Error).message, 'bad', 5000);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="lib-modal" role="dialog" aria-modal="true" aria-label={t('library.add.title')} onMouseDown={(e) => e.target === e.currentTarget && set({ addOpen: false })}>
      <div className="lib-modal-box">
        <h2>{t('library.add.title')}</h2>
        <p className="lib-hint">{t('library.add.hint')}</p>
        <form
          className="lib-add-row"
          onSubmit={(e) => {
            e.preventDefault();
            void add(path);
          }}
        >
          <input autoFocus value={path} onChange={(e) => setPath(e.target.value)} placeholder={t('library.add.placeholder')} aria-label={t('library.add.placeholder')} />
          {tauri() && (
            <button type="button" onClick={() => void pickFolder().then((p) => p && setPath(p))}>
              {t('library.add.browse')}
            </button>
          )}
          <button type="submit" className="primary" disabled={busy || !path.trim()} data-usage="cmd:lib.addFolderOk">
            {t('library.add.ok')}
          </button>
        </form>
        <label className="lib-check">
          <input type="checkbox" checked={watch} onChange={(e) => setWatch(e.target.checked)} />
          <span className="lib-check-label">{t('library.add.watch')}</span>
        </label>
        {suggest.length > 0 && (
          <div className="lib-suggest">
            <div className="lib-side-title">{t('library.add.found')}</div>
            {suggest.map((s) => (
              <button key={s.path} type="button" className="lib-suggest-row" onClick={() => void add(s.path)}>
                <span>{t(`library.suggest.${s.what}`)}</span>
                <code>{s.path}</code>
              </button>
            ))}
          </div>
        )}
        <p className="lib-hint">{t('library.add.privacy')}</p>
        <div className="lib-modal-foot">
          <button type="button" onClick={() => set({ addOpen: false })}>
            {t('library.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}

function Welcome() {
  const set = useLibrary((s) => s.set);
  return (
    <div className="lib-welcome">
      <div className="lib-welcome-art" aria-hidden="true">
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} style={{ ['--i' as string]: String(i) }} />
        ))}
      </div>
      <h2>{t('library.welcome.title')}</h2>
      <p>{t('library.welcome.text')}</p>
      <ul>
        <li>{t('library.welcome.what1')}</li>
        <li>{t('library.welcome.what2')}</li>
        <li>{t('library.welcome.what3')}</li>
      </ul>
      <button type="button" className="primary big" onClick={() => set({ addOpen: true })} data-usage="cmd:lib.welcomeAdd">
        {t('library.welcome.add')}
      </button>
      <p className="lib-hint">{t('library.add.privacy')}</p>
    </div>
  );
}

function NotHere() {
  return (
    <div className="lib-welcome">
      <h2>{t('library.unavailable.title')}</h2>
      <p>{t('library.unavailable.text')}</p>
    </div>
  );
}

function TopBar() {
  const filter = useLibrary((s) => s.filter);
  const patch = useLibrary((s) => s.patchFilter);
  const sort = useLibrary((s) => s.sort);
  const desc = useLibrary((s) => s.desc);
  const setSort = useLibrary((s) => s.setSort);
  const layout = useLibrary((s) => s.layout);
  const setLayout = useLibrary((s) => s.setLayout);
  const thumb = useLibrary((s) => s.thumb);
  const setThumb = useLibrary((s) => s.setThumb);
  const view = useLibrary((s) => s.view);
  const set = useLibrary((s) => s.set);
  const standalone = useLibrary((s) => s.standalone);
  const selected = useLibrary((s) => s.selected);
  const focus = useLibrary((s) => s.focus);
  const status = useLibrary((s) => s.status);
  const [q, setQ] = useState(filter.q ?? '');
  const search = useRef<HTMLInputElement>(null);
  useEffect(() => setQ(filter.q ?? ''), [filter.q]);
  useEffect(() => {
    const id = window.setTimeout(() => {
      if ((filter.q ?? '') !== q) patch({ q: q || undefined });
    }, 220);
    return () => window.clearTimeout(id);
  }, [q]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const f = () => search.current?.focus();
    window.addEventListener('heat3d:library-search', f);
    return () => window.removeEventListener('heat3d:library-search', f);
  }, []);
  const n = selected.size || (focus !== null ? 1 : 0);
  const tabs: LibView[] = ['items', 'maps', 'dupes', 'settings'];
  const jobs = status?.jobs;
  const open = (how: OpenHow) => void openItems(targets(), how);
  return (
    <header className="lib-top">
      <div className="lib-brand">
        <div className="brand-mark" aria-hidden="true" />
        <h1>{t('library.title')}</h1>
      </div>
      <nav className="lib-tabs" role="tablist">
        {tabs.map((v) => (
          <button key={v} type="button" role="tab" aria-selected={view === v} className={view === v ? 'on' : ''} onClick={() => set({ view: v })} data-usage={`cmd:lib.view.${v}`}>
            {t(`library.view.${v}`)}
          </button>
        ))}
      </nav>
      {view === 'items' && (
        <>
          <input ref={search} className="lib-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('library.search')} aria-label={t('library.search')} />
          <select value={sort} onChange={(e) => setSort(e.target.value, desc)} aria-label={t('library.sort.label')}>
            {SORTS.map((s) => (
              <option key={s} value={s}>
                {t(`library.sort.${s}`)}
              </option>
            ))}
          </select>
          <button type="button" className="lib-icon-btn" onClick={() => setSort(sort, !desc)} title={desc ? t('library.sort.desc') : t('library.sort.asc')} aria-label={desc ? t('library.sort.desc') : t('library.sort.asc')}>
            {desc ? '↓' : '↑'}
          </button>
          <span className="lib-seg" role="group" aria-label={t('library.layout')}>
            <button type="button" className={layout === 'grid' ? 'on' : ''} onClick={() => setLayout('grid')} title={`${t('library.layoutGrid')} (G)`}>
              ▦
            </button>
            <button type="button" className={layout === 'list' ? 'on' : ''} onClick={() => setLayout('list')} title={`${t('library.layoutList')} (L)`}>
              ☰
            </button>
          </span>
          {layout === 'grid' && <input className="lib-zoom" type="range" min={140} max={360} step={10} value={thumb} onChange={(e) => setThumb(Number(e.target.value))} aria-label={t('library.thumbSize')} />}
        </>
      )}
      <span className="lib-spacer" />
      <button type="button" className={`lib-queue-btn${jobs && (jobs.running || jobs.queued) ? ' busy' : ''}`} onClick={() => set({ queueOpen: !useLibrary.getState().queueOpen })} data-usage="cmd:lib.queue">
        {t('library.queue.button')}
        {jobs && jobs.running + jobs.queued > 0 && <span className="lib-count on">{jobs.running + jobs.queued}</span>}
        {jobs && jobs.failed > 0 && <span className="lib-count bad">{jobs.failed}</span>}
      </button>
      <button type="button" disabled={!n} onClick={() => void convertItems(targets())} data-usage="cmd:lib.convert">
        {t('library.act.convertN', { count: n })}
      </button>
      <span className="lib-split">
        <button type="button" className="primary" disabled={!n} onClick={() => open('view')} data-usage="cmd:lib.open">
          {t('library.act.openN', { count: n })}
        </button>
        <OpenMenu disabled={!n} onPick={open} />
      </span>
      {!standalone && (
        <button type="button" className="ghost" onClick={() => useLibrary.getState().setOpen(false)} title={`${t('library.back')} (Esc)`} data-usage="cmd:lib.close">
          {t('library.back')}
        </button>
      )}
    </header>
  );
}

function OpenMenu({ disabled, onPick }: { disabled: boolean; onPick: (how: OpenHow) => void }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('pointerdown', close);
    return () => window.removeEventListener('pointerdown', close);
  }, [open]);
  return (
    <span className="lib-menu-wrap" ref={box}>
      <button type="button" className="primary lib-caret-btn" disabled={disabled} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)} aria-label={t('library.act.moreOpen')}>
        ▾
      </button>
      {open && (
        <div className="lib-menu" role="menu">
          <button type="button" role="menuitem" onClick={() => (setOpen(false), onPick('view'))}>
            {t('library.act.openView')}
          </button>
          <button type="button" role="menuitem" onClick={() => (setOpen(false), onPick('mass'))} data-usage="cmd:lib.openMass">
            {t('library.act.openMass')}
          </button>
          <button type="button" role="menuitem" onClick={() => (setOpen(false), onPick('session'))} data-usage="cmd:lib.openSession">
            {t('library.act.openSession')}
          </button>
          <hr />
          <button
            type="button"
            role="menuitem"
            onClick={async () => {
              setOpen(false);
              const ids = targets();
              const r = await lib.move(ids).catch((e: Error) => (toast(e.message, 'bad'), null));
              if (r) toast(t('library.act.moved', { count: r.moved, path: r.to }), r.failed.length ? 'bad' : 'good', 4000);
            }}
            data-usage="cmd:lib.move"
          >
            {t('library.act.move')}
          </button>
        </div>
      )}
    </span>
  );
}

function StatusLine() {
  const status = useLibrary((s) => s.status);
  const total = useLibrary((s) => s.total);
  const facets = useLibrary((s) => s.facets);
  const selected = useLibrary((s) => s.selected);
  const busy = useLibrary((s) => s.busy);
  const error = useLibrary((s) => s.error);
  if (!status) return null;
  const sc = status.scan;
  return (
    <footer className="lib-status" aria-live="polite">
      {busy ? (
        <span className="lib-busy">{busy}</span>
      ) : sc.running ? (
        <span className="lib-busy">{sc.phase === 'walk' ? t('library.status.walking', { count: sc.found }) : t('library.status.reading', { done: sc.done, count: sc.changed })}</span>
      ) : (
        <span>
          {t('library.status.items', { count: total })}
          {facets?.totals ? ` · ${size(facets.totals.bytes)} · ${t('library.status.hours', { hours: hours(facets.totals.seconds) })}` : ''}
          {facets?.totals?.from ? ` · ${date(facets.totals.from, false)} – ${date(facets.totals.to, false)}` : ''}
        </span>
      )}
      {selected.size > 0 && <span>{t('library.status.selected', { count: selected.size })}</span>}
      {sc.deepLeft > 0 && !sc.running && <span className="lib-hint">{t('library.status.deep', { count: sc.deepLeft })}</span>}
      {status.outdated > 0 && (
        <button type="button" className="lib-link" onClick={() => useLibrary.getState().setFilter({ conv: ['outdated'] })}>
          {t('library.status.outdated', { count: status.outdated })}
        </button>
      )}
      {status.unconverted > 0 && (
        <button type="button" className="lib-link" onClick={() => useLibrary.getState().setFilter({ conv: ['none'], kind: ['replay'] })}>
          {t('library.status.unconverted', { count: status.unconverted })}
        </button>
      )}
      <span className="lib-spacer" />
      {error && <span className="lib-bad">{error}</span>}
      {sc.last && !sc.running && <span className="lib-hint">{t('library.status.lastScan', { count: sc.last.files, seconds: (sc.last.totalMs / 1000).toFixed(1) })}</span>}
    </footer>
  );
}

/** The keys of a photo library, on the grid. */
function useLibraryKeys() {
  useEffect(() => {
    const onKey = async (e: KeyboardEvent) => {
      const s = useLibrary.getState();
      if (!s.open || s.view !== 'items' || s.addOpen) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable)) {
        if (e.key === 'Escape') el.blur();
        return;
      }
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        const ids = await allIds();
        useLibrary.setState({ selected: new Set(ids) });
        return;
      }
      if (ctrl && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        window.dispatchEvent(new Event('heat3d:library-search'));
        return;
      }
      if (ctrl) return;
      const cols = (window as unknown as { __libraryCols?: number }).__libraryCols ?? 1;
      const move: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols };
      if (e.key in move) {
        e.preventDefault();
        // The index of the focused item among those loaded.
        let at = -1;
        for (const [p, items] of Object.entries(s.pages)) {
          const i = items.findIndex((x) => x.id === s.focus);
          if (i >= 0) at = Number(p) * 200 + i;
        }
        const next = Math.max(0, Math.min(s.total - 1, at < 0 ? 0 : at + move[e.key]));
        const it = itemAt(next);
        if (it) {
          pick({ ctrlKey: false, metaKey: false, shiftKey: e.shiftKey }, next, it.id);
          window.dispatchEvent(new CustomEvent('heat3d:library-focus', { detail: next }));
        }
        return;
      }
      if (/^[0-5]$/.test(e.key)) return void editTargets({ rating: Number(e.key) });
      const k = e.key.toLowerCase();
      if (k === 'p') return void editTargets({ flag: 1 });
      if (k === 'x') return void editTargets({ flag: -1 });
      if (k === 'u') return void editTargets({ flag: 0 });
      if (k === 'g') return s.setLayout('grid');
      if (k === 'l') return s.setLayout('list');
      if (k === 'i') return s.toggleInspector();
      if (e.key === 'Enter') return void openItems(targets());
      if (e.key === 'Escape') {
        if (s.selected.size) useLibrary.setState({ selected: new Set() });
        else if (!s.standalone) s.setOpen(false);
      }
    };
    const handler = (e: KeyboardEvent) => void onKey(e);
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, []);
}

export function LibraryView() {
  useLang();
  const open = useLibrary((s) => s.open);
  const view = useLibrary((s) => s.view);
  const available = useLibrary((s) => s.available);
  const status = useLibrary((s) => s.status);
  const inspector = useLibrary((s) => s.inspector);
  useLibraryKeys();
  useEffect(() => {
    if (!open) return;
    void refreshAll();
    return startPolling();
  }, [open]);
  if (!open) return null;
  const empty = status !== null && status.roots === 0;
  return (
    <div className="lib-root-view" role="dialog" aria-label={t('library.title')} data-usage-area="library">
      <TopBar />
      <div className="lib-body">
        {available === false ? (
          <NotHere />
        ) : empty ? (
          <Welcome />
        ) : view === 'items' ? (
          <>
            <LibrarySide />
            <main className="lib-main">
              <LibraryGrid />
            </main>
            {inspector && <LibraryInspector />}
          </>
        ) : view === 'maps' ? (
          <LibraryMaps />
        ) : view === 'dupes' ? (
          <LibraryDupes />
        ) : (
          <LibrarySettings />
        )}
      </div>
      <LibraryQueue />
      <StatusLine />
      <AddFolder />
    </div>
  );
}

// The Library's own window (`?library`, `3dheat-app --library`), or a viewer window it opened items in.
if (typeof location !== 'undefined') {
  const q = new URLSearchParams(location.search);
  if (q.has('library')) {
    useLibrary.setState({ open: true, standalone: true });
    document.title = '3DHeat Library';
  }
  if (q.has('libraryOpen')) openFromAddress();
}

/** The Library button for the side panel's brand row. */
export function LibraryButton() {
  useLang();
  const setOpen = useLibrary((s) => s.setOpen);
  return (
    <button type="button" className="ghost icon-btn lib-open-btn" onClick={() => setOpen(true)} title={t('library.openTitle')} aria-label={t('library.openTitle')} data-usage="panel:library">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 4h4v16H4zM10 4h4v16h-4zM16.5 4.5l3.8 1-3.9 15-3.8-1z" />
      </svg>
    </button>
  );
}
