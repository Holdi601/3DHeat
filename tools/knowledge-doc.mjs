/**
 * Regenerates the catalogue and bibliography of docs/knowledge.md from the
 * knowledge base (src/insights/knowledge/), between the `kb:begin` and
 * `kb:end` markers; the rest of the page is written by hand.
 *
 *   node tools/knowledge-doc.mjs           rewrite the page
 *   node tools/knowledge-doc.mjs --check   exit 1 when the page is out of date
 *
 * Needs Node 22.18+ (TypeScript type stripping): the knowledge files are
 * imported as they are.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const kb = (f) => import(`file:///${resolve(ROOT, 'src/insights/knowledge', f).replace(/\\/g, '/')}`);
const [{ CONCEPTS }, { METHODS }, { CASES }, { DESIGN }, { PATTERNS }, { REFERENCES, shortCite, fullCite }] = await Promise.all(
  ['concepts.ts', 'methods.ts', 'cases.ts', 'design.ts', 'patterns.ts', 'refs.ts'].map(kb),
);

const esc = (s) => String(s).replace(/\|/g, '\\|');
const cites = (e) => e.refs.map(shortCite).join('; ');
const pats = (e) =>
  Object.entries(e.patterns)
    .sort((a, b) => b[1] - a[1])
    .map(([p]) => p)
    .join(', ');

const out = [];
const table = (title, rows, head, cells) => {
  out.push(`### ${title} (${rows.length})`, '', `| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`);
  for (const e of rows) out.push(`| ${cells(e).map(esc).join(' | ')} |`);
  out.push('');
};
const studies = DESIGN.filter((e) => e.type === 'study');
const design = DESIGN.filter((e) => e.type === 'design');
out.push(
  `The knowledge base holds ${CONCEPTS.length + METHODS.length + CASES.length + DESIGN.length} entries (${CONCEPTS.length} concepts, ${METHODS.length} methods, ${CASES.length} historical cases, ${design.length} design principles, ${studies.length} studies) over ${PATTERNS.length} patterns, citing ${REFERENCES.length} references.`,
  '',
);
table('Patterns', PATTERNS, ['id', 'family', 'what it looks like in the data'], (p) => [`\`${p.id}\``, p.family, p.sign]);
table('Concepts', CONCEPTS, ['id', 'title', 'lenses', 'patterns', 'sources'], (e) => [`\`${e.id}\``, e.title, e.lenses.join(', '), pats(e), cites(e)]);
table('Methods', METHODS, ['id', 'title', 'patterns', 'sources'], (e) => [`\`${e.id}\``, e.title, pats(e), cites(e)]);
table('Historical cases', CASES, ['id', 'case', 'when', 'scale', 'patterns', 'sources'], (e) => [`\`${e.id}\``, e.title, e.when, e.scale, pats(e), cites(e)]);
table('Game and level design', design, ['id', 'title', 'patterns', 'sources'], (e) => [`\`${e.id}\``, e.title, pats(e), cites(e)]);
table('Studies', studies, ['id', 'title', 'sources'], (e) => [`\`${e.id}\``, e.title, cites(e)]);
out.push('### Bibliography', '');
for (const r of [...REFERENCES].sort((a, b) => a.authors.localeCompare(b.authors) || a.year - b.year)) out.push(`- ${fullCite(r.id)}${r.pd ? ' *(public domain)*' : ''}`);

const page = resolve(ROOT, 'docs/knowledge.md');
const text = readFileSync(page, 'utf8');
const a = text.indexOf('<!-- kb:begin -->');
const b = text.indexOf('<!-- kb:end -->');
if (a < 0 || b < a) throw new Error('docs/knowledge.md: kb markers missing');
const next = `${text.slice(0, a)}<!-- kb:begin -->\n\n${out.join('\n')}\n\n${text.slice(b)}`;
if (process.argv.includes('--check')) {
  if (next !== text) {
    console.log('docs/knowledge.md is out of date: node tools/knowledge-doc.mjs');
    process.exit(1);
  }
  console.log('docs/knowledge.md is up to date');
} else {
  writeFileSync(page, next);
  console.log(`docs/knowledge.md: ${out.length} lines generated`);
}
