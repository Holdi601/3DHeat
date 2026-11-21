/**
 * The notes panel: every data note of the session, searched, filtered by the
 * kind of thing it is about, a tag, its author or its match, and sorted; a
 * click goes to the note's place, time, filters and selection. Beside them the
 * analysis documents, opened in the analysis window, and the JSON file all of
 * it can be written to and read from. Notes whose anchor this data does not
 * have are marked, and counted.
 */

import { useMemo, useRef, useState } from 'react';
import { int, t, useLang } from '../../i18n';
import { ANCHOR_KINDS, anchorNeedsData, anchorSubject, resolveAnchor, type AnchorKind } from '../../notes/anchors';
import { download, noteSearchText } from '../../notes/export';
import { readBook, type DataNote } from '../../notes/model';
import { notesToJson, useNotes } from '../../notes/store';
import { plainText } from '../../notes/markdown';
import { useStore } from '../../state/store';
import { Section } from '../controls';
import { useEngine } from '../EngineContext';
import { confirmDialog, toast } from '../shell/kit';
import { newAnalysis, noteHere } from './actions';
import { goToNote } from './links';
import './notes.css';

type Sort = 'updated' | 'created' | 'title' | 'kind' | 'time';

/** Rows the list draws at most; the search and filters narrow the rest. */
const SHOWN = 200;

const sessionOf = (n: DataNote): string | null => {
  const a = n.anchor;
  if (a.kind === 'row' || a.kind === 'event') return a.sig.session;
  if (a.kind === 'match') return a.id;
  if (a.kind === 'round') return a.session;
  if (a.kind === 'time') return a.session ?? null;
  return null;
};

const timeOf = (n: DataNote): number => {
  const a = n.anchor;
  if (a.kind === 'row' || a.kind === 'event') return a.sig.t ?? Infinity;
  if (a.kind === 'time') return a.from;
  if ((a.kind === 'unit' || a.kind === 'place' || a.kind === 'heat') && a.t !== null && a.t !== undefined) return a.t;
  return Infinity;
};

export function NotesPanel() {
  useLang();
  const engine = useEngine();
  const dataset = useStore((s) => s.dataset);
  const notes = useNotes((s) => s.book.notes);
  const docs = useNotes((s) => s.book.docs);
  const author = useNotes((s) => s.author);
  const pins = useNotes((s) => s.pins);
  const storageFull = useNotes((s) => s.storageFull);
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<AnchorKind | ''>('');
  const [tag, setTag] = useState('');
  const [who, setWho] = useState('');
  const [match, setMatch] = useState('');
  const [sort, setSort] = useState<Sort>('updated');
  const [all, setAll] = useState(false);
  const file = useRef<HTMLInputElement>(null);

  const tags = useMemo(() => [...new Set(notes.flatMap((n) => n.tags))].sort(), [notes]);
  const authors = useMemo(() => [...new Set(notes.map((n) => n.author).filter(Boolean))].sort(), [notes]);
  const matches = useMemo(() => [...new Set(notes.map(sessionOf).filter((x): x is string => !!x))].sort(), [notes]);
  const kinds = useMemo(() => ANCHOR_KINDS.filter((k) => notes.some((n) => n.anchor.kind === k)), [notes]);
  // Whether each note is found on this data: worked out when the notes or the data change, not per render.
  const unresolved = useMemo(() => {
    const out = new Set<string>();
    for (const n of notes) if (anchorNeedsData(n.anchor) && !resolveAnchor(dataset, n.anchor).ok) out.add(n.id);
    return out;
  }, [notes, dataset]);
  const searchText = useMemo(() => new Map(notes.map((n) => [n.id, noteSearchText(n)])), [notes]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out = notes.filter(
      (n) => (!kind || n.anchor.kind === kind) && (!tag || n.tags.includes(tag)) && (!who || n.author === who) && (!match || sessionOf(n) === match) && (!q || q.split(/\s+/).every((w) => searchText.get(n.id)!.includes(w))),
    );
    const by: Record<Sort, (a: DataNote, b: DataNote) => number> = {
      updated: (a, b) => b.updated - a.updated,
      created: (a, b) => b.created - a.created,
      title: (a, b) => (a.title || anchorSubject(a.anchor)).localeCompare(b.title || anchorSubject(b.anchor)),
      kind: (a, b) => ANCHOR_KINDS.indexOf(a.anchor.kind) - ANCHOR_KINDS.indexOf(b.anchor.kind) || b.updated - a.updated,
      time: (a, b) => timeOf(a) - timeOf(b) || b.updated - a.updated,
    };
    return out.sort(by[sort]);
  }, [notes, query, kind, tag, who, match, sort, searchText]);

  const exportAll = () => download('3dheat-notes.json', notesToJson(), 'application/json');
  const importFile = async (f: File | undefined) => {
    if (!f) return;
    try {
      const n = useNotes.getState().merge(readBook(JSON.parse(await f.text())));
      toast(t('notes.imported', { n: int(n) }), 'good');
    } catch {
      toast(t('notes.importFailed'), 'bad');
    }
  };
  const filtered = !!(query || kind || tag || who || match);

  return (
    <Section title={t('notes.title')} right={notes.length ? <span className="dim">{int(notes.length)}</span> : undefined}>
      <div className="hint">{t('notes.hint')}</div>
      <div className="row wrap" style={{ gap: 4 }}>
        <button type="button" className="primary" onClick={() => void noteHere(engine)} disabled={!engine} title={t('notes.newHereTitle')}>
          {t('notes.newHere')}
        </button>
        <button type="button" onClick={newAnalysis} title={t('notes.newAnalysisTitle')}>
          {t('notes.newAnalysis')}
        </button>
        <label className="check" title={t('notes.pinsTitle')}>
          <input type="checkbox" checked={pins} onChange={(e) => useNotes.getState().set({ pins: e.target.checked })} /> {t('notes.pins')}
        </label>
      </div>

      {docs.length > 0 && (
        <div className="notes-docs">
          <div className="notes-sub">{t('notes.docs')}</div>
          <ul className="notes-list">
            {[...docs]
              .sort((a, b) => b.updated - a.updated)
              .map((d) => (
                <li key={d.id}>
                  <button type="button" className="link note-title" onClick={() => useNotes.getState().set({ docOpen: d.id })} title={t('notes.doc.openTitle')}>
                    {d.title || t('notes.untitled')}
                  </button>
                  <span className="dim">{new Date(d.updated).toLocaleDateString()}</span>
                </li>
              ))}
          </ul>
        </div>
      )}

      {notes.length > 0 && (
        <>
          <input type="search" value={query} placeholder={t('notes.search')} onChange={(e) => setQuery(e.target.value)} aria-label={t('notes.search')} />
          <div className="notes-filters">
            <select value={kind} onChange={(e) => setKind(e.target.value as AnchorKind | '')} aria-label={t('notes.filter.kind')} title={t('notes.filter.kind')}>
              <option value="">{t('notes.filter.allKinds')}</option>
              {kinds.map((k) => (
                <option key={k} value={k}>
                  {t(`notes.kind.${k}`)}
                </option>
              ))}
            </select>
            {tags.length > 0 && (
              <select value={tag} onChange={(e) => setTag(e.target.value)} aria-label={t('notes.filter.tag')} title={t('notes.filter.tag')}>
                <option value="">{t('notes.filter.allTags')}</option>
                {tags.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            )}
            {authors.length > 1 && (
              <select value={who} onChange={(e) => setWho(e.target.value)} aria-label={t('notes.filter.author')} title={t('notes.filter.author')}>
                <option value="">{t('notes.filter.allAuthors')}</option>
                {authors.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            )}
            {matches.length > 0 && (
              <select value={match} onChange={(e) => setMatch(e.target.value)} aria-label={t('notes.filter.match')} title={t('notes.filter.match')}>
                <option value="">{t('notes.filter.allMatches')}</option>
                {matches.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            )}
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label={t('notes.sort.label')} title={t('notes.sort.label')}>
              {(['updated', 'created', 'title', 'kind', 'time'] as Sort[]).map((x) => (
                <option key={x} value={x}>
                  {t(`notes.sort.${x}`)}
                </option>
              ))}
            </select>
          </div>
          {unresolved.size > 0 && <div className="hint note-unresolved-line">{t('notes.unresolvedCount', { n: unresolved.size })}</div>}
          {filtered && <div className="dim">{t('notes.shown', { n: int(list.length), total: int(notes.length) })}</div>}
          <ul className="notes-list">
            {(all ? list : list.slice(0, SHOWN)).map((n) => (
              <li key={n.id} className={unresolved.has(n.id) ? 'unresolved' : ''} data-note={n.id}>
                <i className="note-dot" style={{ background: n.color }} />
                <div className="note-main">
                  <button type="button" className="link note-title" onClick={() => engine && goToNote(engine, n.id)} title={t('notes.jumpTitle')}>
                    {n.title || anchorSubject(n.anchor)}
                  </button>
                  <div className="dim note-meta">
                    {t(`notes.kind.${n.anchor.kind}`)} · {anchorSubject(n.anchor)}
                    {n.author ? ` · ${n.author}` : ''}
                    {unresolved.has(n.id) ? ` · ${t('notes.notHere')}` : ''}
                  </div>
                  {n.text && <div className="note-snippet">{plainText(n.text).slice(0, 140)}</div>}
                  {n.tags.length > 0 && (
                    <div className="tags">
                      {n.tags.map((x) => (
                        <button type="button" key={x} className="tag" onClick={() => setTag(x)} title={t('notes.filter.tag')}>
                          {x}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="note-actions">
                  <button type="button" className="link" onClick={() => useNotes.getState().set({ editing: n.id })} title={t('notes.edit')} aria-label={t('notes.edit')}>
                    ✎
                  </button>
                  <button
                    type="button"
                    className="link"
                    onClick={() => void confirmDialog(t('notes.deleteConfirm', { title: n.title || t('notes.untitled') }), t('notes.delete')).then((ok) => ok && useNotes.getState().removeNote(n.id))}
                    title={t('notes.delete')}
                    aria-label={t('notes.delete')}
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {!all && list.length > SHOWN && (
            <button type="button" className="link" onClick={() => setAll(true)}>
              {t('notes.showAll', { n: int(list.length) })}
            </button>
          )}
        </>
      )}
      {!notes.length && <div className="hint">{t('notes.none')}</div>}

      <label className="field-line">
        <span>{t('notes.author')}</span>
        <input type="text" value={author} placeholder={t('notes.anonymous')} onChange={(e) => useNotes.getState().setAuthor(e.target.value.slice(0, 80))} aria-label={t('notes.author')} title={t('notes.authorTitle')} />
      </label>
      <div className="row wrap" style={{ gap: 4 }}>
        <button type="button" onClick={exportAll} disabled={!notes.length && !docs.length} title={t('notes.exportTitle')}>
          {t('notes.export')}
        </button>
        <button type="button" onClick={() => file.current?.click()} title={t('notes.importTitle')}>
          {t('notes.import')}
        </button>
        <input ref={file} type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={(e) => void importFile(e.target.files?.[0])} />
      </div>
      {storageFull && <div className="hint" style={{ color: 'var(--warn)' }}>{t('notes.storageFull')}</div>}
    </Section>
  );
}
