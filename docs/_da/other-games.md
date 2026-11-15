---
title: "Andre racerspil"
parent: "Løbsanalyse"
nav_order: 59
lang: "da"
source: "other-games.md"
source_hash: "79f0f087f176"
translated: true
outdated: false
---

# Andre racerspil i fremviseren

Fremviseren læser omgange fra mange racerspil, ikke kun fra ét. Denne side viser dem og forklarer, hvordan du får en omgang ud af hvert af dem.

## Spillene {#the-games}

| Spil | Optager | Glidning i filen? | Verden spejlvendt? | Noter |
|---|---|---|---|---|
| Forza Horizon 4/5/6, Forza Motorsport | `heat3d_capture telemetry` (Data Out over UDP), eller FH Companions omgangsfiler plus deres `.tele.gz` | ja, pr. hjul (normaliseret) | ja (venstrehåndet verden) | `.tele.gz`-filen ved siden af hver FH Companion-omgang giver hvert hjuls glidning. Omgangsfilen alene gør ikke. |
| Assetto Corsa, ACC, AC EVO, AC Rally | `heat3d_capture telemetry --game ac / acc / acevo / acrally` (delt hukommelse) | ja, pr. hjul | målt ud fra omgangene | desuden ABS og traktionskontrol, der griber ind, hjulbelastninger, temperaturer |
| EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4 | `heat3d_capture telemetry --game wrc / dirtrally2 / dirtrally / dirt4` (UDP) | nej, udregnet ud fra hjulhastigheder | målt ud fra omgangene | rally: løst underlag og spring vurderes anderledes |
| Richard Burns Rally | `heat3d_capture telemetry --game rbr` (NGP UDP) | nej | målt ud fra omgangene | ingen hjulhastigheder |
| BeamNG.drive | `heat3d_capture telemetry --game beamng` (en mod) | nej, udregnet ud fra hjulhastigheder | målt ud fra omgangene | |
| Trackmania | Openplanet-pluginet, `telemetry --game trackmania --install` | en glidningskoefficient pr. hjul | målt ud fra omgangene | arkadefysik: udglidninger vurderes anderledes |
| iRacing | ingen: sin egen `.ibt`-fil | nej (ikke logget); udregnet ud fra giringen | nej (GPS-baseret) | slå logning til i bilen med Alt+L |

## Sådan optager du en omgang {#how-to-record-a-lap}

1. Find dit spil i tabellen, og sæt det op, som optagerens side for spillet beskriver (en indstilling i spillet, en mod, eller slet intet for iRacing). Trinene er forskellige fra spil til spil, så de står i optagernes dokumentation: [GameCapture: spil](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md).
2. Start optageren, og kør. Den skriver én fil pr. omgang.
3. Tryk på fanen **Løbsanalyse** på **Indlæs omgangsfiler …**, og vælg to eller flere omgange af samme bane (se [Indlæsning af omgange](race-loading-laps.md)).

Til rally-spil giver optageren én fil pr. etapeforsøg. Til Forza er den nemmeste start FH Companions bibliotek med dets `.tele.gz`-filer ved siden af omgangsfilerne.

## Hvad optagerne dokumenterer {#what-the-recorders-document}

Hvordan hvert spil optages, hvad det sender, kilderne til dets layouts og hvilke baner der kan eksporteres fra dets filer, er optagernes at dokumentere: [GameCapture: spil](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md) (offentlig, i [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture)). Omgangsfilen, som alle optagere skriver, beskrives i [GameCapture: omgangsformatet](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).

## Hvad fremviseren gør med dem {#what-the-viewer-does-with-them}

Alle spil ender som `heat3d-lap`-filer (eller en omgangs-CSV, eller læses direkte, som iRacings `.ibt` gøres), med de kanoniske kanalnavne fra `src/race/schema.ts` og en `meta`-blok, der siger, hvad dens tal betyder: hvordan glidningen er skaleret, bane, rally eller arkade, underlaget når det er kendt. Så fanen **Løbsanalyse** behandler dem alle ens. Når ingen banemodel er indlæst, tegner fanen **Løbsanalyse** en vej ud fra omgangenes egen spredning, så alle spil kan bruges uden en.

Det, ingen af rally-spillene sender, nemlig dækkets glidning, udregner fremviseren. Hvor et spil sender kontaktfladen eller overfladehastigheden for hvert hjul, sammenlignes den med bilens hastighed (`(wheel - car) / car`). Hvor spillet kun sender rotation, bruges rotationen og en rulleradius målt på selve omgangen. Driftvinklen kommer fra bilens egen hastighed (Forza, AC-spillene, Trackmania, RBR), fra verdenshastigheden projiceret på bilens akser (EA WRC, DiRT, BeamNG) eller fra retningen i forhold til banen. Om bilen er i luften, ser man på hjulenes kontakt, belastninger eller affjedring. Se `src/race/derive.ts`.

Hvor et spils verden er venstrehåndet, sådan som Forzas er, bliver banen spejlvendt i fremviseren. Omgangenes egen styring og affjedring afslører det, og fanen **Løbsanalyse** tilbyder at vende en akse. Spil, hvis hånd ikke er dokumenteret (RBR, BeamNG, Trackmania), behandles på samme måde: målt, ikke antaget.

Ud over kørekanalerne gemmer optagerne det, hvert spil tilføjer: AC-spillenes ABS og traktionskontrol i drift, bremsefordeling, DRS, pitbegrænser, boost og slidtid for bremseklodser og -skiver. iRacings hjælpeindstillinger, bremsefordeling, brændstof, olie- og vandtemperaturer og alle andre kanaler, det logger under sit eget navn. Fremviseren tegner dem ud fra sin kanaltabel (lamper, niveauer, symboler, grafer), så flere optagede data kræver ingen ændring i fremviseren.
