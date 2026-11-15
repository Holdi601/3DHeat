---
title: "Entitajiet"
parent: "Filtri u għodod"
nav_order: 3
lang: "mt"
source: "entities.md"
source_hash: "13da19f402d8"
translated: true
outdated: false
---

# Entitajiet

**Entitajiet** jħallik tagħżel plejer wieħed (jew ftit) biex tara biss fejn mar dak il-plejer. Uża dan biex issegwi il-moviment tiegħek stess jew avversarju wieħed.

Il-pannell jintwera meta d-dataset ikollu kolonna ta' persuna. L-intestatura tiegħu turi l-għadd ta' persuni, jew `selected of total` waqt li tkun attiva għażla (*persuna* hija plejer wieħed jew AI, ara l-[glossarju](glossary.md)).

## Agħżel plejer {#pick-a-player}

1. Iftaħ **Entitajiet** fis-sidebar.
2. Ikteb parti mill-isem fil-kaxxa tat-tfittix.
3. Immarka l-plejer. L-intestatura taqra, pereżempju, `2 of 10`, u kollox ieħor jisparixxi.
4. **Neħħi** juri lil kulħadd mill-ġdid.

![Entitajiet b'żewġ plejers minn għaxra magħżula](../assets/img/en/entities-selected.webp)

L-għażla turi biss il-persuni magħżula, fil-modi tas-sħana (punti, linji, differenza, sħana tat-tim) kif ukoll fit-traċċi u fil-figuri tal-[replay tal-figuri](box-replay.md). Ħalliha vojta biex turi lil kulħadd; l-għażla ta' kulħadd hija l-istess bħall-għażla ta' ħadd.

## Il-pannell {#the-panel}

| Parti | Tifsira |
|---|---|
| Kaxxa tat-tfittix | *Search N entities...* - jiffiltra l-lista bi frammenti tal-isem, mingħajr ma jiddistingwi bejn kbar u żgħar. Turi `N matches`, jew `N matches, showing the first 200`; *Nothing matches "..."* meta t-tfittxija ma ssib xejn. |
| Lista | Sa 200 persuna (l-ewwel 200 li jaqblu), kull waħda b'kaxxa tal-immarkar, kwadratin tal-kulur tal-persuna, u l-isem (*(unnamed)* għal isem vojt). |
| Hint tal-*in play* | Meta l-ħin ikun qed jimxi, il-lista fiha dawk *in play at the playhead*; tfittxija ssib kulħadd. |
| **AI (n)** | Grupp li jitqaleb fih l-unitajiet ikkontrollati mill-AI, separati mill-plejers. |
| **Żid il-murija** | Iżid kulħadd li hu elenkat bħalissa mal-għażla. |
| **Il-murija biss** | Jagħmel l-għażla eżatt dawk elenkati. |
| **Neħħi** | Iċċara l-għażla. |

## Limiti {#limits}

Fis-sħana l-għażla hija filtru u tuża wieħed mill-erba' [slots tal-filtri](filters.md#rules). Meta l-filtri l-oħra jkunu diġà jużaw l-erba' slots kollha, il-pannell jgħid *Not applied to the heat: all filter slots are taken. The figure replay still shows only these entities. Clear a filter under Filters to free one.* Neħħi filtru biex tiftaħ slot.

L-għażla titneħħa f'kull dataset ġdid. It-tab Partita tpoġġi l-istess għażla meta tiffoka fuq plejer wieħed.

## Għall-iżviluppaturi {#for-developers}

L-għażla tinħażen bħala filtru *persons* ([Filtri](filters.md#for-developers)). Il-mask tal-shader iżżomm 65,536 ID ta' persuna; persuna wara dak il-limitu ma tinġibdx fis-sħana waqt li tkun attiva għażla.
