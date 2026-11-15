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
2. Read the list. Each finding has a strength bar, a sentence, how good the evidence is (*Strong evidence*, *Good evidence* or *Some evidence*), which detector found it, and the vehicle class where that matters.
3. **Click a finding**: the viewer applies its filters, flies the camera to the place and jumps to the time, and opens the details: the effect with its 95% interval, the p and q values, the counted evidence, and **Volume here**, which draws a [volume](volumes.md) round the place.
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
| **Players** | Players killing or dying far more or less than others in the same class | persons and kills |
| **Chokes and flanks** | Choke points (far more crossings than the ground around) and flank routes (rarely used, but lead to kills) | persons |
| **Value** | *Costly ground* and *Earning ground* | [value columns](value-weighting.md) |

Detectors that cannot run on the data are listed at the bottom with the reason.

### How findings are ranked

Every place or group is tested against the rest of the map (exact binomial or rate tests). The false discovery rate is held at 5% (Benjamini-Hochberg). Chance can look like a pattern; this keeps false alarms low: among the findings shown, at most about one in twenty is expected to be chance. Effects from few events are pulled toward "no effect" before ranking. At most 60 findings are listed, and every detector gets a few places near the top.

## Debrief

The **Debrief** tab writes the findings up as a short text: a lead, the clearest finding, one for tactics, one for balancing, the rest grouped by detector, and how many rest on weaker evidence. Each paragraph has numbered buttons that show its findings. **Copy text** copies it.

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

Then type an optional question and press **Write with AI**. Only the findings and their numbers are sent - never the rows of your data. The answer streams in; cited findings become buttons.

## Caster

For **one match** (pick one if several are loaded), the **Caster** finds the moments worth watching: first blood, multi-kills, trades, clutches, objective swings, comebacks, standout players, long shots.

![The caster's moments for one round of the shooter demo](assets/img/en/caster.webp)

- Click a moment: the view switches to the replay, jumps to just before it, flies there and follows the player.
- **Play the moments** plays each one to its end and moves on; **Previous** / **Next** step through them.
- With an external AI on, **Commentary by AI** writes a commentary from the moment list (kinds, times, names or pseudonyms, teams, classes, distances).

It needs persons and kill/death (or capture) events; an `other`/`victim` column makes trades and long shots possible.

## Knowledge lens

A finding can be read through a **lens** of established knowledge: military doctrine, air and naval combat, urban operations, game design and esports (or *Auto*, chosen by the units in the data). An opened finding then shows the closest **doctrine and literature** entry and a **historical parallel**, with references, and **Lens metrics** computes measures from that literature on the data (Lanchester fits, exchange ratios, force ratios, fields of fire, key terrain, trades, initiative). The debrief and the AI prompt include them. Everything about it: [The knowledge lens](knowledge.md).

## Data that makes insights work

- positions with **time**, a **person** and a **team** column;
- an **event** column with kills and deaths (`kill`, `death`), and others (`hit`, `fire`, `capture` ...);
- an **other party** column (`other`, `victim`) for trades and directions;
- a **vehicle** or **type** column for classes; an `ai` column for players against AI;
- a **session** / **match** / **round** column when there are several matches.

The [demo data](demo-data.md) has all of them.
