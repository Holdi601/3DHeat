/**
 * Pack figures on the page's thread: asked of a worker (`packWorker.ts`),
 * which fetches, decodes and builds each, and adopted here once all of its
 * meshes are on the GPU (`residency.ts`). Until then a unit keeps the figure
 * its model stands in for; then it changes to the model in one frame. Nothing
 * of a model is fetched, decoded, built or uploaded whole in a frame here: a
 * recording whose sixty models arrived while it played held a frame each
 * time one did.
 *
 * Installed by the engine (`installPackModels`); without it (tests, tools,
 * workers) `figurepack.ts` builds pack figures where it is asked, as before.
 */

import { packFigureArrived, setPackTemplateSource } from "./figurepack";
import { adoptMesh, type FigureMesh } from "./instances";
import type { Template } from "./kit";
import type { PackAnswer } from "./packWorker";
import { afterPlaybackStart, makeResident } from "./residency";

let worker: Worker | null = null;
const adopted = new Map<string, Template>();
const asked = new Map<string, Promise<void>>();
const answers = new Map<string, () => void>();

function adopt(a: PackAnswer): void {
  const done = answers.get(a.name);
  answers.delete(a.name);
  if (!a.lods?.length || !a.meshes || a.meshes.length !== a.lods.length) {
    if (a.error) console.warn(`pack figure ${a.name}: ${a.error}`);
    done?.();
    return;
  }
  const lods: Template[] = a.lods.map((x) => ({ ...x }));
  const meshes: FigureMesh[] = lods.map((t, i) =>
    adoptMesh(t, a.meshes![i].data, a.meshes![i].count),
  );
  const full = lods[0];
  const coarse =
    a.coarse !== undefined && a.coarse >= 0 ? lods[a.coarse] : undefined;
  const far = a.far !== undefined && a.far >= 0 ? lods[a.far] : undefined;
  if (coarse) full.coarse = () => coarse;
  if (far) full.far = () => far;
  makeResident(meshes, () => {
    adopted.set(a.name, full);
    packFigureArrived();
    done?.();
  });
}

function load(names: string[]): Promise<void> {
  const waits: Promise<void>[] = [];
  for (const name of names) {
    if (adopted.has(name)) continue;
    let w = asked.get(name);
    if (!w) {
      w = new Promise<void>((resolve) => answers.set(name, resolve));
      asked.set(name, w);
      // Not into the start of playback: asked once it is over.
      afterPlaybackStart(() => worker?.postMessage({ name }));
    }
    waits.push(w);
  }
  return Promise.all(waits).then(() => undefined);
}

/** Hands the pack worker the packs a session's host shared (`session/sharedPacks.ts`); false without a worker. */
export function postSessionPacks(msg: import("./packWorker").PackInstall): boolean {
  if (!worker) return false;
  worker.postMessage(msg);
  return true;
}

/** How many pack figures were asked of the worker, and how many of them are here whole (for probes). */
export function packModelsState(): {
  asked: number;
  here: number;
  waiting: number;
} {
  return { asked: asked.size, here: adopted.size, waiting: answers.size };
}

/**
 * Pack figures built in a worker from now on (where workers can be made); call once, on the page's thread. Returns
 * whether it took over.
 */
export function installPackModels(): boolean {
  if (worker) return true;
  if (typeof Worker === "undefined" || typeof document === "undefined")
    return false;
  try {
    worker = new Worker(new URL("./packWorker.ts", import.meta.url), {
      type: "module",
    });
  } catch {
    return false;
  }
  worker.onmessage = (e: MessageEvent<PackAnswer>) => adopt(e.data);
  // A worker that cannot run: the figures it was asked for stay their stand-ins, and later ones are built here.
  worker.onerror = () => {
    setPackTemplateSource(null);
    worker = null;
    for (const done of answers.values()) done();
    answers.clear();
  };
  setPackTemplateSource({ get: (name) => adopted.get(name), load });
  return true;
}
