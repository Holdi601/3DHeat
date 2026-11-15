---
title: "Bilprofiler og sammenligning"
parent: "Løbsanalyse"
nav_order: 56
lang: "da"
source: "race-car-profiles.md"
source_hash: "178f6511a289"
translated: true
outdated: false
---

# Bilprofiler og sammenligning

En bil kan kun bremse, dreje og accelerere så hårdt. Fremviseren måler, hvor hårdt ud fra dine egne runder, så den aldrig siger, at du skal gøre noget, din bil ikke kan. Det forklarer også, hvor meget af et tabt sekund der var bilens skyld og ikke din.

![Biler sammenlignet: to biler side om side med deres greb, bremsning og træk](../assets/img/en/race-cars-compared.webp)

Analysen lader kun en runde bremse hårdere, køre med mere fart eller accelerere tidligere, hvor dens bil har vist, at den kan, og den trækker fra et tab det, bilerne selv forklarer. Derfor måles hver bils grænser (dens *omhylling*, nedenfor) og karakter (dens *profil*) ud fra hver indlæst runde af den. Denne side dækker omhyllingen, profilen, afsnittet **Biler sammenlignet** og det, bilerne bestemmer i hvert hjørne.

**En bil** = runder med samme bilnummer (eller navn, uden et nummer) og
samme præstationsindeks: en anden tuning er en anden bil.

## Omhyllingen: hvad bilen kan ved hver fart {#the-envelope-what-the-car-can-do-at-each-speed}

Pr. bil, over hver indlæst runde af den, i **5 m/s farttrin** (24 trin, op til
120 m/s). Prøver i luften, 0,3 s efter en landing, og fra
0,1 s før hvert træf til 1 s efter det udelades, og accelerationer på
80 m/s² eller mere ignoreres (over det enhver bil med downforce holder).

| Omhylling | Prøver | Værdi pr. trin | Kræver |
|---|---|---|---|
| **sidegreb** | sideaccelerationen **holdt i et halvt sekund** (gennemsnittet af dens absolutte værdi over et centreret 0,5 s vindue), kun hvor bilen tog en sving: mindst en tredjedel af den 99. percentil af alt det | 95. percentil | 6 prøver |
| **bremsning** | bremse > 0,3; længdeaccelerationen som medianen af hver prøve og dens to naboer | 95. percentil af nedbremsningen | 4 prøver |
| **fuldgastræk** | gas > 0,95, bremse under 0,05; samme median-af-tre | 90. percentil | 4 prøver |

Hvorfor holdt i et halvt sekund: en kantsten, en glidning der springer tilbage, en bil der bliver
fanget, giver alle et spike i sideaccelerationen et øjeblik, og en bil, der gør
det ofte, så ud til at have mere greb, end den har. Hvorfor median-af-tre: ved fem meters
afstand er én prøve langt væk, og et enkelt-prøve-spike er en kantsten, en
bule eller en mur.

At læse omhyllingen ved en fart interpolerer mellem bidstrins centre og tager
det nærmeste trin med data, hvor et trin er tomt.

**To slags underlag.** Når en bils runder kørte en femtedel eller mere af deres
prøver på både asfalt og løst underlag, gemmes en særskilt omhylling for hver,
og hvert hjørne bedømmes med det underlag under bilen på dets langsomste punkt.

**Overgang.** Farten, hvorfra trækket falder af som `1/v` (effektbegrænset) i stedet for at
holde sig fladt (trækbegrænset): det første trin, hvis `a·v` ligger inden for 15 % af den højeste `a·v`, der er set.

## Profilen: hvilken slags bil det er {#the-profile-what-kind-of-car-it-is}

`profile`, ud fra de samme runder (prøver på jorden, ikke ramt, hurtigere
end 8 m/s):

| Mål | Hvordan |
|---|---|
| **greb holdt** (m/s²) | 95. percentil af den halvsekunds holdte sideacceleration |
| **træk** til 50 km/h, 50-120, 120-200, over 200 (m/s²) | gennemsnittet af omhyllingens fuldgastræk over 3-14, 14-33, 33-56 og 56-90 m/s, ved de farter bilen nåede (op til dens hurtigste + 2 m/s), ud fra mindst tre 1 m/s-trin; og det mest den viste, og hvor |
| **bremsning** (m/s²) | omhyllingens bremsning gennemsnittet fra 60 til 160 km/t (16,7-44,4 m/s), det bånd sammenligningen navngiver |
| **hurtigst** | den højeste fart, den nåede |
| **nåede toppen ved** | hvor den holdt op med at vinde ved fuld gas på en lige strækning (nedenfor) |
| **trak stadig ved sin hurtigste** | omhyllingens træk ved dens hurtigste fart: hvor meget den stadig havde at give |
| **bagende fanget, pr. runde** | gange pr. runde den gled og måtte fanges (nedenfor) |
| **andel på speederen** | af dem, andelen der startede med gas > 0,5 og ingen bremse |
| **slipper ved** | medianen af den holdte sideacceleration 0,15 s før hver glidning begyndte, som en andel af grebet |
| **over 10° driftvinkel, ved hård sving** | af prøver, der tog en sving ved 60 % af sit greb eller mere, andelen der gled (10° på asfalt, 20° på løst); kræver 30 prøver |
| **median driftvinkel** | over de samme prøver |
| **balance** | forreste minus bageste slipvinkel (multipla af nominel top), hvor der tages en hård sving og ikke glides, gennemsnit af mindst 30 prøver: + skubber ud |
| **overflade** | over 80 % løse prøver: løst; under 20 %: asfalt; ellers blandet |

**Nå toppen.** En prøve tæller, når sekundet omkring den (±0,5 s, mindst 0,9 s data) var
helt på fuld gas (> 0,95, ingen bremse), på jorden, kørt **lige ud** (|lateral| under det største af
4 m/s² og en fjerdedel af dens greb), vandt under **0,35 m/s²**, hurtigere
end 25 m/s og inden for 90 % af rundens hurtigste - fuld gas op ad en bakke eller gennem en lang kurve
holder også op med at vinde, langt under bilens topfart. Med mindst **ét
sekund** af sådan et plateau over alle runder er medianen af de farter, hvor den når toppen. Ellers er der ingen topfart: hvor ingen lige strækning var lang nok, siger *trak stadig ved sin hurtigste*, hvor langt fra den var. Ingen gætteri ud over det, runderne viser - gearing og begrænseren
afslutter en bils træk længe før luftmodstanden gør det.

**At miste bagenden.** Tælles, hvor føreren måtte fange den: tager en sving ved
60 % af sit greb eller mere, glider (drift over 10° på asfalt, 20° på løst
underlag), med styringen (over 0,06) drejet **mod** svinget. Hvilket fortegn for styring der svarer til hvilket fortegn for sidekraft i svinget måles pr. runde (prøver der drejer uden at glide). En glidning tælles én gang, indtil bilen holder op med at glide. En bil, der køres lidt til siden med vilje, taber ikke noget; en, der kræver modsat rat, gør. Tælles ens for hver bil, så to biler kan sammenlignes. Kræver styring og en driftvinkel.

## Biler sammenlignet {#cars-compared}

Sidepanelets afsnit er **Bilen** med én bil, **Biler sammenlignet** med flere.

**Tabellen**: en kolonne pr. bil, en række pr. mål, hvor en bil har en værdi:
Greb holdt; Træk til 50 km/h, 50-120, 120-200, over 200; Bremsning; Hurtigst;
Nåede toppen ved ("trækker stadig" hvor den aldrig gjorde); Trak stadig ved sin hurtigste; Bagende fanget, pr. runde; Over 10° driftvinkel, ved hård sving. Hvor bilerne adskiller sig med mere end 3 %, markeres den bedre værdi (højere for greb, træk, bremsning, farter; lavere for bagglidninger).

**En bil alene**: sætninger om, hvad runderne viser den er - det greb den holder
(m/s² og g), dens træk i hvert bånd, hvor den holdt op med at vinde på de lange lige strækninger (eller at den aldrig nåede toppen, og hvad den stadig trak med ved sin hurtigste), hvor ofte dens bagende måtte fanges ("næsten aldrig" under én gang pr. runde, "mest på speederen" når 60 % eller mere startede der).

**To biler**: for hvert par en sætning hver om, hvad bilen er i forhold til den
anden ("X accelererer bedre, men kan ikke dreje så hårdt, bruger længere tid på at stoppe og taber bagenden lettere"), tabellen, hver klar forskel, den største først, og derefter **Kørsel med hver**. Med mere end **3** par vises ét par: den valgte runes bil mod en bil valgt fra en rullemenu (som standard bilen på sin klasses bedste runde, ellers referencens, ellers den første anden).

En forskel siges kun, når runderne viser den klart:

| Forskel | Siges ud fra | Sætning |
|---|---|---|
| greb | **4 %** | "X holder N % mere greb gennem svingene … det er M % mere fart gennem midten af hvert sving" (fart = √ af grebforholdet) |
| træk | **5 %**, i det første bånd begge biler har af 120-200, 50-120, over 200 km/t | "X accelererer N % hårdere fra 120 til 200 km/t"; også fra start, eller "men Y kommer hårdere af start", når starten afviger med 8 % |
| topfart | **4 km/t** | "X når højere op: den holdt op med at vinde ved …" |
| topfart, kun én | én bil nåede toppen, den anden ikke | "Y løb tør for træk ved …; X vandt stadig, da den bremsede" |
| topfart, ingen | ingen nåede toppen | hvad hver stadig vandt ved sin hurtigste |
| bremsning | **5 %** | "X stopper N % hårdere … Y må bremse tidligere" |
| tab af bagenden | mindst én gang pr. runde mere **og** halvt så ofte igen | "X taber bagenden lettere: den stak ud langt nok til at kræve modsat rat N gange pr. runde mod M …" - mest på speederen (60 %+) eller mest når den drejer ind og slipper gassen (30 % eller mindre), fra cirka P % af sit greb; på løst underlag "noget af det er, hvordan en bil drejes; fangsten er ikke" |
| sidelæns | **12 procentpoint** af hård sving over driftgrænsen | "X kører mere sidelæns ved grænsen" |
| balance foran | **0,3** af den nominelle top | "X skubber mere forrest … Den vil gerne bremses og drejes før apexet" |

Egenskaberne i resuméet: *holder mere greb* / *kan ikke dreje så hårdt*,
*accelererer bedre* / *trækker mindre*, *når højere op* / *når lavere op*,
*trækker stadig i enden af de lige strækninger* / *løber tør for træk*, *stopper
hårdere* / *bruger længere tid på at stoppe*, *er mere stabil* / *taber bagenden
lettere* (*er meget mere glidende …* ved dobbelt så ofte plus én; *skal fanges
oftere* på løst underlag), *skubber forrest*. "Lidt at skelne den fra
Y på disse runder" når der ingen er.

**Kørsel med hver:**

- den ene bil har mere greb og den anden mere træk: hold farten gennem midten på en bred, rund linje (det "U") i den med greb; brems lige, drej den ind i en kort, stram midte og ret op ved udgangen (det "V") i den stærke;
- den ene bil er bagud på begge: dens bedste runde er den reneste - brems lige, den bredeste radius, fuld gas så tidligt, det holder;
- en bil, der taber bagenden lettere: giv gas først, når rattet retter sig ud, og skift tidligt op (glidninger på speederen), eller slip bremsen blidt og hold en jævn gas gennem midten (glidninger ved indgang).

Hintet under afsnittet gentager, hvordan hver måles.

## Hvad bilerne bestemmer i et hjørne {#what-the-cars-decide-in-a-corner}

Når runderne er i forskellige biler, ender hvert tabt hjørnes fund med
**Bilerne:** - hvad af det bilerne bestemmer, og hvordan man får mest ud af denne
(`carNote`):

- **Gennem midten**, når denne bil holder under 96 % af den andens greb, den anden var over 0,5 m/s hurtigere på sit langsomste punkt, og denne runde var ikke langt under, hvad dens greb forklarer (over 70 % af det): på den andens linje tillader denne bils greb `v_andre · √(greb_min / greb_andre)`. Havde runden båret det (inden for 1 m/s), er forskellen bilen, og intet bremsepunkt ændrer det; hvis mindre, hvor meget der stadig er at hente. Derefter hvor tiden kan vindes i stedet: over på en lige strækning, mellem to, eller i en bil, der trækker 5 % hårdere - efter apexet (brems lige, drej ind senere, peg mod udgangen tidligt); ellers den bredeste radius vejen tillader.
- **En bagende, der slap her** (en ikke-delt glidning eller spin, eller en driftvinkel ud over glidegrænsen på vej ind), i en bil, der taber den mindst én gang pr. runde mere og halvt så ofte: hvad man gør i denne bil - gassen givet, efterhånden som rattet retter sig ud (dens glidninger starter på kraften 60 % eller mere af tiden), eller bremsen sluppet blidt uden at løfte.
- **Den lige strækning efter**: når bilernes træk forklarede 0,03 s eller mere, den anden bils stærkere træk fra samme fart, med begge biler træk fra 120 til 200 km/t.
- **Topfart**: når runden nåede 98 % af, hvor dens bil når toppen på en lige strækning over 150 m lang, og den anden kørte 1,5 m/s hurtigere: det er bilens topfart, og hver km/t mere ud af svinget hjælper, indtil den er der.
- **Bremsning**: når den anden bil bremser 5 % hårdere, og denne runde bremsede mere end 5 m tidligere, at noget af den tidligere bremsning er bilens.

Bilens andel tages også ud af selve tiden - se
[bilens andel](race-corner-analysis.md#the-cars-share) - og et hjørne, hvor bilen forklarer 60 % eller mere, lægges på bilen.

## Til udviklere {#for-developers}

Kode: [`src/race/envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts),
[`src/race/profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts),
`carNote` i [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts),
`CarsSection` i [`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx).
