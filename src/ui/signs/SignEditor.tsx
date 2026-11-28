/**
 * The chart panel of a volume, opened from its button in the world: the
 * volume's signs, "Add chart", and the chosen sign's chart - its kind, what
 * it measures, what it groups by, what it compares, which rows it keeps, how
 * it sorts - and how it stands in the world. Every change shows on the sign
 * at once; the rows are always those inside this volume, under the view's
 * filters and time window.
 */

import { ShareToggle } from '../session/ShareToggle';
import { sendChartBlock, type ChartBlock } from '../../charts/block';
import { num, t } from '../../i18n';
import { useStore } from '../../state/store';
import { volumeBounds, type Volume } from '../../volumes/volume';
import type { Engine } from '../../render/engine';
import { useEngine } from '../EngineContext';
import { signClient } from '../../volumes/signs/client';
import type { Sign } from '../../volumes/signs/sign';
import { useSignStore } from '../../volumes/signs/store';
import { Check } from '../controls';
import { ChartSpecFields } from '../charts/ChartSpecFields';
import { toast } from '../shell/kit';
import { signTitle } from './signText';
import { addChartTo } from './addChart';

/** Send a sign to the analysis documents as a chart block; without documents, copy it. */
export async function sendSign(sign: Sign, volume: Volume): Promise<void> {
  const d = signClient.results.get(sign.id);
  if (!d) return;
  const ds = useStore.getState().dataset;
  const block: ChartBlock = {
    schema: 'heat3d.chartBlock/1',
    type: 'chart',
    id: `c${Date.now().toString(36)}`,
    title: signTitle(sign),
    spec: sign.spec,
    // The filters and time window it was counted under go with it: a refresh in the document counts the same rows.
    source: { kind: 'volume', volumeId: volume.id, volumeName: volume.name, dataset: ds?.name ?? '', scope: scopeText(), rows: 'saved', view: signClient.rowsNow(sign.upToNow) },
    data: structuredClone(d),
    at: Date.now(),
  };
  if (await sendChartBlock(block)) {
    toast(t('charts.send.sent'));
    return;
  }
  try {
    await navigator.clipboard.writeText(JSON.stringify(block));
    toast(t('charts.send.copied'));
  } catch {
    toast(t('charts.send.failed'), 'bad');
  }
}

function scopeText(): string {
  const s = useStore.getState();
  const parts: string[] = [];
  if (s.timeline.mode !== 'all') parts.push(t('charts.scope.window', { s: num(s.timeline.playhead, 0) }));
  if (s.filters.length) parts.push(t('charts.scope.filters', { n: s.filters.length }));
  return parts.join(', ');
}

export function SignEditor({ volume }: { volume: Volume }) {
  const engine = useEngine();
  const editor = useSignStore((s) => s.editor);
  const signs = useSignStore((s) => s.signs);
  const st = useSignStore.getState();
  const mine = signs.filter((s) => s.volumeId === volume.id);
  const sign = mine.find((s) => s.id === editor?.signId) ?? null;

  const add = () => addChartTo(volume.id);

  const sp = sign?.spec;
  const rows = signClient.rowsInside[volume.id];
  const result = sign ? signClient.results.get(sign.id) : undefined;

  return (
    <div className="vsign-panel" role="dialog" aria-label={t('charts.panel.title', { name: volume.name })}>
      <div className="vsign-panel-head">
        <span className="vsign-swatch" style={{ ['--vol' as string]: volume.color }} />
        <strong>{t('charts.panel.title', { name: volume.name })}</strong>
        <button type="button" className="icon" title={t('charts.panel.close')} onClick={() => st.closeEditor()}>
          ✕
        </button>
      </div>
      <div className="hint">{rows !== undefined ? t('charts.panel.rows', { n: num(rows, 0) }) : t('charts.panel.rowsWait')}</div>
      <div className="vsign-list">
        {mine.map((s) => (
          <div key={s.id} className={`vsign-item${s.id === sign?.id ? ' on' : ''}`}>
            <button type="button" className="vsign-item-name" onClick={() => st.openEditor(volume.id, s.id)} title={t('charts.panel.editTitle')}>
              {signTitle(s)}
            </button>
            <ShareToggle compact isPrivate={!!s.private} onChange={(p) => st.update(s.id, { private: p ? true : undefined })} />
            <button type="button" title={t('charts.sign.removeTitle')} onClick={() => st.remove(s.id)}>
              ✕
            </button>
          </div>
        ))}
        <button type="button" className="primary vsign-add" onClick={add} title={t('charts.panel.addTitle')}>
          {t('charts.panel.add')}
        </button>
      </div>
      {sign && sp && (
        <div className="vsign-form">
          <label className="field">
            <div className="label">
              <span>{t('charts.field.title')}</span>
            </div>
            <input type="text" value={sign.title} placeholder={signTitle({ ...sign, title: '' })} onChange={(e) => st.update(sign.id, { title: e.target.value })} />
          </label>
          <ChartSpecFields spec={sp} onChange={(spec) => st.update(sign.id, { spec })} />
          <div className="field">
            <div className="label">
              <span>{t('charts.field.stand')}</span>
            </div>
            <div className="seg">
              {(['billboard', 'fixed'] as const).map((m) => (
                <button key={m} type="button" className={sign.mode === m ? 'on' : ''} title={t(`charts.mode.${m}Title`)} onClick={() => st.update(sign.id, { mode: m, ...(m === 'fixed' ? { yaw: faceCameraYaw(engine, volume) } : {}) })}>
                  {t(`charts.mode.${m}`)}
                </button>
              ))}
            </div>
          </div>
          {sign.mode === 'fixed' && (
            <button type="button" onClick={() => st.update(sign.id, { yaw: faceCameraYaw(engine, volume) })} title={t('charts.mode.faceTitle')}>
              {t('charts.mode.face')}
            </button>
          )}
          <Check label={t('charts.field.upToNow')} checked={sign.upToNow} title={t('charts.field.upToNowTitle')} onChange={(v) => st.update(sign.id, { upToNow: v })} />
          <div className="row" style={{ gap: 4 }}>
            <button type="button" onClick={() => void sendSign(sign, volume)} title={t('charts.sign.sendTitle')} disabled={!result}>
              {t('charts.send.button')}
            </button>
            <button type="button" onClick={() => st.add(volume.id, sign.spec, { mode: sign.mode, yaw: sign.yaw, scale: sign.scale, upToNow: sign.upToNow })} title={t('charts.panel.duplicateTitle')}>
              {t('charts.panel.duplicate')}
            </button>
          </div>
          {result && <div className="hint">{t('charts.panel.built', { n: num(result.rows, 0) })}</div>}
        </div>
      )}
    </div>
  );
}

/** The heading a board turns to so it faces the camera. */
export function faceCameraYaw(engine: Engine | null, v: Volume): number {
  const c = engine?.cameraPose().position;
  if (!c) return 0;
  const b = volumeBounds(v);
  return Math.atan2(c.x - (b.min[0] + b.max[0]) / 2, c.z - (b.min[2] + b.max[2]) / 2);
}
