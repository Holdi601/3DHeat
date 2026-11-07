import { useStore } from '../../state/store';
import { filterSlots } from '../../render/filterTables';
import { MAX_FILTER_SLOTS } from '../../render/types';
import type { AttributeColumn, FilterSpec } from '../../state/types';
import { Section } from '../controls';
import { num, t } from '../../i18n';

/**
 * Live filters over the retained columns.
 *
 * Every control here is a shader uniform, so dragging a range or toggling a
 * category re-filters the whole dataset on the next frame — no re-parse, no
 * re-upload, no rebuilt buffer. That is the entire reason filtering happens on
 * the GPU rather than by rebuilding a subset on the CPU.
 */
/**
 * A column as a panel's props see it, without its rows. In a development build React
 * walks a changed prop key by key for its performance tracks; a typed array of 86M rows
 * made that 86M string keys, a minute's hang and an out-of-memory crash of the tab.
 */
const NO_ROWS = new Float32Array(0);

export function FilterPanel() {
  const dataset = useStore((s) => s.dataset);
  const filters = useStore((s) => s.filters);
  const setFilters = useStore((s) => s.setFilters);

  if (!dataset) return null;

  // The slots as the shader hands them out, so what this calls applied is what
  // is applied. The Entities selection takes one too, wherever it sits in the list.
  const slots = filterSlots(dataset, filters);
  const slotOf = (spec: FilterSpec | undefined): number => {
    const i = spec ? filters.indexOf(spec) : -1;
    return i < 0 ? -1 : (slots[i] ?? -1);
  };
  const activeCount = slots.filter((s) => s !== null).length;
  const personSlot = slots.some(
    (s, i) => s !== null && s < MAX_FILTER_SLOTS && filters[i].kind === 'persons',
  );
  const columnCount = filters.filter((f) => f.kind === 'range' || f.kind === 'categories').length;

  const filterFor = (name: string): FilterSpec | undefined =>
    filters.find((f) => (f.kind === 'range' || f.kind === 'categories') && f.column === name);

  const replace = (name: string, next: FilterSpec | null) => {
    const rest = filters.filter(
      (f) => !((f.kind === 'range' || f.kind === 'categories') && f.column === name),
    );
    setFilters(next ? [...rest, next] : rest);
  };

  if (dataset.attrs.length === 0) {
    return (
      <Section title={t('heat.filterPanel.title')}>
        <div className="hint">
          {t('heat.filterPanel.noColumns', { label: t('heat.sourcePanel.keepForFiltering') })}
        </div>
      </Section>
    );
  }

  return (
    <Section
      title={t('heat.filterPanel.title')}
      right={
        <span style={{ color: activeCount > MAX_FILTER_SLOTS ? 'var(--bad)' : 'var(--text-faint)' }}>
          {activeCount}/{MAX_FILTER_SLOTS}
        </span>
      }
    >
      {activeCount > MAX_FILTER_SLOTS && (
        <div className="err">{t('heat.filterPanel.overflow', { count: MAX_FILTER_SLOTS })}</div>
      )}
      <div className="hint">{t('heat.filterPanel.hint')}</div>
      {personSlot && <div className="hint">{t('heat.filterPanel.personSlot')}</div>}

      {dataset.attrs.map((attr) => (
        <FilterRow
          key={attr.name}
          attr={{ ...attr, data: NO_ROWS }}
          spec={filterFor(attr.name)}
          slot={slotOf(filterFor(attr.name))}
          onChange={(next) => replace(attr.name, next)}
        />
      ))}

      {columnCount > 0 && (
        <button onClick={() => setFilters(filters.filter((f) => f.kind === 'teams' || f.kind === 'persons'))}>
          {t('heat.filterPanel.clearAll')}
        </button>
      )}
    </Section>
  );
}

function FilterRow({
  attr,
  spec,
  slot,
  onChange,
}: {
  attr: AttributeColumn;
  spec: FilterSpec | undefined;
  slot: number;
  onChange: (next: FilterSpec | null) => void;
}) {
  const active = !!spec;
  const overflowed = slot >= MAX_FILTER_SLOTS;

  if (attr.kind === 'number') {
    const min = spec && spec.kind === 'range' ? spec.min : attr.min;
    const max = spec && spec.kind === 'range' ? spec.max : attr.max;
    const span = attr.max - attr.min || 1;
    return (
      <div className="field">
        <div className="label">
          <span style={{ opacity: overflowed ? 0.45 : 1 }}>
            {overflowed ? t('heat.filterPanel.notApplied', { column: attr.name }) : attr.name}
          </span>
          <span className="val">
            {active ? `${fmt(min)} … ${fmt(max)}` : `${fmt(attr.min)} … ${fmt(attr.max)}`}
          </span>
        </div>
        <div className="row">
          <input
            type="number"
            className="narrow"
            value={Number(min.toFixed(4))}
            step={span / 100}
            onChange={(e) =>
              onChange({ kind: 'range', column: attr.name, min: Number(e.target.value), max })
            }
          />
          <input
            type="range"
            min={attr.min}
            max={attr.max}
            step={span / 1000}
            value={min}
            onChange={(e) =>
              onChange({
                kind: 'range',
                column: attr.name,
                min: Number(e.target.value),
                max: Math.max(Number(e.target.value), max),
              })
            }
          />
        </div>
        <div className="row">
          <input
            type="number"
            className="narrow"
            value={Number(max.toFixed(4))}
            step={span / 100}
            onChange={(e) =>
              onChange({ kind: 'range', column: attr.name, min, max: Number(e.target.value) })
            }
          />
          <input
            type="range"
            min={attr.min}
            max={attr.max}
            step={span / 1000}
            value={max}
            onChange={(e) =>
              onChange({
                kind: 'range',
                column: attr.name,
                min: Math.min(min, Number(e.target.value)),
                max: Number(e.target.value),
              })
            }
          />
        </div>
        {active && (
          <button className="del" onClick={() => onChange(null)}>
            {t('heat.filterPanel.reset', { column: attr.name })}
          </button>
        )}
      </div>
    );
  }

  const categories = attr.categories ?? [];
  const allowed = new Set(
    spec && spec.kind === 'categories' ? spec.allowed : categories.map((_, i) => i),
  );
  const setAllowed = (next: Set<number>) => {
    if (next.size === categories.length) onChange(null);
    else onChange({ kind: 'categories', column: attr.name, allowed: [...next] });
  };

  return (
    <div className="field">
      <div className="label">
        <span style={{ opacity: overflowed ? 0.45 : 1 }}>
          {overflowed ? t('heat.filterPanel.notApplied', { column: attr.name }) : attr.name}
        </span>
        <span className="val">
          {allowed.size}/{categories.length}
        </span>
      </div>
      <div className="team-list" style={{ maxHeight: 150 }}>
        {categories.map((label, i) => (
          <div className="team-row" key={i}>
            <input
              type="checkbox"
              checked={allowed.has(i)}
              onChange={(e) => {
                const next = new Set(allowed);
                if (e.target.checked) next.add(i);
                else next.delete(i);
                setAllowed(next);
              }}
            />
            <span className="name" title={label || t('heat.filterPanel.empty')}>
              {label || <em style={{ opacity: 0.5 }}>{t('heat.filterPanel.empty')}</em>}
            </span>
          </div>
        ))}
      </div>
      <div className="row">
        <button onClick={() => setAllowed(new Set(categories.map((_, i) => i)))}>
          {t('heat.filterPanel.all')}
        </button>
        <button onClick={() => setAllowed(new Set())}>{t('heat.filterPanel.none')}</button>
      </div>
    </div>
  );
}

function fmt(v: number): string {
  if (!Number.isFinite(v)) return '—';
  const a = Math.abs(v);
  if (a >= 1e6) {
    const [mantissa, exponent] = v.toExponential(2).split('e');
    return `${num(Number(mantissa), 2)}e${exponent}`;
  }
  return num(v, a >= 100 ? 0 : a >= 1 ? 2 : 3);
}
