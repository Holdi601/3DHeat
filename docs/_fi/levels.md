---
title: "Kentät ja taustageometria"
nav_order: 16
has_children: true
lang: "fi"
source: "levels.md"
source_hash: "74400d9e7af4"
translated: true
outdated: false
---

# Kentät ja taustageometria

Kenttä on 3D-paikka, jossa peli tapahtui: kartta, kaupunki tai rata. Kun laitat sen datasi taakse, näet, *missä* lämpö on. **Tausta / kenttä** -paneeli (katso [sanasto](glossary.md) termille "kenttä") antaa kolmenlaista taustaa:

- **karttakuva**, joka on sidottu maantieteellisesti kahdella ankkurilla - katso [Karttakuvat](map-images.md);
- **3D-kenttä** - `.glb`, `.gltf`, `.obj`, `.stl` tai `.ply` - jaettuna maahan, rakenteisiin ja veteen sekä yksinkertaistettuna tuonnin yhteydessä - katso [3D-kentät](model-levels.md) ja [Kentän ulkoasu](level-appearance.md);
- **maailmatausta** - tallenteelle, joka kertoo, missä maapallolla se on (Tacview ACMI -tiedosto): todellinen maasto, tiet, vesi, lentokentät ja rakennukset avoimesta datasta ladattuna - katso [Maailmatausta](world-backdrop.md).

Kun mitään ei ole ladattu, kohtaus on tumma, ja siinä on ruudukko ja värilliset akselit (**Ruudukko** ja **Akselit** kohdassa [Kamera ja näkymä](camera.md)). Paneeli sanoo: *Ei mitään ladattuna - kohtauksessa on ruudukko ja akselit. Lisää karttakuva tai kenttämalli antaaksesi lämmölle taustan.*

Kenttä on yhteinen kaikille kolmelle välilehdelle: Kisa-analyysissä ladattu rata on sama kenttä, jonka lämpökartta näyttää.

![Tausta / kenttä -paneeli, jossa kenttä on ladattu: painikkeet Karttakuva ja 3D-malli, Sotanäyttämö, Peittävyys, Kirkkaus, Tallenna kirjastoon ja Kirjasto-luettelo](../assets/img/en/level-panel.webp)

## Aseta kenttä datasi taakse {#put-a-level-behind-your-data}

1. Lataa ensin data ([Datan lataaminen](getting-data-in.md)), jotta kenttä sovitetaan siihen.
2. Avaa **Tausta / kenttä** sivupalkista.
3. Paina **Karttakuva…** kuvalle tai **3D-malli…** 3D-kentälle ja valitse tiedosto. Todellisen maailman tallenteelle käytä sen sijaan **Todellinen maailma taustana** tai **Sotanäyttämö**.
4. Odota, että edistymisrivi valmistuu. Iso malli yksinkertaistetaan ensin (katso alla **Yksinkertaistuksen tavoite**).
5. Paina näkymässä **F** kehystääksesi kaiken. Käytä **Peittävyyttä** ja **Kirkkautta**, kunnes lämpö erottuu kentästä.
6. Paina **Tallenna kirjastoon**, jos käytät kenttää uudelleen ([Kenttäkirjasto](level-library.md)).

## Mitä kenttä tekee lämmölle {#what-a-level-does-for-the-heat}

- Se **peittää**: sen takana olevat datapisteet himmennetään pinnoittain, ja maaston takana olevat datapisteet piilotetaan ([Syvyys ja piilotus](depth-and-culling.md)). Ilman kenttää peittoa ei ole.
- [Viipale](slice.md) ja, kun *Leikkaa myös kenttä* on päällä, [etäisyysrajaus](depth-and-culling.md#distance-culling) leikkaavat sen yhdessä lämmön kanssa.
- Se on ainoa asia, jota [syväterävyys](camera.md#depth-of-field) sumentaa ruudukon ja laatikoiden lisäksi.
- 3D-kenttä **leventää kameran kaukotasoa**, kun se on suurempi kuin data: lähi- ja kaukotaso kalibroidaan datasta, ja kilometrien levyinen viety kartta jäisi muuten kokonaan kaukotason taakse ja jättäisi tyhjän näkymän. Kaukotaso muuttuu 3 × kentän vaakasuuntaiseksi laajuudeksi, kun se on suurempi, lähitaso siirtyy sen mukana (vähintään kauko / 100 000), jotta peittämisen tarvitsema syvyystarkkuus säilyy, ja lentonopeus nousee vähintään laajuus / 12. Sitä vain levennetään, ei koskaan kavenneta.

## Paneeli ylhäältä alas {#the-panel-top-to-bottom}

| Osa | Tiedot |
|---|---|
| **Karttakuva…**, **3D-malli…** | Lataa yksi; se korvaa nykyisen kentän. |
| **Todellinen maailma taustana**, **Unohda karttaruudut** | Vain datalle, jolla on maantieteellinen viite: rakentaa sen alla olevan todellisen paikan kentäksi tai poistaa ladatut ruudut. [Maailmatausta](world-backdrop.md) |
| **Yksinkertaistuksen tavoite** | Kolmiobudjetti seuraavalle mallituonnille: *Täysi - ei yksinkertaistusta* (oletus), *Korkea - 8 M*, *Keskitaso - 3 M*, *Matala - 800 k*, *Siluetti - 100 k*. [3D-kentät](model-levels.md#simplification) |
| Edistyminen ja **Peruuta** | Dekoodauksen tai tuonnin aikana. |
| Tuontihuomautus | Kolmiot ennen ja jälkeen, maan / rakenteiden / veden jako, käytetty yksityiskohtataso. |
| Nimi ja koko | `leveys×korkeus px · x × z m/px` kuvalle, `N kolmiota (M:stä)` mallille. |
| **Peittävyys**, **Kirkkaus** | Molemmat tyypit. |
| Kuvan säätimet | **Poista värikylläisyys**, **Käännä pohjoinen/etelä**, **Sijoittelu** (kaksi ankkuria), **Sovita datan rajoihin**, **Korkeus**. [Karttakuvat](map-images.md) |
| Mallin säätimet | Maan korkeuserot, vesi, maakolmiot, lankamalli, tekstuuri, talteen otettu väri, rakenteet, osien luokittelu. [Kentän ulkoasu](level-appearance.md) |
| **Tallenna kirjastoon**, **Poista** | [Kenttäkirjasto](level-library.md); Poista vapauttaa kentän. |
| **Kirjasto** | Tässä selaimessa tallennetut kentät. [Kenttäkirjasto](level-library.md) |

## Tämän osion sivut {#pages-in-this-section}

- [Karttakuvat](map-images.md)
- [3D-kentät](model-levels.md) - muodot, osat, luokittelu, yksinkertaistus, tekstuurit
- [Kentän ulkoasu](level-appearance.md) - jokainen säädin 3D-kentälle
- [Kenttäkirjasto](level-library.md)
- [Maailmatausta](world-backdrop.md) - todellinen maailma tallenteen alla, avoimesta datasta

Kenttien saaminen pelistä ja moottoreista on erillisten vientityökalujen asia (katso tietovaraston [README](https://github.com/Holdi601/3DHeat/blob/main/README.md)); sopimus, johon ne kirjoittavat, on tiivistetty kohtaan [3D-kentät](model-levels.md#the-exporter-contract).
