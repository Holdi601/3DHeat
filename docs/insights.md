---
title: Insights
nav_order: 7
has_children: true
---

# Insights

**Insights** looks through the loaded data for what stands out - strong positions, deadly ground, spawn traps, choke points, players far above their peers - and tells you, strongest first, with the evidence. Use it to learn in a minute where a match was won or lost. It can then write a debrief, and in a single replay it can act as a caster that jumps to the big moments.

Everything is counted in your browser. Nothing leaves your computer unless you switch on an external AI (see [External AI](#external-ai)).

![Insights on the tank demo: 14 findings, strongest first](assets/img/en/insights.webp)

The **Insights** section is in the sidebar of the Heatmap and Match tabs. It has three tabs: **Findings**, **Debrief** and **Caster**.

## Findings

1. Load data and open **Insights**. Press **Find insights** ("Counting… n%" shows the progress).
2. Read the list. The ten most useful findings are shown; **Show more** lists the rest. Each finding has a usefulness bar, what happened in plain words (with the size of the place and the events it rests on), how good the evidence is (*Strong evidence*, *Good evidence* or *Some evidence*), which detector found it, and the vehicle class where that matters. Totals of the [value columns](value-weighting.md) are folded under **Totals** above the list.
3. **Click a finding**: the viewer applies its filters, jumps to the time and fits the place to the finding's own events (below). The place is outlined in the view - a ring at its floor and at its ceiling, joined at four corners, with a mast - a pulse runs out from its centre three times, each event it is about gets a small cross, and the camera frames it. The details open:
   - the comparison: how unusual it is and against what (*Players spent 0.2% of their time here, so about 0.7 would be expected...*), and which side makes most of it where one does (*Red makes 81% of the kills here.*);
   - **Why it matters** and **What to do**;
   - the events it rests on and the evidence; over several matches (or the rounds of one), in how many it holds and how much the biggest one makes (*Seen in 14 of 20 rounds; the biggest single round makes 12% of it.*);
   - **The numbers** (folded): the effect with its 95% interval, the p and q values and the counted evidence;
   - **Volume here**, which draws a [volume](volumes.md) fitted to the finding.

   Click the open finding's title again to close it and remove the outline.
4. **Restore filters** puts your filters back. **Copy JSON** copies the whole report.

Counting uses the current filters, hidden groups and picked match over the whole time range. When you change the filters afterwards, a note says so; press **Count again**.

The lines at the top of the list (for example the money totals) summarise the whole data before the findings.

![A finding opened: the shots-fired hot zone, its numbers, and a matching passage from the literature](assets/img/en/insights-finding.webp)

### The detectors

| Detector | What it finds | Needs in the data |
|---|---|---|
| **Power positions** | Places with much better kill-to-death odds than the rest of the map, and *safe ground* where few die for the time spent | kill and death events |
| **Hot and cold zones** | Places where an event kind (shots, hits, captures ...) happens far more or less often than time spent there predicts | an event column |
| **Open ground and cover** | Deaths in the open against near level geometry, and slow against fast movement | deaths; a 3D level for the geometry part |
| **Spawns** | Strong spawns, spawn traps, safe spawns, time to first contact | time and persons |
| **Class by place** | A vehicle class, or players against AI, doing much better or worse in an area | kills plus a vehicle class or player/AI column |
| **Players** | Players killing or dying far more or less than others in the same class (AI units only when they kill far more) | persons and kills |
| **Chokes and flanks** | Choke points (far more crossings than the ground around) and flank routes (rarely used, but lead to kills) | persons |
| **Value** | *Costly ground* and *Earning ground*, in the game's own currencies (not a converter's real-world price estimate), at most two and ranked below the tactical findings | [value columns](value-weighting.md) |
| **What decided the rounds** | What separated won from lost rounds, and the players who added or cost the most win probability (see [Who won](#who-won-what-decided-the-rounds)) | rounds, kills and deaths, and the [outcome columns](data-formats.md#outcome-columns) (`won`) |

Detectors that cannot run on the data are listed at the bottom with the reason.

### How findings are ranked

Every place or group is tested against the rest of the map (exact binomial or rate tests); a player against the players of the same vehicle class. The false discovery rate is held at 5% (Benjamini-Hochberg). Chance can look like a pattern; this keeps false alarms low: among the findings shown, at most about one in twenty is expected to be chance. Effects from few events are pulled toward "no effect" before ranking. At most 40 findings are listed.

A connected area of significant cells is split into its peaks: the best cell and its neighbours that score at least 30% of it (the score is the excess of events over what the time spent predicts). So one hot spot is one finding a few cells across, never a sprawl over half the map.

A finding that passes its test can still say nothing. These are left out, and a line under the list counts them by reason:

| Left out | When |
|---|---|
| covered most of the map | the place is wider than 35% of the map (60% for a flank route); spawn areas are exempt |
| held most of all such events | a hot zone with more than half of all events of its kind: the whole fight ("99% of it happens here"), not a place in it |
| only reflected where everyone spends their time | every quiet zone and every stretch of safe ground: on real data a place where people spend time and little happens was always a rear, a rotation, a spawn or a parked unit |
| rested on a handful of events | fewer than 10 events (below); and a "player" with no kill and no death at all (an observer, a camera, a parked unit) |
| were explained by a spawn nearby | a quiet zone or safe ground overlapping a spawn finding |
| were spawns or joins | hot or quiet zones of spawn, join, leave, take-off, landing, rearm, capture and similar events, which happen where the game puts them |
| were explained by a spawn nearby | also: quiet ground, safe ground, choke points and money paid or earned in a cell where at least 1% of all lives start (a freeze time, a buy, an airfield, a parked unit) |
| were kills by place | hot zones of kills, and quiet zones of deaths, where the power positions already read kills and deaths by place |
| came mostly from one match | over three or more matches (or rounds): one match makes more than 40% of it, or only one has it at all |
| held in too few matches | it holds in fewer than two matches, in fewer than a tenth of all (from ten matches up), or in fewer than a quarter of those that have it |
| repeated a place | the same place already listed for another kind of event: the most useful one says it |
| were more of a kind | more than a few of one kind (two quiet zones, two target areas, four choke points, five of most kinds) |
| held in too few matches (single match) | hot zones of shots, hits, explosions and the like in a single match: they show where that match's fight was; over three or more matches they must recur. Deaths per time spent (deadly ground) stand on their own |
| mixed cause and effect | deaths by movement speed: people slow down, or run, to fight, so the speed at death says little about what to do |
| followed from winning the round | what decided the rounds: a plant, a place held (see [below](#who-won-what-decided-the-rounds)) |

A finding rests on at least 10 events (an absence on at least 10 expected; a choke point on 30 crossings; open ground against cover on 20 deaths in the two compared thirds). A choke point must be a passage: the traffic round it runs through it from two opposite sides with little across, not out in every direction as from a spawn or an airfield. The choke points and flank routes need four or more people's tracks.

The rest are ordered by **usefulness**: the evidence strength times how specific the place is (smaller against the map is better), what the kind of finding tells a player or a designer (rounds and power positions most, target areas and quiet zones least), how many events it rests on and, over several matches, the share of them it holds in. Each further finding of a kind counts 15% less than the one above it, so the top of the list mixes kinds; the list is strictly in that order.

Sizes are in the viewer's units from the data's own scale (a CS2 unit is an inch), to two figures; shares to two figures (*under 0.1%* rather than *0.0%*); a count of nothing is said as nothing (*No deaths*, *never died*). Movement speeds are measured while a life is in play, after it has left the cell it started in, so time spent waiting at a spawn does not count as standing still. Rows exactly at the origin (0, 0, 0) are a converter's mark for an event it could not place and are left out. The analysis grid's cells are never under a metre in the data's own units.

These standards are functions other analyses can hold their findings to: [`curate.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/insights/curate.ts) (`curateInsights`, `rankInsights`, `spreadFails`), [`consistency.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/insights/consistency.ts) (`spreadOf`) and the narration in [`plain.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/insights/plain.ts).

A hot zone where players spend less than 2% of their time is told for what it is: for effects (explosions, hits, impacts) *where they land, while whoever caused them stands somewhere else*; for actions (shots, launches, drops) *a spot people stop at to fire and move on*; for deaths *a deadly crossing*, where people die passing through.

### Fitted places

A finding's place comes from the analysis grid. When a finding is clicked, or **Volume here** pressed, its place is fitted to its own events - the rows its filters select (event kinds, team, player) within reach of the place:

- the footprint is re-centred on their median position, with the radius that holds 85% of them (at least half a cell, at most the grid place);
- the height band is their 5th to 95th height percentile with a margin of 15% (at least 1 m), never more than half a metre below the lowest of them, so the volume does not reach into the sky or under the ground.

With fewer than four rows the grid place is kept, a few cells high around its height. The scan runs a few milliseconds at a time between frames ([`fit.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/insights/fit.ts), [`curate.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/insights/curate.ts), [`highlight.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/insights/highlight.ts), [`plain.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/insights/plain.ts)).

### Who won: what decided the rounds

Where the data says who won each round (the `won` [outcome column](data-formats.md#outcome-columns): CS2, Rainbow Six Siege, War Thunder ...), the result is what Insights is about. For each side it splits the rounds by what happened in them and compares the win rates:

| Factor | The side's rounds with it | ... and without it |
|---|---|---|
| Opening duel | it made the first kill | it died first |
| Buy | its buy was better than the other side's | worse |
| Traded first death | its first death was traded within 5 s | not traded |
| Plant | it planted | no plant |
| Utility | more grenades than its usual round | fewer |
| Early contact | the first duel came before the match's median time | later |
| A place held | a player stood at the place 5 s or more | nobody did |
| A place reached early | a player got there in the first 25 s (the route) | nobody did |

Each comparison is a difference of two win rates with its 95% interval (Newcombe), Fisher's exact p, and a q over every factor tried (Benjamini-Hochberg). An arm with fewer than 8 rounds is marked *few rounds*. Those under the 5% false discovery rate become findings; the strongest rank above the other detectors' (an outcome finding weighs 1.35 times one of the same effect and evidence).

A made-up example over 40 rounds:

> **T** won 79% of the 19 rounds it held **Mid**, against 24% of 21 without it (55 points, 95% 26 to 74) - q 0.004.

It also follows the round's **win probability** - the chance each side had at every moment, from the men alive, the plant and the clock: fitted to the rounds when there are 30 or more, else a fixed prior model (and the text says which). From it come the **turning points** (the kills and plants that moved the chance most) and each player's **win probability added**: the kills and plants they made count for them, their deaths against, in rounds' worth over the match, a round on average with its interval, tested against zero. The places get the same balance: which side gained the most in the duels fought there.

The data needs rounds, kills and deaths with both sides, and the `won` column; named places (`place`) for places held, a `buy` column for the buy.

## Debrief

The **Debrief** tab writes the findings up as a short text: a lead, the clearest finding, one for tactics, one for balancing, then - where the data says who won - what decided the rounds, the rest grouped by detector, and how many rest on weaker evidence.

What decided the rounds comes in four paragraphs: the score and where the win probabilities come from; the strongest factors with their numbers, interval and q (when none passes the false discovery rate the text says *none of it certain yet*, and still names the strongest); the three biggest turning points; and the players who added and cost the most win probability, with the places that gained the most. A made-up example:

> T won 23 and CT won 17 of 40 rounds with a known result (T: 58%, 95% 42% to 72%). The win probabilities come from a model fitted to these rounds.
>
> What separated won from lost rounds: T won 79% of the 19 rounds it held Mid, against 24% of 21 without it (55 points, 95% 26 to 74) (q 0.004), ...
>
> Turning points: round 17 at 48 s, a kill by CT at B site moved its chance from 31% to 58%, and it took the round, ...

Each paragraph has numbered buttons that show its findings. **Copy text** copies it.

![The debrief written by the built-in narrator](assets/img/en/debrief.webp)

The built-in narrator works offline, in your language. The **Lens** selector above it (see [The knowledge lens](knowledge.md)) decides which literature the paragraphs cite.

### External AI

**AI settings** lets an AI model of your choice write the debrief instead:

| Setting | Meaning |
|---|---|
| **Provider** | Anthropic (Claude), OpenAI (ChatGPT), OpenRouter, Ollama (local), LM Studio (local), llama.cpp server (local), or any OpenAI-compatible endpoint |
| **Base URL**, **Model** | Filled in by the provider; **List models** asks the server |
| **API key** | Sent only to the base URL. Never logged, never saved in views, exports or `.3dheat` files. Most local servers need none. |
| **Remember the key in this browser** | Off by default: the key is forgotten when the page closes |
| **Use an external AI** | Off by default |
| **Send player names** | Off by default: players are sent as P1, P2 ... |

Then type an optional question and press **Write with AI**. Only the findings and their numbers are sent - never the rows of your data. The answer streams in; cited findings become buttons. Where the data says who won, the model is told to lead with what decided the rounds, with each number's interval and q, and to say when a factor rests on few rounds or the win probabilities come from the prior model.

## Caster

For **one match** (pick one if several are loaded), the **Caster** finds the moments worth watching: first blood, multi-kills, trades, clutches, objective swings, comebacks, standout players, long shots, and **turning points** - the kills that moved a side's chance to win the round the most (by the players left alive on each side, in rounds without respawns).

Where the data says who won each round, every moment says it: *"Anna takes down Ben: T's chance to win the round goes from 38% to 62% - and they take the round."* A moment of the side that went on to win counts for more when the caster picks which to keep, and a comeback is counted in rounds won.

![The caster's moments for one round of the shooter demo](assets/img/en/caster.webp)

- Click a moment: the view switches to the replay and jumps to just before it. With **Caster camera** on (the default) the caster films it (below); off, the camera flies there and stays where it went: your jump is not undone by following a player or by the tactical display's **Director** (which waits until you press **Resume director**).
- **Play the moments** plays each one to its end and moves on; **Previous** / **Next** step through them. Without the caster camera the camera follows each moment's player.

### Caster camera and subtitles

With **Caster camera** on, the caster moves the camera itself:

- **No cuts.** The camera's position and the point it looks at each follow their target on a critically damped spring: a moment across the map is a dolly that accelerates, glides and settles (longer moves take longer, up to about 1.6 s of spring time), a moment nearby a short drift. It keeps its heading towards the subject, so a move does not swing round.
- **Framing.** The target frames the moment's player and the other party where they are now, from 24° above, at a distance that holds both (1.7 times their spread, at least 60 m); while the replay plays it circles them at 6° a second.
- **Subtitles** (on by default): a bar at the bottom of the view with the moment's kind, its time (and round, and distance where it has one) and the caster's line; the player is ringed in amber and the other party in red, with their names.
- **You take over** by moving the camera or following a unit: the caster lets go at once and the bar and the panel offer **Resume caster camera**, which flies back to the moment. **×** on the bar stops the caster's camera and subtitles; **Stop** in the panel does too.

The settings are remembered in this browser ([`cinema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/insights/cast/cinema.ts), [`CasterCinema.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/insights/CasterCinema.tsx)).
- With an external AI on, **Commentary by AI** writes a commentary from the moment list (kinds, times, names or pseudonyms, teams, classes, distances).

It needs persons and kill/death (or capture) events; an `other`/`victim` column makes trades and long shots possible.

## Knowledge lens

A finding can be read through a **lens** of established knowledge: military doctrine, air and naval combat, urban operations, game design and esports (or *Auto*, chosen by the units in the data). An opened finding then shows the closest **doctrine and literature** entry and a **historical parallel**, with references, and **Lens metrics** computes measures from that literature on the data (Lanchester fits, exchange ratios, force ratios, fields of fire, key terrain, trades, initiative). The debrief and the AI prompt include them. Everything about it: [The knowledge lens](knowledge.md).

The lens metrics also measure how the players behave as a crowd and as a group - alignment and milling, route herding, lanes and trails, crowding, leaders and followers, stragglers, the breaking point under losses, risk after a lost life, streaks, buy agreement and the response to incoming fire - each against its own null model: [Collective behaviour](collective-behaviour.md).

## Data that makes insights work

- positions with **time**, a **person** and a **team** column;
- an **event** column with kills and deaths (`kill`, `death`), and others (`hit`, `fire`, `capture` ...);
- an **other party** column (`other`, `victim`) for trades and directions;
- a **vehicle** or **type** column for classes; an `ai` column for players against AI;
- a **session** / **match** / **round** column when there are several matches.

The [demo data](demo-data.md) has all of them.
