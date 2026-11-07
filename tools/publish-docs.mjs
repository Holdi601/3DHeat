/**
 * Copies the documentation site in docs/ into a checkout of the public docs
 * repository (Holdi601/3DHeat-Docs), ready to commit there.
 *
 * The viewer's code is private, so its pages are published from a repository
 * of their own. Links into the code would lead nowhere for a reader there:
 * each becomes its text alone, a file name in a code span where the text was
 * one. Links into the sister tools' repositories stay, and links to their
 * docs pages go to their sites. The wiki folder is not copied.
 *
 *   node tools/publish-docs.mjs <checkout of 3DHeat-Docs>
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';

const target = process.argv[2];
if (!target || !existsSync(target)) {
  console.error('usage: node tools/publish-docs.mjs <checkout of 3DHeat-Docs>');
  process.exit(2);
}
const SRC = resolve(import.meta.dirname, '..', 'docs');
const PRIVATE = /\[([^\]]+)\]\(https:\/\/github\.com\/Holdi601\/3DHeat(?:\/(?:blob|tree)\/[^)]*|\.git)?\)/g;
const TOOL_DOCS = /https:\/\/github\.com\/Holdi601\/(3DHeat-[A-Za-z]+)\/blob\/main\/docs\/([a-z0-9-]+)\.md/g;

// Pages removed from docs/ go from the site too.
for (const name of readdirSync(target)) {
  if (name.endsWith('.md') && name !== 'README.md') rmSync(join(target, name));
}

let left = 0;
for (const name of readdirSync(SRC)) {
  if (!name.endsWith('.md') && name !== '_config.yml') continue;
  let text = readFileSync(join(SRC, name), 'utf8');
  text = text
    .replace(TOOL_DOCS, (_, repo, page) => `https://holdi601.github.io/${repo}/${page}.html`)
    .replace(PRIVATE, (_, label) => label);
  if (name === '_config.yml') {
    text = text.replace(/"GitHub": "https:\/\/github\.com\/Holdi601\/3DHeat"/, '"3DHeat tools on GitHub": "https://github.com/Holdi601?tab=repositories&q=3DHeat"');
    // The docs repository's own README is for GitHub, not a page of the site.
    text = text.replace(/^exclude:\r?\n/m, (line) => line + '  - README.md\n');
  }
  const stray = text.match(/github\.com\/Holdi601\/3DHeat(?![-A-Za-z])/g);
  if (stray) {
    left += stray.length;
    console.warn(`${name}: ${stray.length} link(s) into the private repository left`);
  }
  writeFileSync(join(target, name), text);
}
console.log(left ? `copied, with ${left} private link(s) to look at` : 'copied');
