---
title: "Þrívíð borð"
parent: "Borð og bakgrunnsform"
nav_order: 2
lang: "is"
source: "model-levels.md"
source_hash: "0afa06188c9e"
translated: true
outdated: true
---

# Þrívíð borð

Þrívítt borð er líkan af staðnum - hæðum, götum, byggingum - sem gögnin þín liggja inni í. Það gerir þér kleift að sjá á hvaða hæð, hæð eða þaki hitinn er. Skoðarinn skiptir því í land (traust), mannvirki (gegnsæ, svo að þú getir litið inn í þau) og vatn.

## Hlaða þrívíðu borði {#load-a-3d-level}

1. Hlaðaðu gögnunum þínum fyrst ([Að koma gögnum inn](getting-data-in.md)). Líkanið verður að nota sama heimsrúm og einingu og gögnin, með Y upp.
2. Undir **Bakgrunnur / borð** skaltu velja **Markmið einföldunar**. Láttu það vera á *Fullt - engin einföldun* nema líkanið sé risastórt.
3. Ýttu á **Þrívíddarlíkan…** og veldu skrá af gerðinni `.glb`, `.gltf`, `.obj`, `.stl` eða `.ply`.
4. Bíddu eftir framvindulínunni. **Hætta við** stöðvar hana.
5. Ýttu á **F** í sýninni. Landið er traust, mannvirkin eru gegnsæ skeljar, vatnið er flatt.
6. Stilltu útlitið í [Útlit borðs](level-appearance.md). Ýttu á **Vista í safn** til að geyma niðurstöðuna ([Safn borða](level-library.md)).

![Þrívítt borð hlaðið: ógegnsætt land með hæðarlínum, gegnsæjar byggingar, flatt vatn](../assets/img/en/model-levels-loaded.webp)

**Þrívíddarlíkan…** hleður borðnetinu. Það er þáttað, flokkað og einfaldað í bakgrunnsvinnsluþræði ([`modelWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelWorker.ts)) með framvindulínu og **Hætta við**: *Les líkan*, *Þátta skrá*, *Pakka N áferðum*, *Flokka N hluta*, *Einfalda land (N þríhyrningar)*, *Einfalda mannvirki (N þríhyrningar)*, *Bý til vírnet*.

## Snið {#formats}

| Snið | Hvað er lesið | Takmörk |
|---|---|---|
| `.glb` | Sérhvert net-frumstæði með `mode` 4 (þríhyrningar) eða án ham, með heimsumbreytingu hvers hnúts beitt; `POSITION`; `COLOR_0` (vec3 eða vec4) sem hornalitur; `baseColorTexture` efnisins og `TEXCOORD_n` þess sem áferð; heiti hnúta og neta sem heiti hluta. | Línur og punktar eru sleppt. |
| `.gltf` | Það sama. | Aðeins með innbyggðum buffurum: glTF sem vísar í ytri `.bin` er hafnað með *Flyttu út sem eina .glb-skrá svo rúmfræðin sé innbyggð.* |
| `.obj` | Fletir, með `o`- og `g`-blokkum sem hlutum. | Aðeins rúmfræði (engin efni). |
| `.stl` | Tvíundir og ASCII (`solid …`). | Einn hluti. |
| `.ply` | Aðeins ASCII. | Tvíundir PLY er hafnað með *Breyttu í .glb eða tvíundir .stl.* |

Aðeins rúmfræði: staðsetningar, normalvigrar og þríhyrningar sameinaðir í einn buffer, auk lita og texta-hnita þar sem þeir eru til ([`modelParse.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelParse.ts)). Líkan án þríhyrninga er hafnað. Líkanið verður að vera í sama heimsrúmi og einingu og gögnin (Y upp): ekkert er umbreytt til að passa.

## Land, mannvirki og vatn {#ground-structures-and-water}

Borð er skipt í þrjá flokka við innflutning, því að þeir vilja andstæðar meðhöndlanir ([`classify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/classify.ts)):

- **Land** - teiknað ógegnsætt og skyggt með landslagsvísum (halla, hæðarlínum, hæðarhalla) svo að hægt sé að lesa stöðu gagnvart því.
- **Mannvirki** - byggingar og munir standa á milli myndavélarinnar og hitans inni í þeim, svo að þau eru teiknuð sem **gegnsæ skel** (daufir fletir með bjartri brún, auk afrita brúna sem hefur verið eytt) - eða, þegar þau eru með áferð, traust í sinni eigin áferð.
- **Vatn** - flatt, án landslagsvísa: hæðarlína yfir vatn er della.

Sérhver hluti (glTF-hnútur, OBJ-hlutur eða hópur) er flokkaður sjálfstætt, eftir fyrstu reglunni sem á við ([`classify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/classify.ts)):

1. **Merki útflytjandans.** Heiti sem byrjar á `ground:`, `structure:` eða `water:` (eða með `|` í stað `:`) er tekið eins og það er. Útflytjendur verkefnisins merkja sérhvern hluta þannig.
2. **Vatnsheiti.** `water` sem orð (ekki *water tower*, *-tank*, *-mill*, *-front*, *-fall*, *-pump*, *-pipe*), `ocean`, `sea`, `lake`, `pond`, `lagoon`, `river`.
3. **Landsheiti.** `terrain`, `landscape`, `ground…`, `…_ground`, `heightmap`, `floor…`, `map` / `map_…`, `base` / `base_…`, `road`, `street`, `pavement`, `sidewalk`.
4. **Heiti mannvirkja.** `house`, `building`, `bldg`, `wall`, `roof`, `door`, `window`, `stair`, `prop`, `asset`, `clutter`, `debris`, `crate`, `barrel`, `fence`, `tree`, `rock`, `bush`, `vehicle`, `car`, `truck`, `tank`, `bridge`, `tower`, `silo`, `hangar`, `bunker`.
5. **Rúmfræði.** Hluti sem þekur meira en 25% af X-Z-flatarmáli kortsins með meira en 60% af þríhyrningaflatarmáli sínu vísandi upp er land. Hluti með minna en 45% vísandi upp, eða hærri en 15% af hæð borðsins á meðan hann þekur minna en 10% af flatarmáli þess, er mannvirki. Hlutfallið sem vísar upp er vegið eftir flatarmáli, svo að hús er ekki kallað flatt fyrir að hafa þak.
6. **Annars land** - óljós hluti fær sjálfgefið land, því að sjálfgefin nær ósýnileg skel myndi láta borðið líta út eins og bilun í teikningu.

Líkan sem er einn hluti sem er flokkaður sem mannvirki verður í staðinn land (*einn ónefndur net - meðhöndlað sem land*).

### Leiðsögunet {#navigation-meshes}

Hluti sem heitir `nav:…` (`nav:walkable` frá útflytjanda borðs) er leiðsögunet: þar sem hermaður getur staðið. Hann er skráður sem land (*leiðsögunet - ekki teiknað, þar sem það liggur á jörðinni; smellir finna það samt*) en **ekki teiknaður**. Hann liggur yfir landinu sem hann var búinn til úr, samplanar við það innan sentímetra, og ef hann væri teiknaður sem land myndu flötirnir tveir berjast um hvern pixla: á borði með bakaðri landáferð sýndist allt spilanlega svæðið sem harðkantaðir blettir af gráu og beige, einn fyrir hvern þríhyrning leiðsögunetsins. Hann er geymdur óeinfaldaður, svo að [smellival](camera.md#click-to-pick) geti sagt hvort staður sé gengilegur. Safnfærslur geyma hann ekki.

**Sýna flokkun hluta (N)** í spjaldinu (birt fyrir líkön með fleiri en einum hluta) listar hvern hluta með flokki sínum og ástæðunni - *merkt af útflytjanda*, *heiti passar við mynstur*, *þekur X% af kortinu, Y% vísa upp*, *Y% vísa upp, Z% af hæð borðsins*, *óljóst - sjálfgefið land*. Til að breyta einum skaltu endurnefna hlutann í upprunalíkaninu og flytja inn aftur; skiptingin er bökuð inn í vísabufferana.

## Einföldun {#simplification}

**Markmið einföldunar** stillir þríhyrningamörkin fyrir næsta innflutning ([`simplify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/simplify.ts)):

| Stilling | Þríhyrningar |
|---|---|
| *Fullt - engin einföldun* (sjálfgefið) | allir |
| *Hátt - 8M þríhyrningar* | 8.000.000 |
| *Miðlungs - 3M þríhyrningar* | 3.000.000 |
| *Lágt - 800k þríhyrningar* | 800.000 |
| *Útlína - 100k þríhyrningar* | 100.000 |

Mörkin skiptast **60% á mannvirki og 40% á landið**, einfölduð sitt í hvoru lagi - mannvirki missa lögun sína hraðast við afgreiðslu. Vatn er ekki einfaldað. Einföldunin er brúnaeyðing með quadric-villumælingum ([meshoptimizer](https://github.com/zeux/meshoptimizer), í gegnum WebAssembly), eftir að fallandi hnútar hafa verið sameinaðir, svo að útlínur og harðar brúnir lifa af. Innflutningsathugasemdin segir `uppruni → nú þríhyrningar, frávik X%`, skiptingu lands / mannvirkja / vatns milli hlutanna og - þegar *Fullt* var notað á líkan yfir 8M þríhyrninga - stingur upp á *Hátt* (allt að 30M) eða *Miðlungs* (yfir því). Án WebAssembly er einföldunin ekki til staðar og innflutningurinn segir það.

Borð frá útflytjendum verkefnisins eru þegar með mörk; markmiðið er til fyrir hrátt listaverk sem hefur engin mörk að baki.

## Áferðir {#textures}

`.glb` sem hefur hluta með grunnlitaáferðum er teiknað í þeim - útflutningur af kappakstursbraut, til dæmis, ber eina fyrir hverja landflís og eina fyrir hvert staðsett líkan.

Áferð lands er sýnd sjálfgefið þegar hún er til staðar; mannvirki sem bera áferðir byrja **traust, í eigin áferðum** (kantsteinar, handrið, dekkjaveggir og skilti eru jaðrar vegar, ekki byggingar til að líta inn í), með vírnetinu slökkt og flatri skyggingu slökkt. Sjá [Útlit borðs](level-appearance.md).

## Stór borð {#large-levels}

- Yfir **300.000** þríhyrninga í mannvirkjum er brúnum mannvirkjanna slökkt í upphafi og ógegnsæi flatanna stillt á 35%: með brún í hverjum pixla virðist hverfið vera flatt og hvítt.
- Fjarplan myndavélarinnar víkkar til að passa borðið ([Borð](levels.md#what-a-level-does-for-the-heat)).

## Fyrir forritara {#for-developers}

### Áferðaatlas {#texture-atlas}

Sérhver áferð er pökkuð í **eitt atlas** í innflutningsvinnsluþræðinum ([`atlas.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/atlas.ts)), svo að borðið er áfram eitt teikniskref, einn sýnatökumaður og ein texta-hnitaeigind á báðum bakendum:

- pakkað í hillur í eigin stærð hverrar myndar, minnkað aðeins ef settið passar ekki **8192 px** í hvora átt (sjálfgefið áferðarstærðartakmark WebGPU);
- **16 pixla rás** umhverfis hverja mynd, og aðeins þau 5 mip-stig sem rásin verndar, svo að fjarlægt skilti sýnir aldrei áferð nágrannans;
- **endurteknar áferðir** haldast endurteknar. Mynd sem glTF-sýnatakinn endurtekur (sjálfgefið í glTF) og sem texta-hnit fara út fyrir 0..1 - múrveggur þar sem UV-ið gengur frá 0 til 40 eftir honum - verður að *flís*: hnútarnir halda eigin hnitum og 16 bita flísanúmeri, og skyggnin vefur hnitið inn í rétthyrning flísarinnar fyrir hvern pixla, og tekur mip-stigið út frá óvöfðu hnitinu, svo að saumarnir sjást ekki. Rás flísar geymir sinn eigin gagnstæða jaðar. Ás þar sem sýnatakinn klemmir er klemmdur; mynd þar sem hnitin haldast innan 0..1 er teiknuð eins og áður. Borð með flísum kostar 4 bæti í viðbót á hvern hnút.

### Samningur útflytjanda {#the-exporter-contract}

Það sem skoðarinn þarf af borði, sama hver bjó það til:

- ein sjálfstæð `.glb`-skrá;
- `POSITION` í float32, þríhyrningafrumstæði;
- heiti hnúta `ground:*`, `structure:*` og `water:*` (annað er flokkað eftir reglunum að ofan), og `nav:*` fyrir leiðsögunet, sem er geymt en ekki teiknað;
- hnit í heimsrúmi, **Y upp**, í sömu einingu og fjarmælingin, svo að gögnin liggi á borðinu án nokkurs staðsetningarskrefs.
