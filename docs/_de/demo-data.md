---
title: "Demodaten"
nav_order: 2
lang: "de"
source: "demo-data.md"
source_hash: "217e44016d8d"
translated: true
outdated: false
---

# Demodaten: den Viewer in fünf Minuten ausprobieren

![Intensität von zehn Panzer-Matches im Demo-Tal: was Schritt 4 zeigt](../assets/img/en/heat-hero.webp)

Noch keine eigenen Daten? Das Repository macht welche. Alles darin ist erfunden: ein Tal, ein Hof und Matches von drei ausgedachten Spielstilen mit Spielern wie *Blue 1* oder *Red 3*. Alle Bilder auf dieser Seite wurden damit gemacht.

## Erzeugen {#make-it}

```bash
node tools/demo-data.mjs
```

Das schreibt nach `tools/.shots/demo/`:

| Datei | Was sie ist |
|---|---|
| `demo-valley.glb` | ein 12 km großes Tal mit zwei Hügeln und einem Dorf, als 3D-Level |
| `demo-yard.glb` | ein 160 m großer ummauerter Hof mit Gebäuden, als 3D-Level |
| `tanks.parquet` | 10 Panzer-Matches, 8 gegen 8: Bewegung, Schüsse, Treffer mit der Stelle an der Wanne, Brände, Abschüsse, Wracks, Turmausrichtung, Sieger |
| `tanks/match-NN.parquet` | dieselben Matches, je eine Datei, für [viele Matches auf einmal](many-matches.md) |
| `air.parquet` | ein Luftkampf 4 gegen 4 mit Raketen, Flares, Abschüssen und Fehlschüssen |
| `shooter.parquet` | 12 Runden 5 gegen 5 zu Fuß: Schüsse, Abschüsse, ein Bombenlegen, verdiente und ausgegebene Credits, Helme und Ausrüstung |
| `mass/` | ein Ordner mit kleinen `.3dheat`-Matches, für die [Massenanalyse](mass-analysis.md) |
| ein Satz Rundendateien | zwei Runden eines Autos auf einer ausgedachten Strecke, für die [Rennanalyse](race-analysis.md) |

Jede Tabelle nennt ihre Spalten in ihrer Fußzeile, daher lädt sie ohne jede Zuordnung.

## Ausprobieren {#try-it}

1. Starte den Viewer (`start.bat` unter Windows oder einmal `npm install` und dann `npm run dev` auf jedem System) und öffne `http://127.0.0.1:5273/`.
2. **Hintergrund / Level → 3D-Modell…** und wähle `demo-valley.glb`.
3. **Quelle → Dateien…** und wähle `tanks.parquet`.
4. Drücke `F`, um die Daten einzurahmen. Du siehst die [Intensität](heat.md) von zehn Matches.
5. Probiere die Modusleiste: **Differenz** (Blue gegen Red), **Team-Intensität**, **Linien**.
6. Öffne **Erkenntnisse** (in der Heatmap-Seitenleiste): Es findet die Stellen, an denen weit mehr geschossen, getroffen und zerstört wurde als anderswo – rund um die beiden Hügel.
7. Öffne den Tab **Match** und wähle unter **Matches im Replay** *Match 01*. Drücke auf der Zeitleiste auf **Abspielen**: das [Replay](match-replay.md).

![Ein Replay von Match 01 mit Panzern als Figuren](../assets/img/en/replay-overview.webp)

Für den Shooter lade `demo-yard.glb` und `shooter.parquet`; für den Luftkampf `air.parquet` (die Figuren sind bei **Figurengröße** 4 besser zu sehen, einem Schieberegler im Bereich **Team-Ansicht** der Heatmap-Seitenleiste).

## Die Bilder {#the-screenshots}

Die Bilder der Website entstehen aus diesen Daten über ein Skript, in jeder Sprache des Viewers:

```bash
node tools/demo-data.mjs
HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1   # PowerShell: $env:HEAT3D_FIGURE_PACK="none"; npx vite ...
node tools/docs-shots.mjs --lang en
```

Der Screenshot-Server läuft ohne lokales Figurenpaket, daher wird nur der öffentliche Figurenkatalog gezeigt. Die Bilder landen in `docs/assets/img/<lang>/`. Siehe [Pflege der Dokumentation](maintaining.md).
