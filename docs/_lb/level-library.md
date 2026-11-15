---
title: "Level-Bibliothéik"
parent: "Levelen an Hannergrondgeometrie"
nav_order: 4
lang: "lb"
source: "level-library.md"
source_hash: "23ff3290af7e"
translated: true
outdated: false
---


# Level-Bibliothéik

D'Bibliothéik hält Är Levelen an dësem Browser, sou datt Dir se net nei lueden an vereinfachen musst. **Wann Dir d'Daten vun der Säit am Browser läscht, gëtt d'Bibliothéik geläscht, an et gëtt keen Export.** Haalt Är Originaldateien.

En Level ze veraarbechten - analyséieren, klassifizéieren, zesummeschweißen, ausdënnen, Texturen packen - ass lues, an d'Resultat ass all Kéier dat selwecht. D'**Bibliothéik** ënnen am Panel Hannergrond / Level hält veraarbechte Levelen an dësem Browser, sou datt en ausgedënnte Mesh ni zweemol gebaut gëtt ([`levelLibrary.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/levelLibrary.ts)).

## E Level späicheren an nei lueden {#save-and-reload-a-level}

1. Lued e Kaartebild oder en 3D-Modell an kuckt no, ob et richteg ausgesäit.
2. Dréckt **An der Bibliothéik späicheren**. De Panel seet *Gespäichert. Et lued sech bei der nächster Kéier direkt.*
3. Bei der nächster Kéier maacht d'Lëscht **Bibliothéik** op an dréckt ▸ beim Level.
4. Dréckt ✕, fir en Eintrag ze läschen, deen Dir net méi braucht.

## Benotzen {#using-it}

| Steierung | Wierkung |
|---|---|
| **An der Bibliothéik späicheren** | Späichert de aktuelle Level. E Kaartebild gëtt als PNG mat sengen zwee Ankerpunkten gespäichert; e Modell als seng veraarbechte Puffer. De Panel seet *Gespäichert. Et lued sech bei der nächster Kéier direkt.* |
| Bibliothéiks-Lëscht | Eng Zeil pro gespäichert Level: Numm (mat der gespäicherter Gréisst beim Drop iwwer d'Maus), Dräieecke bei engem Modell oder Breet a Pixel bei engem Bild. |
| ▸ (*Lueden*) | Lued den Eintrag als aktuelle Level. |
| ✕ (*Läschen*) | Entfernt den Eintrag. |
| Benotzungszeil | `Benotzt X vu Y.` - d'Schätzung vum Browser fir de Späicher vun dëser Säit. |

Wann näischt gespäichert ass, seet d'Lëscht *Eidel. Lued eng Kaart oder e Modell, dann "An der Bibliothéik späicheren".*

## Wat gespäichert gëtt {#what-is-stored}

| Aart | Gespäichert | Net gespäichert |
|---|---|---|
| Kaartebild | D'Bild (PNG), seng Gréisst, seng Ankerpunkten | Héicht, Spigelung, Stäerkt, Hellegkeet, Entsaturéieren - gi op d'Standarden zréckgesat (Héicht = den niddregsten Y-Wäert vum aktuelle Datesaz, Spigelung un) |
| 3D-Level | Vertices, Vertexfaarwen, Texturkoordinaten, hir Kacheln an den Texturatlas, Boden-, Struktur- a Waasserdreieecke, Strukturkanten, Dräieckszuelen | Deelnimm an d'Grënn vun der Klassifikatioun, a jiddereng Ausgesinnsastellung - gi op d'Standarden vun engem frëschen Import zréckgesat |

E Modell, dat aus der Bibliothéik gelueden gëtt, huet keng Deel-Lëscht; seng Grenzen an de Bodenhéichtbereich ginn aus sengen Vertices nei berechent.

## Wou se ass {#where-it-lives}

Am IndexedDB vum Browser, Datebank `3dheat`, Objektspäicher `levels`, fir d'Hierkonft vun der Säit (d'Adress an der Adressleescht vum Browser). Si ass lokal fir dat Browserprofil: en anere Browser, en anert Profil oder eng anner Adress (zum Beispill `localhost` amplaz vun `127.0.0.1`) gesäit eng aner, eidel Bibliothéik. Wann Dir d'Daten vun der Säit am Browser läscht, gëtt se geläscht. Eintrag, déi vun ale Versiounen ouni Strukturen, Faarwen oder Waasser gespäichert goufen, lueden trotzdeem.
