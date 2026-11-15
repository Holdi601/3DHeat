---
title: "Tacview-Aufnahmen (ACMI)"
parent: "Daten laden"
nav_order: 7
lang: "de"
source: "tacview-acmi.md"
source_hash: "08423333214c"
translated: true
outdated: false
---

# Tacview-Aufzeichnungen (ACMI)

Tacview ist ein Programm, das Flüge in Flugsimulatoren aufzeichnet. Seine Dateien enden auf `.acmi`. 3DHeat öffnet sie, damit du siehst, wohin jedes Flugzeug geflogen ist.

Tacview-Flugaufzeichnungen laden wie jede Tabelle: Wähle eine `.acmi` aus oder ziehe sie hinein (Text, `.txt.acmi` oder gepackt, `.zip.acmi`) und drücke **Laden**. Du bekommst dann die Intensität aller Flüge. Im Tab **Match** gibt es eine Wiedergabe mit Figuren, Spuren und einer Ereignisliste ([Match-Wiedergabe](match-replay.md)). ACMI ist das öffentliche Dateiformat von Tacview ([Dokumentation](https://www.tacview.net/documentation/acmi/)). DCS (über den Exporter von Tacview), IL-2 Great Battles, Falcon BMS, X-Plane, MSFS und andere schreiben es. Deshalb liest der Viewer alle davon.

## Was eine Aufzeichnung wird {#what-a-recording-becomes}

Eine Zeile jedes Mal, wenn die Position eines Objekts geschrieben wird. Eine Zeile je Ereignis am Ort des Objekts. Und eine Zeile, wenn ein Objekt verschwindet (`Removed`, dort, wo es zuletzt war). Ein Ereignis ohne ein bisher gesehenes Objekt, etwa eine Markierung oder eine Nachricht an alle, ist eine Zeile des Objekts `(recording)` am Bezugspunkt. Die Aufzeichnung bringt ihre eigene Leseanleitung mit, daher füllt sich der Zuordnungsschritt selbst aus. Der Leser schreibt diese Spalten: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo` und dann alle weiteren Eigenschaften der Aufzeichnung. Ihre Rollen:

| Spalte | Rolle | Bedeutung |
|---|---|---|
| Time | Zeit | Sekunden nach der ReferenceTime der Aufzeichnung; Unix-Sekunden, wenn sie eine hat, damit die Uhr die echte Zeit zeigt. |
| X, Y | Position | Ost und Nord, in Metern, auf einer Ebene, die die Erde am Bezugspunkt der Aufzeichnung berührt. Entfernungen und Peilungen stimmen in der Nähe, sie weichen auf 100 km um weniger als einen Teil auf tausend ab. Nord wird zum -Z der Welt. |
| Altitude | Position (oben) | Meter. |
| Object | Person | Der Pilot und der Name des Objekts mit seiner ID, zum Beispiel `Viper 1 (F-16C_50) #a01`; ein unbemanntes Objekt `(T-90A) #401`. |
| Coalition | Team | Die Seite (oder die Farbe, wenn es keine Koalition gibt). |
| Heading, Pitch | Blick | Grad; Kurs 0 ist Nord. |
| Recording | Sitzung | Der Titel der Aufzeichnung oder der Dateiname: Mehrere Aufzeichnungen laden nebeneinander, ohne dass ihre Spuren zusammenhängen. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | Filter | Für das Filtern aufbewahrt. Type und Name wählen die [Figur](figures.md) jedes Objekts, Event speist die Ereignisliste der Nachbesprechung, Roll lässt das Flugzeug kippen. |
| U, V | | Die flachen Weltmeter des Spiels, wenn jede Probe sie hat (DCS schreibt sie). |
| EventObjects | Filter | Jedes Objekt, das ein Ereignis nennt (`Message|a01|b02|...`), über seine ID. |
| RecordingInfo | | Die eigenen Eigenschaften der Aufzeichnung, wie sie in diesem Moment waren: DataSource, DataRecorder, Author, Category, Briefing, Comments, ... als JSON. |
| IAS, Mach, AOA, FuelWeight, ... | Filter | Jede andere numerische Eigenschaft der Aufzeichnung. |
| Parent, CallSign, LockedTarget, Label, Shape, ... | Filter | Jede andere Textreigenschaft der Aufzeichnung. Eine Eigenschaft mit einem Wert, der keine Zahl ist, ist Text. |

Alle vier Formen der Position von Tacview werden gelesen (`lon|lat|alt`, mit `u|v`, mit `roll|pitch|yaw` und mit allen dreien plus Kurs). Leere Felder behalten den letzten Wert. `-id` entfernt ein Objekt, und eine ID, die danach erneut vorkommt, ist ein neues Objekt. Maskierte Kommas und fortgesetzte Zeilen werden verarbeitet.

Die Positionen werden immer aus Breiten- und Längengrad projiziert, nie aus U/V. So teilen sich Aufzeichnungen aller Spiele eine Projektion mit einem Hintergrund der echten Welt.

## DCS-Server: wer gewonnen hat und wie jeder Einsatz endete {#dcs-servers-who-won-and-how-each-sortie-ended}

Ein DCS-Mehrspielerserver zeichnet seine Missionen rund um die Uhr mit Tacview auf. Ein persistenter PvP-Server führt über viele davon eine Kampagne: Eine Seite gewinnt, wenn sie jeden Flugplatz, jeden FARP und jede Zone der anderen einnimmt. Das dauert Tage und viele Neustarts der Mission. Die Aufzeichnungen enthalten die Flüge, nicht die Kampagne: Keine Nachricht sagt, wer was eingenommen hat, die Flugplätze werden einmal zu Beginn geschrieben, und keine sagt, wer gewonnen hat. Der Tacview-Konverter (`node tools/acmi-to-parquet.mjs`, [`data/dcsOutcome.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsOutcome.ts)) fügt jeder Zeile hinzu, was sich wissen lässt, und lässt leer, was sich nicht wissen lässt - er rät nie.

| Spalte | Bedeutung |
|---|---|
| `server` | der Server oder die Kampagne, aus dem Kopf der Aufzeichnung (ihr Title, Author und Comments nennen die bekannten öffentlichen Server - Blue Flag, SPS Contention, Growling Sidewinder; sonst ein Author, der jemanden nennt); `--server Name` benennt ihn für einen ganzen Ordner. Eine Aufzeichnung, deren Kopf keinen Server nennt - ein Author wie `Admin`, ein Title und Comments, wie sie kein bekannter Server schreibt -, bleibt ohne Zuordnung: `server` leer, auch wenn sie von der Aufzeichnungsseite eines Servers heruntergeladen wurde, denn die Seite kann auch Missionen anderer Communitys enthalten |
| `mission` | der Title der Aufzeichnung ohne Version und Kampagnenmonat: `Operation_Example_V7.7.99` wird zu `Operation Example` |
| `campaign` | die Kampagnenrunde, zu der die Aufzeichnung gehört, nach Server, Karte und Nummer: `Example Server North 3`. Eine Aufzeichnung ist eine Sitzung (von Neustart zu Neustart); eine Runde läuft über viele Sitzungen, Tage oder Wochen |
| `round` | die Nummer dieser Runde: die des Servers, wo er eine veröffentlicht, sonst die n-te gesehene Runde dieses Servers und dieser Karte; aus einer Rundendatei (unten), ohne eine leer |
| `session` | der Platz der Aufzeichnung unter den Sitzungen der Runde, 1, 2, ...; `sessionStart` ihr echter Beginn (Unix-Sekunden) |
| `heldRed`, `heldBlue` | die umkämpften Orte, die jede Seite zu Beginn der Sitzung hielt, aus einer verketteten Rundendatei (unten) |
| `won`, `matchWon` | 1, wenn die Seite der Zeile (ihre Color, Red oder Blue) diese Kampagne gewonnen hat, 0, wenn sie verloren hat; leer, wo keine Rundendatei einen Sieger nennt, und in neutralen Zeilen. Eine Kampagne ist Runde und Match zugleich, deshalb steht in beiden dasselbe |
| `roundEndReason` | `capture` für eine Kampagne, die durch die Einnahme von allem gewonnen wurde |
| `won`, `matchWon` in jeder Sitzung einer Runde | das Ergebnis der Runde, in jede ihrer Aufzeichnungen geschrieben, sobald ihr Ende bekannt ist |
| `sortie` | in den Zeilen eines Flugzeugs: sein Flug, 1, 2, ... von Start zu Start; die Zeit am Boden vor dem ersten Start und nach einer Landung zählt zu dem Flug, zu dem sie gehört |
| `sortieResult` | wie dieser Flug endete: `landed`, `landed damaged` (nach einem Treffer in der Luft), `ejected`, `shot down`, `destroyed` (am Boden), `crashed`, `despawned` (in der Luft verschwunden, ohne erkennbare Ursache - ein Spieler, der geht), `airborne at end`, `no takeoff` |
| `sortieKills` | die Abschüsse, die dem Flugzeug in diesem Flug zugeschrieben werden |

Auf einem persistenten Server ist der Einsatz die Einheit, die etwas bedeutet: Filtere auf `sortieResult` = `shot down`, um zu sehen, wo Flüge verloren gingen, oder schlüssele die Intensität in der [Aufschlüsselung](breakdown.md) nach `sortieResult` oder `server` auf. Die Starts, Landungen, Ausstiege, Abschüsse und Abstürze, aus denen er besteht, sind die Ereignisse, die der Konverter aus der Bewegung der Flugzeuge ableitet (oben).

Orte, die zwischen zwei Sitzungen einer Runde eingenommen wurden - bekannt aus der Rundendatei, unten -, sind `capture`-Ereignisse zu Beginn der späteren Aufzeichnung: `Object` `(campaign)`, am Ort, `Detail` `Red to Blue, between missions`, `Inferred` `between missions`.

Ein Flugplatz oder FARP, der die Seite wechselt, wo die Aufzeichnung es zeigt - erneut in der anderen Farbe geschrieben, oder entfernt und innerhalb von fünf Minuten an seinem Ort in der anderen erneut geschrieben -, wird zu einem `capture`-Ereignis am Landeplatz: `Event` = `capture`, `Airfield` sein Name, `Detail` `Red to Blue`, `Coalition` seine neue Seite. Ein Landeplatz, der zum ersten Mal in einer Farbe geschrieben wird, ist keine Eroberung. Die bisher angesehenen Server schreiben ihre Landeplätze nur einmal, deshalb enthalten ihre Aufzeichnungen keine Eroberungen.

### Rundendateien {#rounds-files}

Eine Rundendatei nennt pro Server seine Kampagnenrunden, wer sie gewonnen hat und die Sitzungen jeder Runde. Sie stammt aus dem, was der Server veröffentlicht, oder aus den Aufzeichnungen selbst (unten).

Wer eine Kampagne gewonnen hat, veröffentlicht der Server - ein Kampagnenprotokoll auf seiner Webseite -, es steht nicht in der Aufzeichnung. Eine Rundendatei trägt es, und der Konverter liest sie mit `--rounds file.json` (es dürfen mehrere angegeben werden):

```json
{
  "format": "heat3d-dcs-rounds",
  "version": 1,
  "server": "Example Server",
  "source": "Example Server's public campaign log, read 2026-11-15",
  "rounds": [
    { "id": 41, "title": "^Example-Campaign-North$", "start": "2026-11-01T08:00:00Z", "end": "2026-11-04T19:30:00Z", "winner": "Blue", "endReason": "capture", "state": "won" },
    { "id": 42, "title": "^Example-Campaign-North$", "start": "2026-11-04T19:30:00Z", "end": null, "winner": null, "state": "in progress" }
  ]
}
```

Eine Aufzeichnung gehört zu den Runden ihres `server`, deren `title` (ein regulärer Ausdruck) auf ihren Title passt; jede Zeile gehört zu der Runde, in die ihre echte Zeit fällt - die RecordingTime der Aufzeichnung plus die Sekunden der Zeile, nicht das Datum der Mission im Spiel. Die Zeiten sind UTC. Eine Runde ohne Sieger (rotiert, läuft noch) gibt ihren Zeilen die Rundennummer und ein leeres Ergebnis.

Das Gegenstück im Match-Dokument, die Fußzeile `acmi`, sagt, woher das Ergebnis stammt, so wie `result.source` bei einem War-Thunder-Match: `outcome.result` ist `{ winner, round, endReason, source }`, `source` die `source` der Rundendatei oder `null`, wenn nichts einen Sieger genannt hat. `outcome` listet auch die Runden der Aufzeichnung, ihre Eroberungen und ihre Einsätze danach, wie sie endeten:

```json
"outcome": {
  "server": "Example Server", "mission": "Example-Campaign-North", "kind": null,
  "result": { "winner": "Blue", "round": 41, "endReason": "capture", "source": "Example Server's public campaign log, read 2026-11-15" },
  "rounds": [{ "id": 41, "start": "2026-11-01T08:00:00.000Z", "end": "2026-11-04T19:30:00.000Z", "winner": "Blue", "endReason": "capture", "state": "won" }],
  "captures": 0,
  "sorties": { "landed": 31, "shot down": 12, "ejected": 3, "crashed": 2, "despawned": 9, "no takeoff": 4 }
}
```

Eine Zeile eines Piloten `Viper 1 (F-16C_50) #a01` auf der blauen Seite in dieser Kampagne lautet dann: `server` Example Server, `round` 41, `won` 1, `roundEndReason` capture, `sortie` 2, `sortieResult` landed, `sortieKills` 1.

### Runden aus den Aufzeichnungen selbst {#rounds-from-the-recordings-themselves}

Ein persistenter Server behält seine Kampagne über Neustarts hinweg, und jede Aufzeichnung beginnt mit den Bodeneinheiten und statischen Objekten beider Seiten dort, wo die Kampagne sie gelassen hat. `node tools/dcs-campaign-rounds.mjs <out-folder> <folder>...` liest die ersten Minuten jeder Aufzeichnung ([`data/dcsCampaign.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsCampaign.ts)), ordnet die Aufzeichnungen jedes Servers von einer Karte zeitlich und verkettet sie:

- **Orte**: der Boden in Zellen von etwa 2 km; eine Zelle gehört einer Seite, wenn drei Viertel der Einheiten dort zu Beginn einer Sitzung ihr gehören. *Umkämpfte* Orte sind die, die beide Seiten gehalten haben.
- **Eroberungen**: ein Ort, den zu Beginn der nächsten Sitzung die andere Seite hält - eingenommen zwischen den Missionen oder während der früheren.
- **Eine neue Runde**: eine Sitzung, deren Orte sich in mehr als 60 % von denen der letzten unterscheiden - die Anfangsaufstellung einer neuen Runde, kein Schritt der alten. Eine Runde endet auch, wenn der Server zu einer anderen Karte wechselt (ihre Sitzungen beginnen nach der letzten und gehen weiter).
- **Wer gewonnen hat**: bei einer beendeten Runde die Seite, die zu Beginn ihrer letzten Sitzung jeden Ort hielt (`capture`, Konfidenz hoch), sonst die Seite, die mehr der umkämpften Orte hielt (mittel bei doppelt so vielen wie die andere, sonst niedrig; niedrig, wenn sie mit einem Kartenwechsel endete). Eine offene Runde hat keinen Sieger, aber jede Sitzung sagt, wie viele Orte jede Seite zu ihrem Beginn hielt. So zeigt sich, wer vorn lag.
- Ein Server, dessen Sitzungen alle gleich beginnen, behält zwischen ihnen keinen Zustand: Er wird nicht verkettet.

Der Beginn der letzten Sitzung kann Stunden vor dem Ende der Runde liegen, deshalb zählt die Konfidenz. Geprüft an einem Server, der seine Sieger veröffentlicht: Die Kette fand jede neue Runde in der Sitzung, in der die veröffentlichte Runde begann, und die Seite, die beim letzten Beginn vorn lag, war in jeder der 9 Runden, die sie prüfen konnte, der veröffentlichte Sieger. `--official file.json` behält die veröffentlichten Runden eines solchen Servers und fügt ihnen die Sitzungen der Kette hinzu; das `validation` der Datei sagt, wie weit die Kette übereinstimmte. In einer erfundenen Kampagne:

```json
{ "id": 2, "campaign": "Example Server North 2", "title": "^(?:Example_North_V1\.0)$",
  "start": "2026-11-02T06:00:00.000Z", "end": "2026-11-06T12:00:00.000Z", "winner": "Red", "endReason": null,
  "state": "won (reset)", "confidence": "medium", "ahead": "Red",
  "sessions": [
    { "start": "2026-11-02T06:00:00.000Z", "red": 12, "blue": 11, "redAll": 30, "blueAll": 28, "captures": [] },
    { "start": "2026-11-02T12:00:00.000Z", "red": 14, "blue": 9, "redAll": 32, "blueAll": 26,
      "captures": [{ "lat": 42.36, "lon": 42.02, "from": "Blue", "to": "Red" }, { "lat": 42.4, "lon": 41.98, "from": "Blue", "to": "Red" }] }
  ] }
```

### Eine Kampagnenrunde als Serie ansehen {#watching-a-campaign-round-as-a-series}

Lade die Aufzeichnungen einer Runde zusammen - die Dateien mit derselben `campaign` -, und der Viewer spielt sie als eine Serie ab: Sitzung für Sitzung in ihrer echten Reihenfolge, die Stunden oder Tage zwischen zwei Sitzungen auf eine Pause von einer Minute gekürzt. Die Zeitleiste markiert den Beginn jeder Sitzung gelb und die Pausen als dunkle Bänder, und die Uhr sagt, welche Sitzung läuft, und ihr echtes Datum (`session 4/12 · 2026-11-02 12:38 UTC`). Intensität, Wiedergabe, Filter und Erkenntnisse wirken auf die ganze Serie wie auf alle geladenen Daten. Der Abschnitt **Kampagnenrunde** im Tab Match listet die Sitzungen mit ihren Daten, wie viele umkämpfte Orte jede Seite zu jedem Beginn hielt - auch als Diagramm über die Runde - und wie viele davor eingenommen wurden; ein Klick springt zum Beginn einer Sitzung. Eine allein geladene Aufzeichnung sagt dort, welche Runde und Sitzung sie ist. Aufzeichnungen verschiedener Runden, die zusammen geladen werden, sind keine Serie: Jede beginnt bei null, wie getrennte Matches. Der Lader für viele Matches (**Viele Matches auf einmal**) spielt eine Runde ebenfalls als Serie ab, gestreamt und an die GPU angepasst, für Runden von vielen Gigabyte.

Die Orte, die während der Runde den Besitzer wechselten, werden auf der Karte als Eroberungszonen gezeichnet. Sie sind nach der Seite gefärbt, die jeden Ort zu Beginn der laufenden Sitzung hielt, und wechseln an den Grenzen der Sitzungen; jeder Wechsel ist eine Eroberung in der Ereignisliste der Wiedergabe. Sie werden aus den geladenen Zeilen ermittelt - den Bodeneinheiten und statischen Objekten jeder Sitzung in ihren ersten Minuten, in Zellen von etwa 2 km, wie es die Kette tut -, deshalb brauchen sie den vollen Lader (der Lader für viele Matches behält von jeder Zeile zu wenig).

**Die ganze Runde aus einer ihrer Aufzeichnungen laden.** In einem normalen Browser kann der Viewer keine Dateien öffnen, die du nicht ausgewählt hast: Lade die Dateien der Runde zusammen. Wenn der lokale Viewer-Server ihn bereitstellt (`npm run dev` oder `npm run preview`), kann er es: Gib der von git ignorierten `tools/local-data.json` einen Eintrag `campaigns`, der den Ordner der Rundendateien und die Ordner der konvertierten Aufzeichnungen nennt. Dann bietet der Abschnitt Kampagnenrunde einer einzelnen Aufzeichnung **Ganze Runde laden** an, holt die dort gefundenen Sitzungen der Runde und lädt sie mit dem Lader für viele Matches:

```json
"campaigns": { "rounds": "D:/dcs/rounds", "recordings": ["D:/dcs/converted"] }
```

Nur die Aufzeichnungen, die eine Rundendatei nennt, werden bereitgestellt (`tools/campaign-files.mjs`); eine Sitzung, die unter diesen Ordnern nicht gefunden wird, wird gezählt, nicht geladen.

Was die bekannten Server veröffentlichen:

| Server | Eine Runde | Wie eine Seite gewinnt | Wo man den Sieger lesen kann |
|---|---|---|---|
| SPS Contention | eine Kampagne auf einer Karte und in einer Epoche (Tage), über viele Neustarts | jeder Flugplatz, jeder FARP und jeder Stützpunkt eingenommen; eine Kampagne, die ohne Sieger endete, wurde rotiert | das öffentliche Kampagnenprotokoll des Servers (Sieger, Beginn, Ende je Kampagne) |
| Blue Flag | eine Kampagnenrunde über viele Missionen von 5 Stunden; das `_YYYY_MM` im Title rückt pro Neustart einen Monat vor | jede gegnerische Stellung eingenommen; ältere Runden nannten die Seite, die nach einer festen Zeit mehr hielt | bisher in keiner gefundenen Form veröffentlicht; die Kette der Aufzeichnungen verfolgt jede Runde und wer zu jedem Beginn wie viel hält |
| Growling Sidewinder | ein Lauf (6 Stunden) einer Open-Conflict-Mission | Zonen und Flugplätze eingenommen | seine Statistikseite zeigt Piloten, keine Ergebnisse; jede Sitzung beginnt gleich, daher reicht keine Runde über mehrere Sitzungen: leer |
| Missionen gegen die KI (Missionen zum Erobern von Zonen) | ein Lauf der Mission | die Seite der Spieler gegen die KI der Mission: kein PvP-Ergebnis | leer |
| Ohne Zuordnung (der Kopf nennt keinen Server) | - | - | leer, `server` ebenfalls leer |
