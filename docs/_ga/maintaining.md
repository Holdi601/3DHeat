---
title: "Na doiciméid a choinneáil"
nav_order: 23
lang: "ga"
source: "maintaining.md"
source_hash: "4a4fb46273e5"
translated: true
outdated: false
---

# Leabharlann a chothabháil

Is don duine a bhreathnaíonn i ndiaidh an léirsitheora agus an tsuímh seo an leathanach seo. Liostaítear ann na céimeanna chun na leathanaigh, na pictiúir agus na haistriúcháin a choinneáil ceart tar éis athraithe.

Déantar an suíomh seo a sheiceáil arís le **gach scaoileadh** agus aon uair a athraíonn rud éigin go mór: eochracha, an bealach tríd an UI, socruithe, formáidí comhad. An liosta seiceála:

1. **Athghin na leathanaigh tagartha**: `node tools/docs-refs.mjs` (agus `--lang <lang>` do gach teanga). Teipeann `node tools/docs-refs.mjs --check` nuair a bhíonn leathanach as dáta.
2. **Athghin na scáileán** ón [tacar sonraí demo](demo-data.md). Úsáid ríomhaire nó coimeádán a bhfuil a réigiún en-US, ionas go léitear uimhreacha `0.35` agus ní `0,35` (follaíonn na boscaí uimhreacha réigiún an bhrabhsálaí go dtí go n-athraítear iad). Déan na sonraí demo le `node tools/demo-data.mjs`, cuir freastalaí forbartha ar chalafort 5321 **gan** paca figiúr áitiúil, `HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1`, agus ansin rith `node tools/docs-shots.mjs --lang <lang>`. Féach ar gach pictiúr: ainmneacha demo amháin (*Demo Valley*, *Blue 1*, *Red 3* ...), gan léarscáileanna fíora, imreoirí ná taifeadtaí.
3. **Liostaigh cad a athraigh** ón gclib scaoilte is deireanaí: `git log --oneline <last tag>..HEAD`, agus an chuid **Docs** de `CHANGELOG.md`, a mhapálann gach gné lena leathanach. Teastaíonn leathanach nó cuid ó gach gné nua, agus pictiúr dá dtaispeántar ar an scáileán.
4. **Athbhreithniú neamhspleách** ar na leathanaigh Bhéarla ag duine nár scríobh iad, do thrí léitheoir: tosaitheoir, páiste ocht mbliana d'aois, saineolaí. An bhfuil na céimeanna iomlán agus san ord ceart, na focail sin an UI, na pictiúir reatha, lipéid na léaráidí ceart?
5. **Socraigh an rud a fuair an athbhreithniú.**
6. **Athaistrigh na leathanaigh athraithe** de réir a n-hash foinse, ansin rith an athbhreithniú in aghaidh an teanga. Féach `tools/docs-translate.md`.
7. **Scan le haghaidh téarmaí rúnda** thar na comhaid athraithe, agus seiceáil nach dtaispeánann pictiúr ar bith ach sonraí demo.
8. **Foilsigh** ach nuair a bheidh an scaoileadh ceadaithe.

Clúdaíonn an seiceáil chéanna suímh doiciméadaithe na stór gaolmhar (féach an leathanach [Baile](index.md#related-repositories)).

## Na huirlisí faoi exporters/ {#the-tools-under-exporters}

Is tionscadail phoiblí ar leithligh iad na huirlisí timpeall an léirsitheora, gach ceann acu lena cheadúnas MIT féin, scaoiltí, vicí agus seiceáil nuashonraithe féin, agus pionnáilte sa stór seo mar fho-mhodúil git:

| Fillteán | Stór |
|---|---|
| `exporters/gamefiles/` | [3DHeat-GameFiles](https://github.com/Holdi601/3DHeat-GameFiles) - cúrsaí agus leibhéil as cartlanna féin na gcluichí |
| `exporters/gamecapture/` | [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture) - taifeadtaí telemetry timthriall; leibhéil ó fhíseán imeartha |
| `exporters/unreal/` | [3DHeat-UnrealExporter](https://github.com/Holdi601/3DHeat-UnrealExporter) - breiseán Unreal Editor |
| `exporters/cs2/` | [3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2) - demos agus léarscáileanna CS2 |
| `exporters/watcher/` | [3DHeat-Watcher](https://github.com/Holdi601/3DHeat-Watcher) - taifeadann cluiche sa chúlra |

**Pionnáilte** ciallaíonn sé go dtaifeadann an stór seo tiomantas beacht amháin de gach uirlis. Faigheann seiceáil amach den léirsitheoir na tiomantais sin:

```bash
git clone --recursive https://github.com/Holdi601/3DHeat
# or, after a plain clone:
git submodule update --init
```

Rithann an dá chonair nuashonraithe thuas `git submodule update --init` tar éis tarraingthe, ionas go leanann na huirlisí an léirsitheoir go dtí na tiomantais a phionnálann a leagan is nuaí - ní tiomantais is nuaí na n-uirlisí féin. Sroicheann scaoileadh níos nuaí uirlise an léirsitheoir nuair a bogtar an pionna anseo: déantar athruithe ar uirlis a thiomantú agus a bhrú ina fillteán féin (a stór féin) ar dtús, ansin tiomantar an pionna nua anseo. Seiceálann gach uirlis a scaoiltí nuaí féin freisin; doiciméadaítear sin ina stór féin.
