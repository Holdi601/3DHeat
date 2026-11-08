import { useRef } from 'react';
import { usePlanStore } from '../../state/planStore';
import { useAnimationFrame, useEngine } from '../EngineContext';
import { CATALOG } from '../../figures/catalog';
import { playbackAt, posesAt } from '../../tactics/plan';
import { templateOf } from '../../tactics/scene';
import { useStore } from '../../state/store';
import { RIOT_NOTICE } from '../../tactics/valorantMaps';
import { BoardGizmo } from './BoardGizmo';
import './tactics.css';

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
      .filter((f) => f.label && CATALOG[f.kind]?.domain !== 'marker')
      .map((f) => ({ key: f.id, text: f.label, figure: f.id, note: null as null | { x: number; y: number; z: number } })),
    ...plan.notes.filter((n) => n.step === step).map((n) => ({ key: n.id, text: n.text, figure: null as string | null, note: n.at })),
  ];

  useAnimationFrame(() => {
    if (!engine) return;
    const s = usePlanStore.getState();
    // The engine's playback clock: the store's is written only a few times a second.
    const at = s.playing ? playbackAt(s.plan, engine.boardPlayTime ?? s.playTime) : { step: s.step, u: 0 };
    const poses = posesAt(s.plan, at.step, at.u);
    const scale = Math.max(0.05, s.plan.figureScale);
    for (const l of labels) {
      const el = nodes.current.get(l.key);
      if (!el) continue;
      let p: { x: number; y: number } | null = null;
      if (l.figure) {
        const pose = poses.get(l.figure);
        const f = s.plan.figures.find((x) => x.id === l.figure);
        const t = f ? templateOf(f.kind) : null;
        if (pose && t) p = engine.project(pose.x, pose.y + t.max[1] * scale + 0.4, pose.z);
      } else if (l.note) p = engine.project(l.note.x, l.note.y + 2.5, l.note.z);
      if (!p) {
        el.style.display = 'none';
        continue;
      }
      el.style.display = '';
      el.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px) translate(-50%, -100%)`;
    }
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
          className={`race-label ${l.note ? 'stat' : 'corner'}`}
        >
          {l.text}
        </div>
      ))}
    </div>
  );
}
