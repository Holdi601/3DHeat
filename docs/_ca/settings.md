---
title: "Configuració, unitats i tecles"
nav_order: 19
lang: "ca"
source: "settings.md"
source_hash: "bd1062895abf"
translated: true
outdated: false
---

# Configuració, unitats i tecles

Els petits controls de dalt de la barra lateral canvien la manera com el visor es comunica amb tu: l'idioma, les unitats (metres o peus, km/h o nusos) i un mode d'ajuda que explica els colors. Les teves eleccions es recorden al navegador.

## La capçalera {#the-header}

A la part superior de la barra lateral:

| Control | Què fa |
|---|---|
| **?** | Mode d'ajuda: què significa cada color (també `?` o `F1`) |
| Menú **Unitats** | Mètric, Imperial, Aviació o Nàutic |
| Botó **...** al costat de **Unitats** | Obre «Tria una unitat per a cada magnitud»: un desplegable per magnitud |
| Menú **Idioma** | L'idioma del visor: [40 idiomes](languages.md), o el del navegador |

![La capçalera amb el menú Unitats i la finestra d'unitat per magnitud oberta](../assets/img/en/settings-units.webp)

Els números que escrius en una caixa poden dur punt o coma (`0.35` o `0,35`). El visor els llegeix tots dos i mostra els números com els escriu l'idioma del visor.

## Unitats {#units}

1. Tria un preajust al menú **Unitats**. Totes les magnituds canvien juntes.
2. Per canviar només una magnitud, fes clic al botó **...** al seu costat i tria una unitat per a aquella magnitud. El menú aleshores mostra un `*` després del preajust.
3. Una magnitud que no has fixat segueix el preajust. Tria «Com el preajust» per tornar-hi.

| Magnitud | Mètric (per defecte) | Imperial | Aviació | Nàutic |
|---|---|---|---|---|
| Distància | km | mi | NM | NM |
| Altitud, longitud | m | ft | ft | m |
| Velocitat | km/h | mph | kt | kt |
| Velocitat vertical | m/s | ft/min | ft/min | m/s |
| Temperatura | °C | °F | °C | °C |
| Pressió | hPa | inHg | hPa | hPa |
| Massa, combustible | kg, l | lb, gal | lb, gal | t, m³ |
| Angle | graus | graus | graus | graus |

Altres unitats que pots triar per a una sola magnitud: distància km, mi, NM; velocitat km/h, m/s, kt, mph; velocitat vertical m/s, ft/min, m/min; temperatura °C, °F, K; pressió hPa, inHg, mmHg, psi; massa kg, lb, t; angle graus o mils NATO (6.400 per volta). Les unitats són les mateixes a tot el visor: etiquetes, fitxes, gràfics, estadístiques.

## Mode d'ajuda {#help-mode}

![Mode d'ajuda: què signifiquen els colors](../assets/img/en/help.webp)

Prem `?` o `F1`, o fes clic al botó **?**. Mostra *Què signifiquen els colors*: llegendes de la vista 3D, les rampes de calor, els colors dels equips, els colors del nivell, els colors d'estat dels panells, el panell de partida i la vista de curses. Es queda activat fins que el desactives. A la pestanya Partida també explica els colors del panell de partida.

![Mode d'ajuda a la pestanya Partida](../assets/img/en/settings-help-match.webp)

## Què recorda el navegador {#what-the-browser-remembers}

Aquestes configuracions es guarden al navegador entre visites (no s'envia res a cap lloc):

- l'idioma, les unitats i el mode d'ajuda;
- la configuració de figures, símbols, etiquetes, càmera i pantalla tàctica de la repetició;
- la velocitat de reproducció i el mirall;
- els marcadors per gravació, els volums per conjunt de dades, les capes d'objectius;
- la configuració de la IA externa (la clau només si marques *Recorda*).

La configuració de calor, els filtres i el mode comencen de nou a cada càrrega. La llista completa i generada: [Configuració desada](ref-settings-storage.md).

## Tecles que el visor conserva del navegador {#keys-the-viewer-keeps-from-the-browser}

Una sessió amb dades grans triga a carregar, així que el visor evita que el navegador la descarti per accident:

- `Ctrl`/`Cmd` + lletres que imprimirien, desarien, obririen, recarregarien, tancarien o obririen finestres noves no fan res fora de les caixes de text; `F1`, `F3`, `F5`, `F6` i `F7` no fan res.
- Tancar o recarregar la pestanya amb dades o un nivell carregats pregunta abans.
- A pantalla completa el visor bloqueja les tecles que usa (W, T, N, S, R, P, Q, Esc), perquè el navegador no se les quedi.

La llista exacta: [Tecles del navegador](ref-browser-keys.md). Totes les tecles del propi visor: [Referència de teclat i ratolí](keyboard-reference.md).
