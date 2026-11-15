---
title: "Sõnastik"
nav_order: 21
lang: "et"
source: "glossary.md"
source_hash: "8766ecb57c96"
translated: true
outdated: true
---

# Sõnastik

Selle saidi sõnade lühikesed tähendused lihtsas keeles. Igal kirjel on link lehele, mis seda täielikult selgitab.

## Andmed {#data}

**Rida.** Üks rida sinu andmetes: üks asi, mis juhtus ühes kohas ja ajal, näiteks "mängija 7 oli siin 12. sekundil". Vaatur joonistab iga rea. [Andmevormingud](data-formats.md)

**Veerg.** Üks väärtuse liik ridades, näiteks x, y, z, aeg või meeskond. Vaatur oletab, milline veerg on milline, ning sa saad oletust muuta. [Veergude seostamine](column-mapping.md)

**CSV.** Lihtne tekstitabel: üks rida real, väärtused eraldatud komadega. Peaaegu iga programm oskab seda kirjutada. [Failide laadimine](loading-files.md)

**Parquet.** Kompaktne tabelifail, mida on kiire lugeda, isegi miljonite ridadega. See on parim vorming vaaturile. [Failide laadimine](loading-files.md)

**Sündmus.** Miski, mis juhtus, näiteks lask, tabamus, tapmine või õhkutõus. Rida võib olla sündmus või lihtsalt "ma olin siin". [Filtrid](filters.md)

**Isik.** See, kes ridu tegi: mängija, piloot, auto või tank. Üks isik on üks positsioonide joon ajas. [Sessioonid, isikud ja rühmad](sessions-persons-groups.md)

**Rühm (meeskond).** Hulk isikuid, mida näidatakse samas värvis, näiteks Sinine ja Punane. [Sessioonid, isikud ja rühmad](sessions-persons-groups.md)

**Seanss (matš, voor).** Üks mängu käik. Matš või voor on seanss. Vaatur saab näidata ühte seanssi või laduda palju üksteise peale. [Sessioonid, isikud ja rühmad](sessions-persons-groups.md)

**Tase.** 3D-kaart, kus andmed juhtusid: maapind, hooned, seinad. Read ilmuvad tasemel sinna, kus nad juhtusid. [Tasemed ja taustgeomeetria](levels.md)

## Andmete vaatamine {#looking-at-the-data}

**Soojuskaart.** Pilt, kus kohad, mida paljud read puudutavad, helendavad kuumemalt. Külmad kohad on vaiksed, kuumad kohad on hõivatud. [Soojus](heat.md)

**Soojus.** Kui palju kohas juhtus. Vaatur liidab iga rea hõõgu igas kohas; summa on soojus. [Soojus](heat.md)

**Spraid.** Väike hõõguv laik, mille vaatur joonistab ühele reale. Paljud kattuvad spraidid liituvad soojuseks. [Kujundi kuju](sprite-shape.md)

**Säritus.** Kui hele pilt on. Nagu kaameral: liiga palju säritust muudab kõik valgeks ja liiga vähe peidab detailid. [Värv ja säritus](colour-and-exposure.md)

**Küllastus.** Soojuse hulk, mis loetakse "nii kuumaks, kui värvid lähevad". Alanda seda, et vaiksed kohad nähtavaks teha; tõsta seda, et näha ainult kõige kuumemaid. [Värv ja säritus](colour-and-exposure.md)

**Maht.** Kast või kuju, mille paigutad 3D-vaates. Vaatur loeb, mis selle sees on, ja võib mahud omavahel võrrelda. [Mahud ja võrdlus](volumes.md)

**Filter.** Reegel, mis peidab soovimatud read, näiteks "ainult tapmised" või "ainult meeskond Punane". [Filtrid](filters.md)

## Kordus {#replay}

**Kuju.** Väike mudel tankist, lennukist, autost või sõdurist, mis liigub sinna, kus andmed ütlevad, et ta oli. [Kujud](figures.md)

**LOD (detailsustase).** Igal kujul on detailne, lihtsam ja väga lihtne versioon. Lähedased kasutavad detailset ja kauged lihtsat, nii et tuhandeid saab joonistada korraga. [Kujud](figures.md)

## Võidusõit {#racing}

**Ring.** Üks käik ümber raja, joonest tagasi joonele. [Ringide laadimine](race-loading-laps.md)

**Võrdlusring.** Ring, millega kõiki teisi võrreldakse. Erinevused näidatakse kui "kiirem" või "aeglasem" sellest. [Ringide laadimine](race-loading-laps.md)

**Tipp.** Kurvi punkt, kus auto on kõige lähemal sisemisele servale. [Kurv-kurvilt analüüs](race-corner-analysis.md)

**Libisemine.** Kui palju rehv libiseb. Veidi libisemist annab kõige rohkem haardumist; liiga palju ja auto libiseb. [Sõidu analüütika: meetod](race-analytics.md)

**Ümbrik.** Mida auto suudab igal kiirusel: kui kõvasti ta suudab pöörata, pidurdada ja kiirendada enne libisemist. [Sõidu analüütika: meetod](race-analytics.md)

## Lennuki numbrid {#aircraft-numbers}

**ALT.** Kõrgus: kõrgus maapinnast või merepinnast. [Matši kordus](match-replay.md#labels-and-statistics)

**TAS.** Tõeline õhukiirus: kui kiiresti lennuk õhus liigub. [Matši kordus](match-replay.md#labels-and-statistics)

## Arvuti {#computer}

**GPU.** Graafikakaart või -kiip. See joonistab pildi ja on miljonite hõõgude joonistamisel palju kiirem kui peaprotsessor. [Kaks renderdajat](backends.md)

**WebGPU / WebGL2.** Kaks viisi, kuidas brauser lubab lehel GPU-d kasutada. WebGPU on uuem. Vaatur saab kasutada kumbagi ja valib parima, mida sinu brauser pakub. [Kaks renderdajat](backends.md)

## Counter-Strike sõnad {#counter-strike-words}

**Voor.** Üks lühike lahing matši sees. Üks pool võidab selle ja skoor tõuseb ühe võrra.

**Eco, force buy, full buy.** Kui palju raha pool kulutab relvadele vooru alguses. Eco hoiab raha ja ostab peaaegu midagi (keskmiselt alla 1500 dollari mängija kohta). Force buy kulutab, mis tal on (alla 4000 dollari). Full buy ostab kõik, mida saab. [Matšianalüüs](match-analysis.md)

**Trade.** Tapmine, mis tasub tapmise eest: sind tulistatakse ja kaaslane tulistab su tapjat 5 sekundi jooksul. [Matšianalüüs](match-analysis.md)

**KAST.** Osa voorudest, milles mängija tegi tapmise, abistas, jäi ellu või tehti trade. Kõrgem arv tähendab, et mängija aitas rohkemates voorudes. [Matšianalüüs](match-analysis.md)

**ADR.** Keskmine kahju vooru kohta: kui palju tervist mängija vooru jooksul vaenlastelt võttis. [Matšianalüüs](match-analysis.md)
