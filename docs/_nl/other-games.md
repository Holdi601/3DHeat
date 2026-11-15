---
title: "Andere racespellen"
parent: "Race-analyse"
nav_order: 59
lang: "nl"
source: "other-games.md"
source_hash: "79f0f087f176"
translated: true
outdated: false
---

# Andere racespellen in de viewer

De viewer leest rondes uit veel racespellen, niet alleen uit één. Deze pagina somt ze op en zegt hoe je van elk spel een ronde haalt.

## De spellen {#the-games}

| Spel | Opnemer | Slip in het bestand? | Wereld gespiegeld? | Opmerkingen |
|---|---|---|---|---|
| Forza Horizon 4/5/6, Forza Motorsport | `heat3d_capture telemetry` (Data Out via UDP), of de rondebestanden van FH Companion plus hun `.tele.gz` | ja, per wiel (genormaliseerd) | ja (linkshandige wereld) | de `.tele.gz` naast elk rondebestand van FH Companion geeft de slip van elk wiel; het rondebestand alleen niet |
| Assetto Corsa, ACC, AC EVO, AC Rally | `heat3d_capture telemetry --game ac / acc / acevo / acrally` (gedeeld geheugen) | ja, per wiel | gemeten uit de rondes | ook ABS en tractiecontrole in werking, wiellasten, temperaturen |
| EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4 | `heat3d_capture telemetry --game wrc / dirtrally2 / dirtrally / dirt4` (UDP) | nee, berekend uit de wielsnelheden | gemeten uit de rondes | rally: losse ondergrond en sprongen worden anders beoordeeld |
| Richard Burns Rally | `heat3d_capture telemetry --game rbr` (NGP UDP) | nee | gemeten uit de rondes | geen wielsnelheden |
| BeamNG.drive | `heat3d_capture telemetry --game beamng` (een mod) | nee, berekend uit de wielsnelheden | gemeten uit de rondes | |
| Trackmania | de Openplanet-plugin, `telemetry --game trackmania --install` | een slipcoëfficiënt per wiel | gemeten uit de rondes | arcadefysica: slides worden anders beoordeeld |
| iRacing | geen: het eigen `.ibt`-bestand | nee (wordt niet gelogd); berekend uit de giering | nee (op basis van GPS) | zet de logging in de auto aan met Alt+L |

## Zo neem je een ronde op {#how-to-record-a-lap}

1. Kies je spel in de tabel en stel de opnemer in zoals de pagina van de opnemer voor dat spel zegt (een instelling in het spel, een mod, of niets bij iRacing). De stappen verschillen per spel, daarom staan ze in de documenten van de opnemers: [GameCapture: games](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md).
2. Start de opnemer en rijd. Hij schrijft één bestand per ronde.
3. Druk in het tabblad **Race-analyse** op **Rondebestanden laden…** en kies twee of meer rondes van dezelfde baan (zie [Rondes laden](race-loading-laps.md)).

Bij rallyspellen schrijft de opnemer één bestand per etappe. Voor Forza is het makkelijkst te beginnen met de bibliotheek van FH Companion, met de `.tele.gz`-bestanden naast de rondebestanden.

## Wat de opnemers beschrijven {#what-the-recorders-document}

Hoe elk spel wordt opgenomen, wat het verstuurt, de bronnen voor de indelingen, en welke banen je uit de bestanden kunt exporteren, beschrijven de opnemers zelf: [GameCapture: games](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md) (openbaar, in [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture)). Het rondebestand dat elke opnemer schrijft, staat in [GameCapture: het rondeformaat](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).

## Wat de viewer ermee doet {#what-the-viewer-does-with-them}

Elk spel komt uiteindelijk terecht in `heat3d-lap`-bestanden (of in een ronde-CSV, of het wordt direct gelezen, zoals iRacing's `.ibt`). Ze gebruiken de vaste kanaalnamen uit `src/race/schema.ts` en een `meta`-blok dat zegt wat hun getallen betekenen: hoe hun slip is geschaald, circuit, rally of arcade, en het oppervlak als dat bekend is. Daardoor behandelt het tabblad **Race-analyse** ze allemaal gelijk. Als er geen baanmodel is geladen, tekent het tabblad **Race-analyse** een weg uit de eigen spreiding van de rondes, zodat elk spel bruikbaar is zonder model.

Wat geen van de rallyspellen verstuurt - de bandenslip - berekent de viewer zelf: uit het contactvlak of de oppervlaktesnelheid van elk wiel tegenover de snelheid van de auto waar een spel die stuurt (`(wiel - auto) / auto`), of uit de rotatie en een rolstraal die op de ronde zelf wordt gemeten waar een spel alleen de rotatie stuurt. De slipwinkel komt uit de eigen snelheid van de auto (Forza, de AC-spellen, Trackmania, RBR), uit de snelheid van de wereld geprojecteerd op de assen van de auto (EA WRC, DiRT, BeamNG), of uit de richting van de auto tegenover het pad. Of de auto in de lucht is, volgt uit het contact van de wielen, de belastingen of de vering. Zie `src/race/derive.ts`.

Waar de wereld van een spel linkshandig is - die van Forza is dat - komt de baan in de viewer gespiegeld uit; het stuur en de vering van de rondes verraden dat, en het tabblad **Race-analyse** biedt aan een as om te keren. Spellen waarvan de handigheid niet is gedocumenteerd (RBR, BeamNG, Trackmania) worden op dezelfde manier behandeld: gemeten, niet aangenomen.

Naast de rijkanalen bewaren de opnemers wat elk spel verder toevoegt: bij de AC-spellen de werking van ABS en tractiecontrole, de remverdeling, DRS, de pitlimiter, boost en de levensduur van remblokken en -schijven; bij iRacing de hulpinstellingen, remverdeling, brandstof, olie- en watertemperaturen, en elk ander kanaal dat het logt onder de eigen naam. De viewer tekent ze uit zijn kanaaltabel - lampjes, niveaus, symbolen, grafieken - dus meer opnemen vraagt geen wijziging in de viewer.
