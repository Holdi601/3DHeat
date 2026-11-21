/**
 * A chart block made elsewhere in the viewer - a volume's sign "sent to the
 * document" - in the shared chart module's form (`heat3d.chartBlock/1`: a
 * title, its spec, where its rows came from, and its data as groups x series
 * of values). A document keeps it as it came and draws its data the way its
 * own chart blocks are drawn; it needs no data loaded to show it.
 *
 * Read here by its shape only, so the documents take such blocks whether or
 * not the chart module that makes them is loaded: `takeChartBlock`
 * (ui/notes/actions.ts) is the sink a sender registers, and a block pasted as
 * JSON into an analysis's text goes in the same way.
 */

import type { ExprChartData } from '../charts/exprSpec';

export interface SharedChartBlock {
  schema: 'heat3d.chartBlock/1';
  type: 'chart';
  id?: string;
  title: string;
  spec: unknown;
  source?: { dataset?: string; volumeName?: string; scope?: string };
  data: {
    kind?: string;
    groups: { key: string; label: string }[];
    series: { key: string; label: string }[];
    values: number[][];
    valueLabel?: string;
    rows?: number;
  };
  at?: number;
}

const entity = (v: unknown) => !!v && typeof v === 'object' && typeof (v as { label?: unknown }).label === 'string';

/** Whether a value is such a block (from a sender, a file or the clipboard). */
export function isSharedChartBlock(v: unknown): v is SharedChartBlock {
  const b = v as Partial<SharedChartBlock> | null;
  if (!b || typeof b !== 'object' || b.schema !== 'heat3d.chartBlock/1' || b.type !== 'chart') return false;
  const d = b.data;
  return !!d && Array.isArray(d.groups) && Array.isArray(d.series) && Array.isArray(d.values) && d.groups.every(entity) && d.series.every(entity) && d.values.every((r) => Array.isArray(r));
}

/** A label as words: the module's message keys (`@other`, `@inside`...) without their mark. */
const words = (l: string) => (l.startsWith('@') ? l.slice(1).replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase() : l);

/** The block's data in the documents' own chart form, to draw and to tabulate. */
export function sharedChartData(b: SharedChartBlock): ExprChartData {
  const d = b.data;
  const labels = d.groups.map((g) => words(g.label)).slice(0, 500);
  return {
    labels,
    series: d.series.slice(0, 8).map((s, i) => ({ label: words(s.label), values: labels.map((_, k) => Number(d.values[i]?.[k] ?? NaN)) })),
    unit: '',
    rows: typeof d.rows === 'number' ? d.rows : 0,
    at: typeof b.at === 'number' ? b.at : 0,
    dataset: b.source?.dataset ?? '',
  };
}

/** The draw kind the documents know for the module's kinds. */
export function sharedChartKind(b: SharedChartBlock): string {
  const k = b.data.kind ?? '';
  return k === 'line' || k === 'area' ? 'line' : k === 'tiles' ? 'tiles' : 'bar';
}
