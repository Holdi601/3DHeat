---
title: "Actualizaciones"
nav_order: 18
lang: "es"
source: "updates.md"
source_hash: "0d33b694a31d"
translated: true
outdated: false
---

# Actualizaciones

El visor te avisa cuando existe una versión más nueva, y solo se actualiza cuando tú lo dices.
No se cambia nada en tu ordenador sin tu respuesta.

## Actualizar el visor {#update-the-viewer}

1. **En la página.** Cuando existe una versión más nueva, aparece un recuadro bajo el nombre, arriba
   de la barra lateral: "Hay una versión nueva de 3DHeat disponible". Haz clic en **Actualizar ahora**.
   La página se recarga sola cuando termina. **Más tarde** oculta el recuadro hasta que recargues la página.
2. **Si dice que ejecutes restart.bat**, cierra la ventana del servidor (la ventana negra que abrió
   `start.bat`) y haz doble clic en `restart.bat`.
3. **Al iniciar el visor.** `start.bat` también comprueba. Si existe una versión más nueva, pregunta
   **¿Actualizar ahora? [S/N]**. Pulsa `S` para actualizar. Pulsa `N`, o espera 60 segundos sin responder,
   para iniciar la versión que tienes.

![El aviso de actualización con Actualizar ahora y Más tarde](../assets/img/es/updates-notice.webp)

Una copia con cambios propios nunca se actualiza por ti; el recuadro solo te dice que hay una
actualización esperando, y pide confirmar o guardar temporalmente (stash) tus cambios y ejecutar `git pull`. Una
copia que no se instaló con git (un archivo zip, por ejemplo) no muestra nada.

Cómo funciona la comprobación, paso a paso:

```
página ---(tras 4 s, y luego cada 6 h)---> servidor de desarrollo ---> git fetch
   ¿por detrás?  no  -> no se muestra nada
                 sí  -> ¿tus cambios o confirmaciones propias?  sí -> solo te avisa
                                                                no -> [Actualizar ahora] -> git pull
                                                                       -> recarga, o "ejecuta restart.bat"
```

## Las reglas de seguridad {#the-safety-rules}

- **Solo avance rápido** (`git pull --ff-only`): una actualización nunca fusiona, rebasa ni reescribe nada.
- **Sin cambios locales**: una copia con cambios sin confirmar en archivos controlados (`git status --porcelain
  --untracked-files=no` no vacío) nunca se actualiza automáticamente - el trabajo propio de alguien no es algo
  que una actualización deba sobrescribir. Solo se avisa de que hay una actualización esperando. Los archivos sin
  controlar (datos, exportaciones) no cuentan como cambios.
- **Sin confirmaciones locales**: una copia con confirmaciones que el origen no tiene ("divergida") no se
  actualiza - un avance rápido no puede llevarla hasta allí, y fusionar es cosa de `git pull` a mano. La página y
  `start.bat` lo dicen con las mismas palabras, y `start.bat` inicia la versión que hay allí.
- **Solo desde la propia página**: la petición de actualización del servidor de desarrollo debe llevar una cabecera
  personalizada y, cuando el navegador envía un `Origin`, venir del propio host del servidor (abajo).
- Solo se actualiza una copia de git con una rama de origen; cualquier otra cosa (una copia sin `.git`, sin git
  instalado, una compilación estática) se deja en paz y no dice nada.

## Qué hace start.bat {#what-startbat-does}

`start.bat` (haz doble clic; la ventana es el servidor) hace, en orden:

1. Busca Node.js - en `PATH`, si no en `%ProgramFiles%\nodejs`, `%ProgramFiles(x86)%\nodejs` o
   `%LOCALAPPDATA%\Programs\nodejs` - y ofrece instalarlo con `winget install -e --id OpenJS.NodeJS.LTS` cuando
   falta (pregunta S/N; después hay que volver a abrir la ventana para que Windows lea el nuevo `PATH`).
2. **Actualizaciones**, cuando git está instalado y la carpeta tiene `.git`:
   - `git fetch --quiet` (sin red o sin origen: se omite en silencio);
   - cuenta `git rev-list --count HEAD..@{u}`; si no hay nada por detrás: no dice nada;
   - cambios locales: "Hay una versión nueva de 3DHeat disponible (N cambios), pero esta copia tiene cambios
     locales, así que no se actualiza. Confírmalos o guárdalos temporalmente (stash), y luego ejecuta git pull." - y se inicia
     la versión que hay;
   - confirmaciones propias (`git rev-list --count @{u}..HEAD` distinto de 0): "Hay una versión nueva de 3DHeat
     disponible (N cambios), pero esta copia tiene confirmaciones propias que la versión más nueva no tiene, así que
     no se actualiza. Actualízala con git pull." - y se inicia la versión que hay;
   - si no, "Hay una versión nueva de 3DHeat disponible (N cambios)." y la pregunta **¿Actualizar ahora? [S/N]**. `N`,
     o no responder durante 60 segundos, imprime "No actualizado; iniciando la versión que tienes." y arranca la versión
     que hay. Con `S`: "Actualizando...", indica si cambian `package.json` o `package-lock.json`, ejecuta
     `git pull --ff-only` (si aun así falla - por la red, por ejemplo -: "La actualización no se completó; iniciando la
     versión que tienes."), luego `git submodule update --init` (las herramientas fijadas, véase [Mantener la
     documentación](maintaining.md#the-tools-under-exporters)), después `npm install` cuando cambiaron los archivos del
     paquete y existe `node_modules`, y "Actualizado.".
3. Se niega a iniciar un segundo servidor: cuando algo ya escucha en el puerto **5273**, lo dice y señala
   `restart.bat` / `stop.bat`.
4. En la primera ejecución (sin `node_modules`), pregunta antes de descargar las dependencias (unos 300 MB en
   `node_modules\`, nada en todo el sistema).
5. Inicia el servidor de desarrollo en `127.0.0.1:5273` (`--strictPort`) y abre el navegador cuando está listo.

`restart.bat` detiene el servidor (por puerto) y vuelve a ejecutar `start.bat`, así que hace la misma pregunta.
`stop.bat` solo lo detiene.

## Para desarrolladores {#for-developers}

### Mientras funciona: la ruta de actualización {#while-it-runs-the-update-route}

El servidor de desarrollo (el plugin de Vite `heat3d-self-update` en `vite.config.ts`) sirve
`/__heat3d/update`. Solo existe en el servidor de desarrollo - no en una compilación estática ni en `vite preview`.

**`GET /__heat3d/update`** responde si la copia va por detrás:

```json
{ "checkout": true, "upstream": "origin/main", "behind": 3, "ahead": 0, "dirty": false, "latest": "el asunto de la confirmación más nueva" }
```

- `checkout: false` cuando la carpeta no es una copia de git;
- ejecuta `git fetch --quiet` **como máximo cada 30 minutos** (las consultas en medio responden con lo último que se
  trajo);
- `behind` / `ahead` vienen de `git rev-list --count HEAD..@{u}` / `@{u}..HEAD`, `dirty` de `git status --porcelain
  --untracked-files=no`, `latest` es el asunto de la confirmación más nueva del origen;
- sin rama de origen, `upstream: null` y `behind: 0`.

**`POST /__heat3d/update/apply`** pone la copia al día:

1. Se rechaza con `403 { ok: false, reason: "forbidden" }` salvo que la petición lleve la cabecera
   `X-Heat3d-Update: 1` y, cuando trae un `Origin`, que el host de ese origen sea el `Host` de la petición. Un
   formulario de otro sitio no puede enviar una cabecera personalizada sin una comprobación previa de CORS, que este
   servidor nunca concede.
2. Nada que hacer (no es una copia, no hay origen, no va por detrás): `{ ok: true, updated: false }`.
3. Cambios locales: `{ ok: false, reason: "dirty" }`; confirmaciones locales: `{ ok: false, reason: "diverged" }`.
4. Si no: anota los archivos que cambian (`git diff --name-only HEAD @{u}`), `git pull --ff-only` (límite de 2 min),
   `git submodule update --init` (los fallos se ignoran), `npm install` cuando cambiaron `package.json` o
   `package-lock.json` (límite de 15 min), y responde `{ ok: true, updated: true, restart }` - `restart` indica por qué
   el servidor en marcha no puede recoger la actualización: `"dependencies"` cuando se reinstalaron, `"config"` cuando
   solo cambió un archivo `vite.config`, `false` cuando no hace falta reiniciar.
5. Un comando git o npm que falla responde `{ ok: false, reason: "<el error, hasta 300 caracteres>" }`.

Las respuestas son JSON con `Cache-Control: no-store`. El servidor escucha solo en `127.0.0.1`, así que la ruta no
es accesible desde la red.

### El aviso en la página {#the-notice-in-the-page}

`UpdateBanner`, bajo el nombre arriba de la barra lateral:

- Consulta la ruta **4 segundos** después de cargar la página (no en los primeros segundos: la página tiene un conjunto
  de datos que cargar y una GPU que arrancar) y otra vez **cada 6 horas** mientras la página permanezca abierta.
- No muestra **nada** cuando no existe la ruta (una compilación estática), la carpeta no es una copia, o nada es más
  nuevo - un aviso en cada inicio es algo que la gente aprende a ignorar.
- Por detrás, sin cambios locales: "Hay una versión nueva de 3DHeat disponible (N cambios, la más nueva: <asunto>)." con
  **Actualizar ahora** y **Más tarde** (*Más tarde* lo oculta hasta recargar la página).
- Por detrás, con cambios locales: la misma frase y "Esta copia tiene cambios locales, así que no se actualiza
  automáticamente; confírmalos o guárdalos temporalmente (stash), y luego ejecuta git pull." - sin botón.
- **Actualizar ahora** envía una petición a `/apply` ("Actualizando..."). Después:
  - "Actualizado. La página se recarga." - y recarga 1,5 s más tarde (el servidor ya sirve los archivos nuevos);
  - cuando se reinstalaron las dependencias: "Actualizado. Sus dependencias cambiaron: cierra la ventana del servidor y
    ejecuta **restart.bat** para terminar.";
  - cuando solo cambiaron los ajustes del servidor: "Actualizado. Sus ajustes de servidor cambiaron: cierra la ventana
    del servidor y ejecuta **restart.bat** para terminar.";
  - nada que traer al fin y al cabo (`updated: false` - la copia ya se puso al día mientras tanto, quizá por `start.bat`):
    "Nada que actualizar: esta copia ya es la versión más nueva." - y sin recargar;
  - rechazada: la frase de *cambios locales*, o "Esta copia tiene confirmaciones propias que la versión más nueva no tiene;
    actualízala con git pull.", o "La actualización no se completó: <motivo>".
