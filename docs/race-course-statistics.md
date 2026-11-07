---
title: Course statistics
parent: Race analysis
nav_order: 57
---

# Course statistics

Load a course's whole folder - dozens of laps, several cars, several
performance classes - and every lap is judged, then counted: which mistakes
are made where, by how many of the laps, and what they cost. This page
covers the comparison by class, what counts as a mistake, the **Course
statistics** section, the mistake map, the heatmap export, courses from
several tracks, and the performance limits with many laps.

Code: [`src/race/stats.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/stats.ts),
[`src/ui/race/StatsSection.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/StatsSection.tsx),
`openMistakesInHeatmap` in [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts).

## Against the best of its own class

A lap is compared corner by corner with the **fastest complete lap of its
own performance class** (the reference, in the reference's class); that lap
itself with whoever of its class was quickest through each corner, or of
every lap when it is alone in its class. A C-class car's braking point
against an S2 car's says nothing about the driving. The time map, the gaps
in the lap list and the *Corner by corner* table follow the same comparison
(see [who each lap is compared with](race-corner-analysis.md#who-each-lap-is-compared-with)).

The statistics are built on the analysis of every lap, not beside it.

## What counts as a mistake

An **occurrence** is one lap's mistake in one corner (segment). A lap's
mistakes in a corner are:

1. **The driving cause** the analysis found for its loss there - a finding
   that is a loss, put down to the driver (not the car or the situation),
   costing **0.05 s** or more against its comparison lap. Its cost is the
   corner's loss.
2. **Every car-control fault** it made there that the other lap did not
   (unshared), costing **0.03 s** or more - lock, wheelspin, rear stepping
   out, push, spin. Its cost is the event's own.
3. **Every hit and crash**, shared or not, whatever it cost.

One corner can hold several; each kind is counted **once per lap and
corner**. Gains, the car's share and a slower arrival decided in the corner
before are not mistakes.

### From findings to mistakes

| Finding | Mistake |
|---|---|
| too fast in, slow out, from braking more than a few metres later than the other | Braked too late |
| braked early | Braked too early |
| braked gently | Braked too gently |
| a lock as the cause | Locked a wheel |
| coasted | Coasted |
| grip to spare, slower to the apex, braked where the other only lifted | Too slow through the middle |
| too tight a line | Too tight a line |
| pushed wide | Pushed wide |
| turned the car less / too far | Turned the car wrong |
| on the power later, full throttle later, hesitated | Late on the throttle |
| slower out of the corner | Slower out |
| wheelspin | Wheelspin |
| the rear stepped out, sideways through the middle | Rear stepped out |
| ran wide | Ran wide |
| scrubbed speed | Scrubbed speed |
| lifted (on the way in, or on the straight) | Lifted |
| a near-stop, spin, hit or crash as the cause | Spun / Hit something / Crashed when the lap's events there say which (crash first, then spin, then hit); otherwise Nearly stopped |
| a longer flight | Flew too far |

The two patterns are counted as the cause found inside them, by the same
table. *Gave more away going in than the exit won back* is the mistake of its
entry's cause: braking early is *Braked too early*, a lock *Locked a wheel*,
coasting *Coasted*, grip left unused *Too slow through the middle*. *Too fast
in, slow out* is *Braked too late* where the lap braked later than the other;
otherwise the mistake of its exit's cause - *Late on the throttle*,
*Wheelspin*, *Rear stepped out*, *Ran wide*, *Slower out*. A pattern whose
cause is the car's, or a slower arrival, is not counted.

Not counted: slower arrival, the start, every *car* finding (pull, grip,
brakes, drive) and every gain or level corner.

### The kinds, in their order

Braking: *Braked too late*, *Braked too early*, *Braked too gently*, *Locked
a wheel*. Entry: *Coasted*, *Too slow through the middle*, *Too tight a
line*, *Pushed wide*, *Turned the car wrong*. Exit: *Late on the throttle*,
*Slower out*, *Wheelspin*, *Rear stepped out*, *Ran wide*, *Scrubbed speed*.
Straight: *Lifted*. Incidents: *Spun*, *Hit something*, *Crashed*, *Nearly
stopped*, *Flew too far*.

## The Course statistics section

Shown from **3** laps on, between **Laps** and **Where to improve**.

- **The summary**: "40 laps in 9 cars, 3 classes: each judged corner by corner
  against the fastest lap of its own class." (cars counted by car number, or
  name).
- **Class chips** (with several classes): **All** and one chip per class,
  each with its lap count, in the game's order (D, C, B, A, S1, S2, R, X, then
  others). Click a class for its laps alone; **Shift+click** adds or removes
  one. Everything below - the lists, the map, the heatmap export - follows
  the classes picked.
- **What goes wrong most**: each kind of mistake, most laps first (then most
  times, then most cost), at most 8 (**All N kinds** shows the rest, **Fewer**
  hides them again). Each row: its name, "N of M laps", a bar of that share,
  and "K times · about X s · most in T3 (5), T7 (4), T1 (2)" - how often it
  was made (lap by corner), what it cost all told, and the three corners
  where most laps made it. **Click a row** to show it on the mistake map (and
  switch the map on); click again for every mistake.
- **Corner by corner** (or *Corner by corner - <mistake>* with one picked):
  per segment, "N of M lost time · X s" - laps that drove the whole corner,
  those that lost **0.05 s** or more there against their class's best, and
  all the time they lost. Folded, it lists its three most common mistakes
  with their lap counts. **Click a corner** to open it, frame it with the
  camera and switch to the mistake map: for each mistake (or only the one
  picked) a line such as "12 of 40 laps braked too early here. In 9 different
  cars - about 0.21 s each." and the laps that made it, **worst first**, each
  with its cost - at most 8, "+N more" for the rest. **Click a lap** to focus
  it and replay that mistake (lined up 40 m before it).
- **Show in the heatmap**: see below. "Building the heatmap…" while it runs;
  disabled when there are no mistakes.

## The mistake map

**View → Mistake map** paints along the reference path how many of the laps
(of the classes picked) made a mistake at each metre - of every kind, or the
one picked in the statistics. Each lap counts once per metre; each
occurrence's range (where its cause or event was) is widened by 6 m either
side so a short one shows. Wider and brighter where more laps did: width
`3 + 10 · (laps here / most laps anywhere)` metres, colour from dim brown to
bright orange; a grey 2 m strip where none did. Legend: *few laps ↔ most
laps*.

With **Labels** on, each corner's apex carries its most common mistake:
"T3 · 12/40 early braking" (laps that made it / laps that drove the corner),
"T3 · 12/40" with one kind picked, "T3 · clean" with none. Hovering a label
lists the corner's losses and its five most common mistakes; clicking it
opens or closes that corner in the statistics.

## Show in the heatmap

**Show in the heatmap** hands the same to the heatmap tab as a dataset named
"Mistakes on <track>" (or "Mistakes on the course"), so the heatmap's whole
toolset - heat modes, filters, the timeline, slicing - works on where the
laps go wrong.

It is a CSV built in memory (`mistakeTable`), one row per grid point (every
2 m) of every occurrence, at that **lap's own position** there:

| Column | Content |
|---|---|
| `x`, `y`, `z` | the lap's position at that metre (game coordinates) |
| `elapsed` | the lap's time there, s |
| `lap` | the lap's label |
| `car` | the car's name (or "car 1234") |
| `mistake` | the mistake's name, in the current language |
| `car_class` | the class, `-` when none |
| `corner` | the corner's label, `T3` |
| `cost` | the occurrence's cost, s |

It is loaded through the heatmap's own loader with mapping hints: Y up, no
axis flips, scale 1; time `elapsed` in seconds; **person** = `car`,
**group** = `mistake`, **session** = `lap`; no look direction; `car_class`,
`corner` and `cost` kept as filter columns. The tab then switches to
**Heatmap** and frames the data. Only the classes picked in the statistics
are exported.

## Courses from several tracks

Laps are analysed **one course at a time**. A folder holding several
courses' laps - the whole lap library - offers each course to load on its
own (with its lap count, most first); laps of runs that never finished
(FH Companion's `unfinished/`) go with their course, marked *partial*.
Laps of several named tracks picked as files are offered the same way, laps
naming no track going with whichever is picked. Loading laps of another
named track than those loaded replaces them. Details:
[Loading laps](race-loading-laps.md#folders-and-courses).

## Performance with many laps

Dozens of laps are analysed in a second or two (all of them, always). What
is drawn is limited so the view stays at frame rate:

| Limit | Value | Effect |
|---|---|---|
| laps drawn by default | 8 (`SHOW_ALL_UP_TO`) | past 8 loaded laps, newly added laps are hidden unless they are the reference, the focused lap or the best of its class. **Show all** draws every lap; **Only those looked at** goes back. Focusing a lap un-hides it and its class's best |
| plain cars and thin lines | over 10 visible (`PLAIN_PAST`) | laps other than the focus, the chased car and the reference: a line point every 6 m (instead of 1.5 m), cars drawn plain |
| charted laps | 8 (`CHART_LAPS`) | focus, its class best and the reference first; "+N more drawn, not charted" |
| HUD cards | 6 | the first six visible laps |
| statistics | from 3 laps | the section is hidden below that |
| findings listed | 12 driver, 8 car/context, 10 gains | per focused lap |
| car pairs shown | 3 | past 3 pairs, one pair with a picker |

Mistake occurrences are worked out once per analysis and cached; the
mistake map's density is cached per class selection and mistake.
