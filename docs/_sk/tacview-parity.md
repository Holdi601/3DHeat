---
title: "Parita s Tacview"
parent: "Prehranie zápasu"
grand_parent: "Prehrávanie"
nav_order: 1
lang: "sk"
source: "tacview-parity.md"
source_hash: "4275603255c2"
translated: true
outdated: false
---

# Parita s Tacview

Tacview je populárny program na sledovanie záznamov letov. Ak ho poznáte, táto stránka ukazuje, kde je v 3DHeat každý z jeho nástrojov.

Uvádza každú funkciu Tacview 1.9 (jeho príručku, jeho tabuľku textov používateľského rozhrania a formát súboru ACMI 2.2) a to, kde je [prehrávanie zápasu](match-replay.md) v 3DHeat voči nej. Cieľ: to, čo Tacview dokáže pre záznam a jeho dáta, dokáže aj 3DHeat.

**Stav:**
- **hotovo**: už je v 3DHeat.
- **nové**: postavené tak, aby zodpovedali funkcii Tacview.
- **ešte nie**: platí, nie je postavené.
- **n/a**: tu neplatí, s dôvodom.

Kde nájsť funkcie: karta **Zápas**, **Prehrávanie figúrok** (alebo **Prekrytie figúrok** na karte Heatmapa), v sekciách bočného panela **Prehrávanie**, **Jednotky**, **Udalosti**, **Záložky**, **Taktické zobrazenie**, **Štatistiky**, **Časový posun a orezanie**, **Mapa a poloha**, **Zvuk a video** a **Popisy**. Pozri [Prehranie zápasu](match-replay.md).

## Kamery {#cameras}

| Tacview | 3DHeat | Stav |
|---|---|---|
| Pohľad z kokpitu (F5), horizont sa otáča s lietadlom | **Kokpit**: von z jednotky podľa jej polohy, ako to má model pohybu. Vlastný model jednotky je odrezaný. Ťahajte, aby ste sa rozzerali; **Znova pozerať dopredu** obnoví. | nové |
| HUD v pohľade z kokpitu (voľba IAS/CAS/TAS) | **Head-up displej** (H): horizont a rebrík sklonu skutočného pohľadu, značka dráhy letu, páska kurzu, IAS, výška, TAS, Mach, G, uhol náklonu, vertikálna rýchlosť, AGL | nové |
| 3D prístroje v kokpite, sledovanie hlavy pilota (PilotHead*), TrackIR | Žiadne modely kokpitu; uhly hlavy sa ukazujú v pohľade **Surové** na karte jednotky | n/a (žiadne modely kokpitu; sledovanie hlavy je hardvér pre živé lietanie) |
| Vonkajší pohľad (F6): obiehanie hlavného objektu | **Zozadu** (otáča sa s jednotkou) a **Orbita** (drží svoj smer) | hotovo |
| Kamera v súbojovom lietaní, „Pozri na cieľ“ (padlock) | **Padlock**: z kokpitu, držaný na cieli | nové |
| Kamera v súbojovom lietaní, „Vycentrované“ / „Pozri dopredu“ | **Cieľ**: za jednotkou na priamke od cieľa, pozerá za ňu na cieľ. **Pevná** pri azimute 0 pozerá dopredu spredu. | nové |
| Prehodiť hlavný a vedľajší objekt | **Vymeniť** vedľa cieľa | nové |
| Satelitný pohľad (F7), ortografický pohľad zhora | **Satelit**: priamo nadol na jednotku, sever hore; ťahaním sa otáča. 2D mapa je ortografický pôdorys. | nové |
| Voľná kamera (F8), W/A/S/D, E/C | Voľne lietajúca kamera (W/A/S/D, Medzera/Q, Shift/Alt) | hotovo |
| Doplnok Head-On kamera; vonkajšia kamera pripevnená k objektu | **Pevná**: miesto okolo jednotky, ktoré sa s ňou otáča a prevaľuje; ťahaním sa presúva (zozadu, na konci krídla, spredu) | nové |
| Doplnok Lock Camera (zamrznúť polohu) | Prestať sledovať (Esc): kamera zostane, kde bola | hotovo |
| Strategický pohľad (oddialenie na celú Zem) | [Pozadie sveta](world-backdrop.md) a rámec celého záznamu na 2D mape | hotovo |
| Nastavenie zorného poľa | **Zorné pole** na paneli Kamera a scéna | hotovo |
| Prepínanie pohľadov klávesmi | **V** ďalší pohľad, **Shift+V** späť | nové |

## Možnosti 3D pohľadu a zobrazenia {#d-view-and-display-options}

| Tacview | 3DHeat | Stav |
|---|---|---|
| Stopy ako pásy, posuvník dĺžky | Stopy (sekundy) v Teplo tímov | hotovo |
| Predvídacia stopa (dráha vpred) | **Dráha vpred**: kam jednotka naozaj pôjde v najbližších sekundách | nové |
| Čiary výšky objektu / steny | **Zvislé čiary** | hotovo (čiary; steny nie sú postavené) |
| Vektory vybraného objektu: kurz (bodkovaný), dráha (plná), vztlak | **Vektory rýchlosti** (dráha a rýchlosť toľko sekúnd, so špičkou) a **Čiary nosa a vztlaku** (nos prerušovaný, vztlak krátky a tmavý) | nové |
| Smer pohľadu pilota | **Smer pohľadu pilota**: prerušovaná azúrová čiara pozdĺž PilotHeadYaw/PilotHeadPitch (alebo stĺpca HeadYaw, ViewYaw alebo LookYaw) oproti osám jednotky | nové |
| Kupoly smrteľného dosahu SAM/AAA (EngagementRange, VerticalEngagementRange, EngagementMode, dvojčatá „2“) | **Zóny nasadenia**: kupoly, ovoid tam, kde sa vertikálny dosah líši, vypnuté, keď je EngagementMode 0 | nové |
| Radarové zamknutia (LockedTarget..9) s popismi | **Zamknutia**: červené čiary ku každému zamknutému objektu; prerušovaná jantárová k FocusedTarget; pozdĺž LockedTargetAzimuth/Elevation/Range tam, kde nie je pomenovaný žiadny objekt. **Popisy zamknutia**: meno a vzdialenosť cieľa na každej čiare zamknutia | nové |
| Radarový kužeľ (RadarMode, Azimuth, Elevation, Roll, Range, šírky lúča) a brána dosahu | **Kužele radaru**: obrys a stredný prstenec lúča otočeného azimutom, elevačným uhlom a náklonom voči jednotke; brána dosahu ako dva žlté obrysy. Bez šírok lúča len os lúča. | nové |
| Čiara pohľadu medzi dvoma vybranými objektmi (zelená / červená bodkovaná, keď terén blokuje) | Čiara meraného páru sa sčervená a je prerušovaná, keď je medzi nimi level | nové |
| Automatické zväčšovanie vzdialených objektov | Najmenšia postava na obrazovke (pixely) | hotovo |
| Mriežka zemepisnej šírky a dĺžky | **Mapa a poloha → Mriežka**: čiary šírky a dĺžky na zemi pod kamerou, v okrúhlom rozstupe podľa výšky (10° až 1'), označené; alebo **kilometrová mriežka MGRS** zóny UTM, so zónou a štvorcom 100 km. Vlastná mriežka 2D mapy ako predtým. | nové |
| Prstence bullseye | Prstence okolo bullseye každého tímu na 2D mape | nové (len 2D) |
| Prekrytie zostupovej roviny | **Zostupové roviny**: dráhy 3° s okrajmi plnej mierky ±0,7° na oboch koncoch každej dráhy blízko záznamu, z zameraných prahov a výšok OurAirports (stiahnuté raz, uložené offline), značka na každej námornej míle, pomenované podľa letiska a dráhy | nové |
| Výškové obmedzenia (poplach stropu/podlahy) | **Výškové obmedzenie**: podlaha a strop; popisy jednotiek mimo nich sčervenajú a každé prekročenie (pod podlahou, nad stropom, späť dnu) je v zozname - kliknutie tam ide a sleduje jednotku | nové |
| Zničené objekty šedé, odstránené po 15 min | Životy končia s ich stopou; mŕtva jednotka je v zozname jednotiek stlmená | hotovo |
| Viditeľné / vypnuté vlastnosti | Zobrazené v **Surové**; nič nimi nie je skryté | ešte nie |
| Zobrazenie polôh páky/plynu/pedálov | Hodnoty plynu a motora v poliach; vstupy ovládania v **Surové** | hotovo (ako hodnoty) |
| Komentáre ako titulky | **Správy ako titulky** (Popisy): udalosti ACMI Message a Comment a chat z ľubovoľnej hry (udalosti Chat, Say alebo Radio, alebo stĺpec chatu), dole na zobrazení s tým, kto povedal, šesť sekúnd | nové |
| Zobrazenie dátumu a času UTC | Hodiny na časovej osi s UTC, keď má záznam referenčný čas | hotovo |
| Poloha myši šírka/dĺžka, MGRS, bullseye | Karta výberu (kliknutie na bod) dáva zemepisnú šírku a dĺžku v stupňoch, minútach a sekundách a MGRS vedľa svetových metrov; bullseye pre každú jednotku (pole) | nové |
| Vlastné logo | Nie je postavené | n/a (značka) |
| 3D modely, pri neznámom najbližší | Vlastný katalóg postáv, najbližší náprotivok, skutočná veľkosť | hotovo |
| Viacero nasadení (čiary medzi všetkými dvojicami) | **Čiary stretov**: od každej jednotky v rozsahu ku každému súperovi v nastavenom dosahu (1-200 km), každá s dosahom, najbližších 60 dvojíc; meraný pár ako predtým | nové |

## Popisy {#labels}

| Tacview | 3DHeat | Stav |
|---|---|---|
| Popisy zapnuté/vypnuté, osobitne pre vybrané a nevybrané objekty | **Popisy** s pravidlami pre **Vybrané**, **Lietadlá**, **Zem**, **Lode**, **Zbrane** a **AI**: zobrazené alebo nie, vlastné hodnoty, priorita | nové |
| Polia popisov: meno, volací znak, pilot, rýchlosti (TAS/CAS/IAS/Mach/GS), výšky (ASL/AGL), VS, AOA, AOS, G (vertikálne, bočné, pozdĺžne), rýchlosť a polomer zákruty, energia, hmotnosť/objem/prietok paliva, kurz/dráha, náklon/sklon, srdcový tep | Každá hodnota `fields.ts`: ten istý zoznam, dopočítaný tam, kde sa nezaznamenal (odhady označené ~). Rýchlosť náklonu a SpO2 len cez Surové. | hotovo |
| Poloha bullseye v popisoch | Pole **Bullseye (azimut / vzdialenosť)** | nové |
| Odchýlky ILS, prelietaná vzdialenosť | Surové hodnoty; prelietaná vzdialenosť v štatistikách | hotovo (čiastočne) |
| Odľahčenie nevybraných telemetrických popisov | **Neprekrývať popisy**, zoradené podľa priority každého pravidla | hotovo / nové |
| Popísať všetky pozemné objekty / len hrozby | Pravidlá Zem a AI | nové |
| Mierka popisov | **Veľkosť popisov** (60-250 %) | nové |
| Metrické / imperiálne jednotky | Metrické / imperiálne | hotovo (dve predvoľby, nie osem) |

## Informácie o objekte a telemetria {#object-info-and-telemetry}

| Tacview | 3DHeat | Stav |
|---|---|---|
| Primárny a sekundárny výber | Kliknutie sleduje a vyberie; shift-klik na dva na meranie; výber **Cieľ** | hotovo / nové |
| Dosah / azimut / aspekt / priblíženie medzi dvoma objektmi | Čiara BRAA meraného páru; polia Dosah, Azimut, Aspekt a Priblíženie od sledovanej jednotky | hotovo |
| Relatívny azimut, rýchlosť zámernej priamky | Polia **Relatívny azimut** (od nosa sledovanej jednotky, L/R) a **Uhlová rýchlosť zámernej priamky** (°/s) | nové |
| Okná telemetrie | Karta jednotky a karta pri podržaní kurzora | hotovo |
| Surová telemetria (každá zaznamenaná vlastnosť, aj neznáme) | **Surové** na karte jednotky: každý stĺpec v riadku jednotky tak, ako je zapísaný | nové |
| Zoznam aktívnych objektov | **Jednotky**: hráči, AI, zbrane v lete, živé jasne | hotovo |
| Okno vlastností záznamu (názov, autor, brífing...) | Uložené ako stĺpec RecordingInfo; zobrazené v Surové | hotovo (bez okna) |
| Formáty polôh DMS/MGRS, magnetický sever | **Poloha (šírka / dĺžka)** v DMS a polia **MGRS**; pole **Magnetický kurz**; **Magnetické kurzy** zapíše kurz, dráhu a azimut magnetický (°M) a zobrazí kompas s oboma severmi a odchýlkou - World Magnetic Model 2025 (koeficienty vo verejnej doméne), vypočítaný tu na mieste a dátume jednotky | nové |

## Grafy {#charts}

| Tacview | 3DHeat | Stav |
|---|---|---|
| Graf jedného objektu, až 4 hodnoty | **V čase** (a graf pod Prehrávaním) | hotovo |
| Vykresliť až 4 objekty naraz | **Porovnanie**: jedna hodnota až 8 jednotiek na jednej mierke | nové |
| Hodnota proti hodnote (štýl energia-manévrovateľnosť) | **Hodnota proti hodnote**: rýchlosť zákruty proti rýchlosti alebo ľubovoľnému páru, každá jednotka je čiara, jej aktuálny bod označený | nové |
| Os X podľa času; priblíženie; posúvanie času z grafu | Koliesko priblíži v čase, dvojklik obnoví, kliknutie ide na okamih | nové |
| Os X podľa vzdialenosti vo vzduchu alebo na zemi | **Čas / Vzdialenosť vo vzduchu / Vzdialenosť na zemi** na grafoch času a porovnania; priblíženie a kliknutie-na-prechod fungujú rovnako | nové |
| Preddefinované grafy (energia, zrýchlenie...) | Ľubovoľnú hodnotu možno vybrať (výška energie a jej rýchlosť sú hodnoty) | hotovo |

## Štatistiky, letový denník, udalosti {#statistics-flight-log-events}

| Tacview | 3DHeat | Stav |
|---|---|---|
| Letový denník: vzlet, pristátie, výstrel, zasiahnutý od, zničený od, opustil oblasť | **Štatistiky** na jednotku: životy, zabitia, smrti, výstrely, zásahy, pomer zásahov, vzlety, pristátia, čas vo vzduchu, najvyššie G (a najnižšie), najvyššia rýchlosť, výška a Mach, vzdialenosť. Vzlety pochádzajú z udalostí TakenOff/Landed, OnGround, AGL alebo odhadu označeného ~. | nové |
| Doplnky tabuľky výsledkov a hlásenia misie | Súhrn na tím a najviac zabití; vlastná tabuľka výsledkov súhrnu zápasu | nové / hotovo |
| Export letového denníka XML/CSV | **Exportovať CSV** štatistík a udalostí tak, ako sú uvedené | nové (len CSV) |
| Export telemetrie CSV pri rýchlosti | **Telemetria vybranej jednotky**: každá hodnota, 1-20 za sekundu | nové |
| Denník udalostí, dvojklik tam ide a vyberie | Zoznam **Udalosti**, filtrovaný podľa druhu a jednotky; kliknutie tam preletí | hotovo |
| Predošlá / ďalšia udalosť (Ctrl+←/→) | **Page Up / Page Down** | nové |
| Pozastavenie pri udalosti | **Pozastaviť pri udalosti** | nové |
| Značky na časovej osi (uvoľnenia, zásahy, zničenia; vybraný objekt modrý; záložky červené) | Zabitia a smrti ako pás hustoty, sledovaná jednotka modrá, záložky červené; kliknutie ide tam | nové |
| Odstrániť udalosť, odstrániť zabitím | Nie je postavené | n/a (udalosti patria záznamu; filtre ich skrývajú) |

## Záložky {#bookmarks}

| Tacview | 3DHeat | Stav |
|---|---|---|
| Vložiť záložku s výberom a pohľadom | **Pridať záložku** (B): okamih, voľná kamera alebo sledovaná jednotka s jej pohľadom, vzdialenosťou a cieľom; pomenovaná; uložená v tomto prehliadači pre každý záznam | nové |
| Odstrániť záložku | × v zozname | nové |
| Záložky na časovej osi a v denníkoch | Červené značky; zoznam | nové |
| Event=Bookmark v ACMI | Uvedené pod značkami záznamu, so zabitiami, smrťami a správami | nové |
| Skratka kopírovania/vloženia (zdieľanie pohľadu) | **Exportovať / Importovať** záložky ako súbor; C skopíruje polohu kamery | nové |

## Prehrávanie {#playback}

| Tacview | 3DHeat | Stav |
|---|---|---|
| Prehrať/pozastaviť, na začiatok, rýchlosť, posúvanie časovej osi | Časová os | hotovo |
| Snímka po snímke | **,** a **.** o sekundu dozadu a dopredu (Shift: desať) | nové |
| Prehrávanie dozadu | **◀** na časovej osi, **J** (**L** dopredu; ten istý kláves znova pozastaví): hrá od konca k začiatku zvolenou rýchlosťou, v slučke alebo sa zastaví na začiatku | nové |
| Dialóg skoku v čase | Časová os a zoznam udalostí | hotovo |
| Časový posun jedného objektu (duch) | **Časový posun a orezanie**: posunúť let jednej jednotky alebo celý záznam o toľko sekúnd; **Zarovnať záznamy** posunie viac záznamov, aby začali spoločne, a prehrá ich naraz (dva lety z rôznych dní vedľa seba). Záznam sa prestavia, takže stopy, udalosti, grafy a štatistiky nasledujú | nové |
| Orezanie pred/za | **Od teraz / Do teraz / Orezať na tento úsek** (vrátenie zachová posuny), potom **Exportovať CSV** (dá sa načítať späť do 3DHeat) alebo **Exportovať ACMI** (text Tacview 2.2, pre záznam umiestnený na Zemi) | nové |

## Terén a mapa {#terrain-and-map}

| Tacview | 3DHeat | Stav |
|---|---|---|
| Skutočný terén, vlastná výška a textúry | Levely (vlastná mapa hry ako 3D model), dlaždice pozadia sveta | hotovo |
| Režimy plochého / prázdneho / vysokokontrastného terénu | [Vzhľad levelu](level-appearance.md): reliéf zeme, povrch a objekty zobrazené alebo nie | hotovo (nie rovnaké režimy) |
| 2D taktická mapa (Tacview nemá žiadnu: satelitný pohľad) | **2D mapa**: roh alebo celý pohľad, symboly podľa druhu a tímu (plné hráčov, obrysové AI) otočené podľa smeru, stopy, mená, mierka, prstence dosahu okolo sledovanej jednotky, prstence bullseye, miesto 3D kamery, nedávne smrti; ťahanie, koliesko, kliknutie na sledovanie (M) | nové |
| Statické objekty (letiská, dráhy, body trasy, oblasti, KML) | Zamerané dráhy (OurAirports) v pozadí sveta a ich zostupové roviny; body trasy GPX a značky KML sa načítajú ako stojace objekty; [Taktická tabuľa](tactics-board.md) kreslí oblasti a trasy | nové |

## Import, export, záznam {#import-export-recording}

| Tacview | 3DHeat | Stav |
|---|---|---|
| Text a zip ACMI | [Tacview ACMI](tacview-acmi.md) | hotovo |
| GPX, KML, CSV, NMEA, IGC, FIT, DIS... | **GPX** (stopy, trasy, body trasy; srdcový tep, kadencia, výkon, teplota Garmin), **KML/KMZ** (gx:Track, LineString, Point), **NMEA 0183** (RMC a GGA od ľubovoľného vysielača, kontrolné súčty overené, cez polnoc), **IGC** (záznamy B, dátum, pilot a klzák), **FIT** (správy záznamu, komprimované časové značky) - každý umiestnený zemepisnou šírkou a dĺžkou do roviny v strede stôp, takže pozadie sveta sedí; smer, sklon a rýchlosť zo súboru alebo z fixu na fix. CSV a Parquet ako predtým | nové (DIS n/a: živý sieťový protokol) |
| Vlastné záznamníky (DCS, BMS, IL-2, MSFS...) | Vlastné konvertory 3DHeat (War Thunder, CS2, Squad, Arma a ďalšie) | hotovo (vlastné) |
| Telemetria v reálnom čase cez TCP, ADS-B | Nie je postavené | n/a (prehrávanie po zápase) |
| Synchronizované audio/video | **Zvuk a video**: lokálny súbor sa prehráva, pozastavuje, posúva a mení rýchlosť s časovou osou od nastaveného začiatku (**Začína teraz**, ±0,1 s); video v zmeniteľnom paneli nad zobrazením alebo obraz v obraze. Súbor zostáva v prehliadači | nové |
| Export videa | [Dráha kamery a video](camera-path-and-video.md) | hotovo |

## Ostatné {#other}

| Tacview | 3DHeat | Stav |
|---|---|---|
| Doplnky Lua | Nie je postavené | n/a (otvorený zdroj: zmeňte samotný prehliadač) |
| Online debriefing (zdieľaná relácia) | Nie je postavené | n/a (Tacview má hostovanú reláciu, ktorá drží všetkých na jednej prehrávacej hlave. 3DHeat nemá server a uchováva záznamy na počítači používateľa, a aj priame spojenie medzi rovesníkmi potrebuje signalizačný server. Debriefing sa zdieľa ako súbory: orezaný záznam (Exportovať ACMI alebo CSV) a súbor záložok, ktoré sa otvoria v tých istých okamihoch a pohľadoch) |
| Vzdialené ovládanie inštruktorom | Nie je postavené | n/a (ovláda bežiaci simulátor) |
| Úprava objektov (pridať, upraviť, odstrániť objekty) | [Taktická tabuľa](tactics-board.md) pre plánované objekty; záznamy sú len na čítanie | n/a |
| Jazyky | 40 jazykov | hotovo |
| Overenie záznamov | Nie je postavené | n/a |

## Pre vývojárov: vlastnosti ACMI 2.2 {#for-developers-acmi-22-properties}

Číta ich `data/acmi.ts`; číselné vlastnosti sa stanú číselnými stĺpcami, textové stĺpcami kategórií. Všetky sa zobrazujú v **Surové** na karte jednotky. Tieto sa čítajú na určitý účel:

| Vlastnosti | Použitie |
|---|---|
| T (všetky štyri tvary), Name, Type, Pilot, Group, Country, Coalition, Color, CallSign | Poloha, postoj, postava, meno jednotky, tím |
| IAS, CAS, TAS, Mach, AOA, AOS, AGL, HDG, HDM, OnGround | Polia, grafy, HUD, zisťovanie vzletu a pristátia |
| VerticalGForce, LongitudinalGForce, LateralGForce | Polia G |
| Throttle(2), Afterburner, EngineRPM(2), NR, AirBrakes, Flaps, LandingGear, Tailhook | Polia |
| FuelWeight..9, FuelVolume..9, FuelFlowWeight..8 | Polia paliva, sčítané cez nádrže |
| RadarMode, RadarAzimuth, RadarElevation, RadarRoll, RadarRange, RadarHorizontalBeamwidth, RadarVerticalBeamwidth, RadarRangeGateAzimuth/Elevation/Min/Max/HorizontalBeamwidth/VerticalBeamwidth | Radarové kužele a brána dosahu |
| LockedTarget..9, LockedTargetMode, LockedTargetAzimuth/Elevation/Range, FocusedTarget | Čiary zamknutia |
| EngagementMode(2), EngagementRange(2), VerticalEngagementRange(2) | Kupoly nasadenia |
| QNH, AltimeterSetting, WindSpeed, WindDirection, HeartRate | Polia |
| Health | Pole |
| Udalosti: Destroyed, TakenOff, Landed, Bookmark, Message, Comment, LeftArea, Timeout | Zoznam udalostí, štatistiky (smrti, vzlety, pristátia), záložky; Message a Comment ako titulky |
| PilotHeadYaw, PilotHeadPitch | Smer pohľadu pilota |
| Značka typu Bullseye (Navaid+Static+Bullseye) | Pole bullseye a prstence mapy |
| Všetko ostatné (PilotHeadRoll, ovládanie, plochy, odchýlky ILS, SpO2, ENL, Label, Debug, Importance, Slot, Visible, Disabled, Radius, veľkosti...) | Zobrazené tak, ako sú zapísané, v **Surové** |

Uhly radaru a zamknutia sa berú voči vlastným osiam jednotky: azimut doprava, elevácia nahor, náklon pravé krídlo nadol. Špecifikácia ACMI hovorí, že sú vzhľadom na lietadlo, ale nie to, ktorým smerom je kladný; toto čítanie nasleduje jej transformáciu (zatáčanie doprava, sklon nahor, náklon pravé krídlo nadol).
