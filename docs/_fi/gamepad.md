---
title: "Peliohjain ja HOTAS"
parent: "Kamera ja ohjaimet"
nav_order: 1
lang: "fi"
source: "gamepad.md"
source_hash: "836636b9c7af"
translated: true
outdated: false
---

# Peliohjain ja HOTAS

Voit lentää kameraa Xbox-tyylisellä ohjaimella näppäimistön sijaan. Käytä sitä, kun haluat nojata taaksepäin ja katsella ympärillesi suuressa kohtauksessa. Sen syöte **lisätään** näppäimistön syötteeseen, joten voit käyttää molempia yhtä aikaa.

## Yhdistä ohjain {#connect-a-controller}

1. Kytke ohjain (tai muodosta pari).
2. Napsauta näkymää ja paina mitä tahansa ohjaimen nappia. Selaimet näyttävät ohjaimen vasta sen ensimmäisen syötteen jälkeen.
3. Avaa **Camera & scene → Gamepad**. Laitelistassa se näkyy merkillä `●`.
4. Työnnä vasenta tikkua lentääksesi ja oikeaa katsoaksesi. Jos kamera lähtee liikkumaan tikkujen ollessa keskellä, nosta **Kuollut alue**.

Mikä tahansa laite, jonka selain kartoittaa vakioasetteluun, toimii. Lentotikku tai kaasu (HOTAS) jätetään oletuksena huomiotta. Katso alla.

## Kartoitus {#mapping}

| Säädin | Vaikutus |
|---|---|
| Vasen tikku | Liike: eteen ja taakse sekä sivuttain |
| Oikea tikku | Katselu: kääntyminen ja kallistus, *Katsenopeus* asteina sekunnissa täydellä taivutuksella |
| `RT` / `LT` (analoginen) | Ylös / alas; rinnakkaisprojektiossa zoomaus sisään / ulos |
| `RB` (pidettynä) | 6 kertaa nopeampi |
| `LB` (pidettynä) | 15 % nopeus |
| `A` (pidettynä) | 3-kertainen sprintti (yhdistyy RB/LB:n kanssa) |
| `Y` (painallus) | Sovita data kehykseen |

Nappinumerot seuraavat vakioasettelua: A 0, Y 3, LB 4, RB 5, LT 6, RT 7. Tikut akseleilla 0-1 (vasen) ja 2-3 (oikea).

## Gamepad-asetukset {#the-gamepad-settings}

Kohdassa **Camera & scene → Gamepad**. **Asetukset** / **Piilota** avaa säätimet.

| Säädin | Oletus | Alue (säätö) | Merkitys |
|---|---|---|---|
| **Käytössä** | päällä | | |
| Laitteen tila | | | Jokainen yhdistetty laite, `●` kun seurataan, `○` kun ei, ja *- not an XInput pad, ignored* tai *- not an XInput pad, used anyway* muille kuin vakiolaitteille. Kun laitteita ei ole: *No pad detected. Browsers only reveal a controller after it sends its first input - press a button on it.* |
| **Käytä laitetta** | *XInput pads only (recommended)* | | Näkyy, kun ei-vakiolaite on yhdistetty. Valitse laite nimen perusteella seurataksesi sitä. |
| **Katsenopeus** | 150°/s | 20-540 (5000) | Kääntymisnopeus, kun oikea tikku on täydellä taivutuksella. |
| **Kuollut alue** | 12 % | 0-50 % (95 %) | Säteittäinen: vinosti työnnetty liike ei vuoda vain yhteen akseliin. Nosta, jos kamera liikkuu tikkujen ollessa keskellä. |
| **Tikun käyrä** | x² | lineaarinen (1) ... x⁴ (16) | Vastauksen eksponentti kuolleen alueen jälkeen: tarkempi hallinta keskustan lähellä, täysi nopeus reunalla. |
| **Käännä tikun Y** | pois | | |
| **Vaihda tikut** | pois | | Liike oikealla tikulla, katselu vasemmalla. |

Tikun muotoilu: kun taivutus on *m* (tikkuvektorin pituus) ja kuollut alue *d*, tulos = ((m - d) / (1 - d)) ^ käyrä tikun suunnassa, ja 0 kuolleen alueen sisällä.

## Miksi oletuksena vain vakiolaitteet {#why-only-standard-pads-by-default}

Gamepad-API ilmoittaa **kaikki** HID-laitteet, joissa on akseleita: lentotikut, kaasut, polkimet, ratit. Ne eivät lepää keskustassa. Kiertoakseli tai kaasuvipu on täydellä taivutuksella, kun kukaan ei koske siihen. Jos sitä luetaan tikkuna, syntyy jatkuva täyden nopeuden syöte, jota mikään kuollut alue ei hillitse. Kamera pyörisi itsekseen heti, kun sivu latautuu. Lisäksi kaikki lämpötilat näyttäisivät rikkinäisiltä, koska liikkuva kamera nollaa kertymisen joka kuvassa.

Siksi laitetta seurataan vain, kun selain ilmoittaa `mapping: "standard"`. Se tarkoittaa: "XInput-tyylinen ohjain, akselit siellä missä odotat". Muut laitteet listataan ja merkitään huomiotta jätetyiksi. **Käytä laitetta** ottaa yhden käyttöön erikseen, esimerkiksi kameran lentämiseen HOTAS:lla. Kun ohjain on seurattavana, kamera pysyy sen kanssa. Kaksi ohjainta ei siis kilpaile kamerasta laitteiden järjestyksen mukaan.

**HOTAS:** luetaan vain akselit 0-3 (kaksi tikkua) ja vakionapit. Kaasu tai polkimet muilla akseleilla eivät tee mitään. Tikku tai kaasu, jonka akselit eivät lepää keskustassa, voi vaatia suuremman **Kuollut alue** -arvon.

Selaimet piilottavat ohjaimen, kunnes se on lähettänyt ensimmäisen syötteensä. Kytketty ohjain, jolle ei ole kosketettu, ei siis ole sivulle olemassa.
