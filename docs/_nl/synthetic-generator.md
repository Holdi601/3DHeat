---
title: "Synthetische generator"
parent: "Gegevens binnenhalen"
nav_order: 5
lang: "nl"
source: "synthetic-generator.md"
source_hash: "7a97459b7817"
translated: true
outdated: false
---

# Synthetische generator

Geen eigen data? Druk op één knop en 3DHeat verzint een schijngevecht voor je, zo klein of zo groot als je wilt.

1. Open het paneel **Dataset** in de zijbalk Warmte (onder **Bron**).
2. Scrol naar **Synthetische generator**.
3. Stel **Rijen (miljoen)** in. Probeer eerst 1: de standaard van 8 miljoen is zwaar voor een eerste poging.
4. Druk op **Genereren**.

![1 miljoen rijen, 8 teams, getekend in Teamwarmte](../assets/img/en/synthetic-generator-team-heat.webp)

Het paneel **Dataset** kan een dataset genereren in plaats van er één te laden. Het is bedoeld voor twee dingen: de viewer uitproberen zonder eigen data, en controleren of een bepaald aantal rijen, een bepaalde spriteradius en een bepaald budget op een computer een bruikbare framesnelheid halen, *voordat* je er een grote echte lading aan waagt. De beweging lijkt op een battle-royale-wedstrijd - teams beginnen ver uit elkaar en worden daarna samengedrukt - omdat uniforme ruis er bij elk budget goed uitziet en juist de artefacten verbergt die het waard zijn om te vinden.

## Bediening {#controls}

| Bediening | Standaard | Betekenis |
|---|---|---|
| **Rijen (miljoen)** | 8 | Te genereren rijen. Naar beneden afgerond op een heel aantal ticks voor elke speler. |
| **Teams** | 8 | Aantal groepen (minstens 1). |
| **Per team** | 12 | Spelers per groep (minstens 1). |
| **Halve kaartbreedte (m)** | 4000 | De helft van de breedte van het speelbare gebied op X en Z. |
| Schattingsregel | | "≈ X GB RAM, Y GB op de GPU na kwantisatie." (ongeveer 26 bytes RAM en 8 bytes op de GPU per rij). |
| **Genereren** | | Genereert in de inlaadworker, met voortgang, en vervangt elke geladen dataset. |

Het genereren draait in de achtergrondworker, dus tientallen miljoenen rijen bevriezen de pagina niet.

## Wat het genereert {#what-it-generates}

Uit [`src/data/synth.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/synth.ts):

- **Kolommen:** positie, tijd, persoon (`P000`, `P001`, ...), groep (`Team 1`, `Team 2`, ...), gieren en hellen, en levensduren. Geen sessiekolom en geen filterkolommen.
- **Tijd:** één monster per speler elke 0,25 s, beginnend bij 0 (relatieve tijd, geen klok).
- **Beweging:** elk team begint in zijn eigen sector van een ring op 55-95% van de halve afmeting. Een veilige cirkel rond het midden (willekeurig verschoven tot een kwart van de halve afmeting) krimpt in zes fasen met plateaus tot 8% van de halve afmeting; elke speler stuurt naar een dwalend punt erin, met demping en ruis. De hoogte golft tussen 0 en 220 m.
- **Kijkrichting:** gieren langs de bewegingsrichting, hellen uit de verticale snelheid.
- **Herhaalbaar:** het willekeurige zaad is vast (1337), dus dezelfde instellingen leveren altijd dezelfde data.

Elke warmtemodus, dozenreplay en lijnwarmte (hele sporen, want er is geen gebeurteniskolom) werken erop. De levensduurgeschiedenis werkt ook.
