---
title: "Igralni plošček in HOTAS"
parent: "Kamera in upravljanje"
nav_order: 1
lang: "sl"
source: "gamepad.md"
source_hash: "836636b9c7af"
translated: true
outdated: false
---

# Igralni ploščlater in HOTAS

Kamero lahko letite z upravljalnikom v slogu Xbox namesto s tipkovnico. Uporabite ga, kadar se želite nasloniti nazaj in si ogledati velik prizor. Njegov vnos se **doda** vnosu tipkovnice, zato lahko uporabljate oboje hkrati.

## Povežite upravljalnik {#connect-a-controller}

1. Vključite upravljalnik (ali ga seznanite).
2. Kliknite na pogled in pritisnite katero koli tipko na upravljalniku. Brskalniki prikažejo upravljalnik šele po prvem vnosu.
3. Odprite **Kamera in prizor → Gamepad**. Seznam naprav ga prikaže z `●`.
4. Potisnite levo palico za letenje, desno za gledanje. Če kamera zaide, ko sta palici v sredini, povečajte **Mrtvo cono**.

Vsaka naprava, ki jo brskalnik preslika v standardno postavitev igralnega ploščka, deluje. Palica za letenje ali plin (HOTAS) je privzeto prezrta; glejte spodaj.

## Preslikava {#mapping}

| Kontrola | Učinek |
|---|---|
| Leva palica | Premik: naprej/nazaj in stranski premik |
| Desna palica | Gledanje: zasuk in nagib, pri *Hitrosti gledanja* stopinj na sekundo ob polnem odklonu |
| `RT` / `LT` (analogno) | Gor / dol; pri vzporedni projekciji približaj / oddalji |
| `RB` (držano) | 6-krat hitreje |
| `LB` (držano) | 15 % hitrosti |
| `A` (držano) | 3-kratni sprint (združi se z RB/LB) |
| `Y` (pritisk) | Uokviri podatke |

Številke tipk sledijo standardni postavitvi: A 0, Y 3, LB 4, RB 5, LT 6, RT 7; palici na osi 0–1 (levo) in 2–3 (desno).

## Nastavitve igralnega ploščka {#the-gamepad-settings}

V **Kamera in prizor → Gamepad**. **Nastavitve** / **Skrij** odpre kontrole za uglaševanje.

| Kontrola | Privzeto | Obseg (kolesce) | Pomen |
|---|---|---|---|
| **Omogočeno** | vklopljeno | | |
| Stanje naprave | | | Vsaka povezana naprava, `●`, ko je sledena, `○`, ko ni, z *- ni XInput ploščka, prezrto* ali *- ni XInput ploščka, vseeno uporabljeno* pri nestandardnih napravah. Če ni nobene: *Ploščka ni zaznati. Brskalniki razkrijejo upravljalnik šele, ko pošlje svoj prvi vnos – pritisnite gumb na njem.* |
| **Uporabi napravo** | *Samo XInput ploščki (priporočeno)* | | Prikaže se, ko je povezana nestandardna naprava. Namesto tega izberite napravo po imenu, da jo sledite. |
| **Hitrost gledanja** | 150°/s | 20–540 (5000) | Hitrost obračanja pri polnem odklonu desne palice. |
| **Mrtva cona** | 12 % | 0–50 % (95 %) | Radialno: diagonalni potisk nikoli ne uide v eno samo os. Povečajte jo, če kamera zaide, ko sta palici v sredini. |
| **Krivulja palice** | x² | linearna (1) do x⁴ (16) | Eksponent odziva za mrtvo cono: natančnejši nadzor blizu sredine, še vedno polna hitrost na robu. |
| **Obrni Y palice** | izklopljeno | | |
| **Zamenjaj palici** | izklopljeno | | Premik z desno palico, gledanje z levo. |

Oblikovanje palice: pri odklonu *m* (dolžina vektorja palice) in mrtvi coni *d* je izhod ((m - d) / (1 - d)) ^ krivulja vzdolž smeri palice, znotraj mrtve cone pa 0.

## Zakaj privzeto samo standardni ploščki {#why-only-standard-pads-by-default}

Gamepad API poroča **vsako** napravo HID z osmi – palice za letenje, plin, pedale, volane – in te se ne ustavijo v sredini: os zasuka ali ročica plina je pri polnem odklonu, kadar se je nihče ne dotika. Če se to bere kot palica, je to trajen vnos pri polni hitrosti, ki ga nobena mrtva cona ne more zatreti, in kamera se vrti sama od trenutka, ko se stran naloži (in vsak način toplote je videti pokvarjen, ker premikajoča se kamera ob vsaki sličici ponovno zažene seštevanje).

Zato se naprava sledi samo, kadar brskalnik poroča `mapping: "standard"`, kar pomeni »ploček v slogu XInput z osmi tam, kjer pričakujete«. Druge naprave so navedene in označene kot prezrte, **Uporabi napravo** pa jo izrecno vključi – na primer za letenje kamere s HOTAS-om. Ko se ploček sledi, kamera ostane z njim, zato se dva upravljalnika ne prepirata za kamero glede na vrstni red štetja.

**HOTAS:** berejo se samo osi 0–3 (dve palici) in standardni gumbi. Plin ali pedali na drugih oseh ne naredijo ničesar; palica ali plin, katerih osi ne mirujejo v sredini, lahko zahtevata večjo **Mrtvo cono**.

Brskalniki skrijejo upravljalnik, dokler ne pošlje prvega vnosa, zato priklopljen ploček, ki se ga še ni dotaknil, za stran še ne obstaja.
