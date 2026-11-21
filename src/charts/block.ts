/**
 * A chart as a block of an analysis document: what it shows (`spec`), where
 * its rows came from, and a snapshot of its data, so a document opened
 * without the data still shows the chart as it was sent.
 *
 * The documents (notes) register a sink with `registerChartBlockSink`; a sign's
 * "Send to document" hands its block to it. Without a sink the block is
 * copied to the clipboard as JSON (`heat3d.chartBlock/1`), to paste anywhere
 * that reads it.
 */

import type { ChartData, ChartSpec } from './types';

export interface ChartBlock {
  schema: 'heat3d.chartBlock/1';
  type: 'chart';
  id: string;
  title: string;
  spec: ChartSpec;
  /** The rows behind it: the volume (by id and name), the dataset by name, the scope said in words. */
  source: { kind: 'volume'; volumeId: string; volumeName: string; dataset: string; scope: string };
  /** The data as it was drawn, labels already in words and colours set. */
  data: ChartData;
  /** Milliseconds since 1970. */
  at: number;
}

type Sink = (b: ChartBlock) => boolean | Promise<boolean>;
let sink: Sink | null = null;

/** Where blocks go (the notes' documents). Returns the unregister function. */
export function registerChartBlockSink(s: Sink): () => void {
  sink = s;
  return () => {
    if (sink === s) sink = null;
  };
}

/** Whether a document takes blocks now. */
export function hasChartBlockSink(): boolean {
  return sink !== null;
}

/** Send a block to the documents; false when none took it (the caller copies it instead). */
export async function sendChartBlock(b: ChartBlock): Promise<boolean> {
  if (!sink) return false;
  try {
    return await sink(b);
  } catch {
    return false;
  }
}

export function isChartBlock(v: unknown): v is ChartBlock {
  const b = v as Partial<ChartBlock>;
  return !!b && b.schema === 'heat3d.chartBlock/1' && b.type === 'chart' && !!b.spec && !!b.data && Array.isArray(b.data.groups);
}
