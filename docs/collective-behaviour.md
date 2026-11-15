---
title: Collective behaviour
parent: Insights
nav_order: 3
---

# Collective behaviour: crowds, flocks, herds and decisions under pressure

Players in a match behave like people anywhere: they bunch at doors, follow
whoever went first, keep together or straggle, fall back after heavy losses,
take more risk after a bad life. The **behaviour lens metrics** measure these
patterns with the methods of crowd science, collective-motion physics,
behavioural economics and military psychology, each against its own null model,
and read them through the matching entries of the
[knowledge base](knowledge.md).

## Try it

1. Load one or more matches with time, positions and teams.
2. Open **Insights** and run it.
3. Unfold **Lens metrics**: the behaviour measures are listed with the others
   (Collective alignment, Route herding, Lanes and trails, Crowding, Leaders and
   followers, Cohesion and stragglers, Breaking point, Risk after losses,
   Streaks, Buy agreement, Suppression), each with its numbers, its test and
   the literature that explains it.
4. The **Debrief** cites them; **Write with AI** sends them with the report.

## The measures

Tracks are resampled to one point every 2 s (the position at the end of the
bin and the velocity over it). Distances are scaled by the data's own typical
spacing - the median distance from a unit to its nearest teammate - so the
same measure works for infantry, tanks and aircraft.

| Measure | What it measures | Null model and test | Knowledge |
|---|---|---|---|
| Collective alignment | Polarisation (length of the mean unit heading) of each side's moving units every 2 s, milling (rotation about the centroid), shares of time polarised, milling and swarming, by match phase; in fights between two aligned sides, the more aligned side's kill share | Each unit's own track shifted in time within the match (keeps its path, breaks simultaneity); sign-flip test over 60 s windows | Vicsek 1995, Couzin 2002, Tunstrøm 2013 |
| Route herding | How often a unit leaves a place the way the teammate before it did (within 30 s), for the same way in, against the place's own exit shares - and against copying an enemy's earlier pass | Exits shuffled within place and entry; the effect is teammate minus enemy copying (Manski's reflection problem: copying and a plan the side shares look alike) | Banerjee 1992, Bikhchandani et al. 1992, Manski 1993 |
| Lanes and trails | Lateral segregation of the two directions in places with counter-flow; share of movement on the busiest 10% of the ground, its Gini, and the overlap of the matches' busiest ground | Directions shuffled between whole visits; two grids offset by half a place, each tested, Bonferroni | Helbing et al. 1997, 2005 |
| Crowding | Speed (relative to the unit's own pace) and flow by the number of neighbours within twice the typical spacing, the capacity drop at the densest class, on the busiest ground; deaths per hour in crowds; shots a minute by teammates nearby (social loafing) | Each unit's own speed-density correlation, sign-flip over units, minimum effect ρ beyond ±0.05; exact rate tests | Helbing et al. 2000, Seyfried et al. 2005, Latané et al. 1979 |
| Leaders and followers | For teammates travelling together, the time lag (up to 8 s) at which one's heading best predicts the other's; leader graph, transitivity of triads, leaders' death and kill rates | Pairs with one track shifted in time give the 95% threshold; binomial test against 5% | Nagy et al. 2010, Couzin et al. 2005 |
| Cohesion and stragglers | Time spent beyond three times the side's typical spacing from the nearest teammate; death rate there against with the group; a side's spacing against its share of a fight's kills | Exact conditional test of two Poisson rates | Shils and Janowitz 1948, Siebold 2007 |
| Breaking point | Approach speed towards the enemy (in the side's own pace) by the share of the side lost in the last minute; the lowest loss level at which sides withdraw | One-sided cluster bootstrap against a withdrawal of a tenth of the pace (losses come where sides meet, and sides that meet stop closing), Bonferroni over levels | Dupuy 1987, Rowland 2006 |
| Risk after losses | Share of the next life spent ahead of one's side towards the enemy, above the side's own share and other returning units at that time: after a life lost without a kill against after one with a kill; early death after early death (tilt) | Each unit's lives shuffled (first life kept), so the finite-sequence bias is in the null | Kahneman and Tversky 1979, Thaler and Johnson 1990 |
| Streaks | P(kill after k kills) − P(kill after k deaths), k = 1..3 | Each player's own sequence shuffled 1,000 times: the bias Miller and Sanjurjo showed is subtracted; Bonferroni over k | Gilovich et al. 1985, Miller and Sanjurjo 2018 |
| Buy agreement | Fleiss' κ of the loadout bands (eco, force, full; tertiles outside Counter-Strike) within a side's round | The side's player-rounds shuffled across its rounds | Fleiss 1971 |
| Suppression | Speed in the 4 s after non-lethal damage against the 4 s before, and shots in the 10 s after against before, at hits and at the same unit's calm moments | Sign-flip over units, minimum effects 0.05 of pace and one shot a minute | Rowland 2006 |

Every p-value of the report goes through the Benjamini-Hochberg false
discovery rate (`q`). A measure is left out when the data cannot carry it:
rounds and equipment values are needed for buy agreement, damage events for
suppression, kills and deaths credited to units for streaks and risk.

## In the mass analysis

Every match summary (`<match>.summary.json`, see
[Mass analysis](mass-analysis.md)) carries the same measures for that match in
its `behaviour` section, so thousands of matches can be compared without
reading their rows again.

## How well it works

On simulated battles with each effect built in, and the same worlds without
(`src/insights/behaviour/sim.ts`, `behaviour.test.ts`): every measure finds its
planted effect, and the null worlds stay below the false discovery threshold.
Risk after losses has the least power; route herding cannot tell copying from
a shared plan (a side that shares one goal is "herding" by this measure).

## For developers

- `src/insights/behaviour/acc.ts` - the accumulator (resampled tracks, events,
  rounds) and `finish`; `motion.ts` and `choice.ts` the measures;
  `bstats.ts` permutation, bootstrap and kappa helpers; `shows.ts` the
  patterns and sentences the lens reads (`lens.<measure>`).
- `feed.ts` feeds it from the insight worker's chunks; `summaryTap.ts` from a
  match summary as it streams the table.
- Knowledge: `src/insights/knowledge/behaviour.ts` (entries),
  `patterns-behaviour.ts`, `refs-behaviour.ts` (references, each checked
  against its Crossref or Open Library record).
- Labels: `lens.metric.<measure>` in `locales/*/lens.json`.
