---
title: "Karttakuvat"
parent: "Kentät ja taustageometria"
nav_order: 1
lang: "fi"
source: "map-images.md"
source_hash: "d56614ef6bd1"
translated: true
outdated: false
---

# Karttakuvat

Karttakuva on tasainen kuva – pienoiskartta, satelliittikuva tai pohjapiirros – joka asetetaan datasi alle, jotta näet, missä lämpö sijaitsee. Kerrot katselijalle, mihin kuva kuuluu, kiinnittämällä kuvassa kaksi pistettä kahteen paikkaan maailmassa (”ankkurit”).

## Lataa ja sijoita karttakuva {#load-and-place-a-map-image}

1. Lataa data ensin ([Datan lataaminen](getting-data-in.md)).
2. Paina osiossa **Tausta / kenttä** painiketta **Karttakuva…** ja valitse kuva. Se venytetään datan alueen päälle.
3. Paina **Sovita datan rajoihin**, jos kuvaa on siirretty. Ankkuri 1 menee kuvan vasempaan yläkulmaan ja ankkuri 2 oikeaan alakulmaan, datan reunoihin.
4. Jos lämpö ei osu kuvan kohdalle, valitse kaksi kaukana toisistaan olevaa maamerkkiä (esimerkiksi rakennuksen kaksi vastakkaista kulmaa tai kaksi risteystä). Lue kunkin pikseli kuvasta ja sen maailmasijainti (vie osoitin [mittaviivaimella](measure.md) lukeaksesi **X** ja **Z**).
5. Kirjoita ne kohtaan **Sijoittelu**: **Ankkuri 1**:lle maamerkin **px**, **py**, **maailma X**, **maailma Z**; sama **Ankkuri 2**:lle.
6. Tarkista: rata tai lämpökohta, jonka tiedät olevan tien päällä, pitäisi nyt olla tuolla tiellä. Säädä lukuja, kunnes näin on.

![Sijoittelu-osio kahdella ankkurilla ja lämpö piirrettynä karttakuvan päälle](../assets/img/en/map-images-placement.webp)

Kahden maamerkin on eroiltava sekä pikselisarakkeissa että pikseliriveissä, muuten paneeli sanoo *Kaksi ankkuria on samalla pikselirivillä tai -sarakkeessa*.

## Lataaminen {#loading}

Mikä tahansa kuvamuoto, jonka selain osaa avata. Kuva, jonka pidempi reuna on yli **8192 px**, pienennetään 8192:een (suurin reuna, jonka GPU:lta pyydetään), ja paneeli sanoo *Pienennetty W×H:sta w×h:een*.

Latauksessa kuva venytetään datan X-Z-rajojen päälle (tai ±1000 yksikköä ilman dataa), pohjoinen ylhäällä, datan alimmalla Y:llä. Oletukset ovat **Peittävyys** 100 %, **Kirkkaus** 0,7, **Poista värikylläisyys** 100 % ja **Käännä pohjoinen/etelä** päällä: värittömänä ja himmennettynä, koska taustan tehtävä on auttaa paikantamaan lämpökohta, ei kilpailla sen kanssa.

## Säätimet {#controls}

| Säädin | Oletus | Alue | Merkitys |
|---|---|---|---|
| **Peittävyys** | 100 % | 0–100 % | |
| **Kirkkaus** | 0,7 | 0–2 (säätörulla 64) | |
| **Poista värikylläisyys** | 100 % | 0–100 % | Harmaa tausta, kylläinen lämpö. Kartan väri kilpailisi datan värin kanssa. |
| **Käännä pohjoinen/etelä** | päällä | | Mikä kuvan rivi on maailman suurin Z. Kun data on ladattu, tämän kääntäminen sovittaa ankkurit uudelleen datan rajoihin. |
| **Sijoittelu**: Ankkuri 1, Ankkuri 2 | kuvan kulmat datan rajoilla | | Kukin ankkuri on pikseli kuvassa – **px** (vasemmalta, 0 leveyteen asti) ja **py** (ylhäältä, 0 korkeuteen asti) – ja maailmakoordinaatti, johon se osuu, **maailma X** ja **maailma Z**. Skaala ja siirtymä seuraavat parista. |
| **Sovita datan rajoihin** | | | Asettaa ankkuri 1:n kuvan vasempaan yläkulmaan ja ankkuri 2:n oikeaan alakulmaan datan X-Z-rajoilla. Lähtökohta tarkkaa sijoittelua varten. Tarvitsee datan. |
| **Korkeus** | datan alin Y | datan min Y − 500 – max Y + 500 (säätörulla max Y + 100 000) | Kartta-tason korkeus. Aseta se juuri datan alapuolelle, ettei mikään jää sen peittämäksi. |

Nimirivi näyttää `leveys×korkeus px · x × z m/px`, eli yhden pikselin maailmakoon kummallakin akselilla.

## Kohtauksessa {#in-the-scene}

Kuva on yksi tekstuuroitu neliö korkeudella. Täydellä peittävyydellä se kirjoittaa syvyyden, joten se osallistuu [peittämiseen](depth-and-culling.md) maana; alle 100 %:n peittävyydellä se sekoittuu eikä kirjoita syvyyttä, joten se ei peitä mitään. [Mittaviivain](measure.md) mittaa sen tasolla. [Kenttäkirjasto](level-library.md) tallentaa kuvakentän ankkureineen.

## Dota 2 -kartta {#dota-2-map}

**Dota 2 -kartta** painikkeen **Karttakuva…** vieressä hakee piirroksen nykyisestä Dota 2 -kartasta, jonka [OpenDota](https://www.opendota.com) näyttää ottelusivuillaan, ja asettaa sen taulukoiden alle, joita [Watcher](https://github.com/Holdi601/3DHeat-Watcher) kirjoittaa Dota 2 -toistoista ([`dotaMap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/tactics/dotaMap.ts)). Kuva haetaan opendota.comista, kun painiketta painetaan, eikä se ole osa 3DHeatia; uusimman päivityksen piirros otetaan OpenDotan omasta luettelosta, ja 7.40-piirros, jos luetteloa ei voi lukea.

| | |
|---|---|
| Lähde | `opendota.com/assets/images/dota2/map/detailed_<patch>.webp`, 900×900 px |
| Sijoittelu | OpenDotan kalibrointi: kuva kattaa Dota-maailmayksiköt −8192–8064 molemmilla akseleilla (128 yksikön ruudut 64–191), pohjoinen ylhäällä. Toistotaulukon akseleilla (Z ylös, Y käännetty) se on maailma X −8192–8064 ja maailma Z −8064–8192. Noin 18 yksikköä pikseli. |
| Korkeus | 0. Sankarit seisovat 0:sta noin 600:aan. |
| Ulkoasu | Kirkkaus 0,8, värikylläisyyden poisto 50 %. |

Tarkistettu julkisen ottelun toistosta patchilla 7.40: jokaisen sankarin rata seuraa piirrettyjä kaistoja, ja toiston sijoittamat tornit, kasarmit ja ancientit osuvat piirrettyihin tukikohtiin. Näkymä **Ylhäältä** näyttää kartan niin, että pohjoinen on näytön alareunassa, kuten se näyttää kaikki Z ylös -taulukot, joissa Y on käännetty.

Piirros on OpenDotan, Valven kartasta; Valve ei hyväksy 3DHeatia. Dotan 3D-kartta vaatii pelin asennettuna: katso Watcherin muistiinpanot Dota 2 -toistoista.

## Kehittäjille {#for-developers}

### Miten ankkurit sijoittavat kuvan {#how-the-anchors-place-the-image}

[`mapQuadFromAnchors`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts) ankkureilla *a* ja *b*:

```
scaleX = (b.worldX - a.worldX) / (b.px - a.px)
scaleZ = (b.worldZ - a.worldZ) / (b.py - a.py)
pikseli (0, 0) on kohdassa  (a.worldX - a.px × scaleX,  a.worldZ - a.py × scaleZ)
```

Kaksi ankkuria kiinnittää skaalan ja siirtymän kummallakin akselilla erikseen, joten kuvaa voi venyttää eri tavoin X- ja Z-suunnassa mutta ei kiertää. Ankkureiden on eroiltava **molemmissa** pikselikoordinaateissa; kun ne jakavat rivin tai sarakkeen, skaalaa ei voi johtaa, karttaa ei piirretä, ja paneeli sanoo *Kaksi ankkuria on samalla pikselirivillä tai -sarakkeessa*.
