/**
 * The external AI's settings: a provider preset (which fills the base URL and
 * the protocol), the base URL, the model - typed, picked from Claude's, or
 * from what the endpoint lists - the key, and whether names go along. The key
 * is a password field; it is kept as `settings.ts` says and nowhere else.
 */

import { useRef, useState } from 'react';
import { t, useLang } from '../../i18n';
import { AiError, ANTHROPIC_MODELS, listModels, PRESETS } from '../../insights/ai/provider';
import { aiConfig, useAi } from '../../insights/ai/settings';
import { Check } from '../controls';

/** A failure in the user's words. */
export function aiErrorText(e: unknown): string {
  if (e instanceof AiError) return t(`insights.ai.err.${e.code}`, { detail: '', status: '', url: '', origin: '', ...e.values }).trim();
  if ((e as Error)?.name === 'AbortError') return t('insights.ai.cancelled');
  return String((e as Error)?.message ?? e);
}

export function AiSettingsButton() {
  useLang();
  const [open, setOpen] = useState(false);
  return (
    <span className="ins-ai-anchor">
      <button onClick={() => setOpen((o) => !o)} title={t('insights.ai.settingsTitle')} aria-expanded={open}>
        {t('insights.ai.settings')}
      </button>
      {open && <AiSettingsDialog onClose={() => setOpen(false)} />}
    </span>
  );
}

function AiSettingsDialog({ onClose }: { onClose: () => void }) {
  const s = useAi();
  const preset = PRESETS.find((p) => p.id === s.preset) ?? PRESETS[PRESETS.length - 1];
  const [listing, setListing] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const ctl = useRef<AbortController | null>(null);
  const models = s.kind === 'anthropic' ? [...new Set([...ANTHROPIC_MODELS, ...s.models])] : s.models;

  const list = () => {
    ctl.current?.abort();
    const c = new AbortController();
    ctl.current = c;
    setListing(true);
    setNote(null);
    listModels(aiConfig(), c.signal)
      .then((m) => {
        useAi.getState().set({ models: m, ...(m.length && !s.model ? { model: m[0] } : {}) });
        setNote(t('insights.ai.modelsFound', { n: m.length }));
      })
      .catch((e) => setNote(aiErrorText(e)))
      .finally(() => setListing(false));
  };

  return (
    <div className="units-popover ins-ai-dialog" role="dialog" aria-label={t('insights.ai.settings')}>
      <div className="units-popover-title">{t('insights.ai.settings')}</div>
      <Check label={t('insights.ai.enable')} checked={s.enabled} onChange={(enabled) => s.set({ enabled })} />
      <label className="field">
        <span className="label">{t('insights.ai.provider')}</span>
        <select
          value={s.preset}
          onChange={(e) => {
            const p = PRESETS.find((x) => x.id === e.target.value)!;
            s.set({ preset: p.id, kind: p.kind, baseUrl: p.baseUrl || s.baseUrl, model: p.model, models: [] });
            setNote(null);
          }}
        >
          {PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {t(`insights.ai.preset.${p.id}`)}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span className="label">{t('insights.ai.baseUrl')}</span>
        <input type="url" value={s.baseUrl} spellCheck={false} onChange={(e) => s.set({ baseUrl: e.target.value })} />
      </label>
      <label className="field">
        <span className="label">{t('insights.ai.model')}</span>
        <span className="row" style={{ gap: 6 }}>
          <input list="ins-ai-models" value={s.model} spellCheck={false} onChange={(e) => s.set({ model: e.target.value })} style={{ flex: 1, minWidth: 0 }} />
          <button onClick={list} disabled={listing || !s.baseUrl.trim()}>
            {t('insights.ai.listModels')}
          </button>
        </span>
        <datalist id="ins-ai-models">
          {models.map((m) => (
            <option key={m} value={m} />
          ))}
        </datalist>
      </label>
      {note && <div className="hint">{note}</div>}
      <label className="field">
        <span className="label">{preset.key ? t('insights.ai.key') : t('insights.ai.keyLocal')}</span>
        <input type="password" value={s.key} autoComplete="off" spellCheck={false} onChange={(e) => s.set({ key: e.target.value })} />
      </label>
      <div className="hint">{t('insights.ai.keyHint')}</div>
      <Check label={t('insights.ai.remember')} checked={s.remember} onChange={(remember) => s.set({ remember })} />
      <Check label={t('insights.ai.names')} title={t('insights.ai.namesHint')} checked={s.names} onChange={(names) => s.set({ names })} />
      <div className="row" style={{ justifyContent: 'flex-end', marginTop: 6 }}>
        <button onClick={onClose}>{t('insights.ai.close')}</button>
      </div>
    </div>
  );
}
