---
title: "Lista tat-timijiet"
parent: "Filtri u għodod"
nav_order: 2
lang: "mt"
source: "teams-list.md"
source_hash: "5477a98fa51c"
translated: true
outdated: false
---

# Lista tat-timijiet

Il-pannell **Timijiet** jħallik taħbi tim jew tpoġġih fuq naħa waħda ta' paragun. Uża dan biex tħares lejn Blue biss, jew biex tistaqsi "fejn imur Blue li Red ma tmurx?".

*Grupp* huwa tim jew naħa, pereżempju Blue u Red ([Gruppi](sessions-persons-groups.md#group)). Il-pannell jintwera meta d-dataset ikollu kolonna tal-gruppi; l-għadd tal-gruppi jidher fl-intestatura tiegħu. Fil-modalità Sħana tat-tim is-sidebar fih ukoll taqsima msejħa **Viewer tat-timijiet** b'settings tagħha; din il-paġna tkopri l-lista **Timijiet**.

## Aħbi tim {#hide-a-team}

1. Iftaħ **Timijiet** fis-sidebar.
2. Neħħi l-immarkar tal-kaxxa (*Visible*) tat-tim li trid taħbi. Il-istampa taġġorna minnufih.
3. Agħfas **Uri kollox** biex terġa' tiġbed kull tim.

![Il-lista tat-timijiet: Blue 5p, Red 5p, b'Uri kollox](../assets/img/en/teams-list.webp)

## Kull ringiela {#each-row}

| Parti | Tifsira |
|---|---|
| Kaxxa tal-immarkar (*Visible*) | Turi jew taħbi l-grupp. |
| Kwadratin | Il-kulur tal-grupp: il-kulur tiegħu tas-[sħana tat-tim](team-heat.md) fil-modalità Sħana tat-tim, il-kulur bażi tiegħu fil-modi l-oħra. |
| Isem | It-tikketta tal-grupp (it-tikketta sħiħa meta ssir hover). |
| **+** / **-** (modalità Differenza) | Poġġi l-grupp fuq in-naħa pożittiva jew negattiva tad-[differenza](difference.md); ikklikkja l-buttuna attiva darba oħra biex tpoġġih fuq l-ebda naħa. |
| `Np` (modi l-oħra) | L-għadd ta' persuni li l-ewwel ringiela tagħhom tinsab f'dan il-grupp. |

![Modalità Differenza: Blue fuq in-naħa +, Red fuq in-naħa -](../assets/img/en/teams-list-difference.webp)

## Buttuni {#buttons}

| Buttuna | Effett |
|---|---|
| **Uri kollox** | Jagħmel kull grupp viżibbli mill-ġdid. |
| **Aqsam indaqs** (modalità Differenza) | L-ewwel nofs tal-gruppi (imdawwar 'il fuq) fuq +, il-bqija fuq -; l-istess qsim jibda kull tagħbija. |

## Dak li jagħmel il-moħbi ta' grupp {#what-hiding-a-group-does}

- Fi **Sħana**, **Sħana tat-tim** u **Linji**, ir-ringieli tal-grupp ma jikkontribwixxu xejn.
- Fi **Differenza**, grupp moħbi ma jikkontribwixxi xejn minn fejn ikun, anke b'qsim b'kolonna oħra (ara [Differenza](difference.md#for-developers)).
- Fl-**overlay tal-figuri**, persuni li l-ewwel ringiela tagħhom tinsab f'dak il-grupp ma jinġibdux.
- Fi **Sħana tat-tim**, il-gruppi l-oħra jibqgħu bil-kuluri tagħhom: it-toni jingħataw mill-għadd sħiħ tal-gruppi, mhux minn dak li jidher, għalhekk żewġ stampi jibqgħu jitqabblu.

Bidla fil-viżibbiltà terġa' tibda l-akkumulazzjoni. F'kull dataset ġdid, kull grupp jerġa' jidher.

Il-hint tal-pannell jinbidel skont il-modalità: fi Differenza jispjega + u -; fi Sħana tat-tim, li l-kwadratini huma l-kuluri li kull grupp jinpinġa bihom.
