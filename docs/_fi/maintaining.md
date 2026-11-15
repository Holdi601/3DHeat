---
title: "Ohjeiden ylläpito"
nav_order: 23
lang: "fi"
source: "maintaining.md"
source_hash: "4a4fb46273e5"
translated: true
outdated: false
---

# Ohjeiden ylläpito

Tämä sivu on tarkoitettu katselijan ja tämän sivuston ylläpitäjälle. Se listaa vaiheet, joilla sivut, kuvat ja käännökset pidetään oikeina muutoksen jälkeen.

Tämä sivusto tarkistetaan uudelleen **jokaisen julkaisun** yhteydessä ja aina, kun jokin muuttuu paljon: näppäinkomennot, käyttöliittymän kulku, asetukset, tiedostomuodot. Tarkistuslista:

1. **Luo viitesivut uudelleen**: `node tools/docs-refs.mjs` (ja `--lang <lang>` jokaiselle kielelle). `node tools/docs-refs.mjs --check` epäonnistuu, kun sivu on vanhentunut.
2. **Luo kuvakaappaukset uudelleen** [demodatasta](demo-data.md). Käytä tietokonetta tai konttia, jonka alue on en-US, jotta luvut näkyvät muodossa `0.35` eikä `0,35` (lukuruudut seuraavat selaimen aluetta, kunnes niitä muutetaan). Luo demodata komennolla `node tools/demo-data.mjs`, käynnistä kehityspalvelin portissa 5321 **ilman** paikallista hahmopakettia: `HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1`. Aja sitten `node tools/docs-shots.mjs --lang <lang>`. Katso jokainen kuva: vain demonimiä (*Demo Valley*, *Blue 1*, *Red 3* ...), ei oikeita karttoja, pelaajia tai tallenteita.
3. **Listaa muutokset** viimeisimmästä julkaisutagista: `git log --oneline <last tag>..HEAD` ja tiedoston `CHANGELOG.md` osio **Docs**, joka yhdistää jokaisen ominaisuuden sivuunsa. Jokainen uusi ominaisuus tarvitsee sivun tai osion, ja kuvan, jos se näkyy ruudulla.
4. **Riippumaton tarkistus** englanninkielisille sivuille henkilöltä, joka ei kirjoittanut niitä, kolmelle lukijalle: aloittelijalle, kahdeksanvuotiaalle ja asiantuntijalle. Ovatko vaiheet täydellisiä ja oikeassa järjestyksessä, ovatko sanat käyttöliittymän sanoja, ovatko kuvat ajan tasalla ja ovatko kaavioiden nimiöt oikein?
5. **Korjaa tarkistuksessa löydetyt asiat.**
6. **Käännä muuttuneet sivut uudelleen lähdetiivisteen mukaan** ja aja sitten tarkistus kielittäin. Katso `tools/docs-translate.md`.
7. **Tarkista luottamukselliset termit** muuttuneista tiedostoista ja varmista, ettei mikään kuva näytä muuta kuin demodataa.
8. **Julkaise** vain, kun julkaisu on hyväksytty.

Sama tarkistus kattaa niiden liittyvien repositorioiden dokumentaatiosivustot (katso sivu [Etusivu](index.md#related-repositories)).

## Työkalut kansiossa exporters/ {#the-tools-under-exporters}

Katselijan ympärillä olevat työkalut ovat erillisiä julkisia projekteja. Jokaisella on oma MIT-lisenssinsä, julkaisunsa, wikinsä ja päivitystarkistuksensa. Ne on kiinnitetty tähän repositorioon git-alimoduuleina:

| Kansio | Repositorio |
|---|---|
| `exporters/gamefiles/` | [3DHeat-GameFiles](https://github.com/Holdi601/3DHeat-GameFiles) - radat ja kentät pelien omista arkistoista |
| `exporters/gamecapture/` | [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture) - kierrostelemetrian tallentajat; kentät pelivideosta |
| `exporters/unreal/` | [3DHeat-UnrealExporter](https://github.com/Holdi601/3DHeat-UnrealExporter) - Unreal Editor -liitännäinen |
| `exporters/cs2/` | [3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2) - CS2-demot ja kartat |
| `exporters/watcher/` | [3DHeat-Watcher](https://github.com/Holdi601/3DHeat-Watcher) - tallentaa pelin taustalla |

**Kiinnitetty** tarkoittaa, että tämä repositorio tallentaa jokaisesta työkalusta yhden tarkan commitin. Katselijan kopio saa nämä commitit:

```bash
git clone --recursive https://github.com/Holdi601/3DHeat
# tai tavallisen kloonin jälkeen:
git submodule update --init
```

Molemmat päivitystavat yllä ajavat `git submodule update --init` -komennon vedon jälkeen. Työkalut seuraavat siis katselijaa siihen commitiin, jonka sen uusin versio kiinnittää, eivät työkalujen omiin uusimpiin commiteihin. Työkalun uudempi julkaisu tulee katselijaan, kun tämän repositorion kiinnitys siirretään. Muutokset työkaluun commitoidaan ja työnnetään ensin sen omaan kansioon (omaan repositorioonsa), ja sen jälkeen uusi kiinnitys commitoidaan tähän. Jokainen työkalu tarkistaa myös omat uudemmat julkaisunsa. Se on dokumentoitu sen omassa repositoriossa.
