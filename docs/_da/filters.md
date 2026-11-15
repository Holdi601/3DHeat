---
title: "Filtre"
parent: "Filtre og værktøjer"
nav_order: 1
lang: "da"
source: "filters.md"
source_hash: "e957bf788bda"
translated: true
outdated: false
---

# Filtre

**Filtre** skjuler de rækker, du ikke er interesseret i, som én køretøjsklasse eller én hændelsestype, og billedet opdateres med det samme. Panelet lister de kolonner, der er bevaret ved indlæsningen under *Behold til filtrering* ([Kolonnetilknytning](column-mapping.md)), plus *Kildefil*, når flere filer blev indlæst.

## Prøv det {#try-it}

1. Indlæs et datasæt, og åbn **Filtre** i sidebjælken.
2. Under **Køretøjsklasse** fjerner du markeringen ved *Tank*. Billedet ændrer sig med det samme.
3. Tryk på **Ryd alle filtre** for at fortryde.

![Filterpanelet: vieweren egne kolonner (Hændelsestype, Køretøjsklasse) først, derefter kolonnerne fra din fil](../assets/img/en/filters.webp)

De første rækker er vieweren egne kolonner (nedenfor). Rækkerne efter dem kommer fra din fil.

## Kolonner, vieweren tilføjer {#columns-the-viewer-adds}

Ved indlæsningen finder vieweren selv ud af fire kolonner og lister dem **først**, med navne og værdier på dit sprog, så det samme filter virker for hvert spil og hver datakilde:

| Kolonne | Værdier | Udregnet ud fra |
|---|---|---|
| **Hændelsestype** | 23 typer: Position, Skud affyret, Affyring (missil, raket, bombe), Træf, Miss (våben endte nær intet mål), Eksplosion, Skade, Drab, Død, Ødelagt, Styrt, Udkastning / nødudspring, Spawn, Despawn, Start, Landing, Jordkontakt, Stop på jorden, Genoprustning / optankning, Erobring / mål, Lokkemiddel, Besked, Andet | en kolonne ved navn `event`, `events`, `event_type` eller `event_name`; hvert spils egne ord (`shot`, `burst`, `fired`, `struck`, `flare`, `plant` ...) kobles til disse typer. Den fulde tabel: [Hændelsestyper og -klasser](ref-event-types.md). |
| **Spiller eller AI** | Spiller, AI | en kolonne `ai`, `is_ai`, `bot` eller `actor`; ellers `is_player` / `human`; ellers et konto-id (`user_id`, `steam_id`; tom eller 0 er AI); for Tacview-optagelser, om objektet har en pilot |
| **Køretøjsklasse** | 17 klasser: Jager, Angrebsfly, Bombefly, Andet fly, Helikopter, Tank, Panserkøretøj, Luftværn, Artilleri, Lastbil / bil, Skib, Ubåd, Infanteri, Våben, Lokkemiddel, Bygning, Andet | køretøjs- eller enhedsnavnet (matchet mod [figurkataloget](figures.md)) og typekolonnerne |
| **Målklasse** | de samme klasser | den anden parts køretøj (`other_vehicle`, `target_vehicle`, `victim_type` ...) |

Kun de typer, der forekommer, listes. Værdikolonner (`cost_*`, `earn_*`, `net_*` og *Omkostningskilde*, se [Værdivægtning](value-weighting.md)) kan filtreres ligesom enhver talkolonne: for eksempel fjern markeringen ved *estimeret* under *Omkostningskilde* for kun at beholde rækker med en pris.

En kategoriliste med mere end 12 værdier får et søgefelt (*Søg i n værdier*) og en knap **Kun disse**, der tillader præcis de værdier, der matcher.

Hvilke kolonner der kan filtreres, afgøres ved indlæsningen, fordi de dengang skal læses. Uden nogen bevaret kolonne siger panelet det og henviser til *Behold til filtrering*.

## Talkolonner (interval) {#numeric-columns-range}

![Et intervalfilter (tabt penge) med begge ender trukket ind](../assets/img/en/filters-numeric.webp)

| Del | Betydning |
|---|---|
| Navn og `min ... max` | Kolonnen og det aktuelle interval (kolonnens fulde interval, så længe intet filter er sat). |
| Første række: talfelt og skyder | Den nedre grænse. Trækker du skyderen over den øvre grænse, skubber den også den øvre grænse med. |
| Anden række: talfelt og skyder | Den øvre grænse. Trækker du under den nedre grænse, skubber den også den. |
| **Nulstil *kolonne*** | Fjerner dette filter. |

Skyderne dækker kolonnens mindste til største værdi i 1.000 trin; talfelterne accepterer enhver værdi. En række består, når dens værdi ligger inden for intervallet, begge ender medregnet. Store værdier vises i eksponentform (`1.23e6`).

## Kategorikolonner {#category-columns}

| Del | Betydning |
|---|---|
| Navn og `tilladt/i alt` | Kolonnen, og hvor mange af dens værdier der er tilladt. |
| Værdiliste | Et afkrydsningsfelt pr. værdi; en tom værdi vises som *(tom)*. |
| **Alle** / **Ingen** | Tillad alle værdier / ingen værdi. |

At tillade alle værdier fjerner filteret.

## Regler {#rules}

- **Fire filtre ad gangen.** Overskriften viser `aktive/4`. Et femte filter bliver ikke anvendt, og panelet siger det. Et valg i [Enheder](entities.md) (eller fanen Kamps spillerfokus) bruger også et af de fire. Et filter, der dækker hele kolonnen, bruger ingen.
- **En kategorikolonne har højst 4.096 værdier**; en bredere bevares ikke ved indlæsningen.
- **Filtre kombineres med OG**, og med holdsynlighed, forskelsopdelingen, tidsvinduet, afstandsudsnittet og [snittet](slice.md).
- **Ændring af et filter genstarter akkumuleringen og måler eksponeringen igen nogle billeder senere**, fordi filtrering kan ændre tætheden meget ([Farve og eksponering](colour-and-exposure.md#auto-exposure)).
- **Ryd alle filtre** fjerner alle kolonnefiltre. Holdsynlighed og spillervalg, der er sat andetsteds, bevares.
- Kolonnefiltre ændrer varmetilstandene. De ændrer ikke figurerne i [figur-replayet](box-replay.md), som følger holdsynligheden og valget i Enheder. Valget i Enheder ændrer begge.
- I [linjevarme](line-heat.md) testes et filter på den række, hvert segment *slutter* ved.
- Ved hvert nyt datasæt ryddes alle filtre.

## Til udviklere {#for-developers}

**Pladser.** Hvert aktive filter tager en af fire GPU-pladser ([`MAX_FILTER_SLOTS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)), en tekstur med 4 byte pr. række. Pladserne gives til filtrene i den rækkefølge, de sidst blev ændret ([`filterSlots`](https://github.com/Holdi601/3DHeat/blob/main/src/render/filterTables.ts), delt af shaderen og begge paneler). Efter fire viser en fejl *Kun de første 4 filtre anvendes. Ryd ét - de øvrige ignoreres, de kombineres ikke stille og roligt*, og de ekstra filtres navne lyder *kolonne (ikke anvendt)*. Filtre kører pr. række i vertex-shaderen, så en ændring af en grænse kræver ingen ny parsing og ingen ny upload.

**Filtre panelet ikke viser.** Der findes to typer mere i applikationens tilstand ([`FilterSpec`](https://github.com/Holdi601/3DHeat/blob/main/src/state/types.ts)):

- et **grupper**-filter, sat af fanen Kamp, når den fokuserer på den ene side. Det skjuler de andre grupper i alle tilstande, også en [forskel](difference.md)-opdeling efter en kolonne.
- et **personer**-filter, sat af panelet [Enheder](entities.md) og af fanen Kamp, når den fokuserer på én spiller. Det begrænser figur-replayet og varmetilstandene. I varmen er det et kategorifilter over person-id'erne og tager en af de fire pladser. Dets maske rummer 65.536 id'er ([`FILTER_MASK_CAPACITY`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)); en person ud over det tegnes ikke i varmen, mens filteret er aktivt, også selv om vedkommende er valgt. Figur-replayet viser dem stadig.
