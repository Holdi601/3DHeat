import { useEffect, useState } from 'react';
import { t } from '../../i18n';
import { useStore } from '../../state/store';
import { useCatalogSelection } from '../../state/catalogSelection';
import { figurePackReady } from '../../figures/catalog';
import { packGames } from '../../figures/figurepack';
import { FIGURES_ONLY, OTHER_DATA, useModelChoice } from '../../figures/modelChoice';
import { folderGameName } from '../../data/mapNames';

/**
 * The unit models the loaded data is drawn with, chosen for its game: the game's own model pack (the default), the
 * built-in figures, or another game's pack for the vehicles it has (War Thunder's models on a DCS recording). Without
 * data, the choice is for the game picked above (`game`). Shown when the local server has any model pack.
 */
export function UnitModels({ game: fallback = '' }: { game?: string }) {
  const [games, setGames] = useState<readonly string[]>(packGames());
  useEffect(() => {
    let live = true;
    void figurePackReady.then(() => live && setGames([...packGames()]));
    return () => {
      live = false;
    };
  }, []);
  const selection = useCatalogSelection();
  const hasData = useStore((s) => !!s.dataset);
  const choices = useModelChoice((s) => s.choices);
  const setChoice = useModelChoice((s) => s.set);
  if (!games.length) return null;
  const game = hasData ? selection.dataGame : fallback || null;
  const key = game || OTHER_DATA;
  const value = choices[key] ?? '';
  const name = game ? folderGameName(game) : '';
  const own = game && games.includes(game);
  const options = [
    { value: '', label: own ? t('catalog.models.own', { game: name }) : t('catalog.models.ownAny') },
    { value: FIGURES_ONLY, label: t('catalog.models.figures') },
    ...games.filter((g) => g !== game).map((g) => ({ value: g, label: t('catalog.models.other', { game: folderGameName(g) }) })),
  ];
  return (
    <div className="field" data-unit-models>
      <div className="label">
        <span>{t('catalog.models.label')}</span>
      </div>
      <select
        data-unit-models-select
        value={value}
        onChange={(e) => {
          setChoice(key, e.target.value);
          // The view draws again with the figures worked out anew.
          useStore.getState().patchTeam({});
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <div className="hint">
        {value === FIGURES_ONLY
          ? t('catalog.models.figuresHint')
          : value
            ? t('catalog.models.otherHint', { game: folderGameName(value) })
            : game
              ? t('catalog.models.ownHint', { game: name })
              : t('catalog.models.ownAnyHint')}
      </div>
    </div>
  );
}
