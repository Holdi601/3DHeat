---
title: "Detalls interns del renderitzat"
nav_order: 22
has_children: true
lang: "ca"
source: "rendering-internals.md"
source_hash: "4c9327ee5852"
translated: true
outdated: false
---

# Detalls interns del renderitzat

El visor dibuixa milions de punts com a taques lluents i els suma. Aquesta secció explica els trucs que ho mantenen ràpid, i què volen dir els números de la capa d'estadístiques. Llegeix-la si el visor va lent, o si vols treballar en el renderitzador.

```
dades -> finestra de temps -> filtres de GPU -> pla de mostreig -> splat -> acumular -> color -> pantalla
```

Per veure com va el teu ordinador, mira el fotograma d'estadístiques a dalt a la dreta de la vista: [Panell de rendiment i capa d'estadístiques](performance-and-stats.md). Les paraules noves (GPU, fila, sprite, mapa de calor) són al [glossari](glossary.md).

## El problema central {#the-core-problem}

Una suma de rampes radials superposades costa *N* × π*r*² fragments barrejats per fotograma. Amb 100 milions de sprites de 8 px de radi són 2 × 10¹⁰ fragments: aproximadament un segon de feina en una GPU d'alta gamma. No es pot forçar cada fotograma, així que el visor combina:

- **files ordenades per temps**: una finestra de línia de temps són dues cerques binàries, i el cost de la reproducció segueix les files de la finestra, no el conjunt de dades;
- **cap feina per fila a la CPU a cada fotograma**: les files viuen a la memòria de la GPU, quantitzades; els filtres, els signes de grup, la prova de vida, la finestra, el retall i la secció s'avaluen al shader de vèrtexs;
- **mostreig estratificat** amb pesos compensadors quan un fotograma no pot dibuixar totes les files, i **acumulació progressiva** que convergeix cap a la resposta exacta de totes les files mentre la vista es manté ([Mostreig i pressupostos](sampling-and-budgets.md), [Acumulació](accumulation.md));
- **un accelerador de dues etapes** que canvia sprites per fotograma, i després resolució de calor, per taxa de fotogrames ([Mostreig i pressupostos](sampling-and-budgets.md#the-adaptive-budget));
- **pressupostos de memòria aplicats**, de manera que un conjunt de dades que no hi cap es talla de forma visible en lloc de fer caure l'aplicació ([Permanència de memòria de la GPU](gpu-memory.md)).

## Un fotograma {#one-frame}

El bucle de fotogrames és [`Engine.frame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts). Tot el que canvia a la taxa de fotogrames (càmera, capçal de reproducció, pressupost) viu al motor, no a l'estat de l'aplicació, de manera que un fotograma no costa cap feina de React; l'estat es llegeix una vegada per fotograma i només s'escriu de nou per als indicadors de baixa freqüència.

1. **Dades noves?** Un conjunt de dades nou s'anuncia (*Pujant N files a la GPU*) en un fotograma i es puja en el següent, de manera que el missatge es pinta abans que la feina bloquegi el fil. Un nivell nou es lliura al renderitzador; es creen o s'alliberen les rutes de calor de línia.
2. **El capçal de reproducció** avança (limitat a 0,1 s de temps real per fotograma), fa bucle o s'atura.
3. **La càmera** llegeix el teclat, el ratolí i el comandament; el mirall d'eixos es planxa dins la matriu de vista; a WebGPU, una matriu de remapatge de profunditat converteix el rang de profunditat d'estil OpenGL de three.js en el de WebGPU.
4. **Què és visible**: el rang de temps de la línia de temps i l'historial; la taula de signes de grup (visibilitat només amb una divisió per una columna); fins a quatre filtres: els filtres de columna i la selecció d'Entitats; la divisió per diferència.
5. **Les taules de color i de corba** es tornen a construir si han canviat els seus ajustos.
6. **Pressupost**: el controlador adaptatiu fixa el pressupost de sprites i la resolució de calor d'aquest fotograma; amb *Dibuixa totes les files a cada fotograma* el pressupost puja per cobrir totes les files candidates.
7. **Signatures** decideixen què significa encara el buffer d'acumulació: un canvi en qualsevol cosa que alteri quines files contribueixen o com (*geometria*), a la finestra de temps, o només a com es acoloreix el resultat (*composició*). Vegeu [Acumulació](accumulation.md#what-restarts-it).
8. **Pla de mostreig**: quins blocs de files dibuixar ([Mostreig i pressupostos](sampling-and-budgets.md)).
9. **Mode d'acumulació**: reinicia, estén, mitjana mòbil, mitjana corrent o inactiu.
10. **Geometria de la repetició de caixes** (cubs, traces) a la CPU, només en aquest mode i només quan no és inactiu.
11. **Renderitzat**: el backend dibuixa l'escena (nivell, quadrícula, eixos, caixes, traces, regle), fa splat de la calor al seu objectiu i la fon a l'acumulador, i compon la calor sobre l'escena cap al canvas.
12. **L'auto-exposició** s'activa quan el seu compte enrere arriba a zero; la sonda de calor del regle llegeix com a màxim un píxel cada 120 ms; els indicadors es publiquen.

Un fotograma inactiu —convergit, sense canvis— salta l'escena i el splat però encara **recompon**: un canvas de WebGL creat sense `preserveDrawingBuffer` té continguts indefinits després de compondre, així que confiar que mantingui l'últim fotograma no és segur. L'escena i els objectius de calor són els framebuffers propis del visor i sí que es conserven, així que un fotograma inactiu costa una sola passada a pantalla completa.

## Pàgines d'aquesta secció {#pages-in-this-section}

- [Els dos backends](backends.md): WebGPU i WebGL2, com se n'escull un, interruptors d'adreça
- [Acumulació](accumulation.md): reinicia, estén, mitjana mòbil, mitjana corrent
- [Mostreig i pressupostos](sampling-and-budgets.md): el mostrejador estratificat, el mode exacte, el pressupost adaptatiu
- [Acumulació de coma flotant de 16 bits](half-float-accumulation.md): rang i precisió als objectius de 16 bits
- [Permanència de memòria de la GPU](gpu-memory.md): emmagatzematge de files quantitzat i el pressupost de GPU aplicat
- [Detecció de renderitzat per programari](software-rendering.md)
- [Panell de rendiment i capa d'estadístiques](performance-and-stats.md)
