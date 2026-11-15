---
title: "Actualizări"
nav_order: 18
lang: "ro"
source: "updates.md"
source_hash: "674c07a79c56"
translated: true
outdated: true
---

# Actualizări

Vizualizatorul îți spune când există o versiune mai nouă și se actualizează singur doar când spui da. Nimic nu se schimbă pe calculatorul tău fără răspunsul tău.

## Actualizează vizualizatorul {#update-the-viewer}

1. **În pagină.** Când există o versiune mai nouă, apare o casetă sub nume, în partea de sus a barei laterale: „Este disponibilă o versiune nouă a 3DHeat”. Apasă **Actualizează acum**. Pagina se reîncarcă singură când termină. **Mai târziu** ascunde caseta până reîncarci pagina.
2. **Dacă spune să rulezi restart.bat**, închide fereastra serverului (fereastra neagră pe care a deschis-o `start.bat`) și fă dublu clic pe `restart.bat`.
3. **Când pornești vizualizatorul.** `start.bat` verifică și el. Dacă există o versiune mai nouă, întreabă **Actualizez acum? [Y/N]**. Apasă `Y` ca să actualizezi. Apasă `N`, sau așteaptă 60 de secunde fără răspuns, ca să pornească versiunea pe care o ai.

![Anunțul de actualizare cu Actualizează acum și Mai târziu](../assets/img/ro/updates-notice.webp)

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

### În timpul rulării: ruta de actualizare {#while-it-runs-the-update-route}

Serverul de dezvoltare (plugin-ul Vite `heat3d-self-update` din `vite.config.ts`) servește `/__heat3d/update`. Există doar pe serverul de dezvoltare - nu într-un build static și nu în `vite preview`.

**`GET /__heat3d/update`** răspunde dacă copia este în urmă:

```json
{ "checkout": true, "upstream": "origin/main", "behind": 3, "ahead": 0, "dirty": false, "latest": "the newest commit's subject" }
```

- `checkout: false` când dosarul nu este o copie git;
- rulează `git fetch --quiet` **cel mult la fiecare 30 de minute** (cererile din intervale răspund din ultimul fetch);
- `behind` / `ahead` din `git rev-list --count HEAD..@{u}` / `@{u}..HEAD`, `dirty` din `git status --porcelain --untracked-files=no`, `latest` subiectul celui mai nou commit din amonte;
- fără o ramură amonte, `upstream: null` și `behind: 0`.

**`POST /__heat3d/update/apply`** aduce copia la zi:

1. Refuzat cu `403 { ok: false, reason: "forbidden" }` decât dacă cererea are antetul `X-Heat3d-Update: 1` și, când poartă un `Origin`, gazda acelui origin este `Host`-ul cererii. Un formular de pe alt site nu poate trimite un antet personalizat fără o cerere preliminară CORS, pe care acest server nu o acordă niciodată.
2. Nimic de făcut (nu este o copie git, nu există amonte, nu este în urmă): `{ ok: true, updated: false }`.
3. Modificări locale: `{ ok: false, reason: "dirty" }`; commit-uri locale: `{ ok: false, reason: "diverged" }`.
4. Altfel: notează fișierele care se schimbă (`git diff --name-only HEAD @{u}`), `git pull --ff-only` (timeout de 2 min), `git submodule update --init` (eșecul este ignorat), `npm install` când s-au schimbat `package.json` sau `package-lock.json` (timeout de 15 min), și răspunde `{ ok: true, updated: true, restart }` - `restart` spune de ce serverul care rulează nu poate prelua actualizarea: `"dependencies"` când dependențele au fost reinstalate, `"config"` când s-a schimbat doar un fișier `vite.config`, `false` când nu este nevoie de repornire.
5. O comandă git sau npm care eșuează răspunde `{ ok: false, reason: "<eroarea, până la 300 de caractere>" }`.

Răspunsurile sunt JSON cu `Cache-Control: no-store`. Serverul ascultă doar pe `127.0.0.1`, deci ruta nu este accesibilă din rețea.

### Anunțul din pagină {#the-notice-in-the-page}

`UpdateBanner`, sub nume, în partea de sus a barei laterale:

- Întreabă ruta la **4 secunde** după încărcarea paginii (nu în primele secunde: pagina are un set de date de încărcat și un GPU de pornit) și din nou **la fiecare 6 ore** cât timp pagina rămâne deschisă.
- Nu arată **nimic** când ruta lipsește (un build static), dosarul nu este o copie git sau nimic nu este mai nou - un anunț la fiecare pornire este unul pe care oamenii învață să-l ignore.
- În urmă, fără modificări locale: „Este disponibilă o versiune mai nouă a 3DHeat (N modificări, cea mai nouă: <subiect>).” cu **Actualizează acum** și **Mai târziu** (*Mai târziu* ascunde caseta până la reîncărcarea paginii).
- În urmă, cu modificări locale: aceeași propoziție și „Această copie are modificări locale, deci nu este actualizată automat; faceți commit sau stash pentru ele, apoi rulați git pull.” - fără buton.
- **Actualizează acum** trimite cererea către `/apply` („Se actualizează…”). Apoi:
  - „Actualizat. Pagina se reîncarcă.” - și se reîncarcă după 1,5 s (serverul servește deja fișierele noi);
  - când dependențele au fost reinstalate: „Actualizat. Dependențele s-au schimbat: închideți fereastra serverului și rulați **restart.bat** pentru a termina.”;
  - când s-au schimbat doar setările serverului: „Actualizat. Setările serverului s-au schimbat: închideți fereastra serverului și rulați **restart.bat** pentru a termina.”;
  - nimic de adus până la urmă (`updated: false` - copia a fost adusă la zi între timp, de exemplu de `start.bat`): „Nimic de actualizat: această copie este deja cea mai nouă versiune.” - și fără reîncărcare;
  - refuzat: propoziția despre modificările locale, sau „Această copie are commit-uri proprii pe care cea mai nouă versiune nu le are; actualizați-o cu git pull.”, sau „Actualizarea nu a reușit: <motiv>”.
