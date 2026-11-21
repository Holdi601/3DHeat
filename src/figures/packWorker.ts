/**
 * Pack figures (`figurepack.ts`: a local figure pack's figures and the model
 * packs' units) built off the page's thread: fetched, decoded and built here,
 * full, coarse and far, with their meshes, and handed over whole without a
 * copy. The page adopts them a few at a time (`packModels.ts`); built there, a
 * model took tens of milliseconds of the frame it arrived in, and sixty of
 * them arrived while a recording played.
 */

import { CATALOG, figurePackReady } from "./catalog";
import { loadPackFigures, packFigureLoaded } from "./figurepack";
import { meshOf } from "./instances";
import type { Template } from "./kit";

export interface PackAsk {
  name: string;
}

/** A template without its coarse and far builds (those come as their own). */
export type PlainTemplate = Omit<Template, "coarse" | "far">;

export interface PackMesh {
  data: Float32Array;
  count: number;
}

export interface PackAnswer {
  name: string;
  /**
   * The figure's builds, each once: the full one first. Absent: the figure could not be had (no data, or it failed
   * to build); it stays the figure it stands in for.
   */
  lods?: PlainTemplate[];
  /** Each build's mesh, as `lods`. */
  meshes?: PackMesh[];
  /** Which of `lods` the coarse and far builds are (-1: the figure has none). */
  coarse?: number;
  far?: number;
  error?: string;
}

const ARRAYS = ["team", "fixed", "teamN", "fixedN", "teamJ", "fixedJ"] as const;

self.onmessage = async (e: MessageEvent<PackAsk>) => {
  const name = e.data.name;
  const post = (a: PackAnswer, transfer: Transferable[] = []) =>
    (self as unknown as Worker).postMessage(a, transfer);
  await figurePackReady;
  await loadPackFigures([name]);
  const entry = CATALOG[name];
  if (!entry || !packFigureLoaded(name)) {
    post({ name });
    return;
  }
  try {
    const t = entry.build();
    const c = t.coarse?.() ?? null;
    const f = t.far?.() ?? null;
    const transfer = new Set<ArrayBuffer>();
    // Each array copied into its own buffer before it is handed over: a build may share its arrays with what it
    // keeps (a hybrid's built hull).
    const plain = (x: Template | null): PlainTemplate | null => {
      if (!x) return null;
      const { coarse: _c, far: _f, ...rest } = x;
      const out: PlainTemplate = { ...rest };
      for (const k of ARRAYS) {
        const a = out[k];
        if (!a) continue;
        const own = a.slice();
        transfer.add(own.buffer as ArrayBuffer);
        (out as Record<string, unknown>)[k] = own;
      }
      return out;
    };
    const mesh = (x: Template | null): PackMesh | null => {
      if (!x) return null;
      // Made for this build alone (`meshOf` keeps it with the template, which goes nowhere else).
      const m = meshOf(x);
      transfer.add(m.data.buffer as ArrayBuffer);
      return { data: m.data, count: m.count };
    };
    const lods = [t];
    const at = (x: Template | null) =>
      x ? (lods.includes(x) ? lods.indexOf(x) : lods.push(x) - 1) : -1;
    const coarse = at(c);
    const far = at(f);
    post(
      {
        name,
        lods: lods.map((x) => plain(x)!),
        meshes: lods.map((x) => mesh(x)!),
        coarse,
        far,
      },
      [...transfer],
    );
  } catch (err) {
    post({ name, error: String(err) });
  }
};
