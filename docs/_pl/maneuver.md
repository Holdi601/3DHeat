---
title: "Manewry"
parent: "Wnioski"
nav_order: 4
lang: "pl"
source: "maneuver.md"
source_hash: "2160eca678e0"
translated: true
outdated: false
---

# Manewry: jak poruszają się grupy

**Wnioski → Manewry** śledzi, jak jednostki każdej strony poruszają się *jako grupy*,
i nazywa manewry, które wykonują: oskrzydlenie, kleszcze, przełamanie,
zasadzkę, wycofanie, obronę przed pociskami, przecięcie T. Przy każdym
podaje, jak bardzo jest pewne, jakie liczby za nim stoją, czy się opłaciło
i jakie ma odpowiedniki w doktrynie i w historii. **Analiza zbiorcza → Manewry**
liczy je w tysiącach meczów: jak często każdy jest wykonywany na mapie,
w trybie i po każdej stronie oraz jak często się opłaca.

Wszystko liczy przeglądarka, we własnym wątku roboczym
(`src/insights/maneuver`). Mecz z kilkuset jednostkami zajmuje 10-500 ms,
dwugodzinna wojna powietrzna z tysiącami obiektów około sekundy.

## Jak tego używać {#using-it}

- Otwórz **Wnioski**, zakładkę **Manewry**. Liczenie startuje przy pierwszym
  otwarciu; po zmianie filtrów użyj **Szukaj ponownie**.
- **Pewny / Prawdopodobny / Możliwy** ustawia, jak pewne mają być wyświetlane
  manewry (domyślnie Prawdopodobny).
- **Oś czasu** ma pas dla każdej strony i pasek dla każdego manewru. **Lista**
  pod nią pokazuje to samo, według czasu. Kliknięcie przełącza na powtórkę
  na początku manewru, przelatuje tam kamerą i rysuje go w 3D: drogę każdej
  grupy jako strzałkę (dwa ramiona kleszczy są jego łukami), zarysy grup
  w kluczowym momencie (wróg w kolorze swojej strony) i front wroga jako białą
  linię. **Rysuj wszystkie w 3D** dodaje pozostałe manewry meczu, blado. Linie
  trafiają na kartę graficzną raz, gdy zmienia się wybór, a nie w każdej klatce:
  przy 480 manewrach rysowanych podczas odtwarzania czasy klatek na prawdziwej
  karcie (WebGL2 i WebGPU, p99 18,0-18,5 ms, maks. 19,5-20,8 ms) są takie same
  jak bez nich.
- Otwarty manewr pokazuje swój wynik (zabójstwa i straty jednostek, które go
  wykonały, w trakcie i tuż po nim, w porównaniu z wymianą strony w całym
  meczu), dowody i wpisy bazy wiedzy na jego temat: doktrynę i historyczne
  paralele (Cannae dla kleszczy, Sedan 1940 dla przełamania, Cuszima dla
  przecięcia T, Operacja Bolo dla pozorowania...).
- Mała tabela na końcu: dla każdego rodzaju i strony, wykonane i opłacone.

![Kleszcze na syntetycznym meczu demonstracyjnym: strzałki obu ramion, ciało wroga i jego front](../assets/img/en/maneuvers.webp)

## Jak znajdowane są grupy {#how-groups-are-found}

Każda jednostka jest umieszczona na wspólnej osi czasu (krok 1 s pieszo,
2 s w pozostałych przypadkach, dłużej dla bardzo dużych plików). Przy śmierci
jednostka stoi w miejscu, żeby odrodzenie nie rysowało linii przez mapę. W każdym
kroku jednostki jednej strony i jednego rodzaju (samoloty, pojazdy, okręty,
piechota) są łączone, gdy są blisko - 18 m pieszo, 170 m dla pojazdów,
3 km dla okrętów, 5 km dla samolotów - i poruszają się podobnie (prędkości
różnią się najwyżej o połowę prędkości szybszej albo obie stoją). Skupisko
zachowuje identyfikator grupy, w której było najwięcej jego członków.
Jednostka bez klasy jest traktowana jako piesza, pojazd albo lotnicza, według
prędkości.

**Kształt** grupy odczytuje się względem kierunku ruchu: kolumna albo linia
po rozrzucie wzdłuż i w poprzek, klin, gdy środek jest z przodu, szyk ukośny,
gdy członkowie cofają się na jedną stronę, czworobok, gdy obsadzają rogi.

Wszystko jest oceniane w skali samego meczu: **zasięg walki** `R` to
75. percentyl odległości między zabójcą a jego ofiarą (ograniczony do sensownego
zakresu dla domeny), a czasy manewru skalują się z rodzajem jednostki
(piechota ma jedną trzecią tego, co reszta na tym terenie).

## Co znajduje {#what-it-finds}

| Manewr | Znajdowany, gdy |
|---|---|
| Szyk | grupa utrzymuje jeden kształt przez 60% swoich kroków w ruchu, przez 30 s |
| Natarcie czołowe | grupa zbliża się z poza zasięgu do styku, na ¾ R lub więcej, z kierunku w odległości 35° od tego, w którym stoi wróg |
| Natarcie na skrzydło | to samo z kąta 50-130° (tył od 130°); pewne tylko przy własnej *sile wiążącej*, która walczy z wrogiem tam (zabójstwa w obie strony) |
| Kleszcze | dwa natarcia na skrzydło jednej strony na to samo ciało wroga, z przeciwnych stron (100° lub więcej różnicy), w ciągu 90 s; pewne, gdy ramiona walczą |
| Okrążenie | zwarta grupa wroga, którą z innych grup otacza co najmniej tyle samo jednostek jego przeciwnika w odległości 1,5 R, z dwóch lub więcej grup, bez przerwy większej niż 100°, przez minutę, odcięta od własnej strony; pewne, gdy pierścień zacisnął się o ½ R i walczył z kieszenią |
| Przełamanie | grupa przechodzi przez utrzymywaną linię (wrogowie stoją przez 30 s po jej lewej i prawej stronie, centrum jej strony jest za nimi); pewne, gdy wejdzie o ½ R dalej, zostanie tam 20 s i walczy; przełamanie jest, gdy jest o kolejne R dalej |
| Ruch skokami pod osłoną | w małej grupie część się porusza, a reszta stoi, role zmieniają się cztery razy lub więcej, a stojąca część osłania ogniem |
| Koncentracja / rozproszenie | udział strony przy jej najgęstszym punkcie rośnie z 35% do 60% (jednostki przychodzą z 1,5 R lub więcej, potem styk) - albo spada, gdy strona się rozprasza |
| Pozorowanie | mały oddział w styku ściąga dwóch lub więcej wrogów z innego miejsca; większa grupa uderza wtedy cztery zasięgi dalej, tam gdzie wroga jest mniej |
| Wycofanie / pościg | grupa w styku odwraca się i odsuwa się o R od miejsca walki; pewne, gdy wróg tam właśnie zabił jedną z nich i grupa oddaliła się od tego zabójcy na 2 R (nigdy pieszo: patrz niżej); wrogowie idący w tym samym kierunku i dotrzymujący kroku ścigają |
| Obrona w głąb | stojące jednostki w dwóch lub więcej pasach w poprzek osi wroga, R w głąb, wróg nadchodzi, ogień z pasów |
| Przeciwstok | trzy lub więcej zabójstw z bliska przez stojące jednostki ofiar, które przyszły zza grzbietu |
| Zasadzka | poruszająca się grupa spotyka wrogów, którzy stali przez 45 s; oni strzelają pierwsi, a poruszające się tracą dwie jednostki albo połowę grupy |
| Osłona | jedna lub dwie jednostki idące przed oddziałem z trzech lub więcej, które pierwsze spotykają wroga |
| Linie wewnętrzne | grupy jednej strony blisko siebie, między grupami drugiej, jej jednostki przesuwają się między nimi |
| Tempo | strona odpowiadająca na styk (zwrot, zmiana prędkości, pierwszy strzał) 1,5 razy szybciej, p Manna-Whitneya poniżej 0,05 |
| Crank, notch, drag, pump | cel wystrzelonego pocisku skręca strzelca pod kątem 35-70°, 75-105°, ponad 140° albo go ciągnie i skręca z powrotem |
| Kleszcze powietrzne, ściana, lead-trail, grinder | para rozdzielająca się na jednego wroga; trzy obok siebie na wroga; element 5-20 km za innym; dwa krążące wokół punktu w odległości jednego |
| Bojowy patrol powietrzny | krąży wokół stanowiska przez trzy minuty |
| Walka energetyczna / kątowa | w walce z bliska - kursy 30° od siebie, każdy na zmianę ma drugiego przed dziobem albo między nimi jest zabójstwo - używana wysokość i wspinaczka albo lot płaski z ostrym zakrętem i hamowaniem; pewne, gdy jeden zabił drugiego |
| Pakiet uderzeniowy, SEAD | grupa lotnicza o mieszanych rolach, z których część uderza w ziemię; zabójstwa obrony przeciwlotniczej przed większością innych zabójstw naziemnych |
| Linia bojowa, przecięcie T | trzy okręty w kolumnie; kolumna ustawiona w poprzek czoła kolumny wroga |

Każdy manewr mówi, które **wzorce** z bazy wiedzy pokazuje
(`patterns-maneuver.ts`: szyk, natarcie czołowe, podwójne oskrzydlenie,
okrążenie, przełamanie, ogień i manewr, pozorowanie, wycofanie, pościg,
obrona w głąb, osłanianie, rozproszenie, obrona przed pociskami, walka kątowa,
bojowy patrol powietrzny, pakiet uderzeniowy, linia bojowa, przecięcie T)
oraz wpisy, które warto przeczytać najpierw. Starsze wpisy przenoszą nowe
wzorce przez `knowledge/maneuver-tags.ts`. Zobacz [Soczewka wiedzy](knowledge.md).

**Opłacił się** porównuje wymianę jednostek podczas manewru (i minutę po nim)
z wymianą ich strony w całym meczu. Wycofanie się opłaca, gdy po zwrocie
straciło mniej jednostek niż przed nim; obrona przed pociskami, gdy samolot
przeżywa minutę; okrążenie, gdy kieszeń traci połowę.

## Przy wielu meczach {#over-many-matches}

Podsumowanie każdego meczu (`src/mass/summarize.ts`, zobacz [Analiza zbiorcza](mass-analysis.md))
zawiera mały dział `maneuvers`: dla każdego rodzaju i strony wykonane (przy
Prawdopodobnym lub wyższym), opłacone, nieopłacone, zabójstwa i straty.
**Analiza zbiorcza → Manewry** sumuje je po meczach, które przepuszcza filtr -
według mapy i trybu albo łącznie - z przedziałem Wilsona dla odsetka opłaconych.
Wiersz wczytuje mecze, w których manewr wystąpił. Podsumowania zapisane przed
powstaniem tego działu go nie mają: uruchom
`node tools/3dheat-summarize.mjs <folder> --force`, aby go dodać.

## Jak pewne są wyniki {#how-sure-it-is}

Syntetyczne mecze z wbudowanymi manewrami (`synth.ts`, uruchamiane przez
`maneuver.test.ts`): wszystkie 28 zaplanowanych rodzajów jest znajdowanych
na poziomie Prawdopodobnym lub wyższym; z 50 zgłoszonych manewrów 31 to
zaplanowany rodzaj, a pozostałe 19 też naprawdę tam jest (szyk poruszającej
się grupy, czołowe podejście wciskającej się kolumny); żaden nie jest błędny.
Na 30 meczach zerowych - błądzeniach losowych oddzielnych i wymieszanych,
jednostkach stojących losowo, samolotach na prostych kursach, tłumie kręcącym
się bez celu - nic nie jest zgłaszane na poziomie Prawdopodobnym lub wyższym.

Na prawdziwych danych (kilkadziesiąt bitew lądowych, kilka długich misji
wojny powietrznej, kilkanaście meczów strzelanek): natarcia czołowe, oskrzydlenia,
przełamania i okrążenia w bitwach czołgów, szyki i walki z bliska w powietrzu,
obrona przed pociskami, patrole CAP i pary lead-trail w misjach wojny
powietrznej, czołowe egzekucje, kolumny i kilka zasadzek i par skokowych w
strzelankach. Progi to kształty z doktryny przeniesione na skalę gry; pojedyncze
znalezisko czytaj razem z jego dowodami, a wskaźniki z tabeli zbiorczej razem
z ich przedziałami.

### Przeciw modelom zerowym tych samych meczów {#against-null-models-of-the-same-matches}

Detektor można oszukać przez teren i tłum: w zamieszaniu każda grupa ma
wrogów dookoła. Dlatego każdy rodzaj jest uruchamiany też na **modelach zerowych**
zbudowanych z tych samych meczów (`nulls.ts`), gdzie strony się już nie spotykają
tak jak naprawdę: oś czasu jednej strony obrócona o jedną trzecią do dwóch
trzecich meczu (*shift*) albo jej trasy obrócone wokół środka mapy (*rotate*);
oraz etykiety drużyn przetasowane (*teams*, co z konstrukcji zachowuje około
połowy prawdziwych walk). Walki liczą się tylko jako zabójstwa sparowane ze
swoimi śmierciami: zabójca w odległości 2 R, ofiara w tym miejscu - model zerowy
to rozbija. Znalezione na poziomie Prawdopodobnym lub wyższym w danych prawdziwych
i w modelach zerowych (30 bitew czołgów; 12 meczów strzelanek):

| Rodzaj | Bitwy czołgów: prawdziwe / shift / rotate | Strzelanka: prawdziwe / shift / rotate |
|---|---|---|
| Okrążenie | 0 / 0 / 0 (było 1,3 / 1,2 / 0,8) | 0 / 0 / 0 |
| Przełamanie | 0,03 / 0,02 / 0,05 (było 1,6 / 1,8 / 1,4) | 0 / 0 / 0 |
| Oskrzydlenie | 0,33 / 0,07 / 0,10 | 1,0 / 0,08 / 0,21 |
| Natarcie czołowe | 0,87 / 0,47 / 0,12 | 14,4 / 6,5 / 4,3 |
| Wycofanie | 0,03 / 0 / 0,02 | 0,08 / 0,08 / 0,5 (więc na piechocie nigdy nie jest pewne) |
| Zasadzka | - | 0,17 / 0,04 / 0,04 |
| Walka energetyczna | 1,2 / 0,1 / 0,85 | - |
| Walka kątowa | 0,6 / 0,07 / 0,3 | - |

Walki powietrzne z bliska nad środkiem pola bitwy przetrwają zwrot wokół tego
środka, więc kolumna rotate mniej im pochlebia niż przy rodzajach naziemnych.
Rodzaje wewnątrz jednej strony - szyk, patrol CAP, grinder, pakiet uderzeniowy,
SEAD, skoki, osłona - nie zależą od drugiej strony i nie są tak testowane.
`maneuver.test.ts` sprawdza, że modele zerowe usuwają zaplanowane w syntetycznych
meczach oskrzydlenie, kleszcze, okrążenie, przełamanie, zasadzkę i wycofanie.

## Ograniczenia {#limits}

- Grupy potrzebują pozycji w czasie; plik samych zdarzeń ich nie ma.
- Kierunku zwrócenia nie czyta się z danych: front wroga to miejsce, w którym
  siła wiążąca go angażuje, w przeciwnym razie tam, gdzie się porusza, a w ostateczności
  skąd przyszedł atakujący.
- Teren czyta się z wysokości jednostek (przeciwstok); nie ma testu linii widzenia.
- Bardzo duże pliki są próbkowane w dłuższych krokach; krótkie manewry lotnicze
  w nich są nadal czytane z kroków 2-4 s.
