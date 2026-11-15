---
title: "Parité avec Tacview"
parent: "Replay de match"
grand_parent: "Replay"
nav_order: 1
lang: "fr"
source: "tacview-parity.md"
source_hash: "4275603255c2"
translated: true
outdated: false
---

# Parité avec Tacview

Tacview est un programme populaire pour regarder les enregistrements de vol. Si vous le connaissez, cette page montre où se trouve chacun de ses outils dans 3DHeat.

Elle recense chaque fonction de Tacview 1.9 (son manuel, sa table de chaînes de l'interface et le format de fichier ACMI 2.2) et indique où en est le [replay de match](match-replay.md) de 3DHeat par rapport à elles. Le but : ce que Tacview peut faire pour un replay et ses données, 3DHeat peut le faire aussi.

**Statut :**
- **done** : déjà dans 3DHeat.
- **new** : construit pour correspondre à une fonction de Tacview.
- **not yet** : s'applique, pas encore construit.
- **n/a** : ne s'applique pas ici, avec la raison.

Où trouver les fonctions : l'onglet **Match**, **Replay en figurines** (ou **Figurines superposées** dans l'onglet Carte de chaleur), dans les sections de la barre latérale **Replay**, **Unités**, **Événements**, **Signets**, **Affichage tactique**, **Statistiques**, **Décalage temporel et découpe**, **Carte et position**, **Audio et vidéo** et **Étiquettes**. Voir [Replay de match](match-replay.md).

## Caméras

| Tacview | 3DHeat | Statut |
|---|---|---|
| Vue cockpit (F5), l'horizon basculant avec l'appareil | **Cockpit** : hors de l'unité, selon son attitude, comme le prévoit le modèle de mouvement. La figurine de l'unité elle-même est masquée. Faites glisser pour regarder autour ; **Regarder de nouveau devant** réinitialise. | new |
| Affichage tête haute dans la vue cockpit (choix IAS/CAS/TAS) | **Affichage tête haute** (H) : horizon et échelle de tangage de la vue réelle, marqueur de trajectoire, bande de cap, IAS, altitude, TAS, Mach, G, incidence, vitesse verticale, AGL | new |
| Instruments 3D du cockpit, suivi de la tête du pilote (PilotHead*), TrackIR | Pas de modèles de cockpit ; les angles de tête sont affichés dans la fiche de l'unité, vue **Brut** | n/a (pas de modèles de cockpit ; le suivi de tête relève du matériel pour le vol en direct) |
| Vue externe (F6) : orbiter autour de l'objet principal | **Poursuite** (tourne avec l'unité) et **Orbite** (garde sa propre direction) | done |
| Caméra de combat tournoyant, « Regarder la cible » (padlock) | **Padlock** : depuis le cockpit, maintenue sur la cible | new |
| Caméra de combat tournoyant, « Centrée » / « Regarder devant » | **Cible** : derrière l'unité, sur la ligne issue de la cible, regardant au-delà vers la cible. **Fixe** à l'azimut 0 regarde vers l'avant depuis l'avant. | new |
| Échanger principal et secondaire | **Échanger** à côté de la cible | new |
| Vue satellite (F7), vue orthographique de dessus | **Satellite** : droit au-dessus de l'unité, nord en haut ; faites glisser pour tourner. La carte 2D est le plan orthographique. | new |
| Caméra libre (F8), W/A/S/D, E/C | La caméra libre de vol (W/A/S/D, Espace/Q, Maj/Alt) | done |
| Caméra Head-On d'extension ; caméra externe fixée à l'objet | **Fixe** : un point autour de l'unité qui tourne et roule avec elle ; faites glisser pour le déplacer (derrière, au bout d'aile, de face) | new |
| Extension Lock Camera (figer la position) | Arrêter de suivre (Échap) : la caméra reste où elle était | done |
| Vue stratégique (dézoomer jusqu'à la Terre entière) | [Décor du monde réel](world-backdrop.md) et le cadre de l'enregistrement entier de la carte 2D | done |
| Réglage du champ de vision | **Caméra et scène** : champ de vision (FOV) | done |
| Passer d'une vue à l'autre avec des touches | **V** vue suivante, **Maj+V** vue précédente | new |

## Vue 3D et options d'affichage

| Tacview | 3DHeat | Statut |
|---|---|---|
| Traînées en ruban, curseur de longueur | Traînées (secondes) dans le visualiseur d'équipe | done |
| Traînée anticipée (trajectoire devant) | **Trajectoire à venir** : là où l'unité va réellement dans les secondes suivantes | new |
| Lignes de hauteur de l'objet / murs | **Lignes verticales** | done (lignes ; murs non construits) |
| Vecteurs de l'objet sélectionné : cap (pointillé), route (plein), portance | **Vecteurs vitesse** (route et vitesse pendant tant de secondes, avec une pointe) et **Lignes de nez et de portance** (nez en tirets, portance courte et sombre) | new |
| Ligne de visée du pilote | **Ligne de visée du pilote** : une ligne cyan en tirets suivant PilotHeadYaw/PilotHeadPitch (ou une colonne HeadYaw, ViewYaw ou LookYaw) par rapport aux axes de l'unité | new |
| Dômes de portée létale SAM/AAA (EngagementRange, VerticalEngagementRange, EngagementMode, jumelles « 2 ») | **Zones d'engagement** : dômes, ovoïdes lorsque la portée verticale diffère, désactivés tant que EngagementMode vaut 0 | new |
| Verrouillages radar (LockedTarget..9) avec étiquettes | **Verrouillages** : lignes rouges vers chaque objet verrouillé ; en tirets ambre vers FocusedTarget ; le long de LockedTargetAzimuth/Elevation/Range lorsqu'aucun objet n'est nommé. **Étiquettes de verrouillage** : le nom de la cible et la distance sur chaque ligne de verrouillage | new |
| Cône radar (RadarMode, Azimuth, Elevation, Roll, Range, largeurs de faisceau) et porte de distance | **Cônes radar** : bord et anneau médian du faisceau, tourné selon azimut, élévation et roulis par rapport à l'unité ; la porte de distance en deux bords jaunes. Sans largeurs de faisceau, seul l'axe du faisceau. | new |
| Ligne de vue entre les deux objets sélectionnés (vert / rouge en pointillés lorsque le relief bloque) | La ligne de la paire mesurée devient rouge et en tirets lorsque le terrain est entre elles | new |
| Agrandir automatiquement les objets lointains | Plus petite figurine à l'écran (pixels) | done |
| Grille latitude/longitude | **Carte et position → Grille** : lignes de latitude et de longitude sur le sol sous la caméra, à un pas rond selon la hauteur (de 10° jusqu'à 1'), étiquetées ; ou la grille kilométrique **MGRS** de la zone UTM, avec la zone et le carré de 100 km affichés. La grille propre à la carte 2D, comme avant | new |
| Anneaux de bullseye | Anneaux autour du bullseye de chaque équipe sur la carte 2D | new (2D only) |
| Superposition de plan de descente | **Plans de descente** : trajectoires à 3° avec les bords de pleine échelle à ±0,7° sur les deux extrémités de chaque piste proche de l'enregistrement, à partir des seuils et altitudes relevés de OurAirports (téléchargés une fois, conservés hors ligne), une graduation à chaque mille nautique, nommés par aéroport et piste | new |
| Restrictions d'altitude (alarme de plafond/plancher) | **Restriction d'altitude** : un plancher et un plafond ; les étiquettes des unités hors limites deviennent rouges, et chaque franchissement (sous le plancher, au-dessus du plafond, retour à l'intérieur) est listé : un clic y va et suit l'unité | new |
| Objets détruits en gris, retirés après 15 min | Les vies s'arrêtent avec leur tracé ; une unité morte est estompée dans la liste des unités | done |
| Propriétés Visible / Disabled | Affichées dans **Brut** ; rien n'est masqué par elles | not yet |
| Affichage des positions du manche, des gaz et des pédales | Gaz et valeurs moteur dans des champs ; commandes dans **Brut** | done (en valeurs) |
| Commentaires en sous-titres | **Messages en sous-titres** (Étiquettes) : événements ACMI Message et Comment, et le chat de n'importe quel jeu (événements Chat, Say ou Radio, ou une colonne de chat), en bas de la vue avec le nom de l'auteur, pendant six secondes | new |
| Affichage de la date et de l'heure UTC | Horloge de la chronologie en UTC lorsque l'enregistrement a une heure de référence | done |
| Position de la souris en latitude/longitude, MGRS, bullseye | La fiche de sélection (clic sur un point) donne la latitude/longitude en degrés, minutes et secondes et le MGRS à côté des mètres du monde ; bullseye par unité (champ) | new |
| Logo personnalisé | Non construit | n/a (image de marque) |
| Modèles 3D, le plus proche lorsque inconnu | Catalogue de figurines propre, équivalent le plus proche, taille réelle | done |
| Engagements multiples (lignes entre toutes les paires) | **Lignes d'engagement** : de chaque unité dans le périmètre vers chaque adversaire à portée définie (1-200 km), chacune avec sa distance, les 60 paires les plus proches ; la paire mesurée comme avant | new |

## Étiquettes

| Tacview | 3DHeat | Statut |
|---|---|---|
| Étiquettes activées/désactivées, séparément pour les objets sélectionnés et non sélectionnés | **Étiquettes** avec des règles pour **Sélectionnées**, **Aéronefs**, **Terrestres**, **Navires**, **Armes** et **IA** : affichées ou non, valeurs propres, priorité | new |
| Champs d'étiquette : nom, indicatif, pilote, vitesses (TAS/CAS/IAS/Mach/GS), altitudes (ASL/AGL), VS, AOA, AOS, G (vertical, latéral, longitudinal), vitesse et rayon de virage, énergie, carburant poids/volume/débit, cap/route, roulis/tangage, fréquence cardiaque | Chaque valeur de `fields.ts` : la même liste, calculée là où elle n'est pas enregistrée (estimations marquées ~). Taux de roulis et SpO2 uniquement via Brut. | done |
| Position du bullseye dans les étiquettes | Champ **Bullseye (relèvement / distance)** | new |
| Écarts ILS, distance parcourue | Valeurs brutes ; distance parcourue dans les statistiques | done (en partie) |
| Désencombrer la télémétrie non sélectionnée | **Écarter les étiquettes**, ordonnées selon la priorité de chaque règle | done / new |
| Étiqueter tous les objets au sol / seulement les menaces | Les règles Terrestres et IA | new |
| Échelle des étiquettes | **Taille des étiquettes** (60-250 %) | new |
| Unités métriques / impériales | Métrique / impérial | done (deux préréglages, pas huit) |

## Objet et télémétrie

| Tacview | 3DHeat | Statut |
|---|---|---|
| Sélection principale et secondaire | Le clic suit et sélectionne ; maj-clic sur deux objets pour mesurer ; sélecteur **Cible** | done / new |
| Distance / relèvement / aspect / fermeture entre deux objets | Ligne BRAA de la paire mesurée ; champs Distance, Relèvement, Aspect et Fermeture depuis l'unité suivie | done |
| Gisement relatif, vitesse angulaire de la ligne de visée | Champs **Gisement** (depuis le nez de l'unité suivie, G/D) et **Vitesse angulaire de la ligne de visée** (°/s) | new |
| Fenêtres de télémétrie | La fiche de l'unité et la fiche au survol | done |
| Télémétrie brute (chaque propriété enregistrée, même inconnues) | **Brut** dans la fiche de l'unité : chaque colonne à la ligne de l'unité, telle qu'écrite | new |
| Liste des objets actifs | **Unités** : joueurs, IA, armes en vol ; les vivantes en clair | done |
| Fenêtre des propriétés de l'enregistrement (titre, auteur, briefing...) | Conservées dans la colonne RecordingInfo ; affichées dans Brut | done (pas de fenêtre) |
| Formats de position DMS/MGRS, nord magnétique | Champs **Position (lat / long)** en DMS et **MGRS** ; un champ **Cap magnétique** ; **Caps magnétiques** écrit cap, route et relèvement magnétiques (°M) et affiche une boussole avec les deux nords et la déclinaison - le World Magnetic Model 2025 (coefficients du domaine public), calculé ici au lieu et à la date de l'unité | new |

## Graphiques

| Tacview | 3DHeat | Statut |
|---|---|---|
| Graphique d'un objet, jusqu'à 4 valeurs | **Dans le temps** (et le graphique sous Replay) | done |
| Tracer jusqu'à 4 objets à la fois | **Comparer** : une valeur pour jusqu'à 8 unités sur une seule échelle | new |
| Valeur contre valeur (style énergie-manœuvrabilité) | **Valeur / valeur** : vitesse de virage contre vitesse ou toute autre paire, chaque unité une ligne, son point courant marqué | new |
| Axe X par temps ; zoom ; déplacer le temps depuis le graphique | La molette zoome dans le temps, double clic réinitialise, un clic va au moment choisi | new |
| Axe X par distance en vol ou au sol | **Temps / Distance en l'air / Distance au sol** sur les graphiques temps et comparaison ; zoom et aller-au-clic fonctionnent de la même façon | new |
| Graphiques prédéfinis (énergie, accélération...) | Toute valeur peut être choisie (la hauteur d'énergie et son taux sont des valeurs) | done |

## Statistiques, journal de vol, événements

| Tacview | 3DHeat | Statut |
|---|---|---|
| Journal de vol : décollé, atterri, a tiré, touché par, détruit par, a quitté la zone | **Statistiques** par unité : vies, victoires, morts, tirs, coups au but, taux de réussite, décollages, atterrissages, temps en vol, G max (et min), vitesse max, hauteur et Mach, distance. Les décollages viennent des événements TakenOff/Landed, OnGround, AGL, ou d'une estimation marquée ~. | new |
| Tableau des scores et rapport de mission (compléments) | Résumé par équipe et plus de victoires ; le propre tableau des scores du résumé de match | new / done |
| Exporter le journal de vol XML/CSV | **Exporter CSV** des statistiques, et des événements tels qu'ils sont listés | new (CSV seulement) |
| Exporter la télémétrie en CSV à une cadence donnée | **Télémétrie de l'unité sélectionnée** : chaque valeur, de 1 à 20 par seconde | new |
| Journal des événements, double clic pour y aller et sélectionner | Liste **Événements**, filtrée par type et unité ; un clic y vole | done |
| Événement précédent / suivant (Ctrl+←/→) | **Page précédente / Page suivante** | new |
| Pause sur événement | **Pause sur événement** | new |
| Repères de chronologie (largages, coups, destructions ; ceux de l'objet sélectionné en bleu ; signets en rouge) | Victoires et morts sous forme de barre de densité, celles de l'unité suivie en bleu, signets en rouge ; un clic pour y aller | new |
| Supprimer un événement, suppression par abattage | Non construit | n/a (les événements appartiennent à l'enregistrement ; les filtres les masquent) |

## Signets

| Tacview | 3DHeat | Statut |
|---|---|---|
| Insérer un signet avec la sélection et le point de vue | **Ajouter un signet** (B) : le moment, la caméra libre ou l'unité suivie avec sa vue, sa distance et sa cible ; nommé ; conservé dans ce navigateur pour chaque enregistrement | new |
| Supprimer un signet | × dans la liste | new |
| Signets sur la chronologie et dans les journaux | Repères rouges ; la liste | new |
| Event=Bookmark en ACMI | Listé sous les repères de l'enregistrement, avec les victoires, les morts et les messages | new |
| Raccourci copier/coller (partager une vue) | **Exporter / Importer** les signets dans un fichier ; C copie la pose de la caméra | new |

## Lecture

| Tacview | 3DHeat | Statut |
|---|---|---|
| Lecture/pause, retour au début, vitesse, défilement de la chronologie | Chronologie | done |
| Image par image | **,** et **.** une seconde en arrière et en avant (Maj : dix) | new |
| Lecture inversée | **◀** sur la chronologie, **J** (**L** en avant ; la même touche de nouveau met en pause) : joue de la fin vers le début à la vitesse choisie, en boucle ou en s'arrêtant au début | new |
| Dialogue de saut temporel | La chronologie et la liste des événements | done |
| Décaler un objet dans le temps (fantôme) | **Décalage temporel et découpe** : déplacer le vol d'une unité, ou un enregistrement entier, de tant de secondes ; **Aligner les enregistrements** met plusieurs enregistrements au même départ et les lit ensemble (deux sorties de jours différents côte à côte). L'enregistrement est reconstruit, donc les traînées, événements, graphiques et statistiques suivent | new |
| Couper avant/après | **Depuis maintenant / Jusqu'à maintenant / Couper à cette plage** (annuler conserve les décalages), puis **Exporter CSV** (se recharge dans 3DHeat) ou **Exporter ACMI** (texte Tacview 2.2, pour un enregistrement placé sur la Terre) | new |

## Terrain et carte

| Tacview | 3DHeat | Statut |
|---|---|---|
| Terrain réel, altitude et textures personnalisées | Niveaux (la carte du jeu en modèle 3D), tuiles du décor du monde réel | done |
| Modes de terrain plat / vide / fort contraste | [Apparence du niveau](level-appearance.md) : relief du sol, surface et structures affichés ou non | done (pas les mêmes modes) |
| Carte tactique 2D (Tacview n'en a pas : vue satellite) | **Carte 2D** : vue en coin ou complète, symboles par type et équipe (joueurs pleins, IA contournées) tournés vers leur cap, traînées, noms, échelle, anneaux de portée autour de l'unité suivie, anneaux de bullseye, position de la caméra 3D, morts récentes ; glisser, molette, clic pour suivre (M) | new |
| Objets statiques (aéroports, pistes, points de repère, zones, KML) | Pistes relevées (OurAirports) dans le décor du monde réel et leurs plans de descente ; les points de repère GPX et les repères KML se chargent comme objets fixes ; le [Tableau tactique](tactics-board.md) trace zones et routes | new |

## Import, export, enregistrement

| Tacview | 3DHeat | Statut |
|---|---|---|
| ACMI texte et zip | [ACMI Tacview](tacview-acmi.md) | done |
| GPX, KML, CSV, NMEA, IGC, FIT, DIS... | **GPX** (traces, routes, points de repère ; fréquence cardiaque, cadence, puissance, température Garmin), **KML/KMZ** (gx:Track, LineString, Point), **NMEA 0183** (RMC et GGA de tout émetteur, sommes de contrôle vérifiées, à travers minuit), **IGC** (enregistrements B, date, pilote et planeur), **FIT** (messages d'enregistrement, horodatages compressés) - chacun placé par latitude et longitude sur le plan au milieu des traces, pour que le décor du monde réel s'aligne ; cap, tangage et vitesse depuis le fichier ou de point à point. CSV et Parquet comme avant | new (DIS n/a : un protocole réseau en direct) |
| Enregistreurs natifs (DCS, BMS, IL-2, MSFS...) | Les convertisseurs propres à 3DHeat (War Thunder, CS2, Squad, Arma et d'autres) | done (own) |
| Télémétrie en temps réel par TCP, ADS-B | Non construit | n/a (les replays viennent après le match) |
| Audio et vidéo synchronisés | **Audio et vidéo** : un fichier local se lit, se met en pause, se déplace et change de vitesse avec la chronologie à partir d'un départ fixé (**Commence maintenant**, ±0,1 s) ; une vidéo dans un panneau redimensionnable au-dessus de la vue, ou en incrustation. Le fichier reste dans le navigateur | new |
| Export vidéo | [Trajectoire de caméra et vidéo](camera-path-and-video.md) | done |

## Autres

| Tacview | 3DHeat | Statut |
|---|---|---|
| Extensions Lua | Non construit | n/a (open source : modifier le visualiseur lui-même) |
| Débriefing en ligne (session partagée) | Non construit | n/a (celui de Tacview est une session hébergée qui garde tout le monde sur une même tête de lecture. 3DHeat n'a pas de serveur et garde les enregistrements sur la machine du visualiseur, et même une liaison pair à pair demande un serveur de signalisation. Un débriefing se partage sous forme de fichiers : l'enregistrement découpé (Exporter ACMI ou CSV) et le fichier des signets, qui s'ouvrent aux mêmes moments et vues) |
| Télécommande d'instructeur | Non construit | n/a (commande un simulateur en cours d'exécution) |
| Édition d'objets (ajouter, modifier, supprimer des objets) | [Tableau tactique](tactics-board.md) pour les objets planifiés ; les enregistrements sont en lecture seule | n/a |
| Langues | 40 langues | done |
| Authentification des enregistrements | Non construit | n/a |

## Pour les développeurs : propriétés ACMI 2.2

Lues par `data/acmi.ts` ; les propriétés numériques deviennent des colonnes de nombres, les textes des colonnes de catégories. Toutes sont affichées sous **Brut** dans la fiche de l'unité. Elles sont lues dans un but précis :

| Propriétés | Usage |
|---|---|
| T (les quatre formes), Name, Type, Pilot, Group, Country, Coalition, Color, CallSign | Position, attitude, figurine, nom de l'unité, équipe |
| IAS, CAS, TAS, Mach, AOA, AOS, AGL, HDG, HDM, OnGround | Champs, graphiques, ATH, détection des décollages et atterrissages |
| VerticalGForce, LongitudinalGForce, LateralGForce | Champs G |
| Throttle(2), Afterburner, EngineRPM(2), NR, AirBrakes, Flaps, LandingGear, Tailhook | Champs |
| FuelWeight..9, FuelVolume..9, FuelFlowWeight..8 | Champs carburant, sommés sur les réservoirs |
| RadarMode, RadarAzimuth, RadarElevation, RadarRoll, RadarRange, RadarHorizontalBeamwidth, RadarVerticalBeamwidth, RadarRangeGateAzimuth/Elevation/Min/Max/HorizontalBeamwidth/VerticalBeamwidth | Cônes radar et porte de distance |
| LockedTarget..9, LockedTargetMode, LockedTargetAzimuth/Elevation/Range, FocusedTarget | Lignes de verrouillage |
| EngagementMode(2), EngagementRange(2), VerticalEngagementRange(2) | Dômes d'engagement |
| QNH, AltimeterSetting, WindSpeed, WindDirection, HeartRate | Champs |
| Health | Champ |
| Événements : Destroyed, TakenOff, Landed, Bookmark, Message, Comment, LeftArea, Timeout | Liste des événements, statistiques (morts, décollages, atterrissages), signets ; Message et Comment en sous-titres |
| PilotHeadYaw, PilotHeadPitch | Ligne de visée du pilote |
| Balise de type Bullseye (Navaid+Static+Bullseye) | Champ bullseye et anneaux de carte |
| Tout le reste (PilotHeadRoll, commandes, surfaces, écarts ILS, SpO2, ENL, Label, Debug, Importance, Slot, Visible, Disabled, Radius, tailles...) | Affiché tel qu'écrit sous **Brut** |

Les angles radar et de verrouillage sont pris par rapport aux axes propres de l'unité : azimut vers la droite, élévation vers le haut, roulis aile droite vers le bas. La spécification ACMI indique qu'ils sont relatifs à l'appareil, mais pas dans quel sens est le positif ; cette lecture suit sa transformation (lacet dans le sens horaire, tangage vers le haut, roulis aile droite).
