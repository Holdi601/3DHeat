/**
 * Made-up test data, generated in the ingest worker and loaded as the dataset.
 *
 * A developer tool: it is how a row count, a sprite radius and a budget are
 * checked against the frame rate before a large real load, and what the smoke
 * tests and performance probes draw. The developer tools panel, the start
 * screen's small "try a sample" link and the test API
 * (`window.__3dheat.generate`) all come through here.
 */

import { t } from '../i18n';
import { useStore } from '../state/store';
import type { Dataset } from '../state/types';
import { loader } from './loader';
import { DEFAULT_SYNTH, type SynthOptions } from './synth';
import { notePick } from '../usage/hooks';

/** Generates `rows` rows (the rest from `DEFAULT_SYNTH`) in the worker and loads them; null when it failed. */
export async function generatePerfData(opts: Partial<SynthOptions> & { rows: number }): Promise<Dataset | null> {
  const { setLoad, setDataset } = useStore.getState();
  // A developer tool, tagged so in the usage statistics (the load that follows is counted as `generator`).
  notePick('generator', [], { dev: true });
  // In the ingest worker: at tens of millions of rows it is seconds of work,
  // and on the main thread that is seconds of frozen UI.
  setLoad({ active: true, label: t('shell.dev.generating'), fraction: 0, rowsSoFar: 0, error: null });
  try {
    const ds = await loader.synth({ ...DEFAULT_SYNTH, ...opts, rows: Math.round(opts.rows) }, (p) =>
      setLoad({ active: true, label: p.label, fraction: p.fraction, rowsSoFar: p.rows }),
    );
    setDataset(ds);
    setLoad({ active: false, label: '', fraction: null, rowsSoFar: ds.count, error: null });
    return ds;
  } catch (err) {
    setLoad({ active: false, label: '', fraction: null, error: err instanceof Error ? err.message : String(err) });
    return null;
  }
}
