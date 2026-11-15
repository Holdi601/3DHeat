---
title: "Kaaviot ja HUD"
parent: "Kisa-analyysi"
nav_order: 53
lang: "fi"
source: "race-charts-and-hud.md"
source_hash: "e28a1df357bf"
translated: true
outdated: false
---

# Kaaviot ja HUD

Kaaviot asettavat kierroksesi kohdakkain metri metriltä, joten näet, missä yksi kuljettaja jarrutti myöhemmin tai nosti kaasun aikaisemmin. Näkymän vasemmassa yläkulmassa olevat kortit näyttävät, mitä kukin auto ja kuljettaja tekee juuri nyt.

![Kaaviot näkymän alla: ero, nopeus, kaasu, jarru ja ohjaus kahdelle kierrokselle, aika- ja syyrivit ylhäällä sekä osoitin ja kortit](../assets/img/en/race-charts-rows.webp)

## Kaaviot {#the-charts}

Jokainen kierros on yhdellä matkaakselilla: metrit vertailukierroksen mukaan (katso [yksi matkaakseli](race-corner-analysis.md#one-distance-axis)). Sama x-arvo on siis jokaiselle kierrokselle sama kohta radalla. Yksi kierros piirretään yksin (ja se toistuu). Saman radan toinen kierros piirretään sen rinnalle. Kun kierroksia ei ole ladattu (tai analyysi epäonnistui), alueella lukee "Kaaviot näkyvät, kun kierros on ladattu. Lataa toinen saman radan kierros verrataksesi niitä."

### Mitä kaavioissa on {#what-is-on-them}

- **Selite**: jokaisen piirretyn kierroksen väri ja nimi. Vertailukierroksen perässä on "(vertailu)". "+N lisää piirretty, ei kaaviossa" näkyy, kun kierroksia on enemmän kuin kaaviossa. **Kuvaajat (N) ▾**. **Koko kierros** näkyy zoomatessa. Yksi ohjerivi.
- **Kaksi nauhaa** ylhäällä tarkennetulle kierrokselle:
  - *aika*: [aikakartta](race-replay-and-scene.md#time-map-where) nauhana. Punainen tarkoittaa menetystä, vihreä voittoa.
  - *syy*: jokainen sen menetys palkkina sen syyn kohdalla syyn värillä. Palkin päällä oleva osoitin näyttää otsikon ja hinnan.
- **Mutkavyöhykkeet**: varjostettu vyöhyke mutkan sisäänajosta ulosajoon (vertailukierroksella löytyneenä). Sen nimi (`T1` …) näkyy akselin alla kärjen kohdalla.
- **Valittu löydös**: vyöhyke sen syyn värillä sen välin päällä.
- **Rivit** (kuvaajat), yksi kullekin valitulle kanavalle. Jokaisella on nimi ja vasemmalla sen välin ylä- ja alaraja. Nolla-viiva näkyy kohdassa, jossa väli ylittää nollan. Jokainen kierros on oman värinsä viiva. Tarkennettu kierros on 2 px leveä ja läpinäkymätön. Vertailukierros on läpinäkymätön. Muut ovat 1,5 px leveitä ja 75 % läpinäkyviä. Eroriviltä jätetään vertailukierros pois, koska se on nolla itseensä verrattuna.
- **Osoitin**: pystyviiva siinä kohdassa, missä vertailuauto on (tai missä osoitin on), ja piste kullakin autolla jokaisella rivillä paitsi erorivillä. Osoittimen kohdalla jokainen auto on samassa metrissä. Muuten jokaisen auton oma matka toiston kellon mukaan.

Kaaviossa piirretään enintään **8** kierrosta: tarkennettu kierros, sen luokan paras ja vertailukierros ensin, sitten muut ladausjärjestyksessä.

### Rivit ja niiden korkeudet {#rows-and-their-heights}

Rivit jakavat kaavion korkeuden painon mukaan. Mikään rivi ei ole alle 16 px:

| Rivi | Paino |
|---|---|
| Ero (vertailuun, sekunteina, etumerkillisenä) | 1,7 |
| Nopeus (km/h) | 1,7 |
| polkimet (kaasu, jarru, kytkin) | 1 |
| ohjaus | 1,1 |
| vaihde | 0,8 |
| merkkivalo (käsijarru, ABS ...) | 0,55 |
| muut | 1 |

Kanavalla, jolla on taulukossa kiinteä näyttöväli (polkimilla 0–100 %), käytetään sitä. Muut sovitetaan kierrosten näkyvään osaan. Jos rivin nimi on liian pitkä tilaan (pitkä sana toisella kielellä), ylin arvo siirtyy alemmas riviä, kun rivi on tarpeeksi korkea. Muuten nimi katkaistaan kolmella pisteellä. Koko nimi näkyy vihjeessä.

### Oletuskuvaajat {#the-default-graphs}

Ennen kuin kuvaajia on valittu, näkyy **ero**. Sen jälkeen näkyy jokainen kanava, jonka taulukko merkitsee `graph`-kuvaajaksi ja jonka kierrokset sisältävät: kaasu, jarru, kytkin, käsijarru, ohjaus, vaihde ja nopeus. Polkimen tai merkkivalon kanavaa ei kuitenkaan piirretä, ellei jokin kierros vie sitä yli 0,02:n. Kytkin, jota ei koskaan paineta, ei ole kuvaaja. Järjestys on taulukon järjestys.

### Kuvaajavalitsin {#the-graph-picker}

**Kuvaajat (N) ▾** avaa paneelin painikkeen yläpuolelle:

- suodatuskenttä (vastaa kanavan nimeä tai tunnusta);
- **Oletukset** (palauttaa oletusjoukon; vihje kertoo, kuinka monta) ja **Sulje**;
- *Ero vertailuun*, sitten jokainen kanava, jonka piirretyt kierrokset sisältävät. Kanavat on ryhmitelty (liike, syötteet, moottori, avut, renkaat, jarrut, jousitus, pyörät, muut, ajoitus, sijainti). Jokaisessa on valintaruutu. Pyörä-kohtainen kanava on yksi rivi, jossa on siru jokaiselle pyörälle (FL, FR, RL, RR).

Valitut kanavat säilyttävät taulukon järjestyksen riippumatta siitä, missä järjestyksessä ne valitaan. Valinta pysyy, kunnes painat **Oletukset** tai lataat sivun uudelleen. Kanavat, joita taulukko ei tunne, tarjotaan ryhmässä *muut*. Niiden nimi tulee niiden omasta tunnuksesta (esimerkiksi "brakeLinePress" → "Brake line press").

### Osoitin, rullaus, zoomi ja napsautus {#hover-wheel-zoom-click}

| Syöte | Tekee |
|---|---|
| viemällä osoitin | jokainen auto, sen kortti ja sen syötteet siirtyvät siihen metriin. Paikkamerkki näyttää kohdan radalla. Taulukko luettelee jokaisen piirretyn kierroksen arvon jokaisella rivillä siinä kohdassa (ero näkyy vertailukierroksella "ref"). Korttien yläpuolella lukee "N m kohdalla – kaavioiden osoitin". Kun osoitin poistuu kuvaajasta, toisto palaa normaaliksi |
| rulla | siirtää toistoa kierroksella 1/200 näkyvästä välistä jokaisella askeleella (Shift: 5×) ja pysäyttää toiston. Zoomattuna näkymä seuraa osoitinta |
| Ctrl+rulla (Cmd+rulla) | zoomaa matka-akselia osoittimen kohdalta: 1,25× ulos ja 0,8× sisään jokaisella askeleella. Ei koskaan kapeampi kuin 40 m. Zoomaus koko kierrokseen lopettaa zoomin |
| sivurulla | liikuttaa näkymää zoomattuna (10 % välistä per 100 yksikköä vierityksestä) |
| kaksoisnapsautus, **Koko kierros** | zoomaa ulos |
| napsautus | siirtää toiston kohtaan, jossa vertailukierros saavuttaa tuon metrin |
| Shift+napsautus | asettaa autot kohdakkain siinä (katso [kohdistaminen](race-replay-and-scene.md#lining-up)) |

Kaaviot piirtyvät uudelleen nykyisellä kielellä, kun kieli vaihtuu.

Selitteen ohjerivi sanoo saman lyhyesti: "Osoitin: kaikki autot siinä · rulla: askel kierroksella · Ctrl+rulla: zoomi · napsautus: hyppy · Shift+napsautus: kohdista".

## Autokortit (HUD) {#the-car-cards-hud}

Näkymän vasemmassa yläkulmassa on kortti jokaiselle näkyvälle kierrokselle, enintään **6**. Ensimmäiset kuusi näkyvää kierrosta ladausjärjestyksessä näytetään. Kortit näyttävät toiston (tai kaavioiden osoittimen) hetken.

**Otsikko:** kierroksen väri ja nimi. Elävä ero: tämän kierroksen aika saavuttaa nykyinen matka miinus vertailukierroksen aika samaan matkaan, esimerkiksi "+0,48 s". Tai teksti "vertailu". **⋯** näyttää tai piilottaa kaikki muut arvot (sama kuin *Kaikki arvot korteilla*). Takaa-ajettavan auton kortti on korostettu.

**Auto ylhäältä:** kierroksen värinen rungon ääriviiva ja nuoli etupäässä. Neljä rengasta: etupyörät kääntyvät ohjauksen mukana enintään 28°. Jokainen rengas on lämpötilansa värinen. Samat merkit kuin 3D-autossa, piirrettynä tasaisesti: liukurengas, jousituspalkki, jarrun hehku, kulumavyöhyke, kuormapalkki.

**Lukemat:** nopeus km/h, kierroksen oma aika ja matka vertailukierroksen mukaan.

**Syötteet:**

- ohjauspyörä, joka kääntyy ohjaussyötteen mukaan (täysi lukitus piirretään 180°:na), ja sen alla prosentti;
- palkki jokaiselle polkimelle, vasemmalta oikealle kuten polkimissa: kytkin, jarru, kaasu. Jokaisessa on prosentti ja lyhyt nimi sen värillä. Näkyvät vain kierroksen polkimet;
- vaihde (R peruutukselle, N vapaalle);
- pieni merkkivalo jokaiselle päälle/pois-kanavalle, jonka kierros sisältää: käsijarru, ABS, TC, DRS, huoltorajoitin, ilmassa. Valo syttyy omalla värillään, kun se on päällä (yli puolet sen välistä);
- lukema jokaiselle tasokanavalle: jarrujakauma, ABS- ja TC-asetukset, turbo ja polttoaine.

**Syötteiden jälki:** viimeiset **6 sekuntia** jokaisesta polkimesta (yksi kaista, kukin omalla värillään) ja ohjaus (oma kaistansa, keskitettynä). Jälki päättyy tähän hetkeen. Se näyttää, mitä kuljettaja teki tulleessaan siihen. Enintään 160 pistettä.

**Kaikki arvot** (⋯ tai *Kaikki arvot korteilla*): jokainen muu skalaarinen arvo, jonka kierros sisältää tällä hetkellä. Sen jälkeen jokainen pyöräkohtainen kanava neljänä arvona (FL FR RL RR). Nimet tulevat kanavataulukosta tai kanavan omasta nimestä, ja ne on ryhmitelty.

## Kehittäjille {#for-developers}

Koodi: [`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx),
[`src/race/graphs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/graphs.ts),
[`src/ui/race/RaceHud.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHud.tsx),
[`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts).

### Kanavataulukko {#the-channel-table}

`CHANNELS` tiedostossa [`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts) on ainoa paikka, jossa kanava kuvataan. Siinä ovat sen yksikkö, se, onko se yksi arvo näytettä kohti vai yksi arvo pyörää kohti (tallennettu nimellä `name.FL` …), sen ryhmä, näyttöväli, miten se piirretään autoon (`glyph`), miten se näkyy kortilla (`input`: `pedal`, `steering`, `gear`, `lamp`, `level`), onko se oletuskuvaaja, onko se askeltava eikä sekoittuva (vaihde, liput) sekä miten se näytetään (skaala, yksikkö, numerot). Nimet ja lyhyet nimet ovat viestejä kullakin kielellä (`race.channel.<name>.label` / `.short`).

Kanavat, joilla on piirto tai oletuskuvaaja:

| Kanava | Yksikkö | Piirretään | Oletuskuvaaja |
|---|---|---|---|
| `throttle`, `brake`, `clutch` | 0..1 | poljin (vihreä, punainen, …), näytetään %:na | kyllä |
| `handbrake` | 0..1 | merkkivalo | kyllä |
| `steer` | -1..1, oikea positiivinen | ohjauspyörä | kyllä |
| `gear` | - | vaihde | kyllä |
| `speed` | m/s, näytetään km/h | - | kyllä |
| `absActive`, `tcActive`, `drs`, `pitLimiter`, `airborne` | 0..1 | merkkivalo | - |
| `brakeBias`, `absLevel`, `tcLevel`, `boost`, `fuel` | - | tasolukema | - |
| `tireTemp` (pyörä kohti) | °C, näyttö 40–130 | renkaan väri | - |
| `tireTempInner/Middle/Outer` | °C | - | - |
| `slipRatio`, `slipAngle` (pyörä kohti) | kuten peli skaalaa, näyttö ±1,5 | liukurengas | - |
| `combinedSlip`, `slipIndex` (pyörä kohti) | näyttö 0–1,5, 0–1 | liukurengas | - |
| `suspension` (pyörä kohti) | 0..1 | jousituspalkki | - |
| `brakeTemp` (pyörä kohti) | °C, näyttö 100–900 | jarrun hehku | - |
| `tireWear` (pyörä kohti) | 0..1 | kulumavyöhyke | - |
| `wheelLoad` (pyörä kohti) | N, näyttö 0–12 000 | kuormapalkki | - |

Muut taulukon kanavat (kuvaaja ja luettelo, ei piirto): `latAcc`, `longAcc`, `vertAcc`, `yaw`, `pitch`, `roll`, `yawRate`, `latVel`, `longVel`, `vertVel`, `bodySlip` (sivuliukukulma), `loose`, `lateral` (poikkeama vertailusta), `rpm`, `power`, `torque`, `waterTemp`, `oilTemp`, `tirePressure`, `camber`, `padLife`, `discLife`, `suspensionM`, `wheelSpeed`, `wheelSurfaceSpeed`, sekä `time`, `distance`, `x`, `y` ja `z`.

**Kanava, jota taulukossa ei ole,** luetaan silti, se piirretään kuvaajaan (ryhmässä *muut*) ja se luetellaan korteilla. Nimi tulee sen omasta tunnuksesta. **Jos haluat sille oikean nimen, yksikön ja piirron,** lisää yksi merkintä taulukkoon (ja sen nimiviesti kuhunkin `src/i18n/locales/<kieli>/race-channels.json`-tiedostoon). Uusi *pyörätyyppinen* piirto on yksi merkintä kohdassa `WHEEL_GLYPHS` (glyph.ts) ja sen tasainen vastine `CARD_GLYPHS` (RaceHud.tsx). Molemmat on tyypitetty lajin mukaan, joten koontiversio epäonnistuu, ellei kumpaakin ole. `src/race/extensible.test.ts` tarkistaa, että tuntemattomat kanavat päätyvät kuvaajiin, että jokainen taulukon merkki voidaan piirtää ja että merkkivalot syttyvät.
