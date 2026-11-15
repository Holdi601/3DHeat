---
title: "Figurat"
parent: "Riluajtja"
nav_order: 3
has_children: true
lang: "sq"
source: "figures.md"
source_hash: "7040eba3b7ac"
translated: true
outdated: false
---

# Figurat

Një **figurë** është një model i vogël 3D i asaj që është në të vërtetë një njësi: një tank, një avion reaktiv, një anije, një ushtar. [Riprodhimi](match-replay.md) vizaton çdo njësi si figurën e vet në madhësinë e vërtetë, në vend të një kutie të thjeshtë.

Ka rreth 2.000 mjete, avionë, anije, armë dhe ushtarë të emërtuar, të gjitha të ndërtuara nga vetë shikuesi.

![Tanket e demos të vizatuara si figurat e veta](../assets/img/sq/replay-tanks.webp)

## Çfarë ka në katalog {#what-is-in-the-catalogue}

| Fushë | Shembuj |
|---|---|
| Njerëz | ushtar në këmbë, i ulur, shtrirë; snajper, kundër-tanku, mjek, ekuipazh |
| Tokë | tanke, automjete luftarake këmbësorie, mbrojtje ajrore, artileri, kamiona dhe makina, trena dhe tramvaje |
| Ajër | avionë luftarakë, avionë sulmi, bombardues, transportues, helikopterë, nga avionët me dy krahë deri te reaktivët modernë |
| Det | anije luftarake sipas klasës, aeroplanmbajtëse, nëndetëse, varka, anije tregtare |
| Armë | raketa, roketa, bomba, torpedo, flares dhe chaff |
| Shenja | granata tymi, shkëndije dhe zjarri, bomba të vendosura, flamuj, pika të shfaqjes, pika udhëtimi |
| Luftim nga afër | ushtarë me jelek me pllaka, me pushkë sulmi, automatik dore (SMG), pushkë me saçma, pushkë precizioni (DMR), mitraloz të lehtë, pistoletë ose mburojë; dronë, kamera, tel me gjemba, mburoja, përforcim muresh, barrikada, ngarkesa shpërthyese për çarje, kurthe, dritare, granata, çaktivizuesi |

## Si bëhen figurat {#how-the-figures-are-made}

- **Ndërtuar nga dimensionet e publikuara.** Shumica e figurave bëhen nga ndërtuesi i figurave të vetë shikuesit nga numra publikë: gjatësia, gjerësia, lartësia, rrotat e rrugës, kulla dhe topi, krahët dhe bishti. Forma e tyre pastaj rregullohet sipas fotografive publike, vizatimeve dhe dimensioneve të publikuara. Nuk përdoren modele të asnjë loje.
- **Modele të lira.** Disa figura përdorin modele 3D të lira (CC0 ose CC BY) aty ku janë më besnike, ndonjëherë të kombinuara me trupin e ndërtuar. Autorët e veprave CC BY janë të përmendur te [Kreditet e figurave](figure-credits.md); veprat CC0 nuk kanë nevojë për kredi dhe nuk listohen atje.
- Çdo figurë ka një version të plotë, një të trashë dhe një të largët (nivele detaji, LOD), kështu që mijëra mund të vizatohen njëherësh.

## Cilën figurë merr një njësi {#which-figure-a-unit-gets}

Shikuesi shikon kolonat e vetë të dhënave:

1. **Emrat** - kolonat e quajtura *Name*, *Vehicle*, *Unit*, *Unit type*, *Model*, *Aircraft*, *Plane*, *Tank*, *Ship*, *Craft*, *Loadout*, *Kit* ose *Figure* - krahasohen me katalogun: saktësisht, përmes rreth 4.000 pseudonimeve (ID-të e njësive të disa lojërave), sipas fillimit më të gjatë të njohur (`F-16C_50` është F-16C), ose sipas emrit më të shkurtër të figurës që fillon me të.
2. Një emër figura e të cilit nuk përshtatet me **llojin** e njësisë nuk përdoret (një kamion me emrin *Typhoon* nuk është avioni luftarak).
3. **Llojet** - kolonat e quajtura *Type*, *Class*, *Kind*, *Category*, *Icon*, *Role* ose *Domain* - japin një figurë klase: etiketat e Tacview (`Air+FixedWing`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), ikonat e hartës, ose fjalë të thjeshta (tank, helicopter, infantry).
4. Të dhënat pa asnjërën janë të dhëna njerëzish: të gjithë janë ushtarë.

Kështu, mënyra më e lehtë për të marrë figurat e duhura është një kolonë `vehicle` me emrat e vërtetë, ose një kolonë `type` me etiketa Tacview.

**Njësia ime shfaqet si kuti ose ushtar.** Shto një kolonë `vehicle` me emrin e vërtetë, ose një kolonë `type` me një etiketë Tacview. Kalo miun mbi njësinë për të parë cili emër u përput. Të dhënat që kanë kolona të tilla, por nuk thonë asgjë për një njësi, e lënë atë kuti; të dhënat pa asnjërën vizatohen si ushtarë.

## Figurat e luftimit nga afër (Rainbow Six Siege) {#close-quarters-figures-rainbow-six-siege}

Tabelat e shkruara si ato të lexuesit të riluajtjeve të Rainbow Six Siege (kolonat `operator`, `pawn`, `primaryClass`, `side`) marrin figurat e tyre:

- **Lojtarët** janë operatori i tyre. Secili nga 78 operatorët ka figurën e vet, rreth 1,8 m të gjatë, me rrobat e veta: dy ose tre ngjyra për xhaketën, pantallonat dhe pajisjet, sipas pamjes së tyre të zakonshme publike (e zezë, ulliri, kafe e çelët, gri qyteti, e bardhë, blu e errët, me pajisje të kuqe, portokalli ose bruz). Dhe me format e veta, një të tretën më të mëdha se në jetë aty ku duhet të duken nga lart: mbulesa e kokës (helmeta, një vizore ose helmetë e rëndë, kapele me strehë, kësula, bereta, një kapele e gjerë boonie ose kapele leshi, kapuçë, shalle, flokë), fytyra (syze mbrojtëse, maskë gazi, syze, maskë, mjekër, syze me tre lente), trup i lehtë, mesatar ose i rëndë (të rëndët janë të gjerë, me pllaka të mëdha supesh dhe jakë), një pallto e gjatë ose një kostum, veshje ghillie, çfarë mbajnë në shpinë (një çekan, ngarkesa, dronë, bombola, një rezervuar karburanti, një tub lëshuesi, një hark me shigjeta, panele, një bllokues sinjali, një mburojë) ose në krah (një lëshues, një krah metalik), mburoja e tyre (një e lartë, një mburojë kundër trazirave, një me drita), dhe një ngjyrë theksi në supe. Mbajnë klasën e armës së tyre kryesore. Një operator që shikuesi nuk e njeh është një ushtar i thjeshtë me jelek me pllaka, në ngjyrën e ekipit.
- **Pala** duket veçmas nga rrobat: një unazë në tokë nën çdo operator, **qelibar për sulmin, cian i zbehtë për mbrojtjen**, me ngjyrën e ekipit brenda saj, dhe shirita krahu e koke në të njëjtën ngjyrë. Një kolonë `stance` (në këmbë, i ulur, shtrirë) u jep qëndrimin; pa të, qëndrojnë në këmbë.
- **Dallohen nga largësia e riluajtjes:** të vizatuar 48 piksel të lartë nga lart dhe nga tre të katërtat, çdo dy operatorë të një pale ndryshojnë me një ndryshim të qartë ngjyre ose me një formë tjetër (e kontrollojnë testet e shikuesit).
- **Etiketat** emërtojnë lojtarin dhe operatorin që luan në atë çast, me rolin e operatorit si simbol: ✸ çarës i fortë, ⚒ çarës i butë, ➤ hyrje, ✦ fragger, ✚ mbështetje, ⬟ mburojë, ◉ zbulim, ◇ fleksibël, ↺ roje krahu, ⚓ spirancë, ✕ kurthues, ⇄ endacak, ↯ kundër pajisjeve, ▣ kundër çarjes.
- **Dronët** janë një dron me dy rrota që hidhet, rreth 30 cm i gjerë. Secili është një gjurmë më vete, e emërtuar sipas pronarit („Ash · drone 2“).
- **Pajisjet e vendosura** qëndrojnë aty ku u vendosën, që atëherë deri në fund të raundit. Secila ka figurën e asaj që bën: një kamerë, tel me gjemba, një mburojë e lëvizshme, një ngarkesë për çarje, një ngarkesë për çarje të fortë, një ngarkesë e vogël ngjitëse, një kurth dyshemeje, një claymore me lazerin e saj shkrehës, një dritare me një drejtim, një panel blinde, një granatë, një bombol gazi, një bllokues sinjali, një sensor, një portë lazeri, një kuti furnizimi. Një figurë i shërben çdo pajisjeje që bën të njëjtën punë. Një pajisje, llojin e së cilës të dhënat nuk e thonë, është një aparat i vogël me një dritë.
- **Çaktivizuesi** qëndron aty ku u vendos, për 45 sekondat e tij.

Çdo dron dhe pajisje bëhet një gjurmë më vete kur ngarkohet skedari, kështu figura e vetë lojtarit mbetet në trupin e tij. Operatorët janë forma të thjeshtuara sipas përshkrimeve dhe artit të tyre publik (çfarë veshin, pajisja që është aftësia e tyre), ndërsa forma e pajisjeve vjen nga ajo që bëjnë. Të gjitha këto janë dizajne të vetë shikuesit në madhësinë reale të sendit (një claymore rreth 22 cm e gjerë, një panel sa një derë, 1 m me 2,1 m), jo modele nga loja.

## Cilësimet {#settings}

Seksioni **Figurat** i shiritit anësor të riprodhimit cakton madhësinë, madhësinë më të vogël në ekran, çfarë bëhen njësitë e largëta (figurë, shigjetë, simbol), dhe efektet që vizatohen mbi to. Shih [Riprodhimi i ndeshjes](match-replay.md#figures). Tymi, zjarri dhe efektet e tjera me kohë: [Figurat te mbivendosja e figurave](figure-replay.md).

## Një paketë figurash lokale opsionale {#an-optional-local-figure-pack}

Mund të mbash në makinën tënde një paketë opsionale figurash të tua. Figurat e saj zënë vendin e figurave të katalogut me të njëjtët emra. Ajo nuk është kurrë pjesë e depos ose e një ndërtimi të publikuar; pa të, asgjë nuk ndryshon.
