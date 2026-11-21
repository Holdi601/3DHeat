import { formatCount } from '../../data/synth';
import { useStore } from '../../state/store';
import { num, t } from '../../i18n';
import { signed, useGroundFit } from '../../data/groundFitRun';

/**
 * What is loaded: the dataset's name, its groups, persons and span, what the
 * load decided differently, and Unload. At the top of the Source panel, so the
 * first thing the panel says is what the view is showing; nothing at all while
 * nothing is loaded.
 *
 * The test-data generator that used to share this panel is a developer tool
 * now (`DevToolsPanel`): it is how performance is checked, not how anyone
 * starts an analysis.
 */
export function DatasetSummary() {
  const dataset = useStore((s) => s.dataset);
  const setDataset = useStore((s) => s.setDataset);
  const busy = useStore((s) => s.load.active);
  const fit = useGroundFit();
  const fixes = fit.dataset === dataset ? fit.fixes : [];
  if (!dataset) return null;
  return (
    <div className="field dataset-summary" data-testid="dataset-summary">
      <div className="label">
        <span>{t('heat.datasetPanel.loaded')}</span>
        <span className="val">{formatCount(dataset.count)}</span>
      </div>
      <div className="hint">
        <b>{dataset.name}</b>
        <br />
        {t('heat.datasetPanel.summary', {
          teams: dataset.teamLabels.length,
          persons: dataset.personLabels.length,
          span: num(dataset.timeRange[1] - dataset.timeRange[0], 0),
        })}
      </div>
      {/* What the load decided differently, kept visible for as long as the
          dataset is: an empty Groups panel needs its reason to hand. */}
      {dataset.warnings.length > 0 && (
        <div className="hint" style={{ color: 'var(--warm)' }}>
          {dataset.warnings.map((w, i) => (
            <div key={i}>· {w}</div>
          ))}
        </div>
      )}
      {/* Matches whose ground units were lifted onto the level (`data/groundFit.ts`): said for as long as they are shown so. */}
      {fixes.length > 0 && (
        <div className="hint" style={{ color: 'var(--warm)' }}>
          {fixes.map((f) => (
            <div key={f.session}>· {t('heat.groundFit.fixed', { match: f.label || '-', metres: signed(f.metres), spread: num(f.spread, 1) })}</div>
          ))}
        </div>
      )}
      <button className="link" style={{ alignSelf: 'flex-start' }} onClick={() => setDataset(null)} disabled={busy}>
        {t('heat.datasetPanel.unload')}
      </button>
    </div>
  );
}
