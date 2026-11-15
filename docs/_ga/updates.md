---
title: "Nuashonruithe"
nav_order: 21
lang: "ga"
source: "updates.md"
source_hash: "674c07a79c56"
translated: true
outdated: false
---

# Nuashonruithe

Insíonn an t-amharcóir duit nuair a bhíonn leagan níos nuaí ann, agus nuashonraíonn sé é féin ach amháin nuair a deir tú tá. Ní athraítear rud ar bith ar do ríomhaire gan do fhreagra.

## Nuashonraigh an t-amharcóir {#update-the-viewer}

1. **Sa leathanach.** Nuair a bhíonn leagan níos nuaí ann, tagann bosca faoin ainm ag barr an bharra taoibh: "Tá leagan níos nuaí de 3DHeat ar fáil". Cliceáil **Nuashonraigh anois**. Athlódálann an leathanach é féin nuair a bhíonn sé críochnaithe. **Ar ball** folaíonn an bosca go dtí go n-athlódálann tú an leathanach.
2. **Má deir sé restart.bat a rith**, dún fuinneog an fhreastalaí (an fhuinneog dhubh a d'oscail `start.bat`) agus déan dúbailtcliceáil ar `restart.bat`.
3. **Nuair a thosaíonn tú an t-amharcóir.** Seiceálann `start.bat` freisin. Má tá leagan níos nuaí ann fiafraíonn sé **Update now? [Y/N]**. Brúigh `Y` chun nuashonrú. Brúigh `N`, nó fan 60 soicind gan freagra, chun an leagan atá agat a thosú.

![Fógra na nuashonraithe le Nuashonraigh anois agus Ar ball](../assets/img/en/updates-notice.webp)

Ní nuashonraítear cóip le hathruithe de do chuid féin duit riamh; insíonn an bosca go bhfuil nuashonrú ag fanacht, agus deir sé do chuid athruithe a dhéanamh nó a stóráil, agus `git pull` a rith. Ní thaispeánann cóip nár suiteáladh le git (comhad zip, mar shampla) rud ar bith.

Conas a oibríonn an seiceáil, céim ar chéim:

```
leathanach ---(tar éis 4 s, ansin gach 6 uair)---> freastalaí forbartha ---> git fetch
   taobh thiar?  níl -> ní thaispeántar rud ar bith
                 tá  -> athruithe nó tiomantais de do chuid féin?  tá -> insíonn duit amháin
                                                                  níl -> [Nuashonraigh anois] -> git pull
                                                                          -> athlódáil, nó "rith restart.bat"
```

## Rialacha sábháilteachta {#the-safety-rules}

- **Ar aghaidh amháin (fast-forward)** (`git pull --ff-only`): ní chumasctar, ní athscríobhtar agus ní athbhunaítear rud ar bith le nuashonrú.
- **Gan athruithe áitiúla**: ní nuashonraítear go huathoibríoch seiceáil a bhfuil athruithe gan tiomnú ar a comhaid rianaithe ann (`git status --porcelain --untracked-files=no` nach bhfuil folamh) - ní ceart do nuashonrú obair duine a fhorscríobh. Insítear dó ach go bhfuil nuashonrú ag fanacht. Ní chuntar comhaid gan rianú (sonraí, easpórtálacha) mar athruithe.
- **Gan tiomnuithe áitiúla**: ní nuashonraítear seiceáil a bhfuil tiomnuithe aici nach bhfuil ag an upstream ("scoilte"). Ní thugann ar aghaidh amháin ar aghaidh é, agus is le haghaidh `git pull` de láimh atá cumasc. Deir an leathanach agus `start.bat` araon é sin sna focail chéanna, agus tosaíonn `start.bat` an leagan atá ann.
- **Ón leathanach féin amháin**: caithfidh iarratas nuashonraithe an fhreastalaí forbartha ceannlíne saincheaptha a iompar agus, nuair a sheolann an brabhsálaí `Origin`, teacht ó óstach an fhreastalaí féin (thíos).
- Ní nuashonraítear riamh ach seiceáil git a bhfuil upstream branch aici; caitear le haon rud eile (cóip gan `.git`, gan git suiteáilte, beart statach) mar atá sé agus ní deir sé rud ar bith.

## Cad a dhéanann start.bat {#what-startbat-does}

`start.bat` (déan dúbailtcliceáil air; is é an fhuinneog an freastalaí) déanann, in ord:

1. Aimsíonn Node.js - ar `PATH`, nó i `%ProgramFiles%\nodejs`, `%ProgramFiles(x86)%\nodejs` nó `%LOCALAPPDATA%\Programs\nodejs` - agus tairgeann sé é a shuiteáil le `winget install -e --id OpenJS.NodeJS.LTS` nuair a bhíonn sé ar iarraidh (fiafraítear, Y/N; ina dhiaidh sin caithfear an fhuinneog a athoscailt chun go nglacfadh Windows leis an `PATH` nua).
2. **Nuashonruithe**, nuair a bhíonn git suiteáilte agus `.git` sa fhillteán:
   - `git fetch --quiet` (gan líonra nó gan upstream: léimtear go ciúin);
   - comhaireann `git rev-list --count HEAD..@{u}`; gan aon rud taobh thiar: ní deirtear rud ar bith;
   - athruithe áitiúla: "Tá leagan níos nuaí de 3DHeat ar fáil (N athrú), ach tá athruithe áitiúla sa chóip seo, mar sin ní nuashonraítear é. Déan iad a thiomnú nó a stóráil, ansin rith git pull." - agus tosaíonn sé an leagan atá ann;
   - tiomnuithe de chuid féin (`git rev-list --count @{u}..HEAD` nach 0): "Tá leagan níos nuaí de 3DHeat ar fáil (N athrú), ach tá tiomnuithe ag an gcóip seo nach bhfuil ag an leagan is nuaí, mar sin ní nuashonraítear é. Nuashonraigh le git pull é." - agus tosaíonn sé an leagan atá ann;
   - ar a mhalairt: "Tá leagan níos nuaí de 3DHeat ar fáil (N athrú)." agus an cheist **Update now? [Y/N]**. Clúdaíonn `N`, nó gan freagra ar feadh 60 soicind, "Not updated; starting the version you have." agus tosaíonn sé an leagan atá ann. Ar `Y`: "Updating...", insíonn sé an athraíonn `package.json` nó `package-lock.json`, rithe `git pull --ff-only` (mura n-éiríonn sé sin fós - an líonra, mar shampla: "The update did not go through; starting the version you have."), ansin `git submodule update --init` (na huirlisí pionnáilte, féach [Na doiciméid a choinneáil](maintaining.md#the-tools-under-exporters)), ansin `npm install` nuair a athraíonn na comhaid pacáiste agus go bhfuil `node_modules` ann, agus "Updated."
3. Diúltaíonn sé freastalaí dara a thosú: nuair a bhíonn rud éigin ag éisteacht ar phort **5273** cheana féin deir sé sin agus treoraíonn sé chuig `restart.bat` / `stop.bat`.
4. An chéad rith (gan `node_modules`), fiafraíonn sé sula íoslódálann sé na spleáchais (thart ar 300 MB i `node_modules\`, ní ar fud an chórais).
5. Tosaíonn an freastalaí forbartha ar `127.0.0.1:5273` (`--strictPort`) agus osclaíonn sé an brabhsálaí nuair a bhíonn sé réidh.

Stopann `restart.bat` an freastalaí (de réir an phoirt) agus rithtear `start.bat` arís, mar sin fiafraíonn sé an cheist chéanna. Stopann `stop.bat` an freastalaí amháin.

## Do fhorbróirí {#for-developers}

### Agus é ag rith: an bealach nuashonraithe {#while-it-runs-the-update-route}

Freastalaíonn an freastalaí forbartha (breiseán Vite `heat3d-self-update` in `vite.config.ts`) ar `/__heat3d/update`. Níl sé ann ach ar an bhfreastalaí forbartha - ní sa tógáil statach agus ní i `vite preview`.

**`GET /__heat3d/update`** freagraíonn sé an bhfuil an seiceáil taobh thiar:

```json
{ "checkout": true, "upstream": "origin/main", "behind": 3, "ahead": 0, "dirty": false, "latest": "the newest commit's subject" }
```

- `checkout: false` nuair nach seiceáil git é an fillteán;
- ritheann sé `git fetch --quiet` **ar a mhéad gach 30 nóiméad** (freagraíonn iarratais idir an dá linn ón méid a fuarthas go deireanach);
- `behind` / `ahead` ó `git rev-list --count HEAD..@{u}` / `@{u}..HEAD`, `dirty` ó `git status --porcelain --untracked-files=no`, `latest` teideal tiomantas is nuaí an upstream;
- gan branch upstream, `upstream: null` agus `behind: 0`.

**`POST /__heat3d/update/apply`** tugann an seiceáil suas chun cinn:

1. Diúltaítear le `403 { ok: false, reason: "forbidden" }` mura bhfuil ceannlíne `X-Heat3d-Update: 1` ag an iarratas agus, nuair a iompraíonn sé `Origin`, go bhfuil óstach an bhunaidh sin mar `Host` an iarratais. Ní féidir le foirm trasshuímh ceannlíne saincheaptha a sheoladh gan réamhsheiceáil CORS, nach dtugann an freastalaí seo riamh.
2. Níl rud ar bith le déanamh (ní seiceáil í, gan upstream, nach bhfuil taobh thiar): `{ ok: true, updated: false }`.
3. Athruithe áitiúla: `{ ok: false, reason: "dirty" }`; tiomnuithe áitiúla: `{ ok: false, reason: "diverged" }`.
4. Ar a mhalairt: déanann nóta de na comhaid a athraíonn (`git diff --name-only HEAD @{u}`), `git pull --ff-only` (teorainn 2 nóiméad), `git submodule update --init` (teip neamhaird), `npm install` nuair a athraíonn `package.json` nó `package-lock.json` (teorainn 15 nóiméad), agus freagraíonn `{ ok: true, updated: true, restart }` - insíonn `restart` cén fáth nach féidir leis an bhfreastalaí atá ag rith an nuashonrú a ghlacadh: `"dependencies"` nuair a athshuiteáladh iad, `"config"` nuair nach athraíodh ach comhad `vite.config`, `false` nuair nach gá athrú.
5. Freagraíonn teip git nó npm le `{ ok: false, reason: "<an earráid, suas le 300 carachtar>" }`.

Is JSON iad freagraí le `Cache-Control: no-store`. Ní éisteann an freastalaí ach ar `127.0.0.1`, mar sin ní fhaightear an bealach ón líonra.

### An fógra sa leathanach {#the-notice-in-the-page}

`UpdateBanner`, faoin ainm ag barr an bharra taoibh:

- Iarrann sé ar an mbealach **4 shoicind** tar éis an leathanach a lódáil (ní sna chéad soicindí: tá tacar sonraí le lódáil ag an leathanach agus GPU le tosú) agus arís **gach 6 uair** fad is a fhanann an leathanach ar oscailt.
- Taispeánann sé **rud ar bith** nuair nach bhfuil an bealach ann (tógáil statach), nach seiceáil é an fillteán, nó nach bhfuil rud ar bith níos nuaí - fógra ar gach tosú is rud é a bhfoghlaimíonn daoine neamhaird a dhéanamh air.
- Taobh thiar, gan athruithe áitiúla: "Tá leagan níos nuaí de 3DHeat ar fáil (N athrú, an ceann is nuaí: <teideal>)." le **Nuashonraigh anois** agus **Ar ball** (*Ar ball* folaíonn é go dtí go n-athlódáiltear an leathanach).
- Taobh thiar, le hathruithe áitiúla: an abairt chéanna agus "Tá athruithe áitiúla sa chóip seo, mar sin ní nuashonraítear go huathoibríoch í; déan commit nó stash orthu, ansin rith git pull." - gan cnaipe.
- **Nuashonraigh anois** postálann chuig `/apply` ("Updating..."). Ansin:
  - "Nuashonraithe. Athlódáiltear an leathanach." - agus athlódálann sé 1.5 s ina dhiaidh sin (tá na comhaid nua á bhfreastal cheana ag an bhfreastalaí);
  - nuair a athshuiteáladh na spleáchais: "Nuashonraithe. D'athraigh a spleáchais: dún fuinneog an fhreastalaí agus rith **restart.bat** chun críochnú.";
  - nuair nach athraíodh ach socruithe an fhreastalaí: "Nuashonraithe. D'athraigh socruithe an fhreastalaí: dún fuinneog an fhreastalaí agus rith **restart.bat** chun críochnú.";
  - nach bhfuil rud ar bith le tabhairt isteach tar éis an tsaoil (`updated: false` - tugadh an chóip suas cheana, ag `start.bat` mar shampla): "Níl aon rud le nuashonrú: is é an leagan is nuaí an chóip seo cheana féin." - agus gan athlódáil;
  - diúltaithe: an abairt *dirty*, nó "Tá a commits féin sa chóip seo nach bhfuil sa leagan is nuaí; nuashonraigh í le git pull.", nó "Níor éirigh leis an nuashonrú: <reason>".
