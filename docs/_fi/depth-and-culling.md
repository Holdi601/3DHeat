---
title: "Syvyys ja piilotus"
parent: "Lämmön tilat"
nav_order: 4
lang: "fi"
source: "depth-and-culling.md"
source_hash: "436ac15a9b3d"
translated: true
outdated: false
---

# Syvyys ja etäisyysrajaus

Syvyys saa kukkulat ja seinät piilottamaan lämmön niiden taakse, samalla tavalla kuin oikea seinä piilottaa ihmisen. Etäisyysrajaus pitää vain ne lämpöarvot, jotka ovat kameran lähi- ja kaukorajan välissä.

![Matala kamera kukkulan takana, Piilota maaston taakse pois (vasemmalla) ja päällä (oikealla)](../assets/img/en/depth-and-culling-terrain.webp)

![Etäisyysrajaus, jossa Kaukoraja on 400 m ja Leikkaa myös kenttä päällä: viipale karttaa kameran ympärillä](../assets/img/en/depth-and-culling-far.webp)

Ilman syvyyttä lämpökartta 3D-[kentän](levels.md) päällä on tasainen peite: kaikki, mitä aineistossa on, hohtaa jokaisen seinän läpi täydellä voimalla, kenttä antamat syvyysvihjeet kumoutuvat, ja rakennuksen sisällä oleva kuuma kohta näyttää samalta kuin sen katolla oleva. **Syvyys**-osio saa kentän piilottamaan sen, mikä on sen takana; **Etäisyysrajaus** rajaa lämmön kuoreen tai levyyn kameran ympärillä; [Viipale](slice.md) leikkaa levyn maailmasta. Kaikki kolme koskevat lämpötiloja ja muuttavat sitä, mitkä rivit vaikuttavat, joten niiden muuttaminen käynnistää kertymisen uudelleen.

## Syvyys {#depth}

Molemmat säätimet tarvitsevat [kentän](levels.md) – kartan kuvan tai 3D-mallin. Kun kenttää ei ole ladattu, mitään ei ole niiden takana, eikä ne tee mitään. Molemmat ovat pois päältä, kun [Litistä maatasolle](sprite-shape.md#flatten-onto-ground-plane) on päällä.

### Piilota maaston taakse {#hide-behind-terrain}

**Piilota maaston taakse** (oletuksena päällä): datapiste, jonka lähin pinta kameraan päin on *maasto* (ei rakenne), pudotetaan kokonaan pois, ei vain himmennetä.

Maasto ja seinät ovat läpinäkymättömiä eri tavoin. Katsot seinän *läpi* tarkoituksella, nähdäksesi, millä kerroksella liikenne kulki; et koskaan halua katsoa kukkulan läpi, sillä sen takana on kartan kaukainen puoli – ja kartalla, joka on kilometrejä leveä, siellä on suurin osa datasta. Sen summautuminen horisonttiin antaisi kirkkaamman nauhan kuin mikään etualalla. Yksi himmennin ei voi palvella molempia, joten maastolle on raja ja seinät saavat himmentimen alla.

### Geometrian taakse piilotettu {#hidden-behind-geometry}

**Geometrian taakse piilotettu** (oletuksena 0,8): kuinka voimakkaasti kentän geometrian takana oleva datapiste vaimennetaan. Arvo tarkoittaa *näkyy läpi* kohdassa 0, *N % himmeämpi* siinä välissä (liukusäätimen asento, ei mitattu himmennys) ja *piilotettu kokonaan* kohdassa 1.

Jokainen seinä tai lattia pisteen ja kameran välillä himmentää sitä lisää: yksi seinä jättää oletuksella muutaman prosentin, ja jokainen lisäpinta puolittaa jäljelle jääneen, enintään neljään pintaan asti. Arvossa 1 mitään geometrian takana ei piirretä, ja se on halvin asetus.

Katso myös [Kentän ulkoasu](level-appearance.md).

## Etäisyysrajaus {#distance-culling}

**Etäisyysrajaus** (oletuksena suljettu) rajaa lämmön riveihin, jotka ovat kameran lähi- ja kaukorajan välissä. Aseta kaukoraja, jos haluat lukea tiheyttä rakennuksen sisältä ilman, että kartan kaukainen puoli summautuu sen päälle; aseta lähiraja, jos haluat lentää kuuman kohdan *läpi* sen sijaan, että lentäisit sen sisään.

| Säädin | Oletus | Alue (säätörulla) | Merkitys |
|---|---|---|---|
| **Lähiraja** | pois | 0,5–5000 m, logaritminen; radan alin 5 % = pois (200 000) | Tätä lähempänä olevat rivit ohitetaan. |
| **Kaukoraja** | pois | 1–200 000 m, logaritminen; alin = pois (10 000 000) | Tätä kauempana olevat rivit ohitetaan. |
| **Leikkaa tasolla** | päällä | | Mittaa rajat katseluakselilta silmästä mitatun sijaan, joten leikkaus on tasoa, joka on näyttöä vastaan yhdensuuntainen, eikä palloa sinun ympärilläsi. Pallon reuna kaartuu pois kuvan poikki ja liukuu aina, kun käännyt; taso pysyy siinä, mihin asetat sen. |
| **Leikkaa myös kenttä** | päällä | | Leikkaa maa, rakenteet ja vesi samoilla rajoilla. Kun kenttä jätetään ehjäksi, leikkaus poistaa datapisteet ja jättää rakennuksen seisomaan niiden edessä; kun molemmat leikataan, tuloksena on leikkaus kartan läpi ja pisteet ovat niitä seiniä ja lattioita vasten, joille ne kuuluvat. Tämä vain piirtää uudelleen; se ei käynnistä kertymistä uudelleen. |

### Näppäimistö {#keyboard}

Kaukoraja on säädin, jota pyyhkäiset – kävele sen läpi rakennuksen ja katso, millä kerroksella liikenne näkyy – joten se on näppäimistössä, kun lennät ([`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx)):

| Näppäin | Vaikutus |
|---|---|
| `]` | Työntää kaukorajaa ulospäin kertoimella 1,12 (Shift: 1,35) |
| `[` | Vetää sitä sisäänpäin samalla kertoimella |
| `\` | Kytkee kaukorajan pois tai takaisin päälle siinä etäisyydessä, johon se jäi (ensimmäisellä kerralla 6000) |

Askeleet ovat geometrisiä, koska hyödyllinen alue kattaa neljä kertaluokkaa huoneesta karttaan. Näppäimistö pitää kaukorajan välillä 100 ja 400 000. Näppäimet eivät tee mitään, kun tekstikenttä tai valikko on valittuna.

## Kehittäjille {#for-developers}

### Piilota maaston taakse {#hide-behind-terrain}

Rakenteet piirretään omaan syvyystekstuuriinsa. Fragmentti, joka on näkymän syvyyden takana mutta *ei* rakenteiden syvyyden takana, on maaston takana, ja se hylätään. Se maksaa yhden syvyyskierroksen rakenteiden yli, ja se ohitetaan, kun kytkin on pois.

### Geometrian taakse piilotettu {#hidden-behind-geometry}

Se lasketaan **pinnoittain**. Yksi syvyysvertailu voi vain sanoa "jotain on edessä", joten piste yhden seinän takana ja piste neljän huoneen päässä rakennuksen sisällä himmenisivät samalla tavalla, ja sisusta näyttäisi yhdeltä heikolta sutulta. Sen sijaan rakennegeometria **kuoritaan syvyyden mukaan** enintään 3 lisäkerrokseen ([`HEAT_DEPTH_LAYERS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)). Jokainen fragmentti laskee, kuinka monta pintaa on sen edessä (kentän oma syvyys plus kuoritut kerrokset, enintään neljä), ja himmennys kertautuu:

```
voimakkuus    = 1 - (1 - liukusäädin)²             (liukusäädin 1 → 1)
näkyvyys      = (1 - voimakkuus) × 0,5 ^ (pintoja - 1)
näkyvyys      = max(näkyvyys, 0,006)               (ei lattiaa liukusäätimellä 1)
```

| Liukusäädin | 1 pinta | 2 | 3 | 4 |
|---|---|---|---|---|
| 0,5 | 25 % | 12,5 % | 6,25 % | 3,1 % |
| 0,8 (oletus) | 4 % | 2 % | 1 % | 0,6 % (lattia) |
| 1,0 | ei piirretä | ei piirretä | ei piirretä | ei piirretä |

Miksi kaksi kerrointa: liukusäädin on kalibroitu niin, että yksi seinä jättää muutaman prosentin – ulkoasu, joka kertoo "jonkin takana" – ja muutaman prosentin kertautuminen ei jäisi mihinkään kolmannen seinän kohdalla; puolittaminen jokaisen lisäpinnan kohdalla säilyttää neljä erotettavissa olevaa askelta. Miksi neliö: lineaarinen jätti kyllästyneen kentän kyllästyneeksi seinän takana; neljäs potenssi pyyhki sen pois arvossa 0,8. Miksi lattia: piilottaa peitetyn lämmön kokonaan saa huoneen täynnä piilotettua liikennettä näyttämään tyhjältä huoneelta, eikä mikään ehdota [Viipaleen](slice.md) käyttöä. Vain liukusäädin kiinni arvossa 1 piilottaa sen kokonaan – ja se on halvin asetus, koska peitetyt pisteet hylätään silloin.

Miten ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts), pistelämmön varjostimet): vertailu tehdään fragmentti kerrallaan, kentän syvyystekstuuria vastaan, **ikkunasyvyydessä** eikä maailman etäisyydessä. Vertex-vaiheen syvyystekstuurin haku lukee joillakin ajureilla kaikki "kaukana" (ANGLEN ohjelmistorasterointi mukaan lukien), ja molempien syvyyksien muuttaminen metreiksi menettää erottelun tarkkuuteen laajalla lähi- ja kaukorajalla. Poikkeama on yksi sprite-säde muunnettuna ikkunayksiköiksi plus muutama vähiten merkitsevä bitti, joten pinnalla lepäävä datapiste ei varjosta itseään.

Rakenteet piirretään läpikuultavina, mutta ne piirretään siihen syvyyteen, jonka peittäminen lukee; kenttä, jonka rakenteet eivät ulottuneet syvyystekstuuriin, peittäisi vain maastoa vasten.

### Etäisyysrajaus {#distance-culling}

Molemmat rajat arvioidaan vertex-varjostimessa, joten rajattu rivi maksaa yhden vertexin eikä yhtään fragmenttia.
