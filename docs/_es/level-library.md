---
title: "Biblioteca de niveles"
parent: "Niveles y geometría de fondo"
nav_order: 4
lang: "es"
source: "level-library.md"
source_hash: "23ff3290af7e"
translated: true
outdated: false
---

# Biblioteca de niveles

La biblioteca guarda sus niveles en este navegador para que no tenga que cargarlos y simplificarlos otra vez. **Borrar los datos del sitio en el navegador elimina la biblioteca, y no hay exportación.** Guarde sus archivos originales.

Procesar un nivel —leerlo, clasificarlo, soldarlo, reducirlo y empaquetar las texturas— es lento, y el resultado es siempre el mismo. La **Biblioteca**, al pie del panel Fondo / nivel, guarda los niveles procesados en este navegador, así que una malla reducida nunca se reconstruye dos veces ([`levelLibrary.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/levelLibrary.ts)).

## Guardar y volver a cargar un nivel {#save-and-reload-a-level}

1. Cargue una imagen de mapa o un modelo 3D y compruebe que se ve bien.
2. Pulse **Guardar en la biblioteca**. El panel dice *Guardado. Se cargará al instante la próxima vez.*
3. La próxima vez, abra la lista de **Biblioteca** y pulse ▸ en el nivel.
4. Pulse ✕ para eliminar una entrada que ya no necesite.

## Uso {#using-it}

| Control | Efecto |
|---|---|
| **Guardar en la biblioteca** | Guarda el nivel actual. Una imagen de mapa se guarda como PNG con sus dos anclas; un modelo, como sus búferes procesados. El panel dice *Guardado. Se cargará al instante la próxima vez.* |
| Lista de la biblioteca | Una fila por nivel guardado: nombre (con su tamaño guardado al pasar el ratón), triángulos para un modelo o anchura en píxeles para una imagen. |
| ▸ (*Cargar*) | Carga la entrada como nivel actual. |
| ✕ (*Eliminar*) | Quita la entrada. |
| Línea de uso | `Uso: X de Y.`: la estimación de almacenamiento del navegador para este sitio. |

Si no hay nada guardado, la lista dice *Vacía. Cargue un mapa o un modelo y después «Guardar en la biblioteca».*

## Qué se guarda {#what-is-stored}

| Tipo | Se guarda | No se guarda |
|---|---|---|
| Imagen de mapa | La imagen (PNG), su tamaño, sus anclas | Elevación, volteo, opacidad, brillo, desaturación: vuelven a los valores por defecto (elevación = la Y más baja del conjunto de datos actual, volteo activado) |
| Nivel 3D | Vértices, colores de vértice, coordenadas de textura, sus mosaicos y el atlas de texturas, triángulos de suelo / estructura / agua, bordes de estructuras, número de triángulos | Nombres de las partes y motivos de clasificación, y todos los ajustes de apariencia: vuelven a los valores por defecto de una importación nueva |

Un modelo cargado desde la biblioteca no tiene lista de partes, y sus límites y su franja de altura del suelo se recalculan a partir de sus vértices.

## Dónde vive {#where-it-lives}

En el IndexedDB del navegador, base de datos `3dheat`, almacén de objetos `levels`, para el origen de la página (la dirección que aparece en la barra de direcciones del navegador). Es local a ese perfil del navegador: otro navegador, otro perfil u otra dirección (por ejemplo `localhost` en lugar de `127.0.0.1`) ve una biblioteca distinta, vacía. Borrar los datos del sitio en el navegador la elimina. Las entradas guardadas por versiones anteriores, sin estructuras, colores ni agua, siguen cargándose.
