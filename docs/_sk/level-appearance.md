---
title: "Vzhľad levelu"
parent: "Levely a geometria pozadia"
nav_order: 3
lang: "sk"
source: "level-appearance.md"
source_hash: "c883749baedd"
translated: true
outdated: false
---

# Vzhľad levelu

Tieto ovládacie prvky menia, ako vyzerá 3D level, aby teplo z neho vynikalo a miesto ste ho stále mohli čítať. Nič tu nemení dáta.

## Rýchly štart {#quick-start}

1. Načítajte 3D level ([3D levely](model-levels.md)).
2. V **Pozadie / level** znížte **Jas**, kým teplo nebude najjasnejšia vec na obrazovke.
3. Otvorte **Reliéf terénu** a zvýšte **Tieňovanie sklonu** alebo **Výraznosť vrstevníc**, kým nerozoznáte kopec od roviny.
4. Otvorte **Objekty**. Znížte **Nepriehľadnosť plôch**, aby ste videli do budov, alebo zapnite **Textúru objektov**, aby boli plné.
5. Ak je na teréne namaľovaný obrázok, vyskúšajte **Textúru terénu** vypnutú a zapnutú.

![Otvorené sekcie Reliéf terénu a Objekty, level zobrazený s podnetmi reliéfu](../assets/img/en/level-appearance-sections.webp)

Keď je načítaný [3D level](model-levels.md), panel Pozadie / level zobrazuje tieto ovládacie prvky. Predvolené hodnoty sú tie, ktoré dostane čerstvo importovaný level ([`modelLevelFrom`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/LevelPanel.tsx), [`level.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts)). Ich zmena len prekreslí scénu; nahromadenie tepla sa zachová.

## Celý level {#the-whole-level}

| Ovládací prvok | Predvolené | Rozsah | Význam |
|---|---|---|---|
| **Nepriehľadnosť** | 100 % | 0-100 % | Pod 100 % sa level mieša a nezapisuje hĺbku, takže už [nezakrýva](depth-and-culling.md) teplo. |
| **Jas** | 0,9 | 0-2 (posuv 64) | |

Level sa kreslí odfarbený – sivý terén, zafarbená škrupina – takže teplo je jediná sýta vec na obrazovke. Na rozdiel od [obrázka mapy](map-images.md) 3D level nemá posuvník Odfarbiť.

## Reliéf terénu {#ground-relief}

Z diaľky sa kopec a rovina javia rovnako sivé, preto prehliadač pridáva tri náznaky. Každý rieši iný problém:

| Ovládací prvok | Predvolené | Význam |
|---|---|---|
| **Rozostup vrstevníc** | podľa rozpätia výšok terénu | Výška medzi vrstevnicami, logaritmicky od 1/4000 do 1/2 rozpätia výšok levelu; spodok dráhy je *vypnuté*. Predvolené je 1/40 rozpätia výšok terénu zaokrúhlené na krok 1/2/5 – čiary po 10 m sa hodia na svah a na dne lomu sú k ničomu. Každá piata čiara sa kreslí silnejšie. Vrstevnice sa kreslia v priestore obrazovky, takže zostanú pixel široké pri akomkoľvek priblížení, a sú jediným podnetom, ktorý prežije terén príliš plytký na to, aby sa vôbec tieňoval. |
| **Výraznosť vrstevníc** | 35 % | 0-100 % |
| **Tieňovanie sklonu** | 55 % | Stmavuje podľa strmosti, takže brehy a útesy sa čítajú z akéhokoľvek uhla kamery – na rozdiel od svetla, ktoré sa sploští, kedykoľvek sa k nemu otočíte. |
| **Výšková škála** | 50 % | Nízky terén tmavší, vysoký svetlejší, cez rozpätie výšok terénu: tvar vo veľkom merítku. |

Hlavička sekcie ukazuje stav vrstevníc: *každých N m*, rozostup vrstevníc, alebo *žiadne vrstevnice*, keď je rozostup vypnutý.

## Povrch terénu {#ground-surface}

| Ovládací prvok | Predvolené | Zobrazí sa, keď | Význam |
|---|---|---|---|
| **Voda** | zapnuté | level má vodu | Jazerá, rieky a more, kreslené rovno v bledej modrosivej farbe: žiadny z podnetov terénu sa nevzťahuje na povrch, ktorý je podľa definície rovný. |
| **Nepriehľadnosť vody** | 60 % | Voda je zapnutá | Pobrežie a terén pod plytčinami sa ukážu cez priesvitnú vodu. |
| **Trojuholníky terénu** | 30 % (0 pre level s textúrami) | vždy | Vlastné hrany terénu nakreslené cez tieňovaný povrch, miznúce medzi 6 % a 25 % šírky levelu od kamery. Ukazuje, ako hrubo bol terén vzorkovaný, a dáva svahu niečo, podľa čoho odhadnúť vzdialenosť. Vytvorí sa pri prvom použití, čo na veľkom leveli chvíľu trvá. |
| **Terén len ako drôtený model** | vypnuté | vždy | Nahradí povrch terénu jeho hranami. Úplne schematické – vzdá sa aj tieňovania, vrstevníc a zakrytia, preto je zvyčajne lepšou voľbou *Trojuholníky terénu*. |
| **Textúra terénu** | zapnuté | level má textúry | Kreslí terén v textúrach, ktoré súbor nesie (asfalt, kraj, tráva). Osvetlenie siete sa jemne aplikuje navrch, lebo textúra už nesie svoj jemný reliéf. **Jas** je spôsob, ako ju utlmiť pod teplom; Odfarbiť patrí obrázkom máp. |
| **Zachytená farba** | vypnuté | level má farby vrcholov | Tieňuje terén farbou, ktorú zachytil sken, namiesto sivej – inak sa rekonštruovaná cesta nedá odlíšiť od kraja. Exporty z motorov žiadne nemajú; ak chýbajú, panel hovorí *Tento level nenesie farbu.* |

## Objekty {#structures}

Hlavička **Objekty** ukazuje počet trojuholníkov objektov; nápoveda pod ňou hovorí, ako sa kreslia (*kreslené plné vo vlastných textúrach* alebo *kreslené ako priesvitná škrupina, aby ste videli teplo v nich*) a koľko častí sú objekty.

| Ovládací prvok | Predvolené | Význam |
|---|---|---|
| **Textúra objektov** | zapnuté, keď objekty nesú textúry | Kreslí objekty plné, vo vlastných textúrach. Zapnutie nastaví nepriehľadnosť plôch na 100 % a vypne hrany; vypnutie vráti odtieňovú priesvitnú škrupinu na 25 %. Objekt s textúrou sa osvetľuje zo strany, ktorú kamera vidí, lebo tabuľka je dve plochy chrbtom k chrbtu a to, ktorá vyhrá test hĺbky, závisí od zaokrúhľovania. |
| **Hrany drôteného modelu** | zapnuté; vypnuté nad 300 000 trojuholníkmi objektov alebo keď sú s textúrami | Zdeduplikované hrany objektov, jedna čiara na hranu. |
| **Nepriehľadnosť hrán** | 50 % | |
| **Plochy škrupiny** | zapnuté | Jemný povrch s jasným Fresnelovým okrajom, takže budova sa číta ako objem, a nie ako klietka alebo hmla. |
| **Nepriehľadnosť plôch** | 25 % (35 % nad 300 000 trojuholníkmi objektov, 100 % s textúrami) | 0-60 % na dráhe, až 100 s úchytom. Nechajte nízku: plné objekty skrývajú dáta vo svojom vnútri. |
| **Ostré hrany** | zapnuté (vypnuté, keď sú s textúrami) | Tieňuje každý trojuholník jeho vlastnou normálou, vypočítanou vo fragment shaderi z derivácií v priestore obrazovky. Exportované levely sú zvarené a nesú spriemerované normály, čo každý roh škatule zaoblí do „roztopenej fólie“; rozdelenie každého vrcholu na opravu by znásobilo vyrovnávaciu pamäť vrcholov. Vypnite pre level, ktorému sú zakrivené plochy dôležitejšie než rohy. |
| **Odtieň objektov** | Azúrová | Výber farby a predvoľby **Azúrová**, **Jantárová**, **Fialová**, **Biela**. |
| **Zobraziť klasifikáciu častí (N)** | | Každá časť, jej trieda a dôvod; pozri [3D levely](model-levels.md#ground-structures-and-water). |

## Rezanie levelu {#cutting-the-level}

[Rez](slice.md) a pri *Rezať aj level* [orezanie podľa vzdialenosti](depth-and-culling.md#distance-culling) režú terén, objekty a vodu v tých istých rovinách ako teplo.
