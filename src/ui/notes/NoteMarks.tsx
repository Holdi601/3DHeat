/**
 * The notes on the timeline: a mark in the note's colour at each note's
 * moment, a band for a time range, over the scrubber. One canvas, drawn again
 * only when the notes, the data or the width change - never for the playhead
 * - and a click on a mark goes to its note.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { t } from '../../i18n';
import { resolveAnchor } from '../../notes/anchors';
import { useNotes } from '../../notes/store';
import { useStore } from '../../state/store';
import { useEngine } from '../EngineContext';
import { goToNote } from './links';

/** Half the scrubber's thumb, as the replay's marks have it (ReplayMarks.tsx). */
const THUMB = 7;
const REACH = 5;

interface Mark {
  id: string;
  from: number;
  to: number;
  color: string;
  title: string;
}

export function NoteMarks({ range }: { range: readonly number[] }) {
  const engine = useEngine();
  const dataset = useStore((s) => s.dataset);
  const notes = useNotes((s) => s.book.notes);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [width, setWidth] = useState(0);

  const marks = useMemo(() => {
    if (!dataset?.time) return [] as Mark[];
    const out: Mark[] = [];
    for (const n of notes) {
      const a = n.anchor;
      if (a.kind === 'view' || a.kind === 'plan' || a.kind === 'data' || a.kind === 'match') continue;
      const r = resolveAnchor(dataset, a);
      if (!r.ok) continue;
      const tt = r.time ?? ((a.kind === 'unit' || a.kind === 'place' || a.kind === 'heat') && a.t !== null && a.t !== undefined ? a.t : undefined);
      if (r.range) out.push({ id: n.id, from: r.range[0], to: r.range[1], color: n.color, title: n.title });
      else if (tt !== undefined) out.push({ id: n.id, from: tt, to: tt, color: n.color, title: n.title });
    }
    return out;
  }, [dataset, notes]);

  useEffect(() => {
    const c = canvas.current;
    if (!c || !marks.length) return;
    const ro = new ResizeObserver(() => setWidth(c.clientWidth));
    ro.observe(c);
    setWidth(c.clientWidth);
    return () => ro.disconnect();
  }, [marks.length > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const span = Math.max(1e-9, range[1] - range[0]);
  const x = (v: number) => THUMB + ((v - range[0]) / span) * (width - 2 * THUMB);

  useEffect(() => {
    const c = canvas.current;
    if (!c || !width) return;
    const dpr = window.devicePixelRatio || 1;
    const h = c.clientHeight;
    c.width = Math.round(width * dpr);
    c.height = Math.round(h * dpr);
    const g = c.getContext('2d');
    if (!g) return;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, width, h);
    for (const m of marks) {
      const a = x(m.from);
      const b = x(m.to);
      if (b < 0 || a > width) continue;
      g.fillStyle = m.color;
      if (b - a >= 2) {
        g.globalAlpha = 0.35;
        g.fillRect(a, h - 5, b - a, 5);
        g.globalAlpha = 1;
        g.fillRect(a, h - 8, 2, 8);
      } else {
        // A small flag over the track's foot.
        g.beginPath();
        g.moveTo(a - 3.5, h - 8);
        g.lineTo(a + 3.5, h - 8);
        g.lineTo(a, h - 2);
        g.closePath();
        g.fill();
      }
    }
  }, [marks, width, range[0], range[1]]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!marks.length) return null;
  const nearest = (px: number) => {
    let best: Mark | null = null;
    let bestD = REACH;
    for (const m of marks) {
      const a = x(m.from);
      const b = x(m.to);
      const d = px < a ? a - px : px > b ? px - b : 0;
      if (d <= bestD) {
        bestD = d;
        best = m;
      }
    }
    return best;
  };
  return (
    <canvas
      ref={canvas}
      className="note-marks"
      aria-label={t('notes.marks')}
      onPointerDown={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const m = nearest(e.clientX - r.left);
        if (!m || !engine) return;
        e.preventDefault();
        e.stopPropagation();
        goToNote(engine, m.id);
      }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const m = nearest(e.clientX - r.left);
        const title = m ? m.title || t('notes.untitled') : '';
        if (e.currentTarget.title !== title) e.currentTarget.title = title;
        e.currentTarget.style.cursor = m ? 'pointer' : '';
      }}
    />
  );
}
