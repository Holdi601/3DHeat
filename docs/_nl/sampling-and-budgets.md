---
title: "Bemonstering en budgetten"
parent: "Renderinginterne werking"
nav_order: 3
lang: "nl"
source: "sampling-and-budgets.md"
source_hash: "1de02c020b1b"
translated: true
outdated: false
---

# Bemonstering en budgetten

Als er te veel stippen zijn om in één frame te tekenen, tekent de viewer een gelijkmatig monster en laat hij elke stip zwaarder meetellen, zodat het beeld klopt. Een regelaar past aan hoeveel hij tekent, zodat de viewer zijn framesnelheid houdt.

## Regelaars van het prestatiepaneel {#performance-panel-controls}

| Regelaar | Standaard | Bereik (schuifregelaar) |
|---|---|---|
| **Elke rij in elk frame tekenen** | aan | |
| **Adaptief budget** | aan | |
| **Doel-FPS** | 60 | 20-240 (1000) |
| **Start-sprites / frame** (adaptief) of **Sprites / frame** | 4,00M | 65.536-268.435.456, logaritmisch (268.435.456) |
| **Heatmapresolutie** | 100% | 25-100%, vermenigvuldigd met de schaal van de adaptieve tweede fase |
| **Progressieve verfijning** | aan | Uit: elk frame is een verse schatting van één frame (handig om het ruwe monster te zien). |

Zie ook [Prestatiepaneel en statistiekenlaag](performance-and-stats.md).

## Voor ontwikkelaars {#for-developers}

### Kandidaatrijen {#candidate-rows}

Rijen worden opgeslagen in oplopende tijd. Het tijdvenster [*lo*, *hi*] wordt een rijbereik met twee binaire zoekacties over de tijdkolom ([`candidateRange`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)); zonder tijdkolom is elke rij een kandidaat. Dit zijn de **Rijen in venster** van de statistiekenlaag. Tests per rij - filters, groepen, splitsing, culling, doorsnede, levensduur - gebeuren later, in de shader; een rij die faalt, kost één vertex-aanroep en geen fragmenten.

### Het monsterplan {#the-sampling-plan}

[`planFrame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts) verdeelt het kandidaatbereik in **blokken van 4.096 opeenvolgende rijen** en kiest hoeveel er getekend worden uit het spritebudget van het frame:

- Dekt het budget elk blok, dan worden ze allemaal getekend - het frame is exact.
- Anders worden blokken genomen met een gelijke stap over het bereik, verschoven met een jitter die elk frame met de gulden snede opschuift, zodat opeenvolgende frames verschillende blokken bestrijken en de vereniging gelijkmatig opvult. Dit is een **gestratificeerd** monster: elk deel van het tijdbereik is in elk frame vertegenwoordigd.

De warmte van elke getekende rij wordt vermenigvuldigd met **kandidaten / ingediend**, zodat de verwachte warmte van een frame bij elk budget exact is; alleen de ruis hangt van het budget af. Rijen leven in brokken van 8.388.608 (zie [GPU-geheugenresidentie](gpu-memory.md)); een blok wordt gesplitst waar het een brok overschrijdt, en elke brok krijgt de lijst met blokstarts die hij moet tekenen.

Eén plan kan maximaal 65.536 blokken dragen - 268.435.456 sprites - omdat beide backends een vaste buffer van 65.536 plekken voor blokstarts hebben. Een verzoek om meer wordt daar afgekapt, en het tekort toont zich eerlijk als meer frames om te convergeren.

### Elke rij in elk frame tekenen {#draw-every-row-each-frame}

**Prestaties → Elke rij in elk frame tekenen** (standaard **aan**): het budget wordt een ondergrens in plaats van een bovengrens, en een frame dat een verse schatting begint tekent elke rij waarvoor het verantwoordelijk is (tot de grens van 268M).

De reden: een cameraverplaatsing gooit de accumulatie weg, dus een bewegend frame is één schatting waarvan de ruis bepaald wordt door hoeveel van de data het tekende - met een kwart getekend zie je een kwart in heldere gewogen stippen, en dat is wat een bewegend beeld laat glinsteren. Alles tekenen maakt elk frame het afgewerkte beeld. De prijs is dat de frametijd nu de omvang van de data in het venster volgt; de hefbomen zijn een smaller tijdvenster, filters of een afstandscull, die de kandidaten verminderen in plaats van dunner te bemonsteren.

Zet het uit op hardware die het hele veld niet in één keer kan dragen: *Sprites / frame* is dan een echte grens, en het beeld convergeert over enkele stilstaande frames.

Wat een volledig plan kost, gemeten op een high-end desktop-GPU bij een 4K-canvas met een groot niveau, met sprites van 1 m straal (een pixel of twee): ongeveer 100M sprites per frame bij 30 fps, 200M bij 15 fps, en het maximum van 268M bij ongeveer 12 fps. Bij zulke kleine sprites is de vertexfase de hele kost en verandert de heatmapresolutie niets; bij grote sprites is het de vulling: 8M sprites van 100 m straal kostten 2,5 s per frame bij volle heatmapresolutie en 170 ms bij 25%. **Elke rij in elk frame tekenen** begint daarom bij 67M en stijgt per frame met een kwart zolang frames onder 150 ms blijven, en halveert zodra ze boven 400 ms komen, zodat een zware weergave een frame niet voorbij wat de watchdog van de GPU toestaat kan duwen.

### Het adaptieve budget {#the-adaptive-budget}

**Prestaties → Adaptief budget** (standaard aan) stemt het spritebudget af om **Doel-FPS** te halen ([`BudgetController`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)). Het ligt stil bij de boxreplay en tijdens videorenders.

De invoer is de frametijd, afgevlakt (90% vorige + 10% nieuw, met losse frames begrensd op 2 s), tegen een doel van 1000 / max(15, doel-FPS) ms.

**Fase één - sprites.** Elk frame wordt het budget vermenigvuldigd met `1 + (doel / frame - 1) × versterking`, met een versterking van 0,35 als het te traag is en 0,08 als er ruimte is, begrensd tot een factor van 0,5-1,25 per frame en tot 65.536-268.435.456 sprites.

**Fase twee - resolutie.** Pas als het budget al op zijn ondergrens staat en de frames nog meer dan 10% te traag zijn, daalt de resolutie van de warmtebuffer met 8% per frame, tot 25% van het canvas; hij herstelt met 4% per frame zolang er 30% ruimte is. De kosten van de fragmenten dalen met het kwadraat van de resolutie, wat onder een zacht verloop bijna onzichtbaar is. (Gemeten op softwarerendering met 10M rijen en te grote sprites: 141 ms → 17 ms per frame.) De schaal wordt afgerond op zestiende; de *Heatmapres* van de laag toont hem.

**Opgeven.** Een traag frame ziet er hetzelfde uit, of de sprites het veroorzaakten of een zwaar niveau - er is geen timing per pass. Als het budget op zijn ondergrens blijft en de frames 30 frames lang onder 70% van het doel blijven, waren de sprites niet de kost: de regelaar schakelt over op **klimmen**, waarbij hij het budget elke 14 frames met 1,5 vermenigvuldigt en de resolutie herstelt, zolang de frametijd binnen 1,5× blijft van wat ze was op de ondergrens. Een klim die het erger maakt dan dat, keert terug naar 60% en hervat de normale regeling; het bereiken van het doel beëindigt de klim.

Met het adaptieve budget uit is het budget eenvoudig **Sprites / frame**.

Met *Elke rij in elk frame tekenen* aan draait het adaptieve budget nog steeds, maar de exacte regel verhoogt het budget om alle kandidaatrijen te dekken, dus in de praktijk regelt het alleen de resolutiefase en frames die geen verse schatting beginnen.
