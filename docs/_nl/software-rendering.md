---
title: "Detectie van softwarerendering"
parent: "Renderinginterne werking"
nav_order: 6
lang: "nl"
source: "software-rendering.md"
source_hash: "2ae9a1addecb"
translated: true
outdated: false
---

# Detectie van softwarerendering

Als je browser op de hoofdprocessor tekent in plaats van op de grafische kaart, is de viewer vele malen trager. De viewer merkt dat en toont een rood vak dat zegt wat je moet aanzetten.

Wanneer een browser hardwareversnelling heeft uitgeschakeld, of zijn stuurprogramma op de zwarte lijst staat, tekent hij WebGL en WebGPU op de CPU. Alles werkt nog, maar vele malen trager, en de ervaring is "deze viewer is onbruikbaar traag met mijn data" - een symptoom dat naar het hulpmiddel wijst, niet naar een schakelaar in de browser. Daarom kijkt de viewer naar de naam van de renderer en zegt dat ([`gpuClass.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/gpuClass.ts)).

## De banner {#the-banner}

Wanneer de renderer positief als software is herkend, verschijnt er een rood vak bovenaan de zijbalk (tabbladen Heatmap en Match), boven de modusbalk:

![De rode banner: Draait zonder grafische kaart](../assets/img/en/software-rendering-banner.webp)

> **Draait zonder grafische kaart.**
> Deze browser tekent op de CPU in plaats van op de grafische kaart; dat is vele malen trager en kan grote datasets niet aan. Zet hardwareversnelling aan in de browserinstellingen (Chrome: Instellingen → Systeem → "Grafische versnelling gebruiken indien beschikbaar", en start daarna opnieuw), en controleer of het grafische stuurprogramma up-to-date is.

## Voor ontwikkelaars {#for-developers}

### Hoe het beslist {#how-it-decides}

De renderertekst - `UNMASKED_RENDERER_WEBGL` van WebGL2, of de leverancier, architectuur en het apparaat van de WebGPU-adapter - wordt in kleine letters gezet en ingedeeld:

- **software** wanneer hij `swiftshader`, `llvmpipe`, `softpipe`, `swrast`, `microsoft basic render driver`, `apple software renderer` of `generic renderer` bevat;
- **hardware** wanneer hij een bekende GPU-leverancier of -familie bevat (`nvidia`, `geforce`, `rtx`, `quadro`, `amd`, `radeon`, `intel`, `arc`, `apple m`, `adreno`, `mali`, `powervr`, `xclipse`);
- **onbekend** anders.

Alleen *software* zet de banner aan. Een niet-herkende adapter zegt helemaal niets: iemand met een werkende GPU naar zijn browserinstellingen sturen is een slechtere fout dan een geval missen.

### De korte naam {#the-short-name}

Dezelfde module verkort de renderertekst voor weergave: van een ANGLE-tekst zoals `ANGLE (Vendor, Vendor Model (0x0000ABCD) Direct3D11 vs_5_0 ps_5_0, D3D11)` houdt hij het apparaatveld, laat de PCI-id en de afsluitende API- en shaderversie weg, en toont `Vendor Model`. De korte naam verschijnt onder **Resourcebudgetten**, met de volledige tekst als tooltip; de geheugenschatting toont de volledige tekst.
