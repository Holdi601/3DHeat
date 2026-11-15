---
title: "Hahmot"
parent: "Toisto"
nav_order: 3
has_children: true
lang: "fi"
source: "figures.md"
source_hash: "e86483d60237"
translated: true
outdated: false
---

# Hahmot

**Hahmo** on pieni 3D-malli siitä, mikä yksikkö todella on: panssarivaunu, suihkukone, laiva tai sotilas. [Toisto](match-replay.md) piirtää jokaisen yksikön hahmonaan todellisessa koossa tavallisen laatikon sijaan.

Katalogissa on noin 2 000 nimettyä ajoneuvoa, lentokonetta, laivaa, asetta ja sotilasta. Katselija rakentaa ne itse.

![Demon panssarivaunut piirrettynä omina hahmoinaan](../assets/img/fi/replay-tanks.webp)

## Mitä katalogissa on {#what-is-in-the-catalogue}

| Ala | Esimerkkejä |
|---|---|
| Ihmiset | sotilas seisomassa, kyykyssä tai vatsallaan; tarkka-ampuja, panssarintorjunta, lääkintä, miehistö |
| Maa | panssarivaunut, jalkaväen taisteluajoneuvot, ilmatorjunta, tykistö, kuorma-autot ja autot, junat ja raitiovaunut |
| Ilma | hävittäjät, maahyökkäyskoneet, pommikoneet, kuljetuskoneet, helikopterit, kaksitasokoneista nykyaikaisiin suihkukoneisiin |
| Meri | sotalaivat luokittain, lentotukialukset, sukellusveneet, veneet, kauppalaivat |
| Aseet | ohjukset, raketit, pommit, torpedot, valaisu- ja häivytyspatruunat |
| Merkit | savu-, välähdys- ja palokranaatit, asetetut pommit, liput, lähtöpisteet, reittipisteet |

## Miten hahmot tehdään {#how-the-figures-are-made}

- **Rakennettu julkaistuista mitoista.** Useimmat hahmot tekee katselijan oma hahmorakentaja julkisista luvuista: pituus, leveys, korkeus, tiepyörät, torni ja tykki, siivet ja häntä. Muoto viritetään sen jälkeen julkisia valokuvia, piirustuksia ja julkaistuja mittoja vasten. Minkään pelin malleja ei käytetä.
- **Ilmaiset mallit.** Muutama hahmo käyttää ilmaisia 3D-malleja (CC0 tai CC BY), kun ne ovat todenmukaisempia. Joskus ne yhdistetään rakennettuun runkoon. CC BY -teosten tekijät mainitaan sivulla [Hahmojen tekijänoikeudet](figure-credits.md). CC0-teoksissa mainintaa ei vaadita, eikä niitä siellä luetella.
- Jokaisesta hahmosta on täysi, karkea ja kaukainen versio (yksityiskohtatasot, LOD), joten tuhansia voidaan piirtää kerralla.

## Mikä hahmo yksikölle annetaan {#which-figure-a-unit-gets}

Katselija katsoo datan omia sarakkeita:

1. **Nimet**: sarakkeet nimeltä *Name*, *Vehicle*, *Unit*, *Unit type*, *Model*, *Aircraft*, *Plane*, *Tank*, *Ship*, *Craft*, *Loadout*, *Kit* tai *Figure* verrataan katalogiin. Vertailu tehdään tarkasti, noin 4 000 aliaksen kautta (useiden pelien yksikkötunnisteet), pisimmän tunnetun alun perusteella (`F-16C_50` on F-16C) tai lyhimmän hahmonimen perusteella, joka alkaa samalla.
2. Nimeä, jonka hahmo ei sovi yksikön **tyyppiin**, ei käytetä (kuorma-auto nimeltä *Typhoon* ei ole hävittäjä).
3. **Tyypit**: sarakkeet nimeltä *Type*, *Class*, *Kind*, *Category*, *Icon*, *Role* tai *Domain* antavat luokkahahmon: Tacview-tunnisteet (`Air+FixedWing`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), karttakuvakkeet tai tavalliset sanat (tank, helicopter, infantry).
4. Data, jossa ei ole kumpaakaan, on ihmisten dataa: jokainen on sotilas.

Helpoin tapa saada oikeat hahmot on siis `vehicle`-sarake oikeilla nimillä tai `type`-sarake Tacview-tunnisteilla.

**Yksikköni näkyy laatikkona tai sotilaana.** Lisää `vehicle`-sarake oikealla nimellä tai `type`-sarake Tacview-tunnisteella. Vie hiiri yksikön päälle nähdäksesi, mikä nimi täsmäsi. Data, jossa tällaiset sarakkeet ovat, mutta joka ei kerro yksiköstä mitään, jättää sen laatikoksi. Data, jossa ei ole kumpaakaan, piirretään sotilaina.

## Asetukset {#settings}

Toiston sivupalkin osio **Hahmot** asettaa koon, pienimmän koon näytöllä, sen mihin kaukaiset yksiköt muuttuvat (hahmo, nuoli, symboli) ja niihin piirretyt efektit. Katso [Ottelun toisto](match-replay.md#figures). Savu, tuli ja muut ajastetut efektit: [Hahmot hahmopeitenäkymässä](figure-replay.md).

## Valinnainen paikallinen hahmopaketti {#an-optional-local-figure-pack}

Voit pitää omalla koneellasi valinnaisen oman hahmopaketin. Sen hahmot korvaavat katalogin hahmot samoilla nimillä. Paketti ei ole koskaan osa repositoriota tai julkaistua versiota. Ilman sitä mitään ei muutu.
