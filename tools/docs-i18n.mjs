/**
 * The documentation site in every language of the viewer.
 *
 *   node tools/docs-i18n.mjs sync [--lang <code>]   make every language's page tree match the English one
 *   node tools/docs-i18n.mjs status                 per language: translated, outdated, not translated
 *   node tools/docs-i18n.mjs todo <code>            the pages of a language that need translating
 *
 * English pages are docs/<page>.md. A language's pages are the Jekyll
 * collection docs/_<code>/<page>.md, served at /<code>/<page>.html, each with
 *
 *   lang, source (the English file), source_hash (sha256 of the English file
 *   it was translated from, 12 hex digits), translated (true/false), outdated
 *
 * `sync` writes a short stub for every page not translated yet (it points to
 * the English page), keeps the front matter of translated pages in step with
 * the English one (titles and parents through docs/_data/i18n/<code>.json),
 * marks a translation `outdated` when its English source changed, points each
 * picture at the language's own screenshot where one exists
 * (docs/assets/img/<code>/) and at the English one otherwise, and writes the
 * language list (docs/_data/languages.json) and the collections block of
 * docs/_config.yml. Reference pages (ref-*.md) are written by
 * tools/docs-refs.mjs --lang <code>. See tools/docs-translate.md.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const REPO = resolve(import.meta.dirname, '..');
const DOCS = join(REPO, 'docs');
const [cmd = 'status', ...rest] = process.argv.slice(2);
const only = rest.includes('--lang') ? rest[rest.indexOf('--lang') + 1] : cmd === 'todo' ? rest[0] : null;

const LANGS = [...readFileSync(join(REPO, 'src/i18n/languages.ts'), 'utf8').matchAll(/\{ code: '([\w-]+)', name: '([^']+)'/g)].map((m) => ({ code: m[1], name: m[2] }));
const OTHER = LANGS.filter((l) => l.code !== 'en' && (!only || l.code === only));

// ------------------------------------------------------------ front matter

export function splitFront(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { front: {}, order: [], body: text };
  const front = {};
  const order = [];
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([\w-]+):\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim();
    if (/^".*"$/.test(v)) v = JSON.parse(v);
    else if (/^'.*'$/.test(v)) v = v.slice(1, -1).replace(/''/g, "'");
    else if (v === 'true' || v === 'false') v = v === 'true';
    front[kv[1]] = v;
    order.push(kv[1]);
  }
  return { front, order, body: text.slice(m[0].length) };
}
const yaml = (v) => (typeof v === 'boolean' || typeof v === 'number' || /^-?\d+(\.\d+)?$/.test(String(v)) ? String(v) : JSON.stringify(String(v)));
function joinFront(front, body) {
  const lines = Object.entries(front)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k}: ${yaml(v)}`);
  return `---\n${lines.join('\n')}\n---\n${body.startsWith('\n') ? '' : '\n'}${body}`;
}

const hash = (text) => createHash('sha256').update(text.replace(/\r\n/g, '\n')).digest('hex').slice(0, 12);
const englishPages = () =>
  readdirSync(DOCS)
    .filter((f) => f.endsWith('.md'))
    .sort();
const strings = (code) => {
  const p = join(DOCS, '_data', 'i18n', `${code}.json`);
  return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : { titles: {}, ui: {} };
};

/** kramdown's automatic header id, so a translated heading keeps the English anchor. */
export function slug(text) {
  return text
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/^[^\p{L}]+/u, '')
    .trim()
    .replace(/\s/g, '-');
}
/** English body ready to translate: every heading carries its English anchor. */
export function anchored(body) {
  let fence = false;
  return body
    .split('\n')
    .map((line) => {
      if (/^\s*```/.test(line)) fence = !fence;
      if (fence) return line;
      const h = line.match(/^(#{2,6})\s+(.*?)\s*$/);
      if (!h || /\{#[\w-]+\}\s*$/.test(h[2])) return line;
      return `${h[1]} ${h[2]} {#${slug(h[2])}}`;
    })
    .join('\n');
}
/** Pictures: the language's own screenshot where there is one, else the English one. */
function pictures(body, code) {
  return body.replace(/\]\((?:\.\.\/)?assets\/img\/[\w-]+\/([\w.-]+\.webp)\)/g, (_, name) => {
    const own = existsSync(join(DOCS, 'assets', 'img', code, name));
    return `](../assets/img/${own ? code : 'en'}/${name})`;
  });
}

// ------------------------------------------------------------ config and data

function writeConfig() {
  const p = join(DOCS, '_config.yml');
  let s = readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
  s = s.replace(/\n?# i18n:begin[\s\S]*# i18n:end\n?/, '\n');
  const block = [
    '# i18n:begin (written by tools/docs-i18n.mjs)',
    'collections:',
    ...LANGS.filter((l) => l.code !== 'en').map((l) => `  ${l.code}:\n    output: true\n    permalink: /${l.code}/:name:output_ext`),
    'relative_links:',
    '  enabled: true',
    '  collections: true',
    'defaults:',
    '  - scope:',
    '      path: ""',
    '    values:',
    '      lang: en',
    ...LANGS.filter((l) => l.code !== 'en').flatMap((l) => ['  - scope:', '      path: ""', `      type: ${l.code}`, '    values:', `      lang: ${l.code}`, '      layout: default']),
    '# i18n:end',
  ].join('\n');
  if (!/jekyll-relative-links/.test(s)) s = s.replace(/plugins:\n/, 'plugins:\n  - jekyll-relative-links\n');
  writeFileSync(p, `${s.trimEnd()}\n${block}\n`);
  mkdirSync(join(DOCS, '_data'), { recursive: true });
  writeFileSync(join(DOCS, '_data', 'languages.json'), `${JSON.stringify(LANGS, null, 1)}\n`);
}

function writeEnglishStrings(pages) {
  const p = join(DOCS, '_data', 'i18n', 'en.json');
  const old = existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : {};
  const titles = {};
  for (const f of pages) {
    const t = splitFront(readFileSync(join(DOCS, f), 'utf8')).front.title;
    if (t) titles[t] = t;
  }
  const ui = {
    language: 'Language',
    untranslated: 'Not translated yet',
    untranslatedBody: 'This page has not been translated yet. Read it in English:',
    outdated: 'This translation may be out of date: the English page is newer.',
    english: 'English version',
    ...(old.ui ?? {}),
  };
  mkdirSync(join(DOCS, '_data', 'i18n'), { recursive: true });
  writeFileSync(p, `${JSON.stringify({ titles, ui }, null, 1)}\n`);
}

// ------------------------------------------------------------ sync

function sync() {
  const pages = englishPages();
  writeConfig();
  writeEnglishStrings(pages);
  for (const { code } of OTHER) {
    const dir = join(DOCS, `_${code}`);
    mkdirSync(dir, { recursive: true });
    const { titles = {} } = strings(code);
    const tr = (t) => (t ? titles[t] || t : t);
    for (const f of pages) {
      if (f.startsWith('ref-')) continue; // tools/docs-refs.mjs --lang writes these
      const english = readFileSync(join(DOCS, f), 'utf8');
      const en = splitFront(english).front;
      const file = join(dir, f);
      const old = existsSync(file) ? splitFront(readFileSync(file, 'utf8')) : null;
      const translated = old?.front.translated === true;
      const front = {
        title: tr(en.title),
        parent: tr(en.parent),
        grand_parent: tr(en.grand_parent),
        nav_order: en.nav_order,
        has_children: en.has_children,
        nav_exclude: en.nav_exclude,
        lang: code,
        source: f,
        source_hash: translated ? old.front.source_hash : hash(english),
        translated,
        outdated: translated && old.front.source_hash !== hash(english),
      };
      const body = translated
        ? pictures(old.body, code)
        : `\n{{ site.data.i18n[page.lang].ui.untranslatedBody | default: site.data.i18n.en.ui.untranslatedBody }} [{{ site.data.i18n[page.lang].ui.english | default: "English" }}](../${f.replace(/\.md$/, '.html').replace(/^index\.html$/, '')})\n`;
      const text = joinFront(front, body);
      if (!old || readFileSync(file, 'utf8') !== text) writeFileSync(file, text);
    }
    for (const f of readdirSync(dir)) if (f.endsWith('.md') && !f.startsWith('ref-') && !pages.includes(f)) rmSync(join(dir, f));
  }
}

function status(print = true) {
  const pages = englishPages().filter((f) => !f.startsWith('ref-'));
  const rows = [];
  for (const { code } of OTHER) {
    const n = { code, translated: 0, outdated: 0, missing: 0, todo: [] };
    for (const f of pages) {
      const file = join(DOCS, `_${code}`, f);
      const fr = existsSync(file) ? splitFront(readFileSync(file, 'utf8')).front : null;
      if (!fr || fr.translated !== true) {
        n.missing++;
        n.todo.push(f);
      } else if (fr.source_hash !== hash(readFileSync(join(DOCS, f), 'utf8'))) {
        n.outdated++;
        n.todo.push(f);
      } else n.translated++;
    }
    rows.push(n);
  }
  if (print) for (const r of rows) console.log(`${r.code.padEnd(8)} translated ${r.translated}, outdated ${r.outdated}, not translated ${r.missing}`);
  return rows;
}

/** The English text a translator starts from: front matter for the title, headings anchored. */
export function englishForTranslation(f) {
  const { body } = splitFront(readFileSync(join(DOCS, f), 'utf8'));
  return anchored(body);
}

/**
 * The UI's own words for a page: every **bold** term and every heading of the
 * English pages that is a label of the viewer, with the label in `code`.
 */
function terms(code, files) {
  const load = (lang) => {
    const out = {};
    const dir = join(REPO, 'src', 'i18n', 'locales', lang);
    for (const f of readdirSync(dir)) if (f.endsWith('.json')) Object.assign(out, JSON.parse(readFileSync(join(dir, f), 'utf8')));
    return out;
  };
  const en = load('en');
  const other = load(code);
  const byText = new Map();
  for (const [k, v] of Object.entries(en)) if (typeof v === 'string' && v.length < 80 && !byText.has(v)) byText.set(v, k);
  const seen = new Set();
  for (const f of files) {
    const body = splitFront(readFileSync(join(DOCS, f), 'utf8')).body;
    for (const m of body.matchAll(/\*\*([^*\n]{1,80})\*\*/g)) {
      const t = m[1].replace(/[.…:]+$/, '').trim();
      for (const cand of [t, `${t}…`, `${t}:`]) {
        const k = byText.get(cand);
        if (k && other[k] && !seen.has(cand)) {
          seen.add(cand);
          console.log(`${cand}\t${other[k]}`);
        }
      }
    }
  }
}

if (cmd === 'terms') terms(rest[0], rest.slice(1));
else if (cmd === 'sync') {
  sync();
  status();
} else if (cmd === 'status') status();
else if (cmd === 'todo') for (const f of status(false)[0]?.todo ?? []) console.log(f);
else if (cmd === 'source') process.stdout.write(englishForTranslation(rest[0]));
else {
  console.error('usage: node tools/docs-i18n.mjs sync|status|todo <code>|source <page.md>');
  process.exit(2);
}
