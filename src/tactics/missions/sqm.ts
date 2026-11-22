/**
 * A reader for the text config format Arma writes mission.sqm in (and its
 * other config files): `class Name { key = value; list[] = {a, b}; class
 * Inner { ... }; };`. Values are strings ("" doubles a quote), numbers or
 * nested lists. The reader keeps where each class and value lies in the text
 * (`sqmSpan`), so a writer can change a value and leave the rest as it was.
 *
 * A binarised ("rapified") mission.sqm starts with "\0raP": the same tree as
 * binary records, which `derapify` reads and `derapifyText` turns back into
 * text laid out as the Eden editor writes it.
 */

export type SqmValue = string | number | SqmValue[] | SqmClass;
export interface SqmClass {
  [key: string]: SqmValue;
}

export function isBinarisedSqm(bytes: Uint8Array): boolean {
  return bytes.length >= 4 && bytes[0] === 0 && bytes[1] === 0x72 && bytes[2] === 0x61 && bytes[3] === 0x50;
}

/** Where an entry lies: its whole text (`start`..`end`, the `;` included when there is one) and its value. */
export interface SqmEntrySpan {
  start: number;
  valueStart: number;
  valueEnd: number;
  end: number;
}

/** Where a class lies: `class` to its `;` (`start`..`end`), its braces (`open`, `close`), and its entries'. */
export interface SqmClassSpan {
  start: number;
  open: number;
  close: number;
  end: number;
  /** The class's name as written (`Item3`). */
  name: string;
  entries: Record<string, SqmEntrySpan>;
}

const spans = new WeakMap<SqmClass, SqmClassSpan>();

/** Where a parsed class lies in the text it was read from. */
export function sqmSpan(c: SqmClass | null | undefined): SqmClassSpan | undefined {
  return c ? spans.get(c) : undefined;
}

export function parseSqm(text: string): SqmClass {
  const p = new SqmParser(text);
  return p.body(true);
}

/** A class's child classes, in order (`Item0`, `Item1`, ...). */
export function sqmItems(c: SqmValue | undefined): SqmClass[] {
  if (!c || typeof c !== 'object' || Array.isArray(c)) return [];
  return Object.entries(c)
    .filter(([k, v]) => /^item\d+$/i.test(k) && v && typeof v === 'object' && !Array.isArray(v))
    .sort((a, b) => Number(a[0].slice(4)) - Number(b[0].slice(4)))
    .map(([, v]) => v as SqmClass);
}

export const sqmClass = (v: SqmValue | undefined): SqmClass | null => (v && typeof v === 'object' && !Array.isArray(v) ? v : null);
export const sqmStr = (v: SqmValue | undefined, d = ''): string => (typeof v === 'string' ? v : typeof v === 'number' ? String(v) : d);
export const sqmNum = (v: SqmValue | undefined, d = 0): number => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v)) ? Number(v) : d);
export const sqmList = (v: SqmValue | undefined): SqmValue[] => (Array.isArray(v) ? v : []);

class SqmParser {
  i = 0;
  constructor(private readonly s: string) {}
  error(want: string): Error {
    return new Error(`mission.sqm: expected ${want} at line ${this.s.slice(0, this.i).split('\n').length}`);
  }
  skip() {
    const s = this.s;
    for (;;) {
      while (this.i < s.length && /\s/.test(s[this.i])) this.i++;
      if (s.startsWith('//', this.i)) {
        const e = s.indexOf('\n', this.i);
        this.i = e < 0 ? s.length : e + 1;
        continue;
      }
      if (s.startsWith('/*', this.i)) {
        const e = s.indexOf('*/', this.i + 2);
        this.i = e < 0 ? s.length : e + 2;
        continue;
      }
      // Preprocessor lines (#include, #define) carry no mission data.
      if (s[this.i] === '#') {
        const e = s.indexOf('\n', this.i);
        this.i = e < 0 ? s.length : e + 1;
        continue;
      }
      return;
    }
  }
  word(): string {
    const m = /^[A-Za-z_][A-Za-z0-9_]*/.exec(this.s.slice(this.i, this.i + 256));
    if (!m) return '';
    this.i += m[0].length;
    return m[0];
  }
  /** The entries of a class body (or the file), up to its `}`. */
  body(top = false, span?: SqmClassSpan): SqmClass {
    const out: SqmClass = {};
    const entries: Record<string, SqmEntrySpan> = {};
    if (span) span.entries = entries;
    else if (top) spans.set(out, { start: 0, open: -1, close: this.s.length, end: this.s.length, name: '', entries });
    for (;;) {
      this.skip();
      if (this.i >= this.s.length) {
        if (top) return out;
        throw this.error('"}"');
      }
      if (this.s[this.i] === '}') {
        if (top) throw this.error('an entry');
        if (span) span.close = this.i;
        this.i++;
        return out;
      }
      const start = this.i;
      const w = this.word();
      if (!w) throw this.error('a name');
      this.skip();
      if (w === 'class') {
        const name = this.word();
        this.skip();
        // `class Name: Base { ... }`, and `class Name;` (a forward declaration).
        if (this.s[this.i] === ':') {
          this.i++;
          this.skip();
          this.word();
          this.skip();
        }
        if (this.s[this.i] === ';') {
          this.i++;
          continue;
        }
        if (this.s[this.i] !== '{') throw this.error('"{"');
        const cs: SqmClassSpan = { start, open: this.i, close: -1, end: -1, name, entries: {} };
        this.i++;
        const c = this.body(false, cs);
        out[name] = c;
        spans.set(c, cs);
        const after = this.i;
        this.skip();
        if (this.s[this.i] === ';') this.i++;
        else this.i = after;
        cs.end = this.i;
        continue;
      } else {
        let list = false;
        if (this.s.startsWith('[]', this.i)) {
          this.i += 2;
          list = true;
          this.skip();
        }
        // `+=` appends to a list from a base class: read as the list itself.
        if (this.s.startsWith('+=', this.i)) this.i++;
        if (this.s[this.i] !== '=') throw this.error('"="');
        this.i++;
        this.skip();
        const valueStart = this.i;
        out[w] = list || this.s[this.i] === '{' ? this.list() : this.scalar();
        // A bare value's span ends before the spaces in front of its `;`.
        let valueEnd = this.i;
        while (valueEnd > valueStart && /\s/.test(this.s[valueEnd - 1])) valueEnd--;
        this.skip();
        if (this.s[this.i] === ';') this.i++;
        entries[w] = { start, valueStart, valueEnd, end: this.i };
      }
    }
  }
  list(): SqmValue[] {
    this.skip();
    if (this.s[this.i] !== '{') return [this.scalar()];
    this.i++;
    const out: SqmValue[] = [];
    for (;;) {
      this.skip();
      if (this.s[this.i] === '}') {
        this.i++;
        return out;
      }
      out.push(this.s[this.i] === '{' ? this.list() : this.scalar());
      this.skip();
      if (this.s[this.i] === ',') this.i++;
    }
  }
  scalar(): string | number {
    const s = this.s;
    if (s[this.i] === '"') {
      this.i++;
      let out = '';
      while (this.i < s.length) {
        const c = s[this.i++];
        if (c === '"') {
          if (s[this.i] === '"') {
            out += '"';
            this.i++;
            continue;
          }
          // `"a" \n "b"`: strings the editor joins with a line break between them.
          const joined = /^[ \t]*\\n[ \t]*"/.exec(s.slice(this.i, this.i + 64));
          if (joined) {
            out += '\n';
            this.i += joined[0].length;
            continue;
          }
          return out;
        }
        out += c;
      }
      throw this.error('the end of a string');
    }
    const m = /^[^;,}\r\n]*/.exec(s.slice(this.i, this.i + 4096))!;
    this.i += m[0].length;
    const t = m[0].trim();
    const n = Number(t);
    return t !== '' && Number.isFinite(n) ? n : t;
  }
}

// ---------------------------------------------------------------------------
// Writing config text, and the binarised form read back as text

/** A number as config text: whole numbers bare, others as short as reads back the same (a float of 32 bits when `float`). */
export function sqmNumber(n: number, float = false): string {
  if (!Number.isFinite(n)) return '0';
  if (Number.isInteger(n) && Math.abs(n) < 1e15) return String(n);
  for (let p = 1; p <= 17; p++) {
    const t = n.toPrecision(p);
    if (float ? Math.fround(Number(t)) === Math.fround(n) : Number(t) === n) return String(Number(t));
  }
  return String(n);
}

/** A config string: in quotes, a quote doubled. */
export const sqmString = (s: string): string => `"${s.replace(/"/g, '""')}"`;

/** A list as config text: numbers on one line (`{1,2,3}`), anything else an entry a line, as Eden writes it. */
export function sqmListText(v: SqmValue[], indent: string, step = '\t', float = false): string {
  if (!v.length) return '{}';
  const flat = v.every((x) => typeof x === 'number');
  const one = (x: SqmValue): string => (Array.isArray(x) ? sqmListText(x, indent + step, step, float) : typeof x === 'number' ? sqmNumber(x, float) : typeof x === 'string' ? sqmString(x) : '{}');
  if (flat) return `{${v.map(one).join(',')}}`;
  return `\n${indent}{\n${v.map((x) => `${indent}${step}${one(x)}`).join(',\n')}\n${indent}}`;
}

/** A class as config text: `class Name` and its braces on lines of their own, an entry a line, one `step` deeper. */
export function sqmClassText(name: string, c: SqmClass, indent: string, step = '\t', float = false): string {
  let body = '';
  const inner = indent + step;
  for (const [k, v] of Object.entries(c)) {
    if (v && typeof v === 'object' && !Array.isArray(v)) body += `${inner}${sqmClassText(k, v, inner, step, float)}\n`;
    else if (Array.isArray(v)) body += `${inner}${k}[]=${sqmListText(v, inner, step, float)};\n`;
    else body += `${inner}${k}=${typeof v === 'number' ? sqmNumber(v, float) : sqmString(v)};\n`;
  }
  return `class ${name}\n${indent}{\n${body}${indent}};`;
}

/** A whole config file as text: the top level's entries without braces. */
export function sqmFileText(c: SqmClass, float = false): string {
  const t = sqmClassText('_', c, '', '\t', float);
  return t.slice(t.indexOf('{\n') + 2, t.lastIndexOf('};')).replace(/^\t/gm, '');
}

/**
 * A binarised config (`\0raP`) as the tree its text would read as. The
 * layout: the magic, two words (0 and 8) and the offset of an enum table;
 * then the top class's body - its base class's name and its entries - with
 * each inner class's body at the offset its entry names. An entry is a type
 * byte and its record: a class (name, body offset), a value (its kind:
 * string, float, 32- or 64-bit integer; name; value), a list (name, items,
 * each a kind byte and a value or a nested list), an external or deleted
 * class (a name). Counts are 7-bit groups, low first. Strings end at a zero.
 */
export function derapify(bytes: Uint8Array): SqmClass {
  if (!isBinarisedSqm(bytes)) throw new Error('not a binarised config');
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const dec = new TextDecoder('utf-8');
  let depth = 0;
  const fail = (at: number) => new Error(`binarised config: cannot read at byte ${at}`);
  const asciiz = (r: { i: number }): string => {
    const e = bytes.indexOf(0, r.i);
    if (e < 0) throw fail(r.i);
    const t = dec.decode(bytes.subarray(r.i, e));
    r.i = e + 1;
    return t;
  };
  const count = (r: { i: number }): number => {
    let v = 0;
    let shift = 0;
    for (;;) {
      if (r.i >= bytes.length || shift > 28) throw fail(r.i);
      const b = bytes[r.i++];
      v += (b & 0x7f) * 2 ** shift;
      if (!(b & 0x80)) return v;
      shift += 7;
    }
  };
  const scalar = (kind: number, r: { i: number }): string | number => {
    if (kind === 0 || kind === 4) return asciiz(r);
    if (kind === 1) {
      const v = dv.getFloat32(r.i, true);
      r.i += 4;
      return v;
    }
    if (kind === 2) {
      const v = dv.getInt32(r.i, true);
      r.i += 4;
      return v;
    }
    if (kind === 6) {
      const v = Number(dv.getBigInt64(r.i, true));
      r.i += 8;
      return v;
    }
    throw fail(r.i - 1);
  };
  const list = (r: { i: number }): SqmValue[] => {
    const n = count(r);
    const out: SqmValue[] = [];
    for (let k = 0; k < n; k++) {
      const kind = bytes[r.i++];
      out.push(kind === 3 ? list(r) : scalar(kind, r));
    }
    return out;
  };
  const body = (at: number): SqmClass => {
    if (at < 16 || at >= bytes.length || ++depth > 64) throw fail(at);
    const r = { i: at };
    asciiz(r);
    const n = count(r);
    const out: SqmClass = {};
    for (let k = 0; k < n; k++) {
      const type = bytes[r.i++];
      if (type === 0) {
        const name = asciiz(r);
        const off = dv.getUint32(r.i, true);
        r.i += 4;
        out[name] = body(off);
      } else if (type === 1) {
        const kind = bytes[r.i++];
        const name = asciiz(r);
        out[name] = scalar(kind, r);
      } else if (type === 2) {
        const name = asciiz(r);
        out[name] = list(r);
      } else if (type === 3 || type === 4) asciiz(r);
      else if (type === 5) {
        r.i += 4;
        const name = asciiz(r);
        out[name] = list(r);
      } else throw fail(r.i - 1);
    }
    depth--;
    return out;
  };
  return body(16);
}

/** A binarised config as the text the editor would have written: floats as 32-bit floats read back. */
export function derapifyText(bytes: Uint8Array): string {
  return sqmFileText(derapify(bytes), true);
}
