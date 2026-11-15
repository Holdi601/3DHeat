---
title: Maneuvers
parent: Insights
nav_order: 4
---

# Maneuvers: how groups move

**Insights → Maneuvers** follows how the units of each side move *as groups*
and names the maneuvers they make - a flank, a pincer, a breakthrough, an
ambush, a withdrawal, a missile defence, crossing the T - each with how sure
it is, the numbers behind it, whether it paid off, and its parallels in
doctrine and history. **Mass analysis → Maneuvers** counts them over
thousands of matches: how often each is made per map, mode and side, and how
often it pays.

Everything is worked out in your browser, in its own worker
(`src/insights/maneuver`); a match of a few hundred units takes 10-500 ms,
a two-hour air war with thousands of objects about a second.

## Using it

- Open **Insights**, tab **Maneuvers**. It counts when first opened; **Find
  again** after changing filters.
- **Sure / Likely / Possible** sets the confidence listed (Likely by default).
- The **timeline** has a lane per side and a bar per maneuver; the **list**
  below it the same, by time. A click switches to the replay at its start,
  flies the camera there and draws it in 3D: each group's way as an arrow (a
  pincer's two arms are its arcs), the groups' outlines at the key moment
  (the enemy's in its side's colour), the enemy's front as a white line.
  **Draw all in 3D** adds the match's other maneuvers, faint.
- An opened maneuver shows its outcome (kills and losses of the units that
  made it, while it ran and just after, against the side's own exchange over
  the match), its evidence, and the knowledge base's entries for it - the
  doctrine and the historical parallels (Cannae for a pincer, Sedan 1940 for
  a breakthrough, Tsushima for crossing the T, Operation Bolo for a feint...).
- The small table at the end: per kind and side, made and paid off.

![A pincer on the synthetic demo match: both arms' arrows, the enemy body and its front](assets/img/en/maneuvers.webp)

## How groups are found

Every unit is placed on a common timeline (a step of 1 s on foot, 2 s
otherwise, longer for very large files), held still over a death so a
respawn draws no line across the map. At every step the units of a side and
a kind (aircraft, vehicles, ships, infantry) are linked when they are close
- 18 m on foot, 170 m for vehicles, 3 km for ships, 5 km for aircraft - and
moving alike (velocities within half the faster one's speed, or both
standing). A cluster keeps the id of the group most of its members were in.
A unit with no class is put on foot, in a vehicle or in the air by its speed.

A group's **shape** is read against its heading: a column or a line by its
spreads along and across, a wedge where the middle leads, an echelon where
the members step back to one side, a box where they hold the corners.

Everything is judged at the match's own scale: the **engagement range** `R`
is the 75th percentile of the distance between a killer and its victim
(clamped to the domain's sense), and a maneuver's times scale with the kind
of unit (infantry a third of the ground's).

## What it finds

| Maneuver | Found when |
|---|---|
| Formation | a group keeps one shape on 60% of its moving steps for 30 s |
| Frontal assault | a group closes from out of range to contact, ¾ R or more, from within 35° of the way the enemy faces |
| Flank attack | the same from 50-130° (the rear beyond); sure only with a friendly *fixing force* engaged in front of the enemy |
| Pincer | two flank attacks of one side on the same enemy body, from opposite sides (100° or more apart), within 90 s |
| Encirclement | a compact enemy group with at least as many of the other side round it within 1.5 R, from two or more groups, no gap over 100°, for 45 s |
| Penetration | a group passes standing enemies on both its left and right (a line), ¾ R or more on; a breakthrough a further R beyond |
| Bounding overwatch | in a small group, part moves while the rest stands, the roles swapping four times or more, with covering fire from the standing part |
| Concentration / dispersion | a side's share near its densest point rises from 35% to 60% (units coming 1.5 R or more, then contact) - or falls with the side spreading out |
| Feint | a small element in contact draws two or more enemies from elsewhere; a bigger group then strikes four ranges away where the enemy has fewer |
| Withdrawal / pursuit | a group in contact turns away and opens R from where it fought; enemies moving the same way and keeping up pursue |
| Defence in depth | standing units in two or more belts across the enemy's axis, R deep, the enemy coming on, fire from the belts |
| Reverse slope | three or more kills at short range by standing units of victims that came over a crest |
| Ambush | a moving group meets enemies that stood 45 s; they shoot first and the movers lose two or half the group |
| Screen | one or two units moving ahead of a body of three or more, meeting the enemy first |
| Interior lines | a side's groups close together between the other's, its units shifting between them |
| Tempo | a side answering contact (turn, change of speed, first shot) 1.5 times quicker, Mann-Whitney p under 0.05 |
| Crank, notch, drag, pump | the target of a missile launch turns the shooter to 35-70°, 75-105°, past 140°, or drags and turns back |
| Air pincer, wall, lead-trail, grinder | a pair splitting onto one enemy; three abreast at the enemy; an element 5-20 km behind another; two orbiting one point apart |
| Combat air patrol | orbits round a station for three minutes |
| Energy / angles fight | in a close fight, height used and climbing, or flat and turning hard while slowing |
| Strike package, SEAD | an air group of mixed roles, some of which hit the ground; air-defence kills before most other ground kills |
| Line of battle, crossing the T | three ships in column; a column square across the head of an enemy column |

Each maneuver says which knowledge-base **patterns** it shows
(`patterns-maneuver.ts`: formation, frontal assault, double envelopment,
encirclement, penetration, fire and maneuver, feint, withdrawal, pursuit,
defence in depth, screening, dispersion, missile defence, angles fight,
combat air patrol, strike package, line of battle, crossing the T) and the
entries to read first; older entries carry the new patterns through
`knowledge/maneuver-tags.ts`. See [The knowledge lens](knowledge.md).

**Paid off** compares the units' exchange while it ran (and a minute after)
with their side's over the match; a withdrawal pays when it lost fewer units
after turning than before, a missile defence when the aircraft lives a
minute, an encirclement when the pocket loses half.

## Over many matches

Each match's summary (`src/mass/summarize.ts`, see [Mass analysis](mass-analysis.md))
carries a small `maneuvers` section: per kind and side, made (at Likely or
above), paid off, not paid, kills and losses. **Mass analysis → Maneuvers**
adds them up over the matches the filter keeps - per map and mode, or over
all - with the paid-off rate's Wilson interval; a row loads the matches it
was made in. Summaries written before the section existed have none: run
`node tools/3dheat-summarize.mjs <folder> --force` to add it.

## How sure it is

Synthetic matches with planted maneuvers (`synth.ts`, run by
`maneuver.test.ts`): all 28 planted kinds are found at Likely or above; of
52 maneuvers reported, 31 are the planted kind and the other 21 are really
there too (the moving group's formation, the frontal approach of the
penetrating column); none is wrong. On 30 null matches - random walks apart
and mixed, units standing at random, aircraft on straight legs, a crowd
milling about - nothing is reported at Likely or above.

On real data (dozens of ground battles, a few long air-war missions, a dozen
shooter matches): frontal assaults, flanks, penetrations and encirclements
in the tank battles, formations and close fights in the air, missile
defences, CAP orbits and lead-trail pairs in the air-war missions, frontal
executes, columns and a few ambushes and bounding pairs in the shooter. The
thresholds are doctrine's shapes at game scale; read a single find with its
evidence, and the mass table's rates with their intervals.

## Limits

- Groups need positions over time; a file of events only has none.
- Facing is not read from the data: the enemy's front is where the fixing
  force engages it, else where it moves, else where the attacker came from.
- Terrain is read from the units' own heights (the reverse slope); there is
  no line-of-sight test.
- Very large files are sampled at longer steps; short air maneuvers in them
  are still read from 2-4 s steps.
