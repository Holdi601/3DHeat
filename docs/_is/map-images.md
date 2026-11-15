---
title: "Kortamyndir"
parent: "Borð og bakgrunnsform"
nav_order: 1
lang: "is"
source: "map-images.md"
source_hash: "f0bbaa4b019e"
translated: true
outdated: false
---

# Kortamyndir

Kortamynd er flöt mynd - smákort, gervihnattamynd, grunnmynd af hæð - lögð undir gögnin þín, svo þú sjáir hvar hitinn liggur. Þú segir sýnandanum hvar myndin á að vera með því að festa tvo punkta á hana við tvo staði í heiminum („akkerin“).

## Hlaða inn og staðsetja kortamynd {#load-and-place-a-map-image}

1. Hladdu gögnunum fyrst ([Hvernig gögn eru sett inn](getting-data-in.md)).
2. Í **Bakgrunnur / borð** ýttu á **Kortamynd…** og veldu myndina. Hún er teygð yfir svæði gagnanna.
3. Ýttu á **Laga að mörkum gagnanna** ef myndin hefur verið færð. Akkeri 1 fer í efra vinstra horn myndarinnar, akkeri 2 í neðra hægra horn hennar, við jaðra gagnanna.
4. Ef hitinn fellur ekki að myndinni, veldu tvö kennileiti sem eru langt hvort frá öðru (til dæmis tvö gagnstæð horn á byggingu eða tvenn gatnamót). Lestu pixlann á myndinni fyrir hvort og staðsetningu þess í heiminum (færðu bendilinn yfir með [mælistikunni](measure.md) til að lesa **X** og **Z**).
5. Settu þau inn í **Staðsetning**: fyrir **Akkeri 1** pixla kennileitisins **px**, **py**, **heims-X**, **heims-Z**; það sama fyrir **Akkeri 2**.
6. Athugaðu: slóð eða heitur blettur sem þú veist að liggur á vegi ætti nú að liggja á þeim vegi. Stilltu tölurnar þar til svo er.

![Hlutinn Staðsetning með tveimur akkerum og hita teiknuðum á kortamynd](../assets/img/en/map-images-placement.webp)

Kennileitin tvö verða að vera ólík bæði í pixladálkum og pixlaröðum, annars segir spjaldið *Akkerin tvö deila pixlaröð eða -dálki*.

## Hleðsla {#loading}

Hvaða myndasnið sem vafrinn getur afkóðað. Mynd sem er lengri en **8192 px** á lengri hliðinni er minnkuð í 8192 (stærsta hliðin sem GPU-inn er beðinn um að geyma), og spjaldið segir *Minnkuð úr W×H í w×h*.

Við hleðslu er myndin teygð yfir X-Z-mörk gagnasafnsins (eða ±1000 einingar án gagnasafns), norður upp, í lægstu Y gagnasafnsins. Sjálfgefin gildi eru **Ógegnsæi** 100%, **Birta** 0,7, **Afmetta** 100%, **Snúa norðri/suðri við** á: afmettað og dimmt, því hlutverk bakgrunnsins er að hjálpa þér að finna heitan blett, ekki að keppa við hann.

## Stýringar {#controls}

| Stilling | Sjálfgefið | Svið | Merking |
|---|---|---|---|
| **Ógegnsæi** | 100% | 0-100% | |
| **Birta** | 0,7 | 0-2 (sleði 64) | |
| **Afmetta** | 100% | 0-100% | Grár bakgrunnur, mettaður hiti. Litur í kortinu keppir við lit í gögnunum. |
| **Snúa norðri/suðri við** | á | | Hvaða myndaröð er hámarks-Z heimsins. Með því að skipta um það þegar gagnasafn er hlaðið er akkerunum einnig endurpassað að mörkum gagnanna. |
| **Staðsetning**: Akkeri 1, Akkeri 2 | horn myndarinnar á mörkum gagnanna | | Hvert akkeri er pixill á myndinni - **px** (frá vinstri, 0 til breiddar) og **py** (að ofan, 0 til hæðar) - og heimshnitið sem það liggur á, **heims-X** og **heims-Z**. Skali og útfærsla fylgja af parinu. |
| **Laga að mörkum gagnanna** | | | Setur akkeri 1 á efra vinstra horn myndarinnar og akkeri 2 á neðra hægra, á X-Z-mörk gagnanna. Upphafspunktur fyrir nákvæma staðsetningu. Þarfnast gagnasafns. |
| **Hæð** | lægsta Y gagnasafnsins | Y-lágmark gagna - 500 til Y-hámark + 500 (sleði Y-hámark + 100.000) | Hæð kortaflatarins. Settu hann rétt undir gögnin svo ekkert hyljist af honum. |

Nafnlínan sýnir `breidd×hæð px · x × z m/px`, heimsstærð eins pixils eftir hverjum ás.

## Í sennunni {#in-the-scene}

Myndin er einn áferðarlagður ferhyrningur í hæðinni. Við fullt ógegnsæi skrifar hún dýpt, svo hún tekur þátt í [hulningu](depth-and-culling.md) sem jörð; undir 100% ógegnsæi er hún blönduð og skrifar enga dýpt, svo hún hylur ekkert. [Mælistikan](measure.md) mælir á fleti hennar. [Borðasafnið](level-library.md) geymir myndborð með akkerunum sínum.

## Dota 2-kortið {#dota-2-map}

**Dota 2-kort** við hlið **Kortamynd…** sækir teikninguna af núverandi Dota 2-korti sem [OpenDota](https://www.opendota.com) sýnir á leikjasíðum sínum, og setur hana undir töflur sem [Watcher](https://github.com/Holdi601/3DHeat-Watcher) skrifar úr Dota 2-endurspilunum ([`dotaMap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/tactics/dotaMap.ts)). Myndin er sótt af opendota.com þegar hnappurinn er ýttur á og er ekki hluti af 3DHeat; teikning nýjustu uppfærslunnar er tekin af lista OpenDota sjálfs, og teikning 7.40 þegar ekki er hægt að lesa listann.

| | |
|---|---|
| Uppspretta | `opendota.com/assets/images/dota2/map/detailed_<patch>.webp`, 900×900 px |
| Staðsetning | Kvörðun OpenDota: myndin nær yfir Dota-heimseiningar -8192 til 8064 á báðum ásum (128-einingareitir 64 til 191), norður efst. Með ásum endurspilunartöflunnar (Z upp, Y snúið við) er það heims-X -8192 til 8064 og heims-Z -8064 til 8192. Um 18 einingar á pixil. |
| Hæð | 0. Hetjur standa í 0 til um 600. |
| Útlit | Birta 0,8, afmetta 50%. |

Prófað á opinberri endurspilun leiks á uppfærslu 7.40: slóð sérhverrar hetju fylgir teiknuðum brautum, og turnarnir, herbúðirnar og fornmennirnir sem endurspilunin staðsetur lenda á teiknuðu bækistöðvunum. **Ofan**-sýnin sýnir kortið með norðri neðst á skjánum, eins og hún sýnir hvaða Z-upp töflu sem er með Y snúið við.

Teikningin er frá OpenDota, af korti Valve; Valve styður ekki 3DHeat.

### Þrívíða kortið {#the-3d-map}

Með Dota 2 uppsett býr sérstaka tólið [3DHeat Dota](https://holdi601.github.io/3DHeat-Ext-Dota/) (`heat3d-dota-maps level -o dota.glb`; skipunin [`dota-map`](https://holdi601.github.io/3DHeat-Watcher/dota-map.html) í Watcher keyrir það líka) til kortið í þrívídd úr skrám leiksins sjálfs: jörð, klettar, vatn, tré og byggingar, í einingum og ásum endurspilunartaflnanna. Hladdu skránni inn einu sinni með **Þrívíddarlíkan…**: skoðarinn þekkir hana á hlutum hennar (`ground:terrain`, `structure:tower`, `structure:ancient`, `structure:tree`; `isDotaLevel` í `dotaMap.ts`), setur hana strax í [borðasafnið](level-library.md) í stað eldri og segir frá því. Eftir það hleður **Dota 2-kort** þessu þrívíða korti úr safninu í stað þess að sækja teikninguna; sé ekkert í safninu sækir hann teikninguna og segir hvernig þrívíða kortið er búið til. Skráin kemur úr þinni eigin uppsetningu og verður áfram á tölvunni þinni.

## Fyrir forritara {#for-developers}

### Hvernig akkerin staðsetja myndina {#how-the-anchors-place-the-image}

Úr [`mapQuadFromAnchors`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts), með akkerunum *a* og *b*:

```
scaleX = (b.worldX - a.worldX) / (b.px - a.px)
scaleZ = (b.worldZ - a.worldZ) / (b.py - a.py)
pixel (0, 0) sits at  (a.worldX - a.px × scaleX,  a.worldZ - a.py × scaleZ)
```

Tvö akkeri ákvarða bæði skala og útfærslu á hvorum ási fyrir sig, svo kort má teygja ólíkt á X og Z en ekki snúa. Akkerin verða að vera ólík í **báðum** pixlahnitum; þegar þau deila röð eða dálki er ekki hægt að reikna neinn skala, kortið er ekki teiknað, og spjaldið segir *Akkerin tvö deila pixlaröð eða -dálki*.
