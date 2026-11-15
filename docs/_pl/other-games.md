---
title: "Inne gry wyścigowe"
parent: "Analiza wyścigowa"
nav_order: 59
lang: "pl"
source: "other-games.md"
source_hash: "79f0f087f176"
translated: true
outdated: false
---

# Inne gry wyścigowe w przeglądarce

Przeglądarka odczytuje okrążenia z wielu gier wyścigowych, nie tylko z jednej. Ta strona wymienia je i mówi, jak zdobyć okrążenie z każdej z nich.

## Gry {#the-games}

| Gra | Rejestrator | Poślizg w pliku? | Świat odbity lustrowo? | Uwagi |
|---|---|---|---|---|
| Forza Horizon 4/5/6, Forza Motorsport | `heat3d_capture telemetry` (Data Out przez UDP) albo pliki okrążeń FH Companion i ich `.tele.gz` | tak, dla każdego koła (znormalizowany) | tak (świat lewoskrętny) | `.tele.gz` obok każdego pliku okrążenia FH Companion daje poślizg każdego koła; sam plik okrążenia tego nie daje |
| Assetto Corsa, ACC, AC EVO, AC Rally | `heat3d_capture telemetry --game ac / acc / acevo / acrally` (pamięć współdzielona) | tak, dla każdego koła | mierzone z okrążeń | także działanie ABS i kontroli trakcji, obciążenia kół, temperatury |
| EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4 | `heat3d_capture telemetry --game wrc / dirtrally2 / dirtrally / dirt4` (UDP) | nie, wyliczane z prędkości kół | mierzone z okrążeń | rajdy: luźne podłoże i skoki są oceniane inaczej |
| Richard Burns Rally | `heat3d_capture telemetry --game rbr` (UDP NGP) | nie | mierzone z okrążeń | brak prędkości kół |
| BeamNG.drive | `heat3d_capture telemetry --game beamng` (mod) | nie, wyliczane z prędkości kół | mierzone z okrążeń | |
| Trackmania | wtyczka Openplanet, `telemetry --game trackmania --install` | współczynnik poślizgu dla każdego koła | mierzone z okrążeń | fizyka zręcznościowa: poślizgi są oceniane inaczej |
| iRacing | brak: własny plik `.ibt` | nie (nie jest zapisywany); wyliczany z odchylenia (yaw) | nie (na podstawie GPS) | włącz zapis w samochodzie klawiszem Alt+L |

## Jak nagrać okrążenie {#how-to-record-a-lap}

1. Wybierz swoją grę w tabeli i skonfiguruj ją tak, jak podaje strona rejestratora dla tej gry (ustawienie w grze, mod albo nic w przypadku iRacing). Kroki różnią się w zależności od gry, dlatego są w dokumentach rejestratorów: [GameCapture: gry](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md).
2. Uruchom rejestrator i jedź. Zapisuje on jeden plik na okrążenie.
3. W karcie **Analiza wyścigowa** naciśnij **Wczytaj pliki okrążeń…** i wybierz co najmniej dwa okrążenia tego samego toru (zobacz [Wczytywanie okrążeń](race-loading-laps.md)).

W grach rajdowych rejestrator zapisuje jeden plik na przejazd odcinka, a dla Forzy najłatwiej zacząć od biblioteki FH Companion z plikami `.tele.gz` obok plików okrążeń.

## Co dokumentują rejestratory {#what-the-recorders-document}

Jak każda gra jest nagrywana, co wysyła, skąd pochodzą jej układy oraz które tory można wyeksportować z jej plików, opisują rejestratory: [GameCapture: gry](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md) (publiczne, w [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture)). Plik okrążenia, który zapisuje każdy rejestrator, opisuje [GameCapture: format okrążenia](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).

## Co przeglądarka z nimi robi {#what-the-viewer-does-with-them}

Każda gra kończy jako pliki `heat3d-lap` (albo jako CSV z okrążeniem, albo jest odczytywana bezpośrednio, jak `.ibt` z iRacing). Mają one kanoniczne nazwy kanałów z `src/race/schema.ts` oraz blok `meta`, który mówi, co znaczą ich liczby: jak skalowany jest ich poślizg, czy to tor, rajd czy tryb zręcznościowy, oraz nawierzchnia, jeśli jest znana. Dzięki temu karta **Analiza wyścigowa** traktuje je wszystkie tak samo. Gdy nie jest wczytany model toru, karta **Analiza wyścigowa** rysuje drogę z własnego rozrzutu okrążeń, więc każda gra da się użyć bez modelu.

Czego nie wysyła żadna z gier rajdowych, czyli poślizgu opon, przeglądarka wylicza sama: z prędkości styku koła z podłożem albo prędkości powierzchni koła względem prędkości samochodu tam, gdzie gra ją wysyła (`(koło - samochód) / samochód`), a tam, gdzie wysyła tylko obroty, z obrotów i promienia tocznego zmierzonego na samym okrążeniu. Kąt znoszenia pochodzi z własnej prędkości samochodu (Forza, gry AC, Trackmania, RBR), z prędkości świata rzutowanej na osie samochodu (EA WRC, DiRT, BeamNG) albo z kierunku jazdy względem ścieżki. To, czy samochód jest w powietrzu, wynika ze styku kół, obciążeń lub zawieszenia. Zobacz `src/race/derive.ts`.

Gdy świat gry jest lewoskrętny, tak jak w Forzy, tor w przeglądarce jest odbity lustrowo. Skręt i zawieszenie samych okrążeń to ujawniają, a karta **Analiza wyścigowa** proponuje odwrócenie jednej osi. Gry, w których skrętność nie jest udokumentowana (RBR, BeamNG, Trackmania), są obsługiwane tak samo: mierzone, a nie zakładane.

Poza kanałami jazdy rejestratory zapisują to, co dodaje każda gra: w grach AC działanie ABS i kontroli trakcji, rozkład hamowania, DRS, ogranicznik alei serwisowej, doładowanie oraz żywotność klocków i tarcz hamulcowych; w iRacing ustawienia wspomagania, rozkład hamowania, paliwo, temperatury oleju i wody oraz każdy inny kanał, który loguje pod własną nazwą. Przeglądarka rysuje je z własnej tabeli kanałów (lampki, poziomy, symbole, wykresy), więc zapis większej liczby kanałów nie wymaga zmian w przeglądarce.
