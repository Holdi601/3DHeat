---
title: "Tiedostojen lataaminen"
parent: "Datan lataaminen"
nav_order: 1
lang: "fi"
source: "loading-files.md"
source_hash: "75d650b0894d"
translated: true
outdated: false
---

# Tiedostojen lataaminen

Tämä sivu näyttää, miten annat 3DHeatille tiedostosi ja mitä se tekee niille. Pudota kansio, niin se valitsee tiedostot, joissa on sijainteja, ja yhdistää ne yhdeksi kuvaksi.

1. Avaa **Lähde** Lämpökartan sivupalkin yläosassa.
2. Pudota tiedostot tai kansio pudotusalueelle, tai paina **Tiedostot…** tai **Kansio…**.
3. Lue valinnan rivi ja **Muistiarvio** (katso kuva alla).
4. Paina **Lataa**.

![Lähde-paneeli, kun kansio, jossa on kymmenen ottelua, on pudotettu: 1 valinnan rivi, 2 Muistiarvio sopii, ja 3 Lataa 10 tiedostoa](../assets/img/en/loading-files-source.webp)

*Kun pudotat kansion, 3DHeat kertoo, mitä se löysi ja mahtuuko se.*

Tiedostot ladataan **Lähde**-paneelissa Lämpökartta-välilehden sivupalkin yläosassa. Kaikki kerralla valitut tulevat **yhdeksi** aineistoksi.

## Tiedostojen valitseminen {#choosing-files}

| Säädin | Mitä se tekee |
|---|---|
| **Pudota tiedostot tai kansio tähän** (pudotusalue) | Pudota mitä tahansa tiedostoja ja kansioita. Kansiot käydään läpi rekursiivisesti. Pudotusalueen napsauttaminen avaa saman valitsimen kuin **Tiedostot…**. |
| **Yksi tiedosto…** | Tiedostovalitsin yhdelle tiedostolle. |
| **Tiedostot…** | Tiedostovalitsin, joka hyväksyy useita tiedostoja. |
| **Kansio…** | Kansiovalitsin (selaimen `webkitdirectory`-valitsin). Jokainen kansiopuun tiedosto tarjotaan. |

Valitsimet hyväksyvät tiedostotyypit, jotka löytyvät [luettavien tiedostojen luettelosta](data-formats.md#files). Lyhyesti: `.parquet`- ja `.pq`-tiedostot luetaan Parquet-muodossa, `.csv`-, `.tsv`- ja `.txt`-tiedostot erotinmerkillisenä tekstinä. `.acmi` (Tacview), OCAP `.json`- ja `.json.gz`-tiedostot sekä GPS-muodot (GPX, KML, KMZ, NMEA, IGC, FIT) kulkevat omien lukijoidensa kautta. `.3dheat`-ottelusäiliöt latautuvat taulukoina, jotka ne sisältävät ([Yksi tiedosto ottelua kohden](container.md)). Säiliö, jota ei voi lukea, ohitetaan syyllä *ei csv- eikä parquet-tiedosto*.

Pudotettuja kansioita käydään läpi enintään 12 tasoa syvälle ja enintään 20 000 tiedostoa. Tämä estää symbolisten linkkien silmukat ja liian suuret puut.

## Mitkä tiedostot säilytetään {#which-files-are-kept}

Ennen kuin mitään luetaan, valinta suodatetaan ([`filterDataFiles`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts)):

- Tiedosto, jolla on toinen tiedostopääte, ohitetaan: *ei csv- eikä parquet-tiedosto*.
- Tiedosto, jonka koko on 0 tavua, ohitetaan: *tyhjä (0 tavua)*.
- **Muuntimen sivutiedostot**, eli raakadata, jonka muunnin säilyttää ottelutaulukon vieressä, `<ottelu>.messages.parquet`, `.events.parquet`, `.raw.parquet` ja muut, jotka on lueteltu kohdassa [Muuntimet säilyttävät kaiken](converters.md), ohitetaan: *muuntimen sivutiedosto*. Jotta sellaisen voi avata, valitse tai pudota se yksin (tai pelkkiä sivutiedostoja). Pelkistä sivutiedostoista koostuva valinta ladataan kuten mikä tahansa taulukko. Taulukon vieressä oleva JSON (`.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json` ja `.hints.json`) ei koskaan tarjoudu sijainteina.
- **Liikkeitä-tiedostosääntö.** Jos jokin valinnan tiedosto on nimetty `movement*.parquet`, `movement*.csv` (ja muilla päätteillä), esimerkiksi `movement.parquet` tai `movement_1.parquet`, jätetään jokainen muu datatiedosto pois: *ei liiketiedosto, ja tässä kansiossa on liiketiedostoja*. Telemetriaviennit sisältävät usein yhden sijaintitaulukon kymmenien taulukoiden rinnalla, joissa ei ole sijainteja. Vain edellinen voidaan piirtää. Kansio ilman liiketiedostoa lataa kaikki datatiedostonsa. Esimerkki: kansio, jossa on `movement_1.parquet`, `kills.parquet` ja `shop.parquet`, lataa `movement_1.parquet`-tiedoston. Kaksi muuta luetellaan ohitettuina. Esimerkki: kansio, jossa on `movement_1.parquet`, `kills.parquet` ja `shop.parquet`, lataa `movement_1.parquet`-tiedoston. Kaksi muuta luetellaan ohitettuina.
- Säilytetyt tiedostot järjestetään niiden polun mukaan valinnan sisällä. Sama kansio tuottaa siis aina saman aineiston ja samat värit.

Paneeli näyttää sitten valinnan: yhden tiedoston nimen tai muodossa `kansio (N tiedostoa)`, jossa käytetään pisimmän yhteisen kansion nimeä. Se näyttää tiedostojen määrän, niiden kokonaiskoon ja rivien kokonaismäärän. Määrä on tarkka, kun kaikki tiedostot ovat Parquet-tiedostoja. Jos jokin on CSV, määrä merkitään `≈`:llä. Ohitetut tiedostot luetellaan syineen. Ensimmäiset neljä näytetään nimeltä.

## Skeeman lukeminen {#reading-the-schema}

Valinnan **ensimmäinen** tiedosto avataan skeeman kuvaamiseksi ("Luetaan skeemaa"). Siitä saadaan sarakkeiden nimet, sen ensimmäiset 50 datariviä, sarakkeet, jotka näyttävät numeerisilta, ja Parquet-tiedostoissa kunkin sarakkeen looginen tyyppi sekä `heat3d`-alatunnisteen merkintä. Saman taulukon viennit kansiossa jakavat yhden skeeman, joten yksi tiedosto edustaa kaikkia. Sitten jokainen tiedosto mitataan ("Lasketaan rivejä"). Parquet-alatunniste antaa tarkan määrän yhdellä pienellä lukemalla. CSV-tiedoston määrä arvioidaan sen ensimmäisen megatavun keskimääräisestä rivipituudesta.

[Sarakemääritys](column-mapping.md)-paneeli avautuu automaattisesti tehdyillä arvauksilla. [Muistiarvio](memory-and-budgets.md) näkyy **Lataa**-painikkeen yläpuolella.

## Viestit ennen lataamista {#messages-before-loading}

Valinnan alla paneeli luettelee [`validateMapping`](https://github.com/Holdi601/3DHeat/blob/main/src/data/validate.ts)-funktion löydökset:

- **Virheet** (punaisella): lataus ei voi alkaa. Syitä ovat alle kaksi sijaintiakselia, sama sarake kahdella akselilla, kartoitettu sarake, jota ei ole tiedostossa, sijaintisarake, joka ei näytä numeeriselta, aikasarake, jonka näytteet ovat tekstiä, vaikka yksikkö on numero (jokainen rivi lukisi NaN:nä ja päätyisi aikaan 0), aikasarake, joka on ISO-8601 ja jonka yksikään näyte ei ole päivämäärä, sekä yksikköskaala 0.
- **Varoitukset** (keltaisella): lataus tapahtuu, mutta todennäköisesti ei niin kuin on tarkoitettu. Ryhmäsarake, jolla on eri arvo useimmilla näytteillä (joten se on tunniste, ei ryhmä). `DATE`-aikasarake (jokaisella päivän rivillä on sama hetki). Katselusuunta on asetettu ilman sen sarakkeita.
- **Huomautukset**: mitä kartoitus merkitsee. Piirto tasoon, kun yhtä akselia ei ole kartoitettu. Ei aikajanaa ilman aikasaraketta. Ei reittejä ilman henkilösaraketta. Ilman ryhmäsaraketta kaikki on yhtä väriä, ja ero voi jakaa vain sarakkeen mukaan, joka on säilytetty suodatusta varten.

## Lataaminen {#loading}

**Lataa**-painike lukee *Lataa tiedosto*, *Lataa N tiedostoa* tai *Lataa N tiedostoa (1/K)*, kun [näytteenoton askel](memory-and-budgets.md#decimation) on asetettu. Se lukee *Liian suuri - pienennä tai harvenna* ja on pois käytöstä, kun [sovitustarkistus](memory-and-budgets.md#the-fit-check) sanoo, ettei lataus mahdu. Se on myös pois käytöstä, kun kartoituksessa on virheitä tai jokin toinen lataus on käynnissä.

Latauksen aikana paneeli näyttää nykyisen vaiheen (ja `[tiedosto/tiedostot]` sen edessä, kun tiedostoja on useita), tähän mennessä luetut rivit, edistymispalkin ja **Peruuta**-painikkeen. Peruuta lopettaa ingest-työntekijän ja sen mukana kaikki jäsennystyöntekijät, jotka se on käynnistänyt.

Sivu piirtää edelleen latauksen aikana, koska työ tehdään taustalla. Näet nykyisen vaiheen, luetut rivit, edistymispalkin ja **Peruuta**-painikkeen. Viimeisen tiedoston jälkeen paneeli näyttää vaiheet *Laitetaan rivejä aikajärjestykseen*, *Järjestetään sarakkeita uudelleen (n / m)*, *Mitataan laajuus*, *Rakennetaan rosteria*, *Tiivistetään istuntoja* ja *Lasketaan elinaikoja*. Sen jälkeen yhden kuvan ajan näkyy *Ladataan N riviä GPU:lle*. Näin pitkää latausta ei sekoiteta jumiutumiseen.

### Miten se toimii {#how-it-works}

Lataus tehdään Web Worker -prosessissa ([`ingestWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestWorker.ts)). Kun tiedostoja on useita ja [jäsennyssäikeitä](memory-and-budgets.md#parser-threads) on enemmän kuin yksi, jopa niin monta tiedostoa jäsennetään **samaan aikaan**. Kukin jäsennetään omassa jäsennystyöntekijässään ([`parseWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parseWorker.ts)). Tämä tehdään niin pitkälle kuin RAM-budjetti antaa tilaa. Ne yhdistetään silti yksi kerrallaan valinnan järjestyksessä, joten aineisto on sama kuin yksi kerrallaan ladattaessa. Kun useita on käynnissä, edistymisrivi kertoo viimeksi ilmoittaneen tiedoston, ja palkki sekä rivimäärä laskevat yhteen kaikki käynnissä olevat tiedostot. Yhdellä säikeellä tai yhdellä tiedostolla tiedostot jäsennetään peräkkäin itse ingest-työntekijässä. Luetaan vain sarakkeet, jotka kartoitus nimeää. Parquet-tiedoston kartoittamaton sarake ei maksa mitään. CSV skannataan tavu tavulta, mutta vain kartoitetut kentät puretaan.

## Useista tiedostoista yksi aineisto {#several-files-become-one-dataset}

Kun ladataan useampi kuin yksi tiedosto ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), [`builder.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)):

- **Yksi rosteri.** Henkilöt, ryhmät, istunnot ja luokkien arvot ovat sanakirjoja, jotka ovat yhteisiä kaikille tiedostoille. Sama pelaaja kahdessa viennissä on siis yksi henkilö yhdellä radalla.
- **Yksi aikaorigo.** Ajat säilytetään 64-bittisinä sekunteina yhdistämisen aikana. Ne siirretään koko valinnan aikaisimpaan aikaan ja tallennetaan sitten 32-bittisinä sekunteina tästä origosta. Neljä vientiä neljältä iltapäivältä asetetaan oikeaan järjestykseen, eikä niitä pinota toistensa päälle.
- **Yksi aikajärjestys.** Kaikkien tiedostojen rivit lajitellaan ajan mukaan radix-lajittelulla (katso [lajittelun katto](memory-and-budgets.md#the-sort-ceiling)).
- **`Source file` -sarake.** Jokainen rivi muistaa, mistä tiedostosta se tuli. Tieto on kategoriasarakkeessa nimeltä `Source file`. Sarake näkyy [Suodattimissa](filters.md), ja [eroerottelussa](difference.md) se näkyy nimellä *Source file - compare two loads*. Yhden tiedoston lataukseen sitä ei lisätä, koska vakiosarake veisi 4 tavua riviä kohden eikä kertoisi mitään.
- **Puuttuvat sarakkeet.** Tiedosto, josta puuttuu jokin *suodatin*sarakkeista, tuo vain tyhjät arvot sille. Tiedosto, josta puuttuu kartoitettu *rooli*sarake (X, aika, henkilö ...), epäonnistuu viestillä *tiedostossa ei ole saraketta "nimi"*. Monen tiedoston latauksessa se ohitetaan, ja muut latautuvat silti. Ohitetut tiedostot luetellaan aineistossa. Yhden tiedoston lataus raportoi virheen, jos se epäonnistuu.
- **Puutevaroitus.** Kun ladatut rivit ovat alle 95 % etukäteen lasketuista riveistä, aineistossa on varoitus. Se kertoo puuttuvan osuuden. Syynä voivat olla luettavissa olemattomat tiedostot tai rivit, joilta puuttuu käyttökelpoinen sijainti. Ne pudotetaan pois jo sisäänluvussa.

## Lataamisen jälkeen {#after-loading}

Uusi aineisto korvaa edellisen. Joka latauksessa ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/state/store.ts)):

- kaikki suodattimet ja ryhmien näkyvyys tyhjennetään;
- ryhmittäinen eroerottelu nollataan: ryhmien ensimmäinen puoli (pyöristettynä ylöspäin) on positiivinen, loput negatiivisia;
- pisteen säde asetetaan vaakasuuntaisen laajuuden / 120 mukaan ja kyllästys analyyttiseen arvioon. Kuution koko, katsesäteen pituus, lentonopeus ja lähi- ja kaukotasot asetetaan laajuudesta (katso [Istunnot, henkilöt ja ryhmät](sessions-persons-groups.md#entity-size));
- laatikkotoiston istunnoksi asetetaan se istunto, jossa on eniten rivejä;
- viivalämmön reitit arvioidaan uudelleen ([Viivalämpö](line-heat.md));
- näkymätila palaa **Lämpö**-tilaan, jos nykyinen tila ei tue uutta dataa. Aikajana palaa tilaan **Kaikki**, jos aikasaraketta ei ole. Historia palaa tilaan **Kertyvä**, jos elinaikoja ei ole;
- soittopää asetetaan alkuun, ja toisto pysähtyy;
- kamera kehystää koko aineiston oletussuunnasta (katsoo -Z-suuntaan, kallistettuna noin 36° alaspäin).

**Aineisto**-paneeli näyttää sitten aineiston nimen (valinnan, rivien ja tiedostojen määrät sekä askeleen, jos sitä käytettiin), rivin `N joukkuetta · N henkilöä · N s jakso` ja jokaisen latauksen varoituksen keltaisena niin kauan kuin aineisto on ladattuna. Paneelin **Vapauta** poistaa aineiston.
