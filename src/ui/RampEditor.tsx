import { stopToCss } from '../render/colors';
import type { ColorStop } from '../state/types';
import { int, t } from '../i18n';

/**
 * Editor for one heat ramp.
 *
 * Stops carry alpha as well as colour because the zero-heat end of the ramp has
 * to be fully transparent for the background to read through — that transparency
 * is what makes overlapping sprites accumulate visibly rather than flatten.
 */
export function RampEditor({
  stops,
  onChange,
}: {
  stops: ColorStop[];
  onChange: (s: ColorStop[]) => void;
}) {
  const sorted = [...stops].sort((a, b) => a.pos - b.pos);
  const gradient = `linear-gradient(90deg, ${sorted
    .map((s) => `${stopToCss(s)} ${(s.pos * 100).toFixed(1)}%`)
    .join(', ')})`;

  const update = (i: number, patch: Partial<ColorStop>) => {
    const next = stops.map((s, j) => (j === i ? { ...s, ...patch } : s));
    onChange(next);
  };

  return (
    <div className="field">
      <div className="ramp">
        <div className="fill" style={{ backgroundImage: gradient }} />
      </div>
      <div className="stop-list">
        {stops.map((s, i) => (
          <div className="stop-row" key={i}>
            <input
              type="color"
              value={rgbToHex(s.rgb)}
              onChange={(e) => update(i, { rgb: hexToRgb(e.target.value) })}
            />
            <input
              type="number"
              min={0}
              max={1}
              step={0.01}
              value={Number(s.pos.toFixed(3))}
              title={t('heat.rampEditor.position')}
              onChange={(e) => update(i, { pos: clamp01(Number(e.target.value)) })}
            />
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={s.alpha}
              title={t('heat.rampEditor.opacity', { percent: int(s.alpha * 100) })}
              onChange={(e) => update(i, { alpha: clamp01(Number(e.target.value)) })}
            />
            <button
              className="del"
              title={t('heat.rampEditor.remove')}
              disabled={stops.length <= 2}
              onClick={() => onChange(stops.filter((_, j) => j !== i))}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={() => {
          const last = sorted[sorted.length - 1];
          const prev = sorted[sorted.length - 2] ?? last;
          onChange([
            ...stops,
            {
              pos: clamp01((last.pos + prev.pos) / 2),
              rgb: [...last.rgb] as [number, number, number],
              alpha: last.alpha,
            },
          ]);
        }}
      >
        {t('heat.rampEditor.add')}
      </button>
    </div>
  );
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  const h = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

function hexToRgb(hex: string): [number, number, number] {
  const v = parseInt(hex.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

function clamp01(v: number): number {
  return Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 0;
}
