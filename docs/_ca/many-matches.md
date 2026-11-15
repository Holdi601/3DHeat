---
title: "Moltes partides alhora"
parent: "Repetició"
nav_order: 2
lang: "ca"
source: "many-matches.md"
source_hash: "a37a7b4cf8c2"
translated: true
outdated: false
---

# Moltes partides alhora

**Moltes partides alhora** reprodueix moltes partides una sobre l'altra, de manera que veus on solen anar els jugadors de cada partida. Usa-la per comparar centenars o milers de partides en una sola imatge.

Cada partida comença al seu propi inici i les seves unitats es mouen com a figures. Els fitxers van directament a la targeta gràfica i no es construeix cap taula completa, de manera que es reprodueix fluidament allà on una càrrega normal es quedaria sense memòria.

![Deu partides de tancs superposades, un color per partida](../assets/img/ca/many-matches.webp)

## Com usar-la {#how-to-use-it}

1. Obre **Moltes partides alhora** a la barra lateral del Mapa de calor.
2. Prem **Fitxers…** (tria molts fitxers), **Carpeta…** (una carpeta i les seves subcarpetes) o **Afegeix carpeta…** (afegeix-ho al que ja està carregat).
3. El visor canvia a la superposició de figures i comença des de l'inici. Prem **Reprodueix**.

Cada fitxer és una partida (o en conté diverses). Funcionen els fitxers Parquet i els contenidors [`.3dheat`](container.md). Un fitxer necessita una columna de posició, una de temps i una d'unitat; les columnes de nom, tipus i bàndol es conserven. Els altres fitxers, i els fitxers auxiliars dels convertidors (vol, missatges, esdeveniments, xat, objectius), s'ometen. Per a una taula normal, vegeu [Carregar dades](getting-data-in.md).

## Ajustos {#settings}

| Ajust | Què fa |
|---|---|
| **Per equip** / **Per partida** | Colora per bàndol, o un color per partida. |
| **Marca on van morir les unitats** | Una marca on va morir cada unitat, durant 10 s, 30 s, 120 s, o totes les d'ara ençà. |

El panell mostra quantes partides, unitats, files i posicions s'han llegit, la memòria usada i el temps de càrrega. *Espai per a* és quantes posicions més podria admetre encara la targeta gràfica. *Figures des de* és la mida a la pantalla per sota de la qual una unitat es dibuixa com una petita fletxa en lloc de la seva figura.

L'aspecte de les figures usa els mateixos controls que la [repetició de partida](match-replay.md#figures): **Mida de les figures**, **Figura més petita a la pantalla** i **A distància**.

## Consells {#tips}

- Quan tot no cabria a la memòria, les posicions s'aprimen (només es guarda una posició cada pocs metres) i el panell ho diu.
- Els modes de calor també funcionen amb les dades de la superposició.
- Per a estadístiques sobre milers de partides sense dibuixar-les, vegeu [Anàlisi massiva](mass-analysis.md).
