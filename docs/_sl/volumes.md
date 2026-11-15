---
title: "Volumni in primerjava"
parent: "Filtri in orodja"
nav_order: 6
lang: "sl"
source: "volumes.md"
source_hash: "25cc132dbe25"
translated: true
outdated: false
---

# Prostornine in primerjava

**Prostornina** je nevidna škatla (ali valj, ali krogla), ki jo narišete okoli nekega mesta, da vprašate: kaj se je tukaj zgodilo? Uporabite jo, da preštejete smrti pri mostu, primerjate dva hriba ali pokažete le dejavnost na enem območju.

```
 pogled z vrha           Narišete obliko ->  pregledovalnik prešteje
 +------------+           kaj je znotraj:
 |   ( A )    |            vrstice, igralci, uboji, čas ...
 |        [B] |           Primerjajte A z B, drug ob drugem.
 +------------+
```

![Tri prostornine v demo dolini: dva valja okoli hribov, kvader okoli vasi](../assets/img/en/volumes.webp)

Prostornine merijo, kaj se dogaja znotraj njih, filtrirajo pogled nanje, izvozijo svoje vrstice in se lahko primerjajo drug ob drugem. Glejte tudi [slovar pojmov](glossary.md) za vrstico, osebo in tekmo.

## Narišite prostornino {#draw-a-volume}

1. V stranski vrstici odprite **Prostornine**.
2. Izberite orodje in rišite v 3D pogledu ali na 2D zemljevidu. Tla in strop začneta pri podatkih pod njo. Esc prekliče.
3. Kliknite prostornino, da jo izberete; prikažeta se njeni **Statistika**.

| Orodje | Kako riše |
|---|---|
| **Kvader** | Povlecite pravokotnik (Shift: kvadrat). Klik postavi privzeti kvader. |
| **n-kotnik** | Povlecite od središča (Shift ga ohrani pravilnega). *Vogali* nastavi n, od 3 do 64 (privzeto 8, zato gumb piše **8-kotnik**). |
| **Mnogokotnik** | Kliknite vogale; zaključite z dvojnim klikom, Enter ali klikom na prvi vogal. Backspace odstrani zadnji vogal. |
| **Valj** | Povlecite polmer. |
| **Krogla** | Povlecite polmer; stoji na tleh. |

## Urejanje {#edit}

- Kliknite prostornino, da jo izberete. Povlecite njeno telo, da jo premaknete, vogale, da jo preoblikujete (Shift na vogalu skalira).
- **Rumeni** ročaji nastavijo tla in strop, **cian** ročaj jo zasuka.
- Alt+povlek kopira, Del odstrani, Ctrl+Z / Ctrl+Y razveljavi in ponovi, Ctrl+D podvoji. **Odstrani vse** izbriše vse prostornine.
- Točne vrednosti: Tla, Strop, Zasuk / Naklon / Nagib (kvadri), Polmer (krogle, valji).

Vsaka vrstica prostornine ima potrditveno polje za prikaz, barvo, ime, **vključi** ali **izključi**, podvajanje in brisanje. Prostornine se shranijo v brskalnik za vsak nabor podatkov, **Shrani...** / **Naloži...** pa zapišeta in preberejo datoteko `volumes.json`.

## Filtrirajte pogled {#filter-the-view}

| Filter | Učinek |
|---|---|
| **Prikaži vse** (privzeto) | Prostornine samo merijo. |
| **Samo znotraj** | Toplota, predvajanje in [analiza zadetkov](hit-analysis.md) narišejo le tisto, kar je znotraj vključenih prostornin in zunaj izključenih. |
| **Skrij znotraj** | Obratno. |

Filter GPU vzame do 8 prostornin s 64 točkami obrisa skupaj; »!« označuje prostornino čez to mejo. Statistika in izvoz jo še vedno štejeta.

## Statistika {#statistics}

Območje **Statistika** sledi filtrom, časovnemu oknu in skritim skupinam. *Izbrano* prikaže izbrano prostornino, *Primerjaj vse* postavi vsako prostornino drugo ob drugi. Prikaže:

- **Vrstic znotraj (prikazanih)** in **Vrstic znotraj (vsi podatki)**, **Igralci**, **Ekipe**, **Tekme**, **Čas znotraj**, **Vstopi / izstopi**, **Vrh toplote**, **Povprečna toplota**, **Prostornina / tloris** in histogram **Kdaj**;
- za vsak stolpec: kategorije z **Lift** (delež znotraj, deljen z deležem v vseh prikazanih podatkih), in številke z razponom, mediano in 5.-95. percentilom.

**Statistika kot CSV / JSON** jo shrani. **Izvozi podatke znotraj** zapiše vrstice znotraj kot CSV ali Parquet (privzeto vklopljeno *Samo prikazane vrstice*), eno prostornino ali vse, s stolpcem, ki pove, v kateri prostornini je vsaka vrstica.

## Primerjajte prostornine {#compare-volumes}

Pri dveh ali več vidnih prostorninah pritisnite **Primerjaj…**.

1. Narišite tri prostornine, na primer Zahodni hrib, Vzhodni hrib in Vas.
2. Pod Statistiko pritisnite **Primerjaj…**.
3. V **Tabeli** preberite razliko vsake vrednosti od prve prostornine.
4. Preklopite na **Stolpce**, da vidite deleže kot stolpce.

![Tabela Primerjaj prostornine: vrstice, čas znotraj, igralci in več za vsako prostornino, z razliko od prve](../assets/img/en/compare.webp)

| Pogled | Prikazuje |
|---|---|
| **Tabela** | Vrstice, čas znotraj, igralci, tekme, ekipe, vstopi, izstopi, obiski, dolžina obiska, ubitja, smrti, ubitij na smrt, ubitij na minuto, čas na igralca, stolpci vrednosti; združeno po dogodkih, razredu vozila, igralcu ali UI, ekipi in smeri. Vsaka vrednost prikaže svojo razliko od prve prostornine in velikost učinka (zanemarljiv, majhen, srednji, velik). Kliknite naslov prostornine, da uredite po oddaljenosti od prve. |
| **Stolpci** | Števila ali deleži po dogodku, razredu, akterju, ekipi ali smeri. Kliknite stolpec, da filtrirate pogled nanj. |
| **Skozi tekmo** | En graf na prostornino skozi minute tekme: prisotnost, vrstice ali ubitja. Kliknite, da skočite tja. |
| **Obiski** | Škatlasti in violinski diagrami, kako dolgo trajajo obiski (logaritemska lestvica). |
| **Tok** | Kam gredo sledi, potem ko zapustijo vsako prostornino: matrika prehodov ali tokovni trakovi. |

![Pogled Stolpci: vrste dogodkov po prostorninah kot deleži](../assets/img/en/compare-bars.webp)

## Nasveti {#tips}

- Začnite pri ugotovitvi: v [Ugotovitvah](insights.md) **Prostornina tukaj** doda valj okoli mesta ugotovitve.
- **Razčlenitev…** odpre [Razčlenitev](breakdown.md) za izbrano prostornino: kdo in kaj je najuspešnejše znotraj.
- [Smerna toplota](directional-heat.md) lahko nariše smeri znotraj izbrane prostornine.
- [Zavihek Vozila](hit-analysis.md#restrict-to-an-area) uporablja iste prostornine kot svoj filter območja.
