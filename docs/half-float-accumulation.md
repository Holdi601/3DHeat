---
title: Half-float accumulation
parent: Rendering internals
nav_order: 4
---

# Half-float accumulation

A device that cannot blend into 32-bit float textures (no `float32-blendable` and `float32-filterable` on WebGPU, no `EXT_float_blend` on WebGL2) gets a **16-bit float** (`r16float`) heat target: a maximum of 65,504 and 11 bits of mantissa. A dense field reaches several hundred thousand, so a 16-bit target both **clips** and **rounds**, and the rounding error grows with the value - which presents very specifically: the densest areas read far cooler than they are while sparse areas look fine. Two mechanisms handle it; the picture is only correct if both work.

## Range: a gain on every splat

Every splat is multiplied by a **gain**, and the composite divides it back out, so the field sits in the magnitude half floats handle well ([`heatGain`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

```
estimate = analytic saturation estimate for this dataset, radius and centre intensity
gain     = 2 ^ round(log2(2048 / estimate)),  exponent clamped to -20..20
```

2048 leaves about 32× headroom above the top of the ramp before 65,504. The gain is a **power of two**, so a small drift in the estimate leaves it - and the accumulated buffer - unchanged, and it is part of the [geometry signature](accumulation.md#what-restarts-it), so a change restarts the accumulation.

It is anchored to the analytic estimate and deliberately **not** to the saturation point. The saturation is applied at composite precisely so that dragging it never restarts convergence; if the gain moved with it, the buffer would still hold values written at the old gain while the composite divided by the new one, the two errors would cancel exactly, and the slider would appear to do nothing.

On a 32-bit target the gain is always 1.

## Precision: partial frames from zero

A frame merged into the accumulator at weight 1/n is first splatted into a **scratch target** from zero and then blended in, rather than splatted directly into the accumulator at 1/n weight ([Accumulation](accumulation.md#why-each)). Directly, each sprite's contribution would be 1/n of the size of the running total it is added to, and a half float rounds those away - worse the denser the pixel. From zero, every addend is comparable to the total it joins, which is the same arithmetic a single frame already does.

## Measured effect

From the README, on one scene, reading the field in matched units:

| | p50 | p90 | p99 | max |
|---|---|---|---|---|
| 32-bit (reference) | 6051 | 60742 | 121199 | 232744 |
| 16-bit before | 1372 | 6972 | 7840 | 7840 |
| 16-bit after | 5996 | 59666 | 118824 | 210357 |

The peak went from 30× too low to 0.90×, and the composited frame matches the 32-bit one to 0.1% of mean luma.

## Testing it

`?heat=f16` forces this path on either backend - without a switch, the arithmetic that only weaker GPUs run would only ever be tested by the people running it. `npm run smoke:f16` runs the whole browser suite with it.

Readbacks undo the gain: auto-exposure divides the read field by it, and `engine.readHeatProbe()` passes it to the renderer - which is also how the [ruler's live heat readout](measure.md#notes) is read.
