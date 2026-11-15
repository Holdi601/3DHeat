---
title: "Grabaciones de Tacview (ACMI)"
parent: "Cargar datos"
nav_order: 7
lang: "es"
source: "tacview-acmi.md"
source_hash: "48a81edbd9b3"
translated: true
outdated: false
---

# Grabaciones de Tacview (ACMI)

Tacview es un programa que graba vuelos en simuladores de vuelo; sus archivos terminan en `.acmi`. 3DHeat los abre para que vea dónde voló cada avión.

Las grabaciones de vuelo de Tacview se cargan como cualquier tabla: elija o arrastre un `.acmi` (texto, `.txt.acmi`, o comprimido, `.zip.acmi`) y pulse **Cargar**. Así obtiene el calor de todos los vuelos, y en la pestaña **Partida**, una repetición con figuras, trayectorias y una lista de eventos ([Repetición de partida](match-replay.md)). ACMI es el formato de archivo público de Tacview ([documentación](https://www.tacview.net/documentation/acmi/)); DCS (a través del exportador de Tacview), IL-2 Great Battles, Falcon BMS, X-Plane, MSFS y otros lo escriben, así que esto lee cualquiera de ellos.

## Lo que se convierte en una grabación {#what-a-recording-becomes}

Una fila cada vez que se escribe la posición de un objeto, una fila por evento en el lugar del objeto, y una fila cuando un objeto desaparece (`Removed`, donde estaba por última vez). Un evento sobre un objeto que aún no se ha visto —un marcador, un mensaje a todos— es una fila del objeto `(recording)` en el punto de referencia. La grabación lleva sus propias instrucciones de lectura, así que el paso de asignación se rellena solo. El lector escribe estas columnas: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo`, y después cualquier otra propiedad que tenga la grabación. Sus funciones:

| Columna | Función | Significado |
|---|---|---|
| Time | tiempo | Segundos después de la ReferenceTime de la grabación; segundos Unix cuando la tiene, así el reloj muestra la hora real. |
| X, Y | posición | Este y norte, en metros, sobre un plano que toca la tierra en el punto de referencia de la grabación: las distancias y los rumbos son reales cerca de él, y se desvían menos de una parte por mil a 100 km. El norte pasa a ser el -Z del mundo. |
| Altitude | posición (arriba) | Metros. |
| Object | persona | El piloto y el nombre del objeto con su id, p. ej. `Viper 1 (F-16C_50) #a01`; un objeto sin tripulación `(T-90A) #401`. |
| Coalition | equipo | El bando (o el color, cuando no hay coalición). |
| Heading, Pitch | mirada | Grados; el rumbo 0 es el norte. |
| Recording | sesión | El Title de la grabación, o el nombre del archivo: varias grabaciones se cargan una junto a otra sin que sus trayectorias se unan. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | filtros | Se guardan para filtrar; Type y Name eligen la [figura](figures.md) de cada objeto, Event alimenta la lista de eventos del análisis, Roll inclina el avión. |
| U, V | | Los metros planos propios del juego, cuando todas las muestras los tienen (DCS los escribe). |
| EventObjects | filtros | Todos los objetos que nombra un evento (`Message|a01|b02|...`), por id. |
| RecordingInfo | | Las propiedades propias de la grabación tal como estaban en ese momento —DataSource, DataRecorder, Author, Category, Briefing, Comments, ...— en JSON. |
| IAS, Mach, AOA, FuelWeight, ... | filtros | Cualquier otra propiedad numérica que tenga la grabación. |
| Parent, CallSign, LockedTarget, Label, Shape, ... | filtros | Cualquier otra propiedad de texto que tenga la grabación; una propiedad cuyo valor no es un número es texto. |

Se leen las cuatro formas de posición de Tacview (`lon|lat|alt`, con `u|v`, con `roll|pitch|yaw`, y con todas ellas y un rumbo). Los campos vacíos conservan el último valor; `-id` elimina un objeto, y un id usado de nuevo después es un objeto nuevo. Se tratan las comas escapadas y las líneas continuadas.

Las posiciones se proyectan siempre a partir de la latitud y la longitud, nunca de U/V, así que las grabaciones de todos los juegos comparten una proyección con un fondo del mundo real.
