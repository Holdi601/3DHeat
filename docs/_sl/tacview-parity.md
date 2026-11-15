---
title: "Enakovrednost s Tacview"
parent: "Predvajanje tekme"
grand_parent: "Ponovitev"
nav_order: 1
lang: "sl"
source: "tacview-parity.md"
source_hash: "4275603255c2"
translated: true
outdated: false
---

# Enakovrednost s Tacview

Tacview je znan program za ogled posnetkov letov. Če ga poznate, ta stran pokaže, kje je vsako od njegovih orodij v 3DHeat.

Naštete so vse zmožnosti Tacview 1.9 (njegov priročnik, njegova tabela nizov vmesnika in format datotek ACMI 2.2) ter kje je [predvajanje tekme](match-replay.md) v 3DHeat glede nanje. Cilj: kar Tacview zmore za posnetek in njegove podatke, to zmore tudi 3DHeat.

**Stanje:**
- **done**: že v 3DHeat.
- **new**: zgrajeno, da ustreza funkciji Tacview.
- **not yet**: velja, ni zgrajeno.
- **n/a**: tu ne velja, z razlogom.

Kje najti zmožnosti: zavihek **Tekma**, **Predvajanje figur** (ali **Prekrivanje figur** v zavihku Toplotna karta), v stranskih razdelkih **Predvajanje**, **Enote**, **Dogodki**, **Zaznamki**, **Taktični prikaz**, **Statistika**, **Časovni zamik in obrezovanje**, **Zemljevid in položaj**, **Zvok in video** in **Oznake**. Glej [predvajanje tekme](match-replay.md).

## Kamere {#cameras}

| Tacview | 3DHeat | Stanje |
|---|---|---|
| Pogled iz kokpita (F5), obzorje se vrti z letalom | **Kokpit**: iz enote vzdolž njene drže, kot jo ima model gibanja. Lastna figura enote je odrezana. Povlecite za ogled okoli; **Spet glej naprej** ponastavi. | new |
| HUD v pogledu iz kokpita (izbira IAS/CAS/TAS) | **Projekcijski zaslon** (H): obzorje in lestev nagiba dejanskega pogleda, oznaka poti letenja, trak smeri, IAS, višina, TAS, Mach, G, kot napada, vertikalna hitrost, AGL | new |
| 3D instrumenti v kokpitu, sledenje glave pilota (PilotHead*), TrackIR | Ni modelov kokpita; koti glave so prikazani v pogledu **Surovo** na kartici enote | n/a (ni modelov kokpita; sledenje glave je strojna oprema za živo letenje) |
| Zunanji pogled (F6): kroženje okoli primarnega objekta | **Zadaj** (obrača se z enoto) in **Orbita** (ohrani svojo smer) | done |
| Kamera za zračni boj, "Glej v cilj" (padlock) | **Padlock**: iz kokpita, držan na cilju | new |
| Kamera za zračni boj, "Centrirano" / "Glej naprej" | **Cilj**: za enoto na črti od cilja, gleda mimo nje na cilj. **Fiksno** pri azimutu 0 gleda naprej od spredaj. | new |
| Zamenjava primarnega in sekundarnega | **Zamenjaj** poleg cilja | new |
| Satelitski pogled (F7), pravokotna projekcija od zgoraj | **Satelit**: naravnost navzdol na enoto, sever zgoraj; povlecite za obračanje. 2D-karta je pravokotni tloris. | new |
| Prosta kamera (F8), W/A/S/D, E/C | Prosta letalska kamera (W/A/S/D, Space/Q, Shift/Alt) | done |
| Dodatek Head-On kamera; zunanja kamera, pritrjena na objekt | **Fiksno**: mesto okoli enote, ki se obrača in nagiba z njo; povlecite za premik (zadaj, na konici krila, od spredaj) | new |
| Dodatek Lock Camera (zamrznitev položaja) | Ustavi sledenje (Esc): kamera ostane, kjer je bila | done |
| Strateški pogled (oddaljitev na celo Zemljo) | [Ozadje sveta](world-backdrop.md) in okvir celotnega posnetka na 2D-karti | done |
| Nastavitev vidnega polja | **Kamera in prizor** FOV | done |
| Preklapljanje pogledov s tipkami | **V** naslednji pogled, **Shift+V** nazaj | new |

## Pogled 3D in možnosti prikaza {#d-view-and-display-options}

| Tacview | 3DHeat | Stanje |
|---|---|---|
| Sledi trakov, drsnik dolžine | Sledi (sekunde) v pregledovalniku ekipe | done |
| Predvidevna sled (pot naprej) | **Pot naprej**: kam enota dejansko gre v naslednjih sekundah | new |
| Črte višine objekta / stene | **Navpične črte** | done (črte; stene niso zgrajene) |
| Vektorji izbranega objekta: smer (pikčasto), tečaj (polno), vzgon | **Vektorji hitrosti** (tečaj in hitrost za toliko sekund, z nasvetom) in **Črti nosu in vzgona** (nos črtkano, vzgon kratko in temno) | new |
| Smer pogleda pilota | **Smer pogleda pilota**: črtkana cian črta vzdolž PilotHeadYaw/PilotHeadPitch (ali stolpca HeadYaw, ViewYaw ali LookYaw) glede na osi enote | new |
| Krogi smrtonosnega dosega SAM/AAA (EngagementRange, VerticalEngagementRange, EngagementMode, dvojčki "2") | **Območja delovanja**: kupole, jajčaste tam, kjer se navpični doseg razlikuje; izklopljene, dokler je EngagementMode 0 | new |
| Radarski zaklepi (LockedTarget..9) z oznakami | **Zaklepi**: rdeče črte do vsakega zaklenjenega objekta; črtkana jantarna do FocusedTarget; vzdolž LockedTargetAzimuth/Elevation/Range, kjer ni imenovanega objekta. **Oznake zaklepov**: ime cilja in razdalja na vsaki črti zaklepa | new |
| Radarski stožec (RadarMode, Azimuth, Elevation, Roll, Range, širine snopa) in vrata dosega | **Stožci radarja**: obod in srednji kolobar snopa, obrnjen po azimutu, elevaciji in nagibu glede na enoto; vrata dosega kot dva rumena oboda. Brez širin snopa samo os snopa. | new |
| Vidna črta med dvema izbranima objektoma (zelena / rdeča pikčasta, ko teren blokira) | Črta izmerjenega para postane rdeča in črtkana, ko je med njima teren | new |
| Samodejno povečanje oddaljenih objektov | Najmanjša figura na zaslonu (slikovne pike) | done |
| Mreža zemljepisne širine in dolžine | **Zemljevid in položaj → Mreža**: črte zemljepisne širine in dolžine na tleh pod kamero, pri okrogli razdalji glede na višino (od 10° do 1'), označene; ali kilometrska mreža **MGRS** cone UTM, s prikazano cono in kvadratom 100 km. Mreža 2D-karte ostane, kot je bila | new |
| Krogi Bullseye | Krogi okoli bullseye vsake ekipe na 2D-karti | new (samo 2D) |
| Prikaz drsne ravnine | **Drsne ravnine**: poti 3° s robovi polnega obsega ±0,7° na obeh koncih vsake vzletno-pristajalne steze blizu posnetka, iz izmerjenih pragov in višin OurAirports (preneseno enkrat, hranjeno brez povezave), oznaka pri vsaki nautični milji, imenovana po letališču in stezi | new |
| Višinske omejitve (alarm stropa/tal) | **Višinska omejitev**: tla in strop; oznake enot zunaj postanejo rdeče, vsak prehod (pod tlemi, nad stropom, nazaj znotraj) je naveden – klik gre tja in sledi enoti | new |
| Uničeni objekti sivi, odstranjeni po 15 min | Življenja se končajo s svojo sledjo; mrtva enota je v seznamu enot zatemnjena | done |
| Lastnosti Visible / Disabled | Prikazane v **Surovo**; nič ni z njimi skrito | not yet |
| Prikaz položajev palice/plina/pedal | Vrednosti plina in motorja v poljih; vhodi krmiljenja v **Surovo** | done (kot vrednosti) |
| Komentarji kot podnapisi | **Sporočila kot podnapisi** (Oznake): dogodki ACMI Message in Comment ter klepet iz vsake igre (dogodki Chat, Say ali Radio ali stolpec klepeta), na dnu pogleda s tem, kdo je rekel, šest sekund | new |
| Prikaz datuma in časa UTC | Ura na časovnici z UTC, kjer ima posnetek referenčni čas | done |
| Položaj miške v zemljepisni širini/dolžini, MGRS, bullseye | Kartica točke (klik na točko) da zemljepisno širino/dolžino v stopinjah, minutah in sekundah ter MGRS poleg svetovnih metrov; bullseye za vsako enoto (polje) | new |
| Lasten logotip | Ni zgrajeno | n/a (blagovna znamka) |
| 3D modeli, najbližji, kadar niso znani | Lastni katalog figur, najbližji ustrezni, prava velikost | done |
| Več spopadov (črte med vsemi pari) | **Črte spopadov**: od vsake enote v obsegu do vsakega nasprotnika v nastavljenem dosegu (1–200 km), vsaka z razdaljo, najbližjih 60 parov; izmerjen par kot prej | new |

## Oznake {#labels}

| Tacview | 3DHeat | Stanje |
|---|---|---|
| Oznake vklop/izklop, ločeno za izbrane in neizbrane objekte | **Oznake** s pravili za **Izbrane**, **Letala**, **Kopno**, **Ladje**, **Orožje** in **AI**: prikazane ali ne, lastne vrednosti, prednost | new |
| Polja oznak: ime, klicni znak, pilot, hitrosti (TAS/CAS/IAS/Mach/GS), višine (ASL/AGL), VS, AOA, AOS, G (navpično, bočno, vzdolžno), hitrost zavijanja in polmer, energija, teža/prostornina/pretok goriva, smer/tir, zvitje/nagib, srčni utrip | Vsaka vrednost iz `fields.ts`: isti seznam, izračunan, kjer ni zabeležen (ocene označene ~). Hitrost zvitja in SpO2 samo prek Surovo. | done |
| Položaj bullseye v oznakah | Polje **Bullseye (azimut / razdalja)** | new |
| Odkloni ILS, preletena razdalja | Surove vrednosti; preletena razdalja v statistiki | done (deloma) |
| Razbremenitev neizbrane telemetrije | **Razmakni oznake**, urejeno po prednosti vsakega pravila | done / new |
| Označi vse objekte na tleh / samo grožnje | Pravili Kopno in AI | new |
| Velikost oznak | **Velikost oznak** (60–250 %) | new |
| Metrične / angleške enote | Metrične / angleške | done (dve nastavitvi, ne osem) |

## Podatki o objektu in telemetrija {#object-info-and-telemetry}

| Tacview | 3DHeat | Stanje |
|---|---|---|
| Izbira primarnega in sekundarnega | Klik sledi in izbere; shift-klik na dva za merjenje; izbirnik **Cilj** | done / new |
| Razdalja / azimut / kot pogleda / približevanje med dvema objektoma | Črta BRAA izmerjenega para; polja Razdalja, Azimut, Kot pogleda in Približevanje iz sledene enote | done |
| Relativni azimut, hitrost vidne črte | Polji **Relativni azimut** (iz nosu sledene enote, L/R) in **Kotna hitrost vidne črte** (°/s) | new |
| Okna telemetrije | Kartica enote in kartica ob lebdenju | done |
| Surova telemetrija (vsaka zabeležena lastnost, tudi neznane) | **Surovo** na kartici enote: vsak stolpec v vrstici enote, kot je zapisan | new |
| Seznam aktivnih objektov | **Enote**: igralci, AI, orožje v letu, žive so svetleje | done |
| Okno lastnosti posnetka (naslov, avtor, brifing ...) | Ohranjeno kot stolpec RecordingInfo; prikazano v Surovo | done (brez okna) |
| Oblike položaja DMS/MGRS, magnetni sever | **Položaj (šir. / dolž.)** v poljih DMS in **MGRS**; polje **Magnetna smer**; **Magnetne smeri** zapiše smer, tečaj in azimut magnetno (°M) ter pokaže kompas z obema severoma in odklonom – Svetovni magnetni model 2025 (koeficienti v javni domeni), izračunan tu za mesto in datum enote | new |

## Grafikoni {#charts}

| Tacview | 3DHeat | Stanje |
|---|---|---|
| Grafikon enega objekta, do 4 vrednosti | **Skozi čas** (in grafikon pod Predvajanje) | done |
| Prikaz do 4 objektov hkrati | **Primerjava**: ena vrednost do 8 enot na eni lestvici | new |
| Vrednost proti vrednosti (slog energije-manevrirnosti) | **Vrednost proti vrednosti**: hitrost zavijanja proti hitrosti ali kateremu koli paru, vsaka enota je črta, njena trenutna točka označena | new |
| Os X po času; povečava; premik časa iz grafikona | Kolešček povečuje po času, dvojni klik ponastavi, klik gre v trenutek | new |
| Os X po zračni ali zemeljski razdalji | **Čas / zračna razdalja / zemeljska razdalja** na grafikonih časa in primerjave; povečava in klik-za-premik delujeta enako | new |
| Vnaprej določeni grafikoni (energija, pospešek ...) | Izbere se lahko katera koli vrednost (energijska višina in njena hitrost sta vrednosti) | done |


## Statistika, dnevnik letov, dogodki {#statistics-flight-log-events}

| Tacview | 3DHeat | Stanje |
|---|---|---|
| Dnevnik letov: vzletel, pristal, streljal, zadet od, uničen od, zapustil območje | **Statistika** za enoto: življenja, sestreli, smrti, streli, zadetki, delež zadetkov, vzleti, pristanki, čas v zraku, največ G (in najmanj), največja hitrost, višina in Mach, razdalja. Vzleti prihajajo iz dogodkov TakenOff/Landed, OnGround, AGL ali ocene, označene ~. | new |
| Dodatka: tablica rezultatov in poročilo o misiji | Povzetek po ekipah in največ sestrelov; lastna tablica rezultatov povzetka tekme | new / done |
| Izvoz dnevnika letov XML/CSV | **Izvozi CSV** statistike in dogodkov, kot so navedeni | new (samo CSV) |
| Izvoz telemetrije CSV po hitrosti | **Telemetrija izbrane enote**: vsaka vrednost, od 1 do 20 na sekundo | new |
| Dnevnik dogodkov, dvojni klik za skok tja in izbiro | Seznam **Dogodki**, filtriran po vrsti in enoti; klik poleti tja | done |
| Prejšnji / naslednji dogodek (Ctrl+←/→) | **Page Up / Page Down** | new |
| Premor ob dogodku | **Premor ob dogodku** | new |
| Oznake na časovnici (izpusti, zadetki, uničenja; izbranega objekta modro; zaznamki rdeče) | Sestreli in smrti kot gostotna vrstica, sledene enote modro, zaznamki rdeče; klik gre tja | new |
| Odstranitev dogodka, odstranitev ob sestrelu | Ni zgrajeno | n/a (dogodki pripadajo posnetku; filtri jih skrijejo) |

## Zaznamki {#bookmarks}

| Tacview | 3DHeat | Stanje |
|---|---|---|
| Vstavi zaznamek z izbiro in točko pogleda | **Dodaj zaznamek** (B): trenutek, prosta kamera ali sledena enota s pogledom, razdaljo in cilj; poimenovan; hranjen v tem brskalniku za vsak posnetek | new |
| Odstrani zaznamek | × na seznamu | new |
| Zaznamki na časovnici in v dnevnikih | Rdeče oznake; seznam | new |
| Event=Bookmark v ACMI | Našteto pod oznakami posnetka, skupaj s sestreli, smrtmi in sporočili | new |
| Bližnjica za kopiranje/lepljenje (delitev pogleda) | **Izvozi / Uvozi** zaznamke kot datoteko; C kopira držo kamere | new |

## Predvajanje {#playback}

| Tacview | 3DHeat | Stanje |
|---|---|---|
| Predvajaj/pavza, na začetek, hitrost, premik po časovnici | Časovnica | done |
| Kader za kader | **,** in **.** sekundo nazaj in naprej (Shift: deset) | new |
| Predvajanje v obratni smeri | **◀** na časovnici, **J** (**L** naprej; isti tipka spet ustavi): predvaja od konca proti začetku z izbrano hitrostjo, v zanki ali ustavi na začetku | new |
| Pogovorno okno skoka v čas | Časovnica in seznam dogodkov | done |
| Zamik ene enote (duh) | **Časovni zamik in obrezovanje**: premakne let ene enote ali celoten posnetek za toliko sekund; **Poravnaj posnetke** premakne več posnetkov, da se začnejo skupaj in se predvajajo hkrati (dva leta na različna dneva drug ob drugem). Posnetek se ponovno zgradi, zato sledi, dogodki, grafikoni in statistika sledijo | new |
| Obreži pred/po | **Od zdaj / Do zdaj / Obreži na ta razpon** (razveljavitev ohrani zamike), nato **Izvozi CSV** (se naloži nazaj v 3DHeat) ali **Izvozi ACMI** (besedilo Tacview 2.2, za posnetek, postavljen na Zemljo) | new |

## Teren in karta {#terrain-and-map}

| Tacview | 3DHeat | Stanje |
|---|---|---|
| Pravi teren, lastna višina in teksture | Ravni (zemljevid igre kot 3D model), ploščice ozadja sveta | done |
| Načini ravnega / praznega / visokokontrastnega terena | [Videz ravni](level-appearance.md): reliefa tal, površina in objekti prikazani ali ne | done (ne isti načini) |
| 2D taktična karta (Tacview je nima: satelitski pogled) | **2D-karta**: pogled na kot ali celoten, simboli po vrsti in ekipi (polni igralci, obrobljeni AI), obrnjeni v svojo smer, sledi, imena, merilo, krogi dosega okoli sledene enote, krogi bullseye, mesto 3D kamere, nedavne smrti; povleci, kolešček, klik za sledenje (M) | new |
| Statični objekti (letališča, steze, točke, območja, KML) | Izmerjene vzletno-pristajalne steze (OurAirports) v ozadju sveta in njihove drsne ravnine; GPX točke in KML oznake se naložijo kot stoječi objekti; [Tabla taktike](tactics-board.md) riše območja in poti | new |

## Uvoz, izvoz, snemanje {#import-export-recording}

| Tacview | 3DHeat | Stanje |
|---|---|---|
| Besedilo in zip ACMI | [Tacview ACMI](tacview-acmi.md) | done |
| GPX, KML, CSV, NMEA, IGC, FIT, DIS ... | **GPX** (sledi, poti, točke; srčni utrip, kadenca, moč, temperatura Garmin), **KML/KMZ** (gx:Track, LineString, Point), **NMEA 0183** (RMC in GGA od katerega koli govorca, kontrolne vsote preverjene, čez polnoč), **IGC** (zapisi B, datum, pilot in jadralo), **FIT** (sporočila zapisa, stisnjene časovne oznake) – vsak postavljen po zemljepisni širini in dolžini v ravnino na sredini sledi, tako da se ozadje sveta ujema; smer, nagib in hitrost iz datoteke ali od točke do točke. CSV in Parquet kot prej | new (DIS n/a: protokol živega omrežja) |
| Lastni snemalniki (DCS, BMS, IL-2, MSFS ...) | Lastni pretvorniki 3DHeat (War Thunder, CS2, Squad, Arma in drugi) | done (lastni) |
| Telemetrija v realnem času prek TCP, ADS-B | Ni zgrajeno | n/a (predvajanja po tekmi) |
| Sinhronizirani zvok/video | **Zvok in video**: lokalna datoteka se predvaja, ustavi, premika in spreminja hitrost z časovnico od določenega začetka (**Začne se zdaj**, ±0,1 s); video v panelu, ki ga je mogoče spreminjati, nad pogledom, ali slika v sliki. Datoteka ostane v brskalniku | new |
| Izvoz videa | [Pot kamere in video](camera-path-and-video.md) | done |

## Drugo {#other}

| Tacview | 3DHeat | Stanje |
|---|---|---|
| Dodatki Lua | Ni zgrajeno | n/a (odprta koda: spremenite sam pregledovalnik) |
| Spletno poročanje (skupna seja) | Ni zgrajeno | n/a (Tacviewova je gostujoča seja, ki vse drži na eni predvajalni glavi. 3DHeat nima strežnika in hrani posnetke na računalniku gledalca, tudi povezava od vrstnika do vrstnika potrebuje strežnik za signalizacijo. Poročilo se deli kot datoteke: obrezani posnetek (Izvozi ACMI ali CSV) in datoteka zaznamkov, ki se odpreta ob istih trenutkih in pogledih) |
| Daljinsko upravljanje inštruktorja | Ni zgrajeno | n/a (upravlja tekoči simulator) |
| Urejanje objektov (dodajanje, urejanje, odstranjevanje objektov) | [Tabla taktike](tactics-board.md) za načrtovane objekte; posnetki so samo za branje | n/a |
| Jeziki | 40 jezikov | done |
| Overjanje posnetkov | Ni zgrajeno | n/a |

## Za razvijalce: lastnosti ACMI 2.2 {#for-developers-acmi-22-properties}

Bere jih `data/acmi.ts`; številske lastnosti postanejo številski stolpci, besedilne pa stolpci kategorij. Vse so prikazane pod **Surovo** na kartici enote. Te se berejo z namenom:

| Lastnosti | Uporaba |
|---|---|
| T (vse štiri oblike), Name, Type, Pilot, Group, Country, Coalition, Color, CallSign | Položaj, drža, figura, ime enote, ekipa |
| IAS, CAS, TAS, Mach, AOA, AOS, AGL, HDG, HDM, OnGround | Polja, grafikoni, HUD, zaznavanje vzletov in pristankov |
| VerticalGForce, LongitudinalGForce, LateralGForce | Polja G |
| Throttle(2), Afterburner, EngineRPM(2), NR, AirBrakes, Flaps, LandingGear, Tailhook | Polja |
| FuelWeight..9, FuelVolume..9, FuelFlowWeight..8 | Polja goriva, seštete po rezervoarjih |
| RadarMode, RadarAzimuth, RadarElevation, RadarRoll, RadarRange, RadarHorizontalBeamwidth, RadarVerticalBeamwidth, RadarRangeGateAzimuth/Elevation/Min/Max/HorizontalBeamwidth/VerticalBeamwidth | Radarski stožci in vrata dosega |
| LockedTarget..9, LockedTargetMode, LockedTargetAzimuth/Elevation/Range, FocusedTarget | Črte zaklepov |
| EngagementMode(2), EngagementRange(2), VerticalEngagementRange(2) | Kupole spopadov |
| QNH, AltimeterSetting, WindSpeed, WindDirection, HeartRate | Polja |
| Health | Polje |
| Dogodki: Destroyed, TakenOff, Landed, Bookmark, Message, Comment, LeftArea, Timeout | Seznam dogodkov, statistika (smrti, vzleti, pristanki), zaznamki; Message in Comment kot podnapisi |
| PilotHeadYaw, PilotHeadPitch | Smer pogleda pilota |
| Oznaka tipa Bullseye (Navaid+Static+Bullseye) | Polje bullseye in krogi na karti |
| Vse drugo (PilotHeadRoll, krmiljenja, površine, odkloni ILS, SpO2, ENL, Label, Debug, Importance, Slot, Visible, Disabled, Radius, velikosti ...) | Prikazano, kot je zapisano, pod **Surovo** |

Koti radarja in zaklepov so merjeni glede na lastne osi enote: azimut v desno, elevacija navzgor, nagib desno krilo navzdol. Specifikacija ACMI pravi, da so glede na letalo, ne pove pa, katera smer je pozitivna; to branje sledi njeni transformaciji (yaw v smeri urnega kazalca, pitch navzgor, roll desno).

