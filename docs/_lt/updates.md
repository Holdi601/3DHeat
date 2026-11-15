---
title: "Atnaujinimai"
nav_order: 21
lang: "lt"
source: "updates.md"
source_hash: "674c07a79c56"
translated: true
outdated: false
---

# Atnaujinimai

Peržiūros programa praneša, kai yra naujesnė versija, ir atsinaujina pati tik tada, kai jūs sutinkate. Jūsų kompiuteryje nieko nepakeičiama be jūsų atsakymo.

## Atnaujinkite peržiūros programą {#update-the-viewer}

1. **Puslapyje.** Kai yra naujesnė versija, po pavadinimu šoninės juostos viršuje pasirodo langelis: „Yra naujesnė 3DHeat versija“. Spustelėkite **Atnaujinti dabar**. Baigus puslapis persikrauna pats. **Vėliau** paslepia langelį, kol neperkrausite puslapio.
2. **Jei sakoma paleisti restart.bat**, uždarykite serverio langą (juodą langą, kurį atidarė `start.bat`) ir dukart spustelėkite `restart.bat`.
3. **Paleisdami peržiūros programą.** `start.bat` taip pat tikrina. Jei yra naujesnė versija, klausia **Atnaujinti dabar? [Y/N]**. Paspauskite `Y`, kad atnaujintumėte. Paspauskite `N` arba palaukite 60 sekundžių be atsakymo, kad paleistumėte turimą versiją.

![Atnaujinimo pranešimas su Atnaujinti dabar ir Vėliau](../assets/img/en/updates-notice.webp)

Kopijos su jūsų pačių pakeitimais niekada neatnaujinamos automatiškai; langelis tik praneša, kad laukia atnaujinimas, ir sako įrašyti arba paslėpti pakeitimus ir paleisti `git pull`. Kopija, neįdiegta su git (pavyzdžiui, zip failas), nieko nerodo.

Kaip vyksta tikrinimas, žingsnis po žingsnio:

```
puslapis ---(po 4 s, paskui kas 6 val.)---> kūrimo serveris ---> git fetch
   atsilikusi?  ne  -> nieko nerodoma
                taip -> jūsų pakeitimai ar įrašai?  taip -> tik praneša
                                                  ne  -> [Atnaujinti dabar] -> git pull
                                                        -> perkrovimas arba „paleiskite restart.bat“
```

## Saugos taisyklės {#the-safety-rules}

- **Tik greitas perkėlimas** (`git pull --ff-only`): atnaujinimas niekada nejungia, neperkelia ir nepersirašo nieko.
- **Jokių vietinių pakeitimų**: kopija su neįrašytais stebimų failų pakeitimais (`git status --porcelain --untracked-files=no` ne tuščias) niekada neatnaujinama automatiškai – kieno nors darbo atnaujinimas neturi teisės perrašyti. Ji tik praneša, kad laukia atnaujinimas. Nestebimi failai (duomenys, eksportai) pakeitimais nelaikomi.
- **Jokių vietinių įrašų**: kopija su įrašais, kurių nėra aukštesniame šaltinyje („išsiskyrusi“), neatnaujinama – greitas perkėlimas jos nepakels, o sujungimas yra `git pull` rankiniu būdu. Puslapis ir `start.bat` sako tai tais pačiais žodžiais, o `start.bat` paleidžia turimą versiją.
- **Tik iš pačios svetainės**: kūrimo serverio atnaujinimo užklausa turi turėti tinkintą antraštę ir, kai naršyklė siunčia `Origin`, ateiti iš serverio paties pagrindinio kompiuterio (žemiau).
- Atnaujinama tik git kopija su aukštesniu šakos šaltiniu; viskas kita (kopija be `.git`, nėra git, statinė versija) paliekama ramybėje ir nieko nesako.

## Ką daro start.bat {#what-startbat-does}

`start.bat` (dukart spustelėkite; langas yra serveris) atlieka, eilės tvarka:

1. Randa Node.js – `PATH` kintamajame, kitaip `%ProgramFiles%\nodejs`, `%ProgramFiles(x86)%\nodejs` arba `%LOCALAPPDATA%\Programs\nodejs` – ir, jei jo nėra, siūlo įdiegti su `winget install -e --id OpenJS.NodeJS.LTS` (klausia, Y/N; vėliau langą reikia atidaryti iš naujo, kad Windows perskaitytų naują `PATH`).
2. **Atnaujinimai**, kai įdiegtas git ir aplankas turi `.git`:
   - `git fetch --quiet` (be tinklo arba be aukštesniojo šaltinio: praleidžiama tyliai);
   - skaičiuoja `git rev-list --count HEAD..@{u}`; nėra atsilikimo – nieko nesakoma;
   - vietiniai pakeitimai: „Yra naujesnė 3DHeat versija (N pakeitimų), bet ši kopija turi vietinių pakeitimų, todėl neatnaujinama. Įrašykite arba paslėpkite juos, tada paleiskite git pull.“ – ir paleidžiama turima versija;
   - jos pačios įrašai (`git rev-list --count @{u}..HEAD` ne 0): „Yra naujesnė 3DHeat versija (N pakeitimų), bet ši kopija turi savo įrašų, kurių naujausia versija neturi, todėl neatnaujinama. Atnaujinkite ją su git pull.“ – ir paleidžiama turima versija;
   - kitu atveju „Yra naujesnė 3DHeat versija (N pakeitimų).“ ir klausimas **Atnaujinti dabar? [Y/N]**. `N` arba jokio atsakymo 60 sekundžių – išveda „Neatnaujinta; paleidžiama turima versija.“ ir paleidžiama turima versija. Su `Y`: „Atnaujinama...“, pažymi, ar keičiasi `package.json` arba `package-lock.json`, paleidžia `git pull --ff-only` (jei ir tada nepavyksta – pvz., tinklas: „Atnaujinimas nepavyko; paleidžiama turima versija.“), tada `git submodule update --init` (fiksuoti įrankiai, žr. [Dokumentacijos priežiūra](maintaining.md#the-tools-under-exporters)), tada `npm install`, kai pakeitėsi paketo failai ir `node_modules` egzistuoja, ir „Atnaujinta.“
3. Neleidžia paleisti antro serverio: kai prievadą **5273** jau kas nors klauso, tai pasako ir nukreipia į `restart.bat` / `stop.bat`.
4. Pirmo paleidimo metu (nėra `node_modules`) klausia prieš atsisiunčiant priklausomybes (apie 300 MB į `node_modules\`, nieko visoje sistemoje).
5. Paleidžia kūrimo serverį ant `127.0.0.1:5273` (`--strictPort`) ir, kai jis pasiruošęs, atidaro naršyklę.

`restart.bat` sustabdo serverį (pagal prievadą) ir vėl paleidžia `start.bat`, todėl klausia to paties. `stop.bat` tik sustabdo.

## Kūrėjams {#for-developers}

### Kol veikia: atnaujinimo maršrutas {#while-it-runs-the-update-route}

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
