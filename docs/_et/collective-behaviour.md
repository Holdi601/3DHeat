---
title: "Kollektiivne käitumine"
parent: "Tähelepanekud"
nav_order: 3
lang: "et"
source: "collective-behaviour.md"
source_hash: "bb95ded2346c"
translated: true
outdated: false
---

# Kollektiivne käitumine: rahvahulgad, parved, karjad ja otsused surve all

Mängijad mängus käituvad nagu inimesed igal pool: nad kogunevad uste juurde, järgivad seda, kes läks esimesena, püsivad koos või hajuvad, taanduvad rängade kaotuste järel ja võtavad pärast halba elu rohkem riske. **Käitumise läätse mõõdikud** mõõdavad neid mustreid rahvahulkade teaduse, kollektiivse liikumise füüsika, käitumusliku majanduse ja sõjalise psühholoogia meetoditega, igaüks oma nullmudeli vastu, ja loevad neid vastavate kirjete järgi [teadmistebaasist](knowledge.md).

## Proovi {#try-it}

1. Laadi üks või mitu mängu, kus on aeg, asukohad ja võistkonnad.
2. Ava **Tähelepanekud** ja käivita see.
3. Ava **Läätse mõõdikud**: käitumise mõõdikud on loendatud teiste kõrval (Kollektiivne joondumine, Marsruudikarjatamine, Rajad ja jäljed, Rahvahulk, Juhid ja järgijad, Ühtekuuluvus ja mahajääjad, Murdepunkt, Risk pärast kaotusi, Seeriad, Ostukokkulepe, Mahasurumine), igaüks oma arvude, testi ja seda selgitava kirjandusega.
4. **Kokkuvõte** viitab neile ja **Kirjuta TI-ga** saadab need aruandega.

## Mõõdikud {#the-measures}

Rajad võetakse uuesti proovile iga 2 s järel (positsioon segmendi lõpus ja kiirus selle üle). Kaugused skaalatakse andmete enda tüüpilise vahega - mediaankaugus üksusest lähima kaasmängijani -, nii et sama mõõdik töötab jalaväe, tankide ja lennukite puhul.

| Mõõdik | Mida mõõdetakse | Nullmudel ja test | Teadmised |
|---|---|---|---|
| Kollektiivne joondumine | Polarisatsioon (üksuste keskmise suuna pikkus) iga poole liikuvate üksuste kohta iga 2 s järel, keerlemine (pöörlemine raskuskeskme ümber), aja osa, mil oli polariseeritud, keerlev ja parveline, mängufaasi järgi; kahe joondunud poole vahelistes lahingutes parema joondumisega poole tapmisosa | Iga üksuse enda rada nihutatud ajas matši piires (säilitab tee, murrab samaaegsuse); märgivahetuse test 60 s akende üle | Vicsek 1995, Couzin 2002, Tunstrøm 2013 |
| Marsruudikarjatamine | Kui sageli üksus lahkub kohalt nii, nagu eelmine kaasmängija (30 s piires), sama sisenemisega, võrreldes koha enda väljumisosadega - ja vaenlase varasema läbimisega kopeerimisega | Väljumised segatud koha ja sissepääsu piires; efekt on kaasmängija miinus vaenlase kopeerimine (Manski peegeldusprobleem: kopeerimine ja poole jagatud plaan näevad sarnased välja) | Banerjee 1992, Bikhchandani et al. 1992, Manski 1993 |
| Rajad ja jäljed | Kahe suuna külgmine eraldumine kohtades, kus on vastusuunaline liiklus; liikumise osa 10% kõige hõivatumal maal, selle Gini ja mängude hõivatuima maa kattumine | Suunad segatud tervete külastuste vahel; kaks ruudustikku nihutatud poole koha võrra, igaüks testitud, Bonferroni | Helbing et al. 1997, 2005 |
| Rahvahulk | Kiirus (suhtes üksuse enda tempoga) ja voog naabrite arvu järgi kahe tüüpilise vahe piires, mahtuvuse langus kõige tihedamas klassis, kõige hõivatumal maal; surmad tunnis rahvahulkades; laskmised minutis lähedalolevate kaasmängijate poolt (sotsiaalne laiskus) | Iga üksuse enda kiiruse-tiheduse korrelatsioon, märgivahetus üksuste üle, miinimumefekt ρ üle ±0,05; täpsed määratestid | Helbing et al. 2000, Seyfried et al. 2005, Latané et al. 1979 |
| Juhid ja järgijad | Koos liikuvate kaasmängijate puhul ajaviide (kuni 8 s), mille juures ühe suund ennustab kõige paremini teise oma; juhtide graafik, triaadide transitiivsus, juhtide surma- ja tapmismäärad | Paarid, kus üks rada on ajas nihutatud, annavad 95% künnise; binoomtest 5% vastu | Nagy et al. 2010, Couzin et al. 2005 |
| Ühtekuuluvus ja mahajääjad | Aeg, mis on veedetud kaugemal kui kolm poole tüüpilist vahet lähimast kaasmängijast; surmamäär seal võrreldes grupiga; poole vahe võrreldes tema osaga lahingu tapmistest | Kahe Poissoni määra täpne tingimuslik test | Shils ja Janowitz 1948, Siebold 2007 |
| Murdepunkt | Lähenemiskiirus vastase poole (poole enda tempos) järgi poole osaga, mille ta kaotas viimases minutis; madalaim kaotustase, millel pooled taanduvad | Ühepoolne klastri bootstrap tempo kümnendiku taandumise vastu (kaotused tulevad kohas, kus pooled kohtuvad, ja pooled, mis kohtuvad, lõpetavad lähenemise), Bonferroni tasemete üle | Dupuy 1987, Rowland 2006 |
| Risk pärast kaotusi | Järgmise elu osa, mis kulub poole ees vaenlase suunas, üle poole enda osa ja muude sel ajal tagasi tulevate üksuste; pärast elu, mis kaotati ilma tapmiseta, võrreldes pärast ühte tapmisega; varajane surm pärast varajast surma (kalduvus) | Iga üksuse elud segatud (esimene elu säilib), nii et lõpliku järjestuse kallutatus on nullmudelis | Kahneman ja Tversky 1979, Thaler ja Johnson 1990 |
| Seeriad | P(tapmine pärast k tapmist) − P(tapmine pärast k surma), k = 1..3 | Iga mängija enda järjestus segatud 1000 korda: Milleri ja Sanjurjo näidatud kallutatus lahutatakse; Bonferroni k üle | Gilovich et al. 1985, Miller ja Sanjurjo 2018 |
| Ostukokkulepe | Fleissi κ varustuse vahemikel (eco, force, full; tertsiilid väljaspool Counter-Strike'i) poole voorus | Poole mängija-voorud segatud tema voorude vahel | Fleiss 1971 |
| Mahasurumine | Kiirus 4 s jooksul pärast mittetappvat kahju võrreldes 4 s enne seda ja laskmised 10 s jooksul pärast võrreldes enne, tabamustel ja sama üksuse rahulikel hetkedel | Märgivahetus üksuste üle, miinimumefektid 0,05 tempost ja üks laskmine minutis | Rowland 2006 |

Iga aruande p-väärtus läheb läbi Benjamini-Hochbergi väärdavastuste määra (`q`). Mõõdik jäetakse välja, kui andmed seda ei kanna: ostukokkuleppeks on vaja vooru ja varustuse väärtusi, mahasurumiseks kahjustusesündmusi, seeriate ja riski jaoks üksustele omistatud tapmisi ja surmi.

## Massanalüüsis {#in-the-mass-analysis}

Iga mängu kokkuvõte (`<match>.summary.json`, vt [Massanalüüs](mass-analysis.md)) kannab selle mängu samu mõõdikuid oma `behaviour` jaotises, nii et tuhandeid mänge saab võrrelda ilma nende ridu uuesti lugemata.

## Kui hästi see töötab {#how-well-it-works}

Simuleeritud lahingutel, kus iga efekt on sisse ehitatud, ja samadel maailmadel ilma selleta (`src/insights/behaviour/sim.ts`, `behaviour.test.ts`): iga mõõdik leiab oma sisseehitatud efekti ja nullmaailmad jäävad väärdavastuste künnisest allapoole. Riski pärast kaotusi võimsus on kõige madalam; marsruudikarjatamine ei suuda eristada kopeerimist jagatud plaanist (pool, millel on üks ühine eesmärk, on selle mõõdiku järgi "karjatamine").

## Arendajatele {#for-developers}

- `src/insights/behaviour/acc.ts` - akumulaator (uuesti proovile võetud rajad, sündmused, voorud) ja `finish`; `motion.ts` ja `choice.ts` on mõõdikud;
  `bstats.ts` permutatsiooni-, bootstrap- ja kappa abifunktsioonid; `shows.ts` mustrid ja laused, mida lääts loeb (`lens.<measure>`).
- `feed.ts` toidab seda tähelepanekute töötaja tükkidest; `summaryTap.ts` mängu kokkuvõttest, kui see tabelit voogedastab.
- Teadmised: `src/insights/knowledge/behaviour.ts` (kirjed), `patterns-behaviour.ts`, `refs-behaviour.ts` (viited, iga üks kontrollitud oma Crossrefi või Open Library kirjega).
- Sildid: `lens.metric.<measure>` failides `locales/*/lens.json`.
