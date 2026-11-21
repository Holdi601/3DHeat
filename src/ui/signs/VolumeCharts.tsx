/**
 * The selected volume's charts in the Volumes panel: each sign's chart drawn
 * again with the shared `ChartView` (in the panel's theme), a click on a mark
 * filtering the view as it does on the sign, and "Add chart". The charts in
 * the world are the same charts; this is where they are found by list.
 */

import { useEffect, useState } from 'react';
import { ChartView } from '../../charts/ChartView';
import { t } from '../../i18n';
import { signClient } from '../../volumes/signs/client';
import { useSignStore } from '../../volumes/signs/store';
import type { Volume } from '../../volumes/volume';
import { Check } from '../controls';
import { addChartTo } from './addChart';
import { applyMarkFilter } from './markFilter';
import { signTitle } from './signText';

/** Re-render when any of these signs' charts change. */
function useResults(ids: string[]): number {
  const [n, setN] = useState(0);
  const key = ids.join('|');
  useEffect(() => {
    const want = new Set(key ? key.split('|') : []);
    return signClient.subscribe((dirty) => {
      for (const id of dirty) if (want.has(id)) return setN((x) => x + 1);
    });
  }, [key]);
  return n;
}

export function VolumeCharts({ volume }: { volume: Volume }) {
  const signs = useSignStore((s) => s.signs).filter((s) => s.volumeId === volume.id);
  const hidden = useSignStore((s) => s.hidden);
  useResults(signs.map((s) => s.id));
  return (
    <div className="vsign-section">
      <h4 style={{ margin: '10px 0 4px' }}>{t('charts.vol.title')}</h4>
      {signs.length === 0 && <div className="hint">{t('charts.vol.none')}</div>}
      {signs.map((s) => {
        const d = signClient.results.get(s.id);
        return (
          <div key={s.id} className="vsign-preview">
            <button type="button" className="vsign-item-name" title={t('charts.panel.editTitle')} onClick={() => useSignStore.getState().openEditor(volume.id, s.id)}>
              {signTitle(s)}
            </button>
            {d ? <ChartView data={d} width={296} height={150} table={s.table} onPick={(e) => e.filter && applyMarkFilter(e.filter, e.label)} /> : <div className="hint">{t('charts.sign.counting')}</div>}
          </div>
        );
      })}
      <div className="row" style={{ gap: 6, alignItems: 'center' }}>
        <button type="button" onClick={() => addChartTo(volume.id)} title={t('charts.vol.addTitle')}>
          {t('charts.vol.add')}
        </button>
        {signs.length > 0 && <Check label={t('charts.vol.show')} checked={!hidden} onChange={(v) => useSignStore.getState().setHidden(!v)} />}
      </div>
    </div>
  );
}
