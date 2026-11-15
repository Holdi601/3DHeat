---
title: "Ratatilastot"
parent: "Kisa-analyysi"
nav_order: 57
lang: "fi"
source: "race-course-statistics.md"
source_hash: "0c5c49eeef00"
translated: true
outdated: false
---

# Ratatilastot

Lataa monta kierrosta samalta radalta, niin katselin laskee virheet. Se kertoo, missä mutkassa menetetään eniten aikaa, kuinka monta kierrosta meni siellä pieleen ja miksi. Sitä kannattaa käyttää, kun etsii mutkaa, jota kannattaa harjoitella.

Kokeile: **Esimerkkikierrokset** antaa kolme kierrosta. Se riittää, jotta tämä osio näkyy.

![Ratatilastot virhekartan kanssa: rata on värjätty sen mukaan, kuinka monta kierrosta menetti aikaa kussakin mutkassa, ja mukana on mutkaluettelo](../assets/img/en/race-course-mistake-map.webp)

Lataa radan koko kansio - kymmeniä kierroksia, useita autoja ja useita suorituskykyluokkia - niin jokainen kierros arvioidaan ja lasketaan. Tämä sivu kertoo vertailusta luokittain, siitä mikä lasketaan virheeksi, osiosta **Ratatilastot**, virhekartasta, lämpökartan viennistä, useiden ratojen kierroksista ja suorituskyvyn rajoista, kun kierroksia on paljon.

## Oman luokan parasta vastaan {#against-the-best-of-its-own-class}

Kierrosta verrataan mutka mutkalta **oman suorituskykyluokkansa nopeimpaan täyteen kierrokseen** (vertailukierros, vertailukierroksen luokassa). Kierros itse verrataan siihen, kuka sen luokasta oli nopein kussakin mutkassa. Jos kierros on luokassaan yksin, verrataan kaikkiin kierroksiin. Autot ryhmitellään pelin suorituskykyluokan mukaan. Forzassa luokkia on D:stä X:ään, ja C ja S2 ovat kaksi niistä. C-luokan auton jarrutuspiste ja S2-auton jarrutuspiste eivät kerro ajotaidosta mitään. Aikakartta, aikaerot kierrosluettelossa ja taulukko *Mutka mutkalta* noudattavat samaa vertailua (katso [kenen kanssa kukin kierros verrataan](race-corner-analysis.md#who-each-lap-is-compared-with)).

Tilastot perustuvat jokaisen kierroksen analyysiin, eivät sen rinnalla.

## Mikä lasketaan virheeksi {#what-counts-as-a-mistake}

**Esiintymä** on yhden kierroksen virhe yhdessä mutkassa (osuudessa). Kierroksen virheet mutkassa ovat:

1. **Ajotaitoon liittyvä syy**, jonka analyysi löysi kierroksen menetykselle siinä. Löydös on menetys, joka lasketaan kuljettajan syyksi (ei auton tai tilanteen). Se maksaa **0,05 s** tai enemmän vertailukierrokseen verrattuna. Sen hinta on mutkan menetys.
2. **Jokainen auton hallintavirhe**, jonka kierros teki siinä ja jota toinen kierros ei tehnyt (ei yhteinen). Virhe maksaa **0,03 s** tai enemmän. Tällaisia ovat lukkiutuminen, pyörien pyöriminen, takapään ulosajo, työntyminen ja pyörähdys. Sen hinta on tapahtuman oma hinta.
3. **Jokainen osuma ja törmäys**, oli se yhteinen tai ei, mistä tahansa hinnasta.

Yhdessä mutkassa voi olla useita virheitä. Jokainen laji lasketaan **kerran kierrosta ja mutkaa kohti**. Voitot, auton osuus ja hitaampi saapuminen, joka on päätetty edellisessä mutkassa, eivät ole virheitä.

### Löydöksistä virheisiin {#from-findings-to-mistakes}

| Löydös | Virhe |
|---|---|
| liian nopea sisään, hidas ulos, koska jarrutettiin useita metrejä myöhemmin kuin toinen | Jarrutettiin liian myöhään |
| jarrutettiin aikaisin | Jarrutettiin liian aikaisin |
| jarrutettiin varovasti | Jarrutettiin liian varovasti |
| syynä lukkiutunut pyörä | Pyörä lukkiutui |
| rullattiin | Rullattiin |
| vara pitoon, hitaampi kärkeen, jarrutettiin siellä, missä toinen vain nosti kaasua | Liian hidas mutkan keskellä |
| liian tiukka linja | Liian tiukka linja |
| ajautui leveälle | Ajautui leveälle |
| käännettiin autoa vähemmän tai liikaa | Käännettiin auto väärin |
| kaasu myöhemmin, täysi kaasu myöhemmin tai epäröinti | Kaasu myöhään |
| hitaampi ulos mutkasta | Hitaampi ulos |
| pyörät pyörivät | Pyörät pyörivät |
| takapää lähti, sivuttain mutkan keskellä | Takapää lähti |
| ajettiin ulos radalta | Ajettiin ulos radalta |
| vauhtia hidastettiin | Vauhtia hidastettiin |
| kaasu nostettiin (sisäänajossa tai suoralla) | Kaasu nostettiin |
| lähes pysähdys, pyörähdys, osuma tai kolari syynä | Pyörähti / Osui johonkin / Kolari, kun kierroksen tapahtumat siellä kertovat, mikä; muuten Lähes pysähtyi (ensin kolari, sitten pyörähdys, sitten osuma) |
| pidempi lento | Lensi liian pitkälle |

Kaksi kuviota lasketaan sen sisällä löydetyn syyn mukaan, samalla taulukolla. *Antoi enemmän sisään kuin ulos saatiin takaisin* on sen merkinnän syyn virhe: aikainen jarrutus on *Jarrutettiin liian aikaisin*, lukko *Pyörä lukkiutui*, rullaus *Rullattiin* ja käyttämätön pito *Liian hidas mutkan keskellä*. *Liian nopea sisään, hidas ulos* on *Jarrutettiin liian myöhään*, kun kierros jarrutti myöhemmin kuin toinen. Muutoin se on sen ulosajon syyn virhe: *Kaasu myöhään*, *Pyörät pyörivät*, *Takapää lähti*, *Ajettiin ulos radalta* tai *Hitaampi ulos*. Kuviota, jonka syy on auton, tai hitaampaa saapumista, ei lasketa.

Ei lasketa: hitaampi saapuminen, lähtö ja jokainen *auto*-löydös (veto, pito, jarrut, ajo) sekä jokainen voitto tai tasainen mutka.

### Lajit järjestyksessään {#the-kinds-in-their-order}

Jarrutus: *Jarrutettiin liian myöhään*, *Jarrutettiin liian aikaisin*, *Jarrutettiin liian varovasti*, *Pyörä lukkiutui*. Sisäänajo: *Rullattiin*, *Liian hidas mutkan keskellä*, *Liian tiukka linja*, *Ajautui leveälle*, *Käännettiin auto väärin*. Ulosajo: *Kaasu myöhään*, *Hitaampi ulos*, *Pyörät pyörivät*, *Takapää lähti*, *Ajettiin ulos radalta*, *Vauhtia hidastettiin*. Suora: *Kaasu nostettiin*. Tapahtumat: *Pyörähti*, *Osui johonkin*, *Kolari*, *Lähes pysähtyi*, *Lensi liian pitkälle*.

## Osio Ratatilastot {#the-course-statistics-section}

Osio näkyy, kun kierroksia on **3** tai enemmän. Se on kohdassa **Kierrokset** ja **Parannettavaa** välissä.

- **Yhteenveto**: "40 kierrosta 9 autolla, 3 luokassa: jokainen mutka arvioitu oman luokkansa nopeinta kierrosta vastaan." (autot lasketaan auton numeron tai nimen mukaan).
- **Luokkapainikkeet** (kun luokkia on useita): **Kaikki** ja yksi painike luokkaa kohti, jokaisessa kierrosmäärä. Järjestys noudattaa pelin järjestystä (D, C, B, A, S1, S2, R, X ja muut). Klikkaa luokkaa, niin näet vain sen kierrokset. **Shift+klikkaus** lisää tai poistaa yhden luokan. Kaikki alla oleva - luettelot, kartta ja lämpökartan vienti - seuraa valittuja luokkia.
- **Mikä menee useimmin pieleen**: jokainen virhelaji, eniten kierroksia ensin (sitten useimmin, sitten suurin hinta). Enintään 8 riviä. **Kaikki N lajia** näyttää loput, **Vähemmän** piilottaa ne taas. Jokaisella rivillä on nimi, "N / M kierrosta", palkki osuudelle sekä "K kertaa · noin X s · eniten T3 (5), T7 (4), T1 (2)". Siinä näkyy, kuinka usein virhe tehtiin (kierros mutkittain), kuinka paljon se maksoi yhteensä ja kolme mutkaa, joissa useimmat kierrokset tekivät sen. **Klikkaa riviä**, niin se näkyy virhekartalla (ja kartta kytkeytyy päälle). Klikkaa uudelleen, niin näet kaikki virheet.
- **Mutka mutkalta** (tai *Mutka mutkalta - <virhe>*, kun yksi on valittu): jokaisesta osuudesta "N / M menetti aikaa · X s". Siinä ovat kierrokset, jotka ajoivat koko mutkan, ne, jotka menettivät siellä **0,05 s** tai enemmän oman luokkansa parhaaseen verrattuna, ja kaikki menetetty aika. Taitettuna se listaa kolme yleisintä virhettä ja niiden kierrosmäärät. **Klikkaa mutkaa**, niin se avautuu, kamera kehystää sen ja näkymä vaihtuu virhekartalle. Jokaiselle virheelle (tai vain valitulle) näkyy rivi, esimerkiksi "12 / 40 kierrosta jarrutti liian aikaisin tässä. 9 eri autolla, noin 0,21 s kukin". Lisäksi näkyvät kierrokset, jotka tekivät sen, **pahimmat ensin**, kukin hintoineen. Enintään 8, loput "+N lisää". **Klikkaa kierrosta**, niin se tarkennetaan ja virhe toistetaan (linjattuna 40 m ennen sitä).
- **Näytä lämpökartalla**: katso alla. "Rakennetaan lämpökarttaa…" näkyy, kun se käy. Painike on pois käytöstä, kun virheitä ei ole.

## Virhekartta {#the-mistake-map}

**Näkymä → Virhekartta** maalaa vertailureitin varrelle, kuinka monta valittujen luokkien kierrosta teki virheen kullakin metrillä. Virhe voi olla mitä tahansa lajia tai se, joka on valittu tilastoissa. Jokainen kierros lasketaan kerran metriä kohti. Jokaisen esiintymän väli (missä sen syy tai tapahtuma oli) levenee 6 m kummallekin puolelle, jotta lyhyt näkyy. Mitä useampi kierros kulkee siitä, sitä leveämpi ja kirkkaampi kohta on: leveys `3 + 10 · (kierroksia tässä / eniten kierroksia missä tahansa)` metriä, väri himmeästä ruskeasta kirkkaaseen oranssiin. Kohdat, joissa ei ole virheitä, näkyvät harmaana 2 m:n nauhana. Selite: *vähän kierroksia ↔ eniten kierroksia*.

Kun **Nimiöt** on päällä, jokaisen mutkan kärjessä on yleisin virhe: "T3 · 12/40 aikainen jarrutus" (kierrokset, jotka tekivät sen / kierrokset, jotka ajoivat mutkan). Kun yksi laji on valittu, näkyy "T3 · 12/40". Kun mitään lajia ei ole valittu ja mutka on puhdas, näkyy "T3 · puhdas". Kun osoitat nimiöön, näkyy mutkan menetykset ja sen viisi yleisintä virhettä. Kun klikkaat sitä, mutka avautuu tai sulkeutuu tilastoissa.

## Näytä lämpökartalla {#show-in-the-heatmap}

**Näytä lämpökartalla** antaa saman tiedon lämpökarttavälilehdelle nimellä "Virheet radalla <rata>" (tai "Virheet radalla", jos rataa ei tiedetä). Lämpökartan koko työkalupakki - lämpötilat, suodattimet, aikajana, viipalointi - toimii silloin siihen, missä kierrokset menevät pieleen.

Se on CSV, joka rakennetaan muistissa (`mistakeTable`). Riviä on yksi ruudukkopiste (joka 2 m) jokaista esiintymää kohti. Piste on **kierroksen oman sijainnin** kohdalla:

| Sarake | Sisältö |
|---|---|
| `x`, `y`, `z` | kierroksen sijainti kyseisellä metrillä (pelin koordinaatit) |
| `elapsed` | kierroksen aika siinä, s |
| `lap` | kierroksen nimi |
| `car` | auton nimi (tai "car 1234") |
| `mistake` | virheen nimi nykyisellä kielellä |
| `car_class` | luokka, `-` kun sitä ei ole |
| `corner` | mutkan nimi, `T3` |
| `cost` | esiintymän hinta, s |

Se ladataan lämpökartan omalla lataajalla, ja mukana on kenttäohjeet: Y ylöspäin, ei akselin kääntöjä, skaala 1. Aika `elapsed` on sekunteina. **henkilö** = `car`, **ryhmä** = `mistake`, **istunto** = `lap`. Suuntaa ei anneta. Sarakkeet `car_class`, `corner` ja `cost` säilyvät suodatinsarakkeina. Välilehti vaihtuu sitten **Lämpökartta**-välilehdeksi ja kohdistaa datan. Viedään vain tilastoissa valitut luokat.

## Useiden ratojen kierrokset {#courses-from-several-tracks}

Kierroksia analysoidaan **yksi rata kerrallaan**. Kansio, jossa on useiden ratojen kierroksia - koko kierroskirjasto - tarjoaa jokaisen radan erikseen ladattavaksi (kierrosmäärä kussakin, eniten ensin). Kierrokset, joita ei ole ajettu loppuun (FH Companionin `unfinished/`), kuuluvat omaan rataansa ja on merkitty *osittainen*. Useita nimettyjä ratoja tiedostoina valittuna tarjotaan samalla tavalla. Kierrokset, joissa ei ole radan nimeä, kuuluvat siihen, joka on valittu. Jos ladataan toisen nimetyn radan kierroksia kuin aiemmin ladatut, ne korvaavat aiemmat. Lisätietoja: [Kierrosten lataaminen](race-loading-laps.md#folders-and-courses).

## Suorituskyky kun kierroksia on paljon {#performance-with-many-laps}

Kymmenet kierrokset analysoidaan sekunnissa tai kahdessa. Kaikki analysoidaan aina. Piirrettävää rajoitetaan, jotta näkymä pysyy kuvanopeudessa:

| Raja | Arvo | Vaikutus |
|---|---|---|
| oletuksena piirretyt kierrokset | 8 (`SHOW_ALL_UP_TO`) | yli 8 ladatun kierroksen uudet kierrokset piilotetaan, ellei ne ole vertailukierros, tarkennettu kierros tai luokkansa paras. **Näytä kaikki** piirtää jokaisen kierroksen, ja **Vain tarkasteltavat** palauttaa rajauksen. Kierroksen tarkentaminen tuo sen ja sen luokan parhaan näkyviin |
| yksinkertaiset autot ja ohuet viivat | yli 10 näkyvää (`PLAIN_PAST`) | muut kuin tarkennettu kierros, seurattu auto ja vertailukierros: viivapiste joka 6 m (1,5 m sijaan), autot piirretään yksinkertaisina |
| kaaviossa olevat kierrokset | 8 (`CHART_LAPS`) | tarkennettu kierros, sen luokan paras ja vertailukierros ensin. "+N lisää piirretty, ei kaaviossa" |
| HUD-kortit | 6 | kuusi ensimmäistä näkyvää kierrosta |
| tilastot | 3 kierroksesta | osio on piilossa tätä vähemmällä |
| luetellut löydökset | 12 kuljettaja, 8 auto/konteksti, 10 voittoa | tarkennettua kierrosta kohti |
| näytetyt autoparit | 3 | yli 3 paria, yksi pari valitsimella |

Virheesiintymät lasketaan kerran analyysia kohti ja tallennetaan välimuistiin. Virhekartan tiheys tallennetaan välimuistiin luokkavalinnan ja virheen mukaan.

## Kehittäjille {#for-developers}

Koodi: [`src/race/stats.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/stats.ts),
[`src/ui/race/StatsSection.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/StatsSection.tsx),
`openMistakesInHeatmap` tiedostossa [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts).
