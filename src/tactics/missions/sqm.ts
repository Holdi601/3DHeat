/**
 * A reader for the text config format Arma writes mission.sqm in (and its
 * other config files): `class Name { key = value; list[] = {a, b}; class
 * Inner { ... }; };`. Values are strings ("" doubles a quote), numbers or
 * nested lists. A binarised mission.sqm (it starts with "\0raP") is not text
 * and is refused with the reason: the Eden editor writes text unless told
 * to binarise.
 */

export type SqmValue = string | number | SqmValue[] | SqmClass;
export interface SqmClass {
  [key: string]: SqmValue;
}

export function isBinarisedSqm(bytes: Uint8Array): boolean {
  return bytes.length >= 4 && bytes[0] === 0 && bytes[1] === 0x72 && bytes[2] === 0x61 && bytes[3] === 0x50;
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
  body(top = false): SqmClass {
    const out: SqmClass = {};
    for (;;) {
      this.skip();
      if (this.i >= this.s.length) {
        if (top) return out;
        throw this.error('"}"');
      }
      if (this.s[this.i] === '}') {
        if (top) throw this.error('an entry');
        this.i++;
        return out;
      }
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
        this.i++;
        out[name] = this.body();
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
        out[w] = list || this.s[this.i] === '{' ? this.list() : this.scalar();
      }
      this.skip();
      if (this.s[this.i] === ';') this.i++;
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
