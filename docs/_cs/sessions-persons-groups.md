---
title: "Relace, osoby a skupiny"
parent: "Jak nahrát data"
nav_order: 4
lang: "cs"
source: "sessions-persons-groups.md"
source_hash: "5c87185b09ff"
translated: true
outdated: false
---

# Relace, osoby a skupiny

**Osoba** je jedna pohybující se věc (hráč, auto). **Tým / skupina** je strana, ke které patří. **Relace** je jeden zápas nebo kolo. Viz [slovníček](glossary.md).

Jeden řádek souboru může pojmenovat všechny tři:

| x | y | time | player | team | match |
|---|---|---|---|---|---|
| 10.5 | -30.2 | 12.0 | Blue 1 | Blue | Match 01 |

`player` je osoba, `team` je skupina, `match` je relace.

Tři volitelné sloupce popisují, *kdo* a *kde v ději* řádek patří. Každý se při načtení zakóduje jako slovník: textové hodnoty se stanou malými celočíselnými id na řádek plus jedním seznamem popisků sdíleným přes všechny soubory načtení.

## Osoba {#person}

Sloupec **ID osoby** pojmenovává pohybující se věc, ke které řádek patří: hráče, bota, auto. Ukládá se jako 32bitové id na řádek.

Když jsou osoba a sloupec času, načtení spočítá u každého řádku jeho **životnost**: čas do dalšího vzorku téže osoby *ve stejné relaci*, nebo „žádná“ (zarážka, −1), když žádný další vzorek není – osoba zemřela, odešla, nebo záznam skončil. Životnosti pohánějí historii **Životnost** [časové osy](timeline.md), interpolaci a zastarávání v [boxovém přehrávání](box-replay.md) a přerušení tras v [čárovém teple](line-heat.md). Co řádek bez následníka udělá, je nastavení zobrazení (*Záložní životnost*), ne něco zapečeného v datech.

Každá osoba dostane skupinu svého **prvního** řádku v čase; toto přiřazení obarví její box v boxovém přehrávání a rozhodne, viditelností které skupiny se tam skryje. Režimy tepla místo toho používají skupinu každého řádku zvlášť.

### Jména nošená několika věcmi najednou {#names-worn-by-several-things-at-once}

Jméno není vždy jedna entita: v některých exportech každý bot každého zápasu zapisuje pod jedno jméno. Spojení dvou vzorků takové „osoby“ – interpolací, stopou nebo trasou – nakreslí čáru mezi dvěma různými tvory přes mapu.

Při načtení ([`computeLifetimes`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)) je jméno označeno **sdílené**, když jsou dva jeho záznamy

- ve stejné relaci,
- ve stejném čase,
- stejného druhu (každý zachovaný sloupec kategorie má stejnou hodnotu), a
- vzdálenější než 1 % úhlopříčky rozsahu dat.

Sdílená jména se kreslí jako samostatné vzorky – bez interpolace, bez stopy, bez trasy čárového tepla. Vše ostatní o nich (jejich teplo) se nemění. Panel Datová sada vypíše, kolik jmen bylo označeno, s až třemi příklady, a panel boxového přehrávání počet zopakuje.

## Relace {#session}

Sloupec **Relace / zápas** říká, ke kterému zápasu, nájezdu, kolu, jízdě nebo okruhu řádek patří. Právě ten dělá z vzorků osoby jednu souvislou stopu: skutečná telemetrie často prokládá souběžné zápasy, a vzorek hráče těsně před hlavou přehrávání a ten těsně po ní mohou být z různých zápasů stovky metrů od sebe. Se sloupcem relace:

- interpolace, stopy a trasy čárového tepla nikdy nepřekročí změnu relace;
- životnost řádku končí na konci jeho vlastní relace;
- výběr **Relace** se objeví nahoře v postranním panelu, pod lištou režimů.

Sloupec relace je velmi často *časové razítko* – okamžik začátku zápasu, opakovaný na každém řádku toho zápasu. Automatické mapování proto hledá názvy relací dřív než osobu a skupinu ([Mapování sloupců](column-mapping.md#session-person-group)). Závodní kolo nebo úsek (stint) je také relace: dvě kola téhož vozu se nesmí spojit do jedné stopy.

### Výběr relace {#the-session-picker}

![Výběr relace otevřený u souboru deseti zápasů: Všechny relace (10), Match 01, Match 02 a tak dál](../assets/img/en/sessions-persons-groups-picker.webp)

*Deset zápasů v jednom souboru: vyberte jeden, nebo je uvidíte všechny.*

Zobrazuje se, když má datová sada vypsané relace (viz limit níže).

| Část | Význam |
|---|---|
| Popisek vpravo | Počet řádků vybrané relace, nebo *všechny najednou*. |
| Nabídka | *Všechny relace (N)*, pak každá relace, nejvytíženější první, jako `popisek - N řádků, rozpětí` (rozpětí v sekundách pod 90 s, v minutách pod 90 min, v hodinách nad tím). |
| Oranžová nápověda | Ukáže se u *Všechny relace*: pozice se pořád nikdy nespojují přes relace, ale souběžné zápasy dají na mapu dohromady nesouvisející hráče. |
| Nápověda | Ukáže se v režimech tepla, když je vybrána jedna relace: výběr posune jen hlavu přehrávání. |

Při načtení se vybere nejvytíženější relace. Výběr relace přesune hlavu přehrávání na začátek této relace.

Co výběr mění:

- V **[boxovém přehrávání](box-replay.md)** rozhodne, která relace se přehrává: kreslí se jen boxy a stopy této relace a rozsah časové osy se stane vlastním rozpětím relace.
- V **režimech tepla** teplo neomezuje a nápověda pod výběrem to říká: *V režimech tepla tohle jen přesune hlavu přehrávání na začátek relace; teplo počítá každou relaci. Boxové přehrávání přehrává jen vybranou relaci.* Chcete-li teplo omezit na jednu relaci, ponechte také sloupec relace jako sloupec filtru (*Zachovat pro filtrování*) a filtrujte podle něj. Sloupec může být zároveň sloupcem relace i sloupcem filtru: načítač načte každý zaškrtnutý sloupec filtru samostatně, ať hraje ještě jakou roli.

### Příliš mnoho relací {#too-many-sessions}

Vypíše se nejvýš **100 000** relací. Nad to je sloupec ve skutečnosti id (složka s miliony relací po hrstce řádků), a poslat tolik popisků z workeru na stránku je to, co vyčerpá paměť karty. Načtení pak ponechá relace **id** – takže hranice se vynucují všude – ale zahodí popisky a výběr, a panel Datová sada to řekne.

## Skupina {#group}

Sloupec **Tým / skupina** je libovolný sloupec s malým počtem hodnot: tým, strana, oddíl, frakce, příznak hráč-versus-AI, třída vozu. Ukládá se jako 16bitové id na řádek a řídí:

- [seznam týmů](teams-list.md) (viditelnost podle skupiny, + / − strany),
- [teplo týmů](team-heat.md) (odstín na skupinu),
- [rozdíl](difference.md) rozdělený podle skupiny,
- barvy boxů v [boxovém přehrávání](box-replay.md) (rodina odstínů na skupinu, tón na člena).

### Limity {#limits}

Nejvýš **4 096** různých skupin. Id skupiny jede ve čtvrtém kanálu pozičního texelu každého řádku na GPU a každá skupina potřebuje texel v tabulce znamének o šířce 4 096, kterou shader čte, aby rozhodl *skryto*, *přičteno*, nebo *odečteno*. Sloupec s více různými hodnotami je id, ne skupina: **načtení ponechá každý řádek a zahodí jen seskupení**, s varováním u datové sady, které navrhne namapovat ho místo toho jako sloupec osoby, nebo ho ponechat jako sloupec filtru.

Stejný limit 4 096 platí pro zachovaný sloupec filtru *kategorie*; širší se nezachová a datová sada to řekne. Číselný sloupec (třeba časové razítko) takový limit jako filtr *rozsah* nemá.

Hodnoty skupiny `0`, prázdná hodnota, `none`, `unknown`, `null` a `-1` (bez ohledu na velikost písmen) znamenají pro [teplo týmů](team-heat.md) „žádná skupina“ a kreslí se neutrální šedě, ne jako sebejistá barva.

## Velikost entity {#entity-size}

Jak velká je jedna sledovaná věc – kolizní box hráče, auto – určuje, jak velké se kreslí boxy a paprsky pohledu [boxového přehrávání](box-replay.md). V panelu pro ni není pole; přichází z [nápověd `heat3d`](data-formats.md#the-heat3d-hints) souboru (`entity.size`, v jednotkách souboru; konvertor CS2 zapisuje 32). Načtení ji vynásobí měřítkem jednotek.

Při každém načtení ([`calibrate`](https://github.com/Holdi601/3DHeat/blob/main/src/data/calibrate.ts)), kde *rozsah* je větší z rozpětí X a Z dat:

| Nastavení | S velikostí entity | Bez ní |
|---|---|---|
| Velikost krychle | velikost entity | rozsah / 500 |
| Délka paprsku pohledu | velikost entity × 4 | rozsah / 200 |
| Poloměr spritu | rozsah / 120 | rozsah / 120 |
| Bod nasycení | analytický odhad (pak měřený) | totéž |
| Rychlost letu | rozsah / 12 | totéž |
| Vzdálená rovina | rozsah × 12 | totéž |
| Blízká rovina | max(0,05; rozsah / 20 000) | totéž |

## Panel Datová sada {#the-dataset-panel}

Pod panelem Zdroj. Když je datová sada načtená, ukazuje:

- **název** datové sady – výběr, počet řádků, počet souborů, krok, když se použil;
- **`N týmů · N osob · Ns rozpětí`**;
- každé **varování**, které načtení vyvolalo, oranžově, dokud je datová sada načtená: skupiny nebo sloupec filtru zahozené pro příliš mnoho hodnot, relace nevypsané, sdílená jména, chybějící řádky, přeskočené soubory;
- [generátor syntetických dat](synthetic-generator.md);
- **Uvolnit**, které datovou sadu odstraní.

Počet řádků je ukázán v záhlaví panelu.
