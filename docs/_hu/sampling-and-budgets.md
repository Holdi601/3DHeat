---
title: "Mintavétel és keretek"
parent: "Renderelés belső működése"
nav_order: 3
lang: "hu"
source: "sampling-and-budgets.md"
source_hash: "1de02c020b1b"
translated: true
outdated: false
---

# Mintavétel és keretek

Ha túl sok pont van ahhoz, hogy egy képkockán kirajzoljuk, a megjelenítő egyenletes mintát rajzol, és minden pontot többet ér, így a kép helyes marad. Egy vezérlő állítja, hány pontot rajzoljon, hogy a megjelenítő megtartsa a képkockasebességét.

## A teljesítmény-panel vezérlői {#performance-panel-controls}

| Vezérlő | Alapérték | Tartomány (jog) |
|---|---|---|
| **Minden sor kirajzolása minden képkockában** | be | |
| **Adaptív keret** | be | |
| **Cél FPS** | 60 | 20–240 (1000) |
| **Kezdeti sprite / képkocka** (adaptív) vagy **Sprite / képkocka** | 4,00M | 65 536–268 435 456, logaritmikus (268 435 456) |
| **Hőfelbontás** | 100% | 25–100%, megszorozva az adaptív második szakasz skálájával |
| **Progresszív finomítás** | be | Kikapcsolva: minden képkocka friss, egyképkockás becslés (hasznos a nyers minta megtekintéséhez). |

Lásd még: [Teljesítmény-panel és statisztikai réteg](performance-and-stats.md).

## Fejlesztőknek {#for-developers}

### Jelölt sorok {#candidate-rows}

A sorok növekvő időrendben vannak tárolva. Az idővonal [*lo*, *hi*] ablaka két bináris kereséssel sorhatárrá lesz az időoszlopon ([`candidateRange`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)); időoszlop nélkül minden sor jelölt. Ezek a statisztikai réteg **Sorok az ablakban** értékei. A soronkénti vizsgálatok – szűrők, csoportok, szétbontás, levágás, szelet, élettartam – később, a shaderben történnek; egy sor, amely megbukik, egy csúcshívásba kerül, töredékekbe nem.

### A mintavételi terv {#the-sampling-plan}

A [`planFrame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts) a jelölt tartományt **4096 egymást követő sorból álló blokkokra** osztja, és a képkocka sprite-keretéből választja ki, hány blokkot rajzoljon:

- Ha a keret minden blokkra jut, mindet kirajzoljuk – a képkocka pontos.
- Különben a blokkokat egyenletes lépésközzel vesszük a tartomány mentén, egy olyan eltolással, amely minden képkockánál az aranymetszés szerint lép, így az egymást követő képkockák más-más blokkokat fednek le, és az unió egyenletesen tölt fel. Ez **rétegzett** minta: az időtartomány minden része minden képkockában képviselve van.

Minden kirajzolt sor hőjét megszorozzuk a **jelöltek / beküldöttek** aránnyal, így a képkocka várható hője bármely keretnél pontos; csak a zaj függ a kerettől. A sorok 8 388 608-as darabokban élnek (lásd [GPU-memória-rezidencia](gpu-memory.md)); egy blokk ott kettéválik, ahol átlép egy darabhatárt, és minden darab megkapja a kezdőblokkok listáját, amelyeket ki kell rajzolnia.

Egy terv legfeljebb 65 536 blokkot hordozhat – 268 435 456 sprite-ot –, mert mindkét háttérrendszer fix, 65 536 helyes blokkkezdő-pufferben tartja a kezdőpontokat. Ennél többet kérő kérés itt van határolva, a hiányzó rész pedig becsületesen jelentkezik: több képkocka kell a konvergáláshoz.

### Minden sor kirajzolása minden képkockában {#draw-every-row-each-frame}

**Teljesítmény → Minden sor kirajzolása minden képkockában** (alapértelmezés **be**): a keret padlóvá válik, nem plafonná, és az a képkocka, amely friss becslést kezd, minden olyan sort kirajzol, amelyért felelős (legfeljebb a 268M-os határig).

Az oka: a kamera mozgatása eldobja a halmozást, így egy mozgó képkocka egyetlen becslés, amelynek zaját az határozza meg, mennyi adatot rajzolt ki – negyedével kirajzolva csak egy negyedét látjuk fényes, súlyozott pontokban, és ettől csillog a mozgó nézet. Ha mindent kirajzolunk, minden képkocka a kész kép lesz. Az ár az, hogy a képkocka ideje most az ablakban lévő adatok méretét követi; a fogantyúk szűkebb időablak, szűrők vagy távolsági levágás, amelyek csökkentik a jelölteket ahelyett, hogy ritkábban mintavételeznének.

Kapcsolja ki olyan hardveren, amely nem engedheti meg magának az egész mezőt egyszerre: a *Sprite / képkocka* ekkor valódi korlát, a nézet pedig néhány álló képkocka alatt konvergál.

Egy teljes terv költsége egy csúcskategóriás asztali GPU-n, 4K-s vásznon, nagy pályával, 1 m sugarú sprite-okkal (egy-két pixel): nagyjából 100M sprite képkockánként 30 fps-nél, 200M 15 fps-nél, a 268M maximum pedig körülbelül 12 fps-nél. Ilyen kicsi sprite-oknál a csúcsszakasz a teljes költség, és a hőfelbontás semmit sem változtat; nagy sprite-oknál a kitöltés a meghatározó: 8M, 100 m sugarú sprite teljes hőfelbontásnál 2,5 s volt képkockánként, 25%-nál 170 ms. A **Minden sor kirajzolása minden képkockában** ezért 67M-nál indul, és képkockánként negyedével emelkedik, amíg a képkockák 150 ms alatt vannak, és felezi, amíg 400 ms felett; így egy nehéz nézet nem tudja a képkockát a GPU időtúllépési őrének határán túlra vinni.

### Az adaptív keret {#the-adaptive-budget}

A **Teljesítmény → Adaptív keret** (alapértelmezés be) a sprite-keretet úgy hangolja, hogy tartsa a **Cél FPS**-t ([`BudgetController`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)). A dobozos visszajátszásban és videórenderelés közben tétlen.

A bemenet a képkockaidő, simítva (90% előző + 10% új, az egyedi képkockák legfeljebb 2 s-ra korlátozva), a cél pedig 1000 / max(15, cél FPS) ms.

**Első szakasz – sprite-ok.** Minden képkockánál a keret szorzódik `1 + (cél / képkocka - 1) × erősítés` értékkel, az erősítés 0,35, ha túl lassú, és 0,08, ha van tartalék; képkockánként 0,5–1,25-ös tényezőre, és 65 536–268 435 456 sprite-ra szorítva.

**Második szakasz – felbontás.** Csak akkor, ha a keret már a padlón van, és a képkockák még mindig több mint 10%-kal lassúak, esik a hőpuffer felbontása, képkockánként 8%-kal, a vászon 25%-áig; képkockánként 4%-kal emelkedik vissza, ha 30% a tartalék. A fragmens költsége a felbontás négyzetével csökken, ami egy sima skála alatt alig látszik. (Szoftveres renderelésen mérve, 10M sorral és túlméretezett sprite-okkal: 141 ms → 17 ms képkockánként.) A skála tizenhatodokra kerekített; a jelző *Hőfelb.* mutatja.

**Feladás.** Egy lassú képkocka ugyanúgy néz ki, akár a sprite-ok okozták, akár egy nehéz pálya – nincs menetenkénti időmérés. Ha a keret a padlón marad, és a képkockák 30 képkockán át a cél 70%-a alatt maradnak, a sprite-ok nem voltak a költség: a vezérlő **mászásra** vált, a keretet 14 képkockánként 1,5-szeresére szorozva és a felbontást visszaállítva, amíg a képkockaidő a padlón mért értékének 1,5-szeresén belül marad. Az a mászás, amely ennél rosszabbá teszi a dolgokat, 60%-ra vágja vissza, és visszatér a normál szabályozáshoz; a cél elérése véget vet a mászásnak.

Ha az adaptív keret ki van kapcsolva, a keret egyszerűen a **Sprite / képkocka**.

Ha a *Minden sor kirajzolása minden képkockában* be van kapcsolva, az adaptív keret továbbra is fut, de a pontos szabály a keretet minden jelölt sorra elegendőre emeli, így a gyakorlatban csak a felbontási szakaszt és azokat a képkockákat vezérli, amelyek nem kezdenek friss becslést.
