---
title: "Banens utseende"
parent: "Baner og bakgrunnsgeometri"
nav_order: 3
lang: "no"
source: "level-appearance.md"
source_hash: "c883749baedd"
translated: true
outdated: false
---

# Nivåutseende

Disse kontrollene endrer hvordan et 3D-nivå ser ut, slik at varmen skiller seg ut fra det og du fortsatt kan lese stedet. Ingenting her endrer dataene.

## Rask start {#quick-start}

1. Last inn et 3D-nivå ([3D-nivåer](model-levels.md)).
2. Under **Bakgrunn / nivå**, senk **Lysstyrke** til varmen er det lyseste på skjermen.
3. Åpne **Terrengrelieff** og øk **Skråningsskygge** eller **Styrke på høydekurver** til du kan skille en høyde fra en slette.
4. Åpne **Strukturer**. Senk **Opasitet for flater** for å se inn i bygninger, eller slå på **Strukturtekstur** for å se dem som faste.
5. Hvis bakken har et bilde malt på seg, prøv **Bakketekstur** av og på.

![Seksjonene Terrengrelieff og Strukturer åpne, med nivået vist med relieffsignaler](../assets/img/en/level-appearance-sections.webp)

Når et [3D-nivå](model-levels.md) er lastet inn, viser panelet Bakgrunn / nivå disse kontrollene. Standardverdiene er de et nyimportert nivå får ([`modelLevelFrom`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/LevelPanel.tsx), [`level.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts)). Å endre dem tegner bare scenen på nytt; varmeakkumuleringen beholdes.

## Hele nivået {#the-whole-level}

| Kontroll | Standard | Område | Betydning |
|---|---|---|---|
| **Opasitet** | 100 % | 0–100 % | Under 100 % blir nivået blandet og skriver ingen dybde, så det ikke lenger [okkluderer](depth-and-culling.md) varmen. |
| **Lysstyrke** | 0,9 | 0–2 (jog 64) | |

Nivået tegnes avmettet – grå bakke, et farget skall – så varmen er det eneste mettede på skjermen. I motsetning til et [kartbilde](map-images.md) har et 3D-nivå ingen Avmett-skyveknapp.

## Terrengrelieff {#ground-relief}

Langt unna ser en ås og en slette like grå ut, så visningen legger til tre hint. Hvert svarer på en annen svikt:

| Kontroll | Standard | Betydning |
|---|---|---|
| **Ekvidistanse** | fra bakkens høydeområde | Høyde mellom høydekurvene, logaritmisk fra 1/4000 til 1/2 av nivåets høydeområde; nederst på sporet er den *av*. Standarden er 1/40 av bakkens høydeområde, avrundet til et trinn på 1/2/5 – 10 m-linjer passer for en åssida og er ubrukelige på en steinbruddbunn. Hver 5. linje tegnes sterkere. Høydekurver tegnes i skjermrom, så de forblir én piksel brede ved all zoom, og de er det eneste signalet som overlever bakke som er for flat til å skygges i det hele tatt. |
| **Styrke på høydekurver** | 35 % | 0–100 % |
| **Skråningsskygge** | 55 % | Mørkner etter bratthet, så skråninger og klipper leses fra alle kameravinkler – i motsetning til et lys, som flater ut bildet hver gang du vender mot det. |
| **Høyderampe** | 50 % | Lav bakke mørkere, høy bakke lysere, over bakkens høydeområde: den store formen. |

Seksjonens overskrift viser tilstanden for høydekurvene: *hver N m*, ekvidistansen, eller *ingen høydekurver* når ekvidistansen er av.

## Bakkeoverflate {#ground-surface}

| Kontroll | Standard | Vises når | Betydning |
|---|---|---|---|
| **Vann** | på | nivået har vann | Innsjøer, elver og havet, tegnet flatt i en blek blågrå: ingen av terrengsignalene gjelder for en flate som er jevn per definisjon. |
| **Opasitet for vann** | 60 % | Vann er på | Kystlinjen og bakken under de grunne partiene skinner gjennom gjennomsiktig vann. |
| **Bakketrekanter** | 30 % (0 for et nivå med tekstur) | alltid | Terrengets egne kanter tegnet over den skyggelagte flaten, og de blekner mellom 6 % og 25 % av nivåets bredde fra kameraet. Viser hvor grovt bakken er samplet, og gir en skråning noe å bedømme avstand ut fra. Bygges ved første bruk, noe som tar et øyeblikk på et stort nivå. |
| **Bakken bare som trådmodell** | av | alltid | Erstatter terrengoverflaten med kantene. Helt skjematisk – den gir også opp skyggeleggingen, høydekurvene og okklusjonen, så *Bakketrekanter* er vanligvis det bedre valget. |
| **Bakketekstur** | på | nivået har teksturer | Tegner bakken i de teksturene filen bærer (asfalt, veikant, gress). Mesh-belysningen legges på forsiktig over, fordi teksturen allerede har sitt eget fine relieff. **Lysstyrke** er måten å dempe den under varmen på; Avmett hører hjemme til kartbilder. |
| **Registrert farge** | av | nivået har fargeverdier per toppunkt | Skygger bakken med fargen en skanning registrerte i stedet for grått – en rekonstruert vei kan ellers ikke skilles fra veikanten. Motoreksporter har ingen; når den mangler, sier panelet *Dette nivået har ingen farge.* |

## Strukturer {#structures}

Overskriften **Strukturer** viser antall trekanter i strukturene; hintet under sier hvordan de tegnes (*tegnet fast i sine egne teksturer* eller *tegnet som et gjennomsiktig skall slik at du kan se varmen inni dem*) og hvor mange deler som er strukturer.

| Kontroll | Standard | Betydning |
|---|---|---|
| **Strukturtekstur** | på når strukturene bærer teksturer | Tegn strukturene faste, i sine egne teksturer. Når den slås på, settes opasiteten for flatene til 100 % og kantene slås av; når den slås av, går det tilbake til det fargede gjennomsiktige skallet på 25 %. En strukturert del blir belyst fra siden kameraet ser, fordi et skilt er to flater rygg mot rygg, og hvilken som vinner dybdetesten, avhenger av avrunding. |
| **Trådmodellkanter** | på; av over 300 000 strukturtrekanter eller når strukturene har tekstur | Fjernede dubletter av strukturenes kanter, én linje per kant. |
| **Opasitet for kanter** | 50 % | |
| **Skallflater** | på | En svak flate med en lys Fresnel-kant, slik at en bygning leses som et volum og ikke som et bur eller en tåkebank. |
| **Opasitet for flater** | 25 % (35 % over 300 000 strukturtrekanter, 100 % med tekstur) | 0–60 % på sporet, opptil 100 % med håndtaket. Hold den lav: faste strukturer skjuler dataene inni dem. |
| **Skarpe kanter** | på (av når den har tekstur) | Skygger hver trekant etter sin egen normal, beregnet i fragmentshaderen fra skjermromsderivater. Eksporterte nivåer er sveiset sammen og har gjennomsnittlige normaler, som runder av hvert boksehjørne til «smeltet folie»; å dele hvert toppunkt for å rette det ville multiplisert toppunktbufferen. Slå den av for et nivå der de buede flatene betyr mer enn hjørnene. |
| **Strukturfarge** | Cyan | En fargevelger og forhåndsinnstillingene **Cyan**, **Rav**, **Fiolett**, **Hvit**. |
| **Vis delklassifisering (N)** | | Hver del, dens klasse og begrunnelsen; se [3D-nivåer](model-levels.md#ground-structures-and-water). |

## Å skjære nivået {#cutting-the-level}

[Skiven](slice.md) og, med *Skjær også nivået*, [avskjæring etter avstand](depth-and-culling.md#distance-culling) skjærer bakken, strukturene og vannet ved de samme planene som varmen.
