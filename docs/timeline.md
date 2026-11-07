---
title: Timeline and playback
nav_order: 4
---

# Timeline and playback

The bar under the view is the timeline ([`Timeline.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/Timeline.tsx)). It decides which rows are visible at any moment. It needs a time column; without one the whole bar is disabled, the view stays in **All**, and the sidebar says *No time column in this data - the timeline is disabled and every datapoint is shown at once.*

## All and Play

Two top-level modes, because they answer different questions.

- **All** (the default on every load) ignores the playhead entirely and shows every row that passes the filters. It is the "where does this happen" view, and it is not the same as scrubbing to the end. The scrubber is disabled and the clock reads `all · <span> of data`.
- **Play** runs the data as a timelapse. The scrubber, the transport and the history settings appear.

Choosing **All** also stops playback.

## The controls

| Control | Default | Meaning |
|---|---|---|
| Scrubber | the start | The playhead. Drag to seek; 20,000 steps across the range. |
| **All** / **Play** | All | See above. |
| ▶ / ❚❚ | paused | Play or pause; also `K`. |
| ⏮ | | Back to the start of the range. |
| Clock | | `elapsed / total` as `mm:ss.s` (or `h:mm:ss`), and, when the time column is an absolute timestamp, the wall-clock time of day of the playhead as `HH:MM:SSZ` (UTC). |
| **Speed** | 1× | Dataset seconds per real second: 0.25, 0.5, 1, 2, 4, 8, 16, 60, 300 or 1800×. |
| **History** | Cumulative | What counts as visible at the playhead: *Cumulative*, *Window* or *Lifetime* (below). |
| **Span** (Window; in Lines mode also Lifetime) | 30 s | Length of the window ending at the playhead; at least 0.01 s. In [Line heat](line-heat.md#playback) it is the tail length. |
| **Fallback life** (Lifetime only, not in Lines mode) | 10 s | How long a datapoint with no next sample of its person stays visible. |
| **Fade** (Lifetime only, not in Lines mode) | 0.4 | Fraction of each datapoint's life spent fading out, 0-1. |
| **Loop** | on | At the end, start again; off stops at the end. |
| Right side | | The dataset's name. |

The **range** is the dataset's time span - or, in [box replay](box-replay.md) with a session selected, that session's span.

## History

In Play mode:

- **Cumulative** - everything from the start of the range up to the playhead. Heat builds up as it plays.
- **Window** - a fixed span of history ending at the playhead (*Span*).
- **Lifetime** - each datapoint lives until the **same person's next sample** (in the same session), so exactly one position per person is current at any instant. A datapoint whose person never appears again - a death, a disconnect, the end of the log - has no next sample, and lives for the *Fallback life* instead of vanishing at once or persisting forever. Datapoints **fade out** over the last *Fade* fraction of their life rather than popping off: with one sample live per person, a datapoint disappearing between one frame and the next makes the whole field flicker at the sample rate. *Fade* 0 restores the hard cut.

Lifetime needs a person column as well as a time column; without one the history falls back to Cumulative on load. In [Line heat](line-heat.md#playback) the history sets how long a route's tail stays visible; in [Box replay](box-replay.md) the *Fallback life* is how long a person with no further samples is held.

## Playback behaviour

From the frame loop ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

- The playhead advances by *frame time × speed*. The frame time is capped at 0.1 s, so switching tabs does not teleport the playhead.
- Pressing play at the very end of the range starts from the beginning, as a media player does. On every load the playhead is parked at the start, so the first press of play plays.
- At the end of the range the playhead jumps back to the start (Loop on) or stops there and playback ends (Loop off).
- The scrubber reads the engine's playhead directly every frame; the application state is updated on seeks, starts, stops and loops.
- Picking a session in the Session picker seeks to that session's start.

## Why playback is smooth, and cheap

Rows are stored sorted by time, so a time window is two binary searches over the time column: advancing the playhead moves two integers and touches no row, and playback cost follows the number of rows in the window, not the size of the dataset.

How the heat is kept steady while the window moves depends on the history ([Accumulation](accumulation.md)):

- **Cumulative** only ever grows, so each frame adds just the rows that became visible since the last one, at full weight. The field builds monotonically and pausing changes nothing, because there is nothing left to arrive. (Re-estimating instead would make each frame light a different random subset and then fade it, which reads as bursts flaring and vanishing.)
- **Window** and **Lifetime** genuinely change every frame and are re-estimated, blended as an exponential moving average (weight 0.34 for the new frame), which is unbiased in steady state and much quieter than starting over.
- In Lifetime mode the candidate rows are those from *playhead - max(longest gap in the data, Fallback life)* up to the playhead; the shader then drops each row whose own life has ended and applies the fade.

Switching between All and Play, or changing the history, restarts the accumulation.

## Keyboard

| Key | Effect |
|---|---|
| `K` | Play / pause |

The key is ignored while a text box or menu has focus. In the Race analysis tab `K` drives that tab's own replay instead.
