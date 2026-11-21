/**
 * Saved views: the analysis as it stands - camera, mode, filters, layers,
 * selection and time - kept with a name and a note, put back with a click,
 * and written to or read from a JSON file (state/savedViews.ts).
 */

import { useRef, useState } from 'react';
import { int, t, useLang } from '../../i18n';
import { applyView, captureView, readViews, useSavedViews, viewsToJson, type SavedView } from '../../state/savedViews';
import { useStore } from '../../state/store';
import { Section } from '../controls';
import { useEngine } from '../EngineContext';
import '../heatInspect/heatInspect.css';

export function ViewsPanel() {
  useLang();
  const engine = useEngine();
  const dataset = useStore((s) => s.dataset);
  const views = useSavedViews((s) => s.views);
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const file = useRef<HTMLInputElement>(null);

  const save = () => {
    if (!engine) return;
    useSavedViews.getState().add(name || t('analysis.views.defaultName', { n: views.length + 1 }), note, dataset?.name ?? '', captureView(engine));
    setName('');
    setNote('');
    setMessage(null);
  };
  const open = (v: SavedView) => {
    if (!engine) return;
    const missing = applyView(engine, v.view);
    setMessage(missing.length ? t('analysis.views.missing', { list: missing.join(', ') }) : t('analysis.views.restored', { name: v.name }));
  };
  const exportAll = () => {
    const blob = new Blob([viewsToJson(views)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = '3dheat-views.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const importFile = async (f: File | undefined) => {
    if (!f) return;
    try {
      const n = useSavedViews.getState().merge(readViews(JSON.parse(await f.text())));
      setMessage(t('analysis.views.imported', { n: int(n) }));
    } catch {
      setMessage(t('analysis.views.importFailed'));
    }
  };

  return (
    <Section title={t('analysis.views.title')}>
      <div className="hint">{t('analysis.views.hint')}</div>
      <input type="text" value={name} placeholder={t('analysis.views.name')} onChange={(e) => setName(e.target.value)} aria-label={t('analysis.views.name')} />
      <textarea className="view-note" rows={2} value={note} placeholder={t('analysis.views.note')} onChange={(e) => setNote(e.target.value)} aria-label={t('analysis.views.note')} />
      <div className="row" style={{ gap: 4 }}>
        <button onClick={save} disabled={!engine}>
          {t('analysis.views.save')}
        </button>
      </div>
      {views.length === 0 && <div className="hint">{t('analysis.views.none')}</div>}
      <ul className="saved-views">
        {views.map((v) => (
          <li key={v.id} className={editing === v.id ? 'editing' : ''}>
            {editing === v.id ? (
              <ViewEditor v={v} done={() => setEditing(null)} />
            ) : (
              <>
                <div className="row" style={{ gap: 4, alignItems: 'baseline' }}>
                  <button className="link view-name" onClick={() => open(v)} title={t('analysis.views.openTitle')}>
                    {v.name}
                  </button>
                  <span className="dim">{modeLabel(v.view.mode)}</span>
                  <span style={{ flex: 1 }} />
                  <button
                    className="link"
                    onClick={() => engine && useSavedViews.getState().update(v.id, { view: captureView(engine) })}
                    title={t('analysis.views.updateTitle')}
                  >
                    ⟳
                  </button>
                  <button className="link" onClick={() => setEditing(v.id)} title={t('analysis.views.edit')}>
                    ✎
                  </button>
                  <button
                    className="link"
                    onClick={() => {
                      if (window.confirm(t('analysis.views.deleteConfirm', { name: v.name }))) useSavedViews.getState().remove(v.id);
                    }}
                    title={t('analysis.views.delete')}
                  >
                    ×
                  </button>
                </div>
                <div className="dim">
                  {new Date(v.savedAt).toLocaleString()}
                  {v.dataset ? ` · ${v.dataset}` : ''}
                </div>
                {v.note && <div className="view-note-text">{v.note}</div>}
              </>
            )}
          </li>
        ))}
      </ul>
      <div className="row" style={{ gap: 4 }}>
        <button onClick={exportAll} disabled={!views.length}>
          {t('analysis.views.export')}
        </button>
        <button onClick={() => file.current?.click()}>{t('analysis.views.import')}</button>
        <input ref={file} type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={(e) => void importFile(e.target.files?.[0])} />
      </div>
      {message && <div className="hint">{message}</div>}
    </Section>
  );
}

const MODE_KEYS: Record<string, string> = {
  'heat-simple': 'app.mode.heat.label',
  'heat-difference': 'app.mode.difference.label',
  'heat-teams': 'app.mode.teamHeat.label',
  'heat-lines': 'app.mode.lineHeat.label',
  team: 'app.mode.overlay.label',
};
const modeLabel = (m: string) => (MODE_KEYS[m] ? t(MODE_KEYS[m]) : m);

function ViewEditor({ v, done }: { v: SavedView; done: () => void }) {
  const [name, setName] = useState(v.name);
  const [note, setNote] = useState(v.note);
  return (
    <div>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} aria-label={t('analysis.views.name')} />
      <textarea className="view-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} aria-label={t('analysis.views.note')} />
      <div className="row" style={{ gap: 4 }}>
        <button
          onClick={() => {
            useSavedViews.getState().update(v.id, { name, note });
            done();
          }}
        >
          {t('analysis.views.apply')}
        </button>
        <button onClick={done}>{t('analysis.views.cancel')}</button>
      </div>
    </div>
  );
}
