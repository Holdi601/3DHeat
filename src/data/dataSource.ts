/**
 * Where the viewer's data comes from, behind one interface.
 *
 * Everything that loads data goes through a `DataSource` (`loader` in
 * `loader.ts`): previews, sizes, column profiles, pre-filter counts and loads.
 * Two exist today and a third is planned:
 *
 *   - `local`: the browser reads the files itself, in its ingest worker;
 *   - `native`: in the native app, the same worker with the app's Rust core
 *     reading the files (`data/native`, `docs/native-app.md`);
 *   - later, a host: a browser client of a multiplayer session asks the host's
 *     core over WSS, with the same protocol the native app uses inside.
 *
 * All of them give the same datasets for the same files: the native readers are
 * held to the web app's by parity tests.
 */

import type { ColumnMapping, Dataset } from '../state/types';
import type { ColumnProfile } from './columnProfile';
import type { MatchCount, RowFilterClause } from './rowFilter';
import type { SelectionSize, SourcePreview } from './sourcePreview';
import type { SynthOptions } from './synth';
import type { LoaderProgress, ParseBudget } from './loader';

export interface DataSource {
  readonly kind: 'local' | 'native';
  preview(file: File, delimiter?: string): Promise<SourcePreview>;
  /** Exact row totals from Parquet footers; estimates for CSV. */
  measure(files: File[]): Promise<SelectionSize>;
  /** Every column of a Parquet file, for the pre-filter and the column costs. */
  profile(file: File): Promise<ColumnProfile[]>;
  /** Rows a row filter keeps across a selection; a sample past `timeMs`. */
  count(files: File[], clauses: RowFilterClause[], timeMs?: number): Promise<MatchCount>;
  ingest(
    files: File[],
    mapping: ColumnMapping,
    columns: string[],
    name: string,
    stride: number,
    expectedRows: number,
    onProgress?: (p: LoaderProgress) => void,
    budget?: ParseBudget,
  ): Promise<Dataset>;
  synth(opts: SynthOptions, onProgress?: (p: LoaderProgress) => void): Promise<Dataset>;
  /** Cancels whatever is running. */
  dispose(): void;
}
