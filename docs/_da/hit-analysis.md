---
title: "Træfanalyse (fanen Køretøjer)"
parent: "Replay"
nav_order: 4
lang: "da"
source: "hit-analysis.md"
source_hash: "8e9221927522"
translated: true
outdated: false
---

# Træfanalyse

Fanen **Køretøjer** viser, hvor én tank, ét skib eller én soldat blev ramt, og af hvem. Brug den til at se, hvilken side af en tank der bliver skudt, eller hvilken fjende der gør skaden.

## Prøv det {#try-it}

1. Indlæs en kamp, der har træffere (se tabellen nedenfor for, hvilke spil der giver dem).
2. Åbn fanen **Køretøjer** øverst.
3. Under **Køretøj** vælger du en enhed, for eksempel en tanktype. Tallet i parentes er, hvor mange træffere den tog.
4. Læs figuren: hvert mærke er en træffer, placeret der, hvor den ramte.
5. Åbn **Hvem ramte** for at se skytterne, våbnene eller skytternes køretøjer, med træffere, skade, drab og afstand.

![Fanen Køretøjer: en demotank med træfmærker, og Hvem ramte åben](../assets/img/en/hit-analysis-tank.webp)

Er intet indlæst, eller har dataene ingen træffere på køretøjer, siger fanen, hvad der mangler, og hvilken konverter der skal bruges.

```
        skytte ----> o  træfmærke på figuren
        skytte ----> o
  [ tankfigur ]
```

Figuren viser træfferne, hvor dataene giver et punkt eller en kropsdel. Opdelingen (hvem ramte den, med hvad, hvor hårdt, fra hvor langt) virker for alle kilder.

## Hvad hver kilde giver {#what-each-source-gives}

| Kilde | Punkt på enheden | Skytte | Våben | Skade / udfald |
|---|---|---|---|---|
| War Thunder | ja, i enhedens koordinatsystem, med skuddets retning | ja | skytternes køretøj | kritisk, alvorlig, moduler ødelagt, dræbende skud |
| CS2 | kropsdel (hitgroup) | ja | ja | skade, panser, resterende liv |
| World of Tanks | ja (komponentboks, indgang og udgang) | ja | - | skade eller ingen (afprall, ingen gennemtrængning) |
| World of Warships | ja, i skibets koordinatsystem | ja | træffertype | - |
| Squad | køretøjer: ja - nedslaget placeret i køretøjets koordinatsystem ud fra dets egen position og kurs | nej (dataene nævner ingen) | skadetypen | faldet i køretøjets liv på det tidspunkt, ødelagt |
| Squad-soldater | nej: træffens resultater (knogle og nedslagspunkt) holdes rå af konverteren; rækker `impact` med `hitBone` læses, så snart den skriver dem | | | sår og dødsfald alene |
| Arma (OCAP, Arma 3-optageren) | nej: OCAP registrerer, hvem der ramte eller dræbte hvem, med hvad, fra hvor langt, ikke hvor | ja | ja | træffer eller drab, afstand |
| Tacview ACMI | ja, hvor et våbenobjekt ender inden for 30 m fra en enhed (ikke dens affyrer): dets sidste sted i enhedens koordinatsystem (kurs, hældning, rulning), kommende den vej det fløj | våbnets `Parent` | våbnets navn, eller en Timeouts AmmoType | Timeouts Outcome, fald i `Health`, `Destroyed`; uden våben et drab eller en skade uden punkt |
| IL-2-telemetri (Watcher) | ja: `hit` / `damage`-hændelser bærer punktet i spillerens eget flys koordinatsystem (taget som x frem, y op, z højre) | nej | nej | styrken |
| Dota 2 | nej: kamploggen har intet sted på en helt | den angribende enhed | evnen eller genstanden (ingen: et angreb) | skade, heltens død |
| Battlefield 6 (GameCapture) | nej: optagelsen læser dræbersfeedet (drab, dødsfald, headshot-flag), ikke træffere | | | |
| DCS / andre Watcher-livekilder | ingen træffehændelser ud over hvad deres Tacview-optagelser indeholder | | | |

Hvor ingen træffer på enheden har et punkt, viser figuren ingen mærker, og opdelingen **Hvem ramte** åbner sig selv: efter skytte, våben eller skytternes køretøj, hver med sine træffere, skade og drab, samt median- og længste afstand.

## Begræns til et område {#restrict-to-an-area}

Afsnittet **Område** begrænser analysen til træffere, der skete et sted på kortet.

1. Tryk på **Tegn firkant** eller **Tegn polygon**, og tegn på den 3D-jord eller det taktiske kort.
2. Vælg **Offer indenfor** (tæl en træffer, når den ramte enhed var i området) eller **Skytte indenfor** (når den, der skød, var).
3. Tryk på **Brug dem som filter**. Brikkerne viser "{n} af {total} træffere i området".
4. **Nulstil område** fjerner alle områder.

Hvert område er et [volumen](volumes.md), så de samme former også filtrerer varmekortet og replayet. Et område kan medtage eller udelukke (et udelukkende område lader sine træffere ude, vist som "{n} af {total} træffere uden for området"). Hvert område vises som en brik med, hvor mange af enhedens træffere der var i det; krydset på en brik fjerner den. Tallene, figuren, opdelingen og filterlisterne følger alle med.

En træffers steder: rækken den kom fra holder den ene parts sted (offerets for en skade eller et stik, skytternes for et skud); den andens er den enheds egen måling tættest i tid (inden for 5 s). En træffer, hvis parts sted ikke kendes, udelades, mens et område filtrerer, og panelet siger, hvor mange ("Udeladt, intet kendt sted").

## For udviklere {#for-developers}

Enhver konverter kan tilføje træffere: en offerrække (`hit`, `impact`, `hurt`, `wounded`) med `hitBone` (et skeletben, en Arma-selektion, en Reforger-trefzone - kortlagt til hoved, bryst, mave, arme og ben) eller `hitLocalX/Y/Z` (meter, x frem, y op, z højre), med `other` som skytten og `damage`.
