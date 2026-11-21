/**
 * The usage report: what is used, how it is reached, and why the rest might
 * not be (docs/usage-statistics.md).
 *
 * Reads the local usage files (`usage-YYYY-MM-DD.jsonl`, written by the dev or
 * preview server when `"usageStats": true` is in tools/local-data.json) and/or
 * an export from Settings › Usage statistics (`3dheat-usage-*.json`), and the
 * side panel's command index (tools/commandIndex.ts), and prints:
 * - time by workspace and view mode, the backend, the data loads;
 * - the top features by use, with how they were reached (palette, key,
 *   button, quick bar) and how many steps it took from rest;
 * - the to-fix list: possibly broken first, unused ones without a smoke step on top;
 * - features hard to reach for how often they are used;
 * - friction hot spots, palette searches that found nothing, feedback;
 * - every unused feature classed: too hidden, seen not tried, fine but unused...
 *
 *   node tools/usage-report.mjs [file or folder ...] [--all] [--top N] [--since YYYY-MM-DD] [--json]
 *
 * With no file or folder: the `usageDir` of tools/local-data.json, else tools/.usage.
 * The smoke column: a feature counts as covered when a smoke suite
 * (tools/smoke*.mjs) names its message key or its English words in quotes.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { buildReport, formatReport, indexId } from '../src/usage/report.ts';
import { extraFeatures } from '../src/usage/extras.ts';
import { buildCommandIndex } from './commandIndex.ts';

const REPO = resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const opt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const paths = args.filter((a, i) => !a.startsWith('--') && !['--top', '--since'].includes(args[i - 1]));

function defaultDir() {
  if (process.env.HEAT3D_USAGE_DIR) return process.env.HEAT3D_USAGE_DIR;
  try {
    const j = JSON.parse(readFileSync(join(REPO, 'tools', 'local-data.json'), 'utf8'));
    if (typeof j.usageDir === 'string') return j.usageDir;
  } catch {
    // none
  }
  return join(REPO, 'tools', '.usage');
}

/** Every event in a file: jsonl (one a line) or an export (`{ events: [...] }`). */
function readEvents(file) {
  const text = readFileSync(file, 'utf8');
  if (/\.jsonl$/i.test(file)) {
    const out = [];
    for (const line of text.split('\n')) {
      if (!line.trim()) continue;
      try {
        out.push(JSON.parse(line));
      } catch {
        // A line cut short by a crash: skipped.
      }
    }
    return out;
  }
  const j = JSON.parse(text);
  return Array.isArray(j) ? j : Array.isArray(j.events) ? j.events : [];
}

const files = [];
for (const p of paths.length ? paths : [defaultDir()]) {
  if (!existsSync(p)) {
    console.error(`usage-report: ${p} does not exist`);
    continue;
  }
  if (statSync(p).isDirectory()) {
    for (const f of readdirSync(p).sort()) if (/^usage-.*\.jsonl$|^3dheat-usage-.*\.json$/i.test(f)) files.push(join(p, f));
  } else files.push(p);
}
let events = files.flatMap(readEvents);
// The same event from the file and an export of the browser's copy: once.
{
  const seen = new Set();
  events = events.filter((e) => {
    const k = JSON.stringify(e);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
const since = opt('--since');
if (since) events = events.filter((e) => e.t >= Date.parse(since));
events.sort((a, b) => a.t - b.t);

// The panel's index, and the English words for ids.
const index = buildCommandIndex(REPO);
const english = {};
const enDir = join(REPO, 'src', 'i18n', 'locales', 'en');
for (const f of readdirSync(enDir)) if (f.endsWith('.json')) Object.assign(english, JSON.parse(readFileSync(join(enDir, f), 'utf8')));
const say = (k) => english[k] ?? null;
function name(id) {
  const [kind, ...restParts] = id.split(':');
  const rest = restParts.join(':');
  switch (kind) {
    case 'ctl': {
      const [a, b] = rest.split('/');
      return `${say(a) ?? a} › ${b === '_' ? '…' : (say(b) ?? b)}`;
    }
    case 'sec':
      return say(rest) ?? rest;
    case 'cmd':
      return say(`shell.key.${rest}`) ?? say(`shell.cmd.${rest}`) ?? rest;
    case 'ws':
      return say(rest === 'vehicle' ? 'vehicle.tab.label' : `app.tab.${rest}`) ?? rest;
    case 'task': {
      const [w, x] = rest.split('.');
      return `${name(`ws:${w}`)} › ${say(`shell.task.${x}`) ?? x}`;
    }
    case 'panel':
      return say({ palette: 'shell.palette.title', sheet: 'shell.cmd.sheet', settings: 'shell.settings.title', help: 'help.title' }[rest] ?? '') ?? rest;
    case 'mode':
      return say({ 'heat-simple': 'app.mode.heat.label', 'heat-difference': 'app.mode.difference.label', 'heat-teams': 'app.mode.teamHeat.label', 'heat-lines': 'app.mode.lineHeat.label', team: 'app.mode.overlay.label' }[rest] ?? '') ?? rest;
    case 'cam':
      return say(`heat.viewPanel.camera.preset.${rest}`) ?? rest;
    default:
      return id;
  }
}

// Which features a smoke suite exercises: their key, or their English words in quotes.
const smokeText = readdirSync(join(REPO, 'tools'))
  .filter((f) => /^smoke.*\.mjs$/.test(f))
  .map((f) => readFileSync(join(REPO, 'tools', f), 'utf8'))
  .join('\n');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const quoted = (s) => !!s && s.length >= 3 && new RegExp(`['"\`/]${esc(s)}['"\`/]`).test(smokeText);
const named = (key) => smokeText.includes(key) || quoted(say(key));
const smoke = new Set();
const candidates = new Set([...index.map(indexId), ...extraFeatures().map((x) => x.id), ...events.map((e) => e.id).filter(Boolean)]);
for (const id of candidates) {
  const [kind, rest] = [id.slice(0, id.indexOf(':')), id.slice(id.indexOf(':') + 1)];
  let hit = smokeText.includes(id);
  if (!hit && kind === 'ctl') {
    const [s, l] = rest.split('/');
    hit = l !== '_' && named(l) && (named(s) || smokeText.includes(l));
  } else if (!hit && kind === 'sec') hit = named(rest);
  else if (!hit && kind === 'cmd') hit = quoted(say(`shell.key.${rest}`)) || quoted(say(`shell.cmd.${rest}`));
  else if (!hit && kind === 'ws') hit = quoted(name(id));
  else if (!hit && kind === 'cam') hit = quoted(`${rest[0].toUpperCase()}${rest.slice(1)} view`);
  if (hit) smoke.add(id);
}

const report = buildReport({ events, index, extras: extraFeatures(), smoke });
if (flag('--json')) {
  console.log(JSON.stringify(report, null, 1));
} else {
  if (!events.length) console.log(`No usage events found in ${files.length ? files.join(', ') : paths.join(', ') || defaultDir()}.`);
  console.log(`Read ${events.length} events from ${files.length} file(s).`);
  console.log(formatReport(report, { name, top: Number(opt('--top') ?? 25), all: flag('--all') }));
}
