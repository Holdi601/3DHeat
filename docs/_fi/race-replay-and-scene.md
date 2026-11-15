---
title: "Toisto ja 3D-näkymä"
parent: "Kisa-analyysi"
nav_order: 52
lang: "fi"
source: "race-replay-and-scene.md"
source_hash: "ebeead492b6a"
translated: true
outdated: false
---

# Toisto ja 3D-näkymä

Toista kierroksesi yhdessä, kuten kisa, ja katso, missä yksi auto karkaa edelle. Kaikki, mitä näet **Kisa-analyysi**-välilehden 3D-näkymässä, on kuvattu tässä: ajetut linjat, radalle maalatut värit, autot ja nimiöt.

![Syykartta, jossa autot ovat samasta kohdasta 40 m ennen mutkaa: värillinen rata, kaksi autoa ja lippupylväs](../assets/img/en/race-replay-lined-up.webp)

## Toiston kello {#the-replay-clock}

Yksi kello ohjaa jokaista kierrosta: sekunteja **vertailukierrokselta**. Moottori siirtää sitä joka kehyksessä toiston aikana (kehysaika × toiston nopeus); lopussa se palaa nollaan, kun **Silmukka** on päällä, muuten pysähtyy. Kelloa ei ole tarkoituksella tallennettu tilaan, jotta sivupalkki ei piirry uudelleen joka kehys; HUD ja kaaviot tilaavat sen ja päivittyvät enintään kerran kehyksessä.

**Toiston pituus** on pisin aika, jonka mikä tahansa kierros kestää kellolla: kunkin kierroksen aika (miinus sen siirtymä tilassa *Samasta kohdasta*), tai vertailukierroksen aika tilassa *Rinnakkain*.

## Toistopalkki {#the-transport-bar}

Näkymän alla, vasemmalta oikealle:

| Säädin | Tekee |
|---|---|
| ⏮ | takaisin alkuun (myös **Home**) |
| ▶ / ❚❚ | toista / keskeytä (myös **K**) |
| nopeus | 0,25×, 0,5×, 1×, 2×, 4× |
| aikaliukusäädin | asettaa kellon suoraan 0,01 s askelin |
| kello | `aika / pituus · metriä`: kello kierrosajaksi, toiston pituus ja kuinka pitkällä vertailussa vertailuauto on |
| *Lähtöviivalta* / *Samasta kohdasta* / *Rinnakkain* | toistotila (alla) |
| **Asettele tähän** | asettaa jokaisen auton sinne, missä vertailu on nyt, ja jatkaa siitä |
| **Silmukka** | alkaa alusta lopussa (oletuksena päällä) |
| **Piilota kaaviot** / **Näytä kaaviot** | matkakaaviot palkin alla |

Painikkeet ovat pois käytöstä, kunnes kierroksia on ladattu (yksi kierros riittää toistoon; vertailuun tarvitaan kaksi).

## Toistotilat {#replay-modes}

Miten kunkin kierroksen oma aika seuraa kelloa:

| Tila | Kunkin kierroksen aika | Mitä näkyy |
|---|---|---|
| **Lähtöviivalta** (`start`) | kello itse | jokainen kierros omasta alusta: kisa niiden välillä, ero kasvaa niin kuin radalla kasvoi |
| **Samasta kohdasta** (`anchor`) | kello plus kierroksen siirtymä | jokainen auto samassa kohdassa samaan aikaan, sitten päästetään irti - mitä tapahtuu siitä eteenpäin, ei kierroksen alusta |
| **Rinnakkain** (`locked`) | aika, jolloin kierros saavutti vertailun nykyisen matkan | jokainen auto pidetään vertailun matkalla koko kierroksen: nopeudet ja ohjaukset verrattuna metri metriltä |

Käytä, kun:

- **Lähtöviivalta**: haluat nähdä, kuka on edellä ja miten ero kasvaa.
- **Samasta kohdasta**: haluat tietää, mitä yhdessä mutkassa tai yhdellä suoralla tapahtuu, kun kaikki lähtevät sieltä samasta kohdasta.
- **Rinnakkain**: haluat verrata, mitä kuljettajat tekevät polkimilla ja ratilla samassa kohdassa rataa.

**Siirtymät tilassa *Samasta kohdasta*:** ankkurille pisteessä `s` metriä vertailun varrella jokaisen kierroksen siirtymä on sen oma aika kohdassa `s` miinus vertailun aika kohdassa `s`, molemmat luettuina kohdistetuista kierroksista (katso [yksi matkaakseli](race-corner-analysis.md#one-distance-axis)). Kierros, joka ei kata kohtaa `s`, pitää siirtymän 0. Kun valitset *Samasta kohdasta* tilapainikkeista, ankkuri asettuu vertailun nykyiseen matkaan.

Valkoinen lippupylväs (14 m korkea) merkitsee ankkurin tilassa *Samasta kohdasta*.

### Kohdistaminen {#lining-up}

| Toiminto | Ankkuri | Kello |
|---|---|---|
| **Asettele tähän** | missä vertailu on nyt | ennallaan |
| Shift+napsautus kaavioissa | napsautettu metri | 1,5 s ennen kuin vertailu saavuttaa sen |
| löydös kohdassa *Parannettavaa*, numeroitu merkki radalla, *Mutka mutkalta* -rivi löydöksellä | 40 m ennen kohtaa, jossa löydöksen syy alkaa | 1,5 s ennen tätä pistettä; sitten toistaa |
| auton hallintatapahtuma, osuman nimiö | 40 m ennen tapahtumaa | 1,5 s ennen; sitten toistaa |
| kierros ratatilastoissa | kuten sen löydös tai tapahtuma | kuten yllä, kierros valittuna |

Löydöksen katsominen kehystää sen myös kameralla - pallo löydöksen välin keskikohdan ympärillä, säde on suurempi 40 m tai puolet sen pituudesta plus 30 m (60 m tapahtumalle) - ellei kamera seuraa autoa.

### Seurantakamera {#chase-camera}

⌖ kierroslistassa saa kameran seuraamaan sitä autoa: 2,5 + 4 × auton koko metriä sen takana ja 0,9 + 1,1 × auton koko metriä sen yläpuolella, katsoen sen ajosuuntaan, kallistettuna alas autoon, tasoitettuna (20 % matkasta joka kehys), jotta se ei tärise jokaisesta heilahduksesta. ⌖ uudelleen vapauttaa sen. Seurattu auto piirretään hieman vaaleampana, maassa valkoinen rengas, ja sen kortti korostetaan.

## Näkymä-osio {#the-view-section}

| Säädin | Oletus | Tekee |
|---|---|---|
| **Viivat** / **Aikakartta** / **Syykartta** / **Virhekartta** | Aikakartta | mikä on maalattu radan varrelle (alla); *Viivat* ei maalaa mitään |
| selite | - | *voittaa ↔ häviää* aikakartalle, syyvärit syykartalle, *harvat kierrokset ↔ useimmat kierrokset* virhekartalle |
| **Ajetut linjat** | päällä | jokaisen näkyvän kierroksen linja omalla värillään |
| **Autot** | päällä | autot ja HUD-korttien lähteet |
| **Renkaat ja jousitus** | päällä | renkaan lämpötila, liukurenkaat, jousituksen työntötangot ja muut pyöräkohtaiset merkit sekä katonvalot autoissa |
| **Nimiöt** | päällä | mutkien nimet, numeroidut merkit, osumien nimiöt, virhekartan mutkanimiöt |
| **Rata kierroksista** | päällä | tienpinta kurssille, jolla ei ole purettua mallia (piilossa, kun kurssimalli on ladattu) |
| **Kaikki arvot korteilla** | pois | jokainen kanava, joka on listattu jokaisella HUD-kortilla |
| **Autojen todelliset muodot** | päällä | jokainen auto vastineensa muodossa (katso [Autot](#the-cars)); pois: avoin yksipaikkainen, joka ei peitä mitään telemetriasta |
| **Auton koko** | 1× | 1×-10× askelin 0,5; 1× on auton todellinen koko, yhtä pitkä ja leveä kuin pelissä. Mikään muu ei muuta sitä kuin tämä liukusäädin |

## Ajetut linjat {#driven-lines}

Jokaisen näkyvän kierroksen polku sen omien näytteiden läpi omalla värillään, piirrettynä 0,12 m tallennetun sijainnin alapuolelle (auton tallennettu sijainti on sen vertailupiste, 0,28-0,47 m tien yläpuolella puretuilla Forza-radoilla). Piste säilytetään joka 1,5 m; kun näkyvissä on yli 10 kierrosta, kierrokset, joihin ei katsota, säilyttävät joka 6 m (jokainen kärki menee GPU:lle joka kehys).

## Kartat {#the-maps}

Kaikki kolme ovat nauhoja pitkin **vertailun** polkua, 0,2 m tallennettujen sijaintien alapuolella, yksi nelikulmio per 2 m ruudukkoväli.

### Aikakartta (`where`) {#time-map-where}

Tarkennetulle kierrokselle: sekunteja voitettu tai menetetty metriä kohti verrattuna kierrokseen, johon sitä verrataan siinä kohdassa (oman luokkansa paras, tai vertailulle nopein muu kierros kunkin osuuden läpi), kohdistetun eron muutoksesta ruudukkoväliä kohti, tasoitettuna ±10 m:n välillä. Punainen, missä aika menetetään, vihreä, missä voitetaan, harmaa välissä; värisävyasteikko on absoluuttisten arvojen 95. persentiili, joten piikit leikataan ja suurin osa kierroksesta on asteikolla. 6 m leveä.

### Syykartta (`why`) {#cause-map-why}

Tarkennetulle kierrokselle: jokainen menetys maalataan sen välin yli, jolla sen **syy** on (ei siellä, missä aika näkyy), väritettynä syyn ryhmän mukaan, kallein löydös voittaa, kun kaksi menee päällekkäin. Leveys `3 + 9·√(kustannus / suurin kustannus)` metriä; missä ei menetetty mitään, harmaa 2 m nauha. Löydös, joka on valittu kohdassa *Parannettavaa*, maalataan valkoisena.

| Ryhmä | Väri | Löydökset |
|---|---|---|
| jarrutus | oranssi | kuljettajan menetykset jarrutusvaiheessa |
| sisäänajo | magenta | kuljettajan menetykset sisäänajossa ja mutkan keskellä |
| ulosajo | sininen | kuljettajan menetykset ulosajossa |
| suora | keltainen | kuljettajan menetykset suoralla |
| auto | harmaa | mitä auto selittää |
| konteksti | tumma harmaa | tilanne (kisan lähtö lentävää kierrosta vastaan) |

### Virhekartta {#mistake-map}

Kuinka moni kaikista kierroksista (tilastoista valittujen luokkien) teki virheen kullakin metrillä - mitä tahansa lajia, tai vain sitä, joka on valittu tilastoista. Jokainen kierros lasketaan kerran metriä kohti; kunkin virheen väliä levennetään 6 m kummastakin päästä, jotta lyhyt näkyy. Leveys `3 + 10·(kierrokset / useimmat kierrokset)` metriä ja väri himmeästä ruskeasta kirkkaaseen oranssiin; harmaa 2 m, missä yksikään kierros ei tehnyt virhettä. Katso [Ratatilastot](race-course-statistics.md#the-mistake-map).

## Rata kierroksista {#track-from-the-laps}

Kurssille, jota ei ole purettu, tie piirretään linjojen alle: yhtä leveä kuin kierrokset levittyvät vertailun yli (sivusuuntaiset siirtymät 25 m:n sisällä lasketaan) plus 2 m kummallekin puolelle, vähintään 4 m kummallekin puolelle vertailulinjaa, tasoitettuna ±8 ruudukkopisteen (±16 m) yli, asfaltinharmaana kevyin reunaviivoin, 0,3 m tallennettujen sijaintien alapuolella. Piilossa, kun kurssimalli on ladattu kohdassa **Kenttä**.

## Osumat ja kolarit radalla {#hits-and-crashes-on-the-track}

Jokaisen näkyvän kierroksen osumat ja kolarit (katso [Auton hallintatapahtumat](race-control-events.md#hits-and-crashes)) merkitään siihen kohtaan, missä ne tapahtuivat, aina kun linjat tai autot piirretään: piikikäs tähti - punainen kolarille, meripihkan värinen osumalle - pylvään päällä, ja kierroksen värinen rengas sen jalassa, kokoa autojen koon mukaan (kolarit suurempia). Kun auto menee osuman hetken ohi, iskurengas leviää siitä 0,8 s ajan.

## Ohjetila {#help-mode}

**?** kielivalitsimen vieressä tai **F1**-näppäin kytkee päälle avaimen jokaiselle näytön värille kaikilla kolmella välilehdellä ([`HelpPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/help/HelpPanel.tsx),
[`RaceHelp.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHelp.tsx)). Valinta pysyy tässä selaimessa.

- **Avain** näkymän kulmassa luettelee käytössä olevan välilehden ja tilan värit. Jokainen väriskaala tulee siitä, mistä näkymä sen saa, joten muokattu lämpöskaala näkyy muokattuna. Kierrosvälilehdellä luetellaan vain se, mitä ladatut kierrokset kantavat.
- **Jokaisen auton kortti** saa taulukon siitä, mitä piirretään sen pyöriin, nimen mukaan, jokaisen pyörän arvo sillä värillä, jolla se piirretään.
- **Tarkennettu auto** saa nimiön jokaiseen pyörään, joka kertoo saman, sijoitettuna ulos kulmiin. Piilossa, kun auto on ruudulla liian pieni niiden mahtuakseen.

## Autot {#the-cars}

**Jokainen auto omassa muodossaan**, kierroksensa värillä ja todellisessa koossaan. Muodot tulevat autotiedostosta, joka tehdään kerran sillä koneella, jolla peli on:

```
python -m heat3d_gamefiles cars -o forza.h3dcars
```

Ilman sitä jokainen auto piirretään **katselimen oman auton** muodossa sen tyypin ja aikakauden mukaan: sedan, coupé, viistoperä, farmari, urheiluauto, supercar, lihasauto, maastoauto, pickup, pakettiauto tai mikroauto, kukin klassisena (ennen 1980), 80- ja 90-luvun tai nykyaikaisena ([`carBodies.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carBodies.ts)). Ne rakennetaan täällä yleisistä mittasuhteista: ei logoja, ei mallinimiä eikä mitään minkään pelin tiedostoista, joten ne toimitetaan katselimen mukana. Tyyppi tulee auton nimestä, aikakausi siinä olevasta vuosiluvusta; auto, jossa kumpaakaan ei ole, otetaan sen luokasta. Noin sata todellista sukupolvea tunnetaan julkaistujen pituuksien, leveyksien, korkeuksien ja akseliväleiden perusteella ([`carSpecs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carSpecs.ts); yksi rivi kukin, pyöristettynä), joten 1990-luvun 3-sarjan BMW saa sen auton koon ja asennon, yhä pelkkänä muotona ilman merkkiä tai säleikköä.

Autotiedosto tehdään omalla koneellasi omasta pelikopiostasi. Se sisältää kunkin auton matalatarkkuuksisen mallin, noin 900 kolmiota, sekä pyörien sijainnit (katso [purkajan `cars`-komento](https://github.com/Holdi601/3DHeat-GameFiles/blob/main/docs/commands.md#cars)). **Lataa autotiedosto...** näkymäasetuksissa tai tiedoston pudottaminen Kisa-välilehdelle lataa sen; se pysyy tässä selaimessa. Se sisältää pelin muodot, joten sitä ei ole syytä jakaa, eikä katselin toimita yhtään.

Se, mikä auto edustaa kierroksen autoa, lasketaan joka kerta siitä, mitä on ladattu, eikä sitä tallenneta, joten auto, jolla ei ole vastinetta tänään, saa oman heti kun uudempi tiedosto sisältää sen ([`carMatch.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carMatch.ts)):

| Kierroksen auto | Piirretään muodossa |
|---|---|
| sen numero on tiedostossa samalle pelille | juuri se auto |
| sama merkki, ja nimessä yksi sana mallista | se malli, lähimpänä vuosina |
| sama merkki, sama sukupolvi | sen merkin auto, lähimpänä vuosina |
| mikä tahansa muu, autotiedoston kanssa | saman merkin lähin, jos sellainen on, muuten saman tyyppinen kori, lähimpänä vuosina |
| avoin pyöräauto nimensä perusteella | alla oleva yksipaikkainen |
| ei kumpikaan ensimmäisistä, ja katselin tuntee auton koosta | katselimen oma auto sen oikean auton koossa, tiedoston kanssa tai ilman |
| mikä tahansa muu ilman tiedostoa | katselimen oma auto sen tyyppinen ja aikakausi |

Joten toisen pelin vuoden 1990 BMW 3-sarjan kierros näyttää kyseisen vuoden BMW:n, ja tiedostoa uudempi auto näyttää lähimmän sukulaisensa, kunnes tiedosto tehdään uudelleen. Kierroksen vihje ja tarkennetun kierroksen auton koon alla oleva rivi kertovat, miksi se piirretään ja kuinka lähellä se on.

Katselimen omilla autoilla on tummat ikkunat. Autotiedoston mallit ovat yhtä väriä kauttaaltaan, koska tiedostossa ei ole maalia eikä lasia. Pyörät, takavalot, lamput ja telemetriamerkit piirretään kuten yksipaikkaisessa; työntötanko kulkee pyörän ulkopuolelle, missä se näkyy, ja heilurivarret jätetään pois.

**Yksipaikkainen** on avopyöräinen auto kierroksen värillä, joten etupää näkyy mistä kulmasta tahansa eikä mikään peitä pyöriä: runko, moottorin kansi, sivupontut, ohjaamo kypärällä, halo, pohja, etu- ja takasiivet; neljä pyöreää pyörää, etupyörät kääntyvät ohjauksella (enintään 0,5 rad täydellä kääntöllä), kukin kahdella heilurivarrella pystysuoralla navalla, ohjaustangolla (etu) tai vetoakselilla (taka), ja työntötanko. Malli lasketaan 0,3 m tallennetusta sijainnista, jotta pyörät ovat tiellä, ja se skaalataan **Auton koon** mukaan.

**Runko liikkuu jousillaan**: kun kierros kantaa kaikki neljä jousituksen matkaa, kukin kulma laskee matkansa verran (liioiteltuna 0,12 m täydestä päästä täyteen iskuun, jotta se näkyy seurantakamerasta), ja runko painuu, kallistuu ja kiertyy neljän kautta kulkevan tason mukaan.

**Mitä piirretään telemetriasta** (kun *Renkaat ja jousitus* on päällä) noudattaa [kanavataulukkoa](race-charts-and-hud.md#the-channel-table):

| Merkki | Lähde | Piirros |
|---|---|---|
| renkaan väri | `tireTemp` | rengas itse, sininen kylmä → syaani → vihreä toimiva → keltainen → punainen kuuma, alueella 40-130 °C |
| liukurengas | `slipRatio`, `slipAngle`, `combinedSlip`, `slipIndex` (suurin) | rengas maassa pyörän alla, vihreä kun pito on hallussa, meripihka 0,66:ssa, punainen 1:ssä (pidon raja, kuten peli sen ilmoittaa); himmeä alle 0,3 |
| jousituspalkki | `suspension` (0..1) | työntötanko värjättynä matkan mukaan: sininen ulosvedettynä, valkoinen keskellä, punainen puristettuna |
| jarrun hehku | `brakeTemp` (100-900 °C) | levy pyörän ulkopinnalla, tummasta oranssiin |
| kulumisnauha | `tireWear` (0..1) | nauha kulutuspinnan reunan ympärillä, valkoinen uusi → punainen kulunut |
| kuormapalkki | `wheelLoad` (0-12 000 N) | pylväs pyörän vieressä yhtä korkea kuin kuorma |

Jarruvalot (sadevalo ja siipien päätelevyt) syttyvät jarrupolkimen mukana. Jokainen `lamp`-kanava, joka on päällä (yli puolet alueestaan), sytyttää lampun ilmanottimen yläpuolella omalla värillään: ABS toimii, vetonesto toimii, DRS, kuopparajoitin, käsijarru, ilmassa.

**Väkijoukossa** (yli 10 näkyvää) autot, joihin ei katsota, piirretään yksinkertaisina: runko, siivet, pyörät ja jarruvalo vain.

## Nimiöt {#labels}

Kiinnitetty radalle ja sijoitettu joka kehys kameran projektiosta (ruudun ulkopuolella tai kameran takana, piilossa). Kun **Nimiöt** on päällä:

| Nimiö | Missä | Napsautus |
|---|---|---|
| mutkien nimet (`T1`, `T2` …) | jokaisen mutkan huipun päällä vertailussa | - |
| numeroidut merkit 1-5 | tarkennetun kierroksen viisi suurinta kuljettajan menetystä, kunkin syyn välin keskellä, reunus syyn värillä; osoita nähdäksesi otsikon ja hinnan | kohdista ja toista tämä löydös |
| osuma- / kolarinimiöt | jokaisen **tarkennetun** kierroksen purkauksen päällä: "Kolari −45 km/h" / "Osuma −12 km/h"; osoita nähdäksesi koko kuvauksen ja vihjeen | kohdista ja toista törmäys |
| virhekartan mutkanimiöt (korvaavat mutkanimet ja merkit, kun kartta on virhekartta) | jokaisen mutkan huipulla: "T3 · 5/40 aikainen jarrutus" (yleisin virhe, kierrokset joilla se tehtiin / kierrokset, jotka ajoivat mutkan), "T3 · 5/40", kun yksi laji on valittu, "T3 · puhdas", kun ei mitään; osoita nähdäksesi mutkan menetykset ja sen viisi yleisintä virhettä | avaa tai sulje tuo mutka ratatilastoissa |

## Peilatut maailmat {#mirrored-worlds}

Katselimen maailma on oikeakätinen, Y ylöspäin: ylhäältä katsottuna auto, jonka ajosuunta `atan2(dx, dz)` kasvaa, kääntyy vasemmalle. Peli, jonka maailma on vasenkätinen - Forza niiden joukossa - tulee esiin peilattuna, jokainen oikean käden mutka piirtyy vasemman käden mutkana, kurssi ja kierrokset samoin.

Kierrokset kertovat sen itse ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)): kävellessä jokaista kierrosta muutaman metrin (3 m) kerrallaan, polun käännöstä verrataan ulkopuolisen jousituksen puristumaan (`suspension.FR` miinus `suspension.FL`) ja ilman jousitusta ohjaukseen (positiivinen oikealle jokaisessa sovittimessa). Kierros, joka kääntyy yhteensä alle π, ei sano mitään; todiste lasketaan, kun se ylittää 2 % käännöksestä. Kierrokset äänestävät; tasapeli on "ei voi sanoa".

Kun kierrosten tuomio on ristiriidassa nykyisen akselin käänteisyyden kanssa (pariton määrä käännettyjä akseleita kohdassa **Kamera ja näkymä → Käännä maailman akseli**), **Kierrokset**-osio kertoo sen luettelon alla:

- peli on peilattu, eikä mitään ole käännetty: "Nämä kierrokset ohjaavat oikealle siellä, missä rata piirretään kaartuvan vasemmalle …" painikkeella **Käännä X**;
- akseleita on käännetty, mutta kierrokset eivät ole peilattuja: "Käännetyt akselit piirtävät nämä kierrokset peilikuvina …" painikkeella **Palauta akselit**.

Vain piirtäminen muuttuu - heijastus, joka on taitettu näkymämatriisiin; data, analyysi ja jokainen koordinaatti, jonka työkalut näyttävät, pysyvät pelin omina. Käännös säilyy selaimessa. Analyysi nimeää mutkat vasemmalle tai oikealle samalla mittauksella (tuntematon maailma otetaan peilattuna, kuten Forzan).

## Kehittäjille {#for-developers}

Koodi: [`src/race/replay.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/replay.ts),
[`src/race/scene.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/scene.ts),
[`src/race/glyph.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/glyph.ts),
[`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx) (`Transport`),
[`src/ui/race/RaceLabels.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceLabels.tsx).

### Mitä auto on hetkellä {#what-a-car-is-at-a-moment}

`stateAt` interpoloi jokaisen kanavan kierroksen ajan ympärillä olevien kahden näytteen välillä. Kanavat, jotka hyppäävät (vaihde, liput), ottavat lähimmän näytteen. Kierros, joka on päättynyt, pysäköityy viivalle.

**Suunta.** Ajosuunta tulee sijainneista muutaman metrin päässä toisistaan (vähintään 2 m kummallakin puolella, jotta heilahdus ei käännä autoa). Rungon suunta tulee pelin kääntymiskulmasta vasta kun se on sovitettu ajosuuntaan - merkki ja siirtymä, ympyräkeskiarvolla näytteistä, jotka ovat nopeampia kuin 10 m/s (vähintään 20) - ja vain jos se sitten täsmää sen kanssa (ympyrävarianssi alle 0,05, noin 18° hajonta); muuten runko osoittaa ajosuuntaan. Näin liuku pysyy näkyvissä (runko ja ajosuunta erillään) luottamatta pelin kulmakäytäntöön.

**Ohjaus ja puolet.** Mihin suuntaan positiivinen ohjaus kääntää auton ja kumpi puoli pelin oikeanpuoleisista pyöristä on, mitataan kierroksesta: ohjaus verrattuna radan käännökseen, ja kumman puolen jousitus puristuu mutkien ulkopuolella (ilman jousitustietoja Forza-pelit otetaan peilattuina).
