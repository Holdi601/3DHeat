---
title: "Déift a Ausblenden"
parent: "Hëtztmodi"
nav_order: 4
lang: "lb"
source: "depth-and-culling.md"
source_hash: "436ac15a9b3d"
translated: true
outdated: false
---

# Déift a Ofstandsgrenzen

Déift mécht, datt Bierger a Mauere d'Hëtzt hannendrun verstoppen, wéi eng richteg Mauer e Mënsch verstoppt. Ofstandsgrenzen halen nëmme d'Hëtzt tëscht enger nooer an enger wäiter Distanz vun der Kamera.

![Eng niddereg Kamera hannert engem Bierg, mat Hannert dem Terrain verstoppen aus (lénks) an un (riets)](../assets/img/en/depth-and-culling-terrain.webp)

![Ofstandsgrenzen mat Wäit op 400 m an De Level och schneiden un: eng Schiicht vun der Kaart ronderëm d'Kamera](../assets/img/en/depth-and-culling-far.webp)

Ouni Déift ass eng Hëtztkaart iwwer engem 3D-[Level](levels.md) eng flaach Iwwerlagerung: alles, wat den Datesaz enthält, glänzt duerch all Mauer mat voller Stäerkt, d'Déiftenhiweiser, déi de Level gëtt, falen fort, an eng Hotspot bannen an engem Gebai gesäit selwecht aus wéi een op sengem Daach. De Bereich **Déift** léisst de Level verstoppen, wat hannendrun ass; **Ofstandsgrenzen** beschränkt d'Hëtzt op eng Schuel oder eng Plack ronderëm d'Kamera; de [Schnitt](slice.md) schneit eng Plack aus der Welt. All dräi gëllen fir d'Hëtztmodi a änneren, wéi eng Zeilen mitzielen; dofir fänkt d'Accumulatioun nei un, wann een se ännert.

## Déift {#depth}

Béid Reglage brauche e [Level](levels.md) - eng Kaartbild oder en 3D-Modell. Ouni gelueden Level gëtt et näischt, wat hannendrun wier, an si maachen näischt. Béid sinn ausgeschalt, wann [Op de Buedenebene flaachmaachen](sprite-shape.md#flatten-onto-ground-plane) un ass.

### Hannert dem Terrain verstoppen {#hide-behind-terrain}

**Hannert dem Terrain verstoppen** (Standard un): e Dateepunkt, deem seng nootgelee Fläch Richtung Kamera de *Buedem* ass (kee Gebai), gëtt ganz fortgeholl, net nëmme gedämpft.

Terrain a Mauere sinn op verschidde Manéier duerchsiichteg. Dir kuckt *duerch* eng Mauer mat Absicht, fir ze gesinn, op wéiem Stack de Verkéier war; Dir wëllt ni duerch e Bierg kucken, well dohannert d'Rëndsäit vun der Kaart ass - a bei enger Kaart, déi Kilometer breet ass, ass dat d'Mëschtdeel vun den Daten, a si addéieren sech laanscht den Horizont zu engem Band, dat hell ass wéi alles am Virdergrond. En Dämpfer kann net béides déngen, dofir kritt d'Terrain eng Grenz, an d'Mauere bleiwen ënner dem Dämpfer.

### Hannert Geometrie verstoppt {#hidden-behind-geometry}

**Hannert Geometrie verstoppt** (Standard 0,8): wéi staark e Dateepunkt, deen hannert Level-Geometrie läit, ënnerdréckt gëtt. De Wäert heescht *weist duerch* bei 0, *N % méi däischter* dertëscht (d'Positioun vum Schieber, net déi gemooss Dämpfung), *ganz verstoppt* bei 1.

All Mauer oder Buedem tëscht engem Punkt an der Kamera dämpft en nach méi: eng Mauer léisst beim Standard e puer Prozent iwwreg, an all extra Fläch hallwiert, wat bleift, bis zu véier Flächen. Bei 1 gëtt näischt hannert der Geometrie gezeechent, an dat ass déi billegst Astellung.

Kuckt och [Level-Ausgesinn](level-appearance.md).

## Ofstandsgrenzen {#distance-culling}

**Ofstandsgrenzen** (standardméisseg zou) beschränken d'Hëtzt op d'Zeilen tëscht enger nooer an enger wäiter Grenz vun der Kamera. Stellt eng wäit Grenz, fir d'Dicht an engem Gebai ze liesen, ouni datt déi wäit Säit vun der Kaart drop sëtzt; stellt eng nooer Grenz, fir *duerch* en Hotspot ze fléien anstatt an en.

| Reglage | Standard | Beräich (Schiebe) | Bedeitung |
|---|---|---|---|
| **No** | aus | 0,5-5000 m, logaritmesch; déi ënnescht 5 % vun der Spuer = aus (200.000) | Zeilen, déi méi no sinn, ginn iwwersprongen. |
| **Wäit** | aus | 1-200.000 m, logaritmesch; ënnen = aus (10.000.000) | Zeilen, déi méi wäit sinn, ginn iwwersprongen. |
| **Un enger Fläch schneiden** | un | | D'Grenze laanscht d'Siichtachs miessen anstatt vum Aen aus, sou datt de Schnitt eng Fläch ass, parallel zum Écran, an net eng Kugel ronderëm Iech. De Rand vun enger Kugel biegt iwwer de Rumm ewech a rutscht, wann Dir Iech dréint; eng Fläch bleift do, wou Dir se hält. |
| **De Level och schneiden** | un | | De Buedem, d'Gebaier a d'Waasser an deenselwechte Grenze schneiden. Wann de Level ganz bleift, nëmmen d'Dateepunkten ewechhuelen, an d'Gebai steet virun hinnen; mat béidem geschnidden ass et e Schnitt duerch d'Kaart, an d'Punkten leien un hire Mauere a Plaaschen. Dës nëmmen zeechent nei; si fänkt d'Accumulatioun net nei un. |

### Tastatur {#keyboard}

D'Wäit Grenz ass e Reglage, dat Dir duerchfuert - gitt mat hir duerch e Gebai a kuckt, op wéiem Stack de Verkéier erschéngt -, dofir ass se op der Tastatur, wärend Dir fléien ([`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx)):

| Tast | Effekt |
|---|---|
| `]` | D'Wäit Grenz no baussen dreiwen um en Faktor 1,12 (Shift: 1,35) |
| `[` | Se mat deem selwechten Faktor no bannen zéien |
| `\` | D'Wäit Grenz ausmaachen, oder erëm un bei der Distanz, wou se ofgelooss gouf (am Ufank 6000) |

D'Schrëtt sinn geometresch, well den nëtzlechen Beräich véier Gréisstenuerdnungen ëmfaasst, vun engem Zëmmer bis zu enger Kaart. D'Tastatur hält d'Wäit Grenz tëscht 100 an 400.000. D'Tasten maachen näischt, wann e Textfeld oder en Menü den Fokus huet.

## Fir Entwéckler {#for-developers}

### Hannert dem Terrain verstoppen {#hide-behind-terrain}

D'Strukturen ginn an eng eege Déifentextur gezeechent. E Fragment, dat hannert der Déift vun der Szen ass, awer *net* hannert der Déift vun den Strukturen, läit hannert dem Buedem a gëtt fortgeworf. Dat kascht ee Déifdurchgang iwwer d'Strukturen, deen iwwersprongen gëtt, wann de Schalter aus ass.

### Hannert Geometrie verstoppt {#hidden-behind-geometry}

Et gëtt **pro Fläch** gezielt. E eenzege Déiftvergläich kann nëmmen soen "eppes ass virdrun", also wiedeems e Punkt hannert enger Mauer an e Punkt véier Zëmmer weit an engem Gebai géigesäiteg gläich gedämpft wieren, an de Bannenraum wier ee blasse Schmier. Dofir gëtt d'Strukturgeometrie **a bis zu 3 weider Schichten geschält** ([`HEAT_DEPTH_LAYERS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)); all Fragment zielt, wéi vill Flächen virdrun sinn (d'eege Déift vun der Szen plus d'geschälten Schichten: bis zu véier), a d'Dämpfung addéiert sech op:

```
strength      = 1 - (1 - slider)²                  (slider 1 → 1)
visibility    = (1 - strength) × 0.5 ^ (surfaces - 1)
visibility    = max(visibility, 0.006)             (no floor at slider 1)
```

| Schieber | 1 Fläch | 2 | 3 | 4 |
|---|---|---|---|---|
| 0,5 | 25 % | 12,5 % | 6,25 % | 3,1 % |
| 0,8 (Standard) | 4 % | 2 % | 1 % | 0,6 % (Buedem) |
| 1,0 | net gezeechent | net gezeechent | net gezeechent | net gezeechent |

Firwat zwee Faktoren: de Schieber ass so kalibréiert, datt eng Mauer e puer Prozent iwwreg léisst - d'Optik, déi "hannert eppes" liest -, an e puer Prozent, déi sech mat all Mauer multiplizéieren, wären an der drëtter Mauer näischt; d'Halbéiere pro weider Fläch hält véier auserneen erkennbar Schrëtt. Firwat quadréiert: linear ass en gesättegt Feld hannert enger Mauer nach ëmmer gesättegt bliwwen; eng véierte Potenz huet et bei 0,8 ausradéiert. Firwat e Buedem: wann verstoppt Hëtzt ganz fortgeholl gëtt, gesäit e Raum voller verstoppten Verkéier aus wéi e eidelen Zëmmer, ouni eppes, wat dozou bréngt, no dem [Schnitt](slice.md) ze gräifen. Nëmme wann de Schieber op 1 steet, gëtt se ganz verstoppt - an dat ass déi bëllegst Astellung, well verdeckt Punkten dann fortgeworf ginn.

Wéi ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts), d'Punkt-Hëtzt-Shaders): de Vergläich gëtt pro Fragment gemaach, géint d'Déifentextur vun der Szen, a **Fënster-Déift** an net Weltdistanz. Eng Déifentextur-Liesung am Vertex-Schrëtt liest op e puer Treiber "wäit" iwwerall (ANGLE sengem Software-Rasterizer ënner anerem), an d'Linearisatioun vu béiden Déiften a Meter verléiert d'Trennung duerch d'Genauegkeet bei enger breeder Nooer-/Wäitgrenz. D'Verschiebung ass eng Sprite-Radius, ëmgerechent a Fënstereenheeten, plus e puer Bits mat dem klenge Gewiicht, sou datt en Dateepunkt, deen op enger Fläch läit, sech selwer net beschiedt.

D'Strukture ginn duerchsiichteg gezeechent, awer si ginn an d'Déift gezeechent, un där d'Verdeckung liest; e Level, deem seng Strukturen d'Déifentextur net erreechen, géif nëmmen géint d'Terrain verdeckt ginn.

### Ofstandsgrenzen {#distance-culling}

Béid Grenze ginn am Vertex-Shader ausgewäert, sou datt eng ewechgeholl Zeil ee Vertex kascht an keng Fragmenter.
