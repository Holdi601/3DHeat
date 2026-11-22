/**
 * One file's hits on people, whichever game wrote it (docs/person-hits.md):
 *
 * - a Counter-Strike 2 match table (`.parquet`): the `hurt`, `kill` and
 *   `position` rows only (`readCs2.ts`);
 * - a Rainbow Six Siege `.3dheat`: the kills, deaths and samples (`readR6.ts`);
 * - a Squad table: the casualties (`readSquad.ts`);
 * - a VALORANT game data file or an Arma 3 OCAP recording (`.json`,
 *   `.json.gz`): parsed whole (`readValorant.ts`, `readOcap.ts`).
 *
 * Only the rows and columns a hit needs are decoded from a table. Null when
 * the file holds no hits on people.
 */

import { isContainer, openContainer } from '../data/container';
import type { RowFilterClause } from '../data/rowFilter';
import { CS2_EVENTS, CS2_NUMBERS, CS2_TEXTS, extractCs2Hits, isCs2Table } from './readCs2';
import { extractR6Hits, isR6Table, R6_EVENTS, R6_NUMBERS, R6_TEXTS } from './readR6';
import { extractSquadHits, isSquadTable, SQUAD_EVENTS, SQUAD_NUMBERS, SQUAD_TEXTS } from './readSquad';
import { isValorantGame, valorantHits } from './readValorant';
import { isOcapRecording, ocapHits } from './readOcap';
import { readTable, tableMeta } from './table';
import type { PersonBlock, PersonMatch } from './types';

/** The files a person-hit load takes. */
export const PERSON_FILES = /\.(3dheat|parquet|json|json\.gz)$/i;

async function textOf(file: File): Promise<string> {
  if (!/\.gz$/i.test(file.name)) return file.text();
  const stream = file.stream().pipeThrough(new DecompressionStream('gzip'));
  return new Response(stream).text();
}

function baseMatch(file: File, index: number): PersonMatch {
  return { id: file.name.replace(/\.(3dheat|parquet|json\.gz|json)$/i, ''), file: index, game: '', map: '', mode: '', started: NaN, converterVersion: '', gameVersion: '' };
}

export async function scanPersonFile(file: File, index: number): Promise<PersonBlock | null> {
  const t0 = performance.now();
  const match = baseMatch(file, index);
  if (/\.json(\.gz)?$/i.test(file.name)) {
    const doc = JSON.parse(await textOf(file)) as unknown;
    let block: PersonBlock | null = null;
    if (isValorantGame(doc)) block = valorantHits(doc, match);
    else if (isOcapRecording(doc)) block = ocapHits(doc, match);
    if (!block || !block.cols.n) return null;
    return { ...block, ms: performance.now() - t0 };
  }
  let table: File | null = file;
  let game = '';
  if (isContainer(file.name)) {
    const c = await openContainer(file);
    const m = c.manifest;
    table = c.table;
    game = m.game ?? '';
    match.id = m.match ?? match.id;
    match.map = m.map ?? '';
    match.mode = m.mode ?? '';
    match.started = m.started ? Date.parse(m.started) : NaN;
    match.converterVersion = m.converter?.version ?? '';
  }
  if (!table) return null;
  const { meta, available } = await tableMeta(table);
  const rows = Number(meta.num_rows);
  const read = (events: string[], numbers: string[], texts: string[]) => {
    const clause: RowFilterClause[] = [{ column: 'event', kind: 'set', values: events }];
    return readTable(table!, meta, available, clause, numbers, [...texts, 'map', 'match']);
  };
  let block: PersonBlock | null = null;
  if (isCs2Table(available)) {
    const c = await read(CS2_EVENTS, CS2_NUMBERS, CS2_TEXTS);
    const mapCol = c.txt.map;
    if (!match.map && mapCol && c.rows) match.map = mapCol.dict[mapCol.ids[0]];
    match.game = 'cs2';
    block = extractCs2Hits(c, match);
    block.kept = c.rows;
  } else if (isR6Table(available, game)) {
    const c = await read(R6_EVENTS, R6_NUMBERS, R6_TEXTS);
    block = extractR6Hits(c, match);
    block.kept = c.rows;
  } else if (isSquadTable(available)) {
    const c = await read(SQUAD_EVENTS, SQUAD_NUMBERS, SQUAD_TEXTS);
    block = extractSquadHits(c, match);
    block.kept = c.rows;
  }
  if (!block || !block.cols.n) return null;
  return { ...block, rows, ms: performance.now() - t0 };
}
