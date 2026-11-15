---
title: "Analýza zápasu (CS2)"
nav_order: 10
lang: "cs"
source: "match-analysis.md"
source_hash: "270f28c0f42b"
translated: true
outdated: true
---

# Analýza zápasu (Counter-Strike 2)

Karta **Zápas** přehrává záznam jako figury a u zápasu Counter-Strike 2 ukazuje i tabulku skóre: kdo vyhrál které kolo, jak, a kdo dostal zabití. Použijte ji k tomu, abyste zápas prošli kolo po kole, a pak skočili na stejný okamžik v teplotní mapě.

Karta Zápas přehrává libovolný záznam jako figury: záznam War Thunder nebo Tacview, nebo demo CS2, vypsané pod **Zápasy v záznamu** ([Přehrání zápasu](match-replay.md)). Soubor `.match.json` z CS2 přidá tabulku skóre popsanou na této stránce.

## Prohlédnutí zápasu CS2 {#review-a-cs2-match}

1. Převeďte demo ([níže](#where-the-data-comes-from)) na soubor `.parquet` a `.match.json`.
2. Na kartě **Teplotní mapa** načtěte soubor `.parquet` pod **Zdroj**.
3. Otevřete kartu **Zápas** a klikněte na **Načíst soubory zápasů…**, nebo přetáhněte soubor `.match.json` na zobrazení.
4. Klikněte na zápas v **Souhrnech zápasů**, pak na buňku pásu kol, abyste to kolo otevřeli.
5. Klikněte na **Zobrazit kolo**, abyste to kolo viděli v teplotní mapě, nebo na **Přehrát kolo**, abyste ho sledovali jako figury.

![Karta Zápas: pás kol s otevřeným kolem, seznam zabití a Tabulka skóre](../assets/img/en/match-analysis-round.webp)

Pojmy jako KAST, ADR, eco, force buy a trade jsou ve [slovníčku](glossary.md#counter-strike-words).

## Odkud jsou data {#where-the-data-comes-from}

Převodník dem z [3DHeat CS2](https://github.com/Holdi601/3DHeat-CS2) promění dema na dva soubory na zápas, v jedné složce na mapu:

```bash
python -m heat3d_cs2 demos <demo files or folders> -o out
```

| Soubor | Načte se v | Obsahuje |
|---|---|---|
| `<match>.parquet` | karta **Teplotní mapa** (panel Zdroj, jako každý Parquet – jeden soubor, více, nebo celá složka) | pozici každého hráče osmkrát za sekundu a každou událost, kde se stala: zabití, smrt, zranění, výstřel, hod, kouř, záblesk, HE, molotov, návnada, oslepení, položení, odminování, výbuch; se sloupci `match`, `round`, `roundId`, `event`, `player`, `side`, `team`, směr pohledu, `weapon`, `place`, `opening`, `traded`… |
| `<match>.match.json` | karta **Zápas** | týmy, skóre, každé kolo (vítěz, jak, ekonomika, položení, každé zabití v pořadí, clutche, přeživší), řádek tabulky skóre každého hráče |

Zápatí souboru Parquet nese pokyny ke čtení (klíč `heat3d`), takže se otevře bez jakéhokoli nastavení: hráč jako osoba, strana jako skupina, každé kolo (`roundId`, „<match> #NN“) jako relace, směr pohledu zapnutý a svět správně otočený (svět CS2 je pravoruký s Z nahoru; čten jako výchozí mapování Z nahoru by byl zrcadlový). Viz [Mapování sloupců](column-mapping.md) a [Načítání souborů](loading-files.md). `python -m heat3d_cs2 map <map>` vyexportuje geometrii mapy ve stejné soustavě, načtenou v **Úrovni**.

Konvence za čísly jsou konvence převodníku (uvedené v jeho README a obsažené v každém souhrnu): smrt je **pomstěna** (traded), když její vraha zabije jeden ze spoluhráčů oběti do **5 s**; **KAST** je podíl kol s zabitím, asistencí (počítá se i asistence záblesku), přežitím nebo pomstěnou smrtí; **poškození** je skutečně ztracené zdraví, jen nepřátelé; **clutch** je poslední živý hráč na straně, když stojí nepřátelé, vyhraný, když strana vyhraje kolo; **nákup** podle každé strany z průměrné hodnoty vybavení na konci času zmrazení – první kolo každé řádné poloviny je půl pistolového kola (u prodloužení žádné), pak pod 1 500 $ eco, pod 4 000 $ force buy, cokoli víc plný nákup.

## Karta {#the-tab}

Postranní panel karty Zápas drží nahoře přepínač režimu teplotní mapy a výběr relace, pod ním sekce zápasu, a pod nimi filtry, úroveň a panely kamery teplotní mapy. Zobrazení je teplotní mapa toho, co je načteno na kartě Teplotní mapa.

### Souhrny zápasů {#match-summaries}

| Ovládání | Co dělá |
|---|---|
| **Načíst soubory zápasů…** | vybere soubory `.json` (více najednou): souhrny `.match.json` |
| přetáhnout na zobrazení | soubory JSON přetažené na zobrazení, když je karta Zápas otevřená, se načtou stejně (ostatní soubory se ignorují) |
| **Vymazat** | odstraní každý zápas |
| **Všechny zápasy** (při dvou nebo více) | „N zápasů, M kol“: statistiky přes všechny |
| řádek zápasu | „TeamA 13 : TeamB 9“, mapa · N kol: otevře tento zápas |

Soubor se přijme, když je JSON s `"format": "heat3d-cs2-match"` a poli `rounds`, `players` a `teams`. Chyby jsou vypsány pod tlačítky: „<soubor>: není JSON“, „<soubor>: není souhrn zápasu CS2 (heat3d-cs2-match)“, „<soubor>: chybí rounds, players nebo teams“. Zápas načtený znovu (stejný název `match`) nahradí dřívější. Zápasy jsou seřazeny podle mapy, pak podle názvu. Když je načten přesně jeden zápas, otevře se; jinak výběr zůstane (ve výchozím nastavení všechny zápasy).

Když nic není načteno, sekce to vysvětlí: převeďte pomocí `python -m heat3d_cs2 demos`, zde načtěte soubory `.match.json` a na kartě Teplotní mapa soubory `.parquet`.

### Zápas (jeden otevřený zápas) {#match-one-match-open}

**Záhlaví:** oba týmy se skóre, mapa, poloviny – „poloviny 7–5, 6–6“: kola 1–12 a 13–24 (premiér a soutěžní hra MR12; vlastní délka poloviny souhrnu, je-li uvedena, takže 1–15 a 16–30 pro MR15) – a když zápas šel do prodloužení, jeho skóre zvlášť: „prodloužení 4–2“, kola po obou polovinách. Remíza se nepočítá žádnému týmu. A „N kol přerušeno v demu“, když souhrn uvádí neúplná kola.

**Pás kol:** buňka na kolo, obarvená podle strany, která vyhrála, s jeho číslem a značkou, jak skončilo. Remízové kolo (bez vítěze) je neutrální šedá buňka označená `=`, nikdy barvou strany; jeho popisek říká „Kolo 30: remíza – žádná strana ho nevyhrála“.

| Značka | Ukončeno |
|---|---|
| B | bomba explodovala |
| D | bomba odminována |
| K | vyřazeno |
| T | vypršel čas |
| S | kapitulace |
| = | remíza |
| ? | jiné |

Dělicí čára označuje začátek druhé poloviny (kolo 13, nebo kolo po délce poloviny ze souhrnu) a každé tříkolové poloviny prodloužení (kola 25, 28, 31, …). Najetí na buňku: „Kolo 7: TeamA (T) – bomba explodovala, položena na A“ („…, položena, místo neznámé“, když souhrn místo nemá) a nákup a hodnota vybavení obou stran. Klik kolo otevře; další klik ho zavře („Klikněte na kolo pro jeho zabití, ekonomiku a přehrání.“).

**Kolo:**

- „Kolo 7: <tým> vyhrál – <jak>“ („Kolo 30: remíza – žádná strana ho nevyhrála“ pro remízu) a jak dlouho kolo trvalo (od konce zmrazení do rozhodnutí, m:ss);
- ekonomika: tým každé strany, nákup (pistol, eco, force buy, full buy) a hodnota vybavení („4 350 $“);
- položení: místo, hráč a čas do kola (z kterékoli verze souhrnu); „Položil <hráč> v 1:05, místo neznámé“, když místo není známo;
- **záznam zabití**, v pořadí: čas do kola, útočník (v barvě strany; „world“, když útočník není), zbraň, a příznaky – **HS** headshot, **WB** skrz zeď, **SM** skrz kouř; **první** je první zabití kola, **trade** (pomstil spoluhráče do 5 s), **pomstěn** (vrah byl zabit do 5 s), **teamkill** je zabití spoluhráče (sebevražda není žádná). Zabití po rozhodnutí kola jsou ztlumená;
- clutche: „<hráč> (T) sám proti 3: clutch vyhrán“ / „prohrán“;
- kdo byl na konci živý, po stranách („nikdo“);
- **Zobrazit kolo**: všechno z tohoto kola, v teplotní mapě;
- **Přehrát kolo**: přehraje kolo jako krabice od jeho začátku (níže).

Tlačítka **Zobrazit v teplotní mapě** (viz [níže](#show-in-the-heatmap)) pro tento zápas, nebo pro otevřené kolo.

### Tabulka skóre {#scoreboard}

Tabulka pro každý tým, řádek na hráče:

| Sloupec | Je |
|---|---|
| K, D | zabití, smrti |
| A | asistence, včetně asistencí záblesku |
| ± | zabití minus smrti (zeleně nad 0, červeně pod 0) |
| ADR | poškození na kolo, skutečně ztracené zdraví |
| KAST | % kol se zabitím, asistencí, přežitím nebo pomstěnou smrtí |
| HS | % zabití headshotem |
| Open | vyhrané – prohrané úvodní duely |
| Cl | vyhrané/odehrané clutche |

Najetí na hráče: zabití pomsty, kolikrát byl pomstěn, asistence záblesku, zablesknutí nepřátelé, poškození užitkovými předměty a kola s vícenásobnými zabitími („2×3k“). **Klik na hráče** ukáže jeho zabití a smrti v teplotní mapě (tento zápas).

### Napříč zápasy (Všechny zápasy) {#across-matches-all-matches}

Přes každý načtený zápas:

- „N zápasů · M kol · <mapy>“, a „N kol remízou, nevyhrála žádná strana“, když nějaké remízy byly;
- **Vyhraná kola** podle strany: celkem, na **pistolových** kolech (pistolová kola souhrnu), a při **eco**, **force** a **full** nákupech (každé jako procento s odehranými koly; najetí ukáže „vyhraných z odehraných“). Remízové kolo hrají obě strany a nevyhrává žádná;
- **Bomba**: položení na místo, a jak často T dál ta kola vyhrál („12 položení na A (T vyhrál 67 %)“), položení, jejichž místo souhrn sám o sobě nezná („2 položení na neznámém místě (T vyhrál 50 %)“), nebo „nikdy nepoloženo“; jak kola skončila, nejčastější první;
- „Strana, která vzala úvodní zabití, vyhrála N % těchto kol.“ (sebevražda není úvodní zabití; remízové kolo nepřeměňuje úvodní zabití);
- **Úvodní duely, kde**: deset míst s nejvíce úvodními zabitími (podle místa oběti; názvy míst ze hry čitelně, „TopofMid“ → „Top of Mid“), duely a podíl, který vyhrála strana T;
- **Hráči**: patnáct nejlepších podle zabití minus smrti, sloučeno přes všechny jejich zápasy (spojeno podle Steam ID): zápasy, K-D, ADR a KAST vážené odehranými koly, HS % vážené zabitími, úvodní duely. **Klik na hráče** ukáže jeho zabití a smrti přes všechny zápasy v teplotní mapě.

Tlačítka Zobrazit v teplotní mapě pro všechny načtené zápasy jsou pod tím.

## Zobrazit v teplotní mapě {#show-in-the-heatmap}

Každý odkaz nastaví vlastní **filtry** teplotní mapy, takže to, co se ukazuje, zůstává vidět a upravitelné v panelu Filtry, a **Zobrazit vše** je vymaže. Fungují na tabulce teplotní mapy načtené na kartě Teplotní mapa; karta Zápas ji nikdy sama nenačte.

| Tlačítko | Zobrazené události |
|---|---|
| **Pozice** | `position` – kde hráči byli, osmkrát za sekundu |
| **Zabití** | `kill` – kde stál vrah |
| **Smrti** | `death` – kde oběť padla |
| **Úvodní killy** | `kill` a `death` s `opening` = 1 – první zabití každého kola, kde oba stáli (nabízí se jen, když tabulka má sloupec `opening`) |
| **Smoky** | `smoke` – kde dopadl kouř |
| **Flashe** | `flash` – kde vybuchl záblesk |
| **Molotovy** | `molotov` – kde hořely molotovy a zápalné granáty |
| **HE** | `he` – kde vybuchly HE granáty |
| **Položení** | `plant` – kde byla bomba položena |
| **Výstřely** | `shot` – odkud se střílelo |

Rozsah určuje, kde tlačítka jsou: všechny načtené zápasy, tento zápas, nebo toto kolo („Zobrazit v teplotní mapě – kolo 7“).

Co nejde použít, se řekne pod tlačítky, a neodfiltruje se tiše na nic: „žádný sloupec zápasu nebyl ponechán – zápas nepoužit“, „zápas: X není v načtených datech“, totéž pro kolo a události, „hráč X není v načtených datech“, „strana X není v načtených datech“, „žádná data teplotní mapy nejsou načtena: načtěte soubory .parquet zápasů na kartě Teplotní mapa“. Bez načtených dat odkazy také říkají „Načtěte soubory .parquet zápasů na kartě Teplotní mapa, aby se zobrazily na mapě.“

**Přehrát kolo** navíc přepne teplotní mapu na **Přehrávání krabic**, časovou osu do režimu *přehrávání* s oknem nastaveným na *životnost*, přeskočí na začátek relace kola a přehraje. Když kolo není relací načtených dat: „toto kolo není relací načtených dat: není co přehrát“.

## Pro vývojáře {#for-developers}

Kód: [`src/ui/match/MatchPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/match/MatchPanel.tsx),
[`src/match/matchDoc.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/matchDoc.ts),
[`src/match/focus.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/focus.ts),
[`src/state/matchStore.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/state/matchStore.ts).

### Verze souhrnů {#summary-versions}

Karta čte souhrny verze 1 a verze 2 (`"version"` v souboru) vedle sebe a se obě zachází stejně:

| | Verze 2 | Verze 1 |
|---|---|---|
| čas položení | sekundy do kola, jako zabití | sekundy zápasu; karta odečte začátek kola |
| místo položení | `A` nebo `B`; prázdné, když demo to neuvádí | `A`, `B`, nebo číslo entity – čteno jako neznámé místo |
| délka poloviny | `halfLength`, od místa, kde se strany poprvé vymění; 12, když je null | 12 (MR12) |
| pistolová kola | `pistolRounds` (kolo 1 a první kolo po polovině) | kola, jejichž nákup je `pistol` |
| remízové kolo | `winner` a `winnerTeam` prázdné | – |
| sebevražda | `suicide` u zabití, nikdy teamkill | zjištěno podle toho, že útočník a oběť jsou tentýž hráč |

`noscope` a `attackerBlind` zabití (verze 2) nejsou na kartě Zápas zobrazeny. Ta také neukazuje místo z tabulky teplotní mapy, takže prázdné `place` řádku granátu zde nic nemění.

Jak se zaměření mění na filtry (`focusFilters`):

- **zápas** → filtr kategorie na sloupci `match`;
- **kolo** → filtr rozsahu `round` = N na číselném sloupci `round` (filtr kategorie na kategoriálním), a relace kola (`<match> #NN`) se vybere ve výběru relací;
- **události** → filtr kategorie na sloupci `event`;
- **hráč** → filtr osoby na tomto hráči;
- **strana** → filtr skupiny.
