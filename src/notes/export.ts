/**
 * An analysis document as a reader sees it: its Markdown with every live
 * block drawn - the same HTML in the viewer's preview (with buttons to go to
 * a block's view, refresh a chart, open a plan) and in the exports, which
 * leave the buttons out:
 *
 *   HTML       one self-contained file: styles inside, pictures inline as data
 *              URLs, charts drawn by the chart module (`charts/draw.ts`, the
 *              same drawing as the signs and the preview) as inline PNG, or
 *              as SVG where there is no canvas. Prints to PDF from the browser.
 *   Markdown   the text, a block as Markdown (a picture, a table, a quote),
 *              zipped with its pictures under images/ - or one .md with the
 *              pictures inline, for a tool that reads data URLs.
 *
 * Nothing goes to a server: the files are made here and downloaded.
 */

import { exprChartSvg, exprChartTable, shortNumber } from '../charts/exprSvg';
import { chartPng } from '../charts/ChartView';
import { exprToChartData, readChartData } from '../charts/convert';
import { localizeChart } from '../charts/format';
import { colorChart, LIGHT_THEME } from '../charts/palette';
import type { ChartData } from '../charts/types';
import { int, num, t } from '../i18n';
import { anchorSubject, type Anchor } from './anchors';
import { esc, inline, markdownToHtml, plainText } from './markdown';
import type { AnalysisDoc, DataNote, DocBlock, NotesBook } from './model';
import { dataUrlBytes, zip, type ZipFile } from './zip';
import { sharedChartData, sharedChartKind } from './sharedChart';

export interface RenderContext {
  book: NotesBook;
  /** Draw the viewer's buttons (the preview), or not (an export). */
  interactive: boolean;
}

const pct = (v: number | null | undefined) => (v === null || v === undefined || !Number.isFinite(v) ? '–' : `${num(v * 100, 0)}%`);
const val = (v: number | null | undefined) => (v === null || v === undefined || !Number.isFinite(v) ? '–' : shortNumber(v));

const button = (ctx: RenderContext, action: string, id: string, label: string) =>
  ctx.interactive ? `<button type="button" class="block-btn" data-action="${action}" data-block="${esc(id)}">${esc(label)}</button>` : '';

/**
 * A chart block's data in the chart module's form: an expression chart's
 * numbers converted, a block sent from a sign as it came; null when there is
 * nothing counted yet.
 */
export function blockChartData(b: DocBlock | undefined): ChartData | null {
  if (b?.type === 'chart') return b.data ? exprToChartData(b.spec, b.data) : null;
  if (b?.type === 'chartBlock') {
    const d = readChartData(b.block.data);
    return d ? localizeChart(d) : null;
  }
  return null;
}

/** Where the preview mounts the chart (`ChartView`, ui/notes/AnalysisWindow.tsx): the same drawing as the signs, with hover, click and table. */
const chartSlot = (id: string) => `<div class="chart-slot" data-chart-block="${esc(id)}"></div>`;

/** A chart as an exported picture: the chart module's drawing in the light theme as PNG; null without a canvas. */
function chartPicture(d: ChartData | null): string | null {
  if (!d) return null;
  const c = structuredClone(d);
  colorChart(c, LIGHT_THEME, new Map());
  return chartPng(c, LIGHT_THEME);
}

/** The heat spot's numbers, as the pick card says them. */
export function heatLines(a: Extract<Anchor, { kind: 'heat' }>): [string, string][] {
  const h = a.heat;
  const rows: [string, string][] = [
    [t('notes.heat.point'), `${num(a.point.x, 1)}, ${num(a.point.y, 1)}, ${num(a.point.z, 1)}`],
    [t('notes.heat.value'), val(h.value)],
  ];
  if (h.place !== null) rows.push([t('notes.heat.place'), t('notes.heat.placeValue', { value: val(h.place), rows: int(h.rows ?? 0) })]);
  if (h.percentile !== null && h.places !== null)
    rows.push([t('notes.heat.relative'), t('notes.heat.relativeValue', { percent: pct(h.percentile), places: int(h.places), median: val(h.ofMedian), peak: pct(h.ofPeak) })]);
  return rows;
}

const table = (rows: [string, string][]) => `<table class="kv">${rows.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</table>`;

/** A note's card: its colour, title, anchor and text. */
export function noteCardHtml(n: DataNote, ctx: RenderContext): string {
  return `<div class="note-card" style="border-left-color:${esc(n.color)}"><div class="note-card-head"><b>${esc(n.title || t('notes.untitled'))}</b> <span class="dim">${esc(t(`notes.kind.${n.anchor.kind}`))} · ${esc(anchorSubject(n.anchor))}</span>${button(ctx, 'jump-note', n.id, t('notes.jump'))}</div>${n.text ? `<div class="note-card-body">${markdownToHtml(n.text, { title: titler(ctx.book) })}</div>` : ''}${n.shot ? `<img class="shot" src="${n.shot}" alt="">` : ''}${n.tags.length ? `<div class="tags">${n.tags.map((x) => `<span class="tag">${esc(x)}</span>`).join(' ')}</div>` : ''}</div>`;
}

/** A block of a document, drawn. */
export function blockHtml(b: DocBlock | undefined, ctx: RenderContext): string {
  if (!b) return `<div class="block missing">${esc(t('notes.block.missing'))}</div>`;
  switch (b.type) {
    case 'view':
      return `<figure class="block view">${b.thumb ? `<img src="${b.thumb}" alt="${esc(b.name)}">` : `<div class="thumb-none">${esc(t('notes.block.noThumb'))}</div>`}<figcaption>${esc(t('notes.block.view'))}: <b>${esc(b.name)}</b> ${button(ctx, 'view', b.id, t('notes.block.restore'))}</figcaption></figure>`;
    case 'insight': {
      const a = b.anchor as Extract<Anchor, { kind: 'insight' }>;
      const ev = b.evidence ? Object.entries(b.evidence).slice(0, 8).map(([k, v]) => [k, typeof v === 'number' ? shortNumber(v) : String(v)] as [string, string]) : [];
      return `<div class="block insight"><div class="block-head">${esc(t('notes.block.insight'))}${b.strength !== undefined ? ` <span class="dim">${esc(t('notes.block.strength', { percent: pct(b.strength) }))}</span>` : ''}${button(ctx, 'jump-block', b.id, t('notes.jump'))}</div><blockquote>${esc(a.text)}</blockquote>${ev.length ? table(ev) : ''}</div>`;
    }
    case 'heat': {
      const a = b.anchor as Extract<Anchor, { kind: 'heat' }>;
      return `<div class="block heat"><div class="block-head">${esc(t('notes.block.heat'))}${button(ctx, 'jump-block', b.id, t('notes.jump'))}</div>${b.thumb ? `<img src="${b.thumb}" alt="">` : ''}${table(heatLines(a))}</div>`;
    }
    case 'chart': {
      const title = b.spec.title || b.spec.measure.name || b.spec.measure.expr;
      const png = ctx.interactive ? null : chartPicture(blockChartData(b));
      const body = b.data
        ? `${ctx.interactive ? chartSlot(b.id) : png ? `<img class="chart-img" src="${png}" alt="${esc(title)}">` : exprChartSvg(b.spec, b.data, { other: t('notes.chart.other'), empty: t('notes.chart.empty') })}<details><summary>${esc(t('notes.chart.table'))}</summary>${markdownToHtml(exprChartTable(b.data, t('notes.chart.other')))}</details><div class="dim">${esc(t('notes.chart.counted', { rows: int(b.data.rows), dataset: b.data.dataset || '–', when: new Date(b.data.at).toLocaleString() }))}</div>`
        : `<div class="dim">${esc(t('notes.chart.notCounted'))}</div>`;
      return `<figure class="block chart"><figcaption><b>${esc(title)}</b> <code>${esc(b.spec.measure.expr)}</code>${button(ctx, 'chart-refresh', b.id, t('notes.chart.refresh'))}${button(ctx, 'chart-edit', b.id, t('notes.chart.edit'))}</figcaption>${body}</figure>`;
    }
    case 'note': {
      const n = ctx.book.notes.find((x) => x.id === b.noteId);
      return n ? `<div class="block note">${noteCardHtml(n, ctx)}</div>` : `<div class="block missing">${esc(t('notes.block.noteGone'))}</div>`;
    }
    case 'plan': {
      const a = b.anchor as Extract<Anchor, { kind: 'plan' }>;
      const p = (a.plan ?? {}) as { figures?: unknown[]; arrows?: unknown[]; areas?: unknown[]; notes?: unknown[]; steps?: unknown[] };
      const rows: [string, string][] = [
        [t('notes.plan.game'), a.game || '–'],
        [t('notes.plan.level'), a.level || '–'],
        [t('notes.plan.contents'), t('notes.plan.counts', { figures: int(p.figures?.length ?? 0), arrows: int(p.arrows?.length ?? 0), areas: int(p.areas?.length ?? 0), steps: int(p.steps?.length ?? 1) })],
      ];
      return `<div class="block plan"><div class="block-head">${esc(t('notes.block.plan'))}: <b>${esc(a.title || t('notes.untitled'))}</b>${button(ctx, 'plan', b.id, t('notes.plan.open'))}</div>${b.thumb ? `<img src="${b.thumb}" alt="">` : ''}${table(rows)}</div>`;
    }
    case 'chartBlock': {
      const data = sharedChartData(b.block);
      const src = b.block.source;
      const from = [src?.volumeName, src?.dataset, src?.scope].filter(Boolean).join(' · ');
      const png = ctx.interactive ? null : chartPicture(blockChartData(b));
      const pic = ctx.interactive ? chartSlot(b.id) : png ? `<img class="chart-img" src="${png}" alt="${esc(b.block.title)}">` : exprChartSvg({ kind: sharedChartKind(b.block), title: b.block.title }, data, { other: t('notes.chart.other'), empty: t('notes.chart.empty') });
      return `<figure class="block chart"><figcaption><b>${esc(b.block.title || t('notes.untitled'))}</b>${from ? ` <span class="dim">${esc(from)}</span>` : ''}${button(ctx, 'chart-refresh', b.id, t('notes.chart.refresh'))}${button(ctx, 'chart-edit', b.id, t('notes.chart.edit'))}</figcaption>${pic}<details><summary>${esc(t('notes.chart.table'))}</summary>${markdownToHtml(exprChartTable(data, t('notes.chart.other')))}</details></figure>`;
    }
    case 'image':
      return `<figure class="block image"><img src="${b.src}" alt="${esc(b.caption)}">${b.caption ? `<figcaption>${inline(b.caption)}</figcaption>` : ''}</figure>`;
  }
}

/** Words for a link inside the viewer: the target's title. */
export function titler(book: NotesBook): (kind: 'note' | 'view' | 'doc', id: string) => string | null {
  return (kind, id) => {
    if (kind === 'note') return book.notes.find((n) => n.id === id)?.title || null;
    if (kind === 'doc') return book.docs.find((d) => d.id === id)?.title || null;
    return null;
  };
}

/** The document's body as HTML, blocks drawn. */
export function docBodyHtml(doc: AnalysisDoc, ctx: RenderContext): string {
  return markdownToHtml(doc.body, { block: (id) => blockHtml(doc.blocks[id], ctx), title: titler(ctx.book) });
}

/** The styles of a document, in the viewer (scoped under `.doc-render`) and in an export. */
export const DOC_CSS = `
.doc-render{font:14px/1.55 system-ui,-apple-system,'Segoe UI',sans-serif;color:var(--doc-ink,#121821);max-width:860px;margin:0 auto}
.doc-render h1,.doc-render h2,.doc-render h3{line-height:1.25;margin:1.2em 0 .45em}
.doc-render h1{font-size:1.7em}.doc-render h2{font-size:1.35em}.doc-render h3{font-size:1.12em}
.doc-render p{margin:.55em 0}
.doc-render a{color:var(--doc-link,#0b6fb8)}
.doc-render code{font-family:ui-monospace,Consolas,monospace;font-size:.92em;background:var(--doc-code,#eef1f5);padding:0 .25em;border-radius:3px}
.doc-render pre{background:var(--doc-code,#eef1f5);padding:10px;border-radius:6px;overflow:auto}
.doc-render pre code{background:none;padding:0}
.doc-render blockquote{margin:.6em 0;padding:.2em .9em;border-left:3px solid var(--doc-line,#b9c3cf);color:var(--doc-dim,#3f4a5a)}
.doc-render table{border-collapse:collapse;margin:.5em 0;font-size:.92em}
.doc-render th,.doc-render td{border:1px solid var(--doc-line,#d3dae3);padding:3px 8px;text-align:left;vertical-align:top}
.doc-render table.kv th{font-weight:550;color:var(--doc-dim,#3f4a5a);white-space:nowrap}
.doc-render .block{margin:1em 0;padding:10px 12px;border:1px solid var(--doc-line,#d3dae3);border-radius:8px;break-inside:avoid}
.doc-render figure.block{margin:1em 0}
.doc-render .block img{max-width:100%;border-radius:6px;display:block;margin:.4em 0}
.doc-render .block-head{display:flex;gap:8px;align-items:baseline;flex-wrap:wrap;font-weight:550;margin-bottom:.3em}
.doc-render figcaption{display:flex;gap:8px;align-items:baseline;flex-wrap:wrap;margin:.3em 0}
.doc-render .dim{color:var(--doc-dim,#5f6b7c);font-weight:400;font-size:.92em}
.doc-render .missing{color:var(--doc-dim,#5f6b7c);font-style:italic}
.doc-render .thumb-none{padding:24px;text-align:center;color:var(--doc-dim,#5f6b7c);background:var(--doc-code,#eef1f5);border-radius:6px}
.doc-render .note-card{border-left:4px solid #f5c542;padding:2px 0 2px 10px}
.doc-render .note-card-head{display:flex;gap:8px;align-items:baseline;flex-wrap:wrap}
.doc-render .note-card .shot{max-width:100%;border-radius:6px;margin-top:6px}
.doc-render .tag{display:inline-block;font-size:.82em;padding:0 6px;border-radius:999px;background:var(--doc-code,#eef1f5)}
.doc-render .chart-svg,.doc-render .chart-img{max-width:100%;height:auto;display:block}
.doc-render .chart-img{width:560px}
.doc-render .chart-slot{position:relative;max-width:100%;min-height:260px}
.doc-render li.task{list-style:none;margin-left:-1.2em}
.doc-render .block-btn{margin-left:auto;font-size:12px}
.doc-render .block-btn+.block-btn{margin-left:0}
@media print{.doc-render .block-btn{display:none}.doc-render details{display:block}}
`;

/** A file name from a title. */
export function fileName(title: string, ext: string): string {
  const base =
    title
      .trim()
      .replace(/[\\/:*?"<>|\u0000-\u001f]+/g, ' ')
      .replace(/\s+/g, '-')
      .slice(0, 80) || 'analysis';
  return `${base}.${ext}`;
}

/** The document as one self-contained HTML file. */
export function docToHtml(doc: AnalysisDoc, book: NotesBook): string {
  const body = docBodyHtml(doc, { book, interactive: false });
  // Links inside the viewer mean nothing in a file: their words stay, the link goes.
  const flat = body.replace(/<a href="#" class="inner-link" data-link="[^"]*">([\s\S]*?)<\/a>/g, '<span class="inner-link">$1</span>');
  const meta = esc(t('notes.export.byline', { author: doc.author || '–', when: new Date(doc.updated).toLocaleString() }));
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="generator" content="3DHeat">
<title>${esc(doc.title || t('notes.untitled'))}</title>
<style>
body{margin:0;padding:32px 16px;background:#fff}
${DOC_CSS}
.doc-render .byline{color:#5f6b7c;font-size:.9em;margin-bottom:1.5em}
</style>
</head>
<body>
<article class="doc-render">
<h1>${esc(doc.title || t('notes.untitled'))}</h1>
<div class="byline">${meta}</div>
${flat}
</article>
</body>
</html>
`;
}

/** A block as Markdown; pictures named under `images/` and handed to `file` (or kept inline). */
function blockMarkdown(b: DocBlock | undefined, book: NotesBook, picture: (src: string, name: string) => string): string {
  if (!b) return `*${t('notes.block.missing')}*`;
  switch (b.type) {
    case 'view':
      return `${b.thumb ? `${picture(b.thumb, b.id)}\n\n` : ''}*${t('notes.block.view')}: ${b.name}*`;
    case 'insight': {
      const a = b.anchor as Extract<Anchor, { kind: 'insight' }>;
      const ev = b.evidence ? Object.entries(b.evidence).slice(0, 8).map(([k, v]) => `- ${k}: ${typeof v === 'number' ? shortNumber(v) : v}`) : [];
      return [`> **${t('notes.block.insight')}**${b.strength !== undefined ? ` (${t('notes.block.strength', { percent: pct(b.strength) })})` : ''}`, `> ${a.text}`, ...(ev.length ? ['', ...ev] : [])].join('\n');
    }
    case 'heat': {
      const a = b.anchor as Extract<Anchor, { kind: 'heat' }>;
      return [`**${t('notes.block.heat')}**`, '', ...(b.thumb ? [picture(b.thumb, b.id), ''] : []), '| | |', '|---|---|', ...heatLines(a).map(([k, v]) => `| ${k} | ${v} |`)].join('\n');
    }
    case 'chart': {
      const title = b.spec.title || b.spec.measure.name || b.spec.measure.expr;
      if (!b.data) return `**${title}** (\`${b.spec.measure.expr}\`): *${t('notes.chart.notCounted')}*`;
      const png = chartPicture(blockChartData(b));
      const svg = png ? '' : exprChartSvg(b.spec, b.data, { other: t('notes.chart.other'), empty: t('notes.chart.empty') });
      const src = png ?? `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
      return `${picture(src, b.id)}\n\n**${title}** (\`${b.spec.measure.expr}\`)\n\n${exprChartTable(b.data, t('notes.chart.other'))}`;
    }
    case 'note': {
      const n = book.notes.find((x) => x.id === b.noteId);
      if (!n) return `*${t('notes.block.noteGone')}*`;
      const text = n.text.split('\n').map((l) => `> ${l}`).join('\n');
      return `> **${n.title || t('notes.untitled')}** · ${t(`notes.kind.${n.anchor.kind}`)}: ${anchorSubject(n.anchor)}\n>\n${text}${n.shot ? `\n\n${picture(n.shot, n.id)}` : ''}`;
    }
    case 'plan': {
      const a = b.anchor as Extract<Anchor, { kind: 'plan' }>;
      return `${b.thumb ? `${picture(b.thumb, b.id)}\n\n` : ''}**${t('notes.block.plan')}: ${a.title || t('notes.untitled')}** · ${a.game || '–'} · ${a.level || '–'}`;
    }
    case 'chartBlock': {
      const data = sharedChartData(b.block);
      const png = chartPicture(blockChartData(b));
      const svg = png ? '' : exprChartSvg({ kind: sharedChartKind(b.block), title: b.block.title }, data, { other: t('notes.chart.other'), empty: t('notes.chart.empty') });
      const src = png ?? `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
      return `${picture(src, b.id)}

**${b.block.title || t('notes.untitled')}**

${exprChartTable(data, t('notes.chart.other'))}`;
    }
    case 'image':
      return `${picture(b.src, b.id)}${b.caption ? `\n\n*${b.caption}*` : ''}`;
  }
}

/** The document as Markdown, and its pictures as files (none when `inline`: then they are data URLs in the text). */
export function docToMarkdown(doc: AnalysisDoc, book: NotesBook, inlineImages = false): { markdown: string; files: ZipFile[] } {
  const files: ZipFile[] = [];
  const used = new Set<string>();
  const picture = (src: string, name: string) => {
    if (inlineImages) return `![](${src})`;
    const bytes = dataUrlBytes(src);
    if (!bytes) return '';
    let file = `images/${name}.${bytes.ext}`;
    for (let k = 2; used.has(file); k++) file = `images/${name}-${k}.${bytes.ext}`;
    used.add(file);
    files.push({ name: file, data: bytes.data });
    return `![](${file})`;
  };
  const lines = doc.body.replace(/\r\n?/g, '\n').split('\n');
  const out: string[] = [`# ${doc.title || t('notes.untitled')}`, ''];
  for (const l of lines) {
    const m = /^\s*\{\{block:([\w-]+)\}\}\s*$/.exec(l);
    // Links inside the viewer: their words.
    out.push(m ? blockMarkdown(doc.blocks[m[1]], book, picture) : l.replace(/\[([^\]]*)\]\((note|view|doc):([\w-]+)\)/g, (_, words: string, kind: 'note' | 'view' | 'doc', id: string) => words || titler(book)(kind, id) || `${kind}:${id}`));
  }
  return { markdown: `${out.join('\n').trim()}\n`, files };
}

/** The document and its pictures as one ZIP: `<title>.md` and `images/`. */
export function docToZip(doc: AnalysisDoc, book: NotesBook): Uint8Array {
  const { markdown, files } = docToMarkdown(doc, book);
  return zip([{ name: fileName(doc.title, 'md'), data: new TextEncoder().encode(markdown) }, ...files]);
}

/** A note's search text: its title, text, tags, author and anchor. */
export function noteSearchText(n: DataNote): string {
  return `${n.title} ${plainText(n.text)} ${n.tags.join(' ')} ${n.author} ${anchorSubject(n.anchor)}`.toLowerCase();
}

/** Hands a file to the browser to save. */
export function download(name: string, data: BlobPart, type: string): void {
  const blob = new Blob([data], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

/** Opens the document in a new tab as its HTML file and asks the browser to print it (to PDF, if chosen). */
export function printDoc(doc: AnalysisDoc, book: NotesBook): void {
  const url = URL.createObjectURL(new Blob([docToHtml(doc, book)], { type: 'text/html' }));
  const w = window.open(url, '_blank');
  if (w) w.addEventListener('load', () => setTimeout(() => w.print(), 200), { once: true });
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
