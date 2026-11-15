---
title: "Gamepad i HOTAS"
parent: "Càmera i controls"
nav_order: 1
lang: "ca"
source: "gamepad.md"
source_hash: "836636b9c7af"
translated: true
outdated: false
---

# Comandament i HOTAS

Pots volar la càmera amb un comandament d'estil Xbox en lloc del teclat. Usa'l quan vulguis recolzar-te enrere i mirar al voltant d'una escena gran. El seu senyal **s'afegeix** a la del teclat, així que pots usar tots dos a la vegada.

## Connectar un comandament {#connect-a-controller}

1. Endolla el comandament (o aparella'l).
2. Fes clic a la vista i prem qualsevol botó del comandament. Els navegadors només mostren un comandament després de la seva primera entrada.
3. Obre **Càmera i escena → Comandament**. La llista de dispositius el mostra amb `●`.
4. Empeny la palanca esquerra per volar i la dreta per mirar. Si la càmera es desplaça amb les palanques al centre, puja la **Zona morta**.

Qualsevol dispositiu que el navegador associï al disseny estàndard de comandament funciona. Un joystick de vol o una palanca de gas (HOTAS) s'ignoren per defecte; vegeu més avall.

## Assignació {#mapping}

| Control | Efecte |
|---|---|
| Palanca esquerra | Moure: endavant/enrere i desplaçament lateral |
| Palanca dreta | Mirar: guinyar i cabussar, a *Velocitat de mirada* graus per segon a la deflexió completa |
| `RT` / `LT` (analògic) | Amunt / avall; en la projecció paral·lela, ampliar / allunyar |
| `RB` (mantingut) | 6× més ràpid |
| `LB` (mantingut) | 15 % de velocitat |
| `A` (mantingut) | 3× sprint (es combina amb RB/LB) |
| `Y` (premut) | Enquadra les dades |

Els números dels botons segueixen el disseny estàndard: A 0, Y 3, LB 4, RB 5, LT 6, RT 7; les palanques són als eixos 0-1 (esquerra) i 2-3 (dreta).

## Els ajustos del comandament {#the-gamepad-settings}

A **Càmera i escena → Comandament**. **Configuració** / **Amaga** obre els controls d'ajust.

| Control | Per defecte | Rang (roda) | Significat |
|---|---|---|---|
| **Activada** | activat | | |
| Estat del dispositiu | | | Tots els dispositius connectats, `●` quan se'n segueix un, `○` quan no, amb *- no és un comandament XInput, s'ignora* o *- no és un comandament XInput, s'usa igualment* per als dispositius no estàndard. Sense cap: *No s'ha detectat cap comandament. Els navegadors només revelen un comandament després que enviï la seva primera entrada: prem-hi un botó.* |
| **Dispositiu** | *Només comandaments XInput (recomanat)* | | Es mostra quan hi ha connectat un dispositiu no estàndard. Tria un dispositiu pel nom per seguir-lo en lloc d'això. |
| **Velocitat de mirada** | 150°/s | 20-540 (5000) | Velocitat de gir amb la palanca dreta a la deflexió completa. |
| **Zona morta** | 12 % | 0-50 % (95 %) | Radial: un empenta en diagonal mai no es filtra a un sol eix. Puja-la si la càmera es desplaça amb les palanques al centre. |
| **Corba del joystick** | x² | lineal (1) a x⁴ (16) | Exponent de resposta després de la zona morta: control més fi prop del centre, velocitat plena a la vora. |
| **Inverteix la Y del joystick** | desactivat | | |
| **Intercanvia els joysticks** | desactivat | | Moure amb la palanca dreta, mirar amb l'esquerra. |

La forma de la palanca: amb deflexió *m* (la longitud del vector de la palanca) i zona morta *d*, la sortida és ((m - d) / (1 - d)) ^ corba al llarg de la direcció de la palanca, i 0 dins de la zona morta.

## Per què només comandaments estàndard per defecte {#why-only-standard-pads-by-default}

L'API de Gamepad informa de **cada** dispositiu HID amb eixos —joysticks de vol, palanques de gas, pedals, volants—, i aquests no reposen al centre: un eix de torsió o una palanca de gas es queda a la deflexió completa quan ningú els toca. Llegit com una palanca, és una entrada permanent a velocitat plena que cap zona morta no pot suprimir, i la càmera gira sola des del moment en què es carrega la pàgina (i tots els modes de calor també semblen trencats, perquè una càmera en moviment reinicia l'acumulació a cada fotograma).

Així que un dispositiu només se segueix quan el navegador informa de `mapping: "standard"`, la seva manera de dir «un comandament d'estil XInput amb els eixos on els esperes». Els altres dispositius es llisten i es marquen com a ignorats, i **Dispositiu** n'opta per un explícitament —per volar la càmera amb un HOTAS, per exemple—. Un cop se segueix un comandament, la càmera es queda amb ell, de manera que dos comandaments no es disputen la càmera segons l'ordre d'enumeració.

**HOTAS:** només es llegeixen els eixos 0-3 (dues palanques) i els botons estàndard. Una palanca de gas o els pedals en altres eixos no fan res, i una palanca o una palanca de gas els eixos de la qual no reposen al centre pot necessitar una **Zona morta** més gran.

Els navegadors amaguen un comandament fins que no ha enviat la seva primera entrada, així que un comandament endollat que no s'ha tocat encara no existeix per a la pàgina.
