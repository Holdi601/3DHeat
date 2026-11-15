---
title: "Posnetki Tacview (ACMI)"
parent: "Uvoz podatkov"
nav_order: 7
lang: "sl"
source: "tacview-acmi.md"
source_hash: "48a81edbd9b3"
translated: true
outdated: false
---

# Posnetki Tacview (ACMI)

Tacview je program, ki beleži lete v letalskih simulatorjih; njegove datoteke se končajo z `.acmi`. 3DHeat jih odpre, da lahko vidite, kam je letel vsak letalnik.

Posnetki letov Tacview se naložijo kot vsaka tabela: izberite ali spustite `.acmi` (besedilo, `.txt.acmi`, ali stisnjeno, `.zip.acmi`) in pritisnite **Naloži**. Nato dobite toploto vseh letov, na zavihku **Tekma** pa predvajanje s figurami, sledmi in seznamom dogodkov ([Predvajanje tekme](match-replay.md)). ACMI je javni datotečni format Tacview ([dokumentacija](https://www.tacview.net/documentation/acmi/)); DCS (prek izvoznika Tacview), IL-2 Great Battles, Falcon BMS, X-Plane, MSFS in drugi ga pišejo, zato to bere katerega koli od njih.

## Kaj postane iz posnetka {#what-a-recording-becomes}

Ena vrstica vsakič, ko se zapiše položaj predmeta, ena vrstica na dogodek na mestu predmeta, in ena vrstica, ko predmet izgine (`Removed`, kjer je bil nazadnje). Dogodek o predmetu, ki ga še nismo videli – zaznamek, sporočilo za vse – je vrstica predmeta `(recording)` na referenčni točki. Posnetek nosi svoja navodila za branje, zato se korak preslikave izpolni sam. Bralnik zapiše te stolpce: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo`, nato vse dodatne lastnosti, ki jih ima posnetek. Njihove vloge:

| Stolpec | Vloga | Pomen |
|---|---|---|
| Time | čas | Sekunde po ReferenceTime posnetka; Unix sekunde, kadar jo ima, zato ura kaže pravi čas. |
| X, Y | položaj | Vzhod in sever, v metrih, na ravnini, ki se dotika Zemlje v referenčni točki posnetka: razdalje in smeri so blizu nje resnične, z odklonom pod tisočinko na 100 km. Sever postane svetovni -Z. |
| Altitude | položaj (navzgor) | Metri. |
| Object | oseba | Pilot in ime predmeta z njegovim id-jem, npr. `Viper 1 (F-16C_50) #a01`; brezpilotni predmet `(T-90A) #401`. |
| Coalition | ekipa | Stran (ali barva, kadar koalicije ni). |
| Heading, Pitch | pogled | Stopinje; smer 0 je sever. |
| Recording | seja | Naslov (Title) posnetka ali ime datoteke: več posnetkov se naloži drug ob drugem, ne da bi se njihove sledi združile. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | filtri | Ohranjeno za filtriranje; Type in Name izbereta [figuro](figures.md) vsakega predmeta, Event napaja seznam dogodkov pri pregledu, Roll nagne letalo. |
| U, V | | Lastni ravninski metri igre, kadar jih ima vsak vzorec (DCS jih zapiše). |
| EventObjects | filtri | Vsak predmet, ki ga dogodek imenuje (`Message|a01|b02|...`), po id-ju. |
| RecordingInfo | | Lastnosti posnetka, kakršne so bile ob tistem trenutku – DataSource, DataRecorder, Author, Category, Briefing, Comments, ... – kot JSON. |
| IAS, Mach, AOA, FuelWeight, ... | filtri | Vsaka druga številska lastnost, ki jo ima posnetek. |
| Parent, CallSign, LockedTarget, Label, Shape, ... | filtri | Vsaka druga besedilna lastnost, ki jo ima posnetek; lastnost z vrednostjo, ki ni število, je besedilo. |

Berejo se vse štiri oblike položaja Tacview (`lon|lat|alt`, z `u|v`, z `roll|pitch|yaw`, in z vsemi temi in smerjo), prazna polja pa ohranijo zadnjo vrednost; `-id` odstrani predmet, id, ki se pozneje ponovno uporabi, pa je nov predmet. Obravnavajo se pobegnjene vejice in nadaljevane vrstice.

Položaji se vedno projicirajo iz zemljepisne širine in dolžine, nikoli se ne vzamejo iz U/V, zato posnetki iz vseh iger delijo isto projekcijo z ozadjem pravega sveta.
