/**
 * Messages with their numbers and words filled in, in the ICU message syntax
 * every translation tool knows - the part of it the viewer uses:
 *
 * - `{name}`: a value put in as it is given;
 * - `{n, plural, =0 {none} one {# lap} few {# laps} other {# laps}}`: the
 *   branch for the number under the language's own plural rules (`one`,
 *   `two`, `few`, `many`, `other`, or an exact `=n`), `#` the number written
 *   the language's way;
 * - `{kind, select, crash {crashed} other {hit something}}`: the branch for a
 *   word.
 *
 * Branches nest. Unlike full ICU, an apostrophe is only an apostrophe: car
 * names and English possessives are full of them.
 */

type Part = string | { name: string } | { name: string; kind: 'plural' | 'select'; branches: Map<string, Part[]> };

const parsed = new Map<string, Part[]>();

function parse(text: string): Part[] {
  let i = 0;
  const parts = (inBranch: boolean): Part[] => {
    const out: Part[] = [];
    let literal = '';
    while (i < text.length) {
      const c = text[i];
      if (c === '}' && inBranch) break;
      if (c === '{') {
        if (literal) out.push(literal);
        literal = '';
        i++;
        out.push(argument());
        continue;
      }
      literal += c;
      i++;
    }
    if (literal) out.push(literal);
    return out;
  };
  const argument = (): Part => {
    const end = (stop: string) => {
      const from = i;
      while (i < text.length && !stop.includes(text[i])) i++;
      return text.slice(from, i).trim();
    };
    const name = end(',}');
    if (text[i] === '}') {
      i++;
      return { name };
    }
    i++; // ','
    const kind = end(',}');
    if (kind !== 'plural' && kind !== 'select') throw new Error(`unknown argument type "${kind}" in: ${text}`);
    i++; // ','
    const branches = new Map<string, Part[]>();
    for (;;) {
      while (i < text.length && /\s/.test(text[i])) i++;
      if (text[i] === '}') {
        i++;
        break;
      }
      const key = end('{');
      if (text[i] !== '{') throw new Error(`branch "${key}" without a body in: ${text}`);
      i++;
      branches.set(key, parts(true));
      if (text[i] !== '}') throw new Error(`unclosed branch "${key}" in: ${text}`);
      i++;
    }
    if (!branches.has('other')) throw new Error(`no "other" branch in: ${text}`);
    return { name, kind, branches };
  };
  const out = parts(false);
  if (i < text.length) throw new Error(`unbalanced "}" in: ${text}`);
  return out;
}

/** The parts of a message; throws on a message that does not parse. */
export function messageParts(text: string): Part[] {
  let p = parsed.get(text);
  if (!p) {
    p = parse(text);
    parsed.set(text, p);
  }
  return p;
}

/** The names of a message's arguments, branches included. */
export function argumentNames(text: string): Set<string> {
  const names = new Set<string>();
  const walk = (parts: Part[]) => {
    for (const p of parts) {
      if (typeof p === 'string') continue;
      names.add(p.name);
      if ('branches' in p) for (const b of p.branches.values()) walk(b);
    }
  };
  walk(messageParts(text));
  return names;
}

export type Values = Record<string, string | number | undefined>;

/** A message with `values` filled in, under `locale`'s plural rules and numbers. */
export function formatMessage(text: string, values: Values, locale: string): string {
  const rules = pluralRules(locale);
  const write = (parts: Part[], count: number | null): string => {
    let out = '';
    for (const p of parts) {
      if (typeof p === 'string') {
        out += count === null ? p : p.replace(/#/g, numberFormat(locale).format(count));
        continue;
      }
      const v = values[p.name];
      if (!('branches' in p)) {
        out += v === undefined ? `{${p.name}}` : String(v);
        continue;
      }
      if (p.kind === 'plural') {
        const n = typeof v === 'number' ? v : Number(v);
        const branch = p.branches.get(`=${n}`) ?? p.branches.get(rules.select(n)) ?? p.branches.get('other')!;
        out += write(branch, n);
      } else {
        out += write(p.branches.get(String(v)) ?? p.branches.get('other')!, count);
      }
    }
    return out;
  };
  return write(messageParts(text), null);
}

const rulesCache = new Map<string, Intl.PluralRules>();
function pluralRules(locale: string): Intl.PluralRules {
  let r = rulesCache.get(locale);
  if (!r) rulesCache.set(locale, (r = new Intl.PluralRules(locale)));
  return r;
}

const numberCache = new Map<string, Intl.NumberFormat>();
function numberFormat(locale: string): Intl.NumberFormat {
  let f = numberCache.get(locale);
  if (!f) numberCache.set(locale, (f = new Intl.NumberFormat(locale)));
  return f;
}
