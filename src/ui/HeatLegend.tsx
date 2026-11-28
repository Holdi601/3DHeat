/**
 * The heat's colour scale over the view: what a colour means in numbers, and
 * the lock that keeps it while the view changes (docs/heatmap.md#the-scale).
 *
 * Sequential for the heat (none, the middle, the top), diverging for the
 * difference (the − side's arm, nothing in the middle, the + side's arm, each
 * named), the rate map's share won around the overall one. The colours are the
 * ramps the composite draws with (HeatSettings.scheme), so the legend cannot
 * disagree with the picture. The numbers are rows per area from the sprite's
 * mass (render/heatScale.ts): worked out when a setting changes, never per frame.
 */

import { useMemo } from 'react';
import { heatModeFor } from '../data/lines';
import { wonLostOf } from '../data/wonLost';
import { lang, num, t, useLang } from '../i18n';
import { heatScale, type HeatScale } from '../render/heatScale';
import { overallShare } from '../render/rateMap';
import { useSplitStatus } from '../state/splitStatus';
import { useTileHeat } from '../render/heatTiles/tileHeat';
import { useStore } from '../state/store';
import type { ColorStop } from '../state/types';
import { useEngine } from './EngineContext';

const css = (s: ColorStop) => `rgba(${s.rgb[0]}, ${s.rgb[1]}, ${s.rgb[2]}, ${s.alpha})`;

/** A ramp's stops as gradient stops from `from` % to `to` %. */
function stops(ramp: ColorStop[], from: number, to: number): string[] {
  return [...ramp].sort((a, b) => a.pos - b.pos).map((s) => `${css(s)} ${(from + (to - from) * s.pos).toFixed(2)}%`);
}

/** A number for the legend: two significant digits, compact past ten thousand. */
export function legendNumber(v: number): string {
  if (!Number.isFinite(v)) return '—';
  if (v === 0) return '0';
  const a = Math.abs(v);
  try {
    return new Intl.NumberFormat(lang(), a >= 1e4 ? { notation: 'compact', maximumSignificantDigits: 2 } : { maximumSignificantDigits: 2 }).format(v);
  } catch {
    return num(v, a >= 10 ? 0 : 2);
  }
}

/** The unit line under the scale. */
function unitText(scale: HeatScale): string {
  const area = scale.area >= 1e6 ? 'km' : 'm100';
  return t(`heat.legend.unit.${scale.unit}`, { area: t(`heat.legend.area.${area}`) });
}

export function HeatLegend() {
  useLang();
  const engine = useEngine();
  const dataset = useStore((s) => s.dataset);
  const mode = useStore((s) => heatModeFor(s.mode, s.lines));
  const heat = useStore((s) => s.heat);
  const split = useStore((s) => s.split);
  const positiveTeams = useStore((s) => s.positiveTeams);
  const negativeTeams = useStore((s) => s.negativeTeams);
  const status = useSplitStatus();
  const shown = useStore((s) => s.heat.showLegend);
  // Heat from tiles alone (no rows loaded): a count is one row's sprite, so the numbers hold; the
  // sides are the pyramid's groups.
  const tilesOn = useTileHeat((s) => s.on);
  const channels = useTileHeat((s) => s.channels);

  const difference = mode === 'heat-difference';
  const rate = difference && heat.splitRate;
  const shares = difference && heat.splitShares && !rate;
  const counts = heat.splitPer === 'matches' && status.positiveMatches > 0 && status.negativeMatches > 0
    ? { per: 'matches' as const, positive: status.positiveMatches, negative: status.negativeMatches }
    : { per: 'rows' as const, positive: status.positive, negative: status.negative };
  const scale = useMemo(
    () =>
      heatScale({
        saturation: heat.saturation,
        response: heat.response,
        floor: heat.floor,
        kernel: {
          radius: heat.radius,
          minPx: heat.minPixelRadius,
          maxPx: heat.maxPixelRadius,
          zoomInvariant: heat.zoomInvariant,
          center: heat.centerIntensity,
          edge: heat.edgeIntensity,
          falloff: heat.falloff,
          smooth: heat.smoothRamp,
          curve: heat.useCurve ? heat.curve : null,
        },
        rawHeat: mode === 'heat-lines' || !!heat.weightBy,
        shares: shares ? counts : null,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [heat.saturation, heat.response, heat.floor, heat.radius, heat.minPixelRadius, heat.maxPixelRadius, heat.zoomInvariant, heat.centerIntensity, heat.edgeIntensity, heat.falloff, heat.smoothRamp, heat.useCurve, heat.curve, heat.weightBy, mode, shares, counts.per, counts.positive, counts.negative],
  );

  if ((!dataset && !tilesOn) || !shown || (mode !== 'heat-simple' && mode !== 'heat-difference' && mode !== 'heat-lines')) return null;

  // What each side of a difference is.
  const wl = difference && dataset ? wonLostOf(split, dataset) : null;
  const labels = dataset?.teamLabels ?? channels;
  const teamNames = (ix: number[]) => {
    const names = ix.map((i) => String(labels[i] ?? i));
    return names.length > 2 ? t('heat.legend.teams', { first: names[0], more: names.length - 1 }) : names.join(', ');
  };
  const plusName = wl ? t('heat.legend.won') : split.kind === 'teams' ? teamNames(positiveTeams) || '+' : t('heat.legend.plus');
  const minusName = wl ? t('heat.legend.lost') : split.kind === 'teams' ? teamNames(negativeTeams) || '−' : t('heat.legend.minus');

  const { positive, negative } = heat.scheme;
  const gradient = difference
    ? `linear-gradient(to right, ${[...stops(negative, 50, 0).reverse(), ...stops(positive, 50, 100)].join(', ')})`
    : `linear-gradient(to right, ${stops(positive, 0, 100).join(', ')})`;

  let ticks: { at: number; text: string }[];
  if (rate) {
    const overall = overallShare(status.positive, status.negative);
    const pct = (v: number) => `${num(Math.min(100, Math.max(0, v * 100)), 0)}%`;
    ticks = [
      { at: 0, text: pct(overall - heat.rateSpan) },
      { at: 50, text: pct(overall) },
      { at: 100, text: pct(overall + heat.rateSpan) },
    ];
  } else if (difference) {
    const [, mid, top] = scale.ticks;
    const v = (k: typeof mid) => (scale.unit === 'heat' ? legendNumber(k.heat) : legendNumber(k.value));
    ticks = [
      { at: 0, text: `${top.orMore ? '≤' : ''}−${v(top)}` },
      { at: 50 - mid.pos * 50, text: `−${v(mid)}` },
      { at: 50, text: '0' },
      { at: 50 + mid.pos * 50, text: `+${v(mid)}` },
      { at: 100, text: `${top.orMore ? '≥' : ''}+${v(top)}` },
    ];
  } else {
    ticks = scale.ticks.map((k) => ({
      at: k.pos * 100,
      text: `${k.orMore ? '≥' : ''}${scale.unit === 'heat' ? legendNumber(k.heat) : legendNumber(k.value)}`,
    }));
  }

  const locked = heat.exposureLocked;
  const title = rate ? t('heat.legend.rateTitle') : difference ? t('heat.legend.diffTitle') : t('heat.legend.title');
  return (
    <div className="heat-legend" data-testid="heat-legend" role="figure" aria-label={title}>
      <div className="heat-legend-head">
        <span>{title}</span>
        <button
          className={`heat-legend-lock${locked ? ' on' : ''}`}
          data-testid="heat-legend-lock"
          aria-pressed={locked}
          title={t(locked ? 'heat.legend.unlockTitle' : 'heat.legend.lockTitle')}
          onClick={() => engine?.lockExposure(!locked)}
        >
          {t(locked ? 'heat.legend.locked' : 'heat.legend.lock')}
        </button>
      </div>
      {difference && (
        <div className="heat-legend-sides">
          <span title={minusName}>− {minusName}</span>
          <span title={plusName}>{plusName} +</span>
        </div>
      )}
      <div className="heat-legend-bar" style={{ background: gradient }}>
        {difference && <i className="heat-legend-mid" />}
      </div>
      <div className="heat-legend-ticks">
        {ticks.map((k, i) => (
          <span key={i} style={{ left: `${k.at}%` }} className={i === 0 ? 'first' : i === ticks.length - 1 ? 'last' : undefined}>
            {k.text}
          </span>
        ))}
      </div>
      <div className="heat-legend-unit" data-testid="heat-legend-unit">
        {rate ? t('heat.legend.unit.rate') : unitText(scale)}
        {locked && <> · {t('heat.legend.lockedAt', { value: legendNumber(heat.saturation) })}</>}
      </div>
    </div>
  );
}
