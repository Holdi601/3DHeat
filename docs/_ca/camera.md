---
title: "Càmera i controls"
nav_order: 14
has_children: true
lang: "ca"
source: "camera.md"
source_hash: "b578366d26ec"
translated: true
outdated: false
---

# Càmera i controls

Vola per l'escena com un ocell: **W A S D** per moure't, arrossega amb el ratolí per mirar. Fes servir aquesta pàgina per volar, per anar a una vista des de dalt o de costat, i per llegir exactament on és la càmera.

## Vola en 4 passos {#fly-in-4-steps}

1. Fes clic una vegada sobre la vista perquè tingui el teclat.
2. Mantén **W** per volar cap endavant, **S** cap enrere, **A** i **D** de costat, **Space** cap amunt, **Q** cap avall.
3. Mantén premut el botó esquerre o dret del ratolí i arrossega per mirar al voltant.
4. Prem **F** per tornar a enquadrar totes les dades.

La càmera és una càmera de vol lliure amb projecció en perspectiva i paral·lela, vistes predefinides, una posició escrita, i profunditat de camp. Els seus ajustos són al panell **Càmera i escena** a la part inferior de la barra lateral (també es mostra a les pestanyes Anàlisi de curses i Partida). La implementació és [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

## Volar {#flying}

| Entrada | Efecte |
|---|---|
| `W` `A` `S` `D` o les tecles de fletxa | Endavant (seguint la vista, incloent-hi el cabeceig), esquerra, enrere, dreta |
| `Space` o `E` | Amunt (amunt del món) |
| `Q` o `Ctrl` esquerre | Avall |
| `Shift` (mantingut) | 6× més ràpid |
| `Alt` esquerre (mantingut) | 15% de velocitat |
| Arrossegar amb el botó esquerre o dret del ratolí | Mirar al voltant. El punter queda bloquejat mentre arrossegues. |
| Roda del ratolí | Velocitat de vol ×1,5 per cada clic (perspectiva); zoom (paral·lela) |
| `F` | Enquadrar les dades |
| Clic (sense arrossegar) | Mostrar què hi ha sota el punter ([Inspeccionar la vista](#inspecting-the-view)) |
| `C` | Copiar la posició de la càmera, la guinyada i el cabeceig |
| `G` | Anar a un punt escrit |
| `Esc` | Tancar la targeta de selecció (i deixar de seguir una unitat) |

### Mentre segueixes una unitat {#while-following-a-unit}

Quan la càmera segueix una unitat en una repetició ([Repetició de partida](match-replay.md)), les tecles de vol fan una altra cosa:

| Entrada | Efecte |
|---|---|
| Roda, `W` / `S` | Més a prop de la unitat / més lluny (més amunt / més avall a la vista de satèl·lit) |
| `A` / `D`, `Q` / `E` | Orbitar al voltant de la unitat (vistes de persecució i òrbita) |
| Arrossegar | Mirar al voltant de la unitat (cabina: mirar al voltant dins) |
| `V` / `Shift+V` | Vista de càmera següent / anterior |
| `Esc` | Primer deixa de mirar la segona unitat, després deixa de seguir |

Les tecles de moviment se sumen amb un [comandament](gamepad.md); vegeu la [referència del teclat](keyboard-reference.md) per a tot el demés. Les tecles s'ignoren mentre una caixa de text o un desplegable té el focus. El cabeceig es limita just abans de la vertical, amunt i avall.

## Panell Càmera i escena {#camera--scene-panel}

![El panell Càmera i escena: Projecció, Vistes predefinides, botons de Camp de visió, Velocitat de vol i Posició](../assets/img/en/camera-panel.webp)

### Projecció {#projection}

**Projecció**: *Perspectiva* (per defecte) o *Paral·lela*.

*Paral·lela* (ortogràfica) elimina l'escorç, de manera que dos punts calents de la mateixa densitat es llegeixen com la mateixa mida en qualsevol lloc del quadre - la comparació que serveix un mapa de calor - i és el que fa que una vista isomètrica sigui isomètrica. En mode paral·lel la roda del ratolí fa zoom (no hi ha moviment cap endavant que canviï l'escala) i la [visualització de velocitat](#fly-speed) s'amaga.

**Canviar manté el subjecte de la mateixa mida.** Una projecció paral·lela no té camp de visió, així que la seva altura de volum no té relació amb la distància de la càmera; canviar sense més fa un zoom salvatge o no mostra res. En passar a paral·lela, l'altura del volum es posa al que cobreix la càmera en perspectiva a la distància de focus (2 × distància × tan(camp / 2), la distància de focus sent la distància de l'últim enquadrament). En tornar, es restaura la posició de perspectiva que vas deixar, a la mateixa escala aparent, en lloc d'on hagués anat la vista paral·lela.

### Vistes predefinides {#preset-views}

| Grup | Botons | Orientació |
|---|---|---|
| **Isomètrica** | **NE**, **NO**, **SE**, **SO** | Paral·lela, cabeceig -35,264° (= atan(1/√2), l'angle en què els tres eixos es projecten amb la mateixa longitud), guinyada -45°, 45°, -135°, 135°. Quatre cantonades, perquè una sola sempre amaga la meitat del mapa darrere del que és més a prop. |
| **Alçats** | **Superior**, **Inferior**, **Davant**, **Darrere**, **Esquerra**, **Dreta** | Paral·lela. Superior mira just cap avall (cabeceig -89,9°), Inferior just cap amunt, Davant al llarg de -Z (guinyada 0°), Darrere al llarg de +Z (180°), Esquerra al llarg de -X (-90°), Dreta al llarg de +X (90°). |
| | **Torna a la perspectiva** | Torna a la posició de perspectiva que vas deixar. Desactivat en perspectiva. |
| | **Vista de tres quarts** | Perspectiva, guinyada -35°, cabeceig -28°. |

Cada predefinit canvia la projecció en si - sota la perspectiva una «vista superior» encara convergeix cap a un punt de fuga i les àrees iguals deixen de llegir-se com a iguals - i enquadra les dades des d'aquella direcció.

### Camp de visió {#field-of-view}

**Camp de visió** - l'angle vertical. Per defecte 65°, de 10 a 140° a la barra (179° amb la maneta), amb els botons **Pla 20°**, **Llarg 35°**, **Normal 50°**, **Ample 65°**, **Molt ample 90°**. Un camp estret aplana la perspectiva i es llegeix més com una projecció paral·lela; un camp ampli exagera la profunditat i fa difícil jutjar les distàncies. Continua actiu en mode paral·lel, on fixa l'escala que resol el canvi de tornada i la distància que usa **Enquadra les dades**.

### Velocitat de vol {#fly-speed}

**Velocitat de vol** - unitats del món (metres) per segon a plena potència. Per defecte 120; a cada càrrega, l'extensió horitzontal de les dades / 12. Logarítmica, de 0,02 a 20.000 (200.000 amb la maneta; la maneta la canvia per proporcions, no per quantitats). La roda del ratolí multiplica o divideix per 1,5 per cada clic, dins de 0,02-200.000.

El mateix valor es mostra a la part inferior dreta de la vista (només en perspectiva): la velocitat en m/s o km/s i el temps que triga a creuar les dades (o el nivell, quan hi ha un nivell 3D carregat) a aquesta velocitat. Arrossega-la amunt o avall per canviar la velocitat.

### Proper i llunyà {#near-and-far}

Les distàncies de retall **Proper** (per defecte 0,5) i **Llunyà** (per defecte 40.000). Totes dues es recalculen a partir de les dades a cada càrrega (proper = max(0,05, extensió / 20.000), llunyà = extensió × 12) i s'amplien, mai no s'estreuen, per un nivell 3D que sigui més gran ([Nivells](levels.md#what-a-level-does-for-the-heat)). La seva proporció fixa la precisió de profunditat de la qual depèn l'oclusió, així que un proper minúscul amb un llunyà enorme debilita l'[oclusió](depth-and-culling.md). Vist des de fora de l'escena o des de dalt del seu terra, el pla proper usat es mou fins al 2% d'aquesta distància, així que un mapa vist des de lluny conserva prou precisió de profunditat perquè l'aigua i la costa no parpellegin; la caixa encara mostra el valor fixat.

### Altres controls {#other-controls}

| Control | Per defecte | Significat |
|---|---|---|
| **Inverteix Y** | desactivat | Inverteix el mirar amb el ratolí amunt/avall. |
| **Profunditat de camp** | desactivat | Vegeu a continuació. |
| **Comandament** | activat | Vegeu [Comandament i HOTAS](gamepad.md). |
| **Posició** | | Vegeu a continuació. |
| **Inspecciona** | | La lectura de la càmera, la selecció fent clic, la convenció de guinyada i *Vés a un punt*; vegeu [Inspeccionar la vista](#inspecting-the-view). |
| **Enquadra les dades (F)** | | Ajusta les dades (a la pestanya Anàlisi de curses: les voltes) a la vista, mantenint la direcció actual. La càmera es col·loca a r / tan(camp / 2) del centre, sent r la meitat de la diagonal dels límits de les dades. |
| **Quadrícula**, **Eixos** | sí, sí | Una quadrícula al terra amb un espaiat 1/2/5 × 10ⁿ d'uns 1/40 de l'abast de les dades (estenent-se fins a 1,5 × les dades, entre 8 i 120 passos de quadrícula), i eixos de colors. |
| **Inverteix un eix del món** X, Y, Z | desactivat | Vegeu a continuació. |

### Posició {#pose}

Cinc caixes de números - **X**, **Y**, **Z** i **guinyada °**, **cabeceig °** - que segueixen la càmera mentre cap d'elles té el focus. Escriu un valor i prem `Enter` (o surt de la caixa) per moure la càmera allà. **copia** posa `pos X Y Z · guinyada A · cabeceig B` al porta-retalls (amb `(guinyada del joc)` després quan s'escull aquesta convenció). Volar és com explores; les coordenades són com reprodueixes una vista. Són els mateixos números que la [lectura de la càmera](#camera-readout): les pròpies coordenades de les dades, també quan un eix està invertit, i la guinyada en la [convenció](#yaw-conventions) escollida.

### Inverteix un eix del món {#invert-world-axis}

**Inverteix un eix del món X / Y / Z** dibuixa el món amb aquell eix invertit. Un joc que manté un món d'orientació esquerra surt emmirallat en aquest visor de orientació dreta - els revolts a la dreta dibuixats com a revolts a l'esquerra - i invertir X o Z ho torna a posar bé. **Només canvia el dibuix**: les dades, l'anàlisi i cada coordenada que mostren les eines (posició, regle, llesca) es queden les del propi joc. La vista es gira al lloc, mantenint-te mirant el mateix punt. Aquest ajust es recorda al navegador (clau de `localStorage` `heat3d.mirror`); compara-ho amb els [volteigs](axes-units-and-time.md#flips) de la càrrega, que sí que canvien les dades.

## Inspeccionar la vista {#inspecting-the-view}

On és la càmera, què hi ha sota el punter, i anar a un punt - el bloc **Inspecciona** del panell Càmera i escena, i dues capes a la part superior esquerra de la vista. El codi és a [`pose.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pose.ts), [`pick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pick.ts) i [`inspector.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/inspector.ts).

| Control | Per defecte | Significat |
|---|---|---|
| **Posició de la càmera sobre la vista** | activat | La lectura de la càmera, a continuació. També es tanca amb la seva **×**. |
| **Un clic mostra què hi ha** | activat | Selecció fent clic, a continuació. |
| **Convenció de guinyada** | Visor | Quina guinyada mostren i llegeixen la lectura, les caixes de posició i la caixa de salt. |

Aquests tres es recorden al navegador (clau de `localStorage` `heat3d.inspect`).

### Lectura de la càmera {#camera-readout}

A la part superior esquerra de la vista: la **x**, **y**, **z**, **guinyada** i **cabeceig** de la càmera, en directe, amb una etiqueta que anomena la convenció de guinyada. Mostra els mateixos números que les caixes de [Posició](#pose) i no costa res mentre vola (s'escriu a la pàgina amb el rellotge de fotogrames, sense tornar a dibuixar els panells).

- **copia** (o `C` a qualsevol lloc fora d'una caixa de text) posa `x X y Y z Z guinyada A cabeceig B (guinyada del visor)` al porta-retalls, amb decimals `.` en qualsevol idioma - una línia que la caixa de salt, i qualsevol script, llegeix de nou.
- **vés a** (o `G`) obre una caixa sota ella: enganxa un punt i prem `Enter` per mirar-lo, o enganxa una posició copiada sencera per situar-te en aquella vista. `Esc` tanca la caixa.

### Coordenades: el marc propi de les dades {#coordinates-the-datas-own-frame}

Cada coordenada que mostren o accepten les eines d'inspecció és al **marc propi de les dades carregades**: el [mapatge d'eixos](axes-units-and-time.md) de la càrrega (eix amunt, volteigs, escala) es desfà. Una posició llegida de la vista és el número que conté la taula d'origen, i un número de la taula escrit a la caixa de salt cau en aquell punt. Quan el mapatge no canvia res (una càrrega amb Y amunt i sense escala - que és el que escriuen les eines de captura i els exportadors de nivells) això és simplement el món; si no, la lectura porta una etiqueta de **marc de dades**. Sense conjunt de dades, les coordenades són coordenades del món. La guinyada i el cabeceig sempre són sobre el món del visor, amb Y amunt.

### Convencions de guinyada {#yaw-conventions}

| Convenció | La guinyada 0° mira al llarg de | Creix cap a | L'usen |
|---|---|---|---|
| **Visor** | -Z | -X | la càmera de vol, [vistes predefinides](#preset-views) |
| **Joc / eines de captura** | +X | -Z | les columnes `yaw` i les posicions de les eines de captura; en un nivell exportat al marc del visor, la guinyada pròpia del joc |

El cabeceig és igual en totes dues: amunt des de l'horitzontal. Les dues es diferencien en un quart de volta i res més:

> guinyada del visor = guinyada del joc - 90°

Una direcció `d` és `(cos p · cos y, sin p, -cos p · sin y)` en la convenció del joc i `(-sin y · cos p, sin p, -cos y · cos p)` en la del visor. Escull **Joc / eines de captura** per escriure una guinyada directament d'una taula de captura, o per comparar la lectura amb una.

### Anar a un punt {#going-to-a-point}

**Vés a un punt**, al bloc Inspecciona (i a la caixa **vés a** de la lectura):

- la caixa de text accepta `x, y, z` o `x y z` (o `x; y; z`), amb punt decimal o coma decimal - `-321.6, 137.8, -59.9` i `-321,6 137,8 -59,9` són el mateix punt. Cinc números afegeixen una guinyada i un cabeceig, i una posició copiada de la lectura o de les caixes de posició es llegeix sencera, amb les etiquetes i la convenció incloses;
- **guinyada °** i **cabeceig °** (opcionals) giren la càmera, en la convenció escollida;
- **Mira** manté el rumb (inclinat per mirar cap avall almenys 20° si estava mirant nivellat) i retrocedeix al llarg seu fins a la distància actual, mantinguda entre el 0,3% i el 3% de l'amplada de l'escena - de 6 a 60 m en un nivell de dos quilòmetres. La distància de focus, l'altura de la vista paral·lela i la velocitat de vol la segueixen, perquè la vista arribi utilitzable;
- **Situa't aquí** posa la càmera sobre el punt, girada a la guinyada i el cabeceig indicats, o com estava.

Una posició enganxada amb la seva pròpia guinyada i cabeceig sempre situa en aquella vista.

### Selecció fent clic {#click-to-pick}

Un clic sobre la vista - premer i deixar anar sense arrossegar més de 4 píxels; un arrossegament encara mira al voltant - mostra una targeta a la part superior esquerra amb el que hi ha sota el punter. Mentre el [regle](measure.md) està activat, els clics van al regle.

**Un punt de dades dibuixat guanya.** La mostra més propera a menys de 8 píxels del clic, de les realment dibuixades: les files de la finestra de temps i de la vida, que passen els [filtres](filters.md), els grups mostrats i la divisió de diferències, dins del retall per distància i una llesca que talla la calor. A la repetició de caixes, una caixa sota el punter (en qualsevol lloc d'ella). La targeta llista cada columna que porta la fila, amb els noms de columna propis de la font - temps (hora de rellotge, o els segons propis del fitxer amb `m:ss.ss`), persona, grup, sessió, cada columna conservada, la posició i la direcció de mirada - i la distància des de la càmera. Només les columnes que la càrrega va conservar són a la memòria: una columna no triada com a [columna de filtre](column-mapping.md) no es mostra.

**Si no, la superfície del nivell**: el punt on el raig del clic troba els triangles reals del nivell (no el pla de referència del regle), amb la **peça** a què pertany (el nom de l'exportador, `structure:props`, `ground:terrain …`), el seu **tipus** (terra, estructura, aigua, imatge de mapa), les coordenades i la distància. La geometria amagada per una llesca o pel retall per distància es deixa passar. Quan el nivell té una [malla de navegació](model-levels.md#navigation-meshes), una línia la nomena i diu si el lloc hi és (✓). Un nom de peça amb el prefix `≈` s'ha endevinat a partir de les caixes envolvents de les peces, perquè aquella part del nivell es va simplificar en carregar-lo.

La targeta es queda fins que es tanca (**×**, `Esc`), un altre clic respon una altra cosa, o un clic en un espai buit. Una creu cian es dibuixa al punt de l'escena i un anell per sobre a la pantalla. Els seus botons: **copia** (cada valor, i les coordenades com `x, y, z`), **Mira**, i **Situa't aquí** (en un punt de dades, mirant com mirava la fila quan té una direcció de mirada; en una superfície, a 1,7 m per sobre).

El nivell s'indexa per a la selecció en el primer clic que la necessiti: una graella de columnes sobre la seva petjada, construïda uns quants mil·lisegons cada vegada entre fotogrames perquè la vista mai s'aturi (uns dos segons de feina per a un nivell de diversos milions de triangles), i guardat fins que el nivell canvia. Fins llavors la targeta diu *Preparant el nivell per a la selecció* amb un percentatge, i respon el clic quan està llest. Una cerca de punt de dades sobre més de quatre milions de files dibuixades es reparteix entre fotogrames de la mateixa manera.

## Profunditat de camp {#depth-of-field}

Una secció plegable a Càmera i escena, amb el títol *Profunditat de camp - activada* mentre està activa. Desactivada per defecte: és un efecte de presentació, i la vista per defecte ha de mostrar les dades, no una interpretació d'elles.

| Control | Per defecte | Rang (maneta) | Significat |
|---|---|---|---|
| **Activada** | desactivada | | |
| **Enfoca el que s'ha enquadrat** | activat | | Enfoca a la distància que va usar l'últim enquadrament (*Enfocat a N m.*). |
| **Distància d'enfocament** | 1000 | 1-200.000, logarítmica (10.000.000) | Es mostra quan l'enfocament és manual. |
| **Obertura** | ±35% | ±2% a ±200%, logarítmica (±3200%) | La profunditat que es manté nítida, com a fracció de la distància d'enfocament - relativa en lloc d'un número f, perquè les escenes van d'una habitació a un mapa de vuit quilòmetres. |
| **Desenfocament màxim** | 12 px | 1-48 (256) | El radi de desenfocament més gran; el cost creix amb ell. |

Desenfoca el **nivell, la quadrícula i les caixes** - *no la calor*. La calor en un píxel és la suma de sprites a moltes profunditats, així que no té una única profunditat per estar desenfocada; desenfocar-la amb la geometria que hi ha darrere seria erroni on flota davant. Les dades nítides sobre el context suau també són més útils de les dues. El desenfocament és una recollida de 24 punts de l'angle daurat a la passada de composició, ponderada perquè un primer pla nítid no sigui emborronat cap enfora pel fons desenfocat que hi ha darrere. Canviar-lo redibuixa sense reiniciar l'acumulació de calor.

## Resolució del llenç {#canvas-resolution}

El llenç es dibuixa a la relació de píxels de la pantalla, limitada a 2. El búfer de calor pot dibuixar-se a una resolució més baixa que aquesta ([Resolució de la calor](performance-and-stats.md)).

## Pàgines d'aquesta secció {#pages-in-this-section}

- [Comandament i HOTAS](gamepad.md)
- [Referència de teclat i ratolí](keyboard-reference.md)
