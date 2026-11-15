---
title: "Gamepad és HOTAS"
parent: "Kamera és vezérlés"
nav_order: 1
lang: "hu"
source: "gamepad.md"
source_hash: "836636b9c7af"
translated: true
outdated: false
---

# Gamepad és HOTAS

A kamerát Xbox-stílusú kontrollerrel is irányíthatod a billentyűzet helyett. Akkor használd, ha nagy jelenetben hátradőlve körül akarsz nézni. A bemenete a billentyűzetéhez **hozzáadódik**, így a kettőt egyszerre is használhatod.

## Kontroller csatlakoztatása {#connect-a-controller}

1. Dugd be a kontrollert (vagy párosítsd).
2. Kattints a nézetre, és nyomj meg egy gombot a kontrolleren. A böngészők a kontrollert csak az első bemenete után mutatják.
3. Nyisd meg a **Kamera és jelenet → Gamepad** részt. Az eszközlistában `●` jelöli.
4. A bal karral repülsz, a jobbal nézel. Ha a kamera középre állított karoknál sodródik, emeld a **Holtzónát**.

Bármely eszköz, amelyet a böngésző a szabványos gamepad-kiosztásra képez, működik. A repülőkar vagy gázkar (HOTAS) alapból figyelmen kívül marad; lásd lentebb.

## Kiosztás {#mapping}

| Vezérlő | Hatás |
|---|---|
| Bal kar | Mozgás: előre/hátra és oldalazás |
| Jobb kar | Nézés: fordulás és dőlés, teljes kitérésnél *Nézési sebesség* fok másodpercenként |
| `RT` / `LT` (analóg) | Fel / le; párhuzamos vetítésben nagyítás / kicsinyítés |
| `RB` (nyomva tartva) | 6× gyorsabb |
| `LB` (nyomva tartva) | 15% sebesség |
| `A` (nyomva tartva) | 3× sprint (összeadódik az RB/LB-vel) |
| `Y` (megnyomva) | Az adat keretbe foglalása |

A gombszámok a szabványos kiosztást követik: A 0, Y 3, LB 4, RB 5, LT 6, RT 7; a karok a 0-1 (bal) és a 2-3 (jobb) tengelyeken vannak.

## A Gamepad beállításai {#the-gamepad-settings}

A **Kamera és jelenet → Gamepad** részben. A **Beállítások** / **Elrejtés** nyitja és zárja a hangolóvezérlőket.

| Vezérlő | Alapérték | Tartomány (léptetés) | Jelentés |
|---|---|---|---|
| **Bekapcsolva** | be | | |
| Eszköz állapota | | | Minden csatlakoztatott eszköz; `●`, ha követjük, `○`, ha nem; nem szabványos eszközöknél *- nem XInput-kontroller, figyelmen kívül hagyva* vagy *- nem XInput-kontroller, mégis használva*. Ha nincs egy sem: *Nincs gamepad érzékelve. A böngészők a kontrollert csak az első bemenete után árulják el - nyomj rajta egy gombot.* |
| **Eszköz** | *Csak XInput-kontrollerek (ajánlott)* | | Nem szabványos eszköz csatlakoztatásakor látszik. Név szerint kiválasztva ezt az eszközt követi. |
| **Nézési sebesség** | 150°/s | 20-540 (5000) | Fordulási sebesség a jobb kar teljes kitérésénél. |
| **Holtzóna** | 12% | 0-50% (95%) | Sugárirányú: átlós nyomás sosem szivárog át csak az egyik tengelyre. Emeld, ha a kamera középre állított karoknál sodródik. |
| **Karkarakterisztika** | x² | lineáris (1) től x⁴ (16) | Válaszkitevő a holtzóna után: finomabb vezérlés a közepe közelében, a szélén továbbra is teljes sebesség. |
| **Kar Y invertálása** | ki | | |
| **Karok felcserélése** | ki | | A mozgás a jobb karon, a nézés a bal karon van. |

A kar alakítása: *m* kitérésnél (a kar vektorának hossza) és *d* holtzónánál a kimenet ((m - d) / (1 - d))^görbe a kar irányában, és 0 a holtzónán belül.

## Miért csak a szabványos kontrollerek alapból {#why-only-standard-pads-by-default}

A Gamepad API **minden** tengelyekkel rendelkező HID-eszközt jelent - repülőkarokat, gázkarokat, pedálokat, kormányokat -, és ezek nem állnak középen: egy csavaró tengely vagy egy gázkar teljes kitérésen áll, ha senki nem nyúl hozzá. Karként olvasva ez állandó, teljes sebességű bemenet, amelyet egyetlen holtzóna sem tud elnyomni: a kamera a betöltéstől kezdve magától forog (és minden hőmód elromlottnak látszik, mert a mozgó kamera minden képkockában újraindítja az akkumulációt).

Ezért egy eszközt csak akkor követünk, ha a böngésző `mapping: "standard"` értéket jelent: ez azt jelenti, hogy „XInput-stílusú kontroller, a tengelyek ott, ahol várod”. A többi eszköz listázva van és figyelmen kívül hagyottként jelölt, a **Eszköz** pedig kifejezetten bekapcsolja az egyiket - például a kamera HOTAS-szal való repüléséhez. Ha egy kontrollert már követünk, a kamera hozzá marad, így két kontroller nem harcol a kameráért a felsorolási sorrendtől függően.

**HOTAS:** csak a 0-3 tengelyek (két kar) és a szabványos gombok olvasódnak. Más tengelyeken lévő gázkar vagy pedálok nem csinálnak semmit, és egy olyan kar vagy gázkar, amelynek tengelyei nem állnak középen, nagyobb **Holtzónát** igényelhet.

A böngészők a kontrollert addig rejtik, amíg az el nem küldte az első bemenetét, így egy bedugott, meg nem érintett kontroller az oldal szempontjából még nem létezik.
