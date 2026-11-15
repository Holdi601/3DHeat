---
title: "Diferència"
parent: "Modes de calor"
nav_order: 5
lang: "ca"
source: "difference.md"
source_hash: "19f40abd7f5a"
translated: true
outdated: true
---

# Diferència

Vermell on l'equip A n'ha tingut més, blau-verd on n'ha tingut més l'equip B, res on eren iguals.

**Diferència** (tecla 2) és calor amb signe. Les files d'una població sumen calor; les d'una altra població la resten. On els dos s'equilibren, el resultat és zero i totalment transparent; on en domina un, es veu amb els colors d'aquest bàndol -per defecte càlids (transparent → vermell → groc → blanc) per al bàndol **+** i freds (transparent → verd → blau → lila) per al bàndol **−**.

![Calor de diferència: vermell on el bàndol + n'ha tingut més, verd i blau on n'ha tingut més el bàndol -](../assets/img/ca/difference-split.webp)

## Com s'usa {#how-to-use-it}

1. Prem `2` (o tria **Diferència** a la barra de modes).
2. Obre **Divisió de diferència** a la barra lateral.
3. Tria el criteri de **Divideix per**: normalment *Grups*.
4. Posa un grup (o un valor) a **+** i un altre a **−**.
5. Llegeix els colors: els càlids vol dir el bàndol +, els freds vol dir el bàndol −. El panell avisa si un bàndol no té files (vegeu [Missatges que pots veure](#messages-you-may-see)).

*Quines* dues poblacions són tota la qüestió, així que la divisió pot ser qualsevol columna retinguda, no només els grups. Les files que no cauen en **cap** dels dos bàndols **queden fora**, no es compten com a zero: això és el que fa que una divisió sobre dos de molts valors compari exactament aquests dos, i es combina amb els [filtres](filters.md) -filtra fins a un mapa, i després divideix-lo per versió.

El mode necessita dos bàndols: una columna de grup amb com a mínim dos grups, o una divisió sobre una columna retinguda per filtrar. Amb dades de menys de dos grups, en carregar es comença amb una divisió per columna -la columna *Fitxer d'origen* d'una càrrega de diversos fitxers primer, si no la primera columna de categories amb dos valors, si no la primera columna numèrica amb un interval- de manera que *compara dues càrregues* funciona amb dades sense cap grup. Només les dades sense cap de les dues coses deixen el mode no disponible; també ho fa una divisió per columna que deixa un bàndol buit.

## El panell Divisió de diferència {#the-difference-split-panel}

Es mostra en mode Diferència, sota els panells de calor.

**Divideix per** ofereix:

| Opció | Es mostra com | Regla de divisió |
|---|---|---|
| Grups | *Grup (N)* (quan hi ha una columna de grup) | Cada grup a +, a − o a cap dels dos, establert a la [Llista d'equips](teams-list.md) |
| Una columna de categories | *columna (N valors)* | Valors a +, a − o a cap dels dos |
| Una columna numèrica | *columna (numèrica)* | Un interval de valors per a cada bàndol |
| El fitxer d'origen | *Fitxer d'origen - compara dues càrregues* (quan s'han carregat diversos fitxers) | Fitxers a +, a − o a cap dels dos |

Només s'ofereixen les columnes marcades com a *Mantén per filtrar* en carregar.

### Compara proporcions, no recomptes {#compare-shares-not-counts}

**Compara proporcions, no recomptes** (per defecte desactivat) pondera cada bàndol per la inversa del seu propi nombre de files, així que un bàndol amb cinc vegades més files no guanya només pel nombre. El color mostra aleshores on cada bàndol és proporcionalment més comú que l'altre. Fes-ho servir quan els dos bàndols tenen quantitats de dades molt diferents, per exemple dues sessions de durada diferent.

### Missatges que pots veure {#messages-you-may-see}

El panell avisa quan la imatge no és una diferència real:

| Missatge | Significat |
|---|---|
| *N + / M −* (o *N + / M − / K sense usar*) | Quants valors hi ha a cada bàndol (i a cap dels dos). |
| Cap fila de la finestra és al bàndol **+** | Només es dibuixa el bàndol **−**. Mou la finestra de la línia de temps o canvia la divisió. |
| Cap fila de la finestra és al bàndol **−** | Només es dibuixa el bàndol **+**. |
| Cap valor no és a cap dels dos bàndols | La diferència no dibuixa res. Posa com a mínim un valor a **+** o a **−**. |
| *columna* no es pot dividir d'aquesta manera | La columna triada no encaixa amb la divisió. Torna a triar la columna. |
| La columna de divisió no ha cabut a la memòria de la GPU per a N de M blocs | Aquelles files no es dibuixen. Apuja el pressupost de la GPU a Rendiment → Pressupostos de recursos, o carrega menys files. |

### Per grup {#by-group}

El panell només apunta a la [Llista d'equips](teams-list.md), on cada grup té un botó **+** i un **−**. A cada càrrega, la primera meitat dels grups (arrodonida cap amunt) va a +, i la resta a −; **Reparteix a parts iguals** a la Llista d'equips fa el mateix de nou. Un grup a cap dels dos bàndols, o amagat amb la seva casella, no aporta res.

### Per valors de categoria {#by-category-values}

| Part | Significat |
|---|---|
| `a + / b − / c sense usar` | Quants valors hi ha a cada bàndol i a cap dels dos. |
| **Esborra** | Posa cada valor a cap dels dos bàndols. |
| Llista de valors | Cada valor amb un botó **+** i un **−** (torna a clicar el que està actiu per treure'l d'aquell bàndol). Un valor buit apareix com a *(manca)*. |
| Nota de límit | Només es llisten els primers 200 valors: *Es mostren els primers 200 de N valors. Una columna tan ampla es redueix millor amb un filtre primer, o es divideix per interval si els seus valors estan ordenats.* |

En triar la columna, el seu primer valor va a + i el segon a −. Quan cap bàndol té cap valor, la divisió torna als grups en lloc de mostrar un marc buit. *Fitxer d'origen* funciona igual, un valor per fitxer -així es comparen dues exportacions, dues proves o dues versions.

### Per interval {#by-range}

| Part | Significat |
|---|---|
| Pista | El mínim i el màxim de la columna. |
| **Interval positiu (+)**, **de** / **a** | Les files amb un valor en aquest interval, inclòs a tots dos extrems, sumen. |
| **Interval negatiu (−)**, **de** / **a** | Les files en aquest interval resten. |
| **Divideix pel punt mitjà** | Posa + a [mínim, mig] i − a [mig, màxim] -el que també fa triar la columna. |

Un valor que està en tots dos intervals compta com a +. Els intervals no han de cobrir la columna; els valors que no són en cap dels dos queden fora. *Els dos primers minuts contra els dos últims* és una divisió per interval sobre una columna semblant a temps.

## Colors {#colours}

La secció **Colors de la calor** mostra dos editors de rampa en aquest mode: **Positiva (equips que sumen)** i **Negativa (equips que resten)**, cadascun amb el seu botó de restabliment (*Restableix a transparent → vermell → groc → blanc*, *Restableix a transparent → verd → blau → lila*). La composició pren el valor absolut de la calor neta a través del [punt de saturació i la resposta](colour-and-exposure.md), i tria la rampa negativa on la neta és inferior a zero. Vegeu [Color i exposició](colour-and-exposure.md#the-ramp-editor).

Usa la *resposta lineal* a la densitat quan importa la mida de la diferència: és l'única resposta on el mateix color vol dir el mateix recompte.

## Com funciona {#how-it-works}

Cada fila rep un signe de +1, -1 o 0 al vertex shader ([`POINT_HEAT_VS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/shaders.ts)); un 0 rebutja la fila abans que es dibuixi cap fragment.

- Per grup, el signe surt d'una taula de 4.096 entrades indexada pel id de grup de la fila (el id de grup viatja al quart canal del texel de posició de la fila).
- Per categoria, el signe surt d'una segona taula de 4.096 entrades, omplerta per valor de categoria, i el valor de la fila es llegeix de la textura de filtre de la columna; un valor més enllà del final de la taula es rebutja als dos motors.
- Per interval, el valor de la fila es compara amb els dos intervals.

Canviar la divisió reinicia l'acumulació.

**Els grups amagats es mantenen amagats amb totes les divisions.** Amb una divisió per columna, la taula de grups ja no porta signes; conté 1 per a un grup mostrat i 0 per a un d'amagat ([`frameSignTables`](https://github.com/Holdi601/3DHeat/blob/main/src/render/filterTables.ts)), i les dues taules arriben al shader juntes -dues files d'una textura de signes a WebGL2, dues meitats d'un mateix buffer d'emmagatzematge a WebGPU. Una fila només es dibuixa quan el seu grup es mostra *i* el seu valor de columna és a un dels bàndols. Així, un grup desmarcat a la [Llista d'equips](teams-list.md), o deixat fora pel focus de bàndol de la pestanya Partida, no aporta res independentment de com es divideixi la diferència.
