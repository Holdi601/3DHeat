---
title: "Borðasafn"
parent: "Borð og bakgrunnsform"
nav_order: 4
lang: "is"
source: "level-library.md"
source_hash: "23ff3290af7e"
translated: true
outdated: false
---

# Borðasafn

Safnið geymir borðin þín í þessum vafra svo þú þurfir ekki að hlaða þeim og einfalda þau aftur. **Ef gögn síðunnar eru hreinsuð í vafranum er safnið eytt, og það er engin útflutningsleið.** Geymdu upprunalegu skrárnar þínar.

Vinnsla borðs - þáttun, flokkun, sameining, grisjun, pökkun áferða - er hæg, og útkoman er alltaf sú sama. **Safn** neðst á spjaldinu Background / level geymir unnin borð í þessum vafra, svo grisjað net er aldrei byggt tvisvar ([`levelLibrary.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/levelLibrary.ts)).

## Vista og endurhlaða borði {#save-and-reload-a-level}

1. Hladdu kortamynd eða þrívíðu líkani og athugaðu að það líti rétt út.
2. Ýttu á **Vista í safn**. Spjaldið segir *Saved. It will load instantly next time.*
3. Næst skaltu opna listann **Safn** og ýta á ▸ við borðið.
4. Ýttu á ✕ til að eyða færslu sem þú þarft ekki lengur.

## Notkun {#using-it}

| Stýring | Áhrif |
|---|---|
| **Vista í safn** | Geymir núverandi borð. Kortamynd er geymd sem PNG með báðum akkerum sínum; líkan sem unnin buffer sína. Spjaldið segir *Saved. It will load instantly next time.* |
| Listi safnsins | Ein lína fyrir hvert geymt borð: heiti (með geymdri stærð við músarbendingu), þríhyrningar fyrir líkan eða breidd í pixlum fyrir mynd. |
| ▸ (*Load*) | Hleður færslunni sem núverandi borði. |
| ✕ (*Delete*) | Fjarlægir færsluna. |
| Notkunarlína | `Using X of Y.` - mat vafrans á geymslu fyrir þessa síðu. |

Þegar ekkert er geymt segir listinn *Empty. Load a map or model, then "Save to library".*

## Hvað er geymt {#what-is-stored}

| Tegund | Geymt | Ekki geymt |
|---|---|---|
| Kortamynd | Myndin (PNG), stærð hennar, akkeri hennar | Hæð, speglun, ógegnsæi, birtustig, afmettun - endurheimt í sjálfgefin gildi (hæð = lægsta Y núverandi gagnasafns, speglun á) |
| 3D-borð | Hnútar, hnútalitir, áferðarhnit, flísar þeirra og áferðaratlas, þríhyrningar undirlags / mannvirkja / vatns, brúnir mannvirkja, fjöldi þríhyrninga | Heiti hluta og flokkunarástæður, og allar útlitsstillingar - endurheimtar í sjálfgefin gildi nýs innflutnings |

Líkan sem er hlaðið úr safninu hefur engan hlutalista, og mörk þess og hæðarbil undirlags eru reiknuð upp á nýtt úr hnútum þess.

## Hvar það er geymt {#where-it-lives}

Í IndexedDB vafrans, gagnagrunnurinn `3dheat`, geymsluflokkurinn `levels`, fyrir uppruna síðunnar (vistfangið í veffangastiku vafrans). Það er staðbundið fyrir þann vafrasnið: annar vafri, annar snið eða annað vistfang (til dæmis `localhost` í stað `127.0.0.1`) sér annað, tómt safn. Að hreinsa gögn síðunnar í vafranum eyðir því. Færslur sem eldri útgáfur vistuðu án mannvirkja, lita eða vatns hlaðast enn.
