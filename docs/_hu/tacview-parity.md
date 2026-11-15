---
title: "Tacview-egyenértékűség"
parent: "Meccs-visszajátszás"
grand_parent: "Visszajátszás"
nav_order: 1
lang: "hu"
source: "tacview-parity.md"
source_hash: "4275603255c2"
translated: true
outdated: false
---

# Tacview-egyenértékűség

A Tacview népszerű program repülési felvételek nézegetésére. Ha ismered, ez az oldal megmutatja, hol található minden eszköze a 3DHeat-ben.

Felsorolja a Tacview 1.9 minden funkcióját (a kézikönyvét, a felhasználói felület szövegtábláját és az ACMI 2.2 fájlformátumot), és azt, hogy hol áll vele szemben a 3DHeat [meccs-visszajátszása](match-replay.md). A cél: amit a Tacview megtehet egy visszajátszással és annak adataival, azt a 3DHeat is meg tudja tenni.

**Státusz:**
- **kész**: már megvan a 3DHeat-ben.
- **új**: a Tacview egy funkciójának megfelelőjeként készült.
- **még nincs**: érvényes, de nincs megépítve.
- **nem releváns**: itt nem alkalmazható; az ok mellette van.

A funkciók helye: a **Meccs** fül, a **Figurás visszajátszás** (vagy a **Figurás átfedés** a **Hőtérkép** fülön), az oldalsáv szakaszaiban: **Visszajátszás**, **Egységek**, **Események**, **Könyvjelzők**, **Taktikai megjelenítés**, **Statisztika**, **Időeltolás és vágás**, **Térkép és pozíció**, **Hang és videó** és **Feliratok**. Lásd: [Meccs-visszajátszás](match-replay.md).

## Kamerák {#cameras}

| Tacview | 3DHeat | Státusz |
|---|---|---|
| Pilótafülke-nézet (F5), a horizont dől a géppel | **Pilótafülke**: az egységen kívül, a hozzárendelt állásában, ahogy a mozgásmodell adja. Az egység saját figuráját levágja. Húzd a körbenézéshez; az **Újra előre nézés** visszaállítja. | új |
| HUD a pilótafülke-nézetben (IAS/CAS/TAS választás) | **HUD** (H): a tényleges nézet horizontja és emelkedési skálája, repülési pálya jelölő, iránysáv, IAS, magasság, TAS, Mach, G, támadási szög, függőleges sebesség, AGL | új |
| 3D pilótafülke-műszerek, a pilóta fejének követése (PilotHead*), TrackIR | Nincsenek pilótafülke-modellek; a fejszögek az egység kártyájának **Nyers** nézetében látszanak | nem releváns (nincsenek pilótafülke-modellek; a fejkövető hardver élő repüléshez való) |
| Külső nézet (F6): keringés a fő objektum körül | **Üldözés** (az egységgel együtt fordul) és **Keringés** (megtartja a saját irányát) | kész |
| Légharc-kamera, „Nézz a célpontra” (padlock) | **Padlock**: a pilótafülkéből, a célponton tartva | új |
| Légharc-kamera, „Középre” / „Előre nézés” | **Célpont**: az egység mögött, a célponttól induló vonalon, a célpontra nézve. A **Rögzített** 0-s azimuton elölről néz előre. | új |
| A fő és a másodlagos objektum cseréje | **Csere** a célpont mellett | új |
| Műholdnézet (F7), ortografikus felülnézet | **Műhold**: egyenesen lefelé az egységre, észak felül; húzással forgatható. A 2D térkép az ortografikus alaprajz. | új |
| Szabad kamera (F8), W/A/S/D, E/C | A szabad repülő kamera (W/A/S/D, Space/Q, Shift/Alt) | kész |
| Kiegészítő Head-On kamera; az objektumhoz rögzített külső kamera | **Rögzített**: egy hely az egység körül, amely vele együtt fordul és dől; húzással mozgatható (mögötte, egy szárnyvégnél, szemből) | új |
| Kiegészítő Lock Camera (a pozíció befagyasztása) | Követés leállítása (Esc): a kamera ott marad, ahol volt | kész |
| Stratégiai nézet (kicsinyítés az egész Földre) | [Világháttér](world-backdrop.md) és a 2D térkép egész-felvétel nézete | kész |
| Látószög-beállítás | **Kamera és jelenet** látószöge | kész |
| Nézetek váltása billentyűkkel | **V** következő nézet, **Shift+V** vissza | új |

## 3D nézet és megjelenítési beállítások {#d-view-and-display-options}

| Tacview | 3DHeat | Státusz |
|---|---|---|
| Szalagnyomvonalak, hosszúság-csúszka | Nyomvonalak (másodperc) a Csapat-nézegetőben | kész |
| Előrejelző nyomvonal (előre vezető útvonal) | **Előre vezető útvonal**: hová megy valójában az egység a következő másodpercekben | új |
| Objektum-magasságvonalak / falak | **Függőleges vonalak** | kész (vonalak; falak nincsenek megépítve) |
| Kijelölt objektum vektorai: irány (pontozott), pálya (folytonos), emelő | **Sebességvektorok** (pálya és sebesség ennyi másodpercre, tippel) és **Orr- és emelőerővonalak** (az orr szaggatott, az emelő rövid és sötét) | új |
| Pilóta nézési iránya | **A pilóta nézési iránya**: szaggatott cián vonal a PilotHeadYaw/PilotHeadPitch mentén (vagy egy HeadYaw, ViewYaw vagy LookYaw oszlop mentén), az egység tengelyeihez képest | új |
| SAM/AAA halálos hatótávolság-kupolák (EngagementRange, VerticalEngagementRange, EngagementMode, a „2” párok) | **Harci zónák**: kupolák, a függőleges hatótávolság eltérésekor tojásdad alakban; kikapcsolva, amíg az EngagementMode 0 | új |
| Radar-befogások (LockedTarget..9) feliratokkal | **Befogások**: piros vonalak minden befogott objektumhoz; szaggatott borostyán a FocusedTarget felé; a LockedTargetAzimuth/Elevation/Range mentén, ahol nincs név megadva. **Befogási feliratok**: a célpont neve és távolsága minden befogási vonalon | új |
| Radarkúp (RadarMode, Azimuth, Elevation, Roll, Range, nyalábszélességek) és távolságkapu | **Radarkúpok**: a nyaláb pereme és közepes köre az azimut, a magasságszög és a dőlés szerint forgatva az egységhez képest; a távolságkapu két sárga perem. Nyalábszélesség nélkül csak a nyaláb tengelye. | új |
| Két kijelölt objektum közötti látóvonal (zöld / piros pontozott, ha terep takar) | A mért pár vonala pirosra és szaggatottra vált, ha a terep van közöttük | új |
| Távoli objektumok automatikus nagyítása | A legkisebb figura a képernyőn (pixel) | kész |
| Szélesség-/hosszúsági rács | **Térkép és pozíció → Rács**: szélességi és hosszúsági vonalak a kamera alatti talajon, a magasságnak megfelelő kerek távolsággal (10°-tól 1'-ig), feliratozva; vagy az UTM-zóna **MGRS** kilométerrácsa a zónával és a 100 km-es négyzettel. A 2D térkép saját rácsa, mint eddig | új |
| Bullseye-gyűrűk | Gyűrűk minden csapat bullseye-je körül a 2D térképen | új (csak 2D) |
| Siklópálya-átfedés | **Siklópályák**: 3°-os pályák, a ±0,7°-os teljes skála szélével, a felvétel közelében lévő kifutópályák mindkét végére, az OurAirports felmért küszöbértékeiből és magasságaiból (egyszer letöltve, offline tárolva), minden tengeri mérföldnél egy jelöléssel, repülőtér és kifutópálya szerinti névvel | új |
| Magasságkorlátozások (plafon- / padlóriasztás) | **Magasságkorlátozás**: egy padló és egy plafon; a tartományon kívüli egységek feliratai pirosra váltanak, és minden átlépés (a padló alá, a plafon fölé, vissza a tartományba) listába kerül – kattintásra odaugrik, és követi az egységet | új |
| A megsemmisült objektumok szürkék, 15 perc után eltávolítva | Az életek a pályájukkal együtt végződnek; a halott egység elhalványul az egységlistában | kész |
| Látható / letiltott tulajdonságok | A **Nyers** nézetben látszanak; semmit nem rejtenek el | még nincs |
| Kormány-/gázpedál-/pedálállások megjelenítése | Gázállás és motorértékek mezőkben; a vezérlőbemenetek a **Nyers** nézetben | kész (értékként) |
| Megjegyzések feliratként | **Üzenetek feliratként** (Feliratok): az ACMI Message és Comment események, valamint bármely játék csevegése (Chat, Say vagy Radio események, vagy egy csevegőoszlop), a nézet alján, azzal együtt, aki mondta, hat másodpercig | új |
| Dátum és UTC-idő megjelenítése | Idővonal-óra UTC-vel, ahol a felvételnek van referenciaideje | kész |
| Egér-pozíció szélesség/hosszúság, MGRS, bullseye | A kiválasztó kártya (egy pontra kattintva) fokban, percben és másodpercben adja meg a szélességet/hosszúságot, és az MGRS-t a világ méterei mellett; a bullseye egységenként (mező) | új |
| Egyedi logó | Nincs megépítve | nem releváns (márkajelzés) |
| 3D-modellek, ismeretlen esetén a legközelebbi | A saját figuragyűjtemény, a legközelebbi megfelelő, valódi méretben | kész |
| Több harc (vonalak minden pár között) | **Harci vonalak**: a hatókörben lévő minden egységtől a beállított távolságon belüli minden ellenfélhez (1–200 km), mindegyiken a távolsággal, a legközelebbi 60 párra korlátozva; a mért pár, mint eddig | új |

## Feliratok {#labels}

| Tacview | 3DHeat | Státusz |
|---|---|---|
| Feliratok be/ki, külön a kijelölt és a nem kijelölt objektumokra | **Feliratok** szabályokkal a **Kijelöltek**, **Légi járművek**, **Szárazföld**, **Hajók**, **Fegyverek** és **MI** szerint: látszanak-e, saját értékekkel, prioritással | új |
| Felirat-mezők: név, hívójel, pilóta, sebességek (TAS/CAS/IAS/Mach/GS), magasságok (ASL/AGL), VS, AOA, AOS, G (függőleges, oldalirányú, hosszirányú), fordulási sebesség és sugár, energia, üzemanyag-súly/térfogat/áramlás, irány/pálya, dőlés/billenés, pulzus | A `fields.ts` minden értéke: ugyanaz a lista; ahol nincs rögzítve, ott kiszámolva (a becslések ~ jellel jelölve). A dőlési sebesség és az SpO2 csak a **Nyers** nézeten át érhető el. | kész |
| Bullseye-pozíció a feliratokon | **Bullseye (irányszög / távolság)** mező | új |
| ILS-eltérések, megrepült távolság | Nyers értékek; a megrepült távolság a statisztikában | kész (részben) |
| Nem kijelölt telemetria szétválasztása | **Feliratok szétválasztása**, minden szabály prioritása szerint sorrendben | kész / új |
| Minden földi objektum, vagy csak a fenyegetések feliratozása | A Szárazföld és az MI szabályok | új |
| Felirat-méretezés | **Feliratméret** (60–250%) | új |
| Metrikus / angolszász mértékegységek | Metrikus / angolszász | kész (két beállítás, nem nyolc) |

## Objektum-adatok és telemetria {#object-info-and-telemetry}

| Tacview | 3DHeat | Státusz |
|---|---|---|
| Elsődleges és másodlagos kijelölés | Kattintásra követ és kijelöl; két egységre shift-kattintással mér; **Célpont** választó | kész / új |
| Távolság / irányszög / aspektus / záródás két objektum között | A mért pár BRAA-vonala; távolság, irányszög, aspektus és záródás mezők a követett egységről | kész |
| Relatív irányszög, látóvonal-szögsebesség | **Relatív irányszög** (a követett egység orrától, B/J) és **Látóvonal szögsebessége** (°/s) mezők | új |
| Telemetriai ablakok | Az egység kártyája és a lebegő kártya | kész |
| Nyers telemetria (minden rögzített tulajdonság, az ismeretlenek is) | **Nyers** az egység kártyáján: minden oszlop az egység sorában, ahogy le van írva | új |
| Aktív objektumok listája | **Egységek**: játékosok, MI, repülő fegyverek; az élők fényesen | kész |
| Felvétel tulajdonságai ablak (cím, szerző, eligazítás...) | A RecordingInfo oszlopként megtartva; a Nyers nézetben látszik | kész (nincs ablak) |
| Pozícióformátumok DMS/MGRS, mágneses észak | **Pozíció (szélesség / hosszúság)** DMS-ben és **MGRS** mezők; egy **Mágneses irány** mező; a **Mágneses irányok** a fejirányt, a pályát és az irányszöget mágneses (°M) értékben írja, és egy iránytűt mutat mindkét északkal és az eltéréssel: a Világ Mágneses Modell 2025 (közkincs együtthatók), itt az egység helyén és dátumán számítva | új |

## Diagramok {#charts}

| Tacview | 3DHeat | Státusz |
|---|---|---|
| Egy objektum diagramja, legfeljebb 4 érték | **Időben** (és a Visszajátszás alatti diagram) | kész |
| Legfeljebb 4 objektum egyszerre | **Összehasonlítás**: egy érték legfeljebb 8 egységről, egy skálán | új |
| Érték az értékkel szemben (energia-manőverezhetőség jellegű) | **Érték – érték**: fordulási sebesség a sebesség vagy bármely más pár ellen; minden egység egy vonal, az aktuális pontja megjelölve | új |
| X tengely idő szerint; nagyítás; idő tekerése a diagramról | Az egérgörgő időben nagyít, a dupla kattintás visszaállítja, a kattintás az adott pillanatra visz | új |
| X tengely légi vagy földi távolság szerint | **Idő / Légi távolság / Földi távolság** az idő- és összehasonlító diagramokon; a nagyítás és a kattintásos ugrás ugyanúgy működik | új |
| Előre megadott diagramok (energia, gyorsulás...) | Bármely érték választható (az energiamagasság és annak változási sebessége is érték) | kész |

## Statisztika, repülési napló, események {#statistics-flight-log-events}

| Tacview | 3DHeat | Státusz |
|---|---|---|
| Repülési napló: felszállt, leszállt, tüzelt, eltalálták, megsemmisítette, elhagyta a területet | **Statisztika** egységenként: életek, ölések, halálok, lövések, találatok, találati arány, felszállások, leszállások, levegőben töltött idő, max. G (és min.), max. sebesség, magasság és Mach, távolság. A felszállások a TakenOff/Landed eseményekből, az OnGround-ból és az AGL-ből jönnek, vagy ~ jellel jelölt becslésből. | új |
| Eredménytábla és küldetésjelentés kiegészítők | Csapatonkénti összesítés és a legtöbb ölés; a meccsösszefoglaló saját eredménytáblája | új / kész |
| Repülési napló exportálása XML/CSV | A statisztika **CSV exportálása**, és az események a listán látszó formában | új (csak CSV) |
| Telemetria exportálása CSV-be, megadott gyakorisággal | **A kijelölt egység telemetriája**: minden érték, másodpercenként 1–20 | új |
| Eseménynapló, dupla kattintás odaugrik és kijelöl | **Események** lista, típus és egység szerint szűrve; kattintásra odarepül | kész |
| Előző / következő esemény (Ctrl+←/→) | **Page Up / Page Down** | új |
| Szünet eseménynél | **Szünet eseménynél** | új |
| Idővonal-jelölők (kilövések, találatok, megsemmisítések; a kijelölt objektumé kékkel, a könyvjelzők pirossal) | Ölések és halálok sűrűségsávként; a követett egységé kékkel, a könyvjelzők pirossal; kattintás odaugrik | új |
| Esemény eltávolítása, ölés-eltávolítás | Nincs megépítve | nem releváns (az események a felvételé; a szűrők elrejtik őket) |

## Könyvjelzők {#bookmarks}

| Tacview | 3DHeat | Státusz |
|---|---|---|
| Könyvjelző beszúrása a kijelöléssel és a nézőponttal | **Könyvjelző hozzáadása** (B): a pillanat, a szabad kamera vagy a követett egység a nézetével, távolsággal és célponttal; névvel; ebben a böngészőben, felvételenként tárolva | új |
| Könyvjelző törlése | × a listában | új |
| Könyvjelzők az idővonalon és a naplókban | Piros jelek; a lista | új |
| Event=Bookmark az ACMI-ban | A felvétel jelölései között, az ölésekkel, halálokkal és üzenetekkel együtt | új |
| Másolás/beillesztés gyorsbillentyű (nézet megosztása) | **Exportálás / Importálás** a könyvjelzőket fájlként; a C a kamera állását másolja | új |

## Lejátszás {#playback}

| Tacview | 3DHeat | Státusz |
|---|---|---|
| Lejátszás/szünet, az elejére, sebesség, idővonal-tekerés | Idővonal | kész |
| Képkockánként | **,** és **.** egy másodperccel vissza, illetve előre (Shift: tíz) | új |
| Visszafelé lejátszás | **◀** az idővonalon, **J** (**L** előre; ugyanaz a billentyű újra megállítja): a végétől az eleje felé játszik a kiválasztott sebességgel, ciklikusan vagy az elején megállva | új |
| Időugrás párbeszédablak | Az idővonal és az eseménylista | kész |
| Egy objektum időeltolása (szellem) | **Időeltolás és vágás**: egy egység repülését vagy egy egész felvételt ennyi másodperccel eltol. A **Felvételek összeigazítása** több felvételt egyszerre az elejére mozgat, és egyszerre játssza le őket (két különböző napi repülés egymás mellett). A felvétel újraépül, így a nyomvonalak, események, diagramok és statisztikák követik | új |
| Vágás előtte/utána | **Ettől a pillanattól / Eddig a pillanatig / Vágás erre a szakaszra** (a visszavonás megtartja az eltolásokat), majd **CSV exportálása** (visszatölthető a 3DHeat-be) vagy **ACMI exportálása** (Tacview 2.2 szöveg, a Földön elhelyezett felvételhez) | új |

## Terep és térkép {#terrain-and-map}

| Tacview | 3DHeat | Státusz |
|---|---|---|
| Valódi terep, egyéni magasság és textúrák | Pályák (a játék saját térképe 3D-modellként), világháttér-csempék | kész |
| Sík / üres / nagy kontrasztú terepmódok | [Pályamegjelenés](level-appearance.md): a talaj domborzata, felülete és az építmények láthatók vagy nem | kész (nem ugyanazok a módok) |
| 2D taktikai térkép (a Tacview-nak nincs ilyen: műholdnézete van) | **2D térkép**: sarok- vagy teljes nézet; jelek fajta és csapat szerint (kitöltött játékosok, körvonalas MI), az irányukba fordítva; nyomvonalak, nevek, léptéksáv, hatókörgyűrűk a követett egység körül, bullseye-gyűrűk, a 3D kamera helye, a legutóbbi halálok; húzással, görgővel, kattintásra követés (M) | új |
| Statikus objektumok (repülőterek, kifutópályák, útpontok, területek, KML) | A felmért kifutópályák (OurAirports) a világháttérben és siklópályáik; a GPX-útpontok és a KML-jelölők állóobjektumként töltődnek be; a [Taktikai tábla](tactics-board.md) rajzolja a területeket és útvonalakat | új |

## Import, export, felvétel {#import-export-recording}

| Tacview | 3DHeat | Státusz |
|---|---|---|
| ACMI szöveg és zip | [Tacview ACMI](tacview-acmi.md) | kész |
| GPX, KML, CSV, NMEA, IGC, FIT, DIS... | **GPX** (sávok, útvonalak, útpontok; Garmin-pulzus, kadencia, teljesítmény, hőmérséklet), **KML/KMZ** (gx:Track, LineString, Point), **NMEA 0183** (minden beszélő RMC és GGA mondatai, ellenőrzött ellenőrző összegekkel, éjfélen átívelve), **IGC** (B rekordok, dátum, pilóta és vitorlázórepülő), **FIT** (rekord üzenetek, tömörített időbélyegek). Mindegyik szélesség és hosszúság szerint kerül a síkra a sávok közepén, így a világháttér egymásra illeszkedik. A fejirány, a dőlés és a sebesség a fájlból jön, vagy pontról pontra számolva. CSV és Parquet, mint eddig | új (a DIS nem releváns: élő hálózati protokoll) |
| Natív felvevők (DCS, BMS, IL-2, MSFS...) | A 3DHeat saját konverterei (War Thunder, CS2, Squad, Arma és mások) | kész (saját) |
| Valós idejű telemetria TCP-n, ADS-B | Nincs megépítve | nem releváns (a meccs után visszajátszva) |
| Szinkronizált hang/videó | **Hang és videó**: egy helyi fájl lejátszik, szünetel, ugrik és sebességet vált az idővonallal, egy megadott kezdettől (**Kezdés most**, ±0,1 s); videó egy átméretezhető panelben a nézet fölött, vagy kép a képben. A fájl a böngészőben marad | új |
| Videoexport | [Kameraútvonal és videó](camera-path-and-video.md) | kész |

## Egyéb {#other}

| Tacview | 3DHeat | Státusz |
|---|---|---|
| Lua-kiegészítők | Nincs megépítve | nem releváns (nyílt forrású: magát a nézegetőt lehet módosítani) |
| Online megbeszélés (közös munkamenet) | Nincs megépítve | nem releváns (a Tacview-é egy hosztolt munkamenet, amely mindenkit egy lejátszófejen tart. A 3DHeat-nek nincs szervere, a felvételek a nézegető gépén maradnak, és még a peer-to-peer kapcsolathoz is kellene jelzőszerver. A megbeszélés fájlokban oszlik meg: a levágott felvétel (ACMI vagy CSV exportálva) és a könyvjelzők fájlja, amelyek ugyanazokon a pillanatokon és nézeteken nyílnak meg) |
| Oktatói távirányítás | Nincs megépítve | nem releváns (futó szimulátort irányít) |
| Objektumszerkesztés (objektumok hozzáadása, szerkesztése, törlése) | [Taktikai tábla](tactics-board.md) a tervezett objektumokhoz; a felvételek csak olvashatók | nem releváns |
| Nyelvek | 40 nyelv | kész |
| Felvételek hitelesítése | Nincs megépítve | nem releváns |

## Fejlesztőknek: ACMI 2.2 tulajdonságok {#for-developers-acmi-22-properties}

A `data/acmi.ts` olvassa: a számtulajdonságok számoszlopokká, a szövegesek kategóriaoszlopokká válnak. Mindegyik a **Nyers** alatt látszik az egység kártyáján. Ezeket célzottan olvassuk:

| Tulajdonságok | Felhasználás |
|---|---|
| T (mind a négy alak), Name, Type, Pilot, Group, Country, Coalition, Color, CallSign | Pozíció, hozzárendelés, figura, egységnév, csapat |
| IAS, CAS, TAS, Mach, AOA, AOS, AGL, HDG, HDM, OnGround | Mezők, diagramok, HUD, felszállás- és leszállásfelismerés |
| VerticalGForce, LongitudinalGForce, LateralGForce | G-mezők |
| Throttle(2), Afterburner, EngineRPM(2), NR, AirBrakes, Flaps, LandingGear, Tailhook | Mezők |
| FuelWeight..9, FuelVolume..9, FuelFlowWeight..8 | Üzemanyag-mezők, a tartályokra összegezve |
| RadarMode, RadarAzimuth, RadarElevation, RadarRoll, RadarRange, RadarHorizontalBeamwidth, RadarVerticalBeamwidth, RadarRangeGateAzimuth/Elevation/Min/Max/HorizontalBeamwidth/VerticalBeamwidth | Radarkúpok és távolságkapu |
| LockedTarget..9, LockedTargetMode, LockedTargetAzimuth/Elevation/Range, FocusedTarget | Befogási vonalak |
| EngagementMode(2), EngagementRange(2), VerticalEngagementRange(2) | Harci kupolák |
| QNH, AltimeterSetting, WindSpeed, WindDirection, HeartRate | Mezők |
| Health | Mező |
| Események: Destroyed, TakenOff, Landed, Bookmark, Message, Comment, LeftArea, Timeout | Eseménylista, statisztika (halálok, felszállások, leszállások), könyvjelzők; a Message és a Comment feliratként |
| PilotHeadYaw, PilotHeadPitch | A pilóta nézési iránya |
| Típuscímke Bullseye (Navaid+Static+Bullseye) | Bullseye-mező és térkép-gyűrűk |
| Minden más (PilotHeadRoll, vezérlők, felületek, ILS-eltérések, SpO2, ENL, Label, Debug, Importance, Slot, Visible, Disabled, Radius, méretek...) | A **Nyers** alatt látszik, ahogy le van írva |

A radar- és befogási szögeket az egység saját tengelyeihez mérjük: az azimut jobbra, a magasságszög felfelé, a dőlés pedig a jobb szárny lefelé. Az ACMI-leírás szerint ezek a géphez képest értendők, de nem mondja meg, melyik irány a pozitív. Ez az olvasat a transzformációját követi (legyezés az óramutató járásával, billenés felfelé, dőlés jobbra).
