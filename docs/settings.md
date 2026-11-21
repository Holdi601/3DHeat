---
title: Settings, units and keys
nav_order: 16
---

# Settings, units and keys

The small controls at the top of the sidebar change how the viewer talks to you: the language, the units (metres or feet, km/h or knots) and a help mode that explains the colours. Your choices are remembered in your browser.

## The header

At the top of the sidebar:

| Control | What it does |
|---|---|
| **?** | Help mode: what every colour means (also `?` or `F1`) |
| **Units** menu | Metric, Imperial, Aviation or Nautical |
| **...** button beside **Units** | Opens "Choose a unit for each quantity": one drop-down per quantity |
| **Language** menu | The viewer's language: [40 languages](languages.md), or the browser's |

![The header with the Units menu and the unit-per-quantity window open](assets/img/en/settings-units.webp)

Numbers you type into a box may use either a point or a comma (`0.35` or `0,35`). The viewer reads both and shows numbers the way the viewer's language writes them.

## Units

1. Pick a preset in the **Units** menu. All quantities switch together.
2. To change one quantity only, click the **...** button beside it and pick a unit for that quantity. The menu then shows a `*` after the preset.
3. A quantity you did not set follows the preset. Choose "As preset" to go back.

| Quantity | Metric (default) | Imperial | Aviation | Nautical |
|---|---|---|---|---|
| Distance | km | mi | NM | NM |
| Altitude, length | m | ft | ft | m |
| Speed | km/h | mph | kt | kt |
| Vertical speed | m/s | ft/min | ft/min | m/s |
| Temperature | °C | °F | °C | °C |
| Pressure | hPa | inHg | hPa | hPa |
| Mass, fuel | kg, l | lb, gal | lb, gal | t, m³ |
| Angle | degrees | degrees | degrees | degrees |

Other units you can pick for one quantity: distance km, mi, NM; speed km/h, m/s, kt, mph; vertical speed m/s, ft/min, m/min; temperature °C, °F, K; pressure hPa, inHg, mmHg, psi; mass kg, lb, t; angle degrees or NATO mils (6400 to the circle). The units are the same everywhere in the viewer: labels, cards, charts, statistics.

## Help mode

![Help mode: what the colours mean](assets/img/en/help.webp)

Press `?` or `F1`, or click the **?** button. It shows *What the colours mean*: legends for the 3D view, the heat ramps, team colours, the level's colours, the panels' status colours, the match panel and the race view. It stays on until you switch it off. At its top, *Under the pointer* says what the label or figure under the mouse is - a capture zone, a map marker, a unit's label, an event, a lock or engagement readout, a place name, a grid mark, a unit's figure - and it follows the pointer while the help is open. In the Match tab it explains the match panel's colours too: Counter-Strike's sides and rounds when a Counter-Strike scoreboard is loaded, the teams' colours otherwise.

![Help mode in the Match tab](assets/img/en/settings-help-match.webp)

## What the browser remembers

These settings are kept in your browser between visits (nothing is sent anywhere):

- the language, the units and help mode;
- the replay's figure, symbol, label, camera and tactical display settings;
- the playback speed and mirroring;
- bookmarks per recording, volumes per dataset, objective layers;
- the external AI settings (the key only if you tick *Remember*).

Heat settings, filters and the mode start fresh with every load. The full, generated list: [Stored settings](ref-settings-storage.md).

## Keys the viewer keeps from the browser

A session with large data takes time to load, so the viewer stops the browser from throwing it away by accident:

- `Ctrl`/`Cmd` + letters that would print, save, open, reload, close or open new windows do nothing outside text boxes; `F1`, `F3`, `F5`, `F6` and `F7` do nothing.
- Closing or reloading the tab with data or a level loaded asks first.
- In full screen the viewer locks the keys it uses (W, T, N, S, R, P, Q, Esc), so the browser does not take them.

The exact list: [Browser keys](ref-browser-keys.md). All of the viewer's own keys: [Keyboard and mouse reference](keyboard-reference.md).
