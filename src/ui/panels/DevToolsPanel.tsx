import { useState } from 'react';
import { DEFAULT_SYNTH } from '../../data/synth';
import { generatePerfData } from '../../data/perfData';
import { useStore } from '../../state/store';
import { NumberField, Section } from '../controls';
import { num, t } from '../../i18n';
import { useDevTools } from '../shell/shellStore';

/**
 * The developer tools: what is there to check the viewer's performance and to
 * debug it, not to analyse anything. Hidden until the setting (the gear) or
 * `?dev` in the address turns them on; then a closed section under the Load
 * group's More. The full frame readout over the view, the sprite budget and
 * refinement switches of the Performance panel, the sprite pixel clamps and
 * the memory panel's internals show with them (`useDevTools`).
 *
 * Everything carries `data-dev-tool`, so the smoke test can check that none of
 * it is on the page by default.
 */
export function DevToolsPanel() {
  const on = useDevTools();
  if (!on) return null;
  return (
    <div data-dev-tool="panel">
      <Section title={t('shell.dev.title')}>
        <div className="hint">{t('shell.dev.hint')}</div>
        <PerfData />
      </Section>
    </div>
  );
}

/**
 * Made-up test data of any size. Its movement is shaped like a battle royale -
 * teams start apart, then are squeezed together - because uniform noise looks
 * fine at any budget and hides exactly the artefacts worth catching.
 */
function PerfData() {
  const load = useStore((s) => s.load);
  const [rowsM, setRowsM] = useState(8);
  const [teams, setTeams] = useState(DEFAULT_SYNTH.teams);
  const [perTeam, setPerTeam] = useState(DEFAULT_SYNTH.playersPerTeam);
  const [extent, setExtent] = useState(DEFAULT_SYNTH.extent);
  const estBytes = Math.round(rowsM * 1e6) * 26;
  return (
    <Section title={t('shell.dev.perfData')}>
      <div className="hint">{t('shell.dev.perfDataHint')}</div>
      <NumberField label={t('shell.dev.rowsMillions')} value={rowsM} step={1} onChange={setRowsM} />
      <div className="row">
        <NumberField label={t('shell.dev.teams')} value={teams} onChange={(v) => setTeams(Math.max(1, Math.round(v)))} />
        <NumberField label={t('shell.dev.perTeam')} value={perTeam} onChange={(v) => setPerTeam(Math.max(1, Math.round(v)))} />
      </div>
      <NumberField label={t('shell.dev.halfExtent')} value={extent} step={100} onChange={setExtent} />
      <div className="hint">
        {t('shell.dev.memory', { ram: num(estBytes / 1e9, 2), gpu: num((rowsM * 1e6 * 8) / 1e9, 2) })}
      </div>
      <button
        disabled={load.active}
        onClick={() => void generatePerfData({ rows: rowsM * 1e6, teams, playersPerTeam: perTeam, extent })}
      >
        {load.active ? t('shell.dev.busy', { label: load.label }) : t('shell.dev.generate')}
      </button>
      {load.active && load.fraction !== null && (
        <div className="bar">
          <div style={{ width: `${(load.fraction * 100).toFixed(1)}%` }} />
        </div>
      )}
    </Section>
  );
}
