---
title: "Kentän ulkoasu"
parent: "Kentät ja taustageometria"
nav_order: 3
lang: "fi"
source: "level-appearance.md"
source_hash: "c883749baedd"
translated: true
outdated: false
---

# Kentän ulkoasu

Nämä säätimet muuttavat sitä, miltä 3D-kenttä näyttää, jotta lämpö erottuu siitä ja paikan voi silti lukea. Mikään tässä ei muuta dataa.

## Pikaohje {#quick-start}

1. Lataa 3D-kenttä ([3D-kentät](model-levels.md)).
2. Osiossa **Tausta / kenttä** laske **Kirkkaus**, kunnes lämpö on kuvan kirkkain asia.
3. Avaa **Maaston kohokuvio** ja nosta **Rinnevarjostus** tai **Korkeuskäyrien voimakkuus**, kunnes erotat mäen tasangosta.
4. Avaa **Rakenteet**. Laske **Pintojen peittävyys**, jos haluat nähdä rakennusten sisään, tai kytke **Rakenteiden tekstuuri** päälle, jos haluat nähdä ne kiinteinä.
5. Jos maahan on maalattu kuva, kokeile **Maan tekstuuri** pois ja päälle.

![Maaston kohokuvio- ja Rakenteet-osiot auki, kenttä näkyy kohokuvion vihjeillä](../assets/img/en/level-appearance-sections.webp)

Kun [3D-kenttä](model-levels.md) on ladattu, paneeli Tausta / kenttä näyttää nämä säätimet. Oletukset ovat ne, jotka tuoreesti tuodulle kentälle annetaan ([`modelLevelFrom`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/LevelPanel.tsx), [`level.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts)). Niiden muuttaminen piirtää vain kohtauksen uudelleen; lämpökertymä säilyy.

## Koko kenttä {#the-whole-level}

| Säädin | Oletus | Alue | Merkitys |
|---|---|---|---|
| **Peittävyys** | 100 % | 0–100 % | Alle 100 %:ssa kenttä sekoittuu ja ei kirjoita syvyyttä, joten se ei enää [peitä](depth-and-culling.md) lämpöä. |
| **Kirkkaus** | 0,9 | 0–2 (säätörulla 64) | |

Kenttä piirretään värittömänä – harmaa maa, sävytetty kuori – jotta lämpö on ainoa kylläinen asia ruudulla. Toisin kuin [karttakuvassa](map-images.md), 3D-kentässä ei ole Värittömyys-liukusäätimeä.

## Maaston kohokuvio {#ground-relief}

Kaukaa mäki ja tasanko näyttävät samalta harmaalta, joten katselija lisää kolme vihjettä. Jokainen vastaa eri ongelmaan:

| Säädin | Oletus | Merkitys |
|---|---|---|
| **Korkeuskäyrien väli** | maan korkeusvälistä | Korkeus korkeuskäyrien välillä, logaritmisesti 1/4000:sta 1/2:een kentän korkeusvälistä; radan alin kohta on *pois*. Oletus on 1/40 maan korkeusvälistä pyöristettynä 1/2/5-askeleeseen – 10 metrin välit sopivat rinteeseen ja ovat hyödyttömät louhoksen pohjalla. Joka viides viiva piirretään vahvempana. Korkeuskäyrät piirretään näyttötilassa, joten ne ovat leveydeltään yhden pikselin millä tahansa zoomauksella, ja ne ovat ainoa vihje maalle, joka on liian loiva varjostettavaksi lainkaan. |
| **Korkeuskäyrien voimakkuus** | 35 % | 0–100 % |
| **Rinnevarjostus** | 55 % | Tummentaa jyrkkyyden mukaan, joten penkat ja kalliot erottuvat mistä tahansa kulmasta – toisin kuin valo, joka latistuu aina, kun katsot sitä kohti. |
| **Korkeusliukuma** | 50 % | Matala maa tummempi, korkea maa vaaleampi, maan korkeusvälin yli: suuren mittakaavan muoto. |

Osion otsikko näyttää korkeuskäyräntilan: *joka N m*, korkeuskäyrien väli, tai *ei korkeuskäyriä*, kun väli on pois.

## Maan pinta {#ground-surface}

| Säädin | Oletus | Näkyy kun | Merkitys |
|---|---|---|---|
| **Vesi** | päällä | kentässä on vettä | Järvet, joet ja meri, piirretty tasaisina vaaleanharmaansinisinä: mikään maaston vihje ei koske pintaa, joka on tasainen määritelmällisesti. |
| **Veden peittävyys** | 60 % | Vesi on päällä | Rantaviiva ja matalikon pohja näkyvät läpikuultavan veden läpi. |
| **Maan kolmiot** | 30 % (0 tekstuuroidulle kentälle) | aina | Maaston omat reunat piirrettynä varjostetun pinnan päälle; ne häipyvät 6–25 %:n välillä kentän leveydestä kamerasta. Näyttää, kuinka karkeasti maa on näytteistetty, ja antaa rinteelle jotain, mistä etäisyyttä arvioida. Rakennetaan ensimmäisellä käyttökerralla, mikä vie hetken suuressa kentässä. |
| **Maa pelkkänä rautalankana** | pois | aina | Korvaa maanpinnan sen reunoilla. Se on täysin kaavamainen – se luopuu myös varjostuksesta, korkeuskäyristä ja peittämisestä, joten *Maan kolmiot* on yleensä parempi valinta. |
| **Maan tekstuuri** | päällä | kentässä on tekstuureja | Piirtää maan tiedoston mukana tulevilla tekstuureilla (asfaltti, reunus, nurmi). Verkon valaistus lisätään päälle lievästi, koska tekstuurissa on jo oma hieno kohokuvionsa. **Kirkkaus** on keino vaimentaa sitä lämmön alla; Värittömyys kuuluu karttakuviin. |
| **Tallennettu väri** | pois | kentässä on kärkivärit | Varjostaa maan skannauksen tallentamalla värillä harmaan sijaan – rekonstruoitu tie ei muuten erottuisi reunuksesta. Moottorivienneillä ei ole värejä; kun niitä ei ole, paneeli kertoo *Tässä kentässä ei ole väriä.* |

## Rakenteet {#structures}

**Rakenteet**-otsikko näyttää rakenteiden kolmioiden määrän; alla oleva vihje kertoo, miten ne piirretään (*piirretään kiinteinä omilla tekstuureillaan* tai *piirretään läpikuultavana kuorena, jotta näet lämmön niiden sisällä*) ja kuinka monta osaa on rakenteita.

| Säädin | Oletus | Merkitys |
|---|---|---|
| **Rakenteiden tekstuuri** | päällä, kun rakenteissa on tekstuurit | Piirtää rakenteet kiinteinä omilla tekstuureillaan. Kytkettäessä päälle pintojen peittävyys asetetaan 100 %:iin ja reunat sammutetaan; kytkettäessä pois palataan sävytettyyn läpinäkyvään kuoreen 25 %:ssa. Tekstuuroitu rakenne valaistaan kameran näkemältä puolelta, koska kyltti on kaksi pintaa selkä selkää vasten ja se, kumpi voittaa syvyystestin, riippuu pyöristyksestä. |
| **Rautalankareunat** | päällä; pois yli 300 000 rakenteen kolmion tai tekstuurien kohdalla | Rakenteiden päällekkäisyydet poistettu reunat, yksi viiva reunaa kohden. |
| **Reunojen peittävyys** | 50 % | |
| **Kuoren pinnat** | päällä | Himmeä pinta kirkkaalla Fresnel-reunalla, jotta rakennus näyttää tilavuudelta eikä häkiltä tai sumupankilta. |
| **Pintojen peittävyys** | 25 % (35 % yli 300 000 rakenteen kolmion, 100 % tekstuuroidulle) | 0–60 % radalla, jopa 100 % kahvalla. Pidä se matalana: kiinteät rakenteet piilottavat niiden sisällä olevan datan. |
| **Terävät reunat** | päällä (pois, kun tekstuuroitu) | Varjostaa jokaisen kolmion sen omalla normaalilla, joka lasketaan fragmenttivarjostimessa näyttötilan derivaatoista. Viedyt kentät ovat hitsattuja ja kantavat keskiarvoistettuja normaaleja, jotka pyöristävät jokaisen laatikon kulman "sulaneeksi folioksi"; jokaisen vertexin jakaminen korjaisi sen, mutta kertoisi vertex-puskurin. Kytke pois kentälle, jonka kaarevat pinnat ovat tärkeämpiä kuin sen kulmat. |
| **Rakenteiden sävy** | Syaani | Värinvalitsin ja esiasetukset **Syaani**, **Meripihka**, **Violetti**, **Valkoinen**. |
| **Näytä osien luokitus (N)** | | Jokainen osa, sen luokka ja syy; katso [3D-kentät](model-levels.md#ground-structures-and-water). |

## Kentän leikkaaminen {#cutting-the-level}

[Viipale](slice.md) ja – kun *Leikkaa myös kenttä* on päällä – [etäisyysrajaus](depth-and-culling.md#distance-culling) leikkaavat maan, rakenteet ja veden samoilla tasoilla kuin lämmön.
