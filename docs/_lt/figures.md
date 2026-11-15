---
title: "Figūros"
nav_order: 11
has_children: true
lang: "lt"
source: "figures.md"
source_hash: "a2353c6a73bc"
translated: true
outdated: false
---

# Figūros

**Figūra** yra maža 3D vieneto modelio kopija: tankas, reaktyvinis lėktuvas, laivas, kareivis. [Pakartojimas](match-replay.md) piešia kiekvieną vienetą kaip jo figūrą tikru dydžiu, o ne paprasta dėžute.

Peržiūros programos pačios sukurtas katalogas turi apie 2 000 pavadintų automobilių, orlaivių, laivų, ginklų ir kareivių.

![Demonstracijos tankai, nupiešti kaip savos figūros](../assets/img/en/replay-tanks.webp)

## Kas yra kataloge {#what-is-in-the-catalogue}

| Sritis | Pavyzdžiai |
|---|---|
| Žmonės | kareivis stovintis, tupintis, gulintis; snaiperis, prieštankinis, sanitaras, įgula |
| Sausuma | tankai, pėstininkų kovos mašinos, oro gynyba, artilerija, sunkvežimiai ir automobiliai, traukiniai ir tramvajai |
| Oras | naikintuvai, puolamieji lėktuvai, bombonešiai, transportiniai lėktuvai, sraigtasparniai – nuo dviplanių iki šiuolaikinių reaktyvinių |
| Jūra | karo laivai pagal klasę, lėktuvnešiai, povandeniniai laivai, valtys, prekybiniai laivai |
| Ginklai | raketos, raketos, bombos, torpedos, šviesos signalai ir šiaudai |
| Žymekliai | dūmų, blyksnio ir gaisro granatos, pastatytos bombos, vėliavos, atsiradimo taškai, kelio taškai |

## Kaip sukuriamos figūros {#how-the-figures-are-made}

- **Sukurtos pagal paskelbtus matmenis.** Dauguma figūrų sukuriamos peržiūros programos paties figūrų kūrėju iš viešų skaičių: ilgis, plotis, aukštis, kelio ratai, bokštas ir patrankos, sparnai ir uodega. Tada jų forma koreguojama pagal viešas nuotraukas, brėžinius ir paskelbtus matmenis. Jokie žaidimų modeliai nenaudojami.
- **Laisvi modeliai.** Keletas figūrų naudoja laisvus 3D modelius (CC0 arba CC BY), kai jie tikresni, kartais sujungtus su sukurtu korpusu. CC BY kūrinių autoriai nurodyti [Figūrų šaltiniuose](figure-credits.md); CC0 kūriniams nurodymas nereikalingas ir jie čia neišvardyti.
- Kiekviena figūra turi pilną, grubią ir toli esančią versiją (detalumo lygius, LOD), todėl galima nupiešti tūkstančius vienu metu.

## Kokią figūrą gauna vienetas {#which-figure-a-unit-gets}

Peržiūros programa žiūri į paties duomenų stulpelius:

1. **Pavadinimai** – stulpeliai, pavadinti *Name*, *Vehicle*, *Unit*, *Unit type*, *Model*, *Aircraft*, *Plane*, *Tank*, *Ship*, *Craft*, *Loadout*, *Kit* arba *Figure* – lyginami su katalogu: tiksliai, per apie 4 000 pseudonimų (kelių žaidimų vienetų ID), pagal ilgiausią žinomą pradžią (`F-16C_50` yra F-16C) arba pagal trumpiausią figūros pavadinimą, kuris prasideda tuo pačiu.
2. Pavadinimas, kurio figūra netinka vieneto **tipui**, nenaudojamas (sunkvežimis, pavadintas *Typhoon*, nėra naikintuvas).
3. **Tipai** – stulpeliai *Type*, *Class*, *Kind*, *Category*, *Icon*, *Role* arba *Domain* – duoda klasės figūrą: Tacview žymas (`Air+FixedWing`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), žemėlapio piktogramas arba paprastus žodžius (tankas, sraigtasparnis, pėstininkai).
4. Duomenys be nei vieno – tai žmonių duomenys: visi yra kareiviai.

Taigi lengviausias būdas gauti teisingas figūras – `vehicle` stulpelis su tikrais pavadinimais arba `type` stulpelis su Tacview žymomis.

**Mano vienetas rodomas kaip dėžutė arba kareivis.** Pridėkite `vehicle` stulpelį su tikru pavadinimu arba `type` stulpelį su Tacview žyma. Užveskite pelę ant vieneto, kad pamatytumėte, kuris pavadinimas buvo priskirtas. Duomenys, turintys tokius stulpelius, bet nieko nesakantys apie vienetą, paliks jį dėžute; duomenys be nei vieno piešiami kaip kareiviai.

## Nustatymai {#settings}

Pakartojimo šoninės juostos skiltis **Figūros** nustato dydį, mažiausią dydį ekrane, kuo virsta toli esantys vienetai (figūra, rodyklė, ženklas) ir ant jų piešiamus efektus. Žr. [Rungtynių pakartojimas](match-replay.md#figures). Dūmai, gaisras ir kiti laiku trunkantys efektai: [Figūros figūrų sutapdinime](figure-replay.md).

## Neprivalomas vietinis figūrų paketas {#an-optional-local-figure-pack}

Savo kompiuteryje galite laikyti neprivalomą savo figūrų paketą. Jo figūros pakeičia katalogo figūras tokiais pačiais pavadinimais. Jis niekada nėra saugyklos ar paskelbto leidimo dalis; be jo niekas nesikeičia.
