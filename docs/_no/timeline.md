---
title: "Tidslinje og avspilling"
nav_order: 5
lang: "no"
source: "timeline.md"
source_hash: "62632bc74701"
translated: true
outdated: false
---

# Tidslinje og avspilling

Linjen under bildet er som en videospiller: du kan spille av dataene som en film, sette på pause, hoppe rundt og endre hastigheten.

![Tidslinjelinjen: 1 Alle/Spill av, 2 avspillingsknapper, 3 klokke, 4 Hastighet, 5 Historikk, med Vindu og et Tidsrom på 30 s](../assets/img/en/timeline-bar.webp)

Linjen under visningen er tidslinjen ([`Timeline.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/Timeline.tsx)). Den bestemmer hvilke rader som er synlige til enhver tid. Den trenger en tidskolonne; uten en er hele linjen slått av, visningen blir værende i **Alle**, og sidepanelet sier *Ingen tidskolonne i disse dataene – tidslinjen er slått av, og hvert datapunkt vises på én gang.*

## Alle og Spill av {#all-and-play}

To moduser på øverste nivå, fordi de svarer på forskjellige spørsmål.

- **Alle** (standard ved hver innlasting) ser helt bort fra spilleposisjonen og viser hver rad som består filtrene. Det er visningen for «hvor skjer dette», og den er ikke det samme som å dra til slutten. Skyveknappen er slått av, og klokken viser `alle · <tidsrom> av data`.
- **Spill av** spiller dataene som et tidsforløp. Skyveknappen, avspillingsknappene og innstillingene for historikk vises.

Å velge **Alle** stopper også avspillingen.

## Kontrollene {#the-controls}

| Kontroll | Standard | Betydning |
|---|---|---|
| Skyveknappen | starten | Spilleposisjonen. Dra for å hoppe; 20 000 steg over området. |
| **Alle** / **Spill av** | Alle | Se over. |
| ▶ / ❚❚ | pauset | Spill av eller pause; også `K`. |
| ◀ **Spill av baklengs (J)** | | Spiller dataene i revers. Vises bare i modusen **Figuroverlegg**; den samme tasten `J` virker også der (se [Tastatur](#keyboard)). |
| ⏮ | | Tilbake til starten av området. |
| Klokke | | `forløpt / totalt` som `mm:ss,s` (eller `t:mm:ss`), og, når tidskolonnen er et absolutt tidsstempel, spilleposisjonens klokkeslett som `TT:MM:SSZ` (UTC). |
| **Hastighet** | 1× | Datasekunder per virkelig sekund. Menyen har 17 steg fra 0,01× til 1800× (0,01, 0,02, 0,05, 0,1, 0,25, 0,5, 1, 2, 4, 8, 16, 32, 64, 128, 256, 600, 1800), pluss **Egendefinert…**: skriv en hvilken som helst hastighet fra 0,001× til 3600× (for eksempel 0,3 eller 12) og trykk Enter; Esc beholder gjeldende hastighet. Den siste hastigheten huskes til neste besøk (se [Lagrede innstillinger](ref-settings-storage.md)). |
| **Historikk** | Kumulativ | Hva som regnes som synlig ved spilleposisjonen: *Kumulativ*, *Vindu* eller *Levetid* (under). |
| **Tidsrom** (Vindu; i Linjer-modus også Levetid) | 30 s | Lengden på vinduet som ender ved spilleposisjonen; minst 0,01 s. I [Linjevarme](line-heat.md#playback) er det lengden på halen. |
| **Reservelevetid** (bare Levetid, ikke i Linjer-modus) | 10 s | Hvor lenge et datapunkt uten neste prøve av sin person forblir synlig. |
| **Uttoning** (bare Levetid, ikke i Linjer-modus) | 0,4 | Andelen av hvert datapunkts levetid som brukes på å tone ut, 0–1. |
| **Løkke** | på | Ved slutten starter det på nytt; av stopper ved slutten. |
| Høyre side | | Datasettets navn. |

**Området** er datasettets tidsspenn – eller, i [figuroverlegget](box-replay.md) med en økt valgt, den øktens spenn.

## Historikk {#history}

I modusen Spill av:

- **Kumulativ** – alt fra starten av området og frem til spilleposisjonen. Varmen bygger seg opp mens det spilles.
- **Vindu** – et fast tidsrom med historikk som ender ved spilleposisjonen (*Tidsrom*).
- **Levetid** – hvert datapunkt lever til **samme persons neste prøve** (i samme økt), så nøyaktig én posisjon per person er gjeldende til enhver tid. Et datapunkt der personen aldri dukker opp igjen – en død, en frakobling, slutten av loggen – har ingen neste prøve, og lever i *Reservelevetiden* i stedet for å forsvinne med én gang eller bli værende for alltid. Datapunkter **tones ut** i den siste *Uttoning*-andelen av levetiden sin i stedet for å poppe bort: med én aktiv prøve per person får et datapunkt som forsvinner mellom ett bilde og det neste hele feltet til å flimre i prøvefrekvensen. *Uttoning* 0 gir det harde kuttet tilbake.

Levetid trenger en personkolonne i tillegg til en tidskolonne; uten en faller historikken tilbake til Kumulativ ved innlasting. I [Linjevarme](line-heat.md#playback) bestemmer historikken hvor lenge en rutes hale er synlig; i [figuroverlegget](box-replay.md) er *Reservelevetid* hvor lenge en person uten flere prøver holdes.

## Oppførsel under avspilling {#playback-behaviour}

Fra bildeløkken ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

- Spilleposisjonen går fremover med *bildetid × hastighet*. Bildetiden er begrenset til 0,1 s, så bytte av fane hopper ikke spilleposisjonen fremover.
- Trykker du spill helt til slutten av området, starter det fra begynnelsen, slik en mediespiller gjør. Ved hver innlasting settes spilleposisjonen til starten, så første trykk på spill spiller.
- Ved slutten av området hopper spilleposisjonen tilbake til starten (Løkke på) eller stopper der og avspillingen avsluttes (Løkke av).
- Skyveknappen leser spilleposisjonen direkte fra motoren hvert bilde; programtilstanden oppdateres ved hopp, start, stopp og løkker.
- Velger du en økt i økt-velgeren, hopper den til øktens start.

## Hvorfor avspillingen er jevn, og billig {#why-playback-is-smooth-and-cheap}

Rader lagres sortert etter tid, så et tidsvindu er to binærsøk i tidskolonnen: å flytte spilleposisjonen fremover flytter to heltall og berører ingen rader, og kostnaden for avspillingen følger antallet rader i vinduet, ikke størrelsen på datasettet.

Hvordan varmen holdes jevn mens vinduet beveger seg, avhenger av historikken ([Akkumulering](accumulation.md)):

- **Kumulativ** vokser bare, så hvert bilde legger til bare radene som ble synlige siden det forrige, med full vekt. Feltet bygger seg opp monotont, og pause endrer ingenting, fordi det ikke er noe igjen å ankomme. (Å estimere på nytt i stedet ville gjøre at hvert bilde tenner en annen tilfeldig delmengde og så tone den ut, og det leses som utbrudd som blusser opp og forsvinner.)
- **Vindu** og **Levetid** endrer seg virkelig for hvert bilde og estimeres på nytt, blandet som et eksponentielt glidende gjennomsnitt (vekt 0,34 for det nye bildet), som er upartisk i jevn tilstand og mye roligere enn å starte på nytt.
- I modusen Levetid er kandidatradene de fra *spilleposisjon − maks(lengste gap i dataene, Reservelevetid)* og frem til spilleposisjonen; shaderen dropper så hver rad hvis egen levetid er over, og bruker uttoningen.

Å bytte mellom Alle og Spill av, eller å endre historikken, starter akkumuleringen på nytt.

## Tastatur {#keyboard}

| Tast | Effekt |
|---|---|
| `K` | Spill av / pause |
| `J` | Spill av baklengs; trykker du igjen, settes det på pause (bare Figuroverlegg) |
| `L` | Spill av forlengs; trykker du igjen, settes det på pause (bare Figuroverlegg) |

`J` og `L` bytter også tidslinjen til **Spill av**. Tastene ignoreres mens et tekstfelt eller en meny har fokus. I fanen Løpsanalyse styrer `K` i stedet den fanens egne replay.
