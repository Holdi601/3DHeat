---
title: "Ažuriranja"
nav_order: 21
lang: "bs"
source: "updates.md"
source_hash: "674c07a79c56"
translated: true
outdated: false
---

# Ažuriranja

Prikazivač vam kaže kada postoji novija verzija, i ažurira se sam samo ako kažete da. Ništa se ne mijenja na vašem računaru bez vašeg odgovora.

## Ažurirajte prikazivač {#update-the-viewer}

1. **Na stranici.** Kada postoji novija verzija, pojavi se okvir ispod imena na vrhu bočne trake: „Dostupna je novija verzija programa 3DHeat”. Kliknite **Ažuriraj sada**. Stranica se sama ponovo učitava kada se završi. **Kasnije** sakriva okvir dok ne ponovo učitate stranicu.
2. **Ako kaže da pokrenete restart.bat**, zatvorite prozor servera (crni prozor koji je otvorio `start.bat`) i dvaput kliknite `restart.bat`.
3. **Kada pokrenete prikazivač.** I `start.bat` provjerava. Ako postoji novija verzija, pita **Ažurirati sada? [Y/N]**. Pritisnite `Y` za ažuriranje. Pritisnite `N`, ili sačekajte 60 sekundi bez odgovora, da pokrenete verziju koju imate.

![Obavijest o ažuriranju s dugmadima Ažuriraj sada i Kasnije](../assets/img/en/updates-notice.webp)

Kopija s vašim sopstvenim izmjenama nikada se ne ažurira za vas; okvir samo kaže da čeka ažuriranje i traži da sačuvate ili odložite svoje izmjene i pokrenete `git pull`. Kopija koja nije instalirana preko gita (recimo zip datoteka) ne prikazuje ništa.

Kako provjera radi, korak po korak:

```
page ---(after 4 s, then every 6 h)---> dev server ---> git fetch
   behind?  no  -> nothing is shown
            yes -> your own changes or commits?  yes -> tell you only
                                                 no  -> [Update now] -> git pull
                                                        -> reload, or "run restart.bat"
```

## Pravila sigurnosti {#the-safety-rules}

- **Samo unaprijed (fast-forward)** (`git pull --ff-only`): ažuriranje nikada ništa ne spaja, ne prepisuje i ne piše preko.
- **Nema lokalnih izmjena**: checkout s nesačuvanim izmjenama u praćenim datotekama (`git status --porcelain --untracked-files=no` nije prazno) nikada se ne ažurira automatski - tuđi rad nije nešto što ažuriranje sme da prepiše. Samo se javlja da ažuriranje čeka. Nepraćene datoteke (podaci, izvozi) se ne računaju kao izmjene.
- **Nema lokalnih commit-a**: checkout s commit-ima koje uzvodna grana nema („razišao se”) se ne ažurira - unaprijed ga ne može dovesti, a spajanje je za `git pull` ručno. Stranica i `start.bat` oboje to kažu istim riječima, a `start.bat` pokreće verziju koja je tu.
- **Samo sa same stranice**: zahtjev dev servera za ažuriranje mora nositi posebno zaglavlje i, kada šalje `Origin`, doći s hosta samog servera (dole).
- Ažurira se samo git checkout s uzvodnom granom; sve ostalo (kopija bez `.git`, bez instaliranog gita, statički build) ostaje netaknuto i ništa ne kaže.

## Šta radi start.bat {#what-startbat-does}

`start.bat` (dvaput kliknite; prozor je server) radi, redom:

1. Pronalazi Node.js - u `PATH`-u, inače u `%ProgramFiles%\nodejs`, `%ProgramFiles(x86)%\nodejs` ili `%LOCALAPPDATA%\Programs\nodejs` - i nudi da ga instalira komandom `winget install -e --id OpenJS.NodeJS.LTS` kada nedostaje (pita, Y/N; poslije se prozor mora ponovo otvoriti da Windows pokupi novi `PATH`).
2. **Ažuriranja**, kada je git instaliran i fascikla ima `.git`:
   - `git fetch --quiet` (bez mreže ili uzvodne grane: tiho preskače);
   - broji `git rev-list --count HEAD..@{u}`; ništa iza: ništa se ne kaže;
   - lokalne izmjene: „Dostupna je novija verzija programa 3DHeat (N izmjena), ali ova kopija ima lokalne izmjene, pa se ne ažurira. Sačuvajte ili odložite ih, zatim pokrenite git pull.” - i pokreće verziju koja je tu;
   - sopstveni commit-i (`git rev-list --count @{u}..HEAD` nije 0): „Dostupna je novija verzija programa 3DHeat (N izmjena), ali ova kopija ima sopstvene commit-e koje najnovija verzija nema, pa se ne ažurira. Ažurirajte je komandom git pull.” - i pokreće verziju koja je tu;
   - inače „Dostupna je novija verzija programa 3DHeat (N izmjena).” i pitanje **Ažurirati sada? [Y/N]**. `N`, ili bez odgovora 60 sekundi, ispisuje „Nije ažurirano; pokreće se verzija koju imate.” i pokreće verziju koja je tu. Na `Y`: „Ažuriram...”, napominje da li se mijenjaju `package.json` ili `package-lock.json`, pokreće `git pull --ff-only` (ako i to ne uspije - recimo zbog mreže: „Ažuriranje nije uspjelo; pokreće se verzija koju imate.”), zatim `git submodule update --init` (fiksirani alati, vidi [Održavanje dokumentacije](maintaining.md#the-tools-under-exporters)), zatim `npm install` kada su se datoteke paketa promijenile i postoji `node_modules`, i „Ažurirano.”
3. Odbija da pokrene drugi server: kada nešto već sluša port **5273**, to kaže i upućuje na `restart.bat` / `stop.bat`.
4. Pri prvom pokretanju (nema `node_modules`), pita prije preuzimanja zavisnosti (oko 300 MB u `node_modules\`, ništa na nivou sistema).
5. Pokreće dev server na `127.0.0.1:5273` (`--strictPort`) i otvara preglednik kada je spreman.

`restart.bat` zaustavlja server (po portu) i ponovo pokreće `start.bat`, pa postavlja isto pitanje. `stop.bat` samo zaustavlja.

## Za programere {#for-developers}

Odjeljak je zadržan na engleskom.

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
