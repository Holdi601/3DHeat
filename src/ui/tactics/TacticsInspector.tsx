import { useEffect, useMemo, useRef, useState } from 'react';
import { Section } from '../controls';
import { momentOf, usePlanStore } from '../../state/planStore';
import { useStore } from '../../state/store';
import { keyAt, posesAt, routeOf, type Plan, type PlanArrow, type PlanFigure, type TrackChannel, type Vec3 } from '../../tactics/plan';
import { pivotOf, refKind } from '../../tactics/gizmo';
import { MODES, modeSpeed, moveClassOf, profileFor, speedTable, type Mode } from '../../tactics/speeds';
import { arrivals, clock, planTimings, routeModes, speedChecks, stepStart, topSpeed, unitsPerMetre } from '../../tactics/timing';
import { channelAt, KEY_EPS, keyTimes } from '../../tactics/keyframes';
import { templateOf } from '../../tactics/scene';
import { hasJoints } from '../../figures/instances';
import { useTelemetry } from '../../tactics/telemetryClient';
import type { Region, TravelStats } from '../../tactics/telemetry';
import { figureLabel } from '../../tactics/names';
import { num, t } from '../../i18n';
import { expandContainerFiles } from '../../data/container';
import { NumberBox } from '../NumberBox';
import { confirmRemoveSelection } from './boardKeys';
import { DrawingEditor, NoteEditor } from './PenOptions';
import { SortControl, SortTh } from '../sort/SortControl';
import { useSort, useSorted } from '../sort/useSort';

const DEG = 180 / Math.PI;

/** A number that is written back when it is left or Enter is pressed: one undo step per entry, not per key. */
function NumField({ label, value, onCommit, digits = 2 }: { label: string; value: number; onCommit: (v: number) => void; digits?: number }) {
  const [text, setText] = useState(value.toFixed(digits));
  useEffect(() => setText(value.toFixed(digits)), [value, digits]);
  const commit = () => {
    const v = Number(text.replace(',', '.'));
    if (Number.isFinite(v) && Math.abs(v - value) > 10 ** -(digits + 1)) onCommit(v);
    else setText(value.toFixed(digits));
  };
  return (
    <label>
      {label}
      <input type="text" inputMode="decimal" value={text} onChange={(e) => setText(e.target.value)} onBlur={commit} onKeyDown={(e) => e.key === 'Enter' && commit()} />
    </label>
  );
}

/** The gizmo's mode, snapping and keys. */
export function GizmoControls() {
  const gizmo = usePlanStore((s) => s.gizmo);
  const scheme = usePlanStore((s) => s.keyScheme);
  const snapGround = usePlanStore((s) => s.snapGround);
  const grid = usePlanStore((s) => s.grid);
  const angleStep = usePlanStore((s) => s.angleStep);
  const upm = usePlanStore((s) => unitsPerMetre(s.plan));
  const store = usePlanStore.getState;
  const keys = scheme === 'editor' ? ['W', 'E', 'R'] : ['G', 'R', 'S'];
  return (
    <>
      <div className="tactics-tools" role="toolbar" aria-label={t('tactics.gizmo.title')}>
        {(['move', 'rotate', 'scale'] as const).map((m, i) => (
          <button key={m} className={gizmo === m ? 'on' : ''} onClick={() => store().setGizmo(m)} title={keys[i]}>
            {t(`tactics.gizmo.${m}`)} <kbd>{keys[i]}</kbd>
          </button>
        ))}
        <select value={scheme} onChange={(e) => store().setKeyScheme(e.target.value as 'editor' | 'blender')} aria-label={t('tactics.gizmo.keys')}>
          <option value="editor">{t('tactics.gizmo.keysEditor')}</option>
          <option value="blender">{t('tactics.gizmo.keysBlender')}</option>
        </select>
      </div>
      <label className="field" style={{ flexDirection: 'row', alignItems: 'center' }}>
        <input type="checkbox" checked={snapGround} onChange={(e) => store().setSnapGround(e.target.checked)} />
        <span>{t('tactics.gizmo.snapGround')}</span>
      </label>
      <div className="tactics-num">
        <NumField label={t('tactics.gizmo.grid')} value={(grid > 0 ? grid : upm) / upm} onCommit={(v) => store().setGrid(Math.max(0, v) * upm, angleStep)} />
        <NumField label={t('tactics.gizmo.angle')} value={angleStep} digits={0} onCommit={(v) => store().setGrid(grid, v)} />
      </div>
      <div className="hint">{t('tactics.gizmo.hint')}</div>
    </>
  );
}

/** What is selected, in numbers: place, turn, size; a figure's speed profile; a route's modes, pauses and times. */
export function SelectionInspector() {
  const plan = usePlanStore((s) => s.plan);
  const step = usePlanStore((s) => s.step);
  const selection = usePlanStore((s) => s.selection);
  const store = usePlanStore.getState;
  if (!selection.length) return null;
  const upm = unitsPerMetre(plan);
  const pivot = pivotOf(plan, step, selection);
  const single = selection.length === 1 ? selection[0] : null;
  const kind = single ? refKind(plan, single) : null;
  const figure = kind === 'figure' ? plan.figures.find((f) => f.id === single)! : null;
  const area = kind === 'area' ? plan.areas.find((a) => a.id === single)! : null;
  const note = kind === 'note' ? plan.notes.find((n) => n.id === single)! : null;
  const drawing = kind === 'drawing' ? plan.drawings.find((d) => d.id === single)! : null;
  const key = figure ? keyAt(figure, step) : null;
  const moveTo = (axis: 'x' | 'y' | 'z', v: number) => {
    if (!pivot) return;
    const d: Vec3 = { x: 0, y: 0, z: 0 };
    d[axis] = v * upm - pivot[axis];
    store().transformSelection({ kind: 'move', d });
  };
  const arrow = figure ? routeOf(plan, figure.id, step) : kind === 'arrow' ? plan.arrows.find((a) => a.id === single) : kind === 'point' ? plan.arrows.find((a) => a.id === single!.split('#')[0]) : undefined;
  const routeFigure = arrow?.figure ? plan.figures.find((f) => f.id === arrow.figure) : undefined;
  return (
    <Section title={selection.length > 1 ? t('tactics.inspector.many', { n: selection.length }) : t('tactics.selected')} defaultOpen>
      {figure && <div className="hint">{figureLabel(figure.kind)}</div>}
      {figure && (
        <label className="field">
          <span>{t('tactics.label')}</span>
          <input type="text" value={figure.label} onChange={(e) => store().setLabel(figure.id, e.target.value)} />
        </label>
      )}
      {pivot && (
        <div className="tactics-num" title={t('tactics.inspector.metres')}>
          <NumField label="X (m)" value={pivot.x / upm} onCommit={(v) => moveTo('x', v)} />
          <NumField label="Y (m)" value={pivot.y / upm} onCommit={(v) => moveTo('y', v)} />
          <NumField label="Z (m)" value={pivot.z / upm} onCommit={(v) => moveTo('z', v)} />
        </div>
      )}
      {figure && key && (
        <div className="tactics-num">
          <NumField label={t('tactics.inspector.yaw')} value={key.yaw * DEG} digits={1} onCommit={(v) => store().setFigureAngles(figure.id, { yaw: v / DEG })} />
          <NumField label={t('tactics.inspector.pitch')} value={(key.pitch ?? 0) * DEG} digits={1} onCommit={(v) => store().setFigureAngles(figure.id, { pitch: v / DEG })} />
          <NumField label={t('tactics.inspector.roll')} value={(key.roll ?? 0) * DEG} digits={1} onCommit={(v) => store().setFigureAngles(figure.id, { roll: v / DEG })} />
        </div>
      )}
      {area && (
        <div className="tactics-num">
          <NumField label={t('tactics.inspector.radius')} value={area.radius / upm} onCommit={(v) => store().setAreaRadius(area.id, v * upm)} />
        </div>
      )}
      {note && <NoteEditor note={note} />}
      {drawing && <DrawingEditor drawing={drawing} />}
      {figure && moveClassOf(figure.kind) && <FigureSpeeds plan={plan} figure={figure} />}
      {figure && moveClassOf(figure.kind) && <Keyframes plan={plan} figure={figure} />}
      {arrow && routeFigure && <RouteTable plan={plan} arrow={arrow} figure={routeFigure} />}
      <div className="tactics-tools">
        {figure && (
          <button onClick={() => store().startMove()} title="M">
            {t('tactics.move')}
          </button>
        )}
        <button onClick={() => confirmRemoveSelection()} title="Delete">
          {t('tactics.remove')}
        </button>
      </div>
    </Section>
  );
}

/** A figure's speed profile and its own speeds over the game's. */
function FigureSpeeds({ plan, figure }: { plan: Plan; figure: PlanFigure }) {
  const store = usePlanStore.getState;
  const table = speedTable(plan.game);
  const cls = moveClassOf(figure.kind)!;
  const profiles = (table.profiles ?? []).filter((p) => p.class === cls);
  const active = profileFor(table, figure.kind, figure.profile);
  const top = topSpeed(plan, figure);
  return (
    <>
      {profiles.length > 0 && (
        <label className="field">
          <span>{t('tactics.speed.profile')}</span>
          <select value={figure.profile ?? ''} onChange={(e) => store().setProfile(figure.id, e.target.value || null)}>
            <option value="">{t('tactics.speed.auto', { name: active?.label ?? t('tactics.speed.classDefault') })}</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
      )}
      <table className="tactics-table">
        <thead>
          <tr>
            <th>{t('tactics.speed.mode')}</th>
            <th>{t('tactics.speed.game')}</th>
            <th>{t('tactics.speed.own')}</th>
          </tr>
        </thead>
        <tbody>
          {MODES[cls].map((m) => {
            const own = figure.speeds?.[m];
            const base = modeSpeed(table, figure.kind, m, figure.profile);
            return (
              <tr key={m}>
                <td>{t(`tactics.mode.${m}`)}</td>
                <td>{base === null ? '-' : `${num(base, 2)} m/s`}</td>
                <td>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="-"
                    defaultValue={own ?? ''}
                    key={`${figure.id}${m}${own ?? ''}`}
                    onBlur={(e) => store().setSpeedOverride(figure.id, m, e.target.value ? Number(e.target.value.replace(',', '.')) : null)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="hint">{t(`tactics.speed.source.${(active ?? table.classes[cls])?.approx ? 'approx' : 'official'}`)}</div>
      {top !== null && <div className="hint">{t('tactics.speed.top', { v: num(top, 2), kmh: num(top * 3.6, 0) })}</div>}
    </>
  );
}

const CHANNELS: { id: TrackChannel; joint?: boolean }[] = [
  { id: 'turret', joint: true },
  { id: 'gun', joint: true },
  { id: 'viewYaw' },
  { id: 'viewPitch' },
  { id: 'sensorYaw' },
  { id: 'sensorPitch' },
];

/**
 * A figure's keyframes at the moment shown (the time slider under the view):
 * each channel's value there, a field to key it, and the key there to take
 * out; pointing the turret, the eyes or the sensor at the next click; and
 * every time it has a key at, to jump to.
 */
function Keyframes({ plan, figure }: { plan: Plan; figure: PlanFigure }) {
  const store = usePlanStore.getState;
  const scrub = usePlanStore((s) => s.scrub);
  const step = usePlanStore((s) => s.step);
  const aiming = usePlanStore((s) => s.aiming);
  const m = momentOf({ plan, playing: false, playTime: 0, scrub, step });
  const pose = posesAt(plan, m.step, m.u).get(figure.id);
  const tpl = templateOf(figure.kind);
  const jointed = !!tpl && hasJoints(tpl);
  const value = (ch: TrackChannel): number | undefined => channelAt(figure.tracks, ch, m.time);
  const keyHere = (ch: TrackChannel) => figure.tracks?.[ch]?.some((k) => Math.abs(k.t - m.time) <= KEY_EPS) ?? false;
  const times = keyTimes(figure);
  return (
    <>
      <div className="tactics-group-name">{t('tactics.keys.title', { at: clock(m.time), s: num(m.time, 1) })}</div>
      <table className="tactics-table">
        <tbody>
          {CHANNELS.filter((c) => !c.joint || jointed).map((c) => {
            const v = value(c.id);
            return (
              <tr key={c.id}>
                <td>{t(`tactics.keys.${c.id}`)}</td>
                <td>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="-"
                    defaultValue={v === undefined ? '' : (v * DEG).toFixed(1)}
                    key={`${figure.id}${c.id}${m.time}${v ?? ''}`}
                    onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                    onBlur={(e) => {
                      const x = Number(e.target.value.replace(',', '.'));
                      if (e.target.value.trim() !== '' && Number.isFinite(x) && (v === undefined || Math.abs(x / DEG - v) > 1e-4)) store().setTrackKey(figure.id, c.id, x / DEG, m.time);
                    }}
                    style={{ width: '4.5em' }}
                    aria-label={t(`tactics.keys.${c.id}`)}
                  />
                  °
                </td>
                <td>
                  {keyHere(c.id) && (
                    <button onClick={() => store().setTrackKey(figure.id, c.id, null, m.time)} title={t('tactics.keys.remove')}>
                      ×
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="tactics-tools">
        {jointed && (
          <button className={aiming === 'turret' ? 'on' : ''} onClick={() => store().startAim(aiming === 'turret' ? null : 'turret')}>
            {t('tactics.keys.aimTurret')}
          </button>
        )}
        <button className={aiming === 'view' ? 'on' : ''} onClick={() => store().startAim(aiming === 'view' ? null : 'view')}>
          {t('tactics.keys.aimView')}
        </button>
        <button className={aiming === 'sensor' ? 'on' : ''} onClick={() => store().startAim(aiming === 'sensor' ? null : 'sensor')}>
          {t('tactics.keys.aimSensor')}
        </button>
      </div>
      {aiming && <div className="hint">{t('tactics.keys.aiming')}</div>}
      {times.length > 0 && (
        <div className="tactics-tools" aria-label={t('tactics.keys.times')}>
          {times.map((x) => (
            <button key={x} className={Math.abs(x - m.time) <= KEY_EPS ? 'on' : ''} onClick={() => store().setScrub(x)}>
              {clock(x)}
              {x % 1 ? `.${Math.round((x % 1) * 10)}` : ''}
            </button>
          ))}
        </div>
      )}
      <div className="hint">{pose ? t('tactics.keys.hint') : t('tactics.keys.offBoard')}</div>
    </>
  );
}

/** Where the figures' top speeds held the plan back: late arrivals, steps made longer. */
export function SpeedChecks() {
  const plan = usePlanStore((s) => s.plan);
  const checks = useMemo(() => speedChecks(plan), [plan]);
  if (!checks.length) return <div className="hint">{t('tactics.checks.none')}</div>;
  const name = (id: string) => plan.figures.find((f) => f.id === id)?.label ?? id;
  return (
    <>
      <div className="tactics-group-name">{t('tactics.checks.title', { n: checks.length })}</div>
      <ul className="tactics-checks">
        {checks.slice(0, 50).map((c, i) => (
          <li key={i}>
            <button
              onClick={() => {
                usePlanStore.getState().setStep(c.step);
                usePlanStore.getState().select(c.figure);
              }}
            >
              {t(`tactics.checks.${c.kind}`, { step: c.step + 1, who: name(c.figure), needs: num(c.needs, 1), given: num(c.given, 1), point: c.point ?? 0 })}
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

/** A route's segments: mode, length, time; and each waypoint's pause and time of arrival. */
function RouteTable({ plan, arrow, figure }: { plan: Plan; arrow: PlanArrow; figure: PlanFigure }) {
  const store = usePlanStore.getState;
  const cls = moveClassOf(figure.kind);
  const timing = planTimings(plan).get(arrow.id);
  if (!cls || !timing) return null;
  const upm = unitsPerMetre(plan);
  const modes = routeModes(arrow, figure);
  const t0 = stepStart(plan, arrow.step);
  return (
    <>
      <div className="tactics-group-name">{t('tactics.route.title', { total: num(timing.total, 1), at: clock(t0 + timing.total) })}</div>
      <label className="field">
        <span>{t('tactics.route.allModes')}</span>
        <select value="" onChange={(e) => e.target.value && store().setSegmentMode(arrow.id, 'all', e.target.value as Mode)}>
          <option value="">…</option>
          {MODES[cls].map((m) => (
            <option key={m} value={m}>
              {t(`tactics.mode.${m}`)}
            </option>
          ))}
        </select>
      </label>
      <table className="tactics-table">
        <thead>
          <tr>
            <th>#</th>
            <th>{t('tactics.speed.mode')}</th>
            <th>m</th>
            <th>s</th>
            <th>{t('tactics.route.pause')}</th>
            <th title={t('tactics.route.wantHint')}>{t('tactics.route.want')}</th>
            <th>{t('tactics.route.at')}</th>
          </tr>
        </thead>
        <tbody>
          {timing.segs.map((sg, i) => (
            <tr key={i} className={timing.late.some((l) => l.point === i + 1) ? 'late' : ''} title={`${num(sg.speed / upm, 2)} m/s`}>
              <td>
                {i + 1}→{i + 2}
              </td>
              <td>
                <select value={modes[i]} onChange={(e) => store().setSegmentMode(arrow.id, i, e.target.value as Mode)}>
                  {MODES[cls].map((m) => (
                    <option key={m} value={m}>
                      {t(`tactics.mode.${m}`)}
                    </option>
                  ))}
                </select>
              </td>
              <td>{num(sg.length / upm, 1)}</td>
              <td>{num(sg.seconds, 1)}</td>
              <td>
                {i + 2 < arrow.points.length ? (
                  <input
                    type="text"
                    inputMode="decimal"
                    defaultValue={arrow.pauses?.[i + 1] ?? 0}
                    key={`${arrow.id}p${i}${arrow.pauses?.[i + 1] ?? 0}`}
                    onBlur={(e) => store().setPause(arrow.id, i + 1, Number(e.target.value.replace(',', '.')))}
                    style={{ width: '3.5em' }}
                  />
                ) : null}
              </td>
              <td>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="-"
                  defaultValue={arrow.at?.[i + 1] ?? ''}
                  key={`${arrow.id}w${i}${arrow.at?.[i + 1] ?? ''}`}
                  onBlur={(e) => store().setArrival(arrow.id, i + 1, e.target.value.trim() === '' ? null : Number(e.target.value.replace(',', '.')))}
                  style={{ width: '3.5em' }}
                  aria-label={t('tactics.route.want')}
                />
              </td>
              <td>{clock(t0 + timing.arrive[i + 1])}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {timing.late.map((l) => (
        <div key={l.point} className="hint late">
          {t('tactics.route.late', { point: l.point + 1, want: num(l.want, 1), got: num(l.got, 1) })}
        </div>
      ))}
      <TelemetryCompare plan={plan} arrow={arrow} total={timing.total} />
    </>
  );
}

const REGION_M = 3;

function regionAt(p: Vec3, r: number): Region {
  return { x: p.x, z: p.z, r };
}

/** A route against the match data: how fast players really went from its start (or the round's) to its end. */
function TelemetryCompare({ plan, arrow, total }: { plan: Plan; arrow: PlanArrow; total: number }) {
  const status = useTelemetry((s) => s.status);
  const side = useTelemetry((s) => s.side);
  const [fromStart, setFromStart] = useState(false);
  const [radius, setRadius] = useState(REGION_M);
  const [res, setRes] = useState<TravelStats | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const upm = unitsPerMetre(plan);
  const a = arrow.points[0];
  const b = arrow.points[arrow.points.length - 1];
  const key = `${a.x},${a.z},${b.x},${b.z},${fromStart},${radius},${side},${status}`;
  const seq = useRef(0);
  useEffect(() => {
    if (status !== 'ready') return;
    const n = ++seq.current;
    useTelemetry
      .getState()
      .travel(fromStart ? 'roundStart' : regionAt(a, radius * upm), regionAt(b, radius * upm))
      .then((r) => n === seq.current && (setRes(r), setErr(null)))
      .catch((e: Error) => setErr(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  if (status !== 'ready') return null;
  const timeTo = fromStart ? stepStart(plan, arrow.step) + total : total;
  return (
    <div className="tactics-compare">
      <div className="tactics-tools">
        <select value={fromStart ? 'round' : 'route'} onChange={(e) => setFromStart(e.target.value === 'round')} aria-label={t('tactics.tele.from')}>
          <option value="route">{t('tactics.tele.fromRoute')}</option>
          <option value="round">{t('tactics.tele.fromRound')}</option>
        </select>
        <label className="board-seconds">
          {t('tactics.tele.radius')}
          <NumberBox min={0.5} step={0.5} digits={2} value={radius} onChange={setRadius} />
        </label>
      </div>
      {err && <div className="hint">{err}</div>}
      {res && (
        <div className="hint">
          {res.n
            ? t('tactics.tele.compare', { fastest: num(res.min, 1), p10: num(res.p10, 1), median: num(res.median, 1), n: res.n, plan: num(timeTo, 1), who: res.fastest?.player ?? '' })
            : t('tactics.tele.none')}
        </div>
      )}
    </div>
  );
}

/** Who arrives where first: every routed figure's waypoints on one time line. */
export function ArrivalTimeline() {
  const plan = usePlanStore((s) => s.plan);
  const list = useMemo(() => arrivals(plan), [plan]);
  const byFigure = useMemo(() => {
    const m = new Map<string, typeof list>();
    for (const a of list) {
      if (!m.has(a.figure)) m.set(a.figure, []);
      m.get(a.figure)!.push(a);
    }
    return [...m.values()];
  }, [list]);
  const sort = useSort<typeof list>(
    'tactics.arrivals',
    [
      { id: 'time', label: t('ui.sort.time'), key: (r) => r[r.length - 1].atPlan, kind: 'number', dir: 'asc' },
      { id: 'name', label: t('ui.sort.name'), key: (r) => r[r.length - 1].label },
      { id: 'team', label: t('ui.sort.team'), key: (r) => plan.teams.find((x) => x.id === r[r.length - 1].team)?.name },
      { id: 'order', label: t('ui.sort.order'), key: null },
    ],
    'time',
  );
  const rows = useSorted(byFigure, sort, [plan.teams]);
  if (!list.length) return null;
  const end = Math.max(...list.map((a) => a.atPlan), 0.1);
  const color = (team: string) => `rgb(${(plan.teams.find((x) => x.id === team)?.color ?? [0.7, 0.7, 0.7]).map((c) => Math.round(c * 255)).join(',')})`;
  return (
    <>
      <div className="tactics-group-name">{t('tactics.timeline.title')}</div>
      {rows.length > 1 && <SortControl sort={sort} />}
      <div className="tactics-timeline">
        {rows.map((r) => {
          const lastA = r[r.length - 1];
          return (
            <div className="row" key={r[0].figure} title={r.map((a) => `${a.point}: ${clock(a.atPlan)} (${num(a.atPlan, 1)} s)`).join('\n')}>
              <span>{lastA.label}</span>
              <span className="bar">
                <span className="fill" style={{ width: `${(lastA.atPlan / end) * 100}%`, background: color(lastA.team) }} />
                {r.map((a) => (
                  <span key={`${a.step}-${a.point}`} className="tick" style={{ left: `calc(${(a.atPlan / end) * 100}% - 1px)` }} />
                ))}
              </span>
              <span>{clock(lastA.atPlan)}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}

/** Plan-wide timing settings. */
export function TimingSettings() {
  const plan = usePlanStore((s) => s.plan);
  const store = usePlanStore.getState;
  const upm = unitsPerMetre(plan);
  return (
    <>
      <label className="field" style={{ flexDirection: 'row', alignItems: 'center' }}>
        <input type="checkbox" checked={plan.realTime !== false} onChange={(e) => store().setRealTime(e.target.checked)} />
        <span>{t('tactics.timing.realTime')}</span>
      </label>
      <div className="tactics-num">
        <NumField label={t('tactics.timing.unitsPerMetre')} value={upm} digits={3} onCommit={(v) => store().setUnitsPerMetre(v)} />
      </div>
      <div className="hint">{t('tactics.timing.hint')}</div>
      <SpeedChecks />
      <ArrivalTimeline />
    </>
  );
}

/** Match data for checking plans: load it, the earliest-arrival overlay, and the speeds players really move at. */
export function TelemetryPanel() {
  const tele = useTelemetry();
  const dataset = useStore((s) => s.dataset);
  const plan = usePlanStore((s) => s.plan);
  const upm = unitsPerMetre(plan);
  const [cellM, setCellM] = useState(1.6);
  const fileRef = useRef<HTMLInputElement>(null);
  const sides = plan.teams.slice(0, 2);
  type State = NonNullable<typeof tele.speeds>['states'][number];
  const states = useMemo(() => (tele.speeds ? tele.speeds.states.filter((s) => s.n > 0) : []), [tele.speeds]);
  const speedSort = useSort<State>(
    'tactics.speeds',
    [
      { id: 'order', label: t('ui.sort.order'), key: null },
      { id: 'name', label: t('tactics.tele.state'), key: (s) => t(`tactics.mode.${s.state}`) },
      { id: 'p50', label: 'p50', key: (s) => s.p50, kind: 'number' },
      { id: 'p90', label: 'p90', key: (s) => s.p90, kind: 'number' },
      { id: 'p99', label: 'p99', key: (s) => s.p99, kind: 'number' },
      { id: 'count', label: t('ui.sort.count'), key: (s) => s.n, kind: 'number' },
    ],
    'order',
  );
  const speedRows = useSorted(states, speedSort);
  return (
    <Section title={t('tactics.tele.title')}>
      <div className="tactics-tools">
        <button onClick={() => fileRef.current?.click()}>{t('tactics.tele.loadFiles')}</button>
        <button disabled={!dataset} onClick={() => dataset && tele.loadDataset(dataset)}>
          {t('tactics.tele.useLoaded')}
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        multiple
        accept=".parquet,.3dheat"
        style={{ display: 'none' }}
        onChange={(e) => {
          const files = [...(e.target.files ?? [])];
          e.target.value = '';
          void expandContainerFiles(files).then((f) => tele.loadFiles(f));
        }}
      />
      <div className="hint">
        {tele.status === 'none'
          ? t('tactics.tele.hint')
          : tele.status === 'loading'
            ? t('tactics.tele.loading')
            : tele.status === 'error'
              ? t('tactics.tele.error', { reason: tele.message === 'no-rounds' ? t('tactics.tele.noRounds') : tele.message })
              : t('tactics.tele.loaded', { rounds: tele.rounds, samples: tele.samples })}
      </div>
      {tele.status === 'ready' && (
        <>
          <div className="tactics-teams">
            <button className={tele.side === null ? 'on' : ''} onClick={() => tele.setSide(null)}>
              {t('tactics.tele.bothSides')}
            </button>
            {sides.map((s, i) => (
              <button key={s.id} className={tele.side === i ? 'on' : ''} onClick={() => tele.setSide(i)}>
                {s.name}
              </button>
            ))}
          </div>
          <label className="field" style={{ flexDirection: 'row', alignItems: 'center' }}>
            <input type="checkbox" checked={tele.heatOn} onChange={(e) => tele.setHeat(e.target.checked, undefined, cellM * upm)} />
            <span>{t('tactics.tele.heat')}</span>
          </label>
          <div className="tactics-tools">
            <select value={tele.heatStat} onChange={(e) => tele.setHeat(tele.heatOn, e.target.value as 'min' | 'median', cellM * upm)}>
              <option value="min">{t('tactics.tele.fastest')}</option>
              <option value="median">{t('tactics.tele.typical')}</option>
            </select>
            <label className="board-seconds">
              {t('tactics.tele.cell')}
              <NumberBox min={0.25} step={0.25} digits={3} value={cellM} onChange={setCellM} onBlur={() => tele.heatOn && tele.setHeat(true, undefined, cellM * upm)} />
            </label>
          </div>
          {tele.heat && (
            <>
              <div className="tactics-legend" />
              <div className="hint" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{clock(tele.heat.tMin)}</span>
                <span>{t('tactics.tele.heatRounds', { n: tele.heat.rounds })}</span>
                <span>{clock(tele.heat.tMax)}</span>
              </div>
            </>
          )}
          {tele.speeds && (
            <table className="tactics-table">
              <thead>
                <tr>
                  <SortTh sort={speedSort} id="name">{t('tactics.tele.state')}</SortTh>
                  <SortTh sort={speedSort} id="p50">p50</SortTh>
                  <SortTh sort={speedSort} id="p90">p90</SortTh>
                  <SortTh sort={speedSort} id="p99">p99</SortTh>
                  <SortTh sort={speedSort} id="count">n</SortTh>
                </tr>
              </thead>
              <tbody>
                {speedRows.map((s) => (
                  <tr key={s.state}>
                    <td>{t(`tactics.mode.${s.state}`)}</td>
                    <td>{num(s.p50 / upm, 2)}</td>
                    <td>{num(s.p90 / upm, 2)}</td>
                    <td>{num(s.p99 / upm, 2)}</td>
                    <td>{num(s.n, 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {tele.speeds && <div className="hint">{t('tactics.tele.speedsHint')}</div>}
          {tele.speeds && tele.speeds.states.every((s) => s.n === 0) && <div className="hint">{t('tactics.tele.noStates')}</div>}
          <div className="hint">{t('tactics.tele.compareHint')}</div>
        </>
      )}
    </Section>
  );
}
