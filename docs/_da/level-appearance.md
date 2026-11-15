---
title: "Banens udseende"
parent: "Baner og baggrundsgeometri"
nav_order: 3
lang: "da"
source: "level-appearance.md"
source_hash: "c883749baedd"
translated: true
outdated: false
---

# Banens udseende

Disse indstillinger ændrer, hvordan en 3D-bane ser ud, så varmen træder frem fra den, og du stadig kan læse stedet. Intet her ændrer dataene.

## Hurtig start {#quick-start}

1. Indlæs en 3D-bane ([3D-baner](model-levels.md)).
2. Under **Baggrund / bane** sænker du **Lysstyrke**, til varmen er det lyseste på skærmen.
3. Åbn **Terrænrelief** og hæv **Hældningsskygge** eller **Højdekurvernes styrke**, til du kan skelne en bakke fra en slette.
4. Åbn **Strukturer**. Sænk **Fladernes opacitet** for at se ind i bygninger, eller slå **Strukturtekstur** til for at se dem som massive.
5. Har jorden et billede malet på, så prøv **Jordtekstur** fra og til.

![Afsnittene Terrænrelief og Strukturer åbnet, med banen vist med reliefsignaler](../assets/img/en/level-appearance-sections.webp)

Med en [3D-bane](model-levels.md) indlæst viser panelet Baggrund / bane disse indstillinger. Standardværdierne er dem, en nyimporteret bane får ([`modelLevelFrom`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/LevelPanel.tsx), [`level.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts)). Ændrer du dem, tegnes scenen kun om; varmeakkumuleringen beholdes.

## Hele banen {#the-whole-level}

| Indstilling | Standard | Interval | Betydning |
|---|---|---|---|
| **Opacitet** | 100 % | 0-100 % | Under 100 % blandes banen og skriver ingen dybde, så den ikke længere [skjuler](depth-and-culling.md) varmen. |
| **Lysstyrke** | 0,9 | 0-2 (skyder 64) | |

Banen tegnes afmættet - grå jord, en tonet skal - så varmen er det eneste mættede på skærmen. I modsætning til et [kortbillede](map-images.md) har en 3D-bane ingen skyder for afmætning.

## Terrænrelief {#ground-relief}

Set langt væk ser en bakke og en slette ens grå ud, så viseren tilføjer tre hints. Hvert besvarer en anden fejl:

| Indstilling | Standard | Betydning |
|---|---|---|
| **Afstand mellem højdekurver** | ud fra jordens højdeinterval | Højden mellem højdekurverne, logaritmisk fra 1/4000 til 1/2 af banens højdeinterval; nederst på skinnen er det *fra*. Standarden er 1/40 af jordens højdeinterval afrundet til et 1/2/5-trin - 10 m-linjer passer til en skråning og er ubrugelige på en stenbrudsbund. Hver 5. linje tegnes stærkere. Højdekurver tegnes i skærmrummet, så de forbliver en pixel brede ved enhver zoom, og de er det eneste signal, der overlever jord, der er for flad til at skygge overhovedet. |
| **Højdekurvernes styrke** | 35 % | 0-100 % |
| **Hældningsskygge** | 55 % | Mørkner efter stejlhed, så skrænter og klipper læses fra enhver kameravinkel - i modsætning til et lys, der flader ud, når du vender mod det. |
| **Højderampe** | 50 % | Lavt terræn mørkere, højt terræn lysere, over jordens højdeinterval: den store form. |

Afsnittets overskrift viser højdekurvernes tilstand: *hver N m*, afstanden mellem højdekurverne, eller *ingen højdekurver*, når afstanden er fra.

## Jordoverflade {#ground-surface}

| Indstilling | Standard | Vises når | Betydning |
|---|---|---|---|
| **Vand** | til | banen har vand | Søer, floder og havet, tegnet fladt i en blegt blågrå: ingen af terrænsignalerne gælder for en overflade, der pr. definition er vandret. |
| **Vandets opacitet** | 60 % | Vand er til | Kystlinjen og jorden under de lave områder ses gennem gennemsigtigt vand. |
| **Jordens trekanter** | 30 % (0 for en bane med teksturer) | altid | Terrænets egne kanter tegnet over den skyggede overflade, der toner ud mellem 6 % og 25 % af banens bredde fra kameraet. Viser, hvor groft jorden blev samplet, og giver en skråning noget at bedømme afstand på. Bygges ved første brug, hvilket tager et øjeblik på en stor bane. |
| **Jord kun som wireframe** | fra | altid | Erstatter terrænoverfladen med dens kanter. Helt skematisk - den opgiver også skyggen, højdekurverne og dækningen, så *Jordens trekanter* er som regel det bedre valg. |
| **Jordtekstur** | til | banen har teksturer | Tegner jorden med de teksturer, filen indeholder (asfalt, rabat, græs). Mesh-belysningen lægges blidt ovenpå, fordi teksturen allerede har sin egen fine relief. **Lysstyrke** er måden at dæmpe den under varmen på; afmætning hører til kortbilleder. |
| **Optaget farve** | fra | banen har vertex-farver | Skygger jorden med den farve, en scanning optog i stedet for grå - en rekonstrueret vej kan ellers ikke skelnes fra rabatten. Motoreksporter har ingen; når de mangler, siger panelet *Denne bane har ingen farve.* |

## Strukturer {#structures}

Overskriften **Strukturer** viser antallet af strukturtrekanter; hintet nedenfor siger, hvordan de tegnes (*tegnet massivt i deres egne teksturer* eller *tegnet som en gennemsigtig skal, så du kan se varmen inde i dem*), og hvor mange dele der er strukturer.

| Indstilling | Standard | Betydning |
|---|---|---|
| **Strukturtekstur** | til, når strukturerne har teksturer | Tegn strukturer massivt, i deres egne teksturer. Tænder du den, sættes fladernes opacitet til 100 %, og kanterne slås fra; slår du den fra, vender den tilbage til den tonede gennemsigtige skal på 25 %. En tekstureret struktur belyses fra den side, kameraet ser, fordi et skilt er to flader ryg mod ryg, og hvilken af dem der vinder dybdetesten, afhænger af afrundingen. |
| **Wireframe-kanter** | til; fra over 300.000 strukturtrekanter eller når teksturer er til | Dubletfri kanter af strukturerne, én linje pr. kant. |
| **Kanternes opacitet** | 50 % | |
| **Skallens flader** | til | En svag flade med en lys Fresnel-kant, så en bygning læses som et volumen i stedet for et bur eller en tåge. |
| **Fladernes opacitet** | 25 % (35 % over 300.000 strukturtrekanter, 100 % med teksturer) | 0-60 % på skinnen, op til 100 % med håndtaget. Hold den lav: massive strukturer skjuler dataene inde i dem. |
| **Skarpe kanter** | til (fra når teksturer er til) | Skygger hver trekant ud fra dens egen normal, beregnet i fragmentshaderen ud fra skærmrumsafledede. Eksporterede baner er sammensvejsede og har gennemsnitlige normaler, som runder hvert kassehjørne af til "smeltet folie"; at dele hvert vertex for at rette det ville gange vertex-bufferen. Slå den fra for en bane, hvis buede flader betyder mere end dens hjørner. |
| **Strukturtone** | Cyan | En farvevælger og forudindstillingerne **Cyan**, **Rav**, **Violet**, **Hvid**. |
| **Vis delklassifikation (N)** | | Hver del, dens klasse og begrundelsen; se [3D-baner](model-levels.md#ground-structures-and-water). |

## Skæring af banen {#cutting-the-level}

[Udsnittet](slice.md) og, med *Skær også banen til*, [afstandsafskæring](depth-and-culling.md#distance-culling) skærer jorden, strukturerne og vandet ved de samme planer som varmen.
