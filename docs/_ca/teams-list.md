---
title: "Llista d'equips"
parent: "Filtres i eines"
nav_order: 2
lang: "ca"
source: "teams-list.md"
source_hash: "5477a98fa51c"
translated: true
outdated: false
---

# Llista d'equips

El panell **Equips** et permet amagar un equip o posar-lo a un costat d'una comparació. Usa'l per mirar només els Blaus, o per preguntar-te «on va el Blau que el Vermell no fa?».

Un *grup* és un equip o bàndol, per exemple Blau i Vermell ([Grups](sessions-persons-groups.md#group)). El panell es mostra quan el conjunt de dades té una columna de grup; el nombre de grups és a la seva capçalera. En el mode Calor per equips la barra lateral també té una secció anomenada **Visor d'equips** amb els seus propis ajustos; aquesta pàgina tracta la llista **Equips**.

## Amagar un equip {#hide-a-team}

1. Obre **Equips** a la barra lateral.
2. Desmarca la casella (*Visible*) de l'equip a amagar. La imatge s'actualitza de seguida.
3. Prem **Mostra-ho tot** per tornar a mostrar tots els equips.

![La llista d'equips: Blue 5p, Red 5p, amb Mostra-ho tot](../assets/img/en/teams-list.webp)

## Cada fila {#each-row}

| Part | Significat |
|---|---|
| Casella (*Visible*) | Mostra o amaga el grup. |
| Mostra de color | El color del grup: el seu color de [calor per equips](team-heat.md) en el mode Calor per equips, el seu color base en els altres modes. |
| Nom | L'etiqueta del grup (etiqueta completa en passar el ratolí). |
| **+** / **-** (mode Diferència) | Posa el grup al costat positiu o negatiu de la [diferència](difference.md); fes clic de nou al botó actiu per posar-lo a cap dels dos costats. |
| `Np` (altres modes) | El nombre de persones la primera fila de les quals és en aquest grup. |

![Mode Diferència: el Blau al costat +, el Vermell al costat -](../assets/img/en/teams-list-difference.webp)

## Botons {#buttons}

| Botó | Efecte |
|---|---|
| **Mostra-ho tot** | Torna a fer visibles tots els grups. |
| **Reparteix a parts iguals** (mode Diferència) | La primera meitat dels grups (arrodonida cap amunt) a +, la resta a -; la mateixa repartició amb què comença cada càrrega. |

## Què fa amagar un grup {#what-hiding-a-group-does}

- A **Calor**, **Calor per equips** i **Línies**, les files del grup no aporten res.
- A **Diferència**, un grup amagat no aporta res sigui quin sigui el costat on estigui, també amb una divisió per una altra columna (vegeu [Diferència](difference.md#for-developers)).
- A la **superposició de figures**, no es dibuixen les persones la primera fila de les quals és en aquest grup.
- A **Calor per equips**, els altres grups mantenen els seus colors: els tons s'assignen pel nombre total de grups, no pel que és visible, de manera que dues imatges es mantenen comparables.

Canviar la visibilitat reinicia l'acumulació. A cada conjunt de dades nou, tots els grups tornen a ser visibles.

La indicació del panell canvia amb el mode: en Diferència explica + i -; en Calor per equips, que les mostres són els colors que dibuixa cada grup.
