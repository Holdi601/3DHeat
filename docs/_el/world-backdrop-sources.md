---
title: "Φόντο κόσμου - πηγές και όροι"
parent: "Φόντο κόσμου"
grand_parent: "Επίπεδα και γεωμετρία φόντου"
nav_order: 1
lang: "el"
source: "world-backdrop-sources.md"
source_hash: "c84aaa683dc8"
translated: true
outdated: false
---

# Φόντο κόσμου: πηγές και όροι

Τα δεδομένα χάρτη ενός [φόντου κόσμου](world-backdrop.md) προέρχονται από ανοιχτές υπηρεσίες. Αυτή η σελίδα απαριθμεί κάθε πηγή, την άδεια της και πώς το 3DHeat μένει μέσα στους όρους της.

| Πηγή | Όροι (όπως διαβάστηκαν στις 7 Νοεμβρίου 2026) |
|---|---|
| [OpenFreeMap](https://openfreemap.org) - διανυσματικά πλακίδια σχήματος OpenMapTiles από το OpenStreetMap, τρέχουσα έκδοση με όνομα `https://tiles.openfreemap.org/planet` | Δωρεάν, χωρίς κλειδί, επιτρέπεται η εμπορική χρήση. Οι [όροι](https://openfreemap.org/tos/) απαγορεύουν τη συλλογή δεδομένων "με αυτοματοποιημένους τρόπους, εκτός από λήψεις για χρήση εκτός σύνδεσης": μια εφαρμογή μπορεί να αφήσει τους χρήστες να κατεβάσουν μια περιοχή για χρήση εκτός σύνδεσης αν κάθε λήψη είναι το πολύ 3.000 πλακίδια ή 50 MB, με το πολύ 4 ταυτόχρονα αιτήματα, και με User-Agent που ταυτοποιεί την εφαρμογή. Η αναφορά είναι υποχρεωτική: "OpenFreeMap © OpenMapTiles Data from OpenStreetMap" (το μέρος του OpenFreeMap προαιρετικό). Η υπηρεσία μπορεί να τερματιστεί χωρίς ειδοποίηση. |
| Δεδομένα [OpenStreetMap](https://www.openstreetmap.org/copyright) | ODbL 1.0. Η λήψη τους κατά την εκτέλεση και η σχεδίασή τους τοπικά είναι ιδιωτική χρήση· η σχεδιασμένη προβολή είναι Παραγόμενο Έργο που χρειάζεται ορατή αναφορά, και το ίδιο ισχύει για στιγμιότυπα και βίντεο που φτιάχνονται από αυτήν. |
| Σχήμα [OpenMapTiles](https://openmaptiles.org) | CC BY 4.0 για το σχήμα· αναφορά "© OpenMapTiles". |
| [OurAirports](https://ourairports.com/data/) `runways.csv` | Κυκλοφορεί στο δημόσιο domain· χωρίς κλειδί. Η αναφορά "Runways: OurAirports (public domain)" εμφανίζεται ως ευγένεια. |
| [EOX Sentinel-2 cloudless](https://cloudless.eox.at) 2016, `tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg` | Το στρώμα του 2016 είναι CC BY 4.0 (τα μεταγενέστερα έτη είναι CC BY-NC-SA, δεν χρησιμοποιούνται). Η σελίδα υπηρεσίας της EOX προσκαλεί τη χρήση των σημείων πρόσβασης σε εφαρμογές, ως υπηρεσία επίδειξης χωρίς εγγύηση και με περιορισμό ρυθμού· δεν λέει τίποτα για την προσωρινή αποθήκευση, την οποία επιτρέπει το CC BY. Αναφορά, που εμφανίζεται στον καμβά: "EOxCloudless https://cloudless.eox.at by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 & 2017)", με σύνδεσμο. CORS: η προέλευση του αιτήματος επιστρέφεται. |
| [Mapterhorn](https://mapterhorn.com), `tiles.mapterhorn.com/{z}/{x}/{y}.webp` | WebP χωρίς απώλειες 512 px με κωδικοποίηση Terrarium, χωρίς κλειδί, ανοιχτό CORS. Πηγές υπό CC BY, δημόσιο domain και παρόμοιες ανοιχτές άδειες (καμία μη εμπορική ή share-alike)· αναφορά "© Mapterhorn" και, για το παγκόσμιο στρώμα, "produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA". Δεν υπάρχει δημοσιευμένη πολιτική χρήσης για το δημόσιο σημείο πρόσβασης. |
| [USGS The National Map](https://www.usgs.gov/programs/national-geospatial-program/national-map) ορθοφωτογραφίες, `basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}` | USGS: "Most U.S. Geological Survey (USGS) information resides in the Public Domain and may be used without restriction"· ζητά αναφορά, π.χ. "(Όνομα προϊόντος ή δεδομένων) courtesy of the U.S. Geological Survey". Η υπηρεσία ονομάζει την πηγή της "USDA, USGS The National Map: Orthoimagery" (USDA NAIP, επίσης έργο δημοσίου domain της ομοσπονδίας)· αυτή είναι η αναφορά που εμφανίζεται. Χωρίς κλειδί, ανοιχτό CORS. |
| [IGN Géoplateforme](https://cartes.gouv.fr/cgu) BD ORTHO, `data.geopf.fr/wmts?…LAYER=ORTHOIMAGERY.ORTHOPHOTOS…TILEMATRIXSET=PM…` | Οι όροι της Géoplateforme αναφέρουν το WMTS ως "Non soumis à limite d'usage" (χωρίς όριο χρήσης· το WMS περιορίζεται σε 40-50 αιτήματα το δευτερόλεπτο)· τα δεδομένα είναι "soumises à la licence choisie et renseignée par le Fournisseur de données", εξ ορισμού η Etalab Licence Ouverte, με την οποία η BD ORTHO είναι ανοιχτή από το 2021· οι χρήστες πρέπει "ne pas nuire, entraver ou fausser le bon fonctionnement des API". Η προσωρινή αποθήκευση δεν αναφέρεται· η Licence Ouverte επιτρέπει επαναχρησιμοποίηση με αναφορά της πηγής: "Orthophotos: © IGN – BD ORTHO, Licence Ouverte 2.0". Χωρίς κλειδί, ανοιχτό CORS. |
| [AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) (Mapzen / Tilezen), `s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` | Ανοιχτά δεδομένα από πολλές πηγές, καθεμία με τη δική της αναφορά ([λίστα](https://github.com/tilezen/joerd/blob/master/docs/attribution.md))· χωρίς κλειδί, χωρίς εγγύηση υπηρεσίας, σερβίρεται με ανοιχτό CORS. Τα ύψη αποκωδικοποιούνται ως `R × 256 + G + B / 256 − 32768` μέτρα. |

## Πώς το φόντο μένει μέσα σε αυτούς τους όρους {#how-the-backdrop-stays-inside-those-terms}

- Ένα φόντο κάτω από μια εγγραφή κατεβάζει το πολύ 36 πλακίδια υψομέτρου και 300 διανυσματικά πλακίδια· ένα θέατρο που χτίζεται μία φορά το πολύ 64 + 100 πλακίδια υψομέτρου και 64 + 1.500 διανυσματικά πλακίδια· ένα θέατρο σε ροή ένα πλακίδιο από κάθε πηγή τη φορά ανά πλακίδιο χάρτη, καθώς κινείται η κάμερα. Τέσσερα αιτήματα τη φορά ανά πηγή.
- **Ένα θέατρο που χτίζεται μία φορά είναι μία λήψη**, και κατεβάζει το πολύ 1.000 διανυσματικά πλακίδια ή 40 MB (οι όροι του OpenFreeMap επιτρέπουν 3.000 πλακίδια ή 50 MB). Τα πλακίδια ζητούνται πρώτα από το κέντρο· πέρα από το όριο, το χτίσιμο παίρνει μόνο πλακίδια που υπάρχουν ήδη στη μνήμη και λέει πόσα ακόμη περιμένουν. Ξαναχτίζοντας φέρνει το επόμενο κομμάτι, και ούτω καθεξής: μια μεγάλη περιοχή έρχεται σε κομμάτια, καθένα αποθηκευμένο.
- Μετρημένο σε συνθετικές πτήσεις: ένα θέατρο με λεπτομερή περιοχή 25 km χρειάζεται περίπου 370 πλακίδια και 20 MB την πρώτη φορά. Χτισμένο ξανά, ή αν πετάξετε πάνω του ξανά, δεν κατεβαίνει τίποτα.
- Τα πλακίδια κατεβαίνουν μόνο όταν πατηθεί **Φόντο κόσμου**, ποτέ στο παρασκήνιο.
- Ο περιηγητής δεν επιτρέπει σε μια σελίδα να ορίσει το δικό της User-Agent· τα αιτήματα φέρουν αυτό του περιηγητή, και την προέλευση της σελίδας ως `Origin`/`Referer`. Μια έκδοση του προβολέα για υπολογιστή θα πρέπει να στέλνει το δικό της.
- **Τίποτα που προέρχεται από το OpenStreetMap δεν αποστέλλεται ποτέ** μαζί με τον προβολέα ούτε κατατίθεται στο αποθετήριό του: η ρήτρα share-alike του ODbL ισχύει για μια διανεμημένη παράγωγη βάση δεδομένων. Τα φόντα χτίζονται στον υπολογιστή του χρήστη και κρατιούνται μόνο σε αυτόν τον περιηγητή (η μνήμη πλακιδίων και, αν αποθηκευτούν, η βιβλιοθήκη επιπέδων).
