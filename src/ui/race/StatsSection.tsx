import { useMemo, useState } from 'react';
import type { Analysis } from '../../race/analysis';
import { rgbCss } from '../../race/geometry';
import { mistakeColor } from '../../race/scene';
import {
  classesOf,
  courseStats,
  lapsIn,
  mistakeCount,
  mistakeLabel,
  type CornerStat,
  type Mistake,
  type MistakeCount,
  type Occurrence,
} from '../../race/stats';
import type { Engine } from '../../render/engine';
import { useRaceStore } from '../../state/raceStore';
import { Section } from '../controls';
import { useEngine } from '../EngineContext';
import { int, list, num, t } from '../../i18n';
import { openMistakesInHeatmap, showEvent, showFinding } from './actions';
import { secs } from './RacePanel';

/** From this many laps the statistics say something. */
const FROM_LAPS = 3;
const BAR = rgbCss(mistakeColor(0.85));

/** Bring a corner into view. */
function frameSegment(analysis: Analysis, segment: number, engine: Engine | null): void {
  const seg = analysis.segments[segment];
  const ref = analysis.alignment.laps.find((l) => l.lap === analysis.alignment.reference)!;
  const step = analysis.alignment.grid[1] - analysis.alignment.grid[0];
  const from = Math.max(ref.first, seg.window.from);
  const to = Math.min(ref.last, seg.window.to);
  const at = Math.round((from + to) / 2);
  engine?.frameAround(ref.channels.x[at], ref.channels.y[at], ref.channels.z[at], Math.max(60, ((to - from) * step) / 2 + 40));
}

/** One lap's mistake: look at it - the lap in focus, lined up before it and replayed. */
function showOccurrence(o: Occurrence, engine: Engine | null): void {
  useRaceStore.getState().setFocus(o.lapId);
  if (o.finding !== undefined) showFinding(o.finding, engine);
  else if (o.event) showEvent(o.event, engine);
}

/**
 * Many laps of one course: what goes wrong, where, and in how many of the
 * laps - over the course and corner by corner, for every class or some. The
 * mistake map paints the same along the track; a mistake or a corner picked
 * here is what it shows.
 */
export function StatsSection() {
  const analysis = useRaceStore((s) => s.analysis);
  const mass = useRaceStore((s) => s.mass);
  const engine = useEngine();
  const [allMistakes, setAllMistakes] = useState(false);
  const [busy, setBusy] = useState(false);
  const ids = useMemo(() => (analysis ? lapsIn(analysis, mass.classes) : new Set<string>()), [analysis, mass.classes]);
  const stats = useMemo(() => (analysis ? courseStats(analysis, ids) : null), [analysis, ids]);
  if (!analysis || !stats || analysis.alignment.laps.length < FROM_LAPS) return null;
  const store = useRaceStore.getState();
  const classes = classesOf(analysis);
  const pickClass = (c: string, add: boolean) => {
    const now = mass.classes ?? [];
    const next = add ? (now.includes(c) ? now.filter((x) => x !== c) : [...now, c]) : now.length === 1 && now[0] === c ? [] : [c];
    store.patchMass({ classes: next.length ? next : null, segment: null });
  };
  const pickMistake = (m: Mistake) => {
    store.patchMass({ mistake: mass.mistake === m ? null : m });
    store.patchView({ map: 'mistakes' });
  };
  const openCorner = (k: number) => {
    const open = mass.segment === k ? null : k;
    store.patchMass({ segment: open });
    store.patchView({ map: 'mistakes' });
    if (open !== null) frameSegment(analysis, open, engine);
  };
  const listed = allMistakes ? stats.mistakes : stats.mistakes.slice(0, 8);
  return (
    <Section title={t('race.ui.stats.title')} defaultOpen right={<span className="count">{stats.laps}</span>}>
      <div className="hint">
        {classes.length > 1
          ? t('race.ui.stats.lapsClasses', { laps: stats.laps, cars: stats.cars, classes: classes.length })
          : t('race.ui.stats.laps', { laps: stats.laps, cars: stats.cars })}
      </div>
      {classes.length > 1 && (
        <div className="class-chips" title={t('race.ui.stats.classesTitle')}>
          <button className={!mass.classes ? 'on' : ''} onClick={() => store.patchMass({ classes: null, segment: null })}>
            {t('race.ui.stats.allClasses')} <span>{analysis.alignment.laps.length}</span>
          </button>
          {classes.map(([c, n]) => (
            <button key={c} className={mass.classes?.includes(c) ? 'on' : ''} onClick={(e) => pickClass(c, e.shiftKey)}>
              {c || '-'} <span>{n}</span>
            </button>
          ))}
        </div>
      )}
      <div className="stats-heading">{t('race.ui.stats.mostWrong')}</div>
      {stats.mistakes.length === 0 && <div className="hint">{t('race.ui.stats.noMistakes')}</div>}
      <div className="stat-list">
        {listed.map((m) => (
          <button
            key={m.mistake}
            className={`stat-row${mass.mistake === m.mistake ? ' on' : ''}`}
            onClick={() => pickMistake(m.mistake)}
            title={t('race.ui.stats.mistakeTitle')}
          >
            <span className="stat-top">
              <span className="stat-label">{mistakeLabel(m.mistake)}</span>
              <span className="mono">{t('race.ui.stats.lapsOf', { laps: int(m.laps), total: stats.laps })}</span>
            </span>
            <span className="stat-bar">
              <i style={{ width: `${(m.laps / stats.laps) * 100}%`, background: BAR }} />
            </span>
            <span className="stat-sub">
              {t('race.ui.stats.mistakeSub', {
                times: m.times,
                cost: num(m.cost, 1),
                corners: list(
                  m.corners
                    .slice(0, 3)
                    .map(([k, n]) => t('race.ui.stats.cornerCount', { corner: analysis.segments[k].label, count: int(n) })),
                ),
              })}
            </span>
          </button>
        ))}
      </div>
      {stats.mistakes.length > 8 && (
        <button className="link" onClick={() => setAllMistakes(!allMistakes)}>
          {allMistakes ? t('race.ui.stats.fewer') : t('race.ui.stats.allKinds', { count: stats.mistakes.length })}
        </button>
      )}
      <div className="stats-heading">
        {mass.mistake
          ? t('race.ui.stats.cornersOf', { mistake: mistakeLabel(mass.mistake) })
          : t('race.ui.stats.corners')}
      </div>
      <div className="stat-list">
        {stats.corners.map((c) => (
          <CornerRow
            key={c.segment}
            c={c}
            open={mass.segment === c.segment}
            only={mass.mistake}
            analysis={analysis}
            onOpen={() => openCorner(c.segment)}
            onLap={(o) => showOccurrence(o, engine)}
          />
        ))}
      </div>
      <button
        className="stats-heat"
        disabled={busy || stats.mistakes.length === 0}
        onClick={() => {
          setBusy(true);
          void openMistakesInHeatmap(engine).finally(() => setBusy(false));
        }}
        title={t('race.ui.stats.heatmapTitle')}
      >
        {busy ? t('race.ui.stats.building') : t('race.ui.stats.heatmap')}
      </button>
      <div className="hint">{t('race.ui.stats.hint')}</div>
    </Section>
  );
}

function CornerRow({
  c,
  open,
  only,
  analysis,
  onOpen,
  onLap,
}: {
  c: CornerStat;
  open: boolean;
  only: Mistake | null;
  analysis: Analysis;
  onOpen: () => void;
  onLap: (o: Occurrence) => void;
}) {
  const shown = only ? c.mistakes.filter((m) => m.mistake === only) : c.mistakes;
  return (
    <div className={`stat-corner${open ? ' on' : ''}`}>
      <button className="stat-corner-head" onClick={onOpen} title={t('race.ui.stats.cornerTitle')}>
        <span className="stat-label">{c.label}</span>
        <span className="mono">
          {t('race.ui.stats.cornerLost', { losing: int(c.losing), laps: int(c.laps), lost: num(c.lost, 1) })}
        </span>
      </button>
      {!open && shown.length > 0 && (
        <div className="stat-chips">
          {shown.slice(0, 3).map((m) => (
            <span key={m.mistake}>
              {mistakeLabel(m.mistake)} <b>{m.laps.length}</b>
            </span>
          ))}
        </div>
      )}
      {open && shown.length === 0 && (
        <div className="hint">{only ? t('race.ui.stats.noThatMistake') : t('race.ui.stats.noMistakeHere')}</div>
      )}
      {open && shown.map((m) => <MistakeDetail key={m.mistake} m={m} c={c} analysis={analysis} onLap={onLap} />)}
    </div>
  );
}

function MistakeDetail({
  m,
  c,
  analysis,
  onLap,
}: {
  m: MistakeCount;
  c: CornerStat;
  analysis: Analysis;
  onLap: (o: Occurrence) => void;
}) {
  const [all, setAll] = useState(false);
  const laps = all ? m.laps : m.laps.slice(0, 8);
  return (
    <div className="stat-detail">
      <p>
        {m.cars > 1
          ? t('race.ui.stats.detailCars', {
              count: mistakeCount(m.mistake, m.laps.length, c.laps, true),
              cars: m.cars,
              each: num(m.cost / m.laps.length, 2),
            })
          : t('race.ui.stats.detail', {
              count: mistakeCount(m.mistake, m.laps.length, c.laps, true),
              each: num(m.cost / m.laps.length, 2),
            })}
      </p>
      <div className="stat-laps">
        {laps.map((o) => (
          <button key={o.lapId} className="link" onClick={() => onLap(o)} title={t('race.ui.stats.lookAtLap')}>
            {analysis.names.get(o.lapId)} <span className="mono">{secs(o.cost)}</span>
          </button>
        ))}
        {m.laps.length > 8 && (
          <button className="link" onClick={() => setAll(!all)}>
            {all ? t('race.ui.stats.fewerLaps') : t('race.ui.stats.moreLaps', { count: m.laps.length - 8 })}
          </button>
        )}
      </div>
    </div>
  );
}
