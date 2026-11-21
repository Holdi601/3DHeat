---
title: Outcome analysis
nav_order: 8
---

# Outcome analysis: what goes with winning

The **Outcome** tab of the [mass analysis](mass-analysis.md) looks at many matches of one map and asks, for each side: when the side did this, did it win more often than when it did not? "This" is a position held, a route taken, a fight, a decision. The answers come as plain sentences with their numbers, and as zones and routes drawn in the 3D view in colour.

A made-up example of a finding:

> On *Harbour · Domination*, the side **B** that holds the middle, on the left at 1:00–2:00 wins 64% (CI 58–70%, 412 matches) against 49% otherwise (390); same direction in 5 of 5 periods, and for 9 of 11 regular players.

**It shows correlation, not proof.** A pattern that goes with winning may cause wins, may be something winning teams do anyway, or may follow from already winning. The tab checks for the most common of these (see [What it allows for](#what-it-allows-for)), but it cannot rule them all out. Read a finding as "worth a look in the replays", not as a rule.

## Try it

1. Open the matches in the **Mass analysis** (see [Mass analysis](mass-analysis.md#try-it)). They need an outcome: a `won` or winner column ([outcome columns](data-formats.md#outcome-columns)).
2. Open the **Outcome** tab and press **Find what wins**. The work runs in the background; **Cancel** stops it.
3. Pick a **Map** and a **Side**. The view shows the map's zones and the side's opening routes in colour:
   - **teal** (with a **+** in the zone): the side won more often when it was there;
   - **orange** (with a **−**): it won less often;
   - **grey**: no difference. Faint zones rest on few rounds.
4. **By window** colours the zones for one part of the round (for example 1:00–2:00). **At a moment** gives a time slider: what the winners held at that moment.
5. Read the **Patterns** list. Each pattern has:
   - **Show**: draws it and puts the camera on it.
   - **Won vs lost**: loads up to 60 matches with the pattern and shows the side's winners against its losers as the difference split, the whole matches at once: by the rows' own outcome column where the loaded rows have one, else match by match (a match counts as won where the side won most of its rounds with the pattern).
   - **Examples**: loads one match and jumps to the moment.
   - **To document**: sends the pattern, with a chart of the two win rates, to the open [analysis document](notes-and-analyses.md).
   - **Chart sign**: loads the matches, puts a volume on the pattern's place and a [chart sign](volume-charts.md) of won against lost beside it.

The Ctrl+K palette has **Outcome analysis: what wins** and **Outcome analysis: run**.

Summaries made before the outcome analysis existed lack each side's moves. Tick **Work out missing moves** to read those matches' tables once (slow, cached afterwards), or rebuild the folder's index with `node tools/3dheat-summarize.mjs <folder> --moves`. While it works, a bar shows how many matches are done; afterwards a line says how many were worked out, how many failed, and how many could not be read because their files are not open (an index opened without its matches' folder).

## How many matches it needs

The table under the run's summary lists every map of the matches picked, with its matches, its rounds, a bar of the rounds against the minimum, and what became of it:

| Status | Means |
|---|---|
| tested | 50 rounds or more: every pattern tested as below |
| under the minimum: read as leads | 8 to 49 rounds: read as exploratory leads (below), when **Read small maps as leads** is ticked |
| too few rounds | under 8 rounds: nothing is read |
| no moves | the summaries lack the moves: tick **Work out missing moves** |
| read, but its sides could not be told apart | too few starts or lives to tell the sides or their spawns apart |

Fifty rounds is only the floor. Each pattern then needs 20 of a side's rounds with it and 20 without, and to pass the false discovery rate over a run's many patterns a difference of 15 points needs a few hundred rounds of the side. Under the picked map's sides, a line says how many rounds each side played and won, how many patterns were tested, and how many were not because one arm had too few rounds or the pattern was nearly always or never there.

**A map is** sets which matches count as one map: map, mode and mission (the default); map and mode; or the map alone. Pooling the missions or modes gives a map more rounds, but its layouts and objectives differ between them, which the patterns do not allow for.

### Leads on maps under the minimum

A map with 8 to 49 rounds is read anyway, apart from the tested ones (its tests do not count in the run's false discovery rate), and its patterns are listed as **Leads**, marked **exploratory**:

- each arm needs only 4 rounds, and only a difference of 15 points or more is listed, at most six a side;
- nothing is held to the false discovery rate: the q stays beside each lead, and is usually near 1;
- a lead says both arms' plain counts with their 95% Wilson intervals ("won 6 of 8 matches (75%, CI 41–93%) against 2 of 9 otherwise"), and how many of the side's rounds would tell a difference that size from chance: 80% power at a two-sided 0.5% level (about what the false discovery rate asks of one pattern among many), with the rates kept within 10–90%, and never fewer than give each arm its 20 rounds;
- leads are ranked by their plain p, the least likely to be chance first.

With a handful of rounds, large differences come up by chance all the time. A lead is something to look at in the replays, not a finding.

## What it looks at

Everything is per **map** (map, mode and mission together), per **side**, per **round** (a match counts as one round where the game has no rounds). A "side" is the data's team, or, when a team name does not keep to one end of the map, the end it starts from (**A** and **B**).

| Pattern | Means |
|---|---|
| Holds a zone in a window | a fifth or more of the side's players spent two samples or more in the zone in that part of the round. Zones are squares about a twelfth of the map wide. The side's own spawn zones are left out: everyone is there. Windows are [0, b), [b, 2b), [2b, 4b), [4b, 8b), with b about an eighth of the map's usual round length (rounded to 5 s, 10 s, ..., 1 min). |
| Opens along a route | a quarter or more of the side's first lives took the route in their first two windows. Routes are found per map and side by clustering the lives' early paths (eight points each, the mean distance between them). A route away from the two main ones, used by under a fifth of the lives, is called a flank route. |
| First blood, and where | the side made the round's first kill (in a zone). |
| Meets the enemy early | the round's first loss came earlier than on the map's median round. |
| Wins a fight in a zone | more of the other side's losses than its own in a zone in the first two windows (two or more losses there). A fight won later is how a round ends, not a choice: on real data those only restated the result. |
| Keeps together | the side's players stood closer to their centre than on the median round (first two windows). |
| Pushes out fast | the side's centre was further from its spawn than on the median round (first two windows). |
| Falls back | the side's centre moved back towards its spawn by a zone and a half after its furthest push, before the middle of the round. |
| Objectives | the round's first objective taken; the side's first one sooner than its median; which objective it took first. From the converter's objectives table where it has one (War Thunder's capture zones). Not on a map with a single objective: taking it is how the round is won. |
| What it fields | a vehicle class in its opening line-up (lives of the first window), or more of it than the other side. Later lives are left out: how many a side spawns says how often it died. |
| The buy | where the data has buys (CS2): the side's mean buy is a full one, and better than the other side's by half a step (eco 0, force 1, full 2). |

## How a pattern is judged

For each pattern the side-rounds split into two arms, with and without it:

- **Win rate of each arm** with its 95% Wilson interval, and the difference with Newcombe's interval.
- **Minimum sample**: each arm needs 20 side-rounds, and a pattern present in under 5% or over 95% of the rounds is not tested.
- **The test**: Cochran-Mantel-Haenszel within strata (below), continuity corrected.
- **Many tests**: every pattern of every map and side tested in one run counts. The false discovery rate is held at 5% with Benjamini-Hochberg. Some patterns overlap (neighbouring zones), and the method is valid for that kind of positive dependence.
- **Size**: a difference under 5 percentage points is not said, and neither is one whose allowed-for difference (below) is under 5 points or points the other way: the plain difference was the team's, the players' or the score's.
- **Consistency**: the matches are cut into five periods by date. A finding says in how many periods the difference points the same way, and for how many regular players (ten side-rounds or more on that side of that map). A finding whose direction flips in more than 40% of the periods is marked **unstable** and ranked low.

The list is ranked by the allowed-for difference, times its consistency, halved for the marks below.

### What it allows for

- **Side**: every test is within one side of one map, so a side that wins more anyway (a better spawn, an easier objective) does not make its zones look good.
- **Player strength**: each side-round's players' win rate in the run's *other* matches (shrunk towards 50% by ten games), in thirds. A pattern that mostly goes away once this is allowed for is marked **stronger players**: strong players do it, but it may not be what wins.
- **The score at the time**: the kill lead (and objectives held) when the pattern's window starts: behind, level or ahead. A pattern that shows mostly when the side was already ahead (15 points or more above the other arm), and whose difference mostly goes away (under 60%) once the score is allowed for, is marked **likely a consequence**. Holding the enemy's half late in a round is often the result of winning, not the cause.

The **allowed-for difference** is the Mantel-Haenszel risk difference over these strata. It is in each pattern's detail line beside the plain difference.

## Limits

- **Correlation, not proof.** Teams choose what they do. A pattern can stand in for something the data does not show: communication, skill not caught by the win rate, the enemy's line-up.
- **Who the players are.** Strength comes from player ids. Where ids are missing, or are the same placeholder for many players (bots), strength is not allowed for, or only roughly.
- **Rounds of one match are not independent.** In round games the same two teams play many rounds. The periods and regular-player checks are the guard here; intervals assume independent rounds and are somewhat too narrow.
- **One map at a time.** A map needs about 50 side-rounds before it is read at all, and far more for zone patterns. Rare maps say nothing.
- **Sampling.** Positions are kept every 2 to 60 seconds (finer for short rounds), so a brief visit to a zone may be missed. Zones are squares, not the map's own areas. Callout or objective names are used where the data has them.
- **Late in a round, being somewhere means being alive.** A zone held in the last windows partly measures that the side still had players; the score at the window's start allows for some of it, not all.
- **Mechanics.** In some modes, holding objectives *is* how a match is won (tickets bleed). Holding more of them late says little; which one a side takes first, and how soon, is the tactical part.

## For developers

- `src/outcome/collect.ts`: the moves of one match, fed by the summary builder (`src/mass/summarize.ts`), kept in the summary grid as `mv` (`src/outcome/types.ts`, `MOVES_VERSION`). A point every `dt` seconds (the rounds' median length over 40, a nice step) per life, coordinates in `q` world units, deaths, the objectives' captures (from the container's `objectives` member) and named places. About 10–30 KB a match.
- `src/outcome/features.ts`: one map's matches as side-rounds with their features; sides by name or by spawn (2-means of the start points); zones, windows, routes (leader clustering, then mean paths).
- `src/outcome/analyze.ts`: the tests, strata, FDR, consistency, the marks, the findings. `src/outcome/narrate.ts`: the sentences (`src/i18n/locales/*/outcome.json`). `src/outcome/view.ts`: zone and route win-rate maps and their lines, with the diverging palette.
- The mass worker (`src/mass/massWorker.ts`) runs it: `outcome` (progress, `outcomeCancel`), `outcomeMap`. An index can be opened alone (its matches' files not picked): everything but loading a match works.
- `tools/3dheat-summarize.mjs --moves` works out summaries that lack the moves; `--index-dir DIR` writes the index elsewhere.
- Checks: `src/outcome/outcome.test.ts` plants a winning route and a winning zone in made-up matches (both must be found), checks that a fair coin gives a finding in at most 3 of 20 runs (the FDR), that a pattern only shown when ahead is marked a consequence, and the stratified test. `node tools/smoke-outcome.mjs <url>` runs the tab in a browser on a made-up index and measures frame intervals while it runs; `OUTCOME_SET=<folder>` runs it on a real index kept locally.
