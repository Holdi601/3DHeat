/**
 * A reader for the Lua table literals DCS writes its mission files in
 * (`mission = { ["key"] = value, ... }`): strings (with escapes and the
 * backslash-newline DCS uses inside them), numbers, booleans, nil, tables
 * with bracketed, bare-name or positional keys, and comments. Not a Lua
 * interpreter: nothing is run, only data is read.
 *
 * Asked to, it also says where in the text each table and each of its
 * entries stands (`LuaSpans`), so a writer can change one value of a mission
 * and leave every other byte as it was (`missions/dcsWrite.ts`).
 */

export type LuaValue = string | number | boolean | null | LuaTable;
export interface LuaTable {
  [key: string]: LuaValue;
}

/** A Lua table as a JS array of its positional values 1..n, in order (a table without them: its values). */
export function luaList(v: LuaValue | undefined): LuaValue[] {
  if (!v || typeof v !== 'object') return [];
  const keys = Object.keys(v)
    .filter((k) => /^\d+$/.test(k))
    .map(Number)
    .sort((a, b) => a - b);
  return keys.length ? keys.map((k) => v[String(k)]) : Object.values(v);
}

export const luaNum = (v: LuaValue | undefined, d = 0): number => (typeof v === 'number' && Number.isFinite(v) ? v : d);
export const luaStr = (v: LuaValue | undefined, d = ''): string => (typeof v === 'string' ? v : typeof v === 'number' ? String(v) : d);
export const luaTable = (v: LuaValue | undefined): LuaTable | null => (v && typeof v === 'object' ? v : null);

/** Where an entry of a table stands in the text: its key (or its value, for a positional one) to just past its separator. */
export interface LuaEntrySpan {
  /** Where the entry begins: its key, or its value when it has no key. */
  start: number;
  valueStart: number;
  valueEnd: number;
  /** Past the entry's ',' or ';' when it has one, else `valueEnd`. */
  end: number;
}

/** Where a table stands: from its '{' to just past its '}', and each entry by key, in the order written. */
export interface LuaTableSpan {
  start: number;
  end: number;
  entries: Map<string, LuaEntrySpan>;
}

/** The spans of every table a parse read, by the table; the top-level assignments by name. */
export interface LuaSpans {
  tables: WeakMap<LuaTable, LuaTableSpan>;
  top: Map<string, LuaEntrySpan>;
}

export function luaSpans(): LuaSpans {
  return { tables: new WeakMap(), top: new Map() };
}

/** Every top-level assignment of a Lua file: `name = value`; with `spans`, where everything stands as well. */
export function parseLuaAssignments(text: string, spans?: LuaSpans): Record<string, LuaValue> {
  const p = new Parser(text, spans);
  const out: Record<string, LuaValue> = {};
  for (;;) {
    p.skip();
    if (p.done()) break;
    const start = p.i;
    const name = p.name();
    if (!name) throw p.error('a name');
    p.skip();
    p.expect('=');
    p.skip();
    const valueStart = p.i;
    out[name] = p.value();
    spans?.top.set(name, { start, valueStart, valueEnd: p.i, end: p.i });
    p.skip();
    if (p.peek() === ';' || p.peek() === ',') p.i++;
  }
  return out;
}

class Parser {
  i = 0;
  constructor(
    private readonly s: string,
    private readonly spans?: LuaSpans,
  ) {}
  done() {
    return this.i >= this.s.length;
  }
  peek() {
    return this.s[this.i];
  }
  error(want: string): Error {
    const line = this.s.slice(0, this.i).split('\n').length;
    return new Error(`Lua: expected ${want} at line ${line}`);
  }
  expect(c: string) {
    if (this.s[this.i] !== c) throw this.error(`"${c}"`);
    this.i++;
  }
  /** Whitespace and comments (`-- line`, `--[[ block ]]`). */
  skip() {
    const s = this.s;
    for (;;) {
      while (this.i < s.length && /\s/.test(s[this.i])) this.i++;
      if (s.startsWith('--', this.i)) {
        if (s.startsWith('--[[', this.i)) {
          const end = s.indexOf(']]', this.i + 4);
          this.i = end < 0 ? s.length : end + 2;
        } else {
          const end = s.indexOf('\n', this.i);
          this.i = end < 0 ? s.length : end + 1;
        }
        continue;
      }
      return;
    }
  }
  name(): string {
    const m = /^[A-Za-z_][A-Za-z0-9_]*/.exec(this.s.slice(this.i, this.i + 256));
    if (!m) return '';
    this.i += m[0].length;
    return m[0];
  }
  value(): LuaValue {
    this.skip();
    const c = this.peek();
    if (c === '{') return this.table();
    if (c === '"' || c === "'") return this.string();
    if (c === '[' && (this.s[this.i + 1] === '[' || this.s[this.i + 1] === '=')) return this.longString();
    const m = /^-?(0x[0-9a-fA-F]+|\d*\.?\d+(?:[eE][-+]?\d+)?)/.exec(this.s.slice(this.i, this.i + 64));
    if (m) {
      this.i += m[0].length;
      return Number(m[0]);
    }
    const w = this.name();
    if (w === 'true') return true;
    if (w === 'false') return false;
    if (w === 'nil') return null;
    throw this.error('a value');
  }
  string(): string {
    const q = this.s[this.i++];
    let out = '';
    const s = this.s;
    while (this.i < s.length) {
      const c = s[this.i++];
      if (c === q) return out;
      if (c !== '\\') {
        out += c;
        continue;
      }
      const e = s[this.i++];
      if (e === 'n') out += '\n';
      else if (e === 't') out += '\t';
      else if (e === 'r') out += '\r';
      else if (e === '\n') out += '\n';
      else if (e === '\r') {
        if (s[this.i] === '\n') this.i++;
        out += '\n';
      } else if (/\d/.test(e)) {
        let d = e;
        while (d.length < 3 && /\d/.test(s[this.i])) d += s[this.i++];
        out += String.fromCharCode(Number(d));
      } else out += e;
    }
    throw this.error('the end of a string');
  }
  longString(): string {
    const m = /^\[(=*)\[/.exec(this.s.slice(this.i, this.i + 16));
    if (!m) throw this.error('a long string');
    const close = `]${m[1]}]`;
    const start = this.i + m[0].length;
    const end = this.s.indexOf(close, start);
    if (end < 0) throw this.error(close);
    this.i = end + close.length;
    return this.s.slice(start, end).replace(/^\r?\n/, '');
  }
  table(): LuaTable {
    const start = this.i;
    this.expect('{');
    const out: LuaTable = {};
    const entries = this.spans ? new Map<string, LuaEntrySpan>() : null;
    let n = 1;
    for (;;) {
      this.skip();
      if (this.peek() === '}') {
        this.i++;
        if (entries) this.spans!.tables.set(out, { start, end: this.i, entries });
        return out;
      }
      if (this.done()) throw this.error('"}"');
      let key: string | null = null;
      const entryStart = this.i;
      if (this.peek() === '[' && this.s[this.i + 1] !== '[' && this.s[this.i + 1] !== '=') {
        this.i++;
        const k = this.value();
        this.skip();
        this.expect(']');
        this.skip();
        this.expect('=');
        key = typeof k === 'number' ? String(k) : String(k);
      } else {
        // A bare name followed by '=' is a key; anything else is a positional value.
        const save = this.i;
        const w = this.name();
        this.skip();
        if (w && this.peek() === '=' && this.s[this.i + 1] !== '=') {
          this.i++;
          key = w;
        } else this.i = save;
      }
      this.skip();
      const valueStart = this.i;
      const v = this.value();
      const k = key ?? String(n++);
      out[k] = v;
      const valueEnd = this.i;
      this.skip();
      if (this.peek() === ',' || this.peek() === ';') this.i++;
      else this.i = valueEnd;
      entries?.set(k, { start: entryStart, valueStart, valueEnd, end: this.i });
      // The comment DCS writes after an entry (`-- end of [...]`) is skipped by the next round.
    }
  }
}
