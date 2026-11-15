---
title: Tacview recordings (ACMI)
parent: Getting data in
nav_order: 7
---

# Tacview recordings (ACMI)

Tacview is a program that records flights in flight simulators; its files end in `.acmi`. 3DHeat opens them so you can see where every aircraft flew.

Tacview's flight recordings load like any table: pick or drop a `.acmi` (text, `.txt.acmi`, or zipped, `.zip.acmi`) and press **Load**. You then get the heat of all flights, and in the **Match** tab a replay with figures, tracks and an event list ([Match replay](match-replay.md)). ACMI is Tacview's public file format ([documentation](https://www.tacview.net/documentation/acmi/)); DCS (through Tacview's exporter), IL-2 Great Battles, Falcon BMS, X-Plane, MSFS and others write it, so this reads any of them.

## What a recording becomes

One row each time an object's position is written, one row per event at the object's place, and one row when an object leaves (`Removed`, where it was last). An event about no object seen yet - a bookmark, a message to all - is a row of the object `(recording)` at the reference point. The recording carries its own reading instructions, so the mapping step fills itself in. The reader writes these columns: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo`, then any further properties the recording has. Their roles:

| Column | Role | Meaning |
|---|---|---|
| Time | time | Seconds after the recording's ReferenceTime; Unix seconds when it has one, so the clock shows the real time. |
| X, Y | position | East and north, metres, on a plane touching the earth at the recording's reference point: distances and bearings are true near it, drifting by under a part in a thousand at 100 km. North becomes the world's -Z. |
| Altitude | position (up) | Metres. |
| Object | person | The pilot and the object's name with its id, e.g. `Viper 1 (F-16C_50) #a01`; an unmanned object `(T-90A) #401`. |
| Coalition | team | The side (or the colour, when there is no coalition). |
| Heading, Pitch | look | Degrees; heading 0 is north. |
| Recording | session | The recording's Title, or the file name: several recordings load side by side without their tracks joining. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | filters | Kept for filtering; Type and Name pick each object's [figure](figures.md), Event feeds the debrief's event list, Roll banks the aircraft. |
| U, V | | The game's own flat-world metres, when every sample has them (DCS writes them). |
| EventObjects | filters | Every object an event names (`Message|a01|b02|...`), by id. |
| RecordingInfo | | The recording's own properties as they stood at that moment - DataSource, DataRecorder, Author, Category, Briefing, Comments, ... - as JSON. |
| IAS, Mach, AOA, FuelWeight, ... | filters | Any other numeric property the recording carries. |
| Parent, CallSign, LockedTarget, Label, Shape, ... | filters | Any other text property the recording carries; a property with any value that is not a number is text. |

All four forms of Tacview's position (`lon|lat|alt`, with `u|v`, with `roll|pitch|yaw`, and with all of them and a heading) are read, empty fields keeping the last value; `-id` removes an object, and an id used again after it is a new object. Escaped commas and continued lines are handled.

The positions are always projected from latitude and longitude, never taken from U/V, so recordings from every game share one projection with a backdrop of the real world.

## DCS servers: who won, and how each sortie ended

A DCS multiplayer server records its missions with Tacview around the clock, and a persistent PvP server runs a campaign over many of them: a side wins by taking every airfield, FARP and zone of the other, which takes days and many mission restarts. The recordings hold the flights, not the campaign: no message says who took what, the airfields are written once at the start, and none says who won. The Tacview converter (`node tools/acmi-to-parquet.mjs`, [`data/dcsOutcome.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsOutcome.ts)) adds what can be known to every row, and leaves empty what cannot - it never guesses.

| Column | Meaning |
|---|---|
| `server` | the server or campaign, from the recording's header (its Title, Author and Comments name the known public servers - Blue Flag, SPS Contention, Growling Sidewinder; otherwise an Author that names someone); `--server Name` names it for a whole folder. A recording whose header names no server - an Author such as `Admin`, a Title and Comments no known server writes - stays unattributed: `server` empty, even when it was downloaded from a server's recording page, since the page may hold other communities' missions too |
| `mission` | the recording's Title without its version or campaign month: `Operation_Example_V7.7.99` becomes `Operation Example` |
| `campaign` | the campaign round the recording belongs to, by server, map and number: `Example Server North 3`. One recording is one session (restart to restart); a round runs over many sessions, days or weeks |
| `round` | that round's number: the server's own where it publishes one, else the n-th round seen of that server and map; from a rounds file (below), empty without one |
| `session` | the recording's place among the round's sessions, 1, 2, ...; `sessionStart` its real start (Unix seconds) |
| `won`, `matchWon` | 1 when the row's side (its Color, Red or Blue) won that campaign, 0 when it lost; empty where no rounds file names a winner, and on neutral rows. A campaign is the round and the match at once, so both hold the same |
| `roundEndReason` | `capture` for a campaign won by taking everything |
| `won`, `matchWon` on every session of a round | the round's result, written on every recording of it once its end is known |
| `sortie` | on an aircraft's rows: its flight, 1, 2, ... from take-off to take-off; the ground time before the first take-off and after a landing counts to the flight it belongs to |
| `sortieResult` | how that flight ended: `landed`, `landed damaged` (after a hit in the air), `ejected`, `shot down`, `destroyed` (on the ground), `crashed`, `despawned` (gone in the air with no cause seen - a player leaving), `airborne at end`, `no takeoff` |
| `sortieKills` | the kills credited to the aircraft in that flight |

In a persistent server the sortie is the unit that means something: filter on `sortieResult` = `shot down` to see where flights were lost, or break the heat down by `sortieResult` or `server` in the [breakdown](breakdown.md). The take-offs, landings, ejections, kills and crashes it is made of are the events the converter works out from how the aircraft move (above).

Places taken between two sessions of a round - known from the rounds file, below - are `capture` events at the start of the later recording: `Object` `(campaign)`, at the place, `Detail` `Red to Blue, between missions`, `Inferred` `between missions`.

An airfield or FARP that changes sides where the recording shows it - written again in the other colour, or removed and written again at its place in the other within five minutes - becomes a `capture` event at the pad: `Event` = `capture`, `Airfield` its name, `Detail` `Red to Blue`, `Coalition` its new side. A pad first written in a colour is no capture. The servers looked at so far write their pads once, so their recordings hold no captures.

### Rounds files

A rounds file says, per server, its campaign rounds, who won them and each one's sessions. It comes from what the server publishes, or from the recordings themselves (below).

Who won a campaign is what the server publishes - a campaign log on its web page - not something in the recording. A rounds file carries it, and the converter reads it with `--rounds file.json` (more than one may be given):

```json
{
  "format": "heat3d-dcs-rounds",
  "version": 1,
  "server": "Example Server",
  "source": "Example Server's public campaign log, read 2026-11-15",
  "rounds": [
    { "id": 41, "title": "^Example-Campaign-North$", "start": "2026-11-01T08:00:00Z", "end": "2026-11-04T19:30:00Z", "winner": "Blue", "endReason": "capture", "state": "won" },
    { "id": 42, "title": "^Example-Campaign-North$", "start": "2026-11-04T19:30:00Z", "end": null, "winner": null, "state": "in progress" }
  ]
}
```

A recording belongs to the rounds of its `server` whose `title` (a regular expression) matches its Title; each row to the round its real time falls in - the recording's RecordingTime plus the row's seconds, not the mission's in-game date. Times are UTC. A round with no winner (rotated, still running) gives its rows the round number and an empty result.

The match document's counterpart, the `acmi` footer, says where the result came from, as a War Thunder match's `result.source` does: `outcome.result` is `{ winner, round, endReason, source }`, `source` the rounds file's `source`, or `null` when nothing named a winner. `outcome` also lists the recording's rounds, its captures and its sorties by how they ended:

```json
"outcome": {
  "server": "Example Server", "mission": "Example-Campaign-North", "kind": null,
  "result": { "winner": "Blue", "round": 41, "endReason": "capture", "source": "Example Server's public campaign log, read 2026-11-15" },
  "rounds": [{ "id": 41, "start": "2026-11-01T08:00:00.000Z", "end": "2026-11-04T19:30:00.000Z", "winner": "Blue", "endReason": "capture", "state": "won" }],
  "captures": 0,
  "sorties": { "landed": 31, "shot down": 12, "ejected": 3, "crashed": 2, "despawned": 9, "no takeoff": 4 }
}
```

A row of a pilot `Viper 1 (F-16C_50) #a01` on the Blue side in that campaign then reads `server` Example Server, `round` 41, `won` 1, `roundEndReason` capture, `sortie` 2, `sortieResult` landed, `sortieKills` 1.

### Rounds from the recordings themselves

A persistent server keeps its campaign across restarts, and each recording begins with the ground units and statics of both sides where the campaign left them. `node tools/dcs-campaign-rounds.mjs <out-folder> <folder>...` reads the first minutes of every recording ([`data/dcsCampaign.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsCampaign.ts)), puts each server's recordings of one map in time order and chains them:

- **Places**: the ground in cells of about 2 km; a cell is a side's where three quarters of the units there at a session's start are its. *Contested* places are those seen held by both sides.
- **Captures**: a place held by the other side at the next session's start - taken between the missions, or during the earlier one.
- **A new round**: a session whose places differ from the last one's in more than 60% of them - the starting layout of a new round, not a step of the old one. A round also ends when the server moves to another map (its sessions begin after the last and go on).
- **Who won**: of a round that ended, the side holding every place at its last session's start (`capture`, confidence high), else the side holding more of the contested places (medium at twice the other's, else low; low when it ended with a map change). An open round has no winner, but every session says how many places each side held at its start, so who was ahead shows.
- A server whose sessions all begin alike keeps no state between them: it is not chained.

The last session's start can be hours before the round's end, so the confidence matters. Checked against a server that publishes its winners: the chain found every new round at the session the published round began, and the side ahead at the last start was the published winner in each of the 9 rounds it could check. `--official file.json` keeps such a server's published rounds and adds the chain's sessions to them; the file's `validation` says how far the chain agreed. In a made-up campaign:

```json
{ "id": 2, "campaign": "Example Server North 2", "title": "^(?:Example_North_V1\.0)$",
  "start": "2026-11-02T06:00:00.000Z", "end": "2026-11-06T12:00:00.000Z", "winner": "Red", "endReason": null,
  "state": "won (reset)", "confidence": "medium", "ahead": "Red",
  "sessions": [
    { "start": "2026-11-02T06:00:00.000Z", "red": 12, "blue": 11, "redAll": 30, "blueAll": 28, "captures": [] },
    { "start": "2026-11-02T12:00:00.000Z", "red": 14, "blue": 9, "redAll": 32, "blueAll": 26,
      "captures": [{ "lat": 42.36, "lon": 42.02, "from": "Blue", "to": "Red" }, { "lat": 42.4, "lon": 41.98, "from": "Blue", "to": "Red" }] }
  ] }
```

What the known servers publish:

| Server | A round | How a side wins | Where the winner can be read |
|---|---|---|---|
| SPS Contention | a campaign on one map and era (days), over many restarts | every airfield, FARP and stronghold taken; a campaign ended without a winner was rotated | the server's public campaign log (winner, start, end per campaign) |
| Blue Flag | a campaign round over many 5-hour missions; the Title's `_YYYY_MM` advances one month a restart | every enemy position taken; older rounds named the side holding more after a fixed time | not published in a form found so far; the chain of the recordings follows each round and who holds how much at every start |
| Growling Sidewinder | a mission run (6 hours) of an open-conflict mission | zones and airfields taken | its statistics page shows pilots, not results; every session begins alike, so no round spans sessions: empty |
| Missions against the AI (capture-the-zones missions) | a mission run | the players' side against the mission's AI: no PvP outcome | empty |
| Unattributed (header names no server) | - | - | empty, `server` empty too |
