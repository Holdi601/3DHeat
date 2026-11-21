/**
 * The notes over the view: the pins' hover line and the card a click on a pin
 * opens (title, text, Go to / Edit), the notes' keys, the editor dialog and
 * the analysis window. The pins themselves are drawn by the GPU
 * (`notes/pins.ts`); the hover is found on a pointer move at most twenty
 * times a second and written straight into its element, so moving over the
 * view costs no React render and nothing on the frame path.
 */

import { useEffect, useRef, useState } from 'react';
import { t, useLang } from '../../i18n';
import { anchorSubject } from '../../notes/anchors';
import { titler } from '../../notes/export';
import { markdownToHtml } from '../../notes/markdown';
import { startNotes, useNotes } from '../../notes/store';
import type { Engine } from '../../render/engine';
import { useStore } from '../../state/store';
import { useEngine } from '../EngineContext';
import { registerChartBlockSink } from '../../charts/block';
import { takeChartBlock } from './actions';
import { AnalysisWindow } from './AnalysisWindow';
import { installNotesKeys } from './keys';
import { goToNote } from './links';
import { NoteEditor } from './NoteEditor';
import './notes.css';

/** The note whose pin is under (x, y), CSS pixels on the canvas. */
export function notePinAt(engine: Engine, x: number, y: number): string | null {
  if (!useNotes.getState().pins) return null;
  const all = useStore.getState().timeline.mode === 'all' || !useStore.getState().dataset?.time;
  return engine.notePins.at(x, y, (a, b, c) => engine.project(a, b, c), all ? null : engine.live.playhead);
}

export function NotesLayer() {
  useLang();
  const engine = useEngine();
  const tip = useRef<HTMLDivElement>(null);
  const [card, setCard] = useState<{ id: string; x: number; y: number } | null>(null);

  useEffect(() => void startNotes(), []);
  // Charts a volume's sign sends to the document come into the open analysis.
  useEffect(() => registerChartBlockSink((b) => takeChartBlock(b)), []);
  useEffect(() => installNotesKeys(() => engine), [engine]);

  useEffect(() => {
    if (!engine) return;
    const canvas = engine.canvas;
    engine.notePinClick = (x, y) => {
      const id = notePinAt(engine, x, y);
      if (!id) return false;
      setCard({ id, x, y });
      return true;
    };
    let last = 0;
    let shown: string | null = null;
    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - last < 50 || e.buttons) return;
      last = now;
      const r = canvas.getBoundingClientRect();
      const id = notePinAt(engine, e.clientX - r.left, e.clientY - r.top);
      const el = tip.current;
      if (!el) return;
      if (id !== shown) {
        shown = id;
        const n = id ? useNotes.getState().book.notes.find((x) => x.id === id) : null;
        el.textContent = n ? n.title || anchorSubject(n.anchor) : '';
        el.style.display = n ? '' : 'none';
        canvas.style.cursor = n ? 'pointer' : '';
      }
      if (id) el.style.transform = `translate(${e.clientX - r.left + 14}px, ${e.clientY - r.top + 10}px)`;
    };
    const onLeave = () => {
      shown = null;
      if (tip.current) tip.current.style.display = 'none';
      canvas.style.cursor = '';
    };
    canvas.addEventListener('pointermove', onMove, { passive: true });
    canvas.addEventListener('pointerleave', onLeave);
    return () => {
      engine.notePinClick = null;
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
    };
  }, [engine]);

  return (
    <>
      <div className="note-tip" ref={tip} style={{ display: 'none' }} />
      {card && <PinCard {...card} onClose={() => setCard(null)} />}
      <NoteEditor />
      <AnalysisWindow />
    </>
  );
}

function PinCard({ id, x, y, onClose }: { id: string; x: number; y: number; onClose: () => void }) {
  const engine = useEngine();
  const note = useNotes((s) => s.book.notes.find((n) => n.id === id));
  const book = useNotes((s) => s.book);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const away = (e: PointerEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) onClose();
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('pointerdown', away);
    window.addEventListener('keydown', esc);
    return () => {
      window.removeEventListener('pointerdown', away);
      window.removeEventListener('keydown', esc);
    };
  }, [onClose]);
  if (!note) return null;
  return (
    <div className="note-pin-card" ref={box} style={{ left: x + 12, top: y + 12, borderTopColor: note.color }} role="dialog" aria-label={note.title || t('notes.untitled')}>
      <div className="note-card-head">
        <b>{note.title || anchorSubject(note.anchor)}</b>
        <span className="dim">{t(`notes.kind.${note.anchor.kind}`)}</span>
      </div>
      {note.text && <div className="doc-render note-pin-text" dangerouslySetInnerHTML={{ __html: markdownToHtml(note.text, { title: titler(book) }) }} />}
      <div className="dim">{note.author || t('notes.anonymous')} · {new Date(note.updated).toLocaleString()}</div>
      <div className="row" style={{ gap: 4, marginTop: 6 }}>
        <button
          type="button"
          className="primary"
          onClick={() => {
            if (engine) goToNote(engine, note.id);
            onClose();
          }}
          title={t('notes.jumpTitle')}
        >
          {t('notes.jump')}
        </button>
        <button
          type="button"
          onClick={() => {
            useNotes.getState().set({ editing: note.id });
            onClose();
          }}
        >
          {t('notes.edit')}
        </button>
      </div>
    </div>
  );
}
