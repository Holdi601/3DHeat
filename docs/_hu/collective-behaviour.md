---
title: "Csoportos viselkedés"
parent: "Felismerések"
nav_order: 3
lang: "hu"
source: "collective-behaviour.md"
source_hash: "bb95ded2346c"
translated: true
outdated: false
---

# Csoportos viselkedés: tömegek, csordák, falkák és döntések nyomás alatt

A meccsek játékosai ugyanúgy viselkednek, mint bárki máshol: az ajtóknál csoportosulnak, azt követik, aki elsőként ment, együtt maradnak vagy lemaradoznak, súlyos veszteség után visszahúzódnak, rossz élet után több kockázatot vállalnak. A **viselkedéslencse mérőszámai** ezeket a mintákat a tömegtudomány, a csoportmozgás fizikája, a viselkedési közgazdaságtan és a katonai pszichológia módszereivel mérik, mindegyiket a saját nullmodelljéhez hasonlítva, és az egyező bejegyzéseken keresztül olvassák a [tudásbázisban](knowledge.md).

## Próbálja ki {#try-it}

1. Töltsön be egy vagy több meccset idővel, pozíciókkal és csapatokkal.
2. Nyissa meg a **Felismerések** részt, és futtassa.
3. Bontsa ki az **A lencse mérőszámai** részt: a viselkedési mérések a többi mellett szerepelnek (Kollektív összhang, Útvonal-csordázás, Sávok és nyomvonalak, Tömörülés, Vezetők és követők, Kohézió és lemaradók, Törési pont, Kockázat veszteségek után, Sorozatok, Vásárlási egyetértés, Elnyomás), mindegyik a számaival, a tesztjével és a magyarázó irodalommal együtt.
4. Az **Összegzés** hivatkozik rájuk; az **Írás MI-vel** a jelentéssel együtt elküldi őket.

## A mérések {#the-measures}

A pályákat 2 másodpercenként egy pontra mintavételezzük újra (a kosár végén lévő pozíció és az azon belüli sebesség). A távolságokat az adatok saját tipikus távolságával skálázzuk – az egységtől a legközelebbi csapattársáig mért medián távolsággal –, így ugyanaz a mérés gyalogságra, tankokra és repülőgépekre egyaránt működik.

| Mérés | Mit mér | Nullmodell és teszt | Tudás |
|---|---|---|---|
| Kollektív összhang | Mindkét oldal mozgó egységeinek polarizáltsága (az átlagos egységirány hossza) 2 másodpercenként, a körbeforgás (a súlypont körüli forgás), az idő és a mozgás polarizált, körbeforgó és rajzó részaránya a meccs szakaszai szerint; két összehangolt oldal közötti harcban a jobban összehangolt oldal ölési részaránya | Az egység saját pályája az időben eltolva a meccsen belül (megtartja az útvonalát, megszünteti az egyidejűséget); előjelcserés teszt 60 másodperces ablakokon | Vicsek 1995, Couzin 2002, Tunstrøm 2013 |
| Útvonal-csordázás | Milyen gyakran hagy el egy egység egy helyet úgy, ahogy az előtte lévő csapattárs tette (30 másodpercen belül), ugyanazon a bejáraton át, a hely saját kilépési részarányaihoz viszonyítva – és egy ellenség korábbi átkelésének másolásához képest | A kilépések a helyen és a bejáraton belül megkeverve; a hatás csapattárs-másolás mínusz ellenség-másolás (Manski tükörprobléma: a másolás és az oldal közös terve egyformának látszik) | Banerjee 1992, Bikhchandani et al. 1992, Manski 1993 |
| Sávok és nyomvonalak | A két irány oldalirányú szegregációja az ellenirányú forgalmú helyeken; a mozgás részaránya a legforgalmasabb 10%-on, annak Gini-együtthatója, és a meccsek legforgalmasabb területeinek átfedése | Az irányok megkeverve a teljes látogatások között; két rács, félnyi hellyel eltolva, mindegyik tesztelve, Bonferroni-korrekcióval | Helbing et al. 1997, 2005 |
| Tömörülés | Sebesség (az egység saját tempójához képest) és áramlás a szomszédok száma szerint, amelyek a tipikus távolság kétszeresén belül vannak; a kapacitás csökkenése a legsűrűbb osztálynál, a legforgalmasabb területen; halálozások óránként a tömegekben; a közeli csapattársak lövései percenként (társadalmi lustaság) | Az egység saját sebesség–sűrűség korrelációja, előjelcserés teszt az egységek között, minimális hatás ρ ±0,05 felett; pontos arányteszt | Helbing et al. 2000, Seyfried et al. 2005, Latané et al. 1979 |
| Vezetők és követők | Együtt haladó csapattársaknál az az időkésés (legfeljebb 8 másodperc), amelynél az egyik iránya a legjobban jelzi a másikét; vezetői gráf, hármasok tranzitivitása, a vezetők halálozási és ölési aránya | Egy pár egyik pályájának időeltolásával adódik a 95%-os küszöb; binomiális teszt 5% ellen | Nagy et al. 2010, Couzin et al. 2005 |
| Kohézió és lemaradók | Az idő, amelyet az oldal tipikus távolságának háromszorosán túl, a legközelebbi csapattárstól töltött; ott mért halálozási arány a csoporttal együtt mért arányhoz képest; egy oldal távolsága a harc ölései közül kapott részarányához képest | Két Poisson-arány pontos feltételes tesztje | Shils és Janowitz 1948, Siebold 2007 |
| Törési pont | Az ellenség felé irányuló megközelítési sebesség (az oldal saját tempójában) az oldal elvesztett részaránya szerint az utolsó percben; az a legalacsonyabb veszteségszint, ahol az oldalak visszavonulnak | Egyoldalú klaszter-bootstrap a tempó egytizedénél kisebb visszavonulás ellen (a veszteségek ott jönnek, ahol az oldalak találkoznak, és az oldalak, amelyek találkoznak, megállnak a közeledésben); Bonferroni a szintek között | Dupuy 1987, Rowland 2006 |
| Kockázat veszteségek után | A következő élet azon részaránya, amelyet az egység saját oldala előtt tölt az ellenség felé, a saját oldal részarányán és a tőle akkor visszatérő többi egységén felül: egy kill nélkül elveszített élet után és egy kill után; korai halál utáni korai halál (billentés) | Minden egység életei megkeverve (az első élet megmarad), így a véges sorozat torzítása a nullmodellben van | Kahneman és Tversky 1979, Thaler és Johnson 1990 |
| Sorozatok | P(kill k ölés után) − P(kill k halál után), k = 1..3 | Minden játékos saját sorozata 1000-szer megkeverve: kivonjuk a torzítást, amelyet Miller és Sanjurjo mutatott ki; Bonferroni a k-k között | Gilovich et al. 1985, Miller és Sanjurjo 2018 |
| Vásárlási egyetértés | Fleiss κ a felszerelési sávokra (eco, erő, teljes; a Counter-Strike-on kívül tercilisek) egy oldal körén belül | Az oldal játékos-körei megkeverve az oldal körei között | Fleiss 1971 |
| Elnyomás | Sebesség a nem halálos sérülés utáni 4 másodpercben a 4 másodperc előttihez képest, és a lövések a 10 másodperc után az előttihez képest, találatoknál és ugyanazon egység nyugodt pillanatainál | Előjelcserés teszt az egységek között, minimális hatás a tempó 0,05-ánál és percenként egy lövés | Rowland 2006 |

A jelentés minden p-értékét a Benjamini–Hochberg-féle hamis felfedezési arány (`q`) módszerén vezetjük át. Egy mérést kihagyunk, ha az adatok nem bírják el: a vásárlási egyetértéshez körök és felszerelési értékek kellenek, az elnyomáshoz sebzési események, a sorozatokhoz és a kockázathoz az egységeknek jóváírt ölések és halálesetek.

## A tömegelemzésben {#in-the-mass-analysis}

Minden meccsösszefoglaló (`<match>.summary.json`, lásd [Tömegelemzés](mass-analysis.md)) ugyanezeket a méréseket hordozza az adott meccsre a `behaviour` szakaszában, így több ezer meccs összehasonlítható anélkül, hogy a sorait újra olvasni kellene.

## Mennyire jól működik {#how-well-it-works}

Szimulált csatákon, amelyekbe minden hatás be van építve, és ugyanezeken a világokon azok nélkül (`src/insights/behaviour/sim.ts`, `behaviour.test.ts`): minden mérés megtalálja a beépített hatását, a nullvilágok pedig a hamis felfedezési küszöb alatt maradnak. A kockázat veszteségek után a legkisebb erejű; az útvonal-csordázás nem tudja megkülönböztetni a másolást a közös tervtől (egy oldal, amely egy közös célt követ, ezen a méréssel „csordázásnak” látszik).

## Fejlesztőknek {#for-developers}

- `src/insights/behaviour/acc.ts` – a gyűjtő (újramintavételezett pályák, események, körök) és a `finish`; a `motion.ts` és a `choice.ts` a mérések;
  a `bstats.ts` a permutációs, bootstrap- és kappa-segédek; a `shows.ts` a mintákat és mondatokat, amelyeket a lencse olvas (`lens.<measure>`).
- A `feed.ts` táplálja az insight-munkásszál darabjaiból; a `summaryTap.ts` egy meccsösszefoglalóból, ahogy a táblázatot streameli.
- Tudás: `src/insights/knowledge/behaviour.ts` (bejegyzések), `patterns-behaviour.ts`, `refs-behaviour.ts` (hivatkozások, mindegyik ellenőrizve a Crossref vagy Open Library rekordjával).
- Feliratok: `lens.metric.<measure>` a `locales/*/lens.json` fájlokban.
