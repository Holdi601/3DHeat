---
title: "Greining á hittum (flipi Farartæki)"
parent: "Endurspilun"
nav_order: 4
lang: "is"
source: "hit-analysis.md"
source_hash: "8e9221927522"
translated: true
outdated: false
---

# Greining á hittum (flipi Farartæki)

Flipinn **Farartæki** sýnir hvar einn skriðdreki, skip eða hermaður var hittur, og af hverjum. Notaðu hann til að sjá hvaða hlið skriðdreka er skotin, eða hvaða óvinur veldur skaðanum.

## Prófaðu það {#try-it}

1. Hladdu leik sem hefur högg (sjá töfluna hér að neðan um hvaða leikir gefa þau).
2. Opnaðu flipann **Farartæki** efst.
3. Undir **Farartæki** veldu einingu, til dæmis gerð skriðdreka. Talan í hornklofa er hversu mörg högg hún fékk.
4. Lestu myndina: hvert merki er högg, staðsett þar sem það lenti.
5. Opnaðu **Hver hitti hana** til að sjá skotmennina, vopnin eða farartækin sem skutu, með höggum, skaða, drápum og fjarlægð.

![Flipinn Farartæki: tankdæmi með höggmerkjum, og Hver hitti hana opinn](../assets/img/en/hit-analysis-tank.webp)

Ef ekkert er hlaðið, eða gögnin hafa engin högg á farartæki, segir flipinn hvað vantar og hvaða breyti á að nota.

```
        shooter ----> o  hit mark on the figure
        shooter ----> o
  [ tank figure ]
```

Myndin sýnir höggin þar sem gögnin gefa punkt eða líkamshluta. Sundurliðunin (hver hitti hana, með hverju, hversu fast, úr hversu langt) virkar fyrir allar uppsprettur.

## Hvað hver uppspretta gefur {#what-each-source-gives}

| Uppspretta | Punktur á einingunni | Skotmaður | Vopn | Skaði / útkoma |
|---|---|---|---|---|
| War Thunder | já, í ramma einingarinnar, með stefnu skotsins | já | farartæki skotmannsins | lykilhögg, alvarlegt, einingar eyðilagðar, banaskot |
| CS2 | líkamshluti (hitgroup) | já | já | skaði, brynja, eftirstandandi líf |
| World of Tanks | já (kassi íhluta, inngangur og útgangur) | já | - | skaði eða enginn (kast, engin gegnumsókn) |
| World of Warships | já, í ramma skipsins | já | tegund höggs | - |
| Squad | farartæki: já - höggið sett í ramma farartækisins út frá eigin stöðu og stefnu | nei (gögnin nefna engan) | tegund skaða | fall heilsu farartækisins á þeirri stundu, eyðilagt |
| Squad-hermenn | nei: niðurstöður höggs (bein og höggpunktur) eru geymdar óunnar af breytinum; raðir `impact` með `hitBone` eru lesnar um leið og hann skrifar þær | | | sár og dauðsföll eingöngu |
| Arma (OCAP, upptökutæki Arma 3) | nei: OCAP skráir hver hitti eða drap hvern, með hverju, úr hversu langt, en ekki hvar | já | já | högg eða dráp, fjarlægð |
| Tacview ACMI | já þar sem vopnshlutur endar innan 30 m frá einingu (ekki skotpallinum): síðasti staður hans í ramma einingarinnar (stefna, halli, veltur), komandi þá leið sem hann flaug | `Parent` vopnsins | heiti vopnsins, eða AmmoType Timeout | Outcome Timeout, föll `Health`, `Destroyed`; án vopns, dráp eða skaði án punkts |
| IL-2 fjarmælingar (Watcher) | já: atburðirnir `hit` / `damage` bera punktinn í ramma flugvélar leikmannsins sjálfs (tekið sem x fram, y upp, z hægri) | nei | nei | aflið |
| Dota 2 | nei: bardagaskráin hefur enga staðsetningu á hetju | árásareiningin | hæfileikinn eða hluturinn (enginn: árás) | skaði, dauði hetjunnar |
| Battlefield 6 (GameCapture) | nei: upptakan les drápslistann (dráp, dauðsföll, höfuðskotsmerki), ekki högg | | | |
| DCS / aðrar lifandi uppsprettur Watcher | engir höggatburðir umfram það sem Tacview-upptökur þeirra geyma | | | |

Þar sem ekkert högg einingarinnar hefur punkt, sýnir myndin engin merki og **Hver hitti hana**-sundurliðunin opnast af sjálfu sér: eftir skotmanni, vopni eða farartæki skotmannsins, hver með sínum höggum, skaða og drápum, og miðgildi og lengstu fjarlægð.

## Takmarka við svæði {#restrict-to-an-area}

Hlutinn **Svæði** takmarkar greininguna við högg sem áttu sér stað á ákveðnum stað á kortinu.

1. Ýttu á **Teikna ferhyrning** eða **Teikna marghyrning**, og teiknaðu á þrívíða jörðinni eða taktíska kortinu.
2. Veldu **Fórnarlamb inni** (teldu högg þegar einingin sem var hitt var á svæðinu) eða **Skytta inni** (þegar sá sem skaut var þar).
3. Ýttu á **Nota sem síu**. Flísarnar sýna „{n} af {total} höggum á svæðinu“.
4. **Endurstilla svæði** fjarlægir öll svæði.

Hvert svæði er [rúmmál](volumes.md), svo sömu form sía líka hitakortið og endurspilunina. Svæði getur tekið með eða útilokað (útilokandi svæði sleppir höggum sínum, sýnt sem „{n} af {total} höggum utan svæðisins“). Hvert svæði birtist sem flís með því hversu mörg högg einingarinnar voru þar; × á flísinni fjarlægir hana. Talningarnar, myndin, sundurliðunin og síulistarnir fylgja öll.

Staðir högganna: röðin sem höggið kom úr geymir stað eins aðila (fórnarlambsins fyrir særingu eða högg, skotmannsins fyrir skot); staður hins er eigið sýni einingarinnar næst í tíma (innan 5 s). Högg þar sem staður aðilans er ekki þekktur er sleppt meðan svæði síar, og spjaldið segir hve mörgum („Sleppt, enginn þekktur staður“).

## Fyrir forritara {#for-developers}

Hvaða breytir sem er getur bætt við höggum: röð fórnarlambs (`hit`, `impact`, `hurt`, `wounded`) með `hitBone` (bein í beinagrind, val í Arma, höggsvæði í Reforger - varpað á höfuð, brjóst, maga, handleggi og fætur) eða `hitLocalX/Y/Z` (metrar, x fram, y upp, z hægri), með `other` sem skotmann og `damage`.
