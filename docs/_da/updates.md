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

1. **På siden.** Når en nyere version findes, vises en boks under navnet øverst i sidebjælken: "Der er en nyere version af 3DHeat". Klik på **Opdatér nu**. Siden genindlæses af sig selv, når det er færdigt. **Senere** skjuler boksen, til du genindlæser siden.
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
  (`git status --porcelain --untracked-files=no` er ikke tom) opdateres aldrig automatisk – nogens eget arbejde må ikke overskrives af en opdatering. Det får kun at vide, at en opdatering venter. Usporede filer (data, eksporter) tæller ikke som ændringer.
- **Ingen lokale commits**: et checkout med commits, opstrømsgrenen ikke har ("divergeret"), opdateres ikke – et fast-forward kan ikke hente det op, og sammenfletning er for `git pull` i hånden. Siden og `start.bat` siger det med de samme ord, og `start.bat` starter den version, der er der.
- **Kun fra siden selv**: udviklingsserverens opdateringsforespørgsel skal bære en brugerdefineret header og, når browseren sender en `Origin`, komme fra serverens egen vært (nedenfor).
- Kun et git-checkout med en opstrømsgren opdateres nogensinde; alt andet
  (en kopi uden `.git`, ingen git installeret, en statisk build) lades i fred og siger ingenting.

## Hvad start.bat gør {#what-startbat-does}

`start.bat` (dobbeltklik på den; vinduet er serveren) gør følgende, i rækkefølge:

1. Finder Node.js – på `PATH`, ellers i `%ProgramFiles%\nodejs`, `%ProgramFiles(x86)%\nodejs` eller `%LOCALAPPDATA%\Programs\nodejs` – og tilbyder at installere det med `winget install -e --id OpenJS.NodeJS.LTS`, når det mangler (spørges, Y/N; derefter skal vinduet åbnes igen, så Windows får den nye `PATH`).
2. **Opdateringer**, når git er installeret, og mappen har `.git`:
   - `git fetch --quiet` (ingen netværk eller ingen opstrøm: springes stille over);
   - tæller `git rev-list --count HEAD..@{u}`; ingen bagud: intet siges;
   - lokale ændringer: "A newer version of 3DHeat is available (N changes), but this copy has local changes, so it is not updated. Commit or stash them, then run git pull." – og den starter den version, der er der;
   - egne commits (`git rev-list --count @{u}..HEAD` er ikke 0): "A newer version of 3DHeat is available (N changes), but this copy has commits of its own that the newest version does not, so it is not updated. Update it with git pull." – og den starter den version, der er der;
   - ellers "A newer version of 3DHeat is available (N changes)." og spørgsmålet **Update now? [Y/N]**. `N`, eller intet svar i 60 sekunder, skriver "Not updated; starting the version you have." og starter den version, der er der. Ved `Y` skrives "Updating...", og den noterer, om `package.json` eller `package-lock.json` ændrer sig, kører `git pull --ff-only` (skulle det stadig fejle – for eksempel netværket: "The update did not go through; starting the version you have."), derefter `git submodule update --init` (de fastlagte værktøjer, se [Vedligeholdelse af dokumentationen](maintaining.md#the-tools-under-exporters)), derefter `npm install`, når pakkefilerne ændrede sig, og `node_modules` findes, og "Updated."
3. Nægter at starte en server nummer to: når noget allerede lytter på port **5273**, siger den det og henviser til `restart.bat` / `stop.bat`.
4. Ved første kørsel (ingen `node_modules`) spørger den, før den henter afhængighederne (ca. 300 MB i `node_modules\`, intet systemvidt).
5. Starter udviklingsserveren på `127.0.0.1:5273` (`--strictPort`) og åbner browseren, når den er klar.

`restart.bat` stopper serveren (efter port) og kører `start.bat` igen, så den stiller det samme spørgsmål. `stop.bat` stopper blot serveren.

## Til udviklere {#for-developers}

### Mens den kører: opdateringsruten {#while-it-runs-the-update-route}

Udviklingsserveren (Vite-pluginet `heat3d-self-update` i `vite.config.ts`) leverer `/__heat3d/update`. Den findes kun på udviklingsserveren – ikke i en statisk build og ikke i `vite preview`.

**`GET /__heat3d/update`** svarer, om checkout'et er bagud:

```json
{ "checkout": true, "upstream": "origin/main", "behind": 3, "ahead": 0, "dirty": false, "latest": "the newest commit's subject" }
```

- `checkout: false`, når mappen ikke er et git-checkout;
- den kører `git fetch --quiet` **højst hvert 30. minut** (forespørgsler derimellem svarer ud fra det, der sidst blev hentet);
- `behind` / `ahead` kommer fra `git rev-list --count HEAD..@{u}` / `@{u}..HEAD`, `dirty` fra `git status --porcelain --untracked-files=no`, `latest` er emnet for upstreamens nyeste commit;
- uden en upstream-branch: `upstream: null` og `behind: 0`.

**`POST /__heat3d/update/apply`** bringer checkout'et up to date:

1. Afvist med `403 { ok: false, reason: "forbidden" }`, medmindre forespørgslen har headeren `X-Heat3d-Update: 1`, og – når den medsender en `Origin` – værten i origin er den samme som forespørgslens `Host`. En formular fra et andet site kan ikke sende en egen header uden en CORS-preflight, og den giver serveren aldrig.
2. Intet at gøre (ikke et checkout, ingen upstream, ikke bagud): `{ ok: true, updated: false }`.
3. Lokale ændringer: `{ ok: false, reason: "dirty" }`; lokale commits: `{ ok: false, reason: "diverged" }`.
4. Ellers: noterer, hvilke filer der ændres (`git diff --name-only HEAD @{u}`), kører `git pull --ff-only` (2 min timeout), `git submodule update --init` (fejl ignoreres), `npm install`, når `package.json` eller `package-lock.json` er ændret (15 min timeout), og svarer `{ ok: true, updated: true, restart }`. `restart` forklarer, hvorfor den kørende server ikke kan hente opdateringen: `"dependencies"`, når de er installeret igen, `"config"`, når kun en `vite.config`-fil ændrede sig, `false`, når der ikke skal genstartes.
5. En fejlende git- eller npm-kommando svarer `{ ok: false, reason: "<fejlen, op til 300 tegn>" }`.

Svar er JSON med `Cache-Control: no-store`. Serveren lytter kun på `127.0.0.1`, så ruten kan ikke nås fra netværket.

### Meddelelsen på siden {#the-notice-in-the-page}

`UpdateBanner`, under navnet øverst i sidebjælken:

- Den spørger ruten **4 sekunder** efter, at siden er indlæst (ikke i de første sekunder: siden skal indlæse et datasæt og starte en GPU), og igen **hver 6. time**, så længe siden er åben.
- Den viser **intet**, når ruten ikke findes (en statisk build), mappen ikke er et checkout, eller intet er nyere – en besked ved hver start er en, folk lærer at ignorere.
- Bagud, uden lokale ændringer: "Der er en nyere version af 3DHeat (N ændringer, den nyeste: <emne>)." med **Opdatér nu** og **Senere** (*Senere* skjuler den, indtil siden genindlæses).
- Bagud, med lokale ændringer: den samme sætning og "Denne kopi har lokale ændringer, så den opdateres ikke automatisk; commit eller stash dem, og kør derefter git pull." – uden knap.
- **Opdatér nu** sender til `/apply` ("Opdaterer…"). Derefter:
  - "Opdateret. Siden genindlæses." – og den genindlæses 1,5 s senere (serveren leverer allerede de nye filer);
  - når afhængighederne blev installeret igen: "Opdateret. Afhængighederne er ændret: luk servervinduet og kør **restart.bat** for at gøre det færdigt.";
  - når kun serverindstillingerne ændrede sig: "Opdateret. Serverens indstillinger er ændret: luk servervinduet og kør **restart.bat** for at gøre det færdigt.";
  - alligevel intet at hente (`updated: false` – kopien er imens blevet opdateret, for eksempel af `start.bat`): "Intet at opdatere: denne kopi er allerede den nyeste version." – og ingen genindlæsning;
  - afvist: sætningen om lokale ændringer, eller "Denne kopi har egne commits, som den nyeste version ikke har; opdatér den med git pull.", eller "Opdateringen lykkedes ikke: <årsag>".
