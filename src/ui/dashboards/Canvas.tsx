/**
 * A dashboard page: its tiles on the 24-column grid, and each tile - its
 * title, its visual, its tools (drill, table view, the menu) and, while
 * editing, dragging by the title and sizing by the corner, snapped to the
 * grid with guides where an edge lines up with another tile's.
 *
 * A click on a mark selects it (Ctrl adds or takes away), which
 * cross-filters or highlights the page's other tiles; with drill mode on it
 * drills down a hierarchy instead. The right click opens the mark's menu:
 * drill down / up, drill through to a detail page, the table view, CSV.
 */

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { t } from '../../i18n';
import { dashClient } from '../../dashboards/client';
import { csvRows, downloadBlob, fileName, toCsv } from '../../dashboards/export';
import type { TileData } from '../../dashboards/finish';
import { GRID_COLS, ROW_PX, type Dashboard, type FieldRef, type Page, type Tile, type TileKind } from '../../dashboards/model';
import { cellLabels, drillDown, drillTargets, drillUp, expandDown, throughFilters, toggleSelection, type Selection, type TilePlan } from '../../dashboards/plan';
import { interOf, useDash } from '../../dashboards/store';
import { autoPlace, dropField } from './fieldDrop';
import { SlicerVisual, useTileData, Visual, type Pick } from './Visuals';

export const FIELD_MIME = 'application/x-heat3d-field';
export const MEASURE_MIME = 'application/x-heat3d-measure';
export const VISUAL_MIME = 'application/x-heat3d-visual';

const DECO: readonly TileKind[] = ['title', 'text', 'image'];

/** The cells of a tile's marks: what a pick on its visual means. */
function cellsOfPick(d: TileData, plan: TilePlan, p: Pick): { dims: TilePlan['dims']; cell: number } | null {
  const ax = plan.dims.slice(0, plan.axisDims);
  const A = ax.reduce((s, x) => s * (x.dim.k === 'cat' ? x.dim.size : x.dim.count), 1);
  switch (d.kind) {
    case 'chart': {
      if (d.chart.kind === 'scatter') {
        const nx = d.chart.groups.length;
        return { dims: plan.dims, cell: p.index + nx * (p.series ?? 0) };
      }
      const a = d.marks.gCell[p.index];
      if (a === undefined || a < 0) return null;
      const l = p.series !== undefined && p.series >= 0 ? d.marks.sLegend[p.series] : -1;
      if (l !== undefined && l >= 0 && plan.dims.length > plan.axisDims) return { dims: plan.dims, cell: a + A * l };
      return { dims: ax, cell: a };
    }
    case 'table':
      return d.rows[p.index] ? { dims: plan.dims, cell: d.rows[p.index].cell } : null;
    case 'pivot': {
      const r = d.rows[p.index];
      if (!r) return null;
      if (p.series !== undefined && d.cols[p.series] && plan.dims.length > plan.axisDims) return { dims: plan.dims, cell: r.cell + A * d.cols[p.series].index };
      return { dims: ax, cell: r.cell };
    }
    case 'items': {
      const it = d.items[p.index];
      return it && it.cell >= 0 ? { dims: ax, cell: it.cell } : null;
    }
    case 'box':
      return d.groups[p.index] && plan.dims.length ? { dims: ax, cell: d.groups[p.index].cell } : null;
    case 'bubble':
      return d.points[p.index] ? { dims: ax, cell: d.points[p.index].cell } : null;
    case 'bands':
      return { dims: plan.dims.slice(0, 1), cell: p.index };
    default:
      return null;
  }
}

/** Whether a visual's mark is in the selection. */
function selectedFn(d: TileData, plan: TilePlan | undefined, sel: Selection | null): ((i: number, s?: number) => boolean) | null {
  if (!sel || !plan) return null;
  const set = new Set(sel.cells);
  const key = JSON.stringify(sel.dims);
  return (i, s) => {
    const c = cellsOfPick(d, plan, { index: i, series: s, additive: false });
    if (!c) return false;
    if (JSON.stringify(c.dims.map((x) => x.dim)) === key) return set.has(c.cell);
    // A group of a chart with a legend picked by segment: the group is in when one of its segments is.
    const ax = plan.dims.slice(0, plan.axisDims);
    if (JSON.stringify(ax.map((x) => x.dim)) !== JSON.stringify(c.dims.map((x) => x.dim)) && sel.dims.length > ax.length) {
      const A = ax.reduce((m, x) => m * (x.dim.k === 'cat' ? x.dim.size : x.dim.count), 1);
      return sel.cells.some((cc) => cc % A === c.cell % A);
    }
    const A = ax.reduce((m, x) => m * (x.dim.k === 'cat' ? x.dim.size : x.dim.count), 1);
    return sel.cells.some((cc) => cc % A === c.cell);
  };
}

interface MenuState {
  x: number;
  y: number;
  items: { label: string; run: () => void; sep?: boolean }[];
}

function Menu({ m, close }: { m: MenuState; close: () => void }) {
  useEffect(() => {
    const off = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest?.('.dash-menu')) close();
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('pointerdown', off, true);
    window.addEventListener('keydown', esc, true);
    return () => {
      window.removeEventListener('pointerdown', off, true);
      window.removeEventListener('keydown', esc, true);
    };
  }, [close]);
  return (
    <div className="dash-popover dash-menu" role="menu" style={{ left: Math.min(m.x, window.innerWidth - 220), top: Math.min(m.y, window.innerHeight - 40 - m.items.length * 26) }}>
      {m.items.map((it, i) => (
        <div key={i}>
          {it.sep && <hr />}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              close();
              it.run();
            }}
          >
            {it.label}
          </button>
        </div>
      ))}
    </div>
  );
}

/** One tile: title, tools, visual. */
function TileView({ tile, dash, page, pages, edit, colW, picked, onDragStart, onResizeStart }: { tile: Tile; dash: Dashboard; page: Page; pages: Page[]; edit: boolean; colW: number; picked: boolean; onDragStart: (e: React.PointerEvent, t: Tile) => void; onResizeStart: (e: React.PointerEvent, t: Tile) => void }) {
  const data = useTileData(tile.id);
  const plan = dashClient.plans.get(tile.id);
  const inter = useDash((s) => s.inter[dash.id]);
  const it = interOf({ inter: inter ? { [dash.id]: inter } : {} }, dash.id, page.id);
  const sel = it.selection?.tileId === tile.id ? it.selection : null;
  const drill = it.drill[tile.id];
  const [table, setTable] = useState(false);
  const [drillOn, setDrillOn] = useState(false);
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [over, setOver] = useState(false);
  const colorMemory = useRef(new Map<string, number>()).current;
  const cat = dashClient.catalog(dash);
  const deco = DECO.includes(tile.kind);
  const axisRef: FieldRef | undefined = tile.axis?.[0];
  const hier = axisRef && cat?.byId.get(axisRef)?.levels ? cat.byId.get(axisRef)! : null;
  const st = useDash.getState;
  const x = tile.x * colW;
  const w = tile.w * colW - 6;
  const h = tile.h * ROW_PX - 6;
  const headH = deco ? 0 : 24;
  const bodyW = Math.max(10, w - 18);
  const bodyH = Math.max(10, h - headH - 8 - (data?.kind === 'chart' && dashClient.sampleOf(dash.source)?.stride !== 1 ? 14 : 0));

  const pickOf = (p: Pick): Selection | null => {
    if (!data || !plan || !cat) return null;
    const c = cellsOfPick(data, plan, p);
    if (!c) return null;
    return { tileId: tile.id, pageId: page.id, dims: c.dims.map((d) => d.dim), fields: c.dims.map((d) => d.field.id), cells: [c.cell], labels: [cellLabels(cat, c.dims, c.cell)] };
  };
  const onPick = (p: Pick) => {
    const next = pickOf(p);
    if (!next || !cat) return;
    if (drillOn && hier) {
      const label = next.labels[0][0];
      const d = drillDown(cat, axisRef, drill, label);
      if (d) st().setDrill(dash.id, tile.id, d);
      return;
    }
    st().select(dash.id, toggleSelection(it.selection, next, p.additive));
  };
  const onMenu = (p: Pick | null, mx: number, my: number) => {
    if (!cat) return;
    const next = p ? pickOf(p) : null;
    const items: MenuState['items'] = [];
    if (hier) {
      if (next) {
        const d = drillDown(cat, axisRef, drill, next.labels[0][0]);
        if (d) items.push({ label: t('dash.menu.drillInto', { name: next.labels[0][0] }), run: () => st().setDrill(dash.id, tile.id, d) });
      }
      const nx = drillDown(cat, axisRef, drill, null);
      if (nx) items.push({ label: t('dash.menu.nextLevel'), run: () => st().setDrill(dash.id, tile.id, nx) });
      const ex = expandDown(cat, axisRef, drill);
      if (ex) items.push({ label: t('dash.menu.expand'), run: () => st().setDrill(dash.id, tile.id, ex) });
      const up = drillUp(drill);
      if (drill && drill.level > 0) items.push({ label: t('dash.menu.drillUp'), run: () => st().setDrill(dash.id, tile.id, up) });
    }
    if (next) {
      for (const target of drillTargets(pages, next.fields, page.id))
        items.push({ label: t('dash.menu.through', { page: target.name, name: next.labels[0].join(' · ') }), run: () => st().drillThrough(dash.id, target.id, throughFilters(target, next, cat)), sep: items.length > 0 && !items.some((i) => i.label.startsWith('→')) });
      items.push({ label: t('dash.menu.select', { name: next.labels[0].join(' · ') }), run: () => st().select(dash.id, toggleSelection(it.selection, next, false)), sep: true });
    }
    if (it.selection) items.push({ label: t('dash.menu.clear'), run: () => st().select(dash.id, null) });
    if (data && csvRows(data).length) items.push({ label: t('dash.menu.csv'), run: () => downloadBlob(fileName(tile.title || tile.kind, 'csv'), toCsv(csvRows(data)), 'text/csv') });
    items.push({ label: table ? t('dash.menu.visual') : t('dash.menu.table'), run: () => setTable(!table) });
    if (items.length) setMenu({ x: mx, y: my, items });
  };

  const sample = dashClient.sampleOf(dash.source);
  const slicerField = tile.kind === 'slicer' && cat && tile.axis?.[0] ? (cat.byId.get(tile.axis[0]) ?? null) : null;
  const slicerValue = tile.kind === 'slicer' ? ([...(dash.filters ?? []), ...(page.filters ?? [])].find((f) => f.slicer === tile.id) ?? null) : null;
  let body: ReactNode;
  if (tile.kind === 'title' || tile.kind === 'text') body = <div className={`dash-text ${tile.opts?.size ?? (tile.kind === 'title' ? 'h1' : 'body')}`}>{tile.text || (edit ? t('dash.text.empty') : '')}</div>;
  else if (tile.kind === 'image') body = tile.src ? <img className="dash-image" src={tile.src} alt={tile.text ?? ''} /> : <div className="dash-empty">{t('dash.image.empty')}</div>;
  else if (tile.kind === 'slicer')
    body = <SlicerVisual tile={tile} field={slicerField} data={data?.kind === 'slicer' ? data : undefined} value={slicerValue} epochMs={cat?.epochMs ?? null} onChange={(f) => st().setSlicer(tile.id, f)} />;
  else if (!data) body = <div className="dash-empty">{cat ? t('dash.empty.counting') : t('dash.empty.noData')}</div>;
  else body = <Visual tile={tile} data={data} w={bodyW} h={bodyH} selected={selectedFn(data, plan, sel)} onPick={onPick} onMenu={onMenu} table={table} colorMemory={colorMemory} />;

  const level = hier && drill ? cat?.byId.get(hier.levels![drill.level])?.name : hier ? cat?.byId.get(hier.levels![0])?.name : null;
  return (
    <div
      className={`dash-tile${deco ? ' deco' : ''}${picked ? ' picked' : ''}${over ? ' drop' : ''}`}
      data-tile={tile.id}
      data-kind={tile.kind}
      style={{ left: x, top: tile.y * ROW_PX, width: w, height: h }}
      onPointerDown={() => edit && st().picked !== tile.id && st().pick(tile.id)}
      onDragOver={(e) => {
        if (!edit || deco) return;
        if ([...e.dataTransfer.types].some((ty) => ty === FIELD_MIME || ty === MEASURE_MIME)) {
          e.preventDefault();
          setOver(true);
        }
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        setOver(false);
        const f = e.dataTransfer.getData(FIELD_MIME);
        const m = e.dataTransfer.getData(MEASURE_MIME);
        if (!f && !m) return;
        e.preventDefault();
        e.stopPropagation();
        if (cat) dropField(tile, cat, f ? { field: f } : { measure: m }, null);
      }}
    >
      {!deco && (
        <div className="dash-tile-head" onPointerDown={(e) => edit && onDragStart(e, tile)}>
          <span className="dash-tile-title" title={tile.title || plan?.measures[0]?.name || ''}>
            {tile.title || (tile.kind === 'slicer' ? slicerField?.name : plan?.measures[0]?.name) || t(`dash.kind.${tile.kind}`)}
            {level && <span style={{ color: 'var(--text-faint)', fontWeight: 400 }}> · {level}</span>}
          </span>
          <span className="dash-tile-tools" onPointerDown={(e) => e.stopPropagation()}>
            {hier && (
              <>
                <button type="button" aria-label={t('dash.tool.drillUp')} title={t('dash.tool.drillUp')} disabled={!drill || drill.level === 0} onClick={() => st().setDrill(dash.id, tile.id, drillUp(drill))}>
                  ↑
                </button>
                <button type="button" className={drillOn ? 'on' : ''} aria-pressed={drillOn} aria-label={t('dash.tool.drillMode')} title={t('dash.tool.drillModeTip')} onClick={() => setDrillOn(!drillOn)}>
                  ↓
                </button>
                <button type="button" aria-label={t('dash.tool.nextLevel')} title={t('dash.tool.nextLevelTip')} onClick={() => cat && st().setDrill(dash.id, tile.id, drillDown(cat, axisRef, drill, null) ?? drill ?? null)}>
                  ⇊
                </button>
                <button type="button" aria-label={t('dash.tool.expand')} title={t('dash.tool.expandTip')} onClick={() => cat && st().setDrill(dash.id, tile.id, expandDown(cat, axisRef, drill) ?? drill ?? null)}>
                  ⤓
                </button>
              </>
            )}
            {tile.kind !== 'slicer' && tile.kind !== 'kpi' && (
              <button type="button" className={table ? 'on' : ''} aria-pressed={table} aria-label={t('dash.tool.table')} title={t('dash.tool.tableTip')} onClick={() => setTable(!table)}>
                ▤
              </button>
            )}
            <button type="button" aria-label={t('dash.tool.menu')} title={t('dash.tool.menuTip')} onClick={(e) => onMenu(null, e.clientX, e.clientY)}>
              ⋯
            </button>
            {edit && (
              <button type="button" aria-label={t('dash.tool.remove')} title={t('dash.tool.remove')} onClick={() => st().removeTile(tile.id)}>
                ✕
              </button>
            )}
          </span>
        </div>
      )}
      <div className={`dash-tile-body${dashClient.isIdle ? '' : ' stale'}`} style={{ padding: deco ? 6 : undefined }} onPointerDown={(e) => edit && deco && onDragStart(e, tile)}>
        {table && data && data.kind !== 'chart' ? <TableOf data={data} /> : body}
      </div>
      {!deco && sample && sample.stride > 1 && <div className="dash-tile-note">{t('dash.sampled', { n: sample.stride })}</div>}
      {edit && <div className="dash-resize-h" role="separator" aria-label={t('dash.tool.resize')} title={t('dash.tool.resize')} onPointerDown={(e) => onResizeStart(e, tile)} />}
      {menu && <Menu m={menu} close={() => setMenu(null)} />}
    </div>
  );
}

/** The numbers of any visual as a plain table (the accessibility twin). */
function TableOf({ data }: { data: TileData }) {
  const rows = csvRows(data);
  if (!rows.length) return null;
  return (
    <div className="dash-table-wrap">
      <table className="dash-table">
        <thead>
          <tr>
            {rows[0].map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(1, 2001).map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j} className={j ? 'num' : ''}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface Drag {
  id: string;
  mode: 'move' | 'size';
  x0: number;
  y0: number;
  tile: Tile;
}

/** A page's grid of tiles; editing moves and sizes them. */
export function Canvas({ dash, page, edit, width }: { dash: Dashboard; page: Page; edit: boolean; width: number }) {
  const tiles = useDash((s) => s.tiles);
  const pages = useDash((s) => s.pages);
  const picked = useDash((s) => s.picked);
  const mine = useMemo(() => tiles.filter((x) => x.pageId === page.id), [tiles, page.id]);
  const dashPages = useMemo(() => pages.filter((p) => p.dashId === dash.id).sort((a, b) => a.order - b.order), [pages, dash.id]);
  const colW = Math.max(8, (width - 16) / GRID_COLS);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [ghost, setGhost] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const host = useRef<HTMLDivElement>(null);
  const rows = Math.max(12, mine.reduce((m, x) => Math.max(m, x.y + x.h), 0) + (edit ? 6 : 1));

  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => {
      const dx = Math.round((e.clientX - drag.x0) / colW);
      const dy = Math.round((e.clientY - drag.y0) / ROW_PX);
      const t0 = drag.tile;
      const patch =
        drag.mode === 'move'
          ? { x: Math.max(0, Math.min(GRID_COLS - t0.w, t0.x + dx)), y: Math.max(0, t0.y + dy) }
          : { w: Math.max(1, Math.min(GRID_COLS - t0.x, t0.w + dx)), h: Math.max(1, t0.h + dy) };
      useDash.getState().preview([{ id: drag.id, patch }]);
    };
    const up = () => {
      useDash.getState().settle();
      setDrag(null);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [drag, colW]);

  const start = (mode: Drag['mode']) => (e: React.PointerEvent, tile: Tile) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    useDash.getState().pick(tile.id);
    setDrag({ id: tile.id, mode, x0: e.clientX, y0: e.clientY, tile });
  };

  // Alignment guides: where the dragged tile's edges meet another tile's.
  const guides: ReactNode[] = [];
  if (drag) {
    const cur = mine.find((x) => x.id === drag.id);
    if (cur) {
      const xs = new Set<number>();
      const ys = new Set<number>();
      for (const o of mine) {
        if (o.id === cur.id) continue;
        for (const e of [o.x, o.x + o.w]) if (e === cur.x || e === cur.x + cur.w) xs.add(e);
        for (const e of [o.y, o.y + o.h]) if (e === cur.y || e === cur.y + cur.h) ys.add(e);
      }
      for (const gx of xs) guides.push(<div key={`x${gx}`} className="dash-guide v" style={{ left: gx * colW - 3, top: 0, height: rows * ROW_PX }} />);
      for (const gy of ys) guides.push(<div key={`y${gy}`} className="dash-guide h" style={{ top: gy * ROW_PX - 3, left: 0, width: GRID_COLS * colW }} />);
    }
  }

  const cellAt = (e: React.DragEvent) => {
    const r = host.current!.getBoundingClientRect();
    return { x: Math.max(0, Math.min(GRID_COLS - 1, Math.floor((e.clientX - r.left) / colW))), y: Math.max(0, Math.floor((e.clientY - r.top) / ROW_PX)) };
  };
  return (
    <div
      ref={host}
      className={`dash-canvas${edit ? ' editing' : ''}`}
      data-page={page.id}
      style={{ height: rows * ROW_PX }}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) {
          if (edit) useDash.getState().pick(null);
          else if (useDash.getState().inter[dash.id]?.selection) useDash.getState().select(dash.id, null);
        }
      }}
      onDragOver={(e) => {
        if (!edit) return;
        const types = [...e.dataTransfer.types];
        if (!types.includes(VISUAL_MIME) && !types.includes(FIELD_MIME) && !types.includes(MEASURE_MIME)) return;
        e.preventDefault();
        const c = cellAt(e);
        setGhost({ x: c.x, y: c.y, w: 8, h: 8 });
      }}
      onDragLeave={() => setGhost(null)}
      onDrop={(e) => {
        setGhost(null);
        if (!edit) return;
        const c = cellAt(e);
        const kind = e.dataTransfer.getData(VISUAL_MIME) as TileKind;
        const f = e.dataTransfer.getData(FIELD_MIME);
        const m = e.dataTransfer.getData(MEASURE_MIME);
        e.preventDefault();
        if (kind) useDash.getState().addTile(page.id, kind, c);
        else if (f || m) {
          const cat = dashClient.catalog(dash);
          if (cat) autoPlace(page.id, cat, f ? { field: f } : { measure: m }, c);
        }
      }}
    >
      {mine.map((tile) => (
        <TileView key={tile.id} tile={tile} dash={dash} page={page} pages={dashPages} edit={edit} colW={colW} picked={edit && picked === tile.id} onDragStart={start('move')} onResizeStart={start('size')} />
      ))}
      {guides}
      {ghost && <div className="dash-ghost" style={{ left: ghost.x * colW, top: ghost.y * ROW_PX, width: ghost.w * colW - 6, height: ghost.h * ROW_PX - 6 }} />}
      {!mine.length && <div className="dash-empty" style={{ position: 'absolute', inset: 0 }}>{edit ? t('dash.canvas.emptyEdit') : t('dash.canvas.empty')}</div>}
    </div>
  );
}

/** A dashboard page by itself (a document's live block): counted while it is on screen. */
export function DashboardPage({ dashId, pageId, width }: { dashId: string; pageId: string; width: number }) {
  const dash = useDash((s) => s.dashboards.find((d) => d.id === dashId));
  const page = useDash((s) => s.pages.find((p) => p.id === pageId));
  useEffect(() => dashClient.watch(dashId, pageId), [dashId, pageId]);
  if (!dash || !page) return <div className="dash-empty">{t('dash.embed.gone')}</div>;
  const theme = dash.theme === 'auto' ? (document.documentElement.dataset.theme === 'light' ? 'theme-light' : 'theme-dark') : `theme-${dash.theme}`;
  return (
    <div className={`dash-embed ${theme}`} style={{ width }}>
      <Canvas dash={dash} page={page} edit={false} width={width} />
    </div>
  );
}
