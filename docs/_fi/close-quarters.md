---
title: "Lähitaistelut ja kierrokset"
parent: "Havainnot"
nav_order: 2
lang: "fi"
source: "close-quarters.md"
source_hash: "0469351f7e99"
translated: true
outdated: false
---

# Lähitaistelu ja kierrokset

Kierrospohjaisille ampujille (ensin Counter-Strike, mikä tahansa data, jossa on kierroksia, puolia ja tappoja) Havainnot mittaa, miten taistelut voitettiin. Se kertoo, kuka voitti avausjaksot ja mitä ne olivat arvoisia, oliko kuolemat vaihdettu, voittiko kurkkaava pelaaja pitäjän, kannattivatko ristitulet ja välähdykset, kuinka kierroksen todennäköisyys muuttui jokaisen tappon myötä, ja mitkä ovet tappoivat siihen tulevat pelaajat. Sitä käytetään sen näkemiseen, miksi kierroksia voitettiin, eikä vain sen, kuka sai tapot.

Mitat tulevat huoneiden puhdistamisen ja kaupunkitaistelun doktriinista (kohtalokas suppilo, hallintapisteet, ristitulet) sekä e-urheilun ja urheiluanalytiikan piiristä (voittotodennäköisyys, toimintojen arvo, säädetty plus-miinus). Jokainen luetaan [tietolinssin](knowledge.md) kautta ja se on viitattu.

## Kokeile {#try-it}

1. Lataa yksi tai useampi ottelu, joissa on kierroksia. CS2-muunnos sisältää kaiken tarvittavan.
2. Avaa **Havainnot** ja paina **Etsi havaintoja**.
3. Lue **Linssin mittarit** -osion rivit *Kierroksen voittotodennäköisyys* ja *Pelaajan vaikutus* välillä. Jokaisella on luvut, 95 %:n väli, q-arvo ja lähteet, joita se seuraa.
4. Valitse **E-urheilu** tai **Kaupunkitaistelu** -linssi lukeaksesi ne sen kirjallisuuden kautta. **Kirjoita tekoälyllä** lähettää ne raportin mukana.

## Mitä se mittaa {#what-it-measures}

| Mitta | Mitä se kertoo | Miten |
|---|---|---|
| Kierroksen voittotodennäköisyys | Kuinka todennäköisesti kumpikin puoli voitti kierroksen jokaisella hetkellä | Logistinen regressio puolen elossa olevien pelaajien, pommin tai tavoitteen ja sen ajan, kierroksen kellon ja ostokierroksen mukaan. Sovitettu ladattuun dataan. Kalibrointi tarkistetaan kierrosten yli ulkopuolelta (Brier-pistemäärä ja taito, logaritminen häviö, kalibrointivirhe kymmenessä luokassa, uudelleenkalibroinnin kulmakerroin, AUC) |
| Toimintojen arvo | Kuinka paljon tappo, avaustappo, vaihto, tappo välähdyksen takaa tai asennus taikka välähdys muutti puolen voittomahdollisuutta | Voittotodennäköisyys sen jälkeen miinus ennen. Vaihdot, avaukset ja välähdystappot testataan muita tappoja vastaan permutaatiolla |
| Avausjaksot | Kumpi puoli voittaa ensimmäisen taiston, kuinka usein se voittaa kierroksen ja missä toinen puoli voittaa avaukset selvästi enemmän kuin oman keskiarvonsa | Wilsonin välit. Paikat testataan tarkalla binomitestillä puolen osuutta vastaan, q paikkojen yli |
| Vaihdot | Kuolemat, joihin joukkuetoveri vastaa tappamalla tappajan 5 s:n sisällä, vastauksen kesto ja kierrokset, jotka voitettiin, kun ensimmäinen kuolema oli vaihdettu | Fisherin tarkka testi, Newcomben väli |
| Kurkkaaja vs. pitäjä | Taistelut, joissa yksi pelaaja liikkui taisteluun (1,5 m/s tai enemmän viimeisen sekunnin aikana) ja toinen seisoi paikallaan (0,75 m/s tai vähemmän). Kurkkaajan osuus | Tarkka binomitesti puolta vastaan |
| Tähtäys ennen taistelua | Kunkin pelaajan näkymä suhteessa suuntaan toiseen 0,75 s ennen tappoa. Kuka tähtäsi paremmin ja kuinka usein tuo pelaaja voitti. Pitäjät kulmassaan (15° sisällä) vs. kulman ulkopuolella. Tappoetäisyydet | Tarkka binomitesti; Fisher |
| Ristitulet | Pitäjät, joilla on paikallaan seisova joukkuetoveri 25 m:n sisällä kurkkaajasta ja jonka linja kurkkaajaan on 35° tai enemmän pois omasta suunnastaan, verrattuna yksin oleviin pitäjiin | Fisher, Newcombe |
| Apuvälineet taistelun avauksessa | Kurkkaajat oman puolen välähdyksen takana (3 s ja 15 m sisällä) tai savun takana (18 s sisällä), verrattuna kuivaan kurkkaamiseen. Avausjaksot, joissa välähdys on vain toisella puolella. Sokaistut uhrit | Fisher, binomi |
| Miesetu | Jokaiselle elossa olevien pelaajien tilalle (5v4, 4v5, 2v1 ...), johon kierroksessa päästiin ensimmäisenä, voitettujen kierrosten osuus siitä | Wilsonin välit |
| Viime hetken voitot | Kierrokset, joissa puoli jäi viimeiseen pelaajaansa: voitot verrattuna mallin odotettuihin voittoihin vastustajien määrän mukaan | Normaali testi havaittua ja odotettua vastaan |
| Pinot, kierrot, väijytykset | Suurin ryhmä 10 m:n sisällä avaustaistelussa (3 tai enemmän: pino). Pelaajat yli 30 m:n päässä ensimmäisestä taistelusta tai asennetusta kohteesta ja kuinka nopeasti he tulevat 12 m:n sisään. Aika ja tappo–kuolema-suhde yli 30 m:n päässä jokaisesta joukkuetoverista | Fisher; suhdeluku Woolfin välillä |
| Asennuksen jälkeen ja takaisinotto | Kierrokset, jotka asennuspuoli voitti asennuksen lukujen mukaan, ja sen osuus taisteluista asennuksen jälkeen | Wilsonin välit |
| Kohtalokkaat suppilot | Tulot kuhunkin paikkaan (paikkasarakkeen muutos, muuten 8 m:n solu) ja kuolemat 2,5 s:n sisällä sisäänmenosta, verrattuna kartan nopeuteen | Tarkka binomitesti, q paikkojen yli. Suhdeluku kutistetaan 20 tulolla kartan nopeuteen |
| Pelaajan vaikutus | Voittotodennäköisyys, jonka kukin pelaaja lisää kierrosta kohti (tapot, kuolemat, asennukset), kutistettuna empiirisellä Bayesilla. Harjanneregressoitu säädetty plus-miinus kierrostuloksista mallin alkutilaa vastaan. Tappojen arvo paikan ja aseen mukaan, kutistettu | Rangaistus valitaan viisinkertaisella ristiinvalidoinnilla |

Kaikki yhden analyysin testit jakavat yhden väärien löydösten osuuden (Benjamini-Hochberg). Siinä otetaan mukaan jokainen kokeiltu paikka, ei vain näytetyt. Näytetty q on kaikkien niiden yli. Malli ja sen kalibrointi sovitetaan ladattuun dataan, joten ne kuvaavat juuri sitä populaatiota. Ammattilaismalli arvioi väärin rento-pelin ja päinvastoin.

Testattu synteettisillä kierroksilla, joihin on istutettu vaikutuksia (kurkkaajan etu, ristitulet, välähdykset, yksi kohtalokas suppilo, parempi tähtäys voittaa). Sitä testattiin myös 100 aineistolla samoista kierroksista ilman näitä vaikutuksia. Niissä istutettujen vaikutusten testien väärien löydösten osuuden on pysyttävä nimellisessä 5 %:ssa (tietyn vaihteluvälin sisällä) (`src/insights/cqb/cqb.test.ts`). Noin tuhannella oikealla kierroksella malli sai Brier-pistemäärän 0,14, kun peruskanta antaa 0,25. Kalibrointivirhe oli 0,03 ja uudelleenkalibroinnin kulmakerroin 1,0.

## Tarvittava data {#data-it-needs}

- sarakkeet **time**, **player**, **side** ja **round** (istunto), ja tapot ja kuolemat tapahtumasarakkeessa. Kierroksia, joissa kukaan ei kuole kahdesti, käsitellään eliminaatiokierroksina (miesetu, viime hetken voitot ja malli tarvitsevat niitä);
- **toisen osapuolen** sarake (`other`, `victim`, `killer`, `attacker`), joka nimeää uhrin tapossa ja tappajan kuolemassa. Ilman sitä tapot ja kuolemat samalla hetkellä paritetaan;
- **katsesuunta** tähtäysmittoja varten;
- raaka `event`-sarake, jossa on `flash`, `smoke`, `he`, `molotov`, `plant` ja `defuse`, apuvälineitä ja asennuksia varten;
- `won` (rivin puoli voitti kierroksen), `place` (kutsut), `weapon`, `buy` ja `state_flashed`, kun data sisältää ne.

Sijaintien pitäisi olla näytteistetty useita kertoja sekunnissa. Nopeudet, tähtäys ja ristitulet luetaan kunkin kuoleman edellisiltä kahdelta sekunnilta.

## Erittelyssä {#in-the-breakdown}

[Erittely](breakdown.md) mittaa neljä tilannetta tekijöinä, kyllä ja ei rinnakkain: *sokaistu*, *kuolema vaihdettu*, *avausjakso* ja luvut (*miesetu*, *tasaluvut*, *miesvaje*). Jokaisesta lasketaan K/D, voitetut kierrokset, selviytyminen ja tapot minuutissa.

## Monta ottelua {#many-matches}

Jokainen [monen ottelun analyysin](mass-analysis.md) ottelutiivistelmä, jossa on kierroksensarake, kantaa samat mitat lukumäärinä (`cqb` tiivistelmässä): avausjaksot, vaihdot, kurkkaukset, ristitulet, välähdyksillä tehdyt sisääntulot, tähtäys, miesetu, asennukset ja 40 eniten käytettyä paikkaa tulojen ja kuolemien kanssa. Lukumäärät lasketaan yhteen otteluiden yli, joten tuhat ottelua antaa samat osuudet kuin yksi suuri analyysi. Paneelin **Lähitaistelu**-välilehti näyttää ne osuuksina väleineen kaikilla kartoilla tai kartoittain. Rivin napsautus lataa ne ottelut, joista se tuli.

## Kehittäjille {#for-developers}

`src/insights/cqb/`: `walk.ts` (yksi kierros rivien läpi aikajärjestyksessä, kierrokset pidetään erillään, taistelut tallennetaan tilansa kanssa), `finish.ts` (mitat ja ottelukohtaiset lukumäärät), `model.ts` (logistinen regressio IRLS:llä, kalibrointi, harjanne konjugaattigradienteilla, empiirinen Bayes, Fisher, Newcombe, permutaatiotestit), `run.ts` ja `worker.ts` (katselin: oma työntekijä havaintojen rinnalla), `summary.ts` (monen ottelun tiivistelmän kerääjä), `factors.ts` (erittelyn tilanteet), `shows.ts` (mitä linssi lukee) ja `synth.ts` (testikierrokset). Tietopohjan merkinnät ovat tiedostossa `src/insights/knowledge/cqb.ts` ja kuviot tiedostossa `patterns-cqb.ts`. Tulokset menevät raporttiin kohtaan `lens.cqb`.
