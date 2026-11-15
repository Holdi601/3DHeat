---
title: "Opdateringer"
nav_order: 21
lang: "da"
source: "updates.md"
source_hash: "674c07a79c56"
translated: true
outdated: false
---

# Opdateringer

Vieweren fortæller dig, når en nyere version findes, og opdaterer sig selv først, når du siger ja. Intet ændres på din computer uden dit svar.

## Opdatér vieweren {#update-the-viewer}

1. **På siden.** Når en nyere version findes, vises en boks under navnet øverst i sidebjælken: "En nyere version af 3DHeat er tilgængelig". Klik på **Opdatér nu**. Siden genindlæses af sig selv, når det er færdigt. **Senere** skjuler boksen, til du genindlæser siden.
2. **Hvis der står, at du skal køre restart.bat**, lukker du serverens vindue (det sorte vindue, `start.bat` åbnede) og dobbeltklikker på `restart.bat`.
3. **Når du starter vieweren.** `start.bat` tjekker også. Findes en nyere version, spørger den **Update now? [Y/N]** (den engelske prompt, som vises i vinduet). Tryk `Y` for at opdatere. Tryk `N`, eller vent 60 sekunder uden at svare, for at starte den version, du har.

![Opdateringsmeddelelsen med Opdatér nu og Senere](../assets/img/en/updates-notice.webp)

En kopi med dine egne ændringer opdateres aldrig for dig; boksen fortæller kun, at en opdatering venter, og siger, at du skal committe eller stashe dine ændringer og køre `git pull`. En kopi, der ikke er installeret med git (for eksempel en zip-fil), viser ingenting.

Sådan fungerer tjekket, trin for trin:

```
side ---(efter 4 s, derefter hver 6 t)---> udviklingsserver ---> git fetch
   bagud?  nej  -> intet vises
           ja   -> dine egne ændringer eller commits?  ja -> kun besked
                                                       nej -> [Opdatér nu] -> git pull
                                                           -> genindlæs, eller "kør restart.bat"
```

## Sikkerhedsreglerne {#the-safety-rules}

- **Kun fast-forward** (`git pull --ff-only`): en opdatering flettes aldrig,
  rebases eller omskriver noget.
- **Ingen lokale ændringer**: et checkout med ikke-committede ændringer i sporede filer
  (`git status --porcelain --untracked-files=no` er ikke tom) opdateres aldrig automatisk – nogens eget arbejde er ikke en opdaterings at overskrive. Det får kun at vide, at en opdatering venter. Usporede filer (data, eksporter) tæller ikke som ændringer.
- **Ingen lokale commits**: et checkout med commits, opstrømsgrenen ikke har ("divergeret"), opdateres ikke – et fast-forward kan ikke hente det op, og sammenfletning er for `git pull` i hånden. Siden og `start.bat` siger det med de samme ord, og `start.bat` starter den version, der er der.
- **Kun fra siden selv**: udviklingsserverens opdateringsforespørgsel skal bære en brugerdefineret header og, når browseren sender en `Origin`, komme fra serverens egen vært (nedenfor).
- Kun et git-checkout med en opstrømsgren opdateres nogensinde; alt andet
  (en kopi uden `.git`, ingen git installeret, en statisk build) lades i fred og siger ingenting.

## Hvad start.bat gør {#what-startbat-does}

`start.bat` (dobbeltklik på den; vinduet er serveren) gør følgende, i rækkefølge:

1. Finder Node.js – på `PATH`, ellers i `%ProgramFiles%\nodejs`, `%ProgramFiles(x86)%\nodejs` eller `%LOCALAPPDATA%\Programs\nodejs` – og tilbyder at installere det med `winget install -e --id OpenJS.NodeJS.LTS`, når det mangler (spørges, J/N; derefter skal vinduet åbnes igen, så Windows får den nye `PATH`).
2. **Opdateringer**, når git er installeret, og mappen har `.git`:
   - `git fetch --quiet` (ingen netværk eller ingen opstrøm: springes stille over);
   - tæller `git rev-list --count HEAD..@{u}`; ingen bagud: intet siges;
   - lokale ændringer: "En nyere version af 3DHeat er tilgængelig (N ændringer), men denne kopi har lokale ændringer, så den opdateres ikke. Committ eller stash dem, og kør derefter git pull." – og den starter den version, der er der;
   - egne commits (`git rev-list --count @{u}..HEAD` er ikke 0): "En nyere version af 3DHeat er tilgængelig (N ændringer), men denne kopi har egne commits, som den nyeste version ikke har, så den opdateres ikke. Opdatér den med git pull." – og den starter den version, der er der;
   - ellers "En nyere version af 3DHeat er tilgængelig (N ændringer)." og spørgsmålet **Update now? [Y/N]**. `N`, eller intet svar i 60 sekunder, skriver "Not updated; starting the version you have." og starter den version, der er der. Ved `Y`: "Updating...", noterer om `package.json` eller `package-lock.json` ændrer sig, kører `git pull --ff-only` (skulle det stadig fejle – for eksempel netværket: "The update did not go through; starting the version you have."), derefter `git submodule update --init` (de fastlagte værktøjer, se [Vedligeholdelse af dokumentationen](maintaining.md#the-tools-under-exporters)), derefter `npm install`, når pakkefilerne ændrede sig, og `node_modules` findes, og "Updated."
3. Nægter at starte en server nummer to: når noget allerede lytter på port **5273**, siger den det og henviser til `restart.bat` / `stop.bat`.
4. Ved første kørsel (ingen `node_modules`) spørger den, før den henter afhængighederne (ca. 300 MB i `node_modules\`, intet systemvidt).
5. Starter udviklingsserveren på `127.0.0.1:5273` (`--strictPort`) og åbner browseren, når den er klar.

`restart.bat` stopper serveren (efter port) og kører `start.bat` igen, så den stiller det samme spørgsmål. `stop.bat` stopper blot serveren.

## Til udviklere {#for-developers}

### Mens den kører: opdateringsruten {#while-it-runs-the-update-route}

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
