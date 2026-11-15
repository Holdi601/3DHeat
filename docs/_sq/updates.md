---
title: "Përditësimet"
nav_order: 21
lang: "sq"
source: "updates.md"
source_hash: "674c07a79c56"
translated: true
outdated: false
---

# Përditësimet

Shikuesi të tregon kur ekziston një version më i ri, dhe përditësohet vetë vetëm kur ta thua ti. Asgjë nuk ndryshohet në kompjuterin tënd pa përgjigjen tënde.

## Përditëso shikuesin {#update-the-viewer}

1. **Në faqe.** Kur ekziston një version më i ri, nën emrin në krye të shiritit anësor shfaqet një kuti: "Ka një version më të ri të 3DHeat". Kliko **Përditëso tani**. Faqja rifreskohet vetë kur mbaron. **Më vonë** e fsheh kutinë deri sa të rifreskosh faqen.
2. **Nëse thotë të ekzekutosh restart.bat**, mbyll dritaren e serverit (dritarja e zezë që hapi `start.bat`) dhe kliko dy herë `restart.bat`.
3. **Kur nis shikuesin.** `start.bat` kontrollon gjithashtu. Nëse ekziston një version më i ri, pyet **Update now? [Y/N]**. Shtyp `Y` për të përditësuar. Shtyp `N`, ose prit 60 sekonda pa u përgjigjur, për të nisur versionin që ke.

![Njoftimi i përditësimit me Përditëso tani dhe Më vonë](../assets/img/en/updates-notice.webp)

Një kopje me ndryshime të tua nuk përditësohet kurrë për ty; kutia vetëm të tregon se po pret një përditësim, dhe thotë të bësh commit ose stash të ndryshimeve dhe të ekzekutosh `git pull`. Një kopje që nuk u instalua me git (për shembull një skedar zip) nuk shfaq asgjë.

Si funksionon kontrolli, hap pas hapi:

```
faqja ---(pas 4 s, pastaj çdo 6 orë)---> serveri i zhvillimit ---> git fetch
   pas?  jo  -> nuk shfaqet asgjë
         po  -> ndryshime ose commit të tua?  po -> të thuhet vetëm kjo
                                              jo -> [Përditëso tani] -> git pull
                                                 -> rifreskim, ose "ekzekuto restart.bat"
```

## Rregullat e sigurisë {#the-safety-rules}

- **Vetëm fast-forward** (`git pull --ff-only`): një përditësim nuk bashkon, nuk rebase-on dhe nuk rishkruan asgjë.
- **Pa ndryshime lokale**: një checkout me ndryshime të pa-commit-uara në skedarët e gjurmuar (`git status --porcelain --untracked-files=no` jo bosh) nuk përditësohet kurrë automatikisht - puna e dikujt nuk është për t'u mbishkruar nga një përditësim. Thuhet vetëm se po pret një përditësim. Skedarët e pagjurmuar (të dhënat, eksportimet) nuk llogariten si ndryshime.
- **Pa commit lokale**: një checkout me commit që upstream nuk i ka ("diverged") nuk përditësohet - një fast-forward nuk mund ta sjellë përpara, dhe bashkimi është për `git pull` me dorë. Faqja dhe `start.bat` e thonë këtë me të njëjtat fjalë, dhe `start.bat` nis versionin që ka.
- **Vetëm nga vetë faqja**: kërkesa e serverit të zhvillimit për përditësim duhet të mbajë një header të personalizuar dhe, kur shfletuesi dërgon një `Origin`, të vijë nga host-i i vetë serverit (më poshtë).
- Përditësohet vetëm një checkout git me një degë upstream; çdo gjë tjetër (një kopje pa `.git`, pa git të instaluar, një build statik) lihet rehat dhe nuk thotë asgjë.

## Çfarë bën start.bat {#what-startbat-does}

`start.bat` (kliko dy herë; dritarja është serveri) bën, me radhë:

1. Gjen Node.js - në `PATH`, ose në `%ProgramFiles%\nodejs`, `%ProgramFiles(x86)%\nodejs` ose `%LOCALAPPDATA%\Programs\nodejs` - dhe ofron ta instalojë me `winget install -e --id OpenJS.NodeJS.LTS` kur mungon (pyet, Y/N; pas kësaj dritarja duhet rihapur që Windows ta marrë `PATH`-in e ri).
2. **Përditësimet**, kur git është i instaluar dhe dosja ka `.git`:
   - `git fetch --quiet` (pa rrjet ose pa upstream: kalohet në heshtje);
   - numëron `git rev-list --count HEAD..@{u}`; asgjë pas: nuk thuhet asgjë;
   - ndryshime lokale: "Ka një version më të ri të 3DHeat (N ndryshime), por kjo kopje ka ndryshime lokale, prandaj nuk përditësohet. Bëj commit ose stash, pastaj ekzekuto git pull." - dhe nis versionin që ka;
   - commit të vetat (`git rev-list --count @{u}..HEAD` jo 0): "Ka një version më të ri të 3DHeat (N ndryshime), por kjo kopje ka commit të vetat që versioni më i ri nuk i ka, prandaj nuk përditësohet. Përditësoje me git pull." - dhe nis versionin që ka;
   - përndryshe "Ka një version më të ri të 3DHeat (N ndryshime)." dhe pyetja **Update now? [Y/N]**. `N`, ose pa përgjigje për 60 sekonda, shfaq "Not updated; starting the version you have." dhe nis versionin që ka. Me `Y`: "Updating...", tregon nëse ndryshojnë `package.json` ose `package-lock.json`, ekzekuton `git pull --ff-only` (nëse ende dështon - p.sh. rrjeti: "The update did not go through; starting the version you have."), pastaj `git submodule update --init` (veglat e fiksuara, shih [Mirëmbajtja e dokumentacionit](maintaining.md#the-tools-under-exporters)), pastaj `npm install` kur ndryshuan skedarët e paketës dhe ekziston `node_modules`, dhe "Updated.".
3. Refuzon të nisë një server të dytë: kur diçka dëgjon tashmë portin **5273**, e thotë këtë dhe drejton te `restart.bat` / `stop.bat`.
4. Në nisjen e parë (pa `node_modules`), pyet para se të shkarkojë varësitë (rreth 300 MB në `node_modules\`, asgjë në nivel sistemi).
5. Nis serverin e zhvillimit në `127.0.0.1:5273` (`--strictPort`) dhe hap shfletuesin kur është gati.

`restart.bat` e ndal serverin (sipas portit) dhe e nis përsëri `start.bat`, kështu që pyet të njëjtën gjë. `stop.bat` vetëm e ndal.

## Për zhvilluesit {#for-developers}

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

