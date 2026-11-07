import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { int, list, num, setLanguage, t } from '.';
import { detect, LANGUAGES } from './languages';
import { argumentNames, formatMessage, messageParts } from './message';

const LOCALES = join(__dirname, 'locales');

/** Every catalog file of a language, merged. */
function catalog(code: string): Record<string, string> {
  const dir = join(LOCALES, code);
  const out: Record<string, string> = {};
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    Object.assign(out, JSON.parse(readFileSync(join(dir, file), 'utf8')));
  }
  return out;
}

/** The plural and select arguments of a message, with their branch keys. */
function branches(text: string): Map<string, Set<string>> {
  const out = new Map<string, Set<string>>();
  const walk = (parts: ReturnType<typeof messageParts>) => {
    for (const p of parts) {
      if (typeof p === 'string' || !('branches' in p)) continue;
      out.set(`${p.name}:${p.kind}`, new Set(p.branches.keys()));
      for (const b of p.branches.values()) walk(b);
    }
  };
  walk(messageParts(text));
  return out;
}

const english = catalog('en');
const translated = readdirSync(LOCALES).filter((d) => d !== 'en' && statSync(join(LOCALES, d)).isDirectory());

describe('messages', () => {
  it('fills in values, plurals by the language, and choices', () => {
    const laps = '{laps} of {total, plural, one {# lap} other {# laps}}';
    expect(formatMessage(laps, { laps: 3, total: 1 }, 'en')).toBe('3 of 1 lap');
    expect(formatMessage(laps, { laps: 3, total: 1200 }, 'en')).toBe('3 of 1,200 laps');
    const pl = '{n, plural, one {# okrążenie} few {# okrążenia} many {# okrążeń} other {# okrążenia}}';
    expect([1, 3, 5, 22, 25].map((n) => formatMessage(pl, { n }, 'pl'))).toEqual([
      '1 okrążenie',
      '3 okrążenia',
      '5 okrążeń',
      '22 okrążenia',
      '25 okrążeń',
    ]);
    const nested = '{kind, select, crash {crashed{g, select, none {} other { at {g} g}}} other {hit something}}';
    expect(formatMessage(nested, { kind: 'crash', g: '5.4' }, 'en')).toBe('crashed at 5.4 g');
    expect(formatMessage(nested, { kind: 'crash', g: 'none' }, 'en')).toBe('crashed');
    expect(formatMessage(nested, { kind: 'hit' }, 'en')).toBe('hit something');
    expect(formatMessage("{name}'s car", { name: "BMW M4 '21" }, 'en')).toBe("BMW M4 '21's car");
    expect([...argumentNames(nested)].sort()).toEqual(['g', 'kind']);
    expect(() => messageParts('{n, plural, one {a}}')).toThrow(/other/);
    expect(() => messageParts('open {name')).toThrow();
  });

  it('writes numbers and lists the language\'s way', async () => {
    await setLanguage('en');
    expect(num(3108.456, 2)).toBe('3108.46');
    expect(int(12345)).toBe('12,345');
    expect(list(['a', 'b', 'c'])).toBe('a, b, and c');
    expect(list(['a', 'b'], 'unit')).toBe('a, b');
    if (translated.includes('de')) {
      await setLanguage('de');
      expect(num(3108.456, 2)).toBe('3108,46');
      expect(int(12345)).toBe('12.345');
      expect(list(['a', 'b', 'c'])).toBe('a, b und c');
    }
  });

  it("speaks the first of the browser's languages it knows", () => {
    expect(detect(['de-AT', 'en'])).toBe('de');
    expect(detect(['nb-NO'])).toBe('no');
    expect(detect(['zh-TW'])).toBe('zh-Hant');
    expect(detect(['zh-Hant-HK'])).toBe('zh-Hant');
    expect(detect(['zh-CN'])).toBe('zh');
    expect(detect(['sr-Latn-RS'])).toBe('sr');
    expect(detect(['pt-BR'])).toBe('pt');
    expect(detect(['xx', 'fr-CA'])).toBe('fr');
    expect(detect(['xx'])).toBe('en');
    expect(LANGUAGES).toHaveLength(40);
  });
});

describe('the catalogs', () => {
  afterAll(() => setLanguage('en'));

  it('have every message the code asks for, in English', () => {
    const missing: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const p = join(dir, name);
        if (statSync(p).isDirectory()) walk(p);
        else if (/\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name)) {
          const text = readFileSync(p, 'utf8');
          for (const m of text.matchAll(/\bt\(\s*'([a-z][\w.-]*)'/g)) if (!(m[1] in english)) missing.push(`${name}: ${m[1]}`);
          // Keys kept in tables and handed to t() later.
          for (const m of text.matchAll(/'((?:app|common|data|heat|match|race|render|state|ui)\.[\w-]+(?:\.[\w-]+)+)'/g)) {
            if (!(m[1] in english)) missing.push(`${name}: ${m[1]}`);
          }
        }
      }
    };
    walk(join(__dirname, '..'));
    expect(missing).toEqual([]);
  });

  it('have the messages the code puts together from parts', async () => {
    const { MISTAKE_ORDER } = await import('../race/stats');
    const { CHANNELS } = await import('../race/schema');
    const profile = readFileSync(join(__dirname, '../race/profile.ts'), 'utf8');
    const traits = [...profile.matchAll(/(?:plus|minus)\[[^\]]+\]\.push\(([^)]*)\)/g)].flatMap((m) =>
      [...m[1].matchAll(/'(\w+)'/g)].map((x) => `race.cars.trait.${x[1]}`),
    );
    const wanted = [
      ...MISTAKE_ORDER.flatMap((m) => ['label', 'short', 'count', 'here'].map((f) => `race.mistake.${m}.${f}`)),
      ...traits,
      ...Object.keys(CHANNELS).map((name) => `race.channel.${name}.label`),
    ];
    expect(traits.length).toBeGreaterThan(10);
    expect(wanted.filter((k) => !(k in english))).toEqual([]);
  });

  it('parse, in every language', () => {
    const broken: string[] = [];
    for (const code of ['en', ...translated]) {
      for (const [key, text] of Object.entries(catalog(code))) {
        try {
          messageParts(text);
        } catch (e) {
          broken.push(`${code} ${key}: ${(e as Error).message}`);
        }
      }
    }
    expect(broken).toEqual([]);
  });

  it('keep the values and choices of the English, in every language', () => {
    const wrong: string[] = [];
    for (const code of translated) {
      for (const [key, text] of Object.entries(catalog(code))) {
        const source = english[key];
        if (source === undefined) {
          wrong.push(`${code} ${key}: not an English message`);
          continue;
        }
        let names: Set<string>;
        try {
          names = argumentNames(text);
        } catch {
          continue; // said by the test above
        }
        const want = argumentNames(source);
        const extra = [...names].filter((n) => !want.has(n));
        const lost = [...want].filter((n) => !names.has(n));
        if (extra.length || lost.length) wrong.push(`${code} ${key}: values ${JSON.stringify({ extra, lost })}`);
        // Each choice keeps English's words to choose by (plurals take the language's own).
        const mine = branches(text);
        for (const [arg, keys] of branches(source)) {
          if (arg.endsWith(':plural')) continue;
          const theirs = mine.get(arg);
          if (!theirs) wrong.push(`${code} ${key}: lost the choice ${arg}`);
          else for (const k of keys) if (!theirs.has(k) && k !== 'other') wrong.push(`${code} ${key}: ${arg} lost "${k}"`);
        }
      }
    }
    expect(wrong).toEqual([]);
  });

  it('are complete, in every language', () => {
    const missing: string[] = [];
    for (const code of translated) {
      const have = catalog(code);
      const lacking = Object.keys(english).filter((k) => !(k in have));
      if (lacking.length) missing.push(`${code}: ${lacking.length} missing, e.g. ${lacking.slice(0, 3).join(', ')}`);
    }
    expect(missing).toEqual([]);
    expect(translated.sort()).toEqual(LANGUAGES.map((l) => l.code).filter((c) => c !== 'en').sort());
  });

  it('say a message in the language picked, and fall back to English', async () => {
    await setLanguage('en');
    expect(t('common.language')).toBe('Language');
    expect(t('no.such.message')).toBe('no.such.message');
  });
});
