---
title: "Nastavitve, enote in tipke"
nav_order: 16
lang: "sl"
source: "settings.md"
source_hash: "f25e4cbaf3bb"
translated: true
outdated: false
---

# Nastavitve, enote in tipke

Majhne kontrole na vrhu stranske vrstice spremenijo, kako vam pregledovalnik govori: jezik, enote (metri ali čevlji, km/h ali vozli) in način pomoči, ki razloži barve. Vaše izbire si brskalnik zapomni.

## Glava {#the-header}

Na vrhu stranske vrstice:

| Kontrola | Kaj naredi |
|---|---|
| **?** | Način pomoči: kaj pomeni vsaka barva (tudi `?` ali `F1`) |
| Meni **Enote** | Metrične, Imperialne, Letalske ali Pomorske |
| Gumb **...** ob **Enotah** | Odpre »Izberite enoto za vsako količino«: po en spustni seznam za vsako količino |
| Meni **Jezik** | Jezik pregledovalnika: [40 jezikov](languages.md) ali jezik brskalnika |

![Glava z menijem Enote in odprtim oknom enote za vsako količino](../assets/img/sl/settings-units.webp)

Števila, ki jih vtipkate v polje, lahko vsebujejo piko ali vejico (`0.35` ali `0,35`). Pregledovalnik prebere oboje in števila prikaže tako, kot jih piše jezik pregledovalnika.

## Enote {#units}

1. V meniju **Enote** izberite prednastavitev. Vse količine se preklopijo skupaj.
2. Če želite spremeniti samo eno količino, kliknite gumb **...** ob njej in izberite enoto zanjo. Meni nato prikaže `*` za prednastavitvijo.
3. Količina, ki je niste nastavili, sledi prednastavitvi. Izberite »Kot prednastavitev«, da se vrnete.

| Količina | Metrične (privzeto) | Imperialne | Letalske | Pomorske |
|---|---|---|---|---|
| Razdalja | km | mi | NM | NM |
| Višina, dolžina | m | ft | ft | m |
| Hitrost | km/h | mph | kt | kt |
| Navpična hitrost | m/s | ft/min | ft/min | m/s |
| Temperatura | °C | °F | °C | °C |
| Tlak | hPa | inHg | hPa | hPa |
| Masa, gorivo | kg, l | lb, gal | lb, gal | t, m³ |
| Kot | stopinje | stopinje | stopinje | stopinje |

Druge enote, ki jih lahko izberete za eno količino: razdalja km, mi, NM; hitrost km/h, m/s, kt, mph; navpična hitrost m/s, ft/min, m/min; temperatura °C, °F, K; tlak hPa, inHg, mmHg, psi; masa kg, lb, t; kot stopinje ali NATO mili (6400 na krog). Enote so povsod v pregledovalniku enake: oznake, kartice, grafi, statistika.

## Način pomoči {#help-mode}

![Način pomoči: kaj pomenijo barve](../assets/img/sl/help.webp)

Pritisnite `?` ali `F1` ali kliknite gumb **?**. Prikaže se *Kaj pomenijo barve*: legende za 3D pogled, lestvice toplote, barve ekip, barve ravni, statusne barve plošč, plošča tekme in pogled dirke. Ostane vklopljen, dokler ga ne izklopite. Na zavihku Tekma razloži tudi barve plošče tekme.

![Način pomoči na zavihku Tekma](../assets/img/sl/settings-help-match.webp)

## Kaj si brskalnik zapomni {#what-the-browser-remembers}

Te nastavitve se hranijo v vašem brskalniku med obiski (nič se ne pošlje nikamor):

- jezik, enote in način pomoči;
- nastavitve posnetka za figuro, simbol, oznako, kamero in taktični prikaz;
- hitrost predvajanja in zrcaljenje;
- zaznamki na posnetek, glasnost na podatkovno množico, sloji ciljev;
- nastavitve zunanje umetne inteligence (ključ samo, če obkljukate *Zapomni si*).

Nastavitve toplote, filtri in način se ob vsakem nalaganju začnejo znova. Celoten, samodejno ustvarjen seznam: [Shranjene nastavitve](ref-settings-storage.md).

## Tipke, ki jih pregledovalnik zadrži pred brskalnikom {#keys-the-viewer-keeps-from-the-browser}

Seja z velikimi podatki se dolgo nalaga, zato pregledovalnik preprečuje, da bi jo brskalnik po nesreči zavrgel:

- `Ctrl`/`Cmd` + črke, ki bi natisnile, shranile, odprle, ponovno naložile, zaprle ali odprle nova okna, ne naredijo ničesar zunaj besedilnih polj; `F1`, `F3`, `F5`, `F6` in `F7` ne naredijo ničesar.
- Zapiranje ali ponovno nalaganje zavihka s podatki ali naloženo ravnijo najprej vpraša.
- Na celem zaslonu pregledovalnik zaklene tipke, ki jih uporablja (W, T, N, S, R, P, Q, Esc), da jih brskalnik ne prevzame.

Natančen seznam: [Tipke brskalnika](ref-browser-keys.md). Vse lastne tipke pregledovalnika: [Referenca tipkovnice in miške](keyboard-reference.md).
