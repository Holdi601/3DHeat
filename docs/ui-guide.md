---
title: Interface guide
parent: Camera and controls
nav_order: 0
---

# Interface guide

How the viewer is laid out, and the quick ways to reach anything: the command palette, the key sheet, the task bar and the quick bar.

## Layout

| Part | Where | What it holds |
|---|---|---|
| Header | Top of the side panel | The name, **Search…** (the command palette), **?** (help) and the gear (settings: theme, animations, units, language) |
| Workspaces | Under the header | **Heatmap**, **Race analysis**, **Match**, **Tactics**, **Vehicles**. `Ctrl+Shift+1` … `5` |
| Task bar | Heatmap and Match | **All**, **Load**, **Explore**, **Compare**, **Present**: shows one group of panels at a time |
| Side panel | Left | The panels of the workspace, each a section that opens and closes. `Ctrl+B` hides it |
| Quick bar | Top of the view | The actions used most, one click each |
| Timeline | Bottom | Play, scrub and the time window (the race chart and the board's steps on their tabs) |

## Task groups

On the Heatmap and Match workspaces the panels are grouped by what you are doing:

| Group | Panels |
|---|---|
| **Load** | Background / level, Source, Dataset, matches and series (Match). Under **More**: Many matches at once |
| **Explore** | The heat or the figures, lines, teams, entities, filters, slice, the match's units, objectives and scoreboards |
| **Compare** | Difference split, volumes, insights, mass analysis, the ruler |
| **Present** | Saved views, camera path and video, Camera & scene. Under **More**: Performance |

**All** shows every group, each under its name. A group only hides the others' panels; nothing is reset, and a filter or setting in a hidden panel keeps working. The **Plan** task is the **Tactics** workspace.

Panels used now and then sit under **More** at the end of their group (and in **Heat shape**'s neighbours: *Sprite pixel clamps* and *Distance culling*). **More** opens by itself while a panel inside it is open.

The viewer remembers, in this browser: which sections are open, the group picked on each workspace, which **More** folds are open, and whether the side panel is hidden. A panel that has something to show (a loaded file's mapping, a volume just drawn) opens by itself whatever was remembered.

## Command palette

`Ctrl+K`, or **Search…** at the top of the side panel. Type a few letters of what you want:

- an action (*Play / pause*, *Frame the data*, *Save the current view*, *Copy the camera position*, *Theme: Light*, *Keyboard shortcuts*);
- a workspace or task group (*Go to Match*, *Show the Compare panels*);
- a view mode (*Heat*, *Difference*, *Team heat*, *Lines*, *Figure overlay*);
- a camera view (*Camera: Top*, *Camera: Iso NE*, *Perspective*, *Parallel*);
- a panel (*Volumes*, *Camera path & render*);
- a setting in any panel, also in a closed one or on another workspace (*Sprite radius*, *Saturation point*, *Follow the view*);
- a saved view, by its name or its note.

`↑` `↓` move, `Enter` runs, `Esc` closes. Each line shows the group and the key, when there is one. A setting is *revealed*: the viewer goes to its workspace (and to the view mode that shows it), shows the side panel and the group, opens the sections around it, scrolls to it, highlights it and puts the keyboard focus on it - so the next arrow key or typed number changes it. With nothing typed, the last commands run come first.

Words are matched at their start first, anywhere in the label next, then in the panel's name. Accents do not matter (*echelle* finds *Échelle*).

The settings of panels that are not on the screen come from an index of the whole side panel, [`commandIndex.json`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/shell/commandIndex.json), written by `node tools/gen-command-index.mjs`; whatever is on the screen when the palette opens is read from the page, so a new control is found as soon as its section is open.

## Key sheet

`?` (not while typing in a box) shows every key, grouped by where it works: everywhere, the Heatmap and Match views, the camera, the figure replay, the race and the tactics board, the current workspace's groups first. The same list, with links to what each key does: [Keyboard and mouse reference](keyboard-reference.md).

## Quick bar

Over the top of the view:

| Button | Does | Key |
|---|---|---|
| Play / pause | The timeline, the race or the plan, by workspace | `K` |
| Frame | Frames the data | `F` |
| Look straight down | The top view, framed | |
| Bookmark | Saves the current view under the next free name ([Saved views](saved-views.md)) | |
| Ruler | Opens [Measure](measure.md) with the ruler on (Heatmap) | |
| Side panel | Hides or shows it | `Ctrl+B` |
| Search | The command palette | `Ctrl+K` |
| Keyboard | The key sheet | `?` |

While a unit is followed, the bar shows its name and **Stop following** (`Esc`).

## Help

`F1` or **?** turns on the help mode: what the colours mean, and *Under the pointer* - the label or figure over the view, or the control in the side panel, the bars or the settings, named with what its tooltip or hint says. `F1` works with the focus in any control. See [Settings, units and keys](settings.md#help-mode).

## Look and accessibility

- **Theme**: dark by default; **Light** and **System** in the settings. The 3D view and everything drawn over it stay dark. Team colours are the team palette's (*Auto*, *Soft*, *Strong*, *Strong alt*) in every theme.
- **Animations**: **Auto** turns transitions, glows and blur off while the view runs under 30 fps and back on when it recovers; the system's *reduce motion* setting always wins.
- Every control is reachable with `Tab`, shows a ring in the accent colour when it has the keyboard focus, and section headers open and close with `Enter` or `Space`. Text meets WCAG AA contrast in both themes.

Colours, spaces, radii, type sizes, shadows and durations are design tokens on the page root ([`app.css`](https://github.com/Holdi601/3DHeat/blob/main/src/app.css)); the light theme redefines the colours only.
