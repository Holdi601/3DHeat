---
title: "Imatges de mapa"
parent: "Nivells i geometria de fons"
nav_order: 1
lang: "ca"
source: "map-images.md"
source_hash: "d56614ef6bd1"
translated: true
outdated: false
---

# Imatges de mapa

Una imatge de mapa és una imatge plana - un minimapa, una foto de satèl·lit, un plànol - estesa sota les teves dades perquè vegis on és la calor. Li indiques al visor on ha d'anar la imatge fixant dos punts d'ella a dos llocs del món (les "àncores").

## Carregar i col·locar una imatge de mapa {#load-and-place-a-map-image}

1. Carrega primer les teves dades ([Com entren les dades](getting-data-in.md)).
2. A **Fons / nivell**, prem **Imatge de mapa…** i tria la imatge. S'estén sobre l'àrea de les dades.
3. Prem **Ajusta als límits de les dades** si la imatge s'ha mogut. L'àncora 1 va a la cantonada superior esquerra de la imatge, l'àncora 2 a la cantonada inferior dreta, a les vores de les dades.
4. Si la calor no encaixa amb la imatge, tria dos punts de referència molt separats (per exemple dues cantonades oposades d'un edifici o dos encreuaments). Llegeix el píxel de cadascun a la imatge i la seva posició al món (passa el punter amb la [regla](measure.md) per llegir la **X** i la **Z**).
5. Escriu-los a **Col·locació**: per a l'**Àncora 1** el **px** i el **py** del punt de referència, la **X del món** i la **Z del món**; el mateix per a l'**Àncora 2**.
6. Comprova-ho: una traça o un punt calent que saps que és sobre una carretera ara hauria d'estar sobre aquesta carretera. Ajusta els números fins que ho estigui.

![La secció Col·locació amb dues àncores i calor dibuixada sobre una imatge de mapa](../assets/img/en/map-images-placement.webp)

Els dos punts de referència han de diferir tant en columnes com en files de píxels, o el panell diu *Les dues àncores comparteixen una fila o columna de píxels*.

## Càrrega {#loading}

Qualsevol format d'imatge que el navegador pugui descodificar. Una imatge amb el costat més llarg per sobre de **8192 px** es redueix a 8192 (la vora més gran que se li demana a la GPU que mantingui), i el panell diu *Reduïda de W×H a w×h*.

En carregar-la, la imatge s'estén sobre els límits X-Z del conjunt de dades (o ±1000 unitats sense conjunt de dades), amb el nord amunt, a la Y més baixa de les dades. Els valors per defecte són **Opacitat** 100%, **Brillantor** 0,7, **Dessaturació** 100%, **Inverteix nord/sud** activat: desaturada i atenuada, perquè la feina del fons és ajudar-te a localitzar un punt calent, no competir amb ell.

## Controls {#controls}

| Control | Per defecte | Rang | Significat |
|---|---|---|---|
| **Opacitat** | 100% | 0-100% | |
| **Brillantor** | 0,7 | 0-2 (roda 64) | |
| **Dessaturació** | 100% | 0-100% | Fons gris, calor saturada. El color del mapa competeix amb el color de les dades. |
| **Inverteix nord/sud** | activat | | Quina fila de la imatge és la Z màxima del món. Si el commutes amb un conjunt de dades carregat, també torna a ajustar les àncores als límits de les dades. |
| **Col·locació**: Àncora 1, Àncora 2 | les cantonades de la imatge sobre els límits de les dades | | Cada àncora és un píxel de la imatge - **px** (des de l'esquerra, de 0 a l'amplada) i **py** (des de dalt, de 0 a l'alçada) - i la coordenada del món on es col·loca, **X del món** i **Z del món**. L'escala i el desplaçament surten de la parella. |
| **Ajusta als límits de les dades** | | | Posa l'àncora 1 a la cantonada superior esquerra de la imatge i l'àncora 2 a la cantonada inferior dreta, als límits X-Z de les dades. És un punt de partida per a una col·locació exacta. Necessita un conjunt de dades. |
| **Elevació** | la Y més baixa de les dades | mín. Y de les dades - 500 fins a màx. Y + 500 (roda màx. Y + 100.000) | Altura del pla del mapa. Posa-la just sota les dades perquè res no quedi amagat per ell. |

La línia del nom mostra `amplada×alçada px · x × z m/px`, la mida al món d'un píxel en cada eix.

## A l'escena {#in-the-scene}

La imatge és un sol quad amb textura a l'elevació. Amb opacitat completa escriu profunditat, de manera que participa en l'[oclusió](depth-and-culling.md) com a terra; amb una opacitat inferior al 100% es barreja i no escriu profunditat, així que no oclou res. La [regla](measure.md) mesura sobre el seu pla. La [biblioteca de nivells](level-library.md) guarda un nivell d'imatge amb les seves àncores.

## Mapa de Dota 2 {#dota-2-map}

**Mapa de Dota 2**, al costat de **Imatge de mapa…**, descarrega el dibuix del mapa actual de Dota 2 que [OpenDota](https://www.opendota.com) mostra a les seves pàgines de partida, i el col·loca sota les taules que el [Watcher](https://github.com/Holdi601/3DHeat-Watcher) escriu a partir de les repeticions de Dota 2 ([`dotaMap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/tactics/dotaMap.ts)). La imatge es descarrega de opendota.com quan es prem el botó i no forma part de 3DHeat; el dibuix del pedaç més nou es pren de la llista pròpia d'OpenDota, i el dibuix del 7.40 quan la llista no es pot llegir.

| | |
|---|---|
| Font | `opendota.com/assets/images/dota2/map/detailed_<patch>.webp`, 900×900 px |
| Col·locació | La calibració d'OpenDota: la imatge abasta de les unitats del món de Dota -8192 a 8064 en els dos eixos (cel·les de 128 unitats de 64 a 191), nord a dalt. Amb els eixos de la taula de repetició (Z amunt, Y girada) això és X del món de -8192 a 8064 i Z del món de -8064 a 8192. Unes 18 unitats per píxel. |
| Elevació | 0. Els herois estan a 0 fins a uns 600. |
| Aspecte | Brillantor 0,8, dessaturació 50%. |

Comprovat amb la repetició d'una partida pública del pedaç 7.40: el rastre de cada heroi segueix els carrils dibuixats, i les torres, els quarters i els ancians que la repetició situa cauen sobre les bases dibuixades. La vista **Superior** mostra el mapa amb el nord a la part inferior de la pantalla, com fa amb qualsevol taula Z amunt amb la Y girada.

El dibuix és d'OpenDota, del mapa de Valve; Valve no avala 3DHeat. Un mapa 3D de Dota necessita el joc instal·lat: mira les notes del Watcher sobre les repeticions de Dota 2.

## Per a desenvolupadors {#for-developers}

### Com les àncores col·loquen la imatge {#how-the-anchors-place-the-image}

De [`mapQuadFromAnchors`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts), amb les àncores *a* i *b*:

```
scaleX = (b.worldX - a.worldX) / (b.px - a.px)
scaleZ = (b.worldZ - a.worldZ) / (b.py - a.py)
pixel (0, 0) sits at  (a.worldX - a.px × scaleX,  a.worldZ - a.py × scaleZ)
```

Dues àncores fixen l'escala i el desplaçament en cada eix per separat, de manera que un mapa es pot estirar de manera diferent en X i en Z, però no girar. Les àncores han de diferir en **les dues** coordenades de píxel; quan comparteixen una fila o una columna no es pot derivar cap escala, el mapa no es dibuixa, i el panell diu *Les dues àncores comparteixen una fila o columna de píxels*.
