---
title: "Updates"
nav_order: 18
lang: "lb"
source: "updates.md"
source_hash: "674c07a79c56"
translated: true
outdated: true
---

# Updates

De Viewer seet Iech Bescheed, wann et eng méi nei Versioun gëtt, an aktualiséiert sech nëmme, wann Dir jo sot. Ouni Är Äntwert gëtt op Ärem Rechner näischt geännert.

## D'Viewer aktualiséieren {#update-the-viewer}

1. **Op der Säit.** Wann et eng méi nei Versioun gëtt, erschéngt e Kaschte ënner dem Numm uewen an der Säitelleescht: "A newer version of 3DHeat is available" (Eng méi nei Versioun vum 3DHeat ass verfügbar). Klickt **Elo aktualiséieren**. D'Säit lued sech vun alleng nei, wann et fäerdeg ass. **Méi spéit** verstoppt de Kaschte, bis Dir d'Säit nei lued.
2. **Wann et seet, restart.bat ze lafen**, maacht d'Serverfënster zou (dat schwaarzt Fënster, dat `start.bat` opgemaach huet) a duebelklickt `restart.bat`.
3. **Wann Dir den Viewer startet.** `start.bat` kuckt och. Wann et eng méi nei Versioun gëtt, freet et **Elo aktualiséieren? [J/N]**. Drëckt `J`, fir ze aktualiséieren. Drëckt `N`, oder waart 60 Sekonnen ouni Äntwert, fir d'Versioun ze starten, déi Dir hutt.

![D'Aktualiséierungsnotiz mat Elo aktualiséieren an Méi spéit](../assets/img/lb/updates-notice.webp)

Eng Kopie mat eegene Ännerungen gëtt ni fir Iech aktualiséiert; de Kaschte seet nëmmen, datt en Update waart, a seet, Dir sollt Är Ännerungen comitten oder stashen an `git pull` ausféieren. Eng Kopie, déi net mat git installéiert gouf (zum Beispill als Zip-Datei), weist guer näischt.

Wéi d'Kontroll funktionéiert, Schrëtt fir Schrëtt:

```
Säit ---(no 4 s, dann all 6 h)---> Dev-Server ---> git fetch
   hannendru?  nee -> et gëtt näischt gewisen
               jo  -> eegen Ännerungen oder Commits?  jo -> nëmmen Hiweis
                                                      nee -> [Elo aktualiséieren] -> git pull
                                                             -> nei lueden, oder "restart.bat lafen"
```

## D'Sécherheetsreegelen {#the-safety-rules}

- **Nëmmen Fast-forward** (`git pull --ff-only`): e Update mécht ni e Merge,
  e Rebase oder schreift iergendeppes ëm.
- **Keng lokal Ännerungen**: eng Kopie mat net gespäichert Ännerungen un verfollegte Dateien
  (`git status --porcelain --untracked-files=no` ass net eidel) gëtt ni automatesch aktualiséiert - dem Mënsch seng eegen Aarbecht ass net dat, wat e Update iwwerschreift. Si kritt nëmmen gesot, datt e Update waart. Net verfollegt Dateien (Daten, Exporter) zielen net als Ännerungen.
- **Keng lokal Commits**: eng Kopie mat Commits, déi de Upstream net huet ("diverged"), gëtt net aktualiséiert - e Fast-forward kann se net bréngen, a Mergen ass fir `git pull` vun Hand. D'Säit an `start.bat` soen dat mat deenselwechten Wieder, an `start.bat` start d'Versioun, déi do ass.
- **Nëmmen vun der Säit selwer**: d'Update-Ufro vum dev-Server muss en eegene Header droen an, wann de Browser en `Origin` schéckt, vum eegene Host vum Server kommen (weider ënnen).
- Nëmme eng git-Kopie mat engem Upstream-Branch gëtt ëmmer aktualiséiert; alles anerts (eng Kopie ohne `.git`, kee git installéiert, en statesche Build) bleift a seet näischt.

## Wat start.bat mécht {#what-startbat-does}

`start.bat` (duebelklickt se; d'Fënster ass de Server) mécht, an dëser Reiefolleg:

1. Fënnt Node.js - am `PATH`, soss an `%ProgramFiles%\nodejs`,
   `%ProgramFiles(x86)%\nodejs` oder `%LOCALAPPDATA%\Programs\nodejs` - a bitt un, en mat `winget install -e --id OpenJS.NodeJS.LTS` z'installéieren, wann e feelt (gefrot, J/N; duerno muss d'Fënster nei opgemaach ginn, sou datt Windows den neien `PATH` gesäit).
2. **Aktualiséierungen**, wann git installéiert ass an de Dossier `.git` huet:
   - `git fetch --quiet` (kee Netz oder kee Upstream: iwwersprongen, ouni ze schwätzen);
   - zielt `git rev-list --count HEAD..@{u}`; näischt hannendrun: näischt gesot;
   - lokal Ännerungen: "A newer version of 3DHeat is available (N changes), but this copy has local changes, so it is not updated. Commit or stash them, then run git pull." (Eng méi nei Versioun vum 3DHeat ass verfügbar, mee dës Kopie huet lokal Ännerungen, dofir gëtt se net aktualiséiert. Comitt oder stasht se, dann `git pull` ausféieren.) - an et start d'Versioun, déi do ass;
   - eegen Commits (`git rev-list --count @{u}..HEAD` ass net 0): "A newer version of 3DHeat is available (N changes), but this copy has commits of its own that the newest version does not, so it is not updated. Update it with git pull." - an et start d'Versioun, déi do ass;
   - soss "A newer version of 3DHeat is available (N changes)." an d'Fro **Elo aktualiséieren? [J/N]**. `N`, oder keng Äntwert fir 60 Sekonnen, schreift "Not updated; starting the version you have." a start d'Versioun, déi do ass. Bei `J`: "Updating...", seet, ob `package.json` oder `package-lock.json` sech änneren,
     féiert `git pull --ff-only` aus (wann dat nach ëmmer feelt - zum Beispill wéinst dem Netz -:
     "The update did not go through; starting the version you have."), dann `git submodule update --init`
     (d'festgeleeten Werkzeich, kuckt [D'Dokumentatioun pflegen](maintaining.md#the-tools-under-exporters)), dann `npm install`, wann d'Packagedateien sech geännert hunn an `node_modules` existéiert, a "Updated." (Aktualiséiert.)
3. Verhënnert, datt en zweeten Server startet: wann eppes schonn op Port **5273** lauschtert, seet et dat a verweist op `restart.bat` / `stop.bat`.
4. Beim éischte Lafen (ouni `node_modules`) freet et, ier d'Abhängegkeeten erofgeluede ginn (ongeféier 300 MB an `node_modules\`, näischt systemwäit).
5. Start den Dev-Server op `127.0.0.1:5273` (`--strictPort`) an mécht den Browser op, wann e prett ass.

`restart.bat` stoppt de Server (iwwer de Port) a leeft `start.bat` nees, also freet et déiselwecht Fro. `stop.bat` stoppt nëmmen.

## Fir Entwéckler {#for-developers}

### Wärend et leeft: d'Update-Route {#while-it-runs-the-update-route}

Den Dev-Server (Vite-Plugin `heat3d-self-update` an `vite.config.ts`) liwwert `/__heat3d/update`. Et gëtt se nëmmen um Dev-Server - net an engem statesche Build an net an `vite preview`.

**`GET /__heat3d/update`** seet, ob de Checkout hannendru ass:

```json
{ "checkout": true, "upstream": "origin/main", "behind": 3, "ahead": 0, "dirty": false, "latest": "the newest commit's subject" }
```

- `checkout: false`, wann de Dossier kee git-Checkout ass;
- en fiert `git fetch --quiet` **héchstens all 30 Minutten** aus (Ufroe dertëscht äntwerten mat deem, wat zulescht geholl gouf);
- `behind` / `ahead` aus `git rev-list --count HEAD..@{u}` / `@{u}..HEAD`, `dirty` aus `git status --porcelain --untracked-files=no`, `latest` den Titel vum neiste Commit vum Upstream;
- ouni Upstream-Branch: `upstream: null` an `behind: 0`.

**`POST /__heat3d/update/apply`** bréngt de Checkout op den neiste Stand:

1. Ofgelehnt mat `403 { ok: false, reason: "forbidden" }`, ausser d'Ufro huet de Header `X-Heat3d-Update: 1`, an wann se e `Origin` mat sech dréit, muss dee mam `Host` vun der Ufro iwwereneestëmmen. E Formulaire vun enger anerer Säit kann ouni CORS-Preflight kee eegene Header schécken, an deen gëtt dësen Server ni.
2. Näischt ze maachen (kee Checkout, kee Upstream, net hannendru): `{ ok: true, updated: false }`.
3. Lokal Ännerungen: `{ ok: false, reason: "dirty" }`; eegen Commits: `{ ok: false, reason: "diverged" }`.
4. Soss: notéiert d'Dateien, déi sech änneren (`git diff --name-only HEAD @{u}`), `git pull --ff-only` (2 Minutte Zäitlimit), `git submodule update --init` (Feeler ginn ignoréiert), `npm install`, wann `package.json` oder `package-lock.json` sech geännert hunn (15 Minutte Zäitlimit), an d'Äntwert ass `{ ok: true, updated: true, restart }`. `restart` seet, firwat de lafende Server d'Update net iwwerhuele kann: `"dependencies"`, wann d'Abhängegkeeten nei installéiert goufen, `"config"`, wann nëmmen eng `vite.config`-Datei sech geännert huet, `false`, wann kee Neistart néideg ass.
5. En fehlgeschloe git- oder npm-Befehl äntwert `{ ok: false, reason: "<de Feeler, bis 300 Zeechen>" }`.

D'Äntwerte sinn JSON mat `Cache-Control: no-store`. De Server lauschtert nëmmen op `127.0.0.1`, sou datt d'Route aus dem Netz net erreechbar ass.

### De Hiweis an der Säit {#the-notice-in-the-page}

`UpdateBanner`, ënner dem Numm uewen an der Säitelleescht:

- Hien freet d'Route **4 Sekonnen** nodeems d'Säit gelueden ass (net an den éischte Sekonnen: d'Säit huet e Datesaz ze lueden an eng GPU ze starten) an da **all 6 Stonnen**, sou laang d'Säit op bleift.
- Hie weist **näischt**, wann et kee sou Route gëtt (en statesche Build), de Dossier kee Checkout ass oder näischt méi Neies do ass - en Hiweis bei all Start ass een, dee Leit léiere sech ze ignoréieren.
- Hannendru, ouni lokal Ännerungen: "A newer version of 3DHeat is available (N changes, the newest: <subject>)." mat **Elo aktualiséieren** an **Méi spéit** (*Méi spéit* verstoppt en, bis d'Säit nei gelueden ass).
- Hannendru, mat lokalen Ännerungen: deeselwechten Saz, an "This copy has local changes, so it is not updated automatically; commit or stash them, then run git pull." - ouni Knäppchen.
- **Elo aktualiséieren** schéckt op `/apply` ("Updating..."). Dann:
  - "Updated. The page reloads." - an d'Säit lued 1,5 s spéider nei (de Server liwwert schonn déi nei Dateien);
  - wann d'Abhängegkeeten nei installéiert goufen: "Updated. Its dependencies changed: close the server window and run **restart.bat** to finish.";
  - wann nëmmen d'Servereinstellungen sech geännert hunn: "Updated. Its server settings changed: close the server window and run **restart.bat** to finish.";
  - wann um Enn näischt méi ze huelen ass (`updated: false` - d'Kopie gouf an der Zwëschenzäit vum `start.bat` aktualiséiert): "Nothing to update: this copy is already the newest version." - an kee Neilueden;
  - ofgelehnt: de Saz zu de lokale Ännerungen, oder "This copy has commits of its own that the newest version does not; update it with git pull.", oder "The update did not go through: <reason>".
