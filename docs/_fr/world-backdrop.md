---
title: "Décor du monde réel"
parent: "Niveaux et géométrie de fond"
nav_order: 5
has_children: true
lang: "fr"
source: "world-backdrop.md"
source_hash: "d42a67d56aca"
translated: true
outdated: false
---

# Décor du monde réel

Un décor du monde réel pose le vrai sol sous un enregistrement de vol : collines, routes, rivières, aérodromes et bâtiments, téléchargés depuis des données cartographiques ouvertes et gratuites. Utilisez-le quand un enregistrement Tacview flotterait autrement sur une grille vide. C'est un [niveau](glossary.md), donc la chaleur et les figurines se posent dessus.

## En construire un {#build-one}

1. Chargez un enregistrement de vol qui indique où il se trouve sur la Terre (un fichier Tacview `.acmi`), ou ne chargez rien et choisissez un théâtre à l'étape 3. Voir [Charger vos données](getting-data-in.md).
2. Ouvrez **Arrière-plan / niveau** dans la barre latérale.
3. Appuyez sur **Décor du monde réel** pour construire le sol sous vos données. Ou choisissez une carte de jeu dans **Théâtre**, puis appuyez sur **Construire le décor du théâtre** (ou **Diffuser le théâtre**).
4. Attendez. Le panneau affiche l'avancement (*Tuiles d'altitude*, *Tuiles de carte*, *Construction du décor*) ; **Annuler** l'arrête.
5. Survolez la zone. La ligne de crédit des données cartographiques s'écrit en bas à droite de la vue.

La première construction télécharge quelques dizaines de mégaoctets. Le navigateur les garde, donc une deuxième construction de la même zone ne télécharge rien. **Oublier les tuiles** les supprime. Le bouton **Décor du monde réel** n'apparaît que si les données chargées portent une référence géographique (ci-dessous).

Tout est construit dans un processus de travail en arrière-plan ([`src/world`](https://github.com/Holdi601/3DHeat/tree/main/src/world)). Le résultat remplace le niveau courant et se comporte comme tout [niveau 3D](model-levels.md) : il masque la chaleur qui se trouve derrière, est coupé par la coupe, possède les [réglages d'apparence](level-appearance.md), et peut être enregistré dans la [bibliothèque](level-library.md).

## Où sont les données : la référence géographique {#where-the-data-is-the-geographic-reference}

Un jeu de données ne reçoit une référence géographique que d'une source qui en indique une :

- **Un enregistrement ACMI** : son `ReferenceLatitude` et son `ReferenceLongitude` dans l'en-tête, et des positions que le lecteur projette sur le plan tangent à l'ellipsoïde WGS84 à cet endroit (X vers l'est, Y vers le nord, en mètres ; les hauteurs sont l'altitude de l'enregistrement au-dessus du niveau de la mer). La référence est gardée quand le mappage prend **X** et **Y** comme axes du sol - ce que font les indices propres à l'enregistrement - et abandonnée quand le sol vient d'une autre colonne, comme les **U** et **V** à plat d'un jeu.
- **Une table Parquet dont les indices `heat3d` contiennent une entrée `geo`** - les tables DCS, MSFS, X-Plane et IL-2 (Tacview) du [Watcher](https://github.com/Holdi601/3DHeat-Watcher). L'entrée est décrite dans [Pour les développeurs](#for-developers).

Un chargement de plusieurs fichiers ne garde la référence que si tous partagent la même. Tous les autres chargeurs n'y touchent pas et n'en portent aucune.

Le décor est projeté de la même façon, puis passe par le mappage des axes du chargement : il se pose sous les données quels que soient les inversions ou l'échelle que le mappage applique.

## Théâtres {#theatres}

Le sélecteur **Théâtre** liste les cartes réelles de DCS World (Caucasus, Nevada, Normandy 2, The Channel, Syria, Persian Gulf, Marianas, Marianas WWII, South Atlantic, Sinai, Afghanistan, Kola, Germany Cold War, Iraq) et d'IL-2 Great Battles (Stalingrad, Moscow, Kuban, Rheinland, Normandy, Prokhorovka, Velikie Luki, Arras, Odessa, Finnish Gulf / Leningrad, Korea), chacune avec son cadre sur la Terre ([`src/world/theatres.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/theatres.ts)). Les cadres DCS sont les étendues des éditeurs, calculées à partir des projections publiées ; les cadres IL-2, et ceux des DCS marqués ainsi, sont des estimations à partir des tailles publiées des cartes et des villes sur leurs bords - le panneau l'indique.

**Construire le décor du théâtre** construit deux niveaux de détail dans un seul maillage :

| Niveau | Zone | Relief | Carte |
|---|---|---|---|
| Théâtre | tout le cadre | le zoom le plus fin, jusqu'à 10, qui demande au plus 64 tuiles d'altitude (environ 3 km par sommet sur le Caucase, 1 km sur la Normandie) | la mer, les lacs, l'occupation du sol et les autoroutes, à partir de 64 tuiles vectorielles au plus, du zoom 4 au zoom 9 |
| Zone détaillée | **Sous les données**, **Autour d'un point** (latitude, longitude, de 12 à 400 km), ou aucune | jusqu'au zoom 12, en 100 tuiles au plus, 500 000 sommets au plus | tout ce qui précède, à partir de 1 500 tuiles vectorielles au plus, au zoom le plus fin jusqu'à 14 qui tient |

La zone détaillée découpe un trou dans la grille du théâtre, élargi aux cellules entières pour que les deux grilles partagent leurs lignes de bord, et un mince mur ferme la couture là où elles échantillonnent les hauteurs différemment.

Quand des données sont chargées, le théâtre est construit sur le plan des données, donc il se pose dessous tel qu'il est construit. Sans données, il est construit autour du point de référence propre au théâtre (degrés entiers près de sa zone détaillée). Des données chargées ensuite sur une autre référence - un fichier ACMI nomme la sienne - déplacent le décor sous elles : le passage exact entre les deux projections est calculé sur une grille de 256 × 256 sur le décor, et lu entre les nœuds, à un ou deux mètres près sur tout un théâtre ([`src/world/reproject.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/reproject.ts)). Un décor enregistré dans la bibliothèque garde sa place et se déplace de la même façon quand il est chargé sous d'autres données.

### Diffuser un théâtre {#streaming-a-theatre}

**Diffuser le théâtre** montre le théâtre comme le fait une visionneuse de carte de simulateur de vol : le sol arrive sous forme de nombreuses petites tuiles autour de la caméra, chargées pendant le vol et retirées quand elles sont hors de portée ([`src/world/stream.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/stream.ts)).

- **Un quadtree de tuiles Web Mercator.** Les racines au zoom 5 couvrent 1 500 km autour de la caméra, donc le sol va au-delà du cadre du théâtre jusqu'à l'horizon. Une tuile est découpée en ses quatre enfants tant que la caméra est plus près que 1,4 fois sa largeur, jusqu'au zoom 15 (environ 1 km par tuile, 15 m entre les sommets du relief) : le détail diminue avec la distance comme il diminue à l'écran.
- **Chaque tuile a son propre maillage**, construit dans un processus de travail ([`src/world/tileBuild.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/tileBuild.ts)) : une grille de relief de 65 × 65 avec une jupe autour de son bord (pour que les voisines à des détails différents ne montrent jamais de fissure), l'occupation du sol et la mer peintes dessus, les routes, voies ferrées, lacs, rivières, aérodromes, pistes relevées et bâtiments par-dessus, et, au choix, l'image satellite de son carré. Le moteur dessine les tuiles avec l'aspect et les règles de profondeur du niveau, donc elles masquent la chaleur derrière elles comme tout niveau.
- **Grossier d'abord.** Les tuiles sont demandées grossières et proches en premier, quatre téléchargements à la fois par source ; pendant que les enfants d'une tuile se chargent, la tuile en tient lieu, si bien que la vue se remplit tout de suite puis se précise.
- **Mémoire** : les tuiles construites sont gardées jusqu'à 600 Mo, la moins récemment dessinée étant retirée en premier. Les **téléchargements** restent dans le cache de tuiles, limité à un budget de 2 Go, les plus anciens sortant en premier : revoler au-dessus d'une zone ne coûte rien, et il n'y a pas de plafond par construction.
- **Enregistré dans la bibliothèque** comme ce qu'il diffuse - le théâtre, ses options et sa place sur la Terre - et non comme des tuiles : le charger diffuse de nouveau, depuis le cache de tuiles là où elles sont encore. Les clics et l'inspecteur touchent les tuiles comme ils touchent tout niveau.
- Les deux moteurs de rendu dessinent les tuiles : vérifié côte à côte sur un vrai GPU (WebGPU et WebGL2 sur la même carte), y compris la chaleur cachée derrière une crête.
- Quand des données sont chargées, les tuiles sont construites sur le plan des données ; des données chargées plus tard sur un autre plan reconstruisent les tuiles là (depuis le cache).
- Mesuré sur des vols synthétiques au-dessus de trois endroits (Normandie, Nevada, Syrie) : environ 63, 45 et 24 Mo à la première visite avec imagerie ; une deuxième visite ne télécharge rien.


## Ce qui est construit {#what-is-built}

| Partie | Source | Comment |
|---|---|---|
| Imagerie (théâtres diffusés, facultative) | EOX Sentinel-2 cloudless 2016 | **Imagerie satellite** pose la mosaïque sans nuages de 2016 (environ 10 m par pixel, zoom 14 ; les tuiles plus profondes l'agrandissent) sur le sol, à la place de l'occupation du sol peinte ; routes, pistes, bâtiments et noms restent par-dessus. |
| Imagerie plus fine (États-Unis, France) | USGS National Map orthoimagery ; IGN BD ORTHO | Avec **Imagerie satellite** activée, une tuile de carte du zoom 13 qui se trouve entièrement dans les États-Unis continentaux ou la France métropolitaine prend à la place l'orthophoto nationale, deux zooms plus profond que la tuile (seize de ses tuiles assemblées en une image, environ 1 à 2 m par pixel de près). EOX partout ailleurs. |
| Relief (théâtres diffusés) | Mapterhorn | Copernicus GLO-30 partout (environ 19 m par pixel au zoom 12), à l'échelle du mètre là où le relevé national d'un pays est présent (France, États-Unis et d'autres) ; lu deux zooms plus grossier que chaque tuile. AWS Terrain Tiles si Mapterhorn est injoignable. |
| Relief | AWS Terrain Tiles (PNG Terrarium) | Une grille de hauteurs sur le cadre : le zoom est le plus fin jusqu'à 12 (environ 28 m par pixel à 43° N) qui demande 36 tuiles au plus, et la grille est éclaircie à 400 000 sommets au plus. Dessiné comme sol, avec les repères habituels de relief. |
| Routes, voies ferrées | Tuiles vectorielles OpenFreeMap, couche `transportation` | Rubans plats posés sur le relief, rendus plus denses à l'espacement du relief et relevés de quelques pour cent pour ne pas se battre avec lui. Largeurs par classe, de 16 m (autoroute) à 3 m (piste, voie ferrée) ; jamais plus étroits que la diagonale du cadre / 5000. Les sentiers, bacs et tunnels sont omis. |
| Aérodromes | couche `aeroway` | Polygones de piste, de voie de circulation, d'aire de stationnement et d'héliport posés comme sol ; lignes de piste et de voie de circulation en rubans de 45 m et 18 m. |
| Eau | couche `water` | La mer plate à 0 m, les lacs et étangs plats à leur rive la plus basse, les rivières posées sur le relief. Dessinée comme de l'eau : ombrage plat, pas de courbes. |
| Occupation du sol | couches `landcover` et `landuse` | Peinte sur les sommets propres du relief, sans triangles supplémentaires : forêts, herbes et parcs en vert, champs en paille, zones humides, sable, roche, glace ; zones résidentielles, industrielles, commerciales, militaires et carrières en tons atténués. L'eau est aussi peinte sous la surface, donc le rivage se lit de n'importe quelle hauteur. Le sol nu reçoit une discrète teinte d'altitude (gris-vert en plaine, brun en montagne, neige au-dessus de 3 000 m). Lisible à la résolution du relief : environ 30 à 45 m dans la zone détaillée, des kilomètres dans le théâtre. |
| Noms de lieux | couches `place` et `aerodrome_label` | Villes, bourgs et villages, et aérodromes avec leur code OACI, écrits par-dessus la vue ; la portée de chaque sorte augmente avec la hauteur de la caméra, 70 au plus à la fois. |
| Pistes relevées | [OurAirports](https://ourairports.com/data/) `runways.csv` (domaine public) | Facultatif (**Pistes d'OurAirports**, activé par défaut) : chaque piste ouverte dont les deux extrémités figurent dans la liste, de seuil à seuil à la largeur indiquée, avec des bandes latérales, une ligne centrale en pointillés et des barres de seuil. Une liste de 4 Mo, téléchargée une fois et gardée dans le cache. |
| Bâtiments | couche `building` | Emprises extrudées de `render_min_height` à `render_height` (6 m s'il manque) au-dessus du sol le plus bas dessous ; les parties `hide_3d` sont ignorées. Dessinés comme des structures. |

Les tuiles vectorielles sont lues au zoom 14 (le seul zoom avec les bâtiments) quand le cadre en demande 300 au plus, sinon au zoom le plus fin qui en demande moins, jusqu'à 8. Une zone plus grande n'a que le relief.

### Aspect {#look}

Un décor démarre avec **Couleur capturée** activée - la couleur permet de distinguer une route claire du sol gris sur lequel elle se trouve, une piste sombre de son aire de stationnement - avec les arêtes des triangles du sol désactivées, puisqu'une grille régulière ne dit rien, des courbes discrètes, une mer opaque (un plancher sous elle lutterait avec la surface pour la profondeur au loin), et des bâtiments gris clair presque pleins, comme une carte les dessine. La mer ouverte ne reçoit aucun triangle de sol. Le reste a l'aspect par défaut d'un niveau modèle.

## Crédits sur la toile {#credits-on-the-canvas}

Tant qu'un décor est le niveau, les crédits de ses sources s'écrivent en bas à droite de la vue, sans qu'il faille cliquer, pour que les captures d'écran et les vidéos rendues les portent :

> OpenFreeMap © OpenMapTiles · Données © contributeurs OpenStreetMap · Altitude : Terrain Tiles – SRTM, GMTED2010, 3DEP avec l'aimable autorisation de l'U.S. Geological Survey ; ETOPO1 : NOAA ; et autres

Chaque partie renvoie à la page d'attribution de sa source (openstreetmap.org/copyright et la [liste d'attribution](https://github.com/tilezen/joerd/blob/master/docs/attribution.md) de Terrain Tiles). Un décor enregistré dans la bibliothèque garde ses crédits et les affiche de nouveau au chargement. Le texte est traduit avec la visionneuse ; les noms ne le sont pas.

## Sources et leurs conditions {#sources-and-their-terms}

Chaque source, sa licence et la façon dont le décor reste dans ses conditions : [Décor du monde réel : sources et conditions](world-backdrop-sources.md).

## Le cache de tuiles {#the-tile-cache}

Chaque tuile, et le TileJSON des tuiles vectorielles, est gardé dans l'API Cache du navigateur sous `3dheat-world-tiles-v1`, par URL. Une deuxième construction de la même zone ne fait aucune requête et fonctionne hors ligne : le TileJSON est demandé en premier et, s'il échoue, sa copie en cache indique les tuiles déjà présentes. Les tuiles que le serveur n'a pas (mer ouverte, 404) sont aussi mémorisées comme absentes.

Les URL des tuiles vectorielles portent la date de construction de la carte ; donc, après qu'OpenFreeMap publie une nouvelle construction, le décor suivant télécharge des tuiles fraîches, et les anciennes restent jusqu'à leur effacement. Le cache est limité à 2 Go : au-delà, les tuiles stockées depuis le plus longtemps sont supprimées en premier. **Oublier les tuiles** supprime tout le cache. Le cache a besoin d'une origine sécurisée (`https://` ou `localhost`) ; ailleurs, chaque construction télécharge à nouveau.

## Comparaison avec Tacview {#compared-with-tacview}

Vérifié à l'œil sur un endroit par théâtre, avec des enregistrements synthétiques : les roulements au décollage tombent sur les lignes centrales des pistes dessinées, les franchissements de côte tombent sur la côte. Le côté de Tacview vient de sa documentation et de ses captures publiées (tacview.net, sa page Steam), et non d'une exécution faite ici.

| | Tacview 1.9 | Ce décor, diffusé |
|---|---|---|
| Étendue | le globe entier | 1 500 km autour de la caméra, où qu'elle soit |
| Relief | ETOPO1 (environ 1,25 km) intégré ; SRTM 25-75 m si l'utilisateur installe les fichiers ; relief DCS exporté depuis DCS | Copernicus GLO-30 (Mapterhorn), à l'échelle du mètre en France et aux États-Unis |
| Imagerie | aucune intégrée ; textures que l'utilisateur télécharge (Mapview, SAS Planet, extensions comme une carte VFR du Caucase) | EOX Sentinel-2 cloudless 2016, environ 10 m, diffusée |
| Occupation du sol | aucune, sauf dans une texture | depuis OpenStreetMap, peinte sur le relief (sans imagerie) |
| Routes, voies ferrées | aucune, sauf dans une texture | toutes les classes près de la caméra, les grandes routes au loin |
| Bâtiments | aucun | emprises extrudées près de la caméra |
| Aérodromes | libellés et pistes en boîtes plates, sans marquages | pistes à partir des extrémités relevées, avec bandes latérales, ligne centrale et barres de seuil ; voies de circulation, aires de stationnement ; noms avec codes OACI |
| Noms de lieux | quelques libellés de villages et de villes | villes, bourgs, villages, aérodromes, selon la distance et la hauteur |

Là où il reste en retrait :

- **Résolution de l'imagerie** : hors des États-Unis et de la France, la mosaïque satellite de 10 m est floue en dessous d'environ 2 km ; Tacview, avec une texture de zoom 17 installée par l'utilisateur, est plus nette là.
- **Relief dans la forme propre à DCS** : Tacview peut montrer le relief que DCS exporte lui-même ; ici, c'est la vraie Terre, qui diffère du relief de DCS là où les modélisateurs de la carte l'ont modifié.
- **Courbure** : le sol est un plan plat, donc l'horizon n'est pas celui d'une Terre courbe ; Tacview dessine une sphère.
- **Vitesse** : la première visite d'un endroit télécharge des dizaines de mégaoctets avant d'être nette ; dans un navigateur à rendu logiciel (les captures d'écran), il dessine à quelques images par seconde avec plusieurs centaines de tuiles.

## Limites et ce qui vient après {#limits-and-what-comes-later}

- **Résolution du relief** : environ 30 m au mieux, et plus grossier sur les grandes zones. [Copernicus GLO-30](https://registry.opendata.aws/copernicus-dem/) (GeoTIFF optimisés pour le cloud sur AWS, sans clé, avec un texte d'attribution fixe) est la meilleure source : 30 m partout, GLO-90 là où GLO-30 a des trous (Arménie et Azerbaïdjan, que couvre DCS Caucase). Il faut un lecteur GeoTIFF, et il n'est pas encore utilisé.
- **Meilleur relief** : Copernicus GLO-30 sur AWS n'envoie pas d'en-têtes CORS, donc un navigateur ne peut pas le lire ; le miroir d'OpenTopography peut être lu (CORS et plages d'octets), mais ses conditions pour l'usage à l'exécution d'une application publique sont inconnues - à demander avant tout usage. Mapterhorn contient déjà GLO-30.
- **Courbure** : le sol est un plan plat et les hauteurs ne sont pas abaissées pour la courbure de la Terre, ce qui correspond à la façon dont les enregistrements sont placés (l'altitude comme hauteur) ; loin de la référence, les deux dérivent ensemble, de moins d'un millième à 100 km. Courber seulement les tuiles les séparerait des données au loin, donc ce n'est pas proposé. Un horizon courbe demande la même chute - distance de la caméra au carré divisée par deux fois le rayon de la Terre - appliquée dans chaque passage qui dessine une position (niveau, tuiles, chaleur, lignes, boîtes, libellés, sélection) comme une seule variable uniforme partagée ; un vrai globe demande aussi des positions centrées sur la Terre pour les données et un rendu relatif à la caméra. Les deux sont prévus avec le mode globe.
- **Monde actuel seulement** : les cartes historiques de DCS et d'IL-2 (Normandie 2, La Manche, Allemagne guerre froide, toutes les cartes IL-2) sont dessinées avec les villes, routes et aménagements côtiers d'aujourd'hui ; le panneau le dit. Les aérodromes de l'époque ne sont pas dessinés.
- **Pas de mode globe** : un décor est un plan local plat. Une vue de la Terre entière est prévue.
- Les routes sont élargies sur les grandes zones pour rester visibles ; de près, elles sont plus larges que nature.
- Les noms de théâtres DCS dans les tables du Watcher sont reconnus tels que DCS les donne dans `mission.theatre` ; un nom absent de la liste revient au premier repère arrondi au degré entier, puis à la latitude et à la longitude seules.

## Cartes historiques (pas encore construites) {#historical-maps-not-built-yet}

Des cartes d'époque pourraient habiller plus tard les théâtres historiques. Les séries de l'US Army Map Service (AMS) sont des œuvres du gouvernement fédéral américain, généralement considérées comme relevant du domaine public (vérifier la fiche de chaque numérisation ; beaucoup sont des rééditions d'originaux GSGS britanniques ou allemands, dont le droit d'auteur de la Couronne ou le délai des œuvres anonymes a aussi expiré) :

| Théâtre | Série | Où elle est numérisée |
|---|---|---|
| IL-2 Stalingrad, Moscou, Kouban, Velikie Louki, Prokhorovka, Leningrad | AMS **N501**, Europe de l'Est 1:250 000 (compilée dans les années 1950 à partir de cartes soviétiques et allemandes) | UT Austin PCL ; certaines feuilles géoréférencées à UT GeoData |
| IL-2 Normandie, DCS Normandie 2 et La Manche | AMS **M661** / GSGS 4250, France 1:50 000 | UT Austin PCL, Princeton |
| IL-2 Rhénanie | AMS **M501** 1:250 000 et **M841** 1:25 000 (Allemagne) | UT Austin PCL |
| IL-2 Corée | AMS **L751** 1:50 000 (éditions de 1951) et **L552** 1:250 000 | ANU Open Research (feuilles L751, « copyright expired »), UT Austin PCL, Yale |
| IL-2 Arras (Flying Circus) | cartes britanniques des tranchées de 1914-1918 (pas AMS) | McMaster University ; National Library of Scotland (conditions non commerciales) |

Les feuilles AMS portent des graduations de latitude et de longitude à leurs coins ; chacune serait donc placée par un calage à quatre coins, puis posée sur le relief comme une texture, construite et gardée localement comme les tuiles.


## Pour les développeurs {#for-developers}

### L'entrée `geo` dans une table Parquet {#the-geo-entry-in-a-parquet-table}

```json
"geo": {"lat0": 42.0, "lon0": 42.0, "projection": "tangent-plane", "east": "x", "north": "z", "up": "y",
        "dcs": {"theatre": "Caucasus", "x": "dcs_x", "y": "dcs_y", "z": "dcs_z"}}
```

`east`, `north` et `up` nomment les colonnes qui contiennent les mètres vers l'est et vers le nord sur le même plan tangent en (`lat0`, `lon0`), et l'altitude. Le chargement porte la référence quand son mappage prend exactement ces colonnes (l'est en X, le nord et la hauteur en Y et Z, dans un sens ou dans l'autre). L'entrée facultative `dcs` nomme les mètres propres d'une table DCS (x nord, y haut, z est) et son théâtre : un chargement qui mappe ces colonnes est alors placé par la projection de Mercator transverse du théâtre ([coordonnées DCS](#dcs-coordinates)). Une table sans `geo` se lit comme avant.

### Coordonnées DCS {#dcs-coordinates}

Chaque théâtre DCS est une projection de Mercator transverse (WGS84, échelle 0,9996) avec son propre méridien central et sa propre origine fausse ; x de DCS est la distance au nord et z la distance à l'est. Les constantes sont celles que publie le projet pydcs ; le calcul est la série de Krüger à l'ordre six (Karney 2011), portée dans [`src/world/dcsProjection.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/dcsProjection.ts). Un décor en mètres DCS est construit directement dedans : une table DCS du Watcher mappée par `dcs_x`/`dcs_y`/`dcs_z`, un niveau écrit par le convertisseur de terrain DCS, et le décor partagent donc un même repère. Les constantes de l'Irak ne sont pas publiées ; elles sont ajustées sur des points de référence publiés (4 cm en moyenne quadratique).

Les tables DCS du Watcher sont sur un plan tangent au point de référence fixe du théâtre (le même point que celui du sélecteur de théâtre, ci-dessous) ; plusieurs missions d'un même théâtre se fusionnent donc avec leur référence intacte et s'alignent sur un décor de théâtre sans le déplacer.

### Simplification et budget {#simplification-and-budget}

- Les bâtiments de moins de 20 m² sont supprimés ; 60 m² quand le cadre dépasse 30 km de large, 150 m² au-delà de 80 km. Les autres sont ajoutés du plus grand au plus petit jusqu'à ce que les bâtiments atteignent 1,5 M de triangles.
- Les routes secondaires, de desserte et les pistes sont supprimées au-delà de 60 km de large ; au-delà de 150 km, il ne reste que les autoroutes, routes principales, primaires et secondaires.
- Le décor entier reste sous environ 3 M de triangles. La note d'import indique combien de bâtiments ont été omis.
