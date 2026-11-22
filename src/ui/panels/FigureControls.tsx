import { num, t } from '../../i18n';
import { useStore } from '../../state/store';
import type { FarMode } from '../../render/symbols/lod';
import type { SymbolStyle } from '../../render/symbols/affiliation';
import { Check, Segmented, Select, Slider } from '../controls';
import { OUTCOME_COLOURS } from '../../vehicle/scene';
import { OUTCOMES } from '../../vehicle/hits';
import { useEffect, useState } from 'react';
import { fetchModelPackIndex } from '../../figures/modelpack';
import { modelPreference, setModelPreference } from '../../figures/modelprefer';

/**
 * Which game's model a unit is drawn with where several games' packs have the same vehicle: each game's own (the
 * default) or one game's first (an IL-2 Bf 109 K-4 with the DCS model). Shown when the server has two or more packs;
 * the choice applies once the page is loaded again (every thread installs the packs once).
 */
function ModelSource() {
  const [games, setGames] = useState<string[]>([]);
  const [value, setValue] = useState(modelPreference);
  const [changed, setChanged] = useState(false);
  useEffect(() => {
    let live = true;
    void fetchModelPackIndex().then((ix) => {
      if (live && ix) setGames([...new Set(ix.packs.map((p) => p.game))].sort());
    });
    return () => {
      live = false;
    };
  }, []);
  if (games.length < 2) return null;
  return (
    <>
      <Select<string>
        label={t('units.models.prefer')}
        value={value}
        options={[{ value: '', label: t('units.models.preferOwn') }, ...games.map((g) => ({ value: g, label: t('units.models.preferGame', { game: g }) }))]}
        onChange={(v) => {
          setModelPreference(v ?? '');
          setValue(v ?? '');
          setChanged(true);
        }}
      />
      <div className="hint">
        {t('units.models.preferHint')}
        {changed && (
          <>
            {' '}
            <button type="button" className="link" onClick={() => location.reload()}>
              {t('units.models.reload')}
            </button>
          </>
        )}
      </div>
    </>
  );
}

const swatch = (c: readonly number[]) => `rgb(${c.map((v) => Math.round(Math.min(1, v) * 255)).join(',')})`;

/**
 * The figures' controls, the same settings wherever they are shown (the team
 * panel, the match replay): figures instead of boxes, their size as a
 * multiple of true size, the smallest they are drawn on screen, and what
 * they become far off - their model, an arrow of their kind, or a map
 * symbol (`render/symbols/`).
 */
export function FigureControls({ toggle = true }: { toggle?: boolean }) {
  const figures = useStore((s) => s.team.figures);
  const figureScale = useStore((s) => s.team.figureScale);
  const figurePixels = useStore((s) => s.team.figurePixels);
  const farMode = useStore((s) => s.team.farMode);
  const symbolStyle = useStore((s) => s.team.symbolStyle);
  const symbolPx = useStore((s) => s.team.symbolPx);
  const mySide = useStore((s) => s.team.mySide);
  const others = useStore((s) => s.team.symbolOthers);
  const ticks = useStore((s) => s.team.symbolTicks);
  const weaponMarks = useStore((s) => s.team.weaponMarks);
  const fires = useStore((s) => s.team.fires);
  const hitMarks = useStore((s) => s.team.hitMarks);
  const hitMarkSeconds = useStore((s) => s.team.hitMarkSeconds);
  const hitMarkFloat = useStore((s) => s.team.hitMarkFloat);
  const aimLines = useStore((s) => s.team.aimLines);
  const teams = useStore((s) => s.dataset?.teamLabels ?? null);
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
          <ModelSource />
          <div className="field">
            <div className="label">
              <span>{t('far.label')}</span>
            </div>
            <Segmented<FarMode>
              value={farMode}
              options={(['figure', 'arrow', 'symbol'] as const).map((m) => ({ value: m, label: t(`far.${m}`), title: t(`far.${m}Title`) }))}
              onChange={(v) => patchTeam({ farMode: v })}
            />
          </div>
          {farMode === 'symbol' && (
            <>
              <Select<SymbolStyle>
                label={t('far.style')}
                value={symbolStyle}
                options={(['nato', 'russian', 'map', 'mono'] as const).map((s) => ({ value: s, label: t(`far.style.${s}`) }))}
                onChange={(v) => v && patchTeam({ symbolStyle: v })}
              />
              <Slider
                label={t('far.symbolPx')}
                value={symbolPx}
                min={12}
                max={64}
                step={1}
                onChange={(v) => patchTeam({ symbolPx: v })}
                format={(v) => t('heat.teamPanel.pixels', { value: num(v, 0) })}
                hint={t('far.symbolHint')}
              />
              {teams && teams.length > 0 && (
                <Select<string>
                  label={t('far.mySide')}
                  value={String(mySide)}
                  options={[{ value: '-1', label: t('far.mySideAuto') }, ...teams.map((l, i) => ({ value: String(i), label: l || `#${i + 1}` }))]}
                  onChange={(v) => patchTeam({ mySide: v === null ? -1 : Number(v) })}
                />
              )}
              <Segmented<'hostile' | 'neutral'>
                value={others}
                options={[
                  { value: 'hostile', label: t('far.othersHostile'), title: t('far.othersTitle') },
                  { value: 'neutral', label: t('far.othersNeutral'), title: t('far.othersTitle') },
                ]}
                onChange={(v) => patchTeam({ symbolOthers: v })}
              />
              <Check label={t('far.ticks')} checked={ticks} onChange={(v) => patchTeam({ symbolTicks: v })} />
            </>
          )}
          <Check label={t('far.weaponMarks')} checked={weaponMarks} onChange={(v) => patchTeam({ weaponMarks: v })} title={t('far.weaponMarksTitle')} />
          <Check label={t('far.fires')} checked={fires} onChange={(v) => patchTeam({ fires: v })} title={t('far.firesTitle')} />
          <Check label={t('far.hitMarks')} checked={hitMarks} onChange={(v) => patchTeam({ hitMarks: v })} title={t('far.hitMarksTitle')} />
          {hitMarks && (
            <>
              <Slider
                label={t('far.hitMarkSeconds')}
                value={hitMarkSeconds > 0 ? hitMarkSeconds : 300}
                min={1}
                max={300}
                logarithmic
                onChange={(v) => patchTeam({ hitMarkSeconds: v >= 299 ? 0 : Math.round(v) })}
                format={(v) => (v >= 299 ? t('far.hitMarkWhole') : `${num(v, 0)} s`)}
              />
              <Check label={t('far.hitMarkFloat')} checked={hitMarkFloat} onChange={(v) => patchTeam({ hitMarkFloat: v })} title={t('far.hitMarkFloatTitle')} />
              <div className="hit-mark-legend looks">
                {(['Hole', 'Splash', 'Gouge', 'Bullet', 'Scorch'] as const).map((l) => (
                  <span key={l}>
                    <span className="hit-look-chip">
                      <i className={`hit-look ${l.toLowerCase()}`} />
                    </span>
                    {t(`far.hitLook${l}`)}
                  </span>
                ))}
              </div>
              <div className="hit-mark-legend">
                <span className="hit-mark-legend-head">{t('far.hitLookRing')}</span>
                {OUTCOMES.map((o) => (
                  <span key={o} title={t(`vehicle.outcome.${o}Title`)}>
                    <i className={o === 'kill' ? 'hit-mark-swatch ring' : 'hit-mark-swatch'} style={{ background: swatch(OUTCOME_COLOURS[o]) }} />
                    {t(`vehicle.outcome.${o}`)}
                  </span>
                ))}
              </div>
            </>
          )}
          <Check label={t('far.aimLines')} checked={aimLines} onChange={(v) => patchTeam({ aimLines: v })} title={t('far.aimLinesTitle')} />
          {aimLines && <div className="hint">{t('far.aimLinesLegend')}</div>}
        </>
      )}
    </>
  );
}
