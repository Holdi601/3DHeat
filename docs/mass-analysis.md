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
| Close quarters | round data: opening duels by side and their conversion, trades, peeker against holder, crossfires, flashed entries, aim, plants, man advantage and, **By map**, the places that kill the players entering them - each a share with its Wilson interval, from the summaries' `cqb` counts ([Close quarters and rounds](close-quarters.md)) |
| Map | a map's summed grid: presence, kills, deaths, K/D, any event, flow, and **hot in how many matches** (stability); by team, at 1, 2, 4 or 8 times the cell |
| Places | places that stand out in the numbers but not in the heat (a large area busy as a whole, corridors, height bands); **Find places** |
| Niches | groups doing markedly better or worse than the rest (a vehicle on one map, a sector at one height); **Find niches** |
| Insights | the mass detectors and the map detectors (below); **Copy report (JSON)** gives the JSON a language model reads |

## Insights over many matches

The **Places** tab finds places that stand out in the numbers but not in the heat - a large area busy as a whole, a corridor, a height band, a place busy only in one part of the match - marks the ones the plain heat does not show as **hidden**, and outlines them in the 3D view; **Load** flies there with the matches it held in. The **Niches** tab finds groups (a vehicle on one map and side, a sector at one height) doing markedly better or worse than the rest; click one to see its refinements.

The **Insights** tab finds, over all matches, vehicles that trade or win better or worse than the rest, places hot in a steady share of matches, sides that win more than an even split, vehicles whose use moves over the dates, and parts of the match that hold more kills than an even spread. Each finding carries its counts, effect, interval and a false discovery rate (held to 5%), and a click loads its matches. Details: [For developers](#for-developers).

## Scale

You can repeat a small version of this yourself: `node tools/demo-data.mjs` writes 150 synthetic tank matches to `tools/.shots/demo/mass` (about 1,000 rows each). Measured on those 150 synthetic demo matches of `tools/demo-data.mjs` on a desktop PC (a real match is far larger):

- `tools/3dheat-summarize.mjs` with 4 workers: 2.6 to 4.8 s for all 150, 8 to 21 ms a match inside a worker; a second run that only reads the summaries takes about 2 s.
- Opening the folder in the panel, with the index present, until the window shows: 0.9 to 1.6 s (the worker's own part, reading the 150 index lines, is 20 to 40 ms).
- Switching to a tab, until its table is drawn: Overview 10 to 30 ms, Balance 30 to 70 ms, Trends 30 to 45 ms, Players 15 to 35 ms, Sides 15 to 20 ms, Map 55 to 130 ms.
- The store holds the 150 matches in about 0.5 MB.

Opening the window takes one short frame: the picked files go to the worker 16 at a time, and the date fields and the first tab come a frame after the window.

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
| `meta` | a vehicle's share of player lives or its K/D moving between the earlier and the later half of the dates, per map - large enough to matter, trending over the quarters, the same way on most maps (below) |
| `phase` | a part of the match length holding more kills, hits, launches... than an even spread |
| `place` | places that stand out over many matches (Stage B, below): a region's rate or kill share against each match's own, circles, corridors, grown zones, height bands, phases; hidden when the plain heat does not show them |
| `niche` | groups doing markedly better or worse (Stage B, below) |
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
- behaviour: the match's collective-behaviour measures (alignment, route
  herding, lanes, crowding, leaders, stragglers, breaking point, risk after
  losses, streaks, buy agreement, suppression), each with its own null model,
  p and q - see [Collective behaviour](collective-behaviour.md);
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

### Stage B: places and niches

Stage B looks for what stands out in the numbers without catching the eye:
a large area busy as a whole with no hot cell in it, an odd kill-death
ratio on few events, a corridor, a height band, a cluster that is there only
in one part of the match - and groups (a vehicle on one map on one side, a
sector at one height) doing markedly better or worse than the rest. One
**Find places** / **Find niches** / **Find insights** runs all detectors;
the three tabs share the report.

#### Places (`src/mass/scan.ts`)

Each map's matches are read twice, a match at a time; memory holds sums on a
raster of at most 64 cells a side (16 for the space-time scan), never the
matches.

- **Measures.** An event's rate per second of presence - kills, deaths,
  hits, launches, captures, for all units, per class (the 4 with most
  events), per height band - and the share of kills in kills and deaths
  (all, per side, per band). Which classes and sides come from the heads
  (`planOf`).
- **Expectation by match.** Each match's own rate spread over its own
  presence in a cell is the cell's expectation (a covariate-adjusted
  Kulldorff scan stratified by match): a few bloody matches or one busy
  server make no place.
- **Dispersion.** Matches disagree far beyond Poisson. Each match's
  residuals are summed in blocks of 1, 2, 4, 8, 16 cells; the dispersion of
  each block size (squared residuals over the null variance, pooled, the
  worst 5% of blocks left out) scales every test of a region that size: a
  quasi-likelihood ratio, Poisson for rates, binomial for shares.
- **Regions.** Circles of 0.75 to 18 cells; ellipses at six angles, 3 and 6
  times as long as wide, 3 to 18 cells (corridors; the axis is the
  insight's `place.path`); zones grown cell by cell from the strongest local
  Getis-Ord Gi* cells while the region's z grows (irregular shapes) - grown
  on one half of the matches and tested on the other, so the growing's
  freedom costs no false places; each height band against the match's other
  bands over the whole map (cluster-robust); space-time cylinders: a circle
  in one or two fifths of the match length, against the match's own spread
  of its events over place and time (the space-time permutation scan).
- **Testing.** p from the quasi-likelihood; Benjamini-Hochberg over every
  region tried on every map (700,000 on three maps is usual) at 5%. What
  passes is pruned (a region mostly inside a stronger one of its measure says
  the same), read again for its **stability** - matches that saw it, matches
  it held in, its direction in five folds of the matches - and tested once
  more at the variance the matches themselves show (cluster-robust, matches
  as clusters, never under Poisson), BH again. Quiet places on a base (2% or
  more of the map's spawns, take-offs and landings) are left out.
- **Effect.** The rate (or odds) ratio, shrunk by empirical Bayes (a gamma
  prior fitted to the map's 2x2 blocks), with a ~95% interval at the
  dispersion; Gi* at 1, 2 and 4 cells and local Moran at the centre.
- **Visual obviousness.** How much the region already shows in the plain
  heat of its event (log scale to the brightest cell, as the views draw it):
  its contrast with a ring around it (a tenth of the palette is hard to see,
  two fifths plain) and a bright peak carrying the excess; a ratio is never
  drawn by the heat, so a share counts half. Under 35% is **hidden**. The
  rank: strength (effect saturating at 4 times, quiet places at 0.7) times
  `1 - 0.7 x obviousness` times the folds' agreement.

The **Places** tab lists them (hidden only by default; by map, shape,
direction), a click outlines the map's places in the 3D view (`placeLines.ts`:
the engine's top lines, built once - magenta hidden, amber plain, cyan quiet,
the picked one full; a band as a box from its floor to its ceiling) and on
the Map tab's canvas; **Load** flies there and loads the 60 matches it held
in most, filtered to its event (and class).

#### Niches (`src/mass/niche.ts`)

Beam search (width 24, depth 3) over three tables: **lives** (players' lives:
game, map, mode, class, vehicle, side, tier, quarter of the dates, third of
the match lengths; K/D, win, death a life, kills an hour, earnings a
minute), **places** (kills and deaths by map, mode, dates, sector of the map
4 x 4, class, side, band) and **phases** (sector and fifth of the match:
K/D, deaths an hour of presence). A group is tested against the whole with
matches as clusters (the sandwich variance of its residuals by match), its
effect an odds or rate ratio shrunk by a prior of 20 outcomes; it needs 30
outcomes in 8 matches, a refinement must be 10% stronger than its parent,
groups where the outcome is none or all (not recorded for them) are left
out. Kept: BH under 5% over every group evaluated, a shrunk ratio of 1.25
(or 1/1.25) at least, four of five folds agreeing, not a refinement that
only repeats its parent. The **Niches** tab lists them; a click shows every
one-condition refinement of the group (the explorer), **Load** loads its
matches. Loadouts are not in the summaries yet.

#### Meta shifts with practical significance

On mixed dates the binomial on lives called nearly every change significant. `meta` now tests cluster-robust (each match's
lives a cluster), keeps a use shift only of 2 points and 25% at least, a
K/D shift of 1.3 times, the dates' quarters trending the same way (Kendall's
tau at least 0.5) and, for a vehicle on several maps, the same direction on
most of them. That leaves only a few shifts on a test set where the plain test flagged nearly all.

#### For a model

`massReportForModel` gives each place its `region` (shape, hidden,
obviousness, heights, phase) and each niche its `conditions`, plus how many
regions and groups were tried. The knowledge lens can read places as kill
zones and avenues of approach: their kinds are `place.*` and `niche.*`.

#### Checks

`scan.test.ts` plants a diffuse area (1.6 times the death rate over a circle
of 22 cells, faint in every cell), a corridor, a height band and a
phase-only cluster in 240 synthetic overdispersed matches - all found, the
diffuse one hidden - and runs eight null sets of 60 matches: no place.
`niche.test.ts` finds a planted vehicle x map x side group and nothing in
five null tables.
