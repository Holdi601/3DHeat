---
title: "Figúrky v prekrytí figúrok"
parent: "Figúrky"
grand_parent: "Prehrávanie"
nav_order: 2
lang: "sk"
source: "figure-replay.md"
source_hash: "4b13b8ad6dff"
translated: true
outdated: false
---


# Figúrky v prekrytí figúrok

Táto stránka je o tom, ako premeniť krabice na malé 3D figúrky toho, čím každá jednotka naozaj bola, a o dyme a ohni, ktoré figúrky zanechajú. Ovládače samotného prehrávania sú na [Prehrávaní zápasu](match-replay.md).

V [replayi krabíc](box-replay.md) a v prehrávaní figúrok na karte Zápas **Figúrky namiesto kociek** (predvolene zapnuté) kreslí každú žijúcu osobu ako figúrku toho, čím je: vojaka pešo, tank, ktorý niekto riadi, lietadlo, ktorým je stopa Tacview. Figúrka má farbu, miesto a smer krabice. Pri lietadlách a raketách má aj sklon a, ak údaje majú stĺpec Roll, naklonenie. **Veľkosť figúrok** ich škáluje; 1-násobok je skutočná veľkosť. Kliknutia na figúrku odpovedajú ako kliknutia na jej krabicu.

## Ktorá figúrka {#which-figure}

Rozhodujú vlastné stĺpce údajov s menom a typom. Úplné pravidlá s názvami stĺpcov sú na [Figúrkach](figures.md#which-figure-a-unit-gets). Údaje bez oboch druhov stĺpcov sú údaje o ľuďoch: každý je vojak.

Zhoda sa ukladá do pamäte podľa popisku, takže snímka stojí len umiestnenie. Jednotka údajov je meter, pokiaľ údaje nehovoria, aká veľká je jedna sledovaná vec (export CS2 hovorí, že hráč má 32 jednotiek na šírku); figúrky sa podľa toho škálujú.

Voliteľný balík vlastných figúrok môže na vašom počítači nahradiť figúrky z katalógu; pozri [Figúrky](figures.md#an-optional-local-figure-pack).

## Efekty {#effects}

Riadky udalostí, ktoré niečo na chvíľu zanechajú, sa kreslia tam, kde sa stali, po celý čas trvania, v farbe toho, kto ich spôsobil: dym (asi 18 s), molotov alebo zápalná bomba (7 s), záblesk (asi sekunda) a výbuch HE (pod sekundu), návnada (15 s), položená bomba (40 s). Pochádzajú zo stĺpca udalostí (Event, Events), ktorého popisok je `smoke`, `molotov`, `incendiary`, `flash`, `he`, `decoy` alebo `plant` - export CS2 ich zapisuje pri výbuchu.

## Prehrávanie zápasu: nástroje Tacview {#match-replay-tacviews-tools}

Kamery, záložky, taktické zobrazenie, štatistiky, popisky, **Zvislé čiary**, zoznam udalostí a okno grafov sú opísané na [Prehrávaní zápasu](match-replay.md). [Parita s Tacview](tacview-parity.md) vypisuje každú funkciu Tacview a jej stav.
