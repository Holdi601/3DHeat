---
title: Figures
nav_order: 65
has_children: true
---

# Figures

In the [replay](match-replay.md) every unit is drawn as a **figure of what it is**, at its true size: about 2,000 named vehicles, aircraft, ships, weapons and soldiers, built by the viewer itself.

![Tanks of the demo drawn as their own figures](assets/img/en/replay-overview.webp)

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

- **Built from published dimensions.** Most figures are made by the viewer's own figure builder from public numbers: length, width, height, road wheels, turret and gun, wings and tail. Their shape is then fitted to public photographs and drawings. No game's models are used.
- **Free models.** A few figures use free 3D models (CC0 or CC-BY) where those are truer, sometimes combined with the built hull. Their authors are credited on [Figure credits](figure-credits.md).
- Every figure has a full, a coarse and a far version, so thousands can be drawn at once.

## Which figure a unit gets

The viewer looks at the data's own columns:

1. **Names** - columns like *name*, *vehicle*, *unit*, *model*, *aircraft*, *tank*, *ship* - are matched against the catalogue: exactly, through about 4,000 aliases (game unit ids of several games), by the longest known beginning (`F-16C_50` is the F-16C), or by the shortest figure name that starts with it.
2. A name whose figure does not fit the unit's **type** is not used (a truck called *Typhoon* is not the fighter).
3. **Types** - columns like *type*, *class*, *kind*, *category*, *role* - give a class figure: Tacview tags (`Air+FixedWing`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), map icons, or plain words (tank, helicopter, infantry).
4. Data with neither is data of people: everyone is a soldier.

So the easiest way to get the right figures is a `vehicle` column with the real names, or a `type` column with Tacview tags.

## Settings

The **Figures** section of the replay sidebar sets the size, the smallest size on screen, what far units become (figure, arrow, symbol), and the effects drawn on them. See [Match replay](match-replay.md#figures).

## An optional local figure pack

You can keep figures of your own on your own machine: an optional local figure pack replaces catalogue figures of the same names while the dev or preview server finds it, and can give individual game units their own variant figures. It is never part of the repository or a published build; without one, nothing changes.

The server looks for it in the environment variable `HEAT3D_FIGURE_PACK` (the file's full path) or in a `figurePack` entry of the git-ignored `tools/local-data.json`. The page fetches only the figures a recording needs, compressed, and the browser keeps them.
