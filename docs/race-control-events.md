---
title: Car control events
parent: Race analysis
nav_order: 54
---

# Car control events

Every lap is read for how the car was handled - where a wheel locked, where
the driven wheels spun, where the rear stepped out or the car spun, where
the front washed wide, where it hit something - and each event is laid
against the lap it is compared with over the same metres. This page gives
every rule and threshold, and the **Car control** section that shows them.

Code: [`src/race/control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts),
[`src/race/impacts.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/impacts.ts),
[`src/race/derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts).
The reasoning and the literature are in [the method](race-analytics.md).

## The kinds

| Kind | Table row | A fault? | Shortest that counts |
|---|---|---|---|
| `lock` | Locked wheels | yes | 0.1 s |
| `wheelspin` | Wheelspin | yes | 0.15 s |
| `oversteer` | Rear stepping out | yes | 0.2 s |
| `spin` | (counted with Rear stepping out) | yes | 0.1 s |
| `understeer` | Pushing wide | yes | 0.25 s |
| `crash` | Crashes | yes | - |
| `hit` | Hits | yes | - |
| `abs` | ABS acting | no | 0.2 s |
| `tc` | Traction control acting | no | 0.2 s |
| `handbrake` | Handbrake | no | 0.1 s |
| `airborne` | In the air | no | 0.15 s |

Shorter runs are noise (a kerb, a bump, one sample). Runs of grid points
(every 2 m) that pass a test are joined over gaps of up to 2 points. Only
**faults** can be mistakes and carry a cost; the others are what the car and
the driver did.

## What every test needs

### Derived channels

Before anything is judged, each lap gets what its game does not send, under
canonical names (a game's own value always wins):

| Channel | From |
|---|---|
| `bodySlip` (drift angle) | the car-frame velocity, `atan2(latVel, |longVel|)`, where the game sends it (0 below 3 m/s); otherwise the heading (the game's yaw, fitted to the direction of travel by sign and offset over samples faster than 10 m/s, trusted only with a circular variance under 0.05) against the direction of travel (positions at least 2 m apart), at speeds above 3 m/s |
| `yawRate` | the change of `yaw` over time, where there is a heading but no rate |
| `airborne` | every wheel's ground contact off (≤ 0.5); else every wheel's load under 5% of its median; else every suspension travel at or under 0.02 (fully extended). A single stray sample is not a flight |
| `slipRatio.<W>` | `(wheel surface speed - car speed) / car speed` above 3 m/s, where the game sends wheel surface speeds; or from wheel rotation × a rolling radius measured on the lap - the median of `speed / rotation` while coasting straight (speed > 10 m/s, throttle < 0.3, brake < 0.05, |longitudinal acceleration| < 3 m/s², not in the air; every sample above 10 m/s when fewer than 20), accepted between 0.1 and 1 m. Marked `physical` |
| `loose` | Forza's surface rumble on at least 2 wheels (> 0.001) for at least 0.33 s (a kerb is shorter), gaps under 1 s bridged |

### On the ground and settled

Nothing is judged in the air or for **0.3 s after a landing** - the
suspension bottoms out and the accelerations spike, which is not grip,
braking or drive. A sample also has to be **moving**: faster than 5 m/s.

### The ground

Each sample's ground is **loose** where the lap's `loose` channel says so
(Forza's surface rumble, Trackmania's wheel materials), otherwise the lap's
surface (see [discipline and surface](race-loading-laps.md#discipline-and-surface)):
tarmac, or loose for anything else. Curves, drift habits and thresholds are
kept apart for tarmac and loose ground.

### Slip, as a multiple of the tyre's nominal peak

Games scale slip differently; `meta.slip` says how, and every slip is
divided by a scale so that about 1 is the tyre's nominal peak:

| `meta.slip` | Meaning | Divided by |
|---|---|---|
| `peak` | normalised by the game: past 1 grip is lost (Forza Data Out) | 1 |
| `scaled` | physical slip divided by a tarmac peak (the Kunos recorder) | the ground's nominal peak over the tarmac one |
| `index` | a 0..1 sliding measure (Trackmania's SlipCoef) | 0.5 |
| `physical` (or unknown) | slip ratio as a fraction, slip angle in radians | the ground's nominal peak |

Nominal peaks, when nothing better is known:

| Surface | Slip ratio | Slip angle |
|---|---|---|
| tarmac | 0.12 | 8° |
| mixed | 0.18 | 12° |
| loose (gravel) | 0.25 | 15° |
| snow | 0.25 | 15° |
| ice | 0.10 | 6° |

### Where grip ends: each car's tyre curves

Where a tyre stops giving more is **measured per car**, from every loaded lap
of it (`measureTyres`), separately for tarmac and loose ground:

| Curve | Samples (speed > 10 m/s, settled, accelerations under 45 m/s²) | Slip (x) | Force (y) |
|---|---|---|---|
| braking | brake > 0.3, handbrake ≤ 0.2, driving straight (lateral under 30% of the hardest) | |mean slip ratio of the four wheels| | deceleration |
| traction | throttle > 0.8, brake ≤ 0.05, straight, the car's full-throttle pull at that speed > 0.5 m/s² | the largest driven wheel's slip ratio | acceleration as a share of that pull |
| front | lateral over 30% of the hardest, the car's grip at that speed > 1 m/s² | the larger front slip angle | lateral acceleration as a share of that grip |
| rear | the same | the larger rear slip angle | the same |

"The hardest" is the 99th percentile of the lap's |lateral acceleration| on
that ground (all ground when it has fewer than 50 samples). The drivetrain
decides the driven wheels (FWD fronts, RWD rears, AWD all; unknown: all).

From at least **150 samples**, the slip is cut into 6 to 14 equal-count bins
(one per 40 samples), each bin's force is its upper quartile (what the tyre
gave when the driver asked), smoothed over neighbouring bins. The **best** is
the bin with the most force; the **limit** is the first bin past it where the
force has fallen **8%**. A curve that never falls in the data has no limit
(infinite) - running past the "peak" costs nothing in that game, and slip
alone flags nothing there (Forza Horizon's cornering and traction curves are
like that). With too few samples on one ground, the other ground's are used;
with too few overall, the **nominal** limit: 1.5 times the nominal peak.

Each car also gets:

- its **drift habit**: the upper quartile of its drift angle wherever it
  corners at 60% of its hardest or more (needs 100 samples);
- its **steering per curvature** (`steerGain`), per 5 m/s speed band: the
  median of |steer| / path curvature while cornering firmly but well inside
  its grip (30-60% of its hardest, curvature tighter than 400 m radius,
  steer above 0.02; 25 samples a band). The path's curvature is the yaw rate
  over speed where the game sends a yaw rate, else from the positions ±5 m.

## Detection, kind by kind

| Kind | Test (on moving, settled samples) | `peak` and `limit` |
|---|---|---|
| **lock** | brake > 0.05, handbrake not over 0.2, and any wheel's slip ratio below minus the braking limit | the most negative slip (multiples of nominal peak); the limit as negative |
| **wheelspin** | throttle > 0.2 (or no throttle channel), and a driven wheel's slip ratio above the traction limit | the largest driven slip; the limit |
| **oversteer** (drift angle) | the drift angle above the larger of the surface's floor and 1.5 × the car's drift habit there | the largest drift angle, radians |
| **oversteer** (slip angles, no drift angle) | the larger rear slip angle above the rear limit and more than 0.25 above the larger front one | the rear slip angle (multiples of peak) |
| **oversteer** (no drift angle, but yaw rate and lateral acceleration) | the "attitude velocity" - |yaw rate| minus |lateral acceleration| / speed, above 8 m/s - over 0.2 rad/s, with the steering against the turn | rad/s; limit 0.2 |
| **spin** | an oversteer run whose drift angle peaked past **60°** | as oversteer |
| **understeer** (slip angles) | not sliding, the larger front slip angle above the front limit and more than 0.3 above the rear | the front slip angle; the limit |
| **understeer** (no slip angles) | faster than 12 m/s, not sliding, not countersteering, lateral acceleration above half the lap's hardest (99th percentile), path tighter than 300 m radius, and steering more than **1.6 times** what the car's own steering-per-curvature says the path needed | times the needed steering; limit 1.6 |
| **abs**, **tc** | `absActive` / `tcActive` above 0.5 | - |
| **handbrake** | `handbrake` above 0.2 | - |
| **airborne** | `airborne` above 0.5 | - |
| **hit**, **crash** | see [Hits and crashes](#hits-and-crashes) | speed the impact took |

Drift-angle floors by surface: tarmac **7°**, mixed **10°**, loose and snow
**15°**, ice **10°**. A car that runs more as a matter of course - an arcade
tyre model, a gravel specialist - has its own, higher threshold from its own
laps (1.5 × its habit).

**Which way the car turns** (for "against the turn"): the heading change of
the lap's own path over ±6 m (at least 2 grid points); tighter than 600 m
radius counts as turning; right or left by whether the world is mirrored.
The steering is **against** the turn when |steer| > 0.05 and its sign is
opposite to the turn - a slide being **caught** with opposite lock.

**The pedals as it began** (`pedal`): *braking* when the brake is above 0.1;
*throttle* above 0.3; *lifted* when the throttle was above 0.5 within the 8
grid points (16 m) before; *coasting* otherwise (or with no throttle
channel).

## Laid against the other lap

Every event is judged against the lap the focused lap is compared with in
that segment (the best of its class; for that lap itself, whoever of its
class was quickest through the segment):

1. **How far the other lap went** over the same metres, ±8 m: the other
   lap's own events of the same family (a spin counts as oversteer, a crash
   as a hit) measured in the same units, with no thresholds, using the other
   car's tyre curves.
2. **Shared** when the other lap went **80%** as far or more: that is how the
   corner is driven, not a mistake. Non-fault kinds are always "shared".
3. **Cost**, for an unshared fault: the time this lap lost against the other
   from 5 m before the event to **40 m after** it (for a hit or a crash, until
   the car has its speed back - the metres to regain it at its own pull, 40 to
   400 m; without a measured pull, 5 m/s²). Never negative.
4. **Speed given away** to the car's limit: for a lock, the deceleration the
   car shows it can do at that speed minus what it did, summed over the
   event; for wheelspin, its full-throttle pull minus what it did; for an
   impact, the speed it took. Said when over 0.5 m/s (1.8 km/h).

A fault that is not shared and cost at least **0.02 s** is listed, and can
become the cause of a corner's loss (see
[Corner-by-corner analysis](race-corner-analysis.md#car-control-faults-and-impacts)).

## Hits and crashes

`impacts.ts` reads hits from the lap's **own samples**, before they are
resampled - a hit is over in hundredths of a second. Tyres cannot make the
forces of a hit, so a hit is measured against the lap's own car:

- **Its grip `G`**: the 99th percentile of its horizontal acceleration
  `√(lat² + long²)` over the lap, on the ground and faster than 5 m/s. Without
  acceleration channels (or under 3 m/s²), 15 m/s² - a road car's grip.
- **Threshold**: `max(1.8 G, G + 18, 30)` m/s².
- **Struck sample**: the horizontal acceleration above the threshold *and*
  jumping more than half of `G` from the previous sample; **or** the speed
  falling, within 0.1 s, by more than the threshold would take in 0.1 s plus
  1.5 m/s. Only on the ground and settled, and only when the car was faster
  than 5 m/s.
- Struck samples within **0.4 s** are one impact.
- **Before / after**: the highest speed in the 0.15 s before; the lowest until
  0.3 s after the last struck sample.
- **Not an impact**: speed gone with no force behind it - the peak horizontal
  acceleration within 0.1 s under the larger of `G` and 25 m/s² - is the game
  rewinding or resetting the car.
- **Crash** when it took **30 km/h** or more, or left the car under half its
  speed; **hit** otherwise - a knock, a scrape along a wall.
- **Direction**: the longitudinal acceleration larger than the lateral, and
  negative: *head-on*; positive: *from behind*; the lateral larger: *along its
  side*. Without accelerations, head-on.

What a car can do is measured with every impact left out, from 0.1 s before
it to 1 s after it (`struckMask`).

## The Car control section

For the focused lap, whatever the laps carry - with no tyre slip and no
drift angle it shows what is still found rather than nothing (below).

**The table**: one row per kind that either lap shows - Locked wheels,
Wheelspin, Rear stepping out (oversteer and spins), Pushing wide, Crashes,
Hits, ABS acting, Traction control acting, Handbrake, In the air - each cell
"count · seconds", for the focused lap and the lap it is compared with; and
*Most drift angle* when there is a drift angle (the largest on the ground).

**The list**: its unshared faults that cost at least 0.02 s, costliest first,
at most 12, each with its title and cost (and the chip of its kind). Click
one to read its tip, line the cars up 40 m before it and replay it. **Also
what both laps did there** adds every fault, shared ones included (chip
"both did it", cost "—" under 0.01 s). With none: "Nothing X did with the
tyres cost it time that Y did not do too."

**The hint under it** says what the detection could see with - "From each
wheel's slip and slip angle, and the car's drift angle." (or slip and slip
angle, slip and drift angle, slip only, or "From the car's drift angle only -
these laps carry no tyre slip.") - the ground the limits were measured for
(tarmac, loose, mixed: over 80% loose samples is loose, under 20% tarmac),
which lap the events were laid against, and how the cost is counted.

With **no tyre slip and no drift angle** (an FH Companion lap file without its
telemetry) the table and list are shown all the same, and the hint says what
was still found from what the laps carry: "These laps carry no tyre slip and no
drift angle, so locks and wheelspin cannot be told. Still found: pushes, from
the steering against the path; hits and crashes, from the speed and
acceleration." - slides from the yaw rate are named too where the laps have
one, pushes only where they have steering. The sentence on the slip and drift
limits is left out, and a second hint says: "For Forza Horizon, pick the
`.tele.gz` file beside each FH Companion lap too: it is the full telemetry,
every wheel's slip 64 times a second."

The lap's **total** control cost (used in summaries) counts overlapping
faults - a lock and the slide it starts, within 40 m - once, at the
costliest of the cluster.

## The texts

Each event is said naming both laps, with where (metres along the
reference), the speed it began at, how far past the limit against the other
lap, and a tip. The tip follows from the kind and what was measured:

| Event | Tip |
|---|---|
| lock, fronts only | a locked front cannot steer: less pressure at the top of the zone, bleed it off into the turn |
| lock, rears only | a locked rear lets the car rotate: brake more in a straight line, ease off turning in; move the bias forwards if it keeps happening |
| lock, loose ground | a locked wheel ploughs on: squeeze to just short of locking |
| lock, otherwise | too much pedal for the grip: squeeze more progressively |
| wheelspin | feed the throttle in as the steering unwinds, short-shift where traction-limited (on loose ground: a higher gear softens the torque) |
| spin / oversteer | by the pedal: under braking (trail-braking too hard, a downshift too early), lifted (lift-off oversteer: hold a steady throttle), on the throttle (too much while still turned), neither (turned in too fast); "caught with opposite lock" when countersteered; on loose ground or in a rally, "some angle is the fast way round - the other run's was enough" |
| understeer | more lock does nothing once the front has gone: arrive slower, trail a little brake to load the front, unwind; on loose ground, turn the car with a lift or a left-foot dab |
| hit / crash | along the side: a metre of margin costs less than the scrape; from behind: another car or sliding backwards; a crash head-on: brake earlier; a knock at the front: clipped something. "X hit there too." when shared |

In Trackmania (game name), a slide also says: below about **400 km/h**
(**300** on loose ground: dirt, grass, plastic) a slide gives less drive than
gripping; above, a speedslide at the right angle gains, and this one cost
time so its angle was off.

## What each source allows

| Laps carry | Locks / wheelspin | Oversteer / spin | Understeer |
|---|---|---|---|
| per-wheel slip ratio and slip angle, car velocity (Forza Data Out, the AC games) | from slip | from drift angle, or rear slip angle | from slip angles |
| wheel speeds, world velocity (rally games, BeamNG) | from derived slip | from derived drift angle | from steering per curvature |
| yaw and yaw rate, no slip (iRacing) | - | from the drift angle (the fitted yaw against the direction of travel); from the attitude velocity with countersteer only when the yaw cannot be trusted | from steering per curvature |
| heading only | - | from heading vs. travel | from steering per curvature |
| FH Companion lap file alone (no yaw, no slip) | - | - | from steering per curvature (it has steering and accelerations) |

Hits and crashes need only speed (better with accelerations), so every
source has them. The **Car control** section shows what each source allows:
with an FH Companion lap file alone, its pushes from the steering and its hits,
and the hint to load the `.tele.gz` for the rest.
