---
title: Saved views
parent: Filters and tools
nav_order: 20
---

# Saved views

Keep an analysis as it stands - where the camera is, the mode, the filters, the layers, what is selected and the time - with a name and a note, and come back to it with one click. Views can be written to a file and read back, to hand an analysis to someone else or to keep it with the data.

## Save and restore

1. Set the view up: camera, mode, filters, hidden groups, match, time, volumes, layers.
2. Open **Saved views**, give it a **Name** and, if you like, a **Note** (what it shows, what to look at), and press **Save view**.
3. Click a view's name to put it back. A line under the list says *"name" restored*, or what this data does not have (a column, a team, a match, a unit) - everything else is restored.

| Control | Meaning |
|---|---|
| Name (click) | Restore the view. |
| **⟳** | Replace the view with what is on screen now; the name and the note stay. |
| **✎** | Rename it and edit its note. |
| **×** | Delete it, after asking. |
| **Export JSON** | All views as `3dheat-views.json` (`schema: heat3d.views/1`). |
| **Import JSON** | Adds the views of such a file; one with the same id replaces the one here. |

Each view shows its mode, when it was saved, the data it was saved on and its note. Views are kept in this browser (`heat3d.savedViews`), for every dataset; one saved on other data can be restored too, and says what it could not find.

## What a view holds

| Part | What is kept |
|---|---|
| Camera | Position, view direction, field of view, projection and the parallel view's height. |
| Mode | Heat, Difference, Team heat, Lines or Figure overlay. |
| Filters | Every filter, by names: a category filter as its values, a team or person filter as their labels, a numeric range as it is. |
| Groups | The groups hidden, by label. |
| Match | The picked match or round, by its session label. |
| Time | The timeline's mode, window and playhead. |
| Heat | The whole heat shape and colour settings, the line heat settings and the slice. |
| Volumes | The volumes, the volume filter and the selected volume. |
| Layers | Objectives and their labels, volume lines on the level, heat labels, the tactical display's aids. |
| Selection | The selected unit and the unit followed (and how), by unit key. |

By names, so a view means the same on another load of the same file, or on another file with the same columns: what the data lacks is left out and listed. The camera is placed after the mode switch and once more two frames later, so a mode that frames the data on its first frame does not move it away ([`savedViews.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/state/savedViews.ts), [`ViewsPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/ViewsPanel.tsx)).
