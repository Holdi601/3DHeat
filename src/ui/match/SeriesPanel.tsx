import { useEffect, useMemo, useState } from 'react';
import { int, t } from '../../i18n';
import { realDate, seriesStanding, type SeriesStanding } from '../../data/series';
import { expandContainerFiles } from '../../data/container';
import { useStore } from '../../state/store';
import type { Dataset } from '../../state/types';
import { Section } from '../controls';
import { SortControl } from '../sort/SortControl';
import { useSort, useSorted } from '../sort/useSort';
import { useEngine } from '../EngineContext';
import { startLeanLoad } from '../overlay/LeanOverlayPanel';
import { campaignObjectives } from '../../match/campaignObjectives';
import { useObjectivesStore } from '../../state/objectivesStore';

/** Where the local viewer server lists a round's recordings on this machine (vite.config.ts, `tools/campaign-files.mjs`). */
const CAMPAIGN_ROUTE = '/__heat3d/campaign';

interface LocalRound {
  campaign: string;
  sessions: { n: number; start: string | null; name: string; bytes: number; id: number }[];
  missing: number;
}

/** The round's recordings the local server has, or null (a plain browser, no such round, none here). */
async function localRound(campaign: string): Promise<LocalRound | null> {
  try {
    const r = await fetch(`${CAMPAIGN_ROUTE}?name=${encodeURIComponent(campaign)}`);
    if (!r.ok) return null;
    const d = (await r.json()) as LocalRound;
    return Array.isArray(d.sessions) && d.sessions.length > 1 ? d : null;
  } catch {
    return null;
  }
}

/**
 * Every recording of the round fetched from the local server and loaded as
 * one series through the many-match loader (streamed, its keys sized to the
 * GPU: a round can be many gigabytes). `progress` hears each file fetched.
 */
async function loadRound(round: LocalRound, engine: ReturnType<typeof useEngine>, progress: (n: number) => void): Promise<boolean> {
  const files: File[] = [];
  for (const s of round.sessions) {
    const r = await fetch(`${CAMPAIGN_ROUTE}/file/${s.id}`);
    if (!r.ok) throw new Error(`${s.name}: ${r.status}`);
    files.push(new File([await r.blob()], s.name));
    progress(files.length);
  }
  return startLeanLoad(await expandContainerFiles(files), engine, false);
}

const mb = (bytes: number) => `${int(Math.round(bytes / 1e6))} MB`;

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
  const engine = useEngine();
  const dataset = useStore((s) => s.dataset);
  const rows = useMemo(() => (dataset?.series ? seriesStanding(dataset) : []), [dataset]);
  const one = useMemo(() => (dataset && !dataset.series ? oneSessionOf(dataset) : null), [dataset]);
  const [local, setLocal] = useState<LocalRound | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  // The round's places as objectives: coloured by who held them at each session's start, their captures listed.
  useEffect(() => {
    if (!dataset?.series) return;
    const co = campaignObjectives(dataset);
    if (!co) return;
    const st = useObjectivesStore.getState();
    st.addLite([{ match: co.match, objectives: co.objectives, ownerLabels: co.ownerLabels }]);
    st.addTimelines([co.timeline]);
  }, [dataset]);
  useEffect(() => {
    setLocal(null);
    setError(null);
    if (!one) return;
    let live = true;
    void localRound(one.campaign).then((r) => live && setLocal(r));
    return () => {
      live = false;
    };
  }, [one]);
  const sort = useSort<SeriesStanding>(
    'match.series',
    [
      { id: 'time', label: t('ui.sort.time'), key: (r) => r.start, kind: 'number', dir: 'asc' },
      { id: 'date', label: t('ui.sort.date'), key: (r) => r.realStart, kind: 'number', dir: 'asc' },
      { id: 'count', label: t('ui.sort.count'), key: (r) => r.taken, kind: 'number' },
    ],
    'time',
  );
  const sorted = useSorted(rows, sort);
  if (!dataset) return null;
  if (!dataset.series) {
    if (!one) return null;
    return (
      <Section title={t('match.series.title')} defaultOpen={!!local}>
        <div className="hint">{t('match.series.offer', { n: one.n, campaign: one.campaign })}</div>
        {local && (
          <>
            <button
              style={{ marginTop: 6 }}
              disabled={busy !== null}
              onClick={() => {
                setBusy(0);
                setError(null);
                loadRound(local, engine, setBusy)
                  .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)))
                  .finally(() => setBusy(null));
              }}
            >
              {busy !== null
                ? t('match.series.loading', { n: busy, of: local.sessions.length })
                : t('match.series.loadRound', { count: local.sessions.length, size: mb(local.sessions.reduce((a, s) => a + s.bytes, 0)) })}
            </button>
            {local.missing > 0 && <div className="hint">{t('match.series.missing', { count: local.missing })}</div>}
          </>
        )}
        {error && <div className="hint">{t('match.series.loadFailed', { error })}</div>}
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
      {rows.length > 1 && <SortControl sort={sort} />}
      <div style={{ maxHeight: 220, overflowY: 'auto', marginTop: 6 }}>
        {sorted.map((r) => (
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
