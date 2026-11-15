---
title: "Oppdateringer"
nav_order: 21
lang: "no"
source: "updates.md"
source_hash: "674c07a79c56"
translated: true
outdated: false
---

# Oppdateringer

Visningsprogrammet sier fra når en nyere versjon finnes, og oppdaterer seg selv bare når du sier ja. Ingenting endres på datamaskinen din uten svaret ditt.

## Oppdater visningsprogrammet {#update-the-viewer}

1. **I siden.** Når en nyere versjon finnes, vises en boks under navnet øverst i sidepanelet: «En nyere versjon av 3DHeat er tilgjengelig». Klikk **Oppdater nå**. Siden laster seg selv på nytt når det er ferdig. **Senere** skjuler boksen til du laster siden på nytt.
2. **Hvis den sier å kjøre restart.bat**, lukk servervinduet (det svarte vinduet `start.bat` åpnet), og dobbeltklikk `restart.bat`.
3. **Når du starter visningsprogrammet.** `start.bat` sjekker også. Finnes en nyere versjon, spør den **Oppdater nå? [Y/N]**. Trykk `Y` for å oppdatere. Trykk `N`, eller vent 60 sekunder uten svar, for å starte versjonen du har.

![Oppdateringsvarselet med Oppdater nå og Senere](../assets/img/no/updates-notice.webp)

En kopi med egne endringer oppdateres aldri for deg; boksen forteller bare at en oppdatering venter, og sier at du skal committe eller stashe endringene og kjøre `git pull`. En kopi som ikke er installert med git (for eksempel en zip-fil) viser ingenting.

Slik fungerer sjekken, steg for steg:

```
side ---(etter 4 s, deretter hver 6. t)---> utviklingsserver ---> git fetch
   bak?  nei  -> ingenting vises
         ja   -> egne endringer eller commits?  ja  -> bare si fra
                                                nei -> [Oppdater nå] -> git pull
                                                        -> last på nytt, eller "kjør restart.bat"
```

## Sikkerhetsreglene {#the-safety-rules}

- **Bare fast-forward** (`git pull --ff-only`): en oppdatering slår aldri sammen, rebaser eller skriver om noe.
- **Ingen lokale endringer**: en kopi med ucommittede endringer i sporede filer (`git status --porcelain --untracked-files=no` er ikke tom) oppdateres aldri automatisk – noens eget arbeid er ikke en oppdatering sin å overskrive. Den får bare vite at en oppdatering venter. Usporede filer (data, eksporter) teller ikke som endringer.
- **Ingen lokale commits**: en kopi med commits som oppstrøms ikke har («divergert») oppdateres ikke – en fast-forward kan ikke ta den opp, og sammenslåing er for `git pull` for hånd. Siden og `start.bat` sier det med samme ord, og `start.bat` starter versjonen som finnes der.
- **Bare fra selve siden**: utviklingsserverens oppdateringsforespørsel må ha en egen header, og når nettleseren sender en `Origin`, må den komme fra serverens egen vert (se under).
- Bare en git-kopi med en oppstrømsgren oppdateres noen gang; alt annet (en kopi uten `.git`, uten git installert, en statisk bygg) rører man ikke, og ingenting sies.

## Hva start.bat gjør {#what-startbat-does}

`start.bat` (dobbeltklikk den; vinduet er serveren) gjør, i rekkefølge:

1. Finner Node.js – på `PATH`, ellers i `%ProgramFiles%\nodejs`, `%ProgramFiles(x86)%\nodejs` eller `%LOCALAPPDATA%\Programs\nodejs` – og tilbyr å installere den med `winget install -e --id OpenJS.NodeJS.LTS` når den mangler (spørsmål, Y/N; deretter må vinduet åpnes på nytt, så Windows tar med seg den nye `PATH`).
2. **Oppdateringer**, når git er installert og mappen har `.git`:
   - `git fetch --quiet` (ingen nettverk eller ingen oppstrøms: hoppes over stille);
   - teller `git rev-list --count HEAD..@{u}`; ingenting bak: ingenting sies;
   - lokale endringer: «En nyere versjon av 3DHeat er tilgjengelig (N endringer), men denne kopien har lokale endringer, så den oppdateres ikke. Committ eller stash dem, og kjør deretter git pull.» – og den starter versjonen som finnes der;
   - egne commits (`git rev-list --count @{u}..HEAD` er ikke 0): «En nyere versjon av 3DHeat er tilgjengelig (N endringer), men denne kopien har egne commits som den nyeste versjonen ikke har, så den oppdateres ikke. Oppdater den med git pull.» – og den starter versjonen som finnes der;
   - ellers «En nyere versjon av 3DHeat er tilgjengelig (N endringer).» og spørsmålet **Oppdater nå? [Y/N]**. `N`, eller intet svar på 60 sekunder, skriver «Ikke oppdatert; starter versjonen du har.» og starter versjonen som finnes der. Ved `J`: «Oppdaterer...», sier om `package.json` eller `package-lock.json` endres, kjører `git pull --ff-only` (skulle det fortsatt mislykkes – nettverket, for eksempel: «Oppdateringen gikk ikke igjennom; starter versjonen du har.»), deretter `git submodule update --init` (de festede verktøyene, se [Vedlikehold av dokumentasjonen](maintaining.md#the-tools-under-exporters)), og deretter `npm install` når pakkefilene endret seg og `node_modules` finnes, og «Oppdatert.»
3. Nekter å starte en andre server: når noe allerede lytter på port **5273**, sier den det og peker på `restart.bat` / `stop.bat`.
4. Ved første kjøring (ingen `node_modules`) spør den før avhengighetene lastes ned (rundt 300 MB til `node_modules\`, ingenting systemomfattende).
5. Starter utviklingsserveren på `127.0.0.1:5273` (`--strictPort`) og åpner nettleseren når den er klar.

`restart.bat` stopper serveren (etter port) og kjører `start.bat` på nytt, så den stiller det samme spørsmålet. `stop.bat` stopper bare.

## For utviklere {#for-developers}

### Mens den kjører: oppdateringsruten {#while-it-runs-the-update-route}

Utviklingsserveren (Vite-plugin-en `heat3d-self-update` i `vite.config.ts`) serverer `/__heat3d/update`. Den finnes bare på utviklingsserveren – ikke i en statisk bygg og ikke i `vite preview`.

**`GET /__heat3d/update`** svarer på om kopien er bak:

```json
{ "checkout": true, "upstream": "origin/main", "behind": 3, "ahead": 0, "dirty": false, "latest": "den nyeste commitens emne" }
```

- `checkout: false` når mappen ikke er en git-kopi;
- den kjører `git fetch --quiet` **høyst hvert 30. minutt** (forespørsler i mellomtiden svarer fra det som sist ble hentet);
- `behind` / `ahead` fra `git rev-list --count HEAD..@{u}` / `@{u}..HEAD`, `dirty` fra `git status --porcelain --untracked-files=no`, `latest` emnet til oppstrøms' nyeste commit;
- uten en oppstrømsgren: `upstream: null` og `behind: 0`.

**`POST /__heat3d/update/apply`** bringer kopien opp til dato:

1. Avvist med `403 { ok: false, reason: "forbidden" }` med mindre forespørselen har headeren `X-Heat3d-Update: 1` og, når den har en `Origin`, at den origins vert er forespørselens `Host`. Et cross-site-skjema kan ikke sende en egen header uten en CORS-preflight, som denne serveren aldri gir.
2. Ingenting å gjøre (ikke en kopi, ingen oppstrøms, ikke bak): `{ ok: true, updated: false }`.
3. Lokale endringer: `{ ok: false, reason: "dirty" }`; lokale commits: `{ ok: false, reason: "diverged" }`.
4. Ellers: noterer filene som endres (`git diff --name-only HEAD @{u}`), `git pull --ff-only` (2 min tidsavbrudd), `git submodule update --init` (feil ignoreres), `npm install` når `package.json` eller `package-lock.json` endret seg (15 min tidsavbrudd), og svarer `{ ok: true, updated: true, restart }` – `restart` sier hvorfor den kjørende serveren ikke kan ta imot oppdateringen: `"dependencies"` når de ble installert på nytt, `"config"` når bare en `vite.config`-fil endret seg, `false` når ingenting krever omstart.
5. En mislykket git- eller npm-kommando svarer `{ ok: false, reason: "<feilen, opptil 300 tegn>" }`.

Svarene er JSON med `Cache-Control: no-store`. Serveren lytter bare på `127.0.0.1`, så ruten kan ikke nås fra nettverket.

### Varselet i siden {#the-notice-in-the-page}

`UpdateBanner`, under navnet øverst i sidepanelet:

- Den spør ruten **4 sekunder** etter at siden er lastet (ikke i de første sekundene: siden har et datasett å laste og en GPU å starte) og igjen **hver 6. time** så lenge siden er åpen.
- Den viser **ingenting** når ruten ikke finnes (en statisk bygg), mappen ikke er en kopi, eller ingenting er nyere – et varsel ved hver start er noe folk lærer seg å ignorere.
- Bak, uten lokale endringer: «En nyere versjon av 3DHeat er tilgjengelig (N endringer, den nyeste: <emne>).» med **Oppdater nå** og **Senere** (*Senere* skjuler den til siden lastes på nytt).
- Bak, med lokale endringer: den samme setningen og «Denne kopien har lokale endringer, så den oppdateres ikke automatisk; committ eller stash dem, og kjør deretter git pull.» – ingen knapp.
- **Oppdater nå** sender til `/apply` («Oppdaterer...»). Deretter:
  - «Oppdatert. Siden laster på nytt.» – og den laster seg på nytt 1,5 s senere (serveren serverer allerede de nye filene);
  - når avhengighetene ble installert på nytt: «Oppdatert. Avhengighetene endret seg: lukk servervinduet og kjør **restart.bat** for å fullføre.»;
  - når bare serverinnstillingene endret seg: «Oppdatert. Serverinnstillingene endret seg: lukk servervinduet og kjør **restart.bat** for å fullføre.»;
  - ingenting å hente likevel (`updated: false` – kopien ble oppdatert i mellomtiden, for eksempel av `start.bat`): «Ingenting å oppdatere: denne kopien er allerede den nyeste versjonen.» – og ingen omlasting;
  - avvist: setningen om *dirty*, eller «Denne kopien har egne commits som den nyeste versjonen ikke har; oppdater den med git pull.», eller «Oppdateringen gikk ikke igjennom: <årsak>».
