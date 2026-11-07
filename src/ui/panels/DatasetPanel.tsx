import { useState } from 'react';
import { loader } from '../../data/loader';
import { DEFAULT_SYNTH, formatCount } from '../../data/synth';
import { useStore } from '../../state/store';
import { NumberField, Section } from '../controls';
import { num, t } from '../../i18n';

/**
 * Dataset source. The synthetic generator is not a toy — it is how you check
 * whether a given sprite radius and budget hold 60fps at a target row count
 * before committing a real 40GB ingest to it.
 */
export function DatasetPanel() {
  const dataset = useStore((s) => s.dataset);
  const setDataset = useStore((s) => s.setDataset);
  const load = useStore((s) => s.load);
  const setLoad = useStore((s) => s.setLoad);

  const [rowsM, setRowsM] = useState(8);
  const [teams, setTeams] = useState(DEFAULT_SYNTH.teams);
  const [perTeam, setPerTeam] = useState(DEFAULT_SYNTH.playersPerTeam);
  const [extent, setExtent] = useState(DEFAULT_SYNTH.extent);

  // Generation runs in the ingest worker: at tens of millions of rows it is
  // seconds of work, and on the main thread that is seconds of frozen UI.
  const generate = async () => {
    setLoad({ active: true, label: t('heat.datasetPanel.generating'), fraction: 0, rowsSoFar: 0, error: null });
    try {
      const ds = await loader.synth(
        {
          ...DEFAULT_SYNTH,
          rows: Math.round(rowsM * 1e6),
          teams,
          playersPerTeam: perTeam,
          extent,
        },
        (p) => setLoad({ active: true, label: p.label, fraction: p.fraction, rowsSoFar: p.rows }),
      );
      setDataset(ds);
      setLoad({ active: false, label: '', fraction: null, rowsSoFar: ds.count, error: null });
    } catch (err) {
      setLoad({
        active: false,
        label: '',
        fraction: null,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  };

  const estBytes = Math.round(rowsM * 1e6) * 26;

  return (
    <Section
      title={t('heat.datasetPanel.title')}
      defaultOpen
      right={
        dataset ? <span style={{ color: 'var(--text-faint)' }}>{formatCount(dataset.count)}</span> : null
      }
    >
      {dataset && (
        <div className="hint">
          {dataset.name}
          <br />
          {t('heat.datasetPanel.summary', {
            teams: dataset.teamLabels.length,
            persons: dataset.personLabels.length,
            span: num(dataset.timeRange[1] - dataset.timeRange[0], 0),
          })}
        </div>
      )}
      {/* What the load decided differently, kept visible for as long as the
          dataset is: an empty Groups panel needs its reason to hand. */}
      {dataset && dataset.warnings.length > 0 && (
        <div className="hint" style={{ color: 'var(--warm)' }}>
          {dataset.warnings.map((w, i) => (
            <div key={i}>· {w}</div>
          ))}
        </div>
      )}

      <div className="field">
        <div className="label">
          <span>{t('heat.datasetPanel.synthetic')}</span>
        </div>
        <div className="hint">{t('heat.datasetPanel.syntheticHint')}</div>
      </div>

      <NumberField label={t('heat.datasetPanel.rowsMillions')} value={rowsM} step={1} onChange={setRowsM} />
      <div className="row">
        <NumberField
          label={t('heat.datasetPanel.teams')}
          value={teams}
          onChange={(v) => setTeams(Math.max(1, Math.round(v)))}
        />
        <NumberField
          label={t('heat.datasetPanel.perTeam')}
          value={perTeam}
          onChange={(v) => setPerTeam(Math.max(1, Math.round(v)))}
        />
      </div>
      <NumberField label={t('heat.datasetPanel.halfExtent')} value={extent} step={100} onChange={setExtent} />
      <div className="hint">
        {t('heat.datasetPanel.memory', { ram: num(estBytes / 1e9, 2), gpu: num((rowsM * 1e6 * 8) / 1e9, 2) })}
      </div>

      <button className="primary" disabled={load.active} onClick={() => void generate()}>
        {load.active ? t('heat.datasetPanel.busy', { label: load.label }) : t('heat.datasetPanel.generate')}
      </button>

      {load.active && load.fraction !== null && (
        <div className="bar">
          <div style={{ width: `${(load.fraction * 100).toFixed(1)}%` }} />
        </div>
      )}
      {load.error && <div className="err">{load.error}</div>}

      {dataset && (
        <button onClick={() => setDataset(null)} disabled={load.active}>
          {t('heat.datasetPanel.unload')}
        </button>
      )}
    </Section>
  );
}
