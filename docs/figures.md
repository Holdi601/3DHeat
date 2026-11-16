---
title: Figures
parent: Replay
nav_order: 3
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
| Close quarters | soldiers in plate carriers with an assault rifle, SMG, shotgun, DMR, LMG, handgun or shield; drones, cameras, barbed wire, shields, wall reinforcement, barricades, breaching charges, traps, windows, grenades, the defuser |

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

## Close-quarters figures (Rainbow Six Siege)

Tables written like the Rainbow Six Siege replay reader's (columns `operator`, `pawn`, `primaryClass`, `side`) get figures of their own:

- **Players** are their operator: each of the 78 operators has a figure of their own, about 1.8 m tall, in their own clothes - two or three colours for jacket, trousers and gear after their usual public look (black, olive, tan, urban grey, white, navy, with red, orange or teal gear) - and with their own shapes, a third larger than life where they have to show from above: headgear (helmets, a visor or heavy helmet, caps, beanies, berets, a wide boonie or fur hat, hoods, scarves, hair), the face (goggles, a gas mask, glasses, a mask, a beard, three-lens goggles), a light, medium or heavy build (heavy ones broad, with big shoulder plates and a collar), a long coat or a suit, a ghillie, what they carry on the back (a hammer, charges, drones, canisters, a fuel tank, a launcher tube, a crossbow, panels, a jammer, a shield) or on the arm (a launcher, a metal arm), their own shield (a tall one, a riot shield, one with lights), and an accent colour on the shoulders. They hold the class of their primary weapon. An operator the viewer does not know is a plain soldier in a plate carrier in the team's colour.
- **The side** shows apart from the clothes: a ring on the ground under each operator, **amber for attack, pale cyan for defence**, with the team's colour inside it, and arm and head bands in the same colour. A `stance` and a `lean` column pose them (see [Stance and lean](#stance-and-lean)); without them they stand.
- **Told apart at replay distance:** rendered 48 pixels tall from above and from three-quarters, every two operators on a side differ by a clear colour difference or a different shape (checked by the viewer's tests).
- **Labels** name the player and the operator played at that moment, with the operator's role as a symbol: ✸ hard breacher, ⚒ soft breacher, ➤ entry, ✦ fragger, ✚ support, ⬟ shield, ◉ intel, ◇ flex, ↺ flank watch, ⚓ anchor, ✕ trapper, ⇄ roamer, ↯ anti-gadget, ▣ anti-breach.
- **Drones** are a two-wheeled throwable drone, about 30 cm across, each a track of its own named after its owner ("Ash · drone 2").
- **Placed gadgets** stand where they were put, from then until the round ends, each as the figure of what it does: a camera, barbed wire, a deployable shield, a breaching charge, a hard-breach charge, a small sticky charge, a floor trap, a claymore with its trip laser, a one-way window, an armour panel, a grenade, a gas canister, a jammer, a sensor, a laser gate, a supply box. One figure serves every gadget that does the same job. A gadget whose kind the data does not say is a small device with a light.
- **The defuser** stands where it was planted for its 45 seconds.

Each drone and gadget becomes a track of its own when the file loads, so the player's own figure stays on their body. The operators are simplified shapes after their public descriptions and art (what they wear, the device that is their ability), and the gadgets are shaped by what they do. All of these are the viewer's own designs at the real-world size of the thing (a claymore about 22 cm wide, a door-sized panel 1 m by 2.1 m), not models from the game.

## Stance and lean

People are drawn in the stance and lean the data gives, in every game's data:

- **Stance**, from a column `stance` (or `posture`, `pose`): standing, crouching, prone on the belly, or supine on the back. Common words are understood (standing, upright, crouched, kneeling, crawling, lying, on back...), and the codes 0 stand, 1 crouch, 2 prone, 3 supine.
- **Lean**, from a column `lean` (or `leaning`, `peek`): `left`, `right` or `none`, or a number from -1 (left) to 1 (right) for a partial lean; numbers over 1 are read as per cent (up to 100) or degrees (45 a full lean).

Stance and lean combine: a crouching or prone figure can lean too. The lean tilts the upper body sideways from the hips, up to 25 degrees. A change of stance blends over a fifth of a second and the lean eases into place; with motion turned off, or when the frame rate drops below 30, both change at once. Without these columns people stand upright.

## Settings

The **Figures** section of the replay sidebar sets the size, the smallest size on screen, what far units become (figure, arrow, symbol), and the effects drawn on them. See [Match replay](match-replay.md#figures). Smoke, fire and other timed effects: [Figures in the figure overlay](figure-replay.md).

## An optional local figure pack

You can keep an optional pack of your own figures on your own machine. Its figures take the place of catalogue figures of the same names. It is never part of the repository or a published build; without one, nothing changes.
