/**
 * A reader for the text form of the Dagor engine's BLK files, which War
 * Thunder's mission editor saves user missions in: `name:type=value`
 * parameters and `name{ ... }` blocks, with `//` and `/* *\/` comments. Each
 * parameter keeps its type letter (t text, i integer, r real, b boolean,
 * p2/p3/p4 points, ip2/ip3 integer points, m a 4x3 matrix, c a colour, i64)
 * and where it stands in the text, each block where its braces are, so a
 * writer can change one value and leave every other byte as it was
 * (`wtWrite.ts`). Not the binary form the game's own archives hold.
 */

export interface BlkParam {
  name: string;
  type: string;
  /** The value as written, without quotes for text. */
  raw: string;
  /** From the name to past the value; the value alone. */
  start: number;
  end: number;
  valueStart: number;
  valueEnd: number;
}

export interface BlkBlock {
  name: string;
  params: BlkParam[];
  blocks: BlkBlock[];
  /** From the name to past the closing brace; the braces. */
  start: number;
  end: number;
  open: number;
  close: number;
}

export function blkParam(b: BlkBlock | null | undefined, name: string): BlkParam | undefined {
  return b?.params.find((p) => p.name === name);
}

export function blkChild(b: BlkBlock | null | undefined, name: string): BlkBlock | undefined {
  return b?.blocks.find((c) => c.name === name);
}

/** A parameter's value: a number, a boolean, a string, or a list of numbers (points, matrices: rows one after another). */
export function blkValue(p: BlkParam | undefined): string | number | boolean | number[] | undefined {
  if (!p) return undefined;
  if (p.type === 't') return p.raw;
  if (p.type === 'b') return /^(yes|true|on|1)$/i.test(p.raw.trim());
  if (p.type === 'i' || p.type === 'r' || p.type === 'i64') return Number(p.raw);
  return (p.raw.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi) ?? []).map(Number);
}

export const blkNum = (b: BlkBlock | null | undefined, name: string, d = 0): number => {
  const v = blkValue(blkParam(b, name));
  return typeof v === 'number' && Number.isFinite(v) ? v : d;
};
export const blkStr = (b: BlkBlock | null | undefined, name: string, d = ''): string => {
  const v = blkValue(blkParam(b, name));
  return typeof v === 'string' ? v : d;
};

/** A name runs to the first space, colon, brace or equals sign (`layers[0].coverage` is one). */
const NAME = /[^\s:{}=;"']/;

/** The whole file as one block (its name empty, its span the text). */
export function parseBlk(text: string): BlkBlock {
  let i = 0;
  const s = text;
  const err = (want: string) => new Error(`BLK: expected ${want} at line ${s.slice(0, i).split('\n').length}`);
  const skip = () => {
    for (;;) {
      while (i < s.length && /[\s;]/.test(s[i])) i++;
      if (s.startsWith('//', i)) {
        const e = s.indexOf('\n', i);
        i = e < 0 ? s.length : e + 1;
        continue;
      }
      if (s.startsWith('/*', i)) {
        const e = s.indexOf('*/', i + 2);
        i = e < 0 ? s.length : e + 2;
        continue;
      }
      return;
    }
  };
  const name = (): string => {
    if (s[i] === '"' || s[i] === "'") {
      const q = s[i++];
      const e = s.indexOf(q, i);
      if (e < 0) throw err('the end of a name');
      const n = s.slice(i, e);
      i = e + 1;
      return n;
    }
    const st = i;
    while (i < s.length && NAME.test(s[i])) i++;
    // Leniently, a name with a space in it that should have been quoted ("icon army").
    let e = i;
    while (e < s.length && (s[e] === ' ' || s[e] === '\t')) e++;
    if (e > i && NAME.test(s[e] ?? '')) {
      let k = e;
      while (k < s.length && /[^\n:{}=;"']/.test(s[k])) k++;
      if (s[k] === ':' || s[k] === '{') {
        i = k;
        return s.slice(st, k).trimEnd();
      }
    }
    return s.slice(st, i);
  };
  const block = (bname: string, start: number, open: number, top: boolean): BlkBlock => {
    const out: BlkBlock = { name: bname, params: [], blocks: [], start, end: s.length, open, close: s.length };
    for (;;) {
      skip();
      if (i >= s.length) {
        if (!top) throw err('"}"');
        return out;
      }
      if (s[i] === '}') {
        if (top) throw err('a name');
        out.close = i;
        out.end = ++i;
        return out;
      }
      const st = i;
      const n = name();
      if (!n && s[i] !== '{') throw err('a name');
      while (i < s.length && (s[i] === ' ' || s[i] === '\t')) i++;
      if (s[i] === '{') {
        const o = i++;
        out.blocks.push(block(n, st, o, false));
        continue;
      }
      if (s[i] !== ':') throw err('":" or "{"');
      i++;
      const ts = i;
      while (i < s.length && /[a-z0-9]/i.test(s[i])) i++;
      const type = s.slice(ts, i);
      while (s[i] === ' ' || s[i] === '\t') i++;
      if (s[i] !== '=') throw err('"="');
      i++;
      while (s[i] === ' ' || s[i] === '\t') i++;
      let vs = i;
      let ve: number;
      let raw: string;
      if (type === 't' && (s[i] === '"' || s[i] === "'")) {
        const q = s[i++];
        vs = i;
        let r = '';
        while (i < s.length && s[i] !== q) {
          // `~` escapes the next character.
          if (s[i] === '~' && i + 1 < s.length) {
            const c = s[i + 1];
            r += c === 'n' ? '\n' : c === 't' ? '\t' : c === 'r' ? '\r' : c;
            i += 2;
            continue;
          }
          r += s[i++];
        }
        if (i >= s.length) throw err('the end of a text');
        ve = i++;
        raw = r;
        out.params.push({ name: n, type, raw, start: st, end: i, valueStart: vs - 1, valueEnd: ve + 1 });
        continue;
      }
      if (type === 'm') {
        let depth = 0;
        for (; i < s.length; i++) {
          if (s[i] === '[') depth++;
          else if (s[i] === ']' && --depth === 0) {
            i++;
            break;
          }
        }
        ve = i;
      } else {
        while (i < s.length && s[i] !== '\n' && s[i] !== ';' && s[i] !== '}' && !s.startsWith('//', i)) i++;
        ve = i;
        while (ve > vs && /\s/.test(s[ve - 1])) ve--;
      }
      raw = s.slice(vs, ve);
      out.params.push({ name: n, type, raw, start: st, end: ve, valueStart: vs, valueEnd: ve });
    }
  };
  return block('', 0, -1, true);
}

/** A text value as BLK writes one, in double quotes, `~` before a quote or a tilde. */
export function blkText(v: string): string {
  return `"${v.replace(/~/g, '~~').replace(/"/g, '~"').replace(/\n/g, '~n')}"`;
}

/** A number as a BLK real: always with a point. */
export function blkReal(v: number): string {
  if (!Number.isFinite(v)) return '0.0';
  const r = Math.round(v * 1000) / 1000;
  return Number.isInteger(r) ? `${r}.0` : String(r);
}

/** A matrix value: three axis rows and the position, `[[x, y, z] [..] [..] [..]]`. */
export function blkMatrix(rows: number[][]): string {
  return `[${rows.map((r) => `[${r.map(blkReal).join(', ')}]`).join(' ')}]`;
}

/** The indentation of the line a position is on. */
export function lineIndent(text: string, at: number): string {
  const ls = text.lastIndexOf('\n', at - 1) + 1;
  const m = /^[ \t]*/.exec(text.slice(ls));
  return m ? m[0] : '';
}
