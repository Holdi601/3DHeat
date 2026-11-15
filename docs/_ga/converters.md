---
title: "Coinbhertóirí coinníonn gach rud"
parent: "Sonraí a iontráil"
nav_order: 8
lang: "ga"
source: "converters.md"
source_hash: "49681e8e32b2"
translated: true
outdated: false
---

# Coimeádann tiontaithe gach rud

Ní gá an leathanach seo chun athsheinm a oscailt. Tá sé do dhaoine a scríobhann uirlisí a iompaíonn comhaid chluiche ina dtáblaí 3DHeat, agus do dhuine ar bith ar mian leo a fháil amach cén fáth a bhfuil an oiread sin sna táblaí sin.

Leanann gach uirlis a iompaíonn athsheinm, demo, logchomhad nó teilimeatracht bheo de chluiche ina rud is féidir leis an amharcán a oscailt riail amháin:

> **Tiontaigh gach rud atá sa fhoinse is féidir a léamh anois, agus coinnigh an chuid eile slán, ionas gur féidir é a léamh níos déanaí gan an comhad bunaidh.**

Is minic a imíonn athsheinm tar éis nuashonraithe cluiche, athshuiteála nó diosca lán, agus imíonn sruth beo an nóiméad a seoladh é. Is go deo a chailltear an rud a chaitheann tiontaire; is féidir an rud a choinníonn sé slán a dhíchódú an lá a thuigeann duine éigin é. Mar sin ní chinneann tiontaire riamh cad a bheidh úsáideach: díchódaíonn sé a bhfuil ar a chumas aige, coinníonn sé gach teachtaireacht, paicéad, imeacht, airí nó líne eile gan athrú in aice leis an tábla, agus deir sé ina aschur féin cé mhéad de gach rud a léigh sé agus cé mhéad a choinnigh sé amháin.

Is é an leathanach seo an coinbhinsiún a roinneann gach tiontaire: tiontaithe athsheinmeanna War Thunder, World of Tanks, World of Warships agus Squad, an tiontaire demo CS2, an faireoir cúlra (a dhíchódóir athsheinm Dota agus gach oiriúntóir beo), léitheoirí teilimeatrach uirlis ghabhála an chluiche, agus iompórtálacha an amharcáin féin (Tacview ACMI, OCAP, GPX/KML/IGC/FIT/NMEA). Tá cur síos ar léitheoirí an amharcáin féin i [Taifid Tacview](tacview-acmi.md) agus [Comhaid a lódáil](loading-files.md); is é [Comhad amháin in aghaidh an chluiche](container.md) an fhoirm aonchomhaid. Déanann cluiche amháin tábla, `match.json` agus sidecars, agus pacáiltear iad go roghnach i gcomhad `.3dheat` amháin. Tá alt **Iomláine** ag README gach uirlise a liostaíonn, don fhoinse sin, cad a léitear, cad a choinnítear amh, agus cad nach bhfuil ar fáil, agus cén fáth.

## Trí bhaile do gach mír {#three-homes-for-every-item}

Críochnaíonn gach rud atá sa fhoinse i gceann amháin de thrí áit go díreach:

| Baile | Cad a théann ann |
|---|---|
| **Díchódaithe** | An tábla (sraith amháin in aghaidh samplaí nó imeachta, na colúin a léann an t-amharcán, colúin bhreise do gach luach eile a bhaineann le sraith) agus doiciméad an chluiche `<match>.match.json` (gach rud a bhaineann leis an gcluiche mar iomlán: socruithe, liostaí, torthaí, scórchláir, an féin-seiceáil). |
| **Coinnithe amh** | Sidecar in aice leis an tábla: gach mír nach ndíchódaítear, nó nach ndíchódaítear ach go páirteach, ina hiomláine agus gan athrú, lena cineál, a am agus an t-aonad nó an eintiteas a bhaineann léi. |
| **Ar fáil** | Ainmnithe in alt Iomláine an README leis an gcúis: ní iompraíonn an fhormáid é (níl ionchuir imreoirí eile ag athsheinm cliant), ní sheolann an fhoinse riamh é, nó ní cheadaítear é a léamh (próiseas cosanta, bloc criptithe a bhfuil a eochair ní linne a úsáid). |

Mír atá **go páirteach** díchódaithe, tá sí díchódaithe *agus* coinnithe amh: faigheann an tábla an rud a thuigtear, faigheann an sidecar an mhír iomlán, ionas nach gá don dhíchódóir níos fearr ina dhiaidh sin an comhad bunaidh a bheith ann.

Níl ceathrú háit ann. Rud a chaitheamh amach mar gur cosúil go raibh sé gan úsáid, mar gur macasamhail "is dócha" é, nó mar go raibh sé mór, is locht é. Ní cheadaítear tanú ach sa tábla (ceamara ag 2 Hz in ionad 60), riamh sa sidecar.

## Sidecars {#sidecars}

Is comhad Parquet é sidecar in aice leis an tábla, agus ainmnítear é as:

```
<folder>/<match>.parquet              the table
<folder>/<match>.match.json           the match document
<folder>/<match>.<what>.parquet       a sidecar
```

Is focal amháin ón liosta seo é `<what>`. Roghnaíonn tiontaire nua an focal a oireann, nó cuireann sé ceann nua leis anseo **agus** le `SIDECAR_PARQUET` i [`src/data/filePick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts), ionas go bhfágann an t-amharcán ar lár é nuair a lódáiltear fillteán iomlán.

| `<what>` | Coinníonn | Úsáidtear ag |
|---|---|---|
| `messages` | paicéid, glaonna modh eintitis agus nuashonruithe airíonna de shruth líonra, ina hiomláine | War Thunder, World of Tanks, World of Warships |
| `flight` | iontrálacha samhla eitilte in aghaidh an aerárthaigh, ina hiomláine | War Thunder |
| `packets` | frámaí iomlána agus teachtaireachtaí líonra, nó píosaí coimeádáin, lasmuigh de shruth na n-eintiteas | CS2, Dota 2, Squad |
| `events` | imeachtaí cluiche lena n-eochracha go léir, mar a thugann an parsálaí iad | CS2 |
| `entities` | nuashonruithe eintiteas agus airíonna, glaonna iargúlta, cainéil a osclaíodh agus a dúnadh, lena n-onnmhaithe a theastaíonn ó dhíchódóir | Squad, Dota 2 |
| `props` | gach airí eintitis a léann an parsálaí, gach uair a d'athraigh sí | CS2 |
| `units` | staid in aghaidh an aonaid lasmuigh den tábla suite | Dota 2 |
| `combatlog` | logchomhad comhraic, gach iontráil lena réimse go léir | Dota 2 |
| `strings` | gach iontráil de gach tábla teaghrán | CS2, Dota 2 |
| `objectives` | crioscha gabhála agus cuspóirí, gach athrú lena am | War Thunder |
| `raw` | sruth beo: gach paicéad, líne, doiciméad API nó léamh cuimhne a fhaightear, ina hiomláine | seisiúin an fhaireora (`heat.raw.parquet`), taifeadáin lap uirlis ghabhála an chluiche (`<stamp>_<game>.raw.parquet`), comhaid athsheinm osu!, LoL agus Valorant an fhaireora |

Léimeann lódáil fillteáin an amharcáin gach `*.<what>.parquet` den liosta seo, agus gach `*.match.json`, `*.meta.json`, `*.summary.json` agus na sidecars JSON eile; oscailt ceann acu ina n-aonar, trí an comhad sin amháin a roghnú nó a scaoileadh, lódálann sé mar aon tábla eile (féach [Comhaid a lódáil](loading-files.md)).

Is iad seo na comhaid mar a scríobhann tiontaire iad le `--loose`. De ghnáth pacáiltear tiontaithe War Thunder, CS2 agus Tacview tábla, doiciméad agus sidecars cluiche amháin i gcomhad amháin, `<match>.3dheat`, faoi na hainmneacha céanna (féach [Comhad amháin in aghaidh an chluiche](container.md)); bíonn an rud seo go léir fíor do gach comhalta.

### Colúin {#columns}

Is mír amháin gach sraith sidecar. Is iad seo na colúin, san ord seo, a bhaineann:

| Colún | Cineál | Cad é |
|---|---|---|
| `time` | float64 | soicindí ar an gclog céanna le `time` an tábla (nó `tick` nuair a chomhaireann an fhoinse ticeanna; ansin an dá cheann) |
| `type` | teaghrán (foclóir) | cad é an mhír, i dtéarmaí na foinse féin: cineál paicéid, aitheantas teachtaireachta, ainm imeachta, cosán airí, réimír líne |
| `name` | teaghrán (foclóir) | a hainm nuair a bhíonn ceann ar eolas (ainm pobail, ainm aicme), seachas folamh |
| `entity` / `unit` / `uid` / `player` | slánuimhir nó teaghrán | cé leis a bhaineann sí, sna haitheantais chéanna leis an tábla, ionas gur féidir sraith an sidecar a nascadh le rian |
| `decoded` | teaghrán (JSON) | cad a thuigtear di, nuair a bhíonn rud ar bith ann; seachas sin folamh |
| `payload` | dénártha | beart na míre, ina hiomláine agus gan athrú (foinsí dénártha) |
| `text` | teaghrán | téacs na míre, ina hiomláine agus gan athrú (foinsí téacs: líne logchomhaid, réad JSON, bloc eochair-luach) |

Ceadaítear colúin bhreise (fritháireamh giotán, méid, cainéal). Ionchódaítear teaghráin a athraíonn mar fhoclóir agus scríobhtar an comhad le zstd, mar sin is codán de mhéid an athsheinm féin atá sa sidecar.

Caithfidh sidecar a bheith leordhóthanach ina aonar: ní léann díchódóir a scríobhtar ina dhiaidh sin an sidecar ach riamh an athsheinm bhunaidh. Nuair nach féidir mír a thuiscint gan comhthéacs (aicme eintitis, tábla teaghrán, eochair a dtagraíonn teachtaireacht dó), cuirtear an comhthéacs sa sidecar freisin, nó sa doiciméad cluiche.

### Foinsí beo {#live-sources}

Níl comhad ar bith ag oiriúntóirí beo (teilimeatracht UDP, cuimhne roinnte, logchomhad cluiche, API áitiúil) chun dul ar ais chuige ar chor ar bith. Taifeadann siad **gach réimse a sheolann an fhoinse**, fiú iad siúd nach n-úsáideann rud ar bith fós:

- sruth paicéad: gach paicéad ina iomláine, `payload` an beart, `type` a aitheantas nó formáid paicéid, ag an ráta a thagann sé;
- cuimhne roinnte nó API a vótáiltear: gach réimse de gach léamh, mar cholúin ainmnithe nó an bloc iomlán mar `payload`, ag an ráta a léann an t-oiriúntóir;
- logchomhad: gach líne, `text` an líne, `type` cineál na líne, lena n-áirítear línte nach ndéanann an t-oiriúntóir gníomh orthu.

Téann siad seo isteach i `<session>.raw.parquet` in aice le tábla an tseisiúin. Is é an méid praghas an riail; coinnítear síos é le ionchódú zstd agus foclóra, ní trí rudaí a fhágáil ar lár.

## An féin-seiceáil {#the-self-check}

Scríobhann gach tiontaire, isteach ina dhoiciméad cluiche (nó `meta.json` an tseisiúin, nó achoimre nuair nach bhfuil doiciméad cluiche aige), bloc `completeness` faoi `selfCheck`:

```json
"selfCheck": {
  "completeness": {
    "rule": "https://github.com/Holdi601/3DHeat/blob/main/docs/converters.md",
    "sidecars": ["match-0001.events.parquet"],
    "types": {
      "player_death": {"seen": 182, "decoded": 182, "partial": 0, "raw": 0, "lost": 0},
      "bullet_damage": {"seen": 2410, "decoded": 0, "partial": 0, "raw": 2410, "lost": 0}
    },
    "lost": 0
  }
}
```

| Réimse | Brí |
|---|---|
| `seen` | cé mhéad mír den chineál seo atá ag an bhfoinse |
| `decoded` | léite go hiomlán isteach sa tábla nó sa doiciméad cluiche |
| `partial` | léite go páirteach isteach sa tábla nó sa doiciméad, agus coinnithe ina hiomláine i sidecar |
| `raw` | coinnithe ina hiomláine i sidecar amháin, gan díchódú |
| `lost` | `seen - decoded - partial - raw`: caithfidh sé a bheith 0 |

Is é `lost` ar an leibhéal is airde an suim. Dearbhaíonn tástálacha tiontaire go bhfuil sé 0 ar a gcuid samplaí sintéiseacha, agus deir an README cad a bhí sé ar cheann fíor. Is é `lost` neamhnialach an tiontaire ag rá gur bhris sé an riail; ainmníonn sé an cineál, ionas gur féidir an bhearna a aimsiú.

Is iad na "cineálacha" cinn na foinse féin: cineálacha paicéid, aitheantais teachtaireachta, ainmneacha imeachta, grúpaí airí, cineálacha líne. Comhairítear iad san áit a bhuaileann an tiontaire leo, ní ó liosta de na rudaí a bhfuil súil aige leo, ionas go dtaispeántar cineál nach raibh aon duine ar an eolas faoi lena chomhaireamh in ionad a bheith imithe ar iarraidh.

## Alt Iomláine an README {#the-readmes-completeness-section}

Tá alt ag README gach tiontaire dar ceannteideal **Iomláine**, le trí liosta:

- **Léite**: cad a théann isteach sa tábla agus sa doiciméad cluiche, agus conas a seiceáladh gach réimse nua i gcoinne rud neamhspleách (uimhreacha féin an chluiche, dara foinse, taifead a rinneadh go sonrach chuige).
- **Coinnithe amh**: cad atá i cén sidecar, faoi cén `type`, agus cad is eol faoi go dtí seo.
- **Ar fáil**: cad nach n-iompraíonn an fhoinse nó nach gceadaítear a léamh, agus cén fáth.

Nascann sé ar ais go dtí an leathanach seo.

## Cá bhfuil gach tiontaire {#where-each-converter-stands}

| Tiontaire | Sidecars | A alt Iomláine |
|---|---|---|
| Athsheinmeanna War Thunder | `messages`, `flight` | [README 3DHeat-Ext-WarThunder](https://github.com/Holdi601/3DHeat-Ext-WarThunder#the-sidecars) (tá a chomhaireamh féin-seiceála faoi `counts`; tá an bloc `completeness` le teacht) |
| Athsheinmeanna World of Tanks | `messages` | [README 3DHeat-Ext-WoT](https://github.com/Holdi601/3DHeat-Ext-WoT#completeness) |
| Athsheinmeanna World of Warships | `messages` | [README 3DHeat-Ext-WoWs](https://github.com/Holdi601/3DHeat-Ext-WoWs#completeness) |
| Demonstrations freastalaí Squad | `entities`, `packets` | [README 3DHeat-Ext-Squad](https://github.com/Holdi601/3DHeat-Ext-Squad#completeness) |
| Demonstrations CS2 | `events`, `props`, `strings`, `packets` | [README 3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2#completeness) |
| Athsheinmeanna Dota 2 (faireoir) | `packets`, `entities`, `strings`, `units`, `combatlog` | [Athsheinmeanna Dota 2](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/game-dota-replays.md) |
| Athsheinmeanna osu!, LoL, Valorant (faireoir) | `raw` | a leathanaigh féin i [doiciméid an fhaireora](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs) |
| Oiriúntóirí beo (faireoir) | `raw` | leathanach gach cluiche i [doiciméid an fhaireora](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs), agus [forbairt](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/development.md) le haghaidh `Session.raw` |
| Taifeadáin lap (uirlis ghabhála an chluiche) | `raw`, agus beart `unparsed` laistigh de chomhad lap Forza | [README 3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture#completeness) |
| Iompórtálacha féin an amharcáin | aon cheann: féach thíos | an leathanach seo |

### Iompórtálacha féin an amharcáin {#the-viewers-own-imports}

Léitear Tacview ACMI, OCAP agus na formáidí GPS sa bhrabhsálaí ón gcomhad féin an úsáideora; ní stórálann an t-amharcán aon rud díobh, mar sin fanann an comhad féin mar an taifead. Léitear an oiread agus is féidir leo fós:

- **Tacview ACMI** (`src/data/acmi.ts`): gach líne réad a bhfuil suíomh aici ina sraith le gach airí a iompraíonn an taifead, gach imeacht ina sraith, gach baint ina sraith, airíonna féin an taifid (leis an FileType agus FileVersion ón gceanntásc) ar gach sraith mar `RecordingInfo`; is imeacht `Comment` línte tráchta, réad nach bhfaigheann suíomh riamh ina shraith `Unplaced` ag an bpointe tagartha, agus is colúin iad U/V aon uair a bhíonn siad ag aon sraith. Léitear líne airí gan suíomh go páirteach: cuirtear a luachanna chuig an tsraith eile den réad, ní ag an am a bhaineann leo. Comhairíonn `AcmiTable.completeness` línte an chomhaid de réir cineáil.
- **OCAP** (`src/data/ocap.ts`): frámaí, lámhaigh, marcóirí gach aonad, gach cineál imeachta (cineálacha anaithnide mar shraitheanna "Mission" lena dtéacs) agus réimsí féin an doiciméid (`Info`). Níl sé léite fós: réimsí eintitis agus eilimintí suímh iarmhartacha seachas iad siúd atá liostaithe ina cheanntásc (breiseáin taifeadóra níos nuaí), agus frámaí athfhillte aonaid mharbh tar éis a báis (tanaithe d'aon ghnó: ní athraíonn rud ar bith iontu).
- **Formáidí GPS** (`src/data/geoTracks.ts`): na pointí suímh, a n-am, airde, cúrsa agus luas, agus cróga croí, cadence, cumhacht, teocht, satailítí, HDOP agus airde brú i gcás ina logálann an comhad iad. Níl léite fós: síntiúis GPX agus KML eile, abairtí NMEA seachas na cinn suímh, taifid IGC seachas pointí suímh agus a síntiúis, agus teachtaireachtaí FIT seachas taifid (lapaí, seisiúin, faisnéis gléis).

Liostaítear na bearnaí seo chun iad a dhúnadh, ní chun leithscéal a ghabháil leo; ní scríobhann easpórtálacha an amharcáin de thaifead lódáilte (`src/data/exportRecording.ts`) ach an rud a léadh.

## Tiontaire nua a chur leis {#adding-a-converter}

1. Liostaigh cad a iompraíonn an fhormáid, ó na doiciméid, ó na struchtúir féin, nó trí gach cineál teachtaireachta i samplaí fíora a chomhaireamh. Is é an liosta `types` an fhéin-seiceála.
2. Díchódaigh an rud is féidir a sheiceáil anois. Seiceáiltear gach réimse nua i gcoinne rud neamhspleách sula dtéann sé isteach sa tábla; fanann réimse nach féidir a sheiceáil fós amh.
3. Coinnigh an chuid eile slán ina hiomláine i sidecar a ainmnítear mar thuas, leis na colúin thuas.
4. Scríobh an bloc `completeness` agus tástáil go bhfuil `lost` 0 air.
5. Scríobh alt Iomláine an README agus nasc chuig an leathanach seo.
6. Má tá `<what>` an sidecar nua, cuir leis an tábla thuas agus le `SIDECAR_PARQUET` in `src/data/filePick.ts`.

Scríobhtar tiontaithe "go glan": ó fhormáidí, ó dhoiciméid agus ó shamplaí, riamh ó chód GPL nó AGPL. Fanann samplaí d'athsheinmeanna fíora ar an meaisín a rinne iad; úsáideann tástálacha comhaid shintéiseacha.
