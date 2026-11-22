---
title: Hit analysis (Vehicles tab)
parent: Replay
nav_order: 4
---

# Hit analysis

The **Vehicles** tab shows where one tank, ship or soldier was hit, and by whom. Use it to see which side of a tank gets shot, or which enemy does the damage.

## Try it

1. Load a match that has hits (see the table below for which games give them).
2. Open the **Vehicles** tab at the top.
3. Under **Vehicle**, pick a unit, for example a tank type. The number in brackets is how many hits it took.
4. Read the figure: each mark is a hit, placed where it struck.
5. Open **Who hit it** to see the shooters, weapons or shooter vehicles, with hits, damage, kills and distance.

![The Vehicles tab: a demo tank with hit marks, and Who hit it open](assets/img/en/hit-analysis-tank.webp)

If nothing is loaded, or the data has no hits on vehicles, the tab says what is missing and which converter to use.

```
        shooter ----> o  hit mark on the figure
        shooter ----> o
  [ tank figure ]
```

The figure shows the hits where the data gives a point or a body part. The breakdown (who hit it, with what, how hard, from how far) works for every source.

## What each source gives

| Source | Point on the unit | Shooter | Weapon | Damage / outcome |
|---|---|---|---|---|
| War Thunder | yes, in the unit's frame, with the shot's way | yes | the shooter's vehicle | critical, severe, modules destroyed, killing shot |
| Gunner, HEAT, PC! (the Watcher's recorder mod) | yes, in the unit's frame, with the shot's way, the plate, the impact angle and speed | yes | the round (name, kind, calibre) | penetration or not, ricochet, crew and parts knocked out, fires, killing shot |
| CS2 | body part (hitgroup) | yes | yes | damage, armour, health left |
| World of Tanks | yes (component box, entry and exit) | yes | - | damage or none (bounce, no penetration) |
| World of Warships | yes, in the ship's frame | yes | hit type | - |
| Squad | vehicles: yes - the impact placed in the vehicle's frame from its own position and heading | no (the data names none) | the damage type | the fall of the vehicle's health at that moment, destroyed |
| Squad soldiers | no: the hit results (bone and impact point) are kept raw by the converter; rows `impact` with `hitBone` are read as soon as it writes them | | | wounds and deaths only |
| Arma (OCAP, the Arma 3 recorder) | no: OCAP records who hit or killed whom, with what, from how far, not where | yes | yes | hit or kill, distance |
| Tacview ACMI | yes where a weapon object ends within 30 m of a unit (not its launcher): its last place in the unit's frame (heading, pitch, roll), coming the way it flew | the weapon's `Parent` | the weapon's name, or a Timeout's AmmoType | Timeout's Outcome, falls of `Health`, `Destroyed`; without a weapon, a kill or damage without a point |
| IL-2 telemetry (Watcher) | yes: `hit` / `damage` events carry the point in the player's own aircraft frame (taken as x forward, y up, z right) | no | no | the force |
| Dota 2 | no: the combat log has no place on a hero | the attacking unit | the ability or item (none: an attack) | damage, the hero's death |
| Battlefield 6 (GameCapture) | no: the capture reads the kill feed (kills, deaths, headshot flag), not hits | | | |
| DCS / other Watcher live sources | no hit events beyond what their Tacview recordings hold | | | |

Where no hit of the unit has a point, the figure shows no marks and the **Who hit it** breakdown opens by itself: by shooter, weapon or the shooter's vehicle, each with its hits, damage and kills, and the median and farthest distance.

## Restrict to an area

The **Area** section limits the analysis to hits that happened in a place on the map.

1. Press **Draw box** or **Draw polygon**, and draw on the 3D ground or the tactical map.
2. Choose **Victim inside** (count a hit when the unit hit was in the area) or **Shooter inside** (when the one who fired was).
3. Press **Use them as filter**. The chips show "{n} of {total} hits in the area".
4. **Reset area** removes all areas.

Each area is a [volume](volumes.md), so the same shapes also filter the heatmap and the replay. An area can include or exclude (an excluding area leaves its hits out, shown as "{n} of {total} hits outside the area"). Each area shows as a chip with how many of the unit's hits were in it; the × on a chip removes it. The counts, the figure, the breakdown and the filter lists all follow.

A hit's places: the row it came from holds one party's (the victim's for a hurt or a struck, the shooter's for a shot); the other's is that unit's own sample nearest in time (within 5 s). A hit whose party's place is not known is left out while an area filters, and the panel says how many ("Left out, no known place").

## For developers

Any converter can add hits: a victim's row (`hit`, `impact`, `hurt`, `wounded`) with `hitBone` (a skeleton bone, an Arma selection, a Reforger hit zone - mapped to head, chest, stomach, arms and legs) or `hitLocalX/Y/Z` (metres, x forward, y up, z right), with `other` the shooter and `damage`.
