---
title: "Manevri"
parent: "Uvidi"
nav_order: 4
lang: "hr"
source: "maneuver.md"
source_hash: "2160eca678e0"
translated: true
outdated: false
---

# Manevri: kako se skupine kreću

**Uvidi → Manevri** prati kako se jedinice svake strane kreću *kao skupine* i imenuje manevre koje izvode: bok, kliješta, proboj, zasjedu, povlačenje, obranu od projektila, prelazak preko T. Za svaki manevar pokazuje koliko je siguran, brojke iza njega, je li se isplatio i njegove paralele u doktrini i povijesti. **Masovna analiza → Manevri** ih broji kroz tisuće utakmica: koliko se često svaki izvodi po karti, načinu igre i strani te koliko se često isplati.

Sve se izračunava u vašem pregledniku, u njegovom vlastitom radnom procesu (`src/insights/maneuver`). Utakmica od nekoliko stotina jedinica traje 10-500 ms, a dvosatni zračni rat s tisućama objekata oko jednu sekundu.

## Upotreba {#using-it}

- Otvorite **Uvide**, karticu **Manevri**. Računanje počinje čim je kartica otvorena. Nakon promjene filtara kliknite **Traži ponovno**.
- **Siguran / Vjerojatan / Moguć** postavlja prikazanu sigurnost. Podrazumijevano je Vjerojatan.
- **Vremenska os** ima prugu za svaku stranu i traku za svaki manevar. **Popis** ispod nje prikazuje isto, po vremenu. Klik prebacuje na reprodukciju na početak manevra, kamera leti tamo i manevar se crta u 3D. Put svake skupine prikazuje se kao strelica (dva kraka kliještiju su njegova dva luka). Obrisi skupina prikazani su u ključnom trenutku, a neprijatelj u boji svoje strane. Prednja linija neprijatelja prikazana je bijelom linijom. **Nacrtaj sve u 3D** dodaje ostale manevre utakmice, blijedo. Linije se grafičkoj kartici šalju jednom, kad se promijeni odabir, a ne svaki kadar. S 480 manevara nacrtanih tijekom reprodukcije, vremena kadrova na pravoj grafičkoj kartici (WebGL2 i WebGPU, p99 18,0-18,5 ms, najviše 19,5-20,8 ms) jednaka su onima bez njih.
- Otvoreni manevar prikazuje svoj ishod: uništenja i gubitke jedinica koje su ga izvele, dok je trajao i odmah nakon, u usporedbi s razmjenom njihove strane tijekom cijele utakmice. Prikazuje i svoje dokaze te unose baze znanja za njega, doktrinu i povijesne paralele (Kana za kliješta, Sedan 1940. za proboj, Cušima za prelazak preko T, operacija Bolo za lažni napad...).
- Mala tablica na kraju: po vrsti i strani, izvedeno i isplaćeno.

![Kliješta na sintetičkoj demo-utakmici: strelice oba kraka, tijelo neprijatelja i njegova prednja linija](../assets/img/en/maneuvers.webp)

## Kako se nalaze skupine {#how-groups-are-found}

Svaka jedinica stavlja se na zajedničku vremensku os. Korak je 1 s pješice, inače 2 s, a duži je za vrlo velike datoteke. Pri smrti jedinica se zadržava na mjestu, da ponovno oživljavanje ne bi crtalo liniju preko karte. Na svakom koraku povezuju se jedinice jedne strane i jedne vrste (zrakoplovi, vozila, brodovi, pješaštvo) kad su blizu: 18 m pješice, 170 m za vozila, 3 km za brodove, 5 km za zrakoplove. Povezuju se i kad se kreću slično, to jest kad su brzine unutar polovice brže od njih ili kad obje stoje. Skupina zadržava ID grupe u kojoj je bila većina njezinih članova. Jedinica bez klase svrstava se pješice, u vozilo ili u zrak, prema svojoj brzini.

**Oblik** skupine čita se prema smjeru kretanja. Kolona ili linija prepoznaju se po rasponu uzduž i poprijeko. Klin je kad sredina predvodi. Ešalon je kad se članovi pomiču unatrag na jednu stranu. Kutija je kad drže kutove.

Sve se procjenjuje prema mjerilu same utakmice. **Raspon angažmana** `R` je 75. percentil udaljenosti između ubojice i njegove žrtve, ograničen na smisao domene. Vremena manevra skaliraju se prema vrsti jedinice: za pješaštvo je trećina onoga za kopno.

## Što pronalazi {#what-it-finds}

| Manevar | Pronađen kad |
|---|---|
| Formacija | skupina zadrži jedan oblik u 60 % svojih koraka u kretanju tijekom 30 s |
| Frontalni napad | skupina se približava od izvan dometa do kontakta, ¾ R ili više, iz kuta od 35° od smjera u kojem neprijatelj gleda |
| Napad s boka | isto, ali iz 50-130° (straga iznad toga); siguran samo s prijateljskom *snagom za učvršćivanje* koja se tamo bori s neprijateljem (ubijanja u oba smjera) |
| Kliješta | dva napada s boka jedne strane na isto neprijateljsko tijelo, s suprotnih strana (100° ili više razlike), unutar 90 s; siguran kad se krakovi bore |
| Opkoljavanje | kompaktna neprijateljska skupina, s barem jednakim brojem drugih iz njezine strane unaokolo unutar 1,5 R, iz dvije ili više skupina, bez praznine većeg od 100°, jednu minutu, odsječena od svoje strane; siguran kad se prsten zatvorio za ½ R i borio se oko džepa |
| Prodor | skupina prelazi držanu liniju (neprijatelji stoje 30 s i lijevo i desno od nje, središte njihove strane iza njih); siguran kad dobije ½ R iza nje, ostane 20 s i tamo se bori; proboj je još jedan R dalje |
| Pokrivanje u kretanju | u maloj skupini dio se kreće dok ostatak stoji, uloge se zamjenjuju četiri puta ili češće, uz pokrivajuću vatru od stojećeg dijela |
| Koncentracija / raspršenje | udio strane blizu njezine najgušće točke raste s 35 % na 60 % (jedinice dolaze 1,5 R ili više, pa kontakt), ili pada kad se strana raširi |
| Lažni napad | mali element u kontaktu privlači dva ili više neprijatelja s drugog mjesta; veća skupina tada udara četiri raspona dalje, gdje neprijatelj ima manje snage |
| Povlačenje / progon | skupina u kontaktu okreće se i odmakne R od mjesta gdje se borila; siguran kad je neprijatelj tamo upravo ubio jednog njezinog člana i kad se skupina udaljila 2 R od tog ubojice (nikad pješice, vidi dolje); neprijatelji koji se kreću istim smjerom i drže korak progone |
| Obrana u dubinu | stojeće jedinice u dva ili više pojasa preko neprijateljske osi, R duboko, neprijatelj nailazi, vatra iz pojaseva |
| Obrnuta padina | tri ili više ubojstava s kratkog dometa od stojećih jedinica, žrtava koje su došle preko grebena |
| Zasjeda | pokretna skupina nailazi na neprijatelje koji su stajali 45 s; oni pucaju prvi, a pokretni gube dvije jedinice ili polovicu skupine |
| Zaslon | jedna ili dvije jedinice koje se kreću ispred tijela od tri ili više članova i prve susreću neprijatelja |
| Unutarnje linije | skupine jedne strane blizu jedna drugoj, među skupinama druge strane; njezine jedinice se pomiču među njima |
| Tempo | strana koja odgovara na kontakt (zaokret, promjena brzine, prvi hitac) 1,5 puta brže, Mann-Whitney p manji od 0,05 |
| Krivulja, zarez, vuča, pumpa | meta lansiranja projektila okreće strijelca na 35-70°, na 75-105°, preko 140°, ili vuče pa se vraća |
| Zračno kliješta, zid, vodeći-prateći, mlinac | par se razdvaja na jednog neprijatelja; trojica uz bok prema neprijatelju; element 5-20 km iza drugog; dvojica kruže oko jedne točke na razmaku od jednog |
| Borbena zračna patrola | kruži oko postaje tri minute |
| Borba za energiju / kutove | u bliskoj borbi: kursevi 30° razmaknuti, svaki drži drugoga na nosu redom, ili ubojstvo između njih; visina iskorištena i penjanje, ili ravno i oštro zaokretanje uz usporavanje; siguran kad je jedan ubio drugoga |
| Paket udara, SEAD | zračna skupina mješovitih uloga, od kojih neki gađaju tlo; ubojstva protuzračne obrane prije većine ostalih ubojstava na tlu |
| Linija bitke, prelazak preko T | tri broda u koloni; kolona koja prelazi pod pravim kutom preko glave neprijateljske kolone |

Svaki manevar kaže koje **obrasce** baze znanja pokazuje (`patterns-maneuver.ts`: formacija, frontalni napad, dvostruko obuhvaćanje, opkoljavanje, prodor, vatra i manevar, lažni napad, povlačenje, progon, obrana u dubinu, zaslanjivanje, raspršenje, obrana od projektila, borba kutovima, borbena zračna patrola, paket udara, linija bitke, prelazak preko T). Kaže i koje unose treba prvo pročitati. Stariji unosi nose nove obrasce preko `knowledge/maneuver-tags.ts`. Vidi [Leća znanja](knowledge.md).

**Isplatio se** uspoređuje razmjenu jedinica dok je manevar trajao (i minutu poslije) s razmjenom njihove strane tijekom cijele utakmice. Povlačenje se isplati kad je nakon okreta izgubilo manje jedinica nego prije. Obrana od projektila se isplati kad zrakoplov preživi minutu. Opkoljavanje se isplati kad džep izgubi polovicu.

## Kroz mnoge utakmice {#over-many-matches}

Sažetak svake utakmice (`src/mass/summarize.ts`, vidi [Masovna analiza](mass-analysis.md)) nosi mali odjeljak `maneuvers`: po vrsti i strani, izvedeno (na Vjerojatan ili više), isplaćeno, neisplaćeno, uništenja i gubici. **Masovna analiza → Manevri** zbraja ih kroz utakmice koje filtar zadržava, po karti i načinu igre ili za sve, s Wilsonovim intervalom stope isplaćivanja. Redak učitava utakmice u kojima je manevar izveden. Sažeci napisani prije tog odjeljka ga nemaju. Pokrenite `node tools/3dheat-summarize.mjs <mapa> --force` da ga dodate.

## Koliko je siguran {#how-sure-it-is}

Sintetičke utakmice s ugrađenim manevrima (`synth.ts`, pokreće ih `maneuver.test.ts`): svih 28 ugrađenih vrsta pronađeno je na Vjerojatan ili više. Od 50 prijavljenih manevara, 31 je ugrađene vrste, a ostalih 19 zaista postoji (oblik pokretne skupine, prilaz prodirućeg stupca s fronte). Nijedan nije pogrešan. Na 30 nultih utakmica, gdje se slučajna hodanja razdvajaju i miješaju, jedinice stoje nasumično, zrakoplovi lete ravnim putanjama, a gomila se vrti na mjestu, ništa nije prijavljeno na Vjerojatan ili više.

Na stvarnim podacima (desetak kopnenih bitki, nekoliko dugih misija zračnog rata, desetak utakmica pucačine): frontalni napadi, bokovi, prodori i opkoljavanja u tenkovskim bitkama; formacije i bliske borbe u zraku; obrane od projektila, orbite borbene zračne patrole i parovi vodeći-prateći u misijama zračnog rata; frontalna izvršenja, kolone i nekoliko zasjeda i parova u kretanju u pucačini. Pragovi su oblici doktrine na mjerilu igre. Pojedini nalaz čitajte s njegovim dokazima, a stope iz tablice s njihovim intervalima.

### Naspram nultih modela istih utakmica {#against-null-models-of-the-same-matches}

Detektor se može zavarati terenom i gužvom: u tuči svaka skupina ima neprijatelje sa svih strana. Zato se svaka vrsta pokreće i na **nultim modelima** izgrađenim iz istih utakmica (`nulls.ts`). U njima se strane više ne susreću kao prije. Vremenska os jedne strane okrene se za trećinu do dvije trećine utakmice (*shift*), ili se njezine putanje okrenu oko središta karte (*rotate*). Oznake timova su izmiješane (*teams*), što po konstrukciji zadržava otprilike polovicu stvarnih borbi. Borbe se broje samo kao ubojstva uparena sa smrtima: ubojica unutar 2 R, a žrtva na mjestu. Nulti model to razbija. Nalazi na Vjerojatan ili više, stvarni naspram nultih modela (30 bitki tenkova; 12 utakmica pucačine):

| Vrsta | Bitke tenkova: stvarno / shift / rotate | Pucačina: stvarno / shift / rotate |
|---|---|---|
| Opkoljavanje | 0 / 0 / 0 (bilo je 1,3 / 1,2 / 0,8) | 0 / 0 / 0 |
| Prodor | 0,03 / 0,02 / 0,05 (bilo je 1,6 / 1,8 / 1,4) | 0 / 0 / 0 |
| Bok | 0,33 / 0,07 / 0,10 | 1,0 / 0,08 / 0,21 |
| Frontalni napad | 0,87 / 0,47 / 0,12 | 14,4 / 6,5 / 4,3 |
| Povlačenje | 0,03 / 0 / 0,02 | 0,08 / 0,08 / 0,5 (zato nikad nije siguran pješice) |
| Zasjeda | - | 0,17 / 0,04 / 0,04 |
| Borba za energiju | 1,2 / 0,1 / 0,85 | - |
| Borba kutovima | 0,6 / 0,07 / 0,3 | - |

Bliske zračne borbe iznad središta bojišnice prežive okret oko tog središta. Zato im stupac rotate manje ide u prilog nego kopnenim vrstama. Vrste unutar jedne strane (formacija, borbena zračna patrola, mlinac, paket udara, SEAD, pokrivanje u kretanju, zaslon) ne ovise o drugoj strani i nisu ovako testirane. `maneuver.test.ts` provjerava uklanjaju li nulti modeli iz sintetičkih utakmica ugrađene bok, kliješta, opkoljavanje, prodor, zasjedu i povlačenje.

## Ograničenja {#limits}

- Skupine trebaju položaje kroz vrijeme. Datoteka samo s događajima nema položaja.
- Smjer nije čitan iz podataka: neprijateljska fronta je tamo gdje je snaga za učvršćivanje angažira, inače tamo gdje se kreće, inače tamo odakle je napadač došao.
- Teren se čita iz visina samih jedinica (obrnuta padina). Nema provjere linije vida.
- Vrlo velike datoteke uzorkuju se većim koracima. Kratki zračni manevri u njima se i dalje čitaju iz koraka od 2-4 s.
