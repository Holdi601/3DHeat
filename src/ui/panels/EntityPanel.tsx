import { useMemo, useState } from 'react';
import { rgbToCss, teamMemberColor } from '../../render/colors';
import { filterSlots } from '../../render/filterTables';
import { MAX_FILTER_SLOTS } from '../../render/types';
import { useStore } from '../../state/store';
import type { FilterSpec } from '../../state/types';
import { Section } from '../controls';
import { int, t } from '../../i18n';

/** Rows rendered at once. The real datasets have tens of thousands of entities. */
const PAGE = 200;

/**
 * Isolate specific people or entities.
 *
 * The lists here can be enormous — the real exports carry 33,618 named entities,
 * because every AI actor is one — so this is search-first with a capped result
 * list rather than a scrollable roster. Rendering all of them would cost more
 * than a frame of heat.
 *
 * The selection applies everywhere: on the CPU side in the box replay (track
 * visibility and cube building), and in the heat modes as one of the four shader
 * filter slots, over the person ids — the mask behind a slot holds 65,536 ids,
 * enough for those tens of thousands. Taking a slot means it can be crowded out
 * by column filters, and then the panel says so rather than leaving the heat to
 * quietly show everyone.
 */
export function EntityPanel() {
  const dataset = useStore((s) => s.dataset);
  const filters = useStore((s) => s.filters);
  const setFilters = useStore((s) => s.setFilters);
  const [query, setQuery] = useState('');

  const personFilter = filters.find((f) => f.kind === 'persons');
  const selected = useMemo(
    () => new Set(personFilter && personFilter.kind === 'persons' ? personFilter.allowed : []),
    [personFilter],
  );

  const matches = useMemo(() => {
    if (!dataset) return [];
    const q = query.trim().toLowerCase();
    const out: number[] = [];
    for (let i = 0; i < dataset.personLabels.length; i++) {
      if (q && !dataset.personLabels[i].toLowerCase().includes(q)) continue;
      out.push(i);
      if (out.length >= PAGE) break;
    }
    return out;
  }, [dataset, query]);

  // Counted before the early return: hooks cannot be called conditionally.
  const matchCount = useMemo(() => {
    if (!dataset) return 0;
    const q = query.trim().toLowerCase();
    if (!q) return dataset.personLabels.length;
    let n = 0;
    for (const label of dataset.personLabels) {
      if (label.toLowerCase().includes(q)) n++;
    }
    return n;
  }, [dataset, query]);

  if (!dataset || dataset.personLabels.length === 0) return null;
  const total = dataset.personLabels.length;
  // The slot the shader gives the selection; past the last one the heat ignores it.
  const at = filters.findIndex((f) => f.kind === 'persons');
  const noSlot = at >= 0 && (filterSlots(dataset, filters)[at] ?? -1) >= MAX_FILTER_SLOTS;

  const setSelection = (next: Set<number>) => {
    const rest = filters.filter((f) => f.kind !== 'persons');
    // An empty selection means "no restriction", not "show nobody" — the latter
    // is a blank screen that looks like a bug.
    setFilters(next.size === 0 ? rest : [...rest, { kind: 'persons', allowed: [...next] } as FilterSpec]);
  };

  const toggle = (i: number) => {
    const next = new Set(selected);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    setSelection(next);
  };

  const colourOf = (p: number): string => {
    const team = dataset.personTeam ? dataset.personTeam[p] : 0;
    const slot = dataset.personSlot ? dataset.personSlot[p] : p;
    const size = dataset.teamSizes ? dataset.teamSizes[team] : total;
    return rgbToCss(teamMemberColor(team, slot, size));
  };

  return (
    <Section
      title={t('heat.entityPanel.title')}
      right={
        <span style={{ color: 'var(--text-faint)' }}>
          {selected.size > 0
            ? t('heat.entityPanel.selectedOf', { selected: int(selected.size), total: int(total) })
            : int(total)}
        </span>
      }
    >
      <div className="hint">{t('heat.entityPanel.hint')}</div>
      {noSlot && <div className="err">{t('heat.entityPanel.noSlot')}</div>}
      <input
        type="text"
        placeholder={t('heat.entityPanel.search', { count: total })}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {query && (
        <div className="hint">
          {matchCount > PAGE
            ? t('heat.entityPanel.matchesFirst', { count: matchCount, page: int(PAGE) })
            : t('heat.entityPanel.matches', { count: matchCount })}
        </div>
      )}

      <div className="team-list" style={{ maxHeight: 260 }}>
        {matches.map((i) => (
          <div className="team-row" key={i}>
            <input type="checkbox" checked={selected.has(i)} onChange={() => toggle(i)} />
            <span className="swatch" style={{ background: colourOf(i) }} />
            <span className="name" title={dataset.personLabels[i]}>
              {dataset.personLabels[i] || <em style={{ opacity: 0.5 }}>{t('heat.entityPanel.unnamed')}</em>}
            </span>
          </div>
        ))}
        {matches.length === 0 && (
          <div className="hint" style={{ opacity: 0.7 }}>
            {t('heat.entityPanel.noMatch', { query })}
          </div>
        )}
      </div>

      <div className="row">
        <button
          disabled={matches.length === 0}
          title={t('heat.entityPanel.addShownTitle')}
          onClick={() => setSelection(new Set([...selected, ...matches]))}
        >
          {t('heat.entityPanel.addShown')}
        </button>
        <button
          disabled={matches.length === 0}
          title={t('heat.entityPanel.onlyShownTitle')}
          onClick={() => setSelection(new Set(matches))}
        >
          {t('heat.entityPanel.onlyShown')}
        </button>
        <button disabled={selected.size === 0} onClick={() => setSelection(new Set())}>
          {t('heat.entityPanel.clear')}
        </button>
      </div>
    </Section>
  );
}
