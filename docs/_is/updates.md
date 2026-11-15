---
title: "Uppfærslur"
nav_order: 21
lang: "is"
source: "updates.md"
source_hash: "674c07a79c56"
translated: true
outdated: false
---


# Uppfærslur

Skoðarinn segir þér þegar nýrri útgáfa er til, og uppfærir sjálfan sig aðeins þegar þú segir já. Engu er breytt í tölvunni þinni án svars þíns.

## Uppfærðu skoðarann {#update-the-viewer}

1. **Á síðunni.** Þegar nýrri útgáfa er til birtist kassi undir heitinu efst í hliðarstikunni: "A newer version of 3DHeat is available". Smelltu á **Uppfæra núna**. Síðan endurhleðst af sjálfu sér þegar henni er lokið. **Síðar** felur kassann þar til þú endurhleður síðuna.
2. **Ef hann segir að keyra restart.bat**, lokaðu þjónsglugganum (svarta glugganum sem `start.bat` opnaði) og tvísmelltu á `restart.bat`.
3. **Þegar þú ræsir skoðarann.** `start.bat` athugar líka. Ef nýrri útgáfa er til spyr hann **Update now? [Y/N]**. Ýttu á `Y` til að uppfæra. Ýttu á `N`, eða bíddu í 60 sekúndur án svars, til að ræsa útgáfuna sem þú hefur.

![Uppfærslutilkynningin með Uppfæra núna og Síðar](../assets/img/is/updates-notice.webp)

Afrit með þínum eigin breytingum er aldrei uppfært fyrir þig; kassinn segir aðeins að uppfærsla bíði, og segir að þú eigir að vista eða geyma breytingar þínar og keyra `git pull`. Afrit sem var ekki sett upp með git (til dæmis zip-skrá) sýnir ekkert.

Hvernig athugunin virkar, skref fyrir skref:

```
page ---(after 4 s, then every 6 h)---> dev server ---> git fetch
   behind?  no  -> nothing is shown
            yes -> your own changes or commits?  yes -> tell you only
                                                 no  -> [Update now] -> git pull
                                                        -> reload, or "run restart.bat"
```

## Öryggisreglurnar {#the-safety-rules}

- **Aðeins áfram-fletting** (`git pull --ff-only`): uppfærsla sameinar, endurskrifar eða endurbyggir aldrei neitt.
- **Engar staðbundnar breytingar**: afrit með ósvinna breytingum á rakinni skrám (`git status --porcelain --untracked-files=no` er ekki tómt) er aldrei uppfært sjálfkrafa - vinna einhvers er ekki eitthvað sem uppfærsla á að yfirskrifa. Það er aðeins sagt að uppfærsla bíði. Órakinar skrár (gögn, útflutningar) teljast ekki sem breytingar.
- **Engar staðbundnar skuldbindingar**: afrit með skuldbindingum sem upprunagreinin hefur ekki ("diverged") er ekki uppfært - áfram-flettingu getur ekki komið því upp, og sameining er fyrir `git pull` handvirkt. Síðan og `start.bat` segja það báðar með sömu orðum, og `start.bat` ræsir útgáfuna sem er þar.
- **Aðeins frá síðunni sjálfri**: beiðni þróunarþjónsins um uppfærslu verður að bera sérsniðinn haus og, þegar vafrinn sendir `Origin`, koma frá hýsil þjónsins sjálfs (hér að neðan).
- Aðeins git-afrit með upprunagrein er nokkurn tíma uppfært; annað (afrit án `.git`, enginn git uppsettur, kyrrstæð útgáfa) er látið í friði og segir ekkert.

## Hvað start.bat gerir {#what-startbat-does}

`start.bat` (tvísmelltu á hann; glugginn er þjónninn) gerir, í þessari röð:

1. Finnur Node.js - á `PATH`, annars í `%ProgramFiles%\nodejs`, `%ProgramFiles(x86)%\nodejs` eða `%LOCALAPPDATA%\Programs\nodejs` - og býðst til að setja það upp með `winget install -e --id OpenJS.NodeJS.LTS` þegar það vantar (spurt, Y/N; eftir það þarf að opna gluggann aftur svo Windows nemi nýja `PATH`).
2. **Uppfærir**, þegar git er uppsettur og mappan hefur `.git`:
   - `git fetch --quiet` (ekkert net eða engin upprunagrein: sleppt þegjandi);
   - telur `git rev-list --count HEAD..@{u}`; engin á eftir: ekkert sagt;
   - staðbundnar breytingar: "A newer version of 3DHeat is available (N changes), but this copy has local changes, so it is not updated. Commit or stash them, then run git pull." - og ræsir útgáfuna sem er þar;
   - eigin skuldbindingar (`git rev-list --count @{u}..HEAD` er ekki 0): "A newer version of 3DHeat is available (N changes), but this copy has commits of its own that the newest version does not, so it is not updated. Update it with git pull." - og ræsir útgáfuna sem er þar;
   - annars "A newer version of 3DHeat is available (N changes)." og spurninguna **Update now? [Y/N]**. `N`, eða ekkert svar í 60 sekúndur, prentar "Not updated; starting the version you have." og ræsir útgáfuna sem er þar. Með `Y`: "Updating...", segir hvort `package.json` eða `package-lock.json` breytast, keyrir `git pull --ff-only` (ef það mistekst enn - netið, til dæmis: "The update did not go through; starting the version you have."), síðan `git submodule update --init` (festu verkfærin, sjá [Viðhald skjalanna](maintaining.md#the-tools-under-exporters)), síðan `npm install` þegar pakkaskrárnar breytast og `node_modules` er til, og "Updated.".
3. Neitar að ræsa annan þjón: þegar eitthvað hlustar nú þegar á tengi **5273** segir það það og vísar á `restart.bat` / `stop.bat`.
4. Við fyrstu keyrslu (enginn `node_modules`) spyr áður en háðu forritin eru sótt (um 300 MB í `node_modules\`, ekkert kerfisvítt).
5. Ræsir þróunarþjóninn á `127.0.0.1:5273` (`--strictPort`) og opnar vafrann þegar hann er tilbúinn.

`restart.bat` stöðvar þjóninn (eftir tengi) og keyrir `start.bat` aftur, svo það spyr sömu spurningarinnar. `stop.bat` stöðvar aðeins.


## Fyrir forritara {#for-developers}

### Meðan hann keyrir: uppfærsluleiðin {#while-it-runs-the-update-route}

Þjónninn fyrir þróun (Vite-viðbótin `heat3d-self-update` í `vite.config.ts`) þjónar `/__heat3d/update`. Hún er aðeins á þróunarþjóninum - ekki í kyrrstæðri útgáfu og ekki í `vite preview`.

**`GET /__heat3d/update`** svarar hvort afritið sé á eftir:

```json
{ "checkout": true, "upstream": "origin/main", "behind": 3, "ahead": 0, "dirty": false, "latest": "the newest commit's subject" }
```

- `checkout: false` þegar mappan er ekki git-afrit;
- keyrir `git fetch --quiet` **í mesta lagi á 30 mínútna fresti** (fyrirspurnir þar á milli svara út frá því sem var sótt síðast);
- `behind` / `ahead` úr `git rev-list --count HEAD..@{u}` / `@{u}..HEAD`, `dirty` úr `git status --porcelain --untracked-files=no`, `latest` er efni nýjustu skuldbindingar upprunans;
- án upprunagreinar: `upstream: null` og `behind: 0`.

**`POST /__heat3d/update/apply`** færir afritið upp:

1. Hafnað með `403 { ok: false, reason: "forbidden" }` nema beiðnin beri hausinn `X-Heat3d-Update: 1` og, þegar hún ber `Origin`, sé hýsill þess uppruna sá sami og `Host` beiðninnar. Eyðublað frá annarri síðu getur ekki sent sérsniðinn haus án CORS-forkeyrslu, sem þessi þjónn veitir aldrei.
2. Ekkert að gera (ekki afrit, engin upprunagrein, ekki á eftir): `{ ok: true, updated: false }`.
3. Staðbundnar breytingar: `{ ok: false, reason: "dirty" }`; staðbundnar skuldbindingar: `{ ok: false, reason: "diverged" }`.
4. Annars: skráir þær skrár sem breytast (`git diff --name-only HEAD @{u}`), keyrir `git pull --ff-only` (2 mínútna tímamörk), `git submodule update --init` (villa hunsuð), `npm install` þegar `package.json` eða `package-lock.json` breytast (15 mínútna tímamörk), og svarar `{ ok: true, updated: true, restart }` - `restart` segir hvers vegna keyrandi þjónninn getur ekki tekið uppfærsluna upp: `"dependencies"` þegar þau voru sett upp aftur, `"config"` þegar aðeins `vite.config`-skrá breyttist, `false` þegar ekkert þarf endurræsingu.
5. Ef git- eða npm-skipun mistekst svarar það `{ ok: false, reason: "<villan, allt að 300 stafir>" }`.

Svör eru JSON með `Cache-Control: no-store`. Þjónninn hlustar aðeins á `127.0.0.1`, svo leiðin er ekki aðgengileg af netinu.

### Tilkynningin á síðunni {#the-notice-in-the-page}

`UpdateBanner`, undir heitinu efst í hliðarstikunni:

- Hann spyr leiðina **4 sekúndum** eftir að síðan hleðst (ekki fyrstu sekúndurnar: síðan hefur gagnasafn að hlaða og skjákort að ræsa) og aftur **á 6 klukkustunda fresti** meðan síðan er opin.
- Hann sýnir **ekkert** þegar engin slík leið er til (kyrrstæð útgáfa), mappan er ekki afrit, eða ekkert er nýrra - tilkynning við hverja ræsingu er það sem fólk lærir að hunsa.
- Á eftir, án staðbundinna breytinga: "A newer version of 3DHeat is available (N changes, the newest: <subject>)." með **Uppfæra núna** og **Síðar** (*Síðar* felur hann þar til síðan er endurhlaðin).
- Á eftir, með staðbundnum breytingum: sama setning og "This copy has local changes, so it is not updated automatically; commit or stash them, then run git pull." - enginn hnappur.
- **Uppfæra núna** sendir á `/apply` ("Updating..."). Þá:
  - "Updated. The page reloads." - og síðan endurhleðst 1,5 s síðar (þjónninn þjónar þegar nýju skránum);
  - þegar háðu forritin voru sett upp aftur: "Updated. Its dependencies changed: close the server window and run **restart.bat** to finish.";
  - þegar aðeins stillingar þjónsins breyttust: "Updated. Its server settings changed: close the server window and run **restart.bat** to finish.";
  - ekkert að sækja eftir allt saman (`updated: false` - afritið var uppfært í millitíðinni, til dæmis af `start.bat`): "Nothing to update: this copy is already the newest version." - og engin endurhleðsla;
  - hafnað: *dirty*-setningin, eða "This copy has commits of its own that the newest version does not; update it with git pull.", eða "The update did not go through: <reason>".
