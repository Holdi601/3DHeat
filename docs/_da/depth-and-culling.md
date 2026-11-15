---
title: "Dybde og culling"
parent: "Varmetilstande"
nav_order: 4
lang: "da"
source: "depth-and-culling.md"
source_hash: "436ac15a9b3d"
translated: true
outdated: false
---

# Dybde og culling

Dybde får bakker og vægge til at skjule varmen bag dem, ligesom en rigtig væg skjuler et menneske. Afstandsafskæring beholder kun varmen mellem en nær og en fjern afstand fra kameraet.

![Et lavt kamera bag en bakke, med Skjul bag terræn fra (venstre) og til (højre)](../assets/img/en/depth-and-culling-terrain.webp)

![Afstandsafskæring med Fjern på 400 m og Skær også banen til: et udsnit af kortet omkring kameraet](../assets/img/en/depth-and-culling-far.webp)

Uden dybde er et varmekort over en 3D-[bane](levels.md) et fladt overlag: alt, datasættet indeholder, lyser igennem hver væg med fuld styrke, de dybdesignaler banen giver, ophæves, og et hotspot inde i en bygning ser ud som et på dens tag. Afsnittet **Dybde** får banen til at skjule det, der ligger bag den; **Afstandsafskæring** begrænser varmen til en skal eller plade omkring kameraet; [Udsnittet](slice.md) skærer en plade ud af verden. Alle tre gælder for varmetilstandene og ændrer, hvilke rækker der bidrager, så ændrer du dem, starter akkumuleringen forfra.

## Dybde {#depth}

Begge indstillinger kræver en [bane](levels.md) - et kortbillede eller en 3D-model. Uden indlæst bane er der intet at være bag, og de gør ingenting. Begge er slået fra, mens [Fladgør på jordplanet](sprite-shape.md#flatten-onto-ground-plane) er til.

### Skjul bag terræn {#hide-behind-terrain}

**Skjul bag terræn** (standard til): et datapunkt, hvis nærmeste flade mod kameraet er *jorden* (ikke en konstruktion), kasseres helt, ikke bare dæmpes.

Terræn og vægge er uigennemsigtige på forskellige måder. Du kigger *igennem* en væg med vilje, for at se hvilken etage trafikken var på; du vil aldrig kigge igennem en bakke, for bag den ligger den modsatte side af kortet - som på et kort flere kilometer på tværs er størstedelen af dataene, og som summerer langs horisonten til et bånd, der er lysere end noget i forgrunden. Ét dæmpningsniveau kan ikke dække begge dele, så terrænet får en grænse, og vægge beholder dæmpningen nedenfor.

### Skjult bag geometri {#hidden-behind-geometry}

**Skjult bag geometri** (standard 0,8): hvor kraftigt et datapunkt bag banens geometri undertrykkes. Værdien læses *vises igennem* ved 0, *N % mørkere* derimellem (skyderens position, ikke den målte dæmpning) og *helt skjult* ved 1.

Hver væg eller gulv mellem et punkt og kameraet dæmper det yderligere: én væg efterlader få procent ved standarden, og hver ekstra flade halverer det, der er tilbage, op til fire flader. Ved 1 tegnes intet bag geometri, og det er den billigste indstilling.

Se også [Banens udseende](level-appearance.md).

## Afstandsafskæring {#distance-culling}

**Afstandsafskæring** (lukket som standard) begrænser varmen til rækker mellem en nær og en fjern grænse fra kameraet. Sæt en fjern grænse for at aflæse tæthed inde i en bygning, uden at kortets fjerne side lægger sig ovenpå; sæt en nær grænse for at flyve *igennem* et hotspot i stedet for ind i det.

| Indstilling | Standard | Interval (skyder) | Betydning |
|---|---|---|---|
| **Nær** | fra | 0,5-5000 m, logaritmisk, de nederste 5 % af skinnen = fra (200.000) | Rækker tættere på end dette springes over. |
| **Fjern** | fra | 1-200.000 m, logaritmisk, nederst = fra (10.000.000) | Rækker længere væk end dette springes over. |
| **Skær ved et plan** | til | | Mål grænserne langs kigaksen i stedet for fra øjet, så skæringen er et plan parallelt med skærmen i stedet for en kugle omkring dig. En kugles kant krummer væk hen over billedet og glider, når du drejer; et plan bliver, hvor du sætter det. |
| **Skær også banen** | til | | Skær jorden, konstruktioner og vand ved de samme grænser. Med banen helt efterlades fjerner skæringen datapunkterne og lader bygningen stå foran dem; med begge skåret er det et snit gennem kortet, og punkterne sidder op mod deres vægge og gulve. Denne tegner kun om; den starter ikke akkumuleringen forfra. |

### Tastatur {#keyboard}

Den fjerne grænse er en indstilling, du fejer hen over - før den gennem en bygning og se, på hvilken etage trafikken dukker op - så den ligger på tastaturet, mens du flyver ([`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx)):

| Tast | Virkning |
|---|---|
| `]` | Skub den fjerne grænse ud med en faktor 1,12 (Shift: 1,35) |
| `[` | Træk den ind med samme faktor |
| `\` | Slå den fjerne grænse fra, eller tænd den igen i den afstand, den blev forladt i (6000 første gang) |

Trinene er geometriske, fordi det brugbare område spænder over fire størrelsesordener, fra et værelse til et kort. Tastaturet holder den fjerne grænse mellem 100 og 400.000. Tasterne gør ingenting, mens et tekstfelt eller en menu har fokus.

## For udviklere {#for-developers}

### Skjul bag terræn {#hide-behind-terrain}

Konstruktionerne tegnes ind i en dybdetekstur for sig selv. Et fragment, der er bag scenens dybde, men *ikke* bag konstruktionernes dybde, er bag jorden og kasseres. Det koster ét dybdepas over konstruktionerne, som springes over, når kontakten er slået fra.

### Skjult bag geometri {#hidden-behind-geometry}

Det tælles **pr. flade**. En enkelt dybdesammenligning kan kun sige "noget er foran", så et punkt bag én væg og et punkt fire rum inde i en bygning ville dæmpes ens, og interiøret ville læses som én svag udtværing. I stedet bliver konstruktionsgeometrien **dybde-peelet** til op til 3 yderligere lag ([`HEAT_DEPTH_LAYERS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)). Hvert fragment tæller, hvor mange flader der er foran det (scenens egen dybde plus de peelede lag: op til fire), og dæmpningen forstærkes:

```
styrke        = 1 - (1 - skyder)²                  (skyder 1 → 1)
synlighed     = (1 - styrke) × 0,5 ^ (flader - 1)
synlighed     = max(synlighed, 0,006)              (ingen gulv ved skyder 1)
```

| Skyder | 1 flade | 2 | 3 | 4 |
|---|---|---|---|---|
| 0,5 | 25 % | 12,5 % | 6,25 % | 3,1 % |
| 0,8 (standard) | 4 % | 2 % | 1 % | 0,6 % (gulv) |
| 1,0 | tegnes ikke | tegnes ikke | tegnes ikke | tegnes ikke |

Hvorfor to faktorer: skyderen er kalibreret, så én væg efterlader få procent - det udseende, der læses som "bag noget" - og få procent forstærket gange hinanden ville være intet ved den tredje væg; halvering pr. yderligere flade holder fire tydelige trin. Hvorfor kvadreret: lineært blev et mættet felt bag en væg ved at være mættet; en fjerde potens udslettede det ved 0,8. Hvorfor et gulv: at skjule det dækkede varme helt får et værelse fuldt af skjult trafik til at se ud som et tomt værelse, uden noget, der antyder at man skal tage [Udsnittet](slice.md) frem. Kun en skyder fastlåst på 1 skjuler det helt - og er den billigste indstilling, fordi de dækkede punkter så kasseres.

Sådan ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts), punktvarmeshaderne): sammenligningen sker pr. fragment mod scenens dybdetekstur, i **vinduets dybde** i stedet for verdensafstand. Et dybdeteksturopslag i vertex-trinnet læser "fjern" overalt på nogle drivere (ANGLEs softwarerasterizer blandt dem), og linearisering af begge dybder til meter mister adskillelsen ved præcision med et bredt near/far-interval. Biasen er én sprite-radius omregnet til vinduesenheder plus nogle få mindst betydende bit, så et datapunkt, der hviler på en flade, ikke skygger for sig selv.

Konstruktionerne tegnes gennemsigtige, men de tegnes ind i den dybde, som skjulingen læser; en bane, hvis konstruktioner ikke nåede dybdeteksturen, ville kun skjule mod terræn.

### Afstandsafskæring {#distance-culling}

Begge grænser evalueres i vertex-shaderen, så en afskåret række koster ét vertex og ingen fragmenter.
