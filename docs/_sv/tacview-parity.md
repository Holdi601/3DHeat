---
title: "Tacview-paritet"
parent: "Matchrepris"
grand_parent: "Repris"
nav_order: 1
lang: "sv"
source: "tacview-parity.md"
source_hash: "4275603255c2"
translated: true
outdated: false
---

# Tacview-paritet

Tacview är ett populärt program för att titta på flyginspelningar. Om du känner till det visar den här sidan var var och en av dess verktyg finns i 3DHeat.

Den listar alla funktioner i Tacview 1.9 (dess handbok, dess textsträngar för användargränssnittet och filformatet ACMI 2.2) och var 3DHeats [matchrepris](match-replay.md) står jämfört med dem. Målet: det Tacview kan göra med en repris och dess data, ska 3DHeat kunna göra också.

**Status:**
- **klart**: finns redan i 3DHeat.
- **nytt**: byggt för att matcha en Tacview-funktion.
- **ej gjort än**: gäller, men inte byggt.
- **gäller inte**: gäller inte här, med skälet.

Så hittar du funktionerna: fliken **Match**, **Figurrepris** (eller **Figuröverlägg** i fliken Värmekarta), i sidofältets avsnitt **Repris**, **Enheter**, **Händelser**, **Bokmärken**, **Taktisk visning**, **Statistik**, **Tidsförskjutning och beskärning**, **Karta och position**, **Ljud och video** och **Etiketter**. Se [Matchrepris](match-replay.md).

## Kameror {#cameras}

| Tacview | 3DHeat | Status |
|---|---|---|
| Cockpitvy (F5), horisonten rullar med flygplanet | **Cockpit**: ut från enheten längs dess attityd, som rörelsemodellen har den. Enhetens egen figur klipps bort. Dra för att titta omkring; **Titta framåt igen** återställer. | nytt |
| HUD i cockpitvyn (val av IAS/CAS/TAS) | **Head-up-display** (H): horisont och nicklådder för den faktiska vyn, flygbanemarkör, kursband, IAS, höjd, TAS, Mach, G, angreppsvinkel, vertikal hastighet, AGL | nytt |
| 3D-cockpitinstrument, huvudspårning för piloten (PilotHead*), TrackIR | Inga cockpitmodeller; huvudvinklarna visas i enhetskortets vy **Rå** | gäller inte (inga cockpitmodeller; huvudspårning är maskinvara för levande flygning) |
| Externvy (F6): kretsa runt det primära objektet | **Jakt** (vänder med enheten) och **Kretsa** (behåller sin egen riktning) | klart |
| Jaktkamera, ”Titta på mål” (padlock) | **Padlock**: från cockpiten, hållen på målet | nytt |
| Jaktkamera, ”Centrerad” / ”Titta framåt” | **Mål**: bakom enheten på linjen från målet, med blicken förbi den mot målet. **Fast** vid azimut 0 tittar framåt från en plats framför. | nytt |
| Byt primärt och sekundärt objekt | **Byt** bredvid målet | nytt |
| Satellitvy (F7), ortografisk vy rakt ned | **Satellit**: rakt ned på enheten, norr upp; dra för att vrida. 2D-kartan är den ortografiska planvyn. | nytt |
| Fri kamera (F8), W/A/S/D, E/C | Den fria flygkameran (W/A/S/D, Mellanslag/Q, Shift/Alt) | klart |
| Tilläggskamera Head-On; externkamera fixerad på objektet | **Fast**: en plats runt enheten som vrids och rullar med den; dra för att flytta den (bakom, en vingspets, rakt framifrån) | nytt |
| Tilläggskamera Lock Camera (fryser positionen) | Sluta följa (Esc): kameran stannar där den var | klart |
| Strategisk vy (zooma ut till hela jorden) | [Världsbakgrund](world-backdrop.md) och 2D-kartans ram för hela inspelningen | klart |
| Inställning för synfält | **Kamera & scen** FOV | klart |
| Byta vy med tangenter | **V** nästa vy, **Shift+V** tillbaka | nytt |

## 3D-vy och visningsalternativ {#d-view-and-display-options}

| Tacview | 3DHeat | Status |
|---|---|---|
| Bandspår, reglage för längd | Spår (sekunder) i Lagvisaren | klart |
| Förväntat spår (bana framåt) | **Bana framåt**: var enheten verkligen tar vägen de närmaste sekunderna | nytt |
| Höjdlinjer / väggar under objekt | **Lodlinjer** | klart (linjer; väggar inte byggda) |
| Vektorer för valt objekt: kurs (prickad), färdriktning (heldragen), lyft | **Hastighetsvektorer** (färdriktning och fart så många sekunder, med ett tips) och **Nos- och lyftlinjer** (nos streckad, lyft kort och mörk) | nytt |
| Pilotens siktlinje | **Pilotens siktlinje**: en streckad cyanlinje längs PilotHeadYaw/PilotHeadPitch (eller en kolumn HeadYaw, ViewYaw eller LookYaw) mot enhetens axlar | nytt |
| Dödliga kupoler för SAM/AAA (EngagementRange, VerticalEngagementRange, EngagementMode, ”2”-tvillingarna) | **Insatszoner**: kupoler, äggformade där den vertikala räckvidden skiljer sig, av medan EngagementMode är 0 | nytt |
| Radarlåsningar (LockedTarget..9) med etiketter | **Låsningar**: röda linjer till varje låst objekt; streckad bärnsten mot FocusedTarget; längs LockedTargetAzimuth/Elevation/Range där inget objekt är namngett. **Låsetiketter**: målets namn och avstånd på varje låslinje | nytt |
| Radarkon (RadarMode, Azimuth, Elevation, Roll, Range, strålbredder) och avståndsport | **Radarkoner**: kant och mittring av strålen, vriden efter azimut, elevation och roll mot enheten; avståndsporten som två gula kanter. Utan strålbredder bara strålens axel. | nytt |
| Siktlinje mellan de två valda objekten (grön / röd prickad när terrängen blockerar) | Linjen för det uppmätta paret blir röd och streckad när terrängen ligger mellan dem | nytt |
| Förstora avlägsna objekt automatiskt | Minsta figur på skärmen (pixlar) | klart |
| Latitud- och longitudnät | **Karta och position → Rutnät**: latitud- och longitudlinjer på marken under kameran, med ett rundat avstånd för höjden (10° ner till 1'), märkta; eller **MGRS**-kilometernätet för UTM-zonen, med zonen och 100 km-rutan visade. 2D-kartans eget rutnät som förut | nytt |
| Bullseye-ringar | Ringar runt varje lags bullseye på 2D-kartan | nytt (bara 2D) |
| Glidbanepålägg | **Glidbanor**: 3°-banor med kanter för ±0,7° fullskala vid båda ändar av varje landningsbana nära inspelningen, från OurAirports uppmätta trösklar och höjder (hämtas en gång och finns offline), en markering vid varje nautisk mil, namngivna efter flygplats och landningsbana | nytt |
| Höjdbegränsningar (larm för tak och golv) | **Höjdbegränsning**: ett golv och ett tak; etiketter för enheter utanför blir röda, och varje passage (under golvet, över taket, tillbaka inom) listas – ett klick går dit och följer enheten | nytt |
| Förstörda objekt grå, borttagna efter 15 min | Liv slutar med sin spårlinje; en död enhet dämpas i enhetslistan | klart |
| Egenskaperna Visible / Disabled | Visas i **Rå**; inget döljs av dem | ej gjort än |
| Visa styrspakens, gasreglagets och pedalernas lägen | Gas- och motorvärden i fält; styrsignaler i **Rå** | klart (som värden) |
| Kommentarer som undertexter | **Meddelanden som undertexter** (Etiketter): ACMI-händelserna Message och Comment, och chatt från valfritt spel (händelserna Chat, Say eller Radio, eller en chattkolumn), längst ned i vyn med vem som sa det, i sex sekunder | nytt |
| Visning av datum och UTC-tid | Tidslinjens klocka med UTC där inspelningen har en referenstid | klart |
| Musens position i latitud/longitud, MGRS, bullseye | Platskortet (klicka på en punkt) ger latitud/longitud i grader, minuter och sekunder och MGRS bredvid världsmetrarna; bullseye per enhet (fält) | nytt |
| Egen logotyp | Inte byggd | gäller inte (varumärke) |
| 3D-modeller, närmaste när okänd | Egen figurkatalog, närmaste motsvarighet, verklig storlek | klart |
| Flera insatser (linjer mellan alla par) | **Insatslinjer**: från varje enhet i omfånget till varje motståndare inom det inställda avståndet (1–200 km), var och en med sitt avstånd, de 60 närmaste paren; det uppmätta paret som förut | nytt |

## Etiketter {#labels}

| Tacview | 3DHeat | Status |
|---|---|---|
| Etiketter på/av, var för sig för valda och ovalda objekt | **Etiketter** med regler för **Valda**, **Flygplan**, **Mark**, **Fartyg**, **Vapen** och **AI**: visade eller inte, egna värden, prioritet | nytt |
| Etikettfält: namn, anropssignal, pilot, hastigheter (TAS/CAS/IAS/Mach/GS), höjder (ASL/AGL), VS, AOA, AOS, G (vertikal, sidled, längs), vändhastighet och radie, energi, bränsle i vikt/volym/flöde, kurs/spår, rullning/nick, pulsfrekvens | Varje värde i `fields.ts`: samma lista, uträknat där det inte spelats in (uppskattningar markerade med ~). Rullningshastighet och SpO2 bara via Rå. | klart |
| Bullseye-position i etiketter | Fältet **Bullseye (bäring / avstånd)** | nytt |
| ILS-avvikelser, flugen sträcka | Råvärden; flugen sträcka i statistiken | klart (delvis) |
| Rensa bort ovalda telemetri | **Håll isär etiketterna**, sorterade efter varje regels prioritet | klart / nytt |
| Märk alla markobjekt / bara hot | Reglerna för Mark och AI | nytt |
| Etikettskala | **Etikettstorlek** (60–250 %) | nytt |
| Metriska / brittiska enheter | Metriska / brittiska | klart (två förval, inte åtta) |

## Objektinfo och telemetri {#object-info-and-telemetry}

| Tacview | 3DHeat | Status |
|---|---|---|
| Val av primärt och sekundärt objekt | Klick följer och väljer; skift-klicka två för att mäta; väljaren **Mål** | klart / nytt |
| Avstånd / bäring / aspekt / närmande mellan två objekt | BRAA-linjen för det uppmätta paret; fälten Range, Bearing, Aspect och Closure från den följda enheten | klart |
| Relativ bäring, siktlinjens vinkelhastighet | Fälten **Relativ bäring** (från den följda enhetens nos, V/H) och **Siktlinjens vinkelhastighet** (°/s) | nytt |
| Telemetrifönster | Enhetskortet och svävkortet | klart |
| Rå telemetri (varje inspelad egenskap, även okända) | **Rå** i enhetskortet: varje kolumn på enhetens rad som den skrevs | nytt |
| Lista över aktiva objekt | **Enheter**: spelare, AI, vapen i flygning, levande ljusa | klart |
| Fönster med inspelningens egenskaper (titel, författare, briefing ...) | Sparas som kolumnen RecordingInfo; visas i Rå | klart (inget fönster) |
| Positionsformat DMS/MGRS, magnetisk nord | **Position (lat / long)** i DMS och fälten **MGRS**; ett fält **Magnetisk kurs**; **Magnetiska kurser** skriver kurs, spår och bäring magnetiska (°M) och visar en kompass med båda norrarna och variationen – World Magnetic Model 2025 (koefficienter i public domain), uträknad här för enhetens plats och datum | nytt |

## Diagram {#charts}

| Tacview | 3DHeat | Status |
|---|---|---|
| Diagram för ett objekt, upp till 4 värden | **Över tid** (och diagrammet under Repris) | klart |
| Rita upp till 4 objekt samtidigt | **Jämför**: ett värde för upp till 8 enheter på en skala | nytt |
| Värde mot värde (energi-manövrerbarhet) | **Värde mot värde**: vändhastighet mot fart eller valfritt par, varje enhet en linje, dess aktuella punkt markerad | nytt |
| X-axel efter tid; zooma; flytta tiden från diagrammet | Hjulet zoomar i tid, dubbelklick återställer, klick går till ögonblicket | nytt |
| X-axel efter luft- eller markavstånd | **Tid / Luftavstånd / Markavstånd** i tids- och jämförelsediagrammen; zoom och klicka-för-att-gå fungerar likadant | nytt |
| Färdiga diagram (energi, acceleration ...) | Vilket värde som helst kan väljas (energihöjd och dess ändringshastighet är värden) | klart |

## Statistik, flygloggen, händelser {#statistics-flight-log-events}

| Tacview | 3DHeat | Status |
|---|---|---|
| Flygloggen: startade, landade, avfyrade, träffad av, förstörd av, lämnade området | **Statistik** per enhet: liv, nedskjutningar, förluster, skott, träffar, träffkvot, starter, landningar, tid i luften, högsta G (och lägsta), högsta fart, höjd och Mach, sträcka. Starter kommer från händelserna TakenOff/Landed, OnGround, AGL eller en uppskattning markerad med ~. | nytt |
| Tilläggen för resultattavla och uppdragsrapport | Sammanfattning per lag och flest nedskjutningar; matchsammanfattningens egen resultattavla | nytt / klart |
| Exportera flygloggen som XML/CSV | **Exportera CSV** av statistiken, och av händelserna som de listas | nytt (bara CSV) |
| Exportera telemetri som CSV i en takt | **Telemetri för den valda enheten**: varje värde, 1–20 per sekund | nytt |
| Händelselogg, dubbelklicka för att gå dit och välja | Listan **Händelser**, filtrerad efter sort och enhet; ett klick flyger dit | klart |
| Föregående / nästa händelse (Ctrl+←/→) | **Page Up / Page Down** | nytt |
| Pausa vid händelse | **Pausa vid händelse** | nytt |
| Tidsmarkörer på tidslinjen (släpp, träffar, förstörelser; den valda enhetens i blått; bokmärken röda) | Nedskjutningar och förluster som en täthetsremsa, den följda enhetens i blått, bokmärken röda; klicka för att gå dit | nytt |
| Ta bort en händelse, ta bort vid nedskjutning | Inte byggt | gäller inte (händelserna är inspelningens; filter döljer dem) |

## Bokmärken {#bookmarks}

| Tacview | 3DHeat | Status |
|---|---|---|
| Lägg in bokmärke med val och synpunkt | **Lägg till bokmärke** (B): ögonblicket, den fria kameran eller den följda enheten med sin vy, avstånd och mål; namngivet; sparas i den här webbläsaren per inspelning | nytt |
| Ta bort bokmärke | × i listan | nytt |
| Bokmärken på tidslinjen och i loggarna | Röda markeringar; listan | nytt |
| Event=Bookmark i ACMI | Listas bland inspelningens markeringar, tillsammans med nedskjutningar, förluster och meddelanden | nytt |
| Genväg för kopiera/klistra in (dela en vy) | **Exportera / Importera** bokmärkena som en fil; C kopierar kamerans läge | nytt |

## Uppspelning {#playback}

| Tacview | 3DHeat | Status |
|---|---|---|
| Spela/pausa, till början, hastighet, dra på tidslinjen | Tidslinjen | klart |
| Bildruta för bildruta | **,** och **.** en sekund bakåt och framåt (Shift: tio) | nytt |
| Uppspelning baklänges | **◀** på tidslinjen, **J** (**L** framåt; samma tangent igen pausar): spelar från slutet mot början i vald hastighet, med upprepning eller stopp vid början | nytt |
| Dialogen för hopp i tiden | Tidslinjen och händelselistan | klart |
| Tidsförskjutning av ett objekt (spöke) | **Tidsförskjutning och beskärning**: flytta en enhets flygning, eller en hel inspelning, så många sekunder; **Ställ inspelningarna i linje** flyttar flera inspelningar så att de börjar tillsammans och spelar dem samtidigt (två flygpass på olika dagar bredvid varandra). Inspelningen byggs om, så spår, händelser, diagram och statistik följer med | nytt |
| Beskär före/efter | **Från nu / Till nu / Klipp till detta intervall** (ångra behåller förskjutningarna), sedan **Exportera CSV** (läses in i 3DHeat igen) eller **Exportera ACMI** (Tacview 2.2-text, för en inspelning placerad på jorden) | nytt |

## Terräng och karta {#terrain-and-map}

| Tacview | 3DHeat | Status |
|---|---|---|
| Verklig terräng, egen höjd och texturer | Banor (spelets egen karta som 3D-modell), bakgrundsrutor för världen | klart |
| Platt / tom / högkontrast-terräng | [Banans utseende](level-appearance.md): markrelief, yta och strukturer visade eller inte | klart (inte samma lägen) |
| 2D-taktisk karta (Tacview har ingen: satellitvy) | **2D-karta**: hörn- eller helvy, symboler efter sort och lag (ifyllda spelare, konturerade AI) vridna efter kurs, spår, namn, skalstapel, avståndsringar runt den följda enheten, bullseye-ringar, 3D-kamerans plats, senaste dödsfall; dra, hjul, klicka för att följa (M) | nytt |
| Statiska objekt (flygplatser, landningsbanor, vägpunkter, områden, KML) | Uppmätta landningsbanor (OurAirports) i världsbakgrunden och deras glidbanor; GPX-vägpunkter och KML-märken läses in som stående objekt; [Taktiktavlan](tactics-board.md) ritar områden och rutter | nytt |

## Import, export, inspelning {#import-export-recording}

| Tacview | 3DHeat | Status |
|---|---|---|
| ACMI-text och zip | [Tacview ACMI](tacview-acmi.md) | klart |
| GPX, KML, CSV, NMEA, IGC, FIT, DIS ... | **GPX** (spår, rutter, vägpunkter; Garmins pulsfrekvens, kadens, effekt, temperatur), **KML/KMZ** (gx:Track, LineString, Point), **NMEA 0183** (RMC och GGA från valfri talare, kontrollsummor kontrolleras, över midnatt), **IGC** (B-poster, datum, pilot och segelflygplan), **FIT** (record-meddelanden, komprimerade tidsstämplar) – var och en placerad efter latitud och longitud på planet vid spårens mitt, så att världsbakgrunden stämmer; kurs, nick och fart från filen eller från position till position. CSV och Parquet som förut | nytt (DIS gäller inte: ett protokoll för live-nätverk) |
| Egna inspelare (DCS, BMS, IL-2, MSFS ...) | 3DHeats egna konverterare (War Thunder, CS2, Squad, Arma och andra) | klart (egna) |
| Telemetri i realtid över TCP, ADS-B | Inte byggt | gäller inte (repriser efter matchen) |
| Synkroniserat ljud/video | **Ljud och video**: en lokal fil spelas, pausas, söks och ändrar hastighet med tidslinjen från en fastställd start (**Börjar nu**, ±0,1 s); en video i en storleksändringsbar panel över vyn, eller bild-i-bild. Filen stannar i webbläsaren | nytt |
| Videoexport | [Kamerabana och video](camera-path-and-video.md) | klart |

## Annat {#other}

| Tacview | 3DHeat | Status |
|---|---|---|
| Lua-tillägg | Inte byggt | gäller inte (öppen källkod: ändra visaren själv) |
| Online-genomgång (delad session) | Inte byggt | gäller inte (Tacviews är en hostad session som håller alla på samma uppspelningshuvud. 3DHeat har ingen server och håller inspelningarna på visarens dator, och även en direkt länk mellan datorer behöver en signalserver. En genomgång delas som filer: den beskurna inspelningen (Exportera ACMI eller CSV) och bokmärkesfilen, som öppnas vid samma ögonblick och vyer) |
| Instruktörens fjärrstyrning | Inte byggt | gäller inte (styr en körande simulator) |
| Redigering av objekt (lägga till, ändra, ta bort objekt) | [Taktiktavlan](tactics-board.md) för planerade objekt; inspelningar är skrivskyddade | gäller inte |
| Språk | 40 språk | klart |
| Autentisering av inspelningar | Inte byggt | gäller inte |

## För utvecklare: ACMI 2.2-egenskaper {#for-developers-acmi-22-properties}

Läses av `data/acmi.ts`; numeriska egenskaper blir talkolumner, textegenskaper kategorikolumner. Alla visas under **Rå** i enhetskortet. De läses för ett syfte:

| Egenskaper | Används till |
|---|---|
| T (alla fyra former), Name, Type, Pilot, Group, Country, Coalition, Color, CallSign | Position, attityd, figur, enhetens namn, lag |
| IAS, CAS, TAS, Mach, AOA, AOS, AGL, HDG, HDM, OnGround | Fält, diagram, HUD, identifiering av start och landning |
| VerticalGForce, LongitudinalGForce, LateralGForce | G-fält |
| Throttle(2), Afterburner, EngineRPM(2), NR, AirBrakes, Flaps, LandingGear, Tailhook | Fält |
| FuelWeight..9, FuelVolume..9, FuelFlowWeight..8 | Bränslefält, summerade över tankarna |
| RadarMode, RadarAzimuth, RadarElevation, RadarRoll, RadarRange, RadarHorizontalBeamwidth, RadarVerticalBeamwidth, RadarRangeGateAzimuth/Elevation/Min/Max/HorizontalBeamwidth/VerticalBeamwidth | Radarkoner och avståndsport |
| LockedTarget..9, LockedTargetMode, LockedTargetAzimuth/Elevation/Range, FocusedTarget | Låslinjer |
| EngagementMode(2), EngagementRange(2), VerticalEngagementRange(2) | Insatskupoler |
| QNH, AltimeterSetting, WindSpeed, WindDirection, HeartRate | Fält |
| Health | Fält |
| Händelser: Destroyed, TakenOff, Landed, Bookmark, Message, Comment, LeftArea, Timeout | Händelselistan, statistik (dödsfall, starter, landningar), bokmärken; Message och Comment som undertexter |
| PilotHeadYaw, PilotHeadPitch | Pilotens siktlinje |
| Typmärke Bullseye (Navaid+Static+Bullseye) | Bullseye-fältet och kartringarna |
| Allt annat (PilotHeadRoll, styrsignaler, ytor, ILS-avvikelser, SpO2, ENL, Label, Debug, Importance, Slot, Visible, Disabled, Radius, storlekar ...) | Visas som skrivet under **Rå** |

Radar- och låsvinklar räknas mot enhetens egna axlar: azimut åt höger, elevation uppåt, roll höger vinge neråt. ACMI-specifikationen säger att de är relativa till flygplanet men inte vilket håll som är positivt; den här tolkningen följer dess transform (gir medsols, nick uppåt, roll höger).
