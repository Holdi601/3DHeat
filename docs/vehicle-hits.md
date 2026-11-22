---
title: Vehicle hits over many matches
parent: Replay
nav_order: 5
---

# Vehicle hits over many matches

The **hit analysis** in the **Vehicles** tab loads only the hits on vehicles from thousands of War Thunder matches - or DCS World recordings and IL-2 mission reports, aircraft included ([below](#dcs-world-and-il-2)) - and shows them on one vehicle's armour plates. Use it to see where a tank is weak, which shells go through at which angle and speed, and what a penetration usually does there. Hits on players and soldiers have their own analysis: [hits on people](person-hits.md).

## Try it

1. Open the **Vehicles** tab.
2. Open **Hits over many matches** and press **Open the hit analysis**.
3. Press **Folder…** (or **Files…**) and pick your War Thunder `.3dheat` matches. With the [Mass analysis](mass-analysis.md) open, **From Mass analysis** takes its War Thunder matches and its filter.
4. Watch the counts: files read, matches, hits, memory, seconds.
5. Pick a vehicle under **Vehicle hit**. Its plates take the colour of their penetration rate; the marks are single hits.
6. Point at a plate to read what struck it. Click a mark for its card; **Open the match at this moment** loads that match at the hit.

```
folder of .3dheat -> hit rows only -> worker (columns, a few dozen bytes a hit)
                                   -> one vehicle -> plates, marks, charts, tables
```

## What is loaded

Only the rows that are hits or that follow a hit are read: the `shot` rows, deaths, fires lit (`fire_on`) and modules lost (`module_destroyed`), with only the columns the analysis uses. With **Turret pose at each hit** on, the victims' own samples are read for their turret yaw and gun elevation as well (two more columns), so a hit on a turned turret lands on its plate at rest. Everything else in the files is never decoded into rows.

Each hit is kept as columns of small numbers and dictionary codes (about 60 bytes a hit): the vehicle hit and the shooter's vehicle, players, sides, the part struck, the point and the shell's way in the vehicle's frame, the turret pose, distance, height difference, calibre, shell type and name, the result, what followed, and the match (map, mode, start, game version, converter version, who won).

- The hits of each file are kept in the browser's cache by the file's name, size and time: a second load of the same files reads no table.
- The load stops at the memory ceiling (half the RAM budget the viewer detects, at most 3.5 GB) and says how many files it left unread.
- In the native app the core reads the files (the same Parquet reader the normal load uses); in a browser the viewer reads them in a pool of workers.

## Where each value comes from

Every value says where it came from: **recorded** (in the replay), **derived** (worked out from what it recorded) or **ballistic estimate**.

| Value | Source |
|---|---|
| Hit point, part struck | recorded (`hitLocalX/Y/Z`, `hitPart`) |
| Shell's way in the vehicle's frame | recorded (`hitDirX/Y/Z`) |
| Result: did not go through, went through, critical, killed | recorded (`hitOutcome`); ricochet is not in the data |
| Distance | derived: from the shooter's position at the hit to the hit point |
| Impact angle | derived: between the recorded shell's way and the plate's normal at the hit point, on the model pack's plate, the turret pose applied. Hits without a recorded way have no point either, so no plate angle |
| Armour along the way | derived: the plate's thickness over the cosine of the impact angle (capped at 85 degrees) |
| Descent | recorded where the shell's way is (in the vehicle's frame), else the ballistic arc's |
| Impact speed | ballistic estimate: the shell's muzzle speed (your install's range catalogue, else its kind's) less the drag over the distance. The replays carry the impact speed of penetrating hits, but the converter does not export it yet |
| Lethal, killing shot | derived: the vehicle died within 2.5 s by the hit's shooter (the last such hit is the killing shot), or the hit's own result says killed |
| Fire | derived: a fire listed on the vehicle within 0.12 s of the hit; its part names the component (engine, transmission, fuel tank) |
| Module destroyed | derived: a module lost within 0.6 s of the hit |
| Crew (driver, gunner, commander, loader) | not in today's data: the filters say so |

### The ballistic estimate

A shell is a point mass under gravity and quadratic drag. Flat fire (darts, tank guns over a few kilometres) has a closed form that is exact while the path stays shallow; a slow shell (a howitzer's, a mortar's, low-velocity HE or HEAT) is integrated step by step, and the launch elevation found that carries it to the hit point - the low arc, or the high one for indirect fire or where the low arc cannot reach. Guided missiles and rockets get no estimate.

## DCS World and IL-2

The same analysis reads a DCS World recording converted by the Tacview converter (`.3dheat`, [hits the converter works out](tacview-acmi.md#hits-the-converter-works-out)) and IL-2 Sturmovik mission reports (`missionReport(<date>)[<n>].txt`, written by a server or the game with `mission_text_log = 1` in its `startup.cfg`; the pieces of one mission are read as one). Aircraft are vehicles like any other: a model without armour plates shows its outer surface instead, an aircraft's cut into nose, fuselage, wings and tail, so hits on its parts can be told apart.

| Value | DCS World (Tacview recording) | IL-2 (mission report) |
|---|---|---|
| Weapon, shooter, unit hit | recorded: the weapon object's name; launcher and unit worked out by the converter | recorded (`AMMO`, `AID`, `TID`) |
| Calibre, type | derived from the weapon's name (a shell's id holds its calibre and type; missiles, rockets and bombs by public figures) | derived from the ammunition word (`BULLET_GER_792x57_SS`: 7.92 mm, ball) |
| Hit point | estimate: where the weapon's path passed nearest the unit, put on the model where its way in enters it | unknown: the report has none |
| Way in, impact angle | derived from the weapon's and the unit's motion and attitude; the angle against the model's surface | unknown |
| Impact speed | derived: the weapon's speed over its last samples | ballistic estimate where a distance is known, else unknown |
| Distance | derived: from where the weapon was first seen (its launch) to the hit | derived where both places were written within half a second of the hit, else unknown |
| Damage | not in the recording | recorded: the share of the unit's strength each hit took (`DMG`) |
| Lethal, killing shot | derived: the unit's death the converter worked out, by the hit's shooter | recorded kills (`AType 4`), tied to the shooter's last hit |
| Crew | a bail-out: an ejection from the unit after a hit (derived) | the pilot or a gunner hit, a crew member killed (hits and kills on the aircraft's bots), a bail-out |
| Fire, modules, the part struck | not in the recording | not in the report |

A DCS World recording converted before the geometry columns gives the weapon, the shooter, the unit and the kills only; convert it again for the point, the way in, the speed and the distance. The DCS shells' muzzle speeds of your installation's range catalogue (`heat3d-dcs-maps ranges`) are used where a hit has no speed of its own.

## The view

| Control | What it does |
|---|---|
| **Vehicle hit** | The vehicle shown, most hit first |
| **This model / Same vehicle / Family** | One vehicle id; every id of the same real vehicle; its whole family (T-72, Leopard 2...) drawn on this model's plates by plate name |
| **Colour the plates by** | Penetration rate (diverging: blue below the vehicle's own rate or 50 %, red above), hits, penetrations that killed, lit a fire, hurt the crew, reached the ammunition, median angle, median speed (one hue, darker is less). Plates with fewer hits than **Fewest hits for a colour** stay dark grey |
| **Colour the marks by** | The result, or one effect (amber: the hit did it). Marks are sized by calibre; an even sample when there are more than **Marks drawn** |
| **Plate** | What struck the plate under the pointer: hits, penetration rate with its 95 % Wilson interval, impact speed and angle (mean, median), armour along the way, distance, calibres, and of the penetrations how many killed, lit a fire, reached the ammunition, hurt the crew, destroyed a module |
| **Compare** | Split the hits in two, A and B: the side of the vehicle hit, game version, converter version, shell kind or type, won or lost, map, mode. The plates show A's penetration rate minus B's; the plate card says both with a z score |
| **Charts** | Penetration rate over the impact angle, speed or distance (a line a shell kind or type), hits over the calibre (stacked by result). A plate picked or pointed at gives its own charts; a click on a bin filters to it |
| **Who and what** | The shooters' vehicles, shells and shell kinds: hits, penetration rate, kills, fires, median distance. A click filters to the row |

## Filters

Every filter applies to the plates, marks, charts and tables at once: result, shell type, shell, calibre, impact speed, impact angle, descent, distance, armour along the way, what the hit did (all of the effects ticked), the shooter's vehicle, class and nation, players or AI shooting, map, mode, battle rating (the vehicle hit's, for the match's difficulty), dates, game version, converter version, won or lost (the side of the vehicle hit), a shooter or a victim by player name, and one plate.

## Speed

Everything is counted in a worker; the page gets each plate's numbers, the marks and the charts, and draws the view's colours and marks in one frame and the panel in the next. `node tools/smoke-vehicle-hits.mjs` loads made-up matches through the panel, sets filters and a comparison, opens a mark's card and measures the frame times meanwhile (`VHITS_SET=<folder>` or `VHITS_LIST=<file>` for a local set of your own).

Measured on this project's test machine while other heavy jobs kept every core busy (real GPU, dev build):

| What | Result |
|---|---|
| 200 War Thunder ground matches read over the network | 259,000 hits in 20 MB, 301 s (64 million rows in the files; 2 files being rewritten at the time failed) |
| Frames while they loaded | p50 17.4 ms, p99 18.4 ms, one frame of 153 ms over 17,600 |
| A vehicle shown (5,178 hits, 34 plates, 1,500 marks) | answered in 27 ms |
| Seven filter and comparison changes | answered in 70 to 110 ms; frames p99 34 ms |
| The same three matches again (from the cache) | 2.0 s against 3.8 s |

## Dashboards

The hit analysis is a source of the [dashboards](dashboards.md): **Vehicle hits (many matches)**, the shown vehicle's hits that pass the panel's filters, one row a hit (an even sample past 400,000), with the fields `vehicle`, `attacker`, `attacker class`, `attacker nation`, `shell type`, `shell`, `shell kind`, `result`, `plate`, `map`, `mode`, `version`, `converter`, `shooter` and the numbers `angle`, `speed`, `descent`, `distance`, `effMm`, `calibre`, `damage` (per cent of the unit's strength, IL-2), `penetrated` (1, 0, or empty when the result is not known), `won` and one 0/1 column per effect (`lethal`, `killingShot`, `fire`, `crew`, `ammo`, `module`...).

Four starter dashboards (in the Vehicles tab's dashboard templates):

| Dashboard | What |
|---|---|
| **Threats to this vehicle** | hits, penetration rate, killing shots, median distance; the shooters' vehicles with hits, penetration rate, kills, crew hurt and fires; penetration rate by shell kind; killing shots by shell; distances |
| **Weak spots** | penetration rate by plate; each plate's hits, penetration rate, lethal, fire and ammunition shares and armour along the way |
| **Angles** | impact angle and armour along the way by result; the shells that still go through at 60 degrees or more, and where |
| **My shots** | pick yourself as the shooter: the enemies you hit, how often you went through, and which plates |

On those dashboards the rates are per hit (the share of all hits on the bar) with their 95 % Wilson interval, faint below five hits; the panel's plate card gives the penetration rate of the hits with a known result.

The link goes both ways: the starter dashboards drive the view, so picking a plate, a shooter's vehicle, a shell or a shell type there filters the plates and marks in the 3D view; a plate picked in the view (**Keep this plate picked**) filters the open dashboard.

## For developers

| File | What |
|---|---|
| `src/vehicle/mass/types.ts` | The hit columns, results, effect bits, value sources |
| `src/vehicle/mass/scan.ts` | One file's hits: the row filter, the columns, effects tied by life and time, the turret pose |
| `src/vehicle/mass/scanAcmi.ts`, `il2Report.ts` | A DCS World recording's hits (the converter's hit rows), an IL-2 mission report's |
| `src/vehicle/mass/ammo.ts` | A DCS World or IL-2 weapon's calibre, type and kind from its name |
| `src/vehicle/mass/ballistics.ts` | Flat fire in closed form, the integrated arc, the flight cache |
| `src/vehicle/mass/geometry.ts` | Plate normal, impact angle, armour along the way, the rest pose of a direction |
| `src/vehicle/mass/store.ts` | The worker's columns and dictionaries, the flights, each model's plates per hit |
| `src/vehicle/mass/analyze.ts` | Filters, plate statistics, colours, charts, top lists |
| `src/vehicle/mass/hitWorker.ts`, `scanWorker.ts` | The analysis worker and its pool of readers (with the cache) |
| `src/vehicle/mass/client.ts` | The page's side: load, catalogue entries, plates, views, colours, marks |
| `src/vehicle/mass/dashSource.ts` | The dashboards' source, the four starter dashboards, the link with the 3D model |
| `src/ui/vehicle/HitMassPanel.tsx` | The panel |

The converter fields that would replace estimates with recorded values (the impact speed, the shell's world direction, the damaged parts with the crew) are listed in the converter's own notes as proposals.
