import { t } from '../../i18n';
import { useStore } from '../../state/store';
import { layoutsDoc, shownLayout, useLevelLayouts } from '../../state/levelLayoutsStore';
import { levelIdOfLevel } from '../../render/levelLayoutSource';

/** The loaded level's layouts: which game mode's objectives, areas and spawns are drawn. */
export function useLevelLayoutShown(): boolean {
  const level = useStore((s) => s.level);
  useLevelLayouts((s) => s.rev);
  const id = levelIdOfLevel(level);
  return !!id && !!shownLayout(id.game, id.level);
}

export function LevelLayoutPicker() {
  const level = useStore((s) => s.level);
  useLevelLayouts((s) => s.rev);
  const choose = useLevelLayouts((s) => s.choose);
  const id = levelIdOfLevel(level);
  if (!id) return null;
  const found = layoutsDoc(id.game, id.level);
  const shown = shownLayout(id.game, id.level);
  if (!found || !shown) return null;
  const { key, doc } = found;
  return (
    <div className="row" title={t('objectives.layoutTitle')}>
      <span>{t('objectives.layout')}</span>
      <select value={shown.id} onChange={(e) => choose(key, e.target.value)}>
        {doc.layouts.map((l) => (
          <option key={l.id} value={l.id}>
            {l.stage === null ? l.name : `${l.name} ${l.stage}`}
          </option>
        ))}
      </select>
    </div>
  );
}
