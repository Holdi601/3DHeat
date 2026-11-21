---
title: Arma recordings (OCAP)
nav_order: 23
---

# Arma recordings (OCAP)

3DHeat reads Arma mission recordings made with OCAP ("Operation Capture And Playback") directly: open the file, or a folder of them, as you would any table. Nothing is converted first, and the viewer keeps nothing of the file.

## Which files

| File | Written by |
|---|---|
| `.json`, `.json.gz` | OCAP and OCAP2 for Arma 3 (the server addon and extension), as their web player serves them |
| `.json.gz` with `extensionBuild` `reforger` | OCAP2's recorder for Arma Reforger (its receiver writes the same layout) |
| `.jsonl` | 3DHeat's own Arma Reforger recorder (the Watcher's Reforger mod) |

One recording is one mission. A folder opens all of them at once: in the **Source** panel as one heat over every mission, or in the **Mass analysis** tab, a match per recording.

A file that is JSON of another kind is skipped with a message saying it is no OCAP recording (an OCAP server's `operations.json` list, for example).

## What is read

Everything the recording holds:

- **Units** - players and AI - with their side, group, role, name, and whether a player played them; their position and facing at every captured frame; alive, unconscious or dead; the vehicle they sit in.
- **Vehicles** with their class (car, truck, APC, tank, helicopter, plane, boat, static weapon) and name, their crew, and their side (their crew's, or their last crew's when empty).
- **Events** where they happened: kills and hits with the weapon and the distance, on the victim and on the shooter; every shot with where it went; getting in and out of vehicles; players connecting and leaving; flags and zones taken; the mission's end; messages, tickets and counters.
- **Markers**, each as an object of its own, wherever it was put.
- **The mission**: its name, the world, the author, the date, the in-game clock, how long it ran, and the recorder's own fields.

A dead unit or wreck is kept once, where it died, not for the rest of the mission. A marker placed far off the map (more than 5 km beyond everything that moved) is left out, so it does not stretch the view over empty kilometres.

### Columns

The table has OCAP's own columns (`Time`, `Frame`, `X` east, `Y` north, `Z` height, `Object`, `Side`, `Heading`, `Vehicle`, `Type`, `Alive`, `Riding`, `Crew`, `Group`, `Role`, `Player`, `Shots`, `Event`, `Killer`, `Victim`, `Weapon`, `Distance`, `Mission`, `World`, `Recording`, `TargetX/Y/Z`, `Text`, `Color`, `Shape`, `GameDate`, `UTC` (the server's clock; not loaded by default, it changes every second), `TimeMultiplier`, `Info`) and these:

| Column | What it says |
|---|---|
| `Event` | the kind of event, a word a filter can list: `killed` and `hit` on the victim, `kill` and `hits` on the shooter, `fired`, `getin`, `getout`, `connected`, `disconnected`, `captured`, `marker`, `endMission` and the rest as OCAP names them |
| `Detail` | the event in full: `killed ← Smith (MX 6.5 mm, 212 m)` (not loaded by default: a long mission has more different ones than a filter can hold) |
| `Game` | Arma 3 or Arma Reforger |
| `Map` | the world as players know it: Everon for Reforger's `Eden`, Livonia for Arma 3's `Enoch` |
| `Faction` | the faction, where the recording names it; for the Reforger recorder, the stock faction its side stands for (US, USSR, FIA) |
| `Unit` | what a vehicle is, in words the figures know: the Reforger catalogue's id, or the real vehicle an Arma 3 vehicle is drawn from ("M2A4 Slammer" is a Merkava Mk.4) |
| `Won` | 1 on the side the mission's end names as the winner, 0 on the other fighting sides, empty when no winner is named |
| `Winner`, `EndReason` | the winning side and the end message |
| `Date`, `Duration` | when the recording began, and the seconds it covers |

The team is the side (`WEST`, `EAST`, `GUER`, `CIV`); the faction is a column of its own. The session is the mission and its date, so two evenings of the same mission stay apart.

`Won` feeds the [outcome](data-formats.md#outcome-columns) analysis: the Outcome lens and the won-versus-lost comparisons work on OCAP recordings like on any table with a winner. A recording whose end names no side (many older ones) has no `Won`. In the **Mass analysis** recordings are grouped by their map, not by their mission: a community's missions are mostly played once, and the Outcome lens needs fifty or more matches of a group to say anything.

## Coordinates and levels

Positions are the game's own metres from the map's south-west corner.

- **Arma 3**: north is up on the map, as in OCAP's own player.
- **Arma Reforger**: the recorder writes the engine's frame (x east, y up, z north); the reader turns it into east, north and height for the table and shows it in the engine's frame, the frame of the levels the Reforger extractor writes. Like those levels, it shows mirrored until **Invert world axis** (under **Camera & scene**) is on.

The level is picked by the world's name from the levels folder (the **Levels folder** list in the **Background / level** panel), by itself while no other level is loaded:

- Reforger worlds (Everon, Arland, Kolguyev) use the levels in the folder's `arma-reforger` section, named after the world's terrain (`Eden`, `Arland`, `Cain`) or after the island.
- Arma 3 worlds use the levels in the folder's `arma3` section, named after the world's config class as the recording gives it (`Altis`, `Stratis`, `Tanoa`, `Malden`, `Enoch` for Livonia, `VR`), in the frame OCAP uses (north up).
- A world with no level in the folder (a community terrain not extracted yet) shows without one, at its own heights, and the level panel says which world it is waiting for.

## Figures

Units and vehicles get their figures by what they are: a Reforger vehicle its own model from a Reforger model pack where one is installed, an Arma 3 vehicle another game's model of its real counterpart, always one of the same kind (a car is never drawn as an aircraft of the same name). Anything else gets its built-in figure by type.

## Tactics board

**Load mission…** on the tactics board takes an OCAP recording as well as a mission file: the board starts with every group where the recording first saw it, a layer per side, each group's leader's path as its route, and the markers as places.

## Limits

- The Reforger recorder of OCAP2 records only players and the vehicles they ride, names modded factions' units civilian, and records no shots or markers; 3DHeat cannot add what the file does not hold.
- A folder that mixes Arma 3 and Reforger recordings is shown in the frame of the first one.
- A recording is read whole before its rows: a long mission (hours, hundreds of units) holds over a gigabyte while it is read. The load plans for that, and the Mass analysis works out two recordings at a time; its summaries are kept, so a folder is worked out once.
