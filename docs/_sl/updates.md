---
title: "Posodobitve"
nav_order: 21
lang: "sl"
source: "updates.md"
source_hash: "674c07a79c56"
translated: true
outdated: false
---

# Posodobitve

Pregledovalnik vam pove, kdaj obstaja novejša različica, in se posodobi samo, če rečete da. Na računalniku se nič ne spremeni brez vašega odgovora.

## Posodobite pregledovalnik {#update-the-viewer}

1. **Na strani.** Ko obstaja novejša različica, se pod imenom na vrhu stranske vrstice pojavi okence: »Na voljo je novejša različica 3DHeat«. Kliknite **Posodobi zdaj**. Stran se ob koncu sama osveži. **Pozneje** skrije okence do osveževanja strani.
2. **Če piše, naj zaženete restart.bat**, zaprite okno strežnika (črno okno, ki ga je odprl `start.bat`) in dvakrat kliknite `restart.bat`.
3. **Ob zagonu pregledovalnika.** `start.bat` prav tako preveri. Če obstaja novejša različica, vpraša **Posodobi zdaj? [Y/N]**. Pritisnite `Y`, da posodobite. Pritisnite `N` ali počakajte 60 sekund brez odgovora, da zaženete različico, ki jo imate.

![Obvestilo o posodobitvi z Posodobi zdaj in Pozneje](../assets/img/en/updates-notice.webp)

Kopija s spremembami, ki ste jih naredili sami, se nikoli ne posodobi samodejno; okence vam samo pove, da čaka posodobitev, in naroči, naj shranite ali skrijete spremembe ter zaženete `git pull`. Kopija, ki ni bila nameščena z gitom (na primer datoteka zip), ne prikaže ničesar.

Kako preverjanje deluje, korak za korakom:

```
page ---(after 4 s, then every 6 h)---> dev server ---> git fetch
   behind?  no  -> nothing is shown
            yes -> your own changes or commits?  yes -> tell you only
                                                 no  -> [Update now] -> git pull
                                                        -> reload, or "run restart.bat"
```

## Varnostna pravila {#the-safety-rules}

- **Samo hitro naprej** (`git pull --ff-only`): posodobitev nikoli ne združi, ne prestavi in ne prepiše ničesar.
- **Brez lokalnih sprememb**: kopija z nepotrjenimi spremembami sledenih datotek (`git status --porcelain --untracked-files=no` ni prazno) se nikoli ne posodobi samodejno - tuje delo ni nekaj, kar posodobitev sme prepisati. Samo pove, da čaka posodobitev. Nesledene datoteke (podatki, izvozi) se ne štejejo kot spremembe.
- **Brez lokalnih potrditev**: kopija s potrditvami, ki jih izvorna veja nima (»razhajanje«), se ne posodobi - hitro naprej je ne more dvigniti, združevanje pa je za `git pull` ročno. Stran in `start.bat` to povesta z enakimi besedami, `start.bat` pa zažene različico, ki je tam.
- **Samo z same strani**: zahteva za posodobitev razvojnega strežnika mora nositi lastno glavo in, kadar brskalnik pošlje `Origin`, prihajati z gostitelja strežnika (spodaj).
- Posodobi se le git kopija z izvorno vejo; vse drugo (kopija brez `.git`, brez nameščenega gita, statična izdelava) pusti pri miru in ne pove ničesar.

## Kaj naredi start.bat {#what-startbat-does}

`start.bat` (dvakrat kliknite ga; okno je strežnik) naredi, po vrsti:

1. Najde Node.js - v `PATH`, sicer v `%ProgramFiles%\nodejs`, `%ProgramFiles(x86)%\nodejs` ali `%LOCALAPPDATA%\Programs\nodejs` - in ob manjkanju ponudi namestitev z `winget install -e --id OpenJS.NodeJS.LTS` (vpraša, Y/N; potem je treba okno znova odpreti, da Windows prevzame novi `PATH`).
2. **Posodobitve**, kadar je git nameščen in mapa vsebuje `.git`:
   - `git fetch --quiet` (brez omrežja ali brez izvorne veje: tiho preskoči);
   - šteje `git rev-list --count HEAD..@{u}`; nič za njim: nič ne pove;
   - lokalne spremembe: »Na voljo je novejša različica 3DHeat (N sprememb), vendar ta kopija ima lokalne spremembe, zato ni posodobljena. Shranite jih ali skrijte, nato zaženite git pull.« - in zažene različico, ki je tam;
   - lastne potrditve (`git rev-list --count @{u}..HEAD` ni 0): »Na voljo je novejša različica 3DHeat (N sprememb), vendar ta kopija ima lastne potrditve, ki jih najnovejša različica nima, zato ni posodobljena. Posodobite jo z git pull.« - in zažene različico, ki je tam;
   - sicer »Na voljo je novejša različica 3DHeat (N sprememb).« in vprašanje **Posodobi zdaj? [Y/N]**. `N` ali brez odgovora 60 sekund izpiše »Ni posodobljeno; zaganjam različico, ki jo imate.« in zažene različico, ki je tam. Ob `Y`: »Posodabljam...«, pove, ali se `package.json` ali `package-lock.json` spremenita, zažene `git pull --ff-only` (če tudi to ne uspe - na primer zaradi omrežja: »Posodobitev ni uspela; zaganjam različico, ki jo imate.«), nato `git submodule update --init` (pripete orodje, glejte [Vzdrževanje dokumentacije](maintaining.md#the-tools-under-exporters)), nato `npm install`, če so se datoteke paketa spremenile in obstaja `node_modules`, in »Posodobljeno.«
3. Zavrne zagon drugega strežnika: kadar nekaj že posluša na vratih **5273**, to pove in napoti na `restart.bat` / `stop.bat`.
4. Ob prvem zagonu (ni `node_modules`) vpraša, preden prenese odvisnosti (okoli 300 MB v `node_modules\`, nič sistemsko).
5. Zažene razvojni strežnik na `127.0.0.1:5273` (`--strictPort`) in odpre brskalnik, ko je pripravljen.

`restart.bat` ustavi strežnik (po vratih) in znova zažene `start.bat`, zato vpraša isto vprašanje. `stop.bat` samo ustavi.


## For developers {#for-developers}

### While it runs: the update route {#while-it-runs-the-update-route}

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
