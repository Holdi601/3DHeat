---
title: "Paridad con Tacview"
parent: "Repetición de partida"
grand_parent: "Replay"
nav_order: 1
lang: "es"
source: "tacview-parity.md"
source_hash: "4275603255c2"
translated: true
outdated: false
---

# Paridad con Tacview

Tacview es un programa muy usado para ver grabaciones de vuelo. Si lo conoces, esta página muestra dónde está cada una de sus herramientas en 3DHeat.

Enumera cada función de Tacview 1.9 (su manual, su tabla de textos de la interfaz y el formato de archivo ACMI 2.2) y dice en qué punto está la [repetición de partida](match-replay.md) de 3DHeat. El objetivo: lo que Tacview puede hacer con una repetición y sus datos, 3DHeat también puede hacerlo.

**Estado:**
- **hecho**: ya está en 3DHeat.
- **nuevo**: creado para igualar una función de Tacview.
- **pendiente**: se aplica, pero no está creado.
- **no aplica**: no se aplica aquí, con el motivo.

Dónde están las funciones: la pestaña **Partida**, **Repetición con figuras** (o **Figuras superpuestas** en la pestaña Mapa de calor), en las secciones de la barra lateral **Repetición**, **Unidades**, **Eventos**, **Marcadores**, **Pantalla táctica**, **Estadísticas**, **Desplazamiento de tiempo y recorte**, **Mapa y posición**, **Audio y vídeo** y **Etiquetas**. Ver [Repetición de partida](match-replay.md).

## Cámaras {#cameras}

| Tacview | 3DHeat | Estado |
|---|---|---|
| Vista de cabina (F5), el horizonte girando con la aeronave | **Cabina**: fuera de la unidad, a lo largo de su actitud, como lo tiene el modelo de movimiento. La propia figura de la unidad se recorta. Arrastra para mirar alrededor; **Volver a mirar al frente** lo restablece. | nuevo |
| HUD en la vista de cabina (elección IAS/CAS/TAS) | **Pantalla frontal** (H): horizonte y escala de cabeceo de la vista real, marcador de trayectoria de vuelo, cinta de rumbo, IAS, altura, TAS, Mach, G, ángulo de ataque, velocidad vertical, AGL | nuevo |
| Instrumentos 3D de cabina, seguimiento de la cabeza del piloto (PilotHead*), TrackIR | No hay modelos de cabina; los ángulos de la cabeza se muestran vista **Crudo** de la tarjeta de la unidad | no aplica (sin modelos de cabina; el seguimiento de la cabeza es para vuelo en vivo) |
| Vista externa (F6): orbitar el objeto principal | **Persecución** (gira con la unidad) y **Órbita** (mantiene su propia dirección) | hecho |
| Cámara de combate aéreo, "Mirar al objetivo" (padlock) | **Padlock**: desde la cabina, fijada en el objetivo | nuevo |
| Cámara de combate aéreo, "Centrada" / "Mirar al frente" | **Objetivo**: detrás de la unidad, en la línea desde el objetivo, mirando más allá de él. **Fija** en acimut 0 mira al frente desde delante. | nuevo |
| Intercambiar principal y secundario | **Intercambiar** junto al objetivo | nuevo |
| Vista satélite (F7), cenital ortográfica | **Satélite**: directamente hacia abajo sobre la unidad, norte arriba; arrastra para girar. El mapa 2D es la planta ortográfica. | nuevo |
| Cámara libre (F8), W/A/S/D, E/C | La cámara libre de vuelo (W/A/S/D, Espacio/Q, Mayús/Alt) | hecho |
| Cámara de complemento Head-On; cámara externa fija al objeto | **Fija**: un lugar alrededor de la unidad que gira y se inclina con ella; arrastra para moverla (detrás, en un extremo del ala, de frente) | nuevo |
| Cámara de bloqueo como complemento (congelar la posición) | Dejar de seguir (Esc): la cámara se queda donde estaba | hecho |
| Vista estratégica (alejar hasta toda la Tierra) | [Fondo del mundo](world-backdrop.md) y el encuadre de toda la grabación del mapa 2D | hecho |
| Ajuste del campo de visión | Campo de visión de **Cámara y escena** | hecho |
| Cambiar de vista con teclas | **V** vista siguiente, **Mayús+V** atrás | nuevo |

## Vista 3D y opciones de pantalla {#d-view-and-display-options}

| Tacview | 3DHeat | Estado |
|---|---|---|
| Estelas de cinta, control de longitud | Estelas (segundos) en el visor de equipos | hecho |
| Estela anticipada (trayectoria futura) | **Trayectoria futura**: por dónde va realmente la unidad en los próximos segundos | nuevo |
| Líneas de altura del objeto / muros | **Líneas verticales** | hecho (líneas; muros no creados) |
| Vectores del objeto seleccionado: rumbo (punteado), derrota (continuo), sustentación | **Vectores de velocidad** (derrota y velocidad durante tantos segundos, con un consejo) y **Líneas de morro y sustentación** (morro discontinuo, sustentación corta y oscura) | nuevo |
| Línea de visión del piloto | **Línea de visión del piloto**: una línea cian discontinua siguiendo PilotHeadYaw/PilotHeadPitch (o una columna HeadYaw, ViewYaw o LookYaw) frente a los ejes de la unidad | nuevo |
| Cúpulas de alcance letal de SAM/AAA (EngagementRange, VerticalEngagementRange, EngagementMode, gemelos "2") | **Zonas de enfrentamiento**: cúpulas, ovoide donde el alcance vertical es distinto, apagadas mientras EngagementMode sea 0 | nuevo |
| Fijaciones de radar (LockedTarget..9) con etiquetas | **Fijaciones**: líneas rojas hacia cada objeto fijado; discontinua ámbar hacia FocusedTarget; siguiendo LockedTargetAzimuth/Elevation/Range donde no se nombra ningún objeto. **Etiquetas de fijación**: el nombre y la distancia del objetivo en cada línea de fijación | nuevo |
| Cono de radar (RadarMode, Azimuth, Elevation, Roll, Range, anchos de haz) y puerta de alcance | **Conos de radar**: borde y anillo medio del haz girado por acimut, elevación y balanceo frente a la unidad; la puerta de alcance como dos bordes amarillos. Sin anchos de haz, solo el eje del haz. | nuevo |
| Línea de visión entre los dos objetos seleccionados (verde / roja punteada cuando el terreno bloquea) | La línea del par medido se vuelve roja y discontinua cuando el nivel está entre ambos | nuevo |
| Aumentar automáticamente los objetos lejanos | Figura más pequeña en pantalla (píxeles) | hecho |
| Cuadrícula de latitud/longitud | **Mapa y posición → Cuadrícula**: líneas de latitud y longitud sobre el suelo bajo la cámara, con un espaciado redondo según la altura (de 10° hasta 1'), rotuladas; o la cuadrícula kilométrica **MGRS** de la zona UTM, con la zona y el cuadro de 100 km. La cuadrícula propia del mapa 2D, como antes | nuevo |
| Anillos de bullseye | Anillos alrededor del bullseye de cada equipo en el mapa 2D | nuevo (solo 2D) |
| Superposición de senda de planeo | **Sendas de planeo**: trayectorias de 3° con los bordes de escala completa de ±0,7° en ambos extremos de cada pista cercana a la grabación, a partir de los umbrales y elevaciones topografiados de OurAirports (descargado una vez, guardado sin conexión), una marca en cada milla náutica, con nombre de aeropuerto y pista | nuevo |
| Restricciones de altitud (alarma de techo/suelo) | **Restricción de altitud**: un suelo y un techo; las etiquetas de las unidades fuera se vuelven rojas, y cada cruce (bajo el suelo, sobre el techo, de vuelta dentro) se lista: un clic va allí y sigue a la unidad | nuevo |
| Objetos destruidos en gris, retirados tras 15 min | Las vidas terminan con su trayectoria; una unidad muerta se atenúa en la lista de unidades | hecho |
| Propiedades Visible / Disabled | Se muestran en **Crudo**; no ocultan nada | pendiente |
| Mostrar posiciones de palanca, acelerador y pedales | Acelerador y valores del motor en campos; entradas de control en **Crudo** | hecho (como valores) |
| Comentarios como subtítulos | **Mensajes como subtítulos** (Etiquetas): eventos ACMI Message y Comment, y chat de cualquier juego (eventos Chat, Say o Radio, o una columna de chat), en la parte inferior de la vista con quién lo dijo, durante seis segundos | nuevo |
| Visualización de fecha y hora UTC | Reloj de la línea de tiempo con UTC donde la grabación tiene una hora de referencia | hecho |
| Posición del ratón en lat/long, MGRS, bullseye | La tarjeta de selección (un clic en un punto) da latitud/longitud en grados, minutos y segundos, y MGRS junto a los metros del mundo; bullseye por unidad (campo) | nuevo |
| Logotipo propio | No creado | no aplica (marca) |
| Modelos 3D, el más cercano cuando no se conoce | Catálogo de figuras propio, equivalente más cercano, tamaño real | hecho |
| Varios enfrentamientos (líneas entre todos los pares) | **Líneas de enfrentamiento**: desde cada unidad en el alcance hasta cada adversario dentro de la distancia fijada (1-200 km), cada una con su distancia, las 60 parejas más cercanas; el par medido como antes | nuevo |

## Etiquetas {#labels}

| Tacview | 3DHeat | Estado |
|---|---|---|
| Etiquetas activadas o no, por separado para objetos seleccionados y no seleccionados | **Etiquetas** con reglas para **Seleccionadas**, **Aeronaves**, **Terrestres**, **Barcos**, **Armas** e **IA**: mostradas o no, valores propios, prioridad | nuevo |
| Campos de etiqueta: nombre, indicativo, piloto, velocidades (TAS/CAS/IAS/Mach/GS), alturas (ASL/AGL), VS, AOA, AOS, G (vertical, lateral, longitudinal), velocidad y radio de giro, energía, peso/volumen/caudal de combustible, rumbo/derrota, alabeo/cabeceo, frecuencia cardiaca | Cada valor de `fields.ts`: la misma lista, calculada donde no se registra (estimaciones marcadas con ~). La velocidad de alabeo y SpO2 solo por Crudo. | hecho |
| Posición del bullseye en las etiquetas | Campo **Bullseye (rumbo / distancia)** | nuevo |
| Desviaciones ILS, distancia recorrida | Valores en crudo; distancia recorrida en las estadísticas | hecho (en parte) |
| Quitar telemetría de unidades no seleccionadas | **Separar las etiquetas**, ordenadas según la prioridad de cada regla | hecho / nuevo |
| Etiquetar todos los objetos terrestres / solo amenazas | Las reglas Terrestres e IA | nuevo |
| Escala de las etiquetas | **Tamaño de las etiquetas** (60-250 %) | nuevo |
| Unidades métricas / imperiales | Métricas / imperiales | hecho (dos preajustes, no ocho) |

## Información del objeto y telemetría {#object-info-and-telemetry}

| Tacview | 3DHeat | Estado |
|---|---|---|
| Selección principal y secundaria | Un clic sigue y selecciona; mayúsculas+clic en dos para medir; selector **Objetivo** | hecho / nuevo |
| Distancia / rumbo / aspecto / cierre entre dos objetos | Línea BRAA del par medido; campos Distancia, Rumbo, Aspecto y Cierre de la unidad seguida | hecho |
| Rumbo relativo, velocidad de la línea de visión | Campos **Rumbo relativo** (desde el morro de la unidad seguida, I/D) y **Velocidad de la línea de visión** (°/s) | nuevo |
| Ventanas de telemetría | La tarjeta de la unidad y la tarjeta al pasar el ratón | hecho |
| Telemetría en bruto (cada propiedad registrada, también las desconocidas) | **Crudo** en la tarjeta de la unidad: cada columna en la fila de la unidad, tal como está escrita | nuevo |
| Lista de objetos activos | **Unidades**: jugadores, IA, armas en vuelo; las vivas, brillantes | hecho |
| Ventana de propiedades de la grabación (título, autor, briefing...) | Guardado como la columna RecordingInfo; se muestra en Crudo | hecho (sin ventana) |
| Formatos de posición DMS/MGRS, norte magnético | Campo **Posición (lat / long)** en DMS y **MGRS**; campo **Rumbo magnético**; **Rumbos magnéticos** escribe rumbo, derrota y demora magnéticos (°M) y muestra una brújula con ambos nortes y la variación - el World Magnetic Model 2025 (coeficientes de dominio público), calculado aquí en el lugar y la fecha de la unidad | nuevo |

## Gráficos {#charts}

| Tacview | 3DHeat | Estado |
|---|---|---|
| Gráfico de un objeto, hasta 4 valores | **En el tiempo** (y el gráfico bajo Repetición) | hecho |
| Trazar hasta 4 objetos a la vez | **Comparar**: un valor de hasta 8 unidades en una escala | nuevo |
| Valor frente a valor (estilo maniobrabilidad por energía) | **Valor frente a valor**: velocidad de giro frente a velocidad o cualquier par; cada unidad es una línea, su punto actual marcado | nuevo |
| Eje X por tiempo; zoom; desplazar el tiempo desde el gráfico | La rueda acerca en el tiempo, doble clic restablece, un clic va al momento | nuevo |
| Eje X por distancia en el aire o en tierra | **Tiempo / Distancia en el aire / Distancia en tierra** en los gráficos de tiempo y de comparación; el zoom y el ir al clic funcionan igual | nuevo |
| Gráficos predefinidos (energía, aceleración...) | Se puede elegir cualquier valor (la altura de energía y su ritmo son valores) | hecho |

## Estadísticas, registro de vuelo, eventos {#statistics-flight-log-events}

| Tacview | 3DHeat | Estado |
|---|---|---|
| Registro de vuelo: despegó, aterrizó, disparó, fue alcanzado por, destruido por, salió del área | **Estadísticas** por unidad: vidas, bajas, muertes, disparos, impactos, tasa de impacto, despegues, aterrizajes, tiempo en el aire, G máximo (y mínimo), velocidad máxima, altura y Mach, distancia. Los despegues salen de los eventos TakenOff/Landed, OnGround, AGL, o de una estimación marcada con ~. | nuevo |
| Complementos de marcador y de informe de misión | Resumen por equipo y más bajas; el marcador propio del resumen de la partida | nuevo / hecho |
| Exportar registro de vuelo en XML/CSV | **Exportar CSV** de las estadísticas y de los eventos tal como aparecen en la lista | nuevo (solo CSV) |
| Exportar telemetría en CSV a una cadencia | **Telemetría de la unidad seleccionada**: cada valor, de 1 a 20 por segundo | nuevo |
| Registro de eventos; doble clic para ir allí y seleccionar | Lista **Eventos**, filtrada por tipo y unidad; un clic vuela hasta allí | hecho |
| Evento anterior / siguiente (Ctrl+←/→) | **Re Pág / Av Pág** | nuevo |
| Pausar en un evento | **Pausar en eventos** | nuevo |
| Marcas en la línea de tiempo (liberaciones, impactos, destrucciones; las de la unidad seleccionada en azul; marcadores en rojo) | Bajas y muertes como barra de densidad, las de la unidad seguida en azul, marcadores en rojo; un clic para ir | nuevo |
| Quitar un evento, quitar por baja | No creado | no aplica (los eventos son de la grabación; los filtros los ocultan) |

## Marcadores {#bookmarks}

| Tacview | 3DHeat | Estado |
|---|---|---|
| Insertar marcador con la selección y el punto de vista | **Añadir marcador** (B): el momento, la cámara libre o la unidad seguida con su vista, distancia y objetivo; con nombre; guardado en este navegador por grabación | nuevo |
| Quitar marcador | × en la lista | nuevo |
| Marcadores en la línea de tiempo y en los registros | Marcas rojas; la lista | nuevo |
| Event=Bookmark en ACMI | Se listan entre las marcas de la grabación, junto con bajas, muertes y mensajes | nuevo |
| Atajo copiar/pegar (compartir una vista) | **Exportar / Importar** los marcadores como archivo; C copia la pose de la cámara | nuevo |

## Reproducción {#playback}

| Tacview | 3DHeat | Estado |
|---|---|---|
| Reproducir/pausar, ir al inicio, velocidad, mover en la línea de tiempo | Línea de tiempo | hecho |
| Fotograma a fotograma | **,** y **.** un segundo atrás y adelante (Mayús: diez) | nuevo |
| Reproducción hacia atrás | **◀** en la línea de tiempo, **J** (**L** hacia delante; la misma tecla de nuevo pausa): reproduce desde el final hacia el inicio a la velocidad elegida, en bucle o parando al inicio | nuevo |
| Diálogo de salto de tiempo | La línea de tiempo y la lista de eventos | hecho |
| Desplazar un objeto en el tiempo (fantasma) | **Desplazamiento de tiempo y recorte**: mueve el vuelo de una unidad, o de toda una grabación, tantos segundos; **Alinear las grabaciones** mueve varias grabaciones para que empiecen juntas y las reproduce a la vez (dos salidas de días distintos una al lado de otra). La grabación se reconstruye, así que las estelas, eventos, gráficos y estadísticas la siguen | nuevo |
| Recortar antes/después | **Desde ahora / Hasta ahora / Cortar a este tramo** (deshacer conserva los desplazamientos), y luego **Exportar CSV** (se carga de nuevo en 3DHeat) o **Exportar ACMI** (texto Tacview 2.2, para una grabación colocada sobre la Tierra) | nuevo |

## Terreno y mapa {#terrain-and-map}

| Tacview | 3DHeat | Estado |
|---|---|---|
| Terreno real, elevación y texturas propias | Niveles (el mapa propio del juego como modelo 3D), mosaicos del fondo del mundo | hecho |
| Modos de terreno plano / vacío / de alto contraste | [Apariencia del nivel](level-appearance.md): relieve del suelo, superficie y estructuras mostradas o no | hecho (no son los mismos modos) |
| Mapa táctico 2D (Tacview no tiene: vista satélite) | **Mapa 2D**: vista de esquina o completa, símbolos por tipo y equipo (jugadores rellenos, IA con contorno) girados a su rumbo, estelas, nombres, barra de escala, anillos de alcance alrededor de la unidad seguida, anillos de bullseye, el lugar de la cámara 3D, muertes recientes; arrastrar, rueda, clic para seguir (M) | nuevo |
| Objetos fijos (aeropuertos, pistas, puntos de ruta, zonas, KML) | Pistas topografiadas (OurAirports) en el fondo del mundo y sus sendas de planeo; los puntos GPX y las marcas KML se cargan como objetos fijos; el [Tablero táctico](tactics-board.md) dibuja zonas y rutas | nuevo |

## Importar, exportar, grabar {#import-export-recording}

| Tacview | 3DHeat | Estado |
|---|---|---|
| Texto y zip de ACMI | [Tacview ACMI](tacview-acmi.md) | hecho |
| GPX, KML, CSV, NMEA, IGC, FIT, DIS... | **GPX** (trazados, rutas, puntos de ruta; frecuencia cardiaca, cadencia, potencia y temperatura de Garmin), **KML/KMZ** (gx:Track, LineString, Point), **NMEA 0183** (RMC y GGA de cualquier emisor, sumas de control comprobadas, cruzando la medianoche), **IGC** (registros B, fecha, piloto y planeador), **FIT** (mensajes de registro, marcas de tiempo comprimidas) - cada uno colocado por latitud y longitud en el plano en el punto medio de los trazados, para que el fondo del mundo cuadre; rumbo, cabeceo y velocidad del archivo o de punto a punto. CSV y Parquet como antes | nuevo (DIS no aplica: es un protocolo de red en vivo) |
| Grabadores nativos (DCS, BMS, IL-2, MSFS...) | Los propios conversores de 3DHeat (War Thunder, CS2, Squad, Arma y otros) | hecho (propios) |
| Telemetría en tiempo real por TCP, ADS-B | No creado | no aplica (las repeticiones son tras la partida) |
| Audio y vídeo sincronizados | **Audio y vídeo**: un archivo local se reproduce, pausa, salta y cambia de velocidad con la línea de tiempo desde un inicio fijado (**Empieza ahora**, ±0,1 s); un vídeo en un panel redimensionable sobre la vista, o imagen en imagen. El archivo se queda en el navegador | nuevo |
| Exportar vídeo | [Trayectoria de cámara y vídeo](camera-path-and-video.md) | hecho |

## Otros {#other}

| Tacview | 3DHeat | Estado |
|---|---|---|
| Complementos en Lua | No creado | no aplica (código abierto: cambia el propio visor) |
| Informe en línea (sesión compartida) | No creado | no aplica (la de Tacview es una sesión alojada que mantiene a todos en el mismo cabezal de reproducción. 3DHeat no tiene servidor y guarda las grabaciones en el equipo del visor, y ni siquiera un enlace entre pares necesita un servidor de señalización. Un informe se comparte como archivos: la grabación recortada (Exportar ACMI o CSV) y el archivo de marcadores, que se abren en los mismos momentos y vistas) |
| Control remoto del instructor | No creado | no aplica (controla un simulador en marcha) |
| Edición de objetos (añadir, editar, quitar objetos) | [Tablero táctico](tactics-board.md) para objetos planificados; las grabaciones son de solo lectura | no aplica |
| Idiomas | 40 idiomas | hecho |
| Autenticación de grabaciones | No creado | no aplica |

## Para desarrolladores: propiedades de ACMI 2.2 {#for-developers-acmi-22-properties}

Las lee `data/acmi.ts`; las propiedades numéricas se convierten en columnas numéricas, y las de texto en columnas de categoría. Todas se muestran en **Crudo** en la tarjeta de la unidad. Estas se leen con un fin:

| Propiedades | Uso |
|---|---|
| T (las cuatro formas), Name, Type, Pilot, Group, Country, Coalition, Color, CallSign | Posición, actitud, figura, nombre de la unidad, equipo |
| IAS, CAS, TAS, Mach, AOA, AOS, AGL, HDG, HDM, OnGround | Campos, gráficos, pantalla frontal, detección de despegue y aterrizaje |
| VerticalGForce, LongitudinalGForce, LateralGForce | Campos de G |
| Throttle(2), Afterburner, EngineRPM(2), NR, AirBrakes, Flaps, LandingGear, Tailhook | Campos |
| FuelWeight..9, FuelVolume..9, FuelFlowWeight..8 | Campos de combustible, sumados entre los depósitos |
| RadarMode, RadarAzimuth, RadarElevation, RadarRoll, RadarRange, RadarHorizontalBeamwidth, RadarVerticalBeamwidth, RadarRangeGateAzimuth/Elevation/Min/Max/HorizontalBeamwidth/VerticalBeamwidth | Conos de radar y puerta de alcance |
| LockedTarget..9, LockedTargetMode, LockedTargetAzimuth/Elevation/Range, FocusedTarget | Líneas de fijación |
| EngagementMode(2), EngagementRange(2), VerticalEngagementRange(2) | Cúpulas de enfrentamiento |
| QNH, AltimeterSetting, WindSpeed, WindDirection, HeartRate | Campos |
| Health | Campo |
| Eventos: Destroyed, TakenOff, Landed, Bookmark, Message, Comment, LeftArea, Timeout | Lista de eventos, estadísticas (muertes, despegues, aterrizajes), marcadores; Message y Comment como subtítulos |
| PilotHeadYaw, PilotHeadPitch | Línea de visión del piloto |
| Etiqueta de tipo Bullseye (Navaid+Static+Bullseye) | Campo bullseye y anillos del mapa |
| Todo lo demás (PilotHeadRoll, controles, superficies, desviaciones ILS, SpO2, ENL, Label, Debug, Importance, Slot, Visible, Disabled, Radius, tamaños...) | Se muestra tal como está escrito en **Crudo** |

Los ángulos de radar y de fijación se toman frente a los ejes propios de la unidad: acimut a la derecha, elevación hacia arriba, alabeo con el ala derecha hacia abajo. La especificación ACMI dice que son relativos a la aeronave, pero no en qué sentido es positivo; esta lectura sigue su transformación (guiñada en sentido horario, cabeceo hacia arriba, alabeo a la derecha).
