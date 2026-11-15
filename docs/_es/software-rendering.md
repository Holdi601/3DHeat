---
title: "Detección de renderizado por software"
parent: "Detalles del renderizado"
nav_order: 6
lang: "es"
source: "software-rendering.md"
source_hash: "2ae9a1addecb"
translated: true
outdated: false
---

# Detección de renderizado por software

Si su navegador dibuja con el procesador principal en lugar de con la tarjeta gráfica, el visor va muchas veces más lento. El visor lo detecta y muestra un recuadro rojo que le dice qué activar.

Cuando un navegador tiene la aceleración por hardware desactivada, o su controlador está en la lista negra, dibuja WebGL y WebGPU en la CPU. Todo sigue funcionando, muchas veces más lento, y la experiencia es «este visor es inutilizable con mis datos», un síntoma que apunta a la herramienta y no a un interruptor del navegador. Por eso el visor mira el nombre del renderizador y lo dice ([`gpuClass.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/gpuClass.ts)).

## El aviso {#the-banner}

Cuando el renderizador se identifica con seguridad como software, aparece un recuadro rojo arriba de la barra lateral (pestañas Mapa de calor y Partida), encima de la barra de modos:

![El aviso rojo: funcionando sin la tarjeta gráfica](../assets/img/en/software-rendering-banner.webp)

> **Funcionando sin la tarjeta gráfica.**
> Este navegador dibuja con la CPU en lugar de la tarjeta gráfica, lo que es muchas veces más lento y no podrá con conjuntos de datos grandes. Active la aceleración por hardware en la configuración del navegador (Chrome: Configuración → Sistema → «Usar aceleración de gráficos cuando esté disponible», y reinicie), y compruebe que el controlador gráfico esté actualizado.

## Para desarrolladores {#for-developers}

### Cómo decide {#how-it-decides}

La cadena del renderizador (`UNMASKED_RENDERER_WEBGL` de WebGL2, o el fabricante, la arquitectura y el dispositivo del adaptador de WebGPU) se pasa a minúsculas y se clasifica:

- **software** cuando contiene `swiftshader`, `llvmpipe`, `softpipe`, `swrast`, `microsoft basic render driver`, `apple software renderer` o `generic renderer`;
- **hardware** cuando contiene un fabricante o familia de GPU conocidos (`nvidia`, `geforce`, `rtx`, `quadro`, `amd`, `radeon`, `intel`, `arc`, `apple m`, `adreno`, `mali`, `powervr`, `xclipse`);
- **desconocido** en otro caso.

Solo *software* activa el aviso. Un adaptador no reconocido no dice nada: enviar a alguien con una GPU que funciona a reconfigurar su navegador es un fallo peor que no detectar un caso.

### El nombre corto {#the-short-name}

El mismo módulo acorta la cadena del renderizador para mostrarla: de una cadena ANGLE como `ANGLE (Vendor, Vendor Model (0x0000ABCD) Direct3D11 vs_5_0 ps_5_0, D3D11)` conserva el campo del dispositivo, quita el id PCI y la API final con el modelo de shader, y muestra `Vendor Model`. El nombre corto aparece en **Presupuestos de recursos**, con la cadena completa como información al pasar el ratón; la estimación de memoria muestra la cadena completa.
