---
title: "Analýza zápasu (CS2)"
nav_order: 10
lang: "sk"
source: "match-analysis.md"
source_hash: "0b9ab06a759f"
translated: true
outdated: false
---

# Analýza zápasu (Counter-Strike 2)

Karta **Zápas** prehráva záznam ako figúrky a pri zápase Counter-Strike 2 ukazuje aj tabuľku skóre: kto vyhral každé kolo, ako a kto mal zabitia. Použite ju, ak chcete zápas prechádzať kolo po kole, a potom skočiť na ten istý okamih v heatmape.

Karta Zápas prehráva ľubovoľný záznam ako figúrky: záznam War Thunder alebo Tacview, alebo demo CS2, ktoré sa zobrazí v **Zápasy v zázname** ([Prehranie zápasu](match-replay.md)). Súbor `.match.json` pri CS2 pridá tabuľku skóre opísanú na tejto stránke.

## Prechod zápasom CS2 {#review-a-cs2-match}

1. Prevedte demo ([nižšie](#where-the-data-comes-from)) na súbor `.parquet` a `.match.json`.
2. Na karte **Heatmapa** načítajte súbor `.parquet` v časti **Zdroj**.
3. Otvorte kartu **Zápas** a kliknite na **Načítať súbory zápasov…**, alebo pretiahnite súbor `.match.json` na zobrazenie.
4. Kliknite na zápas v **Súhrny zápasov** a potom na bunku v páse kôl, aby sa otvorilo to kolo.
5. Kliknite na **Zobraziť kolo**, ak chcete vidieť to kolo v heatmape, alebo na **Prehrať kolo**, ak ho chcete sledovať ako figúrky.

![Karta Zápas: pás kôl s otvoreným kolom, prehľad zabití a tabuľka skóre](../assets/img/en/match-analysis-round.webp)

Slová ako KAST, ADR, eco, force buy a trade sú v [slovníku](glossary.md#counter-strike-words).

## Odkiaľ sú dáta {#where-the-data-comes-from}

Konvertor dem z [3DHeat CS2](https://github.com/Holdi601/3DHeat-CS2) premieňa dema na dva súbory na zápas, v priečinku pre každú mapu:

```bash
python -m heat3d_cs2 demos <demo files or folders> -o out
```

| Súbor | Načíta sa v | Obsahuje |
|---|---|---|
| `<match>.parquet` | karta **Heatmapa** (panel Zdroj, ako každý Parquet - jeden súbor, viac, alebo celý priečinok) | pozíciu každého hráča osemkrát za sekundu a každú udalosť, pri ktorej sa stala: zabitie, smrť, zranenie, výstrel, hod, dymovnica, flash, HE, molotov, návnada, oslepenie, položenie bomby, deaktivácia, výbuch; so stĺpcami `match`, `round`, `roundId`, `event`, `player`, `side`, `team`, smer pohľadu, `weapon`, `place`, `opening`, `traded` … |
| `<match>.match.json` | karta **Zápas** | tímy, skóre, každé kolo (víťaz, ako, ekonomika, položenie bomby, každé zabitie v poradí, clutche, prežívajúci), riadok tabuľky skóre každého hráča |

Pätička súboru Parquet nesie pokyny na čítanie (kľúč `heat3d`), takže sa otvorí bez akéhokoľvek nastavovania: hráč ako osoba, strana ako skupina, každé kolo (`roundId`, „<match> #NN“) ako relácia, smer pohľadu zapnutý a svet v správnom smere (svet CS2 je pravotočivý so Z smerom nahor; čítaný ako štandardné mapovanie Z-nahor by bol zrkadlovo prevrátený). Pozri [Mapovanie stĺpcov](column-mapping.md) a [Načítanie súborov](loading-files.md). `python -m heat3d_cs2 map <map>` exportuje geometriu mapy v tom istom rámci, načítanú v **Level**.

Pravidlá za číslami sú pravidlá konvertora (uvedené v jeho README a uložené v každom súhrne): zabitie sa považuje za **pomstené** (traded), keď je jeho vrah zabitý jedným zo spoluhráčov obete do **5 s**; **KAST** je podiel kôl, v ktorých bolo zabitie, asistencia (počíta sa aj asistencia flashom), prežitie alebo pomstená smrť; **poškodenie** je skutočne stratené zdravie, len nepriatelia; **clutch** je byť posledným živým na strane, keď stoja nepriatelia, a vyhrá sa, keď strana vyhrá; **nákup** pre každú stranu podľa priemernej hodnoty výbavy na konci času zmrazenia - prvé kolo každej polovice hry je pištoľové kolo (v predĺžení žiadne), potom pod 1 500 $ eco, pod 4 000 $ force buy, inak plný nákup.

## Karta {#the-tab}

Bočný panel karty Zápas má hore prepínač režimu heatmapy a výber relácie, pod ním sekcie zápasu a potom panely heatmapy **Filtre**, **Level** a **Kamera** - pohľad je heatmapa toho Parquetu, ktorý je načítaný na karte Heatmapa.

### Súhrny zápasov {#match-summaries}

| Ovládací prvok | Čo robí |
|---|---|
| **Načítať súbory zápasov…** | vyberie súbory `.json` (naraz viac): súhrny `.match.json` |
| pretiahnutie na zobrazenie | súbory JSON pretiahnuté na zobrazenie, keď je otvorená karta Zápas, sa načítajú rovnako (ostatné súbory sa ignorujú) |
| **Vymazať** | odstráni každý zápas |
| **Všetky zápasy** (pri dvoch alebo viacerých) | „N zápasov, M kôl“: štatistiky za všetky |
| riadok zápasu | „TeamA 13 vs TeamB 9“, mapa · N kôl: otvorí tento zápas |

Súbor sa prijme, keď je to JSON s `"format": "heat3d-cs2-match"` a poľami `rounds`, `players` a `teams`. Chyby sa vypíšu pod tlačidlami: „<file>: nie je JSON“, „<file>: nie je súhrn zápasu CS2 (heat3d-cs2-match)“, „<file>: chýba rounds, players alebo teams“. Zápas načítaný znova (rovnaký názov `match`) nahradí predchádzajúci. Zápasy sa zoradia podľa mapy a potom podľa názvu. Keď je načítaný presne jeden zápas, otvorí sa; inak výber zostane (predvolene všetky zápasy).

Keď nie je nič načítané, sekcia to vysvetlí: prevedte pomocou `python -m heat3d_cs2 demos`, tu načítajte súbory `.match.json` a na karte Heatmapa súbory `.parquet`.

### Zápas (jeden otvorený zápas) {#match-one-match-open}

**Hlavička:** oba tímy so svojím skóre, mapa, polovice - „polovice 7-5, 6-6“: kolá 1-12 a 13-24 (profesionálna a súťažná hra MR12; vlastná dĺžka polovice súhrnu, ak ju uvádza, takže 1-15 a 16-30 pri MR15) - potom, keď zápas išiel do predĺženia, jeho skóre samostatne: „predĺženie 4-2“, kolá po oboch polovicach. Remízové kolo sa nepočíta ani jednému tímu. A „N kôl prerušených v demu“, keď súhrn uvádza neúplné kolá.

**Pás kôl:** bunka pre každé kolo, zafarbená podľa strany, ktorá vyhrala, s jeho číslom a značkou, ako skončilo. Remízové kolo (bez víťaza) je neutrálna sivá bunka označená `=`, nikdy farbou strany; jej bublina hovorí „Kolo 30: remíza - nevyhrala ju ani jedna strana“.

| Značka | Ukončené |
|---|---|
| B | bomba vybuchla |
| D | bomba deaktivovaná |
| K | vyradená |
| T | vypršal čas |
| S | vzdanie |
| = | remíza |
| ? | iné |

Delič označuje začiatok druhej polovice (kolo 13, alebo kolo po dĺžke polovice súhrnu) a každej trojkolovej polovice predĺženia (kolá 25, 28, 31, …). Keď nad bunkou podržíte kurzor: „Kolo 7: TeamA (T) - bomba vybuchla, položená na A“ („…, položená, lokalita neznáma“, keď súhrn nemá lokalitu), a nákup a hodnota výbavy oboch strán. Kliknutím kolo otvoríte; kliknutím znova ho zatvoríte („Kliknite na kolo pre jeho zabitia, ekonomiku a prehranie.“).

**Kolo:**

- „Kolo 7: <tím> vyhral - <ako>“ („Kolo 30: remíza - nevyhrala ju ani jedna strana“ pri remíze) a ako dlho kolo trvalo (od konca zmrazenia po rozhodnutie, m:ss);
- ekonomika: tím každej strany, nákup (pištole, eco, force buy, plný nákup) a hodnota výbavy („4 350 $“);
- položenie bomby: lokalita, hráč a čas od začiatku kola (z ktorejkoľvek verzie súhrnu); „Položil <hráč> o 1:05, lokalita neznáma“, keď lokalita nie je známa;
- **prehľad zabití**, v poradí: čas od začiatku kola, útočník (vo farbe strany; „world“, keď nie je útočník), zbraň a príznaky - **HS** headshot, **WB** cez stenu, **SM** cez dymovú clonu; **úvod** prvé zabitie kola, **trade** (pomstil spoluhráča do 5 s), **pomstený** (vrah bol zabitý do 5 s), **tím** zabitie spoluhráča (samovražda sa nepočíta). Zabitia po rozhodnutí kola sú stlmené;
- clutche: „<hráč> (T) sám proti 3: clutch vyhratý“ / „prehratý“;
- kto bol na konci živý, pre každú stranu („nikto“);
- **Zobraziť kolo**: všetko z tohto kola v heatmape;
- **Prehrať kolo**: prehrá kolo ako boxy od jeho začiatku (nižšie).

Tlačidlá **Zobraziť v heatmape** (pozri [nižšie](#show-in-the-heatmap)) pre tento zápas alebo pre otvorené kolo.

### Tabuľka skóre {#scoreboard}

Tabuľka pre každý tím, riadok pre každého hráča:

| Stĺpec | Je |
|---|---|
| K, D | zabitia, smrti |
| A | asistencie vrátane asistencií flashom |
| ± | zabitia mínus smrti (zelená nad 0, červená pod 0) |
| ADR | poškodenie na kolo, skutočne stratené zdravie |
| KAST | % kôl so zabitím, asistenciou, prežitím alebo pomstenou smrťou |
| HS | % zabití headshotom |
| Úvod | vyhraté-prehraté úvodné súboje |
| Cl | vyhraté/odohrané clutche |

Keď nad hráčom podržíte kurzor: zabitia s pomstou, koľkokrát bol pomstený, asistencie flashom, oslepené nepriatele, poškodenie utilitami a kolá s viacnásobnými zabitiami („2×3k“). **Kliknutím na hráča** zobrazíte jeho zabitia a smrti v heatmape (tento zápas).

### Naprieč zápasmi (Všetky zápasy) {#across-matches-all-matches}

Cez každý načítaný zápas:

- „N zápasov · M kôl · <mapy>“ a „N kôl remízou, nevyhrala ich ani jedna strana“, keď boli remízy;
- **Vyhrané kolá** pre každú stranu: celkovo, v **pištoľových** kolách (pištoľové kolá súhrnu) a pri nákupoch **eco**, **force** a **plné** (každé ako percento s odohranými kolami; nad ním podržte kurzor pre „vyhraté z odohraných“). Remízové kolo hrajú obe strany a nevyhrá ho ani jedna;
- **Bomba**: položenia pre každú lokalitu a ako často T strana potom tie kolá vyhrala („12 položení na A (T vyhrala 67 %)“), položenia, ktorých lokalitu súhrn sám o sebe nepozná („2 položenia na neznámu lokalitu (T vyhrala 50 %)“), alebo „nikdy nepoložená“; ako kolá skončili, najčastejšie prvé;
- „Strana, ktorá získala prvé zabitie, vyhrala N % týchto kôl.“ (samovražda nie je prvé zabitie; remízové kolo neprevádza úvod);
- **Úvodné súboje, kde**: desať miest s najviac úvodnými zabitiami (podľa miesta obete; názvy miest hry čitateľné, „TopofMid“ → „Top of Mid“), súboje a podiel, ktorý vyhrala strana T;
- **Hráči**: pätnásť najlepších podľa zabití mínus smrti, spojených cez všetky ich zápasy (podľa Steam ID): zápasy, K-D, ADR a KAST vážené odohranými kolami, HS % vážené zabitiami, úvodné súboje. **Kliknutím na hráča** zobrazíte jeho zabitia a smrti vo všetkých zápasoch v heatmape.

Tlačidlá Zobraziť v heatmape pre všetky načítané zápasy sú pod tým.

## Čo rozhodlo kolá {#what-decided-the-rounds}

Karta počíta; [Zistenia](insights.md#who-won-what-decided-the-rounds) vysvetľujú. Keď je načítaná tabuľka heatmapy zápasu (nesie stĺpec `won`), **Zistenia** rozdelia kolá každej strany podľa toho, čo sa v nich stalo - úvodný súboj, nákup, vymenená prvá smrť, položenie, vybavenie, skorý prvý kontakt, každé držané miesto a každé miesto dosiahnuté v prvých 25 s - a povedia, čo urobilo rozdiel, s rozdielom podielov výhier, jeho 95 % intervalom a q, a *málo kôl*, kde má vetva menej ako osem kôl. Vymenujú zlomové okamihy (zabitia a položenia, ktoré najviac posunuli pravdepodobnosť výhry) a hráčov a miesta, ktoré najviac pridali alebo stratili, a **Zhrnutie** aj **Komentátor** nimi začínajú. Vymyslený príklad:

> T vyhrala 79 % z 19 kôl, v ktorých držala Mid, oproti 24 % z 21 bez neho (55 bodov, 95 % od 26 do 74) - q 0,004.
>
> Zlomové okamihy: kolo 17 v 48 s, zabitie strany CT na mieste B zmenilo jej šancu z 31 % na 58 % a kolo vyhrala.

Jeden zápas má menej ako 30 kôl, takže jeho pravdepodobnosti výhry pochádzajú z pevného apriórneho modelu živých mužov, položenia a času; text to povie. Naprieč mnohými zápasmi kladie tie isté otázky [hromadná analýza](mass-analysis.md#who-won).

## Zobraziť v heatmape {#show-in-the-heatmap}

Každý odkaz nastaví vlastné **filtre** heatmapy, takže to, čo sa zobrazuje, zostáva viditeľné a upraviteľné v paneli Filtre, a **Zobraziť všetky** ich vymaže. Pracujú nad tabuľkou heatmapy načítanou na karte Heatmapa; karta Zápas ju nikdy sama nenačíta.

| Tlačidlo | Zobrazené udalosti |
|---|---|
| **Pozície** | `position` - kde hráči boli, osemkrát za sekundu |
| **Zabitia** | `kill` - kde stál vrah |
| **Smrti** | `death` - kde padla obeť |
| **Úvodné súboje** | `kill` a `death` s `opening` = 1 - prvé zabitie každého kola, kde obaja stáli (ponúka sa len vtedy, keď tabuľka má stĺpec `opening`) |
| **Dymovnice** | `smoke` - kde pristáli dymovnice |
| **Flashe** | `flash` - kde vybuchli flashe |
| **Molotovy** | `molotov` - kde horeli molotovy a zápalné granáty |
| **HE** | `he` - kde vybuchli granáty HE |
| **Položenia bomby** | `plant` - kde bola bomba položená |
| **Výstrely** | `shot` - odkiaľ sa strieľalo |

Rozsah určujú miesta, kde sú tlačidlá: všetky načítané zápasy, tento zápas alebo toto kolo („Zobraziť v heatmape - kolo 7“).

To, čo sa nedá uplatniť, sa povie pod tlačidlami, nie tíško sa vyfiltruje na nič: „nie je zachovaný stĺpec zápasu - zápas sa neuplatnil“, „zápas: X nie je v načítaných dátach“, rovnako pre kolo a udalosti, „hráč X nie je v načítaných dátach“, „strana X nie je v načítaných dátach“, „nie sú načítané dáta heatmapy: načítajte súbory .parquet zápasov na karte Heatmapa“. Bez načítaných dát odkazy tiež hovoria „Načítajte súbory .parquet zápasov na karte Heatmapa, aby ste ich videli na mape.“

**Prehrať kolo** navyše prepne heatmapu na **Prehrávanie v boxoch**, časovú os do režimu *prehrávanie* s oknom nastaveným na *životnosť*, presunie sa na začiatok relácie kola a prehrá. Keď kolo nie je reláciou načítaných dát: „toto kolo nie je reláciou načítaných dát: nie je čo prehrať“.

## Pre vývojárov {#for-developers}

Kód: [`src/ui/match/MatchPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/match/MatchPanel.tsx),
[`src/match/matchDoc.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/matchDoc.ts),
[`src/match/focus.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/focus.ts),
[`src/state/matchStore.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/state/matchStore.ts).

### Verzie súhrnov {#summary-versions}

Karta číta súhrny verzie 1 a verzie 2 (`"version"` v súbore) vedľa seba a zaobchádza s nimi rovnako:

| | Verzia 2 | Verzia 1 |
|---|---|---|
| čas položenia | sekundy od začiatku kola, ako pri zabitiach | sekundy zápasu; karta odpočíta začiatok kola |
| lokalita položenia | `A` alebo `B`; prázdne, keď demo nehovorí | `A`, `B` alebo číslo entity - číta sa ako neznáma lokalita |
| dĺžka polovice | `halfLength`, od miesta, kde sa strany prvýkrát vymenia; 12, keď je null | 12 (MR12) |
| pištoľové kolá | `pistolRounds` (kolo 1 a prvé kolo po polovici) | kolá, ktorých nákup je `pistol` |
| remízové kolo | `winner` a `winnerTeam` prázdne | - |
| samovražda | `suicide` pri zabití, nikdy ako zabitie spoluhráča | určené tým, že útočník a obeť sú ten istý hráč |

`noscope` a `attackerBlind` zabitia (verzia 2) sa na karte Zápas nezobrazujú; karta tiež nezobrazuje žiadne miesto z tabuľky heatmapy, takže prázdne `place` riadku granátu tam tu nič nemení.

Ako sa zameranie zmení na filtre (`focusFilters`):

- **zápas** → filter kategórie na stĺpci `match`;
- **kolo** → filter rozsahu `round` = N na číselnom stĺpci `round` (filter kategórie na kategorickom), a relácia kola (`<match> #NN`) sa vyberie vo výbere relácie;
- **udalosti** → filter kategórie na stĺpci `event`;
- **hráč** → filter osoby na tohto hráča;
- **strana** → filter skupiny.
