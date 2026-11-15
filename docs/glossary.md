---
title: Glossary
nav_order: 21
---

# Glossary

Short meanings of the words this site uses, in plain language. Each entry links to the page that explains it in full.

## Data

**Row.** One line of your data: one thing that happened at one place and time, for example "player 7 was here at second 12". The viewer draws every row. [Data formats](data-formats.md)

**Column.** One kind of value in the rows, such as x, y, z, time or team. The viewer guesses which column is which, and you can change the guess. [Column mapping](column-mapping.md)

**CSV.** A plain text table: one row per line, values separated by commas. Almost every program can write one. [Loading files](loading-files.md)

**Parquet.** A compact table file that is quick to read, even with millions of rows. It is the best format to give the viewer. [Loading files](loading-files.md)

**Event.** Something that happened, such as a shot, a hit, a kill or a take-off. A row can be an event, or just "I was here". [Filters](filters.md)

**Person.** The one who made the rows: a player, a pilot, a car or a tank. One person is one line of positions through time. [Sessions, persons and groups](sessions-persons-groups.md)

**Group (team).** A set of persons shown in the same colour, for example Blue and Red. [Sessions, persons and groups](sessions-persons-groups.md)

**Session (match, round).** One run of the game. A match or a round is a session. The viewer can show one session or lay many over each other. [Sessions, persons and groups](sessions-persons-groups.md)

**Level.** The 3D map the data happened on: ground, buildings, walls. Rows show up where they happened on the level. [Levels and background geometry](levels.md)

## Looking at the data

**Heatmap.** A picture where places that many rows touch glow hotter. Cold places are quiet, hot places are busy. [Heat](heat.md)

**Heat.** How much happened at a spot. The viewer adds up every row's glow at each place; the sum is the heat. [Heat](heat.md)

**Sprite.** The small glowing blob the viewer draws for one row. Many overlapping sprites add up to heat. [Sprite shape](sprite-shape.md)

**Exposure.** How bright the picture is. Like a camera, too much exposure turns everything white and too little hides the detail. [Colour and exposure](colour-and-exposure.md)

**Saturation.** The amount of heat that counts as "as hot as the colours go". Lower it to make quiet places show up; raise it to see only the hottest. [Colour and exposure](colour-and-exposure.md)

**Volume.** A box or shape you place in the 3D view. The viewer counts what is inside it and can compare volumes with each other. [Volumes and comparison](volumes.md)

**Filter.** A rule that hides rows you do not want, for example "only kills" or "only team Red". [Filters](filters.md)

## Replay

**Figure.** A small model of a tank, plane, car or soldier that moves where the data says it was. [Figures](figures.md)

**LOD (level of detail).** Each figure has a detailed, a simpler and a very simple version. Near ones use the detailed one and far ones the simple one, so thousands can be drawn at once. [Figures](figures.md)

## Racing

**Lap.** One trip round the course, from the line back to the line. [Loading laps](race-loading-laps.md)

**Reference lap.** The lap all the others are compared with. Differences are shown as "faster" or "slower" than it. [Loading laps](race-loading-laps.md)

**Apex.** The point of a corner where the car is closest to the inside edge. [Corner-by-corner analysis](race-corner-analysis.md)

**Slip.** How much a tyre slides. A little slip gives the most grip; too much and the car skids. [Race analytics: the method](race-analytics.md)

**Envelope.** What a car can do at each speed: how hard it can turn, brake and accelerate before it slides. [Race analytics: the method](race-analytics.md)

## Aircraft numbers

**ALT.** Altitude: the height above the ground or sea level. [Match replay](match-replay.md#labels-and-statistics)

**TAS.** True airspeed: how fast a plane moves through the air. [Match replay](match-replay.md#labels-and-statistics)

## Computer

**GPU.** The graphics card or chip. It draws the picture and is much faster than the main processor at drawing millions of blobs. [The two backends](backends.md)

**WebGPU / WebGL2.** The two ways a browser lets a page use the GPU. WebGPU is newer. The viewer can use either and picks the best one your browser has. [The two backends](backends.md)

## Counter-Strike words

**Round.** One short fight inside a match. One side wins it, and the score goes up by one.

**Eco, force buy, full buy.** How much money a side spends on weapons at the start of a round. An eco saves money and buys almost nothing (under $1,500 a player on average). A force buy spends what it has (under $4,000). A full buy buys everything it can. [Match analysis](match-analysis.md)

**Trade.** A kill that pays back a kill: you are shot, and a teammate shoots your killer within 5 seconds. [Match analysis](match-analysis.md)

**KAST.** The share of rounds in which a player got a kill, an assist, survived, or was traded. A higher number means the player helped in more rounds. [Match analysis](match-analysis.md)

**ADR.** Average damage per round: how much health a player took from enemies each round. [Match analysis](match-analysis.md)
