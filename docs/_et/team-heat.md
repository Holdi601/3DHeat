---
title: "Võistkondade soojus"
parent: "Soojusrežiimid"
nav_order: 6
lang: "et"
source: "team-heat.md"
source_hash: "e30b8372464b"
translated: true
outdated: false
---

# Võistkondade soojus

Võistkondade soojus näitab, kus iga võistkond oli, igal võistkonnal oma värv. Kus võistkonnad kattuvad, segunevad värvid.

**Võistkondade soojus** (klahv 3) on [Soojuse](heat.md) tihedusväli, kus igale [rühmale](glossary.md) on antud oma toon. Kus rühmad kattuvad, segunevad nende toonid; võrdne võistlus tuleb neutraalne. Läbipaistmatus kannab tihedust endiselt täpselt nagu teistes režiimides, nii et pilt vastab korraga küsimustele *kui palju* ja *kelle oma*. See vajab rühmaveergu.

![Võistkondade soojus: iga pool oma värvis; kus nad kattuvad, segunevad värvid](../assets/img/et/heat-teams.webp)

See ei ole [kujude ülekate](box-replay.md): too joonistab ühe kuju isiku kohta; see on soojusväli, mida värvib sama veerg.

## Kuidas seda kasutada {#how-to-use-it}

1. Vajuta `3` (või vali režiimiribal **Võistkondade soojus**).
2. Ava **Soojuse värvid**. Värvitükid näitavad iga rühma värvi; võistkonna nime näed, kui hoiad tüki kohal.
3. Kui kõik näib hall, tõsta **Värvide eraldus**.
4. Eemalda linnuke rühma juurest [Võistkondade loendis](teams-list.md), et see välja jätta; teised värvid jäävad oma kohale.

## Juhtnupud {#controls}

Jaotises **Soojuse värvid**:

| Juhtnupp | Vaikimisi | Tähendus |
|---|---|---|
| Värvitükid | | Iga rühma värv esimese 12 rühma jaoks, siis *+N veel*. Kursori hoidmine näitab rühma nime ja värvi. |
| **Värvide eraldus** | 1,4 | Kui kaugele segu neutraalsest hallist nihutatakse, 0-4. 0 teeb kõik halliks; 1 on tõeline keskmine; umbes 2 kohal lähevad heledaimad segud näidatavast vahemikust välja ja neid piiratakse kanalite kaupa, mis nihutab nende tooni. |
| **Läbipaistmatuse skaala (värv tuleb rühmalt)** | soojusskaala vaikeväärtus | Kasutatakse ainult skaala **alfat**: läbipaistev seal, kus midagi pole, ja läbipaistmatu ülaosas. Selle värve ei arvestata. |

Kõik teised soojuse juhtnupud - kuju, küllastus, vastus, minimaalne soojus, sügavus, eemaldamine - töötavad nagu jaotises [Soojus](heat.md).

[Võistkondade loend](teams-list.md) näitab selles režiimis iga rühma võistkonnasoojuse värvi oma tükina. Rühma peitmine jätab kõigi teiste rühmade värvi oma kohale: toonid tulevad rühmade koguarvust, mitte sellest, mis on sisse lülitatud, nii et kaks pilti jäävad võrreldavaks.

## Palett {#the-palette}

Allikas [`colors.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/colors.ts):

- Värvid asuvad **Oklabi** värvitasandil fikseeritud heledusel (0,7) ja kroomal (0,115), nii et iga rühm on võrdselt hele ja punane rühm ei tundu soojemana kui sinine.
- *n* rühma korral jagatakse toonide ring *n* võrdseks osaks ja rühm *i* võtab oma osa **keskpunkti**, `(i + 0,5) / n` ringi pööret. Mis tahes kaks rühma on üksteisest nii kaugel, kui arv lubab, ja vastandid jäävad vastandiks, olenemata arvust.
- Kasutatakse kuni **16** erinevat tooni. Rohkema rühma korral paigutatakse id korduva poolitamisega (bitipeegeldatud id: 0, ½, ¼, ¾, ⅛, …), nii et kõrvuti olevad id ei jaga tooni; üle 16 rühm jagab paratamatult.
- Rühm, mille silt tähendab "rühma pole" - `0`, tühi, `none`, `unknown`, `null` või `-1`, suurtähtedest hoolimata - joonistatakse **neutraalse hallina**, selle asemel et võtta osa ringist. Ainult esimene selline silt rühmanimekirjas käsitletakse nii.

Vaikimisi eraldus on 1,4, mitte 1, sest 1 juures on viie ühtlaselt jaotatud tooni segu *tegelikult* hall: õige ja loetamatu. Natuke üle 1 hoiab võrdsed seisud ausa ja teeb nähtavaks 60/40 jaotuse.

## Kuidas see töötab {#how-it-works}

Selles režiimis on soojussihtmärgil neli kanalit. Iga spraid lisab oma tiheduse *v* esimesse kanalisse ja *v* × rühma Oklabi *a* ja *b* koordinaadid teise ja kolmandasse. Kompositsiooni ajal on pikseli segu tiheduse järgi kaalutud keskmine: *a* = G / R, *b* = B / R, skaleeritud värviseraldusega ja teisendatud sRGB-ks palett'i heledusel. Jagamine akumuleeritud tihedusega hoiab tooni sõltumatuna sellest, kui palju andmeid on, ja seepärast jätkavad kõik tiheduse juhtnupud tegutsemist ainult läbipaistvusel.

Neljakanaliline sihtmärk maksab sama eraldusvõimega neli korda rohkem GPU mälu kui ühekanaliline soojussihtmärk.
