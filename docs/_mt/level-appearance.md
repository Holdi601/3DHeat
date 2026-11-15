---
title: "Dehra tal-livell"
parent: "Livelli u ġeometrija tal-isfond"
nav_order: 3
lang: "mt"
source: "level-appearance.md"
source_hash: "c883749baedd"
translated: true
outdated: false
---

# Id-dehra tal-livell

Dawn il-kontrolli jibdlu kif jidher livell 3D, sabiex is-sħana toħroġ minnu u tibqa' tinqara l-post. Ebda ħaġa hawn ma tibdel id-dejta.

## Bidu malajr {#quick-start}

1. Tagħbi livell 3D ([Livelli 3D](model-levels.md)).
2. F'**Sfond / livell**, naqqas **Luminożità** sakemm is-sħana tkun l-iktar ħaġa brillanti fuq l-iskrin.
3. Iftaħ **Riljev tal-art** u żid **Dellijiet tal-inklinazzjoni** jew **Qawwa tal-kontorni** sakemm tkun tista' tgħid għolja minn pjanura.
4. Iftaħ **Strutturi**. Naqqas **Opaċità tal-uċuħ** biex tara ġewwa l-bini, jew ixgħel **Texture tal-istrutturi** biex tarahom sodi.
5. Jekk l-art għandha stampa mpinġija fuqha, ipprova **Texture tal-art** mitfija u mixgħula.

![It-taqsimiet Riljev tal-art u Strutturi miftuħa, bil-livell muri b'indizji tar-riljev](../assets/img/en/level-appearance-sections.webp)

Meta livell [3D](model-levels.md) ikun mgħobbi, il-pannell Sfond / livell juri dawn il-kontrolli. Id-default huma dawk li livell ġdid importat jieħu ([`modelLevelFrom`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/LevelPanel.tsx), [`level.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts)). Il-bidliet jerġgħu jpittru biss ix-xena; l-akkumulazzjoni tas-sħana tinżamm.

## Il-livell kollu {#the-whole-level}

| Kontroll | Default | Firxa | Tifsira |
|---|---|---|---|
| **Opaċità** | 100% | 0-100% | Taħt 100% il-livell jitħallat u ma jikteb ebda fond, u għalhekk ma jibqax [joħbi](depth-and-culling.md) is-sħana. |
| **Luminożità** | 0.9 | 0-2 (jog 64) | |

Il-livell jinġibed b'ftit kulur - art griża, qoxra mqattra - sabiex is-sħana tkun l-unika ħaġa mimlija kulur fuq l-iskrin. B'differenza minn [immaġni ta' mappa](map-images.md), livell 3D m'għandux slider ta' Ma-kulur.

## Riljev tal-art {#ground-relief}

Mill-bogħod għolja u pjanura jidhru l-istess griż, għalhekk il-viewer iżid tliet indizji. Kull wieħed iwieġeb għal problema differenti:

| Kontroll | Default | X'jagħmel |
|---|---|---|
| **Spazju bejn il-kontorni** | mill-firxa tal-għoli tal-art | L-għoli bejn linji kontorni, logaritmiku minn 1/4000 sa 1/2 tal-firxa tal-għoli tal-livell; l-iktar baxx tal-binarju hu *mitfi*. Id-default hu 1/40 tal-firxa tal-għoli tal-art imdawwar għal passu 1/2/5 - linji ta' 10 m jaqblu ma' dwiefer għolja u ma jservu xejn fuq is-sular ta' ħofra. Kull 5 linja tinġibed iktar qawwija. Il-kontorni jinġibdu fl-ispazju tal-iskrin, allura jibqgħu pixel wiesa' f'kull zoom, u huma l-unika indizju li jibqa' fuq art li hi ftit wisq tal-ħġieġ biex tiġi ddarrat xejn. |
| **Qawwa tal-kontorni** | 35% | 0-100% |
| **Dellijiet tal-inklinazzjoni** | 55% | Iniżżel skont il-ħadid, sabiex il-wiċċiri u l-irdumijiet jinqraw minn kull angolu tal-kamera - għall-kuntrarju ta' dawl, li jiċċattja kull meta tħares lejh. |
| **Rampa tal-elevazzjoni** | 50% | L-art l-baxxa iktar skura, l-art għolja iktar ċara, madwar il-firxa tal-għoli tal-art: il-forma fuq skala kbira. |

L-intestatura tat-taqsima turi l-istat tal-kontorni: *kull N m*, l-ispazju tal-kontorni, jew *l-ebda kontorn* meta l-ispazju jkun mitfi.

## Wiċċ l-art {#ground-surface}

| Kontroll | Default | Jidher meta | Tifsira |
|---|---|---|---|
| **Ilma** | mixgħul | il-livell għandu ilma | Lagi, xmajjar u l-baħar, imqiegħda ċatti f'blu-griż ċar: l-ebda indizju tat-terren ma japplika għal wiċċ li hu ċatt skont id-definizzjoni. |
| **Opaċità tal-ilma** | 60% | L-ilma huwa mixgħul | Il-kosta u l-art taħt il-bassi jidhru mill-ilma traslucidu. |
| **Trijangoli tal-art** | 30% (0 għal livell b'texture) | dejjem | It-truf stess tat-terren imqiegħda fuq il-wiċċ iddarrab, u jisparixxu bejn 6% u 25% tal-wisa' tal-livell mill-kamera. Juri kemm kienet imkejla b'mod approssimattiv l-art u tagħti lil dellija xi ħaġa biex tiġġudika d-distanza minnha. Jinbena meta tintuża l-ewwel darba, u dan jieħu ftit ħin f'livell kbir. |
| **Art bħala wireframe biss** | mitfi | dejjem | Tieħu post il-wiċċ tat-terren bit-truf tiegħu. Skematiku għal kollox - jitlef ukoll id-dellijiet, il-kontorni u l-okkluzjoni, għalhekk *Trijangoli tal-art* hi normalment l-aħjar għażla. |
| **Texture tal-art** | mixgħul | il-livell għandu texturi | Jiddisinja l-art bil-texturi li l-fajl iġorr (asfalt, ħaxix tat-triq, ħaxix). Id-dawl tal-mesh jitqiegħed bil-ħafif fuqhom, għax it-texture diġà fiha r-riljev fin tagħha stess. **Luminożità** hi l-mod kif tikkalmha taħt is-sħana; Ma-kulur jappartjeni lill-istampi tal-mappa. |
| **Kulur maqbud** | mitfi | il-livell għandu kuluri tal-vertexes | Idaqqas l-art bil-kulur li skanjar qabad minflok griż - triq rikostruwita inkella ma tinfarragx mit-tarf tagħha. Esportazzjonijiet tal-magni ma jġorru ebda; meta jkunu nieqsa l-pannell jgħid *Dan il-livell ma jġorr ebda kulur.* |

## Strutturi {#structures}

L-intestatura **Strutturi** turi l-għadd tat-trijangoli tal-istrutturi; l-hint hawn taħtha jgħid kif jinġibdu (*miġbuda sodi fit-texturi tagħhom* jew *miġbuda bħala qoxra trasparenti biex tara s-sħana ġewwa fihom*) u kemm partijiet huma strutturi.

| Kontroll | Default | Tifsira |
|---|---|---|
| **Texture tal-istrutturi** | mixgħul meta l-istrutturi jġorru texturi | Jinġibdu sodi, fit-texturi tagħhom. Meta jixgħel, l-opaċità tal-uċuħ tmur għal 100% u t-truf jitfew; meta jintfa', terġa' lura għall-qoxra trasparenti mtenninha b'25%. Struttura b'texture tiddi mill-ġenb li jara l-kamera, għax sinjal huwa żewġ uċuħ spalla ma' spalla u dik li tirbaħ it-test tal-fond hija kwistjoni ta' rounding. |
| **Truf tal-wireframe** | mixgħul; mitfi fuq 300,000 trijangolu ta' struttura jew meta jkun b'texture | Truf tal-istrutturi mingħajr duplikati, linja waħda għal kull tarf. |
| **Opaċità tat-truf** | 50% | |
| **Uċuħ tal-qoxra** | mixgħul | Wiċċ dgħif b'ħajt Fresnel dawwiedi, sabiex bini jinqara bħala volum u mhux bħala gaġġa jew nebbiegħa. |
| **Opaċità tal-uċuħ** | 25% (35% fuq 300,000 trijangolu ta' struttura, 100% b'texture) | 0-60% fuq il-binarju, sa 100% bil-maniglja. Żommha baxxa: strutturi sodi jaħbu d-dejta ġewwa fihom. |
| **Truf ħadda** | mixgħul (mitfi meta jkun b'texture) | Idaqqas kull trijangolu bin-normal tiegħu, imħawwad fil-fragment shader minn derivattivi tal-ispazju tal-iskrin. Il-livelli esportati huma mgħaqqda u jġorru normals medji, li jagħmlu kull kantuniera ta' kaxxa "fojl imdewweb"; jekk tqassam kull vertex biex tikkoreġih tmultiplika l-buffer tal-vertexes. Itfih għal livell li l-uċuħ kurvi tiegħu jiswew iktar mill-kantuniera tiegħu. |
| **Tinta tal-istrutturi** | Ċjan | Għażel kulur u l-presets **Ċjan**, **Ambra**, **Vjola**, **Abjad**. |
| **Uri l-klassifikazzjoni tal-partijiet (N)** | | Kull parti, il-klassi tagħha u r-raġuni; ara [Livelli 3D](model-levels.md#ground-structures-and-water). |

## Qtugħ tal-livell {#cutting-the-level}

Il-[Qtugħ](slice.md) u, bil-*Aqta' l-livell ukoll*, il-[qtugħ skont id-distanza](depth-and-culling.md#distance-culling), jaqtgħu l-art, l-istrutturi u l-ilma fl-istess pjanijiet tas-sħana.
