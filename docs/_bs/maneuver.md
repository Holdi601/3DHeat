---
title: "Manevri"
parent: "Uvidi"
nav_order: 4
lang: "bs"
source: "maneuver.md"
source_hash: "2160eca678e0"
translated: true
outdated: false
---

# Manevri: kako se grupe kreću

**Uvidi → Manevri** prati kako se jedinice svake strane kreću *kao grupe* i imenuje manevre koje izvode - bočni obuhvat, kliješta, proboj, zasjedu, povlačenje, odbranu od projektila, presijecanje T - za svaki navodi koliko je siguran, brojke na kojima počiva, da li se isplatio, i njegove paralele u doktrini i historiji. **Masovna analiza → Manevri** ih broji kroz hiljade mečeva: koliko se često izvodi svaki po mapi, načinu i strani, i koliko se često isplati.

Sve se računa u vašem pregledaču, u njegovom vlastitom procesu u pozadini (`src/insights/maneuver`); meč od nekoliko stotina jedinica traje 10-500 ms, a dvočasovni zračni rat s hiljadama objekata oko jednu sekundu.

## Korištenje {#using-it}

- Otvorite **Uvidi**, karticu **Manevri**. Brojanje se pokreće čim se otvori; **Traži ponovo** nakon promjene filtera.
- **Siguran / Vjerovatan / Moguć** postavlja nivo sigurnosti koji se prikazuje (podrazumijevano Vjerovatan).
- **Vremenska linija** ima traku za svaku stranu i stupac za svaki manevar; **spisak** ispod nje prikazuje isto, po vremenu. Klik prebacuje na reprodukciju na njegovom početku, leti kamerom tamo i crta ga u 3D: put svake grupe kao strelicu (dva kraka kliješta su njegovi lukovi), obrise grupa u ključnom trenutku (neprijatelj u boji svoje strane), prednju liniju neprijatelja kao bijelu liniju. **Nacrtaj sve u 3D** dodaje ostale manevre meča, bljeđe. Linije se šalju grafičkoj kartici jednom, kada se izbor promijeni, a ne svakog kadra: s 480 manevara nacrtanih tokom reprodukcije, vremena kadrova na pravoj grafičkoj kartici (WebGL2 i WebGPU, p99 18,0-18,5 ms, maks. 19,5-20,8 ms) jednaka su onima bez njih.
- Otvoreni manevar prikazuje svoj ishod (uništenja i gubitke jedinica koje su ga izvele, dok je trajao i odmah poslije, u odnosu na razmjenu strane tokom cijelog meča), svoje dokaze, i unose baze znanja za njega - doktrinu i historijske paralele (Kana za kliješta, Sedan 1940 za proboj, Cušima za presijecanje T, Operacija Bolo za lažni napad...).
- Mala tabela na kraju: po vrsti i strani, izvedeno i isplaćeno.

![Kliješta na sintetičkom demo meču: strelice oba kraka, neprijateljsko tijelo i njegova prednja linija](../assets/img/en/maneuvers.webp)

## Kako se nalaze grupe {#how-groups-are-found}

Svaka jedinica je postavljena na zajedničku vremensku osu (korak od 1 s pješke, 2 s inače, duži za vrlo velike datoteke), i zadržana na mjestu pri smrti, tako da oživljavanje ne crta liniju preko mape. U svakom koraku jedinice jedne strane i jedne vrste (vazduhoplovi, vozila, brodovi, pješadija) se povezuju kada su blizu - 18 m pješke, 170 m za vozila, 3 km za brodove, 5 km za vazduhoplove - i kreću se slično (brzine unutar polovine brže od njih, ili obje stoje). Klaster zadržava ID grupe u kojoj je bila većina njegovih članova. Jedinica bez klase se svrstava pješke, u vozilo ili u vazduh prema svojoj brzini.

**Oblik** grupe se čita u odnosu na smjer kretanja: kolona ili linija prema tome koliko se rasprostire uzduž i poprijeko, klin kada sredina predvodi, ešalon kada se članovi povlače u stranu, kvadrat kada drže uglove.

Sve se procjenjuje u razmjeri samog meča: **domet angažovanja** `R` je 75. percentil udaljenosti između ubice i žrtve (ograničen na smisao domena), a vremena manevra se skaliraju prema vrsti jedinice (pješadija trećinu vremena tla).

## Šta pronalazi {#what-it-finds}

| Manevar | Pronađen kada |
|---|---|
| Poredak | grupa zadržava jedan oblik u 60% svojih koraka kretanja, 30 s |
| Frontalni napad | grupa se približava iz van dometa do kontakta, ¾ R ili više, unutar 35° od smjera u kojem neprijatelj gleda |
| Bočni napad | isto, iz 50-130° (pozadi preko toga); siguran samo uz prateću *snagu za fiksiranje* koja tamo vodi borbu s neprijateljem (ubistva s obje strane) |
| Kliješta | dva bočna napada jedne strane na isto neprijateljsko tijelo, sa suprotnih strana (100° ili više razlike), unutar 90 s; siguran kada krakovi vode borbu |
| Okruženje | kompaktna neprijateljska grupa s barem onoliko članova druge strane oko sebe unutar 1,5 R, iz dvije ili više grupa, bez praznine većeg od 100°, minut, odsječena od svoje strane; siguran kada se prsten zatvorio za ½ R i vodio borbu u džepu |
| Prodor | grupa prođe kroz držanu liniju (neprijatelji stoje 30 s i lijevo i desno od nje, središte njihove strane iza njih); siguran kada stigne ½ R dalje, ostane 20 s i tamo vodi borbu; proboj još R dalje |
| Pokret skokovima uz zaštitu | u maloj grupi, jedan dio se kreće dok ostali stoje, uloge se zamjenjuju četiri puta ili više, uz vatreno pokrivanje od stojećeg dijela |
| Koncentracija / rasturanje | udio strane blizu njene najgušće tačke raste sa 35% na 60% (jedinice dolaze 1,5 R ili više, pa kontakt) - ili opada kada se strana rasprostire |
| Lažni napad | mali element u kontaktu privlači dva ili više neprijatelja s drugog mjesta; veća grupa zatim udara četiri dometa dalje, gdje neprijatelj ima manje |
| Povlačenje / gonjenje | grupa u kontaktu se okrene i otvori R od mjesta na kojem je borila; siguran kada je neprijatelj tamo upravo ubio jednog iz nje i grupa je dobila 2 R od tog ubice (nikada pješke: vidi dolje); neprijatelji koji se kreću u istom smjeru i drže korak gone |
| Odbrana po dubini | stojeće jedinice u dva ili više pojasa preko neprijateljske osovine, R duboko, neprijatelj nailazi, vatra iz pojasa |
| Suprotna padina | tri ili više ubistava s kratke daljine od stojećih jedinica žrtava koje su došle preko grebena |
| Zasjeda | krećuća grupa sreće neprijatelje koji su stajali 45 s; oni prvi pucaju i pokretni gube dva ili polovinu grupe |
| Osiguranje | jedna ili dvije jedinice koje se kreću ispred tijela od tri ili više, prve dolaze do neprijatelja |
| Unutrašnje linije | grupe jedne strane blizu jedna drugoj između grupa druge, njene jedinice se pomjeraju među njima |
| Tempo | strana koja odgovara na kontakt (okret, promjena brzine, prvi hitac) 1,5 puta brže, Mann-Whitney p ispod 0,05 |
| Crank, notch, drag, pump | cilj lansiranja projektila okrene strijelca na 35-70°, 75-105°, preko 140°, ili vuče pa se vraća |
| Zračna kliješta, zid, lead-trail, grinder | par se razdvaja na jednog neprijatelja; tri u liniji na neprijatelja; element 5-20 km iza drugog; dva kruže oko jedne tačke na razmaku od jednog |
| Borbena zračna patrola | kruži oko stanice tri minute |
| Borba energije / uglova | u bliskoj borbi - smjerovi 30° jedan od drugog, svaki naizmjence drži drugog na nosu, ili ubistvo između njih - korištena visina i penjanje, ili ravno i oštro okretanje uz usporavanje; siguran kada je jedan ubio drugog |
| Udarni paket, SEAD | grupa vazduhoplova mješovitih uloga, od kojih neke gađaju tlo; ubistva protivvazdušne odbrane prije većine ostalih ubistava na tlu |
| Borbena linija, presijecanje T | tri broda u koloni; kolona kvadratno preko glave neprijateljske kolone |

Svaki manevar kaže koje **obrasce** baze znanja pokazuje (`patterns-maneuver.ts`: poredak, frontalni napad, dvostruki obuhvat, okruženje, prodor, vatra i manevar, lažni napad, povlačenje, gonjenje, odbrana po dubini, osiguranje, rasturanje, odbrana od projektila, borba uglova, udarni paket, borbena linija, presijecanje T) i unose koje treba prvo pročitati; stariji unosi prenose nove obrasce kroz `knowledge/maneuver-tags.ts`. Pogledajte [Sočivo znanja](knowledge.md).

**Isplatio se** upoređuje razmjenu jedinica tokom trajanja (i minut poslije) sa razmjenom njihove strane tokom cijelog meča; povlačenje se isplati kada je izgubilo manje jedinica poslije okreta nego prije, odbrana od projektila kada avion preživi minut, okruženje kada džep izgubi polovinu.

## Preko mnogo mečeva {#over-many-matches}

Sažetak svakog meča (`src/mass/summarize.ts`, vidi [Masovna analiza](mass-analysis.md)) sadrži mali odjeljak `maneuvers`: po vrsti i strani, izvedeno (na Vjerovatan ili više), isplaćeno, neisplaćeno, uništenja i gubici. **Masovna analiza → Manevri** ih zbraja po mečevima koje filter zadržava - po mapi i načinu, ili za sve - uz interval Wilsona za stopu isplaćenih; red učitava mečeve u kojima je izveden. Sažeci napisani prije postojanja ovog odjeljka nemaju ga: pokrenite `node tools/3dheat-summarize.mjs <folder> --force` da ga dodate.

## Koliko je siguran {#how-sure-it-is}

Sintetički mečevi s ugrađenim manevrima (`synth.ts`, pokreće ih `maneuver.test.ts`): svih 28 ugrađenih vrsta se nalazi na Vjerovatan ili više; od 50 prijavljenih manevara, 31 je ugrađene vrste, a ostalih 19 je također stvarno prisutno (oblik pokretne grupe, frontalni prilaz prodornog stupca); nijedan nije pogrešan. Na 30 nultih mečeva - slučajna kretanja odvojeno i pomiješano, jedinice koje stoje nasumično, vazduhoplovi na pravim putanjama, gužva koja se kreće okolo - ništa se ne prijavljuje na Vjerovatan ili više.

Na stvarnim podacima (desetine borbi na tlu, nekoliko dugih misija zračnog rata, desetak mečeva pucačine): frontalni napadi, bokovi, prodori i okruženja u tenkovskim bitkama, poredci i bliske borbe u vazduhu, odbrane od projektila, patrole CAP i parovi lead-trail u misijama zračnog rata, frontalna pogubljenja, kolone i nekoliko zasjeda i parova skokova u pucačini. Pragovi su oblici doktrine na razmjeri igre; pojedinačni nalaz čitajte uz njegove dokaze, a stope iz tabele mase uz njihove intervale.

### Prema nultim modelima istih mečeva {#against-null-models-of-the-same-matches}

Detektor može biti zavaran tlom i gužvom: u tučnjavi svaka grupa ima neprijatelje sa svih strana. Zato se svaka vrsta pokreće i na **nultim modelima** napravljenim od istih mečeva (`nulls.ts`), gdje se strane više ne susreću kao prije: vremenska linija jedne strane okrenuta za trećinu do dvije trećine meča (*shift*), ili njeni tragovi okrenuti oko središta mape (*rotate*); i oznake timova izmiješane (*teams*, koja po konstrukciji zadržava oko polovinu stvarnih borbi). Borbe se broje samo kao ubistva uparena sa svojim smrtima, ubica unutar 2 R i žrtva na mjestu - nulti model to pokvari. Nalazi na Vjerovatan ili više, stvarni naspram nultih modela (30 tenkovskih bitaka; 12 mečeva pucačine):

| Vrsta | Tenkovske bitke: stvarno / shift / rotate | Pucačina: stvarno / shift / rotate |
|---|---|---|
| Okruženje | 0 / 0 / 0 (bilo je 1,3 / 1,2 / 0,8) | 0 / 0 / 0 |
| Prodor | 0,03 / 0,02 / 0,05 (bilo je 1,6 / 1,8 / 1,4) | 0 / 0 / 0 |
| Bok | 0,33 / 0,07 / 0,10 | 1,0 / 0,08 / 0,21 |
| Frontalni napad | 0,87 / 0,47 / 0,12 | 14,4 / 6,5 / 4,3 |
| Povlačenje | 0,03 / 0 / 0,02 | 0,08 / 0,08 / 0,5 (zato nikada nije siguran pješke) |
| Zasjeda | - | 0,17 / 0,04 / 0,04 |
| Borba energije | 1,2 / 0,1 / 0,85 | - |
| Borba uglova | 0,6 / 0,07 / 0,3 | - |

Bliske borbe u vazduhu iznad središta bojišta opstaju pri okretu oko tog središta, pa im kolona rotate laska manje nego što to čini kopnenim vrstama. Vrste unutar jedne strane - poredak, borbena zračna patrola, grinder, udarni paket, SEAD, pokret skokovima, osiguranje - ne zavise od druge strane i ne ispituju se ovako. `maneuver.test.ts` provjerava da nulti modeli uklanjaju ugrađene bok, kliješta, okruženje, prodor, zasjedu i povlačenje iz sintetičkih mečeva.

## Ograničenja {#limits}

- Grupama trebaju pozicije kroz vrijeme; datoteka samo sa događajima ih nema.
- Smjer gledanja se ne čita iz podataka: prednja strana neprijatelja je tamo gdje ga snaga za fiksiranje zahvata, inače tamo gdje se kreće, inače odakle je napadač došao.
- Teren se čita iz visina samih jedinica (suprotna padina); nema provjere vidljivosti.
- Vrlo velike datoteke se uzorkuju dužim koracima; kratki zračni manevri u njima se i dalje čitaju iz koraka od 2-4 s.
