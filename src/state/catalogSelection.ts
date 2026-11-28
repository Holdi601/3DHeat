/**
 * What of the levels folder is in use: the level on screen (when it came from
 * the folder) and the unit model packs the loaded data is drawn with. One
 * place to ask, for the level panel and for sharing in a session (the host
 * offers the members what is in use here):
 *
 *     currentCatalogSelection()   now
 *     useCatalogSelection()       in a component, kept current
 *     subscribeCatalogSelection() outside React
 *
 * Ids are paths under the levels folder, the same as the catalogue index's
 * items (`data/catalogIndex.ts`): a level's `.glb` or tiled terrain path, a model
 * pack's `model-packs/<game>/model-pack.json`.
 */

import { create } from 'zustand';
import { useEffect, useMemo, useState } from 'react';
import { fingerprint, type CatalogItem } from '../data/catalogIndex';
import { mapTitle } from '../data/mapNames';
import { FIGURES_ONLY, useModelChoice } from '../figures/modelChoice';
import { packGames } from '../figures/figurepack';
import { figurePackReady } from '../figures/catalog';
import { dataPackGame } from '../figures/replay';
import { sameLevel } from '../session/levelRequest';
import { useStore } from './store';
import type { Dataset } from './types';

export interface SelectedLevel {
  /** Its path in the levels folder: the catalogue item's id. */
  id: string;
  game: string;
  /** The extractor's name for it (`avg_netherlands`). */
  name: string;
  /** Its name to show ("Netherlands"). */
  title: string;
  /** Its content fingerprint (`fingerprint` in catalogIndex.ts); null until the folder's files are hashed. */
  fingerprint: string | null;
  /** The level's layouts and tiled terrain beside it, by path, where it has them. */
  layouts?: string;
  terrain?: string;
}

export interface CatalogSelection {
  /** The level on screen when it is the levels folder's, else null (a map image, a model picked by hand, none). */
  level: SelectedLevel | null;
  /** The game the loaded data is of, as the model packs tell it; null without data or when no pack has its units. */
  dataGame: string | null;
  /** The unit models chosen for that game: '' its own (the default), `FIGURES_ONLY`, or the game whose pack is drawn first. */
  modelChoice: string;
  /** The games whose model packs the data is drawn with, the one drawn first first; [] for the built-in figures. */
  modelPackGames: string[];
  /** The same packs as levels-folder ids (`model-packs/<game>/model-pack.json`). */
  modelPackIds: string[];
}

/** The levels folder's level last loaded, until another level takes its place. */
const usePicked = create<{ item: CatalogItem | null }>(() => ({ item: null }));

/** The level panel loaded this item of the levels folder (`loadCatalogItem`). */
export function notePickedLevel(item: CatalogItem): void {
  usePicked.setState({ item });
}

// Another level on screen (or none): the folder's level is no longer what is shown.
useStore.subscribe((s, prev) => {
  if (s.level === prev.level) return;
  const item = usePicked.getState().item;
  if (item && !(s.level && sameLevel(s.level.name, item))) usePicked.setState({ item: null });
});

/** The id a game's model pack has in the levels folder. */
export const modelPackId = (game: string) => `model-packs/${game}/model-pack.json`;

function selectionOf(item: CatalogItem | null, dataset: Dataset | null, choices: Record<string, string>): CatalogSelection {
  const level: SelectedLevel | null = item
    ? {
        id: item.path,
        game: item.game,
        name: item.name,
        title: mapTitle(item.game, item.name, item.path),
        fingerprint: fingerprint(item),
        ...(item.layouts ? { layouts: item.layouts } : {}),
        ...(item.terrain ? { terrain: item.terrain } : {}),
      }
    : null;
  const dataGame = dataset ? dataPackGame(dataset) : null;
  const modelChoice = choices[dataGame || 'other'] ?? '';
  const have = new Set(packGames());
  const games = modelChoice === FIGURES_ONLY ? [] : [...new Set([modelChoice, dataGame].filter((g): g is string => !!g && have.has(g)))];
  return { level, dataGame, modelChoice, modelPackGames: games, modelPackIds: games.map(modelPackId) };
}

/** What of the levels folder is in use now. */
export function currentCatalogSelection(): CatalogSelection {
  return selectionOf(usePicked.getState().item, useStore.getState().dataset, useModelChoice.getState().choices);
}

/** The id of the level on screen in the levels folder, or null. */
export function currentLevelId(): string | null {
  return usePicked.getState().item?.path ?? null;
}

/** The ids of the model packs the loaded data is drawn with ([] for the built-in figures). */
export function currentModelPackIds(): string[] {
  return currentCatalogSelection().modelPackIds;
}

/** Calls `fn` with the selection whenever the level, the data or the unit models choice changes; returns the unsubscribe. */
export function subscribeCatalogSelection(fn: (s: CatalogSelection) => void): () => void {
  let last = '';
  const tell = () => {
    const s = currentCatalogSelection();
    const key = JSON.stringify(s);
    if (key === last) return;
    last = key;
    fn(s);
  };
  const offs = [usePicked.subscribe(tell), useModelChoice.subscribe(tell), useStore.subscribe((s, p) => (s.dataset !== p.dataset || s.level !== p.level ? tell() : undefined))];
  // The packs' index arriving tells which game the data is of.
  void figurePackReady.then(tell);
  return () => offs.forEach((o) => o());
}

/** The selection, kept current in a component. */
export function useCatalogSelection(): CatalogSelection {
  const item = usePicked((s) => s.item);
  const dataset = useStore((s) => s.dataset);
  const choices = useModelChoice((s) => s.choices);
  // The packs' index arriving tells which game the data is of.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let live = true;
    void figurePackReady.then(() => live && setReady(true));
    return () => {
      live = false;
    };
  }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => selectionOf(item, dataset, choices), [item, dataset, choices, ready]);
}
