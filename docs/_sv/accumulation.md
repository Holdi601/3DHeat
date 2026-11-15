---
title: "Ackumulering"
parent: "Rendering i detalj"
nav_order: 2
lang: "sv"
source: "accumulation.md"
source_hash: "047ad9481db3"
translated: true
outdated: false
---

# Ackumulering

När visaren inte kan rita alla prickar i en bildruta, ritar den en del av dem, sedan en annan del, och lägger ihop bilderna medan du står stilla. Bilden blir tydligare, ungefär som ett foto som framkallas. Om du flyttar kameran börjar det om från början. Raden **Täckning** i statistiköverlägget visar hur långt det har kommit.

![Statistiköverlägget: Täckning visar en procentsats medan bilden framkallas och *exakt* när den är klar](../assets/img/en/performance-stats-overlay.webp)

## För utvecklare {#for-developers}

När en bildruta inte kan rita alla rader, ritar den ett urval och viktar upp det. Bilden blir då en opartisk men brusig skattning. **Ackumulering** slår ihop på varandra följande bildrutor så att skattningen närmar sig det exakta svaret medan inget ändras. Varje bildruta väljer ett av fem lägen ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)). Det senast använda läget finns i `engine.live.accumMode`.

| Läge | När | Vad händer med ackumulatorn |
|---|---|---|
| **reset** | kameran har flyttats, något som ändrar fältet har ändrats, progressiv förfining är av, ett växande fönster startar (första bildrutan vid uppspelning, efter ett hopp), eller den uppspelade linjevärmen har flyttats | Ersätts av den här bildrutans skattning. |
| **extend** | ett **Kumulativt** fönster som bara har vuxit sedan förra bildrutan | Den här bildrutan ritar bara de rader som just blev synliga, med full vikt, och lägger till dem. Inget bleks. |
| **ema** | ett glidande fönster (**Fönster**, **Livstid**) har flyttats | `acc = acc × (1 - 0.34) + frame × 0.34`, ett exponentiellt glidande medelvärde över ungefär tre bildrutor. |
| **mean** | inget har ändrats och skattningen är inte klar | `acc = acc × (1 - 1/n) + frame × 1/n` på den *n*:te bildrutan, ett löpande medelvärde. |
| **skip** (vilande) | konvergerad och inget har ändrats | Inget ritas. Bildrutan sammansätts bara om. |

### Varför var och en {#why-each}

- **Löpande medelvärde, inte summa.** Att skala bufferten med 1 - 1/n och lägga till 1/n av den nya bildrutan ger algebraiskt samma resultat som att summera och dela med *n* i slutet. Men bufferten innehåller alltid ett fälts värde. En summa blir *n* gånger fältet, och på ett 16-bitars mål mättas den vid 65 504. Med en divisor som växer hela tiden skulle en stillastående vy blekna ju längre den står. En rörlig kamera, som börjar om varje bildruta, ser helt korrekt ut. Röktestet kontrollerar att 16 ihopslagna bildrutor ger 1,00 gånger vad en bildruta ger.
- **Extend för kumulativ uppspelning.** Raderna som redan ackumulerats syns fortfarande, så en bildruta behöver bara den bråkdel av en sekund som just kom. Den ryms i en bildruta och läggs därför in exakt. Om man i stället skattade om, skulle en ny slumpmässig delmängd tändas varje bildruta och bleka ut. Det skulle se ut som att blixtar tänds och släcks. En pausad bildruta skulle också fortsätta att fylla i. Testet kontrollerar att totalen stiger monotont under uppspelning och håller sig inom 0,02 % under 2,5 s paus.
- **Glidande medelvärde för glidande fönster.** De ändras verkligen varje bildruta. En fast blandningsvikt följer det glidande fönstret. Ett medelvärde över alla bildrutor sedan uppspelningen började skulle halka efter spelhuvudet. Metoden är också mycket lugnare än att börja om.
- **Återställning för uppspelade linjer.** Huvudena på linjevärmen rör sig varje bildruta. Ett glidande medelvärde skulle smeta ut varje linje till ett streck. Därför ritas varje bildruta helt, och svansens tona är bildens egen.
- **Delbildrutor går via ett mellanmål.** En bildruta som ihopslås med bara en bråkdel av full vikt sprutas först in i ett eget mål från noll och blandas sedan in i ackumulatorn. Om den sprutades direkt med vikt 1/n, skulle varje sprite läggas till med 1/n av storleken på totalen den går med i. Ett halv-flyttalsmål avrundar bort det, och det är värst där det är tätast ([Halvflyttalsackumulering](half-float-accumulation.md)).

### Konvergens {#convergence}

Planen för varje bildruta vet hur många kandidatrader det finns och hur många som skickas. Antalet bildrutor som behövs för att täcka alla rader är därför ⌈kandidater / skickade⌉. När så många bildrutor har slagits ihop är vyn **konvergerad**. Raden *Täckning* i statistiköverlägget går då från en procentsats till *exakt*, och fler bildrutor vilar. Med **Rita alla rader varje bildruta** på (standard) täcker oftast en enda bildruta allt, så konvergensen är omedelbar. De progressiva delarna behövs bara när fönstret har fler rader än en ritplan kan bära (ungefär 67 miljoner).

### Vad som startar om den {#what-restarts-it}

Inställningarna delas in i tre grupper, beroende på vad den ackumulerade bufferten fortfarande betyder efter en ändring:

| Grupp | Ändrar | Effekt |
|---|---|---|
| **Geometri**: vilka rader som bidrar och hur mycket | vyläge; linjevägar; spriteradie, intensitet i mitten och vid kanten, avklingning, mjuk ramp, kurvan, pixelgränser, utplattning; avståndsgallring nära, fjärran och planär; skymning och dölj bakom terräng; skivan; canvasstorlek; värmeupplösning; gruppsynlighet och tecken; differensdelningen; Alla / Spela; historiken; kolumnfiltren och valet av Entiteter; halv-flyttalsförstärkningen | Återställning. |
| **Fönster**: tidsintervallet | spelhuvudet flyttas; reservlivstiden och tonen | Extend (kumulativt) eller glidande medelvärde (glidande). |
| **Sammansättning**: bara färgsättningen | mättnad, täthetsrespons, minsta värme, färgramperna; att skära nivån; rutnät och axlar; inställningar för figuröverlägg och session; skärpedjup | Ritas om utan att värmen rörs. |

En kameraförflyttning återställer alltid. Att dra i mättnad eller ramp är alltså gratis. Att dra i spriteradien startar om konvergensen vid varje steg.
