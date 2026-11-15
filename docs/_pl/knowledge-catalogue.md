---
title: "Katalog wiedzy"
parent: "Soczewka wiedzy"
nav_order: 2
lang: "pl"
source: "knowledge-catalogue.md"
source_hash: "dc29e603ed50"
translated: true
outdated: false
---

# Katalog wiedzy

To pełna lista tego, co zna [soczewka wiedzy](knowledge.md): wzorce, których szuka, pomysły, metody, przypadki historyczne i badania, które przytacza, oraz książki i artykuły, na których się opierają. Użyj jej, aby znaleźć wpis po identyfikatorze albo sprawdzić źródło.

Ta strona jest generowana z bazy wiedzy poleceniem `node tools/knowledge-doc.mjs`; nie zmieniaj nic między znacznikami.

<!-- kb:begin -->

Baza wiedzy zawiera 579 wpisów (135 koncepcji, 37 metod, 277 przypadków historycznych, 17 zasad projektowych, 113 badań) w 93 wzorcach, z 556 odwołaniami do źródeł.

### Wzorce (93) {#patterns-93}

| id | rodzina | jak to wygląda w danych |
|---|---|---|
| `concentration` | siła | Strona, która zgromadzi więcej jednostek w jednym miejscu, wygrywa to miejsce przewagą większą niż sama liczebność. |
| `local-superiority` | siła | Zabójstwa przypadają tej stronie, która w zasięgu walki ma przewagę liczebną, bez względu na sumy. |
| `attrition` | siła | Straty idą za siłą obu stron w czasie; walkę rozstrzyga ta, która pierwsza się wyczerpie. |
| `exchange-ratio` | siła | Liczba zabójstw na jedną stratę mocno różni się zależnie od miejsca, strony lub klasy. |
| `aimed-fire` | siła | Straty rosną wraz z liczebnością wroga, ale nie wraz z własną. |
| `area-fire` | siła | Straty rosną z iloczynem liczebności obu stron: tłok jest karany. |
| `defeat-in-detail` | siła | Stronę niszczy się po kawałku, gdy jej części nadchodzą pojedynczo. |
| `mutual-support` | siła | Stratę szybko kompensuje pobliski kolega z drużyny: wymiany. |
| `combined-arms` | siła | Klasy dobrze radzą sobie razem, gdy każda kryje słabość drugiej, a źle samotnie. |
| `class-counter` | siła | Jedna klasa wygrywa nieproporcjonalnie z określoną inną klasą lub w określonym miejscu. |
| `initiative` | siła | Kto pierwszy zdobędzie punkty w starciu, zwykle je wygrywa. |
| `key-terrain` | teren | Te same kilka miejsc rozstrzyga walki mecz po meczu. |
| `fields-of-fire` | teren | Miejsca, z których widać daleko po terenie, który inni muszą przejść, dają więcej zabójstw. |
| `high-ground` | teren | Zabójstwa padają z góry, z terenu wyższego niż ten, na którym stoją ofiary. |
| `cover` | teren | Zgony na jednostkę czasu spadają tam, gdzie geometria blokuje wzrok i ogień. |
| `open-ground` | teren | Zgony na jednostkę czasu rosną tam, gdzie nic nie blokuje wzroku i ognia. |
| `kill-zone` | teren | Zgony skupiają się tam, gdzie ruch jest zmuszony przechodzić przez teren obserwowany i pokryty ogniem. |
| `chokepoint` | teren | Wiele przejść ściśniętych na małym terenie, ze stratami w tym miejscu. |
| `reverse-slope` | teren | Bezpieczeństwo tuż za grzbietem lub murem, poza bezpośrednim polem widzenia wroga. |
| `safe-ground` | teren | Miejsce, w którym spędza się czas, ale mało kto ginie. |
| `obstacle` | teren | Trasy omijają zablokowany teren i skupiają się w kilku pasach. |
| `flank` | ruch | Rzadko używana trasa daje więcej zabójstw niż główne. |
| `avenue-of-approach` | ruch | Ruch płynie kilkoma pasami między obszarami. |
| `mobility` | ruch | Poruszające się jednostki giną rzadziej (lub częściej) na jednostkę czasu niż wolne lub stojące. |
| `static-exposure` | ruch | Jednostki stojące w miejscu giną częściej na jednostkę czasu niż poruszające się. |
| `interior-lines` | ruch | Strona z krótkimi trasami między swoimi walkami przesuwa siłę szybciej niż druga. |
| `envelopment` | ruch | Zabójstwa nadchodzą z kilku kierunków na pozycję jednej strony. |
| `ambush` | ruch | Jednostki idące trasą szybko giną od wrogów, którzy już zajęli pozycję. |
| `spawn-pressure` | czas | Życie kończy się wkrótce po starcie na jednym punkcie odrodzenia. |
| `tempo` | czas | Szybsza strona dociera do walki i zdobywa punkty, zanim druga zareaguje. |
| `surprise` | czas | Straty przychodzą serią, zanim ofiary zdążą odpowiedzieć ogniem. |
| `energy-advantage` | powietrze | Zabójcy mają większą wysokość i prędkość niż ich ofiary. |
| `air-superiority` | powietrze | Samoloty jednej strony zabijają wielokrotnie więcej, niż same tracą. |
| `sead` | powietrze | Naziemna obrona przeciwlotnicza zabiera wiele samolotów, dopóki nie zostanie wykryta i zniszczona. |
| `bvr` | powietrze | Zabójstwa dzieją się z dużej odległości, zanim ofiara zdąży się zbliżyć. |
| `fleet-salvo` | morze | Siła, która pierwsza uderzy, traci niewiele; druga ledwie przetrwa, by odpowiedzieć. |
| `scouting` | morze | Strona, która pierwsza znajdzie drugą, wybiera walkę. |
| `urban-close` | miasto | Krótkie zasięgi walki, wiele zgonów wśród gęstej zabudowy, powolne oczyszczanie. |
| `vertical` | miasto | Zabójstwa z wyższych pięter lub dachów na ulice. |
| `skill-dispersion` | ludzie | Kilku graczy odpowiada za dużą część zabójstw lub zgonów. |
| `ai-vs-player` | ludzie | Jednostki sterowane przez AI radzą sobie inaczej niż gracze w tym samym miejscu. |
| `balance` | projekt | Strony, punkty odrodzenia lub klasy startują z nierównymi szansami. |
| `economy` | projekt | Zasoby zdobywane, wydawane i tracone skupiają się w kilku miejscach lub u kilku graczy. |
| `flow` | projekt | Jak gracze poruszają się po poziomie: pętle, pasy, ślepe zaułki. |
| `sightlines` | projekt | Długie linie widzenia decydują, gdzie zaczynają się walki i kto je wygrywa. |
| `readability` | projekt | Zgony, których gracze nie widzą nadchodzących: od tyłu, spoza pola widzenia. |
| `formation` | ruch | Jednostki strony poruszają się razem w rozpoznawalnym kształcie: linia, kolumna, klin, szyk schodkowy, prostokąt. |
| `frontal-assault` | ruch | Grupa zbliża się do wroga prosto w czoło jego frontu. |
| `double-envelopment` | ruch | Dwie grupy uderzają w obie flanki jednego zgrupowania wroga mniej więcej w tym samym czasie. |
| `encirclement` | ruch | Grupa wroga zostaje otoczona przez drugą stronę ze wszystkich stron i ma niewiele dróg ucieczki. |
| `penetration` | ruch | Grupa przechodzi przez linię wroga, gdzie wrogowie stoją po obu jej stronach. |
| `fire-and-maneuver` | ruch | Część grupy się porusza, a reszta stoi i osłania ją; role się zmieniają. |
| `feint` | ruch | Mała grupa ściąga wroga w jedno miejsce; główne uderzenie pada krótko potem gdzie indziej. |
| `withdrawal` | ruch | Grupa w kontakcie odwraca się i zwiększa dystans do wroga. |
| `pursuit` | ruch | Grupa goni wroga, który się oddala, utrzymując lub zmniejszając dystans. |
| `defence-in-depth` | teren | Obrońcy stoją w kilku pasach jeden za drugim wzdłuż osi natarcia wroga. |
| `screening` | ruch | Mały oddział idzie daleko przed główne siły i jako pierwszy spotyka wroga. |
| `dispersion` | siła | Strona rozprasza się w czasie; mniej jej jednostek dzieli jedno miejsce. |
| `missile-defence` | powietrze | Samoloty pod zagrożeniem rakietowym obracają się bokiem lub ogonem do pocisku: crank, notch, drag, pump. |
| `angles-fight` | powietrze | Walka manewrowa z bliska przy małej prędkości i dużej szybkości skrętu, prowadzona o pozycję nosa, a nie o energię. |
| `cap` | powietrze | Samoloty krążą nad stałym punktem przez minuty, czekając na wroga. |
| `strike-package` | powietrze | Samoloty o różnych rolach lecą razem na cel: jedne atakują cel naziemny, inne je osłaniają. |
| `line-of-battle` | morze | Okręty płyną w kolumnie jeden za drugim, tak aby wszystkie burty mogły strzelać. |
| `crossing-the-t` | morze | Przecięcie T: kolumna przechodzi przed czoło kolumny wroga. Wszystkie jej działa mogą strzelać, a niewiele wrogich. |
| `fatal-funnel` | miasto | Gracze wchodzący przez jedne drzwi, pokój lub przesmyk giną tam w ciągu chwili znacznie częściej niż wchodząc gdzie indziej. |
| `crossfire` | siła | Strzelcy, których linie ognia zbiegają się pod różnymi kątami, wygrywają więcej pojedynków niż pojedynczy strzelec. |
| `peeker-advantage` | czas | Gracz, który wchodzi w pole widzenia, wygrywa pojedynki z tym, kto trzyma kąt, częściej (lub rzadziej) niż w połowie przypadków. |
| `entry` | czas | Pierwsze zabójstwo w rundzie rozstrzyga dużą jej część; wejście wygrywa się lub przegrywa zależnie od miejsca i wsparcia. |
| `utility-support` | siła | Błysk lub dym tuż przed pojedynkiem zmienia, kto go wygra. |
| `man-advantage` | siła | Rundy wygrywa strona z większą liczbą żywych graczy; niektóre strony zamieniają przewagę w wygraną, inne ją marnują. |
| `clutch` | ludzie | Ostatni żywi gracze wygrywają częściej (lub rzadziej), niż wskazuje stan rundy. |
| `action-value` | ludzie | Zabójstwa, wymiany, podłożenie ładunku i użycie wyposażenia różnią się tym, jak bardzo zmieniają szansę na wygraną. |
| `lurk` | ruch | Gracz sam, daleko od drużyny, zabija (lub ginie) w innym tempie niż reszta grupy. |
| `rotation` | ruch | To, jak szybko strona przerzuca graczy do walki lub celu, decyduje, czy utrzyma, czy odzyska pozycję. |
| `collective-order` | ludzie | Poruszające się jednostki strony zwracają się w tym samym kierunku znacznie częściej, niż wynikałoby to z przypadku przy ich własnych, przesuniętych w czasie trasach. |
| `milling` | ludzie | Jednostki strony krążą wokół wspólnego środka: obrót bez przemieszczenia netto. |
| `herding` | ludzie | Jednostki opuszczają miejsce tak, jak zrobił to poprzedni kolega z drużyny, ponad szanse samego miejsca i ponad kopiowanie wroga. |
| `lane-formation` | ludzie | Przeciwne strumienie trzymają się osobnych pasów; ruch skupia się na kilku szlakach używanych mecz po meczu. |
| `crowding` | ludzie | Prędkość i przepływ spadają, gdy jednostki się zbijają; przez przesmyk mocniejsze pchanie przepuszcza mniej. |
| `leadership` | ludzie | Niektóre jednostki skręcają pierwsze, a inne kopiują ich kierunek kilka sekund później. |
| `cohesion` | ludzie | Jednostki odłączające się od grupy giną częściej niż te, które trzymają się z nią razem. |
| `breaking-point` | ludzie | Strona, która straciła część siły, przestaje się zbliżać i cofa się, ponad to, co wyjaśnia jej dystans do wroga. |
| `panic` | ludzie | Pod nagłym zagrożeniem jednostki rozpraszają się, uciekają lub zamierają, a koordynacja się rozpada. |
| `loss-chasing` | ludzie | Po stracie jednostki podejmują więcej (lub mniej) ryzyka niż po zysku. |
| `hot-hand` | ludzie | Sukces częściej goni sukces, niż pozwalają na to przetasowane ciągi tego samego gracza. |
| `conformity` | ludzie | Członkowie strony wybierają jednakowo — zakupy, wyposażenie, trasy — ponad własne preferencje. |
| `suppression` | ludzie | Nadlatujący ogień zmienia sposób poruszania się i strzelania jednostek, nawet gdy nie zabija. |
| `social-loafing` | ludzie | Wkład na głowę spada, gdy obecnych jest więcej kolegów z drużyny. |
| `mixed-strategy` | ludzie | Wybory, które powinny być nieprzewidywalne, stają się wzorcowe: jedna opcja wygrywa częściej albo wybory układają się w ciągi. |
| `coordination` | ludzie | Członkowie działają zgodnie bez widocznych rozkazów: zsynchronizowany ruch, czas i wybory. |
| `contagion` | ludzie | Stan przechodzi od jednostki do jednostki przez kontakt lub bliskość i rozprzestrzenia się po mapie. |
| `territoriality` | ludzie | Jednostki zachowują dystans od siebie i trzymają się własnego terenu. |
| `interaction-network` | ludzie | Kto z kim walczy, wspiera lub podąża, tworzy sieć z węzłami, skupiskami i mostami. |

### Koncepcje (135) {#concepts-135}

| id | tytuł | soczewki | wzorce | źródła |
|---|---|---|---|---|
| `concept.lanchester-square` | Prawo kwadratów Lanchestera (ogień celowany) | wojskowe, lotnictwo, morskie, e-sport | aimed-fire, concentration, attrition, local-superiority | Lanchester 1916; Osipov 1995; Taylor 1983; Washburn & Kress 2009 |
| `concept.lanchester-linear` | Prawo liniowe Lanchestera (ogień obszarowy, jeden na jeden) | wojskowe, miejskie, e-sport | area-fire, attrition, urban-close | Lanchester 1916; Taylor 1983; Bracken 1995; Washburn & Kress 2009 |
| `concept.concentration` | Koncentracja sił (masa) | wojskowe, lotnictwo, morskie, e-sport | concentration, local-superiority, defeat-in-detail | Clausewitz 1873; Jomini 1862; FM 3-0 2022; MCDP 1 1997 |
| `concept.force-ratio` | Stosunki sił i zasada 3:1 | wojskowe | local-superiority, concentration, balance | Mearsheimer 1989; Epstein 1989; Dupuy 1987; FM 3-90 2023 |
| `concept.exchange-ratio` | Współczynnik wymiany strat | wojskowe, lotnictwo, e-sport, projekt | exchange-ratio, attrition, air-superiority | Morse & Kimball 1951; Weapons Systems Evaluation Group 1967; Dupuy 1979 |
| `concept.combat-power` | Siła bojowa i jej mnożniki | wojskowe | local-superiority, combined-arms, fields-of-fire, cover | Dupuy 1979; Dupuy 1987; FM 3-0 2022; Biddle 2004 |
| `concept.modern-system` | Współczesny system użycia sił | wojskowe | cover, open-ground, combined-arms, static-exposure | Biddle 2004 |
| `concept.ooda` | Pętla OODA (obserwuj-orientuj się-decyduj-działaj) | wojskowe, lotnictwo, e-sport | tempo, initiative, surprise | Boyd 1986; Osinga 2007; MCDP 1 1997 |
| `concept.energy-maneuverability` | Teoria energii i manewrowości | lotnictwo | energy-advantage, angles-fight, high-ground, mobility | Boyd et al. 1966; Shaw 1985; Osinga 2007 |
| `concept.bfm-acm` | Podstawowe manewry myśliwców i manewrowanie w walce powietrznej | lotnictwo | angles-fight, energy-advantage, initiative, surprise | Shaw 1985; Weapons Systems Evaluation Group 1967 |
| `concept.terrain-ocoka` | Analiza terenu: OAKOC / KOCOA | wojskowe, projekt, miejskie | key-terrain, fields-of-fire, avenue-of-approach, cover, obstacle | FM 3-90 2023; ATP 2-01.3 2019; FM 34-130 1994; FM 5-33 1990 |
| `concept.mett-tc` | METT-TC: zmienne zadania | wojskowe | balance, key-terrain | FM 3-90 2023; FM 3-0 2022 |
| `concept.key-terrain` | Teren kluczowy i decydujący | wojskowe, projekt, e-sport | key-terrain, high-ground, fields-of-fire | FM 3-90 2023; ATP 2-01.3 2019; FM 34-130 1994 |
| `concept.fields-of-fire` | Obserwacja i pola ostrzału | wojskowe, projekt, e-sport, miejskie | fields-of-fire, sightlines, high-ground | FM 3-21.8 2007; FM 3-90 2023; ATP 2-01.3 2019; Fisher 1993 |
| `concept.cover-concealment` | Osłona i maskowanie | wojskowe, miejskie, projekt | cover, open-ground, reverse-slope | FM 3-21.8 2007; FM 3-90 2023; Biddle 2004 |
| `concept.avenue-of-approach` | Kierunki natarcia i korytarze manewru | wojskowe, projekt | avenue-of-approach, flow, chokepoint, obstacle | ATP 2-01.3 2019; FM 34-130 1994; FM 5-33 1990 |
| `concept.chokepoint` | Wąskie gardła i przesmyki | wojskowe, projekt, e-sport | chokepoint, kill-zone, obstacle, avenue-of-approach | FM 3-90 2023; Jomini 1862; Herodotus 1858 |
| `concept.engagement-area` | Obszary walki i strefy zabójstw | wojskowe, miejskie, projekt | kill-zone, fields-of-fire, chokepoint, obstacle | FM 3-90 2023; FM 3-90-1 2013; FM 3-21.8 2007 |
| `concept.reverse-slope` | Obrona za grzbietem i osłona terenowa | wojskowe, projekt | reverse-slope, safe-ground, cover, high-ground | FM 3-90-1 2013; FM 3-21.8 2007; Siborne 1844 |
| `concept.high-ground` | Przewaga wysokości | wojskowe, projekt | high-ground, fields-of-fire, key-terrain | Sun Tzu 1910; Vegetius 1767; FM 3-90 2023 |
| `concept.interior-lines` | Linie wewnętrzne i zewnętrzne | wojskowe | interior-lines, tempo, concentration | Jomini 1862; Clausewitz 1873 |
| `concept.defeat-in-detail` | Pokonanie po kawałku | wojskowe, e-sport | defeat-in-detail, concentration, local-superiority | Jomini 1862; Lanchester 1916 |
| `concept.mutual-support` | Wzajemne wsparcie | wojskowe, lotnictwo, e-sport | mutual-support, combined-arms, defeat-in-detail | FM 3-90 2023; FM 3-21.8 2007; Shaw 1985; Xenopoulos et al. 2020 |
| `concept.combined-arms` | Broń połączona | wojskowe, projekt | combined-arms, class-counter | FM 3-0 2022; Biddle 2004; Doubler 1994 |
| `concept.suppression` | Tłumienie ogniem | wojskowe, miejskie | combined-arms, mutual-support, cover | FM 3-90 2023; Biddle 2004 |
| `concept.sead` | Tłumienie i niszczenie obrony przeciwlotniczej wroga (SEAD/DEAD) | lotnictwo, wojskowe | sead, air-superiority, combined-arms | JP 3-01 2017; Department of the Air Force 2002; Lambeth 1984; Keaney & Cohen 1993 |
| `concept.cap` | Patrol bojowy w powietrzu i przewaga w powietrzu | lotnictwo | cap, air-superiority, exchange-ratio, key-terrain | Department of the Air Force 2002; JP 3-01 2017; Douhet 1942 |
| `concept.bvr` | Walka poza zasięgiem wzroku | lotnictwo | bvr, initiative, missile-defence, fields-of-fire | Michel 1997; Keaney & Cohen 1993; Shaw 1985 |
| `concept.indirect-approach` | Podejście pośrednie | wojskowe, e-sport, projekt | flank, surprise, avenue-of-approach | Liddell Hart 1954; Sun Tzu 1910 |
| `concept.envelopment` | Oskrzydlenie i okrążenie | wojskowe | envelopment, double-envelopment, encirclement, flank, concentration | FM 3-90 2023; Polybius 1889; Goldsworthy 2001 |
| `concept.ambush` | Zasadzka | wojskowe, e-sport, projekt | ambush, surprise, kill-zone, avenue-of-approach | FM 3-21.8 2007; FM 3-90 2023; Tacitus 1876 |
| `concept.defence-in-depth` | Obrona w głębi | wojskowe | defence-in-depth, attrition, kill-zone, key-terrain | FM 3-90-1 2013; Glantz & House 1999 |
| `concept.friction` | Tarcie i mgła wojny | wojskowe, e-sport | readability, surprise, tempo | Clausewitz 1873; Benjamini & Hochberg 1995 |
| `concept.culminating-point` | Punkt kulminacyjny natarcia | wojskowe | attrition, tempo, interior-lines | Clausewitz 1873; FM 3-0 2022 |
| `concept.surprise` | Zaskoczenie | wojskowe, lotnictwo, morskie, e-sport | surprise, initiative, ambush | Sun Tzu 1910; Dupuy 1987; MCDP 1 1997 |
| `concept.economy-of-force` | Ekonomia sił | wojskowe, e-sport | concentration, safe-ground, balance | FM 3-0 2022; MCDP 1 1997 |
| `concept.urban-terrain` | Teren miejski | miejskie, wojskowe, e-sport | urban-close, vertical, cover, kill-zone | FM 3-06 2006; FM 90-10 1979 |
| `concept.sea-control` | Kontrola morza i decydująca bitwa floty | morskie | fleet-salvo, concentration, scouting | Mahan 1890; Corbett 1911; Hughes 2000 |
| `concept.salvo` | Model salw Hughesa: atakować efektywnie pierwszym | morskie, lotnictwo | fleet-salvo, initiative, scouting | Hughes 1995; Hughes 2000 |
| `concept.search-theory` | Teoria poszukiwań i wykrywania | morskie, lotnictwo, wojskowe | scouting, fields-of-fire | Koopman 1946; Morse & Kimball 1951 |
| `concept.operations-research` | Badania operacyjne: miary skuteczności | wojskowe, lotnictwo, morskie, projekt | exchange-ratio, attrition | Morse & Kimball 1951; Blackett 1962; Koopman 1946 |
| `concept.wargaming` | Gry wojenne jako analiza | wojskowe, projekt | balance, flow | Perla 1990; Perla & McGrady 2011 |
| `concept.manoeuvre-warfare` | Walka manewrowa | wojskowe, e-sport | tempo, flank, surprise, mobility | MCDP 1 1997; Boyd 1986; Liddell Hart 1954 |
| `concept.morale-cohesion` | Spójność i czynnik moralny | wojskowe | mutual-support, defeat-in-detail | Ardant du Picq 1921 |
| `concept.centre-of-gravity` | Centrum ciężkości | wojskowe | key-terrain, concentration | Clausewitz 1873; Echevarria 2002; JP 5-0 2020; Vego 2007 |
| `concept.decisive-point` | Punkty decydujące | wojskowe, e-sport | key-terrain, concentration | Jomini 1862; JP 5-0 2020; Vego 2007 |
| `concept.lines-of-operation` | Linie operacyjne | wojskowe | avenue-of-approach, interior-lines, flow | Jomini 1862; Vego 2007 |
| `concept.attrition-annihilation` | Strategie unicestwienia i wyczerpania | wojskowe | attrition, envelopment, tempo | Delbrück 1990; Clausewitz 1873 |
| `concept.deep-battle` | Walka głęboka i operacje głębokie | wojskowe | tempo, flank, concentration, interior-lines | Triandafillov 1994; Isserson 2013; Glantz 1991 |
| `concept.airland-battle` | AirLand Battle | wojskowe, lotnictwo | combined-arms, tempo, initiative | FM 100-5 1982; Romjue 1984 |
| `concept.mission-command` | Dowodzenie przez zadanie (Auftragstaktik) | wojskowe, e-sport | tempo, initiative, mutual-support | Citino 2005; van Creveld 1982; MCDP 1 1997 |
| `concept.exploitation` | Przełamanie i wykorzystanie | wojskowe | tempo, pursuit, penetration, flank, defeat-in-detail | Triandafillov 1994; Blumenson 1961; FM 3-90 2023 |
| `concept.fire-and-movement` | Ogień i ruch | wojskowe, e-sport | fire-and-maneuver, mutual-support, cover, combined-arms | ATP 3-21.8 2016; FM 3-21.8 2007; House 1984 |
| `concept.bounding-overwatch` | Bounding overwatch (przeskok z osłoną) | wojskowe, e-sport | fire-and-maneuver, mutual-support, fields-of-fire, mobility | FM 3-20.15 2007; ATP 3-21.8 2016 |
| `concept.reconnaissance-pull` | Wyciągnięcie rozpoznawcze i infiltracja | wojskowe, e-sport | flank, screening, scouting, tempo | Gudmundsson 1989; Lupfer 1981; FM 3-90-2 2013 |
| `concept.reserve` | Odwód | wojskowe, e-sport | tempo, concentration, interior-lines | Clausewitz 1873; FM 3-90 2023 |
| `concept.elastic-defence` | Elastyczna obrona i kontratak | wojskowe | defence-in-depth, kill-zone, withdrawal, reverse-slope, tempo | Lupfer 1981; FM 3-90-1 2013 |
| `concept.kill-chain` | Łańcuch rażenia (znajdź, namierz, śledź, wybierz cel, zaangażuj, oceń) | wojskowe, lotnictwo, morskie | tempo, scouting, initiative | JP 3-60 2018; Boyd 1986 |
| `concept.detection-engagement` | Zasięg wykrycia a zasięg zaangażowania | lotnictwo, morskie, wojskowe | scouting, bvr, fields-of-fire, initiative | Koopman 1946; Washburn 2002; Hughes & Girrier 2018 |
| `concept.cev` | Wartość skuteczności bojowej | wojskowe, e-sport | exchange-ratio, local-superiority, skill-dispersion | Dupuy 1987; Dupuy 1979; Lawrence 2017; van Creveld 1982 |
| `concept.dispersion` | Rozproszenie na polu walki | wojskowe, e-sport | dispersion, area-fire, mutual-support, concentration | Dupuy 1987; Biddle 2004; Clark & Evans 1954 |
| `concept.cas` | Bezpośrednie wsparcie lotnicze | lotnictwo, wojskowe | combined-arms, class-counter, sead | JP 3-09.3 2019 |
| `concept.interdiction` | Interdykcja lotnicza | lotnictwo, wojskowe | avenue-of-approach, interior-lines, tempo | Warden 1988; Pape 1996; JP 3-60 2018 |
| `concept.escort-sweep` | Eskorta kontra przeczesywanie myśliwcami | lotnictwo | air-superiority, initiative, mutual-support | Davis 1993; McFarland & Newton 1991 |
| `concept.boom-zoom` | Walka energetyczna kontra walka na zakręty | lotnictwo | energy-advantage, initiative | Shaw 1985; Boyd et al. 1966 |
| `concept.pursuit-geometry` | Pościg prowadzący, czysty i opóźniony | lotnictwo | energy-advantage, initiative | Shaw 1985 |
| `concept.thach-weave` | Splot Thacha | lotnictwo | mutual-support, formation, local-superiority | Lundstrom 1984; Shaw 1985 |
| `concept.finger-four` | Czwórka palców i para bojowa | lotnictwo | mutual-support, formation, scouting | Shaw 1985 |
| `concept.fleet-in-being` | Flota w gotowości (fleet in being) | morskie | safe-ground, interior-lines, balance | Corbett 1911; Till 2018 |
| `concept.crossing-the-t` | Przecięcie T | morskie, wojskowe | crossing-the-t, local-superiority, fields-of-fire, concentration, line-of-battle | Hughes & Girrier 2018; Evans & Peattie 1997 |
| `concept.convoy` | Konwój | morskie | mutual-support, scouting, concentration | Waddington 1973; Blackett 1962; Corbett 1911 |
| `concept.a2ad` | Zakaz dostępu i blokada obszaru (A2/AD) | morskie, lotnictwo, wojskowe | fields-of-fire, sead, avenue-of-approach | Krepinevich et al. 2003; Till 2018 |
| `concept.strongpoint` | Obrona punktu oporu w zabudowie | miejskie, wojskowe | urban-close, kill-zone, mutual-support, vertical | FM 3-06 2006; FM 90-10 1979 |
| `concept.mouseholing` | Przechodzenie przez budynki (mouseholing) | miejskie, wojskowe, projekt | urban-close, flank, obstacle | FM 90-10 1979; ATP 3-21.8 2016 |
| `concept.siege` | Oblężenie | wojskowe, miejskie | envelopment, attrition, safe-ground | Vegetius 1767; FM 3-06 2006 |
| `concept.guerrilla` | Wojna partyzancka | wojskowe, miejskie | ambush, mobility, surprise, safe-ground | Lawrence 1920; Mao Tse-tung 1961; Deitchman 1962 |
| `concept.counterinsurgency` | Kontrpartyzantka | wojskowe, miejskie | scouting, key-terrain, safe-ground | Galula 1964; FM 3-24 2006 |
| `concept.sanctuary` | Azyl | wojskowe, projekt | safe-ground, balance | Galula 1964; Mao Tse-tung 1961 |
| `concept.deception` | Zmyłka (maskirowka) | wojskowe, e-sport | feint, surprise, flank, scouting | Glantz 1989; Sun Tzu 1910 |
| `concept.information-advantage` | Przewaga informacyjna | wojskowe, e-sport | scouting, initiative, tempo | FM 3-0 2022; Boyd 1986 |
| `concept.economy-rounds` | Rundy ekonomiczne i tempo zasobów | e-sport, projekt | economy, balance, tempo | Xenopoulos et al. 2020; Adams & Dormans 2012 |
| `concept.tactical-formations` | Szyki marszowe: linia, kolumna, klin, szyk schodkowy | wojskowe, e-sport | formation, mutual-support | FM 3-21.8 2007; FM 3-20.15 2007; FM 3-90 2023 |
| `concept.frontal-attack` | Atak frontalny | wojskowe | frontal-assault, attrition, concentration | FM 3-90 2023; FM 3-90-1 2013; Liddell Hart 1954 |
| `concept.double-envelopment` | Podwójne oskrzydlenie (kleszcze) | wojskowe | double-envelopment, envelopment, encirclement, flank | FM 3-90 2023; Goldsworthy 2001; Polybius 1889 |
| `concept.encirclement-pocket` | Okrążenie i kocioł | wojskowe | encirclement, envelopment, defeat-in-detail | FM 3-90 2023; Glantz & House 1995; Goldsworthy 2001 |
| `concept.penetration` | Przełamanie i przebicie | wojskowe | penetration, concentration, local-superiority | FM 3-90 2023; Frieser 2005; Gudmundsson 1989 |
| `concept.pursuit` | Pościg | wojskowe | pursuit, tempo, withdrawal | FM 3-90-1 2013; FM 3-90 2023; Clausewitz 1873 |
| `concept.retrograde` | Odwrót: wycofanie, opóźnienie i ucieczka | wojskowe | withdrawal, defence-in-depth, mobility | FM 3-90-1 2013; FM 3-90 2023 |
| `concept.feint-demonstration` | Zwód i demonstracja | wojskowe, e-sport | feint, surprise, concentration | FM 3-90 2023; Glantz 1989; Liddell Hart 1954 |
| `concept.security-operations` | Osłona, straż i zasłona: zabezpieczenie przed głównymi siłami | wojskowe | screening, scouting, surprise | FM 3-90-2 2013; FM 3-90 2023 |
| `concept.bvr-defensive` | Obrona przed pociskiem: crank, notch, drag i pump | lotnictwo | missile-defence, bvr, energy-advantage | Shaw 1985; Michel 1997; Boyd et al. 1966 |
| `concept.bvr-formations` | Szyki poza zasięgiem wzroku: wall, lead-trail, grinder, pincer | lotnictwo | bvr, formation, double-envelopment, cap | Shaw 1985; Michel 1997 |
| `concept.angles-energy-fight` | Walka o kąty i walka o energię | lotnictwo | angles-fight, energy-advantage | Shaw 1985; Boyd et al. 1966 |
| `concept.strike-package` | Pakiet uderzeniowy i kolejność tłumienia | lotnictwo | strike-package, sead, combined-arms | Keaney & Cohen 1993; Werrell 2005; Nordeen 1990 |
| `concept.line-of-battle` | Linia bojowa | morskie | line-of-battle, formation, crossing-the-t | Mahan 1890; Hughes & Girrier 2018; Corbett 1910 |
| `concept.fatal-funnel` | Śmiertelny lejek | miejskie, wojskowe, e-sport, projekt | fatal-funnel, chokepoint, kill-zone, urban-close, entry | FM 3-06.11 2002; ATP 3-21.8 2016; Department of the Army 2011 |
| `concept.room-clearing` | Oczyszczanie pomieszczeń: zaskoczenie, szybkość, kontrolowana przemoc | miejskie, wojskowe, e-sport | entry, surprise, tempo, initiative, urban-close, utility-support | FM 3-06.11 2002; Department of the Army 2011; MCWP 3-35.3 1998 |
| `concept.points-of-domination` | Punkty dominacji | miejskie, wojskowe, e-sport | crossfire, mutual-support, fields-of-fire, entry | FM 3-06.11 2002; Department of the Army 2011 |
| `concept.slicing-the-pie` | Sprawdzanie rogów: krojenie tortu | miejskie, wojskowe, e-sport | peeker-advantage, sightlines, cover, readability | FM 3-06.11 2002 |
| `concept.crossfire` | Krzyżowy ogień i przeplatające się pola ostrzału | wojskowe, miejskie, e-sport, projekt | crossfire, fields-of-fire, kill-zone, mutual-support | FM 3-21.8 2007; ATP 3-06 2022; FM 3-06.11 2002 |
| `concept.peekers-advantage` | Przewaga wychylającego się | e-sport, projekt | peeker-advantage, initiative, surprise, readability | Bernier 2001; Tokey et al. 2024; Lee & Chang 2017; Liu et al. 2022 |
| `concept.man-advantage` | Przewaga liczebna w rundach eliminacyjnych | e-sport, wojskowe | man-advantage, local-superiority, entry, concentration | Xenopoulos et al. 2022; Xenopoulos et al. 2020; Makarov et al. 2018 |
| `concept.entry-duel` | Wejście i pojedynek otwierający | e-sport, miejskie | entry, initiative, action-value, tempo | Xenopoulos et al. 2020; Xenopoulos et al. 2022; FM 3-06.11 2002 |
| `concept.utility-entry` | Wyposażenie przed wejściem: błysk i dym | e-sport, miejskie, wojskowe | utility-support, surprise, entry, cover | FM 3-06.11 2002; ATP 3-06 2022; Xenopoulos et al. 2020 |
| `concept.social-force-model` | Model sił społecznych ruchu pieszych | projekt, miejskie, wojskowe | crowding, lane-formation, panic, territoriality | Helbing & Molnár 1995; Helbing et al. 2005; Moussaïd et al. 2011 |
| `concept.lane-formation` | Tworzenie pasów w ruchu przeciwnym | projekt, miejskie | lane-formation, flow, avenue-of-approach | Helbing et al. 2005; Helbing & Molnár 1995; Moussaïd et al. 2011 |
| `concept.faster-is-slower` | Szybciej znaczy wolniej | projekt, miejskie, wojskowe | crowding, chokepoint, panic | Helbing et al. 2000; Garcimartín et al. 2014; Haghani & Sarvi 2018 |
| `concept.fundamental-diagram` | Diagram podstawowy tłumów | projekt, miejskie | crowding, flow | Seyfried et al. 2005; Fruin 1971; Haghani & Sarvi 2018 |
| `concept.trail-formation` | Tworzenie szlaków i linie pożądania | projekt, wojskowe | lane-formation, flow, avenue-of-approach, key-terrain | Helbing et al. 1997; Helbing et al. 2005 |
| `concept.panic-myth` | Panika jest rzadka: zbiorowa odporność | wojskowe, miejskie, projekt | panic, cohesion, mutual-support | Quarantelli 1954; Drury et al. 2009; Helbing et al. 2000 |
| `concept.boids` | Boidy: separacja, wyrównanie, spójność | projekt, wojskowe | collective-order, cohesion, territoriality | Reynolds 1987; Vicsek & Zafeiris 2012 |
| `concept.vicsek-order` | Parametr porządku i początek ruchu zbiorowego | projekt, wojskowe, lotnictwo, morskie | collective-order, coordination | Vicsek et al. 1995; Vicsek & Zafeiris 2012 |
| `concept.collective-states` | Roje, krążenie i stany spolaryzowane | projekt, wojskowe, morskie | milling, collective-order | Couzin et al. 2002; Tunstrøm et al. 2013 |
| `concept.effective-leadership` | Skuteczne przywództwo bez sygnałów | wojskowe, e-sport, projekt | leadership, coordination, herding | Couzin et al. 2005; Dyer et al. 2009; Krause et al. 2010 |
| `concept.topological-interaction` | Sąsiedzi liczeni liczbą, a nie odległością | lotnictwo, wojskowe | cohesion, collective-order | Ballerini et al. 2008 |
| `concept.swarm-intelligence` | Inteligencja roju | projekt, e-sport, wojskowe | coordination, herding, collective-order | Krause et al. 2010; Lorenz et al. 2011 |
| `concept.information-cascade` | Stadne podążanie i kaskady informacji | e-sport, projekt, wojskowe | herding, conformity | Banerjee 1992; Bikhchandani et al. 1992; Anderson & Holt 1996 |
| `concept.social-loafing` | Próżniactwo społeczne | e-sport, projekt, wojskowe | social-loafing, mutual-support | Latané et al. 1979; Karau & Williams 1993 |
| `concept.diffusion-of-responsibility` | Rozproszenie odpowiedzialności | e-sport, wojskowe | social-loafing, mutual-support | Darley & Latané 1968; Fischer et al. 2011 |
| `concept.primary-group` | Spójność grupy pierwotnej | wojskowe, e-sport | cohesion, mutual-support, breaking-point | Shils & Janowitz 1948; Siebold 2007; King 2013 |
| `concept.breaking-point` | Punkty załamania i progi strat | wojskowe | breaking-point, attrition, panic | Dupuy 1987; Rowland 2006; Dupuy 1990 |
| `concept.suppression-effects` | Tłumienie: co ogień robi poza zabijaniem | wojskowe, miejskie | suppression, static-exposure, panic | Rowland 2006; Marshall 1947 |
| `concept.fear-in-combat` | Strach i stres w decyzjach bojowych | wojskowe, e-sport | panic, suppression, loss-chasing | Stouffer & et al. 1949; Starcke & Brand 2012 |
| `concept.choking` | Zadławienie pod presją | e-sport | panic, loss-chasing, hot-hand | Baumeister 1984 |
| `concept.prospect-theory` | Teoria perspektywy i awersja do straty | e-sport, projekt | loss-chasing | Kahneman & Tversky 1979; Tversky & Kahneman 1992 |
| `concept.break-even` | Efekty progu zwrotu i pieniędzy z gry | e-sport | loss-chasing | Thaler & Johnson 1990; Post et al. 2008 |
| `concept.tilt` | Tilt | e-sport | loss-chasing, panic | Smith et al. 2009 |
| `concept.sunk-cost` | Koszt utopiony | e-sport, wojskowe | loss-chasing, key-terrain, attrition | Arkes & Blumer 1985 |
| `concept.hot-hand` | Gorąca ręka i jej błąd | e-sport | hot-hand, skill-dispersion | Gilovich et al. 1985; Bar-Eli et al. 2006; Miller & Sanjurjo 2018 |
| `concept.mixed-strategy` | Strategie mieszane: bycie nieprzewidywalnym | e-sport, projekt, wojskowe | mixed-strategy, balance | von Neumann & Morgenstern 1944; Walker & Wooders 2001; Wald & Wolfowitz 1940 |
| `concept.shared-mental-models` | Wspólne modele umysłowe | e-sport, wojskowe | coordination, leadership | Mohammed et al. 2010; DeChurch & Mesmer-Magnus 2010 |
| `concept.teamwork-components` | Składniki pracy zespołowej | e-sport, wojskowe | coordination, leadership, mutual-support | Salas et al. 2005 |
| `concept.virtual-worlds-labs` | Światy wirtualne jako laboratoria zachowań | projekt, e-sport | interaction-network, contagion, territoriality, coordination | Bainbridge 2007; Castronova 2005; Yee et al. 2007 |
| `concept.proxemics-territory` | Przestrzeń osobista i terytorium | projekt, miejskie | territoriality, cohesion, crowding | Hall 1966; Altman 1975; Yee et al. 2007 |
| `concept.interaction-networks` | Sieci interakcji: węzły i słabe więzi | e-sport, projekt | interaction-network, coordination | Barabási & Albert 1999; Granovetter 1973; Newman 2003 |

### Metody (37) {#methods-37}

| id | tytuł | wzorce | źródła |
|---|---|---|---|
| `method.lanchester-fit` | Dopasowanie wykładników Lanchestera do danych starć | attrition, aimed-fire, area-fire, concentration | Engel 1954; Bracken 1995; Fricker 1998; Hartley & Helmbold 1995; Lucas & Turkes 2004; McCullagh & Nelder 1989 |
| `method.exchange-ratio` | Współczynnik wymiany według strony i miejsca | exchange-ratio, kill-zone | Morse & Kimball 1951; Gini 1912; Dupuy 1979 |
| `method.force-ratio` | Lokalny stosunek sił w chwili każdego zabójstwa | local-superiority, concentration, defeat-in-detail, bvr | Lanchester 1916; Dupuy 1987; Mearsheimer 1989; Washburn & Kress 2009 |
| `method.viewshed` | Pole widzenia: pola ostrzału wzdłuż linii widzenia | fields-of-fire, sightlines, cover, reverse-slope | Fisher 1993; ATP 2-01.3 2019; FM 5-33 1990; Kendall 1938 |
| `method.energy-state` | Energia właściwa przy zabójstwach i zgonach (lotnictwo) | energy-advantage, air-superiority | Boyd et al. 1966; Shaw 1985; Mann & Whitney 1947 |
| `method.key-terrain` | Trwałość gorących punktów między meczami | key-terrain, flow | FM 3-90 2023; Drachen & Canossa 2009; Kendall 1938 |
| `method.trades` | Współczynnik wymian (wzajemne wsparcie) | mutual-support, defeat-in-detail | Xenopoulos et al. 2020; Schubert et al. 2016; FM 3-21.8 2007 |
| `method.initiative` | Starcia i przewaga pierwszego zabójstwa | initiative, tempo, fleet-salvo, surprise | Hughes 1995; Boyd 1986; Schubert et al. 2016; Xenopoulos et al. 2020 |
| `method.spatial-autocorrelation` | Autokorelacja przestrzenna zgonów (I Morana) | kill-zone, flow, key-terrain | Moran 1950; Anselin 1995; Getis & Ord 1992 |
| `method.rate-baseline` | Wskaźniki względem własnej linii bazowej mapy z kontrolą FDR | exchange-ratio, safe-ground, kill-zone | Benjamini & Hochberg 1995; Kulldorff 1997; Getis & Ord 1992; Drachen & Canossa 2009 |
| `method.ipb` | Przygotowanie wywiadowcze pola walki (IPB) | key-terrain, avenue-of-approach, obstacle, fields-of-fire | ATP 2-01.3 2019; FM 34-130 1994 |
| `method.rating-models` | Modele ocen porównań parami (Elo, Glicko, TrueSkill) | skill-dispersion, balance | Elo 1978; Bradley & Terry 1952; Glickman 1999; Herbrich et al. 2007; Minka et al. 2018 |
| `method.win-probability` | Prawdopodobieństwo wygranej i wycena działań | initiative, economy, skill-dispersion | Xenopoulos et al. 2020; Hodge et al. 2021; Makarov et al. 2018; Cervone et al. 2016 |
| `method.space-control` | Kontrola przestrzeni i kontrola boiska | key-terrain, flow, local-superiority | Fernández & Bornn 2018; Spearman 2018; Goldsberry 2012 |
| `method.salvo-fit` | Równanie salw dopasowane do okrętów w kontakcie | fleet-salvo, initiative, scouting, attrition | Hughes 1995; Hughes 2000; Armstrong 2005; Hughes & Girrier 2018 |
| `method.combat-power` | Stosunek skuteczności bojowej na jednostkę czasu w walce | exchange-ratio, balance, local-superiority, skill-dispersion | Dupuy 1979; Dupuy 1987; Dupuy 1990; Rotte & Schmidt 2003; Biddle 2004 |
| `method.engagement-ranges` | Zasięgi wykrycia i zaangażowania | bvr, fields-of-fire, scouting, sightlines | Weapons Systems Evaluation Group 1967; Ault 1969; Keaney & Cohen 1993; Shaw 1985; Koopman 1946 |
| `method.kill-chain` | Czas łańcucha rażenia | tempo, initiative, surprise | Boyd 1986; Osinga 2007; Weapons Systems Evaluation Group 1967 |
| `method.dispersion` | Rozproszenie wobec udziału w zabójstwach (koncentracja sił w czasie) | concentration, area-fire, local-superiority, mutual-support | Lanchester 1916; Biddle 2004; Clausewitz 1873; Jomini 1862 |
| `method.sortie-attrition` | Wskaźnik strat i zabójstw na wylot | air-superiority, exchange-ratio, attrition | Keaney & Cohen 1993; Morse & Kimball 1951; Overy 2000; Weapons Systems Evaluation Group 1967 |
| `method.round-win-probability` | Model prawdopodobieństwa wygrania rundy | action-value, man-advantage, entry, clutch | Xenopoulos et al. 2022; Lock & Nettleton 2014; Robberechts et al. 2021; Brier 1950; Guo et al. 2017; Pakdaman Naeini et al. 2015 |
| `method.win-probability-added` | Wartość działania: dodane prawdopodobieństwo wygranej | action-value, entry, utility-support, mutual-support | Xenopoulos et al. 2020; Maymin 2021; Fernández et al. 2021; Pollard & Reep 1997; Decroos et al. 2019 |
| `method.adjusted-plus-minus` | Skorygowany plus-minus metodą regresji grzbietowej (RAPM) | skill-dispersion, action-value, mutual-support | Sill 2010; Macdonald 2012; Hoerl & Kennard 1970 |
| `method.empirical-bayes` | Kurczenie: empiryczny Bayes | skill-dispersion, action-value, clutch | Efron & Morris 1975 |
| `method.expected-kills` | Oczekiwane wyniki: od oczekiwanych goli do oczekiwanych pojedynków | clutch, action-value, peeker-advantage, sightlines | Rathke 2017; Pollard & Reep 1997; Spearman 2018 |
| `method.setups-rotations` | Pomiar ustawień, rotacji i czyhania (lurks) | rotation, lurk, interior-lines, concentration, flank | Benjamini & Hochberg 1995 |
| `method.reflection-problem` | Problem odbicia: kopiowanie czy wspólna przyczyna | herding, conformity | Manski 1993 |
| `method.streak-correction` | Serie z poprawką na skończoną sekwencję | hot-hand | Miller & Sanjurjo 2018; Phipson & Smyth 2010 |
| `method.order-parameters` | Parametry porządku polaryzacji i krążenia | collective-order, milling | Vicsek et al. 1995; Couzin et al. 2002; Tunstrøm et al. 2013 |
| `method.lagged-heading` | Liderzy z korelacji kierunku z opóźnieniem czasowym | leadership, coordination | Nagy et al. 2010; Couzin et al. 2005 |
| `method.route-cascade` | Test kaskady tras na stadne podążanie | herding, conformity | Bikhchandani et al. 1992; Manski 1993; Phipson & Smyth 2010 |
| `method.lane-segregation` | Rozdzielenie pasów i trwałość szlaków | lane-formation, flow | Helbing et al. 2005; Helbing et al. 1997 |
| `method.straggler-hazard` | Ryzyko dla odstających | cohesion, mutual-support, defeat-in-detail | Moussaïd et al. 2010; Siebold 2007 |
| `method.breaking-curve` | Krzywa załamania | breaking-point, attrition | Dupuy 1987; Rowland 2006 |
| `method.suppression-response` | Reakcja na nadlatujący ogień | suppression | Rowland 2006 |
| `method.risk-after-outcome` | Ryzyko po stracie lub zysku | loss-chasing | Thaler & Johnson 1990; Miller & Sanjurjo 2018 |
| `method.buy-agreement` | Zgodność zakupów (kappa Fleissa) | conformity, economy, coordination | Fleiss 1971; Phipson & Smyth 2010 |

### Przypadki historyczne (277) {#historical-cases-277}

| id | przypadek | kiedy | skala | wzorce | źródła |
|---|---|---|---|---|---|
| `case.thermopylae` | Termopile | 480 p.n.e. | bitwa | chokepoint, kill-zone, local-superiority, flank | Herodotus 1858 |
| `case.salamis` | Salamina | 480 p.n.e. | bitwa | chokepoint, local-superiority, concentration | Herodotus 1858; Strauss 2004 |
| `case.marathon` | Maraton | 490 p.n.e. | bitwa | envelopment, tempo, concentration | Herodotus 1858 |
| `case.leuctra` | Leuktry | 371 p.n.e. | bitwa | concentration, local-superiority | Xenophon 1897 |
| `case.gaugamela` | Gaugamela | 331 p.n.e. | bitwa | concentration, tempo, flank | Arrian 1893 |
| `case.trasimene` | Jezioro Trazymeńskie | 217 p.n.e. | bitwa | ambush, surprise, kill-zone, chokepoint | Polybius 1889 |
| `case.cannae` | Kanny | 216 p.n.e. | bitwa | double-envelopment, envelopment, encirclement, local-superiority, concentration, attrition | Polybius 1889; Goldsworthy 2001 |
| `case.teutoburg` | Las Teutoburski | 9 n.e. | bitwa | ambush, surprise, chokepoint, obstacle | Tacitus 1876 |
| `case.hastings` | Hastings | 1066 | bitwa | high-ground, key-terrain, surprise | Morillo 1996 |
| `case.stirling-bridge` | Most Stirling | 1297 | bitwa | defeat-in-detail, chokepoint, local-superiority | Barrow 1965 |
| `case.agincourt` | Azincourt | 1415 | bitwa | chokepoint, kill-zone, fields-of-fire, open-ground | Curry 2005 |
| `case.leuthen` | Leuthen (Lutynia) | 1757 | bitwa | concentration, feint, flank, surprise, interior-lines | Showalter 1996 |
| `case.austerlitz` | Austerlitz | 1805 | bitwa | key-terrain, high-ground, concentration, surprise | Chandler 1966 |
| `case.trafalgar` | Trafalgar | 1805 | bitwa | concentration, line-of-battle, local-superiority, penetration, initiative | Corbett 1910; Mahan 1890 |
| `case.waterloo` | Waterloo | 1815 | bitwa | reverse-slope, key-terrain, safe-ground, attrition | Siborne 1844 |
| `case.fredericksburg` | Fredericksburg: Marye's Heights | 1862 | starcie | kill-zone, open-ground, cover, fields-of-fire | US War Department 1888 |
| `case.little-round-top` | Gettysburg: Little Round Top | 1863 | starcie | key-terrain, high-ground, fields-of-fire | Coddington 1968 |
| `case.picketts-charge` | Gettysburg: szarża Picketta | 1863 | starcie | frontal-assault, open-ground, kill-zone, fields-of-fire, envelopment | Coddington 1968 |
| `case.isandlwana` | Isandlwana | 1879 | bitwa | envelopment, defeat-in-detail, surprise | Knight 2002 |
| `case.rorkes-drift` | Rorke's Drift | 1879 | starcie | cover, kill-zone, mutual-support, local-superiority | Knight 2002 |
| `case.tannenberg` | Tannenberg | 1914 | kampania | interior-lines, defeat-in-detail, double-envelopment, encirclement, concentration, envelopment | Showalter 1991 |
| `case.somme-1916` | Somma, pierwszy dzień | 1 lipca 1916 | bitwa | open-ground, frontal-assault, kill-zone, attrition, static-exposure | Middlebrook 1971; Biddle 2004 |
| `case.verdun` | Verdun | 1916 | kampania | attrition, key-terrain, kill-zone | Horne 1962 |
| `case.jutland` | Jutlandia | 1916 | bitwa | crossing-the-t, line-of-battle, scouting, exchange-ratio, fleet-salvo | Gordon 1996; Campbell 1986; Corbett 1923 |
| `case.suomussalmi` | Suomussalmi | 1939-40 | bitwa | defeat-in-detail, ambush, mobility, envelopment | Trotter 1991 |
| `case.ardennes-1940` | Sedan i Ardeny | maj 1940 | kampania | penetration, flank, surprise, tempo, avenue-of-approach | Frieser 2005 |
| `case.arras-1940` | Kontratak pod Arras | 21 maja 1940 | starcie | combined-arms, class-counter, surprise | Frieser 2005 |
| `case.battle-of-britain` | Bitwa o Anglię | lip.-paź. 1940 | kampania | air-superiority, interior-lines, scouting, concentration | Overy 2000; Bungay 2000 |
| `case.battle-of-atlantic` | Bitwa o Atlantyk: badania operacyjne konwojów | 1939-45 | kampania | scouting, concentration, mutual-support | Blackett 1962; Morse & Kimball 1951 |
| `case.midway` | Midway | czerwiec 1942 | bitwa | fleet-salvo, scouting, initiative, surprise | Parshall & Tully 2005 |
| `case.el-alamein` | Druga bitwa pod El Alamein | paź.-lis. 1942 | bitwa | attrition, obstacle, kill-zone, combined-arms | Barr 2004 |
| `case.kasserine` | Przełęcz Kasserine | luty 1943 | bitwa | mutual-support, defeat-in-detail, key-terrain | Blumenson 1967 |
| `case.stalingrad` | Stalingrad | sie. 1942-lut. 1943 | kampania | encirclement, urban-close, attrition, double-envelopment, vertical, envelopment | Beevor 1998; Glantz & House 1995 |
| `case.kursk` | Kursk | lipiec 1943 | kampania | defence-in-depth, attrition, obstacle, fields-of-fire, kill-zone | Glantz & House 1999; Zetterling & Frankson 2000; Lucas & Turkes 2004 |
| `case.prokhorovka` | Prochorowka | 12 lipca 1943 | starcie | exchange-ratio, fields-of-fire, open-ground, local-superiority | Zetterling & Frankson 2000; Glantz & House 1999 |
| `case.villers-bocage` | Villers-Bocage | 13 czerwca 1944 | starcie | ambush, kill-zone, chokepoint, class-counter | Forty 2004 |
| `case.normandy-bocage` | Żywopłoty Normandii | czerwiec-lipiec 1944 | kampania | cover, combined-arms, fields-of-fire, urban-close | Doubler 1994; Blumenson 1961 |
| `case.cobra` | Operacja Cobra | lipiec 1944 | kampania | concentration, tempo, local-superiority | Blumenson 1961 |
| `case.leyte-gulf` | Zatoka Leyte | paź. 1944 | bitwa | scouting, concentration, chokepoint, surprise | Morison 1958; Cutler 1994 |
| `case.bastogne` | Bastogne | grudzień 1944 | bitwa | key-terrain, interior-lines, mutual-support | Cole 1965 |
| `case.tsushima` | Cuszima | maj 1905 | bitwa | crossing-the-t, concentration, line-of-battle, local-superiority, fields-of-fire | Evans & Peattie 1997 |
| `case.inchon` | Inczon | wrzesień 1950 | kampania | flank, surprise, interior-lines | Heinl 1968 |
| `case.mig-alley` | MiG Alley | 1950-53 | kampania | air-superiority, exchange-ratio, skill-dispersion, energy-advantage | Werrell 2005 |
| `case.dien-bien-phu` | Dien Bien Phu | 1954 | bitwa | high-ground, fields-of-fire, key-terrain, attrition | Fall 1966 |
| `case.ia-drang` | Ia Drang: LZ X-Ray | listopad 1965 | starcie | mutual-support, combined-arms, mobility | Moore & Galloway 1992 |
| `case.operation-bolo` | Operacja Bolo | 2 stycznia 1967 | starcie | feint, surprise, ambush, initiative, energy-advantage | Michel 1997 |
| `case.valley-of-tears` | Golan: Dolina Łez | paź. 1973 | bitwa | fields-of-fire, exchange-ratio, high-ground, kill-zone, obstacle | Herzog 1975; Rabinovich 2004; Kahalani 1984 |
| `case.chinese-farm` | Synaj: Farma Chińska | paź. 1973 | bitwa | combined-arms, class-counter, kill-zone | Herzog 1975; Rabinovich 2004 |
| `case.bekaa-1982` | Dolina Bekaa (operacja Mole Cricket 19) | czerwiec 1982 | bitwa | sead, air-superiority, strike-package, scouting, exchange-ratio | Lambeth 1984 |
| `case.falklands` | Wojna powietrzna o Falklandy | maj-czerwiec 1982 | kampania | air-superiority, kill-zone, exchange-ratio, chokepoint | Ethell & Price 1983; Woodward & Robinson 1992 |
| `case.desert-storm-air` | Kampania powietrzna Pustynnej Burzy | sty.-lut. 1991 | kampania | air-superiority, sead, bvr, tempo | Keaney & Cohen 1993; Hallion 1992 |
| `case.73-easting` | 73 Easting | 26 lutego 1991 | starcie | exchange-ratio, initiative, fields-of-fire, surprise | Krause 1991; Bourque 2002; Biddle 2004 |
| `case.mogadishu` | Mogadiszu | paź. 1993 | starcie | urban-close, kill-zone, avenue-of-approach, vertical | Bowden 1999 |
| `case.grozny` | Grozny | gru. 1994-lut. 1995 | bitwa | vertical, urban-close, combined-arms, class-counter, ambush | Grau 1997; FM 3-06 2006 |
| `case.hue` | Hue | sty.-mar. 1968 | bitwa | urban-close, attrition, combined-arms | Nolan 1983 |
| `case.kosovo-1999` | Kampania powietrzna nad Kosowem | mar.-czerwiec 1999 | kampania | sead, scouting, static-exposure | Lambeth 2001 |
| `case.fallujah` | Falludża (operacja Al Fadżr) | listopad 2004 | bitwa | combined-arms, urban-close, mutual-support, envelopment | Matthews 2006 |
| `case.mosul` | Mosul | 2016-17 | kampania | urban-close, attrition, vertical, ambush | Arnold & Fiore 2019 |
| `case.kadesh` | Kadesz | ok. 1274 p.n.e. | bitwa | surprise, ambush, scouting, mutual-support | Healy 1993 |
| `case.issus` | Issos | 333 p.n.e. | bitwa | chokepoint, concentration, local-superiority, tempo | Arrian 1893 |
| `case.zama` | Zama | 202 p.n.e. | bitwa | class-counter, envelopment, combined-arms | Polybius 1889; Livy 1905 |
| `case.carrhae` | Carrhae | 53 p.n.e. | bitwa | class-counter, open-ground, mobility, attrition | Plutarch 1916 |
| `case.pharsalus` | Farsalos | 48 p.n.e. | bitwa | class-counter, flank, concentration | Caesar 1869 |
| `case.adrianople` | Adrianopol | 378 n.e. | bitwa | envelopment, surprise, scouting, defeat-in-detail | Ammianus Marcellinus 1862 |
| `case.yarmouk` | Jarmuk | 636 n.e. | bitwa | mobility, key-terrain, attrition, envelopment | Kennedy 2007 |
| `case.manzikert` | Manzikert | 1071 | bitwa | mobility, ambush, mutual-support, defeat-in-detail | Haldon 2001 |
| `case.hattin` | Hattin | 1187 | bitwa | attrition, key-terrain, envelopment, static-exposure | Smail 1956 |
| `case.bannockburn` | Bannockburn | 1314 | bitwa | chokepoint, obstacle, key-terrain, local-superiority | Barrow 1965 |
| `case.crecy` | Crécy | 1346 | bitwa | fields-of-fire, kill-zone, high-ground, class-counter | Sumption 1990 |
| `case.poitiers-1356` | Poitiers | 1356 | bitwa | cover, obstacle, flank, fields-of-fire | Sumption 1990 |
| `case.grunwald-1410` | Grunwald (Tannenberg) | 1410 | bitwa | envelopment, attrition, flank, local-superiority | Turnbull 2003 |
| `case.breitenfeld` | Breitenfeld | 1631 | bitwa | combined-arms, mobility, flank, interior-lines | Roberts 1958 |
| `case.blenheim` | Blenheim | 1704 | bitwa | concentration, local-superiority, kill-zone | Chandler 1973 |
| `case.poltava` | Połtawa | 1709 | bitwa | fields-of-fire, obstacle, defeat-in-detail, attrition | Englund 2003 |
| `case.rossbach` | Rossbach | 1757 | bitwa | surprise, flank, tempo, reverse-slope | Showalter 1996 |
| `case.saratoga` | Saratoga | 1777 | kampania | obstacle, key-terrain, attrition, fields-of-fire | Ketchum 1997 |
| `case.yorktown` | Yorktown | 1781 | bitwa | envelopment, key-terrain, attrition | Greene 2005 |
| `case.jena-auerstedt` | Jena-Auerstedt | 1806 | bitwa | tempo, mobility, defeat-in-detail, local-superiority | Chandler 1966 |
| `case.borodino` | Borodino | 1812 | bitwa | attrition, fields-of-fire, key-terrain | Chandler 1966 |
| `case.leipzig` | Lipsk | 1813 | bitwa | envelopment, interior-lines, concentration, chokepoint | Chandler 1966 |
| `case.antietam` | Antietam | 1862 | bitwa | defeat-in-detail, attrition, chokepoint, interior-lines | Sears 1983 |
| `case.chancellorsville` | Chancellorsville | 1863 | bitwa | flank, surprise, cover | Sears 1996 |
| `case.vicksburg` | Vicksburg | 1863 | kampania | mobility, key-terrain, interior-lines, defeat-in-detail | Ballard 2004 |
| `case.koniggratz` | Königgrätz (Sadowa) | 1866 | bitwa | envelopment, class-counter, tempo, fields-of-fire | Wawro 1996 |
| `case.sedan-1870` | Sedan | 1870 | bitwa | envelopment, high-ground, fields-of-fire | Howard 1961 |
| `case.mukden` | Mukden | 1905 | bitwa | attrition, envelopment, fields-of-fire | Connaughton 1988 |
| `case.omdurman` | Omdurman | 1898 | bitwa | fields-of-fire, open-ground, exchange-ratio, class-counter | Churchill 1899 |
| `case.spion-kop` | Spion Kop | 1900 | starcie | high-ground, fields-of-fire, static-exposure, key-terrain | Pakenham 1979 |
| `case.gallipoli` | Gallipoli | 1915 | kampania | high-ground, attrition, kill-zone, key-terrain | Travers 2001 |
| `case.cambrai-1917` | Cambrai | listopad 1917 | bitwa | surprise, combined-arms, penetration, class-counter, tempo | Cooper 1967 |
| `case.caporetto` | Kaporetto | paź.-lis. 1917 | kampania | tempo, flank, avenue-of-approach, surprise | Gudmundsson 1989; Rommel 1937 |
| `case.kaiserschlacht` | Niemiecka ofensywa wiosenna (operacja Michael) | mar.-kwi. 1918 | kampania | penetration, tempo, surprise, attrition, mobility | Gudmundsson 1989 |
| `case.amiens-1918` | Amiens | sierpień 1918 | bitwa | combined-arms, surprise, concentration | Prior & Wilson 1992 |
| `case.khalkhin-gol` | Chałchin-Gol (Nomonhan) | sierpień 1939 | bitwa | envelopment, combined-arms, concentration, surprise | Drea 1981; Coox 1985 |
| `case.poland-1939` | Kampania polska | wrzesień 1939 | kampania | envelopment, tempo, mobility, air-superiority | Zaloga & Madej 1985 |
| `case.hannut-gembloux` | Hannut i Gembloux | maj 1940 | bitwa | concentration, class-counter, combined-arms | Frieser 2005 |
| `case.stonne` | Stonne | maj 1940 | starcie | key-terrain, attrition, high-ground | Frieser 2005; Doughty 1990 |
| `case.dunkirk` | Obwód Dunkierki | maj-czerwiec 1940 | kampania | withdrawal, obstacle, safe-ground, mutual-support | Frieser 2005; May 2000 |
| `case.beda-fomm` | Operacja Compass i Beda Fomm | gru. 1940-lut. 1941 | kampania | mobility, flank, tempo, exchange-ratio | Playfair et al. 1954 |
| `case.crusader` | Operacja Crusader i Sidi Rezegh | listopad-grudzień 1941 | kampania | defeat-in-detail, combined-arms, attrition, concentration | Playfair et al. 1960 |
| `case.gazala` | Gazala | maj-czerwiec 1942 | bitwa | flank, defeat-in-detail, mutual-support, obstacle | Playfair et al. 1960 |
| `case.alam-halfa` | Alam Halfa | sierpień-wrzesień 1942 | bitwa | fields-of-fire, key-terrain, obstacle, air-superiority | Barr 2004 |
| `case.dubno-brody` | Dubno-Brody | czerwiec 1941 | bitwa | defeat-in-detail, combined-arms, air-superiority | Glantz 2001; Glantz & House 1995 |
| `case.kiev-1941` | Okrążenie Kijowa | wrzesień 1941 | kampania | encirclement, envelopment, double-envelopment, static-exposure, tempo | Glantz & House 1995; Erickson 1975 |
| `case.moscow-1941` | Moskwa | paź. 1941-sty. 1942 | kampania | attrition, tempo, interior-lines, surprise | Glantz & House 1995; Erickson 1975 |
| `case.rzhev-mars` | Rżew i operacja Mars | 1942 | kampania | attrition, kill-zone, defeat-in-detail | Glantz 1999 |
| `case.second-kharkov` | Drugi Charków | maj 1942 | bitwa | envelopment, flank, tempo | Glantz 1998 |
| `case.third-kharkov` | Trzeci Charków (uderzenie Mansteina) | luty-mar. 1943 | kampania | tempo, flank, interior-lines, local-superiority | Glantz 1991; Manstein 1958 |
| `case.bagration` | Operacja Bagration | czerwiec-sierpień 1944 | kampania | concentration, envelopment, surprise, tempo | Zaloga 1996; Glantz & House 1995 |
| `case.korsun` | Kocioł korsuński | sty.-lut. 1944 | bitwa | encirclement, envelopment, attrition, open-ground | Nash 2002; Glantz & House 1995 |
| `case.kamenets-podolsky` | Kocioł kamieniecki | mar.-kwi. 1944 | kampania | mobility, envelopment, interior-lines | Glantz & House 1995 |
| `case.epsom` | Operacja Epsom | czerwiec 1944 | bitwa | attrition, key-terrain, cover | D'Este 1983; Hastings 1984 |
| `case.goodwood` | Operacja Goodwood | lipiec 1944 | bitwa | open-ground, fields-of-fire, combined-arms, exchange-ratio | D'Este 1983; Hastings 1984 |
| `case.totalize` | Operacja Totalize | sierpień 1944 | bitwa | surprise, combined-arms, tempo | Copp 2003 |
| `case.mortain` | Mortain | sierpień 1944 | bitwa | key-terrain, high-ground, fields-of-fire, air-superiority | Blumenson 1961 |
| `case.falaise` | Kocioł pod Falaise | sierpień 1944 | kampania | encirclement, envelopment, double-envelopment, kill-zone, chokepoint | Blumenson 1961; Hastings 1984 |
| `case.market-garden` | Market Garden i Arnhem | wrzesień 1944 | kampania | chokepoint, avenue-of-approach, tempo, key-terrain | MacDonald 1963; Ryan 1974 |
| `case.aachen` | Akwizgran | paź. 1944 | bitwa | urban-close, combined-arms, envelopment | MacDonald 1963 |
| `case.hurtgen` | Las Hürtgen | wrz. 1944-lut. 1945 | kampania | attrition, cover, class-counter, ambush | MacDonald 1963 |
| `case.arracourt` | Arracourt | wrzesień 1944 | bitwa | exchange-ratio, fields-of-fire, mobility, scouting | Cole 1950 |
| `case.st-vith` | St. Vith | grudzień 1944 | bitwa | key-terrain, interior-lines, mobility | Cole 1965; MacDonald 1985 |
| `case.elsenborn` | Grań Elsenborn | grudzień 1944 | bitwa | high-ground, fields-of-fire, key-terrain, chokepoint | Cole 1965; MacDonald 1985 |
| `case.seelow` | Wzgórza Seelow | kwiecień 1945 | bitwa | high-ground, fields-of-fire, attrition, obstacle | Beevor 2002; Glantz & House 1995 |
| `case.berlin-1945` | Berlin | kwiecień-maj 1945 | bitwa | urban-close, combined-arms, attrition, vertical | Beevor 2002 |
| `case.spring-awakening` | Operacja Wiosenne Przebudzenie | marzec 1945 | bitwa | obstacle, attrition, mobility, kill-zone | Glantz & House 1995 |
| `case.ortona` | Ortona | grudzień 1943 | bitwa | urban-close, vertical, kill-zone, ambush | Zuehlke 1999 |
| `case.warsaw-1944` | Powstanie warszawskie | sierpień-październik 1944 | kampania | urban-close, attrition, vertical | Davies 2003 |
| `case.tarawa` | Tarawa | listopad 1943 | bitwa | open-ground, kill-zone, obstacle, fields-of-fire | Alexander 1993 |
| `case.peleliu` | Peleliu | wrz.-lis. 1944 | bitwa | cover, attrition, high-ground, mutual-support | Gayle 1996 |
| `case.iwo-jima` | Iwo Jima | luty-mar. 1945 | bitwa | attrition, aimed-fire, cover, kill-zone | Bartley 1954; Engel 1954 |
| `case.okinawa` | Okinawa | kwi.-czerwiec 1945 | kampania | attrition, reverse-slope, mutual-support, fields-of-fire | Appleman et al. 1948 |
| `case.manila-1945` | Manila | luty-mar. 1945 | bitwa | urban-close, attrition, vertical | Smith 1963 |
| `case.manchuria-1945` | Mandżuria (sierpniowa burza) | sierpień 1945 | kampania | tempo, avenue-of-approach, surprise, envelopment | Glantz 1983 |
| `case.pusan-perimeter` | Obwód Pusan | sierpień-wrzesień 1950 | kampania | interior-lines, mutual-support, obstacle | Appleman 1961 |
| `case.chosin` | Zbiornik Chosin | listopad-grudzień 1950 | kampania | envelopment, mutual-support, chokepoint, key-terrain | Montross & Canzona 1957; Appleman 1987 |
| `case.imjin` | Rzeka Imjin | kwi. 1951 | bitwa | mutual-support, key-terrain, defeat-in-detail, attrition | Salmon 2009 |
| `case.kapyong` | Kapyong | kwi. 1951 | bitwa | key-terrain, high-ground, mutual-support, fields-of-fire | O'Neill 1985 |
| `case.pork-chop` | Pork Chop Hill | kwi. i lip. 1953 | starcie | attrition, kill-zone, key-terrain | Marshall 1956; Hermes 1966 |
| `case.khe-sanh` | Khe Sanh | sty.-kwi. 1968 | bitwa | high-ground, attrition, air-superiority, key-terrain | Shulimson et al. 1997; Prados & Stubbe 1991 |
| `case.dak-to` | Dak To | list. 1967 | bitwa | high-ground, attrition, cover | MacGarrigle 1998 |
| `case.hamburger-hill` | Hamburger Hill (góra Ap Bia) | maj 1969 | starcie | attrition, high-ground, kill-zone | Zaffiri 1988 |
| `case.abu-ageila-1967` | Abu Ageila-Um Katef | czerwiec 1967 | bitwa | combined-arms, flank, tempo, surprise | Herzog 1982; Pollack 2002 |
| `case.ismailia-1973` | Ismailia | paź. 1973 | bitwa | urban-close, cover, ambush, class-counter | Herzog 1975; Rabinovich 2004 |
| `case.sultan-yacoub` | Sultan Yacoub | czerwiec 1982 | starcie | ambush, kill-zone, avenue-of-approach, scouting | Gabriel 1984; Herzog 1982 |
| `case.beirut-1982` | Oblężenie Bejrutu | czerwiec-sierpień 1982 | kampania | urban-close, envelopment, attrition | Gabriel 1984 |
| `case.bint-jbeil-2006` | Liban 2006: Bint Dżubejl i zagrożenie przeciwpancerne | lip.-sie. 2006 | kampania | class-counter, combined-arms, ambush, urban-close | Matthews 2008 |
| `case.fao-1986` | Al-Faw | luty 1986 | bitwa | surprise, obstacle, attrition | Murray & Woods 2014; Cordesman & Wagner 1990 |
| `case.basra-1987` | Basra (Karbala-5) | sty.-lut. 1987 | bitwa | attrition, obstacle, kill-zone, fields-of-fire | Murray & Woods 2014; Cordesman & Wagner 1990 |
| `case.khafji` | Chafdżi | sty.-lut. 1991 | bitwa | air-superiority, combined-arms, scouting, urban-close | Westermeyer 2008 |
| `case.norfolk-1991` | Cel Norfolk | 26-27 lutego 1991 | bitwa | exchange-ratio, initiative, fields-of-fire, combined-arms | Bourque 2002; Scales 1993 |
| `case.medina-ridge` | Medina Ridge | 27 lutego 1991 | bitwa | exchange-ratio, fields-of-fire, reverse-slope, air-superiority | Bourque 2002; Scales 1993 |
| `case.wadi-al-batin` | Pozorowane ataki na Wadi al-Batin | luty 1991 | kampania | flank, surprise, scouting | Bourque 2002; Scales 1993 |
| `case.nasiriyah` | Nasirijja | mar. 2003 | bitwa | ambush, urban-close, avenue-of-approach, readability | Fontenot et al. 2004; Reynolds 2005 |
| `case.objective-peach` | Objective Peach | kwi. 2003 | starcie | key-terrain, chokepoint, exchange-ratio | Fontenot et al. 2004 |
| `case.thunder-runs` | Thunder Runs | kwi. 2003 | bitwa | tempo, urban-close, class-counter, surprise | Zucchino 2004; Fontenot et al. 2004 |
| `case.debecka-pass` | Przełęcz Debecka | kwi. 2003 | starcie | class-counter, fields-of-fire, key-terrain | Robinson 2004 |
| `case.ramadi-2006` | Ar-Ramadi | 2006-07 | kampania | key-terrain, urban-close, flow, attrition | Michaels 2010 |
| `case.sadr-city-2008` | Sadr City | mar.-maj 2008 | bitwa | obstacle, scouting, urban-close, air-superiority | Johnson et al. 2013 |
| `case.anaconda` | Operacja Anaconda | mar. 2002 | bitwa | high-ground, scouting, surprise, air-superiority | Kugler 2007; Naylor 2005 |
| `case.wanat` | Wanat | lipiec 2008 | starcie | high-ground, static-exposure, fields-of-fire, surprise | Combat Studies Institute 2010 |
| `case.kamdesh` | Kamdesh (COP Keating) | paź. 2009 | starcie | high-ground, fields-of-fire, static-exposure | Tapper 2012 |
| `case.musa-qala` | Musa Qala i posterunki platoonowe | 2006-07 | kampania | static-exposure, attrition, key-terrain | Farrell 2017 |
| `case.algiers-1957` | Bitwa o Algier | 1956-57 | kampania | scouting, urban-close, flow | Horne 1977 |
| `case.rhodesia-fireforce` | Rodezyjski Fireforce | 1974-79 | kampania | mobility, tempo, exchange-ratio, envelopment | Cilliers 1985 |
| `case.sarajevo` | Oblężenie Sarajewa | 1992-96 | kampania | high-ground, sightlines, fields-of-fire, kill-zone | Burg & Shoup 1999; Andreas 2008 |
| `case.grozny-2000` | Groźny 1999-2000 | gru. 1999-lut. 2000 | bitwa | urban-close, combined-arms, attrition, envelopment | Oliker 2001 |
| `case.georgia-2008` | Wojna rosyjsko-gruzińska | sierpień 2008 | kampania | chokepoint, tempo, local-superiority | Cohen & Hamilton 2011 |
| `case.zelenopillia` | Zelenopillia | lipiec 2014 | starcie | surprise, static-exposure, area-fire, scouting | Fox & Rossow 2017 |
| `case.ilovaisk` | Iłowajsk | sierpień 2014 | bitwa | envelopment, kill-zone, surprise | Fox & Rossow 2017 |
| `case.debaltseve` | Debalcewe | sty.-lut. 2015 | bitwa | envelopment, area-fire, attrition, chokepoint | Fox & Rossow 2017 |
| `case.donetsk-airport` | Lotnisko w Doniecku | wrz. 2014-sty. 2015 | bitwa | urban-close, attrition, key-terrain, vertical | Fox 2019 |
| `case.hostomel` | Lotnisko Hostomel | lut. 2022 | starcie | key-terrain, surprise, defeat-in-detail, tempo | Zabrodskyi et al. 2022; Watling & Reynolds 2022 |
| `case.brovary` | Oś na Kijów i zasadzka pod Browarami | mar. 2022 | starcie | ambush, avenue-of-approach, area-fire, chokepoint | Zabrodskyi et al. 2022 |
| `case.mariupol` | Mariupol i Azowstal | lut.-maj 2022 | bitwa | urban-close, attrition, envelopment, vertical | Watling & Reynolds 2022 |
| `case.kharkiv-2022` | Kontrofensywa pod Charkowem | wrzesień 2022 | kampania | surprise, tempo, concentration, local-superiority | Watling & Reynolds 2023 |
| `case.bilohorivka` | Przeprawa przez Doniec Siewierski pod Biłohoriwką | maj 2022 | starcie | chokepoint, kill-zone, static-exposure, scouting | Zabrodskyi et al. 2022 |
| `case.bakhmut` | Bachmut | sierpień 2022-maj 2023 | bitwa | attrition, urban-close, area-fire | Watling & Reynolds 2023 |
| `case.zaporizhzhia-2023` | Ofensywa pod Zaporożem | czerwiec-lis. 2023 | kampania | obstacle, kill-zone, attrition, scouting | Watling & Reynolds 2023 |
| `case.karabakh-2020` | Wojna o Górski Karabach | wrz.-lis. 2020 | kampania | sead, static-exposure, scouting, class-counter | Shaikh & Rumbaugh 2020 |
| `case.blitz-1940` | Blitz | wrz. 1940-maj 1941 | kampania | attrition, scouting, air-superiority, surprise | Overy 2013; Murray 1983 |
| `case.barbarossa-air-1941` | Barbarossa: pierwszy dzień w powietrzu | 22 czerwca 1941 | bitwa | surprise, static-exposure, air-superiority, initiative | Hardesty 1982; Murray 1983 |
| `case.crete-1941` | Kreta | maj 1941 | bitwa | key-terrain, air-superiority, attrition, combined-arms | Beevor 1991 |
| `case.malta-siege` | Oblężenie Malty | 1940-1942 | kampania | key-terrain, attrition, air-superiority, interior-lines | Holland 2003; Roskill 1956 |
| `case.stalingrad-airlift` | Most powietrzny do Stalingradu | listopad 1942-luty 1943 | kampania | attrition, economy, air-superiority | Hayward 1998; Murray 1983 |
| `case.kuban-1943` | Walki powietrzne nad Kubaniem | kwi.-czerw. 1943 | kampania | energy-advantage, mutual-support, air-superiority, skill-dispersion | Hardesty 1982; Hardesty & Grinberg 2012 |
| `case.kursk-air-1943` | Kursk w powietrzu | lipiec 1943 | bitwa | surprise, air-superiority, combined-arms, class-counter | Hardesty & Grinberg 2012 |
| `case.bagration-air-1944` | Operacja Bagration w powietrzu | czerwiec-sierpień 1944 | kampania | air-superiority, concentration, combined-arms, tempo | Hardesty 1982; Hardesty & Grinberg 2012 |
| `case.ploesti-1943` | Ploeszti (operacja Tidal Wave) | 1 sierpnia 1943 | starcie | kill-zone, sead, surprise, open-ground | Dugan & Stewart 1962; Craven & Cate 1949 |
| `case.chastise-1943` | Nalot na zapory (operacja Chastise) | 16-17 maja 1943 | starcie | surprise, key-terrain, class-counter, attrition | Sweetman 1982 |
| `case.hamburg-1943` | Hamburg (operacja Gomorrah) | lip.-sierp. 1943 | bitwa | sead, surprise, area-fire, scouting | Middlebrook 1980; Overy 2013 |
| `case.schweinfurt-regensburg-1943` | Schweinfurt-Regensburg | 17 sierpnia 1943 | bitwa | attrition, mutual-support, exchange-ratio, air-superiority | Middlebrook 1983; Craven & Cate 1949 |
| `case.black-thursday-1943` | Drugi Schweinfurt („Czarny czwartek") | 14 października 1943 | starcie | attrition, exchange-ratio, mutual-support | Craven & Cate 1949; Caldwell & Muller 2007 |
| `case.big-week-1944` | Wielki Tydzień (operacja Argument) | luty 1944 | kampania | air-superiority, attrition, mutual-support, combined-arms | Craven & Cate 1951; Murray 1983; Caldwell & Muller 2007 |
| `case.nuremberg-raid-1944` | Nalot na Norymbergę | 30-31 marca 1944 | starcie | ambush, avenue-of-approach, scouting, static-exposure | Middlebrook 1973; Overy 2013 |
| `case.bodenplatte-1945` | Operacja Bodenplatte | 1 stycznia 1945 | bitwa | surprise, static-exposure, attrition, readability | Caldwell & Muller 2007; Murray 1983 |
| `case.bismarck-sea-1943` | Bitwa na Morzu Bismarcka | mar. 1943 | bitwa | class-counter, air-superiority, surprise, kill-zone | Morison 1950 |
| `case.rabaul-1943` | Neutralizacja Rabaul | 1943-1944 | kampania | flank, air-superiority, key-terrain, attrition | Morison 1950 |
| `case.philippine-sea-1944` | Morze Filipińskie („Marianas Turkey Shoot") | czerwiec 1944 | bitwa | exchange-ratio, skill-dispersion, scouting, air-superiority | Y'Blood 1981; Morison 1953 |
| `case.black-tuesday-1951` | Czarny wtorek nad Namsi | 23 października 1951 | starcie | class-counter, attrition, mutual-support | Futrell 1983; Werrell 2005 |
| `case.rolling-thunder` | Operacja Rolling Thunder | 1965-1968 | kampania | sead, attrition, safe-ground, tempo | Clodfelter 1989; Thompson 2000 |
| `case.thanh-hoa-bridge` | Most Thanh Hoa | 1965-1972 | starcie | key-terrain, kill-zone, class-counter, attrition | Thompson 2000 |
| `case.wild-weasel` | Wild Weasels | 1965-1973 | kampania | sead, combined-arms, initiative | Thompson 2000; Werrell 2005 |
| `case.ault-report-1968` | Raport Aulta i Top Gun | 1968-1972 | kampania | skill-dispersion, exchange-ratio, bvr | Ault 1969; Michel 1997 |
| `case.linebacker-i-1972` | Operacja Linebacker | maj-paź. 1972 | kampania | class-counter, concentration, key-terrain | Clodfelter 1989; Thompson 2000 |
| `case.linebacker-ii-1972` | Linebacker II („Jedenastodniowa wojna") | grudzień 1972 | kampania | sead, avenue-of-approach, attrition, readability | Michel 2002; Clodfelter 1989 |
| `case.operation-focus` | Operacja Focus (Moked) | 5 czerwca 1967 | bitwa | surprise, air-superiority, static-exposure, initiative | Oren 2002; Nordeen 1990 |
| `case.war-of-attrition-sam` | Wojna na wyniszczenie: pas rakiet | 1969-1970 | kampania | sead, attrition, key-terrain, ambush | Bar-Siman-Tov 1980; Nordeen 1990 |
| `case.sam-umbrella-1973` | Parasol SAM nad kanałem | paź. 1973 | bitwa | sead, combined-arms, safe-ground, kill-zone | Herzog 1975; Rabinovich 2004; Werrell 2005 |
| `case.osirak-1981` | Osirak (operacja Opera) | 7 czerwca 1981 | starcie | surprise, avenue-of-approach, key-terrain | Nordeen 1990 |
| `case.el-dorado-canyon-1986` | Operacja El Dorado Canyon | 15 kwietnia 1986 | starcie | tempo, sead, surprise, concentration | Venkus 1992 |
| `case.iran-iraq-air` | Irańsko-iracka wojna powietrzna | 1980-1988 | kampania | attrition, static-exposure, balance | Murray & Woods 2014 |
| `case.black-buck-1982` | Nalot Black Buck | maj-czerwiec 1982 | starcie | economy, key-terrain, avenue-of-approach | Ethell & Price 1983 |
| `case.instant-thunder` | Instant Thunder: planowanie kampanii powietrznej w Zatoce | sierp. 1990-sty. 1991 | kampania | tempo, concentration, sead, key-terrain | Putney 2004; Keaney & Cohen 1993 |
| `case.task-force-normandy-1991` | Task Force Normandy: pierwsze uderzenie Apache'ów | 17 stycznia 1991 | starcie | sead, surprise, initiative, combined-arms | Keaney & Cohen 1993; Atkinson 1993 |
| `case.scud-hunt-1991` | Wielkie polowanie na Scudy | sty.-lut. 1991 | kampania | scouting, mobility, static-exposure | Keaney & Cohen 1993; Rosenau 2001 |
| `case.highway-of-death-1991` | Grzbiet Mutla („Autostrada śmierci") | 26-27 lutego 1991 | starcie | chokepoint, kill-zone, pursuit, withdrawal, open-ground, air-superiority | Atkinson 1993; Keaney & Cohen 1993 |
| `case.anaconda-2002` | Operacja Anaconda: Apache'y w Shahi-Kot | mar. 2002 | bitwa | high-ground, kill-zone, scouting, readability | Naylor 2005 |
| `case.karbala-apache-2003` | Atak Apache'y pod Karbalą | 24 marca 2003 | starcie | ambush, kill-zone, urban-close, readability | Fontenot et al. 2004 |
| `case.libya-2011` | Kampania powietrzna nad Libią | mar.-paź. 2011 | kampania | air-superiority, sead, scouting | Mueller 2015 |
| `case.nagorno-karabakh-2020` | Górski Karabach: drony i obrona przeciwlotnicza | wrz.-lis. 2020 | kampania | sead, class-counter, static-exposure, scouting | Shaikh & Rumbaugh 2020 |
| `case.ukraine-air-2022` | Ukraina: sporne niebo | 2022 | kampania | sead, mobility, air-superiority, static-exposure | Bronk et al. 2022 |
| `case.hostomel-2022` | Lotnisko Hostomel | lut. 2022 | starcie | key-terrain, surprise, attrition | Watling & Reynolds 2022 |
| `case.lam-son-719` | Lam Son 719 | luty-mar. 1971 | kampania | kill-zone, attrition, avenue-of-approach, static-exposure | Nolan 1986; Hinh 1979 |
| `case.eagle-claw-1980` | Operacja Eagle Claw | kwi. 1980 | starcie | readability, mutual-support, attrition | Special Operations Review Group (Holloway 1980 |
| `case.afghanistan-stinger` | Afganistan: Stinger | 1986-1989 | kampania | class-counter, sead, high-ground | Kuperman 1999; Grau 1996 |
| `case.lepanto-1571` | Lepanto | 1571 | bitwa | class-counter, fields-of-fire, concentration | Guilmartin 1974 |
| `case.spanish-armada-1588` | Wielka Armada | 1588 | kampania | mobility, fields-of-fire, surprise, attrition | Mattingly 1959; Martin & Parker 1988 |
| `case.quiberon-bay-1759` | Zatoka Quiberon | 1759 | bitwa | tempo, initiative, obstacle | Mahan 1890 |
| `case.chesapeake-1781` | Chesapeake (Virginia Capes) | 1781 | bitwa | key-terrain, scouting, interior-lines | Mahan 1890 |
| `case.nile-1798` | Nil (zatoka Abukir) | 1798 | bitwa | concentration, local-superiority, surprise, envelopment | Mahan 1897; Lavery 1998 |
| `case.copenhagen-1801` | Kopenhaga | 1801 | bitwa | attrition, obstacle, fields-of-fire | Mahan 1897 |
| `case.hampton-roads-1862` | Hampton Roads | mar. 1862 | starcie | class-counter, balance | US Navy Department 1898 |
| `case.lissa-1866` | Lissa | 1866 | bitwa | skill-dispersion, concentration, mutual-support | Wilson 1896 |
| `case.yalu-1894` | Yalu | 1894 | bitwa | mobility, fields-of-fire, class-counter | Paine 2003; Evans & Peattie 1997 |
| `case.manila-bay-1898` | Zatoka Manila | 1898 | bitwa | exchange-ratio, static-exposure, balance | Trask 1981 |
| `case.heligoland-bight-1914` | Zatoka Helgolandzka | sierpień 1914 | bitwa | concentration, surprise, readability | Corbett 1920 |
| `case.coronel-falklands-1914` | Coronel i Falklandy | lis.-gru. 1914 | kampania | class-counter, local-superiority, mobility | Corbett 1920 |
| `case.dogger-bank-1915` | Dogger Bank | sty. 1915 | bitwa | readability, exchange-ratio, initiative | Corbett 1921 |
| `case.river-plate-1939` | River Plate | grudzień 1939 | bitwa | envelopment, mutual-support, local-superiority | Pope 1956; Roskill 1954 |
| `case.taranto-1940` | Taranto | listopad 1940 | starcie | surprise, static-exposure, class-counter | Roskill 1954; Greene & Massignani 1998 |
| `case.matapan-1941` | Przylądek Matapan | mar. 1941 | bitwa | scouting, surprise, exchange-ratio | Greene & Massignani 1998; Roskill 1954 |
| `case.bismarck-1941` | Cieśnina Duńska i zatopienie Bismarcka | maj 1941 | kampania | scouting, concentration, class-counter | Kennedy 1974; Roskill 1954 |
| `case.pearl-harbor-1941` | Pearl Harbor | 7 grudnia 1941 | starcie | surprise, static-exposure, initiative | Prange 1981; Morison 1948 |
| `case.prince-of-wales-repulse-1941` | Prince of Wales i Repulse | 10 grudnia 1941 | starcie | class-counter, air-superiority, open-ground | Middlebrook & Mahoney 1977; Roskill 1954 |
| `case.java-sea-1942` | Morze Jawajskie | luty 1942 | bitwa | mutual-support, fields-of-fire, readability | Morison 1948 |
| `case.coral-sea-1942` | Morze Koralowe | maj 1942 | bitwa | scouting, fleet-salvo, initiative | Lundstrom 1984; Morison 1949 |
| `case.savo-island-1942` | Wyspa Savo | sierpień 1942 | bitwa | surprise, ambush, scouting, readability | Frank 1990; Morison 1949 |
| `case.eastern-solomons-1942` | Wschodnie Salomony | sierpień 1942 | bitwa | scouting, fleet-salvo, air-superiority | Lundstrom 1994; Frank 1990 |
| `case.cape-esperance-1942` | Przylądek Esperance | paź. 1942 | bitwa | fields-of-fire, surprise, readability | Frank 1990; Hornfischer 2011 |
| `case.santa-cruz-1942` | Wyspy Santa Cruz | paź. 1942 | bitwa | attrition, exchange-ratio, skill-dispersion | Lundstrom 1994; Frank 1990 |
| `case.guadalcanal-naval-1942` | Bitwa morska o Guadalcanal | 12-15 listopada 1942 | bitwa | attrition, fields-of-fire, readability, key-terrain | Hornfischer 2011; Frank 1990 |
| `case.tassafaronga-1942` | Tassafaronga | listopad 1942 | starcie | class-counter, fields-of-fire, initiative | Frank 1990; Hornfischer 2011 |
| `case.channel-dash-1942` | Ucieczka przez kanał („Channel Dash") | luty 1942 | starcie | surprise, tempo, defeat-in-detail | Roskill 1956 |
| `case.pedestal-1942` | Operacja Pedestal | sierpień 1942 | bitwa | attrition, mutual-support, kill-zone | Roskill 1956; Holland 2003 |
| `case.black-may-1943` | Czarny maj | maj 1943 | kampania | scouting, combined-arms, exchange-ratio, mutual-support | Blair 1998; Roskill 1956 |
| `case.north-cape-1943` | Przylądek Północny | grudzień 1943 | bitwa | scouting, envelopment, concentration | Roskill 1960 |
| `case.pacific-submarines` | Amerykańska kampania okrętów podwodnych przeciw Japonii | 1941-1945 | kampania | economy, attrition, class-counter | Blair 1975 |
| `case.samar-1944` | U wybrzeży Samar | 25 października 1944 | bitwa | mutual-support, surprise, readability, local-superiority | Hornfischer 2004; Cutler 1994 |
| `case.surigao-1944` | Cieśnina Surigao | 25 października 1944 | bitwa | crossing-the-t, chokepoint, kill-zone, concentration, line-of-battle, fields-of-fire | Tully 2009; Morison 1958 |
| `case.okinawa-kamikaze-1945` | Okinawa: kampania kamikaze | kwi.-czerw. 1945 | kampania | attrition, static-exposure, scouting, kill-zone | Morison 1960 |
| `case.eilat-1967` | Zatopienie Eilatu | paź. 1967 | starcie | fleet-salvo, class-counter, safe-ground | Hughes 2000; Rabinovich 1988 |
| `case.latakia-1973` | Latakia | paź. 1973 | bitwa | fleet-salvo, class-counter, initiative | Rabinovich 1988; Hughes 2000 |
| `case.belgrano-1982` | Zatopienie ARA General Belgrano | 2 maja 1982 | starcie | class-counter, scouting, safe-ground | Woodward & Robinson 1992; Hastings & Jenkins 1983 |
| `case.sheffield-1982` | Strata HMS Sheffield | 4 maja 1982 | starcie | fleet-salvo, scouting, static-exposure | Woodward & Robinson 1992; Hastings & Jenkins 1983 |
| `case.uss-stark-1987` | USS Stark | 17 maja 1987 | starcie | surprise, readability, fleet-salvo | Wise 2007 |
| `case.praying-mantis-1988` | Operacja Praying Mantis | 18 kwietnia 1988 | bitwa | exchange-ratio, combined-arms, fleet-salvo | Wise 2007 |
| `case.evo-moment-37` | Evo Moment 37 | sierpień 2004 | starcie | tempo, initiative, readability | ESPN 2016 |
| `case.bisu-revolution` | Rewolucja Bisu | marzec 2007 | bitwa | balance, class-counter, mobility | Taylor 2012 |
| `case.dream-coil-ti3` | Dream Coil na The International 2013 | sierpień 2013 | starcie | interior-lines, defeat-in-detail, tempo, initiative | PC Gamer 2013 |
| `case.faker-zed-2013` | Zed Fakera przeciw Ryu | wrzesień 2013 | starcie | skill-dispersion, initiative, readability | Riot Games 2013 |
| `case.olofboost` | Podbicie na Overpassie | listopad 2014 | starcie | sightlines, readability, balance, fields-of-fire | GameSpot 2014 |
| `case.coldzera-jump` | Skaczący AWP na Mirage | kwiecień 2016 | starcie | surprise, skill-dispersion, chokepoint, local-superiority | PC Gamer 2016 |
| `case.astralis-2018` | Astralis i epoka utility | 2018 | kampania | combined-arms, mutual-support, kill-zone | Upcomer 2018 |
| `case.openai-five-og` | OpenAI Five przeciw OG | kwi. 2019 | bitwa | ai-vs-player, tempo, concentration | Berner et al. 2019 |
| `case.alphastar-2019` | AlphaStar osiąga grandmastera | 2019 | kampania | ai-vs-player, skill-dispersion | Vinyals et al. 2019 |
| `case.desert-storm-left-hook` | Lewy hak (ofensywa lądowa Pustynnej Burzy) | 24-28 lutego 1991 | kampania | flank, envelopment, tempo, penetration | Scales 1993; Bourque 2002; Keaney & Cohen 1993 |
| `case.corrupted-blood` | Incydent Corrupted Blood | wrzesień 2005 | kampania | contagion, panic, herding, territoriality | Balicer 2007; Lofgren & Fefferman 2007 |

### Projektowanie gier i poziomów (17) {#game-and-level-design-17}

| id | tytuł | wzorce | źródła |
|---|---|---|---|
| `design.chokepoint` | Wąskie gardła w projektowaniu poziomów | chokepoint, flow, kill-zone, balance | Totten 2019; Hullett & Whitehead 2010; Güttler & Johansson 2003 |
| `design.flank-routes` | Trasy oskrzydlające i trasy zastępcze | flank, flow, avenue-of-approach | Hullett & Whitehead 2010; Totten 2019; Björk & Holopainen 2005 |
| `design.sightlines` | Linie widzenia i dystans walki | sightlines, fields-of-fire, class-counter, readability | Totten 2019; Güttler & Johansson 2003; Kremers 2009 |
| `design.cover-placement` | Rozmieszczenie osłon i rytm | cover, open-ground, flow | Totten 2019; Kremers 2009; Hullett & Whitehead 2010 |
| `design.spawn` | Projekt punktów odrodzenia i ochrona po odrodzeniu | spawn-pressure, balance, readability | Totten 2019; Güttler & Johansson 2003; Kremers 2009 |
| `design.symmetry-balance` | Równowaga map symetrycznych i asymetrycznych | balance, exchange-ratio, key-terrain | Elias et al. 2012; Adams & Dormans 2012; Schell 2008 |
| `design.class-counters` | Równowaga klas i przeciwwagi | class-counter, balance, combined-arms | Sirlin 2006; Elias et al. 2012; Adams & Dormans 2012 |
| `design.flow` | Przepływ, pętle i czytelne układy | flow, avenue-of-approach, readability | Lynch 1960; Totten 2019; Alexander et al. 1977; Csikszentmihalyi 1990 |
| `design.economy` | Ekonomie gier i pętle sprzężenia zwrotnego | economy, balance, skill-dispersion | Adams & Dormans 2012; Salen & Zimmerman 2003; Koster 2004 |
| `design.matchmaking` | Dobieranie graczy i rozrzut umiejętności | skill-dispersion, balance | Herbrich et al. 2007; Glickman 1999; Elo 1978 |
| `design.ai-behaviour` | Przeciwnicy AI jako sondy poziomu | ai-vs-player, readability | Seif El-Nasr et al. 2013; Drachen et al. 2009 |
| `design.meaningful-play` | Znacząca gra i wybór | balance, flow, flank | Salen & Zimmerman 2003; Schell 2008; Juul 2005 |
| `design.trading` | Wymiana i gra zespołowa w strzelankach | mutual-support, initiative | Xenopoulos et al. 2020; Schubert et al. 2016 |
| `design.map-control` | Kontrola mapy | key-terrain, local-superiority, flow | Xenopoulos et al. 2022; Rioult et al. 2014; Fernández & Bornn 2018 |
| `design.heatmaps` | Mapy cieplne i telemetria przestrzenna w projekcie | flow, kill-zone, key-terrain | Drachen & Canossa 2009; Wallner & Kriglstein 2013; Hoobler et al. 2004; Kim et al. 2008; Bowman et al. 2012 |
| `design.fun-mastery` | Opanowanie, nauka i zabawa | readability, skill-dispersion | Koster 2004; Csikszentmihalyi 1990; Schell 2008 |
| `design.buy-economy` | Ekonomia rund i decyzje o zakupach | conformity, economy, coordination, mixed-strategy | Xenopoulos et al. 2020; Fleiss 1971 |

### Badania (113) {#studies-113}

| id | tytuł | źródła |
|---|---|---|
| `study.engel-1954` | Engel: prawo kwadratów Lanchestera przy Iwo Jimie | Engel 1954 |
| `study.bracken-1995` | Bracken: modele Lanchestera dla Ardenów | Bracken 1995 |
| `study.fricker-1998` | Fricker: ponownie o modelach wyniszczenia w Ardenach | Fricker 1998 |
| `study.lucas-turkes-2004` | Lucas i Turkes: Kursk i Ardeny | Lucas & Turkes 2004 |
| `study.hartley-helmbold-1995` | Hartley i Helmbold: weryfikacja prawa kwadratów | Hartley & Helmbold 1995 |
| `study.drachen-canossa-2009` | Analiza zgonów graczy w GIS | Drachen & Canossa 2009; Seif El-Nasr et al. 2013 |
| `study.hoobler-2004` | Lighthouse: wizualizacja zachowań w rywalizacji | Hoobler et al. 2004 |
| `study.xenopoulos-2020` | Wycena działań w Counter-Strike | Xenopoulos et al. 2020 |
| `study.schubert-2016` | Wykrywanie starć w e-sporcie | Schubert et al. 2016 |
| `study.red-baron` | Project Red Baron: walka powietrzna nad Wietnamem | Weapons Systems Evaluation Group 1967; Michel 1997 |
| `study.dupuy-qjm` | Dupuy: ilościowy osąd bitew historycznych | Dupuy 1979; Dupuy 1987 |
| `study.biddle-2004` | Biddle: sposób użycia sił tłumaczy wyniki | Biddle 2004 |
| `study.wallner-kriglstein-2013` | Przegląd wizualizacji danych z rozgrywki | Wallner & Kriglstein 2013; Bowman et al. 2012 |
| `study.willard-1962` | Willard: Lanchester wobec trzech stuleci bitew lądowych | Willard 1962; Fain 1977 |
| `study.fain-1977` | Fain: sześćdziesiąt starć II wojny światowej | Fain 1977; Willard 1962 |
| `study.weiss-1966` | Weiss: modele walki a wojna secesyjna w USA | Weiss 1966 |
| `study.hartley-1995-attrition` | Hartley: model statystyczny danych o wyniszczeniu | Hartley 1995 |
| `study.helmbold-1995` | Helmbold: tempo postępu w walce lądowej | Helmbold 1995 |
| `study.lucas-dinges-2004` | Lucas i Dinges: okoliczności ważą więcej niż prawo | Lucas & Dinges 2004; Lucas & Turkes 2004 |
| `study.kursk-data-base` | Baza danych o Kursku | Lawrence 2015; Lucas & Dinges 2004; Lucas & Turkes 2004 |
| `study.ardennes-data-base` | Baza danych kampanii w Ardenach | Bracken 1995; Fricker 1998; Lucas & Turkes 2004 |
| `study.johnson-mackay-2011` | Johnson i MacKay: Bitwa o Anglię jako dane Lanchestera | Johnson & MacKay 2011 |
| `study.rotte-schmidt-2003` | Rotte i Schmidt: liczby wciąż wygrywają bitwy | Rotte & Schmidt 2003 |
| `study.dupuy-attrition` | Dupuy: prawidłowości strat w bitwach | Dupuy 1990; Dupuy 1987 |
| `study.dupuy-tndm` | Taktyczny deterministyczny model liczbowy Dupuya | Dupuy 1990; Lawrence 2017; Dupuy 1987 |
| `study.lawrence-2017` | Lawrence: wojna w liczbach | Lawrence 2017 |
| `study.vancreveld-1982` | Van Creveld: siła bojowa | van Creveld 1982; Dupuy 1987 |
| `study.reiter-stam-2002` | Reiter i Stam: demokracje na wojnie | Reiter & Stam 2002; Desch 2002 |
| `study.epstein-1985` | Epstein: adaptacyjny model dynamiczny | Epstein 1985; Epstein 1989 |
| `study.deitchman-1962` | Deitchman: Lanchester a wojna partyzancka | Deitchman 1962; Taylor 1983 |
| `study.armstrong-2005` | Armstrong: stochastyczny model salw | Armstrong 2005; Hughes 1995 |
| `study.hughes-fleet-tactics` | Hughes: podstawy taktyki floty | Hughes & Girrier 2018; Hughes 2000 |
| `study.mearsheimer-epstein` | Spór o zasadę 3:1 | Mearsheimer 1989; Epstein 1989 |
| `study.kress-2012` | Kress: modelowanie konfliktów zbrojnych | Kress 2012; Washburn & Kress 2009 |
| `study.ault-1969` | Raport Aulta: pociski wystrzelone poza swoją strefą | Ault 1969; Michel 1997 |
| `study.gwaps` | Gulf War Air Power Survey | Keaney & Cohen 1993; Hallion 1992 |
| `study.blackett-circus` | Cyrk Blacketta | Blackett 1962; Kirby 2003; Budiansky 2013; McCloskey 1987 |
| `study.depth-charge-settings` | Ustawienia bomb głębinowych w Coastal Command | Waddington 1973; Budiansky 2013; Morse & Kimball 1951 |
| `study.aircraft-camouflage` | Białe spody samolotów przeciwpodwodnych | Waddington 1973; Budiansky 2013 |
| `study.wald-survivorship` | Wald: pancerz tam, gdzie nie trafiono wracających bombowców | Mangel & Samaniego 1984 |
| `study.optimal-search` | Optymalne poszukiwania: od okrętów podwodnych do AF447 | Stone 1975; Stone et al. 2014; Koopman 1946; Washburn 2002 |
| `study.glenn-1996` | Glenn: walka w piekle | Glenn 1996; FM 3-06 2006 |
| `study.a2ad-2003` | Zakaz dostępu i blokada obszaru | Krepinevich et al. 2003 |
| `study.bauckhage-2012` | Jak gracze tracą zainteresowanie | Bauckhage et al. 2012; Kaplan & Meier 1958 |
| `study.drachen-sifa-2012` | Grupowanie zachowań graczy w naturalnym środowisku | Drachen et al. 2012; Drachen et al. 2009 |
| `study.canossa-2011` | Wykrywanie frustracji gracza | Canossa et al. 2011 |
| `study.medler-2011` | Data Cracker: pulpity telemetrii w produkcji | Medler et al. 2011 |
| `study.wallner-kriglstein-2014` | PLATO: analiza wizualna rozgrywki | Wallner & Kriglstein 2014; Wallner & Kriglstein 2013 |
| `study.miller-crowcroft-2009` | Ruch awatarów na polach bitew World of Warcraft | Miller & Crowcroft 2009 |
| `study.kim-2008` | TRUE: instrumentowanie testów użytkowników na dużą skalę | Kim et al. 2008 |
| `study.game-data-science` | Nauka o danych z gier | Seif El-Nasr et al. 2021; Seif El-Nasr et al. 2013 |
| `study.ai-and-games` | Sztuczna inteligencja a gry | Yannakakis & Togelius 2018 |
| `study.drachen-2014` | Umiejętności i ruch zespołu w Dota 2 | Drachen et al. 2014 |
| `study.yang-2014` | Wzorce walki przewidujące wygrane w MOBA | Yang et al. 2014; Schubert et al. 2016 |
| `study.eggert-2015` | Role graczy w Dota 2 | Eggert et al. 2015 |
| `study.semenov-2017` | Przewidywanie wyników Dota 2 z draftów | Semenov et al. 2017; Makarov et al. 2018 |
| `study.hodge-2021` | Przewidywanie wygranej na żywo w e-sporcie zawodowym | Hodge et al. 2021 |
| `study.rioult-2014` | Topologia pozycji graczy | Rioult et al. 2014 |
| `study.bednarek-2017` | Ocena graczy w drużynowych strzelankach | Bednárek et al. 2017 |
| `study.katona-2019` | Przewidywanie, kto zginie następny | Katona et al. 2019 |
| `study.block-2018` | Historie oparte na danych dla widzów e-sportu | Block et al. 2018 |
| `study.ggviz` | ggViz: przeszukiwanie stanów gry na dużą skalę | Xenopoulos et al. 2022 |
| `study.openai-five` | OpenAI Five: uczenie przez wzmacnianie na dużą skalę w Dota 2 | Berner et al. 2019 |
| `study.alphastar` | AlphaStar: poziom grandmastera w StarCraft II | Vinyals et al. 2019 |
| `study.cervone-2016` | Oczekiwana wartość posiadania piłki w koszykówce | Cervone et al. 2016 |
| `study.decroos-2019` | VAEP: wycena działań z piłką w piłce nożnej | Decroos et al. 2019 |
| `study.pitch-control` | Kontrola boiska i tworzenie przestrzeni | Spearman 2018; Fernández & Bornn 2018; Taki et al. 1996 |
| `study.franks-2015` | Przestrzenna struktura umiejętności obronnych | Franks et al. 2015; Miller et al. 2014 |
| `study.lucey-2013` | Role w drużynie z danych śledzenia | Lucey et al. 2013 |
| `study.shot-quality` | Oczekiwane gole i jakość strzału | Decroos et al. 2019; Pollard & Reep 1997; Reep & Benjamin 1968 |
| `study.goldsberry-2012` | CourtVision: przestrzenna skuteczność rzutów | Goldsberry 2012; Miller et al. 2014 |
| `study.team-sports-survey` | Analiza czasoprzestrzenna sportów zespołowych | Gudmundsson & Horton 2017 |
| `study.ripley-k` | Ripley K: skupianie w każdej skali | Ripley 1977; Baddeley et al. 2015; Diggle 2013 |
| `study.clark-evans-1954` | Clark i Evans: rozproszenie najbliższego sąsiada | Clark & Evans 1954 |
| `study.getis-ord` | Gorące punkty Getisa-Orda | Getis & Ord 1992; Ord & Getis 1995; Benjamini & Hochberg 1995 |
| `study.lisa` | Lokalne wskaźniki asocjacji przestrzennej | Anselin 1995; Moran 1950 |
| `study.scan-statistic` | Przestrzenna statystyka skanująca | Kulldorff 1997 |
| `study.kde` | Estymacja gęstości jądrowej | Silverman 1986 |
| `study.knox-1964` | Interakcja czasoprzestrzenna | Knox 1964; Diggle 2013 |
| `study.maup` | Problem modyfikowalnej jednostki obszarowej | Openshaw 1984; Tobler 1970 |
| `study.isovists` | Izowisty i grafy widoczności | Benedikt 1979; Turner et al. 2001; Hillier & Hanson 1984 |
| `study.space-syntax` | Składnia przestrzeni | Hillier & Hanson 1984; Turner et al. 2001 |
| `study.mean-crowding` | Średnie zagęszczenie | Lloyd 1967 |
| `study.survival-analysis` | Analiza przeżycia dla czasu do zgonu | Kaplan & Meier 1958; Cox 1972 |
| `study.glm` | Uogólnione modele liniowe dla zliczeń | Nelder & Wedderburn 1972; McCullagh & Nelder 1989; Akaike 1974 |
| `study.bootstrap` | Bootstrap i przedziały ufności | Efron 1979; Wilson 1927 |
| `study.tokey-2024` | Tokey i in.: opóźnienie a przewaga wychylającego się | Tokey et al. 2024 |
| `study.lee-chang-2017` | Lee i Chang: strzał zza rogu | Lee & Chang 2017; Bernier 2001 |
| `study.claypool-latency` | Claypool: opóźnienie a działania gracza | Claypool & Claypool 2006; Liu et al. 2022 |
| `study.xenopoulos-2022-wp` | Xenopoulos i in.: zawodowcy i amatorzy przez pryzmat prawdopodobieństwa wygranej | Xenopoulos et al. 2022; Xenopoulos & Silva 2022 |
| `study.xenopoulos-2021-econ` | Xenopoulos i in.: decyzje ekonomiczne w Counter-Strike | Xenopoulos et al. 2021 |
| `study.maymin-2021` | Maymin: sprytne zabójstwa i bezwartościowe zgony | Maymin 2021 |
| `study.moba-live-prediction` | Przewidywanie wyniku na żywo w MOBA | Yang et al. 2017; Silva et al. 2018 |
| `study.hayakawa-2025` | Hayakawa i in.: rundy Valoranta z cech taktycznych | Hayakawa et al. 2025 |
| `study.paskiv-2026` | Paskiv i in.: role w zawodowym Counter-Strike 2 | Paskiv et al. 2026 |
| `study.ibrahim-2024` | Ibrahim i in.: trening walki w zwarciu | Ibrahim et al. 2024 |
| `study.crowd-turbulence` | Turbulencje tłumu podczas pielgrzymki hadżdż w 2006 roku | Helbing et al. 2007; Moussaïd et al. 2011 |
| `study.walking-groups` | Grupy idących kształtują tłumy | Moussaïd et al. 2010 |
| `study.pigeon-hierarchy` | Hierarchiczna dynamika grup w stadach gołębi | Nagy et al. 2010; Vicsek & Zafeiris 2012 |
| `study.music-lab` | Wpływ społeczny czyni sukces nierównym i nieprzewidywalnym | Salganik et al. 2006 |
| `study.wisdom-undermined` | Wpływ społeczny podważa mądrość tłumu | Lorenz et al. 2011 |
| `study.drawing-power-of-crowds` | Siła przyciągania tłumu | Milgram et al. 1969; Gallup et al. 2012 |
| `study.asch-conformity` | Konformizm wobec jednomyślnej większości | Asch 1956; Bond & Smith 1996 |
| `study.why-they-fight` | Why They Fight: motywacja bojowa w Iraku | Wong et al. 2003; Shils & Janowitz 1948 |
| `study.cohesion-performance` | Spójność a wyniki: metaanalizy | Mullen & Copper 1994; Beal et al. 2003 |
| `study.loss-averse-golfers` | Awersja do straty wśród golfistów zawodowych | Pope & Schweitzer 2011 |
| `study.hot-hand-baseball` | Gorące ręce w baseballu | Green & Zwiebel 2018 |
| `study.penalty-kicks` | Rzuty karne: zawodnicy grają minimax | Chiappori et al. 2002; Palacios-Huerta 2003; Bar-Eli et al. 2007 |
| `study.minimax-wimbledon` | Gra minimax na Wimbledonie | Walker & Wooders 2001 |
| `study.collective-intelligence` | Inteligencja zbiorowa zespołów | Woolley et al. 2010; Kim et al. 2017 |
| `study.online-world-networks` | Sieci społeczne świata online | Szell et al. 2010 |
| `study.team-networks` | Sieci podań a wyniki drużyny | Duch et al. 2010; Grund 2012 |
| `study.complex-contagion` | Zachowania rozchodzą się przez skupione sieci | Centola 2010 |

### Bibliografia {#bibliography}

- Adams, E.; Dormans, J. (2012). Game Mechanics: Advanced Game Design. New Riders, Berkeley. *(sprawdzone 2026-11-15: szczegóły)*
- Akaike, H. (1974). A new look at the statistical model identification. IEEE Transactions on Automatic Control 19(6): 716-723. *(sprawdzone 2026-11-15: szczegóły)*
- Alexander, C.; Ishikawa, S.; Silverstein, M. (1977). A Pattern Language. Oxford University Press, New York. *(sprawdzone 2026-11-15: szczegóły)*
- Alexander, J. H. (1993). Across the Reef: The Marine Assault of Tarawa. Marine Corps Historical Center, Washington DC. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Altman, I. (1975). The Environment and Social Behavior: Privacy, Personal Space, Territory, Crowding. Brooks/Cole, Monterey CA. *(sprawdzone 2026-11-15: szczegóły)*
- Ammianus Marcellinus (tłum. Yonge, C. D.) (1862). The Roman History of Ammianus Marcellinus. Henry G. Bohn, London. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Anderson, L. R.; Holt, C. A. (1996). Classroom games: information cascades. Journal of Economic Perspectives 10(4): 187-193. doi:10.1257/jep.10.4.187 *(sprawdzone 2026-11-15: szczegóły)*
- Andreas, P. (2008). Blue Helmets and Black Markets: The Business of Survival in the Siege of Sarajevo. Cornell University Press, Ithaca. *(sprawdzone 2026-11-15: szczegóły)*
- Anselin, L. (1995). Local Indicators of Spatial Association—LISA. Geographical Analysis 27(2): 93-115. *(sprawdzone 2026-11-15: szczegóły)*
- Appleman, R. E. (1961). South to the Naktong, North to the Yalu (US Army in the Korean War). Office of the Chief of Military History, Washington DC. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Appleman, R. E. (1987). East of Chosin: Entrapment and Breakout in Korea, 1950. Texas A&M University Press, College Station. *(sprawdzone 2026-11-15: szczegóły)*
- Appleman, R. E.; Burns, J. M.; Gugeler, R. A.; Stevens, J. (1948). Okinawa: The Last Battle (US Army in World War II). Historical Division, Department of the Army, Washington DC. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Ardant du Picq, C. (tłum. Greely, J. N.; Cotton, R. C.) (1921). Battle Studies: Ancient and Modern Battle. Macmillan, New York. https://www.gutenberg.org/ebooks/7294 *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Arkes, H. R.; Blumer, C. (1985). The psychology of sunk cost. Organizational Behavior and Human Decision Processes 35(1): 124-140. doi:10.1016/0749-5978(85)90049-4 *(sprawdzone 2026-11-15: szczegóły)*
- Armstrong, M. J. (2005). A stochastic salvo model for naval surface combat. Operations Research 53(5): 830-841. doi:10.1287/opre.1040.0195 *(sprawdzone 2026-11-15: szczegóły)*
- Arnold, T. D.; Fiore, N. (2019). Five operational lessons from the Battle for Mosul. Military Review (January-February 2019), Army University Press. *(domena publiczna)* *(sprawdzone 2026-11-15: istnienie)*
- Arrian (tłum. Chinnock, E. J.) (1893). The Anabasis of Alexander. Hodder & Stoughton, London. https://www.gutenberg.org/ebooks/46976 *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Asch, S. E. (1956). Studies of independence and conformity: I. A minority of one against a unanimous majority. Psychological Monographs: General and Applied 70(9): 1-70. doi:10.1037/h0093718 *(sprawdzone 2026-11-15: szczegóły)*
- Atkinson, R. (1993). Crusade: The Untold Story of the Persian Gulf War. Houghton Mifflin, Boston. *(sprawdzone 2026-11-15: szczegóły)*
- Ault, F. W. (1969). Report of the Air-to-Air Missile System Capability Review (the Ault Report). Naval Air Systems Command, Washington DC. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Baddeley, A.; Rubak, E.; Turner, R. (2015). Spatial Point Patterns: Methodology and Applications with R. CRC Press, Boca Raton. *(sprawdzone 2026-11-15: szczegóły)*
- Bainbridge, W. S. (2007). The scientific research potential of virtual worlds. Science 317(5837): 472-476. doi:10.1126/science.1146930 *(sprawdzone 2026-11-15: szczegóły)*
- Balicer, R. D. (2007). Modeling infectious diseases dissemination through online role-playing games. Epidemiology 18(2): 260-261. doi:10.1097/01.ede.0000254692.80550.60 *(sprawdzone 2026-11-15: szczegóły)*
- Ballard, M. B. (2004). Vicksburg: The Campaign That Opened the Mississippi. University of North Carolina Press, Chapel Hill. *(sprawdzone 2026-11-15: szczegóły)*
- Ballerini, M.; Cabibbo, N.; Candelier, R.; Cavagna, A.; Cisbani, E.; Giardina, I.; Lecomte, V.; Orlandi, A.; Parisi, G.; Procaccini, A.; Viale, M.; Zdravkovic, V. (2008). Interaction ruling animal collective behavior depends on topological rather than metric distance: evidence from a field study. Proceedings of the National Academy of Sciences 105(4): 1232-1237. doi:10.1073/pnas.0711437105 *(sprawdzone 2026-11-15: szczegóły)*
- Banerjee, A. V. (1992). A simple model of herd behavior. Quarterly Journal of Economics 107(3): 797-817. doi:10.2307/2118364 *(sprawdzone 2026-11-15: szczegóły)*
- Bar-Eli, M.; Avugos, S.; Raab, M. (2006). Twenty years of "hot hand" research: review and critique. Psychology of Sport and Exercise 7(6): 525-553. doi:10.1016/j.psychsport.2006.03.001 *(sprawdzone 2026-11-15: szczegóły)*
- Bar-Eli, M.; Azar, O. H.; Ritov, I.; Keidar-Levin, Y.; Schein, G. (2007). Action bias among elite soccer goalkeepers: the case of penalty kicks. Journal of Economic Psychology 28(5): 606-621. doi:10.1016/j.joep.2006.12.001 *(sprawdzone 2026-11-15: szczegóły)*
- Bar-Siman-Tov, Y. (1980). The Israeli-Egyptian War of Attrition, 1969-1970. Columbia University Press, New York. *(sprawdzone 2026-11-15: szczegóły)*
- Barabási, A.-L.; Albert, R. (1999). Emergence of scaling in random networks. Science 286(5439): 509-512. doi:10.1126/science.286.5439.509 *(sprawdzone 2026-11-15: szczegóły)*
- Barr, N. (2004). Pendulum of War: The Three Battles of El Alamein. Jonathan Cape, London. *(sprawdzone 2026-11-15: szczegóły)*
- Barrow, G. W. S. (1965). Robert Bruce and the Community of the Realm of Scotland. Eyre & Spottiswoode, London. *(sprawdzone 2026-11-15: szczegóły)*
- Bartley, W. S. (1954). Iwo Jima: Amphibious Epic. Historical Branch, US Marine Corps, Washington DC. *(domena publiczna)* *(sprawdzone 2026-11-15: istnienie)*
- Bauckhage, C.; Kersting, K.; Sifa, R.; Thurau, C.; Drachen, A.; Canossa, A. (2012). How players lose interest in playing a game: an empirical study based on distributions of total playing times. Proc. IEEE Conference on Computational Intelligence and Games (CIG 2012): 139-146. doi:10.1109/CIG.2012.6374148 *(sprawdzone 2026-11-15: szczegóły)*
- Baumeister, R. F. (1984). Choking under pressure: self-consciousness and paradoxical effects of incentives on skillful performance. Journal of Personality and Social Psychology 46(3): 610-620. doi:10.1037/0022-3514.46.3.610 *(sprawdzone 2026-11-15: szczegóły)*
- Beal, D. J.; Cohen, R. R.; Burke, M. J.; McLendon, C. L. (2003). Cohesion and performance in groups: a meta-analytic clarification of construct relations. Journal of Applied Psychology 88(6): 989-1004. doi:10.1037/0021-9010.88.6.989 *(sprawdzone 2026-11-15: szczegóły)*
- Bednárek, D.; Kruliš, M.; Yaghob, J.; Zavoral, F. (2017). Player performance evaluation in team-based first-person shooter eSport. Data Management Technologies and Applications (DATA 2017), CCIS, Springer. *(sprawdzone 2026-11-15: istnienie)*
- Beevor, A. (1991). Crete: The Battle and the Resistance. John Murray, London. *(sprawdzone 2026-11-15: szczegóły)*
- Beevor, A. (1998). Stalingrad. Viking, London. *(sprawdzone 2026-11-15: szczegóły)*
- Beevor, A. (2002). Berlin: The Downfall 1945. Viking, London. *(sprawdzone 2026-11-15: szczegóły)*
- Benedikt, M. L. (1979). To take hold of space: isovists and isovist fields. Environment and Planning B 6(1): 47-65. *(sprawdzone 2026-11-15: szczegóły)*
- Benjamini, Y.; Hochberg, Y. (1995). Controlling the false discovery rate: a practical and powerful approach to multiple testing. Journal of the Royal Statistical Society B 57(1): 289-300. *(sprawdzone 2026-11-15: szczegóły)*
- Berner, C.; Brockman, G.; Chan, B.; Cheung, V.; et al. (OpenAI) (2019). Dota 2 with large scale deep reinforcement learning. arXiv:1912.06680. https://arxiv.org/abs/1912.06680 *(sprawdzone 2026-11-15: szczegóły)*
- Bernier, Y. W. (2001). Latency compensating methods in client/server in-game protocol design and optimization. Valve Developer Community (Valve Software). https://developer.valvesoftware.com/wiki/Latency_Compensating_Methods_in_Client/Server_In-game_Protocol_Design_and_Optimization *(sprawdzone 2026-11-15: istnienie)*
- Biddle, S. (2004). Military Power: Explaining Victory and Defeat in Modern Battle. Princeton University Press, Princeton. *(sprawdzone 2026-11-15: szczegóły)*
- Bikhchandani, S.; Hirshleifer, D.; Welch, I. (1992). A theory of fads, fashion, custom, and cultural change as informational cascades. Journal of Political Economy 100(5): 992-1026. doi:10.1086/261849 *(sprawdzone 2026-11-15: szczegóły)*
- Björk, S.; Holopainen, J. (2005). Patterns in Game Design. Charles River Media, Hingham. *(sprawdzone 2026-11-15: szczegóły)*
- Blackett, P. M. S. (1962). Studies of War: Nuclear and Conventional. Oliver & Boyd, Edinburgh. *(sprawdzone 2026-11-15: szczegóły)*
- Blair, C. (1975). Silent Victory: The U.S. Submarine War Against Japan. Lippincott, Philadelphia. *(sprawdzone 2026-11-15: szczegóły)*
- Blair, C. (1998). Hitler's U-Boat War: The Hunted, 1942-1945. Random House, New York. *(sprawdzone 2026-11-15: szczegóły)*
- Block, F.; Hodge, V.; Hobson, S.; Sephton, N.; Devlin, S.; Ursu, M. F.; Drachen, A.; Cowling, P. I. (2018). Narrative bytes: data-driven content production in esports. Proc. ACM International Conference on Interactive Experiences for TV and Online Video (TVX 2018): 29-41. *(sprawdzone 2026-11-15: istnienie)*
- Blumenson, M. (1961). Breakout and Pursuit (US Army in World War II). Office of the Chief of Military History, Washington DC. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Blumenson, M. (1967). Kasserine Pass. Houghton Mifflin, Boston. *(sprawdzone 2026-11-15: szczegóły)*
- Bond, R.; Smith, P. B. (1996). Culture and conformity: a meta-analysis of studies using Asch's (1952b, 1956) line judgment task. Psychological Bulletin 119(1): 111-137. doi:10.1037/0033-2909.119.1.111 *(sprawdzone 2026-11-15: szczegóły)*
- Bourque, S. A. (2002). Jayhawk! The VII Corps in the Persian Gulf War. Center of Military History, US Army, Washington DC. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Bowden, M. (1999). Black Hawk Down: A Story of Modern War. Atlantic Monthly Press, New York. *(sprawdzone 2026-11-15: szczegóły)*
- Bowman, B.; Elmqvist, N.; Jankun-Kelly, T. J. (2012). Toward visualization for games: theory, design space, and patterns. IEEE Transactions on Visualization and Computer Graphics 18(11): 1956-1968. *(sprawdzone 2026-11-15: szczegóły)*
- Boyd, J. R. (1986). Patterns of Conflict (briefing). Unpublished briefing; archived by the Marine Corps University, Quantico. https://www.usmcu.edu/Research/Marine-Corps-History-Division/ *(sprawdzone 2026-11-15: istnienie)*
- Boyd, J. R.; Christie, T. P.; Gibson, J. E. (1966). Energy-Maneuverability (APGC-TR-66-4). Air Proving Ground Center, Eglin AFB. *(sprawdzone 2026-11-15: szczegóły)*
- Bracken, J. (1995). Lanchester models of the Ardennes campaign. Naval Research Logistics 42(4): 559-577. *(sprawdzone 2026-11-15: szczegóły)*
- Bradley, R. A.; Terry, M. E. (1952). Rank analysis of incomplete block designs: I. The method of paired comparisons. Biometrika 39(3/4): 324-345. *(sprawdzone 2026-11-15: szczegóły)*
- Brier, G. W. (1950). Verification of forecasts expressed in terms of probability. Monthly Weather Review 78(1): 1-3. doi:10.1175/1520-0493(1950)078<0001:VOFEIT>2.0.CO;2 *(sprawdzone 2026-11-15: szczegóły)*
- Bronk, J.; Reynolds, N.; Watling, J. (2022). The Russian Air War and Ukrainian Requirements for Air Defence. Royal United Services Institute, London (Special Resources, November 2022). *(sprawdzone 2026-11-15: istnienie)*
- Budiansky, S. (2013). Blackett's War: The Men Who Defeated the Nazi U-Boats and Brought Science to the Art of Warfare. Alfred A. Knopf, New York. *(sprawdzone 2026-11-15: szczegóły)*
- Bungay, S. (2000). The Most Dangerous Enemy: A History of the Battle of Britain. Aurum Press, London. *(sprawdzone 2026-11-15: szczegóły)*
- Burg, S. L.; Shoup, P. S. (1999). The War in Bosnia-Herzegovina: Ethnic Conflict and International Intervention. M. E. Sharpe, Armonk. *(sprawdzone 2026-11-15: szczegóły)*
- Caesar, G. J. (tłum. McDevitte, W. A.; Bohn, W. S.) (1869). The Commentaries: The Civil War. Harper & Brothers, New York. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Caldwell, D.; Muller, R. (2007). The Luftwaffe over Germany: Defense of the Reich. Greenhill Books, London. *(sprawdzone 2026-11-15: szczegóły)*
- Campbell, N. J. M. (1986). Jutland: An Analysis of the Fighting. Conway Maritime Press, London. *(sprawdzone 2026-11-15: szczegóły)*
- Canossa, A.; Drachen, A.; Sørensen, J. R. M. (2011). Arrrgghh!!! - blending quantitative and qualitative methods to detect player frustration. Proc. 6th International Conference on Foundations of Digital Games (FDG 2011), ACM: 61-68. *(sprawdzone 2026-11-15: szczegóły)*
- Castronova, E. (2005). Synthetic Worlds: The Business and Culture of Online Games. University of Chicago Press, Chicago. *(sprawdzone 2026-11-15: szczegóły)*
- Centola, D. (2010). The spread of behavior in an online social network experiment. Science 329(5996): 1194-1197. doi:10.1126/science.1185231 *(sprawdzone 2026-11-15: szczegóły)*
- Cervone, D.; D'Amour, A.; Bornn, L.; Goldsberry, K. (2016). A multiresolution stochastic process model for predicting basketball possession outcomes. Journal of the American Statistical Association 111(514): 585-599. *(sprawdzone 2026-11-15: szczegóły)*
- Chandler, D. G. (1966). The Campaigns of Napoleon. Macmillan, New York. *(sprawdzone 2026-11-15: szczegóły)*
- Chandler, D. G. (1973). Marlborough as Military Commander. Batsford, London. *(sprawdzone 2026-11-15: szczegóły)*
- Chiappori, P.-A.; Levitt, S.; Groseclose, T. (2002). Testing mixed-strategy equilibria when players are heterogeneous: the case of penalty kicks in soccer. American Economic Review 92(4): 1138-1151. doi:10.1257/00028280260344678 *(sprawdzone 2026-11-15: szczegóły)*
- Churchill, W. S. (1899). The River War: An Historical Account of the Reconquest of the Soudan. Longmans, Green, London. https://www.gutenberg.org/ebooks/4943 *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Cilliers, J. K. (1985). Counter-Insurgency in Rhodesia. Croom Helm, London. *(sprawdzone 2026-11-15: szczegóły)*
- Citino, R. M. (2005). The German Way of War: From the Thirty Years' War to the Third Reich. University Press of Kansas, Lawrence. *(sprawdzone 2026-11-15: szczegóły)*
- Clark, P. J.; Evans, F. C. (1954). Distance to nearest neighbor as a measure of spatial relationships in populations. Ecology 35(4): 445-453. *(sprawdzone 2026-11-15: szczegóły)*
- Clausewitz, C. von (tłum. Graham, J. J.) (1873). On War. N. Trübner, London. https://www.gutenberg.org/ebooks/1946 *(domena publiczna)* *(sprawdzone 2026-11-15: istnienie)*
- Claypool, M.; Claypool, K. (2006). Latency and player actions in online games. Communications of the ACM 49(11): 40-45. doi:10.1145/1167838.1167860 *(sprawdzone 2026-11-15: szczegóły)*
- Clodfelter, M. (1989). The Limits of Air Power: The American Bombing of North Vietnam. Free Press, New York. *(sprawdzone 2026-11-15: szczegóły)*
- Coddington, E. B. (1968). The Gettysburg Campaign: A Study in Command. Scribner, New York. *(sprawdzone 2026-11-15: szczegóły)*
- Cohen, A.; Hamilton, R. E. (2011). The Russian Military and the Georgia War: Lessons and Implications. Strategic Studies Institute, US Army War College, Carlisle. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Cole, H. M. (1950). The Lorraine Campaign (US Army in World War II). Historical Division, Department of the Army, Washington DC. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Cole, H. M. (1965). The Ardennes: Battle of the Bulge (US Army in World War II). Office of the Chief of Military History, Washington DC. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Combat Studies Institute (2010). Wanat: Combat Action in Afghanistan, 2008. Combat Studies Institute Press, Fort Leavenworth. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Connaughton, R. M. (1988). The War of the Rising Sun and Tumbling Bear: A Military History of the Russo-Japanese War, 1904-5. Routledge, London. *(sprawdzone 2026-11-15: szczegóły)*
- Cooper, B. (1967). The Ironclads of Cambrai. Souvenir Press, London. *(sprawdzone 2026-11-15: szczegóły)*
- Coox, A. D. (1985). Nomonhan: Japan Against Russia, 1939. Stanford University Press, Stanford. *(sprawdzone 2026-11-15: szczegóły)*
- Copp, T. (2003). Fields of Fire: The Canadians in Normandy. University of Toronto Press, Toronto. *(sprawdzone 2026-11-15: szczegóły)*
- Corbett, J. S. (1910). The Campaign of Trafalgar. Longmans, Green, London. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Corbett, J. S. (1911). Some Principles of Maritime Strategy. Longmans, Green, London. https://www.gutenberg.org/ebooks/15076 *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Corbett, J. S. (1920). Naval Operations vol. 1 (History of the Great War). Longmans, Green, London. *(domena publiczna)* *(sprawdzone 2026-11-15: istnienie)*
- Corbett, J. S. (1921). Naval Operations vol. 2 (History of the Great War). Longmans, Green, London. *(domena publiczna)* *(sprawdzone 2026-11-15: istnienie)*
- Corbett, J. S. (1923). Naval Operations vol. 3 (History of the Great War). Longmans, Green, London. *(domena publiczna)* *(sprawdzone 2026-11-15: istnienie)*
- Cordesman, A. H.; Wagner, A. R. (1990). The Lessons of Modern War, Volume II: The Iran-Iraq War. Westview Press, Boulder. *(sprawdzone 2026-11-15: istnienie)*
- Couzin, I. D.; Krause, J.; Franks, N. R.; Levin, S. A. (2005). Effective leadership and decision-making in animal groups on the move. Nature 433(7025): 513-516. doi:10.1038/nature03236 *(sprawdzone 2026-11-15: szczegóły)*
- Couzin, I. D.; Krause, J.; James, R.; Ruxton, G. D.; Franks, N. R. (2002). Collective memory and spatial sorting in animal groups. Journal of Theoretical Biology 218(1): 1-11. doi:10.1006/jtbi.2002.3065 *(sprawdzone 2026-11-15: szczegóły)*
- Cox, D. R. (1972). Regression models and life-tables. Journal of the Royal Statistical Society B 34(2): 187-220. *(sprawdzone 2026-11-15: szczegóły)*
- Craven, W. F.; Cate, J. L. (eds.) (1949). The Army Air Forces in World War II, vol. 2: Europe: Torch to Pointblank, August 1942 to December 1943. University of Chicago Press, Chicago. *(sprawdzone 2026-11-15: istnienie)*
- Craven, W. F.; Cate, J. L. (eds.) (1951). The Army Air Forces in World War II, vol. 3: Europe: Argument to V-E Day, January 1944 to May 1945. University of Chicago Press, Chicago. *(sprawdzone 2026-11-15: istnienie)*
- Csikszentmihalyi, M. (1990). Flow: The Psychology of Optimal Experience. Harper & Row, New York. *(sprawdzone 2026-11-15: szczegóły)*
- Curry, A. (2005). Agincourt: A New History. Tempus, Stroud. *(sprawdzone 2026-11-15: szczegóły)*
- Cutler, T. J. (1994). The Battle of Leyte Gulf, 23-26 October 1944. HarperCollins, New York. *(sprawdzone 2026-11-15: szczegóły)*
- D'Este, C. (1983). Decision in Normandy. Collins, London. *(sprawdzone 2026-11-15: istnienie)*
- Darley, J. M.; Latané, B. (1968). Bystander intervention in emergencies: diffusion of responsibility. Journal of Personality and Social Psychology 8(4, Pt. 1): 377-383. doi:10.1037/h0025589 *(sprawdzone 2026-11-15: szczegóły)*
- Davies, N. (2003). Rising '44: The Battle for Warsaw. Macmillan, London. *(sprawdzone 2026-11-15: szczegóły)*
- Davis, R. G. (1993). Carl A. Spaatz and the Air War in Europe. Center for Air Force History, Washington DC. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- DeChurch, L. A.; Mesmer-Magnus, J. R. (2010). The cognitive underpinnings of effective teamwork: a meta-analysis. Journal of Applied Psychology 95(1): 32-53. doi:10.1037/a0017328 *(sprawdzone 2026-11-15: szczegóły)*
- Decroos, T.; Bransen, L.; Van Haaren, J.; Davis, J. (2019). Actions speak louder than goals: valuing player actions in soccer. Proc. 25th ACM SIGKDD Conference on Knowledge Discovery and Data Mining (KDD 2019): 1851-1861. doi:10.1145/3292500.3330758 *(sprawdzone 2026-11-15: szczegóły)*
- Deitchman, S. J. (1962). A Lanchester model of guerrilla warfare. Operations Research 10(6): 818-827. doi:10.1287/opre.10.6.818 *(sprawdzone 2026-11-15: szczegóły)*
- Delbrück, H. (tłum. Renfroe, W. J.) (1990). History of the Art of War, vol. 4: The Dawn of Modern Warfare (orig. 1920). University of Nebraska Press, Lincoln. *(sprawdzone 2026-11-15: istnienie)*
- Department of the Air Force (2002). Counterair Operations (Air Force Doctrine Document 2-1.1). Headquarters US Air Force, Washington DC (DTIC ADA404825). doi:10.21236/ada404825 *(domena publiczna)* *(sprawdzone 2026-11-15: istnienie)*
- Desch, M. C. (2002). Democracy and victory: why regime type hardly matters. International Security 27(2): 5-47. *(sprawdzone 2026-11-15: szczegóły)*
- Diggle, P. J. (2013). Statistical Analysis of Spatial and Spatio-Temporal Point Patterns (3rd ed.). CRC Press, Boca Raton. *(sprawdzone 2026-11-15: szczegóły)*
- Doubler, M. D. (1994). Closing with the Enemy: How GIs Fought the War in Europe, 1944-1945. University Press of Kansas, Lawrence. *(sprawdzone 2026-11-15: szczegóły)*
- Doughty, R. A. (1990). The Breaking Point: Sedan and the Fall of France, 1940. Archon Books, Hamden. *(sprawdzone 2026-11-15: szczegóły)*
- Douhet, G. (tłum. Ferrari, D.) (1942). The Command of the Air (orig. 1921). Coward-McCann, New York; reprinted Office of Air Force History 1983. *(sprawdzone 2026-11-15: szczegóły)*
- Drachen, A.; Canossa, A. (2009). Analyzing spatial user behavior in computer games using geographic information systems. Proc. 13th International MindTrek Conference, ACM: 182-189. *(sprawdzone 2026-11-15: szczegóły)*
- Drachen, A.; Canossa, A.; Yannakakis, G. N. (2009). Player modeling using self-organization in Tomb Raider: Underworld. Proc. IEEE Symposium on Computational Intelligence and Games: 1-8. *(sprawdzone 2026-11-15: szczegóły)*
- Drachen, A.; Sifa, R.; Bauckhage, C.; Thurau, C. (2012). Guns, swords and data: clustering of player behavior in computer games in the wild. Proc. IEEE Conference on Computational Intelligence and Games (CIG 2012): 163-170. *(sprawdzone 2026-11-15: szczegóły)*
- Drachen, A.; Yancey, M.; Maguire, J.; Chu, D.; Wang, I. Y.; Mahlmann, T.; Schubert, M.; Klabjan, D. (2014). Skill-based differences in spatio-temporal team behaviour in Defence of the Ancients 2 (DotA 2). Proc. IEEE Games Media Entertainment (GEM 2014): 1-8. doi:10.1109/GEM.2014.7048109 *(sprawdzone 2026-11-15: istnienie)*
- Drea, E. J. (1981). Nomonhan: Japanese-Soviet Tactical Combat, 1939 (Leavenworth Papers 2). Combat Studies Institute, Fort Leavenworth. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Drury, J.; Cocking, C.; Reicher, S. (2009). Everyone for themselves? A comparative study of crowd solidarity among emergency survivors. British Journal of Social Psychology 48(3): 487-506. doi:10.1348/014466608X357893 *(sprawdzone 2026-11-15: szczegóły)*
- Duch, J.; Waitzman, J. S.; Amaral, L. A. N. (2010). Quantifying the performance of individual players in a team activity. PLoS ONE 5(6): e10937. doi:10.1371/journal.pone.0010937 *(sprawdzone 2026-11-15: szczegóły)*
- Dugan, J.; Stewart, C. (1962). Ploesti: The Great Ground-Air Battle of 1 August 1943. Random House, New York. *(sprawdzone 2026-11-15: szczegóły)*
- Dupuy, T. N. (1979). Numbers, Predictions and War. Bobbs-Merrill, Indianapolis. *(sprawdzone 2026-11-15: szczegóły)*
- Dupuy, T. N. (1987). Understanding War: History and Theory of Combat. Paragon House, New York. *(sprawdzone 2026-11-15: szczegóły)*
- Dupuy, T. N. (1990). Attrition: Forecasting Battle Casualties and Equipment Losses in Modern War. HERO Books, Fairfax VA. *(sprawdzone 2026-11-15: szczegóły)*
- Dyer, J. R. G.; Johansson, A.; Helbing, D.; Couzin, I. D.; Krause, J. (2009). Leadership, consensus decision making and collective behaviour in humans. Philosophical Transactions of the Royal Society B 364(1518): 781-789. doi:10.1098/rstb.2008.0233 *(sprawdzone 2026-11-15: szczegóły)*
- Echevarria, A. J. (2002). Clausewitz's Center of Gravity: Changing Our Warfighting Doctrine - Again!. Strategic Studies Institute, US Army War College, Carlisle PA. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Efron, B. (1979). Bootstrap methods: another look at the jackknife. Annals of Statistics 7(1): 1-26. *(sprawdzone 2026-11-15: szczegóły)*
- Efron, B.; Morris, C. (1975). Data analysis using Stein's estimator and its generalizations. Journal of the American Statistical Association 70(350): 311-319. doi:10.1080/01621459.1975.10479864 *(sprawdzone 2026-11-15: szczegóły)*
- Eggert, C.; Herrlich, M.; Smeddinck, J.; Malaka, R. (2015). Classification of player roles in the team-based multi-player game Dota 2. Entertainment Computing - ICEC 2015, LNCS 9353, Springer: 112-125. *(sprawdzone 2026-11-15: istnienie)*
- Elias, G. S.; Garfield, R.; Gutschera, K. R. (2012). Characteristics of Games. MIT Press, Cambridge MA. *(sprawdzone 2026-11-15: szczegóły)*
- Elo, A. E. (1978). The Rating of Chessplayers, Past and Present. Arco, New York. *(sprawdzone 2026-11-15: szczegóły)*
- Engel, J. H. (1954). A verification of Lanchester's law. Journal of the Operations Research Society of America 2(2): 163-171. doi:10.1287/opre.2.2.163 *(sprawdzone 2026-11-15: szczegóły)*
- Englund, P. (2003). The Battle That Shook Europe: Poltava and the Birth of the Russian Empire. I. B. Tauris, London. *(sprawdzone 2026-11-15: szczegóły)*
- Epstein, J. M. (1985). The Calculus of Conventional War: Dynamic Analysis without Lanchester Theory. Brookings Institution, Washington DC. *(sprawdzone 2026-11-15: szczegóły)*
- Epstein, J. M. (1989). The 3:1 rule, the adaptive dynamic model, and the future of security studies. International Security 13(4). *(sprawdzone 2026-11-15: szczegóły)*
- Erickson, J. (1975). The Road to Stalingrad: Stalin's War with Germany, Volume One. Harper & Row, New York. *(sprawdzone 2026-11-15: szczegóły)*
- ESPN (2016). Daigo and JWong: the legacy of Street Fighter's Moment 37. ESPN Esports. https://www.espn.com/espn/story/_/id/17391663 *(sprawdzone 2026-11-15: szczegóły)*
- Ethell, J.; Price, A. (1983). Air War South Atlantic. Sidgwick & Jackson, London. *(sprawdzone 2026-11-15: szczegóły)*
- Evans, D. C.; Peattie, M. R. (1997). Kaigun: Strategy, Tactics, and Technology in the Imperial Japanese Navy, 1887-1941. Naval Institute Press, Annapolis. *(sprawdzone 2026-11-15: szczegóły)*
- Fain, J. B. (1977). The Lanchester equations and historical warfare: an analysis of sixty World War II land engagements. History, Numbers and War 1(1), Historical Evaluation and Research Organization, Dunn Loring VA. *(sprawdzone 2026-11-15: szczegóły)*
- Fall, B. B. (1966). Hell in a Very Small Place: The Siege of Dien Bien Phu. Lippincott, Philadelphia. *(sprawdzone 2026-11-15: szczegóły)*
- Farrell, T. (2017). Unwinnable: Britain's War in Afghanistan, 2001-2014. Bodley Head, London. *(sprawdzone 2026-11-15: szczegóły)*
- Fernández, J.; Bornn, L. (2018). Wide open spaces: a statistical technique for measuring space creation in professional soccer. MIT Sloan Sports Analytics Conference 2018. *(sprawdzone 2026-11-15: szczegóły)*
- Fernández, J.; Bornn, L.; Cervone, D. (2021). A framework for the fine-grained evaluation of the instantaneous expected value of soccer possessions. Machine Learning 110(6): 1389-1427. doi:10.1007/s10994-021-05989-6 *(sprawdzone 2026-11-15: szczegóły)*
- Fischer, P.; Krueger, J. I.; Greitemeyer, T.; Vogrincic, C.; Kastenmüller, A.; Frey, D.; Heene, M.; Wicher, M.; Kainbacher, M. (2011). The bystander-effect: a meta-analytic review on bystander intervention in dangerous and non-dangerous emergencies. Psychological Bulletin 137(4): 517-537. doi:10.1037/a0023304 *(sprawdzone 2026-11-15: szczegóły)*
- Fisher, P. F. (1993). Algorithm and implementation uncertainty in viewshed analysis. International Journal of Geographical Information Systems 7(4): 331-347. *(sprawdzone 2026-11-15: szczegóły)*
- Fleiss, J. L. (1971). Measuring nominal scale agreement among many raters. Psychological Bulletin 76(5): 378-382. doi:10.1037/h0031619 *(sprawdzone 2026-11-15: szczegóły)*
- Fontenot, G.; Degen, E. J.; Tohn, D. (2004). On Point: The United States Army in Operation Iraqi Freedom. Combat Studies Institute Press, Fort Leavenworth. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Forty, G. (2004). Villers Bocage (Battle Zone Normandy). Sutton, Stroud. *(sprawdzone 2026-11-15: szczegóły)*
- Fox, A. C. (2019). "Cyborgs at Little Stalingrad": A Brief History of the Battles of the Donetsk Airport, 26 May 2014 to 21 January 2015 (Land Warfare Paper). Association of the United States Army, Institute of Land Warfare, Arlington. *(sprawdzone 2026-11-15: istnienie)*
- Fox, A. C.; Rossow, A. J. (2017). Making Sense of Russian Hybrid Warfare: A Brief Assessment of the Russo-Ukrainian War (Land Warfare Paper 112). Association of the United States Army, Institute of Land Warfare, Arlington. *(sprawdzone 2026-11-15: szczegóły)*
- Frank, R. B. (1990). Guadalcanal: The Definitive Account of the Landmark Battle. Random House, New York. *(sprawdzone 2026-11-15: szczegóły)*
- Franks, A.; Miller, A.; Bornn, L.; Goldsberry, K. (2015). Characterizing the spatial structure of defensive skill in professional basketball. Annals of Applied Statistics 9(1): 94-121. *(sprawdzone 2026-11-15: szczegóły)*
- Fricker, R. D. (1998). Attrition models of the Ardennes campaign. Naval Research Logistics 45(1): 1-22. https://www.rand.org/pubs/external_publications/EP19980204.html *(sprawdzone 2026-11-15: szczegóły)*
- Frieser, K.-H. (2005). The Blitzkrieg Legend: The 1940 Campaign in the West. Naval Institute Press, Annapolis. *(sprawdzone 2026-11-15: szczegóły)*
- Fruin, J. J. (1971). Pedestrian Planning and Design. Metropolitan Association of Urban Designers and Environmental Planners, New York. *(sprawdzone 2026-11-15: szczegóły)*
- Fuller, J. F. C. (1926). The Foundations of the Science of War. Hutchinson, London. *(sprawdzone 2026-11-15: szczegóły)*
- Fullerton, T.; Swain, C.; Hoffman, S. (2008). Game Design Workshop (2nd ed.). Morgan Kaufmann, Burlington. *(sprawdzone 2026-11-15: szczegóły)*
- Futrell, R. F. (1983). The United States Air Force in Korea, 1950-1953 (rev. ed.). Office of Air Force History, Washington DC. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Gabriel, R. A. (1984). Operation Peace for Galilee: The Israeli-PLO War in Lebanon. Hill & Wang, New York. *(sprawdzone 2026-11-15: szczegóły)*
- Gallup, A. C.; Hale, J. J.; Sumpter, D. J. T.; Garnier, S.; Kacelnik, A.; Krebs, J. R.; Couzin, I. D. (2012). Visual attention and the acquisition of information in human crowds. Proceedings of the National Academy of Sciences 109(19): 7245-7250. doi:10.1073/pnas.1116141109 *(sprawdzone 2026-11-15: szczegóły)*
- Galula, D. (1964). Counterinsurgency Warfare: Theory and Practice. Praeger, New York. *(sprawdzone 2026-11-15: szczegóły)*
- GameSpot (2014). Counter-Strike eSports team forfeits victory after using map exploit. GameSpot. https://www.gamespot.com/articles/counter-strike-esports-team-forfeits-victory-after/1100-6423866/ *(sprawdzone 2026-11-15: szczegóły)*
- Garcimartín, A.; Zuriguel, I.; Pastor, J. M.; Martín-Gómez, C.; Parisi, D. R. (2014). Experimental evidence of the "faster is slower" effect. Transportation Research Procedia 2: 760-767. doi:10.1016/j.trpro.2014.09.085 *(sprawdzone 2026-11-15: szczegóły)*
- Gayle, G. D. (1996). Bloody Beaches: The Marines at Peleliu. Marine Corps Historical Center, Washington DC. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Getis, A.; Ord, J. K. (1992). The analysis of spatial association by use of distance statistics. Geographical Analysis 24(3): 189-206. *(sprawdzone 2026-11-15: szczegóły)*
- Gilovich, T.; Vallone, R.; Tversky, A. (1985). The hot hand in basketball: on the misperception of random sequences. Cognitive Psychology 17(3): 295-314. doi:10.1016/0010-0285(85)90010-6 *(sprawdzone 2026-11-15: szczegóły)*
- Gini, C. (1912). Variabilità e mutabilità. Tipografia di Paolo Cuppini, Bologna. *(domena publiczna)* *(sprawdzone 2026-11-15: istnienie)*
- Glantz, D. M. (1983). August Storm: The Soviet 1945 Strategic Offensive in Manchuria (Leavenworth Papers 7). Combat Studies Institute, Fort Leavenworth. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Glantz, D. M. (1989). Soviet Military Deception in the Second World War. Frank Cass, London. *(sprawdzone 2026-11-15: szczegóły)*
- Glantz, D. M. (1991). From the Don to the Dnepr: Soviet Offensive Operations, December 1942-August 1943. Frank Cass, London. *(sprawdzone 2026-11-15: szczegóły)*
- Glantz, D. M. (1991). Soviet Military Operational Art: In Pursuit of Deep Battle. Frank Cass, London. *(sprawdzone 2026-11-15: szczegóły)*
- Glantz, D. M. (1998). Kharkov 1942: Anatomy of a Military Disaster Through Soviet Eyes. Ian Allan, Shepperton. *(sprawdzone 2026-11-15: szczegóły)*
- Glantz, D. M. (1999). Zhukov's Greatest Defeat: The Red Army's Epic Disaster in Operation Mars, 1942. University Press of Kansas, Lawrence. *(sprawdzone 2026-11-15: szczegóły)*
- Glantz, D. M. (2001). Barbarossa: Hitler's Invasion of Russia 1941. Tempus, Stroud. *(sprawdzone 2026-11-15: szczegóły)*
- Glantz, D. M.; House, J. M. (1995). When Titans Clashed: How the Red Army Stopped Hitler. University Press of Kansas, Lawrence. *(sprawdzone 2026-11-15: szczegóły)*
- Glantz, D. M.; House, J. M. (1999). The Battle of Kursk. University Press of Kansas, Lawrence. *(sprawdzone 2026-11-15: szczegóły)*
- Glenn, R. W. (1996). Combat in Hell: A Consideration of Constrained Urban Warfare (MR-780). RAND Corporation, Santa Monica. https://www.rand.org/pubs/monograph_reports/MR780.html *(sprawdzone 2026-11-15: szczegóły)*
- Glickman, M. E. (1999). Parameter estimation in large dynamic paired comparison experiments. Journal of the Royal Statistical Society C 48(3): 377-394. *(sprawdzone 2026-11-15: szczegóły)*
- Goldsberry, K. (2012). CourtVision: new visual and spatial analytics for the NBA. MIT Sloan Sports Analytics Conference 2012. *(sprawdzone 2026-11-15: szczegóły)*
- Goldsworthy, A. (2001). Cannae. Cassell, London. *(sprawdzone 2026-11-15: szczegóły)*
- Gordon, A. (1996). The Rules of the Game: Jutland and British Naval Command. John Murray, London. *(sprawdzone 2026-11-15: szczegóły)*
- Granovetter, M. S. (1973). The strength of weak ties. American Journal of Sociology 78(6): 1360-1380. doi:10.1086/225469 *(sprawdzone 2026-11-15: szczegóły)*
- Grau, L. W. (1997). Russian-manufactured armored vehicle vulnerability in urban combat: the Chechnya experience. Red Thrust Star (January 1997), Foreign Military Studies Office, Fort Leavenworth. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Grau, L. W. (ed.) (1996). The Bear Went Over the Mountain: Soviet Combat Tactics in Afghanistan. National Defense University Press, Washington DC. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Green, B.; Zwiebel, J. (2018). The hot-hand fallacy: cognitive mistakes or equilibrium adjustments? Evidence from Major League Baseball. Management Science 64(11): 5315-5348. doi:10.1287/mnsc.2017.2804 *(sprawdzone 2026-11-15: szczegóły)*
- Greene, J. A. (2005). The Guns of Independence: The Siege of Yorktown, 1781. Savas Beatie, New York. *(sprawdzone 2026-11-15: szczegóły)*
- Greene, J.; Massignani, A. (1998). The Naval War in the Mediterranean, 1940-1943. Chatham Publishing, London. *(sprawdzone 2026-11-15: szczegóły)*
- Grund, T. U. (2012). Network structure and team performance: the case of English Premier League soccer teams. Social Networks 34(4): 682-690. doi:10.1016/j.socnet.2012.08.004 *(sprawdzone 2026-11-15: szczegóły)*
- Gudmundsson, B. I. (1989). Stormtroop Tactics: Innovation in the German Army, 1914-1918. Praeger, New York. *(sprawdzone 2026-11-15: szczegóły)*
- Gudmundsson, J.; Horton, M. (2017). Spatio-temporal analysis of team sports. ACM Computing Surveys 50(2): article 22. https://arxiv.org/abs/1602.06994 *(sprawdzone 2026-11-15: szczegóły)*
- Guilmartin, J. F. (1974). Gunpowder and Galleys: Changing Technology and Mediterranean Warfare at Sea in the Sixteenth Century. Cambridge University Press, Cambridge. *(sprawdzone 2026-11-15: szczegóły)*
- Guo, C.; Pleiss, G.; Sun, Y.; Weinberger, K. Q. (2017). On calibration of modern neural networks. Proceedings of the 34th International Conference on Machine Learning (ICML 2017): 1321-1330. doi:10.48550/arXiv.1706.04599 *(sprawdzone 2026-11-15: szczegóły)*
- Güttler, C.; Johansson, T. D. (2003). Spatial principles of level-design in multi-player first-person shooters. Proc. 2nd Workshop on Network and System Support for Games (NetGames 2003), ACM: 158-170. *(sprawdzone 2026-11-15: szczegóły)*
- Haghani, M.; Sarvi, M. (2018). Crowd behaviour and motion: empirical methods. Transportation Research Part B: Methodological 107: 253-294. doi:10.1016/j.trb.2017.06.017 *(sprawdzone 2026-11-15: szczegóły)*
- Haldon, J. (2001). The Byzantine Wars. Tempus, Stroud. *(sprawdzone 2026-11-15: szczegóły)*
- Hall, E. T. (1966). The Hidden Dimension. Doubleday, Garden City NY. *(sprawdzone 2026-11-15: szczegóły)*
- Hallion, R. P. (1992). Storm over Iraq: Air Power and the Gulf War. Smithsonian Institution Press, Washington DC. *(sprawdzone 2026-11-15: szczegóły)*
- Hardesty, V. (1982). Red Phoenix: The Rise of Soviet Air Power, 1941-1945. Smithsonian Institution Press, Washington DC. *(sprawdzone 2026-11-15: szczegóły)*
- Hardesty, V.; Grinberg, I. (2012). Red Phoenix Rising: The Soviet Air Force in World War II. University Press of Kansas, Lawrence. *(sprawdzone 2026-11-15: szczegóły)*
- Hartley, D. S. (1995). A mathematical model of attrition data. Naval Research Logistics 42(4): 585-607. *(sprawdzone 2026-11-15: szczegóły)*
- Hartley, D. S.; Helmbold, R. L. (1995). Validating Lanchester's square law and other attrition models. Naval Research Logistics 42(4): 609-633. *(sprawdzone 2026-11-15: szczegóły)*
- Hastings, M. (1984). Overlord: D-Day and the Battle for Normandy. Michael Joseph, London. *(sprawdzone 2026-11-15: szczegóły)*
- Hastings, M.; Jenkins, S. (1983). The Battle for the Falklands. Michael Joseph, London. *(sprawdzone 2026-11-15: szczegóły)*
- Hayakawa, N.; Shimari, K.; Yamasaki, K.; Hoshikawa, H.; Tsuchida, R.; Matsumoto, K. (2025). Round outcome prediction in VALORANT using tactical features from video analysis. IEEE Conference on Games (CoG) 2025: 1-4. doi:10.1109/CoG64752.2025.11114177 *(sprawdzone 2026-11-15: szczegóły)*
- Hayward, J. S. A. (1998). Stopped at Stalingrad: The Luftwaffe and Hitler's Defeat in the East, 1942-1943. University Press of Kansas, Lawrence. *(sprawdzone 2026-11-15: szczegóły)*
- Headquarters, Department of the Army (1979). FM 90-10 Military Operations on Urbanized Terrain (MOUT). US Army, Washington DC. *(domena publiczna)* *(sprawdzone 2026-11-15: istnienie)*
- Headquarters, Department of the Army (1982). FM 100-5 Operations. US Army, Washington DC. *(domena publiczna)* *(sprawdzone 2026-11-15: istnienie)*
- Headquarters, Department of the Army (1990). FM 5-33 Terrain Analysis. US Army, Washington DC. *(domena publiczna)* *(sprawdzone 2026-11-15: istnienie)*
- Headquarters, Department of the Army (1994). FM 34-130 Intelligence Preparation of the Battlefield. US Army, Washington DC. *(domena publiczna)* *(sprawdzone 2026-11-15: istnienie)*
- Headquarters, Department of the Army (2002). FM 3-06.11 Combined Arms Operations in Urban Terrain. Department of the Army, Washington DC (28 February 2002). https://www.globalsecurity.org/military/library/policy/army/fm/3-06-11/index.html *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Headquarters, Department of the Army (2006). FM 3-06 Urban Operations. US Army, Washington DC. *(domena publiczna)* *(sprawdzone 2026-11-15: istnienie)*
- Headquarters, Department of the Army (2006). FM 3-24 Counterinsurgency. US Army, Washington DC. *(domena publiczna)* *(sprawdzone 2026-11-15: istnienie)*
- Headquarters, Department of the Army (2007). FM 3-21.8 The Infantry Rifle Platoon and Squad. US Army, Washington DC. *(domena publiczna)* *(sprawdzone 2026-11-15: istnienie)*
- Headquarters, Department of the Army (2007). FM 3-20.15 Tank Platoon. US Army, Washington DC. *(domena publiczna)* *(sprawdzone 2026-11-15: istnienie)*
- Headquarters, Department of the Army (2011). ATTP 3-06.11 Combined Arms Operations in Urban Terrain. Department of the Army, Washington DC (10 June 2011). https://archive.org/details/attp-3-06.11-combined-arms-operations-in-urban-terrain-2011 *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Headquarters, Department of the Army (2013). FM 3-90-1 Offense and Defense, Volume 1. US Army, Washington DC. *(domena publiczna)* *(sprawdzone 2026-11-15: istnienie)*
- Headquarters, Department of the Army (2013). FM 3-90-2 Reconnaissance, Security, and Tactical Enabling Tasks, Volume 2. US Army, Washington DC. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Headquarters, Department of the Army (2016). ATP 3-21.8 Infantry Platoon and Squad. US Army, Washington DC. *(domena publiczna)* *(sprawdzone 2026-11-15: istnienie)*
- Headquarters, Department of the Army (2019). ATP 2-01.3 Intelligence Preparation of the Battlefield. US Army, Washington DC. https://armypubs.army.mil *(domena publiczna)* *(sprawdzone 2026-11-15: istnienie)*
- Headquarters, Department of the Army (2022). FM 3-0 Operations. US Army, Washington DC. https://armypubs.army.mil *(domena publiczna)* *(sprawdzone 2026-11-15: istnienie)*
- Headquarters, Department of the Army (2023). FM 3-90 Tactics. US Army, Washington DC. https://armypubs.army.mil *(domena publiczna)* *(sprawdzone 2026-11-15: istnienie)*
- Headquarters, Department of the Army; Marine Corps Tactics and Operations Group (2022). ATP 3-06 / MCTP 12-10B Urban Operations. Department of the Army, Washington DC (21 July 2022). https://archive.org/details/arn-35826-atp-3-06-000-web-1 *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Headquarters, US Marine Corps (1998). MCWP 3-35.3 Military Operations on Urbanized Terrain (MOUT). Department of the Navy, Washington DC (26 April 1998). https://archive.org/details/milmanual-mcwp-3-35.3-military-operations-on-urbanized-terrain-mout *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Healy, M. (1993). Qadesh 1300 BC: Clash of the Warrior Kings (Campaign 22). Osprey, London. *(sprawdzone 2026-11-15: szczegóły)*
- Heinl, R. D. (1968). Victory at High Tide: The Inchon-Seoul Campaign. Lippincott, Philadelphia. *(sprawdzone 2026-11-15: szczegóły)*
- Helbing, D.; Buzna, L.; Johansson, A.; Werner, T. (2005). Self-organized pedestrian crowd dynamics: experiments, simulations, and design solutions. Transportation Science 39(1): 1-24. doi:10.1287/trsc.1040.0108 *(sprawdzone 2026-11-15: szczegóły)*
- Helbing, D.; Farkas, I.; Vicsek, T. (2000). Simulating dynamical features of escape panic. Nature 407(6803): 487-490. doi:10.1038/35035023 *(sprawdzone 2026-11-15: szczegóły)*
- Helbing, D.; Johansson, A.; Al-Abideen, H. Z. (2007). Dynamics of crowd disasters: an empirical study. Physical Review E 75(4): 046109. doi:10.1103/PhysRevE.75.046109 *(sprawdzone 2026-11-15: szczegóły)*
- Helbing, D.; Keltsch, J.; Molnár, P. (1997). Modelling the evolution of human trail systems. Nature 388(6637): 47-50. doi:10.1038/40353 *(sprawdzone 2026-11-15: szczegóły)*
- Helbing, D.; Molnár, P. (1995). Social force model for pedestrian dynamics. Physical Review E 51(5): 4282-4286. doi:10.1103/PhysRevE.51.4282 *(sprawdzone 2026-11-15: szczegóły)*
- Helmbold, R. L. (1995). Rates of advance in land combat operations. Naval Research Logistics 42(4): 635-669. *(sprawdzone 2026-11-15: szczegóły)*
- Herbrich, R.; Minka, T.; Graepel, T. (2007). TrueSkill: a Bayesian skill rating system. Advances in Neural Information Processing Systems 19, MIT Press: 569-576. *(sprawdzone 2026-11-15: istnienie)*
- Hermes, W. G. (1966). Truce Tent and Fighting Front (US Army in the Korean War). Office of the Chief of Military History, Washington DC. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Herodotus (tłum. Rawlinson, G.) (1858). The History of Herodotus. John Murray, London. https://www.gutenberg.org/ebooks/2707 *(domena publiczna)* *(sprawdzone 2026-11-15: istnienie)*
- Herzog, C. (1975). The War of Atonement. Weidenfeld & Nicolson, London. *(sprawdzone 2026-11-15: szczegóły)*
- Herzog, C. (1982). The Arab-Israeli Wars: War and Peace in the Middle East. Random House, New York. *(sprawdzone 2026-11-15: szczegóły)*
- Hillier, B.; Hanson, J. (1984). The Social Logic of Space. Cambridge University Press, Cambridge. *(sprawdzone 2026-11-15: szczegóły)*
- Hinh, N. D. (1979). Lam Son 719 (Indochina Monographs). US Army Center of Military History, Washington DC. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Hodge, V. J.; Devlin, S.; Sephton, N.; Block, F.; Cowling, P. I.; Drachen, A. (2021). Win prediction in multiplayer esports: live professional match prediction. IEEE Transactions on Games 13(4): 368-379. *(sprawdzone 2026-11-15: szczegóły)*
- Hoerl, A. E.; Kennard, R. W. (1970). Ridge regression: biased estimation for nonorthogonal problems. Technometrics 12(1): 55-67. doi:10.1080/00401706.1970.10488634 *(sprawdzone 2026-11-15: szczegóły)*
- Holland, J. (2003). Fortress Malta: An Island Under Siege, 1940-1943. Orion, London. *(sprawdzone 2026-11-15: szczegóły)*
- Hoobler, N.; Humphreys, G.; Agrawala, M. (2004). Visualizing competitive behaviors in multi-user virtual environments. Proc. IEEE Visualization 2004: 163-170. *(sprawdzone 2026-11-15: szczegóły)*
- Horne, A. (1962). The Price of Glory: Verdun 1916. Macmillan, London. *(sprawdzone 2026-11-15: szczegóły)*
- Horne, A. (1977). A Savage War of Peace: Algeria 1954-1962. Macmillan, London. *(sprawdzone 2026-11-15: szczegóły)*
- Hornfischer, J. D. (2004). The Last Stand of the Tin Can Sailors. Bantam, New York. *(sprawdzone 2026-11-15: szczegóły)*
- Hornfischer, J. D. (2011). Neptune's Inferno: The U.S. Navy at Guadalcanal. Bantam, New York. *(sprawdzone 2026-11-15: szczegóły)*
- House, J. M. (1984). Toward Combined Arms Warfare: A Survey of 20th-Century Tactics, Doctrine, and Organization. Combat Studies Institute, Fort Leavenworth. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Howard, M. (1961). The Franco-Prussian War: The German Invasion of France, 1870-1871. Rupert Hart-Davis, London. *(sprawdzone 2026-11-15: szczegóły)*
- Hughes, W. P. (1995). A salvo model of warships in missile combat used to evaluate their staying power. Naval Research Logistics 42(2): 267-289. *(sprawdzone 2026-11-15: szczegóły)*
- Hughes, W. P. (2000). Fleet Tactics and Coastal Combat (2nd ed.). Naval Institute Press, Annapolis. *(sprawdzone 2026-11-15: szczegóły)*
- Hughes, W. P.; Girrier, R. P. (2018). Fleet Tactics and Naval Operations (3rd ed.). Naval Institute Press, Annapolis. *(sprawdzone 2026-11-15: szczegóły)*
- Hullett, K.; Whitehead, J. (2010). Design patterns in FPS levels. Proc. Foundations of Digital Games (FDG 2010), ACM: 78-85. *(sprawdzone 2026-11-15: szczegóły)*
- Ibrahim, F.; Feildboy, E.; Huber, Y.; Nagy, D.; Hennig, J.; Herzberg, P. Y. (2024). Enhancing close quarters battle performance: the effect of a compact training on the tactical performance and stress response of non-specialized and special forces. Journal of Police and Criminal Psychology. doi:10.1007/s11896-024-09699-2 *(sprawdzone 2026-11-15: szczegóły)*
- Isserson, G. S. (tłum. Menning, B. W.) (2013). The Evolution of Operational Art (orig. 1936-37). Combat Studies Institute Press, Fort Leavenworth. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Johnson, D. E.; Markel, M. W.; Shannon, B. (2013). The 2008 Battle of Sadr City: Reimagining Urban Combat (RR-160-A). RAND Corporation, Santa Monica. *(sprawdzone 2026-11-15: szczegóły)*
- Johnson, I. R.; MacKay, N. J. (2011). Lanchester models and the Battle of Britain. Naval Research Logistics 58(3): 210-222. doi:10.1002/nav.20328 *(sprawdzone 2026-11-15: szczegóły)*
- Joint Chiefs of Staff (2017). JP 3-01 Countering Air and Missile Threats. US Joint Staff, Washington DC. *(domena publiczna)* *(sprawdzone 2026-11-15: istnienie)*
- Joint Chiefs of Staff (2018). JP 3-60 Joint Targeting. US Joint Staff, Washington DC. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Joint Chiefs of Staff (2019). JP 3-09.3 Close Air Support. US Joint Staff, Washington DC. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Joint Chiefs of Staff (2020). JP 5-0 Joint Planning. US Joint Staff, Washington DC. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Jomini, A.-H. de (tłum. Mendell, G. H.; Craighill, W. P.) (1862). The Art of War. J. B. Lippincott, Philadelphia. https://www.gutenberg.org/ebooks/13549 *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Juul, J. (2005). Half-Real: Video Games between Real Rules and Fictional Worlds. MIT Press, Cambridge MA. *(sprawdzone 2026-11-15: szczegóły)*
- Kahalani, A. (1984). The Heights of Courage: A Tank Leader's War on the Golan. Greenwood Press, Westport. *(sprawdzone 2026-11-15: szczegóły)*
- Kahneman, D.; Tversky, A. (1979). Prospect theory: an analysis of decision under risk. Econometrica 47(2): 263-291. doi:10.2307/1914185 *(sprawdzone 2026-11-15: szczegóły)*
- Kaplan, E. L.; Meier, P. (1958). Nonparametric estimation from incomplete observations. Journal of the American Statistical Association 53(282): 457-481. *(sprawdzone 2026-11-15: szczegóły)*
- Karau, S. J.; Williams, K. D. (1993). Social loafing: a meta-analytic review and theoretical integration. Journal of Personality and Social Psychology 65(4): 681-706. doi:10.1037/0022-3514.65.4.681 *(sprawdzone 2026-11-15: szczegóły)*
- Katona, A.; Spick, R.; Hodge, V. J.; Demediuk, S.; Block, F.; Drachen, A.; Walker, J. A. (2019). Time to die: death prediction in Dota 2 using deep learning. Proc. IEEE Conference on Games (CoG 2019): 1-8. *(sprawdzone 2026-11-15: istnienie)*
- Keaney, T. A.; Cohen, E. A. (1993). Gulf War Air Power Survey: Summary Report. US Government Printing Office, Washington DC. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Kendall, M. G. (1938). A new measure of rank correlation. Biometrika 30(1/2): 81-93. *(sprawdzone 2026-11-15: szczegóły)*
- Kennedy, H. (2007). The Great Arab Conquests: How the Spread of Islam Changed the World We Live In. Weidenfeld & Nicolson, London. *(sprawdzone 2026-11-15: szczegóły)*
- Kennedy, L. (1974). Pursuit: The Chase and Sinking of the Bismarck. Collins, London. *(sprawdzone 2026-11-15: szczegóły)*
- Ketchum, R. M. (1997). Saratoga: Turning Point of America's Revolutionary War. Henry Holt, New York. *(sprawdzone 2026-11-15: szczegóły)*
- Kim, J. H.; Gunn, D. V.; Schuh, E.; Phillips, B. C.; Pagulayan, R. J.; Wixon, D. (2008). Tracking real-time user experience (TRUE): a comprehensive instrumentation solution for complex systems. Proc. CHI 2008, ACM: 443-452. *(sprawdzone 2026-11-15: szczegóły)*
- Kim, Y. J.; Engel, D.; Woolley, A. W.; Lin, J. Y. T.; McArthur, N.; Malone, T. W. (2017). What makes a strong team? Using collective intelligence to predict team performance in League of Legends. Proceedings of the 2017 ACM Conference on Computer Supported Cooperative Work and Social Computing (CSCW): 2316-2329. doi:10.1145/2998181.2998185 *(sprawdzone 2026-11-15: szczegóły)*
- King, A. (2013). The Combat Soldier: Infantry Tactics and Cohesion in the Twentieth and Twenty-First Centuries. Oxford University Press, Oxford. *(sprawdzone 2026-11-15: szczegóły)*
- Kirby, M. W. (2003). Operational Research in War and Peace: The British Experience from the 1930s to 1970. Imperial College Press, London. *(sprawdzone 2026-11-15: szczegóły)*
- Knight, I. (2002). Isandlwana 1879: The Great Zulu Victory. Osprey, Oxford. *(sprawdzone 2026-11-15: szczegóły)*
- Knox, E. G. (1964). The detection of space-time interactions. Journal of the Royal Statistical Society C 13(1): 25-30. *(sprawdzone 2026-11-15: szczegóły)*
- Koopman, B. O. (1946). Search and Screening (OEG Report 56). Operations Evaluation Group, Office of the Chief of Naval Operations, Washington DC. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Koster, R. (2004). A Theory of Fun for Game Design. Paraglyph Press, Scottsdale. *(sprawdzone 2026-11-15: szczegóły)*
- Krause, J.; Ruxton, G. D.; Krause, S. (2010). Swarm intelligence in animals and humans. Trends in Ecology & Evolution 25(1): 28-34. doi:10.1016/j.tree.2009.06.016 *(sprawdzone 2026-11-15: szczegóły)*
- Krause, M. D. (1991). The Battle of 73 Easting, 26 February 1991: A Historical Introduction to a Simulation. US Army Center of Military History / DARPA, Washington DC. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Kremers, R. (2009). Level Design: Concept, Theory, and Practice. A K Peters, Wellesley. *(sprawdzone 2026-11-15: szczegóły)*
- Krepinevich, A.; Watts, B.; Work, R. (2003). Meeting the Anti-Access and Area-Denial Challenge. Center for Strategic and Budgetary Assessments, Washington DC. *(sprawdzone 2026-11-15: istnienie)*
- Kress, M. (2012). Modeling armed conflicts. Science 336(6083): 865-869. *(sprawdzone 2026-11-15: szczegóły)*
- Kugler, R. (2007). Operation Anaconda in Afghanistan: A Case Study of Adaptation in Battle (Case Studies in Defense Transformation 5). Center for Technology and National Security Policy, National Defense University, Washington DC. *(domena publiczna)* *(sprawdzone 2026-11-15: istnienie)*
- Kulldorff, M. (1997). A spatial scan statistic. Communications in Statistics - Theory and Methods 26(6): 1481-1496. *(sprawdzone 2026-11-15: szczegóły)*
- Kuperman, A. J. (1999). The Stinger missile and U.S. intervention in Afghanistan. Political Science Quarterly 114(2): 219-263. *(sprawdzone 2026-11-15: szczegóły)*
- Lambeth, B. S. (1984). Moscow's Lessons from the 1982 Lebanon Air War. RAND Corporation, Santa Monica. *(sprawdzone 2026-11-15: szczegóły)*
- Lambeth, B. S. (2001). NATO's Air War for Kosovo: A Strategic and Operational Assessment (MR-1365-AF). RAND Corporation, Santa Monica. https://www.rand.org/pubs/monograph_reports/MR1365.html *(sprawdzone 2026-11-15: szczegóły)*
- Lanchester, F. W. (1916). Aircraft in Warfare: The Dawn of the Fourth Arm. Constable, London. https://archive.org/details/aircraftinwarfar00lancrich *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Latané, B.; Williams, K.; Harkins, S. (1979). Many hands make light the work: the causes and consequences of social loafing. Journal of Personality and Social Psychology 37(6): 822-832. doi:10.1037/0022-3514.37.6.822 *(sprawdzone 2026-11-15: szczegóły)*
- Lavery, B. (1998). Nelson and the Nile: The Naval War Against Bonaparte, 1798. Chatham Publishing, London. *(sprawdzone 2026-11-15: szczegóły)*
- Lawrence, C. A. (2015). Kursk: The Battle of Prokhorovka. Aberdeen Books, Sheridan CO. *(sprawdzone 2026-11-15: szczegóły)*
- Lawrence, C. A. (2017). War by Numbers: Understanding Conventional Combat. Potomac Books, Lincoln NE. *(sprawdzone 2026-11-15: szczegóły)*
- Lawrence, T. E. (1920). The evolution of a revolt. Army Quarterly 1(1): 55-69. *(domena publiczna)* *(sprawdzone 2026-11-15: istnienie)*
- Lee, S. W. K.; Chang, R. K. C. (2017). On "shot around a corner" in first-person shooter games. 15th Annual Workshop on Network and Systems Support for Games (NetGames 2017): 1-6. doi:10.1109/NetGames.2017.7991545 *(sprawdzone 2026-11-15: szczegóły)*
- Liddell Hart, B. H. (1954). Strategy: The Indirect Approach. Faber & Faber, London. *(sprawdzone 2026-11-15: istnienie)*
- Liu, S.; Xu, X.; Claypool, M. (2022). A survey and taxonomy of latency compensation techniques for network computer games. ACM Computing Surveys 54(11s): 1-34. doi:10.1145/3519023 *(sprawdzone 2026-11-15: szczegóły)*
- Livy (tłum. Roberts, W. M.) (1905). History of Rome. J. M. Dent (Everyman's Library), London. *(domena publiczna)* *(sprawdzone 2026-11-15: istnienie)*
- Lloyd, M. (1967). Mean crowding. Journal of Animal Ecology 36(1): 1-30. *(sprawdzone 2026-11-15: szczegóły)*
- Lock, D.; Nettleton, D. (2014). Using random forests to estimate win probability before each play of an NFL game. Journal of Quantitative Analysis in Sports 10(2). doi:10.1515/jqas-2013-0100 *(sprawdzone 2026-11-15: szczegóły)*
- Lofgren, E. T.; Fefferman, N. H. (2007). The untapped potential of virtual game worlds to shed light on real world epidemics. The Lancet Infectious Diseases 7(9): 625-629. doi:10.1016/S1473-3099(07)70212-8 *(sprawdzone 2026-11-15: szczegóły)*
- Lorenz, J.; Rauhut, H.; Schweitzer, F.; Helbing, D. (2011). How social influence can undermine the wisdom of crowd effect. Proceedings of the National Academy of Sciences 108(22): 9020-9025. doi:10.1073/pnas.1008636108 *(sprawdzone 2026-11-15: szczegóły)*
- Lucas, T. W.; Dinges, J. A. (2004). The effect of battle circumstances on fitting Lanchester equations to the Battle of Kursk. Military Operations Research 9(2): 17-30. *(sprawdzone 2026-11-15: istnienie)*
- Lucas, T. W.; Turkes, T. (2004). Fitting Lanchester equations to the battles of Kursk and Ardennes. Naval Research Logistics 51(1): 95-116. doi:10.1002/nav.10101 *(sprawdzone 2026-11-15: szczegóły)*
- Lucey, P.; Bialkowski, A.; Carr, P.; Morgan, S.; Matthews, I.; Sheikh, Y. (2013). Representing and discovering adversarial team behaviors using player roles. Proc. IEEE Conference on Computer Vision and Pattern Recognition (CVPR 2013): 2706-2713. *(sprawdzone 2026-11-15: szczegóły)*
- Lundstrom, J. B. (1984). The First Team: Pacific Naval Air Combat from Pearl Harbor to Midway. Naval Institute Press, Annapolis. *(sprawdzone 2026-11-15: szczegóły)*
- Lundstrom, J. B. (1994). The First Team and the Guadalcanal Campaign: Naval Fighter Combat from August to November 1942. Naval Institute Press, Annapolis. *(sprawdzone 2026-11-15: szczegóły)*
- Lupfer, T. T. (1981). The Dynamics of Doctrine: The Changes in German Tactical Doctrine During the First World War (Leavenworth Papers 4). Combat Studies Institute, Fort Leavenworth. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Lynch, K. (1960). The Image of the City. MIT Press, Cambridge MA. *(sprawdzone 2026-11-15: szczegóły)*
- Macdonald, B. (2012). Adjusted plus-minus for NHL players using ridge regression with goals, shots, Fenwick, and Corsi. Journal of Quantitative Analysis in Sports 8(3). doi:10.1515/1559-0410.1447 *(sprawdzone 2026-11-15: szczegóły)*
- MacDonald, C. B. (1963). The Siegfried Line Campaign (US Army in World War II). Office of the Chief of Military History, Washington DC. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- MacDonald, C. B. (1985). A Time for Trumpets: The Untold Story of the Battle of the Bulge. William Morrow, New York. *(sprawdzone 2026-11-15: szczegóły)*
- MacGarrigle, G. L. (1998). Taking the Offensive: October 1966 to October 1967 (US Army in Vietnam). Center of Military History, Washington DC. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Mahan, A. T. (1890). The Influence of Sea Power upon History, 1660-1783. Little, Brown, Boston. https://www.gutenberg.org/ebooks/13529 *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Mahan, A. T. (1897). The Life of Nelson: The Embodiment of the Sea Power of Great Britain. Little, Brown, Boston. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Makarov, I.; Savostyanov, D.; Litvyakov, B.; Ignatov, D. I. (2018). Predicting winning team and probabilistic ratings in Dota 2 and Counter-Strike: Global Offensive video games. Analysis of Images, Social Networks and Texts (AIST 2017), LNCS 10716, Springer: 183-196. *(sprawdzone 2026-11-15: istnienie)*
- Mangel, M.; Samaniego, F. J. (1984). Abraham Wald's work on aircraft survivability. Journal of the American Statistical Association 79(386): 259-267. *(sprawdzone 2026-11-15: szczegóły)*
- Mann, H. B.; Whitney, D. R. (1947). On a test of whether one of two random variables is stochastically larger than the other. Annals of Mathematical Statistics 18(1): 50-60. *(sprawdzone 2026-11-15: szczegóły)*
- Manski, C. F. (1993). Identification of endogenous social effects: the reflection problem. Review of Economic Studies 60(3): 531-542. doi:10.2307/2298123 *(sprawdzone 2026-11-15: szczegóły)*
- Manstein, E. von (1958). Lost Victories. Methuen, London. *(sprawdzone 2026-11-15: szczegóły)*
- Mao Tse-tung (tłum. Griffith, S. B.) (1961). On Guerrilla Warfare (orig. 1937). Praeger, New York. *(sprawdzone 2026-11-15: istnienie)*
- Marshall, S. L. A. (1947). Men Against Fire: The Problem of Battle Command in Future War. William Morrow, New York. *(sprawdzone 2026-11-15: szczegóły)*
- Marshall, S. L. A. (1956). Pork Chop Hill: The American Fighting Man in Action, Korea, Spring 1953. William Morrow, New York. *(sprawdzone 2026-11-15: szczegóły)*
- Martin, C.; Parker, G. (1988). The Spanish Armada. Hamish Hamilton, London. *(sprawdzone 2026-11-15: szczegóły)*
- Matthews, M. M. (2006). Operation AL FAJR: A Study in Army and Marine Corps Joint Operations. Combat Studies Institute Press, Fort Leavenworth. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Matthews, M. M. (2008). We Were Caught Unprepared: The 2006 Hezbollah-Israeli War (Long War Series Occasional Paper 26). Combat Studies Institute Press, Fort Leavenworth. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Mattingly, G. (1959). The Armada. Houghton Mifflin, Boston. *(sprawdzone 2026-11-15: szczegóły)*
- May, E. R. (2000). Strange Victory: Hitler's Conquest of France. Hill & Wang, New York. *(sprawdzone 2026-11-15: szczegóły)*
- Maymin, P. Z. (2021). Smart kills and worthless deaths: eSports analytics for League of Legends. Journal of Quantitative Analysis in Sports 17(1): 11-27. doi:10.1515/jqas-2019-0096 *(sprawdzone 2026-11-15: szczegóły)*
- McCloskey, J. F. (1987). The beginnings of operations research: 1934-1941. Operations Research 35(1): 143-152. *(sprawdzone 2026-11-15: szczegóły)*
- McCullagh, P.; Nelder, J. A. (1989). Generalized Linear Models (2nd ed.). Chapman & Hall, London. *(sprawdzone 2026-11-15: szczegóły)*
- McFarland, S. L.; Newton, W. P. (1991). To Command the Sky: The Battle for Air Superiority over Germany, 1942-1944. Smithsonian Institution Press, Washington DC. *(sprawdzone 2026-11-15: szczegóły)*
- Mearsheimer, J. J. (1989). Assessing the conventional balance: the 3:1 rule and its critics. International Security 13(4): 54-89 (Spring 1989). doi:10.2307/2538780 *(sprawdzone 2026-11-15: szczegóły)*
- Medler, B.; John, M.; Lane, J. (2011). Data Cracker: developing a visual game analytic tool for analyzing online gameplay. Proc. CHI 2011, ACM: 2365-2374. *(sprawdzone 2026-11-15: istnienie)*
- Michaels, J. (2010). A Chance in Hell: The Men Who Triumphed over Iraq's Deadliest City and Turned the Tide of War. St. Martin's Press, New York. *(sprawdzone 2026-11-15: szczegóły)*
- Michel, M. L. (1997). Clashes: Air Combat over North Vietnam 1965-1972. Naval Institute Press, Annapolis. *(sprawdzone 2026-11-15: szczegóły)*
- Michel, M. L. (2002). The Eleven Days of Christmas: America's Last Vietnam Battle. Encounter Books, San Francisco. *(sprawdzone 2026-11-15: szczegóły)*
- Middlebrook, M. (1971). The First Day on the Somme. Allen Lane, London. *(sprawdzone 2026-11-15: szczegóły)*
- Middlebrook, M. (1973). The Nuremberg Raid, 30-31 March 1944. Allen Lane, London. *(sprawdzone 2026-11-15: szczegóły)*
- Middlebrook, M. (1980). The Battle of Hamburg: Allied Bomber Forces Against a German City in 1943. Allen Lane, London. *(sprawdzone 2026-11-15: szczegóły)*
- Middlebrook, M. (1983). The Schweinfurt-Regensburg Mission. Allen Lane, London. *(sprawdzone 2026-11-15: szczegóły)*
- Middlebrook, M.; Mahoney, P. (1977). Battleship: The Loss of the Prince of Wales and the Repulse. Allen Lane, London. *(sprawdzone 2026-11-15: szczegóły)*
- Milgram, S.; Bickman, L.; Berkowitz, L. (1969). Note on the drawing power of crowds of different size. Journal of Personality and Social Psychology 13(2): 79-82. doi:10.1037/h0028070 *(sprawdzone 2026-11-15: szczegóły)*
- Miller, A.; Bornn, L.; Adams, R.; Goldsberry, K. (2014). Factorized point process intensities: a spatial analysis of professional basketball. Proc. 31st International Conference on Machine Learning (ICML 2014), PMLR 32: 235-243. *(sprawdzone 2026-11-15: szczegóły)*
- Miller, J. B.; Sanjurjo, A. (2018). Surprised by the hot hand fallacy? A truth in the law of small numbers. Econometrica 86(6): 2019-2047. doi:10.3982/ECTA14943 *(sprawdzone 2026-11-15: szczegóły)*
- Miller, J. L.; Crowcroft, J. (2009). Avatar movement in World of Warcraft battlegrounds. Proc. 8th Workshop on Network and System Support for Games (NetGames 2009), IEEE: 1-6. doi:10.1109/NETGAMES.2009.5446226 *(sprawdzone 2026-11-15: istnienie)*
- Minka, T.; Cleven, R.; Zaykov, Y. (2018). TrueSkill 2: an improved Bayesian skill rating system (MSR-TR-2018-8). Microsoft Research, Redmond. *(sprawdzone 2026-11-15: istnienie)*
- Mohammed, S.; Ferzandi, L.; Hamilton, K. (2010). Metaphor no more: a 15-year review of the team mental model construct. Journal of Management 36(4): 876-910. doi:10.1177/0149206309356804 *(sprawdzone 2026-11-15: szczegóły)*
- Montross, L.; Canzona, N. A. (1957). The Chosin Reservoir Campaign (US Marine Operations in Korea 1950-1953, Volume III). Historical Branch, US Marine Corps, Washington DC. *(domena publiczna)* *(sprawdzone 2026-11-15: istnienie)*
- Moore, H. G.; Galloway, J. L. (1992). We Were Soldiers Once... and Young. Random House, New York. *(sprawdzone 2026-11-15: szczegóły)*
- Moran, P. A. P. (1950). Notes on continuous stochastic phenomena. Biometrika 37(1/2): 17-23. *(sprawdzone 2026-11-15: szczegóły)*
- Morillo, S. (ed.) (1996). The Battle of Hastings: Sources and Interpretations. Boydell Press, Woodbridge. *(sprawdzone 2026-11-15: szczegóły)*
- Morison, S. E. (1948). The Rising Sun in the Pacific, 1931-April 1942 (History of US Naval Operations in WWII, vol. 3). Little, Brown, Boston. *(sprawdzone 2026-11-15: szczegóły)*
- Morison, S. E. (1949). Coral Sea, Midway and Submarine Actions, May 1942-August 1942 (History of US Naval Operations in WWII, vol. 4). Little, Brown, Boston. *(sprawdzone 2026-11-15: istnienie)*
- Morison, S. E. (1949). The Struggle for Guadalcanal, August 1942-February 1943 (History of US Naval Operations in WWII, vol. 5). Little, Brown, Boston. *(sprawdzone 2026-11-15: istnienie)*
- Morison, S. E. (1950). Breaking the Bismarcks Barrier, 22 July 1942-1 May 1944 (History of US Naval Operations in WWII, vol. 6). Little, Brown, Boston. *(sprawdzone 2026-11-15: szczegóły)*
- Morison, S. E. (1953). New Guinea and the Marianas, March 1944-August 1944 (History of US Naval Operations in WWII, vol. 8). Little, Brown, Boston. *(sprawdzone 2026-11-15: szczegóły)*
- Morison, S. E. (1958). Leyte, June 1944-January 1945 (History of US Naval Operations in WWII, vol. 12). Little, Brown, Boston. *(sprawdzone 2026-11-15: istnienie)*
- Morison, S. E. (1960). Victory in the Pacific, 1945 (History of US Naval Operations in WWII, vol. 14). Little, Brown, Boston. *(sprawdzone 2026-11-15: szczegóły)*
- Morse, P. M.; Kimball, G. E. (1951). Methods of Operations Research. Technology Press of MIT and John Wiley & Sons, New York, 1951. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Moussaïd, M.; Helbing, D.; Theraulaz, G. (2011). How simple rules determine pedestrian behavior and crowd disasters. Proceedings of the National Academy of Sciences 108(17): 6884-6888. doi:10.1073/pnas.1016507108 *(sprawdzone 2026-11-15: szczegóły)*
- Moussaïd, M.; Perozo, N.; Garnier, S.; Helbing, D.; Theraulaz, G. (2010). The walking behaviour of pedestrian social groups and its impact on crowd dynamics. PLoS ONE 5(4): e10047. doi:10.1371/journal.pone.0010047 *(sprawdzone 2026-11-15: szczegóły)*
- Mueller, K. P. (ed.) (2015). Precision and Purpose: Airpower in the Libyan Civil War (RR-676-AF). RAND Corporation, Santa Monica. *(sprawdzone 2026-11-15: szczegóły)*
- Mullen, B.; Copper, C. (1994). The relation between group cohesiveness and performance: an integration. Psychological Bulletin 115(2): 210-227. doi:10.1037/0033-2909.115.2.210 *(sprawdzone 2026-11-15: szczegóły)*
- Murray, W. (1983). Strategy for Defeat: The Luftwaffe 1933-1945. Air University Press, Maxwell AFB. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Murray, W.; Woods, K. M. (2014). The Iran-Iraq War: A Military and Strategic History. Cambridge University Press, Cambridge. *(sprawdzone 2026-11-15: szczegóły)*
- Nagy, M.; Ákos, Z.; Biro, D.; Vicsek, T. (2010). Hierarchical group dynamics in pigeon flocks. Nature 464(7290): 890-893. doi:10.1038/nature08891 *(sprawdzone 2026-11-15: szczegóły)*
- Nash, D. E. (2002). Hell's Gate: The Battle of the Cherkassy Pocket, January-February 1944. RZM Imports, Stamford, CT. *(sprawdzone 2026-11-15: szczegóły)*
- Naylor, S. (2005). Not a Good Day to Die: The Untold Story of Operation Anaconda. Berkley Books, New York. *(sprawdzone 2026-11-15: szczegóły)*
- Nelder, J. A.; Wedderburn, R. W. M. (1972). Generalized linear models. Journal of the Royal Statistical Society A 135(3): 370-384. *(sprawdzone 2026-11-15: szczegóły)*
- Newman, M. E. J. (2003). The structure and function of complex networks. SIAM Review 45(2): 167-256. doi:10.1137/S003614450342480 *(sprawdzone 2026-11-15: szczegóły)*
- Nolan, K. W. (1983). Battle for Hue: Tet, 1968. Presidio Press, Novato. *(sprawdzone 2026-11-15: szczegóły)*
- Nolan, K. W. (1986). Into Laos: The Story of Dewey Canyon II/Lam Son 719, Vietnam 1971. Presidio Press, Novato. *(sprawdzone 2026-11-15: szczegóły)*
- Nordeen, L. O. (1990). Fighters over Israel. Orion Books, New York. *(sprawdzone 2026-11-15: szczegóły)*
- O'Neill, R. (1985). Australia in the Korean War 1950-53, Volume II: Combat Operations. Australian War Memorial and Australian Government Publishing Service, Canberra. *(sprawdzone 2026-11-15: istnienie)*
- Oliker, O. (2001). Russia's Chechen Wars 1994-2000: Lessons from Urban Combat (MR-1289-A). RAND Corporation, Santa Monica. *(sprawdzone 2026-11-15: szczegóły)*
- Openshaw, S. (1984). The Modifiable Areal Unit Problem (CATMOG 38). Geo Books, Norwich. *(sprawdzone 2026-11-15: szczegóły)*
- Ord, J. K.; Getis, A. (1995). Local spatial autocorrelation statistics: distributional issues and an application. Geographical Analysis 27(4): 286-306. *(sprawdzone 2026-11-15: szczegóły)*
- Oren, M. B. (2002). Six Days of War: June 1967 and the Making of the Modern Middle East. Oxford University Press, New York. *(sprawdzone 2026-11-15: szczegóły)*
- Osinga, F. P. B. (2007). Science, Strategy and War: The Strategic Theory of John Boyd. Routledge, Abingdon. *(sprawdzone 2026-11-15: szczegóły)*
- Osipov, M. (tłum. Helmbold, R. L.; Rehm, A. S.) (1995). The influence of the numerical strength of engaged forces on their casualties (orig. 1915). Naval Research Logistics 42(3): 435-490. *(sprawdzone 2026-11-15: szczegóły)*
- Overy, R. (2000). The Battle. Penguin, London, 2000. US edition: W. W. Norton, New York, 2001, as 'The Battle of Britain: The Myth and the Reality'. *(sprawdzone 2026-11-15: szczegóły)*
- Overy, R. (2013). The Bombing War: Europe 1939-1945. Allen Lane, London. *(sprawdzone 2026-11-15: szczegóły)*
- Paine, S. C. M. (2003). The Sino-Japanese War of 1894-1895: Perceptions, Power, and Primacy. Cambridge University Press, Cambridge. *(sprawdzone 2026-11-15: szczegóły)*
- Pakdaman Naeini, M.; Cooper, G. F.; Hauskrecht, M. (2015). Obtaining well calibrated probabilities using Bayesian binning. Proceedings of the AAAI Conference on Artificial Intelligence 29(1). doi:10.1609/aaai.v29i1.9602 *(sprawdzone 2026-11-15: szczegóły)*
- Pakenham, T. (1979). The Boer War. Weidenfeld & Nicolson, London. *(sprawdzone 2026-11-15: szczegóły)*
- Palacios-Huerta, I. (2003). Professionals play minimax. Review of Economic Studies 70(2): 395-415. doi:10.1111/1467-937X.00249 *(sprawdzone 2026-11-15: szczegóły)*
- Pape, R. A. (1996). Bombing to Win: Air Power and Coercion in War. Cornell University Press, Ithaca. *(sprawdzone 2026-11-15: szczegóły)*
- Parshall, J. B.; Tully, A. P. (2005). Shattered Sword: The Untold Story of the Battle of Midway. Potomac Books, Washington DC. *(sprawdzone 2026-11-15: szczegóły)*
- Paskiv, V.; Zanevskyy, I.; Koman, V. (2026). Differentiating playing roles in professional Counter-Strike 2 by performance indicators: an observational study. Health, Sport, Rehabilitation. doi:10.58962/hsr.1395 *(sprawdzone 2026-11-15: szczegóły)*
- PC Gamer (2013). The International 2013: Grand Finals in review. PC Gamer. https://www.pcgamer.com/the-international-2013-grand-finals-in-review *(sprawdzone 2026-11-15: szczegóły)*
- PC Gamer (2016). The best CS:GO plays of 2016. PC Gamer. https://www.pcgamer.com/the-best-csgo-plays-of-2016 *(sprawdzone 2026-11-15: szczegóły)*
- Perla, P. P. (1990). The Art of Wargaming. Naval Institute Press, Annapolis. *(sprawdzone 2026-11-15: szczegóły)*
- Perla, P. P.; McGrady, E. D. (2011). Why wargaming works. Naval War College Review 64(3): 111-130. *(sprawdzone 2026-11-15: szczegóły)*
- Phipson, B.; Smyth, G. K. (2010). Permutation p-values should never be zero: calculating exact p-values when permutations are randomly drawn. Statistical Applications in Genetics and Molecular Biology 9(1): Article 39. doi:10.2202/1544-6115.1585 *(sprawdzone 2026-11-15: szczegóły)*
- Playfair, I. S. O.; Flynn, F. C.; Molony, C. J. C.; Gleave, T. P. (1960). The Mediterranean and Middle East, Volume III: British Fortunes Reach Their Lowest Ebb (History of the Second World War). HMSO, London. *(sprawdzone 2026-11-15: szczegóły)*
- Playfair, I. S. O.; Stitt, G. M. S.; Molony, C. J. C.; Toomer, S. E. (1954). The Mediterranean and Middle East, Volume I: The Early Successes against Italy (History of the Second World War). HMSO, London. *(sprawdzone 2026-11-15: szczegóły)*
- Plutarch (tłum. Perrin, B.) (1916). Lives, Volume III: Pericles and Fabius Maximus, Nicias and Crassus (Loeb Classical Library). Heinemann, London; Macmillan, New York. *(domena publiczna)* *(sprawdzone 2026-11-15: istnienie)*
- Pollack, K. M. (2002). Arabs at War: Military Effectiveness, 1948-1991. University of Nebraska Press, Lincoln. *(sprawdzone 2026-11-15: szczegóły)*
- Pollard, R.; Reep, C. (1997). Measuring the effectiveness of playing strategies at soccer. Journal of the Royal Statistical Society D 46(4): 541-550. *(sprawdzone 2026-11-15: szczegóły)*
- Polybius (tłum. Shuckburgh, E. S.) (1889). The Histories of Polybius. Macmillan, London. *(domena publiczna)* *(sprawdzone 2026-11-15: istnienie)*
- Pope, D. (1956). The Battle of the River Plate. William Kimber, London. *(sprawdzone 2026-11-15: szczegóły)*
- Pope, D. G.; Schweitzer, M. E. (2011). Is Tiger Woods loss averse? Persistent bias in the face of experience, competition, and high stakes. American Economic Review 101(1): 129-157. doi:10.1257/aer.101.1.129 *(sprawdzone 2026-11-15: szczegóły)*
- Post, T.; van den Assem, M. J.; Baltussen, G.; Thaler, R. H. (2008). Deal or No Deal? Decision making under risk in a large-payoff game show. American Economic Review 98(1): 38-71. doi:10.1257/aer.98.1.38 *(sprawdzone 2026-11-15: szczegóły)*
- Prados, J.; Stubbe, R. W. (1991). Valley of Decision: The Siege of Khe Sanh. Houghton Mifflin, Boston. *(sprawdzone 2026-11-15: szczegóły)*
- Prange, G. W. (1981). At Dawn We Slept: The Untold Story of Pearl Harbor. McGraw-Hill, New York. *(sprawdzone 2026-11-15: szczegóły)*
- Prior, R.; Wilson, T. (1992). Command on the Western Front: The Military Career of Sir Henry Rawlinson, 1914-1918. Blackwell, Oxford. *(sprawdzone 2026-11-15: szczegóły)*
- Putney, D. T. (2004). Airpower Advantage: Planning the Gulf War Air Campaign, 1989-1991. Air Force History and Museums Program, Washington DC. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Quarantelli, E. L. (1954). The nature and conditions of panic. American Journal of Sociology 60(3): 267-275. doi:10.1086/221536 *(sprawdzone 2026-11-15: szczegóły)*
- Rabinovich, A. (1988). The Boats of Cherbourg. Seaver Books, New York. *(sprawdzone 2026-11-15: szczegóły)*
- Rabinovich, A. (2004). The Yom Kippur War: The Epic Encounter That Transformed the Middle East. Schocken, New York. *(sprawdzone 2026-11-15: szczegóły)*
- Rathke, A. (2017). An examination of expected goals and shot efficiency in soccer. Journal of Human Sport and Exercise 12(Proc2). doi:10.14198/jhse.2017.12.proc2.05 *(sprawdzone 2026-11-15: szczegóły)*
- Reep, C.; Benjamin, B. (1968). Skill and chance in association football. Journal of the Royal Statistical Society A 131(4): 581-585. *(sprawdzone 2026-11-15: szczegóły)*
- Reiter, D.; Stam, A. C. (2002). Democracies at War. Princeton University Press, Princeton. *(sprawdzone 2026-11-15: szczegóły)*
- Reynolds, C. W. (1987). Flocks, herds and schools: a distributed behavioral model. Proceedings of SIGGRAPH '87 (Computer Graphics 21(4)): 25-34. doi:10.1145/37401.37406 *(sprawdzone 2026-11-15: szczegóły)*
- Reynolds, N. E. (2005). Basrah, Baghdad, and Beyond: The U.S. Marine Corps in the Second Iraq War. Naval Institute Press, Annapolis. *(sprawdzone 2026-11-15: szczegóły)*
- Riot Games (2013). Road to Worlds: Korea regionals recap. League of Legends Nexus. https://nexus.leagueoflegends.com/en-us/2013/09/road-to-worlds-korea-regionals-recap/ *(sprawdzone 2026-11-15: szczegóły)*
- Rioult, F.; Métivier, J.-P.; Helleu, B.; Scelles, N.; Durand, C. (2014). Mining tracks of competitive video games. AASRI Procedia 8: 82-87. *(sprawdzone 2026-11-15: szczegóły)*
- Ripley, B. D. (1977). Modelling spatial patterns. Journal of the Royal Statistical Society B 39(2): 172-212. *(sprawdzone 2026-11-15: szczegóły)*
- Robberechts, P.; Van Haaren, J.; Davis, J. (2021). A Bayesian approach to in-game win probability in soccer. Proceedings of the 27th ACM SIGKDD Conference on Knowledge Discovery & Data Mining: 3512-3521. doi:10.1145/3447548.3467194 *(sprawdzone 2026-11-15: szczegóły)*
- Roberts, M. (1958). Gustavus Adolphus: A History of Sweden, 1611-1632, Volume II. Longmans, Green, London. *(sprawdzone 2026-11-15: szczegóły)*
- Robinson, L. (2004). Masters of Chaos: The Secret History of the Special Forces. PublicAffairs, New York. *(sprawdzone 2026-11-15: szczegóły)*
- Romjue, J. L. (1984). From Active Defense to AirLand Battle: The Development of Army Doctrine 1973-1982. US Army Training and Doctrine Command Historical Office, Fort Monroe. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Rommel, E. (1937). Infanterie greift an (Infantry Attacks). Voggenreiter, Potsdam. *(sprawdzone 2026-11-15: szczegóły)*
- Rosenau, W. (2001). Special Operations Forces and Elusive Enemy Ground Targets: Lessons from Vietnam and the Persian Gulf War (MR-1408-AF). RAND Corporation, Santa Monica. *(sprawdzone 2026-11-15: istnienie)*
- Roskill, S. W. (1954). The War at Sea 1939-1945, vol. 1: The Defensive. HMSO, London. *(sprawdzone 2026-11-15: istnienie)*
- Roskill, S. W. (1956). The War at Sea 1939-1945, vol. 2: The Period of Balance. HMSO, London. *(sprawdzone 2026-11-15: istnienie)*
- Roskill, S. W. (1960). The War at Sea 1939-1945, vol. 3, part 1: The Offensive. HMSO, London. *(sprawdzone 2026-11-15: istnienie)*
- Rotte, R.; Schmidt, C. M. (2003). On the production of victory: empirical determinants of battlefield success in modern war. Defence and Peace Economics 14(3): 175-192. doi:10.1080/1024269022000000868 *(sprawdzone 2026-11-15: szczegóły)*
- Rowland, D. (2006). The Stress of Battle: Quantifying Human Performance in Combat. The Stationery Office, London. *(sprawdzone 2026-11-15: szczegóły)*
- Ryan, C. (1974). A Bridge Too Far. Simon & Schuster, New York. *(sprawdzone 2026-11-15: szczegóły)*
- Salas, E.; Sims, D. E.; Burke, C. S. (2005). Is there a "Big Five" in teamwork?. Small Group Research 36(5): 555-599. doi:10.1177/1046496405277134 *(sprawdzone 2026-11-15: szczegóły)*
- Salen, K.; Zimmerman, E. (2003). Rules of Play: Game Design Fundamentals. MIT Press, Cambridge MA. *(sprawdzone 2026-11-15: szczegóły)*
- Salganik, M. J.; Dodds, P. S.; Watts, D. J. (2006). Experimental study of inequality and unpredictability in an artificial cultural market. Science 311(5762): 854-856. doi:10.1126/science.1121066 *(sprawdzone 2026-11-15: szczegóły)*
- Salmon, A. (2009). To the Last Round: The Epic British Stand on the Imjin River, Korea 1951. Aurum Press, London. *(sprawdzone 2026-11-15: szczegóły)*
- Scales, R. H. (1993). Certain Victory: The United States Army in the Gulf War. Office of the Chief of Staff, US Army, Washington DC. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Schell, J. (2008). The Art of Game Design: A Book of Lenses. Morgan Kaufmann, Burlington. *(sprawdzone 2026-11-15: szczegóły)*
- Schubert, M.; Drachen, A.; Mahlmann, T. (2016). Esports analytics through encounter detection. MIT Sloan Sports Analytics Conference 2016. *(sprawdzone 2026-11-15: istnienie)*
- Sears, S. W. (1983). Landscape Turned Red: The Battle of Antietam. Ticknor & Fields, New Haven. *(sprawdzone 2026-11-15: szczegóły)*
- Sears, S. W. (1996). Chancellorsville. Houghton Mifflin, Boston. *(sprawdzone 2026-11-15: szczegóły)*
- Seif El-Nasr, M.; Drachen, A.; Canossa, A. (eds.) (2013). Game Analytics: Maximizing the Value of Player Data. Springer, London. *(sprawdzone 2026-11-15: szczegóły)*
- Seif El-Nasr, M.; Nguyen, T.-H. D.; Canossa, A.; Drachen, A. (2021). Game Data Science. Oxford University Press, Oxford. *(sprawdzone 2026-11-15: szczegóły)*
- Semenov, A.; Romov, P.; Korolev, S.; Yashkov, D.; Neklyudov, K. (2017). Performance of machine learning algorithms in predicting game outcome from drafts in Dota 2. Analysis of Images, Social Networks and Texts (AIST 2016), CCIS 661, Springer: 26-37. *(sprawdzone 2026-11-15: istnienie)*
- Seyfried, A.; Steffen, B.; Klingsch, W.; Boltes, M. (2005). The fundamental diagram of pedestrian movement revisited. Journal of Statistical Mechanics: Theory and Experiment 2005(10): P10002. doi:10.1088/1742-5468/2005/10/P10002 *(sprawdzone 2026-11-15: szczegóły)*
- Shaikh, S.; Rumbaugh, W. (2020). The Air and Missile War in Nagorno-Karabakh: Lessons for the Future of Strike and Defense. Center for Strategic and International Studies, Washington DC. *(sprawdzone 2026-11-15: istnienie)*
- Shaw, R. L. (1985). Fighter Combat: Tactics and Maneuvering. Naval Institute Press, Annapolis. *(sprawdzone 2026-11-15: szczegóły)*
- Shils, E. A.; Janowitz, M. (1948). Cohesion and disintegration in the Wehrmacht in World War II. Public Opinion Quarterly 12(2): 280-315. doi:10.1086/265951 *(sprawdzone 2026-11-15: szczegóły)*
- Showalter, D. E. (1991). Tannenberg: Clash of Empires. Archon Books, Hamden. *(sprawdzone 2026-11-15: szczegóły)*
- Showalter, D. E. (1996). The Wars of Frederick the Great. Longman, London. *(sprawdzone 2026-11-15: szczegóły)*
- Shulimson, J.; Blasiol, L. A.; Smith, C. R.; Dawson, D. A. (1997). U.S. Marines in Vietnam: The Defining Year, 1968. History and Museums Division, US Marine Corps, Washington DC. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Siborne, W. (1844). History of the War in France and Belgium in 1815. T. & W. Boone, London. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Siebold, G. L. (2007). The essence of military group cohesion. Armed Forces & Society 33(2): 286-295. doi:10.1177/0095327X06294173 *(sprawdzone 2026-11-15: szczegóły)*
- Sill, J. (2010). Improved NBA adjusted +/- using regularization and out-of-sample testing. MIT Sloan Sports Analytics Conference 2010. https://www.sloansportsconference.com/research-papers/improved-nba-adjusted-using-regularization-and-out-of-sample-testing *(sprawdzone 2026-11-15: istnienie)*
- Silva, A. L. C.; Pappa, G. L.; Chaimowicz, L. (2018). Continuous outcome prediction of League of Legends competitive matches using recurrent neural networks. SBGames 2018, Computing Track (short paper). http://www.sbgames.org/sbgames2018/files/papers/ComputacaoShort/188226.pdf *(sprawdzone 2026-11-15: szczegóły)*
- Silverman, B. W. (1986). Density Estimation for Statistics and Data Analysis. Chapman & Hall, London. *(sprawdzone 2026-11-15: szczegóły)*
- Sirlin, D. (2006). Playing to Win: Becoming the Champion. Lulu.com. *(sprawdzone 2026-11-15: szczegóły)*
- Smail, R. C. (1956). Crusading Warfare, 1097-1193. Cambridge University Press, Cambridge. *(sprawdzone 2026-11-15: szczegóły)*
- Smith, G.; Levere, M.; Kurtzman, R. (2009). Poker player behavior after big wins and big losses. Management Science 55(9): 1547-1555. doi:10.1287/mnsc.1090.1044 *(sprawdzone 2026-11-15: szczegóły)*
- Smith, R. R. (1963). Triumph in the Philippines (US Army in World War II). Office of the Chief of Military History, Washington DC. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Spearman, W. (2018). Beyond expected goals. MIT Sloan Sports Analytics Conference 2018. *(sprawdzone 2026-11-15: szczegóły)*
- Special Operations Review Group (Holloway, J. L., chair) (1980). Rescue Mission Report. Joint Chiefs of Staff, Washington DC. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Starcke, K.; Brand, M. (2012). Decision making under stress: a selective review. Neuroscience & Biobehavioral Reviews 36(4): 1228-1248. doi:10.1016/j.neubiorev.2012.02.003 *(sprawdzone 2026-11-15: szczegóły)*
- Stone, L. D. (1975). Theory of Optimal Search. Academic Press, New York. *(sprawdzone 2026-11-15: szczegóły)*
- Stone, L. D.; Keller, C. M.; Kratzke, T. M.; Strumpfer, J. P. (2014). Search for the wreckage of Air France flight AF 447. Statistical Science 29(1): 69-80. doi:10.1214/13-STS420 *(sprawdzone 2026-11-15: szczegóły)*
- Stouffer, S. A.; et al. (1949). The American Soldier, Volume II: Combat and Its Aftermath. Princeton University Press, Princeton. *(sprawdzone 2026-11-15: szczegóły)*
- Strauss, B. (2004). The Battle of Salamis. Simon & Schuster, New York. *(sprawdzone 2026-11-15: szczegóły)*
- Sumption, J. (1990). The Hundred Years War, Volume I: Trial by Battle. Faber & Faber, London. *(sprawdzone 2026-11-15: istnienie)*
- Sun Tzu (tłum. Giles, L.) (1910). The Art of War. Luzac & Co., London. https://www.gutenberg.org/ebooks/132 *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Sweetman, J. (1982). Operation Chastise: The Dams Raid, Epic or Myth. Jane's, London. *(sprawdzone 2026-11-15: szczegóły)*
- Szell, M.; Lambiotte, R.; Thurner, S. (2010). Multirelational organization of large-scale social networks in an online world. Proceedings of the National Academy of Sciences 107(31): 13636-13641. doi:10.1073/pnas.1004008107 *(sprawdzone 2026-11-15: szczegóły)*
- Tacitus (tłum. Church, A. J.; Brodribb, W. J.) (1876). The Annals. Macmillan, London. *(domena publiczna)* *(sprawdzone 2026-11-15: istnienie)*
- Taki, T.; Hasegawa, J.; Fukumura, T. (1996). Development of motion analysis system for quantitative evaluation of teamwork in soccer games. Proc. IEEE International Conference on Image Processing (ICIP 1996). *(sprawdzone 2026-11-15: szczegóły)*
- Tapper, J. (2012). The Outpost: An Untold Story of American Valor. Little, Brown, New York. *(sprawdzone 2026-11-15: szczegóły)*
- Taylor, J. G. (1983). Lanchester Models of Warfare (2 vols.). Operations Research Society of America, Military Applications Section, Arlington VA. *(sprawdzone 2026-11-15: szczegóły)*
- Taylor, T. L. (2012). Raising the Stakes: E-Sports and the Professionalization of Computer Gaming. MIT Press, Cambridge MA. *(sprawdzone 2026-11-15: szczegóły)*
- Thaler, R. H.; Johnson, E. J. (1990). Gambling with the house money and trying to break even: the effects of prior outcomes on risky choice. Management Science 36(6): 643-660. doi:10.1287/mnsc.36.6.643 *(sprawdzone 2026-11-15: szczegóły)*
- Thompson, W. W. (2000). To Hanoi and Back: The United States Air Force and North Vietnam, 1966-1973. Air Force History and Museums Program, Washington DC. *(domena publiczna)* *(sprawdzone 2026-11-15: istnienie)*
- Till, G. (2018). Seapower: A Guide for the Twenty-First Century (4th ed.). Routledge, Abingdon. *(sprawdzone 2026-11-15: szczegóły)*
- Tobler, W. R. (1970). A computer movie simulating urban growth in the Detroit region. Economic Geography 46 (supplement): 234-240. *(sprawdzone 2026-11-15: szczegóły)*
- Tokey, S. S.; Chen, Z.-S.; Mettler, C.; Tang, D.-X.; Boudaoud, B.; Kim, J.; Spjut, J.; Claypool, M. (2024). The effects of network latency on the peeker's advantage in first-person shooter games. Proceedings of the 19th International Conference on the Foundations of Digital Games (FDG 2024). doi:10.1145/3649921.3650002 *(sprawdzone 2026-11-15: szczegóły)*
- Totten, C. W. (2019). An Architectural Approach to Level Design (2nd ed.). CRC Press, Boca Raton. *(sprawdzone 2026-11-15: szczegóły)*
- Trask, D. F. (1981). The War with Spain in 1898. Macmillan, New York. *(sprawdzone 2026-11-15: szczegóły)*
- Travers, T. (2001). Gallipoli 1915. Tempus, Stroud. *(sprawdzone 2026-11-15: szczegóły)*
- Triandafillov, V. K. (tłum. Kipp, W. A.) (1994). The Nature of the Operations of Modern Armies (orig. 1929). Frank Cass, Ilford. *(sprawdzone 2026-11-15: szczegóły)*
- Trotter, W. R. (1991). A Frozen Hell: The Russo-Finnish Winter War of 1939-1940. Algonquin Books, Chapel Hill. *(sprawdzone 2026-11-15: szczegóły)*
- Tully, A. P. (2009). Battle of Surigao Strait. Indiana University Press, Bloomington. *(sprawdzone 2026-11-15: szczegóły)*
- Tunstrøm, K.; Katz, Y.; Ioannou, C. C.; Huepe, C.; Lutz, M. J.; Couzin, I. D. (2013). Collective states, multistability and transitional behavior in schooling fish. PLoS Computational Biology 9(2): e1002915. doi:10.1371/journal.pcbi.1002915 *(sprawdzone 2026-11-15: szczegóły)*
- Turnbull, S. (2003). Tannenberg 1410: Disaster for the Teutonic Knights (Campaign 122). Osprey, Oxford. *(sprawdzone 2026-11-15: szczegóły)*
- Turner, A.; Doxa, M.; O'Sullivan, D.; Penn, A. (2001). From isovists to visibility graphs: a methodology for the analysis of architectural space. Environment and Planning B 28(1): 103-121. *(sprawdzone 2026-11-15: szczegóły)*
- Tversky, A.; Kahneman, D. (1992). Advances in prospect theory: cumulative representation of uncertainty. Journal of Risk and Uncertainty 5(4): 297-323. doi:10.1007/BF00122574 *(sprawdzone 2026-11-15: szczegóły)*
- Upcomer (2018). CSGO 2018 retrospective: the reign of Astralis. Upcomer. https://upcomer.com/csgo-2018-retrospective-astralis/ *(sprawdzone 2026-11-15: istnienie)*
- US Marine Corps (1997). MCDP 1 Warfighting. Headquarters USMC, Washington DC. *(domena publiczna)* *(sprawdzone 2026-11-15: istnienie)*
- US Navy Department (1898). Official Records of the Union and Confederate Navies in the War of the Rebellion, Series I, vol. 7. Government Printing Office, Washington DC. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- US War Department (1888). The War of the Rebellion: Official Records of the Union and Confederate Armies, Series I vol. 21 (Fredericksburg). Government Printing Office, Washington DC. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- van Creveld, M. (1982). Fighting Power: German and U.S. Army Performance, 1939-1945. Greenwood Press, Westport. *(sprawdzone 2026-11-15: szczegóły)*
- Vegetius (tłum. Clarke, J.) (1767). De Re Militari (The Military Institutions of the Romans). W. Griffin, London. *(domena publiczna)* *(sprawdzone 2026-11-15: istnienie)*
- Vego, M. N. (2007). Joint Operational Warfare: Theory and Practice. Naval War College, Newport. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Venkus, R. E. (1992). Raid on Qaddafi. St. Martin's Press, New York. *(sprawdzone 2026-11-15: szczegóły)*
- Vicsek, T.; Czirók, A.; Ben-Jacob, E.; Cohen, I.; Shochet, O. (1995). Novel type of phase transition in a system of self-driven particles. Physical Review Letters 75(6): 1226-1229. doi:10.1103/PhysRevLett.75.1226 *(sprawdzone 2026-11-15: szczegóły)*
- Vicsek, T.; Zafeiris, A. (2012). Collective motion. Physics Reports 517(3-4): 71-140. doi:10.1016/j.physrep.2012.03.004 *(sprawdzone 2026-11-15: szczegóły)*
- Vinyals, O.; Babuschkin, I.; Czarnecki, W. M.; et al. (2019). Grandmaster level in StarCraft II using multi-agent reinforcement learning. Nature 575(7782): 350-354. doi:10.1038/s41586-019-1724-z *(sprawdzone 2026-11-15: szczegóły)*
- von Neumann, J.; Morgenstern, O. (1944). Theory of Games and Economic Behavior. Princeton University Press, Princeton. *(sprawdzone 2026-11-15: szczegóły)*
- Waddington, C. H. (1973). O.R. in World War 2: Operational Research against the U-Boat. Elek Science, London. *(sprawdzone 2026-11-15: szczegóły)*
- Wald, A.; Wolfowitz, J. (1940). On a test whether two samples are from the same population. Annals of Mathematical Statistics 11(2): 147-162. doi:10.1214/aoms/1177731909 *(sprawdzone 2026-11-15: szczegóły)*
- Walker, M.; Wooders, J. (2001). Minimax play at Wimbledon. American Economic Review 91(5): 1521-1538. doi:10.1257/aer.91.5.1521 *(sprawdzone 2026-11-15: szczegóły)*
- Wallner, G. (ed.) (2019). Data Analytics Applications in Gaming and Entertainment. CRC Press, Boca Raton. *(sprawdzone 2026-11-15: istnienie)*
- Wallner, G.; Kriglstein, S. (2013). Visualization-based analysis of gameplay data - a review of literature. Entertainment Computing 4(3): 143-155. *(sprawdzone 2026-11-15: szczegóły)*
- Wallner, G.; Kriglstein, S. (2014). PLATO: a visual analytics system for gameplay data. Computers & Graphics 38: 341-356. *(sprawdzone 2026-11-15: istnienie)*
- Warden, J. A. (1988). The Air Campaign: Planning for Combat. National Defense University Press, Washington DC. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Washburn, A. R. (2002). Search and Detection (4th ed.). INFORMS / Military Applications Section, Linthicum MD. *(sprawdzone 2026-11-15: istnienie)*
- Washburn, A.; Kress, M. (2009). Combat Modeling. Springer, New York. *(sprawdzone 2026-11-15: szczegóły)*
- Watling, J.; Reynolds, N. (2022). Operation Z: The Death Throes of an Imperial Delusion. Royal United Services Institute, London (Special Report, April 2022). *(sprawdzone 2026-11-15: istnienie)*
- Watling, J.; Reynolds, N. (2022). Ukraine at War: Paving the Road from Survival to Victory. Royal United Services Institute, London. *(sprawdzone 2026-11-15: szczegóły)*
- Watling, J.; Reynolds, N. (2023). Meatgrinder: Russian Tactics in the Second Year of Its Invasion of Ukraine. Royal United Services Institute, London. *(sprawdzone 2026-11-15: szczegóły)*
- Watling, J.; Reynolds, N. (2023). Stormbreak: Fighting Through Russian Defences in Ukraine's 2023 Offensive. Royal United Services Institute, London. *(sprawdzone 2026-11-15: szczegóły)*
- Wawro, G. (1996). The Austro-Prussian War: Austria's War with Prussia and Italy in 1866. Cambridge University Press, Cambridge. *(sprawdzone 2026-11-15: szczegóły)*
- Weapons Systems Evaluation Group (1967). Project Red Baron: Air-to-Air Encounters in Southeast Asia, Volume I (WSEG Report 116). Weapons Systems Evaluation Group, Washington DC (DTIC). *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Weiss, H. K. (1966). Combat models and historical data: the U.S. Civil War. Operations Research 14(5): 759-790. doi:10.1287/opre.14.5.759 *(sprawdzone 2026-11-15: szczegóły)*
- Werrell, K. P. (2005). Sabres over MiG Alley: The F-86 and the Battle for Air Superiority in Korea. Naval Institute Press, Annapolis. *(sprawdzone 2026-11-15: szczegóły)*
- Werrell, K. P. (2005). Archie to SAM: A Short Operational History of Ground-Based Air Defense (2nd ed.). Air University Press, Maxwell AFB. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Westermeyer, P. W. (2008). U.S. Marines in Battle: Al-Khafji, 28 January-1 February 1991. History Division, US Marine Corps, Washington DC. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Willard, D. (1962). Lanchester as Force in History: An Analysis of Land Battles of the Years 1618-1905 (RAC-TP-74). Research Analysis Corporation, Bethesda MD. *(sprawdzone 2026-11-15: istnienie)*
- Wilson, E. B. (1927). Probable inference, the law of succession, and statistical inference. Journal of the American Statistical Association 22(158): 209-212. *(sprawdzone 2026-11-15: szczegóły)*
- Wilson, H. W. (1896). Ironclads in Action: A Sketch of Naval Warfare from 1855 to 1895. Sampson Low, Marston, London. *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Wise, H. L. (2007). Inside the Danger Zone: The U.S. Military in the Persian Gulf, 1987-1988. Naval Institute Press, Annapolis. *(sprawdzone 2026-11-15: szczegóły)*
- Wong, L.; Kolditz, T. A.; Millen, R. A.; Potter, T. M. (2003). Why They Fight: Combat Motivation in the Iraq War. Strategic Studies Institute, US Army War College, Carlisle PA. https://press.armywarcollege.edu/monographs/322/ *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Woodward, S.; Robinson, P. (1992). One Hundred Days: The Memoirs of the Falklands Battle Group Commander. HarperCollins, London. *(sprawdzone 2026-11-15: szczegóły)*
- Woolley, A. W.; Chabris, C. F.; Pentland, A.; Hashmi, N.; Malone, T. W. (2010). Evidence for a collective intelligence factor in the performance of human groups. Science 330(6004): 686-688. doi:10.1126/science.1193147 *(sprawdzone 2026-11-15: szczegóły)*
- Xenophon (tłum. Dakyns, H. G.) (1897). Hellenica. Macmillan, London. https://www.gutenberg.org/ebooks/1174 *(domena publiczna)* *(sprawdzone 2026-11-15: szczegóły)*
- Xenopoulos, P.; Coelho, B.; Silva, C. (2021). Optimal team economic decisions in Counter-Strike. arXiv preprint 2109.12990. doi:10.48550/arXiv.2109.12990 *(sprawdzone 2026-11-15: szczegóły)*
- Xenopoulos, P.; Doraiswamy, H.; Silva, C. (2020). Valuing player actions in Counter-Strike: Global Offensive. Proc. IEEE International Conference on Big Data 2020: 1283-1292. https://arxiv.org/abs/2011.01324 *(sprawdzone 2026-11-15: szczegóły)*
- Xenopoulos, P.; Freeman, W. R.; Silva, C. (2022). Analyzing the differences between professional and amateur esports through win probability. Proceedings of the ACM Web Conference 2022 (WWW '22): 3418-3427. doi:10.1145/3485447.3512277 *(sprawdzone 2026-11-15: szczegóły)*
- Xenopoulos, P.; Rulff, J.; Nonato, L. G.; Barr, B.; Silva, C. (2022). ggViz: accelerating large-scale esports game analysis. Proc. ACM on Human-Computer Interaction 6 (CHI PLAY): 238. *(sprawdzone 2026-11-15: istnienie)*
- Xenopoulos, P.; Silva, C. (2022). ESTA: an esports trajectory and action dataset. arXiv preprint 2209.09861. doi:10.48550/arXiv.2209.09861 *(sprawdzone 2026-11-15: szczegóły)*
- Y'Blood, W. T. (1981). Red Sun Setting: The Battle of the Philippine Sea. Naval Institute Press, Annapolis. *(sprawdzone 2026-11-15: istnienie)*
- Yang, P.; Harrison, B.; Roberts, D. L. (2014). Identifying patterns in combat that are predictive of success in MOBA games. Proc. 9th International Conference on Foundations of Digital Games (FDG 2014). *(sprawdzone 2026-11-15: istnienie)*
- Yang, Y.; Qin, T.; Lei, Y.-H. (2017). Real-time eSports match result prediction. arXiv preprint 1701.03162. doi:10.48550/arXiv.1701.03162 *(sprawdzone 2026-11-15: szczegóły)*
- Yannakakis, G. N.; Togelius, J. (2018). Artificial Intelligence and Games. Springer, Cham. *(sprawdzone 2026-11-15: szczegóły)*
- Yee, N.; Bailenson, J. N.; Urbanek, M.; Chang, F.; Merget, D. (2007). The unbearable likeness of being digital: the persistence of nonverbal social norms in online virtual environments. CyberPsychology & Behavior 10(1): 115-121. doi:10.1089/cpb.2006.9984 *(sprawdzone 2026-11-15: szczegóły)*
- Zabrodskyi, M.; Watling, J.; Danylyuk, O. V.; Reynolds, N. (2022). Preliminary Lessons in Conventional Warfighting from Russia's Invasion of Ukraine: February-July 2022. Royal United Services Institute, London. *(sprawdzone 2026-11-15: szczegóły)*
- Zaffiri, S. (1988). Hamburger Hill: May 11-20, 1969. Presidio Press, Novato. *(sprawdzone 2026-11-15: szczegóły)*
- Zaloga, S. J. (1996). Bagration 1944: The Destruction of Army Group Centre (Campaign 42). Osprey, London. *(sprawdzone 2026-11-15: szczegóły)*
- Zaloga, S. J.; Madej, W. V. (1985). The Polish Campaign 1939. Hippocrene Books, New York. *(sprawdzone 2026-11-15: szczegóły)*
- Zetterling, N.; Frankson, A. (2000). Kursk 1943: A Statistical Analysis. Frank Cass, London. *(sprawdzone 2026-11-15: szczegóły)*
- Zucchino, D. (2004). Thunder Run: The Armored Strike to Capture Baghdad. Atlantic Monthly Press, New York. *(sprawdzone 2026-11-15: szczegóły)*
- Zuehlke, M. (1999). Ortona: Canada's Epic World War II Battle. Stoddart, Toronto. *(sprawdzone 2026-11-15: szczegóły)*

<!-- kb:end -->
