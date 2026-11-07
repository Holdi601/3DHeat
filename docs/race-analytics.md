---
title: "Race analytics: the method"
parent: Race analysis
nav_order: 58
---

# Race analytics: how two laps are compared, and why

This is the method behind the viewer's **Race** tab: what it measures, how it
decides where time went, and how it turns that into advice. It is the
specification the analysis code (`src/race/`) follows, so every rule here has a
counterpart there and a test that pins it.

## What the professional tools do

The established tools converge on the same core, and differ mainly in how far
they go towards *causes*:

- **Everything is compared by distance, not time.** Two laps are resampled onto
  one distance axis; the running difference in elapsed time at the same distance
  is the *delta* (MoTeC calls it time variance, others the time slip or delta
  trace). Its slope says where time is being lost right now: a shallow slope is
  acceleration, drag or sustained grip; a steep one a braking or throttle
  difference; an up-and-down wave a trade between entry speed and exit.
  ([MoTeC i2](https://www.motec.com.au/i2/i2highlights/),
  [section time analysis](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html),
  [lap-delta-analyzer](https://github.com/taishiliu25/lap-delta-analyzer))
- **Every corner is split into phases**: braking, entry, middle, exit - brake
  point, peak brake and release, minimum speed and where it happens, gear,
  throttle pickup, return to full throttle, exit speed.
  ([Driver61: six phases](https://driver61.com/uni/corner-phases/),
  [iRacing lap analysis guide](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php))
- **Mini-sectors per corner, and a theoretical best** stitched from the
  quickest of each. ([Sim Racing Telemetry](https://docs.simracingtelemetry.com/manual/session-laps),
  [Overcut](https://overcut.gg/))
- **The driven line is compared too**, but never on its own: "a line on an
  image means nothing until you know the contributing factors" - it is read
  against the speed trace and the delta.
  ([Track Titan: how to analyse telemetry](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing),
  [Sim Racing Telemetry: racing lines](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines))
- **Root cause, not symptom.** Is the loss on the straight really the throttle,
  or did a bad entry force a late throttle? Mistakes are ranked by lap-time
  cost and explained in plain language.
  ([Track Titan coaching flows](https://www.tracktitan.io/post/november-2025-update-coaching-flows))

### What went wrong in the first version, and why it matters

The first version charged every *phase* separately and only ever looked at
losses. A lap that braked earlier lost time in the braking phase, and was told
to brake later - even when that earlier braking got the car turned sooner, on
the power sooner and out of the corner faster, and won it all back down the
straight. On a pair of recorded laps it told the lap that did that to "brake
66 m later", when the other lap - which did brake later - had missed the apex, run
wide and lost exactly what it had gained. The time data said the two ways
through were level; the advice said the opposite.

The fix is the rule every source above agrees on: **a corner is judged whole**,
from the braking zone for it to the braking zone for the next one, because
"sometimes trading off a few milliseconds on a corner may improve the overall
lap time by allowing faster segments afterwards"
([Biasing the driving style of an artificial race driver](https://arxiv.org/abs/2504.12744)).

## Racing knowledge the rules encode

**Exit speed matters more than entry speed**, and more the longer the
following straight: "time spent on straights dominates time spent in corners",
and a speed deficit at the exit is carried to the next braking point. The
quickest way through a corner-and-straight is often to corner more slowly so the
throttle comes earlier - *slow in, fast out*.
([Race & Track Driving: sequence for improving lap time](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/),
[Driver61: prioritising corners](https://driver61.com/uni/prioritising-corners/))
A minimum-time planner that is also rewarded for exit speed moves its apexes
later and gets a *faster* lap; the reward that balances the two is worth
`L / v²` per unit of exit speed for a straight of length `L` at speed `v` - the
time a speed difference costs down a straight grows with its length and falls
with the square of the speed
([arXiv 2504.12744](https://arxiv.org/abs/2504.12744)).

**Corners by what they lead onto.** One onto a straight: maximise exit speed,
late apex, back to power as soon as possible. One at the end of a straight:
maximise the speed carried into it, brake as late as possible, an earlier apex
is acceptable. One between corners: compromised for the one that matters after
it. A corner that could be either is treated as one onto a straight. Faster
corners weigh more: at speed a car accelerates weakly and a lost km/h is not
won back.
([Allen Berg: three types of corners](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/),
[Driver61: prioritising corners](https://driver61.com/uni/prioritising-corners/),
[Driver61: different corners, different techniques](https://driver61.com/uni/different-corner-technique/))

**The friction circle.** A tyre has one budget of grip, spent on braking,
cornering and accelerating in any mix; total acceleration is
`sqrt(lat² + long²)`. Trail braking follows the edge of it: brake released as
steering and lateral load build.
([friction circle](https://www.yourdatadriven.com/friction-circle-introduction/),
[g-g diagram](https://trailbrake.com/data-analysis-tips/gg-diagram/))

**Coasting** - neither pedal down - is the slowest way to lose speed, and a
measured key performance indicator in its own right.
([Racecar Engineering / OptimumG: coast factor](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf))

**Slip.** Longitudinal force peaks at a slip ratio of about 10-20%, then falls;
past it the wheel locks under braking or spins under power. Forza reports slip
normalised: 0 is full grip, a magnitude above 1 is grip lost.
([longitudinal slip](https://www.sciencedirect.com/topics/engineering/longitudinal-slip),
[Forza Data Out](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation))

**Understeer and oversteer.** Front slip angle larger than rear is understeer;
rear larger than front oversteer. Without slip angles: the car turns less than
its steering asks for (the steering above the Ackermann angle `L/R` a car needs
at low speed).
([understeer, overview](https://www.sciencedirect.com/topics/engineering/understeer),
[Understeer and oversteer](https://en.wikipedia.org/wiki/Understeer_and_oversteer))

## The geometry of a line

The speed a car can hold on a radius `R` is `v = sqrt(a R)`, with `a` the
lateral acceleration its tyres give (plus what downforce adds, which grows with
`v²`). So **speed grows with the square root of the radius**: a line through
the middle on a 20% larger radius is about 10% faster there.
([maximum cornering speed](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html),
[formula1-dictionary: cornering](https://www.formula1-dictionary.net/cornering_tech.html))

**The geometric line** is the largest arc through a corner: from the outside
edge, touching the inside at the apex, back to the outside. For a corner
turning through `θ` on a road `w` wide (less the car's width), an arc tangent to
both outside edges and touching the inside corner has
`R = w / (1 - cos(θ/2))` (plus the inside edge's own radius) - for a right
angle about `3.4 w`, for a hairpin `w`. That is why using the width matters
most in medium corners and least in hairpins.
([Racing line](https://en.wikipedia.org/wiki/Racing_line))

**The late apex** turns in later and deeper, on a tighter radius at first, and
opens the radius on the way out: slower through the middle, straight sooner,
flat sooner - "a slightly lower minimum speed but a stronger acceleration
profile on exit". **The early apex** is the reverse: faster in, and a radius
that tightens on the way out and holds the throttle back - largely a mistake,
except on very low grip, where speed lost in cannot be made up out.
([Racing line](https://en.wikipedia.org/wiki/Racing_line),
[Racing telemetry vocabulary](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/),
[math on the racing line](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/))

**The "V" and the "U".** The U is the classic round line: the widest radius,
the least steering change. The V turns in earlier, goes deeper, rotates the car
quickly in the middle and lines the exit for a straighter run out: braking
stays straight (so it can be later), the minimum speed is lower but reached
later, full throttle comes much earlier.
([Track Titan: the V-line](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide))

**Curvature against distance.** The fastest line is a compromise between the
shortest path and the least curved one; on a racetrack's width the curvature
matters more, and a minimum-curvature line comes close to the minimum-time line
wherever the car is at its limit - it parts from it where the car could
accelerate.
([Global minimum-time trajectory planning](https://www.nature.com/articles/s41598-025-21211-2),
[TUM global race trajectory optimisation](https://github.com/TUMFTM/global_racetrajectory_optimization))

**Bends in a row** - a double apex, a chicane - are one problem: the exit line
of one is the entry line of the next, and they are driven backwards from the
one that leads onto a straight.
([Driver61: different corners, different techniques](https://driver61.com/uni/different-corner-technique/))

## Which line suits which car

What decides it is the car's **power against its grip** at that corner's
speeds - "momentum is grip versus power, a ratio thing".
([Ross Bentley: momentum cars](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/),
[momentum over horsepower](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/))

| Car, at this corner | Line | Why |
|---|---|---|
| Accelerates hard for its grip ("point and shoot") | V: brake straight and late, rotate in a short tight middle, straight and flat early | the time is won by full throttle, not by the minimum speed |
| Accelerates weakly for its grip ("momentum") | wide U, slightly late apex, keep the minimum speed up | it cannot win back speed it scrubs |
| In between | slow in, fast out: late-apex U | the classic compromise |
| Fast corner, and more so with downforce | U, close to the geometric line | acceleration is weak at speed; downforce grip grows with `v²`, so speed through the middle pays twice |
| Very low grip (wet, snow) | earlier apex | speed lost in cannot be made up out |
| Power far beyond grip | the line matters less | traction, not the line, limits the exit |

"The faster the corner, the closer to the geometric line; the slower, the more
you alter it with a later apex."
([Skip Barber: Going Faster](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html),
[math on the racing line](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/),
[Track Titan: the V-line](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide),
[Driver61: grip](https://driver61.com/uni/grip/))

The drivetrain changes how the line is driven more than the line itself: a
front-driven car is rotated on the brakes (trail braking) and given power only
as the wheel unwinds, or it washes wide; a powerful rear-driven car has to be
straight before full throttle or the rear steps out; all-wheel drive can take
power while still turning, so it picks the throttle up earlier.
([FWD technique](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/),
[RWD vs FWD](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/),
[AWD vs RWD cornering](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/))

The viewer measures the car's power-to-grip ratio at each corner from its own
driving - full-throttle acceleration at the exit speed over lateral grip at the
minimum speed - and calls it "point and shoot" at 0.45 and above, "momentum" at
0.25 and below. A car whose grip at 150-250 km/h is more than 15% above its grip
at 55-110 km/h has downforce working.

## The method

### 1. One distance axis

The fastest lap is the reference, unless the user picks another. Its driven path
is the axis: every other lap's samples are projected onto it, giving each sample
a distance along the reference `s` and a signed lateral offset `d`. The
projection searches forward from the previous match only, so a lap that crosses
back over itself never jumps to the wrong side of a bridge. Laps are then
resampled onto one grid, every 2 m, for every channel. Each lap is carried the
last few metres at the speed it had, so its delta at the line is its lap time
difference.

### 2. Corners, and each corner's share of the lap

Corners come from the reference: a minimum of speed with enough prominence, or
a stretch of curvature tighter than 300 m radius where the speed barely dips.
Each corner owns the road half-way to the apexes either side. In it, each lap's
**slowest point** is a real dip in its speed - slower than 6 m either side, and
looking past the ends of the stretch, so the previous corner's exit still
accelerating into it is never mistaken for it; a lap that never slowed is
placed at the apex.

A lap **starts a corner** where it began to slow for it: back from its slowest
point through the braking or the lift that led to it, over short blips of full
throttle, until it had its foot down for 10 m (a throttle picked up again in the
last 30 m before the slowest point is still the corner's). A lap that never had
its foot down since the corner before starts at its fastest point in between.

The corner's **segment** runs from the first of all the laps to start it to the
start of the next one, so every lap's braking for it is inside it and the
segments tile the lap. Corners the reference never drives flat out between (less
than 40 m) are one **complex** - "T11-T12" - driven as one. On a circuit the
last segment runs on across the line to the first braking point.

What a corner leads onto is measured on the reference: metres at full throttle
before and after it. At least 200 m before and 120 m after: between two
straights. Otherwise at least 200 m after, or at least 120 m after and at least
as much as before: onto a straight. At least 200 m before only: after a
straight. Otherwise: a link.

### 3. The time account of a corner

For one lap against another, on the shared axis, `rel(s)` is how much longer
the lap has taken to reach `s`. Over a segment:

- **net** = `rel(end) - rel(start)`: the verdict. Closer than 0.03 s is level.
- **The split**: where inside the corner the lead turned - the biggest swing
  that the lap then gave back or won back, when both sides of it are at least
  0.04 s; otherwise the later of the two slowest points. **To the apex** is
  `rel(split) - rel(start)`, **after it** the rest. When the two have opposite
  signs, the lap *traded* one for the other.
- **After it** splits again where both laps are flat out: the **exit** before,
  the **straight** after.
- **The straight** splits into what the speed there explains, what the cars'
  pull explains, and how it was driven:
  - *Exit speed*, measured rather than modelled: the slower of the two cars
    passes through the faster one's starting speed a little way down the
    straight, and from there on its own trace is what it would have done from
    that speed - with its own gearing, drag and the road's slope in it. Shifted
    back to that point (and run on at its end speed for the metres it gains),
    it is the time from the faster start; the difference is the exit's cost.
    When the slower car never gets there, its own acceleration is put back as
    power (`a·v` held) from the faster speed.
  - *The cars' pull*: both cars from the same speed, flat out, integrating the
    full-throttle acceleration each has shown at each speed.
  - *How it was driven*: what is left - a lift, or speed scrubbed at full
    throttle (a slide, a kerb, contact) - said as whichever lap it went
    against.
  The exit speed never explains more than the straight cost, unless a lift or
  scrubbed speed took some back, which is then said.

Every segment's net adds up to the lap time difference (the tests check it),
and every corner's to-the-apex and after-it add up to its net.

### 4. The verdict, and the cause

| Pattern | Meaning | What is said |
|---|---|---|
| level, with a trade of 0.1 s or more | two ways through, same time | both ways described; with a straight after it, the slow-in-fast-out way is the one to build on - win the entry back by braking harder, not later |
| gained in, lost more out | **too fast in, slow out** | the exit's cause (below); give up some entry to get the car turned and flat sooner, with the other lap's brake and throttle points |
| lost in, gained less out | gave more away going in than the exit won back | the entry's cause (below); keep the exit, lose less going in |
| lost in, gained more out | **slow in, fast out paid off** (a gain) | keep it: here the exit is worth more |
| lost mostly in, or mostly out | one cause | the cause of that half |
| a lift on the straight | not flat out | where, and how long |
| the car explains 60% or more | the car | which part - pull, grip, brakes - and what the driver can still do |

A gain is said through what the other lap did wrong there, as that lap's to fix.

**Causes on the way in**, in order: a near-stop (slower than 60% of what even
this car's grip would allow where the other went through - a spin, contact or a
missed corner); a lock-up; a lift where the other stayed flat; braking where the
other only lifted; braking gently (the other braked clearly harder and this car
had grip to spare - braking gently is also why a lap brakes early); braking
early (in the same car, against the other's braking point; in another car,
against the distance this car needs at the deceleration it has shown); coasting;
understeer; then the **middle**, split by `v² = a R`:

- `ln(v_other / v_mine) = ½ ln(a_other / a_mine) + ½ ln(R_other / R_mine)`, with
  each lap's radius measured from its own path at its slowest point and its
  lateral acceleration `v² / R`. When the radius explains half or more, it was a
  **tighter line** ("use more of the road"); otherwise less lateral acceleration
  on a similar radius - the car's grip when it was at its limit and the other
  car holds more, or **grip to spare**.

and last, arriving slower (decided by the corner before and the car's pull).

**Causes on the way out**, in order: wheelspin; speed lost at full throttle
(over 25 km/h: more like contact than a slide); the throttle later - counted from
each lap's own slowest point, so a lap slowest later is not blamed for a later
throttle; a hesitant throttle (lifts after picking it up); running wide and
waiting for full throttle; full throttle later; oversteer; the car's drive. A
lap slower out only because it was slower through the middle has one mistake,
and its cause is the middle's.

### 5. The car against the driver

When the laps are in different cars, the loss the car explains is taken out, by
part:

- **pull**: the cars from the same speed down the straight, as above;
- **grip**: of the lower minimum speed not explained by a tighter radius, the
  share `½ ln(grip_other / grip_mine) / ln(v_other / v_mine)`, when the lap was
  at its car's limit (90% of what it has shown at that speed);
- **brakes**: from `u` down to `v` at deceleration `a1` against `a2`, ending at
  the same point, costs `(1/a1 - 1/a2)(u - v)² / 2u` - only when the lap braked
  about as hard as its car can over the zone on average, not just at a peak.

What a car can do comes from every loaded lap of it: lateral grip, braking and
full-throttle acceleration per 5 m/s speed bin (95th, 95th and 90th
percentiles). Grip is what the car **held for half a second** - the lateral
acceleration averaged over 0.5 s - not what a single sample touched: a kerb, a
slide snapping back, a car being caught all spike it for a moment, and a car
that does that often looked grippier than it is. (Checked against recorded
laps of two different cars: the per-sample measure put them close together;
held for half a second, it separates them the way their lap times do.)
Braking and pull take each sample as the median of itself and its neighbours.
The air, the settling after a landing, and every hit (section 6) until the car
has recovered are left out.

**What kind of car each is** (`profile.ts`): from the same laps,

- **grip held**: the 95th percentile of that half-second lateral acceleration;
- **pull** at full throttle to 50 km/h, 50-120, 120-200 and above 200, and the
  most it showed;
- **braking** from 60 to 160 km/h;
- **top speed**: where it stopped gaining at full throttle for a second on a
  straight - driven straight, not a long bend taken flat, where a car scrubs
  speed at any power. Where no straight was long enough, what it was still
  pulling at its fastest says how far off it was. No guess beyond what the laps
  show: a fit of power over speed against drag put a road car 100 km/h past its
  real top speed, since gearing and the limiter end a car's pull long before
  drag does;
- **losing the rear**: how many times a lap it slid past 10° of drift (20° on
  loose ground) with the wheel turned against the corner - caught with opposite
  lock - how many of those began on the throttle, and at what share of its grip
  they began. A car driven a little sideways on purpose is not losing anything;
  one that needs catching is. Counted the same for every car, so two cars can
  be compared;
- **balance**, where the laps carry slip angles: front against rear at the
  limit.

**Cars compared** puts the cars side by side - a table, a sentence each on what
the car is against the other ("X accelerates better, but cannot turn as hard,
needs longer to stop and loses the rear more easily"), each difference that is
clear (4% of grip, 5% of pull or braking, 4 km/h of top speed, a rear caught at
least once a lap more and half again as often), and how to drive each. With one
car, it says what that car is.

**In every corner**, when the laps are in different cars, the finding says what
of it the cars decide, and how to make the most of this one:

- **through the middle**: on the other car's line, this car's grip allows
  `v_other · √(grip_mine / grip_other)`. If the lap carried that, the gap is the
  car, and no braking point changes it - it is said, and the corner is put down
  to the car rather than to the driver; if it carried less, the rest is there to
  be had, and how much is said. Then where the time can be won instead: onto a
  straight, or in a car that pulls harder, after the apex - brake straight,
  turn in later, get it pointed at the exit early; otherwise, the widest radius
  the road allows, since a bigger radius is the only way to more speed without
  more grip;
- **a rear that let go** here, in a car that loses it more easily than the
  other: what to do in this car - the throttle fed in as the wheel unwinds, or
  the brake released gently with no lift mid-corner, by how its slides begin;
- **the straight after**: what the other car's stronger pull from the same
  speed took, and where this car ran out of pull on it;
- **an earlier braking point** in a car that stops less hard.

A lap that slid through the middle of a corner (past 10° of drift on tarmac)
was past its grip, not short of it: it is never told it had grip to spare there.
And where the car's rear has let go in this lap from less lateral acceleration
than the corner asked of it, "grip to spare" says to find it in small steps.

### 6. Car control: locks, wheelspin, slides and pushes, hits and crashes

Every lap is also read for how the car was handled - where a wheel locked,
where the driven wheels spun, where the rear stepped out, where the front
washed wide - because those are the mistakes that time alone does not name.
Three things make it hold across games and surfaces.

**Where grip ends is measured from the car's own driving.** Engineers set a
lock-up threshold per car at the slip that gave the most deceleration (the
MoTeC channels in OptimumG's braking series use -0.07 for one car), not at a
book value, and the book values disagree anyway: the force peaks at 5-20% slip
on tarmac depending on tyre and model, at 6% or at 20-60% on snow depending on
the source, and no source gives one for gravel. Games scale slip differently
again: Forza's is "normalised" so that past 1 grip is lost - yet recorded laps
show a car's brakes giving their best anywhere from 0.7 to 1.6 of it, and
ordinary braking zones running past 1. So for each car, over every loaded lap of it, the force it
made is binned against the slip it ran - deceleration against the wheels' slip
ratio under straight-line braking, acceleration (as a share of what the car
makes at that speed) against the driven wheels' slip, cornering grip (as a share
of the car's grip at that speed) against each axle's slip angle - and the limit
is the slip past the best where the force has fallen 8%. A curve that never
falls in the data - Forza Horizon's cornering and traction - has no limit, and
slip alone flags nothing there. With too little data, the limit is one and a
half times the nominal peak.

**The ground is known per sample**, where the game says: Forza rumbles the
tyres on gravel, dirt and grass (on recorded laps a few percent of the samples
on a tarmac circuit, a quarter to three quarters on dirt and cross-country
courses), Trackmania names the
material under each wheel, and a rally stage's ground is found as section 11
says. Curves, drift habits and thresholds are kept apart for tarmac and
loose ground.

**Every event is laid against the other lap over the same metres.** On
gravel, on snow, in a drift-heavy arcade racer, sliding is how a corner is
driven: optimal-control studies find "low-drift" solutions on tarmac and
"aggressive, high-drift, even counter-steering" ones off-road, rally data
shows tyres "well inside the non-linear region", and locking a wheel on very
loose ground can even stop the car sooner. So an event the other lap also made
- 80% of it or more - is how the corner is driven, not a mistake, and one it
did not make is a fault only if it cost time: the time lost from just before
it to 40 m after it. A fault that explains 40% or more of a corner's loss
becomes that corner's cause.

| Event | Detected by | Game-independent fallback |
|---|---|---|
| lock | a wheel's slip ratio past the car's braking limit while braking (not on the handbrake) | slip from wheel speed against car speed |
| wheelspin | a driven wheel's slip ratio past the car's traction limit on the throttle | the same |
| rear stepping out | the drift angle - between where the car points and where it goes - past the surface's floor (7 degrees tarmac, 15 loose) and past 1.5 times the upper quartile of what this car runs at the limit there; or the rear slip angle past its limit and more than 0.25 past the front | only without a drift angle: yaw rate beyond lateral acceleration over speed (the "attitude velocity"), with the steering against the turn |
| spin | the drift angle past 60 degrees | |
| pushing wide | the front slip angle past its limit and 0.3 past the rear | steering 1.6 times what the path needed - the car's own steering per unit of curvature, per speed band, measured where it corners at 30-60% of its grip: the deficit against the Ackermann angle that loggers' understeer channels use (AiM's Kus, Milliken) |
| ABS, TC acting; handbrake; in the air | the game's flags; the handbrake; no wheel on the ground, or none loaded, or all fully extended | |

The drift angle floors follow the literature: tyre slip angle peaks at 3-10
degrees on tarmac and a road car's body-slip stability limit is about 12
degrees on dry asphalt, while rally and drift driving run 30-50 degrees. A car
that runs more as a matter of course - an arcade tyre model, a gravel
specialist - has its own higher threshold from its own laps.

Each event says what the pedals were doing as it began - braking (trail
braking too hard, a downshift too early), lifted (lift-off oversteer), on the
throttle (power oversteer) - whether it was caught with opposite lock, which
wheels, how far past the limit against the other lap, and for a lock or a spin
the speed given away against what the car does at its limit there. The
advice follows from that: a locked front cannot steer, a locked rear lets the
car rotate, on loose ground a locked wheel ploughs; spinning wheels drive
nothing, short-shift on loose ground; a lift mid-corner lets the rear go. In
Trackmania a slide below about 400 km/h (300 on dirt, grass and plastic) gives
less drive than gripping; above, a speedslide at the right angle gains.

**Hits and crashes** (`impacts.ts`) are read from the lap's own samples, before
they are resampled - a hit is over in hundredths of a second. Tyres cannot make
the forces of a hit: a car does not lose 20 km/h in a tenth of a second, nor
pull three times its hardest cornering in one sample. So against the lap's own
car - its grip `G`, the 99th percentile of its horizontal acceleration - a
sample is struck where the horizontal acceleration jumps past
`max(1.8 G, G + 18, 30)` m/s², or where the speed falls over 0.1 s by more than
that deceleration would take and 1.5 m/s more. In the air and settling after a
landing nothing is judged (a landing spikes the accelerations without hitting
anything), and speed gone with no force at all is the game rewinding or
resetting the car. Struck samples within 0.4 s are one impact: a **crash** when
it took 30 km/h or half the car's speed, a **hit** otherwise - a knock, a scrape
along a wall - head-on, from behind or along a side by the direction of the
force. Its cost runs until the car has its speed back: the metres to regain it
at the car's own pull, 40 to 400. A hit or a crash that explains much of a
corner's loss is that corner's story, before the cars and before anything else
the time did. Checked against recorded laps: strikes on walls are found - an
acceleration far past any tyre's, most of the speed gone within a couple of
samples - and a rally stage's jumps and landings are not taken for hits.

In the view a burst marks every hit - red for a crash, amber for a hit - on a
post with a ring in its lap's colour, the focused lap's labelled with the speed
it took (click to replay it), and a car flashes as it hits.

### 6b. Many laps: the course's statistics

Load a course's whole folder - dozens of laps, several cars, several
performance classes - and the analysis judges every lap, and says over all of
them which mistakes are made where.

**Against the best of its own class.** A lap is compared corner by corner with
the fastest complete lap of its own performance class (the reference, in the
reference's class); that lap itself with whoever of its class was quickest
through each corner, or of every lap when it is alone in its class. A C-class
car's braking point against an S2 car's says nothing about the driving. The
time map, the gaps in the lap list and the corner table follow the same
comparison.

**A mistake** of a lap in a corner (`stats.ts`) is the driving cause the
analysis found for its loss there - braking too late, too early or too gently,
a lock, coasting, too slow through the middle, too tight a line, pushing wide,
late on the throttle, slower out, wheelspin, the rear stepping out, running
wide, speed scrubbed, a lift - when the corner cost it 0.05 s or more against
its comparison lap, and every lock, wheelspin, slide, push and spin it made
there that the other lap did not (costing 0.03 s or more), and every hit and
crash. One corner can hold several; each is counted once per lap and corner.
Its time is what the corner cost where it was the cause found, an event's own
cost otherwise. Gains, the car's share and a slower arrival decided in the
corner before are not mistakes. The two patterns of section 4 count as the cause
found inside them: a lap that gave more away going in than the exit won back as
its entry's cause (braking early, a lock, coasting, a slow middle ...), one too
fast in as braking too late where it braked later than the other, and otherwise
as its exit's cause.

**The statistics** count laps, not events: "12 of 40 laps braked too
early into T3, in 9 different cars - about 0.21 s each", with
the laps that did it, worst first, each a click from its replay. Over the
course, each kind of mistake: in how many of the laps, how often, about what it
cost, and in which corners most. Corner by corner: how many laps lost time
there against their class's best, all the time lost, and the mistakes made.
For every class or some.

**The mistake map** paints along the track how many of the laps made a mistake
at each metre - of every kind, or the one picked - wider and brighter where
more did, with each corner's most common mistake on the track. **Show in the
heatmap** hands the same to the heatmap: every lap's mistake at each point it
covers, at that lap's own position, grouped by the kind of mistake, with the
class, the corner and the cost to filter on.

**Dozens of laps** are analysed in a second or two. Drawing them all at once
is a tangle and slow, so once there are more than eight, only the reference,
the lap looked at and the best of its class are drawn (all are counted);
*Show all* draws the rest, with their lines thinned and their cars plainer.
The charts draw at most eight laps. A folder holding several courses' laps -
the whole lap library - offers each course to load on its own, and the laps
of a run that never finished (FH Companion's `unfinished/`) go with their
course, marked partial.

### 7. The driven line

For each lap and corner, from positions alone: where it began to turn (a fifth
of its tightest curvature), its tightest radius (over ±8 m), the average radius
over the first and the second half of its heading change, and so

- **shape**: tightest over average radius below 0.55 is a V, above 0.75 a U;
- **apex**: exit radius over entry radius above 1.25 is late, below 0.8 early;
- **speed apex**: its slowest point more than 15 m before the half-way point of
  its turn is slow in, fast out; more than 15 m after, still slowing past the
  middle.

Against the other lap: how far inside or outside it ran at turn-in, through the
tightest part and where both were flat, and where each turned in. Each finding
closes with the line that suits the lap's car at that corner - by what the corner
leads onto and the car's measured power-to-grip, downforce and drivetrain - and
whether the lap drove it. The "Corner by corner" table lists the quickest lap
through each corner with the shape of its line, and the best corners put
together.

### 8. Two maps

- **Where**: the course coloured by `dΔt/ds` against the reference, red where
  time is being lost and green where it is gained.
- **Why**: each loss drawn where its cause is, coloured by the cause's group -
  braking, entry, exit, straight, car - and wider for a costlier one.

### 9. Replay

One clock, three ways of turning it into each lap's own time: from the line,
lined up (every lap reaching one point of the track at the same moment, then let
go) and side by side (every lap held at the reference's distance).

### 10. Which way round the world is

The viewer's world is right-handed with Y up. A game with a left-handed world
(Forza among them) comes out mirrored in it: every right-hand bend drawn as a
left-hand one, course and laps alike. The laps say so themselves - positive
steering is to the right in every adapter, and the outside suspension of a turn
compresses - so the race tab offers to fix it, and **Camera & scene → Invert
world axis** does: X, Y or Z drawn reversed. Only the drawing changes - a
reflection folded into the view matrix; the camera flies in the drawn world, and
the data, the analysis and every coordinate the tools show stay the game's own.
The analysis names bends left or right by the same measurement.

### 11. Rally: the slide, the left foot, the air

A rally stage is not a circuit driven on worse grip. On gravel and snow the
slide is how a corner is taken: the car is turned on the way in by moving its
weight - "brakes move the weight of the car forward ... the front tires gain
grip, the back tires lose grip, and the car rotates sliding into the corner",
then back to the throttle once it is "lined up in the direction you want to
go" ([DirtFish: how to use the brakes](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)).
The left foot does the braking so the throttle and brake can be played
against each other, the handbrake turns the car in tight corners
([RallySport Ontario: rally driving, the basics](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/),
[Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)),
and the car leaves the ground. Section 6 already reads slides against the
other lap; these rules carry the rest.

- **The ground.** What the lap says (`meta.surface`, the rally recorders'
  `--surface`), else the event's name - the tarmac rallies (Spain, Croatia,
  Central Europe, Germany, Japan, Corsica, Ypres), the winter ones (snow), the
  Monte's tarmac with snow and ice on it (mixed) - else how the car was driven.
  A Rally2 car's lateral limit is 0.7-0.9 g on gravel and 1.3-1.4 g on tarmac
  ([grenzbereich, reference values](https://github.com/GitCrush/grenzbereich)),
  and on gravel it runs far more drift (section 6). So a stage where the car
  pulled 10 m/s² or more (95th percentile, at speed, on the ground) with a
  median drift under 6 degrees wherever it cornered within 70% of that was
  tarmac; anything else, or too little to tell, is loose.
- **What the car can do, on the ground it did it on.** Grip, braking and pull
  (section 5) are measured on tarmac and loose ground apart when the laps
  drove a fifth or more of their samples on each, and each corner is judged
  with the ground under the car at its slowest point. Samples in the air and
  for 0.3 s after a landing are left out of everything that measures the car
  - envelopes, tyre curves, locks and wheelspin: a landing jolts the car past
  anything its tyres can do, and wheels spun up in the air are not wheelspin.
  Downforce is not judged on loose ground, where a stage's fast and slow
  stretches are different roads.
- **A dab of the left foot is not braking.** A touch of the brake with the
  throttle still at half or more, over less than 15 m, settles the car or
  turns it; where a lap began to brake for a corner is the first brake under
  which the throttle came off, or that lasted longer.
- **The car turned on the way in.** For each lap and corner, the largest drift
  angle from its braking to 5 m past its slowest point. On loose ground, a lap
  that had the car turned 8 degrees or more less than the other (which turned
  it 12 or more) and got on the power or flat later **turned the car less**:
  the advice is to lift or dab the left-foot brake as it turns in so the rear
  comes round - with the other lap's handbrake point when it used one, or the
  handbrake in a corner slower than 54 km/h - and have it pointing at the exit
  before the apex. One that turned it 12 degrees or more beyond the other and
  still got on the power later **turned it too far**: it had to be
  straightened before the power could go down. Either is the corner's cause on
  the way out, after a car-control fault. The line advice on loose ground says
  the same for every corner.
- **The air.** A flight 0.2 s or more longer than the other lap's that cost time
  from 10 m before take-off to 40 m after the landing (or the end of the
  corner) is the cause when it explains 40% or more of the corner's loss, and
  the corner after it, reached slower, says so. In the air the car cannot turn,
  brake or drive. The advice keeps the throttle on at take-off - "not lift from
  the throttle during takeoff", which drops the nose - and takes the crest a
  touch slower or with a dab of the brake so the car stays low
  ([DirtFish: how to jump a rally car](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)).
- **Complexes of at most three bends.** A twisty section driven without ever
  being flat is not one long complex: past three bends a new one starts.

`src/race/rally.test.ts` holds the analysis to all of it on stages run by a
simple model: a car turned less and late on the power, a longer flight, left-foot
dabs, a twisty section, tarmac against gravel.

## Data, and what each source allows

| Source | Rate | Channels | Allows |
|---|---|---|---|
| FH Companion lap files | ~5 m | position, speed, throttle, brake, steer, lat/long acceleration, gear | everything except car control, which needs the telemetry beside them |
| FH Companion's `.tele.gz`, beside each lap file | the game's 64 Hz (a recorder keeping every packet writes ~110 a second; the repeats are dropped) | Forza's whole Data Out: per wheel slip ratio, slip angle, combined slip, rotation, suspension, surface rumble; the car-frame velocity; yaw rate | all of it, car control included |
| Forza Data Out, recorded by `heat3d_capture telemetry` | 60 Hz | all of the above, plus per wheel: tyre temperature, slip ratio, slip angle, combined slip, suspension travel, wheel speed, rumble strip; RPM, power, torque, yaw rate | all of it |
| Assetto Corsa, ACC, AC EVO, AC Rally (shared memory, `heat3d_capture telemetry --game ...`) | 60-333 Hz | a superset: tyre core and inner/middle/outer temperatures, pressures, brake temperatures, wheel loads, camber, slip ratio and angle; the car-frame velocity; ABS and TC acting (ACC, EVO, AC Rally) | all of it |
| iRacing `.ibt`, read directly | 60 Hz | position from GPS, pedals, steering, g, yaw, per wheel carcass temperature, damper deflection, pressure, wear | all of it; car control from the drift angle (its yaw against the direction of travel) and the steering, no slip (not logged) |
| EA SPORTS WRC, DiRT Rally 2.0 / 1 / DiRT 4 (UDP) | per frame; 100 Hz | position, world velocity and the car's axes, per wheel contact patch speed and suspension, pedals, steering, stage clock and length | all of it; slip and drift angle derived |
| Richard Burns Rally (NGP UDP) | per physics step | position, the car's own velocities, per wheel spring deflection and force, pedals | all of it except wheel slip |
| BeamNG.drive (the `heat3d` protocol mod) | up to 100 Hz | position, world velocity and axes, per wheel surface speed, rotation, load and ground contact | all of it; slip and drift angle derived |
| Trackmania (the Openplanet plugin) | per frame | position, front and side speed, pedals (brake on/off), steering, per wheel slip coefficient and loose ground, in the air | all of it; the drift angle from the side speed |

Every source is turned into one lap format, `heat3d-lap`, whose channels have
canonical names (`speed`, `throttle`, `tireTemp[FL]` ...). The car glyph and the
charts draw whatever channels a lap has.

## Sources

- [MoTeC i2](https://www.motec.com.au/i2/i2highlights/)
- [Speeding up your sections: time variance shapes](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html)
- [lap-delta-analyzer (distance-domain delta)](https://github.com/taishiliu25/lap-delta-analyzer)
- [iRacing lap analysis guide](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php)
- [Sim Racing Telemetry: session laps](https://docs.simracingtelemetry.com/manual/session-laps)
- [Sim Racing Telemetry: analysing racing lines](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines)
- [Overcut: theoretical best from sectors](https://overcut.gg/)
- [Track Titan: how to analyse telemetry](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing)
- [Racecar Engineering / OptimumG: braking analysis, lock-up and stability KPIs (Sep 2019)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-September.pdf)
- [Racecar Engineering / OptimumG: on the throttle (Jan 2020)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2020-January.pdf)
- [TUM: key performance indicators of race drivers (arXiv 2005.10044)](https://arxiv.org/pdf/2005.10044)
- [Tyre-road friction models and optimal slip (PMC9920324)](https://pmc.ncbi.nlm.nih.gov/articles/PMC9920324/)
- [TRB: tyre-pavement friction, slip at peak on snow and ice](https://onlinepubs.trb.org/Onlinepubs/sr/sr115/115-010.pdf)
- [hpwizard: tyre friction coefficients, peak and sliding](https://www.hpwizard.com/tire-friction-coefficient.html)
- [theracingline: longitudinal forces](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-longitudinal-forces/)
- [theracingline: lateral forces](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-lateral-forces/)
- [Vehicle stability, body-slip limits (arXiv 1104.1582)](https://arxiv.org/pdf/1104.1582)
- [Rally driving at high sideslip (Georgia Tech, IJVAS)](https://dcsl.gatech.edu/papers/ijvas09R.pdf)
- [Minimum-time rally manoeuvres (Georgia Tech, ISIE 2005)](https://dcsl.gatech.edu/papers/isie05a.pdf)
- [ESC reference yaw rate (arXiv 2305.18422)](https://arxiv.org/pdf/2305.18422)
- [Understeer and oversteer detection by steering against yaw (US10293852B2)](https://patents.google.com/patent/US10293852B2/en)
- [EDC: steering angle, Ackermann and the understeer gradient](https://edccorp.com/library/HveWpPdfs/WP2004-3.pdf)
- [AiM: math channels (Kus, combined g)](https://www.aim-sportline.com/download/software/doc/Math_Channels_101_eng.pdf)
- [Coach Dave Delta: oversteer and understeer widget](https://coachdaveacademy.com/documentation/how-to-use-the-oversteer-understeer-widget/)
- [Cadence braking: locking on very loose surfaces](https://en.wikipedia.org/wiki/Cadence_braking)
- [HP Academy: gravel rally data logging](https://www.hpacademy.com/forum/data-analysis-fundamentals/show/data-logging-in-gravel-rally-stages/)
- [DirtFish: how to use the brakes](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)
- [DirtFish: how to jump a rally car](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)
- [RallySport Ontario: rally driving, the basics](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/)
- [Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)
- [grenzbereich: rally vehicle dynamics, reference values](https://github.com/GitCrush/grenzbereich)
- [Trackmania speed-drift trainer plugin (constants)](https://github.com/SilasDo/Trackmania-Speed-Drift-Trainer-Plugin)
- [Trackmania speedslide write-up](https://github.com/TomashuTTTT7/TM-AlgoCrack/blob/main/cracks/speedslide_writeup.md)
- [Track Titan: coaching flows](https://www.tracktitan.io/post/november-2025-update-coaching-flows)
- [Track Titan: the V-line](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide)
- [Biasing the driving style of an artificial race driver (exit speed against minimum time)](https://arxiv.org/abs/2504.12744)
- [Race & Track Driving: sequence for improving lap time](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/)
- [Allen Berg Racing Schools: the three types of corners](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/)
- [Driver61: prioritising corners](https://driver61.com/uni/prioritising-corners/)
- [Driver61: different corners, different techniques](https://driver61.com/uni/different-corner-technique/)
- [Driver61: the six phases of a corner](https://driver61.com/uni/corner-phases/)
- [Driver61: grip](https://driver61.com/uni/grip/)
- [Skip Barber Racing School: Going Faster (excerpt)](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html)
- [Ross Bentley: what is a momentum car](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/)
- [The momentum over horsepower debate](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/)
- [Math on the racing line, part 2](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/)
- [RWD vs FWD, part 1](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/)
- [FWD technique](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/)
- [AWD vs RWD cornering](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/)
- [Racing line](https://en.wikipedia.org/wiki/Racing_line)
- [formula1-dictionary: cornering technique](https://www.formula1-dictionary.net/cornering_tech.html)
- [Maximum cornering speed](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html)
- [Racing telemetry vocabulary](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/)
- [Global minimum-time trajectory planning considering curvature and distance](https://www.nature.com/articles/s41598-025-21211-2)
- [TUM: global race trajectory optimisation](https://github.com/TUMFTM/global_racetrajectory_optimization)
- [Racecar Engineering / OptimumG: the coast factor](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf)
- [Friction circle introduction](https://www.yourdatadriven.com/friction-circle-introduction/)
- [Trailbrake.com: g-g diagram](https://trailbrake.com/data-analysis-tips/gg-diagram/)
- [Longitudinal slip](https://www.sciencedirect.com/topics/engineering/longitudinal-slip)
- [Understeer, an overview](https://www.sciencedirect.com/topics/engineering/understeer)
- [Understeer and oversteer](https://en.wikipedia.org/wiki/Understeer_and_oversteer)
- [Forza Motorsport Data Out documentation](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation)
- [hpwizard: traction-limited acceleration](https://hpwizard.com/accelerating-traction-limit.html)
- [hpwizard: power-limited acceleration](https://hpwizard.com/accelerating-power-limit.html)
- [AC EVO shared memory](https://github.com/albertowd/live-telemetry-evo/blob/develop/docs/SHARED_MEMORY.md)
- [AC Rally telemetry reader](https://github.com/LuizZak/AssettoCorsaRallyTelemetryReader)
- [iRacing IBT parsing](https://github.com/teamjorge/ibt)
