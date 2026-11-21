/**
 * A note badge beside a thing in a list - a unit, a match, a round, an event,
 * a finding, a saved view - when notes are anchored to it: how many, their
 * titles in the tooltip, and a click goes to the first. The lists look notes
 * up by the anchor's key (`notes/anchors.ts` anchorKey) in one index made per
 * change of the notes, never per row.
 */

import type { MouseEvent } from 'react';
import { create } from 'zustand';
import { int, t } from '../../i18n';
import { anchorKey } from '../../notes/anchors';
import type { DataNote } from '../../notes/model';
import { useNotes } from '../../notes/store';
import { useEngine } from '../EngineContext';
import { goToNote } from './links';

const EMPTY = new Map<string, DataNote[]>();

/** The notes by anchor key, made again on each change of the notes. */
const useIndex = create<{ rev: number; index: Map<string, DataNote[]> }>(() => ({ rev: -1, index: EMPTY }));

function rebuild(notes: readonly DataNote[], rev: number): void {
  const index = new Map<string, DataNote[]>();
  for (const n of notes) {
    const k = anchorKey(n.anchor);
    if (!k) continue;
    const list = index.get(k);
    if (list) list.push(n);
    else index.set(k, [n]);
  }
  useIndex.setState({ rev, index });
}

useNotes.subscribe((s, prev) => {
  if (s.rev !== prev.rev) rebuild(s.book.notes, s.rev);
});

/** The notes anchored to the thing of this key. */
export function useNotesOn(key: string | null): DataNote[] | undefined {
  return useIndex((s) => (key ? s.index.get(key) : undefined));
}

/** `still`: a mark only, inside a row that is itself a button (no button in a button). */
export function NoteBadge({ anchor, still }: { anchor: string | null; still?: boolean }) {
  const engine = useEngine();
  const list = useNotesOn(anchor);
  if (!list?.length) return null;
  const titles = list.map((n) => n.title || t('notes.untitled')).join('\n');
  if (still)
    return (
      <span className="note-badge" style={{ borderColor: list[0].color }} title={t('notes.badgeTitle', { n: list.length, titles })}>
        ✎{list.length > 1 ? int(list.length) : ''}
      </span>
    );
  const go = (e: MouseEvent) => {
    e.stopPropagation();
    if (engine) goToNote(engine, list[0].id);
  };
  return (
    <button type="button" className="note-badge" style={{ borderColor: list[0].color }} onClick={go} title={t('notes.badgeTitle', { n: list.length, titles })} aria-label={t('notes.badgeTitle', { n: list.length, titles })}>
      ✎{list.length > 1 ? int(list.length) : ''}
    </button>
  );
}
