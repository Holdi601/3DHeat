---
title: "Detekce softwarového vykreslování"
parent: "Vnitřní fungování vykreslování"
nav_order: 6
lang: "cs"
source: "software-rendering.md"
source_hash: "2ae9a1addecb"
translated: true
outdated: false
---

# Detekce softwarového vykreslování

Když váš prohlížeč kreslí na hlavním procesoru místo na grafické kartě, prohlížeč je mnohonásobně pomalejší. Prohlížeč to pozná a ukáže červenou krabici, která vám řekne, co zapnout.

Když má prohlížeč vypnutou hardwarovou akceleraci, nebo je jeho ovladač na seznamu zakázaných, kreslí WebGL a WebGPU na CPU. Všechno pořád funguje, jen mnohonásobně pomaleji, a výsledek je pocit „tenhle prohlížeč s mými daty je nepoužitelně pomalý“ – příznak, který ukazuje na nástroj, ne na přepínač v prohlížeči. Prohlížeč proto kouká na název rendereru a řekne to ([`gpuClass.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/gpuClass.ts)).

## Banner {#the-banner}

Když je renderer jednoznačně určen jako softwarový, nahoře v postranním panelu (na kartách Teplotní mapa a Zápas), nad lištou režimů, se objeví červená krabice:

![Červený banner: Běží bez grafické karty](../assets/img/en/software-rendering-banner.webp)

> **Běží bez grafické karty.**
> Tento prohlížeč kreslí na CPU místo na grafické kartě, což je mnohonásobně pomalejší a velké datové sady nezvládne. Zapněte hardwarovou akceleraci v nastavení prohlížeče (Chrome: Nastavení → Systém → „Použít akceleraci grafiky, je-li k dispozici“, pak restartujte) a zkontrolujte, že ovladač grafiky je aktuální.

## Pro vývojáře {#for-developers}

### Jak to rozhoduje {#how-it-decides}

Řetězec rendereru – `UNMASKED_RENDERER_WEBGL` na WebGL2, nebo dodavatel, architektura a zařízení adaptéru na WebGPU – se převede na malá písmena a zařadí se:

- **software**, když obsahuje `swiftshader`, `llvmpipe`, `softpipe`, `swrast`, `microsoft basic render driver`, `apple software renderer` nebo `generic renderer`;
- **hardware**, když obsahuje známého dodavatele nebo rodinu GPU (`nvidia`, `geforce`, `rtx`, `quadro`, `amd`, `radeon`, `intel`, `arc`, `apple m`, `adreno`, `mali`, `powervr`, `xclipse`);
- **neznámé** jinak.

Banner se ukáže jen pro *software*. Nerozpoznaný adaptér neřekne vůbec nic: poslat člověka s funkční GPU přenastavovat prohlížeč je horší chyba než minout případ.

### Krátký název {#the-short-name}

Tentýž modul zkracuje řetězec rendereru pro zobrazení: z řetězce ANGLE jako `ANGLE (Vendor, Vendor Model (0x0000ABCD) Direct3D11 vs_5_0 ps_5_0, D3D11)` si ponechá pole zařízení, vynechá PCI id a koncovou verzi API a shaderů a ukáže `Vendor Model`. Krátký název se objeví v **Rozpočtech prostředků**, s úplným řetězcem jako nápovědou; odhad paměti ukazuje úplný řetězec.
