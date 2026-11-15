---
title: "Mélység és kihagyás"
parent: "Hőmódok"
nav_order: 4
lang: "hu"
source: "depth-and-culling.md"
source_hash: "436ac15a9b3d"
translated: true
outdated: false
---

# Mélység és kihagyás

A mélység miatt a dombok és falak elrejtik mögöttük a hőt, ahogy egy valódi fal elrejt egy embert. A távolsági levágás a kamerától egy közeli és egy távoli távolság közé eső hőt tartja meg.

![Alacsony kamera egy domb mögött, a Terep mögötti elrejtés kikapcsolva (balra) és bekapcsolva (jobbra)](../assets/img/en/depth-and-culling-terrain.webp)

![Távolsági levágás a Távoli értékkel 400 m-nél és a pálya vágásával bekapcsolva: a térkép egy szelete a kamera körül](../assets/img/en/depth-and-culling-far.webp)

Mélység nélkül a hőtérkép egy 3D-s [pályán](levels.md) lapos réteg: minden, amit az adatkészlet tartalmaz, teljes erővel világít át minden falon, a pálya által adott mélységjelzések elvesznek, és egy épületen belüli forrópont ugyanúgy néz ki, mint a tetején lévő. A **Mélység** szakasz arra készteti a pályát, hogy elrejtse, ami mögötte van; a **Távolsági levágás** a hőt a kamera körüli héjra vagy lapra korlátozza; a [Szelet](slice.md) kivág egy lapot a világból. Mindhárom a hőmódokra hat, és azt változtatja meg, mely sorok járulnak hozzá, ezért változtatásuk újraindítja a halmozást.

## Mélység {#depth}

Mindkét vezérlőhöz [pálya](levels.md) kell – térképkép vagy 3D-s modell. Pálya nélkül nincs, ami mögött lehetne valami, így nem tesznek semmit. Mindkettő ki van kapcsolva, amíg a [Lapos a talajsíkon](sprite-shape.md#flatten-onto-ground-plane) be van kapcsolva.

### Elrejtés a terep mögött {#hide-behind-terrain}

**Elrejtés a terep mögött** (alapértelmezésben be): az az adatpont, amelynek a kamera felé eső legközelebbi felülete a *talaj* (nem szerkezet), teljesen eldobódik, nem csak elhalványul.

A terep és a falak másként átlátszatlanok. A falon szándékosan *át* lehet nézni, hogy lássuk, melyik szinten zajlott a forgalom; egy domb mögött viszont soha nem akarunk átnézni, mert mögötte a térkép másik fele van – ami kilométerekre kiterjedő térképen az adatok nagy része, és a horizont mentén összeadódva fényesebb sávot ad, mint bármi az előtérben. Egy halványító nem tud mindkettőt kiszolgálni, ezért a terepnek van határértéke, a falak pedig a halványító alatt maradnak.

### Geometria mögött rejtve {#hidden-behind-geometry}

**Geometria mögött rejtve** (alapértelmezés 0,8): mennyire nyomja el a pálya geometriája mögött lévő adatpontot. Az érték 0-nál *átlátszik*, a köztes értékeknél *N%-kal halványabb* (a csúszka állása, nem a mért halványítás), 1-nél *teljesen rejtve*.

Minden fal vagy padló a pont és a kamera között tovább halványítja: egy fal az alapértelmezésnél néhány százalékot hagy, és minden további felület felezi a maradékot, legfeljebb négy felületig. 1-nél a geometria mögötti semmi sem rajzolódik ki, és ez a legolcsóbb beállítás.

Lásd még: [Pálya megjelenése](level-appearance.md).

## Távolsági levágás {#distance-culling}

A **Távolsági levágás** (alapértelmezésben zárva) a hőt a kamerától mért közeli és távoli határ közé eső sorokra korlátozza. Távoli határt állítson be, hogy egy épületen belüli sűrűséget úgy olvashasson le, hogy a térkép távoli fele ne adódjon rá; közeli határt állítson be, hogy egy forróponton *át* repüljön, ne bele.

| Vezérlő | Alapérték | Tartomány (jog) | Jelentés |
|---|---|---|---|
| **Közeli** | ki | 0,5–5000 m, logaritmikus; a sáv alsó 5%-a = ki (200 000) | Ennél közelebbi sorok kimaradnak. |
| **Távoli** | ki | 1–200 000 m, logaritmikus; alja = ki (10 000 000) | Ennél távolabbi sorok kimaradnak. |
| **Vágás síkkal** | be | | A határokat a nézési tengely mentén mérjük, nem a szemtől, így a vágás a képernyővel párhuzamos sík lesz, nem egy gömb körülötted. A gömb széle a képkockán át elfordul, és minden fordulásnál elcsúszik; a sík ott marad, ahová tette. |
| **A pálya vágása is** | be | | A talajt, a szerkezeteket és a vizet ugyanezekkel a határokkal vágja. Ha a pálya egészben marad, a vágás kiveszi az adatpontokat, és az épület áll előttük; ha mindkettőt vágjuk, a térkép egy metszete lesz, és a pontok a falukhoz és padlóikhoz simulnak. Ez csak újrarajzolja a képet; nem indítja újra a halmozást. |

### Billentyűzet {#keyboard}

A távoli határ olyan vezérlő, amelyet végigpásztáz – végigvezeti egy épületen, és nézi, melyik szinten jelenik meg a forgalom –, ezért repülés közben a billentyűzeten van ([`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx)):

| Billentyű | Hatás |
|---|---|
| `]` | A távoli határt 1,12-szeresével kitolja (Shift: 1,35) |
| `[` | Ugyanekkora tényezővel behúzza |
| `\` | Kikapcsolja a távoli határt, vagy visszakapcsolja ott, ahol hagyta (első alkalommal 6000) |

A lépések geometriaiak, mert a hasznos tartomány négy nagyságrendet ölel fel, egy szobától a térképig. A billentyűzet a távoli határt 100 és 400 000 között tartja. A billentyűk nem tesznek semmit, amíg szövegmező vagy menü van fókuszban.

## Fejlesztőknek {#for-developers}

### Elrejtés a terep mögött {#hide-behind-terrain}

A szerkezeteket saját mélységtextúrába rajzoljuk. Az a töredék, amely a jelenet mélysége *mögött*, de *nem* a szerkezetek mélysége mögött van, a talaj mögött van, és eldobjuk. Ez egy mélységmenetet jelent a szerkezeteken, amelyet kikapcsolt kapcsolónál kihagyunk.

### Geometria mögött rejtve {#hidden-behind-geometry}

**Felületenként** számoljuk. Egyetlen mélységösszehasonlítás csak azt tudja megmondani, hogy „valami van elöl”, így egy fal mögötti pont és egy épületbelső négy szobán át lévő pontja ugyanúgy halványulna, és a belső egyetlen halvány foltnak látszana. Ehelyett a szerkezet-geometriát legfeljebb 3 további rétegre **mélységhámozzuk** ([`HEAT_DEPTH_LAYERS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)); minden töredék megszámolja, hány felület van előtte (a jelenet saját mélysége plusz a hámozott rétegek: legfeljebb négy), és a halványítás összeadódik:

```
erősség       = 1 - (1 - csúszka)²                 (csúszka 1 → 1)
láthatóság    = (1 - erősség) × 0,5 ^ (felületek - 1)
láthatóság    = max(láthatóság, 0,006)             (nincs alsó határ 1-nél)
```

| Csúszka | 1 felület | 2 | 3 | 4 |
|---|---|---|---|---|
| 0,5 | 25% | 12,5% | 6,25% | 3,1% |
| 0,8 (alapérték) | 4% | 2% | 1% | 0,6% (alsó határ) |
| 1,0 | nem rajzolódik ki | nem rajzolódik ki | nem rajzolódik ki | nem rajzolódik ki |

Miért két tényező: a csúszkát úgy kalibráltuk, hogy egy fal néhány százalékot hagyjon – ez az a megjelenés, amely „valami mögött” olvasható –, és néhány százalék összeszorozva a harmadik falnál semmi lenne; minden további felület felezése négy megkülönböztethető lépcsőt tart meg. Miért négyzetes: a lineáris változatnál egy fal mögött a telített mező telített maradt; a negyedik hatvány 0,8-nál kitörölte. Miért van alsó határ: ha a takart hőt teljesen elrejtjük, egy rejtett forgalommal teli szoba üres szobának látszik, és semmi nem sugallja, hogy a [Szelethez](slice.md) nyúljunk. Csak az 1-re rögzített csúszka rejti el teljesen – és ez a legolcsóbb beállítás, mert a takart pontokat ekkor eldobjuk.

Hogyan ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts), a pontos hő shaderei): az összehasonlítás töredékenként történik, a jelenet mélységtextúrájával szemben, **ablakmélységben**, nem világtávolságban. Néhány illesztőprogramon (köztük az ANGLE szoftveres rasztere) a csúcsshaderben végzett mélységtextúra-olvasás mindenhol „távolt” ad, és ha mindkét mélységet méterekre linearizáljuk, széles közeli/távoli tartománynál a pontosság miatt elveszik az elválasztás. Az eltolás egy sprite-sugár ablakegységekre váltva, plusz néhány legkisebb helyiértékű bit, így egy felületen fekvő adatpont nem árnyékolja le önmagát.

A szerkezeteket átlátszóan rajzoljuk, de abba a mélységbe rajzoljuk, amelyből a takarás olvasódik; ha egy pálya szerkezetei nem jutnának el a mélységtextúrába, a takarás csak a talajjal szemben működne.

### Távolsági levágás {#distance-culling}

Mindkét határt a csúcsshaderben értékeljük ki, így egy levágott sor egy csúcsba kerül, töredékekbe nem.
