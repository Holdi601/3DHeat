---
title: "Kameraútvonal és videó"
nav_order: 15
lang: "hu"
source: "camera-path-and-video.md"
source_hash: "1863f90ba4b7"
translated: true
outdated: false
---

# Kameraútvonal és videó

Készítsen filmet az adatairól: néhány helyre állítja a kamerát, a megjelenítő ezek között repül, és videót ment. Minden képkocka nagyon tiszta, szemcsementes. A kamera és a lejátszófej együtt mozog, így ugyanez a panel időzített felvételt is készít ([`PathPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/PathPanel.tsx), [`campath.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/campath.ts), [`record.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/record.ts)).

## Repülő bejárás készítése {#make-a-flythrough}

1. Repüljön oda, ahol a film kezdődik, és nyomja meg a **Kulcskocka hozzáadása itt** gombot a **Kameraútvonal és renderelés** részben.
2. Repüljön a következő helyre, és nyomja meg újra. Ismételje minden megállónál.
3. Pipálja be az **Előnézet az útvonal mentén** opciót, és húzza a **Pozíció az útvonalon** csúszkát a mozgás ellenőrzéséhez.
4. Állítsa be az **Időtartam** értékét (milyen hosszú a videó). A helyes, de túl gyors mozgáshoz csak hosszabb időtartam kell.
5. Nyomja meg a **Videó renderelése** gombot. Várja meg a haladási sort; a fájl a végén letöltődik.

![A Kameraútvonal és renderelés panel három kulcskockával, Lágy interpolációval, 12 s-mal, 30 fps-sel és 16 Mbps-sel](../assets/img/en/camera-path-panel.webp)

## Kulcskockák {#keyframes}

| Vezérlő | Hatás |
|---|---|
| **Kulcskocka hozzáadása itt** | Hozzáfűzi a jelenlegi kamerapozíciót, yaw-t, pitch-et és látószöget kulcskockaként. |
| **Törlés** | Eltávolítja az összes kulcskockát. |
| Kulcskocka-lista | Soronként egy kulcs: a száma (kattintásra a kamera odarepül, a látószöget is beállítva), a pozíció, `yaw° / pitch°`, és egy **×** az eltávolításhoz. |

A kulcsok egyenletesen oszlanak el a normalizált útvonaltengely mentén 0 és 1 között, valahányszor egyet hozzáadnak vagy eltávolítanak; a kimeneti időtartam ekkor nyújtja a teljes mozgást, így a helyes, de túl gyors felvételhez csak hosszabb időtartam kell. A yaw a kulcsok között ki van tekerve, hogy a kamera a rövidebb úton forduljon.

Kulcskockák nélkül a renderelés a jelenlegi kamerát a teljes klipen mozdulatlanul tartja – ez egy tökéletesen jó időzített felvétel.

## Útvonal-beállítások {#path-settings}

| Vezérlő | Alapérték | Tartomány (jog) | Jelentés |
|---|---|---|---|
| **Interpoláció** (2+ kulcs) | *Lágy* | *Lágy* / *Egyenes* | *Lágy*: a kulcsokon átmenő köbös Hermite-görbe, az érintők a szomszédos kulcsokból, így a sebesség minden kulcsnál illeszkedik, és nincs rántás a szakaszok találkozásánál. *Egyenes*: egyenes szakaszok a kulcsok között, kiszámítható, minden kulcsnál látható sarokkal. A látószög mindig lineárisan interpolálódik. |
| Mozgásvonal (2+ kulcs) | | | `N egység út – M másodpercenként ennél az időtartamnál`, vagy egy megjegyzés, hogy a kulcsok mind egy helyen vannak. |
| **Előnézet az útvonal mentén** (1+ kulcs) | ki | | A nézetablak kameráját az útvonalról vezérli, és a lejátszófejet a renderelés módján mozgatja vele, így a mozgás a renderelés előtt megítélhető. |
| **Pozíció az útvonalon** (előnézet közben) | 0% | 0–100% | Az útvonal melyik pontján legyen az előnézet. |
| **Időtartam** | 12 s | 1–120 s (3600) | A videó hossza. |
| **Képkockasebesség** | 30 fps | 6–60 (240) | |
| **Bitráta** | 16 Mbps | 1–60 Mbps, logaritmikus (400) | A hő-átmenetek alacsony bitrátánál rosszul sávosodnak: kevés részlet van, amely mögé a kodek a hibát rejthetné. |
| **Konvergenciavárakozási korlát** | 240 képkocka | 2–600 (10 000) | A leghosszabb idő, amennyit egy kimeneti képkocka pontossá válásra várhat. Az elérő képkockák is íródnak, és számolódnak. |
| Összegzés | | | `N képkocka · ablak: halmozott/rögzített/élettartam`, és ha az idővonal Mind módban van: *(a renderelés a Mind módot Lejátszásra váltja, hogy a lejátszófej jelentést kapjon)*. |
| **Videó renderelése** / **Mégse** | | | Elindítja a renderelést; futás közben megmutatja: `képkocka i / n · várt w · X MB`, és hány képkocka nem volt pontos. Adatkészlet kell hozzá. |

## Tippek {#tips}

- A kimeneti méret a vászon mérete eszközpixelben (a kijelző pixelaránya, legfeljebb 2). A böngészőablak átméretezésével változtatható.
- A halmozott előzmény a hőt a klip során építi fel; az ablak- vagy élettartam-előzmény az idő mozgó szeletét mutatja.
- A kulcskocka-pozíciók megjelenítési koordináták: a [megfordított világtengellyel](camera.md#invert-world-axis) a váltás előtt készült kulcsok a váltás után máshová mutatnak.

## Fejlesztőknek {#for-developers}

### Mit csinál egy renderelés {#what-a-render-does}

1. Próbafelvételt készít a képkockáról, hogy megtudja a pontos kimeneti méretet eszközpixelben.
2. Kodeket választ a WebCodecs-en keresztül: **VP9** (`vp09.00.10.08`), különben **VP8**, a választott bitrátával és képkockasebességgel. `VideoEncoder` nélkül ezzel áll le: *Ez a böngésző nem rendelkezik VideoEncoder-rel – a videó írásához WebCodecs szükséges*; mindkét kodek nélkül: *Nincs támogatott videokodek (VP9-et, VP8-at próbáltuk)*.
3. Átveszi a renderelés által szükséges beállításokat: szünetelteti a lejátszást, az **adaptív keretet kikapcsolja**, a **progresszív finomítást bekapcsolja**, a sprite-keretet pedig képkockánként 64M-ra állítja (az adaptív keret a képkockasebességet védené, ami itt rossz cél: minden lassan konvergáló képkockát ritkább sorrajzolás okának látna, amihez több képkocka kell a konvergáláshoz), és az idővonalat **Mind** módból **Lejátszás** módba kapcsolja. Az előzmény-beállítás (halmozott, ablak, élettartam) változatlan marad: a renderelés az a dolog, amit éppen néz, végigjátszva és lejegyezve.
4. Minden *f* kimeneti képkockára a *n*-ből, *u* = f / (n - 1) mellett:
   - a kamerát az útvonal *u*-nál lévő pozíciójába helyezi (ha vannak kulcsok);
   - a lejátszófejet az idővonal tartományának ugyanazon *u* törtrészére tekeri (a kijelölt munkamenet tartománya a dobozos visszajátszásban);
   - friss becslést kényszerít ki, akkor is, ha a kamera nem mozdult – az előző képkocka halmozásának átvétele az előző ablak szellemképét hagyná;
   - képkockánként vár, amíg a kép pontos (minden jelölt sor egy képkockában kirajzolva, vagy a halmozás kész), a várakozási korlátig;
   - rögzíti az összeállított képkockát, és kódolja, minden 2 másodperc kimenet után kulcskockával, hogy a fájl tekerhető legyen.
5. A képkockákat WebM-fájlba csomagolja ([`webm.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webm.ts)), a képkockasebességből választott időbélyegekkel – az, hogy egy képkocka falióra szerint mennyi ideig tartott, lényegtelen.
6. Visszaállítja a keretet, a látószöget, az idővonal módját, a lejátszófejet és azt, hogy futott-e a lejátszás.
7. A videót `3dheat-<szélesség>x<magasság>-<képkockák>f.webm` néven tölti le, és ezt jelenti: `N képkocka W×H méretben, X MB – minden képkocka pontos`, vagy hogy hány érte el a várakozási korlátot.

A **Mégse** az aktuális képkocka után áll meg (*Renderelés megszakítva.*), és visszaállítja a beállításokat.
