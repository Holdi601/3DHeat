---
title: "Visszajátszás és a 3D-s jelenet"
parent: "Versenyelemzés"
nav_order: 52
lang: "hu"
source: "race-replay-and-scene.md"
source_hash: "ebeead492b6a"
translated: true
outdated: false
---

# Visszajátszás és a 3D-s jelenet

Játszd vissza a köreidet együtt, mint egy versenyt, és nézd, hol húz el az egyik autó. Itt van leírva mindaz, amit a **Versenyelemzés** fül 3D-s nézetében látsz: a bejárt ívek, a pályára festett színek, az autók és a feliratok.

![Oktérkép, az autók 40 m-rel egy kanyar előtt felsorakoztatva: színezett pálya, két autó és a zászlós oszlop](../assets/img/en/race-replay-lined-up.webp)

## A visszajátszás órája {#the-replay-clock}

Egy óra hajtja minden körödet: a **referencia** kör másodpercei. A motor lejátszás közben minden képkockában továbbviszi (a képkocka idejének × a visszajátszás sebessége szerint); a végén, ha az **Ismétlés** be van kapcsolva, visszaáll 0-ra, különben megáll. Az óra szándékosan nincs a tárolóban, így az oldalsáv nem rajzolódik újra minden képkockánál; a HUD és a grafikonok feliratkoznak rá, és legfeljebb egyszer frissülnek képkockánként.

**A visszajátszás hossza** a leghosszabb kör ideje az órán: minden kör ideje (mínusz az eltolása a *Felsorakoztatva* módban), vagy a referencia ideje a *Egymás mellett* módban.

## Az átviteli sáv {#the-transport-bar}

A nézet alatt, balról jobbra:

| Vezérlő | Mit csinál |
|---|---|
| ⏮ | vissza a kezdetre (**Home** is) |
| ▶ / ❚❚ | lejátszás / szünet (**K** is) |
| sebesség | 0,25×, 0,5×, 1×, 2×, 4× |
| csúszka | közvetlenül állítja az órát, 0,01 s-os lépésekben |
| óra | `idő / hossz · méter`: az óra köridőként, a visszajátszás hossza, és hogy a referenciaautó mennyire van a referencia mentén |
| *A rajtvonaltól* / *Felsorakoztatva* / *Egymás mellett* | a visszajátszási mód (lent) |
| **Felsorakoztatás itt** | minden autót oda tesz, ahol most a referencia van, és onnan folytatja |
| **Ismétlés** | az elején újraindul (alapból bekapcsolva) |
| **Grafikonok elrejtése** / **Grafikonok megjelenítése** | a távolsággrafikonok a sáv alatt |

A gombok addig nincsenek engedélyezve, amíg nincsenek betöltött körök (egy kör is elég a visszajátszáshoz; az összehasonlításhoz kettő kell).

## Visszajátszási módok {#replay-modes}

Hogyan következik minden kör saját ideje az órából:

| Mód | Minden kör ideje | Mit mutat |
|---|---|---|
| **A rajtvonaltól** (`start`) | maga az óra | minden kör a saját kezdetétől: köztük verseny, a különbség úgy nő, ahogy a pályán is nőtt |
| **Felsorakoztatva** (`anchor`) | az óra plusz a kör eltolása | minden autó ugyanazon a helyen, ugyanabban a pillanatban, aztán elengedve – az onnantól történik, nem a kör kezdetétől |
| **Egymás mellett** (`locked`) | az az idő, amikor a kör elérte a referencia aktuális távolságát | minden autó a referencia távolságán tartva a teljes körben: sebességek és bemenetek méterről méterre összehasonlítva |

Használd így:

- **A rajtvonaltól**: ha látni akarod, ki van elöl, és hogyan nő a különbség.
- **Felsorakoztatva**: ha tudni akarod, mi történik egy kanyarban vagy egy egyenesen, mindenki ott egyenlő kiindulással.
- **Egymás mellett**: ha össze akarod hasonlítani, mit csinálnak a vezetők a pedállal és a kormánnyal a pálya ugyanazon pontján.

**Eltolások a *Felsorakoztatva* módban:** egy `s` méterre a referencia mentén lévő horgonyhoz minden kör eltolása a saját ideje `s`-nél mínusz a referencia ideje `s`-nél, mindkettő a felsorakoztatott körökből olvasva (lásd [egy távolságtengely](race-corner-analysis.md#one-distance-axis)). Egy kör, amely nem fedi le `s`-t, megtartja a 0 eltolást. A *Felsorakoztatva* kiválasztása a módgombokból a referencia aktuális távolságára horgonyoz.

Egy zászlós fehér oszlop (14 m magas) jelöli a horgonyt a *Felsorakoztatva* módban.

### Felsorakoztatás {#lining-up}

| Művelet | Horgony | Óra |
|---|---|---|
| **Felsorakoztatás itt** | ahol a referencia most van | nem változik |
| Shift+kattintás a grafikonokon | a kattintott méter | 1,5 s-mal azelőtt, hogy a referencia elérné |
| egy megállapítás a *Hol lehet javítani* részben, egy számozott jelvény a pályán, a *Kanyarról kanyarra* egy sora megállapítással | 40 m-rel az előtt, ahol a megállapítás oka kezdődik | 1,5 s-mal azelőtt, az adott pontnál; utána lejátszás |
| egy autóvezetési esemény, egy ütközés felirata | 40 m-rel az esemény előtt | 1,5 s-mal előtte; utána lejátszás |
| egy kör a pályastatisztikában | mint a megállapítása vagy eseménye | mint fent, az adott kör fókuszálva |

A megállapítás megnézése a kamerával is bekeretezi: egy gömb a megállapítás tartományának közepe körül, a sugara a 40 m és a hossza felének plusz 30 m közül a nagyobb (eseménynél 60 m) – hacsak a kamera nem követ egy autót.

### Követőkamera {#chase-camera}

A ⌖ a körlistában arra készteti a kamerát, hogy kövesse azt az autót: 2,5 + 4 × autóméret méterrel mögötte és 0,9 + 1,1 × autóméret méterrel felette, a haladási irányába nézve, az autó felé lefelé döntve, simítva (képkockánként a távolság 20%-ával), hogy minden rázkódásra ne rázkódjon. Újra a ⌖ elengedi. A követett autó kicsit világosabban rajzolódik, fehér gyűrűvel a talajon, a kártyája pedig kiemelve.

## A Nézet rész {#the-view-section}

| Vezérlő | Alapérték | Mit csinál |
|---|---|---|
| **Vonalak** / **Időtérkép** / **Oktérkép** / **Hibatérkép** | Időtérkép | mi van a pálya mentén festve (lent); a *Vonalak* semmit sem fest |
| jelmagyarázat | - | *nyer ↔ veszít* az időtérképnél, az ok színei az oktérképnél, *kevés kör ↔ a legtöbb kör* a hibatérképnél |
| **Bejárt ívek** | be | minden látható kör vonala a saját színében |
| **Autók** | be | az autók, és a HUD-kártyák forrásai |
| **Gumik és felfüggesztés** | be | a gumi hőmérséklete, a csúszási gyűrűk, a felfüggesztési tolórudak és más kerekenkénti jelölések, és a tetőlámpák az autókon |
| **Feliratok** | be | kanyarnevek, számozott jelvények, ütközési feliratok, a hibatérkép kanyarfeliratai |
| **Pálya a körökből** | be | útfelület egy pályához kinyert modell nélkül (egy betöltött pályamodell alatt elrejtve) |
| **Minden érték a kártyákon** | ki | minden csatorna, amely minden HUD-kártyán fel van sorolva |
| **Valódi autóformák** | be | minden autó a megfelelőjének formájában (lásd [Az autók](#the-cars)); ki: a nyitott együléses, amely nem takar el semmit a telemetriából |
| **Autóméret** | 1× | 1×-tól 10×-ig 0,5-es lépésekben; az 1× az autó valódi mérete, olyan hosszú és széles, mint a játékban. Csak ez a csúszka változtatja |

## Bejárt ívek {#driven-lines}

Minden látható kör útja a saját mintáin át, a saját színében, a rögzített pozíció 0,12 m-rel alatta rajzolva (egy autó rögzített pozíciója a referenciapontja, kinyert Forza-pályákon 0,28–0,47 m-rel az út fölött). Minden 1,5 m-enként marad egy pont; ha több mint 10 kör látszik, a nem vizsgált körök 6 m-enként tartanak meg egyet (minden csúcspont minden képkockában a GPU-ra megy).

## A térképek {#the-maps}

Mindhárom szalag a **referencia** út mentén fut, a rögzített pozíciók 0,2 m-rel alatt, rácslépésenként két méter.

### Időtérkép (`where`) {#time-map-where}

A fókuszált körre: másodperc, amelyet egy méteren nyer vagy veszít ahhoz a körhöz képest, amellyel azon a ponton hasonlítjuk (osztályának legjobbja, vagy a referencia esetén az egyes szakaszokon a leggyorsabb másik kör), a felsorakoztatott delta változásából rácslépésenként, ±10 m-en simítva. Pirossal, ahol időt veszít, zölddel, ahol nyer, szürkével a kettő között; a színskála az abszolút értékek 95. percentilise, így a csúcsok levágódnak, és a kör nagy része a tartományban van. 6 m széles.

### Oktérkép (`why`) {#cause-map-why}

A fókuszált körre: minden veszteség arra a tartományra festve, ahol az **oka** van (nem ott, ahol az idő látszik), az ok csoportja szerint színezve; ha két tartomány átfed, a drágább megállapítás nyer. Szélesség `3 + 9·√(költség / legnagyobb költség)` méter; ahol nem veszítettek, egy szürke 2 m-es csík. A *Hol lehet javítani* részben kiválasztott megállapítás fehérre van festve.

| Csoport | Szín | Megállapítások |
|---|---|---|
| fékezés | narancs | a vezetés okozta veszteségek a fékezési fázisban |
| belépés | bíborvörös | a vezetés okozta veszteségek a belépésnél és a közepén |
| kijárat | kék | a vezetés okozta veszteségek a kijáratnál |
| egyenes | sárga | a vezetés okozta veszteségek az egyenesen |
| autó | szürke | amit az autó magyaráz |
| körülmények | sötétszürke | a helyzet (egy versenyrajt egy repülő körrel szemben) |

### Hibatérkép {#mistake-map}

Hány kör (a pályastatisztikában kiválasztott osztályok összes köréből) követett el hibát minden méteren – bármilyen fajtát, vagy csak a statisztikában kiválasztott egyet. Minden kör méterenként egyszer számít; minden hiba tartományát 6 m-rel szélesítjük mindkét oldalon, hogy a rövid is látszódjon. Szélesség `3 + 10·(körök / a legtöbb kör)` méter, a szín a halvány barnától az élénk narancsig; szürke 2 m, ahol egy kör sem hibázott. Lásd [Pályastatisztikák](race-course-statistics.md#the-mistake-map).

## Pálya a körökből {#track-from-the-laps}

Egy olyan játékhoz, amelynek pályáját nem nyerték ki, a vonalak alatt egy út rajzolódik: olyan széles, mint ahogy a körök szétterülnek a referencián (a 25 m-en belüli oldalirányú eltérések számítanak), plusz 2 m mindkét oldalon, és legalább 4 m mindkét oldalon a referencia vonalától, ±8 rácspontban (±16 m) simítva, aszfaltszürkével, halvány szegélyvonalakkal, a rögzített pozíciók 0,3 m-rel alatt. Egy pályamodell **Pálya** alatti betöltésekor elrejtődik.

## Ütközések és balesetek a pályán {#hits-and-crashes-on-the-track}

Minden látható kör ütközéseit és baleseteit (lásd [Autóvezetési események](race-control-events.md#hits-and-crashes)) megjelöljük, ahol történtek, amikor vonalak vagy autók látszanak: egy csúcsos csillag oszlopon állva – piros a balesetnél, borostyán az ütközésnél –, aljánál a kör színű gyűrűvel, az autóméret szerint méretezve (a balesetek nagyobbak). Ahogy egy autó elhalad egy ütközés pillanatánál, egy lökéshullám-gyűrű terjed belőle 0,8 s-ig.

## Súgómód {#help-mode}

A nyelvválasztó melletti **?**, vagy a **?** és az **F1** billentyű bekapcsolja a képernyőn látható minden szín kulcsát mind a három fülön ([`HelpPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/help/HelpPanel.tsx),
[`RaceHelp.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHelp.tsx)). A választás ebben a böngészőben marad.

- **A kulcs** a nézet sarkában felsorolja a használt fül és mód színeit. Minden skála onnan jön, ahonnan a nézet kapja, így egy szerkesztett hőskála is szerkesztettként látszik. A versenyfülön csak az van felsorolva, amit a betöltött körök hordoznak.
- **Minden autó kártyája** kap egy táblázatot arról, mi van kirajzolva a kerekein, névvel, és minden kerék értékével abban a színben, amelyben ki van rajzolva.
- **A fókuszált autó** minden kerekénél kap egy feliratot, amely ugyanezt mondja, a sarkokba kihelyezve. Ott van elrejtve, ahol az autó túl kicsi a képernyőn, hogy beleférjenek.

## Az autók {#the-cars}

**Minden autó a saját formájában**, a köre színében és a valódi méretében. A formákat egy autófájl adja, amelyet egyszer készítenek azon a gépen, amelyen a játék van:

```
python -m heat3d_gamefiles cars -o forza.h3dcars
```

Nélküle minden autó a megjelenítő **saját autójaként** rajzolódik a maga fajtája és korszaka szerint: szedán, kupé, ötajtós, kombi, sportautó, szupersportautó, izomautó, terepjáró, pickup, furgon vagy mikroautó, mindegyik klasszikusként (1980 előtt), a 80-as vagy 90-es években, vagy modernként ([`carBodies.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carBodies.ts)). Ezeket itt, általános arányokból építjük: nincsenek logók, modellnevek, és semmi nincs bármely játék fájljaiból, így a megjelenítővel együtt szállíthatók. A fajta az autó nevéből jön, a korszak az abban lévő évszámból; akinek egyik sincs, az az osztálya alapján kapja. Mintegy száz valódi generációt ismerünk a közzétett hosszúságuk, szélességük, magasságuk és tengelytávjuk alapján ([`carSpecs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carSpecs.ts); soronként egy, kerekítve), így egy 1990-es 3-as sorozat azon autó méretét és testtartását kapja, még egyszerű formaként, márka- és hűtőrács nélkül.

Az autófájl a saját gépeden készül, a játék saját másolatából. Minden autó alacsony részletességű modelljét tartalmazza, kb. 900 háromszöggel, a kerekek helyzetével (lásd [a kinyerő `cars` parancsát](https://github.com/Holdi601/3DHeat-GameFiles/blob/main/docs/commands.md#cars)).
Az **Autófájl betöltése...** a nézet beállításaiban, vagy a fájl húzása a versenyfülre betölti; ebben a böngészőben marad. A játék formáit tartalmazza, így nem valami, amit tovább kell adni, és a megjelenítő nem szállít ilyet.

Hogy melyik autó helyettesít egy kört, minden alkalommal abból számoljuk, ami éppen be van töltve, és sosem tároljuk, így egy mai ellenpár nélküli autó a saját formáját kapja, amint egy újabb fájl már tartalmazza ([`carMatch.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carMatch.ts)):

| A kör autója | Ahogy rajzolódik |
|---|---|
| a száma benne van a fájlban ugyanarra a játékra | pontosan az az autó |
| ugyanaz a márka, és a modell egy szava a nevében | az a modell, évben a legközelebbi |
| ugyanaz a márka, ugyanaz a generáció | az a márka autója, évben a legközelebbi |
| bármi más, autófájllal | ugyanazon márka legközelebbi, ha van, különben ugyanolyan karosszériatípus, évben a legközelebbi |
| egy nyitott kerekű autó a neve alapján | az alábbi együléses |
| az első kettő egyike sem, és a megjelenítő ismeri az autót a méretéből | a megjelenítő saját autója annak a valódi autónak a méretében, fájllal vagy anélkül |
| bármi más fájl nélkül | a megjelenítő saját autója annak a fajtának és korszaknak |

Így egy másik játék 1990-es BMW 3-as sorozatú köre egy kb. azonos évjáratú BMW-t mutat, és egy fájlnál újabb autó a legközelebbi rokonát mutatja, amíg a fájlt újra nem készítik. Egy kör súgója, és a követett kör autóméretének alatti sor, megmondja, mint van rajzolva, és milyen közel van ez.

A megjelenítő saját autóinak sötét ablakai vannak. Az autófájl modelljei egy színűek, mert a fájlban nincs festés vagy üveg, amihez igazodni lehetne. A kerekek, a hátsó lámpák, a lámpák és az alábbi telemetriai jelölések úgy vannak rajzolva, mint az együléseseken; a tolórúd a kerék külső oldalán fut fel, ahol látszik, és a lengőkarokat elhagyjuk.

**Az együléses** egy nyitott kerekű autó a kör színében, így az eleje bármely szögből egyértelmű, és semmi nem takarja a kerekeket: kádszerkezet, motorborítás, oldalsó légterelők, vezetőfülke sisakos pilótával, halo, padló, első és hátsó szárny; négy kerek kerék, az elsők a kormányzással elfordulva (teljes kormánynál legfeljebb 0,5 rad), mindegyik két lengőkaron, függőleges tartóval, az elsőnél kormányrúddal, a hátsónál hajtótengellyel, és egy tolórúddal. A modell 0,3 m-rel a rögzített pozíció alá kerül, hogy a kerekei az úton üljenek, és **Autóméret** szerint skálázódik.

**A test a rugóin mozog**: ha a kör mind a négy felfüggesztés-elmozdulást tartalmazza, minden sarok az elmozdulásával leesik (0,12 m-re felnagyítva a teljes visszarugózástól a teljes összenyomódásig, hogy egy követőkameráról is látszódjon), a test pedig a négy pontja által kifeszített síkban süllyed, dől és billen.

**Ami a telemetriából van rajzolva** (a *Gumik és felfüggesztés* bekapcsolva) követi a [csatornatáblázatot](race-charts-and-hud.md#the-channel-table):

| Jelölés | Honnan | Rajz |
|---|---|---|
| gumi színe | `tireTemp` | maga a gumi, kék (hideg) → cián → zöld (üzemi) → sárga → piros (forró), 40–130 °C között |
| csúszási gyűrű | `slipRatio`, `slipAngle`, `combinedSlip`, `slipIndex` (a legnagyobb) | gyűrű a kerék alatti talajon: zöld, ha a tapadás megvan, borostyán 0,66-nál, piros 1-nél (a tapadás széle, ahogy a játék jelenti); 0,3 alatt halvány |
| felfüggesztési sáv | `suspension` (0..1) | a tolórúd az elmozdulás szerint színezve: kék kinyújtva, fehér középen, piros összenyomva |
| fékizzás | `brakeTemp` (100–900 °C) | egy tárcsa a kerék külső oldalán, sötéttől narancsig |
| kopássáv | `tireWear` (0..1) | sáv a futófelület szélén, fehér újtól piros kopottig |
| terhelési sáv | `wheelLoad` (0–12 000 N) | oszlop a kerék mellett, akkora, mint a terhelés |

A fékfények (az esőlámpa és a szárnyvégek) a féklábbal gyulladnak. Minden `lamp` csatorna, amely be van kapcsolva (a tartományának fele felett), lámpát gyújt a légbeömlő fölött a színében: ABS működik, kipörgésgátló működik, DRS, boxutcai sebességkorlátozó, kézifék, levegőben.

**Tömegben** (tíznél több látható autó), a nem vizsgált autók egyszerűen rajzolódnak: karosszéria, szárnyak, kerekek és a fékfény csak.

## Feliratok {#labels}

A pályához rögzítve, és minden képkockában a kamera vetítéséből helyezve (a képernyőn kívül vagy a kamera mögött, elrejtve). Ha a **Feliratok** be van kapcsolva:

| Felirat | Hol | Kattintás |
|---|---|---|
| kanyarnevek (`T1`, `T2` …) | minden kanyar csúcsa fölött a referencián | - |
| számozott jelvények 1–5 | a fókuszált kör öt legnagyobb vezetés okozta vesztesége, minden ok tartományának közepén, az ok színű szegéllyel; fölé húzva a cím és az ár | a megállapítás felsorakoztatása és visszajátszása |
| ütközés- / baleseti feliratok | a **fókuszált** kör minden kitörése fölött: „Baleset −45 km/h” / „Ütközés −12 km/h”; fölé húzva a teljes leírás és a tipp | az ütközés felsorakoztatása és visszajátszása |
| hibatérkép kanyarfeliratai (a kanyarnevek és a jelvények helyett, ha a térkép a hibatérkép) | minden kanyar csúcsa: „T3 · 5/40 korai fékezés” (a leggyakoribb hiba, a hibát elkövető körök / a kanyart vezető körök), „T3 · 5/40”, ha egy fajta van kiválasztva, „T3 · tiszta”, ha egy sem; fölé húzva a kanyar vesztesége és az öt leggyakoribb hibája | az adott kanyar megnyitása vagy bezárása a pályastatisztikában |

## Tükrözött világok {#mirrored-worlds}

A megjelenítő világa jobbkezes, Y-nal felfelé: felülről nézve az az autó, amelynek haladási iránya `atan2(dx, dz)` növekszik, balra kanyarodik. Egy balkezes világú játék – köztük a Forza – tükörképként jön ki: minden jobbra kanyar balra rajzolódik, a pálya és a körök egyaránt.

A körök maguk mondják meg ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)): minden kört néhány méterenként (3 m) végigjárva a pályájának fordulását összehasonlítjuk a külső felfüggesztés összenyomódásával (`suspension.FR` mínusz `suspension.FL`), és felfüggesztés nélkül a kormánnyal (pozitív jobbra minden adapterben). Az a kör, amely összesen π-nél kevesebbet fordul, nem mond semmit; a bizonyíték akkor számít, ha meghaladja a fordulás 2%-át. A körök szavaznak; a döntetlen: „nem tudni”.

Ha a körök ítélete nem egyezik a jelenlegi tengelyfordítással (a **Kamera és jelenet → Világtengely megfordítása** alatt a fordított tengelyek páratlan száma), a **Körök** rész a lista alatt ezt mondja:

- a játék tükrözött, és semmi nincs fordítva: „Ezek a körök jobbra kormányoznak, ahol a pálya balra kanyarodva van rajzolva …” az **X invertálásával**;
- a tengelyek fordítva vannak, de a körök nincsenek tükrözve: „A fordított tengelyek tükrözve rajzolják ezeket a köröket …” a **Tengelyek visszaállítása** gombbal.

Csak a rajzolás változik – a nézetmátrixba hajtott tükrözés; az adatok, az elemzés és minden koordináta, amit az eszközök mutatnak, a játék saját marad. A fordítás a böngészőben marad. Az elemzés ugyanazzal a méréssel nevezi meg a balra vagy jobbra kanyarokat (egy ismeretlen világot tükröztetettnek vesz, ahogy a Forzáét).

## Fejlesztőknek {#for-developers}

Kód: [`src/race/replay.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/replay.ts),
[`src/race/scene.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/scene.ts),
[`src/race/glyph.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/glyph.ts),
[`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx) (`Transport`),
[`src/ui/race/RaceLabels.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceLabels.tsx).

### Mi az autó egy pillanatban {#what-a-car-is-at-a-moment}

A `stateAt` minden csatornát interpolál a kör idejénél lévő két minta között. A lépcsős csatornák (fokozat, zászlók) a legközelebbi mintát veszik. Egy befejezett kör a vonalon parkol.

**Irányszög.** A haladási irányt néhány méterrel egymástól távolabbi pozíciókból kapjuk (mindkét oldalon legalább 2 m, hogy egy rázkódás ne fordítsa el az autót). A test irányszöge csak akkor jön a játék yaw-jából, ha az a haladási iránnyal illeszthető – előjel és eltolás, a 10 m/s-nál gyorsabb mintákon (legalább 20) a körkörös átlaggal –, és csak ha utána egyezik vele (körkörös variancia 0,05 alatt, kb. 18° szórás); különben a test a haladási irányba néz. Így a csúszás látszik (a test és a haladás külön), anélkül hogy egy játék szögkonvencióját meg kellene bízni.

**Kormányzás és oldalak.** Hogy egy pozitív kormányzás melyik irányba fordítja az autót, és hogy a játék jobb oldali kerekei melyik oldalhoz tartoznak, a körből mérjük: a kormányzást az útvonal fordulásával szembeállítva, és azt, melyik oldal felfüggesztése nyomódik össze a kanyarok külső oldalán (felfüggesztési adat nélkül a Forza-játékokat tükrözöttnek vesszük).
