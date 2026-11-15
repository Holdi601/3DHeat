---
title: "Kaartbiller"
parent: "Levelen an Hannergrondgeometrie"
nav_order: 1
lang: "lb"
source: "map-images.md"
source_hash: "d56614ef6bd1"
translated: true
outdated: false
---

# Kaartebiller

E Kaartebild ass e flaacht Bild - eng Minikaart, en Satellitefoto, e Grondrëss - ënner Är Daten geluecht, sou datt Dir gesitt, wou d'Hëtzt sëtzt. Dir sot dem Viewer, wou d'Bild higehéiert, andeem Dir zwee Punkte drop mat zwou Plazen op der Welt festmaacht (d'"Ankerpunkte").

## E Kaartebild lueden an ophänken {#load-and-place-a-map-image}

1. Lued als Éischt Är Daten ([Daten lueden](getting-data-in.md)).
2. Drëckt bei **Hannergrond / Level** op **Kaartebild…** a wielt d'Bild aus. Et gëtt iwwer d'Fläch vun den Daten gezunn.
3. Drëckt **Un d'Grenz vun den Donnéeën upassen**, wann d'Bild verréckelt gouf. Ankerpunkt 1 kënnt op déi ieweschte lénks Eck vum Bild, Ankerpunkt 2 op déi ënnescht riets Eck, an de Rand vun den Daten.
4. Wann d'Hëtzt net mam Bild iwwerastëmmt, wielt zwee Landmarken, déi wäit ausenee sinn (zum Beispill zwee géigeneenzeg Ecken vun engem Gebai oder zwou Kräizungen). Liest all Landmark hiren Pixel um Bild a seng Weltpositioun of (fuerht mam [Miessband](measure.md) iwwer se, fir **X** an **Z** ze liesen).
5. Gitt se an **Placéierung** an: fir **Ankerpunkt 1** d'**px**, **py**, **Welt X**, **Welt Z** vun der Landmark; dat selwecht fir **Ankerpunkt 2**.
6. Kontrolléiert: eng Spuer oder eng Hëtztstell, vun där Dir wësst, datt se op enger Strooss läit, sollt elo op där Strooss leien. Passt d'Zuelen un, bis et stëmmt.

![D'Sektioun Placéierung mat zwee Ankerpunkte an Hëtzt op engem Kaartebild gezeechent](../assets/img/en/map-images-placement.webp)

Déi zwee Landmarken mussen an beiden Pixelkolonnen an Pixelzeilen anescht sinn, soss seet d'Panel *D'Zwee Ankerpunkte stinn op der selwechter Pixelzeil oder Kolonn*.

## Lueden {#loading}

All Bildformat, dat de Browser entschlësselt. E Bild, dat no laanger Kant méi wéi **8192 px** huet, gëtt op 8192 erofgerechent (déi gréisst Kant, déi d'GPU gehale kritt), an d'Panel seet *Vun W×H op w×h erofgerechent*.

Beim Lueden gëtt d'Bild iwwer d'X-Z-Grenze vun den Daten gezunn (oder ±1000 Eenheeten ouni Datesaz), mat Norden uewen, op der niddregster Y vun den Daten. D'Standarden sinn **Deckkraaft** 100 %, **Hellegkeet** 0,7, **Entsättegen** 100 %, **Norden/Süden ëmdréinen** un: entsättegt a gedämpft, well d'Hannergrond seng Aufgab ass, datt Dir eng Hëtztstell fannt, net, datt se mat där konkurréiert.

## Reglage {#controls}

| Reglage | Standard | Beräich | Bedeitung |
|---|---|---|---|
| **Deckkraaft** | 100 % | 0-100 % | |
| **Hellegkeet** | 0,7 | 0-2 (Schiebe 64) | |
| **Entsättegen** | 100 % | 0-100 % | Grau Hannergrond, gesättegt Hëtzt. Faarf an der Kaart konkurréiert mat Faarf an den Daten. |
| **Norden/Süden ëmdréinen** | un | | Wéi eng Bildzeil den héchste Wäert vum Z vun der Welt ass. Wann een et ëmschaltt, wann e Datesaz gelueden ass, passt et d'Ankerpunkte nei op d'Grenz vun den Daten un. |
| **Placéierung**: Ankerpunkt 1, Ankerpunkt 2 | d'Bildecken op der Grenz vun den Daten | | All Ankerpunkt ass e Pixel op dem Bild - **px** (vu lénks, 0 bis zur Breet) an **py** (vu uewen, 0 bis zur Héicht) - an d'Weltkoordinaat, wou en ass, **Welt X** an **Welt Z**. Skala an Versatz kommen aus dem Pair. |
| **Un d'Grenz vun den Donnéeën upassen** | | | Setzt Ankerpunkt 1 op déi ieweschte lénks Eck vum Bild an Ankerpunkt 2 op déi ënnescht riets, op der X-Z-Grenz vun den Daten. E Startpunkt fir genau Placéierung. Brauch e Datesaz. |
| **Héicht** | déi niddregst Y vun den Daten | Min. Y vun den Daten - 500 bis Max. Y + 500 (Schiebe Max. Y + 100.000) | D'Héicht vun der Kaartefläch. Setzt se just ënner d'Daten, sou datt näischt vun hir verstoppt gëtt. |

D'Nimmzeil weist `Breet×Héicht px · x × z m/px`, d'Weltgréisst vun engem Pixel an all Achs.

## An der Szen {#in-the-scene}

D'Bild ass en eenzegt Rechteck mat Textur op der Héicht. Bei voller Deckkraaft schreift et Déift, a zielt also als Buedem bei der [Verdeckung](depth-and-culling.md) mat; ënner 100 % Deckkraaft gëtt et gemëscht an schreift keng Déift, also verdeckt et näischt. D'[Miessband](measure.md) miesst op senger Fläch. D'[Level-Bibliothéik](level-library.md) späichert e Bildlevel mat sengen Ankerpunkte.

## Dota 2-Kaart {#dota-2-map}

**Dota 2 map** nieft **Kaartebild…** hëlt d'Zeechnung vun der aktueller Dota-2-Kaart, déi [OpenDota](https://www.opendota.com) op senge Matchsäiten weist, a stellt se ënner Tabellen, déi den [Watcher](https://github.com/Holdi601/3DHeat-Watcher) aus Dota-2-Replays schreift ([`dotaMap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/tactics/dotaMap.ts)). D'Bild gëtt beim Drécken vum Knäppchen vun opendota.com geholl a gehéiert net zu 3DHeat; d'Zeechnung vum neiste Patch kënnt aus enger eegener Lëscht vun OpenDota, an d'Zeechnung vum Patch 7.40, wann d'Lëscht net gelies ka ginn.

| | |
|---|---|
| Quell | `opendota.com/assets/images/dota2/map/detailed_<patch>.webp`, 900×900 px |
| Placéierung | D'Kalibréierung vun OpenDota: d'Bild spannt Dota-Weltenheeten vun -8192 bis 8064 op béide Achsen (128-Eenheeten-Zellen 64 bis 191), Norden uewen. Mat den Achsen vun der Replay-Tabell (Z uewen, Y ëmgedréint) ass dat Welt X -8192 bis 8064 an Welt Z -8064 bis 8192. Ongeféier 18 Eenheeten pro Pixel. |
| Héicht | 0. Helden stinn op 0 bis ongeféier 600. |
| Ausgesinn | Hellegkeet 0,8, Entsättegen 50 %. |

Kontrolléiert op engem ëffentlechen Match-Replay vum Patch 7.40: all Held sengem Wee follegt den gezeechnete Lanen, an d'Tierm, d'Kasärnen a d'Ancienten, déi de Replay setzt, falen op déi gezeechent Basen. D'Usiicht **Uewen** weist d'Kaart mat Norden um ënneschten Enn vum Écran, wéi se all Z-uewen-Tabell mat ëmgedréinter Y weist.

D'Zeechnung ass vun OpenDota, vun der Kaart vu Valve; Valve steet net hannert 3DHeat. Eng 3D-Kaart vu Dota brauch d'installéiert Spill: kuckt d'Notizen vum Watcher zu Dota-2-Replays.

## Fir Entwéckler {#for-developers}

### Wéi d'Ankerpunkte d'Bild stellen {#how-the-anchors-place-the-image}

Vun [`mapQuadFromAnchors`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts), mat den Ankerpunkte *a* a *b*:

```
scaleX = (b.worldX - a.worldX) / (b.px - a.px)
scaleZ = (b.worldZ - a.worldZ) / (b.py - a.py)
pixel (0, 0) sits at  (a.worldX - a.px × scaleX,  a.worldZ - a.py × scaleZ)
```

Zwee Ankerpunkte leeën Skala an Versatz op all Achs eenzel fest, sou datt eng Kaart op X an Z anescht gestreckt ka ginn, awer net gedréint. D'Ankerpunkte mussen an **béiden** Pixelkoordinaten verschidde sinn; wann se eng Zeil oder eng Kolonn deelen, kann kee Mooss ausgerechent ginn, d'Kaart gëtt net gezeechent, an d'Panel seet *D'Zwee Ankerpunkte stinn op der selwechter Pixelzeil oder Kolonn*.
