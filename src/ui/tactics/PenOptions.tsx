import { momentOf, usePlanStore } from '../../state/planStore';
import { type NoteShow, type PlanDrawing, type PlanNote } from '../../tactics/plan';
import { clock, unitsPerMetre } from '../../tactics/timing';
import { t } from '../../i18n';

type Rgb = [number, number, number];

/** sRGB 0..1 to "#rrggbb", and back. */
export const toHex = (c: Rgb) => `#${c.map((x) => Math.round(Math.max(0, Math.min(1, x)) * 255).toString(16).padStart(2, '0')).join('')}`;
export const fromHex = (h: string): Rgb => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as Rgb;

const SHOWS: NoteShow[] = ['step', 'always', 'timed'];
const KINDS: PlanDrawing['kind'][] = ['stroke', 'highlight', 'circle'];

/** A number that is written back when it is left or Enter is pressed. */
function Num({ label, value, onCommit, digits = 1, width = '4em' }: { label: string; value: number; onCommit: (v: number) => void; digits?: number; width?: string }) {
  return (
    <label className="board-seconds">
      {label}
      <input
        type="text"
        inputMode="decimal"
        defaultValue={value.toFixed(digits)}
        key={value}
        style={{ width }}
        onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
        onBlur={(e) => {
          const v = Number(e.target.value.replace(',', '.'));
          if (Number.isFinite(v) && Math.abs(v - value) > 1e-9) onCommit(v);
        }}
      />
    </label>
  );
}

/** The Draw tool's pen: what it draws, its colour and width, and whether the drawing shows in every step. */
export function DrawOptions() {
  const pen = usePlanStore((s) => s.drawStyle);
  const store = usePlanStore.getState;
  return (
    <>
      <div className="tactics-tools" role="radiogroup" aria-label={t('tactics.draw.kind')}>
        {KINDS.map((k) => (
          <button key={k} role="radio" aria-checked={pen.kind === k} className={pen.kind === k ? 'on' : ''} onClick={() => store().setDrawStyle({ kind: k })}>
            {t(`tactics.draw.${k}`)}
          </button>
        ))}
      </div>
      <div className="tactics-tools">
        <label className="board-seconds">
          {t('tactics.colour')}
          <input type="color" value={toHex(pen.color)} onChange={(e) => store().setDrawStyle({ color: fromHex(e.target.value) })} />
        </label>
        <Num label={t('tactics.draw.width')} value={pen.width} onCommit={(v) => store().setDrawStyle({ width: Math.max(0, v) })} digits={2} />
        <label className="board-seconds">
          <input type="checkbox" checked={pen.always} onChange={(e) => store().setDrawStyle({ always: e.target.checked })} />
          {t('tactics.draw.always')}
        </label>
      </div>
    </>
  );
}

/** How the next note looks and when it shows. */
export function NoteOptions() {
  const ns = usePlanStore((s) => s.noteStyle);
  const store = usePlanStore.getState;
  return (
    <>
      <div className="tactics-tools">
        <label className="board-seconds">
          {t('tactics.colour')}
          <input type="color" value={toHex(ns.color)} onChange={(e) => store().setNoteStyle({ color: fromHex(e.target.value) })} />
        </label>
        <Num label={t('tactics.note.size')} value={ns.size} digits={0} onCommit={(v) => store().setNoteStyle({ size: Math.max(8, Math.min(96, Math.round(v))) })} />
      </div>
      <label className="field">
        <span>{t('tactics.note.show')}</span>
        <select value={ns.show} onChange={(e) => store().setNoteStyle({ show: e.target.value as NoteShow })}>
          {SHOWS.map((x) => (
            <option key={x} value={x}>
              {t(`tactics.note.show.${x}`)}
            </option>
          ))}
        </select>
      </label>
      {ns.show === 'timed' && <Num label={t('tactics.note.duration')} value={ns.duration} onCommit={(v) => store().setNoteStyle({ duration: Math.max(0.1, v) })} />}
    </>
  );
}

/** A selected note: its text, colour, size, and when it shows. */
export function NoteEditor({ note }: { note: PlanNote }) {
  const store = usePlanStore.getState;
  const now = usePlanStore((s) => momentOf(s).time);
  const show = note.show ?? 'step';
  return (
    <>
      <label className="field">
        <span>{t('tactics.note.text')}</span>
        <textarea defaultValue={note.text} key={note.id + note.text} rows={2} onBlur={(e) => e.target.value !== note.text && store().setNote(note.id, { text: e.target.value })} />
      </label>
      <div className="tactics-tools">
        <label className="board-seconds">
          {t('tactics.colour')}
          <input type="color" value={toHex(note.color ?? [1, 1, 1])} onChange={(e) => store().setNote(note.id, { color: fromHex(e.target.value) })} />
        </label>
        <Num label={t('tactics.note.size')} value={note.size ?? 13} digits={0} onCommit={(v) => store().setNote(note.id, { size: Math.max(8, Math.min(96, Math.round(v))) })} />
      </div>
      <label className="field">
        <span>{t('tactics.note.show')}</span>
        <select value={show} onChange={(e) => store().setNote(note.id, { show: e.target.value as NoteShow })}>
          {SHOWS.map((x) => (
            <option key={x} value={x}>
              {t(`tactics.note.show.${x}`)}
            </option>
          ))}
        </select>
      </label>
      {show === 'timed' && (
        <div className="tactics-tools">
          <Num label={t('tactics.note.start')} value={note.start ?? 0} onCommit={(v) => store().setNote(note.id, { start: Math.max(0, v) })} />
          <Num label={t('tactics.note.duration')} value={note.duration ?? 5} onCommit={(v) => store().setNote(note.id, { duration: Math.max(0.1, v) })} />
          <button onClick={() => store().setNote(note.id, { start: now })} title={t('tactics.note.startNowHint')}>
            {t('tactics.note.startNow', { at: clock(now) })}
          </button>
        </div>
      )}
    </>
  );
}

/** A selected drawing: its colour, width and whether it shows in every step. */
export function DrawingEditor({ drawing }: { drawing: PlanDrawing }) {
  const store = usePlanStore.getState;
  const upm = usePlanStore((s) => unitsPerMetre(s.plan));
  return (
    <div className="tactics-tools">
      <span className="hint">{t(`tactics.draw.${drawing.kind}`)}</span>
      <label className="board-seconds">
        {t('tactics.colour')}
        <input type="color" value={toHex(drawing.color)} onChange={(e) => store().setDrawing(drawing.id, { color: fromHex(e.target.value) })} />
      </label>
      <Num label={t('tactics.draw.width')} value={drawing.width / upm} digits={2} onCommit={(v) => v > 0 && store().setDrawing(drawing.id, { width: v * upm })} />
      <label className="board-seconds">
        <input type="checkbox" checked={!!drawing.always} onChange={(e) => store().setDrawing(drawing.id, { always: e.target.checked })} />
        {t('tactics.draw.always')}
      </label>
    </div>
  );
}
