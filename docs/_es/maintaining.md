---
title: "Mantenimiento de la documentación"
nav_order: 23
lang: "es"
source: "maintaining.md"
source_hash: "4a4fb46273e5"
translated: true
outdated: false
---

# Mantenimiento de la documentación

Esta página es para quien cuida del visor y de este sitio. Enumera los pasos para mantener correctas las páginas, las imágenes y las traducciones después de un cambio.

Este sitio se revisa de nuevo con **cada versión** y siempre que algo cambia mucho: atajos de teclado, el recorrido por la interfaz, los ajustes, los formatos de archivo. La lista de comprobación:

1. **Regenerar las páginas de referencia**: `node tools/docs-refs.mjs` (y `--lang <lang>` para cada idioma). `node tools/docs-refs.mjs --check` falla cuando una página está desfasada.
2. **Regenerar las capturas** a partir de los [datos de demostración](demo-data.md). Use un equipo o contenedor con la región en-US, para que los números se lean `0.35` y no `0,35` (las casillas de número siguen la región del navegador hasta que se cambia). Cree los datos de demostración con `node tools/demo-data.mjs`, arranque un servidor de desarrollo en el puerto 5321 **sin** paquete local de figuras, `HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1`, y después ejecute `node tools/docs-shots.mjs --lang <lang>`. Mire cada imagen: solo nombres de demostración (*Demo Valley*, *Blue 1*, *Red 3* ...), ningún mapa real, jugador ni grabación.
3. **Listar lo que cambió** desde la última etiqueta de versión: `git log --oneline <última etiqueta>..HEAD`, y la sección **Docs** de `CHANGELOG.md`, que asocia cada función con su página. Cada función nueva necesita una página o una sección, con una imagen donde se vea en pantalla.
4. **Revisión independiente** de las páginas en inglés por alguien que no las escribió, para tres lectores: un principiante, un niño de ocho años, un experto. ¿Están completos los pasos y en el orden correcto, las palabras son las de la interfaz, las imágenes están al día, las etiquetas de los diagramas son correctas?
5. **Corregir lo que encontró la revisión.**
6. **Volver a traducir las páginas cambiadas** por su hash de origen, y después hacer la revisión por idioma. Véase `tools/docs-translate.md`.
7. **Buscar términos confidenciales** en los archivos cambiados, y comprobar que ninguna imagen muestra algo que no sean datos de demostración.
8. **Publicar** solo cuando la versión esté aprobada.

La misma comprobación cubre los sitios de documentación de los repositorios relacionados (véase la página de [Inicio](index.md#related-repositories)).

## Las herramientas de exporters/ {#the-tools-under-exporters}

Las herramientas alrededor del visor son proyectos públicos separados, cada uno con su propia licencia MIT, sus versiones, su wiki y su comprobación de actualizaciones, fijados en este repositorio como submódulos de git:

| Carpeta | Repositorio |
|---|---|
| `exporters/gamefiles/` | [3DHeat-GameFiles](https://github.com/Holdi601/3DHeat-GameFiles): recorridos y niveles sacados de los archivos propios de los juegos |
| `exporters/gamecapture/` | [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture): grabadores de telemetría de vueltas; niveles a partir de vídeo de partidas |
| `exporters/unreal/` | [3DHeat-UnrealExporter](https://github.com/Holdi601/3DHeat-UnrealExporter): complemento del Editor de Unreal |
| `exporters/cs2/` | [3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2): demos y mapas de CS2 |
| `exporters/watcher/` | [3DHeat-Watcher](https://github.com/Holdi601/3DHeat-Watcher): graba las partidas en segundo plano |

**Fijado** significa que este repositorio registra un commit exacto de cada herramienta. Una copia del visor recibe esos commits:

```bash
git clone --recursive https://github.com/Holdi601/3DHeat
# o, después de un clon normal:
git submodule update --init
```

Las dos rutas de actualización anteriores ejecutan `git submodule update --init` tras descargar los cambios, así que las herramientas siguen al visor hasta los commits que fija su versión más nueva, no a los commits más nuevos de las propias herramientas. La versión más nueva de una herramienta llega al visor cuando se mueve el fijado aquí: los cambios en una herramienta se confirman y se suben primero en su propia carpeta (su propio repositorio), y después se confirma aquí el nuevo fijado. Cada herramienta también comprueba sus propias versiones nuevas; eso se documenta en su propio repositorio.
