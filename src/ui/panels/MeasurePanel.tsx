import { useRef, useState } from 'react';
import {
  distance,
  formatLength,
  groundDistance,
  pathLength,
} from '../../render/measure';
import { Check, Section } from '../controls';
import { useAnimationFrame, useEngine } from '../EngineContext';
import { num, t } from '../../i18n';

/**
 * Ruler and heat probe.
 *
 * The numbers update from the engine on the frame clock rather than through
 * React state — the cursor readout changes every frame, and re-rendering the
 * sidebar at 60Hz to move three numbers would cost more than the ruler does.
 */
export function MeasurePanel() {
  const engine = useEngine();
  const [enabled, setEnabled] = useState(false);
  const [pointCount, setPointCount] = useState(0);

  const cursorRef = useRef<HTMLDivElement>(null);
  const heatRef = useRef<HTMLElement>(null);
  const totalRef = useRef<HTMLElement>(null);
  const straightRef = useRef<HTMLElement>(null);
  const groundRef = useRef<HTMLElement>(null);
  const lastRef = useRef<HTMLElement>(null);

  useAnimationFrame(() => {
    if (!engine) return;
    const m = engine.measure;
    if (cursorRef.current) {
      cursorRef.current.textContent = m.cursor
        ? t('heat.measurePanel.point', { x: num(m.cursor.x, 1), y: num(m.cursor.y, 1), z: num(m.cursor.z, 1) })
        : '—';
    }
    if (heatRef.current) {
      heatRef.current.textContent =
        m.heat === null ? '—' : num(m.heat, Math.abs(m.heat) < 10 ? 3 : 1);
    }
    if (m.points.length !== pointCount) setPointCount(m.points.length);

    const pts = m.points;
    const live = m.cursor ? [...pts, m.cursor] : pts;
    if (totalRef.current) {
      totalRef.current.textContent = live.length > 1 ? formatLength(pathLength(live)) : '—';
    }
    if (straightRef.current) {
      straightRef.current.textContent =
        live.length > 1 ? formatLength(distance(live[0], live[live.length - 1])) : '—';
    }
    if (groundRef.current) {
      groundRef.current.textContent =
        live.length > 1 ? formatLength(groundDistance(live[0], live[live.length - 1])) : '—';
    }
    if (lastRef.current) {
      lastRef.current.textContent =
        live.length > 1
          ? formatLength(distance(live[live.length - 2], live[live.length - 1]))
          : '—';
    }
  }, !!engine && enabled);

  const toggle = (v: boolean) => {
    setEnabled(v);
    if (engine) engine.measureEnabled = v;
  };

  return (
    <Section title={t('heat.measurePanel.title')}>
      <Check
        label={t('heat.measurePanel.active')}
        checked={enabled}
        onChange={toggle}
        title={t('heat.measurePanel.activeTitle')}
      />
      {enabled ? (
        <>
          <div className="hint">{t('heat.measurePanel.hint')}</div>
          <div className="overlay" style={{ position: 'static', minWidth: 0 }}>
            <div className="line">
              <span>{t('heat.measurePanel.cursor')}</span>
              <b>
                <span ref={cursorRef}>—</span>
              </b>
            </div>
            <div className="line">
              <span>{t('heat.measurePanel.heatHere')}</span>
              <b ref={heatRef}>—</b>
            </div>
            <hr />
            <div className="line">
              <span>{t('heat.measurePanel.lastSegment')}</span>
              <b ref={lastRef}>—</b>
            </div>
            <div className="line">
              <span>{t('heat.measurePanel.pathTotal')}</span>
              <b ref={totalRef}>—</b>
            </div>
            <div className="line">
              <span>{t('heat.measurePanel.straight')}</span>
              <b ref={straightRef}>—</b>
            </div>
            <div className="line">
              <span>{t('heat.measurePanel.groundOnly')}</span>
              <b ref={groundRef}>—</b>
            </div>
          </div>
          <div className="row">
            <button
              disabled={pointCount === 0}
              onClick={() => {
                engine?.clearMeasure();
                setPointCount(0);
              }}
            >
              {pointCount > 0 ? t('heat.measurePanel.clearCount', { count: pointCount }) : t('heat.measurePanel.clear')}
            </button>
          </div>
        </>
      ) : (
        <div className="hint">{t('heat.measurePanel.offHint')}</div>
      )}
    </Section>
  );
}
