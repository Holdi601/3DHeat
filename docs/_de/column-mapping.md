---
title: "Spaltenzuordnung"
parent: "Daten laden"
nav_order: 2
lang: "de"
source: "column-mapping.md"
source_hash: "8ea2f450df99"
translated: true
outdated: false
---

# Spaltenzuordnung

Eine Datei ist eine Tabelle, und 3DHeat muss wissen, welche Spalte die Position in Ost-West-Richtung enthält, welche die Zeit, welche den Namen des Spielers und so weiter. Dieses Feld zeigt, was es vermutet hat, und dort korrigierst du eine falsche Vermutung.

![Das Feld Spaltenzuordnung nach dem Laden einer Parquet-Datei: jedes Kästchen schon gefüllt – 1 X, 2 Y, 3 Z, 4 Zeit, 5 Personen-ID, 6 Session / Match, 7 Team / Gruppe](../assets/img/en/column-mapping-panel.webp)

*Die Datei hat ihre Spalten selbst benannt, deshalb ist jedes Kästchen schon gefüllt.*

Zum Beispiel ordnet sich eine CSV mit der Kopfzeile `x,y,z,t,player,team` selbst zu: x, y und z werden die Position, `t` die Zeit, `player` die [Person](glossary.md) und `team` die [Gruppe](glossary.md).

Nachdem Dateien gewählt sind, öffnet sich das Feld **Spaltenzuordnung** unter dem Feld Quelle. Es sagt, welche Spalte welche Rolle spielt. Es wird automatisch ausgefüllt, und jedes Feld kann vor dem Drücken von **Laden** geändert werden; die Zuordnung wird zur Ladezeit gelesen, also heißt eine nachträgliche Änderung neu laden.

## Die Felder {#the-fields}

Alle Spaltenmenüs listen jede Spalte der ersten Datei plus *– keine –*.

| Feld | Rolle | Hinweise |
|---|---|---|
| **Trennzeichen** | Nur CSV: das Feldtrennzeichen. | Menü: *Komma ,*, *Semikolon ;*, *Tab*, *Pipe \|*, *Leerzeichen*; oder ein einzelnes Zeichen in *oder ein Zeichen eintippen*. Wird automatisch erkannt (siehe unten). Ändern startet die automatische Zuordnung neu, Änderungen davor gehen verloren. |
| **X**, **Y**, **Z** | Position. | Mindestens zwei sind nötig; eine nicht zugeordnete dritte Achse ist 0 (die Daten liegen in einer Ebene). Dieselbe Spalte auf zwei Achsen ist ein Fehler. |
| **Hochachse in der Quelle** | Welche Quellachse nach oben zeigt. | *Z ist oben (die meisten Spiel-Engines)* oder *Y ist oben (Grafik-Konvention)*. Siehe [Achsen, Einheiten und Zeit](axes-units-and-time.md). |
| **Einheitenmaßstab** | Multipliziert jede Position. | Knöpfe *1 (m)* und *0,01 (cm→m)*, oder einen Wert eintippen. |
| **Flip X / Flip Y / Flip Z** | Kehrt eine Quellachse um. | Wird auf Positionen und auf Blickrichtungs-Vektoren angewendet. |
| **Zeit** | Die Zeitachse. | Optional. Ohne sie gibt es keine Zeitleiste. |
| **Zeiteinheit** | Wie die Zeitspalte gelesen wird. | Sieben Einheiten; siehe [Achsen, Einheiten und Zeit](axes-units-and-time.md#time). Wird bei Parquet-Spalten `TIMESTAMP`/`DATE` ignoriert, was das Feld sagt. |
| **Personen-ID** | Wer oder was zu einer Zeile gehört. | Optional. Ermöglicht Spuren, Lebensdauern, Box-Replay und Linien-Intensität. |
| **Session / Match** | Zu welchem Match, Raid, Runde, Lauf oder welcher Runde eine Zeile gehört. | Optional. Positionen werden nie über einen Sitzungswechsel hinweg interpoliert, nachgezogen oder zu einer Route verbunden. Siehe [Sitzungen, Personen und Gruppen](sessions-persons-groups.md). |
| **Team / Gruppe** | Jede Spalte mit wenigen verschiedenen Werten. | Optional. Steuert die Gruppenfarben, die Team-Intensität und die Differenz-Aufteilung nach Gruppe. |
| **Blickrichtung** | *Keine*, *Gier-/Nickwinkel-Spalten* oder *Richtungsvektor-Spalten*. | Mit Gier/Nick: **Gierwinkel**, **Nickwinkel** und **Winkeleinheit** (*Grad* / *Bogenmaß*). Mit Vektor: **Dir X**, **Dir Y**, **Dir Z**. Dient den Blickstrahlen des [Box-Replays](box-replay.md). |
| **Zum Filtern behalten** | Zusätzliche Spalten, die im Speicher bleiben. | Ein Kästchen pro Spalte, und für jede angehakte *Bereich* (numerisch) oder *Kategorie*. Jede kostet 4 Byte pro Zeile und einen Dekodierdurchlauf beim Laden. Nur behaltene Spalten können [gefiltert](filters.md), für eine [Differenz-Aufteilung](difference.md) genutzt oder als Ereignisspalte einer [Linien-Intensität](line-heat.md) verwendet werden. |
| **Beispielzeilen zeigen** | Eine Tabelle der ersten 12 Beispielzeilen, alle Spalten. | Zum Prüfen der Vermutungen. |

Eine angehakte Filterspalte, die nicht ausdrücklich gesetzt ist, wird als *Bereich* gelesen; eine Id-Spalte, die nach Zahl aussieht, ist oft nützlicher als *Kategorie*. Nur 4 Filter können gleichzeitig aktiv sein ([Filter](filters.md)).

## Wie die automatische Zuordnung rät {#how-the-auto-mapping-guesses}

Das Raten steckt in [`src/data/automap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts). Es schaut auf Spaltennamen, darauf, welche Spalten in den Beispielzeilen numerisch sind (mehr als 90 % der nicht leeren Werte lassen sich als Zahl lesen), darauf, wie viele verschiedene Werte jede Spalte in der Stichprobe annimmt, und auf die logischen Parquet-Typen. Namensmuster werden der Reihe nach probiert, ohne Unterscheidung von Groß- und Kleinschreibung, und das erste Muster, das irgendeine noch freie Spalte trifft, gewinnt.

### Position {#position}

| Achse | Namensmuster in dieser Reihenfolge (nur numerische Spalten) |
|---|---|
| X | `x`, `…_x` / `… x`, `pos…x`, `x…pos`, `loc…x`, `lon…`, `longitude` |
| Y | `y`, `…_y`, `pos…y`, `y…pos`, `loc…y`, `lat…`, `latitude` |
| Z | `z`, `…_z`, `pos…z`, `z…pos`, `loc…z`, `…alt…`, `…height…`, `…elev…` |

Ist eine Achse noch leer, füllen die ersten übrigen numerischen Spalten sie in der Reihenfolge (ohne `filename`, `level`, `year`, `month`, `day`, `hour`, `location`). Eine falsche Vermutung ist auf dem Bildschirm offensichtlich; eine leere würde einen leeren Ausschnitt lassen.

### Zeit {#time}

- **Zuerst Parquet-Zeitstempel-Spalten.** Unter den Spalten, deren logischer Typ `TIMESTAMP` oder `DATE` ist, wird die beste nach Punkten gewählt: +10.000, wenn der Name einem Zeitmuster entspricht, −5.000 für ein einfaches `DATE`, plus die Anzahl verschiedener Werte in der Stichprobe. Ein ganztägiges Datum und ein konstanter Sitzungsbeginn haben kaum verschiedene Werte, deshalb gewinnt der Ereigniszeitpunkt. Die Einheit ist dann *Unix-Zeitstempel (ms)*.
- **Sonst nach Name:** `time`, `timestamp`, `ts`, `…event…time…`, `…time…stamp…`, `t`, `…date…time…`, `when`, `tick`, `…frame…`, dann Namen verstrichener Zeit (`gdur`, `g_duration`, `…duration…`, `…elapsed…`, `…match time…`, `…round time…`, `…game time…`, `…minute from start…`, `…since start…`, `age`). Die Einheit wird dann aus den Werten geraten: ISO-8601, wenn ein Wert wie `JJJJ-MM-TT T…` oder `JJJJ-MM-TT …` aussieht; sonst nach der größten Größenordnung: über 10^17 Nanosekunden, über 10^14 Mikrosekunden, über 10^11 Unix-Millisekunden, über 10^8 Unix-Sekunden, über 10^6 Millisekunden, sonst Sekunden.

Wenn eine Spalte verstrichener Zeit gewählt wird, vermerkt das Feld, dass jede Sitzung dann an ihrem eigenen Beginn ausgerichtet wird – gut, um Matches übereinanderzulegen, nicht um sie in echter Abfolge zu sehen.

### Sitzung, Person, Gruppe {#session-person-group}

Die Sitzung wird **nach** der Zeitachse und **vor** Person und Gruppe beansprucht, weil eine Sitzungsspalte oft ein Zeitstempel ist (der Startzeitpunkt des Matches in jeder Zeile des Matches).

| Rolle | Namensmuster in dieser Reihenfolge |
|---|---|
| Sitzung | `session` / `session_id`, `match…`, `round…`, `raid…`, `game…`, `run…`, `replay…`, `instance…`, `lap…`, `stint…` (jeweils genau, optional mit `_id`) |
| Person | `name`, `…player…id/name…`, `…user…`, `…account…`, `persona…`, `…character…`, `victim`, `actor`, `…puuid…`, `…steam id…`, `subject…`, dann `driver` / `driver_id` / `driver_name`, `car` / `car_id` / `car_name` (Renndaten: das Auto ist das, was sich bewegt) |
| Gruppe | `spawn_team`, `real_team`, `team` / `team_id` / `team_name`, `squad…`, `side`, `…faction…`, `clan…`, `party…`, `alliance…`, `car_class` |
| Gruppe, Ersatz | `…victim_ai…`, `…killer_ai…`, `…is_ai/bot/npc…`, `target_type`, `survived`, `outcome`, `result` |

Ein Gruppenkandidat, der auf den meisten Stichprobenzeilen einen eigenen Wert annimmt (mehr als max(48, 60 % der Stichprobe)), ist eine Kennung, keine Gruppe: Er wird zur Personenspalte, falls keine gefunden wurde, und nicht als Gruppe verwendet. Wurde gar keine Gruppenspalte gefunden, wird die nicht numerische Spalte mit den wenigsten verschiedenen Werten zwischen 2 und 12 genommen.

### Blickrichtung {#look-direction}

Eine numerische Spalte namens `yaw`, `…rot…yaw…`, `…heading…`, `azimuth…`, `…view…yaw…` oder `rot_z` / `rotation_z` schaltet die Blickrichtung auf Gier/Nick; Nick wird als `pitch`, `…rot…pitch…`, `…elevation…angle…`, `…view…pitch…` gesucht. Grad wird angenommen, wenn ein Gierwert in der Stichprobe über 7 im Betrag liegt, sonst Bogenmaß. Ein Richtungsvektor wird nie geraten; er kommt aus den Hinweisen unten oder von dir.

### Filterspalten {#filter-columns}

Höchstens **6** Spalten werden automatisch behalten, nach Rang:

1. `region`, `sessionMode`, `actor` – Spalten, die zum Filtern da sind (Wertung 1200);
2. Kategoriespalten, die in der Stichprobe variieren, zuerst die mit weniger verschiedenen Werten (1000 minus die Anzahl);
3. eine Spalte, die in der Stichprobe konstant ist, aber nur, wenn mehrere Dateien geladen werden – sie kann zwischen Dateien abweichen, etwa eine Region oder eine Test-Lauf-Id (600);
4. numerische Spalten (500).

Spalten, die schon eine Rolle spielen, die genannten Rauschnamen, in einer Einzeldatei-Ladung konstante Spalten und Freitextspalten (mehr als max(16, die Hälfte der Stichprobe) verschiedene Werte) werden nicht automatisch angeboten. Jede Spalte kann trotzdem von Hand angehakt werden.

### Hochachse {#up-axis}

Sind alle drei Achsen zugeordnet, gilt die Achse mit der kleineren Streuung von Y und Z in der Stichprobe als oben (eine Karte ist viel breiter als hoch); sonst wird Z-oben angenommen.

## Die `heat3d`-Hinweise in einem Parquet-Footer {#the-heat3d-hints-in-a-parquet-footer}

Eine Parquet-Datei kann sagen, wie sie gelesen werden soll. Hat der Footer der Datei einen Eintrag mit dem Schlüssel **`heat3d`** in den Schlüssel-Wert-Metadaten, wird sein Wert als JSON gelesen und über die Vermutungen gelegt ([`applyHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). Der CS2-Demo-Konverter schreibt so einen Eintrag, deshalb öffnen sich seine Tabellen mit dem Spieler als Person, der Seite als Gruppe, jeder Runde als Sitzung, eingeschalteter Blickrichtung und der Welt richtig herum.

Nur die **erste** Datei einer Auswahl wird auf Hinweise gelesen. Jeder Eintrag ist optional, und jeder gegebene Wert erscheint trotzdem im Feld und kann geändert werden. Eine vollständige Beschreibung des Schemas mit Beispiel und Anleitung zum Schreiben steht in der [Referenz der Datenformate](data-formats.md#the-heat3d-hints).

Die Regeln kurz:

- Eine Spalte, die ein Hinweis nennt, wird nur angewendet, wenn die Datei diese Spalte hat.
- `lookMode: "vector"` greift nur, wenn `dirX`, `dirY` und `dirZ` alle gesetzt sind; `"yawPitch"` nur, wenn `yaw` gesetzt ist.
- `extra` ersetzt, wenn vorhanden, die automatische Filterliste (unbekannte Namen und Spalten, die schon eine Rolle spielen, fallen weg); der Typ Bereich/Kategorie jeder Spalte folgt daraus, ob sie numerisch aussah. Fehlt es, bleibt die automatische Liste, abzüglich jeder Spalte, der ein Hinweis eine Rolle gab.
- `axes.up` muss `"y"` oder `"z"` sein, Spiegelungen müssen Wahrheitswerte sein, `scale` muss positiv sein.
- `entity.size`, wenn positiv, ist die Größe eines verfolgten Dings in den Einheiten der Datei ([Entitätsgröße](sessions-persons-groups.md#entity-size)); nur so wird sie gesetzt.

## Bekanntes Problem: das CSV-Trennzeichen überschreiben {#known-issue-overriding-the-csv-separator}

Wenn du das Trennzeichen auf eines änderst, das sich vom erkannten unterscheidet, ändern sich die Spaltenliste und die Beispielzeilen nicht (die Vorschau teilt weiterhin mit dem erkannten Trennzeichen). Das gewählte Trennzeichen wird trotzdem für das Laden selbst verwendet. Ist das erkannte Trennzeichen falsch:

1. Öffne die Datei in einem Texteditor.
2. Ersetze das Trennzeichen überall durch ein Komma (und Dezimalkommas durch Punkte).
3. Speichere und lade die Datei erneut.

Die Ursache steckt in [`previewSource`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sourcePreview.ts).
