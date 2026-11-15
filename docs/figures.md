---
title: Figures
nav_order: 11
has_children: true
---

# Figures

A **figure** is a small 3D model of what a unit really is: a tank, a jet, a ship, a soldier. The [replay](match-replay.md) draws every unit as its figure at true size, instead of a plain box.

There are about 2,000 named vehicles, aircraft, ships, weapons and soldiers, all built by the viewer itself.

![Tanks of the demo drawn as their own figures](assets/img/en/replay-tanks.webp)

## What is in the catalogue

| Domain | Examples |
|---|---|
| People | soldier standing, crouching, prone; sniper, anti-tank, medic, crew |
| Ground | tanks, infantry fighting vehicles, air defence, artillery, trucks and cars, trains and trams |
| Air | fighters, attack aircraft, bombers, transports, helicopters, from biplanes to modern jets |
| Sea | warships by class, carriers, submarines, boats, merchants |
| Weapons | missiles, rockets, bombs, torpedoes, flares and chaff |
| Markers | smoke, flash and fire grenades, planted bombs, flags, spawns, waypoints |

## How the figures are made

- **Built from published dimensions.** Most figures are made by the viewer's own figure builder from public numbers: length, width, height, road wheels, turret and gun, wings and tail. Their shape is then tuned against public photographs, drawings and published dimensions. No game's models are used.
- **Free models.** A few figures use free 3D models (CC0 or CC BY) where those are truer, sometimes combined with the built hull. Authors of CC BY works are credited on [Figure credits](figure-credits.md); CC0 works need no credit and are not listed there.
- Every figure has a full, a coarse and a far version (levels of detail, LOD), so thousands can be drawn at once.

## Which figure a unit gets

The viewer looks at the data's own columns:

1. **Names** - columns called *Name*, *Vehicle*, *Unit*, *Unit type*, *Model*, *Aircraft*, *Plane*, *Tank*, *Ship*, *Craft*, *Loadout*, *Kit* or *Figure* - are matched against the catalogue: exactly, through about 4,000 aliases (game unit ids of several games), by the longest known beginning (`F-16C_50` is the F-16C), or by the shortest figure name that starts with it.
2. A name whose figure does not fit the unit's **type** is not used (a truck called *Typhoon* is not the fighter).
3. **Types** - columns called *Type*, *Class*, *Kind*, *Category*, *Icon*, *Role* or *Domain* - give a class figure: Tacview tags (`Air+FixedWing`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), map icons, or plain words (tank, helicopter, infantry).
4. Data with neither is data of people: everyone is a soldier.

So the easiest way to get the right figures is a `vehicle` column with the real names, or a `type` column with Tacview tags.

**My unit shows as a box or a soldier.** Add a `vehicle` column with the real name, or a `type` column with a Tacview tag. Hover the unit to see which name was matched. Data that has such columns but says nothing about a unit leaves it a box; data with neither is drawn as soldiers.

## Settings

The **Figures** section of the replay sidebar sets the size, the smallest size on screen, what far units become (figure, arrow, symbol), and the effects drawn on them. See [Match replay](match-replay.md#figures). Smoke, fire and other timed effects: [Figures in the figure overlay](figure-replay.md).

## An optional local figure pack

You can keep an optional pack of your own figures on your own machine. Its figures take the place of catalogue figures of the same names. It is never part of the repository or a published build; without one, nothing changes.
