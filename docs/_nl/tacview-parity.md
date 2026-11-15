---
title: "Tacview-gelijkwaardigheid"
parent: "Wedstrijdreplay"
grand_parent: "Replay"
nav_order: 1
lang: "nl"
source: "tacview-parity.md"
source_hash: "4275603255c2"
translated: true
outdated: false
---

# Tacview-gelijkwaardigheid

Tacview is een populair programma om vluchtopnames te bekijken. Als je het kent, laat deze pagina zien waar elk van zijn hulpmiddelen in 3DHeat zit.

Hij somt elke functie van Tacview 1.9 op (de handleiding, de tekenreeksen van de gebruikersinterface en het ACMI 2.2-bestandsformaat), en laat zien waar de [matchreplay](match-replay.md) van 3DHeat daarmee staat. Het doel: wat Tacview kan doen voor een replay en zijn data, kan 3DHeat ook.

**Status:**
- **klaar**: staat al in 3DHeat.
- **nieuw**: gebouwd om een functie van Tacview te evenaren.
- **nog niet**: geldt, maar is niet gebouwd.
- **n.v.t.**: geldt hier niet, met de reden.

De functies vind je in het tabblad **Match**, bij **Figurenreplay** (of **Figurenoverlay** in het tabblad Warmtekaart), in de zijbalkgedeelten **Replay**, **Eenheden**, **Gebeurtenissen**, **Bladwijzers**, **Tactische weergave**, **Statistieken**, **Tijdverschuiving en inkorten**, **Kaart en positie**, **Audio en video** en **Labels**. Zie [Matchreplay](match-replay.md).

## Camera's {#cameras}

| Tacview | 3DHeat | Status |
|---|---|---|
| Cockpitweergave (F5), de horizon rolt mee met het vliegtuig | **Cockpit**: vanuit de eenheid langs haar houding, zoals het bewegingsmodel die heeft. De eigen figuur van de eenheid wordt weggeknipt. Sleep om rond te kijken; **Weer vooruit kijken** zet het terug. | nieuw |
| HUD in de cockpitweergave (keuze uit IAS/CAS/TAS) | **Head-up display** (H): horizon en hoogteladder van het echte beeld, vluchtpadmarkering, koersband, IAS, hoogte, TAS, Mach, G, aanvalshoek, verticale snelheid, AGL | nieuw |
| 3D-cockpitinstrumenten, hoofdvolging van de piloot (PilotHead*), TrackIR | Geen cockpitmodellen. Hoekvan het hoofd staat in de weergave **Ruw** van de eenheidskaart | n.v.t. (geen cockpitmodellen; hoofdvolging is voor live vliegen) |
| Externe weergave (F6): om het hoofdobject heen draaien | **Achtervolgen** (draait mee met de eenheid) en **Omcirkelen** (behoudt de eigen richting) | klaar |
| Dogfight-camera, "Kijk naar doel" (padlock) | **Padlock**: vanuit de cockpit, vastgehouden op het doel | nieuw |
| Dogfight-camera, "Gecentreerd" / "Vooruit kijken" | **Doel**: achter de eenheid op de lijn vanaf het doel, kijkend langs haar naar het doel. **Vast** op azimut 0 kijkt vooruit vanaf voren. | nieuw |
| Primair en secundair omwisselen | **Wisselen** naast het doel | nieuw |
| Satellietweergave (F7), orthografisch van boven | **Satelliet**: recht naar beneden op de eenheid, noord boven; slepen om te draaien. De 2D-kaart is het orthografische plan. | nieuw |
| Vrije camera (F8), W/A/S/D, E/C | De vrije vliegcamera (W/A/S/D, Spatie/Q, Shift/Alt) | klaar |
| Add-on Head-On-camera; externe camera vast aan het object | **Vast**: een plek rond de eenheid die met haar draait en rolt; slepen om hem te verplaatsen (achter, een vleugeltip, recht van voren) | nieuw |
| Add-on Lock Camera (de positie bevriezen) | Stoppen met volgen (Esc): de camera blijft staan waar hij was | klaar |
| Strategische weergave (uitzoomen tot de hele Aarde) | [Wereldachtergrond](world-backdrop.md) en het kader van de hele opname op de 2D-kaart | klaar |
| Instelling van het gezichtsveld | Gezichtsveld in **Camera & scène** | klaar |
| Weergaven wisselen met toetsen | **V** volgende weergave, **Shift+V** terug | nieuw |

## 3D-weergave en weergaveopties {#d-view-and-display-options}

| Tacview | 3DHeat | Status |
|---|---|---|
| Lintsporen, schuif voor de lengte | Sporen (seconden) in de Teamviewer | klaar |
| Vooruitkijkend spoor (pad vooruit) | **Pad vooruit**: waar de eenheid in de komende seconden echt heen gaat | nieuw |
| Hoogtelijnen / wanden van objecten | **Loodlijnen** | klaar (lijnen; wanden niet gebouwd) |
| Vectoren van het geselecteerde object: koers (stippellijn), baan (volle lijn), lift | **Snelheidsvectoren** (baan en snelheid voor zoveel seconden, met een punt) en **Neus- en liftlijnen** (neus gestreept, lift kort en donker) | nieuw |
| Kijklijn van de piloot | **Kijklijn van de piloot**: een gestreepte cyaanlijn langs PilotHeadYaw/PilotHeadPitch (of een kolom HeadYaw, ViewYaw of LookYaw) tegen de assen van de eenheid | nieuw |
| Dodelijke bereikkoepels van SAM/AAA (EngagementRange, VerticalEngagementRange, EngagementMode, de "2"-tweelingen) | **Bereikzones**: koepels, eivormig waar het verticale bereik verschilt, uit zolang EngagementMode 0 is | nieuw |
| Radarvergrendelingen (LockedTarget..9) met labels | **Locks**: rode lijnen naar elk vergrendeld object; gestreept amber naar FocusedTarget; langs LockedTargetAzimuth/Elevation/Range waar geen object is genoemd. **Locklabels**: de naam van het doel en het bereik bij elke locklijn | nieuw |
| Radarkegel (RadarMode, Azimuth, Elevation, Roll, Range, bundelbreedtes) en bereikpoort | **Radarkegels**: rand en middenring van de bundel, gedraaid door azimut, elevatie en roll tegenover de eenheid; de bereikpoort als twee gele randen. Zonder bundelbreedtes alleen de as van de bundel. | nieuw |
| Lijn van zicht tussen de twee gekozen objecten (groen / rood gestippeld als terrein blokkeert) | De lijn van het gemeten paar wordt rood en gestreept als het niveau ertussen zit | nieuw |
| Verre objecten automatisch groter maken | Kleinste figuur op het scherm (pixels) | klaar |
| Breedte-/lengtegraadraster | **Kaart en positie → Raster**: breedte- en lengtegraadlijnen op de grond onder de camera, op een rond interval voor de hoogte (10° tot 1'), met labels; of het **MGRS**-kilometerraster van de UTM-zone, met de zone en het vak van 100 km. Het eigen raster van de 2D-kaart zoals voorheen | nieuw |
| Bullseye-ringen | Ringen rond de bullseye van elk team op de 2D-kaart | nieuw (alleen 2D) |
| Glijpadoverlay | **Glijpaden**: paden van 3° met de schaalranden van ±0,7° aan beide uiteinden van elke landingsbaan in de buurt van de opname, uit de ingemeten drempels en hoogten van OurAirports (eenmalig gedownload, offline bewaard), een streepje bij elke zeemijl, benoemd naar luchthaven en baan | nieuw |
| Hoogtebeperkingen (alarm bij plafond/vloer) | **Hoogtebeperking**: een vloer en een plafond; labels van eenheden buiten die grenzen worden rood, en elke overschrijding (onder de vloer, boven het plafond, weer binnen) wordt opgesomd. Een klik gaat daarheen en volgt de eenheid | nieuw |
| Vernietigde objecten grijs, na 15 min verwijderd | Levens eindigen met hun spoor; een gesneuveld eenheid wordt gedimd in de eenheidslijst | klaar |
| Eigenschappen Zichtbaar / Uitgeschakeld | Getoond in **Ruw**; niets wordt erdoor verborgen | nog niet |
| Stand van stick/gas/pedalen weergeven | Gas- en motorwaarden in velden; stuurinvoer in **Ruw** | klaar (als waarden) |
| Opmerkingen als ondertitels | **Berichten als ondertitels** (Labels): ACMI-gebeurtenissen Message en Comment, en chat uit elk spel (Chat-, Say- of Radio-gebeurtenissen, of een chatkolom), onderaan het beeld met wie het zei, zes seconden | nieuw |
| Datum- en UTC-tijdweergave | Tijdlijnklok met UTC waar de opname een referentietijd heeft | klaar |
| Muispositie lat/long, MGRS, bullseye | De keuzekaart (klik op een punt) geeft breedte/lengte in graden, minuten en seconden en MGRS naast de wereldmeters; bullseye per eenheid (veld) | nieuw |
| Eigen logo | Niet gebouwd | n.v.t. (huisstijl) |
| 3D-modellen, de dichtstbijzijnde als de eenheid onbekend is | Eigen figuurcatalogus, dichtstbijzijnde tegenhanger, ware grootte | klaar |
| Meerdere gevechten (lijnen tussen alle paren) | **Gevechtslijnen**: van elke eenheid in bereik naar elke tegenstander binnen het ingestelde bereik (1-200 km), elk met zijn afstand, de dichtstbijzijnde 60 paren; het gemeten paar zoals voorheen | nieuw |

## Labels {#labels}

| Tacview | 3DHeat | Status |
|---|---|---|
| Labels aan/uit, apart voor geselecteerde en niet-geselecteerde objecten | **Labels** met regels voor **Geselecteerd**, **Vliegtuigen**, **Grond**, **Schepen**, **Wapens** en **AI**: getoond of niet, eigen waarden, prioriteit | nieuw |
| Labelvelden: naam, roepnaam, piloot, snelheden (TAS/CAS/IAS/Mach/GS), hoogten (ASL/AGL), VS, AOA, AOS, G (verticaal, zijwaarts, langs), draaisnelheid en -straal, energie, brandstofgewicht/-volume/-stroom, koers/spoor, roll/pitch, hartslag | Elke waarde uit `fields.ts`: dezelfde lijst, berekend waar niet opgenomen (schattingen gemarkeerd met ~). Rolsnelheid en SpO2 alleen via Ruw. | klaar |
| Positie van de bullseye in labels | Veld **Bullseye (peiling / afstand)** | nieuw |
| ILS-afwijkingen, gevlogen afstand | Ruwe waarden; gevlogen afstand in de statistieken | klaar (deels) |
| Niet-geselecteerde telemetrie ontrommelen | **Labels uit elkaar houden**, geordend op de prioriteit van elke regel | klaar / nieuw |
| Alle grondobjecten labelen / alleen bedreigingen | De regels Grond en AI | nieuw |
| Labelgrootte | **Labelgrootte** (60-250%) | nieuw |
| Metrisch / imperiaal | Metrisch / imperiaal | klaar (twee voorinstellingen, niet acht) |

## Objectinformatie en telemetrie {#object-info-and-telemetry}

| Tacview | 3DHeat | Status |
|---|---|---|
| Primaire en secundaire selectie | Klik volgt en selecteert; shift-klik twee objecten om te meten; **Doel**-kiezer | klaar / nieuw |
| Afstand / peiling / aspect / sluiting tussen twee objecten | BRAA-lijn van het gemeten paar; velden Afstand, Peiling, Aspect en Sluiting van de gevolgde eenheid | klaar |
| Relatieve peiling, hoeksnelheid van de zichtlijn | Velden **Relatieve peiling** (van de neus van de gevolgde eenheid, L/R) en **Hoeksnelheid van de zichtlijn** (°/s) | nieuw |
| Telemetrievensters | De eenheidskaart en de zweefkaart | klaar |
| Ruwe telemetrie (elke opgenomen eigenschap, ook de onbekende) | **Ruw** in de eenheidskaart: elke kolom op de rij van de eenheid zoals geschreven | nieuw |
| Lijst van actieve objecten | **Eenheden**: spelers, AI, wapens in de lucht; levende helder | klaar |
| Venster met opname-eigenschappen (titel, auteur, briefing...) | Bewaard als kolom RecordingInfo; getoond in Ruw | klaar (geen venster) |
| Positieformaten DMS/MGRS, magnetisch noorden | **Positie (breedte / lengte)** in DMS en velden **MGRS**; een veld **Magnetische koers**; **Magnetische koersen** schrijft koers, spoor en peiling magnetisch (°M) en toont een kompas met beide noorden en de variatie: het World Magnetic Model 2025 (coëfficiënten in het publieke domein), hier berekend op de plek en datum van de eenheid | nieuw |

## Grafieken {#charts}

| Tacview | 3DHeat | Status |
|---|---|---|
| Grafiek van één object, tot 4 waarden | **In de tijd** (en de grafiek onder Replay) | klaar |
| Tot 4 objecten tegelijk plotten | **Vergelijken**: één waarde van tot 8 eenheden op één schaal | nieuw |
| Waarde tegen waarde (energie-wendbaarheid) | **Waarde tegen waarde**: draaisnelheid tegen snelheid of elk ander paar, elke eenheid een lijn, het huidige punt gemarkeerd | nieuw |
| X-as op tijd; zoomen; tijd schuiven vanuit de grafiek | Scrollwiel zoomt in de tijd, dubbelklik zet terug, klik gaat naar het moment | nieuw |
| X-as op lucht- of grondafstand | **Tijd / Luchtafstand / Grondafstand** op de tijd- en vergelijkingsgrafieken; zoomen en klikken-om-te-gaan werken hetzelfde | nieuw |
| Vooraf gedefinieerde grafieken (energie, versnelling...) | Elke waarde is te kiezen (energiehoogte en de snelheid ervan zijn waarden) | klaar |

## Statistieken, vluchtlogboek, gebeurtenissen {#statistics-flight-log-events}

| Tacview | 3DHeat | Status |
|---|---|---|
| Vluchtlogboek: opgestegen, geland, geschoten, geraakt door, vernietigd door, gebied verlaten | **Statistieken** per eenheid: levens, doden, sterfgevallen, schoten, treffers, trefferpercentage, start, landingen, tijd in de lucht, max. G (en min.), max. snelheid, hoogte en Mach, afstand. Starts komen uit TakenOff/Landed-gebeurtenissen, OnGround, AGL, of een schatting gemarkeerd met ~. | nieuw |
| Scorebord- en missierapport-add-ons | Samenvatting per team en de meeste doden; het eigen scorebord van de matchsamenvatting | nieuw / klaar |
| Vluchtlogboek exporteren als XML/CSV | **CSV exporteren** van de statistieken, en van de gebeurtenissen zoals ze staan | nieuw (alleen CSV) |
| Telemetrie als CSV exporteren met een snelheid | **Telemetrie van de geselecteerde eenheid**: elke waarde, 1-20 per seconde | nieuw |
| Gebeurtenislogboek, dubbelklik om erheen te gaan en te selecteren | Lijst **Gebeurtenissen**, gefilterd op soort en eenheid; een klik vliegt erheen | klaar |
| Vorige / volgende gebeurtenis (Ctrl+←/→) | **Page Up / Page Down** | nieuw |
| Pauzeren bij gebeurtenis | **Pauze bij gebeurtenis** | nieuw |
| Tijdlijnmarkeringen (vrijgaven, treffers, vernietigingen; die van het geselecteerde object in blauw; bladwijzers rood) | Doden en sterfgevallen als dichtheidsbalk, die van de gevolgde eenheid in blauw, bladwijzers rood; klik om te gaan | nieuw |
| Een gebeurtenis verwijderen, doding verwijderen | Niet gebouwd | n.v.t. (gebeurtenissen horen bij de opname; filters verbergen ze) |

## Bladwijzers {#bookmarks}

| Tacview | 3DHeat | Status |
|---|---|---|
| Bladwijzer invoegen met selectie en gezichtspunt | **Bladwijzer toevoegen** (B): het moment, de vrije camera of de gevolgde eenheid met haar weergave, afstand en doel; benoemd; bewaard in deze browser per opname | nieuw |
| Bladwijzer verwijderen | × in de lijst | nieuw |
| Bladwijzers op de tijdlijn en in de logboeken | Rode markeringen; de lijst | nieuw |
| Event=Bookmark in ACMI | Vermeld bij de markeringen van de opname, naast doden, sterfgevallen en berichten | nieuw |
| Sneltoets kopiëren/plakken (een weergave delen) | **Bladwijzers exporteren / importeren** als bestand; C kopieert de camerapositie | nieuw |

## Afspelen {#playback}

| Tacview | 3DHeat | Status |
|---|---|---|
| Afspelen/pauzeren, naar het begin, snelheid, tijdlijn schuiven | Tijdlijn | klaar |
| Beeld voor beeld | **,** en **.** een seconde terug en vooruit (Shift: tien) | nieuw |
| Achteruit afspelen | **◀** op de tijdlijn, **J** (**L** vooruit; dezelfde toets nogmaals pauzeert): speelt van het einde naar het begin met de gekozen snelheid, herhalend of stoppend bij het begin | nieuw |
| Dialoog tijdsprong | De tijdlijn en de gebeurtenislijst | klaar |
| Tijdverschuiving van één object (spook) | **Tijdverschuiving en inkorten**: de vlucht van één eenheid, of een hele opname, zoveel seconden verschuiven; **Opnames gelijkzetten** verschuift meerdere opnames om samen te beginnen en speelt ze tegelijk af (twee vluchten op verschillende dagen naast elkaar). De opname wordt opnieuw opgebouwd, zodat sporen, gebeurtenissen, grafieken en statistieken meegaan | nieuw |
| Voor/na bijsnijden | **Vanaf nu / Tot nu / Tot deze span** (ongedaan maken houdt de verschuivingen), daarna **CSV exporteren** (laadt terug in 3DHeat) of **ACMI exporteren** (Tacview 2.2-tekst, voor een opname op de aarde geplaatst) | nieuw |

## Terrein en kaart {#terrain-and-map}

| Tacview | 3DHeat | Status |
|---|---|---|
| Echt terrein, eigen hoogte en texturen | Niveaus (de eigen kaart van het spel als 3D-model), tegels van de wereldachtergrond | klaar |
| Vlakke / lege / hoog-contrast terreinmodi | [Uiterlijk van niveau](level-appearance.md): reliëf van de grond, ondergrond en structuren wel of niet getoond | klaar (niet dezelfde modi) |
| 2D-tactische kaart (Tacview heeft er geen: satellietweergave) | **2D-kaart**: hoek of hele weergave, symbolen naar soort en team (gevulde spelers, omlijnde AI) gedraaid naar hun koers, sporen, namen, schaalbalk, bereikringen rond de gevolgde eenheid, bullseye-ringen, de plek van de 3D-camera, recente sterfgevallen; slepen, wiel, klikken om te volgen (M) | nieuw |
| Statische objecten (luchthavens, banen, wegpunten, gebieden, KML) | Ingemeten landingsbanen (OurAirports) in de wereldachtergrond en hun glijpaden; GPX-wegpunten en KML-plaatsmerken worden als staande objecten geladen; het [Tactisch bord](tactics-board.md) tekent gebieden en routes | nieuw |

## Importeren, exporteren, opnemen {#import-export-recording}

| Tacview | 3DHeat | Status |
|---|---|---|
| ACMI-tekst en zip | [Tacview ACMI](tacview-acmi.md) | klaar |
| GPX, KML, CSV, NMEA, IGC, FIT, DIS... | **GPX** (tracks, routes, wegpunten; hartslag, cadans, vermogen en temperatuur van Garmin), **KML/KMZ** (gx:Track, LineString, Point), **NMEA 0183** (RMC en GGA van elke talker, controlesommen gecontroleerd, over middernacht heen), **IGC** (B-records, datum, piloot en zweefvliegtuig), **FIT** (recordberichten, gecomprimeerde tijdstempels) - elk op breedte- en lengtegraad op het vlak in het midden van de tracks geplaatst, zodat de wereldachtergrond klopt; koers, neiging en snelheid uit het bestand of van fix naar fix. CSV en Parquet zoals voorheen | nieuw (DIS n.v.t.: een live netwerkprotocol) |
| Eigen opnemers (DCS, BMS, IL-2, MSFS...) | De eigen converters van 3DHeat (War Thunder, CS2, Squad, Arma en andere) | klaar (eigen) |
| Realtime telemetrie via TCP, ADS-B | Niet gebouwd | n.v.t. (replays na de match) |
| Gesynchroniseerde audio/video | **Audio en video**: een lokaal bestand speelt, pauzeert, zoekt en wisselt van snelheid mee met de tijdlijn vanaf een vast startpunt (**Begint nu**, ±0,1 s); een video in een vergroot paneel boven het beeld, of beeld-in-beeld. Het bestand blijft in de browser | nieuw |
| Video-export | [Cameraroute en video](camera-path-and-video.md) | klaar |

## Overig {#other}

| Tacview | 3DHeat | Status |
|---|---|---|
| Lua-add-ons | Niet gebouwd | n.v.t. (open source: verander de viewer zelf) |
| Online nabespreking (gedeelde sessie) | Niet gebouwd | n.v.t. (die van Tacview is een gehoste sessie die iedereen op één afspeelpositie houdt. 3DHeat heeft geen server en bewaart opnames op de computer van de viewer, en zelfs een peer-to-peer-verbinding heeft een signaleringsserver nodig. Een nabespreking wordt gedeeld als bestanden: de bijgesneden opname (ACMI of CSV exporteren) en het bestand met bladwijzers, die op dezelfde momenten en weergaven openen) |
| Instructeur-afstandsbediening | Niet gebouwd | n.v.t. (bestuurt een lopende simulator) |
| Objectbewerking (objecten toevoegen, wijzigen, verwijderen) | [Tactisch bord](tactics-board.md) voor geplande objecten; opnames zijn alleen-lezen | n.v.t. |
| Talen | 40 talen | klaar |
| Authenticatie van opnames | Niet gebouwd | n.v.t. |

## Voor ontwikkelaars: ACMI 2.2-eigenschappen {#for-developers-acmi-22-properties}

Gelezen door `data/acmi.ts`. Numerieke eigenschappen worden getalkolommen, tekstuele categoriekolommen. Alle worden onder **Ruw** in de eenheidskaart getoond. Deze worden voor een doel gelezen:

| Eigenschappen | Gebruik |
|---|---|
| T (alle vier vormen), Name, Type, Pilot, Group, Country, Coalition, Color, CallSign | Positie, houding, figuur, naam van de eenheid, team |
| IAS, CAS, TAS, Mach, AOA, AOS, AGL, HDG, HDM, OnGround | Velden, grafieken, HUD, detectie van start en landing |
| VerticalGForce, LongitudinalGForce, LateralGForce | G-velden |
| Throttle(2), Afterburner, EngineRPM(2), NR, AirBrakes, Flaps, LandingGear, Tailhook | Velden |
| FuelWeight..9, FuelVolume..9, FuelFlowWeight..8 | Brandstofvelden, opgeteld over de tanks |
| RadarMode, RadarAzimuth, RadarElevation, RadarRoll, RadarRange, RadarHorizontalBeamwidth, RadarVerticalBeamwidth, RadarRangeGateAzimuth/Elevation/Min/Max/HorizontalBeamwidth/VerticalBeamwidth | Radarkegels en bereikpoort |
| LockedTarget..9, LockedTargetMode, LockedTargetAzimuth/Elevation/Range, FocusedTarget | Locklijnen |
| EngagementMode(2), EngagementRange(2), VerticalEngagementRange(2) | Bereikkoepels |
| QNH, AltimeterSetting, WindSpeed, WindDirection, HeartRate | Velden |
| Health | Veld |
| Gebeurtenissen: Destroyed, TakenOff, Landed, Bookmark, Message, Comment, LeftArea, Timeout | Gebeurtenislijst, statistieken (doden, starts, landingen), bladwijzers; Message en Comment als ondertitels |
| PilotHeadYaw, PilotHeadPitch | Kijklijn van de piloot |
| Typetag Bullseye (Navaid+Static+Bullseye) | Bullseye-veld en kaartringen |
| Al het andere (PilotHeadRoll, bediening, oppervlakken, ILS-afwijkingen, SpO2, ENL, Label, Debug, Importance, Slot, Visible, Disabled, Radius, afmetingen...) | Getoond zoals geschreven onder **Ruw** |

Radar- en lockhoeken worden gemeten ten opzichte van de eigen assen van de eenheid: azimut naar rechts, elevatie omhoog, roll rechtervleugel omlaag. De ACMI-specificatie zegt dat ze ten opzichte van het vliegtuig zijn, maar niet welke richting positief is. Deze lezing volgt zijn transformatie (gier met de klok mee, neus omhoog, roll rechts omlaag).
