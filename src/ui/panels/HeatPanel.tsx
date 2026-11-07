import { useMemo, useState } from 'react';
import { estimateSaturation } from '../../data/calibrate';
import { isUnassignedLabel, rgbToCss, teamHeatColor, teamNeutralColor } from '../../render/colors';
import { heatModeFor } from '../../data/lines';
import { useStore } from '../../state/store';
import { DEFAULT_NEGATIVE_RAMP, DEFAULT_POSITIVE_RAMP } from '../../state/types';
import { Check, Rich, Section, Segmented, Slider } from '../controls';
import { CurveEditor } from '../CurveEditor';
import { useEngine } from '../EngineContext';
import { RampEditor } from '../RampEditor';
import { int, num, t } from '../../i18n';

/** A distance in metres, as the sliders show it. */
const metres = (v: number) => t('heat.heatPanel.metres', { value: num(v, v < 10 ? 2 : 0) });

export function HeatPanel() {
  const engine = useEngine();
  const mode = useStore((s) => heatModeFor(s.mode, s.lines));
  const dataset = useStore((s) => s.dataset);
  const heat = useStore((s) => s.heat);
  const patchHeat = useStore((s) => s.patchHeat);
  const setRamp = useStore((s) => s.setRamp);
  const setCurve = useStore((s) => s.setCurve);
  const difference = mode === 'heat-difference';
  const teams = mode === 'heat-teams';
  const groupCount = Math.max(1, dataset?.teamLabels.length ?? 1);

  /**
   * A swatch per group, capped.
   *
   * Capped because the palette divides by however many groups there are, and on
   * real telemetry that can be hundreds — at which point a full legend is a wall
   * of near-identical squares that says less than the first dozen plus a count.
   * The swatches are computed from the same function the shader mirrors, so a
   * legend that disagrees with the picture is a bug rather than an approximation.
   */
  const legend = useMemo(() => {
    const labels = dataset?.teamLabels ?? [];
    return labels.slice(0, 12).map((label, index) => ({
      index,
      label,
      css: rgbToCss(
        isUnassignedLabel(String(label)) ? teamNeutralColor() : teamHeatColor(index, labels.length),
      ),
    }));
  }, [dataset]);

  // The message, not its text, so it is said again in a language picked later.
  const [exposure, setExposure] = useState<{ key: string; values?: Record<string, string> } | null>(null);

  /**
   * Meter the field on screen and expose for it.
   *
   * Measured rather than derived: the analytic estimate has to assume a
   * peak-to-mean ratio, and clustered telemetry breaks that assumption badly
   * enough that the interesting part of the data can sit in the bottom quarter of
   * the ramp — which reads as "the heatmap is barely there".
   */
  const autoSaturation = async () => {
    if (!dataset || !engine) return;
    setExposure({ key: 'heat.heatPanel.metering' });
    const r = await engine.autoExpose();
    if (!r || r.saturation === null) {
      // Fall back to the analytic guess so the button always does something.
      const rows = engine.live.candidates || dataset.count;
      patchHeat({
        saturation: estimateSaturation(rows, heat.radius, heat.centerIntensity, dataset.bounds),
      });
      setExposure({ key: 'heat.heatPanel.nothingToMeter' });
      return;
    }
    setExposure({
      key: 'heat.heatPanel.metered',
      values: { coverage: num(r.coverage * 100, 1), reference: num(r.reference, 0) },
    });
  };

  return (
    <>
      <Section title={t('heat.heatPanel.shape')} defaultOpen>
        <Slider
          label={t('heat.heatPanel.radius')}
          value={heat.radius}
          min={0.05}
          max={2000}
          // A radius wider than any map is a flat wash, but the useful value
          // depends entirely on how dense the data is, so the track cannot cover
          // it. See `Jog`.
          ceiling={50_000}
          logarithmic
          onChange={(radius) => patchHeat({ radius })}
          format={metres}
          hint={t('heat.heatPanel.radiusHint')}
        />
        <Slider
          label={t('heat.heatPanel.centreIntensity')}
          value={heat.centerIntensity}
          min={0}
          max={10}
          ceiling={1000}
          step={0.01}
          onChange={(centerIntensity) => patchHeat({ centerIntensity })}
        />
        <Slider
          label={t('heat.heatPanel.edgeIntensity')}
          value={heat.edgeIntensity}
          min={-2}
          max={10}
          ceiling={1000}
          step={0.01}
          onChange={(edgeIntensity) => patchHeat({ edgeIntensity })}
          hint={t('heat.heatPanel.edgeIntensityHint')}
        />
        <div className="field">
          <div className="label">
            <span>{t('heat.heatPanel.rampShape')}</span>
          </div>
          <Segmented
            value={heat.useCurve ? 'curve' : 'simple'}
            options={[
              {
                value: 'simple' as const,
                label: t('heat.heatPanel.falloff'),
                title: t('heat.heatPanel.falloffTitle'),
              },
              {
                value: 'curve' as const,
                label: t('heat.heatPanel.curve'),
                title: t('heat.heatPanel.curveTitle'),
              },
            ]}
            onChange={(v) => patchHeat({ useCurve: v === 'curve' })}
          />
        </div>

        {heat.useCurve ? (
          <CurveEditor points={heat.curve} onChange={setCurve} />
        ) : (
          <>
            <Slider
              label={t('heat.heatPanel.falloff')}
              value={heat.falloff}
              min={0.1}
              max={8}
              ceiling={64}
              step={0.01}
              onChange={(falloff) => patchHeat({ falloff })}
              hint={t('heat.heatPanel.falloffHint')}
            />
            <Check
              label={t('heat.heatPanel.smoothRamp')}
              checked={heat.smoothRamp}
              onChange={(smoothRamp) => patchHeat({ smoothRamp })}
              title={t('heat.heatPanel.smoothRampTitle')}
            />
          </>
        )}
        <Slider
          label={t('heat.heatPanel.saturation')}
          value={heat.saturation}
          min={0.1}
          max={4000}
          // Accumulated heat scales with the row count, so a big load needs a
          // saturation point orders of magnitude past the track.
          ceiling={1e7}
          logarithmic
          onChange={(saturation) => patchHeat({ saturation })}
          hint={t('heat.heatPanel.saturationHint')}
        />
        <Slider
          label={t('heat.heatPanel.floor')}
          value={heat.floor}
          min={0}
          max={1}
          step={0.01}
          onChange={(floor) => patchHeat({ floor })}
          format={(v) => (v <= 0 ? t('heat.heatPanel.off') : t('heat.heatPanel.percent', { value: num(v * 100, 0) }))}
          hint={t('heat.heatPanel.floorHint')}
        />
        <div className="field">
          <div className="label">
            <span>{t('heat.heatPanel.response')}</span>
          </div>
          <Segmented
            value={heat.response}
            options={[
              {
                value: 'saturating' as const,
                label: t('heat.heatPanel.saturating'),
                title: t('heat.heatPanel.saturatingTitle'),
              },
              {
                value: 'linear' as const,
                label: t('heat.heatPanel.linear'),
                title: t('heat.heatPanel.linearTitle'),
              },
              {
                value: 'log' as const,
                label: t('heat.heatPanel.log'),
                title: t('heat.heatPanel.logTitle'),
              },
            ]}
            onChange={(response) => patchHeat({ response })}
          />
        </div>
        <button onClick={autoSaturation} disabled={!dataset}>
          {t('heat.heatPanel.autoExpose')}
        </button>
        {exposure && <div className="hint">{t(exposure.key, exposure.values)}</div>}
        <Check
          label={t('heat.heatPanel.flatten')}
          checked={heat.groundProjected}
          onChange={(groundProjected) => patchHeat({ groundProjected })}
          title={t('heat.heatPanel.flattenTitle')}
        />
      </Section>

      <Section title={t('heat.heatPanel.colours')}>
        {teams && (
          <>
            <div className="hint">{t('heat.heatPanel.teamsHint', { count: groupCount })}</div>
            <div className="swatches">
              {legend.map((g) => (
                <span key={g.index} className="swatch" title={`${g.label} — ${g.css}`}>
                  <i style={{ background: g.css }} />
                  {g.label}
                </span>
              ))}
              {groupCount > legend.length && (
                <span className="swatch-more">
                  {t('heat.heatPanel.more', { count: int(groupCount - legend.length) })}
                </span>
              )}
            </div>
            <Slider
              label={t('heat.heatPanel.separation')}
              value={heat.teamBoost}
              min={0}
              max={4}
              step={0.05}
              // Because the honest picture and the readable one come apart as the
              // group count grows: a dozen hues spread evenly round the circle
              // average to grey, so a correct map of a busy area is a grey map.
              // This scales a mixture's distance from neutral, sharpening the
              // imbalance that is there without inventing one — a genuine tie sits
              // at the centre and stays there at any setting. Past about 2 the
              // brighter mixtures leave sRGB and get clamped, which shifts their
              // hue; that is the trade the control exists to offer.
              hint={t('heat.heatPanel.separationHint')}
              onChange={(teamBoost) => patchHeat({ teamBoost })}
            />
          </>
        )}
        <div className="field">
          <div className="label">
            <span>
              {difference
                ? t('heat.heatPanel.positiveRamp')
                : teams
                  ? t('heat.heatPanel.opacityRamp')
                  : t('heat.heatPanel.heatRamp')}
            </span>
          </div>
        </div>
        <RampEditor stops={heat.scheme.positive} onChange={(s) => setRamp('positive', s)} />
        <button
          onClick={() => setRamp('positive', DEFAULT_POSITIVE_RAMP.map((s) => ({ ...s })))}
        >
          {t('heat.heatPanel.resetPositive')}
        </button>

        {difference && (
          <>
            <div className="field" style={{ marginTop: 6 }}>
              <div className="label">
                <span>{t('heat.heatPanel.negativeRamp')}</span>
              </div>
            </div>
            <RampEditor stops={heat.scheme.negative} onChange={(s) => setRamp('negative', s)} />
            <button
              onClick={() => setRamp('negative', DEFAULT_NEGATIVE_RAMP.map((s) => ({ ...s })))}
            >
              {t('heat.heatPanel.resetNegative')}
            </button>
          </>
        )}
      </Section>

      <Section title={t('heat.heatPanel.clamps')}>
        <div className="hint">{t('heat.heatPanel.clampsHint')}</div>
        <Slider
          label={t('heat.heatPanel.minPixelRadius')}
          value={heat.minPixelRadius}
          min={0}
          max={16}
          ceiling={512}
          step={0.1}
          onChange={(minPixelRadius) => patchHeat({ minPixelRadius })}
          hint={t('heat.heatPanel.minPixelRadiusHint')}
        />
        <Slider
          label={t('heat.heatPanel.maxPixelRadius')}
          value={heat.maxPixelRadius}
          min={2}
          max={1024}
          // Past the height of the viewport the clamp stops clamping anything,
          // so this is the point where the setting ceases to exist.
          ceiling={8192}
          logarithmic
          onChange={(maxPixelRadius) => patchHeat({ maxPixelRadius })}
          format={(v) => t('heat.heatPanel.pixels', { value: int(v) })}
        />
      </Section>

      <Section title={t('heat.heatPanel.depth')} defaultOpen>
        <div className="hint">{t('heat.heatPanel.depthHint')}</div>
        <Check
          label={t('heat.heatPanel.hideBehindTerrain')}
          checked={heat.hideBehindGround}
          onChange={(hideBehindGround) => patchHeat({ hideBehindGround })}
          title={t('heat.heatPanel.hideBehindTerrainTitle')}
        />
        <Slider
          label={t('heat.heatPanel.occlusion')}
          value={heat.occlusion}
          min={0}
          max={1}
          step={0.01}
          onChange={(occlusion) => patchHeat({ occlusion })}
          format={(v) =>
            v <= 0
              ? t('heat.heatPanel.showsThrough')
              : v >= 1
                ? t('heat.heatPanel.hiddenEntirely')
                : t('heat.heatPanel.dimmer', { value: num(v * 100, 0) })
          }
          hint={t('heat.heatPanel.occlusionHint')}
        />
        {heat.groundProjected && (
          <div className="hint" style={{ color: 'var(--warm)' }}>
            {t('heat.heatPanel.groundProjectedHint')}
          </div>
        )}
      </Section>

      <Section title={t('heat.heatPanel.culling')}>
        <div className="hint">{t('heat.heatPanel.cullingHint')}</div>
        <Slider
          label={t('heat.heatPanel.near')}
          value={heat.cullNear}
          min={0.5}
          max={5000}
          // Up to the far track's end, so the near bound can be walked past
          // anything the far one can reach.
          ceiling={200_000}
          logarithmic
          zeroAt={0}
          onChange={(cullNear) => patchHeat({ cullNear })}
          format={(v) => (v <= 0 ? t('heat.heatPanel.off') : metres(v))}
        />
        <Slider
          label={t('heat.heatPanel.far')}
          value={heat.cullFar}
          min={1}
          max={200000}
          ceiling={1e7}
          logarithmic
          zeroAt={0}
          onChange={(cullFar) => patchHeat({ cullFar })}
          format={(v) => (v <= 0 ? t('heat.heatPanel.off') : metres(v))}
        />
        <Check
          label={t('heat.heatPanel.cutPlane')}
          checked={heat.cullPlanar}
          onChange={(cullPlanar) => patchHeat({ cullPlanar })}
          title={t('heat.heatPanel.cutPlaneTitle')}
        />
        <Check
          label={t('heat.heatPanel.cutLevel')}
          checked={heat.cullGeometry}
          onChange={(cullGeometry) => patchHeat({ cullGeometry })}
          title={t('heat.heatPanel.cutLevelTitle')}
        />
        <div className="hint">
          <Rich text={t('heat.heatPanel.cullKeys', { closer: '[', further: ']', toggle: '\\' })} />
        </div>
      </Section>
    </>
  );
}
