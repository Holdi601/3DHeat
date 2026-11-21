---
title: Unit tasks
parent: Tactics board
nav_order: 2
---

# Unit tasks

A route says where a unit goes; a **task** says what it does on the way or where it stands: attack, defend, patrol, sweep an area, overwatch a sector, hold until a go-code, fly a CAP. Tasks run alongside the routes, the [keyframes](tactics-board.md#keyframes) and each other, and play back on the time slider.

## Giving a task

Select one unit, or several for a group task, and press `I` (or **Add task** under **Tasks**). Type to search by name or letters (`PTL`, `SBF`, `CAP`) and press `Enter`, or click one. Nine tasks have their own key: `Shift`+`1` attack, `2` defend, `3` patrol, `4` sweep, `5` overwatch, `6` suppress, `7` recon, `8` hold until, `9` CAP / orbit. Phase lines and rally points need no unit.

A task that needs points on the map starts drawing them at once: click them, then `Enter` (or `Esc`). A target or a sector's aim point takes one click, a CAP's racetrack two (one point is a circle), an area two (middle and edge: a circle) or more (a polygon). **Draw on the map** in the task's settings draws them again.

## When a task runs

- **For a time**: from **Start** for **Duration** seconds. Without a duration it runs to the plan's end; a patrol or a sweep with a number of times round lasts as long as those take.
- **On its route**: from one waypoint of the unit's route in a step to another. A task that moves the unit (patrol, sweep, orbit) and a hold run *at* the waypoint: the route waits there while they run, and the step lasts longer for it.

## The tasks

| Group | Tasks |
|---|---|
| Offense | Attack / assault, Seize, Secure / clear, Breach, Sweep / search and destroy, Ambush |
| Defense | Defend / hold, Block, Delay, Withdraw |
| Security and movement | Patrol, Screen, Guard, Recon / observe, Follow, Escort |
| Fires and effects | Overwatch / support by fire, Suppress, Smoke |
| Air | CAP / orbit, Close air support, SEAD / DEAD, Strike, Intercept |
| Control measures | Hold until, Phase line, Rally point, Weapons state, Alarm state, Game task |

**Legend** (`Shift`+`I`) shows every symbol. The symbols are drawn by the board in the manner of the NATO APP-6 / MIL-STD-2525 task graphics: a pictogram and the task's letters on a plate, in the side's colour.

## On the map and in playback

- Every unit wears a badge per task (up to three): bright while the task runs, faint while it is to come in the shown step. Badges keep their size on screen at any zoom.
- **Patrol** goes round its route (**Loop**, or **There and back**) for its duration or its times round, waiting **Wait at the start** seconds after each round, then goes back to where it started.
- **Sweep** makes its path inside the area at the unit's speed: **Lanes** (spaced by **Lane spacing**), an **Expanding square** from the middle, or a **Sector search** of three triangles.
- **CAP / orbit** flies its circle or racetrack at **Height above its point** and **Speed**, banked in the turns. Aircraft only.
- **Overwatch**, **Suppress**, **Recon**, **Screen**, **Guard** and **Defend** show their sector as a cone while they run: toward the task's point, at a set **Bearing**, or else where the unit's sensor (recon), turret or eyes point by their keyframes. Suppress pulses.
- **Follow**, **Escort** and **Intercept** keep the unit behind (escort: beside and behind) the unit picked, easing in and out.
- **Hold until** keeps the unit at its waypoint until a time, a **go-code** (named under **Go-codes**, with the time it is given), another unit reaching a waypoint, or another task starting or ending.
- Every speed is held to the unit's [top speed](tactics-speeds.md); a patrol given too little time is sped up to fit, up to that.

## What cannot work

A red warning badge on a unit, and the list under **Tasks**, say what cannot work: two tasks that both move a unit at once, a task that fires under **Weapons hold**, tasks that exclude each other (withdraw and attack), a task for the wrong kind of unit, a patrol that cannot finish its rounds in its time even at top speed, a hold whose trigger never comes (a go-code with no time, a trigger that waits for the hold itself), a time-window task that moves a unit while its route does too. Click a line to open that task.

## From mission files

[Mission files](tactics-board.md#mission-files) bring their tasks along, each for the whole group at its waypoint. DCS: Orbit (circle or racetrack, with its height and speed), Attack Group / Unit / Map Object and Strafing as attack, Bombing as strike, Fire at Point as suppress, Escort, Follow, Hold, FAC as recon, and the ROE and Alarm State options. Arma 3: SAD as a sweep, DESTROY as attack, GUARD, HOLD, SENTRY as screen, SUPPORT as overwatch, CYCLE as a patrol round the route, LOITER as an orbit, and each waypoint's combat mode and behaviour. Anything else comes in as a game task under its own name.

## Saving

Tasks and go-codes are saved in the plan file (version 3), on layers like routes; version 2 plans open with none. Every change to them is an operation of the board's [operation log](tactics-board.md), as everything else on the board is.
