---
title: Loading laps
parent: Race analysis
nav_order: 51
---

# Loading laps

Everything about getting laps into the Race tab: the buttons, every file
format and how it is read, folders that hold many courses, how cars are
named, the demo laps, and the lap list.

Code: [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts)
(`loadLapFiles`), [`src/race/adapters.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/adapters.ts),
[`src/race/ibt.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/ibt.ts),
[`src/race/carNames.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carNames.ts).

## The buttons

| Control | Does |
|---|---|
| **Load lap files…** | a file picker for `.json`, `.csv`, `.txt`, `.ibt` and `.gz` files, several at once |
| **Folder…** | a folder picker: every lap file in the folder and below it |
| **Demo laps** | three made-up laps of a made-up circuit (see [Demo laps](#demo-laps)) |
| **Clear** | removes every lap (shown once laps are loaded) |
| drop on the view | files and whole folders dropped on the 3D view are loaded the same way |

Laps are **added** to those loaded - unless they are of another named
course, in which case the loaded laps are cleared first (laps are compared
one course at a time). Files that cannot be read are listed under the
buttons, one line each; the others still load.

## File formats

The format is told from the content, not the file name.

| Format | Typical source | Read by |
|---|---|---|
| `heat3d-lap` JSON | `heat3d_capture telemetry --game ...` (Forza Horizon and Motorsport over Data Out, AC / ACC / AC EVO / AC Rally, EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4, Richard Burns Rally, BeamNG.drive) | `fromHeat3dLap` |
| FH Companion lap `.json` | FH Companion's lap library | `fromFhCompanion` |
| FH Companion telemetry `.json.tele.gz` | beside each FH Companion lap file | `readForzaTelemetry` |
| iRacing `.ibt` | iRacing's own telemetry files (logging on with Alt+L in the car) | `readIbt` |
| lap CSV | `heat3d_capture laps`, the Trackmania plugin, or any CSV with `x`, `z`, a time column and optionally a `lap` column | `fromCsv` |

How each game is recorded and what it sends is documented by the recorders:
[GameCapture: games](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md)
and [GameCapture: the lap format](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).
See also [Other racing games](other-games.md).

Every format ends up as one `LapTrace`: channels under canonical names
(`time`, `distance`, `x`, `y`, `z`, `speed`, `throttle`, `slipRatio.FL` ...,
see the [channel table](race-charts-and-hud.md#the-channel-table)), the car,
the lap time, whether it is a complete lap, and a `meta` block. For every
format, `time` and `distance` are shifted to start at 0, and where a source
has no `speed` it is worked out as distance over time from the neighbouring
samples.

### heat3d-lap JSON

A JSON object with `"format": "heat3d-lap"`. Read fields:

| Field | Use |
|---|---|
| `channels` | an object of arrays, one per channel, by canonical name; per-wheel channels as `name.FL`, `name.FR`, `name.RL`, `name.RR`. `time`, `x` and `z` are required |
| `car.carOrdinal`, `car.name`, `car.carClass`, `car.carPI`, `car.drivetrain` | the car: id, name, Forza class index (0 D, 1 C, 2 B, 3 A, 4 S1, 5 S2, 6 X), performance index, drivetrain code (0 FWD, 1 RWD, 2 AWD) |
| `lap.seconds` | the lap time; the last `time` value when absent |
| `lap.complete` | `false` marks a partial run; anything else is complete |
| `game`, `track` | names; `game` decides the discipline (see below) |
| `units.slipRatio` / `units.slipAngle` | how slip is scaled: a unit containing `raw` means `scaled`, `normalised` means `peak`, anything else `physical` |
| `meta` | `slip`, `surface`, `discipline` as given override the above |

Without a `distance` channel, distance is summed from the 3D positions.

### FH Companion lap files

A JSON object with a `Lap` object holding a `samples` array (one sample about
every 5 m). Fields mapped:

| FH Companion | Channel |
|---|---|
| `Metres`, `Seconds` | `distance`, `time` (shifted so the lap starts at 0) |
| `X`, `Y`, `Z` | `x`, `y`, `z` |
| `Speed`, `Throttle`, `Brake`, `Steer`, `Clutch`, `HandBrake`, `Gear` | the same, lower case |
| `LatG`, `LongG` | `latAcc`, `longAcc` (m/s², despite the name) |
| `Puddle` | `puddle` |

The car comes from `Lap.carOrdinal`, `Lap.carName` (newer files only),
`Class` (or `Lap.carClass` as a Forza class index), `Lap.performanceIndex`,
`Lap.drivetrain` and `Lap.peakKilowatts`; the time from `Lap.lapSeconds`; a
run with `EndedAtFinish: false` is partial. The game is `forza-horizon`.

These files carry no tyre data and no heading, so locks, wheelspin and slides
cannot be judged from them alone; pushes (from the steering against the path)
and hits and crashes still are. Pick the `.tele.gz` beside each one too for the
rest.

### FH Companion telemetry (`.json.tele.gz`)

Gzip-compressed JSON `{ version, columns, data }`: Forza's whole Data Out for
one lap, one row per packet, the game's own field names. Columns are looked
up by name, never by position. Format 2 keeps every packet (about 110 a
second against the game's 64 ticks); a row identical to the one before it in
everything but the recorder's own clock (`t`, `metres`) is dropped, so a lap
reads at the game's 64 rows a second. (The load button's tooltip says so: "for
every tyre's slip at 64 Hz".)

| Data Out field | Channel |
|---|---|
| `t`, `metres` | `time`, `distance` |
| `PositionX/Y/Z` | `x`, `y`, `z` |
| `Yaw`, `Pitch`, `Roll` | `yaw`, `pitch`, `roll` |
| `VelocityX/Y/Z` | `latVel`, `vertVel`, `longVel` (car frame: x right, y up, z forward) |
| `AccelerationX/Y/Z` | `latAcc`, `vertAcc`, `longAcc` |
| `AngularVelocityY` | `yawRate` |
| `Speed`, `CurrentEngineRpm`, `Gear`, `Power`, `Torque`, `Boost`, `Fuel` | `speed`, `rpm`, `gear`, `power`, `torque`, `boost`, `fuel` |
| `Accel`, `Brake`, `Clutch`, `HandBrake` | `throttle`, `brake`, `clutch`, `handbrake`, scaled from 0..255 to 0..1 |
| `Steer` | `steer`, scaled from -127..127 to -1..1 |
| `NormalizedSuspensionTravel<Wheel>` | `suspension.<W>` |
| `TireSlipRatio<Wheel>`, `TireSlipAngle<Wheel>`, `TireCombinedSlip<Wheel>` | `slipRatio.<W>`, `slipAngle.<W>`, `combinedSlip.<W>` |
| `TireTemp<Wheel>` | `tireTemp.<W>`, converted from Fahrenheit to °C |
| `WheelRotationSpeed<Wheel>`, `WheelInPuddle<Wheel>`, `WheelOnRumbleStrip<Wheel>`, `SurfaceRumble<Wheel>` | `wheelSpeed`, `puddle`, `rumble`, `surfaceRumble` per wheel |

`<Wheel>` is `FrontLeft`, `FrontRight`, `RearLeft`, `RearRight` →
`FL`, `FR`, `RL`, `RR`. Slip is marked `peak` (Forza's normalised slip: past
1 the tyre has let go).

**Pairing.** A lap file `<lap>.json` and `<lap>.json.tele.gz` picked or
dropped together (same path but for `.tele.gz`) become **one** lap: the
telemetry's channels, with the lap file's car, class, time, track and
partial flag. The telemetry file's own car name wins when it has one.
A `.tele.gz` alone still loads: format 2 files carry `car`
(`ordinal`, `name`, `class`, `pi`), `track` and `lapSeconds`; without those
the lap time is the telemetry's own duration and the car is unknown.

### iRacing `.ibt`

iRacing's telemetry file is read directly (in the browser, no conversion):
the 112-byte header, the 32-byte disk sub-header, the variable table (144
bytes a channel) and the session YAML.

- **Required channels:** `SessionTime`, `Lap`, `Lat`, `Lon`. Without them:
  "… has no SessionTime, Lap, Lat and Lon channels - is it an iRacing
  telemetry file?"
- **Positions:** latitude and longitude are laid out in metres on a plane
  tangent at the first non-zero fix (Earth radius 6 371 008.8 m): x east,
  z south, y the altitude (`Alt`) - so with the default camera heading north
  is up the screen. Not the track's own frame: an extracted course model
  would not line up.
- **Laps:** the session is split where `Lap` changes; a lap is kept when it
  has more than 60 samples, starts below 5% of `LapDistPct` and ends above
  95%. Partial laps are dropped. With none left: "… has no complete lap of
  the N km track" (track length from the YAML) or "… has no complete lap".
- **Distance:** `LapDist` from the lap's start, else summed from positions.
- **Car:** from `DriverInfo`: the player's `CarScreenName`, `CarID` (as the
  car number) and `CarClassShortName` (as the class). Track:
  `TrackDisplayName`, else `TrackName`.

Mapped channels:

| iRacing | Channel | Conversion |
|---|---|---|
| `Speed`, `Throttle`, `Brake`, `Gear`, `RPM` | same names | - |
| `Clutch` | `clutch` | `1 - v` (iRacing counts engagement; ours is the pedal) |
| `SteeringWheelAngle` | `steer` | `-v / SteeringWheelAngleMax` (radians anticlockwise to -1..1 right positive; max at least 0.1, π when absent) |
| `LatAccel`, `LongAccel`, `VertAccel` | `latAcc`, `longAcc`, `vertAcc` | - |
| `Yaw`, `Pitch`, `Roll`, `YawRate` | same, lower case | - |
| `BrakeABSactive` | `absActive` | - |
| `dcABS`, `dcTractionControl` | `absLevel`, `tcLevel` | - |
| `dcBrakeBias` | `brakeBias` | divided by 100 when above 1.5 |
| `dcPitSpeedLimiterToggle` | `pitLimiter` | - |
| `FuelLevel`, `WaterTemp`, `OilTemp` | `fuel`, `waterTemp`, `oilTemp` | - |
| `LFtempCM` ... | `tireTemp.FL` ... | carcass middle temperature |
| `LFshockDefl` ... | `suspensionM.FL` ... | damper deflection, m |
| `LFpressure` ... | `tirePressure.FL` ... | × 0.145038 (kPa to psi) |
| `LFwearM` ... | `tireWear.FL` ... | `1 - v` |

Wheel prefixes: `LF` → FL, `RF` → FR, `LR` → RL, `RR` → RR. **Every other**
channel with one value per sample (not of the bit-field type) is passed
through under its own name - per wheel when it starts with a wheel prefix
(`RRspeed` becomes `speed.RR`) - so the graphs and the cards' value lists
offer all of them. iRacing logs no tyre slip: car control is judged from the
drift angle - `Yaw`, fitted to the direction of travel, against where the car
goes - and the steering against the path. The yaw rate against the lateral
acceleration is used only when the heading cannot be fitted, so there is no
drift angle (see [Car control events](race-control-events.md)).

Errors: "… is too short to be an .ibt file", "… does not have an iRacing
telemetry header", "… has no position fixes".

### Lap CSV

One row per sample; many laps in one file are told apart by a `lap` column.
The delimiter is detected from the first five lines. An optional first line
`# { ...json... }` describes the run: `game`, `track`, `seconds`,
`complete`, `meta`, `car`.

| Column (case-insensitive) | Channel |
|---|---|
| `x`, `y`, `z` | position (`x` and `z` required) |
| `elapsed` or `time` | `time` (required per lap) |
| `metres` or `distance` | `distance` (else summed from positions) |
| `speed_ms` or `speed` | `speed` (m/s) |
| `throttle`, `brake`, `steer`, `gear`, `clutch`, `handbrake`, `puddle` | same |
| `lat_g`, `long_g` | `latAcc`, `longAcc` |
| any canonical channel name, e.g. `latVel`, `slipIndex.FL` | itself |
| `lap` | which lap a row belongs to |
| `lap_seconds`, `car`, `car_class`, `pi`, `course` | lap time, car number, class, PI, track (from each lap's first row) |

Without a description the game is taken as `forza-horizon` and every lap as
complete. A lap's source is shown as `<file> · <lap>` when the file holds
several. Errors: "… has no rows", "… has no x and z columns", "… has no laps
with a time column".

### Discipline and surface

What the analysis assumes about a lap, when the lap does not say
(`lap.ts`):

- **Discipline:** `meta.discipline`, else a game name matching
  `rally|wrc|dirt|rbr` is **rally**, `trackmania` is **arcade**, anything
  else **circuit**.
- **Surface:** `meta.surface`, else from the track name and source: a rally
  named `monte` is **mixed**; `snow|ice|winter|arctic|sweden` **snow**; the
  tarmac rallies (Spain/España/Catalunya/Costa Daurada, Croatia/Hrvatska,
  Central Europe, Germany/Deutschland, Japan, Corsica/Corse, Ypres, or the
  words tarmac/asphalt) **tarmac**; any name with
  `scramble|trail|cross country|dirt|gravel` **loose**; another rally stage
  is judged from how the car was driven: over the samples faster than
  12 m/s and on the ground (at least 200 of them), a 95th percentile of
  lateral acceleration of 10 m/s² or more together with a median drift angle
  under 6° (taken where the car cornered at 70% of that or more, at least 30
  samples) is tarmac; anything else, or too little to tell, is loose. A
  non-rally name with `rally` in it is loose; everything else tarmac.
- Per sample, a `loose` channel (Forza's surface rumble, Trackmania's
  materials, see [Car control events](race-control-events.md#the-ground))
  overrides the lap's surface.

## Folders and courses

**Folder…**, or a dropped folder, brings every file below it. Inside a
folder only files ending in `.json`, `.csv`, `.txt`, `.ibt` or `.tele.gz`
are considered, and a `.json` that is not a lap (a course's own file, its
map) is skipped without an error.

**Several courses in one pick.** FH Companion's lap library keeps each
course in a folder named `<course name> (course_<x>_<z>_to_<x>_<z>)` (or a
bare `course_...` for an unnamed course). When the picked files sit in more
than one such course folder, nothing is loaded; instead the **Laps** section
says "These are laps of N courses, and laps are compared one course at a
time. Pick one:" and lists each course with its lap count (files ending
`.json`, `.csv` or `.ibt`, `course.json` not counted), most laps first.
Clicking one loads that course's files.

A course is keyed by its name and its **start** point, not its end: runs
that never finished are kept by FH Companion under the same name and start
(in `unfinished/`) with where they stopped as the end, and they go with
their course - marked **partial** in the list.

**Several tracks among picked files.** When files picked directly (not from
course folders) are laps of more than one named track, the same choice is
offered per track; laps that name no track go along with whichever track is
picked.

## Car names

A lap is called by its car's whole name, as the game gives it. Where the lap
file does not name the car:

1. **The folder.** FH Companion's library keeps laps in
   `<course>/<class>/<car name> '<yy> (car<number>)/<tune>/<tag>/<lap>.json`.
   The innermost folder matching `<name> (car<number>)` gives the name and
   the number; one matching `car<number>` the number alone. Only folder picks
   and dropped folders carry this path.
2. **Another lap of the same car.** Once any lap names a car, every lap with
   the same game and car number is called that - the laps loaded together,
   and laps loaded later in this browser: the names are kept in
   `localStorage` under `heat3d.carNames` (keyed `<game>:<car number>`).
   In a private window they last as long as the laps.
3. Otherwise "car 1234" by its number, or "car".

**Labels.** In the lap list a lap shows its car name; several laps of the
same car are numbered "Name #1", "Name #2". The analysis' sentences use the
same labels when they are unique; otherwise the car name with the lap time,
"Name (1:29.616)", numbered further if still not unique.

**Grouping.** Laps belong to the same car (for envelopes, profiles and
comparisons) when their car number - or name when there is no number - and
their performance index are the same (`carKey`): the same model with a
different tune is a different car.

**Classes.** A lap's performance class is the game's (Forza D..X, iRacing's
car class short name); the statistics order them D, C, B, A, S1, S2, R, X,
then others alphabetically.

## Demo laps

**Demo laps** loads three laps of a made-up circuit (four straights and four
right-handers), made by a simple vehicle model
([`synthetic.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/synthetic.ts)):
each corner's grip-limited speed, an acceleration pass forwards and a
braking pass backwards, as a lap simulator does.

| Lap | Car | Faults |
|---|---|---|
| clean | Grip car | none |
| with mistakes | Grip car | brakes 35 m early into T2, gets on the throttle 30 m late out of T3, takes T4 at 0.88 of its speed, drives 1.2 m to one side |
| other car | Power car | none; drives 1.2 m to the other side |

| Car (number) | Grip | Braking | Traction | Power/mass | Drag |
|---|---|---|---|---|---|
| Grip car (9001) | 16 m/s² | 13 m/s² | 9 m/s² | 230 W/kg | 0.0009 /m |
| Power car (9002) | 12 m/s² | 11 m/s² | 7 m/s² | 380 W/kg | 0.0006 /m |

The lap with the mistakes is focused. The circuit is laid out the way
Forza keeps its world (left-handed), so - exactly as with a real Forza lap -
it comes out mirrored and the tab offers **Invert X**. All three laps carry
per-wheel data, so every part of the tab has something to show.

## The lap list

Each row, left to right:

| Element | Does |
|---|---|
| ● / ○ | shows / hides the lap (lines, car, card, charts); hidden laps are still analysed |
| colour stroke | the lap's colour |
| name and tags | click to **focus** the lap; hover for its source file and car (name · class PI · drivetrain) |
| ⌖ | chase this car with the camera (click again to stop) |
| ★ | compare everything against this lap (make it the reference); disabled on the reference |
| × | remove the lap |

**Tags:** *reference*; *best of X* (or *best of its class*) on the fastest
lap of a class when there are several classes; *partial* on a run that did
not reach the finish.

**The second line:** the class (only with several classes), the lap time
(`1:29.616`), the gap to the lap it is compared with (the best of its class,
or the reference) as `+0.512`, and *starts late* when the lap begins more
than 10 m after the reference's start.

With more than 8 laps a line "N of M drawn" offers **Show all** (draw every
lap: slower, and a tangle) and **Only those looked at** (the reference, the
focused lap and the best of its class; the statistics count every lap
either way).

Under the list: the mirror hint when the laps say the drawing is mirrored
(see [mirrored worlds](race-replay-and-scene.md#mirrored-worlds)), and with
two or more laps the hint "Click a lap to see where it loses time …", plus,
with several classes, that each lap is compared with the fastest of its own
class.

### Reference and focus

- **Reference:** the lap every other is aligned to and, by default, compared
  against. The fastest **complete** lap unless ★ picked another (the first
  loaded lap when none is complete). Removing the reference lap returns to
  the automatic choice.
- **Focus:** the lap whose findings, car control and maps are shown. It stays
  where the user put it; otherwise it is the **slowest** lap that is not the
  reference ("the most to learn"). Focusing a lap also un-hides it and the
  best lap of its class. Focusing the reference compares it with whichever
  other lap was quickest through each corner.
- **Classes:** with laps of several performance classes, each lap is compared
  with the fastest complete lap of its own class (the reference, in the
  reference's class). See [Course statistics](race-course-statistics.md).

### Colours

Every lap gets its own colour, by its position in the load order, so a
lap keeps its colour when others are hidden. The hues are spaced round the
colour wheel as the heatmap's team mode spaces groups; for each slot the
lightness (0.52 to 0.66 in OKLCH) and chroma (0.12 to 0.18) are picked to
stand furthest from the neighbouring slots (and the last from the first)
under normal, protan and deutan vision, each at least 3:1 against the dark
chart surface.
