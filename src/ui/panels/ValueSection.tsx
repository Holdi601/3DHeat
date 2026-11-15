import { useMemo } from 'react';
import { COST_SOURCE, currencyUnit, isMoney, shownValue, valueColumnsOf, type ValueColumn } from '../../data/cost';
import { int, num, t } from '../../i18n';
import { useStore } from '../../state/store';
import type { Dataset } from '../../state/types';
import { Section, Segmented, Select } from '../controls';

/** A value column said in words: what it counts and in what. */
export function valueColumnLabel(c: ValueColumn, money: 'usd' | 'eur' = 'usd'): string {
  const kind = c.flow === 'net' ? t('value.kind.net') : c.flow === 'earn' ? t('value.kind.earn') : t(`value.kind.${c.kind ?? 'total'}`);
  return t('value.column', { kind, unit: currencyUnit(c.currency, money) });
}

/** Each value column's sum over the dataset; once per dataset, not per frame. */
function totalsOf(ds: Dataset | null): { col: ValueColumn; total: number }[] {
  if (!ds) return [];
  return valueColumnsOf(ds.attrs).map((col) => {
    const a = ds.attrs.find((x) => x.name === col.name)!.data as Float32Array;
    let s = 0;
    for (let i = 0; i < a.length; i++) if (a[i] === a[i]) s += a[i];
    return { col, total: s };
  });
}

/** Weigh the heat by what rows cost or earned (`data/cost.ts`), with the totals. */
export function ValueSection() {
  const dataset = useStore((s) => s.dataset);
  const heat = useStore((s) => s.heat);
  const patchHeat = useStore((s) => s.patchHeat);
  const money = heat.money ?? 'usd';
  const totals = useMemo(() => totalsOf(dataset), [dataset]);
  const estimated = useMemo(() => {
    const src = dataset?.attrs.find((a) => a.name === COST_SOURCE);
    if (!src) return null;
    let priced = 0;
    let rough = 0;
    for (const v of src.data) if (v > 0) {
      priced++;
      if (v > 1) rough++;
    }
    return priced ? rough / priced : null;
  }, [dataset]);
  const options = useMemo(() => totals.map((x) => ({ value: x.col.name, label: valueColumnLabel(x.col, money) })), [totals, money]);
  if (!dataset) return null;
  const selected = totals.find((x) => x.col.name === heat.weightBy)?.col ?? null;
  return (
    <Section title={t('value.section')}>
      <div className="hint">{t('value.hint')}</div>
      {totals.length === 0 ? (
        <div className="hint">{t('value.none')}</div>
      ) : (
        <>
          <Select label={t('value.weighBy')} value={selected?.name ?? null} options={options} onChange={(weightBy) => patchHeat({ weightBy })} allowEmpty />
          {selected?.flow === 'net' && <div className="hint">{t('value.netHint')}</div>}
          {totals.some((x) => isMoney(x.col.currency)) && (
            <Segmented
              value={money}
              options={[
                { value: 'usd', label: 'USD' },
                { value: 'eur', label: 'EUR' },
              ]}
              onChange={(m) => patchHeat({ money: m })}
            />
          )}
          <div className="label">{t('value.totals')}</div>
          {totals.map((x) => (
            <div className="value-total" key={x.col.name}>
              <span>{valueColumnLabel(x.col, money)}</span>
              <span>{int(shownValue(x.total, x.col.currency, money))}</span>
            </div>
          ))}
          {estimated !== null && estimated > 0 && <div className="hint">{t('value.estimated', { pct: num(estimated * 100) })}</div>}
          <div className="hint">{t('value.sources')}</div>
        </>
      )}
    </Section>
  );
}
