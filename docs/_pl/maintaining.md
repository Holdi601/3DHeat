---
title: "Utrzymanie dokumentacji"
nav_order: 23
lang: "pl"
source: "maintaining.md"
source_hash: "4a4fb46273e5"
translated: true
outdated: false
---

# Utrzymanie dokumentacji

Ta strona jest dla tego, kto opiekuje się przeglądarką i tą witryną. Wymienia kroki, które utrzymują strony, obrazy i tłumaczenia w porządku po zmianie.

Ta witryna jest sprawdzana ponownie przy **każdym wydaniu** i zawsze, gdy coś zmienia się mocno: skróty klawiszowe, drogę przez interfejs, ustawienia, formaty plików. Lista kontrolna:

1. **Wygeneruj ponownie strony z odnośnikami**: `node tools/docs-refs.mjs` (oraz `--lang <język>` dla każdego języka). `node tools/docs-refs.mjs --check` kończy się błędem, gdy strona jest nieaktualna.
2. **Wygeneruj ponownie zrzuty ekranu** z [danych demonstracyjnych](demo-data.md). Użyj komputera albo kontenera z regionem en-US, aby liczby wyglądały jak `0.35`, a nie `0,35` (pola liczbowe podążają za regionem przeglądarki, dopóki go nie zmienisz). Wygeneruj dane demonstracyjne poleceniem `node tools/demo-data.mjs`, uruchom serwer deweloperski na porcie 5321 **bez** lokalnego pakietu figur, `HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1`, a potem uruchom `node tools/docs-shots.mjs --lang <język>`. Obejrzyj każdy obraz: tylko nazwy z wersji demonstracyjnej (*Demo Valley*, *Blue 1*, *Red 3* ...), żadnych prawdziwych map, graczy ani nagrań.
3. **Wypisz, co się zmieniło** od ostatniego tagu wydania: `git log --oneline <ostatni tag>..HEAD` oraz sekcję **Docs** w `CHANGELOG.md`, która przypisuje każdą funkcję do strony. Każda nowa funkcja potrzebuje strony albo sekcji, z obrazem, gdy jest widoczna na ekranie.
4. **Niezależny przegląd** stron angielskich przez kogoś, kto ich nie pisał, dla trzech czytelników: początkującego, ośmiolatka i eksperta. Czy kroki są kompletne i w dobrej kolejności, czy słowa są słowami interfejsu, czy obrazy są aktualne, czy etykiety na diagramach są poprawne?
5. **Napraw to, co wykazał przegląd.**
6. **Przetłumacz ponownie zmienione strony** według ich skrótu źródła, a potem przeprowadź przegląd dla każdego języka. Zobacz `tools/docs-translate.md`.
7. **Przeszukaj zmienione pliki** pod kątem poufnych terminów i sprawdź, czy żaden obraz nie pokazuje czegoś poza danymi demonstracyjnymi.
8. **Opublikuj** tylko wtedy, gdy wydanie zostało zatwierdzone.

Ten sam przegląd obejmuje witryny dokumentacji powiązanych repozytoriów (zobacz stronę [Strona główna](index.md#related-repositories)).

## Narzędzia w katalogu exporters/ {#the-tools-under-exporters}

Narzędzia wokół przeglądarki są oddzielnymi publicznymi projektami, każdy z własną licencją MIT, wydaniami, wiki i sprawdzaniem aktualizacji, przypiętymi w tym repozytorium jako submoduły git:

| Katalog | Repozytorium |
|---|---|
| `exporters/gamefiles/` | [3DHeat-GameFiles](https://github.com/Holdi601/3DHeat-GameFiles) - tory i poziomy z własnych archiwów gier |
| `exporters/gamecapture/` | [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture) - rejestratory telemetrii okrążeń; poziomy z nagrań wideo z rozgrywki |
| `exporters/unreal/` | [3DHeat-UnrealExporter](https://github.com/Holdi601/3DHeat-UnrealExporter) - wtyczka do Unreal Editor |
| `exporters/cs2/` | [3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2) - dema CS2 i mapy |
| `exporters/watcher/` | [3DHeat-Watcher](https://github.com/Holdi601/3DHeat-Watcher) - nagrywa grę w tle |

**Przypięte** oznacza, że to repozytorium zapisuje jeden dokładny commit każdego narzędzia. Kopia przeglądarki dostaje te commity:

```bash
git clone --recursive https://github.com/Holdi601/3DHeat
# albo, po zwykłym klonowaniu:
git submodule update --init
```

Obie ścieżki aktualizacji powyżej uruchamiają `git submodule update --init` po pobraniu, więc narzędzia podążają za przeglądarką do commitów, które przypina jej najnowsza wersja - a nie za najnowszymi commitami samych narzędzi. Nowsze wydanie narzędzia trafia do przeglądarki, gdy przesunie się przypięcie w tym repozytorium: zmiany w narzędziu są najpierw zatwierdzane i wysyłane w jego własnym katalogu (we własnym repozytorium), a dopiero potem nowe przypięcie jest zatwierdzane tutaj. Każde narzędzie sprawdza też własne nowsze wydania; jest to opisane w jego własnym repozytorium.
