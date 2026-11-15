---
title: "Actualizări"
nav_order: 21
lang: "ro"
source: "updates.md"
source_hash: "674c07a79c56"
translated: true
outdated: false
---

# Actualizări

Vizualizatorul îți spune când există o versiune mai nouă și se actualizează singur doar când spui da. Nimic nu se schimbă pe calculatorul tău fără răspunsul tău.

## Actualizează vizualizatorul {#update-the-viewer}

1. **În pagină.** Când există o versiune mai nouă, apare o casetă sub nume, în partea de sus a barei laterale: „Este disponibilă o versiune nouă a 3DHeat”. Apasă **Actualizează acum**. Pagina se reîncarcă singură când termină. **Mai târziu** ascunde caseta până reîncarci pagina.
2. **Dacă spune să rulezi restart.bat**, închide fereastra serverului (fereastra neagră pe care a deschis-o `start.bat`) și fă dublu clic pe `restart.bat`.
3. **Când pornești vizualizatorul.** `start.bat` verifică și el. Dacă există o versiune mai nouă, întreabă **Actualizez acum? [Y/N]**. Apasă `Y` ca să actualizezi. Apasă `N`, sau așteaptă 60 de secunde fără răspuns, ca să pornească versiunea pe care o ai.

![Anunțul de actualizare cu Actualizează acum și Mai târziu](../assets/img/en/updates-notice.webp)

O copie cu modificări proprii nu este niciodată actualizată pentru tine; caseta doar spune că o actualizare așteaptă și cere să salvezi sau să pui deoparte modificările și să rulezi `git pull`. O copie care nu a fost instalată cu git (un fișier zip, de exemplu) nu arată nimic.

Cum funcționează verificarea, pas cu pas:

```
pagina ---(după 4 s, apoi la fiecare 6 h)---> serverul de dezvoltare ---> git fetch
   în urmă?  nu  -> nu se arată nimic
             da  -> modificări sau commit-uri proprii?  da -> doar te anunță
                                                       nu -> [Actualizează acum] -> git pull
                                                              -> reîncărcare, sau „rulează restart.bat”
```

## Regulile de siguranță {#the-safety-rules}

- **Doar avans rapid** (`git pull --ff-only`): o actualizare nu îmbină, nu rebazează și nu rescrie nimic.
- **Fără modificări locale**: o copie cu modificări nesalvate la fișierele urmărite (`git status --porcelain --untracked-files=no` nu este gol) nu este niciodată actualizată automat - munca cuiva nu trebuie suprascrisă de o actualizare. Doar i se spune că o actualizare așteaptă. Fișierele neurmărite (date, exporturi) nu se numără drept modificări.
- **Fără commit-uri locale**: o copie cu commit-uri pe care amonte nu le are („divergentă”) nu este actualizată - un avans rapid nu o poate aduce la zi, iar îmbinarea este pentru `git pull` făcut de mână. Pagina și `start.bat` spun asta în aceleași cuvinte, iar `start.bat` pornește versiunea care există acolo.
- **Doar din pagina însăși**: cererea de actualizare către serverul de dezvoltare trebuie să poarte un antet personalizat și, când browserul trimite un `Origin`, să vină de la gazda serverului (mai jos).
- Doar o copie git cu o ramură amonte este vreodată actualizată; orice altceva (o copie fără `.git`, fără git instalat, o versiune statică) este lăsat în pace și nu spune nimic.

## Ce face start.bat {#what-startbat-does}

`start.bat` (fă dublu clic; fereastra este serverul) face, în ordine:

1. Găsește Node.js - în `PATH`, altfel în `%ProgramFiles%\nodejs`, `%ProgramFiles(x86)%\nodejs` sau `%LOCALAPPDATA%\Programs\nodejs` - și oferă să-l instaleze cu `winget install -e --id OpenJS.NodeJS.LTS` când lipsește (întreabă, Y/N; după aceea fereastra trebuie redeschisă ca Windows să preia noul `PATH`).
2. **Actualizări**, când git este instalat și dosarul are `.git`:
   - `git fetch --quiet` (fără rețea sau fără amonte: se sare în tăcere);
   - numără `git rev-list --count HEAD..@{u}`; nimic în urmă: nu spune nimic;
   - modificări locale: „Este disponibilă o versiune nouă a 3DHeat (N modificări), dar această copie are modificări locale, deci nu este actualizată. Salvează-le sau pune-le deoparte, apoi rulează git pull.” - și pornește versiunea care există;
   - commit-uri proprii (`git rev-list --count @{u}..HEAD` diferit de 0): „Este disponibilă o versiune nouă a 3DHeat (N modificări), dar această copie are commit-uri proprii pe care cea mai nouă versiune nu le are, deci nu este actualizată. Actualizeaz-o cu git pull.” - și pornește versiunea care există;
   - altfel „Este disponibilă o versiune nouă a 3DHeat (N modificări).” și întrebarea **Actualizez acum? [Y/N]**. `N`, sau niciun răspuns timp de 60 de secunde, afișează „Nu este actualizată; pornesc versiunea pe care o ai.” și pornește versiunea care există. La `Y`: „Se actualizează...”, anunță dacă se schimbă `package.json` sau `package-lock.json`, rulează `git pull --ff-only` (dacă tot eșuează - rețeaua, de exemplu: „Actualizarea nu a reușit; pornesc versiunea pe care o ai.”), apoi `git submodule update --init` (uneltele fixate, vezi [Întreținerea documentației](maintaining.md#the-tools-under-exporters)), apoi `npm install` când s-au schimbat fișierele pachetului și există `node_modules`, și „Actualizat.”
3. Refuză să pornească un al doilea server: când ceva ascultă deja pe portul **5273**, o spune și trimite la `restart.bat` / `stop.bat`.
4. La prima rulare (fără `node_modules`), întreabă înainte de a descărca dependențele (circa 300 MB în `node_modules\`, nimic la nivel de sistem).
5. Pornește serverul de dezvoltare pe `127.0.0.1:5273` (`--strictPort`) și deschide browserul când este gata.

`restart.bat` oprește serverul (după port) și rulează din nou `start.bat`, deci pune aceeași întrebare. `stop.bat` doar oprește serverul.


## Pentru dezvoltatori {#for-developers}

### Cât timp rulează: ruta de actualizare {#while-it-runs-the-update-route}

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

### Anunțul din pagină {#the-notice-in-the-page}

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
