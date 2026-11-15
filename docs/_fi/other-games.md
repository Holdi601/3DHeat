---
title: "Muut kilpailupelit"
parent: "Kisa-analyysi"
nav_order: 59
lang: "fi"
source: "other-games.md"
source_hash: "79f0f087f176"
translated: true
outdated: false
---

# Muut kilpailupelit katselijassa

Katselija lukee kierroksia monesta kilpailupelistä, ei vain yhdestä. Tällä sivulla luetellaan ne ja kerrotaan, miten kierros saadaan kustakin.

## Pelit {#the-games}

| Peli | Tallentaja | Luiskaus tiedostossa? | Maailma peilattu? | Huomautuksia |
|---|---|---|---|---|
| Forza Horizon 4/5/6, Forza Motorsport | `heat3d_capture telemetry` (Data Out UDP:n kautta), tai FH Companionin kierrostiedostot ja niiden `.tele.gz` | kyllä, jokaiselle pyörälle (normalisoitu) | kyllä (vasenkätinen maailma) | jokaisen FH Companionin kierrostiedoston vieressä oleva `.tele.gz` antaa kaikkien pyörien luiskauksen; pelkkä kierrostiedosto ei riitä |
| Assetto Corsa, ACC, AC EVO, AC Rally | `heat3d_capture telemetry --game ac / acc / acevo / acrally` (jaettu muisti) | kyllä, jokaiselle pyörälle | mitataan kierroksista | myös ABS ja vetokontrolli toiminnassa, pyörien kuormat ja lämpötilat |
| EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4 | `heat3d_capture telemetry --game wrc / dirtrally2 / dirtrally / dirt4` (UDP) | ei, lasketaan pyörien nopeuksista | mitataan kierroksista | rallissa löysä maa ja hypyt arvioidaan eri tavalla |
| Richard Burns Rally | `heat3d_capture telemetry --game rbr` (NGP UDP) | ei | mitataan kierroksista | ei pyörien nopeuksia |
| BeamNG.drive | `heat3d_capture telemetry --game beamng` (modi) | ei, lasketaan pyörien nopeuksista | mitataan kierroksista | |
| Trackmania | Openplanet-liitännäinen, `telemetry --game trackmania --install` | luiskauskerroin jokaiselle pyörälle | mitataan kierroksista | arcade-fysiikka: luistot arvioidaan eri tavalla |
| iRacing | ei mitään: oma `.ibt`-tiedosto | ei (ei kirjata); lasketaan kääntymisnopeudesta | ei (GPS-pohjainen) | kytke kirjaus autossa päälle näppäimillä Alt+L |

## Kierroksen tallentaminen {#how-to-record-a-lap}

1. Valitse pelisi taulukosta ja aseta se tallentajan sivun mukaan (asetus pelissä, modi tai ei mitään iRacingin kohdalla). Vaiheet vaihtelevat pelittäin, joten ne ovat tallentajien ohjeissa: [GameCapture: pelit](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md).
2. Käynnistä tallentaja ja aja. Se kirjoittaa yhden tiedoston kierrosta kohti.
3. Paina välilehdellä **Kisa-analyysi** nappia **Lataa kierrostiedostot…** ja valitse kaksi tai useampi saman radan kierros (katso [Kierrosten lataaminen](race-loading-laps.md)).

Rallipeleissä tallentaja antaa yhden tiedoston erikoiskokeesta. Forzalle helpoin alku on FH Companionin kirjasto sen `.tele.gz`-tiedostoineen kierrostiedostojen vieressä.

## Mitä tallentajat dokumentoivat {#what-the-recorders-document}

Tallentajien ohjeissa kerrotaan, miten kukin peli tallennetaan, mitä se lähettää, mistä sen asettelut ovat peräisin ja mitkä radat voidaan viedä sen tiedostoista. Ohjeet ovat julkisia: [GameCapture: pelit](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md) (julkinen, repossa [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture)). Jokaisen tallentajan kirjoittama kierrostiedosto on kuvattu sivulla [GameCapture: kierrosmuoto](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).

## Mitä katselija tekee niillä {#what-the-viewer-does-with-them}

Jokainen peli päätyy `heat3d-lap`-tiedostoiksi (tai kierros-CSV:ksi, tai se luetaan suoraan, kuten iRacingin `.ibt`). Kanavien nimet ovat `src/race/schema.ts`:n yleisiä nimiä. Mukana on `meta`-lohko, joka kertoo, mitä luvut tarkoittavat: miten luiskaus on skaalattu, onko kyseessä rata, rallin vai arcaden, ja pinta, kun se tiedetään. Siksi välilehti **Kisa-analyysi** käsittelee niitä kaikkia samalla tavalla. Kun radan mallia ei ole ladattu, välilehti piirtää tien kierrosten omasta levityksestä. Näin jokainen peli on käytettävissä ilman radan mallia.

Mitä mikään rallipeli ei lähetä, eli renkaan luiskauksen, katselija laskee itse. Jos peli lähettää pyörän kosketuspisteen tai pinnan nopeuden, katselija vertaa sitä auton nopeuteen (`(wheel - car) / car`). Jos peli lähettää vain pyörimisen, katselija käyttää pyörimistä ja kierroksella itse mitattua vierintäsädettä. Ajokulma tulee auton omasta nopeudesta (Forza, AC-pelit, Trackmania, RBR), tai maailman nopeudesta, joka on projisoitu auton akseleille (EA WRC, DiRT, BeamNG), tai suunnasta suhteessa rataan. Se, onko auto ilmassa, tulee pyörien kosketuksesta, kuormista tai jousituksesta. Katso `src/race/derive.ts`.

Jos pelin maailma on vasenkätinen, kuten Forzan, rata tulee katselijaan peilattuna. Kierrosten oma ohjaus ja jousitus paljastavat sen, ja välilehti **Kisa-analyysi** tarjoaa akselin kääntämistä. Pelit, joiden kätisyys ei ole dokumentoitu (RBR, BeamNG, Trackmania), käsitellään samalla tavalla: ne mitataan, eivät oleteta.

Ajokanavien lisäksi tallentajat tallentavat sen, mitä kukin peli lisää: AC-pelien ABS- ja vetokontrollin toiminnan, jarrujakauman, DRS:n, pit limiterin, turbon sekä jarrupalojen ja -levyjen iän; iRacingin apuasetukset, jarrujakauman, polttoaineen, öljyn ja vesien lämpötilat sekä kaikki muut kanavat omilla nimillään. Katselija piirtää ne kanavataulukostaan: lampuilla, tasoilla, merkeillä ja kuvaajilla. Siksi lisää tallentamista ei vaadi muutoksia katselijaan.
