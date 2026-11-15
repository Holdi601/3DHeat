---
title: "Zdarzenia kontroli pojazdu"
parent: "Analiza wyścigowa"
nav_order: 54
lang: "pl"
source: "race-control-events.md"
source_hash: "9ab565885c61"
translated: true
outdated: false
---

# Zdarzenia kontroli pojazdu

Widz ogląda, jak prowadzono każde okrążenie, i zaznacza miejsca, w których kierowca spowodował poślizg samochodu, obrót, uderzenie w coś albo stracił przyczepność. To jest przydatne, bo błąd, który kosztował czas, to najszybsza rzecz do poprawienia.

![Sekcja Panowanie nad samochodem: jak często każde okrążenie blokowało koło, kręciło się albo wypychało na zewnątrz, oraz lista usterek z jedną rozwiniętą](../assets/img/en/race-control-table.webp)

## Prostymi słowami {#in-plain-words}

- **Blokada**: hamujesz tak mocno, że koło przestaje się obracać i ślizga. Samochód hamuje wtedy gorzej i nie da się nim skręcać.
- **Buksowanie kół**: dociskasz gaz tak mocno, że napędzane koła kręcą się szybciej, niż jedzie samochód. Tracisz siłę napędu.
- **Nadsterowność**: tył samochodu ucieka na bok. Jeśli obróci się całkiem dookoła, to jest **obrót**.
- **Podsterowność**: przód samochodu ucieka na bok („pcha”); kręcenie kierownicą mocniej nie pomaga.
- **Uderzenie** i **rozbicie**: samochód dotknął czegoś (uderzenie to stuknięcie albo otarcie, rozbicie to mocny cios).
- **ABS**, **TC**: pomoce samochodu, które działają przeciw blokadzie i buksowaniu. Nie są błędami.

## Sekcja Panowanie nad samochodem (co widać) {#the-car-control-section-what-you-see}

Dla wybranego okrążenia pokazuje to, co dają okrążenia. Bez poślizgu opon i bez kąta dryfu pokazuje to, co nadal da się znaleźć, zamiast nic (poniżej).

**Tabela**: jeden wiersz na każdy rodzaj, który pokazuje choć jedno z dwóch okrążeń: Zablokowane koła, Buksowanie kół, Tył ucieka (nadsterowność i obroty), Pchanie na zewnątrz, Rozbicia, Uderzenia, Działanie ABS, Działanie kontroli trakcji, Hamulec ręczny, W powietrzu. Każda komórka to „liczba · sekundy” dla wybranego okrążenia i dla okrążenia, z którym jest porównywane. Jest też *Największy kąt dryfu*, gdy jest kąt dryfu (największy na ziemi).

**Lista**: jej niewspólne usterki, które kosztowały co najmniej 0,02 s, od najdroższej, najwyżej 12, każda z tytułem i kosztem (oraz znacznikiem swojego rodzaju). Kliknij jedną, żeby przeczytać jej podpowiedź, ustawić oba samochody 40 m przed nią i odtworzyć ją. **Także to, co zrobiły oba okrążenia tam** dodaje każdą usterkę, także wspólne (znacznik „obaj tak zrobili”, koszt „—” poniżej 0,01 s). Gdy nie ma żadnych: „Nic, co X zrobił oponami, nie kosztowało go czasu, czego Y też nie zrobił.”

**Podpowiedź pod nią** mówi, na czym wykrywanie mogło się oprzeć: „Z poślizgu każdego koła i jego kąta poślizgu oraz z kąta dryfu samochodu” (albo z poślizgu i kąta poślizgu, z poślizgu i kąta dryfu, tylko z poślizgu, albo „Tylko z kąta dryfu samochodu — te okrążenia nie mają poślizgu opon”). Mówi też, na jakiej nawierzchni mierzono granice (asfalt, luźna, mieszana: ponad 80% próbek na luźnej to luźna, poniżej 20% to asfalt), z którym okrążeniem zestawiono zdarzenia i jak liczy się koszt.

Gdy okrążenie **nie ma poślizgu opon i kąta dryfu** (plik okrążenia FH Companion bez swojej telemetrii), tabela i lista są pokazane tak samo, a podpowiedź mówi, co udało się znaleźć z tego, co okrążenie zawiera: „Te okrążenia nie mają poślizgu opon ani kąta dryfu, więc blokad i buksowania nie da się rozpoznać. Nadal znalezione: pchanie, z kierownicy względem toru; uderzenia i rozbicia, z prędkości i przyspieszenia.” Poślizgi z prędkości obrotu wokół pionu (yaw) też są wymieniane, gdy okrążenia mają tę wartość. Pchanie jest wymieniane tylko tam, gdzie są dane o kierownicy. Zdanie o granicach poślizgu i kąta dryfu jest pominięte, a druga podpowiedź mówi: „W Forza Horizon wybierz też plik `.tele.gz` obok każdego okrążenia FH Companion: to pełna telemetria, poślizg każdego koła 64 razy na sekundę.”

**Łączny** koszt panowania nad samochodem na okrążeniu (używany w podsumowaniach) liczy nakładające się usterki — blokadę i poślizg, który ją zaczyna, w odległości 40 m — tylko raz, według najdroższej z grupy.

## Jak to jest wykrywane {#how-it-is-detected}

Reszta tej strony to księga zasad: każdy rodzaj i każdy próg.

Kod: [`src/race/control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts),
[`src/race/impacts.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/impacts.ts),
[`src/race/derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts).
Uzasadnienie i literatura są w [metodzie](race-analytics.md).

## Rodzaje {#the-kinds}

| Rodzaj | Wiersz w tabeli | Usterka? | Najkrótsze, które się liczy |
|---|---|---|---|
| `lock` | Zablokowane koła | tak | 0,1 s |
| `wheelspin` | Buksowanie kół | tak | 0,15 s |
| `oversteer` | Tył ucieka | tak | 0,2 s |
| `spin` | (liczone z Tył ucieka) | tak | 0,1 s |
| `understeer` | Pchanie na zewnątrz | tak | 0,25 s |
| `crash` | Rozbicia | tak | - |
| `hit` | Uderzenia | tak | - |
| `abs` | Działanie ABS | nie | 0,2 s |
| `tc` | Działanie kontroli trakcji | nie | 0,2 s |
| `handbrake` | Hamulec ręczny | nie | 0,1 s |
| `airborne` | W powietrzu | nie | 0,15 s |

Krótsze serie to szum (krawężnik, wybój, jedna próbka). Serie punktów siatki (co 2 m), które przechodzą test, są łączone przez przerwy do 2 punktów. Tylko **usterki** mogą być błędami i mieć koszt; inne to to, co zrobiły samochód i kierowca.

## Co musi spełniać każdy test {#what-every-test-needs}

### Wyliczone kanały {#derived-channels}

Zanim cokolwiek zostanie ocenione, każde okrążenie dostaje to, czego jego gra nie wysyła, pod wspólnymi nazwami (wartość gry zawsze wygrywa).

| Kanał | Z czego |
|---|---|
| `bodySlip` (kąt dryfu) | prędkość w układzie samochodu, `atan2(latVel, abs(longVel))`, tam gdzie gra ją wysyła (0 poniżej 3 m/s); w przeciwnym razie kierunek jazdy (yaw gry, dopasowany do kierunku ruchu przez znak i przesunięcie na próbkach szybszych niż 10 m/s, ufany tylko przy kołowej wariancji poniżej 0,05) względem kierunku ruchu (pozycje co najmniej 2 m od siebie), przy prędkościach powyżej 3 m/s |
| `yawRate` | zmiana `yaw` w czasie, tam gdzie jest kierunek, ale nie ma prędkości |
| `airborne` | kontakt każdego koła z ziemią wyłączony (≤ 0,5); w przeciwnym razie obciążenie każdego koła poniżej 5% jego mediany; w przeciwnym razie każde ugięcie zawieszenia na poziomie lub poniżej 0,02 (w pełni wyprostowane). Jedna przypadkowa próbka nie jest lotem |
| `slipRatio.<W>` | `(prędkość powierzchni koła - prędkość samochodu) / prędkość samochodu` powyżej 3 m/s, tam gdzie gra wysyła prędkości powierzchni kół; albo z obrotu koła × promienia tocznego zmierzonego na okrążeniu — mediana `prędkość / obrót` podczas toczenia prosto (prędkość powyżej 10 m/s, gaz poniżej 0,3, hamulec poniżej 0,05, abs(przyspieszenie wzdłużne) poniżej 3 m/s², nie w powietrzu; każda próbka powyżej 10 m/s, gdy jest mniej niż 20), przyjmowana między 0,1 a 1 m. Oznaczone jako `physical` |
| `loose` | dźwięk nawierzchni Forzy na co najmniej 2 kołach (> 0,001) przez co najmniej 0,33 s (krawężnik jest krótszy), przerwy poniżej 1 s są łączone |

### Na ziemi i ustabilizowany {#on-the-ground-and-settled}

Nic nie jest oceniane w powietrzu ani przez **0,3 s po lądowaniu** — zawieszenie wbija się w dół i przyspieszenia skaczą, a to nie jest przyczepność, hamowanie ani napęd. Próbka też musi **się poruszać**: szybciej niż 5 m/s.

### Nawierzchnia {#the-ground}

Nawierzchnia każdej próbki jest **luźna** tam, gdzie kanał `loose` okrążenia tak mówi (dźwięk nawierzchni Forzy, materiały kół Trackmanii), w przeciwnym razie nawierzchnia okrążenia (zob. [dyscyplina i nawierzchnia](race-loading-laps.md#discipline-and-surface)): asfalt albo luźna dla wszystkiego innego. Krzywe, nawyki dryfu i progi są oddzielne dla asfaltu i luźnej nawierzchni.

### Poślizg jako wielokrotność nominalnego szczytu opony {#slip-as-a-multiple-of-the-tyres-nominal-peak}

Gry skalują poślizg inaczej; `meta.slip` mówi, jak, i każdy poślizg jest dzielony przez skalę tak, że około 1 to nominalny szczyt opony:

| `meta.slip` | Znaczenie | Dzielone przez |
|---|---|---|
| `peak` | znormalizowane przez grę: po przekroczeniu 1 przyczepność jest tracona (Forza Data Out) | 1 |
| `scaled` | fizyczny poślizg podzielony przez szczyt na asfalcie (rejestrator Kunosa) | nominalny szczyt nawierzchni podzielony przez asfaltowy |
| `index` | miara poślizgu 0..1 (SlipCoef Trackmanii) | 0,5 |
| `physical` (lub nieznane) | współczynnik poślizgu jako ułamek, kąt poślizgu w radianach | nominalny szczyt nawierzchni |

Nominalne szczyty, gdy nic lepszego nie jest znane:

| Nawierzchnia | Współczynnik poślizgu | Kąt poślizgu |
|---|---|---|
| asfalt | 0,12 | 8° |
| mieszana | 0,18 | 12° |
| luźna (żwir) | 0,25 | 15° |
| śnieg | 0,25 | 15° |
| lód | 0,10 | 6° |

### Gdzie kończy się przyczepność: krzywe opon każdego samochodu {#where-grip-ends-each-cars-tyre-curves}

Miejsce, w którym opona przestaje dawać więcej, jest **mierzone dla każdego samochodu** z każdego obciążonego okrążenia (`measureTyres`), osobno dla asfaltu i luźnej nawierzchni:

| Krzywa | Próbki (prędkość powyżej 10 m/s, ustabilizowane, przyspieszenia poniżej 45 m/s²) | Poślizg (x) | Siła (y) |
|---|---|---|---|
| hamowanie | hamulec powyżej 0,3, hamulec ręczny ≤ 0,2, jazda prosto (boczne poniżej 30% najmocniejszego) | abs(średni współczynnik poślizgu czterech kół) | opóźnienie |
| trakcja | gaz powyżej 0,8, hamulec ≤ 0,05, prosto, pełny ciąg samochodu przy tej prędkości powyżej 0,5 m/s² | współczynnik poślizgu największego napędzanego koła | przyspieszenie jako udział tego ciągu |
| przód | boczne powyżej 30% najmocniejszego, przyczepność samochodu przy tej prędkości powyżej 1 m/s² | większy poślizg kąta przedniego | boczne przyspieszenie jako udział tej przyczepności |
| tył | to samo | większy poślizg kąta tylnego | to samo |

„Najmocniejsze” to 99. percentyl abs(bocznego przyspieszenia) okrążenia na tej nawierzchni (cała nawierzchnia, gdy ma mniej niż 50 próbek). Układ napędowy decyduje, które koła są napędzane (przednie w FWD, tylne w RWD, wszystkie w AWD; nieznany: wszystkie).

Od co najmniej **150 próbek** poślizg jest dzielony na 6 do 14 równych grup (jedna na 40 próbek), siła każdej grupy to jej górny kwartyl (to, co opona dała, gdy kierowca o to prosił), wygładzony po sąsiednich grupach. **Najlepsza** to grupa z największą siłą; **granica** to pierwsza grupa za nią, w której siła spadła o **8%**. Krzywa, która nigdy nie spada w danych, nie ma granicy (nieskończona) — przekroczenie „szczytu” nic nie kosztuje w tej grze, a sam poślizg niczego tam nie oznacza (tak jest z krzywymi skrętu i trakcji Forza Horizon). Gdy na jednej nawierzchni jest za mało próbek, używa się krzywych drugiej nawierzchni; gdy jest ich za mało w sumie, używa się **nominalnej** granicy: 1,5 razy nominalny szczyt.

Każdy samochód dostaje też:

- swój **nawyk dryfu**: górny kwartyl jego kąta dryfu wszędzie tam, gdzie skręca przy 60% najmocniejszego lub więcej (potrzeba 100 próbek);
- swoje **skręcanie na krzywiznę** (`steerGain`), dla każdego przedziału prędkości co 5 m/s: mediana abs(skręt) / krzywizna toru podczas mocnego skrętu, ale wyraźnie w granicach przyczepności (30–60% najmocniejszego, krzywizna ciaśniejsza niż promień 400 m, skręt powyżej 0,02; 25 próbek na przedział). Krzywizna toru to prędkość obrotu przez prędkość tam, gdzie gra wysyła prędkość obrotu, w przeciwnym razie z pozycji ±5 m.

## Wykrywanie, rodzaj po rodzaju {#detection-kind-by-kind}

| Rodzaj | Test (na próbkach w ruchu i ustabilizowanych) | `peak` i `limit` |
|---|---|---|
| **lock** | hamulec powyżej 0,05, hamulec ręczny nie powyżej 0,2, a poślizg któregokolwiek koła poniżej ujemnej granicy hamowania | najbardziej ujemny poślizg (wielokrotności nominalnego szczytu); granica jako ujemna |
| **wheelspin** | gaz powyżej 0,2 (albo brak kanału gazu), a poślizg napędzanego koła powyżej granicy trakcji | największy poślizg napędzany; granica |
| **oversteer** (kąt dryfu) | kąt dryfu powyżej większego z progu nawierzchni i 1,5 × nawyku dryfu samochodu tam | największy kąt dryfu, w radianach |
| **oversteer** (kąty poślizgu, bez kąta dryfu) | większy kąt poślizgu tyłu powyżej granicy tyłu i więcej niż o 0,25 od większego z przodu | kąt poślizgu tyłu (wielokrotności szczytu) |
| **oversteer** (bez kąta dryfu, ale z prędkością obrotu i bocznym przyspieszeniem) | „prędkość postawy” — abs(prędkość obrotu) minus abs(boczne przyspieszenie) / prędkość, powyżej 8 m/s — powyżej 0,2 rad/s, z kierownicą przeciwko zakrętowi | rad/s; granica 0,2 |
| **spin** | serie nadsterowności, których szczytowy kąt dryfu przekroczył **60°** | jak nadsterowność |
| **understeer** (kąty poślizgu) | bez ślizgu, większy kąt poślizgu przodu powyżej granicy przodu i więcej niż o 0,3 od tyłu | kąt poślizgu przodu; granica |
| **understeer** (bez kątów poślizgu) | szybciej niż 12 m/s, bez ślizgu, bez kontrskrętu, boczne przyspieszenie powyżej połowy najmocniejszego okrążenia (99. percentyl), tor ciaśniejszy niż promień 300 m i skręt więcej niż **1,6 razy** tego, co skręcanie samochodu na krzywiznę mówi, że tor wymagał | razy potrzebny skręt; granica 1,6 |
| **abs**, **tc** | `absActive` / `tcActive` powyżej 0,5 | - |
| **handbrake** | `handbrake` powyżej 0,2 | - |
| **airborne** | `airborne` powyżej 0,5 | - |
| **hit**, **crash** | zob. [Uderzenia i rozbicia](#hits-and-crashes) | prędkość, jaką zabrało uderzenie |

Progi kąta dryfu według nawierzchni: asfalt **7°**, mieszana **10°**, luźna i śnieg **15°**, lód **10°**. Samochód, który jeździ bokiem z natury — model opon arcade, specjalista od żwiru — ma własny, wyższy próg z własnych okrążeń (1,5 × nawyk).

**W którą stronę skręca samochód** (dla „przeciwko zakrętowi”): zmiana kierunku toru okrążenia na ±6 m (co najmniej 2 punkty siatki); ciaśniejsze niż promień 600 m liczy się jako skręt; w prawo lub w lewo zależnie od tego, czy świat jest odbity lustrzanie. Skręt jest **przeciwko** zakrętowi, gdy abs(skręt) > 0,05, a jego znak jest przeciwny do skrętu — poślizg **opanowywany** kontrskrętem.

**Pedały na początku** (`pedal`): *hamulec*, gdy hamulec powyżej 0,1; *gaz*, gdy gaz powyżej 0,3; *puszczony*, gdy gaz był powyżej 0,5 w ciągu 8 punktów siatki (16 m) przed tym; w przeciwnym razie *toczenie* (albo bez kanału gazu).

## Zestawione z drugim okrążeniem {#laid-against-the-other-lap}

Każde zdarzenie jest oceniane względem okrążenia, z którym porównuje się wybrane okrążenie w tym odcinku (najlepsze z jego klasy; dla samego tego okrążenia — kto z jego klasy był najszybszy w tym odcinku):

1. **Jak daleko zajechało drugie okrążenie** na tych samych metrach, ±8 m: własne zdarzenia drugiego okrążenia z tej samej rodziny (obrót liczy się jak nadsterowność, rozbicie jak uderzenie), mierzone w tych samych jednostkach, bez progów, z użyciem krzywych opon drugiego samochodu.
2. **Wspólne**, gdy drugie okrążenie zajechało **80%** tak daleko albo dalej: tak się pokonuje ten zakręt, to nie błąd. Rodzaje niebędące usterkami są zawsze „wspólne”.
3. **Koszt**, dla niewspólnej usterki: czas, jaki to okrążenie straciło względem drugiego, od 5 m przed zdarzeniem do **40 m po** nim (przy uderzeniu lub rozbiciu — aż samochód odzyska prędkość: metry potrzebne do odzyskania przy jego własnym ciągu, od 40 do 400 m; bez zmierzonego ciągu 5 m/s²). Nigdy ujemny.
4. **Oddana prędkość** do granicy samochodu: przy blokadzie opóźnienie, jakie samochód pokazuje, że może osiągnąć przy tej prędkości, minus to, co zrobił, zsumowane przez zdarzenie; przy buksowaniu jego pełny ciąg minus to, co zrobił; przy uderzeniu prędkość, jaką zabrało. Podawane, gdy powyżej 0,5 m/s (1,8 km/h).

Usterka, która nie jest wspólna i kosztowała co najmniej **0,02 s**, jest wymieniana ([statystyki trasy](race-course-statistics.md) liczą tylko usterki od **0,03 s** wzwyż, żeby błąd policzony na wielu okrążeniach był wyraźny), i może stać się przyczyną straty na zakręcie (zob. [Analiza zakręt po zakręcie](race-corner-analysis.md#car-control-faults-and-impacts)).

## Uderzenia i rozbicia {#hits-and-crashes}

`impacts.ts` czyta uderzenia z **własnych próbek okrążenia**, przed ich ponownym próbkowaniem — uderzenie trwa setne części sekundy. Opony nie mogą wytworzyć sił uderzenia, więc uderzenie mierzy się względem własnego samochodu okrążenia:

- **Jego przyczepność `G`**: 99. percentyl jego przyspieszenia poziomego `√(lat² + long²)` na okrążeniu, na ziemi i szybciej niż 5 m/s. Bez kanałów przyspieszenia (albo poniżej 3 m/s²) 15 m/s² — przyczepność samochodu drogowego.
- **Próg**: `max(1,8 G, G + 18, 30)` m/s².
- **Próbka uderzona**: przyspieszenie poziome powyżej progu *i* skok o więcej niż połowę `G` względem poprzedniej próbki; **albo** spadek prędkości w ciągu 0,1 s o więcej niż próg dałby w 0,1 s plus 1,5 m/s. Tylko na ziemi i ustabilizowane, i tylko gdy samochód jechał szybciej niż 5 m/s.
- Uderzone próbki w ciągu **0,4 s** są jednym uderzeniem.
- **Przed / po**: najwyższa prędkość w 0,15 s przed; najniższa do 0,3 s po ostatniej uderzonej próbce.
- **Nie uderzenie**: utrata prędkości bez siły za nią — szczytowe poziome przyspieszenie w ciągu 0,1 s poniżej większego z `G` i 25 m/s² — to gra cofająca albo resetująca samochód.
- **Rozbicie**, gdy zabrało **30 km/h** lub więcej albo zostawiło samochodowi mniej niż połowę prędkości; w przeciwnym razie **uderzenie** — stuknięcie, otarcie o ścianę.
- **Kierunek**: przyspieszenie wzdłużne większe od bocznego i ujemne: *czołowe*; dodatnie: *od tyłu*; boczne większe: *wzdłuż boku*. Bez przyspieszeń: czołowe.

To, co samochód potrafi, jest mierzone bez wszystkich uderzeń, od 0,1 s przed nim do 1 s po nim (`struckMask`).

## Teksty {#the-texts}

Każde zdarzenie jest opisane, nazywając oba okrążenia, z podaniem miejsca (metry wzdłuż odniesienia), prędkości, z jaką się zaczęło, o ile przekroczono granicę względem drugiego okrążenia, i podpowiedzi. Podpowiedź wynika z rodzaju i tego, co zmierzono:

| Zdarzenie | Podpowiedź |
|---|---|
| blokada, tylko przednie | zablokowane przednie koło nie skręca: mniej nacisku na górze strefy, puść hamulec w zakręt |
| blokada, tylko tylne | zablokowany tył pozwala samochodowi się obracać: hamuj mocniej na prostej, mniej puszczaj przy wejściu w zakręt; przesuń podział hamowania do przodu, jeśli to się powtarza |
| blokada, luźna nawierzchnia | zablokowane koło orze: dociskaj tylko do tuż przed blokadą |
| blokada, inaczej | za dużo pedału jak na przyczepność: dociskaj stopniowo |
| buksowanie | dawkuj gaz, gdy kierownica się rozkręca, krótko zmieniaj biegi tam, gdzie ogranicza trakcja (na luźnej: wyższy bieg łagodzi moment) |
| obrót / nadsterowność | według pedału: pod hamowaniem (za mocne hamowanie w zakręcie, za wczesne redukowanie), puszczony (nadsterowność po puszczeniu gazu: trzymaj równy gaz), na gazie (za dużo, gdy wciąż skręcony), żadnym (wszedł w zakręt za szybko); „opanowany kontrskrętem”, gdy kontrskręcono; na luźnej nawierzchni albo w rajdzie „jakiś kąt to szybka droga — tamten przejazd wystarczył” |
| podsterowność | więcej skrętu nic nie daje, gdy przód już odszedł: wjedź wolniej, trochę hamulca z tyłu, żeby obciążyć przód, rozkręcaj; na luźnej nawierzchni skręć samochód puszczeniem gazu albo lekkim dotknięciem lewą stopą |
| uderzenie / rozbicie | wzdłuż boku: metr zapasu kosztuje mniej niż otarcie; od tyłu: inny samochód albo cofanie w poślizgu; rozbicie czołowe: hamuj wcześniej; stuknięcie z przodu: coś się zahaczyło. „X też tam uderzył.”, gdy wspólne |

W Trackmanii poślizg mówi też: poniżej około **400 km/h** (**300** na luźnej nawierzchni: piach, trawa, plastik) poślizg daje mniej napędu niż trzymanie się drogi; powyżej, poślizg pod właściwym kątem zyskuje, a ten kosztował czas, więc jego kąt był zły.

## Co pozwala każde źródło {#what-each-source-allows}

| Okrążenia zawierają | Blokady / buksowanie | Nadsterowność / obrót | Podsterowność |
|---|---|---|---|
| poślizg każdego koła i kąt poślizgu, prędkość samochodu (Forza Data Out, gry AC) | z poślizgu | z kąta dryfu albo z kąta poślizgu tyłu | z kątów poślizgu |
| prędkości kół, prędkość w świecie (gry rajdowe, BeamNG) | z wyliczonego poślizgu | z wyliczonego kąta dryfu | z skrętu na krzywiznę |
| odchylenie (yaw) i prędkość obrotu, bez poślizgu (iRacing) | - | z kąta dryfu (dopasowany yaw względem kierunku jazdy); z prędkości postawy z kontrskrętem tylko wtedy, gdy yaw nie jest wiarygodny | z skrętu na krzywiznę |
| tylko kierunek | - | z kierunku względem jazdy | z skrętu na krzywiznę |
| sam plik okrążenia FH Companion (bez yaw, bez poślizgu) | - | - | z skrętu na krzywiznę (ma skręt i przyspieszenia) |

Uderzenia i rozbicia potrzebują tylko prędkości (lepiej z przyspieszeniami), więc każde źródło je ma. Sekcja **Panowanie nad samochodem** pokazuje, co pozwala każde źródło: przy samym pliku okrążenia FH Companion — jego pchanie z kierownicy i uderzenia, oraz podpowiedź, by załadować `.tele.gz` po resztę.
