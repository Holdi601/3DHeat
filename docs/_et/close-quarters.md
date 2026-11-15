---
title: "Lähivõitlus ja voorud"
parent: "Tähelepanekud"
nav_order: 2
lang: "et"
source: "close-quarters.md"
source_hash: "0469351f7e99"
translated: true
outdated: false
---

# Lähivõitlus ja voorud

Voorupõhiste laskurite puhul (Counter-Strike esimesena, iga andmestik, millel on voorud, pooled ja tapmised) mõõdab Tähelepanekud, kuidas lahingud võideti:
kes võtsid avalahingud ja mis need väärt olid, kas surmu vahetati, kas mängija, kes nurga taha tormas, võitis selle, kes seal hoidis, kas ristlasud ja
pimestamised tasusid end ära, kuidas voorusahkrud muutusid iga tapmisega ja millised uksed tapsid need mängijad, kes neist sisenesid. Kasuta seda,
et näha, miks voorud võideti, mitte ainult seda, kes tapmised sai.

Mõõdikud tulevad ruumide puhastamise ja linnadoktriinist (saatuslik lehter, domineerimise punktid, ristlasu) ning esporti ja spordianalüütikast
(võidutõenäosus, tegevuste väärtus, kohandatud pluss-miinus). Igat neist loetakse [teadmiste läätse](knowledge.md) kaudu ja tsiteeritakse.

## Proovi {#try-it}

1. Laadi üks või mitu matši voorudega (CS2 konverteering on kõik, mida vaja).
2. Ava **Tähelepanekud** ja vajuta **Leia tähelepanekuid**.
3. Jaotises **Läätse mõõdikud** loe read alates *Vooru võidutõenäosus* kuni *Mängija mõju*; igaühel on arvud, 95% intervall, q-väärtus ja allikad, mida see järgib.
4. Vali **E-sport** või **Linnalahing** läätsed, et neid selle kirjanduse kaudu lugeda; **Kirjuta TI-ga** saadab need aruandega.

## Mida see mõõdab {#what-it-measures}

| Mõõdik | Mida see ütleb | Kuidas |
|---|---|---|
| Vooru võidutõenäosus | Kui tõenäoline oli iga pool voru võita igal hetkel | Logistiline regressioon pooltel elusatel mängijatel, pomm või eesmärk ja selle aeg, vooru kell ja ost, sobitatud laaditud andmetele; kalibreerimine kontrollitud voorude kaupa väljaspool sobitust (Brieri skoor ja oskus, logaritmiline kaotus, kalibreerimisviga kümne vahemiku üle, ümberkalibreerimise kalle, AUC) |
| Tegevuste väärtus | Kui palju tapmine, avatapmine, vahetus, tapmine pimestamise taga, paigaldus või pimestamine muutis poole võimalust võita | Võidutõenäosus pärast miinus enne; vahetused, avatapmised ja pimestatud tapmised testitud teiste tapmiste vastu permutatsiooniga |
| Avalahingud | Milline pool võidab esimese duelli, kui tihti see võidab vooru, ja kus üks pool võidab avad palju üle oma keskmise | Wilsoni intervallid; kohad täpse binoomtestiga poole osa vastu, q kohtade üle |
| Vahetused | Surmad, millele vastas kaaslase tapmine tapjast 5 s jooksul, aeg, mis selleks kulus, ja voorud, mis võideti, kui esimene surm vahetati | Fisheri täpne test, Newcombe'i intervall |
| Kiigutaja vs hoidja | Duellid, kus üks mängija liikus lahingusse (1,5 m/s või rohkem viimase sekundi jooksul) ja teine seisis paigal (0,75 m/s või vähem): kiigutaja osa | Täpne binoomtest poole vastu |
| Sihtimine enne duelli | Iga mängija vaade võrreldes suunaga teise suunas 0,75 s enne tapmist; kes oli paremini sihitud ja kui tihti see mängija võitis; hoidjad oma nurgas (15° piires) vs väljaspool seda; tapmiste ulatused | Täpne binoomtest; Fisher |
| Ristlasu | Hoidjad, kellel on seisev kaaslane 25 m piires kiigutajast, kelle joon sinna on 35° või rohkem oma joonest kõrvale, vs hoidjad üksi | Fisher, Newcombe |
| Abivahendid sissetungides | Kiigutajad oma poole pimestava välgu taga (3 s ja 15 m piires) või suitsu taga (18 s piires) vs kuivad kiigutused; avatapmised, kus välk on ainult ühel pool; pimestatud ohvrid | Fisher, binoom |
| Mehe eelis | Iga elusate mängijate seisu jaoks (5v4, 4v5, 2v1...), mis esmakordselt saavutati voorus, poolt võidetud voorude osa sellest seisust | Wilsoni intervallid |
| Kliutšid | Voorud, kus pool jõudis oma viimase mängijani: võidud vs mudeli oodatud võidud, vastaste arvu järgi | Normaaltest täheldatud vs oodatud |
| Kuhjamised, rotatsioonid, varitsused | Suurim grupp 10 m piires avaduelli ajal (3 või rohkem: kuhjatud); mängijad üle 30 m esimesest lahingust või paigaldatud eesmärgist ja kui kiiresti nad jõuavad 12 m piirde; aeg ja tapmise ja surma šansid üle 30 m igast kaaslasest | Fisher; šansi suhe Woolfi intervalliga |
| Pärast paigaldust ja tagasivõitu | Paigaldava poole võidetud voorud paigaldamise arvude järgi ja tema osa duellidest pärast paigaldust | Wilsoni intervallid |
| Saatuslikud lehtrid | Sisenemised igasse kohta (koha veeru muutus, muidu 8 m lahtri muutus) ja surmad 2,5 s jooksul sisenemisest, võrreldes kaardi määraga | Täpne binoomtest, q kohtade üle; suhe kahanenud 20 sisenemisega kaardi määral |
| Mängija mõju | Võidutõenäosus, mille iga mängija (tapmised, surmad, paigaldused) lisab voorule, kahanenud empiirilise Bayesi järgi; harja kohandatud pluss-miinus vooru tulemustest mudeli algusest; tapmise väärtus koha ja relva järgi, kahanenud | Karistus valitud viievoldse ristvalideerimisega |

Kõik ühe analüüsi testid jagavad ühte valede avastuste määra (Benjamini-Hochberg), kaasa arvatud kõik proovitud kohad, mitte ainult näidatud; näidatud q on kõigi nende üle.
Mudel ja selle kalibreerimine on sobitatud laaditud andmetele, seega kirjeldavad nad seda populatsiooni: professionaalne mudel eksib juhuslike mängude hindamisel ja vastupidi.

Kontrollitud sünteetilistel voorudel, kus on sisse pandud mõjud (kiigutaja eelis, ristlasud, pimestamised, üks saatuslik lehter, parem sihtimine, mis võidab), ja 100 andmestikul samadest voorudest ilma nendeta, kus sisse pandud mõjude testide valede avastuste määr peab jääma nominaalsele 5%-le (teatud vahemikus) (`src/insights/cqb/cqb.test.ts`); umbes tuhandel päris voorul sai mudel Brieri skoori 0,14 vs 0,25 baasmäära puhul, kalibreerimisvea 0,03 ja ümberkalibreerimise kalde 1,0.

## Vajalikud andmed {#data-it-needs}

- veerud **time**, **player**, **side** ja **round** (seanss), ning tapmised ja surmad sündmuste veerus; voorud, kus keegi ei sure kaks korda, loetakse elimineerimisvoorudeks (mehe eelis, kliutšid ja mudel vajavad neid);
- veerg **other party** (`other`, `victim`, `killer`, `attacker`), mis nimetab tapmisel ohvri ja surmas tapja (ilma selleta seostatakse samal hetkel toimuvad tapmised ja surmad);
- **vaatesuund** sihtimise mõõdikute jaoks;
- toores `event` veerg, mis nimetab `flash`, `smoke`, `he`, `molotov`, `plant` ja `defuse` abivahendite ja paigalduste jaoks;
- `won` (rea pool võitis vooru), `place` (kohanimed), `weapon`, `buy` ja `state_flashed`, kui andmed neid sisaldavad.

Positsioone tuleks proovida mitu korda sekundis; kiirused, sihtimine ja ristlasud loevad iga surma eelset viimast kahte sekundit.

## Jaotuses {#in-the-breakdown}

[Jaotus](breakdown.md) mõõdab neli olukorda faktoritena, koos vs ilma: *pimestatud*, *surm vahetatud*, *avaduell* ja arvud (*mehe üle*, *võrdne arv*, *mehe alla*), igaüks K/D, võidetud voorude, ellujäämise ja tapmiste kohta minutis.

## Palju matše {#many-matches}

Iga matši kokkuvõte [paljude matšide analüüsis](mass-analysis.md) andmetel, millel on vooru veerg, kannab samu mõõdikuid loenditena (`cqb` kokkuvõttes): avaduellid, vahetused, kiigutused, ristlasud, pimestatud sisenemised, sihtimine, mehe eelis, paigaldused ja 40 kõige enam sisenetud kohta koos nende sisenemiste ja surmadega. Loendid liituvad matšide kaupa, nii et tuhat matši annavad samad osad kui üks suur analüüs. Paneeli vahekaart **Lähivõitlus** näitab neid osadena koos intervallidega, kõigi kaartide või kaardi kaupa; rea klõps laadib matšid, kust see tuli.

## Arendajatele {#for-developers}

`src/insights/cqb/`: `walk.ts` (üks läbimine ridade üle ajalises järjekorras, voorud eraldi, duellid salvestatud oma olekuga), `finish.ts` (mõõdikud ja matšipõhised loendid), `model.ts` (logistiline regressioon IRLS-iga, kalibreerimine, harja konjugeeritud gradientidega, empiiriline Bayes, Fisher, Newcombe, permutatsioonitestid), `run.ts` ja `worker.ts` (vaaturi oma töötaja, tähelepanekute läbimise kõrval), `summary.ts` (paljude matšide kokkuvõtte kogumismehhanism), `factors.ts` (jaotuse olukorrad), `shows.ts` (mida lääts loeb), `synth.ts` (testvoorud). Teadmiskirjed on failis `src/insights/knowledge/cqb.ts`, mustrid failis `patterns-cqb.ts`. Tulemused lähevad aruandesse kui `lens.cqb`.
