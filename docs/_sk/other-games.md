---
title: "Ďalšie závodné hry"
parent: "Analýza pretekov"
nav_order: 59
lang: "sk"
source: "other-games.md"
source_hash: "79f0f087f176"
translated: true
outdated: false
---


# Ďalšie pretekárske hry v prehliadači

Prehliadač číta kolá z mnohých pretekárskych hier, nie len z jednej. Táto stránka ich vypisuje a hovorí, ako dostať kolo z každej z nich.

## Hry {#the-games}

| Hra | Nahrávač | Šmyk v súbore? | Svet zrkadlený? | Poznámky |
|---|---|---|---|---|
| Forza Horizon 4/5/6, Forza Motorsport | `heat3d_capture telemetry` (Data Out cez UDP), alebo súbory kôl z FH Companion a ich `.tele.gz` | áno, pre každé koleso (normalizovaný) | áno (svet je ľavotočivý) | `.tele.gz` vedľa každého kola z FH Companion dá šmyk každého kolesa; samotný súbor kola nie |
| Assetto Corsa, ACC, AC EVO, AC Rally | `heat3d_capture telemetry --game ac / acc / acevo / acrally` (zdieľaná pamäť) | áno, pre každé koleso | meria sa z kôl | aj činnosť ABS a trakčnej kontroly, zaťaženie kolies, teploty |
| EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4 | `heat3d_capture telemetry --game wrc / dirtrally2 / dirtrally / dirt4` (UDP) | nie, počíta sa z rýchlostí kolies | meria sa z kôl | rally: sypký povrch a skoky sa posudzujú inak |
| Richard Burns Rally | `heat3d_capture telemetry --game rbr` (NGP UDP) | nie | meria sa z kôl | bez rýchlostí kolies |
| BeamNG.drive | `heat3d_capture telemetry --game beamng` (mód) | nie, počíta sa z rýchlostí kolies | meria sa z kôl | |
| Trackmania | plugin Openplanet, `telemetry --game trackmania --install` | koeficient šmyku pre každé koleso | meria sa z kôl | arkádová fyzika: šmyky sa posudzujú inak |
| iRacing | žiadny: vlastný súbor `.ibt` | nie (nezaznamenáva sa); počíta sa z odchýlky smeru | nie (podľa GPS) | zapnite zaznamenávanie v aute klávesmi Alt+L |

## Ako nahrať kolo {#how-to-record-a-lap}

1. Vyberte svoju hru v tabuľke a nastavte ju, ako to hovorí stránka nahrávača pre túto hru (nastavenie v hre, mód alebo nič pri iRacing). Kroky sa u každej hry líšia, preto sú v dokumentoch nahrávačov: [GameCapture: hry](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md).
2. Spustite nahrávač a jazdite. Zapisuje jeden súbor na každé kolo.
3. Na karte **Analýza pretekov** stlačte **Načítať súbory kôl…** a vyberte dve alebo viac kôl tej istej trate (pozri [Načítanie kôl](race-loading-laps.md)).

Pri rally hrách dáva nahrávač jeden súbor na každý prejazd etapou. Pri Forze je najľahší začiatok knižnica FH Companion so súbormi `.tele.gz` vedľa súborov kôl.

## Čo dokumentujú nahrávače {#what-the-recorders-document}

Ako sa každá hra nahráva, čo posiela, zdroje jej rozloženia a ktoré trate sa dajú exportovať zo súborov hry, dokumentujú nahrávače: [GameCapture: hry](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md) (verejné, v [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture)). Súbor kola, ktorý zapisuje každý nahrávač, je opísaný v [GameCapture: formát kola](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).

## Čo s nimi prehliadač robí {#what-the-viewer-does-with-them}

Každá hra skončí ako súbory `heat3d-lap` (alebo ako CSV kolo, alebo sa číta priamo, ako `.ibt` od iRacing), s kanonickými názvami kanálov zo `src/race/schema.ts` a blokom `meta`, ktorý hovorí, čo ich čísla znamenajú: ako je škálovaný ich šmyk, či ide o okruh, rally alebo arkádu, a povrch, ak je známy. Karta **Analýza pretekov** s nimi všetkými zaobchádza rovnako. Keď nie je načítaný model trate, karta **Analýza pretekov** nakreslí cestu z rozptylu samotných kôl, takže každá hra sa dá použiť aj bez modelu.

Čo žiadna rally hra neposiela - šmyk pneumatík - prehliadač dopočíta: z kontaktnej plochy alebo rýchlosti povrchu každého kolesa oproti rýchlosti auta, kde ju hra posiela (`(koleso - auto) / auto`), a z jeho otáčania a valivého polomeru zmeraného na samotnom kole, kde posiela len otáčanie. Uhol driftu sa berie z vlastnej rýchlosti auta (Forza, hry AC, Trackmania, RBR), z rýchlosti vo svete premietnutej na osi auta (EA WRC, DiRT, BeamNG), alebo zo smeru auta oproti dráhe. To, či je auto vo vzduchu, sa zistí z kontaktu jeho kolies, zaťaženia alebo odpruženia. Pozri `src/race/derive.ts`.

Ak je svet hry ľavotočivý - ako pri Forze - prehliadač trať zrkadlí; riadenie a odpruženie kôl to prezradia a karta **Analýza pretekov** ponúkne obrátiť os. Hry, pri ktorých nie je orientácia zdokumentovaná (RBR, BeamNG, Trackmania), sa riešia rovnako: meria sa, nepredpokladá.

Okrem jazdných kanálov nahrávače uchovajú to, čo každá hra pridáva: pri hrách AC činnosť ABS a trakčnej kontroly, rozdelenie brzdenia, DRS, obmedzovač pitov, turbo a životnosť brzdových platničiek a kotúčov; pri iRacing nastavenia pomocníkov, rozdelenie brzdenia, palivo, teploty oleja a vody a každý ďalší kanál, ktorý zaznamenáva pod vlastným názvom. Prehliadač ich kreslí podľa svojej tabuľky kanálov - svetlá, úrovne, značky, grafy - takže nahrávanie viacerých kanálov nevyžaduje zmenu prehliadača.
