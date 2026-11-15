---
title: "Mutka mutkalta -analyysi"
parent: "Kisa-analyysi"
nav_order: 55
lang: "fi"
source: "race-corner-analysis.md"
source_hash: "ec67c3430951"
translated: true
outdated: false
---

# Mutka mutkalta -analyysi

Kaksi saman radan kierrosta verrataan mutka mutkalta. Jokaisesta mutkasta katselin kertoo, kumpi oli nopeampi, kuinka paljon aikaa se oli väärti ja miksi - jarrutettiin liian aikaisin, kaasu tuli myöhään, otettiin leveämpi linja - jotta tiedät, mitä harjoitella ensin.

![Löydös avattuna kohdassa Parannettavaa, Mutka mutkalta -taulukon vieressä](../assets/img/en/race-corner-finding.webp)

Esimerkki: mutkassa 3 kuljettaja A jarruttaa 20 m aikaisemmin kuin kuljettaja B ja menettää 0,15 s siihen pääsemisessä, mutta on kaasulla aiemmin ja voittaa 0,15 s ulosajossa. Netto 0,00 s: mutka on tasan, eikä kenellekään sanota jarruttaa myöhemmin.

## Mitä näet {#what-you-see}

### Parannettavaa {#where-to-improve}

Sivupalkin osio tarkennetulle kierrokselle (ennen sitä: "Lataa vähintään kaksi kierrosta saman radan kierroksista.").

**Otsikko:** "<kierros> <aika> verrattuna vertailuun <aika>" ja kierrosaikojen ero - tai vertailulle "verrattuna nopeimpaan muuhun kierrokseen joka mutkassa (…)" ja sen kokonaishäviö. Sen vieressä häviö jaettuna *ajamiseen* ja *autoon / tilanteeseen*.

**Hävikkipalkki:** syyryhmittäin menetetty aika (jarrutus, sisäänajo, ulosajo, suora, auto, tilanne) syyn väreillä, selitteen kanssa.

**Löydökset**, kolme luetteloa:

1. Kuljettajan menetykset, kalleimmat ensin, enintään **12** - tai "Missään ei erotu kohta, jossa toisin ajamalla voisi voittaa aikaa."
2. **Näytä, mitä auto tai tilanne maksoi (X s)** - auton ja tilanteen menetykset, enintään 8 (oletuksena päällä).
3. **Missä <kierros> on nopeampi tai tasan toisella tavalla (N)** - voitot ja tasaiset mutkat, enintään 10 (oletuksena päällä).

Jokainen löydös näyttää järjestysnumeronsa, otsikon (mutka ja mitä tapahtui, menetyksen kanssa), vaikutelmalauseen, hinnan (voitot miinusmerkillä) palkin kanssa sekä merkin: *jarrutus*, *sisäänajo*, *ulosajo*, *suora* (kuljettajan menetykset, ja "· auto X" kun auto selittää 0,02 s tai enemmän), *auto*, *tilanne*, *nopeampi*, *tasan*. **Napsauta yhtä** asettaaksesi autot riviin 40 m ennen sitä, kehystääksesi ja toistaaksesi sen, ja avataksesi sen mittaukset:

- **Jarrutus:** missä kukin jarrutti (tai nosti kaasun) ja mistä nopeudesta, ja kuinka monta metriä aikaisemmin tai myöhemmin (alkaen 5 m);
- **Hitain:** kunkin kierroksen pienin nopeus ja missä;
- **Täysi kaasu:** missä kukin oli täydellä kaasulla, ja kuinka paljon aikaisemmin tai myöhemmin;
- **Linja:** kääntymispisteen ero, tiukimmat säteet, kuinka paljon sisällä tai ulkona, ja kunkin kierroksen linjan muoto ja apeksi;
- **Suora seuraavaan mutkaan:** sen pituus, molemmat nopeudet siellä, missä molemmat olivat täydellä kaasulla, mitä se menetti tai voitti ja mistä - lähtönopeus, toisen vahvempi veto, nosto, hiottu nopeus, miten sitä ajettiin (osat alkaen 0,02 s);
- **Auto:** kuinka suuri osa menetyksestä on autoa, ja mitä (veto, pito, jarrut; kun 0,02 s tai enemmän);

sitten vinkki, **Autot:** (eri autoilla, katso [Autoprofiilit](race-car-profiles.md#what-the-cars-decide-in-a-corner)), ja linjaneuvo.

### Mutka mutkalta {#corner-by-corner}

Taulukko (kahdella tai useammalla kierroksella), yksi rivi per osuus, tarkennetun kierroksen luokasta, kun luokkia on useita:

| Sarake | Näyttää |
|---|---|
| Mutka | `T3`, `T11-T12` |
| Nopein | kierros, joka oli nopein sen läpi (sen oma aika osuuden alusta loppuun) |
| kenen | sen marginaali toiseksi nopeimpaan, s |
| linja | nopeimman kierroksen muoto ja apeksi ("V · myöhään", "U/V · keskellä"); osoita nähdäksesi sen tiukimmat, sisään- ja ulosajon säteet; "molempiin suuntiin" sekavalle kompleksille |
| (tarkennettu kierros) | kuinka paljon jäljessä nopeimmasta se oli, tai ✓ jos se oli nopein |

Rivin napsauttaminen avaa tarkennetun kierroksen löydöksen siinä (tai asettaa autot riviin 40 m ennen osuutta). Taulukon alla, kun jokaisella mutkalla on aika: "Nopein läpi jokaisen mutkan, yhteen koottuna: <aika> (± vertailussa / parhaassa luokassa X)" - parhaat osuudet sekä nopein ajo ensimmäiseen mutkaan, kun se on oma osuutensa.

## Miten se lasketaan {#how-it-is-worked-out}

Ohjaava sääntö: **mutka arvioidaan kokonaisena**, jarrutusalueelta sen mutkan alusta jarrutusalueelle seuraavaan. Kierros, joka jarrutti aiemmin saadakseen auton käännettyä ja kaasulle aiemmin, saa hyvityksen ulosajosta, jonka se osti, eikä sitä käsketä jarruttamaan myöhemmin.

## Yksi matkaakseli {#one-distance-axis}

Kierroksia verrataan matkan mukaan, ei ajan - sekunnin jäljessä kaksi kierrosta ovat eri mutkissa. Ei myöskään kunkin kierroksen oman mittarin mukaan (tiukempi linja kattaa vähemmän metrejä). **Vertailu**-kierroksen ajettu polku on akseli:

- Jokaisen muun kierroksen näytteet **projisoidaan** vertailupolulle: jokainen näyte saa `s`:n, kuinka pitkällä vertailussa se on, ja `d`:n, kuinka kaukana vasemmalle (positiivinen) tai oikealle. Haku etenee edellisestä osumasta eteenpäin (8 polkusegmenttiä taakse, 40 eteen), joten kierros, joka risteää itsensä kanssa ylitse tai alitse, ei koskaan hyppää toiseen risteykseen. Ensimmäistä näytettä etsitään polun ensimmäisestä neljänneksestä (radalla lähtö ja maali osuvat yhteen); kun mikään ei ole 30 m sisällä, otetaan lähin piste mistä tahansa, joka ei ole viimeisen osuman takana (pyörähdyksen tai harhautumisen jälkeen). `s` ei koskaan pienene: näyte, joka projisoituu edellisen takana, pidetään paikallaan.
- Jokainen kanava **uudelleennäytteistetään** yhdelle ruudukolle, **joka 2 m**, lineaarisesti; portaittaiset kanavat (vaihde, liput) lähimmän näytteen mukaan. Kierroksen oman alueen ulkopuolella arvot ovat tyhjiä.
- Kierroksen ensimmäinen ja viimeinen näyte projisoituvat hieman vertailun päiden sisäpuolelle, joten jokainen kierros **kuljetetaan enintään 15 m** päätteidensä ohi sillä nopeudella, jolla se oli (aika kasvaa matka jaettuna nopeudella, muu pysyy) - joten sen delta linjalla on sen kierrosaikojen ero.
- `delta` = kierroksen aika kussakin ruudukkopisteessä miinus vertailun: ero. `lateral` = `d` ruudukolla.

Aika, jonka yksi kierros kesti enemmän kuin toinen kahden ruudukkopisteen välillä, on niiden deltojen erotus: `rel(s)`. Kaikki alla oleva perustuu siihen.

## Mutkat {#corners}

Löydetään **vertailusta** (`findCorners`), sen nopeus tasoitettuna ±6 m yli ja sen kaarevuus (suunnanmuutos ±5 näytteen yli, tasoitettuna ±10 m yli):

1. **Nopeusminimit, joilla on merkitys.** Piste, joka on alin ±40 m sisällä, ja jonka pudotus korkeimmasta nopeudesta kummallakin puolella (ennen alempaa minimiä) on vähintään `max(2,5 m/s, 6 % nopeudesta)`.
2. **Mutkan kulmat.** Kaarevuuden paikallinen huippu, tiukempi kuin **300 m** säde, ilman nopeusminimiä 80 m sisällä: täydellä kaasulla ajettu kulma on silti mutka ajettavaksi.
3. **Vaiheet.** Jokaisesta apeksista taaksepäin, kun vertailu jarruttaa (> 0,1) tai on pois täydeltä kaasulta (< 0,95): sisäänajo; eteenpäin, kun pois täydeltä kaasulta: ulosajo. Täydellä kaasulla otettu kulma saa ±30 m. Päällekkäiset mutkat pidetään erillään, mutta ne saatetaan peittämään kierros.
4. Numeroidaan T1, T2 … kierrosjärjestyksessä; **vasen tai oikea** kaarevuuden merkin ja sen mukaan, onko maailma peilattu (tuntematon lasketaan peilattuna).

**Mutkan ikkuna** (missä vertailu kääntyy): ulospäin tiukimmasta kohdasta ±40 m sisällä apeksista, niin kauan kuin kaarevuus pysyy yli kuudesosan huipustaan, plus 10 m kummallakin puolella. Sen puoli antaa merkin "sisäpuolelle".

## Osuudet: jarrutusalueelta jarrutusalueelle {#segments-braking-zone-to-braking-zone}

Jokainen mutka omistaa tien puolivälissä sen molemmille puolille apeksit. Siinä:

- **Kunkin kierroksen hitain piste** on todellinen notko sen nopeudessa - ei mitään hitaampaa 6 m (3 ruudukkopistettä) sisällä kummallakin puolella, katsoen osuuden päiden ohi, jotta edellisen mutkan ulosajon vielä kiihtyvä nopeus ei koskaan sekoitu siihen - haettuna 15 m ennen mutkan ikkunaa 10 m sen jälkeen. Kierros, joka ei koskaan hidastanut siellä, sijoitetaan apeksiin.
- **Missä kierros alkoi hidastaa sitä varten** (`entryOf`): taaksepäin hitaimmasta pisteestä jarrutuksen tai nostamisen läpi, täyden kaasun pienet piikit ohittaen, kunnes se oli painanut kaasua (kaasu ≥ 0,95, jarru ≤ 0,1) **10 m** ajan; kaasun uudelleen otto viimeisen **30 m** aikana ennen hitainta pistettä kuuluu yhä mutkaan; täysi kaasu koko matkan: hitain piste itse. Kierros ilman kaasukanavaa, tai joka ei koskaan ollut painanut kaasua edellisen mutkan jälkeen, alkaa nopeimmasta pisteestään siinä välissä.
- **Osuus alkaa** ensimmäisestä kaikista kierroksista, jotka alkoivat hidastaa sitä varten (4 m aikaisemmin), ja jatkuu seuraavan alkuun asti, joten jokaisen kierroksen jarrutus on sen sisällä ja osuudet peittävät kierroksen.

**Kompleksit.** Peräkkäiset mutkat, joiden välillä vertailu ei koskaan aja täydellä kaasulla - alle **40 m** täyttä kaasua - ovat yksi osuus, "T11-T12", ajettu yhtenä; kompleksissa on enintään **kolme** mutkaa (mutkitteleva osuus, jota ei koskaan ajeta täydellä kaasulla, aloittaa uuden). Kompleksi, joka kääntyy molempiin suuntiin, on *sekava*: sille ei mitata yhtä linjamuotoa.

**Radalla** (vertailun päät ovat alle 50 m sen lähtöpisteestä), viimeisen osuuden suora jatkuu viivan yli ensimmäiseen jarrutuspisteeseen: lentävän kierroksen ajo viivalta lasketaan viimeisen mutkan mukaan. Kierros, joka alkoi paikaltaan tai lähdöstä (katso [Lähtö](#the-start)), pitää tuon ajon erillään.

### Mihin mutka johtaa {#what-a-corner-leads-onto}

Mitattu vertailusta: metrit täydellä kaasulla mutkan jälkeen (sen täydestä kaasusta osuuden loppuun, plus ajo viivan yli) ja ennen sitä (edellisen osuuden "jälkeen", tai alusta).

| Tyyppi | Sääntö |
|---|---|
| **kahden suoran välissä** (`both`) | 200 m tai enemmän ennen **ja** 120 m tai enemmän jälkeen |
| **suoralle** | 200 m tai enemmän jälkeen, tai 120 m tai enemmän jälkeen ja vähintään yhtä paljon kuin ennen |
| **suoran jälkeen** | 200 m tai enemmän ennen |
| **linkki** | mikä tahansa muu |

## Mitä kukin kierros teki mutkassa {#what-each-lap-did-in-a-corner}

`cornerMetrics`, kierroksittain ja osuuksittain, ruudukolla (askel 2 m). Pedaalit: jarru lasketaan yli 0,1; täysi kaasu on 0,95 ja enemmän.

| Mitta | Sääntö |
|---|---|
| **jarrutuspiste** | ensimmäinen jarrutus, jonka aikana kaasu nousi pois (alle 0,5), tai joka kesti **15 m** - jarrun pieni koskettaminen vasemmalla jalalla tehon ollessa päällä ei ole sitä, missä jarrutus alkoi; pelkkien koskettamisten kohdalla ensimmäinen koskettaminen |
| **nostettu** | ilman jarrutusta, ensimmäinen piste, jossa kaasu laski alle 0,8 |
| (ei pedaaleja) | piste, jossa kierros alkoi hidastaa (yllä) |
| **jarrun vapautus** | viimeinen jarrutus enintään 30 m hitaimman pisteen jälkeen |
| **nopeus jarrutuspisteessä**, **jarrutusmetrit** | hitaimpaan pisteeseen asti |
| **huippujarru**, **huippuhidastuvuus** | jarrutusalueen yli (yli 45 m/s² kiihtyvyydet jätetään huomiotta) |
| **jarrutus kääntyessä** | metrit, joissa jarru > 0,05 ja \|ohjaus\| > 0,1 |
| **pyörän lukkiutuminen** | alin pyörän lipsuluku alueella (kun kierroksella on lipsu) |
| **hitain piste**, **pienin nopeus** | kuten yllä |
| **kaasu päällä** | vapautuksen (tai hitaimman pisteen) jälkeen ensimmäinen kaasu > 0,15 ilman jarrua |
| **täysi kaasu** | ensimmäinen piste sen jälkeen, joka pysyi ≥ 0,95 10 m ajan |
| **rullaus** | metrit vapautuksesta kaasun päälle, kun jarru ja kaasu ovat molemmat alle 0,05 |
| **kaasun notkahdukset** | kertoja, kun kaasu laski yli 0,25 sen juoksevan huipun alle kaasun päällä ja täydellä kaasulla välillä |
| **huippupoikittaisuus** | suurin poikittaiskiihtyvyys 20 m ennen vapautusta siihen myöhempään, joko täyteen kaasuun tai 20 m hitaimman pisteen jälkeen |
| **vaihde apeksilla** | hitaimmassa pisteessä |
| **kuljetun pyörän lipsu** | suurin käytettävän pyörän lipsuluku kaasun päällä ja täyden kaasun välillä |
| **tasapaino** | etu miinus takana kulmalipsu keskellä (+ alistuva ohjaus) |
| **suora täydellä kaasulla** | osuus osuuden loppuosasta täyden kaasun jälkeen (ja ajo viivan yli) ≥ 0,95; sen pisin nosto |
| **hiottu nopeus** | suurin menetetty nopeus korkeasta pisteestä, kaasu ≥ 0,9, ei jarrua, maassa |
| **sisäänajon ajautuminen** | suurin ajautumiskulma jarrutuspisteestä 5 m hitaimman pisteen jälkeen, maassa |
| **käsijarru** | missä se tuli päälle (> 0,2), enintään 10 m hitaimman pisteen jälkeen |
| **ilmassa** | sekunnit ilmassa osuuden yli, ja sen pisin lento |

## Kenen kanssa kukin kierros verrataan {#who-each-lap-is-compared-with}

- Kierrosta verrataan **nopeimpaan täydelliseen kierrokseen omassa suorituskykyluokassaan** (vertailu vertailun luokassa).
- Tuo luokan paras kierros itse (ja vertailu) verrataan osuus osuudelta sen **muuhun kierrokseen luokassaan, joka oli nopein** sen läpi - tai kaikkiin kierroksiin, kun se on luokassaan yksin.

Aikakartta, kierroslistan erot, auton hallintatapahtumat ja mutkataulukko seuraavat samaa vertailua.

## Mutkan aikalaskelma {#the-time-account-of-a-corner}

`compareCorner`, kierrokselle verrattuna toiseen osuuden yli:

- **netto** = `rel(loppu) - rel(alku)` (plus ajo viivan yli lentävällä kierroksella): tuomio. Lähempänä kuin **0,03 s** on **tasan**.
- **Jako** - missä mutkan sisällä johtava kierros kääntyi: osuudella ensimmäisestä jarrutuspisteestä tai hitaimmasta pisteestä kummastakin kierroksesta myöhempään niistä täyden kaasun ja hitaimman pisteen kohdalla, suurin heilahdus, jonka kierros sitten antoi tai voitti takaisin, kun heilahdus on yli **0,04 s**; muuten kahdesta hitaimmasta pisteestä myöhempi.
- **Apeksiin** = `rel(jako) - rel(alku)`; **sen jälkeen** = netto miinus tuo. Kun molemmat ovat vähintään 0,04 s ja vastakkaisia merkkejä, kierros **vaihtoi** toisen toiseen.
- **Sen jälkeen** jakautuu uudelleen, missä molemmat kierrokset ovat täydellä kaasulla: **ulosajo** (jako täyteen kaasuun asti myöhemmin) ja **suora** (sieltä loppuun).
- **Suora** jakautuu kolmeen osaan:
  - *ulosajon nopeus* (`byExit`) - mitattu, ei mallinnettu: hitaampi auto ohittaa nopeamman auton lähtönopeuden hieman suoralla, ja sieltä sen oma jälki on se, mitä se olisi tehnyt siitä nopeudesta, omine vaihteineen, ilmanvastuksineen ja kaltevuuksineen. Siirrettynä takaisin tuohon pisteeseen (ja ajettuna loppunopeudellaan niin pitkälle kuin se voittaa metrejä) se on sen aika nopeamman lähdöstä; ero on ulosajon nopeuden hinta. Kun hitaampi auto ei koskaan saavuta sitä nopeutta (tai vain viimeisissä 2 näytteessä), sen oma kiihtyvyys osuudella lasketaan takaisin tehona (`a·v` pidetään), ei koskaan kovemmin kuin sen käyrä näyttää siinä nopeudessa (kaksi kertaa mitattu kiihtyvyys ilman käyrää).
  - *autojen veto* (`byPower`) - vain eri autoilla: molemmat autot samasta nopeudesta samoilla metreillä, täydellä kaasulla, integroiden kunkin täyden kaasun kiihtyvyyden jokaisella nopeudella.
  - *miten sitä ajettiin* (`driven`) - loput: nosto, täydellä kaasulla hiottu nopeus.

  Ulosajon nopeus ei koskaan selitä enempää kuin suoran hinta (eikä koskaan vastakkaisella merkillä), ellei nosto tai hiottu nopeus vienyt sitä takaisin. Kierros **nosti** suoralla, kun sen osuus täydellä kaasulla on alle sekä 0,9 että toisen osuuden miinus 0,05. Hiottu nopeus lasketaan, kun kaksi eroavat yli 1 m/s. Alle 0,02 s:n erimielisyys merkissä asetetaan nollaan.

Jokaisen osuuden netto laskee yhteen kierrosaikojen eroksi, ja jokaisen mutkan apeksiin ja sen jälkeen -osat laskevat yhteen sen nettoon (testit tarkistavat molemmat).

### Auton osuus {#the-cars-share}

Vain kun kierrokset ovat **eri autoilla** ja kierros menetti aikaa (`carShare`):

- **veto**: autojen veto suoralla (yllä), enintään menetykseen asti;
- **pito**: kun kierros oli autonsa rajalla (poikittaiskiihtyvyys keskellä vähintään **90 %** siitä, minkä auto kestää sillä nopeudella) ja toinen auto pitää yli **5 %** enemmän: alemmasta miniminopeudesta, jota ei selitä tiukempi säde, osuus `½ ln(pito_toinen / pito_oma) / ln(v_toinen / v_oma)` jäljellä olevasta menetyksestä;
- **jarrut**: kun kierros jarrutti (ei nostanut), toinen auto jarruttaa yli **5 %** kovemmin, ja kierroksen *keskimääräinen* hidastuvuus alueella oli vähintään **80 %** siitä, mitä sen auto pystyy: `u`:sta alas `v`:hen `a1`:llä vastaan `a2`, päättyen samaan pisteeseen, `(1/a1 - 1/a2)(u - v)² / 2u`, jäljellä olevaan asti.

Auton hinta on summa, enintään menetys.

## Tuomio ja löydös {#the-verdict-and-the-finding}

`cornerFinding` kirjoittaa enintään yhden löydöksen kierrosta ja mutkaa kohden, kokeillen tässä järjestyksessä:

| Tapaus | Löydös | Tulos |
|---|---|---|
| netto ±0,03 s sisällä, vaihto, pienempi puoli vähintään **0,1 s** | **tasan, kahdella tavalla** - kuka oli hidas sisään ja nopea ulos, ja kumpi toisin päin; kun suora seuraa (suoralle tai kahden välissä), hidas sisään ja nopea ulos -tapa on se, jolle rakennetaan: pidä sen aikainen kaasu, voita sisäänajo takaisin jarruttamalla kovemmin, ei myöhemmin | tasan |
| netto ±0,03 s sisällä muuten | ei sanota mitään | - |
| voitettu, vaihto, hävitty apeksiin | **hidas sisään, nopea ulos kannatti**: pidä se, tässä ulosajo on enemmän väärti | voitto |
| voitettu, vaihto, voitettu apeksiin | **nopeampi sisäänajossa**: sisäänajo on oikein, aikaisempi täysi kaasu säilyttäisi enemmän | voitto |
| voitettu, ja toisella kierroksella on tässä menetys | **nopeampi - koska toinen teki sen, minkä teki**, sen syy ja vinkki sanoivat "Toiselle kierrokselle: …" | voitto |
| voitettu muuten | **nopeampi sisäänajossa / ulosajossa**, sen mukaan kumpi puoli voitti enemmän (jarrutus myöhemmin, enemmän nopeutta keskellä; tai kaasu aiemmin, vahvempi veto) | voitto |
| hävitty, ja **osuma tai kolari** maksoi vähintään `max(0,05 s, 40 % menetyksestä)` | isku on mutkan tarina, ennen autoja | menetys |
| hävitty, ja **auton osuus** on 60 % tai enemmän | **auto**: sen veto suoralla, sen pito keskellä tai sen jarrut - suurin osa; kuljettajan osa (≥ 0,03 s) sanottuna "Muu X s: …" | menetys |
| hävitty, ja yksi jakamaton **auton hallinnan virhe** maksoi vähintään `max(0,05 s, 40 %)` | se virhe (katso alla), ja kuinka aika siirtyi sen ympärillä | menetys |
| hävitty, ja **pidempi lento** maksoi vähintään `max(0,05 s, 40 %)` | lento | menetys |
| hävitty, vaihto, voitettu apeksiin | **liian nopea sisään, hidas ulos**: ulosajon syy; anna jotain sisäänajosta, jotta se kääntyy ja on tasaisella aiemmin, toisen kierroksen jarrutus- ja täyden kaasun pisteillä. Sen juuri (`cause`, jonka [tilastot](race-course-statistics.md) laskevat): jarrutus myöhemmin, kun se jarrutti useita metrejä toista myöhemmin; muuten ulosajon syy | menetys |
| hävitty, vaihto, hävitty apeksiin | **antoi enemmän sisäänajossa kuin ulosajo voitti takaisin**: sisäänajon syy, joka on myös sen juuri (`cause`); pidä ulosajo, häviä vähemmän sisäänajossa | menetys |
| hävitty, nostettu suoralla, ja ajettu osa yli puolet menetyksestä | **ei täydellä kaasulla suoralla**: osuus siitä täydellä kaasulla verrattuna toiseen, missä ja kuinka pitkään nosto | menetys |
| hävitty, autojen veto yli 60 % menetyksestä ja suora yli puolet | **auton veto suoralla** (molempien autojen veto 160 km/h:ssa) | menetys |
| hävitty muuten | puolikkaan syy, joka hävisi enemmän (apeksiin ≥ sen jälkeen: sisäänajon; muuten ulosajon). Hitaampi ulos vain siksi, että hitaampi keskellä (yli 1 m/s): keskikohdan syy sen sijaan | menetys |

Menetykseen liittyvä löydös voi myös päättyä **Lisäksi:** - hiottu nopeus täydellä kaasulla tai nosto suoralla - kun suoran ajettu osa maksoi yli 0,04 s, eikä se ollut jo syy.

Löydökset lajitellaan: menetykset ensin, kalleimmat ensin; sitten voitot ja tasaiset mutkat.

### Syyt sisäänajossa {#causes-on-the-way-in}

`entryCause`, ensimmäinen joka sopii (nopeuserot ovat m/s; "5 m" on raja, jolla aikaisempi tai myöhempi piste lasketaan):

| # | Syy (virhe) | Sääntö |
|---|---|---|
| 1 | osuma tai kolari sisäänajossa | jakamaton isku, joka alkaa 10 m hitaimman pisteen jälkeen |
| 2 | **melkein pysähtynyt** (tapaus) | hitain nopeus alle **60 %** siitä, mitä tämän auton pito sallii siinä, missä toinen ajoi (`v_toinen · √(pito_oma / pito_toinen)`, kun toinen auto pitää enemmän, muuten toisen nopeus), toisen kierros yli 8 m/s - pyörähdys, kosketus tai ohitettu mutka |
| 3 | auton hallinnan virhe sisäänajossa | jakamaton lukko, työntö, pyörähdys tai liuku, ei kaasulla, alkaa 10 m hitaimman pisteen jälkeen, hinta ≥ 0,02 s |
| 4 | pidempi lento ennen hitainta pistettä | katso [rally](#rally-rotation-and-flights) |
| 5 | **nostettu**, kun toinen pysyi täydellä kaasulla tai nosti 5 m tai enemmän myöhemmin | tämä kierros vain nosti |
| 6 | **jarrutettu, kun toinen vain nosti** tai pysyi täydellä kaasulla | ja oli yli 0,5 m/s hitaampi keskellä |
| 7 | **jarrutettu varovasti** | se jarrutti (ei nostanut), sillä oli tilaa jarruttaa kovemmin - renkaiden tiedoilla, sen lukkolipsu alle **60 %** siitä lipsusta, jossa tämän auton jarrut antavat parhaansa; ilman niitä, huippuhidastuvuus alle **85 %** siitä, mitä se näyttää sillä nopeudella - pedaali alle 0,95, ja toisen kierroksen huippuhidastuvuus yli **15 %** korkeampi |
| 8 | **jarrutettu aikaisin** - tai **auton jarrut** | jarrutettu yli 5 m ennen toista. Toisella autolla, jonka jarrut ovat yli 5 % vahvemmat, ja enintään 10 m varaa verrattuna siihen matkaan, jonka tämä auto tarvitsee omalla hidastuvuudellaan: auton jarrut. Muuten aikaisin jarrutettu, kanssa "Jarruta myöhemmin - noin N m" (toisella autolla metrit, joita se tarvitsee enemmän) |
| 9 | **rullasi** | yli 10 m ilman kumpaakaan pedaalia, ja 5 m enemmän kuin toinen |
| 10 | **hitaampi keskellä** | yli 0,5 m/s hitaampi hitaimmassa pisteessä; jaettu `v² = a·R` (alla) |
| 11 | **saapui hitaammin** | yli 1 m/s hitaampi jarrutuspisteessä, ei jarrutettu aikaisin: päätetty aiemmin - edellisen mutkan ja auton vedon mukaan, tai edellisen mutkan lennon mukaan, joka oli 0,2 s pidempi. Auton, kun autot eroavat |
| 12 | hitaampi apeksiin | muuten: vapauta jarru pehmeämmin ja vieritä enemmän nopeutta keskelle |

**Hitaampi keskellä** (`middleSplit`): kunkin kierroksen säde hitaimmassa pisteessään mitataan sen omalta polulta (±8 m), sen poikittaiskiihtyvyys `v²/R`, ja

`ln(v_toinen / v_oma) = ½ ln(a_toinen / a_oma) + ½ ln(R_toinen / R_oma)`.

- Säde selittää **puolet tai enemmän**: **liian tiukka linja** - "käytä enemmän tietä", molemmat säteet ja osuus.
- Auton rajalla (liukuu yli 10° ajautumista asfaltilla / 20° irtonaisella, tai poikittaiskiihtyvyys vähintään 90 % siitä, mitä se kestää sillä nopeudella) ja toinen auto pitää yli 5 % enemmän: **auton pito**; suojaa sen sijaan ulosajo.
- Liukuu sen läpi (ajautuminen yli 10° / 20°), eikä toinen kierros (sen sisäänajon ajautuminen vähintään 4° vähemmän): **sivuttain** - yli sen pidon, ei sen alapuolella; saavu hieman hitaammin. Sanotaan auton, kun tämä auto saa takapäänsä kiinni vähintään kerran kierroksessa enemmän kuin toinen.
- Toisella autolla, jolla on alle **96 %** toisen pidosta, ja kierros kantoi 1 m/s sisällä `v_toinen · √(pito_oma / pito_toinen)`: **auton pito** - "myöhemmin jarruttaminen ei kurista sitä umpeen".
- Muuten **pitoa jäljellä**: poikittaiskiihtyvyys toisen vastaavaa sädettä vasten, ja mitä tämä auto kestää; kanna enemmän nopeutta apeksiin. Missä tämän auton takapää päästää irti ennen kuin sen pito on käytetty loppuun (sen liuku alkaa alle 85 %:ssa pidosta, ja kierros oli 80 %:ssa siitä), etsi loput pienin askelin.

### Syyt ulosajossa {#causes-on-the-way-out}

`exitCause`, ensimmäinen joka sopii:

| # | Syy (virhe) | Sääntö |
|---|---|---|
| 1 | auton hallinnan virhe ulosajossa | jakamaton pyörän pyöriminen, pyörähdys, liuku tai isku, joka päättyy tai on 10 m ennen hitainta pistettä tai sen jälkeen |
| 2 | **hiottu nopeus** | yli 1 m/s enemmän nopeutta menetetty täydellä kaasulla kuin toisella; yli **7 m/s (25 km/h)** "enemmän kosketusta tai pyörähdystä kuin liukua" |
| 3 | **käänsi auton väärin** (irtonainen alusta) | katso [rally](#rally-rotation-and-flights) |
| 4 | **tehoa myöhemmin** | kaasu päällä yli 5 m myöhemmin, laskettuna myös kunkin kierroksen omasta hitaimmasta pisteestä (kierros, jonka hitain on myöhemmin, ei saa syyksi myöhäistä kaasua) |
| 5 | **epäröi kaasulla** | enemmän kaasun notkahduksia kuin toisella |
| 6 | **ajoi leveästi ja odotti** | yli 1,5 m toisen ulkopuolella, kun molemmat olivat tasaisella, ja täysi kaasu yli 5 m myöhemmin omasta hitaimmasta pisteestään |
| 7 | **täysi kaasu myöhemmin** | täysi kaasu yli 5 m myöhemmin, myös omasta hitaimmasta pisteestään; auton kiihtyvyys siellä mukaan lukien |
| 8 | **auton ajo** | toisella autolla, joka vetää alle 95 % toisesta sillä nopeudella, ja veto selitti osan suorasta |
| 9 | **hitaampi ulos mutkasta** | muuten: myöhempi apeksi, joten auto on suoralla aiemmin |

Kun kaksi kierrosta oli eri vaihteilla hitaimmassa pisteessä, vinkki päättyy: "Vaihde N apeksilla; toinen käytti M."

### Auton hallinnan virheet ja iskut {#car-control-faults-and-impacts}

[Auton hallintatapahtuman](race-control-events.md) virhe syynä: lukko on *jarrutuksen* syy, pyöräyksen tai liuku kaasulla *ulosajon* syy, muu *sisäänajon*; isku hitaimman pisteen jälkeen on *ulosajoa*, ennen sitä *sisäänajoa*. Vinkki on tapahtuman oma, sitten "Se maksoi noin X s 40 m:iin sen jälkeen" (tai "siihen asti, kun auto sai nopeutensa takaisin" iskulle). Lukko, jonka jarrutuspiste on yli 5 m aikaisempi kuin toisen, lisää, että kierros jarrutti myös aikaisin - pyörien pyöriessä sitä ei olisi tarvittu.

### Rally: kääntyminen ja lennot {#rally-rotation-and-flights}

**Irtonaisella alustalla**, ajautumiskulmien ollessa molemmilla kierroksilla, ja tämä kierros kaasulla (tai tasaisella) yli 5 m myöhemmin:

- **Käänsi autoa vähemmän**: toinen oli kääntänyt autoa **12°** tai enemmän hitaimpaan pisteeseensä ja vähintään **8°** enemmän kuin tämä kierros. Vinkki: nosto tai vasemman jalan jarrun pieni kosketus, kun se kääntyy sisään, toisen kierroksen käsijarrun pisteellä, kun vain se käytti sitä, tai käsijarru mutkassa, joka on hitaampi kuin 15 m/s (54 km/h).
- **Käänsi liian pitkälle**: tämä kierros oli kääntänyt sitä 12° tai enemmän ja vähintään **12°** enemmän kuin toinen: se piti suoristaa, ennen kuin veto voi tulla.

**Pidempi lento**: ilmassa 0,2 s tai enemmän pidempään kuin toinen, maksaen vähintään 0,03 s 10 m ennen ilmaan lähtöä 40 m laskeutumisen jälkeen (tai osuuden loppuun asti). Ennen hitainta pistettä se on sisäänajon syy; siitä tulee mutkan tarina, kun se selittää 40 % tai enemmän. Vinkki: pidä kaasu päällä lähtiessä, ota harju hieman hitaammin tai jarrun pienellä koskettamisella.

### Lähtö {#the-start}

Ennen ensimmäistä mutkaa, sprintillä tai kun kumpikin kierros alkoi paikaltaan (alle 5 m/s, kun molemmat ovat ensimmäisinä akselilla) tai lähdöstä (alle 60 % toisen nopeudesta), ajo ensimmäiseen jarrutuspisteeseen on oma löydöksensä (mutka 0), kun se eroaa yli 0,03 s: *Lähtö*, *Kilpailun alku* tai *Ensimmäiseen mutkaan*. Menetys siellä kirjataan tilanteelle (*tilanne*), kun toinen kierros alkoi kilpailun lähdöstä ja toinen vauhdista, autolle, kun autot eroavat, ja muuten kuljettajalle. Vinkit: toisella autolla seisomasta, "enimmäkseen auto"; saman auton paikallaan lähtö, lähde vähemmällä renkaiden pyörimisellä ja vaihda tehokaistan yläosassa; kilpailun lähtö, vertaa toiseen ensimmäiseen kierrokseen; lentävä lähtö, parempi ulosajo viimeisestä mutkasta viedään viivan yli.

## Ajettu linja {#the-driven-line}

`lineMetrics`, kierroksittain ja osuuksittain (ei sekaville kompleksille), pelkistä sijainneista (tasoitettu ±2 näytteen yli) mutkan ikkunalla:

| Mitta | Sääntö |
|---|---|
| kaarevuus | suunnanmuutos ±8 m yli kierroksen oman polun |
| **tiukin säde** | 1 / kaarevuuden huippu |
| **sisäänkääntyminen** / **ulosajon pää** | missä kaarevuus ylittää ensin / viimeksi viidesosan huipustaan |
| **keskikohta** | missä kierros oli kääntynyt puolet suunnanmuutoksestaan |
| säde sisään / ulos | metrit ajettu yli puolen suunnanmuutoksen, ennen / jälkeen keskikohdan |
| **muoto** | tiukin säde jaettuna keskimääräisellä säteellä kääntyessä: alle **0,55** on **V**, yli **0,75** on **U**, välissä "U/V" |
| **apeksi** | ulossäde jaettuna sisäsäteellä: yli **1,25** myöhään, alle **0,8** aikaisin, muuten keskellä |
| **nopeusapeksi** | hitain piste yli **15 m** ennen keskikohtaa: hidas sisään, nopea ulos; yli 15 m keskikohdan jälkeen: yhä hidastaa keskikohdan ohi |

Toista kierrosta vastaan: kuinka paljon sisällä (+) tai ulkona se ajoi sisäänkääntyessä, tiukimmassa kohdassa ja missä molemmat olivat tasaisella (sanottu 1 m alkaen); missä kukin kääntyi sisään (sanottu 8 m alkaen).

### Mikä linja sopii tälle autolle tässä {#which-line-suits-this-car-here}

`lineFor`, siitä mihin mutka johtaa ja auton luonteesta tässä mutkassa:

- **teho pitoon** = auton täyden kaasun kiihtyvyys ulosajon nopeudella jaettuna sen pidolla minimi­nopeudessa (sen käyrästä). **Pistä ja ammu** **0,45** ja yli; **vauhti** **0,25** ja alle.
- **alaspaine**: pito 151-252 km/h jaettuna pidolla 54-108 km/h on **1,15** tai enemmän, mutkalle, joka otetaan **144 km/h** (40 m/s) tai nopeammin - silloin se on vauhtimutka tehosta riippumatta. Ei arvioida irtonaisella alustalla.

| Mutkan tyyppi | Auto | Linja |
|---|---|---|
| suoran jälkeen | pistä ja ammu / muu | V / U, apeksi keskellä: "jarrutusalue on palkinto" |
| kahden suoran välissä | vauhti / muu | U / V, myöhäinen apeksi |
| linkki | vauhti / muu | U / V, apeksi keskellä: "aja se seuraavan ulosajoa varten" |
| suoralle | vauhti (tai nopea alaspainemutka) | leveä pyöreä U, hieman myöhäinen apeksi |
| suoralle | pistä ja ammu | V: jarru suoraan, käänny myöhään, pyöri lyhyessä tiukassa keskiosassa, suoraan aikaisin |
| suoralle | välimuoto | U myöhäisellä apeksilla: hidas sisään, nopea ulos |

Missä ulosajo on tärkeä (suoralle, kahden välissä), vetotapa lisää lauseen: **FWD** - kiristä se jarruilla, lisää tehoa vain kun pyörä vapautuu; **RWD** ja tehon pitoon 0,35 tai enemmän - suorista se ennen täyttä kaasua; **AWD** - se voi ottaa tehoa vielä kääntyessä. Irtonaisella alustalla jokainen linja lisää: käännä auto sisäänajossa.

Lause kertoo sitten, mitä kierros ajoi, ja sopiiko se: *myöhäinen hitaus sitoo ulosajon* tai *aikainen apeksi sitoo ulosajon*, kun myöhäinen apeksi olisi toivottu eikä kierros apeksoinut myöhään eikä ollut hidas aikaisin; *pyöreämpi kuin tämä auto haluaa*, kun V olisi toivottu; *kulmikkaampi kuin tämä auto haluaa*, kun U olisi toivottu; muuten *tuo sopii*.

## Kehittäjille {#for-developers}

Koodi: [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts),
[`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts),
[`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts),
[`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts),
[`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx).
Perustelut ja niiden lähteet: [menetelmä](race-analytics.md).
