---
title: "Zaznavanje programskega upodabljanja"
parent: "Notranjosti upodabljanja"
nav_order: 6
lang: "sl"
source: "software-rendering.md"
source_hash: "2ae9a1addecb"
translated: true
outdated: false
---

# Zaznavanje programskega upodabljanja

Če brskalnik riše s glavnim procesorjem namesto z grafično kartico, je pregledovalnik večkrat počasnejši. Pregledovalnik to opazi in prikaže rdeč okvir, ki vam pove, kaj vklopiti.

Kadar ima brskalnik izklopljeno strojno pospeševanje ali je njegov gonilnik na črni listi, riše WebGL in WebGPU na procesorju. Vse še vedno deluje, le večkrat počasneje, izkušnja pa je »ta pregledovalnik s svojimi podatki ni uporaben« – simptom, ki kaže na orodje, ne na stikalo v brskalniku. Zato pregledovalnik pogleda ime upodabljalnika in to pove ([`gpuClass.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/gpuClass.ts)).

## Obvestilo {#the-banner}

Kadar je upodabljalnik zanesljivo prepoznan kot programski, se na vrhu stranske vrstice (zavihka Toplotni zemljevid in Tekma), nad vrstico načinov, pojavi rdeč okvir:

![Rdeče obvestilo: Deluje brez grafične kartice](../assets/img/en/software-rendering-banner.webp)

> **Deluje brez grafične kartice.**
> Ta brskalnik riše s procesorjem namesto z grafično kartico, kar je večkrat počasneje in ne zmore velikih naborov podatkov. V nastavitvah brskalnika vklopite strojno pospeševanje (Chrome: Nastavitve → Sistem → „Uporabi grafično pospeševanje, ko je na voljo“, nato znova zaženite brskalnik) in preverite, ali je gonilnik grafične kartice posodobljen.

## Za razvijalce {#for-developers}

### Kako se odloči {#how-it-decides}

Niz upodabljalnika – `UNMASKED_RENDERER_WEBGL` pri WebGL2 ali proizvajalec, arhitektura in naprava adapterja pri WebGPU – se pretvori v male črke in razvrsti:

- **programski** (software), kadar vsebuje `swiftshader`, `llvmpipe`, `softpipe`, `swrast`, `microsoft basic render driver`, `apple software renderer` ali `generic renderer`;
- **strojni** (hardware), kadar vsebuje znanega proizvajalca ali družino GPU (`nvidia`, `geforce`, `rtx`, `quadro`, `amd`, `radeon`, `intel`, `arc`, `apple m`, `adreno`, `mali`, `powervr`, `xclipse`);
- **neznani** (unknown) sicer.

Samo *programski* sproži obvestilo. Neprepoznan adapter ne reče nič: poslati nekoga z delujočim GPU-jem, naj prilagodi svoj brskalnik, je hujša napaka kot zamujen primer.

### Kratko ime {#the-short-name}

Isti modul skrajša niz upodabljalnika za prikaz: iz niza ANGLE, kot je `ANGLE (Vendor, Vendor Model (0x0000ABCD) Direct3D11 vs_5_0 ps_5_0, D3D11)`, ohrani polje naprave, izpusti PCI id in končni API in model senčilnikov ter prikaže `Vendor Model`. Kratko ime se prikaže v **Proračunih virov**, s celotnim nizom kot namigom ob ustavitvi miške; ocena pomnilnika prikaže celoten niz.
