---
title: "Shumë ndeshje njëherësh"
parent: "Riluajtja"
nav_order: 2
lang: "sq"
source: "many-matches.md"
source_hash: "a37a7b4cf8c2"
translated: true
outdated: false
---

# Shumë ndeshje njëherësh

**Shumë ndeshje njëherësh** luan shumë ndeshje mbi njëra-tjetrën, kështu që sheh ku shkojnë zakonisht lojtarët e çdo ndeshjeje. Përdore për të krahasuar qindra ose mijëra ndeshje në një figurë.

Çdo ndeshje nis nga fillimi i vet dhe njësitë e saj lëvizin si figura. Skedarët shkojnë drejt në kartën grafike dhe nuk ndërtohet asnjë tabelë e plotë, kështu që luan rrjedhshëm aty ku një ngarkim normal do të mbaronte memorien.

![Dhjetë ndeshje tankesh të vendosura njëra mbi tjetrën, një ngjyrë për ndeshje](../assets/img/sq/many-matches.webp)

## Si ta përdorësh {#how-to-use-it}

1. Hap **Shumë ndeshje njëherësh** në shiritin anësor të Heatmap.
2. Shtyp **Skedarë…** (zgjidh shumë skedarë), **Dosje…** (një dosje dhe nënndosjet e saj) ose **Shto dosje…** (shto në atë që është ngarkuar).
3. Shikuesi kalon te mbivendosja e figurave dhe nis nga fillimi. Shtyp **Luaj**.

Çdo skedar është një ndeshje (ose mban disa). Funksionojnë skedarët Parquet dhe kontejnerët [`.3dheat`](container.md). Një skedar ka nevojë për një kolonë pozicioni, një kohe dhe një njësie; kolonat e emrit, llojit dhe anës mbahen. Skedarët e tjerë, dhe skedarët anësorë të konvertuesve (fluturimi, mesazhet, ngjarjet, bisedat, objektivat), kapërcehen. Për një tabelë normale, shih [Marrja e të dhënave](getting-data-in.md).

## Cilësimet {#settings}

| Cilësimi | Çfarë bën |
|---|---|
| **Sipas ekipit** / **Sipas ndeshjes** | Ngjyros sipas krahut, ose një ngjyrë për ndeshje. |
| **Shëno ku vdiqën njësitë** | Një shenjë aty ku vdiq secila njësi, për 10 s, 30 s, 120 s, ose të gjitha deri tani. |

Paneli tregon sa ndeshje, njësi, rreshta dhe pozicione u lexuan, memorien e përdorur dhe kohën e ngarkimit. *Vend për* është sa pozicione të tjera mund të mbajë ende karta grafike. *Figura nga* është madhësia në ekran nën të cilën një njësi vizatohet si një shigjetë e vogël në vend të figurës së saj.

Pamja e figurave përdor të njëjtat kontrolle si [riprodhimi i ndeshjes](match-replay.md#figures): **Madhësia e figurës**, **Figura më e vogël në ekran** dhe **Nga larg**.

## Këshilla {#tips}

- Kur gjithçka nuk do të hynte në memorie, pozicionet holloren (mbahet vetëm një pozicion në çdo disa metra) dhe paneli e thotë këtë.
- Modalitetet e nxehtësisë funksionojnë edhe mbi të dhënat e mbivendosjes.
- Për statistika mbi mijëra ndeshje pa i vizatuar, shih [Analizën masive](mass-analysis.md).
