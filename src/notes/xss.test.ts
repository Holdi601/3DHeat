import { describe, expect, it } from 'vitest';
import { checkHtml, DOCUMENT, MARKDOWN, SVG, safeHref, tags } from '../../tools/html-allowlist.ts';
import { exprChartSvg } from '../charts/exprSvg';
import { csvField } from '../ui/replay/stats';
import type { Anchor } from './anchors';
import { blockHtml, docBodyHtml, docToHtml, noteCardHtml } from './export';
import { heading, inline, linkTarget, markdownToHtml, MARKDOWN_MAX, plainText } from './markdown';
import { blockRefs, outline, readBlock, readNote, type AnalysisDoc, type DataNote, type DocBlock, type NotesBook } from './model';

/**
 * Notes, analysis documents, chart blocks and their pictures are shared in a
 * session and read from files: someone else's text. Whatever it holds, what
 * the viewer draws from it must hold no script, no event handler, no frame,
 * no outside resource and no link but to the web, mail or the page itself.
 * `tools/html-allowlist.ts` reads the HTML strictly and says what is not
 * allowed; `tools/fuzz-markdown.mjs` throws random Markdown at the same check.
 */

/** Classic filter-evasion payloads (the OWASP cheat sheet and later ones), mutation XSS, entity and Unicode tricks. */
const PAYLOADS = [
  '<script>alert(1)</script>',
  '<SCRIPT SRC=http://xss.example/xss.js></SCRIPT>',
  `<IMG SRC="javascript:alert('XSS');">`,
  `<IMG SRC=JaVaScRiPt:alert('XSS')>`,
  '<IMG SRC=`javascript:alert("XSS")`>',
  '<IMG """><SCRIPT>alert("XSS")</SCRIPT>"\\>',
  '<IMG SRC=# onmouseover="alert(1)">',
  '<IMG SRC=/ onerror="alert(String.fromCharCode(88,83,83))"></img>',
  '<img src=x onerror="&#0000106&#0000097&#0000118&#0000097&#0000115&#0000099&#0000114&#0000105&#0000112&#0000116&#0000058&#0000097&#0000108&#0000101&#0000114&#0000116&#0000040&#0000049&#0000041">',
  '<IMG SRC=&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;&#97;&#108;&#101;&#114;&#116;&#40;&#49;&#41;>',
  '<IMG SRC="jav\tascript:alert(1);">',
  '<IMG SRC="jav&#x09;ascript:alert(1);">',
  '<IMG SRC=" &#14;  javascript:alert(1);">',
  '<SCRIPT/XSS SRC="http://xss.example/xss.js"></SCRIPT>',
  '<BODY onload!#$%&()*~+-_.,:;?@[/|\\]^`=alert("XSS")>',
  '<<SCRIPT>alert("XSS");//\\<</SCRIPT>',
  '<SCRIPT SRC=http://xss.example/xss.js?< B >',
  '<iframe src=http://xss.example/x.html <',
  '</TITLE><SCRIPT>alert("XSS");</SCRIPT>',
  `<INPUT TYPE="IMAGE" SRC="javascript:alert('XSS');">`,
  `<BODY BACKGROUND="javascript:alert('XSS')">`,
  '<svg/onload=alert(1)>',
  '<svg><animate onbegin=alert(1) attributeName=x dur=1s>',
  '<svg><a xlink:href="javascript:alert(1)"><text x="20" y="20">x</text></a></svg>',
  `<LINK REL="stylesheet" HREF="javascript:alert('XSS');">`,
  `<STYLE>@import'http://xss.example/xss.css';</STYLE>`,
  `<META HTTP-EQUIV="refresh" CONTENT="0;url=javascript:alert('XSS');">`,
  `<IFRAME SRC="javascript:alert('XSS');"></IFRAME>`,
  `<DIV STYLE="background-image: url(javascript:alert('XSS'))">`,
  `<DIV STYLE="width: expression(alert('XSS'));">`,
  `<BASE HREF="javascript:alert('XSS');//">`,
  '<OBJECT TYPE="text/x-scriptlet" DATA="http://xss.example/scriptlet.html"></OBJECT>',
  '<EMBED SRC="data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9YWxlcnQoMSk+" type="image/svg+xml">',
  '"><script>alert(1)</script>',
  "'><script>alert(1)</script>",
  '"><img src=x onerror=alert(1)>',
  '" onmouseover="alert(1)" x="',
  '<a href="javascript:alert(1)">x</a>',
  '<details open ontoggle=alert(1)>',
  '<math><mtext><table><mglyph><style><!--</style><img title="--&gt;&lt;img src=1 onerror=alert(1)&gt;">',
  '<noscript><p title="</noscript><img src=x onerror=alert(1)>">',
  '<!--<img src="--><img src=x onerror=alert(1)//">',
  '<![CDATA[<script>alert(1)</script>]]>',
  '<x onclick=alert(1)>click',
  '<form><button formaction=javascript:alert(1)>x',
  '<textarea><script>alert(1)</script></textarea>',
  '<template><script>alert(1)</script></template>',
  '<scr<script>ipt>alert(1)</scr</script>ipt>',
  '&lt;script&gt;alert(1)&lt;/script&gt;',
  '&#60;script&#62;alert(1)&#60;/script&#62;',
  '%3Cscript%3Ealert(1)%3C/script%3E',
  '\u{202e}<script>alert(1)</script>\u{202c}',
  '\u{ff1c}script\u{ff1e}alert(1)\u{ff1c}/script\u{ff1e}',
  '\u{0}<script>alert(1)</script>',
  '{{block:x"><script>alert(1)</script>}}',
];

/** Links in the Markdown's own syntax: schemes, encodings, quotes and spaces. */
const LINKS = [
  '[x](javascript:alert(1))',
  '[x](JAVASCRIPT:alert(1))',
  '[x](JaVaScRiPt:alert(1))',
  '[x]( javascript:alert(1))',
  '[x](jav&#x09;ascript:alert(1))',
  '[x](jav\tascript:alert(1))',
  '[x](&#106;avascript:alert(1))',
  '[x](javascript&colon;alert(1))',
  '[x](java\u{0}script:alert(1))',
  '[x](\u{1}javascript:alert(1))',
  '[x](\u{ad}javascript:alert(1))',
  '[x](vbscript:msgbox(1))',
  '[x](data:text/html,<script>alert(1)</script>)',
  '[x](data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==)',
  '[x](data:image/svg+xml,<svg/onload=alert(1)>)',
  '[x](file:///etc/passwd)',
  '[x](//evil.example)',
  '[x](\\\\evil.example)',
  '[x](https://a"onmouseover="alert(1))',
  "[x](https://a'onmouseover='alert(1))",
  '[x](https://a"><script>alert(1)</script>)',
  '[x](https://a&quot;onmouseover=&quot;alert(1))',
  '[x](#a"onclick="alert(1))',
  '[x](note:a"b)',
  '[x](note:n1"onclick=alert(1))',
  '[<img src=x onerror=alert(1)>](https://ok.example)',
  '[**<script>alert(1)</script>**](https://ok.example)',
  '![x](javascript:alert(1))',
  '![x](https://evil.example/pixel.png)',
  '![x](data:image/svg+xml,<svg onload=alert(1)>)',
  '[x](javascript:alert(1) "title")',
  '[x](<javascript:alert(1)>)',
  '[x][1]\n\n[1]: javascript:alert(1)',
  '<javascript:alert(1)>',
  '<https://ok.example>',
  '[https://good.example](https://evil.example)',
  '[x](https://\u{202e}elpmaxe.live)',
  '[x](mailto:a@b.c?subject="><script>alert(1)</script>)',
  '[x[y](javascript:alert(1))](https://ok.example)',
  '[x](https://ok.example)(javascript:alert(1))',
  '[[[[[[x](javascript:alert(1))',
];

/** Every payload in every place Markdown can put text. */
const contexts = (p: string) => [
  p,
  `# ${p}`,
  `###### ${p} ##`,
  `- ${p}`,
  `1. ${p}`,
  `- [x] ${p}`,
  `> ${p}`,
  `> > > ${p}`,
  `| ${p} | b |\n|---|:-:|\n| ${p} | c |`,
  `**${p}**`,
  `*${p}*`,
  `_${p}_`,
  `\`${p}\``,
  `\`\`\`\n${p}\n\`\`\``,
  `[${p}](https://ok.example)`,
  `[a](${p})`,
  `[${p}](note:n1)`,
  `${p}\n${p}\r\n${p}`,
];

const titles = (kind: string, id: string) => (id === 'n1' ? `"><img src=x onerror=alert(1)> ${kind}` : null);

/** What must never be in the output, as parsed tags. */
function expectClean(html: string, allow = MARKDOWN) {
  expect(checkHtml(html, allow)).toEqual([]);
  for (const t of tags(html)) {
    expect(['script', 'iframe', 'object', 'embed', 'style', 'link', 'meta', 'base', 'form', 'frame', 'applet']).not.toContain(t.name);
    for (const [k, v] of Object.entries(t.attrs)) {
      expect(k.startsWith('on')).toBe(false);
      if (k === 'href') expect(safeHref(v)).toBe(true);
      if (k === 'src') expect(v).toMatch(/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/]*={0,2}$/);
    }
  }
}

describe('the allowlist check', () => {
  it('finds what it is for', () => {
    expect(checkHtml('<img src=x onerror=alert(1)>', MARKDOWN)).not.toEqual([]);
    expect(checkHtml('<p onclick="alert(1)">x</p>', MARKDOWN)).not.toEqual([]);
    expect(checkHtml('<script>alert(1)</script>', MARKDOWN)).not.toEqual([]);
    expect(checkHtml('<a href="javascript:alert(1)">x</a>', MARKDOWN)).not.toEqual([]);
    expect(checkHtml('<a href="jav&#x09;ascript:alert(1)">x</a>', MARKDOWN)).not.toEqual([]);
    expect(checkHtml('<a href="&#106;avascript:alert(1)">x</a>', MARKDOWN)).not.toEqual([]);
    expect(checkHtml('<a href=" JAVASCRIPT:alert(1)">x</a>', MARKDOWN)).not.toEqual([]);
    expect(checkHtml('<a href="data:text/html,x">x</a>', MARKDOWN)).not.toEqual([]);
    expect(checkHtml('<a href="https://x" target="_blank">x</a>', MARKDOWN)).not.toEqual([]);
    expect(checkHtml('<a href=https://x>x</a>', MARKDOWN)).not.toEqual([]);
    expect(checkHtml('<p>a < b</p>', MARKDOWN)).not.toEqual([]);
    expect(checkHtml('<p>a & b</p>', MARKDOWN)).not.toEqual([]);
    expect(checkHtml('<!-- x -->', MARKDOWN)).not.toEqual([]);
    expect(checkHtml('<th style="color:red">x</th>', MARKDOWN)).not.toEqual([]);
    expect(checkHtml('<img src="data:image/svg+xml;base64,AAAA">', DOCUMENT)).not.toEqual([]);
    expect(checkHtml('<img src="data:image/png;base64,AAAA&quot; onerror=&quot;x">', DOCUMENT)).not.toEqual([]);
    expect(checkHtml('<svg><rect fill="url(#x)"/></svg>', SVG)).not.toEqual([]);
    expect(checkHtml('<title>x</title>', SVG)).not.toEqual([]);
    expect(checkHtml('<p>a &amp; <a href="https://x" target="_blank" rel="noopener noreferrer">b</a> <a href="#h">c</a></p>', MARKDOWN)).toEqual([]);
  });
});

describe('the Markdown reader', () => {
  it('makes no markup from any payload, in any place', () => {
    for (const p of [...PAYLOADS, ...LINKS]) for (const md of contexts(p)) expectClean(markdownToHtml(md, { title: titles }));
  });

  it('makes no markup in a line read alone either', () => {
    for (const p of [...PAYLOADS, ...LINKS]) expectClean(inline(p, { title: titles }));
  });

  it('keeps links only to the web, mail, the headings and the viewer', () => {
    // The target ends at the first ")": the rest stays as text.
    expect(markdownToHtml('[x](javascript:alert(1))')).toBe('<p>x)</p>');
    expect(markdownToHtml('[x](jav&#x09;ascript:alert(1))')).toBe('<p>x)</p>');
    expect(markdownToHtml('[x](data:text/html,hi)')).toBe('<p>x</p>');
    expect(markdownToHtml('[x](//evil.example)')).toBe('<p>x</p>');
    expect(markdownToHtml('![x](https://evil.example/p.png)')).not.toContain('<img');
    expect(markdownToHtml('[x](https://a"onmouseover="alert(1))')).toBe('<p><a href="https://a&quot;onmouseover=&quot;alert(1" target="_blank" rel="noopener noreferrer">x</a>)</p>');
    expect(markdownToHtml('[x](mailto:a@b.c)')).toContain('href="mailto:a@b.c"');
    expect(markdownToHtml('[x](#part-2)')).toContain('<a href="#part-2">x</a>');
    expect(markdownToHtml('[](note:n1)', { title: titles })).toContain('&quot;&gt;&lt;img src=x onerror=alert(1)&gt; note</a>');
    expect(linkTarget('https://\u{202e}elpmaxe.live')).toBeNull();
    expect(linkTarget('https://a\u{200b}.example')).toBeNull();
    expect(linkTarget('\u{1}javascript:alert(1)')).toBeNull();
    expect(linkTarget('HTTPS://ok.example')).toEqual({ kind: 'web', value: 'HTTPS://ok.example' });
  });

  it('reads headings as before, without a pattern that backtracks', () => {
    expect(heading('# A title')).toEqual({ level: 1, text: 'A title' });
    expect(heading('## A title ##')).toEqual({ level: 2, text: 'A title' });
    expect(heading('### #')).toEqual({ level: 3, text: '#' });
    expect(heading('#x')).toBeNull();
    expect(heading('####### x')).toBeNull();
    expect(heading('#   ')).toBeNull();
    expect(markdownToHtml('# Hi <b>')).toBe('<h1 id="hi-b">Hi &lt;b&gt;</h1>');
  });

  it('shows the text past its limit as it is, not as markup', () => {
    const md = `${'line\n'.repeat(Math.ceil(MARKDOWN_MAX / 5))}**not bold** <script>alert(1)</script>`;
    const html = markdownToHtml(md);
    expect(html).toContain('<pre><code>');
    expect(html).toContain('**not bold** &lt;script&gt;');
    expect(html).not.toContain('<strong>not bold');
    expectClean(html);
  });

  it('nests quotes only so deep', () => {
    const html = markdownToHtml(`${'>'.repeat(200_000)} x`);
    expect(html.split('<blockquote>').length - 1).toBeLessThanOrEqual(8);
    expectClean(html);
  });

  it('reads any text in time linear in its length', () => {
    const n = MARKDOWN_MAX;
    const slow = [
      `# a${' '.repeat(n)}b`,
      `# a${' #'.repeat(n / 2)}b`,
      `a|b\n${' '.repeat(n)}x`,
      `a|b\n|${' |'.repeat(n / 2)}x`,
      `${'- '.repeat(n / 2)}x`,
      '['.repeat(n),
      `${'['.repeat(n)}]`,
      '[a]('.repeat(n / 4),
      '[](x'.repeat(n / 4),
      '>'.repeat(n),
      '*a '.repeat(n / 3),
      '_'.repeat(n),
      '`'.repeat(n),
      `- ${' '.repeat(n)}\u{2028}`,
      `- ${' '.repeat(n)}\u{2029}x`,
      `- [ ]${' '.repeat(n)}\u{2028}x`,
      `1.${' '.repeat(n)}\u{2029}x`,
      '\n'.repeat(n),
      '\r'.repeat(n),
      ' '.repeat(n),
      ` ${' \r'.repeat(n / 2)}x`,
      `1${' '.repeat(n)}`,
      `${'\n'.repeat(n)}{{block:x}}`,
      `> ${'\r'.repeat(n)}`,
      '```'.repeat(n / 3),
      '- **['.repeat(n / 5),
    ];
    for (const s of slow) {
      for (const f of [() => markdownToHtml(s), () => inline(s.slice(0, 8000)), () => plainText(s), () => outline(s), () => blockRefs(s)]) {
        const t0 = performance.now();
        f();
        expect(performance.now() - t0, JSON.stringify(s.slice(0, 12))).toBeLessThan(400);
      }
    }
  });
});

// ------------------------------------------------------------ documents and their export

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const BAD_PICTURES = [
  `${PNG}" onerror="alert(1)`,
  'data:image/png;base64,AAAA"><script>alert(1)</script>',
  'data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9YWxlcnQoMSk+',
  'javascript:alert(1)',
  'https://evil.example/pixel.png',
];
const BAD = '"><img src=x onerror=alert(1)><script>alert(1)</script>';

const insight: Anchor = { kind: 'insight', id: BAD, insightKind: BAD, text: BAD, place: null, time: null, filters: [] };
const plan: Anchor = { kind: 'plan', title: BAD, game: BAD, level: BAD, plan: { figures: [1] } };
const round: Anchor = { kind: 'round', session: BAD };

function badNote(shot: string): DataNote {
  return { id: `n"${BAD}`, title: BAD, text: `# ${BAD}\n\n[x](javascript:alert(1))`, tags: [BAD], color: 'red;background:url(https://evil.example/t)', author: BAD, created: 0, updated: 0, anchor: round, shot };
}

function badBlocks(pic: string): DocBlock[] {
  const sharedChart = {
    schema: 'heat3d.chartBlock/1',
    type: 'chart',
    title: 5,
    spec: {},
    source: { volumeName: BAD, dataset: BAD, scope: BAD },
    data: { kind: BAD, groups: [{ key: 'a', label: BAD }, { key: 'b', label: '@other' }], series: [{ key: 's', label: BAD }], values: [[1, 2]] },
  };
  return [
    { id: `v"${BAD}`, type: 'view', name: BAD, view: {}, thumb: pic },
    { id: 'i', type: 'insight', anchor: insight, strength: 0.5, evidence: { [BAD]: BAD } },
    { id: 'h', type: 'heat', anchor: { kind: 'heat', point: { x: 1, y: 2, z: 3 }, heat: { value: 1, place: null, rows: null, percentile: null, places: null, ofMedian: null, ofPeak: null, mode: BAD } } as Anchor, thumb: pic },
    { id: 'p', type: 'plan', anchor: plan, thumb: pic },
    { id: 'c', type: 'chart', spec: { v: 1, kind: 'bar', title: BAD, measure: { expr: BAD, name: BAD }, groupBy: null } as never, data: { labels: [BAD, ''], series: [{ label: BAD, values: [1, NaN] }], unit: BAD, rows: 2, at: 0, dataset: BAD } },
    { id: 'c2', type: 'chart', spec: { v: 1, kind: 'tiles', measure: { expr: BAD }, groupBy: null } as never, data: { labels: [BAD], series: [{ label: BAD, values: [3] }, { label: BAD, values: [4] }], unit: BAD, rows: 2, at: 0, dataset: BAD } },
    { id: 's', type: 'chartBlock', block: sharedChart as never },
    { id: 'm', type: 'image', src: pic, caption: `${BAD} [x](javascript:alert(1))` },
    { id: 'n', type: 'note', noteId: 'n1' },
  ];
}

describe('documents', () => {
  it('keep pictures only as raster data URLs and colours only as #rrggbb', () => {
    for (const shot of BAD_PICTURES) {
      const n = readNote({ id: 'n', anchor: round, shot, color: 'red;background:url(//evil.example)' });
      expect(n?.shot).toBeUndefined();
      expect(n?.color).toBe('#f5c542');
      expect(readBlock({ type: 'image', src: shot, caption: '' }, 'b')).toBeNull();
      expect(readBlock({ type: 'view', view: {}, name: 'v', thumb: shot }, 'b')).not.toHaveProperty('thumb');
    }
    expect(readNote({ id: 'n', anchor: round, shot: PNG })?.shot).toBe(PNG);
  });

  it('draw no markup from someone else’s note, block or picture, even one that was never read in', () => {
    for (const pic of [PNG, ...BAD_PICTURES]) {
      const note = badNote(pic);
      const book: NotesBook = { notes: [{ ...note, id: 'n1' }], docs: [] };
      for (const interactive of [true, false]) {
        const ctx = { book, interactive };
        expectClean(noteCardHtml(note, ctx), DOCUMENT);
        for (const b of badBlocks(pic)) expectClean(blockHtml(b, ctx), DOCUMENT);
        const doc: AnalysisDoc = { id: 'd', title: BAD, body: `# ${BAD}\n\n${badBlocks(pic).map((b) => `{{block:${b.id}}}`).join('\n')}\n{{block:i}}\n{{block:gone}}\n[x](note:n1)`, blocks: Object.fromEntries(badBlocks(pic).map((b) => [b.id, b])), author: BAD, created: 0, updated: 0 };
        expectClean(docBodyHtml(doc, ctx), DOCUMENT);
      }
    }
  });

  it('export a file that runs nothing: escaped, and a policy that would stop a script anyway', () => {
    const note = { ...badNote(BAD_PICTURES[0]), id: 'n1' };
    const doc: AnalysisDoc = { id: 'd', title: `</title><script>alert(1)</script>`, body: `${PAYLOADS.join('\n\n')}\n\n{{block:m}}\n{{block:s}}`, blocks: Object.fromEntries(badBlocks(BAD_PICTURES[1]).map((b) => [b.id, b])), author: BAD, created: 0, updated: 0 };
    const html = docToHtml(doc, { notes: [note], docs: [doc] });
    expect(html).toContain(`<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'">`);
    expect(html).toContain('<title>&lt;/title&gt;&lt;script&gt;alert(1)&lt;/script&gt;</title>');
    const body = html.slice(html.indexOf('<body>') + 6, html.indexOf('</body>'));
    expectClean(body, { ...DOCUMENT, tags: { ...DOCUMENT.tags, article: { class: () => true } } });
  });
});

describe('CSV', () => {
  it('keeps a name that starts like a formula as text, and numbers as numbers', () => {
    expect(csvField('=HYPERLINK("https://evil.example","x")')).toBe(`"'=HYPERLINK(""https://evil.example"",""x"")"`);
    expect(csvField('@SUM(A1)')).toBe(`'@SUM(A1)`);
    expect(csvField('-2+3+cmd|x')).toBe(`'-2+3+cmd|x`);
    expect(csvField('+1')).toBe('+1');
    expect(csvField('-5.25')).toBe('-5.25');
    expect(csvField('-1e-5')).toBe('-1e-5');
    expect(csvField('Wolf')).toBe('Wolf');
  });
});

describe('charts as SVG', () => {
  it('draw any title, label and unit as words', () => {
    for (const kind of ['bar', 'line', 'tiles']) {
      for (const p of PAYLOADS) {
        const svg = exprChartSvg({ kind, title: p }, { labels: [p, '', 'x'], series: [{ label: p, values: [1, -2, NaN] }, { label: BAD, values: [3, 4, 5] }], unit: p, rows: 1, at: 0, dataset: '' }, { other: p, empty: p });
        expectClean(svg, SVG);
      }
      // A shared block's title need not be words at all.
      expectClean(exprChartSvg({ kind, title: 5 as never }, { labels: ['a'], series: [{ label: 'b', values: [1] }], unit: '', rows: 1, at: 0, dataset: '' }), SVG);
    }
  });
});
