---
title: "Frissítések"
nav_order: 18
lang: "hu"
source: "updates.md"
source_hash: "674c07a79c56"
translated: true
outdated: true
---

# Frissítések

A megjelenítő szól, ha létezik újabb verzió, és csak akkor frissíti magát, ha igent mond. Az Ön válasza nélkül semmi nem változik a gépén.

## A megjelenítő frissítése {#update-the-viewer}

1. **Az oldalon.** Ha létezik újabb verzió, egy doboz jelenik meg a név alatt az oldalsáv tetején: „A 3DHeat újabb verziója elérhető”. Kattintson a **Frissítés most** gombra. Ha kész, az oldal magától újratöltődik. A **Később** elrejti a dobozt, amíg újra nem tölti be az oldalt.
2. **Ha a restart.bat futtatását kéri**, zárja be a kiszolgáló ablakát (a fekete ablakot, amelyet a `start.bat` nyitott meg), és kattintson duplán a `restart.bat` fájlra.
3. **A megjelenítő indításakor.** A `start.bat` is ellenőriz. Ha létezik újabb verzió, megkérdezi: **Frissítés most? [Y/N]**. Nyomja meg a `Y`-t a frissítéshez. Nyomja meg az `N`-t, vagy várjon 60 másodpercet válasz nélkül, és a meglévő verzió indul.

![A frissítési értesítés a Frissítés most és a Később gombokkal](../assets/img/hu/updates-notice.webp)

Az Ön saját változtatásokat tartalmazó példányát soha nem frissítjük Ön helyett; a doboz csak azt jelzi, hogy frissítés vár, és azt, hogy a változtatásokat commitolja vagy tegye félre, majd futtassa a `git pull` parancsot. A git nélkül telepített példány (például egy zip-fájl) semmit nem mutat.

Az ellenőrzés működése lépésenként:

```
oldal ---(4 s után, majd 6 óránként)---> fejlesztői kiszolgáló ---> git fetch
   le van maradva?  nem  -> semmi nem látszik
                    igen -> saját változtatások vagy commitok?  igen -> csak tájékoztat
                                                                nem  -> [Frissítés most] -> git pull
                                                                       -> újratöltés, vagy "futtassa a restart.bat-ot"
```

## A biztonsági szabályok {#the-safety-rules}

- **Csak gyors előrelépés** (`git pull --ff-only`): a frissítés soha nem egyesít,
  nem rebase-el és nem ír felül semmit.
- **Nincs helyi változtatás**: egy másolat, amelynek követett fájljain nem commitolt változtatások vannak
  (`git status --porcelain --untracked-files=no` nem üres), soha nem frissül automatikusan – valakinek a saját munkáját nem írja felül egy frissítés. Csak azt jelzi, hogy frissítés vár. A nem követett fájlok (adat, exportok) nem számítanak változtatásnak.
- **Nincs helyi commit**: egy másolat, amelynek olyan commitjai vannak, amelyek a feltöltött ágnak nincsenek meg („szétváltak”), nem frissül – a gyors előrelépés nem tudja felhozni, az egyesítés pedig a kézi `git pull` dolga. Az oldal és a `start.bat` is ugyanazokkal a szavakkal mondja ezt, a `start.bat` pedig az ott lévő verziót indítja.
- **Csak az oldalról**: a fejlesztői kiszolgáló frissítési kérésének egyedi fejlécet kell hordoznia, és ha van `Origin`-je, a kiszolgáló saját gazdagépéről kell érkeznie (lent).
- Csak olyan git-másolat frissül, amelynek van feltöltött ága; minden más (`.git` nélküli másolat, git nélküli gép, statikus build) érintetlen marad, és nem mond semmit.

## Mit csinál a start.bat {#what-startbat-does}

A `start.bat` (kattintson rá duplán; az ablak a kiszolgáló) sorrendben:

1. Megtalálja a Node.js-t – a `PATH`-on, különben a `%ProgramFiles%\nodejs`, a `%ProgramFiles(x86)%\nodejs` vagy a `%LOCALAPPDATA%\Programs\nodejs` mappában –, és ha hiányzik, felajánlja a telepítését a `winget install -e --id OpenJS.NodeJS.LTS` paranccsal (kérdezi, Y/N; utána újra kell nyitni az ablakot, hogy a Windows felvegye az új `PATH`-ot).
2. **Frissítések**, ha a git telepítve van, és a mappában van `.git`:
   - `git fetch --quiet` (hálózat vagy feltöltött ág nélkül: csendben kihagyva);
   - a `git rev-list --count HEAD..@{u}` megszámolása; nincs lemaradás: nem mond semmit;
   - helyi változtatások: „A 3DHeat újabb verziója elérhető (N változás), de ez a másolat helyi változtatásokat tartalmaz, ezért nem frissül. Commitolja vagy tegye félre őket, majd futtassa a git pull parancsot.” – és az ott lévő verziót indítja;
   - saját commitok (a `git rev-list --count @{u}..HEAD` nem 0): „A 3DHeat újabb verziója elérhető (N változás), de ennek a másolatnak olyan saját commitjai vannak, amelyek a legújabb verzióban nincsenek meg, ezért nem frissül. Frissítse a git pull paranccsal.” – és az ott lévő verziót indítja;
   - egyébként: „A 3DHeat újabb verziója elérhető (N változás).” és a kérdés: **Frissítés most? [Y/N]**. Az `N`, vagy válasz nélkül 60 másodperc, kiírja: „Nincs frissítve; a meglévő verzió indul.”, és azt indítja. Az `Y`-ra: „Frissítés…”, jelzi, ha a `package.json` vagy a `package-lock.json` változik, lefuttatja a `git pull --ff-only` parancsot (ha ez még mindig nem sikerül – például hálózat –: „A frissítés nem sikerült; a meglévő verzió indul.”), majd a `git submodule update --init` parancsot (a rögzített eszközök, lásd [A dokumentáció karbantartása](maintaining.md#the-tools-under-exporters)), majd `npm install`-t, ha a csomagfájlok változtak és a `node_modules` létezik, és „Frissítve.”.
3. Nem enged második kiszolgálót indítani: ha már valami figyel az **5273**-as porton, ezt megmondja, és a `restart.bat` / `stop.bat` használatára utal.
4. Az első futtatáskor (nincs `node_modules`) megkérdezi, mielőtt letölti a függőségeket (nagyjából 300 MB a `node_modules\` mappába, rendszerszintű változtatás nélkül).
5. Elindítja a fejlesztői kiszolgálót a `127.0.0.1:5273` címen (`--strictPort`), és amikor kész, megnyitja a böngészőt.

A `restart.bat` leállítja a kiszolgálót (a port alapján), és újra futtatja a `start.bat`-ot, így ugyanazt a kérdést teszi fel. A `stop.bat` csak leállítja.


## Fejlesztőknek {#for-developers}

### Futás közben: a frissítési útvonal {#while-it-runs-the-update-route}

A fejlesztői kiszolgáló (a `vite.config.ts` `heat3d-self-update` Vite-bővítménye) a `/__heat3d/update` útvonalat szolgálja ki. Csak a fejlesztői kiszolgálón létezik – statikus buildben és a `vite preview`-ban nem.

**`GET /__heat3d/update`** megválaszolja, le van-e maradva a másolat:

```json
{ "checkout": true, "upstream": "origin/main", "behind": 3, "ahead": 0, "dirty": false, "latest": "the newest commit's subject" }
```

- `checkout: false`, ha a mappa nem git-másolat;
- legfeljebb **30 percenként** futtat `git fetch --quiet` parancsot (a közbeeső kérések az utoljára letöltöttől válaszolnak);
- a `behind` / `ahead` a `git rev-list --count HEAD..@{u}` / `@{u}..HEAD` parancsból, a `dirty` a `git status --porcelain --untracked-files=no` parancsból, a `latest` a feltöltött ág legújabb commitjának tárgya;
- feltöltött ág nélkül: `upstream: null` és `behind: 0`.

**`POST /__heat3d/update/apply`** felhozza a másolatot:

1. `403 { ok: false, reason: "forbidden" }` választ ad, hacsak a kérésben nincs az `X-Heat3d-Update: 1` fejléc, és ha van `Origin`, annak gazdagépe nem egyezik a kérés `Host`-jával. Egy oldalak közötti űrlap nem küldhet egyedi fejlécet CORS-előellenőrzés nélkül, ezt pedig ez a kiszolgáló nem engedélyezi.
2. Nincs teendő (nem másolat, nincs feltöltött ág, nincs lemaradás): `{ ok: true, updated: false }`.
3. Helyi változtatások: `{ ok: false, reason: "dirty" }`; helyi commitok: `{ ok: false, reason: "diverged" }`.
4. Egyébként: feljegyzi a változó fájlokat (`git diff --name-only HEAD @{u}`), lefuttatja a `git pull --ff-only` parancsot (2 perc időkorlát), a `git submodule update --init` parancsot (a hiba figyelmen kívül marad), `npm install`-t, ha a `package.json` vagy a `package-lock.json` változott (15 perc időkorlát), és ezt válaszolja: `{ ok: true, updated: true, restart }` – a `restart` megmondja, miért nem tudja a futó kiszolgáló felvenni a frissítést: `"dependencies"`, ha a függőségek újra települtek, `"config"`, ha csak egy `vite.config` fájl változott, `false`, ha nincs szükség újraindításra.
5. Egy hibás git- vagy npm-parancs ezt válaszolja: `{ ok: false, reason: "<a hiba, legfeljebb 300 karakter>" }`.

A válaszok `Cache-Control: no-store` fejléccel küldött JSON-ok. A kiszolgáló csak a `127.0.0.1` címen figyel, így az útvonal hálózatról nem érhető el.

### Az értesítés az oldalon {#the-notice-in-the-page}

Az `UpdateBanner` az oldalsáv tetején a név alatt:

- **4 másodperccel** az oldal betöltése után kérdez rá (nem az első másodpercekben: az oldalnak adatkészletet kell betöltenie és GPU-t kell indítania), majd **6 óránként**, amíg az oldal nyitva marad.
- **Semmit nem mutat**, ha nincs ilyen útvonal (statikus build), a mappa nem másolat, vagy semmi nem újabb – minden indításkor megjelenő értesítést az emberek megtanulnak figyelmen kívül hagyni.
- Lemaradva, helyi változtatások nélkül: „A 3DHeat újabb verziója elérhető (N változás, a legújabb: <tárgy>).” a **Frissítés most** és a **Később** gombokkal (a *Később* az oldal újratöltéséig elrejti).
- Lemaradva, helyi változtatásokkal: ugyanez a mondat, és „Ez a másolat helyi változtatásokat tartalmaz, ezért nem frissül automatikusan; commitolja vagy tegye félre őket, majd futtassa a git pull parancsot.” – gomb nélkül.
- A **Frissítés most** a `/apply` végpontra küld („Frissítés…”). Utána:
  - „Frissítve. Az oldal újratöltődik.” – és 1,5 másodperccel később újratöltődik (a kiszolgáló már az új fájlokat szolgálja ki);
  - ha a függőségek újra települtek: „Frissítve. A függőségei változtak: zárja be a kiszolgáló ablakát, és a befejezéshez futtassa a **restart.bat**-ot.”;
  - ha csak a kiszolgáló beállításai változtak: „Frissítve. A kiszolgáló beállításai változtak: zárja be a kiszolgáló ablakát, és a befejezéshez futtassa a **restart.bat**-ot.”;
  - végül nincs mit behozni (`updated: false` – a másolatot közben felhozta, mondjuk a `start.bat`): „Nincs frissítendő: ez a másolat már a legújabb verzió.” – és nincs újratöltés;
  - elutasítva: a *dirty* mondat, vagy „Ennek a másolatnak olyan saját commitjai vannak, amelyek a legújabb verzióban nincsenek meg; frissítse a git pull paranccsal.”, vagy „A frissítés nem sikerült: <ok>”.
