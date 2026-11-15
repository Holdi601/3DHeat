---
title: "Generador sintètic"
parent: "Carregar dades"
nav_order: 5
lang: "ca"
source: "synthetic-generator.md"
source_hash: "7a97459b7817"
translated: true
outdated: false
---

# Generador sintètic

Sense dades pròpies? Prem un botó i 3DHeat t'inventa una batalla fictícia, tan petita o tan gran com vulguis.

1. Obre el panell **Conjunt de dades** de la barra lateral del Mapa de calor (sota **Origen**).
2. Desplaça't fins a **Generador sintètic**.
3. Fixa **Files (milions)**. Prova primer 1: el valor per defecte de 8 milions és pesat per a una primera prova.
4. Prem **Genera**.

![1 milió de files, 8 equips, dibuixats en Calor per equips](../assets/img/en/synthetic-generator-team-heat.webp)

El panell **Conjunt de dades** pot generar un conjunt de dades en lloc de carregar-ne un. És per a dues coses: provar el visor sense dades pròpies, i comprovar si un nombre determinat de files, un radi de sprite i un pressupost mantenen una taxa de fotogrames utilitzable en una màquina *abans* de comprometre-hi una càrrega real gran. El seu moviment té la forma d'una partida de battle royale —els equips comencen separats i després s'estrenyen—, perquè el soroll uniforme es veu bé amb qualsevol pressupost i amaga exactament els artefactes que valen la pena detectar.

## Controls {#controls}

| Control | Per defecte | Significat |
|---|---|---|
| **Files (milions)** | 8 | Files a generar. S'arrodoneix cap avall a un nombre sencer de tics per a cada jugador. |
| **Equips** | 8 | Nombre de grups (com a mínim 1). |
| **Per equip** | 12 | Jugadors per grup (com a mínim 1). |
| **Semiextensió del mapa (m)** | 4000 | La meitat de l'amplada de l'àrea jugable en X i Z. |
| Línia d'estimació | | «≈ X GB de RAM, Y GB a la GPU després de la quantització.» (uns 26 bytes de RAM i 8 bytes a la GPU per fila). |
| **Genera** | | Genera al fil d'ingesta, amb progrés, i reemplaça qualsevol conjunt de dades carregat. |

La generació corre en el fil de treball en segon pla, de manera que desenes de milions de files no congelen la pàgina.

## Què genera {#what-it-generates}

De [`src/data/synth.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/synth.ts):

- **Columnes:** posició, temps, persona (`P000`, `P001`, ...), grup (`Team 1`, `Team 2`, ...), guinyament i cabussada, i durades de vida. Cap columna de sessió ni columnes de filtre.
- **Temps:** una mostra per jugador cada 0,25 s, començant a 0 (temps relatiu, sense rellotge de paret).
- **Moviment:** cada equip comença al seu propi sector d'un anell situat al 55-95 % de la semiextensió. Un cercle segur centrat prop del mig (desplaçat a l'atzar fins a un quart de la semiextensió) es redueix al 8 % de la semiextensió en sis fases amb plataformes; cada jugador dirigeix el seu rumb cap a un punt errant dins d'ell, amb amortiment i soroll. L'alçada ondula entre 0 i 220 m.
- **Direcció de la mirada:** guinyament segons la direcció de desplaçament, cabussada segons la velocitat vertical.
- **Repetible:** la llavor aleatòria és fixa (1337), de manera que els mateixos ajustos sempre produeixen les mateixes dades.

Tots els modes de calor, la repetició de caixes i la calor de línia (traces senceres, ja que no hi ha columna d'esdeveniments) funcionen amb ell. L'historial de durada de vida també funciona.
