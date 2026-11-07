---
title: Corner-by-corner analysis
parent: Race analysis
nav_order: 55
---

# Corner-by-corner analysis

How two laps are compared: one distance axis, corners and their segments,
what each lap did in each corner, the time account of a corner, how the
verdict and its cause are chosen, the shape of the line and the advice - and
the **Where to improve** and **Corner by corner** sections that show it.
Every threshold here is the code's.

Code: [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts),
[`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts),
[`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts),
[`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts),
[`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx).
The reasoning and its sources: [the method](race-analytics.md).

The governing rule: **a corner is judged whole**, from the braking zone for
it to the braking zone for the next one. A lap that brakes earlier to get the
car turned and on the power sooner is credited with the exit it bought, not
told to brake later.

## One distance axis

Laps are compared by distance, not time - a second behind, two laps are at
different corners. Not by each lap's own odometer either (a tighter line
covers fewer metres). The **reference** lap's driven path is the axis:

- Every other lap's samples are **projected** onto the reference path: each
  sample gets `s`, how far along the reference it is, and `d`, how far to the
  left (positive) or right. The search runs forward from the previous match
  (8 path segments back to 40 ahead), so a lap that crosses over or under
  itself never snaps to the other crossing. The first sample is looked for in
  the first quarter of the path (on a circuit, start and finish coincide);
  when nothing is within 30 m, the nearest point anywhere not behind the last
  match is taken (after a spin or an excursion). `s` never decreases: a
  sample that projects behind the one before is held.
- Every channel is **resampled** onto one grid, **every 2 m**, linearly;
  stepping channels (gear, flags) by the nearest sample. Outside a lap's own
  range the values are empty.
- A lap's first and last samples project a little inside the reference's
  ends, so each lap is **carried up to 15 m** past its ends at the speed it
  had (time grows by distance over speed, the rest holds) - so its delta at
  the line is its lap-time difference.
- `delta` = the lap's time at each grid point minus the reference's: the gap.
  `lateral` = `d` on the grid.

The time one lap took more than another between two grid points is the
difference of their deltas: `rel(s)`. Everything below is built on it.

## Corners

Found on the **reference** (`findCorners`), with its speed smoothed over ±6 m
and its curvature (heading change over ±5 samples, smoothed over ±10 m):

1. **Speed minima with prominence.** A point that is the lowest within
   ±40 m, whose drop from the highest speed on each side (before a lower
   minimum) is at least `max(2.5 m/s, 6% of the speed)`.
2. **Kinks.** A local peak of curvature tighter than **300 m** radius with no
   speed minimum within 80 m: a flat-out kink is still a corner to drive.
3. **Phases.** From each apex back while the reference is braking (> 0.1) or
   off full throttle (< 0.95): the entry; forward while off full throttle: the
   exit. A kink taken flat gets ±30 m. Overlapping corners are kept separate
   but made to tile the lap.
4. Numbered T1, T2 … in lap order; **left or right** by the curvature's sign
   and whether the world is mirrored (unknown counts as mirrored).

**The corner window** (where the reference turns): out from the tightest
point within ±40 m of the apex while the curvature stays above a sixth of
its peak, plus 10 m either side. Its side gives the sign of "inside".

## Segments: braking zone to braking zone

Each corner owns the road half-way to the apexes either side. In it:

- **Each lap's slowest point** is a real dip in its speed - nothing slower
  within 6 m (3 grid points) either side, looking past the ends of the
  stretch, so the previous corner's exit still accelerating into it is never
  mistaken for it - searched from 15 m before the corner window to 10 m after
  it. A lap that never slowed there is placed at the apex.
- **Where a lap began to slow for it** (`entryOf`): back from its slowest
  point through the braking or the lift, over blips of full throttle, until
  it had its foot down (throttle ≥ 0.95, brake ≤ 0.1) for **10 m**; a throttle
  picked up again in the last **30 m** before the slowest point still belongs
  to the corner; flat out all the way, the slowest point itself. A lap with
  no throttle channel, or that never had its foot down since the corner
  before, starts at its fastest point in between.
- **The segment starts** at the first of all the laps to begin slowing for
  it (4 m earlier), and runs to the start of the next one, so every lap's
  braking is inside it and the segments tile the lap.

**Complexes.** Consecutive corners the reference never drives flat out
between - less than **40 m** of full throttle - are one segment, "T11-T12",
driven as one; a complex holds at most **three** bends (a twisty section
driven without ever being flat starts a new one). A complex that turns both
ways is *mixed*: no single line shape is measured for it.

**On a circuit** (the reference ends within 50 m of where it started), the
last segment's straight runs on across the line to the first braking point:
a flying lap's run from the line counts with the last corner. A lap that
began at a standstill or at a race start (see [The start](#the-start)) keeps
that run apart.

### What a corner leads onto

Measured on the reference: metres at full throttle after the corner (from
its full throttle to the segment's end, plus the run across the line) and
before it (the previous segment's "after", or from the start).

| Type | Rule |
|---|---|
| **between two straights** (`both`) | 200 m or more before **and** 120 m or more after |
| **onto a straight** | 200 m or more after, or 120 m or more after and at least as much as before |
| **after a straight** | 200 m or more before |
| **link** | anything else |

## What each lap did in a corner

`cornerMetrics`, per lap and segment, on the grid (step 2 m). Pedals: brake
counts above 0.1, full throttle is 0.95 and above.

| Measure | Rule |
|---|---|
| **brake point** | the first brake under which the throttle came off (below 0.5), or that lasted **15 m** - a dab of the left foot with the power on is not where braking began; with only dabs, the first dab |
| **lifted** | with no braking, the first point the throttle went under 0.8 |
| (no pedals) | the point where the lap began to slow (above) |
| **brake release** | the last brake up to 30 m past the slowest point |
| **speed at the brake point**, **braking metres** | to the slowest point |
| **peak brake**, **peak deceleration** | over the braking zone (accelerations over 45 m/s² ignored) |
| **trail braking** | metres with brake > 0.05 and |steer| > 0.1 |
| **lock slip** | the most negative wheel slip ratio in the zone (when the lap has slip) |
| **slowest point**, **minimum speed** | as above |
| **throttle on** | after the release (or the slowest point), the first throttle > 0.15 with no brake |
| **full throttle** | the first point after that held at ≥ 0.95 for 10 m |
| **coasting** | metres from the release to throttle-on with brake and throttle both under 0.05 |
| **throttle dips** | times the throttle fell more than 0.25 below its running high between throttle-on and full throttle |
| **peak lateral** | the most lateral acceleration from 20 m before the release to the later of full throttle and 20 m past the slowest point |
| **gear at the apex** | at the slowest point |
| **spin slip** | the most driven-wheel slip ratio between throttle-on and full throttle |
| **balance** | front minus rear slip angle through the middle (+ understeer) |
| **straight at full throttle** | the share of the segment after full throttle (and the run across the line) at ≥ 0.95; the longest lift on it |
| **speed scrubbed** | the most speed lost from a high point with throttle ≥ 0.9, no brake, on the ground |
| **entry drift** | the largest drift angle from the brake point to 5 m past the slowest point, on the ground |
| **handbrake** | where it came on (> 0.2), up to 10 m past the slowest point |
| **air** | seconds in the air over the segment, and its longest flight |

## Who each lap is compared with

- A lap is compared with the **fastest complete lap of its own performance
  class** (the reference, in the reference's class).
- That class-best lap itself (and the reference) is compared, segment by
  segment, with **whichever other lap of its class was quickest** through it -
  or of every lap, when it is alone in its class.

The time map, the gaps in the lap list, the car-control events and the
corner table follow the same comparison.

## The time account of a corner

`compareCorner`, for a lap against the other over a segment:

- **net** = `rel(end) - rel(start)` (plus the run across the line on a flying
  lap): the verdict. Closer than **0.03 s** is **level**.
- **The split** - where inside the corner the lead turned: in the stretch from
  the first brake point or slowest point of either lap to the later of their
  full-throttle and slowest points, the biggest swing the lap then gave back
  or won back, when that swing is over **0.04 s**; otherwise the later of the
  two slowest points.
- **To the apex** = `rel(split) - rel(start)`; **after it** = net minus that.
  When both are at least 0.04 s and of opposite signs, the lap **traded** one
  for the other.
- **After it** splits again where both laps are flat out: the **exit** (split to
  the later full throttle) and the **straight** (from there to the end).
- **The straight** splits three ways:
  - *exit speed* (`byExit`) - measured, not modelled: the slower car passes
    through the faster car's starting speed a little way down the straight,
    and from there its own trace is what it would have done from that speed,
    with its own gearing, drag and slope in it. Shifted back to that point
    (and run on at its end speed for the metres it gains) it is its time from
    the faster start; the difference is the exit speed's cost. When the slower
    car never reaches that speed (or only in the last 2 samples), its own
    acceleration along the stretch is put back as power (`a·v` held), never
    harder than its envelope shows at that speed (twice the measured
    acceleration without an envelope).
  - *the cars' pull* (`byPower`) - only in different cars: both cars from the
    same speed over the same metres, flat out, integrating the full-throttle
    acceleration each has shown at each speed.
  - *how it was driven* (`driven`) - the rest: a lift, speed scrubbed at full
    throttle.

  The exit speed never explains more than the straight cost (and never with
  the opposite sign), unless a lift or scrubbed speed took some back. A lap
  **lifted** on the straight when its share at full throttle is below both
  0.9 and the other's share minus 0.05. Speed scrubbed counts when the two
  differ by more than 1 m/s. A disagreement under 0.02 s in sign is set to 0.

Every segment's net adds up to the lap-time difference, and every corner's
to-the-apex and after-it add up to its net (the tests check both).

### The car's share

Only when the laps are in **different cars** and the lap lost time
(`carShare`):

- **pull**: the cars' pull down the straight (above), up to the loss;
- **grip**: when the lap was at its car's limit (lateral acceleration in the
  middle at least **90%** of what its car holds at that speed) and the other
  car holds more than **5%** more: of the lower minimum speed not explained by
  a tighter radius, the share `½ ln(grip_other / grip_mine) / ln(v_other /
  v_mine)` of the remaining loss;
- **brakes**: when the lap braked (not lifted), the other car brakes over
  **5%** harder, and the lap's *average* deceleration over the zone was at
  least **80%** of what its car can do: from `u` down to `v` at `a1` against
  `a2`, ending at the same point, `(1/a1 - 1/a2)(u - v)² / 2u`, up to what is
  left.

The car's cost is the sum, at most the loss.

## The verdict and the finding

`cornerFinding` writes at most one finding per lap and corner, tried in this
order:

| Case | Finding | Outcome |
|---|---|---|
| net within ±0.03 s, a trade, smaller side ≥ **0.1 s** | **level, two ways through** - who was slow in and fast out, who the other way round; with a straight after it (onto a straight, or between two), the slow-in-fast-out way is the one to build on: keep its early throttle, win the entry back by braking harder, not later | even |
| net within ±0.03 s otherwise | nothing said | - |
| gained, a trade, lost to the apex | **slow in, fast out paid off**: keep it, here the exit is worth more | gain |
| gained, a trade, gained to the apex | **quicker on the way in**: the entry is right, an earlier full throttle would keep more | gain |
| gained, and the other lap has a loss here | **quicker - because of what the other did**, its cause and its tip said "For the other lap: …" | gain |
| gained otherwise | **quicker on the way in / out**, by which half gained more (braking later, more speed through the middle; or flat sooner, stronger pull) | gain |
| lost, and a **hit or crash** cost at least `max(0.05 s, 40% of the loss)` | the impact is the corner's story, before the cars | loss |
| lost, and the **car's share** is 60% or more | **the car**: its pull down the straight, its grip through the middle, or its brakes - the biggest part; with the driver's part (≥ 0.03 s) said as "The other X s: …" | loss |
| lost, and one unshared **car-control fault** cost at least `max(0.05 s, 40%)` | that fault (see below), with how the time moved around it | loss |
| lost, and a **longer flight** cost at least `max(0.05 s, 40%)` | the flight | loss |
| lost, a trade, gained to the apex | **too fast in, slow out**: the exit's cause; give up some entry to get turned and flat sooner, with the other lap's brake and full-throttle points. Its root (`cause`, what the [statistics](race-course-statistics.md) count): braking later, when it braked more than a few metres later than the other; the exit's cause otherwise | loss |
| lost, a trade, lost to the apex | **gave more away going in than the exit won back**: the entry's cause, which is also its root (`cause`); keep the exit, lose less going in | loss |
| lost, lifted on the straight, and the driven part over half the loss | **not flat out on the straight**: share of it at full throttle against the other's, where and how long the lift | loss |
| lost, the cars' pull over 60% of the loss and the straight over half | **the car's pull down the straight** (with both cars' pull at 160 km/h) | loss |
| lost otherwise | the cause of the half that lost more (to the apex ≥ after it: the entry's; else the exit's). Slower out only because slower through the middle (by more than 1 m/s): the middle's cause instead | loss |

A finding on a loss may also end with **Also:** - speed scrubbed at full
throttle, or a lift on the straight - when the driven part of the straight
cost more than 0.04 s and that was not already the cause.

Findings are sorted losses first, costliest first; then gains and level
corners.

### Causes on the way in

`entryCause`, the first that applies (minimum speed differences are in m/s;
"5 m" is the threshold for an earlier/later point to count):

| # | Cause (mistake) | Rule |
|---|---|---|
| 1 | a hit or crash on the way in | an unshared impact starting by 10 m past the slowest point |
| 2 | **nearly stopped** (incident) | slowest speed under **60%** of what this car's grip allows where the other went through (`v_other · √(grip_mine / grip_other)` when the other car grips more, else the other's speed), the other lap above 8 m/s - a spin, contact or a missed corner |
| 3 | a car-control fault on the way in | an unshared lock, push, spin, or slide not on the throttle, starting by 10 m past the slowest point, cost ≥ 0.02 s |
| 4 | a longer flight before the slowest point | see [rally](#rally-rotation-and-flights) |
| 5 | **lifted** where the other stayed flat or lifted 5 m or more later | this lap only lifted |
| 6 | **braked where the other only lifted** or stayed flat | and was more than 0.5 m/s slower through the middle |
| 7 | **braked gently** | it braked (not lifted), had room to brake harder - with tyre data, its lock slip under **60%** of the slip where this car's brakes give their best; without, a peak deceleration under **85%** of what it shows at that speed - the pedal under 0.95, and the other lap's peak deceleration more than **15%** higher |
| 8 | **braked early** - or **the car's brakes** | braked more than 5 m before the other. In another car whose brakes are over 5% stronger, and with no more than 10 m to spare against the distance this car needs at its own deceleration: the car's brakes. Otherwise braked early, with "Brake later - about N m" (in another car, the metres beyond what it needs) |
| 9 | **coasted** | more than 10 m with neither pedal, and 5 m more than the other |
| 10 | **slower through the middle** | more than 0.5 m/s slower at the slowest point; split by `v² = a·R` (below) |
| 11 | **arrived slower** | over 1 m/s slower at the brake point, not braked early: decided before - by the corner before and the car's pull, or by a flight in the corner before that was 0.2 s longer. The car's when the cars differ |
| 12 | slower to the apex | otherwise: release the brake more smoothly and roll more speed into the middle |

**Slower through the middle** (`middleSplit`): each lap's radius at its
slowest point is measured from its own path (±8 m), its lateral
acceleration as `v²/R`, and

`ln(v_other / v_mine) = ½ ln(a_other / a_mine) + ½ ln(R_other / R_mine)`.

- The radius explains **half or more**: **too tight a line** - "use more of
  the road", with both radii and the share.
- At the car's limit (sliding past 10° of drift on tarmac / 20° on loose, or
  lateral acceleration at least 90% of what it holds at that speed) and the
  other car grips over 5% more: **the car's grip**; protect the exit instead.
- Sliding through it (drift past 10° / 20°) and the other lap did not (its
  entry drift at least 4° less): **sideways** - past its grip, not short of
  it; arrive a little slower. Said as the car's when this car catches its
  rear at least once a lap more than the other.
- In another car that holds under **96%** of the other's grip, and the lap
  carried within 1 m/s of `v_other · √(grip_mine / grip_other)`: **the car's
  grip** - "braking later will not close that".
- Otherwise **grip to spare**: lateral acceleration against the other's on a
  similar radius, and what this car holds; carry more speed to the apex.
  Where this car's rear lets go before its grip is used up (its slides begin
  under 85% of its grip, and the lap was at 80% of that), find the rest in
  small steps.

### Causes on the way out

`exitCause`, the first that applies:

| # | Cause (mistake) | Rule |
|---|---|---|
| 1 | a car-control fault on the way out | unshared wheelspin, spin, slide or impact ending at or after 10 m before the slowest point |
| 2 | **scrubbed speed** | more than 1 m/s more speed lost at full throttle than the other; over **7 m/s (25 km/h)** "more like contact or a spin than a slide" |
| 3 | **turned the car wrong** (loose ground) | see [rally](#rally-rotation-and-flights) |
| 4 | **on the power later** | throttle-on more than 5 m later, counted from each lap's own slowest point too (a lap slowest later is not blamed for a later throttle) |
| 5 | **hesitated on the throttle** | more throttle dips than the other |
| 6 | **ran wide and waited** | more than 1.5 m outside the other where both were flat, and full throttle more than 5 m later from its own slowest point |
| 7 | **full throttle later** | full throttle more than 5 m later, from its own slowest point too; with the car's acceleration there |
| 8 | **the car's drive** | in another car that pulls under 95% of the other at that speed, and the pull explained some of the straight |
| 9 | **slower out of the corner** | otherwise: a later apex, so the car is straight sooner |

When the two laps were in different gears at the slowest point, the tip ends
"Gear N at the apex; the other used M."

### Car-control faults and impacts

A fault of [Car control events](race-control-events.md) as a cause: a lock is
a *braking* cause, wheelspin or a slide on the throttle an *exit* cause, the
rest *entry*; an impact after the slowest point is *exit*, before it
*entry*. The tip is the event's own, then "It cost about X s by 40 m after
it" (or "by the time the car had its speed back" for an impact). A lock with
a brake point more than 5 m earlier than the other adds that the lap braked
early too - with the wheels turning it would not have needed to.

### Rally: rotation and flights

On **loose ground**, with drift angles on both laps, and this lap on the
power (or flat) more than 5 m later:

- **Turned the car less**: the other had the car turned **12°** or more by its
  slowest point and at least **8°** more than this lap. Tip: a lift or a dab
  of the left-foot brake as it turns in, with the other lap's handbrake point
  when only it used one, or the handbrake in a corner slower than 15 m/s
  (54 km/h).
- **Turned it too far**: this lap had it turned 12° or more and at least
  **12°** more than the other: it had to be straightened before the power
  could go down.

**A longer flight**: in the air 0.2 s or more longer than the other, costing
at least 0.03 s from 10 m before take-off to 40 m after the landing (or the
segment's end). Before the slowest point it is an entry cause; it becomes
the corner's story when it explains 40% or more. The tip: keep the throttle
on at take-off, take the crest a little slower or with a dab of the brake.

### The start

Before the first corner, on a sprint or when either lap began at a
standstill (under 5 m/s where both are first on the axis) or at a race start
(under 60% of the other's speed), the run to the first braking point is its
own finding (corner 0) when it differs by more than 0.03 s: *The launch*,
*The start of the race* or *To the first corner*. A loss there is put down to
the situation (*context*) when one lap began at a race start and the other at
speed, to the car when the laps are in different cars, and to the driver
otherwise. Tips: in another car from a standstill, "mostly the car"; a
standing start in the same car, launch with less wheelspin and shift at the
top of the power band; a race start, compare it with another first lap; a
flying start, a better exit from the last corner is carried over the line.

## The driven line

`lineMetrics`, per lap and segment (not for mixed complexes), from positions
alone (smoothed ±2 samples) over the corner window:

| Measure | Rule |
|---|---|
| curvature | heading change over ±8 m of the lap's own path |
| **tightest radius** | 1 / the peak curvature |
| **turn-in** / **track-out** | where the curvature first / last exceeds a fifth of its peak |
| **middle** | where the lap had turned half of its heading change |
| radius in / out | metres driven over half the heading change, before / after the middle |
| **shape** | tightest radius over the average radius while turning: below **0.55** a **V**, above **0.75** a **U**, between "U/V" |
| **apex** | radius out over radius in: above **1.25** late, below **0.8** early, else middle |
| **speed apex** | the slowest point more than **15 m** before the middle: slow in, fast out; more than 15 m after: still slowing past the middle |

Against the other lap: how far inside (+) or outside it ran at turn-in,
through the tightest part and where both were flat (said from 1 m); where
each turned in (said from 8 m).

### Which line suits this car here

`lineFor`, from what the corner leads onto and the car's character at this
corner:

- **power-to-grip** = the car's full-throttle acceleration at the exit speed
  over its grip at the minimum speed (from its envelope). **Point and shoot**
  at **0.45** and above; **momentum** at **0.25** and below.
- **downforce**: grip at 151-252 km/h over grip at 54-108 km/h of **1.15** or
  more, for a corner taken at **144 km/h** (40 m/s) or faster - then it is a
  momentum corner whatever the power. Not judged on loose ground.

| Corner type | Car | Line |
|---|---|---|
| after a straight | point and shoot / other | V / U, apex in the middle: "the braking zone is the prize" |
| between two straights | momentum / other | U / V, late apex |
| link | momentum / other | U / V, apex in the middle: "drive it for the exit of the next one" |
| onto a straight | momentum (or a fast downforce corner) | wide round U, slightly late apex |
| onto a straight | point and shoot | V: brake straight, turn in late, rotate in a short tight middle, straight early |
| onto a straight | in between | U with a late apex: slow in, fast out |

Where the exit matters (onto a straight, between two) the drivetrain adds a
sentence: **FWD** - rotate it on the brakes, add power only as the wheel
unwinds; **RWD** with a power-to-grip of 0.35 or more - straighten it before
full throttle; **AWD** - it can take power while still turning. On loose
ground every line adds: turn the car on the way in.

The sentence then says what the lap drove, and whether it fits: *slowest
late ties up the exit* or *an early apex ties up the exit* where a late apex
was wanted and the lap neither apexed late nor was slowest early; *rounder
than this car wants* where a V was wanted; *squarer than this car wants*
where a U was wanted; otherwise *that fits*.

## Where to improve

The sidebar section for the focused lap ("Load at least two laps of one
course." until then).

**The head:** "<lap> <time> against <reference> <time>" and the lap-time gap -
or, for the reference, "against the quickest other lap through each corner
(…)" and the total it lost. Beside it, the loss split into *driving* and
*car / context*.

**The breakdown bar:** the time lost by cause group (braking, entry, exit,
straight, car, context), in the cause colours, with a legend.

**The findings**, three lists:

1. Driver losses, costliest first, at most **12** - or "Nowhere that driving
   differently would win time stands out."
2. **Show what the car or situation cost (X s)** - car and context losses, at
   most 8 (on by default).
3. **Where <lap> is quicker, or level another way (N)** - gains and level
   corners, at most 10 (on by default).

Each finding shows its rank, title (the corner and what happened, with the
cost for a loss), the verdict line, the cost (gains with a minus) with a
bar, and a chip: *braking*, *entry*, *exit*, *straight* (driver losses, with
"· car X" when the car explains 0.02 s or more), *car*, *context*,
*quicker*, *level*. **Click one** to line the cars up 40 m before it, frame it
and replay it, and open its measurements:

- **Braking:** where each braked (or lifted) and from what speed, and how
  many metres earlier or later (from 5 m);
- **Slowest:** each lap's minimum speed and where;
- **Full throttle:** where each was flat, and how much sooner or later;
- **Line:** turn-in difference, tightest radii, how far inside or outside,
  and each lap's line shape and apex;
- **Straight to the next corner:** its length, both speeds where both were
  flat, what it lost or gained and of what - the starting speed, the other's
  stronger pull, a lift, speed scrubbed, how it was driven (parts from
  0.02 s);
- **The car:** how much of the loss is the car, and of what (pull, grip,
  brakes; when 0.02 s or more);

then the tip, **The cars:** (in different cars, see
[Car profiles](race-car-profiles.md#what-the-cars-decide-in-a-corner)), and
the line advice.

## Corner by corner

A table (with two or more laps), one row per segment, of the focused lap's
class when there are several classes:

| Column | Shows |
|---|---|
| Corner | `T3`, `T11-T12` |
| Quickest | the lap quickest through it (its own time from segment start to end) |
| by | its margin over the second quickest, s |
| line | the quickest lap's shape and apex ("V · late", "U/V · middle"); hover for its tightest, entry and exit radii; "both ways" for a mixed complex |
| (the focused lap) | how far behind the quickest it was, or ✓ when it was the quickest |

Clicking a row opens the focused lap's finding there (or lines the cars up
40 m before the segment). Under the table, when every corner has a time:
"The quickest through every corner, put together: <time> (± on the
reference / on the best of class X)" - the best segments plus the quickest
run to the first corner when that is its own stretch.
