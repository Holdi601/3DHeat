---
title: "Analiza e goditjeve (skeda Mjetet)"
parent: "Riluajtja"
nav_order: 4
lang: "sq"
source: "hit-analysis.md"
source_hash: "8e9221927522"
translated: true
outdated: false
---


# Analiza e goditjeve

Skeda **Mjetet** tregon ku u goditi një tank, anije ose ushtar, dhe nga kush. Përdore për të parë cila anë e tankut qëllohet, ose cili armik bën dëmin.

## Provoje {#try-it}

1. Ngarko një ndeshje që ka goditje (shih tabelën më poshtë për cilat lojëra i japin).
2. Hap skedën **Mjetet** lart.
3. Te **Mjeti**, zgjidh një njësi, për shembull një lloj tanku. Numri në kllapa është sa goditje mori.
4. Lexo figurën: çdo shenjë është një goditje, e vendosur aty ku goditi.
5. Hap **Kush goditi** për të parë qëlluesit, armët ose mjetet e qëlluesve, me goditjet, dëmin, vrasjet dhe distancën.

![Skeda Mjetet: një tank demo me shenja goditjesh, dhe Kush goditi i hapur](../assets/img/en/hit-analysis-tank.webp)

Nëse nuk është ngarkuar asgjë, ose të dhënat nuk kanë goditje mbi mjete, skeda tregon çfarë mungon dhe cilin konvertues të përdorësh.

```
        shooter ----> o  hit mark on the figure
        shooter ----> o
  [ tank figure ]
```

Figura tregon goditjet aty ku të dhënat japin një pikë ose një pjesë trupi. Zbërthimi (kush goditi, me çfarë, sa fort, nga sa larg) punon për çdo burim.

## Çfarë jep secili burim {#what-each-source-gives}

| Burimi | Pika mbi njësinë | Qëlluesi | Armë | Dëmi / rezultati |
|---|---|---|---|---|
| War Thunder | po, në kornizën e njësisë, me drejtimin e predhës | po | mjeti i qëlluesit | kritike, të rënda, module të shkatërruara, goditja vrasëse |
| CS2 | pjesë trupi (hitgroup) | po | po | dëmi, armatura, jeta e mbetur |
| World of Tanks | po (kuti komponenti, hyrje dhe dalje) | po | - | dëm ose asnjë (kërcim, pa depërtim) |
| World of Warships | po, në kornizën e anijes | po | lloji i goditjes | - |
| Squad | mjetet: po - goditja vendoset në kornizën e mjetit nga pozicioni dhe drejtimi i vet | jo (të dhënat nuk emërojnë asnjë) | lloji i dëmit | rënia e jetës së mjetit në atë çast, i shkatërruar |
| Ushtarët e Squad | jo: rezultatet e goditjes (kocka dhe pika e goturisë) mbahen të papërpunuara nga konvertuesi; rreshtat `impact` me `hitBone` lexohen sapo i shkruan ai | | | plagë dhe vdekje vetëm |
| Arma (OCAP, regjistruesi i Arma 3) | jo: OCAP regjistron kush goditi ose vrau kë, me çfarë, nga sa larg, jo ku | po | po | goditje ose vrasje, distanca |
| Tacview ACMI | po, aty ku një objekt armë mbaron brenda 30 m nga një njësi (jo kampionuesi i saj): vendi i fundit i tij në kornizën e njësisë (drejtimi, pjerrësia, rrotullimi), duke ardhur nga rruga që fluturoi | `Parent` i armës | emri i armës, ose AmmoType i një Timeout | Outcome i Timeout, rënie të `Health`, `Destroyed`; pa armë, një vrasje ose dëm pa pikë |
| Telemetria IL-2 (Watcher) | po: ngjarjet `hit` / `damage` mbartin pikën në kornizën e avionit të lojtarit (marrë si x përpara, y lart, z djathtas) | jo | jo | forca |
| Dota 2 | jo: regjistri i luftimit nuk ka vend mbi një hero | njësia sulmuese | aftësia ose sendi (asnjë: një sulm) | dëmi, vdekja e heroit |
| Battlefield 6 (GameCapture) | jo: kapja lexon rrjedhën e vrasjeve (vrasje, vdekje, shenja headshot), jo goditjet | | | |
| DCS / burime të tjera live të Watcher | jo ngjarje goditjeje përtej asaj që mbajnë regjistrimet e tyre Tacview | | | |

Aty ku asnjë goditje e njësisë nuk ka pikë, figura nuk tregon shenja, dhe zbërthimi **Kush goditi** hapet vetë: sipas qëlluesit, armës ose mjetit të qëlluesit, secili me goditjet, dëmin dhe vrasjet e veta, dhe distancën mesatare dhe më të largët.

## Kufizo në një zonë {#restrict-to-an-area}

Seksioni **Zona** e kufizon analizën në goditjet që ndodhën në një vend të hartës.

1. Shtyp **Vizato drejtkëndësh** ose **Vizato shumëkëndësh**, dhe vizato mbi tokën 3D ose hartën taktike.
2. Zgjidh **Viktima brenda** (numëro një goditje kur njësia e goditur ishte në zonë) ose **Qëlluesi brenda** (kur ai që qëlloi ishte).
3. Shtyp **Përdori si filtër**. Çipat tregojnë "{n} nga {total} goditje në zonë".
4. **Rivendos zonën** heq të gjitha zonat.

Çdo zonë është një [vëllim](volumes.md), kështu që të njëjtat forma filtrojnë edhe nxehtësinë dhe riluajtjen. Një zonë mund të përfshijë ose të përjashtojë (një zonë përjashtuese i lë goditjet e saj jashtë, e shfaqur si "{n} nga {total} goditje jashtë zonës"). Çdo zonë shfaqet si një çip me sa nga goditjet e njësisë ishin në të; × te një çip e heq. Numërimet, figura, zbërthimi dhe listat e filtrit ndjekin të gjitha.

Vendet e një goditjeje: rreshti nga i cili vjen mban vendin e një pale (të viktimës për një goditje ose të qëlluesit për një të shtënë); tjetra është kampioni i vetë njësisë më të afërt në kohë (brenda 5 s). Një goditje, vendi i së cilës pale nuk njihet, lihet jashtë ndërsa një zonë filtron, dhe paneli thotë sa janë ("Lënë jashtë, pa vend të njohur").

## Për zhvilluesit {#for-developers}

Çdo konvertues mund të shtojë goditje: një rresht viktime (`hit`, `impact`, `hurt`, `wounded`) me `hitBone` (një kockë skeleti, një përzgjedhje Arma, një zonë goditjeje Reforger — hartëzuar te koka, gjoksi, barku, krahët dhe këmbët) ose `hitLocalX/Y/Z` (metra, x përpara, y lart, z djathtas), me `other` qëlluesin dhe `damage`.
