/**
 * The Compare panel's small expression language: group filters over the
 * columns (`team == "Allies" and vehicle == "T-34"`) and statistics over
 * aggregates (`countIf(event == "kill") / countIf(event == "death")`).
 *
 * Parsed by hand, never evaluated as script: the text becomes a tree, the tree
 * is checked against the loaded columns (`bindPredicate`, `bindMetric`) into a
 * plain, cloneable form the worker turns into closures (`engine.ts`). Every
 * mistake is an `ExprError` with a message key, its values and the place in
 * the text, said in the viewer's language by the panel.
 *
 *   predicate   or-expression; `=` is `==`; and, or, not (&&, ||, !)
 *   comparison  == != < <= > >=, `x in ["a", "b"]`
 *   arithmetic  + - * / %, parentheses, numbers, "strings", `quoted names`
 *   aggregates  count() count(p) countIf(p) sum(x) sumIf(x, p) avg(x) avgIf(x, p)
 *               min(x) max(x) median(x) percentile(x, p) stdev(x) distinct(a, ...)
 *               presence() players() matches() rounds() kills() deaths()
 *               wins() played() winRate()
 *   rates       perMinute(v) perMatch(v) perRound(v) perPlayer(v) ofAll(v)
 *               shrink(num, den[, m])
 *   functions   abs sqrt log exp round floor ceil min(a, b) max(a, b) if(c, a, b)
 *               clamp(x, lo, hi) weaponClass(col) contains(col, "s")
 *               startsWith(col, "s")
 *   where       `avg(speed) where alt > 1000` filters every aggregate
 */

/** A message for the user: an i18n key under `versus.err.`, its values, and where in the text. */
export class ExprError extends Error {
  constructor(
    readonly key: string,
    readonly values: Record<string, string | number> = {},
    readonly pos = 0,
  ) {
    super(`${key} ${JSON.stringify(values)} at ${pos}`);
  }
}

// ---------------------------------------------------------------------------
// Tokens

type Tok =
  | { t: 'num'; v: number; s: number; e: number }
  | { t: 'str'; v: string; s: number; e: number }
  | { t: 'id'; v: string; quoted: boolean; s: number; e: number }
  | { t: 'op'; v: string; s: number; e: number }
  | { t: 'end'; s: number; e: number };

const OPS = ['==', '!=', '<>', '<=', '>=', '&&', '||', '(', ')', '[', ']', ',', '+', '-', '*', '/', '%', '<', '>', '=', '!'];
const WORDS = new Set(['and', 'or', 'not', 'in', 'where', 'true', 'false']);

export function tokenize(src: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    const s = i;
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1] ?? ''))) {
      const m = /^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i.exec(src.slice(i))!;
      i += m[0].length;
      out.push({ t: 'num', v: Number(m[0]), s, e: i });
      continue;
    }
    if (c === '"' || c === "'" || c === '`') {
      let j = i + 1;
      let v = '';
      while (j < src.length && src[j] !== c) {
        if (src[j] === '\\' && j + 1 < src.length) j++;
        v += src[j++];
      }
      if (j >= src.length) throw new ExprError(c === '`' ? 'unclosedName' : 'unclosedString', {}, s);
      i = j + 1;
      out.push(c === '`' ? { t: 'id', v, quoted: true, s, e: i } : { t: 'str', v, s, e: i });
      continue;
    }
    if (/[\p{L}_]/u.test(c)) {
      const m = /^[\p{L}_][\p{L}\p{N}_.]*/u.exec(src.slice(i))!;
      i += m[0].length;
      const w = m[0].toLowerCase();
      if (WORDS.has(w)) out.push({ t: 'op', v: w, s, e: i });
      else out.push({ t: 'id', v: m[0], quoted: false, s, e: i });
      continue;
    }
    const op = OPS.find((o) => src.startsWith(o, i));
    if (!op) throw new ExprError('badChar', { char: c }, i);
    i += op.length;
    out.push({ t: 'op', v: op, s, e: i });
  }
  out.push({ t: 'end', s: src.length, e: src.length });
  return out;
}

// ---------------------------------------------------------------------------
// Syntax tree

export type Ast =
  | { k: 'num'; v: number; s: number; e: number }
  | { k: 'str'; v: string; s: number; e: number }
  | { k: 'list'; items: Ast[]; s: number; e: number }
  | { k: 'id'; name: string; quoted: boolean; s: number; e: number }
  | { k: 'call'; fn: string; args: Ast[]; s: number; e: number }
  | { k: 'un'; op: '-' | 'not'; a: Ast; s: number; e: number }
  | { k: 'bin'; op: string; a: Ast; b: Ast; s: number; e: number }
  | { k: 'where'; a: Ast; cond: Ast; s: number; e: number };

export function parse(src: string): Ast {
  const toks = tokenize(src);
  let p = 0;
  const peek = () => toks[p];
  const isOp = (...v: string[]) => {
    const k = toks[p];
    return k.t === 'op' && v.includes(k.v);
  };
  const expect = (v: string) => {
    if (!isOp(v)) throw new ExprError('expected', { what: v, got: describe(toks[p]) }, toks[p].s);
    return toks[p++];
  };
  const span = (a: { s: number }, b: { e: number }) => ({ s: a.s, e: b.e });
  const take = () => (toks[p++] as { v: string }).v;

  const top = (): Ast => {
    if (peek().t === 'end') throw new ExprError('empty', {}, 0);
    const a = or();
    if (isOp('where')) {
      p++;
      const cond = or();
      return { k: 'where', a, cond, ...span(a, cond) };
    }
    return a;
  };
  const or = (): Ast => {
    let a = and();
    while (isOp('or', '||')) {
      p++;
      const b = and();
      a = { k: 'bin', op: 'or', a, b, ...span(a, b) };
    }
    return a;
  };
  const and = (): Ast => {
    let a = not();
    while (isOp('and', '&&')) {
      p++;
      const b = not();
      a = { k: 'bin', op: 'and', a, b, ...span(a, b) };
    }
    return a;
  };
  const not = (): Ast => {
    if (isOp('not', '!')) {
      const s = toks[p++].s;
      const a = not();
      return { k: 'un', op: 'not', a, s, e: a.e };
    }
    return cmp();
  };
  const cmp = (): Ast => {
    const a = add();
    if (isOp('==', '=', '!=', '<>', '<', '<=', '>', '>=')) {
      const raw = take();
      const op = raw === '=' ? '==' : raw === '<>' ? '!=' : raw;
      const b = add();
      return { k: 'bin', op, a, b, ...span(a, b) };
    }
    if (isOp('in') || (isOp('not') && toks[p + 1].t === 'op' && (toks[p + 1] as { v: string }).v === 'in')) {
      const neg = isOp('not');
      p += neg ? 2 : 1;
      const b = add();
      const node: Ast = { k: 'bin', op: 'in', a, b, ...span(a, b) };
      return neg ? { k: 'un', op: 'not', a: node, s: node.s, e: node.e } : node;
    }
    return a;
  };
  const add = (): Ast => {
    let a = mul();
    while (isOp('+', '-')) {
      const op = take();
      const b = mul();
      a = { k: 'bin', op, a, b, ...span(a, b) };
    }
    return a;
  };
  const mul = (): Ast => {
    let a = unary();
    while (isOp('*', '/', '%')) {
      const op = take();
      const b = unary();
      a = { k: 'bin', op, a, b, ...span(a, b) };
    }
    return a;
  };
  const unary = (): Ast => {
    if (isOp('-')) {
      const s = toks[p++].s;
      const a = unary();
      return { k: 'un', op: '-', a, s, e: a.e };
    }
    if (isOp('+')) {
      p++;
      return unary();
    }
    return primary();
  };
  const primary = (): Ast => {
    const k = toks[p];
    if (k.t === 'num') {
      p++;
      return { k: 'num', v: k.v, s: k.s, e: k.e };
    }
    if (k.t === 'str') {
      p++;
      return { k: 'str', v: k.v, s: k.s, e: k.e };
    }
    if (k.t === 'op' && (k.v === 'true' || k.v === 'false')) {
      p++;
      return { k: 'num', v: k.v === 'true' ? 1 : 0, s: k.s, e: k.e };
    }
    if (k.t === 'id') {
      p++;
      if (!k.quoted && isOp('(')) {
        p++;
        const args: Ast[] = [];
        if (!isOp(')')) {
          args.push(or());
          while (isOp(',')) {
            p++;
            args.push(or());
          }
        }
        const close = expect(')');
        return { k: 'call', fn: k.v, args, s: k.s, e: close.e };
      }
      return { k: 'id', name: k.v, quoted: k.quoted, s: k.s, e: k.e };
    }
    if (k.t === 'op' && (k.v === '(' || k.v === '[')) {
      p++;
      const close = k.v === '(' ? ')' : ']';
      const items: Ast[] = [];
      if (!isOp(close)) {
        items.push(or());
        while (isOp(',')) {
          p++;
          items.push(or());
        }
      }
      const end = expect(close);
      if (k.v === '(' && items.length === 1) return items[0];
      return { k: 'list', items, s: k.s, e: end.e };
    }
    throw new ExprError(k.t === 'end' ? 'unexpectedEnd' : 'unexpected', { got: describe(k) }, k.s);
  };
  const ast = top();
  if (peek().t !== 'end') throw new ExprError('unexpected', { got: describe(peek()) }, peek().s);
  return ast;
}

function describe(k: Tok): string {
  if (k.t === 'end') return '';
  if (k.t === 'str') return `"${k.v}"`;
  return String(k.v);
}

// ---------------------------------------------------------------------------
// The columns an expression can name

export interface Column {
  /** The name shown and matched (case-insensitively, then by `aliases`). */
  name: string;
  /** Where the worker finds it in a chunk. */
  key: string;
  type: 'num' | 'cat';
  labels?: string[];
  /** For a canonical column: per label, its taxonomy index (-1 none), and the taxonomy. */
  canon?: { map: ArrayLike<number>; kinds: readonly string[] };
  aliases?: string[];
}

export interface Schema {
  cols: Column[];
  /** Keys of the columns some aggregates need, or null when the data lacks them. */
  event: string | null;
  person: string | null;
  session: string | null;
  round: string | null;
  won: string | null;
  presence: boolean;
  /** Weapon class of a label (breakdown's `weaponClassOf`), and the class names. */
  weaponClass?: { classes: readonly string[]; of: (label: string) => string | null };
}

export function findColumn(schema: Schema, name: string): Column | null {
  const n = name.trim();
  const low = n.toLowerCase();
  return (
    schema.cols.find((c) => c.name === n) ??
    schema.cols.find((c) => c.name.toLowerCase() === low) ??
    schema.cols.find((c) => c.aliases?.some((a) => a.toLowerCase() === low)) ??
    null
  );
}

// ---------------------------------------------------------------------------
// Bound forms: plain data, cloned to the worker

/** A row-level expression. */
export type RNode =
  | { k: 'num'; v: number }
  | { k: 'col'; c: string }
  /** A category through a table (label index -> new index), e.g. a weapon's class. */
  | { k: 'map'; c: string; table: Int32Array }
  /** 1 where the category's label passes (`mask[index]`), else 0. */
  | { k: 'mask'; a: RNode; mask: Uint8Array }
  | { k: 'un'; op: '-' | 'not'; a: RNode }
  | { k: 'bin'; op: string; a: RNode; b: RNode }
  | { k: 'fn'; fn: string; args: RNode[] };

export type AggFn =
  | 'count'
  | 'sum'
  | 'avg'
  | 'min'
  | 'max'
  | 'median'
  | 'percentile'
  | 'stdev'
  | 'distinct'
  | 'presence'
  | 'winRate'
  | 'wins'
  | 'played';

/** One aggregate a statistic needs: what it folds, over which rows. */
export interface AggSpec {
  fn: AggFn;
  /** The value folded (sum, avg...), or null for counts. */
  value: RNode | null;
  /** Rows counted; null for all. */
  filter: RNode | null;
  /** distinct: the tuple's parts. */
  parts?: RNode[];
  /** distinct: per part, its dictionary size where it is a category (a bitmap then), else 0. */
  sizes?: number[];
  /** percentile: 0..100. */
  p?: number;
  /** A key equal for equal aggregates, to share them between statistics. */
  key: string;
}

/** The statistic over its aggregates. */
export type VNode =
  | { k: 'num'; v: number }
  | { k: 'agg'; i: number }
  | { k: 'un'; op: '-' | 'not'; a: VNode }
  | { k: 'bin'; op: string; a: VNode; b: VNode }
  | { k: 'fn'; fn: string; args: VNode[] }
  /** (num + m r0) / (den + m), r0 = num / den over the whole place. */
  | { k: 'shrink'; num: VNode; den: VNode; m: number }
  /** The value over the value of the whole place (the "All" row). */
  | { k: 'ofAll'; a: VNode };

export interface BoundMetric {
  aggs: AggSpec[];
  expr: VNode;
}

type Typed = { node: RNode; type: 'num' | 'cat' | 'bool'; col?: Column; labels?: string[]; canon?: Column['canon'] };

const SCALAR1 = new Set(['abs', 'sqrt', 'log', 'log10', 'exp', 'round', 'floor', 'ceil', 'sign']);
const AGG_NAMES = new Set([
  'count', 'countif', 'sum', 'sumif', 'avg', 'mean', 'avgif', 'min', 'max', 'median', 'percentile', 'stdev', 'distinct',
  'presence', 'players', 'matches', 'rounds', 'kills', 'deaths', 'wins', 'played', 'winrate',
]);

/** Literal text of a node as a category value: quoted strings, bare words, `T-34`. */
function asText(src: string, a: Ast): string | null {
  if (a.k === 'str') return a.v;
  if (a.k === 'num') return src.slice(a.s, a.e).trim();
  if (a.k === 'id' || a.k === 'bin' || a.k === 'un') return src.slice(a.s, a.e).trim();
  return null;
}

/** Label indices a value names: exact, then ignoring case, then the canonical kind. */
function labelMask(src: string, t: Typed, a: Ast): Uint8Array {
  const labels = t.labels!;
  const text = asText(src, a);
  if (text === null) throw new ExprError('notAValue', { column: t.col?.name ?? '' }, a.s);
  const m = new Uint8Array(labels.length);
  let hit = false;
  for (let i = 0; i < labels.length; i++) if (labels[i] === text) m[i] = 1, (hit = true);
  if (!hit) {
    const low = text.toLowerCase();
    for (let i = 0; i < labels.length; i++) if (labels[i].toLowerCase() === low) m[i] = 1, (hit = true);
    if (t.canon) {
      const k = t.canon.kinds.findIndex((x) => x.toLowerCase() === low);
      if (k >= 0) for (let i = 0; i < labels.length; i++) if (t.canon.map[i] === k) m[i] = 1, (hit = true);
    }
  }
  if (!hit) {
    const ex = labels.slice(0, 5).map((l) => `"${l}"`).join(', ');
    throw new ExprError('noSuchValue', { value: text, column: t.col?.name ?? '', examples: ex }, a.s);
  }
  return m;
}

function numericLabelMask(t: Typed, op: string, v: number): Uint8Array {
  const labels = t.labels!;
  const m = new Uint8Array(labels.length);
  for (let i = 0; i < labels.length; i++) {
    const x = Number(labels[i]);
    m[i] = x === x && compare(op, x, v) ? 1 : 0;
  }
  return m;
}

export function compare(op: string, a: number, b: number): boolean {
  switch (op) {
    case '==': return a === b;
    case '!=': return a !== b;
    case '<': return a < b;
    case '<=': return a <= b;
    case '>': return a > b;
    default: return a >= b;
  }
}

class Binder {
  aggs: AggSpec[] = [];
  constructor(
    readonly src: string,
    readonly schema: Schema,
  ) {}

  /** A row-level expression. `extra`: an AND-ed filter for aggregates (the `where`). */
  row(a: Ast): Typed {
    switch (a.k) {
      case 'num':
        return { node: { k: 'num', v: a.v }, type: 'num' };
      case 'str':
        throw new ExprError('stringAlone', { value: a.v }, a.s);
      case 'list':
        throw new ExprError('listAlone', {}, a.s);
      case 'where':
        throw new ExprError('whereInside', {}, a.s);
      case 'id': {
        const c = findColumn(this.schema, a.name);
        if (!c) throw new ExprError('unknownColumn', { name: a.name, near: this.near(a.name) }, a.s);
        return { node: { k: 'col', c: c.key }, type: c.type, col: c, labels: c.labels, canon: c.canon };
      }
      case 'un': {
        const x = this.row(a.a);
        if (a.op === '-') this.num(x, a.a);
        else this.bool(x, a.a);
        return { node: { k: 'un', op: a.op, a: x.node }, type: a.op === '-' ? 'num' : 'bool' };
      }
      case 'bin':
        return this.rowBin(a);
      case 'call':
        return this.rowCall(a);
    }
  }

  near(name: string): string {
    const low = name.toLowerCase();
    const hits = this.schema.cols.filter((c) => c.name.toLowerCase().includes(low) || low.includes(c.name.toLowerCase()));
    return (hits.length ? hits : this.schema.cols).slice(0, 6).map((c) => c.name).join(', ');
  }

  num(t: Typed, a: Ast): void {
    if (t.type === 'cat') throw new ExprError('categoryInMath', { column: t.col?.name ?? '' }, a.s);
  }

  bool(t: Typed, a: Ast): void {
    if (t.type === 'cat') throw new ExprError('categoryAlone', { column: t.col?.name ?? '' }, a.s);
  }

  /** The row side of a comparison, or null when it is not a column (a bare word to read as a value). */
  tryRow(a: Ast): Typed | null {
    try {
      return this.row(a);
    } catch (e) {
      if (e instanceof ExprError && (e.key === 'unknownColumn' || e.key === 'stringAlone')) return null;
      throw e;
    }
  }

  rowBin(a: Extract<Ast, { k: 'bin' }>): Typed {
    const { op } = a;
    if (op === 'and' || op === 'or') {
      const x = this.row(a.a);
      const y = this.row(a.b);
      this.bool(x, a.a);
      this.bool(y, a.b);
      return { node: { k: 'bin', op, a: x.node, b: y.node }, type: 'bool' };
    }
    if (op === 'in') {
      const x = this.row(a.a);
      const items = a.b.k === 'list' ? a.b.items : [a.b];
      if (x.type === 'cat') {
        const m = new Uint8Array(x.labels!.length);
        for (const it of items) labelMask(this.src, x, it).forEach((v, i) => (m[i] |= v));
        return { node: { k: 'mask', a: x.node, mask: m }, type: 'bool' };
      }
      let node: RNode | null = null;
      for (const it of items) {
        if (it.k !== 'num') throw new ExprError('inNumbers', {}, it.s);
        const eq: RNode = { k: 'bin', op: '==', a: x.node, b: { k: 'num', v: it.v } };
        node = node ? { k: 'bin', op: 'or', a: node, b: eq } : eq;
      }
      return { node: node ?? { k: 'num', v: 0 }, type: 'bool' };
    }
    if (['==', '!=', '<', '<=', '>', '>='].includes(op)) {
      const x = this.tryRow(a.a);
      const y = this.tryRow(a.b);
      if (x?.type === 'cat' || y?.type === 'cat') {
        const [c, other, flip] = x?.type === 'cat' ? [x, a.b, false] : [y!, a.a, true];
        const ot = flip ? x : y;
        // Two categories of one column: their indices.
        if (ot?.type === 'cat') {
          if (ot.col?.key !== c.col?.key || (op !== '==' && op !== '!=')) throw new ExprError('twoCategories', {}, a.s);
          return { node: { k: 'bin', op, a: c.node, b: ot.node }, type: 'bool' };
        }
        if (op === '==' || op === '!=') {
          const m = labelMask(this.src, c, other);
          if (op === '!=') for (let i = 0; i < m.length; i++) m[i] = m[i] ? 0 : 1;
          return { node: { k: 'mask', a: c.node, mask: m }, type: 'bool' };
        }
        // An ordered comparison on a category of numbers: by its labels' values.
        if (other.k !== 'num' && !(other.k === 'un' && other.a.k === 'num')) throw new ExprError('orderCategory', { column: c.col?.name ?? '' }, a.s);
        const v = other.k === 'num' ? other.v : -(other.a as { v: number }).v;
        const real = flip ? ({ '<': '>', '<=': '>=', '>': '<', '>=': '<=' } as Record<string, string>)[op] : op;
        return { node: { k: 'mask', a: c.node, mask: numericLabelMask(c, real, v) }, type: 'bool' };
      }
      if (!x) throw this.row(a.a), new ExprError('unknownColumn', {}, a.a.s);
      if (!y) throw this.row(a.b), new ExprError('unknownColumn', {}, a.b.s);
      return { node: { k: 'bin', op, a: x.node, b: y.node }, type: 'bool' };
    }
    const x = this.row(a.a);
    const y = this.row(a.b);
    this.num(x, a.a);
    this.num(y, a.b);
    return { node: { k: 'bin', op, a: x.node, b: y.node }, type: 'num' };
  }

  rowCall(a: Extract<Ast, { k: 'call' }>): Typed {
    const fn = a.fn.toLowerCase();
    const args = a.args;
    const arity = (n: number, m = n) => {
      if (args.length < n || args.length > m) throw new ExprError('arity', { fn: a.fn, n: n === m ? String(n) : `${n}-${m}` }, a.s);
    };
    if (AGG_NAMES.has(fn) && !(fn === 'min' || fn === 'max') ) throw new ExprError('aggInRow', { fn: a.fn }, a.s);
    if ((fn === 'min' || fn === 'max') && args.length < 2) throw new ExprError('aggInRow', { fn: a.fn }, a.s);
    if (SCALAR1.has(fn)) {
      arity(1);
      const x = this.row(args[0]);
      this.num(x, args[0]);
      return { node: { k: 'fn', fn, args: [x.node] }, type: 'num' };
    }
    if (fn === 'min' || fn === 'max' || fn === 'clamp' || fn === 'if' || fn === 'hypot' || fn === 'pow') {
      if (fn === 'clamp' || fn === 'if') arity(3);
      if (fn === 'pow') arity(2);
      const xs = args.map((x) => {
        const t = this.row(x);
        this.num(t, x);
        return t.node;
      });
      return { node: { k: 'fn', fn, args: xs }, type: 'num' };
    }
    if (fn === 'weaponclass') {
      arity(1);
      const x = this.row(args[0]);
      const wc = this.schema.weaponClass;
      if (x.type !== 'cat' || !x.labels || !wc) throw new ExprError('needsCategory', { fn: a.fn }, a.s);
      const table = new Int32Array(x.labels.length);
      x.labels.forEach((l, i) => (table[i] = wc.classes.indexOf(wc.of(l) ?? '')));
      const key = (x.node as { c: string }).c;
      return { node: { k: 'map', c: key, table }, type: 'cat', labels: [...wc.classes], col: { name: `weaponClass(${x.col?.name})`, key, type: 'cat' } };
    }
    if (fn === 'contains' || fn === 'startswith' || fn === 'endswith') {
      arity(2);
      const x = this.row(args[0]);
      if (x.type !== 'cat' || !x.labels) throw new ExprError('needsCategory', { fn: a.fn }, a.s);
      const text = asText(this.src, args[1]);
      if (text === null) throw new ExprError('notAValue', { column: x.col?.name ?? '' }, args[1].s);
      const low = text.toLowerCase();
      const m = Uint8Array.from(x.labels, (l) => {
        const s = l.toLowerCase();
        return (fn === 'contains' ? s.includes(low) : fn === 'startswith' ? s.startsWith(low) : s.endsWith(low)) ? 1 : 0;
      });
      return { node: { k: 'mask', a: x.node, mask: m }, type: 'bool' };
    }
    throw new ExprError('unknownFunction', { fn: a.fn }, a.s);
  }

  /** The statistic level: arithmetic over aggregates. */
  value(a: Ast, where: RNode | null): VNode {
    switch (a.k) {
      case 'num':
        return { k: 'num', v: a.v };
      case 'id': {
        const c = findColumn(this.schema, a.name);
        if (c) throw new ExprError('columnOutside', { name: c.name }, a.s);
        throw new ExprError('unknownColumn', { name: a.name, near: this.near(a.name) }, a.s);
      }
      case 'str':
        throw new ExprError('stringAlone', { value: a.v }, a.s);
      case 'list':
        throw new ExprError('listAlone', {}, a.s);
      case 'where': {
        const c = this.row(a.cond);
        this.bool(c, a.cond);
        return this.value(a.a, where ? { k: 'bin', op: 'and', a: where, b: c.node } : c.node);
      }
      case 'un':
        return { k: 'un', op: a.op, a: this.value(a.a, where) };
      case 'bin':
        if (a.op === 'in') throw new ExprError('columnOutside', { name: 'in' }, a.s);
        return { k: 'bin', op: a.op, a: this.value(a.a, where), b: this.value(a.b, where) };
      case 'call':
        return this.valueCall(a, where);
    }
  }

  agg(spec: Omit<AggSpec, 'key'>): VNode {
    const key = JSON.stringify(spec, (_k, v) => (ArrayBuffer.isView(v) ? Array.from(v as Uint8Array) : v));
    let i = this.aggs.findIndex((x) => x.key === key);
    if (i < 0) i = this.aggs.push({ ...spec, key }) - 1;
    return { k: 'agg', i };
  }

  and(a: RNode | null, b: RNode | null): RNode | null {
    return a && b ? { k: 'bin', op: 'and', a, b } : (a ?? b);
  }

  pred(a: Ast): RNode {
    const t = this.row(a);
    this.bool(t, a);
    return t.node;
  }

  numRow(a: Ast): RNode {
    const t = this.row(a);
    this.num(t, a);
    return t.node;
  }

  need(key: string | null, what: string, at: Ast): string {
    if (!key) throw new ExprError('needsColumn', { what }, at.s);
    return key;
  }

  kind(kind: string, at: Ast): RNode {
    const ev = this.schema.cols.find((c) => c.key === this.need(this.schema.event, 'event', at))!;
    const k = ev.canon ? ev.canon.kinds.indexOf(kind) : -1;
    const m = Uint8Array.from(ev.labels ?? [], (l, i) => (ev.canon ? ev.canon.map[i] === k : l.toLowerCase() === kind) ? 1 : 0);
    return { k: 'mask', a: { k: 'col', c: ev.key }, mask: m };
  }

  valueCall(a: Extract<Ast, { k: 'call' }>, where: RNode | null): VNode {
    const fn = a.fn.toLowerCase();
    const args = a.args;
    const arity = (n: number, m = n) => {
      if (args.length < n || args.length > m) throw new ExprError('arity', { fn: a.fn, n: n === m ? String(n) : `${n}-${m}` }, a.s);
    };
    const sch = this.schema;
    switch (fn) {
      case 'count':
        arity(0, 1);
        return this.agg({ fn: 'count', value: null, filter: this.and(where, args[0] ? this.pred(args[0]) : null) });
      case 'countif':
        arity(1);
        return this.agg({ fn: 'count', value: null, filter: this.and(where, this.pred(args[0])) });
      case 'sum':
      case 'avg':
      case 'mean':
      case 'median':
      case 'stdev':
        arity(1);
        return this.agg({ fn: fn === 'mean' ? 'avg' : (fn as AggFn), value: this.numRow(args[0]), filter: where });
      case 'min':
      case 'max':
        if (args.length === 1) return this.agg({ fn, value: this.numRow(args[0]), filter: where });
        return { k: 'fn', fn, args: args.map((x) => this.value(x, where)) };
      case 'sumif':
      case 'avgif':
        arity(2);
        return this.agg({ fn: fn === 'sumif' ? 'sum' : 'avg', value: this.numRow(args[0]), filter: this.and(where, this.pred(args[1])) });
      case 'percentile': {
        arity(2);
        if (args[1].k !== 'num' || args[1].v < 0 || args[1].v > 100) throw new ExprError('percentileP', {}, args[1].s);
        return this.agg({ fn: 'percentile', value: this.numRow(args[0]), filter: where, p: args[1].v });
      }
      case 'distinct': {
        if (args.length < 1) throw new ExprError('arity', { fn: a.fn, n: '1+' }, a.s);
        const ts = args.map((x) => this.row(x));
        return this.agg({ fn: 'distinct', value: null, filter: where, parts: ts.map((t) => t.node), sizes: ts.map((t) => (t.type === 'cat' ? t.labels!.length : 0)) });
      }
      case 'presence':
        arity(0);
        if (!sch.presence) throw new ExprError('needsColumn', { what: 'time+person' }, a.s);
        return this.agg({ fn: 'presence', value: null, filter: where });
      case 'players':
        arity(0);
        return this.agg({ fn: 'distinct', value: null, filter: where, parts: [{ k: 'col', c: this.need(sch.person, 'person', a) }], sizes: [this.size(sch.person!)] });
      case 'matches':
        arity(0);
        return this.agg({ fn: 'distinct', value: null, filter: where, parts: [{ k: 'col', c: this.need(sch.session, 'match', a) }], sizes: [this.size(sch.session!)] });
      case 'rounds': {
        arity(0);
        const r = this.need(sch.round, 'round', a);
        return sch.session
          ? this.agg({ fn: 'distinct', value: null, filter: where, parts: [{ k: 'col', c: sch.session }, { k: 'col', c: r }], sizes: [this.size(sch.session), this.size(r)] })
          : this.agg({ fn: 'distinct', value: null, filter: where, parts: [{ k: 'col', c: r }], sizes: [this.size(r)] });
      }
      case 'kills':
      case 'deaths':
        arity(0);
        return this.agg({ fn: 'count', value: null, filter: this.and(where, this.kind(fn === 'kills' ? 'kill' : 'death', a)) });
      case 'wins':
      case 'played':
      case 'winrate':
        arity(0);
        this.need(sch.won, 'won', a);
        return this.agg({ fn: fn === 'winrate' ? 'winRate' : (fn as AggFn), value: null, filter: where });
      case 'perminute':
        arity(1);
        return { k: 'bin', op: '/', a: this.value(args[0], where), b: { k: 'bin', op: '/', a: this.agg({ fn: 'presence', value: null, filter: where }), b: { k: 'num', v: 60 } } };
      case 'permatch':
      case 'perround':
      case 'perplayer': {
        arity(1);
        const den = this.valueCall({ k: 'call', fn: fn === 'permatch' ? 'matches' : fn === 'perround' ? 'rounds' : 'players', args: [], s: a.s, e: a.e }, where);
        return { k: 'bin', op: '/', a: this.value(args[0], where), b: den };
      }
      case 'ofall':
        arity(1);
        return { k: 'ofAll', a: this.value(args[0], where) };
      case 'shrink': {
        arity(2, 3);
        const m = args[2] ? args[2] : null;
        if (m && (m.k !== 'num' || m.v < 0)) throw new ExprError('shrinkM', {}, m.s);
        return { k: 'shrink', num: this.value(args[0], where), den: this.value(args[1], where), m: m ? (m as { v: number }).v : 4 };
      }
      case 'kd':
        arity(0);
        return { k: 'shrink', num: this.valueCall({ ...a, fn: 'kills' }, where), den: this.valueCall({ ...a, fn: 'deaths' }, where), m: 4 };
      default:
        if (SCALAR1.has(fn) || fn === 'clamp' || fn === 'if' || fn === 'hypot' || fn === 'pow') {
          if (fn === 'clamp' || fn === 'if') arity(3);
          else if (fn === 'pow') arity(2);
          else if (fn !== 'hypot') arity(1);
          return { k: 'fn', fn, args: args.map((x) => this.value(x, where)) };
        }
        if (fn === 'weaponclass' || fn === 'contains' || fn === 'startswith' || fn === 'endswith') throw new ExprError('columnOutside', { name: a.fn }, a.s);
        throw new ExprError('unknownFunction', { fn: a.fn }, a.s);
    }
  }

  size(key: string): number {
    return this.schema.cols.find((c) => c.key === key)?.labels?.length ?? 0;
  }
}

/** A group's filter: a row-level yes or no. Empty text is every row. */
export function bindPredicate(src: string, schema: Schema): RNode | null {
  if (!src.trim()) return null;
  const b = new Binder(src, schema);
  const ast = parse(src);
  if (ast.k === 'where') throw new ExprError('whereInFilter', {}, ast.s);
  return b.pred(ast);
}

/** A calculated column: a row-level number, a yes / no counting as 1 or 0 (the dashboards' columns). */
export function bindRow(src: string, schema: Schema): RNode {
  const b = new Binder(src, schema);
  const ast = parse(src);
  if (ast.k === 'where') throw new ExprError('whereInFilter', {}, ast.s);
  return b.row(ast).node;
}

/** A statistic: arithmetic over aggregates, each folded over the rows. */
export function bindMetric(src: string, schema: Schema): BoundMetric {
  const b = new Binder(src, schema);
  const expr = b.value(parse(src), null);
  if (!b.aggs.length) throw new ExprError('noAggregate', {}, 0);
  return { aggs: b.aggs, expr };
}

/** The columns a bound expression reads. */
export function columnsOf(n: RNode | null, out = new Set<string>()): Set<string> {
  if (!n) return out;
  switch (n.k) {
    case 'col':
    case 'map':
      out.add(n.c);
      break;
    case 'mask':
    case 'un':
      columnsOf(n.a, out);
      break;
    case 'bin':
      columnsOf(n.a, out);
      columnsOf(n.b, out);
      break;
    case 'fn':
      n.args.forEach((x) => columnsOf(x, out));
      break;
  }
  return out;
}

/**
 * A filter as plain per-column conditions - each `column in values` or
 * `low <= column <= high`, all AND-ed - or null when it is more than that.
 * What can become a view filter or a difference split.
 */
export type Simple = { key: string; values?: number[]; range?: [number, number] }[];

export function simpleForm(n: RNode | null): Simple | null {
  if (!n) return [];
  if (n.k === 'bin' && n.op === 'and') {
    const a = simpleForm(n.a);
    const b = simpleForm(n.b);
    return a && b ? [...a, ...b] : null;
  }
  if (n.k === 'mask' && n.a.k === 'col') {
    const values: number[] = [];
    n.mask.forEach((v, i) => v && values.push(i));
    return [{ key: n.a.c, values }];
  }
  if (n.k === 'bin' && n.a.k === 'col' && n.b.k === 'num' && ['<', '<=', '>', '>=', '=='].includes(n.op)) {
    const v = n.b.v;
    const r: [number, number] = n.op === '==' ? [v, v] : n.op[0] === '<' ? [-Infinity, v] : [v, Infinity];
    return [{ key: n.a.c, range: r }];
  }
  return null;
}
