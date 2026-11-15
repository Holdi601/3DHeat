---
title: Settings, units and keys
nav_order: 71
---

# Settings, units and keys

## The header

At the top of the sidebar:

| Control | What it does |
|---|---|
| **?** | Help mode: what every colour means (also `?` or `F1`) |
| **Units** menu | Metric, Imperial, Aviation or Nautical, and each quantity on its own |
| **Language** menu | The viewer's language: [40 languages](languages.md), or the browser's |

## Units

Pick a preset, then change any single quantity:

| Preset | Distance | Height | Speed |
|---|---|---|---|
| **Metric** (default) | km | m | km/h |
| **Imperial** | mi | ft | mph |
| **Aviation** | NM | ft | kt |
| **Nautical** | NM | m | kt |

Quantities you can set on their own: distance (km, mi, NM), altitude and length (m, ft), speed (km/h, m/s, kt, mph), vertical speed (m/s, ft/min, m/min), temperature (°C, °F, K), pressure (hPa, inHg, mmHg, psi), mass and fuel (kg, lb, t), angle (degrees, NATO mil). A quantity not set follows the preset. The units are the same everywhere in the viewer: labels, cards, charts, statistics.

## Help mode

![Help mode: what the colours mean](assets/img/en/help.webp)

`?`, `F1` or the **?** button shows *What the colours mean*: legends for the 3D view, the heat ramps, team colours, the level's colours, the panels' status colours, the match panel and the race view. It stays on until you switch it off.

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
