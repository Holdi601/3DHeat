---
title: "Erkennung von Software-Rendering"
parent: "Interna des Renderings"
nav_order: 6
lang: "de"
source: "software-rendering.md"
source_hash: "2ae9a1addecb"
translated: true
outdated: false
---

# Erkennung von Software-Rendering

Zeichnet dein Browser auf dem Hauptprozessor statt auf der Grafikkarte, ist der Viewer um ein Vielfaches langsamer. Der Viewer merkt das und zeigt einen roten Kasten, der dir sagt, was du einschalten sollst.

Wenn ein Browser die Hardwarebeschleunigung ausgeschaltet hat oder sein Treiber auf einer Sperrliste steht, zeichnet er WebGL und WebGPU auf der CPU. Alles funktioniert weiter, nur um ein Vielfaches langsamer. Dann heißt es: „Dieser Viewer ist mit meinen Daten unbrauchbar langsam“. Das ist ein Symptom, das auf das Werkzeug zeigt und nicht auf eine Einstellung im Browser. Deshalb prüft der Viewer den Namen des Renderers und sagt es ([`gpuClass.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/gpuClass.ts)).

## Das Banner {#the-banner}

Wenn der Renderer eindeutig als Software erkannt wird, erscheint oben in der Seitenleiste (Tabs Heatmap und Match) ein roter Kasten über der Modusleiste:

![Das rote Banner: Läuft ohne Grafikkarte](../assets/img/en/software-rendering-banner.webp)

> **Läuft ohne Grafikkarte.**
> Dieser Browser zeichnet auf der CPU statt auf der Grafikkarte. Das ist um ein Vielfaches langsamer und verarbeitet keine großen Datensätze. Schalte die Hardwarebeschleunigung in den Browser-Einstellungen ein (Chrome: Einstellungen → System → „Grafikbeschleunigung verwenden, wenn verfügbar“, dann neu starten). Prüfe außerdem, ob der Grafiktreiber aktuell ist.

## Für Entwickler {#for-developers}

### So entscheidet er {#how-it-decides}

Der Renderer-String (`UNMASKED_RENDERER_WEBGL` von WebGL2 oder Hersteller, Architektur und Gerät des WebGPU-Adapters) wird in Kleinbuchstaben umgewandelt und eingeordnet:

- **software**, wenn er `swiftshader`, `llvmpipe`, `softpipe`, `swrast`, `microsoft basic render driver`, `apple software renderer` oder `generic renderer` enthält;
- **hardware**, wenn er einen bekannten GPU-Hersteller oder eine bekannte Familie enthält (`nvidia`, `geforce`, `rtx`, `quadro`, `amd`, `radeon`, `intel`, `arc`, `apple m`, `adreno`, `mali`, `powervr`, `xclipse`);
- **unbekannt** sonst.

Nur *software* löst das Banner aus. Ein nicht erkannter Adapter sagt gar nichts. Jemanden mit einer funktionierenden GPU zu bitten, seinen Browser umzustellen, wäre der schlechtere Fehler, verglichen mit einem verpassten Fall.

### Der Kurzname {#the-short-name}

Dasselbe Modul kürzt den Renderer-String für die Anzeige. Aus einem ANGLE-String wie `ANGLE (Vendor, Vendor Model (0x0000ABCD) Direct3D11 vs_5_0 ps_5_0, D3D11)` behält es das Geräte-Feld, entfernt die PCI-ID und die angehängte API- und Shader-Version und zeigt `Vendor Model`. Der Kurzname erscheint unter **Ressourcenbudgets**, mit dem vollen String als Tooltip. Die Speicherschätzung zeigt den vollen String.
