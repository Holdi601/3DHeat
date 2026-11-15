---
title: "Kameraväg och video"
nav_order: 15
lang: "sv"
source: "camera-path-and-video.md"
source_hash: "1863f90ba4b7"
translated: true
outdated: false
---

# Kameraväg och video

Gör en film av dina data. Du placerar kameran på några platser, och visaren flyger mellan dem och sparar en video. Varje bildruta är mycket ren, utan brus. Kameran och spelhuvudet rör sig tillsammans, så samma panel gör också en timelapse ([`PathPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/PathPanel.tsx), [`campath.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/campath.ts), [`record.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/record.ts)).

## Gör en flygning {#make-a-flythrough}

1. Flyg dit filmen ska börja och tryck på **Lägg till nyckelbild här** i **Kamerabana & rendering**.
2. Flyg till nästa plats och tryck på knappen igen. Upprepa för varje stopp.
3. Bocka i **Förhandsgranska längs banan** och dra i **Position längs banan** för att kontrollera rörelsen.
4. Ställ in **Längd** (hur lång videon ska vara). En rörelse som är rätt men för snabb behöver bara en längre längd.
5. Tryck på **Rendera video**. Vänta på förloppsraden. Filen laddas ner när den är klar.

![Panelen Kamerabana & rendering med tre nyckelbilder, Mjuk interpolering, 12 s, 30 fps och 16 Mbps](../assets/img/en/camera-path-panel.webp)

## Nyckelbilder {#keyframes}

| Reglage | Effekt |
|---|---|
| **Lägg till nyckelbild här** | Lägger till kamerans nuvarande position, girning, nickning och synfält som en nyckelbild. |
| **Rensa** | Tar bort alla nyckelbilder. |
| Nyckelbildslistan | En rad per nyckel: dess nummer (klicka för att flyga kameran dit, med synfältet också), position, `girning° / nickning°`, och **×** för att ta bort den. |

Nycklarna placeras **jämnt** längs en normerad bana från 0 till 1 varje gång en läggs till eller tas bort. Utdatalängden sträcker sedan ut hela rörelsen. En bild som är rätt men för snabb behöver alltså bara en längre längd. Girningen rullas upp mellan nycklarna så att kameran vrider den korta vägen.

Utan nyckelbilder håller en rendering den nuvarande kameran stilla under hela klippet. Det är en fullt användbar timelapse.

## Banans inställningar {#path-settings}

| Reglage | Standard | Intervall (jogg) | Betydelse |
|---|---|---|---|
| **Interpolering** (2+ nycklar) | *Mjuk* | *Mjuk* / *Rak* | *Mjuk*: en kubisk Hermite-kurva genom nycklarna, med tangenter från grannnycklarna. Hastigheten stämmer då över varje nyckel, och det blir inget ryck där segmenten möts. *Rak*: räta linjer mellan nycklarna, förutsägbart, med ett synligt hörn vid varje nyckel. Synfältet interpoleras alltid linjärt. |
| Färdlinje (2+ nycklar) | | | `N enheter färd - M per sekund vid den här längden`, eller en notering om att alla nycklar ligger på samma plats. |
| **Förhandsgranska längs banan** (1+ nycklar) | av | | Styr visningskameran längs banan och flyttar spelhuvudet med den, precis som renderingen gör. Så kan rörelsen bedömas innan rendering. |
| **Position längs banan** (medan förhandsgranskning pågår) | 0 % | 0–100 % | Var på banan förhandsgranskningen står. |
| **Längd** | 12 s | 1–120 s (3600) | Videons längd. |
| **Bildfrekvens** | 30 fps | 6–60 (240) | |
| **Bithastighet** | 16 Mbps | 1–60 Mbps, logaritmiskt (400) | Värmeövergångar bandar illa vid låga bithastigheter. Det finns då för lite detalj för att kodaren ska kunna dölja felet. |
| **Tak för väntan på konvergens** | 240 bildrutor | 2–600 (10 000) | Längst en utdatabildruta får vänta på att bli exakt. Bildrutor som når taket skrivs ändå, och räknas. |
| Sammanfattning | | | `N bildrutor · fönster: kumulativt/fast/livstid`, och när tidslinjen står i läget Alla: *(renderingen byter Alla till Spela så att spelhuvudet betyder något)*. |
| **Rendera video** / **Avbryt** | | | Startar renderingen. Medan den pågår visas `bildruta i / n · väntat w · X MB` och hur många bildrutor som inte var exakta. Kräver en datamängd. |

## Tips {#tips}

- Utdatastorleken är canvasens storlek i enhetspixlar (skärmens pixelförhållande, högst 2). Ändra webbläsarfönstrets storlek för att ändra den.
- En kumulativ historik bygger upp värmen under klippet. En historik med fönster eller livstid visar en rörlig tidsskiva.
- Nyckelbildernas lägen är visningskoordinater. Med en [inverterad världsaxel](camera.md#invert-world-axis) pekar nycklar som gjordes innan du bytte den någon annanstans efter bytet.

## För utvecklare {#for-developers}

### Vad en rendering gör {#what-a-render-does}

1. Tar en provbild av bildrutan för att få fram den exakta utdatastorleken i enhetspixlar.
2. Väljer en kodek via WebCodecs: **VP9** (`vp09.00.10.08`), annars **VP8**, med vald bithastighet och bildfrekvens. Utan `VideoEncoder` stannar den med *Den här webbläsaren har ingen VideoEncoder. WebCodecs krävs för att skriva en video*. Saknas båda kodekerna: *Ingen stödd videokodek (provade VP9, VP8)*.
3. Tar över de inställningar som en rendering behöver: pausar uppspelningen, stänger av **adaptiv budget**, slår på **progressiv förfining** och sätter sprite-budgeten till 64 M per bildruta. (Den adaptiva budgeten skyddar bildfrekvensen, vilket är fel mål här. Den skulle läsa varje långsamt konvergerande bildruta som ett skäl att splatta färre rader, och då behövs fler bildrutor för att konvergera.) Den byter också tidslinjen från **Alla** till **Spela**. Historikinställningen (kumulativ, fönster, livstid) lämnas som den är. En rendering ska vara det du tittade på, spelat upp och skrivit ner.
4. För varje utdatabildruta *f* av *n*, vid *u* = f / (n - 1):
   - placerar kameran i banans läge vid *u* (om det finns nycklar);
   - spolar spelhuvudet till samma andel *u* av tidslinjens intervall (sessionens spann för det valda lådreprisets session);
   - tvingar fram en ny skattning, även när kameran inte har flyttats. Att ärva föregående bildrutas ackumulering skulle lämna ett spöke av föregående fönster;
   - väntar bildruta för bildruta tills bilden är exakt (alla kandidatrader ritade i en bildruta, eller ackumuleringen klar), upp till taket för väntan;
   - fångar den sammansatta bildrutan och kodar den, med en nyckelbildruta var 2:a sekund av utdata så att filen går att söka i.
5. Multiplexar bildrutorna till en WebM-fil ([`webm.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webm.ts)) med tidsstämplar som väljs efter bildfrekvensen. Den väggklocketid som varje bildruta tog spelar ingen roll.
6. Återställer budgeten, synfältet, tidslinjeläget, spelhuvudet och om det spelades upp.
7. Laddar ner videon som `3dheat-<bredd>x<höjd>-<bildrutor>f.webm` och rapporterar `N bildrutor vid W×H, X MB - varje bildruta exakt`, eller hur många som nådde taket för väntan.

**Avbryt** stoppar efter den aktuella bildrutan (*Renderingen avbröts.*) och återställer inställningarna.
