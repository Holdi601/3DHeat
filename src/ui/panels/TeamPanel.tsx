import { useMemo, useState } from 'react';
import {
  isUnassignedLabel,
  rgbToCss,
  teamBaseColor,
  teamHeatColor,
  teamNeutralColor,
} from '../../render/colors';
import { heatModeFor } from '../../data/lines';
import { useStore } from '../../state/store';
import { TeamPalettePicker } from './HeatPanel';
import { Check, Rich, Section, Slider } from '../controls';
import { int, num, t } from '../../i18n';
import { lengthText, useUnits } from '../../state/unitsStore';
import { useReplayStore } from '../../state/replayStore';
import { FigureControls } from './FigureControls';
import { SortControl } from '../sort/SortControl';
import { useSort, useSorted } from '../sort/useSort';
import { lineUpSides, saveTeamSides, sideCheckOf, teamSidesSaved, withTeamSides } from '../../data/teamSides';

export function TeamPanel() {
  useUnits();
  const lookFov = useReplayStore((s) => s.aids.lookFov);
  const team = useStore((s) => s.team);
  const patchTeam = useStore((s) => s.patchTeam);
  const hasSessions = useStore((s) => Boolean(s.dataset?.sessionId));
  // Boundaries are kept however many sessions there are; only the *list* has a
  // size limit. So the hint must not send someone to a picker that a load of
  // 2.6 million matches never rendered.
  const canPickSession = useStore((s) => (s.dataset?.sessionLabels.length ?? 0) > 0);
  // Counted off the array's identity, not inside the selector: a selector runs
  // on every store change, and this one would walk every person each time.
  const shared = useStore((s) => s.dataset?.personShared ?? null);
  const sharedNames = useMemo(() => {
    if (!shared) return 0;
    let n = 0;
    for (let i = 0; i < shared.length; i++) if (shared[i]) n++;
    return n;
  }, [shared]);

  return (
    <Section title={t('heat.teamPanel.title')} defaultOpen>
      <Slider
        label={t('heat.teamPanel.cubeSize')}
        value={team.cubeSize}
        min={0.05}
        max={200}
        ceiling={5000}
        logarithmic
        onChange={(cubeSize) => patchTeam({ cubeSize })}
        format={(v) => lengthText(v, (s) => (s < 10 ? 2 : 1))}
      />
      <FigureControls />
      <Check
        label={t('heat.teamPanel.weapons')}
        checked={team.weapons}
        onChange={(weapons) => patchTeam({ weapons })}
        title={t('heat.teamPanel.weaponsTitle')}
      />
      <Check
        label={t('heat.teamPanel.interpolate')}
        checked={team.interpolate}
        onChange={(interpolate) => patchTeam({ interpolate })}
        title={t('heat.teamPanel.interpolateTitle')}
      />
      {hasSessions && (
        <div className="hint">
          <Rich
            text={(canPickSession
              ? [t('heat.teamPanel.sessions'), t('heat.teamPanel.sessionsPick')]
              : [t('heat.teamPanel.sessions'), t('heat.teamPanel.sessionsHeld'), t('heat.teamPanel.sessionsTooMany')]
            ).join(' ')}
          />
        </div>
      )}
      {sharedNames > 0 && (
        <div className="hint">{t('heat.teamPanel.sharedNames', { count: sharedNames })}</div>
      )}
      <Check
        label={t('heat.teamPanel.showLook')}
        checked={team.showLookDirection}
        onChange={(showLookDirection) => patchTeam({ showLookDirection })}
      />
      {team.showLookDirection && (
        <Slider
          label={t('heat.teamPanel.lookLength')}
          value={team.lookLength}
          min={0.5}
          max={500}
          ceiling={20_000}
          logarithmic
          onChange={(lookLength) => patchTeam({ lookLength })}
          format={(v) => lengthText(v, () => 1)}
        />
      )}
      {team.showLookDirection && (
        <Slider
          label={t('units.look.fov')}
          value={lookFov}
          min={0}
          max={150}
          step={1}
          onChange={(v) => useReplayStore.getState().setAids({ lookFov: v })}
          format={(v) => (v === 0 ? t('units.look.fovLine') : t('replay.unit.deg', { v: num(v, 0) }))}
          hint={t('units.look.fovHint')}
        />
      )}
      <Slider
        label={t('heat.teamPanel.trail')}
        value={team.trailSeconds}
        min={0}
        max={300}
        // A whole match, so a trail can cover a session end to end rather than
        // the last five minutes of one.
        ceiling={86_400}
        step={0.5}
        onChange={(trailSeconds) => patchTeam({ trailSeconds })}
        format={(v) => (v === 0 ? t('heat.teamPanel.off') : t('heat.teamPanel.seconds', { value: num(v, 1) }))}
      />
      <Check
        label={t('heat.teamPanel.raw')}
        checked={team.showRawSamples}
        onChange={(showRawSamples) => patchTeam({ showRawSamples })}
        title={t('heat.teamPanel.rawTitle')}
      />
    </Section>
  );
}

/** Team visibility and, in difference mode, which side each team counts toward. */
export function TeamsList() {
  const dataset = useStore((s) => s.dataset);
  const mode = useStore((s) => heatModeFor(s.mode, s.lines));
  const visibility = useStore((s) => s.teamVisibility);
  const toggleTeam = useStore((s) => s.toggleTeam);
  const positive = useStore((s) => s.positiveTeams);
  const negative = useStore((s) => s.negativeTeams);
  const setTeamSplit = useStore((s) => s.setTeamSplit);
  const split = useStore((s) => s.split);
  // Read so the list is drawn again in another palette.
  useStore((s) => s.heat.teamPaletteActive);
  const labels = dataset?.teamLabels;
  const indices = useMemo(() => (labels ?? []).map((_, i) => i), [labels]);
  const sort = useSort<number>(
    'teams',
    [
      { id: 'name', label: t('ui.sort.name'), key: (i) => String(labels?.[i] ?? '') },
      { id: 'size', label: t('ui.sort.size'), key: (i) => dataset?.teamSizes?.[i], kind: 'number' },
      { id: 'order', label: t('ui.sort.order'), key: null },
    ],
    'name',
  );
  const order = useSorted(indices, sort);
  const [sides, setSides] = useState(teamSidesSaved);

  if (!dataset || dataset.teamLabels.length === 0) return null;
  const sideCheck = sideCheckOf(dataset);
  /** Each match's teams numbered by their side of the map (`data/teamSides.ts`), or the data's own back. */
  const lineUp = (on: boolean) => {
    setSides(on);
    saveTeamSides(on);
    const d = useStore.getState().dataset;
    if (!d) return;
    const next = on ? lineUpSides(d) : (withTeamSides(d, false)?.dataset ?? d);
    if (next !== d) useStore.setState({ dataset: next });
  };
  // Under a column split the groups decide only what is drawn, so their +/−
  // buttons would offer a choice that does nothing - and look like the group
  // split were still the one in force.
  const columnSplit = mode === 'heat-difference' && split.kind !== 'teams' ? split.column : null;
  const difference = mode === 'heat-difference' && columnSplit === null;
  const teams = mode === 'heat-teams';

  /**
   * Which colour the swatches show: the team palette's (render/colors.ts
   * TEAM_PALETTES) everywhere, and in teams mode exactly what the heat draws -
   * the palette while the groups fit in it, the hue circle past that - or it
   * is a legend that disagrees with the picture beside it.
   */
  const swatchFor = (i: number) => {
    if (!teams) return teamBaseColor(i);
    // A group that abstains from the hue is shown abstaining, not given one.
    if (isUnassignedLabel(String(dataset.teamLabels[i]))) return teamNeutralColor();
    return teamHeatColor(i, dataset.teamLabels.length);
  };

  const assign = (i: number, side: 'plus' | 'minus' | 'none') => {
    const p = new Set(positive);
    const n = new Set(negative);
    p.delete(i);
    n.delete(i);
    if (side === 'plus') p.add(i);
    if (side === 'minus') n.add(i);
    setTeamSplit([...p].sort((a, b) => a - b), [...n].sort((a, b) => a - b));
  };

  return (
    <Section
      title={t('heat.teamsList.title')}
      defaultOpen
      right={<span style={{ color: 'var(--text-faint)' }}>{dataset.teamLabels.length}</span>}
    >
      {difference && (
        <div className="hint">
          <Rich text={t('heat.teamsList.differenceHint')} />
        </div>
      )}
      {columnSplit !== null && (
        <div className="hint">
          <Rich text={t('heat.teamsList.columnSplitHint', { column: columnSplit })} />
        </div>
      )}
      {teams && (
        <div className="hint">{t('heat.teamsList.teamsHint')}</div>
      )}
      <div className="row">
        <button
          onClick={() => {
            const all: Record<number, boolean> = {};
            dataset.teamLabels.forEach((_, i) => (all[i] = true));
            Object.keys(all).forEach((k) => toggleTeam(Number(k), true));
          }}
        >
          {t('heat.teamsList.showAll')}
        </button>
        {difference && (
          <button
            onClick={() => {
              const half = Math.ceil(dataset.teamLabels.length / 2);
              const all = dataset.teamLabels.map((_, i) => i);
              setTeamSplit(all.slice(0, half), all.slice(half));
            }}
          >
            {t('heat.teamsList.splitEvenly')}
          </button>
        )}
      </div>
      {dataset.teamLabels.length >= 2 && dataset.personId && (
        <Check label={t('heat.teamsList.sides')} checked={sides} onChange={lineUp} title={t('heat.teamsList.sidesTitle')} />
      )}
      {sides && sideCheck && (
        <div className="hint">{t('heat.teamsList.sidesDone', { swapped: int(sideCheck.swapped), sessions: int(sideCheck.sessions) })}</div>
      )}
      {indices.length > 1 && <SortControl sort={sort} />}
      <div className="team-list">
        {order.map((i) => {
          const name = String(dataset.teamLabels[i]);
          const shown = visibility[i] !== false;
          const side = positive.includes(i) ? 'plus' : negative.includes(i) ? 'minus' : 'none';
          return (
            <div className="team-row" key={i}>
              <input
                type="checkbox"
                checked={shown}
                title={t('heat.teamsList.visible')}
                onChange={(e) => toggleTeam(i, e.target.checked)}
              />
              <span className="swatch" style={{ background: rgbToCss(swatchFor(i)) }} />
              <span className="name" title={name}>
                {name}
              </span>
              {difference ? (
                <div className="pm">
                  <button
                    className={`plus${side === 'plus' ? ' on' : ''}`}
                    onClick={() => assign(i, side === 'plus' ? 'none' : 'plus')}
                    title={t('heat.teamsList.positive')}
                  >
                    +
                  </button>
                  <button
                    className={`minus${side === 'minus' ? ' on' : ''}`}
                    onClick={() => assign(i, side === 'minus' ? 'none' : 'minus')}
                    title={t('heat.teamsList.negative')}
                  >
                    −
                  </button>
                </div>
              ) : (
                <span className="sign">
                  {dataset.teamSizes ? t('heat.teamsList.size', { count: int(dataset.teamSizes[i]) }) : ''}
                </span>
              )}
            </div>
          );
        })}
      </div>
      {/* In teams mode the heat panel offers it beside the legend. */}
      {!teams && <TeamPalettePicker />}
    </Section>
  );
}
