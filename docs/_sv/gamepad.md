---
title: "Handkontroll och HOTAS"
parent: "Kamera och styrning"
nav_order: 1
lang: "sv"
source: "gamepad.md"
source_hash: "836636b9c7af"
translated: true
outdated: false
---

# Handkontroll och HOTAS

Du kan flyga kameran med en handkontroll i Xbox-stil i stället för tangentbordet. Använd den när du vill luta dig tillbaka och titta runt i en stor scen. Dess indata **läggs till** tangentbordets, så du kan använda båda samtidigt.

## Anslut en handkontroll {#connect-a-controller}

1. Anslut handkontrollen (eller para ihop den).
2. Klicka i vyn och tryck på valfri knapp på handkontrollen. Webbläsare visar en handkontroll först efter dess första indata.
3. Öppna **Kamera & scen → Gamepad**. Enhetslistan visar den med `●`.
4. Tryck den vänstra spaken för att flyga och den högra för att titta. Om kameran glider med spakarna i mitten, höj **Dödzon**.

Alla enheter som webbläsaren kopplar till standardlayouten för handkontroller fungerar. En flyghandspak eller ett gasreglage (HOTAS) ignoreras som standard. Se nedan.

## Mappning {#mapping}

| Reglage | Effekt |
|---|---|
| Vänster spak | Rörelse: framåt och bakåt, och sidledes |
| Höger spak | Titta: girning och stigning, med *Titthastighet* grader per sekund vid full utslagning |
| `RT` / `LT` (analog) | Upp / ner; i den parallella projektionen, zooma in / ut |
| `RB` (hållen) | 6 gånger snabbare |
| `LB` (hållen) | 15 % hastighet |
| `A` (hållen) | 3 gånger sprint (kombineras med RB/LB) |
| `Y` (tryck) | Ram in datan |

Knappnumren följer standardlayouten: A 0, Y 3, LB 4, RB 5, LT 6, RT 7. Spakarna ligger på axlarna 0–1 (vänster) och 2–3 (höger).

## Inställningarna för handkontrollen {#the-gamepad-settings}

I **Kamera & scen → Gamepad**. **Inställningar** / **Dölj** öppnar justeringsreglagen.

| Reglage | Standard | Intervall (ratten) | Betydelse |
|---|---|---|---|
| **Aktiverat** | på | | |
| Enhetsstatus | | | Varje ansluten enhet, med `●` när den följs och `○` när den inte följs. För icke-standardenheter visas *- inte en XInput-handkontroll, ignoreras* eller *- inte en XInput-handkontroll, används ändå*. Utan någon enhet visas: *Ingen handkontroll hittad. Webbläsare visar en handkontroll först när den har skickat sin första indata. Tryck på en knapp på den.* |
| **Använd enhet** | *Endast XInput-handkontroller (rekommenderas)* | | Visas när en icke-standardenhet är ansluten. Välj en enhet på namn för att följa den i stället. |
| **Titthastighet** | 150°/s | 20–540 (5000) | Vridningshastighet vid full utslagning av den högra spaken. |
| **Dödzon** | 12 % | 0–50 % (95 %) | Radiellt: en diagonal rörelse läcker aldrig in i en enda axel ensam. Höj den om kameran glider med spakarna i mitten. |
| **Spakkurva** | x² | linjär (1) till x⁴ (16) | Responsexponent efter dödzonen: finare styrning nära mitten, fortfarande full hastighet vid kanten. |
| **Invertera spakens Y** | av | | |
| **Byt spakar** | av | | Rörelse med den högra spaken, titta med den vänstra. |

Spakformningen: med utslag *m* (spakens vektorlängd) och dödzon *d* blir utdata ((m − d) / (1 − d)) ^ kurva längs spakens riktning. Inom dödzonen är utdata 0.

## Varför bara standardhandkontroller som standard {#why-only-standard-pads-by-default}

Gamepad-API:t rapporterar **varje** HID-enhet med axlar: flyghandspakar, gasreglage, pedaler och ratt. De vilar inte i mitten. En vridningsaxel eller ett gasreglage står på full utslagning när ingen rör vid det. Läses det som en spak blir det en ständig indata med full hastighet som ingen dödzon kan undertrycka. Kameran skulle snurra av sig själv från det att sidan laddas, och alla värmelägen skulle se trasiga ut, eftersom en rörlig kamera startar om ackumuleringen varje bildruta.

Så en enhet följs bara när webbläsaren rapporterar `mapping: "standard"`. Det är dess sätt att säga att det är en XInput-liknande handkontroll med axlarna där du väntar dig dem. Andra enheter visas i listan och markeras som ignorerade. **Använd enhet** väljer en enhet uttryckligen, till exempel för att flyga kameran med en HOTAS. När en handkontroll följs står kameran kvar med den, så att två kontroller inte slåss om kameran beroende på i vilken ordning de räknas upp.

**HOTAS:** bara axlarna 0–3 (två spakar) och de standardiserade knapparna läses. Ett gasreglage eller pedaler på andra axlar gör ingenting. En spak eller ett gasreglage vars axlar inte vilar i mitten kan behöva en större **Dödzon**.

Webbläsare döljer en handkontroll tills den har skickat sin första indata. En inkopplad handkontroll som ingen har rört vid finns alltså ännu inte för sidan.
