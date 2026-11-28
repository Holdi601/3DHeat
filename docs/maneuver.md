---
title: Maneuvers
parent: Insights
nav_order: 4
---

# Maneuvers: how groups move

**Insights → Maneuvers** follows how the units of each side move *as groups*
and names the maneuvers they make - a flank, a pincer, a breakthrough, an
ambush, a withdrawal, a missile defence, crossing the T - each with how sure
it is, what happened, whether it worked, and its parallels in doctrine and
history. **Mass analysis → Maneuvers** counts them over
thousands of matches: how often each is made per map, mode and side, and how
often it works.

Everything is worked out in your browser, in its own worker
(`src/insights/maneuver`); a match of a few hundred units takes 10-500 ms,
a two-hour air war with thousands of objects about a second.

## Using it

- Open **Insights**, tab **Maneuvers**. It counts when first opened; **Find
  again** after changing filters.
- **Sure / Likely / Possible** sets the confidence listed (Likely by default).
- The **timeline** has a lane per side and a bar per maneuver; the **list**
  below it the same, each with who made it (a unit by its name and vehicle,
  a group by its side and size). A click switches to the replay, paused at
  its start, fits the camera to the ways of the units that made it over its
  time (with the enemy's and the missile's where they come near; a shooter
  far off is named, not fitted) and draws it in 3D: each unit's way as an
  arrow in that unit's own colour, a group's in its team's, each labelled
  with whose it is (a pincer's two arms are its arcs), the groups' outlines
  at the key moment (the enemy's in its side's colour), the enemy's front
  as a white line.
  **Draw all in 3D** adds the match's other maneuvers, faint. The lines go
  to the graphics card once, when the pick changes, not every frame: with
  480 maneuvers drawn during playback the frame times on a real GPU (WebGL2
  and WebGPU, p99 18.0-18.5 ms, max 19.5-20.8 ms) match those without.
- An opened maneuver says in plain words what the kind is, what happened,
  and whether it worked - "Worked: from 0:24 to 2:02 they took out 5 and
  lost 3", "Didn't work: shot down 37 s later" - with the time the kills and
  losses were counted over, and, folded away, the knowledge base's entries
  for it: the doctrine and the historical parallels (Cannae for a pincer,
  Sedan 1940 for a breakthrough, Tsushima for crossing the T, Operation
  Bolo for a feint...).
- The small table at the end: per kind and side, made and how many worked.

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
| Flank attack | the same from 50-130° (the rear beyond); sure only with a friendly *fixing force* that is fighting the enemy there (kills either way) |
| Pincer | two flank attacks of one side on the same enemy body, from opposite sides (100° or more apart), within 90 s; sure when the arms fight it |
| Encirclement | a compact enemy group with at least as many of the other side round it within 1.5 R, from two or more groups, no gap over 100°, for a minute, cut off from its own side; sure when the ring closed in by ½ R and fought the pocket |
| Penetration | a group passes a held line (enemies standing 30 s on both its left and right, their side's centre beyond them); sure when it gets ½ R beyond, stays 20 s, and fights there; a breakthrough a further R beyond |
| Bounding overwatch | in a small group, part moves while the rest stands, the roles swapping four times or more, with covering fire from the standing part |
| Concentration / dispersion | a side's share near its densest point rises from 35% to 60% (units coming 1.5 R or more, then contact) - or falls with the side spreading out |
| Feint | a small element in contact draws two or more enemies from elsewhere; a bigger group then strikes four ranges away where the enemy has fewer |
| Withdrawal / pursuit | a group in contact turns away and opens R from where it fought; sure when an enemy there had just killed one of it and the group got 2 R from that killer (never on foot: see below); enemies moving the same way and keeping up pursue |
| Defence in depth | standing units in two or more belts across the enemy's axis, R deep, the enemy coming on, fire from the belts |
| Reverse slope | three or more kills at short range by standing units of victims that came over a crest |
| Ambush | a moving group meets enemies that stood 45 s; they shoot first and the movers lose two or half the group |
| Screen | one or two units moving ahead of a body of three or more, meeting the enemy first |
| Interior lines | a side's groups close together between the other's, its units shifting between them |
| Tempo | a side answering contact (turn, change of speed, first shot) 1.5 times quicker, Mann-Whitney p under 0.05 |
| Crank, notch, drag, pump | an aircraft a missile flies at holds the shooter at 40-70° for 8 s, 75-105° for 6 s, past 140° for 8 s, or drags and turns back; on purpose only when held while the missile was in the air (below) |
| Air pincer, wall, lead-trail, grinder | a pair splitting onto one enemy; three abreast at the enemy; an element 5-20 km behind another; two orbiting one point apart |
| Combat air patrol | orbits round a station for three minutes |
| Energy / angles fight | in a close fight - headings 30° apart, each holding the other on its nose in turn, or a kill between them - height used and climbing, or flat and turning hard while slowing; sure when one killed the other |
| Strike package, SEAD | an air group of mixed roles, some of which hit the ground; air-defence kills before most other ground kills |
| Line of battle, crossing the T | three ships in column; a column square across the head of an enemy column |

Each maneuver says which knowledge-base **patterns** it shows
(`patterns-maneuver.ts`: formation, frontal assault, double envelopment,
encirclement, penetration, fire and maneuver, feint, withdrawal, pursuit,
defence in depth, screening, dispersion, missile defence, angles fight,
combat air patrol, strike package, line of battle, crossing the T) and the
entries to read first; older entries carry the new patterns through
`knowledge/maneuver-tags.ts`. See [The knowledge lens](knowledge.md).

**Worked** means the units that made it took out more than they lost while
it ran and a while after (the result names the time); even is neither. A
withdrawal works when it lost fewer units after turning than before, a
missile defence when the aircraft lives a minute, an encirclement when the
pocket loses half.

**Missile defence on purpose.** Where the data follows missiles in flight
(War Thunder, Tacview), a crank, notch, drag or pump is only looked for
against a missile seen flying *at* the aircraft - over the first 60% of its
flight it points within 20° of the aircraft and closes on it at half its own
speed or more; a missile fired at the ground is no threat to anyone in the
air. It is named as the manoeuvre ("Crank") only when the angle was held
for 3 s or more (half a short flight) while that missile was in the air.
Held only before or after the missile, or where the data has launches but
no missiles in flight, it is told as what was seen - "Flew at an angle to
the shooter", "Flew away from the shooter" - never above Likely, and its
result says whether the aircraft got away, not whether the manoeuvre worked.

**Counting.** Losses are deaths, one a life: a game that writes a
destruction as several rows (War Thunder: a `death` row and a `dead` row
for each piece of the falling wreck) loses the unit once, and the wreck's
position rows until it is removed are not the unit moving (`data/deaths.ts`
gives the dead spans). A respawned unit's next death counts again.

## Over many matches

Each match's summary (`src/mass/summarize.ts`, see [Mass analysis](mass-analysis.md))
carries a small `maneuvers` section: per kind and side, made (at Likely or
above), worked, did not, kills and losses (a missile defence not shown to
be on purpose is counted, not judged). **Mass analysis → Maneuvers** adds
them up over the matches the filter keeps - per map and mode, or over all -
with the rate's Wilson interval; a row loads the matches it
was made in. Summaries written before the section existed have none: run
`node tools/3dheat-summarize.mjs <folder> --force` to add it.

## How sure it is

Synthetic matches with planted maneuvers (`synth.ts`, run by
`maneuver.test.ts`): all 28 planted kinds are found at Likely or above; of
50 maneuvers reported, 31 are the planted kind and the other 19 are really
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

### Against null models of the same matches

A detector can be fooled by the ground and the crowd: in a brawl every group
has enemies all round. So each kind is also run on **null models** built
from the same matches (`nulls.ts`), where the sides no longer meet as they
did: one side's timeline turned round by a third to two thirds of the match
(*shift*), or its tracks turned round the map's centre (*rotate*); and the
team labels shuffled (*teams*, which by construction keeps about half of
the real fights). Fights are counted only as kills paired with their deaths,
the killer within 2 R and the victim at the place - a null model breaks
those. Finds a match at Likely or above, real against the null models
(30 tank battles; 12 shooter matches):

| Kind | Tank battles: real / shift / rotate | Shooter: real / shift / rotate |
|---|---|---|
| Encirclement | 0 / 0 / 0 (was 1.3 / 1.2 / 0.8) | 0 / 0 / 0 |
| Penetration | 0.03 / 0.02 / 0.05 (was 1.6 / 1.8 / 1.4) | 0 / 0 / 0 |
| Flank | 0.33 / 0.07 / 0.10 | 1.0 / 0.08 / 0.21 |
| Frontal assault | 0.87 / 0.47 / 0.12 | 14.4 / 6.5 / 4.3 |
| Withdrawal | 0.03 / 0 / 0.02 | 0.08 / 0.08 / 0.5 (so never sure on foot) |
| Ambush | - | 0.17 / 0.04 / 0.04 |
| Energy fight | 1.2 / 0.1 / 0.85 | - |
| Angles fight | 0.6 / 0.07 / 0.3 | - |

Close air fights over a battlefield's centre survive a turn round that
centre, so the rotate column flatters them less than it does the ground
kinds. Kinds within one side - formation, combat air patrol, grinder,
strike package, SEAD, bounding, screen - do not depend on the other side
and are not tested this way. `maneuver.test.ts` checks that the null
models remove the planted flank, pincer, encirclement, penetration, ambush
and withdrawal from the synthetic matches.

## Limits

- Groups need positions over time; a file of events only has none.
- Facing is not read from the data: the enemy's front is where the fixing
  force engages it, else where it moves, else where the attacker came from.
- Terrain is read from the units' own heights (the reverse slope); there is
  no line-of-sight test.
- Very large files are sampled at longer steps; short air maneuvers in them
  are still read from 2-4 s steps.
