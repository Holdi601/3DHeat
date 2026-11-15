---
title: "Figurák a figurás átfedésben"
parent: "Figurák"
grand_parent: "Visszajátszás"
nav_order: 2
lang: "hu"
source: "figure-replay.md"
source_hash: "4b13b8ad6dff"
translated: true
outdated: false
---

# Figurák a figura-rétegen

Ez az oldal arról szól, hogyan alakulnak a kockák kis 3D-s figurákká, amelyek azt mutatják, mi volt valójában minden egység, és arról a füstről és tűzről, amelyet a figurák hátrahagynak. A visszajátszás vezérlőit a [Meccs-visszajátszás](match-replay.md) oldal írja le.

A [kockás visszajátszásban](box-replay.md) és a Meccs fül figura-visszajátszásában a **Figurák kockák helyett** (alapértelmezés szerint be) minden élő személyt annak a figurájaként rajzol, akinek lennie kell: egy gyalogos katonát, a tankot, amelyet valaki vezet, vagy a repülőgépet, amely egy Tacview-nyomvonal. A figura megtartja a doboz színét, helyét és irányát. Repülőgépeknél és rakétáknál van dőlése is, és ha az adatnak van Roll oszlopa, a dőlésszöge is. A **Figuraméret** méretezi őket; az 1-szeres a valódi méret. A figurára kattintás úgy válaszol, mint a dobozára kattintás válaszolt volna.

## Melyik figura {#which-figure}

Az adat saját név- és típusoszlopai döntenek. A teljes szabályok, az oszlopnevekkel, a [Figurák](figures.md#which-figure-a-unit-gets) oldalon vannak. Az olyan adat, amelynek egyik fajta oszlopa sincs, emberek adata: mindenki katona.

Az illesztés címkénként gyorsítótárazott, így egy képkocka csak az elhelyezést igényli. Az adategység egy méter, hacsak az adat meg nem mondja, milyen nagy egy követett dolog (a CS2-export szerint egy játékos 32 egység széles); a figurák ennek megfelelően vannak skálázva.

A saját figuráidból álló választható készlet a gépeden a katalógus figuráit helyettesítheti; lásd: [Figurák](figures.md#an-optional-local-figure-pack).

## Hatások {#effects}

Azok az eseménysorok, amelyek egy ideig valamit hátrahagynak, ott rajzolódnak ki, ahol történtek, egészen addig, amíg tartanak, azoknak a színében, akik okozták: egy füst (kb. 18 s), egy molotov vagy gyújtógránát (7 s), egy villanás (kb. egy másodperc) és egy robbanás (egy másodperc alatt), egy csalétek (15 s), egy elhelyezett bomba (40 s). Egy esemény-oszlopból (Event, Events) jönnek, amelynek címkéje `smoke`, `molotov`, `incendiary`, `flash`, `he`, `decoy` vagy `plant` - a CS2-export a robbanás pillanatában írja őket.

## Meccs-visszajátszás: a Tacview eszközei {#match-replay-tacviews-tools}

A kamerákat, a könyvjelzőket, a taktikai kijelzőt, a statisztikákat, a címkéket, a **Függőleges vonalak**-at, az eseménylistát és a grafikon-ablakot a [Meccs-visszajátszás](match-replay.md) oldal írja le. A [Tacview-paritás](tacview-parity.md) felsorolja a Tacview minden funkcióját, és hogy hol tart.
