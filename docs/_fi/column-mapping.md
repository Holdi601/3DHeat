---
title: "Sarakemääritys"
parent: "Datan lataaminen"
nav_order: 2
lang: "fi"
source: "column-mapping.md"
source_hash: "8ea2f450df99"
translated: true
outdated: false
---

# Sarakemääritys

Tiedosto on taulukko. 3DHeatin pitää tietää, mikä sarake sisältää itä-länsi-sijainnin, mikä ajan, mikä pelaajan nimen ja niin edelleen. Tämä paneeli kertoo, mitä se arvasi, ja tässä voit korjata väärän arvauksen.

![Sarakemääritys-paneeli Parquet-tiedoston latauksen jälkeen: jokainen ruutu on jo täytetty - 1 X, 2 Y, 3 Z, 4 Aika, 5 Henkilön tunniste, 6 Istunto / ottelu, 7 Joukkue / ryhmä](../assets/img/en/column-mapping-panel.webp)

*Tiedosto antoi sarakkeilleen nimet itse, joten jokainen ruutu on jo täytetty.*

Esimerkiksi CSV, jonka otsikko on `x,y,z,t,player,team`, kartoittaa itsensä. x, y ja z muodostavat sijainnin, `t` on aika, `player` on [henkilö](glossary.md) ja `team` on [ryhmä](glossary.md).

Kun tiedostot on valittu, **Sarakemääritys**-paneeli avautuu Lähde-paneelin alapuolelle. Se kertoo, mikä sarake toimii mihinkin rooliin. Paneeli täyttyy automaattisesti, ja jokaista kenttää voi muuttaa ennen **Lataa**-painikkeen painamista. Kartoitus luetaan latauksen aikana, joten jos muutat sen myöhemmin, sinun täytyy ladata uudelleen.

## Kentät {#the-fields}

Kaikki sarakevalikot listaavat ensimmäisen tiedoston jokaisen sarakkeen sekä kohdan *- ei mitään -*.

| Kenttä | Rooli | Huomiot |
|---|---|---|
| **Erotin** | Vain CSV: kenttien erotinmerkki. | Valikko: *Pilkku ,*, *Puolipiste ;*, *Sarkain*, *Putkimerkki \|*, *Välilyönti*. Voit myös kirjoittaa minkä tahansa yksittäisen merkin kenttään *tai kirjoita yksi merkki*. Erotin tunnistetaan automaattisesti (katso alla). Kun vaihdat sen, automaattinen kartoitus ajetaan uudelleen, joten aiemmat muokkaukset menevät hukkaan. |
| **X**, **Y**, **Z** | Sijainti. | Vähintään kaksi vaaditaan. Kartoittamaton kolmas akseli on 0, eli data on tasossa. Sama sarake kahdella akselilla on virhe. |
| **Ylöspäin osoittava akseli lähteessä** | Mikä lähteen akseli osoittaa ylös. | *Z on ylös (useimmat pelimoottorit)* tai *Y on ylös (grafiikkakäytäntö)*. Katso [Akselit, yksiköt ja aika](axes-units-and-time.md). |
| **Yksikön mittakaava** | Kertoo jokaisen sijainnin. | Painikkeet *1 (m)* ja *0,01 (cm→m)*, tai kirjoita arvo. |
| **Käännä X / Käännä Y / Käännä Z** | Kääntää lähteen akselin merkin. | Sovelletaan sijainteihin ja katsesuunnan vektoreihin. |
| **Aika** | Aika-akseli. | Valinnainen. Ilman sitä ei ole aikajanaa. |
| **Aikayksikkö** | Miten aikasaraketta luetaan. | Seitsemän yksikköä. Katso [Akselit, yksiköt ja aika](axes-units-and-time.md#time). Parquetin `TIMESTAMP`- ja `DATE`-sarakkeille tämä ei päde, ja paneeli kertoo sen. |
| **Henkilön tunniste** | Kenelle tai mille rivi kuuluu. | Valinnainen. Tekee mahdolliseksi radat, elinajat, laatikkotoiston ja viivalämmön. |
| **Istunto / ottelu** | Mihin otteluun, raidiin, kierrokseen, ajoon tai kisaan rivi kuuluu. | Valinnainen. Sijainteja ei koskaan interpoloida, jätetä jälkeä tai yhdistetä reitiksi istunnon vaihtuessa. Katso [Istunnot, henkilöt ja ryhmät](sessions-persons-groups.md). |
| **Joukkue / ryhmä** | Mikä tahansa sarake, jossa on vähän eri arvoja. | Valinnainen. Ohjaa ryhmien värejä, joukkuelämpöä ja ryhmittäistä eroerottelua. |
| **Katsesuunta** | *Ei mitään*, *Kiertokulma- / nyökkäyssarakkeet* tai *Suuntavektorisarakkeet*. | Kiertokulmalla: **Kiertokulma**, **Nyökkäyskulma** ja **Kulmayksikkö** (*Asteet* / *Radiaanit*). Vektorilla: **Suunta X**, **Suunta Y**, **Suunta Z**. Käytetään [laatikkotoiston](box-replay.md) katsesäteisiin. |
| **Säilytä suodatusta varten** | Muistissa säilytettävät lisäsarakkeet. | Valintaruutu jokaiselle sarakkeelle. Jokaiselle valitulle on *väli* (numeerinen) tai *kategoria*. Jokainen maksaa 4 tavua riviä kohti ja yhden purkukierroksen latauksessa. Vain säilytettyjä sarakkeita voi [suodattaa](filters.md), käyttää [eroerottelussa](difference.md) tai [viivalämmön](line-heat.md) tapahtumasarakkeena. |
| **Näytä esimerkkirivejä** | Taulukko ensimmäisistä 12 näytteen rivistä, kaikki sarakkeet. | Arvausten tarkistamiseen. |

Valittu suodatussarake, jolle ei ole asetettu tyyppiä, luetaan *väliksi*. Tunnussarake, joka näyttää numeroilta, on usein hyödyllisempi *kategoriana*. Samalla kertaa voi olla aktiivisena vain 4 suodatinta ([Suodattimet](filters.md)).

## Miten automaattinen kartoitus arvaa {#how-the-auto-mapping-guesses}

Arvaus tehdään tiedostossa [`src/data/automap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts). Se katsoo sarakkeiden nimiä, sitä, mitkä sarakkeet ovat numeerisia näytteen riveillä (yli 90 % tyhjän sijaan olevista arvoista tulkitaan luvuiksi), näytteen eri arvojen määrää kussakin sarakkeessa ja Parquetin loogisia tyyppejä. Nimimallit kokeillaan järjestyksessä, kirjainkoosta riippumatta. Ensimmäinen malli, joka täsmää vapaaseen sarakkeeseen, voittaa.

### Sijainti {#position}

| Akseli | Nimimallit järjestyksessä (vain numeeriset sarakkeet) |
|---|---|
| X | `x`, `…_x` / `… x`, `pos…x`, `x…pos`, `loc…x`, `lon…`, `longitude` |
| Y | `y`, `…_y`, `pos…y`, `y…pos`, `loc…y`, `lat…`, `latitude` |
| Z | `z`, `…_z`, `pos…z`, `z…pos`, `loc…z`, `…alt…`, `…height…`, `…elev…` |

Jos akseli on yhä tyhjä, ensimmäiset vapaat numeeriset sarakkeet täyttävät sen järjestyksessä. Ohitetaan sarakkeet `filename`, `level`, `year`, `month`, `day`, `hour` ja `location`. Väärän arvauksen näkee heti ruudulta. Tyhjä akseli jättäisi sen sijaan näkymän tyhjäksi.

### Aika {#time}

- **Ensin Parquetin aikaleimasarakkeet.** Sarakkeista, joiden looginen tyyppi on `TIMESTAMP` tai `DATE`, paras valitaan pisteiden mukaan. Nimi, joka vastaa aikamallia, antaa +10 000. Tavallinen `DATE` antaa -5 000. Lisäksi tulee näytteen eri arvojen määrä. Koko päivän päivämäärä ja vakioitu istunnon alku saavat hyvin vähän eri arvoja, joten tapahtuman hetki voittaa. Yksikkö on silloin *Unix-aikaleima (ms)*.
- **Muutoin nimen mukaan:** `time`, `timestamp`, `ts`, `…event…time…`, `…time…stamp…`, `t`, `…date…time…`, `when`, `tick`, `…frame…`. Sen jälkeen kuluneen ajan nimet: `gdur`, `g_duration`, `…duration…`, `…elapsed…`, `…match time…`, `…round time…`, `…game time…`, `…minute from start…`, `…since start…` ja `age`. Yksikkö arvataan sitten arvoista. ISO-8601, kun arvo näyttää muodolta `YYYY-MM-DDT…` tai `YYYY-MM-DD …`. Muutoin suurimman suuruusluokan mukaan: yli 10^17 nanosekuntia, yli 10^14 mikrosekuntia, yli 10^11 Unix-millisekuntia, yli 10^8 Unix-sekuntia, yli 10^6 millisekuntia, muuten sekuntia.

Kun valitaan kulunut aika -sarake, paneeli huomauttaa, että jokainen istunto kohdistetaan silloin omaan alkuunsa. Se sopii otteluiden päällekkäin piirtämiseen, mutta ei niiden näyttämiseen oikeassa järjestyksessä.

### Istunto, henkilö, ryhmä {#session-person-group}

Istunto valitaan **ajan jälkeen** ja **ennen** henkilöä ja ryhmää. Istuntosarake on usein aikaleima (ottelun alkuhetki jokaisella ottelun rivillä).

| Rooli | Nimimallit järjestyksessä |
|---|---|
| Istunto | `session` / `session_id`, `match…`, `round…`, `raid…`, `game…`, `run…`, `replay…`, `instance…`, `lap…`, `stint…` (jokainen täsmälleen, valinnaisena `_id`-päätteenä) |
| Henkilö | `name`, `…player…id/name…`, `…user…`, `…account…`, `persona…`, `…character…`, `victim`, `actor`, `…puuid…`, `…steam id…`, `subject…`, sitten `driver` / `driver_id` / `driver_name`, `car` / `car_id` / `car_name` (kilpailudata: liikkuva asia on auto) |
| Ryhmä | `spawn_team`, `real_team`, `team` / `team_id` / `team_name`, `squad…`, `side`, `…faction…`, `clan…`, `party…`, `alliance…`, `car_class` |
| Ryhmä, varaehdokas | `…victim_ai…`, `…killer_ai…`, `…is_ai/bot/npc…`, `target_type`, `survived`, `outcome`, `result` |

Ryhmäehdokas, jolla on eri arvo useimmilla näytteen riveillä (enemmän kuin max(48, 60 % näytteestä)), on tunniste eikä ryhmä. Se tulee henkilösarakkeeksi, jos sellaista ei löytynyt, eikä sitä käytetä ryhmänä. Jos ryhmäsaraketta ei löydy lainkaan, käytetään ei-numeerista saraketta, jossa on vähiten eri arvoja väliltä 2–12.

### Katsesuunta {#look-direction}

Numeerinen sarake nimeltä `yaw`, `…rot…yaw…`, `…heading…`, `azimuth…`, `…view…yaw…` tai `rot_z` / `rotation_z` vaihtaa katsesuunnan kiertokulma- ja nyökkäystilaan. Nyökkäystä etsitään nimillä `pitch`, `…rot…pitch…`, `…elevation…angle…` ja `…view…pitch…`. Asteet oletetaan, kun jokin näytteen kiertokulma ylittää itseisarvoltaan 7. Muutoin oletetaan radiaanit. Suuntavektoria ei arvata koskaan. Se tulee alla olevista vihjeistä tai sinulta.

### Suodatussarakkeet {#filter-columns}

Automaattisesti säilytetään enintään **6** saraketta. Ne järjestetään näin:

1. `region`, `sessionMode`, `actor`. Ne ovat sarakkeita, joita varten suodatus on olemassa (pistemäärä 1200).
2. Kategoriasarakkeet, joiden arvot vaihtelevat näytteessä. Ensin ne, joissa on vähemmän eri arvoja (1000 miinus lukumäärä).
3. Näytteessä vakio sarake, mutta vain kun ladataan useita tiedostoja. Se voi vaihdella tiedostojen välillä, kuten alue tai testiajon tunniste (600).
4. Numeeriset sarakkeet (500).

Sarakkeita, joilla on jo rooli, yllä luetellut kohinanimet, yhden tiedoston latauksessa vakioita sarakkeita ja vapaatekstisarakkeita (enemmän kuin max(16, puolet näytteestä) eri arvoa) ei tarjota automaattisesti. Minkä tahansa sarakkeen voi silti valita käsin.

### Ylöspäin-akseli {#up-axis}

Kun kaikki kolme akselia on kartoitettu, ylöspäin valitaan se akseli, jolla Y:n ja Z:n vaihtelu näytteessä on pienempi. Kartta on paljon leveämpi kuin korkea. Muussa tapauksessa oletetaan Z ylös.

## Parquet-alatunnisteen `heat3d`-vihjeet {#the-heat3d-hints-in-a-parquet-footer}

Parquet-tiedosto voi kertoa, miten se pitää lukea. Jos tiedoston alatunnisteen avain-arvo-metatiedossa on merkintä avaimella **`heat3d`**, sen arvo jäsennetään JSON-muodosta ja asetetaan arvausten päälle ([`applyHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). CS2-demomuuntimen kirjoittama merkintä on tällainen. Sen taulukot aukeavat niin, että pelaaja on henkilö, puoli on ryhmä, kukin kierros on istunto, katsesuunta on päällä ja maailma on oikein päin.

Vihjeitä luetaan vain valinnan **ensimmäisestä** tiedostosta. Jokainen merkintä on valinnainen. Jokainen vihjattu arvo näkyy silti paneelissa, ja sen voi muuttaa. Täydellinen kuvaus skeemasta esimerkkeineen ja kirjoitusohjeineen on [Tiedostomuodot-viitteessä](data-formats.md#the-heat3d-hints).

Säännöt lyhyesti:

- Vihjeen nimeämä sarake otetaan käyttöön vain, jos tiedostossa on se sarake.
- `lookMode: "vector"` tulee voimaan vain, kun `dirX`, `dirY` ja `dirZ` ovat kaikki asetettu. `"yawPitch"` tulee voimaan vain, kun `yaw` on asetettu.
- `extra`, jos se on mukana, korvaa automaattisen suodatinluettelon. Tuntemattomat nimet ja sarakkeet, joilla on jo rooli, pudotetaan pois. Kunkin sarakkeen väli- tai kategoriatyyppi seuraa sitä, näyttikö se numeeriselta. Kun se puuttuu, automaattinen luettelo säilyy, paitsi sarakkeet, joille vihje antoi roolin.
- `axes.up` on oltava `"y"` tai `"z"`. Käännösten on oltava totuusarvoja, ja `scale` on oltava positiivinen.
- `entity.size`, kun se on positiivinen, on yhden seurätun asian koko tiedoston yksiköissä ([kohteen koko](sessions-persons-groups.md#entity-size)). Se on ainoa tapa asettaa se.

## Tunnettu ongelma: CSV-erottimen vaihtaminen {#known-issue-overriding-the-csv-separator}

Kun vaihdat erottimen toiseksi kuin tunnistettu, sarakeluettelo ja esimerkkirivit eivät muutu. Esikatselu jakaa edelleen tunnistetulla erottimella. Valittu erotin otetaan silti käyttöön itse latauksessa. Jos tunnistettu erotin on väärä:

1. Avaa tiedosto tekstieditorissa.
2. Korvaa erotin pilkulla kaikkialla (ja desimaalipilkut pisteillä).
3. Tallenna ja lataa tiedosto uudelleen.

Syy on [`previewSource`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sourcePreview.ts)-funktiossa.
