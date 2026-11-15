---
title: "Hukommelse og budgetter"
parent: "Indlæs data"
nav_order: 6
lang: "da"
source: "memory-and-budgets.md"
source_hash: "e04306dab5a0"
translated: true
outdated: false
---

# Hukommelse og budgetter

Din computer har begrænset hukommelse. 3DHeat lægger sammen, hvad dine filer har brug for, og fortæller dig, før du trykker **Indlæs**, om de passer.

![Hukommelsesoverslaget med "Passer ikke", med Indlæs hver [N].-række udfyldt, og Indlæs-knappen der siger For stor - reducér eller udtynd](../assets/img/en/memory-and-budgets-wont-fit.webp)

*For stor til denne computer? 3DHeat foreslår i stedet at indlæse hver N.-række.*

En browserfane, der løber tør for hukommelse midt i en indlæsning, går ned og mister minutters arbejde, og en GPU, der får mere, end den har, mister enten sin kontekst eller bliver til en kravlende hastighed. Derfor siger panelet Kilde, før en indlæsning starter, hvor meget hukommelse den har brug for, sammenligner det med budgetter fundet for denne maskine, og nægter - med en udvej - når det ikke vil passe. Modellen findes i [`src/data/memory.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts).

## Hukommelsesoverslaget {#the-memory-estimate}

Vises over knappen **Indlæs', når rækkerne er talt.

| Linje | Betydning |
|---|---|
| **Hukommelsesoverslag** - *passer* / *stramt* / *passer ikke* | Dommen, grøn, gul eller rød. |
| `N rækker · B B/række` | Rækker, der indlæses (efter springet), og de faste bytes pr. række. |
| `RAM X i brug, Y højeste under indlæsning` | Hukommelse holdt, når den er indlæst, og toppen under indlæsningen. |
| `GPU Z · anslået indlæsning T` | GPU-hukommelse til rækkerne, og en anslået varighed ved 1,2 millioner rækker i sekundet. |
| GPU-navn | Rendererens navn, når driveren oplyser det. |
| Beskeder | Hvorfor det ikke passer, eller er stramt, og hvad du gør. |
| **Indlæs hver [N].-række** | Udtyndingsspringet (se nedenfor). |
| `Budget: X RAM, Y GPU. Justér under Ydeevne → Ressourcebudgetter.` | De budgetter, kontrollen brugte. |

### Bytes pr. række {#bytes-per-row}

| Kolonne | Fast (RAM) | Bemærkninger |
|---|---|---|
| Position | 12 | Tre 32-bit-flydetal, altid (en flad akse er stadig et array) |
| Tid | 4 | Når den er kortlagt |
| Levetid | 4 | Når tid og person er kortlagt |
| Person | 4 | Når kortlagt |
| Gruppe | 2 | Når kortlagt |
| Session | 4 | Når kortlagt |
| `Kildefil` | 4 | Når mere end én fil er indlæst |
| Hver filterkolonne | 4 | Pr. afkrydset kolonne *Behold til filtrering* |

**Toppen** lægger det til, indlæsningen kun har brug for midlertidigt - 8 bytes 64-bit tid under sammenfletning, 12 bytes sorteringsnøgler og indekser, 4 bytes permutationsskrabeplads (alle tre, når tid er kortlagt), og 4 bytes, mens gruppekolonnen stadig er 32-bit - og ganger summen med **2,0**. Den faktor er målt (en rigtig indlæsning af flere filer toppede ved 1,9 gange de opregnede arrays, på grund af Parquet-afkoderens arbejdssæt, kopierne, der trimmer hver kolonne til længden, og hukommelse frigivet men endnu ikke returneret) og rundet op, fordi et for lavt overslag koster en nedbrudt fane, mens et for højt kun koster et unødvendigt spring.

På **GPU'en** koster hver række 8 bytes (position og gruppe, 16 bit hver), plus 4 bytes (tid og levetid, 16 bit hver), når både tid og person er kortlagt. Se [GPU-hukommelsens residens](gpu-memory.md). Filterteksturer (4 bytes pr. række pr. aktivt filter) og linjevarmens segmentstarter (8 bytes pr. række, mens tilstanden Linjer er slået til) indgår ikke i dette overslag.

## Passer-kontrollen {#the-fit-check}

Tre begrænsninger sammenlignes ([`checkFit`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts)):

- højeste RAM mod **RAM-budgettet**,
- GPU-bytes mod **GPU-budgettet**,
- antal rækker mod **sorteringsloftet** på 400.000.000 rækker, når en tidskolonne er kortlagt.

Det værste af de tre forhold afgør: op til 70 % *passer*, op til 100 % *stramt* (den bør indlæses, men forvent, at det er langsomt), over det *passer ikke*. Når det ikke vil passe, navngiver panelet den bindende begrænsning og foreslår:

- at indlæse hver *N*.række, med *N* = ⌈rækker / rækker der passer⌉, udfyldt i springfeltet;
- at fjerne filterkolonner, at fjerne tidskortlægningen (hvilket fjerner sorteringen og dens loft, på bekostning af tidslinjen), eller at hæve budgettet.

Når selve budgettet ikke er et faktum om hardwaren - browseren begrænsede RAM-tallet, standarden blev holdt nede af det, der er ledigt lige nu, eller GPU-tallet er et gæt - siger beskeden det, så du ikke tager fat i et spring, du ikke har brug for.

### Udtynding {#decimation}

**Indlæs hver [N].-række** beholder én række ud af *N*, talt pr. fil. Varme er et gennemsnit, så hver *N*.række giver samme fordeling med mere støj - det samme kompromis renderen allerede laver hver billede. Feltet starter på 1 (*række (alle)*); når udvalget ikke passer, udfyldes det med det foreslåede spring, medmindre du har skrevet i det. Indlæsningsknappen siger så *Indlæs N filer (1 ud af K)*, og datasættets navn noterer `hver K.række`.

### Sorteringsloftet {#the-sort-ceiling}

Renderen har brug for rækker i stigende tidsorden, så en kortlagt tidskolonne betyder, at hver række skal sorteres, med en radix-sortering over 32-bit-nøgler ([`sort.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sort.ts)). Over **400 millioner** rækker afvises det i stedet for at blive forsøgt i en fane. Det kontrolleres før indlæsningen, så et udvalg over grænsen afvises med et forslag om spring i stedet for at blive læst helt og fejle i det sidste trin. Nær grænsen (*stramt*) advarer panelet om, at sorteringen er et langt gennemløb uden fremskridt af sin egen. Uden en tidskolonne sker ingen sortering, og intet loft gælder.

## Ressourcebudgetter {#resource-budgets}

**Ydeevne → Ressourcebudgetter** (en sammenklappelig linje nederst i panelet Ydeevne, der læser `Ressourcebudgetter - RAM, GPU, kerner`). Budgetterne bliver fundet; det fundne tal er standarden; og skyderne går ikke højere end et **loft**, der er det fundne tal, undtagen hvor det vides, at registreringen ikke er en måling.

| Indstilling | Interval | Betydning |
|---|---|---|
| **RAM til rækkedata** | 256 MiB til RAM-loftet, logaritmisk | RAM-budgettet til passer-kontrollen. Markeret *(over fundet)* ud over den fundne standard, *(maks)* ved loftet. |
| **GPU til rækkedata** | 128 MiB til GPU-loftet, logaritmisk | GPU-budgettet til passer-kontrollen og til at uploade rækker. Markeret *(over fundet)* ud over den fundne standard, *(maks)* ved loftet. |
| **Parsertråde** | 1 til antallet af logiske kerner | Hvor mange filer en indlæsning parser på én gang, hver i sin egen arbejder. Standard kerner - 2 (kerner - 1 på fire kerner eller færre). Se [Parsertråde](#parser-threads) (under Til udviklere). |
| Kilde-linjen | | Hvor hvert tal kom fra (`RAM: …. GPU: …. CPU: ….`). |
| **Registrér igen** | | Beder udviklerserveren om en frisk hukommelsesmåling og genudregner alle budgetter. |
| GPU-navn | | Adapterens korte navn; den fulde renderer-streng er tooltip'en. |

### Hævning af GPU-budgettet {#raising-the-gpu-budget}

Et GPU-budget over det fundne tal gælder som sat: passer-kontrollen og uploaden tager det samme tal fra én funktion ([`effectiveGpuBudget`](https://github.com/Holdi601/3DHeat/blob/main/src/render/budget.ts)), som kun begrænser det til GPU-loftet, skyderen stopper ved. En indlæsning, kontrollen godkender, uploades altså helt. Over det fundne tal står skyderen som *(over fundet)*: tallet er så din vurdering af kortet, ikke en måling, og hvis du sætter det højere end kortet har, risikerer du en tabt kontekst eller en kravlende hastighed.

## Enorme datasæt: hævestængerne {#huge-datasets-the-levers}

Fra billigst til mest drastisk:

1. **Færre filterkolonner.** Hver er 4 bytes pr. række og et afkodningspas.
2. **Et spring.** Hver *N*.række.
3. **Ingen tidskolonne.** Ingen sortering, intet sorteringsloft, ingen 4-8 bytes pr. række af tid og levetid - og ingen tidslinje.
4. **Hæv budgetterne**, når du ved, at hukommelsen er der.

Ved renderingstid håndteres store datasæt med sampling og progressiv akkumulering i stedet for ved at reducere dataene; se [Sampling og budgetter](sampling-and-budgets.md).

## Til udviklere {#for-developers}

### Parsertråde {#parser-threads}

En indlæsning af flere filer parser op til **Parsertråde** af dem på én gang, hver i en parserarbejder startet af indlæsningsarbejderen for den indlæsning ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), `parseInOrder`). Ved 1, eller for en enkelt fil, parses filerne én efter én i selve indlæsningsarbejderen.

At køre flere på én gang lemper ikke passer-kontrollen:

- **Byggeren tælles først.** De sammenflettede kolonner allokeres for hele udvalget, før den første fil læses, så de filer, der er i gang, kun får det, RAM-budgettet efterlader ved siden af dem (`parseHeadroom`): position, 64-bit tid, kigvinkler, person, 32-bit gruppe, session, filterkolonner og `Kildefil`, pr. række der skal indlæses - gange 2,6, når rækketallet er et CSV-skøn, for en kolonne, der vokser til en større.
- **Hver fil reserverer sin omkostning, før den starter** (`fileParseBytes`): dens rækker (fra Parquet-footeren; en CSV's andel af skønnet efter størrelse) gange de samme kolonner, gange **8** - selve blokken, kopien ved siden af, mens rækker uden position fjernes, og afkoderens arbejdssæt, som for tekstkolonner er langt større end deres id'er. Et spring reducerer ikke dette, fordi filerne læses helt og udtyndes bagefter. Tallet 8 er en margin sat ved måling: ved 3, eller ved 5, fik tredive parsertråde en fane over dens grænse på 86 millioner rækker med personnavne og sessionsnavne; ved 8 gjorde de ikke.
- **En anden fil starter kun, hvis dens reservation passer** i det, der er tilbage. En fil, der er færdig, men venter på, at en tidligere fil bliver sammenflettet, beholder sin reservation, indtil den er sammenflettet.
- **Én fil kører altid.** Når intet er reserveret, starter den næste fil, uanset hvad den koster - det er den én-ad-gangen-indlæsning, passer-kontrollen godkendte, så et stramt budget falder tilbage til den i stedet for at afvise.

Tallet *højeste under indlæsning* er toppen af en én-ad-gangen-indlæsning, som kommer ved sorteringen, efter alle filer er læst. Filer parset side om side kan tage hukommelse over det tal, mens de læses; reservationerne holder det inden for RAM-budgettet, i det omfang overslagene ovenfor er rigtige.

Sammenflettningsrækkefølgen er udvalgets rækkefølge, uanset i hvilken rækkefølge filerne bliver færdige, så person-, gruppe- og sessionsnummereringen, rækkerne og værdierne i `Kildefil` er identiske med en én-ad-gangen-indlæsning. En fil, der ikke kan læses, springes over og listes præcis som før. En parserarbejder, der dør, afslutter hele indlæsningen, sådan som indlæsningsarbejderens død altid har gjort, og hver parserarbejder afsluttes, når indlæsningen slutter, uanset hvordan den slutter. Kan parserarbejdere slet ikke startes, parses filerne i stedet i indlæsningsarbejderen.

### Hvordan tallene findes {#how-the-figures-are-detected}

[`detectBudgets`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts) kører ved opstart, igen når renderen findes, og ved **Registrér igen**.

**RAM, med udviklerserveren.** `start.bat` og `npm run dev` leverer siden fra en proces, der kan læse maskinens hukommelse, på `/__host/memory` (svarer inden for 1,5 s, ellers ignoreres det). Standarden er det mindste af 60 % af installeret RAM og 80 % af den for øjeblikket ledige RAM; loftet er 60 % af installeret. Når ledig hukommelse er det, der holder standarden nede, siger panelet det og foreslår at lukke programmer og trykke **Registrér igen**.

**RAM, uden den** (en statisk udrulning): ingen browser-API oplyser ledig hukommelse, og `navigator.deviceMemory` er rundet ned til en potens af to og begrænset til 8 GiB af Chrome og Edge. Standarden er 60 % af `deviceMemory`, yderligere begrænset til 4 × fanens ledige JS-heap, hvor browseren oplyser en, eller 4 GiB når intet oplyses. Når `deviceMemory` præcis viser 8 (loftet), markeres tallet som *begrænset*, og loftet er 4 × standarden, med en note om, at over standarden er tallet din påstand, ikke en måling.

**Uanset hvad**, begrænses RAM-standarden og -loftet til **12 GiB**, det mest typed-array-hukommelse en Chrome-fane kan holde, uanset hvad maskinen har (en side nåede cirka 15,75 GB og fejlede; 12 lader plads til alt andet), og går aldrig under 256 MiB.

**GPU-hukommelse.** Ingen web-API oplyser den overhovedet.

- Med udviklerserveren læses kortets hukommelse af `nvidia-smi` (den største adapter) eller, på Windows, fra displayadapterens registerværdi `HardwareInformation.qwMemorySize`. Standarden er 70 % af den, loftet 90 %.
- Uden en måling udledes den: 2 GiB som standard; 4 GiB når den største tekstur er 16.384 px eller mere (et diskret kort), 1 GiB når mindre; eller 8 × WebGPU's `maxBufferSize`, når den er større. Loftet er så 8 × det udledte tal, fordi udledningen skelner en integreret del fra en diskret og intet finere. Panelet siger, at tallet er udledt.
- Aldrig under 128 MiB.

**CPU.** `navigator.hardwareConcurrency` (4, når den ikke oplyses).
