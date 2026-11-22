/**
 * The person-hit analysis's columns in its worker (docs/person-hits.md): the
 * blocks of every file read, one set of growing columns and one dictionary
 * per text column, and the matches they came from.
 */

import { Dict, GAMES, INT_COLUMNS, NUM_COLUMNS, SOURCE_FIELDS, TEXT_COLUMNS, allocColumns, type PersonBlock, type PersonColumns, type PersonMatch, type TextColumn } from './types';

export class PersonStore {
  cols: PersonColumns = allocColumns(1024);
  /** The match of each hit (an index into `matches`). */
  match = new Uint32Array(1024);
  n = 0;
  readonly matches: PersonMatch[] = [];
  readonly dicts = {} as Record<TextColumn, Dict>;
  readonly maps = new Dict();
  constructor() {
    for (const c of TEXT_COLUMNS) this.dicts[c] = new Dict();
  }

  private grow(need: number): void {
    if (need <= this.cols.n) return;
    let cap = this.cols.n;
    while (cap < need) cap *= 2;
    const next = allocColumns(cap);
    for (const k of NUM_COLUMNS) next.num[k].set(this.cols.num[k].subarray(0, this.n));
    for (const k of INT_COLUMNS) next.int[k].set(this.cols.int[k].subarray(0, this.n));
    for (const k of TEXT_COLUMNS) next.txt[k].set(this.cols.txt[k].subarray(0, this.n));
    for (const k of SOURCE_FIELDS) next.src[k].set(this.cols.src[k].subarray(0, this.n));
    this.cols = next;
    const m = new Uint32Array(cap);
    m.set(this.match.subarray(0, this.n));
    this.match = m;
  }

  add(b: PersonBlock): void {
    const n = b.cols.n;
    if (!n) return;
    this.grow(this.n + n);
    const at = this.n;
    const mi = this.matches.length;
    this.matches.push(b.match);
    this.maps.code(b.match.map);
    for (const k of NUM_COLUMNS) this.cols.num[k].set(b.cols.num[k], at);
    for (const k of INT_COLUMNS) this.cols.int[k].set(b.cols.int[k], at);
    for (const k of SOURCE_FIELDS) this.cols.src[k].set(b.cols.src[k], at);
    for (const k of TEXT_COLUMNS) {
      const local = b.dicts[k];
      const remap = local.map((s) => this.dicts[k].code(s));
      const from = b.cols.txt[k], to = this.cols.txt[k];
      for (let i = 0; i < n; i++) to[at + i] = remap[from[i]];
    }
    this.match.fill(mi, at, at + n);
    this.n += n;
  }

  text(c: TextColumn, i: number): string {
    return this.dicts[c].list[this.cols.txt[c][i]];
  }

  gameOf(i: number): string {
    return GAMES[this.cols.int.game[i]] ?? '';
  }

  mapOf(i: number): string {
    return this.matches[this.match[i]]?.map ?? '';
  }

  /** Bytes the columns hold. */
  bytes(): number {
    return this.cols.n * (NUM_COLUMNS.length * 4 + INT_COLUMNS.length * 2 + TEXT_COLUMNS.length * 4 + SOURCE_FIELDS.length + 4);
  }
}
