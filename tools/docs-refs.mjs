/**
 * Writes the documentation's reference pages from the code, so they cannot
 * drift from it: event types and classes, the column names the loader
 * recognises, the languages, the browser keys the viewer keeps, the settings
 * kept in the browser, the value tables and the command-line tools.
 *
 *   node tools/docs-refs.mjs [--lang en] [--check]
 *
 * Labels (event and class names) come from the language's locale files, so
 * each language's pages name things as its UI does. Pages go to docs/ for
 * English and docs/<lang>/ otherwise. --check writes nothing and exits 1 when
 * a page would change (for a release check or CI).
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : fallback;
};
const LANG = arg('lang', 'en');
const CHECK = process.argv.includes('--check');
const REPO = resolve(import.meta.dirname, '..');
const OUT = LANG === 'en' ? join(REPO, 'docs') : join(REPO, 'docs', `_${LANG}`);
const src = (p) => readFileSync(join(REPO, p), 'utf8');

const strings = {};
for (const lang of ['en', LANG]) {
  const dir = join(REPO, 'src', 'i18n', 'locales', lang);
  for (const f of readdirSync(dir)) if (f.endsWith('.json')) Object.assign(strings, JSON.parse(readFileSync(join(dir, f), 'utf8')));
}
const L = (key, fallback) => strings[key] ?? fallback ?? key;
const cell = (s) => String(s).replace(/\|/g, '\\|');
// Titles in the language (docs/_data/i18n/<lang>.json, see tools/docs-i18n.mjs); the tables' labels are
// the UI's own; the prose is the "refs" table of the same file.
const TITLES = (() => {
  const p = join(REPO, 'docs', '_data', 'i18n', `${LANG}.json`);
  return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')).titles ?? {} : {};
})();
const T = (t) => TITLES[t] || t;
// All prose of the pages: docs/_data/i18n/en.json "refs", overridden per language by <lang>.json "refs".
const refsOf = (l) => {
  const p = join(REPO, 'docs', '_data', 'i18n', `${l}.json`);
  return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')).refs ?? {} : {};
};
// English fallback, so a missing "refs" in en.json never shows raw keys (en.json is the source to edit).
const EN_FALLBACK = {
  "event.intro": "The viewer adds an **Event type** column to every dataset that has an event column (`event`, `events`, `event_type` or `event_name`). Each game's own words are mapped to one of these kinds (upper and lower case alike); a word not listed counts as *Other*.",
  "event.empty": "(empty)",
  "event.th.kind": "Kind",
  "event.th.shown": "Shown as",
  "event.th.words": "Words in the data",
  "event.classes.h": "Vehicle classes",
  "event.classes.intro": "The **Vehicle class** and **Target class** columns use these classes, worked out from vehicle names (through the [figure catalogue](figures.md)) and type columns.",
  "event.th.class": "Class",
  "columns.intro": "When a file is loaded, each role is given to the first column whose name matches one of these patterns (regular expressions, tried in order; `i` = any case). Every guess can be changed in [Column mapping](column-mapping.md), and a Parquet file can name its columns itself ([the `heat3d` hints](data-formats.md#the-heat3d-hints)).",
  "columns.th.role": "Role",
  "columns.th.patterns": "Name patterns",
  "columns.th.examples": "Examples that match",
  "columns.role.X": "X",
  "columns.role.Y": "Y",
  "columns.role.Z": "Z",
  "columns.role.Time": "Time",
  "columns.role.Person": "Person",
  "columns.role.Session": "Session (match, round)",
  "columns.role.Group": "Group (team)",
  "columns.role.Yaw": "Yaw",
  "columns.role.Pitch": "Pitch",
  "columns.elapsed": "and elapsed-time names (`elapsed`, `match_time` ...)",
  "languages.intro": "The viewer speaks {n} languages. It starts in the browser's language when it has it, and the language menu at the top of the sidebar changes it. How to change it, and how translations are made: [Languages](languages.md).",
  "languages.th.code": "Code",
  "languages.th.language": "Language",
  "keys.intro": "So that a loaded session is not lost to a stray shortcut, the viewer keeps these keys from the browser.",
  "keys.th.keys": "Keys",
  "keys.th.when": "When",
  "keys.th.effect": "Effect",
  "keys.ctrl.also": "(also with `Cmd`)",
  "keys.ctrl.when": "outside text boxes",
  "keys.ctrl.effect": "the browser's action (print, save, open, reload, new window, close ...) does not happen",
  "keys.plain.when": "always",
  "keys.plain.effect": "the browser's action (help, find, reload, address bar, caret browsing) does not happen",
  "keys.locked.when": "in full screen",
  "keys.locked.effect": "locked for the viewer (Keyboard Lock API), so the browser does not act on them",
  "keys.close.keys": "closing or reloading the tab",
  "keys.close.when": "with data or a level loaded",
  "keys.close.effect": "the browser asks first",
  "keys.outro": "All the viewer's own keys: [Keyboard and mouse reference](keyboard-reference.md).",
  "settings.intro": "What the viewer keeps in your browser (`localStorage`) between visits. Nothing of it is sent anywhere. Clearing the site data in the browser removes it all.",
  "settings.th.key": "Key",
  "settings.th.holds": "Holds",
  "settings.th.code": "Code",
  "settings.outro": "Heat settings, filters and the view mode are not kept: they start fresh with each load.",
  "settings.m.heat3d.language": "the language picked",
  "settings.m.heat3d.units": "the units preset and single units",
  "settings.m.heat3d.help": "help mode on or off",
  "settings.m.heat3d.far": "figures at a distance, symbols, hit marks, aim lines",
  "settings.m.heat3d.replay": "replay labels, tactical display, 2D map, charts, head-up display, look, buildings, follow camera",
  "settings.m.heat3d.speed": "the playback speed",
  "settings.m.heat3d.mirror": "the axis mirroring",
  "settings.m.heat3d.inspect": "the pick card and camera readout",
  "settings.m.heat3d.bookmarks.": "bookmarks, per recording",
  "settings.m.3dheat.volumes.": "volumes, per dataset",
  "settings.m.3dheat.objectives": "objectives shown, layers, labels",
  "settings.m.heat3d.carNames": "car names in the race tab",
  "settings.m.heat3d.ai": "external AI: provider, address, model, options (not the key)",
  "settings.m.heat3d.ai.key": "the external AI key, only when *Remember the key* is ticked",
  "values.intro": "The price tables of [Value weighting](value-weighting.md). The game is recognised from names in the data; a converter's own value columns in the game's currency win over these.",
  "values.th.table": "Table",
  "values.th.currency": "Currency",
  "values.th.defined": "Defined in",
  "tools.intro": "The command-line tools in the viewer's `tools/` folder (Node.js, run from the repository root). You never need them to use the viewer: they pack, summarise and convert your data, and help whoever maintains the viewer. Each entry has the first paragraph of the tool's own description and its usage lines; run a tool without arguments for its full help where it has one. The data tools of the [related repositories](index.md#related-repositories) document their own commands.",
  "tools.user.h": "For your data",
  "tools.dev.h": "For developers and the docs",
  "tools.dev.intro": "These check the viewer, make the demo data and the screenshots, and write the reference pages.",
  "tools.lib.h": "Libraries",
  "tools.lib.item": "`{tool}` is a library with no command line: the tools above import it to read and write the [.3dheat file](container.md)."
};
const REFS = { ...EN_FALLBACK, ...refsOf('en'), ...(LANG === 'en' ? {} : refsOf(LANG)) };
const R = (key, vars = {}) => (REFS[key] ?? key).replace(/\{(\w+)\}/g, (m, n) => (n in vars ? String(vars[n]) : m));
const row = (...c) => `| ${c.join(' | ')} |\n`;
const head = (...c) => row(...c) + `|${c.map(() => '---').join('|')}|\n`;
const h2 = (key, slug) => `## ${R(key)} {#${slug}}`;
const page = (title, order, body, file) => {
  const extra = LANG === 'en' ? '' : `lang: ${LANG}
source: ${file}
translated: true
`;
  return `---
title: ${JSON.stringify(T(title))}
parent: ${JSON.stringify(T('Reference'))}
nav_order: ${order}
${extra}---

<!-- Generated by tools/docs-refs.mjs from the code. Do not edit by hand. -->

# ${T(title)}

${body.trim()}
`;
};

const pages = {};

// ------------------------------------------------------------ event types and classes
{
  const canon = src('src/data/canonical.ts');
  const list = (name) => JSON.parse(canon.match(new RegExp(`export const ${name} = (\\[[^\\]]*\\])`))[1].replace(/'/g, '"'));
  const kinds = list('EVENT_KINDS');
  const classes = list('VEHICLE_CLASSES');
  const mapText = canon.slice(canon.indexOf('const EVENT_MAP'), canon.indexOf('};', canon.indexOf('const EVENT_MAP')));
  const words = {};
  for (const m of mapText.matchAll(/(?:'([^']*)'|([A-Za-z_][\w]*))\s*:\s*'(\w+)'/g)) {
    const word = m[1] ?? m[2];
    (words[m[3]] ??= []).push(word === '' ? R('event.empty') : word);
  }
  let body = `${R('event.intro')}\n\n` + head(R('event.th.kind'), R('event.th.shown'), R('event.th.words'));
  for (const k of kinds) body += row(`\`${k}\``, cell(L(`heat.filterPanel.event.${k}`, k)), (words[k] ?? []).map((w) => `\`${cell(w)}\``).join(', '));
  body += `\n${h2('event.classes.h', 'vehicle-classes')}\n\n${R('event.classes.intro')}\n\n` + head(R('event.th.class'), R('event.th.shown'));
  for (const c of classes) body += row(`\`${c}\``, cell(L(`heat.filterPanel.vehicleClass.${c}`, c)));
  pages['ref-event-types.md'] = page('Event types and classes', 1, body, 'ref-event-types.md');
}

// ------------------------------------------------------------ column names
{
  const am = src('src/data/automap.ts');
  const roles = [
    ['X', 'X_NAMES'], ['Y', 'Y_NAMES'], ['Z', 'Z_NAMES'], ['Time', 'TIME_NAMES'], ['Person', 'PERSON_NAMES'],
    ['Session', 'SESSION_NAMES'], ['Group', 'TEAM_NAMES'], ['Yaw', 'YAW_NAMES'], ['Pitch', 'PITCH_NAMES'],
  ];
  let body = `${R('columns.intro')}\n\n` + head(R('columns.th.role'), R('columns.th.patterns'), R('columns.th.examples'));
  const SAMPLES = ['x', 'y', 'z', 'pos_x', 'PosX', 'position_x', 'X_world', 'lat', 'lon', 'alt', 'altitude', 'height', 'time', 't', 'timestamp', 'tick', 'seconds', 'elapsed', 'match_time', 'player', 'player_id', 'steamid', 'name', 'user', 'unit', 'pilot', 'person', 'match', 'session', 'round', 'roundId', 'game_id', 'team', 'side', 'faction', 'coalition', 'group', 'yaw', 'heading', 'azimuth', 'view_yaw', 'pitch', 'elevation', 'view_pitch'];
  const examples = (pats) => {
    const hit = (p, n) => {
      const m = p.match(/^\/(.*)\/([a-z]*)$/);
      try { return new RegExp(m[1], m[2]).test(n); } catch { return false; }
    };
    return SAMPLES.filter((n) => pats.some((p) => hit(p, n))).slice(0, 6).map((n) => `\`${n}\``).join(', ');
  };
  for (const [role, name] of roles) {
    const start = am.indexOf(`const ${name} = [`);
    if (start < 0) continue;
    const text = am.slice(start, am.indexOf('];', start));
    const raw = [...text.matchAll(/(\/(?:\\\/|[^/\n])+\/[a-z]*)/g)].map((m) => m[1]);
    const pats = raw.map((r) => `\`${cell(r)}\``);
    if (/\.\.\.ELAPSED_NAMES/.test(text)) pats.push(R('columns.elapsed'));
    body += row(R(`columns.role.${role}`), pats.join(' '), examples(raw));
  }
  pages['ref-columns.md'] = page('Column names', 2, body, 'ref-columns.md');
}

// ------------------------------------------------------------ languages
{
  const lang = src('src/i18n/languages.ts');
  const list = [...lang.slice(lang.indexOf('export const LANGUAGES')).matchAll(/\{ code: '([\w-]+)', name: '([^']+)'/g)];
  let body = `${R('languages.intro', { n: list.length })}\n\n` + head(R('languages.th.code'), R('languages.th.language'));
  for (const [, code, name] of list) body += row(`\`${code}\``, name);
  pages['ref-languages.md'] = page('Language list', 3, body, 'ref-languages.md');
}

// ------------------------------------------------------------ browser keys
{
  const bk = src('src/ui/browserKeys.ts');
  const set = (name) => [...bk.match(new RegExp(`${name} = (?:new Set\\()?\\[([^\\]]*)\\]`))[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
  const ctrl = set('SWALLOWED');
  const plain = set('SWALLOWED_PLAIN');
  const locked = set('LOCKED');
  const body = `${R('keys.intro')}\n\n` + head(R('keys.th.keys'), R('keys.th.when'), R('keys.th.effect')) +
    row(`${ctrl.map((k) => `\`Ctrl+${k.toUpperCase()}\``).join(' ')} ${R('keys.ctrl.also')}`, R('keys.ctrl.when'), R('keys.ctrl.effect')) +
    row(plain.map((k) => `\`${k}\``).join(' '), R('keys.plain.when'), R('keys.plain.effect')) +
    row(locked.map((k) => `\`${k.replace(/^Key/, '')}\``).join(' '), R('keys.locked.when'), R('keys.locked.effect')) +
    row(R('keys.close.keys'), R('keys.close.when'), R('keys.close.effect')) +
    `\n${R('keys.outro')}`;
  pages['ref-browser-keys.md'] = page('Browser keys', 4, body, 'ref-browser-keys.md');
}

// ------------------------------------------------------------ settings kept in the browser
{
  // What each stored key holds: "settings.m.<key>" in the refs table.
  const MEANING = (key) => REFS[`settings.m.${key}`];
  const found = new Map();
  const walk = (dir) => {
    for (const f of readdirSync(join(REPO, dir), { withFileTypes: true })) {
      const p = `${dir}/${f.name}`;
      if (f.isDirectory()) walk(p);
      else if (/\.(ts|tsx)$/.test(f.name) && !/\.test\.ts$/.test(f.name)) {
        const text = src(p);
        if (!/localStorage/.test(text)) continue;
        for (const m of text.matchAll(/['`]((?:heat3d|3dheat)\.[A-Za-z.]*)(?=['`$])/g)) if (!found.has(m[1])) found.set(m[1], p);
      }
    }
  };
  walk('src');
  let body = `${R('settings.intro')}\n\n` + head(R('settings.th.key'), R('settings.th.holds'), R('settings.th.code'));
  for (const [key, file] of [...found].sort()) {
    if (key.endsWith('.') && MEANING(key) === undefined) continue;
    body += row(`\`${key}${key.endsWith('.') ? '…' : ''}\``, MEANING(key) ?? '', `\`${file}\``);
  }
  body += `\n${R('settings.outro')}`;
  pages['ref-settings-storage.md'] = page('Stored settings', 5, body, 'ref-settings-storage.md');
}

// ------------------------------------------------------------ value tables
{
  let body = `${R('values.intro')}\n\n` + head(R('values.th.table'), R('values.th.currency'), R('values.th.defined'));
  for (const f of readdirSync(join(REPO, 'src/data/costs'))) {
    if (!f.endsWith('.ts') || f.endsWith('.test.ts')) continue;
    for (const m of src(`src/data/costs/${f}`).matchAll(/id: '([\w-]+)',\s*label: '([^']+)',\s*currency: '(\w+)'/g)) body += row(m[2], `\`${m[3]}\``, `\`src/data/costs/${f}\``);
  }
  pages['ref-value-tables.md'] = page('Value tables', 6, body, 'ref-value-tables.md');
}

// ------------------------------------------------------------ command-line tools
{
  const USER_TOOLS = ['3dheat-pack.mjs', '3dheat-summarize.mjs', 'acmi-to-parquet.mjs', 'dcs-campaign-rounds.mjs'];
  const DEV_TOOLS = ['demo-data.mjs', 'docs-shots.mjs', 'docs-refs.mjs', 'smoke.mjs', 'check-visual.mjs', 'convert-media.mjs', 'probe-webgpu.mjs', 'probe-present.mjs'];
  const LIBRARIES = ['container.mjs'];
  // The first paragraph and the usage lines are the tools' own source comments and stay as written.
  const section = (t, heading) => {
    if (!existsSync(join(REPO, 'tools', t))) return '';
    const text = src(`tools/${t}`);
    const block = text.match(/\/\*\*([\s\S]*?)\*\//)?.[1] ?? '';
    const lines = block.split('\n').map((l) => l.replace(/^\s*\* ?/, ''));
    const first = [];
    for (const l of lines.slice(lines[0].trim() ? 0 : 1)) {
      if (!l.trim()) break;
      first.push(l.trim());
    }
    const usage = lines.filter((l) => /^\s*(node tools\/|npm run )/.test(l)).map((l) => l.trim());
    let out = `\n${heading} \`${t}\`\n\n${first.join(' ')}\n`;
    if (usage.length) out += `\n\`\`\`\n${usage.join('\n')}\n\`\`\`\n`;
    return out;
  };
  let body = `${R('tools.intro')}\n\n${h2('tools.user.h', 'for-your-data')}\n`;
  for (const t of USER_TOOLS) body += section(t, '###');
  body += `\n${h2('tools.dev.h', 'for-developers-and-the-docs')}\n\n${R('tools.dev.intro')}\n`;
  for (const t of DEV_TOOLS) body += section(t, '###');
  body += `\n${h2('tools.lib.h', 'libraries')}\n\n`;
  body += LIBRARIES.filter((t) => existsSync(join(REPO, 'tools', t))).map((t) => R('tools.lib.item', { tool: t })).join('\n') + '\n';
  pages['ref-tools.md'] = page('Command-line tools', 7, body, 'ref-tools.md');
}

let changed = 0;
mkdirSync(OUT, { recursive: true });
for (const [name, text] of Object.entries(pages)) {
  const file = join(OUT, name);
  const old = existsSync(file) ? readFileSync(file, 'utf8') : null;
  if (old === text) continue;
  changed++;
  if (CHECK) console.log(`would change: ${name}`);
  else writeFileSync(file, text);
}
console.log(`${Object.keys(pages).length} reference pages, ${changed} ${CHECK ? 'out of date' : 'written'} (${LANG})`);
if (CHECK && changed) process.exit(1);
