---
title: "Fons del món"
parent: "Nivells i geometria de fons"
nav_order: 5
has_children: true
lang: "ca"
source: "world-backdrop.md"
source_hash: "d42a67d56aca"
translated: true
outdated: false
---

# Fons del món

Un fons del món posa el terreny real sota un registre de vol: turons, carreteres, rius, aeròdroms i edificis, descarregats de dades de mapes obertes i gratuïtes. Fes-lo servir quan una gravació de Tacview quedaria surant sobre una graella buida. És un [nivell](glossary.md), de manera que la calor i les figures es troben sobre ell.

## Construir-ne un {#build-one}

1. Carrega un registre de vol que digui on és a la Terra (un fitxer `.acmi` de Tacview), o no carreguis res i tria un teatre al pas 3. Vegeu [Carregar dades](getting-data-in.md).
2. Obre **Fons / nivell** a la barra lateral.
3. Prem **Fons del món real** per construir el terreny sota les teves dades. O tria un mapa del joc a **Teatre** i prem **Construeix el fons del teatre** (o **Carrega el teatre en directe**).
4. Espera. El panell mostra el progrés (*Tessel·les d'elevació*, *Tessel·les del mapa*, *Construint el fons*); **Cancel·la** l'atura.
5. Vola per allà. La línia de crèdit de les dades del mapa s'escriu a la part inferior dreta de la vista.

La primera construcció descarrega unes quantes desenes de megabytes. El navegador les guarda, de manera que una segona construcció de la mateixa àrea no descarrega res. **Oblida les tessel·les** les esborra. El botó **Fons del món real** només es mostra quan les dades carregades porten una referència geogràfica (més avall).

Tot es construeix en un procés de fons ([`src/world`](https://github.com/Holdi601/3DHeat/tree/main/src/world)). El resultat substitueix el nivell actual i es comporta com qualsevol [nivell 3D](model-levels.md): amaga la calor que hi ha darrere, la talla el tall, té els [controls d'aspecte](level-appearance.md) i es pot guardar a la [biblioteca](level-library.md).

## On són les dades: la referència geogràfica {#where-the-data-is-the-geographic-reference}

Un conjunt de dades només rep una referència geogràfica d'una font que n'indiqui una:

- **Una gravació ACMI**: els `ReferenceLatitude` i `ReferenceLongitude` de la seva capçalera, i posicions que el lector projecta sobre el pla tangent a l'el·lipsoide WGS84 en aquell punt (X est, Y nord, en metres; les alçades són l'altitud de la gravació sobre el nivell del mar). La referència es conserva quan el mapatge agafa **X** i **Y** com a eixos del terreny (les pistes de la pròpia gravació ho fan), i es descarta quan el terreny ve de qualsevol altra columna, com la **U** i la **V** pròpies del món pla d'un joc.
- **Una taula Parquet amb una entrada `geo` als seus indicis `heat3d`**: les taules del [Watcher](https://github.com/Holdi601/3DHeat-Watcher) per a DCS, MSFS, X-Plane i IL-2 (Tacview). L'entrada es descriu a [Per a desenvolupadors](#for-developers).

Una càrrega de diversos fitxers conserva la referència només quan tots comparteixen la mateixa. Tots els altres carregadors no es veuen afectats i no en porten cap.

El fons es projecta de la mateixa manera i després passa pel mapatge d'eixos de la càrrega, de manera que queda sota les dades, sigui quin sigui el gir o l'escala que aplica el mapatge.

## Teatres {#theatres}

El selector **Teatre** llista els mapes del món real de DCS World (Caucàs, Nevada, Normandia 2, El Canal, Síria, Golf Pèrsic, Marianes, Marianes WWII, Atlàntic Sud, Sinaí, Afganistan, Kola, Alemanya Guerra Freda, Iraq) i d'IL-2 Great Battles (Stalingrad, Moscou, Kuban, Rheinland, Normandia, Prokhorovka, Velikie Luki, Arras, Odessa, Golf de Finlàndia / Leningrad, Corea), cadascun amb la seva caixa sobre la Terra ([`src/world/theatres.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/theatres.ts)). Les caixes de DCS són les dimensions dels editors, calculades a partir de les projeccions publicades; les caixes d'IL-2, i les de DCS que així ho indiquen, són estimacions a partir de les mides publicades dels mapes i dels pobles a les seves vores: el panell ho diu.

**Construeix el fons del teatre** construeix dos nivells de detall en una sola malla:

| Nivell | Àrea | Terreny | Mapa |
|---|---|---|---|
| Teatre | tota la caixa | el zoom més profund fins a 10 que necessita com a màxim 64 tessel·les d'elevació (uns 3 km per vèrtex sobre el Caucas, 1 km sobre Normandia) | el mar, els llacs, la cobertura del sòl i les autopistes de com a màxim 64 tessel·les vectorials de zoom 4 a 9 |
| Àrea detallada | **Sota les dades**, **Al voltant d’un punt** (latitud, longitud, de 12 a 400 km), o cap | fins a zoom 12 en com a màxim 100 tessel·les, com a màxim 500.000 vèrtexs | tot l'anterior, de com a màxim 1.500 tessel·les vectorials al zoom més profund fins a 14 que hi càpiguen |

L'àrea detallada fa un forat a la graella del teatre, eixamplat fins a cel·les senceres perquè les dues graelles comparteixin les seves línies de vora, i una paret fina tanca la juntura on mostregen les alçades de manera diferent.

Amb dades carregades, el teatre es construeix sobre el pla de les dades, de manera que queda sota com s'ha construït. Sense dades, es construeix al voltant del propi punt de referència del teatre (graus sencers prop de la seva àrea detallada). Les dades carregades després en una altra referència (un fitxer ACMI en declara una de pròpia) mouen el fons sota elles: el moviment exacte entre les dues projeccions es calcula en una graella de 256 × 256 sobre el fons i es llegeix entre els nodes, dins d'un metre o dos en un teatre sencer ([`src/world/reproject.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/reproject.ts)). Un fons guardat a la biblioteca conserva el seu lloc i es mou de la mateixa manera quan es carrega sota altres dades.

### Carregar un teatre en directe {#streaming-a-theatre}

**Carrega el teatre en directe** mostra el teatre com ho fa un visualitzador de mapes de simulador de vol: el terreny arriba com moltes tessel·les petites al voltant de la càmera, carregades mentre es vola i eliminades quan queden fora d'abast ([`src/world/stream.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/stream.ts)).

- **Un quadtree de tessel·les Web Mercator.** Les arrels al zoom 5 cobreixen 1.500 km al voltant de la càmera, de manera que el terreny arriba més enllà de la caixa del teatre fins a l'horitzó. Una tessel·la es divideix en els seus quatre fills mentre la càmera és més a prop d'1,4 vegades la seva amplada, fins al zoom 15 (uns 1 km per tessel·la, 15 m entre vèrtexs del terreny): el detall disminueix amb la distància tal com disminueix a la pantalla.
- **Cada tessel·la, la seva pròpia malla**, construïda en un procés de fons ([`src/world/tileBuild.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/tileBuild.ts)): una graella de terreny de 65 × 65 amb una faldilla al voltant de la vora (perquè els veïns a diferent detall mai no mostrin una esquerda), la cobertura del sòl i el mar pintats a sobre, carreteres, ferrocarrils, llacs, rius, aeròdroms, pistes topografiades i edificis per sobre, i opcionalment la imatge de satèl·lit del seu quadrat. El renderitzador dibuixa les tessel·les amb l'aspecte i les regles de profunditat del nivell, de manera que amaguen la calor que hi ha darrere com qualsevol nivell.
- **Primer en gruixut.** Les tessel·les es demanen primer en gruixut i les més properes, quatre descàrregues alhora per font; mentre es carreguen els fills d'una tessel·la, la tessel·la fa de substitut, de manera que la vista s'omple de seguida i després s'afina.
- **Memòria**: les tessel·les construïdes es guarden fins a 600 MB, eliminant primer les dibuixades menys recentment. Les **descàrregues** es queden a la memòria cau de tessel·les, limitada a un pressupost de 2 GB, eliminant primer les més antigues: tornar a volar sobre una àrea no costa res, i no hi ha cap límit per construcció.
- **Es guarda a la biblioteca** com el que es transmet (el teatre, les seves opcions i el seu lloc a la Terra), no com a tessel·les: carregar-lo torna a transmetre, des de la memòria cau de tessel·les on encara hi són. Els clics i l'inspector arriben a les tessel·les com ho fan a qualsevol nivell.
- Els dos renderitzadors dibuixen les tessel·les: comprovat un al costat de l'altre en una GPU real (WebGPU i WebGL2 a la mateixa targeta), incloent calor amagada darrere d'una carena.
- Amb dades carregades, les tessel·les es construeixen sobre el pla de les dades; les dades carregades després en un altre pla reconstrueixen les tessel·les allà (des de la memòria cau).
- Mesurat en vols simulats sobre tres llocs (Normandia, Nevada, Síria): uns 63, 45 i 24 MB en la primera visita amb imatges; una segona visita no descarrega res.

## Què es construeix {#what-is-built}

| Part | Font | Com |
|---|---|---|
| Imatges (teatres en directe, opcional) | EOX Sentinel-2 cloudless 2016 | **Imatge de satèl·lit** estén el mosaic 2016 sense núvols (uns 10 m per píxel, zoom 14; les tessel·les més profundes l'amplien) sobre el terreny en lloc de la cobertura del sòl pintada; carreteres, pistes, edificis i noms queden per sobre. |
| Imatges més fines (EUA, França) | USGS National Map orthoimagery; IGN BD ORTHO | Amb **Imatge de satèl·lit** activat, una tessel·la de mapa des del zoom 13 que queda del tot dins dels Estats Units contigus o de la França metropolitana pren l'ortofoto nacional, dos zooms més profunda que la tessel·la (setze de les seves tessel·les en una sola imatge, uns 1-2 m per píxel de prop). EOX a la resta. |
| Terreny (teatres en directe) | Mapterhorn | Copernicus GLO-30 a tot arreu (uns 19 m per píxel al zoom 12), a escala de metres on hi ha el propi mapatge d'un país (França, els EUA i altres); es llegeix dos zooms més gruixut que cada tessel·la. Els AWS Terrain Tiles si no es pot arribar a Mapterhorn. |
| Terreny | AWS Terrain Tiles (PNG Terrarium) | Una graella d'alçades sobre la caixa: el zoom és el més profund fins a 12 (uns 28 m per píxel a 43° N) que necessita com a màxim 36 tessel·les, i la graella s'aclareix fins a com a màxim 400.000 vèrtexs. Es dibuixa com a terreny amb les pistes de relleu habituals. |
| Carreteres, ferrocarrils | tessel·les vectorials d'OpenFreeMap, capa `transportation` | Cintes planes que cauen sobre el terreny, densificades a l'espaiat del terreny i elevades uns pocs per cent per no barallar-se amb ell. Amplades per classe, de 16 m (autopista) a 3 m (pista, ferrocarril); mai més estretes que la diagonal de la caixa / 5000. Es deixen fora camins, transbordadors i túnels. |
| Aeròdroms | capa `aeroway` | Polígons de pista, rodadura, plataforma i heliport que cauen com a terreny; les línies de pista i de rodadura com a cintes de 45 m i 18 m. |
| Aigua | capa `water` | El mar pla a 0 m, els llacs i els estanys plans a la seva vora més baixa, els rius caient. Es dibuixen com a aigua: ombrejat pla, sense corbes de nivell. |
| Cobertura del sòl | capes `landcover` i `landuse` | Pintat sobre els propis vèrtexs del terreny, sense triangles extra: boscos, herba i parcs en verd, terres de cultiu en color palla, aiguamolls, sorra, roca, gel; zones residencials, industrials, comercials, militars i pedreres en tons apagats. L'aigua també es pinta sota la superfície de l'aigua, de manera que la costa es llegeix des de qualsevol alçada. El terreny nu rep un matis d'alçada suau (gris verdós a les terres baixes, marró a les altes, neu per sobre de 3.000 m). Llegible a la resolució del terreny: uns 30-45 m a l'àrea detallada, quilòmetres al teatre. |
| Noms de llocs | capes `place` i `aerodrome_label` | Ciutats, pobles i viles, i aeròdroms amb el seu codi OACI, escrits sobre la vista; quant es mostra cada tipus creix amb l'alçada de la càmera, com a màxim 70 alhora. |
| Pistes topografiades | [OurAirports](https://ourairports.com/data/) `runways.csv` (domini públic) | Opcional (**Pistes d’OurAirports**, activat per defecte): cada pista oberta amb els dos extrems a la llista, de llindar a llindar a la seva amplada indicada, amb franges laterals, una línia central discontínua i barres de llindar. Una llista de 4 MB, descarregada una vegada i guardada a la memòria cau. |
| Edificis | capa `building` | Petjades extruïdes de `render_min_height` a `render_height` (6 m si falta) per sobre del terreny més baix sota elles; les parts `hide_3d` es ometen. Es dibuixen com a estructures. |

Les tessel·les vectorials es llegeixen al zoom 14 (l'únic zoom amb edificis) quan la caixa en necessita com a màxim 300; si no, al zoom més profund que en necessiti, fins a 8. Una àrea més gran rep només terreny.

### Aspecte {#look}

Un fons comença amb **Mostra el color capturat** activat (el color és el que distingeix una carretera clara del terreny gris on es troba, una pista fosca de la seva plataforma), amb les arestes dels triangles del terreny desactivades, perquè una graella regular no diu res, corbes de nivell tènues, un mar opac (un sòl sota ell lluitaria amb la superfície per la profunditat de lluny) i edificis gris clar i gairebé sòlids, com els dibuixa un mapa. El mar obert no rep cap triangle de terreny. Tot el demés és l'aspecte per defecte d'un nivell de model.

## Crèdits al llenç {#credits-on-the-canvas}

Mentre un fons és el nivell, el crèdit de les seves fonts s'escriu a la part inferior dreta de la vista, sense necessitat de fer clic, de manera que les captures de pantalla i els vídeos renderitzats el porten:

> OpenFreeMap © OpenMapTiles · Dades © contribuïdors d'OpenStreetMap · Elevació: Terrain Tiles – SRTM, GMTED2010, 3DEP cortesia de l'U.S. Geological Survey; ETOPO1: NOAA; i altres

Cada part enllaça a la pàgina d'atribució de la seva font (openstreetmap.org/copyright i la [llista d'atribucions de Terrain Tiles](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)). Un fons guardat a la biblioteca conserva els seus crèdits i els torna a mostrar quan es carrega. El text es tradueix amb el visualitzador; els noms no.

## Fonts i les seves condicions {#sources-and-their-terms}

Cada font, la seva llicència i com el fons es manté dins de les condicions: [Fons del món: fonts i condicions](world-backdrop-sources.md).

## La memòria cau de tessel·les {#the-tile-cache}

Cada tessel·la, i el TileJSON de les tessel·les vectorials, es guarda a l'API Cache del navegador sota `3dheat-world-tiles-v1`, per URL. Una segona construcció de la mateixa àrea no fa cap petició i funciona sense connexió: el TileJSON es demana primer i, si falla, la seva còpia guardada indica quines tessel·les ja es tenen. Les tessel·les que el servidor no té (mar obert, 404) també es recorden com a absents.

Les URL de les tessel·les vectorials porten la data de construcció del mapa, de manera que després que OpenFreeMap publiqui una nova construcció, el següent fons descarrega tessel·les noves i les antigues es queden fins que s'esborren. La memòria cau es limita a 2 GB: passat això, s'eliminen primer les tessel·les guardades fa més temps. **Oblida les tessel·les** esborra tota la memòria cau. La memòria cau necessita una origen segur (`https://` o `localhost`); en cas contrari, cada construcció torna a descarregar.

## Comparat amb Tacview {#compared-with-tacview}

Comprovat a ull en un lloc per teatre, amb gravacions sintètiques: les carreres d'enlairament cauen sobre les línies centrals de les pistes dibuixades, i els creuaments de costa cauen sobre la costa. La part de Tacview surt de la seva documentació i de les seves captures publicades (tacview.net, la seva pàgina de Steam), no d'executar-lo aquí.

| | Tacview 1.9 | Aquest fons, en directe |
|---|---|---|
| Extensió | el globus sencer | 1.500 km al voltant de la càmera, on sigui |
| Terreny | ETOPO1 (uns 1,25 km) integrat; SRTM 25-75 m si l'usuari instal·la els fitxers; terreny de DCS exportat des de DCS | Copernicus GLO-30 (Mapterhorn), a escala de metres a França i els EUA |
| Imatges | cap d'integrada; textures que descarrega l'usuari (Mapview, SAS Planet, complements com una carta VFR del Caucas) | EOX Sentinel-2 cloudless 2016, uns 10 m, en directe |
| Cobertura del sòl | cap, tret que sigui en una textura | d'OpenStreetMap, pintada sobre el terreny (sense imatges) |
| Carreteres, ferrocarrils | cap, tret que sigui en una textura | totes les classes a prop de la càmera, les carreteres principals de lluny |
| Edificis | cap | petjades extruïdes a prop de la càmera |
| Aeròdroms | etiquetes i pistes com a caixes planes, sense marques | pistes amb extrems topografiats, franges laterals, línia central i barres de llindar; rodadures, plataformes; noms amb codis OACI |
| Noms de llocs | algunes etiquetes de pobles i ciutats | ciutats, pobles, viles, aeròdroms, segons la distància i l'alçada |

On encara es queda curt:

- **Resolució de les imatges**: fora dels EUA i França, el mosaic de satèl·lit de 10 m és suau per sota d'uns 2 km; Tacview amb una textura de zoom 17 instal·lada per l'usuari és més nítid allà.
- **Terreny en la forma pròpia de DCS**: Tacview pot mostrar el terreny que exporta el propi DCS; aquí és la Terra real, que difereix del terreny de DCS on els modeladors del mapa l'han canviat.
- **Curvatura**: el terreny és un pla pla, de manera que l'horitzó no és el d'una Terra corbada; Tacview dibuixa una esfera.
- **Velocitat**: la primera visita a un lloc descarrega unes desenes de megabytes abans que es vegi nítid; en un navegador amb renderització per programari (les captures) dibuixa a uns quants fotogrames per segon amb diverses centenes de tessel·les.

## Límits i el que vindrà {#limits-and-what-comes-later}

- **Resolució del terreny**: uns 30 m al millor, i més gruixut en àrees grans. [Copernicus GLO-30](https://registry.opendata.aws/copernicus-dem/) (GeoTIFF optimitzats per al núvol a AWS, sense clau, amb un text de crèdit fix) és la millor font: 30 m a tot arreu, GLO-90 on GLO-30 té forats (Armènia i Azerbaidjan, que cobreix DCS Caucasus). Necessita un lector de GeoTIFF i encara no s'usa.
- **Millor terreny**: Copernicus GLO-30 a AWS no envia capçaleres CORS, de manera que un navegador no el pot llegir; el mirall d'OpenTopography sí es pot llegir (CORS i rangs), però se'n desconeixen les condicions per a l'ús en temps d'execució d'una aplicació pública: s'ha de preguntar abans de qualsevol ús. Mapterhorn ja porta GLO-30.
- **Curvatura**: el terreny és un pla pla i les alçades no es baixen per la curvatura de la Terra, en concordança amb com es col·loquen les gravacions (l'altitud com a alçada); lluny de la referència, tots dos s'allunyen junts, en menys d'una part per mil a 100 km. Doblegar només les tessel·les les separaria de les dades lluny, per la qual cosa no s'ofereix. Un horitzó corbat necessita la mateixa caiguda - la distància de la càmera al quadrat dividida per dues vegades el radi de la Terra - aplicada en cada passada que dibuixa una posició (nivell, tessel·les, calor, línies, caixes, etiquetes, selecció) com a una sola variable uniforme compartida; un globus real necessita posicions centrades a la Terra també per a les dades i renderització relativa a la càmera. Les dues coses estan previstes amb el mode globus.
- **Només el món d'avui**: els mapes històrics de DCS i d'IL-2 (Normandia 2, El Canal, Alemanya Guerra Freda, cada mapa d'IL-2) es dibuixen amb les ciutats, carreteres i costes d'avui; el panell ho diu. Els aeròdroms d'època no es dibuixen.
- **Sense mode globus**: un fons és un pla local pla. Està prevista una vista de tota la Terra.
- Les carreteres s'eixamplen en àrees grans perquè es vegin; de prop són més amples que la realitat.
- Els noms de teatre de DCS a les taules del Watcher es combinen tal com els dona DCS a `mission.theatre`; un nom que no és a la llista recau en el primer punt arrodonit a graus sencers, i només en latitud i longitud.

## Mapes històrics (encara no construïts) {#historical-maps-not-built-yet}

Els mapes d'època podrien servir de textura als teatres històrics més endavant. Les sèries del US Army Map Service (AMS) són obres del govern federal dels EUA, generalment tractades com a domini públic (comproveu el registre de cada escaneig; molts són reimpressions d'originals britànics GSGS o alemanys, el dret de la Corona o el termini d'obra anònima dels quals també ha vençut):

| Teatre | Sèrie | On s'han escanejat |
|---|---|---|
| IL-2 Stalingrad, Moscou, Kuban, Velikie Luki, Prokhorovka, Leningrad | AMS **N501**, Europa de l'Est 1:250.000 (compilada als anys 50 a partir de mapes soviètics i alemanys) | UT Austin PCL; alguns fulls georeferenciats a UT GeoData |
| IL-2 Normandia, DCS Normandy 2 i El Canal | AMS **M661** / GSGS 4250, França 1:50.000 | UT Austin PCL, Princeton |
| IL-2 Rheinland | AMS **M501** 1:250.000 i **M841** 1:25.000 (Alemanya) | UT Austin PCL |
| IL-2 Corea | AMS **L751** 1:50.000 (edicions de 1951) i **L552** 1:250.000 | ANU Open Research (fulls L751, "copyright expired"), UT Austin PCL, Yale |
| IL-2 Arras (Flying Circus) | mapes britànics de trinxeres de la Primera Guerra Mundial (no AMS) | McMaster University; National Library of Scotland (condicions no comercials) |

Els fulls de l'AMS porten marques de latitud i longitud a les cantonades, de manera que cadascun es col·locaria amb un ajust de quatre cantonades i s'estendria sobre el terreny com a textura, construïda i guardada localment com les tessel·les.

## Per a desenvolupadors {#for-developers}

### L'entrada `geo` en una taula Parquet {#the-geo-entry-in-a-parquet-table}

```json
"geo": {"lat0": 42.0, "lon0": 42.0, "projection": "tangent-plane", "east": "x", "north": "z", "up": "y",
        "dcs": {"theatre": "Caucasus", "x": "dcs_x", "y": "dcs_y", "z": "dcs_z"}}
```

`east`, `north` i `up` designen les columnes que contenen els metres est i nord sobre el mateix pla tangent a (`lat0`, `lon0`) i l'altitud. La càrrega porta la referència quan el seu mapatge agafa exactament aquestes columnes (est com a X, nord i alçada com a Y i Z en qualsevol dels dos sentits). L'entrada opcional `dcs` designa els metres propis d'una taula de DCS (x nord, y amunt, z est) i el seu teatre: una càrrega que mapa aquestes columnes es col·loca a través de la projecció Mercator transversal del teatre ([coordenades de DCS](#dcs-coordinates)). Una taula sense `geo` es llegeix com abans.

### Coordenades de DCS {#dcs-coordinates}

Cada teatre de DCS és una projecció Mercator transversal (WGS84, escala 0,9996) amb el seu propi meridià central i origen fals, on la x de DCS és la coordenada nord i la z l'est. Les constants són les que publica el projecte pydcs; el càlcul és la sèrie de Krüger de sisè ordre (Karney 2011), portat a [`src/world/dcsProjection.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/dcsProjection.ts). Un fons per a metres de DCS es construeix directament en elles, de manera que una taula DCS del Watcher mapada per `dcs_x`/`dcs_y`/`dcs_z`, un nivell que escriu el conversor de terreny de DCS i el fons comparteixen tots un mateix marc. Les constants de l'Iraq no estan publicades; s'han ajustat a punts de referència publicats (4 cm d'arrel de la mitjana quadràtica).

Les taules DCS del Watcher estan en un pla tangent al punt de referència fix del teatre (el mateix punt que usa el selector de teatres, més avall), de manera que diverses missions d'un mateix teatre es fusionen amb la seva referència intacta i s'alineen amb un fons de teatre sense moure'l.

### Simplificació i pressupost {#simplification-and-budget}

- Els edificis de menys de 20 m² s'eliminen; 60 m² quan la caixa té més de 30 km d'extensió, 150 m² més enllà de 80 km. La resta s'afegeix dels més grans als més petits fins que els edificis arriben a 1,5M de triangles.
- Les carreteres secundàries, les de servei i les pistes s'eliminen més enllà de 60 km d'extensió; més enllà de 150 km només queden les autopistes, les troncals, les primàries i les secundàries.
- Tot el fons es manté per sota d'uns 3M de triangles. La nota d'importació diu quants edificis s'han deixat fora.
