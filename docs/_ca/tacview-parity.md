---
title: "Paritat amb Tacview"
parent: "Repetició de partida"
grand_parent: "Repetició"
nav_order: 1
lang: "ca"
source: "tacview-parity.md"
source_hash: "4275603255c2"
translated: true
outdated: false
---

# Paritat amb Tacview

El Tacview és un programa molt usat per veure gravacions de vol. Si el coneixes, aquesta pàgina mostra on és cada una de les seves eines al 3DHeat.

Enumera cada funció de Tacview 1.9 (el seu manual, la seva taula de cadenes de la interfície i el format de fitxer ACMI 2.2) i on es troba la [repetició de partida](match-replay.md) del 3DHeat respecte a ella. L'objectiu: tot el que el Tacview pot fer amb una repetició i les seves dades, el 3DHeat també ho pot fer.

**Estat:**
- **fet**: ja és al 3DHeat.
- **nou**: construït per igualar una funció del Tacview.
- **encara no**: s'aplica, però no està construït.
- **no aplica**: no s'aplica aquí, amb el motiu.

On trobar les funcions: la pestanya **Partida**, **Repetició amb figures** (o **Figures superposades** a la pestanya Mapa de calor), a les seccions de la barra lateral **Repetició**, **Unitats**, **Esdeveniments**, **Marcadors**, **Pantalla tàctica**, **Estadístiques**, **Desplaçament de temps i retall**, **Mapa i posició**, **Àudio i vídeo** i **Etiquetes**. Vegeu [Repetició de partida](match-replay.md).

## Càmeres {#cameras}

| Tacview | 3DHeat | Estat |
|---|---|---|
| Vista de cabina (F5), l'horitzó girant amb l'aeronau | **Cabina**: fora de la unitat, seguint la seva actitud, tal com ho té el model de moviment. La figura pròpia de la unitat s'amaga. Arrossega per mirar al voltant; **Mira endavant de nou** ho restableix. | nou |
| HUD a la vista de cabina (elecció IAS/CAS/TAS) | **Pantalla frontal** (H): horitzó i escala de cabeceig de la vista real, marcador de la trajectòria de vol, cinta de rumb, IAS, altura, TAS, Mach, G, angle d'atac, velocitat vertical, AGL | nou |
| Instruments 3D de cabina, seguiment del cap del pilot (PilotHead*), TrackIR | Sense models de cabina; els angles del cap es mostren a la vista **Cru** de la fitxa de la unitat | no aplica (sense models de cabina; el seguiment del cap és maquinari per al vol en directe) |
| Vista externa (F6): orbitar l'objecte principal | **Persecució** (gira amb la unitat) i **Òrbita** (manté la seva pròpia direcció) | fet |
| Càmera de combat aeri, «Mira l'objectiu» (fixació) | **Fixació**: des de la cabina, centrada sobre l'objectiu | nou |
| Càmera de combat aeri, «Centrada» / «Mira endavant» | **Objectiu**: darrere la unitat, sobre la línia des de l'objectiu, mirant més enllà cap a l'objectiu. **Fixa** a l'azimut 0 mira endavant des de davant. | nou |
| Intercanviar el principal i el secundari | **Intercanvia** al costat de l'objectiu | nou |
| Vista de satèl·lit (F7), vista ortogràfica des de dalt | **Satèl·lit**: cap avall, sobre la unitat, nord amunt; arrossega per girar. El mapa 2D és el pla ortogràfic. | nou |
| Càmera lliure (F8), W/A/S/D, E/C | La càmera de vol lliure (W/A/S/D, Espai/Q, Maj/Alt) | fet |
| Càmera Head-On d'extensió; càmera externa fixada a l'objecte | **Fixa**: un lloc al voltant de la unitat que gira i rota amb ella; arrossega per moure-la (darrere, a la punta d'ala, de cara) | nou |
| Càmera Lock d'extensió (congela la posició) | Deixa de seguir (Esc): la càmera es queda on era | fet |
| Vista estratègica (allunyar-se fins a la Terra sencera) | [Fons del món](world-backdrop.md) i el marc de tota la gravació del mapa 2D | fet |
| Configuració del camp de visió | FOV de **Càmera i escena** | fet |
| Canviar de vista amb tecles | **V** vista següent, **Maj+V** enrere | nou |

## Visió 3D i opcions de pantalla {#d-view-and-display-options}

| Tacview | 3DHeat | Estat |
|---|---|---|
| Estelles, control de longitud | Estelles (segons) al visor d'equip | fet |
| Estela anticipada (trajectòria endavant) | **Trajectòria endavant**: on va realment la unitat en els propers segons | nou |
| Línies d'altura de l'objecte / parets | **Línies verticals** | fet (línies; parets no construïdes) |
| Vectors de l'objecte seleccionat: rumb (puntejat), curs (continu), sustentació | **Vectors de velocitat** (curs i velocitat durant tants segons, amb un consell) i **Línies de morro i sustentació** (morro a traços, sustentació curta i fosca) | nou |
| Línia de visió del pilot | **Línia de visió del pilot**: una línia cian a traços al llarg de PilotHeadYaw/PilotHeadPitch (o d'una columna HeadYaw, ViewYaw o LookYaw) contra els eixos de la unitat | nou |
| Cúpules de abast letal de SAM/AAA (EngagementRange, VerticalEngagementRange, EngagementMode, els bessons «2») | **Zones d'enfrontament**: cúpules, ovoides quan el rang vertical és diferent, apagades mentre EngagementMode és 0 | nou |
| Fixacions de radar (LockedTarget..9) amb etiquetes | **Fixacions**: línies vermelles a cada objecte fixat; guionet ambre cap a FocusedTarget; al llarg de LockedTargetAzimuth/Elevation/Range quan no es nomena cap objecte. **Etiquetes de fixació**: el nom i la distància de l'objectiu a cada línia de fixació | nou |
| Con de radar (RadarMode, Azimuth, Elevation, Roll, Range, amplades del feix) i porta de distància | **Cons de radar**: la vora i l'anell mig del feix, girats per azimut, elevació i balanceig contra la unitat; la porta de distància com a dues vores grogues. Sense amplades del feix, només l'eix del feix. | nou |
| Línia de visió entre els dos objectes seleccionats (verd / vermell puntejat quan el terreny els bloqueja) | La línia de la parella mesurada es torna vermella i a traços quan el terreny és entre ells | nou |
| Ampliar automàticament els objectes llunyans | La figura més petita a la pantalla (píxels) | fet |
| Graella de latitud/longitud | **Mapa i posició → Graella**: línies de latitud i longitud sobre el terra sota la càmera, a un espaiat rodó segons l'altura (de 10° fins a 1'), amb etiquetes; o la graella quilomètrica **MGRS** de la zona UTM, amb la zona i el quadrat de 100 km. La graella pròpia del mapa 2D, com abans | nou |
| Anells de bullseye | Anells al voltant del bullseye de cada equip al mapa 2D | nou (només 2D) |
| Superposició de senda de planatge | **Sendes de planatge**: trajectòries de 3° amb les vores de fons d'escala ±0,7° a tots dos extrems de cada pista propera a la gravació, a partir dels llindars i les altituds topogràfics d'OurAirports (descarregats una vegada i guardats fora de línia), una marca a cada milla náutica, amb el nom de l'aeroport i la pista | nou |
| Restriccions d'altitud (alarma de sostre/terra) | **Restricció d'altitud**: un terra i un sostre; les etiquetes de les unitats fora es tornen vermelles, i es llista cada creuament (per sota del terra, per sobre del sostre, de nou a dins): un clic hi va i segueix la unitat | nou |
| Objectes destruïts en gris, eliminats als 15 min | Les vides acaben amb la seva traça; una unitat morta s'atenua a la llista d'unitats | fet |
| Propietats Visible / Disabled | Es mostren a **Cru**; res s'amaga per elles | encara no |
| Mostrar posicions de palanca/accelerador/pedals | Accelerador i valors del motor en camps; entrades de control a **Cru** | fet (com a valors) |
| Comentaris com a subtítols | **Missatges com a subtítols** (Etiquetes): esdeveniments ACMI Message i Comment, i el xat de qualsevol joc (esdeveniments Chat, Say o Radio, o una columna de xat), a la part inferior de la vista amb qui ho va dir, durant sis segons | nou |
| Visualització de la data i de l'hora UTC | Rellotge de la línia de temps amb UTC quan la gravació té una hora de referència | fet |
| Posició del ratolí en latitud/longitud, MGRS, bullseye | La targeta de selecció (fer clic en un punt) dóna la latitud/longitud en graus, minuts i segons i el MGRS al costat dels metres del món; bullseye per unitat (camp) | nou |
| Logotip personalitzat | No construït | no aplica (marca) |
| Models 3D, el més proper quan no es coneix | Catàleg propi de figures, equivalent més proper, mida real | fet |
| Enfrontaments múltiples (línies entre totes les parelles) | **Línies d'enfrontament**: des de cada unitat dins de l'àmbit fins a cada adversari dins de l'abast definit (de 1 a 200 km), cadascuna amb la seva distància, les 60 parelles més properes; la parella mesurada com abans | nou |

## Etiquetes {#labels}

| Tacview | 3DHeat | Estat |
|---|---|---|
| Etiquetes activades/desactivades, per separat per als objectes seleccionats i no seleccionats | **Etiquetes** amb regles per a **Seleccionades**, **Aeronaus**, **Terra**, **Vaixells**, **Armes** i **IA**: mostrades o no, valors propis, prioritat | nou |
| Camps d'etiqueta: nom, indicatiu, pilot, velocitats (TAS/CAS/IAS/Mach/GS), alçades (ASL/AGL), VS, AOA, AOS, G (vertical, lateral, longitudinal), velocitat de gir i radi, energia, pes/volum/cabal de combustible, rumb/ruta, balanceig/cabeceig, freqüència cardíaca | Cada valor de `fields.ts`: la mateixa llista, calculat on no es va registrar (estimacions marcades amb ~). La velocitat de balanceig i SpO2 només a través de Cru. | fet |
| Posició del bullseye a les etiquetes | Camp **Bullseye (rumb / distància)** | nou |
| Desviacions ILS, distància volada | Valors crus; distància volada a les estadístiques | fet (en part) |
| Desembarassar la telemetria no seleccionada | **Separa les etiquetes**, ordenades per la prioritat de cada regla | fet / nou |
| Etiquetar tots els objectes terrestres / només les amenaces | Les regles Terra i IA | nou |
| Escala de les etiquetes | **Mida de les etiquetes** (60-250 %) | nou |
| Unitats mètriques / imperials | Mètriques / imperials | fet (dos ajustos predefinits, no vuit) |

## Informació de l'objecte i telemetria {#object-info-and-telemetry}

| Tacview | 3DHeat | Estat |
|---|---|---|
| Selecció principal i secundària | Fer clic segueix i selecciona; fer Maj+clic a dos per mesurar; selector **Objectiu** | fet / nou |
| Distància / rumb / aspecte / aproximació entre dos objectes | Línia BRAA de la parella mesurada; camps Distància, Rumb, Aspecte i Aproximació de la unitat seguida | fet |
| Marcació relativa, velocitat de la línia de visió | Camps **Marcació relativa** (des del morro de la unitat seguida, E/D) i **Velocitat angular de la línia de visió** (°/s) | nou |
| Finestres de telemetria | La fitxa de la unitat i la targeta en passar-hi per sobre | fet |
| Telemetria crua (cada propietat registrada, també les desconegudes) | **Cru** a la fitxa de la unitat: cada columna a la fila de la unitat tal com està escrita | nou |
| Llista d'objectes actius | **Unitats**: jugadors, IA, armes en vol; les vives brillen | fet |
| Finestra de propietats de la gravació (títol, autor, instruccions...) | Guardades com la columna RecordingInfo; es mostren a Cru | fet (sense finestra) |
| Formats de posició DMS/MGRS, nord magnètic | Camp **Posició (lat / long)** en DMS i MGRS; un camp **Rumb magnètic**; **Rumbs magnètics** escriu el rumb, el curs i la marcació magnètics (°M) i mostra una brúixola amb els dos nords i la declinació - el World Magnetic Model 2025 (coeficients de domini públic), calculat aquí al lloc i la data de la unitat | nou |

## Gràfics {#charts}

| Tacview | 3DHeat | Estat |
|---|---|---|
| Gràfic d'un objecte, fins a 4 valors | **Al llarg del temps** (i el gràfic de sota de Repetició) | fet |
| Traçar fins a 4 objectes alhora | **Comparació**: un valor de fins a 8 unitats en una sola escala | nou |
| Un valor contra un altre (estil energia-maniobrabilitat) | **Valor contra valor**: velocitat de gir contra velocitat o qualsevol parella, cada unitat és una línia, el seu punt actual marcat | nou |
| Eix X per temps; zoom; moure el temps des del gràfic | La roda fa zoom en el temps, doble clic restableix, un clic va al moment | nou |
| Eix X per distància en aire o a terra | **Temps / Distància en aire / Distància a terra** als gràfics de temps i de comparació; el zoom i anar-hi amb un clic funcionen igual | nou |
| Gràfics predefinits (energia, acceleració...) | Es pot triar qualsevol valor (l'altura d'energia i la seva velocitat són valors) | fet |

## Estadístiques, registre de vol, esdeveniments {#statistics-flight-log-events}

| Tacview | 3DHeat | Estat |
|---|---|---|
| Registre de vol: enlairat, aterrat, disparat, colpejat per, destruït per, sortit de l'àrea | **Estadístiques** per unitat: vides, morts, baixes, trets, impactes, percentatge d'encert, enlairaments, aterratges, temps en vol, G màxima (i mínima), velocitat màxima, altura i Mach, distància. Els enlairaments surten dels esdeveniments TakenOff/Landed, OnGround, AGL, o d'una estimació marcada amb ~. | nou |
| Complements de marcador i d'informe de missió | Resum per equip i més baixes; el propi marcador del resum de la partida | nou / fet |
| Exporta el registre de vol en XML/CSV | **Exporta CSV** de les estadístiques, i dels esdeveniments tal com estan llistats | nou (només CSV) |
| Exporta la telemetria en CSV a una freqüència | **Telemetria de la unitat seleccionada**: cada valor, de 1 a 20 per segon | nou |
| Registre d'esdeveniments, doble clic per anar-hi i seleccionar | Llista **Esdeveniments**, filtrada per tipus i unitat; un clic hi vola | fet |
| Esdeveniment anterior / següent (Ctrl+←/→) | **Re Pàg / Av Pàg** | nou |
| Pausa a l'esdeveniment | **Pausa a l'esdeveniment** | nou |
| Marques de la línia de temps (llançaments, impactes, destruccions; les de l'objecte seleccionat en blau; marcadors en vermell) | Morts i baixes com a barra de densitat, les de la unitat seguida en blau, marcadors en vermell; un clic hi va | nou |
| Eliminar un esdeveniment, eliminar una mort | No construït | no aplica (els esdeveniments són de la gravació; els filtres els amaguen) |

## Marcadors {#bookmarks}

| Tacview | 3DHeat | Estat |
|---|---|---|
| Inserir un marcador amb la selecció i el punt de vista | **Afegeix un marcador** (B): el moment, la càmera lliure o la unitat seguida amb la seva vista, distància i objectiu; amb nom; guardat en aquest navegador per gravació | nou |
| Eliminar un marcador | × a la llista | nou |
| Marcadors a la línia de temps i als registres | Marques vermelles; la llista | nou |
| Event=Bookmark a ACMI | Llistat sota les marques de la gravació, amb les baixes, les morts i els missatges | nou |
| Drecera de copiar/enganxar (compartir una vista) | **Exporta / Importa** els marcadors com a fitxer; C copia la posició de la càmera | nou |

## Reproducció {#playback}

| Tacview | 3DHeat | Estat |
|---|---|---|
| Reproduir/pausa, a l'inici, velocitat, moure la línia de temps | Línia de temps | fet |
| Fotograma a fotograma | **,** i **.** un segon enrere i endavant (Maj: deu) | nou |
| Reproducció inversa | **◀** a la línia de temps, **J** (**L** endavant; la mateixa tecla altra vegada pausa): reprodueix des del final cap a l'inici a la velocitat escollida, en bucle o aturant-se a l'inici | nou |
| Diàleg de salt de temps | La línia de temps i la llista d'esdeveniments | fet |
| Desplaçar en el temps un objecte (fantasma) | **Desplaçament de temps i retall**: mou el vol d'una unitat, o d'una gravació sencera, tants segons; **Alinea els enregistraments** mou diverses gravacions perquè comencin juntes i les reprodueix alhora (dues sortides en dies diferents una al costat de l'altra). La gravació es reconstrueix, així que les estelles, els esdeveniments, els gràfics i les estadístiques la segueixen | nou |
| Retallar abans/després | **Des d'ara / Fins ara / Retalla a aquest tram** (desfer manté els desplaçaments), després **Exporta CSV** (es torna a carregar al 3DHeat) o **Exporta ACMI** (text Tacview 2.2, per a una gravació situada sobre la Terra) | nou |

## Terreny i mapa {#terrain-and-map}

| Tacview | 3DHeat | Estat |
|---|---|---|
| Terreny real, elevació i textures personalitzades | Nivells (el mapa propi del joc com a model 3D), rajoles del fons del món | fet |
| Modes de terreny pla / buit / d'alt contrast | [Aparença del nivell](level-appearance.md): relleu del terreny, superfície i estructures mostrades o no | fet (no són els mateixos modes) |
| Mapa tàctic 2D (el Tacview no en té: vista de satèl·lit) | **Mapa 2D**: vista de cantonada o completa, símbols per tipus i equip (jugadors plens, IA amb contorn) girats cap al seu rumb, estelles, noms, barra d'escala, anells de distància al voltant de la unitat seguida, anells de bullseye, el lloc de la càmera 3D, les morts recents; arrossega, roda, clic per seguir (M) | nou |
| Objectes estàtics (aeroports, pistes, punts de pas, àrees, KML) | Pistes topografiades (OurAirports) al fons del món i les seves sendes de planatge; els punts de pas GPX i les marques KML es carreguen com a objectes fixos; el [Tauler tàctic](tactics-board.md) dibuixa àrees i rutes | nou |

## Importació, exportació, enregistrament {#import-export-recording}

| Tacview | 3DHeat | Estat |
|---|---|---|
| Text i zip d'ACMI | [Tacview ACMI](tacview-acmi.md) | fet |
| GPX, KML, CSV, NMEA, IGC, FIT, DIS... | **GPX** (traces, rutes, punts de pas; freqüència cardíaca, cadència, potència, temperatura de Garmin), **KML/KMZ** (gx:Track, LineString, Point), **NMEA 0183** (RMC i GGA de qualsevol emissor, sumes de control verificades, a través de mitjanit), **IGC** (registres B, data, pilot i planador), **FIT** (missatges de registre, marques de temps comprimides) - cadascun situat per latitud i longitud al pla al mig de les traces, perquè el fons del món quadri; rumb, cabeceig i velocitat del fitxer o de punt a punt. CSV i Parquet com abans | nou (DIS no aplica: és un protocol de xarxa en directe) |
| Enregistradors natius (DCS, BMS, IL-2, MSFS...) | Els propis convertidors del 3DHeat (War Thunder, CS2, Squad, Arma i altres) | fet (propis) |
| Telemetria en temps real per TCP, ADS-B | No construït | no aplica (es repeteix després de la partida) |
| Àudio/vídeo sincronitzat | **Àudio i vídeo**: un fitxer local es reprodueix, es pausa, es busca i canvia de velocitat amb la línia de temps des d'un inici fixat (**Comença ara**, ±0,1 s); un vídeo en un panell redimensionable sobre la vista, o imatge en imatge. El fitxer es queda al navegador | nou |
| Exportació de vídeo | [Camí de la càmera i vídeo](camera-path-and-video.md) | fet |

## Altres {#other}

| Tacview | 3DHeat | Estat |
|---|---|---|
| Complements en Lua | No construït | no aplica (codi obert: canvia el propi visor) |
| Informe en línia (sessió compartida) | No construït | no aplica (el del Tacview és una sessió allotjada que manté tothom en el mateix cap de reproducció. El 3DHeat no té servidor i guarda les gravacions a l'ordinador del visor, i fins i tot un enllaç entre parells necessita un servidor de senyalització. Un informe es comparteix com a fitxers: la gravació retallada (Exporta ACMI o CSV) i el fitxer de marcadors, que s'obren als mateixos moments i vistes) |
| Control remot per un instructor | No construït | no aplica (controla un simulador en marxa) |
| Edició d'objectes (afegir, editar, eliminar objectes) | [Tauler tàctic](tactics-board.md) per als objectes planificats; les gravacions són de només lectura | no aplica |
| Idiomes | 40 idiomes | fet |
| Autenticació de gravacions | No construït | no aplica |

## Per a desenvolupadors: propietats ACMI 2.2 {#for-developers-acmi-22-properties}

Les llegeix `data/acmi.ts`; les propietats numèriques esdevenen columnes numèriques, i les de text, columnes de categoria. Totes es mostren a **Cru** a la fitxa de la unitat. Aquestes es llegeixen amb un propòsit:

| Propietats | Ús |
|---|---|
| T (les quatre formes), Name, Type, Pilot, Group, Country, Coalition, Color, CallSign | Posició, actitud, figura, nom de la unitat, equip |
| IAS, CAS, TAS, Mach, AOA, AOS, AGL, HDG, HDM, OnGround | Camps, gràfics, pantalla frontal, detecció d'enlairament i aterratge |
| VerticalGForce, LongitudinalGForce, LateralGForce | Camps de G |
| Throttle(2), Afterburner, EngineRPM(2), NR, AirBrakes, Flaps, LandingGear, Tailhook | Camps |
| FuelWeight..9, FuelVolume..9, FuelFlowWeight..8 | Camps de combustible, sumats als dipòsits |
| RadarMode, RadarAzimuth, RadarElevation, RadarRoll, RadarRange, RadarHorizontalBeamwidth, RadarVerticalBeamwidth, RadarRangeGateAzimuth/Elevation/Min/Max/HorizontalBeamwidth/VerticalBeamwidth | Cons de radar i porta de distància |
| LockedTarget..9, LockedTargetMode, LockedTargetAzimuth/Elevation/Range, FocusedTarget | Línies de fixació |
| EngagementMode(2), EngagementRange(2), VerticalEngagementRange(2) | Cúpules d'enfrontament |
| QNH, AltimeterSetting, WindSpeed, WindDirection, HeartRate | Camps |
| Health | Camp |
| Esdeveniments: Destroyed, TakenOff, Landed, Bookmark, Message, Comment, LeftArea, Timeout | Llista d'esdeveniments, estadístiques (morts, enlairaments, aterratges), marcadors; Message i Comment com a subtítols |
| PilotHeadYaw, PilotHeadPitch | Línia de visió del pilot |
| Etiqueta de tipus Bullseye (Navaid+Static+Bullseye) | Camp de bullseye i anells del mapa |
| Tot el demés (PilotHeadRoll, controls, superfícies, desviacions ILS, SpO2, ENL, Label, Debug, Importance, Slot, Visible, Disabled, Radius, mides...) | Es mostra tal com està escrit a **Cru** |

Els angles de radar i de fixació es prenen contra els propis eixos de la unitat: azimut cap a la dreta, elevació cap amunt, balanceig amb l'ala dreta cap avall. L'especificació ACMI diu que són relatius a l'aeronau però no en quin sentit és positiu; aquesta lectura segueix la seva transformació (guinyada en sentit horari, cabeceig cap amunt, balanceig a la dreta).
