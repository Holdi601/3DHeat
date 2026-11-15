---
title: Maintaining the docs
nav_order: 95
---

# Maintaining the docs

This site is checked again with **every release** and whenever something changes a lot: key bindings, the way through the UI, settings, file formats. The checklist:

1. **Regenerate the reference pages**: `node tools/docs-refs.mjs` (and `--lang <lang>` for each language). `node tools/docs-refs.mjs --check` fails when a page is out of date.
2. **Regenerate the screenshots** from the [demo data](demo-data.md): `node tools/demo-data.mjs`, a dev server on port 5321 **without** a local figure pack, then `node tools/docs-shots.mjs --lang <lang>`. Look at every picture: only demo names (*Demo Valley*, *Blue 1*, *Red 3* ...), no real maps, players or recordings.
3. **List what changed** since the last release tag: `git log --oneline <last tag>..HEAD`, and the **Docs** section of `CHANGELOG.md`, which maps each feature to its page. Every new feature needs a page or a section, with a picture where it shows on screen.
4. **Independent review** of the English pages by a reviewer that did not write them, for three readers: a beginner, an eight-year-old, an expert. Are the steps complete and in the right order, the words those of the UI, the pictures current, the diagrams' labels right?
5. **Fix the findings.**
6. **Re-translate the changed pages** by their source hash, then run the review per language. See `tools/docs-translate.md`.
7. **Scan for confidential terms** over the changed files, and check that no picture shows anything but demo data.
8. **Push only after the go-ahead.**

The same check covers the documentation sites of the related repositories (see the [Home](index.md#related-repositories) page).
