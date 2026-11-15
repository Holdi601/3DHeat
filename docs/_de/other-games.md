---
title: "Andere Rennspiele"
parent: "Rennanalyse"
nav_order: 59
lang: "de"
source: "other-games.md"
source_hash: "79f0f087f176"
translated: true
outdated: false
---

# Andere Rennspiele im Viewer

Der Viewer liest Runden aus vielen Rennspielen, nicht nur aus einem. Diese Seite nennt sie und sagt, wie du aus jedem eine Runde bekommst.

## Die Spiele {#the-games}

| Spiel | Aufzeichnung | Schlupf in der Datei? | Welt gespiegelt? | Hinweise |
|---|---|---|---|---|
| Forza Horizon 4/5/6, Forza Motorsport | `heat3d_capture telemetry` (Data Out über UDP) oder die Rundendateien von FH Companion plus deren `.tele.gz` | ja, je Rad (normiert) | ja (linkshändige Welt) | die `.tele.gz` neben jeder Rundendatei von FH Companion gibt den Schlupf jedes Rades; die Rundendatei allein tut das nicht |
| Assetto Corsa, ACC, AC EVO, AC Rally | `heat3d_capture telemetry --game ac / acc / acevo / acrally` (gemeinsamer Speicher) | ja, je Rad | aus den Runden gemessen | außerdem ABS und Traktionskontrolle im Eingriff, Radlasten, Temperaturen |
| EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4 | `heat3d_capture telemetry --game wrc / dirtrally2 / dirtrally / dirt4` (UDP) | nein, aus den Raddrehzahlen berechnet | aus den Runden gemessen | Rallye: loser Untergrund und Sprünge werden anders beurteilt |
| Richard Burns Rally | `heat3d_capture telemetry --game rbr` (NGP-UDP) | nein | aus den Runden gemessen | keine Raddrehzahlen |
| BeamNG.drive | `heat3d_capture telemetry --game beamng` (ein Mod) | nein, aus den Raddrehzahlen berechnet | aus den Runden gemessen | |
| Trackmania | das Openplanet-Plugin, `telemetry --game trackmania --install` | ein Schlupfkoeffizient je Rad | aus den Runden gemessen | Arcade-Physik: Rutschen wird anders beurteilt |
| iRacing | keine: eigene `.ibt`-Datei | nein (nicht protokolliert); aus der Gierrate berechnet | nein (GPS-basiert) | Protokoll im Auto mit Alt+L einschalten |

## So nimmst du eine Runde auf {#how-to-record-a-lap}

1. Wähle dein Spiel in der Tabelle und richte den Recorder so ein, wie es die Seite des Recorders für dieses Spiel sagt (eine Einstellung im Spiel, ein Mod oder gar nichts bei iRacing). Die Schritte unterscheiden sich je Spiel, deshalb stehen sie in den Dokumenten der Recorder: [GameCapture: Spiele](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md).
2. Starte den Recorder und fahre. Er schreibt eine Datei pro Runde.
3. Im Tab **Rennanalyse** drückst du **Rundendateien laden…** und wählst zwei oder mehr Runden derselben Strecke (siehe [Runden laden](race-loading-laps.md)).

Bei Rallyespielen schreibt der Recorder eine Datei pro Etappenlauf. Für Forza ist der einfachste Start die Bibliothek von FH Companion mit den `.tele.gz`-Dateien neben den Rundendateien.

## Was die Recorder dokumentieren {#what-the-recorders-document}

Wie jedes Spiel aufgezeichnet wird, was es sendet, welche Quellen seine Layouts haben und welche Strecken aus seinen Dateien exportiert werden können, dokumentieren die Recorder selbst: [GameCapture: Spiele](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md) (öffentlich, im [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture)). Die Rundendatei, die jeder Recorder schreibt, beschreibt [GameCapture: das Rundenformat](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).

## Was der Viewer damit macht {#what-the-viewer-does-with-them}

Jedes Spiel wird am Ende zu `heat3d-lap`-Dateien (oder einer Runden-CSV, oder wird direkt gelesen, wie iRacings `.ibt`). Dabei gelten die kanonischen Kanalnamen aus `src/race/schema.ts` und ein `meta`-Block, der sagt, was seine Zahlen bedeuten: wie sein Schlupf skaliert ist, ob Rennstrecke, Rallye oder Arcade, und der Untergrund, wenn bekannt. So behandelt der Tab **Rennanalyse** alle gleich. Ist kein Streckenmodell geladen, zeichnet der Tab **Rennanalyse** eine Straße aus der eigenen Streuung der Runden. Jedes Spiel ist deshalb auch ohne Modell brauchbar.

Was kein Rallyespiel sendet, nämlich den Reifenschlupf, berechnet der Viewer. Wo ein Spiel die Kontaktfläche oder die Oberflächengeschwindigkeit jedes Rades sendet, vergleicht er sie mit der Geschwindigkeit des Autos (`(Rad - Auto) / Auto`). Wo ein Spiel nur die Drehung sendet, nutzt er sie mit einem Abrollradius, der auf der Runde selbst gemessen wird. Der Driftwinkel kommt aus der eigenen Geschwindigkeit des Autos (Forza, die AC-Spiele, Trackmania, RBR), aus der Weltgeschwindigkeit, auf die Achsen des Autos projiziert (EA WRC, DiRT, BeamNG), oder aus der Richtung im Vergleich zur Bahn. Ob das Auto in der Luft ist, ergibt sich aus Kontakt, Last oder Federung der Räder. Siehe `src/race/derive.ts`.

Ist die Welt eines Spiels linkshändig, wie die von Forza, erscheint die Strecke im Viewer gespiegelt. Die Lenkung und die Federung der Runden verraten das. Der Tab **Rennanalyse** bietet dann an, eine Achse zu invertieren. Spiele, deren Händigkeit nicht dokumentiert ist (RBR, BeamNG, Trackmania), werden genauso behandelt: gemessen, nicht angenommen.

Über die Fahrkanäle hinaus behalten die Recorder, was jedes Spiel zusätzlich liefert: bei den AC-Spielen ABS und Traktionskontrolle im Eingriff, Bremsbalance, DRS, Boxenbegrenzer, Boost sowie die Lebensdauer von Bremsbelägen und Bremsscheiben. Bei iRacing die Hilfseinstellungen, Bremsbalance, Kraftstoff, Öl- und Wassertemperaturen und jeden anderen Kanal, den es unter seinem eigenen Namen protokolliert. Der Viewer zeichnet sie aus seiner Kanaltabelle, als Leuchten, Stufen, Symbole und Graphen. Mehr aufzunehmen erfordert deshalb keine Änderung am Viewer.
