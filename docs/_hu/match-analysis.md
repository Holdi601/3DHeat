---
title: "Meccselemzés (CS2)"
nav_order: 10
lang: "hu"
source: "match-analysis.md"
source_hash: "270f28c0f42b"
translated: true
outdated: false
---

# Meccselemzés (Counter-Strike 2)

A **Meccs** fül visszajátssza a felvételt figuraként, és egy Counter-Strike 2 meccsnél megmutatja az eredménytáblát is: ki nyerte az egyes köröket, hogyan, és ki ölt. Használd arra, hogy kör-kör átnézd a meccset, majd ugorj ugyanarra a pillanatra a hőtérképen.

A Meccs fül bármely felvételt figuraként játssza le: egy War Thunder- vagy Tacview-felvételt, vagy egy CS2-demót, amelyek a **Meccsek a visszajátszásban** alatt szerepelnek ([Meccs-visszajátszás](match-replay.md)). Egy CS2 `.match.json` fájl hozzáadja az ezen az oldalon leírt eredménytáblát.

## CS2-meccs átnézése {#review-a-cs2-match}

1. Alakítsd át a demót ([lent](#where-the-data-comes-from)) egy `.parquet` és egy `.match.json` fájllá.
2. A **Hőtérkép** fülön töltsd be a `.parquet` fájlt a **Forrás** alatt.
3. Nyisd meg a **Meccs** fület, és kattints a **Meccsfájlok betöltése…** gombra, vagy húzd a `.match.json` fájlt a nézetre.
4. Kattints egy meccsre a **Meccsösszesítők** alatt, majd a körsáv egy cellájára, hogy megnyisd azt a kört.
5. Kattints a **Kör megjelenítése** gombra, hogy lásd azt a kört a hőtérképen, vagy a **Kör visszajátszása** gombra, hogy figuraként nézd végig.

![A Meccs fül: körsáv egy megnyitott körrel, ölésnapló és eredménytábla](../assets/img/en/match-analysis-round.webp)

A KAST, ADR, eco, force buy és trade szavakat a [szószedet](glossary.md#counter-strike-words) magyarázza.

## Honnan jön az adat {#where-the-data-comes-from}

A [3DHeat CS2](https://github.com/Holdi601/3DHeat-CS2) demóátalakítója a demókat meccsenként két fájllá alakítja, térképenként egy mappában:

```bash
python -m heat3d_cs2 demos <demo files or folders> -o out
```

| Fájl | Hol töltődik be | Tartalma |
|---|---|---|
| `<match>.parquet` | a **Hőtérkép** fül (Forrás panel, mint bármely Parquet: egy fájl, több, vagy az egész mappa) | minden játékos pozíciója másodpercenként nyolcszor, és minden esemény, ahol történt: ölés, halál, sérülés, lövés, dobás, füst, vakító, HE, molotov, csali, vakítás, telepítés, hatástalanítás, robbanás; a `match`, `round`, `roundId`, `event`, `player`, `side`, `team`, nézési irány, `weapon`, `place`, `opening`, `traded` … mezőkkel |
| `<match>.match.json` | a **Meccs** fül | csapatok, állás, minden kör (győztes, hogyan, gazdaság, a telepítés, minden ölés sorrendben, a clutch-ek, a túlélők), minden játékos eredménytábla-sora |

A Parquet-fájl láblécében olvasási utasítások vannak (`heat3d` kulcs), így semmit sem kell beállítani: a játékos mint személy, az oldal mint csoport, minden kör (`roundId`, „<match> #NN”) mint munkamenet, a nézési irány bekapcsolva, és a világ a helyes irányban. A CS2 világa jobbkezes, Z-vel felfelé; alapértelmezett Z-felfelé leképezéssel olvasva tükrözötten jönne ki. Lásd: [Oszlopleképezés](column-mapping.md) és [Fájlok betöltése](loading-files.md). A `python -m heat3d_cs2 map <map>` ugyanabban a keretben exportálja a pálya geometriáját, amelyet a **Pálya** fülön lehet betölteni.

A számok mögötti szabályok az átalakítóéi (az README-jében leírva, és minden összefoglalóban benne): egy halál **megbosszulva** (traded), ha az ölőjét az áldozat egyik csapattársa öli meg **5 másodpercen** belül. A **KAST** azoknak a köröknek az aránya, amelyekben volt ölés, gyilkosságban segítség (a vakítás-segítség is számít), túlélés vagy megbosszult halál. A **sebzés** a ténylegesen elveszett életerő, csak az ellenfeleké. A **clutch** az, amikor az utolsó élő vagy az oldalon, ellenfelek állnak, és megnyerte, ha az oldal nyer. A **vásárlás** oldalanként a felvásárlási idő végén lévő átlagos felszerelési értékből: minden szabályos félidő első köre pisztolykör (a hosszabbításban nincs), utána 1500 $ alatt eco, 4000 $ alatt force buy, minden más teljes vásárlás.

## A fül {#the-tab}

A Meccs fül oldalsávja felül tartalmazza a hőtérkép mód-kapcsolóját és munkamenet-választóját, alatta a meccs szakaszait, majd a hőtérkép **Szűrők**, **Pálya** és **Kamera** paneljeit. A nézet mindig annak a hőtérképe, amely a Hőtérkép fülön be van töltve.

### Meccsösszesítők {#match-summaries}

| Vezérlő | Mit tesz |
|---|---|
| **Meccsfájlok betöltése…** | `.json` fájlokat választ (többet egyszerre): a `.match.json` összefoglalókat |
| húzás a nézetre | A Meccs fül nyitott állapotában a nézetre húzott JSON-fájlok ugyanígy töltődnek be (a többi fájl figyelmen kívül marad) |
| **Törlés** | minden meccset eltávolít |
| **Összes meccs** (kettő vagy több esetén) | „N meccs, M kör”: a statisztikák mindegyikre együtt |
| egy meccssor | „TeamA 13 vs TeamB 9”, térkép · N kör: megnyitja azt a meccset |

Egy fájl akkor fogadott, ha JSON, `"format": "heat3d-cs2-match"` értékkel, és `rounds`, `players` és `teams` tömbökkel. A hibák a gombok alatt jelennek meg: „<fájl>: nem JSON”, „<fájl>: nem CS2-meccsösszesítő (heat3d-cs2-match)”, „<fájl>: hiányzik a rounds, players vagy teams”. Ha egy meccset újra betöltesz (ugyanaz a `match` név), az felülírja a korábbit. A meccsek térkép, majd név szerint vannak rendezve. Ha pontosan egy meccs van betöltve, az megnyílik. Különben a kijelölés megmarad (alapból: összes meccs).

Betöltetlenül a szakasz elmagyarázza: alakítsd át a `python -m heat3d_cs2 demos` paranccsal, töltsd be itt a `.match.json` fájlokat, a `.parquet` fájlokat pedig a Hőtérkép fülön.

### Meccs (egy meccs megnyitva) {#match-one-match-open}

**A fejléc:** mindkét csapat az állásával, a térkép és a félidők: „félidők 7-5, 6-6”, azaz az 1–12. és a 13–24. kör (prémium és versenyjáték MR12; ha az összefoglaló megadja a saját félidő-hosszát, azt használja, így MR15-nél 1–15 és 16–30). Ha a meccs hosszabbításba ment, külön az állása: „hosszabbítás 4-2”, a két félidő utáni körök. Egy döntetlen kör egyik csapatnak sem számít. Megjelenik még: „N kör levágva a demóban”, ha az összefoglaló hiányos köröket sorol fel.

**A körsáv:** egy cella körönként, a győztes oldal színével, a számával és egy jellel, hogyan ért véget. A döntetlen kör (nincs győztes) semleges szürke cella `=` jellel, sosem oldalszínnel; súgója: „30. kör: döntetlen – egyik oldal sem nyerte meg”.

| Jel | Véget vetett |
|---|---|
| B | a bomba felrobbant |
| D | a bombát hatástalanították |
| K | kiütötték |
| T | lejárt az idő |
| S | feladás |
| = | döntetlen |
| ? | egyéb |

Egy elválasztó jelzi a második félidő kezdetét (13. kör, vagy az összefoglaló félidő-hosszát követő kör), és minden háromkörös hosszabbítási félidő kezdetét (25., 28., 31. …). Egy cella fölé húzva: „7. kör: TeamA (T) – a bomba felrobbant, A-ra telepítve” („…, telepítve, ismeretlen helyszín”, ha az összefoglaló nem tartalmaz helyszínt), és mindkét oldal vásárlása és felszerelési értéke. Kattints a kör megnyitásához; újra kattintva bezárod („Kattints egy körre az ölésekért, a gazdaságért és a visszajátszásért.”).

**A kör:**

- „7. kör: <csapat> nyert – <hogyan>” („30. kör: döntetlen – egyik oldal sem nyerte meg”, döntetlennél), és hogy mennyi ideig tartott a kör (a fagyasztás vége és az eldőlés között, p:mm);
- a gazdaság: minden oldal csapata, vásárlása (pisztoly, eco, force buy, teljes vásárlás) és felszerelési értéke („4350 $”);
- a telepítés: helyszín, játékos és idő a körön belül (a két összefoglalóverzió bármelyikéből); „Telepítette <player> 1:05-nél, ismeretlen helyszín”, ha a helyszín nem ismert;
- **az ölésnapló** sorrendben: idő a körön belül, támadó (az oldal színében; „world”, ha nincs támadó), fegyver, és jelölők: **HS** fejlövés, **WB** fal mögött, **SM** füsttel. A kör első ölését **nyitó**; **trade** (megbosszult csapattársat 5 másodpercen belül), **traded** (az ölőt 5 másodpercen belül megölték), **team** csapattárs-ölés (az öngyilkosság nem az). Az eldőlés után történt ölések halványítva;
- a clutch-ek: „<player> (T) egyedül 3 ellen: megnyerte a clutch-et” / „elvesztette”;
- ki élt a végén, oldalanként („senki”);
- **Kör megjelenítése**: minden ebben a körben a hőtérképen;
- **Kör visszajátszása**: a kört dobozokként játssza vissza az elejétől (lent).

A **Megjelenítés a hőtérképen** gombok (lásd [lent](#show-in-the-heatmap)) ehhez a meccshez, vagy a megnyitott körhöz tartoznak.

### Eredménytábla {#scoreboard}

Csapatonként egy táblázat, játékosonként egy sor:

| Oszlop | Mi |
|---|---|
| K, D | ölések, halálok |
| A | gyilkosságban segítségek, a vakítás-segítségek is |
| ± | ölések mínusz halálok (zöld 0 felett, piros alatta) |
| ADR | sebzés körönként, a ténylegesen elveszett életerő |
| KAST | a körök %-a, amelyekben volt ölés, segítség, túlélés vagy megbosszult halál |
| HS | a fejlövéses ölések %-a |
| Nyitó | nyitópárbajok nyert–vesztett |
| Cl | clutch-ek nyert/játszott |

Egy játékos fölé húzva: trade-ölések, megbosszult halálok, vakítás-segítségek, megvakított ellenfelek, segédeszköz-sebzés, és több ölést hozó körök („2×3k”). **Kattints egy játékosra**, hogy lásd az ő ölését és halálait a hőtérképen (ebben a meccsben).

### Meccsek között (Összes meccs) {#across-matches-all-matches}

Minden betöltött meccsen át:

- „N meccs · M kör · <térképek>”, és „N kör döntetlen, egyik oldal sem nyerte”, ha volt döntetlen;
- **Megnyert körök** oldalanként: összesen, a **pisztolyköröknél** (az összefoglaló pisztolyköreiben), és az **eco**, **force** és **teljes** vásárlásoknál. Mindegyik százalékban, a lejátszott körökkel; fölé húzva „megnyert / lejátszott”. Egy döntetlen kört mindkét oldal lejátszik, és egyik sem nyeri;
- **Bomba**: telepítések helyszínenként, és hogy a T oldal hányszor nyerte meg utána ezeket a köröket („12 telepítés A-n (T 67%-ot nyert)”); azok a telepítések, amelyek helyszínét az összefoglaló nem ismeri („2 telepítés ismeretlen helyszínen (T 50%-ot nyert)”); vagy „soha nem telepítettek”. A körök vége, leggyakoribb elöl;
- „Az az oldal, amely az első ölést szerezte, a körök N%-át nyerte.” (az öngyilkosság nem nyitó ölés; döntetlen kör nem váltja át a nyitást);
- **Nyitópárbajok, helyszín szerint**: az a tíz hely, ahol a legtöbb nyitó ölés volt (az áldozat helye szerint; a játék helyneveit olvashatóvá téve: „TopofMid” → „Top of Mid”), a párbajok és a T oldal által nyert részarány;
- **Játékosok**: a tizenöt legjobb ölés mínusz halál szerint, összesítve minden meccsükön (a Steam-azonosító alapján párosítva): a meccsek, K-D, ADR és KAST a lejátszott körökkel súlyozva, HS% az ölésekkel súlyozva, és a nyitópárbajok. **Kattints egy játékosra**, hogy lásd az ölési és halálozási adatait az összes meccsén a hőtérképen.

A Megjelenítés a hőtérképen gombok az összes betöltött meccsre ez alatt vannak.

## Megjelenítés a hőtérképen {#show-in-the-heatmap}

Minden hivatkozás a hőtérkép saját **szűrőit** állítja be, így a megjelenített dolog látszik és szerkeszthető marad a Szűrők panelen. Az **Összes megjelenítése** mindent töröl. Ezek a Hőtérkép fülön betöltött hőtérkép-táblázaton működnek, a Meccs fül maga sosem tölti be.

| Gomb | Megjelenített események |
|---|---|
| **Pozíciók** | `position`: hol voltak a játékosok, másodpercenként nyolcszor |
| **Kiütések** | `kill`: hol állt az ölő |
| **Halálok** | `death`: hol esett el az áldozat |
| **Nyitó ölések** | `kill` és `death`, ahol `opening` = 1: minden kör első ölése, ahol mindketten álltak (csak akkor kínálva, ha a táblázatban van `opening` oszlop) |
| **Füstök** | `smoke`: hol értek földet a füstök |
| **Vakítók** | `flash`: hol robbantak a vakítók |
| **Molotovok** | `molotov`: hol égtek a molotovok és a gyújtók |
| **HE** | `he`: hol robbantak a HE-gránátok |
| **Telepítések** | `plant`: hol telepítették a bombát |
| **Lövések** | `shot`: honnan adtak le lövéseket |

A hatókör a gombok helyétől függ: az összes betöltött meccs, ez a meccs, vagy ez a kör („Megjelenítés a hőtérképen – 7. kör”).

Ami nem alkalmazható, azt a gombok alatt mondjuk ki, nem csendben szűrjük üres halmazra: „nincs meccsoszlop megtartva – a meccs nincs alkalmazva”, „match: X nincs a betöltött adatokban”, ugyanez a körre és az eseményekre, „a játékos X nincs a betöltött adatokban”, „az oldal X nincs a betöltött adatokban”, „nincs hőtérkép-adat betöltve: töltsd be a meccsek .parquet fájljait a Hőtérkép fülön”. Adatok nélkül a hivatkozások is azt írják: „Töltsd be a meccsek .parquet fájljait a Hőtérkép fülön, hogy lásd őket a térképen.”

A **Kör visszajátszása** ezen felül a hőtérképet **Dobozvisszajátszásra** kapcsolja, az idővonalat *lejátszás* módba, az ablakát *élettartam* állásba, a kör munkamenetének kezdetére ugrik, és lejátssza. Ha a kör nem a betöltött adatok munkamenete: „ez a kör nem a betöltött adatok munkamenete: nincs mit visszajátszani”.

## Fejlesztőknek {#for-developers}

Kód: [`src/ui/match/MatchPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/match/MatchPanel.tsx),
[`src/match/matchDoc.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/matchDoc.ts),
[`src/match/focus.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/focus.ts),
[`src/state/matchStore.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/state/matchStore.ts).

### Összefoglaló-verziók {#summary-versions}

A fül az 1. és a 2. verziójú összefoglalókat (a fájlban a `"version"`) egymás mellett olvassa, és egyformán kezeli őket:

| | 2. verzió | 1. verzió |
|---|---|---|
| telepítés ideje | másodpercek a körön belül, mint az ölések | meccsmásodpercek; a fül kivonja a kör kezdetét |
| telepítés helyszíne | `A` vagy `B`; üres, ha a demó nem mondja meg | `A`, `B`, vagy egy entitásszám: ismeretlen helyszínként olvasva |
| félidő-hossz | `halfLength`, attól a körtől, ahol az oldalak először cserélnek; 12, ha null | 12 (MR12) |
| pisztolykörök | `pistolRounds` (az 1. kör és a félidő utáni első kör) | azok a körök, amelyeknek a vásárlása `pistol` |
| döntetlen kör | `winner` és `winnerTeam` üres | - |
| öngyilkosság | `suicide` az ölésen, sosem csapattárs-ölés | az támadóból és áldozatból ugyanaz a játékos |

Egy ölés `noscope` és `attackerBlind` mezőjét (2. verzió) a Meccs fül nem mutatja, ahogy a hőtérkép-táblából sem mutat helyet. Így a gránátsor üres `place` mezője itt semmit sem változtat.

Hogyan lesz a fókuszból szűrő (`focusFilters`):

- **meccs** → kategória-szűrő a `match` oszlopon;
- **kör** → tartomány-szűrő: `round` = N egy számszerű `round` oszlopon (kategória-szűrő egy kategorikuson), és a kör munkamenete (`<match> #NN`) ki van jelölve a munkamenet-választóban;
- **események** → kategória-szűrő az `event` oszlopon;
- **játékos** → személy-szűrő arra a játékosra;
- **oldal** → csoport-szűrő.
