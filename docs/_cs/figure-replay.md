---
title: "Figury v překryvu figur"
parent: "Figury"
grand_parent: "Přehrání"
nav_order: 2
lang: "cs"
source: "figure-replay.md"
source_hash: "4b13b8ad6dff"
translated: true
outdated: false
---

# Figury v překryvu figur

Tato stránka je o tom, jak se krabice mění na malé 3D figury toho, čím každá jednotka skutečně byla, a o kouři a ohni, které figury zanechávají. Ovládání samotného přehrávání je na stránce [Přehrávání zápasu](match-replay.md).

V [přehrávání krabic](box-replay.md) a v překryvu figur na kartě Zápas kreslí **Figury místo krychlí** (ve výchozím stavu zapnuto) každou živou osobu jako figuru toho, čím je: pěšák, tank, který někdo řídí, nebo letadlo, po kterém jde stopa Tacview. Figura má barvu, místo a kurz krabice. U letadel a střel má i náklon a, je-li v datech sloupec Roll, zatočení. **Velikost figur** je škáluje; 1× je skutečná velikost. Kliknutí na figuru odpoví jako kliknutí na její krabici.

## Která figura {#which-figure}

Rozhodují vlastní sloupce názvu a typu dat. Úplná pravidla s názvy sloupců jsou na stránce [Figury](figures.md#which-figure-a-unit-gets). Data bez obojího druhu sloupce jsou data o lidech: každý je voják.

Shoda se ukládá do paměti podle štítku, takže snímek stojí jen umístění. Jednotka z dat je metr, pokud data neříkají, jak velká je jedna sledovaná věc (export CS2 říká, že hráč má 32 jednotek na šířku); figury se podle toho škálují.

Volitelný balík vlastních figur může na vašem počítači nahradit figury z katalogu; viz [Figury](figures.md#an-optional-local-figure-pack).

## Efekty {#effects}

Řádky událostí, které něco na chvíli zanechají, se kreslí tam, kde se staly, po celou dobu jejich trvání, barvou toho, kdo je způsobil: kouř (asi 18 s), molotov nebo zápalná (7 s), záblesk (asi sekunda) a výbuch HE (méně než sekunda), návnada (15 s), položená bomba (40 s). Pocházejí ze sloupce události (Event, Events), jehož štítek je `smoke`, `molotov`, `incendiary`, `flash`, `he`, `decoy` nebo `plant`; export CS2 je zapisuje v okamžiku výbuchu.

## Přehrávání zápasu: nástroje Tacview {#match-replay-tacviews-tools}

Kamery, záložky, taktické zobrazení, statistiky, popisky, **Svislé čáry**, seznam událostí a okno grafů jsou popsány na stránce [Přehrávání zápasu](match-replay.md). [Parita s Tacview](tacview-parity.md) vypisuje každou funkci Tacview a kde stojí.
