---
title: "Lotur, persónur og hópar"
parent: "Hvernig gögn eru sett inn"
nav_order: 4
lang: "is"
source: "sessions-persons-groups.md"
source_hash: "5c87185b09ff"
translated: true
outdated: false
---

# Lotur, persónur og hópar

**Persóna** er eitt hreyfanlegt fyrirbæri (leikmaður, bíll). **Lið/hópur** er hliðin sem þau tilheyra. **Lota** er einn leikur eða hringur. Sjá [orðasafnið](glossary.md).

Ein röð í skrá getur nefnt þau öll þrjú:

| x | y | tími | leikmaður | lið | leikur |
|---|---|---|---|---|---|
| 10.5 | -30.2 | 12.0 | Blue 1 | Blue | Match 01 |

`player` er persónan, `team` er hópurinn, `match` er lotan.

Þrír valfrjálsir dálkar lýsa *hverjum* röð tilheyrir og *hvar í sögunni* hún er. Hver þeirra er dulkóðaður sem orðabók við hleðslu: textagildin verða lítil heiltöluauðkenni á hverja röð ásamt einum lista af merkjum, sem er deilt yfir allar skrár hleðslunnar.

## Persóna {#person}

Dálkurinn **Persónuauðkenni** nefnir hreyfanlega fyrirbærið sem röð tilheyrir: leikmann, vélmenni, bíl. Hann er geymdur sem 32 bita auðkenni á hverja röð.

Með persónu- og tímadálki reiknar hleðslan **líftíma** hverrar raðar: tímann þar til næsta sýni sömu persónu *í sömu lotu* kemur, eða "enginn" (vörðugildi, -1) þegar ekkert næsta sýni er til - persónan dó, fór eða skráin tók enda. Líftímar knýja söguna **Líftími** á [tímalínunni](timeline.md), innreikning og úreltingu í [kassaendurspilun](box-replay.md), og leiðarrofin í [línuhita](line-heat.md). Hvað röð án eftirmanns gerir er skoðunarstilling (*Varaaldur*), ekki sett inn í gögnin.

Hverri persónu er gefinn hópur **fyrstu** raðar hennar í tíma; sú úthlutun litar kassa hennar í kassaendurspilun og ákvarðar hvaða sýnileikarofi hóps felur hana þar. Hitastillingar nota hópinn á hverri röð.

### Heiti sem fleiri en eitt fyrirbæri ber í einu {#names-worn-by-several-things-at-once}

Heiti er ekki alltaf eitt fyrirbæri: í sumum útflutningum skráir hvert vélmenni í hverjum leik sig undir sama heiti. Ef tvö sýni slíkrar "persónu" eru tengd - með innreikningi, spori eða leið - er dregin lína milli tveggja ólíkra skepna yfir kortið.

Við hleðslu ([`computeLifetimes`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)) er heiti merkt **deilt** þegar tvær færslur þess

- eru í sömu lotu,
- hafa sama tíma,
- eru af sömu gerð (hvert geymt flokksdálkagildi er það sama), og
- eru lengra hvor frá annarri en 1% af ská útbreiðslu gagnanna.

Deilt heiti eru teiknuð sem stök sýni - enginn innreikningur, ekkert spor, engin línuhitaleið. Allt annað um þau (hiti þeirra) er óbreytt. Gagnasafns-spjaldið listar hversu mörg heiti voru merkt, með allt að þremur dæmum, og kassaendurspilunarspjaldið endurtekur töluna.

## Lota {#session}

Dálkurinn **Seta / leikur** segir hvaða leik, árás, umferð, keyrslu eða hring röð tilheyrir. Hann gerir sýni persónu að einu samfelldu spori: raunveruleg fjarmæling flettir oft saman samtímis leikjum, og sýni leikmanns rétt fyrir leshausinn og það rétt á eftir geta verið úr ólíkum leikjum, hundruð metra hvort frá öðru. Með lotudálki:

- fara innreikningur, spor og línuhitaleiðir aldrei yfir skil lotu;
- líftími raðar endar í lok sinnar lotu;
- **Lota**-valið birtist efst í hliðarstikunni, undir hamastikunni.

Lotudálkur er mjög oft *tímastimpill* - upphafsaugnablik leiksins, endurtekið á hverri röð þess leiks. Sjálfvirka tengingin leitar að lotuheitum á undan persónu og hópi af þessari ástæðu ([Dálkatenging](column-mapping.md#session-person-group)). Kappakstursferð eða stint er líka lota: tveir hringir sama bíls mega ekki vera tengdir í eitt spor.

### Lotuvalið {#the-session-picker}

![Lotuvalið opið á skrá með tíu leikjum: Allar lotur (10), Match 01, Match 02 og svo framvegis](../assets/img/en/sessions-persons-groups-picker.webp)

*Tíu leikir í einni skrá: veldu einn eða sjáðu þá alla.*

Birtist þegar gagnasafnið hefur skráðar lotur (sjá takmörkin hér fyrir neðan).

| Hluti | Merking |
|---|---|
| Merki hægra megin | Fjöldi raða valdrar lotu, eða *allt í einu*. |
| Valmynd | *Allar lotur (N)*, síðan hver lota, annasamasta fyrst, sem `label - N rows, span` (bil í sekúndum undir 90 s, mínútum undir 90 mín., klukkustundum yfir það). |
| Gul vísbending | Sýnd fyrir *Allar lotur*: staðsetningar eru enn aldrei tengdar yfir lotur, en samtímis leikir setja óskyld fólk saman á kortið. |
| Vísbending | Sýnd í hitaháttum þegar ein lota er valin: valið færir aðeins leshausinn. |

Við hleðslu er annasamasta lotan valin. Ef lota er valin fer leshausinn á upphaf hennar.

Það sem valið breytir:

- Í **[kassaendurspilun](box-replay.md)** ræður það hvaða lota er spiluð: aðeins kassar og spor þeirrar lotu eru teiknuð, og tímabil tímalínunnar verður bil lotunnar sjálfrar.
- Í **hitaháttunum** takmarkar það ekki hitann, og vísbending undir valinu segir það: *Í hitaháttunum færir þetta aðeins leshausinn á upphaf lotunnar; hitinn telur enn allar lotur. Kassaendurspilun spilar valda lotu eina.* Til að takmarka hita við eina lotu skaltu líka halda lotudálkinum sem síudálki (*Halda fyrir síun*) og sía eftir honum. Dálkur getur verið bæði lotudálkur og síudálkur: hleðslutækið les hvern merktan síudálk sér, hvaða hlutverk sem hann gegnir líka.

### Of margar lotur {#too-many-sessions}

Allt að **100.000** lotur eru skráðar. Umfram það er dálkurinn í raun auðkenni (mappa með milljónum lota með fáeinum röðum hver), og að senda svo marga merkimiða frá vinnsluferlinum á síðuna er það sem keyrir flipa úr minni. Hleðslan heldur þá lotu-**auðkenjunum** - svo mörkin gilda enn alls staðar - en sleppir merkimiðunum og valinu, og Gagnasafns-spjaldið segir það.

## Hópur {#group}

Dálkurinn **Lið / hópur** er hvaða dálkur sem er með fáum gildum: lið, hlið, sveit, fylking, flagg fyrir leikmann á móti gervigreind, flokkur bíls. Hann er geymdur sem 16 bita auðkenni á hverja röð og stýrir:

- [Liðalistanum](teams-list.md) (sýnileika á hvern hóp, + / − hliðar),
- [liðahita](team-heat.md) (litblæ á hvern hóp),
- [mismuninum](difference.md) skipt eftir hópum,
- litum kassa í [kassaendurspilun](box-replay.md) (litblæjafjölskyldu á hvern hóp, skugga á hvern meðlim).

### Takmörk {#limits}

Mest **4.096** ólík hópa. Hópauðkennið situr í fjórðu rás hverrar raðar í staðsetningartexelinu á skjákortinu, og hver hópur þarf texel í 4.096 breiðu formerkjatöflunni sem skyggnið les til að ákveða *falinn*, *bætt við* eða *dreginn frá*. Dálkur með fleiri ólík gildi er auðkenni, ekki hópur: **hleðslan geymir hverja röð og sleppir aðeins hópuninni**, með viðvörun á gagnasafninu sem stingur upp á að tengja hann sem persónudálk í staðinn, eða geyma hann sem síudálk.

Sama 4.096 takmark gildir um geymdan *flokks*-síudálk; breiðari dálkur er ekki geymdur og gagnasafnið segir það. Tölu-dálkur (tímastimpill, til dæmis) hefur ekki slík takmörk sem *bils*-sía.

Hópgildin `0`, tómt gildi, `none`, `unknown`, `null` og `-1` (óháð há- og lágstöfum) þýða "enginn hópur" fyrir [liðahita](team-heat.md), sem teiknar þau hlutlaus grá en ekki sem sannfærandi lit.

## Stærð einingar {#entity-size}

Hversu stór einn rakinn hlutur er - árekstrarkassi leikmanns, bíll - ræður hversu stórir kassar og horfsgeislar [kassaendurspilunar](box-replay.md) eru teiknaðir. Það er enginn reitur fyrir það í spjaldinu; það kemur úr [`heat3d`-vísbendingum](data-formats.md#the-heat3d-hints) skráarinnar (`entity.size`, í einingum skráarinnar sjálfrar; CS2-breytandinn skrifar 32). Hleðslan margfaldar það með einingakvarðanum.

Við hverja hleðslu ([`calibrate`](https://github.com/Holdi601/3DHeat/blob/main/src/data/calibrate.ts)), þar sem *útbreiðsla* er það stærra af X- og Z-bilum gagnanna:

| Stilling | Með stærð einingar | Án hennar |
|---|---|---|
| Stærð teninga | stærð einingar | útbreiðsla / 500 |
| Lengd horfsgeisla | stærð einingar × 4 | útbreiðsla / 200 |
| Radíus sprite-mynda | útbreiðsla / 120 | útbreiðsla / 120 |
| Mettunarmark | reiknað mat (síðan mælt) | sama |
| Flughraði | útbreiðsla / 12 | sama |
| Fjærplan | útbreiðsla × 12 | sama |
| Nærplan | max(0,05; útbreiðsla / 20.000) | sama |

## Gagnasafns-spjaldið {#the-dataset-panel}

Undir Uppruna-spjaldinu. Þegar gagnasafn er hlaðið sýnir það:

- **heiti** gagnasafnsins - valið, fjölda raða, fjölda skráa, sleppistuðulinn þegar hann var notaður;
- **`N lið · N persónur · N s bil`**;
- allar **viðvaranir** sem hleðslan skilaði, gular, meðan gagnasafnið er hlaðið: hópar eða síudálkur felldir út vegna of margra gilda, lotur ekki skráðar, deilt heiti, röð sem vantar, skrám sleppt;
- [gervigagnaframleiðandinn](synthetic-generator.md);
- **Afhlaða**, sem fjarlægir gagnasafnið.

Fjöldi raða er sýndur í haus spjaldsins.
