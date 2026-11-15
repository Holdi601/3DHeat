---
title: "Biblioteca de nivells"
parent: "Nivells i geometria de fons"
nav_order: 4
lang: "ca"
source: "level-library.md"
source_hash: "23ff3290af7e"
translated: true
outdated: false
---

# Biblioteca de nivells

La biblioteca guarda els teus nivells en aquest navegador perquè no hagis de tornar a carregar-los i simplificar-los. **Esborrar les dades del lloc al navegador elimina la biblioteca, i no hi ha cap exportació.** Guarda els teus fitxers originals.

Processar un nivell —analitzar, classificar, soldar, decimar, empaquetar textures— és lent, i el resultat és sempre el mateix. La **Biblioteca** al final del panell Fons / nivell guarda els nivells processats en aquest navegador, de manera que una malla decimada mai no es reconstrueix dues vegades ([`levelLibrary.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/levelLibrary.ts)).

## Desar i recarregar un nivell {#save-and-reload-a-level}

1. Carrega una imatge de mapa o un model 3D i comprova que es veu bé.
2. Prem **Desa a la biblioteca**. El panell diu *Desat. Es carregarà a l'instant la pròxima vegada.*
3. La pròxima vegada, obre la llista **Biblioteca** i prem ▸ al nivell.
4. Prem ✕ per esborrar una entrada que ja no necessites.

## Com s'usa {#using-it}

| Control | Efecte |
|---|---|
| **Desa a la biblioteca** | Guarda el nivell actual. Una imatge de mapa es guarda com a PNG amb els seus dos ancoratges; un model, com als seus buffers processats. El panell diu *Desat. Es carregarà a l'instant la pròxima vegada.* |
| Llista de la biblioteca | Una fila per nivell guardat: nom (amb la seva mida guardada en passar el ratolí), triangles per a un model o amplada en píxels per a una imatge. |
| ▸ (*Carrega*) | Carrega l'entrada com a nivell actual. |
| ✕ (*Esborra*) | Treu l'entrada. |
| Línia d'ús | `Usant X de Y.`: l'estimació d'emmagatzematge del navegador per a aquest lloc. |

Amb res guardat, la llista diu *Buida. Carrega un mapa o un model, i després «Desa a la biblioteca».*

## Què es guarda {#what-is-stored}

| Tipus | Guardat | No guardat |
|---|---|---|
| Imatge de mapa | La imatge (PNG), la seva mida, els seus ancoratges | Elevació, volteig, opacitat, brillantor, desaturació: es restauren als valors per defecte (elevació = la Y més baixa del conjunt de dades actual, volteig activat) |
| Nivell 3D | Vèrtexs, colors de vèrtexs, coordenades de textura, els seus mosaics i l'atles de textures, triangles de terra / d'estructura / d'aigua, vores d'estructura, recomptes de triangles | Noms de parts i motius de classificació, i tots els ajustos d'aparença: es restauren als valors per defecte d'una importació nova |

Un model carregat des de la biblioteca no té llista de parts, i els seus límits i la banda d'alçada del terra es recalculen a partir dels seus vèrtexs.

## On viu {#where-it-lives}

A l'IndexedDB del navegador, base de dades `3dheat`, magatzem d'objectes `levels`, per a l'origen de la pàgina (l'adreça de la barra d'adreces del navegador). És local d'aquell perfil del navegador: un altre navegador, un altre perfil o una altra adreça (per exemple `localhost` en lloc de `127.0.0.1`) veu una biblioteca diferent i buida. Esborrar les dades del lloc al navegador l'elimina. Les entrades desades per versions anteriors sense estructures, colors o aigua encara es carreguen.
