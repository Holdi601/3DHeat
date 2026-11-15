---
title: "Kisa-analyysi"
nav_order: 11
has_children: true
lang: "fi"
source: "race-analysis.md"
source_hash: "ab0531fa7bbd"
translated: true
outdated: false
---

# Kisa-analyysi

Ajoit saman radan kahdesti. **Kisa-analyysi**-välilehti toistaa molemmat ajot yhdessä 3D:nä, näyttää, missä yksi kierros oli hitaampi, ja kertoo miksi. Ei vielä kierroksia? Paina **Esimerkkikierrokset**.

![Kisa-analyysi-välilehti esimerkkikierroksilla: sivupalkki Kierrokset ja Parannettavaa, autot radalla, kaaviot näkymän alla](../assets/img/fi/race-analysis-overview.webp)

Välilehti vertaa kahta tai useampaa saman radan kierrosta. Se jakaa piirtoalueen, kameran ja ladatun ratamallin (**Tausta / kenttä**) lämpökartan kanssa. Kaikki muu on sen omaa: oma sivupalkki ja oma palkki näkymän alla. Sanat *kierros*, *vertailu* ja *kärki* on selitetty [sanastossa](glossary.md).

Tämä sivu on välilehden kartta. Jokaisella osalla on oma sivunsa:

| Sivu | Mitä se kattaa |
|---|---|
| [Kierrosten lataaminen](race-loading-laps.md) | jokainen tiedostomuoto, kansiot ja radat, autojen nimet, esimerkkikierrokset, kierroslista, vertailu ja tarkennus |
| [Toisto ja 3D-näkymä](race-replay-and-scene.md) | toistopalkki, kolme toistotilaa, autojen kohdistaminen, takaa-ajokamera, viivat, kartat, autot, nimiöt, peilatut maailmat |
| [Kaaviot ja HUD](race-charts-and-hud.md) | matkakaaviot, kuvaajavalitsin, osoitin ja zoomi, autokortit, kanavataulukko |
| [Auton hallintatapahtumat](race-control-events.md) | lukkiutumiset, pyörien pyöriminen, ylistyöntö, pyörähdykset, alistyöntö, osumat, kolarit, ABS/TC, käsijarru, ilma: miten kukin tunnistetaan, jokaisen kynnysarvon kanssa |
| [Mutka mutkalta -analyysi](race-corner-analysis.md) | kohdistus matkan mukaan, mutkat ja osuudet, mutkan ajallinen tili, jokainen syy ja järjestys, jossa ne kokeillaan, linjan muoto ja neuvo |
| [Autoprofiilit ja vertailu](race-car-profiles.md) | mitä kukin auto pystyy tekemään, mitattuna sen kierroksista; *Autojen vertailu*; mitä auto päättää kussakin mutkassa |
| [Ratatilastot](race-course-statistics.md) | monta kierrosta yhdeltä radalta: virheet mutkittain ja lajeittain, virhekartta, lämpökartan vienti, suorituskyvyn rajat |
| [Kisa-analytiikka: menetelmä](race-analytics.md) | sääntöjen taustalla oleva tutkimus lähteineen |
| [Muut kilpailupelit](other-games.md) | mitä katselin tekee kunkin pelin kierroksilla: luisto ja ajelehtiminen, jotka lasketaan, kun peli ei lähetä niitä, peilatut maailmat, lisäkanavat |

## Näkymä {#the-screen}

**Sivupalkki**, ylhäältä alas (osioita voi taittaa):

1. **Kierrokset**: lataus, luettelo, näyttäminen ja piilottaminen, vertailu, tarkennus, takaa-ajo.
   Katso [Kierrosten lataaminen](race-loading-laps.md).
2. **Ratatilastot**: näkyy vasta, kun kierroksia on ladattu kolme tai enemmän.
   Katso [Ratatilastot](race-course-statistics.md).
3. **Parannettavaa**: tarkennetun kierroksen löydökset mutka mutkalta.
   Katso [Mutka mutkalta -analyysi](race-corner-analysis.md).
4. **Mutka mutkalta** (tai *Mutka mutkalta - luokka X*, kun luokkia on useita): nopein kierros jokaisessa mutkassa ja sen linja. Näkyy, kun kierroksia on kaksi tai enemmän.
5. **Auton hallinta**: tarkennetun kierroksen lukot, luistot, työntöt ja osumat.
   Katso [Auton hallintatapahtumat](race-control-events.md).
6. **Autojen vertailu** (tai **Auto**, kun on vain yksi auto). Katso [Autoprofiilit ja vertailu](race-car-profiles.md).
7. **Näkymä**: mikä kartta maalataan radalle ja mitä piirretään.
   Katso [Toisto ja 3D-näkymä](race-replay-and-scene.md).
8. Yhteiset paneelit **Kenttä** ja **Kamera ja näkymä** (ratamalli, akselin kääntö, kamera). Ne on kuvattu lämpökartan yhteydessä ja sivulla [Kamera](camera.md).

**Näkymä** näyttää radan, ajetut linjat, kartan, autot, radan kiinnitetyt nimiöt ja enintään kuusi autokorttia vasemmassa yläkulmassa (katso [Kaaviot ja HUD](race-charts-and-hud.md)). Kun kierroksia ei ole ladattu, siinä lukee: "Ei kierroksia ladattuna. Pudota tähän kaksi tai useampia kierrostiedostoa tai lataa esimerkkikierrokset sivupalkista."

**Näkymän alla oleva palkki** sisältää toiston toimintanapit ja, ellei sitä ole piilotettu, matkakaaviot.

## Pika-aloitus {#quick-start}

1. Avaa **Kisa-analyysi**-välilehti (**Lämpökartan** vieressä sivupalkin yläosassa).
2. Hanki kierroksia. Paina **Esimerkkikierrokset**, niin näet, mitä välilehti tekee kolmella keksityllä kierroksella. Omia kierroksia varten tallenna ne ensin ([tiedostomuodot ja tallentimet](race-loading-laps.md#file-formats)). Paina sen jälkeen **Lataa kierrostiedostot…** tai **Kansio…**, tai pudota tiedostoja tai kansioita näkymään.
3. Nopein täysi kierros tulee vertailukierrokseksi. Hitain muu kierros tarkennetaan. Napsauta mitä tahansa kierrosta luettelossa tarkentaaksesi sen. ★ tekee kierroksesta vertailukierroksen.
4. Lue **Parannettavaa**. Napsauta löydöstä: autot kohdistetaan 40 m ennen sitä, kamera kehystää sen, toisto kulkee sen läpi ja mittaukset avautuvat.
5. Vie osoitin kaavioiden päälle, niin jokainen auto siirtyy siihen metriin. Shift+napsautus kohdistaa ne siinä.

## Näppäimistö {#keyboard}

Kun Kisa-analyysi-välilehti on auki:

| Näppäin | Tekee |
|---|---|
| **K** | toisto käyntiin tai taukoon |
| **Home** | toisto alkuun |
| numeronäppäimet | ei mitään (lämpökartassa ne vaihtavat tilaa) |

Tekstikentässä tai pudotusvalikossa kirjoitetut näppäimet jätetään huomiotta. Kameran näppäimet toimivat kuten lämpökartassa (**W A S D**, **Välilyönti** ylös, **Q** alas, **Shift** nopeammin, **Alt** hitaammin, hiiri katsomiseen. Kaikki on luettelossa [Kamera](camera.md)). **F** kehystää ladatut kierrokset, kuten kierrosten lataaminenkin.

## Monta kierrosta {#many-laps}

- Kaikki ladatut kierrokset analysoidaan ja lasketaan. Kymmeniin menee sekunti tai pari.
- Yli **8** kierroksen (`SHOW_ALL_UP_TO`) lisätyt kierrokset piirretään vain, jos ne ovat vertailukierros, tarkennettu kierros tai tarkennetun kierroksen luokan paras kierros. *Näytä kaikki* ja *Vain tarkasteltavat* vaihtavat tilaa.
- Yli **10** näkyvän auton (`PLAIN_PAST`) kierrokset, joita ei katsella (ei tarkennus, ei takaa-ajettava auto eikä vertailukierros), piirretään ohuilla viivoilla. Niissä on piste joka 6 m 1,5 m sijaan, ja autot piirretään yksinkertaisina.
- Kaaviot piirtävät enintään **8** kierrosta. HUD näyttää enintään **6** korttia.
- Ratatilastot näkyvät **3** kierroksesta alkaen.

Lisätiedot: [Ratatilastot](race-course-statistics.md#performance-with-many-laps).

## Oletusnäkymän asetukset {#default-view-settings}

| Asetus | Oletus |
|---|---|
| Kartta | Aikakartta |
| Ajetut viivat, Autot, Renkaat ja jousitus, Nimiöt, Rata kierroksista | päällä |
| Kaikki arvot korteilla | pois |
| Auton koko | 1× |
| Kaaviot | näkyvissä |
| Toistotila | Linjasta |
| Toistonopeus | 1× |
| Silmukka | päällä |

Mitään näistä ei tallenneta. Sivun lataaminen uudelleen palauttaa oletukset. Selaimeen muistetaan kieli ja kierrostiedostoista opitut autojen nimet (katso [Kierrosten lataaminen](race-loading-laps.md#car-names)).

## Kehittäjille {#for-developers}

### Mitä tapahtuu, kun kierroksia ladataan {#what-happens-when-laps-are-loaded}

Aina kun kierrosjoukko, vertailukierros tai kieli muuttuu, koko analyysi tehdään uudelleen (`analyse`-funktio tiedostossa [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts)):

1. Johdetut kanavat lisätään jokaiselle kierrokselle siellä, missä peli ei niitä lähetä: ajelehtimiskulma, pyörien luisto pyörien nopeuksista, ilmassa oleminen, löysä maa ja kiertymänopeus ([`derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts)).
2. Vertailukierros valitaan, ja jokainen kierros projisoidaan sen reitille ja näytteistetään uudelleen 2 m välein ([`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts)).
3. Lasketaan kierroksista, onko pelin maailma peilattu ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)).
4. Mutkat löydetään vertailukierrokselta ja ryhmitellään osuuksiksi yhdestä jarrutusalueesta seuraavaan ([`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts)).
5. Kullekin autolle lasketaan sen verhokäyrä (pito, jarrutus, veto nopeuden mukaan), sen profiili ja renkaiden käyrät ([`envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts), [`profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts), [`control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts)).
6. Kullekin kierrokselle ja osuudelle lasketaan, mitä se teki (jarrupiste, hitain kohta, täyskaasu ...) ja mitä linjaa se ajoi ([`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts)).
7. Kullekin kierrokselle lasketaan sen auton hallintatapahtumat. Jokainen asetetaan siihen kierrokseen, johon sitä verrataan kyseisessä kohdassa.
8. Kullekin kierrokselle ja osuudelle lasketaan ajallinen tili suhteessa vertailukierrokseen ja löydös sanoina.
9. Aikakartta ja syykartta lasketaan kullekin kierrokselle.

Tekstit tuotetaan nykyisellä kielellä. Kielen vaihtaminen ajaa analyysin uudelleen ja nimeää esimerkkikierrokset uudelleen. Analyysin virhe näkyy virheenä **Kierrokset**-painikkeiden alla, ja kierrokset pysyvät ladattuina.

### Lähdetiedostot {#source-files}

| Tiedosto | Tehtävä |
|---|---|
| `src/race/adapters.ts`, `ibt.ts` | kierrostiedostojen lukeminen |
| `src/race/lap.ts`, `carNames.ts`, `synthetic.ts` | kierrostyyppi, nimeäminen, esimerkkikierrokset |
| `src/race/derive.ts`, `handedness.ts` | johdetut kanavat, peilatut maailmat |
| `src/race/align.ts`, `segments.ts`, `line.ts` | matka-akseli, mutkat, linjat |
| `src/race/analysis.ts` | verratut mutkat, syyt, löydökset |
| `src/race/envelope.ts`, `profile.ts` | mitä auto pystyy tekemään |
| `src/race/control.ts`, `impacts.ts` | auton hallinta, osumat ja kolarit |
| `src/race/stats.ts` | monta kierrosta |
| `src/race/replay.ts`, `scene.ts`, `glyph.ts`, `geometry.ts` | toisto ja piirto |
| `src/race/schema.ts`, `graphs.ts` | kanavataulukko, kaavioiden rivit |
| `src/ui/race/*` | sivupalkki, kaaviot, HUD, nimiöt |
| `src/state/raceStore.ts` | välilehden tila ja toiston kello |
