---
title: "Ažuriranja"
nav_order: 21
lang: "hr"
source: "updates.md"
source_hash: "674c07a79c56"
translated: true
outdated: false
---

# Ažuriranja

Preglednik vam javlja kad postoji novija verzija, a ažurira se sam tek kad to potvrdite. Ništa se na vašem računalu ne mijenja bez vašeg odgovora.

## Ažuriranje preglednika {#update-the-viewer}

1. **Na stranici.** Kad postoji novija verzija, pod nazivom na vrhu bočne trake pojavljuje se okvir: „Dostupna je novija verzija 3DHeat-a”. Kliknite **Ažuriraj sada**. Stranica se sama ponovno učitava kad je gotovo. **Kasnije** skriva okvir dok ponovno ne učitate stranicu.
2. **Ako piše da pokrenete restart.bat**, zatvorite prozor poslužitelja (crni prozor koji je otvorio `start.bat`) i dvaput kliknite `restart.bat`.
3. **Pri pokretanju preglednika.** `start.bat` također provjerava. Ako postoji novija verzija, pita **Ažurirati sada? [Y/N]**. Pritisnite `Y` za ažuriranje. Pritisnite `N`, ili pričekajte 60 sekundi bez odgovora, da pokrenete verziju koju imate.

![Obavijest o ažuriranju s gumbima Ažuriraj sada i Kasnije](../assets/img/en/updates-notice.webp)

Primjerak s vašim vlastitim promjenama nikad se ne ažurira umjesto vas; okvir samo kaže da čeka ažuriranje i traži da spremite ili odložite svoje promjene te pokrenete `git pull`. Primjerak koji nije instaliran gitom (na primjer zip datoteka) ne prikazuje ništa.

Kako provjera radi, korak po korak:

```
stranica ---(nakon 4 s, zatim svakih 6 h)---> razvojni poslužitelj ---> git fetch
   iza?  ne  -> ništa se ne prikazuje
         da  -> vaše promjene ili commitovi?  da -> samo javi
                                              ne -> [Ažuriraj sada] -> git pull
                                                    -> ponovno učitavanje, ili "pokrenite restart.bat"
```

## Sigurnosna pravila {#the-safety-rules}

- **Samo brzo napredovanje** (`git pull --ff-only`): ažuriranje nikad ne spaja,
  ne preslaguje niti išta prepisuje.
- **Bez lokalnih promjena**: primjerak s nespremljenim promjenama u praćenim datotekama
  (`git status --porcelain --untracked-files=no` nije prazno) se nikad ne ažurira
  automatski - tuđi rad nije dio ažuriranja koje bi ga prepisalo. Samo mu se javi da
  ažuriranje čeka. Nepraćene datoteke (podaci, izvozi) se ne računaju kao promjene.
- **Bez lokalnih commitova**: primjerak s commitovima koje nadređena grana nema
  („razdvojen”) se ne ažurira - brzo napredovanje ga ne može dovesti u red, a
  spajanje je za `git pull` ručno. Stranica i `start.bat` oboje to kažu istim
  riječima, a `start.bat` pokreće verziju koja je tu.
- **Samo sa same stranice**: zahtjev za ažuriranje razvojnog poslužitelja mora nositi
  prilagođeno zaglavlje i, kad nosi `Origin`, dolaziti s vlastitog domaćina poslužitelja
  (dolje).
- Ažurira se samo git primjerak s nadređenom granom; sve ostalo (primjerak bez `.git`,
  bez instaliranog gita, statička verzija) ostaje netaknuto i ne kaže ništa.

## Što radi start.bat {#what-startbat-does}

`start.bat` (dvaput kliknite na njega; prozor je poslužitelj) redom:

1. Pronalazi Node.js - u `PATH`-u, inače u `%ProgramFiles%\nodejs`,
   `%ProgramFiles(x86)%\nodejs` ili `%LOCALAPPDATA%\Programs\nodejs` - i, kad nedostaje,
   nudi instalaciju naredbom `winget install -e --id OpenJS.NodeJS.LTS` (pita, Y/N;
   nakon toga prozor treba ponovno otvoriti da Windows pokupi novi `PATH`).
2. **Ažuriranja**, kad je git instaliran i mapa ima `.git`:
   - `git fetch --quiet` (bez mreže ili nadređene grane: preskače se bez riječi);
   - broji `git rev-list --count HEAD..@{u}`; ništa iza: ništa se ne kaže;
   - lokalne promjene: „Dostupna je novija verzija 3DHeat-a (N promjena), ali ovaj primjerak
     ima lokalne promjene, pa se ne ažurira. Spremite ili odložite ih, zatim pokrenite
     git pull." - i pokreće verziju koja je tu;
   - vlastiti commitovi (`git rev-list --count @{u}..HEAD` nije 0): „Dostupna je novija
     verzija 3DHeat-a (N promjena), ali ovaj primjerak ima vlastite commitove koje najnovija
     verzija nema, pa se ne ažurira. Ažurirajte ga naredbom git pull." - i pokreće verziju
     koja je tu;
   - inače „Dostupna je novija verzija 3DHeat-a (N promjena)." i pitanje **Ažurirati sada? [Y/N]**.
     `N`, ili bez odgovora 60 sekundi, ispisuje „Nije ažurirano; pokrećem verziju koju imate."
     i pokreće verziju koja je tu. Na `Y`: „Ažuriram...", javlja mijenjaju li se
     `package.json` ili `package-lock.json`, pokreće `git pull --ff-only` (ako i to ne uspije -
     na primjer zbog mreže: „Ažuriranje nije uspjelo; pokrećem verziju koju imate."),
     zatim `git submodule update --init` (pripadajući alati, vidi
     [Održavanje dokumentacije](maintaining.md#the-tools-under-exporters)), zatim `npm install`
     kad su se datoteke paketa promijenile i postoji `node_modules`, i „Ažurirano."
3. Odbija pokrenuti drugi poslužitelj: kad nešto već sluša na portu **5273**, to kaže i
   upućuje na `restart.bat` / `stop.bat`.
4. Pri prvom pokretanju (nema `node_modules`), pita prije preuzimanja ovisnosti (oko 300 MB
   u `node_modules\`, ništa na razini sustava).
5. Pokreće razvojni poslužitelj na `127.0.0.1:5273` (`--strictPort`) i otvara preglednik
   kad je spreman.

`restart.bat` zaustavlja poslužitelj (po portu) i ponovno pokreće `start.bat`, pa postavlja isto
pitanje. `stop.bat` samo zaustavlja.


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
