/**
 * The dashboard window, in every workspace: beside the 3D view (or over all
 * of it), the dashboard open with its pages as tabs, the filters that apply
 * as chips (a drill-through with its way back, a selection with its clear),
 * and the page's tiles. Edit mode adds the field list and the settings
 * panel, undo / redo (Ctrl+Z, Ctrl+Y), Delete for the picked tile.
 *
 * With no dashboard open it lists the saved ones, the templates for the
 * workspace and an import. Nothing here counts: the client does
 * (`dashboards/client.ts`), for the page this window shows.
 */

import { ShareToggle } from '../session/ShareToggle';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { t, useLang } from '../../i18n';
import { useRaceStore } from '../../state/raceStore';
import { dashClient } from '../../dashboards/client';
import { canvasPdf, downloadBlob, drawImages, fileName, pageCanvas } from '../../dashboards/export';
import { startDashLink } from '../../dashboards/link';
import type { Dashboard, FilterDef, Page } from '../../dashboards/model';
import { useDash, pageShown } from '../../dashboards/store';
import { templatesFor } from '../../dashboards/templates';
import { useEngine } from '../EngineContext';
import { toast } from '../shell/kit';
import { FieldList, Inspector } from './Authoring';
import { Canvas } from './Canvas';
import './dashboards.css';

/** The window's theme class: the dashboard's own, or the viewer's. */
export function themeClass(d: Dashboard | null | undefined): string {
  const th = d?.theme ?? 'auto';
  if (th !== 'auto') return `theme-${th}`;
  return typeof document !== 'undefined' && document.documentElement.dataset.theme === 'light' ? 'theme-light' : 'theme-dark';
}

/** A slicer's value in words (chips, an exported page). */
export function slicerWords(f: FilterDef | undefined, fieldName: string): string {
  if (!f) return t('dash.slicer.allOf', { name: fieldName });
  switch (f.op) {
    case 'in':
      return `${fieldName}: ${(f.values ?? []).join(', ')}`;
    case 'out':
      return `${fieldName}: ${t('dash.chip.not')} ${(f.values ?? []).join(', ')}`;
    case 'range':
      return `${fieldName}: ${f.lo ?? '…'} – ${f.hi ?? '…'}`;
    case 'search':
      return `${fieldName}: “${f.text ?? ''}”`;
    case 'relative':
      return `${fieldName}: ${t(f.n && f.n < 0 ? 'dash.slicer.first' : 'dash.slicer.last')} ${Math.abs(f.n ?? 0)} ${t(`dash.slicer.unit.${f.unit ?? 'min'}`)}`;
    case 'expr':
      return f.expr ?? '';
  }
}

/** Export the page shown: as PNG or a one-page PDF. */
export async function exportPage(dashId: string, as: 'png' | 'pdf', dark?: boolean): Promise<boolean> {
  const st = useDash.getState();
  const b = st.bundle(dashId);
  const page = pageShown(st, dashId);
  if (!b || !page) return false;
  const cat = dashClient.catalog(b.dashboard);
  const filters = [...(b.dashboard.filters ?? []), ...(page.filters ?? [])];
  const isDark = dark ?? themeClass(b.dashboard) === 'theme-dark';
  const c = pageCanvas(b, page.id, dashClient.results, isDark, (tile) => slicerWords(filters.find((f) => f.slicer === tile.id), (tile.axis?.[0] && cat?.byId.get(tile.axis[0])?.name) || tile.title || ''));
  if (!c) return false;
  await drawImages(c, b, page.id);
  const name = `${b.dashboard.name} ${page.name}`;
  if (as === 'png') {
    const blob = await new Promise<Blob | null>((r) => c.toBlob(r, 'image/png'));
    if (!blob) return false;
    downloadBlob(fileName(name, 'png'), blob, 'image/png');
  } else downloadBlob(fileName(name, 'pdf'), (await canvasPdf(c)) as BlobPart, 'application/pdf');
  return true;
}

/** A page as a PNG data URL (a document block's picture); null when nothing can be drawn. */
export function pageThumb(dashId: string, pageId: string): string | null {
  const st = useDash.getState();
  const b = st.bundle(dashId);
  if (!b) return null;
  const page = b.pages.find((p) => p.id === pageId);
  const cat = dashClient.catalog(b.dashboard);
  const filters = [...(b.dashboard.filters ?? []), ...(page?.filters ?? [])];
  const c = pageCanvas(b, pageId, dashClient.results, false, (tile) => slicerWords(filters.find((f) => f.slicer === tile.id), (tile.axis?.[0] && cat?.byId.get(tile.axis[0])?.name) || tile.title || ''), 1100);
  try {
    return c ? c.toDataURL('image/png') : null;
  } catch {
    return null;
  }
}

export function exportJson(dashId: string): void {
  const b = useDash.getState().bundle(dashId);
  if (b) downloadBlob(fileName(b.dashboard.name, 'dashboard.json'), JSON.stringify(b, null, 1), 'application/json');
}

/** Pick a dashboard file and add it. */
export function importJson(): void {
  const inp = document.createElement('input');
  inp.type = 'file';
  inp.accept = '.json,application/json';
  inp.onchange = async () => {
    const f = inp.files?.[0];
    if (!f) return;
    try {
      const id = useDash.getState().importBundle(JSON.parse(await f.text()));
      toast(id ? t('dash.import.done') : t('dash.import.bad'), id ? 'good' : 'bad');
    } catch {
      toast(t('dash.import.bad'), 'bad');
    }
  };
  inp.click();
}

/** A new dashboard, from a template or empty, for the workspace in use. */
export function newDashboard(templateId: string | null = null): string | null {
  const tab = useRaceStore.getState().tab;
  const st = useDash.getState();
  if (templateId) {
    const tpl = templatesFor(tab).find((x) => x.id === templateId);
    const cat = tpl ? dashClient.catalog({ id: 'probe', name: '', theme: 'auto', link: { followView: true, driveView: false, volume: false }, at: 0 }) : null;
    if (!tpl || !cat) {
      toast(t('dash.tpl.noData'), 'bad');
      return null;
    }
    const b = tpl.build(cat);
    return st.create(b.dashboard.name, b, tab);
  }
  const id = st.create(t('dash.new.name', { n: st.dashboards.length + 1 }), null, tab);
  st.setEdit(true);
  return id;
}

/** Nothing open: the saved dashboards, the templates, an import. */
function Start() {
  const dashboards = useDash((s) => s.dashboards);
  const tab = useRaceStore((s) => s.tab);
  const tpls = templatesFor(tab);
  return (
    <div className="dash-start">
      <h3>{t('dash.start.title')}</h3>
      <div className="cards">
        <button type="button" className="card" data-action="new" onClick={() => newDashboard(null)}>
          <b>{t('dash.start.new')}</b>
          <small>{t('dash.start.newTip')}</small>
        </button>
        <button type="button" className="card" onClick={importJson}>
          <b>{t('dash.start.import')}</b>
          <small>{t('dash.start.importTip')}</small>
        </button>
      </div>
      {dashboards.length > 0 && <h3>{t('dash.start.saved')}</h3>}
      <div className="cards">
        {dashboards.map((d) => (
          <button key={d.id} type="button" className="card" onClick={() => useDash.getState().openDash(d.id)}>
            <b>{d.name}</b>
            <small>{d.workspace ? t(`dash.ws.${d.workspace}`) : ''}</small>
          </button>
        ))}
      </div>
      <h3>{t('dash.start.templates')}</h3>
      <div className="cards">
        {tpls.map((x) => (
          <button key={x.id} type="button" className="card" data-template={x.id} onClick={() => newDashboard(x.id)}>
            <b>{x.name}</b>
            <small>{t(`dash.tpl.${x.id}`)}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

/** The filters in force on the page, as chips. */
function Chips({ dash, page }: { dash: Dashboard; page: Page }) {
  const inter = useDash((s) => s.inter[dash.id]);
  const cat = dashClient.catalog(dash);
  const st = useDash.getState();
  const fname = (id: string) => cat?.byId.get(id)?.name ?? id;
  const all = [...(dash.filters ?? []).map((f) => ({ f, at: 'dash' as const })), ...(page.filters ?? []).map((f) => ({ f, at: 'page' as const }))];
  const drop = (f: FilterDef, at: 'dash' | 'page') => {
    if (f.slicer) st.setSlicer(f.slicer, null);
    else if (at === 'dash') st.setFilters({ dashId: dash.id }, (dash.filters ?? []).filter((x) => x.id !== f.id));
    else st.setFilters({ pageId: page.id }, (page.filters ?? []).filter((x) => x.id !== f.id));
  };
  const sel = inter?.selection?.pageId === page.id ? inter.selection : null;
  const through = inter?.through?.pageId === page.id ? inter.through : null;
  return (
    <div className="dash-chips" aria-label={t('dash.chips')}>
      {through && (
        <span className="dash-chip">
          <button type="button" title={t('dash.chip.backTip')} aria-label={t('dash.chip.back')} onClick={() => st.back(dash.id)}>
            ←
          </button>
          <b>{through.filters.map((f) => slicerWords(f, fname(f.field))).join(' · ')}</b>
        </span>
      )}
      {sel && (
        <span className="dash-chip" data-chip="selection">
          {t('dash.chip.selection')} <b>{sel.labels.map((l) => l.join(' · ')).join(', ')}</b>
          <button type="button" aria-label={t('dash.chip.clear')} title={t('dash.chip.clear')} onClick={() => st.select(dash.id, null)}>
            ✕
          </button>
        </span>
      )}
      {all.map(({ f, at }) => (
        <span className="dash-chip" key={f.id} title={t(at === 'dash' ? 'dash.chip.dashLevel' : 'dash.chip.pageLevel')}>
          <b>{slicerWords(f, f.op === 'expr' ? t('dash.filter.expr') : fname(f.field))}</b>
          <button type="button" aria-label={t('dash.chip.remove')} title={t('dash.chip.remove')} onClick={() => drop(f, at)}>
            ✕
          </button>
        </span>
      ))}
      {!sel && !through && !all.length && <span style={{ color: 'var(--text-faint)' }}>{t('dash.chip.none')}</span>}
      <span style={{ flex: 1 }} />
      {dash.link.followView && <span className="dash-chip" title={t('dash.link.followTip')}>{t('dash.link.followOn')}</span>}
    </div>
  );
}

function Header({ dash, pages, page }: { dash: Dashboard; pages: Page[]; page: Page }) {
  const st = useDash.getState();
  const edit = useDash((s) => s.edit);
  const dashboards = useDash((s) => s.dashboards);
  const undo = useDash((s) => (s.undo[dash.id] ?? []).length);
  const redo = useDash((s) => (s.redo[dash.id] ?? []).length);
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const link = (k: keyof Dashboard['link']) => st.patchDash(dash.id, { link: { ...dash.link, [k]: !dash.link[k] } });
  return (
    <>
      <div className="dash-head">
        <select aria-label={t('dash.head.pick')} title={t('dash.head.pickTip')} value={dash.id} onChange={(e) => (e.target.value === '@start' ? st.openDash(null) : st.openDash(e.target.value))}>
          {dashboards.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
          <option value="@start">{t('dash.head.all')}</option>
        </select>
        <button type="button" className={`dash-btn${edit ? ' on' : ''}`} aria-pressed={edit} data-action="edit" title={t('dash.head.editTip')} onClick={() => st.setEdit(!edit)}>
          {t('dash.head.edit')}
        </button>
        <button type="button" className="dash-btn icon" aria-label={t('dash.head.undo')} title={t('dash.head.undoTip')} disabled={!undo} onClick={() => st.undoEdit(dash.id)}>
          ↶
        </button>
        <button type="button" className="dash-btn icon" aria-label={t('dash.head.redo')} title={t('dash.head.redoTip')} disabled={!redo} onClick={() => st.redoEdit(dash.id)}>
          ↷
        </button>
        <ShareToggle isPrivate={!!dash.private} onChange={(p) => st.patchDash(dash.id, { private: p ? true : undefined })} />
        <span className="grow" />
        <button type="button" className={`dash-btn${dash.link.followView ? ' on' : ''}`} aria-pressed={dash.link.followView} title={t('dash.link.followTip')} onClick={() => link('followView')}>
          {t('dash.link.follow')}
        </button>
        <button type="button" className={`dash-btn${dash.link.driveView ? ' on' : ''}`} aria-pressed={dash.link.driveView} title={t('dash.link.driveTip')} onClick={() => link('driveView')}>
          {t('dash.link.drive')}
        </button>
        <button type="button" className={`dash-btn${dash.link.volume ? ' on' : ''}`} aria-pressed={dash.link.volume} title={t('dash.link.volumeTip')} onClick={() => link('volume')}>
          {t('dash.link.volume')}
        </button>
        <select aria-label={t('dash.head.theme')} title={t('dash.head.themeTip')} value={dash.theme} onChange={(e) => st.patchDash(dash.id, { theme: e.target.value as Dashboard['theme'] })}>
          <option value="auto">{t('dash.theme.auto')}</option>
          <option value="dark">{t('dash.theme.dark')}</option>
          <option value="light">{t('dash.theme.light')}</option>
        </select>
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="dash-btn"
            aria-haspopup="menu"
            aria-expanded={!!menu}
            data-action="more"
            title={t('dash.head.moreTip')}
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setMenu(menu ? null : { x: Math.max(8, Math.min(window.innerWidth - 230, r.left)), y: r.bottom + 2 });
            }}
          >
            {t('dash.head.more')} ▾
          </button>
          {menu && (
            <div className="dash-popover dash-menu" role="menu" style={{ left: menu.x, top: menu.y }} onMouseLeave={() => setMenu(null)}>
              {[
                ['png', () => void exportPage(dash.id, 'png')],
                ['pdf', () => void exportPage(dash.id, 'pdf')],
                ['json', () => exportJson(dash.id)],
                ['import', importJson],
                ['duplicate', () => {
                  const b = st.bundle(dash.id);
                  if (b) st.create(t('dash.copyOf', { name: dash.name }), b, dash.workspace);
                }],
                ['newDash', () => newDashboard(null)],
                ['delete', () => {
                  st.remove(dash.id);
                  toast(t('dash.deleted', { name: dash.name }));
                }],
              ].map(([k, run]) => (
                <button key={k as string} type="button" role="menuitem" data-action={k as string} onClick={() => {
                  setMenu(null);
                  (run as () => void)();
                }}>
                  {t(`dash.menu.${k as string}`)}
                </button>
              ))}
            </div>
          )}
        </div>
        <button type="button" className="dash-btn icon" aria-label={t('dash.head.layout')} title={t('dash.head.layoutTip')} onClick={() => useLayout.set(useLayout.get() === 'full' ? 'side' : 'full')}>
          ⤢
        </button>
        <button type="button" className="dash-btn icon" aria-label={t('dash.head.close')} title={t('dash.head.closeTip')} onClick={() => st.setShown(false)}>
          ✕
        </button>
      </div>
      <div className="dash-tabs" role="tablist" aria-label={t('dash.head.pages')}>
        {pages.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={p.id === page.id}
            className={`dash-tab${p.id === page.id ? ' on' : ''}`}
            title={p.drillThrough?.length ? t('dash.head.pageThrough') : t('dash.head.pageTip')}
            onClick={() => st.showPage(dash.id, p.id)}
            onDoubleClick={() => {
              if (!edit) return;
              const name = prompt(t('dash.head.renamePage'), p.name);
              if (name) st.patchPage(p.id, { name });
            }}
          >
            {p.name}
            {p.drillThrough?.length ? ' ⤵' : ''}
          </button>
        ))}
        {edit && (
          <>
            <button type="button" className="dash-tab" aria-label={t('dash.head.addPage')} title={t('dash.head.addPage')} onClick={() => st.addPage(dash.id)}>
              +
            </button>
            {pages.length > 1 && (
              <button type="button" className="dash-tab" aria-label={t('dash.head.removePage')} title={t('dash.head.removePage')} onClick={() => st.removePage(page.id)}>
                −
              </button>
            )}
          </>
        )}
      </div>
    </>
  );
}

/** Where the window sits: beside the view, or over all of it (kept in this browser). */
const useLayout = {
  get(): 'side' | 'full' {
    try {
      return localStorage.getItem('3dheat.dashboards.layout') === 'full' ? 'full' : 'side';
    } catch {
      return 'side';
    }
  },
  set(v: 'side' | 'full') {
    try {
      localStorage.setItem('3dheat.dashboards.layout', v);
    } catch {
      // Not kept: the window still changes now.
    }
    window.dispatchEvent(new Event('heat3d:dash-layout'));
  },
};

export function DashboardWindow() {
  useLang();
  const engine = useEngine();
  const shown = useDash((s) => s.shown);
  const open = useDash((s) => s.open);
  const dash = useDash((s) => s.dashboards.find((d) => d.id === s.open));
  const allPages = useDash((s) => s.pages);
  const pageId = useDash((s) => (open ? s.page[open] : undefined));
  const edit = useDash((s) => s.edit);
  const pages = useMemo(() => (dash ? allPages.filter((p) => p.dashId === dash.id).sort((a, b) => a.order - b.order) : []), [allPages, dash]);
  const page = pages.find((p) => p.id === pageId) ?? pages[0];
  const [layout, setLayout] = useState(useLayout.get());
  const [width, setWidth] = useState(() => Math.round((typeof window !== 'undefined' ? window.innerWidth : 1400) * 0.52));
  const scroll = useRef<HTMLDivElement>(null);
  const [inner, setInner] = useState(800);
  const [, themeTick] = useState(0);

  useEffect(() => {
    const on = () => setLayout(useLayout.get());
    window.addEventListener('heat3d:dash-layout', on);
    const mo = new MutationObserver(() => themeTick((n) => n + 1));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => {
      window.removeEventListener('heat3d:dash-layout', on);
      mo.disconnect();
    };
  }, []);
  useEffect(() => {
    dashClient.start(engine);
    startDashLink();
  }, [engine]);
  useEffect(() => {
    if (!shown || !dash || !page) return;
    return dashClient.watch(dash.id, page.id);
  }, [shown, dash?.id, page?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    const el = scroll.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setInner(el.clientWidth));
    ro.observe(el);
    setInner(el.clientWidth);
    return () => ro.disconnect();
  }, [shown, dash?.id, edit, layout]);

  if (!shown) return null;
  const onKey = (e: React.KeyboardEvent) => {
    const tgt = e.target as HTMLElement;
    const typing = tgt.tagName === 'INPUT' || tgt.tagName === 'TEXTAREA' || tgt.tagName === 'SELECT' || tgt.isContentEditable;
    const ctrl = e.ctrlKey || e.metaKey;
    // Ctrl+K (the palette) and F1 (help) stay the shell's.
    if ((ctrl && e.code === 'KeyK') || e.key === 'F1') return;
    e.stopPropagation();
    if (typing || !dash) return;
    const st = useDash.getState();
    if (ctrl && e.code === 'KeyZ' && !e.shiftKey) {
      e.preventDefault();
      st.undoEdit(dash.id);
    } else if (ctrl && (e.code === 'KeyY' || (e.code === 'KeyZ' && e.shiftKey))) {
      e.preventDefault();
      st.redoEdit(dash.id);
    } else if ((e.key === 'Delete' || e.key === 'Backspace') && st.edit && st.picked) {
      e.preventDefault();
      st.removeTile(st.picked);
    } else if (ctrl && e.code === 'KeyD' && st.edit && st.picked) {
      e.preventDefault();
      st.duplicateTile(st.picked);
    } else if (e.key === 'Escape') {
      if (st.inter[dash.id]?.selection) st.select(dash.id, null);
      else if (st.inter[dash.id]?.through) st.back(dash.id);
      else if (st.picked) st.pick(null);
    }
  };
  const cls = `dash-window ${layout === 'full' ? 'full' : 'side'} ${themeClass(dash)}`;
  return (
    <div className={cls} style={layout === 'full' ? undefined : { width }} role="dialog" aria-label={t('dash.window')} tabIndex={-1} onKeyDown={onKey}>
      {layout !== 'full' && (
        <div
          className="dash-resize"
          role="separator"
          aria-label={t('dash.head.width')}
          title={t('dash.head.width')}
          onPointerDown={(e) => {
            const x0 = e.clientX;
            const w0 = width;
            const move = (ev: PointerEvent) => setWidth(Math.max(380, Math.min(window.innerWidth - 80, w0 + (x0 - ev.clientX))));
            const up = () => {
              window.removeEventListener('pointermove', move);
              window.removeEventListener('pointerup', up);
            };
            window.addEventListener('pointermove', move);
            window.addEventListener('pointerup', up);
          }}
        />
      )}
      {!dash || !page ? (
        <>
          <div className="dash-head">
            <b>{t('dash.window')}</b>
            <span className="grow" />
            <button type="button" className="dash-btn icon" aria-label={t('dash.head.close')} title={t('dash.head.closeTip')} onClick={() => useDash.getState().setShown(false)}>
              ✕
            </button>
          </div>
          <Start />
        </>
      ) : (
        <>
          <Header dash={dash} pages={pages} page={page} />
          <div className="dash-body">
            {edit && <FieldList dash={dash} cat={dashClient.catalog(dash)} pageId={page.id} />}
            <div className="dash-main">
              <Chips dash={dash} page={page} />
              <div className="dash-scroll" ref={scroll}>
                <Canvas dash={dash} page={page} edit={edit} width={inner} />
              </div>
            </div>
            {edit && <Inspector dash={dash} page={page} />}
          </div>
        </>
      )}
    </div>
  );
}

/** Ctrl+K: the dashboards' entries (`ui/shell/commands.ts` adds them). */
export function dashboardCommands(): { id: string; label: string; run: () => void; words: string }[] {
  const st = useDash.getState();
  const words = t('dash.cmd.words');
  const out = [
    { id: 'dash.new', label: t('dash.cmd.new'), run: () => (st.setShown(true), void newDashboard(null)), words },
    { id: 'dash.show', label: st.shown ? t('dash.cmd.hide') : t('dash.cmd.show'), run: () => st.setShown(!st.shown), words },
    { id: 'dash.import', label: t('dash.cmd.import'), run: importJson, words },
  ];
  for (const tpl of templatesFor(useRaceStore.getState().tab)) out.push({ id: `dash.tpl.${tpl.id}`, label: t('dash.cmd.template', { name: tpl.name }), run: () => (st.setShown(true), void newDashboard(tpl.id)), words });
  for (const d of st.dashboards) out.push({ id: `dash.open.${d.id}`, label: t('dash.cmd.open', { name: d.name }), run: () => st.openDash(d.id), words });
  if (st.open && st.shown) {
    const id = st.open;
    out.push(
      { id: 'dash.png', label: t('dash.cmd.png'), run: () => void exportPage(id, 'png'), words },
      { id: 'dash.pdf', label: t('dash.cmd.pdf'), run: () => void exportPage(id, 'pdf'), words },
      { id: 'dash.json', label: t('dash.cmd.json'), run: () => exportJson(id), words },
      { id: 'dash.edit', label: st.edit ? t('dash.cmd.editOff') : t('dash.cmd.editOn'), run: () => st.setEdit(!st.edit), words },
    );
  }
  return out;
}
