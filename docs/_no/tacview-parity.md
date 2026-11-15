---
title: "Tacview-paritet"
parent: "Kampreplay"
grand_parent: "Repriser"
nav_order: 1
lang: "no"
source: "tacview-parity.md"
source_hash: "4275603255c2"
translated: true
outdated: false
---

# Tacview-paritet

Tacview er et populært program for å se flyopptak. Hvis du kjenner det, viser denne siden hvor hvert av verktøyene finnes i 3DHeat.

Den lister hver funksjon i Tacview 1.9 (dens manual, tabellen med brukergrensesnittstrenger og filformatet ACMI 2.2), og hvor 3DHeats [kampreprise](match-replay.md) står i forhold til den. Målet: alt Tacview kan gjøre med en reprise og dens data, kan 3DHeat også gjøre.

**Status:**
- **ferdig**: finnes allerede i 3DHeat.
- **nytt**: bygget for å matche en Tacview-funksjon.
- **ikke ennå**: gjelder, men er ikke bygget.
- **ikke aktuelt**: gjelder ikke her, med begrunnelse.

Der du finner funksjonene: fanen **Kamp**, **Figuravspilling** (eller **Figuroverlegg** i fanen Varmekart), i sidepanelets seksjoner **Reprise**, **Enheter**, **Hendelser**, **Bokmerker**, **Taktisk visning**, **Statistikk**, **Tidsforskyvning og trimming**, **Kart og posisjon**, **Lyd og video** og **Etiketter**. Se [kampreprise](match-replay.md).

## Kameraer {#cameras}

| Tacview | 3DHeat | Status |
|---|---|---|
| Cockpitvisning (F5), horisonten ruller med flyet | **Cockpit**: ut fra enheten langs dens holdning, slik bevegelsesmodellen har den. Enhetens egen figur klippes bort. Dra for å se rundt; **Se fremover igjen** nullstiller. | nytt |
| HUD i cockpitvisningen (valg mellom IAS/CAS/TAS) | **Head-up-display** (H): horisont og tonehjul for den faktiske visningen, flybane-markør, kursbånd, IAS, høyde, TAS, Mach, G, angrepsvinkel, vertikalfart, AGL | nytt |
| 3D-cockpitinstrumenter, hodesporing for piloten (PilotHead*), TrackIR | Ingen cockpitmodeller. Hodevinklene vises i enhetskortets visning **Rå** | ikke aktuelt (ingen cockpitmodeller; hodesporing er maskinvare for live flyging) |
| Ekstern visning (F6): gå rundt den primære objekten | **Jakt** (svinger med enheten) og **Bane** (beholder sin egen retning) | ferdig |
| Jaktkamera, "Se på målet" (padlock) | **Padlock**: fra cockpit, holdt på målet | nytt |
| Jaktkamera, "Sentrert" / "Se fremover" | **Mål**: bak enheten, på linjen fra målet, og ser forbi den mot målet. **Fast** på asimut 0 ser fremover fra foran. | nytt |
| Bytt primær og sekundær | **Bytt** ved siden av målet | nytt |
| Satellittvisning (F7), ortografisk rett ovenfra | **Satellitt**: rett ned på enheten, nord opp; dra for å svinge. 2D-kartet er den ortografiske planen. | nytt |
| Fritt kamera (F8), W/A/S/D, E/C | Det frie flykameraet (W/A/S/D, mellomrom/Q, Shift/Alt) | ferdig |
| Tilleggene Head-On-kamera og eksternt kamera fast på objektet | **Fast**: et sted rundt enheten som svinger og ruller med den; dra for å flytte det (bak, en vingespiss, rett forfra) | nytt |
| Tillegget Lock Camera (fryser posisjonen) | Slutt å følge (Esc): kameraet blir der det var | ferdig |
| Strategisk visning (zoom ut til hele jorden) | [Verdensbakgrunn](world-backdrop.md) og rammen for hele opptaket i 2D-kartet | ferdig |
| Innstilling for synsfelt | **Kamera og scene**, synsfelt (FOV) | ferdig |
| Bytt visninger med taster | **V** neste visning, **Shift+V** tilbake | nytt |

## 3D-visning og visningsvalg {#d-view-and-display-options}

| Tacview | 3DHeat | Status |
|---|---|---|
| Båndspor, skyver for lengde | Spor (sekunder) i Lagvisningen | ferdig |
| Forventet spor (veien fremover) | **Veien fremover**: hvor enheten virkelig går de neste sekundene | nytt |
| Høydelinjer / vegger for objekter | **Loddlinjer** | ferdig (linjer; vegger ikke bygget) |
| Vektorer for valgt objekt: retning (prikket), kurs (heltrukket), løft | **Fartsvektorer** (kurs og fart i så mange sekunder, med et tips) og **Nese- og løftelinjer** (nese stiplet, løft kort og mørk) | nytt |
| Pilotens siktelinje | **Pilotens siktelinje**: en stiplet cyan linje langs PilotHeadYaw/PilotHeadPitch (eller en kolonne HeadYaw, ViewYaw eller LookYaw) mot enhetens akser | nytt |
| Dødssoner for luftvern og luftforsvar (EngagementRange, VerticalEngagementRange, EngagementMode og "2"-tvillingene) | **Engasjementssoner**: kupler, egg-formet der den vertikale rekkevidden er forskjellig; av mens EngagementMode er 0 | nytt |
| Radarlåsinger (LockedTarget..9) med etiketter | **Låsninger**: røde linjer til hvert låst objekt; stiplet gul mot FocusedTarget; langs LockedTargetAzimuth/Elevation/Range der ingen objekt er nevnt. **Låseetiketter**: målets navn og avstand på hver låselinje | nytt |
| Radarkjegle (RadarMode, Azimuth, Elevation, Roll, Range, stråle-bredder) og avstandsport | **Radarkjegler**: kant og midtring av strålen, dreid etter asimut, elevasjon og rulling mot enheten; avstandsporten som to gule kanter. Uten strålebredder bare strålens akse. | nytt |
| Siktelinje mellom de to valgte objektene (grønn / rød prikket når terrenget blokkerer) | Linjen for det målte paret blir rød og stiplet når terrenget er mellom dem | nytt |
| Forstørre fjerne objekter automatisk | Minste figur på skjermen (piksler) | ferdig |
| Breddegrads- og lengdegradsnett | **Kart og posisjon → Rutenett**: bredde- og lengdelinjer på bakken under kameraet, med runde avstander etter høyden (10° ned til 1'), merket; eller **MGRS**-kilometernettet for UTM-sonen, med sonen og 100 km-ruten vist. 2D-kartets eget rutenett som før | nytt |
| Bullseye-ringer | Ringer rundt hvert lags bullseye i 2D-kartet | nytt (bare 2D) |
| Glidebane-overlegg | **Glidebaner**: 3°-baner med kantene for full skala på ±0,7° ved begge ender av hver rullebane nær opptaket, fra de målte terskelpunktene og høydene fra OurAirports (hentet én gang, lagret offline), en strek ved hver nautiske mil, navngitt etter flyplass og rullebane | nytt |
| Høydebegrensninger (alarm for tak/gulv) | **Høydebegrensning**: et gulv og et tak; etiketter for enheter utenfor blir røde, og hver kryssing (under gulvet, over taket, tilbake innenfor) listes – et klikk går dit og følger enheten | nytt |
| Ødelagte objekter grå, fjernet etter 15 min | Liv avsluttes med sitt spor; en død enhet blir nedtonet i enhetslisten | ferdig |
| Egenskapene Visible / Disabled | Vises i **Rå**; ingenting skjules av dem | ikke ennå |
| Vis pinne-, gass- og pedalposisjoner | Gass og motorverdier i felt; kontrollinnganger i **Rå** | ferdig (som verdier) |
| Kommentarer som undertekster | **Meldinger som undertekster** (Etiketter): ACMI-hendelsene Message og Comment, og chat fra alle spill (hendelser Chat, Say eller Radio, eller en chat-kolonne), nederst i visningen med hvem som sa det, i seks sekunder | nytt |
| Visning av dato og UTC-tid | Tidslinjens klokke med UTC der opptaket har et referansetidspunkt | ferdig |
| Musens posisjon i bredde/lengde, MGRS, bullseye | Valgkortet (klikk på et punkt) gir bredde- og lengdegrad i grader, minutter og sekunder og MGRS ved siden av verdensmetrene; bullseye per enhet (felt) | nytt |
| Egen logo | Ikke bygget | ikke aktuelt (merkevare) |
| 3D-modeller, nærmeste når ukjent | Egen figurkatalog, nærmeste motstykke, riktig størrelse | ferdig |
| Flere engasjementer (linjer mellom alle par) | **Kamplinjer**: fra hver enhet i omfanget til hver motstander innen den valgte rekkevidden (1–200 km), hver med sin avstand, de 60 nærmeste parene; det målte paret som før | nytt |

## Etiketter {#labels}

| Tacview | 3DHeat | Status |
|---|---|---|
| Etiketter av/på, hver for seg for valgte og ikke-valgte objekter | **Etiketter** med regler for **Valgte**, **Fly**, **Bakke**, **Skip**, **Våpen** og **AI**: vist eller ikke, egne verdier, prioritet | nytt |
| Etikettfelt: navn, kallesignal, pilot, farter (TAS/CAS/IAS/Mach/GS), høyder (ASL/AGL), VS, AOA, AOS, G (vertikal, sideveis, lengde), svingrate og radius, energi, drivstoffvekt/-volum/-flyt, kurs/spor, rulling/stigning, pulsfrekvens | Hver verdi i `fields.ts`: den samme listen, beregnet der det ikke er registrert (estimater merket ~). Rullingsrate og SpO2 bare via Rå. | ferdig |
| Bullseye-posisjon i etiketter | Feltet **Bullseye (peiling / avstand)** | nytt |
| ILS-avvik, tilbakelagt distanse | Råverdier; tilbakelagt distanse i statistikken | ferdig (delvis) |
| Rydd bort ikke-valgt telemetri | **Hold etikettene fra hverandre**, sortert etter prioriteten til hver regel | ferdig / nytt |
| Merk alle bakkeobjekter / bare trusler | Reglene for Bakke og AI | nytt |
| Etikettskala | **Etikettstørrelse** (60–250 %) | nytt |
| Metriske / imperiale enheter | Metriske / imperiale | ferdig (to forhåndsvalg, ikke åtte) |

## Objektinfo og telemetri {#object-info-and-telemetry}

| Tacview | 3DHeat | Status |
|---|---|---|
| Primært og sekundært valg | Klikk følger og velger; shift-klikk to for å måle; **Mål**-velgeren | ferdig / nytt |
| Avstand / peiling / aspekt / nærming mellom to objekter | BRAA-linjen for det målte paret; felt for avstand, peiling, aspekt og nærming fra enheten som følges | ferdig |
| Relativ peiling, siktelinjens rate | Feltene **Relativ peiling** (fra nesen på enheten som følges, V/H) og **Siktelinjens vinkelhastighet** (°/s) | nytt |
| Telemetrivinduer | Enhetskortet og sveve-kortet | ferdig |
| Rå telemetri (hver registrert egenskap, også ukjente) | **Rå** i enhetskortet: hver kolonne på enhetens rad slik den står | nytt |
| Liste over aktive objekter | **Enheter**: spillere, AI, våpen i flukt; levende er lyse | ferdig |
| Vindu med opptakets egenskaper (tittel, forfatter, briefing ...) | Lagret som RecordingInfo-kolonnen; vises i Rå | ferdig (ikke noe vindu) |
| Posisjonsformater DMS/MGRS, magnetisk nord | **Posisjon (bredde / lengde)** i DMS og **MGRS**-felt; et felt **Magnetisk kurs**; **Magnetiske kurser** skriver kurs, spor og peiling magnetisk (°M) og viser et kompass med begge nordene og variasjonen – World Magnetic Model 2025 (koeffisienter i det fri), beregnet her for enhetens sted og dato | nytt |

## Diagrammer {#charts}

| Tacview | 3DHeat | Status |
|---|---|---|
| Diagram for ett objekt, opptil 4 verdier | **Over tid** (og diagrammet under Reprise) | ferdig |
| Plott opptil 4 objekter samtidig | **Sammenlign**: én verdi for opptil 8 enheter på én skala | nytt |
| Verdi mot verdi (energi-manøvrering) | **Verdi mot verdi**: svingrate mot fart eller et hvilket som helst par, hver enhet er en linje, og dens nåværende punkt er merket | nytt |
| X-akse etter tid; zoom; flytt tid fra diagrammet | Hjulet zoomer i tid, dobbeltklikk nullstiller, klikk går til øyeblikket | nytt |
| X-akse etter distanse i luften eller på bakken | **Tid / Distanse i luften / Distanse på bakken** på tid- og sammenligningsdiagrammene; zoom og klikk-for-å-gå virker likt | nytt |
| Ferdige diagrammer (energi, akselerasjon ...) | Hvilken som helst verdi kan velges (energihøyde og dens rate er verdier) | ferdig |

## Statistikk, flyloggen, hendelser {#statistics-flight-log-events}

| Tacview | 3DHeat | Status |
|---|---|---|
| Flylogg: tatt av, landet, skutt, truffet av, ødelagt av, forlatt område | **Statistikk** per enhet: liv, drap, dødsfall, skudd, treff, treffrate, avganger, landinger, tid i luften, størst G (og minst), høyeste fart, høyde og Mach, distanse. Avganger kommer fra hendelsene TakenOff/Landed, OnGround, AGL, eller et estimat merket ~. | nytt |
| Tilleggene for resultattavle og oppdragsrapport | Oppsummering per lag og flest drap; kampsammendragets egen resultattavle | nytt / ferdig |
| Eksporter flylogg som XML/CSV | **Eksporter CSV** av statistikken, og av hendelsene slik de er listet | nytt (bare CSV) |
| Eksporter telemetri-CSV med en gitt rate | **Telemetri for den valgte enheten**: hver verdi, 1–20 per sekund | nytt |
| Hendelseslogg, dobbeltklikk for å gå dit og velge | **Hendelser**-listen, filtrert etter type og enhet; et klikk flyr dit | ferdig |
| Forrige / neste hendelse (Ctrl+←/→) | **Page Up / Page Down** | nytt |
| Pause ved hendelse | **Pause ved hendelse** | nytt |
| Markører på tidslinjen (utgivelser, treff, ødeleggelser; den valgte enhetens i blått; bokmerker røde) | Drap og dødsfall som en tetthetsstolpe, den fulgte enhetens i blått, bokmerker røde; klikk for å gå dit | nytt |
| Fjern en hendelse, drapsfjerning | Ikke bygget | ikke aktuelt (hendelsene tilhører opptaket; filtrene skjuler dem) |

## Bokmerker {#bookmarks}

| Tacview | 3DHeat | Status |
|---|---|---|
| Sett inn bokmerke med valg og synspunkt | **Legg til bokmerke** (B): øyeblikket, det frie kameraet eller den fulgte enheten med sin visning, avstand og mål; navngitt; lagret i denne nettleseren per opptak | nytt |
| Fjern bokmerke | × i listen | nytt |
| Bokmerker på tidslinjen og i loggene | Røde merker; listen | nytt |
| Event=Bookmark i ACMI | Listet under opptakets merker, sammen med drap, dødsfall og meldinger | nytt |
| Snarvei for kopier/lim inn (del en visning) | **Eksporter / Importer** bokmerkene som en fil; C kopierer kameraposisjonen | nytt |

## Avspilling {#playback}

| Tacview | 3DHeat | Status |
|---|---|---|
| Spill/pause, til start, fart, tidslinje | Tidslinjen | ferdig |
| Bilde for bilde | **,** og **.** ett sekund tilbake og fram (Shift: ti) | nytt |
| Avspilling baklengs | **◀** på tidslinjen, **J** (**L** framover; samme tast igjen pauser): spiller fra slutten mot starten med valgt fart, og gjentar eller stopper ved starten | nytt |
| Dialog for hopp i tid | Tidslinjen og hendelseslisten | ferdig |
| Forskyv én enhet i tid (spøkelse) | **Tidsforskyvning og trimming**: flytt en enhets flytur, eller et helt opptak, med så mange sekunder; **Still opptakene på linje** flytter flere opptak til å starte sammen og spiller dem samtidig (to tokt på forskjellige dager side om side). Opptaket bygges om, så spor, hendelser, diagrammer og statistikk følger | nytt |
| Trim før/etter | **Fra nå / Til nå / Klipp til dette spennet** (å angre beholder forskyvningene), deretter **Eksporter CSV** (laster inn igjen i 3DHeat) eller **Eksporter ACMI** (Tacview 2.2-tekst, for et opptak plassert på jorden) | nytt |

## Terreng og kart {#terrain-and-map}

| Tacview | 3DHeat | Status |
|---|---|---|
| Ekte terreng, egen høyde og teksturer | Nivåer (spillets eget kart som 3D-modell), fliser for verdensbakgrunnen | ferdig |
| Flate / tomme / kontrastrike terrengmodus | [Nivåutseende](level-appearance.md): terrengrelieff, overflate og strukturer vist eller ikke | ferdig (ikke de samme modusene) |
| 2D-taktisk kart (Tacview har ingen; satellittvisning) | **2D-kart**: hjørne eller hel visning, symboler etter type og lag (fylte spillere, opptegnede AI) dreid etter sin retning, spor, navn, målestokk, avstandsringer rundt den fulgte enheten, bullseye-ringer, 3D-kameraets plass, nylige dødsfall; dra, hjul, klikk for å følge (M) | nytt |
| Statiske objekter (flyplasser, rullebaner, veipunkter, områder, KML) | Målte rullebaner (OurAirports) i verdensbakgrunnen og deres glidebaner; GPX-veipunkter og KML-merker lastes som stående objekter; [Taktisk tavle](tactics-board.md) tegner områder og ruter | nytt |

## Import, eksport, opptak {#import-export-recording}

| Tacview | 3DHeat | Status |
|---|---|---|
| ACMI-tekst og zip | [Tacview ACMI](tacview-acmi.md) | ferdig |
| GPX, KML, CSV, NMEA, IGC, FIT, DIS ... | **GPX** (spor, ruter, veipunkter; Garmin-pulsfrekvens, frekvens, effekt, temperatur), **KML/KMZ** (gx:Track, LineString, Point), **NMEA 0183** (RMC og GGA fra hvilken som helst kilde, kontrollsummer sjekket, over midnatt), **IGC** (B-poster, dato, pilot og seilfly), **FIT** (recordmeldinger, komprimerte tidsstempler) – hver plassert etter bredde- og lengdegrad på planet i midten av sporene, slik at verdensbakgrunnen stemmer; kurs, stigning og fart fra filen eller fra posisjon til posisjon. CSV og Parquet som før | nytt (DIS ikke aktuelt: en live nettverksprotokoll) |
| Egne opptakere (DCS, BMS, IL-2, MSFS ...) | 3DHeats egne konvertere (War Thunder, CS2, Squad, Arma og andre) | ferdig (egne) |
| Sanntidstelemetri over TCP, ADS-B | Ikke bygget | ikke aktuelt (avspilling etter kampen) |
| Synkronisert lyd/video | **Lyd og video**: en lokal fil spiller, pauser, spoler og endrer fart med tidslinjen fra en fast start (**Starter nå**, ±0,1 s); en video i et panel du kan endre størrelsen på over visningen, eller bilde-i-bilde. Filen blir i nettleseren | nytt |
| Videoeksport | [Kameraløype og video](camera-path-and-video.md) | ferdig |

## Annet {#other}

| Tacview | 3DHeat | Status |
|---|---|---|
| Lua-tillegg | Ikke bygget | ikke aktuelt (åpen kildekode: endre selve visningsprogrammet) |
| Nettbasert etterarbeid (delt økt) | Ikke bygget | ikke aktuelt (Tacviews er en hostet økt som holder alle på samme spilleshode. 3DHeat har ingen server og beholder opptakene på viseren sin maskin, og selv en direkte lenke mellom maskiner trenger en signalserver. Et etterarbeid deles som filer: det klippede opptaket (Eksporter ACMI eller CSV) og bokmerkefilen, som åpnes på de samme øyeblikkene og visningene) |
| Instruktørfjernkontroll | Ikke bygget | ikke aktuelt (styrer en kjørende simulator) |
| Redigering av objekter (legge til, endre, fjerne objekter) | [Taktisk tavle](tactics-board.md) for planlagte objekter; opptak er skrivebeskyttet | ikke aktuelt |
| Språk | 40 språk | ferdig |
| Autentisering av opptak | Ikke bygget | ikke aktuelt |

## For utviklere: ACMI 2.2-egenskaper {#for-developers-acmi-22-properties}

Leses av `data/acmi.ts`. Numeriske egenskaper blir tallkolonner, tekstlige blir kategorikolonner. Alle vises under **Rå** i enhetskortet. Disse leses for et bestemt formål:

| Egenskaper | Bruk |
|---|---|
| T (alle fire former), Name, Type, Pilot, Group, Country, Coalition, Color, CallSign | Posisjon, holdning, figur, enhetsnavn, lag |
| IAS, CAS, TAS, Mach, AOA, AOS, AGL, HDG, HDM, OnGround | Felt, diagrammer, HUD, deteksjon av avgang og landing |
| VerticalGForce, LongitudinalGForce, LateralGForce | G-felt |
| Throttle(2), Afterburner, EngineRPM(2), NR, AirBrakes, Flaps, LandingGear, Tailhook | Felt |
| FuelWeight..9, FuelVolume..9, FuelFlowWeight..8 | Drivstoffelt, summert over tankene |
| RadarMode, RadarAzimuth, RadarElevation, RadarRoll, RadarRange, RadarHorizontalBeamwidth, RadarVerticalBeamwidth, RadarRangeGateAzimuth/Elevation/Min/Max/HorizontalBeamwidth/VerticalBeamwidth | Radarkjegler og avstandsport |
| LockedTarget..9, LockedTargetMode, LockedTargetAzimuth/Elevation/Range, FocusedTarget | Låselinjer |
| EngagementMode(2), EngagementRange(2), VerticalEngagementRange(2) | Engasjementskupler |
| QNH, AltimeterSetting, WindSpeed, WindDirection, HeartRate | Felt |
| Health | Felt |
| Hendelser: Destroyed, TakenOff, Landed, Bookmark, Message, Comment, LeftArea, Timeout | Hendelseslisten, statistikk (dødsfall, avganger, landinger), bokmerker; Message og Comment som undertekster |
| PilotHeadYaw, PilotHeadPitch | Pilotens siktelinje |
| Typemerket Bullseye (Navaid+Static+Bullseye) | Bullseye-felt og kartringer |
| Alt annet (PilotHeadRoll, kontroller, overflater, ILS-avvik, SpO2, ENL, Label, Debug, Importance, Slot, Visible, Disabled, Radius, størrelser ...) | Vist slik den står under **Rå** |

Radar- og låsevinkler er tatt mot enhetens egne akser: asimut til høyre, elevasjon opp, rulling høyre vinge ned. ACMI-spesifikasjonen sier at de er i forhold til flyet, men ikke hvilken vei som er positiv. Denne tolkningen følger dens transformasjon (gir med klokken, stigning opp, rulling høyre).
