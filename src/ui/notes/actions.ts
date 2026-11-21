/**
 * The notes' actions as the panel, the palette, the keys and the other
 * panels' buttons call them: a note on what is in sight or on a given thing,
 * a new analysis, a block into the open analysis, the notes panel shown.
 * Nothing here runs on the frame path.
 */

import { t } from '../../i18n';
import type { Engine } from '../../render/engine';
import { useRaceStore } from '../../state/raceStore';
import { anchorChoices, anchorHere, thumbnail, viewNow } from '../../notes/capture';
import type { Anchor } from '../../notes/anchors';
import { NOTE_COLORS, newId, type DataNote, type DocBlock, type NewBlock } from '../../notes/model';
import { useNotes } from '../../notes/store';
import { isSharedChartBlock } from '../../notes/sharedChart';
import { reveal } from '../shell/commands';
import { toast } from '../shell/kit';
import type { Workspace } from '../shell/keys';

/** Opens the editor on a new note about `anchor`, with the view as it is. */
export function noteAbout(engine: Engine | null, anchor: Anchor, title = '', choices: Anchor[] | null = null): void {
  const tab = useRaceStore.getState().tab;
  const draft: DataNote = {
    id: newId('n'),
    title,
    text: '',
    tags: [],
    color: NOTE_COLORS[0],
    author: useNotes.getState().author,
    created: Date.now(),
    updated: Date.now(),
    anchor,
    ...(engine ? { view: viewNow(engine) } : {}),
    tab,
  };
  useNotes.getState().set({ draft, editing: draft.id, choices: choices && choices.length > 1 ? choices : null });
}

/** A new note on the most specific thing in sight (`notes/capture.ts`). */
export async function noteHere(engine: Engine | null): Promise<void> {
  if (!engine) return;
  const anchor = await anchorHere(engine);
  noteAbout(engine, anchor, '', anchorChoices(engine, anchor));
}

/** A new analysis document, opened. */
export function newAnalysis(): void {
  const n = useNotes.getState().book.docs.length + 1;
  const doc = useNotes.getState().addDoc(t('notes.doc.defaultTitle', { n }), t('notes.doc.template'));
  useNotes.getState().set({ docOpen: doc.id });
}

/** The open analysis, or a new one: where an inserted block goes. */
function targetDoc(): string {
  const s = useNotes.getState();
  if (s.docOpen && s.book.docs.some((d) => d.id === s.docOpen)) return s.docOpen;
  if (s.book.docs.length) {
    const last = [...s.book.docs].sort((a, b) => b.updated - a.updated)[0];
    s.set({ docOpen: last.id });
    return last.id;
  }
  newAnalysis();
  return useNotes.getState().docOpen!;
}

/** Puts a block at the end of the open analysis (or `at`, a character offset of its text). */
export function insertBlock(block: NewBlock, at?: number, docId?: string): string {
  const id = docId ?? targetDoc();
  const s = useNotes.getState();
  const doc = s.book.docs.find((d) => d.id === id);
  if (!doc) return '';
  const bid = newId('b');
  const line = `{{block:${bid}}}`;
  let body: string;
  if (at === undefined || at < 0 || at > doc.body.length) body = `${doc.body.replace(/\s*$/, '')}\n\n${line}\n`;
  else {
    const before = doc.body.slice(0, at);
    const after = doc.body.slice(at);
    body = `${before}${before && !before.endsWith('\n') ? '\n' : ''}\n${line}\n${after.startsWith('\n') ? '' : '\n'}${after}`;
  }
  s.updateDoc(id, { body, blocks: { ...doc.blocks, [bid]: { ...block, id: bid } as DocBlock } });
  if (!docId) {
    s.set({ docOpen: id });
    toast(t('notes.doc.inserted', { title: doc.title }), 'good');
  }
  return bid;
}

/** A thumbnail of the view, for a block (null when the frame cannot be read). */
export async function viewThumb(engine: Engine | null): Promise<string | undefined> {
  if (!engine) return undefined;
  return (await thumbnail(engine)) ?? undefined;
}

/** Shows the notes panel in the side panel. */
export function showNotesPanel(): void {
  const tab = useRaceStore.getState().tab as Workspace;
  void reveal({ tab: tab === 'heat' || tab === 'match' ? tab : 'heat', path: ['notes.title'] });
}

/**
 * Takes a chart block sent from elsewhere (a volume's sign: the shared chart
 * module's `heat3d.chartBlock/1`) into the open analysis; false when it is not
 * one. The sink a sender registers (`registerChartBlockSink(takeChartBlock)`).
 */
export function takeChartBlock(v: unknown, at?: number, docId?: string): boolean {
  if (!isSharedChartBlock(v)) return false;
  insertBlock({ type: 'chartBlock', block: v }, at, docId);
  return true;
}
