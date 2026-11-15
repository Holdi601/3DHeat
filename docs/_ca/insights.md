---
title: "Troballes"
nav_order: 7
has_children: true
lang: "ca"
source: "insights.md"
source_hash: "8232fe145807"
translated: true
outdated: false
---

# Troballes

**Troballes** busca a les dades carregades el que destaca -posicions fortes, terreny mortal, trampes d'aparició, colls d'ampolla, jugadors molt per sobre dels seus iguals- i t'ho explica, el més fort primer, amb les proves. Serveix per entendre en un minut on es va guanyar o perdre una partida. Després pot escriure un resum, i en una sola repetició pot fer de comentarista que salta als grans moments.

Tot es compta al navegador. Res surt del teu ordinador tret que activis una IA externa (vegeu [IA externa](#external-ai)).

![Troballes sobre la demostració de tancs: 14 troballes, la més forta primer](../assets/img/en/insights.webp)

La secció **Troballes** és a la barra lateral de les pestanyes Mapa de calor i Partida. Té tres pestanyes: **Troballes**, **Resum** i **Comentarista**.

## Troballes {#findings}

1. Carrega dades i obre **Troballes**. Prem **Cercar troballes** («Comptant… n%» mostra el progrés).
2. Llegeix la llista. Cada troballa té una barra de força, una frase, com de bones són les proves (*Proves fortes*, *Bones proves* o *Algunes proves*), quin detector la va trobar, i la classe de vehicle quan hi importa.
3. **Fes clic a una troballa**: el visor aplica els seus filtres, porta la càmera al lloc i salta al moment, i obre el detall: l'efecte amb el seu interval del 95%, els valors de p i de q, les proves comptades, i **Volum aquí**, que dibuixa un [volum](volumes.md) al voltant del lloc.
4. **Restaura els filtres** et torna els teus filtres. **Copia el JSON** copia tot l'informe.

El recompte usa els filtres actuals, els grups amagats i la partida triada en tot l'interval de temps. Quan després canvies els filtres, una nota ho diu; prem **Torna a comptar**.

Les línies de dalt de la llista (per exemple els totals de diners) resumeixen el conjunt de dades abans de les troballes.

![Una troballa oberta: la zona calenta de trets disparats, els seus números, i un fragment de la bibliografia que hi concorda](../assets/img/en/insights-finding.webp)

### Els detectors {#the-detectors}

| Detector | Què troba | Necessita a les dades |
|---|---|---|
| **Posicions de poder** | Llocs amb molt millors probabilitats de morts causades per mort que la resta del mapa, i *terreny segur* on mor poca gent pel temps que s'hi passa | esdeveniments de mort causada i de mort |
| **Zones calentes i fredes** | Llocs on un tipus d'esdeveniment (trets, impactes, captures ...) passa molt més o molt menys sovint del que prediu el temps que s'hi passa | una columna d'esdeveniments |
| **Terreny obert i cobertura** | Morts a l'obert contra geometria del nivell propera, i lentitud contra moviment ràpid | morts; un nivell 3D per a la part de la geometria |
| **Spawns** | Spawns forts, trampes d'aparició, spawns segurs, temps fins al primer contacte | temps i persones |
| **Classe per lloc** | Una classe de vehicle, o jugadors contra IA, que van molt millor o molt pitjor en una àrea | morts causades més una classe de vehicle o una columna de jugador/IA |
| **Jugadors** | Jugadors que maten o moren molt més o molt menys que els altres de la mateixa classe | persones i morts causades |
| **Colls d'ampolla i flancs** | Colls d'ampolla (molts més passos que el terreny del voltant) i rutes de flanqueig (poc usades, però que porten a morts) | persones |
| **Valor** | *Terreny car* i *Terreny rendible* | [columnes de valor](value-weighting.md) |

Els detectors que no poden funcionar amb les dades apareixen al final amb el motiu.

### Com s'ordenen les troballes {#how-findings-are-ranked}

Cada lloc o grup es prova contra la resta del mapa (proves binomials exactes o de taxa). La taxa de descobriments falsos es manté al 5% (Benjamini-Hochberg). El atzar pot semblar un patró; això manté baixes les falses alarmes: entre les troballes mostrades, s'espera que com a molt una de cada vint sigui atzar. Els efectes de pocs esdeveniments s'atreuen cap a «cap efecte» abans d'ordenar. Com a màxim es llisten 60 troballes, i cada detector té alguns llocs a la part alta.

## Resum {#debrief}

La pestanya **Resum** escriu les troballes en un text curt: una entrada, la troballa més clara, una per a tàctica, una per a equilibri, la resta agrupada per detector, i quantes es basen en proves més febles. Cada paràgraf té botons numerats que mostren les seves troballes. **Copia el text** el copia.

![El resum escrit pel narrador integrat](../assets/img/en/debrief.webp)

El narrador integrat funciona sense connexió, en el teu idioma. El selector **Lent** de sobre (vegeu [La lent del coneixement](knowledge.md)) decideix quina bibliografia citen els paràgrafs.

### IA externa {#external-ai}

**Paràmetres d'IA** permet que un model d'IA que triïs escrigui el resum:

| Configuració | Significat |
|---|---|
| **Proveïdor** | Anthropic (Claude), OpenAI (ChatGPT), OpenRouter, Ollama (local), LM Studio (local), servidor llama.cpp (local), o qualsevol punt final compatible amb OpenAI |
| **URL base**, **Model** | Els omple el proveïdor; **Llista els models** demana al servidor |
| **Clau d'API** | Només s'envia a la URL base. Mai no es registra, mai no es desa en vistes, exportacions o fitxers `.3dheat`. La majoria de servidors locals no en necessiten cap. |
| **Recorda la clau en aquest navegador** | Desactivat per defecte: la clau s'oblida quan es tanca la pàgina |
| **Fes servir una IA externa** | Desactivat per defecte |
| **Envia els noms dels jugadors** | Desactivat per defecte: els jugadors s'envien com a P1, P2 ... |

Després escriu una pregunta opcional i prem **Escriu amb IA**. Només s'envien les troballes i els seus números -mai les files de les dades. La resposta arriba a poc a poc; les troballes citades es converteixen en botons.

## Comentarista {#caster}

Per a **una partida** (tria'n una si n'hi ha diverses carregades), el **Comentarista** troba els moments que val la pena mirar: primera sang, multimorts, represàlies, moments decisius, canvis d'objectiu, remuntades, jugadors destacats, tirs llargs.

![Els moments del comentarista per a una ronda de la demostració de tiroteig](../assets/img/en/caster.webp)

- Fes clic a un moment: la vista passa a la repetició, salta just abans, hi vola i segueix el jugador.
- **Reprodueix els moments** reprodueix cadascun fins al final i passa al següent; **Anterior** / **Següent** avancen pels moments.
- Amb una IA externa activada, **Comentaris de la IA** escriu un comentari a partir de la llista de moments (tipus, temps, noms o pseudònims, equips, classes, distàncies).

Necessita persones i esdeveniments de mort causada/mort (o de captura); una columna `other`/`victim` fa possibles les represàlies i els tirs llargs.

## La lent del coneixement {#knowledge-lens}

Una troballa es pot llegir a través d'una **lent** de coneixement establert: doctrina militar, combat aeri i naval, operacions urbanes, disseny de jocs i esports electrònics (o *Auto*, triat per les unitats de les dades). Una troballa oberta mostra aleshores l'entrada més propera de **doctrina i bibliografia** i un **paral·lel històric**, amb referències, i **Mètriques de la lent** calcula mesures d'aquesta bibliografia sobre les dades (ajustos de Lanchester, ràtios d'intercanvi, ràtios de forces, camps de tir, terreny clau, represàlies, iniciativa). El resum i la petició a la IA les inclouen. Tot sobre això: [La lent del coneixement](knowledge.md).

Les mètriques de la lent també mesuren com es comporten els jugadors com a multitud i com a grup -alineació i remolins, conducció de rutes, carrils i rastres, aglomeració, líders i seguidors, rezagats, el punt de ruptura sota pèrdues, risc després de perdre una vida, ratxes, acord en la compra i la resposta al foc que arriba- cadascuna contra el seu propi model nul: [Comportament col·lectiu](collective-behaviour.md).

## Dades que fan funcionar les troballes {#data-that-makes-insights-work}

- posicions amb una columna de **temps**, una de **persona** i una d'**equip**;
- una columna d'**esdeveniments** amb morts causades i morts (`kill`, `death`), i altres (`hit`, `fire`, `capture` ...);
- una columna de l'**altra part** (`other`, `victim`) per a represàlies i direccions;
- una columna de **vehicle** o de **tipus** per a classes; una columna `ai` per a jugadors contra IA;
- una columna de **sessió** / **partida** / **ronda** quan hi ha diverses partides.

Les [dades de demostració](demo-data.md) les tenen totes.
