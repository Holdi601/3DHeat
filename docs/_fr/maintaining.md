---
title: "Maintenir la documentation"
nav_order: 23
lang: "fr"
source: "maintaining.md"
source_hash: "4a4fb46273e5"
translated: true
outdated: false
---

# Maintenir la documentation

Cette page s'adresse à celui qui s'occupe de la visionneuse et de ce site. Elle liste les étapes pour garder les pages, les images et les traductions justes après un changement.

Ce site est vérifié à nouveau à **chaque version** et chaque fois que quelque chose change beaucoup : raccourcis clavier, chemin dans l'interface, réglages, formats de fichiers. La liste de contrôle :

1. **Régénérer les pages de référence** : `node tools/docs-refs.mjs` (et `--lang <lang>` pour chaque langue). `node tools/docs-refs.mjs --check` échoue quand une page n'est plus à jour.
2. **Régénérer les captures d'écran** à partir des [données de démonstration](demo-data.md). Utilisez un ordinateur ou un conteneur dont la région est en-US, pour que les nombres s'écrivent `0.35` et non `0,35` (les cases de nombre suivent la région du navigateur tant qu'elle n'est pas changée). Créez les données de démonstration avec `node tools/demo-data.mjs`, lancez un serveur de développement sur le port 5321 **sans** paquet de figurines local : `HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1`. Puis lancez `node tools/docs-shots.mjs --lang <lang>`. Regardez chaque image : seuls les noms de démonstration (*Demo Valley*, *Blue 1*, *Red 3* ...) doivent apparaître, pas de vraies cartes, de vrais joueurs ni de vrais enregistrements.
3. **Lister ce qui a changé** depuis la dernière étiquette de version : `git log --oneline <dernière étiquette>..HEAD`, et la section **Docs** de `CHANGELOG.md`, qui relie chaque fonctionnalité à sa page. Chaque nouvelle fonctionnalité a besoin d'une page ou d'une section, avec une image là où elle se voit à l'écran.
4. **Relecture indépendante** des pages anglaises par quelqu'un qui ne les a pas écrites, pour trois lecteurs : un débutant, un enfant de huit ans, un expert. Les étapes sont-elles complètes et dans le bon ordre ? Les mots sont-ils ceux de l'interface ? Les images sont-elles à jour ? Les libellés des schémas sont-ils justes ?
5. **Corriger ce que la relecture a trouvé.**
6. **Retraduire les pages modifiées** d'après leur empreinte de source, puis faire la relecture par langue. Voir `tools/docs-translate.md`.
7. **Chercher les termes confidentiels** dans les fichiers modifiés, et vérifier qu'aucune image ne montre autre chose que des données de démonstration.
8. **Publier** seulement quand la version est approuvée.

La même vérification couvre les sites de documentation des dépôts liés (voir la page [Accueil](index.md#related-repositories)).

## Les outils sous exporters/ {#the-tools-under-exporters}

Les outils autour de la visionneuse sont des projets publics séparés. Chacun a sa propre licence MIT, ses versions, son wiki et sa vérification de mise à jour. Ils sont épinglés dans ce dépôt comme sous-modules git :

| Dossier | Dépôt |
|---|---|
| `exporters/gamefiles/` | [3DHeat-GameFiles](https://github.com/Holdi601/3DHeat-GameFiles) : parcours et niveaux extraits des archives des jeux |
| `exporters/gamecapture/` | [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture) : enregistreurs de télémétrie de tours ; niveaux tirés de vidéos de jeu |
| `exporters/unreal/` | [3DHeat-UnrealExporter](https://github.com/Holdi601/3DHeat-UnrealExporter) : extension pour l'éditeur Unreal |
| `exporters/cs2/` | [3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2) : démos et cartes de CS2 |
| `exporters/watcher/` | [3DHeat-Watcher](https://github.com/Holdi601/3DHeat-Watcher) : enregistre les parties en arrière-plan |

**Épinglé** signifie que ce dépôt enregistre un commit exact de chaque outil. Une copie de la visionneuse reçoit ces commits :

```bash
git clone --recursive https://github.com/Holdi601/3DHeat
# or, after a plain clone:
git submodule update --init
```

Les deux chemins de mise à jour ci-dessus lancent `git submodule update --init` après le pull. Les outils suivent donc la visionneuse jusqu'aux commits épinglés par sa version la plus récente, et non jusqu'aux derniers commits des outils eux-mêmes. Une version plus récente d'un outil atteint la visionneuse quand l'épingle ici est déplacée : les changements d'un outil sont d'abord validés et poussés dans son propre dossier (son propre dépôt), puis la nouvelle épingle est validée ici. Chaque outil vérifie aussi ses propres versions plus récentes ; cela est documenté dans son propre dépôt.
