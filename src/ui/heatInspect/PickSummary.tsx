/**
 * The pick card's summary, first on the card: what the place under the pick
 * is made of (`placeSummary.ts`) - what happened there, by which units, with
 * which weapons, by whom - and the one row picked, in a line. The row's every
 * column stays a click away behind "All columns".
 */

import { useMemo } from 'react';
import { int, num, t, useLang } from '../../i18n';
import { useInspectStore, type PickResult } from '../../state/inspectStore';
import { useStore } from '../../state/store';
import type { Dataset } from '../../state/types';
import { CANON } from '../../data/canonical';
import { plainName, summarisePlace, type Share } from './placeSummary';

const pct = (v: number) => `${num(v * 100, 0)}%`;

function Shares({ label, list, testId }: { label: string; list: Share[]; testId: string }) {
  if (!list.length) return null;
  return (
    <div className="line pick-shares" data-testid={testId}>
      <span>{label}</span>
      <b>
        {list.map((s, i) => (
          <span key={s.label} title={t('heat.inspect.summary.shareTitle', { rows: int(s.rows), share: pct(s.share) })}>
            {i > 0 && ', '}
            {s.label} <small>{pct(s.share)}</small>
          </span>
        ))}
      </b>
    </div>
  );
}

/** The place's tally from the heat stack, once it is read. */
export function PickSummary({ pick }: { pick: PickResult }) {
  useLang();
  const reading = useInspectStore((s) => s.stack);
  const stack = reading && reading.pickId === pick.id ? reading.stack : null;
  const ds = pick.dataset ?? useStore.getState().dataset;
  const sum = useMemo(() => (stack && ds && stack.rows.length ? summarisePlace(ds, stack.rows, stack.contrib) : null), [stack, ds]);
  // An event filter that leaves the deaths out (kills and hits only) would make every place read n / 0.
  const filters = useStore((s) => s.filters);
  const deathsHidden = useMemo(() => {
    const ev = ds?.attrs.find((a) => a.name === CANON.event);
    const id = ev?.categories?.indexOf('death') ?? -1;
    return id >= 0 && filters.some((f) => f.kind === 'categories' && f.column === CANON.event && !f.allowed.includes(id));
  }, [filters, ds]);
  if (!sum) return null;
  return (
    <div className="pick-summary" data-testid="pick-summary">
      <div className="hint">
        {t('heat.inspect.summary.head', { rows: int(sum.rows), units: sum.units, matches: sum.matches })}
      </div>
      <Shares label={t('heat.inspect.summary.events')} list={sum.events} testId="pick-sum-events" />
      <Shares label={t('heat.inspect.summary.vehicles')} list={sum.vehicles} testId="pick-sum-vehicles" />
      <Shares label={t('heat.inspect.summary.weapons')} list={sum.weapons} testId="pick-sum-weapons" />
      <Shares label={t('heat.inspect.summary.people')} list={sum.people} testId="pick-sum-people" />
      {sum.teams.length > 1 && <Shares label={t('heat.inspect.summary.teams')} list={sum.teams} testId="pick-sum-teams" />}
      {(sum.kills > 0 || (sum.deaths ?? 0) > 0) && (
        <div className="line" data-testid="pick-sum-kd">
          <span>{t('heat.inspect.summary.kd')}</span>
          <b title={sum.deaths === null ? t('heat.inspect.summary.noDeathRowsTitle') : deathsHidden ? t('heat.inspect.summary.deathsFilteredTitle') : undefined}>
            {sum.deaths === null
              ? t('heat.inspect.summary.killsOnly', { kills: int(sum.kills) })
              : deathsHidden
                ? t('heat.inspect.summary.deathsFiltered', { kills: int(sum.kills) })
                : t('heat.inspect.summary.killsDeaths', { kills: int(sum.kills), deaths: int(sum.deaths) })}
          </b>
        </div>
      )}
    </div>
  );
}

/** The picked row in one line: who, in what, did what, when. */
export function rowLine(ds: Dataset, row: number): string {
  const parts: string[] = [];
  if (ds.personId) parts.push(ds.personLabels[ds.personId[row]] ?? '');
  const cat = (re: RegExp) => ds.attrs.find((a) => a.kind === 'category' && !!a.categories && re.test(a.name));
  const val = (re: RegExp) => {
    const a = cat(re);
    const v = a ? (a.categories![a.data[row]] ?? '') : '';
    return /^(|nan|null|none|-|—|n\/a|undefined)$/i.test(v.trim()) ? '' : v;
  };
  const vehicle = val(/^(vehicle.?short.?name|short.?name|display.?name)$/i) || plainName(val(/^(vehicle|unit|unit.?type|aircraft)$/i));
  if (vehicle) parts.push(vehicle);
  if (ds.teamId && ds.teamLabels.length > 1) parts.push(t('heat.inspect.summary.team', { team: ds.teamLabels[ds.teamId[row]] ?? '' }));
  const cls = val(new RegExp(`^${CANON.event}$`));
  const ev = val(/^(event|event.?name)$/i).replace(/_/g, ' ');
  const what = cls && ev && ev.toLowerCase() !== cls ? `${cls} (${ev})` : cls || ev;
  if (what) parts.push(what);
  const weapon = val(/^(weapon.?name|ammo.?name)$/i) || plainName(val(/^(weapon|ammo)$/i));
  if (weapon) parts.push(weapon);
  return parts.filter(Boolean).join(' · ');
}
