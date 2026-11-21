/**
 * The note editor: a dialog over the view for the note being made or the one
 * opened - its title, its Markdown text (written or previewed), its tags,
 * colour and screenshot, and what it is anchored to. Off the frame path: it
 * renders on typing only, and the view behind it goes on drawing.
 */

import { useMemo, useState } from 'react';
import { t, useLang } from '../../i18n';
import { anchorSubject, resolveAnchor } from '../../notes/anchors';
import { thumbnail } from '../../notes/capture';
import { titler } from '../../notes/export';
import { markdownToHtml } from '../../notes/markdown';
import { NOTE_COLORS, type DataNote } from '../../notes/model';
import { useNotes } from '../../notes/store';
import { useStore } from '../../state/store';
import { useEngine } from '../EngineContext';
import { Dialog, confirmDialog } from '../shell/kit';
import { stopViewKeys } from './keys';
import { followLink } from './links';

export function NoteEditor() {
  useLang();
  const editing = useNotes((s) => s.editing);
  const draft = useNotes((s) => s.draft);
  const stored = useNotes((s) => (s.editing ? s.book.notes.find((n) => n.id === s.editing) : undefined));
  const note = stored ?? (draft && draft.id === editing ? draft : null);
  if (!editing || !note) return null;
  return <Editor key={note.id} note={note} isNew={!stored} />;
}

function Editor({ note, isNew }: { note: DataNote; isNew: boolean }) {
  const engine = useEngine();
  const dataset = useStore((s) => s.dataset);
  const book = useNotes((s) => s.book);
  const [title, setTitle] = useState(note.title);
  const [text, setText] = useState(note.text);
  const [tags, setTags] = useState(note.tags.join(', '));
  const [color, setColor] = useState(note.color);
  const [shot, setShot] = useState(note.shot);
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const choices = useNotes((s) => (isNew ? s.choices : null));
  const close = () => useNotes.getState().set({ editing: null, draft: null, choices: null });
  const resolved = useMemo(() => resolveAnchor(dataset, note.anchor), [dataset, note.anchor]);
  const save = () => {
    const patch = {
      title: title.trim() || anchorSubject(note.anchor).slice(0, 80),
      text,
      tags: [...new Set(tags.split(',').map((x) => x.trim()).filter(Boolean))].slice(0, 20),
      color,
      ...(shot ? { shot } : {}),
    };
    const s = useNotes.getState();
    if (isNew) {
      const { id, anchor, view, tab } = note;
      s.addNote({ id, anchor, ...(view ? { view } : {}), ...(tab ? { tab } : {}), ...patch });
    } else {
      s.updateNote(note.id, shot ? patch : { ...patch, shot: undefined });
    }
    close();
  };
  const remove = async () => {
    if (await confirmDialog(t('notes.deleteConfirm', { title: note.title || t('notes.untitled') }), t('notes.delete'))) {
      useNotes.getState().removeNote(note.id);
      close();
    }
  };
  const takeShot = async () => {
    if (!engine) return;
    setBusy(true);
    // The dialog off the picture for the moment it is read.
    const scrim = document.querySelector<HTMLElement>('.dialog-scrim');
    if (scrim) scrim.style.visibility = 'hidden';
    const s = await thumbnail(engine, 960, 0.85);
    if (scrim) scrim.style.visibility = '';
    setBusy(false);
    if (s) setShot(s);
  };

  return (
    <Dialog title={isNew ? t('notes.editor.new') : t('notes.editor.edit')} onClose={close} wide className="note-editor">
      <div className="note-editor-body" onKeyDown={stopViewKeys}>
        {choices && (
          <label className="field-line">
            <span>{t('notes.editor.about')}</span>
            <select
              value={choices.findIndex((c) => JSON.stringify(c) === JSON.stringify(note.anchor))}
              onChange={(e) => useNotes.getState().set({ draft: { ...note, anchor: choices[Number(e.target.value)] } })}
              aria-label={t('notes.editor.about')}
              title={t('notes.editor.aboutTitle')}
            >
              {choices.map((c, i) => (
                <option key={i} value={i}>
                  {t(`notes.kind.${c.kind}`)}: {anchorSubject(c).slice(0, 60)}
                </option>
              ))}
            </select>
          </label>
        )}
        <div className="note-anchor" title={t('notes.editor.anchorTitle')}>
          <span className="note-kind">{t(`notes.kind.${note.anchor.kind}`)}</span>
          <span className="note-subject">{anchorSubject(note.anchor)}</span>
          {!resolved.ok && <span className="note-unresolved">{t(`notes.unresolved.${resolved.reason ?? 'noData'}`)}</span>}
          {resolved.moved && <span className="dim">{t('notes.moved')}</span>}
        </div>
        <label className="field-line">
          <span>{t('notes.editor.title')}</span>
          <input type="text" value={title} autoFocus placeholder={anchorSubject(note.anchor)} onChange={(e) => setTitle(e.target.value)} aria-label={t('notes.editor.title')} />
        </label>
        <div className="note-text-head">
          <span>{t('notes.editor.text')}</span>
          <div className="seg">
            <button type="button" className={preview ? '' : 'on'} aria-pressed={!preview} onClick={() => setPreview(false)} title={t('notes.editor.writeTitle')}>
              {t('notes.editor.write')}
            </button>
            <button type="button" className={preview ? 'on' : ''} aria-pressed={preview} onClick={() => setPreview(true)} title={t('notes.editor.previewTitle')}>
              {t('notes.editor.preview')}
            </button>
          </div>
        </div>
        {preview ? (
          <div
            className="doc-render note-preview"
            onClick={(e) => engine && followLink(e, engine)}
            // The text is escaped by the Markdown reader; only its own forms make markup (notes/markdown.ts).
            dangerouslySetInnerHTML={{ __html: markdownToHtml(text, { title: titler(book) }) || `<p class="dim">${t('notes.editor.empty')}</p>` }}
          />
        ) : (
          <textarea className="note-text" rows={9} value={text} placeholder={t('notes.editor.textHint')} onChange={(e) => setText(e.target.value)} aria-label={t('notes.editor.text')} title={t('notes.editor.textTitle')} />
        )}
        <label className="field-line">
          <span>{t('notes.editor.tags')}</span>
          <input type="text" value={tags} placeholder={t('notes.editor.tagsHint')} onChange={(e) => setTags(e.target.value)} aria-label={t('notes.editor.tags')} />
        </label>
        <div className="field-line">
          <span>{t('notes.editor.color')}</span>
          <div className="note-colors" role="radiogroup" aria-label={t('notes.editor.color')}>
            {NOTE_COLORS.map((c) => (
              <button key={c} type="button" role="radio" aria-checked={color === c} className={color === c ? 'on' : ''} style={{ background: c }} onClick={() => setColor(c)} title={c} aria-label={c} />
            ))}
          </div>
        </div>
        <div className="field-line">
          <span>{t('notes.editor.shot')}</span>
          <div className="row" style={{ gap: 6, alignItems: 'center' }}>
            <button type="button" onClick={() => void takeShot()} disabled={!engine || busy} title={t('notes.editor.shotTitle')}>
              {shot ? t('notes.editor.shotAgain') : t('notes.editor.shotTake')}
            </button>
            {shot && (
              <button type="button" onClick={() => setShot(undefined)}>
                {t('notes.editor.shotRemove')}
              </button>
            )}
          </div>
        </div>
        {shot && <img className="note-shot" src={shot} alt={t('notes.editor.shot')} />}
        <div className="dim">{t('notes.editor.byline', { author: note.author || t('notes.anonymous'), when: new Date(note.updated).toLocaleString() })}</div>
      </div>
      <div className="dialog-actions">
        {!isNew && (
          <button type="button" className="danger" onClick={() => void remove()}>
            {t('notes.delete')}
          </button>
        )}
        <span style={{ flex: 1 }} />
        <button type="button" onClick={close}>
          {t('notes.cancel')}
        </button>
        <button type="button" className="primary" onClick={save}>
          {t('notes.save')}
        </button>
      </div>
    </Dialog>
  );
}
