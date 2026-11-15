---
title: "Anàlisi d'impactes (pestanya Vehicles)"
parent: "Repetició"
nav_order: 4
lang: "ca"
source: "hit-analysis.md"
source_hash: "8e9221927522"
translated: true
outdated: false
---

# Anàlisi d'impactes

La pestanya **Vehicles** mostra on van rebre un impacte un tanc, un vaixell o un soldat, i qui el va fer. Fes-la servir per veure quin costat d'un tanc rep trets, o quin enemic fa el dany.

## Prova-ho {#try-it}

1. Carrega una partida que tingui impactes (mira la taula de sota per saber quins jocs en donen).
2. Obre la pestanya **Vehicles** a dalt.
3. A **Vehicle**, tria una unitat, per exemple un tipus de tanc. El número entre parèntesi és quants impactes ha rebut.
4. Llegeix la figura: cada marca és un impacte, col·locat on va colpejar.
5. Obre **Qui la va tocar** per veure els tiradors, les armes o els vehicles dels tiradors, amb impactes, dany, morts i distància.

![La pestanya Vehicles: un tanc de demostració amb marques d'impacte, i Qui la va tocar obert](../assets/img/en/hit-analysis-tank.webp)

Si no hi ha res carregat, o les dades no tenen impactes sobre vehicles, la pestanya diu què falta i quin convertidor usar.

```
        shooter ----> o  hit mark on the figure
        shooter ----> o
  [ tank figure ]
```

La figura mostra els impactes on les dades donen un punt o una part del cos. El desglossament (qui l'ha tocat, amb què, amb quina força, des de quina distància) funciona per a totes les fonts.

## Què dona cada font {#what-each-source-gives}

| Font | Punt a la unitat | Tirador | Arma | Dany / resultat |
|---|---|---|---|---|
| War Thunder | sí, en el marc de la unitat, amb la direcció del tir | sí | el vehicle del tirador | crític, greu, mòduls destruïts, tret mortal |
| CS2 | part del cos (hitgroup) | sí | sí | dany, blindatge, salut restant |
| World of Tanks | sí (caixa del component, entrada i sortida) | sí | - | dany o cap (rebot, sense penetració) |
| World of Warships | sí, en el marc del vaixell | sí | tipus d'impacte | - |
| Squad | vehicles: sí - l'impacte col·locat en el marc del vehicle a partir de la seva pròpia posició i rumb | no (les dades no n'anomenen cap) | el tipus de dany | la caiguda de la salut del vehicle en aquell moment, destruït |
| Soldats de Squad | no: els resultats dels impactes (os i punt d'impacte) els guarda el convertidor en brut; les files `impact` amb `hitBone` es llegeixen tan bon punt les escriu | | | ferides i morts només |
| Arma (OCAP, el registrador d'Arma 3) | no: OCAP registra qui ha ferit o matat qui, amb què, des de quina distància, però no on | sí | sí | impacte o mort, distància |
| Tacview ACMI | sí quan un objecte d'arma acaba a menys de 30 m d'una unitat (no el seu llançador): el seu últim lloc en el marc de la unitat (rumb, cabeceig, balanceig), arribant com va volar | el `Parent` de l'arma | el nom de l'arma, o el AmmoType d'un Timeout | l'Outcome d'un Timeout, caigudes de `Health`, `Destroyed`; sense arma, una mort o un dany sense punt |
| Telemetria d'IL-2 (Watcher) | sí: els esdeveniments `hit` / `damage` porten el punt en el marc del propi avió del jugador (pres com x endavant, y amunt, z dreta) | no | no | la força |
| Dota 2 | no: el registre de combat no té lloc a un heroi | la unitat atacant | l'habilitat o l'objecte (cap: un atac) | dany, la mort de l'heroi |
| Battlefield 6 (GameCapture) | no: la captura llegeix el fil de morts (morts, baixes, marca de tret al cap), no els impactes | | | |
| Fonts en directe de DCS / altres del Watcher | no hi ha esdeveniments d'impacte més enllà del que contenen les seves gravacions de Tacview | | | |

Quan cap impacte de la unitat té un punt, la figura no mostra marques i el desglossament **Qui la va tocar** s'obre sol: per tirador, arma o vehicle del tirador, cadascun amb els seus impactes, dany i morts, i la distància mediana i la més llunyana.

## Restringir a una zona {#restrict-to-an-area}

La secció **Zona** limita l'anàlisi als impactes que han passat en un lloc del mapa.

1. Prem **Dibuixa un rectangle** o **Dibuixa un polígon**, i dibuixa sobre el terreny 3D o sobre el mapa tàctic.
2. Tria **Víctima a dins** (compta un impacte quan la unitat colpejada era a la zona) o **Tirador a dins** (quan qui va disparar hi era).
3. Prem **Fes-les servir de filtre**. Les fitxes mostren "{n} de {total} impactes a la zona".
4. **Restableix la zona** elimina totes les zones.

Cada zona és un [volum](volumes.md), de manera que les mateixes formes també filtren el mapa de calor i la repetició. Una zona pot incloure o excloure (una zona d'exclusió deixa fora els seus impactes, que es mostren com "{n} de {total} impactes fora de la zona"). Cada zona apareix com una fitxa amb quants impactes de la unitat hi eren; la × d'una fitxa l'elimina. Els recomptes, la figura, el desglossament i les llistes de filtre segueixen tots el mateix.

Els llocs d'un impacte: la fila de la qual surt porta el de una part (el de la víctima per a un ferit o un colpejat, el del tirador per a un tret); el de l'altra és la mostra pròpia d'aquella unitat més propera en el temps (dins de 5 s). Un impacte del qual no es coneix el lloc de la part es deixa fora mentre una zona filtra, i el panell diu quants són ("Deixats fora, lloc desconegut").

## Per a desenvolupadors {#for-developers}

Qualsevol convertidor pot afegir impactes: una fila de la víctima (`hit`, `impact`, `hurt`, `wounded`) amb `hitBone` (un os de l'esquelet, una selecció d'Arma, una zona d'impacte de Reforger - mapejada a cap, pit, estómac, braços i cames) o `hitLocalX/Y/Z` (metres, x endavant, y amunt, z dreta), amb `other` com a tirador i `damage`.
