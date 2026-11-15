---
title: "Bilprofiler og sammenligning"
parent: "Løpsanalyse"
nav_order: 56
lang: "no"
source: "race-car-profiles.md"
source_hash: "178f6511a289"
translated: true
outdated: false
---

# Bilprofiler og sammenligning

En bil kan bare bremse, svinge og akselerere så hardt. Seeren måler hvor hardt fra dine egne runder, så den aldri ber deg gjøre noe bilen din ikke kan. Dette forklarer også hvor mye av et tapt sekund som var bilens feil og ikke din.

![Cars compared: two cars side by side with their grip, braking and pull](../assets/img/en/race-cars-compared.webp)

Analysen forteller bare en runde å bremse hardere, ta med seg mer fart eller akselerere tidligere der bilen har vist at den kan det, og den tar ut av et tap det bilene selv forklarer. Derfor måles hver bils grenser (dens *kurve*, under) og karakter (dens *profil*) fra hver innlastet runde av den. Denne siden dekker kurven, profilen, seksjonen **Biler sammenlignet**, og hva bilene avgjør i hvert hjørne.

**En bil** = runder med samme bilnummer (eller navn, uten nummer) og
samme ytelsesindeks: en annen innstilling er en annen bil.

## Kurven: hva bilen kan gjøre ved hver fart {#the-envelope-what-the-car-can-do-at-each-speed}

Per bil, over hver innlastet runde av den, i **5 m/s fartsbolker** (24 bolker, opptil
120 m/s). Prøver i luften, stabilisering i 0,3 s etter en landing, og fra
0,1 s før hvert treff til 1 s etter det, utelates, og akselerasjoner på
80 m/s² eller mer ignoreres (over det enhver bil med nedtrykkskraft holder).

| Kurve | Prøver | Verdi per bolk | Trenger |
|---|---|---|---|
| **sidegrep** | sideakselerasjonen **holdt i et halvt sekund** (gjennomsnittet av absoluttverdien over et sentrert 0,5 s-vindu), bare der bilen svingte: minst en tredjedel av 99. persentil av alt det | 95. persentil | 6 prøver |
| **bremsing** | brems > 0,3; lengdeakselerasjonen som medianen av hver prøve og dens to naboer | 95. persentil av retardasjonen | 4 prøver |
| **full gass-trekk** | gass > 0,95, brems under 0,05; samme median-av-tre | 90. persentil | 4 prøver |

Hvorfor holdt i et halvt sekund: en kantstein, en glidning som slår tilbake, en bil som
blir fanget, gir alle en topp i sideakselerasjonen et øyeblikk, og en bil som
gjør det ofte så ut til å ha mer grep enn den har. Hvorfor median-av-tre: med fem meters
avstand er én prøve langt unna, og en topp fra én enkelt prøve er en kantstein, en
ujevnhet eller en vegg.

Å lese kurven ved en fart interpolerer mellom boltsentrene, og tar den nærmeste
bolken med data der en bolk er tom.

**Om to slags underlag.** Når en bils runder kjørte en femtedel eller mer av prøvene
på både asfalt og løst underlag, beholdes en egen kurve for hver, og hvert hjørne bedømmes med
underlaget under bilen på det langsomste punktet.

**Overgangen.** Farten der trekket faller av som `1/v` (begrenset av effekt) i stedet for å holde seg flatt
(begrenset av trekkraft): den første bolken der dens `a·v` er innen 15 % av den høyeste `a·v` som er sett.

## Profilen: hva slags bil den er {#the-profile-what-kind-of-car-it-is}

`profile`, fra de samme rundene (prøver på bakken, ikke truffet, raskere enn 8 m/s):

| Mål | Hvordan |
|---|---|
| **grep holdt** (m/s²) | 95. persentil av den halvsekundholdte sideakselerasjonen |
| **trekk** til 50 km/t, 50–120, 120–200, over 200 (m/s²) | gjennomsnittet av kurvens full gass-trekk over 3–14, 14–33, 33–56 og 56–90 m/s, ved farter bilen nådde (opptil sin raskeste + 2 m/s), fra minst tre trinn på 1 m/s; og det mest den viste, og hvor |
| **bremsing** (m/s²) | kurvens bremsing gjennomsnittlig fra 60 til 160 km/t (16,7–44,4 m/s), båndet sammenligningen nevner |
| **raskest** | den høyeste farten den nådde |
| **nådde toppen ved** | der den sluttet å øke ved full gass på en rettstrekning (under) |
| **trekker fortsatt ved sin raskeste** | kurvens trekk ved dens raskeste fart: hvor mye den fortsatt hadde igjen |
| **bak fanget, per runde** | ganger per runde den gled og måtte fanges (under) |
| **andel på gassen** | av disse, andelen som begynte med gass > 0,5 og ingen brems |
| **slipper taket ved** | medianen av den holdte sideakselerasjonen 0,15 s før hver glidning begynte, som en andel av grepet |
| **over 10° drift, i hard svingkjøring** | av prøver som svinger med 60 % av grepet eller mer, andelen som sklir (10° på asfalt, 20° på løst underlag); krever 30 prøver |
| **median drift** | over de samme prøvene |
| **balanse** | forrige minus bakre glidevinkel (multiplum av nominell topp) der den svinger hardt og ikke sklir, gjennomsnitt av minst 30 prøver: + skyver utover |
| **underlag** | over 80 % løse prøver: løst; under 20 %: asfalt; ellers blandet |

**Å nå toppen.** En prøve telles når sekundet rundt den (±0,5 s, minst 0,9 s data) var
helt på full gass (> 0,95, ingen brems), på bakken, kjørt **rett** (|sideveis| under det større av
4 m/s² og en fjerdedel av grepet), med en økning under **0,35 m/s²**, raskere enn 25 m/s og
innen 90 % av rundens raskeste – full gass oppover en bakke eller gjennom en lang sving slutter også å øke, langt under bilens toppfart. Med minst **ett
sekund** av slik platå over alle runder, er medianen av disse farten der den når toppen. Ellers finnes det ingen toppfart: der ingen rettstrekning var lang nok, sier *trekker fortsatt ved sin raskeste* hvor langt unna den var. Ingen gjetning utover det rundene viser – girer og begrenseren avslutter en bils trekk langt før luftmotstanden gjør det.

**Å miste bakenden.** Telles der føreren måtte fange den: svinger med 60 % av grepet eller mer, sklir (drift over 10° på asfalt, 20° på løst underlag), med styringen (over 0,06) vridd **mot** svingen. Hvilket fortegn på styringen som stemmer med hvilket fortegn på svingkraften, måles per runde (prøver som svinger uten å skli). En glidning telles én gang til bilen slutter å skli. En bil som kjøres litt på skrå med vilje, mister ingenting; en som trenger motstyring, gjør det. Telles likt for hver bil, slik at to biler kan sammenlignes. Krever styring og en driftvinkel.

## Biler sammenlignet {#cars-compared}

Sidepanelseksjonen heter **Bilen** med én bil, **Biler sammenlignet** med flere.

**Tabellen**: en kolonne per bil, en rad per mål som noen bil har en verdi for:
Grep holdt; Trekk til 50 km/t, 50–120, 120–200, over 200; Bremsing; Raskest; Nådde toppen ved ("trekker fortsatt" der den aldri gjorde det); Trekker fortsatt ved sin raskeste; Bak fanget, per runde; Over 10° drift, i hard svingkjøring. Der bilene skiller seg med mer enn 3 %, markeres den bedre verdien (høyere for grep, trekk, bremsing, farter; lavere for bakglidninger).

**Én bil alene**: setninger om hva rundene viser at den er – grepet den holder
(m/s² og g), trekket i hvert bånd, der den sluttet å øke på de lange rettstrekningene (eller at den aldri nådde toppen, og hva den fortsatt trakk ved sin raskeste), og hvor ofte bakenden måtte fanges ("nesten aldri" under én gang per runde, "for det meste på gassen" når 60 % eller mer begynte der).

**To biler**: for hvert par, en setning hver om hva bilen er mot den andre ("X akselererer bedre, men kan ikke svinge like hardt, trenger lenger til å stoppe og mister bakenden lettere"), tabellen, hver tydelig forskjell størst først, og deretter **Kjøring av hver**. Med mer enn **3** par vises ett par: den fokuserte rundens bil mot en bil valgt fra en rullegardinliste (som standard den raskeste rundens bil i klassen, ellers referansens, ellers den første andre).

En forskjell sies bare når rundene viser den tydelig:

| Forskjell | Sies fra | Setning |
|---|---|---|
| grep | **4 %** | "X holder N % mer grep gjennom svingene … det er M % mer fart gjennom midten av hvert hjørne" (fart = √ av grepsforholdet) |
| trekk | **5 %**, i det første båndet begge biler har av 120–200, 50–120, over 200 km/t | "X akselererer N % hardere fra 120 til 200 km/t"; også fra start, eller "men Y kommer seg raskere av start", når starten skiller seg med 8 % |
| toppfart | **4 km/t** | "X når høyere toppfart: den sluttet å øke ved …" |
| toppfart, bare én | én bil nådde toppen, den andre ikke | "Y gikk tom for trekk ved …; X økte fortsatt da den bremset" |
| toppfart, ingen | ingen nådde toppen | hva hver fortsatt økte ved sin raskeste |
| bremsing | **5 %** | "X stopper N % hardere … Y må bremse tidligere" |
| miste bakenden | minst én gang per runde mer **og** halvannen gang så ofte | "X mister bakenden lettere: den steg ut langt nok til å trenge motstyring N ganger per runde mot M …" – for det meste på gassen (60 %+) eller for det meste i innsvingen og på slipp (30 % eller mindre), fra omtrent P % av grepet; på løst underlag "noe av det er hvordan en bil svinges; fangingen er ikke det" |
| på skrå | **12 prosentpoeng** av hard svingkjøring over driftgrensen | "X kjører mer på skrå ved grensen" |
| balanse foran | **0,3** av nominell topp | "X skyver mer foran … Den vil ha å bli bremset og svinget før toppunktet" |

Egenskapene i sammendraget: *holder mer grep* / *kan ikke svinge like hardt*,
*akselererer bedre* / *trekker mindre*, *når høyere toppfart* / *når lavere toppfart*,
*trekker fortsatt på slutten av rettstrekningene* / *går tom for trekk*, *stopper
hardere* / *trenger lenger til å stoppe*, *er mer stabil* / *mister bakenden
lettere* (*er mye mer glidende …* ved dobbelt så ofte pluss én; *må fanges
oftere* på løst underlag), *skyver foran*. "Lite å skille den fra
Y på disse rundene" når det ikke er noen.

**Kjøring av hver:**

- den ene bilen har mer grep og den andre trekker mer: ta med deg fart gjennom midten på en bred, rund linje ("U") i den som har grep; brems rett, roter den i en kort, trang midtdel og rett ut i utgangen (“V”) i den sterke;
- den ene bilen er dårligere på begge: dens beste runde er den reneste – brems rett, den største radiusen, full gass så tidlig den holder;
- en bil som mister bakenden lettere: før gassen inn først når styringen løser seg, og gir raskt opp gir (glidninger på gassen), eller slipp bremsen forsiktig og hold jevn gass gjennom midten (glidninger ved innkjøring).

Hintet under seksjonen gjentar hvordan hver måles.

## Hva bilene avgjør i et hjørne {#what-the-cars-decide-in-a-corner}

Når rundene er i forskjellige biler, ender hvert tapt hjørnes funn med
**Bilene:** – hva av det bilene avgjør, og hvordan få mest ut av denne (`carNote`):

- **Gjennom midten**, når denne bilen har under 96 % av den andres grep, den andre var over 0,5 m/s raskere på det langsomste punktet, og denne runden ikke lå langt under det grepet forklarer (over 70 % av det): på den andre bilens linje tillater denne bilens grep `v_other · √(grip_mine / grip_other)`. Hvis runden bar det (innen 1 m/s), er gapet bilen, og ingen bremsepunkt endrer det; hvis mindre, hvor mye som fortsatt er å hente. Deretter hvor tiden kan vinnes i stedet: ut på en rettstrekning, mellom to, eller i en bil som trekker 5 % hardere – etter toppunktet (brems rett, sving inn senere, pek mot utgangen tidlig); ellers den bredeste radiusen veien tillater.
- **En bakende som slapp her** (en ikke-delt glidning eller spinn, eller en drift over glidegrensen på vei inn), i en bil som mister den minst én gang per runde mer og halvannen gang så ofte: hva du skal gjøre i denne bilen – gassen tilføres når rattet løser seg (glidningene begynner på kraften 60 % eller mer av tiden) eller bremsen slippes forsiktig uten slipp.
- **Rettstrekningen etter**: når bilenes trekk forklarte 0,03 s eller mer, den andre bilens sterkere trekk fra samme fart, med begge bilenes trekk fra 120 til 200 km/t.
- **Toppfart**: når denne runden nådde 98 % av der bilen nådde toppen på en rettstrekning over 150 m lang, og den andre gikk 1,5 m/s raskere: det er bilens toppfart, og hver km/t mer ut av hjørnet hjelper til den er nådd.
- **Bremsing**: når den andre bilen bremser 5 % hardere og denne runden bremset mer enn 5 m tidligere, at noe av den tidligere bremsingen er bilens.

Bilens andel tas også ut av tiden selv – se [bilens andel](race-corner-analysis.md#the-cars-share) – og et hjørne der bilen forklarer 60 % eller mer, føres på bilen.

## For utviklere {#for-developers}

Kode: [`src/race/envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts),
[`src/race/profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts),
`carNote` i [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts),
`CarsSection` i [`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx).
