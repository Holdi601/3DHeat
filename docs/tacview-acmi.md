---
title: Tacview recordings (ACMI)
parent: Getting data in
nav_order: 7
---

# Tacview recordings (ACMI)

Tacview's flight recordings load like any table: pick or drop a `.acmi` (text, `.txt.acmi`, or zipped, `.zip.acmi`) and press **Load**. ACMI is Tacview's public file format ([documentation](https://www.tacview.net/documentation/acmi/)); DCS (through Tacview's exporter), IL-2 Great Battles, Falcon BMS, X-Plane, MSFS and others write it, so this reads any of them.

## What a recording becomes

One row each time an object's position is written, one row per event at the object's place, and one row when an object leaves (`Removed`, where it was last). An event about no object seen yet - a bookmark, a message to all - is a row of the object `(recording)` at the reference point. The recording carries its own reading instructions, so the mapping step fills itself in:

| Column | Role | Meaning |
|---|---|---|
| Time | time | Seconds after the recording's ReferenceTime; Unix seconds when it has one, so the clock shows the real time. |
| X, Y | position | East and north, metres, on a plane touching the earth at the recording's reference point: distances and bearings are true near it, drifting by under a part in a thousand at 100 km. North becomes the world's -Z. |
| Altitude | position (up) | Metres. |
| Object | person | The pilot and the object's name with its id, e.g. `Viper 1 (F-16C_50) #a01`; an unmanned object `(T-90A) #401`. |
| Coalition | team | The side (or the colour, when there is no coalition). |
| Heading, Pitch | look | Degrees; heading 0 is north. |
| Recording | session | The recording's Title, or the file name: several recordings load side by side without their tracks joining. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | filters | Kept for filtering; Type and Name pick each object's [figure](figure-replay.md), Event feeds the debrief's event list, Roll banks the aircraft. |
| U, V | | The game's own flat-world metres, when every sample has them (DCS writes them). |
| EventObjects | filters | Every object an event names (`Message|a01|b02|...`), by id. |
| RecordingInfo | | The recording's own properties as they stood at that moment - DataSource, DataRecorder, Author, Category, Briefing, Comments, ... - as JSON. |
| IAS, Mach, AOA, FuelWeight, ... | filters | Any other numeric property the recording carries. |
| Parent, CallSign, LockedTarget, Label, Shape, ... | filters | Any other text property the recording carries; a property with any value that is not a number is text. |

All four forms of Tacview's position (`lon|lat|alt`, with `u|v`, with `roll|pitch|yaw`, and with all of them and a heading) are read, empty fields keeping the last value; `-id` removes an object, and an id used again after it is a new object. Escaped commas and continued lines are handled.

The positions are always projected from latitude and longitude, never taken from U/V, so recordings from every game share one projection with a backdrop of the real world.
