---
title: Software rendering detection
parent: Rendering internals
nav_order: 6
---

# Software rendering detection

When a browser has hardware acceleration switched off, or its driver is blocklisted, it draws WebGL and WebGPU on the CPU. Everything still works, many times slower, and the experience is "this viewer is unusably slow with my data" - a symptom that points at the tool, not at a switch in the browser. So the viewer looks at the renderer's name and says so ([`gpuClass.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/gpuClass.ts)).

## The banner

When the renderer is positively identified as software, a red box appears at the top of the sidebar (Heatmap and Match tabs), above the mode bar:

> **Running without the graphics card.**
> This browser is drawing on the CPU instead of the graphics card, which is many times slower and will not handle large datasets. Turn on hardware acceleration in the browser settings (Chrome: Settings → System → "Use graphics acceleration when available", then restart), and check that the graphics driver is up to date.

## How it decides

The renderer string - WebGL2's `UNMASKED_RENDERER_WEBGL`, or WebGPU's adapter vendor, architecture and device - is lower-cased and classified:

- **software** when it contains `swiftshader`, `llvmpipe`, `softpipe`, `swrast`, `microsoft basic render driver`, `apple software renderer` or `generic renderer`;
- **hardware** when it contains a known GPU vendor or family (`nvidia`, `geforce`, `rtx`, `quadro`, `amd`, `radeon`, `intel`, `arc`, `apple m`, `adreno`, `mali`, `powervr`, `xclipse`);
- **unknown** otherwise.

Only *software* raises the banner. An unrecognised adapter says nothing at all: sending someone with a working GPU off to reconfigure their browser is a worse failure than missing a case.

## The short name

The same module shortens the renderer string for display: from an ANGLE string such as `ANGLE (Vendor, Vendor Model (0x0000ABCD) Direct3D11 vs_5_0 ps_5_0, D3D11)` it keeps the device field, drops the PCI id and the trailing API and shader model, and shows `Vendor Model`. The short name appears in **Resource budgets**, with the full string as its tooltip; the memory estimate shows the full string.
