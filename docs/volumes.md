---
title: Volumes and comparison
parent: Filters and tools
nav_order: 6
---

# Volumes and comparison

A **volume** is a shape you draw in the 3D view: a box, a prism, a cylinder or a sphere. Volumes measure what happens inside them, filter the view to them, export their rows, and can be compared side by side.

![Three volumes on the demo valley: two cylinders round the hills, a box round the village](assets/img/en/volumes.webp)

## Draw a volume

Open **Volumes** in the sidebar and pick a tool:

| Tool | How to draw |
|---|---|
| **Box** | Drag a rectangle (Shift: a square). A click places a default box. |
| **n-gon** | Drag from the centre (Shift keeps it regular). *Corners* sets n (default 8). |
| **Polygon** | Click the corners; close with a double-click, Enter or a click on the first corner. Backspace removes the last corner. |
| **Cylinder** | Drag the radius. |
| **Sphere** | Drag the radius; it rests on the ground. |

You can draw in the 3D view or on the 2D map. Floor and ceiling start from the data underneath. Esc cancels.

## Edit

- Click a volume to select it. Drag its body to move it, corners to reshape it (Shift on a corner scales).
- The **yellow** handles set floor and ceiling, the **cyan** handle turns it.
- Alt+drag copies, Del removes, Ctrl+Z / Ctrl+Y undo and redo, Ctrl+D duplicates.
- Exact values: Floor, Ceiling, Turn / Pitch / Roll (boxes), Radius (spheres, cylinders).

Each volume row has a show checkbox, a colour, a name, **include** or **exclude**, duplicate and delete. Volumes are saved in the browser for each dataset, and **Save…** / **Load…** write and read a `volumes.json` file.

## Filter the view

| Filter | Effect |
|---|---|
| **Show all** (default) | Volumes only measure. |
| **Only inside** | Heat, replay and hit analysis draw only what is inside the included volumes and outside the excluded ones. |
| **Hide inside** | The opposite. |

The GPU filter takes up to 8 volumes with 64 outline points in all; a "!" marks a volume past that. Statistics and export still count it.

## Statistics

The **Statistics** area follows the filters, the time window and hidden groups. *Selected* shows the selected volume, *Compare all* puts every volume side by side. It counts rows inside, players, teams, matches, time inside, entries and exits, peak and mean heat, the volume's size, a "When" histogram, and per column: categories with **Lift** (share inside ÷ share in all shown data) and numbers with range, median and 5th–95th percentiles.

**Statistics as CSV / JSON** save them. **Export the data inside** writes the rows inside as CSV or Parquet (*Only the rows shown* on by default), one volume or all with a column saying which volume holds each row.

## Compare volumes

With two or more visible volumes, **Compare…** opens a window:

![The Compare volumes table: rows, time inside, players and more for each volume, with the difference from the first](assets/img/en/compare.webp)

| View | Shows |
|---|---|
| **Table** | Rows, time inside, players, matches, teams, entries, exits, visits, visit length, kills, deaths, kills per death, kills per minute, time per player, value columns; grouped by events, vehicle class, player or AI, team and facing. Each value shows its difference from the first volume and an effect size (negligible, small, medium, large). Click a volume's heading to sort by distance from the first. |
| **Bars** | Counts or shares by event, class, actor, team or direction. Click a bar to filter the view to it. |
| **Over the match** | One chart per volume over the minutes of the match: presence, rows or kills. Click to jump there. |
| **Visits** | Box and violin plots of how long visits last (log scale). |
| **Flow** | Where tracks go after leaving each volume: a transitions matrix or flow ribbons. |

![The Bars view: event kinds per volume as shares](assets/img/en/compare-bars.webp)

## Tips

- Start from a finding: in [Insights](insights.md), **Volume here** adds a cylinder round the finding's place.
- **Breakdown…** opens the [Breakdown](breakdown.md) for the selected volume: who and what does best inside it.
- [Directional heat](directional-heat.md) can chart the directions inside the selected volume.
