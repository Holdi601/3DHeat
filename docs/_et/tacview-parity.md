---
title: "Tacview tasemel"
parent: "Matši kordus"
grand_parent: "Kordus"
nav_order: 1
lang: "et"
source: "tacview-parity.md"
source_hash: "4275603255c2"
translated: true
outdated: false
---

# Tacview tasemel

Tacview on populaarne programm lennusalvestiste vaatamiseks. Kui sa seda tunned, näitab see leht, kus on 3DHeati iga tööriist.

Leht loetleb iga Tacview 1.9 funktsiooni (selle käsiraamat, kasutajaliidese tekstitabel ja ACMI 2.2 failivorming) ja seda, kus [matši kordus](match-replay.md) selle suhtes seisab. Eesmärk on, et mida Tacview saab kordusega ja selle andmetega teha, seda saab teha ka 3DHeat.

**Staatus:**
- **tehtud**: on juba 3DHeatis.
- **uus**: ehitatud vastama Tacview funktsioonile.
- **pole veel**: kehtib, aga pole ehitatud.
- **ei kehti**: ei kehti siin, põhjusega.

Funktsioonide leidmine: vahekaart **Matš**, **Kujukordus** (või **Kujude ülekate** vahekaardil Soojuskaart) ja külgriba jaotised **Kordus**, **Üksused**, **Sündmused**, **Järjehoidjad**, **Taktikaline kuva**, **Statistika**, **Ajanihe ja kärpimine**, **Kaart ja asukoht**, **Heli ja video** ning **Sildid**. Vt [matši kordus](match-replay.md).

## Kaamerad {#cameras}

| Tacview | 3DHeat | Staatus |
|---|---|---|
| Kokpiti vaade (F5), horisont veereb koos lennukiga | **Kokpit**: väljaspool üksust selle asendi järgi, nagu liikumismudel seda näeb. Üksuse enda kuju lõigatakse ära. Vaatamiseks lohista; **Vaata jälle ettepoole** lähtestab. | uus |
| HUD kokpiti vaates (IAS/CAS/TAS valik) | **Pealaekuvar** (H): tegeliku vaate horisont ja tõusunurga skaala, lennutee märgis, kurssilint, IAS, kõrgus, TAS, Mach, G, hoonurk, tõusukiirus, AGL | uus |
| 3D kokpiti instrumendid, piloodi pea jälgimine (PilotHead*), TrackIR | Kokpiti mudeleid pole; pea nurgad on näha üksuse kaardi vaates **Toor** | ei kehti (kokpiti mudeleid pole; pea jälgimise riistvara on elavaks lendamiseks) |
| Väline vaade (F6): orbiit esmase objekti ümber | **Jälitus** (pöördub koos üksusega) ja **Orbiit** (hoiab oma suunda) | tehtud |
| Hävitajavõitluse kaamera, "Vaata sihtmärki" (padlock) | **Padlock**: kokpitist, hoitakse sihtmärgil | uus |
| Hävitajavõitluse kaamera, "Tsentreeritud" / "Vaata ette" | **Sihtmärk**: üksuse taga sihtmärgi joonel, vaadates mööda sihtmärgist. **Fikseeritud** asimuudil 0 vaatab ettepoole eest. | uus |
| Esmase ja teisese vahetamine | **Vaheta** sihtmärgi kõrval | uus |
| Satelliitvaade (F7), ortograafiline ülevaade ülevalt | **Satelliit**: otse üksuse kohal allapoole, põhi üleval; lohista pööramiseks. 2D-kaart on ortograafiline plaan. | uus |
| Vaba kaamera (F8), W/A/S/D, E/C | Vaba lendamise kaamera (W/A/S/D, tühik/Q, Shift/Alt) | tehtud |
| Lisamoodul Head-On kaamera; objektiga fikseeritud väline kaamera | **Fikseeritud**: koht üksuse ümber, mis pöördub ja veereb koos sellega; lohista nihutamiseks (taga, tiivaots, otse ees) | uus |
| Lisamoodul Lock Camera (asukoha külmutamine) | Jälgimise lõpetamine (Esc): kaamera jääb sinna, kus oli | tehtud |
| Strateegiline vaade (suumi välja kogu Maale) | [Maailma taust](world-backdrop.md) ja 2D-kaardi kogu salvestise raam | tehtud |
| Vaatevälja seadistus | **Kaamera ja stseen** FOV | tehtud |
| Vaadete vahetamine klahvidega | **V** järgmine vaade, **Shift+V** tagasi | uus |

## 3D-vaade ja kuvavalikud {#d-view-and-display-options}

| Tacview | 3DHeat | Staatus |
|---|---|---|
| Lindjäljed, pikkuse liugur | Jäljed (sekundites) tiimi vaatajas | tehtud |
| Ootav jälg (tee ees) | **Tee ees**: kuhu üksus tegelikult järgmistel sekunditel läheb | uus |
| Objekti kõrgusjooned / seinad | **Loodjooned** | tehtud (jooned; seinu pole ehitatud) |
| Valitud objekti vektorid: suund (punktiir), kurss (pidev), tõste | **Kiirusvektorid** (kurss ja kiirus nii mitmeks sekundiks, vihjega) ning **Nina- ja tõstejooned** (nina katkendjoonena, tõste lühike ja tume) | uus |
| Piloodi vaatejoon | **Piloodi vaatejoon**: katkendlik tsüaaniroheline joon mööda PilotHeadYaw/PilotHeadPitch (või HeadYaw, ViewYaw või LookYaw veergu) üksuse telgede suhtes | uus |
| SAM/AAA surmava ulatuse kuplid (EngagementRange, VerticalEngagementRange, EngagementMode, "2" kaksikud) | **Tulistamistsoonid**: kuplid, vertikaalse ulatuse erinedes ovaalsed; väljas, kui EngagementMode on 0 | uus |
| Radarihaaramised (LockedTarget..9) siltidega | **Haaramised**: punased jooned igasse haaratud objekti; punktiirina kollakas FocusedTarget'ini; mööda LockedTargetAzimuth/Elevation/Range'i, kui objekti pole nimetatud. **Haaramiste sildid**: sihtmärgi nimi ja kaugus iga haaramisjoone juures | uus |
| Radarikoonus (RadarMode, Azimuth, Elevation, Roll, Range, kiirte laiused) ja kaugusvärav | **Radarikoonused**: kiire serv ja keskring, mida pööravad asimuut, elevatsioon ja veeremine üksuse suhtes; kaugusvärav kahe kollase servana. Ilma kiirte laiuseta ainult kiire telg. | uus |
| Joon kahe valitud objekti vahel (roheline / punane punktiir, kui maastik blokeerib) | Mõõdetud paari joon muutub punaseks ja katkendlikuks, kui maastik on nende vahel | uus |
| Kaugete objektide automaatne suurendamine | Väikseim kuju ekraanil (pikslites) | tehtud |
| Laiuse/pikkuse ruudustik | **Kaart ja asukoht → Ruudustik**: laiuse ja pikkuse jooned maapinnal kaamera all, kõrgusest sõltuva ümmargusega sammuga (10° kuni 1'), märgistatud; või **MGRS** kilomeetriruudustik UTM-tsoonis, näidates tsooni ja 100 km ruutu. 2D-kaardi enda ruudustik nagu varem | uus |
| Bullseye ringid | Ringid iga tiimi bullseye ümber 2D-kaardil | uus (ainult 2D) |
| Glissaadi kiht | **Glissaadid**: 3° teed ja ±0,7° täisskaala servad iga salvestuse lähedase rajaraja mõlemas otsas, OurAirportsi mõõdetud lävedest ja kõrgustest (alla laaditud üks kord, hoitud võrguühenduseta), iga meremiili juures märk, nimetatud lennuvälja ja raja järgi | uus |
| Kõrgusepiirangud (laelm ja põrandaalarm) | **Kõrguspiirang**: põrand ja lagi; piirist väljas olevate üksuste sildid muutuvad punaseks ja iga ületamine (alla põranda, üle laega, tagasi sees) on loetletud. Klõps viib sinna ja jälgib üksust | uus |
| Hävitatud objektid hallid, pärast 15 minutit eemaldatud | Elu lõpeb koos jäljega; surnud üksus on üksuste loendis tuhmim | tehtud |
| Nähtav / keelatud omadused | Näidatud vaate **Toor** all; need ei peida midagi | pole veel |
| Drosseli/kangi/pedaalide asendite kuvamine | Gaas ja mootori näidud väljades; juhtimissisendid vaates **Toor** | tehtud (väärtustena) |
| Kommentaarid subtiitritena | **Sõnumid subtiitritena** (Sildid): ACMI Message- ja Comment-sündmused ning mängude vestlus (Chat, Say või Radio sündmused või vestlusveerg), vaate all koos sellega, kes ütles, kuus sekundit | uus |
| Kuupäeva ja UTC-aja kuvamine | Ajajoone kell UTC-ajaga, kui salvestisel on viiteaeg | tehtud |
| Hiire asukoht laiuse/pikkuse, MGRS, bullseye järgi | Valiku kaart (klõps punktil) annab laiuse ja pikkuse kraadides, minutites ja sekundites ning MGRS-i maailma meetrite kõrval; bullseye iga üksuse kohta (väli) | uus |
| Kohandatud logo | Pole ehitatud | ei kehti (brändimine) |
| 3D-mudelid, tundmatu korral lähim | Oma kujude kataloog, lähim vaste, tegelik suurus | tehtud |
| Mitu kokkupuudet (jooned kõigi paaride vahel) | **Lahingujooned**: igast hõlmatud üksusest iga vastaseni seatud vahemikus (1–200 km), igaühel oma kaugus, lähimad 60 paari; mõõdetud paar nagu varem | uus |

## Sildid {#labels}

| Tacview | 3DHeat | Staatus |
|---|---|---|
| Sildid sisse/välja, eraldi valitud ja valimata objektidele | **Sildid** reeglitega **Valitud**, **Õhusõidukid**, **Maismaa**, **Laevad**, **Relvad** ja **TI**: näidatud või mitte, oma väärtused, prioriteet | uus |
| Sildivälja: nimi, kutsung, piloot, kiirused (TAS/CAS/IAS/Mach/GS), kõrgused (ASL/AGL), VS, AOA, AOS, G (vertikaalne, külgsuunaline, pikisuunaline), pöörde kiirus ja raadius, energia, kütus (kaal/maht/voog), kurss/trajektoor, veeremine/tõusunurk, südamerütm | Iga `fields.ts` väärtus: sama loend, arvutatud kus pole salvestatud (hinnangud märgitud ~). Veeremise kiirus ja SpO2 ainult vaate **Toor** kaudu. | tehtud |
| Bullseye asukoht siltides | Väli **Bullseye (peiling / kaugus)** | uus |
| ILS-i kõrvalekalded, lennatud vahemaa | Toorväärtused; lennatud vahemaa statistikas | tehtud (osaliselt) |
| Valimata telemeetria selgitamine | **Hoia silte lahus**, järjestatud iga reegli prioriteedi järgi | tehtud / uus |
| Kõigi maapealsete objektide sildistamine / ainult ohud | Maismaa ja TI reeglid | uus |
| Siltide suurus | **Siltide suurus** (60–250 %) | uus |
| Meetriline / inglise ühikud | Meetriline / inglise | tehtud (kaks eelseadistust, mitte kaheksa) |

## Objekti info ja telemeetria {#object-info-and-telemetry}

| Tacview | 3DHeat | Staatus |
|---|---|---|
| Esmane ja teisene valik | Klõps jälgib ja valib; tõstu-klõps kahele mõõtmiseks; valija **Sihtmärk** | tehtud / uus |
| Kaugus / peiling / nurk / lähenemine kahe objekti vahel | BRAA joon mõõdetud paari vahel; väljad Kaugus, Peiling, Nurk ja Lähenemine jälgitava üksuse kohta | tehtud |
| Suhteline peiling, vaatejoone nurkkiirus | Väljad **Suhteline peiling** (jälgitava üksuse ninast, V/P) ja **Vaatejoone nurkkiirus** (°/s) | uus |
| Telemeetria aknad | Üksuse kaart ja hõljumiskaart | tehtud |
| Toortelemeetria (iga salvestatud omadus, ka tundmatud) | **Toor** üksuse kaardil: iga veerg üksuse real, nagu kirjutatud | uus |
| Aktiivsete objektide loend | **Üksused**: mängijad, TI, lennus relvad; elavad heledamad | tehtud |
| Salvestise omaduste aken (pealkiri, autor, briifing...) | Hoitakse veerus RecordingInfo; näidatud vaates Toor | tehtud (akent pole) |
| Asukohavormingud DMS/MGRS, magnetnord | **Asukoht (laius / pikkus)** DMS-is ja **MGRS** väljad; väli **Magnetkurss**; **Magnetkursid** kirjutab magnetilise kurssi, trajektoori ja peilingu (°M) ning näitab kompassi mõlema põhjaga ja deklinatsiooni – World Magnetic Model 2025 (avalikud kordajad), arvutatud siin üksuse koha ja kuupäeva järgi | uus |

## Graafikud {#charts}

| Tacview | 3DHeat | Staatus |
|---|---|---|
| Ühe objekti graafik, kuni 4 väärtust | **Ajas** (ja graafik Kordus all) | tehtud |
| Kuni 4 objekti korraga | **Võrdlus**: üks väärtus kuni 8 üksuse kohta ühel skaalal | uus |
| Väärtus väärtuse vastu (energia-manööverdusvõimega sarnane) | **Väärtus vs väärtus**: pöördekiirus kiiruse või mis tahes paari vastu, iga üksus on joon, selle praegune punkt märgitud | uus |
| X-telg aja järgi; suum; aja nihutamine graafikult | Hiireratas suumib ajas, topeltklõps lähtestab, klõps viib hetkeni | uus |
| X-telg õhu- või maapealse vahemaa järgi | **Aeg / Õhuvahemaa / Maapealne vahemaa** ajas ja võrdluse graafikutel; suum ja klõps-ja-mine töötavad samamoodi | uus |
| Eelmääratud graafikud (energia, kiirendus...) | Iga väärtuse võib valida (energiakõrgus ja selle muutumise kiirus on väärtused) | tehtud |

## Statistika, lennulogi, sündmused {#statistics-flight-log-events}

| Tacview | 3DHeat | Staatus |
|---|---|---|
| Lennulogi: õhkutõus, maandumine, tulistamine, tabatud, hävitatud, lahkunud alalt | **Statistika** üksuse kohta: elud, tapmised, surmad, laskud, tabamused, tabamismäär, õhkutõusud, maandumised, õhus oldud aeg, max G (ja min), max kiirus, kõrgus ja Mach, vahemaa. Õhkutõusud tulevad TakenOff/Landed sündmustest, OnGround, AGL-ist või hinnanguna (~). | uus |
| Tulemustabeli ja missiooniaruande lisamoodulid | Tiimipõhine kokkuvõte ja enim tapmisi; matši kokkuvõtte enda tulemustabel | uus / tehtud |
| Lennulogi eksport XML/CSV | **Ekspordi CSV** statistikast ja loetletud sündmustest | uus (ainult CSV) |
| Telemeetria eksport CSV-na kiirusega | **Valitud üksuse telemeetria**: iga väärtus, 1–20 sekundis | uus |
| Sündmuste logi, topeltklõps viib sinna ja valib | **Sündmused** loend, filtreeritud liigi ja üksuse järgi; klõps lendab sinna | tehtud |
| Eelmine / järgmine sündmus (Ctrl+←/→) | **Page Up / Page Down** | uus |
| Peatamine sündmusel | **Peata sündmusel** | uus |
| Ajajoone märgid (vabastused, tabamused, hävitamised; valitud objekti oma sinine, järjehoidjad punased) | Tapmised ja surmad tihedusribana, jälgitava üksuse oma sinine, järjehoidjad punased; klõps viib sinna | uus |
| Sündmuse eemaldamine, kill-remove | Pole ehitatud | ei kehti (sündmused on salvestise omad; filtrid peidavad need) |

## Järjehoidjad {#bookmarks}

| Tacview | 3DHeat | Staatus |
|---|---|---|
| Järjehoidja lisamine valikuga ja vaatepunktiga | **Lisa järjehoidja** (B): hetk, vaba kaamera või jälgitav üksus oma vaatega, kauguse ja sihtmärgiga; nimega; hoitakse selles brauseris iga salvestise kohta | uus |
| Järjehoidja eemaldamine | × loendis | uus |
| Järjehoidjad ajajoonel ja logides | Punased märgid; loend | uus |
| Event=Bookmark ACMI-s | Loetletud salvestise märkide all koos tapmiste, surmade ja sõnumitega | uus |
| Kopeeri/kleebi kiirklahv (vaate jagamine) | **Ekspordi / Impordi** järjehoidjad failina; C kopeerib kaamera asendi | uus |

## Esitus {#playback}

| Tacview | 3DHeat | Staatus |
|---|---|---|
| Esita/peata, algusse, kiirus, ajajoone kerimine | Ajajoon | tehtud |
| Kaader kaupa | **,** ja **.** sekund tagasi ja edasi (Shift: kümme) | uus |
| Tagurpidi esitus | **◀** ajajoonel, **J** (**L** edasi; sama klahv uuesti peatab): mängib lõpust alguse poole valitud kiirusega, kordab või peatub alguses | uus |
| Ajahüppe dialoog | Ajajoon ja sündmuste loend | tehtud |
| Ühe objekti ajanihe (kummitus) | **Ajanihe ja kärpimine**: nihuta ühe üksuse lendu või kogu salvestist nii mitme sekundi võrra; **Joonda salvestised** toob mitu salvestist algama koos ja mängib need kohe (kaks lendu eri päevadel kõrvuti). Salvestis ehitatakse uuesti, nii et jäljed, sündmused, graafikud ja statistika järgivad | uus |
| Kärpimine enne/pärast | **Alates nüüd / Kuni nüüd / Lõika sellele vahemikule** (tagasivõtmine säilitab nihked), seejärel **Ekspordi CSV** (laadib tagasi 3DHeati) või **Ekspordi ACMI** (Tacview 2.2 tekst, Maale paigutatud salvestise jaoks) | uus |

## Maastik ja kaart {#terrain-and-map}

| Tacview | 3DHeat | Staatus |
|---|---|---|
| Tegelik maastik, oma kõrgus ja tekstuurid | Tasemed (mängu enda kaart 3D-mudelina), maailma taustaplaatid | tehtud |
| Lame / tühi / kõrge kontrastsusega maastikurežiimid | [Taseme välimus](level-appearance.md): maapinna reljeef, pind ja ehitised nähtavad või mitte | tehtud (mitte samad režiimid) |
| 2D taktikaline kaart (Tacviewil pole; on satelliitvaade) | **2D-kaart**: nurk või terve vaade, sümbolid liigi ja tiimi järgi (täidetud mängijad, kontuuriga TI) pööratud oma suunas, jäljed, nimed, mõõtkava, vahemiku ringid jälgitava üksuse ümber, bullseye ringid, 3D-kaamera asukoht, hiljutised surmad; lohista, kerimine, klõps jälgimiseks (M) | uus |
| Staatilised objektid (lennuväljad, rajad, waypointid, alad, KML) | Mõõdetud rajad (OurAirports) maailma taustal ja nende glissaadid; GPX-i waypointid ja KML-i märgid laaditakse seisvate objektidena; [Taktikatahvel](tactics-board.md) joonistab alad ja marsruudid | uus |

## Import, eksport, salvestamine {#import-export-recording}

| Tacview | 3DHeat | Staatus |
|---|---|---|
| ACMI tekst ja zip | [Tacview ACMI](tacview-acmi.md) | tehtud |
| GPX, KML, CSV, NMEA, IGC, FIT jne | **GPX** (rajad, marsruudid, waypointid; Garmini südamerütm, kadents, võimsus, temperatuur), **KML/KMZ** (gx:Track, LineString, Point), **NMEA 0183** (RMC ja GGA iga kõneleja puhul, kontrollsummad kontrollitud, üle keskööde), **IGC** (B-kirjed, kuupäev, piloot ja purilennuk), **FIT** (record-sõnumid, pakitud ajatemplid) – igaüks paigutatakse laiuse ja pikkuse järgi tasapinnale raja keskel, nii et maailma taust joondub; suund, kalle ja kiirus failist või punktist punkti. CSV ja Parquet nagu varem | uus (DIS ei kehti: see on elav võrguprotokoll) |
| Omad salvestajad (DCS, BMS, IL-2, MSFS...) | 3DHeati enda konverterid (War Thunder, CS2, Squad, Arma ja teised) | tehtud (oma) |
| Reaalajas telemeetria TCP kaudu, ADS-B | Pole ehitatud | ei kehti (kordused pärast matši) |
| Sünkroonitud heli/video | **Heli ja video**: kohalik fail mängib, peatub, kerib ja muudab kiirust koos ajajoonega valitud algusest (**Algab nüüd**, ±0,1 s); video muudetava suurusega paneelis vaate kohal või pilt-pildis. Fail jääb brauserisse | uus |
| Videoeksport | [Kaamerateekond ja video](camera-path-and-video.md) | tehtud |

## Muu {#other}

| Tacview | 3DHeat | Staatus |
|---|---|---|
| Lua lisamoodulid | Pole ehitatud | ei kehti (avatud lähtekood: muuda vaatajat ise) |
| Võrgus järelkokkuvõte (jagatud seanss) | Pole ehitatud | ei kehti (Tacview oma on hostitud seanss, mis hoiab kõiki ühel esitusjoonel. 3DHeatil pole serverit ja salvestised jäävad vaataja masinasse; isegi otseühendus vajab signaaliserverit. Järelkokkuvõte jagatakse failidena: kärbitud salvestis (Ekspordi ACMI või CSV) ja järjehoidjate fail, mis avanevad samadel hetkedel ja vaadetes) |
| Instruktori kaugjuhtimine | Pole ehitatud | ei kehti (juhib töötavat simulaatorit) |
| Objektide muutmine (lisa, muuda, eemalda objekte) | [Taktikatahvel](tactics-board.md) kavandatud objektidele; salvestised on ainult lugemiseks | ei kehti |
| Keeled | 40 keelt | tehtud |
| Salvestiste autentimine | Pole ehitatud | ei kehti |

## Arendajatele: ACMI 2.2 omadused {#for-developers-acmi-22-properties}

Loeb `data/acmi.ts`; arvulised omadused muutuvad arvuveergudeks, tekstilised kategooriaveergudeks. Kõik on näidatud üksuse kaardi vaates **Toor** all. Need loetakse mingil eesmärgil:

| Omadused | Kasutus |
|---|---|
| T (kõik neli vormi), Name, Type, Pilot, Group, Country, Coalition, Color, CallSign | Asukoht, asend, kuju, üksuse nimi, tiim |
| IAS, CAS, TAS, Mach, AOA, AOS, AGL, HDG, HDM, OnGround | Väljad, graafikud, HUD, õhkutõusu ja maandumise tuvastus |
| VerticalGForce, LongitudinalGForce, LateralGForce | G-väljad |
| Throttle(2), Afterburner, EngineRPM(2), NR, AirBrakes, Flaps, LandingGear, Tailhook | Väljad |
| FuelWeight..9, FuelVolume..9, FuelFlowWeight..8 | Kütusevälja, summeeritud paakide üle |
| RadarMode, RadarAzimuth, RadarElevation, RadarRoll, RadarRange, RadarHorizontalBeamwidth, RadarVerticalBeamwidth, RadarRangeGateAzimuth/Elevation/Min/Max/HorizontalBeamwidth/VerticalBeamwidth | Radarikoonused ja kaugusvärav |
| LockedTarget..9, LockedTargetMode, LockedTargetAzimuth/Elevation/Range, FocusedTarget | Haaramisjooned |
| EngagementMode(2), EngagementRange(2), VerticalEngagementRange(2) | Tulistamiskuplid |
| QNH, AltimeterSetting, WindSpeed, WindDirection, HeartRate | Väljad |
| Health | Väli |
| Sündmused: Destroyed, TakenOff, Landed, Bookmark, Message, Comment, LeftArea, Timeout | Sündmuste loend, statistika (surmad, õhkutõusud, maandumised), järjehoidjad; Message ja Comment subtiitritena |
| PilotHeadYaw, PilotHeadPitch | Piloodi vaatejoon |
| Tüübimärk Bullseye (Navaid+Static+Bullseye) | Bullseye väli ja kaardi ringid |
| Kõik muu (PilotHeadRoll, juhtimised, pinnad, ILS-i kõrvalekalded, SpO2, ENL, Label, Debug, Importance, Slot, Visible, Disabled, Radius, suurused...) | Näidatud nii nagu kirjutatud vaate **Toor** all |

Radari- ja haaramisnurki võetakse üksuse enda telgede suhtes: asimuut paremale, elevatsioon üles, veeremine paremale tiivale alla. ACMI spetsifikatsioon ütleb, et need on lennuki suhtes, aga ei ütle, mis suund on positiivne; see lugemine järgib selle teisendust (kursi pööre päripäeva, tõus üles, veeremine paremale).
