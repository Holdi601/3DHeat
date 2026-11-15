---
title: "Eintitis"
parent: "Scagairí agus uirlisí"
nav_order: 3
lang: "ga"
source: "entities.md"
source_hash: "13da19f402d8"
translated: true
outdated: false
---

# Aonáin

Ligeann **Aonáin** duit imreoir amháin (nó cúpla) a roghnú chun an áit a ndeachaigh an t-imreoir sin amháin a fheiceáil. Úsáid é chun do ghluaiseacht féin nó aon chomhraic amháin a leanúint.

Taispeántar an painéal nuair a bhíonn colún duine sa tacar sonraí. Taispeánann a ceann líon na ndaoine, nó `selected of total` agus roghnú ar siúl (is *duine* imreoir nó AI amháin, féach an [ghluais](glossary.md)).

## Roghnaigh imreoir {#pick-a-player}

1. Oscail **Aonáin** sa bharra taobh.
2. Clóscríobh cuid den ainm sa bhosca cuardaigh.
3. Tic an t-imreoir. Léann an ceann, mar shampla, `2 of 10`, agus imíonn gach rud eile.
4. Taispeánann **Glan** gach duine arís.

![Aonáin le beirt as deichniúr imreoir roghnaithe](../assets/img/en/entities-selected.webp)

Ní thaispeánann an roghnú ach na daoine roghnaithe, sna módanna teasa (pointí, línte, difríocht, teas foirne) mar aon leis na rianta, na figiúirí agus na rianta sa [athsheinm figiúr](box-replay.md). Fág folamh chun gach duine a thaispeáint; is ionann gach duine a roghnú agus gan aon duine a roghnú.

## An painéal {#the-panel}

| Cuid | Brí |
|---|---|
| Bosca cuardaigh | *Search N entities...* - scagann an liosta de réir cuid den ainm, gan aird ar chás. Taispeánann `N matches`, nó `N matches, showing the first 200`; *Nothing matches "..."* nuair nach bhfuil aon rud aimsithe ag an gcuardach. |
| Liosta | Suas le 200 duine (an chéad 200 a mheaitseálann), gach ceann acu le bosca seiceála, swatch de dhath an duine, agus an t-ainm (*(unnamed)* le haghaidh ainm folamh). |
| Leid ar siúl | Nuair a bhíonn an am ag imeacht, tá na daoine *ar siúl ag an gceannródaí* sa liosta; aimsíonn cuardach gach duine. |
| **AI (n)** | Grúpa inphléite le haonaid faoi rialú AI, ar leith ó na himreoirí. |
| **Cuir na cinn ar taispeáint leis** | Cuireann sé gach duine atá liostaithe faoi láthair leis an roghnú. |
| **Na cinn ar taispeáint amháin** | Déanann sé an roghnú díreach iad siúd atá liostaithe. |
| **Glan** | Folmhaíonn sé an roghnú. |

## Teorainneacha {#limits}

Sa teas is scagaire é an roghnú agus baineann sé úsáid as ceann de na [ceithre sliotán scagaire](filters.md#rules). Nuair a úsáideann na scagairí eile na ceithre cinn cheana féin, deir an painéal *Not applied to the heat: all filter slots are taken. The figure replay still shows only these entities. Clear a filter under Filters to free one.* Glan scagaire chun sliotán a shaoradh.

Glantar an roghnú ar gach tacar sonraí nua. Socraíonn an cluaisín Cluiche an roghnú céanna nuair a dhíríonn sé ar imreoir amháin.

## Do fhorbróirí {#for-developers}

Stóráiltear an roghnú mar scagaire *daoine* ([Scagairí](filters.md#for-developers)). Coinníonn masc an shaders 65,536 aitheantas duine; ní tharraingítear duine thar sin sa teas fad a bhíonn roghnú ar siúl.
