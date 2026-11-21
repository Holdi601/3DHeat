/**
 * Building a dashboard: the field list (the data's fields, the dashboard's
 * measures, calculated columns, bins and hierarchies) with the visuals to
 * drag onto the page, and the settings of what is picked - a tile's visual,
 * its slots (axis, legend, values, size: drop a field on one), options and
 * filters; with nothing picked the page's and the dashboard's: filters,
 * drill-through, theme, the link to the 3D view, measures and the rest.
 */

import { useMemo, useState, type ReactNode } from 'react';
import { t } from '../../i18n';
import { dashClient } from '../../dashboards/client';
import type { Catalog, FieldInfo } from '../../dashboards/fields';
import { AGG_KINDS, newId, TILE_KINDS, type AggKind, type Dashboard, type FilterDef, type FilterOp, type MeasureDef, type Page, type Tile, type TileKind, type TileOpts, type ValueRef } from '../../dashboards/model';
import { defaultInteract, measureName } from '../../dashboards/plan';
import { dashboardSources } from '../../dashboards/sources';
import { useDash } from '../../dashboards/store';
import { FIELD_MIME, MEASURE_MIME, VISUAL_MIME } from './Canvas';
import { dropField, type Slot } from './fieldDrop';

const ICON: Record<string, string> = { cat: 'Aa', num: '#', time: '◷', hier: '⊞', bins: '▥', measure: 'Σ', calc: 'ƒ' };

function iconOf(f: FieldInfo): string {
  if (f.group === 'hier') return ICON.hier;
  if (f.group === 'bins') return ICON.bins;
  if (f.group === 'calc') return ICON.calc;
  if (f.time) return ICON.time;
  return f.kind === 'cat' ? ICON.cat : ICON.num;
}

/** The visuals to drag onto the page (a click adds one at the first free row). */
function Visuals({ pageId }: { pageId: string }) {
  const tiles = useDash((s) => s.tiles);
  const add = (k: TileKind) => {
    const y = tiles.filter((x) => x.pageId === pageId).reduce((m, x) => Math.max(m, x.y + x.h), 0);
    useDash.getState().addTile(pageId, k, { x: 0, y });
  };
  return (
    <div className="dash-kinds">
      {TILE_KINDS.map((k) => (
        <button
          key={k}
          type="button"
          className="dash-btn"
          draggable
          data-visual={k}
          title={t(`dash.kindTip.${k}`)}
          onDragStart={(e) => {
            e.dataTransfer.setData(VISUAL_MIME, k);
            e.dataTransfer.effectAllowed = 'copy';
          }}
          onClick={() => add(k)}
        >
          {t(`dash.kind.${k}`)}
        </button>
      ))}
    </div>
  );
}

/** The fields and measures, to drag onto a tile or a slot. */
export function FieldList({ dash, cat, pageId }: { dash: Dashboard; cat: Catalog | null; pageId: string }) {
  const [q, setQ] = useState('');
  const groups: [string, FieldInfo[]][] = useMemo(() => {
    if (!cat) return [];
    const m = (f: FieldInfo) => !q || f.name.toLowerCase().includes(q.toLowerCase());
    return (['roles', 'columns', 'calc', 'bins', 'hier'] as const).map((g) => [g, cat.fields.filter((f) => f.group === g && m(f))] as [string, FieldInfo[]]).filter((x) => x[1].length);
  }, [cat, q]);
  const ms = (dash.measures ?? []).filter((m) => !q || m.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="dash-side" data-help="fields">
      <h4>{t('dash.side.visuals')}</h4>
      <Visuals pageId={pageId} />
      <h4>{t('dash.side.fields')}</h4>
      <input type="text" aria-label={t('dash.side.search')} placeholder={t('dash.side.search')} value={q} onChange={(e) => setQ(e.target.value)} style={{ width: '100%' }} />
      {!cat && <div className="dash-empty">{t('dash.empty.noData')}</div>}
      {groups.map(([g, fs]) => (
        <div key={g}>
          <h4>{t(`dash.side.group.${g}`)}</h4>
          {fs.map((f) => (
            <div
              key={f.id}
              className="dash-field"
              draggable
              data-field={f.id}
              title={t('dash.side.dragTip', { name: f.name })}
              onDragStart={(e) => {
                e.dataTransfer.setData(FIELD_MIME, f.id);
                e.dataTransfer.effectAllowed = 'copy';
              }}
            >
              <i>{iconOf(f)}</i>
              <span>{f.name}</span>
            </div>
          ))}
        </div>
      ))}
      {ms.length > 0 && <h4>{t('dash.side.group.measures')}</h4>}
      {ms.map((m) => (
        <div
          key={m.id}
          className="dash-field"
          draggable
          data-measure={m.id}
          title={t('dash.side.dragTip', { name: m.name })}
          onDragStart={(e) => {
            e.dataTransfer.setData(MEASURE_MIME, m.id);
            e.dataTransfer.effectAllowed = 'copy';
          }}
        >
          <i>{ICON.measure}</i>
          <span>{m.name}</span>
        </div>
      ))}
    </div>
  );
}

function Row({ label, tip, children }: { label: string; tip?: string; children: ReactNode }) {
  return (
    <label className="row" title={tip}>
      <span>{label}</span>
      {children}
    </label>
  );
}

/** A slot fields are dropped on: its items, each removable. */
function SlotBox({ label, tip, items, onDrop, testId }: { label: string; tip: string; items: ReactNode[]; onDrop: (d: { field: string } | { measure: string }) => void; testId: string }) {
  const [over, setOver] = useState(false);
  return (
    <div>
      <h4 title={tip}>{label}</h4>
      <div
        className={`dash-slot${over ? ' over' : ''}`}
        data-slot={testId}
        title={tip}
        onDragOver={(e) => {
          const ty = [...e.dataTransfer.types];
          if (ty.includes(FIELD_MIME) || ty.includes(MEASURE_MIME)) {
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
          onDrop(f ? { field: f } : { measure: m });
        }}
      >
        {items.length ? items : <span className="hint">{t('dash.slot.drop')}</span>}
      </div>
    </div>
  );
}

const fieldName = (cat: Catalog | null, id: string | undefined) => (id ? (cat?.byId.get(id)?.name ?? id) : '');

/** One value of a tile: its measure (saved or quick), with the aggregation to change. */
function ValueItem({ v, dash, cat, onChange, onRemove }: { v: ValueRef; dash: Dashboard; cat: Catalog | null; onChange: (v: ValueRef) => void; onRemove: () => void }) {
  if ('m' in v) {
    const m = dash.measures?.find((x) => x.id === v.m);
    return (
      <div className="dash-slot-item">
        <span>Σ {m?.name ?? v.m}</span>
        <button type="button" aria-label={t('dash.slot.remove')} title={t('dash.slot.remove')} onClick={onRemove}>
          ✕
        </button>
      </div>
    );
  }
  const name = measureName({ id: '', name: v.name ?? '', agg: v.agg, field: v.field, p: v.p, where: v.where }, cat);
  return (
    <div className="dash-slot-item" style={{ flexWrap: 'wrap' }}>
      <span title={name}>{name}</span>
      <select aria-label={t('dash.slot.agg')} title={t('dash.slot.aggTip')} value={v.agg} onChange={(e) => onChange({ ...v, agg: e.target.value as AggKind })}>
        {AGG_KINDS.filter((k) => k !== 'ratio' && k !== 'calc').map((k) => (
          <option key={k} value={k}>
            {t(`dash.agg.${k}`)}
          </option>
        ))}
      </select>
      {v.agg === 'pct' && <input type="number" aria-label={t('dash.slot.p')} title={t('dash.slot.p')} min={1} max={99} value={v.p ?? 90} style={{ width: 48 }} onChange={(e) => onChange({ ...v, p: Number(e.target.value) })} />}
      <button type="button" aria-label={t('dash.slot.remove')} title={t('dash.slot.remove')} onClick={onRemove}>
        ✕
      </button>
      {(v.agg === 'rate' || v.where !== undefined) && (
        <input type="text" aria-label={t('dash.slot.where')} title={t('dash.slot.whereTip')} placeholder={t('dash.slot.wherePh')} value={v.where ?? ''} style={{ width: '100%' }} onChange={(e) => onChange({ ...v, where: e.target.value })} />
      )}
    </div>
  );
}

/** Filters of a level (dashboard, page, tile, a KPI's comparison set): field, how, values. */
export function FilterPane({ filters, cat, onChange, label }: { filters: FilterDef[]; cat: Catalog | null; onChange: (fs: FilterDef[]) => void; label: string }) {
  const [adding, setAdding] = useState('');
  const own = filters.filter((f) => !f.slicer);
  const put = (f: FilterDef) => onChange(filters.map((x) => (x.id === f.id ? f : x)));
  return (
    <div className="dash-filterpane">
      <h4>{label}</h4>
      {own.map((f) => {
        const fld = cat?.byId.get(f.field);
        const labels = fld?.labels ?? [];
        return (
          <div className="f" key={f.id}>
            <div className="top">
              <span title={fld?.name ?? f.field}>{f.op === 'expr' ? t('dash.filter.expr') : (fld?.name ?? f.field)}</span>
              <select aria-label={t('dash.filter.op')} title={t('dash.filter.opTip')} value={f.op} onChange={(e) => put({ ...f, op: e.target.value as FilterOp })}>
                {(['in', 'out', 'range', 'search', 'relative', 'expr'] as FilterOp[]).map((op) => (
                  <option key={op} value={op}>
                    {t(`dash.filter.ops.${op}`)}
                  </option>
                ))}
              </select>
              <button type="button" className="dash-btn icon" aria-label={t('dash.filter.remove')} title={t('dash.filter.remove')} onClick={() => onChange(filters.filter((x) => x.id !== f.id))}>
                ✕
              </button>
            </div>
            {(f.op === 'in' || f.op === 'out') && (
              <div className="dash-values">
                {labels.slice(0, 300).map((l) => (
                  <label key={l}>
                    <input type="checkbox" checked={f.values?.includes(l) ?? false} onChange={(e) => put({ ...f, values: e.target.checked ? [...(f.values ?? []), l] : (f.values ?? []).filter((x) => x !== l) })} />
                    {l}
                  </label>
                ))}
              </div>
            )}
            {f.op === 'range' && (
              <div className="dash-range">
                <input type="number" aria-label={t('dash.slicer.from')} value={f.lo ?? ''} placeholder={String(fld?.lo ?? '')} onChange={(e) => put({ ...f, lo: e.target.value === '' ? undefined : Number(e.target.value) })} />
                <input type="number" aria-label={t('dash.slicer.to')} value={f.hi ?? ''} placeholder={String(fld?.hi ?? '')} onChange={(e) => put({ ...f, hi: e.target.value === '' ? undefined : Number(e.target.value) })} />
              </div>
            )}
            {f.op === 'search' && <input type="text" aria-label={t('dash.slicer.search')} value={f.text ?? ''} onChange={(e) => put({ ...f, text: e.target.value })} />}
            {f.op === 'relative' && (
              <div className="dash-range">
                <input type="number" aria-label={t('dash.slicer.relN')} title={t('dash.filter.relTip')} value={f.n ?? ''} onChange={(e) => put({ ...f, n: Number(e.target.value) })} />
                <select aria-label={t('dash.slicer.relUnit')} value={f.unit ?? 'min'} onChange={(e) => put({ ...f, unit: e.target.value as FilterDef['unit'] })}>
                  <option value="sec">{t('dash.slicer.unit.sec')}</option>
                  <option value="min">{t('dash.slicer.unit.min')}</option>
                  <option value="matches">{t('dash.slicer.unit.matches')}</option>
                </select>
              </div>
            )}
            {f.op === 'expr' && <input type="text" aria-label={t('dash.filter.expr')} title={t('dash.filter.exprTip')} placeholder='weapon == "rifle" and speed > 5' value={f.expr ?? ''} onChange={(e) => put({ ...f, expr: e.target.value })} />}
          </div>
        );
      })}
      <div className="row">
        <select aria-label={t('dash.filter.add')} title={t('dash.filter.addTip')} value={adding} onChange={(e) => setAdding(e.target.value)}>
          <option value="">{t('dash.filter.pick')}</option>
          <option value="@expr">{t('dash.filter.expr')}</option>
          {cat?.fields
            .filter((f) => f.group !== 'hier')
            .map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
        </select>
        <button
          type="button"
          className="dash-btn"
          disabled={!adding}
          onClick={() => {
            const fld = cat?.byId.get(adding);
            const op: FilterOp = adding === '@expr' ? 'expr' : fld?.kind === 'cat' ? 'in' : 'range';
            onChange([...filters, { id: newId('f'), field: adding === '@expr' ? '' : adding, op }]);
            setAdding('');
          }}
        >
          {t('dash.filter.addBtn')}
        </button>
      </div>
    </div>
  );
}

const KIND_OPTS: Partial<Record<TileKind, (keyof TileOpts)[]>> = {
  bar: ['stack', 'top', 'sort', 'interact'],
  column: ['stack', 'top', 'sort', 'interact'],
  line: ['bins', 'clock', 'interact'],
  area: ['bins', 'clock', 'stack', 'interact'],
  pie: ['top', 'interact'],
  treemap: ['top', 'interact'],
  histogram: ['bins', 'interact'],
  scatter: ['top', 'interact'],
  density: ['bins', 'interact'],
  matrix: ['top', 'interact'],
  box: ['top', 'whiskers', 'interact'],
  bands: ['bins', 'clock', 'interact'],
  table: ['top', 'sort', 'dataBars', 'colorScale', 'interact'],
  pivot: ['top', 'colorScale', 'interact'],
  topn: ['top', 'sort', 'interact'],
  minimap: ['interact'],
  kpi: ['compare', 'spark', 'interact'],
  slicer: ['slicer', 'allPages'],
  title: ['size'],
  text: ['size'],
};

function OptControl({ k, tile, set }: { k: keyof TileOpts; tile: Tile; set: (o: Partial<TileOpts>) => void }) {
  const o = tile.opts ?? {};
  const sel = <T extends string>(val: T, list: readonly T[], key: keyof TileOpts) => (
    <select aria-label={t(`dash.opt.${key}`)} value={val} onChange={(e) => set({ [key]: e.target.value } as Partial<TileOpts>)}>
      {list.map((x) => (
        <option key={x} value={x}>
          {t(`dash.opt.${key}.${x}`)}
        </option>
      ))}
    </select>
  );
  const check = (key: keyof TileOpts, dflt: boolean) => <input type="checkbox" aria-label={t(`dash.opt.${key}`)} checked={(o[key] as boolean | undefined) ?? dflt} onChange={(e) => set({ [key]: e.target.checked } as Partial<TileOpts>)} />;
  const num = (key: keyof TileOpts, dflt: number, lo: number, hi: number) => <input type="number" aria-label={t(`dash.opt.${key}`)} min={lo} max={hi} value={(o[key] as number | undefined) ?? dflt} onChange={(e) => set({ [key]: Number(e.target.value) } as Partial<TileOpts>)} />;
  let c: ReactNode;
  switch (k) {
    case 'stack':
      c = sel(o.stack ?? 'none', ['none', 'stacked', 'percent'] as const, 'stack');
      break;
    case 'sort':
      c = sel(o.sort ?? 'value-desc', ['value-desc', 'value-asc', 'label', 'natural'] as const, 'sort');
      break;
    case 'interact':
      c = sel(o.interact ?? defaultInteract(tile.kind), ['filter', 'highlight', 'none'] as const, 'interact');
      break;
    case 'compare':
      c = sel(o.compare ?? 'baseline', ['none', 'baseline', 'set'] as const, 'compare');
      break;
    case 'clock':
      c = sel(o.clock ?? 'match', ['match', 'real'] as const, 'clock');
      break;
    case 'whiskers':
      c = sel(o.whiskers ?? 'p5', ['p5', 'minmax'] as const, 'whiskers');
      break;
    case 'size':
      c = sel(o.size ?? (tile.kind === 'title' ? 'h1' : 'body'), ['h1', 'h2', 'body'] as const, 'size');
      break;
    case 'slicer':
      c = sel(o.slicer ?? 'dropdown', ['dropdown', 'list', 'buttons', 'range', 'date', 'search', 'relative'] as const, 'slicer');
      break;
    case 'top':
      c = num('top', tile.kind === 'pie' ? 5 : 12, 2, 500);
      break;
    case 'bins':
      c = num('bins', 24, 4, 200);
      break;
    case 'spark':
      c = check('spark', true);
      break;
    case 'dataBars':
      c = check('dataBars', false);
      break;
    case 'colorScale':
      c = check('colorScale', tile.kind === 'pivot');
      break;
    case 'allPages':
      c = check('allPages', false);
      break;
    default:
      return null;
  }
  return (
    <Row label={t(`dash.opt.${k}`)} tip={t(`dash.optTip.${k}`)}>
      {c}
    </Row>
  );
}

/** The picked tile's settings. */
function TileSettings({ tile, dash, cat }: { tile: Tile; dash: Dashboard; cat: Catalog | null }) {
  const st = useDash.getState();
  const patch = (p: Partial<Tile>) => st.patchTile(tile.id, p);
  const setOpts = (o: Partial<TileOpts>) => patch({ opts: { ...tile.opts, ...o } });
  const drop = (slot: Slot) => (d: { field: string } | { measure: string }) => cat && dropField(tile, cat, d, slot);
  const deco = tile.kind === 'title' || tile.kind === 'text' || tile.kind === 'image';
  const two = tile.kind === 'density';
  return (
    <>
      <h4>{t('dash.insp.visual')}</h4>
      <div className="dash-kinds">
        {TILE_KINDS.map((k) => (
          <button key={k} type="button" className={`dash-btn${tile.kind === k ? ' on' : ''}`} aria-pressed={tile.kind === k} title={t(`dash.kindTip.${k}`)} onClick={() => patch({ kind: k })}>
            {t(`dash.kind.${k}`)}
          </button>
        ))}
      </div>
      {tile.kind !== 'title' && tile.kind !== 'text' && (
        <Row label={t('dash.insp.title')} tip={t('dash.insp.titleTip')}>
          <input type="text" value={tile.title ?? ''} onChange={(e) => patch({ title: e.target.value })} />
        </Row>
      )}
      {(tile.kind === 'title' || tile.kind === 'text') && (
        <>
          <h4>{t('dash.insp.text')}</h4>
          <textarea aria-label={t('dash.insp.text')} rows={5} style={{ width: '100%' }} value={tile.text ?? ''} onChange={(e) => patch({ text: e.target.value })} />
        </>
      )}
      {tile.kind === 'image' && (
        <>
          <h4>{t('dash.insp.image')}</h4>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            aria-label={t('dash.insp.image')}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f || f.size > 2_500_000) return;
              const r = new FileReader();
              r.onload = () => typeof r.result === 'string' && patch({ src: r.result });
              r.readAsDataURL(f);
            }}
          />
          <Row label={t('dash.insp.alt')}>
            <input type="text" value={tile.text ?? ''} onChange={(e) => patch({ text: e.target.value })} />
          </Row>
        </>
      )}
      {!deco && tile.kind !== 'minimap' && tile.kind !== 'kpi' && (
        <SlotBox
          testId="axis"
          label={tile.kind === 'slicer' ? t('dash.slot.field') : tile.kind === 'table' || tile.kind === 'pivot' ? t('dash.slot.rows') : two ? t('dash.slot.x') : t('dash.slot.axis')}
          tip={t('dash.slot.axisTip')}
          onDrop={drop('axis')}
          items={(two ? (tile.axis ?? []).slice(0, 1) : (tile.axis ?? [])).map((a, i) => (
            <div className="dash-slot-item" key={a + i}>
              <span>{fieldName(cat, a)}</span>
              <button type="button" aria-label={t('dash.slot.remove')} title={t('dash.slot.remove')} onClick={() => patch({ axis: (tile.axis ?? []).filter((_x, j) => j !== i) })}>
                ✕
              </button>
            </div>
          ))}
        />
      )}
      {two && (
        <SlotBox
          testId="axis2"
          label={t('dash.slot.y')}
          tip={t('dash.slot.axisTip')}
          onDrop={drop('axis2')}
          items={tile.axis?.[1] ? [<div className="dash-slot-item" key="y"><span>{fieldName(cat, tile.axis[1])}</span></div>] : []}
        />
      )}
      {!deco && ['bar', 'column', 'line', 'area', 'histogram', 'matrix', 'pivot'].includes(tile.kind) && (
        <SlotBox
          testId="legend"
          label={tile.kind === 'pivot' || tile.kind === 'matrix' ? t('dash.slot.columns') : t('dash.slot.legend')}
          tip={t('dash.slot.legendTip')}
          onDrop={drop('legend')}
          items={
            tile.legend
              ? [
                  <div className="dash-slot-item" key="l">
                    <span>{fieldName(cat, tile.legend)}</span>
                    <button type="button" aria-label={t('dash.slot.remove')} title={t('dash.slot.remove')} onClick={() => patch({ legend: undefined })}>
                      ✕
                    </button>
                  </div>,
                ]
              : []
          }
        />
      )}
      {!deco && tile.kind !== 'slicer' && tile.kind !== 'minimap' && tile.kind !== 'density' && (
        <SlotBox
          testId="values"
          label={tile.kind === 'scatter' ? t('dash.slot.xy') : t('dash.slot.values')}
          tip={t('dash.slot.valuesTip')}
          onDrop={drop('values')}
          items={(tile.values ?? []).map((v, i) => (
            <ValueItem
              key={i}
              v={v}
              dash={dash}
              cat={cat}
              onChange={(nv) => patch({ values: (tile.values ?? []).map((x, j) => (j === i ? nv : x)) })}
              onRemove={() => patch({ values: (tile.values ?? []).filter((_x, j) => j !== i) })}
            />
          ))}
        />
      )}
      {tile.kind === 'scatter' && (
        <SlotBox testId="size" label={t('dash.slot.size')} tip={t('dash.slot.sizeTip')} onDrop={drop('size')} items={tile.size ? [<ValueItem key="s" v={tile.size} dash={dash} cat={cat} onChange={(v) => patch({ size: v })} onRemove={() => patch({ size: undefined })} />] : []} />
      )}
      {(KIND_OPTS[tile.kind] ?? []).length > 0 && <h4>{t('dash.insp.options')}</h4>}
      {(KIND_OPTS[tile.kind] ?? []).map((k) => (
        <OptControl key={k} k={k} tile={tile} set={setOpts} />
      ))}
      {tile.kind === 'kpi' && tile.opts?.compare === 'set' && (
        <>
          <Row label={t('dash.opt.compareLabel')}>
            <input type="text" value={tile.opts?.compareLabel ?? ''} onChange={(e) => setOpts({ compareLabel: e.target.value })} />
          </Row>
          <FilterPane label={t('dash.insp.compareSet')} filters={tile.opts?.compareFilters ?? []} cat={cat} onChange={(fs) => setOpts({ compareFilters: fs })} />
        </>
      )}
      {!deco && tile.kind !== 'slicer' && <FilterPane label={t('dash.insp.tileFilters')} filters={tile.filters ?? []} cat={cat} onChange={(fs) => st.setFilters({ tileId: tile.id }, fs)} />}
      <div className="row" style={{ marginTop: 10 }}>
        <button type="button" className="dash-btn" onClick={() => st.duplicateTile(tile.id)}>
          {t('dash.insp.duplicate')}
        </button>
        <button type="button" className="dash-btn" onClick={() => st.removeTile(tile.id)}>
          {t('dash.insp.remove')}
        </button>
      </div>
    </>
  );
}

/** A dashboard's measures: name, aggregation, field, condition; ratios and calculated ones. */
function MeasuresEditor({ dash, cat }: { dash: Dashboard; cat: Catalog | null }) {
  const st = useDash.getState();
  const ms = dash.measures ?? [];
  const set = (list: MeasureDef[]) => st.patchDash(dash.id, { measures: list });
  const put = (m: MeasureDef) => set(ms.map((x) => (x.id === m.id ? m : x)));
  return (
    <>
      <h4 title={t('dash.insp.measuresTip')}>{t('dash.insp.measures')}</h4>
      {ms.map((m) => (
        <div className="dash-filterpane" key={m.id}>
          <div className="f">
            <div className="top">
              <input type="text" aria-label={t('dash.m.name')} value={m.name} onChange={(e) => put({ ...m, name: e.target.value })} />
              <select aria-label={t('dash.slot.agg')} title={t('dash.slot.aggTip')} value={m.agg} onChange={(e) => put({ ...m, agg: e.target.value as AggKind })}>
                {AGG_KINDS.map((k) => (
                  <option key={k} value={k}>
                    {t(`dash.agg.${k}`)}
                  </option>
                ))}
              </select>
              <button type="button" className="dash-btn icon" aria-label={t('dash.m.remove')} title={t('dash.m.remove')} onClick={() => set(ms.filter((x) => x.id !== m.id))}>
                ✕
              </button>
            </div>
            {['distinct', 'sum', 'mean', 'median', 'pct', 'min', 'max'].includes(m.agg) && (
              <select aria-label={t('dash.m.field')} value={m.field ?? ''} onChange={(e) => put({ ...m, field: e.target.value })}>
                <option value="">{t('dash.filter.pick')}</option>
                {cat?.fields
                  .filter((f) => f.group !== 'hier' && (m.agg === 'distinct' || (f.kind === 'num' && !f.bin)))
                  .map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
              </select>
            )}
            {m.agg === 'pct' && <input type="number" aria-label={t('dash.slot.p')} min={1} max={99} value={m.p ?? 90} onChange={(e) => put({ ...m, p: Number(e.target.value) })} />}
            {m.agg === 'ratio' && (
              <div className="dash-range">
                {(['num', 'den'] as const).map((k) => (
                  <select key={k} aria-label={t(`dash.m.${k}`)} title={t(`dash.m.${k}`)} value={m[k] ?? ''} onChange={(e) => put({ ...m, [k]: e.target.value })}>
                    <option value="">{t(`dash.m.${k}`)}</option>
                    {ms
                      .filter((x) => x.id !== m.id)
                      .map((x) => (
                        <option key={x.id} value={x.id}>
                          {x.name}
                        </option>
                      ))}
                  </select>
                ))}
              </div>
            )}
            {m.agg === 'calc' ? (
              <input type="text" aria-label={t('dash.m.expr')} title={t('dash.m.exprTip')} placeholder="kills() / max(deaths(), 1)" value={m.expr ?? ''} onChange={(e) => put({ ...m, expr: e.target.value })} />
            ) : (
              m.agg !== 'ratio' && <input type="text" aria-label={t('dash.slot.where')} title={t('dash.slot.whereTip')} placeholder={t('dash.slot.wherePh')} value={m.where ?? ''} onChange={(e) => put({ ...m, where: e.target.value || undefined })} />
            )}
          </div>
        </div>
      ))}
      <button type="button" className="dash-btn" onClick={() => set([...ms, { id: newId('m'), name: t('dash.m.new', { n: ms.length + 1 }), agg: 'count' }])}>
        {t('dash.m.add')}
      </button>
    </>
  );
}

/** Calculated columns, bins and hierarchies. */
function ModelEditor({ dash, cat }: { dash: Dashboard; cat: Catalog | null }) {
  const st = useDash.getState();
  const cols = dash.columns ?? [];
  const bins = dash.bins ?? [];
  const hs = dash.hierarchies ?? [];
  const nums = cat?.fields.filter((f) => f.kind === 'num' && !f.bin && f.group !== 'hier') ?? [];
  const cats = cat?.fields.filter((f) => f.group !== 'hier') ?? [];
  return (
    <>
      <h4 title={t('dash.insp.columnsTip')}>{t('dash.insp.columns')}</h4>
      {cols.map((c) => (
        <div className="dash-filterpane" key={c.id}>
          <div className="f">
            <div className="top">
              <input type="text" aria-label={t('dash.m.name')} value={c.name} onChange={(e) => st.patchDash(dash.id, { columns: cols.map((x) => (x.id === c.id ? { ...x, name: e.target.value } : x)) })} />
              <button type="button" className="dash-btn icon" aria-label={t('dash.m.remove')} title={t('dash.m.remove')} onClick={() => st.patchDash(dash.id, { columns: cols.filter((x) => x.id !== c.id) })}>
                ✕
              </button>
            </div>
            <input type="text" aria-label={t('dash.col.expr')} title={t('dash.col.exprTip')} placeholder="speed * 3.6" value={c.expr} onChange={(e) => st.patchDash(dash.id, { columns: cols.map((x) => (x.id === c.id ? { ...x, expr: e.target.value } : x)) })} />
          </div>
        </div>
      ))}
      <button type="button" className="dash-btn" onClick={() => st.patchDash(dash.id, { columns: [...cols, { id: newId('k'), name: t('dash.col.new', { n: cols.length + 1 }), expr: '' }] })}>
        {t('dash.col.add')}
      </button>
      <h4 title={t('dash.insp.binsTip')}>{t('dash.insp.bins')}</h4>
      {bins.map((b) => (
        <div className="dash-filterpane" key={b.id}>
          <div className="f">
            <div className="top">
              <input type="text" aria-label={t('dash.m.name')} value={b.name} onChange={(e) => st.patchDash(dash.id, { bins: bins.map((x) => (x.id === b.id ? { ...x, name: e.target.value } : x)) })} />
              <button type="button" className="dash-btn icon" aria-label={t('dash.m.remove')} title={t('dash.m.remove')} onClick={() => st.patchDash(dash.id, { bins: bins.filter((x) => x.id !== b.id) })}>
                ✕
              </button>
            </div>
            <select aria-label={t('dash.m.field')} value={b.field} onChange={(e) => st.patchDash(dash.id, { bins: bins.map((x) => (x.id === b.id ? { ...x, field: e.target.value } : x)) })}>
              {nums.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
            <div className="dash-range">
              <input type="number" aria-label={t('dash.bin.size')} title={t('dash.bin.sizeTip')} placeholder={t('dash.bin.size')} value={b.size ?? ''} onChange={(e) => st.patchDash(dash.id, { bins: bins.map((x) => (x.id === b.id ? { ...x, size: e.target.value ? Number(e.target.value) : undefined } : x)) })} />
              <input type="number" aria-label={t('dash.bin.count')} title={t('dash.bin.countTip')} placeholder={t('dash.bin.count')} value={b.count ?? ''} onChange={(e) => st.patchDash(dash.id, { bins: bins.map((x) => (x.id === b.id ? { ...x, count: e.target.value ? Number(e.target.value) : undefined } : x)) })} />
            </div>
          </div>
        </div>
      ))}
      <button type="button" className="dash-btn" disabled={!nums.length} onClick={() => st.patchDash(dash.id, { bins: [...bins, { id: newId('b'), name: t('dash.bin.new', { name: nums[0]?.name ?? '' }), field: nums[0]?.id ?? '', count: 10 }] })}>
        {t('dash.bin.add')}
      </button>
      <h4 title={t('dash.insp.hierTip')}>{t('dash.insp.hier')}</h4>
      {hs.map((h) => (
        <div className="dash-filterpane" key={h.id}>
          <div className="f">
            <div className="top">
              <input type="text" aria-label={t('dash.m.name')} value={h.name} onChange={(e) => st.patchDash(dash.id, { hierarchies: hs.map((x) => (x.id === h.id ? { ...x, name: e.target.value } : x)) })} />
              <button type="button" className="dash-btn icon" aria-label={t('dash.m.remove')} title={t('dash.m.remove')} onClick={() => st.patchDash(dash.id, { hierarchies: hs.filter((x) => x.id !== h.id) })}>
                ✕
              </button>
            </div>
            {h.levels.map((l, i) => (
              <div className="dash-slot-item" key={l + i}>
                <span>
                  {i + 1}. {fieldName(cat, l)}
                </span>
                <button type="button" aria-label={t('dash.slot.remove')} title={t('dash.slot.remove')} onClick={() => st.patchDash(dash.id, { hierarchies: hs.map((x) => (x.id === h.id ? { ...x, levels: x.levels.filter((_y, j) => j !== i) } : x)) })}>
                  ✕
                </button>
              </div>
            ))}
            <select aria-label={t('dash.hier.addLevel')} value="" onChange={(e) => e.target.value && st.patchDash(dash.id, { hierarchies: hs.map((x) => (x.id === h.id ? { ...x, levels: [...x.levels, e.target.value].slice(0, 8) } : x)) })}>
              <option value="">{t('dash.hier.addLevel')}</option>
              {cats.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      ))}
      <button type="button" className="dash-btn" onClick={() => st.patchDash(dash.id, { hierarchies: [...hs, { id: newId('h'), name: t('dash.hier.new', { n: hs.length + 1 }), levels: [] }] })}>
        {t('dash.hier.add')}
      </button>
    </>
  );
}

/** The page's and the dashboard's own settings (nothing picked). */
function PageSettings({ dash, page, cat }: { dash: Dashboard; page: Page; cat: Catalog | null }) {
  const st = useDash.getState();
  return (
    <>
      <h4>{t('dash.insp.page')}</h4>
      <Row label={t('dash.insp.pageName')}>
        <input type="text" value={page.name} onChange={(e) => st.patchPage(page.id, { name: e.target.value })} />
      </Row>
      <Row label={t('dash.insp.through')} tip={t('dash.insp.throughTip')}>
        <select
          value=""
          onChange={(e) => e.target.value && st.patchPage(page.id, { drillThrough: [...new Set([...(page.drillThrough ?? []), e.target.value])] })}
        >
          <option value="">{page.drillThrough?.length ? page.drillThrough.map((f) => fieldName(cat, f)).join(', ') : t('dash.insp.throughNone')}</option>
          {cat?.fields
            .filter((f) => f.kind === 'cat' && f.group !== 'hier')
            .map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
        </select>
      </Row>
      {page.drillThrough?.length ? (
        <button type="button" className="dash-btn" onClick={() => st.patchPage(page.id, { drillThrough: undefined })}>
          {t('dash.insp.throughClear')}
        </button>
      ) : null}
      <FilterPane label={t('dash.insp.pageFilters')} filters={page.filters ?? []} cat={cat} onChange={(fs) => st.setFilters({ pageId: page.id }, [...fs, ...(page.filters ?? []).filter((f) => f.slicer && !fs.includes(f))])} />
      <h4>{t('dash.insp.dashboard')}</h4>
      <Row label={t('dash.insp.dashName')}>
        <input type="text" value={dash.name} onChange={(e) => st.patchDash(dash.id, { name: e.target.value })} />
      </Row>
      <Row label={t('dash.insp.source')} tip={t('dash.insp.sourceTip')}>
        <select value={dash.source ?? 'view'} onChange={(e) => st.patchDash(dash.id, { source: e.target.value === 'view' ? undefined : e.target.value })}>
          {dashboardSources().map((s) => (
            <option key={s.id} value={s.id}>
              {s.id === 'view' ? t('dash.source.view') : s.label}
            </option>
          ))}
        </select>
      </Row>
      <FilterPane label={t('dash.insp.dashFilters')} filters={dash.filters ?? []} cat={cat} onChange={(fs) => st.setFilters({ dashId: dash.id }, [...fs, ...(dash.filters ?? []).filter((f) => f.slicer && !fs.includes(f))])} />
      <MeasuresEditor dash={dash} cat={cat} />
      <ModelEditor dash={dash} cat={cat} />
    </>
  );
}

/** The settings panel on the right while editing. */
export function Inspector({ dash, page }: { dash: Dashboard; page: Page }) {
  const picked = useDash((s) => (s.picked ? s.tiles.find((x) => x.id === s.picked && x.pageId === page.id) : undefined));
  const cat = dashClient.catalog(dash);
  return <div className="dash-insp" data-help="inspector">{picked ? <TileSettings tile={picked} dash={dash} cat={cat} /> : <PageSettings dash={dash} page={page} cat={cat} />}</div>;
}
