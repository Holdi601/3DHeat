---
title: "Hahmot"
parent: "Replay"
nav_order: 3
has_children: true
lang: "fi"
source: "figures.md"
source_hash: "a2353c6a73bc"
translated: true
outdated: true
---

# Hahmot

**Hahmo** on pieni 3D-malli siitä, mikä yksikkö todella on: panssarivaunu, suihkukone, laiva tai sotilas. [Toisto](match-replay.md) piirtää jokaisen yksikön hahmonaan todellisessa koossa tavallisen laatikon sijaan.

Nimettyjä ajoneuvoja, lentokoneita, laivoja, aseita ja sotilaita on noin 2 000. Katselin rakentaa ne itse.

![Esimerkkidatan panssarivaunut omina hahmoinaan](../assets/img/fi/replay-tanks.webp)

## Mitä luettelossa on {#what-is-in-the-catalogue}

| Alue | Esimerkkejä |
|---|---|
| Ihmiset | seisova, kyykyssä ja vatsallaan makaava sotilas; tarkka-ampuja, panssarintorjunta, lääkintä, miehistö |
| Maa | panssarivaunut, jalkaväen taisteluajoneuvot, ilmatorjunta, tykistö, kuorma-autot ja autot, junat ja raitiovaunut |
| Ilma | hävittäjät, maahyökkäyskoneet, pommikoneet, kuljetuskoneet, helikopterit, kaksitasoisista nykyaikaisiin suihkukoneisiin |
| Meri | sotalaivat luokittain, lentotukialukset, sukellusveneet, veneet, kauppalaivat |
| Aseet | ohjukset, raketit, pommit, torpedot, soihdut ja metallisuikaleet |
| Merkit | savu-, välähdys- ja palokranaatit, asennetut pommit, liput, spawnit, reittipisteet |

## Miten hahmot tehdään {#how-the-figures-are-made}

- **Julkaistuista mitoista tehty.** Useimmat hahmot tekee katselimen oma hahmorakentaja julkisista luvuista: pituus, leveys, korkeus, telapyörät, torni ja tykki, siivet ja pyrstö. Niiden muotoa hienosäädetään julkisten valokuvien, piirustusten ja julkaistujen mittojen mukaan. Mitään pelin malleja ei käytetä.
- **Ilmaiset mallit.** Muutama hahmo käyttää ilmaisia 3D-malleja (CC0 tai CC BY), kun ne ovat todenmukaisempia, joskus yhdistettynä rakennettuun runkoon. CC BY -töiden tekijät mainitaan [Hahmojen tekijänoikeudet](figure-credits.md) -sivulla; CC0-työt eivät vaadi mainintaa, eivätkä ne ole siellä listattuina.
- Jokaisella hahmolla on täysi, karkea ja kaukainen versio (yksityiskohtatasot, LOD), joten tuhansia voi piirtää kerralla.

## Mikä hahmo yksikölle annetaan {#which-figure-a-unit-gets}

Katselin katsoo datan omia sarakkeita:

1. **Nimet** - sarakkeet nimeltä *Name*, *Vehicle*, *Unit*, *Unit type*, *Model*, *Aircraft*, *Plane*, *Tank*, *Ship*, *Craft*, *Loadout*, *Kit* tai *Figure* - verrataan luetteloon: täsmälleen, noin 4 000 aliaksen kautta (useiden pelien yksikkötunnukset), pisimmän tunnetun alun mukaan (`F-16C_50` on F-16C), tai lyhimmän hahmonimen mukaan, joka alkaa samoin.
2. Nimi, jonka hahmo ei sovi yksikön **tyyppiin**, ei käytetä (kuorma-auto nimeltä *Typhoon* ei ole hävittäjä).
3. **Tyypit** - sarakkeet nimeltä *Type*, *Class*, *Kind*, *Category*, *Icon*, *Role* tai *Domain* - antavat luokkahahmon: Tacview-tunnisteet (`Air+FixedWing`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), karttakuvakkeet tai tavallisia sanoja (tank, helicopter, infantry).
4. Data, jossa ei ole kumpaakaan, on ihmisten dataa: jokainen on sotilas.

Helpoin tapa saada oikeat hahmot on siis `vehicle`-sarake oikeilla nimillä tai `type`-sarake Tacview-tunnisteilla.

**Oma yksikköni näkyy laatikkona tai sotilaana.** Lisää `vehicle`-sarake oikealla nimellä tai `type`-sarake Tacview-tunnisteella. Vie hiiri yksikön päälle nähdäksesi, mikä nimi osui. Data, jossa on tällaisia sarakkeita mutta joka ei kerro yksiköstä mitään, jättää sen laatikoksi; data, jossa ei ole kumpaakaan, piirretään sotilaina.

## Asetukset {#settings}

Toiston sivupalkin **Hahmot**-osio asettaa koon, pienimmän koon näytöllä, sen mitä kaukana olevista yksiköistä tulee (hahmo, nuoli, merkki) ja niihin piirretyt tehosteet. Katso [Ottelun toisto](match-replay.md#figures). Savu, palo ja muut ajastetut tehosteet: [Hahmot päällekkäin -näkymän hahmot](figure-replay.md).

## Valinnainen paikallinen hahmopaketti {#an-optional-local-figure-pack}

Voit pitää omalla koneellasi valinnaisen oman hahmopaketin. Sen hahmot korvaavat luettelon hahmot samannimisinä. Se ei ole koskaan osa tietovarastoa eikä julkaistua versiota; ilman sitä mitään ei muutu.
