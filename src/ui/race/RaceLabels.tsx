import { useMemo, useRef } from 'react';
import { courseStats, lapsIn, mistakeCount, mistakeShort } from '../../race/stats';
import { CAUSE_COLORS, rgbCss } from '../../race/geometry';
import { causeGroup } from '../../race/scene';
import { useRaceStore } from '../../state/raceStore';
import { useAnimationFrame, useEngine } from '../EngineContext';
import { describeEvent, type ControlEvent } from '../../race/control';
import { int, num, t } from '../../i18n';
import { showEvent, showFinding } from './actions';
import { unitPrefs } from '../../state/unitsStore';
import { formatIn } from '../../units/format';

interface Label {
  key: string;
  text: string;
  /** World position. */
  x: number;
  y: number;
  z: number;
  kind: 'corner' | 'finding' | 'impact' | 'stat';
  color?: string;
  index?: number;
  event?: ControlEvent;
  /** A corner of the course statistics, and whether it is the one opened. */
  segment?: number;
  on?: boolean;
  title?: string;
}

/**
 * Corner names at the apexes, numbered badges at the biggest mistakes and
 * the focused lap's crashes and hits, pinned to the track - or, on the
 * mistake map, each corner's most common mistake among all the laps: placed
 * each frame from the engine's projection, written straight to the DOM rather
 * than through React.
 */
export function RaceLabels() {
  const engine = useEngine();
  const analysis = useRaceStore((s) => s.analysis);
  const focusId = useRaceStore((s) => s.focusId);
  const show = useRaceStore((s) => s.view.labels);
  const laps = useRaceStore((s) => s.laps);
  const carScale = useRaceStore((s) => s.view.carScale);
  const map = useRaceStore((s) => s.view.map);
  const mass = useRaceStore((s) => s.mass);
  const nodes = useRef(new Map<string, HTMLElement>());
  const stats = useMemo(
    () => (analysis && map === 'mistakes' ? courseStats(analysis, lapsIn(analysis, mass.classes)) : null),
    [analysis, map, mass.classes],
  );

  const labels: Label[] = [];
  if (analysis && show) {
    const ref = analysis.alignment.laps.find((l) => l.lap === analysis.alignment.reference)!;
    const { x, y, z } = ref.channels;
    // The mistake map: each corner's most common mistake, of the one picked or of any.
    for (const c of stats?.corners ?? []) {
      const seg = analysis.segments[c.segment];
      const apex = analysis.corners.find((k) => k.number === seg.corner)?.apex ?? seg.window.from;
      const top = mass.mistake ? c.mistakes.find((m) => m.mistake === mass.mistake) : c.mistakes[0];
      labels.push({
        key: `s${c.segment}`,
        text: !top
          ? t('race.ui.labels.clean', { corner: c.label })
          : mass.mistake
            ? t('race.ui.labels.count', { corner: c.label, laps: int(top.laps.length), total: int(c.laps) })
            : t('race.ui.labels.countMistake', {
                corner: c.label,
                laps: int(top.laps.length),
                total: int(c.laps),
                mistake: mistakeShort(top.mistake),
              }),
        x: x[apex],
        y: y[apex] + 5,
        z: z[apex],
        kind: 'stat',
        segment: c.segment,
        on: mass.segment === c.segment,
        title: [
          t('race.ui.labels.cornerTitle', { corner: c.label, losing: int(c.losing), laps: c.laps, lost: num(c.lost, 1) }),
          ...c.mistakes.slice(0, 5).map((m) => mistakeCount(m.mistake, m.laps.length, c.laps)),
        ].join('\n'),
      });
    }
    for (const c of stats ? [] : analysis.corners) {
      labels.push({
        key: `c${c.number}`,
        text: t('race.corner.one', { n: c.number }),
        x: x[c.apex],
        y: y[c.apex] + 4,
        z: z[c.apex],
        kind: 'corner',
      });
    }
    analysis.findings
      .map((f, i) => ({ f, i }))
      .filter(({ f }) => !stats && f.lapId === focusId && f.source === 'driver' && f.outcome === 'loss')
      .slice(0, 5)
      .forEach(({ f, i }, rank) => {
        const at = Math.max(ref.first, Math.min(ref.last, Math.round((f.from + f.to) / 2)));
        labels.push({
          key: `f${i}`,
          text: String(rank + 1),
          x: x[at],
          y: y[at] + 8,
          z: z[at],
          kind: 'finding',
          color: rgbCss(CAUSE_COLORS[causeGroup(f)]),
          index: i,
          title: t('race.ui.labels.cost', { title: f.title, cost: num(f.cost, 2) }),
        });
      });
    // The focused lap's crashes and hits, over the bursts that mark them.
    const lap = laps.find((l) => l.id === focusId);
    const step = analysis.alignment.grid[1] - analysis.alignment.grid[0];
    for (const e of analysis.control.get(focusId ?? '') ?? []) {
      if (!e.impact || !lap) continue;
      const said = describeEvent(e, analysis.names.get(e.lapId) ?? '', analysis.names.get(e.againstId) ?? '', lap, step);
      labels.push({
        key: `i${e.from}`,
        text: t('units.race.impact', { kind: e.kind, speed: formatIn('speed', e.impact.before - e.impact.after, unitPrefs(), 0) }),
        x: e.impact.x,
        y: e.impact.y + (e.kind === 'crash' ? 4.8 : 3.6) * Math.max(1, carScale),
        z: e.impact.z,
        kind: 'impact',
        color: e.kind === 'crash' ? '#ff3824' : '#ffa81f',
        event: e,
        title: `${e.cost >= 0.01 ? t('race.ui.labels.cost', { title: said.title, cost: num(e.cost, 2) }) : said.title}\n${said.tip}`,
      });
    }
  }

  useAnimationFrame(() => {
    if (!engine) return;
    for (const l of labels) {
      const el = nodes.current.get(l.key);
      if (!el) continue;
      const p = engine.project(l.x, l.y, l.z);
      if (!p) {
        el.style.display = 'none';
        continue;
      }
      el.style.display = '';
      el.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px) translate(-50%, -100%)`;
    }
  }, labels.length > 0);

  return (
    <div className="race-labels">
      {labels.map((l) => (
        <div
          key={l.key}
          ref={(el) => {
            if (el) nodes.current.set(l.key, el);
            else nodes.current.delete(l.key);
          }}
          className={`race-label ${l.kind}${l.on ? ' on' : ''}`}
          style={l.color ? { borderColor: l.color } : undefined}
          title={l.title}
          onClick={
            l.index !== undefined
              ? () => showFinding(l.index!, engine)
              : l.event
                ? () => showEvent(l.event!, engine)
                : l.segment !== undefined
                  ? () =>
                      useRaceStore
                        .getState()
                        .patchMass({ segment: useRaceStore.getState().mass.segment === l.segment ? null : l.segment! })
                  : undefined
          }
        >
          {l.text}
        </div>
      ))}
    </div>
  );
}
