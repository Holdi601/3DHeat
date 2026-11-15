---
title: "Sõnastik"
nav_order: 21
lang: "et"
source: "glossary.md"
source_hash: "235c4c0eec6b"
translated: true
outdated: false
---

# Sõnastik

Lühikesed tähendused selle saidi sõnadele lihtsas keeles. Iga kirje viitab lehele, mis seda täielikult selgitab.

## Andmed {#data}

**Rida.** Üks rida sinu andmetes: üks asi, mis juhtus ühes kohas ja ajal, näiteks "mängija 7 oli siin 12. sekundil". Vaataja joonistab iga rea. [Andmevormingud](data-formats.md)

**Veerg.** Üks väärtuse liik ridades, nagu x, y, z, aeg või võistkond. Vaataja arvab, milline veerg on milline, ja sa saad seda arvamust muuta. [Veergude kaardistus](column-mapping.md)

**CSV.** Lihtne tekstitabel: üks rida real, väärtused eraldatud komadega. Peaaegu iga programm oskab seda kirjutada. [Failide laadimine](loading-files.md)

**Parquet.** Kompaktne tabelifail, mida on kiire lugeda isegi miljonite ridadega. See on parim vorming vaatajale anda. [Failide laadimine](loading-files.md)

**Sündmus.** Midagi, mis juhtus, nagu laskmine, tabamus, tapmine või õhkutõus. Rida võib olla sündmus või lihtsalt "olin siin". [Filtrid](filters.md)

**Isik.** See, kes ridu tegi: mängija, piloot, auto või tank. Üks isik on üks positsioonide joon läbi aja. [Seansid, isikud ja rühmad](sessions-persons-groups.md)

**Rühm (võistkond).** Isikute kogum, mis kuvatakse samas värvis, näiteks Sinine ja Punane. [Seansid, isikud ja rühmad](sessions-persons-groups.md)

**Seanss (mäng, voor).** Üks mängu käik. Mäng või voor on seanss. Vaataja saab näidata ühte seanssi või asetada mitu üksteise peale. [Seansid, isikud ja rühmad](sessions-persons-groups.md)

**Tase.** 3D-kaart, millel andmed juhtusid: maapind, hooned, seinad. Read ilmuvad sinna, kus nad toimusid, tasemel. [Tasemed ja taustageomeetria](levels.md)

## Andmete vaatamine {#looking-at-the-data}

**Soojuskaart.** Pilt, kus kohad, mida paljud read puudutavad, helendavad kuumemalt. Külmad kohad on vaiksed, kuumad kohad hõivatud. [Soojus](heat.md)

**Soojus.** Kui palju kohas juhtus. Vaataja liidab iga rea hõõgumise igas kohas; summa on soojus. [Soojus](heat.md)

**Sprait.** Väike helendav laik, mida vaataja joonistab ühele reale. Paljud kattuvad spraidid liituvad soojuseks. [Spraidi kuju](sprite-shape.md)

**Säritus.** Kui hele pilt on. Nagu kaamera, muudab liiga suur säritus kõik valgeks ja liiga väike peidab detailid. [Värv ja säritus](colour-and-exposure.md)

**Küllastus.** Soojuse kogus, mis loetakse "nii kuumaks, kui värvid ulatuvad". Langeta, et vaiksed kohad nähtavaks teha; tõsta, et näha ainult kõige kuumemat. [Värv ja säritus](colour-and-exposure.md)

**Maht.** Kast või kuju, mille paigutad 3D-vaatesse. Vaataja loeb, mis selle sees on, ja võib mahud omavahel võrrelda. [Mahud ja võrdlus](volumes.md)

**Filter.** Reegel, mis peidab read, mida sa ei taha, näiteks "ainult tapmised" või "ainult võistkond Punane". [Filtrid](filters.md)

## Taasesitus {#replay}

**Kuju.** Väike tanki, lennuki, auto või sõduri mudel, mis liigub sinna, kus andmed ütlevad, et see oli. [Kujud](figures.md)

**LOD (detailsuse tase).** Igal kujul on detailne, lihtsam ja väga lihtne versioon. Lähedased kasutavad detailset, kaugemad lihtsat, nii et tuhandeid saab korraga joonistada. [Kujud](figures.md)

## Võidusõit {#racing}

**Ring.** Üks sõit mööda rada, joonest tagasi joonde. [Ringide laadimine](race-loading-laps.md)

**Võrdlusring.** Ring, millega kõiki teisi võrreldakse. Erinevusi näidatakse kui "kiiremini" või "aeglasemalt" sellest. [Ringide laadimine](race-loading-laps.md)

**Tipp (apex).** Kurvi punkt, kus auto on kõige lähemal sisemisele servale. [Kurvi-haaval analüüs](race-corner-analysis.md)

**Libisemine.** Kui palju rehv libiseb. Väike libisemine annab kõige rohkem haardumist; liiga palju ja auto libiseb kõrvale. [Võidusõidu analüütika: meetod](race-analytics.md)

**Ümbrik.** Mida auto suudab igal kiirusel teha: kui jõuliselt ta suudab pöörata, pidurdada ja kiirendada enne libisemist. [Võidusõidu analüütika: meetod](race-analytics.md)

## Lennukinumbrid {#aircraft-numbers}

**ALT.** Kõrgus: kõrgus maapinnast või merepinnast. [Mängu taasesitus](match-replay.md#labels-and-statistics)

**TAS.** Tõene õhukiirus: kui kiiresti lennuk õhus liigub. [Mängu taasesitus](match-replay.md#labels-and-statistics)

## Arvuti {#computer}

**GPU.** Graafikakaart või kiip. See joonistab pildi ja on palju kiirem kui pearrotsessor miljonite laikude joonistamisel. [Kaks taustaprogrammi](backends.md)

**WebGPU / WebGL2.** Kaks viisi, kuidas brauser lubab lehel GPU-d kasutada. WebGPU on uuem. Vaataja võib kasutada kumbagi ja valib parima, mis sinu brauseris on. [Kaks taustaprogrammi](backends.md)

## Counter-Strike'i sõnad {#counter-strike-words}

**Voor.** Üks lühike lahing mängu sees. Üks pool võidab, ja skoor tõuseb ühe võrra.

**Eco, force buy, full buy.** Kui palju raha pool kulutab relvadele vooru alguses. Eco säästab raha ja ostab peaaegu midagi (keskmiselt alla 1500 $ mängija kohta). Force buy kulutab, mis tal on (alla 4000 $). Full buy ostab kõik, mida saab. [Mängu analüüs](match-analysis.md)

**Trade.** Tapmine, mis tasub tapmise eest tagasi: sind tulistatakse ja kaasmängija tulistab su tapjat 5 sekundi jooksul. [Mängu analüüs](match-analysis.md)

**KAST.** Vooride osa, milles mängija tegi tapmise, abistas, jäi ellu või oli trade. Suurem number tähendab, et mängija aitas rohkemates voorudes. [Mängu analüüs](match-analysis.md)

**ADR.** Keskmine kahju vooru kohta: kui palju elu mängija võttis vaenlastelt igas voorus. [Mängu analüüs](match-analysis.md)
