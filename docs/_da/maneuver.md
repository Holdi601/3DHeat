---
title: "Manøvrer"
parent: "Indsigter"
nav_order: 4
lang: "da"
source: "maneuver.md"
source_hash: "2160eca678e0"
translated: true
outdated: false
---

# Manøvrer: sådan bevæger grupper sig

**Indsigter → Manøvrer** følger, hvordan enhederne på hver side bevæger sig *som grupper*,
og giver navn til de manøvrer, de laver: et flankeangreb, en tang, et gennembrud, et
baghold, et tilbagetog, et missilforsvar, at krydse T'et. Hver manøvre får også en
angivelse af, hvor sikker den er, tallene bag den, om den betalte sig, og om den
har paralleller i doktrin og historie. **Massanalyse → Manøvrer** tæller dem over
tusindvis af kampe: hvor ofte hver enkelt laves pr. kort, spiltilstand og side, og
hvor ofte den betaler sig.

Alt beregnes i din browser, i sin egen worker (`src/insights/maneuver`). En kamp med
nogle hundrede enheder tager 10-500 ms, en to timer lang luftkrig med tusindvis af
objekter omkring et sekund.

## Brug den {#using-it}

- Åbn **Indsigter**, fanen **Manøvrer**. Den tæller, når den åbnes første gang. Brug
  **Find igen** efter at have ændret filtrene.
- **Sikker / Sandsynlig / Mulig** sætter den sikkerhed, der vises (som standard
  Sandsynlig).
- **Tidslinjen** har en bane pr. side og en søjle pr. manøvre. **Listen** nedenunder
  viser det samme, sorteret efter tid. Et klik skifter til replay ved manøvrens start,
  flyver kameraet derhen og tegner den i 3D: hver gruppes vej som en pil (en tangs
  to arme er dens buer), gruppernes konturer på det afgørende øjeblik (fjendens i
  sidens farve) og fjendens front som en hvid linje. **Tegn alle i 3D** tilføjer
  kampens øvrige manøvrer, svagt. Linjerne sendes til grafikkortet én gang, når valget
  ændres, og ikke hver billede. Med 480 manøvrer tegnet under afspilning er
  billedtiderne på et rigtigt GPU (WebGL2 og WebGPU, p99 18,0-18,5 ms, max
  19,5-20,8 ms) de samme som uden.
- En åbnet manøvre viser sit udfald (drab og tab blandt de enheder, der lavede den,
  mens den kørte og lige efter, sammenlignet med sidens egen udveksling over kampen),
  sit grundlag og vidensbasens poster om den: doktrinen og de historiske paralleller
  (Cannae for en tang, Sedan 1940 for et gennembrud, Tsushima for at krydse T'et,
  Operation Bolo for en finte ...).
- Den lille tabel nederst: pr. type og side, lavet og betalt sig.

![En tang i den syntetiske demokamp: begge arms pile, fjendens krop og dens front](../assets/img/en/maneuvers.webp)

## Sådan findes grupperne {#how-groups-are-found}

Hver enhed placeres på en fælles tidslinje (et skridt på 1 s til fods, ellers 2 s, og
længere for meget store filer). Den holdes stille ved en død, så en genopstandelse
ikke tegner en linje hen over kortet. Ved hvert skridt knyttes enhederne på en side og
af en type (fly, køretøjer, skibe, infanteri) sammen, når de ligger tæt - 18 m til
fods, 170 m for køretøjer, 3 km for skibe og 5 km for fly - og bevæger sig ens
(hastighederne inden for halvdelen af den hurtigstes, eller begge står stille). En
klynge beholder id'et for den gruppe, de fleste af dens medlemmer var i. En enhed uden
klasse sættes til fods, i et køretøj eller i luften efter sin fart.

En gruppes **form** aflæses i forhold til retningen den har: en kolonne eller en linje
efter, hvordan medlemmerne spreder sig langs og på tværs, en kile, når midten fører, en
echelon, når medlemmerne træder tilbage til den ene side, og en boks, når de holder
hjørnerne.

Alt bedømmes i kampens egen skala: **engagementsafstanden** `R` er den 75. percentil af
afstanden mellem en dræber og dens offer (begrænset til domænets fornuft), og en
manøvres tider skaleres efter enhedstypen (infanteri en tredjedel af terrænets).

## Hvad den finder {#what-it-finds}

| Manøvre | Findes når |
|---|---|
| Formation | en gruppe holder én form på 60 % af sine bevægelsesskridt i 30 s |
| Frontalangreb | en gruppe lukker ind fra uden for rækkevidde til kontakt, ¾ R eller mere, inden for 35° fra den vej fjenden vender |
| Flankeangreb | det samme fra 50-130° (bagsiden længere ude); sikkert kun med en venlig *fastholdende styrke*, der kæmper mod fjenden dér (drab begge veje) |
| Tang | to flankeangreb fra én side mod samme fjendtlige krop, fra modsatte sider (100° eller mere fra hinanden), inden for 90 s; sikker, når armene kæmper |
| Omringning | en kompakt fjendtlig gruppe med mindst lige så mange af den anden side rundt om sig inden for 1,5 R, fra to eller flere grupper, ingen åbning over 100°, i et minut, afskåret fra sin egen side; sikker, når ringen lukkede sig med ½ R og kæmpede om lommen |
| Gennembrud | en gruppe passerer en holdt linje (fjender, der står 30 s både til venstre og højre for den, med sidens centrum bag dem); sikker, når den kommer ½ R længere ind, bliver stående i 20 s og kæmper der; et gennembrud en yderligere R længere ind |
| Dækket fremrykning | i en lille gruppe bevæger en del sig, mens resten står, rollerne skifter fire gange eller mere, med dækkende ild fra den stående del |
| Koncentration / spredning | en sides andel nær dens tætteste punkt stiger fra 35 % til 60 % (enheder, der kommer 1,5 R eller mere, så kontakt) - eller falder, når siden spredes |
| Finte | et lille led i kontakt trækker to eller flere fjender fra et andet sted; en større gruppe slår så til fire rækkeviddeenheder væk, hvor fjenden har færre |
| Tilbagetog / forfølgelse | en gruppe i kontakt drejer væk og får R afstand fra, hvor den kæmpede; sikker, når en fjende dér netop havde dræbt en af dens og gruppen fik 2 R fra den dræber (aldrig til fods: se nedenfor); fjender, der bevæger sig samme vej og holder trit, forfølger |
| Forsvar i dybden | stående enheder i to eller flere bælter på tværs af fjendens akse, R i dybden, fjenden kommer frem, ild fra bælterne |
| Omvendt skråning | tre eller flere drab på kort afstand af stående enheder på ofre, der kom over en højderyg |
| Baghold | en bevægelig gruppe møder fjender, der stod 45 s; de skyder først, og de bevægelige mister to eller halvdelen af gruppen |
| Skærm | en eller to enheder, der bevæger sig foran et legeme på tre eller flere, og møder fjenden først |
| Indre linjer | en sides grupper står tæt sammen mellem den anden sides, og dens enheder flytter mellem dem |
| Tempo | en side, der svarer på kontakt (drejning, fartskifte, første skud) 1,5 gange hurtigere, Mann-Whitney p under 0,05 |
| Krængning, indskæring, træk, pumpe | målet for et missilaffyring drejer skytten til 35-70°, 75-105°, over 140°, eller trækker og drejer tilbage |
| Luftens tang, mur, føring-og-følge, slibning | et par, der deler sig mod én fjende; tre side om side mod fjenden; et led 5-20 km bag et andet; to, der kredser om et punkt én fra hinanden |
| Kampluftpatrulje | kredser om en station i tre minutter |
| Energi- / vinkelkamp | i en tæt kamp - kurser 30° fra hinanden, hver har den anden for næsen på skift, eller et drab mellem dem - højden bruges og stiger, eller flad og drejer hårdt mens den bremser; sikker, når den ene dræbte den anden |
| Angrebspakke, SEAD | en luftgruppe med blandede roller, hvoraf nogle rammer jorden; luftforsvarets drab før de fleste andre drab på jorden |
| Slagorden, krydsning af T'et | tre skibe i kolonne; en kolonne, der står tværs over hovedet på en fjendtlig kolonne |

Hver manøvre siger, hvilke **mønstre** i vidensbasen den viser
(`patterns-maneuver.ts`: formation, frontalangreb, dobbelt omslutning,
omringning, gennembrud, ild og manøvre, finte, tilbagetog, forfølgelse, forsvar i
dybden, skærmning, spredning, missilforsvar, vinkelkamp, kampluftpatrulje,
angrebspakke, slagorden, krydsning af T'et) og hvilke poster man skal læse først. Ældre
poster får de nye mønstre med via `knowledge/maneuver-tags.ts`. Se [Vidensobjektivet](knowledge.md).

**Betalte sig** sammenligner enhedernes udveksling, mens den kørte (og et minut efter),
med sidens over kampen. Et tilbagetog betaler sig, når det mistede færre enheder efter
drejningen end før. Et missilforsvar betaler sig, når flyet overlever et minut. En
omringning betaler sig, når lommen mister halvdelen.

## Over mange kampe {#over-many-matches}

Hver kamps resumé (`src/mass/summarize.ts`, se [Massanalyse](mass-analysis.md))
indeholder et lille afsnit `maneuvers`: pr. type og side, lavet (ved Sandsynlig eller
højere), betalt sig, ikke betalt, drab og tab. **Massanalyse → Manøvrer** lægger dem
sammen over de kampe, filteret beholder - pr. kort og spiltilstand, eller samlet - med
Wilson-intervallet for andelen, der betalte sig. En række indlæser de kampe, den blev
lavet i. Resuméer skrevet før afsnittet fandtes har ingen: kør
`node tools/3dheat-summarize.mjs <mappe> --force` for at tilføje det.

## Hvor sikker den er {#how-sure-it-is}

Syntetiske kampe med indlagte manøvrer (`synth.ts`, kørt af `maneuver.test.ts`): alle 28
indlagte typer findes på Sandsynlig eller højere; af 50 rapporterede manøvrer er 31 den
indlagte type, og de andre 19 er også virkelig der (den bevægelige gruppes formation,
den trængende kolonnes frontalnærmelse); ingen er forkert. På 30 nulkampe - tilfældige
gåture hver for sig og blandet, enheder der står tilfældigt, fly på lige ben, en
menneskemængde, der går rundt - rapporteres intet på Sandsynlig eller højere.

På rigtige data (snesevis af landslag, nogle få lange luftkrigsmissioner, et dusin
skydespilskampe): frontalangreb, flankeangreb, gennembrud og omringninger i
tankslagene, formationer og tætte kampe i luften, missilforsvar, kampluftpatruljens
kredsninger og føring-og-følge-par i luftkrigsmissionerne, frontale henrettelser,
kolonner og nogle få baghold og dækkede fremrykninger i skydespillet. Tærsklerne er
doktrinens former i spillets skala. Læs et enkelt fund med dets grundlag, og andelene i
massetabellen med deres intervaller.

### Mod nulmodeller af de samme kampe {#against-null-models-of-the-same-matches}

Et fund kan narres af terrænet og mængden: i et slagsmål har hver gruppe fjender på alle
sider. Derfor køres hver type også på **nulmodeller** bygget af de samme kampe
(`nulls.ts`), hvor siderne ikke længere mødes, som de gjorde: den ene sides tidslinje
drejet med en tredjedel til to tredjedele af kampen (*shift*), eller dens spor drejet
om kortets centrum (*rotate*); og holdnavnene blandet (*teams*, der per konstruktion
beholder omkring halvdelen af de rigtige kampe). Kampe tælles kun som drab parret med
deres dødsfald, dræberen inden for 2 R og offeret på stedet - en nulmodel bryder de
parringer. Fund på Sandsynlig eller højere pr. kamp, rigtige mod nulmodellerne (30
tankslag; 12 skydespilskampe):

| Type | Tankslag: rigtig / shift / rotate | Skydespil: rigtig / shift / rotate |
|---|---|---|
| Omringning | 0 / 0 / 0 (var 1,3 / 1,2 / 0,8) | 0 / 0 / 0 |
| Gennembrud | 0,03 / 0,02 / 0,05 (var 1,6 / 1,8 / 1,4) | 0 / 0 / 0 |
| Flanke | 0,33 / 0,07 / 0,10 | 1,0 / 0,08 / 0,21 |
| Frontalangreb | 0,87 / 0,47 / 0,12 | 14,4 / 6,5 / 4,3 |
| Tilbagetog | 0,03 / 0 / 0,02 | 0,08 / 0,08 / 0,5 (så aldrig sikker til fods) |
| Baghold | - | 0,17 / 0,04 / 0,04 |
| Energikamp | 1,2 / 0,1 / 0,85 | - |
| Vinkelkamp | 0,6 / 0,07 / 0,3 | - |

Nære luftkampe over et slagfelts centrum overlever en drejning om det centrum, så
rotate-kolonnen er mindre venlig over for dem end over for landtyperne. Typer inden for
én side - formation, kampluftpatrulje, slibning, angrebspakke, SEAD, dækket fremrykning,
skærm - afhænger ikke af den anden side og prøves ikke på denne måde. `maneuver.test.ts`
kontrollerer, at nulmodellerne fjerner den indlagte flanke, tang, omringning,
gennembrud, baghold og tilbagetog fra de syntetiske kampe.

## Begrænsninger {#limits}

- Grupper kræver positioner over tid; en fil med kun hændelser har ingen.
- Retningen læses ikke af data: fjendens front er der, hvor den fastholdende styrke
  kæmper med den, ellers der, hvor den bevæger sig, ellers der, hvor angriberen kom fra.
- Terræn læses fra enhedernes egne højder (den omvendte skråning); der er ingen
  synlinjetest.
- Meget store filer samples med længere skridt; korte luftmanøvrer i dem læses stadig ud
  fra 2-4 s skridt.
