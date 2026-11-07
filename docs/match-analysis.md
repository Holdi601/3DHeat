---
title: Match analysis (CS2)
nav_order: 60
---

# Match analysis (Counter-Strike 2)

The **Match** tab is the scoreboard and round-by-round view of CS2 matches,
over the heatmap of the same matches: score, halves and overtime, every
round's result and economy, the kill feed, the scoreboard, statistics across
every loaded match - and every part of it one click from the heatmap, through
the heatmap's own filters.

Code: [`src/ui/match/MatchPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/match/MatchPanel.tsx),
[`src/match/matchDoc.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/matchDoc.ts),
[`src/match/focus.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/focus.ts),
[`src/state/matchStore.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/state/matchStore.ts).

## Where the data comes from

The demo converter of [3DHeat CS2](https://github.com/Holdi601/3DHeat-CS2)
turns demos into two files per match, in a folder per map:

```bash
python -m heat3d_cs2 demos <demo files or folders> -o out
```

| File | Loaded in | Holds |
|---|---|---|
| `<match>.parquet` | the **Heatmap** tab (Source panel, like any Parquet - one file, several, or the whole folder) | every player's position eight times a second, and every event where it happened: kill, death, hurt, shot, throw, smoke, flash, HE, molotov, decoy, blind, plant, defuse, explode; with `match`, `round`, `roundId`, `event`, `player`, `side`, `team`, look direction, `weapon`, `place`, `opening`, `traded` … |
| `<match>.match.json` | the **Match** tab | teams, score, every round (winner, how, economy, the plant, every kill in order, clutches, survivors), every player's scoreboard line |

The Parquet file's footer carries reading instructions (key `heat3d`), so it
opens with nothing to set: the player as the person, the side as the group,
each round (`roundId`, "<match> #NN") as a session, the look direction on,
and the world the right way round (CS2's world is right-handed with Z up;
read as the default Z-up mapping it would come out mirrored). See
[Column mapping](column-mapping.md) and [Loading files](loading-files.md).
`python -m heat3d_cs2 map <map>` exports the map geometry in the same frame,
loaded in **Level**.

The conventions behind the numbers are the converter's (stated in its
README and carried in each summary): a death is **traded** when its killer
is killed by one of the victim's teammates within **5 s**; **KAST** is the
share of rounds with a kill, an assist (a flash assist counts), survival or
a traded death; **damage** is health actually lost, enemies only; a
**clutch** is being the last alive on a side with enemies standing, won when
the side wins; **buy** per side from the average equipment value at the end
of freeze time - the first round of each regulation half a pistol round
(none in overtime), then under $1,500 an eco, under $4,000 a force buy,
anything more a full buy.

### Summary versions

The tab reads summaries of version 1 and version 2 (`"version"` in the
file) side by side, and treats them alike:

| | Version 2 | Version 1 |
|---|---|---|
| plant time | seconds into the round, as the kills | match seconds; the tab subtracts the round's start |
| plant site | `A` or `B`; empty when the demo does not say | `A`, `B`, or an entity number - read as an unknown site |
| half length | `halfLength`, from where the sides first swap; 12 when it is null | 12 (MR12) |
| pistol rounds | `pistolRounds` (round 1 and the first round after the half) | the rounds whose buy is `pistol` |
| drawn round | `winner` and `winnerTeam` empty | - |
| suicide | `suicide` on the kill, never a teamkill | told by attacker and victim being the same player |

A kill's `noscope` and `attackerBlind` (version 2) are not shown in the
Match tab, which also shows no place from the heatmap table, so a grenade
row's empty `place` there changes nothing here.

## The tab

The sidebar of the Match tab holds the heatmap's mode switch and session
picker at the top, then the match sections below, then the heatmap's
**Filters**, **Level** and **Camera** panels - the view is the heatmap of
whatever Parquet is loaded in the Heatmap tab.

### Matches

| Control | Does |
|---|---|
| **Load match files…** | picks `.json` files (several at once): the `.match.json` summaries |
| drop on the view | JSON files dropped on the view while the Match tab is open load the same way (other files are ignored) |
| **Clear** | removes every match |
| **All matches** (with two or more) | "N matches, M rounds": the statistics across all of them |
| a match row | "TeamA 13 vs TeamB 9", map · N rounds: opens that match |

A file is accepted when it is JSON with `"format": "heat3d-cs2-match"` and
arrays `rounds`, `players` and `teams`. Errors are listed under the buttons:
"<file>: not JSON", "<file>: not a CS2 match summary (heat3d-cs2-match)",
"<file>: rounds, players or teams missing". A match loaded again (same
`match` name) replaces the earlier one. Matches are sorted by map, then by
name. With exactly one match loaded it is opened; otherwise the selection
stays (all matches by default).

With nothing loaded the section explains: convert with `python -m heat3d_cs2
demos`, load the `.match.json` files here and the `.parquet` files in the
Heatmap tab.

### Match (one match open)

**The header:** both teams with their score, the map, the halves -
"halves 7-5, 6-6": rounds 1-12 and 13-24 (premier and competitive play MR12;
a summary's own half length when it states one, so 1-15 and 16-30 for MR15) -
then, when the match went to overtime, its score on its own: "overtime 4-2",
the rounds after both halves. A drawn round counts for neither team. And "N
rounds cut off in the demo" when the summary lists incomplete rounds.

**The round strip:** a cell per round, coloured by the side that won, with
its number and a mark for how it ended. A drawn round (no winner) is a
neutral grey cell marked `=`, never a side's colour; its tooltip says "Round
30: a draw - neither side won it".

| Mark | Ended by |
|---|---|
| B | bomb exploded |
| D | bomb defused |
| K | eliminated |
| T | time ran out |
| S | surrender |
| = | draw |
| ? | other |

A divider marks the start of the second half (round 13, or the round after
the summary's half length) and of each three-round overtime half (rounds 25,
28, 31, …). Hover a cell: "Round 7: TeamA (T) - bomb exploded, planted A"
("…, planted, site unknown" when the summary has no site) and both sides'
buy and equipment value. Click to open the round; click again to close it ("Click a round for
its kills, economy and replay.").

**The round:**

- "Round 7: <team> won - <how>" ("Round 30: a draw - neither side won it"
  for a draw) and how long the round lasted (freeze end to decided, m:ss);
- the economy: each side's team, buy (pistol, eco, force buy, full buy) and
  equipment value ("$4,350");
- the plant: site, player and time into the round (from either summary
  version); "Planted by <player> at 1:05, site unknown" when the site is not
  known;
- **the kill feed**, in order: time into the round, attacker (in the side's
  colour; "world" for no attacker), weapon, and flags - **HS** headshot,
  **WB** through a wall, **SM** through smoke; **open** the round's first kill,
  **trade** (avenged a teammate within 5 s), **traded** (the killer was killed
  within 5 s), **team** a teamkill (a suicide is none). Kills after the round
  was decided are dimmed;
- the clutches: "<player> (T) alone against 3: won the clutch" / "lost it";
- who was alive at the end, per side ("nobody");
- **Show round**: everything in this round, in the heatmap;
- **Replay round**: plays the round back as boxes, from its start (below).

**Show in the heatmap** buttons (see [below](#show-in-the-heatmap)) for this
match, or for the open round.

### Scoreboard

A table per team, a row per player:

| Column | Is |
|---|---|
| K, D | kills, deaths |
| A | assists, flash assists included |
| ± | kills minus deaths (green above 0, red below) |
| ADR | damage per round, health actually lost |
| KAST | % of rounds with a kill, assist, survival or a traded death |
| HS | % headshot kills |
| Open | opening duels won-lost |
| Cl | clutches won/played |

Hover a player: trade kills, times traded, flash assists, enemies flashed,
utility damage, and multi-kill rounds ("2×3k"). **Click a player** for their
kills and deaths in the heatmap (this match).

### Across matches (All matches)

Over every loaded match:

- "N matches · M rounds · <maps>", and "N rounds drawn, won by neither side"
  when there were draws;
- **Rounds won** per side: overall, on **pistol** rounds (the summary's
  pistol rounds), and on **eco**, **force** and **full** buys (each as a
  percentage with the rounds played; hover for "won of played"). A drawn
  round is played by both sides and won by neither;
- **Bomb**: plants per site, and how often the T side went on to win those
  rounds ("12 plants on A (T won 67%)"), plants whose site the summary does
  not know on their own ("2 plants on an unknown site (T won 50%)"), or
  "never planted"; how rounds ended, most common first;
- "The side that took the opening kill won N% of those rounds." (a suicide is
  no opening kill; a drawn round converts no opening);
- **Opening duels, where**: the ten places with the most opening kills (by
  where the victim was; the game's place names made readable, "TopofMid" →
  "Top of Mid"), duels and the share the T side won;
- **Players**: the fifteen best by kills minus deaths, combined over all
  their matches (matched by Steam ID): matches, K-D, ADR and KAST weighted by
  rounds played, HS% weighted by kills, opening duels. **Click a player** for
  their kills and deaths across all matches in the heatmap.

The Show-in-the-heatmap buttons for all loaded matches sit under it.

## Show in the heatmap

Every link sets the heatmap's own **filters**, so what is shown stays
visible and editable in the Filters panel, and **Show all** clears them.
They work on the heatmap table loaded in the Heatmap tab; the match tab
never loads it itself.

| Button | Events shown |
|---|---|
| **Positions** | `position` - where players were, eight times a second |
| **Kills** | `kill` - where the killer stood |
| **Deaths** | `death` - where the victim fell |
| **Openings** | `kill` and `death` with `opening` = 1 - the first kill of each round, where both stood (only offered when the table has an `opening` column) |
| **Smokes** | `smoke` - where smokes landed |
| **Flashes** | `flash` - where flashes popped |
| **Molotovs** | `molotov` - where molotovs and incendiaries burned |
| **HE** | `he` - where HE grenades went off |
| **Plants** | `plant` - where the bomb was planted |
| **Shots** | `shot` - where shots were fired from |

Scoped by where the buttons are: all loaded matches, this match, or this
round ("Show in the heatmap - round 7").

How a focus becomes filters (`focusFilters`):

- **match** → a category filter on the `match` column;
- **round** → a range filter `round` = N on a numeric `round` column (a
  category filter on a categorical one), and the round's session
  (`<match> #NN`) is selected in the session picker;
- **events** → a category filter on the `event` column;
- **player** → a person filter on that player;
- **side** → a group filter.

What cannot be applied is said under the buttons, not silently filtered to
nothing: "no match column retained - match not applied", "match: X not in
the loaded data", the same for round and events, "player X not in the loaded
data", "side X not in the loaded data", "no heatmap data loaded: load the
matches' .parquet files in the Heatmap tab". Without data loaded the links
also say "Load the matches' .parquet files in the Heatmap tab to see them on
the map."

**Replay round** additionally switches the heatmap to **Box replay**, the
timeline to *play* mode with its window set to *lifetime*, seeks to the
start of the round's session and plays. When the round is not a session of
the loaded data: "this round is not a session of the loaded data: nothing to
replay".
