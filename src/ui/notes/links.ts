/**
 * A click inside rendered note or document text: a link inside the viewer
 * (`note:`, `view:`, `doc:`; notes/markdown.ts) goes to its target, a link to
 * a heading scrolls to it, a web link opens in a new tab as written.
 */

import type { MouseEvent as ReactMouseEvent } from 'react';
import { t } from '../../i18n';
import type { Engine } from '../../render/engine';
import { jumpTo } from '../../notes/jump';
import { useNotes } from '../../notes/store';
import { applyView, useSavedViews } from '../../state/savedViews';
import { toast } from '../shell/kit';

/** Goes to a note, saying what could not be found. */
export function goToNote(engine: Engine, id: string): void {
  const n = useNotes.getState().book.notes.find((x) => x.id === id);
  if (!n) return toast(t('notes.block.noteGone'), 'bad');
  const r = jumpTo(engine, n);
  if (r.reason) toast(t(`notes.unresolved.${r.reason}`), 'bad', 3200);
  else if (r.missing.length) toast(t('analysis.views.missing', { list: r.missing.join(', ') }), 'info', 3200);
}

export function followLink(e: ReactMouseEvent, engine: Engine): boolean {
  const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a');
  if (!a) return false;
  const link = a.dataset.link;
  if (link) {
    e.preventDefault();
    const [kind, id] = link.split(':');
    if (kind === 'note') goToNote(engine, id);
    else if (kind === 'doc') {
      if (useNotes.getState().book.docs.some((d) => d.id === id)) useNotes.getState().set({ docOpen: id });
      else toast(t('notes.block.missing'), 'bad');
    } else if (kind === 'view') {
      const v = useSavedViews.getState().views.find((x) => x.id === id);
      if (v) applyView(engine, v.view);
      else toast(t('notes.block.missing'), 'bad');
    }
    return true;
  }
  const href = a.getAttribute('href') ?? '';
  if (href.startsWith('#') && href.length > 1) {
    e.preventDefault();
    const root = (e.currentTarget as HTMLElement) ?? document;
    root.querySelector(`[id="${CSS.escape(href.slice(1))}"]`)?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    return true;
  }
  return false;
}
