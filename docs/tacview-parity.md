---
title: Tacview parity
parent: Heat modes
nav_order: 10
---

# Tacview parity

Every feature of Tacview 1.9 (its manual, its user-interface string table and the ACMI 2.2 file format) and where 3DHeat's match replay stands with it. The aim: what Tacview can do for a replay and its data, 3DHeat can do too.

**Status:**
- **done**: in 3DHeat before this checklist.
- **new**: built with this checklist.
- **not yet**: applies, not built.
- **n/a**: does not apply here, with the reason.

Where to find the features: the **Match** tab, **Figure replay** (or box replay in the Heatmap tab), in the sidebar sections **Replay**, **Units**, **Events**, **Bookmarks**, **Tactical display**, **Statistics** and **Labels**. See [Figure replay and debrief](figure-replay.md).

## Cameras

| Tacview | 3DHeat | Status |
|---|---|---|
| Cockpit view (F5), the horizon rolling with the aircraft | **Cockpit**: out of the unit along its attitude, as the motion model has it. The unit's own figure is clipped away. Drag to look around; **Look ahead again** resets. | new |
| HUD in the cockpit view (IAS/CAS/TAS choice) | **Head-up display** (H): horizon and pitch ladder of the actual view, flight path marker, heading tape, IAS, height, TAS, Mach, G, angle of attack, vertical speed, AGL | new |
| 3D cockpit instruments, pilot head tracking (PilotHead*), TrackIR | No cockpit models; head angles are shown in the unit card's **Raw** view | n/a (no cockpit models; head tracking hardware is for live flying) |
| External view (F6): orbit the primary object | **Chase** (turns with the unit) and **Orbit** (keeps its own direction) | done |
| Dogfight camera, "Look at target" (padlock) | **Padlock**: from the cockpit, held on the target | new |
| Dogfight camera, "Centered" / "Look forward" | **Target**: behind the unit on the line from the target, looking past it at the target. **Fixed** at azimuth 0 looks forward from ahead. | new |
| Swap primary and secondary | **Swap** beside the target | new |
| Satellite view (F7), orthographic top-down | **Satellite**: straight down on the unit, north up; drag to turn. The 2D map is the orthographic plan. | new |
| Free camera (F8), W/A/S/D, E/C | The free fly camera (W/A/S/D, Space/Q, Shift/Alt) | done |
| Add-on Head-On camera; external camera fixed to the object | **Fixed**: a place around the unit that turns and rolls with it; drag to move it (behind, a wingtip, head-on) | new |
| Add-on Lock Camera (freeze the position) | Stop following (Esc): the camera stays where it was | done |
| Strategic view (zoom out to the whole Earth) | [World backdrop](world-backdrop.md) and the 2D map's whole-recording frame | done |
| Field of view setting | Camera panel FOV | done |
| Cycle views with keys | **V** next view, **Shift+V** back | new |

## 3D view and display options

| Tacview | 3DHeat | Status |
|---|---|---|
| Ribbon trails, length slider | Trails (seconds) in the Team viewer | done |
| Anticipatory trail (path ahead) | **Path ahead**: where the unit really goes in the next seconds | new |
| Object height lines / walls | **Drop lines** | done (lines; walls not built) |
| Selected object vectors: heading (dotted), course (solid), lift | **Velocity vectors** (course and speed for so many seconds, with a tip) and **Nose and lift lines** (nose dashed, lift short and dark) | new |
| Pilot line of sight | PilotHead* are in **Raw**; no line drawn | not yet |
| SAM/AAA lethal range domes (EngagementRange, VerticalEngagementRange, EngagementMode, "2" twins) | **Engagement zones**: domes, ovoid where the vertical range differs, off while EngagementMode is 0 | new |
| Radar locks (LockedTarget..9) with labels | **Locks**: red lines to each locked object; dashed amber to FocusedTarget; along LockedTargetAzimuth/Elevation/Range where no object is named | new (no lock labels) |
| Radar cone (RadarMode, Azimuth, Elevation, Roll, Range, beamwidths) and range gate | **Radar cones**: rim and mid ring of the beam turned by azimuth, elevation and roll against the unit; the range gate as two yellow rims. Without beamwidths, the beam's axis only. | new |
| Line of sight between the two selected objects (green / red dotted when terrain blocks) | The measured pair's line turns red and dashed when the level is between them | new |
| Automatically scale up distant objects | Smallest figure on screen (pixels) | done |
| Latitude/longitude grid | Grid on the 2D map; no lat/long grid in 3D | not yet |
| Bullseye rings | Rings around each team's bullseye on the 2D map | new (2D only) |
| Glideslope overlay | The glideslope deviation values show in **Raw** | not yet |
| Altitude restrictions (ceiling/floor alarm) | Not built | not yet |
| Destroyed objects grey, removed after 15 min | Lives end with their track; a dead unit is dimmed in the unit list | done |
| Visible / Disabled properties | Shown in **Raw**; nothing is hidden by them | not yet |
| Display stick/throttle/pedal positions | Throttle and engine values in fields; control inputs in **Raw** | done (as values) |
| Comments as subtitles | Recording properties are kept (RecordingInfo); not shown as subtitles | not yet |
| Date and UTC time display | Timeline clock with UTC where the recording has a reference time | done |
| Mouse position lat/long, MGRS, bullseye | Pick card and camera readout in world metres; bullseye per unit (field) | done (no MGRS) |
| Custom logo | Not built | n/a (branding) |
| 3D models, nearest when unknown | Own figure catalogue, nearest counterpart, true size | done |
| Multiple engagements (lines between all pairs) | One measured pair at a time | not yet |

## Labels

| Tacview | 3DHeat | Status |
|---|---|---|
| Labels on/off, separately for selected and unselected objects | **Labels** with rules for **Selected**, **Aircraft**, **Ground**, **Ships**, **Weapons** and **AI**: shown or not, own values, priority | new |
| Label fields: name, call sign, pilot, speeds (TAS/CAS/IAS/Mach/GS), heights (ASL/AGL), VS, AOA, AOS, G (vertical, lateral, longitudinal), turn rate and radius, energy, fuel weight/volume/flow, heading/track, roll/pitch, heart rate | Every value of `fields.ts`: the same list, worked out where not recorded (estimates marked ~). Roll rate and SpO2 only via Raw. | done |
| Bullseye position in labels | **Bullseye (bearing / range)** field | new |
| ILS deviations, distance flown | Raw values; distance flown in the statistics | done (partly) |
| Declutter unselected telemetry | **Declutter**, now ordered by each rule's priority | done / new |
| Label all ground objects / only threats | The Ground and AI rules | new |
| Labels scale | Not built | not yet |
| Metric / imperial units | Metric / imperial | done (two presets, not eight) |

## Object info and telemetry

| Tacview | 3DHeat | Status |
|---|---|---|
| Primary and secondary selection | Click follows and selects; shift-click two to measure; **Target** picker | done / new |
| Range / bearing / aspect / closure between two objects | BRAA line of the measured pair; Range, Bearing, Aspect and Closure fields from the followed unit | done |
| Relative bearing, LOS rate | Not built | not yet |
| Telemetry windows | The unit card and the hover card | done |
| Raw telemetry (every recorded property, also unknown ones) | **Raw** in the unit card: every column at the unit's row as written | new |
| Active objects list | **Units**: players, AI, weapons in flight, live ones bright | done |
| Recording properties window (title, author, briefing...) | Kept as the RecordingInfo column; shown in Raw | done (no window) |
| Position formats DMS/MGRS, magnetic north | Metres and true north | not yet |

## Charts

| Tacview | 3DHeat | Status |
|---|---|---|
| Chart of one object, up to 4 values | **Over time** (and the chart under Replay) | done |
| Plot up to 4 objects at once | **Compare**: one value of up to 8 units on one scale | new |
| Value against value (energy-manoeuvrability style) | **Value vs value**: turn rate against speed or any pair, each unit a line, its current point marked | new |
| X axis by time; zoom; scrub time from the chart | Wheel zooms in time, double click resets, click goes to the moment | new |
| X axis by air or ground distance | Not built | not yet |
| Predefined charts (energy, acceleration...) | Any value can be picked (energy height and its rate are values) | done |

## Statistics, flight log, events

| Tacview | 3DHeat | Status |
|---|---|---|
| Flight log: taken off, landed, fired, hit by, destroyed by, left area | **Statistics** per unit: lives, kills, deaths, shots, hits, hit ratio, take-offs, landings, time airborne, max G (and min), max speed, height and Mach, distance. Take-offs come from TakenOff/Landed events, OnGround, AGL, or an estimate marked ~. | new |
| Scoreboard and mission report add-ons | Per-team summary and most kills; the match summary's own scoreboard | new / done |
| Export flight log XML/CSV | **Export CSV** of the statistics, and of the events as listed | new (CSV only) |
| Export telemetry CSV at a rate | **Telemetry of the selected unit**: every value, 1-20 a second | new |
| Event log, double-click to go there and select | **Events** list, filtered by kind and unit; a click flies there | done |
| Previous / next event (Ctrl+←/→) | **Page Up / Page Down** | new |
| Pause on event | **Pause on event** | new |
| Timeline markers (releases, hits, destructions; the selected object's in blue; bookmarks red) | Kills and deaths as a density bar, the followed unit's in blue, bookmarks red; click to go | new |
| Remove an event, kill-remove | Not built | n/a (events are the recording's; filters hide them) |

## Bookmarks

| Tacview | 3DHeat | Status |
|---|---|---|
| Insert bookmark with selection and point of view | **Add bookmark** (B): the moment, the free camera or the followed unit with its view, distance and target; named; kept in this browser per recording | new |
| Remove bookmark | × in the list | new |
| Bookmarks on the timeline and in the logs | Red marks; the list | new |
| Event=Bookmark in ACMI | Listed under the recording's marks, with kills, deaths and messages | new |
| Copy/paste shortcut (share a view) | **Export / Import** the bookmarks as a file; C copies the camera pose | new |

## Playback

| Tacview | 3DHeat | Status |
|---|---|---|
| Play/pause, to start, speed, timeline scrub | Timeline | done |
| Frame by frame | **,** and **.** a second back and on (Shift: ten) | new |
| Reverse playback | Not built: the track cursor plays forward; seeking back works | not yet |
| Time jump dialog | The timeline and the event list | done |
| Time shift one object (ghost) | Not built | not yet |
| Trim before/after | The session picker plays one match or round; no trim | not yet |

## Terrain and map

| Tacview | 3DHeat | Status |
|---|---|---|
| Real terrain, custom elevation and textures | Levels (the game's own map as a 3D model), world backdrop tiles | done |
| Flat / empty / high-contrast terrain modes | [Level appearance](level-appearance.md): ground relief, surface and structures shown or not | done (not the same modes) |
| 2D tactical map (Tacview has none: satellite view) | **2D map**: corner or whole view, symbols by kind and team (filled players, outlined AI) turned to their heading, trails, names, scale bar, range rings around the followed unit, bullseye rings, the 3D camera's place, recent deaths; drag, wheel, click to follow (M) | new |
| Static objects (airports, runways, waypoints, areas, KML) | [Tactics board](tactics-board.md) draws areas and routes; no airport database | not yet |

## Import, export, recording

| Tacview | 3DHeat | Status |
|---|---|---|
| ACMI text and zip | [Tacview ACMI](tacview-acmi.md) | done |
| GPX, KML, CSV, NMEA, IGC, FIT, DIS... | CSV and Parquet; others not | not yet (CSV covers the tables) |
| Native recorders (DCS, BMS, IL-2, MSFS...) | 3DHeat's own converters (War Thunder, CS2, Squad, Arma and others) | done (own) |
| Real-time telemetry over TCP, ADS-B | Not built | n/a (replays after the match) |
| Synchronised audio/video | Not built | not yet |
| Video export | [Camera path and video](camera-path-and-video.md) | done |

## Other

| Tacview | 3DHeat | Status |
|---|---|---|
| Lua add-ons | Not built | n/a (open source: change the viewer itself) |
| Online debriefing (shared session) | Not built | not yet |
| Instructor remote control | Not built | n/a (controls a running simulator) |
| Object editing (add, edit, remove objects) | [Tactics board](tactics-board.md) for planned objects; recordings are read-only | n/a |
| Languages | 40 languages | done |
| Authentication of recordings | Not built | n/a |

## ACMI 2.2 properties

Read by `data/acmi.ts`; numeric properties become number columns, text ones category columns. All of them are shown under **Raw** in the unit card. These are read for a purpose:

| Properties | Use |
|---|---|
| T (all four forms), Name, Type, Pilot, Group, Country, Coalition, Color, CallSign | Position, attitude, figure, unit name, team |
| IAS, CAS, TAS, Mach, AOA, AOS, AGL, HDG, HDM, OnGround | Fields, charts, HUD, take-off and landing detection |
| VerticalGForce, LongitudinalGForce, LateralGForce | G fields |
| Throttle(2), Afterburner, EngineRPM(2), NR, AirBrakes, Flaps, LandingGear, Tailhook | Fields |
| FuelWeight..9, FuelVolume..9, FuelFlowWeight..8 | Fuel fields, summed over the tanks |
| RadarMode, RadarAzimuth, RadarElevation, RadarRoll, RadarRange, RadarHorizontalBeamwidth, RadarVerticalBeamwidth, RadarRangeGateAzimuth/Elevation/Min/Max/HorizontalBeamwidth/VerticalBeamwidth | Radar cones and range gate |
| LockedTarget..9, LockedTargetMode, LockedTargetAzimuth/Elevation/Range, FocusedTarget | Lock lines |
| EngagementMode(2), EngagementRange(2), VerticalEngagementRange(2) | Engagement domes |
| QNH, AltimeterSetting, WindSpeed, WindDirection, HeartRate | Fields |
| Health | Field |
| Events: Destroyed, TakenOff, Landed, Bookmark, Message, LeftArea, Timeout | Event list, statistics (deaths, take-offs, landings), bookmarks |
| Type tag Bullseye (Navaid+Static+Bullseye) | Bullseye field and map rings |
| Everything else (PilotHead*, controls, surfaces, ILS deviations, SpO2, ENL, Label, Debug, Importance, Slot, Visible, Disabled, Radius, sizes...) | Shown as written under **Raw** |

Radar and lock angles are taken against the unit's own axes: azimuth to the right, elevation up, roll right wing down. The ACMI spec says they are relative to the aircraft but not which way is positive; this reading follows its transform (yaw clockwise, pitch up, roll right).
