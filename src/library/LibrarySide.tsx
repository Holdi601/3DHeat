/**
 * The Library's left column: the folders it watches (online or not), the
 * collections (made by hand, or saved filters that fill themselves), and the
 * filters with how many items each value has - each counted over the other
 * filters, so picking a second game adds to the first.
 */

import { useState } from 'react';
import { t, useLang } from '../i18n';
import { confirmDialog, toast } from '../ui/shell/kit';
import { lib, type FacetValue, type Filter } from './api';
import { date, gameName, kindName, size } from './games';
import { refreshSide, targets, useLibrary } from './store';

type ListKey = 'game' | 'map' | 'mode' | 'outcome' | 'kind' | 'format' | 'tag' | 'player' | 'converter' | 'year' | 'conv';

function label(dim: ListKey, v: string): string {
  if (v === '') return t('library.facet.none');
  if (dim === 'game') return gameName(v);
  if (dim === 'kind') return kindName(v);
  if (dim === 'conv') return t(`library.conv.${v}`);
  return v;
}

function Facet({ dim, title, open: start = false, max = 8 }: { dim: ListKey; title: string; open?: boolean; max?: number }) {
  const facets = useLibrary((s) => s.facets);
  const filter = useLibrary((s) => s.filter);
  const patch = useLibrary((s) => s.patchFilter);
  const [open, setOpen] = useState(start);
  const [all, setAll] = useState(false);
  const [find, setFind] = useState('');
  const values = ((facets?.[dim] as FacetValue[] | undefined) ?? []).filter((x) => !(dim === 'conv' && x.v === 'na'));
  const picked = (filter[dim] as string[] | undefined) ?? [];
  if (!values.length && !picked.length) return null;
  const shown = values.filter((x) => !find || label(dim, String(x.v ?? '')).toLowerCase().includes(find.toLowerCase()));
  const list = all ? shown : shown.slice(0, max);
  const toggle = (v: string) => {
    const next = picked.includes(v) ? picked.filter((x) => x !== v) : [...picked, v];
    patch({ [dim]: next } as Partial<Filter>);
  };
  return (
    <div className={`lib-facet${open ? ' open' : ''}`}>
      <button type="button" className="lib-facet-head" aria-expanded={open} onClick={() => setOpen(!open)} data-usage={`ctl:library.facets/library.facet.${dim}`}>
        <span>{title}</span>
        {picked.length > 0 && <span className="lib-count on">{picked.length}</span>}
        <span className="lib-caret" aria-hidden="true" />
      </button>
      {open && (
        <div className="lib-facet-body">
          {values.length > 12 && <input className="lib-facet-find" value={find} placeholder={t('library.facet.find')} onChange={(e) => setFind(e.target.value)} />}
          {list.map((x) => {
            const v = String(x.v ?? '');
            return (
              <label key={v} className={`lib-check${picked.includes(v) ? ' on' : ''}`}>
                <input type="checkbox" checked={picked.includes(v)} onChange={() => toggle(v)} />
                <span className="lib-check-label">{label(dim, v)}</span>
                <span className="lib-count">{x.n}</span>
              </label>
            );
          })}
          {shown.length > max && (
            <button type="button" className="lib-link" onClick={() => setAll(!all)}>
              {all ? t('library.facet.fewer') : t('library.facet.more', { count: shown.length - max })}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function RatingFilter() {
  const filter = useLibrary((s) => s.filter);
  const patch = useLibrary((s) => s.patchFilter);
  return (
    <div className="lib-rating-filter" role="group" aria-label={t('library.facet.rating')}>
      <span>{t('library.facet.rating')}</span>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" className={(filter.rating ?? 0) >= n ? 'on' : ''} onClick={() => patch({ rating: filter.rating === n ? undefined : n })} aria-label={t('library.rateAtLeast', { count: n })}>
          ★
        </button>
      ))}
      <button type="button" className={`lib-flagbtn${filter.flag === 1 ? ' on' : ''}`} onClick={() => patch({ flag: filter.flag === 1 ? undefined : 1 })} title={t('library.flag.picksOnly')}>
        {t('library.flag.pick')}
      </button>
    </div>
  );
}

function Sources() {
  const roots = useLibrary((s) => s.roots);
  const filter = useLibrary((s) => s.filter);
  const patch = useLibrary((s) => s.patchFilter);
  const set = useLibrary((s) => s.set);
  return (
    <section className="lib-side-sec">
      <div className="lib-side-title">
        <span>{t('library.side.folders')}</span>
        <button type="button" className="lib-icon-btn" onClick={() => set({ addOpen: true })} title={t('library.add.title')} aria-label={t('library.add.title')} data-usage="cmd:lib.addFolder">
          +
        </button>
      </div>
      {roots.map((r) => {
        const off = !r.reachable;
        const name = r.path.split(/[\\/]/).filter(Boolean).pop() ?? r.path;
        return (
          <div key={r.id} className={`lib-root${filter.root === r.id ? ' on' : ''}${off ? ' off' : ''}`}>
            <button type="button" className="lib-root-name" onClick={() => patch({ root: filter.root === r.id ? undefined : r.id })} title={`${r.path}${r.lastScan ? `\n${t('library.root.scanned', { when: date(r.lastScan) })}` : ''}`}>
              <span className={`lib-dot ${off ? 'off' : 'on'}`} aria-hidden="true" />
              <span className="lib-root-label">{name}</span>
              <span className="lib-count">{off ? t('library.root.offline') : r.items}</span>
            </button>
            <span className="lib-root-acts">
              <button type="button" className="lib-icon-btn" title={t('library.root.rescan')} aria-label={t('library.root.rescan')} onClick={() => void lib.rescan(r.id).then(() => toast(t('library.root.rescanning'), 'info'))}>
                ⟳
              </button>
              <button
                type="button"
                className="lib-icon-btn"
                title={t('library.root.remove')}
                aria-label={t('library.root.remove')}
                onClick={async () => {
                  if (!(await confirmDialog(t('library.root.removeAsk', { path: r.path }), t('library.root.remove')))) return;
                  await lib.removeRoot(r.id);
                  if (filter.root === r.id) patch({ root: undefined });
                  void refreshSide();
                }}
              >
                ×
              </button>
            </span>
          </div>
        );
      })}
      {!roots.length && <div className="lib-hint">{t('library.side.noFolders')}</div>}
    </section>
  );
}

function Collections() {
  const cols = useLibrary((s) => s.collections);
  const filter = useLibrary((s) => s.filter);
  const setFilter = useLibrary((s) => s.setFilter);
  const patch = useLibrary((s) => s.patchFilter);
  const [naming, setNaming] = useState<null | 'manual' | 'smart'>(null);
  const [name, setName] = useState('');
  const create = async () => {
    const n = name.trim();
    if (!n) return;
    if (naming === 'smart') {
      const { collection: _c, root: _r, ...saved } = filter;
      await lib.createCollection(n, [], saved);
    } else await lib.createCollection(n, targets());
    setNaming(null);
    setName('');
    void refreshSide();
  };
  return (
    <section className="lib-side-sec">
      <div className="lib-side-title">
        <span>{t('library.side.collections')}</span>
        <button type="button" className="lib-icon-btn" title={t('library.coll.new')} aria-label={t('library.coll.new')} onClick={() => setNaming('manual')} data-usage="cmd:lib.newCollection">
          +
        </button>
      </div>
      <button type="button" className={`lib-coll${filter.collection === undefined ? ' on' : ''}`} onClick={() => setFilter({})}>
        <span className="lib-coll-icon" aria-hidden="true">▦</span>
        <span className="lib-root-label">{t('library.coll.all')}</span>
      </button>
      {cols.map((c) => (
        <div key={c.id} className={`lib-root${filter.collection === c.id ? ' on' : ''}`}>
          <button
            type="button"
            className="lib-coll"
            onClick={() => patch({ collection: filter.collection === c.id ? undefined : c.id })}
            onDragOver={(e) => {
              if (!c.smart) e.preventDefault();
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (!c.smart) void lib.addToCollection(c.id, targets()).then(() => refreshSide());
            }}
            title={c.smart ? t('library.coll.smartTitle') : t('library.coll.manualTitle')}
          >
            <span className="lib-coll-icon" aria-hidden="true">{c.smart ? '⚙' : '▣'}</span>
            <span className="lib-root-label">{c.name}</span>
            <span className="lib-count">{c.count}</span>
          </button>
          <span className="lib-root-acts">
            {!c.smart && (
              <button type="button" className="lib-icon-btn" title={t('library.coll.addSelected')} aria-label={t('library.coll.addSelected')} onClick={() => void lib.addToCollection(c.id, targets()).then(() => refreshSide())}>
                +
              </button>
            )}
            <button
              type="button"
              className="lib-icon-btn"
              title={t('library.coll.delete')}
              aria-label={t('library.coll.delete')}
              onClick={async () => {
                if (!(await confirmDialog(t('library.coll.deleteAsk', { name: c.name }), t('library.coll.delete')))) return;
                await lib.deleteCollection(c.id);
                if (filter.collection === c.id) patch({ collection: undefined });
                void refreshSide();
              }}
            >
              ×
            </button>
          </span>
        </div>
      ))}
      {naming ? (
        <form
          className="lib-name-form"
          onSubmit={(e) => {
            e.preventDefault();
            void create();
          }}
        >
          <input autoFocus value={name} placeholder={naming === 'smart' ? t('library.coll.smartName') : t('library.coll.name')} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Escape' && setNaming(null)} />
          <button type="submit" className="primary">
            {t('library.coll.create')}
          </button>
        </form>
      ) : (
        <button type="button" className="lib-link" onClick={() => setNaming('smart')} data-usage="cmd:lib.saveFilter">
          {t('library.coll.saveFilter')}
        </button>
      )}
    </section>
  );
}

export function LibrarySide() {
  useLang();
  const facets = useLibrary((s) => s.facets);
  const filter = useLibrary((s) => s.filter);
  const setFilter = useLibrary((s) => s.setFilter);
  const any = Object.entries(filter).some(([k, v]) => k !== 'collection' && k !== 'root' && v !== undefined && v !== '' && !(Array.isArray(v) && !v.length));
  const totals = facets?.totals;
  return (
    <aside className="lib-side" aria-label={t('library.side.label')}>
      <Sources />
      <Collections />
      <section className="lib-side-sec" data-usage-area="library.facets">
        <div className="lib-side-title">
          <span>{t('library.side.filters')}</span>
          {any && (
            <button type="button" className="lib-link" onClick={() => setFilter({ collection: filter.collection, root: filter.root })}>
              {t('library.facet.clear')}
            </button>
          )}
        </div>
        {totals && (
          <div className="lib-hint">
            {t('library.totals', { count: totals.items, size: size(totals.bytes) })}
          </div>
        )}
        <RatingFilter />
        <Facet dim="game" title={t('library.facet.game')} open max={10} />
        <Facet dim="map" title={t('library.facet.map')} open />
        <Facet dim="kind" title={t('library.facet.kind')} open />
        <Facet dim="conv" title={t('library.facet.conv')} open />
        <Facet dim="mode" title={t('library.facet.mode')} />
        <Facet dim="outcome" title={t('library.facet.outcome')} />
        <Facet dim="year" title={t('library.facet.year')} />
        <Facet dim="tag" title={t('library.facet.tag')} />
        <Facet dim="player" title={t('library.facet.player')} />
        <Facet dim="converter" title={t('library.facet.converter')} />
        <Facet dim="format" title={t('library.facet.format')} />
        <DateRange />
        <label className="lib-check">
          <input type="checkbox" checked={filter.dupes === true} onChange={(e) => setFilter({ ...filter, dupes: e.target.checked || undefined })} />
          <span className="lib-check-label">{t('library.facet.dupes')}</span>
        </label>
        <label className="lib-check">
          <input type="checkbox" checked={filter.missing === true} onChange={(e) => setFilter({ ...filter, missing: e.target.checked || undefined })} />
          <span className="lib-check-label">{t('library.facet.missing')}</span>
        </label>
      </section>
    </aside>
  );
}

function DateRange() {
  const filter = useLibrary((s) => s.filter);
  const patch = useLibrary((s) => s.patchFilter);
  const day = (ms: number | undefined) => (ms === undefined ? '' : new Date(ms).toISOString().slice(0, 10));
  return (
    <div className="lib-dates">
      <label>
        <span>{t('library.facet.from')}</span>
        <input type="date" value={day(filter.from)} onChange={(e) => patch({ from: e.target.value ? Date.parse(`${e.target.value}T00:00:00Z`) : undefined })} />
      </label>
      <label>
        <span>{t('library.facet.to')}</span>
        <input type="date" value={day(filter.to === undefined ? undefined : filter.to - 86_400_000)} onChange={(e) => patch({ to: e.target.value ? Date.parse(`${e.target.value}T00:00:00Z`) + 86_400_000 : undefined })} />
      </label>
    </div>
  );
}
