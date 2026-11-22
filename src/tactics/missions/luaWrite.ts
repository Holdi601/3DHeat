/**
 * Writes Lua table literals the way the DCS mission editor does: one entry a
 * line, `["key"] = value,`, a table's braces on lines of their own with
 * `-- end of ["key"]` after the closing one, an empty table as `{}`, and
 * strings with a backslash before each line break. The mission files DCS
 * writes indent by tabs or by four spaces; the writer takes either, so what
 * it puts into a file reads like the rest of it.
 *
 * And the splicing a patch needs: edits (a span of the text and what goes in
 * its place) applied from the end so earlier offsets stay true, and the
 * indentation of the line a span starts on.
 */

import type { LuaTable, LuaValue } from './lua';

/** A Lua string literal: quotes, backslashes and control characters escaped, a line break as DCS writes it. */
export function luaString(s: string): string {
  let out = '"';
  for (const ch of s) {
    if (ch === '"') out += '\\"';
    else if (ch === '\\') out += '\\\\';
    else if (ch === '\n') out += '\\\n';
    else if (ch === '\r') out += '\\r';
    else if (ch === '\t') out += '\\t';
    else if (ch < ' ') out += `\\${ch.charCodeAt(0)}`;
    else out += ch;
  }
  return `${out}"`;
}

/** A number as DCS writes one: whole numbers bare, others to 14 significant digits; never NaN or an infinity. */
export function luaNumber(n: number): string {
  if (!Number.isFinite(n)) return '0';
  if (Number.isInteger(n) && Math.abs(n) < 1e15) return String(n);
  const s = String(Number(n.toPrecision(14)));
  return s === '-0' ? '0' : s;
}

/** A table key: `[3]` for a positional one, `["name"]` otherwise. */
export function luaKey(k: string): string {
  return /^(0|[1-9]\d*)$/.test(k) ? `[${k}]` : `[${luaString(k)}]`;
}

export function luaScalar(v: Exclude<LuaValue, LuaTable>): string {
  if (v === null) return 'nil';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'number') return luaNumber(v);
  return luaString(v);
}

/** Keys in the order they are written: positional ones by number first, then the rest as the object has them. */
function keysOf(t: LuaTable): string[] {
  const ks = Object.keys(t);
  const pos = ks.filter((k) => /^(0|[1-9]\d*)$/.test(k)).sort((a, b) => Number(a) - Number(b));
  return [...pos, ...ks.filter((k) => !/^(0|[1-9]\d*)$/.test(k))];
}

/**
 * A value as Lua text, tables over several lines as DCS writes them. `depth`
 * is the indentation of the line the value starts on (the line of its key),
 * `unit` one level of it.
 */
export function luaValue(v: LuaValue, depth = 0, unit = '\t'): string {
  if (v === null || typeof v !== 'object') return luaScalar(v);
  const keys = keysOf(v).filter((k) => v[k] !== null && v[k] !== undefined);
  if (!keys.length) return '{}';
  const pad = unit.repeat(depth);
  const inner = unit.repeat(depth + 1);
  let out = `\n${pad}{\n`;
  for (const k of keys) {
    const x = v[k];
    const key = luaKey(k);
    if (x && typeof x === 'object' && keysOf(x).some((kk) => x[kk] !== null)) out += `${inner}${key} = ${luaValue(x, depth + 1, unit)}, -- end of ${key}\n`;
    else out += `${inner}${key} = ${luaValue(x, depth + 1, unit)},\n`;
  }
  return `${out}${pad}}`;
}

/** A whole Lua file of one assignment, as DCS writes `mission`, `options`, `dictionary`: `name = { ... } -- end of name`. */
export function luaFile(name: string, t: LuaTable, unit = '\t'): string {
  const body = luaValue(t, 0, unit);
  return body === '{}' ? `${name} = \n{\n} -- end of ${name}\n` : `${name} = ${body} -- end of ${name}\n`;
}

/** The text one indentation level of a file is: a tab, or the spaces its second level is indented by. */
export function indentUnit(text: string): string {
  const m = /\n([ \t]+)\[/.exec(text);
  if (!m) return '\t';
  return m[1][0] === '\t' ? '\t' : ' '.repeat(Math.max(1, Math.min(8, m[1].length)));
}

/** How deep (in `unit`s) the line holding offset `at` is indented. */
export function depthAt(text: string, at: number, unit: string): number {
  const line = text.lastIndexOf('\n', at - 1) + 1;
  let n = 0;
  let i = line;
  while (text.startsWith(unit, i)) {
    n++;
    i += unit.length;
  }
  return n;
}

/** A change to a text: the span [start, end) replaced by `text` (start === end inserts). */
export interface TextEdit {
  start: number;
  end: number;
  text: string;
}

/**
 * The text with its edits made, from the last to the first. Edits must not
 * overlap; two that do are an error in the caller, said rather than written.
 */
export function applyEdits(text: string, edits: TextEdit[]): string {
  const sorted = [...edits].sort((a, b) => b.start - a.start || b.end - a.end);
  let out = text;
  let limit = Infinity;
  for (const e of sorted) {
    if (e.end > limit) throw new Error(`overlapping edits at ${e.start}..${e.end}`);
    out = out.slice(0, e.start) + e.text + out.slice(e.end);
    limit = e.start;
  }
  return out;
}

/**
 * A span of the text with the edits inside it made, the edits taken out of
 * the list: for a span that is itself rewritten (a list renumbered) from its
 * pieces, each piece with its own changes.
 */
export function takeSpan(text: string, start: number, end: number, edits: TextEdit[]): string {
  const inside: TextEdit[] = [];
  for (let i = edits.length - 1; i >= 0; i--) {
    const e = edits[i];
    if (e.start >= start && e.end <= end) {
      inside.push({ start: e.start - start, end: e.end - start, text: e.text });
      edits.splice(i, 1);
    }
  }
  return applyEdits(text.slice(start, end), inside);
}
