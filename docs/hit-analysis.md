---
title: Hit analysis
---

# Hit analysis

The **Vehicles** tab shows the hits a recording holds on one unit at a time: on its figure where the data gives a point or a body part, and as a breakdown (who hit it, with what, how hard, from how far) for every source.

## What each source gives

| Source | Point on the unit | Shooter | Weapon | Damage / outcome |
|---|---|---|---|---|
| War Thunder | yes, in the unit's frame, with the shot's way | yes | the shooter's vehicle | critical, severe, modules destroyed, killing shot |
| CS2 | body part (hitgroup) | yes | yes | damage, armour, health left |
| World of Tanks | yes (component box, entry and exit) | yes | - | damage or none (bounce, no penetration) |
| World of Warships | yes, in the ship's frame | yes | hit type | - |
| Squad | vehicles: yes - the impact placed in the vehicle's frame from its own position and heading | no (the demo's vehicle hit names none) | the damage type | the fall of the vehicle's health at that moment, destroyed |
| Squad soldiers | no: the hit results (`MulticastOnImpact`, an Unreal `FHitResult` with bone and impact point) are still kept raw by the converter; rows `impact` with `hitBone` are read as soon as it writes them | | | wounds and deaths only |
| Arma (OCAP, the Arma 3 recorder) | no: OCAP records who hit or killed whom, with what, from how far, not where | yes | yes | hit or kill, distance |
| Tacview ACMI | yes where a weapon object ends within 30 m of a unit (not its launcher): its last place in the unit's frame (heading, pitch, roll), coming the way it flew | the weapon's `Parent` | the weapon's name, or a Timeout's AmmoType | Timeout's Outcome, falls of `Health`, `Destroyed`; without a weapon, a kill or damage without a point |
| IL-2 telemetry (Watcher) | yes: `hit` / `damage` events carry the point in the player's own aircraft frame (taken as x forward, y up, z right) | no | no | the force |
| Dota 2 | no: the combat log has no place on a hero | the attacking unit | the ability or item (none: an attack) | damage, the hero's death |
| Battlefield 6 (GameCapture) | no: the capture reads the kill feed (kills, deaths, headshot flag), not hits | | | |
| DCS / other Watcher live sources | no hit events beyond what their Tacview recordings hold | | | |

Any converter can add hits: a victim's row (`hit`, `impact`, `hurt`, `wounded`) with `hitBone` (a skeleton bone, an Arma selection, a Reforger hit zone - mapped to head, chest, stomach, arms and legs) or `hitLocalX/Y/Z` (metres, x forward, y up, z right), with `other` the shooter and `damage`.

Where no hit of the unit has a point, the figure shows no marks and the **Who hit it** breakdown opens by itself: by shooter, weapon or the shooter's vehicle, each with its hits, damage and kills, and the median and farthest distance.

## Restricting to an area

**Area** in the panel draws a volume (a box or a polygon) on the level: the button takes you to the Match tab with the tool armed; draw on the 3D ground or the tactical map. The same volumes filter the heatmap and the replay ([volumes](filters-and-tools.md)); once their filter is on, the hit analysis counts only the hits whose **victim** (default) or **shooter** was inside when it struck. Each volume shows as a chip with how many of the unit's hits were in it; **Reset area** removes them all. The counts, the figure, the breakdown and the filter lists all follow.

A hit's places: the row it came from holds one party's (the victim's for a hurt or a struck, the shooter's for a shot); the other's is that unit's own sample nearest in time (within 5 s). A hit whose party's place is not known is left out while an area filters, and the panel says how many.
