---
title: "Panoul de performanță și statistici"
parent: "Detalii interne ale randării"
nav_order: 7
lang: "ro"
source: "performance-and-stats.md"
source_hash: "5144098d2cb4"
translated: true
outdated: false
---

# Panoul de performanță și suprapunerea de statistici

Caseta din dreapta sus a vizualizării arată cât de tare lucrează vizualizatorul: câte cadre pe secundă, câte puncte desenează și dacă încă rafinează imaginea. Panoul **Performanță** te lasă să schimbi calitatea imaginii pe viteză.

## Suprapunerea de statistici {#the-stats-overlay}

Caseta din dreapta sus a vizualizării, în filele Hartă de căldură și Meciuri ([`StatsOverlay.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/StatsOverlay.tsx)). Citește valoarea live a motorului la fiecare cadru de animație.

![Suprapunerea de statistici pe scena cu multe meciuri, cu etichete numerotate: 1 Backend, 2 FPS, 3 Cadru, 4 Rânduri în fereastră, 5 Sprite-uri / cadru, 6 Buget, 7 Rez. căldură, 8 Acoperire](../assets/img/en/performance-stats-overlay.webp)

| Rând | Înseamnă |
|---|---|
| **Backend** | *WebGPU* sau *WebGL2*. Pune cursorul peste el pentru motivul pentru care WebGPU nu a fost folosit, când nu a fost. Vezi [Cele două backend-uri](backends.md). |
| **FPS** | Cadre pe secundă, mediate pe cel puțin 0,4 s. |
| **Cadru** | Timpul cadrului în ms, netezit (90% valoarea anterioară, 10% valoarea nouă). Este timpul dintre cadre, nu timpul GPU - nu se măsoară timpul GPU pe fiecare trecere. |
| **Rânduri în fereastră** | Rânduri candidate: rândurile din fereastra de timp curentă, înainte de filtrarea pe rând din shader. |
| **Sprite-uri / cadru** | Sprite-urile trimise de planul ultimului cadru (păstrate la cifra planificată în cadrele în repaus, care nu desenează nimic). |
| **Buget** | Bugetul de sprite-uri cu care a fost planificat acest cadru - valoarea regulatorului adaptiv, ridicată la toți candidații când se desenează fiecare rând. |
| **Rez. căldură** | Rezoluția bufferului de căldură ca procent din canvas: setarea *Rezoluția căldurii* înmulțită cu scara etapei a doua adaptive. |
| **Acoperire** | Cât a ajuns acumularea progresivă spre folosirea fiecărui rând: un procent cât converge (chihlimbar), *exact* când a terminat. Un cadru zgomotos nu este confundat niciodată cu imaginea finală. |
| **Cuburi** | Cutii desenate în [redarea cutiilor](box-replay.md). |
| **Nerezident** | Apare doar când rândurile nu au încăput în bugetul GPU: câte sunt. Vezi [Rezidența memoriei GPU](gpu-memory.md). |

## Afișarea vitezei {#the-speed-display}

În colțul din dreapta jos al vizualizării, doar în perspectivă: viteza de zbor și timpul necesar să traversezi datele la acea viteză. Trage de ea ca să schimbi viteza. Vezi [Cameră](camera.md#fly-speed).

## Dacă vizualizatorul este lent {#if-the-viewer-is-slow}

Uită-te la suprapunerea de statistici, apoi:

1. **Rânduri în fereastră mult mai mari decât Sprite-uri / cadru, Acoperire sub 100%** - cadrul nu poate desena totul; converge pe mai multe cadre când stai pe loc. Îngustează fereastra, filtrează sau taie ca să reduci candidații; sau acceptă eșantionarea.
2. **Sprite-uri / cadru egal cu Rânduri în fereastră, cadrul tot lent** - costul este pe sprite pe ecran: scade *Raza maximă în pixeli* ([Forma sprite-ului](sprite-shape.md#pixel-clamps)) sau *Rezoluția căldurii*.
3. **Lent cu puține rânduri** - probabil nivelul: număr mare de structuri cu margini active, triunghiuri de teren, adâncime de câmp. Vezi [Aspectul nivelului](level-appearance.md).
4. **Totul lent și un banner roșu** - randare software ([Detectarea randării software](software-rendering.md)).

## Panoul de performanță {#the-performance-panel}

| Control | Implicit | Efect |
|---|---|---|
| Indiciu | | Fiecare cadru împrăștie un subset aleator stratificat al rândurilor vizibile, cu greutatea scalată ca să compenseze, astfel încât căldura așteptată este exactă la orice buget; ținând vizualizarea nemișcată, cadrele continuă să se unească până când fiecare rând a contribuit. |
| **Desenează fiecare rând în fiecare cadru** | pornit | Fiecare cadru care începe o estimare nouă desenează fiecare rând candidat (până la aproximativ 268M); bugetul de mai jos devine o limită minimă. [Eșantionare și bugete](sampling-and-budgets.md#draw-every-row-each-frame) |
| **Buget adaptiv** | pornit | Reglează sprite-urile pe cadru, apoi rezoluția căldurii, ca să mențină rata țintă de cadre - și se oprește din tăiat când tăierea nu ajută. [Eșantionare și bugete](sampling-and-budgets.md#the-adaptive-budget) |
| **FPS țintă** | 60 | 20-240 (1000 cu mânerul). Valorile sub 15 sunt tratate ca 15. |
| **Sprite-uri inițiale / cadru** / **Sprite-uri / cadru** | 4.00M | 65.536-268.435.456, logaritmic. Se numește *Inițiale* cât timp bugetul adaptiv este pornit, pentru că regulatorul o mută. |
| **Rezoluția căldurii** | 100% | 25-100%. Costul fragmentelor crește cu pătratul: 50% înseamnă un sfert din munca de amestecare, iar câmpul de căldură este suficient de neted încât aproape nu se vede. |
| **Rafinare progresivă** | pornit | Acumulează de-a lungul cadrelor cât timp vizualizarea stă nemișcată. Oprit arată estimarea dintr-un singur cadru la fiecare cadru. [Acumulare](accumulation.md) |
| **Bugete de resurse** | detectate | Bugete pentru RAM, GPU și firul parserului. [Memorie și bugete](memory-and-budgets.md#resource-budgets) |

Nimic din acestea nu se salvează; o reîncărcare restaurează valorile implicite.
