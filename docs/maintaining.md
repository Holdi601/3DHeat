---
title: Maintaining the docs
nav_order: 23
---

# Maintaining the docs

This page is for whoever looks after the viewer and this site. It lists the steps to keep the pages, the pictures and the translations correct after a change.

This site is checked again with **every release** and whenever something changes a lot: key bindings, the way through the UI, settings, file formats. The checklist:

1. **Regenerate the reference pages**: `node tools/docs-refs.mjs` (and `--lang <lang>` for each language). `node tools/docs-refs.mjs --check` fails when a page is out of date.
2. **Regenerate the screenshots** from the [demo data](demo-data.md). Use a computer or container whose region is en-US, so numbers read `0.35` and not `0,35` (the number boxes follow the browser's region until they are changed). Make the demo data with `node tools/demo-data.mjs`, start a dev server on port 5321 **without** a local figure pack, `HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1`, then run `node tools/docs-shots.mjs --lang <lang>`. Look at every picture: only demo names (*Demo Valley*, *Blue 1*, *Red 3* ...), no real maps, players or recordings.
3. **List what changed** since the last release tag: `git log --oneline <last tag>..HEAD`, and the **Docs** section of `CHANGELOG.md`, which maps each feature to its page. Every new feature needs a page or a section, with a picture where it shows on screen.
4. **Independent review** of the English pages by someone who did not write them, for three readers: a beginner, an eight-year-old, an expert. Are the steps complete and in the right order, the words those of the UI, the pictures current, the diagrams' labels right?
5. **Fix what the review found.**
6. **Re-translate the changed pages** by their source hash, then run the review per language. See `tools/docs-translate.md`.
7. **Scan for confidential terms** over the changed files, and check that no picture shows anything but demo data.
8. **Publish** only when the release is approved.

The same check covers the documentation sites of the related repositories (see the [Home](index.md#related-repositories) page).

## The tools under exporters/

The tools around the viewer are separate public projects, each with its own
MIT licence, releases, wiki and update check, pinned in this repository as
git submodules:

| Folder | Repository |
|---|---|
| `exporters/gamefiles/` | [3DHeat-GameFiles](https://github.com/Holdi601/3DHeat-GameFiles) - courses and levels out of games' own archives |
| `exporters/gamecapture/` | [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture) - lap telemetry recorders; levels from gameplay video |
| `exporters/unreal/` | [3DHeat-UnrealExporter](https://github.com/Holdi601/3DHeat-UnrealExporter) - Unreal Editor plugin |
| `exporters/cs2/` | [3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2) - CS2 demos and maps |
| `exporters/watcher/` | [3DHeat-Watcher](https://github.com/Holdi601/3DHeat-Watcher) - records play in the background |

**Pinned** means this repository records one exact commit of each tool. A
checkout of the viewer gets those commits:

```bash
git clone --recursive https://github.com/Holdi601/3DHeat
# or, after a plain clone:
git submodule update --init
```

Both update paths above run `git submodule update --init` after pulling, so
the tools follow the viewer to the commits its newest version pins - not
the tools' own newest commits. A tool's newer release reaches the viewer
when the pin here is moved: changes to a tool are committed and pushed in
its own folder (its own repository) first, then the new pin is committed
here. Each tool also checks for its own newer releases; that is documented
in its own repository.
