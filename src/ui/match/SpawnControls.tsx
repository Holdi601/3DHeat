import { useMemo } from 'react';
import { int, t } from '../../i18n';
import { useStore } from '../../state/store';
import { shownLayout, useLevelLayouts } from '../../state/levelLayoutsStore';
import { SPAWN_MODES, useSpawnDisplay } from '../../state/spawnDisplayStore';
import { levelIdOfLevel } from '../../render/levelLayoutSource';
import { spawnShown } from '../../match/layoutSpawns';
import { Check } from '../controls';

/**
 * The level layout's spawns (`state/spawnDisplayStore.ts`): off, one ring
 * per group, or every spawn point; lines to the flag each belongs to; which
 * flag's, team's and stage's are shown. The same in the heat, the replay and
 * on the tactics board.
 */
export function SpawnControls() {
  const level = useStore((s) => s.level);
  useLevelLayouts((s) => s.rev);
  const sd = useSpawnDisplay();
  const id = levelIdOfLevel(level);
  const layout = id ? shownLayout(id.game, id.level) : null;
  const info = useMemo(() => {
    if (!layout) return null;
    const teams = [...new Set(layout.spawnPoints.map((p) => p.team).filter((x): x is number => x !== null))].sort((a, b) => a - b);
    const stages = [...new Set(layout.spawnPoints.flatMap((p) => p.stages))].sort((a, b) => a - b);
    const used = new Set(layout.spawnPoints.map((p) => p.owner));
    const owners = [...layout.spawnOwners.values()].filter((o) => used.has(o.id)).sort((a, b) => a.id.localeCompare(b.id));
    return { teams, stages, owners };
  }, [layout]);
  if (!layout || !info || !layout.spawnPoints.length) return null;
  const filter = { owner: sd.owner, team: sd.team, stage: sd.stage };
  const shown = sd.mode === 'off' ? 0 : layout.spawnPoints.reduce((n, p) => n + (spawnShown(p, filter) ? 1 : 0), 0);
  const pick = (v: string) => (v === '' ? null : v);
  const pickNum = (v: string) => (v === '' ? null : Number(v));
  return (
    <div className="field spawn-controls">
      <div className="label">
        <span>{t('spawns.title')}</span>
      </div>
      <div className="chips" title={t('spawns.modeTitle')}>
        {SPAWN_MODES.map((m) => (
          <button key={m} className={`chip${sd.mode === m ? ' on' : ''}`} onClick={() => sd.setMode(m)} title={t(`spawns.mode.${m}Title`)}>
            {t(`spawns.mode.${m}`)}
          </button>
        ))}
      </div>
      {sd.mode === 'points' && <Check label={t('spawns.lines')} checked={sd.lines} onChange={(v) => sd.setLines(v)} title={t('spawns.linesTitle')} />}
      {sd.mode !== 'off' && (
        <>
          {info.owners.length > 0 && (
            <div className="row" title={t('spawns.flagTitle')}>
              <span>{t('spawns.flag')}</span>
              <select value={sd.owner ?? ''} onChange={(e) => sd.setFilter({ owner: pick(e.target.value) })}>
                <option value="">{t('spawns.any')}</option>
                {info.owners.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.type === 'base' ? `${o.name || 'HQ'}${o.team ? ` ${o.team}` : ''}${o.stage !== null ? ` · ${o.stage}` : ''}` : o.letter || o.name || o.id}
                  </option>
                ))}
              </select>
            </div>
          )}
          {info.teams.length > 1 && (
            <div className="row">
              <span>{t('spawns.team')}</span>
              <select value={sd.team ?? ''} onChange={(e) => sd.setFilter({ team: pickNum(e.target.value) })}>
                <option value="">{t('spawns.any')}</option>
                {info.teams.map((n) => (
                  <option key={n} value={n}>
                    {t('replay.team', { n })}
                  </option>
                ))}
              </select>
            </div>
          )}
          {info.stages.length > 1 && (
            <div className="row">
              <span>{t('spawns.stage')}</span>
              <select value={sd.stage ?? ''} onChange={(e) => sd.setFilter({ stage: pickNum(e.target.value) })}>
                <option value="">{t('spawns.any')}</option>
                {info.stages.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="hint">{t('spawns.count', { shown: int(shown), total: int(layout.spawnPoints.length) })}</div>
          {sd.mode === 'points' && <div className="hint">{t('spawns.legend')}</div>}
        </>
      )}
    </div>
  );
}
