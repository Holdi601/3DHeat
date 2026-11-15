---
title: "Felismerések"
nav_order: 7
has_children: true
lang: "hu"
source: "insights.md"
source_hash: "8232fe145807"
translated: true
outdated: true
---

# Felismerések

A **Felismerések** átnézi a betöltött adatot, és megkeresi, ami kiemelkedik – erős pozíciókat, halálos terepet, spawn-csapdákat, szűk keresztmetszeteket, a társaiknál jóval erősebb játékosokat –, és erősség szerint, a legerősebbel kezdve, bizonyítékkal együtt megmondja. Arra használja, hogy egy perc alatt megtudja, hol nyerték vagy vesztették el a meccset. Ezután összegzést írhat, egyetlen visszajátszás esetén pedig kommentátorként ugrálhat a nagy pillanatokhoz.

Minden a böngészőjében számolódik. Semmi nem hagyja el a gépét, hacsak nem kapcsol be külső MI-t (lásd [Külső MI](#external-ai)).

![Felismerések a tank-demón: 14 megállapítás, erősség szerint rendezve](../assets/img/hu/insights.webp)

A **Felismerések** szakasz a Hőtérkép és a Meccs fül oldalsávjában van. Három füle van: **Megállapítások**, **Összegzés** és **Kommentátor**.

## Megállapítások {#findings}

1. Töltsön be adatot, és nyissa meg a **Felismerések** részt. Nyomja meg a **Felismerések keresése** gombot („Számolás… n%” mutatja a haladást).
2. Olvassa el a listát. Minden megállapításnak van erősségsávja, egy mondata, a bizonyíték minősége (*Erős bizonyíték*, *Jó bizonyíték* vagy *Némi bizonyíték*), az a detektor, amely megtalálta, és – ahol számít – a járműosztály.
3. **Kattintson egy megállapításra**: a megjelenítő alkalmazza a szűrőit, a kamerát odarepíti, az időben odaugrik, és megnyitja a részleteket: a hatást 95%-os intervallumával, a p- és q-értékeket, a megszámolt bizonyítékot, és a **Térfogat itt** gombot, amely [térfogatot](volumes.md) rajzol a hely köré.
4. A **Szűrők visszaállítása** visszateszi a szűrőit. A **JSON másolása** a teljes jelentést másolja.

A számlálás a jelenlegi szűrőket, az elrejtett csoportokat és a kiválasztott meccset használja a teljes időtartományon. Ha utána módosítja a szűrőket, egy megjegyzés ezt jelzi; nyomja meg az **Újraszámolás** gombot.

A lista tetején lévő sorok (például a pénzösszegek) a megállapítások előtt foglalják össze az egész adatot.

![Egy megnyitott megállapítás: a lövések forró zónája, a számai és egy megfelelő részlet a szakirodalomból](../assets/img/hu/insights-finding.webp)

### A detektorok {#the-detectors}

| Detektor | Mit talál | Ehhez kell az adatban |
|---|---|---|
| **Erőpozíciók** | Olyan helyek, ahol a gyilkosság-halál arány jóval jobb, mint a térkép többi része, és *biztonságos terep*, ahol kevesen halnak meg az ott töltött időhöz képest | gyilkosság- és halálesemények |
| **Forró és hideg zónák** | Olyan helyek, ahol egy eseménytípus (lövések, találatok, elfoglalások ...) sokkal gyakrabban vagy ritkábban fordul elő, mint amit az ott töltött idő megjósolna | egy eseményoszlop |
| **Nyílt terep és fedezék** | Halálok nyílt terepen közeli pályageometriával, és lassúság gyors mozgással szemben | halálok; a geometriarészhez 3D-s pálya |
| **Spawnok** | Erős spawnok, spawn-csapdák, biztonságos spawnok, idő az első érintkezésig | idő és személyek |
| **Osztály helyenként** | Egy járműosztály, vagy a játékosok az MI-vel szemben, akik sokkal jobbak vagy rosszabbak egy területen | gyilkosságok plusz egy járműosztály vagy játékos/MI oszlop |
| **Játékosok** | Játékosok, akik sokkal többet vagy kevesebbet ölnek vagy halnak, mint mások ugyanabban az osztályban | személyek és gyilkosságok |
| **Szűk keresztmetszetek és szárnyak** | Szűk keresztmetszetek (sokkal több átkelés, mint a környező terepen) és oldalsó útvonalak (ritkán használtak, de gyilkossághoz vezetnek) | személyek |
| **Érték** | *Költséges terep* és *Nyereséges terep* | [érték-oszlopok](value-weighting.md) |

Azok a detektorok, amelyek nem futhatnak az adatokon, az alján szerepelnek, az okukkal együtt.

### Hogyan rangsorolódnak a megállapítások {#how-findings-are-ranked}

Minden helyet vagy csoportot összevetünk a térkép többi részével (pontos binomiális vagy arányteszttel). A hamis felfedezési arány 5%-on van tartva (Benjamini–Hochberg). A véletlen mintázatnak tűnhet; ez alacsonyan tartja a téves riasztásokat: a látható megállapítások közül várhatóan legfeljebb körülbelül minden huszadik lehet véletlen. A kevés eseményből származó hatások a rangsorolás előtt a „nincs hatás” felé húzódnak. Legfeljebb 60 megállapítás jelenik meg, és minden detektor kap néhány helyet a lista élén.

## Összegzés {#debrief}

Az **Összegzés** fül a megállapításokat rövid szöveggé írja: egy bevezetőt, a legtisztább megállapítást, egyet a taktikáról, egyet az egyensúlyról, a többit detektor szerint csoportosítva, és azt, hány gyengébb bizonyítékon nyugszik. Minden bekezdés számozott gombokat tartalmaz, amelyek a megállapításait mutatják. A **Szöveg másolása** lemásolja.

![A beépített narrátor által írt összegzés](../assets/img/hu/debrief.webp)

A beépített narrátor offline fut, az Ön nyelvén. A fölötte lévő **Lencse** választó (lásd [A tudás-lencse](knowledge.md)) dönti el, melyik szakirodalomra hivatkoznak a bekezdések.

### Külső MI {#external-ai}

Az **MI-beállítások** lehetővé teszi, hogy a választott MI-modell írja meg az összegzést:

| Beállítás | Jelentése |
|---|---|
| **Szolgáltató** | Anthropic (Claude), OpenAI (ChatGPT), OpenRouter, Ollama (helyi), LM Studio (helyi), llama.cpp-kiszolgáló (helyi), vagy bármely OpenAI-kompatibilis végpont |
| **Alap-URL**, **Modell** | A szolgáltató tölti ki; a **Modellek listázása** lekérdezi a kiszolgálót |
| **API-kulcs** | Csak az alap-URL-nek küldjük. Soha nem naplózzuk, és nem mentjük nézetekbe, exportokba vagy `.3dheat` fájlokba. A legtöbb helyi kiszolgálónak nincs rá szüksége. |
| **Kulcs megjegyzése ebben a böngészőben** | Alapértelmezés szerint ki: az oldal bezárásakor a kulcs elfelejtődik |
| **Külső MI használata** | Alapértelmezés szerint ki |
| **Játékosnevek küldése** | Alapértelmezés szerint ki: a játékosok P1, P2 … néven mennek |

Ezután írjon egy opcionális kérdést, és nyomja meg az **Írás MI-vel** gombot. Csak a megállapítások és a számaik mennek ki – az adatai sorai soha. A válasz folyamatosan érkezik; a hivatkozott megállapítások gombokká válnak.

## Kommentátor {#caster}

**Egy meccsre** (ha több van betöltve, válasszon egyet) a **Kommentátor** megtalálja a megnézésre érdemes pillanatokat: első vér, többszörös gyilkosságok, cserék, befejezések, cél-fordulatok, visszatérések, kiemelkedő játékosok, hosszú lövések.

![A kommentátor pillanatai a lövöldözős demo egy körére](../assets/img/hu/caster.webp)

- Kattintson egy pillanatra: a nézet átvált a visszajátszásra, közvetlenül elé ugrik, odarepül és követi a játékost.
- A **Pillanatok lejátszása** mindegyiket a végéig játssza, és továbblép; az **Előző** / **Következő** végigléptet közöttük.
- Külső MI bekapcsolva a **MI-kommentár** a pillanatlistából (típusok, időpontok, nevek vagy álnevek, csapatok, osztályok, távolságok) kommentárt ír.

Személyekre és gyilkosság/halál (vagy elfoglalás) eseményekre van szüksége; egy `other`/`victim` oszlop teszi lehetővé a cseréket és a hosszú lövéseket.

## A tudás-lencse {#knowledge-lens}

Egy megállapítás olvasható egy **lencsén** keresztül, amely elismert tudásra épül: hadtudomány, légi és tengeri harc, városi műveletek, játéktervezés és e-sport (vagy *Auto*, amelyet az adatban szereplő egységek alapján választ). Egy megnyitott megállapítás ekkor megmutatja a legközelebbi **doktrína- és szakirodalmi** bejegyzést és egy **történelmi párhuzamot**, hivatkozásokkal, a **Lencse mérőszámai** pedig az adatra számítanak mértékeket ebből a szakirodalomból (Lanchester-illesztések, cserearányok, erőarányok, tűzmezők, kulcsfontosságú terep, cserék, kezdeményezés). Az összegzés és az MI-kérdés is tartalmazza őket. Minden erről: [A tudás-lencse](knowledge.md).

A lencse mérőszámai azt is mérik, hogyan viselkednek a játékosok tömegként és csoportként – összehangolódás és keringés, útvonalterelés, sávok és nyomvonalak, zsúfoltság, vezetők és követők, lemaradók, a törésponti pont veszteségek mellett, a kockázat egy elvesztett élet után, sorozatok, vásárlási egyetértés és a bejövő tűzre adott válasz –, mindegyik a saját null-modelljével szemben: [Kollektív viselkedés](collective-behaviour.md).

## Az adatok, amelyek a felismeréseket működtetik {#data-that-makes-insights-work}

- pozíciók **idővel**, egy **személy** és egy **csapat** oszloppal;
- egy **esemény** oszlop gyilkosságokkal és halálokkal (`kill`, `death`), és másokkal (`hit`, `fire`, `capture` ...);
- egy **másik fél** oszlop (`other`, `victim`) cserékhez és irányokhoz;
- egy **jármű** vagy **típus** oszlop az osztályokhoz; egy `ai` oszlop a játékosok és az MI megkülönböztetéséhez;
- egy **munkamenet** / **meccs** / **kör** oszlop, ha több meccs van.

A [demóadatok](demo-data.md) mindegyiket tartalmazzák.
