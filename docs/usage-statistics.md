---
title: Usage statistics
nav_order: 17
---

# Usage statistics

3DHeat can keep statistics of how you use it, so the layout can follow what you actually do: which features you use, how you reach them, and where you get stuck. They are **off by default**, and **nothing ever leaves your computer**: there is no analytics service, no third-party script, and no network request to anywhere but the viewer's own local server.

## Switching them on and off

- **In the viewer:** the gear (Settings) › **Keep local usage statistics to improve your layout**. Your choice is kept in this browser and always wins.
- **For a local install:** `"usageStats": true` in the git-ignored `tools/local-data.json` switches them on for every browser that opens the viewer from this machine's dev or preview server (`npm run dev`, `npm run preview`). `"usageDir": "<folder>"` names the folder the server writes to (default: `tools/.usage`, also git-ignored). The environment variables `HEAT3D_USAGE=1` / `HEAT3D_USAGE=0` and `HEAT3D_USAGE_DIR` override the file.

The viewer asks its server whether the install keeps statistics only when it is opened from this machine (`127.0.0.1` or `localhost`). A copy hosted anywhere else makes no request.

## Where they are kept

- **In the browser:** IndexedDB (`heat3d-usage`), at most 300,000 events; the oldest go first.
- **On disk, for a local install with the key on:** the dev or preview server appends each batch to `usage-YYYY-MM-DD.jsonl` in the usage folder, one event a line. The route (`/__heat3d/usage`) answers 204 and writes nothing while the key is off; with it on it takes only a batch from the page's own origin, at most 512 KB and 2,000 events, in which every event passes the schema field by field (unknown fields, free text in the wrong place, ids that are not message keys or command ids are refused whole).

Settings › **Your usage…** shows the top lists, and has **Export** (a JSON file of every event kept in this browser) and **Delete** (this browser's events and the local files).

## What is recorded

Every event names a part of the viewer by a stable id built from its own message keys and command ids (`ctl:<section>/<label>`, `sec:<section>`, `cmd:<command>`, `ws:<workspace>`...), never from what is on the screen.

| Event | What it holds |
|---|---|
| Session | the backend (WebGPU / WebGL2) and the screen size, rounded |
| Active time | time with input in the last minute, per workspace and view mode |
| Data loaded | how (open files, folder, drop, session, catalogue, generator), the file **types** (parquet, csv, acmi, wrpl...), how many files, the rows as a power of ten, how long it took |
| Use | a command, button, key or setting used: its id, where it came from (palette, key, button, quick bar, context; `auto` when the viewer did it by itself, which the report does not count as a use), how many steps it took from rest, how far the side panel was scrolled |
| Open / close | a section, panel, task group, More fold or dialog, and how long it was open |
| Setting changed | its id; the value only where it is one of a fixed few (on/off, a mode) |
| Help | a control explained by F1, or a tooltip read for over a second |
| Friction | undone right after use, opened and closed within 3 s, clicked three times on one spot within a second, a click that changed nothing within a second, the same search again, wandering through panels then using the palette, switched on and off repeatedly |
| Errors | an error shown, and the feature used just before it |
| Frame rate | time per frame-rate bucket per workspace, and how often the quality switch turned extras off |
| On screen | how long each control or section was visible |
| Feedback | your answer on a control: "I don't understand this", "This doesn't work", "I'd use this more if…" |

**Your own words are kept in two places only:** a command-palette search that found nothing (the words, up to 80 characters, so a command missing where you looked can be added), and the note you write with feedback (up to 500 characters). The settings page says so.

## What is never recorded

- file names, folder names or paths;
- level, map, match, player, unit or team names;
- data values, positions, filters, notes, chart or analysis contents;
- the text of what you type anywhere else;
- anything that identifies you or your machine beyond the rounded screen size.

A unit test feeds paths, file names and names to every recording function and checks none of them reaches an event, and the server refuses a batch that carries one.

## Feedback on a control

While the statistics are on, right-click a control in the side panel, the bars or the settings for **I don't understand this**, **This doesn't work** or **I'd use this more if…**, with an optional note. The same three answers are on the help card (`F1`) under the control it explains.

## Reading the report

```
node tools/usage-report.mjs                       # the usage folder of tools/local-data.json
node tools/usage-report.mjs path/to/3dheat-usage-2026-11-21.json
node tools/usage-report.mjs --all --since 2026-11-01
```

It prints the time per workspace and mode, the data loads, the top features by use (with how they were reached and the steps it took), the to-fix list, the features hard to reach for how often they are used, friction hot spots, palette searches that found nothing, the feedback, and every feature of the side panel's index with a class:

| Class | Evidence |
|---|---|
| possibly broken | clicks that changed nothing, errors right after use, "This doesn't work" |
| confusing | undone, closed at once, toggled back and forth, rage clicks, "I don't understand this" |
| unclear | its help read more often than it was used |
| hard to reach | used more than once, but typically four or more steps from rest or 1,500 px down a panel; or found only after wandering; or only ever through the palette |
| too hidden | never on screen (a key never used counts here too) |
| seen, not tried | on screen and opened on purpose, never used |
| fine but unused | on screen in passing, nothing wrong seen |
| used | used |

Unused never means unneeded: a feature can be unused because it is hidden, unclear, hard to reach or broken, and the class says which the evidence points to. The steps column compares the typical steps of the recorded uses with the fewest the layout allows (workspace, More fold, sections to open, the click). The smoke column says whether one of the smoke suites (`tools/smoke*.mjs`) names the feature; a feature that is possibly broken, unused and without a smoke step is the top of the to-fix list.

## Cost

Recording an event is a push onto an array. Batches are written when the browser is idle, every few seconds at most; the frame rate is read from the quality switch's own measurements by a five-second timer, and the controls on screen by an IntersectionObserver. Nothing runs on the frame path.
