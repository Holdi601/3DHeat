---
title: "Manööverit"
parent: "Havainnot"
nav_order: 4
lang: "fi"
source: "maneuver.md"
source_hash: "2160eca678e0"
translated: true
outdated: false
---

# Liikkeet: näin ryhmät liikkuvat

**Havainnot → Liikkeet** seuraa, miten kunkin puolen yksiköt liikkuvat *ryhminä*. Se nimeää niiden tekemät liikkeet: sivustahyökkäyksen, pihtiliikkeen, läpimurron, väijytyksen, vetäytymisen, ohjuspuolustuksen ja T-ylityksen. Jokaisen kohdalla näkyy, kuinka varma havainto on, sen luvut, kannattiko liike ja sen vastineet sotaopissa ja historiassa. **Massa-analyysi → Liikkeet** laskee ne tuhansissa otteluissa: kuinka usein kutakin liikettä tehdään kartalla, pelitilassa ja puolella, ja kuinka usein se kannattaa.

Kaikki lasketaan selaimessasi omassa työntekijäprosessissaan (`src/insights/maneuver`). Muutaman sadan yksikön ottelu vie 10–500 ms. Kaksi tuntia kestävä ilmasota tuhansine kohteineen vie noin sekunnin.

## Käyttö {#using-it}

- Avaa **Havainnot**, välilehti **Liikkeet**. Se laskee tiedot, kun avaat sen ensimmäisen kerran. Kun muutat suodattimia, paina **Etsi uudelleen**.
- **Varma / Todennäköinen / Mahdollinen** valitsee näytettävän varmuustason. Oletuksena on Todennäköinen.
- **Aikajana** on rivi kummallekin puolelle ja palkki jokaiselle liikkeelle. **Luettelo** sen alla näyttää samat liikkeet ajan mukaan. Kun napsautat liikettä, toisto siirtyy sen alkuun, kamera lentää sinne ja liike piirtyy 3D:nä. Jokaisen ryhmän reitti näkyy nuolena. Sivustahyökkäyksen kaksi haaraa näkyvät kaarina. Ryhmien ääriviivat näkyvät ratkaisevalla hetkellä. Vihollisen ääriviiva on sen puolen värinen. Vihollisen rintama näkyy valkoisena viivana. **Piirrä kaikki 3D:nä** lisää ottelun muut liikkeet himmeinä. Viivat siirretään näytönohjaimelle kerran, kun valinta vaihtuu, eikä joka kuvassa. Kun toistossa piirretään 480 liikettä, kuvan ajat todellisella näytönohjaimella (WebGL2 ja WebGPU, p99 18,0–18,5 ms, enintään 19,5–20,8 ms) ovat samat kuin ilman niitä.
- Avattu liike näyttää tuloksensa. Siihen kuuluvat sen tehneiden yksiköiden tappiot ja menetykset liikkeen aikana ja heti sen jälkeen. Ne verrataan puolen omaan vaihtoon koko ottelussa. Lisäksi näkyvät todisteet ja tietopohjan merkinnät. Ne kertovat sotaopista ja historiallisista vastineista. Esimerkiksi saartorengas vastaa Cannaeta, läpimurto Sedania 1940, T-ylitys Tsushimaa ja harhautus Operation Boloa.
- Pieni taulukko lopussa näyttää lajin ja puolen kohdalla, kuinka monta liikettä tehtiin ja kuinka monta kannatti.

![Pihtiliike synteettisellä esittelyottelulla: molempien haarojen nuolet, vihollisen runko ja sen rintama](../assets/img/en/maneuvers.webp)

## Näin ryhmät löydetään {#how-groups-are-found}

Jokainen yksikkö sijoitetaan yhteiselle aikajanalle. Askel on 1 s jalan ja 2 s muuten. Suurissa tiedostoissa askel on pidempi. Kuoleman kohdalla yksikkö pysyy paikallaan, jotta uudelleensyntyminen ei piirrä viivaa kartan poikki. Jokaisella askeleella saman puolen ja saman lajin yksiköt (lentokoneet, ajoneuvot, laivat, jalkaväki) yhdistetään, kun ne ovat lähellä. Raja on 18 m jalan, 170 m ajoneuvoille, 3 km laivoille ja 5 km lentokoneille. Yksiköt liikkuvat myös samaan suuntaan: nopeudet eroavat enintään puolet nopeamman nopeudesta, tai molemmat seisovat. Klusteri säilyttää sen ryhmän tunnuksen, johon suurin osa sen jäsenistä kuului. Yksikkö ilman lajia luokitellaan jalkaväeksi, ajoneuvoksi tai ilmassa olevaksi sen nopeuden mukaan.

Ryhmän **muoto** luetaan suhteessa sen suuntaan. Pylväs tai linja tunnistetaan sen mukaan, kuinka paljon jäsenet ovat levinneet edestä taakse ja sivuttain. Kiila on muoto, jossa keskikohta johtaa. Vinoporras on muoto, jossa jäsenet siirtyvät taaksepäin yhdelle sivulle. Laatikko on muoto, jossa jäsenet pitävät kulmia.

Kaikki arvioidaan ottelun omassa mittakaavassa. **Taisteluetäisyys** `R` on etäisyyden 75. prosenttipiste tappajan ja uhrin välillä. Arvo rajataan alueen mukaan. Liikkeen ajat riippuvat lajista: jalkaväen aika on kolmasosa maaston ajasta.

## Mitä se löytää {#what-it-finds}

| Liike | Löytyy, kun |
|---|---|
| Muodostelma | ryhmä pitää yhden muodon 60 %:ssa liikkuvista askelistaan 30 s ajan |
| Rintahyökkäys | ryhmä lähestyy kantamattomuudesta kosketukseen, ¾ R tai enemmän, vihollisen katsomissuunnan 35 asteen sisältä |
| Sivustahyökkäys | sama 50–130 asteen kulmasta (takana sen yli). Varma vain, jos mukana on ystävällinen *kiinnittävä joukko*, joka taistelee vihollista vastaan siellä. Tappoja tulee kumpaankin suuntaan |
| Pihtiliike | kaksi sivustahyökkäystä saman puolen kahdelta suunnalta samaan vihollisrunkoon. Hyökkäykset ovat vähintään 100 asteen päässä toisistaan ja tapahtuvat 90 s:n sisällä. Varma, kun haarat taistelevat siinä |
| Piiritys | tiivis vihollisryhmä, jonka ympärillä on vähintään yhtä monta toisen puolen yksikköä 1,5 R:n säteellä. Ne tulevat vähintään kahdesta ryhmästä, eikä aukkoa ole yli 100 asteen. Piiritys kestää minuutin ja vihollinen on katkaistu omasta puolestaan. Varma, kun rengas kiristyy ½ R:ään ja taistelee taskussa |
| Läpimurto | ryhmä ylittää pidetyn linjan. Vihollisia seisoo 30 s sekä sen vasemmalla että oikealla puolella, ja oman puolen keskusta on niiden takana. Varma, kun ryhmä pääsee ½ R:n päähän, pysyy siellä 20 s ja taistelee siellä. Jos se pääsee vielä R:n lisää, kyseessä on murtautuminen |
| Peittävä tulitus | pienessä ryhmässä osa liikkuu, kun loput seisovat. Roolit vaihtuvat neljä kertaa tai useammin, ja seisova osa antaa suojatulta |
| Keskittyminen / hajauttaminen | puolen osuus tiheimmän kohdan lähellä nousee 35 prosentista 60 prosenttiin. Yksiköt tulevat 1,5 R tai enemmän ja sitten kosketus. Tai osuus laskee, kun puoli leviää |
| Harhautus | pieni osa kosketuksessa vetää kaksi tai useampia vihollisia muualta. Suurempi ryhmä iskee sitten neljän kantaman päässä, missä vihollisia on vähemmän |
| Vetäytyminen / takaa-ajo | kosketuksessa oleva ryhmä kääntyy pois ja pääsee R:n päähän paikasta, jossa se taisteli. Varma, kun siellä ollut vihollinen oli juuri tappanut ryhmästä yhden ja ryhmä pääsi 2 R:n päähän tuosta tappajasta. Ei koskaan jalan, katso jäljempää. Vihollinen, joka liikkuu samaan suuntaan ja pysyy perässä, on takaa-ajaja |
| Puolustus syvyyteen | seisovia yksiköitä kahdessa tai useammassa vyöhykkeessä vihollisen akselin poikki, R:n syvyydellä. Vihollinen tulee kohti, ja vyöhykkeistä tulee tulta |
| Harjanteen takana | kolme tai useampi tappo lyhyellä etäisyydellä seisovien yksiköiden toimesta. Uhrit tulivat harjanteen yli |
| Väijytys | liikkuva ryhmä kohtaa vihollisia, jotka seisoivat 45 s. Ne ampuvat ensin, ja liikkuvat menettävät kaksi tai puolet ryhmästä |
| Verhoilu | yksi tai kaksi yksikköä liikkuu kolmen tai useamman joukon edellä ja kohtaa vihollisen ensimmäisenä |
| Sisäiset linjat | saman puolen ryhmät ovat lähellä toisiaan toisen puolen välissä, ja sen yksiköt siirtyvät niiden välillä |
| Tahti | puoli vastaa kosketukseen (käännös, nopeuden muutos, ensimmäinen laukaus) 1,5 kertaa nopeammin. Mann-Whitney p on alle 0,05 |
| Kampi, lovi, veto, pumppu | ohjuksen laukaisun kohde kääntää ampujan 35–70 asteeseen, 75–105 asteeseen tai yli 140 asteeseen, tai vetää ja kääntyy takaisin |
| Ilmapihtiliike, seinä, johtaja–seuraaja, murskain | pari jakautuu yhtä vihollista vastaan. Kolme rinnakkain vihollista vastaan. Osa on 5–20 km toisen takana. Kaksi kiertää samaa pistettä lähellä toisiaan |
| Taisteluilmapartio | kiertää asemaa kolme minuuttia |
| Energia- tai kulmataistelu | lähitaistelussa suuntien ero on 30 astetta, kumpikin pitää toista vuorotellen nenänsä edessä tai kahden välillä tapahtuu tappo. Korkeutta käytetään ja nousu jatkuu, tai lento on tasaista ja kääntyy kovasti hidastaen. Varma, kun toinen tappoi toisen |
| Iskupaketti, SEAD | ilmaryhmä, jossa on sekoitettuja tehtäviä, joista osa iskee maahan. Ilmatorjunnan tappot ennen useimpia muita maataisteluissa tehtyjä tappoja |
| Taistelulinja, T-ylitys | kolme laivaa jonossa. Pylväs vihollisen pylvään päässä ristiin |

Jokainen liike kertoo, mitkä tietopohjan **mallit** se näyttää (`patterns-maneuver.ts`: muodostelma, rintahyökkäys, kaksoiskiertoliike, saartorengas, läpimurto, tuli ja liike, harhautus, vetäytyminen, takaa-ajo, puolustus syvyyteen, verhoilu, hajauttaminen, ohjuspuolustus, kulmataistelu, taisteluilmapartio, iskupaketti, taistelulinja ja T-ylitys). Se kertoo myös merkinnät, jotka kannattaa lukea ensin. Vanhemmat merkinnät saavat uudet mallit tiedostosta `knowledge/maneuver-tags.ts`. Katso [Tietolinssi](knowledge.md).

**Kannatti** vertaa yksiköiden vaihtoa liikkeen aikana (ja minuutin sen jälkeen) saman puolen vaihtoon koko ottelussa. Vetäytyminen kannattaa, kun yksiköitä menetettiin käännöksen jälkeen vähemmän kuin ennen sitä. Ohjuspuolustus kannattaa, kun lentokone pysyy hengissä minuutin. Piiritys kannattaa, kun taskun menetykset ovat puolet.

## Monien otteluiden yli {#over-many-matches}

Jokaisen ottelun yhteenveto (`src/mass/summarize.ts`, katso [Massa-analyysi](mass-analysis.md)) sisältää pienen osan `maneuvers`. Se kertoo lajin ja puolen mukaan, kuinka monta liikettä tehtiin (Todennäköinen tai varmempi), kuinka monta kannatti, kuinka monta ei kannattanut sekä tappojen ja menetysten määrän. **Massa-analyysi → Liikkeet** laskee nämä yhteen suodattimen jättämille otteluille. Lasku tehdään kartan ja pelitilan mukaan tai kaikille yhdessä. Kannattavuusosuuden Wilson-väli näkyy mukana. Rivin valinta lataa ne ottelut, joissa liike tehtiin. Yhteenvedot, jotka on kirjoitettu ennen tätä osaa, eivät sisällä sitä. Lisää se ajamalla `node tools/3dheat-summarize.mjs <kansio> --force`.

## Kuinka varma se on {#how-sure-it-is}

Synteettisissä otteluissa on istutettuja liikkeitä (`synth.ts`, ajetaan `maneuver.test.ts`:llä). Kaikki 28 istutettua lajia löytyvät Todennäköisinä tai varmempina. Raportoiduista 50 liikkeestä 31 on istutettua lajia. Muut 19 ovat myös todellisia: liikkuvan ryhmän muodostelma ja läpimurtavan pylvään rintalähestyminen. Yhtäkään ei ole väärin. Kolmessakymmenessä tyhjässä ottelussa nähdään vain satunnaista liikettä. Ne ovat satunnaiskävelyjä, sekoitettuja yksiköitä, satunnaisesti seisovia yksiköitä, lentokoneita suorilla lennoilla ja väkijoukkoa, joka kulkee sinne tänne. Niissä ei raportoida mitään Todennäköisellä tai varmemmalla tasolla.

Todellisella datalla (kymmenittäin maataisteluita, muutama pitkä ilmasotatehtävä ja kymmenkunta ampujaottelua) näkyy rintahyökkäyksiä, sivustahyökkäyksiä, läpimurtoja ja piirityksiä panssarikaluston taisteluissa. Ilmassa näkyy muodostelmia ja läheisiä taisteluita. Ohjuspuolustuksia, taisteluilmapartioita ja johtaja–seuraaja-pareja näkyy ilmasotatehtävissä. Ampujapeleissä näkyy rintateloituksia, pylväitä ja muutama väijytys ja pari liikkuvaa parija. Kynnysarvot ovat doktriinin muotoja pelin mittakaavassa. Lue yksittäinen löydös sen todisteiden kanssa ja massataulukon osuudet niiden välein.

### Vertailu saman otteluiden nollamalleihin {#against-null-models-of-the-same-matches}

Ryhmä voi huijata tunnistuksen maasto ja väkijoukko. Taistelussa jokaisella ryhmällä on vihollisia joka suunnalla. Siksi jokainen laji ajetaan myös **nollamalleilla**, jotka on tehty samoista otteluista (`nulls.ts`). Nollamalleissa puolet eivät enää kohtaa samalla tavalla kuin todellisuudessa. Yhden puolen aikajanaa käännetään kolmasosasta kahteen kolmasosaan ottelun ajasta (*siirto*). Tai sen reittejä käännetään kartan keskipisteen ympäri (*kierto*). Joukkueiden nimiä sekoitetaan (*joukkueet*). Tämä säilyttää rakenteesta noin puolet todellisista taisteluista. Taistelut lasketaan vain tappoina, jotka on yhdistetty kuolemiin. Tappajan on oltava 2 R:n sisällä ja uhrin paikalla. Nollamalli rikkoo nämä parit. Löydöksiä on Todennäköisellä tai varmemmalla tasolla. Ne vertaavat todellista nollamalleihin (30 panssarikalustotaistelua, 12 ampujaottelua):

| Laji | Panssarikalustotaistelut: todellinen / siirto / kierto | Ampuja: todellinen / siirto / kierto |
|---|---|---|
| Piiritys | 0 / 0 / 0 (oli 1,3 / 1,2 / 0,8) | 0 / 0 / 0 |
| Läpimurto | 0,03 / 0,02 / 0,05 (oli 1,6 / 1,8 / 1,4) | 0 / 0 / 0 |
| Sivustahyökkäys | 0,33 / 0,07 / 0,10 | 1,0 / 0,08 / 0,21 |
| Rintahyökkäys | 0,87 / 0,47 / 0,12 | 14,4 / 6,5 / 4,3 |
| Vetäytyminen | 0,03 / 0 / 0,02 | 0,08 / 0,08 / 0,5 (siksi jalan ei koskaan varma) |
| Väijytys | - | 0,17 / 0,04 / 0,04 |
| Energiataistelu | 1,2 / 0,1 / 0,85 | - |
| Kulmataistelu | 0,6 / 0,07 / 0,3 | - |

Ilmataistelut, jotka käydään taistelukentän keskellä, säilyvät kierron jälkeenkin. Siksi kiertosarake kohtelee niitä lempeämmin kuin maalajeja. Lajit yhden puolen sisällä (muodostelma, taisteluilmapartio, murskain, iskupaketti, SEAD, kiertoliike ja verhoilu) eivät riipu toisesta puolesta, eikä niitä testata näin. `maneuver.test.ts` tarkistaa, että nollamallit poistavat synteettisistä otteluista istutetut sivustahyökkäyksen, pihtiliikkeen, piirityksen, läpimurron, väijytyksen ja vetäytymisen.

## Rajoitukset {#limits}

- Ryhmät tarvitsevat sijainnit ajan yli. Pelkkä tapahtumatiedosto ei sisällä niitä.
- Suuntaa ei lueta datasta. Vihollisen rintama on siinä, missä kiinnittävä joukko sitä vastaan taistelee. Muussa tapauksessa se on siinä, minne vihollinen liikkuu. Muutoin se on siinä, mistä hyökkääjä tuli.
- Maasto luetaan yksiköiden omista korkeuksista (harjanteen takana). Näkölinjatestiä ei ole.
- Hyvin suuret tiedostot otetaan näytteinä pidemmällä askelella. Lyhyet ilmaliikkeet niissä luetaan silti 2–4 s:n askelilla.
