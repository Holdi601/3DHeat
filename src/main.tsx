import { createRoot } from 'react-dom/client';
import { App } from './App';
import { startLanguage } from './i18n';
import { applyMotionVars } from './ui/motion';
import { applyTheme } from './ui/shell/shellStore';
import { useVersus } from './ui/versus/VersusPanel';
import { useStore } from './state/store';
import { useInspectStore } from './state/inspectStore';
import { DEFAULT_SYNTH, generateSynthetic } from './data/synth';
import { VIEW_PRESETS } from './render/camera';
import { mixTeamColor, teamHeatColor } from './render/colors';
import { CURVE_PRESETS, evalCurve } from './state/curve';
import { installColumnDemand } from './data/columnStore';
import './app.css';

// The columns on demand follow the view: read what it uses, evict what it does not (data/columnStore).
installColumnDemand(useStore);

const el = document.getElementById('root');
if (!el) throw new Error('#root missing');

if (import.meta.env.DEV) {
  // Handle for automated smoke tests and console poking. Dev only — the point is
  // to drive the app without going through the UI, including loading real files
  // through the real worker pipeline rather than a stubbed one.
  (window as unknown as Record<string, unknown>).__3dheat = {
    useStore,
    useInspectStore,
    useVersus,
    /**
     * The app's own instances of modules a probe drives (tools/smoke-analysis.mjs):
     * importing their URL from the page gets a second copy once the dev server has
     * versioned them, and its stores are not the app's.
     */
    modules: {
      'insights/run': () => import('./insights/run'),
      'insights/store': () => import('./insights/store'),
      'insights/highlight': () => import('./insights/highlight'),
      'volumes/store': () => import('./volumes/store'),
      'volumes/scope': () => import('./volumes/scope'),
      'state/replayStore': () => import('./state/replayStore'),
      'ui/replay/engagements': () => import('./ui/replay/engagements'),
      'render/volumeContours': () => import('./render/volumeContours'),
      'ui/insights/cinemaStore': () => import('./ui/insights/cinemaStore'),
      'render/record': () => import('./render/record'),
      'data/loader': () => import('./data/loader'),
      'data/columnStore': () => import('./data/columnStore'),
      'render/filterTables': () => import('./render/filterTables'),
      'state/levelLayoutsStore': () => import('./state/levelLayoutsStore'),
      'state/spawnDisplayStore': () => import('./state/spawnDisplayStore'),
      'volumes/signs/store': () => import('./volumes/signs/store'),
      'volumes/signs/client': () => import('./volumes/signs/client'),
      'ui/shell/shellStore': () => import('./ui/shell/shellStore'),
      'notes/store': () => import('./notes/store'),
      'notes/export': () => import('./notes/export'),
      'notes/capture': () => import('./notes/capture'),
      'ui/notes/actions': () => import('./ui/notes/actions'),
      'ui/replay/units': () => import('./ui/replay/units'),
    } as Record<string, () => Promise<unknown>>,
    generateSynthetic,
    DEFAULT_SYNTH,
    CURVE_PRESETS,
    VIEW_PRESETS,
    evalCurve,
    // The team palette, so a probe can compare what reached the screen against
    // what the palette says it should be rather than against a hand-copied hex
    // value. There are three implementations of this arithmetic — here, in WGSL
    // and in GLSL — and the only way to know the three agree is to check the two
    // on the GPU against this one.
    teamHeatColor,
    mixTeamColor,
    load: (rows: number) =>
      useStore.getState().setDataset(generateSynthetic({ ...DEFAULT_SYNTH, rows })),

    /** Fetch files the dev server is serving and ingest them for real. */
    async loadUrls(urls: string[], stride = 1) {
      const { loader } = await import('./data/loader');
      const { autoMap } = await import('./data/automap');
      const files: File[] = [];
      for (const url of urls) {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
        const blob = await res.blob();
        files.push(new File([blob], url.split('/').pop() ?? 'data', { type: blob.type }));
      }
      const preview = await loader.preview(files[0]);
      const mapping = autoMap({
        columns: preview.columns,
        rows: preview.rows,
        numeric: preview.numeric,
        logicalTypes: preview.logicalTypes,
        hints: preview.hints,
        constant: preview.constant,
        fileCount: files.length,
      });
      const size = await loader.measure(files);
      const dataset = await loader.ingest(
        files,
        mapping,
        preview.columns,
        `smoke (${files.length})`,
        stride,
        size.rows,
      );
      const { prepareUnits } = await import('./ui/replay/units');
      await prepareUnits(dataset);
      useStore.getState().setDataset(dataset);
      return {
        rows: dataset.count,
        entities: dataset.personLabels.length,
        groups: dataset.teamLabels.length,
        hasTime: !!dataset.time,
        hasLifetime: !!dataset.lifetime,
        mapping: {
          x: mapping.x,
          y: mapping.y,
          z: mapping.z,
          time: mapping.time,
          person: mapping.personId,
          team: mapping.teamId,
          session: mapping.sessionId,
          look: mapping.lookMode,
          axes: mapping.axes,
          extra: mapping.extra,
        },
      };
    },
  };
}

// Deliberately not wrapped in StrictMode: its double-invoked effects would
// build and tear down the WebGL context and every GPU resource twice on mount,
// which for a dataset of this size is seconds of wasted upload. The language
// first - the browser's, or the one picked - so the first frame is in it.
void startLanguage()
  .catch(() => undefined)
  .then(() => {
    applyMotionVars();
    applyTheme();
    createRoot(el).render(<App />);
  });
