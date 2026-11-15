---
title: "Halmozás"
parent: "Renderelés belső működése"
nav_order: 2
lang: "hu"
source: "accumulation.md"
source_hash: "047ad9481db3"
translated: true
outdated: false
---

# Halmozás

Ha a megjelenítő nem tud minden pontot egy képkockán kirajzolni, egy részüket rajzolja, aztán egy másik részt, és a képeket összeadja, amíg mozdulatlanul tartja. A kép élesebb lesz, mint egy előhívott fénykép. A kamera mozgatása újrakezdi. A statisztikai réteg **Lefedettség** sora mutatja, meddig tart.

![A statisztikai réteg: a Lefedettség százalékot mutat, amíg a kép fejlődik, és *pontos*-at, ha kész](../assets/img/en/performance-stats-overlay.webp)

## Fejlesztőknek {#for-developers}

Ha egy képkocka nem tudja az összes sort kirajzolni, egy mintát rajzol, és azt súlyozza fel; a kép ekkor torzítatlan, de zajos becslés. A **halmozás** egymás utáni képkockákat egyesít, így a becslés a pontos eredményhez konvergál, amíg semmi nem változik. Minden képkocka öt mód egyikét választja ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)); az utoljára használt az `engine.live.accumMode`-on van.

| Mód | Mikor | Mi történik a gyűjtővel |
|---|---|---|
| **reset** | a kamera mozdult, valami megváltozott, ami a mezőt érinti, a progresszív finomítás ki van kapcsolva, egy növekvő ablak indul (a visszajátszás első képkockája, keresés után), vagy a visszajátszott vonal-hő mozdult | Ennek a képkockának a becslése váltja. |
| **extend** | egy **Halmozott** ablak, amely az utolsó képkocka óta csak nőtt | Ez a képkocka csak azokat a sorokat rajzolja, amelyek éppen láthatóvá váltak, teljes súllyal, és hozzáadja őket. Semmi nem csökken. |
| **ema** | egy csúszó ablak (**Ablak**, **Élettartam**) mozdult | `acc = acc × (1 - 0,34) + képkocka × 0,34` – körülbelül három képkockányi exponenciális mozgóátlag. |
| **mean** | semmi nem változott, és a becslés nem teljes | `acc = acc × (1 - 1/n) + képkocka × 1/n` az *n*-edik képkockán: futó átlag. |
| **skip** (tétlen) | konvergált, és semmi nem változott | Nem rajzolódik semmi; a képkocka csak újra összeáll. |

### Miért mindegyik {#why-each}

- **Futó átlag, nem összeg.** A puffer 1 - 1/n-nel szorzása és az új képkocka 1/n-ed részének hozzáadása algebrailag ugyanaz, mint összeadni és a végén *n*-nel osztani, de a puffer mindig egy mező értékét tartalmazza. Egy összeg *n*-szeresét érné el a mezőnek, és 16 bites célnál 65 504-nél telítődne; egy folyamatosan növekvő osztóval egy álló nézet a hosszabb ideig állva annál jobban halványodna – miközben egy mozgó kamera, amely minden képkockánál újraindul, tökéletesen helyesnek látszik. A füstteszt-csomag azt állítja, hogy 16 egyesített képkocka 1,00-szorosát tartja annak, amit egy képkocka.
- **Extend a halmozott visszajátszásnál.** A már halmozott sorok még láthatók, így egy képkockának csak az éppen érkezett másodperc-töredék kell – ez egy képkockába belefér, ezért pontosan bekerül. Az újrabecslés minden képkockán más véletlen részhalmazt világítana meg, és halványítana, ami villanásoknak látszana, és egy szüneteltetett képkocka tovább töltene. A csomag azt állítja, hogy az összeg lejátszás közben monoton nő, és 2,5 másodperc szünetben 0,02%-on belül marad.
- **Mozgóátlag csúszó ablakoknál.** Ezek valóban minden képkockán változnak. Egy rögzített keverési súly követi a mozgó ablakot (a lejátszás kezdete óta minden képkocka átlaga lemaradna a lejátszófej mögött), és sokkal nyugodtabb, mint az újrakezdés.
- **Reset a visszajátszott vonalaknál.** A vonal-hő fejei minden képkockán mozognak; egy mozgóátlag mindegyiket csíkká mosná, ezért minden képkocka egészben rajzolódik, és a farok halványulása maga a kép.
- **A részképkockák egy ideiglenes célon mennek át.** Egy teljes súly töredékével egyesített képkockát nulláról egy külön célba szórunk, majd keverjük a gyűjtőbe, ahelyett hogy közvetlenül 1/n súllyal szórnánk. Közvetlenül minden sprite az általa csatlakozott összeg 1/n-ed méretében adódna hozzá, amit egy félpontos cél elkerekít – a legrosszabb ott, ahol a legsűrűbb ([Félpontos halmozás](half-float-accumulation.md)).

### Konvergencia {#convergence}

Minden képkocka tervében ismert, hány jelölt sor van, és hányat küld be, így az összes sor lefedéséhez szükséges képkockák száma ⌈jelöltek / beküldöttek⌉. Amint ennyi képkocka egyesült, a nézet **konvergált**: a statisztikai réteg *Lefedettség* sora százalékról *pontos*-ra vált, a további képkockák pedig tétlenek. A **Minden sor kirajzolása minden képkockában** bekapcsolva (az alapérték) egy képkocka általában mindent lefed, így a konvergencia azonnali; a progresszív gépezetre csak akkor van szükség, ha az ablak több sort tartalmaz, mint amennyit egy rajzolási terv elhordoz (körülbelül 67 millió).

### Mi indítja újra {#what-restarts-it}

A beállítások három csoportba esnek, aszerint, mit jelent a halmozott puffer azok megváltozása után:

| Csoport | Változások | Hatás |
|---|---|---|
| **Geometria** – mely sorok járulnak hozzá, és mennyivel | nézetmód; vonalútvonalak; sprite-sugár, középponti és peremintenzitás, lecsengés, lágy profil, a görbe, pixelkorlátok, lapítás; távolsági levágás közeli, távoli és síkbeli; takarás és a terep mögötti elrejtés; a szelet; a vászon mérete; a hőfelbontás; csoportlátszás és előjelek; a különbség-felosztás; Mind / Lejátszás; az előzmény; az oszlopszűrők és az Entitások kijelölése; a félpontos erősítés | Újraindítás. |
| **Ablak** – az időtartomány | a lejátszófej mozgása; az Élettartam tartalék és elhalványulás | Kiterjesztés (halmozott) vagy mozgóátlag (csúszó). |
| **Összeállítás** – csak a színezés | telítés, sűrűségválasz, minimális hő, a színskálák; a pálya vágása; rács és tengelyek; a dobozos visszajátszás beállításai és munkamenete; mélységélesség | Újrarajzolás a hő érintése nélkül. |

A kamera mozgatása mindig újraindít. Így a telítés vagy a skála húzása ingyenes; a sprite-sugár húzása minden lépésnél újraindítja a konvergenciát.
