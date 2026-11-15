---
title: "Half-float-Akkumulatioun"
parent: "Rendering-Interna"
nav_order: 4
lang: "lb"
source: "half-float-accumulation.md"
source_hash: "9217287b1c9e"
translated: true
outdated: false
---


# Half-Float-Akkumulatioun

E puer Grafikkarten kënnen d'Heat nëmmen a klenge 16-Bit-Zuelen halen, wat déi hëchst Plazen ofschneide oder runden kéint. D'Visualisatioun skaléiert d'Zuelen, sou datt dat net siichtbar gëtt. Dir musst näischt maachen; dës Säit ass fir Entwéckler.

## Fir Entwéckler {#for-developers}

En Apparat, dee net an 32-Bit-Float-Texturen mësche kann (kee `float32-blendable` an `float32-filterable` op WebGPU, kee `EXT_float_blend` op WebGL2), kritt e **16-Bit-Float**-Heat-Zil (`r16float`): höchstens 65.504 an 11 Bit Mantisse. E dichtt Feld erreecht e puer Honnertdausend, dofir **schneit** en 16-Bit-Zil ofwéi a **rennt** och, an de Rondungsfeeler wiisst mat dem Wäert - dat äussert sech ganz bestëmmt: déi dichtsten Gebidder sinn vill ze kal, wärend déi dënnen gutt ausgesinn. Zwee Mechanismen maachen dat; d'Bild ass nëmmen richteg, wann bedeed funktionéieren.

### Beräich: eng Verstäerkung op all Splat {#range-a-gain-on-every-splat}

All Splat gëtt mat enger **Verstäerkung** multiplizéiert, a beim Composite gëtt se erëm erausgerechent. Sou sëtzt d'Feld am Gréisste-Beräich, mat deem Half-Floats gutt zerechtkommen ([`heatGain`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

```
Schätzung = analytesch Sättigungsschätzung fir dësen Datesaz, Radius an Zentrumsintensitéit
Verstäerkung = 2 ^ round(log2(2048 / Schätzung)), Exponent begrenzt op -20..20
```

2048 léisst ongeféier 32-fache Spillraum iwwer der Spëtzt vum Verlaf, ier 65.504 erreecht sinn. D'Verstäerkung ass eng **Zweierpotenz**: e klenge Rutsch an der Schätzung léisst se - an de gesammelte Puffer - onverännert. Si ass Deel vun der [Geometrie-Signatur](accumulation.md#what-restarts-it), sou datt eng Ännerung d'Akkumuléierung nei ufänkt.

Si hänkt un der analytescher Schätzung a bewosst **net** un der Sättigungspunkt. D'Sättigung gëtt beim Composite ugewannt, just dofir, datt se beim Zéien ni d'Konvergenz nei ufänkt; wann d'Verstäerkung mat där géif mëtzéien, hätt de Puffer nach ëmmer d'Wäerter vun der aalter Verstäerkung, während de Composite duerch déi nei dividéiert. D'Fehler géifen sech genau ophiewen, an de Schieber géif sech ouni Wierkung uneieren.

Bei engem 32-Bit-Zil ass d'Verstäerkung ëmmer 1.

### Genauegkeet: Deelbiller vun Null un {#precision-partial-frames-from-zero}

E Bild, dat mat dem Gewiicht 1/n an den Akkumulator gemëscht gëtt, gëtt zuerst vun Null u a en **Schmiirzil** gespritzt an dann dran gemëscht, anstatt direkt mat 1/n Gewiicht an den Akkumulator ze spritzen ([Akkumuléierung](accumulation.md#why-each)). Direkt wier de Bäitrag vun all Sprite nëmmen 1/n vun der lafender Zomm, zu där en dobäikënnt, an en Half-Float rennt déi ewech - a méi dicht den Pixel ass, deem méi. Vu Null u ass all Zomm vergläichbar mat der Zomm, an déi se sech unhänkt; dat ass d'selwecht Rechnung, déi e eenzegt Bild schonn ausféiert.

### Gemooss Effekt {#measured-effect}

Op enger dichter synthetescher Szen, wou d'Feld a passenden Eenheeten gelies gëtt:

| | p50 | p90 | p99 | max |
|---|---|---|---|---|
| 32-Bit (Referenz) | 6051 | 60742 | 121199 | 232744 |
| 16-Bit vir der Ännerung | 1372 | 6972 | 7840 | 7840 |
| 16-Bit no der Ännerung | 5996 | 59666 | 118824 | 210357 |

Den Héichstwäert ass vun 30-mol ze niddreg op 0,90-mol gaangen, an d'Composite-Bild stëmmt mat dem 32-Bit-Bild bis op 0,1 % vun der mëttlerer Hellegkeet iwwereneen.

### Testen {#testing-it}

`?heat=f16` erzwéngt dësen Wee op béide Backends - ouni dee Schalter géif d'Rechnung, déi nëmmen schwächer GPUen maachen, nëmmen vun deenen getest, déi se benotzen. `npm run smoke:f16` fiert d'ganz Browser-Testsuite domat.

D'Liesunge maachen d'Verstäerkung réckgängeg: d'Auto-Belichtung deelt d'gelies Feld dodrenner, an `engine.readHeatProbe()` gëtt se dem Renderer iwwer - dat ass och, wéi d'[Live-Heat-Liesung vum Lineal](measure.md#notes) gelies gëtt.
