import { useRef } from 'react';
import { formatCount } from '../data/synth';
import { useAnimationFrame, useEngine } from './EngineContext';
import { num, t } from '../i18n';

/**
 * Live perf readout, updated by writing to DOM nodes directly.
 *
 * The convergence line is the honest part of the stochastic design: it says
 * outright what fraction of the candidate rows has been folded into the picture,
 * so a noisy frame is never mistaken for the finished answer.
 */
export function StatsOverlay() {
  const engine = useEngine();
  const fps = useRef<HTMLElement>(null);
  const frame = useRef<HTMLElement>(null);
  const splats = useRef<HTMLElement>(null);
  const cand = useRef<HTMLElement>(null);
  const conv = useRef<HTMLElement>(null);
  const convRow = useRef<HTMLDivElement>(null);
  const cubes = useRef<HTMLElement>(null);
  const budget = useRef<HTMLElement>(null);
  const dropped = useRef<HTMLDivElement>(null);
  const droppedVal = useRef<HTMLElement>(null);
  const heatRes = useRef<HTMLElement>(null);
  const backend = useRef<HTMLElement>(null);

  useAnimationFrame(() => {
    if (!engine) return;
    const l = engine.live;
    setText(backend, l.backend === 'webgpu' ? 'WebGPU' : l.backend === 'webgl2' ? 'WebGL2' : '—');
    setText(fps, l.fps > 0 ? num(l.fps, 0) : '—');
    setText(frame, t('heat.statsOverlay.ms', { value: num(l.frameMs, 1) }));
    setText(splats, formatCount(l.splats));
    setText(cand, formatCount(l.candidates));
    setText(budget, formatCount(l.budget));
    setText(heatRes, t('heat.statsOverlay.percent', { value: num(l.heatScale * 100, 0) }));
    setText(cubes, String(l.cubes));

    const pct =
      l.convergeFrames <= 1
        ? 100
        : Math.min(100, (l.accumFrames / l.convergeFrames) * 100);
    setText(conv, l.converged ? t('heat.statsOverlay.exact') : t('heat.statsOverlay.percent', { value: num(pct, 0) }));
    if (convRow.current) {
      convRow.current.className = `line ${l.converged ? 'hi' : 'warn'}`;
    }
    // Only shown when it happens — a truncated dataset that looks complete is
    // the worst failure an analysis tool can have.
    if (dropped.current) {
      dropped.current.style.display = l.droppedRows > 0 ? '' : 'none';
      setText(droppedVal, formatCount(l.droppedRows));
    }
  }, !!engine);

  return (
    <div className="overlay">
      <div className="line">
        <span>{t('heat.statsOverlay.backend')}</span>
        <b ref={backend} title={engine?.backendFallbackReason ?? undefined}>
          —
        </b>
      </div>
      <div className="line">
        <span>{t('heat.statsOverlay.fps')}</span>
        <b ref={fps}>—</b>
      </div>
      <div className="line">
        <span>{t('heat.statsOverlay.frame')}</span>
        <b ref={frame}>—</b>
      </div>
      <hr />
      <div className="line">
        <span>{t('heat.statsOverlay.rowsInWindow')}</span>
        <b ref={cand}>—</b>
      </div>
      <div className="line">
        <span>{t('heat.statsOverlay.spritesPerFrame')}</span>
        <b ref={splats}>—</b>
      </div>
      <div className="line">
        <span>{t('heat.statsOverlay.budget')}</span>
        <b ref={budget}>—</b>
      </div>
      <div className="line">
        <span>{t('heat.statsOverlay.heatRes')}</span>
        <b ref={heatRes}>—</b>
      </div>
      <div className="line warn" ref={convRow}>
        <span>{t('heat.statsOverlay.coverage')}</span>
        <b ref={conv}>—</b>
      </div>
      <div className="line">
        <span>{t('heat.statsOverlay.cubes')}</span>
        <b ref={cubes}>0</b>
      </div>
      <div className="line warn" ref={dropped} style={{ display: 'none' }}>
        <span>{t('heat.statsOverlay.notResident')}</span>
        <b ref={droppedVal}>0</b>
      </div>
    </div>
  );
}

function setText(ref: { current: HTMLElement | null }, v: string): void {
  const el = ref.current;
  if (el && el.textContent !== v) el.textContent = v;
}
