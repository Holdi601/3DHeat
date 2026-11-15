---
title: "Aktualizácie"
nav_order: 21
lang: "sk"
source: "updates.md"
source_hash: "674c07a79c56"
translated: true
outdated: false
---

# Aktualizácie

Prehliadač vám povie, keď existuje novšia verzia, a aktualizuje sa sám len vtedy, keď poviete áno. Nič na vašom počítači sa nemení bez vašej odpovede.

## Aktualizácia prehliadača {#update-the-viewer}

1. **Na stránke.** Keď existuje novšia verzia, pod názvom hore na bočnom paneli sa objaví box: „Je dostupná novšia verzia 3DHeat“. Kliknite na **Aktualizovať teraz**. Stránka sa po dokončení sama znova načíta. **Neskôr** skryje box, kým stránku neobnovíte.
2. **Ak hovorí, aby ste spustili restart.bat**, zatvorte okno servera (čierne okno, ktoré otvoril `start.bat`) a dvakrát kliknite na `restart.bat`.
3. **Pri spustení prehliadača.** `start.bat` tiež kontroluje. Ak existuje novšia verzia, opýta sa **Aktualizovať teraz? [Y/N]**. Stlačte `Y` na aktualizáciu. Stlačte `N`, alebo počkajte 60 sekúnd bez odpovede, a spustí sa verzia, ktorú máte.

![Upozornenie na aktualizáciu s Aktualizovať teraz a Neskôr](../assets/img/en/updates-notice.webp)

Kópia s vašimi vlastnými zmenami sa nikdy nezaktualizuje za vás; box len hovorí, že čaká aktualizácia, a povie, aby ste zmeny potvrdili alebo odložili (commit alebo stash) a spustili `git pull`. Kópia, ktorá nebola nainštalovaná cez git (napríklad zip súbor), nezobrazí nič.

Ako kontrola funguje, krok za krokom:

```
stránka ---(po 4 s, potom každých 6 h)---> vývojový server ---> git fetch
   zaostáva?  nie -> nič sa nezobrazí
              áno -> vaše vlastné zmeny alebo commity?  áno -> len to oznámi
                                                       nie -> [Aktualizovať teraz] -> git pull
                                                              -> obnovenie, alebo „spustite restart.bat“
```

## Bezpečnostné pravidlá {#the-safety-rules}

- **Iba posun vpred** (`git pull --ff-only`): aktualizácia nikdy nezlučuje,
  nerebázuje ani nič neprepisuje.
- **Žiadne lokálne zmeny**: kópia s necommitnutými zmenami v sledovaných
  súboroch (`git status --porcelain --untracked-files=no` nie je prázdne) sa
  nikdy nezaktualizuje automaticky - cudziu prácu nesmie prepísať aktualizácia.
  Len sa jej povie, že čaká aktualizácia. Nesledované súbory (dáta, exporty)
  sa za zmeny nepočítajú.
- **Žiadne lokálne commity**: kópia s commitmi, ktoré nadradená vetva nemá
  („rozišla sa“), sa neaktualizuje - posun vpred ju nemôže dotiahnuť a
  zlučovanie patrí pre `git pull` ručne. Stránka aj `start.bat` to hovoria
  rovnakými slovami a `start.bat` spustí verziu, ktorú tam máte.
- **Len zo samotnej stránky**: žiadosť vývojového servera o aktualizáciu musí
  niesť vlastnú hlavičku a, ak prehliadač posiela `Origin`, musí prísť z vlastného
  hostiteľa servera (nižšie).
- Aktualizuje sa len git kópia s nadradenou vetvou; čokoľvek iné (kópia bez
  `.git`, bez nainštalovaného gitu, statický build) sa nechá na pokoji a nič
  nehlási.

## Čo robí start.bat {#what-startbat-does}

`start.bat` (dvojklik; okno je server) robí, v poradí:

1. Nájde Node.js - v `PATH`, inak v `%ProgramFiles%\nodejs`,
   `%ProgramFiles(x86)%\nodejs` alebo `%LOCALAPPDATA%\Programs\nodejs` - a keď
   chýba, ponúkne inštaláciu príkazom `winget install -e --id OpenJS.NodeJS.LTS`
   (opýta sa, Y/N; potom treba okno znova otvoriť, aby Windows načítal nový `PATH`).
2. **Aktualizácie**, keď je nainštalovaný git a priečinok má `.git`:
   - `git fetch --quiet` (bez siete alebo nadradenej vetvy: ticho preskočené);
   - spočíta `git rev-list --count HEAD..@{u}`; nič nezaostáva: nič sa nepovie;
   - lokálne zmeny: „Je dostupná novšia verzia 3DHeat (N zmien), ale táto kópia má lokálne zmeny, takže sa neaktualizuje. Potvrďte ich alebo ich odložte, potom spustite git pull.“ - a spustí verziu, ktorú tam máte;
   - vlastné commity (`git rev-list --count @{u}..HEAD` nie je 0): „Je dostupná novšia verzia 3DHeat (N zmien), ale táto kópia má vlastné commity, ktoré najnovšia verzia nemá, takže sa neaktualizuje. Aktualizujte ju príkazom git pull.“ - a spustí verziu, ktorú tam máte;
   - inak „Je dostupná novšia verzia 3DHeat (N zmien).“ a otázka **Aktualizovať teraz? [Y/N]**. `N`, alebo žiadna odpoveď 60 sekúnd, vypíše „Neaktualizované; spúšťam verziu, ktorú máte.“ a spustí verziu, ktorú tam máte. Pri `Y`: „Aktualizujem...“, oznámi, či sa menia `package.json` alebo `package-lock.json`,
     spustí `git pull --ff-only` (ak by to stále zlyhalo - napríklad sieť:
     „Aktualizácia neprebehla; spúšťam verziu, ktorú máte.“), potom `git submodule update --init`
     (pripnuté nástroje, pozri [Údržba dokumentácie](maintaining.md#the-tools-under-exporters)), potom `npm install`, keď sa balíkové súbory zmenili a existuje `node_modules`, a „Aktualizované.“
3. Odmietne spustiť druhý server: keď na porte **5273** už niečo počúva, povie to a odkáže na `restart.bat` / `stop.bat`.
4. Pri prvom spustení (bez `node_modules`) sa pred stiahnutím závislostí (asi 300 MB do `node_modules\`, nič systémovo) opýta.
5. Spustí vývojový server na `127.0.0.1:5273` (`--strictPort`) a keď je pripravený, otvorí prehliadač.

`restart.bat` zastaví server (podľa portu) a spustí `start.bat` znova, takže sa opýta na to isté. `stop.bat` len zastaví.

## Pre vývojárov {#for-developers}

### Počas behu: trasa aktualizácie {#while-it-runs-the-update-route}

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

### Oznámenie na stránke {#the-notice-in-the-page}

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
