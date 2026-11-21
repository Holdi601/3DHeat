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
 * live block: `block(id)` gives its HTML.
 */

export const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/** A heading's anchor id: its words, lower case, joined by dashes. */
export function slug(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-+|-+$/g, '') || 'section'
  );
}

const INNER = /^(note|view|doc):([\w-]+)$/;

/** The link's target as the viewer draws it, or null for one it does not follow. */
export function linkTarget(href: string): { kind: 'web' | 'hash' | 'note' | 'view' | 'doc'; value: string } | null {
  const h = href.trim();
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

/** Inline forms of one line or paragraph, escaped. */
export function inline(src: string, o: MarkdownOptions = {}): string {
  const out: string[] = [];
  let i = 0;
  let text = '';
  const flush = () => {
    if (text) out.push(esc(text));
    text = '';
  };
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
      const m = /^\[([^\]]*)\]\(([^)\s]+)\)/.exec(src.slice(i));
      if (m) {
        const target = linkTarget(m[2]);
        flush();
        if (!target) out.push(esc(m[1] || m[2]));
        else if (target.kind === 'web') out.push(`<a href="${esc(target.value)}" target="_blank" rel="noopener noreferrer">${inline(m[1] || target.value, o)}</a>`);
        else if (target.kind === 'hash') out.push(`<a href="#${esc(target.value)}">${inline(m[1] || target.value, o)}</a>`);
        else {
          const words = m[1] || o.title?.(target.kind, target.value) || `${target.kind}:${target.value}`;
          out.push(`<a href="#" class="inner-link" data-link="${target.kind}:${esc(target.value)}">${inline(words, o)}</a>`);
        }
        i += m[0].length;
        continue;
      }
    }
    text += c;
    i++;
  }
  flush();
  return out.join('');
}

const isTableSep = (l: string) => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(l);
const cells = (l: string) =>
  l
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split(/(?<!\\)\|/)
    .map((c) => c.trim());

/** The text as HTML. */
export function markdownToHtml(src: string, o: MarkdownOptions = {}): string {
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
    const block = /^\s*\{\{block:([\w-]+)\}\}\s*$/.exec(l);
    if (block) {
      endPara();
      out.push(o.block ? o.block(block[1]) : '');
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
    const h = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(l);
    if (h) {
      endPara();
      let id = slug(h[2]);
      const n = used.get(id) ?? 0;
      used.set(id, n + 1);
      if (n) id = `${id}-${n}`;
      out.push(`<h${h[1].length} id="${id}">${inline(h[2], o)}</h${h[1].length}>`);
      continue;
    }
    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(l)) {
      endPara();
      out.push('<hr>');
      continue;
    }
    if (/^\s*>/.test(l)) {
      endPara();
      const body: string[] = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) body.push(lines[i++].replace(/^\s*>\s?/, ''));
      i--;
      out.push(`<blockquote>${markdownToHtml(body.join('\n'), o)}</blockquote>`);
      continue;
    }
    const li = /^\s*([-*+]|\d+[.)])\s+(.*)$/.exec(l);
    if (li) {
      endPara();
      const ordered = /\d/.test(li[1]);
      const items: string[] = [];
      while (i < lines.length) {
        const m = /^\s*([-*+]|\d+[.)])\s+(.*)$/.exec(lines[i]);
        if (!m || /\d/.test(m[1]) !== ordered) break;
        const task = /^\[( |x|X)\]\s+(.*)$/.exec(m[2]);
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

/** The text without its markup: a note's line in a list, the search. */
export function plainText(src: string): string {
  return src
    .replace(/^\s*\{\{block:[\w-]+\}\}\s*$/gm, '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
