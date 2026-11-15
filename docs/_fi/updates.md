---
title: "Päivitykset"
nav_order: 18
lang: "fi"
source: "updates.md"
source_hash: "674c07a79c56"
translated: true
outdated: true
---

# Päivitykset

Katselin kertoo, kun uudempi versio on olemassa, ja päivittää itsensä vain, kun sanot kyllä. Mitään ei muuteta koneellasi ilman vastaustasi.

## Päivitä katselin {#update-the-viewer}

1. **Sivulla.** Kun uudempi versio on olemassa, sivupalkin yläosassa nimen alla ilmestyy laatikko: "3DHeatista on saatavilla uudempi versio". Napsauta **Päivitä nyt**. Sivu latautuu itsestään uudelleen, kun se on valmis. **Myöhemmin** piilottaa laatikon, kunnes lataat sivun uudelleen.
2. **Jos se pyytää ajamaan restart.bat-tiedoston**, sulje palvelinikkuna (musta ikkuna, jonka `start.bat` avasi) ja kaksoisnapsauta `restart.bat`-tiedostoa.
3. **Kun käynnistät katselimen.** `start.bat` tarkistaa myös. Jos uudempi versio on olemassa, se kysyy **Päivitetäänkö? [Y/N]**. Paina `Y` päivittääksesi. Paina `N` tai odota 60 sekuntia ilman vastausta käynnistääksesi versiosi.

![Päivitysilmoitus: Päivitä nyt ja Myöhemmin](../assets/img/fi/updates-notice.webp)

Kopiota, jossa on omia muutoksia, ei koskaan päivitetä puolestasi. Laatikko vain kertoo, että päivitys odottaa, ja neuvoo tekemään muutoksista commitin tai stashin ja ajamaan `git pull`-komennon. Kopio, jota ei ole asennettu gitillä (esimerkiksi zip-tiedosto), ei näytä mitään.

Tarkistuksen toiminta vaihe vaiheelta:

```
page ---(after 4 s, then every 6 h)---> dev server ---> git fetch
   behind?  no  -> nothing is shown
            yes -> your own changes or commits?  yes -> tell you only
                                                 no  -> [Update now] -> git pull
                                                        -> reload, or "run restart.bat"
```

## Turvasäännöt {#the-safety-rules}

- **Vain pikaeteenpäin** (`git pull --ff-only`): päivitys ei koskaan yhdistä, rebase-ta eikä kirjoita mitään uudelleen.
- **Ei paikallisia muutoksia**: kopiota, jossa on commitoimattomia muutoksia seurattuihin tiedostoihin (`git status --porcelain --untracked-files=no` ei ole tyhjä), ei koskaan päivitetä automaattisesti. Jonkun oma työ ei ole päivityksen korvattavissa. Sille vain kerrotaan, että päivitys odottaa. Seuraamattomat tiedostot (data, viennit) eivät ole muutoksia.
- **Ei paikallisia commiteja**: kopiota, jossa on committeja, joita ylävirta ei sisällä ("haarautunut"), ei päivitetä. Pikaeteenpäin-päivitys ei voi tuoda sitä ajan tasalle, ja yhdistäminen kuuluu käsin ajettavaan `git pull`-komentoon. Sivu ja `start.bat` sanovat sen samoin sanoin, ja `start.bat` käynnistää siellä olevan version.
- **Vain sivulta itseltään**: kehityspalvelimen päivityspyynnön täytyy kantaa mukautettua otsaketta, ja jos selain lähettää `Origin`-otsakkeen, sen täytyy tulla palvelimen omasta isännästä (alla).
- Vain git-kopiota, jolla on ylävirran haara, päivitetään koskaan; kaikki muu (kopio ilman `.git`-kansiota, ei gitiä, staattinen julkaisu) jätetään rauhaan eikä siitä kerrota mitään.

## Mitä start.bat tekee {#what-startbat-does}

`start.bat` (kaksoisnapsauta; ikkuna on palvelin) tekee järjestyksessä:

1. Löytää Node.js:n - `PATH`-polulta tai kansioista `%ProgramFiles%\nodejs`, `%ProgramFiles(x86)%\nodejs` tai `%LOCALAPPDATA%\Programs\nodejs` - ja tarjoaa asennusta komennolla `winget install -e --id OpenJS.NodeJS.LTS`, jos se puuttuu (kysytään, Y/N; sen jälkeen ikkuna täytyy avata uudelleen, jotta Windows ottaa uuden `PATH`-polun käyttöön).
2. **Päivitykset**, kun git on asennettu ja kansiossa on `.git`:
   - `git fetch --quiet` (ei verkkoa tai ylävirtaa: ohitetaan hiljaa);
   - laskee `git rev-list --count HEAD..@{u}`; jos ei jäljessä, ei sanota mitään;
   - paikalliset muutokset: "3DHeatista on saatavilla uudempi versio (N muutosta), mutta tässä kopiossa on paikallisia muutoksia, joten sitä ei päivitetä. Tee niistä commit tai stash ja aja sitten git pull." - ja se käynnistää siellä olevan version;
   - omat commitit (`git rev-list --count @{u}..HEAD` ei ole 0): "3DHeatista on saatavilla uudempi versio (N muutosta), mutta tässä kopiossa on omia committeja, joita uusin versio ei sisällä, joten sitä ei päivitetä. Päivitä se komennolla git pull." - ja se käynnistää siellä olevan version;
   - muuten "3DHeatista on saatavilla uudempi versio (N muutosta)." ja kysymys **Päivitetäänkö? [Y/N]**. `N`, tai ei vastausta 60 sekuntiin, tulostaa "Ei päivitetty; käynnistetään version, joka sinulla on." ja käynnistää siellä olevan version. Kun vastaat `Y`: "Päivitetään...", ilmoittaa, muuttuvatko `package.json` tai `package-lock.json`, ajaa `git pull --ff-only` (jos sekin epäonnistuu - esimerkiksi verkon takia: "Päivitys ei onnistunut; käynnistetään version, joka sinulla on."), sitten `git submodule update --init` (kiinnitetyt työkalut, katso [Dokumentaation ylläpito](maintaining.md#the-tools-under-exporters)), sitten `npm install`, jos paketti-tiedostot muuttuivat ja `node_modules` on olemassa, ja lopuksi "Päivitetty."
3. Ei käynnistä toista palvelinta: kun portissa **5273** kuuntelee jo jotain, se kertoo sen ja ohjaa `restart.bat`- / `stop.bat`-tiedostoihin.
4. Ensimmäisellä käynnistyksellä (ei `node_modules`-kansiota) kysyy ennen riippuvuuksien lataamista (noin 300 Mt kansion `node_modules\` sisään, ei mihinkään järjestelmän laajuisesti).
5. Käynnistää kehityspalvelimen osoitteessa `127.0.0.1:5273` (`--strictPort`) ja avaa selaimen, kun se on valmis.

`restart.bat` pysäyttää palvelimen (portin mukaan) ja ajaa `start.bat`-tiedoston uudelleen, joten se kysyy saman kysymyksen. `stop.bat` vain pysäyttää.

## Kehittäjille {#for-developers}

### Kun se käy: päivitysreitti {#while-it-runs-the-update-route}

Kehityspalvelin (Vite-liitännäinen `heat3d-self-update` tiedostossa `vite.config.ts`) tarjoaa reitin `/__heat3d/update`. Se on olemassa vain kehityspalvelimella - ei staattisessa julkaisussa eikä `vite preview`-tilassa.

**`GET /__heat3d/update`** vastaa, onko kopio jäljessä:

```json
{ "checkout": true, "upstream": "origin/main", "behind": 3, "ahead": 0, "dirty": false, "latest": "the newest commit's subject" }
```

- `checkout: false`, kun kansio ei ole git-kopio;
- ajaa `git fetch --quiet` **enintään 30 minuutin välein** (välissä tehtävät kyselyt vastaavat viimeksi haetusta);
- `behind` / `ahead` tulevat komennoista `git rev-list --count HEAD..@{u}` / `@{u}..HEAD`, `dirty` komennosta `git status --porcelain --untracked-files=no`, `latest` ylävirran uusimman commitin otsikosta;
- ilman ylävirran haaraa `upstream: null` ja `behind: 0`.

**`POST /__heat3d/update/apply`** tuo kopion ajan tasalle:

1. Hylätään vastauksella `403 { ok: false, reason: "forbidden" }`, ellei pyynnössä ole otsaketta `X-Heat3d-Update: 1` ja - jos mukana on `Origin` - kyseisen originin isäntä ole pyynnön `Host`. Sivustojen välinen lomake ei voi lähettää mukautettua otsaketta ilman CORS-esitarkistusta, jota tämä palvelin ei koskaan myönnä.
2. Ei tehtävää (ei git-kopio, ei ylävirtaa, ei jäljessä): `{ ok: true, updated: false }`.
3. Paikalliset muutokset: `{ ok: false, reason: "dirty" }`; paikalliset commitit: `{ ok: false, reason: "diverged" }`.
4. Muuten: kirjaa muuttuvat tiedostot (`git diff --name-only HEAD @{u}`), ajaa `git pull --ff-only` (2 min aikaraja), `git submodule update --init` (virhe ohitetaan), `npm install`, kun `package.json` tai `package-lock.json` muuttui (15 min aikaraja), ja vastaa `{ ok: true, updated: true, restart }` - `restart` kertoo, miksi käynnissä oleva palvelin ei voi ottaa päivitystä käyttöön: `"dependencies"`, kun riippuvuudet asennettiin uudelleen, `"config"`, kun vain `vite.config`-tiedosto muuttui, `false`, kun uudelleenkäynnistystä ei tarvita.
5. Epäonnistunut git- tai npm-komento vastaa `{ ok: false, reason: "<virhe, enintään 300 merkkiä>" }`.

Vastaukset ovat JSON-muodossa `Cache-Control: no-store`-otsakkeella. Palvelin kuuntelee vain `127.0.0.1`-osoitetta, joten reittiin ei pääse verkosta.

### Ilmoitus sivulla {#the-notice-in-the-page}

`UpdateBanner`, sivupalkin yläosassa nimen alla:

- Se kysyy reitiltä **4 sekuntia** sivun latauksen jälkeen (ei ensimmäisinä sekunteina: sivulla on aineisto ladattavana ja GPU käynnistettävänä) ja uudelleen **6 tunnin välein**, kun sivu pysyy auki.
- Se ei näytä **mitään**, kun reittiä ei ole (staattinen julkaisu), kansio ei ole kopio tai mikään ei ole uudempaa - ilmoitus joka käynnistyksellä on sellainen, johon ihmiset oppivat olemaan kiinnittämättä huomiota.
- Jäljessä, ilman paikallisia muutoksia: "3DHeatista on saatavilla uudempi versio (N muutosta, uusin: <otsikko>)." sekä painikkeet **Päivitä nyt** ja **Myöhemmin** (*Myöhemmin* piilottaa sen, kunnes sivu ladataan uudelleen).
- Jäljessä, paikallisilla muutoksilla: sama lause ja "Tässä kopiossa on paikallisia muutoksia, joten sitä ei päivitetä automaattisesti; tee niistä commit tai stash ja suorita sitten git pull." - ei painiketta.
- **Päivitä nyt** lähettää pyynnön osoitteeseen `/apply` ("Päivitetään..."). Sen jälkeen:
  - "Päivitetty. Sivu latautuu uudelleen." - ja se lataa sivun uudelleen 1,5 sekunnin kuluttua (palvelin tarjoaa jo uudet tiedostot);
  - kun riippuvuudet asennettiin uudelleen: "Päivitetty. Riippuvuudet muuttuivat: sulje palvelinikkuna ja suorita **restart.bat** viimeistelläksesi päivityksen.";
  - kun vain palvelimen asetukset muuttuivat: "Päivitetty. Palvelimen asetukset muuttuivat: sulje palvelinikkuna ja suorita **restart.bat** viimeistelläksesi päivityksen.";
  - jos tuotavaa ei lopulta ole (`updated: false` - kopio on jo tuotu ajan tasalle, esimerkiksi `start.bat`-tiedoston toimesta): "Ei päivitettävää: tämä kopio on jo uusin versio." - eikä sivua ladata uudelleen;
  - hylätty: paikallisia muutoksia koskeva lause, tai "Tässä kopiossa on omia committeja, joita uusin versio ei sisällä; päivitä se komennolla git pull.", tai "Päivitys ei onnistunut: <syy>".
