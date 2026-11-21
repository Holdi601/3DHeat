/**
 * Data notes and analysis documents: what they hold, and reading them back
 * from JSON (a file, the browser's copy, a shared session) with every part
 * checked.
 *
 * A note is anchored to a thing in the data (`anchors.ts`), has a title, a
 * Markdown text (which can link other notes, views and documents:
 * `[words](note:<id>)`, `view:<id>`, `doc:<id>`), tags, a colour, its author,
 * when it was made and changed, the view it was made in (so a click puts the
 * camera, the time, the filters and the selection back) and, if asked, a
 * screenshot.
 *
 * A document is Markdown with live blocks: a line `{{block:<id>}}` stands for
 * one of its `blocks` - a saved view (with a thumbnail), an insight finding, a
 * heat inspection's numbers, a chart (`charts/spec.ts`), a data note, a
 * tactics plan, or a screenshot.
 */

import { readExprChartData, readExprChartSpec, type ExprChartData, type ExprChartSpec } from '../charts/exprSpec';
import { readAnchor, type Anchor } from './anchors';
import { blockLine, heading } from './markdown';
import { isSharedChartBlock, type SharedChartBlock } from './sharedChart';

export const NOTES_SCHEMA = 'heat3d.notes/1';

export interface DataNote {
  id: string;
  title: string;
  /** Markdown. */
  text: string;
  tags: string[];
  /** #rrggbb. */
  color: string;
  author: string;
  /** Milliseconds since 1970. */
  created: number;
  updated: number;
  anchor: Anchor;
  /** The view it was made in (`state/savedViews.ts` ViewState), to jump back to. */
  view?: unknown;
  /** The workspace it was made on (heat, match, plan). */
  tab?: string;
  /** A JPEG data URL. */
  shot?: string;
}

export type DocBlock =
  | { id: string; type: 'view'; name: string; view: unknown; viewId?: string; thumb?: string }
  | { id: string; type: 'insight'; anchor: Anchor; strength?: number; evidence?: Record<string, number | string>; view?: unknown }
  | { id: string; type: 'heat'; anchor: Anchor; view?: unknown; thumb?: string }
  | { id: string; type: 'chart'; spec: ExprChartSpec; data?: ExprChartData | null }
  | { id: string; type: 'note'; noteId: string }
  | { id: string; type: 'plan'; anchor: Anchor; thumb?: string }
  | { id: string; type: 'image'; src: string; caption: string }
  /** A chart sent from elsewhere in the viewer, in the shared chart module's form (`sharedChart.ts`). */
  | { id: string; type: 'chartBlock'; block: SharedChartBlock };

export type BlockType = DocBlock['type'];

/** A block before it has its id: each kind's fields. */
export type NewBlock = DocBlock extends infer B ? (B extends DocBlock ? Omit<B, 'id'> : never) : never;

export interface AnalysisDoc {
  id: string;
  title: string;
  /** Markdown; `{{block:<id>}}` lines place the blocks. */
  body: string;
  blocks: Record<string, DocBlock>;
  author: string;
  created: number;
  updated: number;
}

export interface NotesBook {
  notes: DataNote[];
  docs: AnalysisDoc[];
}

export const EMPTY_BOOK: NotesBook = { notes: [], docs: [] };

/** The colours a note can take: the first is the default. */
export const NOTE_COLORS = ['#f5c542', '#46c8ff', '#ff6a3d', '#3ddc84', '#c792ea', '#ff5d8f', '#e6ebf2'];

let seq = 0;
/** An id unique across sessions: the time, a counter and randomness. */
export function newId(prefix: string): string {
  seq = (seq + 1) % 1296;
  return `${prefix}${Date.now().toString(36)}${seq.toString(36).padStart(2, '0')}${Math.random().toString(36).slice(2, 7)}`;
}

const str = (v: unknown, max: number, fallback = '') => (typeof v === 'string' ? v.slice(0, max) : fallback);
const time = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : Date.now());
/**
 * A picture as it is kept and shared: a raster data URL and nothing after its
 * base64 - it goes into `src="..."` as it is, so a quote in it would be
 * markup. No SVG: one is a document that runs script when its exported file
 * is opened (the viewer's own charts are drawn as SVG at export, not kept).
 */
export const IMAGE_DATA_URL = /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/]*={0,2}$/;
const image = (v: unknown) => (typeof v === 'string' && v.length < 8_000_000 && IMAGE_DATA_URL.test(v) ? v : undefined);
const color = (v: unknown) => (typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v) ? v.toLowerCase() : NOTE_COLORS[0]);

export function readNote(v: unknown): DataNote | null {
  if (!v || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  const anchor = readAnchor(o.anchor);
  if (!anchor || typeof o.id !== 'string' || !o.id) return null;
  const shot = image(o.shot);
  return {
    id: o.id.slice(0, 80),
    title: str(o.title, 200),
    text: str(o.text, 100_000),
    tags: Array.isArray(o.tags) ? [...new Set(o.tags.filter((x): x is string => typeof x === 'string').map((x) => x.trim().slice(0, 40)).filter(Boolean))].slice(0, 20) : [],
    color: color(o.color),
    author: str(o.author, 80),
    created: time(o.created),
    updated: time(o.updated ?? o.created),
    anchor,
    ...(o.view && typeof o.view === 'object' ? { view: o.view } : {}),
    ...(typeof o.tab === 'string' && /^(heat|match|plan|race|vehicle)$/.test(o.tab) ? { tab: o.tab } : {}),
    ...(shot ? { shot } : {}),
  };
}

export function readBlock(v: unknown, id: string): DocBlock | null {
  if (!v || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  const thumb = image(o.thumb);
  const t = thumb ? { thumb } : {};
  switch (o.type) {
    case 'view':
      return o.view && typeof o.view === 'object' ? { id, type: 'view', name: str(o.name, 200), view: o.view, ...(typeof o.viewId === 'string' ? { viewId: o.viewId } : {}), ...t } : null;
    case 'insight':
    case 'heat':
    case 'plan': {
      const anchor = readAnchor(o.anchor);
      if (!anchor) return null;
      if (o.type === 'plan') return { id, type: 'plan', anchor, ...t };
      if (o.type === 'heat') return { id, type: 'heat', anchor, ...(o.view && typeof o.view === 'object' ? { view: o.view } : {}), ...t };
      return {
        id,
        type: 'insight',
        anchor,
        ...(typeof o.strength === 'number' ? { strength: o.strength } : {}),
        ...(o.evidence && typeof o.evidence === 'object' ? { evidence: o.evidence as Record<string, number | string> } : {}),
        ...(o.view && typeof o.view === 'object' ? { view: o.view } : {}),
      };
    }
    case 'chart': {
      const spec = readExprChartSpec(o.spec);
      return spec ? { id, type: 'chart', spec, data: readExprChartData(o.data) } : null;
    }
    case 'note':
      return typeof o.noteId === 'string' ? { id, type: 'note', noteId: o.noteId } : null;
    case 'chartBlock':
      return isSharedChartBlock(o.block) ? { id, type: 'chartBlock', block: o.block } : null;
    case 'image': {
      const src = image(o.src);
      return src ? { id, type: 'image', src, caption: str(o.caption, 400) } : null;
    }
  }
  return null;
}

export function readDoc(v: unknown): AnalysisDoc | null {
  if (!v || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  if (typeof o.id !== 'string' || !o.id) return null;
  const blocks: Record<string, DocBlock> = {};
  if (o.blocks && typeof o.blocks === 'object')
    for (const [k, b] of Object.entries(o.blocks as Record<string, unknown>)) {
      const x = readBlock(b, k);
      if (x) blocks[k] = x;
    }
  return { id: o.id.slice(0, 80), title: str(o.title, 200), body: str(o.body, 1_000_000), blocks, author: str(o.author, 80), created: time(o.created), updated: time(o.updated ?? o.created) };
}

/** A book from JSON: `{schema, notes, docs}` or the two lists; what is not a note or a document is left out. */
export function readBook(v: unknown): NotesBook {
  const o = (v && typeof v === 'object' ? v : {}) as Record<string, unknown>;
  const notes = Array.isArray(o.notes) ? o.notes.map(readNote).filter((n): n is DataNote => !!n) : [];
  const docs = Array.isArray(o.docs) ? o.docs.map(readDoc).filter((d): d is AnalysisDoc => !!d) : [];
  // One of each id: the last read wins, in the first one's place.
  const uniq = <T extends { id: string }>(xs: T[]) => {
    const m = new Map<string, T>();
    for (const x of xs) m.set(x.id, x);
    return [...m.values()];
  };
  return { notes: uniq(notes), docs: uniq(docs) };
}

/** The block ids a document's text places, in order (line by line: a multi-line pattern would start again at every line of a long run of line breaks). */
export function blockRefs(body: string): string[] {
  return body
    .split(/\r\n?|\n/)
    .map(blockLine)
    .filter((id): id is string => id !== null);
}

/** The headings of a document's text: the outline. */
export function outline(body: string): { level: number; text: string; line: number }[] {
  const out: { level: number; text: string; line: number }[] = [];
  let fence = false;
  body.split('\n').forEach((l, i) => {
    if (/^```/.test(l)) fence = !fence;
    if (fence) return;
    const h = heading(l);
    if (h && h.level <= 4) out.push({ level: h.level, text: h.text, line: i });
  });
  return out;
}
