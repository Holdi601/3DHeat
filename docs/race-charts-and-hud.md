---
title: Charts and the HUD
parent: Race analysis
nav_order: 53
---

# Charts and the HUD

The distance charts under the view, the graph picker, and the car cards in
the top left of the view - and the one table, `CHANNELS`, that decides how
every channel is labelled, graphed and drawn.

Code: [`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx),
[`src/race/graphs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/graphs.ts),
[`src/ui/race/RaceHud.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHud.tsx),
[`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts).

## The charts

Every lap on one distance axis - metres along the reference (see
[one distance axis](race-corner-analysis.md#one-distance-axis)) - so the
same x is the same place on the track for every lap. One lap is charted on
its own (and plays back); a second of the same course is charted against it.
With no laps loaded (or when the analysis failed) the area says "Charts appear
once a lap is loaded; load another of the same course to compare the two."

### What is on them

- **The legend**: each charted lap's colour and label, the reference marked
  "(reference)"; "+N more drawn, not charted" when more laps are visible than
  are charted; **Graphs (N) ▾**; **Whole lap** while zoomed; a one-line hint.
- **Two strips** at the top, for the focused lap:
  - *time*: the [time map](race-replay-and-scene.md#time-map-where) as a
    strip, red losing, green gaining;
  - *cause*: each of its losses as a bar over where its cause is, in the
    cause colour; hover a bar for its title and cost.
- **Corner bands**: a shaded band from each corner's entry to its exit (as
  found on the reference) and its name (`T1` …) under the axis at the apex.
- **The selected finding**: a band in its cause colour over its range.
- **The rows** (graphs), one per chosen channel, each with its name and the
  top and bottom of its range on the left, a zero line where the range
  crosses zero. Each lap is a line in its colour: the focused lap 2 px wide
  and opaque, the reference opaque, the others 1.5 px at 75%. The gap row
  leaves the reference out (it is zero to itself).
- **The cursor**: a vertical line where the reference car is (or where the
  pointer is), and a dot per car on every row but the gap - at the cursor
  every car is at the same metre; otherwise each car's own distance at the
  replay clock.

At most **8** laps are charted: the focused lap, the best of its class and
the reference first, then the others in load order.

### Rows and their heights

The rows share the height of the chart by weight, none lower than 16 px:

| Row | Weight |
|---|---|
| Gap (to the reference, seconds, signed) | 1.7 |
| Speed (km/h) | 1.7 |
| a pedal (throttle, brake, clutch) | 1 |
| steering | 1.1 |
| gear | 0.8 |
| a lamp (handbrake, ABS …) | 0.55 |
| anything else | 1 |

A channel with a fixed display range in the table (pedals 0-100%) uses it;
others are fitted to the visible stretch of the laps. A row name too long for
the space (a long word in another language) moves the top value down a line
where the row is tall enough, and is cut with an ellipsis where it is not;
the full name is the tooltip.

### The default graphs

Until graphs are picked: the **gap**, then every channel the table marks
`graph` that the laps have - throttle, brake, clutch, handbrake, steering,
gear, speed - except that a pedal or lamp channel is left out unless some lap
moves it past 0.02 (a clutch that is never pressed is not a graph). Order is
the table's.

### The graph picker

**Graphs (N) ▾** opens a panel above the button:

- a filter box (matches a channel's name or id);
- **Defaults** (back to the default set; its tooltip says how many) and
  **Close**;
- *Gap to the reference*, then every channel the charted laps carry, grouped
  (motion, inputs, engine, aids, tyres, brakes, suspension, wheels, other,
  timing, position), a checkbox each; a per-wheel channel is one line with a
  chip per wheel (FL, FR, RL, RR).

Ticking keeps the table's order whatever the order of ticking. The choice
holds until **Defaults** or a reload. Channels the table does not know are
offered under *other*, named from their own id ("brakeLinePress" →
"Brake line press").

### Hover, wheel, zoom, click

| Input | Does |
|---|---|
| hover | every car, its card and its inputs move to that metre; a post marks it on the track; a table lists every charted lap's value on every row there (gap shown as "ref" for the reference); above the cards, "at N m - the charts' cursor". Moving off the plot hands back to the replay |
| wheel | steps the replay along the lap by 1/200 of the visible span per notch (Shift: 5×), pausing the replay; when zoomed, the view follows the cursor |
| Ctrl+wheel (Cmd+wheel) | zooms the distance axis about the pointer, 1.25× out / 0.8× in per notch, never narrower than 40 m; zooming out to the whole lap ends the zoom |
| sideways wheel | pans while zoomed (10% of the span per 100 units of scroll) |
| double-click, **Whole lap** | zoom out |
| click | jumps the replay to where the reference reaches that metre |
| Shift+click | lines the cars up there (see [lining up](race-replay-and-scene.md#lining-up)) |

The charts redraw in the current language when it changes.

## The car cards (HUD)

Top left of the view, a card per visible lap - at most **6**, the first six
visible laps in load order - for the moment the replay (or the charts'
cursor) is at.

**Header:** the lap's colour and label; the live gap - this lap's time to
reach its current distance minus the reference's time to reach the same
distance, "+0.48 s" - or "reference"; **⋯** to show or hide every other value
(the same as *All values on the cards*). The chased car's card is
highlighted.

**The car from above:** the body outline in the lap's colour with an arrow
at the front, four tyres (the fronts turned up to 28° with the steering),
each coloured by its temperature, with the same glyphs as the 3D car drawn
flat: slip ring, suspension bar, brake glow, wear band, load bar.

**Readouts:** speed in km/h, the lap's own time, its distance along the
reference.

**Inputs:**

- a steering wheel turned by the steering input (full lock drawn as 180°)
  with the percentage under it;
- a bar per pedal, left to right as in a pedal box - clutch, brake,
  throttle - each with its percentage and short name, in its colour (only
  pedals the lap carries);
- the gear (R for reverse, N for neutral);
- a small lamp per on/off channel the lap carries - handbrake, ABS, TC, DRS,
  pit limiter, in the air - lit in its colour while on (above half its
  range);
- a readout per level channel: brake bias, ABS and TC settings, boost, fuel.

**The input trace:** the last **6 seconds** of every pedal (one lane, each in
its colour) and the steering (its own lane, centred), ending at this moment
- what the driver did on the way into it. Up to 160 points.

**All values** (⋯ or *All values on the cards*): every other scalar the lap
carries at this moment, then every per-wheel channel as four values (FL FR
RL RR), named from the channel table or from the channel's own name, ordered
by group.

## The channel table

`CHANNELS` in [`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts)
is the one place a channel is described: its unit, whether it is one value
per sample or one per wheel (stored as `name.FL` …), its group, a display
range, how it is drawn on the car (`glyph`), how it appears on the card
(`input`: `pedal`, `steering`, `gear`, `lamp`, `level`), whether it is a
default graph, whether it steps rather than blends (gear, flags), and how it
is shown (scale, unit, digits). Labels and short names are messages in each
language (`race.channel.<name>.label` / `.short`).

Channels with a drawing or a default graph:

| Channel | Unit | Drawn as | Default graph |
|---|---|---|---|
| `throttle`, `brake`, `clutch` | 0..1 | pedal (green, red, …), shown in % | yes |
| `handbrake` | 0..1 | lamp | yes |
| `steer` | -1..1, right positive | steering wheel | yes |
| `gear` | - | gear | yes |
| `speed` | m/s, shown km/h | - | yes |
| `absActive`, `tcActive`, `drs`, `pitLimiter`, `airborne` | 0..1 | lamp | - |
| `brakeBias`, `absLevel`, `tcLevel`, `boost`, `fuel` | - | level readout | - |
| `tireTemp` (per wheel) | °C, display 40-130 | tyre colour | - |
| `tireTempInner/Middle/Outer` | °C | - | - |
| `slipRatio`, `slipAngle` (per wheel) | as the game scales it, display ±1.5 | slip ring | - |
| `combinedSlip`, `slipIndex` (per wheel) | display 0-1.5, 0-1 | slip ring | - |
| `suspension` (per wheel) | 0..1 | suspension bar | - |
| `brakeTemp` (per wheel) | °C, display 100-900 | brake glow | - |
| `tireWear` (per wheel) | 0..1 | wear band | - |
| `wheelLoad` (per wheel) | N, display 0-12 000 | load bar | - |

Others in the table (graphed and listed, not drawn): `latAcc`, `longAcc`,
`vertAcc`, `yaw`, `pitch`, `roll`, `yawRate`, `latVel`, `longVel`,
`vertVel`, `bodySlip` (drift angle), `loose`, `lateral` (offset from the
reference), `rpm`, `power`, `torque`, `waterTemp`, `oilTemp`,
`tirePressure`, `camber`, `padLife`, `discLife`, `suspensionM`,
`wheelSpeed`, `wheelSurfaceSpeed`, plus `time`, `distance`, `x`, `y`, `z`.

**A channel not in the table** is still read, graphed (under *other*) and
listed on the cards, labelled from its own name. **To give it a proper name,
unit and drawing**, add one entry to the table (and its label message to
each `src/i18n/locales/<language>/race-channels.json`). A new *kind* of wheel
drawing is one entry in `WHEEL_GLYPHS` (glyph.ts) and its flat twin
`CARD_GLYPHS` (RaceHud.tsx); both are typed by the kind, so the build fails
until both exist. `src/race/extensible.test.ts` checks that unknown channels
reach the graphs, that every glyph in the table can be drawn and that lamps
light.
