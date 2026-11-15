---
title: "Gamepad a HOTAS"
parent: "Kamera a ovládanie"
nav_order: 1
lang: "sk"
source: "gamepad.md"
source_hash: "836636b9c7af"
translated: true
outdated: false
---


# Gamepad a HOTAS

Kameru môžete ovládať ovládačom v štýle Xbox namiesto klávesnice. Použite ho, keď sa chcete opreť a obzerať veľkú scénu. Jeho vstup sa **pridáva** k vstupu klávesnice, takže môžete použiť oboje naraz.

## Pripojte ovládač {#connect-a-controller}

1. Zapojte ovládač (alebo ho spárujte).
2. Kliknite do zobrazenia a stlačte ľubovoľné tlačidlo na ovládači. Prehliadače ukážu ovládač až po jeho prvom vstupe.
3. Otvorte **Kamera a scéna → Gamepad**. Zoznam zariadení ho ukáže s `●`.
4. Potlačte ľavú páčku na lietanie, pravú na rozhliadanie. Ak sa kamera posúva, keď sú páčky v strede, zvýšte **Mŕtvu zónu**.

Každé zariadenie, ktoré prehliadač mapuje na štandardné rozloženie gamepadu, funguje. Letecká páčka alebo plynová páka (HOTAS) sa predvolene ignoruje; pozri nižšie.

## Mapovanie {#mapping}

| Ovládač | Účinok |
|---|---|
| Ľavá páčka | Pohyb: dopredu/dozadu a bočne |
| Pravá páčka | Rozhliadanie: otáčanie a sklon, pri *Rýchlosť rozhliadania* stupňov za sekundu pri plnom vychýlení |
| `RT` / `LT` (analógové) | Hore / dole; v paralelnej projekcii priblíženie / oddialenie |
| `RB` (podržané) | 6× rýchlejšie |
| `LB` (podržané) | 15 % rýchlosti |
| `A` (podržané) | 3× sprint (kombinuje sa s RB/LB) |
| `Y` (stlačenie) | Zarámovať údaje |

Čísla tlačidiel nasledujú štandardné rozloženie: A 0, Y 3, LB 4, RB 5, LT 6, RT 7; páčky na osiach 0-1 (ľavá) a 2-3 (pravá).

## Nastavenia gamepadu {#the-gamepad-settings}

V **Kamera a scéna → Gamepad**. **Nastavenia** / **Skryť** otvorí ovládacie prvky ladenia.

| Ovládač | Predvolene | Rozsah (posúvanie) | Význam |
|---|---|---|---|
| **Zapnuté** | zapnuté | | |
| Stav zariadení | | | Každé pripojené zariadenie, `●` keď sa sleduje, `○` keď nie, s *- nie je gamepad XInput, ignorované* alebo *- nie je gamepad XInput, aj tak použité* pre nenormované zariadenia. Keď žiadne nie je: *Nie je zistený žiadny gamepad. Prehliadače odhalia ovládač až po jeho prvom vstupe - stlačte na ňom tlačidlo.* |
| **Použiť zariadenie** | *Len gamepady XInput (odporúčané)* | | Zobrazí sa, keď je pripojené nenormované zariadenie. Vyberte zariadenie podľa názvu, aby ho sledovalo. |
| **Rýchlosť rozhliadania** | 150°/s | 20 - 540 (5000) | Rýchlosť otáčania pri plnom vychýlení pravej páčky. |
| **Mŕtva zóna** | 12 % | 0 - 50 % (95 %) | Radiálne: diagonálny posun nikdy neunikne do jednej osi samostatne. Zvýšte ju, ak sa kamera posúva, keď sú páčky v strede. |
| **Krivka páčky** | x² | lineárna (1) až x⁴ (16) | Exponent odozvy za mŕtvou zónou: jemnejšie ovládanie pri strede, stále plná rýchlosť na okraji. |
| **Invertovať Y páčky** | vypnuté | | |
| **Vymeniť páčky** | vypnuté | | Pohyb pravou páčkou, rozhliadanie ľavou. |

Tvarovanie páčky: pri vychýlení *m* (dĺžka vektora páčky) a mŕtvej zóne *d* je výstup ((m - d) / (1 - d)) ^ krivka pozdĺž smeru páčky, a 0 vnútri mŕtvej zóny.

## Prečo predvolene len štandardné gamepady {#why-only-standard-pads-by-default}

Gamepad API hlási **každé** zariadenie HID s osami - letecké páčky, plynové páky, pedále, volanty - a tie nestoja v strede: osa krútenia alebo páka plynu stojí na plnom vychýlení, keď sa jej nikto nedotýka. Ak sa to načíta ako páčka, je to trvalý vstup plnou rýchlosťou, ktorý nedokáže potlačiť žiadna mŕtva zóna, a kamera sa točí sama od okamihu načítania stránky (a každý režim tepla vyzerá rozbito, lebo pohybujúca sa kamera reštartuje akumuláciu každú snímku).

Zariadenie sa preto sleduje len vtedy, keď prehliadač hlási `mapping: "standard"`, čo je jeho spôsob, ako povedať „gamepad v štýle XInput s osami tam, kde ich čakáte“. Ostatné zariadenia sa vypíšu a označia ako ignorované a **Použiť zariadenie** ich výslovne povolí - napríklad na lietanie kamerou pomocou HOTAS. Keď sa jeden gamepad sleduje, kamera pri ňom zostáva, takže dva ovládače sa nepreberajú o kameru podľa poradia výpisu.

**HOTAS:** čítajú sa len osi 0-3 (dve páčky) a štandardné tlačidlá. Plynová páka alebo pedále na iných osiach nerobia nič a páčka alebo plynová páka, ktorých osi nestoja v strede, môže potrebovať väčšiu **Mŕtvu zónu**.

Prehliadače skryjú ovládač, kým neodošle svoj prvý vstup, takže pripojený gamepad, ktorého sa nikto nedotkol, pre stránku zatiaľ neexistuje.
