---
title: Hits on people over many matches
parent: Replay
nav_order: 6
---

# Hits on people over many matches

The **person-hit analysis** in the **Vehicles** tab loads only the hits on players and soldiers from a folder of matches - Counter-Strike 2, VALORANT, Arma 3 (OCAP), Rainbow Six Siege and Squad - and shows them on a body: where the hits land, how much damage they do over distance and angle, what the armour worn kept off, which weapons and ammunition did it, and how often a hit killed. It is the [vehicle-hit analysis](vehicle-hits.md) for people.

## Try it

1. Open the **Vehicles** tab.
2. Open **Hits on people over many matches** and press **Open the person-hit analysis**.
3. Press **Folder…** (or **Files…**) and pick the matches. Every game's files can be mixed in one load.
4. Watch the counts: files read, matches, hits, memory, seconds.
5. The body takes the colour of the metric picked under **Colour the body by**; point at a region to read its numbers, drag to turn the body, or press **Front**, **Side**, **Back**.

```
folder of matches -> hit rows only -> worker (columns, about 140 bytes a hit)
                                   -> regions, charts, top lists, dashboards
```

## What is read

| Game | Files | Rows read |
|---|---|---|
| Counter-Strike 2 | the match tables the CS2 tool writes (`<match>.parquet`) | `hurt` rows (one per hit the game reports), the `kill` rows and the players' `position` samples |
| VALORANT | Riot's esports game data, one `.json` or `.json.gz` per map | `damageEvent`, the snapshots (health, shields, places, facing, speed), the rounds decided |
| Arma 3 | OCAP recordings (`.json`, `.json.gz`) | `hit` and `killed` events on units, the units' places and bearings |
| Rainbow Six Siege | the r6-replay converter's `.3dheat` | `kill` and `death` rows and the operators' samples |
| Squad | the squad-demo converter's table | `wounded` and `death` rows |

The sidecars of a table (events, props, strings, packets, entities) and match documents are skipped. Each file's hits are kept in the browser's cache by the file's name, size and time, so a second load reads no table. The load stops at the memory ceiling (half the RAM budget the viewer detects, at most 3.5 GB) and says how many files it left unread.

## Where each value comes from

Every value carries its source, hit by hit: **recorded** (in the data), **derived** (worked out from what it recorded), **estimate**, or **not known**. **Where the values come from** in the panel gives, per game, the share of the hits shown with each source.

| Value | Counter-Strike 2 | VALORANT | Arma 3 (OCAP) | Rainbow Six Siege | Squad |
|---|---|---|---|---|---|
| Where on the body | recorded: the event's hit group (head, chest, stomach, arms, legs; `generic` for grenades and fire) | recorded: head, body or legs (`GENERAL` for abilities) | not in the recording | recorded for kills: headshot or not | not in the table |
| Damage (health) | recorded: health lost; `dmg_health` before the cap | derived: the recorded hit less the shield's share | not in the recording | not in the replay | recorded where the converter writes the soldier's damage record (squad-demo 0.2.0), else not known |
| Armour kept off | derived: twice the armour lost (the game's armour bonus of 0.5) | derived: the shield takes two thirds of each hit until it is gone (checked on the snapshots) | not known | not known | Squad has no armour |
| Armour worn | recorded: armour before the hit, the helmet (kevlar, kevlar + helmet, none) | derived: the shield before the hit and the most the player had that round (light, heavy, regen) | estimate: OCAP keeps no loadout; where the unit's role is the display name of one of the game's soldiers on that side (`Rifleman`), that soldier's default vest and helmet from your install's catalogue (`heat3d-arma3-maps catalog` 0.4.0); a mission's own role names (`2IC`, `GPMG`) and mod units stay not known | not known (the operator is recorded, its rating is not in the replay) | - |
| Weapon | recorded | recorded (newer files); derived from what the shooter held at the snapshot before (older files) | recorded, with the magazine | recorded, with its class | recorded where written |
| Calibre, ammunition type | estimate: the real weapon's cartridge (CS2's files give damage, armour ratio and range modifier, not a calibre) | not known (fictional weapons) | derived: from the magazine's name (`5.56 mm AP`, `7N10`), or from the ammunition the magazine loads where your install's catalogue lists it (`6.5 mm 30Rnd STANAG Mag`: `B_65x39_Caseless`, 6.5 mm) | not known | not known |
| Distance | recorded for kills (the game's own); derived from the players' places for other hits | derived: both players' places (5 a second in newer files, else once a second) | recorded | derived: the killer's place on the kill row, the victim's on the death row | not known |
| Angle against the victim's facing | derived: the victim's facing and the shooter's place written on the hit (CS2 tool 1.2.0); in older tables the shot's traced way in the victim's frame (the event's own view angles, within 1.3 degrees of the former for nine hits in ten), else the samples | derived: the victim's view and the shooter's place | derived: the victim's bearing and the shooter's place at that frame | derived: the victim's last sample | not known |
| Through a wall | recorded for kills (`penetrated`, the game's own; it wins for the killing hit); derived for every other hit: the shot traced through the map by the CS2 tool (1.3.0: `wallbang`, with the solid objects passed, their thickness in all, their materials and the fences or grates crossed); not known where the tool could not trace (no map geometry, grenades, fire, falls) and in older tables | recorded (newer files: `wallPen`) | not known | not known | not known |
| Killed | recorded: health reached 0 | recorded: `killEvent` | recorded: `killed`; a hit and the kill of the same shooter on the same unit within a frame are one hit | recorded (every row is a kill) | recorded: a wound and the death after it are one hit |
| Victim's and shooter's movement | derived: speed from the samples; crouched, airborne, walking, scoped from the samples | derived: speed from the snapshots | derived: speed from the places | not known | recorded: the victim's speed |
| Won | recorded: the victim's side won the round | recorded: the round's winning team | recorded where the mission's end names a side | recorded | not known |

Hits on one's own side are left out unless **Hits on one's own side too** is ticked.

## The view

| Control | What it does |
|---|---|
| **Figure** | The generic figure (seven regions), or a CS2 agent from your local model pack: its seven hit groups are the game's own capsules (`dm:head`, `dm:chest`...) |
| **Colour the body by** | Share of the hits that say where they landed, damage per hit, kill rate, armour kept off per hit |
| **Auto / Regions / Zones** | Regions (head, chest, stomach, arms, legs) where the data says them; zones (head, body, legs) for data that only says those (VALORANT). Auto picks zones when most hits only name a zone |
| **The body** table | Each region's hits, share (with its 95 % Wilson interval on hover), damage, kill rate (with its interval) and armour kept off; a click picks a region, **Only hits on** filters to it |
| **Marks** | The hit points on the body where the data has them (CS2's traced points): white did not kill, red killed. A click on a mark opens **The hit**: who hit whom, the weapon, where, the damage, the armour, the distance, through a wall (for CS2: "yes (2 surfaces: wood_panel, concrete, 14 cm) - traced through the map", or recorded by the game on a kill), smoke, killed, the match and round |
| **Charts** | Damage over distance a weapon (the whole hit - health plus what armour kept off - of body hits, so the mix of headshots does not move the line), headshot share over distance a weapon class (with Wilson intervals), what each armour kept off and let through per hit, hits over distance (killed, did not, not known) |
| **Who and what** | Weapons, armour worn, ammunition, agents or operators, shooters, players hit: hits, damage, head share, kill rate, median distance. A click filters to the row |

## Filters

Game, map, weapon class, weapon, ammunition type, ammunition, calibre, armour worn, helmet, distance, angle from the front, from where (front under 45 degrees, side, back over 135), through a wall (recorded or traced), the material a traced shot passed (any of them), the wall thickness it passed (cm), killed, won or lost (the victim's side), the victim's side, agent or operator, the victim's and the shooter's state, the player hit, the shooter, one region.

## Dashboards

The analysis is a source of the [dashboards](dashboards.md): **Person hits (many matches)**, the hits that pass the panel's filters, one row a hit (an even sample past 400,000), with the fields `game`, `map`, `weapon`, `weapon class`, `ammo`, `ammo type`, `armour`, `victim`, `shooter`, `side`, `shooter side`, `role`, `victim state`, `shooter state`, `region`, `zone`, `from`, `material passed` (a traced shot's materials, in order) and the numbers `distance`, `angle`, `elevation`, `damage`, `damageRaw`, `whole` (health plus armour kept off), `armorDamage`, `absorbed`, `armorBefore`, `calibre`, `victimSpeed`, `shooterSpeed`, `kill`, `headshot`, `penetrated`, `helmet`, `won` (1, 0, or empty when not known), `wallCount`, `wallThickness` (cm), `wallGrates` (empty when not traced) and `round`.

Four starter dashboards (in the Vehicles tab's dashboard templates):

| Dashboard | What |
|---|---|
| **Weapon falloff** | the whole hit over distance a weapon, the headshot share over distance, each weapon's hits, damage, head share, kill rate and distance |
| **Armour effectiveness** | what each armour kept off and let through per hit, the kill rate by armour, armour by zone |
| **Where do I get hit** | pick yourself as the player hit: your regions, from where, your state when hit, who hit you, by map |
| **Wallbangs** | the share of hits through a wall (non-lethal CS2 hits too, where traced), by weapon and over distance, what those hits did, the wall thickness passed, and a table and chart by material passed |

Rates are per hit with their 95 % Wilson interval, faint below five hits. A weapon, armour, region, player or map picked on a dashboard filters the body view.

## Speed

Everything is counted in a worker; the page gets each region's numbers, the marks and the charts. The panel's heavy parts render from deferred values and mount over several frames, so a progress message or an answer never holds a frame. `node tools/smoke-person-hits.mjs` writes made-up CS2, VALORANT and OCAP files, loads them through the panel, sets filters, reads the dashboard rows and measures the frame times meanwhile (`PHITS_LIST=<file>` for a local set of your own).

Measured on this project's test machine (real GPU, dev build):

| What | Result |
|---|---|
| 12 made-up matches (5,069 hits) | read in 1.0 s; frames p99 18 ms, max 26 ms |
| Six filter and colour changes | answered in 25 to 32 ms; frames p99 17.5 ms |
| 66 real matches of five games (47,196 hits; CS2 tables of 60-90 MB each) | read in 41 s by the test runner in one thread; every count checked against the raw rows |

## What the converters could add

| Converter | Adds | State |
|---|---|---|
| CS2 tool 1.2.0 | the victim's facing and the shooter's place and side on every `hurt` row | done; tables converted before keep working, convert again for exact angles |
| squad-demo 0.2.0 | the soldier's last damage record on `wounded` and `death` rows (damage, damage type, the shooter, the weapon) | proposed |
| arma3-maps 0.4.0 (catalogue) | ammunition (hit value, penetration factor, typical speed), magazines, vests', helmets' and uniforms' armour per hit point, soldiers with their default gear | done: calibre for catalogued magazines, the role's default armour as an estimate; the armour per hit stays an estimate until a recorder writes loadouts |
| CS2 tool 1.3.0 | whether a non-lethal hit went through a wall: the game's `player_hurt` does not say it; the tool traces the shot through the map's collision mesh, with the bullet-passing surfaces (fences, grates) kept apart (`wallbang`, `wallCount`, `wallThickness`, `wallSurfaces`, `wallGrates`) | done in the viewer; tables converted before keep working (not known on non-lethal hits), convert again for the traced answer |

## For developers

| File | What |
|---|---|
| `src/person/types.ts` | The hit columns, hit groups, regions and zones, value sources, the block builder |
| `src/person/readCs2.ts`, `readValorant.ts`, `readOcap.ts`, `readR6.ts`, `readSquad.ts` | One game's hits from its columns or document (pure; tested on made-up data) |
| `src/person/weapons.ts` | Weapon classes, calibres and ammunition types per game; OCAP magazine names |
| `src/person/armaGear.ts` | Arma 3's magazines, ammunition, vests, helmets and soldiers from the install's catalogue (`/__heat3d/catalog-facts/arma3` on the dev and preview servers) |
| `src/person/scan.ts`, `table.ts` | One file: which game, only the rows and columns needed |
| `src/person/store.ts`, `analyze.ts` | The worker's columns; filters, region statistics, charts, top lists, coverage |
| `src/person/worker.ts`, `scanWorker.ts` | The analysis worker and its pool of readers (with the cache) |
| `src/person/client.ts` | The page's side: load, views, rows, the hit picked |
| `src/person/card.ts` | The hit card's words: through a wall, what the traced shot passed, where the answer came from |
| `src/person/body.ts` | The generic figure, a pack model's hit groups, the 2D drawing |
| `src/person/dashSource.ts` | The dashboards' source and the four starter dashboards |
| `src/ui/vehicle/PersonHitPanel.tsx`, `PersonBodyView.tsx` | The panel and the body over the view |
