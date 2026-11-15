---
title: "Tidslinje och uppspelning"
nav_order: 5
lang: "sv"
source: "timeline.md"
source_hash: "62632bc74701"
translated: true
outdated: false
---

# Tidslinje och uppspelning

Fältet under bilden fungerar som en videospelare: du kan spela upp datan som en film, pausa den, hoppa runt och ändra hastigheten.

![Tidslinjefältet: 1 Alla/Spela, 2 transportknappar, 3 klocka, 4 Hastighet, 5 Historik, med Fönster och ett Intervall på 30 s](../assets/img/en/timeline-bar.webp)

Fältet under vyn är tidslinjen ([`Timeline.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/Timeline.tsx)). Den avgör vilka rader som är synliga just nu. Den behöver en tidskolumn. Utan en är hela fältet avstängt, vyn stannar i **Alla** och sidofältet säger ”Ingen tidskolumn i den här datan – tidslinjen är avstängd och varje datapunkt visas på en gång.”

## Alla och Spela {#all-and-play}

Två lägen på översta nivån, eftersom de svarar på olika frågor.

- **Alla** (standard vid varje inläsning) bryr sig inte alls om spelhuvudet och visar varje rad som klarar filtren. Det är vyn ”var händer det här”, och den är inte samma sak som att skruva fram till slutet. Skrubbern är avstängd och klockan visar `alla · <span> av data`.
- **Spela** spelar upp datan som ett tidsförlopp. Skrubbern, transportknapparna och historikinställningarna visas.

Att välja **Alla** stoppar också uppspelningen.

## Reglagen {#the-controls}

| Reglage | Standard | Betydelse |
|---|---|---|
| Skrubber | starten | Spelhuvudet. Dra för att söka; 20 000 steg över intervallet. |
| **Alla** / **Spela** | Alla | Se ovan. |
| ▶ / ❚❚ | pausad | Spela eller pausa; även `K`. |
| ◀ **Spela baklänges (J)** | | Spelar datan baklänges. Visas bara i läget **Figuröverlägg**; samma tangent `J` fungerar även där (se [Tangentbord](#keyboard)). |
| ⏮ | | Tillbaka till intervallets början. |
| Klocka | | `förfluten / totalt` som `mm:ss.s` (eller `h:mm:ss`), och, när tidskolumnen är en absolut tidsstämpel, spelhuvudets klockslag som `HH:MM:SSZ` (UTC). |
| **Hastighet** | 1× | Datasekunder per verklig sekund. Menyn har 17 steg från 0,01× till 1800× (0,01, 0,02, 0,05, 0,1, 0,25, 0,5, 1, 2, 4, 8, 16, 32, 64, 128, 256, 600, 1800), plus **Anpassad…**: skriv valfri hastighet från 0,001× till 3600× (till exempel 0,3 eller 12) och tryck Enter. Esc behåller den aktuella hastigheten. Den senaste hastigheten minns till nästa besök (se [Sparade inställningar](ref-settings-storage.md)). |
| **Historik** | Kumulativt | Vad som räknas som synligt vid spelhuvudet: *Kumulativt*, *Fönster* eller *Livstid* (nedan). |
| **Intervall** (Fönster; i läget Linjer även Livstid) | 30 s | Längden på fönstret som slutar vid spelhuvudet; minst 0,01 s. I [Linjevärme](line-heat.md#playback) är det svansens längd. |
| **Reservlivstid** (endast Livstid, inte i läget Linjer) | 10 s | Hur länge en datapunkt utan nästa sampling för sin person förblir synlig. |
| **Uttoning** (endast Livstid, inte i läget Linjer) | 0,4 | Andelen av varje datapunkts liv som går åt till att tona ut, 0–1. |
| **Upprepa** | på | Vid slutet börjar det om från början; av stoppar vid slutet. |
| Höger sida | | Datamängdens namn. |

**Intervallet** är datamängdens tidsspann, eller, i [figuröverlägget](box-replay.md) med en session vald, den sessionens spann.

## Historik {#history}

I läget Spela:

- **Kumulativt**: allt från intervallets början upp till spelhuvudet. Värmen byggs upp när den spelas.
- **Fönster**: ett fast spann av historik som slutar vid spelhuvudet (*Intervall*).
- **Livstid**: varje datapunkt lever tills **samma persons nästa sampling** (i samma session), så att exakt en position per person är aktuell vid varje ögonblick. En datapunkt vars person aldrig dyker upp igen (en död, en frånkoppling, slutet på loggen) har ingen nästa sampling. Den lever i stället under *Reservlivstid*, i stället för att försvinna direkt eller bestå för evigt. Datapunkter **tonar ut** under den sista andelen *Uttoning* av sitt liv i stället för att poppa bort. Med en levande sampling per person skulle en datapunkt som försvinner mellan två bildrutor få hela fältet att flimra i samplingstakten. *Uttoning* 0 återställer den hårda klippningen.

Livstid kräver en personkolumn utöver en tidskolumn. Utan en faller historiken tillbaka till Kumulativt vid inläsning. I [Linjevärme](line-heat.md#playback) styr historiken hur länge en rutts svans förblir synlig. I [figuröverlägget](box-replay.md) är *Reservlivstid* hur länge en person utan fler samplingar hålls kvar.

## Uppspelningens beteende {#playback-behaviour}

Från bildloopen ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

- Spelhuvudet går framåt med *bildtid × hastighet*. Bildtiden begränsas till 0,1 s, så att byte av flik inte hoppar spelhuvudet.
- Att trycka på spela vid slutet av intervallet startar från början, som en mediaspelare gör. Vid varje inläsning parkeras spelhuvudet i början, så första tryckningen på spela spelar.
- Vid slutet av intervallet hoppar spelhuvudet tillbaka till starten (Upprepa på) eller stannar där och uppspelningen avslutas (Upprepa av).
- Skrubbern läser motorns spelhuvud direkt varje bildruta. Programtillståndet uppdateras vid sökningar, starter, stopp och varv.
- Att välja en session i sessionsväljaren söker till sessionens start.

## Varför uppspelningen är jämn och billig {#why-playback-is-smooth-and-cheap}

Rader lagras sorterade efter tid, så ett tidsfönster är två binära sökningar i tidskolumnen. När spelhuvudet går framåt flyttas två heltal och inga rader berörs. Uppspelningens kostnad följer antalet rader i fönstret, inte datamängdens storlek.

Hur värmen hålls stadig när fönstret rör sig beror på historiken ([Ackumulering](accumulation.md)):

- **Kumulativt** växer bara, så varje bildruta lägger bara till de rader som blivit synliga sedan förra gången, med full vikt. Fältet byggs upp monotont, och pausen ändrar inget, eftersom det inte finns något kvar att anlända. (Att i stället skatta om skulle få varje bildruta att belysa en annan slumpmässig delmängd och sedan tona ut den, vilket ser ut som skurar som blossar upp och försvinner.)
- **Fönster** och **Livstid** ändras verkligen för varje bildruta och skattas om, blandade som ett exponentiellt glidande medelvärde (vikt 0,34 för den nya bildrutan). Det är förväntningsriktigt i jämviktsläge och mycket lugnare än att börja om.
- I läget Livstid är kandidatraderna de från *spelhuvud − max(längsta luckan i datan, Reservlivstid)* fram till spelhuvudet. Shadern släpper sedan varje rad vars eget liv har tagit slut och tillämpar uttoningen.

Att byta mellan Alla och Spela, eller ändra historiken, startar om ackumuleringen.

## Tangentbord {#keyboard}

| Tangent | Effekt |
|---|---|
| `K` | Spela / pausa |
| `J` | Spela baklänges. Trycker du igen pausas den (endast Figuröverlägg) |
| `L` | Spela framåt. Trycker du igen pausas den (endast Figuröverlägg) |

`J` och `L` växlar också tidslinjen till **Spela**. Tangenterna ignoreras medan en textruta eller meny har fokus. I fliken Racinganalys styr `K` i stället flikens egna repris.
