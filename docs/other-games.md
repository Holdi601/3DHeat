---
title: Other racing games
parent: Race analysis
nav_order: 59
---

# Other racing games in the viewer

The viewer reads laps from many racing games, not just one. This page lists them and says how to get a lap out of each.

## The games

| Game | Recorder | Slip in the file? | World mirrored? | Notes |
|---|---|---|---|---|
| Forza Horizon 4/5/6, Forza Motorsport | `heat3d_capture telemetry` (Data Out over UDP), or FH Companion's lap files plus their `.tele.gz` | yes, per wheel (normalised) | yes (left-handed world) | the `.tele.gz` beside each FH Companion lap gives every wheel's slip; the lap file alone does not |
| Assetto Corsa, ACC, AC EVO, AC Rally | `heat3d_capture telemetry --game ac / acc / acevo / acrally` (shared memory): one session file with every lap; ACC and AC EVO also the other cars' positions | yes, per wheel | measured from the laps | also ABS and traction control acting, wheel loads, temperatures, sectors, pit and valid-lap flags |
| Assetto Corsa replays | `heat3d-ac convert <replay>` ([3DHeat Assetto Corsa](https://github.com/Holdi601/3DHeat-Ext-AssettoCorsa), the game's own `.acreplay` files) | no | measured from the laps | every car of the replay: position, speed, pedals, gear, rpm, wheel speeds and loads; the steering worked out from the front wheels |
| EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4 | `heat3d_capture telemetry --game wrc / dirtrally2 / dirtrally / dirt4` (UDP) | no, worked out from wheel speeds | measured from the laps | rally: loose ground and jumps are judged differently |
| Richard Burns Rally | `heat3d_capture telemetry --game rbr` (NGP UDP) | no | measured from the laps | no wheel speeds |
| BeamNG.drive | `heat3d_capture telemetry --game beamng` (a mod) | no, worked out from wheel speeds | measured from the laps | |
| Trackmania | the Openplanet plugin, `telemetry --game trackmania --install` | a slip coefficient per wheel | measured from the laps | arcade physics: slides are judged differently |
| iRacing | none: its own `.ibt` file | no (not logged); worked out from the yaw | no (GPS-based) | switch logging on in the car with Alt+L |

## How to record a lap

1. Pick your game in the table and set it up as the recorder's page for that game says (a setting in the game, a mod, or nothing at all for iRacing). The steps differ per game, so they are in the recorders' documents: [GameCapture: games](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md).
2. Start the recorder, then drive. It writes one file per lap (the Assetto Corsa games: one file per session, with every lap in it).
3. In the **Race analysis** tab press **Load lap files…** and pick two or more laps of the same course (see [Loading laps](race-loading-laps.md)).

For rally games the recorder gives one file per stage run, and for Forza the easiest start is FH Companion's library with its `.tele.gz` files beside the lap files.

## What the recorders document

How each game is recorded, what it sends, the sources for its layouts, and which courses can be exported from its files is the recorders' to document: [GameCapture: games](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md) (public, in [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture)), and the lap file every recorder writes is [GameCapture: the lap format](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).

## What the viewer does with them

Every game ends up as `heat3d-lap`
files (or a lap CSV, or is read directly, as iRacing's `.ibt` is), with the
canonical channel names of `src/race/schema.ts` and a `meta` block saying what
its numbers mean - how its slip is scaled, circuit or rally or arcade, the
surface when known - so the **Race analysis** tab treats them all alike. When no course
model is loaded the **Race analysis** tab draws a road from the laps' own spread, so every
game is usable without one.

What none of the rally games sends - tyre slip - the viewer works out: from
each wheel's contact patch or surface speed against the car's speed where a
game sends one (`(wheel - car) / car`), from its rotation and a rolling radius
measured on the lap itself where it sends rotation only. The drift angle comes
from the car's own velocity (Forza, the AC games, Trackmania, RBR), from the
world velocity projected onto the car's axes (EA WRC, DiRT, BeamNG), or from
the heading against the path. Whether the car is in the air comes from its
wheels' contact, loads or suspension. See `src/race/derive.ts`.

Where a game's world is left-handed - Forza's is - the course comes out
mirrored in the viewer; the laps' own steering and suspension give it away and
the **Race analysis** tab offers to invert an axis. Games whose handedness is undocumented
(RBR, BeamNG, Trackmania) are handled the same way: measured, not assumed.

Beyond the driving channels, the recorders keep what each game adds: the AC
games' ABS and traction control acting, brake bias, DRS, pit limiter, boost and
brake pad and disc life; iRacing's aid settings, brake bias, fuel, oil and
water temperatures, and every other channel it logs under its own name. The
viewer draws them from its channel table - lamps, levels, glyphs, graphs - so
recording more needs no change to the viewer.
