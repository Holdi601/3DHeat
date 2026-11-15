# Translating the documentation site

The site in `docs/` is written in English and translated into every language the viewer has (`src/i18n/locales/<lang>`). This file is the workflow, so that a later change re-translates only what changed.

## Layout

| What | Where |
|---|---|
| English pages (the source) | `docs/<page>.md` |
| A translation | `docs/<lang>/<page>.md`, the same file name and page tree |
| Screenshots | `docs/assets/img/<lang>/<name>.webp`, taken with the viewer's UI in that language (`node tools/docs-shots.mjs --lang <lang>`) |
| Generated reference pages | `node tools/docs-refs.mjs --lang <lang>` writes `docs/<lang>/ref-*.md` with the language's UI labels |
| Diagrams | text in the page (Mermaid, or SVG whose labels come from a per-language string table), never English text baked into an image |

## Source hashes

Every translated page carries in its front matter the hash of the English text it was made from:

```yaml
lang: de
source: insights.md
source_hash: 3f9a0c1b2d4e   # first 12 hex digits of sha256 of the English file
```

A page whose English source has a different hash now is **outdated**: the site marks it and links the English page. A page with no translation falls back to the English one. Screenshots are tracked the same way: a language's picture is outdated when the English picture of the same name is newer (re-run `docs-shots.mjs` for that language).

## Workflow for a change

1. Change the English pages (and re-run `docs-refs.mjs` and `docs-shots.mjs --lang en` when the UI changed).
2. Have the English pages reviewed by someone who did not write them (beginner, child, expert readers) and fix what the review found; see [docs/maintaining.md](../docs/maintaining.md).
3. List the pages whose `source_hash` no longer matches their English source, per language.
4. Translate only those, a few languages at a time, by a translator (a person or an AI model). Each translator gets: the English page, the old translation if any, and the language's locale files (`src/i18n/locales/<lang>/*.json`), and uses the UI's own words for every button, panel and setting the page names (the docs must say what the screen says). Keep Markdown, links, code, file names and column names unchanged; translate image alt text.
5. Set the new `source_hash` in each translated page.
6. Take the screenshots in each changed language, cropped to what the page shows; WebP, compressed.
7. Run a review per language: clear for beginner, child and expert readers, labels of diagrams right, words match the localised UI. Fix the findings.
8. Run the confidential-terms scan over the changed files, then commit. Publish when the release is approved.

## Size budget

About 300 MB of pictures for the whole site. If all languages' pictures would pass that, keep localised pictures for each feature's key screenshot and let the others fall back to English; say so in the report.
