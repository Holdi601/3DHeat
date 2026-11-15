---
title: "Rendering-Interna"
nav_order: 22
has_children: true
lang: "lb"
source: "rendering-internals.md"
source_hash: "4c9327ee5852"
translated: true
outdated: false
---


# Interne Renderer-Mechanismen

D'Visualisatioun zeechent Millioune Punkten als glänzend Fleeken a addéiert se. Dës Sektioun erkläert d'Tricken, déi dat schnell halen, an wat d'Zuelen an der Statistikanzeig bedeuten. Liest se, wann d'Visualisatioun sech lues ufillt, oder wann Dir um Renderer schaffe wëllt.

```
Daten -> Zäitfënster -> GPU-Filter -> Sampling-Plang -> Splat -> Akkumuléieren -> Faarf -> Bildschierm
```

Fir ze gesinn, wéi Äre Computer dermat zerechtkënnt, kuckt an d'Statistikbox oben riets an der Ansiicht: [Leeschtungsfeld a Statistikanzeig](performance-and-stats.md). Nei Wierder (GPU, Zeil, Sprite, Heatmap) stinn am [Glossar](glossary.md).

## Dat Haaptproblem {#the-core-problem}

Eng Summ vun iwwerlappende radialen Verlöff kascht *N* × π*r*² gemëschte Fragmenter pro Bild. Bei 100 Millioune Sprites mat 8 px Radius sinn dat 2 × 10¹⁰ Fragmenter - ongeféier eng Sekonn Aarbecht op enger High-End-GPU. Dat kann een net all Bild mat Gewalt rechnen, dofir kombinéiert d'Visualisatioun:

- **no der Zäit sortéiert Zeilen** - e Zäitfënster ass zwou binär Sichen, an d'Kaschte vum Ofspille follegen de Zeilen am Fënster, net dem ganze Datesaz;
- **kee Kaschten pro Zeil op der CPU pro Bild** - d'Zeilen liewen am GPU-Späicher, quantiséiert; d'Filter, d'Gruppenvirzeechen, de Liewensdauer-Test, d'Fënster, d'Ofdeckung an de Schnëtt ginn all am Vertex-Shader ausgewäert;
- **geschichtet Sampling** mat ausgläichende Gewiichter, wann ee Bild net all Zeilen zeechne kann, an **progressiv Akkumuléierung**, déi op d'exakt Ergebnis vun allen Zeilen zoukënnt, solang d'Ansiicht gläich bleift ([Sampling a Budgeten](sampling-and-budgets.md), [Akkumuléierung](accumulation.md));
- **e Zwee-Stufe-Drassel**, dee Sprites pro Bild, dann d'Heat-Opléisung, géint d'Bildfrequenz tauscht ([Sampling a Budgeten](sampling-and-budgets.md#the-adaptive-budget));
- **erzwongen Späicherbudgeten**, sou datt en Datesaz, deen net passt, siichtbar oofgeschnidden gëtt, anstatt datt d'App ofstierzt ([GPU-Späicherresidenz](gpu-memory.md)).

## Ee Bild {#one-frame}

D'Bildschleife ass [`Engine.frame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts). Alles, wat sech mat der Bildfrequenz ännert - Kamera, Afspillkopp, Budget - lieft an der Engine, net am Applikatiouns-Zoustand. Dofir kascht e Bild keng React-Aarbecht; de Zoustand gëtt eemol pro Bild gelies an nëmmen fir selten Uweisungen zréckgeschriwwen.

1. **Nei Daten?** En neie Datesaz gëtt op engem Bild ugekënnegt (*Lued N Zeilen op d'GPU hoch*) an op dem nächste Bild higelueden, sou datt d'Noriicht gemoolt gëtt, ier d'Aarbecht de Fuedem blockéiert. En neie Level gëtt dem Renderer iwwergi; d'Linn-Heat-Route ginn gebaut oder fräigemaach.
2. **Afspillkopp** geet weider (héchstens 0,1 s Echtzäit pro Bild), lafft a Schleife oder hält un.
3. **Kamera** liest d'Tasten, d'Maus an de Gamepad; d'Achsespiegelung gëtt an d'Ansiichtsmatrix agebaut; op WebGPU wandelt eng Tiefe-Ëmrechnungsmatrix d'OpenGL-artegen Tiefebereich vun three.js an den vun WebGPU ëm.
4. **Wat siichtbar ass**: den Zäitberäich aus der Zäitlinn an dem Verlaf; d'Gruppenvirzeeche-Tabell (Sichtbarkeit nëmmen bei enger Trennung no enger Kolonn); bis zu véier Filter - Kolonnefilter an d'Entitéiten-Auswiel; d'Differenztrennung.
5. **Faarf- an Kurventabellen** ginn nei gebaut, wann hir Astellunge geännert hunn.
6. **Budget**: den adaptiven Regler setzt dat Sprite-Budget vun dësem Bild an d'Heat-Opléisung; mat *Jiddere Zeil all Bild zeechnen* gëtt d'Budget opgehuewen, bis all Kandidatezeil ofgedeckt ass.
7. **Signaturen** entscheeden, wat de Akkumulatiounspuffer nach bedeit: eng Ännerung, déi d'Bäitrag vun de Zeilen oder hir Aart ännert (*Geometrie*), de Zäitberäich, oder nëmmen d'Faarwung vum Resultat (*Composite*). Kuckt [Akkumuléierung](accumulation.md#what-restarts-it).
8. **Sampling-Plang**: wéi eng Bléck vu Zeilen gezeechent ginn ([Sampling a Budgeten](sampling-and-budgets.md)).
9. **Akkumuléierungsmodus**: zrécksetzen, verlängeren, gläitend Duerchschnëtt, lafende Mëttelwäert oder Leerlaf.
10. **Geometrie vum Box-Replay** (Würfel, Spuere) op der CPU, nëmmen an deem Modus a nëmmen, wann net am Leerlaf.
11. **Zeechnen**: de Backend zeechent d'Szene (Level, Gitter, Achsen, Boxen, Spuere, Lineal), spritzt d'Heat an d'Heat-Zil, féiert se an den Akkumulator zesummen a setzt d'Heat iwwer d'Szene op de Canvas.
12. **Auto-Belichtung** leeft, wann säi Countdown um Null ukënnt; d'Heat-Sonn vum Lineal liest héchstens all 120 ms en Pixel; d'Uweisunge ginn ausginn.

En Leerlafbild - konvergéiert, näischt huet sech geännert - iwwerspréngt d'Szene an d'Spritzung, mécht awer nach ëmmer **e neit Composite**: en WebGL-Canvas ouni `preserveDrawingBuffer` huet no der Comptéierung en onbestëmmten Inhalt, dofir ass et net sécher, dorop ze vertrauen, datt d'lescht Bild bleift. D'Szene- an d'Heat-Zilen sinn d'eegen Framebuffer vun der Visualisatioun a behalen den Inhalt, sou datt en Leerlafbild nëmmen ee Vollbild-Duerchgang kascht.

## Säiten an dësem Kapitel {#pages-in-this-section}

- [Déi zwee Backends](backends.md) - WebGPU an WebGL2, wéi ee gewielt gëtt, URL-Schalter
- [Akkumuléierung](accumulation.md) - zrécksetzen, verlängeren, gläitend Duerchschnëtt, lafende Mëttelwäert
- [Sampling a Budgeten](sampling-and-budgets.md) - de geschichtete Sampler, exakten Modus, dat adaptiv Budget
- [Half-Float-Akkumulatioun](half-float-accumulation.md) - Beräich a Genauegkeet op 16-Bit-Zilen
- [GPU-Späicherresidenz](gpu-memory.md) - quantiséiert Zeilespäicher an dat erzwongene GPU-Budget
- [Erkennung vum Software-Rendering](software-rendering.md)
- [Leeschtungsfeld a Statistikanzeig](performance-and-stats.md)
