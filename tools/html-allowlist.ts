/**
 * A strict check of HTML the viewer builds as a string (the notes' Markdown,
 * an analysis document's blocks and export, a chart's SVG): it reads the
 * markup the way a browser would only where the markup is simple - every tag
 * `<name attr="value">`, values double-quoted with no quote, `<` or `>` in
 * them, text with no raw `<` or `>` and only well-formed entities - and calls
 * anything else a problem. Inside that, only the allowlisted tags and their
 * allowlisted attributes, each value checked: links only to http, https,
 * mailto or the page's own `#anchors`, pictures only raster data URLs, styles
 * only the few the viewer writes. So a string that passes cannot hold script,
 * an event handler, a frame, an outside resource or a style of its own.
 *
 * Used by the tests (`src/notes/xss.test.ts`) and the fuzzer
 * (`tools/fuzz-markdown.mjs`); runs in Node as it is (no imports).
 */

export type AttrCheck = (value: string, tag: string) => boolean;

export interface Allowlist {
  /** Tag -> attribute -> check of its decoded value. */
  tags: Record<string, Record<string, AttrCheck>>;
  /** Tags without an end tag. */
  voids: string[];
}

/** Tags whose content a browser does not read as markup, or that load or run something: never allowed. */
export const FORBIDDEN = ['script', 'style', 'iframe', 'frame', 'frameset', 'object', 'embed', 'applet', 'link', 'meta', 'base', 'form', 'textarea', 'xmp', 'plaintext', 'noscript', 'noembed', 'noframes', 'template', 'foreignobject', 'use', 'animate', 'set', 'handler', 'math', 'svg:script', 'image', 'audio', 'video', 'source', 'track', 'portal', 'select', 'option', 'listing'];

const NAMED: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", Tab: '\t', NewLine: '\n', colon: ':', sol: '/', lpar: '(', rpar: ')', nbsp: ' ' };

/** An attribute value as the browser reads it: its entities decoded. */
export function decodeEntities(v: string): string {
  return v.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[A-Za-z][A-Za-z0-9]*);?/g, (all, e: string) => {
    if (e[0] === '#') {
      const n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(n) && n <= 0x10ffff ? String.fromCodePoint(n) : all;
    }
    return NAMED[e] ?? all;
  });
}

/** Link schemes a link may have. */
export const SAFE_SCHEMES = ['http', 'https', 'mailto'];

/**
 * A link's address as a browser would follow it: entities decoded, every
 * whitespace and control character taken out (browsers drop some anywhere,
 * others at the ends), lower case; then it must be the page's own anchor or
 * have a safe scheme. A relative address other than `#...` is refused too:
 * the viewer writes none.
 */
export function safeHref(v: string): boolean {
  const u = decodeEntities(v)
    .replace(/[\u{0}-\u{20}\u{7f}-\u{a0}\u{ad}\u{200b}-\u{200f}\u{2028}-\u{202e}\u{2060}-\u{2069}\u{feff}]/gu, '')
    .toLowerCase();
  if (u.startsWith('#')) return true;
  const m = /^([a-z][a-z0-9+.-]*):/.exec(u);
  return !!m && SAFE_SCHEMES.includes(m[1]);
}

/** A picture's address: a raster data URL, base64 to its end. */
export const safeImage: AttrCheck = (v) => /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/]*={0,2}$/.test(v);

const is = (...values: string[]): AttrCheck => (v) => values.includes(v);
const any: AttrCheck = () => true;
const classes: AttrCheck = (v) => /^[\w -]*$/.test(v);
const headingId: AttrCheck = (v) => /^[\p{L}\p{N}-]+$/u.test(v);
const align: AttrCheck = (v) => /^text-align:(left|center|right)$/.test(v);
/** An SVG drawing attribute: numbers, a path, a colour or a variable; never `url(`. */
const drawing: AttrCheck = (v) => /^[\w\s.,:#()%/+-]*$/.test(v) && !/url\s*\(|expression|script/i.test(v);

/** What `markdownToHtml` writes. */
export const MARKDOWN: Allowlist = {
  tags: {
    p: {},
    br: {},
    h1: { id: headingId },
    h2: { id: headingId },
    h3: { id: headingId },
    h4: { id: headingId },
    h5: { id: headingId },
    h6: { id: headingId },
    strong: {},
    em: {},
    code: {},
    pre: {},
    hr: {},
    blockquote: {},
    ul: {},
    ol: {},
    li: { class: is('task') },
    input: { type: is('checkbox'), disabled: is(''), checked: is('') },
    a: { href: safeHref, target: is('_blank'), rel: is('noopener noreferrer'), class: is('inner-link'), 'data-link': (v) => /^(note|view|doc):[\w-]+$/.test(v) },
    table: {},
    thead: {},
    tbody: {},
    tr: {},
    th: { style: align },
    td: { style: align },
  },
  voids: ['br', 'hr', 'input', 'img'],
};

/** A chart drawn as SVG (`charts/exprSvg.ts`). */
export const SVG: Allowlist = {
  tags: {
    svg: { xmlns: is('http://www.w3.org/2000/svg'), class: classes, viewBox: drawing, width: drawing, height: drawing, role: is('img'), 'aria-label': any, 'font-family': drawing, 'font-size': drawing },
    text: { x: drawing, y: drawing, dy: drawing, 'text-anchor': drawing, fill: drawing, 'font-size': drawing, 'font-weight': drawing },
    tspan: { 'font-size': drawing },
    line: { x1: drawing, x2: drawing, y1: drawing, y2: drawing, stroke: drawing, 'stroke-width': drawing },
    rect: { x: drawing, y: drawing, width: drawing, height: drawing, rx: drawing, fill: drawing },
    path: { d: drawing, fill: drawing },
    polyline: { fill: drawing, stroke: drawing, 'stroke-width': drawing, 'stroke-linejoin': drawing, points: drawing },
    circle: { cx: drawing, cy: drawing, r: drawing, fill: drawing },
    title: {},
  },
  voids: [],
};

/** An analysis document's body as the viewer and its export draw it (`notes/export.ts`): Markdown, blocks and charts. */
export const DOCUMENT: Allowlist = {
  tags: {
    ...MARKDOWN.tags,
    ...SVG.tags,
    div: { class: classes, style: (v) => /^border-left-color:#[0-9a-f]{6}$/i.test(v), 'data-chart-block': any },
    span: { class: classes },
    b: {},
    figure: { class: classes },
    figcaption: {},
    img: { class: classes, src: safeImage, alt: any },
    details: {},
    summary: {},
    button: { type: is('button'), class: is('block-btn'), 'data-action': (v) => /^[a-z-]+$/.test(v), 'data-block': any },
    table: { class: is('kv') },
    article: { class: classes },
    h1: { id: headingId },
  },
  voids: MARKDOWN.voids,
};

const TAG = /<(\/?)([A-Za-z][A-Za-z0-9:-]*)((?:\s+[^\s"'<>\/=]+(?:="[^"<>]*")?)*)\s*(\/?)>/y;
const ATTR = /\s+([^\s"'<>\/=]+)(?:="([^"<>]*)")?/g;
const ENTITY = /&(#x[0-9a-fA-F]+|#[0-9]+|[A-Za-z][A-Za-z0-9]*);/y;

/** The start tags of a string of simple HTML (as `checkHtml` reads it): names lower case, attribute values decoded. */
export function tags(html: string): { name: string; attrs: Record<string, string> }[] {
  const out: { name: string; attrs: Record<string, string> }[] = [];
  for (let i = html.indexOf('<'); i >= 0; i = html.indexOf('<', i + 1)) {
    TAG.lastIndex = i;
    const m = TAG.exec(html);
    if (!m || m[1]) continue;
    const attrs: Record<string, string> = {};
    for (const a of m[3].matchAll(ATTR)) attrs[a[1].toLowerCase()] ??= decodeEntities(a[2] ?? '');
    out.push({ name: m[2].toLowerCase(), attrs });
  }
  return out;
}

/** The problems of a string of HTML against an allowlist: none when it is safe. */
export function checkHtml(html: string, allow: Allowlist): string[] {
  const problems: string[] = [];
  const say = (at: number, what: string) => {
    if (problems.length < 20) problems.push(`${what} at ${at}: ${JSON.stringify(html.slice(Math.max(0, at - 20), at + 60))}`);
  };
  let svg = 0;
  let i = 0;
  while (i < html.length) {
    const c = html[i];
    if (c === '<') {
      TAG.lastIndex = i;
      const m = TAG.exec(html);
      if (!m) {
        say(i, 'a "<" that is no simple tag');
        i++;
        continue;
      }
      const [all, close, rawName, attrs, selfClose] = m;
      const name = rawName.toLowerCase();
      if (FORBIDDEN.includes(name)) say(i, `forbidden <${name}>`);
      const allowed = allow.tags[name];
      if (!allowed) say(i, `tag <${name}> not allowed`);
      if (name === 'title' && !svg) say(i, '<title> outside an SVG (its text is not markup there)');
      if (name === 'svg') svg += close ? -1 : selfClose ? 0 : 1;
      if (close && attrs.trim()) say(i, 'attributes on an end tag');
      const seen = new Set<string>();
      const values: Record<string, string> = {};
      for (const a of attrs.matchAll(ATTR)) {
        const an = a[1];
        const key = an.toLowerCase();
        const raw = a[2] ?? '';
        if (seen.has(key)) say(i, `attribute ${key} twice`);
        seen.add(key);
        if (key.startsWith('on')) say(i, `event handler ${key}`);
        if (/^(xlink:href|formaction|srcdoc|srcset|background|action|poster|lowsrc|dynsrc|ping)$/.test(key)) say(i, `attribute ${key}`);
        const check = allowed?.[an] ?? allowed?.[key];
        if (allowed && !check) say(i, `attribute ${an} on <${name}> not allowed`);
        const value = decodeEntities(raw);
        values[key] = value;
        if (check && !check(value, name)) say(i, `value of ${an} on <${name}> refused: ${JSON.stringify(value.slice(0, 80))}`);
        if (/&/.test(raw) && !/^(?:[^&]|&(?:#x[0-9a-fA-F]+|#[0-9]+|[A-Za-z][A-Za-z0-9]*);)*$/.test(raw)) say(i, 'a bare "&" in an attribute');
      }
      if (name === 'a' && values.target === '_blank' && !/\bnoopener\b/.test(values.rel ?? '')) say(i, 'a new-tab link without noopener');
      i += all.length;
      continue;
    }
    if (c === '>') say(i, 'a raw ">" in text');
    if (c === '&') {
      ENTITY.lastIndex = i;
      if (!ENTITY.exec(html)) say(i, 'a bare "&" in text');
    }
    i++;
  }
  return problems;
}
