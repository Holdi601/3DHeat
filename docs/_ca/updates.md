---
title: "Actualitzacions"
nav_order: 21
lang: "ca"
source: "updates.md"
source_hash: "674c07a79c56"
translated: true
outdated: false
---

# Actualitzacions

El visor et diu quan existeix una versió més nova, i només s'actualitza quan tu ho dius. Res no es canvia al teu ordinador sense la teva resposta.

## Actualitza el visor {#update-the-viewer}

1. **A la pàgina.** Quan existeix una versió més nova, apareix una caixa sota el nom a la part superior de la barra lateral: «Hi ha una versió nova de 3DHeat disponible». Fes clic a **Actualitza ara**. La pàgina es recarrega sola quan acaba. **Més tard** amaga la caixa fins que tornis a carregar la pàgina.
2. **Si diu que executis restart.bat**, tanca la finestra del servidor (la finestra negra que va obrir `start.bat`) i fes doble clic a `restart.bat`.
3. **En iniciar el visor.** `start.bat` també ho comprova. Si existeix una versió més nova, pregunta **Update now? [Y/N]**. Prem `Y` per actualitzar. Prem `N`, o espera 60 segons sense respondre, per iniciar la versió que tens.

![L'avís d'actualització amb Actualitza ara i Més tard](../assets/img/en/updates-notice.webp)

Una còpia amb canvis propis mai no s'actualitza per tu; la caixa només diu que hi ha una actualització esperant, i indica que has de confirmar o guardar els teus canvis i executar `git pull`. Una còpia que no s'ha instal·lat amb git (un fitxer zip, per exemple) no mostra res.

Com funciona la comprovació, pas a pas:

```
pàgina ---(després de 4 s, i després cada 6 h)---> servidor de desenvolupament ---> git fetch
   per darrere?  no  -> no es mostra res
                 sí  -> canvis o confirmacions propis?  sí  -> només t'ho diu
                                                         no  -> [Actualitza ara] -> git pull
                                                                -> recàrrega, o "executa restart.bat"
```

## Les regles de seguretat {#the-safety-rules}

- **Només avanç ràpid** (`git pull --ff-only`): una actualització mai no fusiona, no reescriu la història i no modifica res.
- **Sense canvis locals**: una còpia amb canvis sense confirmar en fitxers seguits (`git status --porcelain --untracked-files=no` no buit) mai no s'actualitza automàticament -el treball propi d'algú no és cosa que una actualització hagi de sobreescriure. Només se li diu que hi ha una actualització esperant. Els fitxers no seguits (dades, exportacions) no compten com a canvis.
- **Sense confirmacions locals**: una còpia amb confirmacions que la font no té («divergent») no s'actualitza -un avanç ràpid no la pot posar al dia, i la fusió és per a `git pull` fet a mà. La pàgina i `start.bat` ho diuen amb les mateixes paraules, i `start.bat` inicia la versió que hi ha.
- **Només des de la mateixa pàgina**: la petició d'actualització del servidor de desenvolupament ha de portar una capçalera pròpia i, quan el navegador envia un `Origin`, venir del mateix host del servidor (més avall).
- Només s'actualitza mai un checkout de git amb una branca de font; qualsevol altra cosa (una còpia sense `.git`, sense git instal·lat, una compilació estàtica) es deixa en pau i no diu res.

## Què fa start.bat {#what-startbat-does}

`start.bat` (fes-hi doble clic; la finestra és el servidor) fa, en ordre:

1. Troba Node.js -a `PATH`, si no a `%ProgramFiles%\nodejs`, `%ProgramFiles(x86)%\nodejs` o `%LOCALAPPDATA%\Programs\nodejs`- i ofereix instal·lar-lo amb `winget install -e --id OpenJS.NodeJS.LTS` quan no hi és (pregunta, Y/N; després cal tornar a obrir la finestra perquè Windows agafi el nou `PATH`).
2. **Actualitzacions**, quan git està instal·lat i la carpeta té `.git`:
   - `git fetch --quiet` (sense xarxa o sense font: se salta en silenci);
   - compta `git rev-list --count HEAD..@{u}`; si no està per darrere: no diu res;
   - canvis locals: «Hi ha una versió nova de 3DHeat disponible (N canvis), però aquesta còpia té canvis locals, així que no s'actualitza. Confirma'ls o guarda'ls, i després executa git pull.» -i inicia la versió que hi ha;
   - confirmacions pròpies (`git rev-list --count @{u}..HEAD` no 0): «Hi ha una versió nova de 3DHeat disponible (N canvis), però aquesta còpia té confirmacions pròpies que la versió més nova no té, així que no s'actualitza. Actualitza-la amb git pull.» -i inicia la versió que hi ha;
   - si no, «Hi ha una versió nova de 3DHeat disponible (N canvis).» i la pregunta **Update now? [Y/N]**. `N`, o cap resposta en 60 segons, imprimeix «No actualitzat; s'inicia la versió que tens.» i inicia la versió que hi ha. Amb `Y`: «S'està actualitzant...», indica si canvien `package.json` o `package-lock.json`, executa `git pull --ff-only` (si encara falla -per la xarxa, per exemple-: «L'actualització no s'ha completat; s'inicia la versió que tens.»), després `git submodule update --init` (les eines fixades, vegeu [Manteniment de la documentació](maintaining.md#the-tools-under-exporters)), després `npm install` quan han canviat els fitxers del paquet i existeix `node_modules`, i «Actualitzat.»
3. Es nega a iniciar un segon servidor: quan ja hi ha alguna cosa escoltant al port **5273** ho diu i apunta a `restart.bat` / `stop.bat`.
4. En la primera execució (sense `node_modules`), pregunta abans de baixar les dependències (uns 300 MB dins de `node_modules\`, res de sistema).
5. Inicia el servidor de desenvolupament a `127.0.0.1:5273` (`--strictPort`) i obre el navegador quan està llest.

`restart.bat` atura el servidor (pel port) i torna a executar `start.bat`, així que fa la mateixa pregunta. `stop.bat` només l'atura.

## Per a desenvolupadors {#for-developers}

### Mentre s'executa: la ruta d'actualització {#while-it-runs-the-update-route}

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
