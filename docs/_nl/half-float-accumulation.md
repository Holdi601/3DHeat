---
title: "Half-float-accumulatie"
parent: "Renderinginterne werking"
nav_order: 4
lang: "nl"
source: "half-float-accumulation.md"
source_hash: "9217287b1c9e"
translated: true
outdated: false
---

# Half-float-accumulatie

Sommige grafische kaarten kunnen warmte alleen in kleine 16-bit-getallen bewaren, wat de heetste plekken kan afsnijden of afronden. De viewer schaalt de getallen zodat dit niet te zien is. Je hoeft niets te doen; deze pagina is voor ontwikkelaars.

## Voor ontwikkelaars {#for-developers}

Een apparaat dat niet naar 32-bit-float-texturen kan mengen (geen `float32-blendable` en `float32-filterable` op WebGPU, geen `EXT_float_blend` op WebGL2), krijgt een warmtedoel van **16-bit float** (`r16float`): een maximum van 65.504 en 11 bits mantisse. Een dicht veld bereikt honderdduizenden, dus een 16-bit-doel **knipt af** én **rondt af**, en de afrondingsfout groeit met de waarde - wat zich heel specifiek laat zien: de dichtste gebieden lijken veel koeler dan ze zijn, terwijl dunne gebieden er goed uitzien. Twee mechanismen lossen dit op; het beeld is alleen correct als beide werken.

### Bereik: een versterking op elke splat {#range-a-gain-on-every-splat}

Elke splat wordt vermenigvuldigd met een **versterking**, en de samenstelling deelt die er weer uit, zodat het veld zich in de grootte bevindt die half-floats goed aankunnen ([`heatGain`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

```
estimate = analytische verzadigingsschatting voor deze dataset, straal en middenintensiteit
gain     = 2 ^ round(log2(2048 / estimate)),  exponent begrensd op -20..20
```

2048 laat ongeveer 32× ruimte boven de top van het verloop voordat 65.504 bereikt wordt. De versterking is een **macht van twee**, dus een kleine verschuiving in de schatting laat haar - en de opgebouwde buffer - ongewijzigd, en ze is onderdeel van de [geometrische signatuur](accumulation.md#what-restarts-it), dus een wijziging start de opbouw opnieuw.

Ze is vastgemaakt aan de analytische schatting en bewust **niet** aan het verzadigingspunt. De verzadiging wordt bij het samenzetten toegepast, precies zodat het slepen ervan nooit de convergentie opnieuw start; als de versterking met haar mee zou bewegen, zou de buffer nog steeds waarden bevatten die bij de oude versterking zijn geschreven, terwijl de samenstelling door de nieuwe deelt. De twee fouten zouden elkaar dan precies opheffen, en de schuifregelaar zou lijken niets te doen.

Op een 32-bit-doel is de versterking altijd 1.

### Precisie: gedeeltelijke frames vanaf nul {#precision-partial-frames-from-zero}

Een frame dat met gewicht 1/n in de opbouwbuffer wordt samengevoegd, wordt eerst vanaf nul in een **tijdelijk doel** gesplat en daarna ingemengd, in plaats van rechtstreeks in de opbouwbuffer met gewicht 1/n ([Accumulatie](accumulation.md#why-each)). Rechtstreeks zou de bijdrage van elke sprite 1/n van de grootte van het lopende totaal zijn waaraan hij wordt toegevoegd, en een half-float rondt die weg - des te erger hoe dichter de pixel. Vanaf nul is elke toevoeging vergelijkbaar met het totaal waarbij hij komt, wat dezelfde rekenkunde is die een enkel frame al doet.

### Gemeten effect {#measured-effect}

Op een dichte synthetische scène, het veld gelezen in gelijke eenheden:

| | p50 | p90 | p99 | max |
|---|---|---|---|---|
| 32-bit (referentie) | 6051 | 60742 | 121199 | 232744 |
| 16-bit voor | 1372 | 6972 | 7840 | 7840 |
| 16-bit na | 5996 | 59666 | 118824 | 210357 |

De piek ging van 30× te laag naar 0,90×, en het samengezette frame komt tot op 0,1% van de gemiddelde helderheid overeen met het 32-bit-frame.

### Het testen {#testing-it}

`?heat=f16` dwingt dit pad af op elke backend - zonder schakelaar zou de rekenkunde die alleen zwakkere GPU's draaien alleen worden getest door de mensen die ze draaien. `npm run smoke:f16` draait de hele browsersuite ermee.

Terugleesacties heffen de versterking op: de automatische belichting deelt het gelezen veld erdoor, en `engine.readHeatProbe()` geeft haar door aan de renderer - wat ook is hoe de [live warmte-uitlezing van de liniaal](measure.md#notes) wordt gelezen.
