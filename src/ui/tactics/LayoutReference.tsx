import { useRef } from 'react';
import { t } from '../../i18n';
import { useStore } from '../../state/store';
import { usePlanStore } from '../../state/planStore';
import { useObjectivesStore } from '../../state/objectivesStore';
import { shownLayout, useLevelLayouts } from '../../state/levelLayoutsStore';
import { levelIdOfLevel } from '../../render/levelLayoutSource';
import { OBJECTIVE_LAYERS, type Objective, type Vec3 } from '../../match/objectives';
import { Check, Section } from '../controls';
import { LevelLayoutPicker } from '../match/LevelLayoutPicker';
import { groundAt } from '../../tactics/timing';

/** Spawn groups listed before "and N more". */
const SHOWN = 40;

/** Above the ground by more than this (m), a spawn is in the air (an aircraft's) and a figure is placed there. */
const AIRBORNE = 50;

/**
 * Places a figure of the board's chosen kind and side at a point, as the Place
 * tool's click would: on the level's surface, unless the spawn is in the air.
 */
function placeAt(p: Vec3): void {
  const g = groundAt(p[0], p[1] + 5000, p[2], 20000);
  const y = g !== null && p[1] - g < AIRBORNE ? g : p[1];
  const st = usePlanStore.getState();
  const was = st.tool;
  if (was !== 'place') st.setTool('place');
  usePlanStore.getState().click({ x: p[0], y, z: p[2] }, null);
  if (was !== 'place') usePlanStore.getState().setTool(was);
}

/**
 * The level's game-mode layout on the tactics board, as the plan's reference:
 * which mode, what of it is drawn (capture zones, play areas, out of bounds,
 * spawns, bases), and its spawns, each group with a button that places the
 * chosen figure at its next spawn point, or one at every point.
 */
export function LayoutReference() {
  const level = useStore((s) => s.level);
  useLevelLayouts((s) => s.rev);
  const on = useObjectivesStore((s) => s.on);
  const layers = useObjectivesStore((s) => s.layers);
  const labels = useObjectivesStore((s) => s.labels);
  const next = useRef(new Map<string, number>());
  const id = levelIdOfLevel(level);
  const shown = id ? shownLayout(id.game, id.level) : null;
  if (!shown) return null;
  const store = useObjectivesStore.getState();
  const spawns = shown.objectives.filter((o) => o.layer === 'spawns' && o.points.length);
  const key = (o: Objective) => `${shown.id}|${o.team}|${o.name}|${Math.round(o.position[0])}|${Math.round(o.position[2])}`;
  const placeNext = (o: Objective) => {
    const k = key(o);
    const i = next.current.get(k) ?? 0;
    placeAt(o.points[i % o.points.length]);
    next.current.set(k, i + 1);
  };
  return (
    <Section title={t('objectives.title')} defaultOpen>
      <Check label={t('objectives.show')} checked={on} onChange={(v) => store.setOn(v)} title={t('objectives.showTitle')} />
      <LevelLayoutPicker />
      {on && (
        <div className="chips">
          {OBJECTIVE_LAYERS.map((l) => (
            <button key={l} className={`chip${layers[l] ? ' on' : ''}`} onClick={() => store.setLayer(l, !layers[l])} title={t(`objectives.layer.${l}Title`)}>
              {t(`objectives.layer.${l}`)}
            </button>
          ))}
          <button className={`chip${labels ? ' on' : ''}`} onClick={() => store.setLabels(!labels)} title={t('objectives.labelsTitle')}>
            {t('objectives.labels')}
          </button>
        </div>
      )}
      {spawns.length > 0 && (
        <div className="layout-spawns">
          <div className="hint">{t('objectives.placeHint')}</div>
          {spawns.slice(0, SHOWN).map((o) => (
            <div className="row" key={key(o)}>
              <span title={o.name}>
                {o.team ? `${o.team} · ` : ''}
                {o.name || t('objectives.label.spawn')} ({o.points.length})
              </span>
              <button onClick={() => placeNext(o)} title={t('objectives.placeTitle')}>
                {t('objectives.place')}
              </button>
              {o.points.length > 1 && (
                <button onClick={() => o.points.forEach((p) => placeAt(p))} title={t('objectives.placeAllTitle')}>
                  {t('objectives.placeAll')}
                </button>
              )}
            </div>
          ))}
          {spawns.length > SHOWN && <div className="hint">{t('objectives.placeMore', { count: spawns.length - SHOWN })}</div>}
        </div>
      )}
    </Section>
  );
}
