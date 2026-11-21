/**
 * The analysis window: a document written in Markdown beside the view, its
 * outline (the session's documents and the open one's headings) on the left,
 * the text and its preview - with the live blocks drawn - on the right.
 *
 * Blocks go in at the cursor from the Insert menu: the view as it is (with a
 * thumbnail), a saved view, an insight finding, the pick card's heat spot, a
 * chart, a data note, the tactics plan, a screenshot. In the preview a view
 * block's button puts the view back in 3D, a finding's or heat spot's goes
 * there, a chart's counts it again.
 *
 * The text is kept in the document a moment after typing stops (one change
 * in the log per pause, not per key), and at once when the window closes.
 * Nothing here is on the frame path: the window renders on typing and on
 * changes of the document only.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { t, useLang } from '../../i18n';
import { docBodyHtml, docToHtml, docToMarkdown, docToZip, download, fileName, printDoc } from '../../notes/export';
import { jumpTo } from '../../notes/jump';
import { outline, type AnalysisDoc } from '../../notes/model';
import { slug } from '../../notes/markdown';
import { useNotes } from '../../notes/store';
import { useInsights } from '../../insights/store';
import { useInspectStore } from '../../state/inspectStore';
import { applyView, useSavedViews, type ViewState } from '../../state/savedViews';
import { useEngine } from '../EngineContext';
import { Icon } from '../shell/Icon';
import { confirmDialog, toast } from '../shell/kit';
import { insertBlock, newAnalysis, takeChartBlock, viewThumb } from './actions';
import { isSharedChartBlock } from '../../notes/sharedChart';
import { ChartEditor, refreshChart } from './ChartEditor';
import { heatBlock, insightAnchor, insightBlock, planAnchor, savedViewBlock } from './from';
import { stopViewKeys } from './keys';
import { followLink, goToNote } from './links';
import { thumbnail, viewNow } from '../../notes/capture';

type Mode = 'write' | 'split' | 'preview';

export function AnalysisWindow() {
  useLang();
  const docOpen = useNotes((s) => s.docOpen);
  const doc = useNotes((s) => (s.docOpen ? s.book.docs.find((d) => d.id === s.docOpen) : undefined));
  if (!docOpen || !doc) return null;
  return <Window key={doc.id} doc={doc} />;
}

function Window({ doc }: { doc: AnalysisDoc }) {
  const engine = useEngine();
  const book = useNotes((s) => s.book);
  const docs = book.docs;
  const views = useSavedViews((s) => s.views);
  const report = useInsights((s) => s.report);
  const pick = useInspectStore((s) => s.pick);
  const [mode, setMode] = useState<Mode>('split');
  const [body, setBody] = useState(doc.body);
  const [title, setTitle] = useState(doc.title);
  const [chart, setChart] = useState<{ block: string | null } | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const text = useRef<HTMLTextAreaElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const caret = useRef<number | undefined>(undefined);
  const dirty = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // A change from elsewhere (a peer, an inserted block) comes in when nothing typed here is waiting.
  useEffect(() => {
    if (!dirty.current) setBody(doc.body);
  }, [doc.body]);
  useEffect(() => {
    if (document.activeElement?.getAttribute('data-doc-title') !== 'yes') setTitle(doc.title);
  }, [doc.title]);

  const flush = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (!dirty.current) return;
    dirty.current = false;
    const cur = useNotes.getState().book.docs.find((d) => d.id === doc.id);
    if (cur && cur.body !== bodyRef.current) useNotes.getState().updateDoc(doc.id, { body: bodyRef.current });
  };
  const bodyRef = useRef(body);
  bodyRef.current = body;
  useEffect(() => () => flush(), []); // eslint-disable-line react-hooks/exhaustive-deps

  const edit = (v: string) => {
    setBody(v);
    bodyRef.current = v;
    dirty.current = true;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, 500);
  };
  const close = () => {
    flush();
    useNotes.getState().set({ docOpen: null });
  };

  const html = useMemo(() => docBodyHtml({ ...doc, body }, { book, interactive: true }), [doc, body, book]);
  const heads = useMemo(() => outline(body), [body]);

  /** A block in at the cursor. */
  const put = (block: Parameters<typeof insertBlock>[0]) => {
    flush();
    insertBlock(block, caret.current, doc.id);
  };
  const onInsert = async (v: string) => {
    if (!v) return;
    if (v === 'viewNow') {
      if (!engine) return;
      const thumb = await viewThumb(engine);
      put({ type: 'view', name: t('notes.block.viewNow', { time: new Date().toLocaleTimeString() }), view: viewNow(engine), ...(thumb ? { thumb } : {}) });
    } else if (v.startsWith('view:')) {
      const sv = views.find((x) => x.id === v.slice(5));
      if (sv) put(savedViewBlock(sv));
    } else if (v.startsWith('insight:')) {
      const ins = report?.insights.find((x) => x.id === v.slice(8));
      if (ins) put(insightBlock(ins, report));
    } else if (v === 'heat') {
      if (!engine) return;
      const b = await heatBlock(engine);
      if (b) put(b);
      else toast(t('notes.block.noPick'), 'bad');
    } else if (v === 'chart') {
      flush();
      setChart({ block: null });
    } else if (v.startsWith('note:')) put({ type: 'note', noteId: v.slice(5) });
    else if (v === 'plan') {
      const thumb = await viewThumb(engine);
      put({ type: 'plan', anchor: planAnchor(), ...(thumb ? { thumb } : {}) });
    } else if (v === 'shot') {
      if (!engine) return;
      const src = await thumbnail(engine, 1280, 0.86);
      if (src) put({ type: 'image', src, caption: '' });
    }
  };

  const onPreviewClick = (e: React.MouseEvent) => {
    if (!engine) return;
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-action]');
    if (btn) {
      e.preventDefault();
      const id = btn.dataset.block ?? '';
      const b = useNotes.getState().book.docs.find((d) => d.id === doc.id)?.blocks[id];
      switch (btn.dataset.action) {
        case 'view':
          if (b?.type === 'view') {
            const missing = applyView(engine, b.view as ViewState);
            toast(missing.length ? t('analysis.views.missing', { list: missing.join(', ') }) : t('analysis.views.restored', { name: b.name }), missing.length ? 'info' : 'good');
          }
          break;
        case 'jump-note':
          goToNote(engine, id);
          break;
        case 'jump-block':
          if (b && (b.type === 'insight' || b.type === 'heat')) {
            const r = jumpTo(engine, { anchor: b.anchor, view: b.view });
            if (r.reason) toast(t(`notes.unresolved.${r.reason}`), 'bad');
          }
          break;
        case 'plan':
          if (b?.type === 'plan') jumpTo(engine, { anchor: b.anchor });
          break;
        case 'chart-refresh':
          void refreshChart(doc.id, id, engine.live.playhead);
          break;
        case 'chart-edit':
          setChart({ block: id });
          break;
      }
      return;
    }
    followLink(e, engine);
  };

  const goHeading = (h: { text: string; line: number }, i: number) => {
    // The preview's heading of that text (the same slug and duplicate count as the reader's).
    const before = heads.slice(0, i).filter((x) => slug(x.text) === slug(h.text)).length;
    const id = before ? `${slug(h.text)}-${before}` : slug(h.text);
    preview.current?.querySelector(`[id="${CSS.escape(id)}"]`)?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    const ta = text.current;
    if (ta && mode !== 'preview') {
      const at = body.split('\n').slice(0, h.line).join('\n').length + (h.line ? 1 : 0);
      ta.focus();
      ta.setSelectionRange(at, at);
      caret.current = at;
    }
  };

  const exportAs = (kind: 'html' | 'zip' | 'md' | 'print') => {
    flush();
    setExportOpen(false);
    const d = useNotes.getState().book.docs.find((x) => x.id === doc.id) ?? doc;
    const b = useNotes.getState().book;
    if (kind === 'html') download(fileName(d.title, 'html'), docToHtml(d, b), 'text/html');
    else if (kind === 'zip') {
      const bytes = docToZip(d, b);
      download(fileName(d.title, 'zip'), bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer, 'application/zip');
    } else if (kind === 'md') download(fileName(d.title, 'md'), docToMarkdown(d, b, true).markdown, 'text/markdown');
    else printDoc(d, b);
  };

  const remove = async () => {
    if (await confirmDialog(t('notes.doc.deleteConfirm', { title: doc.title || t('notes.untitled') }), t('notes.delete'))) useNotes.getState().removeDoc(doc.id);
  };

  const findings = useMemo(() => (report?.insights.slice(0, 40) ?? []).map((f) => ({ id: f.id, label: (insightAnchor(f, report) as { text: string }).text.slice(0, 90) })), [report]);
  const notes = book.notes;

  return (
    <div
      className="analysis-window"
      role="dialog"
      aria-label={t('notes.doc.window')}
      onKeyDown={(e) => {
        stopViewKeys(e);
        // Esc closes the window, unless a menu or a dialog of its own is open.
        if (e.key === 'Escape' && !chart) {
          if (exportOpen) setExportOpen(false);
          else close();
        }
      }}
    >
      <aside className="analysis-outline" aria-label={t('notes.doc.outline')}>
        <div className="notes-sub">{t('notes.docs')}</div>
        <ul>
          {docs.map((d) => (
            <li key={d.id} className={d.id === doc.id ? 'on' : ''}>
              <button
                type="button"
                className="link"
                onClick={() => {
                  flush();
                  useNotes.getState().set({ docOpen: d.id });
                }}
              >
                {d.title || t('notes.untitled')}
              </button>
            </li>
          ))}
        </ul>
        <button type="button" className="link" onClick={() => (flush(), newAnalysis())}>
          + {t('notes.newAnalysis')}
        </button>
        {heads.length > 0 && (
          <>
            <div className="notes-sub">{t('notes.doc.outline')}</div>
            <ul className="analysis-heads">
              {heads.map((h, i) => (
                <li key={`${h.line}-${h.text}`} style={{ paddingLeft: (h.level - 1) * 10 }}>
                  <button type="button" className="link" onClick={() => goHeading(h, i)}>
                    {h.text}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </aside>
      <div className="analysis-main">
        <div className="analysis-head">
          <input
            type="text"
            className="analysis-title"
            data-doc-title="yes"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => title !== doc.title && useNotes.getState().updateDoc(doc.id, { title: title.trim() || doc.title })}
            aria-label={t('notes.doc.title')}
            title={t('notes.doc.title')}
          />
          <div className="seg" role="group" aria-label={t('notes.doc.layout')}>
            {(['write', 'split', 'preview'] as Mode[]).map((m) => (
              <button key={m} type="button" className={mode === m ? 'on' : ''} aria-pressed={mode === m} onClick={() => setMode(m)} title={t(`notes.doc.mode.${m}Title`)}>
                {t(`notes.doc.mode.${m}`)}
              </button>
            ))}
          </div>
          <select
            className="analysis-insert"
            value=""
            onChange={(e) => {
              const v = e.target.value;
              e.target.value = '';
              void onInsert(v);
            }}
            aria-label={t('notes.doc.insert')}
            title={t('notes.doc.insertTitle')}
          >
            <option value="">{t('notes.doc.insert')}</option>
            <option value="viewNow">{t('notes.doc.insertViewNow')}</option>
            <option value="heat" disabled={!pick || pick.kind === 'pending'}>
              {t('notes.doc.insertHeat')}
            </option>
            <option value="chart">{t('notes.doc.insertChart')}</option>
            <option value="plan">{t('notes.doc.insertPlan')}</option>
            <option value="shot">{t('notes.doc.insertShot')}</option>
            {views.length > 0 && (
              <optgroup label={t('notes.doc.insertSavedView')}>
                {views.map((v) => (
                  <option key={v.id} value={`view:${v.id}`}>
                    {v.name}
                  </option>
                ))}
              </optgroup>
            )}
            {findings.length > 0 && (
              <optgroup label={t('notes.doc.insertInsight')}>
                {findings.map((f) => (
                  <option key={f.id} value={`insight:${f.id}`}>
                    {f.label}
                  </option>
                ))}
              </optgroup>
            )}
            {notes.length > 0 && (
              <optgroup label={t('notes.doc.insertNote')}>
                {notes.slice(-60).map((n) => (
                  <option key={n.id} value={`note:${n.id}`}>
                    {n.title || n.id}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
          <div className="analysis-export">
            <button type="button" aria-expanded={exportOpen} onClick={() => setExportOpen(!exportOpen)} title={t('notes.doc.exportTitle')}>
              {t('notes.doc.export')}
            </button>
            {exportOpen && (
              <div className="analysis-export-menu" role="menu">
                <button type="button" role="menuitem" onClick={() => exportAs('html')}>
                  {t('notes.doc.exportHtml')}
                </button>
                <button type="button" role="menuitem" onClick={() => exportAs('zip')}>
                  {t('notes.doc.exportZip')}
                </button>
                <button type="button" role="menuitem" onClick={() => exportAs('md')}>
                  {t('notes.doc.exportMd')}
                </button>
                <button type="button" role="menuitem" onClick={() => exportAs('print')}>
                  {t('notes.doc.print')}
                </button>
              </div>
            )}
          </div>
          <button type="button" className="ghost" onClick={() => void remove()} title={t('notes.doc.delete')} aria-label={t('notes.doc.delete')}>
            {t('notes.delete')}
          </button>
          <button type="button" className="ghost icon-btn" onClick={close} title={t('shell.close')} aria-label={t('shell.close')}>
            <Icon name="close" />
          </button>
        </div>
        <div className={`analysis-body ${mode}`}>
          {mode !== 'preview' && (
            <textarea
              ref={text}
              className="analysis-text"
              value={body}
              spellCheck
              onChange={(e) => edit(e.target.value)}
              onSelect={(e) => (caret.current = (e.target as HTMLTextAreaElement).selectionStart)}
              onBlur={flush}
              onPaste={(e) => {
                // A chart block copied from a sign (JSON) goes in as a live block, not as text.
                const text = e.clipboardData.getData('text/plain');
                if (!text.trimStart().startsWith('{')) return;
                try {
                  const v = JSON.parse(text);
                  if (!isSharedChartBlock(v)) return;
                  e.preventDefault();
                  flush();
                  takeChartBlock(v, (e.target as HTMLTextAreaElement).selectionStart, doc.id);
                } catch {
                  // Not JSON: pasted as text.
                }
              }}
              aria-label={t('notes.doc.text')}
              title={t('notes.doc.textTitle')}
              placeholder={t('notes.doc.textHint')}
            />
          )}
          {mode !== 'write' && (
            <div
              ref={preview}
              className="doc-render analysis-preview"
              onClick={onPreviewClick}
              // Escaped by the Markdown reader; blocks are drawn from checked data (notes/export.ts).
              dangerouslySetInnerHTML={{ __html: html || `<p class="dim">${t('notes.editor.empty')}</p>` }}
            />
          )}
        </div>
      </div>
      {chart && <ChartEditor docId={doc.id} blockId={chart.block} onClose={() => setChart(null)} />}
    </div>
  );
}
