---
title: "Joukkokäyttäytyminen"
parent: "Havainnot"
nav_order: 3
lang: "fi"
source: "collective-behaviour.md"
source_hash: "bb95ded2346c"
translated: true
outdated: false
---

# Joukkokäyttäytyminen: väkijoukot, parvet, laumat ja päätökset paineen alla

Ottelun pelaajat käyttäytyvät kuten ihmiset missä tahansa: he kerääntyvät ovien luo, seuraavat sitä, joka lähti ensin, pysyvät yhdessä tai hajaantuvat, vetäytyvät raskaiden tappioiden jälkeen ja ottavat enemmän riskejä huonon elämän jälkeen. **Käyttäytymisen linssimittarit** mittaavat näitä kuvioita väkijoukkotieteen, joukkoliikkeen fysiikan, käyttäytymistaloustieteen ja sotilaspsykologian menetelmillä, kukin omaa nollamallia vastaan, ja tulkitsevat niitä vastaavien kohtien mukaan [tietokannasta](knowledge.md).

## Kokeile {#try-it}

1. Lataa yksi tai useampi ottelu, joissa on aika, sijainnit ja joukkueet.
2. Avaa **Havainnot** ja aja se.
3. Avaa **Linssin mittarit**: käyttäytymismittarit ovat luettelossa muiden joukossa (Yhteinen suuntaus, Reittilauma, Kaistat ja jäljet, Ruuhkautuminen, Johtajat ja seuraajat, Yhteenkuuluvuus ja jälkeenjääneet, Murtumispiste, Riski tappioiden jälkeen, Putket, Ostosopimus, Painostus), kukin omine lukuineen, testeineen ja kirjallisuuteen, joka selittää ne.
4. **Katsaus** viittaa niihin, ja **Kirjoita tekoälyllä** lähettää ne raportin mukana.

## Mittarit {#the-measures}

Radat otetaan uudelleen näytteiksi yhteen pisteeseen joka 2 s (sijainti lohkon lopussa ja nopeus sen yli). Etäisyydet skaalataan aineiston omalla tyypillisellä välillä – mediaanietäisyydellä yksiköstä lähimpään joukkuetoveriin – joten sama mittari toimii jalkaväelle, panssarivaunuille ja ilma-aluksille.

| Mittari | Mitä se mittaa | Nollamalli ja testi | Tietämys |
|---|---|---|---|
| Yhteinen suuntaus | Kunkin puolen liikkuvien yksiköiden polarisaatio (keskimääräisen yksikön suunnan pituus) joka 2 s, kiertäminen painopisteen ympäri, ajasta polarisoituneena, kiertävänä ja parvena olemisen osuudet ottelun vaiheittain; taisteluissa kahden suuntautuneen puolen välillä suuntautuneemman puolen tappo-osuus | Kunkin yksikön oma rata siirretty ajassa ottelun sisällä (säilyttää reitin, rikkoo samanaikaisuuden); merkinvaihtotesti 60 s:n ikkunoissa | Vicsek 1995, Couzin 2002, Tunstrøm 2013 |
| Reittilauma | Kuinka usein yksikkö lähtee paikasta samalla tavalla kuin edellinen joukkuetoveri (30 s:n sisällä) – samaa sisäänkäyntiä vastaan paikan omia poistumisosuuksia vastaan ja vihollisen aiempaa kulkua vastaan kopioimista vastaan | Poistumiset sekoitetaan paikan ja sisäänkäynnin sisällä; vaikutus on joukkuetoverin ja vihollisen kopioinnin erotus (Manskin heijastusongelma: kopiointi ja puolen jakama suunnitelma näyttävät samalta) | Banerjee 1992, Bikhchandani ym. 1992, Manski 1993 |
| Kaistat ja jäljet | Kahden suunnan sivuttainen erottuminen paikoissa, joissa on vastavirtaa; liikkeen osuus kaikkein vilkkaimmalla 10 %:lla maasta, sen Gini ja otteluiden vilkkaimpien alueiden päällekkäisyys | Suunnat sekoitetaan kokonaisten käyntien välillä; kaksi ruudukkoa, joita siirretty puolella paikalla, kukin testattuna, Bonferroni | Helbing ym. 1997, 2005 |
| Ruuhkautuminen | Nopeus (suhteessa yksikön omaan vauhtiin) ja virta naapureiden määrän mukaan kahden tyypillisen välin sisällä, kapasiteetin lasku tiheimmässä luokassa, vilkkaimmalla maalla; kuolemat tunnissa väkijoukoissa; laukaukset minuutissa lähellä olevien joukkuetoverien toimesta (sosiaalinen laiskuus) | Kunkin yksikön oma nopeus–tiheys-korrelaatio, merkinvaihto yksiköiden yli, vähimmäisvaikutus ρ yli ±0,05; tarkat taajuustestit | Helbing ym. 2000, Seyfried ym. 2005, Latané ym. 1979 |
| Johtajat ja seuraajat | Yhdessä liikkuville joukkuetovereille viive (enintään 8 s), jolla yhden suunta ennustaa parhaiten toisen suuntaa; johtajagraafi, kolmikkojen transitiivisuus, johtajien kuolema- ja tappoasteet | Parit, joissa yksi rata on siirretty ajassa, antavat 95 %:n kynnyksen; binomitesti 5 %:ia vastaan | Nagy ym. 2010, Couzin ym. 2005 |
| Yhteenkuuluvuus ja jälkeenjääneet | Aika, joka kuluu yli kolminkertaisen tyypillisen välin päässä lähimmästä joukkuetoverista; kuolemisen taajuus siellä verrattuna ryhmässä oloon; puolen väli suhteessa sen osuuteen taistelun tappoista | Poissonin kahden taajuuden tarkka ehdollinen testi | Shils ja Janowitz 1948, Siebold 2007 |
| Murtumispiste | Lähestymisnopeus vihollista kohti (puolen omassa vauhdissa) suhteessa menetetyn osuuteen viime minuutissa; alin tappiotaso, jolla puolet vetäytyvät | Yksisuuntainen klusterikaista-bootstrap vetäytymistä vastaan, joka on kymmenes vauhdista (tappiot tulevat siinä, missä puolet kohtaavat, ja puolet, jotka kohtaavat, lakkaavat sulkeutumasta), Bonferroni tasojen yli | Dupuy 1987, Rowland 2006 |
| Riski tappioiden jälkeen | Seuraavan elämän osuus, joka kuluu oman puolen edellä kohti vihollista, yli puolen oman osuuden ja muiden silloin palaavien yksiköiden: elämän jälkeen, joka päättyi ilman tappoa, verrattuna elämään, jossa tappo oli; varhainen kuolema varhaisen kuoleman jälkeen (kallistuminen) | Kunkin yksikön elämät sekoitetaan (ensimmäinen elämä säilyy), joten äärellisen jakson harha on nollamallissa | Kahneman ja Tversky 1979, Thaler ja Johnson 1990 |
| Putket | P(tappo k tappamisen jälkeen) − P(tappo k kuoleman jälkeen), k = 1..3 | Kunkin pelaajan oma jakso sekoitetaan 1 000 kertaa: Miller ja Sanjurjo osoittama harha vähennetään; Bonferroni k:n yli | Gilovich ym. 1985, Miller ja Sanjurjo 2018 |
| Ostosopimus | Fleissin κ varustusluokista (talous, voima, täysi; tertiilit Counter-Strikeen ulkopuolella) puolen kierroksen sisällä | Puolen pelaaja-kierrokset sekoitetaan sen kierrosten välillä | Fleiss 1971 |
| Painostus | Nopeus 4 s:n ajan ei-tappavan vahingon jälkeen verrattuna 4 s:iin ennen, ja laukaukset 10 s:n ajan jälkeen verrattuna ennen, osumissa ja saman yksikön rauhallisilla hetkillä | Merkinvaihto yksiköiden yli, vähimmäisvaikutukset 0,05 vauhdista ja yksi laukaus minuutissa | Rowland 2006 |

Jokainen raportin p-arvo kulkee Benjamini–Hochbergin väärien löytöjen osuusmenetelmän (`q`) läpi. Mittari jätetään pois, kun aineisto ei kanna sitä: ostosopimukseen tarvitaan kierrokset ja varustearvot, painostukseen vahinkotapahtumat, putkiin ja riskiin yksiköille hyvitetyt tapot ja kuolemat.

## Massa-analyysissä {#in-the-mass-analysis}

Jokainen ottelun yhteenveto (`<match>.summary.json`, katso [Massa-analyysi](mass-analysis.md)) kantaa samat mittarit kyseiselle ottelulle `behaviour`-osiossaan, joten tuhansia otteluita voi verrata lukematta niiden rivejä uudelleen.

## Kuinka hyvin se toimii {#how-well-it-works}

Simuloiduissa taisteluissa, joissa jokainen vaikutus on sisäänrakennettu, ja samoissa maailmoissa ilman niitä (`src/insights/behaviour/sim.ts`, `behaviour.test.ts`): jokainen mittari löytää siihen istutetun vaikutuksen, ja nollamaailmat pysyvät väärien löytöjen kynnyksen alla. Riski tappioiden jälkeen on vähiten tehokas; reittilauma ei osaa erottaa kopiointia yhteisestä suunnitelmasta (puoli, jolla on yksi yhteinen tavoite, on tällä mittarilla "lauma").

## Kehittäjille {#for-developers}

- `src/insights/behaviour/acc.ts` – kerääjä (uudelleen näytteistetyt radat, tapahtumat, kierrokset) ja `finish`; `motion.ts` ja `choice.ts` mittarit;
  `bstats.ts` permutaatio-, bootstrap- ja kappa-apufunktiot; `shows.ts` kuviot ja lauseet, joita linssi lukee (`lens.<measure>`).
- `feed.ts` syöttää sen havaintotyön paloista; `summaryTap.ts` ottelun yhteenvedosta, kun se suoratoistaa taulukkoa.
- Tietämys: `src/insights/knowledge/behaviour.ts` (merkinnät), `patterns-behaviour.ts`, `refs-behaviour.ts` (lähteet, joista kukin tarkistettiin Crossref- tai Open Library -tietueeseensa).
- Nimiöt: `lens.metric.<measure>` tiedostoissa `locales/*/lens.json`.
