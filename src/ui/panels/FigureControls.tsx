import { num, t } from '../../i18n';
import { useStore } from '../../state/store';
import { Check, Slider } from '../controls';

/**
 * The figures' controls, the same settings wherever they are shown (the team
 * panel, the match replay): figures instead of boxes, their size as a
 * multiple of true size, and the smallest they are drawn on screen.
 */
export function FigureControls({ toggle = true }: { toggle?: boolean }) {
  const figures = useStore((s) => s.team.figures);
  const figureScale = useStore((s) => s.team.figureScale);
  const figurePixels = useStore((s) => s.team.figurePixels);
  const patchTeam = useStore((s) => s.patchTeam);
  return (
    <>
      {toggle && (
        <Check
          label={t('heat.teamPanel.figures')}
          checked={figures}
          onChange={(v) => patchTeam({ figures: v })}
          title={t('heat.teamPanel.figuresTitle')}
        />
      )}
      {figures && (
        <>
          <Slider
            label={t('heat.teamPanel.figureScale')}
            value={figureScale}
            min={0.25}
            max={20}
            logarithmic
            onChange={(v) => patchTeam({ figureScale: v })}
            format={(v) => `${num(v, v < 10 ? 2 : 1)}×`}
            hint={t('units.figures.scaleHint')}
          />
          <Slider
            label={t('heat.teamPanel.figurePixels')}
            value={figurePixels}
            min={0}
            max={200}
            step={1}
            onChange={(v) => patchTeam({ figurePixels: v })}
            format={(v) => (v < 0.5 ? t('heat.teamPanel.trueSize') : t('heat.teamPanel.pixels', { value: num(v, 0) }))}
            hint={t('heat.teamPanel.figurePixelsHint')}
          />
        </>
      )}
    </>
  );
}
