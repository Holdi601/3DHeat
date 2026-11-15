---
title: "Immaġini tal-mappa"
parent: "Livelli u ġeometrija tal-isfond"
nav_order: 1
lang: "mt"
source: "map-images.md"
source_hash: "e7a4a651d75d"
translated: true
outdated: false
---

# Immaġini tal-mappa

Immaġni tal-mappa hi stampa ċatta - minimap, ritratt mis-satellita, pjanta ta' sular - imqiegħda taħt id-dejta tiegħek sabiex tara fejn tinsab is-sħana. Tgħid lill-viewer fejn għandha tmur l-istampa billi twaħħal żewġ punti fuqha ma' żewġ postijiet fid-dinja (l-"ankri").

## Tagħbija u poġġi immaġni tal-mappa {#load-and-place-a-map-image}

1. Tagħbi d-dejta tiegħek l-ewwel ([Tgħabbija tad-dejta](getting-data-in.md)).
2. F'**Sfond / livell**, agħfas **Immaġini tal-mappa…** u agħżel l-istampa. Titqiegħed imbiegħda fuq iż-żona tad-dejta.
3. Agħfas **Waqqaf mal-limiti tad-dejta** jekk l-istampa tkun tħarkat. L-ankra 1 tmur fuq il-kantuniera ta' fuq xellugi tal-istampa, l-ankra 2 fuq il-kantuniera t'isfel lemini, fit-truf tad-dejta.
4. Jekk is-sħana ma tallinjax mal-istampa, agħżel żewġ punti ta' referenza imbiegħda 'l xulxin (pereżempju żewġ kantunieri opposti ta' bini jew żewġ toroq). Aqra l-pixel ta' kull wieħed fuq l-istampa u l-pożizzjoni tiegħu fid-dinja (oqgħod fuq il-[linjal](measure.md) biex taqra **X** u **Z**).
5. Ikteb dawn fil-**Pożizzjonament**: għall-**Ankra 1** il-punt ta' referenza ta' **px**, **py**, **X tad-dinja**, **Z tad-dinja**; l-istess għall-**Ankra 2**.
6. Iċċekkja: traċċa jew punt sħun li taf li jinsab fuq triq għandu issa jkun fuq dik it-triq. Aġġusta n-numri sakemm ikun hekk.

![It-taqsima Pożizzjonament b'żewġ ankri u s-sħana mpittra fuq stampa ta' mappa](../assets/img/en/map-images-placement.webp)

Iż-żewġ punti ta' referenza jridu jkunu differenti kemm fil-kolonni kif ukoll fil-ringieli tal-pixels, inkella l-pannell jgħid *Iż-żewġ ankri jaqsmu ringiela jew kolonna ta' pixels*.

## Tagħbija {#loading}

Kull format ta' immaġni li l-browser jista' jiftaħ. Immaġni li t-tul l-iktar twil tagħha jkun ogħla minn **8192 px** titnaqqas għal 8192 (l-ikbar tul li l-GPU titlob iżżomm), u l-pannell jgħid *Mnaqqas minn W×H għal w×h*.

Meta titgħabba, l-immaġni titqiegħed fuq il-limiti X-Z tad-dataset (jew ±1000 unità mingħajr dataset), it-tramuntana 'l fuq, fl-l-iktar għoli Y tad-dataset. Id-defaults huma **Opaċità** 100%, **Luminożità** 0.7, **Neħħi s-saturazzjoni** 100%, **Aqleb tramuntana/nofsinhar** mixgħul: mingħajr saturazzjoni u iddarrab, għax il-ħidma tal-isfond hi li tħallik issib punt sħun, mhux li tikkompeti miegħu.

## Kontrolli {#controls}

| Kontroll | Default | Firxa | Tifsira |
|---|---|---|---|
| **Opaċità** | 100% | 0-100% | |
| **Luminożità** | 0.7 | 0-2 (jog 64) | |
| **Neħħi s-saturazzjoni** | 100% | 0-100% | Isfond griż, sħana saturata. Kulur fil-mappa jikkompeti ma' kulur fid-dejta. |
| **Aqleb tramuntana/nofsinhar** | mixgħul | | Liema ringiela tal-immaġni hi l-Z massimu tad-dinja. Jekk tibdlu b'dataset mgħobbi, l-ankri jerġgħu jitqiegħdu fuq il-limiti tad-dejta. |
| **Pożizzjonament**: Ankra 1, Ankra 2 | il-kantunieri tal-immaġni fuq il-limiti tad-dejta | | Kull ankra hi pixel fuq l-immaġni - **px** (mix-xellug, 0 sal-wisa') u **py** (mill-fuq, 0 sal-għoli) - u l-koordinata tad-dinja fejn tinsab, **X tad-dinja** u **Z tad-dinja**. Il-skala u l-offset jisegwu mill-par. |
| **Waqqaf mal-limiti tad-dejta** | | | Jqiegħed l-ankra 1 fuq il-kantuniera ta' fuq xellugi tal-immaġni u l-ankra 2 fuq dik ta' isfel lemini, fuq il-limiti X-Z tad-dejta. Bidu għall-pożizzjonament eżatt. Jeħtieġ dataset. |
| **Elevazzjoni** | l-iktar Y baxx tad-dataset | Y minimu tad-dejta - 500 sa Y massimu + 500 (jog Y massimu + 100,000) | L-għoli tal-pjan tal-mappa. Poġġih ftit taħt id-dejta sabiex ebda ħaġa ma tiġi moħbija minnu. |

Il-linja tal-isem turi `wisa'×għoli px · x × z m/px`, id-daqs tad-dinja ta' pixel wieħed f'kull assi.

## Fix-xena {#in-the-scene}

L-immaġni hi quad wieħed b'tekstura fl-elevazzjoni. Bl-opaċità sħiħa tikteb il-fond, u għalhekk tieħu sehem fl-[okkluzjoni](depth-and-culling.md) bħala art; taħt 100% opaċità titħallat u ma tikteb ebda fond, għalhekk ma taħbi xejn. Il-[linjal](measure.md) jkejjel fuq il-pjan tagħha. Il-[librerija tal-livelli](level-library.md) taħżen livell ta' immaġni bl-ankri tiegħu.

## Mappa Dota 2 {#dota-2-map}

**Mappa Dota 2** ħdejn **Immaġini tal-mappa…** tiġbed ir-rixma tal-mappa attwali ta' Dota 2 li [OpenDota](https://www.opendota.com) juri fuq il-paġni tal-partiti, u tqiegħdha taħt tabelli li l-[Watcher](https://github.com/Holdi601/3DHeat-Watcher) jikteb minn replays ta' Dota 2 ([`dotaMap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/tactics/dotaMap.ts)). L-immaġni tinġieb minn opendota.com meta jiġi mgħaffeġ il-buttuna, u mhix parti minn 3DHeat; ir-rixma tal-aħħar patch tittieħed mil-lista stess ta' OpenDota, u r-rixma 7.40 meta l-lista ma tistax tinqara.

| | |
|---|---|
| Sors | `opendota.com/assets/images/dota2/map/detailed_<patch>.webp`, 900×900 px |
| Pożizzjonament | Il-kalibrazzjoni ta' OpenDota: l-immaġni tgħaddi minn unitajiet tad-dinja ta' Dota -8192 sa 8064 fiż-żewġ assi (ċelloli ta' 128 unitajiet 64 sa 191), it-tramuntana fuq. Bl-assi tat-tabella tal-replay (Z 'l fuq, Y maqlub) dan hu X tad-dinja -8192 sa 8064 u Z tad-dinja -8064 sa 8192. Madwar 18 unità kull pixel. |
| Elevazzjoni | 0. L-eroj jiqfu minn 0 sa madwar 600. |
| Kulur | Luminożità 0.8, neħħi s-saturazzjoni 50%. |

Ikkontrollat fuq replay ta' partita pubblika tal-patch 7.40: it-traċċa ta' kull eroj issegwi t-toroq imdrawwa, u t-torrijiet, il-kwartieri u l-ancients li l-replay jqiegħed jaqgħu fuq il-bases imdrawwa. Il-veduta **Fuq** turi l-mappa bit-tramuntana f'isfel l-iskrin, kif turi kull tabella Z 'l fuq b'Y maqlub.

Ir-rixma hi ta' OpenDota, ta' mappa ta' Valve; Valve ma tapprovax 3DHeat.

### Il-mappa 3D {#the-3d-map}

Bid-Dota 2 installat, il-kmand [`dota-map`](https://holdi601.github.io/3DHeat-Watcher/dota-map.html) tal-Watcher (`python -m heat3d_watch dota-map -o dota.glb`) jagħmel il-mappa fi 3D mill-fajls tal-logħba stess: art, irdumijiet, ilma, siġar u bini, fl-unitajiet u l-assi tat-tabelli tar-replays. Għabbi l-fajl darba waħda b'**Mudell 3D…**: il-viewer jagħrfu mill-partijiet tiegħu (`ground:terrain`, `structure:tower`, `structure:ancient`, `structure:tree`; `isDotaLevel` f'`dotaMap.ts`), idaħħlu minnufih fil-[librerija tal-livelli](level-library.md), minflok waħda eqdem, u jgħid hekk. Minn hemm 'il quddiem **Mappa ta’ Dota 2** tgħabbi dik il-mappa 3D mil-librerija minflok tniżżel it-tpinġija; jekk ma jkunx hemm waħda fil-librerija, tniżżel it-tpinġija u tgħid kif issir il-mappa 3D. Il-fajl ġej mill-installazzjoni tiegħek stess u jibqa' fuq il-magna tiegħek.

## Għall-iżviluppaturi {#for-developers}

### Kif l-ankri jqiegħdu l-immaġni {#how-the-anchors-place-the-image}

Minn [`mapQuadFromAnchors`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts), b'ankri *a* u *b*:

```
scaleX = (b.worldX - a.worldX) / (b.px - a.px)
scaleZ = (b.worldZ - a.worldZ) / (b.py - a.py)
pixel (0, 0) sits at  (a.worldX - a.px × scaleX,  a.worldZ - a.py × scaleZ)
```

Żewġ ankri jiffissaw kemm l-iskala kif ukoll l-offset f'kull assi b'mod indipendenti, għalhekk mappa tista' tiġi mtawla b'mod differenti fuq X u Z imma mhix iddawwra. L-ankri għandhom jiddifferixxu f'**it-tnejn** il-koordinati tal-pixels; meta jaqsmu ringiela jew kolonna, ebda skala ma tista' tiġi derivata, il-mappa ma tinġibdx, u l-pannell jgħid *Iż-żewġ ankri jaqsmu ringiela jew kolonna ta' pixels*.
