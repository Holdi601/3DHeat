---
title: "Gamepad i HOTAS"
parent: "Kamera i upravljanje"
nav_order: 1
lang: "hr"
source: "gamepad.md"
source_hash: "836636b9c7af"
translated: true
outdated: false
---

# Gamepad i HOTAS

Kameru možeš letjeti kontrolerom u stilu Xboxa umjesto tipkovnicom. Koristi ga kad želiš se naslonuti i gledati oko velike scene. Njegov ulaz **dodaje se** ulazu s tipkovnice, pa možeš koristiti oboje istovremeno.

## Spoji kontroler {#connect-a-controller}

1. Priključi kontroler (ili ga upari).
2. Klikni na pogled i pritisni bilo koji gumb na kontroleru. Preglednici prikazuju kontroler tek nakon njegova prvog unosa.
3. Otvori **Kamera i scena → Gamepad**. Popis uređaja prikazuje ga s `●`.
4. Pomakni lijevu palicu za letenje, desnu za gledanje. Ako se kamera pomiče dok su palice u sredini, povećaj **Mrtvu zonu**.

Radi svaki uređaj koji preglednik preslika na standardni raspored gamepada. Palica za letenje ili gas (HOTAS) se prema zadanim postavkama ignorira; vidi dolje.

## Raspored {#mapping}

| Kontrola | Učinak |
|---|---|
| Lijeva palica | Kretanje: naprijed/natrag i bočno |
| Desna palica | Gledanje: skretanje i nagib, pri *Brzini gledanja* stupnjeva u sekundi pri punom otklonu |
| `RT` / `LT` (analogno) | Gore / dolje; u paralelnoj projekciji, uvećavanje / smanjivanje |
| `RB` (držano) | 6 puta brže |
| `LB` (držano) | 15% brzine |
| `A` (držano) | 3 puta sprint (kombinira se s RB/LB) |
| `Y` (pritisak) | Prilagodi pogled podacima |

Brojevi gumba prate standardni raspored: A 0, Y 3, LB 4, RB 5, LT 6, RT 7; palice su na osima 0-1 (lijeva) i 2-3 (desna).

## Postavke gamepada {#the-gamepad-settings}

U **Kamera i scena → Gamepad**. **Postavke** / **Sakrij** otvara upravljačke elemente za podešavanje.

| Kontrola | Zadano | Raspon (jog) | Značenje |
|---|---|---|---|
| **Uključeno** | uključeno | | |
| Status uređaja | | | Svaki spojeni uređaj, `●` kad se prati, `○` kad ne, s *- nije XInput pad, ignorira se* ili *- nije XInput pad, ipak se koristi* za nestandardne uređaje. Bez ijednog: *Nije otkriven nijedan pad. Preglednici otkrivaju kontroler tek nakon što pošalje prvi unos - pritisni gumb na njemu.* |
| **Koristi uređaj** | *Samo XInput padovi (preporučeno)* | | Prikazuje se kad je spojen nestandardni uređaj. Odaberi uređaj po nazivu da ga pratiš umjesto toga. |
| **Brzina gledanja** | 150°/s | 20-540 (5000) | Brzina okretanja pri punom otklonu desne palice. |
| **Mrtva zona** | 12% | 0-50% (95%) | Radijalno: dijagonalni pritisak nikad ne curi u samo jednu os. Povećaj je ako se kamera pomiče dok su palice u sredini. |
| **Krivulja palice** | x² | linearno (1) do x⁴ (16) | Eksponent odziva nakon mrtve zone: finija kontrola blizu središta, a na rubu i dalje puna brzina. |
| **Obrni Y palice** | isključeno | | |
| **Zamijeni palice** | isključeno | | Kretanje na desnoj palici, gledanje na lijevoj. |

Oblikovanje palice: pri otklonu *m* (duljina vektora palice) i mrtvoj zoni *d*, izlaz = ((m - d) / (1 - d)) ^ krivulja u smjeru palice, a 0 unutar mrtve zone.

## Zašto su po zadanom samo standardni padovi {#why-only-standard-pads-by-default}

Gamepad API prijavljuje **svaki** HID uređaj s osima - palice za letenje, gasove, pedale, volane - a oni ne miruju u sredini: os uvijanja ili poluga gasa stoji na punom otklonu kad je nitko ne dira. Kad se čita kao palica, to je trajan ulaz punom brzinom koji nijedna mrtva zona ne može ugušiti, a kamera se vrti sama od trenutka učitavanja stranice (i svi načini topline izgledaju pokvareno, jer pokretna kamera pokreće akumulaciju iznova svaki kadar).

Zato se uređaj prati samo kad preglednik prijavi `mapping: "standard"`, što znači "pad u XInput stilu s osima tamo gdje ih očekuješ". Ostali uređaji su navedeni i označeni kao ignorirani, a **Koristi uređaj** ih izričito uključuje - na primjer za letenje kamerom s HOTAS-om. Kad se pad jednom prati, kamera ostaje uz njega, pa se dva kontrolera ne bore za kameru ovisno o redoslijedu popisivanja.

**HOTAS:** čitaju se samo osi 0-3 (dvije palice) i standardni gumbi. Gas ili pedale na drugim osima ne rade ništa, a palica ili gas čije osi ne miruju u sredini možda trebaju veću **Mrtvu zonu**.

Preglednici skrivaju kontroler dok ne pošalje prvi unos, pa priključeni pad koji nitko nije dirao za stranicu zasad ne postoji.
