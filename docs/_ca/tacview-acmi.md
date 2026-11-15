---
title: "Gravacions de Tacview (ACMI)"
parent: "Carregar dades"
nav_order: 7
lang: "ca"
source: "tacview-acmi.md"
source_hash: "48a81edbd9b3"
translated: true
outdated: false
---

# Gravacions de Tacview (ACMI)

Tacview és un programa que grava vols en simuladors de vol; els seus fitxers acaben en `.acmi`. 3DHeat els obre perquè puguis veure on ha volat cada avió.

Les gravacions de vol de Tacview es carreguen com qualsevol taula: tria o arrossega un `.acmi` (text, `.txt.acmi`, o comprimit, `.zip.acmi`) i prem **Carrega**. Aleshores obtens la calor de tots els vols, i a la pestanya **Partida** una repetició amb figures, traces i una llista d'esdeveniments ([Repetició de partida](match-replay.md)). ACMI és el format públic de fitxers de Tacview ([documentació](https://www.tacview.net/documentation/acmi/)); DCS (a través de l'exportador de Tacview), IL-2 Great Battles, Falcon BMS, X-Plane, MSFS i altres el escriuen, així que això llegeix qualsevol d'ells.

## Què es converteix una gravació {#what-a-recording-becomes}

Una fila cada vegada que s'escriu la posició d'un objecte, una fila per esdeveniment a la posició de l'objecte, i una fila quan un objecte surt (`Removed`, on era per última vegada). Un esdeveniment sobre cap objecte encara no vist —un marcador, un missatge a tots— és una fila de l'objecte `(recording)` al punt de referència. La gravació porta les seves pròpies instruccions de lectura, així que el pas d'assignació s'omple sol. El lector escriu aquestes columnes: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo`, i després qualsevol altra propietat que tingui la gravació. Els seus papers:

| Columna | Paper | Significat |
|---|---|---|
| Time | temps | Segons després del ReferenceTime de la gravació; segons Unix quan en té un, de manera que el rellotge mostra l'hora real. |
| X, Y | posició | Est i nord, en metres, sobre un pla que toca la terra al punt de referència de la gravació: les distàncies i els rumbs són veritables a prop, i s'desvien menys d'una part per mil a 100 km. El nord esdevé el -Z del món. |
| Altitude | posició (amunt) | Metres. |
| Object | persona | El pilot i el nom de l'objecte amb el seu id, p. ex. `Viper 1 (F-16C_50) #a01`; un objecte sense tripulació `(T-90A) #401`. |
| Coalition | equip | El bàndol (o el color, quan no hi ha coalició). |
| Heading, Pitch | mirada | Graus; el rumb 0 és el nord. |
| Recording | sessió | El Title de la gravació, o el nom del fitxer: diverses gravacions es carreguen una al costat de l'altra sense que se'n barregin les traces. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | filtres | Es guarden per filtrar; Type i Name trien la [figura](figures.md) de cada objecte, Event alimenta la llista d'esdeveniments del resum, Roll inclina l'avió. |
| U, V | | Els metres plans propis del joc, quan totes les mostres els tenen (DCS els escriu). |
| EventObjects | filtres | Cada objecte que nomena un esdeveniment (`Message|a01|b02|...`), per id. |
| RecordingInfo | | Les propietats pròpies de la gravació tal com estaven en aquell moment —DataSource, DataRecorder, Author, Category, Briefing, Comments, ...— en JSON. |
| IAS, Mach, AOA, FuelWeight, ... | filtres | Qualsevol altra propietat numèrica que porti la gravació. |
| Parent, CallSign, LockedTarget, Label, Shape, ... | filtres | Qualsevol altra propietat de text que porti la gravació; una propietat amb un valor que no és un número és text. |

Es llegeixen totes les quatre formes de posició de Tacview (`lon|lat|alt`, amb `u|v`, amb `roll|pitch|yaw`, i amb totes elles més un rumb), i els camps buits mantenen l'últim valor; `-id` treu un objecte, i un id usat de nou després d'això és un objecte nou. Es tracten les comes escapades i les línies continuades.

Les posicions sempre es projecten des de la latitud i la longitud, mai no es prenen de U/V, de manera que les gravacions de tots els jocs comparteixen una mateixa projecció amb un fons del món real.
