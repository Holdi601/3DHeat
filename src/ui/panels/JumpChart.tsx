import { useMemo } from 'react';
import { stepHistogram, type StepHistogram } from '../../data/lines';
import type { Dataset } from '../../state/types';
import { num, t } from '../../i18n';

const WIDTH = 280;
const HEIGHT = 96;
const LEFT = 4;
const RIGHT = 4;
const TOP = 6;
const BOTTOM = 18;

/** The tick lengths on the axis: whole powers of ten. */
function ticks(lo: number, hi: number): number[] {
  const out: number[] = [];
  for (let e = Math.ceil(Math.log10(lo)); e <= Math.floor(Math.log10(hi)); e++) out.push(10 ** e);
  return out;
}

const length = (v: number) => t('heat.heatPanel.metres', { value: num(v, v < 10 ? 2 : 0) });

/**
 * How far people move between two samples, with the limit on it: the steps left
 * of the line are drawn, those right of it are jumps. Both axes are logarithmic,
 * because the jumps are a hundredth of the steps and a thousand times as long.
 * Clicking the chart moves the limit there.
 */
export function JumpChart({
  dataset,
  limit,
  onLimit,
}: {
  dataset: Dataset;
  limit: number | null;
  onLimit: (v: number) => void;
}) {
  const hist: StepHistogram | null = useMemo(() => stepHistogram(dataset), [dataset]);
  if (!hist || hist.steps === 0) return null;
  const { edges, counts, steps } = hist;
  const lo = Math.log10(edges[0]);
  const hi = Math.log10(edges[edges.length - 1]);
  const x = (v: number) => LEFT + ((Math.log10(v) - lo) / (hi - lo)) * (WIDTH - LEFT - RIGHT);
  const top = Math.log10(Math.max(...counts) + 1);
  const y = (c: number) => HEIGHT - BOTTOM - (Math.log10(c + 1) / top) * (HEIGHT - BOTTOM - TOP);
  let over = 0;
  if (limit !== null) {
    counts.forEach((c, i) => {
      if (edges[i] >= limit) over += c;
    });
  }
  const pick = (e: React.MouseEvent<SVGSVGElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const at = ((e.clientX - box.left) / box.width) * WIDTH;
    onLimit(10 ** (lo + ((at - LEFT) / (WIDTH - LEFT - RIGHT)) * (hi - lo)));
  };
  return (
    <div className="jump-chart">
      <div className="label">
        <span>{t('heat.linePanel.chartTitle')}</span>
      </div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={t('heat.linePanel.chartTitle')}
        onClick={pick}
        style={{ width: '100%', display: 'block', cursor: 'pointer' }}
      >
        {counts.map((c, i) => {
          if (c === 0) return null;
          const x0 = x(edges[i]);
          const x1 = x(edges[i + 1]);
          const cut = limit !== null && edges[i] >= limit;
          return (
            <g key={i}>
              <title>
                {t('heat.linePanel.chartBar', {
                  from: length(edges[i]),
                  to: length(edges[i + 1]),
                  share: num((c / steps) * 100, c / steps < 0.001 ? 3 : 1),
                })}
              </title>
              {/* A taller target than the bar, so a short one can still be hovered. */}
              <rect x={x0} y={TOP} width={Math.max(1, x1 - x0)} height={HEIGHT - BOTTOM - TOP} fill="transparent" />
              <rect
                x={x0 + 0.5}
                y={y(c)}
                width={Math.max(1, x1 - x0 - 1)}
                height={HEIGHT - BOTTOM - y(c)}
                rx={1}
                fill={cut ? 'var(--text-dim, #8d96a5)' : 'var(--accent, #4da3ff)'}
              />
            </g>
          );
        })}
        <line
          x1={LEFT}
          x2={WIDTH - RIGHT}
          y1={HEIGHT - BOTTOM}
          y2={HEIGHT - BOTTOM}
          stroke="var(--text-dim, #8d96a5)"
          strokeWidth={1}
        />
        {ticks(edges[0], edges[edges.length - 1]).map((v) => (
          <text
            key={v}
            x={x(v)}
            y={HEIGHT - 5}
            textAnchor="middle"
            fontSize={9}
            fill="var(--text-dim, #8d96a5)"
          >
            {length(v)}
          </text>
        ))}
        {limit !== null && limit >= edges[0] && limit <= edges[edges.length - 1] && (
          <line x1={x(limit)} x2={x(limit)} y1={TOP - 4} y2={HEIGHT - BOTTOM} stroke="currentColor" strokeWidth={2} />
        )}
      </svg>
      {limit !== null && (
        <div className="hint">
          {t('heat.linePanel.chartCut', {
            limit: length(limit),
            share: num((over / steps) * 100, over / steps < 0.001 ? 3 : 1),
          })}
        </div>
      )}
      <div className="hint">{t('heat.linePanel.chartHint')}</div>
    </div>
  );
}
