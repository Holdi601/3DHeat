---
title: "Actualizaciones"
nav_order: 21
lang: "es"
source: "updates.md"
source_hash: "674c07a79c56"
translated: true
outdated: false
---

# Actualizaciones

El visor te avisa cuando existe una versión más nueva, y se actualiza solo cuando tú lo confirmas. Nada se cambia en tu equipo sin tu respuesta.

## Actualizar el visor {#update-the-viewer}

1. **En la página.** Cuando existe una versión más nueva, aparece un cuadro debajo del nombre, en la parte superior de la barra lateral: «Hay una versión más nueva de 3DHeat disponible». Pulsa **Actualizar ahora**. La página se recarga sola al terminar. **Más tarde** oculta el cuadro hasta que recargues la página.
2. **Si dice que ejecutes restart.bat**, cierra la ventana del servidor (la ventana negra que abrió `start.bat`) y haz doble clic en `restart.bat`.
3. **Al iniciar el visor.** `start.bat` también comprueba. Si existe una versión más nueva pregunta **¿Actualizar ahora? [S/N]**. Pulsa `S` para actualizar. Pulsa `N`, o espera 60 segundos sin responder, para iniciar la versión que tienes.

![El aviso de actualización con Actualizar ahora y Más tarde](../assets/img/en/updates-notice.webp)

Una copia con cambios propios nunca se actualiza por ti; el cuadro solo indica que hay una actualización esperando, y pide confirmar o guardar tus cambios (commit o stash) y ejecutar `git pull`. Una copia que no se instaló con git (un archivo zip, por ejemplo) no muestra nada.

Cómo funciona la comprobación, paso a paso:

```
página ---(tras 4 s, y luego cada 6 h)---> servidor de desarrollo ---> git fetch
   ¿atrasada?  no  -> no se muestra nada
               sí  -> ¿tus cambios o commits propios?  sí -> solo te avisa
                                                       no -> [Actualizar ahora] -> git pull
                                                             -> recargar, o "ejecuta restart.bat"
```

## Las reglas de seguridad {#the-safety-rules}

- **Solo avance rápido** (`git pull --ff-only`): una actualización nunca fusiona, rebasa ni reescribe nada.
- **Sin cambios locales**: una copia con cambios sin confirmar en archivos controlados (`git status --porcelain --untracked-files=no` no vacío) nunca se actualiza automáticamente - el trabajo de alguien no es algo que una actualización deba sobrescribir. Solo se le indica que hay una actualización esperando. Los archivos sin controlar (datos, exportaciones) no cuentan como cambios.
- **Sin commits locales**: una copia con commits que el origen no tiene («divergida») no se actualiza - un avance rápido no puede llevarla, y fusionar es tarea de `git pull` a mano. La página y `start.bat` lo dicen con las mismas palabras, y `start.bat` inicia la versión que hay allí.
- **Solo desde la propia página**: la petición de actualización del servidor de desarrollo debe llevar una cabecera personalizada y, cuando el navegador envía un `Origin`, venir del propio host del servidor (véase abajo).
- Solo se actualiza una copia de git con una rama de origen; cualquier otra cosa (una copia sin `.git`, sin git instalado, una versión estática) se deja en paz y no dice nada.

## Qué hace start.bat {#what-startbat-does}

`start.bat` (haz doble clic; la ventana es el servidor) hace, en orden:

1. Busca Node.js - en `PATH`, o en `%ProgramFiles%\nodejs`, `%ProgramFiles(x86)%\nodejs` o `%LOCALAPPDATA%\Programs\nodejs` - y ofrece instalarlo con `winget install -e --id OpenJS.NodeJS.LTS` cuando falta (se pregunta, S/N; después hay que reabrir la ventana para que Windows tome el nuevo `PATH`).
2. **Actualizaciones**, cuando git está instalado y la carpeta tiene `.git`:
   - `git fetch --quiet` (sin red o sin origen: se omite en silencio);
   - cuenta `git rev-list --count HEAD..@{u}`; nada atrasado: no dice nada;
   - cambios locales: «Hay una versión más nueva de 3DHeat disponible (N cambios), pero esta copia tiene cambios locales, así que no se actualiza. Confírmalos o guárdalos (stash) y después ejecuta git pull.» - y arranca la versión que hay;
   - commits propios (`git rev-list --count @{u}..HEAD` distinto de 0): «Hay una versión más nueva de 3DHeat disponible (N cambios), pero esta copia tiene commits propios que la versión más nueva no tiene, así que no se actualiza. Actualízala con git pull.» - y arranca la versión que hay;
   - en otro caso, «Hay una versión más nueva de 3DHeat disponible (N cambios).» y la pregunta **¿Actualizar ahora? [S/N]**. `N`, o no responder en 60 segundos, imprime «No actualizado; iniciando la versión que tienes.» y arranca la versión que hay. Con `S`: «Actualizando...», indica si cambian `package.json` o `package-lock.json`, ejecuta `git pull --ff-only` (si aun así falla - por la red, por ejemplo: «La actualización no se completó; iniciando la versión que tienes.»), después `git submodule update --init` (las herramientas fijadas, véase [Mantenimiento de la documentación](maintaining.md#the-tools-under-exporters)), luego `npm install` cuando cambian los archivos del paquete y existe `node_modules`, y «Actualizado.»
3. Se niega a iniciar un segundo servidor: cuando algo ya escucha en el puerto **5273** lo indica y remite a `restart.bat` / `stop.bat`.
4. En la primera ejecución (sin `node_modules`), pregunta antes de descargar las dependencias (unos 300 MB en `node_modules\`, nada en todo el sistema).
5. Inicia el servidor de desarrollo en `127.0.0.1:5273` (`--strictPort`) y abre el navegador cuando está listo.

`restart.bat` detiene el servidor (por puerto) y vuelve a ejecutar `start.bat`, así que hace la misma pregunta. `stop.bat` solo lo detiene.

## Para desarrolladores {#for-developers}

### Mientras se ejecuta: la ruta de actualización {#while-it-runs-the-update-route}

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
