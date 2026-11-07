---
title: Car profiles and comparison
parent: Race analysis
nav_order: 56
---

# Car profiles and comparison

The analysis only tells a lap to brake harder, carry more speed or accelerate
earlier where its car has shown it can, and it takes out of a loss what the
cars themselves explain. So each car's limits and character are measured
from every loaded lap of it. This page covers the envelope, the profile, the
**Cars compared** section, and what the cars decide in each corner.

Code: [`src/race/envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts),
[`src/race/profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts),
`carNote` in [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts),
`CarsSection` in [`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx).

**One car** = laps with the same car number (or name, without a number) and
the same performance index: a different tune is a different car.

## The envelope: what the car can do at each speed

Per car, over every loaded lap of it, in **5 m/s speed bins** (24 bins, up to
120 m/s). Samples in the air, settling for 0.3 s after a landing, and from
0.1 s before every hit to 1 s after it are left out, and accelerations of
80 m/s² or more are ignored (above what any car with downforce holds).

| Envelope | Samples | Value per bin | Needs |
|---|---|---|---|
| **lateral grip** | the lateral acceleration **held for half a second** (the mean of its absolute value over a centred 0.5 s window), only where the car was cornering: at least a third of the 99th percentile of all of it | 95th percentile | 6 samples |
| **braking** | brake > 0.3; the longitudinal acceleration as the median of each sample and its two neighbours | 95th percentile of the deceleration | 4 samples |
| **full-throttle pull** | throttle > 0.95, brake under 0.05; the same median-of-three | 90th percentile | 4 samples |

Why held for half a second: a kerb, a slide snapping back, a car being
caught all spike the lateral acceleration for a moment, and a car that does
that often looked grippier than it is. Why median-of-three: at five-metre
spacing one sample is a long way, and a single-sample spike is a kerb, a
bump or a wall.

Reading the envelope at a speed interpolates between bin centres, and takes
the nearest bin with data where a bin is empty.

**On two kinds of ground.** When a car's laps drove a fifth or more of their
samples on each of tarmac and loose ground, a separate envelope is kept for
each, and each corner is judged with the ground under the car at its
slowest point.

**Crossover.** The speed from which the pull falls off as `1/v` (power
limited) rather than holding flat (traction limited): the first bin whose
`a·v` is within 15% of the highest `a·v` seen.

## The profile: what kind of car it is

`profile`, from the same laps (samples on the ground, not struck, faster
than 8 m/s):

| Measure | How |
|---|---|
| **grip held** (m/s²) | 95th percentile of the half-second held lateral acceleration |
| **pull** to 50 km/h, 50-120, 120-200, above 200 (m/s²) | the mean of the envelope's full-throttle pull over 3-14, 14-33, 33-56 and 56-90 m/s, at speeds the car reached (up to its fastest + 2 m/s), from at least three 1 m/s steps; and the most it showed, and where |
| **braking** (m/s²) | the envelope's braking averaged from 60 to 160 km/h (16.7-44.4 m/s), the band the comparison names |
| **fastest** | the highest speed it reached |
| **topped out at** | where it stopped gaining at full throttle on a straight (below) |
| **still pulling at its fastest** | the envelope's pull at its fastest speed: how far it still had to go |
| **rear caught, per lap** | times a lap it slid and had to be caught (below) |
| **share on the throttle** | of those, the share that began with throttle > 0.5 and no brake |
| **lets go at** | the median of the held lateral acceleration 0.15 s before each slide began, as a share of the grip |
| **past 10° of drift, of hard cornering** | of samples cornering at 60% of its grip or more, the share sliding (10° on tarmac, 20° on loose); needs 30 samples |
| **median drift** | over the same samples |
| **balance** | front minus rear slip angle (multiples of the nominal peak) where cornering hard and not sliding, mean of at least 30 samples: + pushes wide |
| **surface** | over 80% loose samples: loose; under 20%: tarmac; else mixed |

**Topping out.** A sample counts when the second around it (±0.5 s, at
least 0.9 s of data) was all at full throttle (> 0.95, no brake), on the
ground, driven **straight** (|lateral| under the larger of 4 m/s² and a
quarter of its grip), gaining under **0.35 m/s²**, faster than 25 m/s and
within 90% of the lap's fastest - full throttle up a hill or through a long
bend also stops gaining, well below the car's top speed. With at least **one
second** of such plateau over all laps, the median of those speeds is where
it tops out. Otherwise there is no top speed: where no straight was long
enough, *still pulling at its fastest* says how far off it was. No guess
beyond what the laps show - gearing and the limiter end a car's pull long
before drag does.

**Losing the rear.** Counted where the driver had to catch it: cornering at
60% of its grip or more, sliding (drift past 10° on tarmac, 20° on loose
ground), with the steering (over 0.06) turned **against** the corner. Which
sign of steering agrees with which sign of cornering force is measured per
lap (samples turning without sliding). A slide is counted once until the car
stops sliding. A car driven a little sideways on purpose is not losing
anything; one that needs opposite lock is. Counted the same for every car,
so two cars can be compared. Needs steering and a drift angle.

## Cars compared

The sidebar section is **The car** with one car, **Cars compared** with
several.

**The table**: a column per car, a row per measure any car has a value for:
Grip held; Pull to 50 km/h, 50-120, 120-200, above 200; Braking; Fastest;
Topped out at ("still pulling" where it never did); Still pulling at its
fastest; Rear caught, per lap; Past 10° of drift, of hard cornering. Where
the cars differ by more than 3%, the better value is marked (higher for grip,
pull, braking, speeds; lower for rear slides).

**One car alone**: sentences on what the laps show it is - the grip it holds
(m/s² and g), its pull in each band, where it stopped gaining on the long
straights (or that it never topped out, and what it still pulled at its
fastest), how often its rear needed catching ("hardly ever" under once a
lap, "mostly on the throttle" when 60% or more began there).

**Two cars**: for each pair, a sentence each on what the car is against the
other ("X accelerates better, but cannot turn as hard, needs longer to stop
and loses the rear more easily"), the table, each clear difference biggest
first, then **Driving each**. With more than **3** pairs, one pair is shown:
the focused lap's car against a car picked from a drop-down (by default the
car of its class's best lap, else the reference's, else the first other).

A difference is said only when the laps show it clearly:

| Difference | Said from | Sentence |
|---|---|---|
| grip | **4%** | "X holds N% more grip through the corners … that is M% more speed through the middle of every corner" (speed = √ of the grip ratio) |
| pull | **5%**, in the first band both cars have of 120-200, 50-120, above 200 km/h | "X accelerates N% harder from 120 to 200 km/h"; off the line too, or "though Y gets off the line harder", when the launch differs by 8% |
| top speed | **4 km/h** | "X tops out higher: it stopped gaining at …" |
| top speed, one only | one car topped out, the other did not | "Y ran out of pull at …; X was still gaining when it braked" |
| top speed, neither | neither topped out | what each was still gaining at its fastest |
| braking | **5%** | "X stops N% harder … Y has to brake earlier" |
| losing the rear | at least once a lap more **and** half again as often | "X loses the rear more easily: it stepped out far enough to need opposite lock N times a lap against M …" - mostly on the throttle (60%+) or mostly turning in and on a lift (30% or less), from about P% of its grip; on loose ground "some of that is how a car is turned; the catching is not" |
| sideways | **12 percentage points** of hard cornering past the drift threshold | "X runs more sideways at the limit" |
| front balance | **0.3** of the nominal peak | "X pushes more at the front … It wants to be slowed and turned before the apex" |

The traits in the summary: *holds more grip* / *cannot turn as hard*,
*accelerates better* / *pulls less*, *tops out higher* / *tops out lower*,
*still pulls at the end of the straights* / *runs out of pull*, *stops
harder* / *needs longer to stop*, *is more stable* / *loses the rear more
easily* (*is much more slidey …* at twice as often plus one; *needs catching
more often* on loose ground), *pushes at the front*. "Little to tell it from
Y on these laps" when there is none.

**Driving each:**

- one car grips more and the other pulls more: carry speed through the
  middle on a wide, round line (the "U") in the grippy one; brake straight,
  rotate it in a short tight middle and straighten the exit (the "V") in the
  strong one;
- one car is down on both: its best lap is the cleanest one - brake straight,
  the widest radius, full throttle as early as it holds;
- a car that loses its rear more easily: feed the throttle in only as the
  steering unwinds and short-shift (slides on the throttle), or release the
  brake gently and keep a steady throttle through the middle (slides on
  entry).

The hint under the section repeats how each is measured.

## What the cars decide in a corner

When the laps are in different cars, every lost corner's finding ends with
**The cars:** - what of it the cars decide, and how to make the most of this
one (`carNote`):

- **Through the middle**, when this car holds under 96% of the other's grip,
  the other was over 0.5 m/s faster at the slowest point, and this lap was not
  far below what its grip explains (above 70% of it): on the other car's line
  this car's grip allows `v_other · √(grip_mine / grip_other)`. If the lap
  carried that (within 1 m/s) the gap is the car, and no braking point changes
  it; if less, how much is still there to be had. Then where the time can be
  won instead: onto a straight, between two, or in a car that pulls 5% harder
  - after the apex (brake straight, turn in later, point it at the exit
  early); otherwise the widest radius the road allows.
- **A rear that let go here** (an unshared slide or spin, or a drift past the
  sliding threshold on the way in), in a car that loses it at least once a
  lap more and half again as often: what to do in this car - the throttle fed
  in as the wheel unwinds (its slides begin on the power 60% or more of the
  time) or the brake released gently with no lift.
- **The straight after**: when the cars' pull explained 0.03 s or more, the
  other car's stronger pull from the same speed, with both cars' pull from
  120 to 200 km/h.
- **Top speed**: when this lap reached 98% of where its car tops out on a
  straight over 150 m long, and the other went 1.5 m/s faster: that is the
  car's top speed, and every km/h more out of the corner still helps until it
  gets there.
- **Braking**: when the other car brakes 5% harder and this lap braked more
  than 5 m earlier, that some of the earlier braking is the car's.

The car's share is also taken out of the time itself - see
[the car's share](race-corner-analysis.md#the-cars-share) - and a corner
where the car explains 60% or more is put down to the car.
