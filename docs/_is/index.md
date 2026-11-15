---
title: "Forsíða"
nav_order: 1
lang: "is"
source: "index.md"
source_hash: "b93bb646bdad"
translated: true
outdated: false
---

# 3DHeat

3DHeat sýnir hvar hlutir gerðust í leik - hvert leikmenn fóru, börðust og féllu - sem glóandi liti sem þú getur flogið í gegnum, eða sem litlar þrívíðar fígúrur sem endurspila leikinn.

Hlaðið inn staðsetningum - CSV, Parquet, Tacview-upptökum, breyttum endurspilunum, einni skrá, möppu eða þúsundum leikja - og sjáið þær sem **hitakort sem þú getur flogið í gegnum**, sem **fígúrur sem endurspila leikinn**, sem línur eftir leiðunum sem fólk fór, eða sem einn hóp á móti öðrum. Það finnur sjálft það sem sker sig úr, og það keyrir alveg í vafranum: ekkert er sent neitt.

![Hiti tíu skriðdrekaleikja yfir sýnidalnum](../assets/img/en/heat-hero.webp)

**Ert þú nýr hér?** Búðu til [sýnigögnin](demo-data.md) og fylgdu sjö skrefunum þeirra. Hver mynd á þessari síðu var tekin með þeim.

## Hvað það gerir {#what-it-does}

| | |
|---|---|
| ![Mismunur](../assets/img/en/heat-difference.webp) | **[Hitastillingar](heat-modes.md)** - hiti, [mismunur](difference.md) (rautt þar sem önnur hliðin var meira, grænblátt þar sem hin var meira), [liðahiti](team-heat.md), [línuhiti](line-heat.md); [stefnuhiti](directional-heat.md) með geirum, örvasviðum og skautsrit; hiti [vigtaður eftir gildi](value-weighting.md): hvað vopn, farartæki og eldsneyti kosta. |
| ![Endurspilun](../assets/img/en/replay-tanks.webp) | **[Endurspilun leiks](match-replay.md)** - sérhver eining sem [fígúra](figures.md) af því sem hún er, NATO- eða rússnesk tákn þegar hún er langt í burtu, flaugar og skotrákir, höggmerki, flök, eldar, turnar, markmið, myndavélar í anda Tacview og taktísk skjámynd; [margir leikir í einu](many-matches.md). |
| ![Innsýn](../assets/img/en/insights.webp) | **[Innsýn](insights.md)** - sterkar stöður, banvænt land, gildrur við upphaf, flöskuhálsar og áberandi leikmenn, fundið og raðað ásamt gögnunum; skrifuð samantekt, valfrjálst frá gervigreind að eigin vali; lýsandi fyrir einn leik; [þekkingarlinsan](knowledge.md). |
| ![Rúmmál](../assets/img/en/compare.webp) | **[Rúmmál](volumes.md)** - teiknaðu kassa, prisma, sívalninga og kúlur, síaðu niður í þá, teldu það sem gerist inni, fluttu út og berðu staði saman hlið við hlið; [sundurliðun](breakdown.md) á því hver og hvað gengur best á stað. |
| ![Síur](../assets/img/en/filters.webp) | **[Síur](filters.md)** - eftir atburðategund, leikmanni eða gervigreind, flokki farartækis, gildi, hvaða dálki sem er, á skjákortinu við hvaða gagnastærð sem er. |
| ![Borð](../assets/img/en/level-panel.webp) | **[Borð](levels.md)** - kortamyndir, þrívíð borð gerð með [gagnatólunum](#related-repositories), einföldun, [bakgrunnur heimsins](world-backdrop.md) með raunverulegu landslagi fyrir flugógn. |

Einnig: flipinn [Kappakstursgreining](race-analysis.md) fyrir hringi í kappakstursleikjum, flipinn [Leikur](match-analysis.md) fyrir samantektir úr Counter-Strike 2, [Taktíkartaflan](tactics-board.md) fyrir áætlanir á borði, [greining á hittum](hit-analysis.md) eftir farartæki, [fjöldagreining](mass-analysis.md) á þúsundum leikja, [myndavélarleiðir og myndband](camera-path-and-video.md), [40 tungumál](languages.md), [mælieiningar eða breskar einingar](settings.md).

## Flipar {#the-tabs}

Flipunum er raðað efst í hliðarstikunni, undir heitinu, einingunum og tungumálavalmyndinni.

| Flipi | Hvað hann er fyrir |
|---|---|
| **Hitakort** | Hvaða staðsetningartafla sem er: hitastillingarnar, fígúruyfirlögnin, síur, rúmmál, innsýn, borð, mælingar og myndband. |
| **Kappakstursgreining** | Tveir eða fleiri hringir á sömu braut: hvar tími tapast, af hverju, og hvað á að breyta. |
| **Leikur** | Fígúruendurspilun leiks og samantektir úr Counter-Strike 2. |
| **Leikfræði** | Áætlanir á borði: fígúrur, leiðir, kastað hjálpartæki, svæði og athugasemdir í skrefum sem spila. |
| **Farartæki** | Hvar hver eining varð fyrir höggi, af hverjum og með hverju. |

## Uppsetning og keyrsla {#install-and-run}

### Windows, á einfaldan hátt {#windows-the-easy-way}

Rót geymslunnar hefur þrjár skrár með skipunum.

| Skrá | Hvað hún gerir |
|---|---|
| `start.bat` | Ræsir skoðarann. Finnur Node.js þó að það sé ekki á `PATH` (leitar í `%ProgramFiles%\nodejs`, `%ProgramFiles(x86)%\nodejs` og `%LOCALAPPDATA%\Programs\nodejs`), og ef Node.js vantar býðst það til að setja upp LTS-útgáfuna með `winget install -e --id OpenJS.NodeJS.LTS`. Við fyrstu keyrslu spyr það áður en það sækir háðu forritin (um 300 MB í `node_modules\` innan möppunnar, ekkert kerfisvítt). Það neitar að ræsa þegar eitthvað hlustar nú þegar á tengi 5273 og bendir á `restart.bat` í staðinn. Þegar mappan er git-afrit án staðbundinna breytinga og nýrri útgáfa er til, spyr það hvort uppfæra eigi (Y/N; án svars í 60 sek. heldur það þessari útgáfu; sjá [Uppfærslur](updates.md)). Síðan keyrir það þróunarþjóninn á `http://127.0.0.1:5273/` og opnar vafrann. **Glugginn er þjónninn**: láttu hann vera opinn, lokaðu honum eða ýttu á Ctrl+C til að stöðva. |
| `restart.bat` | Keyrir `stop.bat quiet` og síðan `start.bat`. Þarf aðeins eftir breytingu á `vite.config.ts`, þegar háð bætist við, eða þegar þjónninn er fastur - breytingar á frumkóða hlaðast sjálfkrafa inn. |
| `stop.bat` | Stöðvar það sem hlustar á tengi 5273, eftir auðkenni ferlis sem finnst með `netstat`, aldrei eftir nafni myndar, svo önnur Node.js-ferli á vélinni haldast óhreyfð. Bíður í um tvær sekúndur eftir að innstungan losnar. Með skipuninni `quiet` bíður það ekki í lokin. |

### Handvirkt (hvaða stýrikerfi sem er) {#by-hand-any-os}

```bash
git clone --recursive https://github.com/Holdi601/3DHeat.git
cd 3DHeat
npm install
npm run dev      # http://127.0.0.1:5273
```

Mappan `exporters/` geymir gagnatólin sem sérstakar git-undireiningar, hver með sína eigin geymslu; eftir venjulegt klón keyrðu `git submodule update --init`. Skoðarinn sjálfur þarf þau ekki til að keyra. `exporters/ext/` geymir valfrjálsa breyta (War Thunder, World of Tanks, World of Warships, Squad-endurspilanir; DCS- og IL-2-kort), aðskilda svo að vandamál í einum þeirra hafi engin áhrif á hina.

Engin leikjagögn fylgja neinu af þessu: borð, kort og upptökur eru gerð á þinni eigin vél með verkfærunum, úr leikjum sem þú átt.

### npm-skipanir {#npm-scripts}

| Skipun | Hvað hún keyrir |
|---|---|
| `npm run dev` | Vite-þróunarþjóninn á tengi 5273, bundinn við `127.0.0.1`. |
| `npm run build` | Gerð-athugun (`tsc --noEmit`) og framleiðslupakki í `dist/`. |
| `npm run preview` | Þjónar framleiðslupakkanum. |
| `npm run typecheck` | Gerð-athugunin ein sér. |
| `npm test` / `npm run test:watch` | Einingar- og samþættingarpróf (vitest). |
| `npm run smoke` | Stýrir raunverulega forritinu í höfuðlausum Chromium og athugar að striginn hafi litaða pixla úr gögnum; skjámyndir fara í `tools/.smoke/`. Gerir ráð fyrir að þróunarþjónninn sé í gangi. |
| `npm run smoke:f16` | Sama prófunarsvíta með `?heat=f16`, sem neyðir söfnunarleiðina með hálfri nákvæmni (sjá [Söfnun með hálfri nákvæmni](half-float-accumulation.md)). |
| `npm run bench` | Innlestrarmæling, skrifar `tools/.smoke/ingest-bench.json`. |
| `npm run test:heavy` | Próf sem þurfa stórar raunverulegar gagnaskrár; þau sleppa sjálfkrafa þegar skrárnar vantar. |
| `npm run inspect -- <file.parquet>` | Prentar skema Parquet-skráar og nokkrar línur (`tools/inspect-parquet.mjs`). |

### Hvað þróunarþjónninn bætir við {#what-the-dev-server-adds}

Skoðarinn er kyrrstæð vefsíða, en þróunarþjónninn (sjá `vite.config.ts`) bætir við tveimur staðbundnum leiðum sem kyrrstæð útgáfa af `dist/` hefur ekki:

- `/__host/memory` skilar uppsettu og lausu vinnsluminni vélarinnar og, þar sem hægt er að lesa það, minni skjákortsins (frá `nvidia-smi`, eða á Windows frá skjástýringarfærslu í skrásetningunni). Þetta gerir að verkum að [minnismörkin](memory-and-budgets.md) nota raunverulegar tölur í stað ágiskana vafrans sem eru takmarkaðar.
- `/__heat3d/update` athugar hvort afritið sé á eftir og getur fært það áfram ([Uppfærslur](updates.md)).

Þjónninn bindst aðeins við `127.0.0.1`, svo hvorug leiðin er aðgengileg af netinu. Opnaðu hann sem `http://127.0.0.1:5273`: `localhost` getur leyst yfir á IPv6-lykkjuna `::1`, þar sem ekkert hlustar. Hann sendir engar uppruna-einangrunarhausa (COOP/COEP): ekkert í skoðaranum notar `SharedArrayBuffer`, og vinnsluferlarnir afhenda gögnin sín með flutningi, sem þarfnast þeirra ekki.

## Kröfur um vafra og skjákort {#browser-and-gpu-requirements}

- **Vafri með WebGPU eða WebGL2.** WebGPU er prófað fyrst (Chrome og Edge hafa það); án þess er WebGL2-bakendinn notaður. WebGL2 verður að bjóða `EXT_color_buffer_float` (teikning í fleytitöflur), annars sýnir skoðarinn "Cannot initialise the renderer." Sjá [Bakendarnir tveir](backends.md). Skoðarinn er þróaður og prófaður í Chromium; aðrir vafrar eru óprófaðir.
- **Vélbúnaðarhröðun kveikt.** Þegar vafrinn teiknar á örgjörvanum (SwiftShader, llvmpipe, Microsoft Basic Render Driver og svipað) sýnir rauður borði efst í hliðarstikunni að svo sé og hvernig eigi að laga það. Sjá [Greining hugbúnaðarmyndvinnslu](software-rendering.md).
- **Stakt skjákort hjálpar, en er ekki skilyrði.** Báðir bakendarnir biðja um afkastamikla millistykkið. Það magn gagna sem hægt er að geyma á skjákortinu er fjárhagsáætlun sem þú sérð og getur breytt ([Minni og mörk](memory-and-budgets.md)).
- **Valfrjálsir eiginleikar** nota fleiri vafraforritaskil: myndbandsbirting þarfnast WebCodecs `VideoEncoder` með VP9 eða VP8 ([Myndavélarleið og myndband](camera-path-and-video.md)); einföldun möskva á borðum þarfnast WebAssembly; að sleppa möppum á skjáinn notar File and Directory Entries API; borðasafnið notar IndexedDB; stýripinnar nota Gamepad API.

## Yfirlit yfir skjölin {#documentation-map}

**Byrjun**: [Sýnigögn](demo-data.md) · [Hvernig gögn eru sett inn](getting-data-in.md) ([hleðsla skráa](loading-files.md), [dálkatengingar](column-mapping.md), [ásar, einingar og tími](axes-units-and-time.md), [lotur, persónur og hópar](sessions-persons-groups.md), [Tacview](tacview-acmi.md), [breytar](converters.md), [.3dheat](container.md), [minni og mörk](memory-and-budgets.md))

**Skoða**: [Hitastillingar](heat-modes.md) ([hiti](heat.md), [lögun sprite-mynda](sprite-shape.md), [litir og lýsing](colour-and-exposure.md), [dýpt og útilokun](depth-and-culling.md), [mismunur](difference.md), [liðahiti](team-heat.md), [línuhiti](line-heat.md), [endurspilunarkassi](box-replay.md), [stefnuhiti](directional-heat.md), [gildisvigtun](value-weighting.md)) · [Tímalína](timeline.md) · [Borð](levels.md) ([kortamyndir](map-images.md), [þrívíð borð](model-levels.md), [útlit](level-appearance.md), [safn](level-library.md), [bakgrunnur heimsins](world-backdrop.md), [heimildir hans](world-backdrop-sources.md)) · [Myndavél](camera.md) ([stýripinni](gamepad.md), [lyklar](keyboard-reference.md)) · [Myndavélarleið og myndband](camera-path-and-video.md)

**Greina**: [Síur og verkfæri](filters-and-tools.md) ([síur](filters.md), [lið](teams-list.md), [einingar](entities.md), [sneið](slice.md), [mæling](measure.md), [rúmmál](volumes.md), [sundurliðun](breakdown.md)) · [Innsýn](insights.md) ([þekkingarlinsan](knowledge.md)) · [Fjöldagreining](mass-analysis.md)

**Endurspilun**: [Endurspilun leiks](match-replay.md) · [Margir leikir í einu](many-matches.md) · [Fígúrur](figures.md) ([í fígúruyfirlögninni](figure-replay.md), [heimildir](figure-credits.md)) · [Samræmi við Tacview](tacview-parity.md) · [Greining á hittum](hit-analysis.md)

**Aðrir flipar**: [Kappakstursgreining](race-analysis.md) ([aðferðin](race-analytics.md), [aðrir leikir](other-games.md)) · [Leikgreining](match-analysis.md) · [Taktíkartafla](tactics-board.md) ([hraði](tactics-speeds.md))

**Skoðarinn**: [Orðasafn](glossary.md) · [Stillingar, einingar og lyklar](settings.md) · [Tungumál](languages.md) · [Uppfærslur](updates.md) · [Innri hlutar myndvinnslu](rendering-internals.md) ([bakendar](backends.md), [söfnun](accumulation.md), [úrtak og mörk](sampling-and-budgets.md), [hálf nákvæmni](half-float-accumulation.md), [minni skjákorts](gpu-memory.md), [hugbúnaðarmyndvinnsla](software-rendering.md), [afköst og tölfræði](performance-and-stats.md)) · [Gagnasnið](data-formats.md) · [Viðmiðunarefni](reference.md) · [Viðhald skjalanna](maintaining.md)

## Tengdar geymslur {#related-repositories}

Skoðarinn les gögn; þessi verkfæri búa þau til. Hvert þeirra er sín eigin opinbera geymsla (MIT) með sín eigin skjöl. Engin þeirra fylgir leikjagögnum: borð, kort og upptökur eru gerð á þinni eigin vél, úr leikjum sem þú átt.

| Geymsla | Hvað hún gerir | Gagnleg fyrir |
|---|---|---|
| [3DHeat-GameFiles](https://github.com/Holdi601/3DHeat-GameFiles) | Les brautir og borð úr skjalasöfnunum sem leikir fylgja (Forza Horizon, BeamNG, Assetto Corsa Rally; lesarar fyrir Unreal, Unity, Frostbite og Source 2) sem glTF | þrívítt borð undir hitanum þínum eða endurspilun |
| [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture) | Tekur upp hringjamælingar úr viðmótunum sem kappakstursleikir birta, og smíðar borð úr myndböndum af leik | hringi fyrir Kappakstursgreiningu; borð þar sem engar skrár er hægt að lesa |
| [3DHeat-UnrealExporter](https://github.com/Holdi601/3DHeat-UnrealExporter) | Viðbót fyrir Unreal Editor sem flytur út borð sem eina glTF-skrá | borð í þínum eigin Unreal-verkefnum |
| [3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2) | Counter-Strike 2-demó í hitatöflur og leikjasamantektir, CS2-kort í rúmfræði | CS2-hita, endurspilanir og flipann Leikur |
| [3DHeat-Watcher](https://github.com/Holdi601/3DHeat-Watcher) | Skráir spilun þína í bakgrunni úr því sem leikir birta: mælingar, samþættingar leikjastöðu, atvikaskrár, endurspilanir | þína eigin tölfræði án handavinnu |
| [3DHeat-Ext-WarThunder](https://github.com/Holdi601/3DHeat-Ext-WarThunder) | War Thunder-endurspilanir (`.wrpl`) í töflur: loft- og landslóðir, skot, högg, dráp, turna, markmið | War Thunder-endurspilanir, höggmerki og innsýn |
| [3DHeat-Ext-WoT](https://github.com/Holdi601/3DHeat-Ext-WoT) | World of Tanks-endurspilanir í töflur: staðsetningu hvers farartækis, dauða og dráp | World of Tanks-hita og endurspilanir |
| [3DHeat-Ext-WoWs](https://github.com/Holdi601/3DHeat-Ext-WoWs) | World of Warships-endurspilanir í töflur: staðsetningu hvers skips og sökkvingar | World of Warships-hita og endurspilanir |
| [3DHeat-Ext-Squad](https://github.com/Holdi601/3DHeat-Ext-Squad) | Squad-þjónademó í töflur: staðsetningu, lið og herdeild hvers leikmanns | Squad-hita og endurspilanir |
| [3DHeat-Ext-DCS](https://github.com/Holdi601/3DHeat-Ext-DCS) | DCS World-landslag úr þinni eigin uppsetningu í borð: land, vegi, bæi, flugvelli, akra, vatn | DCS- og Tacview-upptökur á raunverulegu landslagi þeirra |
| [3DHeat-Ext-IL2](https://github.com/Holdi601/3DHeat-Ext-IL2) | IL-2 Great Battles-kort í borð | IL-2-upptökur á kortinu þeirra |

## Uppbygging frumkóðans, í stuttu máli {#source-layout-briefly}

| Mappa | Efni |
|---|---|
| [`src/data/`](https://github.com/Holdi601/3DHeat/tree/main/src/data) | Skráaval, CSV- og Parquet-innlestur, sjálfvirk tenging, staðfesting, minnislíkan, gagnasafnssmiður, líkanagreining, flokkun, einföldun, borðasafn |
| [`src/render/`](https://github.com/Holdi601/3DHeat/tree/main/src/render) | Myndalykkjan (`engine.ts`), úrtak, bakendarnir tveir, myndavél, stýripinni, mæling, myndavélarleið, myndbandsupptaka |
| [`src/state/`](https://github.com/Holdi601/3DHeat/tree/main/src/state) | Forritsástandið (`store.ts`) með öllum sjálfgildum, lénstögin (`types.ts`), sprite-ferillinn |
| [`src/ui/`](https://github.com/Holdi601/3DHeat/tree/main/src/ui) | Spjöldin í hliðarstikunni, tímalínan, yfirlögin |
| [`src/race/`](https://github.com/Holdi601/3DHeat/tree/main/src/race), [`src/match/`](https://github.com/Holdi601/3DHeat/tree/main/src/match) | Flipar Kappakstursgreiningar og Leiks |
| [`src/i18n/`](https://github.com/Holdi601/3DHeat/tree/main/src/i18n) | Þýðingar |
| [`src/insights/`](https://github.com/Holdi601/3DHeat/tree/main/src/insights) | Innsýn: greiningartól, samantekt, lýsandi, þjónustuaðilar gervigreindar, þekkingarlinsan |
| [`src/mass/`](https://github.com/Holdi601/3DHeat/tree/main/src/mass) | Fjöldagreining á mörgum leikjum |
| [`src/volumes/`](https://github.com/Holdi601/3DHeat/tree/main/src/volumes) | Rúmmál, tölfræði þeirra, útflutningur og samanburður |
| [`src/breakdown/`](https://github.com/Holdi601/3DHeat/tree/main/src/breakdown) | Sundurliðun og þættir |
| [`src/overlay/`](https://github.com/Holdi601/3DHeat/tree/main/src/overlay) | Yfirlagið fyrir marga leiki |
| [`src/figures/`](https://github.com/Holdi601/3DHeat/tree/main/src/figures) | Fígúrusafnið og smiður þess |
| [`src/vehicle/`](https://github.com/Holdi601/3DHeat/tree/main/src/vehicle) | Greining á hittum (flipi Farartæki) |
| [`src/tactics/`](https://github.com/Holdi601/3DHeat/tree/main/src/tactics) | Taktíkartaflan |
| [`src/world/`](https://github.com/Holdi601/3DHeat/tree/main/src/world) | Bakgrunnur heimsins |
| [`src/units/`](https://github.com/Holdi601/3DHeat/tree/main/src/units) | Mælieiningar |
