---
title: "Analýza pretekov"
nav_order: 14
has_children: true
lang: "sk"
source: "race-analysis.md"
source_hash: "63d7f4b85872"
translated: true
outdated: false
---

# Analýza pretekov

Jazdili ste dvakrát po tej istej trati. Karta **Analýza pretekov** prehrá obe jazdy spolu v 3D, ukáže, kde bolo jedno kolo pomalšie, a povie vám prečo. Ešte nemáte kolá? Stlačte **Ukážkové kolá**.

![Karta Analýza pretekov s ukážkovými kolami: bočný panel s Kolami a Kde sa zlepšiť, autá na trati, grafy pod pohľadom](../assets/img/en/race-analysis-overview.webp)

Karta porovnáva dve alebo viac kôl jednej trate. Plátno, kameru a načítaný model trate (**Pozadie / level**) zdieľa s heatmapou; všetko ostatné má vlastné: vlastný bočný panel a vlastnú lištu pod pohľadom. Slová ako *kolo*, *referencia* a *apex* sú v [slovníku](glossary.md).

Táto stránka je mapou karty. Každá časť má vlastnú stránku:

| Stránka | Čo pokrýva |
|---|---|
| [Načítanie kôl](race-loading-laps.md) | každý formát súboru, priečinky a trate, mená áut, ukážkové kolá, zoznam kôl, referencia a zameranie |
| [Prehrávanie a 3D scéna](race-replay-and-scene.md) | prenosová lišta, tri režimy prehrávania, zarovnanie áut, kamera za autom, čiary, mapy, autá, popisky, zrkadlové svety |
| [Grafy a HUD](race-charts-and-hud.md) | grafy vzdialenosti, výber grafu, najazdenie a priblíženie, karty áut, tabuľka kanálov |
| [Udalosti ovládania auta](race-control-events.md) | zablokovania, prešmyk kolies, pretáčanie zadku, otáčanie, podotáčanie, zásahy, nehody, ABS/TC, ručná brzda, vzduch - ako sa každá zisťuje, so všetkými prahmi |
| [Analýza zákruta po zákrute](race-corner-analysis.md) | zarovnanie podľa vzdialenosti, zákruty a úseky, časová bilancia zákruty, každá príčina a poradie, v ktorom sa skúšajú, tvar čiary a rada |
| [Profily áut a porovnanie](race-car-profiles.md) | čo každé auto dokáže, merané z jeho kôl; *Porovnanie áut*; čo auto rozhoduje v každej zákrute |
| [Štatistiky trate](race-course-statistics.md) | veľa kôl jednej trate: chyby v každej zákrute a podľa druhu, mapa chýb, export heatmapy, limity výkonu |
| [Analytika závodov: metóda](race-analytics.md) | výskum za pravidlami, so zdrojmi |
| [Ďalšie závodné hry](other-games.md) | čo prehliadač robí s kolami z každej hry: prešmyk a driftovanie dopočítané tam, kde ich hra neposiela, zrkadlové svety, ďalšie kanály |

## Obrazovka {#the-screen}

**Bočný panel**, zhora nadol (sekcie sa dajú zložiť):

1. **Kolá** - načítanie, zoznam, zobrazenie/skrytie, referencia, zameranie, prenasledovanie.
   Pozri [Načítanie kôl](race-loading-laps.md).
2. **Štatistiky trate** - až od troch načítaných kôl.
   Pozri [Štatistiky trate](race-course-statistics.md).
3. **Kde sa zlepšiť** - zistenia zameraného kola, zákruta po zákrute.
   Pozri [Analýza zákruta po zákrute](race-corner-analysis.md).
4. **Zákruta po zákrute** (alebo *Zákruta po zákrute - trieda X* pri viacerých triedach) - najrýchlejšie kolo cez každú zákrutu a jeho čiara. Zobrazuje sa pri dvoch alebo viacerých kolách.
5. **Ovládanie auta** - zablokovania, šmyky, podotáčanie a zásahy zameraného kola.
   Pozri [Udalosti ovládania auta](race-control-events.md).
6. **Porovnanie áut** (alebo **Auto** pri jednom aute) - pozri [Profily áut a porovnanie](race-car-profiles.md).
7. **Pohľad** - ktorá mapa sa maľuje na trati a čo sa kreslí.
   Pozri [Prehrávanie a 3D scéna](race-replay-and-scene.md).
8. Spoločné panely **Level** a **Kamera a scéna** (model trate, obrátenie osí, kamera) - popísané pri heatmape a v [Kamere](camera.md).

**Pohľad** zobrazuje trať, jazdené čiary, mapu, autá, popisky pripnuté k trati a až šesť kariet áut vľavo hore (pozri [Grafy a HUD](race-charts-and-hud.md)). Bez načítaných kôl píše „Nie sú načítané žiadne kolá - sem pustite dva alebo viac súborov kôl alebo načítajte ukážkové kolá z bočného panela.“

**Lišta pod pohľadom** obsahuje prenos prehrávania a, pokiaľ nie je skrytá, grafy vzdialenosti.

## Rýchly štart {#quick-start}

1. Otvorte kartu **Analýza pretekov** (vedľa **Heatmapa** hore na bočnom paneli).
2. Dostaňte kolá dnu. Stlačte **Ukážkové kolá**, aby ste videli, čo karta s tromi zmyslenými kolami robí. Pre vlastné kolá ich najprv nahrajte ([formáty súborov a nahrávače](race-loading-laps.md#file-formats)), potom stlačte **Načítať súbory kôl…** alebo **Priečinok…**, alebo pustite súbory či priečinky na pohľad.
3. Najrýchlejšie úplné kolo sa stane referenciou; najpomalšie ďalšie kolo je zamerané. Kliknutím na ľubovoľné kolo v zozname ho zameriate; ★ z kola urobí referenciu.
4. Čítajte **Kde sa zlepšiť**. Kliknite na zistenie: autá sa zarovnajú 40 m pred ním, kamera ho zarámuje, prehrávanie ním prejde a otvoria sa merania.
5. Najazdením na grafy presuniete každé auto na ten istý meter; Shift+klik ich zarovná tam.

## Klávesnica {#keyboard}

Kým je karta Analýza pretekov otvorená:

| Klávesa | Účinok |
|---|---|
| **K** | prehrať / pozastaviť prehrávanie |
| **Home** | späť na začiatok prehrávania |
| číselné klávesy | nič (v heatmape prepínajú režimy) |

Klávesy napísané do textového poľa alebo rozbaľovacieho zoznamu sa ignorujú. Klávesy kamery fungujú ako v heatmape (**W A S D**, **Medzera** hore, **Q** dole, **Shift** rýchlejšie, **Alt** pomalšie, myš na obzeranie; všetko v [Kamere](camera.md)); **F** zarámuje načítané kolá (ako to robí načítanie kôl).

## Veľa kôl {#many-laps}

- Všetky načítané kolá sa analyzujú a počítajú; desiatky trvajú sekundu alebo dve.
- Nad **8** kôl (`SHOW_ALL_UP_TO`) sa pridané kolá kreslia len vtedy, ak sú referenciou, zameraným kolom alebo najlepším kolom triedy zameraného kola. Prepínajú sa *Zobraziť všetky* / *Len tie, na ktoré sa pozeráte*.
- Nad **10** viditeľných áut (`PLAIN_PAST`) sa kolá, na ktoré sa nepozeráte (nie zamerané, nie sledované auto ani referencia), kreslia s čiarami zredukovanými na jeden bod každých 6 m namiesto 1,5 m, a ako obyčajné autá.
- Grafy kreslia najviac **8** kôl; HUD ukazuje najviac **6** kariet.
- Štatistiky trate sa objavia od **3** kôl.

Podrobnosti: [Štatistiky trate](race-course-statistics.md#performance-with-many-laps).

## Predvolené nastavenia pohľadu {#default-view-settings}

| Nastavenie | Predvolená hodnota |
|---|---|
| Mapa | Časová mapa |
| Jazdené čiary, Autá, Pneumatiky a odpruženie, Popisky, Trať z kôl | zapnuté |
| Všetky hodnoty na kartách | vypnuté |
| Veľkosť auta | 1× |
| Grafy | zobrazené |
| Režim prehrávania | Od čiary |
| Rýchlosť prehrávania | 1× |
| Slučka | zapnuté |

Nič z toho sa neukladá; po obnovení sa začne od predvolených hodnôt. V prehliadači sa pamätá jazyk a mená áut naučené zo súborov kôl (pozri [Načítanie kôl](race-loading-laps.md#car-names)).

## Pre vývojárov {#for-developers}

### What happens when laps are loaded {#what-happens-when-laps-are-loaded}

Pri každej zmene množiny kôl, referencie alebo jazyka sa celá analýza spustí znova (`analyse` v [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts)):

1. K jednotlivým kolám sa pridajú odvodené kanály tam, kde ich hra neposiela: uhol driftu, prešmyk kolies z rýchlostí kolies, vo vzduchu, sypký povrch, rýchlosť otáčania ([`derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts)).
2. Referencia sa vyberie a každé kolo sa premieta na jej dráhu a prevzorkuje každé 2 m ([`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts)).
3. Z kôl sa zistí, či je svet hry zrkadlový ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)).
4. Zákruty sa nájdu na referencii a zoskupia do úsekov od jedného brzdného pásma k ďalšiemu ([`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts)).
5. Pre každé auto: jeho obálka (priľnavosť, brzdenie, ťah podľa rýchlosti), jeho profil, jeho krivky pneumatík ([`envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts), [`profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts), [`control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts)).
6. Pre každé kolo a úsek: čo urobilo (bod brzdenia, najpomalší bod, plný plyn, ...) a čiara, ktorou išlo ([`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts)).
7. Pre každé kolo: jeho udalosti ovládania auta, každá položená proti kolu, s ktorým sa tam porovnáva.
8. Pre každé kolo a úsek: časová bilancia voči porovnávaciemu kolu a zistenie v slovách.
9. Časová mapa a mapa príčin pre každé kolo.

Texty sa tvoria v aktuálnom jazyku; prepnutie jazyka spustí analýzu znova (a premenuje ukážkové kolá). Chyba analýzy sa zobrazí pod tlačidlami **Kolá** ako chyba a kolá zostanú načítané.

### Source files {#source-files}

| Súbor | Úloha |
|---|---|
| `src/race/adapters.ts`, `ibt.ts` | čítanie súborov kôl |
| `src/race/lap.ts`, `carNames.ts`, `synthetic.ts` | typ kola, pomenovanie, ukážkové kolá |
| `src/race/derive.ts`, `handedness.ts` | odvodené kanály, zrkadlové svety |
| `src/race/align.ts`, `segments.ts`, `line.ts` | os vzdialenosti, zákruty, čiary |
| `src/race/analysis.ts` | porovnané zákruty, príčiny, zistenia |
| `src/race/envelope.ts`, `profile.ts` | čo auto dokáže |
| `src/race/control.ts`, `impacts.ts` | ovládanie auta, zásahy a nehody |
| `src/race/stats.ts` | veľa kôl |
| `src/race/replay.ts`, `scene.ts`, `glyph.ts`, `geometry.ts` | prehrávanie a kreslenie |
| `src/race/schema.ts`, `graphs.ts` | tabuľka kanálov, riadky grafov |
| `src/ui/race/*` | bočný panel, grafy, HUD, popisky |
| `src/state/raceStore.ts` | stav karty a hodiny prehrávania |
