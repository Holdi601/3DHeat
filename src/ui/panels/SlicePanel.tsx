import { useStore } from '../../state/store';
import { Check, Section, Segmented, Slider } from '../controls';
import { num, t } from '../../i18n';

/**
 * The slice slab: a cut through the world, so you can see inside it.
 *
 * The counterpart to depth occlusion. Once the level correctly hides what is
 * behind it, the inside of a building is hidden too — and that is often exactly
 * where the interesting heat is. A slab answers both questions with one control:
 * thin, it is a floor plan at that height; wide with one edge past the world, it
 * is "everything below the third storey".
 *
 * Bounds come from the level when there is one, and from the data otherwise, so
 * the sliders always span something real rather than an arbitrary range.
 */
export function SlicePanel() {
  const slice = useStore((s) => s.slice);
  const patchSlice = useStore((s) => s.patchSlice);
  const level = useStore((s) => s.level);
  const dataset = useStore((s) => s.dataset);

  const bounds =
    level && level.kind === 'model' ? level.bounds : (dataset?.bounds ?? null);
  if (!bounds) return null;

  const span = {
    x: [bounds.minX, bounds.maxX] as const,
    y: [bounds.minY, bounds.maxY] as const,
    z: [bounds.minZ, bounds.maxZ] as const,
  }[slice.axis];
  const size = Math.max(1e-3, span[1] - span[0]);

  return (
    <Section
      title={t('heat.slicePanel.title')}
      right={
        <span style={{ color: slice.enabled ? 'var(--accent)' : 'var(--text-faint)' }}>
          {slice.enabled ? slice.axis.toUpperCase() : t('heat.slicePanel.off')}
        </span>
      }
    >
      <Check
        label={t('heat.slicePanel.enable')}
        checked={slice.enabled}
        onChange={(enabled) =>
          patchSlice({
            enabled,
            // First use lands the slab in the middle of whatever is loaded,
            // rather than at zero, which is often outside the world entirely.
            center: slice.center === 0 ? (span[0] + span[1]) / 2 : slice.center,
            thickness: slice.thickness === 500 ? size * 0.15 : slice.thickness,
          })
        }
      />
      {!slice.enabled && (
        <div className="hint">{t('heat.slicePanel.hint')}</div>
      )}

      {slice.enabled && (
        <>
          <Segmented<'x' | 'y' | 'z'>
            value={slice.axis}
            options={[
              { value: 'y', label: t('heat.slicePanel.height') },
              { value: 'x', label: 'X' },
              { value: 'z', label: 'Z' },
            ]}
            onChange={(axis) =>
              patchSlice({
                axis,
                // Re-centre on the new axis; the old centre means nothing on it.
                center:
                  axis === 'x'
                    ? (bounds.minX + bounds.maxX) / 2
                    : axis === 'y'
                      ? (bounds.minY + bounds.maxY) / 2
                      : (bounds.minZ + bounds.maxZ) / 2,
              })
            }
          />
          <Slider
            label={t('heat.slicePanel.position')}
            value={slice.center}
            min={span[0]}
            max={span[1]}
            step={size / 500}
            onChange={(center) => patchSlice({ center })}
            format={(v) => num(v, 0)}
          />
          <Slider
            label={t('heat.slicePanel.thickness')}
            value={slice.thickness}
            min={size / 500}
            max={size * 2}
            logarithmic
            onChange={(thickness) => patchSlice({ thickness })}
            format={(v) => (v >= size ? t('heat.slicePanel.pastWorld') : num(v, 0))}
            hint={t('heat.slicePanel.thicknessHint')}
          />
          <Slider
            label={t('heat.slicePanel.outside')}
            value={slice.outsideOpacity}
            min={0}
            max={1}
            step={0.01}
            onChange={(outsideOpacity) => patchSlice({ outsideOpacity })}
            format={(v) =>
              v <= 0 ? t('heat.slicePanel.removed') : t('heat.slicePanel.visible', { value: num(v * 100, 0) })
            }
            hint={t('heat.slicePanel.outsideHint')}
          />
          <Check
            label={t('heat.slicePanel.clipHeat')}
            checked={slice.clipHeat}
            onChange={(clipHeat) => patchSlice({ clipHeat })}
          />
          {!slice.clipHeat && (
            <div className="hint">{t('heat.slicePanel.clipHeatHint')}</div>
          )}
        </>
      )}
    </Section>
  );
}
