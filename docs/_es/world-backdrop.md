---
title: "Fondo del mundo"
parent: "Niveles y geometría de fondo"
nav_order: 5
has_children: true
lang: "es"
source: "world-backdrop.md"
source_hash: "d42a67d56aca"
translated: true
outdated: false
---

# Fondo del mundo

Un fondo del mundo pone el terreno real bajo una grabación de vuelo: colinas, carreteras, ríos, aeródromos y edificios, descargados de datos de mapas abiertos y gratuitos. Úsalo cuando una grabación de Tacview flotaría si no sobre una cuadrícula vacía. Es un [nivel](glossary.md), así que el calor y las figuras se apoyan sobre él.

## Construir uno {#build-one}

1. Carga una grabación de vuelo que indique dónde está en la Tierra (un archivo `.acmi` de Tacview), o no cargues nada y elige un teatro en el paso 3. Véase [Cómo meter datos](getting-data-in.md).
2. Abre **Fondo / nivel** en la barra lateral.
3. Pulsa **Fondo del mundo real** para construir el terreno bajo tus datos. O elige un mapa del juego en **Teatro** y pulsa **Construir fondo del teatro** (o **Cargar el teatro en directo**).
4. Espera. El panel muestra el progreso (*Teselas de elevación*, *Teselas de mapa*, *Construyendo el fondo*); **Cancelar** lo detiene.
5. Vuela por la zona. La línea de créditos de los datos del mapa se escribe abajo a la derecha de la vista.

La primera construcción descarga algunas decenas de megabytes. El navegador los guarda, así que una segunda construcción de la misma zona no descarga nada. **Olvidar teselas** los borra. El botón **Fondo del mundo real** solo aparece cuando los datos cargados traen una referencia geográfica (abajo).

Todo se construye en un proceso en segundo plano ([`src/world`](https://github.com/Holdi601/3DHeat/tree/main/src/world)). El resultado reemplaza el nivel actual y se comporta como cualquier [nivel 3D](model-levels.md): oculta el calor que hay detrás, lo corta el corte, tiene los [controles de apariencia](level-appearance.md) y puede guardarse en la [biblioteca](level-library.md).

## Dónde están los datos: la referencia geográfica {#where-the-data-is-the-geographic-reference}

Un conjunto de datos solo recibe una referencia geográfica de una fuente que la declare:

- **Una grabación ACMI**: su cabecera `ReferenceLatitude` y `ReferenceLongitude`, y posiciones que el lector proyecta sobre el plano tangente al elipsoide WGS84 en ese punto (X al este, Y al norte, en metros; las alturas son la altitud sobre el nivel del mar de la grabación). La referencia se conserva cuando la asignación toma **X** e **Y** como ejes del suelo, que es lo que indican las pistas de la propia grabación. Se descarta cuando el suelo viene de cualquier otra columna, como las **U** y **V** planas de un mundo plano propio de un juego.
- **Una tabla Parquet cuyas pistas `heat3d` traen una entrada `geo`**: las tablas de DCS, MSFS, X-Plane e IL-2 (Tacview) del [Watcher](https://github.com/Holdi601/3DHeat-Watcher). La entrada se describe en [Para desarrolladores](#for-developers).

Una carga de varios archivos conserva la referencia solo cuando todos comparten la misma. Los demás cargadores no se ven afectados y no traen ninguna.

El fondo se proyecta de la misma forma y luego pasa por la asignación de ejes de la carga, así que cae bajo los datos sea cual sea el volteo o la escala que aplique la asignación.

## Teatros {#theatres}

El selector **Teatro** lista los mapas reales de DCS World (Caucaso, Nevada, Normandía 2, El Canal, Siria, Golfo Pérsico, Marianas, Marianas II Guerra Mundial, Atlántico Sur, Sinaí, Afganistán, Kola, Alemania Guerra Fría, Irak) y de IL-2 Great Battles (Stalingrado, Moscú, Kubán, Renania, Normandía, Prójorovka, Velikie Luki, Arras, Odesa, Golfo de Finlandia / Leningrado, Corea). Cada uno tiene su caja en la Tierra ([`src/world/theatres.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/theatres.ts)). Las cajas de DCS son las extensiones de los editores, calculadas a partir de las proyecciones publicadas; las de IL-2, y las de DCS marcadas como tales, son estimaciones a partir de los tamaños publicados de los mapas y de las ciudades en sus bordes. El panel indica cuáles son.

**Construir fondo del teatro** construye dos niveles de detalle en una sola malla:

| Nivel | Zona | Terreno | Mapa |
|---|---|---|---|
| Teatro | la caja entera | el zoom más profundo, hasta 10, que necesita como mucho 64 teselas de elevación (unos 3 km por vértice sobre el Cáucaso, 1 km sobre Normandía) | el mar, lagos, cubierta del suelo y autopistas, a partir de como mucho 64 teselas vectoriales de zoom 4 a 9 |
| Zona detallada | **Bajo los datos**, **Alrededor de un punto** (latitud, longitud, de 12 a 400 km), o ninguna | hasta el zoom 12, con como mucho 100 teselas y como mucho 500 000 vértices | todo lo anterior, a partir de como mucho 1500 teselas vectoriales al zoom más profundo, hasta 14, que quepa |

La zona detallada hace un hueco en la cuadrícula del teatro, ensanchado hasta celdas enteras para que ambas cuadrículas compartan sus líneas de borde. Una pared delgada cierra la costura donde muestrean las alturas de forma distinta.

Con datos cargados, el teatro se construye sobre el plano de los datos, así que queda bajo ellos tal como se construyó. Sin datos, se construye alrededor del punto de referencia propio del teatro (grados enteros cerca de su zona detallada). Los datos cargados después con otra referencia (un archivo ACMI declara la suya) mueven el fondo bajo ellos: el cambio exacto entre las dos proyecciones se calcula en una cuadrícula de 256 × 256 sobre el fondo, y se lee entre los nodos, con un error de uno o dos metros en todo un teatro ([`src/world/reproject.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/reproject.ts)). Un fondo guardado en la biblioteca conserva su sitio y se mueve de la misma forma cuando se carga bajo otros datos.

### Cargar un teatro en directo {#streaming-a-theatre}

**Cargar el teatro en directo** muestra el teatro como lo hace un visor de mapas de simuladores de vuelo: el terreno llega en muchas teselas pequeñas alrededor de la cámara, que se cargan mientras se vuela y se descartan cuando quedan fuera de alcance ([`src/world/stream.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/stream.ts)).

- **Un quadtree de teselas Web Mercator.** Las raíces de zoom 5 cubren 1500 km alrededor de la cámara, así que el terreno llega más allá de la caja del teatro hasta el horizonte. Una tesela se divide en sus cuatro hijas mientras la cámara está más cerca de 1,4 veces su anchura, hasta el zoom 15 (unos 1 km por tesela, 15 m entre vértices del terreno). El detalle disminuye con la distancia igual que disminuye en pantalla.
- **Cada tesela, su propia malla**, construida en un proceso en segundo plano ([`src/world/tileBuild.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/tileBuild.ts)): una cuadrícula de terreno de 65 × 65 con un faldón alrededor de su borde (para que los vecinos con distinto detalle nunca muestren una grieta), la cubierta del suelo y el mar pintados encima, carreteras, vías férreas, lagos, ríos, aeródromos, pistas medidas y edificios por encima, y, si se quiere, la imagen de satélite de su cuadrado. El renderizador dibuja las teselas con el aspecto y las reglas de profundidad del nivel, así que ocultan el calor detrás de ellas como cualquier nivel.
- **Primero lo grueso.** Las teselas se piden primero gruesas y cercanas, de cuatro en cuatro descargas por fuente. Mientras cargan las hijas de una tesela, la propia tesela las sustituye, así que la vista se llena al momento y luego se afina.
- **Memoria**: las teselas construidas se guardan hasta 600 MB; se descartan primero las que se dibujaron hace más tiempo. Las **descargas** se quedan en la caché de teselas, limitada a un presupuesto de 2 GB, sacando primero las más antiguas: volar de nuevo sobre una zona no cuesta nada, y no hay límite por construcción.
- **Se guarda en la biblioteca** como lo que se transmite: el teatro, sus opciones y su lugar en la Tierra, no las teselas. Al cargarlo se vuelve a transmitir, desde la caché de teselas donde las teselas siguen estando. Los clics y el inspector golpean las teselas igual que golpean cualquier nivel.
- Ambos renderizadores dibujan las teselas: comprobado lado a lado en una GPU real (WebGPU y WebGL2 en la misma tarjeta), también con calor oculto tras una cresta.
- Con datos cargados, las teselas se construyen sobre el plano de los datos; los datos cargados después en otro plano las reconstruyen allí (desde la caché).
- Medido en vuelos sintéticos sobre tres lugares (Normandía, Nevada, Siria): unos 63, 45 y 24 MB en la primera visita con imágenes; una segunda visita no descarga nada.

## Qué se construye {#what-is-built}

| Parte | Fuente | Cómo |
|---|---|---|
| Imágenes (teatros en directo, opcional) | EOX Sentinel-2 cloudless 2016 | **Imagen de satélite** extiende el mosaico sin nubes de 2016 (unos 10 m por píxel, zoom 14; las teselas más profundas lo amplían) sobre el terreno, en lugar de la cubierta del suelo pintada; las carreteras, pistas, edificios y nombres quedan encima. |
| Imágenes más finas (EE. UU., Francia) | USGS National Map orthoimagery; IGN BD ORTHO | Con **Imagen de satélite** activada, una tesela de mapa de zoom 13 que cae por completo dentro de los Estados Unidos contiguos o de la Francia metropolitana toma la ortofoto nacional en su lugar, dos zooms más profunda que la tesela (dieciséis de sus teselas puestas en una sola imagen, unos 1-2 m por píxel de cerca). EOX en el resto. |
| Terreno (teatros en directo) | Mapterhorn | Copernicus GLO-30 en todas partes (unos 19 m por píxel al zoom 12), con escala métrica donde está el propio levantamiento de un país (Francia, EE. UU. y otros); se lee dos zooms más grueso que cada tesela. AWS Terrain Tiles si no se puede acceder a Mapterhorn. |
| Terreno | AWS Terrain Tiles (PNG Terrarium) | Una cuadrícula de altura sobre la caja: el zoom es el más profundo, hasta 12 (unos 28 m por píxel a 43° N), que necesite como mucho 36 teselas, y la cuadrícula se aclara hasta como mucho 400 000 vértices. Se dibuja como suelo con las señales habituales de relieve. |
| Carreteras, vías férreas | Teselas vectoriales de OpenFreeMap, capa `transportation` | Cintas planas extendidas sobre el terreno, con más densidad hasta la separación del terreno y elevadas un pequeño porcentaje de ella para que no peleen con él. Anchuras según la clase, de 16 m (autopista) a 3 m (pista, vía férrea); nunca más estrechas que la diagonal de la caja / 5000. Se dejan fuera senderos, transbordadores y túneles. |
| Aeródromos | capa `aeroway` | Polígonos de pista, calle de rodaje, plataforma y helipuerto extendidos como suelo; las líneas de pista y de calle de rodaje como cintas de 45 m y 18 m. |
| Agua | capa `water` | El mar plano a 0 m, los lagos y estanques planos a la orilla más baja, los ríos extendidos. Se dibuja como agua: sombreado plano, sin curvas de nivel. |
| Cubierta del suelo | capas `landcover` y `landuse` | Pintada sobre los propios vértices del terreno, sin triángulos extra: bosques, hierba y parques en verde; tierras de cultivo en paja; humedales, arena, roca, hielo; zonas residenciales, industriales, comerciales, militares y canteras en tonos apagados. El agua se pinta también bajo la superficie del agua, así que la orilla se lee desde cualquier altura. El suelo desnudo recibe un tinte de altura discreto (gris verdoso en tierras bajas, marrón en tierras altas, nieve por encima de 3000 m). Legible con la resolución del terreno: unos 30-45 m en la zona detallada, kilómetros en el teatro. |
| Nombres de lugares | capas `place` y `aerodrome_label` | Ciudades, pueblos y aldeas, y aeródromos con su código OACI, escritos sobre la vista; cuántos de cada tipo se muestran crece con la altura de la cámara, como mucho 70 a la vez. |
| Pistas medidas | [OurAirports](https://ourairports.com/data/) `runways.csv` (dominio público) | Opcional (**Pistas de OurAirports**, activada por defecto): cada pista abierta con ambos extremos en la lista, de umbral a umbral con su anchura indicada, con franjas laterales, línea central discontinua y barras de umbral. Una lista de 4 MB, descargada una vez y guardada en la caché. |
| Edificios | capa `building` | Huellas extruidas desde `render_min_height` hasta `render_height` (6 m si falta) sobre el suelo más bajo bajo ellas; se saltan las partes `hide_3d`. Se dibujan como estructuras. |

Las teselas vectoriales se leen al zoom 14 (el único zoom con edificios) cuando la caja necesita como mucho 300, si no, al zoom más profundo que lo consiga, hasta 8. Un área más grande recibe solo el terreno.

### Aspecto {#look}

Un fondo empieza con **Mostrar color capturado** activado. El color es lo que distingue una carretera clara del suelo gris sobre el que yace, o una pista oscura de su plataforma. Los bordes de los triángulos del suelo van desactivados, porque una cuadrícula regular no dice nada; curvas de nivel tenues; un mar opaco (un suelo bajo él pelearía con la superficie por la profundidad a lo lejos); y los edificios en gris claro y casi sólidos, como los dibuja un mapa. El mar abierto no recibe ningún triángulo de suelo. Todo lo demás tiene el aspecto por defecto de un nivel de modelo.

## Créditos en el lienzo {#credits-on-the-canvas}

Mientras un fondo es el nivel, los créditos de sus fuentes se escriben abajo a la derecha de la vista, sin necesidad de hacer clic, para que las capturas y los vídeos renderizados los lleven:

> OpenFreeMap © OpenMapTiles · Data © OpenStreetMap contributors · Elevation: Terrain Tiles – SRTM, GMTED2010, 3DEP courtesy of the U.S. Geological Survey; ETOPO1: NOAA; and others

Cada parte enlaza a la página de atribución de su fuente (openstreetmap.org/copyright y la [lista de atribución](https://github.com/tilezen/joerd/blob/master/docs/attribution.md) de Terrain Tiles). Un fondo guardado en la biblioteca conserva sus créditos y los vuelve a mostrar al cargarlo. El texto se traduce con el visor; los nombres no.

## Fuentes y sus condiciones {#sources-and-their-terms}

Cada fuente, su licencia y cómo se mantiene el fondo dentro de sus condiciones: [Fondo del mundo: fuentes y condiciones](world-backdrop-sources.md).

## La caché de teselas {#the-tile-cache}

Cada tesela, y el TileJSON de las teselas vectoriales, se guarda en la API Cache del navegador bajo `3dheat-world-tiles-v1`, por URL. Una segunda construcción de la misma zona no hace ninguna petición y funciona sin conexión: primero se pide el TileJSON y, si falla, su copia en caché indica qué teselas ya se tienen. Las teselas que el servidor no tiene (mar abierto, 404) también se recuerdan como ausentes.

Las URL de las teselas vectoriales llevan la fecha de compilación del mapa, así que cuando OpenFreeMap publica una compilación nueva, el siguiente fondo descarga teselas frescas y las antiguas se quedan hasta que se borren. La caché se limita a 2 GB: al pasarlo, primero se borran las teselas guardadas hace más tiempo. **Olvidar teselas** borra toda la caché. La caché necesita un origen seguro (`https://` o `localhost`); en otro caso, cada construcción vuelve a descargar.

## Comparado con Tacview {#compared-with-tacview}

Comprobado a ojo en un lugar por teatro, con grabaciones sintéticas: las carreras de despegue quedan sobre las líneas centrales de las pistas dibujadas, y los cruces de costa caen sobre la costa. La parte de Tacview sale de su documentación y de sus capturas publicadas (tacview.net, su página de Steam), no de haberlo ejecutado aquí.

| | Tacview 1.9 | Este fondo, en directo |
|---|---|---|
| Extensión | el globo entero | 1500 km alrededor de la cámara, dondequiera que esté |
| Terreno | ETOPO1 (unos 1,25 km) incluido; SRTM de 25-75 m si el usuario instala los archivos; terreno de DCS exportado desde DCS | Copernicus GLO-30 (Mapterhorn), con escala métrica en Francia y EE. UU. |
| Imágenes | ninguna incluida; texturas que descarga el usuario (Mapview, SAS Planet, complementos como una carta VFR del Cáucaso) | EOX Sentinel-2 cloudless 2016, unos 10 m, en directo |
| Cubierta del suelo | ninguna, salvo que esté en una textura | de OpenStreetMap, pintada sobre el terreno (sin imágenes) |
| Carreteras, vías férreas | ninguna, salvo que esté en una textura | todas las clases cerca de la cámara, las carreteras principales a lo lejos |
| Edificios | ninguno | huellas extruidas cerca de la cámara |
| Aeródromos | etiquetas y pistas como cajas planas, sin marcas | pistas desde sus extremos medidos, con franjas laterales, línea central y barras de umbral; calles de rodaje, plataformas; nombres con códigos OACI |
| Nombres de lugares | algunas etiquetas de aldeas y ciudades | ciudades, pueblos, aldeas y aeródromos, según distancia y altura |

Donde todavía se queda corto:

- **Resolución de las imágenes**: fuera de EE. UU. y Francia, el mosaico de satélite de 10 m se ve borroso por debajo de unos 2 km; Tacview, con una textura de zoom 17 que instale el usuario, se ve más nítido allí.
- **Terreno con la forma propia de DCS**: Tacview puede mostrar el terreno que el propio DCS exporta; aquí es la Tierra real, que difiere del terreno de DCS donde los modeladores del mapa lo cambiaron.
- **Curvatura**: el suelo es un plano plano, así que el horizonte no es el de una Tierra curva; Tacview dibuja una esfera.
- **Velocidad**: la primera visita a un lugar descarga decenas de megabytes antes de verse nítida; en un navegador con renderizado por software (las capturas) dibuja a unos pocos cuadros por segundo con varios cientos de teselas.

## Límites y lo que viene después {#limits-and-what-comes-later}

- **Resolución del terreno**: unos 30 m como mucho, y más gruesa en zonas grandes. [Copernicus GLO-30](https://registry.opendata.aws/copernicus-dem/) (GeoTIFF optimizados para la nube en AWS, sin clave, con un texto de crédito fijo) es la mejor fuente: 30 m en todas partes, GLO-90 donde GLO-30 tiene huecos (Armenia y Azerbaiyán, que cubre DCS Caucasus). Necesita un lector de GeoTIFF y todavía no se usa.
- **Mejor terreno**: Copernicus GLO-30 en AWS no envía cabeceras CORS, así que el navegador no puede leerlo; el espejo de OpenTopography sí se puede leer (CORS y rangos), pero se desconocen sus condiciones para el uso en tiempo de ejecución de una aplicación pública: hay que preguntar antes de usarlo. Mapterhorn ya incluye GLO-30.
- **Curvatura**: el suelo es un plano plano, y las alturas no se bajan por la curvatura de la Tierra, igual que se colocan las grabaciones (la altitud como altura). Lejos de la referencia, ambos se desvían juntos, en menos de una parte por mil a 100 km. Curvar solo las teselas las separaría de los datos a lo lejos, así que no se ofrece. Un horizonte curvo necesita la misma caída (distancia a la cámara al cuadrado dividida entre dos veces el radio de la Tierra) aplicada en cada pasada que dibuje una posición (nivel, teselas, calor, líneas, cajas, etiquetas, selección) como un uniforme compartido; un globo real necesita posiciones centradas en la Tierra también para los datos, y renderizado relativo a la cámara. Ambos se planean con el modo globo.
- **Solo el mundo actual**: los mapas históricos de DCS e IL-2 (Normandía 2, El Canal, Alemania Guerra Fría, todos los mapas de IL-2) se dibujan con las ciudades, carreteras y obras de costa de hoy; el panel lo indica. Los aeródromos de época no se dibujan.
- **Sin modo globo**: un fondo es un plano local plano. Una vista de la Tierra entera está prevista.
- Las carreteras se ensanchan en zonas grandes para que sigan siendo visibles; de cerca son más anchas que en la realidad.
- Los nombres de teatros de DCS en las tablas del Watcher se comparan tal como los da DCS en `mission.theatre`; un nombre que no está en la lista recurre a la primera posición redondeada a grados enteros, y solo a la latitud y la longitud.

## Mapas históricos (todavía sin construir) {#historical-maps-not-built-yet}

Los mapas de época podrían dar textura a los teatros históricos más adelante. Las series del US Army Map Service (AMS) son obras del gobierno federal de EE. UU., generalmente tratadas como de dominio público (revisa el registro de cada escaneo: muchas son reediciones de originales británicos GSGS o alemanes, cuyo copyright de la Corona o el plazo de obra anónima también ha vencido):

| Teatro | Serie | Dónde se escaneó |
|---|---|---|
| IL-2 Stalingrado, Moscú, Kubán, Velikie Luki, Prójorovka, Leningrado | AMS **N501**, Europa del Este 1:250 000 (compilada en los años 50 a partir de mapas soviéticos y alemanes) | UT Austin PCL; algunas hojas georreferenciadas en UT GeoData |
| IL-2 Normandía, DCS Normandía 2 y El Canal | AMS **M661** / GSGS 4250, Francia 1:50 000 | UT Austin PCL, Princeton |
| IL-2 Renania | AMS **M501** 1:250 000 y **M841** 1:25 000 (Alemania) | UT Austin PCL |
| IL-2 Corea | AMS **L751** 1:50 000 (ediciones de 1951) y **L552** 1:250 000 | ANU Open Research (hojas de L751, «copyright expired»), UT Austin PCL, Yale |
| IL-2 Arras (Flying Circus) | mapas de trincheras británicos de la Primera Guerra Mundial (no AMS) | McMaster University; National Library of Scotland (condiciones no comerciales) |

Las hojas AMS llevan marcas de latitud y longitud en sus esquinas, así que cada una se colocaría con un ajuste de cuatro esquinas y se extendería sobre el terreno como textura, construida y guardada en local como las teselas.

## Para desarrolladores {#for-developers}

### La entrada `geo` en una tabla Parquet {#the-geo-entry-in-a-parquet-table}

```json
"geo": {"lat0": 42.0, "lon0": 42.0, "projection": "tangent-plane", "east": "x", "north": "z", "up": "y",
        "dcs": {"theatre": "Caucasus", "x": "dcs_x", "y": "dcs_y", "z": "dcs_z"}}
```

`east`, `north` y `up` nombran las columnas que contienen los metros al este y al norte sobre el mismo plano tangente en (`lat0`, `lon0`), y la altitud. La carga conserva la referencia cuando su asignación toma exactamente esas columnas (el este como X, el norte y la altura como Y y Z, en cualquier orden). La entrada opcional `dcs` nombra los metros propios de una tabla de DCS (x norte, y arriba, z este) y su teatro: una carga que asigna esas columnas se coloca a través de la proyección Mercator transversa del teatro ([coordenadas de DCS](#dcs-coordinates)). Una tabla sin `geo` se lee como antes.

### Coordenadas de DCS {#dcs-coordinates}

Cada teatro de DCS es una proyección Mercator transversa (WGS84, escala 0,9996) con su propio meridiano central y su origen falso; la coordenada x de DCS es el norte y la z, el este. Las constantes son las que publica el proyecto pydcs; las matemáticas son la serie de Krüger de sexto orden (Karney 2011), portadas a [`src/world/dcsProjection.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/dcsProjection.ts). Un fondo para metros de DCS se construye directamente en ellas, así que una tabla del Watcher de DCS asignada por `dcs_x`/`dcs_y`/`dcs_z`, un nivel que escribió el conversor de terreno de DCS y el fondo comparten un mismo marco. Las constantes de Irak no están publicadas: se ajustaron a puntos de referencia publicados (4 cm de error cuadrático medio).

Las tablas de DCS del Watcher están en un plano tangente en el punto de referencia fijo del teatro (el mismo punto que usa el selector de teatros, abajo), así que varias misiones de un mismo teatro se unen con su referencia intacta y encajan con un fondo del teatro sin moverlo.

### Simplificación y presupuesto {#simplification-and-budget}

- Los edificios de menos de 20 m² se descartan; 60 m² cuando la caja tiene más de 30 km de lado, y 150 m² más allá de 80 km. El resto se añade del más grande al más pequeño hasta que los edificios llegan a 1,5 M de triángulos.
- Las carreteras secundarias, las de servicio y las pistas se descartan más allá de 60 km de lado; más allá de 150 km solo quedan las autopistas, las troncales, las primarias y las secundarias.
- Todo el fondo se mantiene por debajo de unos 3 M de triángulos. La nota de importación indica cuántos edificios se han dejado fuera.
