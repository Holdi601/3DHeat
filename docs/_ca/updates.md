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

1. **A la pàgina.** Quan existeix una versió més nova, apareix una caixa sota el nom a la part superior de la barra lateral: «Hi ha disponible una versió més nova de 3DHeat». Fes clic a **Actualitza ara**. La pàgina es recarrega sola quan acaba. **Més tard** amaga la caixa fins que tornis a carregar la pàgina.
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

El servidor de desenvolupament (el connector de Vite `heat3d-self-update` a `vite.config.ts`) serveix
`/__heat3d/update`. Només existeix al servidor de desenvolupament: no en una compilació estàtica
ni a `vite preview`.

**`GET /__heat3d/update`** indica si el checkout va enrere:

```json
{ "checkout": true, "upstream": "origin/main", "behind": 3, "ahead": 0, "dirty": false, "latest": "the newest commit's subject" }
```

- `checkout: false` quan la carpeta no és un checkout de git;
- executa `git fetch --quiet` **com a molt cada 30 minuts** (les consultes intermèdies responen
  amb la darrera recuperació);
- `behind` / `ahead` surten de `git rev-list --count HEAD..@{u}` / `@{u}..HEAD`, `dirty` de
  `git status --porcelain --untracked-files=no`, i `latest` és l'assumpte de la confirmació més
  nova de la font;
- sense branca de font, `upstream: null` i `behind: 0`.

**`POST /__heat3d/update/apply`** posa el checkout al dia:

1. Rebutjada amb `403 { ok: false, reason: "forbidden" }` tret que la petició porti la capçalera
   `X-Heat3d-Update: 1` i, quan porta un `Origin`, que l'host d'aquest origen sigui el `Host` de
   la petició. Un formulari d'un altre lloc no pot enviar una capçalera pròpia sense una
   comprovació prèvia CORS, que aquest servidor mai no concedeix.
2. Res a fer (no és un checkout, no hi ha font, no va enrere): `{ ok: true, updated: false }`.
3. Canvis locals: `{ ok: false, reason: "dirty" }`; confirmacions locals:
   `{ ok: false, reason: "diverged" }`.
4. Si no: indica quins fitxers canvien (`git diff --name-only HEAD @{u}`), executa
   `git pull --ff-only` (límit de 2 min), `git submodule update --init` (els errors s'ignoren),
   `npm install` quan han canviat `package.json` o `package-lock.json` (límit de 15 min), i
   respon `{ ok: true, updated: true, restart }`. `restart` indica per què el servidor en marxa
   no pot aplicar l'actualització: `"dependencies"` quan s'han reinstal·lat, `"config"` quan només
   ha canviat un fitxer `vite.config`, `false` quan no cal reiniciar res.
5. Una ordre de git o npm que falla respon `{ ok: false, reason: "<l'error, fins a 300 caràcters>" }`.

Les respostes són JSON amb `Cache-Control: no-store`. El servidor només escolta a `127.0.0.1`,
així que la ruta no és accessible des de la xarxa.

### L'avís a la pàgina {#the-notice-in-the-page}

`UpdateBanner`, sota el nom a la part superior de la barra lateral:

- Consulta la ruta **4 segons** després que es carregui la pàgina (no en els primers segons: la
  pàgina té un conjunt de dades a carregar i una GPU a iniciar), i de nou **cada 6 hores** mentre
  la pàgina sigui oberta.
- No mostra **res** quan la ruta no existeix (compilació estàtica), la carpeta no és un checkout,
  o no hi ha res de més nou: un avís a cada inici acabaria ignorat.
- Enrere, sense canvis locals: «Hi ha disponible una versió més nova de 3DHeat (N canvis, el més
  recent: <assumpte>).», amb **Actualitza ara** i **Més tard** (*Més tard* amaga l'avís fins que
  es torna a carregar la pàgina).
- Enrere, amb canvis locals: la mateixa frase, seguida de «Aquesta còpia té canvis locals, així
  que no s'actualitza automàticament; fes-ne un commit o un stash i després executa git pull.»
  - sense botó.
- **Actualitza ara** envia una petició a `/apply` («S'està actualitzant…»). Després:
  - «Actualitzat. La pàgina es torna a carregar.» - i es torna a carregar 1,5 s més tard (el
    servidor ja serveix els fitxers nous);
  - quan s'han reinstal·lat les dependències: «Actualitzat. Les dependències han canviat: tanca la
    finestra del servidor i executa **restart.bat** per acabar.»;
  - quan només han canviat els ajustos del servidor: «Actualitzat. La configuració del servidor ha
    canviat: tanca la finestra del servidor i executa **restart.bat** per acabar.»;
  - si al final no hi ha res per portar (`updated: false`: la còpia ja l'ha posat al dia, per
    exemple `start.bat`): «No hi ha res per actualitzar: aquesta còpia ja és la versió més nova.»
    - i sense recarregar;
  - rebutjada: la frase de canvis locals, o «Aquesta còpia té confirmacions pròpies que la versió
    més nova no té; actualitza-la amb git pull.», o «L'actualització no s'ha pogut fer: <motiu>».
