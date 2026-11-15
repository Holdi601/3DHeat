---
title: "Mises à jour"
nav_order: 21
lang: "fr"
source: "updates.md"
source_hash: "674c07a79c56"
translated: true
outdated: false
---

# Mises à jour

La visionneuse vous indique quand une version plus récente existe, et ne se met à jour que si vous dites oui. Rien n'est modifié sur votre ordinateur sans votre réponse.

## Mettre à jour la visionneuse {#update-the-viewer}

1. **Dans la page.** Lorsqu'une version plus récente existe, un encadré apparaît sous le nom, en haut de la barre latérale : « Une version plus récente de 3DHeat est disponible ». Cliquez sur **Mettre à jour**. La page se recharge d'elle-même une fois terminé. **Plus tard** masque l'encadré jusqu'au prochain rechargement de la page.
2. **Si elle demande de lancer restart.bat**, fermez la fenêtre du serveur (la fenêtre noire ouverte par `start.bat`) puis double-cliquez sur `restart.bat`.
3. **Au lancement de la visionneuse.** `start.bat` vérifie aussi. Si une version plus récente existe, il demande **Mettre à jour maintenant ? [O/N]**. Appuyez sur `O` pour mettre à jour. Appuyez sur `N`, ou attendez 60 secondes sans répondre, pour lancer la version que vous avez.

![L'avis de mise à jour avec Mettre à jour et Plus tard](../assets/img/en/updates-notice.webp)

Une copie comportant vos propres modifications n'est jamais mise à jour à votre place ; l'encadré indique seulement qu'une mise à jour attend, et invite à valider ou mettre de côté vos modifications, puis à lancer `git pull`. Une copie qui n'a pas été installée avec git (un fichier zip, par exemple) n'affiche rien.

Fonctionnement de la vérification, étape par étape :

```
page ---(après 4 s, puis toutes les 6 h)---> serveur de développement ---> git fetch
   en retard ?  non  -> rien n'est affiché
                oui  -> vos modifications ou vos validations ?  oui -> vous le signaler seulement
                                                              non -> [Mettre à jour] -> git pull
                                                                     -> rechargement, ou « lancez restart.bat »
```

## Les règles de sécurité {#the-safety-rules}

- **Avance rapide uniquement** (`git pull --ff-only`) : une mise à jour ne fusionne, ne rebase ni ne réécrit jamais rien.
- **Pas de modifications locales** : une copie avec des modifications non validées dans des fichiers suivis (`git status --porcelain --untracked-files=no` non vide) n'est jamais mise à jour automatiquement - le travail de quelqu'un n'est pas à écraser par une mise à jour. Elle est seulement informée qu'une mise à jour attend. Les fichiers non suivis (données, exports) ne comptent pas comme modifications.
- **Pas de validations locales** : une copie avec des validations que l'amont n'a pas (« divergente ») n'est pas mise à jour - une avance rapide ne peut pas la faire progresser, et la fusion relève d'un `git pull` manuel. La page et `start.bat` le disent dans les mêmes termes, et `start.bat` lance la version présente.
- **Seulement depuis la page elle-même** : la requête de mise à jour du serveur de développement doit porter un en-tête personnalisé et, lorsque le navigateur envoie un `Origin`, venir de l'hôte du serveur (ci-dessous).
- Seul un dépôt git avec une branche amont est jamais mis à jour ; tout le reste (une copie sans `.git`, pas de git installé, un build statique) est laissé tel quel et ne dit rien.

## Ce que fait start.bat {#what-startbat-does}

`start.bat` (double-cliquez dessus ; la fenêtre est le serveur) fait, dans l'ordre :

1. Trouve Node.js - dans le `PATH`, sinon dans `%ProgramFiles%\nodejs`, `%ProgramFiles(x86)%\nodejs` ou `%LOCALAPPDATA%\Programs\nodejs` - et propose de l'installer avec `winget install -e --id OpenJS.NodeJS.LTS` s'il manque (demandé, O/N ; ensuite la fenêtre doit être rouverte pour que Windows prenne en compte le nouveau `PATH`).
2. **Mises à jour**, lorsque git est installé et que le dossier contient `.git` :
   - `git fetch --quiet` (sans réseau ou sans amont : ignoré silencieusement) ;
   - compte `git rev-list --count HEAD..@{u}` ; rien en retard : rien n'est dit ;
   - modifications locales : « Une version plus récente de 3DHeat est disponible (N modifications), mais cette copie a des modifications locales, elle n'est donc pas mise à jour. Validez-les ou mettez-les de côté, puis lancez git pull. » - et la version présente est lancée ;
   - validations propres (`git rev-list --count @{u}..HEAD` différent de 0) : « Une version plus récente de 3DHeat est disponible (N modifications), mais cette copie a des validations propres que la version la plus récente n'a pas, elle n'est donc pas mise à jour. Mettez-la à jour avec git pull. » - et la version présente est lancée ;
   - sinon « Une version plus récente de 3DHeat est disponible (N modifications). » et la question **Mettre à jour maintenant ? [O/N]**. `N`, ou aucune réponse pendant 60 secondes, affiche « Pas mise à jour ; lancement de la version que vous avez. » et lance la version présente. Sur `O` : « Mise à jour... », signale si `package.json` ou `package-lock.json` changent, lance `git pull --ff-only` (si cela échoue encore - le réseau, par exemple : « La mise à jour n'a pas abouti ; lancement de la version que vous avez. »), puis `git submodule update --init` (les outils épinglés, voir [Maintenir la documentation](maintaining.md#the-tools-under-exporters)), puis `npm install` lorsque les fichiers du paquet ont changé et que `node_modules` existe, et « Mis à jour. ».
3. Refuse de démarrer un second serveur : si quelque chose écoute déjà sur le port **5273**, il le signale et renvoie vers `restart.bat` / `stop.bat`.
4. Au premier lancement (pas de `node_modules`), demande avant de télécharger les dépendances (environ 300 Mo dans `node_modules\`, rien à l'échelle du système).
5. Lance le serveur de développement sur `127.0.0.1:5273` (`--strictPort`) et ouvre le navigateur lorsqu'il est prêt.

`restart.bat` arrête le serveur (par port) puis relance `start.bat`, qui pose donc la même question. `stop.bat` se contente d'arrêter le serveur.

## Pour les développeurs {#for-developers}

### Pendant l'exécution : la route de mise à jour {#while-it-runs-the-update-route}

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

### L'avis dans la page {#the-notice-in-the-page}

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
