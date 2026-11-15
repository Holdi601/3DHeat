---
title: "Synteettinen generaattori"
parent: "Datan lataaminen"
nav_order: 5
lang: "fi"
source: "synthetic-generator.md"
source_hash: "7a97459b7817"
translated: true
outdated: false
---

# Synteettinen generaattori

Ei omaa dataa? Paina yhtä nappia, niin 3DHeat keksii sinulle kuvitteellisen taistelun, niin pienen tai ison kuin haluat.

1. Avaa paneeli **Aineisto** Heatmap-sivupalkista (kohdan **Lähde** alapuolelta).
2. Vieritä kohtaan **Synteettinen generaattori**.
3. Aseta **Rivejä (miljoonia)**. Kokeile ensin arvoa 1: oletus 8 miljoonaa on raskas ensimmäiselle kokeilulle.
4. Paina **Luo**.

![1 miljoona riviä, 8 joukkuetta, piirretty tilassa Joukkuelämpö](../assets/img/en/synthetic-generator-team-heat.webp)

Paneeli **Aineisto** voi luoda aineiston sen lataamisen sijaan. Se on tarkoitettu kahteen asiaan: katselijan kokeilemiseen ilman omaa dataa, ja sen tarkistamiseen, pitääkö tietty rivimäärä, spritesäde ja budjetti käyttökelpoisen kuvanopeuden koneella, *ennen kuin* siihen ladataan suuri oikea aineisto. Sen liike on muotoiltu battle royale -ottelun mukaan: joukkueet alkavat erillään ja puristuvat sitten yhteen. Tasainen kohina näyttää hyvältä millä budjetilla tahansa ja piilottaa juuri ne artefaktit, jotka kannattaisi löytää.

## Säätimet {#controls}

| Säädin | Oletus | Merkitys |
|---|---|---|
| **Rivejä (miljoonia)** | 8 | Luotavat rivit. Pyöristetään alaspäin kokonaisiksi tikeiksi jokaiselle pelaajalle. |
| **Joukkueet** | 8 | Ryhmien määrä (vähintään 1). |
| **Joukkuetta kohden** | 12 | Pelaajia ryhmää kohden (vähintään 1). |
| **Kartan puolileveys (m)** | 4000 | Puolet pelattavan alueen leveydestä X- ja Z-akseleilla. |
| Arviorivi | | "≈ X GB RAM-muistia, Y GB GPU:lla kvantisoinnin jälkeen." (noin 26 tavua RAM-muistia ja 8 tavua GPU:lla per rivi). |
| **Luo** | | Luo tiedot tuontityöntekijässä, edistymisen kera, ja korvaa ladatun aineiston. |

Luonti tapahtuu taustatyöntekijässä, joten kymmenet miljoonat rivit eivät jäädytä sivua.

## Mitä se luo {#what-it-generates}

[`src/data/synth.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/synth.ts) luo:

- **Sarakkeet:** sijainti, aika, henkilö (`P000`, `P001`, ...), ryhmä (`Team 1`, `Team 2`, ...), kääntymä ja kallistus sekä elinajat. Ei istuntosaraketta eikä suodatinsarakkeita.
- **Aika:** yksi näyte per pelaaja joka 0,25 s, alkaen 0:sta (suhteellinen aika, ei seinäkelloa).
- **Liike:** jokainen joukkue alkaa omalta sektoriltaan renkaasta, joka on 55-95 % puolileveydestä. Turvallinen ympyrä, jonka keskus on lähellä keskustaa (satunnaisesti siirtynyt enintään neljänneksen puolileveydestä), kutistuu kuudessa vaiheessa 8 %:iin puolileveydestä, väliin tasanteet. Jokainen pelaaja ohjaa kohti satunnaisesti vaeltavaa pistettä sen sisällä, vaimennuksella ja kohinalla. Korkeus heilahtelee 0 ja 220 m välillä.
- **Katselusuunta:** kääntymä matkan suunnassa, kallistus pystynopeudesta.
- **Toistettava:** satunnaissiemen on kiinteä (1337), joten samat asetukset tuottavat aina saman datan.

Jokainen lämpötila, laatikkotoisto ja viivalämpö (kokonaiset radat, koska tapahtumasaraketta ei ole) toimii sen kanssa. Myös elinajan historia toimii.
