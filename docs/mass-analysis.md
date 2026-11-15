---
title: Mass analysis
nav_order: 8
---

# Mass analysis: thousands of matches at once

**Mass analysis** shows you what a whole folder of matches adds up to: which vehicle wins most, which side is favoured, where the action is. Use it when you have far more matches than you could watch.

It works from a small summary of each match, so a thousand or ten thousand matches open fast. It loads the full rows only for the matches you click.

## Try it

1. Open **Mass analysis** in the Heatmap sidebar.
2. Press **Folder...** (or **Files...**) and pick your `.3dheat` matches.
3. Wait while the panel reads the summaries ("Summaries... n of N").
4. Press **Open analysis**. A window opens with tabs.
5. Set the filters (Game, Map, Mode, From, To), then read a tab, for example Balance.
6. Click a row, a cell or an insight: its matches load into the 3D view, with the camera on the place.

![The Balance tab: win rate and kills per death by vehicle](assets/img/en/mass-balance.webp)

```
folder of .3dheat -> summaries -> window (tabs) -> click a row -> matches open in 3D
```

A `.3dheat` file is one match ([One file a match](container.md)). A *heatmap* and a *row* are explained in the [glossary](glossary.md).

## Getting the summaries

Nothing to do for most people: the panel works out missing summaries itself. To prepare a big folder once, use the offline tool below.

Every `.3dheat` match gets a summary (`src/mass/summarize.ts`), kept in the
container as the member `<match>.summary.json` (role `summary`, see
[One file a match](container.md)). The offline tool writes them, and an
index per folder. It is a developer tool; run it on a big folder to save the panel the work:

```
node tools/3dheat-summarize.mjs <folder>... [--jobs N] [--force] [--no-write] [--no-index] [--limit N] [--settle MIN]
```

- A match summarised already (same format version) is only read; `--force`
  works it out again. `--no-write` leaves the containers alone.
- A file changed in the last `--settle` minutes (10) is left out: a converter
  may still be writing it.
- `<folder>/3dheat-index.jsonl.gz`: a line a match - its path, size, time
  and summary without the grid. `<folder>/3dheat-index.grids.jsonl.gz`: a
  line a match with its grid.
- Run it on the machine that holds the files, at low priority (for example `nice -n 19 ionice -c3` on Linux).

The panel takes, for each match, the first of: the folder's index line (same
path and size), the browser's cache (IndexedDB, by name, size and time), the
container's `summary` member, or a summary worked out in a pool of workers
and cached. So a folder without an index works too - the first time at the
speed of reading the tables, after that from the cache.

## The panel

Pick a folder (or files; **Add folder...** joins another). The window has the filters **Game**, **Map**, **Mode**, **From** and **To**, a **Split by** choice, **Fewest lives** and **Players only**, and these tabs. Every number comes from the summaries, and a click on a row, a cell or an insight loads its matches into the view as the many-match overlay with the filters that show it (vehicle, class, weapon, team, player) and the camera on the place:

| Tab | What |
|---|---|
| Overview | matches, hours, players, lives, rows, dates; matches a day; by game, map, mode; event totals; economy by currency; when in the match things happen |
| Balance | by vehicle, class, weapon or team, split by map, mode, tier or game: K/D with its ~95% interval, win rate (Wilson), survival, kills and hits a minute, earnings a minute, and q - the Benjamini-Hochberg false discovery rate of K/D and win against the rest of the split. **Fewest lives** hides rows with too few lives to trust; **Players only** leaves out what the mission's AI drove |
| Trends | use (share of presence), K/D or win rate of the top vehicles or classes a day, week or month |
| Players | distinct players, matches a player, players a match, the most frequent players |
| Sides | each side of each map: matches won against an even split |
| Map | a map's summed grid: presence, kills, deaths, K/D, any event, flow, and **hot in how many matches** (stability); by team, at 1, 2, 4 or 8 times the cell |
| Places | places that stand out in the numbers but not in the heat (a large area busy as a whole, corridors, height bands); **Find places** |
| Niches | groups doing markedly better or worse than the rest (a vehicle on one map, a sector at one height); **Find niches** |
| Insights | the mass detectors and the map detectors (below); **Copy report (JSON)** gives the JSON a language model reads |

## Insights over many matches

The **Insights** tab finds, over all matches, vehicles that trade or win better or worse than the rest, places hot in a steady share of matches, sides that win more than an even split, vehicles whose use moves over the dates, and parts of the match that hold more kills than an even spread. Each finding carries its counts, effect, interval and a false discovery rate (held to 5%), and a click loads its matches. Details: [For developers](#for-developers).

## Scale

SCALE_PLACEHOLDER

The store keeps about 15 KB a match, so 10,000 matches take ~150 MB in the
worker; grids are never held for more than the map asked for.

## For developers

### Insights over many matches

`src/mass/detect.ts` - every finding with its counts, effect and interval,
p and q (Benjamini-Hochberg over everything the detector tried, held to 5%),
the drill-down that loads its matches and a sentence key with its values;
the report (`heat3d.mass/1`) is what `massReportForModel` hands a narrator,
in the same shape as the single-match report (`insights/seam.ts`).

| Detector | Finds |
|---|---|
| `balance` | a player vehicle trading or winning better or worse than the rest on a map or in a mode |
| `hotspot` | places hot in a steady share of the matches that came by (matches hot / matches seen, against the map's other cells) - not just hot in sum |
| `side` | a side of a map winning more than an even split |
| `meta` | a vehicle's share of player lives or its K/D moving between the earlier and the later half of the dates, per map |
| `phase` | a part of the match length holding more kills, hits, launches... than an even spread |
| `grid.*` | the single-dataset detectors (power positions, hot and quiet zones, class places) on each map's summed grids: `GridMerge.toInsightJob` fills the insight pass's grids from the summaries; the detectors that need tracks skip |

### The summary

Plain JSON (`src/mass/types.ts`), about 5-30 KB deflated a match:

- the match: game, map, mode, mission, start, length, rows, lives, players,
  AI, teams (lives, players, presence, kills, deaths, won, money), winner;
- per vehicle and team: class, tier, lives, player lives, presence, events
  by canonical kind, kills by the target's class, wins, money;
- per player (by user id, else name): team, lives, presence, kills, deaths,
  hits, launches, won, vehicles; per weapon: events by kind;
- the economy's columns (`cost_*`, `earn_*`) and their totals;
- phases: events by kind in 20 bins of the match length and by the minute;
- the grid (below).

Counted as the viewer counts: columns found as the many-match loader finds
them (`leanSpec`), events by `data/canonical.ts`; a kill a Tacview weapon
scores counts for its shooter; a death said twice at once (`dead`, `death`)
counts once.

#### The grid: what Stage B builds on

The spatial part is made for scan statistics over regions of any size and
shape, not only for heat pictures:

- **A pyramid.** Cells are aligned powers of two in world units (x, z as the
  viewer places them). Level `k` is the cells summed by `ix >> k, iz >> k` -
  exact, within a match and across matches of other cell sizes - and any
  region (a box, a corridor along a line, a ring) is a sum of cells. The
  finest level fits the match's robust extent (the cells holding 99% of the
  presence) in 128 cells; strays outside it are kept.
- **Exposure beside every count.** Presence seconds per cell, per team
  (`pt`), per vehicle class (`pc`) and per height band (`ph`), so a region's
  rate, expectation and ratio are worked out for any subgroup.
- **Height.** Bands above the match floor (the 1st percentile of height):
  under 3 m, 3-10, 10-30, 30-100, 100-300, 300-1000, 1000-3000, above; a file
  with a `floor`/`storey`/`deck` column bands by its floors instead. `y` is
  each cell's mean height, `y0` its lowest (its floor, for height above it).
- **Events** as tuples `[cell, kind, team, class, band, count]`.
- **Time slices** at a coarse level (8 cells a side), by the minute from
  the match start: `[cx, cz, minute, kind, value]`, presence seconds as kind
  `GRID_KINDS.length`; match phases are minutes over the length.
- Sparse, counts integers, seconds to a tenth: bounded by what happened.

### Stage B: niche and subgroup discovery

Stage B adds detectors that look for places and groups that stand out
without catching the eye: a large area busy as a whole with no hot cell,
an unusual ratio on few counts, corridors and lines, height layers. It
plugs in without changing the rest:

1. A detector is a `MassDetector` (`detect.ts`): `skip(ctx)` and
   `run(ctx) -> { insights, tests }`; pass it in `massInsights(ctx, extra)`.
   Its findings are `MassInsight`s (same JSON, same q control, a `drill`
   that loads their matches, a `place` with `path` for a corridor).
2. `ctx` holds the `MassStore` (every match's head as columns), the
   filter's mask and a `GridMerge` per map. For region scans, read the
   summaries' grids directly - stream them with `mergeOf` in
   `massWorker.ts`, or keep per-match cells: the pyramid, exposures, bands
   and slices above are what a Kulldorff-style scan (or a corridor or
   band scan) needs, with Monte Carlo or BH over the regions tried.
3. A new sentence is a `mass.say.<kind>Up` / `Down` message in
   `locales/*/mass.json`.


