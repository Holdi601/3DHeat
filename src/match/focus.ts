/**
 * From the match analysis to the heatmap: show one match, one round, one
 * player, one kind of event - as the heatmap's own filters, so what is shown
 * stays visible and editable in the Filters panel, and a round replays in the
 * box view as its own session.
 *
 * It works on the heatmap table of the same matches (`<match>.parquet`), which
 * names its columns `match`, `round`, `event`, `player` and `side` and its
 * sessions `<match> #NN`; a dataset without them is told so, not filtered to
 * nothing.
 */

import { list, t } from '../i18n';
import { useStore } from '../state/store';
import type { Dataset, FilterSpec } from '../state/types';
import type { Side } from './matchDoc';

export interface Focus {
  match?: string;
  round?: number;
  player?: string;
  side?: Side;
  /** Event kinds: position, kill, death, hurt, shot, throw, smoke, flash, he, molotov, decoy, blind, plant, defuse, explode. */
  events?: string[];
}

export interface FocusResult {
  filters: FilterSpec[];
  /** What could not be applied, and why, in words. */
  missing: string[];
  /** The round's session, for the box replay; -1 when there is none. */
  session: number;
}

/** The session label the demo export gives a round. */
export function roundSession(match: string, round: number): string {
  return `${match} #${String(round).padStart(2, '0')}`;
}

/** The filters that show `focus` in `dataset`. */
export function focusFilters(dataset: Dataset, focus: Focus): FocusResult {
  const filters: FilterSpec[] = [];
  const missing: string[] = [];
  const attr = (name: string) => dataset.attrs.find((a) => a.name === name);
  // `noColumn` and `notIn` are the messages for a column the data lacks and for values it lacks.
  const categories = (column: string, values: string[], noColumn: string, notIn: string) => {
    const a = attr(column);
    if (!a?.categories) {
      missing.push(t(noColumn, { column }));
      return;
    }
    const allowed = values.map((v) => a.categories!.indexOf(v)).filter((i) => i >= 0);
    if (!allowed.length) missing.push(t(notIn, { values: list(values) }));
    else filters.push({ kind: 'categories', column, allowed });
  };
  if (focus.match) categories('match', [focus.match], 'match.focus.matchNoColumn', 'match.focus.matchMissing');
  if (focus.round !== undefined) {
    const a = attr('round');
    if (a && a.kind !== 'category') filters.push({ kind: 'range', column: 'round', min: focus.round, max: focus.round });
    else if (a?.categories) {
      categories('round', [String(focus.round)], 'match.focus.roundNoColumn', 'match.focus.roundMissing');
    } else missing.push(t('match.focus.roundNoColumn', { column: 'round' }));
  }
  if (focus.events?.length) categories('event', focus.events, 'match.focus.eventsNoColumn', 'match.focus.eventsMissing');
  if (focus.player) {
    const i = dataset.personLabels.indexOf(focus.player);
    if (i >= 0) filters.push({ kind: 'persons', allowed: [i] });
    else missing.push(t('match.focus.playerMissing', { player: focus.player }));
  }
  if (focus.side) {
    const i = dataset.teamLabels.indexOf(focus.side);
    if (i >= 0) filters.push({ kind: 'teams', allowed: [i] });
    else missing.push(t('match.focus.sideMissing', { side: focus.side }));
  }
  const session =
    focus.match && focus.round !== undefined ? dataset.sessionLabels.indexOf(roundSession(focus.match, focus.round)) : -1;
  return { filters, missing, session };
}

/**
 * Show `focus` in the heatmap: its filters, and with `replay` the round played
 * back as boxes from its start. Returns what could not be applied.
 */
export function applyFocus(focus: Focus, replay = false): string[] {
  const store = useStore.getState();
  const dataset = store.dataset;
  if (!dataset) return [t('match.focus.noData', { parquet: '.parquet' })];
  const { filters, missing, session } = focusFilters(dataset, focus);
  store.setFilters(filters);
  if (session >= 0) {
    store.patchTeam({ session });
    if (replay) {
      store.setMode('team');
      store.patchTimeline({ mode: 'play', window: 'lifetime' });
      if (dataset.sessionStart) store.seek(dataset.sessionStart[session]);
      store.setPlaying(true);
    }
  } else if (replay) {
    missing.push(t('match.focus.noSession'));
  }
  return missing;
}

/** Back to everything. */
export function clearFocus(): void {
  useStore.getState().setFilters([]);
}
