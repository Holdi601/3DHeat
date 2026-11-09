/**
 * Figure models built off the main thread: a kind's template from the
 * catalogue, and its full, coarse and far meshes, handed back as vertex data.
 * A ship or a tank takes up to tens of milliseconds to build, and a recording
 * names dozens of kinds; built here, no frame waits for them
 * (`render/gpuTracks/store.ts` TrackFigures).
 */

import { CATALOG } from './catalog';
import { TemplateCache } from './kit';
import { meshOf, type FigureMesh } from './instances';

export interface ModelAsk {
  kind: string;
}

export interface ModelMesh {
  data: Float32Array;
  count: number;
}

export interface ModelAnswer {
  kind: string;
  /** null: the catalogue has no figure for the kind. */
  models: { full: ModelMesh; coarse: ModelMesh | null; far: ModelMesh | null; longest: number; air: boolean } | null;
  error?: string;
}

const templates = new TemplateCache();
const plain = (m: FigureMesh | null): ModelMesh | null => (m ? { data: m.data, count: m.count } : null);

self.onmessage = (e: MessageEvent<ModelAsk>) => {
  const kind = e.data.kind;
  const post = (a: ModelAnswer) => (self as unknown as Worker).postMessage(a);
  try {
    const entry = CATALOG[kind];
    const t = entry ? templates.get(kind, entry.build) : null;
    if (!t) {
      post({ kind, models: null });
      return;
    }
    const full = meshOf(t);
    const c = t.coarse?.();
    const fa = t.far?.();
    post({
      kind,
      models: {
        full: plain(full)!,
        coarse: plain(c ? meshOf(c) : null),
        far: plain(fa ? meshOf(fa) : null),
        longest: Math.max(t.max[0] - t.min[0], t.max[1] - t.min[1], t.max[2] - t.min[2], 0.1),
        air: t.anchor === 'centre',
      },
    });
  } catch (err) {
    post({ kind, models: null, error: String(err) });
  }
};
