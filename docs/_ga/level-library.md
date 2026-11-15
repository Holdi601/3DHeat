---
title: "Leabharlann leibhéal"
parent: "Leibhéil agus geoiméadracht chúlra"
nav_order: 4
lang: "ga"
source: "level-library.md"
source_hash: "23ff3290af7e"
translated: true
outdated: false
---

# Leabharlann leibhéal

Coinníonn an leabharlann do leibhéil sa bhrabhsálaí seo ionas nach gcaithfidh tú iad a lódáil agus a shimpliú arís. **Má ghlanann tú sonraí an tsuímh sa bhrabhsálaí scriosann sé an leabharlann, agus níl aon easpórtáil ann.** Coinnigh do chomhaid bhunaidh.

Tá próiseáil leibhéil - parsáil, aicmiú, cuimhsiú, díorthú, pacáil uigeacht - mall, agus is mar an gcéanna an toradh gach uair. Coinníonn an **Leabharlann** ag bun phainéal an Chúlra / Leibhéil leibhéil phróiseáilte sa bhrabhsálaí seo, ionas nach dtógtar líonra díorthaithe faoi dhó riamh ([`levelLibrary.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/levelLibrary.ts)).

## Sábháil agus athlódáil leibhéal {#save-and-reload-a-level}

1. Lódáil íomhá léarscáile nó samhail 3D agus seiceáil go bhfuil sé ceart.
2. Brúigh **Sábháil sa leabharlann**. Deir an painéal *Sábhálta. Lódálfar láithreach an chéad uair eile é.*
3. An chéad uair eile, oscail liosta na **Leabharlainne** agus brúigh ▸ ar an leibhéal.
4. Brúigh ✕ chun iontráil nach dteastaíonn uait a scriosadh.

## Ag úsáid é {#using-it}

| Rialaithe | Éifeacht |
|---|---|
| **Sábháil sa leabharlann** | Stórálann sé an leibhéal reatha. Stórálfar íomhá léarscáile mar PNG lena dhá ancaire; samhail mar a maolán próiseáilte. Deir an painéal *Sábhálta. Lódálfar láithreach an chéad uair eile é.* |
| Liosta na leabharlainne | Sraith amháin in aghaidh an leibhéil stóráilte: ainm (lena mhéid stóráilte ar an gcuairt), triantáin le haghaidh samhla nó leithead i bpicteilíní le haghaidh íomhá. |
| ▸ (*Lódáil*) | Lódálann an iontráil mar an leibhéal reatha. |
| ✕ (*Scrios*) | Baintear an iontráil. |
| Líne úsáide | `Using X of Y.` - meastachán stórála an bhrabhsálaí don suíomh seo. |

Gan rud ar bith stóráilte deir an liosta *Folamh. Lódáil léarscáil nó samhail, ansin "Sábháil sa leabharlann".*

## Cad a stóráiltear {#what-is-stored}

| Cineál | Stóráilte | Gan stóráil |
|---|---|---|
| Íomhá léarscáile | An íomhá (PNG), a méid, a hancaire | Airde, cas, teimhneacht, geilleagar, díshaturáid - athchóirithe chuig na réamhshocruithe (airde = Y is ísle an tacair sonraí reatha, cas air) |
| Leibhéal 3D | Vertices, dathanna vertex, comhordanáidí uigeachta, a dtíleanna agus an atlas uigeachta, triantáin talún / struchtúir / uisce, imill struchtúir, líon na dtriantán | Ainmneacha páirte agus cúiseanna aicmithe, agus gach socrú cuma - athchóirithe chuig réamhshocruithe iompórtála nua |

Tá liosta páirte ag samhail a lódáiltear ón leabharlann, agus athríomhtar a teorainneacha agus a banda airde talún óna vertices.

## Cá bhfuil sé {#where-it-lives}

In IndexedDB an bhrabhsálaí, bunachar `3dheat`, stóras réad `levels`, don bhunús an leathanaigh (an seoladh i mbarra seoltaí an bhrabhsálaí). Tá sé áitiúil don phróifíl brabhsálaí sin: feiceann brabhsálaí eile, próifíl eile nó seoladh eile (mar shampla `localhost` in ionad `127.0.0.1`) leabharlann eile, folamh. Scriosann glanadh sonraí an tsuímh sa bhrabhsálaí é. Lódálann iontrálacha a sábháladh le leaganacha níos sine gan struchtúir, dathanna nó uisce fós.
