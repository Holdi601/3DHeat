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

![Uppfærslutilkynningin með Uppfæra núna og Síðar](../assets/img/en/updates-notice.webp)

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

The dev server (Vite plugin `heat3d-self-update` in `vite.config.ts`) serves
`/__heat3d/update`. It exists only on the dev server - not in a static build
and not in `vite preview`.

**`GET /__heat3d/update`** answers whether the checkout is behind:

```json
{ "checkout": true, "upstream": "origin/main", "behind": 3, "ahead": 0, "dirty": false, "latest": "the newest commit's subject" }
```

- `checkout: false` when the folder is not a git checkout;
- it runs `git fetch --quiet` **at most every 30 minutes** (asks in between
  answer from what was last fetched);
- `behind` / `ahead` from `git rev-list --count HEAD..@{u}` / `@{u}..HEAD`,
  `dirty` from `git status --porcelain --untracked-files=no`, `latest` the
  subject of the upstream's newest commit;
- with no upstream branch, `upstream: null` and `behind: 0`.

**`POST /__heat3d/update/apply`** brings the checkout up:

1. Refused with `403 { ok: false, reason: "forbidden" }` unless the request has
   the header `X-Heat3d-Update: 1` and, when it carries an `Origin`, that
   origin's host is the request's `Host`. A cross-site form cannot send a
   custom header without a CORS preflight, which this server never grants.
2. Nothing to do (not a checkout, no upstream, not behind):
   `{ ok: true, updated: false }`.
3. Local changes: `{ ok: false, reason: "dirty" }`; local commits:
   `{ ok: false, reason: "diverged" }`.
4. Otherwise: notes the files that change (`git diff --name-only HEAD @{u}`),
   `git pull --ff-only` (2 min timeout), `git submodule update --init`
   (failure ignored), `npm install` when `package.json` or
   `package-lock.json` changed (15 min timeout), and answers
   `{ ok: true, updated: true, restart }` - `restart` says why the running
   server cannot pick the update up: `"dependencies"` when they were
   reinstalled, `"config"` when only a `vite.config` file changed, `false`
   when nothing needs a restart.
5. A failing git or npm command answers `{ ok: false, reason: "<the error,
   up to 300 characters>" }`.

Responses are JSON with `Cache-Control: no-store`. The server listens on
`127.0.0.1` only, so the route is not reachable from the network.

### The notice in the page {#the-notice-in-the-page}

`UpdateBanner`, under the name at the top of the sidebar:

- It asks the route **4 seconds** after the page loads (not in the first
  seconds: the page has a dataset to load and a GPU to start) and again
  **every 6 hours** while the page stays open.
- It shows **nothing** when there is no such route (a static build), the
  folder is not a checkout, or nothing is newer - a notice on every start is
  one people learn to ignore.
- Behind, with no local changes: "A newer version of 3DHeat is available (N
  changes, the newest: <subject>)." with **Update now** and **Later**
  (*Later* hides it until the page is reloaded).
- Behind, with local changes: the same sentence and "This copy has local
  changes, so it is not updated automatically; commit or stash them, then
  run git pull." - no button.
- **Update now** posts to `/apply` ("Updating..."). Then:
  - "Updated. The page reloads." - and it reloads 1.5 s later (the server
    already serves the new files);
  - when the dependencies were reinstalled: "Updated. Its dependencies
    changed: close the server window and run **restart.bat** to finish.";
  - when only the server's settings changed: "Updated. Its server settings
    changed: close the server window and run **restart.bat** to finish.";
  - nothing to bring in after all (`updated: false` - the copy was brought up
    meanwhile, by `start.bat` say): "Nothing to update: this copy is already
    the newest version." - and no reload;
  - refused: the *dirty* sentence, or "This copy has commits of its own that
    the newest version does not; update it with git pull.", or "The update
    did not go through: <reason>".
