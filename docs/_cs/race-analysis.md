---
title: "Analýza závodu"
nav_order: 11
has_children: true
lang: "cs"
source: "race-analysis.md"
source_hash: "ab0531fa7bbd"
translated: true
outdated: false
---

# Analýza závodu

Jeli jste stejnou trať dvakrát. Záložka **Analýza závodu** přehraje obě jízdy spolu ve 3D, ukáže, kde bylo jedno kolo pomalejší, a řekne vám proč. Zatím žádná kola? Stiskněte **Ukázková kola**.

![Záložka Analýza závodu s ukázkovými koly: postranní panel s Koly a Kde se zlepšit, vozy na trati, grafy pod pohledem](../assets/img/cs/race-analysis-overview.webp)

Záložka porovnává dvě nebo více kol jedné trati. Plátno, kameru a načtený model trati (**Pozadí / úroveň**) sdílí s teplotní mapou; všechno ostatní je její vlastní: vlastní postranní panel a vlastní lišta pod pohledem. Slova jako *kolo*, *reference* a *vrchol zatáčky* jsou ve [slovníčku](glossary.md).

Tato stránka je mapa záložky. Každá část má vlastní stránku:

| Stránka | Co pokrývá |
|---|---|
| [Načítání kol](race-loading-laps.md) | každý formát souboru, složky a tratě, názvy vozů, ukázková kola, seznam kol, reference a zaostření |
| [Přehrání a 3D scéna](race-replay-and-scene.md) | lišta přehrávání, tři režimy přehrávání, srovnání vozů, pronásledovací kamera, čáry, mapy, vozy, popisky, zrcadlové světy |
| [Grafy a HUD](race-charts-and-hud.md) | grafy vzdáleností, výběr grafů, najetí a přiblížení, karty vozů, tabulka kanálů |
| [Události ovládání vozidla](race-control-events.md) | zablokování, protáčení, ujetí zádě, točení, tlačení přídě, nárazy, nehody, ABS/TC, ruční brzda, vzduch – jak se každé zjišťuje, se všemi prahy |
| [Analýza zatáčku po zatáčce](race-corner-analysis.md) | zarovnání podle vzdálenosti, zatáčky a úseky, časová bilance zatáčky, každá příčina a pořadí, v jakém se zkoušejí, tvar stopy a rady |
| [Profily vozidel a porovnání](race-car-profiles.md) | co každý vůz umí, změřeno z jeho kol; *Srovnání vozů*; co vůz rozhoduje v každé zatáčce |
| [Statistiky trati](race-course-statistics.md) | mnoho kol jedné trati: chyby podle zatáčky a druhu, mapa chyb, export do teplotní mapy, výkonnostní limity |
| [Analytika závodů: metoda](race-analytics.md) | výzkum za pravidly, se zdroji |
| [Ostatní závodní hry](other-games.md) | co prohlížeč dělá s koly z každé hry: prokluz a drift se dopočítají tam, kde je hra neposílá, zrcadlové světy, další kanály |

## Obrazovka {#the-screen}

**Postranní panel**, shora dolů (sekce se dají sbalit):

1. **Kola** – načtení, seznam, zobrazit/skrýt, reference, zaostření, pronásledování.
   Viz [Načítání kol](race-loading-laps.md).
2. **Statistiky trati** – až od tří načtených kol.
   Viz [Statistiky trati](race-course-statistics.md).
3. **Kde se zlepšit** – nálezy zaostřeného kola, zatáčku po zatáčce.
   Viz [Analýza zatáčku po zatáčce](race-corner-analysis.md).
4. **Zatáčka po zatáčce** (nebo *Zatáčka po zatáčce – třída X*, když je více tříd) – nejrychlejší kolo každou zatáčkou a jeho stopa. Zobrazí se u dvou nebo více kol.
5. **Ovládání vozidla** – zablokování, smyky, tlačení a nárazy zaostřeného kola.
   Viz [Události ovládání vozidla](race-control-events.md).
6. **Srovnání vozů** (nebo **Vůz** s jedním vozem) – viz
   [Profily vozidel a porovnání](race-car-profiles.md).
7. **Pohled** – která mapa se maluje na trať a co se kreslí.
   Viz [Přehrání a 3D scéna](race-replay-and-scene.md).
8. Sdílené panely **Úroveň** a **Kamera a scéna** (model trati, převrácení os, kamera) – popsané u teplotní mapy a v [Kamera](camera.md).

**Pohled** ukazuje trať, projeté stopy, mapu, vozy, popisky připnuté k trati a nejvýš šest karet vozů vlevo nahoře (viz [Grafy a HUD](race-charts-and-hud.md)). Když nejsou načtena žádná kola, říká: „Žádná kola nejsou načtena – přetáhněte sem dva nebo více souborů kol, nebo načtěte ukázková kola z postranního panelu.“

**Lišta pod pohledem** obsahuje ovládání přehrávání a, pokud není skrytá, grafy vzdáleností.

## Rychlý start {#quick-start}

1. Otevřete záložku **Analýza závodu** (vedle **Teplotní mapy** nahoře v postranním panelu).
2. Dostaňte kola dovnitř. Stiskněte **Ukázková kola**, abyste viděli, co záložka dělá se třemi vymyšlenými koly. Pro vlastní kola je nejdřív nahrajte
   ([formáty souborů a záznamníky](race-loading-laps.md#file-formats)), pak stiskněte
   **Načíst soubory kol…** nebo **Složka…**, nebo přetáhněte soubory či složky na pohled.
3. Nejrychlejší úplné kolo se stane referencí; nejpomalejší jiné kolo je zaostřeno. Kliknutím na libovolné kolo v seznamu ho zaostříte; ★ udělá z kola referenci.
4. Přečtěte **Kde se zlepšit**. Klikněte na nález: vozy se srovnají 40 m před ním, kamera ho zarámuje, přehrávání jím projede a otevřou se měření.
5. Najeďte na grafy – každý vůz se přesune na ten metr; Shift+klik je tam srovná.

## Klávesnice {#keyboard}

Když je otevřená záložka Analýza závodu:

| Klávesa | Co dělá |
|---|---|
| **K** | přehrávat / pozastavit přehrávání |
| **Home** | zpět na začátek přehrávání |
| číslicové klávesy | nic (v teplotní mapě přepínají režimy) |

Klávesy napsané do textového pole nebo rozbalovací nabídky se ignorují. Klávesy kamery fungují jako v teplotní mapě (**W A S D**, **Mezerník** nahoru, **Q** dolů, **Shift** rychleji, **Alt** pomaleji, myš k rozhlížení; všechno v [Kamera](camera.md)); **F** zarámuje načtená kola (stejně jako při načítání kol).

## Mnoho kol {#many-laps}

- Všechna načtená kola se analyzují a počítají; desítky zaberou sekundu nebo dvě.
- Nad **8** kol (`SHOW_ALL_UP_TO`) se přidaná kola kreslí jen tehdy, když jsou referencí, zaostřeným kolem, nebo nejlepším kolem třídy zaostřeného kola. Přepínají se *Zobrazit vše* / *Jen prohlížená*.
- Nad **10** viditelnými vozy (`PLAIN_PAST`) se kola, na která se nedívá (ne zaostřené, ne pronásledovaný vůz ani reference), kreslí s čárami zředěnými na bod každých 6 m místo 1,5 m, a vozy prostě.
- Grafy kreslí nejvýš **8** kol; HUD ukazuje nejvýš **6** karet.
- Statistiky trati se objeví od **3** kol.

Podrobnosti: [Statistiky trati](race-course-statistics.md#performance-with-many-laps).

## Výchozí nastavení pohledu {#default-view-settings}

| Nastavení | Výchozí |
|---|---|
| Mapa | Mapa času |
| Projeté stopy, Vozy, Pneumatiky a odpružení, Popisky, Trať z kol | zapnuto |
| Všechny hodnoty na kartách | vypnuto |
| Velikost vozu | 1× |
| Grafy | zobrazeny |
| Režim přehrávání | Od čáry |
| Rychlost přehrávání | 1× |
| Smyčka | zapnuto |

Nic z toho se neukládá; po znovunačtení se začíná od výchozích hodnot. V prohlížeči se pamatuje: jazyk a názvy vozů naučené ze souborů kol (viz [Načítání kol](race-loading-laps.md#car-names)).

## Pro vývojáře {#for-developers}

### Co se stane při načtení kol {#what-happens-when-laps-are-loaded}

Pokaždé, když se změní sada kol, reference nebo jazyk, celá analýza se provede znovu (`analyse` v
[`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts)):

1. Ke každému kolu se přidají odvozené kanály tam, kde je hra neposílá: úhel driftu, prokluz kol z rychlostí kol, ve vzduchu, volný povrch, rychlost stáčení
   ([`derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts)).
2. Reference se vybere a každé kolo se promítne na její dráhu a převzorkuje každé 2 m
   ([`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts)).
3. Z kol se zjistí, zda je svět hry zrcadlový
   ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)).
4. Zatáčky se najdou na referenci a seskupí do úseků od jedné brzdné zóny k další
   ([`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts)).
5. Pro každý vůz: jeho obálka (přilnavost, brzdění, tah podle rychlosti), jeho profil, jeho křivky pneumatik
   ([`envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts),
   [`profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts),
   [`control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts)).
6. Pro každé kolo a úsek: co udělalo (bod brzdění, nejpomalejší bod, plný plyn, ...) a stopu, kterou jelo
   ([`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts)).
7. Pro každé kolo: jeho události ovládání vozidla, každá položená na kolo, s nímž se tam srovnává.
8. Pro každé kolo a úsek: časová bilance proti jeho srovnávacímu kolu a nález slovy.
9. Mapa času a mapa příčin pro každé kolo.

Texty se tvoří v aktuálním jazyce; přepnutí jazyka spustí analýzu znovu (a přejmenuje ukázková kola). Chyba v analýze se zobrazí pod tlačítky **Kola** jako chyba a kola zůstanou načtená.

### Zdrojové soubory {#source-files}

| Soubor | Úloha |
|---|---|
| `src/race/adapters.ts`, `ibt.ts` | čtení souborů kol |
| `src/race/lap.ts`, `carNames.ts`, `synthetic.ts` | typ kola, pojmenování, ukázková kola |
| `src/race/derive.ts`, `handedness.ts` | odvozené kanály, zrcadlové světy |
| `src/race/align.ts`, `segments.ts`, `line.ts` | osa vzdálenosti, zatáčky, čáry |
| `src/race/analysis.ts` | porovnané zatáčky, příčiny, nálezy |
| `src/race/envelope.ts`, `profile.ts` | co vůz umí |
| `src/race/control.ts`, `impacts.ts` | ovládání vozu, nárazy a nehody |
| `src/race/stats.ts` | mnoho kol |
| `src/race/replay.ts`, `scene.ts`, `glyph.ts`, `geometry.ts` | přehrávání a kreslení |
| `src/race/schema.ts`, `graphs.ts` | tabulka kanálů, řádky grafů |
| `src/ui/race/*` | postranní panel, grafy, HUD, popisky |
| `src/state/raceStore.ts` | stav záložky a hodiny přehrávání |
