---
title: "Massanalüüs"
nav_order: 8
lang: "et"
source: "mass-analysis.md"
source_hash: "88fad1d761e0"
translated: true
outdated: true
---

# Massanalüüs: tuhandeid matše korraga

**Massanalüüs** näitab, mida kogu kausta matšid kokku annavad: mis sõiduk võidab kõige rohkem, millist poolt eelistatakse, kus tegevus toimub. Kasuta seda, kui matše on palju rohkem, kui jõuaksid vaadata.

See töötab iga matši väikese kokkuvõtte põhjal, nii et tuhat või kümme tuhat matši avanevad kiiresti. Täielikud read laadib ta ainult klõpsatud matšide jaoks.

## Proovi {#try-it}

1. Ava **Massanalüüs** Soojuskaardi külgribal.
2. Vajuta **Kaust...** (või **Failid...**) ja vali oma `.3dheat` matšid.
3. Oota, kuni paneel loeb kokkuvõtted („Kokkuvõtted... n / N“).
4. Vajuta **Ava analüüs**. Avaneb aken vahekaartidega.
5. Sea filtrid (Mäng, Kaart, Režiim, Kust, Kuhu) ja loe vahekaarti, näiteks Tasakaal.
6. Klõpsa real, lahtril või tähelepanekul: selle matšid laaditakse 3D-vaatesse, kaamera on kohal.

![Vahekaart Tasakaal: võidumäär ja tapmised surma kohta sõiduki järgi](../assets/img/en/mass-balance.webp)

```
kaust .3dheat -> kokkuvõtted -> aken (vahekaardid) -> klõps reale -> matšid avanevad 3D-vaates
```

`.3dheat` fail on üks matš ([Üks fail matši kohta](container.md)). *Kuumuskaart* ja *rida* on selgitatud [sõnastikus](glossary.md).

## Kokkuvõtete saamine {#getting-the-summaries}

Enamikul inimestel pole midagi teha: paneel arvutab puuduvad kokkuvõtted ise. Suure kausta ettevalmistamiseks korra kasuta allpool olevat võrguühenduseta tööriista.

Igale `.3dheat` matšile tehakse kokkuvõte (`src/mass/summarize.ts`), mis hoitakse
konteineris liikmena `<match>.summary.json` (roll `summary`, vt
[Üks fail matši kohta](container.md)). Võrguühenduseta tööriist kirjutab need ja
kausta indeksi. See on arendajatööriist; käivita see suurel kaustal, et paneelilt töö ära võtta:

```
node tools/3dheat-summarize.mjs <folder>... [--jobs N] [--force] [--no-write] [--no-index] [--limit N] [--settle MIN]
```

- Matš, mis on juba kokku võetud (sama vormingu versioon), ainult loetakse; `--force`
  arvutab selle uuesti. `--no-write` jätab konteinerid puutumata.
- Fail, mida on viimase `--settle` minuti jooksul muudetud (10), jäetakse välja: konverter
  võib seda veel kirjutada.
- `<folder>/3dheat-index.jsonl.gz`: üks rida matši kohta – selle tee, suurus, aeg
  ja kokkuvõte ilma ruudustikuta. `<folder>/3dheat-index.grids.jsonl.gz`: üks rida matši
  kohta koos ruudustikuga.
- Käivita see masinal, kus failid asuvad, madalal prioriteedil (näiteks Linuxis `nice -n 19 ionice -c3`).

Paneel võtab iga matši kohta esimese leitud allika: kausta indeksi rea (sama
tee ja suurus), brauseri vahemälu (IndexedDB, nime, suuruse ja aja järgi),
konteineri liikme `summary` või kokkuvõtte, mis arvutatakse töötajate hulgas
ja salvestatakse vahemällu. Nii töötab ka kaust ilma indeksita – esimesel korral
tabelite lugemise kiirusel, pärast seda vahemälust.

## Paneel {#the-panel}

Vali kaust (või failid; **Lisa kaust...** lisab veel ühe). Aknas on filtrid **Mäng**, **Kaart**, **Režiim**, **Kust** ja **Kuhu**, valik **Jaota järgi**, **Vähim elusid** ja **Ainult mängijad** ning need vahekaardid. Iga number tuleb kokkuvõtetest. Klõps real, lahtril või tähelepanekul laadib selle matšid vaatesse mitme matši ülekattena, filtritega, mis seda näitavad (sõiduk, klass, relv, tiim, mängija), ja kaamera on kohal:

| Vahekaart | Mida näitab |
|---|---|
| Ülevaade | matše, tunde, mängijaid, elusid, ridu, kuupäevi; matše päevas; mängu, kaardi ja režiimi järgi; sündmuste kogusummad; majandus valuutade kaupa; millal matši jooksul asjad toimuvad |
| Tasakaal | sõiduki, klassi, relva või tiimi järgi, jagatud kaardi, režiimi, taseme või mängu järgi: K/D koos oma ~95% vahemikuga, võidumäär (Wilson), ellujäämine, tapmised ja tabamused minutis, teenitud raha minutis ning q – K/D ja võidu Benjamini-Hochbergi väärest avastamise määr võrreldes jaotuse ülejäänuga. **Vähim elusid** peidab read, kus elusid on liiga vähe usaldamiseks; **Ainult mängijad** jätab välja, mida missiooni TI juhtis |
| Trendid | kasutus (osa kohalolust), K/D või võidumäär parimate sõidukite või klasside kaupa päeva, nädala või kuu järgi |
| Mängijad | eristuvad mängijad, matšid mängija kohta, mängijad matši kohta, kõige sagedasemad mängijad |
| Pooled | iga kaardi iga pool: matšid, mis võideti võrreldes ühtlase jaotusega |
| Lähivõitlus | vooru andmed: avamisduellid poolte kaupa ja nende konversioon, vahetused, pealtvaataja versus kaitsja, ristlein, pimestatud sisenemised, sihtimine, paigaldused, meeste üleseis ja **Kaardi järgi** kohad, kus tapetakse sisenevaid mängijaid – igaüks osana oma Wilsoni vahemikuga, kokkuvõtete `cqb` loenduste põhjal ([Lähivõitlus ja ringid](close-quarters.md)) |
| Kaart | kaardi kokkuvõetud ruudustik: kohalolek, tapmised, surmad, K/D, mis tahes sündmus, voog ja **kuum mitmes matšis** (stabiilsus); tiimi kaupa, 1, 2, 4 või 8 korda lahtri suuruses |
| Kohad | kohad, mis paistavad silma numbrites, mitte kuumuskaardil (suur ala, mis on tervikuna hõivatud, koridorid, kõrgusvööndid); **Leia kohti** |
| Nišid | rühmad, kes teevad oluliselt paremini või halvemini kui ülejäänud (sõiduk ühel kaardil, sektor ühel kõrgusel); **Leia nišše** |
| Järeldused | massidetektorid ja kaardidetektorid (allpool); **Kopeeri aruanne (JSON)** annab JSON-i, mida keelemudel loeb |

## Tähelepanekud mitme matši kohta {#insights-over-many-matches}

Vahekaart **Kohad** leiab kohad, mis paistavad silma numbrites, mitte kuumuskaardil – suure ala, mis on tervikuna hõivatud, koridori, kõrgusvööndi, koha, mis on hõivatud ainult matši ühes osas. Need, mida tavaline kuumuskaart ei näita, märgib ta **varjatuks** ja joonistab 3D-vaates ääred; **Laadi** lendab sinna koos matšidega, mis seal olid. Vahekaart **Nišid** leiab rühmad (sõiduk ühel kaardil ja pool, sektor ühel kõrgusel), kes teevad oluliselt paremini või halvemini kui ülejäänud; klõps ühel näitab selle täpsustusi.

Vahekaart **Järeldused** leiab kõigi matšide põhjal sõidukid, kes kaubelda või võita paremini või halvemini kui ülejäänud, kohad, mis on kuumad püsivas osas matšidest, pooled, kes võidavad rohkem kui ühtlase jaotuse, sõidukid, kelle kasutus liigub kuupäevade lõikes, ja matši osad, kus on rohkem tapmisi, kui ühtlane jaotus annaks. Igal leiul on oma loendid, mõju, vahemik ja väärt avastamise määr (hoitud 5% juures), ja klõps laadib selle matšid. Üksikasjad: [Arendajatele](#for-developers).

## Ulatus {#scale}

Seda väikest versiooni saad ise korrata: `node tools/demo-data.mjs` kirjutab 150 sünteetilist tankimatši kausta `tools/.shots/demo/mass` (igaüks umbes 1000 rida). Mõõdetud nendel 150 sünteetilisel demomatšil `tools/demo-data.mjs` lauaarvutil (tegelik matš on palju suurem):

- `tools/3dheat-summarize.mjs` 4 töötajaga: 2,6 kuni 4,8 s kõigi 150 jaoks, 8 kuni 21 ms matši kohta töötaja sees; teine käivitus, mis ainult loeb kokkuvõtteid, võtab umbes 2 s.
- Kausta avamine paneelis, kui indeks on olemas, kuni aken näitab midagi: 0,9 kuni 1,6 s (töötaja enda osa, 150 indeksirea lugemine, on 20 kuni 40 ms).
- Vahekaardile lülitumine, kuni selle tabel on joonistatud: Ülevaade 10 kuni 30 ms, Tasakaal 30 kuni 70 ms, Trendid 30 kuni 45 ms, Mängijad 15 kuni 35 ms, Pooled 15 kuni 20 ms, Kaart 55 kuni 130 ms.
- Salvestis hoiab 150 matši umbes 0,5 MB.

Akna avamine võtab ühe lühikese kaadri: valitud failid saadetakse töötajale 16 kaupa, kuupäevaväljad ja esimene vahekaart tulevad kaadri pärast akent.

Salvestis hoiab umbes 15 KB matši kohta, nii et 10 000 matši võtab töötajas
umbes 150 MB; ruudustikke ei hoita kunagi kauem, kui kaart nõuab.

## Arendajatele {#for-developers}

### Tähelepanekud mitme matši kohta {#insights-over-many-matches}

`src/mass/detect.ts` – iga leid oma loenditega, mõjuga ja vahemikuga,
p ja q (Benjamini-Hochberg kõige üle, mida detektor proovis; hoitud 5% juures),
allatasandi, mis laadib selle matšid, ja lausevõti koos väärtustega;
aruanne (`heat3d.mass/1`) on see, mida `massReportForModel` annab jutustajale,
samas kujus kui ühe matši aruanne (`insights/seam.ts`).

| Detektor | Leiab |
|---|---|
| `balance` | mängija sõiduki, mis kaubeldes või võites on kaardil või režiimis paremini või halvemini kui ülejäänud |
| `hotspot` | kohad, mis on kuumad püsivas osas matšidest, mis tulid (kuumad matšid / nähtud matšid, võrreldes kaardi teiste lahtritega) – mitte ainult kuumad summas |
| `side` | kaardi pool, mis võidab rohkem kui ühtlase jaotuse |
| `meta` | sõiduki osa mängijate elude hulgas või tema K/D liikumine kuupäevade varasema ja hilisema poole vahel, kaardi kaupa – piisavalt suur, et olla oluline, kasvab kvartalite lõikes ja on sama suunaga enamikul kaartidest (allpool) |
| `phase` | osa matši pikkusest, kus on rohkem tapmisi, tabamusi, starte... kui ühtlane jaotus annaks |
| `place` | kohad, mis paistavad silma paljude matšide põhjal (etapp B, allpool): piirkonna määr või tapmiste osa võrreldes iga matši enda omaga, ringid, koridorid, kasvanud tsoonid, kõrgusvööndid, faasid; varjatud, kui tavaline kuumuskaart neid ei näita |
| `niche` | rühmad, kes teevad oluliselt paremini või halvemini (etapp B, allpool) |
| `grid.*` | üksikandmestiku detektorid (jõupositsioonid, kuumad ja vaiksed tsoonid, klassi kohad) kaardi kokkuvõtetud ruudustikel: `GridMerge.toInsightJob` täidab tähelepanekute läbikäigu ruudustikud kokkuvõtetest; rajaid vajavad detektorid jäetakse vahele |

### Kokkuvõte {#the-summary}

Lihtne JSON (`src/mass/types.ts`), umbes 5–30 KB tihendatuna matši kohta:

- matš: mäng, kaart, režiim, missioon, algus, pikkus, read, elud, mängijad,
  TI, tiimid (elud, mängijad, kohalolek, tapmised, surmad, võit, raha), võitja;
- sõiduki ja tiimi kohta: klass, tase, elud, mängijaelud, kohalolek, sündmused
  kanoonilise liigi järgi, tapmised sihtmärgi klassi järgi, võidud, raha;
- mängija kohta (kasutaja ID järgi, muidu nime järgi): tiim, elud, kohalolek, tapmised, surmad,
  tabamused, startid, võit, sõidukid; relva kohta: sündmused liigi järgi;
- majanduse veerud (`cost_*`, `earn_*`) ja nende summad;
- faasid: sündmused liigi järgi 20 vahemikus matši pikkuse ja minuti järgi;
- käitumine: matši kollektiivse käitumise näitajad (joondumine, marsruudi karjatamine, rajad,
  tihedus, juhid, mahajääjad, murdepunkt, risk pärast kaotusi, seeriad, ostukokkulepe,
  mahasurumine), igaühel oma nullmudel, p ja q – vt [Kollektiivne käitumine](collective-behaviour.md);
- ruudustik (allpool).

Loendatud nii, nagu vaatur loeb: veerud leitakse nii, nagu mitme matši laadur need leiab
(`leanSpec`), sündmused `data/canonical.ts` järgi; Tacview relv annab tapmise
tulistajale loendi; surm, mis on öeldud kaks korda korraga (`dead`, `death`), loetakse üks kord.

#### Ruudustik: mille peal etapp B seisab {#the-grid-what-stage-b-builds-on}

Ruumiline osa on tehtud statistiliste skaneerimiste jaoks mis tahes suurusega ja kujuga piirkondades, mitte ainult kuumuspiltide jaoks:

- **Püramiid.** Lahtrid on joondatud kahe astmed maailmaühikutes (x, z nii, nagu vaatur need paigutab). Tase `k` on lahtrid, mis on summeeritud `ix >> k, iz >> k` järgi – täpne, matši sees ja teiste lahtrisuurustega matšide vahel – ja iga piirkond (kast, joone järgi koridor, rõngas) on lahtrite summa. Kõige peenem tase mahutab matši tugeva ulatuse (lahtrid, mis hoiavad 99% kohalolekust) 128 lahtrisse; selle välised juhuslikud jäävad alles.
- **Ekspositsioon koos iga loendiga.** Kohalolekusekundid lahtri kohta, tiimi kohta (`pt`), sõiduki klassi kohta (`pc`) ja kõrgusvööndi kohta (`ph`), nii et piirkonna määr, oodatav väärtus ja suhe arvutatakse iga alarühma jaoks.
- **Kõrgus.** Vööndid matši põhjast kõrgemal (kõrguse 1. protsentiil): alla 3 m, 3–10, 10–30, 30–100, 100–300, 300–1000, 1000–3000, üle; fail, mille veerus on `floor`/`storey`/`deck`, jaotab vööndid selle korrusete järgi. `y` on iga lahtri keskmine kõrgus, `y0` on madalaim (selle korrus, kõrguse jaoks selle kohal).
- **Sündmused** tuplitena `[cell, kind, team, class, band, count]`.
- **Ajalõigud** karmis tasemes (8 lahtrit külje kohta), minuti kaupa matši algusest: `[cx, cz, minute, kind, value]`, kohalolekusekundid liigina `GRID_KINDS.length`; matši faasid on minutid pikkuse üle.
- Hõredad, loendid täisarvud, sekundid kümnendikeni: piiratud sellega, mis juhtus.

### Etapp B: kohad ja nišid {#stage-b-places-and-niches}

Etapp B otsib, mis paistab silma numbrites, ilma et see silma jääks:
suur ala, mis on tervikuna hõivatud, ilma kuuma lahtrita; kummaline tapmiste ja surmade suhe vähestel sündmustel; koridor; kõrgusvöönd; klaster, mis on olemas ainult matši ühes osas – ja rühmad (sõiduk ühel kaardil ühel poolel, sektor ühel kõrgusel), kes teevad oluliselt paremini või halvemini kui ülejäänud. Üks **Leia kohti** / **Leia nišše** / **Leia tähelepanekuid** käivitab kõik detektorid; kolm vahekaarti jagavad aruannet.

#### Kohad (`src/mass/scan.ts`) {#places-srcmassscants}

Iga kaardi matšid loetakse kaks korda, üks matš korraga; mälu hoiab summasid rastril, mis on kuni 64 lahtrit külje kohta (16 ruumi-aja skaneerimiseks), mitte kunagi matše.

- **Mõõdikud.** Sündmuse määr kohaloleku sekundi kohta – tapmised, surmad,
  tabamused, startid, vallutused, kõigi üksuste kohta, klassi kohta (4, kellel on kõige rohkem
  sündmusi), kõrgusvööndi kohta – ja tapmiste osa tapmistes ja surmades (kõik, poole kohta, vööndi kohta). Millised klassid ja pooled, tuleb päisest (`planOf`).
- **Oodatav väärtus matši kaupa.** Iga matši enda määr, jaotatud tema enda kohalolekule lahtris, on lahtri oodatav väärtus (kovariaadiga kohandatud Kulldorffi skaneerimine, kihistatud matši järgi): mõned verised matšid või üks hõivatud server ei tee kohta.
- **Hajuvus.** Matšid lähevad Poissonist palju kaugemale. Iga matši jäägid summeeritakse plokkides 1, 2, 4, 8, 16 lahtrit; iga plokisuuruse hajuvus (ruudud jääkidest jagatud nullvariatsiooniga, koondatud, halvimad 5% plokke välja jäetud) skaleerib iga selle suurusega piirkonna testi: kvaasi-tõepära suhe, Poisson määrade jaoks, binoomne osade jaoks.
- **Piirkonnad.** Ringid 0,75 kuni 18 lahtrit; ellipsid kuues nurgas, 3 ja 6 korda pikemad kui laiad, 3 kuni 18 lahtrit (koridorid; telg on tähelepaneku `place.path`); tsoonid, mis kasvavad lahter-lahtri haaval kõige tugevamatest kohalikest Getis-Ord Gi* lahtritest, kuni piirkonna z kasvab (ebakorrapärased kujud) – kasvatatud pooltel matšidel ja testitud teisel poolel, nii et kasvamise vabadus ei too kaasa valekohti; iga kõrgusvöönd võrreldes matši teiste vööndite kogu kaardiga (klastrikindel); ruum-aja silindrid: ring ühes või kahes viiendikus matši pikkusest, võrreldes matši enda sündmuste levikuga koha ja aja üle (ruum-aja permutatsiooni skaneerimine).
- **Testimine.** p kvaasi-tõepärast; Benjamini-Hochberg kõigi piirkondade üle, mida proovitakse kõigil kaartidel (kolmel kaardil on tavaline 700 000), 5% juures. See, mis läbib, lõigatakse (piirkond, mis on enamasti tugevama sama mõõdiku piirkonna sees, ütleb sama), loetakse uuesti oma **stabiilsuse** jaoks – matšid, mis seda nägid, matšid, kus see hoiti, selle suund matšide viies voldis – ja testitakse veel kord matšide enda näidatud dispersioonil (klastrikindel, matšid klastritena, mitte kunagi Poisson), BH veel kord. Vaiksed kohad baasil (2% või rohkem kaardi tekkimistest, starttest ja maandumistest) jäetakse välja.
- **Mõju.** Määra (või šansi) suhe, kahanenud empiirilise Bayesi järgi (gamma eelnev, mis on sobitatud kaardi 2×2 plokkidele), umbes 95% vahemik dispersioonil; Gi* 1, 2 ja 4 lahtri juures ning lokaalne Moran keskmes.
- **Visuaalne ilmsus.** Kui palju piirkond juba paistab oma sündmuse tavalises kuumuskaardis (logaritmiline skaala heledaima lahtrini, nii nagu vaated joonistavad): selle kontrast ümbritseva rõngaga (kümnendik paletist on raskesti nähtav, kaks viiendikku selge) ja hele tipp, mis kannab ülejääki; suhet kuumus ei joonista, seega loeb osa pool. Alla 35% on **varjatud**. Järjestus: tugevus (mõju, mis küllastub 4 kordsel, vaiksed kohad 0,7 juures) korda `1 - 0,7 x ilmsus` korda voltide nõusolek.

**Kohad** vahekaart loetleb need (vaikimisi ainult varjatud; kaardi, kuju, suuna järgi), klõps joonistab kaardi kohad 3D-vaatesse (`placeLines.ts`: mootori ülemised jooned, üks kord ehitatud – magenta varjatud, merevaigukollane tavaline, tsüaan vaikne, valitud täielik; vöönd kastina põrandast laeni) ja vahekaardi Kaart lõuendile; **Laadi** lendab sinna ja laadib 60 matši, mis seal enamasti olid, filtreeritud selle sündmuse (ja klassi) järgi.

#### Nišid (`src/mass/niche.ts`) {#niches-srcmassnichets}

Kiirotsing (laius 24, sügavus 3) kolme tabeli kohal: **elud** (mängijate elud:
mäng, kaart, režiim, klass, sõiduk, pool, tase, kuupäevade kvartal, matši pikkuste kolmandik; K/D, võit, surm elu kohta, tapmised tunni kohta, teenitud raha minutis), **kohad** (tapmised ja surmad kaardi, režiimi, kuupäevade, kaardi sektori 4 x 4, klassi, poole ja vööndi järgi) ning **faasid** (sektor ja matši viiendik: K/D, surmad kohalolekutunni kohta). Rühma testitakse terviku vastu, matšid klastritena (tema jääkide sandwich-variatsioon matši järgi), selle mõju on šansi- või määrasuhe, kahandatud 20 tulemuse eelneva järgi; ta vajab 30 tulemust 8 matšis, täpsustus peab olema 10% tugevam kui tema vanem, rühmad, kus tulemus on puudu või kõik (neile pole see salvestatud), jäetakse välja. Alles jäävad: BH alla 5% kõigi hinnatud rühmade üle, kahanenud suhe vähemalt 1,25 (või 1/1,25), neli viiest voldist nõustuvad, täpsustus, mis ainult kordab oma vanemat, ei ole alles. **Nišid** vahekaart loetleb need; klõps näitab kõiki rühma ühe tingimusega täpsustusi (uurija), **Laadi** laadib selle matšid. Varustust kokkuvõtetes veel pole.

#### Mõttes muutused praktilise olulisusega {#meta-shifts-with-practical-significance}

Segakuupäevadel helistas binoomtest peaaegu iga muutust oluliseks. `meta` testib nüüd klastrikindlalt (iga matši elud on klaster), jätab alles kasutuse nihke ainult siis, kui see on vähemalt 2 punkti ja 25%, K/D nihke 1,3 korda, kuupäevade kvartalid kasvavad samas suunas (Kendalli tau vähemalt 0,5) ja mitme kaardi sõiduki puhul sama suund enamikul neist. See jätab testikomplektil, kus tavaline test märkis peaaegu kõik, vaid mõned nihked.

#### Mudelile {#for-a-model}

`massReportForModel` annab igale kohale tema `region` (kuju, varjatud, ilmsus, kõrgused, faas) ja igale nišile tema `conditions`, plus selle, kui palju piirkondi ja rühmi proovis. Teadmiste lääts võib lugeda kohti kui tapmistsoone ja lähenemisteid: nende liigid on `place.*` ja `niche.*`.

#### Kontrollid {#checks}

`scan.test.ts` istutab hajusa ala (1,6 korda surmamäär ringil 22 lahtrit, igas lahtris nõrk), koridori, kõrgusvööndi ja ainult faasi klastri 240 sünteetilises üledispersioonis matšis – kõik leitakse, hajus on varjatud – ning käivitab kaheksa nullkomplekti 60 matšiga: ükski koht. `niche.test.ts` leiab istutatud sõiduk x kaart x pool rühma ja mitte midagi viies nulltabelis.
