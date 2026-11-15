---
title: "Tacview-paritet"
parent: "Kamp-replay"
grand_parent: "Replay"
nav_order: 1
lang: "da"
source: "tacview-parity.md"
source_hash: "4275603255c2"
translated: true
outdated: false
---

# Tacview-paritet

Tacview er et populært program til at se flyoptagelser. Hvis du kender det, viser denne side, hvor hvert af dets værktøjer findes i 3DHeat.

Den lister alle funktioner i Tacview 1.9 (dens manual, dens strengtabel til brugerfladen og filformatet ACMI 2.2) og hvor [kamp-replayet](match-replay.md) i 3DHeat står i forhold til dem. Målet: det Tacview kan gøre med et replay og dets data, kan 3DHeat også gøre.

**Status:**
- **gjort**: findes allerede i 3DHeat.
- **ny**: bygget for at svare til en Tacview-funktion.
- **ikke endnu**: gælder, men er ikke bygget.
- **gælder ikke**: gælder ikke her, med grunden.

Hvor funktionerne findes: fanen **Match**, **Figur-replay** (eller **Figuroverlejring** i fanen Varmekort), i sidepanelets afsnit **Replay**, **Enheder**, **Hændelser**, **Bogmærker**, **Taktisk visning**, **Statistik**, **Tidsforskydning og beskæring**, **Kort og position**, **Lyd og video** og **Etiketter**. Se [Kamp-replay](match-replay.md).

## Kameraer {#cameras}

| Tacview | 3DHeat | Status |
|---|---|---|
| Cockpitvisning (F5), horisonten drejer med flyet | **Cockpit**: ud fra enheden langs dens holdning, som bevægelsesmodellen har den. Enhedens egen figur klippes væk. Træk for at kigge rundt; **Se fremad igen** nulstiller. | ny |
| HUD i cockpitvisningen (valg af IAS/CAS/TAS) | **Head-up-display** (H): horisont og tonehjul for den aktuelle visning, flyvebane-markør, kurs-bånd, IAS, højde, TAS, Mach, G, angrebsvinkel, lodret hastighed, AGL | ny |
| 3D-cockpitinstrumenter, pilothovedets sporing (PilotHead*), TrackIR | Ingen cockpitmodeller; hovedvinkler vises i enhedskortets visning **Rå** | gælder ikke (ingen cockpitmodeller; hovedsporing er udstyr til live flyvning) |
| Ekstern visning (F6): kredse om det primære objekt | **Jagt** (drejer med enheden) og **Kredsløb** (beholder sin egen retning) | gjort |
| Dogfight-kamera, "Kig på mål" (padlock) | **Padlock**: fra cockpittet, fastholdt på målet | ny |
| Dogfight-kamera, "Centreret" / "Kig fremad" | **Mål**: bag enheden på linjen fra målet, kigger forbi den på målet. **Fast** ved azimut 0 kigger fremad fra foran. | ny |
| Byt primær og sekundær | **Byt** ved siden af målet | ny |
| Satellitvisning (F7), ortografisk set oppefra | **Satellit**: lige ned på enheden, nord opad; træk for at dreje. 2D-kortet er den ortografiske plan. | ny |
| Frit kamera (F8), W/A/S/D, E/C | Det frie flykamera (W/A/S/D, Mellemrum/Q, Shift/Alt) | gjort |
| Tilføjelsen Head-On-kamera; ekstern kamera fast på objektet | **Fast**: et sted omkring enheden, der drejer og rulles med den; træk for at flytte det (bagved, ved en vingespids, forfra) | ny |
| Tilføjelsen Lock Camera (fryser positionen) | Stop med at følge (Esc): kameraet bliver, hvor det var | gjort |
| Strategisk visning (zoom ud til hele Jorden) | [Verdensbaggrund](world-backdrop.md) og 2D-kortets ramme over hele optagelsen | gjort |
| Indstilling for synsfelt | **Kamera og scene** FOV | gjort |
| Skift visninger med taster | **V** næste visning, **Shift+V** tilbage | ny |

## 3D-visning og visningsindstillinger {#d-view-and-display-options}

| Tacview | 3DHeat | Status |
|---|---|---|
| Spor-striber, skyder for længde | Spor (sekunder) i holdfremviseren | gjort |
| Forventningsspor (vej forude) | **Vej forude**: hvor enheden virkelig kører de næste sekunder | ny |
| Højdelinjer / vægge under objekter | **Lodlinjer** | gjort (linjer; vægge ikke bygget) |
| Vektorer for det valgte objekt: retning (punkteret), kurs (fuld), løft | **Hastighedsvektorer** (kurs og fart i så mange sekunder, med et tip) og **Næse- og løftelinjer** (næsen stiplet, løftet kort og mørkt) | ny |
| Pilotens sigtelinje | **Pilotens sigtelinje**: en stiplet cyan linje langs PilotHeadYaw/PilotHeadPitch (eller en HeadYaw-, ViewYaw- eller LookYaw-kolonne) mod enhedens akser | ny |
| SAM/AAA-kuglerne for dødelig rækkevidde (EngagementRange, VerticalEngagementRange, EngagementMode, "2"-tvillingerne) | **Indsatszoner**: kupler, ovoide hvor den lodrette rækkevidde er forskellig, slukket mens EngagementMode er 0 | ny |
| Radarlåsninger (LockedTarget..9) med etiketter | **Låsninger**: røde linjer til hvert låst objekt; stiplet gul til FocusedTarget; langs LockedTargetAzimuth/Elevation/Range, hvor intet objekt er navngivet. **Låseetiketter**: målets navn og afstand på hver låselinje | ny |
| Radarkegle (RadarMode, Azimuth, Elevation, Roll, Range, strålebredder) og rækkeviddeport | **Radarkegler**: kant og midtring af strålen, drejet efter azimut, elevation og roll mod enheden; rækkeviddeporten som to gule kanter. Uden strålebredder kun strålens akse. | ny |
| Sigtelinje mellem de to valgte objekter (grøn / rød stiplet når terræn blokerer) | Det målte parrets linje bliver rød og stiplet, når terrænet står mellem dem | ny |
| Automatisk forstørrelse af fjerne objekter | Mindste figur på skærmen (pixels) | gjort |
| Gitter for breddegrad/længdegrad | **Kort og position → Gitter**: breddegrads- og længdegradslinjer på jorden under kameraet, med en rund afstand for højden (10° ned til 1'), navngivet; eller **MGRS**-kilometergitteret for UTM-zonen, med zonen og 100 km-kvadratet vist. 2D-kortets eget gitter som før | ny |
| Bullseye-ringe | Ringe om hvert holds bullseye på 2D-kortet | ny (kun 2D) |
| Glidebane-overlejring | **Glidebaner**: 3°-baner med ±0,7°-kanterne i fuld skala ud fra begge ender af hver bane nær optagelsen, ud fra de opmålte tærskler og højder fra OurAirports (hentet én gang, gemt offline), en streg for hver sømil, navngivet efter lufthavn og bane | ny |
| Højdebegrænsninger (loft-/gulvalarm) | **Højdebegrænsning**: et gulv og et loft; etiketter for enheder udenfor bliver røde, og hver passage (under gulvet, over loftet, tilbage inden for) står på listen - et klik går derhen og følger enheden | ny |
| Ødelagte objekter gråt, fjernet efter 15 min | Liv slutter med deres spor; en død enhed bliver dæmpet i enhedslisten | gjort |
| Egenskaberne Visible / Disabled | Vises i **Rå**; intet skjules af dem | ikke endnu |
| Vis stick-, gas- og pedalpositioner | Gas og motorværdier i felter; styreinput i **Rå** | gjort (som værdier) |
| Kommentarer som undertekster | **Beskeder som undertekster** (Etiketter): ACMI-hændelserne Message og Comment, og chat fra alle spil (Chat-, Say- eller Radio-hændelser, eller en chatkolonne), nederst i visningen med hvem der sagde det, i seks sekunder | ny |
| Visning af dato og UTC-tid | Tidslinjens ur med UTC, hvor optagelsen har en referencetid | gjort |
| Musens position i bredde/længde, MGRS, bullseye | Kortet for det valgte punkt (klik på et punkt) giver bredde/længde i grader, minutter og sekunder og MGRS ved siden af verdensmeterne; bullseye pr. enhed (felt) | ny |
| Egen logo | Ikke bygget | gælder ikke (branding) |
| 3D-modeller, nærmeste når ukendt | Egen figurkatalog, nærmeste modstykke, rigtig størrelse | gjort |
| Flere kampe (linjer mellem alle par) | **Kamplinjer**: fra hver enhed i omfanget til hver modstander inden for den valgte afstand (1-200 km), hver med sin afstand, de nærmeste 60 par; det målte par som før | ny |

## Etiketter {#labels}

| Tacview | 3DHeat | Status |
|---|---|---|
| Etiketter til/fra, hver for sig for valgte og ikke-valgte objekter | **Etiketter** med regler for **Valgte**, **Fly**, **Land**, **Skibe**, **Våben** og **AI**: vist eller ej, egne værdier, prioritet | ny |
| Etiketfelter: navn, kaldesignal, pilot, hastigheder (TAS/CAS/IAS/Mach/GS), højder (ASL/AGL), VS, AOA, AOS, G (lodret, sidelæns, længdegående), drejehastighed og radius, energi, brændstof vægt/volumen/flow, kurs/spor, roll/pitch, puls | Hver værdi i `fields.ts`: den samme liste, udregnet hvor det ikke er optaget (skøn markeret ~). Rullehastighed og SpO2 kun via Rå. | gjort |
| Bullseye-position i etiketter | Feltet **Bullseye (pejling / afstand)** | ny |
| ILS-afvigelser, afstand fløjet | Rå-værdier; afstand fløjet i statistikken | gjort (delvist) |
| Fjern rod fra ikke-valgt telemetri | **Hold etiketterne adskilt**, sorteret efter hver regels prioritet | gjort / ny |
| Mærk alle jordobjekter / kun trusler | Reglerne Land og AI | ny |
| Etiketskala | **Etiketstørrelse** (60-250 %) | ny |
| Metriske / engelske enheder | Metrisk / engelsk | gjort (to forvalg, ikke otte) |

## Objektinfo og telemetri {#object-info-and-telemetry}

| Tacview | 3DHeat | Status |
|---|---|---|
| Primært og sekundært valg | Klik følger og vælger; shift-klik to for at måle; vælger **Mål** | gjort / ny |
| Afstand / pejling / vinkel / nærmerning mellem to objekter | BRAA-linjen for det målte par; felterne Range, Bearing, Aspect og Closure fra den fulgte enhed | gjort |
| Relativ pejling, sigtelinjens vinkelhastighed | Felterne **Relativ pejling** (fra den fulgte enheds næse, V/H) og **Sigtelinjens vinkelhastighed** (°/s) | ny |
| Telemetrivinduer | Enhedskortet og svævekortet | gjort |
| Rå telemetri (hver optaget egenskab, også ukendte) | **Rå** i enhedskortet: hver kolonne på enhedens række, som den er skrevet | ny |
| Liste over aktive objekter | **Enheder**: spillere, AI, våben i flugt; levende lyser | gjort |
| Vindue med optagelsens egenskaber (titel, forfatter, briefing ...) | Gemt som RecordingInfo-kolonnen; vist i Rå | gjort (intet vindue) |
| Positionsformater DMS/MGRS, magnetisk nord | **Position (bredde / længde)** i DMS og **MGRS**-felter; et felt **Magnetisk kurs**; **Magnetiske kurser** skriver kurs, spor og pejling magnetisk (°M) og viser et kompas med begge nord og afvigelsen - World Magnetic Model 2025 (koefficienter i det fri), udregnet her ud fra enhedens sted og dato | ny |

## Diagrammer {#charts}

| Tacview | 3DHeat | Status |
|---|---|---|
| Diagram for ét objekt, op til 4 værdier | **Over tid** (og diagrammet under Replay) | gjort |
| Tegn op til 4 objekter på én gang | **Sammenlign**: én værdi for op til 8 enheder på én skala | ny |
| Værdi mod værdi (energi-manøvrering) | **Værdi mod værdi**: drejehastighed mod fart eller et hvilket som helst par, hver enhed en linje, dens aktuelle punkt markeret | ny |
| X-akse efter tid; zoom; flyt tiden fra diagrammet | Hjulet zoomer ind i tiden, dobbeltklik nulstiller, klik går til øjeblikket | ny |
| X-akse efter luft- eller jorddistance | **Tid / Luftdistance / Jorddistance** på tid- og sammenligningsdiagrammerne; zoom og klik-for-at-gå virker på samme måde | ny |
| Færdige diagrammer (energi, acceleration ...) | Enhver værdi kan vælges (energihøjde og dens rate er værdier) | gjort |

## Statistik, flyloggen, hændelser {#statistics-flight-log-events}

| Tacview | 3DHeat | Status |
|---|---|---|
| Flyvelog: taget af, landet, skudt af, ramt af, ødelagt af, forladt området | **Statistik** pr. enhed: liv, nedskydninger, dødsfald, skud, træf, træfrate, afgange, landinger, tid i luften, største G (og mindste), største fart, højde og Mach, afstand. Afgange kommer fra TakenOff/Landed-hændelser, OnGround, AGL eller et skøn markeret ~. | ny |
| Tilføjelser med resultattavle og missionsrapport | Oversigt pr. hold og flest nedskydninger; kampoversigtens egen resultattavle | ny / gjort |
| Eksportér flyvelog som XML/CSV | **Eksportér CSV** af statistikken og af hændelserne som de står på listen | ny (kun CSV) |
| Eksportér telemetri som CSV med en hastighed | **Telemetri for den valgte enhed**: hver værdi, 1-20 pr. sekund | ny |
| Hændelseslog, dobbeltklik for at gå derhen og vælge | Listen **Hændelser**, filtreret efter slags og enhed; et klik flyver derhen | gjort |
| Forrige / næste hændelse (Ctrl+←/→) | **Page Up / Page Down** | ny |
| Pause ved hændelse | **Pause ved hændelse** | ny |
| Markører på tidslinjen (udløsninger, træf, ødelæggelser; det valgte objekts i blåt; bogmærker røde) | Nedskydninger og dødsfald som en tæthedslinje, den fulgte enheds i blåt, bogmærker røde; klik for at gå derhen | ny |
| Fjern en hændelse, kill-remove | Ikke bygget | gælder ikke (hændelser hører til optagelsen; filtre skjuler dem) |

## Bogmærker {#bookmarks}

| Tacview | 3DHeat | Status |
|---|---|---|
| Indsæt bogmærke med valg og synsvinkel | **Tilføj bogmærke** (B): øjeblikket, det frie kamera eller den fulgte enhed med dens visning, afstand og mål; navngivet; gemt i denne browser pr. optagelse | ny |
| Fjern bogmærke | × på listen | ny |
| Bogmærker på tidslinjen og i logs | Røde mærker; listen | ny |
| Event=Bookmark i ACMI | Vist under optagelsens mærker, sammen med nedskydninger, dødsfald og beskeder | ny |
| Genvej til kopiér/indsæt (del en visning) | **Eksportér / Importér** bogmærkerne som en fil; C kopierer kameraets stilling | ny |

## Afspilning {#playback}

| Tacview | 3DHeat | Status |
|---|---|---|
| Afspil/pause, til start, hastighed, tidslinjeskrub | Tidslinje | gjort |
| Billede for billede | **,** og **.** et sekund tilbage og frem (Shift: ti) | ny |
| Afspilning baglæns | **◀** på tidslinjen, **J** (**L** fremad; samme tast igen sætter på pause): spiller fra slutningen mod starten med den valgte hastighed, i løkke eller stopper ved starten | ny |
| Dialog for tidshop | Tidslinjen og hændelseslisten | gjort |
| Tidsforskyd ét objekt (spøgelse) | **Tidsforskydning og beskæring**: flyt én enheds flyvning, eller en hel optagelse, med så mange sekunder; **Læg optagelserne på linje** flytter flere optagelser til at starte sammen og spiller dem på én gang (to udflugter på forskellige dage side om side). Optagelsen bygges om, så spor, hændelser, diagrammer og statistik følger med | ny |
| Beskær før/efter | **Fra nu / Til nu / Klip til dette spænd** (fortryd beholder forskydningerne), derefter **Eksportér CSV** (kan indlæses i 3DHeat igen) eller **Eksportér ACMI** (Tacview 2.2-tekst, for en optagelse placeret på jorden) | ny |

## Terræn og kort {#terrain-and-map}

| Tacview | 3DHeat | Status |
|---|---|---|
| Rigtigt terræn, egen højde og teksturer | Baner (spillets eget kort som 3D-model), fliser til verdensbaggrunden | gjort |
| Flad / tom / kontrastrigt terræn | [Banens udseende](level-appearance.md): jordrelief, overflade og konstruktioner vist eller ej | gjort (ikke de samme tilstande) |
| 2D-taktisk kort (Tacview har ingen; satellitvisning) | **2D-kort**: hjørne- eller helvisning, symboler efter slags og hold (udfyldte spillere, optegnede AI) drejet efter deres kurs, spor, navne, målestok, rækkevidderinge om den fulgte enhed, bullseye-ringe, 3D-kameraets sted, nylige dødsfald; træk, hjul, klik for at følge (M) | ny |
| Faste objekter (lufthavne, baner, vejpunkter, områder, KML) | Opmålte baner (OurAirports) i verdensbaggrunden og deres glidebaner; GPX-vejpunkter og KML-mærker indlæses som stående objekter; [Taktiktavlen](tactics-board.md) tegner områder og ruter | ny |

## Import, eksport, optagelse {#import-export-recording}

| Tacview | 3DHeat | Status |
|---|---|---|
| ACMI-tekst og zip | [Tacview ACMI](tacview-acmi.md) | gjort |
| GPX, KML, CSV, NMEA, IGC, FIT, DIS ... | **GPX** (spor, ruter, vejpunkter; Garmins puls, kadence, effekt, temperatur), **KML/KMZ** (gx:Track, LineString, Point), **NMEA 0183** (RMC og GGA fra enhver taler, kontrolsummer efterset, over midnat), **IGC** (B-poster, dato, pilot og svæve), **FIT** (record-beskeder, komprimerede tidsstempler) - hver placeret efter bredde og længde på planet ved sporenes midte, så verdensbaggrunden passer; kurs, pitch og fart fra filen eller fra fix til fix. CSV og Parquet som før | ny (DIS gælder ikke: en live netværksprotokol) |
| Egne optagere (DCS, BMS, IL-2, MSFS ...) | 3DHeats egne konvertere (War Thunder, CS2, Squad, Arma og andre) | gjort (egne) |
| Realtidstelemetri over TCP, ADS-B | Ikke bygget | gælder ikke (afspilninger efter kampen) |
| Synkroniseret lyd/video | **Lyd og video**: en lokal fil afspilles, pauses, søges og ændrer hastighed med tidslinjen fra en fast start (**Starter nu**, ±0,1 s); en video i et panel, der kan ændres i størrelse, over visningen, eller billede-i-billede. Filen bliver i browseren | ny |
| Video-eksport | [Kameraspor og video](camera-path-and-video.md) | gjort |

## Andet {#other}

| Tacview | 3DHeat | Status |
|---|---|---|
| Lua-tilføjelser | Ikke bygget | gælder ikke (åben kildekode: ændr selve fremviseren) |
| Online debriefing (delt session) | Ikke bygget | gælder ikke (Tacviews er en hostet session, der holder alle på ét afspilningshoved. 3DHeat har ingen server og gemmer optagelser på fremviserens maskine, og selv en peer-to-peer-forbindelse kræver en signalserver. En debriefing deles som filer: den beskårne optagelse (Eksportér ACMI eller CSV) og bogmærkefilen, som åbner på de samme øjeblikke og visninger) |
| Instruktørfjernbetjening | Ikke bygget | gælder ikke (styrer en kørende simulator) |
| Redigering af objekter (tilføj, redigér, fjern objekter) | [Taktiktavlen](tactics-board.md) for planlagte objekter; optagelser er skrivebeskyttede | gælder ikke |
| Sprog | 40 sprog | gjort |
| Godkendelse af optagelser | Ikke bygget | gælder ikke |

## Til udviklere: ACMI 2.2-egenskaber {#for-developers-acmi-22-properties}

Læses af `data/acmi.ts`; talegenskaber bliver til talkolonner, tekstgenskaber til kategorikolonner. Alle vises under **Rå** i enhedskortet. Disse læses med et formål:

| Egenskaber | Brug |
|---|---|
| T (alle fire former), Name, Type, Pilot, Group, Country, Coalition, Color, CallSign | Position, holdning, figur, enhedens navn, hold |
| IAS, CAS, TAS, Mach, AOA, AOS, AGL, HDG, HDM, OnGround | Felter, diagrammer, HUD, registrering af afgang og landing |
| VerticalGForce, LongitudinalGForce, LateralGForce | G-felter |
| Throttle(2), Afterburner, EngineRPM(2), NR, AirBrakes, Flaps, LandingGear, Tailhook | Felter |
| FuelWeight..9, FuelVolume..9, FuelFlowWeight..8 | Brændstoffelter, lagt sammen over tankene |
| RadarMode, RadarAzimuth, RadarElevation, RadarRoll, RadarRange, RadarHorizontalBeamwidth, RadarVerticalBeamwidth, RadarRangeGateAzimuth/Elevation/Min/Max/HorizontalBeamwidth/VerticalBeamwidth | Radarkegler og rækkeviddeport |
| LockedTarget..9, LockedTargetMode, LockedTargetAzimuth/Elevation/Range, FocusedTarget | Låselinjer |
| EngagementMode(2), EngagementRange(2), VerticalEngagementRange(2) | Indsatskupler |
| QNH, AltimeterSetting, WindSpeed, WindDirection, HeartRate | Felter |
| Health | Felt |
| Hændelser: Destroyed, TakenOff, Landed, Bookmark, Message, Comment, LeftArea, Timeout | Hændelseslisten, statistik (dødsfald, afgange, landinger), bogmærker; Message og Comment som undertekster |
| PilotHeadYaw, PilotHeadPitch | Pilotens sigtelinje |
| Typemærket Bullseye (Navaid+Static+Bullseye) | Bullseye-felt og kortringe |
| Alt andet (PilotHeadRoll, styring, overflader, ILS-afvigelser, SpO2, ENL, Label, Debug, Importance, Slot, Visible, Disabled, Radius, størrelser ...) | Vist som skrevet under **Rå** |

Radar- og låsevinkler måles mod enhedens egne akser: azimut mod højre, elevation op, roll højre vinge ned. ACMI-specifikationen siger, at de er i forhold til flyet, men ikke hvilken vej der er positiv; denne læsning følger dens transformation (gir med uret, pitch op, roll højre).
