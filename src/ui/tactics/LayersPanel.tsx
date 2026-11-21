import { useState } from 'react';
import { Section } from '../controls';
import { usePlanStore } from '../../state/planStore';
import { BASE_LAYER, layerOf, routeConflicts, type Plan } from '../../tactics/plan';
import { t } from '../../i18n';

/** How many things are on a layer. */
function countOn(plan: Plan, id: string): number {
  const on = (e: { layer?: string }) => layerOf(e) === id;
  return plan.figures.filter(on).length + plan.arrows.filter(on).length + plan.areas.filter(on).length + plan.notes.filter(on).length + plan.drawings.filter(on).length;
}

/**
 * The board's layers, the top one first: which is drawn on, which are shown
 * and which locked, their names and order; a copy of one as an alternative
 * plan for the same figures; and showing only the active layer's routes
 * while the others still play.
 */
export function LayersPanel() {
  const plan = usePlanStore((s) => s.plan);
  const active = usePlanStore((s) => s.activeLayer);
  const step = usePlanStore((s) => s.step);
  const only = usePlanStore((s) => s.routesActiveOnly);
  const selected = usePlanStore((s) => s.selection.length);
  const store = usePlanStore.getState;
  const [editing, setEditing] = useState<string | null>(null);
  const layers = [...plan.layers].reverse();
  const current = plan.layers.find((l) => l.id === active);
  const conflicts = routeConflicts(plan, step).length;
  return (
    <Section title={t('tactics.layers.title')} defaultOpen>
      <div className="tactics-layers" role="list">
        {layers.map((l) => (
          <div key={l.id} role="listitem" className={`tactics-layer${l.id === active ? ' on' : ''}${l.visible ? '' : ' hidden'}`}>
            <input type="radio" name="tactics-layer" checked={l.id === active} onChange={() => store().setActiveLayer(l.id)} aria-label={t('tactics.layers.active', { name: l.name })} title={t('tactics.layers.activeHint')} />
            {editing === l.id ? (
              <input
                type="text"
                autoFocus
                defaultValue={l.name}
                onBlur={(e) => {
                  store().renameLayer(l.id, e.target.value);
                  setEditing(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                  if (e.key === 'Escape') setEditing(null);
                }}
              />
            ) : (
              <span className="name" onClick={() => store().setActiveLayer(l.id)} onDoubleClick={() => setEditing(l.id)} title={t('tactics.layers.renameHint')}>
                {l.name} <small>({countOn(plan, l.id)})</small>
              </span>
            )}
            <label title={t('tactics.layers.shown')}>
              <input type="checkbox" checked={l.visible} onChange={(e) => store().setLayerVisible(l.id, e.target.checked)} /> {t('tactics.layers.shownShort')}
            </label>
            <label title={t('tactics.layers.locked')}>
              <input type="checkbox" checked={l.locked} onChange={(e) => store().setLayerLocked(l.id, e.target.checked)} /> {t('tactics.layers.lockedShort')}
            </label>
          </div>
        ))}
      </div>
      <div className="tactics-tools">
        <button onClick={() => store().addLayer(t('tactics.layers.newName', { n: plan.layers.length + 1 }))}>{t('tactics.layers.add')}</button>
        <button onClick={() => store().duplicateLayer(active)} title={t('tactics.layers.duplicateHint')}>
          {t('tactics.layers.duplicate')}
        </button>
        <button onClick={() => setEditing(active)}>{t('tactics.layers.rename')}</button>
        <button disabled={active === BASE_LAYER} onClick={() => store().moveLayer(active, 1)} title={t('tactics.layers.upHint')}>
          ↑
        </button>
        <button disabled={active === BASE_LAYER} onClick={() => store().moveLayer(active, -1)} title={t('tactics.layers.downHint')}>
          ↓
        </button>
        <button
          disabled={active === BASE_LAYER}
          onClick={() => current && window.confirm(t('tactics.layers.removeConfirm', { name: current.name, n: countOn(plan, active) })) && store().removeLayer(active)}
        >
          {t('tactics.layers.remove')}
        </button>
      </div>
      {selected > 0 && current && (
        <div className="tactics-tools">
          <button onClick={() => store().moveSelectionToLayer(active)}>{t('tactics.layers.moveHere', { name: current.name })}</button>
        </div>
      )}
      <label className="field" style={{ flexDirection: 'row', alignItems: 'center' }}>
        <input type="checkbox" checked={only} onChange={(e) => store().setRoutesActiveOnly(e.target.checked)} />
        <span>{t('tactics.layers.only')}</span>
      </label>
      {current?.locked && <div className="hint">{t('tactics.layers.lockedActive')}</div>}
      {conflicts > 0 && <div className="hint">{t('tactics.layers.conflicts', { n: conflicts })}</div>}
      <div className="hint">{t('tactics.layers.hint')}</div>
    </Section>
  );
}
