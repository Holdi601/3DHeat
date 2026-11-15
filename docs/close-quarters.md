---
title: Close quarters and rounds
parent: Insights
nav_order: 2
---

# Close quarters and rounds

For round-based shooters (Counter-Strike first, any data with rounds, sides and kills), Insights measures how the fights were won: who took the opening duels and what they were worth, whether deaths were traded, whether the player peeking into an angle beat the one holding it, whether crossfires and flashes paid, how the round odds moved with every kill, and which doorways killed the players entering them. Use it to see why rounds were won, not only who got the kills.

The measures come from room-clearing and urban doctrine (the fatal funnel, points of domination, crossfire) and from esports and sports analytics (win probability, value of actions, adjusted plus-minus). Each is read through the [knowledge lens](knowledge.md) and cited.

## Try it

1. Load one or more matches with rounds (a CS2 conversion has everything it needs).
2. Open **Insights** and press **Find insights**.
3. Under **Lens metrics**, read the lines from *Round win probability* to *Player impact*; each has its numbers, its 95% interval, its q value and the sources it follows.
4. Pick the **Esports** or **Urban** lens to read them through that literature; **Write with AI** sends them with the report.

## What it measures

| Measure | What it says | How |
|---|---|---|
| Round win probability | How likely each side was to win the round at every moment | Logistic regression on the players alive on each side, the bomb or objective and its time, the round clock and the buy, fitted to the data loaded; calibration checked out of fold by round (Brier score and skill, log loss, calibration error over ten bins, recalibration slope, AUC) |
| Value of actions | How much a kill, an opening kill, a trade, a kill behind a flash, a plant or a flash changed the side's chance to win | Win probability after minus before; trades, opening and flashed kills tested against the other kills by permutation |
| Opening duels | Which side wins the first duel, how often that wins the round, and where one side wins openings far above its own average | Wilson intervals; places by exact binomial test against the side's share, q over places |
| Trades | Deaths answered by a teammate's kill of the killer within 5 s, the time it took, and rounds won when the first death was traded | Fisher's exact test, Newcombe's interval |
| Peeker against holder | Duels where one player moved into the fight (1.5 m/s or more over the last second) and the other held still (0.75 m/s or less): the peeker's share | Exact binomial test against one half |
| Aim before the duel | Each player's view against the bearing to the other 0.75 s before the kill; who was better aimed and how often that player won; holders on their angle (within 15°) against off it; kill ranges | Exact binomial test; Fisher |
| Crossfire | Holders with a still teammate within 25 m of the peeker whose line onto it is 35° or more off their own, against holders alone | Fisher, Newcombe |
| Utility into entries | Peekers behind a flash of their own side (within 3 s and 15 m) or a smoke (within 18 s) against dry peeks; opening duels with a flash on one side only; victims blinded | Fisher, binomial |
| Man advantage | For every state of players alive (5v4, 4v5, 2v1...) first reached in a round, the share of rounds won from it | Wilson intervals |
| Clutches | Rounds where a side came down to its last player: wins against the model's expected wins, by number of opponents | Normal test of observed against expected |
| Stacks, rotations, lurks | The largest group within 10 m at the opening duel (3 or more: stacked); players over 30 m from the first fight or the planted objective and how fast they come within 12 m; time and kill-to-death odds more than 30 m from every teammate | Fisher; odds ratio with Woolf's interval |
| Post-plant and retake | Rounds won by the planting side, by the numbers at the plant, and its share of duels after the plant | Wilson intervals |
| Fatal funnels | Entries into each place (a change of the place column, else of an 8 m cell) and deaths within 2.5 s of entering, against the map's rate | Exact binomial test, q over places; ratio shrunk with 20 entries at the map's rate |
| Player impact | Win probability added per round by each player (kills, deaths, plants), shrunk by empirical Bayes; ridge adjusted plus-minus of round results against the model's start; kill value by place and weapon, shrunk | Penalty chosen by five-fold cross-validation |

All the tests of one analysis share one false discovery rate (Benjamini-Hochberg); the q shown is over all of them. The model and its calibration are fitted to the data loaded, so they describe that population: a professional model misjudges casual play and the other way round.

Checked on synthetic rounds with planted effects (a peeker's advantage, crossfires, flashes, one fatal funnel, better aim winning) and on the same rounds without them, where none should be found (`src/insights/cqb/cqb.test.ts`); on about a thousand real rounds the model scored a Brier score of 0.14 against 0.25 for the base rate, a calibration error of 0.03 and a recalibration slope of 1.0.

## Data it needs

- **time**, **player**, **side** and **round** (the session) columns, and kills and deaths in the event column; rounds where nobody dies twice are treated as elimination rounds (man advantage, clutches and the model need them);
- an **other party** column (`other`, `victim`, `killer`, `attacker`) naming the victim on a kill and the killer on a death (without it, kills and deaths at the same moment are paired);
- a **look direction** for the aim measures;
- a raw `event` column naming `flash`, `smoke`, `he`, `molotov`, `plant` and `defuse` for utility and plants;
- `won` (the row's side won the round), `place` (callouts), `weapon`, `buy` and `state_flashed` where the data has them.

Positions should be sampled several times a second; speeds, aim and crossfires read the last two seconds before each death.

## Many matches

Every match summary of the [many-match analysis](mass-analysis.md) of data with a round column carries the same measures as counts (`cqb` in the summary): opening duels, trades, peeks, crossfires, flashed entries, aim, man advantage, plants and the 40 most entered places with their entries and deaths. Counts add up over matches, so a thousand matches give the same shares as one large analysis.

## For developers

`src/insights/cqb/`: `walk.ts` (one pass over rows in time order, rounds kept apart, duels recorded with their state), `finish.ts` (the metrics and the per-match counts), `model.ts` (logistic regression by IRLS, calibration, ridge by conjugate gradients, empirical Bayes, Fisher, Newcombe, permutation tests), `run.ts` and `worker.ts` (the viewer: its own worker, beside the insight pass), `summary.ts` (the many-match summary's collector), `shows.ts` (what the lens reads), `synth.ts` (the test rounds). The knowledge entries are in `src/insights/knowledge/cqb.ts`, the patterns in `patterns-cqb.ts`. The results go into the report as `lens.cqb`.
