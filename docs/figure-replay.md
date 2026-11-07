---
title: Figure replay and debrief
parent: Heat modes
nav_order: 9
---

# Figure replay and debrief

In [box replay](box-replay.md), **Figures instead of boxes** (on by default) draws each live person as the figure of what they are: a soldier on foot, the tank someone drives, the aircraft a Tacview track is, in the box's colour, at its place and heading, and for aircraft and missiles also its pitch and, where the data has a Roll column, its bank. **Figure size** scales them; 1× is true size. Clicks on a figure answer as clicks on its box did.

## Which figure

What a person is comes from the data's own columns:

1. **Names** - category columns called Name, Vehicle, Unit, Unit type, Model, Aircraft, Plane, Tank, Ship, Craft, Loadout, Kit or Figure - are matched against the figure catalogue: exactly, through aliases (a DCS unit type, a War Thunder vehicle id, a Battlefield vehicle name), by the longest known prefix (`F-16C_50` is the F-16C), or by the shortest figure name that begins with it (`Mi-24P` is the Mi-24P Hind).
2. **Types** - columns called Type, Class, Kind, Category, Icon, Role or Domain - map to a class: Tacview tags (`Air+Rotorcraft`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), War Thunder map icons (`MediumTank`, `SPAA`, `Fighter`), and plain words (tank, helicopter, infantry). The class's figure is drawn.
3. Data with neither kind of column is data of people: everyone is a soldier. Data that has them but says nothing about a person leaves that person a box.

The match is cached per label, so a frame costs only the placing. A data unit is a metre unless the data says how big one tracked thing is (the CS2 export says a player is 32 units across); figures are scaled to match.

## Effects

Event rows that leave something behind for a while are drawn where they happened for as long as it lasts, in the colour of whoever caused them: a smoke (about 18 s), a molotov or incendiary (7 s), a flash and an HE burst (about a second), a decoy (15 s), a planted bomb (40 s). They come from an event column (Event, Events) whose label is `smoke`, `molotov`, `incendiary`, `flash`, `he`, `decoy` or `plant` - the CS2 export writes them at the detonation.

## Debrief

The **Debrief** section under the Team viewer adds what a flight debrief asks of a replay, after Tacview:

| Control | What it does |
|---|---|
| **No names / Names / Names, height, speed** | Labels over the live tracks: the person's name (a Tacview id suffix such as `#1a2` taken off; an unmanned object by its type), and in full also its height in metres and its speed, worked out from the track's own movement. |
| **Drop lines** | A line from each track straight down to the data's floor, so heights read in a 3D view. On by default. |
| **Click a name** | The camera follows that track: behind and above it along its heading, eased through turns. **Camera distance** sets how far (it grows with the figure size). Click again or press Esc to stop. While following, a chart shows the track's height (blue) and speed (yellow) over the session, with the playhead and the values at it. |
| **Shift-click two names** | A dashed line between them, and at its middle the bearing from the first to the second (degrees, clockwise from north), the slant range, and the height difference. North is world -Z, as Tacview recordings load; for other data the bearing is relative to the world's axes. |
| **Events** | Every event row of the recording in time order - kills, launches, take-offs, a CS2 round's kills and utility - with the person it is about. A click jumps the playhead there. In the view, each event is shown where it happened for ten seconds, fading. A column's rows that are only samples (CS2's `position`) are not events. |

## Match replay: Tacview's tools

In the **Match** tab's **Figure replay** the sidebar has what Tacview has for a debrief; [Tacview parity](tacview-parity.md) lists every Tacview feature and where it stands.

| Section | What it holds |
|---|---|
| **Replay** | The camera on the followed unit: **Chase**, **Orbit**, **Cockpit** (out of the unit along its attitude, with a head-up display), **Fixed** (a place around the unit that turns and rolls with it), **Padlock** (from the cockpit, held on a target), **Target** (behind the unit, looking past it at the target), **Satellite** (straight down, north up). The target is picked there, or is the other unit of a measured pair; **Swap** exchanges them. V cycles the views. |
| **Bookmarks** | B adds one: the moment and the camera (free, or the followed unit with its view). Named, kept in this browser for the recording, exported and imported as a file. Below them the moments the recording marks: kills, deaths, an ACMI file's own bookmarks and messages. |
| **Tactical display** | For no unit, the selected ones, all, or one kind (aircraft, ground, ships, weapons): velocity vectors, the path ahead, nose and lift lines, radar cones and range gates, locks, engagement domes. The measured pair's line turns red where the ground is between them. The **2D map** (M) and the **Charts** window. |
| **Statistics** | Per team and per unit: kills, deaths, shots, hits, hit ratio, take-offs, landings, time airborne, the most G, speed, height and Mach, distance. A full table over the view, CSV of it, and CSV of the selected unit's telemetry. |
| **Labels** | Rules per kind of object - selected units, aircraft, ground, ships, weapons, AI: shown or not, their own values, and their priority when labels would cover each other. |

The unit card's **Raw** button lists every value the recording has for the unit at that moment, as written. The timeline shows the kills and deaths (the followed unit's in blue) and the bookmarks (red); a click goes there. Page Up and Page Down jump to the previous and next event of the kinds the event list shows; **Pause on event** stops at each.

