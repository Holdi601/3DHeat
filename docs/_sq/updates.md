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

### Ndërsa vepron: rruga e përditësimit {#while-it-runs-the-update-route}

Serveri i zhvillimit (shtojca Vite `heat3d-self-update` në `vite.config.ts`) shërben `/__heat3d/update`. Ekziston vetëm në serverin e zhvillimit - jo në një build statik dhe jo në `vite preview`.

**`GET /__heat3d/update`** përgjigjet nëse checkout-i ka mbetur pas:

```json
{ "checkout": true, "upstream": "origin/main", "behind": 3, "ahead": 0, "dirty": false, "latest": "the newest commit's subject" }
```

- `checkout: false` kur dosja nuk është checkout git;
- ekzekuton `git fetch --quiet` **të paktën çdo 30 minuta** (kërkesat ndërmjet përgjigjen nga ajo që u sollt herën e fundit);
- `behind` / `ahead` nga `git rev-list --count HEAD..@{u}` / `@{u}..HEAD`, `dirty` nga `git status --porcelain --untracked-files=no`, `latest` është tema e commit-it më të ri të upstream-it;
- pa degë upstream, `upstream: null` dhe `behind: 0`.

**`POST /__heat3d/update/apply`** e sjell checkout-in në versionin e ri:

1. Refuzohet me `403 { ok: false, reason: "forbidden" }` përveç nëse kërkesa ka header-in `X-Heat3d-Update: 1` dhe, kur mban një `Origin`, host-i i asaj origjine është `Host` i kërkesës. Një formular nga një site tjetër nuk mund të dërgojë një header të personalizuar pa preflight CORS, dhe ky server nuk e jep kurrë atë.
2. Asgjë për të bërë (jo checkout, pa upstream, nuk është pas): `{ ok: true, updated: false }`.
3. Ndryshime lokale: `{ ok: false, reason: "dirty" }`; commit lokale: `{ ok: false, reason: "diverged" }`.
4. Përndryshe: shënon skedarët që ndryshojnë (`git diff --name-only HEAD @{u}`), `git pull --ff-only` (afat 2 minuta), `git submodule update --init` (dështimi injorohet), `npm install` kur ndryshuan `package.json` ose `package-lock.json` (afat 15 minuta), dhe përgjigjet `{ ok: true, updated: true, restart }` - `restart` thotë pse serveri që po punon nuk mund ta marrë përditësimin: `"dependencies"` kur varësitë u instaluan përsëri, `"config"` kur ndryshoi vetëm një skedar `vite.config`, `false` kur nuk duhet rinisje.
5. Një komandë git ose npm që dështon përgjigjet `{ ok: false, reason: "<gabimi, deri në 300 karaktere>" }`.

Përgjigjet janë JSON me `Cache-Control: no-store`. Serveri dëgjon vetëm në `127.0.0.1`, kështu që rruga nuk arrihet nga rrjeti.

### Njoftimi në faqe {#the-notice-in-the-page}

`UpdateBanner`, nën emrin në krye të shiritit anësor:

- Pyet rrugën **4 sekonda** pas ngarkimit të faqes (jo në sekondat e para: faqja ka një grup të dhënash për të ngarkuar dhe një GPU për të nisur) dhe përsëri **çdo 6 orë** ndërsa faqja mbetet e hapur.
- **Nuk shfaq asgjë** kur nuk ekziston rruga (build statik), dosja nuk është checkout, ose s'ka asgjë më të re - një njoftim në çdo nisje është diçka që njerëzit mësohen ta injorojnë.
- Pas versionit, pa ndryshime lokale: "Ka një version më të ri të 3DHeat (N ndryshime, më i fundit: <tema>)." me **Përditëso tani** dhe **Më vonë** (*Më vonë* e fsheh deri sa të rifreskohet faqja).
- Pas versionit, me ndryshime lokale: e njëjta fjali dhe "Kjo kopje ka ndryshime lokale, ndaj nuk përditësohet automatikisht; bëni commit ose stash, pastaj ekzekutoni git pull." - pa buton.
- **Përditëso tani** dërgon kërkesë te `/apply` ("Po përditësohet…"). Pastaj:
  - "U përditësua. Faqja po ringarkohet." - dhe ringarkohet 1.5 s më vonë (serveri i shërben tashmë skedarët e rinj);
  - kur varësitë u instaluan përsëri: "U përditësua. Varësitë ndryshuan: mbyllni dritaren e serverit dhe ekzekutoni **restart.bat** për ta përfunduar.";
  - kur ndryshuan vetëm cilësimet e serverit: "U përditësua. Cilësimet e serverit ndryshuan: mbyllni dritaren e serverit dhe ekzekutoni **restart.bat** për ta përfunduar.";
  - në fund s'ka asgjë për të sjellë (`updated: false` - kopja u përditësua ndërkohë, p.sh. nga `start.bat`): "S'ka asgjë për të përditësuar: kjo kopje është tashmë versioni më i ri." - dhe pa rifreskim;
  - refuzuar: fjalia për *ndryshimet lokale*, ose "Kjo kopje ka commit-e të vetat që versioni më i ri nuk i ka; përditësojeni me git pull.", ose "Përditësimi nuk u krye: <arsyeja>".

