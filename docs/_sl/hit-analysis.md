---
title: "Analiza zadetkov (zavihek Vozila)"
parent: "Ponovitev"
nav_order: 4
lang: "sl"
source: "hit-analysis.md"
source_hash: "8e9221927522"
translated: true
outdated: false
---

# Analiza zadetkov

Zavihek **Vozila** prikaže, kje je bil zadet en tank, ladja ali vojak in kdo ga je zadel. Uporabite ga, da vidite, katera stran tanka je zadeta, ali kateri sovražnik povzroča škodo.

## Preizkusite {#try-it}

1. Naložite tekmo, ki ima zadetke (glejte spodnjo tabelo, katere igre jih dajo).
2. Na vrhu odprite zavihek **Vozila**.
3. Pod **Vozilo** izberite enoto, na primer tip tanka. Številka v oklepaju je število zadetkov, ki jih je prejela.
4. Preberite sliko: vsaka oznaka je zadetek, postavljen tam, kjer je zadel.
5. Odprite **Kdo je zadel**, da vidite strelce, orožja ali vozila strelcev z zadetki, škodo, ubitji in razdaljo.

![Zavihek Vozila: demo tank z oznakami zadetkov in odprto Kdo je zadel](../assets/img/en/hit-analysis-tank.webp)

Če ni naložen nič ali podatki nimajo zadetkov na vozilih, zavihek pove, kaj manjka in kateri pretvornik uporabiti.

```
        strelec ----> o  oznaka zadetka na figuri
        strelec ----> o
  [ figura tanka ]
```

Figura prikaže zadetke tam, kjer podatki dajo točko ali del telesa. Razčlenitev (kdo je zadel, s čim, kako močno, z kako daleč) deluje za vse vire.

## Kaj da vsak vir {#what-each-source-gives}

| Vir | Točka na enoti | Strelec | Orožje | Škoda / izid |
|---|---|---|---|---|
| War Thunder | da, v okvirju enote, s potjo strela | da | vozilo strelca | kritično, hudo, uničeni moduli, usodni strel |
| CS2 | del telesa (hitgroup) | da | da | škoda, oklep, preostalo zdravje |
| World of Tanks | da (škatla komponente, vstop in izstop) | da | - | škoda ali nič (odboj, brez predora) |
| World of Warships | da, v okvirju ladje | da | vrsta zadetka | - |
| Squad | vozila: da – udarec, postavljen v okvir vozila iz njegovega položaja in smeri | ne (podatki nobenega ne navajajo) | vrsta škode | padec zdravja vozila v tistem trenutku, uničeno |
| Vojaki v Squadu | ne: rezultati zadetkov (kost in točka udarca) so pretvornik ohranil surove; vrstice `impact` s `hitBone` se preberejo takoj, ko jih zapiše | | | samo rane in smrti |
| Arma (OCAP, snemalnik Arme 3) | ne: OCAP beleži, kdo je koga zadel ali ubil, s čim in z kako daleč, ne kje | da | da | zadetek ali ubitje, razdalja |
| Tacview ACMI | da, kadar se objekt orožja konča do 30 m od enote (ne njegov izstrelitelj): njegovo zadnje mesto v okvirju enote (smer, nagib, zvitje), prihaja po poti, po kateri je letel | `Parent` orožja | ime orožja ali AmmoType Timeouta | Outcome Timeouta, padci `Health`, `Destroyed`; brez orožja ubitje ali škoda brez točke |
| Telemetrija IL-2 (Watcher) | da: dogodki `hit` / `damage` nosijo točko v okvirju igralčevega letala (vzeto kot x naprej, y gor, z desno) | ne | ne | sila |
| Dota 2 | ne: bojni dnevnik nima mesta na junaku | napadajoča enota | sposobnost ali predmet (brez: napad) | škoda, smrt junaka |
| Battlefield 6 (GameCapture) | ne: zajem bere dnevnik ubitij (ubitja, smrti, zastavica zadetka v glavo), ne zadetkov | | | |
| DCS / drugi viri Watcher v živo | ni dogodkov zadetkov razen tistega, kar hranijo njihovi posnetki Tacview | | | |

Kjer nobeden od zadetkov enote nima točke, figura ne prikaže oznak, razčlenitev **Kdo je zadel** pa se odpre sama: po strelcu, orožju ali vozilu strelca, vsak s svojimi zadetki, škodo in ubitji ter mediano in najdaljšo razdaljo.

## Omejitev na območje {#restrict-to-an-area}

Razdelek **Območje** omeji analizo na zadetke, ki so se zgodili na nekem mestu na zemljevidu.

1. Pritisnite **Nariši pravokotnik** ali **Nariši mnogokotnik** in narišite na 3D tleh ali na taktičnem zemljevidu.
2. Izberite **Žrtev znotraj** (šteje zadetek, kadar je bila zadeta enota v območju) ali **Strelec znotraj** (kadar je streljal tisti v območju).
3. Pritisnite **Uporabi kot filter**. Značke pokažejo »{n} od {total} zadetkov v območju«.
4. **Ponastavi območje** odstrani vsa območja.

Vsako območje je [prostornina](volumes.md), zato iste oblike filtrirajo tudi toplotno karto in predvajanje. Območje lahko vključuje ali izključuje (izključujoče območje pusti svoje zadetke ven, prikazano kot »{n} od {total} zadetkov zunaj območja«). Vsako območje je prikazano kot značka s številom zadetkov enote v njem; × na znački ga odstrani. Števila, figura, razčlenitev in seznami filtrov se vsi ravnajo po tem.

Mesta zadetkov: vrstica, iz katere je zadetek, ima mesto ene strani (žrtve za zadetek ali zadetega, strelca za strel); mesto druge je najbližji lastni vzorec te enote po času (v 5 s). Zadetek, katerega mesto strani ni znano, se pri filtriranju območja izpusti, plošča pa pove, koliko ("Izpuščeno, ni znanega mesta").

## Za razvijalce {#for-developers}

Vsak pretvornik lahko doda zadetke: vrstica žrtve (`hit`, `impact`, `hurt`, `wounded`) s `hitBone` (kost skeleta, izbor Arme, zona zadetka Reforgerja – preslikana na glavo, prsni koš, trebuh, roke in noge) ali `hitLocalX/Y/Z` (metri, x naprej, y gor, z desno), z `other` za strelca in `damage`.
