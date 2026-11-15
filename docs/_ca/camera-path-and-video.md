---
title: "Trajectòria de càmera i vídeo"
nav_order: 15
lang: "ca"
source: "camera-path-and-video.md"
source_hash: "1863f90ba4b7"
translated: true
outdated: false
---

# Recorregut de càmera i vídeo

Fes una pel·lícula de les teves dades: col·loques la càmera en uns quants llocs i el visor vola entre ells i desa un vídeo. Cada fotograma és molt net, sense gra. La càmera i el capçal de reproducció es mouen junts, així que el mateix panell fa un timelapse ([`PathPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/PathPanel.tsx), [`campath.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/campath.ts), [`record.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/record.ts)).

## Fer un vol travessat {#make-a-flythrough}

1. Vola fins on comenci la pel·lícula i prem **Afegeix un fotograma clau aquí** a **Recorregut de càmera i renderització**.
2. Vola fins al següent punt i torna a prémer-lo. Repeteix-ho per a cada parada.
3. Marca **Previsualitza al llarg del recorregut** i arrossega **Posició al llarg del recorregut** per comprovar el moviment.
4. Ajusta la **Durada** (quant dura el vídeo). Un moviment que està bé però massa ràpid només necessita una durada més llarga.
5. Prem **Renderitza el vídeo**. Espera la línia de progrés; el fitxer es descarrega quan acaba.

![El panell Recorregut de càmera i renderització amb tres fotogrames clau, interpolació Suau, 12 s, 30 fps i 16 Mbps](../assets/img/en/camera-path-panel.webp)

## Fotogrames clau {#keyframes}

| Control | Efecte |
|---|---|
| **Afegeix un fotograma clau aquí** | Afegeix la posició actual de la càmera, la guinyada, el capcineig i el camp de visió com a fotograma clau. |
| **Esborra** | Elimina tots els fotogrames clau. |
| Llista de fotogrames clau | Una fila per clau: el seu número (fes clic per volar la càmera allà, amb el camp de visió inclòs), la posició, `guinyada° / capcineig°`, i **×** per eliminar-la. |

Les claus se separen **uniformement** al llarg d'un eix de recorregut normalitzat de 0 a 1 cada vegada que se n'afegeix o treu una; la durada de sortida estira després tot el moviment, així que una presa que és correcta però massa ràpida només necessita una durada més llarga. La guinyada es desenrotlla entre claus perquè la càmera giri pel camí curt.

Sense fotogrames clau, una renderització manté la càmera actual quieta durant tot el clip - un timelapse perfectament vàlid.

## Configuració del recorregut {#path-settings}

| Control | Per defecte | Rang (roda) | Significat |
|---|---|---|---|
| **Interpolació** (2 o més claus) | *Suau* | *Suau* / *Recta* | *Suau*: una corba cúbica de Hermite que passa per les claus, amb tangents de les claus veïnes, de manera que la velocitat coincideix a cada clau i no hi ha cap sacsejada on es troben els segments. *Recta*: línies rectes entre claus, previsibles, amb una cantonada visible a cada clau. El camp de visió sempre s'interpola linealment. |
| Línia de recorregut (2 o més claus) | | | `N unitats de recorregut - M per segon amb aquesta durada`, o una nota que diu que totes les claus són en un mateix lloc. |
| **Previsualitza al llarg del recorregut** (1 o més claus) | apagat | | Mou la càmera de la vista des del recorregut, i mou el capçal de reproducció amb ella com ho fa la renderització, perquè el moviment es pugui jutjar abans de renderitzar. |
| **Posició al llarg del recorregut** (mentre es previsualitza) | 0% | 0-100% | On del recorregut es previsualitza. |
| **Durada** | 12 s | 1-120 s (3600) | Durada del vídeo. |
| **Fotogrames per segon** | 30 fps | 6-60 (240) | |
| **Taxa de bits** | 16 Mbps | 1-60 Mbps, logarítmic (400) | Els gradients de calor es bandegen malament amb taxes de bits baixes: hi ha poc detall darrere del qual el còdec pugui amagar l'error. |
| **Límit d'espera de convergència** | 240 fotogrames | 2-600 (10.000) | El temps màxim que un fotograma de sortida pot esperar per ser exacte. Els fotogrames que arriben al límit s'escriuen igualment, i es compten. |
| Resum | | | `N fotogrames · finestra: acumulada/fixa/temps de vida`, i quan la línia de temps és en mode Tot: *(la renderització passa de Tot a Reprodueix perquè el capçal de reproducció tingui sentit)*. |
| **Renderitza el vídeo** / **Cancel·la** | | | Inicia la renderització; mentre s'executa, mostra `fotograma i / n · esperat w · X MB` i quants fotogrames no han estat exactes. Necessita un conjunt de dades. |

## Consells {#tips}

- La mida de sortida és la mida del llenç en píxels del dispositiu (la relació de píxels de la pantalla, limitada a 2). Canvia la mida de la finestra del navegador per modificar-la.
- Un historial acumulat va construint la calor durant el clip; un historial de finestra o de temps de vida mostra una franja de temps que es mou.
- Les posicions dels fotogrames clau són coordenades de pantalla: amb un [eix del món invertit](camera.md#invert-world-axis), les claus fetes abans de canviar-lo apunten a un altre lloc després.

## Per a desenvolupadors {#for-developers}

### Què fa una renderització {#what-a-render-does}

1. Fa una captura de prova del fotograma per conèixer la mida exacta de sortida en píxels del dispositiu.
2. Tria un còdec a través de WebCodecs: **VP9** (`vp09.00.10.08`), si no **VP8**, a la taxa de bits i als fotogrames per segon escollits. Sense `VideoEncoder` s'atura amb *Aquest navegador no té VideoEncoder - cal WebCodecs per escriure un vídeo*; sense cap dels dos còdecs, *No hi ha cap còdec de vídeo compatible (s'han provat VP9, VP8)*.
3. Pren el control dels ajustos que necessita una renderització: pausa la reproducció, desactiva el **pressupost adaptatiu**, activa el **refinament progressiu** i posa el pressupost de sprites a 64M per fotograma (el pressupost adaptatiu protegeix la taxa de fotogrames, que és l'objectiu equivocat aquí: interpretaria cada fotograma lent que convergeix com una raó per esclafar menys files, cosa que fa falta més fotogrames per convergir), i canvia la línia de temps de **Tot** a **Reprodueix**. L'ajust d'historial (acumulat, finestra, temps de vida) es deixa com està: una renderització ha de ser el que estaves mirant, reproduït i escrit.
4. Per a cada fotograma de sortida *f* de *n*, amb *u* = f / (n - 1):
   - posa la càmera a la pose del recorregut a *u* (si hi ha claus);
   - situa el capçal de reproducció a la mateixa fracció *u* de l'interval de la línia de temps (l'extensió de la sessió seleccionada a la repetició de caixes);
   - força una estimació nova, fins i tot quan la càmera no s'ha mogut - heretar l'acumulació del fotograma anterior deixaria un fantasma de la finestra anterior;
   - espera, fotograma a fotograma, fins que la imatge sigui exacta (totes les files candidates dibuixades en un fotograma, o l'acumulació completa), fins al límit d'espera;
   - captura el fotograma compost i el codifica, amb un fotograma clau cada 2 segons de sortida perquè el fitxer es pugui buscar.
5. Empaqueta els fotogrames en un fitxer WebM ([`webm.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webm.ts)) amb marques de temps triades a partir de la taxa de fotogrames - el temps de rellotge que triga cada fotograma no importa.
6. Restaura el pressupost, el camp de visió, el mode de la línia de temps, el capçal de reproducció i si estava en reproducció.
7. Descarrega el vídeo com `3dheat-<amplada>x<alçada>-<fotogrames>f.webm` i informa de `N fotogrames a W×H, X MB - tots els fotogrames exactes`, o de quants han arribat al límit d'espera.

**Cancel·la** atura-ho després del fotograma actual (*Renderització cancel·lada.*) i restaura els ajustos.
