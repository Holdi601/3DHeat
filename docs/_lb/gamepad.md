---
title: "Gamepad a HOTAS"
parent: "Kamera a Steierung"
nav_order: 1
lang: "lb"
source: "gamepad.md"
source_hash: "836636b9c7af"
translated: true
outdated: false
---


# Gamepad a HOTAS

Dir kënnt d'Kamera mat engem Xbox-artege Controller fléien, amplaz mat der Tastatur. Benotzt en, wann Dir an enger grousser Szene zréckleene wëllt a sech ëmkucke wëllt. Sein Input **kënnt derbäi** zu deem vun der Tastatur, sou datt Dir béid zur selwechter Zäit benotze kënnt.

## E Controller verbannen {#connect-a-controller}

1. Stiechen Dir de Controller an (oder koppelt en).
2. Klickt an d'Ansiicht a dréckt eng Taste um Controller. Browser weisen en Controller eréischt, nodeem en den éischte Input geschéckt huet.
3. Maacht **Kamera & Szene → Gamepad** op. D'Gerätelëscht weist en mat `●`.
4. Dréckt de lénksen Stick fir ze fléien, de rietsen Stick fir ze kucken. Wann d'Kamera mat zentréierten Sticken wegdréift, erhéicht **Doudzon**.

All Gerät, dat de Browser op dat Standard-Gamepad-Layout mécht, funktionéiert. E Fluchstick oder Gas (HOTAS) gëtt standardmäisseg ignoréiert; kuckt ënnen.

## Belegung {#mapping}

| Steierung | Wierkung |
|---|---|
| Lénksen Stick | Beweegen: vir/zréck an zur Säit |
| Rietsen Stick | Kucken: Gier an Neigung, mat *Bléckvitess* Grad pro Sekonn bei voller Auslenkung |
| `RT` / `LT` (analog) | Erop / erof; an der Parallelprojektioun Zoom eran / eraus |
| `RB` (gehalen) | 6× méi séier |
| `LB` (gehalen) | 15 % Geschwindegkeet |
| `A` (gehalen) | 3× Sprint (kombinéiert sech mat RB/LB) |
| `Y` (drécken) | D'Daten an de Rummen huelen |

D'Knäppchennummeren folgen dem Standard-Layout: A 0, Y 3, LB 4, RB 5, LT 6, RT 7; d'Stiicker op den Achsen 0-1 (lénks) a 2-3 (riets).

## D'Gamepad-Astellungen {#the-gamepad-settings}

Ënner **Kamera & Szene → Gamepad**. **Astellungen** / **Verstoppen** mécht d'Astellungen op.

| Steierung | Standard | Beräich (Drécken) | Bedeitung |
|---|---|---|---|
| **Aktivéiert** | an | | |
| Gerätsstatus | | | All verbonne Geräter, `●` wann se verfolgt ginn, `○` wann net, mat *- kee XInput-Pad, ignoréiert* oder *- kee XInput-Pad, trotzdeem benotzt* bei net-standardmäissege Geräter. Ouni Gerät: *Kee Pad fonnt. Browser weisen en Controller eréischt, nodeem en den éischte Input geschéckt huet - dréckt eng Taste drop.* |
| **Apparat benotzen** | *Nëmmen XInput-Pads (empfoe)* | | Gëtt ugewisen, wann e net-standardmäisseg Gerät verbonne ass. Wielt en Gerät mam Numm, fir et ze verfolgen. |
| **Bléckvitess** | 150°/s | 20-540 (5000) | Drehgeschwindegkeet bei voller Auslenkung vum rietsen Stick. |
| **Doudzon** | 12 % | 0-50 % (95 %) | Radial: e Schub diagonal geet ni nëmmen an eng Achs. Erhéicht, wann d'Kamera mat zentréierten Sticken wegdréift. |
| **Stick-Kurv** | x² | linear (1) bis x⁴ (16) | Äntwertexponent nom Doudzon: méi fein Steierung no beim Zentrum, ëmmer nach volle Speed um Rand. |
| **Stick-Y ëmdréinen** | aus | | |
| **Sticks tauschen** | aus | | Bewegen mam rietsen Stick, kucken mam lénksen. |

D'Form vum Stick: bei der Auslenkung *m* (d'Längt vum Stick-Vektor) an der Doudzon *d* ass d'Ausgab ((m - d) / (1 - d)) ^ Kurv an der Richtung vum Stick, a 0 bannent der Doudzon.

## Firwat standardmäisseg nëmmen Standard-Pads {#why-only-standard-pads-by-default}

D'Gamepad-API mellt **all** HID-Geräter mat Achsen - Fluchsticker, Gasen, Pedalen, Lenkrieder -, a déi ruhen net an der Mëtt. Eng Dréiachs oder e Gashebel steet op voller Auslenkung, wann keen se beréiert. Wann dat als Stick gelies gëtt, ass dat en duerchgehende Vollspeed-Input, deen keng Doudzon ofstelle kann, a d'Kamera dréint sech vun alleng vum Moment un, wou d'Säit gelueden ass (an all Hëtzt-Modus gesäit kaputt aus, well eng beweegt Kamera d'Akkumuléierung all Bild nei ufänkt).

Dofir gëtt e Gerät nëmmen verfollegt, wann de Browser `mapping: "standard"` mellt, seng Aart ze soen: "e XInput-artegen Pad mat den Achsen, wou Dir se erwaart." Anner Geräter ginn opgelëscht a mat ignoréiert markéiert, a **Apparat benotzen** wielt een explizit aus - zum Beispill fir d'Kamera mat engem HOTAS ze fléien. Wann ee Pad verfollegt gëtt, bleift d'Kamera bei deem; zwee Controller streiden sech also net ëm d'Kamera, jee nodeem an wéi enger Reiefolg se opgezielt sinn.

**HOTAS:** nëmmen d'Achsen 0-3 (zwee Sticker) an d'Standard-Knäppercher ginn gelies. E Gas oder Pedalen op anere Achsen maachen näischt, a ee Stick oder Gas, deem seng Achsen net an der Mëtt ruhen, brauch vläicht eng méi grouss **Doudzon**.

Browser verstoppen en Controller, bis en den éischte Input geschéckt huet; e Pad, dat ageschalt ass, awer net beréiert gouf, existéiert fir d'Säit also nach net.
