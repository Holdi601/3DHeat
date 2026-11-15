---
title: "Beállítások, mértékegységek és billentyűk"
nav_order: 19
lang: "hu"
source: "settings.md"
source_hash: "bd1062895abf"
translated: true
outdated: false
---

# Beállítások, mértékegységek és billentyűk

A sáv tetején lévő kis vezérlők azt szabályozzák, hogyan szól Önhöz a megjelenítő: a nyelv, a mértékegységek (méter vagy láb, km/h vagy csomó), és egy súgómód, amely elmagyarázza a színeket. A választásait a böngészője megjegyzi.

## A fejléc {#the-header}

A sáv tetején:

| Vezérlő | Mit csinál |
|---|---|
| **?** | Súgómód: mit jelent minden szín (a `?` vagy `F1` is) |
| **Egységek** menü | Metrikus, Angolszász, Repülési vagy Tengeri |
| **...** gomb az **Egységek** mellett | Megnyitja a „Válasszon mértékegységet minden mennyiséghez” ablakot: egy legördülő mező mennyiségenként |
| **Nyelv** menü | A megjelenítő nyelve: [40 nyelv](languages.md), vagy a böngészőé |

![A fejléc a Mértékegységek menüvel és a mennyiségenkénti mértékegység-ablakkal](../assets/img/en/settings-units.webp)

A dobozba beírt számokban lehet pont vagy vessző is (`0.35` vagy `0,35`). A megjelenítő mindkettőt olvassa, és a számokat az Ön nyelvének szokása szerint mutatja.

## Mértékegységek {#units}

1. Válasszon előre beállított értéket az **Egységek** menüben. Minden mennyiség együtt vált.
2. Csak egy mennyiség megváltoztatásához kattintson mellette a **...** gombra, és válasszon mértékegységet ahhoz a mennyiséghez. A menü ezután `*` jelet mutat az előre beállított érték után.
3. Az Ön által be nem állított mennyiség követi az előre beállítást. A visszatéréshez válassza az „Előre beállított” lehetőséget.

| Mennyiség | Metrikus (alapértelmezés) | Angolszász | Repülési | Tengeri |
|---|---|---|---|---|
| Távolság | km | mi | NM | NM |
| Magasság, hossz | m | ft | ft | m |
| Sebesség | km/h | mph | kt | kt |
| Függőleges sebesség | m/s | ft/min | ft/min | m/s |
| Hőmérséklet | °C | °F | °C | °C |
| Nyomás | hPa | inHg | hPa | hPa |
| Tömeg, üzemanyag | kg, l | lb, gal | lb, gal | t, m³ |
| Szög | fok | fok | fok | fok |

Egy mennyiséghez további választható mértékegységek: távolság km, mi, NM; sebesség km/h, m/s, kt, mph; függőleges sebesség m/s, ft/min, m/min; hőmérséklet °C, °F, K; nyomás hPa, inHg, mmHg, psi; tömeg kg, lb, t; szög fok vagy NATO-mil (6400 a körben). A mértékegységek mindenhol ugyanazok a megjelenítőben: címkékben, kártyákon, diagramokon, statisztikákban.

## Súgómód {#help-mode}

![Súgómód: mit jelentenek a színek](../assets/img/en/help.webp)

Nyomja meg a `?` vagy `F1` gombot, vagy kattintson a **?** gombra. Megjelenik a *Mit jelentenek a színek* panel: jelmagyarázatok a 3D-s nézethez, a hőskálákhoz, a csapatszínekhez, a pálya színeihez, a panelek állapotszíneihez, a meccspanelhez és a versenynézethez. Addig marad, amíg ki nem kapcsolja. A Meccs fülön a meccspanel színeit is elmagyarázza.

![Súgómód a Meccs fülön](../assets/img/en/settings-help-match.webp)

## Amit a böngésző megjegyez {#what-the-browser-remembers}

Ezek a beállítások látogatások között megmaradnak a böngészőjében (semmit nem küldünk sehová):

- a nyelv, a mértékegységek és a súgómód;
- a visszajátszás figura-, jel-, felirat-, kamera- és taktikai megjelenítési beállításai;
- a lejátszási sebesség és a tükrözés;
- a könyvjelzők felvételenként, a térfogatok adatkészletenként, a célrétegek;
- a külső MI beállításai (a kulcs csak akkor, ha bejelölte a *Megjegyzés*-t).

A hőbeállítások, a szűrők és a mód minden betöltéskor újrakezdődnek. A teljes, generált lista: [Mentett beállítások](ref-settings-storage.md).

## A böngészőtől megtartott billentyűk {#keys-the-viewer-keeps-from-the-browser}

Nagy adattal a munkamenet betöltése időt vesz igénybe, ezért a megjelenítő megakadályozza, hogy a böngésző véletlenül eldobja:

- A `Ctrl`/`Cmd` + betűk, amelyek nyomtatnának, mentenének, megnyitnának, újratöltenének, bezárnának vagy új ablakot nyitnának, a szövegdobozokon kívül nem csinálnak semmit; az `F1`, `F3`, `F5`, `F6` és `F7` sem.
- Adattal vagy pályával betöltött lap bezárása vagy újratöltése előtt rákérdez.
- Teljes képernyőn a megjelenítő zárolja a saját billentyűit (W, T, N, S, R, P, Q, Esc), hogy a böngésző ne vegye át őket.

A pontos lista: [Böngészőbillentyűk](ref-browser-keys.md). A megjelenítő összes saját billentyűje: [Billentyűzet és egér](keyboard-reference.md).
