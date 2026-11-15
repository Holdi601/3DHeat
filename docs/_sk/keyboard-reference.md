---
title: "Referencia klávesnice a myši"
parent: "Kamera a ovládanie"
nav_order: 2
lang: "sk"
source: "keyboard-reference.md"
source_hash: "fee7cd0beb88"
translated: true
outdated: false
---

# Referencia klávesnice a myši

Každá klávesa a každá akcia myšou na jednom mieste, aby ste našli tú, ktorú potrebujete. Najprv kliknite do pohľadu, aby mal klávesnicu. Klávesy sa ignorujú, keď má fokus textové pole alebo rozbaľovací zoznam. Krátka verzia sa vypisuje aj v ľavom dolnom rohu pohľadu.

Rýchle hľadanie:

| Chcem ... | Stlačte |
|---|---|
| lietať | `W A S D`, ťahajte na obzeranie |
| vidieť všetko | `F` |
| prehrať alebo pozastaviť | `K` |
| prehrávať dozadu | `J` (znova stlačte na pozastavenie), dopredu `L` |
| vidieť, čo farby znamenajú | `?` alebo `F1` |
| vrátiť späť na karte Taktika | `Ctrl+Z` |

## Kamera {#camera}

Z [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

| Vstup | Účinok |
|---|---|
| `W` / `↑` | Dopredu v smere pohľadu |
| `S` / `↓` | Dozadu |
| `A` / `←` | Bočný krok vľavo |
| `D` / `→` | Bočný krok vpravo |
| `Space` / `E` | Nahor |
| `Q` / ľavý `Ctrl` | Nadol |
| `Shift` (ktorýkoľvek) | Podržať: 6-násobná rýchlosť |
| ľavý `Alt` | Podržať: 15 % rýchlosti |
| Ľavé alebo pravé ťahanie na pohľade | Obzeranie (ukazovateľ zamknutý, kým držíte tlačidlo) |
| Koliesko (perspektíva) | Rýchlosť letu ×1,5 na jedno klapnutie (najviac 4 klapnutia na jednu udalosť kolieska) |
| Koliesko (paralelne) | Priblíženie |
| Pravý klik | Nad pohľadom sa neotvorí kontextová ponuka |

## Všeobecne {#global}

Z [`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx).

| Klávesa | Účinok |
|---|---|
| `K` | Prehrať / pozastaviť [časovú os](timeline.md) |
| `F` | Zarámovať dáta |
| `C` | Skopírovať polohu kamery, odchýlku a sklon ([odčítanie kamery](camera.md#camera-readout)) |
| `G` | Ísť na napísaný bod: otvorí pole pod odčítaním kamery |
| `Esc` | Zavrieť kartu bodu; potom prestať pozerať na druhú jednotku; potom prestať sledovať jednotku |
| `T` | Taktický displej zapnutý alebo vypnutý ([Prehrávanie zápasu](match-replay.md#display-style)) |
| `?` / `F1` | Režim nápovedy: čo farby znamenajú ([Nastavenia, jednotky a klávesy](settings.md#help-mode)) |
| `1` | [Teplo](heat.md) |
| `2` | [Rozdiel](difference.md) |
| `3` | [Teplo tímov](team-heat.md) |
| `4` | [Čiary](line-heat.md) |
| `]` | Hranica vzdialeného orezania von ×1,12 (`Shift`: ×1,35) |
| `[` | Hranica vzdialeného orezania dnu ÷1,12 (`Shift`: ÷1,35) |
| `\` | Hranica vzdialeného orezania vypnutá / znova zapnutá tam, kde bola ([Hĺbka a orezávanie](depth-and-culling.md#keyboard)) |

Režim **Prekrytie figúrok** nemá číselnú klávesu; vyberte ho na paneli režimov alebo otvorte kartu Zápas. Číselné klávesy prechádzajú rovnakou kontrolou ako panel režimov: klávesa pre režim, ktorý panel pri načítaných dátach zobrazuje ako nedostupný, nerobí nič.

## Prehrávanie zápasu {#match-replay}

V režime Prekrytie figúrok, ktorý používa karta Zápas ([Prehrávanie zápasu](match-replay.md)). Fungujú, keď je jednotka sledovaná alebo nie, okrem prípadov, ktoré sú uvedené:

| Klávesa | Účinok |
|---|---|
| `B` | Pridať záložku: okamih a kamera |
| `M` | 2D mapa: roh, celý pohľad, vypnuté |
| `V` / `Shift+V` | Ďalší / predchádzajúci pohľad kamery na sledovanú jednotku |
| `H` | Head-up displej v kokpite a pohľadoch padlock |
| `Page Down` / `Page Up` | Ďalšia / predchádzajúca udalosť druhov, ktoré zoznam udalostí zobrazuje |
| `J` | Prehrávať dozadu; znova na pozastavenie |
| `L` | Prehrávať dopredu; znova na pozastavenie |
| `.` / `,` | Sekunda dopredu / dozadu, pozastavené (`Shift`: desať sekúnd) |
| `Esc` | Najprv prestať pozerať na cieľ, potom prestať sledovať |
| `Ctrl`+klik alebo `Alt`+klik na jednotku (v pohľade alebo v zozname jednotiek) | Pozrieť sa na ňu z sledovanej jednotky (pohľad na dve jednotky); kliknutím znova ju zrušíte |
| `Shift`+klik na dve jednotky | Zmerať medzi nimi: smer, vzdialenosť, rozdiel výšok |

`V` potrebuje sledovanú jednotku. `M` je tu 2D mapa a v karte Taktika znamená „presun“.

## Sledovanie jednotky {#following-a-unit}

Keď kamera sleduje jednotku, koliesko a klávesy letu ju obchádzajú namiesto voľného letu ([Kamera](camera.md#while-following-a-unit)):

| Vstup | Účinok |
|---|---|
| Koliesko, `W` / `S` | Bližšie / ďalej (vyššie / nižšie v satelitnom pohľade). Nie v pohľade z kokpitu a padlock. |
| `A` / `D`, `Q` / `E` | Obiehať okolo jednotky (pohľady zozadu a orbita) |
| Ťahanie | Obzerať sa okolo jednotky; v kokpite sa obzerať vnútri |
| `V` / `Shift+V` | Ďalší / predchádzajúci pohľad kamery |
| `H` | Head-up displej (pohľady z kokpitu a padlock) |
| `Esc` | Prestať pozerať na druhú jednotku, potom prestať sledovať |

## Taktická tabuľa {#tactics-board}

Na karte Taktika ([Taktická tabuľa](tactics-board.md)). `F`, `C`, `G` a `T` fungujú ako vyššie; číselné klávesy nerobia nič.

| Klávesa | Účinok |
|---|---|
| `Ctrl+Z` | Späť |
| `Ctrl+Y` alebo `Ctrl+Shift+Z` | Znova |
| `Enter` | Ukončiť šípku, ktorá sa kreslí (dvojklik alebo pravý klik robí to isté) |
| `Esc` | Zrušiť ťahanie; inak zrušiť šípku alebo presun, ktorý prebieha; inak zrušiť výber |
| `Delete` alebo `Backspace` | Zmazať výber |
| `W` / `E` / `R` | Gizmo presun / otočenie / mierka pre výber (schéma klávesov **W / E / R**) |
| `G` / `R` / `S` | Gizmo presun / otočenie / mierka pre výber (schéma klávesov **G / R / S**) |
| `R` | Bez výberu: otočiť ďalšiu figúru na umiestnenie o 15°. `Shift+R` ju otočí späť. |
| `M` | Pri vybranej figúre: presunúť ju na ďalší klik |
| `K` | Prehrať alebo pozastaviť plán |
| Shift+klik | Pridať do výberu alebo odobrať z výberu |
| Shift+ťahanie | Nakresliť rámček okolo toho, čo sa má vybrať |
| `Ctrl` pri ťahaní úchytu | Prichytiť na mriežku alebo na krok uhla |

Klávesy gizma fungujú len vtedy, keď je niečo vybrané; keď nič nie je vybrané, `W A S D` lietajú kamerou ako obvykle.

## Výber kliknutím {#click-to-pick}

Keď je zapnuté **Kliknutie ukáže, čo tam je** a pravítko je vypnuté ([Výber kliknutím](camera.md#click-to-pick)):

| Vstup | Účinok |
|---|---|
| Ľavý klik (bez ťahania viac než 4 px) | Ukáže dátový bod alebo, inak miesto na mape pod ukazovateľom |

## Miera {#measure}

Keď je **Pravítko aktívne** ([Miera](measure.md)):

| Vstup | Účinok |
|---|---|
| Ľavý klik (bez ťahania viac než 4 px) | Položiť bod |
| Pravý klik | Odstrániť posledný bod |

## Inde {#elsewhere}

| Kde | Vstup | Účinok |
|---|---|---|
| Úchyt ktoréhokoľvek posuvníka (rukoväť vedľa čísla) | Ťahanie hore / dole | Plynule meniť hodnotu, tým rýchlejšie, čím ďalej ťaháte; podržte `Shift` pre jemné ovládanie. Uvoľnite na zastavenie. |
| Zobrazenie rýchlosti nad pohľadom | Ťahanie hore / dole | Zmeniť rýchlosť letu rovnako. |
| Polia polohy | `Enter` | Použiť napísanú polohu alebo orientáciu. |
| Editor krivky | Dvojklik / Alt-klik / pravý klik | Pridať bod / odstrániť bod ([Tvar spritu](sprite-shape.md#the-curve-editor)). |

## Karta Analýza pretekov {#race-analysis-tab}

Na karte Analýza pretekov `K` prehrá a pozastaví preteky, `Home` ich pretočí na začiatok a číselné klávesy nerobia nič. Pozri [Analýza pretekov](race-analysis.md).

## Klávesy, ktoré si prehliadač nechá {#keys-the-viewer-keeps-from-the-browser}

Niektoré skratky prehliadača by zatvorili alebo obnovili stránku a stratili načítanú reláciu; prehliadač si ich necháva pre seba. Zoznam sa generuje z kódu: [Klávesy prehliadača](ref-browser-keys.md).

## Gamepad {#gamepad}

Pozri [Gamepad a HOTAS](gamepad.md).
