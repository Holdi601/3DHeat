---
title: "Szoftveres renderelés felismerése"
parent: "Renderelés belső működése"
nav_order: 6
lang: "hu"
source: "software-rendering.md"
source_hash: "2ae9a1addecb"
translated: true
outdated: false
---

# Szoftveres renderelés felismerése

Ha a böngésződ a grafikus kártya helyett a főprocesszoron rajzol, a nézegető többszörösen lassabb. A nézegető ezt észreveszi, és egy piros dobozt mutat, amely megmondja, mit kell bekapcsolnod.

Ha egy böngészőben ki van kapcsolva a hardveres gyorsítás, vagy a meghajtóját tiltólistára tették, a WebGL-t és a WebGPU-t a processzoron rajzolja. Minden továbbra is működik, csak sokszor lassabban, és a tapasztalat ez: „ez a nézegető az én adataimmal használhatatlanul lassú” - egy tünet, amely az eszközre mutat, nem a böngésző egy kapcsolójára. Ezért a nézegető megnézi a renderelő nevét, és ezt szóvá teszi ([`gpuClass.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/gpuClass.ts)).

## A szalag {#the-banner}

Ha a renderelőt egyértelműen szoftverként azonosítottuk, egy piros doboz jelenik meg az oldalsáv tetején (a Hőtérkép és a Meccs fülön), a módsáv fölött:

![A piros szalag: Grafikus kártya nélkül fut](../assets/img/en/software-rendering-banner.webp)

> **Grafikus kártya nélkül fut.**
> Ez a böngésző a grafikus kártya helyett a processzoron rajzol, ami sokszor lassabb, és nagy adathalmazokkal nem boldogul. Kapcsold be a hardveres gyorsítást a böngésző beállításaiban (Chrome: Beállítások → Rendszer → „Grafikus gyorsítás használata, ha elérhető”, majd indítsd újra), és ellenőrizd, hogy a grafikus meghajtó naprakész-e.

## Fejlesztőknek {#for-developers}

### Hogyan dönt {#how-it-decides}

A renderelő karakterlánca - a WebGL2 `UNMASKED_RENDERER_WEBGL`-je, vagy a WebGPU adaptergyártója, architektúrája és eszköze - kisbetűssé van alakítva, és osztályozva:

- **szoftver**, ha tartalmazza a `swiftshader`, `llvmpipe`, `softpipe`, `swrast`, `microsoft basic render driver`, `apple software renderer` vagy `generic renderer` részt;
- **hardver**, ha tartalmaz egy ismert GPU-gyártót vagy -családot (`nvidia`, `geforce`, `rtx`, `quadro`, `amd`, `radeon`, `intel`, `arc`, `apple m`, `adreno`, `mali`, `powervr`, `xclipse`);
- **ismeretlen** egyébként.

Csak a *szoftver* váltja ki a szalagot. Egy fel nem ismert adapter egyáltalán nem mond semmit: ha egy működő GPU-val rendelkezőt a böngésző átállítására küldenénk, az rosszabb hiba, mint egy esetet elmulasztani.

### A rövid név {#the-short-name}

Ugyanez a modul rövidíti a renderelő karakterláncát a megjelenítéshez: egy ANGLE-karakterláncból, mint például `ANGLE (Vendor, Vendor Model (0x0000ABCD) Direct3D11 vs_5_0 ps_5_0, D3D11)`, megtartja az eszköz mezőjét, elhagyja a PCI-azonosítót és a végi API- és árnyalómodell-verziót, és `Vendor Model` alakot mutat. A rövid név az **Erőforráskeretek** alatt jelenik meg, a teljes karakterlánc a súgóbuborékjában; a memóriabecslés a teljes karakterláncot mutatja.
