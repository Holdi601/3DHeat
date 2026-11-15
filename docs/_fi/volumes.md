---
title: "Tilavuudet ja vertailu"
parent: "Suodattimet ja työkalut"
nav_order: 6
lang: "fi"
source: "volumes.md"
source_hash: "25cc132dbe25"
translated: true
outdated: false
---

# Tilavuudet ja vertailu

**Tilavuus** on näkymätön laatikko (tai sylinteri tai pallo), jonka piirrät paikan ympärille kysyäksesi: mitä tässä tapahtui? Sitä voi käyttää tappojen laskemiseen sillalla, kahden mäen vertailuun tai pelkän toiminnan näyttämiseen yhdellä alueella.

```
 top view                 You draw a shape ->  the viewer counts
 +------------+           what is inside:
 |   ( A )    |            rows, players, kills, time ...
 |        [B] |           Compare A with B, side by side.
 +------------+
```

![Kolme tilavuutta esimerkkilaaksossa: kaksi sylinteriä mäkien ympärillä, laatikko kylän ympärillä](../assets/img/en/volumes.webp)

Tilavuudet mittaavat, mitä niiden sisällä tapahtuu, rajaavat näkymän niihin, vievät niiden rivit ja voivat vertailla niitä rinnakkain. Katso myös [sanasto](glossary.md) termeille rivi, henkilö ja ottelu.

## Piirrä tilavuus {#draw-a-volume}

1. Avaa **Tilavuudet** sivupalkista.
2. Valitse työkalu ja piirrä 3D-näkymään tai 2D-karttaan. Lattia ja katto alkavat datan pohjasta. Esc peruuttaa.
3. Napsauta tilavuutta valitaksesi sen; sen **Tilastot** tulevat näkyviin.

| Työkalu | Miten piirtää |
|---|---|
| **Laatikko** | Vedä suorakulmio (Shift: neliö). Napsautus asettaa oletuslaatikon. |
| **n-kulmio** | Vedä keskustasta (Shift pitää sen säännöllisenä). *Kulmat* asettaa n:n väliltä 3-64 (oletus 8, joten painike näyttää **8-kulmio**). |
| **Monikulmio** | Napsauta kulmia; sulje kaksoisnapsautuksella, Enterillä tai napsauttamalla ensimmäistä kulmaa. Askelpalautin poistaa viimeisen kulman. |
| **Sylinteri** | Vedä säde. |
| **Pallo** | Vedä säde; se lepää maassa. |

## Muokkaa {#edit}

- Napsauta tilavuutta valitaksesi sen. Vedä sen runkoa siirtääksesi, kulmia muotoillaksesi uudelleen (Shift kulmassa skaalaa).
- **Keltaiset** kahvat asettavat lattian ja katon, **syaani** kahva kääntää sitä.
- Alt+vetäminen kopioi, Del poistaa, Ctrl+Z / Ctrl+Y kumoavat ja tekevät uudelleen, Ctrl+D monistaa. **Poista kaikki** poistaa jokaisen tilavuuden.
- Tarkat arvot: Lattia, Katto, Kääntö / Kallistus / Kierto (laatikot), Säde (pallot, sylinterit).

Jokaisella tilavuusrivillä on näytä-valintaruutu, väri, nimi, **sisällytä** tai **sulje pois**, monistus ja poisto. Tilavuudet tallentuvat selaimeen kullekin aineistolle, ja **Tallenna...** / **Lataa...** kirjoittavat ja lukevat tiedoston `volumes.json`.

## Suodata näkymä {#filter-the-view}

| Suodatin | Vaikutus |
|---|---|
| **Näytä kaikki** (oletus) | Tilavuudet vain mittaavat. |
| **Vain sisällä** | Lämpö, toisto ja [osumaanalyysi](hit-analysis.md) piirtävät vain sisällytettyjen tilavuuksien sisäpuolella olevan ja suljettujen ulkopuolella olevan. |
| **Piilota sisäpuoli** | Päinvastoin. |

GPU-suodatin ottaa enintään 8 tilavuutta ja yhteensä 64 reunapistettä; "!" merkitsee tilavuutta, joka ylittää rajan. Tilastot ja vienti lasketaan sen silti mukaan.

## Tilastot {#statistics}

**Tilastot**-alue seuraa suodattimia, aikaväliä ja piilotettuja ryhmiä. *Valittu* näyttää valitun tilavuuden, *Vertaa kaikkia* asettaa jokaisen tilavuuden rinnakkain. Se näyttää:

- **Rivejä sisällä (näkyvät)** ja **Rivejä sisällä (kaikki data)**, **Pelaajat**, **Joukkueet**, **Ottelut**, **Aika sisällä**, **Sisään- / ulostulot**, **Huippulämpö**, **Keskilämpö**, **Tilavuus / jalanjälki** ja **Milloin** -histogrammin;
- kullekin sarakkeelle: luokat, joilla on **Lift** (osuus sisällä jaettuna osuudella kaikessa näytetyssä datassa), ja luvut väleineen, mediaaneineen ja 5.-95. prosenttipisteineen.

**Tilastot CSV- / JSON-muodossa** tallentaa ne. **Vie sisällä oleva data** kirjoittaa sisällä olevat rivit CSV- tai Parquet-muodossa (*Vain näkyvät rivit* oletuksena päällä), yhden tilavuuden tai kaikki, sarakkeella, joka kertoo, mikä tilavuus kullakin rivillä on.

## Vertaile tilavuuksia {#compare-volumes}

Kun kaksi tai useampi tilavuus on näkyvissä, paina **Vertaile...**.

1. Piirrä kolme tilavuutta, esimerkiksi Länsimäki, Itämäki ja Kylä.
2. Paina **Vertaile...** kohdassa Tilastot.
3. Lue **Taulukko**-näkymässä kunkin arvon ero ensimmäiseen tilavuuteen.
4. Vaihda **Palkit**-näkymään nähdäksesi osuudet palkkeina.

![Vertailu-taulukko: rivit, aika sisällä, pelaajat ja muuta kullekin tilavuudelle, sekä ero ensimmäiseen](../assets/img/en/compare.webp)

| Näkymä | Näyttää |
|---|---|
| **Taulukko** | Rivit, aika sisällä, pelaajat, ottelut, joukkueet, sisäänmenot, ulosmenot, käynnit, käyntien pituus, tappot, kuolemat, tappoja per kuolema, tappoja minuutissa, aika per pelaaja, arvosarakkeet; ryhmiteltynä tapahtumien, ajoneuvoluokan, pelaajan tai tekoälyn, joukkueen ja suunnan mukaan. Jokainen arvo näyttää eronsa ensimmäiseen tilavuuteen ja vaikutuksen koon (merkityksetön, pieni, keskisuuri, suuri). Napsauta tilavuuden otsikkoa lajitellaksesi etäisyyden mukaan ensimmäisestä. |
| **Palkit** | Määrät tai osuudet tapahtuman, luokan, toimijan, joukkueen tai suunnan mukaan. Napsauta palkkia suodattaaksesi näkymän siihen. |
| **Ottelun aikana** | Yksi kaavio tilavuutta kohden ottelun minuuteilla: läsnäolo, rivit tai tappot. Napsauta hypätäksesi sinne. |
| **Käynnit** | Laatikko- ja viulukaaviot siitä, kuinka kauan käynnit kestivät (logaritminen asteikko). |
| **Virta** | Minne liikkeet menevät poistuttuaan kustakin tilavuudesta: siirtymämatriisi tai virtanauhat. |

![Palkit-näkymä: tapahtumatyypit tilavuuksittain osuuksina](../assets/img/en/compare-bars.webp)

## Vinkit {#tips}

- Aloita havainnosta: [Havainnoissa](insights.md) **Tilavuus tähän** lisää sylinterin havainnon paikan ympärille.
- **Erittely...** avaa [Erittelyn](breakdown.md) valitulle tilavuudelle: kuka ja mikä menestyy sen sisällä parhaiten.
- [Suuntalämpö](directional-heat.md) voi piirtää sisällä olevat suunnat valitussa tilavuudessa.
- [Ajoneuvot-välilehti](hit-analysis.md#restrict-to-an-area) käyttää samoja tilavuuksia alueen suodattimenaan.
