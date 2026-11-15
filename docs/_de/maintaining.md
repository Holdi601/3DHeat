---
title: "Pflege der Dokumentation"
nav_order: 23
lang: "de"
source: "maintaining.md"
source_hash: "4a4fb46273e5"
translated: true
outdated: false
---

# Pflege der Dokumentation

Diese Seite ist für alle, die den Viewer und diese Seite betreuen. Sie nennt die Schritte, mit denen Seiten, Bilder und Übersetzungen nach einer Änderung richtig bleiben.

Diese Website wird bei **jedem Release** neu geprüft, und immer, wenn sich etwas stark ändert: Tastenbelegungen, der Weg durch die Oberfläche, Einstellungen, Dateiformate. Die Checkliste:

1. **Die Referenzseiten neu erzeugen**: `node tools/docs-refs.mjs` (und `--lang <Sprache>` für jede Sprache). `node tools/docs-refs.mjs --check` schlägt fehl, wenn eine Seite veraltet ist.
2. **Die Screenshots neu erzeugen** aus den [Demodaten](demo-data.md). Nutze einen Computer oder Container mit der Region en-US, damit Zahlen als `0.35` und nicht als `0,35` erscheinen (die Zahlenfelder folgen der Region des Browsers, bis sie geändert wird). Die Demodaten erzeugst du mit `node tools/demo-data.mjs`. Starte einen Entwicklungsserver auf Port 5321 **ohne** lokales Figurenpaket, `HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1`, und führe dann `node tools/docs-shots.mjs --lang <Sprache>` aus. Sieh dir jedes Bild an: Es darf nur Demonamen (*Demo Valley*, *Blue 1*, *Red 3* ...) zeigen, keine echten Karten, Spieler oder Aufzeichnungen.
3. **Auflisten, was sich seit dem letzten Release-Tag geändert hat**: `git log --oneline <letzter Tag>..HEAD` und der Abschnitt **Docs** in `CHANGELOG.md`, der jede Funktion ihrer Seite zuordnet. Jede neue Funktion braucht eine Seite oder einen Abschnitt, mit einem Bild, wo sie auf dem Bildschirm zu sehen ist.
4. **Unabhängige Prüfung** der englischen Seiten durch jemanden, der sie nicht geschrieben hat, für drei Leser: einen Anfänger, ein Achtjähriges, einen Experten. Sind die Schritte vollständig und in der richtigen Reihenfolge, stimmen die Wörter mit der Oberfläche überein, sind die Bilder aktuell und stimmen die Beschriftungen der Diagramme?
5. **Behebe, was die Prüfung gefunden hat.**
6. **Übersetze die geänderten Seiten neu** anhand ihres Quell-Hashs und führe dann die Prüfung je Sprache durch. Siehe `tools/docs-translate.md`.
7. **Prüfe die geänderten Dateien auf vertrauliche Begriffe** und kontrolliere, dass kein Bild etwas anderes als Demodaten zeigt.
8. **Veröffentliche** nur, wenn das Release freigegeben ist.

Dieselbe Prüfung gilt für die Dokumentationsseiten der verwandten Repositories (siehe die Seite [Startseite](index.md#related-repositories)).

## Die Werkzeuge unter exporters/ {#the-tools-under-exporters}

Die Werkzeuge rund um den Viewer sind eigene öffentliche Projekte. Jedes hat seine eigene MIT-Lizenz, eigene Releases, ein eigenes Wiki und eine eigene Update-Prüfung. Sie sind in diesem Repository als Git-Submodule festgehalten:

| Ordner | Repository |
|---|---|
| `exporters/gamefiles/` | [3DHeat-GameFiles](https://github.com/Holdi601/3DHeat-GameFiles) - Strecken und Level aus den eigenen Archiven der Spiele |
| `exporters/gamecapture/` | [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture) - Recorder für Rundentelemetrie; Level aus Gameplay-Videos |
| `exporters/unreal/` | [3DHeat-UnrealExporter](https://github.com/Holdi601/3DHeat-UnrealExporter) - Plugin für den Unreal Editor |
| `exporters/cs2/` | [3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2) - CS2-Demos und Karten |
| `exporters/watcher/` | [3DHeat-Watcher](https://github.com/Holdi601/3DHeat-Watcher) - zeichnet das Spiel im Hintergrund auf |

**Festgehalten** heißt: Dieses Repository verweist auf genau einen Commit jedes Werkzeugs. Ein Checkout des Viewers erhält diese Commits:

```bash
git clone --recursive https://github.com/Holdi601/3DHeat
# oder, nach einem einfachen Klonen:
git submodule update --init
```

Beide Wege oben führen nach dem Ziehen `git submodule update --init` aus. So folgen die Werkzeuge dem Viewer bis zu den Commits, die seine neueste Version festhält, nicht den neuesten Commits der Werkzeuge selbst. Eine neuere Version eines Werkzeugs erreicht den Viewer, wenn der Verweis hier verschoben wird. Änderungen an einem Werkzeug werden zuerst in seinem eigenen Ordner (seinem eigenen Repository) committet und gepusht. Danach wird der neue Verweis hier committet. Jedes Werkzeug prüft außerdem selbst auf neuere Releases. Das ist in seinem eigenen Repository dokumentiert.
