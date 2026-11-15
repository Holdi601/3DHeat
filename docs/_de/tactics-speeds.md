---
title: "Bewegungsgeschwindigkeiten"
parent: "Taktik-Tafel"
nav_order: 1
lang: "de"
source: "tactics-speeds.md"
source_hash: "2c00ee3717c2"
translated: true
outdated: false
---

# Bewegungsgeschwindigkeiten

Wie lange braucht ein Soldat, ein Panzer oder ein Jet, um von A nach B zu kommen? Diese Seite sagt, wie schnell sich jede Figur auf dem [Taktik-Board](tactics-board.md) bewegt und woher diese Zahlen kommen, damit du den Zeiten in deinem Plan trauen oder sie ändern kannst.

Das [Taktik-Board](tactics-board.md) setzt einen Plan in Zeit um, abhängig davon, wie schnell sich jede Figur bewegt. Die Geschwindigkeiten kommen aus einer Datei pro Spiel in `src/tactics/speeds/`: eine Geschwindigkeit für jeden Bewegungsmodus jeder Klasse (Infanterie, Landfahrzeuge, Boote, Flugzeuge, Hubschrauber), dazu benannte Profile, zum Beispiel eines pro CS2-Waffe oder eines pro Flugzeugtyp. Jede Datei nennt ihre Quellen, und jeder Wert sagt, ob er **offiziell** ist (die eigenen Daten des Spiels oder die veröffentlichten Werte eines echten Flugzeugs) oder **ungefähr** (von der Community gemessen oder ein typischer Wert).

Das sind Ausgangspunkte. **Jede Figur kann ihre Geschwindigkeiten auf dem Board überschreiben**, so dass ein Plan eine gemessene Geschwindigkeit, einen schwer beladenen Soldaten oder einen beschädigten Panzer nutzen kann.

## Modi {#modes}

| Klasse | Modi |
|---|---|
| Infanterie | kriechen (liegend), ducken, gehen (das langsame, leise Gehen), laufen (Standardbewegung), sprinten |
| Landfahrzeuge, Boote | kriechen, vorsichtig, normal (im Gelände), Eile (Höchstgeschwindigkeit auf der Straße) |
| Flugzeuge, Hubschrauber | langsam (Anflug, Warteschleife, Schwebeflug am Boden), Reise, Kampf (Kurvengeschwindigkeit oder Angriffsflug), maximal |

Ein Modus, den das Spiel nicht hat, bleibt leer: CS2 und Valorant haben kein Sprinten und kein Liegen.

## Hänge {#slopes}

Jede Datei sagt außerdem, wie das Spiel Hänge behandelt. CS2, Valorant und Squad begrenzen die horizontale Geschwindigkeit, so dass ein Hang einen Spieler nicht bremst. Arma bremst Infanterie an Hängen, deshalb nutzen seine Datei und die allgemeine die Wanderfunktion nach Tobler. Battlefield und die Fahrzeugsimulationen nutzen eine einfache Steigungsstrafe.

## Pro Spiel {#per-game}

**Counter-Strike 2** (Einheiten pro Sekunde; eine Einheit gilt als ein Zoll). **Offiziell.** Laufgeschwindigkeiten sind die Werte `m_flMaxSpeed` in den Waffendefinitionen des Spiels: Messer und C4 250, Granaten 245, Pistolen 240 (Desert Eagle 230, R8 180), MPs 220 bis 240, Gewehre 210 bis 225, AWP 200, leichte MGs 195 und 150. Die AWP mit Zielfernrohr (100), AUG und SG 553 (150) sowie G3SG1 und SCAR-20 (120) haben eigene Profile. Gehen ist Laufen × 0,52, Ducken ist Laufen × 0,34. Valve veröffentlicht diese beiden Faktoren nicht, aber jede Waffe zeigt sie in Demo-Aufnahmen. Um einen Plan gegen echte Bewegung zu prüfen, lade eine Demo auf derselben Karte und vergleiche die Geschwindigkeiten der Spieler.

**Valorant** (m/s). Das Messer läuft mit 6,75 m/s. Jede Waffe multipliziert das mit ihrem Laufgeschwindigkeits-Faktor aus den Spieldaten, was die Geschwindigkeiten ergibt, die das Arsenal im Spiel zeigt: 5,73 für die meisten Pistolen und MPs, 5,4 für Gewehre, 5,13 für schwere Waffen und den Operator, 5,06 für Schrotflinten. Diese Laufgeschwindigkeiten sind genau. Geh- und Duckgeschwindigkeiten sind **Schätzungen** (0,55 und 0,4 × Laufen), weil Riot sie nicht veröffentlicht. Auch die Profile der Scharfschützen mit Zielfernrohr sind Schätzungen.

**Battlefield** (km/h). **Ungefähr.** EA veröffentlicht keine Bewegungswerte. Infanterie: etwa 1 m/s liegend, 2 geduckt, 4 laufend und 6,4 sprintend. Fahrzeuge, Jets, Hubschrauber und Boote bekommen typische Geschwindigkeiten im Spiel für ihre Klasse.

**Squad** (km/h). **Ungefähr.** Laufen (3,3 m/s) und Sprinten (5,9 m/s) stammen aus einer Community-Beschreibung der Spielmechanik. Kriechen, Ducken und langsames Gehen sind Schätzungen, und ebenso jede Fahrzeugklasse und jeder Hubschrauber.

**Arma** (km/h). **Ungefähr.** Die Infanterie-Tempi sind Community-Messungen: etwa 5 km/h Gehen, 9 km/h taktisches Tempo geduckt, 15 km/h Joggen und etwa 21 km/h Sprint. Die Höchstgeschwindigkeiten der Fahrzeuge sind die konfigurierten Maxima der Standard-Fahrzeuge von Arma 3 in jeder Klasse, aus einer Übersicht Dritter. Die langsameren Fahrzeugmodi sind Schätzungen.

**DCS / War Thunder / IL-2** (km/h). Jedes Flugzeug und jeder Hubschrauber in der Palette hat ein eigenes Profil. Reise- und Höchstgeschwindigkeiten sind die **veröffentlichten Werte** der echten Flugzeuge, die die Simulationen genau nachbilden. Das Maximum gilt auf Meereshöhe für Jets und in der Nennhöhe für Propellerflugzeuge; die Notiz jedes Profils sagt, welche. Langsame und Kampfgeschwindigkeiten sind typische Werte. Landfahrzeuge nutzen die veröffentlichten Straßengeschwindigkeiten der echten Fahrzeuge, gerundet (**ungefähr**). Schiffe nutzen die veröffentlichten Höchstgeschwindigkeiten ihrer Klasse.

**Sonstige** (m/s). **Ungefähre** reale Standardwerte: kriechen 0,5, ducken 1,5, gehen 1,4, laufen 3,5, sprinten 6.

## Quellen {#sources}

Counter-Strike 2
- [CS2-Waffendefinitionen (`weapons.vdata`), SteamDB GameTracking-CS2](https://github.com/SteamDatabase/GameTracking-CS2/blob/master/game/csgo/pak01_dir/scripts/weapons.vdata)
- [CSDB-Waffenseiten](https://csdb.gg/weapons/)
- [Counter-Strike Wiki: Movement Mechanics](https://counterstrikewiki.com/Movement_Mechanics)

Valorant
- [valorant-api.com Waffen (Laufgeschwindigkeits-Faktoren)](https://valorant-api.com/v1/weapons)
- [VLR.gg: Messgeschwindigkeit 6,75 m/s](https://vlr.gg/post/4240306)
- [Riot-Support: Gehen, Laufen und Ducken](https://support.riotgames.com/en-us/valorant/gameplay/walking-running-and-crouching)

Battlefield
- [EA-Foren: Bewegungsgeschwindigkeit in Battlefield 6](https://forums.ea.com/discussions/battlefield-6-beta-feedback-en/movement-speed/12440378)
- [Battlefield-6-Bewegungsleitfaden](https://deltiasgaming.com/?p=309455)
- [Vorab-Bericht zu einem Sprint mit 6,4 m/s](https://www.reddit.com/r/Battlefield/comments/1jci338/for_reference/mi9ahrb/)

Squad
- [r/joinsquad: Beitrag zu den Spielmechaniken von Squad (2018)](https://www.reddit.com/r/joinsquad/comments/7xeh9g/squad_game_mechanics_post/)
- [Squad](https://joinsquad.com/) (veröffentlicht keine Geschwindigkeiten)

Arma
- [Bohemia-Foren: Gehgeschwindigkeit](https://forums.bohemia.net/forums/topic/176583-walking-speed/)
- [Bohemia-Foren: Bewegungsgeschwindigkeit anpassen](https://forums.bistudio.com/topic/144224-movement-speed-tweaking/)
- [Arma-3-Feedback-Tracker: Sprintgeschwindigkeit](https://feedback.bistudio.com/T64047)
- [Arma 3 Field Manual: Infantry Controls](https://community.bistudio.com/wiki/Arma_3_Field_Manual_-_Infantry_Controls)
- [Arma-3-Fahrzeugwerte nach Fraktion (holy.gg)](https://www.holy.gg/en/post/arma-3-complete-vehicle-stats-by-faction)

DCS / War Thunder / IL-2
- Die Wikipedia-Angaben zu jedem Flugzeug- und Hubschraubertyp, verlinkt von jedem Profil in `air.json`
- [V-Geschwindigkeiten](https://en.wikipedia.org/wiki/V_speeds), für typische Anflug- und Kampfgeschwindigkeiten
- [War-Thunder-Wiki](https://wiki.warthunder.com/), für Landfahrzeuge
- [Arleigh-Burke-Klasse (Zerstörer)](https://en.wikipedia.org/wiki/Arleigh_Burke-class_destroyer), und die veröffentlichten Geschwindigkeiten der anderen Schiffsklassen

Sonstige
- [Bevorzugte Gehgeschwindigkeit](https://en.wikipedia.org/wiki/Preferred_walking_speed)
- [Toblers Wanderfunktion](https://en.wikipedia.org/wiki/Tobler%27s_hiking_function)
