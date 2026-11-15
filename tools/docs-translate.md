# Translating the documentation site

The site in `docs/` is written in English and published in every language the viewer has (`src/i18n/locales/<code>`). This file is the workflow, so that a later change re-translates only what changed.

## Layout

| What | Where |
|---|---|
| English pages (the source) | `docs/<page>.md` |
| A language's pages | the Jekyll collection `docs/_<code>/<page>.md`, served at `/<code>/<page>.html`; every English page has one, a short stub pointing to English until it is translated |
| Titles and site strings | `docs/_data/i18n/<code>.json` (`titles`: English title → title in the language, unique within the language; `ui`: the picker's and the notices' words) |
| Language list | `docs/_data/languages.json`, written from `src/i18n/languages.ts` |
| Navigation per language | `docs/_includes/components/{sidebar,site_nav,breadcrumbs,children_nav}.html`: the theme's files (just-the-docs v0.10.0) with the navigation limited to the page's language; `header_custom.html` holds the language picker and the "not translated" / "out of date" notice, `head_custom.html` the redirect of the English home page to the browser's language |
| Screenshots | `docs/assets/img/<code>/<name>.webp`, taken with the viewer's UI in that language: `node tools/docs-shots.mjs --lang <code> --only <groups>`; a page uses its language's picture where one exists and the English one otherwise |
| Reference pages | `node tools/docs-refs.mjs --lang <code>` writes `docs/_<code>/ref-*.md` with the language's UI labels |
| Diagrams | Mermaid in the page text, so their labels are translated with the page |

## Source hashes

Each translated page's front matter says what it was made from:

```yaml
lang: "de"
source: "insights.md"
source_hash: "3f9a0c1b2d4e"   # sha256 of the English file, 12 hex digits
translated: true
outdated: false
```

`node tools/docs-i18n.mjs sync` keeps the front matter in step with the English page and sets `outdated: true` when the English file no longer has that hash; the page then shows "may be out of date". `node tools/docs-i18n.mjs status` counts translated, outdated and untranslated pages per language; `todo <code>` lists the pages of a language that need work.

## Translating a page

1. `node tools/docs-i18n.mjs source <page>.md` prints the English text with every heading carrying its English anchor (`{#anchor}`), so links into the page keep working in every language.
2. `node tools/docs-i18n.mjs terms <code> <page>.md` prints the UI's own words in the language for every bold label of the page: the docs must say what the screen says. A short label can belong to several places of the UI; check the context in `src/i18n/locales/<code>/*.json`.
3. Write the translation below the existing front matter of `docs/_<code>/<page>.md` and change `translated: false` to `translated: true`. Keep Markdown, anchors, links, image paths, code, file and column names, keys and the demo names; translate alt texts and Mermaid labels.
4. `node tools/docs-i18n.mjs sync --lang <code>`, then `node tools/docs-refs.mjs --lang <code>`.

## Workflow for a change

1. Change the English pages; regenerate `docs-refs.mjs` and the English screenshots when the UI changed.
2. Review the English pages (beginner, child and expert readers) and fix the findings; see [docs/maintaining.md](../docs/maintaining.md).
3. `node tools/docs-i18n.mjs status`: translate the outdated and new pages per language (one language per translator, with the steps above).
4. Review each language: meaning, plain wording, the UI's words, structure. Fix the findings.
5. Retake the language's screenshots: `node tools/docs-shots.mjs --lang <code> --only <groups>`, then `sync` points the pages at them.
6. Scan the changed files for confidential terms, then commit. Publish only after the owner agrees.

## What is translated today

The 21 pages a new user needs first (home, demo data, getting data in, heat modes, heat, difference, team heat, timeline, filters and tools, filters, volumes, insights, match replay, figures, many matches, race analysis, tactics board, levels, settings, glossary, updates) in all 39 languages besides English, and every page's title. The other pages show their title in the language and point to the English text. Screenshots: the pictures of those pages in every language.

## Size

About 300 MB of pictures for the whole site at most. All languages' pictures of the translated pages take about 3.6 MB a language.
