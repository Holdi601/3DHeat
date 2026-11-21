import { useMemo, useRef } from 'react';
import { usePlanStore } from '../../state/planStore';
import { useAnimationFrame, useEngine } from '../EngineContext';
import { CATALOG } from '../../figures/catalog';
import { playbackAt, posesAt, shown as shownOn, type PlanNote } from '../../tactics/plan';
import { noteShown, templateOf } from '../../tactics/scene';
import { useStore } from '../../state/store';
import { RIOT_NOTICE } from '../../tactics/valorantMaps';
import { BoardGizmo } from './BoardGizmo';
import './tactics.css';

/** A note's own colour and size. */
function noteStyle(n: PlanNote): React.CSSProperties | undefined {
  if (!n.color && !n.size) return undefined;
  return { ...(n.color ? { color: `rgb(${n.color.map((c) => Math.round(c * 255)).join(',')})` } : {}), ...(n.size ? { fontSize: `${n.size}px` } : {}) };
}

/** Figure names on screen at most: past this many they cover the view, and each costs a style write a frame. */
const LABEL_CAP = 250;

/**
 * The names of the board's figures and its notes, over them in the view,
 * following them as a plan plays: placed each frame from the engine's
 * projection and written to the DOM, as the race tab's labels are.
 */
export function BoardLabels() {
  const engine = useEngine();
  const plan = usePlanStore((s) => s.plan);
  const step = usePlanStore((s) => s.step);
  const nodes = useRef(new Map<string, HTMLElement>());

  const labels = [
    ...plan.figures
      .filter((f) => f.label && CATALOG[f.kind]?.domain !== 'marker' && shownOn(plan, f))
      .map((f) => ({ key: f.id, text: f.label, figure: f.id, note: null as PlanNote | null })),
    // Every shown layer's notes: which of them show is decided each frame (a time-bound one comes and goes while it plays).
    ...plan.notes.filter((n) => shownOn(plan, n) && (n.show === 'always' || n.show === 'timed' || n.step === step)).map((n) => ({ key: n.id, text: n.text, figure: null as string | null, note: n })),
  ];

  const kinds = useMemo(() => new Map(plan.figures.map((f) => [f.id, f.kind])), [plan]);
  const shown = useRef<(string | null)[]>([]);
  useAnimationFrame(() => {
    if (!engine) return;
    const s = usePlanStore.getState();
    // The engine's playback clock: the store's is written only a few times a second.
    const time = s.playing ? (engine.boardPlayTime ?? s.playTime) : null;
    const at = time !== null ? playbackAt(s.plan, time) : { step: s.step, u: 0 };
    const poses = posesAt(s.plan, at.step, at.u);
    const scale = Math.max(0.05, s.plan.figureScale);
    // Every place first, then every write: a read of the layout between writes would lay the page out each time.
    const w = engine.canvas.clientWidth;
    const h = engine.canvas.clientHeight;
    const out = shown.current;
    out.length = labels.length;
    let n = 0;
    labels.forEach((l, i) => {
      let p: { x: number; y: number } | null = null;
      if (l.figure) {
        const pose = poses.get(l.figure);
        const kind = kinds.get(l.figure);
        const t = kind ? templateOf(kind) : null;
        if (pose && t) p = engine.project(pose.x, pose.y + t.max[1] * scale + 0.4, pose.z);
      } else if (l.note && noteShown(l.note, { step: at.step, time })) p = engine.project(l.note.at.x, l.note.at.y + 2.5, l.note.at.z);
      // Off screen, or past the most a view can read: hidden.
      const on = !!p && p.x > -50 && p.y > -20 && p.x < w + 50 && p.y < h + 40 && (n < LABEL_CAP || !l.figure);
      if (on && l.figure) n++;
      out[i] = on ? `translate(${p!.x.toFixed(1)}px, ${p!.y.toFixed(1)}px) translate(-50%, -100%)` : null;
    });
    labels.forEach((l, i) => {
      const el = nodes.current.get(l.key);
      if (!el) return;
      const tr = out[i];
      if (tr === null) {
        if (el.style.display !== 'none') el.style.display = 'none';
        return;
      }
      if (el.style.display === 'none') el.style.display = '';
      if (el.style.transform !== tr) el.style.transform = tr;
    });
  }, labels.length > 0);

  // Riot's policy asks for its notice wherever their map is shown.
  const riot = useStore((s) => s.level?.name.startsWith('Valorant: ') ?? false);

  return (
    <div className="race-labels">
      {riot && <div className="board-notice">{RIOT_NOTICE}</div>}
      <BoardGizmo />
      {labels.map((l) => (
        <div
          key={l.key}
          ref={(el) => {
            if (el) nodes.current.set(l.key, el);
            else nodes.current.delete(l.key);
          }}
          className={`race-label ${l.note ? 'stat board-note' : 'corner'}`}
          style={l.note ? noteStyle(l.note) : undefined}
        >
          {l.text}
        </div>
      ))}
    </div>
  );
}
