---
title: "Línia de temps i reproducció"
nav_order: 5
lang: "ca"
source: "timeline.md"
source_hash: "62632bc74701"
translated: true
outdated: false
---

# Línia de temps i reproducció

La barra sota la imatge és com un reproductor de vídeo: pots reproduir les dades com una pel·lícula, aturar-les, saltar per elles i canviar la velocitat.

![La barra de la línia de temps: 1 Tot/Reprodueix, 2 botons de reproducció, 3 rellotge, 4 Velocitat, 5 Historial, amb Finestra i un Interval de 30 s](../assets/img/en/timeline-bar.webp)

La barra sota la vista és la línia de temps ([`Timeline.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/Timeline.tsx)). Decideix quines files són visibles en cada moment. Necessita una columna de temps; sense ella tota la barra queda desactivada, la vista es queda en **Tot**, i la barra lateral ho diu: *No hi ha cap columna de temps en aquestes dades: la línia de temps està desactivada i tots els punts de dades es mostren de cop.*

## Tot i Reprodueix {#all-and-play}

Dos modes de primer nivell, perquè responen preguntes diferents.

- **Tot** (el per defecte en cada càrrega) ignora del tot el capçal de reproducció i mostra cada fila que passa els filtres. És la vista «on passa això», i no és el mateix que arrossegar fins al final. El control de desplaçament queda desactivat i el rellotge marca `tot · <span> de dades`.
- **Reprodueix** executa les dades com un timelapse. Apareixen el control de desplaçament, la reproducció i la configuració de l'historial.

Triar **Tot** també atura la reproducció.

## Els controls {#the-controls}

| Control | Per defecte | Significat |
|---|---|---|
| Control de desplaçament | l'inici | El capçal de reproducció. Arrossega per buscar; 20.000 passos al llarg de l'interval. |
| **Tot** / **Reprodueix** | Tot | Vegeu més amunt. |
| ▶ / ❚❚ | en pausa | Reprodueix o pausa; també `K`. |
| ◀ **Reprodueix enrere (J)** | | Reprodueix les dades en sentit invers. Només es mostra en el mode **Figures superposades**; la mateixa tecla `J` també hi funciona (vegeu [Teclat](#keyboard)). |
| ⏮ | | Torna a l'inici de l'interval. |
| Rellotge | | `transcorregut / total` com a `mm:ss.s` (o `h:mm:ss`), i, quan la columna de temps és una marca de temps absoluta, l'hora del dia del capçal com a `HH:MM:SSZ` (UTC). |
| **Velocitat** | 1× | Segons de dades per segon real. El menú té 17 passos de 0,01× a 1800× (0,01, 0,02, 0,05, 0,1, 0,25, 0,5, 1, 2, 4, 8, 16, 32, 64, 128, 256, 600, 1800), més **Personalitzada…**: escriu qualsevol velocitat de 0,001× a 3600× (per exemple 0,3 o 12) i prem Intro; Esc manté la velocitat actual. L'última velocitat es recorda per a la següent visita (vegeu [Configuració desada](ref-settings-storage.md)). |
| **Historial** | Acumulat | Què compta com a visible al capçal: *Acumulat*, *Finestra* o *Temps de vida* (més avall). |
| **Interval** (Finestra; en mode Línies també Temps de vida) | 30 s | Llargada de la finestra que acaba al capçal; com a mínim 0,01 s. A [Calor de línia](line-heat.md#playback) és la llargada de la cua. |
| **Vida per defecte** (només Temps de vida, no en mode Línies) | 10 s | Quant de temps es queda visible una dada que no té cap mostra següent de la seva persona. |
| **Esvaïment** (només Temps de vida, no en mode Línies) | 0,4 | Fracció de la vida de cada dada dedicada a desaparèixer, 0-1. |
| **Bucle** | activat | Al final, torna a començar; desactivat, s'atura al final. |
| Costat dret | | El nom del conjunt de dades. |

L'**interval** és la durada temporal del conjunt de dades -o, a la [superposició de figures](box-replay.md) amb una sessió triada, la durada d'aquella sessió.

## Historial {#history}

En mode Reprodueix:

- **Acumulat** - tot des de l'inici de l'interval fins al capçal. La calor es va construint mentre es reprodueix.
- **Finestra** - una durada fixa d'historial que acaba al capçal (*Interval*).
- **Temps de vida** - cada dada viu fins a la **següent mostra de la mateixa persona** (dins de la mateixa sessió), així que exactament una posició per persona és vigent en cada instant. Una dada la persona de la qual no torna a aparèixer -una mort, una desconnexió, el final del registre- no té cap mostra següent, i viu la *Vida per defecte* en lloc de desaparèixer de cop o de durar per sempre. Les dades **es desvaneixen** durant l'última fracció *Esvaïment* de la seva vida en lloc de desaparèixer de cop: amb una mostra viva per persona, una dada que desapareix d'un fotograma a l'altre fa parpellejar tot el camp a la velocitat de mostreig. *Esvaïment* 0 restableix el tall brusc.

El temps de vida necessita una columna de persona a més de la de temps; sense ella, l'historial torna a Acumulat en carregar. A la [Calor de línia](line-heat.md#playback) l'historial fixa quant de temps es queda visible la cua d'un recorregut; a la [superposició de figures](box-replay.md) la *Vida per defecte* és el temps que es manté una persona sense més mostres.

## Comportament de la reproducció {#playback-behaviour}

Des del bucle de fotogrames ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

- El capçal avança per *temps de fotograma × velocitat*. El temps de fotograma es limita a 0,1 s, perquè canviar de pestanya no faci saltar el capçal.
- Prémer reproduir al final exacte de l'interval torna a començar des de l'inici, com fa un reproductor. En cada càrrega el capçal es deixa a l'inici, així que la primera pulsació de reproduir ja reprodueix.
- Al final de l'interval el capçal salta a l'inici (Bucle activat) o s'atura allà i la reproducció acaba (Bucle desactivat).
- El control de desplaçament llegeix el capçal del motor directament a cada fotograma; l'estat de l'aplicació s'actualitza en les cerques, els inicis, les aturades i els bucles.
- Triar una sessió al selector de sessions porta a l'inici d'aquella sessió.

## Per què la reproducció és fluida i barata {#why-playback-is-smooth-and-cheap}

Les files s'emmagatzemen ordenades pel temps, així que una finestra temporal són dues cerques binàries sobre la columna de temps: avançar el capçal mou dos enters i no toca cap fila, i el cost de la reproducció segueix el nombre de files de la finestra, no la mida del conjunt de dades.

Com es manté estable la calor mentre la finestra es mou depèn de l'historial ([Acumulació](accumulation.md)):

- **Acumulat** només creix, així que cada fotograma afegeix només les files que han aparegut des de l'anterior, amb pes complet. El camp es construeix de manera monòtona, i pausar no canvia res, perquè no queda res per arribar. (Tornar a estimar faria que cada fotograma il·luminés un subconjunt aleatori diferent i després el desvanís, cosa que es veu com ràfegues que s'encenen i desapareixen.)
- **Finestra** i **Temps de vida** canvien de veritat a cada fotograma i es tornen a estimar, barrejades com a mitjana mòbil exponencial (pes 0,34 per al fotograma nou), que no està esbiaixada en estat estacionari i és molt més tranquil que començar de nou.
- En mode Temps de vida, les files candidates són les de *capçal - màx(bretxa més llarga de les dades, Vida per defecte)* fins al capçal; després el shader descarta cada fila la vida de la qual ja s'ha acabat i aplica l'esvaïment.

Canviar entre Tot i Reprodueix, o canviar l'historial, reinicia l'acumulació.

## Teclat {#keyboard}

| Tecla | Efecte |
|---|---|
| `K` | Reprodueix / pausa |
| `J` | Reprodueix enrere; si es torna a prémer, pausa (només Figures superposades) |
| `L` | Reprodueix endavant; si es torna a prémer, pausa (només Figures superposades) |

`J` i `L` també canvien la línia de temps a **Reprodueix**. Les tecles s'ignoren mentre una caixa de text o un menú té el focus. A la pestanya Anàlisi de curses, `K` controla la repetició pròpia d'aquella pestanya.
