---
title: "Minne og budsjetter"
parent: "Få inn data"
nav_order: 6
lang: "no"
source: "memory-and-budgets.md"
source_hash: "e04306dab5a0"
translated: true
outdated: false
---

# Minne, budsjetter og sjekken om det får plass

Datamaskinen din har begrenset minne. 3DHeat legger sammen hva filene dine trenger, og forteller deg før **Last inn** om de får plass.

![The Memory estimate at won't fit, with Load every [N] row pre-filled and the Load button reading Too large - reduce or decimate](../assets/img/en/memory-and-budgets-wont-fit.webp)

*For stort for denne maskinen? 3DHeat foreslår å laste inn hver N-te rad i stedet.*

En nettleserfane som går tom for minne midt i en innlasting, krasjer og mister minutter med arbeid, og et GPU som ber om mer enn det har, enten mister konteksten sin eller går til et kryp. Så før en innlasting starter, sier kildepanelet hvor mye minne den trenger, sammenligner det med budsjetter som er funnet for denne maskinen, og nekter – med en utvei – når det ikke får plass. Modellen ligger i [`src/data/memory.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts).

## Minneestimatet {#the-memory-estimate}

Vises over knappen **Last inn** når radene er talt.

| Linje | Betydning |
|---|---|
| **Minneestimat** – *får plass* / *stramt* / *får ikke plass* | Vurderingen, grønn, gul eller rød. |
| `N rader · B B/rad` | Radene som lastes inn (etter steget), og de faste bytene per rad. |
| `RAM X i bruk, Y topp under innlasting` | Minne som holdes når den er lastet, og toppen under innlastingen. |
| `GPU Z · anslått innlasting T` | GPU-minne for radene, og en anslått varighet med 1,2 millioner rader per sekund. |
| GPU-navn | Renderens navn, når driveren oppgir det. |
| Meldinger | Hvorfor det ikke får plass, eller er stramt, og hva du bør gjøre. |
| **Last inn hver [N] rad** | Steget for desimering (se under). |
| `Budsjett: X RAM, Y GPU. Juster under Ytelse → Ressursbudsjetter.` | Budsjettene sjekken brukte. |

### Bytes per rad {#bytes-per-row}

| Kolonne | Fast (RAM) | Merknader |
|---|---|---|
| Posisjon | 12 | Tre 32-bits flyttall, alltid (en flat akse er fortsatt en matrise) |
| Tid | 4 | Når den er kartlagt |
| Levetid | 4 | Når tid og person er kartlagt |
| Person | 4 | Når kartlagt |
| Gruppe | 2 | Når kartlagt |
| Økt | 4 | Når kartlagt |
| `Kildefil` | 4 | Når mer enn én fil er lastet |
| Hver filterkolonne | 4 | Per avhuket kolonne *Behold for filtrering* |

**Toppen** legger til det en innlasting bare trenger midlertidig – 8 bytes med 64-bits tid under sammenslåing, 12 bytes med sorteringsnøkler og indekser, 4 bytes med mellomlagring for permutasjon (alle tre når tid er kartlagt), og 4 bytes mens gruppekolonnen fortsatt er 32-bits – og ganger summen med **2,0**. Faktoren ble målt (en ekte innlasting av flere filer toppet seg på 1,9× de oppførte matrisene, fra arbeidssettet til Parquet-dekoderen, kopiene som kutter hver kolonne til riktig lengde, og minne som er frigjort men ikke levert tilbake), og rundet opp, fordi et for lavt estimat koster en krasjet fane, mens et for høyt bare koster et unødvendig steg.

På **GPU-en** koster hver rad 8 bytes (posisjon og gruppe, 16 bits hver), pluss 4 bytes (tid og levetid, 16 bits hver) når både tid og person er kartlagt. Se [GPU-minneresidens](gpu-memory.md). Filtertekstur (4 bytes per rad per aktivt filter) og linjevarmens segmentstarter (8 bytes per rad mens Linjer-modus er på) er ikke en del av dette estimatet.

## Sjekken om det får plass {#the-fit-check}

Tre begrensninger sammenlignes ([`checkFit`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts)):

- toppen av RAM mot **RAM-budsjettet**,
- GPU-bytes mot **GPU-budsjettet**,
- radantallet mot **sorteringsgrensen** på 400 000 000 rader, når en tidskolonne er kartlagt.

Det verste av de tre forholdene avgjør: opptil 70 % *får plass*, opptil 100 % *stramt* (den bør lastes, men vent deg treg drift), over det *får ikke plass*. Når det ikke får plass, nevner panelet den begrensningen som bestemmer, og foreslår:

- å laste hver *N*-te rad, med *N* = ⌈rader / rader som får plass⌉, ferdig utfylt i steg-feltet;
- å fjerne filterkolonner, å fjerne kartleggingen av tidskolonnen (som fjerner sorteringen og grensen, til prisen av tidslinjen), eller å øke budsjettet.

Når selve budsjettet ikke er et faktum om maskinvaren – nettleseren begrenset RAM-tallet, standarden ble holdt nede av det som er ledig akkurat nå, eller GPU-tallet er en gjetning – sier meldingen det, slik at du ikke tar i bruk et steg du ikke trenger.

### Desimering {#decimation}

**Last inn hver [N] rad** beholder én rad av *N*, talt per fil. Varmen er et gjennomsnitt, så hver *N*-te rad gir samme fordeling med mer støy – den samme avveiningen renderen allerede gjør hver ramme. Feltet starter på 1 (*rad (alle)*); når utvalget ikke får plass, er det ferdig utfylt med det foreslåtte steget, med mindre du har skrevet i det. Knappen Last inn leser da *Last inn N filer (1 av K)*, og datasettets navn får `hver K-te rad`.

### Sorteringsgrensen {#the-sort-ceiling}

Renderen trenger radene i stigende tidsrekkefølge, så en kartlagt tidskolonne betyr å sortere hver rad, med en radixsortering over 32-bits nøkler ([`sort.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sort.ts)). Over **400 millioner** rader nektes det i stedet for å prøves i en fane. Dette sjekkes før innlastingen, så et utvalg over grensen avvises med et forslag om steg, i stedet for å bli lest i sin helhet og mislykkes på siste steg. Nær grensen (*stramt*) advarer panelet om at sorteringen er et langt pass uten egen fremdrift. Uten en tidskolonne skjer ingen sortering, og ingen grense gjelder.

## Ressursbudsjetter {#resource-budgets}

**Ytelse → Ressursbudsjetter** (en sammenleggbar linje nederst i Ytelse-panelet, som leser `Ressursbudsjetter – RAM, GPU, kjerner`). Budsjettene er funnet; det funnede tallet er standarden; og skyverne går ikke høyere enn et **tak** som er det funnede tallet, unntatt der det er kjent at funnet ikke er en måling.

| Kontroll | Område | Betydning |
|---|---|---|
| **RAM for raddata** | 256 MiB til RAM-taket, logaritmisk | RAM-budsjettet for sjekken. Merket *(over funnet)* forbi den funne standarden, *(maks)* ved taket. |
| **GPU for raddata** | 128 MiB til GPU-taket, logaritmisk | GPU-budsjettet for sjekken og for opplasting av rader. Merket *(over funnet)* forbi den funne standarden, *(maks)* ved taket. |
| **Parsertråder** | 1 til antall logiske kjerner | Hvor mange filer en innlasting parser samtidig, hver i sin egen arbeider. Standard kjerner - 2 (kjerner - 1 på fire kjerner eller færre). Se [Parsertråder](#parser-threads) (under For utviklere). |
| Kildelinjen | | Hvor hvert tall kom fra (`RAM: …. GPU: …. CPU: ….`). |
| **Registrer på nytt** | | Ber utviklingsserveren om en ny minneavlesning og regner ut alle budsjettene på nytt. |
| GPU-navn | | Adapterens korte navn; den fulle renderstrengen er verktøytipset. |

### Å øke GPU-budsjettet {#raising-the-gpu-budget}

Et GPU-budsjett over det funnede tallet gjelder slik det er satt: sjekken og opplastingen tar det samme tallet fra én funksjon ([`effectiveGpuBudget`](https://github.com/Holdi601/3DHeat/blob/main/src/render/budget.ts)), som bare begrenser det til GPU-taket skyveren stopper ved. Så en innlasting sjekken godkjenner, lastes opp i sin helhet. Forbi det funnede tallet viser skyveren *(over funnet)*: tallet er da din vurdering av kortet, ikke en måling, og å sette det høyere enn kortet har, risikerer en tapt kontekst eller et kryp.

## Svært store datasett: spakene {#huge-datasets-the-levers}

Fra billigst til mest drastisk:

1. **Færre filterkolonner.** Hver er 4 bytes per rad og et dekodingspass.
2. **Et steg.** Hver *N*-te rad.
3. **Ingen tidskolonne.** Ingen sortering, ingen sorteringsgrense, ingen 4–8 bytes per rad med tid og levetid – og ingen tidslinje.
4. **Øk budsjettene**, når du vet at minnet finnes.

Ved rendring håndteres store datasett med sampling og progressiv akkumulering i stedet for å redusere dataene; se [Sampling og budsjetter](sampling-and-budgets.md).

## For utviklere {#for-developers}

### Parsertråder {#parser-threads}

En innlasting av flere filer parser opptil **Parsertråder** av dem samtidig, hver i en parserarbeider startet av innlastingsarbeideren for den innlastingen ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), `parseInOrder`). Ved 1, eller for en enkelt fil, parses filene etter hverandre i selve innlastingsarbeideren.

Å kjøre flere samtidig løsner ikke sjekken om det får plass:

- **Byggeren telles først.** De sammenslåtte kolonnene allokeres for hele utvalget før den første filen leses, så filene som er i gang får bare det RAM-budsjettet lar stå igjen ved siden av dem (`parseHeadroom`): posisjon, 64-bits tid, siktvinkler, person, 32-bits gruppe, økt, filterkolonner og `Kildefil`, per rad som skal lastes – ganger 2,6 når radantallet er et CSV-anslag, for en kolonne som vokser til en større.
- **Hver fil reserverer sin kostnad før den starter** (`fileParseBytes`): radene (fra Parquet-fotnoten; en CSVs andel av anslaget etter størrelse) ganger de samme kolonnene, ganger **8** – selve blokken, kopien ved siden av mens rader uten posisjon fjernes, og dekoderens arbeidssett, som for tekstkolonner er langt større enn id-ene deres. Et steg reduserer ikke dette, for filene leses i sin helhet og desimeres etterpå. Tallet 8 er en margin satt ved måling: ved 3, eller ved 5, tok tretti parsertråder en fane over grensen på 86 millioner rader med navn på person og økt; ved 8 gjorde de ikke det.
- **En annen fil starter bare hvis dens reservasjon får plass** i det som er igjen. En fil som er ferdig, men venter på at en tidligere skal slås sammen, beholder sin reservasjon til den er slått sammen.
- **Én fil kjører alltid.** Når ingenting er reservert, starter neste fil uansett kostnad – det er innlastingen én om gangen som sjekken om det får plass godkjente, så et stramt budsjett faller tilbake til den i stedet for å avvise.

Tallet *topp under innlasting* er toppen av en innlasting én om gangen, som kommer ved sorteringen, etter at alle filene er lest. Filer parset side om side kan ta mer minne enn det tallet mens de leses; reservasjonene holder det innenfor RAM-budsjettet, så langt estimatene over stemmer.

Sammenslåingsrekkefølgen er utvalgets rekkefølge, uansett i hvilken rekkefølge filene blir ferdige, så nummereringen av person, gruppe og økt, radene og verdiene i `Kildefil` er identiske med en innlasting én om gangen. En fil som ikke kan leses, hoppes over og listes akkurat som før. En parserarbeider som dør, avslutter hele innlastingen, slik døden til innlastingsarbeideren alltid har gjort, og hver parserarbeider avsluttes når innlastingen slutter, uansett hvordan den slutter. Hvis parserarbeidere ikke kan startes i det hele tatt, parses filene i innlastingsarbeideren i stedet.

### Hvordan tallene finnes {#how-the-figures-are-detected}

[`detectBudgets`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts) kjøres ved oppstart, igjen når renderen finnes, og ved **Registrer på nytt**.

**RAM, med utviklingsserveren.** `start.bat` og `npm run dev` leverer siden fra en prosess som kan lese maskinens minne, på `/__host/memory` (besvares innen 1,5 s eller ignoreres). Standarden er det mindre av 60 % av installert RAM og 80 % av ledig RAM akkurat nå; taket er 60 % av installert. Når ledig minne er det som holder standarden nede, sier panelet det og foreslår å lukke programmer og trykke **Registrer på nytt**.

**RAM, uten den** (en statisk utgivelse): ingen nettleser-API oppgir ledig minne, og `navigator.deviceMemory` er avrundet ned til en toer-potens og begrenset til 8 GiB av Chrome og Edge. Standarden er 60 % av `deviceMemory`, videre begrenset til 4 × den ledige JS-haugen til fanen der nettleseren oppgir en, eller 4 GiB når ingenting oppgis. Når `deviceMemory` er nøyaktig 8 (taket), flagges tallet som *begrenset*, og taket er 4 × standarden, med en merknad om at over standarden er tallet din påstand, ikke en måling.

**Uansett**, standarden og taket for RAM er begrenset til **12 GiB**, det mest typede-matrise-minne én Chrome-fane kan holde uansett hva maskinen har (en side nådde omtrent 15,75 GB og feilet; 12 gir rom til alt annet), og går aldri under 256 MiB.

**GPU-minne.** Ingen nettleser-API oppgir det i det hele tatt.

- Med utviklingsserveren leses kortets minne av `nvidia-smi` (den største adapteren) eller, på Windows, fra skjermadapterens registerverdi `HardwareInformation.qwMemorySize`. Standarden er 70 % av det, taket 90 %.
- Uten en avlesning utledes det: 2 GiB som standard; 4 GiB når den største teksturen er 16 384 px eller mer (et diskret kort), 1 GiB når den er mindre; eller 8 × WebGPUs `maxBufferSize` når det er større. Taket er da 8 × det utledede tallet, fordi utledningen skiller en integrert brikke fra en diskret, og ikke noe finere. Panelet sier at tallet er utledet.
- Aldri under 128 MiB.

**CPU.** `navigator.hardwareConcurrency` (4 når det ikke oppgis).
