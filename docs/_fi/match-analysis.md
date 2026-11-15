---
title: "Ottelun analyysi (CS2)"
nav_order: 10
lang: "fi"
source: "match-analysis.md"
source_hash: "270f28c0f42b"
translated: true
outdated: true
---

# Ottelun analyysi (CS2)

**Ottelu**-välilehti toistaa tallenteen hahmoina. Counter-Strike 2 -ottelulle se näyttää myös tulostaulun: kuka voitti kunkin erän, miten, ja kuka teki tapot. Käytä sitä ottelun läpikäymiseen erä erältä ja hyppää sitten samaan hetkeen lämpökartassa.

Ottelu-välilehti toistaa minkä tahansa tallenteen hahmoina: War Thunder- tai Tacview-tallenteen tai CS2-demon, jotka on listattu kohdassa **Toiston ottelut** ([Ottelun toisto](match-replay.md)). CS2:n `.match.json`-tiedosto lisää tämän sivun kuvaaman tulostaulun.

## Käy CS2-ottelu läpi {#review-a-cs2-match}

1. Muunna demo ([alla](#where-the-data-comes-from)) `.parquet`- ja `.match.json`-tiedostoksi.
2. Lataa **Lämpökartta**-välilehdellä `.parquet`-tiedosto kohdassa **Lähde**.
3. Avaa **Ottelu**-välilehti ja napsauta **Lataa ottelutiedostot…**, tai pudota `.match.json`-tiedosto näkymään.
4. Napsauta ottelua kohdassa **Otteluyhteenvedot** ja sitten erän nauhan solua avataksesi erän.
5. Napsauta **Näytä erä** nähdäksesi erän lämpökartassa tai **Toista erä** katsoaksesi sen hahmoina.

![Ottelu-välilehti: erän nauha, yksi erä auki, tappolista ja tulostaulu](../assets/img/en/match-analysis-round.webp)

Sanat, kuten KAST, ADR, eco, force buy ja trade, ovat [sanastossa](glossary.md#counter-strike-words).

## Mistä data tulee {#where-the-data-comes-from}

[3DHeat CS2:n](https://github.com/Holdi601/3DHeat-CS2) demomuunnin muuntaa demot kahdeksi tiedostoksi ottelua kohti, kartan kansioon:

```bash
python -m heat3d_cs2 demos <demotiedostot tai kansiot> -o out
```

| Tiedosto | Ladataan | Sisältää |
|---|---|---|
| `<ottelu>.parquet` | **Lämpökartta**-välilehdelle (Lähde-paneeli, kuten mikä tahansa Parquet: yksi tiedosto, useita tai koko kansio) | jokaisen pelaajan sijainnin kahdeksan kertaa sekunnissa ja jokaisen tapahtuman, jossa se tapahtui: tappo, kuolema, vahinko, laukaus, heitto, savu, flash, HE, molotov, harhautus, sokaisu, planttaus, purku, räjähdys; sarakkeina `match`, `round`, `roundId`, `event`, `player`, `side`, `team`, katselusuunta, `weapon`, `place`, `opening`, `traded` ... |
| `<ottelu>.match.json` | **Ottelu**-välilehti | joukkueet, tulos, jokainen erä (voittaja, tapa, talous, planttaus, jokainen tappo järjestyksessä, clutchit, eloonjääneet), jokaisen pelaajan tulostaulun rivi |

Parquet-tiedoston alatunnisteessa on lukuohjeet (avain `heat3d`), joten se avautuu ilman mitään asetuksia: pelaaja henkilönä, puoli ryhmänä, jokainen erä (`roundId`, "<ottelu> #NN") istuntona, katselusuunta päällä, ja maailma oikein päin (CS2:n maailma on oikeakätinen ja Z ylöspäin; oletus-Z-ylös-kartoituksella se tulisi peilattuna). Katso [Sarakkeiden kartoitus](column-mapping.md) ja [Tiedostojen lataaminen](loading-files.md). `python -m heat3d_cs2 map <kartta>` vie kartan geometrian samaan koordinaatistoon, ladattavaksi **Taso**-kohdassa.

Lukujen takana olevat säännöt ovat muuntimen (ne on kerrottu sen README:ssä ja kuljetettu kunkin yhteenvedon mukana). Kuolema on **tradattu**, kun sen tappajan tappaa uhrin joukkuetoveri **5 s:n** sisällä. **KAST** on niiden erien osuus, joissa on tappo, avustus (flash-avustus lasketaan), selviytyminen tai tradattu kuolema. **Vahinko** on todella menetetty terveys, vain vihollisille. **Clutch** on viimeisenä elossa oleminen puolella, kun vihollisia on pystyssä, ja se voitetaan, kun puoli voittaa erän. **Osto** per puoli lasketaan jäätymisajan lopun keskimääräisestä varustusarvosta: ottelun ensimmäinen erä kummassakin puoliajassa on pistoolierä (ei jatkoajalla), sitten alle 1 500 dollaria on eco, alle 4 000 dollaria force buy, ja sen yli täysi osto.

## Välilehti {#the-tab}

Ottelu-välilehden sivupalkissa ovat ylhäällä lämpökartan tilanvaihtaja ja istuntovalitsin, sitten ottelun osiot ja lopuksi lämpökartan **Suodattimet**-, **Taso**- ja **Kamera**-paneelit. Näkymä on sen Parquet-tiedoston lämpökartta, joka on ladattu Lämpökartta-välilehdelle.

### Otteluyhteenvedot {#match-summaries}

| Säädin | Tekee |
|---|---|
| **Lataa ottelutiedostot…** | valitsee `.json`-tiedostoja (useita kerralla): `.match.json`-yhteenvedot |
| pudota näkymään | Ottelu-välilehden ollessa auki näkymään pudotetut JSON-tiedostot latautuvat samalla tavalla (muut tiedostot ohitetaan) |
| **Tyhjennä** | poistaa kaikki ottelut |
| **Kaikki ottelut** (kun niitä on kaksi tai enemmän) | "N ottelua, M erää": tilastot kaikista yhdessä |
| ottelurivi | "TeamA 13 vs TeamB 9", kartta · N erää: avaa ottelun |

Tiedosto hyväksytään, kun se on JSON, jossa on `"format": "heat3d-cs2-match"` ja taulukot `rounds`, `players` ja `teams`. Virheet luetellaan painikkeiden alla: "<tiedosto>: ei JSON", "<tiedosto>: ei CS2-ottelun yhteenveto (heat3d-cs2-match)", "<tiedosto>: rounds, players tai teams puuttuu". Ottelu, joka ladataan uudelleen (sama `match`-nimi), korvaa aiemman. Ottelut lajitellaan kartan ja sitten nimen mukaan. Kun ladattu on täsmälleen yksi ottelu, se avataan; muuten valinta säilyy (oletuksena kaikki ottelut).

Kun mitään ei ole ladattu, osio selittää: muunna `python -m heat3d_cs2 demos` -komennolla, lataa `.match.json`-tiedostot tässä ja `.parquet`-tiedostot Lämpökartta-välilehdellä.

### Ottelu (yksi ottelu auki) {#match-one-match-open}

**Otsikko:** molemmat joukkueet tuloksineen, kartta, puoliajat - "puoliajat 7-5, 6-6": erät 1-12 ja 13-24 (premier- ja kilpailupeli MR12; yhteenvedon oma puoliajan pituus, kun se on ilmoitettu, joten 1-15 ja 16-30 MR15:lle) - ja kun ottelu meni jatkoajalle, sen oma tulos: "jatkoaika 4-2", erät molempien puoliaikojen jälkeen. Tasatulos ei kuulu kummallekaan joukkueelle. Ja "N erää katkaistu demossa", kun yhteenvedossa on keskeneräisiä eriä.

**Erän nauha:** solu per erä, väritetty sen puolen mukaan, joka voitti, sen numero ja merkki, miten se päättyi. Tasaerä (ei voittajaa) on neutraali harmaa solu, merkittynä `=`, ei minkään puolen värillä. Sen vihje sanoo "Erä 30: tasan - kumpikaan puoli ei voittanut sitä".

| Merkki | Päättynyt |
|---|---|
| B | pommi räjähti |
| D | pommi purettiin |
| K | kaikki vastustajat poistettiin |
| T | aika loppui |
| S | antautuminen |
| = | tasatulos |
| ? | muu |

Jakaja merkitsee toisen puoliajan alun (erä 13 tai yhteenvedon puoliajan pituuden jälkeinen erä) ja jokaisen kolmen erän jatkoajan puoliajan alun (erät 25, 28, 31 ...). Viemällä hiiren solun päälle näkyy: "Erä 7: TeamA (T) - pommi räjähti, plantattu A" ("…, plantattu, paikka tuntematon", kun yhteenvedossa ei ole paikkaa), sekä molempien puolten osto ja varustusarvo. Napsauta avataksesi erän; napsauta uudelleen sulkeaksesi sen ("Napsauta erää nähdäksesi sen tapot, talouden ja toiston.").

**Erä:**

- "Erä 7: <joukkue> voitti - <miten>" ("Erä 30: tasan - kumpikaan puoli ei voittanut sitä" tasatuloksella) ja kuinka kauan erä kesti (jäätymisen loppu ratkaisuun, m:ss);
- talous: kunkin puolen joukkue, osto (pistooli, eco, force buy, täysi osto) ja varustusarvo ("$4 350");
- planttaus: paikka, pelaaja ja aika erän alusta (kummastakin yhteenvedon versiosta); "Plantattu pelaajan <pelaaja> toimesta kello 1:05, paikka tuntematon", kun paikka ei ole tiedossa;
- **tappolista** järjestyksessä: aika erän alusta, hyökkääjä (puolen värissä; "world", kun hyökkääjää ei ole), ase ja liput: **HS** päänlaukaus, **WB** seinän läpi, **SM** savun läpi. **avaus** erän ensimmäinen tappo, **trade** (kosti joukkuetoverin 5 s:n sisällä), **tradattu** (tappaja tapettiin 5 s:n sisällä), **team** joukkuetappo (itsemurha ei ole sellainen). Tapot erän ratkettua himmennetään;
- clutchit: "<pelaaja> (T) yksin vastaan 3: voitti clutchin" / "hävisi sen";
- kuka oli elossa lopussa, puolittain ("ei kukaan");
- **Näytä erä**: kaikki tässä erässä lämpökartassa;
- **Toista erä**: toistaa erän laatikoina alusta alkaen (alla).

**Näytä lämpökartalla** -painikkeet (katso [alla](#show-in-the-heatmap)) tälle ottelulle tai avoimelle erälle.

### Tulostaulu {#scoreboard}

Taulukko per joukkue, rivi per pelaaja:

| Sarake | On |
|---|---|
| K, D | tapot, kuolemat |
| A | avustukset, flash-avustukset mukaan lukien |
| ± | tappot miinus kuolemat (vihreä yli 0, punainen alle) |
| ADR | vahinko per erä, todella menetetty terveys |
| KAST | % eristä, joissa oli tappo, avustus, selviytyminen tai tradattu kuolema |
| HS | % päänlaukauksista tapoista |
| Open | avausduelit voitettu-hävitty |
| Cl | clutchit voitettu/pelattu |

Vie hiiri pelaajan päälle: trade-tapot, tradattu-kerrat, flash-avustukset, sokaistut viholliset, apuvälineiden vahinko ja monitapoerät ("2×3k"). **Napsauta pelaajaa** nähdäksesi hänen tapponsa ja kuolemansa lämpökartassa (tämä ottelu).

### Ottelut yhdessä (Kaikki ottelut) {#across-matches-all-matches}

Kaikissa ladatuissa otteluissa:

- "N ottelua · M erää · <kartat>" ja "N erää tasan, joita kumpikaan puoli ei voittanut", kun tasaeriä on;
- **Voitetut kierrokset** puolittain: kaikkiaan, **pistooli**-erissä (yhteenvedon pistooli-erät) ja **eco**-, **force**- ja **täysi**-ostoissa (kukin prosenttina pelatuista eristä; vie hiiri päälle nähdäksesi "voitettu / pelattu"). Tasaerän pelaavat molemmat puolet, eikä kumpikaan voita sitä;
- **Pommi**: planttaukset paikoittain ja kuinka usein T-puoli voitti nämä erät ("12 planttausta A:lle (T voitti 67 %)"), planttaukset, joiden paikkaa yhteenveto ei tunne ("2 planttausta tuntemattomaan paikkaan (T voitti 50 %)"), tai "ei koskaan plantattu"; erien päättyminen, yleisin ensin;
- "Puoli, joka teki avaustapon, voitti N % noista erästä." (itsemurha ei ole avaustappo, eikä tasaerä muuta avausta);
- **Avauskaksintaistelut, missä**: kymmenen paikkaa, joissa on eniten avaustappoja (uhrin mukaan; pelin paikannimet luettavassa muodossa, "TopofMid" → "Top of Mid"), duellit ja osuus, jonka T-puoli voitti;
- **Pelaajat**: viisitoista parasta tappojen miinus kuolemien mukaan, yhdistettynä kaikista otteluista (yhdistetty Steam-tunnuksella): ottelut, K-D, ADR ja KAST painotettuna pelattujen erien mukaan, HS-% painotettuna tapoilla, avausduellit. **Napsauta pelaajaa** nähdäksesi hänen tapponsa ja kuolemansa kaikissa otteluissa lämpökartassa.

Kaikkien ladattujen otteluiden Näytä lämpökartalla -painikkeet ovat sen alla.

## Näytä lämpökartalla {#show-in-the-heatmap}

Jokainen linkki asettaa lämpökartan omat **suodattimet**, joten näytetty pysyy näkyvissä ja muokattavissa Suodattimet-paneelissa. **Näytä kaikki** tyhjentää ne. Ne toimivat Lämpökartta-välilehdellä ladatussa lämpökarttataulukossa; ottelu-välilehti ei lataa sitä itse.

| Painike | Näytetyt tapahtumat |
|---|---|
| **Sijainnit** | `position` - missä pelaajat olivat, kahdeksan kertaa sekunnissa |
| **Tapot** | `kill` - missä tappaja seisoi |
| **Kuolemat** | `death` - missä uhri kaatui |
| **Avaukset** | `kill` ja `death`, joissa `opening` = 1 - jokaisen erän ensimmäinen tappo, missä molemmat seisoivat (tarjotaan vain, kun taulukossa on `opening`-sarake) |
| **Savut** | `smoke` - missä savut laskeutuivat |
| **Flashit** | `flash` - missä flashit paukahtivat |
| **Molotovit** | `molotov` - missä molotovit ja sytytyspommit paloivat |
| **HE** | `he` - missä HE-kranaatit räjähtivät |
| **Planttaukset** | `plant` - missä pommi plantattiin |
| **Laukaukset** | `shot` - mistä laukauksia ammuttiin |

Rajataan sen mukaan, missä painikkeet ovat: kaikki ladatut ottelut, tämä ottelu tai tämä erä ("Näytä lämpökartalla - erä 7").

Mitä ei voida soveltaa, sanotaan painikkeiden alla eikä suodateta hiljaa tyhjäksi: "ottelusaraketta ei ole säilytetty - ottelua ei sovellettu", "ottelu: X ei ole ladatussa datassa", sama erälle ja tapahtumille, "pelaaja X ei ole ladatussa datassa", "puoli X ei ole ladatussa datassa", "lämpökartan dataa ei ole ladattu: lataa otteluiden .parquet-tiedostot Lämpökartta-välilehdellä". Ilman ladattua dataa linkit kertovat myös: "Lataa otteluiden .parquet-tiedostot Lämpökartta-välilehdellä nähdäksesi ne kartalla."

**Toista erä** lisäksi vaihtaa lämpökartan **Laatikkotoistoon**, aikajanan *toisto*-tilaan ikkunan ollessa *elinajalla*, hakeutuu erän istunnon alkuun ja toistaa. Kun erä ei ole ladatun datan istunto: "tämä erä ei ole ladatun datan istunto: ei mitään toistettavaa".

## Kehittäjille {#for-developers}

Koodi: [`src/ui/match/MatchPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/match/MatchPanel.tsx),
[`src/match/matchDoc.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/matchDoc.ts),
[`src/match/focus.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/focus.ts),
[`src/state/matchStore.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/state/matchStore.ts).

### Yhteenvetojen versiot {#summary-versions}

Välilehti lukee version 1 ja version 2 yhteenvedot (tiedoston kohta `"version"`) rinnakkain ja käsittelee niitä samalla tavalla:

| | Versio 2 | Versio 1 |
|---|---|---|
| planttauksen aika | sekunteja erän alusta, kuten tapot | ottelun sekunteja; välilehti vähentää erän alun |
| planttauksen paikka | `A` tai `B`; tyhjä, kun demo ei kerro | `A`, `B` tai yksikön numero, luetaan tuntemattomana paikkana |
| puoliajan pituus | `halfLength`, siitä, missä puolet vaihtavat ensimmäisen kerran; 12, kun se on null | 12 (MR12) |
| pistooli-erät | `pistolRounds` (erä 1 ja ensimmäinen erä puoliajan jälkeen) | erät, joiden osto on `pistol` |
| tasaerä | `winner` ja `winnerTeam` tyhjiä | - |
| itsemurha | `suicide` tappoon, ei koskaan joukkuetappoa | kerrottu sen mukaan, että hyökkääjä ja uhri ovat sama pelaaja |

Tappo, jolla on `noscope` ja `attackerBlind` (versio 2), ei näy Ottelu-välilehdellä. Välilehti ei myöskään näytä paikkaa lämpökartan taulukosta, joten kranaatin tyhjä `place` sieltä ei muuta mitään täällä.

Miten fokus muuttuu suodattimiksi (`focusFilters`):

- **ottelu** → kategoriasuodatin `match`-sarakkeelle;
- **erä** → aluesuodatin `round` = N numeerisella `round`-sarakkeella (kategoriasuodatin kategorisella), ja erän istunto (`<ottelu> #NN`) valitaan istuntovalitsimessa;
- **tapahtumat** → kategoriasuodatin `event`-sarakkeelle;
- **pelaaja** → henkilösuodatin kyseiselle pelaajalle;
- **puoli** → ryhmäsuodatin.
