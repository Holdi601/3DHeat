---
title: "Kertyminen"
parent: "Piirron sisäiset"
nav_order: 2
lang: "fi"
source: "accumulation.md"
source_hash: "047ad9481db3"
translated: true
outdated: false
---

# Kertyminen

Kun katselija ei pysty piirtämään jokaista pistettä yhdessä kuvassa, se piirtää osan niistä, sitten toisen osan, ja laskee kuvat yhteen, kun pysyt paikallaan. Kuva tarkentuu, kuten valokuva kehittyy. Kameran liikuttaminen aloittaa alusta. Tilastopeitteen **Kattavuus**-rivi näyttää, kuinka pitkällä se on.

![Tilastopeite: Kattavuus näyttää prosentin, kun kuva kehittyy, ja *tarkka*, kun se on valmis](../assets/img/en/performance-stats-overlay.webp)

## Kehittäjille {#for-developers}

Kun yksi kuva ei pysty piirtämään jokaista riviä, se piirtää otoksen ja painottaa sen; kuva on silloin harhaton mutta kohinainen arvio. **Kertyminen** yhdistää peräkkäiset kuvat, jotta arvio lähenee tarkkaa vastausta, niin kauan kuin mikään ei muutu. Jokainen kuva valitsee yhden viidestä tilasta ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)); viimeksi käytetty on kohdassa `engine.live.accumMode`.

| Tila | Milloin | Mitä tapahtuu kertyjälle |
|---|---|---|
| **reset** | kamera liikkui, jokin, mikä muuttaa kenttää, muuttui, progressiivinen tarkennus on pois, kasvava ikkuna alkaa (toiston ensimmäinen kuva, hakemisen jälkeen), tai toistettu viivalämpö liikkui | Korvataan tämän kuvan arviolla. |
| **extend** | **Kertyvä**-ikkuna, joka on vain kasvanut edellisestä kuvasta | Tämä kuva piirtää vain juuri näkyviin tulleet rivit täydellä painolla ja lisää ne. Mikään ei häivy. |
| **ema** | liukuva ikkuna (**Ikkuna**, **Elinaika**) liikkui | `acc = acc × (1 - 0,34) + kuva × 0,34` – eksponentiaalinen liukuva keskiarvo noin kolmen kuvan ajalta. |
| **mean** | mikään ei muuttunut eikä arvio ole valmis | `acc = acc × (1 - 1/n) + kuva × 1/n` *n*:nnessä kuvassa: juokseva keskiarvo. |
| **skip** (joutilas) | lähentynyt, eikä mikään ole muuttunut | Mitään ei piirretä; kuva yhdistetään vain uudelleen. |

### Miksi kukin {#why-each}

- **Juokseva keskiarvo, ei summa.** Puskurin skaalaaminen luvulla 1 - 1/n ja uuden kuvan 1/n lisääminen on algebrallisesti sama kuin summaaminen ja jakaminen *n*:llä lopussa, mutta puskuri pitää aina yhden kentän verran. Summa saavuttaisi *n*-kertaisen kentän, ja 16-bittisellä kohteella se kyllästyy arvoon 65 504; kun jakaja kasvaa koko ajan, paikallaan oleva näkymä häipyisi sitä enemmän, mitä kauemmin se seisoo – kun taas liikkuva kamera, joka nollautuu joka kuvassa, näyttää täysin oikealta. Savutestit varmistavat, että 16 yhdistettyä kuvaa pitävät 1,00× sen, mitä yksi kuva pitää.
- **Extend kertyvälle toistolle.** Jo kertyneet rivit ovat yhä näkyvissä, joten kuva tarvitsee vain juuri saapuneen sekunnin murto-osan – mikä mahtuu yhteen kuvaan, joten se menee tarkasti sisään. Uudelleen arvioiminen valaisisi joka kuvassa eri satunnaisen osajoukon ja häivyttäisi sen, mikä näyttäisi purkauksilta, jotka syttyvät ja katoavat, ja pysäytetty kuva täyttyisi yhä lisää. Testit varmistavat, että kokonaismäärä kasvaa monotonisesti toiston aikana ja pysyy 0,02 %:n sisällä 2,5 s:n tauon ajan.
- **Liukuva keskiarvo liukuville ikkunoille.** Ne muuttuvat todella joka kuvassa. Kiinteä sekoituspaino seuraa liukuvaa ikkunaa (kaikkien toiston alusta lähtien olleiden kuvien keskiarvo jäisi toistokohdan jälkeen) ja on paljon hiljaisempi kuin alusta aloittaminen.
- **Reset toistetuille viivoille.** Viivalämmön päät liikkuvat joka kuvassa; liukuva keskiarvo levittäisi jokaisen juovaksi, joten jokainen kuva piirretään kokonaisena, ja hännän häivytys on kuvan oma.
- **Osakuvat kulkevat välipuskurin kautta.** Kuva, joka yhdistetään osan täydestä painosta, piirretään erilliseen kohteeseen nollasta ja sekoitetaan sitten kertyjään, eikä sitä piirretä suoraan 1/n-painolla. Suoraan jokainen sprite lisättäisiin 1/n:nä sen kokonaisuuden koosta, johon se liittyy, ja puolitarkkuuden kohde pyöristäisi sen pois – pahimmin siellä, missä on tiheintä ([Puolitarkkuuskertyminen](half-float-accumulation.md)).

### Lähentyminen {#convergence}

Jokaisen kuvan suunnitelma tietää, kuinka monta ehdokasriviä on ja kuinka monta se lähettää, joten rivien kattamiseen tarvittava kuvamäärä on ⌈ehdokkaat / lähetetyt⌉. Kun niin monta kuvaa on yhdistetty, näkymä on **lähentynyt**: tilastopeitteen *Kattavuus*-rivi muuttuu prosentista *tarkaksi*, ja lisäkuvat ovat joutilaita. Kun **Piirrä jokainen rivi joka kuvassa** on päällä (oletus), yksi kuva kattaa yleensä kaiken, joten lähentyminen on heti, ja etenevää koneistoa tarvitaan vain, kun ikkunassa on enemmän rivejä kuin yksi piirtosuunnitelma kantaa (noin 67 miljoonaa).

### Mikä käynnistää sen uudelleen {#what-restarts-it}

Asetukset jakautuvat kolmeen ryhmään sen mukaan, mitä kertynyt puskuri vielä tarkoittaa niiden muuttamisen jälkeen:

| Ryhmä | Muuttuu | Vaikutus |
|---|---|---|
| **Geometria** – mitkä rivit vaikuttavat ja kuinka paljon | näkymätila; viivalämmön reitit; spriten säde, keski- ja reunavoimakkuus, vaimeneminen, pehmeä liukuma, käyrä, pikselirajat, litistäminen; etäisyysrajaus lähi-, kauko- ja tasorajalla; peittäminen ja piilotus maaston taakse; viipale; kankaan koko; lämmön tarkkuus; ryhmien näkyvyys ja merkit; erotusjako; Kaikki / Toisto; historia; sarakesuodattimet ja Kohteet-valinta; puolitarkkuuden vahvistus | Nollaus. |
| **Ikkuna** – aikaväli | toistokohdan liikkuminen; elinikävara ja häivytys | Laajennus (kumulatiivinen) tai liukuva keskiarvo (liukuva). |
| **Yhdistely** – vain värjäys | kylläisyys, tiheysvaste, vähimmäislämpö, värikaistat; kentän leikkaaminen; ruudukko ja akselit; laatikkotoiston asetukset ja istunto; syvyysterävyys | Piirto uudelleen koskematta lämpöön. |

Kameran liike aina nollaa. Joten kylläisyyden tai kaistan vetäminen on ilmaista; sprite-säteen vetäminen käynnistää lähentymisen uudelleen joka askeleella.
