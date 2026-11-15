---
title: "Die zwei Backends"
parent: "Interna des Renderings"
nav_order: 1
lang: "de"
source: "backends.md"
source_hash: "435a9fedb9c2"
translated: true
outdated: false
---

# Die zwei Backends

Ein Browser kann einer Seite auf zwei Arten erlauben, die Grafikkarte zu nutzen: WebGPU (neuer) und WebGL2. Der Viewer kann beide und wählt selbst das beste. Du musst normalerweise nichts tun. Welches läuft, siehst du unter **Backend** im Statistik-Overlay (oben rechts in der Ansicht).

![Das Statistik-Overlay: Backend, FPS, Frame, Zeilen im Fenster, Sprites / Frame, Budget, Heatmap-Aufl., Abdeckung](../assets/img/en/performance-stats-overlay.webp)

Der Viewer hat zwei vollständige Renderer hinter einer gemeinsamen Schnittstelle ([`types.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)): **WebGPU** ([`webgpu/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgpu)) und **WebGL2** ([`webgl2/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgl2)). Beide zeichnen dasselbe Bild mit denselben Verfahren. Die Shader gibt es nebeneinander in WGSL und GLSL ES 3.00. Die erste Zeile des Statistik-Overlays, **Backend**, sagt, welcher läuft. Fährst du mit der Maus darüber, steht da, warum WebGPU nicht benutzt wurde, falls das so ist.

## Für Entwickler {#for-developers}

### Wie eines gewählt wird {#how-one-is-chosen}

Eine Zeichenfläche kann nur eine Art von Kontext halten, deshalb fällt die Wahl einmal, bevor etwas gezeichnet wird ([`createRenderer.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/createRenderer.ts)):

1. Sofern WebGL2 nicht erzwungen wird: Ist `navigator.gpu` vorhanden, fordert der Viewer einen Adapter mit `powerPreference: 'high-performance'` und ein Gerät an und erzeugt den WebGPU-Renderer. Jeder Fehler wird als Grund gemerkt.
2. Wurde WebGPU erzwungen und ist es fehlgeschlagen, hört der Viewer auf. Die Ansicht zeigt *Renderer kann nicht gestartet werden.* mit dem Grund.
3. Sonst erzeugt der Viewer den WebGL2-Renderer (ebenfalls mit dem Adapter für hohe Leistung). Ist WebGL2 nicht verfügbar oder kann nicht in Fließkomma-Texturen zeichnen (`EXT_color_buffer_float`), zeigt die Ansicht den Fehler.

`powerPreference: 'high-performance'` verhindert, dass ein Laptop mit umschaltbarer Grafik der Seite die integrierte GPU gibt. Darüber hinaus hat die Seite nichts zu sagen: Hardwarebeschleunigung ist eine Browser-Einstellung.

### URL-Schalter {#url-switches}

Hänge sie an die Adresse der Seite an, zum Beispiel `http://127.0.0.1:5273/?backend=webgl2`.

| Parameter | Wirkung |
|---|---|
| `?backend=webgpu` | WebGPU verwenden, sonst Fehler. |
| `?backend=webgl2` | WebGL2 verwenden, auch wo WebGPU verfügbar ist. Trennt „das wird falsch gezeichnet“ von „das wird auf WebGPU falsch gezeichnet“. |
| `?heat=f16` | Erzwingt den 16-Bit-Pfad für die Heatmap-Akkumulation auf beiden Backends ([Halbfloat-Akkumulation](half-float-accumulation.md)). |
| `?glcheck` | WebGL2: liest GL-Fehler während des Bildes und zeigt sie unter `renderer.heatDebug`. Standardmäßig aus, weil `getError` den Pipeline-Ablauf anhält. |
| `?occdebug=<n>` | WebGL2-Hilfe für Entwickler: ersetzt die Intensität durch Verdeckungs-Testwerte. Nicht für den normalen Gebrauch. |

### Unterschiede, die zählen {#differences-that-matter}

| | WebGPU | WebGL2 |
|---|---|---|
| Speicherung der Zeilen | Storage-Buffer: ein Zeilenindex ist ein Array-Index. Fordert die größte Storage-Buffer-Bindung und Buffergrößen des Adapters an. | Ganzzahl-Texturen (8.192 Texel breit), über `gl_VertexID` adressiert, durch eine Block-Index-Textur je Bild. |
| 32-Bit-Akkumulation der Heatmap | Wenn der Adapter `float32-blendable` und `float32-filterable` bietet | Wenn `EXT_float_blend` vorhanden ist |
| Sonst | 16-Bit (`r16float`) | 16-Bit (`R16F`) |
| Tiefenbereich | [0, 1]; die Engine stellt die Matrizen von three.js ([-1, 1]) mit einer Umrechnung davor. Ohne sie landet eine Parallelprojektion, deren Tiefe linear ist, fast vollständig unter 0 und wird stillschweigend abgeschnitten. | [-1, 1], unverändert verwendet |
| Uniforms | Ein Ring von 256-Byte-ausgerichteten Slots, einer pro Zeichenaufruf, über den Offset gebunden. `queue.writeBuffer` wird in der Warteschlange geordnet, daher würde ein Buffer, der je Aufruf neu geschrieben wird, jeden Aufruf den letzten Schreibvorgang lesen lassen. Der Uniform-Block des Heatmap-Durchgangs ist genau ein 256-Byte-Slot. | Gewöhnliche Uniforms |
| Heatmap-Ziel unter der Canvas-Auflösung | Bekommt eine eigene Tiefentextur (alle Anhänge eines Durchgangs müssen gleich groß sein) | |
| Bildaufnahme | `captureFrame()` rendert das Composite ein zweites Mal in ein Offscreen-Ziel und liest es zurück (Headless-Chromium rendert WebGPU, komponiert aber sein Canvas nie) | Liest den Standard-Framebuffer beim nächsten gerenderten Bild zurück |
| Rücklesen | Staging-Buffer werden behalten und wiederverwendet; ein Leser gleichzeitig in Arbeit | `readPixels`, wobei der Treiber nach dem gültigen Format-/Typ-Paar gefragt wird |

Beide Backends laden die Kurventabelle der Sprites als Halbfloats hoch. Das `queue.writeTexture` von WebGPU kopiert rohe Bytes, deshalb werden die Daten vorher nach binary16 kodiert ([`half.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/half.ts)).

#### Texturgrenzen {#texture-limits}

`texStorage2D` über `MAX_TEXTURE_SIZE` hinaus wirft keinen Fehler. Die Reservierung wird verworfen, spätere Uploads schlagen fehl und das Sampling liefert null. Die WebGL2-Hilfsfunktion [`createTexture`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/glutil.ts) prüft beide Abmessungen gegen die Grenze und wirft mit der Größe einen Fehler. Die Block-Index-Textur ist zweidimensional (4.096 breit), so kann sie keine Grenze sprengen. `src/render/limits.test.ts` prüft jede Texturabmessung gegen die Grenzen, die sich lohnen. Der WebGL2-Renderer lehnt außerdem ein Gerät ab, dessen maximale Texturgröße unter der Breite von 8.192 der Zeilentextur liegt.

### Beide testen {#testing-both}

`npm run smoke` steuert die echte App in Headless-Chromium auf WebGL2 (standardmäßig `http://127.0.0.1:5273/`). Für WebGPU übergibst du `"http://127.0.0.1:5273/?backend=webgpu"` an `node tools/smoke.mjs`, für den Halbfloat-Pfad `npm run smoke:f16`. `tools/probe-webgpu.mjs` und `tools/probe-present.mjs` (unter den Entwicklerwerkzeugen in [Kommandozeilen-Werkzeuge](ref-tools.md) aufgeführt) prüfen in Headless-Browsern, ob Adapter und Bildausgabe verfügbar sind.
