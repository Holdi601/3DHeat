---
title: "Sitzungen, Personen und Gruppen"
parent: "Daten laden"
nav_order: 4
lang: "de"
source: "sessions-persons-groups.md"
source_hash: "5c87185b09ff"
translated: true
outdated: false
---

# Sitzungen, Personen und Gruppen

Eine **Person** ist ein sich bewegendes Ding (ein Spieler, ein Auto). Eine **Team/Gruppe** ist die Seite, zu der sie gehört. Eine **Sitzung** ist ein Match oder eine Runde. Siehe das [Glossar](glossary.md).

Eine Zeile einer Datei kann alle drei nennen:

| x | y | time | player | team | match |
|---|---|---|---|---|---|
| 10.5 | -30.2 | 12.0 | Blue 1 | Blue | Match 01 |

`player` ist die Person, `team` ist die Gruppe, `match` ist die Sitzung.

Drei optionale Spalten beschreiben, *wer* und *an welcher Stelle der Geschichte* eine Zeile gehört. Jede wird beim Laden wörterbuchkodiert: Die Textwerte werden pro Zeile zu kleinen ganzzahligen Kennungen plus einer gemeinsamen Liste von Bezeichnungen, geteilt über alle Dateien einer Ladung.

## Person {#person}

Die Spalte **Personen-ID** nennt das sich bewegende Ding, zu dem eine Zeile gehört: einen Spieler, einen Bot, ein Auto. Sie wird als 32-Bit-Kennung pro Zeile gespeichert.

Mit einer Personen- und einer Zeitspalte berechnet das Laden für jede Zeile die **Lebensdauer**: die Zeit bis zur nächsten Probe derselben Person *in derselben Sitzung*, oder „keine“ (ein Platzhalter, -1), wenn es keine nächste Probe gibt – die Person ist gestorben, gegangen, oder das Protokoll endet. Lebensdauern treiben den Verlauf **Lebensdauer** der [Zeitleiste](timeline.md), Interpolation und Veraltung im [Box-Replay](box-replay.md) und die Routenbrüche der [Linien-Intensität](line-heat.md). Was eine Zeile ohne Nachfolger macht, ist eine Anzeigeeinstellung (*Ersatzlebensdauer*), nicht fest in die Daten eingebaut.

Jede Person bekommt die Gruppe ihrer **ersten** Zeile in der Zeit; diese Zuordnung färbt ihre Box im Box-Replay und entscheidet, welcher Gruppenschalter sie dort ausblendet. Die Intensitätsarten nutzen stattdessen die eigene Gruppe jeder Zeile.

### Namen, die mehrere Dinge gleichzeitig tragen {#names-worn-by-several-things-at-once}

Ein Name ist nicht immer ein einzelnes Ding: In manchen Exporten protokolliert jeder Bot jedes Matches unter demselben Namen. Verbindet man zwei Proben einer solchen „Person“ – durch Interpolation, eine Spur oder eine Route –, zieht man eine Linie zwischen zwei verschiedenen Kreaturen quer über die Karte.

Beim Laden ([`computeLifetimes`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)) wird ein Name als **gemeinsam** markiert, wenn zwei seiner Einträge

- in derselben Sitzung stehen,
- dieselbe Zeit haben,
- von derselben Art sind (jede behaltene Kategoriespalte hat denselben Wert), und
- weiter als 1 % der Diagonale der Ausdehnung der Daten auseinanderliegen.

Gemeinsame Namen werden als einzelne Proben gezeichnet – keine Interpolation, keine Spur, keine Route der Linien-Intensität. Alles andere an ihnen (ihre Intensität) bleibt unberührt. Das Feld Datensatz listet, wie viele Namen markiert wurden, mit bis zu drei Beispielen, und das Feld Box-Replay wiederholt die Anzahl.

## Session {#session}

Die Spalte **Session / Match** sagt, zu welchem Match, Raid, welcher Runde, welchem Lauf oder welcher Runde eine Zeile gehört. Sie macht die Proben einer Person zu einer durchgehenden Spur: Echte Telemetrie verschachtelt oft gleichzeitige Matches, und eine Probe eines Spielers kurz vor dem Abspielkopf und die kurz danach können aus verschiedenen Matches stammen, hunderte Meter voneinander entfernt. Mit einer Sitzungsspalte gilt:

- Interpolation, Spuren und Routen der Linien-Intensität überqueren nie einen Sitzungswechsel;
- die Lebensdauer einer Zeile endet am Ende ihrer eigenen Sitzung;
- die **Sitzungsauswahl** erscheint oben in der Seitenleiste, unter der Modusleiste.

Eine Sitzungsspalte ist sehr oft ein *Zeitstempel* – der Startzeitpunkt des Matches, in jeder Zeile dieses Matches wiederholt. Der automatische Zuordner sucht deshalb Sitzungsnamen vor Person und Gruppe ([Spaltenzuordnung](column-mapping.md#session-person-group)). Eine Rennrunde oder ein Stint ist ebenfalls eine Sitzung: Zwei Runden desselben Autos dürfen nicht zu einer Spur verbunden werden.

### Die Sitzungsauswahl {#the-session-picker}

![Die geöffnete Sitzungsauswahl bei einer Datei mit zehn Matches: Alle Sitzungen (10), Match 01, Match 02 und so weiter](../assets/img/en/sessions-persons-groups-picker.webp)

*Zehn Matches in einer Datei: wähle eines aus oder sieh alle.*

Sie erscheint, wenn der Datensatz aufgelistete Sitzungen hat (siehe die Grenze unten).

| Teil | Bedeutung |
|---|---|
| Bezeichnung rechts | Die Zeilenzahl der gewählten Sitzung, oder *alle auf einmal*. |
| Menü | *Alle Sitzungen (N)*, dann jede Sitzung, die aktivste zuerst, als `Bezeichnung - N Zeilen, Spanne` (Spanne in Sekunden unter 90 s, Minuten unter 90 min, Stunden darüber). |
| Gelber Hinweis | Erscheint bei *Alle Sitzungen*: Positionen werden trotzdem nie über Sitzungen verbunden, aber gleichzeitige Matches setzen unverbundene Spieler gemeinsam auf die Karte. |
| Hinweis | Erscheint in den Intensitätsarten, wenn eine Sitzung gewählt ist: Die Wahl bewegt nur den Abspielkopf. |

Beim Laden wird die aktivste Sitzung gewählt. Eine Wahl springt den Abspielkopf zum Beginn dieser Sitzung.

Was die Auswahl ändert:

- Im **[Box-Replay](box-replay.md)** bestimmt sie, welche Sitzung abgespielt wird: nur deren Boxen und Spuren werden gezeichnet, und der Bereich der Zeitleiste wird zur eigenen Spanne der Sitzung.
- In den **Intensitätsarten** schränkt sie die Intensität nicht ein, und ein Hinweis unter der Auswahl sagt es: *In den Intensitätsarten bewegt dies nur den Abspielkopf zum Beginn der Sitzung; die Intensität zählt weiterhin jede Sitzung. Das Box-Replay spielt nur die gewählte Sitzung ab.* Um die Intensität auf eine Sitzung zu beschränken, behalte die Sitzungsspalte zusätzlich als Filterspalte (*Zum Filtern behalten*) und filtere danach. Eine Spalte darf sowohl Sitzungsspalte als auch Filterspalte sein: Der Lader liest jede angehakte Filterspalte für sich, welche Rolle sie auch sonst spielt.

### Zu viele Sitzungen {#too-many-sessions}

Bis zu **100.000** Sitzungen werden aufgelistet. Darüber ist die Spalte eigentlich eine Kennung (ein Ordner mit Millionen Sitzungen mit je wenigen Zeilen), und so viele Bezeichnungen vom Worker an die Seite zu schicken, bringt einen Tab zum Speicherüberlauf. Das Laden behält dann die Sitzungs-**Kennungen** – die Grenzen werden also überall weiter eingehalten –, verwirft aber die Bezeichnungen und die Auswahl, und das Feld Datensatz sagt es.

## Gruppe {#group}

Die Spalte **Team / Gruppe** ist jede Spalte mit wenigen verschiedenen Werten: ein Team, eine Seite, ein Trupp, eine Fraktion, eine Spieler-gegen-KI-Markierung, eine Fahrzeugklasse. Sie wird als 16-Bit-Kennung pro Zeile gespeichert und steuert:

- die [Teamliste](teams-list.md) (Sichtbarkeit je Gruppe, + / − Seiten),
- die [Team-Intensität](team-heat.md) (ein Farbton je Gruppe),
- die [Differenz](difference.md)-Aufteilung nach Gruppe,
- die Boxfarben im [Box-Replay](box-replay.md) (eine Farbfamilie je Gruppe, eine Schattierung je Mitglied).

### Grenzen {#limits}

Höchstens **4.096** verschiedene Gruppen. Die Gruppenkennung reitet im vierten Kanal des Positions-Texels jeder Zeile auf der GPU, und jede Gruppe braucht ein Texel in der 4.096 breiten Vorzeichentabelle, die der Shader liest, um *ausgeblendet*, *addiert* oder *subtrahiert* zu entscheiden. Eine Spalte mit mehr verschiedenen Werten ist eine Kennung, keine Gruppe: **Das Laden behält jede Zeile und verwirft nur die Gruppierung**, mit einer Warnung am Datensatz, die vorschlägt, sie stattdessen als Personenspalte zuzuordnen oder als Filterspalte zu behalten.

Dieselbe Grenze von 4.096 gilt für eine behaltene *Kategorie*-Filterspalte; eine breitere wird nicht behalten, und der Datensatz sagt es. Eine numerische Spalte (etwa ein Zeitstempel) hat als *Bereich*-Filter keine solche Grenze.

Gruppenwerte `0`, ein leerer Wert, `none`, `unknown`, `null` und `-1` (ohne Unterscheidung von Groß- und Kleinschreibung) bedeuten für die [Team-Intensität](team-heat.md) „keine Gruppe“, die sie neutral grau statt in einer sicheren Farbe zeichnet.

## Entitätsgröße {#entity-size}

Wie groß ein verfolgtes Ding ist – die Kollisionsbox eines Spielers, ein Auto –, bestimmt, wie groß die Boxen und Blickstrahlen des [Box-Replays](box-replay.md) gezeichnet werden. Im Feld gibt es dafür kein Eingabefeld; sie kommt aus den [`heat3d`-Hinweisen](data-formats.md#the-heat3d-hints) der Datei (`entity.size`, in den eigenen Einheiten der Datei; der CS2-Konverter schreibt 32). Das Laden multipliziert sie mit dem Einheitenmaßstab.

Bei jedem Laden ([`calibrate`](https://github.com/Holdi601/3DHeat/blob/main/src/data/calibrate.ts)), wobei *Ausdehnung* die größere der X- und Z-Spannen der Daten ist:

| Einstellung | Mit Entitätsgröße | Ohne |
|---|---|---|
| Würfelgröße | Entitätsgröße | Ausdehnung / 500 |
| Länge des Blickstrahls | Entitätsgröße × 4 | Ausdehnung / 200 |
| Sprite-Radius | Ausdehnung / 120 | Ausdehnung / 120 |
| Sättigungspunkt | analytische Schätzung (dann gemessen) | gleich |
| Fluggeschwindigkeit | Ausdehnung / 12 | gleich |
| Ferne Ebene | Ausdehnung × 12 | gleich |
| Nahe Ebene | max(0,05; Ausdehnung / 20.000) | gleich |

## Das Feld Datensatz {#the-dataset-panel}

Unter dem Feld Quelle. Mit geladenem Datensatz zeigt es:

- den **Namen** des Datensatzes – die Auswahl, die Zeilenzahl, die Dateianzahl, den Schritt, falls einer genutzt wurde;
- **`N Teams · N Personen · Ns Spanne`**;
- jede **Warnung**, die das Laden erzeugt hat, gelb, solange der Datensatz geladen ist: Gruppen oder eine Filterspalte verworfen wegen zu vieler Werte, Sitzungen nicht aufgelistet, gemeinsame Namen, fehlende Zeilen, übersprungene Dateien;
- den [Synthetischen Generator](synthetic-generator.md);
- **Entladen**, das den Datensatz entfernt.

Die Zeilenzahl steht in der Kopfzeile des Feldes.
