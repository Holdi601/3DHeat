/**
 * The Markdown the notes and documents are written in, as HTML: headings,
 * paragraphs, bold, italic, code, fenced code, lists, quotes, rules, pipe
 * tables and links. Small and strict: every character of the text is escaped
 * and only these forms make markup, so a note pasted from anywhere cannot put
 * script or styles into the viewer or into an exported document.
 *
 * Links go to the web (http, https, mailto), to the document's own headings
 * (`#...`), or inside the viewer: `note:<id>`, `view:<id>`, `doc:<id>` - drawn
 * as `<a data-link="note:<id>">`, which the viewer turns into a jump and an
 * export into the target's title. A line `{{block:<id>}}` is a document's
 * live block: `block(id)` gives its HTML. There are no pictures in the text:
 * a note shared in a session never makes another member's viewer fetch from
 * a server the writer chose (a document's pictures are its own blocks, data
 * URLs).
 *
 * In a session the text is someone else's, so it is read in time linear in
 * its length (no pattern that backtracks over a long line), quotes nest only
 * so deep, and past `MARKDOWN_MAX` characters the rest is shown as it is.
 * The forms the output can hold - its tags, attributes and link schemes - are
 * checked by `tools/html-allowlist.ts` (the tests and `tools/fuzz-markdown.mjs`).
 */

/** Anything as HTML text or a quoted attribute value: never markup. */
export const esc = (s: unknown) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/** Characters of a text read as Markdown, at most; the rest is shown as plain text, so a huge note cannot hold up the page. */
export const MARKDOWN_MAX = 64 * 1024;
/** Quotes in quotes, at most; deeper `>` stay as they are written. */
const MAX_QUOTE_DEPTH = 8;

/** A heading's anchor id: its words, lower case, joined by dashes. */
export function slug(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u{300}-\u{36f}]/gu, '')
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-+|-+$/g, '') || 'section'
  );
}

/** A heading line's level and words (closing `#`s left out), or null; read without a pattern that backtracks. */
export function heading(l: string): { level: number; text: string } | null {
  const m = /^(#{1,6})\s/.exec(l);
  if (!m) return null;
  const t = l.slice(m[1].length).trim();
  let e = t.length;
  while (e > 1 && t[e - 1] === '#') e--;
  while (e > 1 && /\s/.test(t[e - 1])) e--;
  return t ? { level: m[1].length, text: t.slice(0, e) } : null;
}

const INNER = /^(note|view|doc):([\w-]+)$/;
/** Control characters, and those that hide or turn text around (a link's words shown as another address). */
const UNSAFE = /[\u{0}-\u{1f}\u{7f}-\u{9f}\u{ad}\u{200b}-\u{200f}\u{2028}-\u{202e}\u{2060}-\u{2069}\u{feff}]/u;

/** The link's target as the viewer draws it, or null for one it does not follow. */
export function linkTarget(href: string): { kind: 'web' | 'hash' | 'note' | 'view' | 'doc'; value: string } | null {
  const h = href.trim();
  if (UNSAFE.test(h)) return null;
  if (/^(https?:|mailto:)/i.test(h)) return { kind: 'web', value: h };
  if (/^#[\w-]+$/.test(h)) return { kind: 'hash', value: h.slice(1) };
  const m = INNER.exec(h);
  return m ? { kind: m[1] as 'note' | 'view' | 'doc', value: m[2] } : null;
}

export interface MarkdownOptions {
  /** A live block's HTML. */
  block?: (id: string) => string;
  /** An inner link's words when it has none of its own (the target's title). */
  title?: (kind: 'note' | 'view' | 'doc', id: string) => string | null;
}

/** Where a link's target ends: a ")" (it does) or a space (it is no link). */
const TARGET_END = /[)\s]/g;

/** Inline forms of one line or paragraph, escaped. */
export function inline(src: string, o: MarkdownOptions = {}): string {
  src = String(src ?? '');
  const out: string[] = [];
  let i = 0;
  let text = '';
  const flush = () => {
    if (text) out.push(esc(text));
    text = '';
  };
  // The next "]" and the next end of a target, found once and kept while ahead:
  // a line of "[" or of "[a](" is read once, not once per bracket (-2 not looked for yet, -1 none).
  let close = -2;
  let end = -2;
  while (i < src.length) {
    const c = src[i];
    if (c === '\\' && i + 1 < src.length && /[\\`*_[\]()#|{}-]/.test(src[i + 1])) {
      text += src[i + 1];
      i += 2;
      continue;
    }
    if (c === '`') {
      const j = src.indexOf('`', i + 1);
      if (j > i) {
        flush();
        out.push(`<code>${esc(src.slice(i + 1, j))}</code>`);
        i = j + 1;
        continue;
      }
    }
    if (c === '*' || c === '_') {
      const two = src[i + 1] === c;
      const mark = two ? c + c : c;
      const j = src.indexOf(mark, i + mark.length);
      // Not across a space at the start: "2 * 3 * 4" stays as it is.
      if (j > i + mark.length && !/\s/.test(src[i + mark.length]) && !/\s/.test(src[j - 1])) {
        flush();
        const tag = two ? 'strong' : 'em';
        out.push(`<${tag}>${inline(src.slice(i + mark.length, j), o)}</${tag}>`);
        i = j + mark.length;
        continue;
      }
    }
    if (c === '[') {
      // [words](target): the first "]" after the "[", a "(" right after it, a target up to ")" without spaces.
      if (close === -2 || (close !== -1 && close <= i)) close = src.indexOf(']', i + 1);
      const from = close + 2;
      if (close > i && src[close + 1] === '(' && (end === -2 || (end !== -1 && end < from))) {
        TARGET_END.lastIndex = from;
        end = TARGET_END.exec(src)?.index ?? -1;
      }
      if (close > i && src[close + 1] === '(' && end > from && src[end] === ')') {
        const words = src.slice(i + 1, close);
        const href = src.slice(from, end);
        const target = linkTarget(href);
        flush();
        if (!target) out.push(esc(words || href));
        else if (target.kind === 'web') out.push(`<a href="${esc(target.value)}" target="_blank" rel="noopener noreferrer">${inline(words || target.value, o)}</a>`);
        else if (target.kind === 'hash') out.push(`<a href="#${esc(target.value)}">${inline(words || target.value, o)}</a>`);
        else {
          const named = words || o.title?.(target.kind, target.value) || `${target.kind}:${target.value}`;
          out.push(`<a href="#" class="inner-link" data-link="${target.kind}:${esc(target.value)}">${inline(named, o)}</a>`);
        }
        i = end + 1;
        continue;
      }
    }
    text += c;
    i++;
  }
  flush();
  return out.join('');
}

/** A table's line under its head (`|---|:--:|`): every cell two dashes or more, a colon either side or none. */
const isTableSep = (l: string) => {
  if (!l.includes('--')) return false;
  const t = l.trim().replace(/^\|/, '').replace(/\|$/, '');
  return t.split('|').every((c) => /^:?-{2,}:?$/.test(c.trim()));
};
/**
 * A list item's mark and words; a task's box and words. The words are the
 * rest of the line whatever it holds (`[^]`, not `.`): a `.` stops at a line
 * separator (U+2028) inside the line, and `\s+` then gave the spaces back one
 * by one, each try reading the rest again - a long run of spaces made the
 * line quadratic.
 */
const LIST_ITEM = /^\s*([-*+]|\d+[.)])\s+([^]*)$/;
const TASK = /^\[( |x|X)\]\s+([^]*)$/;
const cells = (l: string) =>
  l
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split(/(?<!\\)\|/)
    .map((c) => c.trim());

/** The text as HTML; past `MARKDOWN_MAX` characters the rest as plain text. */
export function markdownToHtml(src: string, o: MarkdownOptions = {}): string {
  const text = String(src ?? '');
  if (text.length <= MARKDOWN_MAX) return render(text, o, 0);
  // Cut at a line's end near the limit, never inside a character.
  const nl = text.lastIndexOf('\n', MARKDOWN_MAX);
  let cut = nl > MARKDOWN_MAX / 2 ? nl : MARKDOWN_MAX;
  const unit = text.charCodeAt(cut - 1);
  if (unit >= 0xd800 && unit <= 0xdbff) cut--;
  return `${render(text.slice(0, cut), o, 0)}\n<pre><code>${esc(text.slice(cut))}</code></pre>`;
}

function render(src: string, o: MarkdownOptions, depth: number): string {
  const lines = src.replace(/\r\n?/g, '\n').split('\n');
  const out: string[] = [];
  let para: string[] = [];
  const endPara = () => {
    if (para.length) out.push(`<p>${para.map((l) => inline(l, o)).join('<br>')}</p>`);
    para = [];
  };
  const used = new Map<string, number>();
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const block = blockLine(l);
    if (block !== null) {
      endPara();
      out.push(o.block ? o.block(block) : '');
      continue;
    }
    if (/^```/.test(l)) {
      endPara();
      const body: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) body.push(lines[i++]);
      out.push(`<pre><code>${esc(body.join('\n'))}</code></pre>`);
      continue;
    }
    const h = heading(l);
    if (h) {
      endPara();
      let id = slug(h.text);
      const n = used.get(id) ?? 0;
      used.set(id, n + 1);
      if (n) id = `${id}-${n}`;
      out.push(`<h${h.level} id="${id}">${inline(h.text, o)}</h${h.level}>`);
      continue;
    }
    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(l)) {
      endPara();
      out.push('<hr>');
      continue;
    }
    if (depth < MAX_QUOTE_DEPTH && /^\s*>/.test(l)) {
      endPara();
      const body: string[] = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) body.push(lines[i++].replace(/^\s*>\s?/, ''));
      i--;
      out.push(`<blockquote>${render(body.join('\n'), o, depth + 1)}</blockquote>`);
      continue;
    }
    const li = LIST_ITEM.exec(l);
    if (li) {
      endPara();
      const ordered = /\d/.test(li[1]);
      const items: string[] = [];
      while (i < lines.length) {
        const m = LIST_ITEM.exec(lines[i]);
        if (!m || /\d/.test(m[1]) !== ordered) break;
        const task = TASK.exec(m[2]);
        items.push(task ? `<li class="task"><input type="checkbox" disabled${task[1] !== ' ' ? ' checked' : ''}> ${inline(task[2], o)}</li>` : `<li>${inline(m[2], o)}</li>`);
        i++;
      }
      i--;
      out.push(ordered ? `<ol>${items.join('')}</ol>` : `<ul>${items.join('')}</ul>`);
      continue;
    }
    if (l.includes('|') && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      endPara();
      const head = cells(l);
      const align = cells(lines[i + 1]).map((c) => (c.endsWith(':') ? (c.startsWith(':') ? 'center' : 'right') : ''));
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && lines[i].includes('|') && lines[i].trim()) rows.push(cells(lines[i++]));
      i--;
      const td = (tag: string, c: string, k: number) => `<${tag}${align[k] ? ` style="text-align:${align[k]}"` : ''}>${inline(c, o)}</${tag}>`;
      out.push(`<table><thead><tr>${head.map((c, k) => td('th', c, k)).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${head.map((_, k) => td('td', r[k] ?? '', k)).join('')}</tr>`).join('')}</tbody></table>`);
      continue;
    }
    if (!l.trim()) {
      endPara();
      continue;
    }
    para.push(l);
  }
  endPara();
  return out.join('\n');
}

/** Whether a line is a document's block (`{{block:<id>}}`); its id. */
export const blockLine = (l: string) => /^\s*\{\{block:([\w-]+)\}\}\s*$/.exec(l)?.[1] ?? null;

/**
 * The text without its markup: a note's line in a list, the search. Each
 * pattern reads the text once (the block lines one by one: a multi-line
 * pattern would start again at every line of a long run of line breaks).
 */
export function plainText(src: string): string {
  return String(src ?? '')
    .split(/\r\n?|\n/)
    .filter((l) => blockLine(l) === null)
    .join('\n')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\[([^[\]\n]*)\]\([^()\n]*\)/g, '$1')
    .replace(/[#>*_`|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
