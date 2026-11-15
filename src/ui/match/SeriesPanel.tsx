import { useMemo } from 'react';
import { int, t } from '../../i18n';
import { realDate, seriesStanding } from '../../data/series';
import { useStore } from '../../state/store';
import type { Dataset } from '../../state/types';
import { Section } from '../controls';

/** A recording that is one session of a campaign round, loaded alone: its round and its place in it. */
function oneSessionOf(d: Dataset): { campaign: string; n: number } | null {
  const camp = d.attrs.find((a) => a.name === 'campaign' && a.kind === 'category');
  const sess = d.attrs.find((a) => a.name === 'session' && a.kind !== 'category');
  if (!camp?.categories || !sess) return null;
  const names = camp.categories.filter((c) => c !== '');
  if (names.length !== 1 || !(sess.min === sess.max) || !Number.isFinite(sess.min)) return null;
  return { campaign: names[0], n: sess.min };
}

const W = 260;
const H = 70;

/**
 * A campaign round watched as a series (`Dataset.series`): its sessions in
 * order with their real dates, how many contested places each side held at
 * each session's start and how many it took before it, a chart of that over
 * the round, and a click to go to a session. For one session loaded alone,
 * which round it belongs to and how to watch the round whole.
 */
export function SeriesPanel() {
  const dataset = useStore((s) => s.dataset);
  const rows = useMemo(() => (dataset?.series ? seriesStanding(dataset) : []), [dataset]);
  if (!dataset) return null;
  if (!dataset.series) {
    const one = oneSessionOf(dataset);
    if (!one) return null;
    return (
      <Section title={t('match.series.title')}>
        <div className="hint">{t('match.series.offer', { n: one.n, campaign: one.campaign })}</div>
      </Section>
    );
  }
  const s = dataset.series;
  const known = rows.filter((r) => Number.isFinite(r.red) && Number.isFinite(r.blue));
  const most = Math.max(1, ...known.map((r) => Math.max(r.red, r.blue)));
  const px = (i: number) => (rows.length > 1 ? (i / (rows.length - 1)) * (W - 8) + 4 : W / 2);
  const py = (v: number) => H - 4 - (v / most) * (H - 8);
  const line = (k: 'red' | 'blue') =>
    rows
      .filter((r) => Number.isFinite(r[k]))
      .map((r) => `${px(r.index).toFixed(1)},${py(r[k]).toFixed(1)}`)
      .join(' ');
  return (
    <Section title={t('match.series.title')} defaultOpen>
      <div className="hint">
        {t('match.series.summary', {
          campaign: s.campaign,
          count: s.sessions.length,
          from: realDate(s.sessions[0].realStart),
          to: realDate(s.sessions[s.sessions.length - 1].realStart),
          seconds: s.breakSeconds,
        })}
      </div>
      {known.length > 0 && (
        <>
          <div className="hint" style={{ marginTop: 6 }}>{t('match.series.held')}</div>
          <svg width={W} height={H} role="img" aria-label={t('match.series.held')} style={{ display: 'block', marginTop: 2 }}>
            <polyline points={line('red')} fill="none" stroke="#e05555" strokeWidth={2} />
            <polyline points={line('blue')} fill="none" stroke="#4f8fe8" strokeWidth={2} />
          </svg>
        </>
      )}
      <div style={{ maxHeight: 220, overflowY: 'auto', marginTop: 6 }}>
        {rows.map((r) => (
          <button
            key={r.index}
            className="link"
            style={{ display: 'block', width: '100%', textAlign: 'left' }}
            title={t('match.series.go', { n: r.index + 1 })}
            onClick={() => useStore.getState().seek(r.start)}
          >
            {t('match.series.row', {
              n: r.index + 1,
              date: realDate(r.realStart),
              red: Number.isFinite(r.red) ? int(r.red) : '-',
              blue: Number.isFinite(r.blue) ? int(r.blue) : '-',
              taken: r.taken,
            })}
          </button>
        ))}
      </div>
    </Section>
  );
}
