---
title: "Figurat"
nav_order: 11
has_children: true
lang: "sq"
source: "figures.md"
source_hash: "a2353c6a73bc"
translated: true
outdated: false
---

# Figurat

Një **figurë** është një model i vogël 3D i asaj që është në të vërtetë një njësi: një tank, një avion reaktiv, një anije, një ushtar. [Riluajtja](match-replay.md) vizaton çdo njësi si figurën e saj në madhësinë reale, në vend të një kutie të thjeshtë.

Ka rreth 2,000 mjete, avionë, anije, armë dhe ushtarë të emërtuar, të gjitha të ndërtuara nga vetë shikuesi.

![Tanket e demos të vizatuara si figurat e tyre](../assets/img/sq/replay-tanks.webp)

## Çfarë ka në katalog {#what-is-in-the-catalogue}

| Fusha | Shembuj |
|---|---|
| Njerëz | ushtar që qëndron, ulet, shtrihet; snajper, antitank, mjek, ekuipazh |
| Toka | tanke, mjete luftarake këmbësorie, mbrojtje ajrore, artileri, kamionë dhe makina, trena dhe tramvaje |
| Ajri | avionë luftarakë, avionë sulmi, bombardues, transportues, helikopterë, nga aeroplanët me dy krahë deri te reaktivët modernë |
| Deti | anije luftarake sipas klasës, transportues avionësh, nëndetëse, varka, anije tregtare |
| Armët | raketa, roketa, bomba, siluruese, flare dhe chaff |
| Shenjuesit | granata tymi, ndriçimi dhe zjarri, bomba të vendosura, flamuj, spawn-e, pika udhëtimi |

## Si bëhen figurat {#how-the-figures-are-made}

- **Të ndërtuara nga përmasat e publikuara.** Shumica e figurave bëhen nga ndërtuesi i vetë shikuesit me numra publikë: gjatësia, gjerësia, lartësia, rrotat e rrugës, kulla dhe topi, krahët dhe bishti. Forma e tyre rregullohet pastaj sipas fotografive publike, vizatimeve dhe përmasave të publikuara. Nuk përdoren modele të asnjë loje.
- **Modele falas.** Disa figura përdorin modele falas 3D (CC0 ose CC BY) aty ku janë më besnike, ndonjëherë të kombinuara me trupin e ndërtuar. Autorët e veprave CC BY janë përmendur te [Kreditet e figurave](figure-credits.md); veprat CC0 nuk kërkojnë përmendje dhe nuk listohen aty.
- Çdo figurë ka një version të plotë, një të thjeshtuar dhe një të largët (nivele detaji, LOD), kështu që mijëra mund të vizatohen njëherësh.

## Cilën figurë merr një njësi {#which-figure-a-unit-gets}

Shikuesi shikon kolonat e vetë të të dhënave:

1. **Emrat** - kolonat me emrin *Name*, *Vehicle*, *Unit*, *Unit type*, *Model*, *Aircraft*, *Plane*, *Tank*, *Ship*, *Craft*, *Loadout*, *Kit* ose *Figure* - krahasohen me katalogun: saktësisht, përmes rreth 4,000 pseudonimeve (id-ve të njësive të disa lojërave), me fillimin më të gjatë të njohur (`F-16C_50` është F-16C), ose me emrin më të shkurtër të figurës që fillon me të.
2. Një emër, figura e të cilit nuk përshtatet me **tipin** e njësisë, nuk përdoret (një kamion i quajtur *Typhoon* nuk është avioni luftarak).
3. **Tipet** - kolonat me emrin *Type*, *Class*, *Kind*, *Category*, *Icon*, *Role* ose *Domain* - japin një figurë klase: etiketat Tacview (`Air+FixedWing`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), ikonat e hartës, ose fjalë të thjeshta (tank, helikopter, këmbësori).
4. Të dhënat pa asnjërën janë të dhëna njerëzish: të gjithë janë ushtarë.

Mënyra më e lehtë për të marrë figurat e duhura është një kolonë `vehicle` me emrat e vërtetë, ose një kolonë `type` me etiketa Tacview.

**Njësia ime shfaqet si kuti ose ushtar.** Shto një kolonë `vehicle` me emrin e vërtetë, ose një kolonë `type` me një etiketë Tacview. Kalo mbi njësinë për të parë cili emër u përput. Të dhënat që kanë kolona të tilla, por nuk thonë asgjë për një njësi, e lënë atë si kuti; të dhënat pa asnjërën vizatohen si ushtarë.

## Cilësimet {#settings}

Seksioni **Figurat** i shiritit anësor të riluajtjes cakton madhësinë, madhësinë më të vogël në ekran, çfarë bëhen njësitë e largëta (figurë, shigjetë, simbol), dhe efektet e vizatuara mbi to. Shih [Riluajtja e ndeshjes](match-replay.md#figures). Tymi, zjarri dhe efektet e tjera me kohë: [Figurat në mbivendosje figurash](figure-replay.md).

## Një paketë figurash lokale, opsionale {#an-optional-local-figure-pack}

Mund të mbash në kompjuterin tënd një paketë opsionale me figurat e tua. Figurat e saj zënë vendin e figurave të katalogut me të njëjtët emra. Nuk është kurrë pjesë e depos ose e një versioni të publikuar; pa të, asgjë nuk ndryshon.
