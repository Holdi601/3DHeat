---
title: "Uuendused"
nav_order: 21
lang: "et"
source: "updates.md"
source_hash: "674c07a79c56"
translated: true
outdated: false
---

# Uuendused

Vaatur teatab sulle, kui on olemas uuem versioon, ja uuendab end ainult siis, kui sa ütled jah. Sinu arvutis ei muudeta midagi ilma sinu vastuseta.

## Vaaturi uuendamine {#update-the-viewer}

1. **Lehel.** Kui on olemas uuem versioon, ilmub kast nime alla külgriba ülaosas: "3DHeati uuem versioon on saadaval". Klõpsa **Uuenda kohe**. Leht laaditakse ise uuesti, kui see on valmis. **Hiljem** peidab kasti kuni lehe uuesti laadimiseni.
2. **Kui seal öeldakse, et käivita restart.bat**, sulge serveriaken (must aken, mille `start.bat` avas) ja topeldi `restart.bat`.
3. **Vaaturi käivitamisel.** `start.bat` kontrollib ka. Kui on uuem versioon, küsib ta **Uuenda kohe? [Y/N]**. Vajuta `Y`, et uuendada. Vajuta `N` või oota 60 sekundit ilma vastamata, et käivitada versioon, mis sul on.

![Uuenduse teade nupuga Uuenda kohe ja Hiljem](../assets/img/en/updates-notice.webp)

Koopiat, millel on sinu enda muudatused, ei uuendata sinu eest kunagi; kast ütleb ainult, et uuendus ootab, ja palub muudatused commit'ida või stash'ida ning käivitada `git pull`. Koopia, mis ei ole installitud gitiga (näiteks zip-fail), ei näita midagi.

Kontrolli toimimine samm-sammult:

```
leht ---(4 s pärast, siis iga 6 h)---> arendusserver ---> git fetch
   maha jäänud?  ei  -> midagi ei näidata
                 jah -> sinu muudatused või commit'id?  jah -> ainult teatab
                                                       ei  -> [Uuenda kohe] -> git pull
                                                              -> uuesti laadimine või "käivita restart.bat"
```

## Ohutusreeglid {#the-safety-rules}

- **Ainult kiire edasiliikumine** (`git pull --ff-only`): uuendus ei ühenda,
  ei rebase'i ega kirjuta midagi üle.
- **Kohalikke muudatusi pole**: koopiat, millel on jälgimata muudatused jälgitud
  failides (`git status --porcelain --untracked-files=no` ei ole tühi), ei uuendata
  kunagi automaatselt - kellegi enda töö pole uuenduse kirjutada. Sellele ainult
  öeldakse, et uuendus ootab. Jälgimata failid (andmed, eksportid) muudatusi ei loe.
- **Kohalikke commit'e pole**: koopiat, millel on commit'id, mida ülesvoolul ei ole
  ("lahknenud"), ei uuendata - kiire edasiliikumine ei saa seda viia kaasa, ja
  ühendamine on käsitsi `git pull` jaoks. Leht ja `start.bat` ütlevad seda samade
  sõnadega ning `start.bat` käivitab seal oleva versiooni.
- **Ainult lehelt endalt**: arendusserveri uuendamispäring peab kandma kohandatud
  päist ja, kui brauser saadab `Origin`-i, tulema serveri enda hostilt (allpool).
- Uuendatakse ainult git-koopiat, millel on ülesvoolu haru; kõike muud (koopia ilma
  `.git`-ita, gitita arvuti, staatiline ehitis) jäetakse rahule ja ei öelda midagi.

## Mida start.bat teeb {#what-startbat-does}

`start.bat` (topelt-klõps; aken on server) teeb järjekorras:

1. Leiab Node.js-i - `PATH`-ist või kaustadest `%ProgramFiles%\nodejs`,
   `%ProgramFiles(x86)%\nodejs` või `%LOCALAPPDATA%\Programs\nodejs` - ja pakub
   selle paigaldamist käsuga `winget install -e --id OpenJS.NodeJS.LTS`, kui seda pole
   (küsitakse, Y/N; pärast tuleb aken uuesti avada, et Windows näeks uut `PATH`-i).
2. **Uuendused**, kui git on paigaldatud ja kaustas on `.git`:
   - `git fetch --quiet` (võrku pole või ülesvoolu pole: vaikselt vahele jäetud);
   - loeb `git rev-list --count HEAD..@{u}`; maha pole jäänud: midagi ei öelda;
   - kohalikud muudatused: "Uuem versioon 3DHeatist on saadaval (N muudatust), aga selles koopias on kohalikke muudatusi, seega seda ei uuendata. Commit'i või stash'i need, seejärel käivita git pull." - ja käivitab oleva versiooni;
   - enda commit'id (`git rev-list --count @{u}..HEAD` pole 0): "Uuem versioon 3DHeatist on saadaval (N muudatust), aga selles koopias on enda commit'id, mida uusimal versioonil pole, seega seda ei uuendata. Uuenda see käsuga git pull." - ja käivitab oleva versiooni;
   - muidu "Uuem versioon 3DHeatist on saadaval (N muudatust)." ja küsimus **Uuenda kohe? [Y/N]**. `N` või vastuseta 60 sekundit trükib "Ei uuendatud; käivitan versiooni, mis sul on." ja käivitab oleva versiooni. Vastusel `Y`: "Uuendan...", teatab, kas `package.json` või `package-lock.json` muutuvad,
     käivitab `git pull --ff-only` (kui see ikka ebaõnnestub - näiteks võrgu tõttu:
     "Uuendus ei õnnestunud; käivitan versiooni, mis sul on."), seejärel `git submodule update --init`
     (kinnitatud tööriistad, vt [Dokumentatsiooni hooldamine](maintaining.md#the-tools-under-exporters)), siis `npm install`, kui paketifailid muutusid ja
     `node_modules` on olemas, ning "Uuendatud."
3. Keeldub käivitamast teist serverit: kui port **5273** on juba kasutusel, ütleb ta seda ja suunab `restart.bat` / `stop.bat` poole.
4. Esimesel käivitamisel (`node_modules` puudub) küsib enne sõltuvuste allalaadimist (umbes 300 MB kausta `node_modules\`, mitte süsteemi).
5. Käivitab arendusserveri `127.0.0.1:5273` peal (`--strictPort`) ja avab brauseri, kui see on valmis.

`restart.bat` peatab serveri (pordi järgi) ja käivitab `start.bat` uuesti, nii et see küsib sama küsimuse. `stop.bat` ainult peatab.

## Arendajatele {#for-developers}

### Töötamise ajal: uuendamise marsruut {#while-it-runs-the-update-route}

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

### Teade lehel {#the-notice-in-the-page}

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
