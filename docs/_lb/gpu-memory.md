---
title: "GPU-Späicher-Residenz"
parent: "Rendering-Interna"
nav_order: 5
lang: "lb"
source: "gpu-memory.md"
source_hash: "fba5dac6a137"
translated: true
outdated: false
---


# GPU-Späicherresidenz

D'Grafikkaart huet nëmmen sou vill Späicher. Passen Är Daten net dran, weist d'Visualisatioun, wat passt, a seet et: d'Statistikanzeig kritt eng orange Zeil **Net am Späicher** mat der Zuel vun den Zeilen, déi fortgeloosse goungen. E gekierztene Datesaz, deen komplett ausgesäit, wier de gréisste Feeler, deen en Analyse-Tool maache kann, dofir gëtt dës Zeil ni verstoppt.

![D'Statistikanzeig mat der orangener Zeil Net am Späicher](../assets/img/en/gpu-memory-not-resident.webp)

Fir méi ze passen, erhéicht d'GPU-Budget ënner **Ressourcebudgeten** a lued nei ([Erënnerung an Budgeten](memory-and-budgets.md#raising-the-gpu-budget)), engem d'Daten fir d'éischt méi schmuel maachen, oder benotzt eng Kaart mat méi Späicher.

## Fir Entwéckler {#for-developers}

### Wéi d'Zeilen op der GPU gespäichert ginn {#how-rows-are-stored-on-the-gpu}

D'Zeilen ginn eemol higelueden, wann en Datesaz ukënnt, a **Stécker** vu 8.388.608 Zeilen (2²³) ([`CHUNK_ROWS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)). All Stéck gëtt an de eegene Begrenzungsrahm an d'Zäitspann quantiséiert:

| Daten | Format | Bytes pro Zeil |
|---|---|---|
| Positioun X, Y, Z an d'Gruppe-ID | véier 16-Bit-Ganzzuelen ouni Vorzeechen (RGBA16UI op WebGL2); X, Y, Z innerhalb vum Begrenzungsrahm vum Stéck | 8 |
| Zäit an Liewensdauer (wann den Datesaz Zäit a Persoun huet) | zwou 16-Bit-Ganzzuelen ouni Vorzeechen (RG16UI): d'Zäit innerhalb vun der Zäitspann vum Stéck; d'Liewensdauer, wou 65.535 heescht "kee nächste Punkt" | 4 |

D'Begrenzungsrahmen pro Stéck maachen, datt 16 Bit duergeet: e Stéck deckt normalerweis e Stéck vun der Kaart of, dofir ass de Quantiséierungsschrëtt ënner engem Zentimeter op enger Kaart vu Kilometeren Breet - vill ënner dem Rauschen vun echter Telemetrie. D'Gruppe-ID an dem véierten Kanal ass gratis - a sie ass de Grond, firwat et héchstens 4.096 Gruppen ginn kann ([Gruppen](sessions-persons-groups.md#limits)).

Op WebGL2 ass all Stéck eng Textur, 8.192 Texel breet, opgefëllt op ganz Textur-Zeilen; d'Zeilen gi vum `gl_VertexID` aus iwwer eng Blockindex-Textur pro Bild erreecht. Op WebGPU sinn se Storage-Buffer.

Weider GPU-Späicher pro Zeil, deen beim Gebrauch zougewise gëtt:

- all aktiven Kolonnefilter ([Filter](filters.md)): 4 Byte pro Zeil (32-Bit-Float-Wäerter oder Kategorie-IDen), pro Stéck higelueden, wann de Filter fir d'éischt benotzt gëtt;
- [Linn-Heat](line-heat.md): 8 Byte pro Zeil (den Ufank vun all Segment, quantiséiert innerhalb vum Begrenzungsrahm vun den Daten, an seng Flaggen), solang de Linne-Modus un ass.

Derbäi kommen d'Zilen fir d'Zeechnung: d'Szenefaarf an d'Tiefe, den Heat-Zil an säin Schmiirzil (véier Kanäl an [Team-Heat](team-heat.md)), d'Tiefe-Schichten fir [Ofdeckung](depth-and-culling.md), an d'Geometrie vum Level.

### D'Budget gëtt beim Hochlueden erzwongen {#the-budget-is-enforced-at-upload}

WebGL nimmt Zuweisungen un, déi en net erfëllen kann, an dann verléiert en de Kontext oder fält op de Systemspäicher zréck, wat ganz deier ass. Dofir gëtt de GPU-Budget beim Hochlueden vum Datesaz erzwongen ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/renderer.ts)):

- d'Stécker ginn an der Rei higelueden (also an der Zäitrei), solang se passen;
- dat éischt Stéck, dat net passt, gëtt **deelweis** higelueden - sou vill ganz Textur-Zeilen, wéi d'Restbudget hält - anstatt guer net, sou datt e Budget, dat kee ganzt Stéck hält, sou vill weist wéi et kann; an well d'Zeilen no der Zäit geuerdent sinn, ass de gewise Stéck eng zesummenhänkend Zäitspann;
- alles Duerno ass **net am Späicher**.

De Mangel gëtt net verstoppt: d'Statistikanzeig weist eng **Net am Späicher**-Zeil a Orange mat der Zuel vun den Zeilen, déi net gepasst hunn, wann d'Zuel méi wéi null ass. E gekierzte Datesaz, deen komplett ausgesäit, ass de schlechtste Feeler, deen en Analyse-Tool hunn kann. De [Passungs-Check](memory-and-budgets.md#the-fit-check) virum Lueden soll dëse Fall verhënneren.

De Budget, deen de Renderer benotzt, ass de GPU-Budget aus **Ressourcebudgeten**, dee selwechte Wäert wéi de Passungs-Check benotzt - och iwwer dem erkannten Wäert, bis zum Plafong vum Schieber (kuckt [GPU-Budget erhéijen](memory-and-budgets.md#raising-the-gpu-budget)). En gëtt beim Hochlueden vum Datesaz ugewannt; ännert Dir en duerno, gëtt et beim nächste Lueden wierksam.
