import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { classOf, type Finding, type Phase } from '../../race/analysis';
import { carBody } from '../../race/carMatch';
import type { BodyKind } from '../../race/carBodies';
import type { CarPack } from '../../race/carPack';
import { carKey } from '../../race/envelope';
import type { CarProfile } from '../../race/profile';
import { describeBasis, describeEvent, FAULTS, type ControlKind, type ControlSummary } from '../../race/control';
import { CAUSE_COLORS, rgbCss } from '../../race/geometry';
import { carLabel, formatLapTime, unnamedCar, type LapTrace } from '../../race/lap';
import type { LineMetrics } from '../../race/line';
import { withUnit } from '../../race/schema';
import { causeGroup, lapColors } from '../../race/scene';
import { SHOW_ALL_UP_TO, useRaceStore, type RaceMap } from '../../state/raceStore';
import { useStore } from '../../state/store';
import { Check, Section, Segmented, Slider } from '../controls';
import { openPicker } from '../../data/filePick';
import { int, list, num, t } from '../../i18n';
import type { Values } from '../../i18n/message';
import { useEngine } from '../EngineContext';
import { lineUpAt, loadCarFile, loadDemoLaps, loadLapFiles, restoreCarFiles, showEvent, showFinding } from './actions';
import { StatsSection } from './StatsSection';
import { lengthArg, unitPrefs, useUnits } from '../../state/unitsStore';
import { formatIn } from '../../units/format';

export function signed(v: number, digits = 3): string {
  if (!Number.isFinite(v)) return '—';
  return `${v >= 0 ? '+' : '−'}${num(Math.abs(v), digits)}`;
}

/** Seconds, "1.23 s", written the language's way. */
export function secs(v: number, digits = 2): string {
  return withUnit(num(v, digits), 's');
}

/**
 * A message with React nodes in some of its places - a file name set in mono,
 * a lap's colour key - the rest of its values filled in as text.
 */
export function rich(key: string, nodes: Record<string, ReactNode>, values: Values = {}): ReactNode[] {
  const marks: Values = {};
  for (const name of Object.keys(nodes)) marks[name] = `\u0001${name}\u0001`;
  return t(key, { ...values, ...marks })
    .split('\u0001')
    .map((part, i) => (i % 2 === 1 && part in nodes ? <Fragment key={i}>{nodes[part]}</Fragment> : part));
}

/** What caused a loss, as the breakdown and the cause map name it. */
export function causeLabel(group: string): string {
  switch (group) {
    case 'braking':
      return t('race.ui.cause.braking');
    case 'entry':
      return t('race.ui.cause.entry');
    case 'exit':
      return t('race.ui.cause.exit');
    case 'straight':
      return t('race.ui.cause.straight');
    case 'car':
      return t('race.ui.cause.car');
    case 'context':
      return t('race.ui.cause.context');
    default:
      return group;
  }
}

/** A short stroke of a lap's colour: its identity beside text that stays in text colours. */
export function LineKey({ color, dashed = false }: { color: string; dashed?: boolean }) {
  return (
    <svg width="16" height="8" aria-hidden className="line-key">
      <line
        x1="1"
        y1="4"
        x2="15"
        y2="4"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={dashed ? '3 3' : undefined}
      />
    </svg>
  );
}

/** The viewer's own bodies, by name: `t` looks each key up by its full text. */
const BODY_NAMES: Record<BodyKind, () => string> = {
  saloon: () => t('race.ui.shapes.body.saloon'),
  coupe: () => t('race.ui.shapes.body.coupe'),
  hatch: () => t('race.ui.shapes.body.hatch'),
  estate: () => t('race.ui.shapes.body.estate'),
  sports: () => t('race.ui.shapes.body.sports'),
  supercar: () => t('race.ui.shapes.body.supercar'),
  muscle: () => t('race.ui.shapes.body.muscle'),
  suv: () => t('race.ui.shapes.body.suv'),
  pickup: () => t('race.ui.shapes.body.pickup'),
  van: () => t('race.ui.shapes.body.van'),
  micro: () => t('race.ui.shapes.body.micro'),
};

/** What a lap's car is drawn as, and how near that is. */
function shapeLine(lap: LapTrace, packs: CarPack[]): string {
  const { match, model } = carBody(lap, packs);
  const name = match.car
    ? (model?.name ?? '')
    : (match.spec?.name ?? t('race.ui.shapes.body', { body: BODY_NAMES[match.body](), era: match.era }));
  return t('race.ui.shapes.drawnAs', { kind: match.kind, name });
}

/** The car files in use, and how to add one. */
function CarFiles() {
  const packs = useRaceStore((s) => s.carPacks);
  const focus = useRaceStore((s) => s.laps.find((l) => l.id === s.focusId));
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    void restoreCarFiles();
  }, []);
  const count = packs.reduce((sum, p) => sum + p.cars.length, 0);
  return (
    <div style={{ marginTop: 8 }}>
      <div className="row wrap" style={{ gap: 8, alignItems: 'center' }}>
        <button type="button" onClick={() => input.current?.click()}>
          {t('race.ui.shapes.load')}
        </button>
        <span className="hint">{count ? t('race.ui.shapes.loaded', { count }) : t('race.ui.shapes.none')}</span>
      </div>
      <input
        ref={input}
        type="file"
        accept=".h3dcars"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (!file) return;
          setError(null);
          loadCarFile(file).catch((why: unknown) => setError(why instanceof Error ? why.message : String(why)));
        }}
      />
      {!count && <div className="hint mono">python -m heat3d_gamefiles cars</div>}
      {focus && <div className="hint">{shapeLine(focus, packs)}</div>}
      {error && <div className="hint">{error}</div>}
    </div>
  );
}

function LapsSection() {
  const laps = useRaceStore((s) => s.laps);
  const carPacks = useRaceStore((s) => s.carPacks);
  const hidden = useRaceStore((s) => s.hidden);
  const analysis = useRaceStore((s) => s.analysis);
  const focusId = useRaceStore((s) => s.focusId);
  const follow = useRaceStore((s) => s.follow);
  const error = useRaceStore((s) => s.error);
  const store = useRaceStore.getState();
  const engine = useEngine();
  const input = useRef<HTMLInputElement>(null);
  const colors = useMemo(() => lapColors({ laps }), [laps]);
  const courses = useRaceStore((s) => s.courses);
  const ref = analysis?.alignment.reference;
  const classes = analysis?.classBest.size ?? 0;

  return (
    <Section title={t('race.ui.laps.title')} defaultOpen right={<span className="count">{laps.length || ''}</span>}>
      <div className="row wrap" style={{ gap: 6 }}>
        <button className="primary" onClick={() => input.current?.click()} title={t('race.ui.laps.loadTitle')}>
          {t('race.ui.laps.load')}
        </button>
        <button
          onClick={() =>
            void openPicker(true).then((files) => {
              if (files.length) void loadLapFiles(files, () => engine?.frameDataset(true));
            })
          }
          title={t('race.ui.laps.folderTitle')}
        >
          {t('race.ui.laps.folder')}
        </button>
        <button onClick={() => loadDemoLaps()} title={t('race.ui.laps.demoTitle')}>
          {t('race.ui.laps.demo')}
        </button>
        {laps.length > 0 && (
          <button className="link" onClick={() => store.clearLaps()}>
            {t('race.ui.laps.clear')}
          </button>
        )}
        <input
          ref={input}
          type="file"
          multiple
          accept=".json,.csv,.txt,.ibt,.gz,.h3dcars"
          style={{ display: 'none' }}
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            e.target.value = '';
            void loadLapFiles(files, () => engine?.frameDataset(true));
          }}
        />
      </div>
      {error && <pre className="hint race-error">{error}</pre>}
      {courses && (
        <div className="course-choice">
          <div className="hint">{t('race.ui.laps.courses', { count: courses.length })}</div>
          {courses.map((c) => (
            <button key={c.key} onClick={c.load}>
              <span>{c.name}</span>
              <span className="mono">{t('race.ui.laps.courseLaps', { count: c.laps })}</span>
            </button>
          ))}
        </div>
      )}
      {laps.length > SHOW_ALL_UP_TO && (
        <div className="row wrap lap-show">
          <span className="hint">
            {t('race.ui.laps.drawn', { drawn: int(laps.filter((l) => !hidden[l.id]).length), total: int(laps.length) })}
          </span>
          <button className="link" onClick={() => store.showLaps(true)} title={t('race.ui.laps.showAllTitle')}>
            {t('race.ui.laps.showAll')}
          </button>
          <button className="link" onClick={() => store.showLaps(false)} title={t('race.ui.laps.lookedAtTitle')}>
            {t('race.ui.laps.lookedAt')}
          </button>
        </div>
      )}
      {laps.length === 0 && (
        <div className="hint">
          {rich('race.ui.laps.empty', {
            recorder: <span className="mono">heat3d_capture telemetry</span>,
            ibt: <span className="mono">.ibt</span>,
          })}
        </div>
      )}
      <div className="lap-list">
        {laps.map((lap) => {
          const isRef = lap === ref;
          const aligned = analysis?.alignment.laps.find((l) => l.lap === lap);
          // Against the best of its own class: what it is compared with.
          const bestId = analysis?.classBest.get(classOf(lap));
          const best = laps.find((l) => l.id === bestId) ?? ref;
          const isBest = classes > 1 && lap === best && !isRef;
          const gap = best ? lap.seconds - best.seconds : Number.NaN;
          return (
            <div
              key={lap.id}
              className={`lap-row${hidden[lap.id] ? ' off' : ''}${focusId === lap.id ? ' focus' : ''}`}
            >
              <button
                className="icon"
                title={hidden[lap.id] ? t('race.ui.laps.show') : t('race.ui.laps.hide')}
                onClick={() => store.toggleLap(lap.id)}
              >
                {hidden[lap.id] ? '○' : '●'}
              </button>
              <LineKey color={rgbCss(colors.get(lap.id)!)} />
              <div
                className="lap-main"
                onClick={() => store.setFocus(lap.id)}
                title={`${lap.source}\n${carLabel(lap.car)}\n${shapeLine(lap, carPacks)}`}
              >
                <div className="lap-name">
                  {lap.label}
                  {isRef && <span className="tag">{t('race.ui.laps.reference')}</span>}
                  {isBest && (
                    <span className="tag">
                      {classOf(lap) ? t('race.ui.laps.bestOf', { cls: classOf(lap) }) : t('race.ui.laps.bestOfClass')}
                    </span>
                  )}
                  {!lap.complete && <span className="tag warn">{t('race.ui.laps.partial')}</span>}
                </div>
                <div className="lap-sub mono">
                  {classes > 1 && <span className="class-tag">{classOf(lap) || '-'}</span>}
                  {formatLapTime(lap.seconds)}{' '}
                  {lap !== best && Number.isFinite(gap) && <span>{signed(gap)}</span>}
                  {aligned && aligned.first > 5 && <span className="warn"> · {t('race.ui.laps.startsLate')}</span>}
                </div>
              </div>
              <button
                className={`icon${follow === lap.id ? ' on' : ''}`}
                title={t('race.ui.laps.chase')}
                onClick={() => store.setFollow(follow === lap.id ? null : lap.id)}
              >
                ⌖
              </button>
              <button
                className="icon"
                title={t('race.ui.laps.makeReference')}
                disabled={isRef}
                onClick={() => store.setReference(lap.id)}
              >
                ★
              </button>
              <button className="icon" title={t('race.ui.laps.remove')} onClick={() => store.removeLap(lap.id)}>
                ×
              </button>
            </div>
          );
        })}
      </div>
      <MirrorHint />
      {laps.length > 1 && (
        <div className="hint">
          {t('race.ui.laps.clickHint')}
          {classes > 1 && ` ${t('race.ui.laps.classesHint')}`}
        </div>
      )}
    </Section>
  );
}

/** Where in a corner a driving loss was, as its chip names it. */
function phaseLabel(phase: Phase): string {
  switch (phase) {
    case 'braking':
      return t('race.ui.finding.phase.braking');
    case 'entry':
      return t('race.ui.finding.phase.entry');
    case 'exit':
      return t('race.ui.finding.phase.exit');
    case 'straight':
      return t('race.ui.finding.phase.straight');
  }
}

function chipLabel(f: Finding): string {
  if (f.outcome === 'gain') return t('race.ui.finding.quicker');
  if (f.outcome === 'even') return t('race.ui.finding.level');
  if (f.source === 'context') return t('race.ui.finding.context');
  if (f.source === 'car') return t('race.ui.finding.car');
  return f.carCost >= 0.02
    ? t('race.ui.finding.phaseAndCar', { phase: phaseLabel(f.phase), cost: num(f.carCost, 2) })
    : phaseLabel(f.phase);
}

function FindingRow({
  f,
  index,
  rank,
  top,
  color,
}: {
  f: Finding;
  index: number;
  rank: number;
  top: number;
  color: string;
}) {
  const selected = useRaceStore((s) => s.selected);
  const engine = useEngine();
  const open = selected === index;
  return (
    <button
      className={`finding ${f.outcome}${open ? ' on' : ''}`}
      onClick={() => showFinding(index, engine)}
      title={t('race.ui.finding.replay')}
    >
      <span className="rank">{rank}</span>
      <span className="finding-main">
        <span className="finding-title">{f.title}</span>
        <span className="finding-evidence">{f.evidence}</span>
        {open && (
          <>
            {f.details.length > 0 && (
              <ul className="finding-details">
                {f.details.map((d, k) => (
                  <li key={k}>{d}</li>
                ))}
              </ul>
            )}
            {f.tip && <span className="finding-tip">{f.tip}</span>}
            {f.cars && (
              <span className="finding-cars">
                <b>{t('race.ui.finding.cars')} </b>
                {f.cars}
              </span>
            )}
            {f.line && <span className="finding-line">{f.line}</span>}
          </>
        )}
      </span>
      <span className="finding-cost">
        <span className="mono">
          {withUnit(`${f.outcome === 'loss' ? '' : f.cost < 0 ? '−' : '+'}${num(Math.abs(f.cost), 2)}`, 's')}
        </span>
        <span className="cost-bar">
          <i
            style={{
              width: `${Math.max(4, (Math.abs(f.cost) / top) * 100)}%`,
              background: color,
            }}
          />
        </span>
        <span className="chip">{chipLabel(f)}</span>
      </span>
    </button>
  );
}

/**
 * When the laps' own steering and suspension say the course is drawn the wrong
 * way round - a right-hand bend shown as a left-hand one - offer the fix.
 */
function MirrorHint() {
  const analysis = useRaceStore((s) => s.analysis);
  const mirror = useStore((s) => s.camera.mirror);
  const patchCamera = useStore((s) => s.patchCamera);
  if (!analysis || analysis.mirrored === null) return null;
  const flipped = [mirror.x, mirror.y, mirror.z].filter(Boolean).length % 2 === 1;
  if (analysis.mirrored === flipped) return null;
  return (
    <div className="hint race-mirror">
      {analysis.mirrored ? t('race.ui.mirror.gameMirrored') : t('race.ui.mirror.axesInverted')}{' '}
      <button
        className="link"
        onClick={() =>
          patchCamera({
            mirror: analysis.mirrored ? { ...mirror, x: !mirror.x } : { x: false, y: false, z: false },
          })
        }
      >
        {analysis.mirrored ? t('race.ui.mirror.invertX') : t('race.ui.mirror.resetAxes')}
      </button>
    </div>
  );
}

function InsightsSection() {
  const analysis = useRaceStore((s) => s.analysis);
  const focusId = useRaceStore((s) => s.focusId);
  const laps = useRaceStore((s) => s.laps);
  const [showCar, setShowCar] = useState(true);
  const [showGains, setShowGains] = useState(true);
  const colors = useMemo(() => lapColors({ laps }), [laps]);
  if (!analysis || !focusId) {
    return (
      <Section title={t('race.ui.insights.title')} defaultOpen>
        <div className="hint">{t('race.ui.insights.empty')}</div>
      </Section>
    );
  }
  const lap = laps.find((l) => l.id === focusId)!;
  const ref = analysis.alignment.reference;
  const name = (id: string) => analysis.names.get(id) ?? '';
  const colour = (id: string) => rgbCss(colors.get(id) ?? [0.6, 0.6, 0.6]);
  const mine = analysis.findings.map((f, i) => ({ f, i })).filter(({ f }) => f.lapId === focusId);
  const losses = mine.filter(({ f }) => f.outcome === 'loss');
  const driver = losses.filter(({ f }) => f.source === 'driver');
  const other = losses.filter(({ f }) => f.source !== 'driver');
  const gains = mine.filter(({ f }) => f.outcome !== 'loss');
  const lost = losses.reduce((s, { f }) => s + f.cost, 0);
  const byCar = losses.reduce((s, { f }) => s + (f.source === 'driver' ? f.carCost : f.cost), 0);
  const isRef = lap === ref;
  const opponents = [...new Set(mine.map(({ f }) => f.againstId))];
  // Time lost by cause group, for the breakdown bar.
  const groups = new Map<string, number>();
  for (const { f } of losses) groups.set(causeGroup(f), (groups.get(causeGroup(f)) ?? 0) + f.cost);
  const top = Math.max(1e-3, ...mine.map(({ f }) => Math.abs(f.cost)));
  const lossColor = (f: Finding) => rgbCss(CAUSE_COLORS[causeGroup(f)]);

  return (
    <Section title={t('race.ui.insights.title')} defaultOpen>
      <div className="insight-head">
        <div>
          <div className="stat-label">
            {isRef
              ? rich(
                  opponents.length > 0 ? 'race.ui.insights.againstQuickestOf' : 'race.ui.insights.againstQuickest',
                  { key: <LineKey color={colour(lap.id)} /> },
                  { name: name(lap.id), time: formatLapTime(lap.seconds), others: list(opponents.map(name)) },
                )
              : rich(
                  'race.ui.insights.against',
                  { key: <LineKey color={colour(lap.id)} />, refKey: <LineKey color={colour(ref.id)} /> },
                  {
                    name: name(lap.id),
                    time: formatLapTime(lap.seconds),
                    refName: name(ref.id),
                    refTime: formatLapTime(ref.seconds),
                  },
                )}
          </div>
          <div className="stat-value mono">
            {isRef ? secs(lost) : withUnit(signed(lap.seconds - ref.seconds, 2), 's')}
          </div>
        </div>
        <div className="stat-side">
          <div>
            {rich('race.ui.insights.driving', { time: <span className="mono">{secs(Math.max(0, lost - byCar))}</span> })}
          </div>
          <div>
            {rich('race.ui.insights.carContext', { time: <span className="mono">{secs(byCar)}</span> })}
          </div>
        </div>
      </div>
      {groups.size > 0 && (
        <div className="breakdown" title={t('race.ui.insights.byCause')}>
          {[...groups.entries()].map(([g, v]) => (
            <i
              key={g}
              style={{ flex: v, background: rgbCss(CAUSE_COLORS[g]) }}
              title={t('race.ui.insights.causeCost', { cause: causeLabel(g), cost: num(v, 2) })}
            />
          ))}
        </div>
      )}
      <div className="legend-row">
        {[...groups.keys()].map((g) => (
          <span key={g}>
            <i style={{ background: rgbCss(CAUSE_COLORS[g]) }} />
            {causeLabel(g)}
          </span>
        ))}
      </div>
      <div className="findings">
        {driver.length === 0 && <div className="hint">{t('race.ui.insights.nothing')}</div>}
        {driver.slice(0, 12).map(({ f, i }, k) => (
          <FindingRow key={i} f={f} index={i} rank={k + 1} top={top} color={lossColor(f)} />
        ))}
      </div>
      {other.length > 0 && (
        <>
          <Check
            label={t('race.ui.insights.showCar', { cost: num(other.reduce((s, { f }) => s + f.cost, 0), 2) })}
            checked={showCar}
            onChange={setShowCar}
          />
          {showCar && (
            <div className="findings">
              {other.slice(0, 8).map(({ f, i }, k) => (
                <FindingRow key={i} f={f} index={i} rank={k + 1} top={top} color={lossColor(f)} />
              ))}
            </div>
          )}
        </>
      )}
      {gains.length > 0 && (
        <>
          <Check
            label={t('race.ui.insights.showGains', { name: name(lap.id), count: int(gains.length) })}
            checked={showGains}
            onChange={setShowGains}
          />
          {showGains && (
            <div className="findings">
              {gains.slice(0, 10).map(({ f, i }, k) => (
                <FindingRow key={i} f={f} index={i} rank={k + 1} top={top} color={colour(f.lapId)} />
              ))}
            </div>
          )}
        </>
      )}
      <div className="hint">{t('race.ui.insights.hint')}</div>
    </Section>
  );
}

const SHAPE: Record<string, string> = { V: 'V', U: 'U', between: 'U/V' };

/** Where a line apexed, as the corner table says it. */
function apexLabel(apex: LineMetrics['apex']): string {
  switch (apex) {
    case 'early':
      return t('race.ui.corners.apex.early');
    case 'middle':
      return t('race.ui.corners.apex.middle');
    case 'late':
      return t('race.ui.corners.apex.late');
  }
}

/** Who was quickest through each corner, on which line - and the best of them put together. */
function CornersSection() {
  const analysis = useRaceStore((s) => s.analysis);
  const laps = useRaceStore((s) => s.laps);
  const focusId = useRaceStore((s) => s.focusId);
  const engine = useEngine();
  const colors = useMemo(() => lapColors({ laps }), [laps]);
  if (!analysis || analysis.segments.length === 0 || laps.length < 2) return null;
  const step = analysis.alignment.grid[1] - analysis.alignment.grid[0];
  const name = (id: string) => analysis.names.get(id) ?? '';
  // Laps of several classes: the focused lap's class, whose best it is measured against.
  const multi = analysis.classBest.size > 1;
  const cls = classOf(laps.find((l) => l.id === focusId) ?? analysis.alignment.reference);
  const ids = analysis.alignment.laps.filter((l) => !multi || classOf(l.lap) === cls).map((l) => l.lap.id);
  let best = 0;
  let complete = true;
  const rows = analysis.segments.map((seg, k) => {
    const times = ids
      .map((id) => ({ id, t: analysis.segmentTimes.get(id)!.corners[k] }))
      .filter((x) => Number.isFinite(x.t))
      .sort((a, b) => a.t - b.t);
    const quickest = times[0];
    if (quickest) best += quickest.t;
    else complete = false;
    const focus = focusId ? analysis.segmentTimes.get(focusId)!.corners[k] : Number.NaN;
    const line = quickest ? analysis.lines.get(quickest.id)![k] : null;
    return {
      seg,
      quickest,
      margin: times.length > 1 ? times[1].t - times[0].t : Number.NaN,
      behind: quickest && focusId && focusId !== quickest.id ? focus - quickest.t : Number.NaN,
      line,
    };
  });
  const starts = ids
    .map((id) => analysis.segmentTimes.get(id)!.start)
    .filter((s) => Number.isFinite(s) && s > 0);
  if (starts.length) best += Math.min(...starts);
  const classBest = laps.find((l) => l.id === analysis.classBest.get(cls));
  const refTime = multi && classBest ? classBest.seconds : analysis.alignment.reference.seconds;
  const open = (corner: number, start: number) => {
    const i = analysis.findings.findIndex((f) => f.lapId === focusId && f.corner === corner);
    if (i >= 0) showFinding(i, engine);
    else lineUpAt(Math.max(0, start * step - 40));
  };
  // A narrow column: an unnamed car by its number alone.
  const narrow = (id: string) => {
    const car = laps.find((l) => l.id === id)?.car;
    const word = car && !car.name && car.ordinal !== undefined ? unnamedCar(car.ordinal) : '';
    return word && name(id).startsWith(word) ? `${car!.ordinal}${name(id).slice(word.length)}` : name(id);
  };
  return (
    <Section
      title={multi ? t('race.ui.corners.titleClass', { cls: cls || '-' }) : t('race.ui.corners.title')}
      defaultOpen
    >
      <table className="corner-table mono">
        <thead>
          <tr>
            <th>{t('race.ui.corners.corner')}</th>
            <th>{t('race.ui.corners.quickest')}</th>
            <th>{t('race.ui.corners.by')}</th>
            <th>{t('race.ui.corners.line')}</th>
            {focusId && <th title={t('race.ui.corners.focusTitle', { name: name(focusId) })}>{narrow(focusId)}</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ seg, quickest, margin, behind, line }) => (
            <tr key={seg.corner} onClick={() => open(seg.corner, seg.start)} title={t('race.ui.corners.lookAt')}>
              <td>{seg.label}</td>
              <td className="who">
                {quickest && (
                  <>
                    <LineKey color={rgbCss(colors.get(quickest.id) ?? [0.6, 0.6, 0.6])} />
                    {name(quickest.id)}
                  </>
                )}
              </td>
              <td>{Number.isFinite(margin) ? num(margin, 2) : '—'}</td>
              <td
                title={
                  line
                    ? t('race.ui.corners.radii', {
                        tightest: lengthArg(line.radiusMin),
                        entry: lengthArg(line.radiusIn),
                        exit: lengthArg(line.radiusOut),
                      })
                    : ''
                }
              >
                {line
                  ? t('race.ui.corners.lineShape', { shape: SHAPE[line.shape], apex: apexLabel(line.apex) })
                  : seg.mixed
                    ? t('race.ui.corners.bothWays')
                    : '—'}
              </td>
              {focusId && <td>{Number.isFinite(behind) ? `+${num(behind, 2)}` : focusId === quickest?.id ? '✓' : '—'}</td>}
            </tr>
          ))}
        </tbody>
      </table>
      {complete && (
        <div className="hint">
          {rich(
            !Number.isFinite(refTime)
              ? 'race.ui.corners.together'
              : multi
                ? 'race.ui.corners.togetherOnClass'
                : 'race.ui.corners.togetherOnReference',
            {
              time: <span className="mono">{formatLapTime(best)}</span>,
              diff: <span className="mono">{signed(best - refTime, 2)}</span>,
            },
            { cls: cls || '-' },
          )}{' '}
          {t('race.ui.corners.hint')}
        </div>
      )}
    </Section>
  );
}

/** The car-control table's rows: which kinds of event each counts, and what it is called. */
const controlRows = (): Array<[ControlKind[], string]> => [
  [['lock'], t('race.ui.control.rows.lock')],
  [['wheelspin'], t('race.ui.control.rows.wheelspin')],
  [['oversteer', 'spin'], t('race.ui.control.rows.oversteer')],
  [['understeer'], t('race.ui.control.rows.understeer')],
  [['crash'], t('race.ui.control.rows.crash')],
  [['hit'], t('race.ui.control.rows.hit')],
  [['abs'], t('race.ui.control.rows.abs')],
  [['tc'], t('race.ui.control.rows.tc')],
  [['handbrake'], t('race.ui.control.rows.handbrake')],
  [['airborne'], t('race.ui.control.rows.airborne')],
];

/** What kind of event it was, as its chip says. */
function kindLabel(kind: ControlKind): string {
  switch (kind) {
    case 'lock':
      return t('race.ui.control.kind.lock');
    case 'wheelspin':
      return t('race.ui.control.kind.wheelspin');
    case 'oversteer':
      return t('race.ui.control.kind.oversteer');
    case 'spin':
      return t('race.ui.control.kind.spin');
    case 'understeer':
      return t('race.ui.control.kind.understeer');
    case 'hit':
      return t('race.ui.control.kind.hit');
    case 'crash':
      return t('race.ui.control.kind.crash');
    case 'abs':
      return t('race.ui.control.kind.abs');
    case 'tc':
      return t('race.ui.control.kind.tc');
    case 'handbrake':
      return t('race.ui.control.kind.handbrake');
    case 'airborne':
      return t('race.ui.control.kind.airborne');
  }
}

/** The ground the drift limit is measured for. */
function surfaceLabel(surface: ControlSummary['surface']): string {
  switch (surface) {
    case 'tarmac':
      return t('race.ui.control.surface.tarmac');
    case 'loose':
      return t('race.ui.control.surface.loose');
    case 'mixed':
      return t('race.ui.control.surface.mixed');
  }
}

/**
 * Car control: every lock, spin, slide and push of the focused lap, each laid
 * against the lap it is compared with there - what only this lap did, and
 * what it cost.
 */
function ControlSection() {
  const analysis = useRaceStore((s) => s.analysis);
  const focusId = useRaceStore((s) => s.focusId);
  const laps = useRaceStore((s) => s.laps);
  const engine = useEngine();
  const [all, setAll] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  if (!analysis || !focusId) return null;
  const lap = laps.find((l) => l.id === focusId);
  const events = analysis.control.get(focusId) ?? [];
  const summary = analysis.controlSummary.get(focusId);
  if (!lap || !summary) return null;
  const name = (id: string) => analysis.names.get(id) ?? '';
  const againstId = events[0]?.againstId ?? analysis.alignment.laps.find((l) => l.lap.id !== focusId)?.lap.id;
  const theirs = againstId ? analysis.controlSummary.get(againstId) : undefined;
  const step = analysis.alignment.grid[1] - analysis.alignment.grid[0];
  const faults = events
    .filter((e) => FAULTS.has(e.kind))
    .filter((e) => all || (!e.shared && e.cost >= 0.02))
    .sort((a, b) => b.cost - a.cost || a.from - b.from);
  const { slip, drift } = summary.basis;
  const basis = describeBasis(summary.basis);
  const show = (e: (typeof events)[number]) => showEvent(e, engine);
  const count = (s: typeof summary | undefined, kinds: ControlKind[]) =>
    s ? kinds.reduce((n, k) => n + s.counts[k], 0) : 0;
  const secondsOf = (s: typeof summary | undefined, kinds: ControlKind[]) =>
    s ? kinds.reduce((n, k) => n + s.seconds[k], 0) : 0;
  const cell = (s: typeof summary | undefined, kinds: ControlKind[]) =>
    t('race.ui.control.cell', { count: int(count(s, kinds)), time: secs(secondsOf(s, kinds), 1) });
  const degrees = (rad: number) => withUnit(num((rad * 180) / Math.PI, 0), '°');
  return (
    <Section title={t('race.ui.control.title')} defaultOpen>
      <table className="corner-table mono control-table">
        <thead>
          <tr>
            <th />
            <th>{name(focusId)}</th>
            {theirs && <th>{name(theirs.lapId)}</th>}
          </tr>
        </thead>
        <tbody>
          {controlRows()
            .filter(([k]) => count(summary, k) + count(theirs, k) > 0)
            .map(([kinds, label]) => (
              <tr key={kinds[0]}>
                <td>{label}</td>
                <td>{cell(summary, kinds)}</td>
                {theirs && <td>{cell(theirs, kinds)}</td>}
              </tr>
            ))}
          {drift && (
            <tr>
              <td>{t('race.ui.control.mostDrift')}</td>
              <td>{degrees(summary.maxDrift)}</td>
              {theirs && <td>{degrees(theirs.maxDrift)}</td>}
            </tr>
          )}
        </tbody>
      </table>
      <div className="findings">
        {faults.length === 0 && (
          <div className="hint">
            {againstId
              ? t('race.ui.control.nothing', { name: name(focusId), other: name(againstId) })
              : t('race.ui.control.nothingOther', { name: name(focusId) })}
          </div>
        )}
        {faults.slice(0, 12).map((e, k) => {
          const said = describeEvent(e, name(e.lapId), name(e.againstId), lap, step);
          const i = events.indexOf(e);
          return (
            <button
              key={i}
              className={`finding ${e.shared ? 'even' : 'loss'}${open === i ? ' on' : ''}`}
              onClick={() => {
                setOpen(i);
                show(e);
              }}
              title={t('race.ui.finding.replay')}
            >
              <span className="rank">{k + 1}</span>
              <span className="finding-main">
                <span className="finding-title">{said.title}</span>
                {open === i && <span className="finding-tip">{said.tip}</span>}
              </span>
              <span className="finding-cost">
                <span className="mono">{e.cost >= 0.01 ? secs(e.cost) : '—'}</span>
                <span className="chip">{e.shared ? t('race.ui.control.bothDid') : kindLabel(e.kind)}</span>
              </span>
            </button>
          );
        })}
      </div>
      <Check
        label={t('race.ui.control.showShared')}
        checked={all}
        onChange={setAll}
        title={t('race.ui.control.showSharedTitle')}
      />
      <div className="hint">
        {basis} {slip || drift ? `${t('race.ui.control.limits', { surface: surfaceLabel(summary.surface) })} ` : ''}
        {againstId
          ? t('race.ui.control.laidAgainst', { other: name(againstId) })
          : t('race.ui.control.laidAgainstOther')}{' '}
        {t('race.ui.control.cost')}
      </div>
      {!slip && !drift && (
        <div className="hint">{rich('race.ui.control.fullTelemetry', { file: <span className="mono">.tele.gz</span> })}</div>
      )}
    </Section>
  );
}

/**
 * A row of the car table: what it shows, the value from a profile, how to
 * print it, which way is better, and what to say where a car has no value.
 */
type ProfileRow = [string, (p: CarProfile) => number, (v: number) => string, 'higher' | 'lower' | null, string?];

const kmhOf = (v: number) => formatIn('speed', v, unitPrefs(), 0);
const oneDigit = (v: number) => num(v, 1);
const profileRows = (): ProfileRow[] => [
  [t('race.ui.cars.rows.grip'), (p) => p.grip, oneDigit, 'higher'],
  [t('race.ui.cars.rows.pullLaunch'), (p) => p.pull.launch, oneDigit, 'higher'],
  [t('race.ui.cars.rows.pullLow'), (p) => p.pull.low, oneDigit, 'higher'],
  [t('race.ui.cars.rows.pullMid'), (p) => p.pull.mid, oneDigit, 'higher'],
  [t('race.ui.cars.rows.pullHigh'), (p) => p.pull.high, oneDigit, 'higher'],
  [t('race.ui.cars.rows.braking'), (p) => p.braking, oneDigit, 'higher'],
  [t('units.race.vmax'), (p) => p.vmax, kmhOf, 'higher'],
  [t('units.race.topsOut'), (p) => p.topsOut, kmhOf, 'higher', t('race.ui.cars.stillPulling')],
  [t('race.ui.cars.rows.pullAtTop'), (p) => p.pullAtTop, oneDigit, null],
  [t('race.ui.cars.rows.rearSlides'), (p) => p.rearSlides, oneDigit, 'lower'],
  [t('race.ui.cars.rows.sideways'), (p) => p.sideways, (v) => withUnit(num(v * 100, 0), '%'), null],
];

/** The cars' measured character, side by side; a row only where a car has a value. */
function ProfileTable({ profiles, labels }: { profiles: CarProfile[]; labels: string[] }) {
  useUnits();
  const rows = profileRows().filter(([, get]) => profiles.some((p) => Number.isFinite(get(p))));
  return (
    <table className="mono">
      <thead>
        <tr>
          <th />
          {labels.map((l) => (
            <th key={l}>{l}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(([label, get, show, better, missing]) => {
          const values = profiles.map(get);
          const finite = values.filter(Number.isFinite);
          const best = better === 'higher' ? Math.max(...finite) : better === 'lower' ? Math.min(...finite) : Number.NaN;
          const clear = finite.length > 1 && Math.abs(Math.max(...finite) - Math.min(...finite)) > 0.03 * Math.max(...finite.map(Math.abs));
          return (
            <tr key={label}>
              <td>{label}</td>
              {values.map((v, k) => (
                <td key={k} className={clear && v === best ? 'better' : ''}>
                  {Number.isFinite(v) ? show(v) : (missing ?? '—')}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/**
 * What kind of car each is - grip held, pull at each speed, where it runs out
 * of pull, braking, how often its rear had to be caught - and, between two
 * cars, what each is better at and how to drive it.
 */
/** Past this many pairs, one is shown: the focused lap's car against one picked. */
const ALL_PAIRS_UP_TO = 3;

function CarsSection() {
  const analysis = useRaceStore((s) => s.analysis);
  const focusId = useRaceStore((s) => s.focusId);
  const laps = useRaceStore((s) => s.laps);
  const [picked, setPicked] = useState<string | null>(null);
  if (!analysis || analysis.profiles.size === 0) return null;
  const single = analysis.cars.length === 0;
  // Many cars: the focused lap's car, against the car of its class's best
  // lap (or the reference's), or another picked.
  const focus = laps.find((l) => l.id === focusId) ?? analysis.alignment.reference;
  const mine = carKey(focus);
  const bestLap = laps.find((l) => l.id === analysis.classBest.get(classOf(focus)));
  const others = [...analysis.profiles.keys()].filter((k) => k !== mine);
  const fallback = [bestLap && carKey(bestLap), carKey(analysis.alignment.reference), others[0]].find(
    (k) => k && k !== mine && analysis.profiles.has(k),
  );
  const against = picked && picked !== mine && analysis.profiles.has(picked) ? picked : fallback;
  const pairs =
    analysis.cars.length <= ALL_PAIRS_UP_TO
      ? analysis.cars
      : analysis.cars.filter((c) => (c.a === mine && c.b === against) || (c.b === mine && c.a === against));
  return (
    <Section title={single ? t('race.ui.cars.titleOne') : t('race.ui.cars.title')} defaultOpen>
      {analysis.cars.length > ALL_PAIRS_UP_TO && (
        <div className="row wrap car-pick">
          <span className="hint">{t('race.ui.cars.against', { car: analysis.carNames.get(mine) ?? '' })}</span>
          <select value={against ?? ''} onChange={(e) => setPicked(e.target.value)}>
            {others.map((k) => (
              <option key={k} value={k}>
                {analysis.carNames.get(k)}
              </option>
            ))}
          </select>
        </div>
      )}
      {single
        ? [...analysis.profiles].map(([key, p]) => (
            <div key={key} className="car-compare">
              <ProfileTable profiles={[p]} labels={[analysis.carNames.get(key) ?? '']} />
              {(analysis.carWords.get(key) ?? []).map((a, i) => (
                <p key={i} className="advice">
                  {a}
                </p>
              ))}
            </div>
          ))
        : pairs.map((c) => (
            <div key={`${c.a}|${c.b}`} className="car-compare">
              <div className="car-summary">
                {c.summary.map((s, i) => (
                  <p key={i}>{s}</p>
                ))}
              </div>
              <ProfileTable profiles={c.profiles} labels={[c.labelA, c.labelB]} />
              {c.points.map((a, i) => (
                <p key={`p${i}`} className="advice">
                  {a}
                </p>
              ))}
              {c.driving.length > 0 && (
                <>
                  <div className="car-heading">{t('race.ui.cars.drivingEach')}</div>
                  {c.driving.map((a, i) => (
                    <p key={`d${i}`} className="advice">
                      {a}
                    </p>
                  ))}
                </>
              )}
            </div>
          ))}
      <div className="hint">{t('race.ui.cars.hint')}</div>
    </Section>
  );
}

const maps = (): Array<{ value: RaceMap; label: string; title: string }> => [
  { value: 'none', label: t('race.ui.view.maps.lines'), title: t('race.ui.view.maps.linesTitle') },
  { value: 'where', label: t('race.ui.view.maps.time'), title: t('race.ui.view.maps.timeTitle') },
  { value: 'why', label: t('race.ui.view.maps.cause'), title: t('race.ui.view.maps.causeTitle') },
  { value: 'mistakes', label: t('race.ui.view.maps.mistakes'), title: t('race.ui.view.maps.mistakesTitle') },
];

function RaceViewSection() {
  const view = useRaceStore((s) => s.view);
  const patch = useRaceStore((s) => s.patchView);
  return (
    <Section title={t('race.ui.view.title')} defaultOpen>
      <Segmented value={view.map} options={maps()} onChange={(map) => patch({ map })} />
      {view.map === 'where' && (
        <div className="scale-legend">
          <span>{t('race.ui.view.gains')}</span>
          <i className="diverging" />
          <span>{t('race.ui.view.loses')}</span>
        </div>
      )}
      {view.map === 'mistakes' && (
        <div className="scale-legend">
          <span>{t('race.ui.view.fewLaps')}</span>
          <i className="mistake-scale" />
          <span>{t('race.ui.view.mostLaps')}</span>
        </div>
      )}
      {view.map === 'why' && (
        <div className="legend-row">
          {Object.entries(CAUSE_COLORS)
            .filter(([k]) => k !== 'context')
            .map(([k, c]) => (
              <span key={k}>
                <i style={{ background: rgbCss(c) }} />
                {causeLabel(k)}
              </span>
            ))}
        </div>
      )}
      <div className="row wrap" style={{ gap: 12, marginTop: 8 }}>
        <Check label={t('race.ui.view.lines')} checked={view.lines} onChange={(lines) => patch({ lines })} />
        <Check label={t('race.ui.view.cars')} checked={view.cars} onChange={(cars) => patch({ cars })} />
        <Check
          label={t('race.ui.shapes.toggle')}
          checked={view.carShapes}
          onChange={(carShapes) => patch({ carShapes })}
          title={t('race.ui.shapes.toggleTitle')}
        />
        <Check
          label={t('race.ui.view.telemetry')}
          checked={view.telemetry}
          onChange={(telemetry) => patch({ telemetry })}
          title={t('race.ui.view.telemetryTitle')}
        />
        <Check label={t('race.ui.view.labels')} checked={view.labels} onChange={(labels) => patch({ labels })} />
        <Check
          label={t('race.ui.view.surface')}
          checked={view.surface}
          onChange={(surface) => patch({ surface })}
          title={t('race.ui.view.surfaceTitle')}
        />
        <Check
          label={t('race.ui.view.hudDetails')}
          checked={view.hudDetails}
          onChange={(hudDetails) => patch({ hudDetails })}
          title={t('race.ui.view.hudDetailsTitle')}
        />
      </div>
      <Slider
        label={t('race.ui.view.carScale')}
        value={view.carScale}
        min={1}
        max={10}
        step={0.5}
        onChange={(carScale) => patch({ carScale })}
        format={(v) => t('race.ui.view.carScaleValue', { v: num(v, 1) })}
        hint={t('race.ui.view.carScaleHint')}
      />
      <CarFiles />
    </Section>
  );
}

export function RacePanel() {
  return (
    <>
      <LapsSection />
      <StatsSection />
      <InsightsSection />
      <CornersSection />
      <ControlSection />
      <CarsSection />
      <RaceViewSection />
    </>
  );
}
