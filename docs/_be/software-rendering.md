---
title: "Выяўленне праграмнага рэндэрынгу"
parent: "Унутраная будова рэндэрынгу"
nav_order: 6
lang: "be"
source: "software-rendering.md"
source_hash: "2ae9a1addecb"
translated: true
outdated: false
---

# Выяўленне праграмнага рэндэрынгу

Калі ваш браўзер малюе на галоўным працэсары, а не на відэакарце, праглядальнік працуе ў некалькі разоў павольней. Праглядальнік гэта заўважае і паказвае чырвоную рамку, якая кажа, што трэба ўключыць.

Калі ў браўзеры выключана апаратнае паскарэнне або яго драйвер заблакаваны, ён малюе WebGL і WebGPU на CPU. Усё працуе, але ў некалькі разоў павольней, і ўражанне — «гэты праглядальнік з маімі данымі не працуе з-за павольнасці» — сімптам, які паказвае на інструмент, а не на перамыкач у браўзеры. Таму праглядальнік глядзіць на назву рэндэрара і кажа пра гэта ([`gpuClass.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/gpuClass.ts)).

## Банэр {#the-banner}

Калі рэндэрар дакладна вызначаны як праграмны, над панэллю рэжымаў уверсе бакавой панэлі (укладкі Heatmap і Match) з'яўляецца чырвоная рамка:

![Чырвоны банэр: праца без відэакарты](../assets/img/en/software-rendering-banner.webp)

> **Running without the graphics card.**
> This browser is drawing on the CPU instead of the graphics card, which is many times slower and will not handle large datasets. Turn on hardware acceleration in the browser settings (Chrome: Settings → System → "Use graphics acceleration when available", then restart), and check that the graphics driver is up to date.

## Для распрацоўшчыкаў {#for-developers}

### Як вызначаецца {#how-it-decides}

Радковая назва рэндэрара — `UNMASKED_RENDERER_WEBGL` у WebGL2 або вытворца адаптара, архітэктура і прылада ў WebGPU — пераводзіцца ў ніжні рэгістр і класіфікуецца:

- **software**, калі ўтрымлівае `swiftshader`, `llvmpipe`, `softpipe`, `swrast`, `microsoft basic render driver`, `apple software renderer` або `generic renderer`;
- **hardware**, калі ўтрымлівае вядомага вытворцу або сямейства GPU (`nvidia`, `geforce`, `rtx`, `quadro`, `amd`, `radeon`, `intel`, `arc`, `apple m`, `adreno`, `mali`, `powervr`, `xclipse`);
- **unknown** у іншым выпадку.

Толькі *software* выводзіць банэр. Нераспазнаны адаптар нічога не кажа: адпраўляць таго, у каго працуе GPU, перанастройваць свой браўзер — горшая памылка, чым прапусціць адзін выпадак.

### Кароткая назва {#the-short-name}

Той жа модуль скарочвае радковую назву рэндэрара для паказу: з радка ANGLE, такога як `ANGLE (Vendor, Vendor Model (0x0000ABCD) Direct3D11 vs_5_0 ps_5_0, D3D11)`, ён захоўвае поле прылады, выдаляе PCI id, канцавыя API і мадэль шэйдара і паказвае `Vendor Model`. Кароткая назва з'яўляецца ў **Бюджэты рэсурсаў**, з поўнай радковай назвай як падказкай; ацэнка памяці паказвае поўную радковую назву.
