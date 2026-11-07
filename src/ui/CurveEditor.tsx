import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CURVE_PRESETS,
  evalCurve,
  normaliseCurve,
  type CurvePoint,
} from '../state/curve';
import { t } from '../i18n';

/**
 * Bézier editor for the sprite ramp.
 *
 * The horizontal axis is distance from the sprite centre and the vertical axis is
 * intensity, so the curve is a literal cross-section of one heat sprite — which
 * is why a preview of the resulting sprite sits next to it. Editing a ramp by
 * numbers is guesswork; editing it against the thing it produces is not.
 *
 * Handles are dragged in SVG user units that happen to be the curve's own 0..1
 * domain, so there is no coordinate conversion beyond a flip of y.
 */

/** SVG viewBox size. Unitless; the element scales to its container. */
const W = 100;
const H = 100;

type Drag =
  | { kind: 'point'; index: number }
  | { kind: 'in' | 'out'; index: number }
  | null;

export function CurveEditor({
  points,
  onChange,
}: {
  points: CurvePoint[];
  onChange: (p: CurvePoint[]) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState<Drag>(null);
  const [selected, setSelected] = useState(0);
  // Dragging must not depend on React having re-rendered between mouse events,
  // so the live value is held in a ref and pushed to the store as it changes.
  const live = useRef(points);
  live.current = points;

  const toCurve = useCallback((e: { clientX: number; clientY: number }) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const r = svg.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) / r.width,
      // SVG y grows downward; the curve's does not.
      y: 1 - (e.clientY - r.top) / r.height,
    };
  }, []);

  useEffect(() => {
    if (!drag) return;
    const onMove = (e: MouseEvent) => {
      const { x, y } = toCurve(e);
      const next = live.current.map((p) => ({ ...p }));
      const p = next[drag.index];
      if (!p) return;
      if (drag.kind === 'point') {
        const isFirst = drag.index === 0;
        const isLast = drag.index === next.length - 1;
        // The endpoints own x = 0 and x = 1; only their height is editable.
        if (!isFirst && !isLast) {
          // Keep interior points between their neighbours so the curve stays a
          // function of x — reordering mid-drag would make the handles jump.
          const lo = next[drag.index - 1].x + 0.001;
          const hi = next[drag.index + 1].x - 0.001;
          p.x = clamp(x, lo, hi);
        }
        p.y = clamp01(y);
      } else {
        const dx = x - p.x;
        const dy = y - p.y;
        if (drag.kind === 'out') {
          p.outX = Math.max(0, dx);
          p.outY = dy;
        } else {
          p.inX = Math.min(0, dx);
          p.inY = dy;
        }
      }
      live.current = next;
      onChange(next);
    };
    const onUp = () => setDrag(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [drag, onChange, toCurve]);

  const path = useMemo(() => buildPath(points), [points]);
  const preview = useMemo(() => previewGradient(points), [points]);

  const addPointAt = (e: React.MouseEvent) => {
    const { x } = toCurve(e);
    const at = clamp(x, 0.02, 0.98);
    const y = evalCurve(points, at);
    // A new point inherits the slope it is placed on, so dropping one onto a
    // curve does not visibly change it — it only gives you somewhere to pull.
    const eps = 0.01;
    const slope = (evalCurve(points, Math.min(1, at + eps)) - evalCurve(points, Math.max(0, at - eps))) / (2 * eps);
    const h = 0.08;
    const next = normaliseCurve([
      ...points.map((p) => ({ ...p })),
      { x: at, y, inX: -h, inY: -h * slope, outX: h, outY: h * slope },
    ]);
    onChange(next);
    setSelected(next.findIndex((p) => Math.abs(p.x - at) < 1e-6));
  };

  const removePoint = (index: number) => {
    if (points.length <= 2) return;
    if (index === 0 || index === points.length - 1) return; // endpoints are structural
    onChange(points.filter((_, i) => i !== index));
    setSelected(0);
  };

  return (
    <div className="field">
      <div className="curve-wrap">
        <svg
          ref={svgRef}
          className="curve"
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          data-testid="curve-editor"
          onDoubleClick={addPointAt}
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* Grid at quarters, so a symmetric curve is easy to eyeball. */}
          {[0.25, 0.5, 0.75].map((f) => (
            <g key={f}>
              <line x1={f * W} y1={0} x2={f * W} y2={H} className="curve-grid" />
              <line x1={0} y1={f * H} x2={W} y2={f * H} className="curve-grid" />
            </g>
          ))}
          <rect x={0} y={0} width={W} height={H} className="curve-frame" />

          {/* Handle stems, drawn under the curve so they never hide it. */}
          {points.map((p, i) => (
            <g key={`h${i}`} className={i === selected ? 'on' : ''}>
              {i > 0 && (
                <line
                  x1={p.x * W}
                  y1={(1 - p.y) * H}
                  x2={(p.x + p.inX) * W}
                  y2={(1 - (p.y + p.inY)) * H}
                  className="curve-stem"
                />
              )}
              {i < points.length - 1 && (
                <line
                  x1={p.x * W}
                  y1={(1 - p.y) * H}
                  x2={(p.x + p.outX) * W}
                  y2={(1 - (p.y + p.outY)) * H}
                  className="curve-stem"
                />
              )}
            </g>
          ))}

          <path d={path} className="curve-line" />

          {/* Handles before points, so a point on top of its handle wins the click. */}
          {points.map((p, i) => (
            <g key={`g${i}`}>
              {i > 0 && (
                <circle
                  cx={(p.x + p.inX) * W}
                  cy={(1 - (p.y + p.inY)) * H}
                  r={2.6}
                  className="curve-handle"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setSelected(i);
                    setDrag({ kind: 'in', index: i });
                  }}
                />
              )}
              {i < points.length - 1 && (
                <circle
                  cx={(p.x + p.outX) * W}
                  cy={(1 - (p.y + p.outY)) * H}
                  r={2.6}
                  className="curve-handle"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setSelected(i);
                    setDrag({ kind: 'out', index: i });
                  }}
                />
              )}
            </g>
          ))}
          {points.map((p, i) => (
            <circle
              key={`p${i}`}
              cx={p.x * W}
              cy={(1 - p.y) * H}
              r={3.4}
              className={`curve-point${i === selected ? ' on' : ''}`}
              data-point={i}
              onMouseDown={(e) => {
                e.preventDefault();
                setSelected(i);
                if (e.button === 2 || e.altKey) removePoint(i);
                else setDrag({ kind: 'point', index: i });
              }}
            />
          ))}
        </svg>
        {/* What one sprite will actually look like. */}
        <div className="curve-preview" data-testid="curve-preview">
          <div className="disc" style={{ background: preview }} />
        </div>
      </div>

      <div className="curve-axes">
        <span>{t('heat.curveEditor.centre')}</span>
        <span>{t('heat.curveEditor.rim')}</span>
      </div>

      <div className="hint">{t('heat.curveEditor.hint')}</div>

      <div className="row wrap">
        {Object.keys(CURVE_PRESETS).map((name) => (
          <button
            key={name}
            title={t('heat.curveEditor.presetTitle', { preset: presetLabel(name) })}
            onClick={() => onChange(CURVE_PRESETS[name].map((p) => ({ ...p })))}
          >
            {presetLabel(name)}
          </button>
        ))}
      </div>
    </div>
  );
}

/** A preset's name in the user's language; the preset keys themselves are data. */
function presetLabel(name: string): string {
  switch (name) {
    case 'Linear':
      return t('heat.curveEditor.preset.linear');
    case 'Smooth':
      return t('heat.curveEditor.preset.smooth');
    case 'Tight':
      return t('heat.curveEditor.preset.tight');
    case 'Plateau':
      return t('heat.curveEditor.preset.plateau');
    case 'Ring':
      return t('heat.curveEditor.preset.ring');
    case 'Shelf':
      return t('heat.curveEditor.preset.shelf');
    default:
      return name;
  }
}

/** The curve as an SVG path, one cubic segment per interval. */
function buildPath(points: CurvePoint[]): string {
  if (points.length === 0) return '';
  let d = `M ${(points[0].x * W).toFixed(2)} ${((1 - points[0].y) * H).toFixed(2)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    const dx = b.x - a.x;
    // Same horizontal clamp the evaluator applies, so the drawn curve is the
    // curve — a path that disagrees with the baked LUT is worse than no preview.
    const c1x = a.x + clamp(a.outX, 0, dx);
    const c2x = b.x + clamp(b.inX, -dx, 0);
    d +=
      ` C ${(c1x * W).toFixed(2)} ${((1 - (a.y + a.outY)) * H).toFixed(2)}` +
      ` ${(c2x * W).toFixed(2)} ${((1 - (b.y + b.inY)) * H).toFixed(2)}` +
      ` ${(b.x * W).toFixed(2)} ${((1 - b.y) * H).toFixed(2)}`;
  }
  return d;
}

/**
 * The sprite as a CSS radial gradient.
 *
 * Only an approximation of the shader — it has no accumulation and no colour ramp
 * behind it — but it answers the question the editor exists to answer: is this
 * shape a tight dot, a soft blob, or a ring?
 */
function previewGradient(points: CurvePoint[]): string {
  const stops: string[] = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    const v = evalCurve(points, t);
    stops.push(`rgba(255, 190, 90, ${v.toFixed(3)}) ${(t * 100).toFixed(1)}%`);
  }
  return `radial-gradient(circle at 50% 50%, ${stops.join(', ')})`;
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

function clamp01(v: number): number {
  return clamp(v, 0, 1);
}
