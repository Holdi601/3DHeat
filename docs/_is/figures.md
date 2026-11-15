---
title: "Fígúrur"
parent: "Endurspilun"
nav_order: 3
has_children: true
lang: "is"
source: "figures.md"
source_hash: "e86483d60237"
translated: true
outdated: false
---

# Fígúrur

**Fígúra** er lítið þrívítt líkan af því sem eining raunverulega er: skriðdreki, þota, skip, hermaður. [Endurspilunin](match-replay.md) teiknar hverja einingu sem sína fígúru í raunstærð, í stað einfalds kassa.

Það eru um 2.000 nefnd farartæki, flugvélar, skip, vopn og hermenn, öll byggð af skoðaranum sjálfum.

![Skriðdrekar úr demoinu teiknaðir sem sínar eigin fígúrur](../assets/img/is/replay-tanks.webp)

## Hvað er í safninu {#what-is-in-the-catalogue}

| Svið | Dæmi |
|---|---|
| Fólk | hermaður standandi, krjúpandi, liggjandi; leyniskytta, skriðdrekavarnir, sjúkraliði, áhöfn |
| Á landi | skriðdrekar, bryndrekar, loftvarnir, stórskotalið, vörubílar og bílar, lestir og sporvagnar |
| Í lofti | orrustuþotur, árásarflugvélar, sprengjuflugvélar, flutningavélar, þyrlur, frá tvíþekjum til nútímaþota |
| Á sjó | herskip eftir flokki, flugvélamóðurskip, kafbátar, bátar, kaupskip |
| Vopn | eldflaugar, flaugar, sprengjur, tundurskeyti, blys og flögur |
| Merki | reykur, blossi- og eldhandsprengjur, komið fyrir sprengjum, fánar, upphafsstaðir, leiðarpunktar |

## Hvernig fígúrurnar eru gerðar {#how-the-figures-are-made}

- **Byggðar eftir birtum málum.** Flestar fígúrur eru gerðar af eigin fígúrusmiði skoðarans út frá opinberum tölum: lengd, breidd, hæð, brautarhjól, turn og byssa, vængir og hali. Lögun þeirra er síðan stillt eftir opinberum ljósmyndum, teikningum og birtum málum. Engin líkön úr leikjum eru notuð.
- **Frjáls líkön.** Nokkrar fígúrur nota frjáls þrívíð líkön (CC0 eða CC BY) þar sem þau eru sannari, stundum sameinuð smíðuðum skrokk. Höfundar CC BY verka eru tilgreindir á [Heimildir fígúra](figure-credits.md); CC0 verk þurfa ekki tilvísun og eru ekki talin upp þar.
- Sérhver fígúra hefur fulla, grófa og fjarlæga útgáfu (smáatriðastig, LOD), svo þúsundir má teikna í einu.

## Hvaða fígúru eining fær {#which-figure-a-unit-gets}

Skoðarinn skoðar eigin dálka gagnanna:

1. **Nöfn** - dálkar sem heita *Name*, *Vehicle*, *Unit*, *Unit type*, *Model*, *Aircraft*, *Plane*, *Tank*, *Ship*, *Craft*, *Loadout*, *Kit* eða *Figure* - eru bornir saman við safnið: nákvæmlega, í gegnum um 4.000 samheiti (einingarauðkenni leikja úr nokkrum leikjum), eftir lengsta þekkta upphaf (`F-16C_50` er F-16C), eða eftir stystu heiti fígúru sem byrjar á því.
2. Nafn þar sem fígúran passar ekki við **gerð** einingarinnar er ekki notað (vörubíll sem heitir *Typhoon* er ekki orrustuþotan).
3. **Gerðir** - dálkar sem heita *Type*, *Class*, *Kind*, *Category*, *Icon*, *Role* eða *Domain* - gefa flokksfígúru: Tacview-merki (`Air+FixedWing`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), kortatákn, eða venjuleg orð (tank, helicopter, infantry).
4. Gögn með hvorugu eru gögn um fólk: allir eru hermenn.

Auðveldasta leiðin til að fá réttu fígúrurnar er því `vehicle`-dálkur með raunverulegum nöfnum, eða `type`-dálkur með Tacview-merkjum.

**Eining mín birtist sem kassi eða hermaður.** Bættu við `vehicle`-dálki með raunverulegu nafni, eða `type`-dálki með Tacview-merki. Haltu músinni yfir eininguna til að sjá hvaða nafn var passað. Gögn sem hafa slíka dálka en segja ekkert um einingu skilja hana eftir sem kassa; gögn án þeirra eru teiknuð sem hermenn.

## Stillingar {#settings}

Hlutinn **Fígúrur** í hliðarstiku endurspilunarinnar stillir stærðina, minnstu stærð á skjánum, hvað fjarlægar einingar verða (fígúra, ör, tákn), og áhrifin sem eru teiknuð á þær. Sjá [Endurspilun leiks](match-replay.md#figures). Reykur, eldur og önnur tímabundin áhrif: [Fígúrur í fígúruyfirlaginu](figure-replay.md).

## Valfrjáls staðbundinn fígúrupakki {#an-optional-local-figure-pack}

Þú getur geymt valfrjálsan pakka með eigin fígúrum á þinni eigin tölvu. Fígúrur hans taka sæti fígúra úr safninu með sömu nöfnum. Hann er aldrei hluti af geymslunni eða birtri útgáfu; án hans breytist ekkert.
