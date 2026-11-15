---
title: "Mises à jour"
nav_order: 18
lang: "fr"
source: "updates.md"
source_hash: "0d33b694a31d"
translated: true
outdated: false
---

# Mises à jour

La visionneuse vous dit quand une version plus récente existe, et ne se met à jour que si vous dites oui. Rien n'est modifié sur votre ordinateur sans votre réponse.

## Mettre à jour la visionneuse {#update-the-viewer}

1. **Dans la page.** Quand une version plus récente existe, une boîte apparaît sous le nom en haut de la barre latérale : « Une version plus récente de 3DHeat est disponible ». Cliquez sur **Mettre à jour**. La page se recharge toute seule à la fin. **Plus tard** cache la boîte jusqu'au rechargement de la page.
2. **Si elle dit de lancer restart.bat**, fermez la fenêtre du serveur (la fenêtre noire ouverte par `start.bat`) et double-cliquez sur `restart.bat`.
3. **Au lancement de la visionneuse.** `start.bat` vérifie aussi. Si une version plus récente existe, il demande **Update now? [Y/N]**. Appuyez sur `Y` pour mettre à jour. Appuyez sur `N`, ou attendez 60 secondes sans répondre, pour lancer la version que vous avez.

![L'avis de mise à jour avec Mettre à jour et Plus tard](../assets/img/fr/updates-notice.webp)

Une copie avec vos propres modifications n'est jamais mise à jour à votre place : la boîte indique seulement qu'une mise à jour attend, et demande de valider ou de mettre de côté vos modifications, puis de lancer `git pull`. Une copie qui n'a pas été installée avec git (un fichier zip, par exemple) n'affiche rien.

Le fonctionnement de la vérification, étape par étape :

```
page ---(after 4 s, then every 6 h)---> dev server ---> git fetch
   behind?  no  -> nothing is shown
            yes -> your own changes or commits?  yes -> tell you only
                                                 no  -> [Update now] -> git pull
                                                        -> reload, or "run restart.bat"
```

## Les règles de sécurité {#the-safety-rules}

- **Avance rapide seulement** (`git pull --ff-only`) : une mise à jour ne fusionne, ne rebase ni ne réécrit jamais rien.
- **Aucune modification locale** : une copie avec des modifications non validées dans les fichiers suivis (`git status --porcelain --untracked-files=no` non vide) n'est jamais mise à jour automatiquement — le travail de quelqu'un n'est pas à écraser par une mise à jour. Elle est seulement informée qu'une mise à jour attend. Les fichiers non suivis (données, exports) ne comptent pas comme modifications.
- **Aucun commit local** : une copie qui a des commits que l'amont n'a pas (« divergée ») n'est pas mise à jour — un avance rapide ne peut pas la faire avancer, et fusionner se fait à la main avec `git pull`. La page et `start.bat` le disent avec les mêmes mots, et `start.bat` lance la version présente.
- **Seulement depuis la page elle-même** : la requête de mise à jour du serveur de développement doit porter un en-tête personnalisé et, quand le navigateur envoie un `Origin`, venir de l'hôte du serveur lui-même (voir plus bas).
- Seule une copie git avec une branche amont est jamais mise à jour ; tout le reste (une copie sans `.git`, git non installé, une version statique) est laissé tranquille et ne dit rien.

## Ce que fait start.bat {#what-startbat-does}

`start.bat` (double-cliquez dessus ; la fenêtre est le serveur) fait, dans l'ordre :

1. Trouve Node.js — dans le `PATH`, sinon dans `%ProgramFiles%\nodejs`, `%ProgramFiles(x86)%\nodejs` ou `%LOCALAPPDATA%\Programs\nodejs` — et propose de l'installer avec `winget install -e --id OpenJS.NodeJS.LTS` s'il manque (demandé, O/N ; ensuite la fenêtre doit être rouverte pour que Windows prenne le nouveau `PATH`).
2. **Mises à jour**, quand git est installé et que le dossier a un `.git` :
   - `git fetch --quiet` (pas de réseau ou pas d'amont : ignoré sans bruit) ;
   - compte `git rev-list --count HEAD..@{u}` ; rien en retard : rien n'est dit ;
   - modifications locales : "A newer version of 3DHeat is available (N changes), but this copy has local changes, so it is not updated. Commit or stash them, then run git pull." — et il lance la version présente ;
   - commits propres (`git rev-list --count @{u}..HEAD` non nul) : "A newer version of 3DHeat is available (N changes), but this copy has commits of its own that the newest version does not, so it is not updated. Update it with git pull." — et il lance la version présente ;
   - sinon "A newer version of 3DHeat is available (N changes)." et la question **Update now? [Y/N]**. `N`, ou pas de réponse pendant 60 secondes, affiche "Not updated; starting the version you have." et lance la version présente. Sur `Y` : "Updating...", indique si `package.json` ou `package-lock.json` changent, lance `git pull --ff-only` (si cela échoue encore — le réseau, par exemple : "The update did not go through; starting the version you have."), puis `git submodule update --init` (les outils épinglés, voir [Maintenir la documentation](maintaining.md#the-tools-under-exporters)), puis `npm install` quand les fichiers du paquet ont changé et que `node_modules` existe, et "Updated."
3. Refuse de lancer un second serveur : quand quelque chose écoute déjà sur le port **5273**, il le dit et renvoie vers `restart.bat` / `stop.bat`.
4. Au premier lancement (pas de `node_modules`), demande avant de télécharger les dépendances (environ 300 Mo dans `node_modules\`, rien à l'échelle du système).
5. Lance le serveur de développement sur `127.0.0.1:5273` (`--strictPort`) et ouvre le navigateur quand il est prêt.

`restart.bat` arrête le serveur (par son port) et relance `start.bat`, donc il pose la même question. `stop.bat` arrête seulement le serveur.


## Pour les développeurs {#for-developers}

### Pendant l'exécution : la route de mise à jour {#while-it-runs-the-update-route}

Le serveur de développement (le plugin Vite `heat3d-self-update` dans `vite.config.ts`) sert `/__heat3d/update`. Elle n'existe que sur le serveur de développement — ni dans une version statique ni dans `vite preview`.

**`GET /__heat3d/update`** répond si la copie est en retard :

```json
{ "checkout": true, "upstream": "origin/main", "behind": 3, "ahead": 0, "dirty": false, "latest": "the newest commit's subject" }
```

- `checkout: false` quand le dossier n'est pas une copie git ;
- elle lance `git fetch --quiet` **au plus toutes les 30 minutes** (les demandes entre-temps répondent avec ce qui a été récupéré en dernier) ;
- `behind` / `ahead` viennent de `git rev-list --count HEAD..@{u}` / `@{u}..HEAD`, `dirty` de `git status --porcelain --untracked-files=no`, `latest` du sujet du commit le plus récent de l'amont ;
- sans branche amont, `upstream: null` et `behind: 0`.

**`POST /__heat3d/update/apply`** met la copie à jour :

1. Refusé avec `403 { ok: false, reason: "forbidden" }` sauf si la requête porte l'en-tête `X-Heat3d-Update: 1` et, quand elle porte un `Origin`, que l'hôte de cette origine est le `Host` de la requête. Un formulaire d'un autre site ne peut pas envoyer un en-tête personnalisé sans une requête de pré-vérification CORS, que ce serveur n'accorde jamais.
2. Rien à faire (pas une copie git, pas d'amont, pas en retard) : `{ ok: true, updated: false }`.
3. Modifications locales : `{ ok: false, reason: "dirty" }` ; commits locaux : `{ ok: false, reason: "diverged" }`.
4. Sinon : note les fichiers qui changent (`git diff --name-only HEAD @{u}`), `git pull --ff-only` (délai de 2 min), `git submodule update --init` (échec ignoré), `npm install` quand `package.json` ou `package-lock.json` ont changé (délai de 15 min), et répond `{ ok: true, updated: true, restart }` — `restart` dit pourquoi le serveur en marche ne peut pas prendre la mise à jour : `"dependencies"` quand elles ont été réinstallées, `"config"` quand seul un fichier `vite.config` a changé, `false` quand rien ne demande de redémarrer.
5. Une commande git ou npm qui échoue répond `{ ok: false, reason: "<l'erreur, jusqu'à 300 caractères>" }`.

Les réponses sont en JSON avec `Cache-Control: no-store`. Le serveur n'écoute que sur `127.0.0.1`, si bien que la route n'est pas accessible depuis le réseau.

### L'avis dans la page {#the-notice-in-the-page}

`UpdateBanner`, sous le nom en haut de la barre latérale :

- Elle interroge la route **4 secondes** après le chargement de la page (pas dans les toutes premières secondes : la page a un jeu de données à charger et un GPU à démarrer), puis **toutes les 6 heures** tant que la page reste ouverte.
- Elle n'affiche **rien** quand il n'y a pas de route (une version statique), que le dossier n'est pas une copie git, ou que rien n'est plus récent — un avis à chaque démarrage est un avis qu'on apprend à ignorer.
- En retard, sans modification locale : « Une version plus récente de 3DHeat est disponible (N modifications, la plus récente : <sujet>). » avec **Mettre à jour** et **Plus tard** (*Plus tard* cache l'avis jusqu'au rechargement de la page).
- En retard, avec modifications locales : la même phrase et « Cette copie a des modifications locales, elle n'est donc pas mise à jour automatiquement ; validez-les ou mettez-les de côté, puis lancez git pull. » — sans bouton.
- **Mettre à jour** envoie une requête à `/apply` (« Mise à jour... »). Ensuite :
  - « Mise à jour terminée. La page se recharge. » — et elle se recharge 1,5 s plus tard (le serveur sert déjà les nouveaux fichiers) ;
  - quand les dépendances ont été réinstallées : « Mise à jour terminée. Ses dépendances ont changé : fermez la fenêtre du serveur et lancez **restart.bat** pour finir. » ;
  - quand seuls les réglages du serveur ont changé : « Mise à jour terminée. Ses réglages de serveur ont changé : fermez la fenêtre du serveur et lancez **restart.bat** pour finir. » ;
  - rien à apporter finalement (`updated: false` — la copie a été mise à jour entre-temps, par `start.bat` par exemple) : « Rien à mettre à jour : cette copie est déjà la version la plus récente. » — et pas de rechargement ;
  - refusé : la phrase *modifications locales*, ou « Cette copie a des commits qui lui sont propres et que la version la plus récente n'a pas ; mettez-la à jour avec git pull. », ou « La mise à jour n'a pas abouti : <raison> ».
