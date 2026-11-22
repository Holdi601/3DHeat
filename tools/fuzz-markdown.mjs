#!/usr/bin/env node
/**
 * Fuzzes the notes' Markdown reader (src/notes/markdown.ts) and the chart SVG
 * (src/charts/exprSvg.ts) for markup injection and slow inputs: random and
 * mutated Markdown built from its grammar (headings, emphasis, code, links,
 * lists, tasks, quotes, tables, fences, rules, block lines) mixed with raw
 * HTML, entities, URL schemes, control and direction characters and long
 * repeats. Every output must pass the allowlist (tools/html-allowlist.ts),
 * nothing may throw, and no input may take more than its time limit: the
 * budget (ms), or for a long input 12 times what an ordinary note of its
 * length takes on this machine (measured at the start), whichever is more -
 * a pattern that backtracks shows up as one that does.
 *
 *   node tools/fuzz-markdown.mjs [--seconds 600] [--workers 4] [--seed 1] [--budget 50] [--out <dir>] [--module <markdown.ts>]
 *
 * `--module` fuzzes another copy of the reader (an older one, to see that the
 * fuzzer finds what was fixed).
 *
 * Node 22.18+ reads the TypeScript modules as they are (type stripping). The
 * inputs that fail are written to --out (default: the system's temp folder),
 * and a summary is printed as JSON at the end; the exit code is 1 on any failure.
 */

import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir, availableParallelism } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const args = Object.fromEntries(
  process.argv
    .slice(2)
    .join(' ')
    .split(/\s*--/)
    .filter(Boolean)
    .map((a) => {
      const [k, ...v] = a.split(/\s+/);
      return [k, v.join(' ')];
    }),
);

if (isMainThread) {
  const seconds = Number(args.seconds ?? 60);
  const workers = Math.max(1, Number(args.workers ?? Math.min(4, Math.max(1, availableParallelism() - 2))));
  const seed = Number(args.seed ?? Date.now() % 1e9);
  const budget = Number(args.budget ?? 50);
  const out = args.out || join(tmpdir(), `fuzz-markdown-${seed}`);
  const started = Date.now();
  const totals = { seed, seconds, workers, budgetMs: budget, inputs: 0, markdown: 0, inline: 0, plainText: 0, svg: 0, failures: 0, slow: 0, throws: 0, maxMs: 0, maxShareOfLimit: 0, usPerChar: 0, maxInput: 0, bytes: 0, out };
  const failures = [];
  let done = 0;
  const file = fileURLToPath(import.meta.url);
  for (let w = 0; w < workers; w++) {
    const worker = new Worker(file, { workerData: { seed: seed + w * 7919, seconds, budget, module: args.module ? pathToFileURL(resolve(args.module)).href : '../src/notes/markdown.ts' } });
    worker.on('message', (m) => {
      if (m.type === 'failure') {
        failures.push(m);
        if (failures.length <= 200) {
          mkdirSync(out, { recursive: true });
          writeFileSync(join(out, `failure-${failures.length}.json`), JSON.stringify(m, null, 1));
        }
        console.error(`[fail] ${m.kind}: ${m.what.slice(0, 200)} (input ${m.input.length} chars)`);
        return;
      }
      if (m.type === 'calibrated') {
        totals.usPerChar = Math.max(totals.usPerChar, +m.usPerChar.toFixed(3));
        return;
      }
      if (m.type === 'progress' || m.type === 'done') {
        for (const k of ['inputs', 'markdown', 'inline', 'plainText', 'svg', 'failures', 'slow', 'throws', 'bytes']) totals[k] += m.delta[k];
        totals.maxMs = Math.max(totals.maxMs, m.delta.maxMs);
        totals.maxShareOfLimit = Math.max(totals.maxShareOfLimit, m.delta.maxShare);
        totals.maxInput = Math.max(totals.maxInput, m.delta.maxInput);
      }
      if (m.type === 'progress') console.error(`[${Math.round((Date.now() - started) / 1000)} s] ${totals.inputs} inputs, ${totals.failures} failures, slowest ${totals.maxMs.toFixed(1)} ms`);
      if (m.type === 'done' && ++done === workers) {
        totals.elapsed = Math.round((Date.now() - started) / 1000);
        console.log(JSON.stringify(totals, null, 1));
        process.exit(totals.failures ? 1 : 0);
      }
    });
    worker.on('error', (e) => {
      console.error('worker error', e);
      process.exit(2);
    });
  }
} else {
  const { markdownToHtml, inline, plainText, MARKDOWN_MAX = Infinity } = await import(workerData.module);
  const { exprChartSvg } = await import('../src/charts/exprSvg.ts');
  const { checkHtml, MARKDOWN, SVG } = await import('./html-allowlist.ts');
  const { seed, seconds, budget } = workerData;

  // xorshift32: the same seed gives the same inputs.
  let s = seed >>> 0 || 1;
  const rnd = () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
  const int = (n) => Math.floor(rnd() * n);
  const pick = (xs) => xs[int(xs.length)];
  const cp = (...codes) => String.fromCodePoint(...codes);

  const BIDI = [cp(0x202e), cp(0x202d), cp(0x2066), cp(0x2067), cp(0x2069), cp(0x200f), cp(0x200b), cp(0xfeff), cp(0x2028), cp(0x2029), cp(0xad), cp(0x85)];
  const CONTROL = [cp(0), cp(1), '\t', '\v', '\f', '\r', cp(0x1b), cp(0x7f), cp(0x9b)];
  const ODD = [cp(0xd800), cp(0xdc00), cp(0x1f600), cp(0x301), cp(0xff1c), cp(0xfe64), cp(0x2039), cp(0x3c), 'İ', 'ſ', 'K'];
  const ENTITIES = ['&lt;', '&gt;', '&amp;', '&quot;', '&#39;', '&#x3c;', '&#60;', '&#x09;', '&Tab;', '&NewLine;', '&colon;', '&#0000106', '&#x6A', '&', '&#', '&#x;', '&amp;lt;'];
  const SCHEMES = [
    'javascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    'jav&#x09;ascript:alert(1)',
    'jav&#x0A;ascript:alert(1)',
    'jav\tascript:alert(1)',
    ' javascript:alert(1)',
    `${cp(1)}javascript:alert(1)`,
    `java${cp(0)}script:alert(1)`,
    'javascript&colon;alert(1)',
    '&#106;avascript:alert(1)',
    'vbscript:msgbox(1)',
    'data:text/html,<script>alert(1)</script>',
    'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
    'data:image/svg+xml,<svg onload=alert(1)>',
    'data:image/png;base64,AAAA',
    'file:///etc/passwd',
    'blob:https://x/1',
    'about:blank',
    '//evil.example/x',
    '/\\evil.example',
    '\\\\evil.example',
    'https://example.org/a"onmouseover="alert(1)',
    "https://example.org/a'onmouseover='alert(1)",
    'https://example.org/<script>',
    'https://example.org/&quot;&gt;&lt;script&gt;',
    'http://x',
    'HTTPS://X',
    'mailto:a@b.c',
    'mailto:a@b.c?body=<x>',
    'note:n1',
    'view:v-1',
    'doc:d_2',
    'note:x"y',
    '#anchor',
    '#a"b',
    '#',
    'https:javascript:alert(1)',
    'javascript://%0Aalert(1)',
    `https://${cp(0x202e)}moc.live`,
  ];
  const RAW = [
    '<script>alert(1)</script>',
    '<SCRIPT SRC=//x.example/x.js></SCRIPT>',
    '<img src=x onerror=alert(1)>',
    '<img src="x" onerror="alert(1)">',
    '<svg onload=alert(1)>',
    '<svg><script>alert(1)</script></svg>',
    '<iframe src="javascript:alert(1)"></iframe>',
    '<object data="javascript:alert(1)">',
    '<embed src=x>',
    '<style>*{background:url(//x)}</style>',
    '<a href="javascript:alert(1)">x</a>',
    '"><script>alert(1)</script>',
    "'><img src=x onerror=alert(1)>",
    '<details open ontoggle=alert(1)>',
    '<math><mtext><table><mglyph><style><img src=x onerror=alert(1)>',
    '<!--<img src=x onerror=alert(1)>-->',
    '<![CDATA[<script>alert(1)</script>]]>',
    '<body onload=alert(1)>',
    '<input autofocus onfocus=alert(1)>',
    '<form action=javascript:alert(1)><button>x</button></form>',
    '<base href=//evil.example/>',
    '<meta http-equiv=refresh content="0;url=javascript:alert(1)">',
    '<link rel=stylesheet href=//evil.example>',
    '<x onclick=alert(1)>x</x>',
    '<scr<script>ipt>alert(1)</scr</script>ipt>',
    '<<script>alert(1)//<</script>',
    '<a/href=javascript:alert(1)>',
    '<img """><script>alert(1)</script>">',
    '</p><script>alert(1)</script><p>',
    '{{block:x"><script>}}',
    '<noscript><p title="</noscript><img src=x onerror=alert(1)>">',
    '<textarea><script>alert(1)</script></textarea>',
    '<title><img src=x onerror=alert(1)></title>',
    '<video><source onerror=alert(1)>',
    '<marquee onstart=alert(1)>',
    '<div style="background:url(javascript:alert(1))">',
    '<div style="width:expression(alert(1))">',
    'javascript:alert(1)',
  ];
  const WORDS = ['alpha', 'mid', 'push', 'A', 'b', '2', '3.5', 'x_y', 'snake_case_word', 'a*b', 'ü', 'e', 'Map', 'C#', '1.', '+', '-', '|', ':', '!'];
  const PUNCT = ['*', '**', '_', '__', '`', '[', ']', '(', ')', '\\', '#', '|', '>', '-', '{', '}', '!', '<', '"', "'", '&', ':', '/', ' ', '  ', '\n', '\n\n'];

  const text = () => {
    const r = rnd();
    if (r < 0.45) return pick(WORDS);
    if (r < 0.6) return pick(PUNCT);
    if (r < 0.7) return pick(ENTITIES);
    if (r < 0.8) return pick(RAW);
    if (r < 0.86) return pick(BIDI);
    if (r < 0.9) return pick(CONTROL);
    if (r < 0.94) return pick(ODD);
    return pick(SCHEMES);
  };
  const span = (depth = 0) => {
    const r = rnd();
    const inner = () => (depth < 3 ? spans(1 + int(3), depth + 1) : text());
    if (r < 0.35) return text();
    if (r < 0.45) return `*${inner()}*`;
    if (r < 0.52) return `**${inner()}**`;
    if (r < 0.57) return `_${inner()}_`;
    if (r < 0.6) return `__${inner()}__`;
    if (r < 0.66) return `\`${pick([text(), pick(RAW), '`', ''])}\``;
    if (r < 0.82) return `[${rnd() < 0.2 ? '' : inner()}](${pick(SCHEMES)}${rnd() < 0.1 ? pick(PUNCT) : ''})`;
    if (r < 0.87) return `![${inner()}](${pick(SCHEMES)})`;
    if (r < 0.9) return `\\${pick(PUNCT)}`;
    if (r < 0.95) return pick(RAW);
    return `[${inner()}]`;
  };
  const spans = (n, depth = 0) => {
    let out = '';
    for (let i = 0; i < n; i++) out += (rnd() < 0.5 ? ' ' : '') + span(depth);
    return out;
  };
  const block = (depth = 0) => {
    const r = rnd();
    if (r < 0.25) return spans(1 + int(8));
    if (r < 0.35) return `${'#'.repeat(1 + int(7))}${pick([' ', '  ', '\t', ''])}${spans(1 + int(4))}${pick(['', ' #', ' ##', '#', ' # x'])}`;
    if (r < 0.45) {
      const ord = rnd() < 0.4;
      return Array.from({ length: 1 + int(4) }, (_, i) => `${pick(['', ' ', '   '])}${ord ? `${i + 1}${pick(['.', ')'])}` : pick(['-', '*', '+'])} ${rnd() < 0.3 ? pick(['[ ] ', '[x] ', '[X] ', '[y] ']) : ''}${spans(1 + int(4))}`).join('\n');
    }
    if (r < 0.53) return (depth < 10 ? block(depth + 1) : spans(2)).split('\n').map((l) => `${'>'.repeat(1 + int(3))}${pick(['', ' '])}${l}`).join('\n');
    if (r < 0.63) {
      const cols = 1 + int(4);
      const row = () => `| ${Array.from({ length: cols }, () => spans(1 + int(2)).replace(/\n/g, ' ')).join(' | ')} |`;
      const sep = `|${Array.from({ length: cols }, () => pick(['---', ':--', '--:', ':-:', '-', ' --- ', ':---:'])).join('|')}|`;
      return [row(), sep, ...Array.from({ length: int(4) }, row)].join('\n');
    }
    if (r < 0.7) return `\`\`\`${pick(['', 'js', '<script>'])}\n${spans(1 + int(5))}\n${rnd() < 0.8 ? '```' : ''}`;
    if (r < 0.75) return pick(['---', '***', '___', '- - -', '* * *', ' _ _ _ ', '--', '-*-']);
    if (r < 0.8) return `${pick(['', ' '])}{{block:${pick(['b1', 'x', 'a-b', 'x"y', '<i>', ''])}}}`;
    if (r < 0.9) return pick(RAW);
    return spans(1 + int(3));
  };
  const doc = () => Array.from({ length: 1 + int(8) }, () => block()).join(pick(['\n', '\n\n', '\r\n', '\r']));

  /** Long repeats of a short piece: the inputs that make a backtracking pattern slow. */
  const longOne = () => {
    const piece = pick([
      () => pick(PUNCT),
      () => pick(PUNCT) + pick(PUNCT),
      () => pick(PUNCT) + ' ',
      () => '[a](',
      () => '# a' + pick([' ', ' #', '\t']),
      () => ' ',
      () => '>',
      () => '|',
      () => '- ',
      () => '1',
      () => '*a ',
      () => '\\',
      () => '```',
      () => span(),
    ])();
    const n = 1 + int(Math.ceil(70_000 / Math.max(1, piece.length)));
    const head = pick(['', '# ', '- ', '> ', 'a|b\n', '1', '[', '|', '`']);
    return head + piece.repeat(n) + pick(['', 'x', '\n', cp(0x2028), ')', ']']);
  };

  const mutate = (src) => {
    let t = src;
    const k = 1 + int(6);
    for (let i = 0; i < k; i++) {
      const at = int(t.length + 1);
      const r = rnd();
      if (r < 0.3) t = t.slice(0, at) + text() + t.slice(at);
      else if (r < 0.45) t = t.slice(0, at) + t.slice(at + 1 + int(8));
      else if (r < 0.55) {
        const len = 1 + int(12);
        t = t.slice(0, at) + t.slice(at, at + len).repeat(2 + int(rnd() < 0.1 ? 3000 : 20)) + t.slice(at + len);
      } else if (r < 0.65) t = t.slice(0, at) + doc() + t.slice(at);
      else if (r < 0.8) t = t.slice(0, at) + pick(PUNCT) + t.slice(at);
      else if (r < 0.9) t = t.slice(0, at) + pick([...BIDI, ...CONTROL, ...ODD]) + t.slice(at);
      else t = t.slice(0, at) + span() + t.slice(at);
    }
    return t.length > 400_000 ? t.slice(0, 400_000) : t;
  };

  const TITLES = ['"><img src=x onerror=alert(1)>', '<script>alert(1)</script>', 'Round one', '', null];
  const opts = { title: () => pick(TITLES) };
  const delta = () => ({ inputs: 0, markdown: 0, inline: 0, plainText: 0, svg: 0, failures: 0, slow: 0, throws: 0, maxMs: 0, maxShare: 0, maxInput: 0, bytes: 0 });
  let d = delta();
  const fail = (kind, what, input) => {
    d.failures++;
    parentPort.postMessage({ type: 'failure', kind, what, input, seed });
  };
  // The runner's speed: a fixed, ordinary note of 64K characters read a few
  // times, the least time per character. A long input may take SCALE times
  // that per character (the worst ordinary inputs take about 2.5 times), never
  // less than the budget: a slow runner gives a big ordinary note more time,
  // while a pattern that backtracks still stands out (it grows with the
  // square of the length - the U+2029 list line took 60 times its share at
  // 15K characters, and more the longer it gets).
  const SCALE = 12;
  const sample = '# Round *one*\n\nSome **bold** and `code` with [a link](https://example.org) and <b>raw</b> &amp; text.\n- item _one_\n- [x] task\n> quote\n| a | b |\n|---|---|\n| 1 | 2 |\n\n';
  const reference = sample.repeat(Math.ceil(65536 / sample.length)).slice(0, 65536);
  let msPerChar = Infinity;
  for (let k = 0; k < 7; k++) {
    const t0 = performance.now();
    markdownToHtml(reference);
    msPerChar = Math.min(msPerChar, (performance.now() - t0) / reference.length);
  }
  parentPort.postMessage({ type: 'calibrated', usPerChar: msPerChar * 1000 });
  const limit = (input) => Math.max(budget, SCALE * msPerChar * input.length);

  /** Runs one call; its time is the least of three tries when it looks slow, so a pause of the collector is no failure. */
  const timed = (kind, f, input) => {
    const most = limit(input);
    let out;
    let ms = Infinity;
    for (let tries = 0; tries < 3; tries++) {
      const t0 = performance.now();
      try {
        out = f();
      } catch (e) {
        d.throws++;
        fail(`${kind}-throws`, String(e?.stack ?? e), input);
        return null;
      }
      ms = Math.min(ms, performance.now() - t0);
      if (ms <= most) break;
    }
    d.maxMs = Math.max(d.maxMs, ms);
    d.maxShare = Math.max(d.maxShare, ms / most);
    if (ms > most) {
      d.slow++;
      fail(`${kind}-slow`, `${ms.toFixed(1)} ms, limit ${most.toFixed(1)} ms`, input);
    }
    return out;
  };

  const corpus = [];
  const end = Date.now() + seconds * 1000;
  let lastReport = Date.now();
  while (Date.now() < end) {
    const r = rnd();
    const input = r < 0.4 ? doc() : r < 0.8 && corpus.length ? mutate(pick(corpus)) : r < 0.97 ? mutate(doc()) : longOne();
    if (input.length < 4000 && corpus.length < 2000) corpus.push(input);
    else if (input.length < 4000 && rnd() < 0.05) corpus[int(corpus.length)] = input;
    d.inputs++;
    d.bytes += input.length;
    d.maxInput = Math.max(d.maxInput, input.length);

    const html = timed('markdown', () => markdownToHtml(input, opts), input);
    d.markdown++;
    if (html !== null) {
      const problems = checkHtml(html, MARKDOWN);
      if (problems.length) fail('markdown-allowlist', problems.join('\n'), input);
      if (input.length > MARKDOWN_MAX && !html.includes('<pre><code>')) fail('markdown-cap', 'the rest past the cap is not shown as text', input);
    }
    const line = input.length > 8000 ? input.slice(0, 8000) : input;
    const il = timed('inline', () => inline(line, opts), line);
    d.inline++;
    if (il !== null) {
      const problems = checkHtml(il, MARKDOWN);
      if (problems.length) fail('inline-allowlist', problems.join('\n'), line);
    }
    timed('plainText', () => plainText(input), input);
    d.plainText++;
    if (rnd() < 0.15) {
      // A chart with the input's pieces as its title, labels, series and unit.
      const parts = line.split(/\n/).slice(0, 30);
      const data = { labels: parts.length ? parts : [''], series: [{ label: pick(parts) ?? '', values: parts.map(() => rnd() * 100) }, ...(rnd() < 0.5 ? [{ label: pick(RAW), values: parts.map(() => (rnd() < 0.1 ? NaN : -rnd() * 50)) }] : [])], unit: pick([...parts, '']), rows: 1, at: 0, dataset: '' };
      const svg = timed('svg', () => exprChartSvg({ kind: pick(['bar', 'line', 'tiles']), title: pick([pick(parts), undefined, 5, null]) }, data, { other: pick(RAW), empty: pick(RAW) }), line);
      d.svg++;
      if (svg !== null) {
        const problems = checkHtml(svg, SVG);
        if (problems.length) fail('svg-allowlist', problems.join('\n'), line);
      }
    }
    if (Date.now() - lastReport > 15_000) {
      lastReport = Date.now();
      parentPort.postMessage({ type: 'progress', delta: d });
      d = delta();
    }
  }
  parentPort.postMessage({ type: 'done', delta: d });
}
