---
title: "Pálya megjelenése"
parent: "Pályák és háttérgeometria"
nav_order: 3
lang: "hu"
source: "level-appearance.md"
source_hash: "c883749baedd"
translated: true
outdated: false
---

# Pálya megjelenése

Ezek a vezérlők megváltoztatják, hogyan néz ki egy 3D-s pálya, hogy a hő kiemelkedjen belőle, és a helyet továbbra is olvashassa. Semmi itt nem változtatja meg az adatokat.

## Gyors kezdés {#quick-start}

1. Töltsön be egy 3D-s pályát ([3D-s pályák](model-levels.md)).
2. A **Háttér / pálya** részben csökkentse a **Fényerő** értékét, amíg a hő a legfényesebb dolog a képernyőn.
3. Nyissa meg a **Talajdomborzat** részt, és emelje a **Lejtőárnyékolás** vagy a **Szintvonalak erőssége** értékét, amíg meg tudja különböztetni a dombot a síktól.
4. Nyissa meg az **Építmények** részt. Csökkentse a **Lapok átlátszatlanságát**, hogy lássa az épületek belsejét, vagy kapcsolja be az **Építménytextúrát**, hogy tömörnek lássa őket.
5. Ha a talajra festett kép került, próbálja a **Talajtextúra** kikapcsolását és bekapcsolását.

![A Talajdomborzat és az Építmények szakasz nyitva, a pálya a domborzati jelekkel](../assets/img/en/level-appearance-sections.webp)

Egy betöltött [3D-s pálya](model-levels.md) mellett a Háttér / pálya panel mutatja ezeket a vezérlőket. Az alapértékek azok, amelyeket egy frissen importált pálya kap ([`modelLevelFrom`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/LevelPanel.tsx), [`level.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts)). Ezek megváltoztatása csak újrarajzolja a jelenetet; a hő halmozása megmarad.

## Az egész pálya {#the-whole-level}

| Vezérlő | Alapérték | Tartomány | Jelentés |
|---|---|---|---|
| **Átlátszatlanság** | 100% | 0–100% | 100% alatt a pálya keverődik, és nem ír mélységet, így többé nem [takarja](depth-and-culling.md) a hőt. |
| **Fényerő** | 0,9 | 0–2 (jog 64) | |

A pálya telítetlenül rajzolódik – szürke talaj, színezett héj –, így a hő az egyetlen telített dolog a képernyőn. A [térképképtől](map-images.md) eltérően a 3D-s pályának nincs telítetlenítő csúszkája.

## Talajdomborzat {#ground-relief}

Messziről a domb és a sík ugyanolyan szürkének látszik, ezért a megjelenítő három segítséget ad. Mindegyik más hibára válaszol:

| Vezérlő | Alapérték | Jelentés |
|---|---|---|
| **Szintvonalköz** | a talaj magasságtartományából | A szintvonalak közötti magasság, logaritmikusan, a pálya magasságtartományának 1/4000-étől 1/2-éig; a sáv alja *ki*. Az alapérték a talaj magasságtartományának 1/40-e, 1/2/5 lépésre kerekítve – a 10 m-es vonalak egy hegyoldalnak jók, egy kőbánya padlóján haszontalanok. Minden 5. vonal erősebben rajzolódik. A szintvonalakat képernyőkoordinátákban rajzoljuk, így minden nagyításnál egy pixel vastagok, és ezek az egyetlen jelzések, amelyek túlélik azt a talajt, amely túl lapos ahhoz, hogy egyáltalán árnyékolni lehessen. |
| **Szintvonalak erőssége** | 35% | 0–100% |
| **Lejtőárnyékolás** | 55% | A meredekség szerint sötétít, így a partok és a szirtek bármilyen kameraszögből olvashatók – ellentétben a fényforrással, amely szembenézve elsimul. |
| **Magassági színskála** | 50% | Az alacsony talaj sötétebb, a magas világosabb, a talaj magasságtartományában: a nagy léptékű forma. |

A szakasz fejléce mutatja a szintvonal állapotát: *minden N m*, a szintvonalköz, vagy *nincs szintvonal*, ha a köz ki van kapcsolva.

## Talajfelület {#ground-surface}

| Vezérlő | Alapérték | Akkor látszik, ha | Jelentés |
|---|---|---|---|
| **Víz** | be | a pályán van víz | Tavak, folyók és a tenger, laposan, halvány kék-szürkével rajzolva: a domborzati jelzések egyike sem alkalmazható egy olyan felületre, amely definíció szerint sík. |
| **Víz átlátszatlansága** | 60% | a víz be van kapcsolva | A partvonal és a sekélyek alatti talaj átlátszó vízen át látszik. |
| **Talajháromszögek** | 30% (0 textúrázott pályánál) | mindig | A domborzat saját élei az árnyékolt felület fölött, a kamerától a pálya szélességének 6%-a és 25%-a között elhalványodva. Megmutatja, mennyire durván mintavételezték a talajt, és ad valamit, amivel a lejtőn a távolságot meg lehet ítélni. Az első használatkor épül fel, ami nagy pályánál egy pillanatba telik. |
| **Talaj csak drótvázként** | ki | mindig | A domborzati felületet az éleivel helyettesíti. Teljesen sematikus – a árnyékolást, a szintvonalakat és a takarást is elveszíti, ezért a *Talajháromszögek* általában a jobb választás. |
| **Talajtextúra** | be | a pályán vannak textúrák | A talajt a fájl textúráiban rajzolja (aszfalt, padka, fű). A háló megvilágítása finoman rajta marad, mert a textúra már hordozza a saját finom domborzatát. A **Fényerő** a módja annak, hogy a hő alatt csendesítse; a telítetlenítés a térképképekhez tartozik. |
| **Rögzített szín** | ki | a pályán vannak csúcsszínek | A talajt a szkennelés által rögzített színnel árnyékolja a szürke helyett – egy rekonstruált út egyébként nem különböztethető meg a padkától. A motorexportokban nincs; ha hiányzik, a panel ezt írja ki: *Ez a pálya nem hordoz színt.* |

## Építmények {#structures}

Az **Építmények** fejléce az építményháromszögek számát mutatja; az alatta lévő tipp elmondja, hogyan rajzolódnak (*tömören, saját textúrájukban rajzolva* vagy *átlátszó héjként, hogy lássa a bennük lévő hőt*), és hány alkatrész építmény.

| Vezérlő | Alapérték | Jelentés |
|---|---|---|
| **Építménytextúra** | be, ha az építmények textúrát hordoznak | Az építmények tömören, saját textúrájukban rajzolása. Bekapcsolva a lapok átlátszatlanságát 100%-ra állítja, és kikapcsolja az éleket; kikapcsolva visszatér a színezett, 25%-os átlátszó héjhoz. A textúrázott építmény arról az oldalról kapja a megvilágítást, amely felé a kamera néz, mert egy tábla két, egymásnak háttal álló lap, és hogy melyik nyer a mélységteszten, az kerekítésen múlik. |
| **Drótvázélek** | be; 300 000 építményháromszög felett vagy textúrázott esetben ki | Az építmények egyesített élei, élenként egy vonal. |
| **Élek átlátszatlansága** | 50% | |
| **Héjlapok** | be | Halvány felület fényes Fresnel-peremmel, így az épület térfogatként olvasódik, nem ketrecként vagy ködfoltként. |
| **Lapok átlátszatlansága** | 25% (35% 300 000 építményháromszög felett, 100% textúrázottnál) | 0–60% a sávon, a fogantyúval 100%-ig. Tartsa alacsonyan: a tömör építmények elrejtik a bennük lévő adatokat. |
| **Éles élek** | be (textúrázott esetben ki) | Minden háromszöget a saját normálvektora szerint árnyékol, amelyet a töredékshader számol a képernyőtéri deriváltakból. Az exportált pályák összehegesztettek és átlagolt normálvektorokat hordoznak, ami minden dobozsarkot „olvadt fóliává” kerekít; minden csúcs szétválasztása ezt javítaná, de megsokszorozná a csúcspuffert. Kapcsolja ki olyan pályánál, ahol a görbült felületek fontosabbak a sarkoknál. |
| **Építmények színezése** | Cián | Színválasztó és az előre beállítások: **Cián**, **Borostyán**, **Ibolya**, **Fehér**. |
| **Alkatrészek osztályozásának megjelenítése (N)** | | Minden alkatrész, osztálya és oka; lásd [3D-s pályák](model-levels.md#ground-structures-and-water). |

## A pálya vágása {#cutting-the-level}

A [Szelet](slice.md) és – a *Pálya vágása is* beállítással – a [távolsági levágás](depth-and-culling.md#distance-culling) ugyanazokon a síkokon vágja a talajt, az építményeket és a vizet, mint a hőt.
