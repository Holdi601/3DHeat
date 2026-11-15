---
title: "Taseme välimus"
parent: "Tasemed ja taustgeomeetria"
nav_order: 3
lang: "et"
source: "level-appearance.md"
source_hash: "c883749baedd"
translated: true
outdated: false
---

# Taseme välimus

Need juhtnupud muudavad 3D taseme välimust, et soojus sellest esile tuleks ja koht ikka loetav oleks. Siin ei muudeta andmeid.

## Kiire algus {#quick-start}

1. Laadi 3D tase ([3D tasemed](model-levels.md)).
2. Jaotises **Taust / tase** langeta **Heledust**, kuni soojus on ekraani heledaim asi.
3. Ava **Maapinna reljeef** ja tõsta **Nõlvade varjutust** või **Samakõrgusjoonte tugevust**, kuni eristad künka tasasest alast.
4. Ava **Ehitised**. Langeta **Tahkude läbipaistmatust**, et näha hoonete sisse, või lülita **Ehitiste tekstuur** sisse, et neid tahkena näha.
5. Kui maapinnale on maalitud pilt, proovi **Maapinna tekstuur** välja ja sisse.

![Avatud jaotised Maapinna reljeef ja Ehitised, tase kuvatud reljeefi vihjetega](../assets/img/en/level-appearance-sections.webp)

[3D taseme](model-levels.md) laadimisel näitab paneel Taust / tase neid juhtnuppe. Vaikeväärtused on need, mille värskelt imporditud tase saab ([`modelLevelFrom`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/LevelPanel.tsx), [`level.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts)). Muutmine ainult joonistab stseeni uuesti; soojuse akumulatsioon säilib.

## Kogu tase {#the-whole-level}

| Juhtnupp | Vaikimisi | Vahemik | Tähendus |
|---|---|---|---|
| **Läbipaistmatus** | 100% | 0-100% | Alla 100% segatakse tase ja see ei kirjuta sügavust, seega ei [kata](depth-and-culling.md) see enam soojust. |
| **Heledus** | 0,9 | 0-2 (hüppamisega 64) | |

Tase joonistatakse hallitatult - hall maapind, tooniga kest -, nii et soojus on ekraanil ainus küllastunud asi. Erinevalt [kaardipildist](map-images.md) ei ole 3D tasemel liugurit Värvitus.

## Maapinna reljeef {#ground-relief}

Kaugelt näevad künkad ja tasandikud välja ühesugused hallid, seega lisab vaataja kolm vihjet. Iga vastab erinevale probleemile:

| Juhtnupp | Vaikimisi | Tähendus |
|---|---|---|
| **Samakõrgusjoonte vahe** | maapinna kõrguste vahemikust | Kõrgus samakõrgusjoonte vahel, logaritmiline 1/4000 kuni 1/2 taseme kõrguste vahemikust; raja põhi on *väljas*. Vaikimisi on 1/40 maapinna kõrguste vahemikust, ümardatud 1/2/5 sammu järgi - 10 m jooned sobivad mäenõlvale ja on kasutud karjääripõhjal. Iga viies joon joonistatakse tugevamana. Samakõrgusjooned joonistatakse ekraaniruumis, nii et need on igal suumil ühe piksli laiused, ja need on ainus vihje maapinna puhul, mis on liiga lame, et üldse varjutada. |
| **Samakõrgusjoonte tugevus** | 35% | 0-100% |
| **Nõlvade varjutus** | 55% | Tumedamaks nõlvuse järgi, nii et kaldad ja kaljud loetakse igast kaamera nurgast - erinevalt valgusest, mis lamestub alati, kui sellele otsa vaatad. |
| **Kõrgusskaala** | 50% | Madal maa tumedam, kõrge maa heledam maapinna kõrguste vahemikus: suuremõõtmeline kuju. |

Jaotise päis näitab samakõrgusjoonte olekut: *iga N m*, samakõrgusjoonte vahe või *no contours*, kui vahe on väljas.

## Maapinna pind {#ground-surface}

| Juhtnupp | Vaikimisi | Näidatakse, kui | Tähendus |
|---|---|---|---|
| **Vesi** | sees | tasemel on vett | Järved, jõed ja meri, joonistatud lamedalt kahvatu sinakashalliga: ükski maastikuvihje ei kehti pinna kohta, mis on määratluse järgi tasane. |
| **Vee läbipaistmatus** | 60% | Vesi on sees | Rannajoon ja madalas olev maapind paistavad läbi läbipaistva vee. |
| **Maapinna kolmnurgad** | 30% (tekstuuriga tasemel 0) | alati | Maastiku enda servad, joonistatud varjutatud pinna peale; kustuvad kaamerast 6% ja 25% taseme laiuse vahel. Näitab, kui jämedalt maapinda proovitakse, ja annab nõlvale midagi, mille järgi kaugust hinnata. Ehitatakse esmakordsel kasutamisel, suurel tasemel võtab see hetke. |
| **Maapind ainult traatmudelina** | väljas | alati | Asendab maastiku pinna servadega. Täiesti skemaatiline - see loobub ka varjutusest, samadest joontest ja katmisest, seega on tavaliselt parem valik *Maapinna kolmnurgad*. |
| **Maapinna tekstuur** | sees | tasemel on tekstuure | Joonistab maapinna failis olevate tekstuuridega (asfalt, ääreke, muru). Võrgusilma valgustus lisatakse peale õrnalt, sest tekstuuril on juba oma peen reljeef. **Heledus** on viis selle vaigistamiseks soojuse all; Värvitus kuulub kaardipiltide juurde. |
| **Jäädvustatud värv** | väljas | tasemel on tipuvärve | Varjutab maapinna skaneeringu jäädvustatud värviga halli asemel - rekonstrueeritud teed muidu ei eristu äärekivist. Mootori eksportidel värvi pole; kui seda pole, ütleb paneel *This level carries no colour.* |

## Ehitised {#structures}

Jaotise **Ehitised** päis näitab ehitiste kolmnurkade arvu; allolev vihje ütleb, kuidas need joonistatakse (*drawn solid in their own textures* või *drawn as a transparent shell so you can see the heat inside them* - joonistatud läbipaistva kestana, et näha soojust nende sees) ja mitu osa on ehitised.

| Juhtnupp | Vaikimisi | Tähendus |
|---|---|---|
| **Ehitiste tekstuur** | sees, kui ehitistel on tekstuurid | Joonistab ehitised tahkena, oma tekstuuridega. Sisselülitamine seab tahkude läbipaistmatuse 100%-le ja lülitab servad välja; väljalülitamine naaseb tooniga läbipaistva kesta juurde 25%-ga. Tekstuuriga ehitis valgustatakse küljelt, mida kaamera näeb, sest silt on kaks tahku selg selga ja see, kumb võidab sügavustesti, sõltub ümardamisest. |
| **Traatmudeli servad** | sees; väljas üle 300 000 ehitiste kolmnurga või tekstuuriga | Ehitiste korduseta servad, üks joon serva kohta. |
| **Servade läbipaistmatus** | 50% | |
| **Kesta tahud** | sees | Õrn pind helendava Fresnel'i äärega, nii et hoone loetakse mahuna, mitte puuriks ega udupanga. |
| **Tahkude läbipaistmatus** | 25% (35% üle 300 000 ehitiste kolmnurga, tekstuuriga 100%) | 0-60% rajal, käepidemega kuni 100%. Hoia madal: tahked ehitised peidavad nende sees olevad andmed. |
| **Teravad servad** | sees (tekstuuriga väljas) | Varjutab iga kolmnurga oma normaali järgi, mis arvutatakse fragmendivarjundis ekraaniruumi tuletistest. Eksporditud tasemed on keevitatud ja neil on keskmistatud normaalid, mis ümardavad iga kasti nurga "sulanud fooliumiks"; iga tipu jagamine selle parandamiseks korrutaks tipupuhvri. Lülita välja tasemele, mille kõverad pinnad on tähtsamad kui nurgad. |
| **Ehitiste toon** | Tsüaan | Värvivalija ja eelseaded **Tsüaan**, **Merevaik**, **Violetne**, **Valge**. |
| **Näita osade klassifikatsiooni (N)** | | Iga osa, selle klass ja põhjus; vt [3D tasemed](model-levels.md#ground-structures-and-water). |

## Taseme lõikamine {#cutting-the-level}

[Lõige](slice.md) ja, kui *Lõika ka tase*, [kauguse järgi kärpimine](depth-and-culling.md#distance-culling) lõikavad maapinna, ehitised ja vee samade tasanditega nagu soojuse.
