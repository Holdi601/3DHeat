---
title: "Welt-Hannergrond"
parent: "Levelen an Hannergrondgeometrie"
nav_order: 5
has_children: true
lang: "lb"
source: "world-backdrop.md"
source_hash: "d42a67d56aca"
translated: true
outdated: false
---

# Richteg Welt als Hannergrond

En Hannergrond vun der richteger Welt leet de richtege Buedem ënner eng Fluchopnam: Hiwwelen, Stroossen, Flëss, Fluchplazen a Gebaier, dat ass aus fräi verfügbaren Kaartedaten erofgelueden. Benotzt en, wann eng Tacview-Opnam soss iwwer engem eidelen Gitter schwiewen géif. Et ass e [Level](glossary.md), also liegen d'Hitz an d'Figuren drop.

## En Hannergrond bauen {#build-one}

1. Lued eng Fluchopnam, déi seet, wou se op der Äerd ass (eng Tacview-`.acmi`-Fichier), oder lued näischt a wielt am Schrëtt 3 e Schauplaz. Kuckt [Daten eroflueden](getting-data-in.md).
2. Maach **Hannergrond / Level** an der Säitelleescht op.
3. Dréck **Richteg Welt als Hannergrond**, fir de Buedem ënner Denge Donnéeën ze bauen. Oder wiel e Spillkaart am **Schauplaz** a dréck **Schauplaz-Hannergrond bauen** (oder **Theater streamen**).
4. Waart. Den Panel weist de Fortschrëtt (*Héichtekachelen*, *Kaartekachelen*, *Hannergrond gëtt gebaut*); **Ofbriechen** stoppt en.
5. Flitt just eriwwer. D'Kredittzeil fir d'Kaartedaten steet ënnen rechts an der Usiicht.

Den éischte Bau lued e puer Zéng Megabyte erof. De Browser hält se, also lued en zweeten Bau vum selwechte Gebitt näischt erof. **Kaartekachele vergiessen** läscht se. De Knäppchen **Richteg Welt als Hannergrond** gëtt nëmme gewisen, wann d'geluede Donnéeën eng geografesch Referenz droen (hei ënnen).

Alles gëtt an engem Hannergrondprozess gebaut ([`src/world`](https://github.com/Holdi601/3DHeat/tree/main/src/world)). De Resultat ersetzt den aktuelle Level a verhält sech wéi all [3D-Level](model-levels.md): en verstoppt d'Hitz dahannert, gëtt vum Schnëtt geschnidden, huet d'[Ausseng-Steierungen](level-appearance.md) a kann an d'[Bibliothéik](level-library.md) gespäichert ginn.

## Wou d'Donnéeë sinn: d'geografesch Referenz {#where-the-data-is-the-geographic-reference}

Eng Donnéeëmass kritt nëmmen eng geografesch Referenz vun enger Quell, déi eng ugëtt:

- **Eng ACMI-Opnam**: hire Kapp hir `ReferenceLatitude` an `ReferenceLongitude`, an d'Positiounen, déi de Leser op d'Ebene projizéiert, déi do de WGS84-Ellipsoid beréiert (X Oscht, Y Nord, a Meter; d'Héichte sinn d'Héicht vun der Opnam iwwer dem Mieresspigel). D'Referenz bleift, wann d'Zuuerdnung **X** an **Y** als Buedenachsen hëlt - wat d'eege Hiweiser vun der Opnam maachen - a fält ewech, wann de Buedem vun enger anerer Spalt kënnt, wéi d'flaach Welt-**U** an **V** vun engem Spill.
- **Eng Parquet-Tabell, deren `heat3d`-Hiweiser e `geo`-Eintrag droen** - déi vum [Watcher](https://github.com/Holdi601/3DHeat-Watcher) fir DCS, MSFS, X-Plane an IL-2 (Tacview). Den Eintrag steet ënner [Fir Entwéckler](#for-developers).

Wann e Lued méi Fichieren huet, bleift d'Referenz nëmmen, wann se all dee selwechte hunn. All aner Lueder gëtt dovu net beréiert a bréngt keng mat.

De Hannergrond gëtt op déiselwecht Manéier projizéiert an duerch d'Achsen-Zuuerdnung vum Lued geschéckt, sou datt en ënner den Donnéeën landt, egal wéi d'Zuuerdnung dréint oder skaléiert.

## Schauplazen {#theatres}

De Picker **Schauplaz** listt d'Spillkaarten vun der richteger Welt vu DCS World (Kaukasus, Nevada, Normandie 2, The Channel, Syrien, Persesche Golf, Marianen, Marianen WWII, Südatlantik, Sinai, Afghanistan, Kola, Däitschland Kale Krich, Irak) an IL-2 Great Battles (Stalingrad, Moskau, Kuban, Rheinland, Normandie, Prochorowka, Welikije Luki, Arras, Odessa, Finnesche Golf / Leningrad, Korea), jiddwer mat sengem Kaader op der Äerd ([`src/world/theatres.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/theatres.ts)). D'DCS-Kaderen sinn d'Ausmooss vun den Editeuren, aus de publizéierte Projektiounen ausgerechent; d'IL-2-Kaderen, an déi DCS-Kaderen, déi als esou markéiert sinn, sinn Schätzunge aus de publizéierte Kartegréissten an de Stied um Rand - de Panel seet, wat wéi ass.

**Schauplaz-Hannergrond bauen** baut zwee Detailstufen an engem Netz:

| Stuf | Gebitt | Terrain | Kaart |
|---|---|---|---|
| Schauplaz | dat ganzt Kader | den déifste Zoom bis 10, dee höchstens 64 Héichtekachelen brauch (ongeféier 3 km pro Eck iwwer dem Kaukasus, 1 km iwwer der Normandie) | d'Mier, Séien, Buedemdeckung an Autobunnen aus héchstens 64 Vektorkachelen bei Zoom 4 bis 9 |
| Detailléiert Gebitt | **Ënner den Donnéeën**, **Ronderëm e Punkt** (Breet, Längt, 12 bis 400 km), oder keent | bis Zoom 12 an héchstens 100 Kachelen, héchstens 500.000 Eckpunkten | alles hei uewen, aus héchstens 1.500 Vektorkachelen am déifste Zoom bis 14, deen passt |

Dat detailléiert Gebitt schneidt e Lach an d'Gitter vum Schauplaz, a gëtt op ganz Zellen verbreet, sou datt béid Gitter hir Randlinnen deelen; eng dënn Wand schléisst d'Naht, wou se d'Héichte anescht ofta­sten.

Mat geluedene Donnéeën gëtt de Schauplaz op der Ebene vun den Donnéeën gebaut, sou datt en ënner hinne landt, wéi en gebaut ass. Ouni Donnéeën gëtt en ronderëm den eegenen Referenzpunkt vum Schauplaz gebaut (ganz Grad no bei sengem detailléierte Gebitt). Donnéeë, déi speéider op enger anerer Referenz gelueden ginn - eng ACMI-Fichier nennt hir eege - réckelen den Hannergrond ënner sech: de genaue Réckelen tëschent de beiden Projektiounen gëtt op engem 256 × 256-Gitter iwwer dem Hannergrond ausgerechent an tëschent den Knuet gelies, bannent engem Meter oder zwee iwwer e ganzt Schauplaz ([`src/world/reproject.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/reproject.ts)). E Hannergrond, deen an der Bibliothéik gespäichert ass, behält seng Plaz a réckelt sech selwecht, wann e ënner anere Donnéeën gelueden gëtt.

### En Schauplaz streamen {#streaming-a-theatre}

**Theater streamen** weist de Schauplaz, wéi e Flugsimulatiouns-Kaartebetrachter et mécht: de Buedem kënnt als vill kleng Kachelen ronderëm d'Kamera, gelueden wéi se fléie a fortgeholl, wann se ausser Reechwäit sinn ([`src/world/stream.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/stream.ts)).

- **E Quadtree vu Web-Mercator-Kachelen.** D'Wuerzelen bei Zoom 5 decken 1.500 km ronderëm d'Kamera, sou datt de Buedem iwwer d'Kader vum Schauplaz bis bis zum Horizont reecht. Eng Kachel gëtt a seng véier Kanner gedeelt, wann d'Kamera méi no wéi 1,4 mol hir Breet ass, bis bei Zoom 15 (ongeféier 1 km pro Kachel, 15 m tëscht den Terrain-Eckpunkten): d'Detail gëtt mat der Distanz schwaach, sou wéi et um Bildschierm schwaach gëtt.
- **All Kachel hiert eegent Netz**, an engem Prozess gebaut ([`src/world/tileBuild.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/tileBuild.ts)): e 65 × 65-Terraingitter mat engem Rand ronderëm (sou datt Nopere mat anere Detailen ni en Riss weisen), Buedemdeckung an d'Mier drop gemoolt, Stroossen, Eisebunnen, Séien, Flëss, Fluchplazen, vermiesse Pisten an Gebaier drop, a wahlweis d'Satellitebild vun hirem Quadrat. D'Renderer zeechent d'Kachelen mat der Ausgesi an de Tiefereegelen vum Level, sou datt se d'Hitz dahannert verstoppen wéi all Level.
- **Éischt grof.** D'Kachelen ginn éischt grof an no bei ugefrot, véier Erofluedungen op eemol pro Quell; während d'Kanner vun enger Kachel lueden, steet d'Kachel fir si, sou datt d'Usiicht direkt gefëllt ass an dann schäerfer gëtt.
- **Späicher**: gebaut Kachelen bleiwen bis 600 MB, déi am längsten net gezeechent Kachelen fléie fir als éischt eraus. **Erofluedungen** bleiwen am Kachel-Cache, begrenzt op en 2-GB-Budget, dat Eelst fléit als éischt eraus: zréck iwwer e Gebitt flitt kascht näischt, a gëtt et keng Gränz pro Bau.
- **An d'Bibliothéik gespäichert** als dat, wat gestreamt gëtt - de Schauplaz, seng Optiounen a seng Plaz op der Äerd - net als Kachelen: wann s de gelueden gëtt, gëtt nach eng Kéier gestreamt, aus dem Kachel-Cache, wou d'Kachelen nach sinn. Klicken an de Prüfer treffen d'Kachelen, wéi se all Level treffen.
- Béid Renderer zeechnen d'Kachelen: op enger richteger GPU nieft-enee gepréift (WebGPU an WebGL2 op der selwechter Kaart), och Hitz hanner engem Rück verstoppt.
- Mat geluedene Donnéeën ginn d'Kachelen op der Ebene vun den Donnéeën gebaut; Donnéeën, déi spéider op enger anerer Ebene gelueden ginn, bauen d'Kachelen dort nei (aus dem Cache).
- Gemooss un synthetesche Fluchen iwwer dräi Plaze (Normandie, Nevada, Syrien): ongeféier 63, 45 an 24 MB beim éischte Besuch mat Biller; en zweeten Besuch lued näischt erof.

## Wat gebaut gëtt {#what-is-built}

| Deel | Quell | Wéi |
|---|---|---|
| Bilder (gestreamte Schauplazen, fakultativ) | EOX Sentinel-2 wolkelos 2016 | **Satellitebild** leet dat wolleklos Mosaik vun 2016 (ongeféier 10 m pro Pixel, Zoom 14, déi méi déiwe Kachelen vergréisseren et) iwwer de Buedem an der Plaz vun der gemoolter Buedemdeckung; Stroossen, Pisten, Gebaier a Nimm bleiwen uewendriwwer. |
| Méi fein Bilder (USA, Frankräich) | USGS National Map Orthobiller; IGN BD ORTHO | Wann **Satellitebild** un ass, hëlt eng Kaartekachel vu Zoom 13, déi ganz bannent den zesummenhänkende USA oder der Métropole Frankräich läit, amplaz de nationalen Orthofoto (sechs-zéng vu sengen Kachelen a ee Bild geluecht, ongeféier 1-2 m pro Pixel no beim). Iwwerall soss EOX. |
| Terrain (gestreamte Schauplazen) | Mapterhorn | Copernicus GLO-30 iwwerall (ongeféier 19 m pro Pixel bei Zoom 12), metergenau, wou d'Vermiesung vun engem Land drasteet (Frankräich, d'USA an anerer); gelies zwee Zoomstufen gréwer wéi all Kachel. D'AWS Terrain Tiles, wann Mapterhorn net erreechbar ass. |
| Terrain | AWS Terrain Tiles (Terrarium-PNG) | E Héichtegitter iwwer dem Kader: de Zoom ass de déifste bis 12 (ongeféier 28 m pro Pixel bei 43° N), deen héchstens 36 Kachelen brauch, a d'Gitter gëtt op héchstens 400.000 Eckpunkten ausgedënnt. Als Buedem gezeechent mat de üblechen Relieffhiweiser. |
| Stroossen, Eisebunnen | OpenFreeMap-Vektorkachelen, Schicht `transportation` | Flaach Bänner, iwwer de Buedem geluecht, op den Abstand vum Buedem verdichtet an e puer Prozent vun him an d'Luucht gehuewen, sou datt se mat him net kämpfen. Breedten no Klass, vu 16 m (Autobunn) bis 3 m (Wee, Eisebunn); ni méi schmuel wéi d'Diagonal vum Kader / 5000. Pättercher, Fären an Tunnelen fehlen. |
| Fluchplazen | Schicht `aeroway` | Pist-, Rullbunn-, Vorfeld- a Helikopterpolygonen als Buedem geluecht; Pist- a Rullbunnlinnen als 45 m a 18 m breet Bänner. |
| Waasser | Schicht `water` | D'Mier flaach op 0 m, Séien a Weieren flaach op hirem nidderegsten Ufer, Flëss iwwer de Buedem geluecht. Als Waasser gezeechent: flaach schattéiert, keng Kontouren. |
| Buedemdeckung | Schichte `landcover` a `landuse` | Op d'eege Eckpunkte vum Terrain gemoolt, ouni extra Dräiecker: Bëscher, Gras a Parker gréng, Ackerland strauegel, Feuchtgebidder, Sand, Fiels, Äis; Wunnen-, Industrie-, Geschäfts-, Militär- a Steinbruchgebidder a gedämpfte Faarwen. Waasser gëtt och ënner der Waasserfläch gemoolt, sou datt d'Ufer vun all Héicht liesbar ass. Nackte Buedem kritt e roueg Héichtefaarf (Déifland gro-gréng, Héichland brong, Schnéi iwwer 3.000 m). Liesbar bei der Opléisung vum Terrain: ongeféier 30-45 m am detailléierten Gebitt, Kilometer am Schauplaz. |
| Ortsnimm | Schichte `place` a `aerodrome_label` | Stied, Dierfer a Fluchhäfe mat hirem ICAO-Code, iwwer d'Usiicht geschriwwen; wéi wäit all Aart gewise gëtt, wiisst mat der Héicht vun der Kamera, héchstens 70 op eemol. |
| Vermiesse Pisten | [OurAirports](https://ourairports.com/data/) `runways.csv` (Public Domain) | Fakultativ (**Pisten vun OurAirports**, standardméisseg un): all oppe Pist mat béide Enne an der Lëscht, vu Schwell zu Schwell an hirer gelëschter Breet, mat Säitestreifen, enger gestrechelter Mëttlinn an Schwellbalken. Eng 4-MB-Lëscht, eemol erofgelueden a Cache gehalen. |
| Gebaier | Schicht `building` | Grondrëss vun `render_min_height` bis `render_height` gezunn (6 m, wann et feelt), iwwer dem nidderegsten Buedem drënner; `hide_3d`-Deeler ginn iwwergaang. Als Konstruktioune gezeechent. |

Vektorkachelen ginn bei Zoom 14 gelies (dee eenzege Zoom mat Gebaier), wann d'Kader héchstens 300 dervu brauch, soss am déifste Zoom, deen dat schafft, bis erof op 8. E méi grousst Gebitt kritt nëmmen Terrain.

### Ausgesi {#look}

E Hannergrond fänkt mat **Opgeholl Faarf weisen** un - d'Faarf ass dat, wat eng hell Strooss vum grauen Buedem drënner ënnerscheet, eng donkel Pist vun hirem Vorfeld - mat den Dräieckskanten vum Buedem aus, well e reegelméissegt Gitter näischt seet, mat schwaache Kontouren, engem deckenden Mier (e Buedem drënner géif de Vergläich vun der Déift mat der Uewerfläch bei wäiter Distanz stéieren), a Gebaier hell gro an bal dicht, wéi eng Kaart se zäichent. D'oppe Mier kritt guer keng Buedemdreieker. Alles anescht ass de Standard-Ausgesi vun engem Modell-Level.

## Kredit op der Leinwand {#credits-on-the-canvas}

Solang en Hannergrond de Level ass, steet de Kredit vu senge Quellen ënnen rechts an der Usiicht, ouni datt ee klicke muss, sou datt Screenshots a gerendert Videoen en droen:

> OpenFreeMap © OpenMapTiles · Data © OpenStreetMap contributors · Elevation: Terrain Tiles – SRTM, GMTED2010, 3DEP courtesy of the U.S. Geological Survey; ETOPO1: NOAA; and others

All Deel verlinkt op d'Attributiounssäit vu senger Quell (openstreetmap.org/copyright an d'[Attributiounslëscht](https://github.com/tilezen/joerd/blob/master/docs/attribution.md) vun den Terrain Tiles). En Hannergrond, deen an der Bibliothéik gespäichert ass, behält seng Kreditten a weist se nees, wann en gelueden gëtt. De Text gëtt mam Betrachter iwwersat; d'Nimm net.

## Quellen an hir Bedéngungen {#sources-and-their-terms}

All Quell, hir Lizenz a wéi de Hannergrond sech a den Bedéngungen hält: [Richteg Welt als Hannergrond: Quellen a Bedéngungen](world-backdrop-sources.md).

## D'Kachel-Cache {#the-tile-cache}

All Kachel, an d'TileJSON vun de Vektorkachelen, gëtt am Cache-API vum Browser gehalen, ënnert `3dheat-world-tiles-v1`, nom URL. En zweeten Bau vum selwechte Gebitt mécht guer keng Ufroen a funktionéiert oflinn: d'TileJSON gëtt als éischt gefrot, an, wann dat feelt, nennt seng gespäichert Kopie d'Kachelen, déi schonn do sinn. Kachelen, déi de Server net huet (oppe Mier, 404), gi sech och als fehlend gemierkt.

Vektorkachel-URLe droen den Bau-Datum vun der Kaart, also nodeems OpenFreeMap en neie Bau publizéiert, lued den nächste Hannergrond frësch Kachelen erof, an déi al bleiwen bis se geläscht ginn. De Cache ass op 2 GB begrenzt: wann e se iwwerschreit, ginn déi Kachelen als éischt geläscht, déi am längsten do leien. **Kaartekachele vergiessen** läscht de ganze Cache. De Cache brauch eng sécher Hierkonft (`https://` oder `localhost`); soss lued all Bau nei erof.

## Am Verglach mat Tacview {#compared-with-tacview}

Mat den Ae gepréift op engem Ort pro Schauplaz, mat synthetesche Opnamen: d'Starts leien op den Mëttlinnen vun den gezeechente Pisten, d'Küsteniwwergänn fale op d'Küst. D'Tacview-Säit kënnt aus senger Dokumentatioun an de publizéierte Biller (tacview.net, seng Steam-Säit), net vum Laafen hei.

| | Tacview 1.9 | Dësen Hannergrond, gestreamt |
|---|---|---|
| Ausmooss | de ganze Globus | 1.500 km ronderëm d'Kamera, egal wou se ass |
| Terrain | ETOPO1 (ongeféier 1,25 km) agebaut; SRTM 25-75 m, wann de Benotzer d'Fichieren installéiert; DCS-Terrain aus DCS exportéiert | Copernicus GLO-30 (Mapterhorn), metergenau a Frankräich an den USA |
| Bilder | keng agebaut; Texturen, déi de Benotzer lued (Mapview, SAS Planet, Add-ons wéi eng VFR-Kaart vum Kaukasus) | EOX Sentinel-2 wolkelos 2016, ongeféier 10 m, gestreamt |
| Buedemdeckung | keng, ausser an enger Textur | aus OpenStreetMap, op d'Terrain gemoolt (ouni Bilder) |
| Stroossen, Eisebunnen | keng, ausser an enger Textur | all Klassen no bei der Kamera, Haaptstroossen wäit ewech |
| Gebaier | keng | extrudéiert Grondrëss no bei der Kamera |
| Fluchplazen | Etiketten a Pisten als flaach Këschten, ouni Markéierungen | vermiesse Pisten mat Säitestreifen, Mëttlinn an Schwellbalken; Rullbunnen, Vorfelder; Nimm mat ICAO-Codes |
| Ortsnimm | e puer Dierfer- a Stadtetiketten | Stied, Städtchen, Dierfer, Fluchhäfe, no Distanz a Héicht |

Wou et nach hannendrun bleift:

- **Bildopléisung**: ausserhalb vun den USA a Frankräich ass de 10-m-Satellitemosaik ënner ongeféier 2 km wäich; Tacview mat enger vum Benotzer installéierter Zoom-17-Textur ass do méi schaarf.
- **Terrain an der eegener Form vum DCS**: Tacview kann d'Terrain weisen, dat DCS selwer exportéiert; hei ass et d'richteg Äerd, déi vum DCS-Terrain ofwäicht, wou d'Modelleuren der Kaart et geännert hunn.
- **Krümmung**: de Buedem ass eng flaach Fläch, dofir ass den Horizont net vun enger krummer Äerd; Tacview zäichent eng Kugel.
- **Geschwindegkeet**: den éischte Besuch vun engem Ort lued e puer Zéng Megabyte, ier et schaarf ass; a engem Browser mat Software-Renderinge (de Screenshots) zeechent et e puer Biller pro Sekonn mat e puer honnert Kachelen.

## Gränzen an wat duerno kënnt {#limits-and-what-comes-later}

- **Terrain-Opléisung**: ongeféier 30 m am beschte, a gréisser Gebidder méi grof. [Copernicus GLO-30](https://registry.opendata.aws/copernicus-dem/) (Cloud-Optimized GeoTIFFs op AWS, ouni Schlëssel, mat engem fixen Kredittext) ass déi besser Quell: 30 m iwwerall, GLO-90 wou GLO-30 Lücken huet (Armenien a Aserbaidschan, déi DCS Kaukasus ofdeckt). Et brauch e GeoTIFF-Leser an ass nach net benotzt.
- **Besser Terrain**: Copernicus GLO-30 op AWS schéckt keng CORS-Kopfzeilen, also kann en Browser se net liesen; de Spiegel vun OpenTopography kann gelies ginn (CORS a Beräicher), mä hir Bedéngungen fir d'Laafzäit vun enger ëffentlecher App sinn onbekannt - virdrun ze froen, ier et benotzt gëtt. Mapterhorn huet GLO-30 schonn.
- **Krümmung**: de Buedem ass eng flaach Fläch, an d'Héichte ginn net fir d'Krümmung vun der Äerd erofgesat, wéi d'Opnamen plazéiert sinn (Héicht als Héicht); wäit vun der Referenz wandere béid zesummen, ënner engem Tausendstel bei 100 km. Nëmme d'Kachelen ze biegen würd se vun den Donnéeën wäit ewech trennen, dofir gëtt dat net ugebueden. E krumme Horizont brauch deen selwechte Fall - Distanz vun der Kamera Quadrat iwwer zweemol de Radius vun der Äerd - an all Duerchgank, deen eng Positioun zäichent (Level, Kachelen, Hitz, Linnen, Këschten, Etiketten, Auswiel), als eng gemeinsam Variabel; eng richteg Kugel brauch och Positioune mat Zentrum an der Äerd fir d'Donnéeën an Renderen relativ zur Kamera. Béides ass mam Globusmodus geplangt.
- **Nëmmen d'Welt vun haut**: d'historesch Kaarte vu DCS a IL-2 (Normandie 2, The Channel, Däitschland Kale Krich, all IL-2-Kaart) ginn mat den heiten Stied, Stroossen a Küstenbauten gezeechent; de Panel seet dat. Zäitgenëssesch Fluchplazen ginn net gezeechent.
- **Kee Globusmodus**: en Hannergrond ass eng flaach lokal Fläch. Eng Ganzerd-Usiicht ass geplangt.
- Stroossen ginn a grousse Gebidder breet gemaach, sou datt se sichtbar bleiwen; no bei sinn se breeder wéi d'Liewen.
- DCS-Schauplazname an den Tabelle vum Watcher ginn ugepasst wéi DCS se an `mission.theatre` gëtt; e Numm, deen net an der Lëscht steet, fält op den éischten Fix ganz Grad gerënnt zréck, an nëmmen op Breet a Längt.

## Historesch Kaarten (nach net gebaut) {#historical-maps-not-built-yet}

Zäitgenëssesch Kaarten kënne spéider d'historesch Schauplazen mat Bild iwwerzéien. D'Serie vum US Army Map Service (AMS) sinn US-Bundesregierungsaarbechten, normalerweis als Public Domain behandelt (prüft all Scan a senger Beschreiwung; vill sinn Nei-Drocke vu britesche GSGS- oder däitschen Originalen, deenen hir Crown-Copyright oder Laufzäit fir anonym Wierker och ofgelaf ass):

| Schauplaz | Serie | Wou gescannt |
|---|---|---|
| IL-2 Stalingrad, Moskau, Kuban, Welikije Luki, Prochorowka, Leningrad | AMS **N501**, Osteuropa 1:250.000 (an den 1950er Joer aus sowjetesche a däitschen Kaarte gemaach) | UT Austin PCL; e puer Blieder geo-referenzéiert bei UT GeoData |
| IL-2 Normandie, DCS Normandie 2 an The Channel | AMS **M661** / GSGS 4250, Frankräich 1:50.000 | UT Austin PCL, Princeton |
| IL-2 Rheinland | AMS **M501** 1:250.000 an **M841** 1:25.000 (Däitschland) | UT Austin PCL |
| IL-2 Korea | AMS **L751** 1:50.000 (Editioune vun 1951) an **L552** 1:250.000 | ANU Open Research (L751-Blieder, "copyright expired"), UT Austin PCL, Yale |
| IL-2 Arras (Flying Circus) | britesch WW1-Schëtzengrouwekaarten (net AMS) | McMaster University; National Library of Scotland (net-kommerziell Bedéngungen) |

AMS-Blieder droen Breet- an Längegradmarkéierungen un hire Ecken, also géif all eenzel mat engem Véier-Eck-Fit plazéiert an als Textur iwwer de Buedem geluecht, wéi d'Kachelen gebaut a lokal gehalen.

## Fir Entwéckler {#for-developers}

### De `geo`-Eintrag an enger Parquet-Tabell {#the-geo-entry-in-a-parquet-table}

```json
"geo": {"lat0": 42.0, "lon0": 42.0, "projection": "tangent-plane", "east": "x", "north": "z", "up": "y",
        "dcs": {"theatre": "Caucasus", "x": "dcs_x", "y": "dcs_y", "z": "dcs_z"}}
```

`east`, `north` a `up` nennen d'Spalte, déi d'Ost- a Nord-Meter op der selwechter Tangentialebene bei (`lat0`, `lon0`) an d'Héicht halen. D'Lued dréit d'Referenz, wann hir Zuuerdnung exakt dës Spalten huet (Ost als X, Nord an d'Héicht als Y a Z, egal wéi erëm). De fakultative `dcs`-Eintrag nennt d'eege Meter vun enger DCS-Tabell (x Nord, y uewen, z Ost) a säi Schauplaz: e Lued, deen déi Spalte zouuerdnet, gëtt amplaz iwwer d'transversal Mercator-Projektioun vum Schauplaz plazéiert ([DCS-Koordinaten](#dcs-coordinates)). Eng Tabell ouni `geo` gëtt wéi virdru gelies.

### DCS-Koordinaten {#dcs-coordinates}

All DCS-Schauplaz ass eng Transversal-Mercator-Projektioun (WGS84, Skala 0,9996) mat eegenem Zentralmeridian an engem eegenen falschen Urspronk; DCS-x ass d'Nordrichtung an z d'Ostrichtung. D'Konstanten sinn déi, déi de pydcs-Projet publizéiert; d'Mathematik ass Krüger senger Serie bis zur sechster Uerdnung (Karney 2011), iwwerdroen an [`src/world/dcsProjection.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/dcsProjection.ts). E Hannergrond fir DCS-Meter gëtt direkt dran gebaut, sou datt eng DCS-Tabell vum Watcher, déi mat `dcs_x`/`dcs_y`/`dcs_z` zougeuerdnet ass, en Level, deen de DCS-Terrainkonverter geschriwwen huet, an de Hannergrond all deen selwechten Kader hunn. Dem Irak seng Konstanten sinn net publizéiert; si sinn un publizéiert Referenzpunkten ugepasst (4 cm quadratesch Mëttelwäert).

D'DCS-Tabelle vum Watcher leien op enger Tangentialebene beim fixen Referenzpunkt vum Schauplaz (deeselwechte Punkt, deen den Schauplaz-Picker benotzt, hei ënnen), also verschmëlze verschidde Missiounen op engem Schauplaz mat hirer Referenz, a stellen sech mat engem Schauplaz-Hannergrond ouni hien ze réckelen.

### Vereinfachung an Budget {#simplification-and-budget}

- Gebaier ënner 20 m² falen fort; 60 m², wann d'Kader méi wéi 30 km breet ass, 150 m² iwwer 80 km. D'Rescht gëtt vum gréisste Gebai un dobäigesat, bis d'Gebaier 1,5 Mio. Dräiecker erreechen.
- Nieftestroossen, Serviceroute a Weeër falen iwwer 60 km Kaderbreet fort; iwwer 150 km bleiwen nëmmen Autobunnen, Haaptstroossen, primär a sekundär Stroossen.
- De ganze Hannergrond bleift ënner ongeféier 3 Mio. Dräiecker. D'Importnotiz seet, wéivill Gebaier fortgelooss goufen.
