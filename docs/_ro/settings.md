---
title: "Setări, unități și taste"
nav_order: 19
lang: "ro"
source: "settings.md"
source_hash: "bd1062895abf"
translated: true
outdated: false
---

# Setări, unități și taste

Comenzile mici din partea de sus a barei laterale schimbă felul în care vorbește vizualizatorul cu tine: limba, unitățile (metri sau picioare, km/h sau noduri) și un mod de ajutor care explică culorile. Alegerile tale sunt ținute minte în browserul tău.

## Antetul {#the-header}

În partea de sus a barei laterale:

| Comandă | Ce face |
|---|---|
| **?** | Modul de ajutor: ce înseamnă fiecare culoare (sau `?` ori `F1`) |
| Meniul **Unități** | Metric, Imperial, Aviație sau Nautic |
| Butonul **...** de lângă **Unități** | Deschide „Alege o unitate pentru fiecare mărime”: o listă derulantă pentru fiecare mărime |
| Meniul **Limbă** | Limba vizualizatorului: [40 de limbi](languages.md), sau cea a browserului |

![Antetul cu meniul Unități și fereastra unitate-cu-mărime deschise](../assets/img/ro/settings-units.webp)

Numerele pe care le scrii într-o casetă pot folosi punct sau virgulă (`0.35` sau `0,35`). Vizualizatorul citește amândouă și arată numerele cum le scrie limba vizualizatorului.

## Unități {#units}

1. Alege un set predefinit din meniul **Unități**. Toate mărimile trec împreună.
2. Ca să schimbi o singură mărime, dă clic pe butonul **...** de lângă ea și alege o unitate pentru acea mărime. Meniul arată atunci un `*` după setul predefinit.
3. O mărime pe care nu ai setat-o urmează setul predefinit. Alege „Ca în setul predefinit” ca să revii.

| Mărime | Metric (implicit) | Imperial | Aviație | Nautic |
|---|---|---|---|---|
| Distanță | km | mi | NM | NM |
| Altitudine, lungime | m | ft | ft | m |
| Viteză | km/h | mph | kt | kt |
| Viteză verticală | m/s | ft/min | ft/min | m/s |
| Temperatură | °C | °F | °C | °C |
| Presiune | hPa | inHg | hPa | hPa |
| Masă, combustibil | kg, l | lb, gal | lb, gal | t, m³ |
| Unghi | grade | grade | grade | grade |

Alte unități pe care le poți alege pentru o singură mărime: distanță km, mi, NM; viteză km/h, m/s, kt, mph; viteză verticală m/s, ft/min, m/min; temperatură °C, °F, K; presiune hPa, inHg, mmHg, psi; masă kg, lb, t; unghi grade sau mili NATO (6400 la cerc). Unitățile sunt aceleași peste tot în vizualizator: etichete, carduri, grafice, statistici.

## Modul de ajutor {#help-mode}

![Modul de ajutor: ce înseamnă culorile](../assets/img/ro/help.webp)

Apasă `?` sau `F1`, sau dă clic pe butonul **?**. Arată *Ce înseamnă culorile*: legende pentru vederea 3D, rampele de căldură, culorile echipelor, culorile nivelului, culorile de stare ale panourilor, panoul meciului și vederea de cursă. Rămâne pornit până îl oprești. În fila Meci explică și culorile panoului meciului.

![Modul de ajutor în fila Meci](../assets/img/ro/settings-help-match.webp)

## Ce ține minte browserul {#what-the-browser-remembers}

Aceste setări se păstrează în browserul tău între vizite (nimic nu se trimite nicăieri):

- limba, unitățile și modul de ajutor;
- setările figurilor, simbolurilor, etichetelor, camerei și afișajului tactic ale reluării;
- viteza de redare și oglindirea;
- semnele de carte pe înregistrare, volumele pe set de date, straturile de obiective;
- setările IA externe (cheia doar dacă bifezi *Ține minte*).

Setările de căldură, filtrele și modul pornesc de la zero la fiecare încărcare. Lista completă, generată: [Setările salvate](ref-settings-storage.md).

## Tastele pe care le păstrează vizualizatorul din browser {#keys-the-viewer-keeps-from-the-browser}

O sesiune cu date mari durează să se încarce, deci vizualizatorul oprește browserul să o arunce din greșeală:

- `Ctrl`/`Cmd` + litere care ar tipări, salva, deschide, reîncărca, închide sau deschide ferestre noi nu fac nimic în afara casetelor de text; `F1`, `F3`, `F5`, `F6` și `F7` nu fac nimic.
- Închiderea sau reîncărcarea filei cu date sau nivel încărcat întreabă mai întâi.
- În ecran complet, vizualizatorul blochează tastele pe care le folosește (W, T, N, S, R, P, Q, Esc), ca browserul să nu le preia.

Lista exactă: [Tastele browserului](ref-browser-keys.md). Toate tastele proprii ale vizualizatorului: [Referința de taste și mouse](keyboard-reference.md).
