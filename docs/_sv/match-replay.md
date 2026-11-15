---
title: "Matchrepris"
nav_order: 9
has_children: true
lang: "sv"
source: "match-replay.md"
source_hash: "9d61f24a5a04"
translated: true
outdated: false
---

# Matchrepris

Repriset är en film av matchen där varje spelare ritas som det hen körde. Använd den för att se en strid igen, följa en enhet och se vem som träffade vem.

Skott, träffar, bränder och vrak ritas på enheterna och målen på banan. Kameror, etiketter och en taktisk vy hjälper dig att läsa striden. Känner du till Tacview? [Tacview-paritet](tacview-parity.md) visar var vart och ett av dess verktyg finns.

![Figurrepris av stridsvagnsdemon: stridsvagnar som egna figurer, med etiketter för namn, fordon och hastighet](../assets/img/en/replay-overview.webp)

## Starta en repris {#start-a-replay}

1. Läs in en inspelning med **Källa → Filer…** eller genom att släppa den på panelen Källa (vilken tabell som helst med en **person**- och en tidskolumn, en Tacview-fil, en konverterad repris, en [`.3dheat`](container.md)-match). Se [Läsa in data](getting-data-in.md).
2. Öppna fliken **Match** och välj **Figurrepris**, eller välj **Figuröverlägg** i lägesfältet i fliken Värmekarta.
3. Under **Matcher i reprisen** välj en match, alla på en gång, eller flera.
4. Tryck **Spela** på tidslinjen (eller `K`). Dra i tidslinjen för att hoppa.

Figurer ersätter lådor för varje enhet vars namn eller typ är känt (se [Figurer](figures.md)). Data utan namn- eller typkolumn ritas som soldater.

![Fliken Match: väljaren för matcher, avsnittet Figurer, kamervyerna, Spela och händelselistan](../assets/img/en/match-replay-tab.webp)

## Figurer {#figures}

![En brinnande stridsvagn i kretsningskameran, med skottet som träffade den](../assets/img/en/replay-tanks.webp)

| Inställning (avsnittet **Figurer**) | Standard | Vad den gör |
|---|---|---|
| **Figurer i stället för lådor** | på | Av ritar vanliga lådor. |
| **Figurstorlek** (gånger verklig storlek) | 1 | 1 är verklig storlek; 0,25 till 20 gånger (logaritmisk skala). Större hjälper på långt håll. |
| **Minsta figur på skärmen** | 36 px | Figurer på avstånd växer för att förbli så stora, 0 till 200 px; 0 behåller den sanna storleken. |
| **På avstånd**: Figur, Pil, Symbol | Figur | Vad en enhet på avstånd blir. |
| **Symboler** | NATO (APP-6) | NATO (APP-6), ryska taktiska tecken, ikoner för **Spelkarta**, eller **Endast former (färgblindsäker)**. |
| **Symbolstorlek**, **Min sida**, **Fientlig / Neutral**, **Kursstreck** | 28 px (12 till 64), automatiskt, fientlig, på | Hur symbolerna ser ut och vilken sida som är vän. |
| **Lodlinjer** | på | En linje från varje enhet rakt ned till marken, så att höjder kan läsas i 3D. |
| **Lodlinjer och etiketter på vapen** | av | Linjer till marken och etiketter på robotar och bomber. |
| **Bränder på enheter** | på | Lågor från det att en enhet fattar eld tills den släcks. |
| **Träffar på enheter** | på | Märken där skott träffade (nedan). **Träffar ligger kvar**: 1 till 300 sekunder, eller **Hela livet**. **Svävande markeringar**: märken som ritas ovanför ytan. |
| **Sikt- och tornlinjer** | av | Streckade: vart spelaren tittar. Heldragna: var kanonen pekar. |
| **Byggnader** | solid | Täta eller genomskinliga byggnader, när banan målar dem. |

### Symboler på avstånd {#symbols-at-a-distance}

När en enhet skulle bli mindre än **Minsta figur på skärmen** kan den bli en symbol som förblir läsbar. Formen visar slaget (till exempel en avrundad låda med ett bandmärke för pansar). Färgen visar sidan. Öppna menyn **Symboler** för att ändra stilen.

![Samma sex enheter som NATO-symboler, ryska taktiska tecken, ikoner för spelkartan och bara former](../assets/img/en/match-replay-symbols-styles.webp)

### Träffmärken, vrak och bränder {#hit-marks-wrecks-and-fires}

- **Träffmärken** sitter på ytan där skottet träffade, i figurens skala. Utseendet visar vad som hände: ett hål (gick igenom), en ljus stänk (gick inte igenom), en repa (studsade av), en sotstjärna (sprängladdning). En färgad ring visar vad det gjorde: dödande skott, modul förstörd, kritisk, allvarlig, skada, ingen skada eller träff. För musen över ett märke för att se rundans namn.
- En förstörd enhet ritas **förkolnad** som ett vrak från sin död tills den återuppstår eller tas bort. Dess symbol är överstruken.
- **Bränder** brinner på en enhet från det att den fattar eld tills den släcks.
- **Torn** vrider sig dit datan säger att kanonen pekar (eller, utan det, dit spelaren tittar).

### Vapen, lockbeten och spårljus {#weapons-decoys-and-tracers}

Med **Vapen, skott och träffar** på (avsnittet Lagvisare): robotar, raketer, bomber och torpeder flyger som egna figurer med ett rökspår. Kulor och granater är spårljus, och nedslag och explosioner blinkar. Ett spårljus som ritas **streckat** har räknats fram från en träff, eftersom datan inte hade något skott. Facklor och chaff ritas som lockbeten. De döljs i enhetslistan om inte *Lockbeten och granater* är ikryssat.

## Kameror {#cameras}

Klicka på en enhet eller dess etikett för att **följa** den. Avsnittet **Repris** erbjuder **Jakt**, **Kretsa**, **Cockpit** (med en head-up-display, `H`), **Fast**, **Padlock**, **Mål** och **Satellit**. `V` byter mellan dem, och **Kameraavstånd** anger hur långt. Esc stoppar.

- **Vy med två enheter**: välj ett **Mål** (eller Ctrl/Alt-klicka på en enhet) för att titta på den från den följda. **Byt** växlar dem.
- **Mått**: Shift-klicka två enheter för lagerbäring, avstånd och höjdskillnad mellan dem.
- **2D-karta** (`M`): hörn- eller helbild, med spår och namn.
- **Bokmärken** (`B`): spara ögonblicket och kameran. Inspelningens egna dödningar, dödsfall och markeringar listas också.
- **Händelser**: varje händelse i tidsordning. Ett klick hoppar dit. `Page Up` / `Page Down` hoppar mellan händelser, och **Pausa vid händelse** stannar vid varje.

## Taktisk visning {#tactical-display}

![Luftdemon i den taktiska visningens utseende (T): trådmodell av terrängen, paneler för dödningar och händelser](../assets/img/en/replay-air-tactical.webp)

Avsnittet **Taktisk visning** ritar, för ingen enhet, de valda, alla, eller en typ (flygplan, mark, fartyg, vapen): hastighetsvektorer och banan framåt, nos- och lyftlinjer, radarkoner, låsningar, datalänkar, engagemangszoner och -linjer, siktlinjer, vart spelare tittar (sikteskoner), tornsikte och den inspelade kameran.

### Visningens stil {#display-style}

`T` (eller reglaget **Visa som taktisk vy**) byter utseendet till en radarskärmsstil: glöd, konturer, höjdkurvor, ett mätnät, skannerlinjer, avståndsringar, höjdstegar, paneler med dödningar och händelser, och en **Regissör** som flyttar kameran till händelser av egen kraft.

![Samma luftstrid i det vanliga utseendet](../assets/img/en/replay-air.webp)

## Mål {#objectives}

När en match kommer med sina mål ritar avsnittet **Mål** dem på banan: erövringszoner (med ägare och erövringsförlopp), spawns, flygfält, områden och bombmål. Varje lager kan slås av och på, med etiketter. De syns genom marken. Med flera spellägen inlästa filtrerar **Läge** matcherna efter läge. Målen kommer från en konverterares matchfil bredvid inspelningen, eller från en [`.3dheat`](container.md)-behållare.

## Etiketter och statistik {#labels-and-statistics}

- **Etiketter**: regler per slag (**Valda**, **Flygplan**, **Mark**, **Fartyg**, **Vapen**, **AI**): visas eller inte, vilka värden, och en **Prioritet** för vem som får plats när etiketter överlappar. **Håll isär etiketterna** flyttar en etikett bredvid sin enhet när den skulle täcka en annan, och utelämnar den där det inte finns plats. **Etikettstorlek** är 60 till 250 %. **Tillbaka till namn, fordon, höjd och fart** återställer reglerna.
  - Markenheter börjar med namn, fordon och fart.
  - Flygplan börjar med namn, fordon, höjd och fart.
  - Fartyg börjar med namn, fordon, fart och kurs.
  - För musen över en enhet för att se alla värden den har.
- **Statistik**: per lag och enhet: dödningar, dödsfall, skott, träffar, träffkvot, start, landningar, tid i luften, högsta fart, höjd och G, distans. CSV-export.
- **Diagram**: en enhets värden över tid, två enheter jämförda, eller ett värde mot ett annat.

## Många matcher samtidigt {#many-matches-at-once}

För att lägga hundratals eller tusentals matcher över varandra, se [Många matcher på en gång](many-matches.md). Detaljer om figurer (rök, eld och andra tidsbundna effekter): [Figurer i figuröverlägget](figure-replay.md). Tacview-funktionslistan: [Tacview-paritet](tacview-parity.md), en undersida till den här.
